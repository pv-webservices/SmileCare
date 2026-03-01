"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";

interface BookingsTableProps {
    bookings: any[];
    loading: boolean;
    onStatusChange: () => void;
    page: number;
    total: number;
    limit: number;
    onPageChange: (newPage: number) => void;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function BookingsTable({
    bookings,
    loading,
    onStatusChange,
    page,
    total,
    limit,
    onPageChange
}: BookingsTableProps) {
    const { success, error: showError } = useToast();
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleAction = async (id: string, newStatus: string) => {
        setActionLoading(id);
        try {
            const res = await fetch(`${API}/api/admin/bookings/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                success(`Booking marked as ${newStatus.replace("_", " ")}`);
                onStatusChange();
            } else {
                showError(data.error || "Failed to update status");
            }
        } catch (err) {
            showError("Network error occurred");
        } finally {
            setActionLoading(null);
        }
    };

    const totalPages = Math.ceil(total / limit) || 1;

    return (
        <div className="bg-white border border-primary/10 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-primary/5 text-primary/60 uppercase text-[10px] tracking-widest font-bold sticky top-0 z-10">
                        <tr className="border-b border-primary/10">
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Patient</th>
                            <th className="px-6 py-4">Treatment</th>
                            <th className="px-6 py-4">Doctor</th>
                            <th className="px-6 py-4">Date & Time</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-primary/40">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                        Loading bookings...
                                    </div>
                                </td>
                            </tr>
                        ) : bookings.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-primary/40">
                                    No bookings found.
                                </td>
                            </tr>
                        ) : (
                            bookings.map((bk) => {
                                const st = bk.status;
                                const isUpdating = actionLoading === bk.id;
                                return (
                                    <tr key={bk.id} className="hover:bg-primary/[0.02] transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-primary/40">{bk.id.slice(-6)}</td>
                                        <td className="px-6 py-4 font-bold text-primary">
                                            {bk.patient?.user?.name || "Unknown"}
                                        </td>
                                        <td className="px-6 py-4 text-primary/70">{bk.treatment?.name || "—"}</td>
                                        <td className="px-6 py-4 text-primary/70">
                                            {bk.dentist?.user?.name ? `Dr. ${bk.dentist.user.name}` : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-primary/70">
                                            <div className="font-semibold text-primary">
                                                {new Date(bk.slot.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </div>
                                            <div className="text-xs">{bk.slot.startTime}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-primary/80">
                                            {bk.payment?.amount ? `₹${bk.payment.amount / 100}` : "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                ${st === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                                    st === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                        st === 'cancelled' ? 'bg-red-100 text-red-600' :
                                                            st === 'pending_payment' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-gray-100 text-gray-600'}`}>
                                                {st.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {st === 'pending_payment' && (
                                                    <>
                                                        <button disabled={isUpdating} onClick={() => handleAction(bk.id, 'confirmed')} className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold disabled:opacity-50">Confirm</button>
                                                        <button disabled={isUpdating} onClick={() => handleAction(bk.id, 'cancelled')} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold disabled:opacity-50">Cancel</button>
                                                    </>
                                                )}
                                                {st === 'confirmed' && (
                                                    <>
                                                        <button disabled={isUpdating} onClick={() => handleAction(bk.id, 'completed')} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold disabled:opacity-50">Mark Completed</button>
                                                        <button disabled={isUpdating} onClick={() => handleAction(bk.id, 'cancelled')} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold disabled:opacity-50">Cancel</button>
                                                    </>
                                                )}
                                                {(st === 'completed' || st === 'cancelled') && (
                                                    <span className="text-xs text-primary/30 italic">No actions</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!loading && total > 0 && (
                <div className="p-4 border-t border-primary/10 bg-primary/[0.01] flex items-center justify-between text-sm">
                    <p className="text-primary/60 font-semibold">
                        Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total} bookings
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => onPageChange(page - 1)}
                            className="px-4 py-2 rounded-lg border border-primary/20 text-primary font-bold hover:bg-primary/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        >
                            ← Prev
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => onPageChange(page + 1)}
                            className="px-4 py-2 rounded-lg border border-primary/20 text-primary font-bold hover:bg-primary/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
