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
          primary: "#dc2626", // Red primary (replacing cyan)
          dim: "#b91c1c",     // Red dim
          glow: "rgba(220, 38, 38, 0.15)", // Red glow
          secondary: "#ef4444", // Teal replacement (Red/Orange hue)
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
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease both',
        'pulse-slow': 'pulse 2s infinite',
        'glow-pulse': 'glow 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(220,38,38,0.15)' },
          '50%': { boxShadow: '0 0 20px rgba(220,38,38,0.35)' },
        }
      }
    },
  },
  plugins: [],
}
