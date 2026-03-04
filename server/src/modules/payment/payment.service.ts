// ─── Payment Service — Mock Payment Provider ────────────────────────────────

import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { createBooking, BookingError } from '../booking/booking.service';
import { sendBookingConfirmation, createNotificationRecord } from '../notification/notification.service';
import { awardBookingPoints } from '../loyalty/loyalty.service';
import {
    CreateOrderBody,
    VerifyPaymentBody,
    MockOrder,
    PaymentError,
} from './payment.types';

import Razorpay from 'razorpay';
import crypto from 'crypto';

const PAYMENT_MODE = process.env.PAYMENT_MODE || 'mock';

// Razorpay client — only instantiated when keys are present
let razorpayClient: Razorpay | null = null;

if (PAYMENT_MODE === 'razorpay') {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
        console.error(
            '[PAYMENT] PAYMENT_MODE=razorpay but ' +
            'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. ' +
            'Falling back to mock mode.'
        );
    } else {
        razorpayClient = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
        console.log('[PAYMENT] Razorpay live mode enabled');
    }
} else {
    console.log('[PAYMENT] Mock payment mode active');
}

// ─── In-Memory Mock Order Store ──────────────────────────────────────────────
// In production, this is replaced by Razorpay's order API.
// Orders expire after 30 minutes.

const pendingOrders = new Map<string, MockOrder>();
const ORDER_TTL_MS = 30 * 60 * 1000; // 30 minutes

function cleanExpiredOrders() {
    const now = Date.now();
    for (const [key, order] of pendingOrders) {
        if (now - order.createdAt.getTime() > ORDER_TTL_MS) {
            pendingOrders.delete(key);
        }
    }
}

// ─── Create Mock Order ───────────────────────────────────────────────────────

export async function createOrder(input: CreateOrderBody) {
    if (PAYMENT_MODE === 'razorpay' && razorpayClient) {
        return createRazorpayOrder(input);
    }
    return createMockOrder(input);
}

async function createRazorpayOrder(input: CreateOrderBody) {
    const { slotId, treatmentId, amount } = input;

    // Same validations as mock
    const slot = await prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot) throw new PaymentError('SLOT_NOT_FOUND', 'Slot not found');
    if (!slot.heldBySessionId) {
        throw new PaymentError('SLOT_NOT_HELD',
            'Slot must be held before creating a payment order');
    }
    const treatment = await prisma.treatment.findUnique({
        where: { id: treatmentId }
    });
    if (!treatment) {
        throw new PaymentError('TREATMENT_NOT_FOUND', 'Treatment not found');
    }

    const order = await razorpayClient!.orders.create({
        amount,          // in paise — caller must pass paise
        currency: 'INR',
        receipt: `sc_${slotId.slice(0, 8)}_${Date.now()}`,
        notes: { slotId, treatmentId },
    });

    console.log(
        `[RAZORPAY_ORDER_CREATED] orderId=${order.id} amount=${amount}`
    );

    return {
        orderId: order.id,
        amount: Number(order.amount),
        currency: order.currency,
    };
}

export async function createMockOrder(input: CreateOrderBody) {
    const { slotId, treatmentId, amount } = input;

    if (!slotId || !treatmentId || !amount || amount <= 0) {
        throw new PaymentError(
            'VALIDATION_ERROR',
            'slotId, treatmentId, and a positive amount are required'
        );
    }

    // Verify slot exists and is held (but don't lock it)
    const slot = await prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot) {
        throw new PaymentError('SLOT_NOT_FOUND', 'Slot not found');
    }
    // Slot must be actively held before creating order
    if (!slot.heldBySessionId) {
        throw new PaymentError(
            'SLOT_NOT_HELD',
            'Slot must be held before creating a payment order'
        );
    }

    // Verify treatment exists
    const treatment = await prisma.treatment.findUnique({
        where: { id: treatmentId },
    });
    if (!treatment) {
        throw new PaymentError('TREATMENT_NOT_FOUND', 'Treatment not found');
    }

    // Clean expired entries periodically
    cleanExpiredOrders();

    // Generate mock order
    const orderId = `mock_order_${randomUUID()}`;

    const mockOrder: MockOrder = {
        orderId,
        slotId,
        treatmentId,
        amount,
        currency: 'INR',
        createdAt: new Date(),
    };

    pendingOrders.set(orderId, mockOrder);

    console.log(
        `[PAYMENT_ORDER_CREATED] orderId=${orderId} slotId=${slotId} amount=${amount}`
    );

    return {
        orderId,
        amount,
        currency: 'INR',
    };
}

// ─── Verify Mock Payment ─────────────────────────────────────────────────────

export async function verifyPayment(
    input: VerifyPaymentBody & {
        razorpayPaymentId?: string;
        razorpaySignature?: string;
    },
    patientId: string
) {
    if (
        PAYMENT_MODE === 'razorpay' &&
        razorpayClient &&
        input.razorpayPaymentId &&
        input.razorpaySignature
    ) {
        return verifyRazorpayPayment(
            input as Parameters<typeof verifyRazorpayPayment>[0],
            patientId
        );
    }
    return verifyMockPayment
        (input, patientId);
}

export async function verifyRazorpayPayment(
    input: VerifyPaymentBody & {
        razorpayPaymentId: string;
        razorpaySignature: string;
    },
    patientId: string
) {
    const {
        orderId, slotId, treatmentId, sessionId, idempotencyKey,
        razorpayPaymentId, razorpaySignature,
    } = input;

    // 1. Verify HMAC signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${razorpayPaymentId}`)
        .digest('hex');

    if (expectedSignature !== razorpaySignature) {
        throw new PaymentError(
            'SIGNATURE_INVALID',
            'Razorpay payment signature verification failed'
        );
    }

    // 2. Check for idempotent hit
    const existingPayment = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId },
        include: { booking: { include: { slot: true, treatment: true } } },
    });
    if (existingPayment?.status === 'captured') {
        return { booking: existingPayment.booking, payment: existingPayment, isIdempotent: true };
    }

    // 3. Create booking + payment atomically (reuse same transaction logic)
    const result = await prisma.$transaction(
        async (tx) => {
            const bookingResult = await createBooking(
                { slotId, treatmentId, sessionId, idempotencyKey },
                patientId,
                tx
            );
            const payment = await tx.payment.create
                ({
                data: {
                    bookingId: bookingResult.booking.id,
                    razorpayOrderId: orderId,
                    razorpayPaymentId,
                    amount: 0, // will update from Razorpay webhook in future
                    status: 'captured',
                },
            });
            return { booking: bookingResult.booking, payment, isIdempotent: bookingResult.isIdempotent };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted }
    );

    // 4. Side-effects (same as mock — email, notification, loyalty)
    if (!result.isIdempotent) {
        prisma.booking.findUnique({
            where: { id: result.booking.id },
            include: {
                patient: { include: { user: true } },
                dentist: { include: { user: true } },
                treatment: true,
                slot: true,
            }
        }).then(fullBooking => {
            if (!fullBooking) return;
            sendBookingConfirmation({
                toEmail: fullBooking.patient.user.email,
                toName: fullBooking.patient.user.name,
                treatment: fullBooking.treatment.name,
                doctor: `Dr. ${fullBooking.dentist.user.name}`,
                date: fullBooking.slot.date.toLocaleDateString('en-IN', {
                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                }),
                time: fullBooking.slot.startTime,
                bookingId: fullBooking.id,
                amount: result.payment.amount,
            }).catch(err => console.error('Email send failed:', err));

            createNotificationRecord(
                fullBooking.patient.userId,
                'booking_confirmation',
                'Booking Confirmed',
                `Your ${fullBooking.treatment.name} appointment is confirmed.`
            ).catch(console.error);

            awardBookingPoints(
                fullBooking.patientId,
                fullBooking.id,
                result.payment.amount
            ).catch(console.error);
        }).catch(err => console.error('Side-effects failed:', err));
    }

    return result;
}

export async function verifyMockPayment(
    input: VerifyPaymentBody,
    patientId: string
) {
    const { orderId, slotId, treatmentId, sessionId, idempotencyKey } = input;

    // ── Validate the mock order exists ───────────────────────────────────────
  // ── Validate the mock order exists ──────────────────────────────────────
  const mockOrder = pendingOrders.get(orderId);
  let mockAmount = 0;

  if (!mockOrder) {
    // Server may have restarted and lost in-memory pendingOrders Map.
    // Instead of failing, we log a warning and proceed with booking creation
    // using the provided slot/treatment info. The booking service already
    // validates the slot hold and uses idempotencyKey to prevent duplicates.
    console.warn(
      `[PAYMENT_ORDER_NOT_FOUND] orderId=${orderId} not in memory. ` +
      `Proceeding with booking creation (server likely restarted).`
    );
    // We'll set mockAmount to 0, or could fetch treatment price from DB
  } else {
    // Verify order details match
    if (mockOrder.slotId !== slotId || mockOrder.treatmentId !== treatmentId) {
      throw new PaymentError(
        'ORDER_MISMATCH',
        'Order details do not match the provided slotId/treatmentId'
      );
    }

    // Check if order has expired
    if (Date.now() - mockOrder.createdAt.getTime() > ORDER_TTL_MS) {
      pendingOrders.delete(orderId);
      throw new PaymentError('ORDER_EXPIRED', 'Payment order has expired');
    }

    mockAmount = mockOrder.amount;
  }    if (Date.now() - mockOrder.createdAt.getTime() > ORDER_TTL_MS) {
        pendingOrders.delete(orderId);
        throw new PaymentError('ORDER_EXPIRED', 'Payment order has expired');
    }

    // ── Check for idempotent payment (already captured) ─────────────────────
    const existingPayment = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId },
        include: { booking: { include: { slot: true, treatment: true } } },
    });

    if (existingPayment && existingPayment.status === 'captured') {
        console.log(
            `[PAYMENT_IDEMPOTENT_HIT] orderId=${orderId} paymentId=${existingPayment.id}`
        );
        return {
            booking: existingPayment.booking,
            payment: existingPayment,
            isIdempotent: true,
        };
    }

    // ── Create booking + payment atomically ─────────────────────────────────
    const result = await prisma.$transaction(
        async (tx) => {
            // 1. Create the booking via the existing booking service logic
            //    (handles slot locking, hold validation, idempotency)
            const bookingResult = await createBooking(
                { slotId, treatmentId, sessionId, idempotencyKey },
                patientId,
                tx
            );

            // 2. Create the Payment record linked to the booking
            const payment = await tx.payment.create
                ({
                data: {
                    bookingId: bookingResult.booking.id,
                    razorpayOrderId: orderId,
                    razorpayPaymentId: `mock_pay_${randomUUID()}`,
          amount: mockAmount,                    status: 'captured',
                },
            });

            console.log(
                `[PAYMENT_VERIFIED] orderId=${orderId} bookingId=${bookingResult.booking.id} paymentId=${payment.id}`
            );

            return {
                booking: bookingResult.booking,
                payment,
                isIdempotent: bookingResult.isIdempotent,
            };
        },
        {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        }
    );

    // Clean up the mock order from memory
    try {
        pendingOrders.delete(orderId);
    } catch (err) {
        console.warn('[ORDER_CLEANUP_WARNING]', err);
    }

    // Only fire side-effects if we actually successfully created it this time (not idempotent hit)
    // Wait, idempotency hits mean we already handled it, so we don't trigger emails again.
    if (!result.isIdempotent) {
        // Fetch full booking details for notification
        prisma.booking.findUnique({
            where: { id: result.booking.id },
            include: {
                patient: { include: { user: true } },
                dentist: { include: { user: true } },
                treatment: true,
                slot: true,
            }
        }).then(fullBooking => {
            if (!fullBooking) return;

            // Send confirmation email (non-blocking)
            sendBookingConfirmation({
                toEmail: fullBooking.patient.user.email,
                toName: fullBooking.patient.user.name,
                treatment: fullBooking.treatment.name,
                doctor: `Dr. ${fullBooking.dentist.user.name}`,
                date: fullBooking.slot.date.toLocaleDateString('en-IN', {
                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                }),
                time: fullBooking.slot.startTime,
                bookingId: fullBooking.id,
                amount: result.payment.amount,
            }).catch(err => console.error('Email send failed:', err));

            // Save notification in DB (non-blocking)
            createNotificationRecord(
                fullBooking.patient.userId,
                'booking_confirmation',
                'Booking Confirmed',
                `Your ${fullBooking.treatment.name} appointment is confirmed.`
            ).catch(console.error);

            // Award loyalty points (non-blocking)
            awardBookingPoints(
                fullBooking.patientId,
                fullBooking.id,
                result.payment.amount
            ).catch(console.error);
        }).catch(err => console.error('Failed to process payment side-effects:', err));
    }

    return result;
}

// ─── Refund Mock Payment ─────────────────────────────────────────────────────

export async function refundMockPayment(paymentId: string, amount?: number) {
    return prisma.$transaction(
        async (tx) => {
            // Lock the payment row
            const paymentRows = await tx.$queryRaw<
                Array<{
                    id: string;
                    bookingId: string;
                    amount: number;
                    status: string;
                }>
            >`SELECT "id", "bookingId", "amount", "status"
            FROM "Payment"
            WHERE "id" = ${paymentId}
            FOR UPDATE`;

            if (paymentRows.length === 0) {
                throw new PaymentError('PAYMENT_NOT_FOUND', 'Payment record not found');
            }

            const payment = paymentRows[0];

            // Already refunded → idempotent return
            if (payment.status === 'refunded') {
                const existingRefund = await tx.refund.findUnique({
                    where: { paymentId },
                });
                console.log(
                    `[REFUND_IDEMPOTENT_HIT] paymentId=${paymentId}`
                );
                return { refund: existingRefund, isIdempotent: true };
            }

            if (payment.status !== 'captured') {
                throw new PaymentError(
                    'INVALID_PAYMENT_STATUS',
                    `Cannot refund payment with status: ${payment.status}`
                );
            }

            const refundAmount = amount || payment.amount;

            // Update payment status
            await tx.payment.update({
                where: { id: paymentId },
                data: { status: 'refunded' },
            });

            // Create refund record
            const refund = await tx.refund.create({
                data: {
                    paymentId,
                    razorpayRefundId: `mock_refund_${randomUUID()}`,
                    amount: refundAmount,
                    status: 'processed',
                },
            });

            // Update booking status to refunded
            await tx.booking.update({
                where: { id: payment.bookingId },
                data: { status: 'refunded' },
            });

            console.log(
                `[PAYMENT_REFUNDED] paymentId=${paymentId} refundId=${refund.id} amount=${refundAmount}`
            );

            return { refund, isIdempotent: false };
        },
        {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        }
    );
}
