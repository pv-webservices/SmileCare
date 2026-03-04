"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2, CheckCircle2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SettingsPage() {
    const [form, setForm] = useState({ name: "", phone: "", dob: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${API}/api/patient/me`, { credentials: "include" }).catch(() => null);
                if (res?.ok) {
                    const p = await res.json();
                    setForm({
                        name: p.name || "",
                        phone: p.phone || "",
                        dob: p.dob ? new Date(p.dob).toISOString().split("T")[0] : "",
                    });
                }
            } catch { /* fallback */ }
            setLoading(false);
        };
        load();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        try {
            const res = await fetch(`${API}/api/patient/me`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            }).catch(() => null);
            if (res?.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch { /* silent */ }
        setSaving(false);
    };

    return (
        <>
            <header className="sticky top-0 z-40 bg-background-light/80 backdrop-blur-md border-b border-primary/5 px-4 sm:px-8 py-6">
                <h2 className="font-display text-3xl font-bold text-primary tracking-tight flex items-center gap-3">
                    <Settings size={28} /> Account Settings
                </h2>
                <p className="text-primary/90 mt-1">Manage your profile information</p>
            </header>

            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <Loader2 size={32} className="animate-spin text-primary" />
                </div>
            ) : (
                <div className="p-4 sm:p-8 max-w-2xl mx-auto">
                    {/* Success toast */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 animate-in fade-in">
                            <CheckCircle2 size={20} />
                            <span className="text-sm font-bold">Profile updated successfully!</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-primary/5 p-4 sm:p-8 space-y-6">
                        <h3 className="text-lg font-bold text-primary">Personal Information</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-primary/90 uppercase tracking-wider mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-background-light text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                                    placeholder="Your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-primary/90 uppercase tracking-wider mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-background-light text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                                    placeholder="+91 1234567890"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-primary/90 uppercase tracking-wider mb-2">Date of Birth</label>
                                <input
                                    type="date"
                                    value={form.dob}
                                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-background-light text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 w-full sm:w-auto"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </form>

                    {/* Password Section */}
                    <div className="bg-white rounded-2xl border border-primary/5 p-4 sm:p-8 mt-6 space-y-4">
                        <h3 className="text-lg font-bold text-primary">Security</h3>
                        <p className="text-sm text-primary/90">Password changes must be done through the login flow. Use &quot;Forgot Password&quot; on the login page to reset your password.</p>
                    </div>
                </div>
            )}
        </>
    );
}
