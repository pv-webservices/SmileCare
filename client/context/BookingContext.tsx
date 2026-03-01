"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
    getTreatments,
    getSpecialists,
    getSlots,
    holdSlot,
    Treatment,
    Specialist,
    Slot,
} from "@/lib/booking.api";
import { useToast } from "@/context/ToastContext";

export interface PatientDetails {
    name: string;
    phone: string;
    email: string;
    notes: string;
}

// ── State Shape ────────────────────────────────────────────────────────────

interface BookingState {
    // Step navigation
    step: number;
    setStep: (step: number) => void;

    // Catalog data
    treatments: Treatment[];
    specialists: Specialist[];
    slots: Slot[];

    // Loading / error states
    isLoadingCatalog: boolean;
    catalogError: string | null;
    isLoadingSlots: boolean;
    slotsError: string | null;

    // Selections
    selectedTreatment: Treatment | null;
    selectedSpecialist: Specialist | null;
    selectedDate: Date | null;
    selectedSlot: Slot | null;
    holdExpiresAt: Date | null;
    patientDetails: PatientDetails | null;

    // Session
    sessionId: string;

    // Submission
    isSubmitting: boolean;
    submissionError: string | null;

    // Actions
    selectTreatment: (treatment: Treatment) => void;
    selectSpecialist: (specialist: Specialist) => void;
    selectDate: (date: Date) => void;
    selectSlot: (slot: Slot) => Promise<void>;
    selectPatientDetails: (details: PatientDetails) => void;
    handleHoldExpired: () => void;
    handleConfirm: () => Promise<void>;
    resetBooking: () => void;
}

// ── Context ────────────────────────────────────────────────────────────────

const BookingContext = createContext<BookingState | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────

export function BookingProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { success, error: toastError, warning } = useToast();

    // Step
    const [step, setStep] = useState(1);

    // Catalog
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [specialists, setSpecialists] = useState<Specialist[]>([]);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
    const [catalogError, setCatalogError] = useState<string | null>(null);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState<string | null>(null);

    // Selections
    const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
    const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
    const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);

    // Session ID — stable per page load
    const [sessionId] = useState(
        () => `sess_${Math.random().toString(36).substring(2, 10)}`
    );

    // Submission
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    // ── Load catalog on mount ──────────────────────────────────────────────

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
        loadCatalog();
    }, []);

    // ── Fetch slots when specialist + date both selected ──────────────────

    useEffect(() => {
        if (!selectedSpecialist || !selectedDate) {
            setSlots([]);
            setIsLoadingSlots(false);
            return;
        }

        // Show loading immediately for responsive feel
        setIsLoadingSlots(true);
        setSlotsError(null);

        // Debounce: wait 300ms before firing the API call
        // so rapid date clicks don't hammer the server
        const timer = setTimeout(async () => {
            try {
                const y = selectedDate.getFullYear();
                const mo = String(selectedDate.getMonth() + 1).padStart(2, "0");
                const dy = String(selectedDate.getDate()).padStart(2, "0");
                const dateStr = `${y}-${mo}-${dy}`;

                const data = await getSlots(selectedSpecialist.id, dateStr);
                setSlots(data);
            } catch (err: any) {
                // Ignore abort errors from stale requests
                if ((err as Error).name === "AbortError") return;
                const msg = err.message || "Failed to load available slots.";
                setSlotsError(msg);
                toastError("Could Not Load Slots", msg);
            } finally {
                setIsLoadingSlots(false);
            }
        }, 300);

        // Cleanup: cancel the pending fetch if date changes again
        return () => clearTimeout(timer);

    }, [selectedSpecialist, selectedDate, toastError]);

    // ── Actions ───────────────────────────────────────────────────────────

    const selectTreatment = useCallback((treatment: Treatment) => {
        setSelectedTreatment(treatment);
        // Reset downstream selections when treatment changes
        setSelectedSpecialist(null);
        setSelectedDate(null);
        setSelectedSlot(null);
        setHoldExpiresAt(null);
        setSlots([]);
        setStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const selectSpecialist = useCallback((specialist: Specialist) => {
        setSelectedSpecialist(specialist);
        // Reset downstream selections when specialist changes
        setSelectedDate(null);
        setSelectedSlot(null);
        setHoldExpiresAt(null);
        setSlots([]);
        setStep(3);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const selectDate = useCallback((date: Date) => {
        setSelectedDate(date);
        // Reset slot when date changes
        setSelectedSlot(null);
        setHoldExpiresAt(null);
    }, []);

    const selectSlot = useCallback(
        async (slot: Slot) => {
            setSelectedSlot(slot);
            try {
                const res = await holdSlot(slot.id, sessionId);
                const expires = res.expiresAt
                    ? new Date(res.expiresAt)
                    : res.data?.holdExpiresAt
                        ? new Date(res.data.holdExpiresAt)
                        : (() => {
                            const d = new Date();
                            d.setMinutes(d.getMinutes() + 5);
                            return d;
                        })();
                setHoldExpiresAt(expires);
            } catch (err: any) {
                // Hold failed — set a local 5-min timer so UX isn't broken
                const d = new Date();
                d.setMinutes(d.getMinutes() + 5);
                setHoldExpiresAt(d);
                // Inform user gracefully
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
            setStep(4);
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        [sessionId, toastError, warning]
    );

    const selectPatientDetails = useCallback((details: PatientDetails) => {
        setPatientDetails(details);
        setStep(5);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const handleHoldExpired = useCallback(() => {
        setHoldExpiresAt(null);
        setSelectedSlot(null);
        setStep(3);
        warning(
            "Slot Hold Expired",
            "Your reserved slot has expired. Please select a new time."
        );
    }, [warning]);

    const handleConfirm = useCallback(async () => {
        if (
            !selectedTreatment ||
            !selectedSpecialist ||
            !selectedDate ||
            !selectedSlot
        )
            return;

        setIsSubmitting(true);
        setSubmissionError(null);

        try {
            const idempotencyKey = `${selectedSlot.id}-${Date.now()}`;

            // Write to sessionStorage with the exact shape payment/page.tsx expects
            sessionStorage.setItem(
                "smilecare_payment",
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
                    patient: patientDetails
                        ? {
                            name: patientDetails.name,
                            phone: patientDetails.phone,
                            email: patientDetails.email,
                            notes: patientDetails.notes,
                        }
                        : null,
                })
            );

            router.push("/payment");
        } catch (err: any) {
            const msg = err.message || "Failed to proceed to payment. Please try again.";
            setSubmissionError(msg);
            toastError("Payment Redirect Failed", msg);
        } finally {
            setIsSubmitting(false);
        }
    }, [
        selectedTreatment,
        selectedSpecialist,
        selectedDate,
        selectedSlot,
        sessionId,
        router,
        toastError,
    ]);

    const resetBooking = useCallback(() => {
        setStep(1);
        setSelectedTreatment(null);
        setSelectedSpecialist(null);
        setSelectedDate(null);
        setSelectedSlot(null);
        setPatientDetails(null);
        setHoldExpiresAt(null);
        setSlots([]);
        setSubmissionError(null);
    }, []);

    // ── Context value ─────────────────────────────────────────────────────

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
                selectTreatment,
                selectSpecialist,
                selectDate,
                selectSlot,
                selectPatientDetails,
                handleHoldExpired,
                handleConfirm,
                resetBooking,
            }}
        >
            {children}
        </BookingContext.Provider>
    );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useBooking(): BookingState {
    const ctx = useContext(BookingContext);
    if (!ctx) {
        throw new Error("useBooking must be used inside <BookingProvider>");
    }
    return ctx;
}
