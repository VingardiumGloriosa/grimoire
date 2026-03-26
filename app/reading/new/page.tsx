'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { SpreadTemplate, SpreadPosition, ReadingCard, TarotCard, Orientation, Visibility } from '@/lib/types'
import type { User } from '@supabase/supabase-js'
import ReadingSetup from '@/components/ReadingSetup'
import CardPicker from '@/components/CardPicker'
import SpreadLayout from '@/components/SpreadLayout'
import PositionCard from '@/components/PositionCard'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Check, Loader2, LogIn } from 'lucide-react'

interface SetupData {
  spreadTemplate: SpreadTemplate
  intention: string
  mood: string
  date: string
  visibility: Visibility
}

interface PendingReading {
  spread_name: string
  spread_positions: SpreadPosition[]
  cards: ReadingCard[]
  intention: string | null
  date: string
  mood: string | null
  visibility: Visibility
  timestamp: number
}

const PENDING_READING_KEY = 'grimoire:pending-reading'
const PENDING_READING_MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours

type Step = 'setup' | 'cards' | 'review' | 'complete'

export default function NewReadingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('setup')
  const [spreads, setSpreads] = useState<SpreadTemplate[]>([])
  const [cards, setCards] = useState<TarotCard[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Auth state
  const [user, setUser] = useState<User | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Reading state
  const [setupData, setSetupData] = useState<SetupData | null>(null)
  const [selectedCards, setSelectedCards] = useState<ReadingCard[]>([])
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0)

  // Synthesis state (for unauthenticated complete step)
  const [synthesis, setSynthesis] = useState<string | null>(null)

  // Check auth state on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u)
      setAuthChecked(true)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Restore pending reading after login
  useEffect(() => {
    if (!authChecked || !user) return
    if (searchParams.get('restore') !== 'true') return

    const raw = localStorage.getItem(PENDING_READING_KEY)
    if (!raw) return

    try {
      const pending: PendingReading = JSON.parse(raw)

      // Check expiry
      if (Date.now() - pending.timestamp > PENDING_READING_MAX_AGE) {
        localStorage.removeItem(PENDING_READING_KEY)
        return
      }

      // Auto-save the pending reading
      setSubmitting(true)
      fetch('/api/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spread_name: pending.spread_name,
          spread_positions: pending.spread_positions,
          cards: pending.cards,
          intention: pending.intention,
          date: pending.date,
          mood: pending.mood,
          visibility: pending.visibility,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to save')
          return res.json()
        })
        .then((data) => {
          localStorage.removeItem(PENDING_READING_KEY)
          router.push(`/reading/${data.id}`)
        })
        .catch(() => {
          setSubmitting(false)
          setSubmitError('Failed to save your reading. Please try again.')
          localStorage.removeItem(PENDING_READING_KEY)
        })
    } catch {
      localStorage.removeItem(PENDING_READING_KEY)
    }
  }, [authChecked, user, searchParams, router])

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
    setSubmitError(null)

    const readingPayload = {
      spread_name: setupData.spreadTemplate.name,
      spread_positions: setupData.spreadTemplate.positions,
      cards: selectedCards,
      intention: setupData.intention || null,
      date: setupData.date,
      mood: setupData.mood || null,
      visibility: setupData.visibility,
    }

    try {
      if (user) {
        // Authenticated: save directly
        const response = await fetch('/api/readings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(readingPayload),
        })

        if (!response.ok) throw new Error('Failed to save reading')

        const data = await response.json()
        router.push(`/reading/${data.id}`)
      } else {
        // Unauthenticated: get synthesis only, show inline
        const response = await fetch('/api/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spread_name: readingPayload.spread_name,
            cards: readingPayload.cards,
            intention: readingPayload.intention,
            mood: readingPayload.mood,
          }),
        })

        if (!response.ok) throw new Error('Failed to generate interpretation')

        const data = await response.json()
        setSynthesis(data.synthesis)
        setStep('complete')
        setSubmitting(false)
      }
    } catch {
      setSubmitting(false)
      setSubmitError('Something went wrong. Please try again.')
    }
  }

  const handleSaveReading = () => {
    if (!setupData) return

    const pending: PendingReading = {
      spread_name: setupData.spreadTemplate.name,
      spread_positions: setupData.spreadTemplate.positions,
      cards: selectedCards,
      intention: setupData.intention || null,
      date: setupData.date,
      mood: setupData.mood || null,
      visibility: setupData.visibility,
      timestamp: Date.now(),
    }

    localStorage.setItem(PENDING_READING_KEY, JSON.stringify(pending))
    router.push(`/auth?redirect=${encodeURIComponent('/reading/new?restore=true')}`)
  }

  // Render synthesis paragraphs with **bold** markdown
  function renderWithBold(text: string) {
    const parts = text.split(/\*\*(.+?)\*\*/g)
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    )
  }

  if (loading || (searchParams.get('restore') === 'true' && !authChecked)) {
    return (
      <main className="max-w-reading mx-auto px-6 py-10 flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
      </main>
    )
  }

  // Show a loading state while restoring a pending reading
  if (searchParams.get('restore') === 'true' && user && submitting) {
    return (
      <main className="max-w-reading mx-auto px-6 py-10 flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
        <p className="font-body text-sm text-[var(--color-text-muted)]">Saving your reading...</p>
      </main>
    )
  }

  const synthesisParagraphs = synthesis
    ? synthesis.split('\n\n').filter((p) => p.trim())
    : []

  const sortedCards = [...selectedCards].sort(
    (a, b) => a.position_order - b.position_order
  )

  return (
    <main className="max-w-content mx-auto px-6 sm:px-10 py-10">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8 font-body text-sm text-[var(--color-text-muted)]">
        <span className={step === 'setup' ? 'text-forest font-medium' : ''}>Setup</span>
        <span className="text-[var(--color-border)]">/</span>
        <span className={step === 'cards' ? 'text-forest font-medium' : ''}>Cards</span>
        <span className="text-[var(--color-border)]">/</span>
        <span className={step === 'review' ? 'text-forest font-medium' : ''}>Review</span>
        {step === 'complete' && (
          <>
            <span className="text-[var(--color-border)]">/</span>
            <span className="text-forest font-medium">Reading</span>
          </>
        )}
      </div>

      {/* Setup Step */}
      {step === 'setup' && (
        <ReadingSetup
          spreads={spreads}
          onComplete={handleSetupComplete}
          isAuthenticated={!!user}
        />
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
                      src={card.image_path}
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
                  {user ? 'Saving...' : 'Generating...'}
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

      {/* Complete Step — unauthenticated reading result */}
      {step === 'complete' && setupData && synthesis && (
        <div className="max-w-reading mx-auto space-y-10">
          {/* Header */}
          <header className="space-y-3">
            <h1 className="font-display text-4xl text-[var(--color-text)]">
              {setupData.spreadTemplate.name}
            </h1>
            <div className="flex items-center gap-3">
              <span className="font-body text-sm text-[var(--color-text-muted)]">
                {new Date(setupData.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              {setupData.mood && (
                <span className="rounded-full bg-sage-mist dark:bg-linen px-3 py-0.5 text-xs font-medium uppercase tracking-wider text-forest">
                  {setupData.mood}
                </span>
              )}
            </div>
          </header>

          {/* Intention */}
          {setupData.intention && (
            <div className="border-l-2 border-gold pl-4">
              <p className="font-body text-lg italic text-[var(--color-text)] leading-relaxed">
                {setupData.intention}
              </p>
            </div>
          )}

          {/* Synthesis */}
          {synthesisParagraphs.length > 0 && (
            <section className="space-y-4">
              <div className="divider-ornament mb-2" aria-hidden="true" />
              <h2 className="font-display text-2xl text-[var(--color-text)]">Synthesis</h2>
              <div className="space-y-4">
                {synthesisParagraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className="font-body text-lg leading-relaxed text-[var(--color-text)]"
                  >
                    {renderWithBold(paragraph)}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Cards */}
          <section className="space-y-6">
            <h2 className="font-display text-2xl text-[var(--color-text)]">The Cards</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {sortedCards.map((card) => (
                <PositionCard key={card.card_id} card={card} />
              ))}
            </div>
          </section>

          {/* Save CTA */}
          <section className="pt-8">
            <div className="divider-ornament mb-6" aria-hidden="true" />
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 text-center space-y-4">
              <h3 className="font-display text-xl text-[var(--color-text)]">
                Keep this reading?
              </h3>
              <p className="font-body text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
                Sign in to save this reading to your journal, add personal notes, and revisit it anytime.
              </p>
              <Button
                onClick={handleSaveReading}
                className="bg-forest text-parchment hover:bg-forest-deep font-body"
              >
                <LogIn size={16} strokeWidth={1.5} className="mr-2" />
                Sign in to save
              </Button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
