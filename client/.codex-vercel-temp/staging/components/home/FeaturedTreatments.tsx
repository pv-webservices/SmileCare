"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const treatments = [
  {
    title: "Porcelain Veneers",
    description: "Achieve a flawless, natural-looking smile with our bespoke ceramic restorations crafted for longevity and brilliance.",
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&q=80&w=800",
    badge: "Popular",
    slug: "porcelain-veneers",
  },
  {
    title: "Dental Implants",
    description: "Permanent, natural-looking solutions for missing teeth using the highest quality titanium implants.",
    image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=800",
    badge: "Advanced",
    slug: "permanent-dental-implants",
  },
  {
    title: "Invisalign Aligners",
    description: "Straighten your teeth discreetly with clear, removable aligners that fit your lifestyle perfectly.",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800",
    badge: "Most Choice",
    slug: "invisalign-clear-aligners",
  },
  {
    title: "Laser Teeth Whitening",
    description: "Brighten your smile up to 8 shades in a single visit with our professional laser whitening technology.",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800",
    badge: "Quick & Easy",
    slug: "laser-teeth-whitening",
  },
  {
    title: "Crowns & Bridges",
    description: "Repair damaged or missing teeth with precision-crafted dental porcelain that restores strength and beauty.",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800",
    badge: "Premium",
    slug: "dental-crowns-bridges",
  },
  {
    title: "Oral Health Check",
    description: "A comprehensive examination focusing on early detection and prevention to maintain your lifelong dental wellbeing.",
    image: "https://images.unsplash.com/photo-1588776813677-77aaf5595b83?auto=format&fit=crop&q=80&w=800",
    badge: "Gentle Care",
    slug: "complete-oral-health-check",
  },
];

function TreatmentCard({ item }: { item: typeof treatments[0] }) {
  const [touched, setTouched] = useState(false);
  return (
    <div
      className={`group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col touch-manipulation transition-all duration-300 ${
        touched
          ? "shadow-xl -translate-y-1 scale-[1.02]"
          : "hover:shadow-xl hover:-translate-y-1"
      }`}
      onTouchStart={() => setTouched(true)}
      onTouchEnd={() => setTimeout(() => setTouched(false), 400)}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden flex-shrink-0">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className={`object-cover transition-transform duration-500 ${
            touched ? "scale-105" : "group-hover:scale-105"
          }`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
          {item.badge}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-display font-bold text-navy-deep mb-2 leading-snug">
          {item.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed flex-1">
          {item.description}
        </p>
        <Link
          href={`/treatments/${item.slug}`}
          className="mt-4 inline-flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all duration-200"
        >
          View Treatment
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

const FeaturedTreatments = () => {
  return (
    <section className="py-14 md:py-20 bg-background-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <span className="text-primary font-bold tracking-widest uppercase text-sm block mb-3">
            Our Specialities
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-navy-deep mb-5">
            Premium Care for Your{" "}
            <span className="text-accent-gold">Perfect Smile</span>
          </h2>
          <p className="text-gray-500 text-base md:text-lg leading-relaxed">
            Discover our range of advanced dental treatments designed to give you the confidence you deserve.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {treatments.map((item, idx) => (
            <TreatmentCard key={idx} item={item} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10 md:mt-12">
          <Link
            href="/treatments"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-bold text-base hover:bg-navy-deep transition-colors duration-200"
          >
            View All Treatments
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTreatments;
