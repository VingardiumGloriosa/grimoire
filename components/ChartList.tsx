"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { BirthChart } from "@/lib/types"
import SignBadge from "@/components/SignBadge"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Trash2 } from "lucide-react"

interface ChartListProps {
  charts: BirthChart[]
}

export default function ChartList({ charts: initialCharts }: ChartListProps) {
  const router = useRouter()
  const [charts, setCharts] = useState(initialCharts)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(e: React.MouseEvent, chartId: string) {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm("Delete this chart? This cannot be undone.")) return

    setDeletingId(chartId)
    try {
      const res = await fetch(`/api/astrology/charts?id=${chartId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setCharts((prev) => prev.filter((c) => c.id !== chartId))
        router.refresh()
      }
    } finally {
      setDeletingId(null)
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
                      onClick={(e) => handleDelete(e, chart.id)}
                      disabled={deletingId === chart.id}
                      className="shrink-0 rounded-md p-1.5 text-[var(--color-text-faint)] opacity-0 transition-all hover:bg-blush/10 hover:text-blush group-hover:opacity-100 disabled:opacity-50"
                      title="Delete chart"
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
    </div>
  )
}
