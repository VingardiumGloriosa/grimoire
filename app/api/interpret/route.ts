import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { generateSynthesis } from '@/lib/interpret'
import { checkRateLimit } from '@/lib/rate-limit'
import type { ReadingCard } from '@/lib/types'

// POST: Generate synthesis for a reading
export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    if (!checkRateLimit(`interpret:${clientIp}`)) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
    }

    const body = await request.json()
    const {
      spread_name,
      cards,
      intention,
      mood,
    }: {
      spread_name: string
      cards: ReadingCard[]
      intention: string | null
      mood: string | null
    } = body

    if (!spread_name || !cards || cards.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: spread_name, cards' },
        { status: 400 }
      )
    }

    const synthesis = await generateSynthesis({
      spread_name,
      cards,
      intention,
      mood,
    })

    return NextResponse.json({ synthesis })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT: Update synthesis templates (admin only) or verify admin password
export async function PUT(request: NextRequest) {
  try {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    if (!checkRateLimit(`admin:${clientIp}`)) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }

    const adminPassword = process.env.ADMIN_PASSWORD
    const providedPassword = request.headers.get('X-Admin-Password')

    if (!adminPassword || providedPassword !== adminPassword) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // If this is just a password check, return success
    if (body.check === true) {
      return NextResponse.json({ valid: true })
    }

    const { id, template }: { id: string; template: string } = body

    if (!id || typeof template !== 'string') {
      return NextResponse.json(
        { error: 'Missing required fields: id, template' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const { data: updated, error } = await supabase
      .from('tarot_synthesis_templates')
      .update({
        template,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update template' },
        { status: 500 }
      )
    }

    return NextResponse.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
