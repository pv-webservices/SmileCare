import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { TreatmentDetail } from "@/lib/treatments-data";

interface RelatedTreatmentsProps {
    treatments: TreatmentDetail[];
}

const CATEGORY_COLOURS: Record<string, string> = {
    Cosmetic: "bg-rose-100 text-rose-700",
    Orthodontics: "bg-violet-100 text-violet-700",
    Restorative: "bg-blue-100 text-blue-700",
    Preventative: "bg-emerald-100 text-emerald-700",
};

const RelatedTreatments = ({ treatments }: RelatedTreatmentsProps) => {
    if (!treatments || treatments.length === 0) return null;

    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-2">
                            Continue Exploring
                        </p>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900">
                            Related Treatments
                        </h2>
                    </div>
                    <Link
                        href="/treatments"
                        className="hidden sm:flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all"
                    >
                        View All <ArrowRight size={16} />
                    </Link>
                </div>

                {/* Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {treatments.slice(0, 3).map((treatment) => (
                        <Link
                            key={treatment.slug}
                            href={`/treatments/${treatment.slug}`}
                            className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-primary/20 shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            {/* Image */}
                            <div className="relative h-52 overflow-hidden">
                                <Image
                                    src={treatment.image}
                                    alt={treatment.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    unoptimized
                                />
                                <div className="absolute top-4 left-4">
                                    <span
                                        className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${CATEGORY_COLOURS[treatment.category] ||
                                            "bg-slate-100 text-slate-700"
                                            }`}
                                    >
                                        {treatment.category}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-lg font-display font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                                    {treatment.title}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">
                                    {treatment.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-primary font-bold text-sm">
                                        From ₹{treatment.startingPrice.toLocaleString("en-IN")}
                                    </span>
                                    <span className="flex items-center gap-1 text-primary font-bold text-sm group-hover:gap-2 transition-all">
                                        Learn More <ArrowRight size={14} />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Mobile view all link */}
                <div className="sm:hidden mt-8 text-center">
                    <Link
                        href="/treatments"
                        className="inline-flex items-center gap-2 text-primary font-bold"
                    >
                        View All Treatments <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default RelatedTreatments;
