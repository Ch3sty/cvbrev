-- Härkomst för automatiskt ifyllda profilfält (profilsidan visar "hämtat från ditt CV").
-- Applicerad via MCP 2026-09-12 (profil_harkomst_kolumner).
alter table public.profiles
  add column if not exists contact_parsed_at timestamptz,
  add column if not exists avatar_source text;
