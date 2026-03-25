'use client'

import { useState } from 'react'
import type { DreamSymbol, DreamEntrySymbol } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import SymbolPicker from '@/components/SymbolPicker'
import { X, Loader2 } from 'lucide-react'

const MOODS = [
  'peaceful',
  'anxious',
  'joyful',
  'confused',
  'fearful',
  'curious',
  'neutral',
] as const

interface DreamEntryFormProps {
  symbols: DreamSymbol[]
  onSubmit: (data: {
    date: string
    title: string
    content: string
    mood: string | null
    vividness: number
    lucid: boolean
    recurring: boolean
    symbols: DreamEntrySymbol[]
    tags: string[]
  }) => Promise<void>
}

export default function DreamEntryForm({
  symbols,
  onSubmit,
}: DreamEntryFormProps) {
  const today = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(today)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<string | null>(null)
  const [vividness, setVividness] = useState(3)
  const [lucid, setLucid] = useState(false)
  const [recurring, setRecurring] = useState(false)
  const [selectedSymbols, setSelectedSymbols] = useState<DreamEntrySymbol[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleAddTag() {
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
    }
    setTagInput('')
  }

  function handleRemoveTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  function handleAddSymbol(sym: DreamEntrySymbol) {
    setSelectedSymbols((prev) => [...prev, sym])
  }

  function handleRemoveSymbol(name: string) {
    setSelectedSymbols((prev) => prev.filter((s) => s.symbol_name !== name))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setSubmitting(true)
    try {
      await onSubmit({
        date,
        title: title.trim(),
        content: content.trim(),
        mood,
        vividness,
        lucid,
        recurring,
        symbols: selectedSymbols,
        tags,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date */}
      <div className="space-y-2">
        <Label className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Date
        </Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-[var(--color-surface)] border-[var(--color-border)] font-body w-full sm:max-w-[200px]"
        />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Title
        </Label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A name for this dream..."
          required
          className="bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)]"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Dream
        </Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe what you remember..."
          required
          className="bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)] min-h-[180px]"
        />
      </div>

      {/* Mood */}
      <div className="space-y-2">
        <Label className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Mood
        </Label>
        <Select
          value={mood ?? ''}
          onValueChange={(v) => setMood(v || null)}
        >
          <SelectTrigger className="w-full sm:max-w-[240px] bg-[var(--color-surface)] border-[var(--color-border)] font-body">
            <SelectValue placeholder="How did this dream feel?" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--color-surface)]">
            {MOODS.map((m) => (
              <SelectItem key={m} value={m} className="font-body capitalize">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Vividness */}
      <div className="space-y-2">
        <Label className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Vividness
        </Label>
        <div
          className="flex items-center gap-2"
          role="slider"
          tabIndex={0}
          aria-valuemin={1}
          aria-valuemax={5}
          aria-valuenow={vividness}
          aria-valuetext={`${vividness} out of 5`}
          aria-label="Vividness"
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
              e.preventDefault()
              setVividness((v) => Math.min(5, v + 1))
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
              e.preventDefault()
              setVividness((v) => Math.max(1, v - 1))
            }
          }}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              onClick={() => setVividness(i + 1)}
              className={`h-4 w-4 rounded-full transition-all cursor-pointer ${
                i < vividness
                  ? 'bg-[var(--color-accent)] scale-110'
                  : 'bg-[var(--color-border)] hover:bg-[var(--color-text-faint)]'
              }`}
            />
          ))}
          <span className="ml-2 font-body text-xs text-[var(--color-text-muted)]">
            {vividness} / 5
          </span>
        </div>
      </div>

      {/* Lucid + Recurring toggles */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={lucid}
            onChange={(e) => setLucid(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
          />
          <span className="font-body text-sm text-[var(--color-text)]">Lucid dream</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
          />
          <span className="font-body text-sm text-[var(--color-text)]">Recurring dream</span>
        </label>
      </div>

      {/* Symbols */}
      <div className="space-y-2">
        <Label className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Symbols
        </Label>
        <SymbolPicker
          symbols={symbols}
          selected={selectedSymbols}
          onAdd={handleAddSymbol}
          onRemove={handleRemoveSymbol}
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Tags
        </Label>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-sm bg-[var(--color-primary-subtle)] px-2.5 py-1 font-body text-xs uppercase tracking-wider text-[var(--color-primary)]"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="rounded-full p-0.5 hover:bg-[var(--color-border)] transition-colors"
                >
                  <X size={12} strokeWidth={1.5} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag()
              }
            }}
            placeholder="Add a tag..."
            className="flex-1 bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)]"
          />
          <Button
            type="button"
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
            variant="outline"
            size="sm"
            className="font-body text-xs"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={submitting || !title.trim() || !content.trim()}
        className="w-full bg-forest text-parchment hover:bg-forest-deep font-body"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Record Dream'
        )}
      </Button>
    </form>
  )
}
