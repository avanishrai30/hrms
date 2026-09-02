import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "hsl(var(--canvas))",
        surface: {
          DEFAULT: "hsl(var(--surface))",
          raised: "hsl(var(--surface-raised))",
          muted: "hsl(var(--surface-muted))",
          accent: "hsl(var(--surface-accent))",
          highlight: "hsl(var(--surface-highlight))"
        },
        muted: "hsl(var(--muted))",
        border: {
          DEFAULT: "hsl(var(--border))",
          subtle: "hsl(var(--border-subtle))",
          strong: "hsl(var(--border-strong))"
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          hover: "hsl(var(--primary-hover))",
          soft: "hsl(var(--primary-soft))",
          foreground: "hsl(var(--primary-foreground))"
        },
        accent: {
          purple: "hsl(var(--accent-purple))",
          lavender: "hsl(var(--accent-lavender))",
          lilac: "hsl(var(--accent-lilac))"
        },
        foreground: {
          DEFAULT: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          muted: "hsl(var(--text-muted))"
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
        info: "hsl(var(--info))"
      },
      borderRadius: {
        control: "10px",
        card: "16px",
        panel: "20px",
        overlay: "24px",
        pill: "9999px"
      },
      boxShadow: {
        card: "0 2px 10px -2px rgba(99, 102, 241, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.03)",
        "card-hover": "0 8px 24px -4px rgba(99, 102, 241, 0.08), 0 2px 6px 0 rgba(15, 23, 42, 0.04)",
        panel: "0 4px 20px -2px rgba(79, 70, 229, 0.06)",
        dropdown: "0 10px 30px -5px rgba(15, 23, 42, 0.1), 0 4px 10px -2px rgba(15, 23, 42, 0.05)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;

