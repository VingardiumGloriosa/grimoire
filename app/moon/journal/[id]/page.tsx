'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import MoonJournalEntry from '@/components/MoonJournalEntry'
import MoonPhaseIcon from '@/components/MoonPhaseIcon'
import { getPhaseLabel } from '@/lib/moon'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil, Loader2 } from 'lucide-react'
import type { MoonJournalEntry as MoonJournalEntryType } from '@/lib/types'

// Approximate illumination/waxing for phase icons
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

export default function MoonJournalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [entry, setEntry] = useState<MoonJournalEntryType | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchEntry() {
      try {
        const res = await fetch('/api/moon/journal')
        if (!res.ok) throw new Error('Failed to fetch')
        const entries: MoonJournalEntryType[] = await res.json()
        const found = entries.find((e) => e.id === id)
        setEntry(found ?? null)
      } catch {
        setEntry(null)
      } finally {
        setLoading(false)
      }
    }
    fetchEntry()
  }, [id])

  async function handleUpdate(data: {
    date: string
    title: string
    content: string
    mood: string | null
    tags: string[]
  }) {
    setSubmitting(true)
    try {
      const res = await fetch('/api/moon/journal', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })

      if (!res.ok) throw new Error('Failed to update')

      const updated: MoonJournalEntryType = await res.json()
      setEntry(updated)
      setEditing(false)
    } catch {
      // Silently handle — user can retry
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="max-w-reading mx-auto px-6 py-10 flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
      </main>
    )
  }

  if (!entry) {
    return (
      <main className="max-w-reading mx-auto px-6 py-10 text-center">
        <p className="font-body text-[var(--color-text-muted)] mb-4">
          Entry not found.
        </p>
        <Link
          href="/moon/journal"
          className="font-body text-sm text-[var(--color-secondary)] hover:text-[var(--color-primary)] underline underline-offset-4"
        >
          Back to journal
        </Link>
      </main>
    )
  }

  const formattedDate = new Date(entry.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const phaseDisplay = PHASE_DISPLAY[entry.moon_phase] ?? {
    illumination: entry.moon_illumination,
    isWaxing: true,
  }

  return (
    <main className="max-w-reading mx-auto px-6 py-10">
      <Link
        href="/moon/journal"
        className="inline-flex items-center gap-1.5 font-body text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-6"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to journal
      </Link>

      {editing ? (
        <>
          <h1 className="font-display text-4xl text-[var(--color-text)] mb-8">
            Edit Entry
          </h1>
          <MoonJournalEntry
            entry={entry}
            onSubmit={handleUpdate}
            submitting={submitting}
          />
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => setEditing(false)}
              className="font-body"
            >
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-8">
          {/* Header */}
          <header className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-display text-4xl text-[var(--color-text)]">
                {entry.title}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(true)}
                className="font-body text-[var(--color-secondary)] hover:bg-[var(--color-surface-raised)]"
              >
                <Pencil className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
                Edit
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-body text-sm text-[var(--color-text-muted)]">
                {formattedDate}
              </span>
              <MoonPhaseIcon
                illumination={phaseDisplay.illumination}
                isWaxing={phaseDisplay.isWaxing}
                size={20}
              />
              <span className="font-body text-xs text-[var(--color-text-faint)]">
                {getPhaseLabel(entry.moon_phase)} &middot;{' '}
                {Math.round(entry.moon_illumination * 100)}% illuminated
              </span>
            </div>

            {entry.mood && (
              <span className="inline-block rounded-full bg-[var(--color-primary-subtle)] px-3 py-0.5 text-xs font-medium uppercase tracking-wider text-[var(--color-primary)]">
                {entry.mood}
              </span>
            )}
          </header>

          <div className="divider-ornament" aria-hidden="true" />

          {/* Content */}
          <section>
            <p className="font-body text-lg leading-relaxed text-[var(--color-text)] whitespace-pre-wrap">
              {entry.content}
            </p>
          </section>

          {/* Tags */}
          {entry.tags.length > 0 && (
            <section className="pt-4">
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--color-accent-subtle)] px-3 py-1 font-body text-xs text-[var(--color-accent)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  )
}
