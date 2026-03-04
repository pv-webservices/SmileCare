import Image from "next/image";

const TestimonialsSection = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 sm:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    {/* Left: Testimonials Cards */}
                    <div className="flex-1 space-y-12 order-2 lg:order-1">
                        <div>
                            <span className="text-primary font-bold tracking-widest uppercase text-sm block mb-4">Social Proof</span>
                            <h2 className="text-3xl md:text-5xl font-display font-bold text-navy-deep leading-tight">
                                Smiles That Tell <br />
                                <span className="text-accent-gold italic">A Thousand Stories</span>
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {[
                                {
                                    name: "Sarah Miller",
                                    role: "Cosmetic Patient",
                                    text: "The technology here is incredible. I was nervous about my veneers but the digital planning made me feel so confident. The result is better than I ever imagined!",
                                    rating: 5
                                },
                                {
                                    name: "James Wilson",
                                    role: "Invisalign Patient",
                                    text: "Professional, friendly, and efficient. The clinic is beautiful and the team really cares about your comfort. Highly recommend for anyone looking for dental work.",
                                    rating: 5
                                }
                            ].map((testimonial, idx) => (
                                <div key={idx} className="bg-background-light p-4 sm:p-8 rounded-3xl border border-gray-100 flex flex-col gap-4 hover:shadow-xl transition-shadow">
                                    <div className="flex gap-1">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <span key={i} className="text-accent-gold text-lg">★</span>
                                        ))}
                                    </div>
                                    <p className="text-gray-600 italic leading-relaxed">"{testimonial.text}"</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden relative">
                                            <Image
                                                src={`https://i.pravatar.cc/150?u=${testimonial.name}`}
                                                alt={testimonial.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-bold text-navy-deep">{testimonial.name}</p>
                                            <p className="text-sm text-gray-500">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Video Placeholder / Illustration */}
                    <div className="flex-1 order-1 lg:order-2">
                        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl group cursor-pointer">
                            <Image
                                src="https://images.unsplash.com/photo-1527613473219-446a7238c355?auto=format&fit=crop&q=80&w=1200"
                                alt="Patient Story Video"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                                    <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-2" />
                                </div>
                            </div>
                            {/* Label */}
                            <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
                                <p className="text-white font-bold">Watch Sarah's Transformation Journey</p>
                                <p className="text-white/70 text-sm">Duration: 2:45 min</p>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-12 text-center text-gray-400">
                            <div>
                                <p className="text-2xl font-bold text-navy-deep">500+</p>
                                <p className="text-xs uppercase tracking-widest">Video Reviews</p>
                            </div>
                            <div className="w-px h-8 bg-gray-100" />
                            <div>
                                <p className="text-2xl font-bold text-navy-deep">4.9/5</p>
                                <p className="text-xs uppercase tracking-widest">Google Rating</p>
                            </div>
                            <div className="w-px h-8 bg-gray-100" />
                            <div>
                                <p className="text-2xl font-bold text-navy-deep">98%</p>
                                <p className="text-xs uppercase tracking-widest">Success Rate</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
