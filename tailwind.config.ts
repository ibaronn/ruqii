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
        ink: {
          DEFAULT: "#0a0a0a",
          soft: "#1a1a1a",
          muted: "#525252",
        },
        bone: {
          DEFAULT: "#ffffff",
          warm: "#faf9f7",
          soft: "#f5f4f2",
        },
        stone: {
          line: "#e7e5e2",
          faint: "#f2f1ef",
        },
        bronze: {
          DEFAULT: "#a87e4f",
          deep: "#8c673e",
          pale: "#c9ab82",
        },
      },
      fontFamily: {
        sans: ["var(--font-arabic)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        shell: "1440px",
      },
      spacing: {
        shell: "var(--shell-pad, 2rem)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "drawer-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "drawer-in-ltr": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        "dash-draw": {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
        "check-pop": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "60%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 500ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 350ms ease both",
        "drawer-in": "drawer-in 320ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "drawer-in-ltr": "drawer-in-ltr 320ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "scale-in": "scale-in 260ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-up": "slide-up 300ms cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 1.6s linear infinite",
        float: "float 5s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "check-pop": "check-pop 420ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
      transitionTimingFunction: {
        outExpo: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
export default config;