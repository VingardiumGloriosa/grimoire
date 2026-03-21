/**
 * seed-astrology.ts
 *
 * Reads data/astrology-interpretations.json and upserts into
 * the astrology_interpretations table.
 *
 * Usage: npx tsx scripts/seed-astrology.ts
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

interface InterpretationData {
  category: string
  key: string
  title: string
  description: string
  keywords: string[]
  element: string | null
  modality: string | null
  ruling_planet: string | null
}

async function main() {
  const dataPath = path.join(process.cwd(), 'data', 'astrology-interpretations.json')
  if (!fs.existsSync(dataPath)) {
    console.error(`${dataPath} not found.`)
    process.exit(1)
  }

  const items: InterpretationData[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  console.log(`Read ${items.length} astrology interpretations`)

  const supabase = createClient(supabaseUrl!, serviceRoleKey!)

  const batchSize = 20
  let upserted = 0

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const { error } = await supabase.from('astrology_interpretations').upsert(
      batch.map((item) => ({
        category: item.category,
        key: item.key,
        title: item.title,
        description: item.description,
        keywords: item.keywords,
        element: item.element,
        modality: item.modality,
        ruling_planet: item.ruling_planet,
      })),
      { onConflict: 'category,key', ignoreDuplicates: false }
    )

    if (error) {
      console.error(`Error upserting batch at index ${i}:`, error)
      process.exit(1)
    }
    upserted += batch.length
    console.log(`Upserted ${upserted}/${items.length}...`)
  }

  console.log(`\nDone! Seeded ${upserted} astrology interpretations.`)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
