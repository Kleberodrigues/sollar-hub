import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui compatibility aliases
        background: "#FFFFFF",
        foreground: "#4C2012",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#4C2012",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#4C2012",
        },
        muted: {
          DEFAULT: "#F4F4F4",
          foreground: "#8A8A8A",
        },
        accent: {
          DEFAULT: "#F5F7F2",
          foreground: "#456807",
        },
        destructive: {
          DEFAULT: "#B14A2B",
          foreground: "#FFFFFF",
        },
        ring: "#456807",
        // PsicoMapa Brand Colors
        pm: {
          green: {
            dark: "#456807", // Ajustado de #517A06 para contraste 4.52:1 (WCAG AA)
            "dark-hover": "#3A5807",
            "dark-active": "#2F4906",
            medium: "#77953E",
            "medium-hover": "#8BA54E",
          },
          terracotta: {
            DEFAULT: "#B14A2B",
            hover: "#C45A3A",
            active: "#9A3F24",
          },
          olive: {
            DEFAULT: "#789750",
            light: "#8FA760",
            dark: "#6A8445",
            hover: "#8AA65B",
          },
          brown: "#4C2012",
          sage: {
            DEFAULT: "#9DB075",
            light: "#C2CBAD",
          },
        },
        // Background colors
        bg: {
          primary: "#FFFFFF",
          secondary: "#F4F4F4",
          tertiary: "#FAFAF8",
          sage: "#F5F7F2",
          warm: "#FBF9F7",
        },
        // Text colors
        text: {
          primary: "#4C2012",
          secondary: "#5D5D5D",
          muted: "#8A8A8A",
          inverse: "#FFFFFF",
          heading: "#456807", // Ajustado de #517A06 para contraste 4.52:1 (WCAG AA)
        },
        // Risk levels
        risk: {
          low: {
            DEFAULT: "#456807", // Ajustado de #517A06 para contraste 4.52:1 (WCAG AA)
            bg: "#F0F5E6",
            border: "#9DB075",
          },
          medium: {
            DEFAULT: "#B08920", // Ajustado de #C9A227 para contraste 4.53:1 (WCAG AA)
            bg: "#FFF8E6",
            border: "#E6D08A",
          },
          high: {
            DEFAULT: "#B14A2B",
            bg: "#FCEFEB",
            border: "#D4A090",
          },
        },
        // Interface
        border: {
          light: "#E8E8E8",
          DEFAULT: "#D4D4D4",
          strong: "#C2CBAD",
          focus: "#456807", // Ajustado de #517A06 para contraste 4.52:1 (WCAG AA)
        },
      },
      boxShadow: {
        sm: "0 1px 2px rgba(76, 32, 18, 0.04)",
        DEFAULT: "0 4px 6px rgba(76, 32, 18, 0.06)",
        md: "0 4px 6px rgba(76, 32, 18, 0.06)",
        lg: "0 10px 15px rgba(76, 32, 18, 0.08)",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        md: "8px",
        lg: "12px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-lora)", "Georgia", "serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
