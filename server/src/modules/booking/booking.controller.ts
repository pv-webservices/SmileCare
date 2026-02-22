// ─── Booking Controller — Request Handling Layer ─────────────────────────────

import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import * as slotService from './slot.service';
import * as bookingService from './booking.service';
import { SlotError } from './slot.service';
import { BookingError } from './booking.service';
import {
    successResponse,
    errorResponse,
    GetSlotsQuery,
    HoldSlotBody,
    CreateBookingBody,
    RescheduleBody,
    CancelBody,
} from './booking.types';
import { prisma } from '../../index';

// ─── GET /api/slots ──────────────────────────────────────────────────────────

export async function getSlots(req: Request, res: Response) {
    try {
        const { dentistId, date } = req.query as unknown as GetSlotsQuery;

        const slots = await slotService.getAvailableSlots(
            dentistId as string | undefined,
            date as string | undefined
        );

        return res.status(200).json(successResponse(slots));
    } catch (error) {
        console.error('[GET_SLOTS_ERROR]', error);
        return res.status(500).json(
            errorResponse('INTERNAL_ERROR', 'Failed to fetch available slots')
        );
    }
}

// ─── POST /api/slots/:id/hold ────────────────────────────────────────────────

export async function holdSlot(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { sessionId } = req.body as HoldSlotBody;

        if (!sessionId) {
            return res.status(400).json(
                errorResponse('VALIDATION_ERROR', 'sessionId is required')
            );
        }

        const slot = await slotService.holdSlot(id, sessionId);

        return res.status(200).json(
            successResponse({
                id: slot.id,
                holdExpiresAt: slot.holdExpiresAt,
                message: 'Slot held successfully',
            })
        );
    } catch (error) {
        if (error instanceof SlotError) {
            const statusMap: Record<string, number> = {
                SLOT_NOT_FOUND: 404,
                SLOT_UNAVAILABLE: 409,
                SLOT_EMERGENCY: 403,
                SLOT_HELD: 409,
            };
            const status = statusMap[error.code] || 400;
            return res.status(status).json(errorResponse(error.code, error.message));
        }

        console.error('[HOLD_SLOT_ERROR]', error);
        return res.status(500).json(
            errorResponse('INTERNAL_ERROR', 'Failed to hold slot')
        );
    }
}

// ─── POST /api/bookings ──────────────────────────────────────────────────────

export async function createBooking(req: AuthRequest, res: Response) {
    try {
        const body = req.body as CreateBookingBody;

        if (!body.slotId || !body.treatmentId || !body.sessionId || !body.idempotencyKey) {
            return res.status(400).json(
                errorResponse(
                    'VALIDATION_ERROR',
                    'slotId, treatmentId, sessionId, and idempotencyKey are required'
                )
            );
        }

        // Look up patient from authenticated user
        const patient = await prisma.patient.findUnique({
            where: { userId: req.user!.userId },
        });

        if (!patient) {
            return res.status(403).json(
                errorResponse('NOT_A_PATIENT', 'Only patients can create bookings')
            );
        }

        const result = await bookingService.createBooking(body, patient.id);

        const status = result.isIdempotent ? 200 : 201;
        return res.status(status).json(successResponse(result.booking));
    } catch (error) {
        if (error instanceof BookingError) {
            const statusMap: Record<string, number> = {
                SLOT_NOT_FOUND: 404,
                SLOT_UNAVAILABLE: 409,
                HOLD_MISMATCH: 409,
                HOLD_EXPIRED: 410,
                PAYMENT_FAILED: 402,
            };
            const status = statusMap[error.code] || 400;
            return res.status(status).json(errorResponse(error.code, error.message));
        }

        console.error('[CREATE_BOOKING_ERROR]', error);
        return res.status(500).json(
            errorResponse('INTERNAL_ERROR', 'Failed to create booking')
        );
    }
}

// ─── PUT /api/bookings/:id/reschedule ────────────────────────────────────────

export async function rescheduleBooking(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params;
        const { newSlotId } = req.body as RescheduleBody;

        if (!newSlotId) {
            return res.status(400).json(
                errorResponse('VALIDATION_ERROR', 'newSlotId is required')
            );
        }

        const booking = await bookingService.rescheduleBooking(
            id,
            newSlotId,
            req.user!.userId
        );

        return res.status(200).json(successResponse(booking));
    } catch (error) {
        if (error instanceof BookingError) {
            const statusMap: Record<string, number> = {
                BOOKING_NOT_FOUND: 404,
                UNAUTHORIZED: 403,
                INVALID_STATUS: 409,
                RESCHEDULE_LIMIT: 409,
                TOO_LATE: 409,
                NEW_SLOT_NOT_FOUND: 404,
                NEW_SLOT_UNAVAILABLE: 409,
            };
            const status = statusMap[error.code] || 400;
            return res.status(status).json(errorResponse(error.code, error.message));
        }

        console.error('[RESCHEDULE_BOOKING_ERROR]', error);
        return res.status(500).json(
            errorResponse('INTERNAL_ERROR', 'Failed to reschedule booking')
        );
    }
}

// ─── DELETE /api/bookings/:id/cancel ─────────────────────────────────────────

export async function cancelBooking(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params;
        const { reason, adminOverride } = req.body as CancelBody;

        const result = await bookingService.cancelBooking(
            id,
            req.user!.userId,
            reason,
            adminOverride
        );

        return res.status(200).json(
            successResponse({
                booking: result.booking,
                refundEligible: result.refundEligible,
            })
        );
    } catch (error) {
        if (error instanceof BookingError) {
            const statusMap: Record<string, number> = {
                BOOKING_NOT_FOUND: 404,
                UNAUTHORIZED: 403,
                INVALID_STATUS: 409,
            };
            const status = statusMap[error.code] || 400;
            return res.status(status).json(errorResponse(error.code, error.message));
        }

        console.error('[CANCEL_BOOKING_ERROR]', error);
        return res.status(500).json(
            errorResponse('INTERNAL_ERROR', 'Failed to cancel booking')
        );
    }
}
