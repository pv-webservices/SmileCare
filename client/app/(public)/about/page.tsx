import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About SmileCare | Luxury Dental Clinic",
    description: "Learn about SmileCare's clinical excellence, specialists, and journey."
};

const trustSignals = [
    { icon: "verified", label: "ISO 9001 Certified" },
    { icon: "eco", label: "Eco-Friendly Practice" },
    { icon: "biotech", label: "On-site High-Tech Lab" },
    { icon: "workspace_premium", label: "Award Winning Team" },
];

const coreValues = [
    {
        icon: "clinical_notes",
        title: "Clinical Excellence",
        description: "Advanced medical protocols combined with the latest technological breakthroughs for optimal health outcomes."
    },
    {
        icon: "volunteer_activism",
        title: "Patient-Centric Care",
        description: "Bespoke treatments tailored to your unique anatomical needs and aesthetic goals, delivered with empathy."
    },
    {
        icon: "spa",
        title: "Luxury Environment",
        description: "A relaxing, spa-like atmosphere designed to alleviate anxiety and provide a peaceful clinical journey."
    },
];

const timeline = [
    {
        year: "2008",
        title: "Founding Vision",
        description: "Dr. Alistair Vance founded SmileCare with a single mission: to bridge the gap between medical precision and aesthetic luxury.",
        active: true
    },
    {
        year: "2014",
        title: "Digital Transformation",
        description: "Transitioned to a 100% digital workflow, incorporating 3D oral scanning and in-house CAD/CAM crown fabrication.",
        active: false
    },
    {
        year: "2020",
        title: "The Grand Expansion",
        description: "Unveiled our current 8,000 sq ft facility, featuring private recovery suites and an advanced surgical amphitheater.",
        active: false
    },
    {
        year: "Today",
        title: "Pioneering Bio-Dentistry",
        description: "Leading the region in minimally invasive biological dentistry and eco-conscious medical practices.",
        active: false
    },
];

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATIC_SPECIALISTS = [
    {
        name: "Dr. Alistair Vance",
        role: "Chief Dental Surgeon",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqHojbFqkst4Q8cpO8HJDyyTdERYrjN4E94ftdOrH4aO2rve7fzHWpdNV9hExhz0NC1MQx2octdo-iFFenj1mIfq9ABEtK3UoYNNEvqlR24RBL5ZzRa8pNT9jPLhG3F_qydWIMiAKhIyeOwI8YgdL3T-DDZc3Cdx1-pQYADqA_0dNIKxJWP7weMGv6lxvAcl_Cq0GQWC4-w59JL6JCClhAVwUgD34_hc1OzeaxnY3ch8GoJLsVod6hiKOkdpr4wNk6gn7XeeLOO0th"
    },
    {
        name: "Dr. Elena Rodriguez",
        role: "Orthodontist Specialist",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHKSOgUD7Ua2sSBC9wP_vos-GBeVq0mqsznGhw7qHZ-KQ6Aquzu3OMb3et5SzhjwCYudacYGJLWq9znitTjDQPta3W4-M11nCh6LmMQjDbvbeftbzgpXvMk1rOk5mq-E94OBXX4koQKwN5XH0QO76OTvoKOw1XpFhxCvAMz92nyjwSsnirOqKyVMX-k9AMdryXl__WXcHJ3-JatzSs-W5lAx-gGU3rjdhbhUyVAMMy9t_DUSS2VWV8w9U8rmzpVd2l6iNXc3nLyl5o"
    },
    {
        name: "Dr. Marcus Thorne",
        role: "Implantologist",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzfIMY20npuMT46eSEZDY9MKw6SNjK2fX6WrzRKCC7UsaVrfvfOXfm6XBd6nKC98309gUgP065nM_o_RxEIQh9yw-lwvHXzAwvOqNYocw9foRVGEsiEzfUyTdk9EauAJgguffXN8UvMMTlRw7KFTJ4Lmc_miWrSchSQ5AVRw8Z61xXxiGesFQZiqM6NvNh7zhMUbfUhUHmH_IyKz70D9EEo6ZrOOylvrwiCaKTc-v21w1yzt67oYwBJ-US0_frE0YrnDhV4QmCOIk8"
    },
    {
        name: "Dr. Sarah Chen",
        role: "Cosmetic Dentist",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCL3dAG8AKw2fwAdaIKef_YzRO_JP5x9i2LQiQQSKk7S_5TDLi6HUjJEFyAJ9_bWUZtBTzwq6FqOETSRzCoRBR_5jVEbQyVbtq7ZOe7iyB2s3J1ryv-wK1zX4pSV5L8ErvDdrwGPUbwotkrgFLf54rpxchYyQxBA8HM87mMp0VumDBtP0u-BvinUmeK8ZwiZQS5LLLeIJhutkiyvxmlCLec-df3asnicfbgxTK4zk8CZTk-pW8ryJM23tGVD2ZdOenkaPKh31gUPqyx"
    },
];

async function getSpecialists() {
    try {
        const res = await fetch(`${API}/api/dentists`,
            { next: { revalidate: 600 } }
        );
        if (!res.ok) return STATIC_SPECIALISTS;
        const data = await res.json();
        if (!data || data.length === 0) return STATIC_SPECIALISTS;
        return data.map((d: any) => ({
            name: d.name?.startsWith("Dr.")
                ? d.name
                : `Dr. ${d.name}`,
            role: d.specialty || d.specialization || "Dental Specialist",
            image: d.photoUrl || d.image || "",
        }));
    } catch {
        return STATIC_SPECIALISTS;
    }
}

export default async function AboutPage() {
    const specialists = await getSpecialists();
    return (
        <main className="bg-background-light">

            {/* Breadcrumb */}
            <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center gap-2 text-sm font-medium">
                <Link href="/" className="text-primary/60 hover:text-primary transition-colors">Home</Link>
                <span className="material-symbols-outlined text-xs text-primary/30">chevron_right</span>
                <span className="text-primary font-semibold">About</span>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="order-2 lg:order-1">
                        <h1 className="font-display text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 text-primary">
                            Excellence in <br />
                            <span className="italic text-accent-gold">Every Smile</span>
                        </h1>
                        <p className="text-lg text-primary/60 mb-8 leading-relaxed max-w-xl font-sans">
                            Experience clinical luxury where advanced dental science meets unparalleled patient comfort. Our state-of-the-art facility is designed for those who seek the highest standard of oral health.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/contact" className="bg-primary text-white px-4 sm:px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                                Explore Our Facility
                            </Link>
                            <a href="#specialists" className="border border-primary/20 bg-primary/5 text-primary px-4 sm:px-8 py-4 rounded-xl font-bold hover:bg-primary/10 transition-all">
                                Meet Our Team
                            </a>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl group-hover:bg-primary/15 transition-all" />
                            <div className="relative h-[500px] w-full rounded-2xl shadow-2xl overflow-hidden border border-primary/10">
                                <Image
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-ZYLFvqZnj8uR6Bw2NdQD8TSbRT1zYjgul5cyUpBqPp25bba4g5A0HUVW-ZAOT4bmGJ6ygHkKugFp_dzzvgi_w0vK6hDSeMQJVvaPlMaHs5B9AsuAlMJ9k1U9jkkaaC4KloeXVBrUAQOcjpdhB1_EWjRiukNuguwe5Cf202vX0OitmE4qEWyYwD1LgDUmUxtE6ooFGW4KtpKPmmACT82PG5jz3B5npPFAMJDl8ZVQvx0T56SqVlIkLtjUWuszINJnSzzejRZ3H0eO"
                                    alt="Modern high-end dental clinic reception area with marble finishes"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Signals */}
            <section className="bg-pearl border-y border-primary/5 py-16 mb-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:p-8">
                        {trustSignals.map((signal) => (
                            <div key={signal.label} className="flex flex-col items-center text-center gap-3">
                                <span className="material-symbols-outlined text-primary text-4xl">{signal.icon}</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-primary/50">{signal.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="max-w-7xl mx-auto px-6 mb-32">
                <div className="text-center mb-16">
                    <h2 className="font-display text-3xl font-bold text-primary mb-4">The Core of SmileCare</h2>
                    <div className="h-1 w-20 bg-primary mx-auto" />
                </div>
                <div className="grid md:grid-cols-3 gap-4 sm:p-8">
                    {coreValues.map((value) => (
                        <div key={value.title} className="group p-4 sm:p-8 rounded-2xl bg-pearl border border-primary/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                            <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">{value.icon}</span>
                            </div>
                            <h3 className="font-display text-xl font-bold text-primary mb-3">{value.title}</h3>
                            <p className="text-primary/60 leading-relaxed font-sans">{value.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Timeline */}
            <section className="max-w-5xl mx-auto px-6 mb-32">
                <div className="text-center mb-16">
                    <h2 className="font-display text-3xl font-bold text-primary mb-4">Our Journey</h2>
                    <p className="text-primary/50 font-sans">A legacy of dental innovation since 2008</p>
                </div>
                <div className="relative border-l-2 border-primary/20 ml-4 md:ml-8">
                    {timeline.map((item, i) => (
                        <div key={item.year} className={`relative pl-10 ${i < timeline.length - 1 ? "mb-16" : ""}`}>
                            <div className={`absolute -left-[11px] top-0 size-5 rounded-full border-4 border-background-light ${item.active ? "bg-primary" : "bg-primary/40"}`} />
                            <span className={`font-bold text-lg ${item.active ? "text-primary" : "text-primary/40"}`}>{item.year}</span>
                            <h3 className="font-display text-xl font-bold text-primary mt-1">{item.title}</h3>
                            <p className="text-primary/60 mt-2 leading-relaxed font-sans">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Meet the Specialists */}
            <section id="specialists" className="max-w-7xl mx-auto px-6 mb-32">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-4">
                    <div>
                        <h2 className="font-display text-3xl font-bold text-primary mb-2">Meet Our Specialists</h2>
                        <p className="text-primary/50 font-sans">World-class expertise at your service</p>
                    </div>
                    <Link href="/treatments" className="text-primary font-bold flex items-center gap-2 hover:underline">
                        View Full Clinical Staff
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:p-8">
                    {specialists.map((doctor: any) => (
                        <div key={doctor.name} className="group">
                            <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-4 relative">
                                <Image
                                    src={doctor.image}
                                    alt={`Portrait of ${doctor.name}`}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    unoptimized
                                />
                            </div>
                            <h4 className="text-lg font-bold text-primary">{doctor.name}</h4>
                            <p className="text-primary/60 text-sm font-medium uppercase tracking-wider">{doctor.role}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
