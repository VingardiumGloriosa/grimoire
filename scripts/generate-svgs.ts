/**
 * generate-svgs.ts
 *
 * Generates minimalistic line-art SVG illustrations for herbs and crystals.
 * Each SVG: viewBox 0 0 64 64, single-weight stroke, no fill, uses currentColor.
 *
 * Usage: npx tsx scripts/generate-svgs.ts
 */

import * as fs from 'fs'
import * as path from 'path'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function svgWrap(inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">\n${inner}\n</svg>\n`
}

// ─── HERB SVG GENERATORS ───
// Each generates a unique botanical line drawing

const herbDrawings: Record<string, string> = {
  'Lavender': `  <path d="M32 58V28"/>
  <path d="M32 28c0-3 2-6 2-9s-1-5-2-7"/>
  <path d="M30 16c-1 2-2 4-2 7s2 6 2 9"/>
  <path d="M28 14a2 2 0 1 1 4 0"/>
  <path d="M26 18a2 2 0 1 1 4 0"/>
  <path d="M30 12a2 2 0 1 1 4 0"/>
  <path d="M27 22a2 1.5 0 1 1 3 0"/>
  <path d="M31 16a2 1.5 0 1 1 3 0"/>
  <path d="M25 15a1.5 2 0 1 1 3 0"/>
  <path d="M32 40l8-6M32 44l-7-5"/>`,

  'Rosemary': `  <path d="M32 58V20"/>
  <path d="M32 36l10-8M32 36l-10-8"/>
  <path d="M32 28l8-6M32 28l-8-6"/>
  <path d="M32 44l6-5M32 44l-6-5"/>
  <path d="M32 20l5-4M32 20l-5-4"/>
  <path d="M42 28c2-1 3-2 4-1M22 28c-2-1-3-2-4-1"/>
  <path d="M37 24c1-1 2-2 3-1M27 24c-1-1-2-2-3-1"/>`,

  'White Sage': `  <path d="M32 58V22"/>
  <path d="M32 38c6 0 12-3 12-8s-6-6-12-6"/>
  <path d="M32 38c-6 0-12-3-12-8s6-6 12-6"/>
  <path d="M32 30c4 0 8-2 8-5s-4-4-8-4"/>
  <path d="M32 30c-4 0-8-2-8-5s4-4 8-4"/>
  <path d="M32 48l6-4M32 48l-6-4"/>`,

  'Mugwort': `  <path d="M32 58V18"/>
  <path d="M32 34l10-4c2-1 3-3 2-5M32 34l-10-4c-2-1-3-3-2-5"/>
  <path d="M32 26l8-3c2-1 2-3 1-4M32 26l-8-3c-2-1-2-3-1-4"/>
  <path d="M32 42l7-3M32 42l-7-3"/>
  <path d="M42 30l3-2M22 30l-3-2"/>
  <path d="M32 18l3-4M32 18l-3-4"/>`,

  'Chamomile': `  <circle cx="32" cy="18" r="4"/>
  <path d="M32 22V58"/>
  <path d="M28 18l-6-2M36 18l6-2"/>
  <path d="M28 15l-4-5M36 15l4-5"/>
  <path d="M32 14l0-6"/>
  <path d="M29 21l-5 3M35 21l5 3"/>
  <path d="M32 36l8-4M32 36l-8-4"/>
  <path d="M32 46l6-3M32 46l-6-3"/>`,

  'Thyme': `  <path d="M32 58V24"/>
  <path d="M32 36l5-2 2 0M32 36l-5-2-2 0"/>
  <path d="M32 32l4-1.5 2 0M32 32l-4-1.5-2 0"/>
  <path d="M32 40l5-2 2 0M32 40l-5-2-2 0"/>
  <path d="M32 44l4-1.5M32 44l-4-1.5"/>
  <path d="M32 28l3-1M32 28l-3-1"/>
  <path d="M32 24l2-2M32 24l-2-2"/>`,

  'Basil': `  <path d="M32 58V26"/>
  <path d="M32 38c8 0 11-4 10-8-1-3-5-4-10-4"/>
  <path d="M32 38c-8 0-11-4-10-8 1-3 5-4 10-4"/>
  <path d="M32 32c5 0 7-2 7-5s-3-3-7-3"/>
  <path d="M32 32c-5 0-7-2-7-5s3-3 7-3"/>
  <path d="M32 48l5-3M32 48l-5-3"/>`,

  'Peppermint': `  <path d="M32 58V20"/>
  <path d="M32 36c7-1 10-5 9-9-1-3-4-4-9-3"/>
  <path d="M32 36c-7-1-10-5-9-9 1-3 4-4 9-3"/>
  <path d="M32 46l7-3M32 46l-7-3"/>
  <path d="M41 27l3-1M23 27l-3-1"/>
  <path d="M32 20c1-2 3-4 5-4M32 20c-1-2-3-4-5-4"/>`,

  'Bay Laurel': `  <path d="M32 58V22"/>
  <path d="M32 34c8 1 13-2 13-7s-5-7-13-7"/>
  <path d="M32 34c-8 1-13-2-13-7s5-7 13-7"/>
  <line x1="32" y1="34" x2="45" y2="27"/>
  <line x1="32" y1="34" x2="19" y2="27"/>
  <path d="M32 46l6-3M32 46l-6-3"/>`,

  'Yarrow': `  <path d="M32 58V20"/>
  <path d="M32 20l-3-4M32 20l3-4M32 20l0-5"/>
  <circle cx="29" cy="14" r="2"/>
  <circle cx="35" cy="14" r="2"/>
  <circle cx="32" cy="13" r="2"/>
  <path d="M32 38l8-6M32 38l-8-6"/>
  <path d="M32 48l5-4M32 48l-5-4"/>
  <path d="M40 32l3-2M24 32l-3-2"/>`,

  'Vervain': `  <path d="M32 58V16"/>
  <path d="M32 16l0-6M30 12l2-2 2 2"/>
  <path d="M32 30l10-6M32 30l-10-6"/>
  <path d="M32 40l8-5M32 40l-8-5"/>
  <path d="M42 24l4-2M22 24l-4-2"/>
  <circle cx="32" cy="8" r="1.5"/>
  <circle cx="30" cy="11" r="1"/>
  <circle cx="34" cy="11" r="1"/>`,

  'Elderflower': `  <path d="M32 58V28"/>
  <path d="M32 28l-6-6M32 28l6-6M32 28l0-8"/>
  <circle cx="26" cy="20" r="2.5"/>
  <circle cx="38" cy="20" r="2.5"/>
  <circle cx="32" cy="18" r="2.5"/>
  <circle cx="29" cy="16" r="2"/>
  <circle cx="35" cy="16" r="2"/>
  <path d="M32 40l7-4M32 40l-7-4"/>`,

  'Stinging Nettle': `  <path d="M32 58V14"/>
  <path d="M32 34l9-3M32 34l-9-3"/>
  <path d="M32 26l7-2M32 26l-7-2"/>
  <path d="M32 42l8-3M32 42l-8-3"/>
  <path d="M32 18l5-2M32 18l-5-2"/>
  <path d="M41 31l2 1M23 31l-2 1"/>
  <path d="M39 23l2 1M25 23l-2 1"/>
  <path d="M32 14l1-3M32 14l-1-3"/>`,

  'Dandelion': `  <circle cx="32" cy="16" r="8" stroke-dasharray="2 2"/>
  <path d="M32 24V58"/>
  <path d="M32 16l0-8M32 16l5-6M32 16l-5-6"/>
  <path d="M32 16l7-3M32 16l-7-3"/>
  <path d="M32 16l4 2M32 16l-4 2"/>
  <path d="M32 40l6-4M32 40l-6-4"/>`,

  'Rose': `  <path d="M32 58V30"/>
  <path d="M32 24c0-4-3-6-6-5s-3 5 0 7 6 2 6-2z"/>
  <path d="M32 24c0-4 3-6 6-5s3 5 0 7-6 2-6-2z"/>
  <path d="M32 20c0-3-2-5-4-4s-2 4 0 5 4 1 4-1z"/>
  <path d="M32 20c0-3 2-5 4-4s2 4 0 5-4 1-4-1z"/>
  <path d="M32 40l6-3c2-1 3 0 3 1M32 40l-6-3c-2-1-3 0-3 1"/>
  <path d="M34 34l2-1M30 34l-2-1"/>`,

  'Jasmine': `  <path d="M32 58V28"/>
  <path d="M32 22l-3-4 3-2 3 2-3 4z"/>
  <path d="M29 18l-4-1M35 18l4-1"/>
  <path d="M32 16l0-4"/>
  <path d="M28 22l-3 1M36 22l3 1"/>
  <circle cx="32" cy="19" r="1.5"/>
  <path d="M32 38l8-4M32 38l-8-4"/>
  <path d="M32 48l6-3M32 48l-6-3"/>`,

  'Cinnamon': `  <path d="M28 10c-2 8-2 16 0 24s4 16 4 24"/>
  <path d="M36 10c2 8 2 16 0 24s-4 16-4 24"/>
  <path d="M24 20h16M24 30h16M24 40h16"/>
  <path d="M26 15h12M26 25h12M26 35h12M26 45h12"/>`,

  'Clove': `  <path d="M32 58V30"/>
  <circle cx="32" cy="22" r="6"/>
  <path d="M32 16V10"/>
  <path d="M29 17l-2-3M35 17l2-3"/>
  <path d="M26 22l-3 0M38 22l3 0"/>
  <path d="M32 28l0 2"/>
  <circle cx="32" cy="22" r="2"/>`,

  'Frankincense': `  <path d="M26 56c2-8 4-16 6-24s4-14 6-22"/>
  <path d="M38 56c-2-8-4-16-6-24s-4-14-6-22"/>
  <ellipse cx="32" cy="32" rx="4" ry="6"/>
  <path d="M28 24l-2-2M36 24l2-2"/>
  <path d="M28 40l-2 2M36 40l2 2"/>
  <circle cx="32" cy="14" r="2"/>`,

  'Myrrh': `  <path d="M24 10c0 12 4 20 8 24s8 12 8 24"/>
  <path d="M40 10c0 12-4 20-8 24s-8 12-8 24"/>
  <path d="M28 26c0 4 4 8 4 12M36 26c0 4-4 8-4 12"/>
  <circle cx="32" cy="20" r="3"/>
  <circle cx="28" cy="42" r="2"/>
  <circle cx="36" cy="42" r="2"/>`,

  'Garden Sage': `  <path d="M32 58V22"/>
  <path d="M32 36c7 0 11-3 11-7s-5-6-11-5"/>
  <path d="M32 36c-7 0-11-3-11-7s5-6 11-5"/>
  <path d="M32 28c5 0 8-2 8-5s-4-4-8-4"/>
  <path d="M32 28c-5 0-8-2-8-5s4-4 8-4"/>
  <path d="M32 48l6-3M32 48l-6-3"/>`,

  "St. John's Wort": `  <path d="M32 58V22"/>
  <circle cx="32" cy="16" r="5"/>
  <path d="M32 11l0-4"/>
  <path d="M27 16l-4 0M37 16l4 0"/>
  <path d="M28.5 12.5l-3-3M35.5 12.5l3-3"/>
  <path d="M28.5 19.5l-3 3M35.5 19.5l3 3"/>
  <path d="M32 38l7-4M32 38l-7-4"/>
  <path d="M32 48l5-3M32 48l-5-3"/>`,

  'Valerian': `  <path d="M32 58V22"/>
  <path d="M32 22l-4-6-2-2M32 22l4-6 2-2M32 22l0-8"/>
  <circle cx="26" cy="12" r="2"/>
  <circle cx="38" cy="12" r="2"/>
  <circle cx="32" cy="12" r="2.5"/>
  <circle cx="29" cy="14" r="1.5"/>
  <circle cx="35" cy="14" r="1.5"/>
  <path d="M32 36l7-4M32 36l-7-4"/>`,

  'Wormwood': `  <path d="M32 58V14"/>
  <path d="M32 30l8-2c3-1 4-3 3-5M32 30l-8-2c-3-1-4-3-3-5"/>
  <path d="M32 22l6-2c2-1 3-2 2-4M32 22l-6-2c-2-1-3-2-2-4"/>
  <path d="M32 38l7-2M32 38l-7-2"/>
  <path d="M32 14l4-3M32 14l-4-3"/>
  <path d="M40 28l2-1M24 28l-2-1"/>`,

  'Comfrey': `  <path d="M32 58V20"/>
  <path d="M32 32c10 0 14-4 13-9s-6-7-13-7"/>
  <path d="M32 32c-10 0-14-4-13-9s6-7 13-7"/>
  <line x1="32" y1="32" x2="45" y2="23"/>
  <line x1="32" y1="32" x2="19" y2="23"/>
  <path d="M32 46l8-4M32 46l-8-4"/>`,

  'Lemon Balm': `  <path d="M32 58V22"/>
  <path d="M32 34c6 1 10-1 10-5s-4-5-10-5"/>
  <path d="M32 34c-6 1-10-1-10-5s4-5 10-5"/>
  <path d="M32 44c5 0 8-1 8-4s-3-4-8-3"/>
  <path d="M32 44c-5 0-8-1-8-4s3-4 8-3"/>
  <path d="M32 22l2-4M32 22l-2-4"/>`,

  'Angelica': `  <path d="M32 58V18"/>
  <path d="M32 18l-6-4-4-2M32 18l6-4 4-2M32 18l0-8"/>
  <path d="M22 12l-3-1M42 12l3-1M32 10l-2-2M32 10l2-2"/>
  <circle cx="32" cy="8" r="1"/>
  <circle cx="22" cy="11" r="1"/>
  <circle cx="42" cy="11" r="1"/>
  <path d="M32 32l9-5M32 32l-9-5"/>
  <path d="M32 44l7-4M32 44l-7-4"/>`,

  'Calendula': `  <path d="M32 58V30"/>
  <circle cx="32" cy="20" r="5"/>
  <path d="M32 15l0-4M27 20l-4 0M37 20l4 0"/>
  <path d="M28.5 16.5l-3-3M35.5 16.5l3-3"/>
  <path d="M28.5 23.5l-2 2M35.5 23.5l2 2"/>
  <path d="M32 42l7-4M32 42l-7-4"/>
  <path d="M32 50l5-3M32 50l-5-3"/>`,

  'Echinacea': `  <path d="M32 58V28"/>
  <ellipse cx="32" cy="20" rx="4" ry="5"/>
  <path d="M28 20l-6 4M36 20l6 4"/>
  <path d="M29 16l-4-2M35 16l4-2"/>
  <path d="M32 15l0-4"/>
  <path d="M29 24l-5 1M35 24l5 1"/>
  <path d="M32 40l7-4M32 40l-7-4"/>`,

  'Hawthorn': `  <path d="M32 58V26"/>
  <path d="M32 26l-6-8M32 26l6-8M32 26l0-10"/>
  <path d="M26 18l-4-2M38 18l4-2"/>
  <circle cx="24" cy="14" r="2.5"/>
  <circle cx="40" cy="14" r="2.5"/>
  <circle cx="32" cy="14" r="3"/>
  <path d="M32 40l6-3M32 40l-6-3"/>`,

  'Catnip': `  <path d="M32 58V22"/>
  <path d="M32 34c6 0 9-3 9-6s-3-5-9-5"/>
  <path d="M32 34c-6 0-9-3-9-6s3-5 9-5"/>
  <path d="M32 26c4 0 6-2 6-4s-2-3-6-3"/>
  <path d="M32 26c-4 0-6-2-6-4s2-3 6-3"/>
  <path d="M32 44l6-3M32 44l-6-3"/>`,

  'Hyssop': `  <path d="M32 58V16"/>
  <path d="M34 20c2 0 3-1 3-2s-1-2-3-2M30 20c-2 0-3-1-3-2s1-2 3-2"/>
  <path d="M34 26c2 0 3-1 3-2s-1-2-3-2M30 26c-2 0-3-1-3-2s1-2 3-2"/>
  <path d="M34 32c2 0 3-1 3-2s-1-2-3-2M30 32c-2 0-3-1-3-2s1-2 3-2"/>
  <path d="M32 40l5-2M32 40l-5-2"/>
  <path d="M32 16l1-3M32 16l-1-3"/>`,

  'Mandrake': `  <path d="M32 8V30"/>
  <path d="M28 30c-4 8-8 14-10 22M36 30c4 8 8 14 10 22"/>
  <path d="M30 30c-1 8-2 14-2 22M34 30c1 8 2 14 2 22"/>
  <path d="M32 16c6 0 10-2 10-4s-4-4-10-4-10 2-10 4 4 4 10 4"/>
  <path d="M28 10l-3-2M36 10l3-2"/>`,

  'Rue': `  <path d="M32 58V18"/>
  <path d="M32 30l6-2 3-4M32 30l-6-2-3-4"/>
  <path d="M32 22l5-2 2-3M32 22l-5-2-2-3"/>
  <path d="M32 38l5-2M32 38l-5-2"/>
  <path d="M41 28l2-2M23 28l-2-2"/>
  <path d="M32 18l2-4M32 18l-2-4"/>`,

  'Meadowsweet': `  <path d="M32 58V20"/>
  <path d="M32 20l-4-4M32 20l4-4M32 20l-8-6M32 20l8-6M32 20l0-8"/>
  <circle cx="28" cy="14" r="1.5"/>
  <circle cx="36" cy="14" r="1.5"/>
  <circle cx="24" cy="12" r="1.5"/>
  <circle cx="40" cy="12" r="1.5"/>
  <circle cx="32" cy="10" r="1.5"/>
  <path d="M32 38l7-4M32 38l-7-4"/>`,

  'Dill': `  <path d="M32 58V18"/>
  <path d="M32 18l-6-6M32 18l6-6M32 18l-3-7M32 18l3-7M32 18l0-8"/>
  <path d="M26 12l-2-1M38 12l2-1"/>
  <path d="M29 11l-1-2M35 11l1-2"/>
  <path d="M32 34l6-2 3 0M32 34l-6-2-3 0"/>
  <path d="M32 44l5-2M32 44l-5-2"/>`,

  'Mullein': `  <path d="M32 58V8"/>
  <path d="M30 14c-2 0-3-1-3-2M34 14c2 0 3-1 3-2"/>
  <path d="M30 20c-2 0-3-1-3-2M34 20c2 0 3-1 3-2"/>
  <path d="M30 26c-2 0-3-1-3-2M34 26c2 0 3-1 3-2"/>
  <path d="M32 36c6 1 10-1 10-4s-4-5-10-5"/>
  <path d="M32 36c-6 1-10-1-10-4s4-5 10-5"/>
  <path d="M32 46c5 0 8-1 8-4s-3-4-8-4"/>
  <path d="M32 46c-5 0-8-1-8-4s3-4 8-4"/>`,

  'Hibiscus': `  <path d="M32 58V30"/>
  <path d="M32 26c-4-6-10-8-12-4s2 10 8 10"/>
  <path d="M32 26c4-6 10-8 12-4s-2 10-8 10"/>
  <path d="M32 26c-6-4-12-2-12 2s6 6 10 4"/>
  <path d="M32 26c6-4 12-2 12 2s-6 6-10 4"/>
  <path d="M32 26V14"/>
  <circle cx="32" cy="12" r="2"/>`,

  'Ginger': `  <path d="M20 32c4-2 8-2 12 0s8 2 12 0"/>
  <path d="M20 32c0-6 4-10 6-14M44 32c0-6-4-10-6-14"/>
  <path d="M26 18c2-4 4-6 6-8M38 18c-2-4-4-6-6-8"/>
  <path d="M20 32c-2 6 0 12 2 16M44 32c2 6 0 12-2 16"/>
  <path d="M22 48c4 4 8 6 10 6M42 48c-4 4-8 6-10 6"/>`,

  'Parsley': `  <path d="M32 58V28"/>
  <path d="M32 28l-6-4c-3-2-4-6-2-8M32 28l6-4c3-2 4-6 2-8"/>
  <path d="M32 28l0-10c0-3-1-6 0-8"/>
  <path d="M24 16l-2-3M40 16l2-3"/>
  <path d="M32 40l7-3M32 40l-7-3"/>`,

  'Plantain': `  <path d="M32 58V30"/>
  <path d="M32 30c8 0 12-4 12-10s-5-8-12-8"/>
  <path d="M32 30c-8 0-12-4-12-10s5-8 12-8"/>
  <line x1="32" y1="30" x2="44" y2="20"/>
  <line x1="32" y1="30" x2="20" y2="20"/>
  <line x1="32" y1="30" x2="42" y2="14"/>
  <line x1="32" y1="30" x2="22" y2="14"/>`,

  'Sandalwood': `  <path d="M32 58V16"/>
  <path d="M32 26l10-4M32 26l-10-4"/>
  <path d="M42 22l4-2 3 0M22 22l-4-2-3 0"/>
  <path d="M32 18l6-3M32 18l-6-3"/>
  <path d="M32 36l8-3M32 36l-8-3"/>
  <path d="M32 46l6-2M32 46l-6-2"/>`,

  'Patchouli': `  <path d="M32 58V24"/>
  <path d="M32 36c8 0 12-3 11-7s-5-6-11-5"/>
  <path d="M32 36c-8 0-12-3-11-7s5-6 11-5"/>
  <path d="M32 28l6-2M32 28l-6-2"/>
  <path d="M38 26c2-1 3-3 2-4M26 26c-2-1-3-3-2-4"/>
  <path d="M32 48l7-3M32 48l-7-3"/>`,

  "Dragon's Blood": `  <path d="M32 58V20"/>
  <path d="M32 20c-8 0-12-4-10-8s8-6 10-4"/>
  <path d="M32 20c8 0 12-4 10-8s-8-6-10-4"/>
  <path d="M32 16l0-8"/>
  <path d="M28 10l-2-3M36 10l2-3"/>
  <path d="M32 34l8-4M32 34l-8-4"/>
  <path d="M32 44l6-3M32 44l-6-3"/>`,

  'Witch Hazel': `  <path d="M32 58V22"/>
  <path d="M32 22l-8-10M32 22l8-10M32 22l-4-12M32 22l4-12"/>
  <path d="M24 12l-3 0M40 12l3 0"/>
  <path d="M28 10l-1-2M36 10l1-2"/>
  <path d="M32 36l8-4M32 36l-8-4"/>
  <path d="M32 48l6-3M32 48l-6-3"/>`,

  'Lemongrass': `  <path d="M28 58c1-14 2-24 3-36M36 58c-1-14-2-24-3-36"/>
  <path d="M31 22c-1-6-3-10-5-14M33 22c1-6 3-10 5-14"/>
  <path d="M26 8l-2-2M38 8l2-2"/>
  <path d="M30 14c-2-2-4-2-6 0M34 14c2-2 4-2 6 0"/>`,

  'Juniper': `  <path d="M32 58V14"/>
  <path d="M32 24l8-4M32 24l-8-4"/>
  <path d="M32 32l10-5M32 32l-10-5"/>
  <path d="M32 40l8-4M32 40l-8-4"/>
  <path d="M32 48l6-3M32 48l-6-3"/>
  <path d="M32 18l5-3M32 18l-5-3"/>
  <path d="M32 14l2-4M32 14l-2-4"/>
  <circle cx="36" cy="30" r="1.5"/>
  <circle cx="28" cy="34" r="1.5"/>`,

  'Borage': `  <path d="M32 58V28"/>
  <path d="M32 22l-5-2-1-4 6-2 6 2-1 4-5 2z"/>
  <circle cx="32" cy="18" r="2"/>
  <path d="M27 20l-3 1M37 20l3 1"/>
  <path d="M32 40l8-4M32 40l-8-4"/>
  <path d="M32 50l6-3M32 50l-6-3"/>`,

  'Marjoram': `  <path d="M32 58V22"/>
  <path d="M32 32l5-1c2 0 3-2 3-4s-2-3-4-3M32 32l-5-1c-2 0-3-2-3-4s2-3 4-3"/>
  <path d="M32 24l4-1c2 0 3-1 3-3s-1-2-3-2M32 24l-4-1c-2 0-3-1-3-3s1-2 3-2"/>
  <path d="M32 42l5-2M32 42l-5-2"/>
  <path d="M32 22l1-3M32 22l-1-3"/>`,

  'Turmeric': `  <path d="M32 58V30"/>
  <path d="M32 30c10 2 14-2 13-8s-6-8-13-6"/>
  <path d="M32 30c-10 2-14-2-13-8s6-8 13-6"/>
  <line x1="32" y1="30" x2="45" y2="22"/>
  <line x1="32" y1="30" x2="19" y2="22"/>
  <path d="M32 46l7-3M32 46l-7-3"/>`,

  'Cardamom': `  <path d="M32 58V26"/>
  <ellipse cx="32" cy="18" rx="5" ry="8"/>
  <line x1="32" y1="10" x2="32" y2="26"/>
  <path d="M27 18l-2 0M37 18l2 0"/>
  <path d="M29 13l-1-1M35 13l1-1"/>
  <path d="M32 40l7-3M32 40l-7-3"/>`,

  'Star Anise': `  <path d="M32 58V32"/>
  <path d="M32 20l0-8M32 20l7 5M32 20l-7 5M32 20l7-5M32 20l-7-5M32 20l4 7M32 20l-4 7M32 20l4-7M32 20l-4-7"/>
  <circle cx="32" cy="20" r="3"/>
  <circle cx="32" cy="12" r="1"/>
  <circle cx="39" cy="25" r="1"/>
  <circle cx="25" cy="25" r="1"/>
  <circle cx="36" cy="13" r="1"/>
  <circle cx="28" cy="13" r="1"/>`,

  'Passionflower': `  <path d="M32 58V30"/>
  <circle cx="32" cy="20" r="8"/>
  <circle cx="32" cy="20" r="4"/>
  <path d="M32 12l0-2M32 28l0 2"/>
  <path d="M24 20l-2 0M40 20l2 0"/>
  <path d="M26.3 14.3l-1.5-1.5M37.7 25.7l1.5 1.5"/>
  <path d="M37.7 14.3l1.5-1.5M26.3 25.7l-1.5 1.5"/>
  <circle cx="32" cy="20" r="1.5"/>`,

  'Skullcap': `  <path d="M32 58V24"/>
  <path d="M32 24c-3-2-6-6-6-10s2-6 6-6"/>
  <path d="M32 24c3-2 6-6 6-10s-2-6-6-6"/>
  <path d="M28 14l-2-1M36 14l2-1"/>
  <path d="M32 38l6-3M32 38l-6-3"/>
  <path d="M32 48l5-2M32 48l-5-2"/>`,

  'Saffron': `  <path d="M32 58V26"/>
  <path d="M32 26l-6-16M32 26l6-16M32 26l0-18"/>
  <path d="M26 10c-1-2-1-4 0-4M38 10c1-2 1-4 0-4"/>
  <path d="M32 8c0-2 0-4 0-4"/>
  <path d="M32 38l5-2M32 38l-5-2"/>`,

  'Motherwort': `  <path d="M32 58V12"/>
  <path d="M32 28l7-3c2-1 3-3 2-4M32 28l-7-3c-2-1-3-3-2-4"/>
  <path d="M32 20l6-2c2-1 2-3 1-4M32 20l-6-2c-2-1-2-3-1-4"/>
  <path d="M32 36l6-2M32 36l-6-2"/>
  <path d="M32 44l5-2M32 44l-5-2"/>
  <path d="M32 12l2-3M32 12l-2-3"/>`,

  'Oat Straw': `  <path d="M32 58V10"/>
  <path d="M32 18l4-8M32 18l-4-8"/>
  <path d="M32 26l3-6M32 26l-3-6"/>
  <path d="M36 10c1-2 2-2 3 0M28 10c-1-2-2-2-3 0"/>
  <path d="M35 20c1-1 2-1 2 0M29 20c-1-1-2-1-2 0"/>
  <path d="M32 36l6-2M32 36l-6-2"/>`,

  'Bergamot': `  <path d="M32 58V28"/>
  <circle cx="32" cy="20" r="7"/>
  <path d="M32 13V10"/>
  <path d="M30 10c0-1 1-2 2-2s2 1 2 2"/>
  <path d="M32 38l7-3M32 38l-7-3"/>
  <path d="M32 48l5-2M32 48l-5-2"/>`,

  'Eucalyptus': `  <path d="M32 58V14"/>
  <path d="M32 28c8 0 12-3 11-7s-5-6-11-5"/>
  <path d="M32 28c-8 0-12-3-11-7s5-6 11-5"/>
  <path d="M32 40c6 0 9-2 9-5s-4-5-9-4"/>
  <path d="M32 40c-6 0-9-2-9-5s4-5 9-4"/>
  <path d="M32 14c1-2 3-4 4-4M32 14c-1-2-3-4-4-4"/>`,

  'Tobacco': `  <path d="M32 58V24"/>
  <path d="M32 36c10 2 16-2 15-8s-7-8-15-7"/>
  <path d="M32 36c-10 2-16-2-15-8s7-8 15-7"/>
  <line x1="32" y1="36" x2="47" y2="28"/>
  <line x1="32" y1="36" x2="17" y2="28"/>
  <path d="M32 24l3-6M32 24l-3-6"/>`,

  'Honeysuckle': `  <path d="M20 58c4-12 8-20 12-26s8-12 12-22"/>
  <path d="M32 32l-4-8 4-4 4 4-4 8"/>
  <path d="M28 24l-3-2M36 24l3-2"/>
  <path d="M32 20l0-4"/>
  <path d="M32 44l6-3M32 44l-6-3"/>
  <circle cx="32" cy="14" r="1.5"/>`,

  'Black Pepper': `  <path d="M32 58V18"/>
  <path d="M32 18l-4-6M32 18l4-6"/>
  <circle cx="28" cy="10" r="2"/>
  <circle cx="36" cy="10" r="2"/>
  <circle cx="32" cy="8" r="2"/>
  <circle cx="30" cy="12" r="1.5"/>
  <circle cx="34" cy="12" r="1.5"/>
  <path d="M32 34l7-4M32 34l-7-4"/>
  <path d="M32 44l5-3M32 44l-5-3"/>`,

  'Heather': `  <path d="M32 58V16"/>
  <path d="M30 18c-1 0-2-1-2-2M34 18c1 0 2-1 2-2"/>
  <path d="M30 22c-1 0-2-1-2-2M34 22c1 0 2-1 2-2"/>
  <path d="M30 26c-1 0-2-1-2-2M34 26c1 0 2-1 2-2"/>
  <path d="M30 30c-1 0-2-1-2-2M34 30c1 0 2-1 2-2"/>
  <path d="M32 16l1-3M32 16l-1-3"/>
  <path d="M32 40l5-2M32 40l-5-2"/>`,

  'Vetiver': `  <path d="M32 6V32"/>
  <path d="M32 32l-8 26M32 32l8 26"/>
  <path d="M32 32l-4 26M32 32l4 26"/>
  <path d="M32 32l0 26"/>
  <path d="M32 16l6-3M32 16l-6-3"/>
  <path d="M32 24l5-2M32 24l-5-2"/>`,

  'Willow': `  <path d="M32 58V12"/>
  <path d="M32 20c-4 8-8 16-14 20M32 20c4 8 8 16 14 20"/>
  <path d="M32 16c-3 6-6 12-10 16M32 16c3 6 6 12 10 16"/>
  <path d="M32 24c-5 10-8 14-12 18M32 24c5 10 8 14 12 18"/>
  <path d="M32 12l2-4M32 12l-2-4"/>`,

  'Nutmeg': `  <path d="M32 58V32"/>
  <ellipse cx="32" cy="22" rx="7" ry="9"/>
  <ellipse cx="32" cy="22" rx="4" ry="6"/>
  <path d="M32 13l0-3"/>
  <path d="M30 11c0-1 1-2 2-2s2 1 2 2"/>`,

  'Aloe Vera': `  <path d="M32 58V32"/>
  <path d="M32 32l-8-20c-1-2 0-4 2-4"/>
  <path d="M32 32l8-20c1-2 0-4-2-4"/>
  <path d="M32 32l-4-22c0-2 1-3 2-2"/>
  <path d="M32 32l4-22c0-2-1-3-2-2"/>
  <path d="M32 32l0-24c0-2 0-3 0-2"/>`,

  'Garlic': `  <path d="M32 58V34"/>
  <path d="M32 34c-6 0-10-4-10-10s4-10 6-12"/>
  <path d="M32 34c6 0 10-4 10-10s-4-10-6-12"/>
  <path d="M32 34c-2 0-4-4-4-10s2-10 4-12"/>
  <path d="M32 34c2 0 4-4 4-10s-2-10-4-12"/>
  <path d="M32 12l0-4"/>
  <path d="M30 9l2-3 2 3"/>`,

  'Hemp': `  <path d="M32 58V18"/>
  <path d="M32 28l10-6M32 28l-10-6"/>
  <path d="M42 22l4-3 3-1M22 22l-4-3-3-1"/>
  <path d="M32 20l7-5M32 20l-7-5"/>
  <path d="M39 15l3-2M25 15l-3-2"/>
  <path d="M32 36l8-4M32 36l-8-4"/>
  <path d="M32 44l6-3M32 44l-6-3"/>`,

  'Damiana': `  <path d="M32 58V20"/>
  <path d="M32 32c7 0 10-3 9-6s-4-5-9-4"/>
  <path d="M32 32c-7 0-10-3-9-6s4-5 9-4"/>
  <path d="M32 24c5 0 7-2 7-4s-3-4-7-3"/>
  <path d="M32 24c-5 0-7-2-7-4s3-4 7-3"/>
  <path d="M32 42l6-3M32 42l-6-3"/>
  <circle cx="32" cy="16" r="2"/>`,

  'Ashwagandha': `  <path d="M32 58V22"/>
  <path d="M32 36l8-4M32 36l-8-4"/>
  <path d="M40 32c2-1 3-3 2-5M24 32c-2-1-3-3-2-5"/>
  <path d="M32 28l6-3M32 28l-6-3"/>
  <circle cx="32" cy="16" r="4"/>
  <circle cx="32" cy="16" r="2"/>
  <path d="M32 12l0-3"/>`,

  'Holy Basil': `  <path d="M32 58V22"/>
  <path d="M32 34c7 1 11-2 10-6s-5-5-10-4"/>
  <path d="M32 34c-7 1-11-2-10-6s5-5 10-4"/>
  <path d="M32 26c5 0 8-2 7-5s-3-4-7-3"/>
  <path d="M32 26c-5 0-8-2-7-5s3-4 7-3"/>
  <circle cx="32" cy="14" r="3"/>
  <path d="M32 44l6-3M32 44l-6-3"/>`,

  'Mistletoe': `  <path d="M32 32V58"/>
  <path d="M32 32l-8-8M32 32l8-8"/>
  <path d="M24 24l-4-4M40 24l4-4"/>
  <ellipse cx="22" cy="18" rx="4" ry="6"/>
  <ellipse cx="42" cy="18" rx="4" ry="6"/>
  <circle cx="32" cy="32" r="2.5"/>
  <circle cx="28" cy="30" r="2"/>
  <circle cx="36" cy="30" r="2"/>`,

  'Violet': `  <path d="M32 58V30"/>
  <path d="M32 24c-4-2-8-1-8 2s4 5 8 4"/>
  <path d="M32 24c4-2 8-1 8 2s-4 5-8 4"/>
  <path d="M32 24c-2-4-1-8 2-8"/>
  <path d="M32 24c2-4 1-8-2-8"/>
  <circle cx="32" cy="22" r="1.5"/>
  <path d="M32 42l6-3M32 42l-6-3"/>`,

  'Black Cohosh': `  <path d="M32 58V14"/>
  <circle cx="32" cy="10" r="2"/>
  <circle cx="32" cy="14" r="1.5"/>
  <circle cx="30" cy="12" r="1"/>
  <circle cx="34" cy="12" r="1"/>
  <path d="M32 30l9-4c2-1 3-3 2-5M32 30l-9-4c-2-1-3-3-2-5"/>
  <path d="M32 40l7-3M32 40l-7-3"/>
  <path d="M32 50l5-2M32 50l-5-2"/>`,

  'Clary Sage': `  <path d="M32 58V20"/>
  <path d="M32 34c7 0 10-3 10-7s-5-6-10-5"/>
  <path d="M32 34c-7 0-10-3-10-7s5-6 10-5"/>
  <path d="M32 26c5 0 7-2 7-5s-3-4-7-3"/>
  <path d="M32 26c-5 0-7-2-7-5s3-4 7-3"/>
  <path d="M32 20l1-4M32 20l-1-4"/>
  <path d="M32 46l6-3M32 46l-6-3"/>`,

  'Horsetail': `  <path d="M32 58V10"/>
  <path d="M32 18l6-4M32 18l-6-4"/>
  <path d="M32 26l8-5M32 26l-8-5"/>
  <path d="M32 34l10-6M32 34l-10-6"/>
  <path d="M32 42l8-5M32 42l-8-5"/>
  <path d="M32 50l6-4M32 50l-6-4"/>
  <circle cx="32" cy="8" r="2"/>`,

  'Lotus': `  <path d="M32 58V36"/>
  <path d="M32 36c-6-2-10-8-8-12s8-4 8 0"/>
  <path d="M32 36c6-2 10-8 8-12s-8-4-8 0"/>
  <path d="M32 36c-8 0-14-6-12-10s10-2 12 2"/>
  <path d="M32 36c8 0 14-6 12-10s-10-2-12 2"/>
  <path d="M32 24c0-4-2-6 0-8"/>
  <path d="M20 42c4-2 8-4 12-6M44 42c-4-2-8-4-12-6"/>`,

  'Cinquefoil': `  <path d="M32 58V32"/>
  <path d="M32 24l0-10M32 24l9-3M32 24l-9-3M32 24l6 8M32 24l-6 8"/>
  <ellipse cx="32" cy="12" rx="3" ry="4" transform="rotate(0 32 12)"/>
  <ellipse cx="41" cy="21" rx="3" ry="4" transform="rotate(72 41 21)"/>
  <ellipse cx="23" cy="21" rx="3" ry="4" transform="rotate(-72 23 21)"/>
  <ellipse cx="38" cy="32" rx="3" ry="4" transform="rotate(144 38 32)"/>
  <ellipse cx="26" cy="32" rx="3" ry="4" transform="rotate(-144 26 32)"/>`,

  'Anise': `  <path d="M32 58V24"/>
  <path d="M32 24l-6-8M32 24l6-8M32 24l-10-4M32 24l10-4M32 24l0-12"/>
  <circle cx="26" cy="14" r="1.5"/>
  <circle cx="38" cy="14" r="1.5"/>
  <circle cx="22" cy="18" r="1.5"/>
  <circle cx="42" cy="18" r="1.5"/>
  <circle cx="32" cy="10" r="1.5"/>
  <path d="M32 38l6-3M32 38l-6-3"/>`,
}

// ─── CRYSTAL SVG GENERATORS ───
// Each generates a unique mineral/gem line drawing

const crystalDrawings: Record<string, string> = {
  'Amethyst': `  <path d="M32 8l12 20-12 20-12-20z"/>
  <path d="M32 8l4 14-4 6-4-6z"/>
  <path d="M20 28l12 20M44 28l-12 20"/>
  <path d="M24 18l8 10 8-10"/>`,

  'Clear Quartz': `  <path d="M26 12l6-4 6 4v28l-6 8-6-8z"/>
  <path d="M26 12v28M38 12v28"/>
  <path d="M32 8v40"/>
  <path d="M26 20h12M26 30h12"/>`,

  'Rose Quartz': `  <path d="M22 20l10-12 10 12v16l-10 12-10-12z"/>
  <path d="M22 20l10 8 10-8"/>
  <path d="M32 28v20"/>
  <path d="M26 24l6 4 6-4"/>`,

  'Citrine': `  <path d="M28 10l4-4 4 4 6 18-10 20-10-20z"/>
  <path d="M28 10l4 18 4-18"/>
  <path d="M22 28l10 20M42 28l-10 20"/>
  <path d="M26 22h12"/>`,

  'Black Tourmaline': `  <path d="M24 10h16v38l-8 6-8-6z"/>
  <path d="M24 10l8 6 8-6"/>
  <path d="M24 20h16M24 30h16M24 40h16"/>
  <path d="M32 16v38"/>`,

  'Labradorite': `  <path d="M18 22l14-14 14 14v12l-14 18-14-18z"/>
  <path d="M18 22l14 4 14-4"/>
  <path d="M22 30l10 22M42 30l-10 22"/>
  <path d="M24 18l8 8 8-8"/>`,

  'Moonstone': `  <ellipse cx="32" cy="32" rx="16" ry="20"/>
  <path d="M24 18c6 8 6 20 0 28"/>
  <path d="M32 12c-4 6-4 14 0 20s4 14 0 20"/>
  <path d="M20 32h24"/>`,

  'Obsidian': `  <path d="M32 6L48 32 32 58 16 32z"/>
  <path d="M32 6l0 52"/>
  <path d="M16 32h32"/>
  <path d="M24 19l8 13 8-13"/>
  <path d="M24 45l8-13 8 13"/>`,

  'Selenite': `  <path d="M26 6h12v52h-12z"/>
  <path d="M26 6l12 8M26 14l12 8M26 22l12 8"/>
  <path d="M26 30l12 8M26 38l12 8M26 46l12 8"/>
  <path d="M32 6v52"/>`,

  "Tiger's Eye": `  <ellipse cx="32" cy="32" rx="18" ry="12"/>
  <ellipse cx="32" cy="32" rx="10" ry="7"/>
  <ellipse cx="32" cy="32" rx="4" ry="3"/>
  <path d="M14 32h36"/>
  <path d="M22 24l10 8 10-8M22 40l10-8 10 8"/>`,

  'Lapis Lazuli': `  <path d="M20 16l12-8 12 8v24l-12 12-12-12z"/>
  <path d="M20 16l12 8 12-8"/>
  <path d="M32 24v28"/>
  <circle cx="28" cy="28" r="1.5"/>
  <circle cx="36" cy="22" r="1"/>
  <circle cx="24" cy="36" r="1"/>
  <circle cx="38" cy="34" r="1.5"/>`,

  'Malachite': `  <ellipse cx="32" cy="32" rx="18" ry="16"/>
  <ellipse cx="32" cy="32" rx="14" ry="12"/>
  <ellipse cx="32" cy="32" rx="10" ry="8"/>
  <ellipse cx="32" cy="32" rx="6" ry="4"/>
  <path d="M14 32h36"/>`,

  'Carnelian': `  <path d="M20 20c0-8 8-14 12-14s12 6 12 14v12c0 10-6 18-12 22-6-4-12-12-12-22z"/>
  <path d="M20 28h24"/>
  <path d="M24 20c4 4 12 4 16 0"/>
  <path d="M26 36c4 4 8 4 12 0"/>`,

  'Fluorite': `  <path d="M16 16h32v32h-32z"/>
  <path d="M16 16l16 16M48 16l-16 16"/>
  <path d="M16 48l16-16M48 48l-16-16"/>
  <path d="M32 16v32M16 32h32"/>`,

  'Jade': `  <path d="M18 26c0-10 6-16 14-16s14 6 14 16c0 12-8 24-14 28-6-4-14-16-14-28z"/>
  <path d="M24 20c4 4 12 4 16 0"/>
  <path d="M22 30c6 4 14 4 20 0"/>
  <path d="M26 40c4 4 8 4 12 0"/>`,

  'Garnet': `  <path d="M32 8l16 12-6 20H22l-6-20z"/>
  <path d="M32 8l0 32"/>
  <path d="M16 20l16 20M48 20l-16 20"/>
  <path d="M22 40h20"/>
  <path d="M20 20h24"/>`,

  'Smoky Quartz': `  <path d="M26 8l6-2 6 2v32l-6 12-6-12z"/>
  <path d="M26 8v32M38 8v32"/>
  <path d="M32 6v46"/>
  <path d="M26 16h12M26 24h12M26 32h12"/>`,

  'Aventurine': `  <path d="M20 18l12-10 12 10v20l-12 14-12-14z"/>
  <circle cx="28" cy="24" r="1"/>
  <circle cx="36" cy="20" r="1"/>
  <circle cx="32" cy="30" r="1"/>
  <circle cx="24" cy="28" r="1"/>
  <circle cx="38" cy="32" r="1"/>
  <circle cx="30" cy="36" r="1"/>
  <path d="M20 18l12 6 12-6"/>`,

  'Rhodonite': `  <path d="M16 24l16-16 16 16v8l-16 20-16-20z"/>
  <path d="M16 24l16 4 16-4"/>
  <path d="M32 28v24"/>
  <path d="M20 20l12 8 12-8"/>
  <path d="M24 36l8 16M40 36l-8 16"/>`,

  'Pyrite': `  <path d="M16 20h16v-8l16 12v16l-16 12v-8h-16v8l-16-12V20z"/>
  <path d="M16 20l16 12M48 24l-16 8"/>
  <path d="M32 12v20M16 28l16 4"/>`,

  'Amazonite': `  <path d="M20 14l12-6 12 6v28l-12 10-12-10z"/>
  <path d="M20 14l12 6 12-6"/>
  <path d="M32 20v32"/>
  <path d="M20 24h24M20 34h24"/>`,

  'Sodalite': `  <path d="M18 18l14-10 14 10v18l-14 14-14-14z"/>
  <path d="M18 18l14 6 14-6"/>
  <path d="M32 24v26"/>
  <path d="M32 8l-14 10v18l14 14 14-14V18z" stroke-dasharray="3 3"/>`,

  'Turquoise': `  <ellipse cx="32" cy="30" rx="18" ry="14"/>
  <path d="M18 24c8 4 20 4 28 0"/>
  <path d="M18 36c8-4 20-4 28 0"/>
  <path d="M32 16v28"/>
  <path d="M24 20l8 10 8-10"/>`,

  'Hematite': `  <ellipse cx="32" cy="32" rx="16" ry="20"/>
  <path d="M16 32h32"/>
  <path d="M20 22h24M20 42h24"/>
  <path d="M32 12v40"/>`,

  'Bloodstone': `  <ellipse cx="32" cy="32" rx="16" ry="18"/>
  <circle cx="26" cy="26" r="2"/>
  <circle cx="38" cy="30" r="1.5"/>
  <circle cx="30" cy="38" r="2.5"/>
  <circle cx="36" cy="22" r="1"/>
  <circle cx="24" cy="34" r="1.5"/>`,

  'Celestite': `  <path d="M22 42l-4-16 8-14h12l8 14-4 16z"/>
  <path d="M18 26l8 4M46 26l-8 4"/>
  <path d="M26 12l6 18 6-18"/>
  <path d="M22 42l10-12 10 12"/>
  <path d="M26 30h12"/>`,

  'Chrysocolla': `  <path d="M16 28c0-12 8-20 16-20s16 8 16 20-8 24-16 28c-8-4-16-16-16-28z"/>
  <path d="M20 24c4 4 8 6 12 6s8-2 12-6"/>
  <path d="M22 34c4 4 8 5 10 5s6-1 10-5"/>
  <circle cx="32" cy="20" r="3"/>`,

  'Kunzite': `  <path d="M26 8l6-2 6 2 4 16-10 24-10-24z"/>
  <path d="M26 8l6 16 6-16"/>
  <path d="M22 24l10 24M42 24l-10 24"/>
  <path d="M28 16h8"/>`,

  'Lepidolite': `  <path d="M18 20h28l-4 28H22z"/>
  <path d="M18 20l4 28M46 20l-4 28"/>
  <path d="M20 28h24M22 36h20"/>
  <path d="M32 20v28"/>`,

  'Black Onyx': `  <path d="M20 16l12-8 12 8v24l-12 12-12-12z"/>
  <path d="M20 16l12 8 12-8"/>
  <path d="M32 24v28"/>
  <path d="M20 28l12 12 12-12"/>`,

  'Aquamarine': `  <path d="M26 6h12l6 12v20l-6 12H26l-6-12V18z"/>
  <path d="M20 18l12 8 12-8"/>
  <path d="M20 38l12-8 12 8"/>
  <path d="M32 6v44"/>`,

  'Prehnite': `  <ellipse cx="32" cy="28" rx="14" ry="12"/>
  <ellipse cx="32" cy="32" rx="14" ry="12"/>
  <path d="M18 28c0 4 6 8 14 8s14-4 14-8"/>
  <path d="M24 24c4 4 12 4 16 0"/>`,

  'Unakite': `  <ellipse cx="32" cy="32" rx="18" ry="16"/>
  <path d="M14 32c6-6 12-6 18 0s12 6 18 0"/>
  <path d="M20 22c4 4 8 4 12 0s8-4 12 0"/>
  <path d="M20 42c4-4 8-4 12 0s8 4 12 0"/>`,

  'Howlite': `  <ellipse cx="32" cy="32" rx="18" ry="16"/>
  <path d="M20 24c8 4 16 4 24 0" stroke-dasharray="3 2"/>
  <path d="M18 32c10 4 18 4 28 0" stroke-dasharray="3 2"/>
  <path d="M20 40c8 4 16 4 24 0" stroke-dasharray="3 2"/>
  <path d="M32 16v32" stroke-dasharray="3 2"/>`,

  'Kyanite': `  <path d="M28 4l4 0 4 12-4 36-4-36z"/>
  <path d="M24 16l8 4 8-4"/>
  <path d="M22 28l10 4 10-4"/>
  <path d="M24 40l8 4 8-4"/>
  <path d="M32 4v52"/>`,

  'Iolite': `  <path d="M32 8l14 12-4 20-10 12-10-12-4-20z"/>
  <path d="M18 20l14 8 14-8"/>
  <path d="M32 28v24"/>
  <path d="M22 40l10 12 10-12"/>`,

  'Sunstone': `  <circle cx="32" cy="32" r="16"/>
  <path d="M32 10v6M32 48v6"/>
  <path d="M10 32h6M48 32h6"/>
  <path d="M16.5 16.5l4 4M43.5 43.5l4 4"/>
  <path d="M47.5 16.5l-4 4M20.5 43.5l-4 4"/>
  <circle cx="32" cy="32" r="8"/>`,

  'Moldavite': `  <path d="M32 6c-10 4-16 16-14 28s10 20 14 24c4-4 12-12 14-24s-4-24-14-28z"/>
  <path d="M22 22c6 4 14 4 20 0"/>
  <path d="M20 34c8 4 16 4 24 0"/>
  <path d="M32 6v52"/>`,

  'Agate': `  <ellipse cx="32" cy="32" rx="18" ry="20"/>
  <ellipse cx="32" cy="32" rx="14" ry="16"/>
  <ellipse cx="32" cy="32" rx="10" ry="12"/>
  <ellipse cx="32" cy="32" rx="6" ry="8"/>
  <ellipse cx="32" cy="32" rx="2" ry="3"/>`,

  'Amber': `  <path d="M20 24c0-8 6-14 12-14s12 6 12 14c0 10-4 20-12 28-8-8-12-18-12-28z"/>
  <path d="M24 20c4 2 12 2 16 0"/>
  <path d="M22 30c6 4 14 4 20 0"/>
  <ellipse cx="30" cy="26" rx="2" ry="1.5"/>`,

  'Charoite': `  <path d="M18 18l14-10 14 10v20l-14 14-14-14z"/>
  <path d="M18 18c8 6 20 6 28 0"/>
  <path d="M18 30c8 4 20 4 28 0"/>
  <path d="M22 40c6 4 14 4 20 0"/>
  <path d="M32 8v44"/>`,

  'Tanzanite': `  <path d="M32 6l10 14-4 22-6 10-6-10-4-22z"/>
  <path d="M22 20l10 8 10-8"/>
  <path d="M32 28v24"/>
  <path d="M26 42l6 10 6-10"/>
  <path d="M24 30h16"/>`,

  'Opal': `  <ellipse cx="32" cy="30" rx="18" ry="16"/>
  <circle cx="26" cy="26" r="3" opacity="0.5"/>
  <circle cx="38" cy="28" r="4" opacity="0.5"/>
  <circle cx="30" cy="36" r="3.5" opacity="0.5"/>
  <circle cx="34" cy="22" r="2" opacity="0.5"/>`,

  'Peridot': `  <path d="M32 8l10 16-6 22-4 8-4-8-6-22z"/>
  <path d="M22 24l10 6 10-6"/>
  <path d="M32 30v22"/>
  <path d="M26 24l6-16 6 16"/>`,

  'Spirit Quartz': `  <path d="M28 8l4-2 4 2v36l-4 8-4-8z"/>
  <path d="M24 14l4-2M40 14l-4-2"/>
  <path d="M22 20l6-2M42 20l-6-2"/>
  <path d="M20 26l8-2M44 26l-8-2"/>
  <path d="M22 32l6-2M42 32l-6-2"/>
  <path d="M24 38l4-2M40 38l-4-2"/>`,

  'Red Jasper': `  <ellipse cx="32" cy="32" rx="16" ry="18"/>
  <path d="M20 24c8 4 16 4 24 0"/>
  <path d="M18 34c10 4 18 4 28 0"/>
  <path d="M22 42c6 4 14 4 20 0"/>
  <path d="M32 14v36"/>`,

  'Larimar': `  <path d="M18 24c0-10 8-16 14-16s14 6 14 16c0 12-6 22-14 28-8-6-14-16-14-28z"/>
  <path d="M22 22c4 2 8 4 12 4s8-2 12-4" stroke-dasharray="2 2"/>
  <path d="M20 32c6 4 14 4 24 0" stroke-dasharray="2 2"/>
  <path d="M24 40c4 4 12 4 16 0" stroke-dasharray="2 2"/>`,

  'Rhodochrosite': `  <ellipse cx="32" cy="32" rx="16" ry="18"/>
  <ellipse cx="32" cy="32" rx="12" ry="14"/>
  <ellipse cx="32" cy="32" rx="8" ry="10"/>
  <ellipse cx="32" cy="32" rx="4" ry="6"/>
  <path d="M32 14l0 36"/>`,

  'Shungite': `  <path d="M20 14l12-6 12 6v28l-12 10-12-10z"/>
  <path d="M20 14l12 8 12-8"/>
  <path d="M32 22v30"/>
  <path d="M20 14v28l12 10 12-10V14"/>`,

  'Apophyllite': `  <path d="M20 20l12-12 12 12v16l-12 16-12-16z"/>
  <path d="M20 20l12 4 12-4"/>
  <path d="M20 36l12-12 12 12"/>
  <path d="M32 8v44"/>`,

  'Aragonite': `  <path d="M32 6v52"/>
  <path d="M32 20l-14 12 14 12 14-12z"/>
  <path d="M18 32l14 4 14-4"/>
  <path d="M24 14l8 6 8-6M24 50l8-6 8 6"/>`,

  'Azurite': `  <circle cx="32" cy="28" r="12"/>
  <circle cx="24" cy="38" r="8"/>
  <circle cx="40" cy="38" r="8"/>
  <path d="M32 16v24M20 28h24"/>`,

  'Dalmatian Jasper': `  <ellipse cx="32" cy="32" rx="18" ry="18"/>
  <circle cx="24" cy="24" r="2"/>
  <circle cx="38" cy="20" r="1.5"/>
  <circle cx="22" cy="36" r="1.5"/>
  <circle cx="40" cy="34" r="2"/>
  <circle cx="32" cy="42" r="1.5"/>
  <circle cx="28" cy="30" r="1"/>
  <circle cx="36" cy="28" r="1"/>`,

  'Green Calcite': `  <path d="M20 18l12-8 12 8v20l-12 12-12-12z"/>
  <path d="M20 18l12 6 12-6"/>
  <path d="M32 24v26"/>
  <path d="M20 30l12 6 12-6"/>
  <path d="M20 38l12-8 12 8"/>`,

  'Septarian': `  <ellipse cx="32" cy="32" rx="18" ry="18"/>
  <path d="M32 14l-8 18 8 18"/>
  <path d="M32 14l8 18-8 18"/>
  <path d="M16 28l16 4 16-4"/>
  <path d="M18 38l14-6 14 6"/>`,

  'Ocean Jasper': `  <ellipse cx="32" cy="32" rx="18" ry="18"/>
  <circle cx="26" cy="26" r="4"/>
  <circle cx="38" cy="24" r="3"/>
  <circle cx="32" cy="38" r="5"/>
  <circle cx="22" cy="36" r="2.5"/>
  <circle cx="42" cy="36" r="2"/>`,

  'Chrysoprase': `  <path d="M20 20c0-8 6-14 12-14s12 6 12 14v16c0 8-6 14-12 14s-12-6-12-14z"/>
  <path d="M24 18c4 2 12 2 16 0"/>
  <path d="M22 28c6 4 14 4 20 0"/>
  <path d="M24 38c4 2 12 2 16 0"/>`,

  'Moss Agate': `  <ellipse cx="32" cy="32" rx="18" ry="18"/>
  <path d="M28 44V28l-4-8M36 44V28l4-8"/>
  <path d="M24 20l4 8-4 4M40 20l-4 8 4 4"/>
  <path d="M32 44V24l0-8"/>
  <path d="M28 28l4-4 4 4"/>`,

  'Tourmalinated Quartz': `  <path d="M26 8l6-2 6 2v36l-6 8-6-8z"/>
  <line x1="28" y1="12" x2="34" y2="40"/>
  <line x1="30" y1="10" x2="36" y2="38"/>
  <line x1="34" y1="14" x2="28" y2="42"/>
  <line x1="36" y1="12" x2="30" y2="36"/>`,

  'Lemon Quartz': `  <path d="M26 10l6-4 6 4v28l-6 10-6-10z"/>
  <path d="M26 10v28M38 10v28"/>
  <path d="M32 6v42"/>
  <path d="M26 18h12M26 26h12M26 34h12"/>`,

  'Apache Tear': `  <path d="M32 10c-8 0-14 8-14 18s6 20 14 24c8-4 14-14 14-24s-6-18-14-18z"/>
  <path d="M22 24c6 4 14 4 20 0"/>
  <path d="M20 34c8 4 16 4 24 0"/>`,

  'Angelite': `  <path d="M20 18l12-10 12 10v20l-12 14-12-14z"/>
  <path d="M20 18l12 6 12-6"/>
  <path d="M32 24v28"/>
  <path d="M24 26l8 6 8-6"/>
  <path d="M22 38l10 14 10-14"/>`,

  'Serpentine': `  <path d="M20 16c4-4 8-6 12-6s8 2 12 6v28c-4 4-8 6-12 6s-8-2-12-6z"/>
  <path d="M20 24c8 4 16 4 24 0"/>
  <path d="M20 32c8-4 16-4 24 0"/>
  <path d="M20 40c8 4 16 4 24 0"/>`,

  'Danburite': `  <path d="M28 6l4-2 4 2 6 14-10 24-10-24z"/>
  <path d="M28 6l4 16 4-16"/>
  <path d="M18 20l14 24M46 20l-14 24"/>
  <path d="M24 14h16"/>`,

  'Fire Agate': `  <ellipse cx="32" cy="32" rx="16" ry="18"/>
  <path d="M20 28c4 4 8 6 12 6s8-2 12-6"/>
  <path d="M22 36c4 4 8 5 10 5s6-1 10-5"/>
  <path d="M24 22c4 2 12 2 16 0"/>
  <circle cx="32" cy="28" r="4"/>`,
}

// ─── MAIN ───

function main() {
  const herbsDir = path.join(process.cwd(), 'public', 'herbs')
  const crystalsDir = path.join(process.cwd(), 'public', 'crystals')

  // Read herb names from data
  const herbsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'herbology.json'), 'utf-8'))
  const crystalsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'crystals.json'), 'utf-8'))

  let herbCount = 0
  for (const herb of herbsData) {
    const slug = slugify(herb.name)
    const drawing = herbDrawings[herb.name]
    if (!drawing) {
      // Generate a generic botanical drawing for any missing herbs
      const svg = svgWrap(genericHerbSvg(herb.name))
      fs.writeFileSync(path.join(herbsDir, `${slug}.svg`), svg)
    } else {
      fs.writeFileSync(path.join(herbsDir, `${slug}.svg`), svgWrap(drawing))
    }
    herbCount++
  }

  let crystalCount = 0
  for (const crystal of crystalsData) {
    const slug = slugify(crystal.name)
    const drawing = crystalDrawings[crystal.name]
    if (!drawing) {
      const svg = svgWrap(genericCrystalSvg(crystal.name))
      fs.writeFileSync(path.join(crystalsDir, `${slug}.svg`), svg)
    } else {
      fs.writeFileSync(path.join(crystalsDir, `${slug}.svg`), svgWrap(drawing))
    }
    crystalCount++
  }

  console.log(`Generated ${herbCount} herb SVGs and ${crystalCount} crystal SVGs.`)
}

function genericHerbSvg(name: string): string {
  // Deterministic variation based on name
  const seed = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const leafSpread = 6 + (seed % 5)
  const leafCount = 3 + (seed % 3)
  const stemHeight = 38 + (seed % 8)

  const lines: string[] = []
  lines.push(`  <path d="M32 58V${58 - stemHeight}"/>`)

  for (let i = 0; i < leafCount; i++) {
    const y = 58 - stemHeight + 8 + i * Math.floor((stemHeight - 16) / leafCount)
    const spread = leafSpread + (i % 2)
    lines.push(`  <path d="M32 ${y}l${spread}-${3 + (i % 2)}M32 ${y}l-${spread}-${3 + (i % 2)}"/>`)
  }

  return lines.join('\n')
}

function genericCrystalSvg(name: string): string {
  const seed = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const type = seed % 4

  switch (type) {
    case 0:
      return `  <path d="M32 8l14 16-8 24-6 8-6-8-8-24z"/>
  <path d="M18 24l14 8 14-8"/>
  <path d="M32 32v24"/>`
    case 1:
      return `  <path d="M22 12l10-4 10 4v28l-10 12-10-12z"/>
  <path d="M22 12l10 6 10-6"/>
  <path d="M32 18v34"/>`
    case 2:
      return `  <ellipse cx="32" cy="32" rx="16" ry="20"/>
  <path d="M20 22c8 4 16 4 24 0"/>
  <path d="M18 34c10 4 18 4 28 0"/>
  <path d="M32 12v40"/>`
    default:
      return `  <path d="M20 16h24v28l-12 10-12-10z"/>
  <path d="M20 16l12 8 12-8"/>
  <path d="M20 30h24"/>
  <path d="M32 24v30"/>`
  }
}

main()
