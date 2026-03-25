import type { NumerologyResults } from "@/lib/types"

/** Maps result keys to human-readable category labels */
export const CATEGORY_MAP: Record<keyof NumerologyResults, string> = {
  life_path: "Life Path",
  expression: "Expression",
  soul_urge: "Soul Urge",
  personality: "Personality",
  birthday: "Birthday",
  maturity: "Maturity",
}

/** Short descriptions of what each number type represents */
export const CATEGORY_DESCRIPTIONS: Record<keyof NumerologyResults, string> = {
  life_path: "Your life's purpose and the path you walk.",
  expression: "How you express yourself and your natural talents.",
  soul_urge: "Your inner desires and what truly motivates you.",
  personality: "How others perceive you at first meeting.",
  birthday: "A special gift or talent you carry.",
  maturity: "The wisdom you grow into over time.",
}
