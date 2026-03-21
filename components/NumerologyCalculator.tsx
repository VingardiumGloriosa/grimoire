"use client"

import { useState } from "react"
import { computeAllNumbers } from "@/lib/numerology"
import type { NumerologyResults, NumerologyInterpretation } from "@/lib/types"
import NumberCard from "@/components/NumberCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Loader2, Hash } from "lucide-react"

/** Maps result keys to human-readable category labels */
const CATEGORY_MAP: Record<keyof NumerologyResults, string> = {
  life_path: "Life Path",
  expression: "Expression",
  soul_urge: "Soul Urge",
  personality: "Personality",
  birthday: "Birthday",
  maturity: "Maturity",
}

interface NumerologyCalculatorProps {
  interpretations: NumerologyInterpretation[]
}

export default function NumerologyCalculator({ interpretations }: NumerologyCalculatorProps) {
  const [fullName, setFullName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [results, setResults] = useState<NumerologyResults | null>(null)

  // Save profile state
  const [label, setLabel] = useState("")
  const [showSave, setShowSave] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !birthDate) return

    const computed = computeAllNumbers(fullName.trim(), birthDate)
    setResults(computed)
    setShowSave(false)
    setSaveSuccess(false)
    setSaveError(null)
  }

  async function handleSave() {
    if (!results || !label.trim()) return

    setSaving(true)
    setSaveError(null)

    try {
      const response = await fetch("/api/numerology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          full_name: fullName.trim(),
          birth_date: birthDate,
        }),
      })

      if (response.status === 401) {
        setSaveError("Sign in to save your profile.")
        return
      }

      if (!response.ok) {
        const data = await response.json()
        setSaveError(data.error || "Failed to save profile.")
        return
      }

      setSaveSuccess(true)
      setShowSave(false)
    } catch {
      setSaveError("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  /** Look up the interpretation for a given category and number */
  function findInterpretation(category: string, number: number): NumerologyInterpretation | undefined {
    return interpretations.find(
      (i) => i.category === category && i.number === number
    )
  }

  return (
    <div className="space-y-10">
      {/* Calculator form */}
      <form onSubmit={handleCalculate} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="font-body text-sm text-[var(--color-text-muted)] uppercase tracking-wider">
              Full Name
            </Label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="As given at birth"
              required
              className="bg-[var(--color-surface)] border-[var(--color-border)] font-body placeholder:text-[var(--color-text-faint)]"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-body text-sm text-[var(--color-text-muted)] uppercase tracking-wider">
              Birth Date
            </Label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              className="bg-[var(--color-surface)] border-[var(--color-border)] font-body text-[var(--color-text)]"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="bg-forest text-parchment hover:bg-forest-deep font-body"
        >
          <Hash size={16} strokeWidth={1.5} className="mr-2" />
          Reveal Your Numbers
        </Button>
      </form>

      {/* Results grid */}
      {results && (
        <div className="space-y-8">
          <div className="divider-ornament" aria-hidden="true" />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(Object.keys(CATEGORY_MAP) as (keyof NumerologyResults)[]).map((key) => {
              const number = results[key]
              const category = CATEGORY_MAP[key]
              const interp = findInterpretation(category, number)

              return (
                <NumberCard
                  key={key}
                  number={number}
                  title={interp?.title ?? category}
                  category={category}
                  keywords={interp?.keywords ?? []}
                />
              )
            })}
          </div>

          {/* Inline interpretations */}
          {interpretations.length > 0 && (
            <div className="space-y-6">
              {(Object.keys(CATEGORY_MAP) as (keyof NumerologyResults)[]).map((key) => {
                const number = results[key]
                const category = CATEGORY_MAP[key]
                const interp = findInterpretation(category, number)

                if (!interp) return null

                return (
                  <div
                    key={key}
                    className="border-l-2 border-[var(--color-accent)] pl-4 space-y-2"
                  >
                    <h3 className="font-display text-lg text-[var(--color-text)]">
                      {category}: {interp.title}
                    </h3>
                    <p className="font-body text-sm text-[var(--color-text-muted)] leading-relaxed">
                      {interp.description}
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Save profile */}
          <div className="divider-ornament" aria-hidden="true" />

          {saveSuccess ? (
            <p className="font-body text-sm text-[var(--color-secondary)] text-center">
              Profile saved. View it in{" "}
              <a href="/numerology/profiles" className="underline underline-offset-4 hover:text-[var(--color-primary)]">
                your profiles
              </a>
              .
            </p>
          ) : showSave ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-body text-sm text-[var(--color-text-muted)] uppercase tracking-wider">
                  Profile Label
                </Label>
                <Input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder='e.g. "My birth chart numbers"'
                  className="bg-[var(--color-surface)] border-[var(--color-border)] font-body placeholder:text-[var(--color-text-faint)]"
                />
              </div>
              {saveError && (
                <p className="font-body text-sm text-[var(--color-blush)]">{saveError}</p>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={saving || !label.trim()}
                  className="bg-forest text-parchment hover:bg-forest-deep font-body"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} strokeWidth={1.5} className="mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSave(false)
                    setSaveError(null)
                  }}
                  className="font-body"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setShowSave(true)}
                className="font-body"
              >
                <Save size={16} strokeWidth={1.5} className="mr-2" />
                Save This Profile
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
