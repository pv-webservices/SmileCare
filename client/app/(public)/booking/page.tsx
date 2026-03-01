"use client";

import { BookingProvider, useBooking } from "@/context/BookingContext";
import BookingProgress from "@/components/booking/BookingProgress";
import TreatmentStep from "@/components/booking/TreatmentStep";
import SpecialistStep from "@/components/booking/SpecialistStep";
import ScheduleStep from "@/components/booking/ScheduleStep";
import PatientDetailsStep from "@/components/booking/PatientDetailsStep";
import ConfirmationStep from "@/components/booking/ConfirmationStep";
import BookingSummary from "@/components/booking/BookingSummary";
import { ChevronRight, AlertCircle, RefreshCw } from "lucide-react";

// ── Inner component — consumes BookingContext ──────────────────────────────

function BookingPageInner() {
    const {
        step,
        setStep,
        treatments,
        specialists,
        slots,
        isLoadingCatalog,
        catalogError,
        isLoadingSlots,
        slotsError,
        selectedTreatment,
        selectedSpecialist,
        selectedDate,
        selectedSlot,
        patientDetails,
        holdExpiresAt,
        isSubmitting,
        submissionError,
        selectTreatment,
        selectSpecialist,
        selectDate,
        selectSlot,
        selectPatientDetails,
        handleHoldExpired,
        handleConfirm,
    } = useBooking();

    // Fatal error — catalog completely failed to load
    if (catalogError && treatments.length === 0) {
        return (
            <main className="min-h-screen bg-background-light flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                        <AlertCircle size={28} className="text-red-400" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">
                        Unable to Load
                    </h2>
                    <p className="text-slate-500 text-sm mb-6">{catalogError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-all"
                    >
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background-light pt-8 pb-20">
            <div className="mx-auto w-full max-w-6xl px-6">

                {/* Breadcrumb */}
                <nav className="mb-10 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    <a className="hover:text-primary transition-colors" href="/">
                        Home
                    </a>
                    <ChevronRight size={12} />
                    <a
                        className="hover:text-primary transition-colors"
                        href="/dashboard"
                    >
                        Appointments
                    </a>
                    <ChevronRight size={12} />
                    <span className="text-slate-400">New Booking</span>
                </nav>

                {/* Hero Header */}
                <div className="mb-16 text-center lg:text-left">
                    <h1 className="font-display text-5xl md:text-6xl font-black text-primary leading-tight mb-4 tracking-tight">
                        Concierge Booking
                    </h1>
                    <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Tailoring your premium dental experience step by step
                        with our world-class specialists.
                    </p>
                </div>

                {/* Non-fatal submission error banner */}
                {submissionError && (
                    <div className="mb-8 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                        <AlertCircle size={16} className="shrink-0" />
                        {submissionError}
                    </div>
                )}

                <div className="lg:grid lg:grid-cols-3 gap-16">
                    {/* Left — main step area */}
                    <div className="lg:col-span-2 space-y-16">
                        <BookingProgress currentStep={step} />

                        {/* Step 1 — Choose Treatment */}
                        {step === 1 && (
                            <TreatmentStep
                                treatments={treatments}
                                selectedId={selectedTreatment?.id ?? null}
                                onSelect={selectTreatment}
                                isLoading={isLoadingCatalog}
                            />
                        )}

                        {/* Step 2 — Choose Specialist */}
                        {step === 2 && (
                            <SpecialistStep
                                specialists={specialists}
                                selectedId={selectedSpecialist?.id ?? null}
                                onSelect={selectSpecialist}
                                isLoading={isLoadingCatalog}
                            />
                        )}

                        {/* Step 3 — Choose Date & Slot */}
                        {step === 3 && (
                            <ScheduleStep
                                selectedDate={selectedDate}
                                onDateSelect={selectDate}
                                slots={slots}
                                selectedSlotId={selectedSlot?.id ?? null}
                                onSlotSelect={selectSlot}
                                isLoadingSlots={isLoadingSlots}
                                slotsError={slotsError}
                            />
                        )}

                        {/* Step 4 — Patient Details */}
                        {step === 4 && (
                            <PatientDetailsStep
                                onSubmit={selectPatientDetails}
                                initial={patientDetails}
                            />
                        )}

                        {/* Step 5 — Review & Confirm */}
                        {step === 5 && (
                            <ConfirmationStep
                                treatment={selectedTreatment}
                                specialist={selectedSpecialist}
                                date={selectedDate}
                                slot={selectedSlot}
                                patientDetails={patientDetails}
                                holdExpiresAt={holdExpiresAt}
                                isSubmitting={isSubmitting}
                                onConfirm={handleConfirm}
                                onEdit={setStep}
                            />
                        )}
                    </div>

                    {/* Right — sticky summary sidebar
                        Hidden on steps 4 & 5 since ConfirmationStep
                        already shows the full summary inline */}
                    {step <= 3 && (
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
                    )}
                </div>
            </div>
        </main>
    );
}

// ── Page export — wraps inner with provider ────────────────────────────────

export default function BookingPage() {
    return (
        <BookingProvider>
            <BookingPageInner />
        </BookingProvider>
    );
}
