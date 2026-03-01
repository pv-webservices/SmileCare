import { notFound } from "next/navigation";
import { getTreatmentBySlug, getAllTreatmentSlugs, TREATMENTS } from "@/lib/treatments-data";
import TreatmentBreadcrumb from "@/components/treatment-detail/TreatmentBreadcrumb";
import TreatmentHero from "@/components/treatment-detail/TreatmentHero";
import TreatmentProcess from "@/components/treatment-detail/TreatmentProcess";
import TreatmentQuality from "@/components/treatment-detail/TreatmentQuality";
import TreatmentFAQ from "@/components/treatment-detail/TreatmentFAQ";
import TreatmentCTA from "@/components/treatment-detail/TreatmentCTA";
import RelatedTreatments from "@/components/treatment-detail/RelatedTreatments";

export async function generateStaticParams() {
    return getAllTreatmentSlugs();
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const treatment = getTreatmentBySlug(slug);
    if (!treatment) return {};
    return {
        title: `${treatment.title} | SmileCare`,
        description: treatment.description,
        openGraph: {
            title: `${treatment.title} | SmileCare`,
            description: treatment.description,
            images: [{ url: treatment.heroImage }],
        },
    };
}

export default async function TreatmentDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const treatment = getTreatmentBySlug(slug);

    if (!treatment) notFound();

    // Resolve related treatments
    const related = treatment.relatedSlugs
        .map((s) => TREATMENTS.find((t) => t.slug === s))
        .filter(Boolean) as typeof TREATMENTS;

    return (
        <main className="min-h-screen bg-white">
            <TreatmentHero
                title={treatment.title}
                description={treatment.description}
                image={treatment.heroImage}
                category={treatment.category}
                duration={treatment.duration}
                startingPrice={treatment.startingPrice}
                slug={treatment.slug}
            />
            <TreatmentBreadcrumb title={treatment.title} />
            <TreatmentProcess steps={treatment.process} />
            <TreatmentQuality
                title={treatment.qualityTitle}
                body={treatment.qualityBody}
                badge={treatment.qualityBadge}
                badgeSub={treatment.qualityBadgeSub}
                features={treatment.qualityFeatures}
            />
            <TreatmentFAQ faqs={treatment.faq} />
            <RelatedTreatments treatments={related} />
            <TreatmentCTA title={treatment.title} />
        </main>
    );
}
