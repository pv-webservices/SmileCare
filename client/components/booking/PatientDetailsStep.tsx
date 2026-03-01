"use client";

import { useState, useEffect } from "react";
import {
    User,
    Phone,
    Mail,
    MessageSquare,
    ArrowRight,
    Info,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { PatientDetails } from "@/context/BookingContext";

interface PatientDetailsStepProps {
    onSubmit: (details: PatientDetails) => void;
    initial?: PatientDetails | null;
}

export default function PatientDetailsStep({
    onSubmit,
    initial,
}: PatientDetailsStepProps) {
    const { user } = useAuth();

    const [form, setForm] = useState<PatientDetails>({
        name: initial?.name ?? user?.name ?? "",
        phone: initial?.phone ?? user?.phone ?? "",
        email: initial?.email ?? user?.email ?? "",
        notes: initial?.notes ?? "",
    });

    const [errors, setErrors] = useState<Partial<PatientDetails>>({});

    // Re-sync if auth loads after mount
    useEffect(() => {
        if (!initial && user) {
            setForm((prev) => ({
                ...prev,
                name: prev.name || user.name || "",
                phone: prev.phone || user.phone || "",
                email: prev.email || user.email || "",
            }));
        }
    }, [user, initial]);

    const validate = (): boolean => {
        const errs: Partial<PatientDetails> = {};
        if (!form.name.trim())
            errs.name = "Full name is required";
        if (!form.phone.trim())
            errs.phone = "Phone number is required";
        else if (!/^\+?[0-9\s\-]{7,15}$/.test(form.phone.trim()))
            errs.phone = "Enter a valid phone number";
        if (!form.email.trim())
            errs.email = "Email address is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            errs.email = "Enter a valid email address";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) onSubmit(form);
    };

    const inputBase =
        "w-full px-4 py-3.5 rounded-xl border bg-white text-slate-900 font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm";

    const Field = ({
        label,
        icon: Icon,
        children,
        error,
        hint,
    }: {
        label: string;
        icon: React.ElementType;
        children: React.ReactNode;
        error?: string;
        hint?: string;
    }) => (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Icon size={13} className="text-primary" />
                {label}
            </label>
            {children}
            {error && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <Info size={12} /> {error}
                </p>
            )}
            {hint && !error && (
                <p className="text-xs text-slate-400">{hint}</p>
            )}
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Section header */}
            <div className="mb-10">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-2">
                    Step 4 of 5
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-black text-slate-900 mb-3">
                    Your Details
                </h2>
                <p className="text-slate-500 text-base leading-relaxed">
                    Please confirm your contact information so we can prepare
                    everything before your visit.
                </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
                <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-8 space-y-6">

                    {/* Name + Phone */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <Field
                            label="Full Name"
                            icon={User}
                            error={errors.name}
                        >
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                placeholder="Your full name"
                                className={`${inputBase} ${errors.name
                                        ? "border-red-300 focus:ring-red-200"
                                        : "border-slate-200"
                                    }`}
                            />
                        </Field>

                        <Field
                            label="Phone Number"
                            icon={Phone}
                            error={errors.phone}
                            hint="We'll send appointment reminders here"
                        >
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) =>
                                    setForm({ ...form, phone: e.target.value })
                                }
                                placeholder="+91 98765 43210"
                                className={`${inputBase} ${errors.phone
                                        ? "border-red-300 focus:ring-red-200"
                                        : "border-slate-200"
                                    }`}
                            />
                        </Field>
                    </div>

                    {/* Email */}
                    <Field
                        label="Email Address"
                        icon={Mail}
                        error={errors.email}
                        hint="Booking confirmation will be sent here"
                    >
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                            }
                            placeholder="you@example.com"
                            className={`${inputBase} ${errors.email
                                    ? "border-red-300 focus:ring-red-200"
                                    : "border-slate-200"
                                }`}
                        />
                    </Field>

                    {/* Notes */}
                    <Field
                        label="Special Notes (Optional)"
                        icon={MessageSquare}
                        hint="Allergies, anxiety, accessibility needs, or anything else we should know"
                    >
                        <textarea
                            value={form.notes}
                            onChange={(e) =>
                                setForm({ ...form, notes: e.target.value })
                            }
                            placeholder="Any medical notes or special requests..."
                            rows={4}
                            className={`${inputBase} resize-none border-slate-200`}
                        />
                    </Field>
                </div>

                {/* Privacy note */}
                <div className="flex items-start gap-3 mt-6 px-1">
                    <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Your information is encrypted and used only to prepare for
                        your appointment. We never share your data with third parties.
                    </p>
                </div>

                {/* Submit */}
                <div className="mt-8 flex justify-end">
                    <button
                        type="submit"
                        className="flex items-center gap-2.5 bg-primary text-white px-8 py-4 rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                        Review Booking
                        <ArrowRight size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
}
