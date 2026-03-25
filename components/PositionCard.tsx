"use client"

import { useState } from "react"
import Image from "next/image"
import type { ReadingCard } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUp, ArrowDown } from "lucide-react"

interface PositionCardProps {
  card: ReadingCard
}

export default function PositionCard({ card }: PositionCardProps) {
  const isReversed = card.orientation === "reversed"
  const meanings = isReversed ? card.meanings.shadow : card.meanings.light
  const [showAllKeywords, setShowAllKeywords] = useState(false)
  const keywordLimit = 5
  const visibleKeywords = showAllKeywords ? card.keywords : card.keywords.slice(0, keywordLimit)
  const hasMoreKeywords = card.keywords.length > keywordLimit

  return (
    <Card className="surface-gradient border border-[var(--color-border)] border-t-2 border-t-gold/30 rounded-lg p-6">
      <CardContent className="p-0 space-y-4">
        {/* Card Image */}
        <div className="flex justify-center">
          <div className="w-48 overflow-hidden rounded-md">
            <Image
              src={card.image_path}
              alt={card.card_name}
              width={192}
              height={288}
              className={`w-full object-cover ${isReversed ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {/* Position Label */}
        <h3 className="font-display text-xl text-charcoal text-center">
          {card.position_label}
        </h3>

        {/* Card Name + Orientation Badge */}
        <div className="flex items-center justify-center gap-2">
          <span className="font-body text-lg font-semibold text-charcoal">
            {card.card_name}
          </span>
          {isReversed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blush/15 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider text-blush">
              <ArrowDown className="h-3 w-3" strokeWidth={1.5} />
              Reversed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-sage-mist dark:bg-linen px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider text-forest">
              <ArrowUp className="h-3 w-3" strokeWidth={1.5} />
              Upright
            </span>
          )}
        </div>

        {/* Meanings */}
        <p className="font-body text-lg italic leading-relaxed text-charcoal">
          {meanings.join(". ")}.
        </p>

        {/* Keywords */}
        <div className="flex flex-wrap gap-2">
          {visibleKeywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-sm bg-gold-subtle dark:bg-linen px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-umber dark:text-warm-grey"
            >
              {keyword}
            </span>
          ))}
          {hasMoreKeywords && (
            <button
              type="button"
              onClick={() => setShowAllKeywords(!showAllKeywords)}
              className="rounded-sm px-2 py-0.5 text-xs font-medium tracking-wider text-forest hover:text-forest-deep dark:text-gold dark:hover:text-gold/80 transition-colors"
            >
              {showAllKeywords ? "Show less" : `Show all ${card.keywords.length}`}
            </button>
          )}
        </div>

        {/* Fortune Telling */}
        {card.fortune_telling.length > 0 && (
          <div className="space-y-1">
            <h4 className="font-body text-sm font-semibold text-warm-grey uppercase tracking-wider">
              Fortune Telling
            </h4>
            <p className="font-body text-sm text-warm-grey leading-relaxed">
              {card.fortune_telling.join(". ")}.
            </p>
          </div>
        )}

        {/* Questions to Ask */}
        {card.questions_to_ask.length > 0 && (
          <div className="space-y-1">
            <h4 className="font-body text-sm font-semibold text-warm-grey uppercase tracking-wider">
              Questions to Ask
            </h4>
            <ul className="space-y-1">
              {card.questions_to_ask.map((question, i) => (
                <li
                  key={i}
                  className="font-body text-sm text-warm-grey leading-relaxed"
                >
                  {question}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Archetype / Numerology / Elemental (if present) */}
        {(card.archetype || card.numerology || card.elemental) && (
          <div className="border-t border-[var(--color-border)] pt-4 space-y-1">
            {card.archetype && (
              <p className="font-body text-sm text-warm-grey">
                <span className="font-semibold">Archetype:</span>{" "}
                {card.archetype}
              </p>
            )}
            {card.numerology && (
              <p className="font-body text-sm text-warm-grey">
                <span className="font-semibold">Numerology:</span>{" "}
                {card.numerology}
              </p>
            )}
            {card.elemental && (
              <p className="font-body text-sm text-warm-grey">
                <span className="font-semibold">Elemental:</span>{" "}
                {card.elemental}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
