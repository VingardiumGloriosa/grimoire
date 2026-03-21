import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { createServerClient } from '@/lib/supabase-server'
import { generateSynthesis } from '@/lib/interpret'
import type { ReadingCard, SpreadPosition, Visibility } from '@/lib/types'

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

// POST — Create a new reading
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const authClient = getUserFromRequest(request)
    const {
      data: { user },
    } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      spread_name,
      spread_positions,
      cards,
      intention,
      date,
      mood,
      visibility,
    }: {
      spread_name: string
      spread_positions: SpreadPosition[]
      cards: ReadingCard[]
      intention: string | null
      date: string
      mood: string | null
      visibility: Visibility
    } = body

    // Validate required fields
    if (!spread_name || !cards || cards.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: spread_name, cards' },
        { status: 400 }
      )
    }

    // Generate synthesis
    const synthesis = await generateSynthesis({
      spread_name,
      cards,
      intention,
      mood,
    })

    // Insert reading using service role client (bypasses RLS for insert)
    const supabase = createServerClient()
    const { data: reading, error } = await supabase
      .from('tarot_readings')
      .insert({
        user_id: user.id,
        spread_name,
        spread_positions,
        cards,
        intention,
        date: date || new Date().toISOString().split('T')[0],
        mood,
        visibility: visibility || 'private',
        synthesis,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to save reading: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(reading, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET — List user's readings
export async function GET(request: NextRequest) {
  try {
    const authClient = getUserFromRequest(request)
    const {
      data: { user },
    } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerClient()
    const { data: readings, error } = await supabase
      .from('tarot_readings')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch readings: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(readings)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE — Delete a reading
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
      return NextResponse.json({ error: 'Missing reading id' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Verify ownership
    const { data: existing } = await supabase
      .from('tarot_readings')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('tarot_readings')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete reading: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH — Update reading notes
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
    const { id, notes }: { id: string; notes: string } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing reading id' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Verify ownership
    const { data: existing } = await supabase
      .from('tarot_readings')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data: reading, error } = await supabase
      .from('tarot_readings')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: `Failed to update reading: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(reading)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
