"use client";

const NewsletterSection = () => {
    return (
        <section className="py-24 bg-primary relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-gold/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 sm:px-8 relative z-10">
                <div className="bg-navy-deep/40 backdrop-blur-xl p-4 sm:p-8 md:p-16 rounded-[3rem] border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
                    <div className="max-w-xl">
                        <span className="text-accent-gold font-bold tracking-widest uppercase text-sm block mb-4">Stay Connected</span>
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                            Join Our Community for <span className="text-accent-gold italic">Exclusive</span> Care Tips
                        </h2>
                        <p className="text-gray-300 text-lg">
                            Get personalized dental health advice, clinic news, and early access to special offers directly in your inbox.
                        </p>
                    </div>

                    <div className="w-full lg:w-auto flex-shrink-0">
                        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto lg:mx-0" onSubmit={(e) => e.preventDefault()}>
                            <div className="relative flex-grow">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="w-full sm:w-[350px] bg-white/10 border-2 border-white/20 rounded-full px-4 sm:px-8 py-5 text-white placeholder:text-white/50 focus:outline-none focus:border-accent-gold focus:ring-4 focus:ring-accent-gold/20 transition-all text-lg"
                                    required
                                />
                                <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none opacity-50">
                                    ✉️
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="bg-accent-gold text-navy-deep px-10 py-5 rounded-full font-bold text-lg hover:bg-white transition-all shadow-xl shadow-black/20 active:scale-95 whitespace-nowrap"
                            >
                                Subscribe Now
                            </button>
                        </form>
                        <p className="mt-4 text-xs text-white/40 lg:text-left">
                            We value your privacy. No spam, just pure dental wisdom. <br className="hidden sm:block" /> Unsubscribe at any time.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewsletterSection;
