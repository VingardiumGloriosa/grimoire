import { createClient } from './supabase'
import type { Herb } from './types'

const TABLE = 'herbology_herbs'

export async function getAllHerbs(): Promise<Herb[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(`Failed to fetch herbs: ${error.message}`)
  return data as Herb[]
}

export async function getHerbById(id: string): Promise<Herb | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch herb: ${error.message}`)
  }
  return data as Herb
}

export async function searchHerbs(query: string): Promise<Herb[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .or(`name.ilike.%${query}%,latin_name.ilike.%${query}%`)
    .order('name', { ascending: true })

  if (error) throw new Error(`Failed to search herbs: ${error.message}`)
  return data as Herb[]
}

export async function getHerbsByElement(element: string): Promise<Herb[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('element', element)
    .order('name', { ascending: true })

  if (error) throw new Error(`Failed to fetch herbs by element: ${error.message}`)
  return data as Herb[]
}

export async function getHerbsByPlanet(planet: string): Promise<Herb[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('planetary_ruler', planet)
    .order('name', { ascending: true })

  if (error) throw new Error(`Failed to fetch herbs by planet: ${error.message}`)
  return data as Herb[]
}

export async function getHerbsByChakra(chakra: string): Promise<Herb[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('chakra', chakra)
    .order('name', { ascending: true })

  if (error) throw new Error(`Failed to fetch herbs by chakra: ${error.message}`)
  return data as Herb[]
}
