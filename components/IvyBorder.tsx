'use client'

import { usePathname } from 'next/navigation'

// ── Ivy Leaf Paths ──────────────────────────────────────────────────
// Five leaf variants for natural variety: from small buds to mature spreads
const LEAF_BUD = "M5,0 C3,2 1,4 0,7 C2,6 3,6 4,6.5 C3,9 2.5,12 3.5,14 C4.5,11 5,9 5.5,7 C6,9 6.5,11 7.5,14 C8.5,12 8,9 7,6.5 C8,6 9,6 11,7 C10,4 8,2 5,0Z"
const LEAF_SM = "M8,0 C5,2 2,5 0,9 C2,8 4,7.5 5,8 C3.5,11 3,15 4,18 C5.5,14 7,12 8,9.5 C9,12 10.5,14 12,18 C13,15 12.5,11 11,8 C12,7.5 14,8 16,9 C14,5 11,2 8,0Z"
const LEAF_MD = "M10,0 C7,3 3,6 0,12 C2.5,10 5,9 6.5,10 C4.5,14 3.5,18 5,22 C7,18 9,15 10,12 C11,15 13,18 15,22 C16.5,18 15.5,14 13.5,10 C15,9 17.5,10 20,12 C17,6 13,3 10,0Z"
const LEAF_LG = "M12,0 C8,4 3,7 0,14 C3,12 6,11 8,12 C5.5,17 4,22 6,26 C8.5,21 11,17 12,14 C13,17 15.5,21 18,26 C20,22 18.5,17 16,12 C18,11 21,12 24,14 C21,7 16,4 12,0Z"
const LEAF_XL = "M14,0 C9,5 3,9 0,18 C4,15 7,13 9,14 C6,20 5,27 7,32 C10,26 13,20 14,16 C15,20 18,26 21,32 C23,27 22,20 19,14 C21,13 24,15 28,18 C25,9 19,5 14,0Z"

interface LeafConfig {
  x: number
  y: number
  rotate: number
  scale: number
  opacity: number
  path: string
  color: 'vine' | 'accent' | 'dark'
  anim: 'animate-ivy-sway' | 'animate-ivy-sway-alt'
  delay: string
}

// Left-side vine leaves: viewBox is 200 x 1000
// Dense clusters at top and bottom corners, sparser in the middle
const leaves: LeafConfig[] = [
  // ── Top corner cluster (dense, lush entry point) ──
  { x: 6, y: 15, rotate: -15, scale: 1.4, opacity: 0.55, path: LEAF_LG, color: 'vine', anim: 'animate-ivy-sway', delay: '0s' },
  { x: 25, y: 8, rotate: 20, scale: 1.0, opacity: 0.45, path: LEAF_MD, color: 'vine', anim: 'animate-ivy-sway-alt', delay: '1.2s' },
  { x: 2, y: 50, rotate: -35, scale: 1.6, opacity: 0.5, path: LEAF_XL, color: 'dark', anim: 'animate-ivy-sway-alt', delay: '0.5s' },
  { x: 35, y: 40, rotate: 30, scale: 0.9, opacity: 0.4, path: LEAF_SM, color: 'vine', anim: 'animate-ivy-sway', delay: '2.4s' },
  { x: 15, y: 80, rotate: -10, scale: 1.2, opacity: 0.48, path: LEAF_LG, color: 'vine', anim: 'animate-ivy-sway-alt', delay: '0.8s' },
  { x: 40, y: 70, rotate: 45, scale: 0.7, opacity: 0.38, path: LEAF_BUD, color: 'accent', anim: 'animate-ivy-sway', delay: '3.1s' },
  { x: 8, y: 115, rotate: -45, scale: 1.1, opacity: 0.42, path: LEAF_MD, color: 'vine', anim: 'animate-ivy-sway', delay: '1.8s' },

  // ── Upper vine section ──
  { x: 30, y: 150, rotate: 25, scale: 1.5, opacity: 0.52, path: LEAF_XL, color: 'vine', anim: 'animate-ivy-sway-alt', delay: '0.3s' },
  { x: 50, y: 140, rotate: -20, scale: 0.8, opacity: 0.35, path: LEAF_BUD, color: 'vine', anim: 'animate-ivy-sway', delay: '2.7s' },
  { x: 18, y: 190, rotate: 40, scale: 1.1, opacity: 0.44, path: LEAF_MD, color: 'accent', anim: 'animate-ivy-sway-alt', delay: '1.5s' },
  { x: 45, y: 210, rotate: -30, scale: 1.3, opacity: 0.48, path: LEAF_LG, color: 'vine', anim: 'animate-ivy-sway', delay: '0.6s' },
  { x: 60, y: 185, rotate: 15, scale: 0.75, opacity: 0.32, path: LEAF_SM, color: 'vine', anim: 'animate-ivy-sway-alt', delay: '3.5s' },

  // ── Upper-mid spread ──
  { x: 55, y: 260, rotate: 35, scale: 1.4, opacity: 0.46, path: LEAF_LG, color: 'vine', anim: 'animate-ivy-sway', delay: '1.0s' },
  { x: 25, y: 280, rotate: -25, scale: 1.0, opacity: 0.4, path: LEAF_MD, color: 'dark', anim: 'animate-ivy-sway-alt', delay: '2.2s' },
  { x: 70, y: 300, rotate: 50, scale: 0.85, opacity: 0.35, path: LEAF_SM, color: 'vine', anim: 'animate-ivy-sway', delay: '0.9s' },
  { x: 40, y: 330, rotate: -15, scale: 1.2, opacity: 0.42, path: LEAF_MD, color: 'vine', anim: 'animate-ivy-sway-alt', delay: '3.8s' },

  // ── Mid section (slightly sparser, still present) ──
  { x: 50, y: 390, rotate: 30, scale: 1.5, opacity: 0.44, path: LEAF_XL, color: 'vine', anim: 'animate-ivy-sway-alt', delay: '1.3s' },
  { x: 28, y: 420, rotate: -40, scale: 0.9, opacity: 0.36, path: LEAF_SM, color: 'accent', anim: 'animate-ivy-sway', delay: '2.6s' },
  { x: 60, y: 460, rotate: 20, scale: 1.1, opacity: 0.4, path: LEAF_MD, color: 'vine', anim: 'animate-ivy-sway-alt', delay: '0.4s' },
  { x: 35, y: 500, rotate: -30, scale: 0.7, opacity: 0.3, path: LEAF_BUD, color: 'vine', anim: 'animate-ivy-sway', delay: '4.1s' },
  { x: 48, y: 540, rotate: 15, scale: 1.3, opacity: 0.42, path: LEAF_LG, color: 'dark', anim: 'animate-ivy-sway-alt', delay: '1.7s' },

  // ── Lower-mid (vines merge here) ──
  { x: 38, y: 590, rotate: -20, scale: 1.0, opacity: 0.38, path: LEAF_MD, color: 'vine', anim: 'animate-ivy-sway', delay: '2.0s' },
  { x: 55, y: 620, rotate: 40, scale: 0.85, opacity: 0.34, path: LEAF_SM, color: 'vine', anim: 'animate-ivy-sway-alt', delay: '3.3s' },
  { x: 25, y: 650, rotate: -35, scale: 1.4, opacity: 0.46, path: LEAF_LG, color: 'vine', anim: 'animate-ivy-sway', delay: '0.7s' },

  // ── Lower vine section ──
  { x: 45, y: 700, rotate: 25, scale: 1.6, opacity: 0.52, path: LEAF_XL, color: 'vine', anim: 'animate-ivy-sway-alt', delay: '1.1s' },
  { x: 18, y: 720, rotate: -15, scale: 0.9, opacity: 0.38, path: LEAF_SM, color: 'vine', anim: 'animate-ivy-sway', delay: '2.9s' },
  { x: 60, y: 750, rotate: 45, scale: 1.1, opacity: 0.42, path: LEAF_MD, color: 'accent', anim: 'animate-ivy-sway-alt', delay: '0.2s' },
  { x: 30, y: 790, rotate: -40, scale: 1.3, opacity: 0.48, path: LEAF_LG, color: 'vine', anim: 'animate-ivy-sway', delay: '3.6s' },
  { x: 50, y: 820, rotate: 20, scale: 0.75, opacity: 0.32, path: LEAF_BUD, color: 'vine', anim: 'animate-ivy-sway-alt', delay: '1.9s' },

  // ── Bottom corner cluster (dense, mirroring the top) ──
  { x: 40, y: 860, rotate: -25, scale: 1.5, opacity: 0.5, path: LEAF_XL, color: 'vine', anim: 'animate-ivy-sway', delay: '0.4s' },
  { x: 15, y: 880, rotate: 35, scale: 1.2, opacity: 0.46, path: LEAF_LG, color: 'dark', anim: 'animate-ivy-sway-alt', delay: '2.5s' },
  { x: 55, y: 895, rotate: -10, scale: 0.9, opacity: 0.4, path: LEAF_MD, color: 'vine', anim: 'animate-ivy-sway', delay: '1.4s' },
  { x: 8, y: 920, rotate: 30, scale: 1.1, opacity: 0.44, path: LEAF_MD, color: 'vine', anim: 'animate-ivy-sway-alt', delay: '3.0s' },
  { x: 35, y: 940, rotate: -45, scale: 1.6, opacity: 0.55, path: LEAF_XL, color: 'vine', anim: 'animate-ivy-sway', delay: '0.8s' },
  { x: 20, y: 965, rotate: 20, scale: 1.0, opacity: 0.42, path: LEAF_LG, color: 'accent', anim: 'animate-ivy-sway-alt', delay: '2.1s' },
  { x: 48, y: 980, rotate: -30, scale: 0.8, opacity: 0.38, path: LEAF_SM, color: 'vine', anim: 'animate-ivy-sway', delay: '1.6s' },
  { x: 5, y: 990, rotate: 10, scale: 1.3, opacity: 0.5, path: LEAF_LG, color: 'vine', anim: 'animate-ivy-sway-alt', delay: '0.1s' },
]

function VineSVG({ mirror = false }: { mirror?: boolean }) {
  return (
    <svg
      className={`absolute top-0 h-full w-[160px] xl:w-[220px] 2xl:w-[280px] animate-ivy-breathe ${
        mirror ? 'right-0' : 'left-0'
      }`}
      style={mirror ? { transform: 'scaleX(-1)', animationDelay: '4s' } : undefined}
      viewBox="0 0 200 1000"
      preserveAspectRatio="xMinYMin slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Primary vine: thick, bold main trunk ── */}
      <path
        d="M4,0 C12,40 28,90 40,160 C52,230 60,280 55,360 C50,440 38,490 42,560 C46,630 40,660 38,700"
        stroke="var(--color-secondary)"
        strokeWidth="2.5"
        opacity="0.5"
        strokeLinecap="round"
      />

      {/* ── Secondary vine: meets primary from below ── */}
      <path
        d="M6,1000 C14,950 25,900 30,840 C38,760 50,710 45,660 C40,620 38,700 38,700"
        stroke="var(--color-secondary)"
        strokeWidth="2.2"
        opacity="0.45"
        strokeLinecap="round"
      />

      {/* ── Tertiary vine: branching middle path for depth ── */}
      <path
        d="M40,160 C55,180 68,220 72,280 C76,340 65,380 58,420"
        stroke="var(--color-secondary)"
        strokeWidth="1.6"
        opacity="0.35"
        strokeLinecap="round"
      />
      <path
        d="M45,660 C58,640 70,620 75,580 C78,550 70,510 60,480"
        stroke="var(--color-secondary)"
        strokeWidth="1.6"
        opacity="0.35"
        strokeLinecap="round"
      />

      {/* ── Tendrils: delicate branching curves ── */}
      <path
        d="M40,160 C52,148 65,142 78,148"
        stroke="var(--color-secondary)"
        strokeWidth="1.2"
        opacity="0.35"
        strokeLinecap="round"
      />
      <path
        d="M55,360 C68,348 80,345 90,352"
        stroke="var(--color-secondary)"
        strokeWidth="1.1"
        opacity="0.3"
        strokeLinecap="round"
      />
      <path
        d="M72,280 C84,272 94,275 100,285"
        stroke="var(--color-secondary)"
        strokeWidth="1.0"
        opacity="0.28"
        strokeLinecap="round"
      />
      <path
        d="M42,560 C56,548 68,550 74,560"
        stroke="var(--color-secondary)"
        strokeWidth="1.2"
        opacity="0.32"
        strokeLinecap="round"
      />
      <path
        d="M30,840 C44,828 56,830 62,842"
        stroke="var(--color-secondary)"
        strokeWidth="1.1"
        opacity="0.3"
        strokeLinecap="round"
      />
      <path
        d="M14,950 C26,940 38,942 42,952"
        stroke="var(--color-secondary)"
        strokeWidth="1.0"
        opacity="0.28"
        strokeLinecap="round"
      />
      {/* Curling tendrils: the spiraling tips that make it feel alive */}
      <path
        d="M78,148 C82,144 84,140 82,136 C80,134 78,136 79,140"
        stroke="var(--color-secondary)"
        strokeWidth="0.8"
        opacity="0.3"
        strokeLinecap="round"
      />
      <path
        d="M90,352 C94,348 95,343 93,340 C91,339 90,341 91,345"
        stroke="var(--color-secondary)"
        strokeWidth="0.8"
        opacity="0.25"
        strokeLinecap="round"
      />
      <path
        d="M100,285 C104,282 105,278 103,275 C101,274 100,276 101,280"
        stroke="var(--color-secondary)"
        strokeWidth="0.8"
        opacity="0.25"
        strokeLinecap="round"
      />

      {/* ── Leaves ── */}
      {leaves.map((leaf, i) => (
        <g
          key={i}
          className={leaf.anim}
          style={{
            animationDelay: leaf.delay,
            transformOrigin: `${leaf.x}px ${leaf.y}px`,
          }}
        >
          <path
            d={leaf.path}
            fill={
              leaf.color === 'accent'
                ? 'var(--color-accent)'
                : leaf.color === 'dark'
                  ? 'var(--color-primary)'
                  : 'var(--color-secondary)'
            }
            opacity={leaf.opacity}
            transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.rotate}) scale(${leaf.scale})`}
          />
        </g>
      ))}
    </svg>
  )
}

export default function IvyBorder() {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) return null

  return (
    <div
      className="ivy-animate fixed inset-0 z-[51] pointer-events-none overflow-hidden hidden lg:block"
      aria-hidden="true"
    >
      <VineSVG />
      <VineSVG mirror />
    </div>
  )
}
