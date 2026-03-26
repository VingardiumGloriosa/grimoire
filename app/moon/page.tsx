import Link from 'next/link'
import TodayMoon from '@/components/TodayMoon'
import MoonCalendar from '@/components/MoonCalendar'

export const metadata = {
  title: 'Moon Phases',
  description: 'Track lunar cycles and align with the moon.',
}

export default function MoonPhasesPage() {
  return (
    <main className="max-w-reading mx-auto px-6 sm:px-10 py-10">
      <h1 className="font-display text-2xl sm:text-4xl text-[var(--color-text)] mb-2">
        Moon Phases
      </h1>
      <p className="font-body text-[var(--color-text-muted)] mb-4">
        Track lunar cycles and align with the moon.
      </p>
      <nav className="flex gap-4 mb-8 font-body text-sm">
        <span className="text-forest font-medium border-b border-gold pb-1">Phases</span>
        <Link href="/moon/journal" className="text-[var(--color-text-muted)] hover:text-forest transition-colors pb-1">
          Moon Journal
        </Link>
        <Link href="/moon/guide" className="text-[var(--color-text-muted)] hover:text-forest transition-colors pb-1">
          Phase Guide
        </Link>
      </nav>

      <div className="space-y-8">
        <TodayMoon />
        <MoonCalendar />
      </div>
    </main>
  )
}
