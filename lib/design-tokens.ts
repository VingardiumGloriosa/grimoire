import type { Element } from "@/lib/types"

/**
 * Shared design tokens for element and chakra badge styles.
 * Import from here instead of defining locally in each component.
 */

/** Ordered list of elemental types */
export const ELEMENTS: Element[] = ["Fire", "Water", "Earth", "Air", "Spirit"]

/** Element badge styles for pills/tags (bg + text color) */
export const ELEMENT_BADGE_STYLES: Record<string, string> = {
  Fire: "bg-blush/15 text-blush",
  Water: "bg-[var(--color-primary-subtle)] text-[var(--color-secondary)]",
  Earth: "bg-gold-subtle dark:bg-linen text-umber dark:text-warm-grey",
  Air: "bg-sage-mist dark:bg-linen text-forest",
  Spirit: "bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]",
}

/** Element bar colors for charts/visualizations */
export const ELEMENT_BAR_COLORS: Record<Element, string> = {
  Fire: "bg-blush",
  Water: "bg-[var(--color-secondary)]",
  Earth: "bg-forest",
  Air: "bg-[var(--color-accent)]",
  Spirit: "bg-[var(--color-text-muted)]",
}

/** Chakra badge styles */
export const CHAKRA_BADGE_STYLES: Record<string, string> = {
  Root: "bg-blush/15 text-blush",
  Sacral: "bg-gold-subtle dark:bg-linen text-umber dark:text-warm-grey",
  "Solar Plexus": "bg-gold-subtle dark:bg-linen text-[#9a7b2a]",
  Heart: "bg-sage-mist dark:bg-linen text-forest",
  Throat: "bg-[var(--color-primary-subtle)] text-[var(--color-secondary)]",
  "Third Eye": "bg-[#2a1a4a]/15 text-[#6a4a9b]",
  Crown: "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]",
}
