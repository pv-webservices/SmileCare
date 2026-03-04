const reasons = [
    {
        icon: "verified",
        title: "Board-Certified Specialists",
        description: "Every clinician is fully credentialled, regularly audited, and committed to continuous education.",
    },
    {
        icon: "favorite",
        title: "Patient-First Philosophy",
        description: "From your first call to your final appointment, every decision is made with your comfort and health in mind.",
    },
    {
        icon: "science",
        title: "Cutting-Edge Technology",
        description: "We invest in the latest diagnostic and treatment equipment so you benefit from the best that dentistry can offer.",
    },
    {
        icon: "workspace_premium",
        title: "ISO-Certified Facility",
        description: "Our clinic meets international standards for sterilisation, hygiene, and infection control — every single day.",
    },
    {
        icon: "support_agent",
        title: "24/7 Patient Support",
        description: "Our care team is available around the clock for emergencies, queries, and appointment changes.",
    },
    {
        icon: "payments",
        title: "Transparent Pricing",
        description: "No hidden fees, ever. We provide full written cost estimates before any treatment begins.",
    },
];

const WhyTrustUs = () => {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 sm:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm block mb-4">
                        Why Choose Us
                    </span>
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-navy-deep mb-6 leading-tight">
                        A Clinic You Can{" "}
                        <span className="text-accent-gold italic">Trust Completely</span>
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        Six reasons thousands of patients choose SmileCare as their long-term dental home.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:p-8">
                    {reasons.map((r, idx) => (
                        <div
                            key={idx}
                            className="group bg-background-light rounded-3xl p-4 sm:p-8 hover:bg-primary hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 cursor-default"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-white/20 flex items-center justify-center mb-6 transition-colors">
                                <span className="material-symbols-outlined text-primary group-hover:text-white text-2xl transition-colors">
                                    {r.icon}
                                </span>
                            </div>
                            <h3 className="text-xl font-display font-bold text-navy-deep group-hover:text-white mb-3 transition-colors">
                                {r.title}
                            </h3>
                            <p className="text-gray-500 group-hover:text-white/80 leading-relaxed transition-colors">
                                {r.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyTrustUs;
