import Link from "next/link";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { label: "Home", href: "/" },
        { label: "Treatments", href: "/treatments" },
        { label: "About Us", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "/contact" },
    ];

    const treatmentLinks = [
        { label: "Invisalign", href: "/treatments#invisalign" },
        { label: "Dental Implants", href: "/treatments#implants" },
        { label: "Teeth Whitening", href: "/treatments#whitening" },
        { label: "Root Canal", href: "/treatments#root-canal" },
        { label: "Cosmetic Dentistry", href: "/treatments#cosmetic" },
    ];

    return (
        <footer className="bg-navy-deep text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 sm:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="text-2xl font-display font-bold text-white">
                            SmileCare<span className="text-accent-gold">.</span>
                        </Link>
                        <p className="text-gray-400 leading-relaxed">
                            Providing world-class dental care with the latest technology and a gentle touch. Your smile is our priority.
                        </p>
                        <div className="flex space-x-4">
                            {/* Social Icons Placeholder */}
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent-gold transition-colors cursor-pointer">
                                    <div className="w-5 h-5 bg-white/20 rounded-sm" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-accent-gold">Quick Links</h4>
                        <ul className="space-y-4">
                            {quickLinks.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Treatments */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-accent-gold">Treatments</h4>
                        <ul className="space-y-4">
                            {treatmentLinks.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 text-accent-gold">Contact Us</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex items-start">
                                <span className="mr-3 text-accent-gold mt-1">📍</span>
                                123 Dental Plaza, Healthcare City, NY 10001
                            </li>
                            <li className="flex items-center">
                                <span className="mr-3 text-accent-gold">📞</span>
                                (123) 456-7890
                            </li>
                            <li className="flex items-center">
                                <span className="mr-3 text-accent-gold">✉️</span>
                                contact@smilecare.com
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>© {currentYear} SmileCare Dental Clinic. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
