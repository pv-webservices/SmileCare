"use client";

import { useState, useMemo } from "react";
import TreatmentsSearch from "./TreatmentsSearch";
import TreatmentsFilterBar from "./TreatmentsFilterBar";
import TreatmentCard from "./TreatmentCard";
import type { Treatment } from "./TreatmentCard";
import { TREATMENTS } from "@/lib/treatments-data";

const STATIC_TREATMENTS: Treatment[] = TREATMENTS.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    category: t.category,
    description: t.description,
    image: t.image,
}));

const TreatmentsGrid = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const filteredTreatments = useMemo(() => {
        return STATIC_TREATMENTS.filter((treatment) => {
            const matchesCategory =
                activeCategory === "All" || treatment.category === activeCategory;
            const matchesSearch =
                searchQuery.trim() === "" ||
                treatment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                treatment.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, activeCategory]);

    return (
        <div>
            <TreatmentsSearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />
            <TreatmentsFilterBar
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {filteredTreatments.map((treatment) => (
                    <TreatmentCard key={treatment.slug} treatment={treatment} />
                ))}
            </div>
        </div>
    );
};

export default TreatmentsGrid;
