"use client";

import { useState } from "react";
import Image from "next/image";

const testimonials = [
    {
        name: "Jessica Miller",
        treatment: "Invisalign Treatment",
        quote: "I was self-conscious about my crooked teeth for years. After just 8 months with SmileCare's Invisalign, I finally smile without hesitation. The team made every step effortless.",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
        rating: 5,
        duration: "8 months",
        result: "Perfect Alignment",
    },
    {
        name: "Robert Evans",
        treatment: "Full Smile Makeover",
        quote: "The before-and-after difference is unreal. Six veneers and whitening later, people don't recognise my smile. The precision and artistry of the SmileCare team is second to none.",
        image: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&q=80&w=400",
        rating: 5,
        duration: "3 appointments",
        result: "Complete Transformation",
    },
    {
        name: "Priya Sharma",
        treatment: "Dental Implants",
        quote: "I lost a tooth in an accident and was devastated. SmileCare fitted an implant that looks and feels completely natural. I genuinely cannot tell it's not my real tooth.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
        rating: 5,
        duration: "6 weeks",
        result: "Natural-Looking Implant",
    },
];

const VideoTestimonials = () => {
    const [active, setActive] = useState(0);
    const current = testimonials[active];

    return (
        <section className="py-24 bg-navy-deep text-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 sm:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-accent-gold font-bold tracking-widest uppercase text-sm block mb-4">
                        Patient Stories
                    </span>
                    <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight">
                        Real Results,{" "}
                        <span className="italic text-accent-gold">Real People</span>
                    </h2>
                </div>

                <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
                    {/* Active testimonial */}
                    <div className="relative rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 p-6 sm:p-10 mb-10 lg:mb-0">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-accent-gold/30 shrink-0">
                                <Image src={current.image} alt={current.name} fill className="object-cover" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-lg truncate">{current.name}</h4>
                                <p className="text-accent-gold text-xs font-bold uppercase tracking-widest truncate">{current.treatment}</p>
                            </div>
                            <div className="ml-auto flex gap-0.5 shrink-0">
                                {Array.from({ length: current.rating }).map((_, i) => (
                                    <span key={i} className="text-accent-gold text-base">★</span>
                                ))}
                            </div>
                        </div>

                        <blockquote className="text-base sm:text-xl text-white/90 leading-relaxed italic mb-8 relative">
                            <span className="absolute -top-4 -left-2 text-6xl text-accent-gold/20 font-serif leading-none">"</span>
                            {current.quote}
                        </blockquote>

                        <div className="flex gap-4 pt-6 border-t border-white/10 min-w-0">
                            <div className="min-w-0 flex-1">
                                <p className="text-lg sm:text-2xl font-bold text-accent-gold truncate">{current.duration}</p>
                                <p className="text-[10px] sm:text-xs uppercase font-bold text-white/40 tracking-wider">Treatment Time</p>
                            </div>
                            <div className="w-px bg-white/10 shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-lg sm:text-2xl font-bold text-accent-gold truncate">{current.result}</p>
                                <p className="text-[10px] sm:text-xs uppercase font-bold text-white/40 tracking-wider">Outcome</p>
                            </div>
                        </div>
                    </div>

                    {/* Selector cards */}
                    <div className="space-y-4">
                        {testimonials.map((t, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActive(idx)}
                                className={`w-full flex items-center gap-5 p-5 rounded-2xl border transition-all duration-300 text-left touch-manipulation ${
                                    active === idx
                                        ? "bg-white/10 border-accent-gold/50 scale-[1.02]"
                                        : "bg-white/5 border-white/10 hover:bg-white/8 active:bg-white/10 active:scale-[1.02]"
                                }`}
                            >
                                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                                    <Image src={t.image} alt={t.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold truncate">{t.name}</p>
                                    <p className="text-xs text-white/50 truncate">{t.treatment}</p>
                                </div>
                                {active === idx && (
                                    <span className="w-2 h-2 rounded-full bg-accent-gold shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VideoTestimonials;
