"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { BirthChart } from "@/lib/types"
import SignBadge from "@/components/SignBadge"
import { Card, CardContent } from "@/components/ui/card"
import ConfirmDialog from "@/components/ConfirmDialog"
import { Star, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface ChartListProps {
  charts: BirthChart[]
}

export default function ChartList({ charts: initialCharts }: ChartListProps) {
  const router = useRouter()
  const [charts, setCharts] = useState(initialCharts)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  function handleDeleteClick(e: React.MouseEvent, chartId: string) {
    e.preventDefault()
    e.stopPropagation()
    setDeleteTarget(chartId)
  }

  async function confirmDelete() {
    if (!deleteTarget) return

    setDeletingId(deleteTarget)
    try {
      const res = await fetch(`/api/astrology/charts?id=${deleteTarget}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setCharts((prev) => prev.filter((c) => c.id !== deleteTarget))
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
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Star
          className="h-12 w-12 text-[var(--color-text-faint)]"
          strokeWidth={1.5}
        />
        <p className="font-body text-lg text-warm-grey">
          Your star charts are waiting.
        </p>
        <Link
          href="/astrology/charts/new"
          className="font-body text-sm text-forest hover:text-forest-deep underline underline-offset-4"
        >
          Create your first chart
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
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
          <Link key={chart.id} href={`/astrology/charts/${chart.id}`}>
            <Card className="group surface-gradient hover-glow border border-[var(--color-border)] border-l-[3px] border-l-gold rounded-lg transition-all duration-200 hover:shadow-glow-gold hover:border-l-gold hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-2">
                  {/* Label + Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-xl text-[var(--color-text)] group-hover:text-forest transition-colors">
                      {chart.label}
                    </h3>
                    <button
                      onClick={(e) => handleDeleteClick(e, chart.id)}
                      disabled={deletingId === chart.id}
                      className="shrink-0 rounded-md p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-text-faint)] opacity-60 transition-all hover:bg-blush/10 hover:text-blush hover:opacity-100 disabled:opacity-50"
                      aria-label="Delete chart"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Birth Date */}
                  <p className="font-body text-sm text-warm-grey">
                    {formattedDate} &middot; {chart.birth_location}
                  </p>

                  {/* Sign Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <SignBadge sign={chart.sun_sign} size="sm" />
                    <SignBadge sign={chart.moon_sign} size="sm" />
                    {chart.rising_sign && (
                      <SignBadge sign={chart.rising_sign} size="sm" />
                    )}
                  </div>

                  {/* Footer labels */}
                  <div className="flex items-center gap-4 pt-2">
                    <span className="font-body text-xs text-[var(--color-text-faint)] uppercase tracking-wider">
                      Sun
                    </span>
                    <span className="font-body text-xs text-[var(--color-text-faint)] uppercase tracking-wider">
                      Moon
                    </span>
                    {chart.rising_sign && (
                      <span className="font-body text-xs text-[var(--color-text-faint)] uppercase tracking-wider">
                        Rising
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}

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
