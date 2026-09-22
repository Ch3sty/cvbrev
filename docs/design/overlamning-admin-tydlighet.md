# Överlämning: admin tydlighet (bygge 2026-09-22)

Gemensam grund för de fyra byggagenterna. Specen är
`docs/design/spec-admin-tydlighet-2026-09-22.html` (godkänd av ägaren i sin
helhet, alla elva punkter). Läs den först, sedan den här filen.

## Redan byggt av saas-lead (rör inte, använd)

| Fil | Vad |
|---|---|
| `src/lib/admin/undantag.ts` | Undantagna konton. `hamtaUndantag(admin)`, `uteslut(fraga, kolumn, u, nullbar)`, `hogqlUteslutning(u)`, `undantagText(u)`, `arTestEpost(email)`. |
| `src/lib/admin/metrics.ts` | `hamtaUndantagCachad()` för sidorna (15 min, adminens tagg). |
| `supabase/migrations/20260922220000_admin_undantagna_konton.sql` | Databasfunktionen `admin_undantagna_konton()` (redan applicerad i produktion). Vyerna `admin_activity_feed` (och daily/by_function), `admin_test_stats`, `admin_retention_cohorts`, `admin_candidate_pool`, `admin_candidate_interests` utesluter redan undantagna. `admin_user_rows` har ALLA konton kvar plus kolumnerna `undantag` ('admin' / 'test' / null) och `premium_scope`. |
| `src/lib/admin/collect.ts` | Insamlingen utesluter undantagna överallt. `new_paying` = kundens första lyckade debitering. `emails_opened` = utskick samma dag som öppnats någon gång (aldrig över 100 %). `active_all_day` räknas mot dagen. |
| `src/lib/admin/kop.ts` | Köpliggaren: `hamtaKopLiggare(dagar)` ur Stripe, cachad 15 min. Rader med paket, konto, ny/förnyelse, engångs/löpande, belopp, återbetalningar som minusrader, `internt` för undantagna. `summa` räknar aldrig interna. Stripe-anrop, så alltid i en Suspense-gräns med reserverad höjd, aldrig i kritiska vägen. |
| `src/lib/admin/tomt.ts` | Tomma tillstånd: `MATSTART` (en sanning för mätstarter), `datumKort`, `tidKort`, `klockslag`, `tal`, `kronor`, `nollSedan`, `matsFran`, `gscEfter`, `foreMatstart`. |
| `src/components/admin/AdminChart.tsx` + `AdminChartInner.tsx` | Diagramregeln: props `enhet`, `minstaPunkter` (standard 7, under det blir det en mening), `faPunkterText`, `matstart` + `matstartText` (grå zon), `efterslap` ({fran, text}, grå zon i slutet), `slutvarde` (standard på), roller `cv`, `test`, `allt` (spårfärgerna). X-axeln visar början, mitten, slut. |
| `src/components/admin/AdminShell.tsx` | Menyn har "Tratt" (`/admin/tratt`) i stället för Funnel och Flöde. |
| Cookie-bannern | Visas inte längre under /admin. |

## Regler för alla sidor

1. **Inga streck i kort.** `–` får inte stå som värde i ett MetricCard. Noll
   skrivs 0 plus sedan när (`nollSedan`), saknad mätning skrivs som
   "Mäts från …" (`matsFran`), en källa som ligger efter säger det
   (`gscEfter`). Streck bara i en tabellcell där kolumnen inte gäller raden,
   och då förklarat i kolumnrubriken. Datumceller utan värde: "aldrig" eller
   "okänt, före <datum>" beroende på orsak.
2. **Senaste kända värde följer med** en nolla.
3. **Diagramregeln** via AdminChart-propsen ovan. Varje diagram har `enhet`
   eller en `formateraY` som bär enheten. Använd `matstart` för serier som
   har en mätstart (MATSTART). Paketserier använder rollerna `cv`, `test`,
   `allt`. Orange (`framhavd`) bara för ett enskilt värde.
4. **Ett tal, en källa.** Konton och registreringar ur `profiles`
   (undantagna bort), köp och intäkt ur Stripe via `kop.ts` eller
   `admin_daily_metrics`, besök och klick ur PostHog/GSC.
5. **Undantagna konton räknas aldrig** i ett tal, en total, en lista över
   aktivitet eller ett diagram. Sidor med totaler säger en gång, i
   meta-text, "1 adminkonto och N testkonton undantagna" (`undantagText`).
6. **Förklaringstext om gamla mätfel** hör hemma i Tratt, avsnittet
   Datakvalitet, inte på Översikt.
7. Svenska, inga em-dash (—), ingen Sparkles-ikon, inga AI-klichéer,
   `font-semibold` max, `rounded-xl` max, border i stället för skugga,
   text minst 12 px, touch 44 px, fungerar på 412 px bredd utan
   horisontell scroll. Tråden-tokens (`bg-panel`, `text-ink-3`,
   `border-kant` osv.), aldrig hex i komponenter.
8. Prestanda: LCP under 1,5 s. Allt som går mot Stripe eller PostHog ligger
   i Suspense med reserverad höjd. Kritiska vägen läser bara Supabase.
9. Ingen commit, ingen push. Rör bara filerna i ditt ägarskap. Kör
   `npx tsc --noEmit -p .` och fixa fel i dina filer (andra agenter bygger
   samtidigt, ignorera fel i filer du inte äger). Kör vitest för dina
   testmappar och uppdatera testerna så de speglar nya beteenden.
