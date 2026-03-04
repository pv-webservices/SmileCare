"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LogIn, Loader2, Eye, EyeOff } from "lucide-react";
import { Suspense } from "react";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
    const { login } = useAuth();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") || "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            // Pass redirectTo so AuthContext can redirect to the original page
            await login(email, password, redirectTo);
            window.location.href = redirectTo;
        } catch (err: any) {
            setError(err.message || "Invalid credentials. Please try again.");
            setLoading(false);
        }
    };

    return (
        <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-background-light px-4 py-16">
            <div className="max-w-md w-full bg-pearl rounded-2xl shadow-xl border border-primary/10 p-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block text-3xl font-display font-bold text-primary">
                        SmileCare<span className="text-accent-gold">.</span>
                    </Link>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-display font-bold text-primary mb-1">Welcome Back</h1>
                <p className="text-slate-500 text-sm mb-6">Premium dental experience awaits.</p>

                {/* Context message for payment redirect */}
                {redirectTo === "/payment" && (
                    <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-xl text-sm text-primary font-medium">
                        🔒 Please sign in to complete your payment
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-primary mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full border border-primary/20 rounded-xl px-4 py-3 bg-white text-primary font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-primary/30"
                            placeholder="alex@smilecare.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-primary mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPw ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full border border-primary/20 rounded-xl px-4 py-3 pr-12 bg-white text-primary font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-primary/30"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/30 hover:text-primary"
                            >
                                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-primary font-semibold hover:underline">
                        Create one
                    </Link>
                </p>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
