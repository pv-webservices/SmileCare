import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "gold";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    size = "md",
    isLoading,
    className = "",
    disabled,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-default";

    const variants = {
        primary: "bg-primary text-white hover:bg-navy-deep focus:ring-primary",
        secondary: "bg-navy-deep text-white hover:bg-primary focus:ring-navy-deep",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary",
        ghost: "text-primary hover:bg-background-light focus:ring-background-light",
        gold: "bg-accent-gold text-navy-deep hover:bg-[#b58f4a] focus:ring-accent-gold",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-base",
        lg: "px-4 sm:px-8 py-3.5 text-lg",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : null}
            {children}
        </button>
    );
};
