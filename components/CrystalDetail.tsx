import type { Crystal } from "@/lib/types"
import { AlertTriangle } from "lucide-react"

interface CrystalDetailProps {
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

export default function CrystalDetail({ crystal }: CrystalDetailProps) {
  return (
    <div className="max-w-reading mx-auto space-y-8">
      {/* Illustration */}
      {crystal.image_path && (
        <div className="flex justify-center">
          <div
            className="w-32 h-32 bg-[var(--color-secondary)] opacity-80"
            style={{ mask: `url(/${crystal.image_path}) center/contain no-repeat`, WebkitMask: `url(/${crystal.image_path}) center/contain no-repeat` }}
            role="img"
            aria-label={crystal.name}
          />
        </div>
      )}

      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="h-6 w-6 rounded-full border border-[var(--color-border)]"
            style={{ backgroundColor: crystal.color }}
            title={crystal.color}
          />
          <h1 className="font-display text-4xl text-[var(--color-text)]">
            {crystal.name}
          </h1>
        </div>

        {/* Element + Chakra badges */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-medium uppercase tracking-wider ${
              ELEMENT_COLORS[crystal.element] ?? "bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]"
            }`}
          >
            {crystal.element}
          </span>
          {crystal.chakras.map((chakra) => (
            <span
              key={chakra}
              className={`rounded-full px-3 py-0.5 text-xs font-medium uppercase tracking-wider ${
                CHAKRA_COLORS[chakra] ?? "bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]"
              }`}
            >
              {chakra}
            </span>
          ))}
        </div>
      </header>

      {/* Description */}
      <section>
        <p className="font-body text-lg leading-relaxed text-[var(--color-text)]">
          {crystal.description}
        </p>
      </section>

      {/* Color & Hardness */}
      <section className="surface-gradient border border-[var(--color-border)] rounded-lg p-6 space-y-3">
        <div className="grid grid-cols-2 gap-4 font-body text-sm">
          <div>
            <span className="text-[var(--color-text-muted)] uppercase tracking-wider text-xs font-semibold">
              Color
            </span>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="h-4 w-4 rounded-full border border-[var(--color-border)]"
                style={{ backgroundColor: crystal.color }}
              />
              <p className="font-medium text-[var(--color-text)]">{crystal.color}</p>
            </div>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)] uppercase tracking-wider text-xs font-semibold">
              Hardness
            </span>
            <p className="mt-1 font-medium text-[var(--color-text)]">{crystal.hardness}</p>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)] uppercase tracking-wider text-xs font-semibold">
              Planetary Ruler
            </span>
            <p className="mt-1 font-medium text-[var(--color-text)]">{crystal.planetary_ruler}</p>
          </div>
        </div>
      </section>

      {/* Healing Properties */}
      {crystal.healing_properties.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-[var(--color-text)]">
            Healing Properties
          </h2>
          <ul className="space-y-2">
            {crystal.healing_properties.map((prop, i) => (
              <li
                key={i}
                className="font-body text-base text-[var(--color-text)] leading-relaxed pl-4 border-l-2 border-[var(--color-secondary)]"
              >
                {prop}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Magical Uses */}
      {crystal.magical_uses.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-[var(--color-text)]">
            Magical Uses
          </h2>
          <ul className="space-y-2">
            {crystal.magical_uses.map((use, i) => (
              <li
                key={i}
                className="font-body text-base text-[var(--color-text)] leading-relaxed pl-4 border-l-2 border-[var(--color-accent)]"
              >
                {use}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="divider-ornament" aria-hidden="true" />

      {/* Cleansing Methods */}
      {crystal.cleansing_methods.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-[var(--color-text)]">
            Cleansing Methods
          </h2>
          <div className="flex flex-wrap gap-2">
            {crystal.cleansing_methods.map((method) => (
              <span
                key={method}
                className="rounded-full bg-sage-mist px-3 py-1 text-sm font-body font-medium text-forest"
              >
                {method}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Zodiac Signs */}
      {crystal.zodiac_signs.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-[var(--color-text)]">
            Zodiac Signs
          </h2>
          <div className="flex flex-wrap gap-2">
            {crystal.zodiac_signs.map((sign) => (
              <span
                key={sign}
                className="rounded-full bg-gold-subtle px-3 py-1 text-sm font-body font-medium text-umber"
              >
                {sign}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Affirmation */}
      {crystal.affirmation && (
        <section className="surface-gradient border border-[var(--color-border)] border-l-[3px] border-l-gold rounded-lg p-6">
          <h2 className="font-display text-lg text-[var(--color-text)] mb-2">
            Affirmation
          </h2>
          <p className="font-body text-lg italic text-[var(--color-text)] leading-relaxed">
            &ldquo;{crystal.affirmation}&rdquo;
          </p>
        </section>
      )}

      {/* Cautions */}
      {crystal.cautions.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} strokeWidth={1.5} className="text-blush" />
            <h2 className="font-display text-2xl text-blush">Cautions</h2>
          </div>
          <div className="border border-blush/30 bg-blush/5 rounded-lg p-4 space-y-2">
            {crystal.cautions.map((caution, i) => (
              <p
                key={i}
                className="font-body text-sm text-[var(--color-text)] leading-relaxed"
              >
                {caution}
              </p>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
