"use client"

import { useState } from "react"
import type { ZodiacSign, HoroscopeEntry } from "@/lib/types"
import SignBadge from "@/components/SignBadge"
import { Loader2, Star } from "lucide-react"

const ZODIAC_SIGNS: ZodiacSign[] = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
]

export default function HoroscopeCard() {
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null)
  const [horoscope, setHoroscope] = useState<HoroscopeEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignSelect(sign: ZodiacSign) {
    setSelectedSign(sign)
    setLoading(true)
    setError(null)
    setHoroscope(null)

    try {
      const today = new Date().toISOString().split("T")[0]
      const res = await fetch(
        `/api/astrology/horoscope?sign=${sign}&date=${today}`
      )

      if (!res.ok) {
        throw new Error("Failed to fetch horoscope")
      }

      const data: HoroscopeEntry = await res.json()
      setHoroscope(data)
    } catch {
      setError("Could not load horoscope. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="surface-gradient border border-[var(--color-border)] rounded-lg p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Star size={20} strokeWidth={1.5} className="text-[var(--color-secondary)]" />
        <h2 className="font-display text-2xl">Daily Horoscope</h2>
      </div>

      <p className="font-body text-sm text-[var(--color-text-muted)]">
        Select your sign to reveal today&apos;s guidance.
      </p>

      {/* Sign selector */}
      <div className="flex flex-wrap gap-2">
        {ZODIAC_SIGNS.map((sign) => (
          <button
            key={sign}
            onClick={() => handleSignSelect(sign)}
            className={`transition-all duration-200 rounded-full ${
              selectedSign === sign
                ? "ring-2 ring-gold/50 scale-105"
                : "hover:scale-105 opacity-80 hover:opacity-100"
            }`}
          >
            <SignBadge sign={sign} size="md" />
          </button>
        ))}
      </div>

      {/* Horoscope content */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-[var(--color-text-muted)]" />
        </div>
      )}

      {error && (
        <p className="font-body text-sm text-blush italic py-4">{error}</p>
      )}

      {horoscope && !loading && (
        <div className="border-l-2 border-gold pl-4">
          <p className="font-body text-lg italic leading-relaxed text-[var(--color-text)]">
            {horoscope.content}
          </p>
          <p className="mt-2 font-body text-xs text-[var(--color-text-faint)] uppercase tracking-wider">
            {new Date(horoscope.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      )}
    </div>
  )
}
