"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    CalendarDays,
    History,
    FileText,
    Settings,
    HelpCircle,
    PlusCircle,
    LogOut,
    Menu,
    X,
    User,
    CalendarCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { label: "My Bookings", icon: CalendarDays, href: "/dashboard/bookings" },
    { label: "Appointments", icon: CalendarCheck, href: "/dashboard/appointments" },
    { label: "History", icon: History, href: "/dashboard/history" },
    { label: "Documents", icon: FileText, href: "/dashboard/documents" },
];

const accountItems = [
    { label: "Profile", icon: User, href: "/dashboard/profile" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
    { label: "Support", icon: HelpCircle, href: "/dashboard/support" },
];

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Sidebar() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    const handleLogout = async () => {
        try {
            await fetch(`${API}/api/auth/logout`, {
                method: "POST",
                credentials: "include",
            }).catch(() => null);
        } catch { /* silent */ }
        router.push("/");
    };

    useEffect(() => {
        if (user?.role === "admin") {
            router.replace("/admin");
        }
    }, [user, router]);

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setOpen(true)}
                className="fixed top-5 left-5 z-[60] lg:hidden size-10 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20"
                aria-label="Open menu"
            >
                <Menu size={20} />
            </button>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:sticky top-0 left-0 z-[70] lg:z-auto
                    w-72 h-screen bg-white border-r border-primary/10
                    flex flex-col transition-transform duration-300
                    ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                {/* Logo + Close */}
                <div className="p-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 cursor-pointer">
                        <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <span className="font-display font-bold text-lg">S</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-primary text-lg font-bold leading-none">SmileCare</h1>
                            <p className="text-primary/90 text-xs font-semibold uppercase tracking-wider">Clinical Luxury</p>
                        </div>
                    </Link>
                    <button
                        onClick={() => setOpen(false)}
                        className="lg:hidden text-primary/90 hover:text-primary"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    <div className="py-4">
                        <p className="px-3 text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] mb-2">Main Menu</p>
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive(item.href)
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-primary/90 hover:bg-primary/5 hover:text-primary/70"
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="py-4">
                        <p className="px-3 text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] mb-2">Account</p>
                        {accountItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive(item.href)
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-primary/90 hover:bg-primary/5 hover:text-primary/70"
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* Bottom Section */}
                <div className="p-4 mt-auto">
                    <Link
                        href="/booking"
                        className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-primary/30 hover:opacity-90 transition-all"
                    >
                        <PlusCircle size={18} />
                        Book Appointment
                    </Link>

                    <div className="mt-6 p-3 bg-primary/5 rounded-xl flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary flex items-center justify-center shrink-0 text-white font-bold text-sm">
                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-primary truncate">
                                {user?.name || "Guest User"}
                            </p>
                            <p className="text-[10px] text-primary/90 uppercase tracking-tight">
                                {user?.role === "admin" ? "Admin" : "Patient"}
                            </p>
                        </div>
                        <button onClick={handleLogout} className="text-primary/30 hover:text-primary transition-colors" aria-label="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
