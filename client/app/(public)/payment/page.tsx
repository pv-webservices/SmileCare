"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  CreditCard,
  Shield,
  Lock,
  ChevronRight,
  Clock,
  Smartphone,
  Building2,
  Wallet,
  AlertTriangle,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { getApiBaseUrl } from "@/lib/api-base";
import { addLocalBooking } from "@/lib/booking-storage";
import {
  clearPaymentSession,
  clearPendingBooking,
  clearPendingPaymentVerification,
  getPaymentSession,
  getPendingPaymentVerification,
  setPaymentSession,
  setPendingPaymentVerification,
  type PaymentSession,
  type PendingPaymentVerification,
} from "@/lib/booking-session";

type PaymentTab = "card" | "upi" | "netbanking" | "wallets";
type PageState = "loading" | "form" | "processing" | "success" | "expired" | "error";

const PROCESSING_MESSAGES = [
  "Connecting to payment gateway...",
  "Processing payment...",
  "Verifying transaction...",
];

const BANKS = ["SBI", "HDFC", "ICICI", "AXIS", "KOTAK", "YES"];
const WALLETS = ["Paytm", "PhonePe", "Amazon Pay", "Mobikwik"];

export default function PaymentPage() {
  const router = useRouter();
  const { success, error: toastError, warning } = useToast();
  const { isAuthenticated, user } = useAuth();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [paymentData, setPaymentData] = useState<PaymentSession | null>(null);
  const [activeTab, setActiveTab] = useState<PaymentTab>("card");
  const [processingMsg, setProcessingMsg] = useState(0);
  const [errorMessage, setErrorMessage] = useState("Please complete the booking form before proceeding to payment.");
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [isPreparingOrder, setIsPreparingOrder] = useState(false);
  const [isFinalizingStoredPayment, setIsFinalizingStoredPayment] = useState(false);

  useEffect(() => {
    const storedSession = getPaymentSession();
    if (!storedSession) {
      setErrorMessage("Please start the booking process from the booking page.");
      setPageState("error");
      return;
    }
    setPaymentData(storedSession);
    setPageState("form");
  }, []);

  const subtotal = paymentData?.treatment?.price || paymentData?.amount || 249;
  const discount = subtotal >= 500 ? 500 : 0;
  const convenienceFee = 0;
  const total = Math.max(1, subtotal - discount + convenienceFee);
  const PAYMENT_MODE = process.env.NEXT_PUBLIC_PAYMENT_MODE;

  useEffect(() => {
    if (pageState !== "form" || !paymentData || paymentData.orderId || isPreparingOrder) {
      return;
    }

    const prepareOrder = async () => {
      setIsPreparingOrder(true);
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/payments/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            slotId: paymentData.slotId,
            treatmentId: paymentData.treatmentId,
            amount: total,
          }),
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(payload?.error?.message || payload?.message || "Failed to initialize payment.");
        }
        const nextSession: PaymentSession = {
          ...paymentData,
          orderId: payload.data?.orderId || payload.orderId,
          amount: payload.data?.amount || total,
          currency: payload.data?.currency || "INR",
        };
        setPaymentData(nextSession);
        setPaymentSession(nextSession);
      } catch (error: any) {
        setErrorMessage(error.message || "Could not prepare the payment order.");
        setPageState("error");
      } finally {
        setIsPreparingOrder(false);
      }
    };

    void prepareOrder();
  }, [isPreparingOrder, pageState, paymentData, total]);

  useEffect(() => {
    if (pageState !== "form") return;
    const interval = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(interval);
          setPageState("expired");
          warning("Payment Session Expired", "Your reserved slot has been released. Please book again.");
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pageState, warning]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isFormValid = useCallback(() => {
    switch (activeTab) {
      case "card":
        return cardNumber.replace(/\s/g, "").length === 16 && expiry.length === 5 && cvv.length === 3 && cardName.length > 0;
      case "upi":
        return upiId.includes("@") && upiId.length > 3;
      case "netbanking":
        return !!selectedBank;
      case "wallets":
        return !!selectedWallet;
      default:
        return false;
    }
  }, [activeTab, cardName, cardNumber, cvv, expiry, selectedBank, selectedWallet, upiId]);

  const finalizeSuccess = useCallback((nextPaymentId: string, nextBookingId: string) => {
    if (!paymentData) return;
    setPaymentId(nextPaymentId);
    setBookingId(nextBookingId);
    addLocalBooking({
      id: nextBookingId,
      paymentId: nextPaymentId,
      treatment: paymentData.treatment.title,
      treatmentId: paymentData.treatment.id,
      doctor: paymentData.specialist?.name || "SmileCare Specialist",
      specialization: paymentData.specialist?.specialty || "",
      date: paymentData.date,
      startTime: paymentData.slot.startTime,
      status: "confirmed",
      paymentAmount: total,
      paymentStatus: "captured",
      confirmedAt: new Date().toISOString(),
    });
    clearPendingPaymentVerification();
    clearPaymentSession();
    clearPendingBooking();
    setPageState("success");
    success("Payment Successful!", "Your appointment has been confirmed.");
  }, [paymentData, success, total]);

  const verifyPaymentOnServer = useCallback(async (payload: PendingPaymentVerification) => {
    const res = await fetch(`${getApiBaseUrl()}/api/payments/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error?.message || data?.message || "Payment verification failed.");
    }
    return data;
  }, []);

  const redirectToLoginToFinalize = useCallback((payload: PendingPaymentVerification) => {
    setPendingPaymentVerification(payload);
    success("Payment received", "Please sign in or create an account to confirm your booking.");
    router.replace(`/login?callbackUrl=${encodeURIComponent("/payment")}`);
  }, [router, success]);

  useEffect(() => {
    if (!isAuthenticated || !paymentData || pageState !== "form" || isFinalizingStoredPayment) {
      return;
    }

    const pendingVerification = getPendingPaymentVerification();
    if (!pendingVerification || !paymentData.orderId || pendingVerification.orderId !== paymentData.orderId) {
      return;
    }

    let cancelled = false;

    const finalizePendingPayment = async () => {
      setIsFinalizingStoredPayment(true);
      setPageState("processing");
      setProcessingMsg(PROCESSING_MESSAGES.length - 1);
      try {
        const data = await verifyPaymentOnServer(pendingVerification);
        if (cancelled) return;
        finalizeSuccess(
          data.data?.payment?.id || pendingVerification.razorpayPaymentId || `pay_${Date.now()}`,
          data.data?.booking?.id || `book_${Date.now()}`
        );
      } catch (error: any) {
        if (cancelled) return;
        setPageState("form");
        toastError("Verification Failed", error.message || "Payment could not be verified after login.");
      } finally {
        if (!cancelled) {
          setIsFinalizingStoredPayment(false);
        }
      }
    };

    void finalizePendingPayment();

    return () => {
      cancelled = true;
    };
  }, [finalizeSuccess, isAuthenticated, isFinalizingStoredPayment, pageState, paymentData, toastError, verifyPaymentOnServer]);

  const buildVerificationPayload = useCallback((override?: Partial<PendingPaymentVerification>): PendingPaymentVerification | null => {
    if (!paymentData?.orderId) return null;
    return {
      orderId: paymentData.orderId,
      slotId: paymentData.slotId,
      treatmentId: paymentData.treatmentId,
      sessionId: paymentData.sessionId,
      idempotencyKey: paymentData.idempotencyKey,
      amount: total,
      ...override,
    };
  }, [paymentData, total]);

  const handleRazorpayPay = async () => {
    if (!paymentData?.orderId) return;
    setPageState("processing");
    try {
      await new Promise<void>((resolve, reject) => {
        if (typeof (window as any).Razorpay !== "undefined") {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
        document.head.appendChild(script);
      });

      await new Promise<void>((resolve, reject) => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: Math.round(total * 100),
          currency: paymentData.currency || "INR",
          name: "SmileCare",
          description: paymentData.treatment.title,
          order_id: paymentData.orderId,
          prefill: {
            name: paymentData.patient?.name || user?.name || "",
            email: paymentData.patient?.email || user?.email || "",
            contact: paymentData.patient?.phone || user?.phone || "",
          },
          theme: { color: "#1a3a5c" },
          handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            try {
              const verificationPayload = buildVerificationPayload({
                orderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (!verificationPayload) {
                throw new Error("Payment session is missing verification data.");
              }

              if (!isAuthenticated) {
                redirectToLoginToFinalize(verificationPayload);
                resolve();
                return;
              }

              const data = await verifyPaymentOnServer(verificationPayload);
              finalizeSuccess(
                data.data?.payment?.id || response.razorpay_payment_id,
                data.data?.booking?.id || `book_${Date.now()}`
              );
              resolve();
            } catch (error: any) {
              toastError("Verification Failed", error.message || "Payment could not be verified.");
              setPageState("form");
              reject(error);
            }
          },
          modal: {
            ondismiss: () => {
              warning("Payment Cancelled", "You closed the payment window.");
              setPageState("form");
              resolve();
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", (resp: any) => {
          toastError("Payment Failed", resp.error?.description || "Payment was declined.");
          setPageState("form");
          reject(new Error(resp.error?.description));
        });
        rzp.open();
      });
    } catch (err: any) {
      toastError("Payment Error", err.message || "Something went wrong.");
      setPageState("form");
    }
  };

  const handleMockPay = async () => {
    if (!paymentData?.orderId || !isFormValid()) return;
    setPageState("processing");
    setProcessingMsg(0);

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

    await new Promise((r) => setTimeout(r, 2500));
    clearInterval(msgInterval);

    try {
      const verificationPayload = buildVerificationPayload();
      if (!verificationPayload) {
        throw new Error("Payment session is missing verification data.");
      }

      if (!isAuthenticated) {
        redirectToLoginToFinalize(verificationPayload);
        return;
      }

      const data = await verifyPaymentOnServer(verificationPayload);
      finalizeSuccess(
        data.data?.payment?.id || `pay_${Date.now()}`,
        data.data?.booking?.id || `book_${Date.now()}`
      );
    } catch (error: any) {
      toastError("Payment Failed", error.message || "Payment verification failed.");
      setPageState("form");
    }
  };

  const canSubmit = PAYMENT_MODE === "razorpay" ? !!paymentData?.orderId && !isPreparingOrder : isFormValid() && !!paymentData?.orderId && !isPreparingOrder;

  const handlePay = async () => {
    if (!paymentData || !canSubmit) return;
    if (PAYMENT_MODE === "razorpay") {
      await handleRazorpayPay();
    } else {
      await handleMockPay();
    }
  };

  const tabs: { key: PaymentTab; label: string; icon: React.ReactNode }[] = [
    { key: "card", label: "Card", icon: <CreditCard size={16} /> },
    { key: "upi", label: "UPI", icon: <Smartphone size={16} /> },
    { key: "netbanking", label: "Net Banking", icon: <Building2 size={16} /> },
    { key: "wallets", label: "Wallets", icon: <Wallet size={16} /> },
  ];

  if (pageState === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-background-light"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  if (pageState === "error") {
    return (
      <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-background-light px-4 py-16">
        <div className="max-w-md w-full bg-pearl rounded-2xl shadow-xl border border-primary/10 p-10 text-center">
          <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-50 flex items-center justify-center"><XCircle className="text-red-500" size={32} /></div>
          <h1 className="font-display text-2xl text-primary mb-2">Payment Unavailable</h1>
          <p className="text-primary/40 text-sm mb-8">{errorMessage}</p>
          <Link href="/booking" className="inline-block bg-primary text-white px-4 sm:px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all">Go to Booking</Link>
        </div>
      </main>
    );
  }

  if (pageState === "expired") {
    return (
      <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-background-light px-4 py-16">
        <div className="max-w-md w-full bg-pearl rounded-2xl shadow-xl border border-primary/10 p-10 text-center">
          <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center"><AlertTriangle className="text-amber-500" size={32} /></div>
          <h1 className="font-display text-2xl text-primary mb-2">Session Expired</h1>
          <p className="text-primary/40 text-sm mb-8">Your payment session has timed out. Please try booking again.</p>
          <Link href="/booking" className="inline-block bg-primary text-white px-4 sm:px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all">Book Again</Link>
        </div>
      </main>
    );
  }

  if (pageState === "processing") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-md">
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"><Loader2 className="text-primary animate-spin" size={36} /></div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl text-primary font-bold">Processing Payment</h2>
              <p className="text-primary/50 font-medium text-sm animate-pulse">{PROCESSING_MESSAGES[processingMsg]}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (pageState === "success") {
    return (
      <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-background-light px-4 py-16">
        <div className="max-w-lg w-full bg-pearl rounded-2xl shadow-xl border border-primary/10 p-10">
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center"><CheckCircle2 className="text-emerald-500" size={40} /></div>
          <h1 className="font-display text-3xl text-primary text-center font-bold mb-1">Booking Confirmed</h1>
          <p className="text-center text-emerald-600 font-semibold text-sm mb-6">Payment captured successfully</p>
          <div className="bg-white rounded-xl border border-primary/5 p-5 space-y-3 mb-6">
            <div className="flex justify-between text-sm"><span className="text-primary/40">Booking ID</span><span className="font-mono text-xs text-primary/60">{bookingId.slice(0, 20)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-primary/40">Payment ID</span><span className="font-mono text-xs text-primary/60">{paymentId.slice(0, 20)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-primary/40">Amount Paid</span><span className="font-bold text-primary">INR {total.toLocaleString("en-IN")}</span></div>
          </div>
          <div className="flex gap-3 mb-6">
            <Link href="/dashboard/bookings" className="flex-1 bg-primary text-white text-center py-3 rounded-xl font-bold hover:opacity-90 transition-all">View My Bookings</Link>
            <Link href="/" className="flex-1 border-2 border-primary/20 text-primary text-center py-3 rounded-xl font-bold hover:bg-primary/5 transition-all">Back to Home</Link>
          </div>
        </div>
      </main>
    );
  }

  if (!paymentData) return null;

  return (
    <main className="min-h-screen bg-background-light py-10 px-4">
      <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-5 gap-4 sm:p-8">
        <div className="lg:col-span-3">
          <div className="bg-pearl rounded-2xl shadow-xl border border-primary/10 p-4 sm:p-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-display text-2xl text-primary font-bold">Complete Your Payment</h1>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${timeLeft < 120 ? "bg-red-50 text-red-600" : "bg-primary/5 text-primary/60"}`}><Clock size={13} />{formatTimer(timeLeft)}</div>
            </div>
            <p className="text-primary/40 text-sm mb-3">Review your booking below, then complete payment to confirm it.</p>
            {!isAuthenticated && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                You can pay now without logging in. After payment, we will send you to login or sign up so we can attach the booking to your account.
              </div>
            )}
            {isPreparingOrder && <div className="mb-6 rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm text-primary/60 flex items-center gap-2"><Loader2 className="animate-spin" size={16} />Preparing your secure payment order...</div>}

            {PAYMENT_MODE !== "razorpay" && (
              <>
                <div className="flex gap-1 p-1 bg-primary/5 rounded-xl mb-8">
                  {tabs.map((tab) => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.key ? "bg-white text-primary shadow-sm" : "text-primary/40 hover:text-primary/60"}`}>
                      {tab.icon}<span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {activeTab === "card" && <div className="space-y-5"><input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim())} placeholder="0000 0000 0000 0000" className="w-full border border-primary/15 rounded-xl px-4 py-3.5 bg-white text-primary font-mono" /><div className="grid grid-cols-2 gap-4"><input type="text" value={expiry} onChange={(e) => setExpiry(e.target.value.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(\d{0,2})/, (_m, mm, yy) => yy ? `${mm}/${yy}` : mm))} placeholder="MM/YY" className="w-full border border-primary/15 rounded-xl px-4 py-3.5 bg-white text-primary font-mono" /><input type="password" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="..." className="w-full border border-primary/15 rounded-xl px-4 py-3.5 bg-white text-primary font-mono" /></div><input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Full name on card" className="w-full border border-primary/15 rounded-xl px-4 py-3.5 bg-white text-primary" /></div>}
                {activeTab === "upi" && <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" className="w-full border border-primary/15 rounded-xl px-4 py-3.5 bg-white text-primary" />}
                {activeTab === "netbanking" && <div className="grid grid-cols-3 gap-3">{BANKS.map((bank) => <button key={bank} onClick={() => setSelectedBank(bank)} className={`border-2 rounded-xl p-4 text-center transition-all ${selectedBank === bank ? "border-primary bg-primary/5 text-primary" : "border-primary/10 text-primary/50"}`}>{bank}</button>)}</div>}
                {activeTab === "wallets" && <div className="grid grid-cols-2 gap-3">{WALLETS.map((wallet) => <button key={wallet} onClick={() => setSelectedWallet(wallet)} className={`border-2 rounded-xl p-4 text-center transition-all ${selectedWallet === wallet ? "border-primary bg-primary/5 text-primary" : "border-primary/10 text-primary/50"}`}>{wallet}</button>)}</div>}
              </>
            )}

            {PAYMENT_MODE === "razorpay" && <div className="py-10 text-center text-primary/50">Secure Razorpay checkout will open when you continue.</div>}

            <button onClick={() => void handlePay()} disabled={!canSubmit} className={`w-full mt-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${canSubmit ? "bg-primary text-white shadow-lg shadow-primary/25 hover:opacity-90" : "bg-primary/10 text-primary/30 cursor-not-allowed"}`}>
              <Lock size={16} />Pay INR {total.toLocaleString("en-IN")}<ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 mt-8 lg:mt-0">
          <div className="bg-pearl rounded-2xl shadow-xl border border-primary/10 p-4 sm:p-8 sticky top-28 space-y-6">
            <div>
              <p className="text-xs font-bold text-primary/30 uppercase tracking-wider mb-2">Booking Review</p>
              <p className="font-display text-lg font-bold text-primary">{paymentData.treatment.title}</p>
              {paymentData.specialist && <p className="text-sm text-primary/50 mt-1">with {paymentData.specialist.name}</p>}
            </div>
            <div className="space-y-3 text-sm text-primary/60">
              <div className="flex items-center gap-2"><Clock size={14} /><span>{new Date(paymentData.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} - {paymentData.slot.startTime}</span></div>
              {paymentData.patient && <><div className="flex items-center gap-2"><User size={14} /><span>{paymentData.patient.name}</span></div><div className="flex items-center gap-2"><Mail size={14} /><span>{paymentData.patient.email}</span></div><div className="flex items-center gap-2"><Phone size={14} /><span>{paymentData.patient.phone}</span></div></>}
            </div>
            <div className="border-t border-primary/10 pt-5 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-primary/40">Subtotal</span><span className="font-semibold text-primary">INR {subtotal.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between text-sm"><span className="text-red-500 font-medium">New Patient Discount</span><span className="text-red-500 font-bold">-INR {discount.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between text-sm"><span className="text-primary/40">Convenience Fee</span><span className="text-emerald-600 font-semibold">INR {convenienceFee.toLocaleString("en-IN")}</span></div>
              <div className="border-t border-primary/10 pt-3 flex justify-between items-baseline"><span className="text-primary font-bold">Total</span><span className="font-display text-3xl font-bold text-primary">INR {total.toLocaleString("en-IN")}</span></div>
            </div>
            <div className="mt-6 flex items-center gap-2 p-3 bg-emerald-50/50 rounded-xl"><Shield className="text-emerald-500 shrink-0" size={16} /><span className="text-[11px] text-emerald-700 font-medium">Your booking will be confirmed right after payment verification and sign-in.</span></div>
          </div>
        </div>
      </div>
    </main>
  );
}
