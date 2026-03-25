/**
 * seed-numerology.ts
 *
 * Reads data/numerology-interpretations.json and upserts into
 * the numerology_interpretations table.
 *
 * Usage: npx tsx scripts/seed-numerology.ts
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
  number: number
  category: string
  title: string
  description: string
  keywords: string[]
  strengths: string[]
  challenges: string[]
  compatible_numbers: number[]
}

async function main() {
  const dataPath = path.join(process.cwd(), 'data', 'numerology.json')
  if (!fs.existsSync(dataPath)) {
    console.error(`${dataPath} not found.`)
    process.exit(1)
  }

  const items: InterpretationData[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  console.log(`Read ${items.length} numerology interpretations`)

  const supabase = createClient(supabaseUrl!, serviceRoleKey!)

  const batchSize = 20
  let upserted = 0

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const { error } = await supabase.from('numerology_interpretations').upsert(
      batch.map((item) => ({
        number: item.number,
        category: item.category,
        title: item.title,
        description: item.description,
        keywords: item.keywords,
        strengths: item.strengths,
        challenges: item.challenges,
        compatible_numbers: item.compatible_numbers,
      })),
      { onConflict: 'number,category', ignoreDuplicates: false }
    )

    if (error) {
      console.error(`Error upserting batch at index ${i}:`, error)
      process.exit(1)
    }
    upserted += batch.length
    console.log(`Upserted ${upserted}/${items.length}...`)
  }

  console.log(`\nDone! Seeded ${upserted} numerology interpretations.`)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
