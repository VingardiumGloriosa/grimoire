'use client'

import { useState, useEffect } from 'react'
import type { SymbolFrequency, MoonPhaseKey } from '@/lib/types'
import MoonPhaseIcon from '@/components/MoonPhaseIcon'
import { Loader2 } from 'lucide-react'

interface PatternData {
  symbol_frequency: SymbolFrequency[]
  moon_correlation: Record<MoonPhaseKey, number>
  total_entries: number
}

const MOON_PHASES: { key: MoonPhaseKey; label: string; illumination: number; isWaxing: boolean }[] = [
  { key: 'new_moon', label: 'New Moon', illumination: 0, isWaxing: true },
  { key: 'waxing_crescent', label: 'Waxing Crescent', illumination: 0.25, isWaxing: true },
  { key: 'first_quarter', label: 'First Quarter', illumination: 0.5, isWaxing: true },
  { key: 'waxing_gibbous', label: 'Waxing Gibbous', illumination: 0.75, isWaxing: true },
  { key: 'full_moon', label: 'Full Moon', illumination: 1, isWaxing: false },
  { key: 'waning_gibbous', label: 'Waning Gibbous', illumination: 0.75, isWaxing: false },
  { key: 'last_quarter', label: 'Last Quarter', illumination: 0.5, isWaxing: false },
  { key: 'waning_crescent', label: 'Waning Crescent', illumination: 0.25, isWaxing: false },
]

export default function PatternDashboard() {
  const [data, setData] = useState<PatternData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPatterns() {
      try {
        const res = await fetch('/api/dreams/patterns')
        if (!res.ok) throw new Error('Failed to load patterns')
        const json = await res.json()
        setData(json)
      } catch {
        setError('Could not load dream patterns.')
      } finally {
        setLoading(false)
      }
    }
    fetchPatterns()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="py-12 text-center">
        <p className="font-body text-[var(--color-text-muted)]">
          {error ?? 'No pattern data available.'}
        </p>
      </div>
    )
  }

  const maxFrequency = data.symbol_frequency.length > 0
    ? Math.max(...data.symbol_frequency.map((s) => s.count))
    : 1

  const maxMoonCount = Math.max(
    ...MOON_PHASES.map((p) => data.moon_correlation[p.key] ?? 0),
    1
  )

  return (
    <div className="space-y-10">
      {/* Total entries */}
      <div className="text-center">
        <p className="font-display text-5xl text-[var(--color-accent)]">
          {data.total_entries}
        </p>
        <p className="mt-1 font-body text-sm text-[var(--color-text-muted)]">
          {data.total_entries === 1 ? 'dream recorded' : 'dreams recorded'}
        </p>
      </div>

      {/* Symbol frequency */}
      {data.symbol_frequency.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-[var(--color-text)]">
            Recurring Symbols
          </h2>
          <div className="space-y-3">
            {data.symbol_frequency.map((sym) => (
              <div key={sym.symbol_name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-[var(--color-text)]">
                    {sym.symbol_name}
                  </span>
                  <span className="font-body text-xs text-[var(--color-text-muted)]">
                    {sym.count}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--color-surface-raised)]">
                  <div
                    className="h-2 rounded-full bg-[var(--color-accent)] transition-all"
                    style={{
                      width: `${(sym.count / maxFrequency) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Moon phase correlation */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl text-[var(--color-text)]">
          Dreams by Moon Phase
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {MOON_PHASES.map((phase) => {
            const count = data.moon_correlation[phase.key] ?? 0
            return (
              <div
                key={phase.key}
                className="surface-gradient border border-[var(--color-border)] rounded-lg p-4 flex flex-col items-center gap-2"
              >
                <MoonPhaseIcon
                  illumination={phase.illumination}
                  isWaxing={phase.isWaxing}
                  size={32}
                />
                <span className="font-body text-xs text-[var(--color-text-muted)] text-center">
                  {phase.label}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-xl text-[var(--color-text)]">
                    {count}
                  </span>
                </div>
                {/* Mini bar */}
                <div className="h-1 w-full rounded-full bg-[var(--color-surface-raised)]">
                  <div
                    className="h-1 rounded-full bg-[var(--color-accent)] transition-all"
                    style={{
                      width: `${(count / maxMoonCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Empty state */}
      {data.symbol_frequency.length === 0 && data.total_entries === 0 && (
        <div className="py-12 text-center">
          <p className="font-body text-[var(--color-text-muted)] italic">
            Record your dreams to begin seeing patterns emerge.
          </p>
        </div>
      )}
    </div>
  )
}
