import { createClient } from './supabase'
import type { MoonPhaseData, MoonPhaseKey, MoonRitual } from './types'

// ─── Constants ───

const SYNODIC_PERIOD = 29.53058867
// Known new moon reference: January 6, 2000, 18:14 UTC
const REFERENCE_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime()

const PHASE_LABELS: Record<MoonPhaseKey, string> = {
  new_moon: 'New Moon',
  waxing_crescent: 'Waxing Crescent',
  first_quarter: 'First Quarter',
  waxing_gibbous: 'Waxing Gibbous',
  full_moon: 'Full Moon',
  waning_gibbous: 'Waning Gibbous',
  last_quarter: 'Last Quarter',
  waning_crescent: 'Waning Crescent',
}

// ─── Local synodic calculation (fallback) ───

/**
 * Compute moon phase data for a given date using the synodic period.
 * No external API needed; pure calculation from a known new moon reference.
 */
export function computeMoonPhase(date: Date): MoonPhaseData {
  const msPerDay = 86400000
  const daysSinceReference = (date.getTime() - REFERENCE_NEW_MOON) / msPerDay
  const cyclePosition = ((daysSinceReference % SYNODIC_PERIOD) + SYNODIC_PERIOD) % SYNODIC_PERIOD
  const fractionOfCycle = cyclePosition / SYNODIC_PERIOD

  // Illumination: 0 at new moon, 1 at full moon, 0 at next new moon
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * fractionOfCycle)) / 2 * 100) / 100
  const isWaxing = fractionOfCycle < 0.5

  const phase = getMoonPhaseKey(illumination, isWaxing)

  return {
    date: date.toISOString().split('T')[0],
    phase,
    phase_label: PHASE_LABELS[phase],
    illumination,
    is_waxing: isWaxing,
  }
}

/**
 * Derive the moon phase key from illumination percentage and waxing/waning.
 */
export function getMoonPhaseKey(illumination: number, isWaxing: boolean): MoonPhaseKey {
  if (illumination < 0.03) return 'new_moon'
  if (illumination > 0.97) return 'full_moon'

  if (isWaxing) {
    if (illumination < 0.35) return 'waxing_crescent'
    if (illumination < 0.65) return 'first_quarter'
    return 'waxing_gibbous'
  } else {
    if (illumination > 0.65) return 'waning_gibbous'
    if (illumination > 0.35) return 'last_quarter'
    return 'waning_crescent'
  }
}

/**
 * Get phase label string from a MoonPhaseKey.
 */
export function getPhaseLabel(phase: MoonPhaseKey): string {
  return PHASE_LABELS[phase]
}

// ─── Query helpers ───

export async function getCachedPhase(date: string): Promise<MoonPhaseData | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('moon_phase_cache')
    .select('*')
    .eq('date', date)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch cached phase: ${error.message}`)
  }
  return data as MoonPhaseData
}

export async function getAllRituals(): Promise<MoonRitual[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('moon_rituals')
    .select('*')

  if (error) throw new Error(`Failed to fetch moon rituals: ${error.message}`)
  return data as MoonRitual[]
}

export async function getRitualForPhase(phase: MoonPhaseKey): Promise<MoonRitual | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('moon_rituals')
    .select('*')
    .eq('phase', phase)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`Failed to fetch ritual: ${error.message}`)
  }
  return data as MoonRitual
}
