"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

function RegisterRedirect() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Redirect /register to /signup preserving all query params
        const params = searchParams.toString();
        router.replace(`/signup${params ? `?${params}` : ""}`);
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }
        >
            <RegisterRedirect />
        </Suspense>
    );
}
