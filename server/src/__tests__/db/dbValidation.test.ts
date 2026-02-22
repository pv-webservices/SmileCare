/**
 * DB Validation Tests
 *
 * Covers: slot.isAvailable correctness, holdExpiresAt cleared properly,
 * booking.status transitions correct.
 *
 * Uses module-level service functions (pessimistic locking with FOR UPDATE).
 * Imports from canonical modules/booking/ path.
 */

import { BookingStatus } from '@prisma/client';
import { holdSlot } from '../../modules/booking/slot.service';
import { createBooking, cancelBooking, rescheduleBooking } from '../../modules/booking/booking.service';
import {
    getTestPrisma,
    disconnectTestPrisma,
    seedTestData,
    cleanupTestData,
} from '../helpers/testHelpers';

const prisma = getTestPrisma();
let testData: Awaited<ReturnType<typeof seedTestData>>;

beforeAll(async () => {
    await cleanupTestData();
    testData = await seedTestData();
});

afterAll(async () => {
    await cleanupTestData();
    await disconnectTestPrisma();
});

// ═══════════════════════════════════════════════════════════════════════════════
// 1. slot.isAvailable CORRECTNESS
// ═══════════════════════════════════════════════════════════════════════════════

describe('slot.isAvailable correctness', () => {
    let slotId: string;
    let bookingId: string;

    beforeAll(async () => {
        const slot = await prisma.slot.create({
            data: {
                dentistId: testData.dentist.id,
                date: testData.futureDate,
                startTime: '08:00',
                endTime: '08:30',
                isAvailable: true,
            },
        });
        slotId = slot.id;
    });

    test('slot starts as available', async () => {
        const slot = await prisma.slot.findUnique({ where: { id: slotId } });
        expect(slot!.isAvailable).toBe(true);
    });

    test('after hold: slot has holdExpiresAt set', async () => {
        await holdSlot(slotId, 'db-test-session');
        const slot = await prisma.slot.findUnique({ where: { id: slotId } });
        expect(slot!.holdExpiresAt).not.toBeNull();
        // Note: isAvailable remains true during hold (slot is reservable, 
        // but held by session — availability check is combined with hold check)
    });

    test('after confirm: isAvailable = false (booked)', async () => {
        const result = await createBooking(
            {
                slotId,
                treatmentId: testData.treatment.id,
                sessionId: 'db-test-session',
                idempotencyKey: `db-val-1-${Date.now()}`,
            },
            testData.patient.id
        );
        bookingId = result.booking.id;

        const slot = await prisma.slot.findUnique({ where: { id: slotId } });
        expect(slot!.isAvailable).toBe(false);
    });

    test('after cancel: isAvailable = true', async () => {
        await cancelBooking(bookingId, testData.patientUser.id, 'test cancel');
        const slot = await prisma.slot.findUnique({ where: { id: slotId } });
        expect(slot!.isAvailable).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. holdExpiresAt CLEARED PROPERLY
// ═══════════════════════════════════════════════════════════════════════════════

describe('holdExpiresAt lifecycle', () => {
    let slotId: string;
    let bookingId: string;

    beforeAll(async () => {
        const slot = await prisma.slot.create({
            data: {
                dentistId: testData.dentist.id,
                date: testData.futureDate,
                startTime: '08:30',
                endTime: '09:00',
                isAvailable: true,
            },
        });
        slotId = slot.id;
    });

    test('initially holdExpiresAt is null', async () => {
        const slot = await prisma.slot.findUnique({ where: { id: slotId } });
        expect(slot!.holdExpiresAt).toBeNull();
    });

    test('after hold: holdExpiresAt is set to a future timestamp', async () => {
        await holdSlot(slotId, 'hold-lifecycle-session');
        const slot = await prisma.slot.findUnique({ where: { id: slotId } });
        expect(slot!.holdExpiresAt).not.toBeNull();
        expect(slot!.holdExpiresAt!.getTime()).toBeGreaterThan(Date.now());
    });

    test('after confirm: holdExpiresAt is cleared (null)', async () => {
        const result = await createBooking(
            {
                slotId,
                treatmentId: testData.treatment.id,
                sessionId: 'hold-lifecycle-session',
                idempotencyKey: `hold-lifecycle-${Date.now()}`,
            },
            testData.patient.id
        );
        bookingId = result.booking.id;

        const slot = await prisma.slot.findUnique({ where: { id: slotId } });
        expect(slot!.holdExpiresAt).toBeNull();
    });

    test('after cancel: holdExpiresAt remains null', async () => {
        await cancelBooking(bookingId, testData.patientUser.id);
        const slot = await prisma.slot.findUnique({ where: { id: slotId } });
        expect(slot!.holdExpiresAt).toBeNull();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. booking.status TRANSITIONS CORRECT
// ═══════════════════════════════════════════════════════════════════════════════

describe('booking.status transitions via DB queries', () => {
    test('hold + confirm → status is confirmed', async () => {
        const slot = await prisma.slot.create({
            data: {
                dentistId: testData.dentist.id,
                date: testData.futureDate,
                startTime: '20:00',
                endTime: '20:30',
                isAvailable: true,
            },
        });

        await holdSlot(slot.id, 'status-test-1');
        const result = await createBooking(
            {
                slotId: slot.id,
                treatmentId: testData.treatment.id,
                sessionId: 'status-test-1',
                idempotencyKey: `status-1-${Date.now()}`,
            },
            testData.patient.id
        );

        const dbBooking = await prisma.booking.findUnique({ where: { id: result.booking.id } });
        expect(dbBooking!.status).toBe(BookingStatus.confirmed);
    });

    test('confirmed → cancelled', async () => {
        const slot = await prisma.slot.create({
            data: {
                dentistId: testData.dentist.id,
                date: testData.futureDate,
                startTime: '20:30',
                endTime: '21:00',
                isAvailable: true,
            },
        });

        await holdSlot(slot.id, 'status-test-2');
        const result = await createBooking(
            {
                slotId: slot.id,
                treatmentId: testData.treatment.id,
                sessionId: 'status-test-2',
                idempotencyKey: `status-2-${Date.now()}`,
            },
            testData.patient.id
        );

        await cancelBooking(result.booking.id, testData.patientUser.id, 'testing');

        const dbBooking = await prisma.booking.findUnique({ where: { id: result.booking.id } });
        expect(dbBooking!.status).toBe(BookingStatus.cancelled);
        expect(dbBooking!.cancellationReason).toBe('testing');
    });

    test('reschedule preserves confirmed status and increments rescheduleCount', async () => {
        const slot1 = await prisma.slot.create({
            data: {
                dentistId: testData.dentist.id,
                date: testData.futureDate,
                startTime: '21:00',
                endTime: '21:30',
                isAvailable: true,
            },
        });
        const slot2 = await prisma.slot.create({
            data: {
                dentistId: testData.dentist.id,
                date: testData.futureDate,
                startTime: '21:30',
                endTime: '22:00',
                isAvailable: true,
            },
        });

        await holdSlot(slot1.id, 'status-test-3');
        const result = await createBooking(
            {
                slotId: slot1.id,
                treatmentId: testData.treatment.id,
                sessionId: 'status-test-3',
                idempotencyKey: `status-3-${Date.now()}`,
            },
            testData.patient.id
        );

        await rescheduleBooking(result.booking.id, slot2.id, testData.patientUser.id);

        const dbBooking = await prisma.booking.findUnique({ where: { id: result.booking.id } });
        expect(dbBooking!.status).toBe(BookingStatus.confirmed);
        expect(dbBooking!.rescheduleCount).toBe(1);
        expect(dbBooking!.slotId).toBe(slot2.id);
    });
});
