import Link from "next/link"
import type { Herb } from "@/lib/types"
import { Leaf, Globe, Sparkles } from "lucide-react"

interface HerbCardProps {
  herb: Herb
}

const ELEMENT_STYLES: Record<string, string> = {
  Fire: "bg-blush/15 text-blush",
  Water: "bg-[var(--color-primary-subtle)] text-[var(--color-secondary)]",
  Earth: "bg-sage-mist text-forest",
  Air: "bg-gold-subtle text-umber",
  Spirit: "bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]",
}

export default function HerbCard({ herb }: HerbCardProps) {
  const elementStyle = ELEMENT_STYLES[herb.element] || ELEMENT_STYLES.Spirit

  return (
    <Link href={`/herbology/${herb.id}`}>
      <div className="group surface-gradient hover-glow border border-[var(--color-border)] rounded-lg p-6 transition-all duration-200 hover:border-gold/60 hover:shadow-glow-gold hover:-translate-y-0.5 cursor-pointer h-full">
        <div className="flex items-start gap-3">
          {/* Herb Illustration */}
          {herb.image_path && (
            <div
              className="w-10 h-10 shrink-0 bg-[var(--color-secondary)] opacity-70 group-hover:opacity-100 transition-opacity"
              style={{ mask: `url(/${herb.image_path}) center/contain no-repeat`, WebkitMask: `url(/${herb.image_path}) center/contain no-repeat` }}
              aria-hidden="true"
            />
          )}

          <div className="space-y-3 min-w-0">
          {/* Herb Name */}
          <h3 className="font-display text-lg text-[var(--color-text)] group-hover:text-forest transition-colors">
            {herb.name}
          </h3>

          {/* Latin Name */}
          <p className="font-body text-sm italic text-[var(--color-text-muted)]">
            {herb.latin_name}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            {/* Element Badge */}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${elementStyle}`}
            >
              <Leaf size={10} strokeWidth={1.5} />
              {herb.element}
            </span>

            {/* Planet Badge */}
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-raised)] px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] border border-[var(--color-border)]">
              <Globe size={10} strokeWidth={1.5} />
              {herb.planetary_ruler}
            </span>

            {/* Chakra Badge */}
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-subtle px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider text-umber">
              <Sparkles size={10} strokeWidth={1.5} />
              {herb.chakra}
            </span>
          </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
