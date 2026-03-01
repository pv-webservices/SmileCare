// ─── Slot Service — Business Logic ───────────────────────────────────────────

import { Prisma, Slot } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import {
    SlotWithPeriod,
    getPeriodHint,
    HOLD_TTL_MINUTES,
} from './booking.types';

// ─── Get Available Slots ─────────────────────────────────────────────────────

export async function getAvailableSlots(
    dentistId?: string,
    date?: string
): Promise<SlotWithPeriod[]> {
    const now = new Date();

    // First, release any expired holds so they become available
    await releaseExpiredHolds();

    // Build where clause
    const where: Prisma.SlotWhereInput = {
        isAvailable: true,
        isEmergency: false, // hide emergency slots from public listing
    };

    if (dentistId) {
        where.dentistId = dentistId;
    }

    if (date) {
        // Use UTC range instead of exact match to avoid timezone offset
        // issues on non-UTC machines (e.g. IST UTC+5:30).
        // new Date("2026-03-05") = 2026-03-05T00:00:00.000Z (UTC midnight)
        // but slot dates seeded with Date.UTC() are also stored at UTC midnight,
        // so a gte/lte range of the full UTC day guarantees a match.
        const start = new Date(`${date}T00:00:00.000Z`);
        const end = new Date(`${date}T23:59:59.999Z`);
        where.date = { gte: start, lte: end };
    }

    // Exclude slots with active (non-expired) holds
    where.OR = [
        { holdExpiresAt: null },
        { holdExpiresAt: { lt: now } },
    ];

    const slots = await prisma.slot.findMany({
        where,
        orderBy: { startTime: 'asc' },
    });

    // Enrich with period hint
    return slots.map((slot) => ({
        id: slot.id,
        dentistId: slot.dentistId,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable,
        period: getPeriodHint(slot.startTime),
    }));
}

// ─── Hold Slot ───────────────────────────────────────────────────────────────

export async function holdSlot(slotId: string, sessionId: string): Promise<Slot> {
    const now = new Date();
    const holdExpiry = new Date(now.getTime() + HOLD_TTL_MINUTES * 60 * 1000);

    return prisma.$transaction(
        async (tx) => {
            // SELECT ... FOR UPDATE to get exclusive lock on the slot row
            const rows = await tx.$queryRaw<
                Array<{
                    id: string;
                    isAvailable: boolean;
                    holdExpiresAt: Date | null;
                    heldBySessionId: string | null;
                    version: number;
                    isEmergency: boolean;
                }>
            >`SELECT "id", "isAvailable", "holdExpiresAt", "heldBySessionId", "version", "isEmergency"
        FROM "Slot"
        WHERE "id" = ${slotId}
        FOR UPDATE`;

            if (rows.length === 0) {
                throw new SlotError('SLOT_NOT_FOUND', 'Slot not found');
            }

            const slot = rows[0];

            if (
                !slot.isAvailable &&
                slot.heldBySessionId !== sessionId
            ) {
                throw new SlotError('SLOT_UNAVAILABLE', 'Slot is no longer available');
            }

            if (slot.isEmergency) {
                throw new SlotError('SLOT_EMERGENCY', 'Emergency slots cannot be held');
            }

            // Idempotent extension: if same sessionId already holds this slot, just extend TTL
            if (
                slot.heldBySessionId === sessionId &&
                slot.holdExpiresAt &&
                slot.holdExpiresAt > now
            ) {
                const updated = await tx.slot.update({
                    where: { id: slotId },
                    data: {
                        holdExpiresAt: holdExpiry,
                        version: { increment: 1 },
                    },
                });

                console.log(
                    `[SLOT_HOLD_EXTENDED] slotId=${slotId} sessionId=${sessionId} expiresAt=${holdExpiry.toISOString()}`
                );

                return updated;
            }

            // If held by another session and hold is still active → reject
            if (
                slot.heldBySessionId &&
                slot.heldBySessionId !== sessionId &&
                slot.holdExpiresAt &&
                slot.holdExpiresAt > now
            ) {
                throw new SlotError(
                    'SLOT_HELD',
                    'Slot is currently held by another session'
                );
            }

            // Place the hold
            const updated = await tx.slot.update({
                where: { id: slotId },
                data: {
                    holdExpiresAt: holdExpiry,
                    heldBySessionId: sessionId,
                    isAvailable: false,
                    version: { increment: 1 },
                },
            });

            console.log(
                `[SLOT_HOLD_PLACED] slotId=${slotId} sessionId=${sessionId} expiresAt=${holdExpiry.toISOString()}`
            );

            return updated;
        },
        {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        }
    );
}

// ─── Release Expired Holds (batch utility) ───────────────────────────────────

export async function releaseExpiredHolds(): Promise<number> {
    const now = new Date();

    const result = await prisma.slot.updateMany({
        where: {
            holdExpiresAt: { lt: now },
            heldBySessionId: { not: null },
        },
        data: {
            holdExpiresAt: null,
            heldBySessionId: null,
            isAvailable: true,
        },
    });

    if (result.count > 0) {
        console.log(`[HOLDS_RELEASED] count=${result.count}`);
    }

    return result.count;
}

// ─── Custom Error ────────────────────────────────────────────────────────────

export class SlotError extends Error {
    code: string;
    constructor(code: string, message: string) {
        super(message);
        this.code = code;
        this.name = 'SlotError';
    }
}
