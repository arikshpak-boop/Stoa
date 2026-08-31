import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        /** Warm near-black ink. Softer than slate, and the reason the page reads calm. */
        primary: {
          DEFAULT: "#343332",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#4A4846",
          foreground: "#FFFFFF",
        },
        /** Royal blue: the one committal colour. */
        accent: {
          DEFAULT: "#0E6AED",
          foreground: "#FFFFFF",
          hover: "#0F5DCC",
          active: "#0B4CA8",
          tint: "#E8F1FE",
          border: "#BAD6FB",
        },
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#686764",
        },
        subtle: "#9B9A97",
        /** Full-bleed section washes, all pulled off the royal-blue scale. */
        band: {
          mist: "#F6F8FC",
          tint: "#E8F1FE",
          sky: "#D7EAFF",
          deep: "#BBDCFF",
        },
        destructive: { DEFAULT: "#CF1322", foreground: "#FFFFFF", tint: "#FFF1F0" },
        success: { DEFAULT: "#389E0D", foreground: "#FFFFFF", tint: "#F2FBEC" },
        warning: { DEFAULT: "#B7791F", foreground: "#FFFFFF", tint: "#FFF8E6" },
        card: { DEFAULT: "#FFFFFF", foreground: "#343332" },
        popover: { DEFAULT: "#FFFFFF", foreground: "#343332" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["var(--font-display)", "Bricolage Grotesque", "Georgia", "serif"],
      },
      fontSize: {
        // Display sizes run large and light — weight 500, never bold.
        "display-xl": ["5rem", { lineHeight: "1.125", fontWeight: "500", letterSpacing: "-0.02em" }],
        "display-lg": ["3.5rem", { lineHeight: "1.14", fontWeight: "500", letterSpacing: "-0.02em" }],
        "display-md": ["2.5rem", { lineHeight: "1.2", fontWeight: "500", letterSpacing: "-0.015em" }],
        "display-sm": ["2rem", { lineHeight: "1.2", fontWeight: "500", letterSpacing: "-0.0125em" }],
      },
      borderRadius: {
        sm: "0.5rem",
        md: "0.75rem",
        lg: "0.9375rem", // 15px — the card radius
        xl: "2rem",
        blob: "3.75rem", // 60px — oversized feature panels
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
        lift: "0 8px 24px rgba(52,51,50,0.15)",
        control: "0 1px 2px rgba(52,51,50,0.06)",
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
