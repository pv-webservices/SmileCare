import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "var(--primary)",
                "accent-gold": "var(--accent-gold)",
                "background-light": "var(--background-light)",
                "background-dark": "var(--background-dark)",
                pearl: "var(--pearl)",
                "navy-deep": "var(--navy-deep)",
            },
            fontFamily: {
                display: ["var(--font-noto-serif)"],
                body: ["var(--font-noto-sans)"],
            },
        },
    },
    plugins: [
        require("@tailwindcss/typography"),
    ],
};

export default config;