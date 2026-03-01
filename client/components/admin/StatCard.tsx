import React from "react";

interface StatCardProps {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ReactNode;
    color?: "primary" | "green" | "amber" | "red" | "gold";
}

export default function StatCard({ label, value, sub, icon, color = "primary" }: StatCardProps) {
    const colorMap = {
        primary: "bg-primary/10 text-primary",
        green: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
        red: "bg-red-50 text-red-500",
        gold: "bg-accent-gold/10 text-accent-gold",
    };

    const iconBg = colorMap[color];

    return (
        <div className="bg-pearl border border-primary/10 rounded-2xl p-6 flex items-start gap-4">
            <div className={`size-12 rounded-xl flex items-center justify-center ${iconBg}`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-display font-bold text-primary">{value}</p>
                <p className="text-sm font-semibold text-primary/60 mt-0.5">{label}</p>
                {sub && <p className="text-xs text-primary/30 mt-1">{sub}</p>}
            </div>
        </div>
    );
}
