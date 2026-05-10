import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211f",
        moss: "#52675c",
        cream: "#f8f3e8",
        oat: "#ede3d2",
        payroll: "#0f6b4f"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        soft: "0 24px 80px rgba(23, 33, 31, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
