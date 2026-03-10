"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, CalendarDays, Users,
    FileText, UserCog, Menu, X, LogOut, ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { label: "Bookings", icon: CalendarDays, href: "/admin/bookings" },
    { label: "Dentists", icon: UserCog, href: "/admin/dentists" },
    { label: "CMS", icon: FileText, href: "/admin/cms" },
    { label: "Users", icon: Users, href: "/admin/users" },
];

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminSidebar() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (href: string) =>
        href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

    const handleLogout = async () => {
        await fetch(`${API}/api/auth/logout`, {
            method: "POST", credentials: "include"
        }).catch(() => null);
        window.location.href = "/";
    };

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setOpen(true)}
                className="fixed top-5 left-5 z-[60] lg:hidden size-10 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20"
            >
                <Menu size={20} />
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            <aside
                className={`
                    fixed lg:sticky top-0 left-0 z-[70] lg:z-auto
                    w-64 h-screen bg-white border-r border-primary/10
                    flex flex-col transition-transform duration-300
                    ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                {/* Logo */}
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h1 className="text-primary text-base font-bold leading-none">
                                SmileCare
                            </h1>
                            <p className="text-primary/40 text-[10px] font-bold uppercase tracking-widest">
                                Admin Panel
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="lg:hidden text-primary/40 hover:text-primary"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    <p className="px-3 text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] mb-2 pt-4">
                        Management
                    </p>
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm
                                        ${isActive(item.href)
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-primary/50 hover:bg-primary/5 hover:text-primary/70"
                                }`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 mt-auto">
                    <div className="p-3 bg-primary/5 rounded-xl flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary flex items-center justify-center shrink-0 text-white font-bold text-sm">
                            {user?.name?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-primary truncate">
                                {user?.name || "Admin"}
                            </p>
                            <p className="text-[10px] text-primary/40 uppercase tracking-tight">
                                Administrator
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-primary/30 hover:text-primary transition-colors"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
