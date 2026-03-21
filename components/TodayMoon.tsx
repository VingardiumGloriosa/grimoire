'use client'

import Link from 'next/link'
import { computeMoonPhase } from '@/lib/moon'
import MoonPhaseIcon from '@/components/MoonPhaseIcon'
import { BookOpen } from 'lucide-react'

export default function TodayMoon() {
  const today = new Date()
  const moonData = computeMoonPhase(today)

  const formattedDate = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const illuminationPct = Math.round(moonData.illumination * 100)

  return (
    <div className="surface-gradient border border-[var(--color-border)] rounded-lg p-8 text-center space-y-5">
      {/* Moon icon */}
      <div className="flex justify-center">
        <MoonPhaseIcon
          illumination={moonData.illumination}
          isWaxing={moonData.is_waxing}
          size={96}
        />
      </div>

      {/* Phase name */}
      <h2 className="font-display text-3xl text-[var(--color-text)]">
        {moonData.phase_label}
      </h2>

      {/* Illumination */}
      <p className="font-body text-lg text-[var(--color-text-muted)]">
        {illuminationPct}% illuminated
      </p>

      {/* Date */}
      <p className="font-body text-sm text-[var(--color-text-faint)]">
        {formattedDate}
      </p>

      {/* Link to ritual guide */}
      <Link
        href={`/moon/guide#${moonData.phase}`}
        className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-body text-sm text-[var(--color-secondary)] transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]"
      >
        <BookOpen size={16} strokeWidth={1.5} />
        View ritual guide for this phase
      </Link>
    </div>
  )
}
