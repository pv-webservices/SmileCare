import Link from "next/link";

const TreatmentsBreadcrumb = () => {
    return (
        <nav className="flex items-center gap-2 mb-8 text-sm">
            <Link
                href="/"
                className="text-primary/70 hover:text-primary font-medium transition-colors"
            >
                Home
            </Link>
            <span className="text-primary/40" aria-hidden="true">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </span>
            <span className="text-primary font-semibold">Treatments</span>
        </nav>
    );
};

export default TreatmentsBreadcrumb;
