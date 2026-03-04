import Image from "next/image";
import Link from "next/link";

const TechSection = () => {
    const features = [
        "Advanced 3D Dental Imaging (CBCT)",
        "Pain-free Laser Dentistry",
        "Digital Intraoral Scanning",
        "AI-Driven Treatment Planning",
        "CEREC Same-Day Crowns"
    ];

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 sm:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    {/* Image Column */}
                    <div className="flex-1 relative">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent-gold/10 rounded-full blur-3xl z-0" />
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl z-0" />

                        <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl skew-y-1 hover:skew-y-0 transition-transform duration-700">
                            <Image
                                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1000"
                                alt="Advanced Dental Technology"
                                width={1000}
                                height={800}
                                className="object-cover"
                            />
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl" />
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hidden md:block animate-bounce-slow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-accent-gold rounded-full flex items-center justify-center text-white text-2xl">
                                    ✨
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-bold text-gray-500 tracking-wider">Next-Gen</p>
                                    <p className="text-navy-deep font-bold italic">Standard of Care</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <span className="text-primary font-bold tracking-widest uppercase text-sm block mb-4">Precision Technology</span>
                            <h2 className="text-3xl md:text-5xl font-display font-bold text-navy-deep leading-tight">
                                Where Technology Meets <span className="text-accent-gold underline decoration-accent-gold/30 underline-offset-8">Gentle Care</span>
                            </h2>
                        </div>

                        <p className="text-lg text-gray-600 leading-relaxed">
                            We invest in the world's most advanced dental technology to ensure your treatments are faster, more accurate, and completely pain-free. From diagnostic imaging to final restoration, every step is digital.
                        </p>

                        <ul className="grid grid-cols-1 gap-4">
                            {features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-4 group">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                                        <svg className="w-3.5 h-3.5 text-primary group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-navy-deep font-medium group-hover:translate-x-1 transition-transform">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="pt-4">
                            <Link href="/about" className="flex items-center gap-3 text-primary font-bold group inline-flex">
                                <span>Learn More About Our Tech</span>
                                <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TechSection;
