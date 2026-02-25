interface ProcessStep {
    title: string;
    description: string;
}

interface TreatmentProcessProps {
    steps: ProcessStep[];
}

const TreatmentProcess = ({ steps }: TreatmentProcessProps) => {
    const icons = ["calendar_month", "precision_manufacturing", "verified"];

    return (
        <section className="py-24 bg-white dark:bg-background-dark">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-slate-50 mb-6">
                        The Smile Design Journey
                    </h2>
                    <div className="h-1.5 w-24 bg-primary mx-auto rounded-full shadow-sm shadow-primary/20" />
                </div>

                <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
                    {steps.map((step, index) => (
                        <div key={index} className="relative group flex flex-col items-center md:items-start text-center md:text-left">
                            <div className="size-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-lg shadow-primary/5">
                                <span className="material-symbols-outlined text-3xl">{icons[index % icons.length]}</span>
                            </div>
                            <h3 className="text-2xl font-display font-bold mb-4 text-slate-900 dark:text-slate-50 tracking-tight">
                                <span className="text-primary/40 mr-2 text-xl font-body">0{index + 1}</span>
                                {step.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TreatmentProcess;
