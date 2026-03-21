import { createClient } from './supabase'
import type { TarotCard } from './types'

const TABLE = 'tarot_cards'

/**
 * Fetch all 78 cards, ordered by their number field.
 */
export async function getAllCards(): Promise<TarotCard[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('number', { ascending: true })

  if (error) throw new Error(`Failed to fetch cards: ${error.message}`)
  return data as TarotCard[]
}

/**
 * Fetch a single card by its UUID.
 */
export async function getCardById(id: string): Promise<TarotCard | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw new Error(`Failed to fetch card: ${error.message}`)
  }
  return data as TarotCard
}

/**
 * Fetch multiple cards by an array of UUIDs.
 */
export async function getCardsByIds(ids: string[]): Promise<TarotCard[]> {
  if (ids.length === 0) return []

  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .in('id', ids)

  if (error) throw new Error(`Failed to fetch cards by ids: ${error.message}`)
  return data as TarotCard[]
}

/**
 * Search cards by name using case-insensitive partial match.
 */
export async function searchCards(query: string): Promise<TarotCard[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .ilike('name', `%${query}%`)
    .order('number', { ascending: true })

  if (error) throw new Error(`Failed to search cards: ${error.message}`)
  return data as TarotCard[]
}

/**
 * Filter cards by suit (e.g. "Cups", "Swords", "Wands", "Pentacles", "Trump").
 */
export async function getCardsBySuit(suit: string): Promise<TarotCard[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('suit', suit)
    .order('number', { ascending: true })

  if (error) throw new Error(`Failed to fetch cards by suit: ${error.message}`)
  return data as TarotCard[]
}

/**
 * Filter cards by arcana ("Major Arcana" or "Minor Arcana").
 */
export async function getCardsByArcana(arcana: string): Promise<TarotCard[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('arcana', arcana)
    .order('number', { ascending: true })

  if (error) throw new Error(`Failed to fetch cards by arcana: ${error.message}`)
  return data as TarotCard[]
}
