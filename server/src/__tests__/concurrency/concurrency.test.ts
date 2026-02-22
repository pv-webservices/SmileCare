/**
 * Concurrency Simulation Tests
 *
 * Covers: Parallel Promise.all slot hold, Parallel reschedule to same slot.
 *
 * Uses pessimistic locking (FOR UPDATE) as primary concurrency strategy.
 * Imports from canonical modules/booking/ path.
 */

import { holdSlot } from '../../modules/booking/slot.service';
import { SlotError } from '../../modules/booking/slot.service';
import { createBooking, rescheduleBooking, BookingError } from '../../modules/booking/booking.service';
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
// 1. PARALLEL SLOT HOLD — 5 concurrent holds, exactly 1 wins
//    Uses SERIALIZABLE isolation (only endpoint with this level)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Parallel Slot Hold (Promise.all)', () => {
    let contestedSlotId: string;

    beforeAll(async () => {
        const slot = await prisma.slot.create({
            data: {
                dentistId: testData.dentist.id,
                date: testData.futureDate,
                startTime: '09:00',
                endTime: '09:30',
                isAvailable: true,
            },
        });
        contestedSlotId = slot.id;
    });

    test('exactly 1 of 5 parallel holds succeeds, 4 fail', async () => {
        const results = await Promise.allSettled(
            Array.from({ length: 5 }, (_, i) =>
                holdSlot(contestedSlotId, `session-race-${i}`)
            )
        );

        const successes = results.filter((r) => r.status === 'fulfilled');
        const failures = results.filter((r) => r.status === 'rejected');

        expect(successes.length).toBe(1);
        expect(failures.length).toBe(4);

        // Verify all failures are SLOT_HELD or serialization errors
        failures.forEach((f) => {
            if (f.status === 'rejected') {
                expect(f.reason).toBeInstanceOf(SlotError);
            }
        });

        // Verify slot is held
        const slot = await prisma.slot.findUnique({ where: { id: contestedSlotId } });
        expect(slot!.holdExpiresAt).not.toBeNull();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. PARALLEL RESCHEDULE TO SAME SLOT — 2 bookings target the same slot
//    Uses READ COMMITTED + FOR UPDATE (pessimistic locking)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Parallel Reschedule to Same Slot', () => {
    let bookingId1: string;
    let bookingId2: string;
    let targetSlotId: string;

    beforeAll(async () => {
        // Create 3 slots: 2 source slots + 1 target slot
        const sourceSlot1 = await prisma.slot.create({
            data: {
                dentistId: testData.dentist.id,
                date: testData.futureDate,
                startTime: '12:00',
                endTime: '12:30',
                isAvailable: true,
            },
        });

        const sourceSlot2 = await prisma.slot.create({
            data: {
                dentistId: testData.dentist.id,
                date: testData.futureDate,
                startTime: '12:30',
                endTime: '13:00',
                isAvailable: true,
            },
        });

        const target = await prisma.slot.create({
            data: {
                dentistId: testData.dentist.id,
                date: testData.futureDate,
                startTime: '13:00',
                endTime: '13:30',
                isAvailable: true,
            },
        });

        targetSlotId = target.id;

        // Hold + confirm booking 1 (uses session + idempotency)
        await holdSlot(sourceSlot1.id, 'session-src-1');
        const result1 = await createBooking(
            {
                slotId: sourceSlot1.id,
                treatmentId: testData.treatment.id,
                sessionId: 'session-src-1',
                idempotencyKey: `concurrency-1-${Date.now()}`,
            },
            testData.patient.id
        );
        bookingId1 = result1.booking.id;

        // Need a second patient for booking 2
        const patient2User = await prisma.user.create({
            data: {
                name: 'Patient Two',
                email: `patient2-${Date.now()}@test.com`,
                phone: `+3${Date.now().toString().slice(-10)}`,
                passwordHash: '$2b$12$placeholder',
                role: 'patient',
            },
        });
        const patient2 = await prisma.patient.create({
            data: { userId: patient2User.id },
        });

        await holdSlot(sourceSlot2.id, 'session-src-2');
        const result2 = await createBooking(
            {
                slotId: sourceSlot2.id,
                treatmentId: testData.treatment.id,
                sessionId: 'session-src-2',
                idempotencyKey: `concurrency-2-${Date.now()}`,
            },
            patient2.id
        );
        bookingId2 = result2.booking.id;
    });

    test('exactly 1 of 2 parallel reschedules succeeds', async () => {
        const results = await Promise.allSettled([
            rescheduleBooking(bookingId1, targetSlotId, testData.patientUser.id),
            rescheduleBooking(bookingId2, targetSlotId, testData.patientUser.id),
        ]);

        const successes = results.filter((r) => r.status === 'fulfilled');
        const failures = results.filter((r) => r.status === 'rejected');

        expect(successes.length).toBe(1);
        expect(failures.length).toBe(1);

        // Verify target slot is booked
        const targetSlot = await prisma.slot.findUnique({ where: { id: targetSlotId } });
        expect(targetSlot!.isAvailable).toBe(false);
    });
});
