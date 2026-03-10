import { api } from "./api";

const CREDS = { credentials: "include" as RequestCredentials };

// ── Types matching the ACTUAL Prisma schema ────────────────────────────────

export interface Treatment {
    id: string;
    name: string;           // NOT "title" — schema field is "name"
    description: string;
    priceRange: string;     // NOT price: number — it's a string like "$299"
    imageUrl?: string | null;
    category?: { name: string };
}

export interface Specialist {
    id: string;
    name: string;           // comes from User.name via JOIN
    specialization: string; // NOT "specialty" — schema field is "specialization"
    photoUrl?: string | null;
}

export interface Slot {
    id: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    period?: string;        // enriched by slot.service.ts
}

export interface HoldResponse {
    success: boolean;
    data?: {
        id: string;
        holdExpiresAt?: string;
        message?: string;
    };
    expiresAt?: string;
}

export interface BookingPayload {
    slotId: string;
    treatmentId: string;
    sessionId: string;
    idempotencyKey: string;
    notes?: string;
}

export interface BookingResponse {
    id: string;
    status: string;
    message?: string;
}

// ── API Functions ──────────────────────────────────────────────────────────

export const getTreatments = async (): Promise<Treatment[]> => {
    const res = await api.get<any>("/api/treatments", CREDS);
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    return [];
};

export const getSpecialists = async (): Promise<Specialist[]> => {
    const res = await api.get<any>("/api/dentists", CREDS);
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    return [];
};

export const getSlots = async (dentistId: string, date: string): Promise<Slot[]> => {
    const res = await api.get<any>(
        `/api/slots?dentistId=${dentistId}&date=${date}`,
        CREDS
    );
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    return [];
};

export const holdSlot = (slotId: string, sessionId: string) =>
    api.post<HoldResponse>(`/api/slots/${slotId}/hold`, { sessionId }, CREDS);

export const createBooking = (payload: BookingPayload) =>
    api.post<BookingResponse>("/api/bookings", payload, CREDS);
