"use client";

import Image from "next/image";

import { Specialist } from "@/lib/booking.api";

interface SpecialistStepProps {
    specialists: Specialist[];
    selectedId: string | null;
    onSelect: (specialist: Specialist) => void;
    isLoading: boolean;
}

export default function SpecialistStep({ specialists, selectedId, onSelect, isLoading }: SpecialistStepProps) {
    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 bg-slate-50 rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 mb-8">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">2</span>
                <h3 className="text-2xl font-display font-bold text-primary">Choose Specialist</h3>
            </div>

            <div className="space-y-4">
                {specialists.map((specialist) => {
                    const isSelected = selectedId === specialist.id;

                    return (
                        <div
                            key={specialist.id}
                            onClick={() => onSelect(specialist)}
                            className={`group flex items-center gap-5 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${isSelected
                                ? "border-primary bg-white shadow-xl shadow-primary/5"
                                : "border-slate-100 bg-white hover:border-primary/20"
                                }`}
                        >
                            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-slate-100">
                                <Image
                                    src={specialist.photoUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200"}
                                    alt={specialist.name}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800">{specialist.name}</h4>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">
                                    {specialist.specialization}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="material-symbols-outlined text-yellow-500 text-xs fill-current">star</span>
                                    <span className="text-xs font-bold text-slate-700">4.9</span>
                                    <span className="text-[10px] text-slate-700 font-medium">(100+ reviews)</span>
                                </div>
                            </div>

                            {
                                isSelected ? (
                                    <span className="material-symbols-outlined text-primary text-2xl">check_circle</span>
                                ) : (
                                    <button className="rounded-lg bg-primary/5 px-4 py-1.5 text-[10px] font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                        Select
                                    </button>
                                )
                            }
                        </div>
                    );
                })}
            </div>
        </section >
    );
}
