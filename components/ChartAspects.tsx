import type { Aspect } from "@/lib/types"

interface ChartAspectsProps {
  aspects: Aspect[]
}

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: "Conjunction",
  sextile: "Sextile",
  square: "Square",
  trine: "Trine",
  opposition: "Opposition",
  quincunx: "Quincunx",
}

export default function ChartAspects({ aspects }: ChartAspectsProps) {
  if (aspects.length === 0) {
    return (
      <p className="font-body text-sm text-[var(--color-text-muted)] italic py-4">
        No aspect data available yet.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full font-body text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="text-left py-3 pr-4 font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-xs">
              Planet 1
            </th>
            <th className="text-left py-3 pr-4 font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-xs">
              Aspect
            </th>
            <th className="text-left py-3 pr-4 font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-xs">
              Planet 2
            </th>
            <th className="text-left py-3 font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-xs">
              Orb
            </th>
          </tr>
        </thead>
        <tbody>
          {aspects.map((aspect, i) => (
            <tr
              key={`${aspect.planet1}-${aspect.aspect}-${aspect.planet2}-${i}`}
              className="border-b border-[var(--color-border)] last:border-b-0"
            >
              <td className="py-3 pr-4 font-medium text-[var(--color-text)]">
                {aspect.planet1}
              </td>
              <td className="py-3 pr-4">
                <span className="inline-flex items-center rounded-full bg-gold-subtle px-2 py-0.5 text-xs font-medium text-umber">
                  {ASPECT_SYMBOLS[aspect.aspect.toLowerCase()] ?? aspect.aspect}
                </span>
              </td>
              <td className="py-3 pr-4 font-medium text-[var(--color-text)]">
                {aspect.planet2}
              </td>
              <td className="py-3 text-[var(--color-text-muted)]">
                {aspect.orb.toFixed(1)}&deg;
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
