import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { ADMIN_TABLE_WHITELIST, type AdminTable } from '@/lib/admin-tables'
import { checkRateLimit } from '@/lib/rate-limit'

function isAllowedTable(table: string): table is AdminTable {
  return (ADMIN_TABLE_WHITELIST as readonly string[]).includes(table)
}

function checkAuth(request: NextRequest): NextResponse | null {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  if (!checkRateLimit(`admin:${clientIp}`)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  const adminPassword = process.env.ADMIN_PASSWORD
  const provided = request.headers.get('X-Admin-Password')
  if (!adminPassword || provided !== adminPassword) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

// GET: List all rows from a whitelisted table
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params
  const authError = checkAuth(request)
  if (authError) return authError

  if (!isAllowedTable(table)) {
    return NextResponse.json({ error: 'Table not allowed' }, { status: 403 })
  }

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST: Create a new row
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params
  const authError = checkAuth(request)
  if (authError) return authError

  if (!isAllowedTable(table)) {
    return NextResponse.json({ error: 'Table not allowed' }, { status: 403 })
  }

  try {
    const body = await request.json()

    // Strip id and timestamps; let the DB handle them
    const { id: _id, created_at: _c, updated_at: _u, ...fields } = body

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from(table)
      .insert(fields)
      .select()
      .single()

    if (error) {
      // Check for unique constraint violations
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A record with that value already exists. Check for duplicate names or keys.' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to create' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT: Update an existing row
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params
  const authError = checkAuth(request)
  if (authError) return authError

  if (!isAllowedTable(table)) {
    return NextResponse.json({ error: 'Table not allowed' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { id, created_at: _c, ...fields } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      )
    }

    // Add updated_at if the table has that column
    const updateData = { ...fields, updated_at: new Date().toISOString() }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // Some tables don't have updated_at, retry without it
      if (error.message?.includes('updated_at')) {
        delete updateData.updated_at
        const { data: retryData, error: retryError } = await supabase
          .from(table)
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (retryError) {
          return NextResponse.json(
            { error: 'Failed to update' },
            { status: 500 }
          )
        }
        return NextResponse.json(retryData)
      }

      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A record with that value already exists. Check for duplicate names or keys.' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to update' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE: Remove a row by id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params
  const authError = checkAuth(request)
  if (authError) return authError

  if (!isAllowedTable(table)) {
    return NextResponse.json({ error: 'Table not allowed' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required query parameter: id' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
