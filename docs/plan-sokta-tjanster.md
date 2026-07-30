# Plan: Sökta tjänster (jobbansöknings-tracker)

*Undersökning genomförd 2026-07-29 med fyra parallella agenter: kodbaskartläggning, extern research (Arbetsförmedlingen + konkurrenter), UX-koncept och Supabase-datamodell.*

**Status: implementerad i sin helhet 2026-07-29** (alla etapper utom påminnelse-cron och publik landningssida under /verktyg/). Beslut under implementationen: gratis för alla, "Nyhet"-badge i sidebar/brevflöde i stället för ändrad bottennav, "Tackade ja/nej" ingår. Migrationer: `supabase/migrations/20260729_sokta_tjanster_*.sql` (4 st, applicerade mot produktion).

## Sammanfattning

Användare loggar sina sökta tjänster (tjänst, arbetsgivare, ort, datum, kanal), följer varje ansökan genom en händelsehistorik ("Kallad till intervju", "Provjobbat", "Avslag" osv), ser statistik och kan dela/skriva ut en översikt, bland annat strukturerad exakt som Arbetsförmedlingens aktivitetsrapport. Loggningen kopplas ihop med brevgeneratorn: ett tryck på "Markera som sökt" efter genererat brev loggar allt automatiskt.

**Marknadsluckan är verifierad:** EnApp bevisar svensk efterfrågan (månadsrapport för AF/Rusta och matcha) men är matchningsapp först. Ingen svensk aktör gör snygg statistik + flödesdiagram + utskrivbar AF-strukturerad översikt som fristående verktyg. Teal/Huntr/Simplify visar vilka pipeline-steg och metrics som fungerar internationellt.

## Varför det blir en wow-funktion

1. **Ett tryck från brevflödet.** `letters`-tabellen sparar redan `company`, `job_title`, `job_description` per generering (AI-extraherat via `extractJobInfo`). "Markera som sökt" kräver noll inmatning: tjänst, arbetsgivare, datum och kanal ("Eget brev") fylls i automatiskt, brevet länkas till ansökan. Toast med 5 sek ångra-fönster, ingen dialog.
2. **AF-exporten matchar myndighetens format exakt.** Verifierat mot AF:s blankett Af 00331: fyra sektioner (annonserat jobb / spontanansökan / intervju / övrig aktivitet) med fälten datum, tjänst, arbetsgivare, ort. Rapporten lämnas den 1:a till 14:e varje månad och avser föregående månad. Sedan 1 okt 2025 gäller sanktionstrappa vid utebliven rapport (varning, 1 dag, 5 dagar, 10 dagar, indragen ersättning), så insatsen för användaren är verklig.
3. **"Kopiera sammanfattning som text".** Många fyller i AF-rapporten direkt i webbformuläret på Mina sidor. En ren textsammanfattning att klistra in löser ett konkret byråkratiskt irritationsmoment som ingen konkurrent verkar ha tänkt på.
4. **Sankey-diagrammet.** "Sankey of my job search" är en återkommande topppost på r/dataisbeautiful. Våra statusar mappar direkt till noderna (Sökt → Ej svar/Avslag/Intervju → Intervju 2/Provjobb → Erbjudande → Ja/Nej). Genereras automatiskt från loggen, blir både socialt delningsobjekt och pedagogiskt underlag hos handläggaren. På mobil visas i stället en horisontell trattvy (Sankey är oläsbart på 375px), fulla diagrammet reserveras för desktop och print.
5. **Ambient "inget hört än"-nudge.** "Ej svar" loggas aldrig manuellt (att upprepa "fortfarande inget" känns som ett nederlag). I stället visas en mjuk nudge i tidslinjen efter 10-14 dagars tystnad. Avslag färgas neutralt (slate), inte larmröd.
6. **Inloggningsfri delningslänk** till read-only-statistik, med valbart vad som exponeras. Ingen av de stora trackers erbjuder detta, det är en differentiering.
7. **Backfill vid onboarding:** "Sökta tjänster" kan seedas från befintliga `letters` med `is_saved = true` ("Vi hittade 8 brev du skapat, vill du lägga till dem som sökta tjänster?"). Direkt värde från dag ett.

## Datamodell (Supabase)

Ingen tabell för ansökningar finns i dag (verifierat mot live-DB). Tre nya tabeller + en RPC, allt enligt husets konventioner (text + CHECK i stället för enum, `(select auth.uid())` i RLS, `update_updated_at_column()`-trigger):

### `job_applications`
En rad per ansökan: `job_title`, `company`, `location`, `application_channel` (`ad`/`unsolicited`/`network`, mappar mot AF:s sektioner), `job_ad_url`, `letter_id` (FK → `letters`, ON DELETE SET NULL), `cv_id` (FK → `cv_texts`, inte "cvs", den tabellen finns inte), `notes`, `applied_at` (date), plus denormaliserad `current_status` + `status_updated_at` som cache.

### `job_application_events`
Händelsehistorik, sanningskällan för status. `event_type`: `applied`, `no_response`, `rejected`, `interview_invited`, `interview_completed` (+ `interview_round` 1-10, så "Intervju 2/3" inte har hårt tak), `trial_work_completed`, `offer_received`, `accepted`, `declined`. `occurred_at` (date), `note`. Rader kan redigeras/raderas (backa/rätta), en trigger (`sync_job_application_current_status`, SECURITY DEFINER med explicit `search_path = public`) räknar om `current_status` från senaste kvarvarande händelse. RLS via EXISTS mot föräldern, samma mönster som `interest_messages`.

### `job_application_share_links`
Direkt klon av `recruiter_share_links`-mönstret: token som PK (`crypto.randomBytes(24).toString('base64url')`, ~144 bitars entropi, återanvänd `generateShareToken()` från `src/lib/recruiter/shareLinks.ts`), `expires_at`, `revoked_at`, plus `show_*`-booleans för valbar exponering (`show_company_names`, `show_channel_breakdown`, `show_monthly_trend`, `show_notes` default false). Endast ägar-SELECT i RLS, all skrivning via `getSupabaseAdmin()` i API-route. Publikt uppslag sker server-side, aldrig via anon-nyckeln.

### `get_job_application_stats(user_id, since)` (RPC)
Aggregat: totalt, svarsfrekvens, intervjufrekvens, erbjudanden, per månad. **Endast GRANT till service_role** (tar godtycklig user_id, får aldrig exponeras mot anon/authenticated). Fullständiga SQL-utkast finns i agentrapporten, inget är kört mot databasen.

Kända fallgropar noterade: flera migrationer sedan 20260705 finns i databasen men saknas som lokala filer (befintligt gap i repot), FK-index skapas explicit (Postgres gör det inte automatiskt), tidigare `search_path`-sårbarheter i SECURITY DEFINER-funktioner ska inte upprepas.

## Sidstruktur och UX

```
/dashboard/sokta-tjanster          Huvudvy med tre flikar (segmented control):
                                     Ansökningar (lista) | Statistik | Dela & skriv ut
/dashboard/sokta-tjanster/[id]     Detaljvy: händelsetidslinje + "Lägg till händelse"
/dela/sokta-tjanster/[token]       Publik read-only-vy, ingen inloggning
```

- **Listvyn** kopierar `mina-brev`-mönstret (hero-statrad, sök, filter-chips, kort). Varje kort: tjänst, företag, status-pill, tid sedan senaste händelse, mini-progress-dots.
- **Snabblogg** via FAB/bottom sheet: två obligatoriska textfält (tjänst, arbetsgivare) + datum (förvalt idag) + kanal-chips. Mål under 15 sekunder.
- **Lägg till händelse**: bottom sheet med stora ikon-chips i grid, en tryckning väljer, datum förvalt idag. Aktuell status beräknas alltid från senaste händelsen, användaren "sätter" aldrig status separat.
- **Statistikfliken**: MetricCard-stil (sober, förtroendekontext), 2x2 KPI-grid (sökta, svarsfrekvens, intervjufrekvens, erbjudanden), aktivitet per vecka (recharts, orange), horisontell tratt. Ghost-diagram som empty state under 3 ansökningar.
- **Dela & skriv ut**: månadsväljare (matchar AF-perioden), AF:s fyrsektionstabell, tratt/Sankey, knappar Skriv ut / Dela länk / PDF / Kopiera sammanfattning som text. Print via ny `.tracker-report`-klass enligt `.letter-template`/`.no-print`-konventionen i `globals.css`, A4, sidfot "Genererad via jobbcoach.ai".

### Ingångspunkter för "Markera som sökt"
- `PreviewStep.tsx` action-bar/success-banner efter genererat brev (primär, ett tryck)
- `LetterCard`/`LetterCardCompact` i mina-brev (retroaktivt)
- `JobDetailModal` i jobbmatchningen (skickar redan prefill via `cover-letter-store`, har `application_url` som i dag inte skickas med, lätt att lägga till)
- FAB på sidan (manuell logg)
- `DashboardSnabbAtgarder` ("Logga en ansökan")

### Navigering
Sidebar-sektionen "Mina dokument" (`Sidebar.tsx:267-286`) med count via `refreshCounts` + realtime-kanal, precis som CV och brev. Ny ikon i `MenuIcons.tsx`. Ingen middleware-ändring behövs (allt under `/dashboard` är redan skyddat). Bottennav-frågan är öppen (se nedan).

## Kodmönster att kopiera

| Behov | Kopiera från |
|---|---|
| Migration + RLS | `supabase/migrations/20260616_create_global_job_cache.sql` + `letters`-policyvarianten |
| CRUD-API | `src/app/api/letters/route.ts` + `[id]/route.ts` |
| Listsida | `src/app/dashboard/mina-brev/page.tsx` + `LetterCard.tsx` |
| Statistikvy | `src/app/admin/activity/page.tsx` + `MetricCard`/`SectionCard`/`PeriodSelector` |
| Delningslänk | `src/lib/recruiter/shareLinks.ts` + `src/app/api/recruiter/share/route.ts` + `/dela/kandidat`-vyn |
| Toast + aktivitetslogg | `successWithMascotAndActivity` i `notificationcontext`, ny `ActivityType` i `src/lib/activity-logger.ts` |
| Prefill mellan sidor | `src/store/cover-letter-store.ts` (sessionStorage-mönstret) |
| PDF | `src/app/api/letters/download/route.ts` (puppeteer-core + @sparticuz/chromium) |

## Etappindelning

**Etapp 1, MVP (kärnvärdet):** migration (tre tabeller + trigger + RPC), CRUD-API, listvy + snabblogg + detaljvy med händelser, "Markera som sökt" i PreviewStep och mina-brev, sidebar-länk, backfill-erbjudande från befintliga brev.

**Etapp 2, statistik:** statistikfliken (KPI + veckoaktivitet + tratt), nudge för "inget hört än", "Markera som sökt" i JobDetailModal (+ skicka med `application_url` i prefill).

**Etapp 3, dela & skriv ut:** AF-månadsvyn med fyrsektionstabell, print-CSS, "Kopiera sammanfattning som text", delningslänk + publik vy, PDF-export, Sankey på desktop/print (läs dataviz-skillen först).

**Etapp 4, polish/retention:** påminnelse runt den 1:a ("dags att aktivitetsrapportera"), ev. "X av Y jobb denna månad" mot eget mål (AF:s Min planering sätter individuella krav), ev. AF:s yrkestaxonomi för tjänstetitlar (AF kräver sedan 2025-09-23 val ur yrkeslista i stället för fritext), landningssida under `/verktyg/` + sitemap.

## Öppna produktbeslut

1. **Bottennaven:** ska "Ansökningar" ersätta/slås ihop med "Jobb"-fliken i `MobileBottomNav`, eller räcker sidebar + brevflödet i v1?
2. **Svarsfrekvens-definition:** räknas avslag som "svar"? Rekommendation: två mått, svarsfrekvens (allt utom tystnad) och intervjufrekvens.
3. **Kvot/premium:** ska free-nivån ha tak (t.ex. max antal spårade ansökningar, delningslänk endast premium)? Löses i applikationslagret som `maxSavedLetters`, men bör beslutas före lansering.
4. **Statusar "Tackade ja/nej":** rekommenderas (finns i schemautkastet som `accepted`/`declined`), ger renare Sankey-slut.
5. **Kanaler:** fast set (ad/spontan/nätverk, mappar mot AF-sektionerna) rekommenderas framför fritext, för konsekvent statistik och korrekt AF-export.

## Källor (research)

- AF-blanketten Af 00331 (fältstruktur): arbetsformedlingen.se/download/18.75a5a30116b93f40a3f81ff/1737638182014/Af_00331_Aktivitetsrapport_(Q).pdf
- Rapporteringsperiod 1-14: arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2023-10-25-viktigt-for-dig-som-aktivitetsrapporterar
- Yrkesval ur taxonomi sedan 2025-09-23: arbetsformedlingen.se/for-leverantorer/nyheter-for-leverantorer/nyheter-for-leverantorer/2025-09-23-nytt-satt-att-valja-yrke-i-aktivitetsrapporten
- Sanktionstrappan (SFS 2024:506): riksdagen.se + ffakassan.se/ersattning/sanktioner/
- Konkurrenter: tealhq.com/tools/job-tracker, huntr.co/product/job-tracker + job-search-metrics, simplify.jobs/job-application-tracker, careerflow.ai/job-tracker, enapp.se
- Sankey-trenden: sankeyart.com/content/blog/sankey-diagrams-of-the-job-search-process/
