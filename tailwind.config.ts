import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Grimoire palette — bridged to CSS variables for automatic dark mode support
        parchment: 'rgb(var(--color-bg-ch) / <alpha-value>)',
        linen: 'rgb(var(--color-surface-raised-ch) / <alpha-value>)',
        dust: 'rgb(var(--color-border-ch) / <alpha-value>)',
        charcoal: 'rgb(var(--color-text-ch) / <alpha-value>)',
        forest: 'rgb(var(--color-primary-ch) / <alpha-value>)',
        'forest-deep': 'rgb(var(--color-primary-hover-ch) / <alpha-value>)',
        sage: 'rgb(var(--color-secondary-ch) / <alpha-value>)',
        'sage-mist': 'rgb(var(--color-primary-subtle-ch) / <alpha-value>)',
        gold: 'rgb(var(--color-accent-ch) / <alpha-value>)',
        'gold-subtle': 'rgb(var(--color-accent-subtle-ch) / <alpha-value>)',
        blush: 'rgb(var(--color-blush-ch) / <alpha-value>)',
        umber: 'rgb(var(--color-brown-ch) / <alpha-value>)',
        'warm-grey': 'rgb(var(--color-text-muted-ch) / <alpha-value>)',
        // shadcn/ui mappings (CSS variable based)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        wordmark: ['var(--font-cinzel-decorative)', 'Georgia', 'serif'],
        display: ['var(--font-cinzel)', 'Georgia', 'serif'],
        body: ['var(--font-cormorant)', 'Georgia', 'serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      maxWidth: {
        content: '1100px',
        reading: '720px',
        journal: '800px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-slow': {
          '0%, 100%': { boxShadow: '0 0 12px rgb(var(--color-accent-ch) / 0.15)' },
          '50%': { boxShadow: '0 0 20px rgb(var(--color-accent-ch) / 0.35)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'ivy-sway': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(7deg)' },
          '75%': { transform: 'rotate(-4deg)' },
        },
        'ivy-sway-alt': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '30%': { transform: 'rotate(-7deg)' },
          '70%': { transform: 'rotate(3.5deg)' },
        },
        'ivy-breathe': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-slow': 'pulse-slow 2.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'ivy-sway': 'ivy-sway 7s ease-in-out infinite',
        'ivy-sway-alt': 'ivy-sway-alt 9s ease-in-out infinite',
        'ivy-breathe': 'ivy-breathe 11s ease-in-out infinite',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgb(var(--color-accent-ch) / 0.15), 0 2px 8px rgb(0 0 0 / 0.04)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
