import { notFound } from "next/navigation";
import TreatmentBreadcrumb from "@/components/treatment-detail/TreatmentBreadcrumb";
import TreatmentHero from "@/components/treatment-detail/TreatmentHero";
import TreatmentProcess from "@/components/treatment-detail/TreatmentProcess";
import TreatmentQuality from "@/components/treatment-detail/TreatmentQuality";
import TreatmentFAQ from "@/components/treatment-detail/TreatmentFAQ";
import TreatmentCTA from "@/components/treatment-detail/TreatmentCTA";

// Mock Data
const treatments = [
    {
        slug: "porcelain-veneers",
        title: "Porcelain Veneers",
        category: "Cosmetic",
        description: "Achieve a flawless, natural-looking smile with our bespoke ceramic restorations crafted for longevity and brilliance.",
        heroImage: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&q=80&w=1600",
        process: [
            { title: "Digital Planning", description: "Using advanced 3D scanning, we map your unique facial features to design a smile that complements your natural beauty perfectly." },
            { title: "Minimal Preparation", description: "Ultra-conservative techniques ensure maximum tooth preservation. We use Swiss micro-instruments for unparalleled precision." },
            { title: "Final Bonding", description: "Each veneer is individually hand-finished and bonded with medical-grade resins for a permanent, lifelike transformation." }
        ],
        faq: [
            { question: "How long do porcelain veneers last?", answer: "With proper oral hygiene and regular professional cleanings, high-quality porcelain veneers typically last between 10 to 15 years, and often even longer." },
            { question: "Is the procedure painful?", answer: "The process is generally minimally invasive. We use local anesthesia to ensure complete comfort during the preparation stage. Post-operative sensitivity is minimal and temporary." },
            { question: "Are veneers stain-resistant?", answer: "Yes, high-grade porcelain is highly resistant to stains from coffee, tea, and tobacco, maintaining their brilliance much better than natural tooth enamel." }
        ]
    },
    {
        slug: "invisalign-clear-aligners",
        title: "Invisalign Aligners",
        category: "Orthodontics",
        description: "Straighten your teeth discreetly with clear, removable aligners designed for maximum comfort and efficient results.",
        heroImage: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=1600",
        process: [
            { title: "Consultation & Scan", description: "We use iTero 3D scanning to capture a precise digital map of your teeth, allowing us to plan every movement with precision." },
            { title: "Custom Aligner Series", description: "A series of bespoke clear aligners are manufactured using SmartTrack material to move your teeth gradually into the ideal position." },
            { title: "The Revelation", description: "Once the series is complete, you will reveal a perfectly aligned smile. We provide custom retainers to maintain your new look." }
        ],
        faq: [
            { question: "How many hours a day should I wear them?", answer: "For optimal results, aligners should be worn for 20 to 22 hours per day, removing them only for eating, drinking, and cleaning." },
            { question: "How long does treatment usually take?", answer: "Treatment time varies depending on complexity, but most patients achieve their goal in 6 to 18 months." }
        ]
    },
    {
        slug: "laser-teeth-whitening",
        title: "Laser Teeth Whitening",
        category: "Cosmetic",
        description: "Brighten your smile by up to 8 shades in a single visit with our professional laser whitening technology.",
        heroImage: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=1600",
        process: [
            { title: "Preparation", description: "We protect your gums and lips before applying a professional-grade whitening gel to your teeth." },
            { title: "Laser Activation", description: "A specialized blue light activates the gel, accelerating the whitening process and breaking down deep stains." },
            { title: "Post-Treatment Care", description: "We provide a desensitizing treatment and a home care kit to maintain your brilliant new smile." }
        ],
        faq: [
            { question: "How long does the appointment take?", answer: "A typical laser whitening session takes about 60 to 90 minutes." },
            { question: "Is it safe for enamel?", answer: "Yes, professional laser whitening is safe for your enamel when performed by our qualified dental professionals." }
        ]
    },
    {
        slug: "permanent-dental-implants",
        title: "Dental Implants",
        category: "Restorative",
        description: "The permanent solution for missing teeth. Restore your smile's function and aesthetics with life-like titanium implants.",
        heroImage: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=1600",
        process: [
            { title: "Initial Assessment", description: "Comprehensive 3D scans ensure you have adequate bone density and determine the precise placement for the implant." },
            { title: "Implant Placement", description: "A small titanium post is expertly placed in the jawbone, acting as a direct replacement for the tooth root." },
            { title: "Restoration", description: "Once healed, a custom-crafted porcelain crown is attached, blending seamlessly with your natural teeth." }
        ],
        faq: [
            { question: "How long is the healing process?", answer: "Bone integration usually takes 3 to 6 months before the final crown can be placed." },
            { question: "Are implants permanent?", answer: "With proper care, dental implants can last a lifetime, making them a highly cost-effective solution." }
        ]
    },
    {
        slug: "dental-crowns-bridges",
        title: "Crowns & Bridges",
        category: "Restorative",
        description: "Repair damaged or missing teeth with precision-crafted dental porcelain that restores strength and beauty.",
        heroImage: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1600",
        process: [
            { title: "Tooth Preparation", description: "The affected tooth is gently reshaped to accommodate the crown. Digital impressions are then taken." },
            { title: "Temporary Restoration", description: "A high-quality temporary crown is placed while your permanent restoration is crafted in our partner laboratory." },
            { title: "Final Placement", description: "The custom crown is precisely fitted and bonded, restoring full function and aesthetics to your smile." }
        ],
        faq: [
            { question: "What is the difference between a crown and a bridge?", answer: "A crown covers a single damaged tooth, while a bridge replaces one or more missing teeth by anchoring to adjacent teeth." }
        ]
    },
    {
        slug: "complete-oral-health-check",
        title: "Oral Health Check",
        category: "Preventative",
        description: "A comprehensive examination focusing on early detection and prevention to maintain your lifelong dental wellbeing.",
        heroImage: "https://images.unsplash.com/photo-1588776813677-77aaf5595b83?auto=format&fit=crop&q=80&w=1600",
        process: [
            { title: "Digital Diagnostics", description: "Low-radiation digital X-rays and intra-oral cameras provide a detailed view of your oral health." },
            { title: "Clinical Examination", description: "Our specialists check for signs of decay, gum disease, and conduct a thorough oral cancer screening." },
            { title: "Personalized Plan", description: "We discuss our findings and create a bespoke long-term care plan tailored to your specific needs." }
        ],
        faq: [
            { question: "How often should I have a check-up?", answer: "We generally recommend a comprehensive check-up every 6 months for most patients." }
        ]
    },
    {
        slug: "ceramic-braces",
        title: "Ceramic Braces",
        category: "Orthodontics",
        description: "Clear and discreet orthodontic treatment using tooth-colored ceramic brackets for a more aesthetic straightening experience.",
        heroImage: "https://images.unsplash.com/photo-1571772996211-2f02974a235a?auto=format&fit=crop&q=80&w=1600",
        process: [
            { title: "Design Phase", description: "We plan your alignment journey using specialized software to ensure the most efficient and aesthetic results." },
            { title: "Bracket Bonding", description: "Discreet ceramic brackets are bonded to your teeth and connected with high-tech shape-memory wires." },
            { title: "Periodic Adjustments", description: "Regular visits allow us to fine-tune the movement of your teeth until the perfect alignment is achieved." }
        ],
        faq: [
            { question: "Do ceramic braces stain?", answer: "The ceramic brackets themselves are stain-resistant, but the clear bands around them can stain. These are replaced at every adjustment." }
        ]
    },
    {
        slug: "deep-cleaning-scaling",
        title: "Deep Cleaning",
        category: "Preventative",
        description: "Advanced hygiene treatment to remove plaque and tartar buildup from beneath the gum line, ensuring optimal gum health.",
        heroImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1600",
        process: [
            { title: "Ultrasonic Scaling", description: "Specialized ultrasonic instruments gently remove calculus and plaque from above and below the gum line." },
            { title: "Root Planning", description: "We smooth the root surfaces of your teeth to encourage healthy gum re-attachment and prevent future buildup." },
            { title: "Guided Biofilm Therapy", description: "We use innovative technology to detect and remove biofilm with maximum comfort and efficiency." }
        ],
        faq: [
            { question: "Is deep cleaning painful?", answer: "We use local anesthesia or numbing gels to ensure you are completely comfortable during the procedure." }
        ]
    }
];

export async function generateStaticParams() {
    return treatments.map((t) => ({
        slug: t.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const treatment = treatments.find((t) => t.slug === slug);
    if (!treatment) return {};

    return {
        title: `${treatment.title} | SmileCare`,
        description: treatment.description,
    };
}

export default async function TreatmentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const treatment = treatments.find((t) => t.slug === slug);

    if (!treatment) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white dark:bg-background-dark">
            <TreatmentHero
                title={treatment.title}
                description={treatment.description}
                image={treatment.heroImage}
                category={treatment.category}
            />
            <TreatmentBreadcrumb title={treatment.title} />

            <TreatmentProcess steps={treatment.process} />

            <TreatmentQuality />

            <TreatmentFAQ faqs={treatment.faq} />

            <TreatmentCTA title={treatment.title} />
        </main>
    );
}
