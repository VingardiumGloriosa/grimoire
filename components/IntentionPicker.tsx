"use client"

import type { CrystalIntention } from "@/lib/types"
import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface IntentionPickerProps {
  intentions: CrystalIntention[]
  onSelect: (intention: CrystalIntention) => void
}

function getIcon(iconName: string): LucideIcon {
  // Convert icon name to PascalCase to match Lucide exports
  const pascalName = iconName
    .split(/[-_\s]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("")

  const icons = LucideIcons as unknown as Record<string, LucideIcon>
  return icons[pascalName] ?? LucideIcons.Gem
}

export default function IntentionPicker({ intentions, onSelect }: IntentionPickerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {intentions.map((intention) => {
        const Icon = getIcon(intention.icon)
        return (
          <button
            key={intention.id}
            onClick={() => onSelect(intention)}
            className="group text-left surface-gradient hover-glow border border-[var(--color-border)] rounded-lg p-5 transition-all duration-200 hover:border-gold/60 hover:shadow-glow-gold hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-[var(--color-secondary)]">
                <Icon size={20} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 space-y-1">
                <h3 className="font-display text-lg text-[var(--color-text)] group-hover:text-[var(--color-secondary)] transition-colors">
                  {intention.name}
                </h3>
                <p className="font-body text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {intention.description}
                </p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
