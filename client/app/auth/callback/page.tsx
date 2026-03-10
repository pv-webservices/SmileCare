"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api-base";
import { getPendingBooking } from "@/lib/booking-session";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

async function tryBackendGoogleLogin(email: string, name: string, providerId: string) {
    const response = await fetch(`${getApiBaseUrl()}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            email,
            name,
            provider: "google",
            providerId,
        }),
    });

    const payload = await response.json().catch(() => ({}));
    return { response, payload };
}

async function loginWithOAuthPassword(email: string, password: string) {
    const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
    });

    const payload = await response.json().catch(() => ({}));
    return { response, payload };
}

async function registerOAuthUser(name: string, email: string, password: string) {
    const response = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            name,
            email,
            phone: "",
            password,
        }),
    });

    const payload = await response.json().catch(() => ({}));
    return { response, payload };
}

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshUser } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const code = searchParams.get("code");
                let session = (await supabase.auth.getSession()).data.session;

                if (!session && code) {
                    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                    if (exchangeError) {
                        throw exchangeError;
                    }
                    session = data.session;
                }

                if (!session) {
                    const { data, error: sessionError } = await supabase.auth.getSession();
                    if (sessionError) {
                        throw sessionError;
                    }
                    session = data.session;
                }

                if (!session) {
                    throw new Error("No Supabase session was created.");
                }

                const user = session.user;
                const email = user.email;
                const name = user.user_metadata?.full_name || user.user_metadata?.name || email?.split("@")[0] || "User";

                if (!email) {
                    throw new Error("Could not retrieve email from Google.");
                }

                let { response: loginRes, payload } = await tryBackendGoogleLogin(email, name, user.id);

                if (!loginRes.ok) {
                    const oauthPassword = `oauth_${email}`;
                    const oauthLogin = await loginWithOAuthPassword(email, oauthPassword);
                    loginRes = oauthLogin.response;
                    payload = oauthLogin.payload;

                    if (loginRes.status === 404) {
                        const { response: registerRes, payload: registerPayload } = await registerOAuthUser(name, email, oauthPassword);
                        if (!registerRes.ok && registerRes.status !== 400) {
                            throw new Error(registerPayload.message || "Google sign-in could not create your account.");
                        }

                        const retry = await loginWithOAuthPassword(email, oauthPassword);
                        loginRes = retry.response;
                        payload = retry.payload;
                    }
                }

                if (!loginRes.ok) {
                    throw new Error(payload.message || "Google sign-in could not be completed. Please sign in with your password once if this email already has an account.");
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
