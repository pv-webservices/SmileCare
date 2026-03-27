"use client";

import React from "react";
import { Stethoscope, CheckCircle2 } from "lucide-react";
import { Treatment } from "@/lib/booking.api";

function TreatmentStep({ treatments, selectedId, onSelect, isLoading }: TreatmentStepProps) {
  if (isLoading) {
    return (
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
          <div className="h-6 w-48 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border-2 border-slate-100 bg-white p-6 space-y-4 animate-pulse"
            >
              <div className="h-5 w-3/4 bg-slate-100 rounded" />
              <div className="h-4 w-full bg-slate-100 rounded-md" />
              <div className="h-4 w-2/3 bg-slate-100 rounded-md" />
              <div className="h-3 w-16 bg-slate-100 rounded" />
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
            <button
              key={treatment.id}
              onClick={() => onSelect(treatment)}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 text-left ${
                isSelected
                  ? "border-primary bg-white shadow-xl shadow-primary/5"
                  : "border-slate-100 bg-white hover:border-primary/20 hover:shadow-md"
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="text-primary" size={24} />
                </div>
              )}

              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                    isSelected ? "bg-primary text-white" : "bg-slate-50 text-primary group-hover:bg-primary/5"
                  }`}
                >
                  <Stethoscope size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-900 mb-1">
                    {treatment.name}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {treatment.description || "Premium clinical restoration performed by vetted specialists."}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
    </section>
  );
}

// Memoize to prevent re-renders when parent re-renders
export default React.memo(TreatmentStep);
