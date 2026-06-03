import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // xAI design system
        black: "#000000",
        white: "#FFFFFF",
        surface: "#050505",
        secondary: "#9A9A9A",
        "muted-border": "#2A2A2A",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        display: ["5rem", { lineHeight: "1", fontWeight: "300", letterSpacing: "-0.04em" }],
        h1: ["2.4rem", { lineHeight: "1.1", fontWeight: "400" }],
        body: ["0.95rem", { lineHeight: "1.55" }],
        label: ["0.72rem", { lineHeight: "1", letterSpacing: "0.12em" }],
      },
      borderRadius: {
        none: "0px",
        sm: "0px",
        DEFAULT: "0px",
        md: "0px",
        lg: "2px",
        xl: "2px",
      },
      spacing: {
        // 8/16/32 scale
        sm: "8px",
        md: "16px",
        lg: "32px",
      },
      transitionProperty: {
        transform: "transform",
      },
    },
  },
  plugins: [],
};
export default config;
