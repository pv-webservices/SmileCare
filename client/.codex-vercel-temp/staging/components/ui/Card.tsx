import React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: "none" | "sm" | "md" | "lg";
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = "",
    padding = "md",
    hover = false,
}) => {
    const paddings = {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-4 sm:p-8",
    };

    const hoverEffect = hover ? "hover:shadow-lg transition-shadow duration-300 cursor-pointer" : "";

    return (
        <div
            className={`bg-white dark:bg-navy-deep border border-gray-100 dark:border-gray-800 rounded-lg shadow-sm ${paddings[padding]} ${hoverEffect} ${className}`}
        >
            {children}
        </div>
    );
};
