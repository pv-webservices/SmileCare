"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BookingProgress from "@/components/booking/BookingProgress";
import TreatmentStep from "@/components/booking/TreatmentStep";
import SpecialistStep from "@/components/booking/SpecialistStep";
import ScheduleStep from "@/components/booking/ScheduleStep";
import BookingSummary from "@/components/booking/BookingSummary";
import {
    getTreatments,
    getSpecialists,
    getSlots,
    holdSlot,
    Treatment,
    Specialist,
    Slot,
} from "@/lib/booking.api";

export default function BookingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [specialists, setSpecialists] = useState<Specialist[]>([]);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState<string | null>(null);

    const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
    const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
    const [sessionId] = useState(() => Math.random().toString(36).substring(7));

    // Fetch treatments and specialists on mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [tData, dData] = await Promise.all([
                    getTreatments(),
                    getSpecialists(),
                ]);
                setTreatments(tData);
                setSpecialists(dData);
            } catch (err: any) {
                setError(err.message || "Failed to load booking data. Please refresh.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fetch slots when specialist + date selected
    useEffect(() => {
        if (!selectedSpecialist || !selectedDate) return;

        const fetchSlots = async () => {
            setIsLoadingSlots(true);
            setSlotsError(null);
            try {
                const dateStr = selectedDate.toISOString().split("T")[0];
                const data = await getSlots(selectedSpecialist.id, dateStr);
                setSlots(data);
            } catch (err: any) {
                setSlotsError(err.message || "Failed to load available slots.");
                setSlots([]);
            } finally {
                setIsLoadingSlots(false);
            }
        };
        fetchSlots();
    }, [selectedSpecialist, selectedDate]);

    const handleTreatmentSelect = (treatment: Treatment) => {
        setSelectedTreatment(treatment);
        setStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSpecialistSelect = (specialist: Specialist) => {
        setSelectedSpecialist(specialist);
        setStep(3);
    };

    const handleSlotSelect = async (slot: Slot) => {
        setSelectedSlot(slot);
        try {
            const res = await holdSlot(slot.id, sessionId);
            const expires = res.expiresAt
                ? new Date(res.expiresAt)
                : (() => {
                    const d = new Date();
                    d.setMinutes(d.getMinutes() + 5);
                    return d;
                })();
            setHoldExpiresAt(expires);
        } catch {
            // If hold fails, still set 5-min local timer so UX isn't broken
            const d = new Date();
            d.setMinutes(d.getMinutes() + 5);
            setHoldExpiresAt(d);
        }
        setStep(4);
    };

    const handleHoldExpired = () => {
        setHoldExpiresAt(null);
        setSelectedSlot(null);
        setStep(3);
    };

    // ── THE KEY FIX: Save to sessionStorage, redirect to /payment ─────────
    const handleConfirm = async () => {
        if (!selectedTreatment || !selectedSpecialist || !selectedDate || !selectedSlot) return;
        setIsSubmitting(true);
        try {
            const idempotencyKey = `${selectedSlot.id}-${Date.now()}`;

            sessionStorage.setItem(
                "smilecare_payment",   // matches payment/page.tsx line: sessionStorage.getItem("smilecare_payment")
                JSON.stringify({
                    orderId: `order_${Date.now()}`,
                    slotId: selectedSlot.id,
                    treatmentId: selectedTreatment.id,
                    sessionId,
                    idempotencyKey,
                    treatment: {
                        id: selectedTreatment.id,
                        title: selectedTreatment.name,
                        price: parseInt(
                            selectedTreatment.priceRange?.replace(/[^0-9]/g, "") || "0"
                        ),
                        duration: 60,
                    },
                    specialist: {
                        id: selectedSpecialist.id,
                        name: selectedSpecialist.name,
                        specialty: selectedSpecialist.specialization,
                    },
                    slot: {
                        id: selectedSlot.id,
                        startTime: selectedSlot.startTime,
                    },
                    date: selectedDate.toISOString(),
                })
            );

            router.push("/payment");
        } catch (err: any) {
            setError(err.message || "Failed to proceed to payment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };


    // ── Error state ────────────────────────────────────────────────────────
    if (error && treatments.length === 0) {
        return (
            <main className="min-h-screen bg-background-light flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                        <span className="material-symbols-outlined text-red-400 text-3xl">error</span>
                    </div>
                    <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Unable to Load</h2>
                    <p className="text-slate-500 text-sm mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </main>
        );
    }

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

                {/* Inline error banner (non-fatal) */}
                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="lg:grid lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-16">
                        <BookingProgress currentStep={step} />

                        {step === 1 && (
                            <TreatmentStep
                                treatments={treatments}
                                selectedId={selectedTreatment?.id ?? null}
                                onSelect={handleTreatmentSelect}
                                isLoading={isLoading}
                            />
                        )}

                        {step === 2 && (
                            <SpecialistStep
                                specialists={specialists}
                                selectedId={selectedSpecialist?.id ?? null}
                                onSelect={handleSpecialistSelect}
                                isLoading={isLoading}
                            />
                        )}

                        {(step === 3 || step === 4) && (
                            <ScheduleStep
                                selectedDate={selectedDate}
                                onDateSelect={setSelectedDate}
                                slots={slots}
                                selectedSlotId={selectedSlot?.id ?? null}
                                onSlotSelect={handleSlotSelect}
                                isLoadingSlots={isLoadingSlots}
                                slotsError={slotsError}
                            />
                        )}
                    </div>

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
        </main>
    );
}
