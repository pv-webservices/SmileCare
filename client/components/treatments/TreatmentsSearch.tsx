"use client";

interface TreatmentsSearchProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const TreatmentsSearch = ({ searchQuery, setSearchQuery }: TreatmentsSearchProps) => {
    return (
        <div className="w-full max-w-4xl">
            <label className="relative flex items-center h-14 w-full shadow-sm">
                <div className="absolute left-4 text-primary pointer-events-none">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-full rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/50 border-none bg-white dark:bg-slate-800 shadow-inner pl-12 pr-28 text-base font-normal placeholder:text-slate-400 outline-none transition-all"
                    placeholder="Search for a treatment (e.g. Invisalign, Veneers, Whitening)"
                />
                <button
                    type="button"
                    className="absolute right-2 bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors text-sm"
                >
                    Find
                </button>
            </label>
        </div>
    );
};

export default TreatmentsSearch;
