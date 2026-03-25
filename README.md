# Grimoire

A personal divination companion and esoteric toolkit. Tarot readings, herbology, astrology, crystals, numerology, moon phase tracking, and dream journaling — all in one place.

Built with intention. No AI-generated interpretations — all readings are assembled from curated data and editable templates.

## Modules

| Module         | Description                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------- |
| **Tarot**      | Log physical card readings, select cards and positions, receive structured synthesis from templates |
| **Herbology**  | Browse herbs by element and properties, create custom blends                                        |
| **Astrology**  | Birth charts with geocoding, planetary placements, aspect interpretations                           |
| **Crystals**   | Crystal properties, chakra associations, personal collection tracking                               |
| **Numerology** | Life path, expression, soul urge calculations from name and birth date                              |
| **Moon**       | Real-time moon phase, lunar calendar, phase-based rituals and journal                               |
| **Dreams**     | Dream journal with symbol library, pattern recognition, mood tracking                               |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS + CSS custom properties design system
- **Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL + RLS)
- **Auth**: Supabase magic link (no passwords)
- **Deployment**: Vercel

## Design

Dark ceremonial grimoire aesthetic. Carved stone, tarnished gold, deep wine, and the near-black green of a poisoned garden.

- **Typography**: Cinzel Decorative (wordmark), Cinzel (headings), Cormorant Garamond (body)
- **Palette**: Charcoal, Forest, Sage, Tarnished Gold, Blush, Parchment
- **Decorations**: Animated SVG ivy vines frame the viewport on desktop; subtle leaf clusters on mobile
- **Theme**: Light and dark modes with full CSS variable system

See [STYLE.md](STYLE.md) for the complete design system.

## Project Structure

```
app/           → Pages and API routes (Next.js App Router)
components/    → UI components (shadcn/ui primitives in components/ui/)
lib/           → Supabase clients, types, synthesis engine, utilities
data/          → Static JSON data (tarot cards, herbs, crystals, etc.)
public/cards/  → 78 Rider-Waite card images
supabase/      → Database schema and migrations
scripts/       → Data seeding scripts
```

## License

Private project. All rights reserved.
