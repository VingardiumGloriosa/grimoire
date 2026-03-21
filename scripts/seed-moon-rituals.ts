/**
 * seed-moon-rituals.ts
 *
 * Reads data/moon-rituals.json and upserts into the moon_rituals table.
 *
 * Usage: npx tsx scripts/seed-moon-rituals.ts
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

interface RitualData {
  phase: string
  phase_label: string
  description: string
  rituals: string[]
  intentions: string[]
  activities: string[]
  avoid: string[]
  crystals: string[]
  herbs: string[]
}

async function main() {
  const dataPath = path.join(process.cwd(), 'data', 'moon-rituals.json')
  if (!fs.existsSync(dataPath)) {
    console.error(`${dataPath} not found.`)
    process.exit(1)
  }

  const items: RitualData[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  console.log(`Read ${items.length} moon rituals`)

  const supabase = createClient(supabaseUrl!, serviceRoleKey!)

  const { error } = await supabase.from('moon_rituals').upsert(
    items.map((item) => ({
      phase: item.phase,
      phase_label: item.phase_label,
      description: item.description,
      rituals: item.rituals,
      intentions: item.intentions,
      activities: item.activities,
      avoid: item.avoid,
      crystals: item.crystals,
      herbs: item.herbs,
    })),
    { onConflict: 'phase', ignoreDuplicates: false }
  )

  if (error) {
    console.error('Error upserting moon rituals:', error)
    process.exit(1)
  }

  console.log(`\nDone! Seeded ${items.length} moon rituals.`)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
