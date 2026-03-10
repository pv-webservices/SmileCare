"use client";

const NewsletterSection = () => {
    return (
        <section className="py-16 md:py-24 bg-primary relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-gold/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="bg-navy-deep/40 backdrop-blur-xl p-6 sm:p-10 md:p-16 rounded-3xl md:rounded-[3rem] border border-white/10">
                    {/* Text block */}
                    <div className="text-center mb-10 md:mb-12">
                        <span className="text-accent-gold font-bold tracking-widest uppercase text-sm block mb-4">Stay Connected</span>
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-white mb-4 md:mb-6 leading-tight">
                            Join Our Community for{" "}
                            <span className="text-accent-gold italic">Exclusive</span> Care Tips
                        </h2>
                        <p className="text-gray-300 text-base md:text-lg max-w-xl mx-auto">
                            Get personalized dental health advice, clinic news, and early access to special offers directly in your inbox.
                        </p>
                    </div>

                    {/* Form block */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-xl">
                            <form
                                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                                onSubmit={(e) => e.preventDefault()}
                            >
                                <div className="relative flex-1 min-w-0">
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        className="w-full bg-white/10 border-2 border-white/20 rounded-full px-5 sm:px-7 py-4 text-white placeholder:text-white/50 focus:outline-none focus:border-accent-gold focus:ring-4 focus:ring-accent-gold/20 transition-all text-base"
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none opacity-50">
                                        ✉️
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="flex-shrink-0 bg-accent-gold text-navy-deep px-8 py-4 rounded-full font-bold text-base hover:bg-white transition-all shadow-xl shadow-black/20 active:scale-95 whitespace-nowrap"
                                >
                                    Subscribe Now
                                </button>
                            </form>
                            <p className="mt-4 text-xs text-white/40 text-center">
                                We value your privacy. No spam, just pure dental wisdom.{" "}
                                Unsubscribe at any time.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewsletterSection;
