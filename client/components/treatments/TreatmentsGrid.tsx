"use client";

import { useState, useMemo } from "react";
import TreatmentsSearch from "./TreatmentsSearch";
import TreatmentsFilterBar from "./TreatmentsFilterBar";
import TreatmentCard from "./TreatmentCard";
import type { Treatment } from "./TreatmentCard";

const treatments: Treatment[] = [
    {
        id: 1,
        title: "Invisalign Clear Aligners",
        slug: "invisalign-clear-aligners",
        category: "Orthodontics",
        description:
            "Straighten your teeth discreetly without metal braces. Our digital planning ensures a precise, comfortable, and fast transformation of your smile.",
        image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 2,
        title: "Laser Teeth Whitening",
        slug: "laser-teeth-whitening",
        category: "Cosmetic",
        description:
            "Achieve professional results in just one visit. Our advanced laser technology removes deep stains while protecting your enamel and gums.",
        image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 3,
        title: "Permanent Dental Implants",
        slug: "permanent-dental-implants",
        category: "Restorative",
        description:
            "The gold standard for replacing missing teeth. Our implants look, feel, and function exactly like natural teeth, restoring your confidence.",
        image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 4,
        title: "Porcelain Veneers",
        slug: "porcelain-veneers",
        category: "Cosmetic",
        description:
            "Ultra-thin, custom-made shells that cover the front surface of teeth to improve appearance with natural-looking, lasting results.",
        image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 5,
        title: "Dental Crowns & Bridges",
        slug: "dental-crowns-bridges",
        category: "Restorative",
        description:
            "Restore damaged or missing teeth with precision-crafted crowns and bridges that blend seamlessly with your natural smile.",
        image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 6,
        title: "Complete Oral Health Check",
        slug: "complete-oral-health-check",
        category: "Preventative",
        description:
            "Comprehensive examination including digital X-rays, gum health assessment, oral cancer screening, and a personalized care plan.",
        image: "https://images.unsplash.com/photo-1588776813677-77aaf5595b83?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 7,
        title: "Ceramic Braces",
        slug: "ceramic-braces",
        category: "Orthodontics",
        description:
            "Tooth-coloured brackets that blend naturally with your teeth while delivering the same powerful alignment correction as traditional braces.",
        image: "https://images.unsplash.com/photo-1571772996211-2f02974a235a?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 8,
        title: "Deep Cleaning & Scaling",
        slug: "deep-cleaning-scaling",
        category: "Preventative",
        description:
            "Professional deep cleaning to remove plaque and tartar buildup below the gumline, preventing gum disease and maintaining oral health.",
        image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
    },
];

const TreatmentsGrid = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

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
    }, [searchQuery, activeCategory]);

    return (
        <div className="flex flex-col">
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
