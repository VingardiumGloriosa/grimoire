"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { HerbBlend } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Trash2 } from "lucide-react"

interface BlendListProps {
  blends: HerbBlend[]
}

export default function BlendList({
  blends: initialBlends,
}: BlendListProps) {
  const router = useRouter()
  const [blends, setBlends] = useState(initialBlends)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(e: React.MouseEvent, blendId: string) {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm("Delete this blend? This cannot be undone.")) return

    setDeletingId(blendId)
    try {
      const res = await fetch(`/api/herbology?id=${blendId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setBlends((prev) => prev.filter((b) => b.id !== blendId))
        router.refresh()
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (blends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Leaf
          className="h-12 w-12 text-[var(--color-text-faint)]"
          strokeWidth={1.5}
        />
        <p className="font-body text-lg text-[var(--color-text-muted)]">
          Your herbal blends are waiting.
        </p>
        <Link
          href="/herbology/blends/new"
          className="font-body text-sm text-forest hover:text-forest-deep underline underline-offset-4"
        >
          Create your first blend
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {blends.map((blend) => {
        const formattedDate = new Date(blend.created_at).toLocaleDateString(
          "en-GB",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )

        return (
          <Link key={blend.id} href={`/herbology/blends/${blend.id}`}>
            <Card className="group surface-gradient hover-glow border border-[var(--color-border)] border-l-[3px] border-l-[var(--color-secondary)] rounded-lg transition-all duration-200 hover:shadow-glow-gold hover:border-l-[var(--color-secondary)] hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-2">
                  {/* Blend Name + Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-xl text-[var(--color-text)] group-hover:text-forest transition-colors">
                      {blend.name}
                    </h3>
                    <button
                      onClick={(e) => handleDelete(e, blend.id)}
                      disabled={deletingId === blend.id}
                      className="shrink-0 rounded-md p-1.5 text-[var(--color-text-faint)] opacity-0 transition-all hover:bg-blush/10 hover:text-blush group-hover:opacity-100 disabled:opacity-50"
                      title="Delete blend"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Date */}
                  <p className="font-body text-sm text-[var(--color-text-muted)]">
                    {formattedDate}
                  </p>

                  {/* Intention Preview */}
                  {blend.intention && (
                    <p className="font-body text-sm text-[var(--color-text)] italic leading-relaxed line-clamp-2">
                      {blend.intention}
                    </p>
                  )}

                  {/* Footer: Herb count */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      {blend.herbs.slice(0, 3).map((herb) => (
                        <span
                          key={herb.herb_id}
                          className="rounded-full bg-sage-mist px-2.5 py-0.5 text-xs font-medium text-forest"
                        >
                          {herb.herb_name}
                        </span>
                      ))}
                      {blend.herbs.length > 3 && (
                        <span className="font-body text-xs text-[var(--color-text-muted)]">
                          +{blend.herbs.length - 3} more
                        </span>
                      )}
                    </div>
                    <span className="font-body text-xs text-[var(--color-text-muted)]">
                      {blend.herbs.length}{" "}
                      {blend.herbs.length === 1 ? "herb" : "herbs"}
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
