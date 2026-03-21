"use client"

import type { SpreadPosition, ReadingCard } from "@/lib/types"

interface SpreadPositionSlotProps {
  position: SpreadPosition
  card: ReadingCard | undefined
  isActive: boolean
  onClick: () => void
}

export default function SpreadPositionSlot({
  position,
  card,
  isActive,
  onClick,
}: SpreadPositionSlotProps) {
  // Empty — not yet filled, not active
  if (!card && !isActive) {
    return (
      <button
        onClick={onClick}
        className="flex aspect-[2/3] w-full flex-col items-center justify-center rounded border border-gold/20 bg-gradient-to-b from-[var(--color-surface-raised)] to-[var(--color-accent-subtle)]/30 transition-colors hover:border-gold/40"
      >
        <span className="font-body text-[10px] font-medium text-[var(--color-text-faint)]">
          {position.order}
        </span>
      </button>
    )
  }

  // Active — currently selecting for this position
  if (!card && isActive) {
    return (
      <button
        onClick={onClick}
        className="flex aspect-[2/3] w-full flex-col items-center justify-center gap-0.5 rounded border-2 border-gold bg-[var(--color-accent-subtle)] animate-pulse-slow"
      >
        <span className="font-body text-[10px] font-semibold text-umber">
          {position.order}
        </span>
        <span className="px-0.5 text-center font-body text-[8px] font-medium leading-tight text-forest">
          {position.label}
        </span>
      </button>
    )
  }

  // Filled — card has been placed
  const isReversed = card!.orientation === "reversed"
  return (
    <button
      onClick={onClick}
      className={`relative aspect-[2/3] w-full overflow-hidden rounded transition-all ${
        isActive
          ? "ring-2 ring-gold ring-offset-1 ring-offset-[var(--color-bg)]"
          : "border border-[var(--color-border)] hover:ring-1 hover:ring-gold/40"
      }`}
    >
      <img
        src={card!.image_path}
        alt={card!.card_name}
        className={`h-full w-full object-cover ${isReversed ? "rotate-180" : ""}`}
      />
    </button>
  )
}
