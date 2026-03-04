// NOT "use client" — this is a Server Component (Next.js default)

import Link from "next/link";
import { Search, Home, CalendarDays } from "lucide-react";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-background-light flex items-center
                         justify-center px-4">
            <div className="max-w-lg w-full text-center space-y-10">
                {/* Large 404 */}
                <div className="space-y-2">
                    <p className="font-display text-[120px] font-bold text-primary/10
                                  leading-none select-none">
                        404
                    </p>
                    <div className="mx-auto -mt-8 size-20 rounded-full bg-primary/10
                                    flex items-center justify-center">
                        <Search className="text-primary/40" size={32} />
                    </div>
                </div>

                {/* Heading */}
                <div className="space-y-3">
                    <h1 className="font-display text-3xl font-bold text-primary">
                        Page Not Found
                    </h1>
                    <p className="text-primary/50 text-base leading-relaxed max-w-sm mx-auto">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                {/* Quick links */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-3
                                   bg-primary text-white rounded-xl font-bold
                                   hover:opacity-90 transition-all
                                   shadow-lg shadow-primary/20"
                    >
                        <Home size={16} />
                        Go Home
                    </Link>
                    <Link
                        href="/booking"
                        className="flex items-center justify-center gap-2 px-6 py-3
                                   border-2 border-primary/20 text-primary rounded-xl
                                   font-bold hover:bg-primary/5 transition-all"
                    >
                        <CalendarDays size={16} />
                        Book Appointment
                    </Link>
                </div>

                {/* Breadcrumb hint */}
                <p className="text-xs text-primary/20">
                    SmileCare · Clinical Luxury
                </p>
            </div>
        </main>
    );
}
