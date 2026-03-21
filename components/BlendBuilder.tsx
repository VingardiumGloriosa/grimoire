"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import type { Herb, BlendHerb, Element } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import HerbCard from "@/components/HerbCard"
import {
  Search,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Loader2,
  Leaf,
  Globe,
} from "lucide-react"

interface BlendBuilderProps {
  herbs: Herb[]
}

type Step = "details" | "review" | "notes"

const ELEMENTS: Element[] = ["Fire", "Water", "Earth", "Air", "Spirit"]

const ELEMENT_BAR_COLORS: Record<Element, string> = {
  Fire: "bg-blush",
  Water: "bg-[var(--color-secondary)]",
  Earth: "bg-forest",
  Air: "bg-[var(--color-accent)]",
  Spirit: "bg-[var(--color-text-muted)]",
}

export default function BlendBuilder({ herbs }: BlendBuilderProps) {
  const router = useRouter()

  const [step, setStep] = useState<Step>("details")
  const [name, setName] = useState("")
  const [intention, setIntention] = useState("")
  const [selectedHerbs, setSelectedHerbs] = useState<BlendHerb[]>([])
  const [notes, setNotes] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const filteredHerbs = useMemo(() => {
    if (!searchQuery.trim()) return herbs
    const query = searchQuery.toLowerCase()
    return herbs.filter(
      (h) =>
        h.name.toLowerCase().includes(query) ||
        h.latin_name.toLowerCase().includes(query)
    )
  }, [herbs, searchQuery])

  const selectedHerbIds = new Set(selectedHerbs.map((h) => h.herb_id))

  const elementalBalance = useMemo(() => {
    const balance: Record<Element, number> = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0,
      Spirit: 0,
    }
    for (const herb of selectedHerbs) {
      balance[herb.element] = (balance[herb.element] || 0) + 1
    }
    return balance
  }, [selectedHerbs])

  const planetaryInfluences = useMemo(() => {
    const influences: Record<string, number> = {}
    for (const herb of selectedHerbs) {
      influences[herb.planetary_ruler] =
        (influences[herb.planetary_ruler] || 0) + 1
    }
    return influences
  }, [selectedHerbs])

  function handleAddHerb(herb: Herb) {
    if (selectedHerbIds.has(herb.id)) return
    setSelectedHerbs((prev) => [
      ...prev,
      {
        herb_id: herb.id,
        herb_name: herb.name,
        element: herb.element,
        planetary_ruler: herb.planetary_ruler,
      },
    ])
  }

  function handleRemoveHerb(herbId: string) {
    setSelectedHerbs((prev) => prev.filter((h) => h.herb_id !== herbId))
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const response = await fetch("/api/herbology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: null,
          herbs: selectedHerbs,
          intention: intention || null,
          notes: notes || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save blend")
      }

      router.push("/herbology/blends")
    } catch {
      setSubmitting(false)
    }
  }

  const maxElementCount = Math.max(...Object.values(elementalBalance), 1)

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center gap-3 font-body text-sm text-[var(--color-text-muted)]">
        <span className={step === "details" ? "text-forest font-medium" : ""}>
          Herbs
        </span>
        <span className="text-[var(--color-border)]">/</span>
        <span className={step === "review" ? "text-forest font-medium" : ""}>
          Review
        </span>
        <span className="text-[var(--color-border)]">/</span>
        <span className={step === "notes" ? "text-forest font-medium" : ""}>
          Notes
        </span>
      </div>

      {/* Step 1: Details + Herb Selection */}
      {step === "details" && (
        <div className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <Label className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Blend Name
            </Label>
            <Input
              type="text"
              placeholder="Name your blend..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)]"
            />
          </div>

          {/* Intention Input */}
          <div className="space-y-2">
            <Label className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Intention (optional)
            </Label>
            <Input
              type="text"
              placeholder="What is this blend for?"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              className="bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)]"
            />
          </div>

          {/* Selected Herbs */}
          {selectedHerbs.length > 0 && (
            <div className="space-y-2">
              <Label className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Selected Herbs ({selectedHerbs.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {selectedHerbs.map((herb) => (
                  <span
                    key={herb.herb_id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-sage-mist px-3 py-1 text-xs font-medium text-forest"
                  >
                    {herb.herb_name}
                    <button
                      onClick={() => handleRemoveHerb(herb.herb_id)}
                      className="rounded-full p-0.5 hover:bg-forest/10 transition-colors"
                    >
                      <X size={12} strokeWidth={1.5} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Separator */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gold/30" />
            <span className="font-body text-xs uppercase tracking-widest text-[var(--color-text-faint)]">
              Choose herbs
            </span>
            <div className="h-px flex-1 bg-gold/30" />
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-faint)]"
              strokeWidth={1.5}
            />
            <Input
              type="text"
              placeholder="Search herbs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)]"
            />
          </div>

          {/* Herb Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-1">
            {filteredHerbs.map((herb) => {
              const isSelected = selectedHerbIds.has(herb.id)
              return (
                <button
                  key={herb.id}
                  onClick={() => handleAddHerb(herb)}
                  disabled={isSelected}
                  className={`text-left transition-opacity ${
                    isSelected ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                >
                  <HerbCard herb={herb} />
                </button>
              )
            })}
          </div>

          {filteredHerbs.length === 0 && (
            <div className="py-8 text-center">
              <p className="font-body text-[var(--color-text-muted)]">
                No herbs match your search.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-end">
            <Button
              onClick={() => setStep("review")}
              disabled={!name.trim() || selectedHerbs.length === 0}
              className="bg-forest text-parchment hover:bg-forest-deep font-body"
            >
              Review Blend
              <ArrowRight size={16} strokeWidth={1.5} className="ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === "review" && (
        <div className="space-y-6">
          <h2 className="font-display text-2xl text-[var(--color-text)]">
            Review Your Blend
          </h2>

          {/* Blend Summary */}
          <div className="surface-gradient border border-[var(--color-border)] rounded-lg p-6 space-y-4">
            <div>
              <span className="font-body text-sm text-[var(--color-text-muted)]">
                Blend Name
              </span>
              <p className="font-display text-xl text-[var(--color-text)]">
                {name}
              </p>
            </div>
            {intention && (
              <div>
                <span className="font-body text-sm text-[var(--color-text-muted)]">
                  Intention
                </span>
                <p className="font-body text-base italic text-[var(--color-text)]">
                  {intention}
                </p>
              </div>
            )}
          </div>

          {/* Selected Herbs */}
          <div className="space-y-3">
            <h3 className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Herbs ({selectedHerbs.length})
            </h3>
            <div className="space-y-2">
              {selectedHerbs.map((herb) => (
                <div
                  key={herb.herb_id}
                  className="flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4"
                >
                  <div className="flex items-center gap-3 font-body">
                    <span className="font-medium text-[var(--color-text)]">
                      {herb.herb_name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                      <Leaf size={10} strokeWidth={1.5} />
                      {herb.element}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                      <Globe size={10} strokeWidth={1.5} />
                      {herb.planetary_ruler}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveHerb(herb.herb_id)}
                    className="rounded-md p-1.5 text-[var(--color-text-faint)] hover:bg-blush/10 hover:text-blush transition-colors"
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Elemental Balance */}
          <div className="space-y-3">
            <h3 className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Elemental Balance
            </h3>
            <div className="space-y-2">
              {ELEMENTS.map((element) => {
                const count = elementalBalance[element] || 0
                if (count === 0 && selectedHerbs.length > 0) return null
                const widthPercent =
                  maxElementCount > 0
                    ? (count / maxElementCount) * 100
                    : 0
                return (
                  <div key={element} className="flex items-center gap-3">
                    <span className="font-body text-xs w-14 text-right text-[var(--color-text-muted)]">
                      {element}
                    </span>
                    <div className="flex-1 h-4 bg-[var(--color-surface-raised)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${ELEMENT_BAR_COLORS[element]}`}
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                    <span className="font-body text-xs w-6 text-[var(--color-text-muted)]">
                      {count}
                    </span>
                  </div>
                )
              }).filter(Boolean)}
            </div>
          </div>

          {/* Planetary Influences */}
          {Object.keys(planetaryInfluences).length > 0 && (
            <div className="space-y-3">
              <h3 className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Planetary Influences
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(planetaryInfluences)
                  .sort(([, a], [, b]) => b - a)
                  .map(([planet, count]) => (
                    <span
                      key={planet}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-raised)] px-3 py-1 text-xs font-medium text-[var(--color-text)] border border-[var(--color-border)]"
                    >
                      <Globe size={10} strokeWidth={1.5} />
                      {planet}
                      {count > 1 && (
                        <span className="text-[var(--color-accent)] font-semibold">
                          x{count}
                        </span>
                      )}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep("details")}
              className="font-body"
            >
              <ArrowLeft size={16} strokeWidth={1.5} className="mr-2" />
              Edit Herbs
            </Button>
            <Button
              onClick={() => setStep("notes")}
              className="bg-forest text-parchment hover:bg-forest-deep font-body"
            >
              Continue
              <ArrowRight size={16} strokeWidth={1.5} className="ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Notes + Submit */}
      {step === "notes" && (
        <div className="space-y-6">
          <h2 className="font-display text-2xl text-[var(--color-text)]">
            Final Notes
          </h2>

          <div className="space-y-2">
            <Label className="font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Notes (optional)
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional thoughts, preparation notes, or observations..."
              className="bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)] min-h-[120px]"
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep("review")}
              className="font-body"
            >
              <ArrowLeft size={16} strokeWidth={1.5} className="mr-2" />
              Back
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
                  Save Blend
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
