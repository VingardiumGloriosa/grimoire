import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import MoonRitualView from '@/components/MoonRitualView'
import type { MoonRitual, MoonPhaseKey } from '@/lib/types'

export const metadata = {
  title: 'Phase Guide | Grimoire',
  description: 'Ritual suggestions for each moon phase.',
}

// Canonical phase order
const PHASE_ORDER: MoonPhaseKey[] = [
  'new_moon',
  'waxing_crescent',
  'first_quarter',
  'waxing_gibbous',
  'full_moon',
  'waning_gibbous',
  'last_quarter',
  'waning_crescent',
]

export default async function PhaseGuidePage() {
  const supabase = createServerClient()
  const { data, error } = await supabase.from('moon_rituals').select('*')

  const rituals: MoonRitual[] = (data as MoonRitual[]) ?? []

  // Sort by canonical phase order
  const ritualMap = new Map<string, MoonRitual>()
  for (const r of rituals) {
    ritualMap.set(r.phase, r)
  }
  const sorted = PHASE_ORDER.map((phase) => ritualMap.get(phase)).filter(
    (r): r is MoonRitual => r !== undefined
  )

  return (
    <main className="max-w-reading mx-auto px-6 py-10">
      <h1 className="font-display text-2xl sm:text-4xl text-[var(--color-text)] mb-2">
        Moon Phases
      </h1>
      <p className="font-body text-[var(--color-text-muted)] mb-4">
        Track lunar cycles and align with the moon.
      </p>
      <nav className="flex gap-4 mb-8 font-body text-sm">
        <Link href="/moon" className="text-[var(--color-text-muted)] hover:text-forest transition-colors pb-1">
          Phases
        </Link>
        <Link href="/moon/journal" className="text-[var(--color-text-muted)] hover:text-forest transition-colors pb-1">
          Moon Journal
        </Link>
        <span className="text-forest font-medium border-b border-gold pb-1">Phase Guide</span>
      </nav>

      <p className="font-body text-[var(--color-text-muted)] mb-8">
        Each lunar phase carries its own energy. Here is a guide to working with them.
      </p>

      {error && (
        <div className="surface-gradient border border-[var(--color-border)] rounded-lg p-6 text-center">
          <p className="font-body text-[var(--color-text-muted)]">
            Unable to load ritual data. Please try again later.
          </p>
        </div>
      )}

      {sorted.length === 0 && !error && (
        <div className="surface-gradient border border-[var(--color-border)] rounded-lg p-6 text-center">
          <p className="font-body text-[var(--color-text-muted)]">
            No ritual data has been seeded yet.
          </p>
        </div>
      )}

      <div className="space-y-8">
        {sorted.map((ritual) => (
          <MoonRitualView key={ritual.id} ritual={ritual} />
        ))}
      </div>
    </main>
  )
}
