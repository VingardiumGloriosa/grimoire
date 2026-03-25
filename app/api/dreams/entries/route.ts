import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { createServerClient } from '@/lib/supabase-server'
import { computeMoonPhase } from '@/lib/moon'
import { validateBody, createDreamSchema, updateDreamSchema } from '@/lib/validation'

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

// POST: Create a new dream entry
export async function POST(request: NextRequest) {
  try {
    const authClient = getUserFromRequest(request)
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const validation = validateBody(createDreamSchema, body)
    if (!validation.success) return validation.error
    const { date, title, content, mood, vividness, lucid, recurring, symbols, tags } = validation.data

    // Auto-populate moon phase for the dream date
    const dreamDate = date || new Date().toISOString().split('T')[0]
    const moonData = computeMoonPhase(new Date(dreamDate + 'T12:00:00Z'))

    const supabase = createServerClient()
    const { data: entry, error } = await supabase
      .from('dreams_entries')
      .insert({
        user_id: user.id,
        date: dreamDate,
        title,
        content,
        mood: mood || null,
        vividness: vividness || 3,
        lucid: lucid || false,
        recurring: recurring || false,
        symbols: symbols || [],
        moon_phase: moonData.phase,
        moon_illumination: moonData.illumination,
        tags: tags || [],
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    return NextResponse.json(entry, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET: List user's dream entries with optional filters
export async function GET(request: NextRequest) {
  try {
    const authClient = getUserFromRequest(request)
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // YYYY-MM
    const lucid = searchParams.get('lucid')
    const id = searchParams.get('id')

    const supabase = createServerClient()

    // Single entry fetch
    if (id) {
      const { data, error } = await supabase
        .from('dreams_entries')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }
      return NextResponse.json(data)
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('dreams_entries')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (month) {
      const start = `${month}-01`
      const [y, m] = month.split('-').map(Number)
      const end = new Date(y, m, 0).toISOString().split('T')[0] // last day of month
      query = query.gte('date', start).lte('date', end)
    }

    if (lucid === 'true') {
      query = query.eq('lucid', true)
    }

    const { data, error, count } = await query.range(from, to)
    if (error) return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
    const response = NextResponse.json(data)
    response.headers.set('X-Total-Count', String(count ?? 0))
    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH: Update a dream entry
export async function PATCH(request: NextRequest) {
  try {
    const authClient = getUserFromRequest(request)
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const validation = validateBody(updateDreamSchema, body)
    if (!validation.success) return validation.error
    const { id, ...fields } = validation.data

    const supabase = createServerClient()
    const { data: existing } = await supabase
      .from('dreams_entries')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    const allowed = ['title', 'content', 'mood', 'vividness', 'lucid', 'recurring', 'symbols', 'tags'] as const
    for (const key of allowed) {
      if (fields[key] !== undefined) updates[key] = fields[key]
    }

    const { data: entry, error } = await supabase
      .from('dreams_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    return NextResponse.json(entry)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE: Delete a dream entry
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
      .from('dreams_entries')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { error } = await supabase.from('dreams_entries').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
