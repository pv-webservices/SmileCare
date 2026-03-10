"use client";
import { useEffect, useState } from "react";

const brands = [
  { name: "ADA", full: "American Dental Association" },
  { name: "ISO", full: "ISO 9001 Certified" },
  { name: "BDA", full: "British Dental Assoc." },
  { name: "invisalign™", full: "Gold Provider" },
  { name: "CEREC®", full: "Certified Clinic" },
  { name: "Nobel Biocare", full: "Premium Implants" },
];

const TrustedByCompanies = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % brands.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-10 sm:py-14 bg-background-light border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 sm:mb-10">
          Trusted, Certified &amp; Partnered With
        </p>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14 sm:gap-y-6 pb-4 sm:pb-0">
          {brands.map((b, idx) => (
            <div key={idx} className="text-center group flex flex-col items-center">
              {/* Text visible on ALL screens (mobile + desktop) */}
              <p
                className="text-base sm:text-xl font-display font-bold leading-none transition-colors duration-300"
                style={{
                  color: idx === activeIdx ? "var(--primary)" : "rgb(156 163 175)",
                }}
              >
                {b.name}
              </p>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-300 uppercase tracking-wider mt-1">
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
