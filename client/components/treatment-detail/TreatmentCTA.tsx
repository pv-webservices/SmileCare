import Image from "next/image";
import Link from "next/link";

interface TreatmentCTAProps {
    title: string;
}

const TreatmentCTA = ({ title }: TreatmentCTAProps) => {
    return (
        <section className="py-24 px-6 mb-12">
            <div className="max-w-7xl mx-auto">
                <div className="bg-primary rounded-[3rem] p-12 md:p-20 relative overflow-hidden group shadow-[0_35px_60px_-15px_rgba(var(--primary-rgb),0.3)]">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <svg fill="none" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
                            <pattern height="40" id="grid" patternUnits="userSpaceOnUse" width="40">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                            <rect fill="url(#grid)" height="100%" width="100%" />
                        </svg>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/10 transition-colors duration-700" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-gold/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
                        <div className="max-w-2xl text-center lg:text-left">
                            <span className="text-accent-gold font-bold tracking-[0.2em] uppercase text-xs mb-4 block drop-shadow-sm">
                                Clinical Luxury Redefined
                            </span>
                            <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-8 leading-[1.1]">
                                Transform Your Smile with <span className="text-accent-gold italic">Dr. Julian Thorne</span>
                            </h2>
                            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-lg leading-relaxed font-body font-light">
                                Schedule your bespoke {title.toLowerCase()} consultation today and discover why we are the choice for elite cosmetic care.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link
                                    href="/booking"
                                    className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all shadow-xl shadow-black/10 inline-block text-center"
                                >
                                    Book Consultation
                                </Link>
                                <Link
                                    href="/gallery"
                                    className="bg-transparent border-2 border-white/20 hover:border-white text-white px-8 py-4 rounded-xl font-bold text-lg transition-all inline-block text-center"
                                >
                                    View Smile Gallery
                                </Link>
                            </div>
                        </div>

                        <div className="hidden lg:block relative shrink-0">
                            <div className="relative bg-white/5 backdrop-blur-xl p-4 rounded-[2.5rem] border border-white/10 shadow-2xl">
                                <div className="relative size-64 overflow-hidden rounded-[2rem]">
                                    <Image
                                        src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800"
                                        alt="Specialist Dr. Julian Thorne"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-xl border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-slate-900 text-sm font-bold whitespace-nowrap">Available Today</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TreatmentCTA;
