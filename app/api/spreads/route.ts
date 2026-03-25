import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { createServerClient } from '@/lib/supabase-server'
import type { SpreadPosition } from '@/lib/types'
import { validateBody, createSpreadSchema, updateSpreadSchema } from '@/lib/validation'

function getUserFromRequest(request: NextRequest) {
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )
}

// POST: Create a new spread template
export async function POST(request: NextRequest) {
  try {
    const authClient = getUserFromRequest(request)
    const {
      data: { user },
    } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = validateBody(createSpreadSchema, body)
    if (!validation.success) return validation.error
    const { name, description, positions } = validation.data

    const supabase = createServerClient()
    const { data: spread, error } = await supabase
      .from('tarot_spread_templates')
      .insert({
        user_id: user.id,
        name,
        description,
        positions,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create spread' },
        { status: 500 }
      )
    }

    return NextResponse.json(spread, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET: List user's spread templates
export async function GET(request: NextRequest) {
  try {
    const authClient = getUserFromRequest(request)
    const {
      data: { user },
    } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const from = (page - 1) * limit
    const to = from + limit - 1

    const supabase = createServerClient()
    const { data: spreads, error, count } = await supabase
      .from('tarot_spread_templates')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch spreads' },
        { status: 500 }
      )
    }

    const response = NextResponse.json(spreads)
    response.headers.set('X-Total-Count', String(count ?? 0))
    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH: Update a spread template
export async function PATCH(request: NextRequest) {
  try {
    const authClient = getUserFromRequest(request)
    const {
      data: { user },
    } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = validateBody(updateSpreadSchema, body)
    if (!validation.success) return validation.error
    const { id, name, description, positions } = validation.data

    const supabase = createServerClient()

    // Verify ownership
    const { data: existing } = await supabase
      .from('tarot_spread_templates')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data: spread, error } = await supabase
      .from('tarot_spread_templates')
      .update({
        name,
        description,
        positions,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update spread' },
        { status: 500 }
      )
    }

    return NextResponse.json(spread)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE: Delete a spread template
export async function DELETE(request: NextRequest) {
  try {
    const authClient = getUserFromRequest(request)
    const {
      data: { user },
    } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing spread id' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Verify ownership
    const { data: existing } = await supabase
      .from('tarot_spread_templates')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('tarot_spread_templates')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete spread' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
