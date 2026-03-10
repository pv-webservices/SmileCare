"use client";

import { useState } from "react";

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

function TrustCard({ r }: { r: typeof reasons[0] }) {
    const [touched, setTouched] = useState(false);
    return (
        <div
            className={`group bg-background-light rounded-3xl p-4 sm:p-8 transition-all duration-500 cursor-default touch-manipulation ${
                touched
                    ? "bg-primary shadow-2xl shadow-primary/20 scale-[1.02]"
                    : "hover:bg-primary hover:shadow-2xl hover:shadow-primary/20"
            }`}
            onTouchStart={() => setTouched(true)}
            onTouchEnd={() => setTimeout(() => setTouched(false), 600)}
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                touched ? "bg-white/20" : "bg-primary/10 group-hover:bg-white/20"
            }`}>
                <span className={`material-symbols-outlined text-2xl transition-colors ${
                    touched ? "text-white" : "text-primary group-hover:text-white"
                }`}>
                    {r.icon}
                </span>
            </div>
            <h3 className={`text-xl font-display font-bold mb-3 transition-colors ${
                touched ? "text-white" : "text-navy-deep group-hover:text-white"
            }`}>
                {r.title}
            </h3>
            <p className={`leading-relaxed transition-colors ${
                touched ? "text-white/80" : "text-gray-500 group-hover:text-white/80"
            }`}>
                {r.description}
            </p>
        </div>
    );
}

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
                        <TrustCard key={idx} r={r} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyTrustUs;
