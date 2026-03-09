"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { LogIn, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Suspense } from "react";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const redirectTo = searchParams.get("callbackUrl") || searchParams.get("redirect") || "/dashboard";
  const prefillEmail = searchParams.get("email") || "";
  const justRegistered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [noAccount, setNoAccount] = useState(false);

  // Auto-fill credentials from registration (sessionStorage)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("smilecare_prefill");
      if (stored) {
        const credentials = JSON.parse(stored);
        if (credentials.email) setEmail(credentials.email);
        if (credentials.password) setPassword(credentials.password);
        sessionStorage.removeItem("smilecare_prefill");
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNoAccount(false);
    setLoading(true);
    try {
      await login(email, password);
      router.push(decodeURIComponent(redirectTo));

    } catch (err: any) {
      if (err?.type === 'USER_NOT_FOUND') {
        setNoAccount(true);
        setError(err?.message || "User not found. Please create an account.");
      } else if (err?.type === 'INVALID_CREDENTIALS') {
        setError(err?.message || "Incorrect password. Please try again.");
      } else {
        setError(err?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const callbackUrl = redirectTo || "/dashboard";
    const pendingBooking = sessionStorage.getItem("pendingBooking");
    if (pendingBooking) {
      try {
        const parsed = JSON.parse(pendingBooking);
        const withStep = { ...parsed, currentStep: 4 };
        sessionStorage.setItem("pendingBooking", JSON.stringify(withStep));
      } catch {
        // ignore malformed pendingBooking
      }
    }
    loginWithGoogle(callbackUrl);
  };

  // Clear specific inline errors on input changes
  const clearErrors = () => {
    setError("");
    setNoAccount(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-display font-bold text-navy-deep">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to your SmileCare account
          </p>
        </div>

        {justRegistered && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-800">
                Registration successful!
              </p>
              <p className="text-sm text-emerald-700 mt-1">
                Your account has been created. Please log in with your credentials.
              </p>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-slate-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearErrors();
                }}
                className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-slate-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearErrors();
                  }}
                  className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm pr-10 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPw ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {noAccount && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 flex flex-wrap items-start gap-1">
              <span>⚠️ No account found.</span>
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="font-bold underline text-primary hover:no-underline transition-colors animate-pulse hover:animate-none ml-1"
              >
                Create an account
              </button>
              <span>first.</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-primary hover:opacity-80 transition-opacity"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:opacity-90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary/50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          {/* OAuth Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-600 font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-primary hover:opacity-80 transition-opacity"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background-light">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
