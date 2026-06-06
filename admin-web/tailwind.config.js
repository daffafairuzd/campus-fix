/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "rgb(var(--theme-bg) / <alpha-value>)",
          card: "rgb(var(--theme-card) / <alpha-value>)",
          hover: "rgb(var(--theme-hover) / <alpha-value>)",
          border: "rgb(var(--theme-border) / <alpha-value>)",
        },
        brand: {
          primary: "#DC2626",   // Red-600
          dim: "#B91C1C",       // Red-700
          secondary: "#09090b", // Black/Zinc-950
        },
        ui: {
          text: "rgb(var(--text-main) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
          dim: "rgb(var(--text-dim) / <alpha-value>)",
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444",
          info: "#3b82f6",
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease both',
        'stagger-in': 'fadeIn 0.25s ease both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        }
      }
    },
  },
  plugins: [],
}
