"use client";

import type { PatientDetails } from "@/components/booking/PatientDetailsStep";

const PENDING_BOOKING_KEY = "pendingBooking";
const PAYMENT_SESSION_KEY = "smilecare_payment";

export interface PendingBooking {
    currentStep: number;
    callbackUrl: string;
    sessionId: string;
    holdExpiresAt?: string | null;
    treatment: {
        id: string;
        name: string;
        priceRange: string;
    } | null;
    specialist: {
        id: string;
        name: string;
        specialization?: string;
    } | null;
    date: string | null;
    timeSlot: {
        id: string;
        startTime: string;
        endTime?: string;
    } | null;
    patientDetails: PatientDetails | null;
}

export interface PaymentSession {
    orderId?: string;
    amount: number;
    currency?: string;
    slotId: string;
    treatmentId: string;
    sessionId: string;
    idempotencyKey: string;
    callbackUrl: string;
    treatment: { id: string; title: string; price: number; duration?: number };
    specialist: { id: string; name: string; specialty?: string } | null;
    slot: { id: string; startTime: string; endTime?: string };
    date: string;
    patient: PatientDetails | null;
}

function safeRead<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = sessionStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

function safeWrite(key: string, value: unknown) {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(key, JSON.stringify(value));
}

export function getPendingBooking(): PendingBooking | null {
    return safeRead<PendingBooking>(PENDING_BOOKING_KEY);
}

export function setPendingBooking(value: PendingBooking) {
    safeWrite(PENDING_BOOKING_KEY, value);
}

export function clearPendingBooking() {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(PENDING_BOOKING_KEY);
}

export function getPaymentSession(): PaymentSession | null {
    return safeRead<PaymentSession>(PAYMENT_SESSION_KEY);
}

export function setPaymentSession(value: PaymentSession) {
    safeWrite(PAYMENT_SESSION_KEY, value);
}

export function clearPaymentSession() {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(PAYMENT_SESSION_KEY);
}
