"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function SignupForm() {
  const { register, loginWithGoogle } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("callbackUrl") || searchParams.get("redirect") || "/dashboard";

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm({ ...form, [key]: value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const rawPhone = form.phone.replace(/\s/g, "");
      const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
      if (!phoneRegex.test(rawPhone)) {
        setError("Please enter a valid Indian mobile number (+91 followed by 10 digits).");
        setLoading(false);
        return;
      }

      const normalizedPhone = rawPhone.startsWith("+91") ? rawPhone : `+91${rawPhone}`;
      const result = await register(form.name, form.email, normalizedPhone, form.password, redirectTo);
      if (!result.success) {
        setLoading(false);
      }
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : "") || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-background-light px-4 py-16">
      <div className="max-w-md w-full bg-pearl rounded-2xl shadow-xl border border-primary/10 p-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-3xl font-display font-bold text-primary">
            SmileCare<span className="text-accent-gold">.</span>
          </Link>
        </div>

        <h1 className="font-display text-4xl text-primary text-center">Create Account</h1>
        <p className="text-primary/50 text-center mt-2 font-sans">
          Join the SmileCare experience.
        </p>

        {error && (
          <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 mt-6 mb-6">
          <button
            type="button"
            onClick={() => void loginWithGoogle(redirectTo)}
            className="flex items-center justify-center gap-3 w-full border border-slate-200 rounded-xl py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">or register with email</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-xs font-bold text-primary/40 uppercase tracking-wider mb-2">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              className="w-full border border-primary/20 rounded-xl px-4 py-3 bg-white text-primary font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-primary/30"
              placeholder="Alex Sterling"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-primary/40 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
              className="w-full border border-primary/20 rounded-xl px-4 py-3 bg-white text-primary font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-primary/30"
              placeholder="alex@smilecare.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-primary/40 uppercase tracking-wider mb-2">Phone</label>
            <div className="flex gap-2">
              <span className="flex items-center px-3 py-3 bg-slate-50 border border-primary/20 rounded-xl text-primary font-bold text-sm shrink-0">
                +91
              </span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                required
                maxLength={10}
                pattern="[6-9][0-9]{9}"
                className="flex-1 border border-primary/20 rounded-xl px-4 py-3 bg-white text-primary font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-primary/30"
                placeholder="10-digit mobile number"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Enter 10-digit number starting with 6-9</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-primary/40 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                minLength={6}
                className="w-full border border-primary/20 rounded-xl px-4 py-3 pr-12 bg-white text-primary font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-primary/30"
                placeholder="Min. 6 characters"
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
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-3.5 font-bold text-base shadow-lg shadow-primary/20 hover:opacity-90 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(redirectTo)}`}
            className="font-bold text-primary hover:underline transition-all"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
