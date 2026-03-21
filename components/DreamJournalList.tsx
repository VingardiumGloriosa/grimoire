'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { DreamEntry, MoonPhaseKey } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import MoonPhaseIcon from '@/components/MoonPhaseIcon'
import VividnessIndicator from '@/components/VividnessIndicator'
import { CloudMoon, Trash2, Eye } from 'lucide-react'

interface DreamJournalListProps {
  entries: DreamEntry[]
}

const WAXING_PHASES: MoonPhaseKey[] = [
  'new_moon',
  'waxing_crescent',
  'first_quarter',
  'waxing_gibbous',
]

export default function DreamJournalList({
  entries: initialEntries,
}: DreamJournalListProps) {
  const router = useRouter()
  const [entries, setEntries] = useState(initialEntries)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(e: React.MouseEvent, entryId: string) {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Delete this dream entry? This cannot be undone.')) return

    setDeletingId(entryId)
    try {
      const res = await fetch(`/api/dreams/entries?id=${entryId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== entryId))
        router.refresh()
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (entries.length === 0) {
    return (
      <div className="max-w-journal mx-auto flex flex-col items-center justify-center py-24 space-y-4">
        <CloudMoon
          className="h-12 w-12 text-[var(--color-text-faint)]"
          strokeWidth={1.5}
        />
        <p className="font-body text-lg text-[var(--color-text-muted)]">
          Your dream journal is waiting.
        </p>
        <Link
          href="/dreams/new"
          className="font-body text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] underline underline-offset-4"
        >
          Record your first dream
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-journal mx-auto space-y-4">
      {entries.map((entry) => {
        const formattedDate = new Date(entry.date).toLocaleDateString(
          'en-GB',
          { day: 'numeric', month: 'long', year: 'numeric' }
        )

        return (
          <Link key={entry.id} href={`/dreams/${entry.id}`}>
            <Card className="group surface-gradient hover-glow border border-[var(--color-border)] border-l-[3px] border-l-[var(--color-accent)] rounded-lg transition-all duration-200 hover:shadow-glow-gold hover:border-l-[var(--color-accent)] hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-2">
                  {/* Title + Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-xl text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                      {entry.title}
                    </h3>
                    <button
                      onClick={(e) => handleDelete(e, entry.id)}
                      disabled={deletingId === entry.id}
                      className="shrink-0 rounded-md p-1.5 text-[var(--color-text-faint)] opacity-0 transition-all hover:bg-[var(--color-blush)]/10 hover:text-[var(--color-blush)] group-hover:opacity-100 disabled:opacity-50"
                      title="Delete dream entry"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Date */}
                  <p className="font-body text-sm text-[var(--color-text-muted)]">
                    {formattedDate}
                  </p>

                  {/* Content preview */}
                  <p className="font-body text-sm text-[var(--color-text)] italic leading-relaxed line-clamp-2">
                    {entry.content}
                  </p>

                  {/* Footer: badges + metadata */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Moon phase */}
                      {entry.moon_phase &&
                        entry.moon_illumination !== null && (
                          <MoonPhaseIcon
                            illumination={entry.moon_illumination}
                            isWaxing={WAXING_PHASES.includes(
                              entry.moon_phase
                            )}
                            size={18}
                          />
                        )}
                      {/* Mood badge */}
                      {entry.mood && (
                        <span className="rounded-full bg-[var(--color-primary-subtle)] px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider text-[var(--color-primary)]">
                          {entry.mood}
                        </span>
                      )}
                      {/* Lucid badge */}
                      {entry.lucid && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-subtle)] px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-[var(--color-accent)]">
                          <Eye size={10} strokeWidth={1.5} />
                          Lucid
                        </span>
                      )}
                      {/* Vividness */}
                      <VividnessIndicator level={entry.vividness} />
                    </div>
                    <span className="font-body text-xs text-[var(--color-text-muted)]">
                      {entry.symbols.length}{' '}
                      {entry.symbols.length === 1 ? 'symbol' : 'symbols'}
                    </span>
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
