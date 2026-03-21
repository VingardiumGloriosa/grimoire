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
        // Grimoire palette (direct use)
        parchment: '#F2EDE4',
        linen: '#EDE7DD',
        dust: '#D4CCC0',
        charcoal: '#1C1C1A',
        forest: '#1A2F25',
        'forest-deep': '#142620',
        sage: '#5C8A6B',
        'sage-mist': '#E4EBE7',
        gold: '#B8963E',
        'gold-subtle': '#F0E4C8',
        blush: '#7A2E3F',
        umber: '#8B6347',
        'warm-grey': '#6E675D',
        'deep-earth': '#121215',
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
          '0%, 100%': { boxShadow: '0 0 12px rgba(184,150,62,0.15)' },
          '50%': { boxShadow: '0 0 20px rgba(184,150,62,0.35)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-slow': 'pulse-slow 2.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(184,150,62,0.15), 0 2px 8px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
