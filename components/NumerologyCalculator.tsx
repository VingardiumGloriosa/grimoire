"use client"

import { useState } from "react"
import { computeAllNumbers } from "@/lib/numerology"
import type { NumerologyResults, NumerologyInterpretation } from "@/lib/types"
import { CATEGORY_MAP } from "@/lib/numerology-constants"
import NumberCard from "@/components/NumberCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Loader2, Hash } from "lucide-react"

interface NumerologyCalculatorProps {
  interpretations: NumerologyInterpretation[]
}

export default function NumerologyCalculator({ interpretations }: NumerologyCalculatorProps) {
  const [fullName, setFullName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [results, setResults] = useState<NumerologyResults | null>(null)

  // Save chart state
  type SaveStatus = 'idle' | 'editing' | 'saving' | 'success' | 'error'
  const [label, setLabel] = useState("")
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null)

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim() || !birthDate) return

    const computed = computeAllNumbers(fullName.trim(), birthDate)
    setResults(computed)
    setSaveStatus('idle')
    setSaveErrorMsg(null)
  }

  async function handleSave() {
    if (!results || !label.trim()) return

    setSaveStatus('saving')
    setSaveErrorMsg(null)

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
        setSaveStatus('error')
        setSaveErrorMsg("Sign in to save your chart.")
        return
      }

      if (!response.ok) {
        const data = await response.json()
        setSaveStatus('error')
        setSaveErrorMsg(data.error || "Failed to save chart.")
        return
      }

      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
      setSaveErrorMsg("Something went wrong. Please try again.")
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

          {/* Save chart */}
          <div className="divider-ornament" aria-hidden="true" />

          {saveStatus === 'success' ? (
            <p className="font-body text-sm text-[var(--color-secondary)] text-center">
              Chart saved. View it in{" "}
              <a href="/numerology/charts" className="underline underline-offset-4 hover:text-[var(--color-primary)]">
                your charts
              </a>
              .
            </p>
          ) : saveStatus === 'editing' || saveStatus === 'saving' || saveStatus === 'error' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-body text-sm text-[var(--color-text-muted)] uppercase tracking-wider">
                  Chart Label
                </Label>
                <Input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder='e.g. "My birth chart numbers"'
                  className="bg-[var(--color-surface)] border-[var(--color-border)] font-body placeholder:text-[var(--color-text-faint)]"
                />
              </div>
              {saveStatus === 'error' && saveErrorMsg && (
                <p className="font-body text-sm text-[var(--color-blush)]">{saveErrorMsg}</p>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving' || !label.trim()}
                  className="bg-forest text-parchment hover:bg-forest-deep font-body"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} strokeWidth={1.5} className="mr-2" />
                      Save Chart
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSaveStatus('idle')
                    setSaveErrorMsg(null)
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
                onClick={() => setSaveStatus('editing')}
                className="font-body"
              >
                <Save size={16} strokeWidth={1.5} className="mr-2" />
                Save This Chart
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
