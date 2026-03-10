import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

interface QualityFeature {
    title: string;
}

interface TreatmentQualityProps {
    title: string;
    body: string;
    badge: string;
    badgeSub: string;
    features: QualityFeature[];
}

const TreatmentQuality = ({
    title,
    body,
    badge,
    badgeSub,
    features,
}: TreatmentQualityProps) => {
    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">

                    {/* Left: Image */}
                    <div className="w-full lg:w-1/2 relative group">
                        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-square border-4 border-white">
                            <Image
                                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1000"
                                alt="Clinical precision at SmileCare"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                unoptimized
                            />
                            {/* Badge overlay */}
                            <div className="absolute bottom-6 right-6 left-6 md:left-auto bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20">
                                <p className="text-primary font-bold text-2xl uppercase tracking-tighter mb-1">
                                    {badge}
                                </p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                    {badgeSub}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-3">
                                Our Standards
                            </p>
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6 leading-tight">
                                {title}
                            </h2>
                            <p className="text-slate-600 text-lg leading-relaxed font-body">
                                {body}
                            </p>
                        </div>

                        <div className="grid gap-4 max-w-lg mx-auto lg:mx-0">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-5 p-5 rounded-xl bg-white shadow-sm border border-slate-100 hover:border-primary/20 transition-all duration-300"
                                >
                                    <div className="size-10 bg-primary/5 text-primary rounded-lg flex items-center justify-center shrink-0">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <span className="font-semibold text-slate-900 tracking-tight">
                                        {feature.title}
                                    </span>
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
