"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const cases = [
    {
        label: "Porcelain Veneers",
        before: "https://images.unsplash.com/photo-1626954079673-f3c3a7a2b8e8?auto=format&fit=crop&q=80&w=800",
        after: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800",
    },
    {
        label: "Teeth Whitening",
        before: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800",
        after: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800",
    },
    {
        label: "Invisalign",
        before: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=800",
        after: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&q=80&w=800",
    },
];

function Slider({ before, after }: { before: string; after: string }) {
    const [pos, setPos] = useState(50);
    const ref = useRef<HTMLDivElement>(null);

    const move = (clientX: number) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
        setPos(pct);
    };

    return (
        <div
            ref={ref}
            className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-ew-resize select-none"
            onMouseMove={(e) => move(e.clientX)}
            onTouchMove={(e) => move(e.touches[0].clientX)}
        >
            {/* After (full width, underneath) */}
            <div className="absolute inset-0">
                <Image src={after} alt="After" fill className="object-cover" />
                <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">After</div>
            </div>
            {/* Before (clipped) */}
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
                <div className="absolute inset-0" style={{ width: `${ref.current?.offsetWidth || 400}px` }}>
                    <Image src={before} alt="Before" fill className="object-cover" />
                </div>
                <div className="absolute top-4 left-4 bg-navy-deep text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Before</div>
            </div>
            {/* Divider */}
            <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl"
                style={{ left: `${pos}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center">
                    <span className="text-navy-deep font-bold text-sm">⇔</span>
                </div>
            </div>
        </div>
    );
}

const BeforeAfterSlider = () => {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 sm:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm block mb-4">
                        Transformations
                    </span>
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-navy-deep mb-6 leading-tight">
                        See the{" "}
                        <span className="text-accent-gold italic">Difference</span> Yourself
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Drag the slider to reveal real patient transformations. Results speak louder than words.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:p-8">
                    {cases.map((c, idx) => (
                        <div key={idx}>
                            <Slider before={c.before} after={c.after} />
                            <p className="text-center mt-4 text-sm font-bold text-navy-deep uppercase tracking-widest">
                                {c.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BeforeAfterSlider;
