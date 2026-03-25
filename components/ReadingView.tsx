"use client"

import { useState } from "react"
import type { TarotReading } from "@/lib/types"
import PositionCard from "@/components/PositionCard"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Pencil, Check } from "lucide-react"
import { toast } from "sonner"

interface ReadingViewProps {
  reading: TarotReading
}

export default function ReadingView({ reading }: ReadingViewProps) {
  const [notes, setNotes] = useState(reading.notes ?? "")
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const sortedCards = [...reading.cards].sort(
    (a, b) => a.position_order - b.position_order
  )

  // Format the date for display
  const formattedDate = new Date(reading.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  // Split synthesis into paragraphs for rendering
  const synthesisParagraphs = reading.synthesis
    ? reading.synthesis.split("\n\n").filter((p) => p.trim())
    : []

  // Render a paragraph with **bold** markdown converted to <strong> tags
  function renderWithBold(text: string) {
    const parts = text.split(/\*\*(.+?)\*\*/g)
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    )
  }

  async function handleSaveNotes() {
    setSaving(true)
    setSaveError(null)
    try {
      const response = await fetch(`/api/readings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: reading.id,
          notes,
        }),
      })

      if (response.ok) {
        setSaved(true)
        setIsEditingNotes(false)
        setTimeout(() => setSaved(false), 2000)
        toast.success("Notes saved")
      } else {
        setSaveError("Failed to save notes. Please try again.")
        toast.error("Failed to save notes")
      }
    } catch {
      setSaveError("Failed to save notes. Please try again.")
      toast.error("Failed to save notes")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-reading mx-auto space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <h1 className="font-display text-4xl text-charcoal">
          {reading.spread_name}
        </h1>
        <div className="flex items-center gap-3">
          <span className="font-body text-sm text-warm-grey">
            {formattedDate}
          </span>
          {reading.mood && (
            <span className="rounded-full bg-sage-mist dark:bg-linen px-3 py-0.5 text-xs font-medium uppercase tracking-wider text-forest">
              {reading.mood}
            </span>
          )}
        </div>
      </header>

      {/* Intention */}
      {reading.intention && (
        <div className="border-l-2 border-gold pl-4">
          <p className="font-body text-lg italic text-charcoal leading-relaxed">
            {reading.intention}
          </p>
        </div>
      )}

      {/* Synthesis */}
      {synthesisParagraphs.length > 0 && (
        <section className="space-y-4">
          <div className="divider-ornament mb-2" aria-hidden="true" />
          <h2 className="font-display text-2xl text-charcoal">Synthesis</h2>
          <div className="space-y-4">
            {synthesisParagraphs.map((paragraph, i) => (
              <p
                key={i}
                className="font-body text-lg leading-relaxed text-charcoal"
              >
                {renderWithBold(paragraph)}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Cards */}
      <section className="space-y-6">
        <h2 className="font-display text-2xl text-charcoal">The Cards</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {sortedCards.map((card) => (
            <PositionCard key={card.card_id} card={card} />
          ))}
        </div>
      </section>

      {/* Notes */}
      <section className="space-y-3 pt-8"><div className="divider-ornament mb-6" aria-hidden="true" />
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-charcoal">
            Personal Notes
          </h2>
          {!isEditingNotes && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingNotes(true)}
              className="font-body text-forest hover:bg-sage-mist dark:hover:bg-linen"
            >
              <Pencil className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
              Edit
            </Button>
          )}
        </div>

        {isEditingNotes ? (
          <div className="space-y-3">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down any reflections, thoughts, or follow-up insights..."
              className="bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)] min-h-[120px]"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditingNotes(false)
                  setNotes(reading.notes ?? "")
                }}
                className="font-body"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={saving}
                className="bg-forest text-parchment hover:bg-forest-deep font-body"
              >
                {saving ? "Saving..." : "Save Notes"}
              </Button>
            </div>
            {saveError && (
              <p className="font-body text-xs text-blush mt-2">{saveError}</p>
            )}
          </div>
        ) : (
          <div>
            {notes ? (
              <p className="font-body text-base text-charcoal leading-relaxed whitespace-pre-wrap">
                {notes}
              </p>
            ) : (
              <p className="font-body text-sm text-warm-grey italic">
                No notes yet. Click edit to add your reflections.
              </p>
            )}
            {saved && (
              <p className="flex items-center gap-1 mt-2 font-body text-xs text-forest">
                <Check className="h-3 w-3" strokeWidth={1.5} />
                Notes saved
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
