"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const faqs = [
    {
        question: "Where can I park?",
        answer: "Complimentary valet parking is available for all patients at the front entrance of the sanctuary building."
    },
    {
        question: "Do you accept insurance?",
        answer: "We partner with most major dental insurance providers. Please contact our concierge team to verify your specific plan before your visit."
    },
    {
        question: "What should I bring to my first visit?",
        answer: "Please bring a valid photo ID, your insurance card (if applicable), and any relevant dental records or X-rays from your previous provider."
    }
];

export default function ContactPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormSubmitted(true);
        setTimeout(() => setFormSubmitted(false), 3000);
    };

    return (
        <main className="bg-background-light">
            <div className="max-w-7xl mx-auto px-6 py-12">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm font-medium mb-8">
                    <Link href="/" className="text-primary/60 hover:text-primary transition-colors">Home</Link>
                    <span className="material-symbols-outlined text-xs text-primary/30">chevron_right</span>
                    <span className="text-primary font-semibold">Contact</span>
                </nav>

                {/* Hero */}
                <div className="max-w-3xl mb-16">
                    <h1 className="font-display text-5xl md:text-6xl font-black text-primary leading-tight mb-4 tracking-tight">
                        Visit Our Sanctuary
                    </h1>
                    <p className="text-lg font-sans text-primary/60 leading-relaxed max-w-2xl">
                        Experience clinical excellence in an environment designed for your serenity and well-being. Our team is here to assist you with every step of your journey to a perfect smile.
                    </p>
                </div>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-2 gap-16">

                    {/* LEFT — Contact Form */}
                    <div className="bg-pearl rounded-2xl p-8 shadow-md border border-primary/10 h-fit">
                        <h3 className="font-display text-2xl text-primary mb-8 font-bold">Send an Inquiry</h3>

                        {formSubmitted ? (
                            <div className="text-center py-16 animate-in fade-in duration-500">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                                    <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
                                </div>
                                <h4 className="font-display text-xl font-bold text-primary mb-2">Message Sent!</h4>
                                <p className="text-sm text-primary/50">Our concierge team will respond within 24 hours.</p>
                            </div>
                        ) : (
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-primary/70 px-1">Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            required
                                            className="w-full h-12 px-4 rounded-lg border border-primary/20 bg-background-light focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-primary/70 px-1">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            required
                                            className="w-full h-12 px-4 rounded-lg border border-primary/20 bg-background-light focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-primary/70 px-1">Subject</label>
                                    <select className="w-full h-12 px-4 rounded-lg border border-primary/20 bg-background-light focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none">
                                        <option>General Inquiry</option>
                                        <option>Booking Request</option>
                                        <option>Insurance Question</option>
                                        <option>Emergency Care</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-primary/70 px-1">Message</label>
                                    <textarea
                                        placeholder="How can we help you today?"
                                        rows={5}
                                        required
                                        className="w-full p-4 rounded-lg border border-primary/20 bg-background-light focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary text-white h-14 rounded-xl font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                                >
                                    Send Message
                                </button>
                            </form>
                        )}
                    </div>

                    {/* RIGHT — Info Column */}
                    <div className="space-y-10">

                        {/* Clinic Hours */}
                        <div className="bg-primary/5 p-8 rounded-2xl border border-primary/20">
                            <div className="flex items-center gap-3 text-primary mb-6">
                                <span className="material-symbols-outlined">schedule</span>
                                <h3 className="font-display text-xl font-bold">Clinic Hours</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-3 border-b border-primary/10">
                                    <span className="font-medium text-primary/80">Monday — Thursday</span>
                                    <span className="text-primary/60">08:00 AM – 06:00 PM</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-primary/10">
                                    <span className="font-medium text-primary/80">Friday</span>
                                    <span className="text-primary/60">09:00 AM – 04:00 PM</span>
                                </div>
                                <div className="flex justify-between items-center text-primary/40">
                                    <span className="font-medium">Saturday — Sunday</span>
                                    <span className="italic">By Appointment Only</span>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="rounded-2xl overflow-hidden h-64 relative border border-primary/10 shadow-md">
                            <Image
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4lNnItmBdWP4hmXa2yRDSoQzYMyqVwglPP0j3uNStBoirZUfqG05P-J2WIKN2dkVDtiYo2tuphKMDKJfiVsNcncOK6mWL6gvXQ6pIeU1_Cou-IMvR1cAr2YtZCT9G2c5-IgQqQ8kv0pMAnhZjZs3LRkr6b2cvt8iweHvIghMcFeDSyIti-PltvracEJqRaehdBndM7SZ3-qccra_HrSd9xL3mAIYCg7FYOktgzKzUAGZ-3tJIb3K2Y9XkSWDx85LU5dIYRnWf0CZe"
                                alt="Map showing SmileCare clinic location"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            <div className="absolute bottom-4 left-4 right-4 bg-pearl p-4 rounded-xl shadow-lg border border-primary/20 backdrop-blur-sm">
                                <div className="flex gap-3 items-start">
                                    <span className="material-symbols-outlined text-primary text-xl mt-0.5">location_on</span>
                                    <div>
                                        <p className="font-bold text-sm text-primary">123 Serenity Drive</p>
                                        <p className="text-xs text-primary/50">Suite 400, Beverly Hills, CA 90210</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Accordion */}
                        <div>
                            <h3 className="font-display text-xl font-bold text-primary mb-6">Common Questions</h3>
                            <div className="space-y-3">
                                {faqs.map((faq, i) => (
                                    <div
                                        key={i}
                                        className={`border rounded-xl bg-pearl overflow-hidden transition-all ${openIndex === i ? "border-primary/30 shadow-sm" : "border-primary/10 hover:border-primary/30"
                                            }`}
                                    >
                                        <button
                                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                            className="w-full p-4 flex justify-between items-center text-left"
                                        >
                                            <span className="font-semibold text-primary/80">{faq.question}</span>
                                            <span className={`material-symbols-outlined transition-transform duration-300 ${openIndex === i ? "rotate-180 text-primary" : "text-primary/30"
                                                }`}>
                                                expand_more
                                            </span>
                                        </button>
                                        <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                                            }`}>
                                            <div className="px-4 pb-4 text-sm text-primary/60 leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
