"use client";

import { useState, useEffect } from "react";
import { History, FileDown, Loader2 } from "lucide-react";
import { getLocalHistoryBookings, getLocalBookings } from "@/lib/booking-storage";
import { HistoryRowSkeleton } from "@/components/ui/Skeleton";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const mockHistory = [
    { id: "h1", treatment: "Deep Cleaning & Polish", doctor: "Dr. Sarah Laine", date: "2023-10-12", startTime: "09:00 AM", status: "completed", paymentAmount: 15000, paymentStatus: "captured" },
    { id: "h2", treatment: "Invisalign Scan", doctor: "Dr. Julian Thorne", date: "2023-09-05", startTime: "10:30 AM", status: "completed", paymentAmount: 25000, paymentStatus: "captured" },
    { id: "h3", treatment: "Initial Consultation", doctor: "Dr. Julian Thorne", date: "2023-08-14", startTime: "02:00 PM", status: "completed", paymentAmount: 5000, paymentStatus: "captured" },
    { id: "h4", treatment: "Root Canal", doctor: "Dr. Sarah Laine", date: "2023-06-20", startTime: "11:00 AM", status: "completed", paymentAmount: 35000, paymentStatus: "captured" },
    { id: "h5", treatment: "Emergency Visit", doctor: "Dr. Julian Thorne", date: "2023-04-03", startTime: "08:00 AM", status: "cancelled", paymentAmount: null, paymentStatus: null },
];

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrency(amt: number | null) {
    if (amt === null) return "—";
    return `₹${(amt / 100).toLocaleString()}`;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<any[]>(
        () => (typeof window !== "undefined"
            ? getLocalHistoryBookings()
            : [])
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const localHist = getLocalHistoryBookings();
            // Show local immediately while server loads
            if (localHist.length > 0) setHistory(localHist);

            try {
                const res = await fetch(
                    `${API}/api/patient/appointments/history`,
                    { credentials: "include" }
                ).catch(() => null);

                if (res?.ok) {
                    const serverHist = await res.json();
                    const merged = [
                        ...serverHist,
                        ...localHist.filter(
                            (l: any) =>
                                !serverHist.some((s: any) => s.id === l.id)
                        ),
                    ];
                    setHistory(merged);
                }
            } catch { /* keep local data */ }
            setLoading(false);
        };
        load();
    }, []);

    const statusColor = (s: string) => {
        switch (s) {
            case "completed": return "bg-green-100 text-green-700";
            case "cancelled": return "bg-red-100 text-red-700";
            case "no_show": return "bg-amber-100 text-amber-700";
            default: return "bg-gray-100 text-gray-600";
        }
    };

    return (
        <>
            <header className="sticky top-0 z-40 bg-background-light/80 backdrop-blur-md border-b border-primary/5 px-4 sm:px-8 py-6">
                <h2 className="font-display text-3xl font-bold text-primary tracking-tight flex items-center gap-3">
                    <History size={28} /> Treatment History
                </h2>
                <p className="text-primary/90 mt-1">{history.length} past visits</p>
            </header>

            {loading ? (
                <div className="p-4 sm:p-8 max-w-5xl mx-auto">
                    <div className="bg-white rounded-2xl border border-primary/5 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-primary/5">
                                    <th className="px-6 py-4 text-[11px] font-bold text-primary/90 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-primary/90 uppercase tracking-widest">Treatment</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-primary/90 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-primary/90 uppercase tracking-widest text-center">Payment</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-primary/90 uppercase tracking-widest text-right">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                <HistoryRowSkeleton />
                                <HistoryRowSkeleton />
                                <HistoryRowSkeleton />
                                <HistoryRowSkeleton />
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="p-4 sm:p-8 max-w-5xl mx-auto">
                    <div className="bg-white rounded-2xl border border-primary/5 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-primary/5">
                                    <th className="px-6 py-4 text-[11px] font-bold text-primary/90 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-primary/90 uppercase tracking-widest">Treatment</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-primary/90 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-primary/90 uppercase tracking-widest text-center">Payment</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-primary/90 uppercase tracking-widest text-right">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {history.map((row) => (
                                    <tr key={row.id} className="hover:bg-primary/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-primary/70">{formatDate(row.date)}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-primary">{row.treatment}</p>
                                            <p className="text-xs text-primary/90">{row.doctor}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter ${statusColor(row.status)}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-primary/60 font-medium">
                                            {formatCurrency(row.paymentAmount)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {row.paymentAmount && (
                                                <button className="text-primary/30 hover:text-primary transition-colors">
                                                    <FileDown size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}
