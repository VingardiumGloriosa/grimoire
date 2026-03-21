import type { DreamEntry, MoonPhaseKey } from '@/lib/types'
import MoonPhaseIcon from '@/components/MoonPhaseIcon'
import VividnessIndicator from '@/components/VividnessIndicator'
import { Eye, Repeat } from 'lucide-react'

interface DreamEntryViewProps {
  entry: DreamEntry
}

const MOON_PHASE_LABELS: Record<MoonPhaseKey, string> = {
  new_moon: 'New Moon',
  waxing_crescent: 'Waxing Crescent',
  first_quarter: 'First Quarter',
  waxing_gibbous: 'Waxing Gibbous',
  full_moon: 'Full Moon',
  waning_gibbous: 'Waning Gibbous',
  last_quarter: 'Last Quarter',
  waning_crescent: 'Waning Crescent',
}

const WAXING_PHASES: MoonPhaseKey[] = [
  'new_moon',
  'waxing_crescent',
  'first_quarter',
  'waxing_gibbous',
]

export default function DreamEntryView({ entry }: DreamEntryViewProps) {
  const formattedDate = new Date(entry.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="max-w-reading mx-auto space-y-8">
      {/* Header */}
      <header className="space-y-3">
        <h1 className="font-display text-4xl text-[var(--color-text)]">
          {entry.title}
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-body text-sm text-[var(--color-text-muted)]">
            {formattedDate}
          </span>
          {entry.mood && (
            <span className="rounded-full bg-[var(--color-primary-subtle)] px-3 py-0.5 text-xs font-medium uppercase tracking-wider text-[var(--color-primary)]">
              {entry.mood}
            </span>
          )}
          <VividnessIndicator level={entry.vividness} />
          {entry.lucid && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-subtle)] px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider text-[var(--color-accent)]">
              <Eye size={12} strokeWidth={1.5} />
              Lucid
            </span>
          )}
          {entry.recurring && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-raised)] px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
              <Repeat size={12} strokeWidth={1.5} />
              Recurring
            </span>
          )}
        </div>
      </header>

      {/* Moon phase */}
      {entry.moon_phase && entry.moon_illumination !== null && (
        <div className="flex items-center gap-3 border-l-2 border-[var(--color-accent)] pl-4">
          <MoonPhaseIcon
            illumination={entry.moon_illumination}
            isWaxing={WAXING_PHASES.includes(entry.moon_phase)}
            size={32}
          />
          <span className="font-body text-sm text-[var(--color-text-muted)]">
            {MOON_PHASE_LABELS[entry.moon_phase]}
          </span>
        </div>
      )}

      {/* Dream content */}
      <section className="space-y-4">
        <div className="divider-ornament mb-2" aria-hidden="true" />
        <div className="space-y-4">
          {entry.content
            .split('\n\n')
            .filter((p) => p.trim())
            .map((paragraph, i) => (
              <p
                key={i}
                className="font-body text-lg leading-relaxed text-[var(--color-text)]"
              >
                {paragraph}
              </p>
            ))}
        </div>
      </section>

      {/* Symbols */}
      {entry.symbols.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-[var(--color-text)]">Symbols</h2>
          <div className="flex flex-wrap gap-2">
            {entry.symbols.map((sym) => (
              <span
                key={sym.symbol_name}
                className="rounded-sm bg-[var(--color-accent-subtle)] px-2.5 py-1 font-body text-xs text-[var(--color-brown)]"
              >
                {sym.symbol_name}
                {sym.is_personal && (
                  <span className="ml-1 text-[var(--color-text-faint)]">(personal)</span>
                )}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Tags */}
      {entry.tags.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-[var(--color-text)]">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-sm bg-[var(--color-primary-subtle)] px-2.5 py-1 font-body text-xs uppercase tracking-wider text-[var(--color-primary)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
