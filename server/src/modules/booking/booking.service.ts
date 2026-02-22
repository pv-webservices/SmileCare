// ─── Booking Service — Business Logic ────────────────────────────────────────

import { Prisma } from '@prisma/client';
import { prisma } from '../../index';
import { SlotError } from './slot.service';
import {
    CreateBookingBody,
    MAX_RESCHEDULES,
    MIN_HOURS_BEFORE_RESCHEDULE,
    REFUND_ELIGIBLE_HOURS,
    calculateRefundEligibility,
} from './booking.types';

// ─── Create Booking ──────────────────────────────────────────────────────────

export async function createBooking(
    input: CreateBookingBody,
    patientId: string
) {
    const { slotId, treatmentId, sessionId, idempotencyKey, notes } = input;

    return prisma.$transaction(
        async (tx) => {
            // ── Idempotency check ──────────────────────────────────────────────
            if (idempotencyKey) {
                const existing = await tx.booking.findUnique({
                    where: { idempotencyKey },
                    include: { slot: true, treatment: true },
                });
                if (existing) {
                    console.log(
                        `[BOOKING_IDEMPOTENT_HIT] idempotencyKey=${idempotencyKey} bookingId=${existing.id}`
                    );
                    return { booking: existing, isIdempotent: true };
                }
            }

            // ── Lock & verify slot ─────────────────────────────────────────────
            const rows = await tx.$queryRaw<
                Array<{
                    id: string;
                    dentistId: string;
                    isAvailable: boolean;
                    holdExpiresAt: Date | null;
                    heldBySessionId: string | null;
                }>
            >`SELECT "id", "dentistId", "isAvailable", "holdExpiresAt", "heldBySessionId"
        FROM "Slot"
        WHERE "id" = ${slotId}
        FOR UPDATE`;

            if (rows.length === 0) {
                throw new BookingError('SLOT_NOT_FOUND', 'Slot not found');
            }

            const slot = rows[0];
            const now = new Date();

            // Step 1: If slot is unavailable AND not held by this session → reject
            if (!slot.isAvailable && slot.heldBySessionId !== sessionId) {
                throw new BookingError(
                    'SLOT_UNAVAILABLE',
                    'Slot is no longer available'
                );
            }

            // Step 2: Verify hold belongs to this session
            if (slot.heldBySessionId !== sessionId) {
                throw new BookingError(
                    'HOLD_MISMATCH',
                    'Slot is not held by your session.'
                );
            }

            // Step 3: Verify hold hasn't expired
            if (slot.holdExpiresAt && slot.holdExpiresAt < now) {
                throw new BookingError(
                    'HOLD_EXPIRED',
                    'Your hold has expired.'
                );
            }

            // ── Stub payment verification ──────────────────────────────────────
            // TODO: Integrate with Razorpay payment verification here
            const paymentVerified = true;
            if (!paymentVerified) {
                throw new BookingError(
                    'PAYMENT_FAILED',
                    'Payment verification failed'
                );
            }

            // ── Create the booking ─────────────────────────────────────────────
            const booking = await tx.booking.create({
                data: {
                    patientId,
                    dentistId: slot.dentistId,
                    treatmentId,
                    slotId,
                    status: 'confirmed',
                    idempotencyKey: idempotencyKey || undefined,
                    notes: notes || undefined,
                },
                include: { slot: true, treatment: true },
            });

            // ── Clear hold fields & mark slot as taken ─────────────────────────
            await tx.slot.update({
                where: { id: slotId },
                data: {
                    isAvailable: false,
                    holdExpiresAt: null,
                    heldBySessionId: null,
                    version: { increment: 1 },
                },
            });

            console.log(
                `[BOOKING_CREATED] bookingId=${booking.id} slotId=${slotId} patientId=${patientId} status=confirmed`
            );

            return { booking, isIdempotent: false };
        },
        {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        }
    );
}

// ─── Reschedule Booking ──────────────────────────────────────────────────────

export async function rescheduleBooking(
    bookingId: string,
    newSlotId: string,
    userId: string
) {
    return prisma.$transaction(
        async (tx) => {
            // ── Lock the booking row ───────────────────────────────────────────
            const bookingRows = await tx.$queryRaw<
                Array<{
                    id: string;
                    patientId: string;
                    slotId: string;
                    dentistId: string;
                    status: string;
                    rescheduleCount: number;
                }>
            >`SELECT "id", "patientId", "slotId", "dentistId", "status", "rescheduleCount"
        FROM "Booking"
        WHERE "id" = ${bookingId}
        FOR UPDATE`;

            if (bookingRows.length === 0) {
                throw new BookingError('BOOKING_NOT_FOUND', 'Booking not found');
            }

            const booking = bookingRows[0];

            // ── Authorization: verify the patient owns this booking ────────────
            // Check if user is the patient (need to look up patient by userId)
            const patient = await tx.patient.findUnique({
                where: { userId },
            });

            if (!patient || patient.id !== booking.patientId) {
                throw new BookingError(
                    'UNAUTHORIZED',
                    'You are not authorized to reschedule this booking'
                );
            }

            // ── Validate business rules ────────────────────────────────────────
            if (booking.status !== 'confirmed') {
                throw new BookingError(
                    'INVALID_STATUS',
                    `Cannot reschedule booking with status: ${booking.status}`
                );
            }

            if (booking.rescheduleCount >= MAX_RESCHEDULES) {
                throw new BookingError(
                    'RESCHEDULE_LIMIT',
                    `Maximum ${MAX_RESCHEDULES} reschedules allowed`
                );
            }

            // Check time constraint: ≥2h before appointment
            const oldSlotRows = await tx.$queryRaw<
                Array<{ id: string; date: Date; startTime: string }>
            >`SELECT "id", "date", "startTime"
        FROM "Slot"
        WHERE "id" = ${booking.slotId}
        FOR UPDATE`;

            if (oldSlotRows.length === 0) {
                throw new BookingError(
                    'SLOT_NOT_FOUND',
                    'Original slot not found'
                );
            }

            const oldSlot = oldSlotRows[0];
            const appointmentDate = new Date(oldSlot.date);
            const [hours, minutes] = oldSlot.startTime.split(':').map(Number);
            appointmentDate.setHours(hours, minutes, 0, 0);

            const now = new Date();
            const hoursUntilAppointment =
                (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

            if (hoursUntilAppointment < MIN_HOURS_BEFORE_RESCHEDULE) {
                throw new BookingError(
                    'TOO_LATE',
                    `Cannot reschedule less than ${MIN_HOURS_BEFORE_RESCHEDULE} hours before appointment`
                );
            }

            // ── Lock both slots in ascending UUID order to prevent deadlocks ──
            const [firstId, secondId] =
                booking.slotId < newSlotId
                    ? [booking.slotId, newSlotId]
                    : [newSlotId, booking.slotId];

            // Lock first slot (may already be locked if it's the old slot)
            if (firstId !== booking.slotId) {
                await tx.$queryRaw`SELECT "id" FROM "Slot" WHERE "id" = ${firstId} FOR UPDATE`;
            }
            // Lock second slot
            await tx.$queryRaw`SELECT "id" FROM "Slot" WHERE "id" = ${secondId} FOR UPDATE`;

            // ── Verify new slot is available ───────────────────────────────────
            const newSlot = await tx.slot.findUnique({
                where: { id: newSlotId },
            });

            if (!newSlot) {
                throw new BookingError('NEW_SLOT_NOT_FOUND', 'New slot not found');
            }

            if (!newSlot.isAvailable) {
                throw new BookingError(
                    'NEW_SLOT_UNAVAILABLE',
                    'The new slot is not available'
                );
            }

            // ── Atomic swap ────────────────────────────────────────────────────
            // Release old slot
            await tx.slot.update({
                where: { id: booking.slotId },
                data: {
                    isAvailable: true,
                    holdExpiresAt: null,
                    heldBySessionId: null,
                    version: { increment: 1 },
                },
            });

            // Claim new slot
            await tx.slot.update({
                where: { id: newSlotId },
                data: {
                    isAvailable: false,
                    holdExpiresAt: null,
                    heldBySessionId: null,
                    version: { increment: 1 },
                },
            });

            // Update booking
            const updatedBooking = await tx.booking.update({
                where: { id: bookingId },
                data: {
                    slotId: newSlotId,
                    dentistId: newSlot.dentistId,
                    rescheduleCount: { increment: 1 },
                },
                include: { slot: true, treatment: true },
            });

            console.log(
                `[BOOKING_RESCHEDULED] bookingId=${bookingId} oldSlotId=${booking.slotId} newSlotId=${newSlotId} rescheduleCount=${updatedBooking.rescheduleCount}`
            );

            return updatedBooking;
        },
        {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        }
    );
}

// ─── Cancel Booking ──────────────────────────────────────────────────────────

export async function cancelBooking(
    bookingId: string,
    userId: string,
    reason?: string,
    adminOverride: boolean = false
) {
    return prisma.$transaction(
        async (tx) => {
            // ── Lock the booking row ───────────────────────────────────────────
            const bookingRows = await tx.$queryRaw<
                Array<{
                    id: string;
                    patientId: string;
                    slotId: string;
                    status: string;
                    dentistId: string;
                }>
            >`SELECT "id", "patientId", "slotId", "status", "dentistId"
        FROM "Booking"
        WHERE "id" = ${bookingId}
        FOR UPDATE`;

            if (bookingRows.length === 0) {
                throw new BookingError('BOOKING_NOT_FOUND', 'Booking not found');
            }

            const booking = bookingRows[0];

            // ── Authorization ──────────────────────────────────────────────────
            const patient = await tx.patient.findUnique({
                where: { userId },
            });

            if (!patient || patient.id !== booking.patientId) {
                throw new BookingError(
                    'UNAUTHORIZED',
                    'You are not authorized to cancel this booking'
                );
            }

            // ── Validate status ────────────────────────────────────────────────
            if (booking.status !== 'confirmed' && booking.status !== 'pending_payment') {
                throw new BookingError(
                    'INVALID_STATUS',
                    `Cannot cancel booking with status: ${booking.status}`
                );
            }

            // ── Compute refund eligibility (strict binary: ≥24h or adminOverride) ──
            const slot = await tx.slot.findUnique({
                where: { id: booking.slotId },
            });

            let refundEligible = false;

            if (slot) {
                const refundResult = calculateRefundEligibility(
                    { status: booking.status as any, createdAt: new Date() },
                    slot.date,
                    slot.startTime,
                    adminOverride
                );
                refundEligible = refundResult.eligible;
            }

            // ── Cancel the booking ─────────────────────────────────────────────
            const updatedBooking = await tx.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'cancelled',
                    cancellationReason: reason || undefined,
                },
                include: { slot: true, treatment: true },
            });

            // ── Release the slot ───────────────────────────────────────────────
            if (slot) {
                await tx.slot.update({
                    where: { id: booking.slotId },
                    data: {
                        isAvailable: true,
                        holdExpiresAt: null,
                        heldBySessionId: null,
                        version: { increment: 1 },
                    },
                });
            }

            console.log(
                `[BOOKING_CANCELLED] bookingId=${bookingId} slotId=${booking.slotId} reason=${reason || 'none'} refundEligible=${refundEligible}`
            );

            // NOTE: refundEligible is returned but we do NOT call Razorpay yet
            return { booking: updatedBooking, refundEligible };
        },
        {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        }
    );
}

// ─── Custom Error ────────────────────────────────────────────────────────────

export class BookingError extends Error {
    code: string;
    constructor(code: string, message: string) {
        super(message);
        this.code = code;
        this.name = 'BookingError';
    }
}
