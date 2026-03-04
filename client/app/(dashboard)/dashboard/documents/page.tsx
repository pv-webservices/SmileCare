"use client";

import { useState, useEffect } from "react";
import { FileText, CreditCard, ImageIcon, FileDown, FolderOpen, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const mockDocs = [
    { id: "1", name: "Post-Op Guide.pdf", type: "Care Instructions", size: "1.2 MB", url: "#" },
    { id: "2", name: "Annual_Invoice_2023.pdf", type: "Billing Statement", size: "840 KB", url: "#" },
    { id: "3", name: "X-Ray_Results_Sep.zip", type: "Imaging Data", size: "15.4 MB", url: "#" },
    { id: "4", name: "Treatment_Plan_2024.pdf", type: "Care Instructions", size: "2.1 MB", url: "#" },
    { id: "5", name: "Insurance_Claim.pdf", type: "Billing Statement", size: "560 KB", url: "#" },
];

const iconMap: Record<string, typeof FileText> = {
    "Care Instructions": FileText,
    "Billing Statement": CreditCard,
    "Imaging Data": ImageIcon,
};

export default function DocumentsPage() {
    const [docs, setDocs] = useState<any[]>(mockDocs);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${API}/api/patient/documents`, { credentials: "include" }).catch(() => null);
                if (res?.ok) setDocs(await res.json());
            } catch { /* mock fallback */ }
            setLoading(false);
        };
        load();
    }, []);

    return (
        <>
            <header className="sticky top-0 z-40 bg-background-light/80 backdrop-blur-md border-b border-primary/5 px-4 sm:px-8 py-6">
                <h2 className="font-display text-3xl font-bold text-primary tracking-tight flex items-center gap-3">
                    <FolderOpen size={28} /> Clinical Documents
                </h2>
                <p className="text-primary/90 mt-1">{docs.length} files available</p>
            </header>

            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <Loader2 size={32} className="animate-spin text-primary" />
                </div>
            ) : (
                <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-3">
                    {docs.map((doc) => {
                        const Icon = iconMap[doc.type] || FileText;
                        return (
                            <div key={doc.id} className="bg-white p-5 rounded-2xl border border-primary/5 flex items-center gap-4 group hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer">
                                <div className="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Icon size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-primary truncate">{doc.name}</p>
                                    <p className="text-xs text-primary/90 mt-0.5">{doc.type} • {doc.size}</p>
                                </div>
                                <button className="flex items-center gap-2 text-primary/30 group-hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/5">
                                    <FileDown size={20} />
                                    <span className="text-xs font-bold hidden sm:inline">Download</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
