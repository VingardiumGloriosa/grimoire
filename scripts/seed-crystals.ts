/**
 * seed-crystals.ts
 *
 * Two-phase seed:
 *   Phase 1: Upsert stones from data/crystals.json
 *   Phase 2: Look up stone UUIDs by name, upsert intentions with resolved stone_ids
 *
 * Usage: npx tsx scripts/seed-crystals.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

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
    if (key) process.env[key] = value
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

interface StoneData {
  name: string
  description: string
  color: string
  chakra: string
  chakras: string[]
  element: string
  image_path?: string
  hardness: string
  healing_properties: string[]
  magical_uses: string[]
  cleansing_methods: string[]
  zodiac_signs: string[]
  planetary_ruler: string
  affirmation: string
  cautions: string[]
}

interface IntentionData {
  name: string
  description: string
  icon: string
  stone_names: string[]
}

async function main() {
  const stonesPath = path.join(process.cwd(), 'data', 'crystals.json')
  const intentionsPath = path.join(process.cwd(), 'data', 'crystal-intentions.json')

  if (!fs.existsSync(stonesPath)) {
    console.error(`${stonesPath} not found.`)
    process.exit(1)
  }
  if (!fs.existsSync(intentionsPath)) {
    console.error(`${intentionsPath} not found.`)
    process.exit(1)
  }

  const stones: StoneData[] = JSON.parse(fs.readFileSync(stonesPath, 'utf-8'))
  const intentions: IntentionData[] = JSON.parse(fs.readFileSync(intentionsPath, 'utf-8'))

  const supabase = createClient(supabaseUrl!, serviceRoleKey!)

  // ── Phase 1: Upsert stones ──
  console.log(`Phase 1: Seeding ${stones.length} crystals...`)

  const batchSize = 20
  let upserted = 0

  for (let i = 0; i < stones.length; i += batchSize) {
    const batch = stones.slice(i, i + batchSize)
    const { error } = await supabase.from('crystals_stones').upsert(
      batch.map((s) => ({
        name: s.name,
        description: s.description,
        color: s.color,
        chakra: s.chakra,
        chakras: s.chakras,
        element: s.element,
        image_path: s.image_path || null,
        hardness: s.hardness,
        healing_properties: s.healing_properties,
        magical_uses: s.magical_uses,
        cleansing_methods: s.cleansing_methods,
        zodiac_signs: s.zodiac_signs,
        planetary_ruler: s.planetary_ruler,
        affirmation: s.affirmation,
        cautions: s.cautions,
      })),
      { onConflict: 'name', ignoreDuplicates: false }
    )

    if (error) {
      console.error(`Error upserting stones batch at index ${i}:`, error)
      process.exit(1)
    }
    upserted += batch.length
    console.log(`  Stones: ${upserted}/${stones.length}`)
  }

  // ── Phase 2: Resolve stone names to UUIDs and upsert intentions ──
  console.log(`\nPhase 2: Resolving stone names and seeding ${intentions.length} intentions...`)

  // Build name → UUID map
  const { data: allStones, error: fetchError } = await supabase
    .from('crystals_stones')
    .select('id, name')

  if (fetchError) {
    console.error('Failed to fetch stones for ID resolution:', fetchError)
    process.exit(1)
  }

  const nameToId: Record<string, string> = {}
  for (const s of allStones || []) {
    nameToId[s.name.toLowerCase()] = s.id
  }

  for (const intention of intentions) {
    const stoneIds: string[] = []
    for (const name of intention.stone_names) {
      const id = nameToId[name.toLowerCase()]
      if (id) {
        stoneIds.push(id)
      } else {
        console.warn(`  Warning: stone "${name}" not found for intention "${intention.name}"`)
      }
    }

    const { error } = await supabase.from('crystals_intentions').upsert(
      {
        name: intention.name,
        description: intention.description,
        icon: intention.icon,
        stone_ids: stoneIds,
      },
      { onConflict: 'name', ignoreDuplicates: false }
    )

    if (error) {
      console.error(`Error upserting intention "${intention.name}":`, error)
      process.exit(1)
    }
    console.log(`  Intention: ${intention.name} (${stoneIds.length} stones)`)
  }

  console.log(`\nDone! Seeded ${upserted} crystals and ${intentions.length} intentions.`)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
