"use client";

import { useEffect, useState } from "react";

interface BookingSummaryProps {
    treatment: { title: string; price: number } | null;
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
    onHoldExpired
}: BookingSummaryProps) {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        if (!holdExpiresAt) {
            setTimeLeft(null);
            return;
        }

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const expires = new Date(holdExpiresAt).getTime();
            const diff = Math.max(0, Math.floor((expires - now) / 1000));

            setTimeLeft(diff);

            if (diff === 0) {
                clearInterval(interval);
                onHoldExpired();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [holdExpiresAt, onHoldExpired]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const subtotal = treatment?.price || 0;
    const credit = subtotal > 0 ? 50 : 0; // Concierge credit demo
    const total = Math.max(0, subtotal - credit);

    return (
        <div className="sticky top-28 h-fit animate-in fade-in slide-in-from-right-4 duration-1000">
            <div className="rounded-[2rem] bg-white p-8 shadow-2xl shadow-primary/5 border border-slate-50 flex flex-col gap-8">
                <h3 className="text-xl font-display font-bold text-slate-900 border-b border-slate-50 pb-4">Booking Summary</h3>

                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Service</p>
                            <p className="font-bold text-slate-700 text-sm">{treatment ? treatment.title : "Not selected"}</p>
                        </div>
                        <p className="font-bold text-slate-900 text-sm">{treatment ? `$${treatment.price}` : "—"}</p>
                    </div>

                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Provider</p>
                            <p className="font-bold text-slate-700 text-sm">{specialist ? specialist.name : "Not selected"}</p>
                        </div>
                        {specialist && <span className="material-symbols-outlined text-primary text-lg">check_circle</span>}
                    </div>

                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">Date & Time</p>
                            <p className="font-bold text-slate-700 text-sm">
                                {date && slot
                                    ? `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${slot.startTime}`
                                    : "Not selected"}
                            </p>
                        </div>
                        {date && slot && <span className="material-symbols-outlined text-primary text-lg">calendar_month</span>}
                    </div>
                </div>

                <div className="bg-[#F8FAFC] rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {credit > 0 && (
                        <div className="flex justify-between items-center text-xs font-bold text-green-600 uppercase tracking-widest">
                            <span>Concierge Credit Applied</span>
                            <span>-$50.00</span>
                        </div>
                    )}
                    <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                        <span className="font-display font-bold text-2xl text-slate-900">Total</span>
                        <span className="font-display text-4xl font-black text-primary">${total.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={onConfirm}
                    disabled={!treatment || !specialist || !date || !slot || isSubmitting}
                    className={`w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl ${!treatment || !specialist || !date || !slot || isSubmitting
                            ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                            : "bg-primary text-white hover:bg-primary/95 shadow-primary/20 active:scale-[0.98]"
                        }`}
                >
                    {isSubmitting ? "Processing..." : "Confirm Appointment"}
                </button>

                <p className="text-center text-[10px] text-slate-400 font-medium leading-relaxed">
                    By confirming, you agree to our <a href="#" className="underline">Cancellation Policy</a> and elite clinical standards.
                </p>
            </div>
        </div>
    );
}
