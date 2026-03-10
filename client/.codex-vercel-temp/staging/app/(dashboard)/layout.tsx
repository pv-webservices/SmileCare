"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/dashboard/Sidebar";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading, isAuthenticated } = useAuth();
    const pathname = usePathname();

    useEffect(() => {
        // Only redirect after auth check is complete
        if (!isLoading && !isAuthenticated) {
            // Use window.location for hard redirect - ensures clean
            // navigation that works correctly with cross-origin cookies
            window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
        }
    }, [isLoading, isAuthenticated, pathname]);

    // Show spinner while checking auth state
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    // Show spinner while redirecting to login (unauthenticated)
    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    // Authenticated - render the dashboard with sidebar
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
