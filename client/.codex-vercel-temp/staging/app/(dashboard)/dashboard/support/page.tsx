"use client";

import { useState } from "react";
import { HelpCircle, Send, Loader2, CheckCircle2, Headphones } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SupportPage() {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSending(true);
        setSuccess(false);
        try {
            const res = await fetch(`${API}/api/support/message`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message.trim() }),
            }).catch(() => null);

            if (res?.ok) {
                setSuccess(true);
                setMessage("");
                setTimeout(() => setSuccess(false), 5000);
            }
        } catch { /* silent */ }
        setSending(false);
    };

    return (
        <>
            <header className="sticky top-0 z-40 bg-background-light/80 backdrop-blur-md border-b border-primary/5 px-4 sm:px-8 py-6">
                <h2 className="font-display text-3xl font-bold text-primary tracking-tight flex items-center gap-3">
                    <HelpCircle size={28} /> Support
                </h2>
                <p className="text-primary/90 mt-1">We&apos;re here to help</p>
            </header>

            <div className="p-4 sm:p-8 max-w-2xl mx-auto space-y-6">
                {/* Info Card */}
                <div className="bg-primary/5 rounded-2xl border border-primary/10 p-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold text-primary mb-2">Get in Touch</h3>
                        <p className="text-sm text-primary/90 leading-relaxed">
                            Our clinical advisors are available Monday–Saturday, 9 AM – 7 PM.
                            Send us a message and we&apos;ll get back to you as soon as possible.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2 text-primary/60">
                                <span className="font-bold text-primary">📞</span> (123) 456-7890
                            </div>
                            <div className="flex items-center gap-2 text-primary/60">
                                <span className="font-bold text-primary">✉️</span> support@smilecare.com
                            </div>
                        </div>
                    </div>
                    <Headphones size={100} className="absolute -bottom-4 -right-4 text-primary/5 -rotate-12" />
                </div>

                {/* Success */}
                {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
                        <CheckCircle2 size={20} />
                        <span className="text-sm font-bold">Message sent! We&apos;ll get back to you shortly.</span>
                    </div>
                )}

                {/* Message Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-primary/5 p-4 sm:p-8 space-y-4">
                    <h3 className="text-lg font-bold text-primary">Send a Message</h3>

                    <div>
                        <label className="block text-xs font-bold text-primary/90 uppercase tracking-wider mb-2">Your Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            className="w-full px-4 py-3 rounded-xl border border-primary/10 bg-background-light text-primary font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                            placeholder="Describe your question, concern, or feedback..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={sending || !message.trim()}
                        className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 w-full sm:w-auto"
                    >
                        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {sending ? "Sending..." : "Send Message"}
                    </button>
                </form>

                {/* FAQ Section */}
                <div className="bg-white rounded-2xl border border-primary/5 p-4 sm:p-8 space-y-4">
                    <h3 className="text-lg font-bold text-primary">Frequently Asked Questions</h3>
                    <div className="space-y-3">
                        {[
                            { q: "How do I cancel or reschedule?", a: "Go to Appointments → click Cancel or Reschedule on any upcoming visit." },
                            { q: "Where can I find my invoices?", a: "Visit the Documents section to download billing statements and invoices." },
                            { q: "How do I earn loyalty points?", a: "You earn points with every completed treatment. Premium members earn 2× points." },
                        ].map((faq) => (
                            <details key={faq.q} className="group">
                                <summary className="cursor-pointer list-none flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 transition-colors">
                                    <span className="text-sm font-bold text-primary">{faq.q}</span>
                                    <span className="text-primary/30 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="px-3 pb-3 text-sm text-primary/90">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
