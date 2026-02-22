/**
 * Booking Service — Unit Tests
 *
 * Covers: State transitions, hold expiry math (5-min default),
 * reschedule validations, strict binary refund eligibility, and type checks.
 *
 * All imports point to the canonical modules/booking/ path.
 */

import { BookingStatus } from '@prisma/client';
import {
    isValidTransition,
    computeHoldExpiry,
    isHoldExpired,
    calculateRefundEligibility,
    validateReschedule,
    HOLD_TTL_MINUTES,
    REFUND_ELIGIBLE_HOURS,
    MAX_RESCHEDULES,
} from '../../modules/booking/booking.types';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. STATE TRANSITION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('State Machine — isValidTransition', () => {
    // Valid transitions
    test.each([
        [BookingStatus.pending_payment, BookingStatus.confirmed],
        [BookingStatus.pending_payment, BookingStatus.expired],
        [BookingStatus.pending_payment, BookingStatus.cancelled],
        [BookingStatus.confirmed, BookingStatus.cancelled],
        [BookingStatus.confirmed, BookingStatus.completed],
        [BookingStatus.confirmed, BookingStatus.no_show],
        [BookingStatus.confirmed, BookingStatus.refund_pending],
        [BookingStatus.refund_pending, BookingStatus.refunded],
    ])('allows %s → %s', (from, to) => {
        expect(isValidTransition(from, to)).toBe(true);
    });

    // Invalid transitions
    test.each([
        [BookingStatus.pending_payment, BookingStatus.completed],
        [BookingStatus.pending_payment, BookingStatus.no_show],
        [BookingStatus.confirmed, BookingStatus.expired],
        [BookingStatus.confirmed, BookingStatus.pending_payment],
        [BookingStatus.refunded, BookingStatus.confirmed],
    ])('rejects %s → %s', (from, to) => {
        expect(isValidTransition(from, to)).toBe(false);
    });

    // Terminal states reject all transitions
    test.each([
        BookingStatus.cancelled,
        BookingStatus.completed,
        BookingStatus.expired,
        BookingStatus.no_show,
        BookingStatus.refunded,
    ])('terminal state %s rejects all transitions', (terminal) => {
        const allStatuses = Object.values(BookingStatus);
        allStatuses.forEach((target) => {
            expect(isValidTransition(terminal, target)).toBe(false);
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. HOLD EXPIRY MATH TESTS — 5 minutes default (300 seconds)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Hold Expiry Math', () => {
    test(`HOLD_TTL_MINUTES is exactly 5`, () => {
        expect(HOLD_TTL_MINUTES).toBe(5);
    });

    test('computeHoldExpiry defaults to 5 minutes', () => {
        const before = Date.now();
        const expiry = computeHoldExpiry();
        const after = Date.now();

        const expectedMin = before + 5 * 60 * 1000;
        const expectedMax = after + 5 * 60 * 1000;

        expect(expiry.getTime()).toBeGreaterThanOrEqual(expectedMin);
        expect(expiry.getTime()).toBeLessThanOrEqual(expectedMax);
    });

    test('computeHoldExpiry respects custom duration', () => {
        const before = Date.now();
        const expiry = computeHoldExpiry(10);
        const after = Date.now();

        const expectedMin = before + 10 * 60 * 1000;
        const expectedMax = after + 10 * 60 * 1000;

        expect(expiry.getTime()).toBeGreaterThanOrEqual(expectedMin);
        expect(expiry.getTime()).toBeLessThanOrEqual(expectedMax);
    });

    test('isHoldExpired returns true for null holdExpiresAt', () => {
        expect(isHoldExpired(null)).toBe(true);
    });

    test('isHoldExpired returns true for past expiry', () => {
        const pastDate = new Date(Date.now() - 60_000); // 1 min ago
        expect(isHoldExpired(pastDate)).toBe(true);
    });

    test('isHoldExpired returns false for future expiry', () => {
        const futureDate = new Date(Date.now() + 600_000); // 10 min from now
        expect(isHoldExpired(futureDate)).toBe(false);
    });

    test('isHoldExpired boundary: just-expired hold is detected', () => {
        const justPast = new Date(Date.now() - 1); // 1ms ago
        expect(isHoldExpired(justPast)).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. RESCHEDULE VALIDATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Reschedule Validations', () => {
    const baseBooking = {
        status: BookingStatus.confirmed,
        rescheduleCount: 0,
        slotId: 'slot-1',
    };

    test('allows valid reschedule', () => {
        const result = validateReschedule(baseBooking, 'slot-2');
        expect(result.valid).toBe(true);
    });

    test('rejects non-confirmed booking', () => {
        const result = validateReschedule(
            { ...baseBooking, status: BookingStatus.pending_payment },
            'slot-2'
        );
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('confirmed');
    });

    test('rejects when max reschedules reached', () => {
        const result = validateReschedule(
            { ...baseBooking, rescheduleCount: MAX_RESCHEDULES },
            'slot-2'
        );
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Maximum');
    });

    test('rejects same-slot reschedule', () => {
        const result = validateReschedule(baseBooking, 'slot-1');
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('same slot');
    });

    test('rejects past slot date', () => {
        const pastDate = new Date('2020-01-01');
        const result = validateReschedule(baseBooking, 'slot-2', pastDate);
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('past');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. REFUND ELIGIBILITY TESTS — Strict binary: ≥24h or adminOverride
// ═══════════════════════════════════════════════════════════════════════════════

describe('Refund Eligibility — Strict Binary Policy', () => {
    test('eligible when ≥24h before appointment', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 3);

        const result = calculateRefundEligibility(
            { status: BookingStatus.confirmed, createdAt: new Date() },
            futureDate,
            '10:00'
        );
        expect(result.eligible).toBe(true);
    });

    test('NOT eligible when <24h before appointment (no adminOverride)', () => {
        const futureDate = new Date();
        futureDate.setHours(futureDate.getHours() + 18); // 18 hours from now

        const hours = futureDate.getHours().toString().padStart(2, '0');
        const mins = futureDate.getMinutes().toString().padStart(2, '0');

        const result = calculateRefundEligibility(
            { status: BookingStatus.confirmed, createdAt: new Date() },
            futureDate,
            `${hours}:${mins}`
        );
        expect(result.eligible).toBe(false);
        expect(result.reason).toContain(`${REFUND_ELIGIBLE_HOURS}`);
    });

    test('eligible when <24h but adminOverride=true', () => {
        const futureDate = new Date();
        futureDate.setHours(futureDate.getHours() + 6); // 6 hours from now

        const hours = futureDate.getHours().toString().padStart(2, '0');
        const mins = futureDate.getMinutes().toString().padStart(2, '0');

        const result = calculateRefundEligibility(
            { status: BookingStatus.confirmed, createdAt: new Date() },
            futureDate,
            `${hours}:${mins}`,
            true // adminOverride
        );
        expect(result.eligible).toBe(true);
        expect(result.reason).toContain('Admin override');
    });

    test('NOT eligible when <24h and adminOverride=false', () => {
        const futureDate = new Date();
        futureDate.setHours(futureDate.getHours() + 6);

        const hours = futureDate.getHours().toString().padStart(2, '0');
        const mins = futureDate.getMinutes().toString().padStart(2, '0');

        const result = calculateRefundEligibility(
            { status: BookingStatus.confirmed, createdAt: new Date() },
            futureDate,
            `${hours}:${mins}`,
            false
        );
        expect(result.eligible).toBe(false);
    });

    test('ineligible for non-confirmed booking (cancelled)', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 3);

        const result = calculateRefundEligibility(
            { status: BookingStatus.cancelled, createdAt: new Date() },
            futureDate,
            '10:00'
        );
        expect(result.eligible).toBe(false);
    });

    test('ineligible for expired booking', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 3);

        const result = calculateRefundEligibility(
            { status: BookingStatus.expired, createdAt: new Date() },
            futureDate,
            '10:00'
        );
        expect(result.eligible).toBe(false);
    });

    test('ineligible when appointment has passed', () => {
        const pastDate = new Date('2020-01-01');
        const result = calculateRefundEligibility(
            { status: BookingStatus.confirmed, createdAt: new Date() },
            pastDate,
            '10:00'
        );
        expect(result.eligible).toBe(false);
        expect(result.reason).toContain('passed');
    });
});
