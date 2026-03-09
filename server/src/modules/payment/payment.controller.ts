import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { createOrder as _createOrder, verifyPayment as _verifyPayment, refundMockPayment } from "./payment.service";
import { PaymentError } from "./payment.types";
import { prisma } from "../../lib/prisma";
import {
    successResponse,
    errorResponse,
} from "../booking/booking.types";

export async function createOrder(req: AuthRequest, res: Response) {
    try {
        const { slotId, treatmentId, amount } = req.body;

        if (!slotId || !treatmentId || !amount) {
            return res.status(400).json(
                errorResponse(
                    "VALIDATION_ERROR",
                    "slotId, treatmentId, and amount are required"
                )
            );
        }

        if (typeof amount !== "number" || amount <= 0) {
            return res.status(400).json(
                errorResponse("VALIDATION_ERROR", "amount must be a positive number")
            );
        }

        const order = await _createOrder({
            slotId,
            treatmentId,
            amount,
        });

        return res.status(201).json(successResponse(order));
    } catch (error) {
        if (error instanceof PaymentError) {
            const statusMap: Record<string, number> = {
                VALIDATION_ERROR: 400,
                SLOT_NOT_FOUND: 404,
                SLOT_NOT_HELD: 409,
                TREATMENT_NOT_FOUND: 404,
            };
            const status = statusMap[error.code] || 400;
            return res.status(status).json(errorResponse(error.code, error.message));
        }

        console.error("[CREATE_ORDER_ERROR]", error);
        return res.status(500).json(
            errorResponse("INTERNAL_ERROR", "Failed to create payment order")
        );
    }
}

export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const {
            orderId,
            slotId,
            treatmentId,
            sessionId,
            idempotencyKey,
            amount,
            razorpayPaymentId,
            razorpaySignature,
        } = req.body;

        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: { message: "Unauthorized" }
            });
        }

        const patient = await prisma.patient.findUnique({
            where: { userId },
        });
        if (!patient) {
            return res.status(404).json({
                success: false,
                error: { message: "Patient not found" }
            });
        }

        const result = await _verifyPayment({
            orderId,
            slotId,
            treatmentId,
            sessionId,
            idempotencyKey,
            amount,
            razorpayPaymentId,
            razorpaySignature,
        }, patient.id);

        return res.status(200).json({
            success: true,
            data: {
                payment: { id: result.payment.id, status: result.payment.status, amount: result.payment.amount },
                booking: { id: result.booking.id, status: result.booking.status },
            },
        });
    } catch (err: any) {
        if (err instanceof PaymentError) {
            const statusMap: Record<string, number> = {
                ORDER_NOT_FOUND: 404,
                ORDER_EXPIRED: 410,
                ORDER_MISMATCH: 409,
                SLOT_NOT_FOUND: 404,
                SLOT_NOT_AVAILABLE: 409,
                SIGNATURE_INVALID: 400,
            };
            const status = statusMap[err.code] || 400;
            return res.status(status).json({ success: false, error: { message: err.message, code: err.code } });
        }
        console.error("verifyPayment error:", err);
        return res.status(500).json({
            success: false,
            error: { message: err.message || "Internal server error" }
        });
    }
};

export async function refundPayment(req: AuthRequest, res: Response) {
    try {
        const { paymentId, amount } = req.body;

        if (!paymentId) {
            return res.status(400).json(
                errorResponse("VALIDATION_ERROR", "paymentId is required")
            );
        }

        const result = await refundMockPayment(paymentId, amount);

        return res.status(200).json(successResponse(result));
    } catch (error: any) {
        if (error instanceof PaymentError) {
            return res.status(400).json(
                errorResponse(error.code, error.message)
            );
        }

        console.error("[REFUND_ERROR]", error);
        return res.status(500).json(
            errorResponse("INTERNAL_ERROR", "Refund failed")
        );
    }
}

export async function getPaymentDetails(req: AuthRequest, res: Response) {
    try {
        const { slotId, treatmentId, dentistId } = req.query as Record<string, string>;

        if (!slotId || !treatmentId) {
            return res.status(400).json(errorResponse("VALIDATION_ERROR", "slotId and treatmentId are required"));
        }

        const [slot, treatment, dentist] = await Promise.all([
            prisma.slot.findUnique({ where: { id: slotId } }),
            prisma.treatment.findUnique({ where: { id: treatmentId } }),
            dentistId ? prisma.dentist.findUnique({
                where: { id: dentistId },
                include: { user: { select: { name: true } } }
            }) : null
        ]);

        if (!slot || !treatment) {
            return res.status(404).json(errorResponse("NOT_FOUND", "Slot or treatment not found"));
        }

        return res.status(200).json(successResponse({
            slot: {
                id: slot.id,
                date: slot.date,
                startTime: slot.startTime,
                endTime: slot.endTime
            },
            treatment: {
                id: treatment.id,
                title: treatment.name,
                price: treatment.priceRange ? parseFloat(treatment.priceRange) : 0,
                duration: 60
            },
            dentist: dentist ? {
                id: dentist.id,
                name: (dentist as any).user?.name || "Doctor",
                specialization: dentist.specialization
            } : null
        }));
    } catch (error) {
        console.error("[GET_PAYMENT_DETAILS_ERROR]", error);
        return res.status(500).json(errorResponse("INTERNAL_ERROR", "Failed to fetch payment details"));
    }
}
