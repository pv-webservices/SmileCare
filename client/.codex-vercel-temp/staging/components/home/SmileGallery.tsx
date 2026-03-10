"use client";

import Image from "next/image";
import Link from "next/link";

const gallery = [
    { title: "Invisalign Result", category: "Orthodontics", image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800" },
    { title: "Smile Makeover", category: "Cosmetic", image: "https://images.unsplash.com/photo-1629124466244-93ec66115865?auto=format&fit=crop&q=80&w=800" },
    { title: "Dental Implants", category: "Restorative", image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800" },
    { title: "Teeth Whitening", category: "Aesthetic", image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=800" },
    { title: "Porcelain Veneers", category: "Cosmetic", image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&q=80&w=800" },
    { title: "Root Canal", category: "Restorative", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800" },
];

// Duplicate for seamless infinite loop
const allItems = [...gallery, ...gallery];

const SmileGallery = () => {
    return (
        <section id="gallery" className="py-16 md:py-24 bg-navy-deep text-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 md:mb-16">
                <div className="text-center">
                    <span className="text-accent-gold font-bold tracking-widest uppercase text-sm block mb-4">Patient Transformation</span>
                    <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight">
                        Witness the Power of a <span className="italic">Radiant Smile</span>
                    </h2>
                    <p className="text-gray-300 mt-4 text-base md:text-lg max-w-2xl mx-auto">
                        Real patient transformations that speak for themselves.
                    </p>
                </div>
            </div>

            {/* Infinite scrolling ticker */}
            <div className="relative w-full overflow-hidden">
                {/* Left fade */}
                <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-navy-deep to-transparent z-10 pointer-events-none" />
                {/* Right fade */}
                <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-navy-deep to-transparent z-10 pointer-events-none" />

                <div className="flex gap-4 md:gap-6 infinite-scroll-track">
                    {allItems.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex-shrink-0 w-[240px] sm:w-[300px] md:w-[360px] aspect-[4/5] relative rounded-2xl md:rounded-3xl overflow-hidden group"
                        >
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 p-4 md:p-6">
                                <span className="inline-block px-3 py-1 bg-accent-gold text-navy-deep text-[10px] font-bold uppercase tracking-wider rounded-full mb-2">
                                    {item.category}
                                </span>
                                <h4 className="text-base md:text-xl font-bold mb-3">{item.title}</h4>
                                <Link href="/booking" className="text-accent-gold font-bold text-xs tracking-widest uppercase flex items-center gap-2 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                    Book This Treatment
                                    <span>↗</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SmileGallery;
