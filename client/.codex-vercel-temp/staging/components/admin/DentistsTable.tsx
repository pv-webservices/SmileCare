"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { UserCheck, UserX } from "lucide-react";

interface DentistsTableProps {
    dentists: any[];
    loading: boolean;
    onToggle: () => void;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DentistsTable({ dentists, loading, onToggle }: DentistsTableProps) {
    const { success, error: showError } = useToast();
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleToggle = async (d: any) => {
        const action = d.isActive ? "Deactivate" : "Activate";
        if (!window.confirm(`${action} Dr. ${d.user?.name || 'Unknown'}?`)) return;

        setActionLoading(d.id);
        try {
            const res = await fetch(`${API}/api/admin/dentists/${d.id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !d.isActive }),
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                success(`Dr. ${d.user?.name} is now ${!d.isActive ? 'Active' : 'Inactive'}`);
                onToggle();
            } else {
                showError(data.error || "Failed to toggle status");
            }
        } catch {
            showError("Network error");
        } finally {
            setActionLoading(null);
        }
    };

    const activeCount = dentists.filter(d => d.isActive).length;

    return (
        <div className="flex flex-col gap-4">
            {!loading && (
                <div className="text-sm font-bold text-primary/60 mb-2">
                    {activeCount} active / {dentists.length} total staff members
                </div>
            )}

            <div className="bg-white border border-primary/10 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-primary/5 text-primary/60 uppercase text-[10px] tracking-widest font-bold">
                            <tr className="border-b border-primary/10">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Specialization</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Toggle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-primary/40">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                            Loading...
                                        </div>
                                    </td>
                                </tr>
                            ) : dentists.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-primary/40">
                                        No dentists found.
                                    </td>
                                </tr>
                            ) : (
                                dentists.map((d) => (
                                    <tr key={d.id} className="hover:bg-primary/[0.02] transition-colors">
                                        <td className="px-6 py-4 font-bold text-primary">
                                            Dr. {d.user?.name || "Unknown"}
                                        </td>
                                        <td className="px-6 py-4 text-primary/70">
                                            {d.user?.email || "—"}
                                        </td>
                                        <td className="px-6 py-4 text-primary/70">
                                            {d.specialization || d.specialty || "—"}
                                        </td>
                                        <td className="px-6 py-4 text-primary/70 font-mono text-xs">
                                            {new Date(d.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                ${d.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {d.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                disabled={actionLoading === d.id}
                                                onClick={() => handleToggle(d)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ml-auto
                                                    ${d.isActive
                                                        ? "border-red-200 text-red-600 hover:bg-red-50"
                                                        : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                                    } disabled:opacity-50`}
                                            >
                                                {d.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                                                {d.isActive ? "Deactivate" : "Activate"}
                                            </button>
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
