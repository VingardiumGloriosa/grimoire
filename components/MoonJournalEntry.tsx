'use client'

import { useState, useMemo } from 'react'
import { computeMoonPhase, getPhaseLabel } from '@/lib/moon'
import MoonPhaseIcon from '@/components/MoonPhaseIcon'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, X } from 'lucide-react'
import type { MoonJournalEntry as MoonJournalEntryType } from '@/lib/types'

const MOOD_OPTIONS = [
  'reflective',
  'grateful',
  'anxious',
  'energized',
  'calm',
  'restless',
  'hopeful',
  'melancholic',
  'curious',
  'grounded',
]

interface MoonJournalEntryProps {
  entry?: MoonJournalEntryType
  onSubmit: (data: {
    date: string
    title: string
    content: string
    mood: string | null
    tags: string[]
  }) => Promise<void>
  submitting?: boolean
}

export default function MoonJournalEntry({
  entry,
  onSubmit,
  submitting = false,
}: MoonJournalEntryProps) {
  const todayStr = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(entry?.date ?? todayStr)
  const [title, setTitle] = useState(entry?.title ?? '')
  const [content, setContent] = useState(entry?.content ?? '')
  const [mood, setMood] = useState<string | null>(entry?.mood ?? null)
  const [tags, setTags] = useState<string[]>(entry?.tags ?? [])
  const [tagInput, setTagInput] = useState('')

  // Auto-compute moon phase for the selected date
  const moonData = useMemo(() => {
    const d = new Date(date + 'T12:00:00Z')
    return computeMoonPhase(d)
  }, [date])

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase()
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag])
      }
      setTagInput('')
    }
  }

  function handleRemoveTag(tag: string) {
    setTags(tags.filter((t) => t !== tag))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    await onSubmit({
      date,
      title: title.trim(),
      content: content.trim(),
      mood,
      tags,
    })
  }

  const isValid = title.trim().length > 0 && content.trim().length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Moon phase preview */}
      <div className="surface-gradient border border-[var(--color-border)] rounded-lg p-4 flex items-center gap-4">
        <MoonPhaseIcon
          illumination={moonData.illumination}
          isWaxing={moonData.is_waxing}
          size={40}
        />
        <div>
          <p className="font-display text-lg text-[var(--color-text)]">
            {moonData.phase_label}
          </p>
          <p className="font-body text-xs text-[var(--color-text-faint)]">
            {Math.round(moonData.illumination * 100)}% illuminated
          </p>
        </div>
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label className="font-body text-sm text-[var(--color-text-muted)]">Date</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-[var(--color-surface)] border-[var(--color-border)] font-body"
        />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label className="font-body text-sm text-[var(--color-text-muted)]">Title</Label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A name for this reflection..."
          className="bg-[var(--color-surface)] border-[var(--color-border)] font-body placeholder:text-[var(--color-text-faint)]"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label className="font-body text-sm text-[var(--color-text-muted)]">Reflection</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What is the moon revealing tonight..."
          className="bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)] min-h-[160px]"
        />
      </div>

      {/* Mood */}
      <div className="space-y-2">
        <Label className="font-body text-sm text-[var(--color-text-muted)]">Mood</Label>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(mood === m ? null : m)}
              className={`rounded-full px-3 py-1 font-body text-xs transition-colors ${
                mood === m
                  ? 'bg-[var(--color-primary)] text-[var(--color-bg)]'
                  : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="font-body text-sm text-[var(--color-text-muted)]">
          Tags
        </Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-subtle)] px-3 py-1 font-body text-xs text-[var(--color-accent)]"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-[var(--color-text)]"
              >
                <X size={12} strokeWidth={1.5} />
              </button>
            </span>
          ))}
        </div>
        <Input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Type a tag and press Enter..."
          className="bg-[var(--color-surface)] border-[var(--color-border)] font-body placeholder:text-[var(--color-text-faint)]"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={!isValid || submitting}
          className="bg-forest text-parchment hover:bg-forest-deep font-body"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Saving...
            </>
          ) : entry ? (
            'Save Changes'
          ) : (
            'Save Entry'
          )}
        </Button>
      </div>
    </form>
  )
}
