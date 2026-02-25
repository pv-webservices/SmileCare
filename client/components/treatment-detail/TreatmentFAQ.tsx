interface FAQItem {
    question: string;
    answer: string;
}

interface TreatmentFAQProps {
    faqs: FAQItem[];
}

const TreatmentFAQ = ({ faqs }: TreatmentFAQProps) => {
    return (
        <section className="py-24 bg-white dark:bg-background-dark">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-slate-50 mb-4">
                        Common Questions
                    </h2>
                    <p className="text-slate-500 font-medium">Everything you need to know about the procedure</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <details
                            key={index}
                            className="group border border-slate-200 dark:border-slate-800 rounded-[1.5rem] overflow-hidden transition-all duration-300 open:shadow-xl open:border-primary/20"
                            open={index === 0}
                        >
                            <summary className="flex justify-between items-center p-8 cursor-pointer bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors list-none">
                                <span className="font-bold text-lg text-slate-900 dark:text-slate-50 pr-8">{faq.question}</span>
                                <div className="size-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center group-open:rotate-180 transition-transform duration-500">
                                    <span className="material-symbols-outlined text-primary">expand_more</span>
                                </div>
                            </summary>
                            <div className="p-8 text-slate-600 dark:text-slate-400 leading-relaxed text-lg border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark animate-in fade-in slide-in-from-top-2 duration-300">
                                {faq.answer}
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TreatmentFAQ;
