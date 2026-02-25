import TreatmentsBreadcrumb from "@/components/treatments/TreatmentsBreadcrumb";
import TreatmentsHero from "@/components/treatments/TreatmentsHero";
import TreatmentsGrid from "@/components/treatments/TreatmentsGrid";
import TreatmentsNewsletter from "@/components/treatments/TreatmentsNewsletter";

export const metadata = {
    title: "Advanced Dental Treatments | SmileCare",
    description:
        "Explore premium cosmetic, restorative and orthodontic dental treatments at SmileCare.",
};

export default function TreatmentsPage() {
    return (
        <div className="max-w-7xl mx-auto w-full px-6 md:px-10 py-20">
            <TreatmentsBreadcrumb />
            <TreatmentsHero />
            <TreatmentsGrid />
            <TreatmentsNewsletter />
        </div>
    );
}
