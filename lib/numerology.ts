import { createClient } from './supabase'
import type { NumerologyInterpretation, NumerologyResults } from './types'

const TABLE = 'numerology_interpretations'

// ─── Pythagorean letter-to-number mapping ───

const LETTER_VALUES: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
}

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u'])
const MASTER_NUMBERS = new Set([11, 22, 33])

// ─── Core calculation helpers ───

/**
 * Reduce a number to a single digit, preserving master numbers (11, 22, 33).
 */
export function reduceToSingleDigit(n: number): number {
  while (n > 9 && !MASTER_NUMBERS.has(n)) {
    let sum = 0
    while (n > 0) {
      sum += n % 10
      n = Math.floor(n / 10)
    }
    n = sum
  }
  return n
}

/**
 * Life Path: sum all digits of the birth date (MM/DD/YYYY).
 */
export function computeLifePath(birthDate: string): number {
  const date = new Date(birthDate)
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()
  const year = date.getUTCFullYear()

  const monthReduced = reduceToSingleDigit(month)
  const dayReduced = reduceToSingleDigit(day)
  const yearReduced = reduceToSingleDigit(
    String(year).split('').reduce((sum, d) => sum + parseInt(d), 0)
  )

  return reduceToSingleDigit(monthReduced + dayReduced + yearReduced)
}

/**
 * Sum letter values for a name string, filtering by predicate.
 */
function sumLetters(name: string, filter?: (char: string) => boolean): number {
  const lower = name.toLowerCase()
  let total = 0
  for (const char of lower) {
    if (LETTER_VALUES[char] !== undefined) {
      if (!filter || filter(char)) {
        total += LETTER_VALUES[char]
      }
    }
  }
  return reduceToSingleDigit(total)
}

/**
 * Expression Number: sum all letter values of the full name.
 */
export function computeExpression(fullName: string): number {
  return sumLetters(fullName)
}

/**
 * Soul Urge: sum vowels only. Y is treated as consonant (Pythagorean standard).
 */
export function computeSoulUrge(fullName: string): number {
  return sumLetters(fullName, (char) => VOWELS.has(char))
}

/**
 * Personality: sum consonants only.
 */
export function computePersonality(fullName: string): number {
  return sumLetters(fullName, (char) => !VOWELS.has(char) && LETTER_VALUES[char] !== undefined)
}

/**
 * Birthday Number: day of month, reduced.
 */
export function computeBirthDay(birthDate: string): number {
  const date = new Date(birthDate)
  return reduceToSingleDigit(date.getUTCDate())
}

/**
 * Maturity Number: life path + expression, reduced.
 */
export function computeMaturity(lifePath: number, expression: number): number {
  return reduceToSingleDigit(lifePath + expression)
}

/**
 * Compute all core numerology numbers.
 */
export function computeAllNumbers(fullName: string, birthDate: string): NumerologyResults {
  const life_path = computeLifePath(birthDate)
  const expression = computeExpression(fullName)
  const soul_urge = computeSoulUrge(fullName)
  const personality = computePersonality(fullName)
  const birthday = computeBirthDay(birthDate)
  const maturity = computeMaturity(life_path, expression)

  return { life_path, expression, soul_urge, personality, birthday, maturity }
}

// ─── Query helpers ───

export async function getAllInterpretations(): Promise<NumerologyInterpretation[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('number', { ascending: true })

  if (error) throw new Error(`Failed to fetch numerology interpretations: ${error.message}`)
  return data as NumerologyInterpretation[]
}

export async function getInterpretation(
  number: number,
  category: string
): Promise<NumerologyInterpretation | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('number', number)
    .eq('category', category)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch interpretation: ${error.message}`)
  }
  return data as NumerologyInterpretation
}

export async function getInterpretationsForNumber(
  number: number
): Promise<NumerologyInterpretation[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('number', number)

  if (error) throw new Error(`Failed to fetch interpretations: ${error.message}`)
  return data as NumerologyInterpretation[]
}
