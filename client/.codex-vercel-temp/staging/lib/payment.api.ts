import { api } from "./api";

const CREDS = { credentials: "include" as RequestCredentials };

export interface CreateOrderPayload {
    slotId: string;
    treatmentId: string;
    amount: number;
}

export interface CreateOrderResponse {
    orderId: string;
    amount: number;
    currency: string;
    sessionId: string;
    idempotencyKey: string;
    expiresAt: string;
}

export interface VerifyPaymentPayload {
    orderId: string;
    slotId: string;
    treatmentId: string;
    sessionId: string;
    idempotencyKey: string;
}

export interface VerifyPaymentResponse {
    success: boolean;
    bookingId?: string;
    message?: string;
}

export interface BookingDetailsResponse {
    bookingId: string;
    treatmentTitle: string;
    treatmentPrice: number;
    specialistName: string;
    date: string;
    startTime: string;
    status: string;
}

export const createOrder = (payload: CreateOrderPayload) =>
    api.post<CreateOrderResponse>("/api/payments/create-order", payload, CREDS);

export const verifyPayment = (payload: VerifyPaymentPayload) =>
    api.post<VerifyPaymentResponse>("/api/payments/verify", payload, CREDS);

export const getBookingDetails = (bookingId: string) =>
    api.get<BookingDetailsResponse>(`/api/payments/booking/${bookingId}`, CREDS);
