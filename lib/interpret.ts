import { createServerClient } from './supabase-server'
import type { ReadingCard, SynthesisTemplate, TemplateRole } from './types'

// ─── Types ───

interface SynthesisContext {
  spread_name: string
  cards: ReadingCard[]
  intention: string | null
  mood: string | null
}

// ─── Helpers ───

/**
 * Replace all {{key}} placeholders in a template string with values from vars.
 * Unmatched placeholders are replaced with empty strings.
 */
function interpolate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return vars[key] ?? ''
  })
}

/**
 * Fetch all synthesis templates from Supabase and return a map of role → template string.
 */
async function fetchTemplateMap(): Promise<Record<TemplateRole, string>> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('tarot_synthesis_templates')
    .select('*')

  if (error) {
    throw new Error(`Failed to fetch synthesis templates: ${error.message}`)
  }

  const templates = data as SynthesisTemplate[]
  const map: Partial<Record<TemplateRole, string>> = {}

  for (const t of templates) {
    map[t.role] = t.template
  }

  // Provide sensible defaults in case templates are missing from DB
  return {
    intro:
      map.intro ??
      'Your {{spread_name}} spread calls upon {{card_count}} cards to illuminate the path before you.',
    major_arcana_note:
      map.major_arcana_note ??
      ' {{major_arcana_count}} of them Major Arcana \u2014 pointing to themes that transcend the everyday.',
    position_block:
      map.position_block ??
      'In the position of **{{position_label}}**, the {{card_name}} appears {{orientation}}. {{meaning}} Keywords that surface: {{keywords}}.',
    reversed_note:
      map.reversed_note ??
      'Drawn in reversal, this energy may be blocked, internalised, or asking for your attention in a different way.',
    closing:
      map.closing ??
      'Sit with what has surfaced. The cards reflect \u2014 they do not dictate.',
  }
}

// ─── Main ───

/**
 * Generate a synthesis narrative for a tarot reading.
 *
 * No LLM calls — this is pure template interpolation against card data
 * and user-editable templates stored in Supabase.
 */
export async function generateSynthesis(
  context: SynthesisContext
): Promise<string> {
  const templateMap = await fetchTemplateMap()

  // Sort cards by position order
  const sortedCards = [...context.cards].sort(
    (a, b) => a.position_order - b.position_order
  )

  // Compute metadata
  const cardCount = sortedCards.length
  const majorArcanaCount = sortedCards.filter(
    (c) => c.archetype !== null && c.archetype !== ''
  ).length

  // Shared variables available to all templates
  const globalVars: Record<string, string> = {
    spread_name: context.spread_name,
    card_count: String(cardCount),
    major_arcana_count: String(majorArcanaCount),
    intention: context.intention ?? '',
    mood: context.mood ?? '',
  }

  // ── Intro ──
  let intro = interpolate(templateMap.intro, globalVars)

  // Append major arcana note if any major arcana are present
  if (majorArcanaCount > 0) {
    intro += interpolate(templateMap.major_arcana_note, globalVars)
  }

  // ── Position blocks ──
  const positionBlocks: string[] = []

  for (const card of sortedCards) {
    // Pick meanings based on orientation
    const meanings =
      card.orientation === 'upright'
        ? card.meanings.light
        : card.meanings.shadow

    const cardVars: Record<string, string> = {
      ...globalVars,
      position_label: card.position_label,
      card_name: card.card_name,
      orientation: card.orientation,
      meaning: meanings.join('. '),
      keywords: card.keywords.join(', '),
      fortune_telling: card.fortune_telling.join('. '),
      questions: card.questions_to_ask.join(' '),
      archetype: card.archetype ?? '',
      numerology: card.numerology ?? '',
      elemental: card.elemental ?? '',
    }

    let block = interpolate(templateMap.position_block, cardVars)

    // Append reversed note if the card is reversed
    if (card.orientation === 'reversed') {
      block += ' ' + interpolate(templateMap.reversed_note, cardVars)
    }

    positionBlocks.push(block)
  }

  // ── Closing ──
  const closing = interpolate(templateMap.closing, globalVars)

  // ── Assemble ──
  const sections = [intro, ...positionBlocks, closing]
  return sections.join('\n\n')
}
