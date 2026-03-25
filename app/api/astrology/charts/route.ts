import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { createServerClient } from '@/lib/supabase-server'
import { calculateChart } from '@/lib/astro-calc'
import type { PlanetPlacement, HouseCusp, Aspect, ChartData } from '@/lib/types'
import { validateBody, createBirthChartSchema } from '@/lib/validation'

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

// POST: Create a new birth chart
export async function POST(request: NextRequest) {
  try {
    const authClient = getUserFromRequest(request)
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const validation = validateBody(createBirthChartSchema, body)
    if (!validation.success) return validation.error
    const { label, birth_date, birth_time, birth_location, latitude, longitude, timezone } = validation.data

    const timeUnknown = !birth_time

    // Compute chart using local astronomical calculations
    const tzOffset = parseTimezoneOffset(timezone || 'UTC', birth_date, birth_time || '12:00')
    const calcResult = calculateChart(
      birth_date,
      birth_time || '12:00',
      latitude,
      longitude,
      tzOffset,
    )

    const sunSign = calcResult.planets.find(p => p.planet === 'Sun')?.sign || computeSunSign(birth_date)
    const moonSign = calcResult.moonSign
    const risingSign = timeUnknown ? null : calcResult.risingSign

    const chartData: ChartData = {
      planets: calcResult.planets.map(p => ({
        planet: p.planet,
        sign: p.sign,
        degree: Math.round(p.degree * 100) / 100,
        house: p.house,
        retrograde: p.retrograde,
      })),
      houses: calcResult.houses.map(h => ({
        house: h.house,
        sign: h.sign,
        degree: Math.round(h.degree * 100) / 100,
      })),
      aspects: calcResult.aspects,
    }

    const supabase = createServerClient()
    const { data: chart, error } = await supabase
      .from('astrology_birth_charts')
      .insert({
        user_id: user.id,
        label,
        birth_date,
        birth_time: birth_time || null,
        birth_location,
        latitude,
        longitude,
        timezone: timezone || 'UTC',
        sun_sign: findSunSignFromPlanets(chartData.planets) || sunSign,
        moon_sign: moonSign,
        rising_sign: risingSign,
        chart_data: chartData,
        time_unknown: timeUnknown,
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
    const id = searchParams.get('id')

    const supabase = createServerClient()

    if (id) {
      const { data, error } = await supabase
        .from('astrology_birth_charts')
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

    const { data, error, count } = await supabase
      .from('astrology_birth_charts')
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
      .from('astrology_birth_charts')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { error } = await supabase.from('astrology_birth_charts').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── FreeAstroAPI Integration ───

interface AstroAPIResult {
  chartData: ChartData
  moonSign: string | null
  risingSign: string | null
}

const PLANET_KEYS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
]

const SIGN_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]

const ASPECT_NAMES: Record<string, string> = {
  '0': 'Conjunction',
  '60': 'Sextile',
  '90': 'Square',
  '120': 'Trine',
  '180': 'Opposition',
}

async function fetchChartFromAPI(
  birthDate: string,
  birthTime: string,
  lat: number,
  lon: number,
  tz: string,
): Promise<AstroAPIResult> {
  const [year, month, day] = birthDate.split('-').map(Number)
  const [hour, minute] = birthTime.split(':').map(Number)

  const apiKey = process.env.FREE_ASTRO_API_KEY
  const baseUrl = 'https://json.freeastrologyapi.com'

  const requestBody = {
    year,
    month,
    date: day,
    hours: hour,
    minutes: minute,
    seconds: 0,
    latitude: lat,
    longitude: lon,
    timezone: parseTimezoneOffset(tz, birthDate, birthTime),
    settings: {
      observation_point: 'geocentric',
      ayanamsha: 'tropical',
    },
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (apiKey) {
    headers['x-api-key'] = apiKey
  }

  // Fetch planetary positions
  const planetRes = await fetch(`${baseUrl}/planets`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(8000),
  })

  if (!planetRes.ok) {
    const errorBody = await planetRes.text().catch(() => 'no body')
    throw new Error(`FreeAstroAPI planets endpoint returned ${planetRes.status}: ${errorBody.substring(0, 200)}`)
  }

  const planetData = await planetRes.json()

  // Parse planets
  const planets: PlanetPlacement[] = []
  let moonSign: string | null = null
  let risingSign: string | null = null

  for (const key of PLANET_KEYS) {
    const p = planetData.output?.[key] || planetData[key]
    if (!p) continue

    const signIndex = typeof p.zodiac_sign_id === 'number'
      ? p.zodiac_sign_id
      : typeof p.sign_id === 'number'
        ? p.sign_id
        : null

    // Some APIs use 0-indexed sign IDs, some use 1-indexed. Try both.
    let signFromIndex: string | undefined
    if (signIndex !== null) {
      signFromIndex = SIGN_NAMES[signIndex] || SIGN_NAMES[signIndex - 1]
    }
    const sign = p.sign || p.zodiac_sign || signFromIndex || 'Unknown'
    const degree = p.full_degree ?? p.normDegree ?? p.degree ?? 0
    const house = p.house ?? p.house_id ?? 1
    const retrograde = p.isRetro === 'true' || p.isRetro === true || p.is_retrograde === true

    planets.push({
      planet: key,
      sign,
      house: typeof house === 'number' ? house : parseInt(house, 10) || 1,
      degree: typeof degree === 'number' ? degree : parseFloat(degree) || 0,
      retrograde,
    })

    if (key === 'Moon') moonSign = sign
  }

  // Parse ascendant if available
  const ascendant = planetData.output?.Ascendant || planetData.Ascendant
  if (ascendant) {
    const ascSignIndex = ascendant.zodiac_sign_id ?? ascendant.sign_id
    risingSign = ascendant.sign || ascendant.zodiac_sign
      || (typeof ascSignIndex === 'number' ? SIGN_NAMES[ascSignIndex] : null)
  }

  // Build houses (from ascendant data or defaults)
  const houses: HouseCusp[] = []
  const housesData = planetData.output?.houses || planetData.houses
  if (Array.isArray(housesData)) {
    for (let i = 0; i < housesData.length && i < 12; i++) {
      const h = housesData[i]
      const signIdx = h.zodiac_sign_id ?? h.sign_id
      houses.push({
        house: i + 1,
        sign: h.sign || h.zodiac_sign || (typeof signIdx === 'number' ? SIGN_NAMES[signIdx] : 'Unknown'),
        degree: h.full_degree ?? h.degree ?? 0,
      })
    }
  }

  // Compute simple aspects between planets
  const aspects: Aspect[] = []
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i]
      const p2 = planets[j]
      const diff = Math.abs(p1.degree - p2.degree)
      const angle = diff > 180 ? 360 - diff : diff

      for (const [targetAngle, name] of Object.entries(ASPECT_NAMES)) {
        const target = parseInt(targetAngle, 10)
        const orb = Math.abs(angle - target)
        if (orb <= 8) {
          aspects.push({
            planet1: p1.planet,
            planet2: p2.planet,
            aspect: name,
            degree: target,
            orb: Math.round(orb * 100) / 100,
          })
          break
        }
      }
    }
  }

  return {
    chartData: { planets, houses, aspects },
    moonSign,
    risingSign,
  }
}

function findSunSignFromPlanets(planets: PlanetPlacement[]): string | null {
  const sun = planets.find((p) => p.planet === 'Sun')
  return sun?.sign || null
}

function parseTimezoneOffset(tz: string, birthDate?: string, birthTime?: string): number {
  try {
    // Build a date in the target timezone to determine the real UTC offset,
    // accounting for daylight saving time on that specific date.
    const dateStr = birthDate || '2000-01-01'
    const timeStr = birthTime || '12:00'
    const [year, month, day] = dateStr.split('-').map(Number)
    const [hour, minute] = timeStr.split(':').map(Number)

    // Create a formatter that outputs the UTC offset for the given timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    // Format a date near the birth date to get the offset string
    const testDate = new Date(Date.UTC(year, month - 1, day, hour, minute))
    const parts = formatter.formatToParts(testDate)
    const offsetPart = parts.find((p) => p.type === 'timeZoneName')

    if (offsetPart) {
      // offsetPart.value is like "GMT-4", "GMT+5:30", "GMT+1", "GMT"
      const match = offsetPart.value.match(/GMT([+-]?)(\d+)(?::(\d+))?/)
      if (match) {
        const sign = match[1] === '-' ? -1 : 1
        const hours = parseInt(match[2], 10)
        const minutes = match[3] ? parseInt(match[3], 10) : 0
        return sign * (hours + minutes / 60)
      }
      // "GMT" with no offset means UTC
      if (offsetPart.value === 'GMT') return 0
    }
  } catch {
    // Fall back to 0 if timezone is unrecognized
  }
  return 0
}

// ─── Helpers ───

function computeSunSign(birthDate: string): string {
  const date = new Date(birthDate)
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries'
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus'
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini'
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer'
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo'
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo'
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra'
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio'
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius'
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn'
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius'
  return 'Pisces'
}
