export interface Booking {
    id: string;
    treatmentId: string;
    slotId: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    status: "pending" | "confirmed" | "cancelled" | "completed";
    dateTime: string;
    price: number;
}

export interface Slot {
    id: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    holdExpiresAt?: string;
}
