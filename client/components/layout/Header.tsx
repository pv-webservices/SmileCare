"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const Header = () => {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Treatments", href: "/treatments" },
        { name: "Smile Gallery", href: "/#gallery" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20 relative">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center z-10">
                        <Link href="/" className="text-2xl font-display font-bold text-primary">
                            SmileCare<span className="text-accent-gold">.</span>
                        </Link>
                    </div>

                    {/* Perfectly Centered Desktop Nav Links */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-navy-deep hover:text-primary font-medium transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center z-10">
                        <Link
                            href="/booking"
                            className="bg-primary text-white border-2 border-primary px-5 py-2 rounded-full font-semibold hover:bg-navy-deep hover:border-navy-deep transition-all shadow-md active:scale-95 whitespace-nowrap"
                        >
                            Book Appointment
                        </Link>
                    </div>

                    {/* Mobile: Book Appointment button + Hamburger */}
                    <div className="md:hidden flex items-center gap-2">
                        <Link
                            href="/booking"
                            className="
                                bg-primary text-white px-3 py-2 rounded-full text-xs font-bold shadow-md
                                transition-all whitespace-nowrap
                                hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg
                                active:scale-95 active:opacity-90
                            "
                        >
                            Appointment
                        </Link>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-navy-deep p-2"
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="px-4 pt-2 pb-6 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="block px-3 py-2 text-navy-deep hover:text-primary font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
