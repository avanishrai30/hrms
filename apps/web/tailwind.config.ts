import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          secondary: "hsl(var(--muted-foreground))",
          muted: "hsl(var(--muted-foreground))"
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          soft: "hsl(var(--secondary))",
          hover: "hsl(var(--primary) / 0.9)"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))"
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          soft: "hsl(var(--success) / 0.1)",
          foreground: "hsl(var(--success-foreground))"
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          soft: "hsl(var(--warning) / 0.1)",
          foreground: "hsl(var(--warning-foreground))"
        },
        danger: {
          DEFAULT: "hsl(var(--destructive))",
          soft: "hsl(var(--destructive) / 0.1)",
          foreground: "hsl(var(--destructive-foreground))"
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          soft: "hsl(var(--info) / 0.1)",
          foreground: "hsl(var(--info-foreground))"
        },
        // Semantic surface aliases
        canvas: "hsl(var(--background))",
        surface: {
          DEFAULT: "hsl(var(--card))",
          raised: "hsl(var(--card))",
          muted: "hsl(var(--muted))",
          accent: "hsl(var(--accent))",
          highlight: "hsl(var(--muted))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        control: "calc(var(--radius) - 2px)",
        card: "var(--radius)",
        panel: "var(--radius)",
        pill: "9999px"
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        dropdown: "0 4px 16px -2px rgb(0 0 0 / 0.1), 0 2px 6px -1px rgb(0 0 0 / 0.06)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
