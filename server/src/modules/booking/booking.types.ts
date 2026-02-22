// ─── Booking Agent — Shared Types & Response Helpers ─────────────────────────

import { BookingStatus } from '@prisma/client';

// ─── Standard API Response ───────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
}

export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
    };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function successResponse<T>(data: T): ApiSuccessResponse<T> {
    return { success: true, data };
}

export function errorResponse(code: string, message: string): ApiErrorResponse {
    return { success: false, error: { code, message } };
}

// ─── Period Grouping ─────────────────────────────────────────────────────────

export type PeriodHint = 'morning' | 'afternoon' | 'evening';

export function getPeriodHint(startTime: string): PeriodHint {
    const hour = parseInt(startTime.split(':')[0], 10);
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface GetSlotsQuery {
    dentistId?: string;
    date?: string; // ISO date string YYYY-MM-DD
}

export interface HoldSlotBody {
    sessionId: string;
}

export interface CreateBookingBody {
    slotId: string;
    treatmentId: string;
    sessionId: string;
    idempotencyKey: string;
    notes?: string;
}

export interface RescheduleBody {
    newSlotId: string;
}

export interface CancelBody {
    reason?: string;
    adminOverride?: boolean;
}

// ─── Enriched Slot (returned by GET /api/slots) ──────────────────────────────

export interface SlotWithPeriod {
    id: string;
    dentistId: string;
    date: Date;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    period: PeriodHint;
}

// ─── Booking State Transitions ───────────────────────────────────────────────

export const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
    pending_payment: ['confirmed', 'expired', 'cancelled'],
    confirmed: ['completed', 'cancelled', 'no_show', 'refund_pending'],
    expired: [],
    cancelled: [],
    completed: [],
    no_show: [],
    refund_pending: ['refunded'],
    refunded: [],
};

/**
 * Check if a state transition is valid per the booking state machine.
 */
export function isValidTransition(from: BookingStatus, to: BookingStatus): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// ─── Hold Expiry Helpers ─────────────────────────────────────────────────────

/**
 * Compute the hold expiry timestamp.
 * Default hold duration: 5 minutes (300 seconds) per approved blueprint.
 */
export function computeHoldExpiry(durationMinutes: number = HOLD_TTL_MINUTES): Date {
    return new Date(Date.now() + durationMinutes * 60 * 1000);
}

/**
 * Check if a hold has expired.
 * Returns true if holdExpiresAt is null (no hold) or in the past.
 */
export function isHoldExpired(holdExpiresAt: Date | null): boolean {
    if (!holdExpiresAt) return true;
    return holdExpiresAt.getTime() <= Date.now();
}

// ─── Refund Eligibility ──────────────────────────────────────────────────────

export interface RefundEligibilityResult {
    eligible: boolean;
    reason?: string;
}

/**
 * Strict binary refund policy per approved blueprint:
 *   ≥24h before appointment → eligible
 *   <24h before appointment → NOT eligible unless adminOverride=true
 *
 * Only confirmed/pending_payment bookings are refund-eligible.
 */
export function calculateRefundEligibility(
    booking: { status: BookingStatus; createdAt: Date },
    slotDate: Date,
    startTime: string,
    adminOverride: boolean = false
): RefundEligibilityResult {
    // Only confirmed or pending_payment bookings can be refunded
    if (booking.status !== 'confirmed' && booking.status !== 'pending_payment') {
        return { eligible: false, reason: `Cannot refund booking with status: ${booking.status}` };
    }

    // Compute appointment datetime from slot date + startTime
    const appointmentDate = new Date(slotDate);
    const [hours, minutes] = startTime.split(':').map(Number);
    appointmentDate.setHours(hours, minutes, 0, 0);

    const now = new Date();

    // If appointment has already passed, no refund
    if (appointmentDate.getTime() <= now.getTime()) {
        return { eligible: false, reason: 'Appointment has already passed' };
    }

    const hoursUntilAppointment =
        (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // ≥24h → eligible
    if (hoursUntilAppointment >= REFUND_ELIGIBLE_HOURS) {
        return { eligible: true };
    }

    // <24h → NOT eligible unless admin override
    if (adminOverride) {
        return { eligible: true, reason: 'Admin override applied for <24h cancellation' };
    }

    return {
        eligible: false,
        reason: `Cancellation must be at least ${REFUND_ELIGIBLE_HOURS} hours before appointment`,
    };
}

// ─── Reschedule Validation ───────────────────────────────────────────────────

export interface RescheduleValidationResult {
    valid: boolean;
    reason?: string;
}

/**
 * Validate whether a booking can be rescheduled.
 */
export function validateReschedule(
    booking: { status: BookingStatus; rescheduleCount: number; slotId: string },
    newSlotId: string,
    newSlotDate?: Date
): RescheduleValidationResult {
    if (booking.status !== 'confirmed') {
        return { valid: false, reason: `Only confirmed bookings can be rescheduled` };
    }

    if (booking.rescheduleCount >= MAX_RESCHEDULES) {
        return { valid: false, reason: `Maximum ${MAX_RESCHEDULES} reschedules allowed` };
    }

    if (booking.slotId === newSlotId) {
        return { valid: false, reason: 'Cannot reschedule to the same slot' };
    }

    if (newSlotDate && newSlotDate.getTime() < Date.now()) {
        return { valid: false, reason: 'Cannot reschedule to a past date' };
    }

    return { valid: true };
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const HOLD_TTL_MINUTES = 5;       // 5 minutes = 300 seconds
export const MAX_RESCHEDULES = 2;
export const MIN_HOURS_BEFORE_RESCHEDULE = 2;
export const REFUND_ELIGIBLE_HOURS = 24;
