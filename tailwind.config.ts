import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(0 0% 100%)",
        foreground: "hsl(210 8% 12%)",
        card: {
          DEFAULT: "hsl(210 15% 97%)",
          foreground: "hsl(210 8% 12%)",
        },
        popover: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(210 8% 12%)",
        },
        primary: {
          DEFAULT: "hsl(210 8% 12%)",
          foreground: "hsl(0 0% 100%)",
        },
        secondary: {
          DEFAULT: "hsl(210 8% 43%)",
          foreground: "hsl(0 0% 100%)",
        },
        muted: {
          DEFAULT: "hsl(210 10% 97%)",
          foreground: "hsl(210 8% 12%)",
        },
        accent: {
          DEFAULT: "hsl(270 80% 60%)",
          foreground: "hsl(0 0% 100%)",
        },
        destructive: {
          DEFAULT: "hsl(4 85% 63%)",
          foreground: "hsl(0 0% 100%)",
        },
        border: "hsl(210 15% 91%)",
        input: "hsl(210 15% 97%)",
        ring: "rgba(139, 92, 246, 0.5)",
        chart: {
          1: "hsl(240 60% 64%)",
          2: "hsl(242 60% 58%)",
          3: "hsl(248 60% 55%)",
          4: "hsl(250 60% 52%)",
          5: "hsl(252 60% 50%)",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      keyframes: {
        slideInFromTop: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInScale: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "slide-in-top": "slideInFromTop 0.4s ease-out",
        "fade-in-scale": "fadeInScale 0.3s ease-out",
        "pulse-subtle": "pulseSubtle 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
