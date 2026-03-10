import React from "react";

interface AdminPageHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export default function AdminPageHeader({ title, subtitle, action }: AdminPageHeaderProps) {
    return (
        <div className="flex items-start justify-between mb-8">
            <div>
                <h1 className="font-display text-3xl font-bold text-primary">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-primary/50 mt-1 text-sm">{subtitle}</p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}
