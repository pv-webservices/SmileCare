import Image from "next/image";

const TreatmentQuality = () => {
    const features = [
        { icon: "biotech", title: "Ivoclar E.max Press Ceramics" },
        { icon: "magnification_small", title: "0.3mm Ultra-Thin Preparation" },
        { icon: "verified", title: "10-Year Clinical Warranty" }
    ];

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/30">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
                    {/* Left: Image Side */}
                    <div className="w-full lg:w-1/2 relative group">
                        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-square border-4 border-white dark:border-slate-800">
                            <Image
                                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1000"
                                alt="Dental technician working on high-precision ceramic veneers"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute bottom-6 right-6 left-6 md:left-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20">
                                <p className="text-primary font-black text-2xl uppercase tracking-tighter mb-1">Swiss Zirconia</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Elite Grade Laboratory</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Content Side */}
                    <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
                        <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-slate-50 mb-6 leading-tight">
                                Uncompromising Quality
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-body">
                                We partner exclusively with the world&apos;s leading dental laboratories to ensure every restoration meets clinical luxury standards. Our commitment to precision is obsessive.
                            </p>
                        </div>

                        <div className="grid gap-4 max-w-lg mx-auto lg:mx-0">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-5 p-5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 hover:border-primary/20 transition-all duration-300"
                                >
                                    <div className="size-10 bg-primary/5 text-primary rounded-lg flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-xl">{feature.icon}</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-slate-50 tracking-tight">{feature.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TreatmentQuality;
