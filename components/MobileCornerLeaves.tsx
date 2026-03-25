'use client'

import { usePathname } from 'next/navigation'

const LEAF_SM = "M8,0 C5,2 2,5 0,9 C2,8 4,7.5 5,8 C3.5,11 3,15 4,18 C5.5,14 7,12 8,9.5 C9,12 10.5,14 12,18 C13,15 12.5,11 11,8 C12,7.5 14,8 16,9 C14,5 11,2 8,0Z"
const LEAF_MD = "M10,0 C7,3 3,6 0,12 C2.5,10 5,9 6.5,10 C4.5,14 3.5,18 5,22 C7,18 9,15 10,12 C11,15 13,18 15,22 C16.5,18 15.5,14 13.5,10 C15,9 17.5,10 20,12 C17,6 13,3 10,0Z"
const LEAF_LG = "M12,0 C8,4 3,7 0,14 C3,12 6,11 8,12 C5.5,17 4,22 6,26 C8.5,21 11,17 12,14 C13,17 15.5,21 18,26 C20,22 18.5,17 16,12 C18,11 21,12 24,14 C21,7 16,4 12,0Z"
const LEAF_BUD = "M5,0 C3,2 1,4 0,7 C2,6 3,6 4,6.5 C3,9 2.5,12 3.5,14 C4.5,11 5,9 5.5,7 C6,9 6.5,11 7.5,14 C8.5,12 8,9 7,6.5 C8,6 9,6 11,7 C10,4 8,2 5,0Z"

export default function MobileCornerLeaves() {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) return null

  return (
    <div className="lg:hidden fixed inset-0 z-[51] pointer-events-none" aria-hidden="true">
      {/* Top-left cluster */}
      <svg className="absolute top-0 left-0 w-[70px] h-[90px]" viewBox="0 0 80 100" fill="none">
        <g transform="translate(8,8) rotate(-25,10,12)">
          <path d={LEAF_LG} fill="var(--color-secondary)" opacity="0.3" />
        </g>
        <g transform="translate(30,5) rotate(15,8,9) scale(0.85)">
          <path d={LEAF_MD} fill="var(--color-secondary)" opacity="0.22" />
        </g>
        <g transform="translate(5,40) rotate(-40,10,12) scale(1.1)">
          <path d={LEAF_MD} fill="var(--color-accent)" opacity="0.2" />
        </g>
        <g transform="translate(35,35) rotate(30,5,7) scale(0.7)">
          <path d={LEAF_SM} fill="var(--color-secondary)" opacity="0.18" />
        </g>
        <g transform="translate(18,65) rotate(-10,6,7) scale(0.6)">
          <path d={LEAF_BUD} fill="var(--color-secondary)" opacity="0.15" />
        </g>
        {/* Vine tendril */}
        <path d="M10,0 C15,20 25,40 20,70 C18,80 15,90 12,100" stroke="var(--color-secondary)" strokeWidth="1.2" opacity="0.15" fill="none" />
      </svg>

      {/* Bottom-right cluster (mirrored) */}
      <svg className="absolute bottom-0 right-0 w-[70px] h-[90px]" style={{ transform: 'scaleX(-1) scaleY(-1)' }} viewBox="0 0 80 100" fill="none">
        <g transform="translate(8,8) rotate(-25,10,12)">
          <path d={LEAF_LG} fill="var(--color-secondary)" opacity="0.3" />
        </g>
        <g transform="translate(30,5) rotate(15,8,9) scale(0.85)">
          <path d={LEAF_MD} fill="var(--color-secondary)" opacity="0.22" />
        </g>
        <g transform="translate(5,40) rotate(-40,10,12) scale(1.1)">
          <path d={LEAF_MD} fill="var(--color-primary)" opacity="0.2" />
        </g>
        <g transform="translate(35,35) rotate(30,5,7) scale(0.7)">
          <path d={LEAF_SM} fill="var(--color-secondary)" opacity="0.18" />
        </g>
        <path d="M10,0 C15,20 25,40 20,70 C18,80 15,90 12,100" stroke="var(--color-secondary)" strokeWidth="1.2" opacity="0.15" fill="none" />
      </svg>
    </div>
  )
}
