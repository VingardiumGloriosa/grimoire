"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { NumerologyChart } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ConfirmDialog from "@/components/ConfirmDialog"
import { Hash, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface NumerologyChartListProps {
  charts: NumerologyChart[]
  totalCount: number
}

export default function NumerologyChartList({ charts: initialCharts, totalCount: initialTotalCount }: NumerologyChartListProps) {
  const router = useRouter()
  const [charts, setCharts] = useState(initialCharts)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount)
  const [loadingMore, setLoadingMore] = useState(false)

  async function loadMore() {
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await fetch(`/api/numerology?page=${nextPage}&limit=20`)
      if (res.ok) {
        const data: NumerologyChart[] = await res.json()
        const headerCount = res.headers.get("X-Total-Count")
        if (headerCount) setTotalCount(parseInt(headerCount, 10))
        setCharts((prev) => [...prev, ...data])
        setPage(nextPage)
      }
    } catch {
      toast.error("Failed to load more charts")
    } finally {
      setLoadingMore(false)
    }
  }

  function handleDeleteClick(e: React.MouseEvent, chartId: string) {
    e.preventDefault()
    e.stopPropagation()
    setDeleteTarget(chartId)
  }

  async function confirmDelete() {
    if (!deleteTarget) return

    setDeletingId(deleteTarget)
    try {
      const res = await fetch(`/api/numerology?id=${deleteTarget}`, { method: "DELETE" })
      if (res.ok) {
        setCharts((prev) => prev.filter((p) => p.id !== deleteTarget))
        setTotalCount((prev) => Math.max(0, prev - 1))
        router.refresh()
        toast.success("Chart deleted")
      } else {
        toast.error("Failed to delete chart")
      }
    } catch {
      toast.error("Failed to delete chart")
    } finally {
      setDeletingId(null)
      setDeleteTarget(null)
    }
  }

  if (charts.length === 0) {
    return (
      <div className="max-w-journal mx-auto flex flex-col items-center justify-center py-24 space-y-4">
        <Hash
          className="h-12 w-12 text-[var(--color-text-faint)]"
          strokeWidth={1.5}
        />
        <p className="font-body text-lg text-[var(--color-text-muted)]">
          Your numerology charts are waiting.
        </p>
        <Link
          href="/numerology"
          className="font-body text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] underline underline-offset-4"
        >
          Calculate your first chart
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-journal mx-auto space-y-4">
      {charts.map((chart) => {
        const formattedDate = new Date(chart.birth_date).toLocaleDateString(
          "en-GB",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )

        return (
          <Link key={chart.id} href={`/numerology/charts/${chart.id}`}>
            <Card className="group surface-gradient hover-glow border border-[var(--color-border)] border-l-[3px] border-l-[var(--color-accent)] rounded-lg transition-all duration-200 hover:shadow-glow-gold hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-2">
                  {/* Label + Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-xl text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                      {chart.label}
                    </h3>
                    <button
                      onClick={(e) => handleDeleteClick(e, chart.id)}
                      disabled={deletingId === chart.id}
                      className="shrink-0 rounded-md p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-text-faint)] opacity-60 transition-all hover:bg-[var(--color-blush)]/10 hover:text-[var(--color-blush)] hover:opacity-100 disabled:opacity-50"
                      aria-label="Delete chart"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Name + Date */}
                  <p className="font-body text-sm text-[var(--color-text-muted)]">
                    {chart.full_name} &middot; {formattedDate}
                  </p>

                  {/* Life Path number badge */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-subtle)] px-3 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                      <span className="font-display text-sm">{chart.results.life_path}</span>
                      Life Path
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}

      {charts.length < totalCount && (
        <div className="flex flex-col items-center gap-2 pt-6">
          <p className="font-body text-sm text-[var(--color-text-muted)]">
            Showing {charts.length} of {totalCount}
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
        title="Delete this chart?"
        description="This action cannot be undone."
        onConfirm={confirmDelete}
        loading={deletingId === deleteTarget}
      />
    </div>
  )
}
