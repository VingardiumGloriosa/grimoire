import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { createServerClient } from '@/lib/supabase-server'

function getUserFromRequest(request: NextRequest) {
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set() {},
        remove() {},
      },
    }
  )
}

// GET — Compute symbol frequency and moon phase correlation for the user
export async function GET(request: NextRequest) {
  try {
    const authClient = getUserFromRequest(request)
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createServerClient()

    // Fetch all user's dream entries
    const { data: entries, error } = await supabase
      .from('dreams_entries')
      .select('symbols, moon_phase, vividness, lucid')
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!entries || entries.length === 0) {
      return NextResponse.json({ symbol_frequency: [], moon_correlation: [], total_entries: 0 })
    }

    // Symbol frequency: count how often each symbol_name appears across all entries
    const symbolCounts: Record<string, number> = {}
    for (const entry of entries) {
      const symbols = entry.symbols as Array<{ symbol_name: string }> | null
      if (symbols) {
        for (const sym of symbols) {
          symbolCounts[sym.symbol_name] = (symbolCounts[sym.symbol_name] || 0) + 1
        }
      }
    }

    const symbolFrequency = Object.entries(symbolCounts)
      .map(([symbol_name, count]) => ({ symbol_name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)

    // Moon phase correlation: group entries by moon_phase
    const phaseCounts: Record<string, { count: number; avg_vividness: number; lucid_count: number }> = {}
    for (const entry of entries) {
      const phase = entry.moon_phase as string | null
      if (!phase) continue
      if (!phaseCounts[phase]) {
        phaseCounts[phase] = { count: 0, avg_vividness: 0, lucid_count: 0 }
      }
      phaseCounts[phase].count++
      phaseCounts[phase].avg_vividness += entry.vividness as number
      if (entry.lucid) phaseCounts[phase].lucid_count++
    }

    const moonCorrelation = Object.entries(phaseCounts).map(([phase, stats]) => ({
      phase,
      count: stats.count,
      avg_vividness: Math.round((stats.avg_vividness / stats.count) * 10) / 10,
      lucid_count: stats.lucid_count,
    }))

    return NextResponse.json({
      symbol_frequency: symbolFrequency,
      moon_correlation: moonCorrelation,
      total_entries: entries.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
