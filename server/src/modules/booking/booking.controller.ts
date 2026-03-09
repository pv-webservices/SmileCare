import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import * as slotService from "./slot.service";
import * as bookingService from "./booking.service";
import { SlotError } from "./slot.service";
import { BookingError } from "./booking.service";
import {
    successResponse,
    errorResponse,
    GetSlotsQuery,
    HoldSlotBody,
    CreateBookingBody,
    RescheduleBody,
    CancelBody,
} from "./booking.types";
import { prisma } from "../../lib/prisma";

export async function getSlots(req: Request, res: Response) {
    try {
        const { dentistId, date } = req.query as unknown as GetSlotsQuery;

        const slots = await slotService.getAvailableSlots(
            dentistId as string | undefined,
            date as string | undefined
        );

        return res.status(200).json(slots);
    } catch (error) {
        console.error("[GET_SLOTS_ERROR]", error);
        return res.status(500).json(
            errorResponse("INTERNAL_ERROR", "Failed to fetch available slots")
        );
    }
}

export async function holdSlot(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { sessionId } = req.body as HoldSlotBody;

        if (!sessionId) {
            return res.status(400).json(
                errorResponse("VALIDATION_ERROR", "sessionId is required")
            );
        }

        const slot = await slotService.holdSlot(id, sessionId);

        return res.status(200).json(
            successResponse({
                id: slot.id,
                holdExpiresAt: slot.holdExpiresAt,
                message: "Slot held successfully",
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

        console.error("[HOLD_SLOT_ERROR]", error);
        return res.status(500).json(
            errorResponse("INTERNAL_ERROR", "Failed to hold slot")
        );
    }
}

export async function createBooking(req: AuthRequest, res: Response) {
    try {
        const body = req.body as CreateBookingBody;

        if (!body.slotId || !body.treatmentId || !body.sessionId || !body.idempotencyKey) {
            return res.status(400).json(
                errorResponse(
                    "VALIDATION_ERROR",
                    "slotId, treatmentId, sessionId, and idempotencyKey are required"
                )
            );
        }

        const patient = await prisma.patient.findUnique({
            where: { userId: req.user!.id },
        });

        if (!patient) {
            return res.status(403).json(
                errorResponse("NOT_A_PATIENT", "Only patients can create bookings")
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

        console.error("[CREATE_BOOKING_ERROR]", error);
        return res.status(500).json(
            errorResponse("INTERNAL_ERROR", "Failed to create booking")
        );
    }
}

export async function rescheduleBooking(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params;
        const { newSlotId } = req.body as RescheduleBody;

        if (!newSlotId) {
            return res.status(400).json(
                errorResponse("VALIDATION_ERROR", "newSlotId is required")
            );
        }

        const booking = await bookingService.rescheduleBooking(
            id,
            newSlotId,
            req.user!.id
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

        console.error("[RESCHEDULE_BOOKING_ERROR]", error);
        return res.status(500).json(
            errorResponse("INTERNAL_ERROR", "Failed to reschedule booking")
        );
    }
}

export async function cancelBooking(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params;
        const { reason, adminOverride } = req.body as CancelBody;

        const result = await bookingService.cancelBooking(
            id,
            req.user!.id,
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

        console.error("[CANCEL_BOOKING_ERROR]", error);
        return res.status(500).json(
            errorResponse("INTERNAL_ERROR", "Failed to cancel booking")
        );
    }
}

export async function getMyBookings(req: AuthRequest, res: Response) {
    try {
        const patient = await prisma.patient.findUnique({
            where: { userId: req.user!.id },
        });

        if (!patient) {
            return res.status(404).json(
                errorResponse("NOT_FOUND", "Patient record not found")
            );
        }

        const filter = String(req.query.status || req.query.scope || "").toLowerCase();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const where: any = { patientId: patient.id };
        let orderBy: any[] = [{ slot: { date: "desc" } }, { slot: { startTime: "desc" } }];

        if (filter === "upcoming") {
            where.status = { in: ["confirmed", "pending_payment"] };
            where.slot = { date: { gte: today } };
            orderBy = [{ slot: { date: "asc" } }, { slot: { startTime: "asc" } }];
        } else if (filter === "history" || filter === "past") {
            where.OR = [
                { status: { in: ["completed", "cancelled", "no_show", "refunded", "refund_pending"] } },
                { slot: { date: { lt: today } } },
            ];
        } else if (filter) {
            where.status = filter;
        }

        const bookings = await prisma.booking.findMany({
            where,
            include: {
                slot: {
                    include: {
                        dentist: {
                            include: { user: true }
                        }
                    }
                },
                treatment: true,
                payment: true
            },
            orderBy,
        });

        const formatted = bookings.map((b) => ({
            id: b.id,
            treatment: b.treatment.name,
            treatmentId: b.treatmentId,
            doctor: `Dr. ${b.slot.dentist.user.name}`,
            specialization: b.slot.dentist.specialization,
            date: b.slot.date.toISOString(),
            startTime: b.slot.startTime,
            endTime: b.slot.endTime,
            status: b.status,
            paymentAmount: b.payment?.amount || null,
            paymentStatus: b.payment?.status || null
        }));

        return res.status(200).json(formatted);
    } catch (error) {
        console.error("[GET_MY_BOOKINGS_ERROR]", error);
        return res.status(500).json(
            errorResponse("INTERNAL_ERROR", "Failed to fetch bookings")
        );
    }
}
