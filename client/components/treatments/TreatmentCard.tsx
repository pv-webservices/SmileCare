import Image from "next/image";
import Link from "next/link";

export interface Treatment {
    id: number;
    title: string;
    slug: string;
    category: string;
    description: string;
    image: string;
}

interface TreatmentCardProps {
    treatment: Treatment;
}

const TreatmentCard = ({ treatment }: TreatmentCardProps) => {
    return (
        <div className="group flex flex-col bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
            {/* Image */}
            <div className="relative h-56 overflow-hidden">
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-primary font-bold text-xs px-3 py-1 rounded-full z-10">
                    {treatment.category}
                </div>
                <Image
                    src={treatment.image}
                    alt={treatment.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-50 font-display">
                    {treatment.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 flex-1">
                    {treatment.description}
                </p>
                <div className="flex gap-3">
                    <Link
                        href="/booking"
                        className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors text-center"
                    >
                        Book Now
                    </Link>
                    <Link
                        href={`/treatments/${treatment.slug}`}
                        className="flex-1 border border-primary text-primary py-2.5 rounded-lg text-sm font-bold hover:bg-primary/5 transition-colors text-center"
                    >
                        Learn More
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TreatmentCard;
