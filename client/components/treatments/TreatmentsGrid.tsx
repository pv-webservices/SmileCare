"use client";

import { useState, useEffect, useMemo } from "react";
import TreatmentsSearch from "./TreatmentsSearch";
import TreatmentsFilterBar from "./TreatmentsFilterBar";
import TreatmentCard from "./TreatmentCard";
import type { Treatment } from "./TreatmentCard";
import { TREATMENTS } from "@/lib/treatments-data";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATIC_FALLBACK: Treatment[] = TREATMENTS.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    category: t.category,
    description: t.description,
    image: t.image,
}));

const TreatmentsGrid = () => {
    const [treatments, setTreatments] = useState<Treatment[]>(STATIC_FALLBACK);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        fetch(`${API}/api/treatments`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data: any[] | null) => {
                if (data && data.length > 0) {
                    const CATEGORY_MAP: Record<string, string> = {
                        cosmetic: "Cosmetic",
                        orthodontics: "Orthodontics",
                        restorative: "Restorative",
                        preventative: "Preventative",
                        general: "General",
                    };
                    const mapped: Treatment[] = data.map((t) => ({
                        id: t.id,
                        title: t.name,
                        slug: t.slug,
                        category: CATEGORY_MAP[t.category?.name?.toLowerCase()] || t.category?.name || "General",
                        description: t.description || "",
                        image: t.imageUrl || "/images/treatments/placeholder.jpg",
                    }));
                    setTreatments(mapped);
                }
            })
            .catch(() => { /* keep static fallback */ })
            .finally(() => setLoading(false));
    }, []);

    const filteredTreatments = useMemo(() => {
        return treatments.filter((treatment) => {
            const matchesCategory =
                activeCategory === "All" || treatment.category === activeCategory;
            const matchesSearch =
                searchQuery.trim() === "" ||
                treatment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                treatment.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [treatments, searchQuery, activeCategory]);

    return (
        <div className="flex flex-col">
            {loading && (
                <p className="text-xs text-primary/30 mb-4 animate-pulse">
                    Loading treatments...
                </p>
            )}
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-12">
                <div className="w-full lg:flex-1">
                    <TreatmentsSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                </div>
                <div className="flex flex-wrap lg:flex-nowrap gap-3 overflow-x-auto no-scrollbar">
                    <TreatmentsFilterBar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
                </div>
            </div>

            {filteredTreatments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
                    {filteredTreatments.map((treatment) => (
                        <TreatmentCard key={treatment.id} treatment={treatment} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 mb-16">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-display font-bold text-slate-900 dark:text-slate-50 mb-2">
                        No treatments found
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                        Try adjusting your search or filter to find what you&apos;re looking for.
                    </p>
                </div>
            )}
        </div>
    );
};

export default TreatmentsGrid;
