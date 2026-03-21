import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { computeMoonPhase } from '@/lib/moon'
import type { MoonPhaseData } from '@/lib/types'

// GET — Public moon phase endpoint
// ?date=YYYY-MM-DD — single date
// ?start=YYYY-MM-DD&end=YYYY-MM-DD — date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const startParam = searchParams.get('start')
    const endParam = searchParams.get('end')

    const supabase = createServerClient()

    // Single date
    if (dateParam) {
      // Check cache first
      const { data: cached } = await supabase
        .from('moon_phase_cache')
        .select('*')
        .eq('date', dateParam)
        .single()

      if (cached) {
        return NextResponse.json(cached as MoonPhaseData)
      }

      // Compute locally
      const phaseData = computeMoonPhase(new Date(dateParam + 'T12:00:00Z'))

      // Cache the result
      await supabase.from('moon_phase_cache').upsert(
        {
          date: phaseData.date,
          phase: phaseData.phase,
          phase_label: phaseData.phase_label,
          illumination: phaseData.illumination,
          is_waxing: phaseData.is_waxing,
        },
        { onConflict: 'date' }
      )

      return NextResponse.json(phaseData)
    }

    // Date range
    if (startParam && endParam) {
      const start = new Date(startParam + 'T12:00:00Z')
      const end = new Date(endParam + 'T12:00:00Z')
      const results: MoonPhaseData[] = []

      // Check which dates are already cached
      const { data: cachedDates } = await supabase
        .from('moon_phase_cache')
        .select('*')
        .gte('date', startParam)
        .lte('date', endParam)

      const cachedMap = new Map<string, MoonPhaseData>()
      if (cachedDates) {
        for (const c of cachedDates) {
          cachedMap.set(c.date, c as MoonPhaseData)
        }
      }

      const toCache: MoonPhaseData[] = []
      const current = new Date(start)

      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0]
        const cached = cachedMap.get(dateStr)

        if (cached) {
          results.push(cached)
        } else {
          const phaseData = computeMoonPhase(current)
          results.push(phaseData)
          toCache.push(phaseData)
        }

        current.setUTCDate(current.getUTCDate() + 1)
      }

      // Batch cache any newly computed dates
      if (toCache.length > 0) {
        await supabase.from('moon_phase_cache').upsert(
          toCache.map((p) => ({
            date: p.date,
            phase: p.phase,
            phase_label: p.phase_label,
            illumination: p.illumination,
            is_waxing: p.is_waxing,
          })),
          { onConflict: 'date' }
        )
      }

      return NextResponse.json(results)
    }

    // Default: today
    const today = new Date()
    const phaseData = computeMoonPhase(today)
    return NextResponse.json(phaseData)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
