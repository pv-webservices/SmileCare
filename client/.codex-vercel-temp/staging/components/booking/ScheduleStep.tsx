"use client";

import React, { useState, useMemo } from "react";
import { CalendarX, CalendarDays, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

import { Slot } from "@/lib/booking.api";

/**
 * Convert a time string like "9:00 AM", "11:30 AM", "2:00 PM"
 * into a sortable number (total minutes from midnight).
 */
function timeToMinutes(timeStr: string): number {
  const clean = timeStr.trim().toUpperCase();
  const [timePart, period] = clean.split(" ");
  const [hourStr, minStr] = timePart.split(":");
  let hours = parseInt(hourStr, 10);
  const minutes = parseInt(minStr || "0", 10);

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  // Fallback: try 24h format if no AM/PM
  if (!period) return hours * 60 + minutes;

  return hours * 60 + minutes;
}

interface ScheduleStepProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  slots: Slot[] | undefined | null;
  selectedSlotId: string | null;
  onSlotSelect: (slot: Slot) => void;
  isLoadingSlots: boolean;
  slotsError?: string | null;
  onProceed?: () => void;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function ScheduleStep({
  selectedDate,
  onDateSelect,
  slots,
  selectedSlotId,
  onSlotSelect,
  isLoadingSlots,
  slotsError,
  onProceed
}: ScheduleStepProps) {
  const [viewDate, setViewDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start
  };

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1));

  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));
  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));

  // Memoize sorted slots to avoid re-sorting on every render
  const sortedSlots = useMemo(() => {
    if (!Array.isArray(slots)) return [];
    return [...slots].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [slots]);

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 mb-8">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">3</span>
        <h3 className="text-2xl font-display font-bold text-primary">Preferred Schedule</h3>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Calendar Side */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-slate-900">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-slate-50 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft size={20} className="text-slate-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-slate-50 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight size={20} className="text-slate-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_SHORT.map((d, i) => (
              <div key={i} className="text-center text-xs font-bold text-slate-400 h-8 flex items-center justify-center">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map(day => {
              const isSelected = selectedDate?.toDateString() === day.toDateString();
              const isToday = new Date().toDateString() === day.toDateString();
              const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
              return (
                <button
                  key={day.toISOString()}
                  disabled={isPast}
                  onClick={() => onDateSelect(day)}
                  className={`relative h-10 w-10 text-sm font-bold rounded-xl transition-all ${
                    isSelected
                      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                      : isToday
                      ? "bg-primary/5 text-primary"
                      : isPast
                      ? "text-slate-200 cursor-not-allowed"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slots Side */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h4 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
            <CalendarDays size={20} className="text-primary" />
            Available Slots
          </h4>

          {slotsError && (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <CalendarX size={40} className="text-red-400 mb-3" />
              <p className="text-sm text-red-600 font-medium">{slotsError}</p>
              <p className="text-xs text-slate-500 mt-2">Please try selecting a different date or specialist</p>
            </div>
          )}

          {!isLoadingSlots && Array.isArray(slots) && slots.length === 0 && selectedDate && !slotsError && (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <CalendarX size={40} className="text-slate-300 mb-3" />
              <p className="text-sm text-slate-600 font-medium">No available slots for this date.</p>
              <p className="text-xs text-slate-500 mt-2">Please try another day or check with a different specialist</p>
            </div>
          )}

          {!isLoadingSlots && !selectedDate && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays size={40} className="text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">Select a date to see available slots.</p>
            </div>
          )}

          {isLoadingSlots ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i =>
                <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
              {sortedSlots.map((slot) => (
                <button
                  key={slot.id}
                  disabled={!slot.isAvailable}
                  onClick={() => onSlotSelect(slot)}
                  className={`py-3.5 px-4 rounded-xl text-sm font-bold transition-all border-2 ${
                    selectedSlotId === slot.id
                      ? "border-primary bg-white text-primary shadow-lg shadow-primary/5"
                      : slot.isAvailable
                      ? "border-slate-50 bg-slate-50 text-slate-600 hover:border-primary/20 hover:bg-white"
                      : "border-slate-50 bg-slate-50 text-slate-300 cursor-not-allowed opacity-50"
                  }`}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>
          )}

          {selectedSlotId && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-4">
                <span className="font-semibold">Expected duration:</span> 60 minutes
              </p>
              <button
                onClick={onProceed}
                className="w-full flex items-center justify-center gap-2.5 bg-primary text-white px-6 py-4 rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Proceed to Details
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default React.memo(ScheduleStep);
