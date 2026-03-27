"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  getTreatments,
  getSpecialists,
  getSlots,
  holdSlot,
  type Treatment,
  type Specialist,
  type Slot,
} from "@/lib/booking.api";
import { useToast } from "@/context/ToastContext";
import type { PatientDetails } from "@/components/booking/PatientDetailsStep";
import { getApiBaseUrl } from "@/lib/api-base";

function createSessionId() {
  return `sess_${Math.random().toString(36).substring(2, 10)}`;
}

interface BookingState {
  step: number;
  setStep: (step: number) => void;
  treatments: Treatment[];
  specialists: Specialist[];
  slots: Slot[];
  isLoadingCatalog: boolean;
  catalogError: string | null;
  isLoadingSlots: boolean;
  slotsError: string | null;
  selectedTreatment: Treatment | null;
  selectedSpecialist: Specialist | null;
  selectedDate: Date | null;
  selectedSlot: Slot | null;
  holdExpiresAt: Date | null;
  patientDetails: PatientDetails | null;
  sessionId: string;
  isSubmitting: boolean;
  submissionError: string | null;
  bookingResult: BookingResult | null;
  selectTreatment: (treatment: Treatment) => void;
  selectSpecialist: (specialist: Specialist) => void;
  selectDate: (date: Date) => void;
  selectSlot: (slot: Slot) => Promise<void>;
  confirmBooking: (details: PatientDetails) => Promise<void>;
  handleHoldExpired: () => void;
  resetBooking: () => void;
  maxReachedStep: number;
  goToStep: (step: number) => void;
}

interface BookingResult {
  id: string;
  status: string;
}

const BookingContext = createContext<BookingState | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const { error: toastError, warning, success } = useToast();

  const [step, setStep] = useState(1);
  const [maxReachedStep, setMaxReachedStep] = useState(1);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [sessionId, setSessionId] = useState(createSessionId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  const goToStep = useCallback((targetStep: number) => {
    if (targetStep <= maxReachedStep) {
      setStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [maxReachedStep]);

  useEffect(() => {
    const loadCatalog = async () => {
      setIsLoadingCatalog(true);
      setCatalogError(null);
      try {
        const [tData, dData] = await Promise.all([
          getTreatments(),
          getSpecialists(),
        ]);
        setTreatments(tData);
        setSpecialists(dData);
      } catch (err: any) {
        const msg = err.message || "Failed to load booking data. Please refresh.";
        setCatalogError(msg);
        toastError("Unable to Load Treatments", msg);
      } finally {
        setIsLoadingCatalog(false);
      }
    };
    void loadCatalog();
  }, [toastError]);

  useEffect(() => {
    if (!selectedSpecialist || !selectedDate) {
      setSlots([]);
      setIsLoadingSlots(false);
      return;
    }

    setIsLoadingSlots(true);
    setSlotsError(null);
    const timer = setTimeout(async () => {
      try {
        const y = selectedDate.getFullYear();
        const mo = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const dy = String(selectedDate.getDate()).padStart(2, "0");
        const dateStr = `${y}-${mo}-${dy}`;
        const data = await getSlots(selectedSpecialist.id, dateStr);
        setSlots(data);
      } catch (err: any) {
        if ((err as Error).name === "AbortError") return;
        const msg = err.message || "Failed to load available slots.";
        setSlotsError(msg);
        toastError("Could Not Load Slots", msg);
      } finally {
        setIsLoadingSlots(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedSpecialist, selectedDate, toastError]);

  const selectTreatment = useCallback((treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setSelectedSpecialist(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setHoldExpiresAt(null);
    setPatientDetails(null);
    setSlots([]);
    setBookingResult(null);
    setMaxReachedStep(2);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const selectSpecialist = useCallback((specialist: Specialist) => {
    setSelectedSpecialist(specialist);
    setSelectedDate(null);
    setSelectedSlot(null);
    setHoldExpiresAt(null);
    setPatientDetails(null);
    setSlots([]);
    setBookingResult(null);
    setMaxReachedStep(3);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const selectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setHoldExpiresAt(null);
  }, []);

  const selectSlot = useCallback(async (slot: Slot) => {
    setSelectedSlot(slot);
    setSubmissionError(null);
    try {
      const res = await holdSlot(slot.id, sessionId);
      const expiresAt = res.expiresAt || res.data?.holdExpiresAt;
      const nextHoldExpiry = expiresAt ? new Date(expiresAt) : (() => {
        const fallback = new Date();
        fallback.setMinutes(fallback.getMinutes() + 5);
        return fallback;
      })();
      setHoldExpiresAt(nextHoldExpiry);
      setMaxReachedStep(4);
    } catch (err: any) {
      const fallback = new Date();
      fallback.setMinutes(fallback.getMinutes() + 5);
      setHoldExpiresAt(fallback);
      setMaxReachedStep(4);
      if (err?.status === 409) {
        toastError(
          "Slot No Longer Available",
          "This slot was just taken. Please select another time."
        );
      } else {
        warning(
          "Slot Reserved Locally",
          "Could not confirm hold with server. Your slot is temporarily reserved."
        );
      }
    }
  }, [sessionId, toastError, warning]);

  const confirmBooking = useCallback(async (details: PatientDetails) => {
    if (!selectedTreatment || !selectedSpecialist || !selectedDate || !selectedSlot) {
      const msg = "Please complete all booking steps before confirming.";
      setSubmissionError(msg);
      toastError("Booking Incomplete", msg);
      return;
    }

    setPatientDetails(details);
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/bookings/guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          treatmentId: selectedTreatment.id,
          sessionId,
          idempotencyKey: `${selectedSlot.id}-${Date.now()}`,
          notes: details.notes || "",
          patientName: details.name,
          patientPhone: details.phone,
          patientEmail: details.email,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || errorData.message || "Booking failed");
      }

      const result = await res.json();
      const booking = result.data || result;

      setBookingResult({
        id: booking.id,
        status: booking.status || "confirmed",
      });

      success(
        "Booking Confirmed!",
        "Your appointment has been confirmed. Check your email for details."
      );

      // Move to confirmation/success step
      setMaxReachedStep(5);
      setStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      const msg = err.message || "Failed to confirm booking. Please try again.";
      setSubmissionError(msg);
      toastError("Booking Failed", msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedTreatment,
    selectedSpecialist,
    selectedDate,
    selectedSlot,
    sessionId,
    toastError,
    success,
  ]);

  const handleHoldExpired = useCallback(() => {
    setHoldExpiresAt(null);
    setSelectedSlot(null);
    setStep(3);
    warning(
      "Slot Hold Expired",
      "Your reserved slot has expired. Please select a new time."
    );
  }, [warning]);

  const resetBooking = useCallback(() => {
    setStep(1);
    setMaxReachedStep(1);
    setSelectedTreatment(null);
    setSelectedSpecialist(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setPatientDetails(null);
    setHoldExpiresAt(null);
    setSlots([]);
    setSubmissionError(null);
    setBookingResult(null);
    setSessionId(createSessionId());
  }, []);

  return (
    <BookingContext.Provider
      value={{
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
        sessionId,
        isSubmitting,
        submissionError,
        bookingResult,
        selectTreatment,
        selectSpecialist,
        selectDate,
        selectSlot,
        confirmBooking,
        handleHoldExpired,
        resetBooking,
        maxReachedStep,
        goToStep,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingState {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking must be used inside <BookingProvider>");
  }
  return ctx;
}
