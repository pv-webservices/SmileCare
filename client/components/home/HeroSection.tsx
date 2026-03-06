"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";


const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] sm:min-h-[80vh] flex items-center pt-20 overflow-hidden text-white">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2070"
          alt="Modern Dental Clinic"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/70 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl animate-in fade-in slide-in-from-left-8 duration-1000">
          <span className="text-accent-gold font-bold tracking-widest uppercase text-xs sm:text-sm block mb-4">
            Welcome to SmileCare Elite
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.1] mb-6 sm:mb-8">
            Excellence in <span className="text-accent-gold italic">Modern</span> Dentistry
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-8 sm:mb-10 leading-relaxed max-w-xl">
            Experience world-class dental care with state-of-the-art technology and a team dedicated to your comfort and smile.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/booking" 
              className="bg-primary text-white active:scale-95 active:opacity-90 px-6 sm:px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white hover:text-primary transition-all duration-300 text-center shadow-lg shadow-primary/20"
            >
              Book Appointment
            </Link>
            <Link 
              href="/treatments" 
              className="bg-transparent border-2 border-accent-gold text-accent-gold active:scale-95 active:opacity-90 px-6 sm:px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-accent-gold hover:text-white transition-all duration-300 text-center"
            >
              Our Services
            </Link>
        
      
    
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
