import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { createServerClient } from '@/lib/supabase-server'
import { computeAllNumbers } from '@/lib/numerology'
import { validateBody, createNumerologyChartSchema } from '@/lib/validation'

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

// POST: Create a new numerology chart
export async function POST(request: NextRequest) {
  try {
    const authClient = getUserFromRequest(request)
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const validation = validateBody(createNumerologyChartSchema, body)
    if (!validation.success) return validation.error
    const { label, full_name, birth_date } = validation.data

    const results = computeAllNumbers(full_name, birth_date)

    // Fetch interpretations for each result number
    const supabase = createServerClient()
    const numbers = Array.from(new Set(Object.values(results)))
    const { data: interpretations } = await supabase
      .from('numerology_interpretations')
      .select('*')
      .in('number', numbers)

    const resultsSnapshot: Record<string, unknown> = {}
    if (interpretations) {
      for (const interp of interpretations) {
        resultsSnapshot[`${interp.category}_${interp.number}`] = interp
      }
    }

    const { data: chart, error } = await supabase
      .from('numerology_charts')
      .insert({
        user_id: user.id,
        label,
        full_name,
        birth_date,
        results,
        results_snapshot: resultsSnapshot,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    return NextResponse.json(chart, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET: List user's charts
export async function GET(request: NextRequest) {
  try {
    const authClient = getUserFromRequest(request)
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const from = (page - 1) * limit
    const to = from + limit - 1

    const supabase = createServerClient()
    const { data, error, count } = await supabase
      .from('numerology_charts')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) return NextResponse.json({ error: 'Failed to fetch charts' }, { status: 500 })
    const response = NextResponse.json(data)
    response.headers.set('X-Total-Count', String(count ?? 0))
    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE: Delete a chart
export async function DELETE(request: NextRequest) {
  try {
    const authClient = getUserFromRequest(request)
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const supabase = createServerClient()
    const { data: existing } = await supabase
      .from('numerology_charts')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { error } = await supabase.from('numerology_charts').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
