"use client";

interface Treatment {
    id: string;
    title: string;
    description: string;
    price: number;
    duration: number;
    icon: string;
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-44 bg-slate-50 rounded-2xl" />
                ))}
            </div>
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
                                <span className={`material-symbols-outlined text-3xl ${isSelected ? "text-primary" : "text-slate-400 group-hover:text-primary"} transition-colors`}>
                                    {treatment.icon || "medical_services"}
                                </span>
                                {isSelected && (
                                    <div className="bg-primary text-white size-6 rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                                        <span className="material-symbols-outlined text-xs">check</span>
                                    </div>
                                )}
                            </div>

                            <h4 className="font-display font-bold text-lg mb-1">{treatment.title}</h4>
                            <p className="text-sm text-slate-500 mb-4 leading-relaxed line-clamp-2">
                                {treatment.description || "Premium clinical restoration performed by vetted specialists."}
                            </p>

                            <p className="text-primary font-bold text-sm tracking-tight">
                                {treatment.duration} min • ${treatment.price}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
