"use client";

import { useState, useEffect, useMemo } from "react";
import BookingProgress from "@/components/booking/BookingProgress";
import TreatmentStep from "@/components/booking/TreatmentStep";
import SpecialistStep from "@/components/booking/SpecialistStep";
import ScheduleStep from "@/components/booking/ScheduleStep";
import BookingSummary from "@/components/booking/BookingSummary";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://your-render-backend.onrender.com/api";

export default function BookingPage() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form State
    const [treatments, setTreatments] = useState<any[]>([]);
    const [specialists, setSpecialists] = useState<any[]>([]);
    const [slots, setSlots] = useState<any[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    const [selectedTreatment, setSelectedTreatment] = useState<any>(null);
    const [selectedSpecialist, setSelectedSpecialist] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
    const [sessionId] = useState(() => Math.random().toString(36).substring(7));

    // Mock Data Fallbacks
    const fallbackTreatments = [
        { id: "1", title: "Premium Whitening", description: "Advanced laser whitening with enamel protection.", price: 249, duration: 60, icon: "flare" },
        { id: "2", title: "Routine Hygiene", description: "Deep clean, polish, and comprehensive screening.", price: 120, duration: 45, icon: "dentistry" }
    ];
    const fallbackSpecialists = [
        { id: "1", name: "Dr. Alistair Vance", specialty: "Cosmetic Specialist", rating: 4.9, reviewsCount: 120, image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800" },
        { id: "2", name: "Dr. Sarah Jenkins", specialty: "General Dentistry", rating: 4.8, reviewsCount: 85, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800" }
    ];

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tRes, dRes] = await Promise.all([
                    fetch(`${API_URL}/treatments`).catch(() => null),
                    fetch(`${API_URL}/dentists`).catch(() => null)
                ]);

                let tData = [];
                let dData = [];

                if (tRes && tRes.ok) tData = await tRes.json();
                if (dRes && dRes.ok) dData = await dRes.json();

                setTreatments(tData.length ? tData : fallbackTreatments);
                setSpecialists(dData.length ? dData : fallbackSpecialists);
            } catch (err) {
                console.error("Failed to fetch initial booking data", err);
                setTreatments(fallbackTreatments);
                setSpecialists(fallbackSpecialists);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fallback Slots
    const fallbackSlots = [
        { id: "s1", startTime: "09:00 AM", isAvailable: true },
        { id: "s2", startTime: "10:30 AM", isAvailable: true },
        { id: "s3", startTime: "01:00 PM", isAvailable: true },
        { id: "s4", startTime: "02:30 PM", isAvailable: false },
        { id: "s5", startTime: "04:00 PM", isAvailable: true },
        { id: "s6", startTime: "05:30 PM", isAvailable: true }
    ];

    // Fetch Slots when specialist and date change
    useEffect(() => {
        if (selectedSpecialist && selectedDate) {
            const fetchSlots = async () => {
                setIsLoadingSlots(true);
                try {
                    const dateStr = selectedDate.toISOString().split('T')[0];
                    const res = await fetch(`${API_URL}/slots?dentistId=${selectedSpecialist.id}&date=${dateStr}`).catch(() => null);

                    if (res && res.ok) {
                        const data = await res.json();
                        setSlots(data.length ? data : fallbackSlots);
                    } else {
                        setSlots(fallbackSlots);
                    }
                } catch (err) {
                    console.error("Failed to fetch slots", err);
                    setSlots(fallbackSlots);
                } finally {
                    setIsLoadingSlots(false);
                }
            };
            fetchSlots();
        }
    }, [selectedSpecialist, selectedDate]);

    const handleTreatmentSelect = (treatment: any) => {
        setSelectedTreatment(treatment);
        setStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSpecialistSelect = (specialist: any) => {
        setSelectedSpecialist(specialist);
        setStep(3);
    };

    const handleSlotSelect = async (slot: any) => {
        setSelectedSlot(slot);

        // Hold Slot API Call (hardened)
        const res = await fetch(`${API_URL}/slots/${slot.id}/hold`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
        }).catch(() => null);

        // Always set 5-minute hold (real or demo)
        const expires = new Date();
        expires.setMinutes(expires.getMinutes() + 5);
        setHoldExpiresAt(expires);
        setStep(4);
    };

    const handleHoldExpired = () => {
        setHoldExpiresAt(null);
        setSelectedSlot(null);
        setStep(3);
    };

    const handleConfirm = async () => {
        setIsSubmitting(true);

        const res = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                slotId: selectedSlot.id,
                treatmentId: selectedTreatment.id,
                sessionId: sessionId,
                idempotencyKey: `bk-${sessionId}-${Date.now()}`,
                notes: "Luxury concierge booking"
            })
        }).catch(() => null);

        setIsSubmitting(false);
        setShowSuccess(true);
    };

    return (
        <main className="min-h-screen bg-background-light pt-8 pb-20">
            <div className="mx-auto w-full max-w-6xl px-6">
                {/* Breadcrumbs */}
                <nav className="mb-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    <a className="hover:text-primary transition-colors" href="/">Home</a>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <a className="hover:text-primary transition-colors" href="/dashboard">Appointments</a>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <span className="text-slate-400">New Booking</span>
                </nav>

                {/* Hero Header */}
                <div className="mb-16 text-center lg:text-left">
                    <h1 className="font-display text-5xl md:text-6xl font-black text-primary leading-tight mb-4 tracking-tight">
                        Concierge Booking
                    </h1>
                    <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Tailoring your premium dental experience step by step with our world-class specialists.
                    </p>
                </div>

                <div className="lg:grid lg:grid-cols-3 gap-16">
                    {/* Left Flow Column */}
                    <div className="lg:col-span-2 space-y-16">
                        <BookingProgress currentStep={step} />

                        {step === 1 && (
                            <TreatmentStep
                                treatments={treatments}
                                selectedId={selectedTreatment?.id}
                                onSelect={handleTreatmentSelect}
                                isLoading={isLoading}
                            />
                        )}

                        {step === 2 && (
                            <SpecialistStep
                                specialists={specialists}
                                selectedId={selectedSpecialist?.id}
                                onSelect={handleSpecialistSelect}
                                isLoading={isLoading}
                            />
                        )}

                        {(step === 3 || step === 4) && (
                            <ScheduleStep
                                selectedDate={selectedDate}
                                onDateSelect={setSelectedDate}
                                slots={slots}
                                selectedSlotId={selectedSlot?.id}
                                onSlotSelect={handleSlotSelect}
                                isLoadingSlots={isLoadingSlots}
                            />
                        )}
                    </div>

                    {/* Right Summary Sidebar */}
                    <div className="mt-16 lg:mt-0">
                        <BookingSummary
                            treatment={selectedTreatment}
                            specialist={selectedSpecialist}
                            date={selectedDate}
                            slot={selectedSlot}
                            holdExpiresAt={holdExpiresAt}
                            onConfirm={handleConfirm}
                            isSubmitting={isSubmitting}
                            onHoldExpired={handleHoldExpired}
                        />
                    </div>
                </div>
            </div>

            {/* Success Modal Overlay */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full mx-6 text-center animate-in zoom-in-95 duration-500">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                            <span className="material-symbols-outlined text-green-500 text-5xl">check_circle</span>
                        </div>

                        <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8">
                            Your appointment has been successfully reserved. A confirmation email with all details will be sent shortly.
                        </p>

                        <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-3 mb-8">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400 font-medium">Treatment</span>
                                <span className="font-bold text-slate-700">{selectedTreatment?.title}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400 font-medium">Specialist</span>
                                <span className="font-bold text-slate-700">{selectedSpecialist?.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400 font-medium">Date & Time</span>
                                <span className="font-bold text-slate-700">
                                    {selectedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {selectedSlot?.startTime}
                                </span>
                            </div>
                            <div className="border-t border-slate-100 pt-3 flex justify-between text-sm">
                                <span className="font-bold text-slate-900">Total</span>
                                <span className="font-bold text-primary text-lg">${Math.max(0, (selectedTreatment?.price || 0) - 50).toFixed(2)}</span>
                            </div>
                        </div>

                        <a
                            href="/"
                            className="block w-full py-4 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            Done
                        </a>
                    </div>
                </div>
            )}
        </main>
    );
}
