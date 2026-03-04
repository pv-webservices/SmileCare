"use client";  // Required by Next.js for error.tsx

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log to error reporting service in production
        // e.g., Sentry.captureException(error);
        console.error("[GlobalError]", error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <main className="min-h-screen bg-background-light flex items-center
                                 justify-center px-4">
                    <div className="max-w-md w-full text-center space-y-8">
                        {/* Icon */}
                        <div className="mx-auto size-20 rounded-full bg-red-50 flex
                                        items-center justify-center">
                            <AlertTriangle className="text-red-500" size={36} />
                        </div>

                        {/* Heading */}
                        <div className="space-y-3">
                            <h1 className="font-display text-4xl font-bold text-primary">
                                Something went wrong
                            </h1>
                            <p className="text-primary/50 text-base leading-relaxed">
                                An unexpected error occurred. Our team has been notified.
                            </p>
                            {process.env.NODE_ENV === "development" && error?.message && (
                                <p className="text-xs font-mono bg-red-50 text-red-600
                                              border border-red-100 rounded-xl px-4 py-3
                                              text-left break-words mt-4">
                                    {error.message}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={reset}
                                className="flex items-center justify-center gap-2 px-6 py-3
                                           bg-primary text-white rounded-xl font-bold
                                           hover:opacity-90 transition-all
                                           shadow-lg shadow-primary/20"
                            >
                                <RefreshCw size={16} />
                                Try Again
                            </button>
                            <Link
                                href="/"
                                className="flex items-center justify-center gap-2 px-6 py-3
                                           border-2 border-primary/20 text-primary rounded-xl
                                           font-bold hover:bg-primary/5 transition-all"
                            >
                                <Home size={16} />
                                Go Home
                            </Link>
                        </div>

                        {/* Error ID */}
                        {error?.digest && (
                            <p className="text-[11px] text-primary/20 font-mono">
                                Error ID: {error.digest}
                            </p>
                        )}
                    </div>
                </main>
            </body>
        </html>
    );
}
