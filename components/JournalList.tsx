"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { TarotReading } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ConfirmDialog from "@/components/ConfirmDialog"
import { BookOpen, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface JournalListProps {
  readings: TarotReading[]
  totalCount: number
}

export default function JournalList({ readings: initialReadings, totalCount: initialTotalCount }: JournalListProps) {
  const router = useRouter()
  const [readings, setReadings] = useState(initialReadings)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount)
  const [loadingMore, setLoadingMore] = useState(false)

  async function loadMore() {
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await fetch(`/api/readings?page=${nextPage}&limit=20`)
      if (res.ok) {
        const data: TarotReading[] = await res.json()
        const headerCount = res.headers.get("X-Total-Count")
        if (headerCount) setTotalCount(parseInt(headerCount, 10))
        setReadings((prev) => [...prev, ...data])
        setPage(nextPage)
      }
    } catch {
      toast.error("Failed to load more readings")
    } finally {
      setLoadingMore(false)
    }
  }

  function handleDeleteClick(e: React.MouseEvent, readingId: string) {
    e.preventDefault()
    e.stopPropagation()
    setDeleteTarget(readingId)
  }

  async function confirmDelete() {
    if (!deleteTarget) return

    setDeletingId(deleteTarget)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/readings?id=${deleteTarget}`, { method: "DELETE" })
      if (res.ok) {
        setReadings((prev) => prev.filter((r) => r.id !== deleteTarget))
        setTotalCount((prev) => Math.max(0, prev - 1))
        router.refresh()
        toast.success("Reading deleted")
      } else {
        setDeleteError("Failed to delete reading. Please try again.")
        toast.error("Failed to delete reading")
      }
    } catch {
      setDeleteError("Something went wrong. Please try again.")
      toast.error("Failed to delete reading")
    } finally {
      setDeletingId(null)
      setDeleteTarget(null)
    }
  }
  if (readings.length === 0 && !deleteError) {
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
          className="font-body text-sm text-forest hover:text-forest-deep dark:hover:text-gold underline underline-offset-4"
        >
          Begin your first reading
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-journal mx-auto space-y-4">
      {deleteError && (
        <p className="font-body text-sm text-blush text-center py-2">{deleteError}</p>
      )}
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
                      onClick={(e) => handleDeleteClick(e, reading.id)}
                      disabled={deletingId === reading.id}
                      className="shrink-0 rounded-md p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-text-faint)] opacity-60 transition-all hover:bg-blush/10 hover:text-blush hover:opacity-100 disabled:opacity-50"
                      aria-label="Delete reading"
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
                        <span className="rounded-full bg-sage-mist dark:bg-linen px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider text-forest">
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

      {readings.length < totalCount && (
        <div className="flex flex-col items-center gap-2 pt-6">
          <p className="font-body text-sm text-warm-grey">
            Showing {readings.length} of {totalCount}
          </p>
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loadingMore}
            className="font-body"
          >
            {loadingMore ? (
              <><Loader2 size={14} className="mr-2 animate-spin" />Loading...</>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete this reading?"
        description="This action cannot be undone. Your reading and its synthesis will be permanently removed."
        onConfirm={confirmDelete}
        loading={deletingId === deleteTarget}
      />
    </div>
  )
}
