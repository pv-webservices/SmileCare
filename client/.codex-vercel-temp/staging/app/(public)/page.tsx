import HeroSection from "@/components/home/HeroSection";
import TrustedByCompanies from "@/components/home/TrustedByCompanies";
import BookingBar from "@/components/home/BookingBar";
import TechSection from "@/components/home/TechSection";
import FeaturedTreatments from "@/components/home/FeaturedTreatments";
import WhyTrustUs from "@/components/home/WhyTrustUs";
import BeforeAfterSlider from "@/components/home/BeforeAfterSlider";
import SmileGallery from "@/components/home/SmileGallery";
import VideoTestimonials from "@/components/home/VideoTestimonials";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import DoctorsSection from "@/components/home/DoctorsSection";
import FaqSection from "@/components/home/FaqSection";
import BlogPreviewSection from "@/components/home/BlogPreviewSection";
import NewsletterSection from "@/components/home/NewsletterSection";

export const metadata = {
    title: "SmileCare | Excellence in Modern Dentistry",
    description: "Experience world-class dental care with state-of-the-art technology and a team dedicated to your comfort and smile.",
};

export default function HomePage() {
    return (
        <div className="flex flex-col w-full overflow-x-hidden">
            <HeroSection />
            <TrustedByCompanies />
            <BookingBar />
            <TechSection />
            <FeaturedTreatments />
            <WhyTrustUs />
            <BeforeAfterSlider />
            <SmileGallery />
            <VideoTestimonials />
            <TestimonialsSection />
            <DoctorsSection />
            <FaqSection />
            <BlogPreviewSection />
            <NewsletterSection />
        </div>
    );
}
