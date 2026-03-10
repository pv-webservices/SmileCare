"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    CalendarCheck,
    Clock,
    MapPin,
    CheckCircle2,
    XCircle,
    Loader2,
    CalendarX,
    Receipt,
    RefreshCw,
} from "lucide-react";
import {
    getLocalUpcomingBookings,
    getLocalHistoryBookings,
    updateLocalBookingStatus,
    type LocalBooking,
} from "@/lib/booking-storage";
import { BookingCardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Tab = "upcoming" | "history";

type AnyBooking = {
    id: string;
    treatment: string;
    treatmentId?: string;
    doctor: string;
    specialization?: string;
    date: string;
    startTime: string;
    endTime?: string;
    status: string;
    paymentAmount?: number;
    paymentStatus?: string;
};

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatCurrency(amount: number) {
    return `₹${amount.toLocaleString("en-IN")}`;
}

const STATUS_STYLES: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-600",
    pending: "bg-amber-100 text-amber-700",
};

function BookingCard({ booking, onCancel }: {
    booking: AnyBooking;
    onCancel?: (id: string) => void;
}) {
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div className="bg-white rounded-2xl border border-primary/5 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-bold text-primary">
                            {booking.treatment}
                        </h3>
                        <span
                            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${STATUS_STYLES[booking.status] || "bg-gray-100 text-gray-600"
                                }`}
                        >
                            {booking.status}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary/60 text-sm">
                            <Clock size={15} className="text-primary shrink-0" />
                            <span>
                                {booking.date ? formatDate(booking.date) : "—"}
                                {booking.startTime ? ` • ${booking.startTime}` : ""}
                                {booking.endTime ? ` – ${booking.endTime}` : ""}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-primary/60 text-sm">
                            <MapPin size={15} className="text-primary shrink-0" />
                            <span>
                                {booking.doctor}
                                {booking.specialization
                                    ? ` · ${booking.specialization}`
                                    : ""}
                            </span>
                        </div>
                        {booking.paymentAmount != null && (
                            <div className="flex items-center gap-2 text-primary/60 text-sm">
                                <Receipt size={15} className="text-primary shrink-0" />
                                <span>
                                    {formatCurrency(booking.paymentAmount)} paid
                                    {booking.paymentStatus === "captured"
                                        ? " · Confirmed"
                                        : ""}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions — only for upcoming confirmed */}
            {onCancel && booking.status === "confirmed" && (
                <div className="mt-5 flex flex-wrap gap-3 border-t border-primary/5 pt-4">
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
                    >
                        <XCircle size={15} /> Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            sessionStorage.setItem(
                                "smilecare_reschedule",
                                JSON.stringify({ treatmentId: booking.treatmentId || "" })
                            );
                            window.location.href = "/booking";
                        }}
                        className="flex items-center gap-2 text-primary bg-primary/5 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/10 transition-colors"
                    >
                        <RefreshCw size={15} /> Reschedule
                    </button>
                </div>
            )}

            {showConfirm && (
                <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-sm font-medium text-red-600">
                        Are you sure you want to cancel this appointment?
                    </p>
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="px-4 py-1.5 text-sm rounded-lg bg-white border border-red-200 text-red-500 hover:bg-red-50"
                        >
                            No
                        </button>
                        <button
                            onClick={() => {
                                onCancel?.(booking.id);
                                setShowConfirm(false);
                            }}
                            className="px-4 py-1.5 text-sm rounded-lg bg-red-500 text-white font-bold hover:bg-red-600"
                        >
                            Yes, Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function BookingsPage() {
    const { success: toastSuccess } = useToast();
    const [tab, setTab] = useState<Tab>("upcoming");
    // Initialize synchronously from localStorage to avoid empty flash
    const [upcoming, setUpcoming] = useState<AnyBooking[]>(
        () => (typeof window !== "undefined"
            ? (getLocalUpcomingBookings() as AnyBooking[])
            : [])
    );
    const [history, setHistory] = useState<AnyBooking[]>(
        () => (typeof window !== "undefined"
            ? (getLocalHistoryBookings() as AnyBooking[])
            : [])
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const localUp = getLocalUpcomingBookings() as AnyBooking[];
            const localHist = getLocalHistoryBookings() as AnyBooking[];

            try {
                const [uRes, hRes] = await Promise.all([
                    fetch(`${API}/api/bookings/my?status=upcoming`, {
                        credentials: "include",
                    }).catch(() => null),
                    fetch(`${API}/api/bookings/my?status=history`, {
                        credentials: "include",
                    }).catch(() => null),
                ]);

                const serverUp = uRes?.ok ? await uRes.json() : [];
                const serverHist = hRes?.ok ? await hRes.json() : [];

                const mergedUp = [
                    ...serverUp,
                    ...localUp.filter(
                        (l: AnyBooking) => !serverUp.some((s: AnyBooking) => s.id === l.id)
                    ),
                ];
                const mergedHist = [
                    ...serverHist,
                    ...localHist.filter(
                        (l: AnyBooking) => !serverHist.some((s: AnyBooking) => s.id === l.id)
                    ),
                ];
                setUpcoming(mergedUp);
                setHistory(mergedHist);
            } catch {
                setUpcoming(localUp);
                setHistory(localHist);
            }

            setLoading(false);
        };
        load();
    }, []);

    const handleCancel = async (id: string) => {
        try {
            await fetch(`${API}/api/bookings/${id}/cancel`, {
                method: "DELETE",
                credentials: "include",
            }).catch(() => null);
        } catch { /* silent */ }
        // Persist cancellation in localStorage
        updateLocalBookingStatus(id, "cancelled");
        setUpcoming((prev) => prev.filter((a) => a.id !== id));
        toastSuccess("Booking Cancelled", "Your appointment has been cancelled.");
    };

    const shown = tab === "upcoming" ? upcoming : history;

    return (
        <>
            <header className="sticky top-0 z-40 bg-background-light/80 backdrop-blur-md border-b border-primary/5 px-4 sm:px-8 py-6">
                <h2 className="font-display text-3xl font-bold text-primary tracking-tight flex items-center gap-3">
                    <CalendarCheck size={28} /> My Bookings
                </h2>
                <p className="text-primary/90 mt-1">
                    All your appointments in one place
                </p>
            </header>

            {loading && upcoming.length === 0 && history.length === 0 ? (
                <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-4">
                    <BookingCardSkeleton />
                    <BookingCardSkeleton />
                    <BookingCardSkeleton />
                </div>
            ) : (
                <div className="p-4 sm:p-8 max-w-4xl mx-auto">

                    {/* Tabs */}
                    <div className="flex gap-1 p-1 bg-white border border-primary/5 rounded-xl mb-8 w-fit shadow-sm">
                        {(["upcoming", "history"] as Tab[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${tab === t
                                    ? "bg-primary text-white shadow-sm"
                                    : "text-primary/90 hover:text-primary/60"
                                    }`}
                            >
                                {t === "upcoming" ? "Upcoming" : "Past"}
                                {t === "upcoming" && upcoming.length > 0 && (
                                    <span className="ml-2 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {upcoming.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    {shown.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-primary/30">
                            <CalendarX size={64} className="mb-4" />
                            <p className="text-lg font-bold">
                                {tab === "upcoming"
                                    ? "No upcoming appointments"
                                    : "No booking history yet"}
                            </p>
                            <p className="text-sm mt-1">
                                {tab === "upcoming"
                                    ? "Book an appointment to get started."
                                    : "Your completed appointments will appear here."}
                            </p>
                            {tab === "upcoming" && (
                                <Link
                                    href="/booking"
                                    className="mt-6 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                                >
                                    Book Appointment
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {shown.map((booking) => (
                                <BookingCard
                                    key={booking.id}
                                    booking={booking}
                                    onCancel={tab === "upcoming" ? handleCancel : undefined}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

