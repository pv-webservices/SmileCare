"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, CalendarDays, IndianRupee, CalendarCheck, CheckCircle, XCircle } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StatCard from "@/components/admin/StatCard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, bookingsRes] = await Promise.all([
                    fetch(`${API}/api/admin/stats`, { credentials: "include" }),
                    fetch(`${API}/api/admin/bookings?page=1&limit=5`, { credentials: "include" })
                ]);

                if (!statsRes.ok || !bookingsRes.ok) throw new Error("Failed to fetch");

                const statsData = await statsRes.json();
                const bookingsData = await bookingsRes.json();

                if (statsData.success) setStats(statsData.data);
                if (bookingsData.success) setRecentBookings(bookingsData.data.bookings || []);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div>
                <AdminPageHeader title="Dashboard Overview" subtitle="Real-time clinic statistics" />
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="animate-pulse bg-primary/5 rounded-2xl h-28" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div>
                <AdminPageHeader title="Dashboard Overview" subtitle="Real-time clinic statistics" />
                <div className="text-center py-20 text-primary/40">
                    <p>Could not load stats. Ensure you are logged in as admin.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <AdminPageHeader title="Dashboard Overview" subtitle="Real-time clinic statistics" />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <StatCard
                    label="Total Patients"
                    value={stats.totalPatients}
                    icon={<Users size={24} />}
                    color="primary"
                />
                <StatCard
                    label="Today's Bookings"
                    value={stats.todayBookings}
                    icon={<CalendarDays size={24} />}
                    color="green"
                />
                <StatCard
                    label="Total Revenue"
                    value={`₹${(stats.totalRevenue / 100).toLocaleString("en-IN")}`}
                    sub="from captured payments"
                    icon={<IndianRupee size={24} />}
                    color="gold"
                />
                <StatCard
                    label="Confirmed Bookings"
                    value={stats.confirmedBookings}
                    icon={<CalendarCheck size={24} />}
                    color="primary"
                />
                <StatCard
                    label="Completed Bookings"
                    value={stats.completedBookings}
                    icon={<CheckCircle size={24} />}
                    color="green"
                />
                <StatCard
                    label="Cancelled Bookings"
                    value={stats.cancelledBookings}
                    icon={<XCircle size={24} />}
                    color="red"
                />
            </div>

            {/* Recent Bookings Preview */}
            <div className="bg-pearl border border-primary/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-primary/10 flex items-center justify-between bg-white">
                    <h2 className="font-display font-bold text-lg text-primary">Recent Bookings</h2>
                    <Link
                        href="/admin/bookings"
                        className="text-sm font-semibold text-primary/60 hover:text-primary transition-colors flex items-center gap-1"
                    >
                        View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-primary/5 text-primary/60 uppercase text-[10px] tracking-widest font-bold">
                            <tr className="border-b border-primary/5">
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Treatment</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {recentBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-primary/40">
                                        No recent bookings found.
                                    </td>
                                </tr>
                            ) : (
                                recentBookings.map((bk) => (
                                    <tr key={bk.id} className="hover:bg-primary/[0.02] transition-colors">
                                        <td className="px-6 py-4 font-medium text-primary">
                                            {bk.patient?.user?.name || "Unknown"}
                                        </td>
                                        <td className="px-6 py-4 text-primary/70">
                                            {bk.treatment?.name || "—"}
                                        </td>
                                        <td className="px-6 py-4 text-primary/70">
                                            {new Date(bk.slot.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            {" at "}{bk.slot.startTime}
                                        </td>
                                        <td className="px-6 py-4 text-primary/70 font-medium">
                                            {bk.payment?.amount ? `₹${bk.payment.amount / 100}` : "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                                ${bk.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                                    bk.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                        bk.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                                            bk.status === 'pending_payment' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-gray-100 text-gray-600'}`}>
                                                {bk.status.replace("_", " ")}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
