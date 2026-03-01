export interface ProcessStep {
    title: string;
    description: string;
}

export interface FAQItem {
    question: string;
    answer: string;
}

export interface TreatmentDetail {
    id: number;
    slug: string;
    title: string;
    category: "Cosmetic" | "Orthodontics" | "Restorative" | "Preventative";
    description: string;
    image: string;          // card thumbnail
    heroImage: string;      // full-width hero
    duration: string;       // e.g. "60–90 min"
    startingPrice: number;  // in INR paise divided by 100
    warranty: string;       // e.g. "10-year clinical warranty"
    process: ProcessStep[];
    faq: FAQItem[];
    qualityTitle: string;
    qualityBody: string;
    qualityBadge: string;   // small badge text e.g. "Swiss Zirconia"
    qualityBadgeSub: string;
    qualityFeatures: { title: string }[];
    relatedSlugs: string[]; // up to 3 slugs of related treatments
}

export const TREATMENTS: TreatmentDetail[] = [
    {
        id: 1,
        slug: "porcelain-veneers",
        title: "Porcelain Veneers",
        category: "Cosmetic",
        description: "Achieve a flawless, natural-looking smile with our bespoke ceramic restorations crafted for longevity and brilliance.",
        image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&q=80&w=800",
        heroImage: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&q=80&w=1600",
        duration: "2 × 90 min",
        startingPrice: 25000,
        warranty: "10-year clinical warranty",
        process: [
            { title: "Digital Planning", description: "Using advanced 3D scanning, we map your unique facial features to design a smile that complements your natural beauty perfectly." },
            { title: "Minimal Preparation", description: "Ultra-conservative techniques ensure maximum tooth preservation. We use Swiss micro-instruments for unparalleled precision." },
            { title: "Final Bonding", description: "Each veneer is individually hand-finished and bonded with medical-grade resins for a permanent, lifelike transformation." },
        ],
        faq: [
            { question: "How long do porcelain veneers last?", answer: "With proper oral hygiene and regular professional cleanings, high-quality porcelain veneers typically last between 10 to 15 years, and often even longer." },
            { question: "Is the procedure painful?", answer: "The process is generally minimally invasive. We use local anesthesia to ensure complete comfort during the preparation stage. Post-operative sensitivity is minimal and temporary." },
            { question: "Are veneers stain-resistant?", answer: "Yes, high-grade porcelain is highly resistant to stains from coffee, tea, and tobacco, maintaining their brilliance much better than natural tooth enamel." },
        ],
        qualityTitle: "Uncompromising Ceramic Quality",
        qualityBody: "We partner exclusively with the world's leading dental laboratories to ensure every veneer meets clinical luxury standards. Our commitment to precision is obsessive.",
        qualityBadge: "Swiss Zirconia",
        qualityBadgeSub: "Elite Grade Laboratory",
        qualityFeatures: [
            { title: "Ivoclar E.max Press Ceramics" },
            { title: "0.3mm Ultra-Thin Preparation" },
            { title: "10-Year Clinical Warranty" },
        ],
        relatedSlugs: ["laser-teeth-whitening", "dental-crowns-bridges", "complete-oral-health-check"],
    },
    {
        id: 2,
        slug: "invisalign-clear-aligners",
        title: "Invisalign Aligners",
        category: "Orthodontics",
        description: "Straighten your teeth discreetly with clear, removable aligners designed for maximum comfort and efficient results.",
        image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800",
        heroImage: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=1600",
        duration: "6–18 months",
        startingPrice: 85000,
        warranty: "Retainers included",
        process: [
            { title: "Consultation & Scan", description: "We use iTero 3D scanning to capture a precise digital map of your teeth, allowing us to plan every movement with precision." },
            { title: "Custom Aligner Series", description: "A series of bespoke clear aligners are manufactured using SmartTrack material to move your teeth gradually into the ideal position." },
            { title: "The Revelation", description: "Once the series is complete, you will reveal a perfectly aligned smile. We provide custom retainers to maintain your new look." },
        ],
        faq: [
            { question: "How many hours a day should I wear them?", answer: "For optimal results, aligners should be worn for 20 to 22 hours per day, removing them only for eating, drinking, and cleaning." },
            { question: "How long does treatment usually take?", answer: "Treatment time varies depending on complexity, but most patients achieve their goal in 6 to 18 months." },
            { question: "Are aligners noticeable?", answer: "Invisalign aligners are virtually invisible. Most people will not notice you are wearing them during normal conversation." },
        ],
        qualityTitle: "Precision Orthodontic Technology",
        qualityBody: "Invisalign's proprietary SmartTrack material applies precisely the right amount of force at the right time, backed by decades of clinical research and over 12 million patients treated worldwide.",
        qualityBadge: "SmartTrack®",
        qualityBadgeSub: "Invisalign Certified Provider",
        qualityFeatures: [
            { title: "iTero 3D Digital Scanning" },
            { title: "SmartTrack Material" },
            { title: "ClinCheck Software Planning" },
        ],
        relatedSlugs: ["ceramic-braces", "porcelain-veneers", "complete-oral-health-check"],
    },
    {
        id: 3,
        slug: "laser-teeth-whitening",
        title: "Laser Teeth Whitening",
        category: "Cosmetic",
        description: "Brighten your smile by up to 8 shades in a single visit with our professional laser whitening technology.",
        image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800",
        heroImage: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=1600",
        duration: "60–90 min",
        startingPrice: 12000,
        warranty: "Touch-up kit included",
        process: [
            { title: "Preparation", description: "We protect your gums and lips before applying a professional-grade whitening gel to your teeth." },
            { title: "Laser Activation", description: "A specialized blue light activates the gel, accelerating the whitening process and breaking down deep stains." },
            { title: "Post-Treatment Care", description: "We provide a desensitizing treatment and a home care kit to maintain your brilliant new smile." },
        ],
        faq: [
            { question: "How long does the appointment take?", answer: "A typical laser whitening session takes about 60 to 90 minutes." },
            { question: "Is it safe for enamel?", answer: "Yes, professional laser whitening is safe for your enamel when performed by our qualified dental professionals." },
            { question: "How long do results last?", answer: "Results typically last 12–18 months depending on dietary habits. Touch-up treatments can extend them significantly." },
        ],
        qualityTitle: "Clinical-Grade Whitening Power",
        qualityBody: "We use Philips Zoom professional whitening gel with blue LED activation, the same system used in leading dental practices worldwide, for safe and dramatically visible results.",
        qualityBadge: "Philips Zoom",
        qualityBadgeSub: "Professional Grade System",
        qualityFeatures: [
            { title: "Up to 8 Shades Lighter" },
            { title: "ACP Sensitivity Formula" },
            { title: "Take-Home Maintenance Kit" },
        ],
        relatedSlugs: ["porcelain-veneers", "complete-oral-health-check", "deep-cleaning-scaling"],
    },
    {
        id: 4,
        slug: "permanent-dental-implants",
        title: "Dental Implants",
        category: "Restorative",
        description: "The permanent solution for missing teeth. Restore your smile's function and aesthetics with life-like titanium implants.",
        image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=800",
        heroImage: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=1600",
        duration: "Multiple sessions",
        startingPrice: 45000,
        warranty: "Lifetime implant warranty",
        process: [
            { title: "Initial Assessment", description: "Comprehensive 3D scans ensure you have adequate bone density and determine the precise placement for the implant." },
            { title: "Implant Placement", description: "A small titanium post is expertly placed in the jawbone, acting as a direct replacement for the tooth root." },
            { title: "Restoration", description: "Once healed, a custom-crafted porcelain crown is attached, blending seamlessly with your natural teeth." },
        ],
        faq: [
            { question: "How long is the healing process?", answer: "Bone integration usually takes 3 to 6 months before the final crown can be placed." },
            { question: "Are implants permanent?", answer: "With proper care, dental implants can last a lifetime, making them a highly cost-effective solution." },
            { question: "Is the surgery painful?", answer: "The procedure is performed under local anesthesia. Post-operative discomfort is typically mild and managed with standard pain relief." },
        ],
        qualityTitle: "World-Class Implant Systems",
        qualityBody: "We exclusively use Straumann and Nobel Biocare implant systems — the global gold standards in implantology, trusted by leading clinicians in over 100 countries.",
        qualityBadge: "Straumann®",
        qualityBadgeSub: "Global Gold Standard",
        qualityFeatures: [
            { title: "Nobel Biocare & Straumann Systems" },
            { title: "Sub-Millimetre 3D Placement" },
            { title: "Lifetime Implant Warranty" },
        ],
        relatedSlugs: ["dental-crowns-bridges", "complete-oral-health-check", "deep-cleaning-scaling"],
    },
    {
        id: 5,
        slug: "dental-crowns-bridges",
        title: "Crowns & Bridges",
        category: "Restorative",
        description: "Repair damaged or missing teeth with precision-crafted dental porcelain that restores strength and beauty.",
        image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800",
        heroImage: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1600",
        duration: "2 × 60 min",
        startingPrice: 18000,
        warranty: "5-year warranty",
        process: [
            { title: "Tooth Preparation", description: "The affected tooth is gently reshaped to accommodate the crown. Digital impressions are then taken." },
            { title: "Temporary Restoration", description: "A high-quality temporary crown is placed while your permanent restoration is crafted in our partner laboratory." },
            { title: "Final Placement", description: "The custom crown is precisely fitted and bonded, restoring full function and aesthetics to your smile." },
        ],
        faq: [
            { question: "What is the difference between a crown and a bridge?", answer: "A crown covers a single damaged tooth, while a bridge replaces one or more missing teeth by anchoring to adjacent teeth." },
            { question: "How long do crowns last?", answer: "Porcelain-fused-to-zirconia crowns typically last 10–15 years with proper care." },
        ],
        qualityTitle: "Precision-Milled Restorations",
        qualityBody: "Every crown and bridge is milled from a single block of high-strength zirconia using CAD/CAM technology, ensuring a precise fit and natural translucency that mirrors real enamel.",
        qualityBadge: "CAD/CAM Zirconia",
        qualityBadgeSub: "Same-Day Possible",
        qualityFeatures: [
            { title: "Full-Contour Zirconia Blocks" },
            { title: "Digital Bite Registration" },
            { title: "Same-Day CEREC Available" },
        ],
        relatedSlugs: ["permanent-dental-implants", "porcelain-veneers", "complete-oral-health-check"],
    },
    {
        id: 6,
        slug: "complete-oral-health-check",
        title: "Oral Health Check",
        category: "Preventative",
        description: "A comprehensive examination focusing on early detection and prevention to maintain your lifelong dental wellbeing.",
        image: "https://images.unsplash.com/photo-1588776813677-77aaf5595b83?auto=format&fit=crop&q=80&w=800",
        heroImage: "https://images.unsplash.com/photo-1588776813677-77aaf5595b83?auto=format&fit=crop&q=1600&w=1600",
        duration: "45–60 min",
        startingPrice: 2500,
        warranty: "Personalised care plan included",
        process: [
            { title: "Digital Diagnostics", description: "Low-radiation digital X-rays and intra-oral cameras provide a detailed view of your oral health." },
            { title: "Clinical Examination", description: "Our specialists check for signs of decay, gum disease, and conduct a thorough oral cancer screening." },
            { title: "Personalised Plan", description: "We discuss our findings and create a bespoke long-term care plan tailored to your specific needs." },
        ],
        faq: [
            { question: "How often should I have a check-up?", answer: "We generally recommend a comprehensive check-up every 6 months for most patients." },
            { question: "What does the check include?", answer: "The check includes digital X-rays, gum health assessment, oral cancer screening, bite analysis, and a personalised home-care recommendation." },
        ],
        qualityTitle: "Advanced Diagnostic Technology",
        qualityBody: "Our diagnostic suite includes CBCT 3D imaging, digital periapical X-rays, and fluorescence-based cavity detection — enabling us to spot issues years before they become symptomatic.",
        qualityBadge: "CBCT 3D Imaging",
        qualityBadgeSub: "Low-Dose Diagnostic Suite",
        qualityFeatures: [
            { title: "Low-Radiation Digital X-Rays" },
            { title: "Intraoral Camera Examination" },
            { title: "Oral Cancer Screening Included" },
        ],
        relatedSlugs: ["deep-cleaning-scaling", "laser-teeth-whitening", "porcelain-veneers"],
    },
    {
        id: 7,
        slug: "ceramic-braces",
        title: "Ceramic Braces",
        category: "Orthodontics",
        description: "Clear and discreet orthodontic treatment using tooth-colored ceramic brackets for a more aesthetic straightening experience.",
        image: "https://images.unsplash.com/photo-1571772996211-2f02974a235a?auto=format&fit=crop&q=80&w=800",
        heroImage: "https://images.unsplash.com/photo-1571772996211-2f02974a235a?auto=format&fit=crop&q=80&w=1600",
        duration: "12–24 months",
        startingPrice: 55000,
        warranty: "Retainer included",
        process: [
            { title: "Design Phase", description: "We plan your alignment journey using specialized software to ensure the most efficient and aesthetic results." },
            { title: "Bracket Bonding", description: "Discreet ceramic brackets are bonded to your teeth and connected with high-tech shape-memory wires." },
            { title: "Periodic Adjustments", description: "Regular visits allow us to fine-tune the movement of your teeth until the perfect alignment is achieved." },
        ],
        faq: [
            { question: "Do ceramic braces stain?", answer: "The ceramic brackets themselves are stain-resistant, but the clear bands around them can stain. These are replaced at every adjustment." },
            { question: "Are they as effective as metal braces?", answer: "Yes, ceramic braces provide the same corrective force as traditional metal braces while being significantly more discreet." },
        ],
        qualityTitle: "Aesthetic Orthodontic Precision",
        qualityBody: "Our ceramic brackets are crafted from polycrystalline alumina, giving them exceptional stain resistance and a natural translucency that blends with tooth colour throughout treatment.",
        qualityBadge: "Polycrystalline Alumina",
        qualityBadgeSub: "Stain-Resistant Ceramic",
        qualityFeatures: [
            { title: "Tooth-Coloured Ceramic Brackets" },
            { title: "Shape-Memory NiTi Wires" },
            { title: "Digital Treatment Planning" },
        ],
        relatedSlugs: ["invisalign-clear-aligners", "complete-oral-health-check", "porcelain-veneers"],
    },
    {
        id: 8,
        slug: "deep-cleaning-scaling",
        title: "Deep Cleaning",
        category: "Preventative",
        description: "Advanced hygiene treatment to remove plaque and tartar buildup from beneath the gum line, ensuring optimal gum health.",
        image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
        heroImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1600",
        duration: "60–90 min",
        startingPrice: 6000,
        warranty: "3-month follow-up included",
        process: [
            { title: "Ultrasonic Scaling", description: "Specialized ultrasonic instruments gently remove calculus and plaque from above and below the gum line." },
            { title: "Root Planning", description: "We smooth the root surfaces of your teeth to encourage healthy gum re-attachment and prevent future buildup." },
            { title: "Guided Biofilm Therapy", description: "We use innovative technology to detect and remove biofilm with maximum comfort and efficiency." },
        ],
        faq: [
            { question: "Is deep cleaning painful?", answer: "We use local anesthesia or numbing gels to ensure you are completely comfortable during the procedure." },
            { question: "How is it different from a regular clean?", answer: "A regular clean addresses the visible tooth surface and gumline. Deep cleaning (scaling & root planing) goes below the gumline to treat gum disease." },
        ],
        qualityTitle: "Evidence-Based Periodontal Care",
        qualityBody: "We use EMS AIRFLOW Guided Biofilm Therapy, the gold standard in modern hygiene treatment, which is gentler on gum tissue and more effective at eliminating biofilm than traditional scaling alone.",
        qualityBadge: "EMS AIRFLOW®",
        qualityBadgeSub: "Guided Biofilm Therapy",
        qualityFeatures: [
            { title: "EMS AIRFLOW Biofilm Removal" },
            { title: "Piezo Ultrasonic Scaling" },
            { title: "Periodontal Health Reassessment" },
        ],
        relatedSlugs: ["complete-oral-health-check", "laser-teeth-whitening", "permanent-dental-implants"],
    },
];

/** Fast slug lookup */
export function getTreatmentBySlug(slug: string): TreatmentDetail | undefined {
    return TREATMENTS.find((t) => t.slug === slug);
}

/** All slugs for generateStaticParams */
export function getAllTreatmentSlugs(): { slug: string }[] {
    return TREATMENTS.map((t) => ({ slug: t.slug }));
}
