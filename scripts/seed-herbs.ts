/**
 * seed-herbs.ts
 *
 * Reads data/herbology.json and upserts into the herbology_herbs table.
 *
 * Usage: npx tsx scripts/seed-herbs.ts
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

interface HerbData {
  name: string
  latin_name: string
  description: string
  planetary_ruler: string
  element: string
  chakra: string
  image_path?: string
  magical_uses: string[]
  medicinal_notes: string[]
  warnings: string[]
  folklore: string
  growing_season: string
  correspondences: {
    deities: string[]
    zodiac: string[]
    festivals: string[]
  }
}

async function main() {
  const dataPath = path.join(process.cwd(), 'data', 'herbology.json')
  if (!fs.existsSync(dataPath)) {
    console.error(`${dataPath} not found.`)
    process.exit(1)
  }

  const items: HerbData[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  console.log(`Read ${items.length} herbs`)

  const supabase = createClient(supabaseUrl!, serviceRoleKey!)

  const batchSize = 20
  let upserted = 0

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const { error } = await supabase.from('herbology_herbs').upsert(
      batch.map((item) => ({
        name: item.name,
        latin_name: item.latin_name,
        description: item.description,
        planetary_ruler: item.planetary_ruler,
        element: item.element,
        chakra: item.chakra,
        image_path: item.image_path || null,
        magical_uses: item.magical_uses,
        medicinal_notes: item.medicinal_notes,
        warnings: item.warnings,
        folklore: item.folklore,
        growing_season: item.growing_season,
        correspondences: item.correspondences,
      })),
      { onConflict: 'name', ignoreDuplicates: false }
    )

    if (error) {
      console.error(`Error upserting batch at index ${i}:`, error)
      process.exit(1)
    }
    upserted += batch.length
    console.log(`Upserted ${upserted}/${items.length}...`)
  }

  console.log(`\nDone! Seeded ${upserted} herbs.`)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
