"use client";

import { useState } from "react";
import { CalendarX, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

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
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function ScheduleStep({
    selectedDate,
    onDateSelect,
    slots,
    selectedSlotId,
    onSlotSelect,
    isLoadingSlots,
    slotsError
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

    return (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-3 mb-8">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">3</span>
                <h3 className="text-2xl font-display font-bold text-primary">Preferred Schedule</h3>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Calendar Side */}
                <div className="w-full lg:w-1/2 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="font-display font-bold text-slate-800">
                            {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </h4>
                        <div className="flex gap-2">
                            <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-primary transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-primary transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-4 text-center">
                        {DAYS_SHORT.map((d, i) => (
                            <span key={`${d}-${i}`} className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{d}</span>
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
                                    className={`relative h-10 w-10 text-sm font-bold rounded-xl transition-all ${isSelected
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
                <div className="w-full lg:w-1/2">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4">Available Slots</p>

                    {slotsError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium mb-4">
                            {slotsError}
                        </div>
                    )}

                    {!isLoadingSlots && Array.isArray(slots) && slots.length === 0 && selectedDate && (
                        <div className="py-8 text-center text-slate-400 text-sm font-medium">
                            <CalendarX size={28} className="mx-auto mb-3 text-slate-300" />
                            <p>No available slots for this date. Please try another day.</p>
                        </div>
                    )}

                    {!isLoadingSlots && !selectedDate && (
                        <div className="py-8 text-center text-slate-400 text-sm font-medium">
                            <CalendarDays size={28} className="mx-auto mb-3 text-slate-300" />
                            <p>Select a date to see available slots.</p>
                        </div>
                    )}

                    {isLoadingSlots ? (
                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {[...(Array.isArray(slots) ? slots : [])].sort(
                                (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
                            ).map((slot) => (
                                <button
                                    key={slot.id}
                                    disabled={!slot.isAvailable}
                                    onClick={() => onSlotSelect(slot)}
                                    className={`py-3.5 px-4 rounded-xl text-sm font-bold transition-all border-2 ${selectedSlotId === slot.id
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

                    <p className="mt-8 text-[11px] text-slate-400 italic font-medium">
                        Expected duration: 60 minutes
                    </p>
                </div>
            </div>
        </section>
    );
}
