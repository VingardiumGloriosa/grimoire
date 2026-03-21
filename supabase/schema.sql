-- ============================================================
-- Grimoire — Full Database Schema
-- Run this in the Supabase SQL Editor to set up all tables.
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── Modules Registry ───────────────────────────────────────

create table if not exists modules (
  id          uuid primary key default uuid_generate_v4(),
  key         text unique not null,
  name        text not null,
  description text,
  enabled     boolean default false,
  icon        text,
  created_at  timestamptz default now()
);

-- Ensure columns exist if table was created by an older schema version
alter table modules add column if not exists enabled boolean default false;
alter table modules add column if not exists icon text;

-- ─── Tarot Cards ─────────────────────────────────────────────

create table if not exists tarot_cards (
  id                uuid primary key default uuid_generate_v4(),
  name              text unique not null,
  number            text not null,
  arcana            text not null,
  suit              text not null,
  image_path        text not null,
  fortune_telling   jsonb not null default '[]'::jsonb,
  keywords          jsonb not null default '[]'::jsonb,
  meanings          jsonb not null default '{"light":[],"shadow":[]}'::jsonb,
  archetype         text,
  hebrew_alphabet   text,
  numerology        text,
  elemental         text,
  mythical_spiritual text,
  questions_to_ask  jsonb not null default '[]'::jsonb,
  created_at        timestamptz default now()
);

-- ─── Spread Templates ───────────────────────────────────────

create table if not exists tarot_spread_templates (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade,
  name        text unique not null,
  description text,
  positions   jsonb not null default '[]'::jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── Readings ────────────────────────────────────────────────

create table if not exists tarot_readings (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  spread_name      text not null,
  spread_positions jsonb not null default '[]'::jsonb,
  cards            jsonb not null default '[]'::jsonb,
  intention        text,
  date             date not null default current_date,
  mood             text,
  visibility       text not null default 'private'
                   check (visibility in ('private', 'public')),
  synthesis        text,
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ─── Synthesis Templates ─────────────────────────────────────

create table if not exists tarot_synthesis_templates (
  id          uuid primary key default uuid_generate_v4(),
  role        text unique not null,
  template    text not null,
  description text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── Numerology ─────────────────────────────────────────────

create table if not exists numerology_interpretations (
  id                 uuid primary key default uuid_generate_v4(),
  number             integer not null,
  category           text not null,
  title              text not null,
  description        text not null,
  keywords           jsonb not null default '[]'::jsonb,
  strengths          jsonb not null default '[]'::jsonb,
  challenges         jsonb not null default '[]'::jsonb,
  compatible_numbers jsonb not null default '[]'::jsonb,
  created_at         timestamptz default now(),
  unique(number, category)
);

create table if not exists numerology_profiles (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  label            text not null,
  full_name        text not null,
  birth_date       date not null,
  results          jsonb not null,
  results_snapshot jsonb not null default '{}'::jsonb,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ─── Moon Phases ────────────────────────────────────────────

create table if not exists moon_rituals (
  id           uuid primary key default uuid_generate_v4(),
  phase        text unique not null,
  phase_label  text not null,
  description  text not null,
  rituals      jsonb not null default '[]'::jsonb,
  intentions   jsonb not null default '[]'::jsonb,
  activities   jsonb not null default '[]'::jsonb,
  avoid        jsonb not null default '[]'::jsonb,
  crystals     jsonb not null default '[]'::jsonb,
  herbs        jsonb not null default '[]'::jsonb,
  created_at   timestamptz default now()
);

create table if not exists moon_journal_entries (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid references auth.users(id) on delete cascade not null,
  date               date not null,
  title              text not null,
  content            text not null,
  mood               text,
  moon_phase         text not null,
  moon_illumination  real not null default 0,
  tags               jsonb not null default '[]'::jsonb,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

create table if not exists moon_phase_cache (
  id            uuid primary key default uuid_generate_v4(),
  date          date unique not null,
  phase         text not null,
  phase_label   text not null,
  illumination  real not null,
  is_waxing     boolean not null,
  created_at    timestamptz default now()
);

-- ─── Dream Journal ──────────────────────────────────────────

create table if not exists dreams_symbols (
  id               uuid primary key default uuid_generate_v4(),
  name             text unique not null,
  category         text not null,
  description      text not null,
  common_meanings  jsonb not null default '[]'::jsonb,
  questions        jsonb not null default '[]'::jsonb,
  related_symbols  jsonb not null default '[]'::jsonb,
  created_at       timestamptz default now()
);

create table if not exists dreams_user_symbols (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  symbol_name     text not null,
  core_symbol_id  uuid references dreams_symbols(id) on delete set null,
  personal_meaning text not null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique(user_id, symbol_name)
);

create table if not exists dreams_entries (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid references auth.users(id) on delete cascade not null,
  date               date not null default current_date,
  title              text not null,
  content            text not null,
  mood               text,
  vividness          integer not null default 3 check (vividness between 1 and 5),
  lucid              boolean not null default false,
  recurring          boolean not null default false,
  symbols            jsonb not null default '[]'::jsonb,
  moon_phase         text,
  moon_illumination  real,
  tags               jsonb not null default '[]'::jsonb,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- ─── Herbology ──────────────────────────────────────────────

create table if not exists herbology_herbs (
  id               uuid primary key default uuid_generate_v4(),
  name             text unique not null,
  latin_name       text not null,
  description      text not null,
  planetary_ruler  text not null,
  element          text not null,
  chakra           text not null,
  magical_uses     jsonb not null default '[]'::jsonb,
  medicinal_notes  jsonb not null default '[]'::jsonb,
  warnings         jsonb not null default '[]'::jsonb,
  folklore         text not null,
  growing_season   text not null,
  correspondences  jsonb not null default '{"deities":[],"zodiac":[],"festivals":[]}'::jsonb,
  created_at       timestamptz default now()
);

create table if not exists herbology_blends (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid references auth.users(id) on delete cascade not null,
  name                 text not null,
  description          text,
  herbs                jsonb not null default '[]'::jsonb,
  intention            text,
  elemental_balance    jsonb not null default '{}'::jsonb,
  planetary_influences jsonb not null default '{}'::jsonb,
  notes                text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ─── Crystals ───────────────────────────────────────────────

create table if not exists crystals_stones (
  id                uuid primary key default uuid_generate_v4(),
  name              text unique not null,
  description       text not null,
  color             text not null,
  chakra            text not null,
  chakras           jsonb not null default '[]'::jsonb,
  element           text not null,
  hardness          text not null,
  healing_properties jsonb not null default '[]'::jsonb,
  magical_uses      jsonb not null default '[]'::jsonb,
  cleansing_methods jsonb not null default '[]'::jsonb,
  zodiac_signs      jsonb not null default '[]'::jsonb,
  planetary_ruler   text not null,
  affirmation       text not null,
  cautions          jsonb not null default '[]'::jsonb,
  created_at        timestamptz default now()
);

create table if not exists crystals_intentions (
  id          uuid primary key default uuid_generate_v4(),
  name        text unique not null,
  description text not null,
  icon        text not null,
  stone_ids   jsonb not null default '[]'::jsonb,
  created_at  timestamptz default now()
);

create table if not exists crystals_collections (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  stone_id      uuid references crystals_stones(id) on delete cascade not null,
  notes         text,
  acquired_date date,
  created_at    timestamptz default now(),
  unique(user_id, stone_id)
);

-- ─── Astrology ──────────────────────────────────────────────

create table if not exists astrology_birth_charts (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  label          text not null,
  birth_date     date not null,
  birth_time     time,
  birth_location text not null,
  latitude       double precision not null,
  longitude      double precision not null,
  timezone       text not null,
  sun_sign       text not null,
  moon_sign      text not null,
  rising_sign    text,
  chart_data     jsonb not null,
  time_unknown   boolean not null default false,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create table if not exists astrology_horoscope_cache (
  id         uuid primary key default uuid_generate_v4(),
  sign       text not null,
  date       date not null,
  content    text not null,
  created_at timestamptz default now(),
  unique(sign, date)
);

create table if not exists astrology_interpretations (
  id             uuid primary key default uuid_generate_v4(),
  category       text not null,
  key            text not null,
  title          text not null,
  description    text not null,
  keywords       jsonb not null default '[]'::jsonb,
  element        text,
  modality       text,
  ruling_planet  text,
  created_at     timestamptz default now(),
  unique(category, key)
);

-- ============================================================
-- Row Level Security
-- ============================================================

-- tarot_cards: public read
alter table tarot_cards enable row level security;
drop policy if exists "tarot_cards_public_read" on tarot_cards;
create policy "tarot_cards_public_read"
  on tarot_cards for select
  to anon, authenticated
  using (true);

-- tarot_spread_templates: system spreads (user_id IS NULL) readable by all,
-- user spreads readable/writable only by owner
alter table tarot_spread_templates enable row level security;
drop policy if exists "spread_templates_select_system_or_own" on tarot_spread_templates;
create policy "spread_templates_select_system_or_own"
  on tarot_spread_templates for select
  to anon, authenticated
  using (user_id is null or auth.uid() = user_id);

drop policy if exists "spread_templates_insert_own" on tarot_spread_templates;
create policy "spread_templates_insert_own"
  on tarot_spread_templates for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "spread_templates_update_own" on tarot_spread_templates;
create policy "spread_templates_update_own"
  on tarot_spread_templates for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "spread_templates_delete_own" on tarot_spread_templates;
create policy "spread_templates_delete_own"
  on tarot_spread_templates for delete
  to authenticated
  using (auth.uid() = user_id);

-- tarot_readings: users CRUD their own
alter table tarot_readings enable row level security;
drop policy if exists "readings_select_own" on tarot_readings;
create policy "readings_select_own"
  on tarot_readings for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "readings_insert_own" on tarot_readings;
create policy "readings_insert_own"
  on tarot_readings for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "readings_update_own" on tarot_readings;
create policy "readings_update_own"
  on tarot_readings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "readings_delete_own" on tarot_readings;
create policy "readings_delete_own"
  on tarot_readings for delete
  to authenticated
  using (auth.uid() = user_id);

-- tarot_synthesis_templates: public read
alter table tarot_synthesis_templates enable row level security;
drop policy if exists "synthesis_templates_public_read" on tarot_synthesis_templates;
create policy "synthesis_templates_public_read"
  on tarot_synthesis_templates for select
  to anon, authenticated
  using (true);

-- numerology_interpretations: public read
alter table numerology_interpretations enable row level security;
drop policy if exists "numerology_interpretations_public_read" on numerology_interpretations;
create policy "numerology_interpretations_public_read"
  on numerology_interpretations for select
  to anon, authenticated
  using (true);

-- numerology_profiles: users CRUD their own
alter table numerology_profiles enable row level security;
drop policy if exists "numerology_profiles_select_own" on numerology_profiles;
create policy "numerology_profiles_select_own"
  on numerology_profiles for select to authenticated using (auth.uid() = user_id);
drop policy if exists "numerology_profiles_insert_own" on numerology_profiles;
create policy "numerology_profiles_insert_own"
  on numerology_profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "numerology_profiles_update_own" on numerology_profiles;
create policy "numerology_profiles_update_own"
  on numerology_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "numerology_profiles_delete_own" on numerology_profiles;
create policy "numerology_profiles_delete_own"
  on numerology_profiles for delete to authenticated using (auth.uid() = user_id);

-- moon_rituals: public read
alter table moon_rituals enable row level security;
drop policy if exists "moon_rituals_public_read" on moon_rituals;
create policy "moon_rituals_public_read"
  on moon_rituals for select to anon, authenticated using (true);

-- moon_journal_entries: users CRUD their own
alter table moon_journal_entries enable row level security;
drop policy if exists "moon_journal_select_own" on moon_journal_entries;
create policy "moon_journal_select_own"
  on moon_journal_entries for select to authenticated using (auth.uid() = user_id);
drop policy if exists "moon_journal_insert_own" on moon_journal_entries;
create policy "moon_journal_insert_own"
  on moon_journal_entries for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "moon_journal_update_own" on moon_journal_entries;
create policy "moon_journal_update_own"
  on moon_journal_entries for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "moon_journal_delete_own" on moon_journal_entries;
create policy "moon_journal_delete_own"
  on moon_journal_entries for delete to authenticated using (auth.uid() = user_id);

-- moon_phase_cache: public read
alter table moon_phase_cache enable row level security;
drop policy if exists "moon_phase_cache_public_read" on moon_phase_cache;
create policy "moon_phase_cache_public_read"
  on moon_phase_cache for select to anon, authenticated using (true);

-- dreams_symbols: public read
alter table dreams_symbols enable row level security;
drop policy if exists "dreams_symbols_public_read" on dreams_symbols;
create policy "dreams_symbols_public_read"
  on dreams_symbols for select to anon, authenticated using (true);

-- dreams_user_symbols: users CRUD their own
alter table dreams_user_symbols enable row level security;
drop policy if exists "dreams_user_symbols_select_own" on dreams_user_symbols;
create policy "dreams_user_symbols_select_own"
  on dreams_user_symbols for select to authenticated using (auth.uid() = user_id);
drop policy if exists "dreams_user_symbols_insert_own" on dreams_user_symbols;
create policy "dreams_user_symbols_insert_own"
  on dreams_user_symbols for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "dreams_user_symbols_update_own" on dreams_user_symbols;
create policy "dreams_user_symbols_update_own"
  on dreams_user_symbols for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "dreams_user_symbols_delete_own" on dreams_user_symbols;
create policy "dreams_user_symbols_delete_own"
  on dreams_user_symbols for delete to authenticated using (auth.uid() = user_id);

-- dreams_entries: users CRUD their own
alter table dreams_entries enable row level security;
drop policy if exists "dreams_entries_select_own" on dreams_entries;
create policy "dreams_entries_select_own"
  on dreams_entries for select to authenticated using (auth.uid() = user_id);
drop policy if exists "dreams_entries_insert_own" on dreams_entries;
create policy "dreams_entries_insert_own"
  on dreams_entries for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "dreams_entries_update_own" on dreams_entries;
create policy "dreams_entries_update_own"
  on dreams_entries for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "dreams_entries_delete_own" on dreams_entries;
create policy "dreams_entries_delete_own"
  on dreams_entries for delete to authenticated using (auth.uid() = user_id);

-- herbology_herbs: public read
alter table herbology_herbs enable row level security;
drop policy if exists "herbology_herbs_public_read" on herbology_herbs;
create policy "herbology_herbs_public_read"
  on herbology_herbs for select to anon, authenticated using (true);

-- herbology_blends: users CRUD their own
alter table herbology_blends enable row level security;
drop policy if exists "herbology_blends_select_own" on herbology_blends;
create policy "herbology_blends_select_own"
  on herbology_blends for select to authenticated using (auth.uid() = user_id);
drop policy if exists "herbology_blends_insert_own" on herbology_blends;
create policy "herbology_blends_insert_own"
  on herbology_blends for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "herbology_blends_update_own" on herbology_blends;
create policy "herbology_blends_update_own"
  on herbology_blends for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "herbology_blends_delete_own" on herbology_blends;
create policy "herbology_blends_delete_own"
  on herbology_blends for delete to authenticated using (auth.uid() = user_id);

-- crystals_stones: public read
alter table crystals_stones enable row level security;
drop policy if exists "crystals_stones_public_read" on crystals_stones;
create policy "crystals_stones_public_read"
  on crystals_stones for select to anon, authenticated using (true);

-- crystals_intentions: public read
alter table crystals_intentions enable row level security;
drop policy if exists "crystals_intentions_public_read" on crystals_intentions;
create policy "crystals_intentions_public_read"
  on crystals_intentions for select to anon, authenticated using (true);

-- crystals_collections: users CRUD their own
alter table crystals_collections enable row level security;
drop policy if exists "crystals_collections_select_own" on crystals_collections;
create policy "crystals_collections_select_own"
  on crystals_collections for select to authenticated using (auth.uid() = user_id);
drop policy if exists "crystals_collections_insert_own" on crystals_collections;
create policy "crystals_collections_insert_own"
  on crystals_collections for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "crystals_collections_update_own" on crystals_collections;
create policy "crystals_collections_update_own"
  on crystals_collections for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "crystals_collections_delete_own" on crystals_collections;
create policy "crystals_collections_delete_own"
  on crystals_collections for delete to authenticated using (auth.uid() = user_id);

-- astrology_birth_charts: users CRUD their own
alter table astrology_birth_charts enable row level security;
drop policy if exists "astrology_charts_select_own" on astrology_birth_charts;
create policy "astrology_charts_select_own"
  on astrology_birth_charts for select to authenticated using (auth.uid() = user_id);
drop policy if exists "astrology_charts_insert_own" on astrology_birth_charts;
create policy "astrology_charts_insert_own"
  on astrology_birth_charts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "astrology_charts_update_own" on astrology_birth_charts;
create policy "astrology_charts_update_own"
  on astrology_birth_charts for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "astrology_charts_delete_own" on astrology_birth_charts;
create policy "astrology_charts_delete_own"
  on astrology_birth_charts for delete to authenticated using (auth.uid() = user_id);

-- astrology_horoscope_cache: public read
alter table astrology_horoscope_cache enable row level security;
drop policy if exists "astrology_horoscope_cache_public_read" on astrology_horoscope_cache;
create policy "astrology_horoscope_cache_public_read"
  on astrology_horoscope_cache for select to anon, authenticated using (true);

-- astrology_interpretations: public read
alter table astrology_interpretations enable row level security;
drop policy if exists "astrology_interpretations_public_read" on astrology_interpretations;
create policy "astrology_interpretations_public_read"
  on astrology_interpretations for select to anon, authenticated using (true);

-- ─── Image path columns (added for herb/crystal illustrations) ──
alter table herbology_herbs add column if not exists image_path text;
alter table crystals_stones add column if not exists image_path text;

-- ============================================================
-- Seed Data
-- ============================================================

-- Module registry
insert into modules (key, name, description, enabled, icon) values
  ('tarot',      'Tarot',              'Card readings and interpretations',           true,  'sparkles'),
  ('herbology',  'Herbology',          'Herb properties, uses, and correspondences',  true,  'leaf'),
  ('astrology',  'Astrology',          'Birth charts and planetary meanings',          true,  'star'),
  ('crystals',   'Crystal Properties', 'Properties, chakras, and uses',               true,  'gem'),
  ('numerology', 'Numerology',         'Number meanings and life path',               true,  'hash'),
  ('moon',       'Moon Phase Tracker', 'Phase calendar and ritual suggestions',        true,  'moon'),
  ('dreams',     'Dream Journal',      'Personal dream log with symbol library',       true,  'cloud-moon')
on conflict (key) do update set enabled = excluded.enabled, icon = excluded.icon;

-- Default synthesis templates
insert into tarot_synthesis_templates (role, template, description) values
  (
    'intro',
    'Your {{spread_name}} spread calls upon {{card_count}} cards to illuminate the path before you.',
    'Opening line of the synthesis narrative.'
  ),
  (
    'major_arcana_note',
    ' {{major_arcana_count}} of them Major Arcana — pointing to themes that transcend the everyday.',
    'Appended to intro when major arcana cards are present.'
  ),
  (
    'position_block',
    'In the position of **{{position_label}}**, the {{card_name}} appears {{orientation}}. {{meaning}} Keywords that surface: {{keywords}}.',
    'Repeated for each card position in the spread.'
  ),
  (
    'reversed_note',
    'Drawn in reversal, this energy may be blocked, internalised, or asking for your attention in a different way.',
    'Appended to position block when a card is drawn reversed.'
  ),
  (
    'closing',
    'Sit with what has surfaced. The cards reflect — they do not dictate.',
    'Final line of the synthesis narrative.'
  )
on conflict (role) do nothing;

-- Default spread templates (system-level, no user_id)
insert into tarot_spread_templates (name, description, positions) values
  (
    'Single Card',
    'A quick one-card reading for concise insight or daily focus.',
    '[{"id":"p1","label":"Insight","x":0,"y":0,"order":1}]'::jsonb
  ),
  (
    'Three-Card Spread',
    'A chronological spread examining influences across past, present, and future.',
    '[{"id":"p1","label":"Past","x":0,"y":0,"order":1},{"id":"p2","label":"Present","x":1,"y":0,"order":2},{"id":"p3","label":"Future","x":2,"y":0,"order":3}]'::jsonb
  ),
  (
    'Blind Spot',
    'A four-card spread to enhance self-awareness and reveal hidden aspects of yourself.',
    '[{"id":"p1","label":"Obvious identity","x":1,"y":0,"order":1},{"id":"p2","label":"Unconscious driving forces","x":0,"y":1,"order":2},{"id":"p3","label":"Concealed aspects","x":2,"y":1,"order":3},{"id":"p4","label":"The Blind Spot","x":1,"y":2,"order":4}]'::jsonb
  ),
  (
    'Cross Spread',
    'A four-card spread useful for questions, advice, and clarification.',
    '[{"id":"p1","label":"Topic focus","x":1,"y":0,"order":1},{"id":"p2","label":"What not to do","x":0,"y":1,"order":2},{"id":"p3","label":"What to do","x":2,"y":1,"order":3},{"id":"p4","label":"Resulting outcome","x":1,"y":2,"order":4}]'::jsonb
  ),
  (
    'Horseshoe Spread',
    'A seven-card arc — more depth than a three-card reading, yet simpler than most advanced spreads.',
    '[{"id":"p1","label":"Past events","x":0,"y":2,"order":1},{"id":"p2","label":"Current state","x":1,"y":1,"order":2},{"id":"p3","label":"Hidden influences","x":2,"y":0,"order":3},{"id":"p4","label":"Obstacles","x":3,"y":0,"order":4},{"id":"p5","label":"External influences","x":4,"y":0,"order":5},{"id":"p6","label":"Suggested action","x":5,"y":1,"order":6},{"id":"p7","label":"Projected outcome","x":6,"y":2,"order":7}]'::jsonb
  ),
  (
    'Ankh Spread',
    'A nine-card spread examining causes behind trends, spiritual background, and future prospects.',
    '[{"id":"p1","label":"First significator","x":1,"y":0,"order":1},{"id":"p2","label":"Second significator","x":2,"y":0,"order":2},{"id":"p3","label":"Early causes","x":0,"y":1,"order":3},{"id":"p4","label":"Current triggers","x":3,"y":1,"order":4},{"id":"p5","label":"Spiritual perspective","x":1.5,"y":2,"order":5},{"id":"p6","label":"Purpose and reasoning","x":1.5,"y":3,"order":6},{"id":"p7","label":"Next step","x":1.5,"y":4,"order":7},{"id":"p8","label":"Surprising experiences","x":1.5,"y":5,"order":8},{"id":"p9","label":"Result","x":1.5,"y":6,"order":9}]'::jsonb
  ),
  (
    'Celtic Cross',
    'The most well-known tarot spread — ten cards covering situation, challenges, past, future, and outcome.',
    '[{"id":"p1","label":"Present situation","x":1,"y":2,"order":1},{"id":"p2","label":"Challenge or crossing","x":1.5,"y":2,"order":2},{"id":"p3","label":"Conscious thoughts","x":1,"y":0,"order":3},{"id":"p4","label":"Unconscious emotions","x":1,"y":4,"order":4},{"id":"p5","label":"Recent past","x":0,"y":2,"order":5},{"id":"p6","label":"Near future","x":2,"y":2,"order":6},{"id":"p7","label":"Your attitude","x":4,"y":4,"order":7},{"id":"p8","label":"External influences","x":4,"y":3,"order":8},{"id":"p9","label":"Hopes and fears","x":4,"y":1,"order":9},{"id":"p10","label":"Final outcome","x":4,"y":0,"order":10}]'::jsonb
  ),
  (
    'Secret of the Priestess',
    'A nine-card alternative to the Celtic Cross by Hajo Banzhaf, exploring lunar phases and hidden knowledge.',
    '[{"id":"p1","label":"First significator","x":1,"y":0,"order":1},{"id":"p2","label":"Second significator","x":2,"y":0,"order":2},{"id":"p3","label":"Current influence","x":1.5,"y":1,"order":3},{"id":"p4","label":"Waxing Moon — approaching","x":3,"y":1,"order":4},{"id":"p5","label":"Waning Moon — receding","x":0,"y":1,"order":5},{"id":"p6","label":"Dark — subconscious","x":0,"y":2,"order":6},{"id":"p7","label":"Light — conscious","x":3,"y":2,"order":7},{"id":"p8","label":"Next step","x":1.5,"y":2,"order":8},{"id":"p9","label":"Secret of the High Priestess","x":1.5,"y":3,"order":9}]'::jsonb
  )
on conflict (name) do nothing;
