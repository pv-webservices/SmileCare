import React from "react";

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  bg?: "light" | "white" | "dark" | "navy" | "slate";
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  className = "",
  id,
  bg = "white",
}) => {
  const bgStyles = {
    white: "bg-white",
    light: "bg-background-light",
    dark: "bg-background-dark text-white",
    navy: "bg-navy-deep text-white",
    slate: "bg-slate-50 dark:bg-slate-900/50",
  };

  return (
    <section id={id} className={`py-12 md:py-24 ${bgStyles[bg]} ${className}`}>
      <div className="container mx-auto px-6 max-w-7xl">
        {children}
      </div>
    </section>
  );
};
