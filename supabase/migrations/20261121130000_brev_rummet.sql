-- Brevrummet, omgång 1 (BYGGSPEC avsnitt 3, 2026-11-21).
--
-- Brevet lagras som text och val var för sig: stycken, hälsning, mall och
-- typsnitt. content (färdig HTML) skrivs fortfarande av servern, men källan
-- är body_stycken. Bara tillägg: alla kolumner nullbara, inga befintliga
-- kolumner ändras, RLS och grants orörda. Går att köra flera gånger.
--
-- Gamla brev får ingen körning över raderna: styckena läses ur content först
-- när brevet öppnas för ändring eller mallbyte (src/lib/letters/stycken.ts).

alter table public.letters add column if not exists body_stycken jsonb;
alter table public.letters add column if not exists halsning text;
alter table public.letters add column if not exists mottagare_person text;
alter table public.letters add column if not exists mall_id text;
alter table public.letters add column if not exists font_id text;
alter table public.letters add column if not exists krav jsonb;
alter table public.letters add column if not exists forberett_at timestamptz;
-- Hur brevet förbereddes första gången: 'kopierat' eller 'nedladdat'.
-- Nästa steg-texten säger "Brevet är nedladdat" eller "kopierat".
alter table public.letters add column if not exists forberett_som text;
-- cv_id fanns i typfilen men inte i databasen. CV:t brevet skrevs mot;
-- tas CV:t bort står brevet kvar utan koppling.
alter table public.letters add column if not exists cv_id uuid references public.cv_texts(id) on delete set null;

comment on column public.letters.body_stycken is 'Brödtextens stycken som ren text (jsonb-array av strängar). Källan för brevet, content räknas om ur den.';
comment on column public.letters.halsning is 'Hälsningsraden. Null = mallens förval efter språk.';
comment on column public.letters.mottagare_person is 'Namngiven mottagare, om annonsen eller användaren angav en.';
comment on column public.letters.mall_id is 'CV-mallens id (linne, bjork ...). Null = gammalt brev i en av de sex gamla mallarna (template_id).';
comment on column public.letters.font_id is 'Valt typsnitt (FontSelector-id). Null = mallens eget.';
comment on column public.letters.krav is 'BrevKrav[]: annonsens krav och citatet i brevet. Null = inte läst, [] = färre än tre krav hittades.';
comment on column public.letters.forberett_at is 'Första gången brevet kopierades eller laddades ner.';
comment on column public.letters.forberett_som is 'kopierat eller nedladdat, sätts samtidigt som forberett_at.';
comment on column public.letters.cv_id is 'CV:t brevet skrevs mot.';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'letters_forberett_som_check' and conrelid = 'public.letters'::regclass
  ) then
    alter table public.letters
      add constraint letters_forberett_som_check
      check (forberett_som is null or forberett_som in ('kopierat', 'nedladdat'));
  end if;
end $$;

-- Listan Dina brev sorterar på updated_at per användare.
create index if not exists idx_letters_user_updated on public.letters (user_id, updated_at desc);
