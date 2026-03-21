/**
 * transform-kaggle.ts
 *
 * Reads the Kaggle source dataset (tarot-data/tarot-images.json) and transforms
 * it into the app-shaped format expected by the seed script and the database.
 *
 * Usage: npx tsx scripts/transform-kaggle.ts
 * Output: data/tarot.json
 */

import * as fs from 'fs/promises'
import * as path from 'path'

interface KaggleCard {
  name: string
  number: string
  arcana: string
  suit: string
  img: string
  fortune_telling: string[]
  keywords: string[]
  meanings: {
    light: string[]
    shadow: string[]
  }
  Archetype?: string
  'Hebrew Alphabet'?: string
  Numerology?: string
  Elemental?: string
  'Mythical/Spiritual'?: string
  'Questions to Ask'?: string[]
}

interface KaggleDataset {
  description: string
  cards: KaggleCard[]
}

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

async function main() {
  const rootDir = process.cwd()
  const inputPath = path.join(rootDir, 'tarot-data', 'tarot-images.json')
  const outputPath = path.join(rootDir, 'data', 'tarot.json')

  console.log(`Reading source: ${inputPath}`)
  const raw = await fs.readFile(inputPath, 'utf-8')
  const dataset: KaggleDataset = JSON.parse(raw)

  console.log(`Found ${dataset.cards.length} cards in source dataset`)

  const transformed: TransformedCard[] = dataset.cards.map((card) => ({
    name: card.name,
    number: card.number,
    arcana: card.arcana,
    suit: card.suit,
    image_path: `/cards/${card.img}`,
    fortune_telling: card.fortune_telling,
    keywords: card.keywords,
    meanings: card.meanings,
    archetype: card.Archetype ?? null,
    hebrew_alphabet: card['Hebrew Alphabet'] ?? null,
    numerology: card.Numerology ?? null,
    elemental: card.Elemental ?? null,
    mythical_spiritual: card['Mythical/Spiritual'] ?? null,
    questions_to_ask: card['Questions to Ask'] ?? [],
  }))

  // Ensure output directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true })

  await fs.writeFile(outputPath, JSON.stringify(transformed, null, 2), 'utf-8')
  console.log(`Wrote ${transformed.length} cards to ${outputPath}`)
}

main().catch((err) => {
  console.error('Transform failed:', err)
  process.exit(1)
})
