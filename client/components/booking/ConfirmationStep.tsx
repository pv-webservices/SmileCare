"use client";

import { useState, useEffect } from "react";
import {
    Stethoscope,
    UserRound,
    CalendarDays,
    Clock,
    User,
    Phone,
    Mail,
    MessageSquare,
    Edit2,
    Loader2,
    ArrowRight,
    ShieldCheck,
    Timer,
} from "lucide-react";
import type { PatientDetails } from "@/components/booking/PatientDetailsStep";

interface ConfirmationStepProps {
    treatment: { name: string; priceRange: string } | null;
    specialist: { name: string; specialization?: string } | null;
    date: Date | null;
    slot: { startTime: string } | null;
    patientDetails: PatientDetails | null;
    holdExpiresAt: Date | null;
    isSubmitting: boolean;
    onConfirm: () => void;
    onEdit: (step: number) => void;
}

function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-4">
            <div className="size-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={16} className="text-primary" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    {label}
                </p>
                <p className="font-semibold text-slate-900 text-sm">{value}</p>
            </div>
        </div>
    );
}

export default function ConfirmationStep({
    treatment,
    specialist,
    date,
    slot,
    patientDetails,
    holdExpiresAt,
    isSubmitting,
    onConfirm,
    onEdit,
}: ConfirmationStepProps) {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        if (!holdExpiresAt) { setTimeLeft(null); return; }
        const tick = () => {
            const diff = Math.max(
                0,
                Math.floor((new Date(holdExpiresAt).getTime() - Date.now()) / 1000)
            );
            setTimeLeft(diff);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [holdExpiresAt]);

    const parsedPrice = treatment?.priceRange
        ? parseInt(treatment.priceRange.replace(/[^0-9]/g, ""), 10) || 0
        : 0;

    const formattedDate = date
        ? date.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "—";

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-2">
                    Step 5 of 5
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-black text-slate-900 mb-3">
                    Review Your Booking
                </h2>
                <p className="text-slate-500 text-base leading-relaxed">
                    Please review all details before proceeding to payment.
                </p>
            </div>

            {/* Hold timer */}
            {holdExpiresAt && timeLeft !== null && (
                <div
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-6 text-sm font-bold border ${timeLeft < 60
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                >
                    <Timer size={16} className="shrink-0" />
                    <span>
                        Slot held for{" "}
                        <span className="tabular-nums">
                            {Math.floor(timeLeft / 60)}:
                            {(timeLeft % 60).toString().padStart(2, "0")}
                        </span>
                        {" "}— complete payment before it expires
                    </span>
                </div>
            )}

            <div className="space-y-5">
                {/* Appointment card */}
                <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900">Appointment</h3>
                        <button
                            type="button"
                            onClick={() => onEdit(1)}
                            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:opacity-75 transition-opacity"
                        >
                            <Edit2 size={13} /> Edit
                        </button>
                    </div>
                    <div className="px-8 py-6 grid sm:grid-cols-2 gap-6">
                        <InfoRow icon={Stethoscope} label="Treatment" value={treatment?.name ?? "—"} />
                        <InfoRow
                            icon={UserRound}
                            label="Specialist"
                            value={
                                specialist
                                    ? `${specialist.name}${specialist.specialization ? ` · ${specialist.specialization}` : ""}`
                                    : "—"
                            }
                        />
                        <InfoRow icon={CalendarDays} label="Date" value={formattedDate} />
                        <InfoRow icon={Clock} label="Time" value={slot?.startTime ?? "—"} />
                    </div>
                </div>

                {/* Patient details card */}
                <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900">Your Details</h3>
                        <button
                            type="button"
                            onClick={() => onEdit(4)}
                            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:opacity-75 transition-opacity"
                        >
                            <Edit2 size={13} /> Edit
                        </button>
                    </div>
                    <div className="px-8 py-6 grid sm:grid-cols-2 gap-6">
                        <InfoRow icon={User} label="Name" value={patientDetails?.name ?? "—"} />
                        <InfoRow icon={Phone} label="Phone" value={patientDetails?.phone ?? "—"} />
                        <InfoRow icon={Mail} label="Email" value={patientDetails?.email ?? "—"} />
                        {patientDetails?.notes && (
                            <InfoRow icon={MessageSquare} label="Notes" value={patientDetails.notes} />
                        )}
                    </div>
                </div>

                {/* Price card */}
                <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                            {treatment?.name ?? "Treatment"}
                        </span>
                        <span className="font-bold text-slate-900">
                            {treatment?.priceRange
                                ? treatment.priceRange.replace(/[$£€]/g, "₹")
                                : "—"}
                        </span>
                    </div>
                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                        <span className="font-display text-xl font-bold text-slate-900">Total Due</span>
                        <span className="font-display text-4xl font-black text-primary">
                            {parsedPrice > 0
                                ? `₹${parsedPrice.toLocaleString("en-IN")}`
                                : treatment?.priceRange?.replace(/[$£€]/g, "₹") ?? "—"}
                        </span>
                    </div>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-3">
                    {["256-bit SSL Secured", "Instant Confirmation", "Free Cancellation 24h"].map((text) => (
                        <div
                            key={text}
                            className="flex flex-col items-center gap-2 bg-slate-50 rounded-xl p-4 text-center"
                        >
                            <ShieldCheck size={18} className="text-primary" />
                            <span className="text-[10px] font-bold text-slate-500 leading-tight">{text}</span>
                        </div>
                    ))}
                </div>

                {/* Confirm CTA */}
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isSubmitting}
                    className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl flex items-center justify-center gap-3 ${isSubmitting
                        ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                        : "bg-primary text-white hover:opacity-90 shadow-primary/20 active:scale-[0.98]"
                        }`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Redirecting to Payment...
                        </>
                    ) : (
                        <>
                            Confirm & Proceed to Payment
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>

                <p className="text-center text-[10px] text-slate-400 font-medium leading-relaxed">
                    By confirming, you agree to our{" "}
                    <a href="#" className="underline">Cancellation Policy</a>{" "}
                    and elite clinical standards.
                </p>
            </div>
        </div>
    );
}
