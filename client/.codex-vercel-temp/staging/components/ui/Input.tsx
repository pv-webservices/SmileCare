import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = "", ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label className="block text-sm font-medium text-navy-deep dark:text-pearl">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
            flex h-10 w-full rounded-default border border-gray-200 bg-white px-3 py-2 text-sm 
            file:border-0 file:bg-transparent file:text-sm file:font-medium 
            placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
            disabled:cursor-not-allowed disabled:opacity-50
            dark:border-gray-800 dark:bg-navy-deep dark:text-pearl
            ${error ? "border-red-500 focus:ring-red-500" : ""}
            ${className}
          `}
                    {...props}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";
