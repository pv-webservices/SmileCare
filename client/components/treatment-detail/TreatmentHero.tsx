import Image from "next/image";
import Link from "next/link";
import { Clock, CalendarPlus, ChevronRight } from "lucide-react";

interface TreatmentHeroProps {
    title: string;
    description: string;
    image: string;
    category: string;
    duration: string;
    startingPrice: number;
    slug: string;
}

const TreatmentHero = ({
    title,
    description,
    image,
    category,
    duration,
    startingPrice,
    slug,
}: TreatmentHeroProps) => {
    return (
        <section className="relative h-[80vh] min-h-[560px] flex items-end overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark/95 via-background-dark/50 to-transparent z-10" />
                <Image
                    src={image}
                    alt={title}
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="100vw"
                    unoptimized
                />
            </div>

            {/* Content */}
            <div className="relative z-20 max-w-7xl mx-auto w-full px-6 pb-16 md:pb-20">
                <div className="max-w-3xl">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/30 backdrop-blur-sm">
                            Since 2010
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-widest text-slate-300 opacity-80">
                            Excellence in {category}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/60 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                            <Clock size={11} />
                            {duration}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-6 leading-tight tracking-tight">
                        {title}
                    </h1>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-slate-300 max-w-xl leading-relaxed font-body mb-8">
                        {description}
                    </p>

                    {/* Price + CTA row */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Price indicator */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-5 py-3">
                            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-0.5">
                                Starting from
                            </p>
                            <p className="text-white font-display font-black text-xl">
                                ₹{startingPrice.toLocaleString("en-IN")}
                            </p>
                        </div>

                        {/* Book CTA */}
                        <Link
                            href={`/booking?treatment=${slug}`}
                            className="flex items-center gap-2 bg-primary text-white px-6 py-3.5 rounded-xl font-bold text-base shadow-xl shadow-primary/30 hover:opacity-90 active:scale-[0.98] transition-all"
                        >
                            <CalendarPlus size={18} />
                            Book This Treatment
                            <ChevronRight size={16} />
                        </Link>

                        {/* Learn pricing link */}
                        <Link
                            href="/contact"
                            className="text-white/60 text-sm font-medium hover:text-white transition-colors underline underline-offset-2"
                        >
                            Request pricing details
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TreatmentHero;
