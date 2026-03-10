import React from "react";

interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
    error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, options, error, className = "", ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label className="block text-sm font-medium text-navy-deep dark:text-pearl">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    className={`
            flex h-10 w-full rounded-default border border-gray-200 bg-white px-3 py-2 text-sm 
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
            disabled:cursor-not-allowed disabled:opacity-50
            dark:border-gray-800 dark:bg-navy-deep dark:text-pearl
            ${error ? "border-red-500 focus:ring-red-500" : ""}
            ${className}
          `}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);

Select.displayName = "Select";
