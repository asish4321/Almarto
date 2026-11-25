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
        brand: {
          purple: {
            DEFAULT: "#2E4A3E",
            50: "#F2F6F0",
            100: "#E4ECE0",
            200: "#C8D8C2",
            300: "#A9C2A2",
            400: "#7A9F73",
            500: "#527863",
            600: "#3D624E",
            700: "#2E4A3E", // Muted Forest Sage
            800: "#22382F",
            900: "#182922",
            dark: "#182922",
          },
          orange: {
            DEFAULT: "#527863",
            50: "#F7F9F6",
            100: "#EAF0E8",
            200: "#D3E2D0",
            300: "#ADC7A8",
            400: "#85A880",
            500: "#527863", // Pale / Mid Earthy Sage
            600: "#416250",
            700: "#334E3F",
            800: "#263B30",
            900: "#1B2A22",
          },
          bg: "#EFE9DF", // Warm Biscuit
          text: "#1B2721", // Deep Charcoal Forest
          muted: "#5F6E66", // Muted Sage
          border: "#DED6C7", // Warm Biscuit Border
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px -2px rgba(25, 21, 43, 0.06), 0 1px 4px -1px rgba(25, 21, 43, 0.04)",
        "card-hover": "0 10px 25px -5px rgba(53, 16, 155, 0.1), 0 8px 10px -6px rgba(53, 16, 155, 0.06)",
        header: "0 2px 10px 0 rgba(25, 21, 43, 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
