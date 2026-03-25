import { NextRequest, NextResponse } from 'next/server'
const lookupTz = require('@photostructure/tz-lookup') as (lat: number, lon: number) => string

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
}

// GET: Geocode a location string via OpenStreetMap Nominatim
// ?q=London,UK
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search')
    nominatimUrl.searchParams.set('q', query.trim())
    nominatimUrl.searchParams.set('format', 'json')
    nominatimUrl.searchParams.set('limit', '5')

    const res = await fetch(nominatimUrl.toString(), {
      headers: {
        'User-Agent': 'Grimoire/1.0 (esoteric toolkit; https://github.com/VingardiumGloriosa/grimoire)',
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Geocoding service unavailable' },
        { status: 502 }
      )
    }

    const raw: NominatimResult[] = await res.json()

    const results = raw.map((r) => {
      const lat = parseFloat(r.lat)
      const lon = parseFloat(r.lon)
      let timezone: string | null = null
      try {
        const tzResult = lookupTz(lat, lon)
        if (tzResult) timezone = tzResult
      } catch {
        // Timezone lookup failed, leave as null
      }
      return { display_name: r.display_name, lat, lon, timezone }
    })

    return NextResponse.json(results)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
