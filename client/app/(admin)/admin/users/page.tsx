"use client";

import { useState, useEffect } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import UsersTable from "@/components/admin/UsersTable";
import { Search } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const ROLES = [
    { label: "All", value: "" },
    { label: "Patient", value: "patient" },
    { label: "Dentist", value: "dentist" },
    { label: "Admin", value: "admin" },
];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [roleFilter, setRoleFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const limit = 20;

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const url = new URL(`${API}/api/admin/users`);
            url.searchParams.append("page", page.toString());
            url.searchParams.append("limit", limit.toString());
            if (roleFilter) url.searchParams.append("role", roleFilter);

            const res = await fetch(url.toString(), { credentials: "include" });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data.users);
                setTotal(data.data.total);
            }
        } catch (err) {
            console.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, roleFilter]);

    const handleFilterChange = (val: string) => {
        setRoleFilter(val);
        setPage(1);
    };

    // Client-side search within the currently loaded page of users
    const filteredUsers = users.filter((u) => {
        const q = searchQuery.toLowerCase();
        return (
            (u.name?.toLowerCase() || "").includes(q) ||
            (u.email?.toLowerCase() || "").includes(q)
        );
    });

    return (
        <div>
            <AdminPageHeader
                title="User Directory"
                subtitle="Manage registered users and system administrators"
            />

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                    {ROLES.map((r) => {
                        const isActive = roleFilter === r.value;
                        return (
                            <button
                                key={r.label}
                                onClick={() => handleFilterChange(r.value)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                                    ${isActive
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "bg-white border border-primary/20 text-primary/60 hover:border-primary/40 hover:text-primary"
                                    }`}
                            >
                                {r.label}
                            </button>
                        );
                    })}
                </div>
                <div className="relative w-full md:w-64">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40">
                        <Search size={16} />
                    </span>
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 text-sm rounded-xl border border-primary/20 focus:border-primary outline-none transition-all"
                    />
                </div>
            </div>

            <UsersTable
                users={filteredUsers}
                loading={loading}
                page={page}
                total={total}
                limit={limit}
                onPageChange={setPage}
            />
        </div>
    );
}
