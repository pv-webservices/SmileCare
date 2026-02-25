"use client";

const categories = [
    { label: "All Treatments", value: "All" },
    { label: "Cosmetic", value: "Cosmetic" },
    { label: "Restorative", value: "Restorative" },
    { label: "Orthodontics", value: "Orthodontics" },
    { label: "Preventative", value: "Preventative" },
];

interface TreatmentsFilterBarProps {
    activeCategory: string;
    setActiveCategory: (category: string) => void;
}

const TreatmentsFilterBar = ({ activeCategory, setActiveCategory }: TreatmentsFilterBarProps) => {
    return (
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
                <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`flex h-10 shrink-0 items-center justify-center rounded-full px-6 text-sm font-semibold transition-all duration-200 ${activeCategory === cat.value
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary"
                        }`}
                >
                    {cat.label}
                </button>
            ))}
        </div>
    );
};

export default TreatmentsFilterBar;
