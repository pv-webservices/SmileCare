// RAZORPAY_READY: Replace mock flow with Razorpay SDK when NEXT_PUBLIC_PAYMENT_MODE=razorpay
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Loader2, CheckCircle2, XCircle, CreditCard, Shield, Lock,
    ChevronRight, Clock, Smartphone, Building2, Wallet, AlertTriangle
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { addLocalBooking } from "@/lib/booking-storage";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PaymentData {
    orderId: string;
    slotId: string;
    treatmentId: string;
    sessionId: string;
    idempotencyKey: string;
    treatment: { id: string; title: string; price: number; duration?: number };
    specialist: { id: string; name: string; specialty?: string } | null;
    slot: { id: string; startTime: string };
    date: string;
}

type PaymentTab = "card" | "upi" | "netbanking" | "wallets";
type PageState = "form" | "processing" | "success" | "expired" | "error";

// ─── Processing Messages ─────────────────────────────────────────────────────

const PROCESSING_MESSAGES = [
    "Connecting to payment gateway...",
    "Processing payment...",
    "Verifying transaction...",
];

// ─── Banks & Wallets ─────────────────────────────────────────────────────────

const BANKS = [
    { code: "SBI", name: "State Bank of India" },
    { code: "HDFC", name: "HDFC Bank" },
    { code: "ICICI", name: "ICICI Bank" },
    { code: "AXIS", name: "Axis Bank" },
    { code: "KOTAK", name: "Kotak Mahindra" },
    { code: "YES", name: "Yes Bank" },
];

const WALLETS = [
    { id: "paytm", name: "Paytm", color: "#00BAF2" },
    { id: "phonepe", name: "PhonePe", color: "#5F259F" },
    { id: "amazonpay", name: "Amazon Pay", color: "#FF9900" },
    { id: "mobikwik", name: "Mobikwik", color: "#E23744" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function PaymentPage() {
    const router = useRouter();

    // Page state
    const [pageState, setPageState] = useState<PageState>("form");
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [activeTab, setActiveTab] = useState<PaymentTab>("card");
    const [processingMsg, setProcessingMsg] = useState(0);
    const { success, error: toastError, warning } = useToast();
    const { isAuthenticated, isLoading } = useAuth();

    // Timer
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

    // Card form
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [cardName, setCardName] = useState("");
    const [saveCard, setSaveCard] = useState(false);

    // UPI
    const [upiId, setUpiId] = useState("");
    const [showQR, setShowQR] = useState(false);

    // Net Banking
    const [selectedBank, setSelectedBank] = useState<string | null>(null);

    // Wallets
    const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

    // Success data
    const [paymentId, setPaymentId] = useState("");
    const [bookingId, setBookingId] = useState("");

    // ─── Load sessionStorage ─────────────────────────────────────────────────

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem("smilecare_payment");
            if (raw) {
                setPaymentData(JSON.parse(raw));
            } else {
                setPageState("error");
                // Toast shown after mount
            }
        } catch {
            setPageState("error");
            // Toast shown after mount
        }
    }, []);

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) {
            const callbackUrl = `/payment`;
            router.replace(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        }
    }, [isAuthenticated, isLoading, router]);

    useEffect(() => {
        if (pageState === "error") {
            // slight delay so ToastProvider has mounted
            const t = setTimeout(() => {
                toastError(
                    "No Booking Found",
                    "Please complete the booking form before proceeding to payment."
                );
            }, 300);
            return () => clearTimeout(t);
        }
    }, [pageState, toastError]);

    // ─── Countdown Timer ─────────────────────────────────────────────────────

    useEffect(() => {
        if (pageState !== "form") return;
        if (timeLeft <= 0) {
            setPageState("expired");
            warning(
                "Payment Session Expired",
                "Your reserved slot has been released. Please book again."
            );
            return;
        }
        const interval = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(interval);
                    setPageState("expired");
                    warning(
                        "Payment Session Expired",
                        "Your reserved slot has been released. Please book again."
                    );
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [pageState, timeLeft, warning]);

    const formatTimer = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // ─── Card number formatting ──────────────────────────────────────────────

    const handleCardNumber = (val: string) => {
        const digits = val.replace(/\D/g, "").slice(0, 16);
        const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
        setCardNumber(formatted);
    };

    const handleExpiry = (val: string) => {
        const digits = val.replace(/\D/g, "").slice(0, 4);
        if (digits.length > 2) {
            setExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
        } else {
            setExpiry(digits);
        }
    };

    // ─── Price Calculations ──────────────────────────────────────────────────

    const subtotal = paymentData?.treatment?.price || 249;
    const discount = 500;
    const convenienceFee = 0;
    const total = Math.max(0, subtotal - discount + convenienceFee);

    // ─── Check if form is valid ──────────────────────────────────────────────

    const isFormValid = useCallback(() => {
        switch (activeTab) {
            case "card":
                return cardNumber.replace(/\s/g, "").length === 16 &&
                    expiry.length === 5 && cvv.length === 3 && cardName.length > 0;
            case "upi":
                return upiId.includes("@") && upiId.length > 3;
            case "netbanking":
                return !!selectedBank;
            case "wallets":
                return !!selectedWallet;
            default:
                return false;
        }
    }, [activeTab, cardNumber, expiry, cvv, cardName, upiId, selectedBank, selectedWallet]);

    // ─── Payment Simulation ──────────────────────────────────────────────────

    const PAYMENT_MODE = process.env.NEXT_PUBLIC_PAYMENT_MODE;

    const handlePay = async () => {
        if (!paymentData || !isFormValid()) return;

        if (PAYMENT_MODE === 'razorpay') {
            await handleRazorpayPay();
        } else {
            await handleMockPay();
        }
    };

    const handleRazorpayPay = async () => {
        if (!paymentData) return;
        setPageState("processing");

        try {
            // Load Razorpay SDK dynamically
            await new Promise<void>((resolve, reject) => {
                if (typeof (window as any).Razorpay !== 'undefined') {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve();
                script.onerror = () =>
                    reject(new Error('Failed to load Razorpay SDK'));
                document.head.appendChild(script);
            });

            // Open Razorpay checkout
            const amountInPaise = Math.round(total * 100);

            await new Promise<void>((resolve, reject) => {
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: amountInPaise,
                    currency: 'INR',
                    name: 'SmileCare',
                    description: paymentData.treatment?.title || 'Dental Treatment',
                    order_id: paymentData.orderId,
                    prefill: {
                        name: '', // populate from useAuth() user.name if available
                        email: '', // populate from useAuth() user.email if available
                    },
                    theme: { color: '#1a3a5c' },
                    handler: async (response: {
                        razorpay_payment_id: string;
                        razorpay_order_id: string;
                        razorpay_signature: string;
                    }) => {
                        try {
                            // Verify on server
                            const res = await fetch(
                                `${API}/api/payments/verify`,
                                {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    credentials: 'include',
                                    body: JSON.stringify({
                                        orderId: response.razorpay_order_id,
                                        slotId: paymentData.slotId,
                                        treatmentId: paymentData.treatmentId,
                                        sessionId: paymentData.sessionId,
                                        idempotencyKey: paymentData.idempotencyKey,
                                        razorpayPaymentId: response.razorpay_payment_id,
                                        razorpaySignature: response.razorpay_signature,
                                    }),
                                }
                            );

                            if (res.ok) {
                                const data = await res.json();
                                const pid = data.data?.payment?.id ||
                                    response.razorpay_payment_id;
                                const bid = data.data?.booking?.id ||
                                    `book_${Date.now()}`;
                                setPaymentId(pid);
                                setBookingId(bid);

                                // Persist booking locally (same as mock)
                                addLocalBooking({
                                    id: bid,
                                    paymentId: pid,
                                    treatment: paymentData.treatment?.title ||
                                        'Dental Treatment',
                                    treatmentId: paymentData.treatment?.id ||
                                        paymentData.treatmentId,
                                    doctor: paymentData.specialist?.name ||
                                        'SmileCare Specialist',
                                    specialization:
                                        paymentData.specialist?.specialty || '',
                                    date: paymentData.date,
                                    startTime: paymentData.slot?.startTime || 'TBD',
                                    status: 'confirmed',
                                    paymentAmount: total,
                                    paymentStatus: 'captured',
                                    confirmedAt: new Date().toISOString(),
                                });

                                sessionStorage.removeItem('smilecare_payment');
                                sessionStorage.removeItem('pendingBooking');
                                success('Payment Successful!',
                                    'Your appointment has been confirmed.');
                                setPageState('success');
                                resolve();
                            } else {
                                const errData = await res.json().catch(() => ({}));
                                toastError(
                                    'Verification Failed',
                                    errData?.error?.message || 'Payment could not be verified.'
                                );
                                setPageState('form');
                                reject(new Error('Verification failed'));
                            }
                        } catch (err) {
                            toastError('Error', 'Something went wrong.');
                            setPageState('form');
                            reject(err);
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            warning('Payment Cancelled',
                                'You closed the payment window.');
                            setPageState('form');
                            resolve();
                        },
                    },
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.on('payment.failed', (resp: any) => {
                    toastError(
                        'Payment Failed',
                        resp.error?.description || 'Payment was declined.'
                    );
                    setPageState('form');
                    reject(new Error(resp.error?.description));
                });
                rzp.open();
            });
        } catch (err: any) {
            toastError('Payment Error', err.message || 'Something went wrong.');
            setPageState('form');
        }
    };

    const handleMockPay = async () => {
        if (!paymentData || !isFormValid()) return;
        setPageState("processing");
        setProcessingMsg(0);

        // Cycle processing messages
        const msgInterval = setInterval(() => {
            setProcessingMsg((p) => {
                const next = p + 1;
                if (next >= PROCESSING_MESSAGES.length) {
                    clearInterval(msgInterval);
                    return PROCESSING_MESSAGES.length - 1;
                }
                return next;
            });
        }, 1200);

        // Simulate gateway delay
        await new Promise((r) => setTimeout(r, 3500));
        clearInterval(msgInterval);

        // Call verify endpoint
        try {
            const res = await fetch(`${API}/api/payments/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    orderId: paymentData.orderId,
                    slotId: paymentData.slotId,
                    treatmentId: paymentData.treatmentId,
                    sessionId: paymentData.sessionId,
                    idempotencyKey: paymentData.idempotencyKey,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                const pid = data.data?.payment?.id || `pay_${Date.now()}`;
                const bid = data.data?.booking?.id || `book_${Date.now()}`;
                setPaymentId(pid);
                setBookingId(bid);

                const enrichedBooking = {
                    id: bid,
                    paymentId: pid,
                    treatment: paymentData.treatment?.title || "Dental Treatment",
                    treatmentId: paymentData.treatment?.id || paymentData.treatmentId,
                    doctor: paymentData.specialist?.name || "SmileCare Specialist",
                    specialization: paymentData.specialist?.specialty || "",
                    date: paymentData.date,
                    startTime: paymentData.slot?.startTime || "TBD",
                    status: "confirmed" as const,
                    paymentAmount: paymentData.treatment?.price || total,
                    paymentStatus: "captured",
                    confirmedAt: new Date().toISOString(),
                };

                // Write to localStorage via booking-storage utility
                // so the booking persists across page navigations to /dashboard
                addLocalBooking(enrichedBooking);
                // Clear the payment intent — it's been consumed
                sessionStorage.removeItem("smilecare_payment");
                sessionStorage.removeItem("pendingBooking");

                success("Payment Successful!", "Your appointment has been confirmed.");
            } else {
                const errData = await res.json().catch(() => ({}));
                const msg = errData?.error?.message || errData?.message || "Payment verification failed";
                toastError("Payment Failed", msg);
                setPaymentId(`pay_${Date.now()}`);
            }
        } catch (err: any) {
            warning(
                "Note",
                "Booking saved locally — server sync pending."
            );

            // Still allow success UI for demo — save mock booking
            const pid = `pay_${Date.now()}`;
            const bid = `book_${Date.now()}`;
            setPaymentId(pid);
            setBookingId(bid);

            const enrichedBooking = {
                id: bid,
                paymentId: pid,
                treatment: paymentData.treatment?.title || "Dental Treatment",
                treatmentId: paymentData.treatment?.id || paymentData.treatmentId,
                doctor: paymentData.specialist?.name || "SmileCare Specialist",
                specialization: paymentData.specialist?.specialty || "",
                date: paymentData.date,
                startTime: paymentData.slot?.startTime || "TBD",
                status: "confirmed" as const,
                paymentAmount: paymentData.treatment?.price || total,
                paymentStatus: "captured",
                confirmedAt: new Date().toISOString(),
            };

            addLocalBooking(enrichedBooking);
            sessionStorage.removeItem("smilecare_payment");
            sessionStorage.removeItem("pendingBooking");
        }

        setPageState("success");
    };

    // ─── Error State ─────────────────────────────────────────────────────────

    if (pageState === "error") {
        return (
            <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-background-light px-4 py-16">
                <div className="max-w-md w-full bg-pearl rounded-2xl shadow-xl border border-primary/10 p-10 text-center">
                    <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                        <XCircle className="text-red-500" size={32} />
                    </div>
                    <h1 className="font-display text-2xl text-primary mb-2">No Booking Found</h1>
                    <p className="text-primary/40 text-sm mb-8">Please start the booking process from the booking page.</p>
                    <Link href="/booking" className="inline-block bg-primary text-white px-4 sm:px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all">
                        Go to Booking
                    </Link>
                </div>
            </main>
        );
    }

    // ─── Expired State ───────────────────────────────────────────────────────

    if (pageState === "expired") {
        return (
            <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-background-light px-4 py-16">
                <div className="max-w-md w-full bg-pearl rounded-2xl shadow-xl border border-primary/10 p-10 text-center">
                    <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                        <AlertTriangle className="text-amber-500" size={32} />
                    </div>
                    <h1 className="font-display text-2xl text-primary mb-2">Session Expired</h1>
                    <p className="text-primary/40 text-sm mb-8">Your payment session has timed out. Please try booking again.</p>
                    <Link href="/booking" className="inline-block bg-primary text-white px-4 sm:px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all">
                        Book Again
                    </Link>
                </div>
            </main>
        );
    }

    // ─── Processing Overlay ──────────────────────────────────────────────────

    if (pageState === "processing") {
        return (
            <main className="min-h-screen flex items-center justify-center bg-background-light">
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md">
                    <div className="text-center space-y-6">
                        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                            <Loader2 className="text-primary animate-spin" size={36} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="font-display text-2xl text-primary font-bold">Processing Payment</h2>
                            <p className="text-primary/50 font-medium text-sm animate-pulse">
                                {PROCESSING_MESSAGES[processingMsg]}
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-primary/30">
                            <Lock size={12} />
                            <span>256-bit SSL Encrypted</span>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // ─── Success State ───────────────────────────────────────────────────────

    if (pageState === "success") {
        return (
            <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-background-light px-4 py-16">
                <div className="max-w-lg w-full bg-pearl rounded-2xl shadow-xl border border-primary/10 p-10">
                    {/* Checkmark */}
                    <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center"
                        style={{ animation: "scaleIn 0.5s ease-out" }}
                    >
                        <CheckCircle2 className="text-emerald-500" size={40} />
                    </div>

                    <h1 className="font-display text-3xl text-primary text-center font-bold mb-1">Payment Successful!</h1>
                    <p className="text-center text-emerald-600 font-semibold text-sm mb-6">Booking Confirmed</p>

                    {/* Details */}
                    <div className="bg-white rounded-xl border border-primary/5 p-5 space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-primary/40">Payment ID</span>
                            <span className="font-mono text-xs text-primary/60">{paymentId.slice(0, 20)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-primary/40">Amount Paid</span>
                            <span className="font-bold text-primary">₹{total.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="border-t border-primary/5 pt-3 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-primary/40">Treatment</span>
                                <span className="font-semibold text-primary">{paymentData?.treatment?.title}</span>
                            </div>
                            {paymentData?.specialist && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-primary/40">Doctor</span>
                                    <span className="font-semibold text-primary">{paymentData.specialist.name}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-primary/40">Date & Time</span>
                                <span className="font-semibold text-primary">
                                    {paymentData?.date ? new Date(paymentData.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}{" "}
                                    • {paymentData?.slot?.startTime}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mb-6">
                        <Link href="/dashboard" className="flex-1 bg-primary text-white text-center py-3 rounded-xl font-bold hover:opacity-90 transition-all">
                            Go to Dashboard
                        </Link>
                        <Link href="/" className="flex-1 border-2 border-primary/20 text-primary text-center py-3 rounded-xl font-bold hover:bg-primary/5 transition-all">
                            Back to Home
                        </Link>
                    </div>

                    <p className="text-center text-[11px] text-primary/30">
                        A confirmation email will be sent to your registered email address.
                    </p>
                </div>

                {/* CSS Animation */}
                <style jsx>{`
                    @keyframes scaleIn {
                        from { transform: scale(0); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                `}</style>
            </main>
        );
    }

    // ─── Payment Form ────────────────────────────────────────────────────────

    if (!paymentData) return null;

    const tabs: { key: PaymentTab; label: string; icon: React.ReactNode }[] = [
        { key: "card", label: "Card", icon: <CreditCard size={16} /> },
        { key: "upi", label: "UPI", icon: <Smartphone size={16} /> },
        { key: "netbanking", label: "Net Banking", icon: <Building2 size={16} /> },
        { key: "wallets", label: "Wallets", icon: <Wallet size={16} /> },
    ];

    return (
        <main className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="lg:grid lg:grid-cols-5 gap-4 sm:p-8">

                    {/* ─── LEFT: Payment Form ─────────────────────────── */}
                    <div className="lg:col-span-3">
                        <div className="bg-pearl rounded-2xl shadow-xl border border-primary/10 p-4 sm:p-8">

                            {/* Header */}
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="font-display text-2xl text-primary font-bold">Complete Your Payment</h1>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${timeLeft < 120 ? "bg-red-50 text-red-600" : "bg-primary/5 text-primary/60"}`}>
                                    <Clock size={13} />
                                    {formatTimer(timeLeft)}
                                </div>
                            </div>
                            <p className="text-primary/40 text-sm mb-8">
                                Your slot is reserved. Complete payment to confirm your appointment.
                            </p>

                            {/* ─── Dynamically render Tabs + Form OR Razorpay Placeholder ─── */}
                            {PAYMENT_MODE !== 'razorpay' ? (
                                <>
                                    {/* Tabs */}
                                    <div className="flex gap-1 p-1 bg-primary/5 rounded-xl mb-8">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.key}
                                                onClick={() => setActiveTab(tab.key)}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.key
                                                    ? "bg-white text-primary shadow-sm"
                                                    : "text-primary/40 hover:text-primary/60"
                                                    }`}
                                            >
                                                {tab.icon}
                                                <span className="hidden sm:inline">{tab.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* ─── Card Tab ─────────────────────────── */}
                                    {activeTab === "card" && (
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-xs font-bold text-primary/40 uppercase tracking-wider mb-2">Card Number</label>
                                                <div className="relative">
                                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20" size={18} />
                                                    <input
                                                        type="text"
                                                        value={cardNumber}
                                                        onChange={(e) => handleCardNumber(e.target.value)}
                                                        placeholder="0000 0000 0000 0000"
                                                        className="w-full border border-primary/15 rounded-xl pl-12 pr-4 py-3.5 bg-white text-primary font-mono tracking-wider focus:ring-2 focus:ring-primary/30 outline-none transition-all placeholder:text-primary/20"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-primary/25 mt-1.5">Use any 16-digit number for demo</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-primary/40 uppercase tracking-wider mb-2">Expiry</label>
                                                    <input
                                                        type="text"
                                                        value={expiry}
                                                        onChange={(e) => handleExpiry(e.target.value)}
                                                        placeholder="MM/YY"
                                                        className="w-full border border-primary/15 rounded-xl px-4 py-3.5 bg-white text-primary font-mono focus:ring-2 focus:ring-primary/30 outline-none transition-all placeholder:text-primary/20"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-primary/40 uppercase tracking-wider mb-2">CVV</label>
                                                    <input
                                                        type="password"
                                                        value={cvv}
                                                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                                                        placeholder="•••"
                                                        maxLength={3}
                                                        className="w-full border border-primary/15 rounded-xl px-4 py-3.5 bg-white text-primary font-mono focus:ring-2 focus:ring-primary/30 outline-none transition-all placeholder:text-primary/20"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-primary/40 uppercase tracking-wider mb-2">Cardholder Name</label>
                                                <input
                                                    type="text"
                                                    value={cardName}
                                                    onChange={(e) => setCardName(e.target.value)}
                                                    placeholder="Full name on card"
                                                    className="w-full border border-primary/15 rounded-xl px-4 py-3.5 bg-white text-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all placeholder:text-primary/20"
                                                />
                                            </div>

                                            <label className="flex items-center gap-2.5 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={saveCard}
                                                    onChange={(e) => setSaveCard(e.target.checked)}
                                                    className="w-4 h-4 rounded border-primary/20 text-primary focus:ring-primary/30"
                                                />
                                                <span className="text-sm text-primary/50">Save this card for future payments</span>
                                            </label>
                                        </div>
                                    )}

                                    {/* ─── UPI Tab ──────────────────────────── */}
                                    {activeTab === "upi" && (
                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-xs font-bold text-primary/40 uppercase tracking-wider mb-2">UPI ID</label>
                                                <input
                                                    type="text"
                                                    value={upiId}
                                                    onChange={(e) => setUpiId(e.target.value)}
                                                    placeholder="yourname@upi"
                                                    className="w-full border border-primary/15 rounded-xl px-4 py-3.5 bg-white text-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all placeholder:text-primary/20"
                                                />
                                                <p className="text-[10px] text-primary/25 mt-1.5">Use any valid UPI format for demo</p>
                                            </div>

                                            <div className="relative">
                                                <div className="flex items-center gap-3 my-4">
                                                    <div className="flex-1 h-px bg-primary/10" />
                                                    <span className="text-[10px] font-bold text-primary/30 uppercase">Or</span>
                                                    <div className="flex-1 h-px bg-primary/10" />
                                                </div>

                                                <button
                                                    onClick={() => setShowQR(!showQR)}
                                                    className="w-full border-2 border-dashed border-primary/15 rounded-xl py-3 text-sm font-bold text-primary/40 hover:border-primary/30 hover:text-primary/60 transition-all"
                                                >
                                                    {showQR ? "Hide QR Code" : "Pay via QR Code"}
                                                </button>

                                                {showQR && (
                                                    <div className="mt-4 flex flex-col items-center">
                                                        <div className="w-48 h-48 bg-white border-2 border-primary/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
                                                            <div className="grid grid-cols-8 gap-0.5 w-36 h-36 opacity-20">
                                                                {Array.from({ length: 64 }).map((_, i) => (
                                                                    <div key={i} className={`${Math.random() > 0.5 ? "bg-primary" : "bg-transparent"}`} />
                                                                ))}
                                                            </div>
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="bg-white px-3 py-1 rounded-lg">
                                                                    <span className="text-xs font-bold text-primary">Scan to Pay</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-primary/30 mt-2">Scan with any UPI app</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* ─── Net Banking Tab ──────────────────── */}
                                    {activeTab === "netbanking" && (
                                        <div className="space-y-5">
                                            <p className="text-xs font-bold text-primary/40 uppercase tracking-wider">Select Your Bank</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                {BANKS.map((bank) => (
                                                    <button
                                                        key={bank.code}
                                                        onClick={() => setSelectedBank(bank.code)}
                                                        className={`border-2 rounded-xl p-4 text-center transition-all ${selectedBank === bank.code
                                                            ? "border-primary bg-primary/5 text-primary"
                                                            : "border-primary/10 hover:border-primary/25 text-primary/50"
                                                            }`}
                                                    >
                                                        <span className="block text-lg font-bold">{bank.code}</span>
                                                        <span className="block text-[10px] mt-0.5 opacity-60">{bank.name}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-primary/40 uppercase tracking-wider mb-2">Other Banks</label>
                                                <select className="w-full border border-primary/15 rounded-xl px-4 py-3.5 bg-white text-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all">
                                                    <option value="">Select a bank...</option>
                                                    <option value="bob">Bank of Baroda</option>
                                                    <option value="pnb">Punjab National Bank</option>
                                                    <option value="union">Union Bank</option>
                                                    <option value="canara">Canara Bank</option>
                                                    <option value="idbi">IDBI Bank</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* ─── Wallets Tab ──────────────────────── */}
                                    {activeTab === "wallets" && (
                                        <div className="space-y-5">
                                            <p className="text-xs font-bold text-primary/40 uppercase tracking-wider">Select Wallet</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {WALLETS.map((w) => (
                                                    <button
                                                        key={w.id}
                                                        onClick={() => setSelectedWallet(w.id)}
                                                        className={`border-2 rounded-xl p-4 flex items-center gap-3 transition-all ${selectedWallet === w.id
                                                            ? "border-primary bg-primary/5"
                                                            : "border-primary/10 hover:border-primary/25"
                                                            }`}
                                                    >
                                                        <div
                                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                                                            style={{ backgroundColor: w.color }}
                                                        >
                                                            {w.name.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-sm text-primary">{w.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ─── Pay Button ────────────────────────── */}
                                    <button
                                        onClick={handlePay}
                                        disabled={!isFormValid()}
                                        className={`w-full mt-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isFormValid()
                                            ? "bg-primary text-white shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.98]"
                                            : "bg-primary/10 text-primary/30 cursor-not-allowed"
                                            }`}
                                    >
                                        <Lock size={16} />
                                        Pay ₹{total.toLocaleString("en-IN")}
                                        <ChevronRight size={16} />
                                    </button>
                                </>
                            ) : (
                                <div className="py-12 text-center space-y-6">
                                    <div className="size-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                                        <Lock className="text-primary" size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-xl font-bold text-primary mb-2">
                                            Secure Razorpay Checkout
                                        </h3>
                                        <p className="text-primary/50 text-sm">
                                            Click below to complete payment via Razorpay.
                                            Supports UPI, cards, net banking, and wallets.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handlePay}
                                        className="w-full py-4 rounded-xl font-bold text-lg bg-primary text-white shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Lock size={16} />
                                        Pay ₹{total.toLocaleString('en-IN')} via Razorpay
                                    </button>
                                </div>
                            )}

                            {/* ─── Trust Badges ──────────────────────── */}
                            <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-primary/5">
                                <div className="flex items-center gap-1.5 text-[10px] text-primary/25 font-bold">
                                    <Lock size={10} />
                                    <span>256-bit SSL</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-primary/25 font-bold">
                                    <Shield size={10} />
                                    <span>PCI DSS Compliant</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-primary/25 font-bold">
                                    <CheckCircle2 size={10} />
                                    <span>Verified Merchant</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── RIGHT: Order Summary ───────────────────────── */}
                    <div className="lg:col-span-2 mt-8 lg:mt-0">
                        <div className="bg-pearl rounded-2xl shadow-xl border border-primary/10 p-4 sm:p-8 sticky top-28">

                            {/* Header */}
                            <div className="flex items-center gap-2 mb-6">
                                <Lock className="text-primary/30" size={14} />
                                <span className="text-xs font-bold text-primary/30 uppercase tracking-wider">Secured by SmileCare</span>
                            </div>

                            {/* Treatment */}
                            <div className="space-y-5 mb-6">
                                <div>
                                    <p className="font-display text-lg font-bold text-primary">{paymentData.treatment?.title}</p>
                                    {paymentData.treatment?.duration && (
                                        <span className="inline-block mt-1 px-2.5 py-0.5 bg-primary/5 rounded-full text-[10px] font-bold text-primary/50 uppercase">
                                            {paymentData.treatment.duration} min
                                        </span>
                                    )}
                                </div>

                                {/* Doctor */}
                                {paymentData.specialist && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-xs font-bold text-primary">{paymentData.specialist.name?.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-primary">{paymentData.specialist.name}</p>
                                            {paymentData.specialist.specialty && (
                                                <p className="text-[10px] text-primary/40">{paymentData.specialist.specialty}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Date/Time */}
                                <div className="flex items-center gap-2 text-sm text-primary/50">
                                    <Clock size={14} />
                                    <span>
                                        {paymentData.date
                                            ? new Date(paymentData.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
                                            : "—"}
                                        {" • "}
                                        {paymentData.slot?.startTime}
                                    </span>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="border-t border-primary/10 pt-5 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-primary/40">Subtotal</span>
                                    <span className="font-semibold text-primary">₹{subtotal.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-red-500 font-medium">New Patient Discount</span>
                                    <span className="text-red-500 font-bold">-₹{discount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-primary/40">Convenience Fee</span>
                                    <span className="text-emerald-600 font-semibold">₹{convenienceFee}</span>
                                </div>
                                <div className="border-t border-primary/10 pt-3 flex justify-between items-baseline">
                                    <span className="text-primary font-bold">Total</span>
                                    <span className="font-display text-3xl font-bold text-primary">₹{total.toLocaleString("en-IN")}</span>
                                </div>
                            </div>

                            {/* Guarantee */}
                            <div className="mt-6 flex items-center gap-2 p-3 bg-emerald-50/50 rounded-xl">
                                <Shield className="text-emerald-500 shrink-0" size={16} />
                                <span className="text-[11px] text-emerald-700 font-medium">30-day money-back guarantee</span>
                            </div>

                            {/* Payment Logos */}
                            <div className="mt-5 flex flex-wrap items-center gap-2">
                                {["VISA", "MC", "UPI", "NB"].map((logo) => (
                                    <span key={logo} className="px-2.5 py-1 bg-primary/5 rounded text-[9px] font-bold text-primary/30 uppercase tracking-wider">
                                        {logo}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
