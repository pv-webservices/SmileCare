import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { createBooking } from "../booking/booking.service";
import { sendBookingConfirmation, createNotificationRecord } from "../notification/notification.service";
import { awardBookingPoints } from "../loyalty/loyalty.service";
import {
    CreateOrderBody,
    VerifyPaymentBody,
    MockOrder,
    PaymentError,
} from "./payment.types";
import Razorpay from "razorpay";
import crypto from "crypto";

const PAYMENT_MODE = process.env.PAYMENT_MODE || "mock";
let razorpayClient: Razorpay | null = null;

if (PAYMENT_MODE === "razorpay") {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
        console.error(
            "[PAYMENT] PAYMENT_MODE=razorpay but RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Falling back to mock mode."
        );
    } else {
        razorpayClient = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
        console.log("[PAYMENT] Razorpay live mode enabled");
    }
} else {
    console.log("[PAYMENT] Mock payment mode active");
}

const pendingOrders = new Map<string, MockOrder>();
const ORDER_TTL_MS = 30 * 60 * 1000;

function cleanExpiredOrders() {
    const now = Date.now();
    for (const [key, order] of pendingOrders) {
        if (now - order.createdAt.getTime() > ORDER_TTL_MS) {
            pendingOrders.delete(key);
        }
    }
}

async function ensureSlotCanBeFinalized(
    tx: Prisma.TransactionClient,
    slotId: string,
    sessionId: string
) {
    const slot = await tx.slot.findUnique({ where: { id: slotId } });
    if (!slot) {
        throw new PaymentError("SLOT_NOT_FOUND", "Slot not found");
    }

    if (!slot.isAvailable && slot.heldBySessionId !== sessionId) {
        throw new PaymentError("SLOT_NOT_AVAILABLE", "Slot not available");
    }

    await tx.slot.update({
        where: { id: slotId },
        data: {
            heldBySessionId: sessionId,
            holdExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
    });
}

export async function createOrder(input: CreateOrderBody) {
    if (PAYMENT_MODE === "razorpay" && razorpayClient) {
        return createRazorpayOrder(input);
    }
    return createMockOrder(input);
}

async function createRazorpayOrder(input: CreateOrderBody) {
    const { slotId, treatmentId, amount } = input;

    const slot = await prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot) throw new PaymentError("SLOT_NOT_FOUND", "Slot not found");
    if (!slot.heldBySessionId) {
        throw new PaymentError("SLOT_NOT_HELD", "Slot must be held before creating a payment order");
    }

    const treatment = await prisma.treatment.findUnique({ where: { id: treatmentId } });
    if (!treatment) {
        throw new PaymentError("TREATMENT_NOT_FOUND", "Treatment not found");
    }

    const amountInPaise = Math.round(amount * 100);
    const order = await razorpayClient!.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `sc_${slotId.slice(0, 8)}_${Date.now()}`,
        notes: { slotId, treatmentId },
    });

    return {
        orderId: order.id,
        amount,
        currency: order.currency,
    };
}

export async function createMockOrder(input: CreateOrderBody) {
    const { slotId, treatmentId, amount } = input;

    if (!slotId || !treatmentId || !amount || amount <= 0) {
        throw new PaymentError(
            "VALIDATION_ERROR",
            "slotId, treatmentId, and a positive amount are required"
        );
    }

    const slot = await prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot) {
        throw new PaymentError("SLOT_NOT_FOUND", "Slot not found");
    }
    if (!slot.heldBySessionId) {
        throw new PaymentError("SLOT_NOT_HELD", "Slot must be held before creating a payment order");
    }

    const treatment = await prisma.treatment.findUnique({ where: { id: treatmentId } });
    if (!treatment) {
        throw new PaymentError("TREATMENT_NOT_FOUND", "Treatment not found");
    }

    cleanExpiredOrders();

    const orderId = `mock_order_${randomUUID()}`;
    const mockOrder: MockOrder = {
        orderId,
        slotId,
        treatmentId,
        amount,
        currency: "INR",
        createdAt: new Date(),
    };

    pendingOrders.set(orderId, mockOrder);

    return {
        orderId,
        amount,
        currency: "INR",
    };
}

export async function verifyPayment(
    input: VerifyPaymentBody & {
        razorpayPaymentId?: string;
        razorpaySignature?: string;
    },
    patientId: string
) {
    if (
        PAYMENT_MODE === "razorpay" &&
        razorpayClient &&
        input.razorpayPaymentId &&
        input.razorpaySignature
    ) {
        return verifyRazorpayPayment(
            input as Parameters<typeof verifyRazorpayPayment>[0],
            patientId
        );
    }
    return verifyMockPayment(input, patientId);
}

export async function verifyRazorpayPayment(
    input: VerifyPaymentBody & {
        razorpayPaymentId: string;
        razorpaySignature: string;
    },
    patientId: string
) {
    const {
        orderId,
        slotId,
        treatmentId,
        sessionId,
        idempotencyKey,
        amount,
        razorpayPaymentId,
        razorpaySignature,
    } = input;

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${orderId}|${razorpayPaymentId}`)
        .digest("hex");

    if (expectedSignature !== razorpaySignature) {
        throw new PaymentError(
            "SIGNATURE_INVALID",
            "Razorpay payment signature verification failed"
        );
    }

    const existingPayment = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId },
        include: { booking: { include: { slot: true, treatment: true } } },
    });
    if (existingPayment?.status === "captured") {
        return { booking: existingPayment.booking, payment: existingPayment, isIdempotent: true };
    }

    const result = await prisma.$transaction(
        async (tx) => {
            await ensureSlotCanBeFinalized(tx, slotId, sessionId);
            const bookingResult = await createBooking(
                { slotId, treatmentId, sessionId, idempotencyKey },
                patientId,
                tx
            );
            const payment = await tx.payment.create({
                data: {
                    bookingId: bookingResult.booking.id,
                    razorpayOrderId: orderId,
                    razorpayPaymentId,
                    amount: amount || 0,
                    status: "captured",
                },
            });
            return { booking: bookingResult.booking, payment, isIdempotent: bookingResult.isIdempotent };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted }
    );

    if (!result.isIdempotent) {
        void handlePostPaymentSideEffects(result.booking.id, result.payment.amount, result.booking.patientId);
    }

    return result;
}

export async function verifyMockPayment(
    input: VerifyPaymentBody,
    patientId: string
) {
    const { orderId, slotId, treatmentId, sessionId, idempotencyKey, amount } = input;

    const mockOrder = pendingOrders.get(orderId);
    if (!mockOrder) {
        throw new PaymentError("ORDER_NOT_FOUND", "Payment order was not found. Please start payment again.");
    }

    if (mockOrder.slotId !== slotId || mockOrder.treatmentId !== treatmentId) {
        throw new PaymentError(
            "ORDER_MISMATCH",
            "Order details do not match the provided slotId/treatmentId"
        );
    }

    if (Date.now() - mockOrder.createdAt.getTime() > ORDER_TTL_MS) {
        pendingOrders.delete(orderId);
        throw new PaymentError("ORDER_EXPIRED", "Payment order has expired");
    }

    const existingPayment = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId },
        include: { booking: { include: { slot: true, treatment: true } } },
    });

    if (existingPayment && existingPayment.status === "captured") {
        return {
            booking: existingPayment.booking,
            payment: existingPayment,
            isIdempotent: true,
        };
    }

    const result = await prisma.$transaction(
        async (tx) => {
            await ensureSlotCanBeFinalized(tx, slotId, sessionId);
            const bookingResult = await createBooking(
                { slotId, treatmentId, sessionId, idempotencyKey },
                patientId,
                tx
            );

            const payment = await tx.payment.create({
                data: {
                    bookingId: bookingResult.booking.id,
                    razorpayOrderId: orderId,
                    razorpayPaymentId: `mock_pay_${randomUUID()}`,
                    amount: amount || mockOrder.amount,
                    status: "captured",
                },
            });

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

    pendingOrders.delete(orderId);

    if (!result.isIdempotent) {
        void handlePostPaymentSideEffects(result.booking.id, result.payment.amount, result.booking.patientId);
    }

    return result;
}

async function handlePostPaymentSideEffects(bookingId: string, amount: number, patientId: string) {
    try {
        const fullBooking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                patient: { include: { user: true } },
                dentist: { include: { user: true } },
                treatment: true,
                slot: true,
            },
        });

        if (!fullBooking) return;

        await Promise.allSettled([
            sendBookingConfirmation({
                toEmail: fullBooking.patient.user.email,
                toName: fullBooking.patient.user.name,
                treatment: fullBooking.treatment.name,
                doctor: `Dr. ${fullBooking.dentist.user.name}`,
                date: fullBooking.slot.date.toLocaleDateString("en-IN", {
                    weekday: "short", day: "numeric", month: "short", year: "numeric",
                }),
                time: fullBooking.slot.startTime,
                bookingId: fullBooking.id,
                amount,
            }),
            createNotificationRecord(
                fullBooking.patient.userId,
                "booking_confirmation",
                "Booking Confirmed",
                `Your ${fullBooking.treatment.name} appointment is confirmed.`
            ),
            awardBookingPoints(
                patientId,
                fullBooking.id,
                amount
            ),
        ]);
    } catch (error) {
        console.error("Failed to process payment side-effects:", error);
    }
}

export async function refundMockPayment(paymentId: string, amount?: number) {
    return prisma.$transaction(
        async (tx) => {
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
                throw new PaymentError("PAYMENT_NOT_FOUND", "Payment record not found");
            }

            const payment = paymentRows[0];

            if (payment.status === "refunded") {
                const existingRefund = await tx.refund.findUnique({
                    where: { paymentId },
                });
                return { refund: existingRefund, isIdempotent: true };
            }

            if (payment.status !== "captured") {
                throw new PaymentError(
                    "INVALID_PAYMENT_STATUS",
                    `Cannot refund payment with status: ${payment.status}`
                );
            }

            const refundAmount = amount || payment.amount;

            await tx.payment.update({
                where: { id: paymentId },
                data: { status: "refunded" },
            });

            const refund = await tx.refund.create({
                data: {
                    paymentId,
                    razorpayRefundId: `mock_refund_${randomUUID()}`,
                    amount: refundAmount,
                    status: "processed",
                },
            });

            await tx.booking.update({
                where: { id: payment.bookingId },
                data: { status: "refunded" },
            });

            return { refund, isIdempotent: false };
        },
        {
            isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        }
    );
}
