import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { createServerClient } from '@/lib/supabase-server'
import type { PlanetPlacement, HouseCusp, Aspect, ChartData } from '@/lib/types'

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

// POST — Create a new birth chart
export async function POST(request: NextRequest) {
  try {
    const authClient = getUserFromRequest(request)
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { label, birth_date, birth_time, birth_location, latitude, longitude, timezone } = body

    if (!label || !birth_date || !birth_location || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const timeUnknown = !birth_time

    // Compute sun sign from birth date (always available as local fallback)
    const sunSign = computeSunSign(birth_date)

    // Try to get chart data from FreeAstroAPI
    let chartData: ChartData
    let moonSign = 'Unknown'
    let risingSign: string | null = timeUnknown ? null : 'Unknown'

    try {
      const astroResult = await fetchChartFromAPI(
        birth_date,
        birth_time || '12:00',
        latitude,
        longitude,
        timezone || 'UTC'
      )

      chartData = astroResult.chartData
      moonSign = astroResult.moonSign || moonSign
      risingSign = timeUnknown ? null : (astroResult.risingSign || risingSign)
    } catch {
      // API unavailable — store empty chart data with local sun sign only
      chartData = {
        planets: [],
        houses: [],
        aspects: [],
      }
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

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(chart, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET — List user's charts
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
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json(data)
    }

    const { data, error } = await supabase
      .from('astrology_birth_charts')
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

// DELETE — Delete a chart
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
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
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
    timezone: parseTimezoneOffset(tz),
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
    throw new Error(`FreeAstroAPI planets endpoint returned ${planetRes.status}`)
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

    const sign = p.sign || p.zodiac_sign || (signIndex !== null ? SIGN_NAMES[signIndex] : 'Unknown')
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

function parseTimezoneOffset(tz: string): number {
  // Common timezone offsets — enough for the timezone list we offer
  const offsets: Record<string, number> = {
    'UTC': 0,
    'America/New_York': -5,
    'America/Chicago': -6,
    'America/Denver': -7,
    'America/Los_Angeles': -8,
    'America/Anchorage': -9,
    'Pacific/Honolulu': -10,
    'America/Sao_Paulo': -3,
    'America/Argentina/Buenos_Aires': -3,
    'Europe/London': 0,
    'Europe/Paris': 1,
    'Europe/Berlin': 1,
    'Europe/Moscow': 3,
    'Africa/Cairo': 2,
    'Asia/Dubai': 4,
    'Asia/Kolkata': 5.5,
    'Asia/Bangkok': 7,
    'Asia/Shanghai': 8,
    'Asia/Tokyo': 9,
    'Asia/Seoul': 9,
    'Australia/Sydney': 11,
    'Pacific/Auckland': 13,
  }
  return offsets[tz] ?? 0
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
