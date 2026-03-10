"use client";

import { useState } from "react";

const faqs = [
    {
        question: "How often should I visit the dentist for a checkup?",
        answer: "We generally recommend a professional cleaning and checkup every six months. However, depending on your oral health needs, our specialists might suggest more frequent visits to ensure optimal health."
    },
    {
        question: "Does Invisalign work as well as traditional braces?",
        answer: "Yes! Invisalign is highly effective for most common orthodontic issues like crowding, spacing, and bite problems. It uses advanced 3D imaging to plan your entire treatment before you start."
    },
    {
        question: "Are dental implants painful?",
        answer: "Most patients report very little discomfort during the procedure itself, as we use local anesthesia. After the procedure, some minor soreness is normal, but it's typically manageable with over-the-counter medication."
    },
    {
        question: "What should I do in a dental emergency?",
        answer: "If you have a dental emergency, call us immediately. We reserve slots every day for urgent cases like knocked-out teeth, severe pain, or broken restorations to ensure you get care when you need it most."
    }
];

const FaqSection = () => {
    const [openIdx, setOpenIdx] = useState<number | null>(0);

    return (
        <section className="py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-4 sm:px-8">
                <div className="text-center mb-16">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm block mb-4">Common Questions</span>
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-navy-deep mb-6">
                        Everything You Need <span className="text-accent-gold italic">To Know</span>
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className={`border rounded-3xl overflow-hidden transition-all duration-300 ${openIdx === idx ? 'border-primary ring-1 ring-primary/20 bg-background-light' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                        >
                            <button
                                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                                className="w-full px-4 sm:px-8 py-6 text-left flex justify-between items-center gap-4"
                            >
                                <span className={`text-lg font-bold transition-colors ${openIdx === idx ? 'text-primary' : 'text-navy-deep'}`}>
                                    {faq.question}
                                </span>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all ${openIdx === idx ? 'bg-primary border-primary text-white rotate-180' : 'border-gray-200 text-gray-400'}`}>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-500 ease-in-out ${openIdx === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="px-4 sm:px-8 pb-8 text-gray-600 leading-relaxed border-t border-gray-100 pt-6">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-4 sm:p-8 bg-navy-deep rounded-3xl text-center text-white">
                    <p className="text-lg mb-6">Still have questions? We're here to help.</p>
                    <button className="bg-accent-gold text-navy-deep px-4 sm:px-8 py-3 rounded-full font-bold hover:bg-white transition-all shadow-lg active:scale-95">
                        Contact Our Support
                    </button>
                </div>
            </div>
        </section>
    );
};

export default FaqSection;
