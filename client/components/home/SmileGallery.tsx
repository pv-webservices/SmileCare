"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const gallery = [
    { title: "Invisalign Result", category: "Orthodontics", image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800" },
    { title: "Smile Makeover", category: "Cosmetic", image: "https://images.unsplash.com/photo-1629124466244-93ec66115865?auto=format&fit=crop&q=80&w=800" },
    { title: "Dental Implants", category: "Restorative", image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800" },
    { title: "Teeth Whitening", category: "Aesthetic", image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=800" },
    { title: "Porcelain Veneers", category: "Cosmetic", image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&q=80&w=800" },
];

const SmileGallery = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    return (
        <section id="gallery" className="py-24 bg-navy-deep text-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 sm:px-8 mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="max-w-2xl">
                    <span className="text-accent-gold font-bold tracking-widest uppercase text-sm block mb-4">Patient Transformation</span>
                    <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight">
                        Witness the Power of a <span className="italic">Radiant Smile</span>
                    </h2>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => scroll("left")}
                        className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
                    >
                        ←
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
                    >
                        →
                    </button>
                </div>
            </div>

            <div className="relative pl-4 sm:pl-6 lg:pl-[max(1rem,calc((100vw-1280px)/2+1rem))]">
                <div ref={scrollRef} className="flex gap-4 sm:p-8 overflow-x-auto pb-8 no-scrollbar snap-x snap-mandatory scroll-smooth">
                    {gallery.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex-shrink-0 w-[300px] md:w-[450px] aspect-[4/5] relative rounded-3xl overflow-hidden group snap-start"
                        >
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 p-4 sm:p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                <span className="inline-block px-3 py-1 bg-accent-gold text-navy-deep text-[10px] font-bold uppercase tracking-wider rounded-full mb-3">
                                    {item.category}
                                </span>
                                <h4 className="text-xl md:text-2xl font-bold mb-4">{item.title}</h4>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link href="/booking" className="text-accent-gold font-bold text-sm tracking-widest uppercase flex items-center gap-2 hover:text-white transition-colors">
                                        Book This Treatment
                                        <span>↗</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Last empty card for padding */}
                    <div className="flex-shrink-0 w-8" />
                </div>
            </div>
        </section>
    );
};

export default SmileGallery;
