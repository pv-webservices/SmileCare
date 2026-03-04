"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

interface TreatmentFAQProps {
    faqs: FAQItem[];
}

const TreatmentFAQ = ({ faqs }: TreatmentFAQProps) => {
    const [openIndex, setOpenIndex] = useState<number>(0);

    return (
        <section className="py-24 bg-white">
            <div className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center size-14 bg-primary/10 rounded-2xl mb-5">
                        <HelpCircle size={28} className="text-primary" />
                    </div>
                    <h2 className="text-4xl font-display font-bold text-slate-900 mb-4">
                        Common Questions
                    </h2>
                    <p className="text-slate-500 font-medium">
                        Everything you need to know about the procedure
                    </p>
                </div>

                {/* Accordion */}
                <div className="space-y-3">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div
                                key={index}
                                className={`rounded-2xl border overflow-hidden transition-all duration-300 ${isOpen
                                        ? "border-primary/20 shadow-lg shadow-primary/5"
                                        : "border-slate-200 shadow-sm"
                                    }`}
                            >
                                {/* Question */}
                                <button
                                    onClick={() =>
                                        setOpenIndex(isOpen ? -1 : index)
                                    }
                                    className="w-full flex justify-between items-center p-6 sm:p-4 sm:p-8 text-left bg-white hover:bg-slate-50/60 transition-colors"
                                    aria-expanded={isOpen}
                                >
                                    <span className="font-bold text-base sm:text-lg text-slate-900 pr-6 leading-snug">
                                        {faq.question}
                                    </span>
                                    <div
                                        className={`size-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isOpen
                                                ? "bg-primary text-white rotate-180"
                                                : "bg-slate-100 text-slate-500"
                                            }`}
                                    >
                                        <ChevronDown size={18} />
                                    </div>
                                </button>

                                {/* Answer */}
                                <div
                                    className={`overflow-hidden transition-all duration-300 ${isOpen
                                            ? "max-h-96 opacity-100"
                                            : "max-h-0 opacity-0"
                                        }`}
                                >
                                    <p className="px-6 sm:px-4 sm:px-8 pb-6 sm:pb-8 text-slate-600 leading-relaxed text-base border-t border-slate-100 pt-5">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default TreatmentFAQ;
