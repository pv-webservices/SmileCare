"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
    User,
    Mail,
    Phone,
    Calendar,
    Save,
    Loader2,
    CheckCircle2,
    ShieldCheck,
    Star,
    Edit3,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ProfileForm {
    name: string;
    email: string;
    phone: string;
    dob: string;
    gender: string;
    bloodGroup: string;
    allergies: string;
    emergencyContact: string;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const { success, error: toastError } = useToast();

    const [form, setForm] = useState<ProfileForm>({
        name: "",
        email: "",
        phone: "",
        dob: "",
        gender: "",
        bloodGroup: "",
        allergies: "",
        emergencyContact: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // ── Load profile ───────────────────────────────────────────────────

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${API}/api/patient/me`, {
                    credentials: "include",
                }).catch(() => null);

                if (res?.ok) {
                    const p = await res.json();
                    setForm({
                        name: p.name || user?.name || "",
                        email: p.email || user?.email || "",
                        phone: p.phone || user?.phone || "",
                        dob: p.dob
                            ? new Date(p.dob).toISOString().split("T")[0]
                            : "",
                        gender: p.gender || "",
                        bloodGroup: p.bloodGroup || "",
                        allergies: p.allergies || "",
                        emergencyContact: p.emergencyContact || "",
                    });
                } else if (user) {
                    // Fallback to auth context
                    setForm((prev) => ({
                        ...prev,
                        name: user.name || "",
                        email: user.email || "",
                        phone: user.phone || "",
                    }));
                }
            } catch {
                /* silent */
            }
            setLoading(false);
        };
        load();
    }, [user]);

    // ── Handle save ────────────────────────────────────────────────────

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`${API}/api/patient/me`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    phone: form.phone,
                    dob: form.dob || undefined,
                    gender: form.gender || undefined,
                    bloodGroup: form.bloodGroup || undefined,
                    allergies: form.allergies || undefined,
                    emergencyContact: form.emergencyContact || undefined,
                }),
            }).catch(() => null);

            if (res?.ok) {
                success("Profile Updated", "Your profile has been saved successfully.");
                setEditMode(false);
                await refreshUser();
            } else {
                const errData = await res?.json().catch(() => ({}));
                toastError(
                    "Update Failed",
                    errData?.message || "Could not save profile. Please try again."
                );
            }
        } catch {
            toastError("Network Error", "Could not reach the server.");
        }
        setSaving(false);
    };

    // ── Helpers ────────────────────────────────────────────────────────

    const Field = ({
        label,
        icon: Icon,
        value,
        children,
    }: {
        label: string;
        icon: React.ElementType;
        value?: string;
        children?: React.ReactNode;
    }) => (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-primary/90 uppercase tracking-wider">
                <Icon size={13} />
                {label}
            </label>
            {editMode ? (
                children
            ) : (
                <p className="px-4 py-3 bg-background-light rounded-xl text-primary font-medium text-sm min-h-[46px] flex items-center">
                    {value || (
                        <span className="text-primary/25 italic">Not provided</span>
                    )}
                </p>
            )}
        </div>
    );

    const inputCls =
        "w-full px-4 py-3 rounded-xl border border-primary/10 bg-background-light text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-sm";

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    // ── Avatar initials ────────────────────────────────────────────────

    const initials = form.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <>
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-light/80 backdrop-blur-md border-b border-primary/5 px-4 sm:px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-display text-3xl font-bold text-primary tracking-tight flex items-center gap-3">
                            <User size={28} /> My Profile
                        </h2>
                        <p className="text-primary/90 mt-1">
                            View and manage your personal information
                        </p>
                    </div>
                    <button
                        onClick={() => setEditMode((v) => !v)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${editMode
                                ? "bg-primary/10 text-primary"
                                : "bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90"
                            }`}
                    >
                        <Edit3 size={16} />
                        {editMode ? "Cancel Editing" : "Edit Profile"}
                    </button>
                </div>
            </header>

            <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">

                {/* Profile Card */}
                <div className="bg-white rounded-2xl border border-primary/5 p-4 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar */}
                    <div className="shrink-0">
                        <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center text-white font-display font-bold text-3xl shadow-lg shadow-primary/20">
                            {initials || "U"}
                        </div>
                    </div>
                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-2xl font-display font-bold text-primary">
                            {form.name || "Patient"}
                        </h3>
                        <p className="text-primary/90 text-sm mt-1">{form.email}</p>
                        <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-accent-gold/10 text-accent-gold text-xs font-bold rounded-full">
                                <Star size={11} />
                                Standard Member
                            </span>
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                <ShieldCheck size={11} />
                                Verified
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="space-y-6">

                    {/* Personal Info */}
                    <div className="bg-white rounded-2xl border border-primary/5 p-4 sm:p-8">
                        <h4 className="text-base font-bold text-primary mb-6 pb-4 border-b border-primary/5">
                            Personal Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <Field label="Full Name" icon={User} value={form.name}>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                    className={inputCls}
                                    placeholder="Your full name"
                                />
                            </Field>

                            <Field label="Email Address" icon={Mail} value={form.email}>
                                {/* Email is read-only — changes require re-verification */}
                                <input
                                    type="email"
                                    value={form.email}
                                    disabled
                                    className={`${inputCls} opacity-50 cursor-not-allowed`}
                                    title="Email cannot be changed here"
                                />
                            </Field>

                            <Field label="Phone Number" icon={Phone} value={form.phone}>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) =>
                                        setForm({ ...form, phone: e.target.value })
                                    }
                                    className={inputCls}
                                    placeholder="+91 9876543210"
                                />
                            </Field>

                            <Field
                                label="Date of Birth"
                                icon={Calendar}
                                value={
                                    form.dob
                                        ? new Date(form.dob).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })
                                        : ""
                                }
                            >
                                <input
                                    type="date"
                                    value={form.dob}
                                    onChange={(e) =>
                                        setForm({ ...form, dob: e.target.value })
                                    }
                                    className={inputCls}
                                />
                            </Field>

                            <Field
                                label="Gender"
                                icon={User}
                                value={form.gender}
                            >
                                <select
                                    value={form.gender}
                                    onChange={(e) =>
                                        setForm({ ...form, gender: e.target.value })
                                    }
                                    className={inputCls}
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer_not_to_say">
                                        Prefer not to say
                                    </option>
                                </select>
                            </Field>

                            <Field
                                label="Blood Group"
                                icon={ShieldCheck}
                                value={form.bloodGroup}
                            >
                                <select
                                    value={form.bloodGroup}
                                    onChange={(e) =>
                                        setForm({ ...form, bloodGroup: e.target.value })
                                    }
                                    className={inputCls}
                                >
                                    <option value="">Select blood group</option>
                                    {BLOOD_GROUPS.map((g) => (
                                        <option key={g} value={g}>
                                            {g}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    </div>

                    {/* Medical Info */}
                    <div className="bg-white rounded-2xl border border-primary/5 p-4 sm:p-8">
                        <h4 className="text-base font-bold text-primary mb-6 pb-4 border-b border-primary/5">
                            Medical Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <Field
                                label="Known Allergies"
                                icon={ShieldCheck}
                                value={form.allergies}
                            >
                                <input
                                    type="text"
                                    value={form.allergies}
                                    onChange={(e) =>
                                        setForm({ ...form, allergies: e.target.value })
                                    }
                                    className={inputCls}
                                    placeholder="e.g. Penicillin, Latex"
                                />
                            </Field>

                            <Field
                                label="Emergency Contact"
                                icon={Phone}
                                value={form.emergencyContact}
                            >
                                <input
                                    type="text"
                                    value={form.emergencyContact}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            emergencyContact: e.target.value,
                                        })
                                    }
                                    className={inputCls}
                                    placeholder="Name & phone number"
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Save button — only visible in edit mode */}
                    {editMode && (
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 bg-primary text-white px-4 sm:px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Save size={16} />
                                )}
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    )}
                </form>

                {/* Password notice */}
                <div className="bg-white rounded-2xl border border-primary/5 p-4 sm:p-8">
                    <h4 className="text-base font-bold text-primary mb-2">
                        Security
                    </h4>
                    <p className="text-sm text-primary/90 leading-relaxed">
                        To change your password, use the{" "}
                        <span className="font-bold text-primary">
                            &quot;Forgot Password&quot;
                        </span>{" "}
                        option on the login page. For account security, password
                        changes require email verification.
                    </p>
                </div>
            </div>
        </>
    );
}
