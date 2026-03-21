import type { BirthChart, AstrologyInterpretation } from "@/lib/types"
import SignBadge from "@/components/SignBadge"

interface ChartInterpretationProps {
  chart: BirthChart
  interpretations: AstrologyInterpretation[]
}

function findInterpretation(
  interpretations: AstrologyInterpretation[],
  category: string,
  key: string
): AstrologyInterpretation | undefined {
  return interpretations.find(
    (i) =>
      i.category.toLowerCase() === category.toLowerCase() &&
      i.key.toLowerCase() === key.toLowerCase()
  )
}

interface SignSectionProps {
  label: string
  sign: string | null
  interpretation: AstrologyInterpretation | undefined
}

function SignSection({ label, sign, interpretation }: SignSectionProps) {
  if (!sign) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h3 className="font-display text-xl">{label}</h3>
        <SignBadge sign={sign} size="md" />
      </div>

      {interpretation ? (
        <div className="space-y-3">
          <p className="font-body text-lg italic leading-relaxed text-[var(--color-text)]">
            {interpretation.description}
          </p>

          {interpretation.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {interpretation.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-sm bg-gold-subtle px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-umber"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-1 font-body text-sm text-[var(--color-text-muted)]">
            {interpretation.element && (
              <span>
                <span className="font-semibold">Element:</span>{" "}
                {interpretation.element}
              </span>
            )}
            {interpretation.modality && (
              <span>
                <span className="font-semibold">Modality:</span>{" "}
                {interpretation.modality}
              </span>
            )}
            {interpretation.ruling_planet && (
              <span>
                <span className="font-semibold">Ruler:</span>{" "}
                {interpretation.ruling_planet}
              </span>
            )}
          </div>
        </div>
      ) : (
        <p className="font-body text-sm text-[var(--color-text-faint)] italic">
          Interpretation data not yet available for {sign}.
        </p>
      )}
    </div>
  )
}

export default function ChartInterpretation({
  chart,
  interpretations,
}: ChartInterpretationProps) {
  const sunInterp = findInterpretation(interpretations, "sun_sign", chart.sun_sign)
  const moonInterp = findInterpretation(interpretations, "moon_sign", chart.moon_sign)
  const risingInterp = chart.rising_sign
    ? findInterpretation(interpretations, "rising_sign", chart.rising_sign)
    : undefined

  const hasAnyInterpretation = sunInterp || moonInterp || risingInterp

  if (!hasAnyInterpretation && !chart.sun_sign && !chart.moon_sign && !chart.rising_sign) {
    return (
      <p className="font-body text-sm text-[var(--color-text-muted)] italic py-4">
        No interpretation data available yet.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      <SignSection
        label="Sun Sign"
        sign={chart.sun_sign}
        interpretation={sunInterp}
      />

      {chart.moon_sign && (
        <>
          <div className="divider-ornament" aria-hidden="true" />
          <SignSection
            label="Moon Sign"
            sign={chart.moon_sign}
            interpretation={moonInterp}
          />
        </>
      )}

      {chart.rising_sign && (
        <>
          <div className="divider-ornament" aria-hidden="true" />
          <SignSection
            label="Rising Sign"
            sign={chart.rising_sign}
            interpretation={risingInterp}
          />
        </>
      )}

      {chart.time_unknown && !chart.rising_sign && (
        <p className="font-body text-sm text-[var(--color-text-faint)] italic border-l-2 border-[var(--color-border)] pl-4">
          Rising sign requires an exact birth time. Update your chart with a birth time to see this placement.
        </p>
      )}
    </div>
  )
}
