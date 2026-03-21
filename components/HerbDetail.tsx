import type { Herb } from "@/lib/types"
import {
  Leaf,
  Globe,
  Sparkles,
  AlertTriangle,
  Sprout,
} from "lucide-react"

interface HerbDetailProps {
  herb: Herb
}

const ELEMENT_STYLES: Record<string, string> = {
  Fire: "bg-blush/15 text-blush",
  Water: "bg-[var(--color-primary-subtle)] text-[var(--color-secondary)]",
  Earth: "bg-sage-mist text-forest",
  Air: "bg-gold-subtle text-umber",
  Spirit: "bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]",
}

export default function HerbDetail({ herb }: HerbDetailProps) {
  const elementStyle = ELEMENT_STYLES[herb.element] || ELEMENT_STYLES.Spirit

  return (
    <div className="max-w-content mx-auto space-y-10">
      {/* Illustration */}
      {herb.image_path && (
        <div className="flex justify-center">
          <div
            className="w-32 h-32 bg-[var(--color-secondary)] opacity-80"
            style={{ mask: `url(/${herb.image_path}) center/contain no-repeat`, WebkitMask: `url(/${herb.image_path}) center/contain no-repeat` }}
            role="img"
            aria-label={herb.name}
          />
        </div>
      )}

      {/* Header */}
      <header className="space-y-3">
        <h1 className="font-display text-4xl text-[var(--color-text)]">
          {herb.name}
        </h1>
        <p className="font-body text-lg italic text-[var(--color-text-muted)]">
          {herb.latin_name}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider ${elementStyle}`}
          >
            <Leaf size={12} strokeWidth={1.5} />
            {herb.element}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-raised)] px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] border border-[var(--color-border)]">
            <Globe size={12} strokeWidth={1.5} />
            {herb.planetary_ruler}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-subtle px-3 py-1 text-xs font-medium uppercase tracking-wider text-umber">
            <Sparkles size={12} strokeWidth={1.5} />
            {herb.chakra}
          </span>
        </div>
      </header>

      {/* Description */}
      <section className="space-y-2">
        <h2 className="font-display text-2xl text-[var(--color-text)]">
          Description
        </h2>
        <p className="font-body text-lg leading-relaxed text-[var(--color-text)]">
          {herb.description}
        </p>
      </section>

      {/* Magical Uses */}
      {herb.magical_uses.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-[var(--color-text)]">
            Magical Uses
          </h2>
          <ul className="space-y-2">
            {herb.magical_uses.map((use, i) => (
              <li
                key={i}
                className="flex items-start gap-2 font-body text-base leading-relaxed text-[var(--color-text)]"
              >
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-secondary)] shrink-0" />
                {use}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Medicinal Notes */}
      {herb.medicinal_notes.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-[var(--color-text)]">
            Medicinal Notes
          </h2>
          <ul className="space-y-2">
            {herb.medicinal_notes.map((note, i) => (
              <li
                key={i}
                className="flex items-start gap-2 font-body text-base leading-relaxed text-[var(--color-text)]"
              >
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Warnings */}
      {herb.warnings.length > 0 && (
        <section className="space-y-3">
          <div className="surface-gradient border border-blush/30 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} strokeWidth={1.5} className="text-blush" />
              <h2 className="font-display text-xl text-blush">
                Warnings
              </h2>
            </div>
            <ul className="space-y-2">
              {herb.warnings.map((warning, i) => (
                <li
                  key={i}
                  className="font-body text-sm leading-relaxed text-[var(--color-text)]"
                >
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Folklore */}
      {herb.folklore && (
        <section className="space-y-2">
          <div className="divider-ornament mb-2" aria-hidden="true" />
          <h2 className="font-display text-2xl text-[var(--color-text)]">
            Folklore
          </h2>
          <p className="font-body text-lg italic leading-relaxed text-[var(--color-text-muted)]">
            {herb.folklore}
          </p>
        </section>
      )}

      {/* Correspondences */}
      {(herb.correspondences.deities.length > 0 ||
        herb.correspondences.zodiac.length > 0 ||
        herb.correspondences.festivals.length > 0) && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-[var(--color-text)]">
            Correspondences
          </h2>

          {herb.correspondences.deities.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Deities
              </h3>
              <div className="flex flex-wrap gap-2">
                {herb.correspondences.deities.map((deity) => (
                  <span
                    key={deity}
                    className="rounded-full bg-[var(--color-surface-raised)] px-3 py-1 text-xs font-medium text-[var(--color-text)] border border-[var(--color-border)]"
                  >
                    {deity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {herb.correspondences.zodiac.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Zodiac
              </h3>
              <div className="flex flex-wrap gap-2">
                {herb.correspondences.zodiac.map((sign) => (
                  <span
                    key={sign}
                    className="rounded-full bg-gold-subtle px-3 py-1 text-xs font-medium text-umber"
                  >
                    {sign}
                  </span>
                ))}
              </div>
            </div>
          )}

          {herb.correspondences.festivals.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Festivals
              </h3>
              <div className="flex flex-wrap gap-2">
                {herb.correspondences.festivals.map((festival) => (
                  <span
                    key={festival}
                    className="rounded-full bg-sage-mist px-3 py-1 text-xs font-medium text-forest"
                  >
                    {festival}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Growing Season */}
      {herb.growing_season && (
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Sprout size={18} strokeWidth={1.5} className="text-[var(--color-secondary)]" />
            <h2 className="font-display text-2xl text-[var(--color-text)]">
              Growing Season
            </h2>
          </div>
          <p className="font-body text-base leading-relaxed text-[var(--color-text)]">
            {herb.growing_season}
          </p>
        </section>
      )}
    </div>
  )
}
