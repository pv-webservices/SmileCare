import React from "react";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "gold" | "success" | "danger" | "ghost" | "white";
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = "primary",
    className = "",
}) => {
    const variants = {
        primary: "bg-primary/10 text-primary border-primary/20",
        secondary: "bg-navy-deep text-white border-navy-deep",
        gold: "bg-accent-gold/10 text-accent-gold border-accent-gold/20",
        success: "bg-green-100 text-green-800 border-green-200",
        danger: "bg-red-100 text-red-800 border-red-200",
        ghost: "bg-gray-100 text-gray-800 border-gray-200",
        white: "bg-white text-navy-deep border-slate-200",
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    );
};
