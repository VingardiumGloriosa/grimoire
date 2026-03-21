'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { MoonJournalEntry } from '@/lib/types'
import { getPhaseLabel } from '@/lib/moon'
import { Card, CardContent } from '@/components/ui/card'
import MoonPhaseIcon from '@/components/MoonPhaseIcon'
import { Moon, Trash2 } from 'lucide-react'

// Approximate illumination/waxing for phase icons in the list
const PHASE_DISPLAY: Record<string, { illumination: number; isWaxing: boolean }> = {
  new_moon: { illumination: 0, isWaxing: true },
  waxing_crescent: { illumination: 0.2, isWaxing: true },
  first_quarter: { illumination: 0.5, isWaxing: true },
  waxing_gibbous: { illumination: 0.8, isWaxing: true },
  full_moon: { illumination: 1, isWaxing: false },
  waning_gibbous: { illumination: 0.8, isWaxing: false },
  last_quarter: { illumination: 0.5, isWaxing: false },
  waning_crescent: { illumination: 0.2, isWaxing: false },
}

interface MoonJournalListProps {
  entries: MoonJournalEntry[]
}

export default function MoonJournalList({ entries: initialEntries }: MoonJournalListProps) {
  const router = useRouter()
  const [entries, setEntries] = useState(initialEntries)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(e: React.MouseEvent, entryId: string) {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Delete this journal entry? This cannot be undone.')) return

    setDeletingId(entryId)
    try {
      const res = await fetch(`/api/moon/journal?id=${entryId}`, { method: 'DELETE' })
      if (res.ok) {
        setEntries((prev) => prev.filter((entry) => entry.id !== entryId))
        router.refresh()
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Moon
          className="h-12 w-12 text-[var(--color-text-faint)]"
          strokeWidth={1.5}
        />
        <p className="font-body text-lg text-[var(--color-text-muted)]">
          Your lunar reflections are waiting.
        </p>
        <Link
          href="/moon/journal/new"
          className="font-body text-sm text-[var(--color-secondary)] hover:text-[var(--color-primary)] underline underline-offset-4"
        >
          Write your first entry
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const formattedDate = new Date(entry.date).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })

        const phaseDisplay = PHASE_DISPLAY[entry.moon_phase] ?? {
          illumination: entry.moon_illumination,
          isWaxing: true,
        }

        return (
          <Link key={entry.id} href={`/moon/journal/${entry.id}`}>
            <Card className="group surface-gradient hover-glow border border-[var(--color-border)] border-l-[3px] border-l-[var(--color-accent)] rounded-lg transition-all duration-200 hover:shadow-glow-gold hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-2">
                  {/* Title + Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-xl text-[var(--color-text)] group-hover:text-[var(--color-secondary)] transition-colors">
                      {entry.title}
                    </h3>
                    <button
                      onClick={(e) => handleDelete(e, entry.id)}
                      disabled={deletingId === entry.id}
                      className="shrink-0 rounded-md p-1.5 text-[var(--color-text-faint)] opacity-0 transition-all hover:bg-blush/10 hover:text-blush group-hover:opacity-100 disabled:opacity-50"
                      title="Delete entry"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Date + Moon icon */}
                  <div className="flex items-center gap-3">
                    <p className="font-body text-sm text-[var(--color-text-muted)]">
                      {formattedDate}
                    </p>
                    <MoonPhaseIcon
                      illumination={phaseDisplay.illumination}
                      isWaxing={phaseDisplay.isWaxing}
                      size={18}
                    />
                    <span className="font-body text-xs text-[var(--color-text-faint)]">
                      {getPhaseLabel(entry.moon_phase)}
                    </span>
                  </div>

                  {/* Footer: Mood + Tags */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      {entry.mood && (
                        <span className="rounded-full bg-[var(--color-primary-subtle)] px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider text-[var(--color-primary)]">
                          {entry.mood}
                        </span>
                      )}
                      {entry.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[var(--color-surface-raised)] px-2.5 py-0.5 text-xs text-[var(--color-text-faint)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
