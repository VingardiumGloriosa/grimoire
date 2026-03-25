import type { ZodiacSign } from "@/lib/types"
import { ELEMENT_BADGE_STYLES } from "@/lib/design-tokens"

const SIGN_ELEMENTS: Record<ZodiacSign, "Fire" | "Earth" | "Air" | "Water"> = {
  Aries: "Fire",
  Leo: "Fire",
  Sagittarius: "Fire",
  Taurus: "Earth",
  Virgo: "Earth",
  Capricorn: "Earth",
  Gemini: "Air",
  Libra: "Air",
  Aquarius: "Air",
  Cancer: "Water",
  Scorpio: "Water",
  Pisces: "Water",
}

interface SignBadgeProps {
  sign: string
  size?: "sm" | "md"
}

export default function SignBadge({ sign, size = "sm" }: SignBadgeProps) {
  const element = SIGN_ELEMENTS[sign as ZodiacSign] ?? "Earth"
  const colorClasses = ELEMENT_BADGE_STYLES[element]

  return (
    <span
      className={`inline-flex items-center rounded-full font-body font-medium uppercase tracking-wider ${colorClasses} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      {sign}
    </span>
  )
}
