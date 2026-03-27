"use client";

import { useState, useEffect } from "react";
import { User, Phone, Mail, MessageSquare, CheckCircle, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export interface PatientDetails {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface PatientDetailsStepProps {
  onSubmit: (details: PatientDetails) => void | Promise<void>;
  initial?: PatientDetails | null;
  isSubmitting?: boolean;
}

export default function PatientDetailsStep({
  onSubmit,
  initial,
  isSubmitting = false,
}: PatientDetailsStepProps) {
  const { user } = useAuth();
  const [form, setForm] = useState<PatientDetails>({
    name: initial?.name ?? "",
    phone: initial?.phone ?? "+91 ",
    email: initial?.email ?? "",
    notes: initial?.notes ?? "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PatientDetails, string>>>({});

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      phone: prev.phone === "+91 " ? user.phone || "+91 " : prev.phone,
      email: prev.email || user.email || "",
    }));
  }, [user]);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof PatientDetails, string>> = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.phone.trim() || form.phone.trim() === "+91")
      errs.phone = "Phone number is required";
    else if (!/^\+91\s?[6-9]\d{9}$/.test(form.phone.trim().replace(/\s/g, "")))
      errs.phone = "Enter a valid Indian phone number (e.g., +91 9876543210)";
    if (!form.email.trim()) errs.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      void onSubmit(form);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const stripped = rawValue.replace("+91", "").replace(/\D/g, "").slice(0, 10);
    setForm((p) => ({ ...p, phone: "+91 " + stripped }));
  };

  const base =
    "w-full px-4 py-3.5 rounded-xl border bg-white text-slate-900 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="text-sm text-slate-500 font-medium mb-2">Step 4 of 4</p>
        <h2 className="text-3xl font-display font-bold text-slate-900 mb-3">
          Your Details
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Please confirm your contact information so we can prepare everything
          before your visit.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          {/* Name */}
          <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">              
                <User size={16} />
              Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Your full name"
              autoComplete="name"
              className={`${base} ${
                errors.name ? "border-red-300" : "border-slate-200"
              }`}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">              
                <Phone size={16} />
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={handlePhoneChange}
              maxLength={14}
              placeholder="+91 9876543210"
              autoComplete="tel"
              className={`${base} ${
                errors.phone ? "border-red-300" : "border-slate-200"
              }`}
            />
            {errors.phone && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            abel className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <Mail size={16} />
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="you@example.com"
              autoComplete="email"
              className={`${base} ${
                errors.email ? "border-red-300" : "border-slate-200"
              }`}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                {errors.email}
              </p>
            )}
            {!errors.email && (
              <p className="mt-1.5 text-xs text-slate-500">
                Booking confirmation will be sent here
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            abel className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <MessageSquare size={16} />
              Special Notes{" "}
              <span className="text-xs font-normal text-slate-400">(Optional)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Allergies, anxiety, accessibility needs..."
              rows={4}
              className={`${base} resize-none border-slate-200`}
            />
          </div>
        </div>

        <div className="flex items-start gap-3 mt-5 px-1">
          <Info size={14} className="text-slate-700 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-700 leading-relaxed">
            Your information is encrypted and used only to prepare for your
            appointment. We never share your data.
          </p>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2.5 bg-primary text-white px-4 sm:px-8 py-4 rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:opacity-90 active:scale-0.98 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Confirming...
              </>
            ) : (
              <>
                Confirm Booking
                <CheckCircle size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
