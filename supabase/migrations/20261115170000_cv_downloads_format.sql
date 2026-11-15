-- CV som Word-fil (docs/plan-cv-word-2026-11-15.md avsnitt 5.1 och 9).
-- Formatet på varje CV-nedladdning, så att Word-andelen går att läsa per mall.
-- Additiv: befintliga rader och anrop utan kolumnen får 'pdf'. Rutten
-- src/app/api/cv/generate-formatted/route.ts loggar utan kolumnen om den
-- saknas, så koden fungerar före och efter migreringen.
alter table public.formatted_cv_downloads
  add column if not exists format text not null default 'pdf'
  check (format in ('pdf', 'docx'));
