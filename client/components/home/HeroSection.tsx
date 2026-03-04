import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
    return (
        <section className="relative min-h-[80vh] flex items-center pt-20 overflow-hidden">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2070"
                    alt="Modern Dental Clinic"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/90 via-navy-deep/50 to-transparent" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 sm:px-8 w-full">
                <div className="max-w-2xl animate-in fade-in slide-in-from-left-8 duration-1000">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight mb-6">
                        Excellence in <span className="text-accent-gold italic">Modern</span> Dentistry
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed max-w-xl">
                        Experience world-class dental care with state-of-the-art technology and a team dedicated to your comfort and smile.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/booking" className="bg-primary text-white px-4 sm:px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-primary transition-all shadow-xl active:scale-95 text-center">
                            Book an Appointment
                        </Link>
                        <Link href="/treatments" className="bg-transparent border-2 border-accent-gold text-accent-gold px-4 sm:px-8 py-4 rounded-full font-bold text-lg hover:bg-accent-gold hover:text-navy-deep transition-all active:scale-95 text-center">
                            Our Services
                        </Link>
                    </div>

                    {/* Stats/Badges */}
                    <div className="mt-16 flex items-center space-x-8 text-white/80">
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold text-accent-gold">15+</span>
                            <span className="text-sm uppercase tracking-wider">Years Exp</span>
                        </div>
                        <div className="w-px h-10 bg-white/20" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold text-accent-gold">10k+</span>
                            <span className="text-sm uppercase tracking-wider">Happy Patients</span>
                        </div>
                        <div className="w-px h-10 bg-white/20" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold text-accent-gold">4.9/5</span>
                            <span className="text-sm uppercase tracking-wider">Patient Rating</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
                <div className="w-1 h-12 rounded-full bg-white/20 flex justify-center">
                    <div className="w-1 h-3 bg-accent-gold rounded-full mt-2" />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
