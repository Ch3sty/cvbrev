-- Mejlvalet: samtycke till erbjudanden och tips på mejl (ägarens beslut 2026-11-13).
--
-- Tre lägen i en kolumn:
--   null   ej tillfrågad. Alla konton som fanns före den här migreringen.
--          Får kampanjmejl enligt ägarens beslut, med avregistrering.
--   true   kryssade i rutan i registreringen eller slog på valet.
--   false  kryssade inte, slog av eller avregistrerade sig.
--
-- Kolumnen läggs till utan standardvärde, så att befintliga rader blir null,
-- och får sedan standardvärdet false: ett nytt konto får bara erbjudanden om
-- det sagt ja. Kolumnerna är inte spärrade (profiles_skyddade_kolumner):
-- kontot får ändra sitt eget val.

alter table public.profiles add column if not exists erbjudanden_mejl boolean;
alter table public.profiles alter column erbjudanden_mejl set default false;
alter table public.profiles add column if not exists erbjudanden_mejl_at timestamptz;

comment on column public.profiles.erbjudanden_mejl is
  'Samtycke till erbjudanden och tips på mejl. null = ej tillfrågad (konton före 2026-11-13), true = ja, false = nej. Se 20261113120000_erbjudanden_mejl.sql.';
comment on column public.profiles.erbjudanden_mejl_at is
  'När erbjudanden_mejl senast sattes (registrering, inställningar eller avregistrering).';
