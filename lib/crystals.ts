import { createClient } from './supabase'
import type { Crystal, CrystalIntention } from './types'

const STONES_TABLE = 'crystals_stones'
const INTENTIONS_TABLE = 'crystals_intentions'

export async function getAllStones(): Promise<Crystal[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(STONES_TABLE)
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(`Failed to fetch crystals: ${error.message}`)
  return data as Crystal[]
}

export async function getStoneById(id: string): Promise<Crystal | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(STONES_TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch crystal: ${error.message}`)
  }
  return data as Crystal
}

export async function searchStones(query: string): Promise<Crystal[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(STONES_TABLE)
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name', { ascending: true })

  if (error) throw new Error(`Failed to search crystals: ${error.message}`)
  return data as Crystal[]
}

export async function getStonesByElement(element: string): Promise<Crystal[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(STONES_TABLE)
    .select('*')
    .eq('element', element)
    .order('name', { ascending: true })

  if (error) throw new Error(`Failed to fetch crystals by element: ${error.message}`)
  return data as Crystal[]
}

export async function getStonesByChakra(chakra: string): Promise<Crystal[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(STONES_TABLE)
    .select('*')
    .eq('chakra', chakra)
    .order('name', { ascending: true })

  if (error) throw new Error(`Failed to fetch crystals by chakra: ${error.message}`)
  return data as Crystal[]
}

export async function getAllIntentions(): Promise<CrystalIntention[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(INTENTIONS_TABLE)
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(`Failed to fetch crystal intentions: ${error.message}`)
  return data as CrystalIntention[]
}

export async function getStonesForIntention(intentionId: string): Promise<Crystal[]> {
  const supabase = createClient()

  // First get the intention to retrieve stone_ids
  const { data: intention, error: intentionError } = await supabase
    .from(INTENTIONS_TABLE)
    .select('stone_ids')
    .eq('id', intentionId)
    .single()

  if (intentionError) throw new Error(`Failed to fetch intention: ${intentionError.message}`)
  if (!intention) return []

  const stoneIds = intention.stone_ids as string[]
  if (stoneIds.length === 0) return []

  const { data, error } = await supabase
    .from(STONES_TABLE)
    .select('*')
    .in('id', stoneIds)

  if (error) throw new Error(`Failed to fetch stones for intention: ${error.message}`)
  return data as Crystal[]
}
