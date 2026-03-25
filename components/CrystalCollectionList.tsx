"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Crystal, CrystalCollectionEntry } from "@/lib/types"
import { ELEMENT_BADGE_STYLES } from "@/lib/design-tokens"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ConfirmDialog from "@/components/ConfirmDialog"
import { Gem, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface CollectionEntryWithStone extends CrystalCollectionEntry {
  crystals_stones: Crystal
}

interface CrystalCollectionListProps {
  entries: CollectionEntryWithStone[]
}

export default function CrystalCollectionList({ entries: initialEntries }: CrystalCollectionListProps) {
  const router = useRouter()
  const [entries, setEntries] = useState(initialEntries)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  function handleRemoveClick(e: React.MouseEvent, entryId: string) {
    e.preventDefault()
    e.stopPropagation()
    setDeleteTarget(entryId)
  }

  async function confirmRemove() {
    if (!deleteTarget) return

    setDeletingId(deleteTarget)
    try {
      const res = await fetch(`/api/crystals/collection?id=${deleteTarget}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setEntries((prev) => prev.filter((entry) => entry.id !== deleteTarget))
        router.refresh()
        toast.success("Crystal removed from collection")
      } else {
        toast.error("Failed to remove crystal")
      }
    } catch {
      toast.error("Failed to remove crystal")
    } finally {
      setDeletingId(null)
      setDeleteTarget(null)
    }
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Gem
          className="h-12 w-12 text-[var(--color-text-faint)]"
          strokeWidth={1.5}
        />
        <p className="font-body text-lg text-[var(--color-text-muted)]">
          Your crystal collection is waiting.
        </p>
        <Link
          href="/crystals"
          className="font-body text-sm text-[var(--color-secondary)] hover:text-[var(--color-primary)] underline underline-offset-4"
        >
          Browse the crystal library
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const crystal = entry.crystals_stones
        return (
          <Link key={entry.id} href={`/crystals/${crystal.id}`}>
            <Card className="group surface-gradient hover-glow border border-[var(--color-border)] border-l-[3px] border-l-[var(--color-accent)] rounded-lg transition-all duration-200 hover:shadow-glow-gold hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Color Swatch */}
                  <div
                    className="mt-1 h-6 w-6 shrink-0 rounded-full border border-[var(--color-border)]"
                    style={{ backgroundColor: crystal.color }}
                    title={crystal.color}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-display text-xl text-[var(--color-text)] group-hover:text-[var(--color-secondary)] transition-colors">
                      {crystal.name}
                    </h3>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${
                          ELEMENT_BADGE_STYLES[crystal.element] ?? "bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]"
                        }`}
                      >
                        {crystal.element}
                      </span>
                    </div>

                    {entry.notes && (
                      <p className="font-body text-sm text-[var(--color-text-muted)] italic leading-relaxed line-clamp-2">
                        {entry.notes}
                      </p>
                    )}
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleRemoveClick(e, entry.id)}
                    disabled={deletingId === entry.id}
                    className="shrink-0 min-h-[44px] min-w-[44px] opacity-60 transition-opacity hover:opacity-100 text-[var(--color-text-faint)] hover:bg-blush/10 hover:text-blush disabled:opacity-50"
                    aria-label="Remove crystal"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Remove this crystal?"
        description="It will be removed from your collection."
        confirmLabel="Remove"
        onConfirm={confirmRemove}
        loading={deletingId === deleteTarget}
      />
    </div>
  )
}
