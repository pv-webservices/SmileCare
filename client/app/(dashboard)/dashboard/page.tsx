"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Bell,
    Clock,
    MapPin,
    CalendarPlus,
    Navigation,
    Briefcase,
    FileDown,
    FileText,
    CreditCard,
    ImageIcon,
    Headphones,
    Receipt,
    Award,
    Loader2,
} from "lucide-react";
import { getLocalUpcomingBookings, getLocalBookings } from "@/lib/booking-storage";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Mock Fallbacks ──────────────────────────────────────────────────────────
const mockProfile = {
    name: "Alex Sterling",
    email: "alex@smilecare.com",
    loyaltyPoints: 120,
    membership: "Premium",
};

const mockUpcoming = [
    {
        id: "u1",
        treatment: "Orthodontic Adjustment",
        doctor: "Dr. Julian Thorne",
        date: new Date(Date.now() + 86400000).toISOString(),
        startTime: "10:00 AM",
        status: "confirmed",
        treatmentImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHC_LZZbAXz_CsPMjrDEua0XDRyXwXOLyk5RKbMffTjx4twl8BozYK1oyJzFZyKjHSLn_8EoKbUzukp0v3C9GhVuKpOOAJMNbPY8m2uuU1LuHVwZT_HBw2rTW4B_EYvOfGooAMlO00qptfOGWhMXHKMan55JsQZYHjUNXdEcNbj9M244LcP4-auI9X-TyjrladchrktP91mTgQzC466L6LIPFOjR0mOsbHAn39w9zlvEajBOgCKn6jCFKYWTAGtkP-XauAVrQmMoNt",
        specialization: "Orthodontics",
    },
];

const mockHistory = [
    { id: "h1", treatment: "Deep Cleaning & Polish", doctor: "Dr. Sarah Laine", date: "2023-10-12", startTime: "09:00 AM", status: "completed", paymentAmount: 15000, paymentStatus: "captured" },
    { id: "h2", treatment: "Invisalign Scan", doctor: "Dr. Julian Thorne", date: "2023-09-05", startTime: "10:30 AM", status: "completed", paymentAmount: 25000, paymentStatus: "captured" },
    { id: "h3", treatment: "Initial Consultation", doctor: "Dr. Julian Thorne", date: "2023-08-14", startTime: "02:00 PM", status: "completed", paymentAmount: 5000, paymentStatus: "captured" },
];

const mockDocs = [
    { id: "1", name: "Post-Op Guide.pdf", type: "Care Instructions", size: "1.2 MB" },
    { id: "2", name: "Annual_Invoice_2023.pdf", type: "Billing Statement", size: "840 KB" },
    { id: "3", name: "X-Ray_Results_Sep.zip", type: "Imaging Data", size: "15.4 MB" },
];

const docIcons: Record<string, typeof FileText> = {
    "Care Instructions": FileText,
    "Billing Statement": CreditCard,
    "Imaging Data": ImageIcon,
};

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(mockProfile);
    const [upcoming, setUpcoming] = useState<any[]>(
        () => {
            if (typeof window === "undefined") return mockUpcoming;
            const local = getLocalUpcomingBookings();
            return local.length > 0 ? local : mockUpcoming;
        }
    );
    const [history, setHistory] = useState<any[]>(
        () => {
            if (typeof window === "undefined") return mockHistory;
            const local = getLocalBookings().slice(0, 3);
            return local.length > 0 ? local : mockHistory;
        }
    );
    const [docs, setDocs] = useState<any[]>(mockDocs);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [pRes, uRes, hRes, dRes] = await Promise.all([
                    fetch(`${API}/api/patient/me`, { credentials: "include" }).catch(() => null),
                    fetch(`${API}/api/patient/appointments/upcoming`, { credentials: "include" }).catch(() => null),
                    fetch(`${API}/api/patient/appointments/history`, { credentials: "include" }).catch(() => null),
                    fetch(`${API}/api/patient/documents`, { credentials: "include" }).catch(() => null),
                ]);

                if (pRes?.ok) {
                    setProfile(await pRes.json());
                } else if (user) {
                    // Use auth context user as fallback profile
                    setProfile({
                        name: user.name,
                        email: user.email,
                        loyaltyPoints: 0,
                        membership: "Standard",
                    });
                }

                const localUpcoming = getLocalUpcomingBookings();

                if (uRes?.ok) {
                    const serverUpcoming = await uRes.json();
                    // Merge: server data takes precedence, local fills gaps
                    if (serverUpcoming.length > 0) {
                        setUpcoming(serverUpcoming);
                    } else if (localUpcoming.length > 0) {
                        setUpcoming(localUpcoming);
                    }
                } else {
                    // API failed or offline — use sessionStorage
                    if (localUpcoming.length > 0) {
                        setUpcoming(localUpcoming);
                    }
                }

                if (hRes?.ok) {
                    const h = await hRes.json();
                    setHistory(h.slice(0, 3));
                } else {
                    // Show recently confirmed (local) as history fallback
                    const localAll = getLocalBookings().slice(0, 3);
                    if (localAll.length > 0) setHistory(localAll);
                }

                if (dRes?.ok) { const d = await dRes.json(); setDocs(d.slice(0, 3)); }
            } catch { /* fallback to mock */ }
            setLoading(false);
        };
        load();
    }, []);

    const first = upcoming[0];

    return (
        <>
            {/* Sticky Header */}
            <header className="sticky top-0 z-40 bg-background-light/80 backdrop-blur-md border-b border-primary/5 px-8 py-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="font-display text-3xl font-black text-primary tracking-tight">
                            Welcome back, {profile.name?.split(" ")[0] || "Alex"}
                        </h2>
                        <p className="text-primary/50 mt-1 font-sans">
                            Your next smile transformation is just around the corner.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl">
                            <Award size={16} className="text-accent-gold" />
                            <span className="text-xs font-bold text-primary">{profile.loyaltyPoints} pts</span>
                            <span className="text-[10px] bg-accent-gold/20 text-accent-gold px-2 py-0.5 rounded-full font-bold uppercase">{profile.membership}</span>
                        </div>
                        <button className="size-10 flex items-center justify-center rounded-full bg-white border border-primary/10 text-primary/40 hover:text-primary transition-colors">
                            <Bell size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <Loader2 size={32} className="animate-spin text-primary" />
                </div>
            ) : (
                <div className="p-8 max-w-6xl mx-auto space-y-8">

                    {/* Upcoming Appointment */}
                    {first && (
                        <section>
                            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                <CalendarPlus size={20} className="text-primary" />
                                Upcoming Appointment
                            </h3>
                            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-primary/5 flex flex-col md:flex-row">
                                <div className="md:w-1/3 relative h-48 md:h-auto min-h-[200px]">
                                    <Image
                                        src={first.treatmentImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuBHC_LZZbAXz_CsPMjrDEua0XDRyXwXOLyk5RKbMffTjx4twl8BozYK1oyJzFZyKjHSLn_8EoKbUzukp0v3C9GhVuKpOOAJMNbPY8m2uuU1LuHVwZT_HBw2rTW4B_EYvOfGooAMlO00qptfOGWhMXHKMan55JsQZYHjUNXdEcNbj9M244LcP4-auI9X-TyjrladchrktP91mTgQzC466L6LIPFOjR0mOsbHAn39w9zlvEajBOgCKn6jCFKYWTAGtkP-XauAVrQmMoNt"}
                                        alt="Clinic"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                        <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                            {first.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="md:w-2/3 p-6 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-xl font-bold text-primary">{first.treatment}</h4>
                                            <div className="flex flex-col gap-2 mt-3">
                                                <div className="flex items-center gap-2 text-primary/60">
                                                    <Clock size={16} className="text-primary shrink-0" />
                                                    <span className="text-sm font-medium">
                                                        {formatDate(first.date)} at {first.startTime} • {first.doctor}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-primary/60">
                                                    <MapPin size={16} className="text-primary shrink-0" />
                                                    <span className="text-sm">SmileCare Premium Clinic, 5th Avenue</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-primary/5 p-3 rounded-xl hidden sm:block">
                                            <Briefcase size={28} className="text-primary" />
                                        </div>
                                    </div>
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
                                            <CalendarPlus size={16} /> Add to Calendar
                                        </button>
                                        <button className="flex items-center gap-2 bg-primary/5 text-primary px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/10 transition-all">
                                            <Navigation size={16} /> Get Directions
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {!first && (
                        <div className="bg-white rounded-2xl border-2 border-dashed border-primary/15 p-10 text-center">
                            <CalendarPlus size={40} className="text-primary/20 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-primary mb-2">
                                No Upcoming Appointments
                            </h3>
                            <p className="text-primary/40 text-sm mb-6">
                                Book your next visit with one of our world-class specialists.
                            </p>
                            <Link
                                href="/booking"
                                className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                            >
                                Book Appointment
                            </Link>
                        </div>
                    )}

                    {/* Grid: History + Documents */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Treatment History */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                                    <Receipt size={20} className="text-primary" /> Treatment History
                                </h3>
                                <Link href="/dashboard/history" className="text-primary text-sm font-bold hover:underline">View All</Link>
                            </div>
                            <div className="bg-white rounded-2xl border border-primary/5 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-primary/5">
                                            <th className="px-6 py-4 text-[11px] font-bold text-primary/40 uppercase tracking-widest">Date</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-primary/40 uppercase tracking-widest">Treatment</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-primary/40 uppercase tracking-widest text-center">Status</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-primary/40 uppercase tracking-widest text-right">Invoice</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-primary/5">
                                        {history.map((row) => (
                                            <tr key={row.id} className="hover:bg-primary/[0.02] transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-primary/70">{formatDate(row.date)}</td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-primary">{row.treatment}</p>
                                                    <p className="text-xs text-primary/40">{row.doctor}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter ${row.status === "completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                        }`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-primary/30 hover:text-primary transition-colors">
                                                        <FileDown size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Documents + Help */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                                <FileText size={20} className="text-primary" /> Clinical Documents
                            </h3>
                            <div className="space-y-3">
                                {docs.map((doc) => {
                                    const Icon = docIcons[doc.type] || FileText;
                                    return (
                                        <div key={doc.id} className="bg-white p-4 rounded-2xl border border-primary/5 flex items-center gap-4 group hover:border-primary/20 transition-all cursor-pointer">
                                            <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Icon size={22} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-primary truncate">{doc.name}</p>
                                                <p className="text-[10px] text-primary/40">{doc.type} • {doc.size}</p>
                                            </div>
                                            <FileDown size={18} className="text-primary/20 group-hover:text-primary transition-colors shrink-0" />
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 p-6 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden">
                                <div className="relative z-10">
                                    <h4 className="text-sm font-bold text-primary mb-1">Need help with your plan?</h4>
                                    <p className="text-xs text-primary/50 mb-4 leading-relaxed">Our clinical advisors are available for direct messaging.</p>
                                    <Link href="/dashboard/support" className="block w-full text-center bg-white text-primary text-[11px] font-black uppercase tracking-wider py-2.5 rounded-lg shadow-sm hover:bg-primary hover:text-white transition-colors">
                                        Message Care Team
                                    </Link>
                                </div>
                                <Headphones size={80} className="absolute -bottom-3 -right-3 text-primary/10 -rotate-12" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
