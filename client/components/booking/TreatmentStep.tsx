"use client";

import { Stethoscope, CheckCircle2 } from "lucide-react";
import { Treatment } from "@/lib/booking.api";

/**
 * Normalise any price string to INR display format.
 * "$299" → "₹299"   "₹299" → "₹299"   "299" → "₹299"
 * "From $500" → "From ₹500"
 */
function toINR(priceRange: string): string {
    if (!priceRange) return "";
    // Replace any currency symbol ($ £ € etc.) with ₹
    return priceRange.replace(/[$£€]/g, "₹");
}

interface TreatmentStepProps {
    treatments: Treatment[];
    selectedId: string | null;
    onSelect: (treatment: Treatment) => void;
    isLoading: boolean;
}

export default function TreatmentStep({ treatments, selectedId, onSelect, isLoading }: TreatmentStepProps) {
    if (isLoading) {
        return (
            <section>
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
                    <div className="h-7 w-44 bg-slate-100 rounded-lg animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="rounded-2xl border-2 border-slate-100 bg-white p-6 space-y-4 animate-pulse"
                        >
                            <div className="h-8 w-8 bg-slate-100 rounded-lg" />
                            <div className="h-5 w-3/4 bg-slate-100 rounded-md" />
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-slate-50 rounded" />
                                <div className="h-3 w-2/3 bg-slate-50 rounded" />
                            </div>
                            <div className="h-4 w-16 bg-slate-100 rounded-md" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 mb-8">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">1</span>
                <h3 className="text-2xl font-display font-bold text-primary">Select Treatment</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {treatments.map((treatment) => {
                    const isSelected = selectedId === treatment.id;

                    return (
                        <div
                            key={treatment.id}
                            onClick={() => onSelect(treatment)}
                            className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 ${isSelected
                                ? "border-primary bg-white shadow-xl shadow-primary/5"
                                : "border-slate-100 bg-white hover:border-primary/20 hover:shadow-md"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <Stethoscope
                                    size={28}
                                    className={isSelected ? "text-primary" : "text-slate-700 group-hover:text-primary transition-colors"}
                                />
                                {isSelected && (
                                    <div className="bg-primary text-white size-6 rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                                        <CheckCircle2 size={14} />
                                    </div>
                                )}
                            </div>

                            <h4 className="font-display font-bold text-lg mb-1">{treatment.name}</h4>
                            <p className="text-sm text-slate-500 mb-4 leading-relaxed line-clamp-2">
                                {treatment.description || "Premium clinical restoration performed by vetted specialists."}
                            </p>

                            <p className="text-primary font-bold text-sm tracking-tight">
                                {toINR(treatment.priceRange)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
