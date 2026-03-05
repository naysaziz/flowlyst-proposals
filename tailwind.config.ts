import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // flowlyst brand colors
        teal: {
          DEFAULT: "#00A568",
          light: "#E6F7F1",
          dark: "#007F50",
          mid: "#00C97E",
        },
        purple: {
          DEFAULT: "#5F5AA2",
          light: "#EFEEFC",
          dark: "#4A4680",
        },
        charcoal: {
          DEFAULT: "#404041",
          mid: "#767677",
          muted: "#A8A8A9",
        },
        silver: {
          DEFAULT: "#D9D9D9",
          light: "#F4F5F7",
          border: "#E2E2E2",
        },
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "Nunito", "DM Sans", "sans-serif"],
        display: ["var(--font-dm-serif)", "DM Serif Display", "Georgia", "serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        DEFAULT: "14px",
        sm: "9px",
        xs: "6px",
        xl: "20px",
        "2xl": "28px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04)",
        DEFAULT: "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
        md: "0 8px 24px rgba(0,0,0,0.08), 0 24px 48px rgba(0,0,0,0.05)",
        teal: "0 4px 14px rgba(0,165,104,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
