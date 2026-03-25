// ─── Admin Table Configuration ───
// Config-driven definitions for all reference data tables managed via /admin

import type {
  Element,
  Planet,
  Chakra,
  ZodiacSign,
  MoonPhaseKey,
} from '@/lib/types'

// ─── Field Types ───

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'tags'
  | 'json'

export interface FieldConfig {
  key: string
  label: string
  type: FieldType
  required?: boolean
  options?: string[]
  placeholder?: string
  readOnly?: boolean
}

export interface ColumnConfig {
  key: string
  label: string
  render?: 'text' | 'badge' | 'boolean' | 'tags'
}

export interface TableConfig {
  table: string
  label: string
  icon: string
  description: string
  nameField: string
  defaultOrder: string
  columns: ColumnConfig[]
  fields: FieldConfig[]
  canCreate: boolean
  canDelete: boolean
}

// ─── Enum Values ───

export const ELEMENTS: Element[] = ['Fire', 'Water', 'Earth', 'Air', 'Spirit']

export const PLANETS: Planet[] = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
]

export const CHAKRAS: Chakra[] = [
  'Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown',
]

export const ZODIAC_SIGNS: ZodiacSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]

export const MOON_PHASES: MoonPhaseKey[] = [
  'new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
  'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent',
]

const MOON_PHASE_LABELS: string[] = [
  'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent',
]

const HERB_CATEGORIES = ['culinary', 'medicinal', 'magical', 'aromatic']
const DREAM_CATEGORIES = ['animal', 'nature', 'object', 'person', 'place', 'action', 'emotion', 'archetype', 'other']
const NUMEROLOGY_CATEGORIES = ['life_path', 'expression', 'soul_urge', 'personality', 'birthday', 'maturity', 'master_number']
const ASTROLOGY_CATEGORIES = ['sign', 'planet', 'house', 'aspect', 'element', 'modality']
const MODALITIES = ['Cardinal', 'Fixed', 'Mutable']

// ─── Table Configs ───

export const MODULE_CONFIG: TableConfig = {
  table: 'modules',
  label: 'Modules',
  icon: 'Settings',
  description: 'Manage feature modules: enable or disable sections of the app.',
  nameField: 'name',
  defaultOrder: 'key',
  columns: [
    { key: 'name', label: 'Name', render: 'text' },
    { key: 'key', label: 'Key', render: 'badge' },
    { key: 'enabled', label: 'Enabled', render: 'boolean' },
  ],
  fields: [
    { key: 'key', label: 'Key', type: 'text', readOnly: true },
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'What this module does...' },
    { key: 'enabled', label: 'Enabled', type: 'boolean' },
    { key: 'icon', label: 'Icon Name', type: 'text', placeholder: 'Lucide icon name' },
  ],
  canCreate: false,
  canDelete: false,
}

export const HERBS_CONFIG: TableConfig = {
  table: 'herbology_herbs',
  label: 'Herbs',
  icon: 'Leaf',
  description: 'Manage the herb reference library: properties, correspondences, and folklore.',
  nameField: 'name',
  defaultOrder: 'name',
  columns: [
    { key: 'name', label: 'Name', render: 'text' },
    { key: 'latin_name', label: 'Latin Name', render: 'text' },
    { key: 'element', label: 'Element', render: 'badge' },
    { key: 'planetary_ruler', label: 'Planet', render: 'badge' },
  ],
  fields: [
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Common name' },
    { key: 'latin_name', label: 'Latin Name', type: 'text', required: true, placeholder: 'Botanical name' },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'planetary_ruler', label: 'Planetary Ruler', type: 'select', options: PLANETS, required: true },
    { key: 'element', label: 'Element', type: 'select', options: ELEMENTS, required: true },
    { key: 'chakra', label: 'Chakra', type: 'select', options: CHAKRAS, required: true },
    { key: 'image_path', label: 'Image Path', type: 'text', placeholder: '/herbs/rosemary.jpg' },
    { key: 'magical_uses', label: 'Magical Uses', type: 'tags', placeholder: 'Add a magical use' },
    { key: 'medicinal_notes', label: 'Medicinal Notes', type: 'tags', placeholder: 'Add a note' },
    { key: 'warnings', label: 'Warnings', type: 'tags', placeholder: 'Add a warning' },
    { key: 'folklore', label: 'Folklore', type: 'textarea', placeholder: 'Historical lore and stories' },
    { key: 'growing_season', label: 'Growing Season', type: 'text', placeholder: 'e.g. Spring through Summer' },
    { key: 'correspondences', label: 'Correspondences', type: 'json', placeholder: '{"deities":[],"zodiac":[],"festivals":[]}' },
  ],
  canCreate: true,
  canDelete: true,
}

export const CRYSTALS_CONFIG: TableConfig = {
  table: 'crystals_stones',
  label: 'Crystals',
  icon: 'Gem',
  description: 'Manage the crystal and stone reference library.',
  nameField: 'name',
  defaultOrder: 'name',
  columns: [
    { key: 'name', label: 'Name', render: 'text' },
    { key: 'color', label: 'Color', render: 'text' },
    { key: 'element', label: 'Element', render: 'badge' },
    { key: 'chakra', label: 'Chakra', render: 'badge' },
  ],
  fields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'color', label: 'Color', type: 'text', required: true, placeholder: 'e.g. Deep purple' },
    { key: 'chakra', label: 'Primary Chakra', type: 'select', options: CHAKRAS, required: true },
    { key: 'chakras', label: 'All Chakras', type: 'tags', placeholder: 'Add a chakra' },
    { key: 'element', label: 'Element', type: 'select', options: ELEMENTS, required: true },
    { key: 'image_path', label: 'Image Path', type: 'text', placeholder: '/crystals/amethyst.jpg' },
    { key: 'hardness', label: 'Hardness (Mohs)', type: 'text', placeholder: 'e.g. 7' },
    { key: 'healing_properties', label: 'Healing Properties', type: 'tags', placeholder: 'Add a property' },
    { key: 'magical_uses', label: 'Magical Uses', type: 'tags', placeholder: 'Add a use' },
    { key: 'cleansing_methods', label: 'Cleansing Methods', type: 'tags', placeholder: 'Add a method' },
    { key: 'zodiac_signs', label: 'Zodiac Signs', type: 'tags', placeholder: 'Add a sign' },
    { key: 'planetary_ruler', label: 'Planetary Ruler', type: 'select', options: PLANETS, required: true },
    { key: 'affirmation', label: 'Affirmation', type: 'textarea', placeholder: 'I am...' },
    { key: 'cautions', label: 'Cautions', type: 'tags', placeholder: 'Add a caution' },
  ],
  canCreate: true,
  canDelete: true,
}

export const DREAMS_CONFIG: TableConfig = {
  table: 'dreams_symbols',
  label: 'Dream Symbols',
  icon: 'CloudMoon',
  description: 'Manage the dream symbol reference library.',
  nameField: 'name',
  defaultOrder: 'name',
  columns: [
    { key: 'name', label: 'Name', render: 'text' },
    { key: 'category', label: 'Category', render: 'badge' },
    { key: 'common_meanings', label: 'Meanings', render: 'tags' },
  ],
  fields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'category', label: 'Category', type: 'select', options: DREAM_CATEGORIES, required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'common_meanings', label: 'Common Meanings', type: 'tags', placeholder: 'Add a meaning' },
    { key: 'questions', label: 'Questions to Ask', type: 'tags', placeholder: 'Add a question' },
    { key: 'related_symbols', label: 'Related Symbols', type: 'tags', placeholder: 'Add a related symbol' },
  ],
  canCreate: true,
  canDelete: true,
}

export const NUMEROLOGY_CONFIG: TableConfig = {
  table: 'numerology_interpretations',
  label: 'Numerology',
  icon: 'Hash',
  description: 'Manage number interpretations for life path, expression, and other numerology categories.',
  nameField: 'title',
  defaultOrder: 'number',
  columns: [
    { key: 'number', label: '#', render: 'text' },
    { key: 'category', label: 'Category', render: 'badge' },
    { key: 'title', label: 'Title', render: 'text' },
    { key: 'keywords', label: 'Keywords', render: 'tags' },
  ],
  fields: [
    { key: 'number', label: 'Number', type: 'number', required: true },
    { key: 'category', label: 'Category', type: 'select', options: NUMEROLOGY_CATEGORIES, required: true },
    { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. The Leader' },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'keywords', label: 'Keywords', type: 'tags', placeholder: 'Add a keyword' },
    { key: 'strengths', label: 'Strengths', type: 'tags', placeholder: 'Add a strength' },
    { key: 'challenges', label: 'Challenges', type: 'tags', placeholder: 'Add a challenge' },
    { key: 'compatible_numbers', label: 'Compatible Numbers', type: 'tags', placeholder: 'Add a number' },
  ],
  canCreate: true,
  canDelete: true,
}

export const MOON_RITUALS_CONFIG: TableConfig = {
  table: 'moon_rituals',
  label: 'Moon Rituals',
  icon: 'Moon',
  description: 'Manage ritual guidance for each moon phase: intentions, activities, and correspondences.',
  nameField: 'phase_label',
  defaultOrder: 'phase',
  columns: [
    { key: 'phase_label', label: 'Phase', render: 'text' },
    { key: 'rituals', label: 'Rituals', render: 'tags' },
    { key: 'crystals', label: 'Crystals', render: 'tags' },
  ],
  fields: [
    { key: 'phase', label: 'Phase Key', type: 'select', options: MOON_PHASES, readOnly: true },
    { key: 'phase_label', label: 'Phase Label', type: 'select', options: MOON_PHASE_LABELS, required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'rituals', label: 'Rituals', type: 'tags', placeholder: 'Add a ritual' },
    { key: 'intentions', label: 'Intentions', type: 'tags', placeholder: 'Add an intention' },
    { key: 'activities', label: 'Activities', type: 'tags', placeholder: 'Add an activity' },
    { key: 'avoid', label: 'Things to Avoid', type: 'tags', placeholder: 'Add something to avoid' },
    { key: 'crystals', label: 'Crystals', type: 'tags', placeholder: 'Add a crystal' },
    { key: 'herbs', label: 'Herbs', type: 'tags', placeholder: 'Add an herb' },
  ],
  canCreate: false,
  canDelete: false,
}

export const ASTROLOGY_CONFIG: TableConfig = {
  table: 'astrology_interpretations',
  label: 'Astrology',
  icon: 'Star',
  description: 'Manage astrological interpretations: signs, planets, houses, and aspects.',
  nameField: 'title',
  defaultOrder: 'category,key',
  columns: [
    { key: 'category', label: 'Category', render: 'badge' },
    { key: 'key', label: 'Key', render: 'text' },
    { key: 'title', label: 'Title', render: 'text' },
    { key: 'element', label: 'Element', render: 'badge' },
  ],
  fields: [
    { key: 'category', label: 'Category', type: 'select', options: ASTROLOGY_CATEGORIES, required: true },
    { key: 'key', label: 'Key', type: 'text', required: true, placeholder: 'e.g. aries, sun, 1st-house' },
    { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. Aries: The Ram' },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
    { key: 'keywords', label: 'Keywords', type: 'tags', placeholder: 'Add a keyword' },
    { key: 'element', label: 'Element', type: 'select', options: [...ELEMENTS, ''] },
    { key: 'modality', label: 'Modality', type: 'select', options: [...MODALITIES, ''] },
    { key: 'ruling_planet', label: 'Ruling Planet', type: 'select', options: [...PLANETS, ''] },
  ],
  canCreate: true,
  canDelete: true,
}

// ─── Section Registry ───

export type AdminSection =
  | 'modules'
  | 'templates'
  | 'herbs'
  | 'crystals'
  | 'dreams'
  | 'numerology'
  | 'moon'
  | 'astrology'

export interface SectionDef {
  key: AdminSection
  label: string
  icon: string
  config?: TableConfig
}

export const ADMIN_SECTIONS: SectionDef[] = [
  { key: 'modules', label: 'Modules', icon: 'Settings', config: MODULE_CONFIG },
  { key: 'templates', label: 'Templates', icon: 'FileText' },
  { key: 'herbs', label: 'Herbs', icon: 'Leaf', config: HERBS_CONFIG },
  { key: 'crystals', label: 'Crystals', icon: 'Gem', config: CRYSTALS_CONFIG },
  { key: 'dreams', label: 'Dream Symbols', icon: 'CloudMoon', config: DREAMS_CONFIG },
  { key: 'numerology', label: 'Numerology', icon: 'Hash', config: NUMEROLOGY_CONFIG },
  { key: 'moon', label: 'Moon Rituals', icon: 'Moon', config: MOON_RITUALS_CONFIG },
  { key: 'astrology', label: 'Astrology', icon: 'Star', config: ASTROLOGY_CONFIG },
]

// ─── API Whitelist ───

export const ADMIN_TABLE_WHITELIST = [
  'modules',
  'tarot_synthesis_templates',
  'herbology_herbs',
  'crystals_stones',
  'dreams_symbols',
  'numerology_interpretations',
  'moon_rituals',
  'astrology_interpretations',
] as const

export type AdminTable = (typeof ADMIN_TABLE_WHITELIST)[number]
