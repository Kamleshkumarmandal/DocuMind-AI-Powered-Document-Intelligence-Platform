import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18243A",
        violet: "#6859E8",
        canvas: "#F7F8FC"
      }
    }
  },
  plugins: []
};
export default config;
