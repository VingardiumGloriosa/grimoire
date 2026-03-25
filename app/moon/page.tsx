import TodayMoon from '@/components/TodayMoon'
import MoonCalendar from '@/components/MoonCalendar'

export const metadata = {
  title: 'Moon Phases',
  description: 'Track lunar cycles and align with the moon.',
}

export default function MoonPhasesPage() {
  return (
    <main className="max-w-reading mx-auto px-6 sm:px-10 py-10">
      <h1 className="font-display text-2xl sm:text-4xl text-[var(--color-text)] mb-8">
        Moon Phases
      </h1>

      <div className="space-y-8">
        <TodayMoon />
        <MoonCalendar />
      </div>
    </main>
  )
}
