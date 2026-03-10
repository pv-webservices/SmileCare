"use client";

import {
    Stethoscope,
    UserRound,
    CalendarDays,
    ClipboardList,
    type LucideIcon,
} from "lucide-react";
import { useBooking } from "@/context/BookingContext";

interface Step {
    id: number;
    name: string;
    Icon: LucideIcon;
}

const STEPS: Step[] = [
    { id: 1, name: "Treatment", Icon: Stethoscope },
    { id: 2, name: "Specialist", Icon: UserRound },
    { id: 3, name: "Schedule", Icon: CalendarDays },
    { id: 4, name: "Details", Icon: ClipboardList },
];

interface BookingProgressProps {
    currentStep: number;
}

export default function BookingProgress({ currentStep }: BookingProgressProps) {
    const { maxReachedStep, goToStep } = useBooking();

    return (
        <div className="mb-16 relative px-2 sm:px-4">
            <div className="flex items-center justify-between relative z-10 w-full">
                {STEPS.map((step, idx) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;
                    const isUpcoming = step.id > currentStep;
                    const isAccessible = step.id <= maxReachedStep;

                    return (
                        <div
                            key={step.id}
                            className="flex flex-col items-center relative group flex-1"
                        >
                            {idx > 0 && (
                                <div
                                    className={`absolute top-5 right-1/2 w-full h-[3px] -z-10 transition-colors duration-500 ${isUpcoming ? "bg-slate-100" : "bg-primary"
                                        }`}
                                />
                            )}

                            <button
                                type="button"
                                onClick={() => isAccessible && goToStep(step.id)}
                                disabled={!isAccessible}
                                className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition-all duration-500 shadow-sm z-10 ${isActive
                                        ? "bg-primary text-white ring-4 ring-primary/20 scale-110"
                                        : isCompleted
                                            ? "bg-primary text-white hover:scale-105 hover:shadow-md cursor-pointer"
                                            : isAccessible
                                                ? "bg-white border-2 border-slate-200 text-slate-500 hover:border-primary/50 hover:text-primary cursor-pointer hover:scale-105"
                                                : "bg-white border-2 border-slate-100 text-slate-300 cursor-not-allowed"
                                    }`}
                                aria-label={`Go to step ${step.name}`}
                            >
                                <step.Icon
                                    size={18}
                                    className={isActive || isCompleted ? "opacity-100" : "opacity-40"}
                                />
                            </button>

                            <span
                                className={`mt-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-500 whitespace-nowrap ${isActive || isCompleted
                                        ? "text-primary"
                                        : "text-slate-700"
                                    }`}
                            >
                                {step.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
