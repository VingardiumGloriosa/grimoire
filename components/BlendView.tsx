import type { HerbBlend, Element } from "@/lib/types"
import { Leaf, Globe } from "lucide-react"

interface BlendViewProps {
  blend: HerbBlend
}

const ELEMENTS: Element[] = ["Fire", "Water", "Earth", "Air", "Spirit"]

const ELEMENT_BAR_COLORS: Record<Element, string> = {
  Fire: "bg-blush",
  Water: "bg-[var(--color-secondary)]",
  Earth: "bg-forest",
  Air: "bg-[var(--color-accent)]",
  Spirit: "bg-[var(--color-text-muted)]",
}

const ELEMENT_BADGE_STYLES: Record<string, string> = {
  Fire: "bg-blush/15 text-blush",
  Water: "bg-[var(--color-primary-subtle)] text-[var(--color-secondary)]",
  Earth: "bg-sage-mist text-forest",
  Air: "bg-gold-subtle text-umber",
  Spirit: "bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]",
}

export default function BlendView({ blend }: BlendViewProps) {
  const maxElementCount = Math.max(
    ...Object.values(blend.elemental_balance),
    1
  )

  const formattedDate = new Date(blend.created_at).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  )

  return (
    <div className="max-w-content mx-auto space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <h1 className="font-display text-4xl text-[var(--color-text)]">
          {blend.name}
        </h1>
        <p className="font-body text-sm text-[var(--color-text-muted)]">
          {formattedDate}
        </p>
      </header>

      {/* Intention */}
      {blend.intention && (
        <div className="border-l-2 border-gold pl-4">
          <p className="font-body text-lg italic text-[var(--color-text)] leading-relaxed">
            {blend.intention}
          </p>
        </div>
      )}

      {/* Herbs */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl text-[var(--color-text)]">
          Herbs
        </h2>
        <div className="space-y-2">
          {blend.herbs.map((herb) => {
            const badgeStyle =
              ELEMENT_BADGE_STYLES[herb.element] || ELEMENT_BADGE_STYLES.Spirit
            return (
              <div
                key={herb.herb_id}
                className="flex items-center gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4"
              >
                <div className="flex-1 font-body">
                  <p className="font-medium text-[var(--color-text)]">
                    {herb.herb_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${badgeStyle}`}
                    >
                      <Leaf size={10} strokeWidth={1.5} />
                      {herb.element}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-raised)] px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] border border-[var(--color-border)]">
                      <Globe size={10} strokeWidth={1.5} />
                      {herb.planetary_ruler}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Elemental Balance */}
      <section className="space-y-4">
        <div className="divider-ornament mb-2" aria-hidden="true" />
        <h2 className="font-display text-2xl text-[var(--color-text)]">
          Elemental Balance
        </h2>
        <div className="space-y-2">
          {ELEMENTS.map((element) => {
            const count = blend.elemental_balance[element] || 0
            if (count === 0) return null
            const widthPercent =
              maxElementCount > 0 ? (count / maxElementCount) * 100 : 0
            return (
              <div key={element} className="flex items-center gap-3">
                <span className="font-body text-xs w-14 text-right text-[var(--color-text-muted)]">
                  {element}
                </span>
                <div className="flex-1 h-4 bg-[var(--color-surface-raised)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${ELEMENT_BAR_COLORS[element]}`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <span className="font-body text-xs w-6 text-[var(--color-text-muted)]">
                  {count}
                </span>
              </div>
            )
          }).filter(Boolean)}
        </div>
      </section>

      {/* Planetary Influences */}
      {Object.keys(blend.planetary_influences).length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-[var(--color-text)]">
            Planetary Influences
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(blend.planetary_influences)
              .sort(([, a], [, b]) => b - a)
              .map(([planet, count]) => (
                <span
                  key={planet}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-raised)] px-3 py-1 text-xs font-medium text-[var(--color-text)] border border-[var(--color-border)]"
                >
                  <Globe size={10} strokeWidth={1.5} />
                  {planet}
                  {count > 1 && (
                    <span className="text-[var(--color-accent)] font-semibold">
                      x{count}
                    </span>
                  )}
                </span>
              ))}
          </div>
        </section>
      )}

      {/* Notes */}
      {blend.notes && (
        <section className="space-y-3 pt-4">
          <div className="divider-ornament mb-6" aria-hidden="true" />
          <h2 className="font-display text-2xl text-[var(--color-text)]">
            Notes
          </h2>
          <p className="font-body text-base text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
            {blend.notes}
          </p>
        </section>
      )}
    </div>
  )
}
