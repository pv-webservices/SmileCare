import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface TreatmentBreadcrumbProps {
    title: string;
}

const TreatmentBreadcrumb = ({ title }: TreatmentBreadcrumbProps) => {
    return (
        <nav className="bg-slate-50 border-b border-slate-200 py-4">
            <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 text-sm font-medium flex-wrap">
                <Link
                    href="/"
                    className="text-primary hover:underline transition-all"
                >
                    Home
                </Link>
                <ChevronRight size={14} className="text-slate-400 shrink-0" />
                <Link
                    href="/treatments"
                    className="text-primary hover:underline transition-all"
                >
                    Treatments
                </Link>
                <ChevronRight size={14} className="text-slate-400 shrink-0" />
                <span className="text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                    {title}
                </span>
            </div>
        </nav>
    );
};

export default TreatmentBreadcrumb;
