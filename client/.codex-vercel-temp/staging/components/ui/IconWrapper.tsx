import React from "react";

interface IconWrapperProps {
    children: React.ReactNode;
    variant?: "primary" | "gold" | "white" | "none";
    size?: "sm" | "md" | "lg";
    className?: string;
}

export const IconWrapper: React.FC<IconWrapperProps> = ({
    children,
    variant = "primary",
    size = "md",
    className = "",
}) => {
    const variants = {
        primary: "bg-primary/10 text-primary",
        gold: "bg-accent-gold/10 text-accent-gold",
        white: "bg-white/10 text-white",
        none: "",
    };

    const sizes = {
        sm: "p-1.5",
        md: "p-2.5",
        lg: "p-4",
    };

    return (
        <div className={`inline-flex items-center justify-center rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </div>
    );
};
