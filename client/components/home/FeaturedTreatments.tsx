import Image from "next/image";
import Link from "next/link";

const treatments = [
    {
        title: "Cosmetic Dentistry",
        description: "Transform your smile with veneers, bonding, and aesthetic contouring tailored to your face.",
        image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800",
        badge: "Popular",
        slug: "cosmetic",
    },
    {
        title: "Dental Implants",
        description: "Permanent, natural-looking solutions for missing teeth using the highest quality titanium.",
        image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=800",
        badge: "Advanced",
        slug: "implants",
    },
    {
        title: "Invisalign",
        description: "Straighten your teeth discreetly with clear, removable aligners that fit your lifestyle.",
        image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800",
        badge: "Most Choice",
        slug: "invisalign",
    }
];

const FeaturedTreatments = () => {
    return (
        <section className="py-24 bg-background-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 sm:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm block mb-4">Our Specialities</span>
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-navy-deep mb-6">
                        Premium Care for Your <span className="text-accent-gold">Perfect Smile</span>
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Discover our range of advanced dental treatments designed to give you the confidence you deserve.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:p-8">
                    {treatments.map((item, idx) => (
                        <div
                            key={idx}
                            className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col"
                        >
                            {/* Image Container */}
                            <div className="relative h-64 overflow-hidden">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                    {item.badge}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Content */}
                            <div className="p-4 sm:p-8 flex-grow flex flex-col">
                                <h3 className="text-2xl font-display font-bold text-navy-deep mb-4 group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 mb-8 leading-relaxed line-clamp-3">
                                    {item.description}
                                </p>

                                <div className="mt-auto">
                                    <Link href={`/treatments#${item.slug}`} className="flex items-center gap-2 text-primary font-bold group/link inline-flex">
                                        <span>View Treatment</span>
                                        <div className="w-8 h-px bg-primary transform origin-left transition-all duration-300 group-hover/link:w-12 group-hover/link:bg-accent-gold" />
                                        <svg className="w-4 h-4 transform group-hover/link:translate-x-1 group-hover/link:text-accent-gold transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link href="/treatments" className="inline-block bg-transparent border-2 border-navy-deep text-navy-deep px-10 py-4 rounded-full font-bold hover:bg-navy-deep hover:text-white transition-all active:scale-95">
                        View All Treatments
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedTreatments;
