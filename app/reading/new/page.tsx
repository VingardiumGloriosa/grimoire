'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { SpreadTemplate, SpreadPosition, ReadingCard, TarotCard, Orientation, Visibility } from '@/lib/types'
import ReadingSetup from '@/components/ReadingSetup'
import CardPicker from '@/components/CardPicker'
import SpreadLayout from '@/components/SpreadLayout'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'

interface SetupData {
  spreadTemplate: SpreadTemplate
  intention: string
  mood: string
  date: string
  visibility: Visibility
}

type Step = 'setup' | 'cards' | 'review'

export default function NewReadingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('setup')
  const [spreads, setSpreads] = useState<SpreadTemplate[]>([])
  const [cards, setCards] = useState<TarotCard[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Reading state
  const [setupData, setSetupData] = useState<SetupData | null>(null)
  const [selectedCards, setSelectedCards] = useState<ReadingCard[]>([])
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0)

  // Fetch spreads and cards on mount
  useEffect(() => {
    async function fetchData() {
      const [spreadsRes, cardsRes] = await Promise.all([
        supabase.from('tarot_spread_templates').select('*').order('created_at'),
        supabase.from('tarot_cards').select('*').order('number'),
      ])
      setSpreads((spreadsRes.data as SpreadTemplate[]) || [])
      setCards((cardsRes.data as TarotCard[]) || [])
      setLoading(false)
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const positions: SpreadPosition[] = setupData
    ? [...setupData.spreadTemplate.positions].sort((a, b) => a.order - b.order)
    : []

  const currentPosition = positions[currentPositionIndex] || null

  const handleSetupComplete = useCallback((data: SetupData) => {
    setSetupData(data)
    setSelectedCards([])
    setCurrentPositionIndex(0)
    setStep('cards')
  }, [])

  const handleCardSelect = useCallback(
    (card: TarotCard, orientation: Orientation) => {
      if (!currentPosition) return

      const readingCard: ReadingCard = {
        card_id: card.id,
        card_name: card.name,
        position_label: currentPosition.label,
        position_order: currentPosition.order,
        orientation,
        image_path: card.image_path,
        keywords: card.keywords,
        meanings: card.meanings,
        fortune_telling: card.fortune_telling,
        questions_to_ask: card.questions_to_ask,
        archetype: card.archetype,
        numerology: card.numerology,
        elemental: card.elemental,
      }

      setSelectedCards((prev) => {
        const updated = [...prev]
        // Replace if already selected for this position, otherwise add
        const existingIndex = updated.findIndex(
          (c) => c.position_label === currentPosition.label
        )
        if (existingIndex >= 0) {
          updated[existingIndex] = readingCard
        } else {
          updated.push(readingCard)
        }
        return updated
      })

      // Auto-advance to next unfilled position, or review if all filled
      const filledLabels = new Set(
        selectedCards.map((c) => c.position_label)
      )
      // Mark the current one as filled (since we just placed a card)
      filledLabels.add(currentPosition.label)

      if (filledLabels.size >= positions.length) {
        setStep('review')
        return
      }

      // Find the next unfilled position (wrapping around)
      for (let offset = 1; offset < positions.length; offset++) {
        const nextIndex = (currentPositionIndex + offset) % positions.length
        if (!filledLabels.has(positions[nextIndex].label)) {
          setCurrentPositionIndex(nextIndex)
          return
        }
      }
    },
    [currentPosition, currentPositionIndex, positions.length]
  )

  const handleSubmit = async () => {
    if (!setupData) return
    setSubmitting(true)

    try {
      const response = await fetch('/api/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spread_name: setupData.spreadTemplate.name,
          spread_positions: setupData.spreadTemplate.positions,
          cards: selectedCards,
          intention: setupData.intention || null,
          date: setupData.date,
          mood: setupData.mood || null,
          visibility: setupData.visibility,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save reading')
      }

      const data = await response.json()
      router.push(`/reading/${data.id}`)
    } catch {
      setSubmitting(false)
      setSubmitError('Failed to save reading. Please try again.')
    }
  }

  if (loading) {
    return (
      <main className="max-w-reading mx-auto px-6 py-10 flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
      </main>
    )
  }

  return (
    <main className="max-w-content mx-auto px-3 sm:px-6 py-10">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8 font-body text-sm text-[var(--color-text-muted)]">
        <span className={step === 'setup' ? 'text-forest font-medium' : ''}>Setup</span>
        <span className="text-[var(--color-border)]">/</span>
        <span className={step === 'cards' ? 'text-forest font-medium' : ''}>Cards</span>
        <span className="text-[var(--color-border)]">/</span>
        <span className={step === 'review' ? 'text-forest font-medium' : ''}>Review</span>
      </div>

      {/* Setup Step */}
      {step === 'setup' && (
        <ReadingSetup spreads={spreads} onComplete={handleSetupComplete} />
      )}

      {/* Card Selection Step */}
      {step === 'cards' && currentPosition && (
        <div>
          <div className="mb-6">
            <h1 className="font-display text-3xl mb-2">Select a Card</h1>
            <p className="font-body text-[var(--color-text-muted)]">
              Position {currentPositionIndex + 1} of {positions.length}:{' '}
              <span className="font-medium text-[var(--color-text)]">
                {currentPosition.label}
              </span>
            </p>
          </div>

          {/* Visual spread layout */}
          <div className="mb-6">
            <SpreadLayout
              positions={positions}
              selectedCards={selectedCards}
              activePositionIndex={currentPositionIndex}
              onPositionClick={(index) => setCurrentPositionIndex(index)}
            />
          </div>

          {/* Separator */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gold/30" />
            <span className="font-body text-xs uppercase tracking-widest text-[var(--color-text-faint)]">
              Choose a card
            </span>
            <div className="h-px flex-1 bg-gold/30" />
          </div>

          <CardPicker
            cards={cards}
            onSelect={handleCardSelect}
            selectedCardIds={selectedCards.map((c) => c.card_id)}
          />

          {/* Navigation */}
          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (currentPositionIndex > 0) {
                  setCurrentPositionIndex((prev) => prev - 1)
                } else {
                  setStep('setup')
                }
              }}
              className="font-body"
            >
              <ArrowLeft size={16} strokeWidth={1.5} className="mr-2" />
              Back
            </Button>

            {selectedCards.length === positions.length && (
              <Button
                onClick={() => setStep('review')}
                className="bg-forest text-parchment hover:bg-forest-deep font-body"
              >
                Review
                <ArrowRight size={16} strokeWidth={1.5} className="ml-2" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Review Step */}
      {step === 'review' && setupData && (
        <div>
          <h1 className="font-display text-3xl mb-6">Review Your Reading</h1>

          {/* Reading summary */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 font-body text-sm">
              <div>
                <span className="text-[var(--color-text-muted)]">Spread</span>
                <p className="font-medium">{setupData.spreadTemplate.name}</p>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">Date</span>
                <p className="font-medium">{setupData.date}</p>
              </div>
              {setupData.mood && (
                <div>
                  <span className="text-[var(--color-text-muted)]">Mood</span>
                  <p className="font-medium">{setupData.mood}</p>
                </div>
              )}
              {setupData.intention && (
                <div className="col-span-2">
                  <span className="text-[var(--color-text-muted)]">Intention</span>
                  <p className="font-medium italic">{setupData.intention}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-3 mb-8">
            {[...selectedCards]
              .sort((a, b) => a.position_order - b.position_order)
              .map((card) => (
                <div
                  key={card.position_label}
                  className="flex items-center gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4"
                >
                  <div className="w-12 h-18 rounded overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/cards/${card.image_path}`}
                      alt={card.card_name}
                      className={`w-full h-full object-cover ${card.orientation === 'reversed' ? 'rotate-180' : ''}`}
                    />
                  </div>
                  <div className="flex-1 font-body">
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {card.position_label}
                    </p>
                    <p className="font-medium">{card.card_name}</p>
                    <span
                      className={`inline-block mt-1 text-xs uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        card.orientation === 'upright'
                          ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]'
                          : 'bg-blush/15 text-blush'
                      }`}
                    >
                      {card.orientation}
                    </span>
                  </div>
                </div>
              ))}
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep('cards')}
              className="font-body"
            >
              <ArrowLeft size={16} strokeWidth={1.5} className="mr-2" />
              Edit Cards
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-forest text-parchment hover:bg-forest-deep font-body"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} strokeWidth={1.5} className="mr-2" />
                  Complete Reading
                </>
              )}
            </Button>
          </div>

          {submitError && (
            <p className="font-body text-sm text-blush italic text-center mt-3">
              {submitError}
            </p>
          )}
        </div>
      )}
    </main>
  )
}
