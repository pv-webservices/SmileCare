"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Bell,
    Clock,
    MapPin,
    CalendarPlus,
    Briefcase,
    FileDown,
    FileText,
    CreditCard,
    ImageIcon,
    Headphones,
    Receipt,
    Loader2,
    XCircle,
    CheckCircle2,
    AlertTriangle,
    RefreshCw,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { getLocalUpcomingBookings, getLocalBookings, LocalBooking } from "@/lib/booking-storage";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Mock Fallbacks ──────────────────────────────────────────────────────────
const mockProfile = {
    name: "Alex Sterling",
    email: "alex@smilecare.com",
};

const mockUpcoming = [
    {
        id: "u1",
        treatment: "Orthodontic Adjustment",
        doctor: "Dr. Julian Thorne",
        date: new Date(Date.now() + 86400000).toISOString(),
        startTime: "10:00 AM",
        status: "confirmed",
        treatmentImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHC_LZZbAXz_CsPMjrDEua0XDRyXwXOLyk5RKbMffTjx4twl8BozYK1oyJzFZyKjHSLn_8EoKbUzukp0v3C9GhVuKpOOAJMNbPY8m2uuU1LuHVwZT_HBw2rTW4B_EYvOfGooAMlO00qptfOGWhMXHKMan55JsQZYHjUNXdEcNbj9M244LcP4-auI9X-TyjrladchrktP91mTgQzC466L6LIPFOjR0mOsbHAn39w9zlvEajBOgCKn6jCFKYWTAGtkP-XauAVrQmMoNt",
        specialization: "Orthodontics",
    },
];

const mockHistory = [
    { id: "h1", treatment: "Deep Cleaning & Polish", doctor: "Dr. Sarah Laine", date: "2023-10-12", startTime: "09:00 AM", status: "completed", paymentAmount: 15000, paymentStatus: "captured" },
    { id: "h2", treatment: "Invisalign Scan", doctor: "Dr. Julian Thorne", date: "2023-09-05", startTime: "10:30 AM", status: "completed", paymentAmount: 25000, paymentStatus: "captured" },
    { id: "h3", treatment: "Initial Consultation", doctor: "Dr. Julian Thorne", date: "2023-08-14", startTime: "02:00 PM", status: "completed", paymentAmount: 5000, paymentStatus: "captured" },
];

const mockDocs = [
    { id: "1", name: "Post-Op Guide.pdf", type: "Care Instructions", size: "1.2 MB" },
    { id: "2", name: "Annual_Invoice_2023.pdf", type: "Billing Statement", size: "840 KB" },
    { id: "3", name: "X-Ray_Results_Sep.zip", type: "Imaging Data", size: "15.4 MB" },
];

const docIcons: Record<string, typeof FileText> = {
    "Care Instructions": FileText,
    "Billing Statement": CreditCard,
    "Imaging Data": ImageIcon,
};

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

import Modal from "@/components/ui/Modal";
import { updateLocalBookingStatus } from "@/lib/booking-storage";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

// ─── Inline Reschedule Panel ─────────────────────────────────────────────────

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface RescheduleSlot {
    id: string;
    startTime: string;
    isAvailable: boolean;
}

function InlineReschedulePanel({
    appointmentId,
    onSuccess,
    onCancel,
}: {
    appointmentId: string;
    onSuccess: () => void;
    onCancel: () => void;
}) {
    const { success: toastSuccess, error: toastError } = useToast();
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [slots, setSlots] = useState<RescheduleSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const days = Array.from({ length: daysInMonth }, (_, i) => new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1));

    // Fetch slots when date is selected
    useEffect(() => {
        if (!selectedDate) return;
        setLoadingSlots(true);
        setSlots([]);
        setSelectedSlotId(null);

        const y = selectedDate.getFullYear();
        const mo = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const dy = String(selectedDate.getDate()).padStart(2, "0");
        const dateStr = `${y}-${mo}-${dy}`;

        fetch(`${API}/api/slots?date=${dateStr}`, { credentials: "include" })
            .then((r) => r.ok ? r.json() : [])
            .then((data) => setSlots(Array.isArray(data) ? data : (data.slots || data.data || [])))
            .catch(() => setSlots([]))
            .finally(() => setLoadingSlots(false));
    }, [selectedDate]);

    const handleConfirmReschedule = async () => {
        if (!selectedDate || !selectedSlotId) return;
        setSubmitting(true);
        try {
            const y = selectedDate.getFullYear();
            const mo = String(selectedDate.getMonth() + 1).padStart(2, "0");
            const dy = String(selectedDate.getDate()).padStart(2, "0");

            const res = await fetch(`${API}/api/bookings/${appointmentId}/reschedule`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ date: `${y}-${mo}-${dy}`, slotId: selectedSlotId }),
            });
            if (res.ok) {
                toastSuccess("Appointment rescheduled successfully!");
                onSuccess();
            } else {
                const err = await res.json().catch(() => ({}));
                toastError("Reschedule Failed", err.message || "Could not reschedule. Please try again.");
            }
        } catch {
            toastError("Reschedule Failed", "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-4 bg-slate-50 rounded-2xl border border-primary/10 p-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-primary text-sm">Choose a New Date & Time</h4>
                <button onClick={onCancel} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                    Cancel
                </button>
            </div>

            {/* Mini Calendar */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-900">
                        {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </span>
                    <div className="flex gap-1">
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))} className="p-1 rounded hover:bg-slate-50">
                            <ChevronLeft size={16} className="text-slate-600" />
                        </button>
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))} className="p-1 rounded hover:bg-slate-50">
                            <ChevronRight size={16} className="text-slate-600" />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-1">
                    {DAYS_SHORT.map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-bold text-slate-400 h-6 flex items-center justify-center">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                    {days.map(day => {
                        const isSelected = selectedDate?.toDateString() === day.toDateString();
                        const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                        return (
                            <button
                                key={day.toISOString()}
                                disabled={isPast}
                                onClick={() => setSelectedDate(day)}
                                className={`h-8 w-8 text-xs font-bold rounded-lg transition-all ${isSelected ? "bg-primary text-white" :
                                    isPast ? "text-slate-200 cursor-not-allowed" :
                                        "text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                {day.getDate()}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Available Slots */}
            {selectedDate && (
                <div className="mb-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Available Slots</p>
                    {loadingSlots ? (
                        <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3].map(i => <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />)}
                        </div>
                    ) : slots.length === 0 ? (
                        <p className="text-sm text-slate-400">No slots available for this date.</p>
                    ) : (
                        <div className="grid grid-cols-3 gap-2">
                            {slots.filter(s => s.isAvailable !== false).map(slot => (
                                <button
                                    key={slot.id}
                                    onClick={() => setSelectedSlotId(slot.id)}
                                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${selectedSlotId === slot.id
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-primary/30"
                                        }`}
                                >
                                    {slot.startTime}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Confirm Reschedule Button */}
            <button
                onClick={handleConfirmReschedule}
                disabled={!selectedDate || !selectedSlotId || submitting}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <CalendarDays size={16} />}
                {submitting ? "Rescheduling..." : "Confirm Reschedule"}
            </button>
        </div>
    );
}

// ─── Dashboard Page ──────────────────────────────────────────────────────────

export default function DashboardPage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<AnyRecord>(mockProfile as AnyRecord);
    const [upcoming, setUpcoming] = useState<AnyRecord[]>([]);
    const [history, setHistory] = useState<AnyRecord[]>([]);
    const [docs, setDocs] = useState<AnyRecord[]>(mockDocs as AnyRecord[]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    // Cancel modal state
    const [cancelTarget, setCancelTarget] = useState<AnyRecord | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [cancelSuccess, setCancelSuccess] = useState(false);

    // Reschedule state
    const [rescheduleTargetId, setRescheduleTargetId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [pRes, uRes, hRes, dRes, nRes] = await Promise.all([
                    fetch(`${API}/api/patient/me`, { credentials: "include" }).catch(() => null),
                    fetch(`${API}/api/bookings/my?status=upcoming`, { credentials: "include" }).catch(() => null),
                    fetch(`${API}/api/bookings/my?status=history`, { credentials: "include" }).catch(() => null),
                    fetch(`${API}/api/patient/documents`, { credentials: "include" }).catch(() => null),
                    fetch(`${API}/api/notifications`, { credentials: "include" }).catch(() => null),
                ]);

                if (pRes?.ok) {
                    setProfile(await pRes.json());
                } else if (user) {
                    setProfile({
                        name: user.name,
                        email: user.email,
                    });
                }

                const serverUp = uRes?.ok ? (await uRes.json()) : [];
                const serverHist = hRes?.ok ? (await hRes.json()) : [];
                const localUp = getLocalUpcomingBookings();
                const localHist = getLocalBookings();

                const mergedUp = [
                    ...serverUp,
                    ...localUp.filter((l: LocalBooking) => !serverUp.some((s: AnyRecord) => s.id === l.id)),
                ];
                const mergedHist = serverHist.length > 0 ? serverHist : localHist;

                setUpcoming(mergedUp.length > 0 ? mergedUp : mockUpcoming);
                setHistory(mergedHist.length > 0 ? mergedHist.slice(0, 3) : mockHistory.slice(0, 3));

                if (dRes?.ok) { const d = await dRes.json(); setDocs(d.slice(0, 3)); }

                if (nRes?.ok) {
                    const notifs = await nRes.json();
                    const data = Array.isArray(notifs) ? notifs : (notifs.data || []);
                    setUnreadCount(data.filter((n: Record<string, unknown>) => !n.isRead).length);
                }
            } catch { /* fallback to mock */ }
            setLoading(false);
        };
        load();
    }, [user]);

    const handleCancelConfirm = async () => {
        if (!cancelTarget) return;
        setCancelling(true);
        try {
            await fetch(`${API}/api/bookings/${cancelTarget.id}/cancel`, {
                method: "DELETE",
                credentials: "include",
            }).catch(() => null);
            updateLocalBookingStatus(cancelTarget.id as string, "cancelled");
            setUpcoming((prev) =>
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

    const handleRescheduleSuccess = () => {
        setRescheduleTargetId(null);
        // Refresh upcoming appointments
        window.location.reload();
    };

    const first = upcoming[0];

    return (
        <>
            {/* Sticky Header */}
            <header className="sticky top-0 z-40 bg-background-light/80 backdrop-blur-md border-b border-primary/5 px-4 sm:px-8 py-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="font-display text-3xl font-bold text-primary tracking-tight">
                            Welcome back, {(profile.name as string)?.split(" ")[0] || "Alex"}
                        </h2>
                        <p className="text-primary/90 mt-1 font-sans">
                            Your next smile transformation is just around the corner.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="size-10 flex items-center justify-center rounded-full bg-white border border-primary/10 text-primary/90 hover:text-primary transition-colors relative">
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <Loader2 size={32} className="animate-spin text-primary" />
                </div>
            ) : (
                <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8">

                    {/* Upcoming Appointment */}
                    {first && (
                        <section>
                            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                <CalendarPlus size={20} className="text-primary" />
                                Upcoming Appointment
                            </h3>
                            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-primary/5 flex flex-col md:flex-row">
                                <div className="md:w-1/3 relative h-48 md:h-auto min-h-[200px]">
                                    <Image
                                        src={(first.treatmentImage as string) || "https://lh3.googleusercontent.com/aida-public/AB6AXuBHC_LZZbAXz_CsPMjrDEua0XDRyXwXOLyk5RKbMffTjx4twl8BozYK1oyJzFZyKjHSLn_8EoKbUzukp0v3C9GhVuKpOOAJMNbPY8m2uuU1LuHVwZT_HBw2rTW4B_EYvOfGooAMlO00qptfOGWhMXHKMan55JsQZYHjUNXdEcNbj9M244LcP4-auI9X-TyjrladchrktP91mTgQzC466L6LIPFOjR0mOsbHAn39w9zlvEajBOgCKn6jCFKYWTAGtkP-XauAVrQmMoNt"}
                                        alt="Clinic"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                        <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                            {first.status as string}
                                        </span>
                                    </div>
                                </div>
                                <div className="md:w-2/3 p-6 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-xl font-bold text-primary">{first.treatment as string}</h4>
                                            <div className="flex flex-col gap-2 mt-3">
                                                <div className="flex items-center gap-2 text-primary/60">
                                                    <Clock size={16} className="text-primary shrink-0" />
                                                    <span className="text-sm font-medium">
                                                        {formatDate(first.date as string)} at {first.startTime as string} • {first.doctor as string}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-primary/60">
                                                    <MapPin size={16} className="text-primary shrink-0" />
                                                    <span className="text-sm">SmileCare Premium Clinic, 5th Avenue</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-primary/5 p-3 rounded-xl hidden sm:block">
                                            <Briefcase size={28} className="text-primary" />
                                        </div>
                                    </div>
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <button
                                            onClick={() => setCancelTarget(first)}
                                            className="flex items-center gap-2 text-red-500 bg-red-50 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
                                        >
                                            <XCircle size={16} /> Cancel
                                        </button>
                                        <button
                                            onClick={() => setRescheduleTargetId(rescheduleTargetId === (first.id as string) ? null : (first.id as string))}
                                            className="flex items-center gap-2 text-primary bg-primary/5 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/10 transition-colors"
                                        >
                                            <RefreshCw size={16} /> Reschedule
                                        </button>
                                    </div>

                                    {/* Inline Reschedule Panel */}
                                    {rescheduleTargetId === (first.id as string) && (
                                        <InlineReschedulePanel
                                            appointmentId={first.id as string}
                                            onSuccess={handleRescheduleSuccess}
                                            onCancel={() => setRescheduleTargetId(null)}
                                        />
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {!first && (
                        <div className="bg-white rounded-2xl border-2 border-dashed border-primary/15 p-10 text-center">
                            <CalendarPlus size={40} className="text-primary/20 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-primary mb-2">
                                No Upcoming Appointments
                            </h3>
                            <p className="text-primary/90 text-sm mb-6">
                                Book your next visit with one of our world-class specialists.
                            </p>
                            <Link
                                href="/booking"
                                className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                            >
                                Book Appointment
                            </Link>
                        </div>
                    )}

                    {/* Grid: History + Documents */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:p-8">
                        {/* Treatment History */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                                    <Receipt size={20} className="text-primary" /> Treatment History
                                </h3>
                                <Link href="/dashboard/history" className="text-primary text-sm font-bold hover:underline">View All</Link>
                            </div>
                            <div className="bg-white rounded-2xl border border-primary/5 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-primary/5">
                                            <th className="px-6 py-4 text-[11px] font-bold text-primary/90 uppercase tracking-widest">Date</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-primary/90 uppercase tracking-widest">Treatment</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-primary/90 uppercase tracking-widest text-center">Status</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-primary/90 uppercase tracking-widest text-right">Invoice</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-primary/5">
                                        {history.map((row) => (
                                            <tr key={row.id as string} className="hover:bg-primary/[0.02] transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-primary/70">{formatDate(row.date as string)}</td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-primary">{row.treatment as string}</p>
                                                    <p className="text-xs text-primary/90">{row.doctor as string}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter ${(row.status as string) === "completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                        }`}>
                                                        {row.status as string}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-primary/30 hover:text-primary transition-colors">
                                                        <FileDown size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Documents + Help */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                                <FileText size={20} className="text-primary" /> Clinical Documents
                            </h3>
                            <div className="space-y-3">
                                {docs.map((doc) => {
                                    const Icon = docIcons[doc.type as string] || FileText;
                                    return (
                                        <div key={doc.id as string} className="bg-white p-4 rounded-2xl border border-primary/5 flex items-center gap-4 group hover:border-primary/20 transition-all cursor-pointer">
                                            <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Icon size={22} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-primary truncate">{doc.name as string}</p>
                                                <p className="text-[10px] text-primary/90">{doc.type as string} • {doc.size as string}</p>
                                            </div>
                                            <FileDown size={18} className="text-primary/20 group-hover:text-primary transition-colors shrink-0" />
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 p-6 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden">
                                <div className="relative z-10">
                                    <h4 className="text-sm font-bold text-primary mb-1">Need help with your plan?</h4>
                                    <p className="text-xs text-primary/90 mb-4 leading-relaxed">Our clinical advisors are available for direct messaging.</p>
                                    <Link href="/dashboard/support" className="block w-full text-center bg-white text-primary text-[11px] font-bold uppercase tracking-wider py-2.5 rounded-lg shadow-sm hover:bg-primary hover:text-white transition-colors">
                                        Message Care Team
                                    </Link>
                                </div>
                                <Headphones size={80} className="absolute -bottom-3 -right-3 text-primary/10 -rotate-12" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Cancel Confirmation Modal ─────────────────────────────── */}
            <Modal
                open={!!cancelTarget}
                onClose={() => !cancelling && setCancelTarget(null)}
                title="Cancel Appointment"
                description={
                    cancelTarget
                        ? `Are you sure you want to cancel your ${cancelTarget.treatment} appointment on ${formatDate(cancelTarget.date as string)} at ${cancelTarget.startTime}?`
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
        </>
    );
}

