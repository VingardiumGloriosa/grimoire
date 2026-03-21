# Grimoire — Style Guide

## Design Philosophy

Grimoire is a **dark, ceremonial grimoire** — the visual language of a midnight conservatory. Carved stone, tarnished gold, deep wine, and the near-black green of a poisoned garden. It is dramatic and intimate, not cozy or pastoral.

Every design decision should ask: *does this feel like it was etched into stone by candlelight?*

---

## Typography

### Fonts

| Role | Font | Tailwind Class | Source |
|---|---|---|---|
| Wordmark | **Cinzel Decorative** | `font-wordmark` | Google Fonts |
| Display / Headings | **Cinzel** | `font-display` | Google Fonts |
| Body / UI | **Cormorant Garamond** | `font-body` | Google Fonts |

```
Cinzel Decorative: weights 400, 700
Cinzel: weights 400, 500, 600, 700
Cormorant Garamond: weights 400, 500, 600, 700 + italics
```

**Cinzel Decorative** is reserved exclusively for the "Grimoire" wordmark — in the Navbar and the dashboard hero. Nowhere else.

**Cinzel** is used for h1, h2, section headings, spread names, and card names. It feels carved in stone — ceremonial and deliberate.

**Cormorant Garamond** carries everything else — body text, h3, UI labels, navigation, descriptions. Elegant and readable with generous contrast against the dark palette.

---

### Type Scale

| Token | Font | Size | Weight | Line Height | Usage |
|---|---|---|---|---|---|
| `wordmark` | Cinzel Decorative | 3rem (48px) | Regular | 1.1 | "Grimoire" wordmark only |
| `h1` | Cinzel | 2.25rem (36px) | Regular | 1.2 | Page titles |
| `h2` | Cinzel | 1.75rem (28px) | Regular | 1.3 | Section headings |
| `h3` | Cormorant Garamond | 1.25rem (20px) | 600 | 1.4 | Card names, subsections |
| `body-lg` | Cormorant Garamond | 1.125rem (18px) | 400 | 1.7 | Synthesis text, reading narrative |
| `body` | Cormorant Garamond | 1rem (16px) | 400 | 1.6 | General UI, descriptions |
| `body-sm` | Cormorant Garamond | 0.875rem (14px) | 400 | 1.5 | Captions, metadata, timestamps |
| `label` | Cormorant Garamond | 0.75rem (12px) | 500 | 1.4 | Form labels, tags, chips |
| `italic` | Cormorant Garamond Italic | inherit | 400 | inherit | Intentions, quotations, card meanings |

**Notes:**
- Card meanings and the synthesis narrative are always set in `body-lg` Cormorant Garamond, italic for the opening line
- Spread position labels use `h3`
- Keywords / tags use `label` in uppercase with tracked letter-spacing (`0.08em`)

---

## Colour Palette

### Light Mode (Default)

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-bg` | Aged Ivory | `#F2EDE4` | Page background |
| `--color-bg-edge` | Ivory Shadow | `#E6E0D5` | Vignette edge |
| `--color-surface` | Warm White | `#FAF6F0` | Cards, panels, modals |
| `--color-surface-raised` | Linen | `#EDE7DD` | Hover states, subtle elevation |
| `--color-border` | Dust | `#D4CCC0` | Borders, dividers |
| `--color-text` | Near-Black | `#1C1C1A` | Primary text |
| `--color-text-muted` | Warm Grey | `#6E675D` | Secondary text, metadata |
| `--color-text-faint` | Sand | `#A8A094` | Placeholder, disabled |
| `--color-primary` | Near-Black Forest | `#1A2F25` | Primary actions, links, active states |
| `--color-primary-hover` | Deep Forest | `#142620` | Button hover |
| `--color-primary-subtle` | Misted Sage | `#E4EBE7` | Tinted backgrounds, tag fills |
| `--color-secondary` | Sage | `#5C8A6B` | Secondary accents, icons |
| `--color-accent` | Tarnished Gold | `#B8963E` | Highlights, dividers, star motifs |
| `--color-accent-subtle` | Warm Ochre | `#F0E4C8` | Alert backgrounds, callouts |
| `--color-blush` | Deep Wine | `#5C1A2A` | Reversed card indicators |
| `--color-brown` | Warm Umber | `#8B6347` | Decorative elements, earth tones |

### Dark Mode

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-bg` | Charred | `#141210` | Page background |
| `--color-bg-edge` | Void | `#0E0D0B` | Vignette edge |
| `--color-surface` | Dark Bark | `#1E1C19` | Cards, panels |
| `--color-surface-raised` | Warm Dark | `#28251F` | Hover states |
| `--color-border` | Moss Shadow | `#36322C` | Borders, dividers |
| `--color-text` | Parchment | `#EDE7DD` | Primary text |
| `--color-text-muted` | Warm Mist | `#9A9185` | Secondary text |
| `--color-text-faint` | Dark Sand | `#585149` | Placeholder, disabled |
| `--color-primary` | Sage | `#5C8A6B` | Primary actions |
| `--color-primary-hover` | Soft Sage | `#6E9B7D` | Button hover |
| `--color-primary-subtle` | Forest Shadow | `#1A2D20` | Tinted backgrounds |
| `--color-secondary` | Muted Sage | `#4A7A58` | Secondary accents |
| `--color-accent` | Aged Gold | `#C4A35A` | Highlights (same as light) |
| `--color-accent-subtle` | Dark Ochre | `#2A2318` | Callout backgrounds |
| `--color-blush` | Wine Glow | `#8B3A4F` | Reversed card indicators |
| `--color-brown` | Pale Umber | `#A07858` | Decorative elements |

### Colour Usage Rules

- **Never use pure black (`#000`) or pure white (`#FFF`)** — always use the palette tokens
- Tarnished Gold (`--color-accent`) is used sparingly — decorative dividers, the app wordmark underline, star/moon motifs, and active tab indicators only
- Deep Wine is reserved for reversed card orientation indicators — do not use for general UI
- Near-Black Forest is the only interactive colour — all links, buttons, and focus states use it

---

## Spacing & Layout

### Spacing Scale

Uses a base-4 scale:

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Icon padding, tight gaps |
| `--space-2` | 8px | Inner component padding |
| `--space-3` | 12px | Small gaps |
| `--space-4` | 16px | Default padding, gaps |
| `--space-5` | 20px | Medium spacing |
| `--space-6` | 24px | Section inner padding |
| `--space-8` | 32px | Component separation |
| `--space-10` | 40px | Section gaps |
| `--space-12` | 48px | Large section breaks |
| `--space-16` | 64px | Page-level spacing |
| `--space-24` | 96px | Hero spacing |

### Layout Grid

- **Max content width:** `1100px`
- **Page horizontal padding:** `--space-6` (24px) on mobile, `--space-10` (40px) on desktop
- **Column grid:** 12 columns, `--space-6` (24px) gap
- **Reading view:** single column, max `720px`, centred — synthesis text needs room to breathe
- **Card library:** responsive grid, `minmax(200px, 1fr)`
- **Journal list:** single column, max `800px`

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 4px | Tags, chips, badges |
| `--radius-md` | 8px | Inputs, small cards |
| `--radius-lg` | 12px | Cards, panels |
| `--radius-xl` | 16px | Modals, drawers |
| `--radius-full` | 9999px | Pills, avatars |

---

## Component Specifications

### Buttons

**Primary Button**
```
Background: --color-primary (Forest Green)
Text: --color-bg (Parchment)
Font: Lora, 0.9375rem, weight 500
Padding: 10px 20px
Border radius: --radius-md (8px)
Hover: --color-primary-hover, slight lift (translateY(-1px))
Active: translateY(0), slightly darker
Transition: all 150ms ease
No box shadow by default — flat, grounded
```

**Secondary Button**
```
Background: transparent
Border: 1.5px solid --color-border
Text: --color-text
Hover: background --color-surface-raised
Same sizing and radius as primary
```

**Ghost Button**
```
Background: transparent
Border: none
Text: --color-primary
Hover: background --color-primary-subtle
Used for: inline actions, "view all" links
```

**Destructive Button**
```
Background: transparent
Border: 1.5px solid --color-blush
Text: --color-blush darkened 20%
Hover: background blush at 10% opacity
Used for: delete actions only
```

---

### Cards

Cards are the primary surface unit of Grimoire.

```
Background: --color-surface
Border: 1px solid --color-border
Border radius: --radius-lg (12px)
Padding: --space-6 (24px)
No default shadow — use border for elevation
Hover (interactive cards): border-color --color-secondary, subtle translateY(-2px)
Transition: all 200ms ease
```

**Reading Card** (journal entry preview)
```
Same base as card
Left border accent: 3px solid --color-accent (Aged Gold)
Spread name in h3, date in body-sm muted
First line of synthesis in italic body-sm, truncated to 2 lines
Mood tag in bottom-left, date in bottom-right
```

**Tarot Card Tile** (card library grid)
```
Aspect ratio: 2/3 (portrait)
Image area: top 65% of card
Info area: bottom 35%, padding --space-4
Card name: h3
Keywords: label chips below name
Upright/reversed toggle on hover
Border: 1px solid --color-border
Hover: border --color-accent, soft glow (box-shadow: 0 0 12px rgba(184, 150, 62, 0.2))
```

---

### Inputs & Form Elements

**Text Input**
```
Background: --color-surface
Border: 1.5px solid --color-border
Border radius: --radius-md (8px)
Padding: 10px 14px
Font: Lora, body size
Focus: border-color --color-primary, outline none
Placeholder: --color-text-faint, italic
Transition: border-color 150ms ease
```

**Textarea**
```
Same as text input
Min height: 100px
Resize: vertical only
Used for: intentions, reading notes
```

**Search Input**
```
Same as text input
Left icon: small search/herb icon in --color-text-faint
Used in: card library, journal search
```

**Select / Dropdown**
```
Same base as text input
Custom chevron icon in --color-text-muted
Uses shadcn/ui Select primitive
```

---

### Tags & Badges

**Thematic Tag** (love, career, shadow work…)
```
Background: --color-primary-subtle
Text: --color-primary, label size, uppercase, letter-spacing 0.08em
Border radius: --radius-sm (4px)
Padding: 3px 8px
No border
```

**Keyword Chip** (card keywords)
```
Background: --color-accent-subtle
Text: --color-brown, label size
Border radius: --radius-sm (4px)
Padding: 3px 8px
```

**Orientation Badge** (upright / reversed)
```
Upright:
  Background: --color-primary-subtle
  Text: --color-primary
Reversed:
  Background: blush at 15% opacity
  Text: --color-blush darkened 15%
Border radius: --radius-full
Padding: 2px 10px
Font: label, uppercase
```

**Module Badge** (tarot / herbology / etc.)
```
Border: 1px solid --color-accent
Text: --color-accent, label size, uppercase
Background: transparent
Border radius: --radius-full
Padding: 2px 10px
```

---

## Iconography

Use **Lucide React** as the icon set — clean, consistent line weight, and easy to theme.

### Usage Rules

- Icon size: `16px` for inline/UI, `20px` for standalone actions, `24px` for empty states
- Stroke width: `1.5px` — thinner than default feels more refined
- Colour: always inherits from parent text colour — never hardcoded
- Never use filled icons — outline only
- Icons never appear alone — always paired with a label or tooltip

### Key Icons by Context

| Context | Icon |
|---|---|
| New reading | `Sparkles` |
| Journal | `BookOpen` |
| Card library | `Library` |
| Spread builder | `LayoutGrid` |
| Admin | `Settings` |
| Upright | `ArrowUp` |
| Reversed | `ArrowDown` |
| Save / journal entry | `BookMarked` |
| Edit notes | `Pencil` |
| Search | `Search` |
| Moon phases | `Moon` |
| Herbs | `Leaf` |
| Crystals | `Gem` |
| Astrology | `Star` |
| Delete | `Trash2` |
| Close | `X` |
| Magic link sent | `Mail` |

### Decorative Motifs

Botanical and celestial SVG motifs are used as decorative elements — never interactive. Sources: hand-drawn line art, public domain botanical illustration outlines.

- Thin-line herbs, leaves, and flowers as section dividers
- Small star/moon glyphs as list markers or accent details
- Used in: empty states, page headers, loading states, the app wordmark area
- Colour: `--color-accent` (Aged Gold) or `--color-border` at reduced opacity
- Never overused — one motif per section maximum

---

## Tailwind Config

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        parchment: '#F2EDE4',
        linen: '#EDE7DD',
        dust: '#D4CCC0',
        charcoal: '#1C1C1A',
        forest: '#1A2F25',
        'forest-deep': '#142620',
        sage: '#5C8A6B',
        'sage-mist': '#E4EBE7',
        gold: '#B8963E',
        'gold-subtle': '#F0E4C8',
        blush: '#7A2E3F',
        umber: '#8B6347',
        'warm-grey': '#6E675D',
        'deep-earth': '#141210',
      },
      fontFamily: {
        wordmark: ['Cinzel Decorative', 'Georgia', 'serif'],
        display: ['Cinzel', 'Georgia', 'serif'],
        body: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
}
```

---

## Voice & Writing Style

The app's written content — synthesis templates, empty states, tooltips, onboarding — should match the visual tone.

- **Warm but not saccharine.** The cards say difficult things sometimes. Don't soften everything.
- **Present tense, second person.** "The High Priestess appears in the position of…" not "The High Priestess appeared…"
- **Unhurried.** No exclamation marks in synthesis or card meanings. Save them for nowhere.
- **Italicise intentions and quotations.** When a user's intention appears in the reading view, always italic.
- **Empty states are gentle invitations**, not instructions. "Your journal is waiting." not "No readings yet. Click here to start."

---

## Do / Don't

| Do | Don't |
|---|---|
| Use Cinzel Decorative only for the "Grimoire" wordmark | Use Cinzel Decorative for anything besides the wordmark |
| Use Cinzel for h1/h2 headings | Use Cinzel for body copy or UI labels |
| Use Tarnished Gold sparingly, as accent | Use Gold as a background or fill colour |
| Use Near-Black Forest for all interactive elements | Mix in blue or purple for links |
| Let synthesis text breathe with generous line height | Compress reading narratives into tight layouts |
| Use botanical motifs as quiet decoration | Overload pages with decorative elements |
| Write empty states as invitations | Write empty states as error messages |
| Keep reversed card indicators in Deep Wine | Use red for anything in this app |
| Keep dark mode warm — charred earth tones | Use cold greys or blue-blacks in dark mode |
