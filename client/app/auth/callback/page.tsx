"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AuthCallbackPage() {
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

                // Sync user with backend — try login first, then register if user doesn't exist
                let synced = false;

                // Try logging in with the backend using a special OAuth endpoint or existing login
                try {
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

                    if (loginRes.ok) {
                        synced = true;
                    }
                } catch {
                    // Backend google callback endpoint may not exist, try regular register/login
                }

                if (!synced) {
                    // Try registering the user with the backend
                    try {
                        const registerRes = await fetch(`${API}/api/auth/register`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({
                                name,
                                email,
                                phone: "",
                                password: `oauth_${user.id}_${Date.now()}`, // Generated password for OAuth users
                                role: "patient",
                            }),
                        });

                        if (registerRes.ok || registerRes.status === 409) {
                            // 409 = user already exists, try login
                            const loginRes = await fetch(`${API}/api/auth/login`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({
                                    email,
                                    password: `oauth_${user.id}_${Date.now()}`,
                                }),
                            });

                            if (!loginRes.ok) {
                                console.warn("OAuth user created but backend login sync may need manual setup");
                            }
                        }
                    } catch {
                        console.warn("Backend sync failed — user authenticated via Supabase only");
                    }
                }

                // Call refreshUser to populate the AuthContext state immediately
                await refreshUser();

                // Redirect logic
                const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
                const pendingBooking = sessionStorage.getItem('pendingBooking');
                if (pendingBooking && callbackUrl.includes("/booking")) {
                    router.replace("/booking");
                } else {
                    router.replace(callbackUrl);
                }
            } catch (err) {
                console.error("Auth callback error:", err);
                setError("Authentication failed. Redirecting to login...");
                setTimeout(() => router.push("/login"), 3000);
            }
        };

        handleCallback();
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
