import { createClient } from './supabase'
import type { AstrologyInterpretation } from './types'

const TABLE = 'astrology_interpretations'

export async function getAllInterpretations(): Promise<AstrologyInterpretation[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('category', { ascending: true })

  if (error) throw new Error(`Failed to fetch astrology interpretations: ${error.message}`)
  return data as AstrologyInterpretation[]
}

export async function getInterpretation(
  category: string,
  key: string
): Promise<AstrologyInterpretation | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('category', category)
    .eq('key', key)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch interpretation: ${error.message}`)
  }
  return data as AstrologyInterpretation
}

export async function getInterpretationsByCategory(
  category: string
): Promise<AstrologyInterpretation[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('category', category)
    .order('key', { ascending: true })

  if (error) throw new Error(`Failed to fetch interpretations: ${error.message}`)
  return data as AstrologyInterpretation[]
}
