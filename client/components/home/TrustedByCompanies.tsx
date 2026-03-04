const brands = [
    { name: "ADA", full: "American Dental Association" },
    { name: "ISO", full: "ISO 9001 Certified" },
    { name: "BDA", full: "British Dental Assoc." },
    { name: "invisalign™", full: "Gold Provider" },
    { name: "CEREC®", full: "Certified Clinic" },
    { name: "Nobel Biocare", full: "Premium Implants" },
];

const TrustedByCompanies = () => {
    return (
        <section className="py-16 bg-background-light border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 sm:px-8">
                <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-10">
                    Trusted, Certified & Partnered With
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8">
                    {brands.map((b, idx) => (
                        <div key={idx} className="text-center group">
                            <p className="text-xl font-display font-bold text-gray-300 group-hover:text-primary transition-colors duration-300 leading-none">
                                {b.name}
                            </p>
                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mt-1">
                                {b.full}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustedByCompanies;
