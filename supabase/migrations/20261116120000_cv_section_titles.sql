-- Rubrikmodellen (docs/plan-mallar-2026-11-15.md avsnitt 3.1): rubrikerna
-- CV:t valt, per avsnitt, t.ex. {"erfarenhet": "Klinisk erfarenhet"}.
-- Nullable och additiv; tom kolumn betyder rubrikmodellens förval.
-- Körd i prod 2026-11-16 via MCP (namn cv_section_titles); filen finns för historiken.
alter table public.cv_texts add column if not exists section_titles jsonb;

comment on column public.cv_texts.section_titles is
  'Valda CV-rubriker per avsnitt (src/lib/cv/rubriker.ts). Null ger rubrikmodellens förval.';
