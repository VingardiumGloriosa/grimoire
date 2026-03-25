import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

const VALID_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]

// GET: Public daily horoscope endpoint
// ?sign=Aries&date=YYYY-MM-DD (date defaults to today)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sign = searchParams.get('sign')
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    if (!sign || !VALID_SIGNS.includes(sign)) {
      return NextResponse.json(
        { error: `Invalid sign. Must be one of: ${VALID_SIGNS.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Check cache
    const { data: cached } = await supabase
      .from('astrology_horoscope_cache')
      .select('*')
      .eq('sign', sign)
      .eq('date', date)
      .single()

    if (cached && !cached.content?.includes('is not yet available')) {
      return NextResponse.json(cached)
    }

    // Fetch from Aztro API
    let content: string

    try {
      const aztroRes = await fetch(
        `https://aztro.sameerkumar.website/?sign=${sign.toLowerCase()}&day=today`,
        { method: 'POST', signal: AbortSignal.timeout(5000) }
      )

      if (aztroRes.ok) {
        const data = await aztroRes.json()
        const parts: string[] = []
        if (data.description) parts.push(data.description)
        if (data.mood) parts.push(`Mood: ${data.mood}.`)
        if (data.compatibility) parts.push(`Most compatible with ${data.compatibility} today.`)
        if (data.lucky_number) parts.push(`Lucky number: ${data.lucky_number}.`)
        if (data.color) parts.push(`Colour of the day: ${data.color}.`)
        content = parts.join(' ')
      } else {
        content = generateLocalHoroscope(sign, date)
      }
    } catch {
      // API unavailable, use local generation
      content = generateLocalHoroscope(sign, date)
    }

    // Cache the result
    await supabase.from('astrology_horoscope_cache').upsert(
      { sign, date, content },
      { onConflict: 'sign,date' }
    )

    return NextResponse.json({ sign, date, content })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── Local horoscope generation (fallback when API is unavailable) ───

const THEMES: Record<string, string[]> = {
  Aries: [
    'Your pioneering spirit lights the way forward today. Trust your instincts, they are sharper than usual.',
    'Bold action is favoured, but pause before charging ahead. A moment of reflection will strengthen your aim.',
    'The warrior in you seeks a worthy challenge. Channel that fire into something creative rather than combative.',
  ],
  Taurus: [
    'Steady hands build lasting things. Today rewards patience and attention to the small details that others overlook.',
    'The earth beneath your feet holds more wisdom than you realise. Slow down and listen to what your body needs.',
    'Beauty surrounds you if you take the time to notice. A sensory experience will restore your spirit.',
  ],
  Gemini: [
    'Your mind dances between ideas today. Let it. One of those passing thoughts contains a seed worth planting.',
    'Words carry extra weight right now. A conversation you nearly skip could shift your perspective entirely.',
    'Curiosity is your compass today. Follow the thread that intrigues you most, even if it leads somewhere unexpected.',
  ],
  Cancer: [
    'Your intuition runs deep today. That gut feeling is not anxiety; it is wisdom trying to surface.',
    'Home and heart are intertwined. A small act of nurturing, for yourself or someone else, ripples outward.',
    'Emotions are messengers, not burdens. Sit with what rises today rather than pushing it away.',
  ],
  Leo: [
    'Your natural radiance is amplified today. Share your warmth generously, it costs you nothing and means everything.',
    'Creative expression wants to flow through you. Do not judge what emerges; simply let it come.',
    'The spotlight finds you whether you seek it or not. Use that visibility to uplift rather than merely shine.',
  ],
  Virgo: [
    'Your eye for detail catches what others miss. Trust that analytical mind; it is a gift, not a curse.',
    'Perfectionism and progress are not the same thing. Choose progress today and watch how far it carries you.',
    'Service to others fills your cup, but remember: you cannot pour from empty. Tend to yourself first.',
  ],
  Libra: [
    'Balance is not a destination but a dance. Today asks you to sway with grace rather than stand rigid.',
    'A decision you have been weighing may resolve itself if you stop overthinking and start feeling.',
    'Beauty and justice are your twin callings. Today, one of them asks for your particular attention.',
  ],
  Scorpio: [
    'Transformation is not always dramatic. Sometimes it is a quiet shift that changes everything beneath the surface.',
    'Your ability to see beneath masks is sharp today. Use this power with compassion rather than suspicion.',
    'Something you thought was finished may resurface. This is not regression; it is a deeper layer ready to heal.',
  ],
  Sagittarius: [
    'The horizon calls, even if travel is not possible. Feed your wanderlust through learning, reading, or conversation.',
    'Your optimism is well-placed today. That sense of expansion is not naive; it is prophetic.',
    'A philosophical question stirs in you. Do not rush to answer it; the exploration itself is the treasure.',
  ],
  Capricorn: [
    'Discipline and ambition serve you well, but today also make room for play. Structure needs spontaneity to breathe.',
    'A long-term goal takes a quiet step forward. Trust the process, even when results are not yet visible.',
    'Your resilience inspires others more than you know. Acknowledge how far you have come before pressing on.',
  ],
  Aquarius: [
    'Your vision for what could be is needed now more than ever. Share your unconventional ideas without apology.',
    'Community and connection feed your soul today. Seek out the people who match your frequency.',
    'Innovation and tradition are not enemies. The breakthrough you seek may come from honouring the old while imagining the new.',
  ],
  Pisces: [
    'The veil between worlds is thin today. Dreams, intuition, and synchronicities carry messages worth noting.',
    'Your empathy is a superpower, but boundaries are its necessary companion. Feel deeply, but do not drown.',
    'Creativity flows effortlessly right now. Surrender to the current and let art, music, or words move through you.',
  ],
}

function generateLocalHoroscope(sign: string, date: string): string {
  const themes = THEMES[sign]
  if (!themes) return `Today invites reflection and presence. Trust the path unfolding before you.`

  // Deterministic selection based on date + sign (same date always gives same horoscope)
  const seed = date.split('-').reduce((acc, n) => acc + parseInt(n, 10), 0)
    + sign.charCodeAt(0) + sign.charCodeAt(sign.length - 1)
  const index = seed % themes.length

  return themes[index]
}
