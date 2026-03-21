import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { createServerClient } from '@/lib/supabase-server'
import type { BlendHerb, Element } from '@/lib/types'

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

function computeBalance(herbs: BlendHerb[]) {
  const elements: Record<string, number> = {}
  const planets: Record<string, number> = {}

  for (const herb of herbs) {
    elements[herb.element] = (elements[herb.element] || 0) + 1
    planets[herb.planetary_ruler] = (planets[herb.planetary_ruler] || 0) + 1
  }

  return {
    elemental_balance: elements as Record<Element, number>,
    planetary_influences: planets,
  }
}

// POST — Create a new blend
export async function POST(request: NextRequest) {
  try {
    const authClient = getUserFromRequest(request)
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, description, herbs, intention, notes } = body as {
      name: string
      description: string | null
      herbs: BlendHerb[]
      intention: string | null
      notes: string | null
    }

    if (!name || !herbs || herbs.length === 0) {
      return NextResponse.json({ error: 'Missing required fields: name, herbs' }, { status: 400 })
    }

    const { elemental_balance, planetary_influences } = computeBalance(herbs)

    const supabase = createServerClient()
    const { data: blend, error } = await supabase
      .from('herbology_blends')
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        herbs,
        intention: intention || null,
        elemental_balance,
        planetary_influences,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(blend, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET — List user's blends
export async function GET(request: NextRequest) {
  try {
    const authClient = getUserFromRequest(request)
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('herbology_blends')
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

// DELETE — Delete a blend
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
      .from('herbology_blends')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { error } = await supabase.from('herbology_blends').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
