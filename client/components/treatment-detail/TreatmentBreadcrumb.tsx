import Link from "next/link";

interface TreatmentBreadcrumbProps {
    title: string;
}

const TreatmentBreadcrumb = ({ title }: TreatmentBreadcrumbProps) => {
    return (
        <nav className="bg-slate-100 dark:bg-slate-900 py-4">
            <div className="max-w-7xl mx-auto px-6 flex items-center gap-3 text-sm font-medium">
                <Link href="/" className="text-primary hover:underline transition-all">
                    Home
                </Link>
                <span className="text-slate-400 text-xs">▶</span>
                <Link href="/treatments" className="text-primary hover:underline transition-all">
                    Treatments
                </Link>
                <span className="text-slate-400 text-xs">▶</span>
                <span className="text-slate-500 truncate">{title}</span>
            </div>
        </nav>
    );
};

export default TreatmentBreadcrumb;
