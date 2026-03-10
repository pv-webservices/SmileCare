import React from "react";

interface LuxuryDividerProps {
    className?: string;
    variant?: "gold" | "navy" | "soft";
    withIcon?: boolean;
}

export const LuxuryDivider: React.FC<LuxuryDividerProps> = ({
    className = "",
    variant = "gold",
    withIcon = true,
}) => {
    const lineColors = {
        gold: "bg-accent-gold/40",
        navy: "bg-navy-deep/20",
        soft: "bg-gray-100",
    };

    const iconColors = {
        gold: "text-accent-gold",
        navy: "text-navy-deep",
        soft: "text-gray-300",
    };

    return (
        <div className={`flex items-center justify-center w-full my-8 ${className}`}>
            <div className={`h-[1px] flex-1 ${lineColors[variant]}`} />

            {withIcon && (
                <div className={`mx-4 ${iconColors[variant]}`}>
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="transform rotate-45"
                    >
                        <rect x="8" y="8" width="8" height="8" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </div>
            )}

            <div className={`h-[1px] flex-1 ${lineColors[variant]}`} />
        </div>
    );
};
