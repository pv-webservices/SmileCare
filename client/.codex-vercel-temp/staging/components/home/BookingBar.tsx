"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TREATMENTS = [
    "General Checkup",
    "Teeth Whitening",
    "Dental Implants",
    "Invisalign Braces",
    "Root Canal Therapy",
    "Porcelain Veneers",
];

const DOCTORS = [
    "Any Specialist",
    "Dr. Sarah Mitchell",
    "Dr. James Patel",
    "Dr. Emily Chen",
    "Dr. Michael Torres",
];

const BookingBar = () => {
    const router = useRouter();
    const [treatment, setTreatment] = useState("");
    const [doctor, setDoctor] = useState("");
    const [date, setDate] = useState("");

    const handleCheck = () => {
        const params = new URLSearchParams();
        if (treatment) params.set("treatment", treatment);
        if (doctor && doctor !== "Any Specialist") params.set("doctor", doctor);
        if (date) params.set("date", date);
        router.push("/booking" + (params.toString() ? "?" + params.toString() : ""));
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="relative z-20 -mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 sm:px-8">
            <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-4 sm:p-8 flex flex-col lg:flex-row items-end gap-6 border border-gray-100">
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Treatment */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                            <span className="material-symbols-outlined text-primary text-base">medical_services</span>
                            Treatment
                        </label>
                        <div className="relative">
                            <select
                                value={treatment}
                                onChange={(e) => setTreatment(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent rounded-xl px-4 py-3.5 text-navy-deep font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer pr-10"
                            >
                                <option value="">Select Treatment</option>
                                {TREATMENTS.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl">
                                expand_more
                            </span>
                        </div>
                    </div>

                    {/* Doctor */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                            <span className="material-symbols-outlined text-primary text-base">person</span>
                            Doctor
                        </label>
                        <div className="relative">
                            <select
                                value={doctor}
                                onChange={(e) => setDoctor(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent rounded-xl px-4 py-3.5 text-navy-deep font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer pr-10"
                            >
                                {DOCTORS.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xl">
                                expand_more
                            </span>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                            <span className="material-symbols-outlined text-primary text-base">calendar_month</span>
                            Preferred Date
                        </label>
                        <input
                            type="date"
                            value={date}
                            min={today}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-gray-50 border-2 border-transparent rounded-xl px-4 py-3.5 text-navy-deep font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                        />
                    </div>
                </div>

                <div className="w-full lg:w-auto shrink-0">
                    <button
                        onClick={handleCheck}
                        className="w-full lg:w-auto bg-primary text-white px-10 py-4 rounded-xl font-bold hover:bg-navy-deep transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-xl">search</span>
                        Check Availability
                    </button>
                </div>
            </div>
            {/* Removed: Next available slot text */}
        </div>
    );
};

export default BookingBar;
