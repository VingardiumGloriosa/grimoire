import Link from "next/link"
import type { Crystal } from "@/lib/types"

interface CrystalCardProps {
  crystal: Crystal
}

const ELEMENT_COLORS: Record<string, string> = {
  Fire: "bg-blush/15 text-blush",
  Water: "bg-[#1a3a4a]/15 text-[#2e7a9b]",
  Earth: "bg-gold-subtle text-umber",
  Air: "bg-sage-mist text-forest",
  Spirit: "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]",
}

const CHAKRA_COLORS: Record<string, string> = {
  Root: "bg-blush/15 text-blush",
  Sacral: "bg-gold-subtle text-umber",
  "Solar Plexus": "bg-gold-subtle text-[#9a7b2a]",
  Heart: "bg-sage-mist text-forest",
  Throat: "bg-[#1a3a4a]/15 text-[#2e7a9b]",
  "Third Eye": "bg-[#2a1a4a]/15 text-[#6a4a9b]",
  Crown: "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]",
}

export default function CrystalCard({ crystal }: CrystalCardProps) {
  return (
    <Link href={`/crystals/${crystal.id}`}>
      <div className="group surface-gradient hover-glow border border-[var(--color-border)] rounded-lg p-5 transition-all duration-200 hover:border-gold/60 hover:shadow-glow-gold hover:-translate-y-0.5 cursor-pointer">
        <div className="flex items-start gap-3">
          {/* Crystal Illustration or Color Swatch */}
          {crystal.image_path ? (
            <div
              className="mt-0.5 w-10 h-10 shrink-0 bg-[var(--color-secondary)] opacity-70 group-hover:opacity-100 transition-opacity"
              style={{ mask: `url(/${crystal.image_path}) center/contain no-repeat`, WebkitMask: `url(/${crystal.image_path}) center/contain no-repeat` }}
              aria-hidden="true"
            />
          ) : (
            <div
              className="mt-1 h-5 w-5 shrink-0 rounded-full border border-[var(--color-border)]"
              style={{ backgroundColor: crystal.color }}
              title={crystal.color}
            />
          )}

          <div className="min-w-0 space-y-2">
            {/* Name */}
            <h3 className="font-display text-lg text-[var(--color-text)] group-hover:text-[var(--color-secondary)] transition-colors leading-tight">
              {crystal.name}
            </h3>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${
                  ELEMENT_COLORS[crystal.element] ?? "bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]"
                }`}
              >
                {crystal.element}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${
                  CHAKRA_COLORS[crystal.chakra] ?? "bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]"
                }`}
              >
                {crystal.chakra}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
