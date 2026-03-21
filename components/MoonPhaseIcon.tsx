'use client'

interface MoonPhaseIconProps {
  illumination: number
  isWaxing: boolean
  size?: number
}

/**
 * SVG moon rendering. Draws a circle with a crescent mask based on illumination.
 * Reusable across modules (tarot, dreams, etc).
 *
 * illumination: 0 (new moon) to 1 (full moon)
 * isWaxing: true = right side lit first, false = left side lit first
 */
export default function MoonPhaseIcon({
  illumination,
  isWaxing,
  size = 48,
}: MoonPhaseIconProps) {
  const id = `moon-mask-${size}-${illumination.toFixed(2)}-${isWaxing ? 'w' : 'n'}`
  const r = size / 2
  const cx = r
  const cy = r

  // Clamp illumination
  const illum = Math.max(0, Math.min(1, illumination))

  // The terminator curve: maps illumination to the x-offset of the ellipse
  // At 0 illumination (new moon), the entire disc is dark
  // At 0.5 (quarter), the terminator is a straight line down the center
  // At 1.0 (full moon), the entire disc is lit
  const terminatorX = Math.abs(illum - 0.5) * 2 * r
  const isMoreThanHalf = illum > 0.5

  // Build the mask path
  // We always draw a full circle, then carve out the shadow with an arc
  // The shadow side depends on isWaxing
  function buildShadowPath(): string {
    if (illum <= 0.01) {
      // New moon — entire disc is dark
      return `M ${cx - r},${cy} A ${r},${r} 0 1,1 ${cx - r},${cy + 0.01} Z`
    }
    if (illum >= 0.99) {
      // Full moon — entire disc is lit, no shadow
      return ''
    }

    // The terminator is an ellipse with rx = terminatorX, ry = r
    // We draw a path from top to bottom, then arc back
    const top = cy - r
    const bottom = cy + r

    // Determine the direction of arcs based on waxing/waning and illumination
    if (isWaxing) {
      // Shadow is on the left side
      if (isMoreThanHalf) {
        // Small shadow on the left
        return `M ${cx},${top} A ${terminatorX},${r} 0 0,0 ${cx},${bottom} A ${r},${r} 0 0,0 ${cx},${top} Z`
      } else {
        // Large shadow on the left
        return `M ${cx},${top} A ${terminatorX},${r} 0 0,1 ${cx},${bottom} A ${r},${r} 0 0,0 ${cx},${top} Z`
      }
    } else {
      // Shadow is on the right side
      if (isMoreThanHalf) {
        // Small shadow on the right
        return `M ${cx},${top} A ${terminatorX},${r} 0 0,1 ${cx},${bottom} A ${r},${r} 0 0,1 ${cx},${top} Z`
      } else {
        // Large shadow on the right
        return `M ${cx},${top} A ${terminatorX},${r} 0 0,0 ${cx},${bottom} A ${r},${r} 0 0,1 ${cx},${top} Z`
      }
    }
  }

  const shadowPath = buildShadowPath()

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <defs>
        <mask id={id}>
          {/* White = visible */}
          <circle cx={cx} cy={cy} r={r} fill="white" />
          {/* Black = hidden (the shadow) */}
          {shadowPath && <path d={shadowPath} fill="black" />}
        </mask>
      </defs>

      {/* Outer ring — subtle border */}
      <circle
        cx={cx}
        cy={cy}
        r={r - 0.5}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={1}
      />

      {/* Lit surface */}
      <circle
        cx={cx}
        cy={cy}
        r={r - 1}
        fill="var(--color-accent)"
        mask={`url(#${id})`}
      />

      {/* Dark surface (behind the mask, so only shadow parts show) */}
      <circle
        cx={cx}
        cy={cy}
        r={r - 1}
        fill="var(--color-surface-raised)"
        opacity={0.6}
      />

      {/* Lit surface on top (masked) */}
      <circle
        cx={cx}
        cy={cy}
        r={r - 1}
        fill="var(--color-accent)"
        mask={`url(#${id})`}
      />
    </svg>
  )
}
