"use client";

import { useState, useEffect } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import BookingsTable from "@/components/admin/BookingsTable";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const FILTERS = [
    { label: "All", value: "" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Pending", value: "pending_payment" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
];

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const limit = 20;

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const url = new URL(`${API}/api/admin/bookings`);
            url.searchParams.append("page", page.toString());
            url.searchParams.append("limit", limit.toString());
            if (statusFilter) url.searchParams.append("status", statusFilter);

            const res = await fetch(url.toString(), { credentials: "include" });
            const data = await res.json();
            if (data.success) {
                setBookings(data.data.bookings);
                setTotal(data.data.total);
            }
        } catch (err) {
            console.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [page, statusFilter]);

    // Reset page when filter changes
    const handleFilterChange = (val: string) => {
        setStatusFilter(val);
        setPage(1);
    };

    return (
        <div>
            <AdminPageHeader
                title="Manage Bookings"
                subtitle="View and update patient appointment statuses"
            />

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                {FILTERS.map((f) => {
                    const isActive = statusFilter === f.value;
                    return (
                        <button
                            key={f.label}
                            onClick={() => handleFilterChange(f.value)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                                ${isActive
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "bg-white border border-primary/20 text-primary/60 hover:border-primary/40 hover:text-primary"
                                }`}
                        >
                            {f.label}
                        </button>
                    );
                })}
            </div>

            <BookingsTable
                bookings={bookings}
                loading={loading}
                onStatusChange={fetchBookings}
                page={page}
                total={total}
                limit={limit}
                onPageChange={setPage}
            />
        </div>
    );
}
