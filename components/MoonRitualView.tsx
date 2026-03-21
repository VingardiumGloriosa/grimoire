import type { MoonRitual } from '@/lib/types'
import type { LucideIcon } from 'lucide-react'
import MoonPhaseIcon from '@/components/MoonPhaseIcon'
import {
  Sparkles,
  Heart,
  Activity,
  ShieldAlert,
  Gem,
  Leaf,
} from 'lucide-react'

interface MoonRitualViewProps {
  ritual: MoonRitual
}

// Approximate illumination for each phase (for the icon)
const PHASE_ILLUMINATION: Record<string, { illumination: number; isWaxing: boolean }> = {
  new_moon: { illumination: 0, isWaxing: true },
  waxing_crescent: { illumination: 0.2, isWaxing: true },
  first_quarter: { illumination: 0.5, isWaxing: true },
  waxing_gibbous: { illumination: 0.8, isWaxing: true },
  full_moon: { illumination: 1, isWaxing: false },
  waning_gibbous: { illumination: 0.8, isWaxing: false },
  last_quarter: { illumination: 0.5, isWaxing: false },
  waning_crescent: { illumination: 0.2, isWaxing: false },
}

function ChipList({ items, variant }: { items: string[]; variant: 'herb' | 'crystal' }) {
  const colorClass =
    variant === 'herb'
      ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]'
      : 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-full px-3 py-1 font-body text-xs ${colorClass}`}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function SectionList({
  icon: Icon,
  title,
  items,
}: {
  icon: LucideIcon
  title: string
  items: string[]
}) {
  if (items.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon size={16} strokeWidth={1.5} className="text-[var(--color-secondary)]" />
        <h4 className="font-body text-sm font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          {title}
        </h4>
      </div>
      <ul className="space-y-1 pl-6">
        {items.map((item, i) => (
          <li
            key={i}
            className="font-body text-sm text-[var(--color-text)] leading-relaxed list-disc"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function MoonRitualView({ ritual }: MoonRitualViewProps) {
  const phaseInfo = PHASE_ILLUMINATION[ritual.phase] ?? {
    illumination: 0.5,
    isWaxing: true,
  }

  return (
    <div
      id={ritual.phase}
      className="surface-gradient border border-[var(--color-border)] rounded-lg p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <MoonPhaseIcon
          illumination={phaseInfo.illumination}
          isWaxing={phaseInfo.isWaxing}
          size={48}
        />
        <div>
          <h3 className="font-display text-2xl text-[var(--color-text)]">
            {ritual.phase_label}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="font-body text-base text-[var(--color-text)] leading-relaxed">
        {ritual.description}
      </p>

      <div className="divider-ornament" aria-hidden="true" />

      {/* Ritual lists */}
      <div className="grid gap-6 sm:grid-cols-2">
        <SectionList icon={Sparkles} title="Rituals" items={ritual.rituals} />
        <SectionList icon={Heart} title="Intentions" items={ritual.intentions} />
        <SectionList icon={Activity} title="Activities" items={ritual.activities} />
        <SectionList icon={ShieldAlert} title="Avoid" items={ritual.avoid} />
      </div>

      {/* Herbs & Crystals */}
      {(ritual.herbs.length > 0 || ritual.crystals.length > 0) && (
        <div className="space-y-4 pt-2">
          {ritual.herbs.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Leaf size={16} strokeWidth={1.5} className="text-[var(--color-secondary)]" />
                <span className="font-body text-sm font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                  Herbs
                </span>
              </div>
              <ChipList items={ritual.herbs} variant="herb" />
            </div>
          )}
          {ritual.crystals.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Gem size={16} strokeWidth={1.5} className="text-[var(--color-accent)]" />
                <span className="font-body text-sm font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                  Crystals
                </span>
              </div>
              <ChipList items={ritual.crystals} variant="crystal" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
