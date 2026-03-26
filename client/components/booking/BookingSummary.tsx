"use client";

import { CheckCircle2, CalendarClock } from "lucide-react";

interface BookingSummaryProps {
  treatment: { name: string; priceRange: string } | null;
  specialist: { name: string } | null;
  date: Date | null;
  slot: { startTime: string } | null;
  holdExpiresAt: Date | null;
  onConfirm: () => void;
  isSubmitting: boolean;
  onHoldExpired: () => void;
}

export default function BookingSummary({
  treatment,
  specialist,
  date,
  slot,
  holdExpiresAt,
  onConfirm,
  isSubmitting,
  onHoldExpired,
}: BookingSummaryProps) {
  const canConfirm =
    !!treatment && !!specialist && !!date && !!slot && !isSubmitting;

  return (
    <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-slate-900">
        Booking Summary
      </h3>

      {/* Summary rows */}
      <div className="space-y-3 border-t border-slate-100 pt-4">
        {/* Service */}
        <div className="flex items-start justify-between">
          <span className="text-sm font-medium text-slate-500">Service</span>
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-900">
              {treatment ? treatment.name : "Not selected"}
            </span>
          </div>
        </div>

        {/* Provider */}
        <div className="flex items-start justify-between">
          <span className="text-sm font-medium text-slate-500">Provider</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              {specialist ? specialist.name : "Not selected"}
            </span>
            {specialist && (
              <CheckCircle2 className="text-primary" size={16} />
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex items-start justify-between">
          <span className="text-sm font-medium text-slate-500">
            Date & Time
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              {date && slot
                ? `${date.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })} • ${slot.startTime}`
                : "Not selected"}
            </span>
            {date && slot && (
              <CalendarClock className="text-primary" size={16} />
            )}
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
        Complete all steps to confirm your booking. You agree to our{" "}
        <a href="#" className="font-medium text-primary hover:underline">
          Cancellation Policy
        </a>{" "}
        and elite clinical standards.
      </div>
    </div>
  );
}
