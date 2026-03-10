import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background-light flex flex-col">
            <Header />
            <div className="flex-grow pt-20">
                {children}
            </div>
            <Footer />
        </div>
    );
}
