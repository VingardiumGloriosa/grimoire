"use client"

import { useState, useMemo } from "react"
import type { TarotCard } from "@/lib/types"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Search } from "lucide-react"

type FilterTab = "all" | "Major Arcana" | "Wands" | "Cups" | "Swords" | "Pentacles"

const TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Major Arcana", label: "Major Arcana" },
  { value: "Wands", label: "Wands" },
  { value: "Cups", label: "Cups" },
  { value: "Swords", label: "Swords" },
  { value: "Pentacles", label: "Pentacles" },
]

interface CardLibraryGridProps {
  cards: TarotCard[]
}

export default function CardLibraryGrid({ cards }: CardLibraryGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all")
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null)

  const filteredCards = useMemo(() => {
    let result = cards

    // Apply arcana/suit filter
    if (activeFilter !== "all") {
      if (activeFilter === "Major Arcana") {
        result = result.filter((c) => c.arcana === "Major Arcana")
      } else {
        result = result.filter((c) => c.suit === activeFilter)
      }
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((c) => c.name.toLowerCase().includes(query))
    }

    return result
  }, [cards, activeFilter, searchQuery])

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-faint)]"
          strokeWidth={1.5}
        />
        <Input
          type="text"
          placeholder="Search cards by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)]"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-body transition-colors ${
              activeFilter === tab.value
                ? "bg-forest text-parchment"
                : "bg-[var(--color-surface)] text-charcoal border border-[var(--color-border)] hover:bg-linen"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
        {filteredCards.map((card) => (
          <button
            key={card.id}
            onClick={() => setSelectedCard(card)}
            className="group text-left rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden transition-all duration-200 hover:border-gold hover:shadow-[0_0_12px_rgba(196,163,90,0.2)] hover:-translate-y-0.5"
          >
            {/* Image area — 65% */}
            <div className="relative" style={{ paddingBottom: "97.5%" }}>
              {/* 65% of a 2/3 aspect container */}
              <img
                src={card.image_path}
                alt={card.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Info area — 35% */}
            <div className="p-4 space-y-2">
              <h3 className="font-display text-base text-charcoal leading-tight">
                {card.name}
              </h3>
              <div className="flex flex-wrap gap-1">
                {card.keywords.slice(0, 3).map((kw) => (
                  <span
                    key={kw}
                    className="rounded-sm bg-gold-subtle px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-umber"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredCards.length === 0 && (
        <div className="py-16 text-center">
          <p className="font-body text-warm-grey text-lg">
            No cards match your search.
          </p>
        </div>
      )}

      {/* Card Detail Dialog */}
      <Dialog
        open={selectedCard !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedCard(null)
        }}
      >
        {selectedCard && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[var(--color-surface)]">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-charcoal">
                {selectedCard.name}
              </DialogTitle>
              <DialogDescription className="font-body text-warm-grey">
                {selectedCard.arcana} &middot; {selectedCard.suit}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 sm:grid-cols-[200px_1fr]">
              {/* Card Image */}
              <div className="flex justify-center sm:justify-start">
                <img
                  src={selectedCard.image_path}
                  alt={selectedCard.name}
                  className="w-48 rounded-md"
                  style={{ aspectRatio: "2/3" }}
                />
              </div>

              {/* Card Details */}
              <div className="space-y-4">
                {/* Keywords */}
                <div className="flex flex-wrap gap-2">
                  {selectedCard.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-sm bg-gold-subtle px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-umber"
                    >
                      {kw}
                    </span>
                  ))}
                </div>

                {/* Light Meanings */}
                <div className="space-y-1">
                  <h4 className="font-body text-sm font-semibold text-forest uppercase tracking-wider">
                    Light Meanings
                  </h4>
                  <ul className="space-y-1">
                    {selectedCard.meanings.light.map((m, i) => (
                      <li
                        key={i}
                        className="font-body text-sm text-charcoal leading-relaxed"
                      >
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Shadow Meanings */}
                <div className="space-y-1">
                  <h4 className="font-body text-sm font-semibold text-blush uppercase tracking-wider">
                    Shadow Meanings
                  </h4>
                  <ul className="space-y-1">
                    {selectedCard.meanings.shadow.map((m, i) => (
                      <li
                        key={i}
                        className="font-body text-sm text-charcoal leading-relaxed"
                      >
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Fortune Telling */}
                {selectedCard.fortune_telling.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="font-body text-sm font-semibold text-warm-grey uppercase tracking-wider">
                      Fortune Telling
                    </h4>
                    <p className="font-body text-sm text-warm-grey italic leading-relaxed">
                      {selectedCard.fortune_telling.join(". ")}.
                    </p>
                  </div>
                )}

                {/* Questions to Ask */}
                {selectedCard.questions_to_ask.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="font-body text-sm font-semibold text-warm-grey uppercase tracking-wider">
                      Questions to Ask
                    </h4>
                    <ul className="space-y-1">
                      {selectedCard.questions_to_ask.map((q, i) => (
                        <li
                          key={i}
                          className="font-body text-sm text-warm-grey leading-relaxed"
                        >
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Esoteric Metadata */}
                {(selectedCard.archetype ||
                  selectedCard.numerology ||
                  selectedCard.elemental ||
                  selectedCard.mythical_spiritual) && (
                  <div className="border-t border-[var(--color-border)] pt-4 space-y-1">
                    {selectedCard.archetype && (
                      <p className="font-body text-sm text-warm-grey">
                        <span className="font-semibold">Archetype:</span>{" "}
                        {selectedCard.archetype}
                      </p>
                    )}
                    {selectedCard.numerology && (
                      <p className="font-body text-sm text-warm-grey">
                        <span className="font-semibold">Numerology:</span>{" "}
                        {selectedCard.numerology}
                      </p>
                    )}
                    {selectedCard.elemental && (
                      <p className="font-body text-sm text-warm-grey">
                        <span className="font-semibold">Elemental:</span>{" "}
                        {selectedCard.elemental}
                      </p>
                    )}
                    {selectedCard.mythical_spiritual && (
                      <p className="font-body text-sm text-warm-grey">
                        <span className="font-semibold">
                          Mythical/Spiritual:
                        </span>{" "}
                        {selectedCard.mythical_spiritual}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
