"use client";

import { BookingProvider, useBooking } from "@/context/BookingContext";
import BookingProgress from "@/components/booking/BookingProgress";
import TreatmentStep from "@/components/booking/TreatmentStep";
import SpecialistStep from "@/components/booking/SpecialistStep";
import ScheduleStep from "@/components/booking/ScheduleStep";
import PatientDetailsStep from "@/components/booking/PatientDetailsStep";
import BookingSummary from "@/components/booking/BookingSummary";
import {
    ChevronRight,
    AlertCircle,
    RefreshCw,
    CheckCircle2,
    CalendarCheck,
    Mail,
    ArrowRight,
} from "lucide-react";

function BookingConfirmation() {
    const {
        bookingResult,
        selectedTreatment,
        selectedSpecialist,
        selectedDate,
        selectedSlot,
        patientDetails,
        resetBooking,
    } = useBooking();

    const formattedDate = selectedDate
        ? selectedDate.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : "—";

    return (
        <main className="min-h-screen bg-background-light flex items-center justify-center px-6 py-12">
            <div className="max-w-lg w-full text-center">
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                            <CheckCircle2
                                size={40}
                                className="text-emerald-500"
                            />
                        </div>
                        <div className="absolute inset-0 rounded-full animate-ping bg-emerald-100 opacity-30" />
                    </div>
                </div>

                <h1 className="font-display text-4xl font-bold text-slate-900 mb-3">
                    Booking Confirmed!
                </h1>
                <p className="text-slate-500 text-sm mb-8">
                    Your appointment has been successfully booked.
                </p>

                {/* Booking Details Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-left space-y-4 mb-6">
                    {bookingResult?.id && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Booking ID</span>
                            <span className="font-mono text-xs bg-slate-50 px-3 py-1 rounded-lg text-slate-700">
                                {bookingResult.id.slice(0, 8).toUpperCase()}
                            </span>
                        </div>
                    )}
                    {selectedTreatment && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Treatment</span>
                            <span className="font-bold text-slate-900">
                                {selectedTreatment.name}
                            </span>
                        </div>
                    )}
                    {selectedSpecialist && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Specialist</span>
                            <span className="font-bold text-slate-900">
                                {selectedSpecialist.name}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Date</span>
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <CalendarCheck size={14} className="text-primary" />
                            {formattedDate}
                        </span>
                    </div>
                    {selectedSlot && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Time</span>
                            <span className="font-bold text-slate-900">
                                {selectedSlot.startTime}{" "}
                                {selectedSlot.endTime
                                    ? `– ${selectedSlot.endTime}`
                                    : ""}
                            </span>
                        </div>
                    )}
                    {patientDetails && (
                        <>
                            <hr className="border-slate-100" />
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">
                                    Patient Name
                                </span>
                                <span className="font-bold text-slate-900">
                                    {patientDetails.name}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Email notice */}
                <div className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 mb-8">
                    <Mail size={16} />
                    <p className="text-sm font-medium">
                        A confirmation email has been sent to{" "}
                        <span className="font-bold">
                            {patientDetails?.email || "your email"}
                        </span>
                    </p>
                </div>

                <button
                    onClick={resetBooking}
                    className="flex items-center gap-2.5 mx-auto px-8 py-4 rounded-xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
                >
                    Book Another Appointment
                    <ArrowRight size={18} />
                </button>
            </div>
        </main>
    );
}

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
        confirmBooking,
        handleHoldExpired,
    } = useBooking();

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
                    <p className="text-slate-500 text-sm mb-6">
                        {catalogError}
                    </p>
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

    if (step === 5) {
        return <BookingConfirmation />;
    }

    return (
        <main className="min-h-screen bg-background-light pt-8 pb-20">
            <div className="mx-auto w-full max-w-6xl px-6">
                <nav className="mb-10 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    <a
                        className="hover:text-primary transition-colors"
                        href="/"
                    >
                        Home
                    </a>
                    <ChevronRight size={12} />
                    <span className="text-slate-700">Book Appointment</span>
                </nav>

                <div className="mb-16 text-center lg:text-left">
                    <h1 className="font-display text-5xl md:text-6xl font-bold text-primary leading-tight mb-4 tracking-tight">
                        Concierge Booking
                    </h1>
                    <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Tailoring your premium dental experience step by step
                        with our world-class specialists.
                    </p>
                </div>

                {submissionError && (
                    <div className="mb-8 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                        <AlertCircle size={16} className="shrink-0" />
                        {submissionError}
                    </div>
                )}

                <div className="lg:grid lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-16">
                        <BookingProgress currentStep={step} />

                        {step === 1 && (
                            <TreatmentStep
                                treatments={treatments}
                                selectedId={selectedTreatment?.id ?? null}
                                onSelect={selectTreatment}
                                isLoading={isLoadingCatalog}
                            />
                        )}

                        {step === 2 && (
                            <SpecialistStep
                                specialists={specialists}
                                selectedId={selectedSpecialist?.id ?? null}
                                onSelect={selectSpecialist}
                                isLoading={isLoadingCatalog}
                            />
                        )}

                        {step === 3 && selectedSpecialist && (
                            <ScheduleStep
                                specialistId={selectedSpecialist.id}
                                selectedDate={selectedDate}
                                onDateSelect={selectDate}
                                slots={slots}
                                selectedSlotId={selectedSlot?.id ?? null}
                                onSlotSelect={selectSlot}
                                isLoadingSlots={isLoadingSlots}
                                slotsError={slotsError}
                                onProceed={() => {
                                    setStep(4);
                                    window.scrollTo({
                                        top: 0,
                                        behavior: "smooth",
                                    });
                                }}
                            />
                        )}

                        {step === 4 && (
                            <PatientDetailsStep
                                onSubmit={confirmBooking}
                                initial={patientDetails}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    </div>

                    {step <= 4 && (
                        <div className="mt-16 lg:mt-0">
                            <BookingSummary
                                treatment={selectedTreatment}
                                specialist={selectedSpecialist}
                                date={selectedDate}
                                slot={selectedSlot}
                                holdExpiresAt={holdExpiresAt}
                                onConfirm={() => undefined}
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

export default function BookingPage() {
    return (
        <BookingProvider>
            <BookingPageInner />
        </BookingProvider>
    );
}
