import { createClient } from './supabase'
import type { DreamSymbol } from './types'

const TABLE = 'dreams_symbols'

export async function getAllSymbols(): Promise<DreamSymbol[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(`Failed to fetch dream symbols: ${error.message}`)
  return data as DreamSymbol[]
}

export async function getSymbolById(id: string): Promise<DreamSymbol | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch symbol: ${error.message}`)
  }
  return data as DreamSymbol
}

export async function searchSymbols(query: string): Promise<DreamSymbol[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name', { ascending: true })

  if (error) throw new Error(`Failed to search symbols: ${error.message}`)
  return data as DreamSymbol[]
}

export async function getSymbolsByCategory(category: string): Promise<DreamSymbol[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('category', category)
    .order('name', { ascending: true })

  if (error) throw new Error(`Failed to fetch symbols by category: ${error.message}`)
  return data as DreamSymbol[]
}
