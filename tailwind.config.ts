import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary-hover)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          hover: "var(--secondary-hover)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--primary)",
        teach: {
          DEFAULT: "#6C4DF6",
          dark: "#8B74FF",
          light: "#F0ECFF",
          border: "#D6CDFE",
        },
        learn: {
          DEFAULT: "#14B8A6",
          dark: "#2DD4BF",
          light: "#E6FBF8",
          border: "#99F6E4",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-plus-jakarta)", "sans-serif"],
      },
      backgroundImage: {
        "swap-gradient": "linear-gradient(135deg, #6C4DF6 0%, #14B8A6 100%)",
        "swap-gradient-hover": "linear-gradient(135deg, #5B3CE3 0%, #0D9488 100%)",
        "teach-gradient": "linear-gradient(135deg, #6C4DF6 0%, #8B74FF 100%)",
        "learn-gradient": "linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)",
        "card-gradient": "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(108, 77, 246, 0.08)",
        card: "0 10px 30px -5px rgba(30, 27, 58, 0.05), 0 4px 6px -2px rgba(30, 27, 58, 0.02)",
        "card-hover": "0 20px 40px -10px rgba(108, 77, 246, 0.15)",
        glow: "0 0 35px -5px rgba(108, 77, 246, 0.35)",
        "glow-teal": "0 0 35px -5px rgba(20, 184, 166, 0.35)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
