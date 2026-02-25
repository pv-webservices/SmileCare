import Image from "next/image";

interface TreatmentHeroProps {
    title: string;
    description: string;
    image: string;
    category: string;
}

const TreatmentHero = ({ title, description, image, category }: TreatmentHeroProps) => {
    return (
        <section className="relative h-[70vh] flex items-end overflow-hidden">
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
                />
            </div>

            {/* Content Container */}
            <div className="relative z-20 max-w-7xl mx-auto w-full px-6 pb-20">
                <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/30 backdrop-blur-sm">
                            Since 2010
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-widest text-slate-300 opacity-80">
                            Excellence in {category}
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-6 leading-tight tracking-tight">
                        {title}
                    </h1>

                    <p className="text-lg md:text-xl text-slate-300 max-w-xl leading-relaxed font-body">
                        {description}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default TreatmentHero;
