import { NextRequest, NextResponse } from 'next/server'
import { computeAllNumbers } from '@/lib/numerology'

// POST: Public calculation endpoint (no auth, no save)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { full_name, birth_date } = body as {
      full_name: string
      birth_date: string
    }

    if (!full_name || !birth_date) {
      return NextResponse.json(
        { error: 'Missing required fields: full_name, birth_date' },
        { status: 400 }
      )
    }

    const results = computeAllNumbers(full_name, birth_date)
    return NextResponse.json(results)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
