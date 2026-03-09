"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    CalendarDays,
    Clock,
    MapPin,
    XCircle,
    RefreshCw,
    CalendarPlus,
    Loader2,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";
import {
    getLocalUpcomingBookings,
    getLocalHistoryBookings,
    updateLocalBookingStatus,
    type LocalBooking,
} from "@/lib/booking-storage";
import Modal from "@/components/ui/Modal";
import { BookingCardSkeleton } from "@/components/ui/Skeleton";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<any[]>(
        () => (typeof window !== "undefined" ? [...getLocalUpcomingBookings(), ...getLocalHistoryBookings()] : [])
    );
    const [loading, setLoading] = useState(true);

    // Cancel modal state
    const [cancelTarget, setCancelTarget] = useState<LocalBooking | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [cancelSuccess, setCancelSuccess] = useState(false);

    // Reschedule modal state
    const [rescheduleTarget, setRescheduleTarget] = useState<LocalBooking | null>(null);

    useEffect(() => {
        const load = async () => {
            const localUp = getLocalUpcomingBookings();
            const localHist = getLocalHistoryBookings();

            try {
                const [uRes, hRes] = await Promise.all([
                    fetch(`${API}/api/bookings/my?status=upcoming`, { credentials: "include" }).catch(() => null),
                    fetch(`${API}/api/bookings/my?status=history`, { credentials: "include" }).catch(() => null),
                ]);

                const serverUp = uRes?.ok ? await uRes.json() : [];
                const serverHist = hRes?.ok ? await hRes.json() : [];

                const mergedUp = [
                    ...serverUp,
                    ...localUp.filter((l: any) => !serverUp.some((s: any) => s.id === l.id)),
                ];
                const mergedHist = [
                    ...serverHist,
                    ...localHist.filter((l: any) => !serverHist.some((s: any) => s.id === l.id)),
                ];

                setAppointments([...mergedUp, ...mergedHist]);
            } catch {
                setAppointments([...localUp, ...localHist]);
            }
            setLoading(false);
        };
        load();
    }, []);

    const handleCancelConfirm = async () => {
        if (!cancelTarget) return;
        setCancelling(true);
        try {
            await fetch(`${API}/api/bookings/${cancelTarget.id}/cancel`, {
                method: "DELETE",
                credentials: "include",
            }).catch(() => null);
            updateLocalBookingStatus(cancelTarget.id, "cancelled");
            setAppointments((prev) =>
                prev.filter((a) => a.id !== cancelTarget.id)
            );
            setCancelSuccess(true);
            setTimeout(() => {
                setCancelSuccess(false);
                setCancelTarget(null);
            }, 1800);
        } catch {
            setCancelling(false);
        }
        setCancelling(false);
    };

    return (
        <>
            <header className="sticky top-0 z-40 bg-background-light/80 backdrop-blur-md border-b border-primary/5 px-4 sm:px-8 py-6">
                <h2 className="font-display text-3xl font-bold text-primary tracking-tight flex items-center gap-3">
                    <CalendarDays size={28} /> Appointments
                </h2>
                <p className="text-primary/90 mt-1">
                    {appointments.length} scheduled
                </p>
            </header>

            {loading && appointments.length === 0 ? (
                <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-4">
                    <BookingCardSkeleton />
                    <BookingCardSkeleton />
                </div>
            ) : appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-primary/90">
                    <CalendarDays size={64} className="mb-4" />
                    <p className="text-lg font-bold">No appointments found</p>
                    <p className="text-sm">Book a new appointment to get started.</p>
                    <Link
                        href="/booking"
                        className="mt-6 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 text-sm"
                    >
                        Book Appointment
                    </Link>
                </div>
            ) : (
                <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-4">
                    {appointments.map((apt) => (
                        <div
                            key={apt.id}
                            className="bg-white rounded-2xl border border-primary/5 p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-primary">
                                        {apt.treatment}
                                    </h3>
                                    <div className="flex flex-col gap-2 mt-3">
                                        <div className="flex items-center gap-2 text-primary/60">
                                            <Clock size={16} className="text-primary shrink-0" />
                                            <span className="text-sm font-medium">
                                                {formatDate(apt.date)} • {apt.startTime}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-primary/60">
                                            <MapPin size={16} className="text-primary shrink-0" />
                                            <span className="text-sm">
                                                {apt.doctor}
                                                {apt.specialization
                                                    ? ` · ${apt.specialization}`
                                                    : ""}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                    {apt.status}
                                </span>
                            </div>

                            <div className="mt-5 flex gap-3 border-t border-primary/5 pt-4">
                                <button
                                    onClick={() => setCancelTarget(apt)}
                                    className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
                                >
                                    <XCircle size={16} /> Cancel
                                </button>
                                <button
                                    onClick={() => setRescheduleTarget(apt)}
                                    className="flex items-center gap-2 text-primary bg-primary/5 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/10 transition-colors"
                                >
                                    <RefreshCw size={16} /> Reschedule
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Cancel Confirmation Modal ─────────────────────────────── */}
            <Modal
                open={!!cancelTarget}
                onClose={() => !cancelling && setCancelTarget(null)}
                title="Cancel Appointment"
                description={
                    cancelTarget
                        ? `Are you sure you want to cancel your ${cancelTarget.treatment} appointment on ${formatDate(cancelTarget.date)} at ${cancelTarget.startTime}?`
                        : ""
                }
                size="sm"
            >
                {cancelSuccess ? (
                    <div className="flex flex-col items-center gap-3 py-4">
                        <CheckCircle2 size={40} className="text-green-500" />
                        <p className="font-bold text-slate-900">
                            Appointment Cancelled
                        </p>
                        <p className="text-sm text-slate-500 text-center">
                            Your appointment has been cancelled successfully.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 mb-6">
                            <AlertTriangle
                                size={18}
                                className="text-amber-600 shrink-0 mt-0.5"
                            />
                            <p className="text-sm text-amber-700">
                                Cancellations made less than 24 hours before the
                                appointment may not be eligible for a refund.
                            </p>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setCancelTarget(null)}
                                disabled={cancelling}
                                className="px-5 py-2.5 text-sm font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Keep Appointment
                            </button>
                            <button
                                onClick={handleCancelConfirm}
                                disabled={cancelling}
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {cancelling ? (
                                    <Loader2 size={15} className="animate-spin" />
                                ) : (
                                    <XCircle size={15} />
                                )}
                                {cancelling ? "Cancelling..." : "Yes, Cancel"}
                            </button>
                        </div>
                    </>
                )}
            </Modal>

            {/* ── Reschedule Modal ──────────────────────────────────────── */}
            <Modal
                open={!!rescheduleTarget}
                onClose={() => setRescheduleTarget(null)}
                title="Reschedule Appointment"
                description={
                    rescheduleTarget
                        ? `Rescheduling: ${rescheduleTarget.treatment} with ${rescheduleTarget.doctor}`
                        : ""
                }
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed">
                        To reschedule, you'll be taken to the booking page
                        where you can choose a new date and time with the
                        same specialist.
                    </p>
                    <div className="bg-primary/5 rounded-xl p-4 space-y-2">
                        <p className="text-xs font-bold text-primary/90 uppercase tracking-wider">
                            Current Appointment
                        </p>
                        <p className="text-sm font-bold text-primary">
                            {rescheduleTarget?.treatment}
                        </p>
                        <p className="text-sm text-primary/60">
                            {rescheduleTarget?.date
                                ? formatDate(rescheduleTarget.date)
                                : ""}{" "}
                            at {rescheduleTarget?.startTime}
                        </p>
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                        <button
                            onClick={() => setRescheduleTarget(null)}
                            className="px-5 py-2.5 text-sm font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Keep Current
                        </button>
                        <Link
                            href="/booking"
                            onClick={() => setRescheduleTarget(null)}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-primary text-white hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                        >
                            <CalendarPlus size={15} />
                            Go to Booking
                        </Link>
                    </div>
                </div>
            </Modal>
        </>
    );
}

