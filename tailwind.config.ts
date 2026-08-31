import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Near-black institutional ink. Used for headings and dark surfaces.
        primary: {
          DEFAULT: "#14171A",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#2B3138",
          foreground: "#FFFFFF",
        },
        // The single action colour: everything clickable and committal is this blue.
        accent: {
          DEFAULT: "#0E6AED",
          foreground: "#FFFFFF",
          hover: "#0F5DCC",
          active: "#0B4CA8",
          tint: "#E8F1FE",
          border: "#BAD6FB",
        },
        muted: {
          DEFAULT: "#FAFAFA",
          foreground: "#61646B",
        },
        subtle: "#8C8F96",
        destructive: {
          DEFAULT: "#CF1322",
          foreground: "#FFFFFF",
          tint: "#FFF1F0",
        },
        success: {
          DEFAULT: "#389E0D",
          foreground: "#FFFFFF",
          tint: "#F6FFED",
        },
        warning: {
          DEFAULT: "#D48806",
          foreground: "#FFFFFF",
          tint: "#FFFBE6",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#14171A",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#14171A",
        },
      },
      fontFamily: {
        sans: ["var(--font-open-sans)", "Open Sans", "Segoe UI", "Arial", "sans-serif"],
      },
      fontSize: {
        display: ["3rem", { lineHeight: "1.21", fontWeight: "700" }],
        "display-sm": ["2.25rem", { lineHeight: "1.25", fontWeight: "700" }],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)",
        lift: "0 6px 16px rgba(0, 0, 0, 0.08), 0 3px 6px rgba(0, 0, 0, 0.04)",
        control: "0 1px 2px rgba(0, 0, 0, 0.05)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
