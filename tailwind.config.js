/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pulse: {
          bg: "#07050f",
          deep: "#12081f",
          violet: "#8b5cf6",
          neon: "#d946ef",
          cyan: "#38bdf8",
          pink: "#fb7185",
        },
      },
      fontFamily: {
        display: ['"Syne"', '"Noto Sans SC"', "sans-serif"],
        body: ['"Space Grotesk"', '"Noto Sans SC"', "sans-serif"],
        poster: ['"Bebas Neue"', '"Noto Sans SC"', "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(168, 85, 247, 0.35)",
        neon: "0 0 24px rgba(217, 70, 239, 0.45)",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.9" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.55s ease-out both",
        pulseGlow: "pulseGlow 3.6s ease-in-out infinite",
        float: "float 7s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
      },
    },
  },
  plugins: [],
};
