import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F8F3EA",
        warmwhite: "#FFFDF8",
        charcoal: "#25221E",
        brown: "#8B6F56",
        sage: "#9CAF88",
        gold: "#D8B56D",
        beige: "#E8DED0",
        muted: "#8A8175",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(37, 34, 30, 0.04), 0 6px 20px rgba(37, 34, 30, 0.06)",
        soft: "0 1px 3px rgba(37, 34, 30, 0.06)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
