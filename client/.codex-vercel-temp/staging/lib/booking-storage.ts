export interface LocalBooking {
    id: string;
    paymentId: string;
    treatment: string;
    treatmentId: string;
    doctor: string;
    specialization: string;
    date: string;
    startTime: string;
    status: "confirmed" | "pending" | "cancelled" | "completed";
    paymentAmount: number;
    paymentStatus: string;
    confirmedAt: string;
}

const STORAGE_KEY = "smilecare_confirmed_bookings";

function readStorage(): LocalBooking[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
        return [];
    }
}

function writeStorage(bookings: LocalBooking[]): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch { /* quota exceeded — silent */ }
}

/** Returns all locally saved bookings (confirmed after payment). */
export function getLocalBookings(): LocalBooking[] {
    return readStorage();
}

/** Returns only future bookings. */
export function getLocalUpcomingBookings(): LocalBooking[] {
  // Get today's date at midnight for proper comparison
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  return readStorage().filter((b) => {
    if (!b.date) return true; // No date = show in upcoming
    const bookingDate = new Date(b.date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate >= now;
  });}

/** Returns only past bookings. */
export function getLocalHistoryBookings(): LocalBooking[] {
  // Get today's date at midnight for proper comparison
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  return readStorage().filter((b) => {
    if (!b.date) return false; // No date = don't show in history
    const bookingDate = new Date(b.date);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate < now;
  });}

/** Appends a new booking. Prevents duplicate IDs. */
export function addLocalBooking(booking: LocalBooking): void {
    const existing = readStorage();
    if (existing.find((b) => b.id === booking.id)) return; // dedupe
    writeStorage([booking, ...existing]);
}

/** Updates status of an existing booking by ID. */
export function updateLocalBookingStatus(
    id: string,
    status: LocalBooking["status"]
): void {
    const all = readStorage();
    writeStorage(all.map((b) => (b.id === id ? { ...b, status } : b)));
}

/** Removes a booking by ID from local storage. */
export function removeLocalBooking(id: string): void {
    writeStorage(readStorage().filter((b) => b.id !== id));
}

/** Clears all local bookings (e.g., after syncing with server). */
export function clearLocalBookings(): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
    }
}
