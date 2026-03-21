import type { ZodiacSign } from "@/lib/types"

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

const ELEMENT_STYLES: Record<string, string> = {
  Fire: "bg-blush/15 text-blush",
  Earth: "bg-sage-mist text-forest",
  Air: "bg-gold-subtle text-umber",
  Water: "bg-[var(--color-primary-subtle)] text-[var(--color-secondary)]",
}

interface SignBadgeProps {
  sign: string
  size?: "sm" | "md"
}

export default function SignBadge({ sign, size = "sm" }: SignBadgeProps) {
  const element = SIGN_ELEMENTS[sign as ZodiacSign] ?? "Earth"
  const colorClasses = ELEMENT_STYLES[element]

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
