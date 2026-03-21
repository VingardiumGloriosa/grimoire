import Link from "next/link"
import HoroscopeCard from "@/components/HoroscopeCard"
import { Star } from "lucide-react"

export default function AstrologyPage() {
  return (
    <main className="max-w-reading mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-4xl mb-2">Astrology</h1>
        <p className="font-body text-lg italic text-[var(--color-text-muted)]">
          The celestial language — planetary wisdom and daily guidance.
        </p>
      </div>

      {/* Daily Horoscope */}
      <section className="mb-10">
        <HoroscopeCard />
      </section>

      {/* Charts link */}
      <section>
        <Link href="/astrology/charts">
          <div className="group surface-gradient hover-glow border border-[var(--color-border)] rounded-lg p-6 transition-all duration-200 hover:border-gold/60 hover:shadow-glow-gold hover:-translate-y-0.5">
            <div className="flex items-start gap-4">
              <div className="mt-1 text-[var(--color-secondary)]">
                <Star size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-display text-xl text-[var(--color-text)] mb-2">
                  Birth Charts
                </h2>
                <p className="font-body text-sm text-[var(--color-text-muted)]">
                  Create and explore your natal chart — sun, moon, rising, and planetary placements.
                </p>
              </div>
            </div>
          </div>
        </Link>
      </section>
    </main>
  )
}
