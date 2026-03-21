"use client"

import { useState, useMemo } from "react"
import type { TarotCard, Orientation } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Search, ArrowUp, ArrowDown } from "lucide-react"

interface CardPickerProps {
  cards: TarotCard[]
  onSelect: (card: TarotCard, orientation: Orientation) => void
  selectedCardIds: string[]
}

type SuitFilter = "all" | "major" | "Cups" | "Swords" | "Wands" | "Pentacles"

const SUIT_FILTERS: { value: SuitFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "major", label: "Major" },
  { value: "Cups", label: "Cups" },
  { value: "Swords", label: "Swords" },
  { value: "Wands", label: "Wands" },
  { value: "Pentacles", label: "Pentacles" },
]

export default function CardPicker({
  cards,
  onSelect,
  selectedCardIds,
}: CardPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [suitFilter, setSuitFilter] = useState<SuitFilter>("all")
  const [pendingCard, setPendingCard] = useState<TarotCard | null>(null)
  const [orientation, setOrientation] = useState<Orientation>("upright")

  const filteredCards = useMemo(() => {
    let result = cards

    // Suit / arcana filter
    if (suitFilter === "major") {
      result = result.filter((c) => c.arcana === "Major Arcana")
    } else if (suitFilter !== "all") {
      result = result.filter((c) => c.suit === suitFilter)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((c) => c.name.toLowerCase().includes(query))
    }

    return result
  }, [cards, searchQuery, suitFilter])

  function handleCardClick(card: TarotCard) {
    if (selectedCardIds.includes(card.id)) return
    setPendingCard(card)
    setOrientation("upright")
  }

  function handleConfirm() {
    if (!pendingCard) return
    onSelect(pendingCard, orientation)
    setPendingCard(null)
    setSearchQuery("")
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-faint)]"
          strokeWidth={1.5}
        />
        <Input
          type="text"
          placeholder="Search by card name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)]"
        />
      </div>

      {/* Suit filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {SUIT_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setSuitFilter(f.value)}
            className={`rounded-full px-3 py-1 font-body text-xs transition-colors ${
              suitFilter === f.value
                ? "bg-forest text-parchment"
                : "bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] hover:text-charcoal border border-[var(--color-border)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Card Grid (compact) */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3 max-h-[400px] overflow-y-auto pr-1">
        {filteredCards.map((card) => {
          const isSelected = selectedCardIds.includes(card.id)
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={isSelected}
              className={`group text-left rounded-md border overflow-hidden transition-all duration-200 ${
                isSelected
                  ? "opacity-40 cursor-not-allowed border-[var(--color-border)]"
                  : "border-[var(--color-border)] hover:border-gold hover:shadow-glow-gold hover:-translate-y-0.5 surface-gradient"
              }`}
            >
              <img
                src={card.image_path}
                alt={card.name}
                className="w-full object-cover"
                style={{ aspectRatio: "2/3" }}
              />
              <div className="p-2">
                <p className="font-body text-xs font-semibold text-charcoal leading-tight truncate">
                  {card.name}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {filteredCards.length === 0 && (
        <div className="py-8 text-center">
          <p className="font-body text-warm-grey">No cards match your search.</p>
        </div>
      )}

      {/* Orientation Selection Dialog */}
      <Dialog
        open={pendingCard !== null}
        onOpenChange={(open) => {
          if (!open) setPendingCard(null)
        }}
      >
        {pendingCard && (
          <DialogContent className="max-w-sm bg-[var(--color-surface)]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-charcoal">
                {pendingCard.name}
              </DialogTitle>
              <DialogDescription className="font-body text-warm-grey">
                Choose the card&apos;s orientation.
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-center py-4">
              <img
                src={pendingCard.image_path}
                alt={pendingCard.name}
                className={`w-36 rounded-md transition-transform duration-300 ${
                  orientation === "reversed" ? "rotate-180" : ""
                }`}
                style={{ aspectRatio: "2/3" }}
              />
            </div>

            {/* Orientation Toggle */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setOrientation("upright")}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-body transition-colors ${
                  orientation === "upright"
                    ? "bg-forest text-parchment"
                    : "bg-[var(--color-surface-raised)] text-charcoal border border-[var(--color-border)]"
                }`}
              >
                <ArrowUp className="h-4 w-4" strokeWidth={1.5} />
                Upright
              </button>
              <button
                onClick={() => setOrientation("reversed")}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-body transition-colors ${
                  orientation === "reversed"
                    ? "bg-blush text-parchment"
                    : "bg-[var(--color-surface-raised)] text-charcoal border border-[var(--color-border)]"
                }`}
              >
                <ArrowDown className="h-4 w-4" strokeWidth={1.5} />
                Reversed
              </button>
            </div>

            <DialogFooter className="mt-4">
              <Button
                onClick={handleConfirm}
                className="w-full bg-forest text-parchment hover:bg-forest-deep font-body"
              >
                Confirm Selection
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
