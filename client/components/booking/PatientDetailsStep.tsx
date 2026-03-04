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

export interface PatientDetails {
    name: string;
    phone: string;
    email: string;
    notes: string;
}

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
        name: initial?.name ?? "",
        phone: initial?.phone ?? "",
        email: initial?.email ?? "",
        notes: initial?.notes ?? "",
    });

    const [errors, setErrors] = useState<
        Partial<Record<keyof PatientDetails, string>>
    >({});

    useEffect(() => {
        if (!user) return;
        setForm((prev) => ({
            ...prev,
            name: prev.name || user.name || "",
            phone: prev.phone || user.phone || "",
            email: prev.email || user.email || "",
        }));
    }, [user]);

    const validate = (): boolean => {
        const errs: Partial<Record<keyof PatientDetails, string>> = {};
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

    const base =
        "w-full px-4 py-3.5 rounded-xl border bg-white text-slate-900 " +
        "font-medium placeholder:text-slate-300 focus:outline-none " +
        "focus:ring-2 focus:ring-primary/20 focus:border-primary/30 " +
        "transition-all text-sm";

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-2">
                    Step 4 of 5
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                    Your Details
                </h2>
                <p className="text-slate-500 text-base leading-relaxed">
                    Please confirm your contact information so we can prepare
                    everything before your visit.
                </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
                <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-4 sm:p-8 space-y-6">

                    <div className="grid sm:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <User size={13} className="text-primary" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, name: e.target.value }))
                                }
                                placeholder="Your full name"
                                autoComplete="name"
                                className={`${base} ${errors.name ? "border-red-300" : "border-slate-200"}`}
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                                    <Info size={12} /> {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <Phone size={13} className="text-primary" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, phone: e.target.value }))
                                }
                                placeholder="+91 98765 43210"
                                autoComplete="tel"
                                className={`${base} ${errors.phone ? "border-red-300" : "border-slate-200"}`}
                            />
                            {errors.phone && (
                                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                                    <Info size={12} /> {errors.phone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <Mail size={13} className="text-primary" />
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, email: e.target.value }))
                            }
                            placeholder="you@example.com"
                            autoComplete="email"
                            className={`${base} ${errors.email ? "border-red-300" : "border-slate-200"}`}
                        />
                        {errors.email && (
                            <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                                <Info size={12} /> {errors.email}
                            </p>
                        )}
                        {!errors.email && (
                            <p className="text-xs text-slate-700">
                                Booking confirmation will be sent here
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <MessageSquare size={13} className="text-primary" />
                            Special Notes{" "}
                            <span className="text-slate-300 normal-case tracking-normal font-medium">
                                (Optional)
                            </span>
                        </label>
                        <textarea
                            value={form.notes}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, notes: e.target.value }))
                            }
                            placeholder="Allergies, anxiety, accessibility needs..."
                            rows={4}
                            className={`${base} resize-none border-slate-200`}
                        />
                    </div>
                </div>

                <div className="flex items-start gap-3 mt-5 px-1">
                    <Info size={14} className="text-slate-700 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-700 leading-relaxed">
                        Your information is encrypted and used only to prepare
                        for your appointment. We never share your data.
                    </p>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        type="submit"
                        className="flex items-center gap-2.5 bg-primary text-white px-4 sm:px-8 py-4 rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                        Review Booking
                        <ArrowRight size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
}
