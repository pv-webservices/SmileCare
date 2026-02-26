"use client";

interface BookingProgressProps {
    currentStep: number;
}

const steps = [
    { id: 1, name: "Treatment", icon: "medical_services" },
    { id: 2, name: "Specialist", icon: "person" },
    { id: 3, name: "Schedule", icon: "calendar_month" },
    { id: 4, name: "Confirm", icon: "check_circle" },
];

export default function BookingProgress({ currentStep }: BookingProgressProps) {
    return (
        <div className="mb-16 relative px-4">
            <div className="flex items-center justify-between relative z-10 w-full">
                {steps.map((step, idx) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;
                    const isUpcoming = step.id > currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center relative group min-w-[80px]">
                            {/* Connector Line Logic inside the loop for better control */}
                            {idx > 0 && (
                                <div
                                    className={`absolute top-5 -left-1/2 w-full h-[3px] -z-10 transition-colors duration-500 ${isUpcoming ? "bg-slate-100" : "bg-primary"
                                        }`}
                                />
                            )}

                            <div
                                className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-500 shadow-sm ${isActive
                                        ? "bg-primary text-white ring-4 ring-primary/20"
                                        : isCompleted
                                            ? "bg-primary text-white"
                                            : "bg-white border-2 border-slate-100 text-slate-300"
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-lg ${isActive || isCompleted ? "opacity-100" : "opacity-40"}`}>
                                    {isCompleted ? "check_circle" : step.icon}
                                </span>
                            </div>
                            <span
                                className={`mt-3 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-500 whitespace-nowrap ${isActive || isCompleted ? "text-primary" : "text-slate-400"
                                    }`}
                            >
                                {step.name}
                            </span>
                        </div>
                    );
                })}
            </div>
            {/* Background Base Line - No longer needed if using per-step lines, but keeping for safety if preferred */}
            {/* <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-100 -z-0 rounded-full" /> */}
        </div>
    );
}
