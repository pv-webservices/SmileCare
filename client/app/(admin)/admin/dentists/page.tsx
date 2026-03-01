"use client";

import { useState, useEffect } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DentistsTable from "@/components/admin/DentistsTable";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminDentistsPage() {
    const [dentists, setDentists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDentists = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/admin/dentists`, { credentials: "include" });
            const data = await res.json();
            if (data.success) {
                setDentists(data.data);
            }
        } catch (err) {
            console.error("Failed to load dentists");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDentists();
    }, []);

    return (
        <div>
            <AdminPageHeader
                title="Manage Staff"
                subtitle="Activate or deactivate dentist profiles"
            />
            <DentistsTable
                dentists={dentists}
                loading={loading}
                onToggle={fetchDentists}
            />
        </div>
    );
}
