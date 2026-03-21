/**
 * seed-cards.ts
 *
 * Reads the transformed card data from data/tarot.json and upserts each card
 * into the Supabase tarot_cards table.
 *
 * Prerequisites:
 *   - Run transform-kaggle.ts first to generate data/tarot.json
 *   - Run schema.sql in Supabase to create the tarot_cards table
 *   - .env.local must have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage: npx tsx scripts/seed-cards.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

// ─── Load .env.local ─────────────────────────────────────────

const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim()
    if (key) {
      process.env[key] = value
    }
  }
  console.log('Loaded environment from .env.local')
} else {
  console.log('No .env.local found, using existing environment variables')
}

// ─── Validate env ────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  )
  process.exit(1)
}

// ─── Types ───────────────────────────────────────────────────

interface TransformedCard {
  name: string
  number: string
  arcana: string
  suit: string
  image_path: string
  fortune_telling: string[]
  keywords: string[]
  meanings: {
    light: string[]
    shadow: string[]
  }
  archetype: string | null
  hebrew_alphabet: string | null
  numerology: string | null
  elemental: string | null
  mythical_spiritual: string | null
  questions_to_ask: string[]
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  const dataPath = path.join(process.cwd(), 'data', 'tarot.json')

  if (!fs.existsSync(dataPath)) {
    console.error(
      `${dataPath} not found. Run transform-kaggle.ts first:\n  npx tsx scripts/transform-kaggle.ts`
    )
    process.exit(1)
  }

  const raw = fs.readFileSync(dataPath, 'utf-8')
  const cards: TransformedCard[] = JSON.parse(raw)

  console.log(`Read ${cards.length} cards from ${dataPath}`)

  const supabase = createClient(supabaseUrl!, serviceRoleKey!)

  // Upsert in batches of 20 for reliability
  const batchSize = 20
  let upserted = 0

  for (let i = 0; i < cards.length; i += batchSize) {
    const batch = cards.slice(i, i + batchSize)

    const { error } = await supabase.from('tarot_cards').upsert(
      batch.map((card) => ({
        name: card.name,
        number: card.number,
        arcana: card.arcana,
        suit: card.suit,
        image_path: card.image_path,
        fortune_telling: card.fortune_telling,
        keywords: card.keywords,
        meanings: card.meanings,
        archetype: card.archetype,
        hebrew_alphabet: card.hebrew_alphabet,
        numerology: card.numerology,
        elemental: card.elemental,
        mythical_spiritual: card.mythical_spiritual,
        questions_to_ask: card.questions_to_ask,
      })),
      { onConflict: 'name', ignoreDuplicates: false }
    )

    if (error) {
      console.error(`Error upserting batch starting at index ${i}:`, error)
      process.exit(1)
    }

    upserted += batch.length
    console.log(`Upserted ${upserted}/${cards.length} cards...`)
  }

  console.log(`\nDone! Successfully seeded ${upserted} cards into tarot_cards.`)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
