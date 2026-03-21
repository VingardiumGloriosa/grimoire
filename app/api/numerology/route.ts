import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { createServerClient } from '@/lib/supabase-server'
import { computeAllNumbers } from '@/lib/numerology'

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

// POST — Create a new numerology profile
export async function POST(request: NextRequest) {
  try {
    const authClient = getUserFromRequest(request)
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { label, full_name, birth_date } = body as {
      label: string
      full_name: string
      birth_date: string
    }

    if (!label || !full_name || !birth_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

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

    const { data: profile, error } = await supabase
      .from('numerology_profiles')
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

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(profile, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET — List user's profiles
export async function GET(request: NextRequest) {
  try {
    const authClient = getUserFromRequest(request)
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('numerology_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE — Delete a profile
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
      .from('numerology_profiles')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { error } = await supabase.from('numerology_profiles').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
