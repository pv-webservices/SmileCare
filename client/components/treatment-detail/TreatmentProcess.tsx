import { Scan, Wrench, CheckCircle2, type LucideIcon } from "lucide-react";

interface ProcessStep {
    title: string;
    description: string;
}

interface TreatmentProcessProps {
    steps: ProcessStep[];
}

// Cycle through these 3 icons for up to 3 steps
const STEP_ICONS: LucideIcon[] = [Scan, Wrench, CheckCircle2];

const TreatmentProcess = ({ steps }: TreatmentProcessProps) => {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-20">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-3">
                        Your Journey
                    </p>
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-6">
                        The Treatment Process
                    </h2>
                    <div className="h-1.5 w-24 bg-primary mx-auto rounded-full shadow-sm shadow-primary/20" />
                </div>

                {/* Steps */}
                <div className="grid md:grid-cols-3 gap-12 lg:gap-16 relative">
                    {/* Connector line (desktop only) */}
                    <div className="hidden md:block absolute top-4 sm:p-8 left-[16.66%] right-[16.66%] h-px bg-primary/10 z-0" />

                    {steps.map((step, index) => {
                        const Icon = STEP_ICONS[index % STEP_ICONS.length];
                        return (
                            <div
                                key={index}
                                className="relative group flex flex-col items-center md:items-start text-center md:text-left z-10"
                            >
                                {/* Icon circle */}
                                <div className="size-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-lg shadow-primary/5 shrink-0">
                                    <Icon size={28} />
                                </div>

                                {/* Step number + title */}
                                <h3 className="text-2xl font-display font-bold mb-4 text-slate-900 tracking-tight">
                                    <span className="text-primary/40 mr-2 text-xl font-body">
                                        0{index + 1}
                                    </span>
                                    {step.title}
                                </h3>

                                <p className="text-slate-600 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default TreatmentProcess;
