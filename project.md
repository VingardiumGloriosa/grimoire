# Grimoire — Project Status

## Overview
Grimoire is an esoteric toolkit and personal divination companion. Users log physical tarot readings digitally, explore herbs, crystals, astrology, dreams, moon phases, and numerology — all from local data with no external AI calls.

## Modules

| Module | Status | Notes |
|--------|--------|-------|
| Tarot | Implemented | Card library, reading flow, spread builder, journal, synthesis engine |
| Astrology | Implemented | Birth charts, placements, aspects, interpretation, horoscopes |
| Herbology | Implemented | Herb library, detail views, blend builder |
| Crystals | Implemented | Crystal library, detail views, collection tracking, intention pairing |
| Dream Journal | Implemented | Entry form, journal list, symbol library, pattern dashboard |
| Moon Phases | Implemented | Calendar, today's phase, rituals, moon journal |
| Numerology | Implemented | Calculator, number meanings, profile views |

## Infrastructure
- **Auth**: Supabase magic link (no passwords)
- **Database**: Supabase (PostgreSQL) with RLS
- **Admin**: Password-gated dashboard for managing Supabase tables
- **Styling**: Tailwind CSS + shadcn/ui, earthy/witchy design system
- **Deployment**: Vercel (auto-deploy from master)
