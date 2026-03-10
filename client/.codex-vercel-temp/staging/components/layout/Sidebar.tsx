"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Sidebar: React.FC = () => {
    const pathname = usePathname();

    const links = [
        { label: "Overview", href: "/dashboard", icon: "📊" },
        { label: "My Bookings", href: "/dashboard/bookings", icon: "📅" },
        { label: "Profile", href: "/dashboard/profile", icon: "👤" },
        { label: "Payments", href: "/dashboard/payments", icon: "💳" },
    ];

    return (
        <aside className="w-64 bg-navy-deep text-pearl flex flex-col min-h-screen">
            <div className="p-6 border-b border-pearl/10">
                <Link href="/" className="text-xl font-display font-bold text-white tracking-tight">
                    Smile<span className="text-accent-gold">Care</span>
                </Link>
                <p className="text-[10px] text-accent-gold uppercase tracking-[0.2em] mt-1 font-semibold">
                    Patient Portal
                </p>
            </div>

            <nav className="flex-1 p-4 space-y-1 mt-4">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`
              flex items-center space-x-3 px-4 py-3 rounded-default transition-all duration-200 text-sm font-medium
              ${pathname === link.href
                                ? "bg-primary text-white shadow-md"
                                : "text-pearl/60 hover:bg-white/5 hover:text-white"
                            }
            `}
                    >
                        <span className="text-lg">{link.icon}</span>
                        <span>{link.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-pearl/10">
                <button className="flex items-center space-x-3 px-4 py-3 w-full text-sm font-medium text-pearl/40 hover:text-white transition-colors">
                    <span>Logout</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                </button>
            </div>
        </aside>
    );
};
