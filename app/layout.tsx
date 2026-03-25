import type { Metadata } from 'next'
import { Cinzel_Decorative, Cinzel, Cormorant_Garamond } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import IvyBorder from '@/components/IvyBorder'
import MobileCornerLeaves from '@/components/MobileCornerLeaves'
import './globals.css'

const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-cinzel-decorative',
  display: 'swap',
})

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Grimoire',
    template: '%s | Grimoire',
  },
  description: 'Your personal divination companion — tarot, herbology, astrology, crystals, numerology, moon phases, and dream journaling.',
  openGraph: {
    siteName: 'Grimoire',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzelDecorative.variable} ${cinzel.variable} ${cormorantGaramond.variable}`} suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-forest focus:px-4 focus:py-2 focus:font-body focus:text-sm focus:text-parchment"
          >
            Skip to main content
          </a>
          <Navbar />
          <IvyBorder />
          <MobileCornerLeaves />
          <div id="main-content" className="animate-fade-in">
            {children}
          </div>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
