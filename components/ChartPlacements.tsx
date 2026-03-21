import type { PlanetPlacement } from "@/lib/types"
import SignBadge from "@/components/SignBadge"

interface ChartPlacementsProps {
  placements: PlanetPlacement[]
}

export default function ChartPlacements({ placements }: ChartPlacementsProps) {
  if (placements.length === 0) {
    return (
      <p className="font-body text-sm text-[var(--color-text-muted)] italic py-4">
        No planetary data available yet.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full font-body text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="text-left py-3 pr-4 font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-xs">
              Planet
            </th>
            <th className="text-left py-3 pr-4 font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-xs">
              Sign
            </th>
            <th className="text-left py-3 pr-4 font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-xs">
              House
            </th>
            <th className="text-left py-3 pr-4 font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-xs">
              Degree
            </th>
            <th className="text-left py-3 font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-xs">
              Rx
            </th>
          </tr>
        </thead>
        <tbody>
          {placements.map((placement) => (
            <tr
              key={placement.planet}
              className="border-b border-[var(--color-border)] last:border-b-0"
            >
              <td className="py-3 pr-4 font-medium text-[var(--color-text)]">
                {placement.planet}
              </td>
              <td className="py-3 pr-4">
                <SignBadge sign={placement.sign} size="sm" />
              </td>
              <td className="py-3 pr-4 text-[var(--color-text-muted)]">
                {placement.house}
              </td>
              <td className="py-3 pr-4 text-[var(--color-text-muted)]">
                {placement.degree.toFixed(1)}&deg;
              </td>
              <td className="py-3">
                {placement.retrograde && (
                  <span className="inline-flex items-center rounded-full bg-blush/15 px-2 py-0.5 text-xs font-medium text-blush">
                    R
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
