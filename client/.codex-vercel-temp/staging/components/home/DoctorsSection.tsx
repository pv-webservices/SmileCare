"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Doctor {
    name: string;
    specialty: string;
    image: string;
    bio: string;
    stats: { cases: string; exp: string };
    qualifications: string[];
    languages: string[];
    availableDays: string;
}

const doctors: Doctor[] = [
    {
        name: "Dr. Sarah Mitchell",
        specialty: "Cosmetic Dentist & Implantologist",
        image: "https://images.unsplash.com/photo-1559839734-2b71f15367ef?auto=format&fit=crop&q=80&w=800",
        bio: "With over 15 years of experience, Dr. Sarah specialises in creating beautiful, natural smiles through advanced cosmetic procedures.",
        stats: { cases: "2,500+", exp: "15 Years" },
        qualifications: ["BDS (Gold Medallist)", "MDS – Prosthodontics", "Fellowship – ICOI"],
        languages: ["English", "French"],
        availableDays: "Mon – Fri",
    },
    {
        name: "Dr. James Patel",
        specialty: "Orthodontics Specialist",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800",
        bio: "Dr. James is a certified Invisalign Gold Provider, dedicated to helping patients achieve perfect alignment with the latest technology.",
        stats: { cases: "1,800+", exp: "12 Years" },
        qualifications: ["BDS Honours", "MOrth – Royal College", "Invisalign Gold Provider"],
        languages: ["English", "Gujarati"],
        availableDays: "Mon – Thu, Sat",
    },
    {
        name: "Dr. Emily Chen",
        specialty: "Implantology & Oral Surgery",
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800",
        bio: "Dr. Emily is a dual-specialist in implantology and oral surgery, renowned for complex full-arch reconstructions and minimal-trauma extractions.",
        stats: { cases: "1,200+", exp: "10 Years" },
        qualifications: ["BDS", "MS – Oral Surgery", "Nobel Biocare Certified"],
        languages: ["English", "Mandarin"],
        availableDays: "Tue – Sat",
    },
    {
        name: "Dr. Michael Torres",
        specialty: "Endodontics Specialist",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800",
        bio: "Dr. Michael is a root canal specialist with a reputation for pain-free treatment. His calm chairside manner puts even the most anxious patients at ease.",
        stats: { cases: "3,100+", exp: "18 Years" },
        qualifications: ["BDS", "MDS – Endodontics", "Fellow – AAE"],
        languages: ["English", "Spanish"],
        availableDays: "Mon, Wed, Fri",
    },
];

function DoctorModal({ doctor, onClose }: { doctor: Doctor; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header image */}
                <div className="relative h-64 overflow-hidden rounded-t-[2rem]">
                    <Image src={doctor.image} alt={doctor.name} fill className="object-cover object-top" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 to-transparent" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors"
                    >
                        <span className="material-symbols-outlined text-white text-xl">close</span>
                    </button>
                    <div className="absolute bottom-6 left-6">
                        <h3 className="text-2xl font-display font-bold text-white">{doctor.name}</h3>
                        <p className="text-accent-gold font-bold text-xs uppercase tracking-widest mt-1">{doctor.specialty}</p>
                    </div>
                </div>

                <div className="p-4 sm:p-8 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 p-4 sm:p-5 bg-background-light rounded-2xl">
                        <div className="text-center min-w-0">
                            <p className="text-sm sm:text-2xl font-bold text-navy-deep leading-none truncate">
                                {doctor.stats.cases}
                            </p>
                            <p className="text-[10px] sm:text-xs uppercase font-bold text-gray-400 tracking-wider mt-1">
                                Cases
                            </p>
                        </div>

                        <div className="text-center min-w-0">
                            <p className="text-sm sm:text-2xl font-bold text-navy-deep leading-none truncate">
                                {doctor.stats.exp}
                            </p>
                            <p className="text-[10px] sm:text-xs uppercase font-bold text-gray-400 tracking-wider mt-1">
                                Experience
                            </p>
                        </div>

                        <div className="text-center min-w-0">
                            <p className="text-sm sm:text-sm font-bold text-navy-deep leading-none truncate">
                                {doctor.availableDays}
                            </p>
                            <p className="text-[10px] sm:text-xs uppercase font-bold text-gray-400 tracking-wider mt-1">
                                Available
                            </p>
                        </div>
                    </div>


                    {/* Bio */}
                    <div>
                        <h4 className="font-bold text-navy-deep mb-2 uppercase text-xs tracking-widest">About</h4>
                        <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
                    </div>

                    {/* Qualifications */}
                    <div>
                        <h4 className="font-bold text-navy-deep mb-3 uppercase text-xs tracking-widest">Qualifications</h4>
                        <ul className="space-y-2">
                            {doctor.qualifications.map((q, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-primary text-xs">check</span>
                                    </span>
                                    {q}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Languages */}
                    <div>
                        <h4 className="font-bold text-navy-deep mb-3 uppercase text-xs tracking-widest">Languages</h4>
                        <div className="flex gap-2 flex-wrap">
                            {doctor.languages.map((l) => (
                                <span key={l} className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">{l}</span>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <Link
                        href="/booking"
                        onClick={onClose}
                        className="w-full block text-center bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-navy-deep transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                    >
                        Book with {doctor.name.split(" ")[1]}
                    </Link>
                </div>
            </div>
        </div>
    );
}

const DoctorsSection = () => {
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    return (
        <>
            <section className="py-24 bg-background-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 sm:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-primary font-bold tracking-widest uppercase text-sm block mb-4">Expert Doctors</span>
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-navy-deep mb-6">
                            Meet Our <span className="text-accent-gold">World-Class</span> Specialists
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Our team of highly qualified dental professionals is committed to providing personalised care in a comfortable environment.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {doctors.map((doctor, idx) => (
                            <div key={idx} className="bg-white rounded-[2rem] overflow-hidden shadow-xl flex flex-col md:flex-row hover:shadow-2xl transition-all group">
                                <div className="md:w-2/5 relative h-[320px] md:h-auto overflow-hidden shrink-0">
                                    <Image src={doctor.image} alt={doctor.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/40 to-transparent" />
                                </div>
                                <div className="md:w-3/5 p-4 sm:p-8 flex flex-col justify-center">
                                    <div className="mb-4">
                                        <h3 className="text-2xl font-display font-bold text-navy-deep mb-1">{doctor.name}</h3>
                                        <p className="text-primary font-bold uppercase tracking-widest text-[10px]">{doctor.specialty}</p>
                                    </div>
                                    <p className="text-gray-600 mb-6 leading-relaxed text-sm line-clamp-3">{doctor.bio}</p>
                                    <div className="flex gap-6 mb-6 border-t border-b border-gray-100 py-4">
                                        <div>
                                            <p className="text-xl font-bold text-navy-deep">{doctor.stats.cases}</p>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Cases</p>
                                        </div>
                                        <div className="w-px h-8 bg-gray-100" />
                                        <div>
                                            <p className="text-xl font-bold text-navy-deep">{doctor.stats.exp}</p>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Experience</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedDoctor(doctor)}
                                        className="self-start bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-navy-deep transition-all shadow-md active:scale-95 text-sm"
                                    >
                                        View Profile & Book
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Doctor Modal */}
            {selectedDoctor && (
                <DoctorModal doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} />
            )}
        </>
    );
};

export default DoctorsSection;
