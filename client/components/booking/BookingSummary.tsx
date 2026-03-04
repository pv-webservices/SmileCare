"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CalendarClock, Loader2, ArrowRight, Timer } from "lucide-react";

interface BookingSummaryProps {
    treatment: { name: string; priceRange: string } | null;
    specialist: { name: string } | null;
    date: Date | null;
    slot: { startTime: string } | null;
    holdExpiresAt: Date | null;
    onConfirm: () => void;
    isSubmitting: boolean;
    onHoldExpired: () => void;
}

export default function BookingSummary({
    treatment,
    specialist,
    date,
    slot,
    holdExpiresAt,
    onConfirm,
    isSubmitting,
    onHoldExpired,
}: BookingSummaryProps) {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        if (!holdExpiresAt) {
            setTimeLeft(null);
            return;
        }

        const tick = () => {
            const now = Date.now();
            const expires = new Date(holdExpiresAt).getTime();
            const diff = Math.max(0, Math.floor((expires - now) / 1000));
            setTimeLeft(diff);
            if (diff === 0) {
                clearInterval(interval);
                onHoldExpired();
            }
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [holdExpiresAt, onHoldExpired]);

    const formatCountdown = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    // Parse price from priceRange string — e.g. "₹12,000" or "12000"
    const parsedPrice =
        treatment?.priceRange
            ? parseInt(treatment.priceRange.replace(/[^0-9]/g, ""), 10) || 0
            : 0;

    const canConfirm =
        !!treatment && !!specialist && !!date && !!slot && !isSubmitting;

    return (
        <div className="sticky top-28 h-fit">
            <div className="rounded-[2rem] bg-white p-4 sm:p-8 shadow-2xl shadow-primary/5 border border-slate-50 flex flex-col gap-4 sm:p-8">
                <h3 className="text-xl font-display font-bold text-slate-900 border-b border-slate-100 pb-4">
                    Booking Summary
                </h3>

                {/* Hold countdown */}
                {holdExpiresAt && timeLeft !== null && (
                    <div
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${timeLeft < 60
                                ? "bg-red-50 text-red-600"
                                : "bg-amber-50 text-amber-700"
                            }`}
                    >
                        <Timer size={16} className="shrink-0" />
                        <span>
                            Slot held for{" "}
                            <span className="tabular-nums">
                                {formatCountdown(timeLeft)}
                            </span>
                        </span>
                    </div>
                )}

                {/* Summary rows */}
                <div className="space-y-5">
                    {/* Service */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                                Service
                            </p>
                            <p className="font-bold text-slate-700 text-sm">
                                {treatment ? treatment.name : "Not selected"}
                            </p>
                        </div>
                        {treatment && (
                            <p className="font-bold text-slate-900 text-sm">
                                {treatment.priceRange}
                            </p>
                        )}
                    </div>

                    {/* Provider */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                                Provider
                            </p>
                            <p className="font-bold text-slate-700 text-sm">
                                {specialist ? specialist.name : "Not selected"}
                            </p>
                        </div>
                        {specialist && (
                            <CheckCircle2 size={18} className="text-primary shrink-0" />
                        )}
                    </div>

                    {/* Date & Time */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                                Date & Time
                            </p>
                            <p className="font-bold text-slate-700 text-sm">
                                {date && slot
                                    ? `${date.toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })} • ${slot.startTime}`
                                    : "Not selected"}
                            </p>
                        </div>
                        {date && slot && (
                            <CalendarClock size={18} className="text-primary shrink-0" />
                        )}
                    </div>
                </div>

                {/* Price breakdown */}
                <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 uppercase tracking-widest">
                        <span>Subtotal</span>
                        <span>
                            {parsedPrice > 0
                                ? `₹${parsedPrice.toLocaleString("en-IN")}`
                                : "—"}
                        </span>
                    </div>
                    <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                        <span className="font-display font-bold text-xl text-slate-900">
                            Total
                        </span>
                        <span className="font-display text-3xl font-bold text-primary">
                            {parsedPrice > 0
                                ? `₹${parsedPrice.toLocaleString("en-IN")}`
                                : "—"}
                        </span>
                    </div>
                </div>

                {/* CTA */}
                <button
                    onClick={onConfirm}
                    disabled={!canConfirm}
                    className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-xl flex items-center justify-center gap-2 ${!canConfirm
                            ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                            : "bg-primary text-white hover:opacity-90 shadow-primary/20 active:scale-[0.98]"
                        }`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Redirecting to Payment...
                        </>
                    ) : (
                        <>
                            Proceed to Payment
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>

                <p className="text-center text-[10px] text-slate-700 font-medium leading-relaxed">
                    By confirming, you agree to our{" "}
                    <a href="#" className="underline">
                        Cancellation Policy
                    </a>{" "}
                    and elite clinical standards.
                </p>
            </div>
        </div>
    );
}
