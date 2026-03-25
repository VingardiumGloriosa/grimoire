import Link from "next/link"
import type { Crystal } from "@/lib/types"
import { ELEMENT_BADGE_STYLES } from "@/lib/design-tokens"
import { Check } from "lucide-react"

interface RitualPairingResultProps {
  stones: Crystal[]
  collectionIds: string[]
}

export default function RitualPairingResult({ stones, collectionIds }: RitualPairingResultProps) {
  if (stones.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="font-body text-[var(--color-text-muted)] text-lg">
          No stones found for this intention.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stones.map((stone) => {
        const inCollection = collectionIds.includes(stone.id)
        return (
          <Link key={stone.id} href={`/crystals/${stone.id}`}>
            <div className="group relative surface-gradient hover-glow border border-[var(--color-border)] rounded-lg p-5 transition-all duration-200 hover:border-gold/60 hover:shadow-glow-gold hover:-translate-y-0.5 cursor-pointer">
              {/* Ownership badge */}
              {inCollection && (
                <div className="absolute top-3 right-3 flex items-center justify-center h-6 w-6 rounded-full bg-forest text-parchment">
                  <Check size={14} strokeWidth={2} />
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Color Swatch */}
                <div
                  className="mt-1 h-5 w-5 shrink-0 rounded-full border border-[var(--color-border)]"
                  style={{ backgroundColor: stone.color }}
                  title={stone.color}
                />

                <div className="min-w-0 space-y-2">
                  <h3 className="font-display text-lg text-[var(--color-text)] group-hover:text-[var(--color-secondary)] transition-colors leading-tight">
                    {stone.name}
                  </h3>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${
                      ELEMENT_BADGE_STYLES[stone.element] ?? "bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]"
                    }`}
                  >
                    {stone.element}
                  </span>
                  {inCollection && (
                    <p className="font-body text-xs text-forest italic">
                      In your collection
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
