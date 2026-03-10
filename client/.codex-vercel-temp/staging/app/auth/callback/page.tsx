"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { getPendingBooking } from "@/lib/booking-session";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshUser } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const { data, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !data.session) {
                    setError("Failed to authenticate with Google. Please try again.");
                    setTimeout(() => router.push("/login"), 3000);
                    return;
                }

                const user = data.session.user;
                const email = user.email;
                const name = user.user_metadata?.full_name || user.user_metadata?.name || email?.split("@")[0] || "User";

                if (!email) {
                    setError("Could not retrieve email from Google. Please try again.");
                    setTimeout(() => router.push("/login"), 3000);
                    return;
                }

                const loginRes = await fetch(`${API}/api/auth/google/callback`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        email,
                        name,
                        provider: "google",
                        providerId: user.id,
                    }),
                });

                const payload = await loginRes.json().catch(() => ({}));

                if (!loginRes.ok) {
                    throw new Error(payload.message || "Google sign-in could not be completed.");
                }

                if (payload.token && typeof window !== "undefined") {
                    localStorage.setItem("smilecare_token", payload.token);
                }

                await refreshUser();

                const pendingBooking = getPendingBooking();
                const callbackUrl = searchParams.get("callbackUrl") || pendingBooking?.callbackUrl || "/dashboard";
                router.replace(callbackUrl);
            } catch (err) {
                console.error("Auth callback error:", err);
                setError("Authentication failed. Redirecting to login...");
                setTimeout(() => router.push("/login"), 3000);
            }
        };

        void handleCallback();
    }, [router, refreshUser, searchParams]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light px-4">
                <div className="text-center space-y-4 max-w-sm w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-red-600 text-xl font-bold">!</span>
                    </div>
                    <p className="text-red-700 font-medium">{error}</p>
                    <p className="text-sm text-slate-500">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light">
            <div className="text-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                <p className="text-base text-slate-600 font-medium animate-pulse">Completing sign-in...</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background-light">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                        <p className="text-base text-slate-600 font-medium animate-pulse">Completing sign-in...</p>
                    </div>
                </div>
            }
        >
            <CallbackContent />
        </Suspense>
    );
}