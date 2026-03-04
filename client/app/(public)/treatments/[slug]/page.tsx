import { notFound } from "next/navigation";
import { getTreatmentBySlug, getAllTreatmentSlugs } from "@/lib/treatments-data";
import TreatmentBreadcrumb from "@/components/treatment-detail/TreatmentBreadcrumb";
import TreatmentHero from "@/components/treatment-detail/TreatmentHero";
import TreatmentProcess from "@/components/treatment-detail/TreatmentProcess";
import TreatmentQuality from "@/components/treatment-detail/TreatmentQuality";
import TreatmentFAQ from "@/components/treatment-detail/TreatmentFAQ";
import TreatmentCTA from "@/components/treatment-detail/TreatmentCTA";
import RelatedTreatments from "@/components/treatment-detail/RelatedTreatments";

export const dynamicParams = false;

export async function generateStaticParams() {
    return getAllTreatmentSlugs().map(({ slug }) => ({ slug }));
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

    return (
        <main>
            <TreatmentBreadcrumb title={treatment.title} />
            <TreatmentHero
                title={treatment.title}
                description={treatment.description}
                image={treatment.heroImage}
                category={treatment.category}
                duration={treatment.duration}
                startingPrice={treatment.startingPrice}
                slug={treatment.slug}
            />
            <TreatmentProcess steps={treatment.process} />
            <TreatmentQuality
                title={treatment.qualityTitle}
                body={treatment.qualityBody}
                badge={treatment.qualityBadge}
                badgeSub={treatment.qualityBadgeSub}
                features={treatment.qualityFeatures}
            />
            <TreatmentFAQ faqs={treatment.faq} />
            <RelatedTreatments treatments={treatment.relatedSlugs
                .map((s: string) => getAllTreatmentSlugs().find((t) => t.slug === s))
                .filter(Boolean) as any} />
            <TreatmentCTA title={treatment.title} />
        </main>
    );
}
