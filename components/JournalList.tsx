"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { TarotReading } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Trash2 } from "lucide-react"

interface JournalListProps {
  readings: TarotReading[]
}

export default function JournalList({ readings: initialReadings }: JournalListProps) {
  const router = useRouter()
  const [readings, setReadings] = useState(initialReadings)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(e: React.MouseEvent, readingId: string) {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm("Delete this reading? This cannot be undone.")) return

    setDeletingId(readingId)
    try {
      const res = await fetch(`/api/readings?id=${readingId}`, { method: "DELETE" })
      if (res.ok) {
        setReadings((prev) => prev.filter((r) => r.id !== readingId))
        router.refresh()
      }
    } finally {
      setDeletingId(null)
    }
  }
  if (readings.length === 0) {
    return (
      <div className="max-w-journal mx-auto flex flex-col items-center justify-center py-24 space-y-4">
        <BookOpen
          className="h-12 w-12 text-[var(--color-text-faint)]"
          strokeWidth={1.5}
        />
        <p className="font-body text-lg text-warm-grey">
          Your journal is waiting.
        </p>
        <Link
          href="/reading/new"
          className="font-body text-sm text-forest hover:text-forest-deep underline underline-offset-4"
        >
          Begin your first reading
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-journal mx-auto space-y-4">
      {readings.map((reading) => {
        const formattedDate = new Date(reading.date).toLocaleDateString(
          "en-GB",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )

        // Extract first meaningful line of synthesis for the preview
        const synthesisPreview = reading.synthesis
          ? reading.synthesis.split("\n\n")[0]
          : null

        return (
          <Link key={reading.id} href={`/reading/${reading.id}`}>
            <Card className="group surface-gradient hover-glow border border-[var(--color-border)] border-l-[3px] border-l-gold rounded-lg transition-all duration-200 hover:shadow-glow-gold hover:border-l-gold hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-2">
                  {/* Spread Name + Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-xl text-charcoal group-hover:text-forest transition-colors">
                      {reading.spread_name}
                    </h3>
                    <button
                      onClick={(e) => handleDelete(e, reading.id)}
                      disabled={deletingId === reading.id}
                      className="shrink-0 rounded-md p-1.5 text-[var(--color-text-faint)] opacity-0 transition-all hover:bg-blush/10 hover:text-blush group-hover:opacity-100 disabled:opacity-50"
                      title="Delete reading"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Date */}
                  <p className="font-body text-sm text-warm-grey">
                    {formattedDate}
                  </p>

                  {/* Synthesis Preview */}
                  {synthesisPreview && (
                    <p className="font-body text-sm text-charcoal italic leading-relaxed line-clamp-2">
                      {synthesisPreview}
                    </p>
                  )}

                  {/* Footer: Mood + Card count */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      {reading.mood && (
                        <span className="rounded-full bg-sage-mist px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider text-forest">
                          {reading.mood}
                        </span>
                      )}
                    </div>
                    <span className="font-body text-xs text-warm-grey">
                      {reading.cards.length}{" "}
                      {reading.cards.length === 1 ? "card" : "cards"}
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
