// ─── Tarot Card (from DB / tarot.json) ───

export interface TarotCard {
  id: string
  name: string
  number: string
  arcana: 'Major Arcana' | 'Minor Arcana'
  suit: 'Trump' | 'Cups' | 'Swords' | 'Wands' | 'Pentacles'
  image_path: string
  fortune_telling: string[]
  keywords: string[]
  meanings: {
    light: string[]
    shadow: string[]
  }
  archetype: string | null
  hebrew_alphabet: string | null
  numerology: string | null
  elemental: string | null
  mythical_spiritual: string | null
  questions_to_ask: string[]
  created_at: string
}

// ─── Spread Templates ───

export interface SpreadPosition {
  id: string
  label: string
  x: number
  y: number
  order: number
}

export interface SpreadTemplate {
  id: string
  user_id: string | null
  name: string
  description: string | null
  positions: SpreadPosition[]
  created_at: string
  updated_at: string
}

// ─── Readings ───

export type Orientation = 'upright' | 'reversed'

export interface ReadingCard {
  card_id: string
  card_name: string
  position_label: string
  position_order: number
  orientation: Orientation
  image_path: string
  keywords: string[]
  meanings: {
    light: string[]
    shadow: string[]
  }
  fortune_telling: string[]
  questions_to_ask: string[]
  archetype: string | null
  numerology: string | null
  elemental: string | null
}

export type Visibility = 'private' | 'public'

export interface TarotReading {
  id: string
  user_id: string
  spread_name: string
  spread_positions: SpreadPosition[]
  cards: ReadingCard[]
  intention: string | null
  date: string
  mood: string | null
  visibility: Visibility
  synthesis: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Synthesis Templates ───

export type TemplateRole =
  | 'intro'
  | 'position_block'
  | 'reversed_note'
  | 'closing'
  | 'major_arcana_note'

export interface SynthesisTemplate {
  id: string
  role: TemplateRole
  template: string
  description: string | null
  created_at: string
  updated_at: string
}

// ─── Modules ───

export interface Module {
  id: string
  key: string
  name: string
  description: string | null
  enabled: boolean
  icon: string | null
  created_at: string
}

// ─── Shared Types (cross-module) ───

export type Element = 'Fire' | 'Water' | 'Earth' | 'Air' | 'Spirit'

export type Planet =
  | 'Sun'
  | 'Moon'
  | 'Mercury'
  | 'Venus'
  | 'Mars'
  | 'Jupiter'
  | 'Saturn'
  | 'Uranus'
  | 'Neptune'
  | 'Pluto'

export type Chakra =
  | 'Root'
  | 'Sacral'
  | 'Solar Plexus'
  | 'Heart'
  | 'Throat'
  | 'Third Eye'
  | 'Crown'

export type ZodiacSign =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces'

export type MoonPhaseKey =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent'

// ─── Numerology ───

export interface NumerologyInterpretation {
  id: string
  number: number
  category: string
  title: string
  description: string
  keywords: string[]
  strengths: string[]
  challenges: string[]
  compatible_numbers: number[]
  created_at: string
}

export interface NumerologyResults {
  life_path: number
  expression: number
  soul_urge: number
  personality: number
  birthday: number
  maturity: number
}

export interface NumerologyChart {
  id: string
  user_id: string
  label: string
  full_name: string
  birth_date: string
  results: NumerologyResults
  results_snapshot: Record<string, NumerologyInterpretation>
  created_at: string
  updated_at: string
}

// ─── Moon Phases ───

export interface MoonPhaseData {
  date: string
  phase: MoonPhaseKey
  phase_label: string
  illumination: number
  is_waxing: boolean
}

export interface MoonRitual {
  id: string
  phase: MoonPhaseKey
  phase_label: string
  description: string
  rituals: string[]
  intentions: string[]
  activities: string[]
  avoid: string[]
  crystals: string[]
  herbs: string[]
  created_at: string
}

export interface MoonJournalEntry {
  id: string
  user_id: string
  date: string
  title: string
  content: string
  mood: string | null
  moon_phase: MoonPhaseKey
  moon_illumination: number
  tags: string[]
  created_at: string
  updated_at: string
}

// ─── Dream Journal ───

export interface DreamSymbol {
  id: string
  name: string
  category: string
  description: string
  common_meanings: string[]
  questions: string[]
  related_symbols: string[]
  created_at: string
}

export interface DreamUserSymbol {
  id: string
  user_id: string
  symbol_name: string
  core_symbol_id: string | null
  personal_meaning: string
  created_at: string
  updated_at: string
}

export interface DreamEntrySymbol {
  symbol_id: string | null
  symbol_name: string
  is_personal: boolean
}

export interface DreamEntry {
  id: string
  user_id: string
  date: string
  title: string
  content: string
  mood: string | null
  vividness: number
  lucid: boolean
  recurring: boolean
  symbols: DreamEntrySymbol[]
  moon_phase: MoonPhaseKey | null
  moon_illumination: number | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface SymbolFrequency {
  symbol_name: string
  count: number
}

// ─── Herbology ───

export interface Herb {
  id: string
  name: string
  latin_name: string
  description: string
  planetary_ruler: string
  element: Element
  chakra: Chakra
  image_path: string | null
  magical_uses: string[]
  medicinal_notes: string[]
  warnings: string[]
  folklore: string
  growing_season: string
  correspondences: {
    deities: string[]
    zodiac: string[]
    festivals: string[]
  }
  created_at: string
}

export interface BlendHerb {
  herb_id: string
  herb_name: string
  element: Element
  planetary_ruler: string
}

export interface HerbBlend {
  id: string
  user_id: string
  name: string
  description: string | null
  herbs: BlendHerb[]
  intention: string | null
  elemental_balance: Record<Element, number>
  planetary_influences: Record<string, number>
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Crystals ───

export interface Crystal {
  id: string
  name: string
  description: string
  color: string
  chakra: Chakra
  chakras: Chakra[]
  element: Element
  image_path: string | null
  hardness: string
  healing_properties: string[]
  magical_uses: string[]
  cleansing_methods: string[]
  zodiac_signs: string[]
  planetary_ruler: string
  affirmation: string
  cautions: string[]
  created_at: string
}

export interface CrystalIntention {
  id: string
  name: string
  description: string
  icon: string
  stone_ids: string[]
  created_at: string
}

export interface CrystalCollectionEntry {
  id: string
  user_id: string
  stone_id: string
  notes: string | null
  acquired_date: string | null
  created_at: string
}

// ─── Astrology ───

export interface PlanetPlacement {
  planet: string
  sign: string
  house: number
  degree: number
  retrograde: boolean
}

export interface HouseCusp {
  house: number
  sign: string
  degree: number
}

export interface Aspect {
  planet1: string
  planet2: string
  aspect: string
  degree: number
  orb: number
}

export interface ChartData {
  planets: PlanetPlacement[]
  houses: HouseCusp[]
  aspects: Aspect[]
}

export interface BirthChart {
  id: string
  user_id: string
  label: string
  birth_date: string
  birth_time: string | null
  birth_location: string
  latitude: number
  longitude: number
  timezone: string
  sun_sign: string
  moon_sign: string
  rising_sign: string | null
  chart_data: ChartData
  time_unknown: boolean
  created_at: string
  updated_at: string
}

export interface AstrologyInterpretation {
  id: string
  category: string
  key: string
  title: string
  description: string
  keywords: string[]
  element: string | null
  modality: string | null
  ruling_planet: string | null
  created_at: string
}

export interface HoroscopeEntry {
  id: string
  sign: string
  date: string
  content: string
  created_at: string
}

// ─── Kaggle source shape (transform input) ───

export interface KaggleCard {
  name: string
  number: string
  arcana: string
  suit: string
  img: string
  fortune_telling: string[]
  keywords: string[]
  meanings: {
    light: string[]
    shadow: string[]
  }
  Archetype?: string
  'Hebrew Alphabet'?: string
  Numerology?: string
  Elemental?: string
  'Mythical/Spiritual'?: string
  'Questions to Ask'?: string[]
}

export interface KaggleDataset {
  description: string
  cards: KaggleCard[]
}
