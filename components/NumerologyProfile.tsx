"use client"

import type { NumerologyProfile as NumerologyProfileType, NumerologyResults, NumerologyInterpretation } from "@/lib/types"
import { Shield, Flame, Heart } from "lucide-react"

/** Maps result keys to human-readable category labels */
const CATEGORY_MAP: Record<keyof NumerologyResults, string> = {
  life_path: "Life Path",
  expression: "Expression",
  soul_urge: "Soul Urge",
  personality: "Personality",
  birthday: "Birthday",
  maturity: "Maturity",
}

/** Short descriptions of what each number type represents */
const CATEGORY_DESCRIPTIONS: Record<keyof NumerologyResults, string> = {
  life_path: "Your life's purpose and the path you walk.",
  expression: "How you express yourself and your natural talents.",
  soul_urge: "Your inner desires and what truly motivates you.",
  personality: "How others perceive you at first meeting.",
  birthday: "A special gift or talent you carry.",
  maturity: "The wisdom you grow into over time.",
}

interface NumerologyProfileProps {
  profile: NumerologyProfileType
}

export default function NumerologyProfile({ profile }: NumerologyProfileProps) {
  const formattedDate = new Date(profile.birth_date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  /** Look up interpretation from the snapshot */
  function findInterpretation(category: string, number: number): NumerologyInterpretation | undefined {
    // The API stores snapshot keys as `${category}_${number}`
    const key = `${category}_${number}`
    return profile.results_snapshot[key] as NumerologyInterpretation | undefined
  }

  return (
    <div className="max-w-reading mx-auto space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <h1 className="font-display text-4xl text-[var(--color-text)]">
          {profile.label}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-body text-sm text-[var(--color-text-muted)]">
            {profile.full_name}
          </span>
          <span className="text-[var(--color-border)]">&middot;</span>
          <span className="font-body text-sm text-[var(--color-text-muted)]">
            {formattedDate}
          </span>
        </div>
      </header>

      {/* Number overview grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {(Object.keys(CATEGORY_MAP) as (keyof NumerologyResults)[]).map((key) => {
          const number = profile.results[key]
          const category = CATEGORY_MAP[key]

          return (
            <div
              key={key}
              className="surface-gradient border border-[var(--color-border)] rounded-lg p-4 text-center space-y-1"
            >
              <p className="font-body text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                {category}
              </p>
              <p className="font-display text-4xl text-[var(--color-accent)]">
                {number}
              </p>
            </div>
          )
        })}
      </div>

      <div className="divider-ornament" aria-hidden="true" />

      {/* Detailed interpretations */}
      <div className="space-y-10">
        {(Object.keys(CATEGORY_MAP) as (keyof NumerologyResults)[]).map((key) => {
          const number = profile.results[key]
          const category = CATEGORY_MAP[key]
          const interp = findInterpretation(category, number)

          return (
            <section key={key} className="space-y-4">
              {/* Section header */}
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl text-[var(--color-accent)]">
                  {number}
                </span>
                <div>
                  <h2 className="font-display text-2xl text-[var(--color-text)]">
                    {interp?.title ?? category}
                  </h2>
                  <p className="font-body text-xs uppercase tracking-wider text-[var(--color-text-faint)]">
                    {category}
                  </p>
                </div>
              </div>

              {/* Category description */}
              <p className="font-body text-sm italic text-[var(--color-text-muted)]">
                {CATEGORY_DESCRIPTIONS[key]}
              </p>

              {interp ? (
                <div className="space-y-5">
                  {/* Description */}
                  <p className="font-body text-base text-[var(--color-text-muted)] leading-relaxed">
                    {interp.description}
                  </p>

                  {/* Strengths */}
                  {interp.strengths.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="flex items-center gap-2 font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                        <Flame size={14} strokeWidth={1.5} className="text-[var(--color-accent)]" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {interp.strengths.map((s, i) => (
                          <li key={i} className="font-body text-sm text-[var(--color-text-muted)] leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-[var(--color-secondary)]">
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Challenges */}
                  {interp.challenges.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="flex items-center gap-2 font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                        <Shield size={14} strokeWidth={1.5} className="text-[var(--color-blush)]" />
                        Challenges
                      </h4>
                      <ul className="space-y-1">
                        {interp.challenges.map((c, i) => (
                          <li key={i} className="font-body text-sm text-[var(--color-text-muted)] leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-[var(--color-blush)]">
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Compatible numbers */}
                  {interp.compatible_numbers.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="flex items-center gap-2 font-body text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                        <Heart size={14} strokeWidth={1.5} className="text-[var(--color-accent)]" />
                        Compatible Numbers
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {interp.compatible_numbers.map((n) => (
                          <span
                            key={n}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-accent-subtle)] font-display text-sm text-[var(--color-accent)]"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Keywords */}
                  {interp.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {interp.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full bg-[var(--color-accent-subtle)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-text-muted)]"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="font-body text-sm italic text-[var(--color-text-faint)]">
                  No interpretation available for this number.
                </p>
              )}

              {/* Separator between sections (except last) */}
              {key !== "maturity" && (
                <div className="border-b border-[var(--color-border)] pt-4" />
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
