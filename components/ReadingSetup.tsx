"use client"

import { useState } from "react"
import type { SpreadTemplate, Visibility } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sparkles } from "lucide-react"

const MOODS = [
  { value: "reflective", label: "Reflective" },
  { value: "anxious", label: "Anxious" },
  { value: "grateful", label: "Grateful" },
  { value: "curious", label: "Curious" },
  { value: "uncertain", label: "Uncertain" },
  { value: "hopeful", label: "Hopeful" },
  { value: "contemplative", label: "Contemplative" },
]

interface SetupData {
  spreadTemplate: SpreadTemplate
  intention: string
  mood: string
  date: string
  visibility: Visibility
}

interface ReadingSetupProps {
  spreads: SpreadTemplate[]
  onComplete: (data: SetupData) => void
}

export default function ReadingSetup({
  spreads,
  onComplete,
}: ReadingSetupProps) {
  const today = new Date().toISOString().split("T")[0]

  const [intention, setIntention] = useState("")
  const [date, setDate] = useState(today)
  const [mood, setMood] = useState("")
  const [visibility, setVisibility] = useState<Visibility>("private")
  const [spreadId, setSpreadId] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!spreadId || !mood) return

    const selectedSpread = spreads.find((s) => s.id === spreadId)
    if (!selectedSpread) return

    onComplete({
      spreadTemplate: selectedSpread,
      intention,
      date,
      mood,
      visibility,
    })
  }

  const isValid = spreadId !== "" && spreadId !== "__new__" && mood !== ""

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-6"
    >
      {/* Intention */}
      <div className="space-y-2">
        <Label
          htmlFor="intention"
          className="font-body text-sm font-semibold text-charcoal"
        >
          Intention
        </Label>
        <Textarea
          id="intention"
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          placeholder="What question or theme is on your mind?"
          className="bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)] placeholder:italic"
          rows={3}
        />
        <p className="font-body text-xs text-warm-grey">
          Optional. Set the tone for your reading.
        </p>
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label
          htmlFor="date"
          className="font-body text-sm font-semibold text-charcoal"
        >
          Date
        </Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-[var(--color-surface)] border-[var(--color-border)] font-body"
        />
      </div>

      {/* Mood */}
      <div className="space-y-2">
        <Label className="font-body text-sm font-semibold text-charcoal">
          Mood / Energy
        </Label>
        <Select value={mood} onValueChange={setMood}>
          <SelectTrigger className="bg-[var(--color-surface)] border-[var(--color-border)] font-body">
            <SelectValue placeholder="How are you feeling?" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--color-surface)]">
            {MOODS.map((m) => (
              <SelectItem
                key={m.value}
                value={m.value}
                className="font-body"
              >
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <Label className="font-body text-sm font-semibold text-charcoal">
          Visibility
        </Label>
        <Select
          value={visibility}
          onValueChange={(v) => setVisibility(v as Visibility)}
        >
          <SelectTrigger className="bg-[var(--color-surface)] border-[var(--color-border)] font-body">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[var(--color-surface)]">
            <SelectItem value="private" className="font-body">
              Private
            </SelectItem>
            <SelectItem value="public" className="font-body">
              Public
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="font-body text-xs text-warm-grey">
          Private readings are visible only to you.
        </p>
      </div>

      {/* Spread Template */}
      <div className="space-y-2">
        <Label className="font-body text-sm font-semibold text-charcoal">
          Spread
        </Label>
        <Select value={spreadId} onValueChange={setSpreadId}>
          <SelectTrigger className="bg-[var(--color-surface)] border-[var(--color-border)] font-body">
            <SelectValue placeholder="Choose a spread..." />
          </SelectTrigger>
          <SelectContent className="bg-[var(--color-surface)]">
            {spreads.map((s) => (
              <SelectItem key={s.id} value={s.id} className="font-body">
                <div>
                  <span>{s.name}</span>
                  <span className="text-warm-grey text-xs ml-2">
                    ({s.positions.length}{" "}
                    {s.positions.length === 1 ? "position" : "positions"})
                  </span>
                </div>
              </SelectItem>
            ))}
            <SelectItem value="__new__" className="font-body text-forest">
              + Create new spread
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={!isValid}
        className="w-full bg-forest text-parchment hover:bg-forest-deep font-body text-base py-5 transition-transform hover:-translate-y-px"
      >
        <Sparkles className="h-4 w-4 mr-2" strokeWidth={1.5} />
        Begin Reading
      </Button>
    </form>
  )
}
