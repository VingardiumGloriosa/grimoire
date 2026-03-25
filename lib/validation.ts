import { z } from 'zod'
import { NextResponse } from 'next/server'

// ─── Shared ──────────────────────────────────────────

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
const timeString = z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM')

// ─── Tarot Readings ──────────────────────────────────

export const createReadingSchema = z.object({
  spread_name: z.string().min(1).max(200),
  spread_positions: z.array(z.object({
    id: z.string(),
    label: z.string(),
    x: z.number(),
    y: z.number(),
    order: z.number().int(),
  })).min(1).max(30),
  cards: z.array(z.object({
    card_id: z.string(),
    card_name: z.string(),
    position_label: z.string(),
    position_order: z.number().int(),
    orientation: z.enum(['upright', 'reversed']),
    image_path: z.string(),
    keywords: z.array(z.string()),
    meanings: z.object({
      light: z.array(z.string()),
      shadow: z.array(z.string()),
    }),
    fortune_telling: z.array(z.string()),
    questions_to_ask: z.array(z.string()),
    archetype: z.string().nullable().default(null),
    numerology: z.string().nullable().default(null),
    elemental: z.string().nullable().default(null),
  })).min(1).max(30),
  intention: z.string().max(1000).nullable().default(null),
  date: dateString.optional(),
  mood: z.string().max(100).nullable().default(null),
  visibility: z.enum(['private', 'public']).default('private'),
})

export const updateReadingNotesSchema = z.object({
  id: z.string().uuid(),
  notes: z.string().max(10000),
})

// ─── Spreads ─────────────────────────────────────────

const positionSchema = z.object({
  id: z.string(),
  label: z.string().min(1).max(100),
  x: z.number(),
  y: z.number(),
  order: z.number().int(),
})

export const createSpreadSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  positions: z.array(positionSchema).min(1).max(30),
})

export const updateSpreadSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  positions: z.array(positionSchema).min(1).max(30),
})

// ─── Dreams ──────────────────────────────────────────

export const createDreamSchema = z.object({
  date: dateString.optional(),
  title: z.string().min(1).max(300),
  content: z.string().min(1).max(20000),
  mood: z.string().max(100).nullable().optional(),
  vividness: z.number().int().min(1).max(5).optional(),
  lucid: z.boolean().optional(),
  recurring: z.boolean().optional(),
  symbols: z.array(z.object({
    symbol_id: z.string().nullable().optional(),
    symbol_name: z.string(),
    is_personal: z.boolean().optional(),
  })).max(50).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
})

export const updateDreamSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(300).optional(),
  content: z.string().min(1).max(20000).optional(),
  mood: z.string().max(100).nullable().optional(),
  vividness: z.number().int().min(1).max(5).optional(),
  lucid: z.boolean().optional(),
  recurring: z.boolean().optional(),
  symbols: z.array(z.object({
    symbol_id: z.string().nullable().optional(),
    symbol_name: z.string(),
    is_personal: z.boolean().optional(),
  })).max(50).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
})

// ─── Moon Journal ────────────────────────────────────

export const createMoonJournalSchema = z.object({
  date: dateString,
  title: z.string().min(1).max(300),
  content: z.string().min(1).max(20000),
  mood: z.string().max(100).nullable().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
})

export const updateMoonJournalSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(300).optional(),
  content: z.string().min(1).max(20000).optional(),
  mood: z.string().max(100).nullable().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
})

// ─── Numerology ──────────────────────────────────────

export const createNumerologyChartSchema = z.object({
  label: z.string().min(1).max(200),
  full_name: z.string().min(1).max(200),
  birth_date: dateString,
})

// ─── Herbology ───────────────────────────────────────

export const createBlendSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  herbs: z.array(z.object({
    herb_id: z.string(),
    herb_name: z.string(),
    element: z.enum(['Fire', 'Water', 'Earth', 'Air', 'Spirit']),
    planetary_ruler: z.string(),
  })).min(1).max(30),
  intention: z.string().max(500).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
})

// ─── Crystals ────────────────────────────────────────

export const addCrystalSchema = z.object({
  stone_id: z.string().uuid(),
  notes: z.string().max(2000).nullable().optional(),
  acquired_date: dateString.nullable().optional(),
})

// ─── Astrology ───────────────────────────────────────

export const createBirthChartSchema = z.object({
  label: z.string().min(1).max(200),
  birth_date: dateString,
  birth_time: timeString.nullable().optional(),
  birth_location: z.string().min(1).max(300),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().max(100).optional(),
})

// ─── Helper ──────────────────────────────────────────

export function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): { success: true; data: T } | { success: false; error: NextResponse } {
  const result = schema.safeParse(body)
  if (!result.success) {
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      ),
    }
  }
  return { success: true, data: result.data }
}
