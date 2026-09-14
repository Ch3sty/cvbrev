# Plan: ny admin

Skriven 2026-09-14 av saas-lead. Fas 1, granskning och beslut. Ingen kod är
skriven. Planen är skriven för att delas direkt i parallella Opus-uppdrag med
filägarskap per sidgrupp, på samma sätt som `docs/design/overlamning-opus.md`
gjorde för Tråden.

Ägarens uppdrag ordagrant: "gör om det inloggade adminflödet. Det är
värdelöst. Borde stödja alla relevanta mätvärden, statistik från mail, GSC,
Stripe är jätteviktig, användarflödet, vad gör dem?" och "de som finns idag
kan vi bara kasta rakt i sopen".

Adminen är ett arbetsverktyg för en person. Den ska svara på fem frågor på
under en minut varje morgon:

1. Tjänar vi mer pengar än i går och förra veckan, och varför?
2. Kommer folk in?
3. Vad gör de när de är här?
4. Fungerar mejlen?
5. Fungerar systemet?

Allt annat i adminen är underordnat de fem frågorna.

## 1. Fem slutsatser

**1. Datan finns, adminen når den inte.** Alla fem källor svarade på
provanrop 2026-09-14: Stripe (29 prenumerationer, 3 aktiva, 1 trialing, 48
debiteringar på 5 066 kr, fyra aktiva priser, kupongen `retention_49_2m` med
0 inlösen), GSC (`sc-domain:jobbcoach.ai`, toppsida `/artiklar/logiska-tester`
32 klick på 30 dagar), PostHog (HogQL svarar, 16 egna eventtyper senaste 14
dagarna), Supabase (10 377 rader i `user_activities`, 311 profiler, 781
`email_events`) och Resend via `email_events` i Supabase. Nuvarande admin
använder nästan ingenting av det. Dashboarden på `/admin` visar fem siffror
som alla kommer ur `profiles` och är blinda för intäkt, trafik och mejl.

**2. Mejlstatistiken finns och är bra, men har varit dold bakom fel
kolumnvärde.** `email_events.event_type` lagrar `delivered`, `opened`,
`clicked`, `bounced`, alltså utan `email.`-prefix, medan Resends
webhook-dokumentation och en naiv fråga använder `email.delivered`. Joinen
mot `email_log.resend_id` fungerar (507 träffar) och ger riktiga siffror:
kampanjen `sokta-tjanster` 251 skickade, 242 levererade, 115 öppnade, 13
klick, 10 studs. Livscykelmejlen syns per mall (`quota_back` 10 av 10
levererade, 7 öppnade). Resends eget API är oanvändbart här: nyckeln i
`.env.local` är sändbegränsad och svarar 401 på `/emails` och `/domains`.
All mejlstatistik ska därför läsas ur Supabase, aldrig ur Resend.

**3. Auth i adminen är nio kopior av samma kontroll, och fem rutter saknar
den.** Varje rutt under `src/app/api/admin` upprepar `getUser()` plus en
`admin_users`-fråga. De fem rutterna under `src/app/api/admin/statistics/**`
kontrollerar bara `rpc('is_admin')`, inte `super_admin`, vilket är en lägre
tröskel än `/admin`-layouten kräver. Layouten själv
(`src/app/admin/layout.tsx`) är en klientkomponent som kontrollerar
behörighet i `useEffect` efter att sidan renderats, alltså efter att data
redan begärts. Det finns ingen `requireSuperAdmin`.

**4. Aggregat saknas helt, och klienten hämtar råtabeller.** Dagens sidor
kör Supabase-frågor direkt från webbläsaren, inklusive `select created_at
from profiles` för hela perioden som sedan grupperas i JavaScript. Det
skalar inte och bryter mot prestandabudgeten. Det finns ingen tabell med
historik: dagens siffror går att räkna, men "mer än i går" går inte att
svara på för någon källa utom Supabase, eftersom GSC bara behåller sitt
eget fönster och Stripe måste pagineras om.

**5. Två mätfel gör att aktiveringssiffror inte får visas som sanning
ännu.** `first_cv_uploaded_at` är satt på 2 av 311 konton och
`first_letter_created_at` på 2, trots 242 brev och 171 CV-texter i
databasen. `acquisition_source` är null på samtliga 311. Det är känt sedan
2026-09-15 (aktiveringsmilstolparna sätts aldrig) och gäller även
attributionen. Adminen ska visa dessa mätvärden, men varje sådant tal ska
bära en datakvalitetsnot tills fixen är live och två veckor har passerat.

## 2. Beslut som tas här

Ägaren har sagt att beslut som annars hade gått till honom tas i planen med
motivering. Följande gäller och omprövas inte utan ny data.

**Tema: samma Tråden som appen.** Adminen följer `docs/designsystem.md` v2
rakt av, inte ett eget mörkt tema. Motivering: adminen underhålls av samma
agenter som appen, och ett andra tema betyder ett andra sanningsbegrepp om
tokens. Den gamla orange/slate-standarden från juli är utdaterad och gäller
inte. Mörkt läge byggs inte nu, men inga värden får väljas som omöjliggör
stegen i designsystemet avsnitt 11.

**Historik: egen tabell `admin_daily_metrics`.** Fylls av den befintliga
cronen `/api/cron/pricing-sync` i midnattsslotten, plus on-demand
påfyllning när adminen läser en dag som saknas. Motivering: båda Vercel-
crons är upptagna (`vercel.json` har två poster, båda till pricing-sync) och
en tredje går inte att lägga till på nuvarande plan. Cronen gör redan flera
jobb i samma anrop (premium-expiration, pricing sync, livscykelmejl,
veckodigest), så ett steg till är rätt plats.

**Statistikrutterna ersätts, inte lagas.** De fem rutterna under
`src/app/api/admin/statistics/**` läser `ai_usage_costs` och svarar på en
fråga adminen inte längre ställer i den formen. De raderas tillsammans med
sidorna. AI-kostnad flyttar in som ett mätvärde på Drift.

**Vad som återanvänds ur gamla admin.** Tre rutter behålls som logik och
flyttas bakom den nya auth-helpern: `stripe-revenue` (pagineringsmönstret
mot Stripe är korrekt), `email-stats` (SQL-aggregeringen är rätt så länge
`event_type` läses utan prefix) och `pricing/sync`. Allt annat under
`src/app/admin/**` och `src/components/admin/**` raderas i våg 1. Vyerna
`admin_candidate_pool`, `admin_candidate_interests`, `admin_test_stats`,
`admin_retention_cohorts`, `admin_activity_feed`, `admin_activity_daily` och
`admin_activity_by_function` behålls och fortsätter användas.

## 3. Informationsarkitektur

Nio sidor. Sidomenyn grupperar dem i tre block: de fem frågorna, innehållet,
inställningarna.

| Sida | Rutt | Svarar på |
|---|---|---|
| Översikt | `/admin` | Alla fem frågorna, en sektion var, inget mer |
| Intäkter | `/admin/intakter` | Fråga 1: MRR, nya betalande, churn, plan-mix, trial till betalt, misslyckade betalningar, kuponger |
| Trafik | `/admin/trafik` | Fråga 2: GSC-klick, visningar, CTR, position, toppsidor, toppord, sidor som tappar |
| Användare | `/admin/anvandare` och `/admin/anvandare/[id]` | Fråga 3, individnivå: lista med filter, per-användare tidslinje |
| Funnel | `/admin/funnel` | Fråga 3, aggregatnivå: registrering till betalt, per källa, per vecka, funktionsanvändning |
| Mejl | `/admin/mejl` | Fråga 4: per mall och per livscykelsteg, skickade, levererade, öppnade, klick, studs, kön i `email_schedule` |
| Drift | `/admin/drift` | Fråga 5: fel per rutt, hängande jobb, `token_revoked`, kvotträffar, betalväggsträffar, AI-kostnad |
| Innehåll | `/admin/innehall` | CV, brev, mallar, kandidatpool, rekryterare, i flikar |
| Inställningar | `/admin/installningar` | Priser, planer, kupongöversikt, cron-status, admin-användare |

## 4. Per sida: mätvärden, källa, aggregering, cache, diagram

Genomgående: allt serverrenderas. Ingen sida gör en Supabase-fråga från
klienten. Ingen sida läser en råtabell. Cachestrategin är `unstable_cache`
med angiven `revalidate` per sida, plus tabellen `admin_daily_metrics` för
allt som är dagvis historik.

### 4.1 Översikt (`/admin`)

Fem sektioner, en per fråga, i ordningen 1 till 5. Varje sektion är en panel
med tre till fem stora tal och en länk till sin egen sida. Ingen sektion har
mer än ett diagram.

| Mätvärde | Källa | Nivå | Cache |
|---|---|---|---|
| MRR i dag, delta mot i går och mot samma dag förra veckan | `admin_daily_metrics.mrr_ore` | Dag | Tabell, 15 min on-demand |
| Nya betalande i dag och senaste 7 dagarna | `admin_daily_metrics.new_paying` | Dag | Tabell |
| Klick i går, delta mot veckan innan | `admin_daily_metrics.gsc_clicks` | Dag | Tabell |
| Nya konton i dag och 7 dagar | `profiles.created_at` | Dag | 15 min |
| Aktiva användare i dag (unika i `user_activities`) | `user_activities` | Dag | 15 min |
| Mejl skickade och öppnandegrad senaste 7 dagarna | `email_log` join `email_events` | Vecka | 15 min |
| Öppna fel senaste dygnet | `admin_error_log` | Dag | 5 min |

Diagram: ett, en 30-dagarsserie med MRR som linje och nya betalande som
staplar bakom. Inget annat.

Prestandakrav: LCP under 1,5 s. Sidan renderar med data från
`admin_daily_metrics` utan att röra något externt API i kritiska vägen. GSC,
Stripe och PostHog rörs bara av cronen och av on-demand-påfyllningen.

### 4.2 Intäkter (`/admin/intakter`)

| Mätvärde | Källa | Nivå | Anmärkning |
|---|---|---|---|
| MRR och ARR | Stripe `subscriptions` status `active` och `trialing` | Dag | Summa `items.price.unit_amount` normaliserad till månad |
| Nya betalande, per dag | Stripe `checkout.session.completed` speglat i `premium_grants`, plus nya prenumerationer | Dag | `premium_grants` är tom i dag, se datakvalitet |
| Churn, uppsagda per vecka | Stripe `subscriptions` med `canceled_at`, plus `cancel_intents` för orsak | Vecka | 25 av 29 prenumerationer är canceled, historiken finns |
| Fördelning dagspass, vecka, månad, kvartal | Stripe `prices` mot `premium_grants.source` | Vecka | Fyra aktiva priser: 299, 99, 49, 149 |
| Trial till betalt | `profiles.premium_source in ('signup_trial','oauth_signup_trial')` mot senare betalning | Vecka | Reverse trial live 2026-09-11, kräver två veckor |
| Misslyckade betalningar | Stripe `invoices` status `open` och `uncollectible`, `charges` med `failure_code` | Dag | |
| Kuponganvändning | Stripe `coupons.times_redeemed` | Dag | `retention_49_2m` 0 i dag |
| Intäkt per dag, 90 dagar | `admin_daily_metrics.revenue_ore` | Dag | Byggs ur `charges` |

Cache: Stripe-anrop sker i cronen och skrivs till `admin_daily_metrics`.
Sidan läser tabellen. En knapp "Hämta nu" tvingar on-demand-påfyllning av
dagens rad, med 15 minuters spärr.

Stripe-paginering: `subscriptions.list` och `charges.list` måste itereras med
`starting_after` tills `has_more` är false. I dag ryms allt i en sida (29
respektive 48), men koden ska paginera från början.

Diagram: en staplad linje intäkt per dag, en stapel plan-mix per vecka, en
liten vattenfallsrad MRR förra månaden till MRR nu (nytt, expansion, churn).

### 4.3 Trafik (`/admin/trafik`)

| Mätvärde | Källa | Nivå |
|---|---|---|
| Klick, visningar, CTR, snittposition per dag | GSC `searchanalytics` dimension `date` | Dag |
| Toppsidor 50, med delta mot föregående period | GSC dimension `page` | Vecka |
| Toppord 50, med position och delta | GSC dimension `query` | Vecka |
| Sidor som tappar: position försämrad mer än 3 steg eller klick ner mer än 30 procent | Beräknat ur två GSC-perioder | Vecka |
| Landningssida till registrering | PostHog `$pageview` mot `signup_completed` | Vecka |

Cache: GSC har kvot på 1 200 frågor per minut men i praktiken är problemet
svarstiden, inte kvoten. Cronen hämtar fyra frågor per natt (date, page,
query, och föregående period) och skriver toppraderna till
`admin_gsc_daily`. Sidan läser bara tabellen. GSC-data ligger cirka två
dagar efter, och provanropet 2026-09-14 gav bara fem dagar i
30-dagarsfönstret, vilket betyder att luckor är normala och sidan ska visa
"senast med data" i stället för att anta att i går finns.

Diagram: en linje klick och visningar med två y-axlar, en position-linje
inverterad så lägre är högre upp, en tabell för sidor och ord med
tabular-nums.

### 4.4 Användare (`/admin/anvandare`, `/admin/anvandare/[id]`)

Lista: e-post, namn, nivå, källa, skapad, senast aktiv, antal brev, antal
CV, antal ansökningar. Filter på nivå, källa, aktiv senaste 7 eller 30
dagar, och fritext. Serverrenderad paginering, 50 per sida, aldrig hela
tabellen. Källa: `profiles` plus räknare via en ny vy `admin_user_rows`.

Per-användare (`/admin/anvandare/[id]`): profilkort, prenumerationsstatus
med Stripe-länk, aktiveringsmilstolpar, kvotläge, och en tidslinje som slår
ihop `user_activities`, `email_log`, `premium_grants`, `cancel_intents` och
`cv_analysis_jobs` sorterat fallande. Tidslinjen är sidans värde: det är där
frågan "vad gör de?" får ett konkret svar.

Handlingar som behålls: ge premium, ta bort användare, bulkåtgärd. De ligger
kvar i `users/bulk` och `users/[id]` men bakom `requireSuperAdmin`.

Cache: ingen, listan är en direkt fråga med `limit`. Sidan är snabb för att
frågan är liten, inte för att svaret är cachat.

### 4.5 Funnel (`/admin/funnel`)

Tratten, per vecka och per anskaffningskälla:

`$pageview` till `signup_gate_shown` till `signup_started` till
`signup_completed` till första CV eller brev till `paywall_shown` till
`paywall_cta_clicked` till `subscription_paid`.

Källa: PostHog HogQL för de fyra första och de tre sista stegen, Supabase
för mitten (`letters`, `cv_texts`, aktiveringskolumnerna). Anskaffningskälla
från `profiles.acquisition_source`, som i dag är null på alla 311 konton.

Funktionsanvändning: `user_activities.activity_type` per vecka, som en
tabell med de 20 vanligaste plus en rad "används inte" för de
funktionshändelser som finns i koden men saknar rader. Provanropet visade
`page_viewed` 4 124, `test_completed` 71, `letter_created` 17,
`cv_analysis_completed` 3 på 30 dagar. Den listan är själva svaret på "vilka
funktioner används, vilka inte".

Bortfall: per steg, andelen som inte tar nästa steg, med absolut tal bredvid.

Cache: PostHog-frågorna körs i cronen och skrivs till `admin_funnel_weekly`.
On-demand med 15 minuters cache som reserv. PostHog personal API har kvot per
minut och per timme; fyra frågor per natt och en handfull on-demand ligger
långt under.

Diagram: en horisontell trattstapel per vecka, och en linje per steg över
tid. Ingen Sankey.

### 4.6 Mejl (`/admin/mejl`)

| Mätvärde | Källa | Nivå |
|---|---|---|
| Skickade, levererade, öppnade, klick, studs, per mall | `email_log` join `email_events` på `resend_id` | Dag och vecka |
| Samma per livscykelsteg | `email_schedule.email_type` | Vecka |
| Kön: schemalagda framåt, misslyckade försök, `last_error` | `email_schedule` | Nu |
| Veckodigestens effekt: öppnade digest mot session inom 48 timmar | `email_log` `weekly_digest_*` mot `user_activities` | Vecka |
| Studsande adresser | `email_events` `bounced` join `email_log.recipient` | Nu |

Kritiskt för implementationen: `event_type` är `delivered`, `opened`,
`clicked`, `bounced`, utan `email.`-prefix. En fråga som filtrerar på
`email.delivered` returnerar noll och ser ut som ett trasigt system. Skriv
konstanterna en gång i `src/lib/admin/email.ts` och importera dem.

Resends API används inte. Nyckeln är sändbegränsad.

Cache: 15 minuter. Frågorna går mot tabeller på under tusen rader.

Diagram: en stapel per mall med levererat, öppnat och klickat som segment,
och en linje öppnandegrad över tid.

### 4.7 Drift (`/admin/drift`)

| Mätvärde | Källa | Nivå |
|---|---|---|
| Fel per rutt senaste dygnet | Ny tabell `admin_error_log` | Timme |
| Edge-funktioner som fallerar | Supabase edge-loggar, speglat till `admin_error_log` av cronen | Dag |
| Hängande jobb | `cv_analysis_jobs` med status `processing` äldre än 10 minuter | Nu |
| `token_revoked` | Supabase auth-loggar, speglat dagvis | Dag |
| Kvotträffar | `user_activities` `quota_wall_hit` | Dag |
| Betalväggsträffar | PostHog `paywall_shown` per variant och yta | Dag |
| AI-kostnad | `ai_usage_costs.cost_sek` per funktion och dag | Dag |
| Mejl i kö som misslyckats | `email_schedule` med `attempts > 0` | Nu |

Ett driftlarm är en rad, inte ett kort: `StatusRow` med ton `warm` när något
kräver åtgärd. Högst en `warm` per vy enligt designsystemet, så sidan visar
det allvarligaste överst och resten som neutrala rader.

Cache: 5 minuter. Drift är den enda sidan där färskhet går före cache.

### 4.8 Innehåll (`/admin/innehall`)

Fyra flikar som ersätter dagens fem sidor (`cvs`, `letters`,
`ai-documents`, `kandidatpool`, `rekryterare`). Varje flik är en
serverrenderad, paginerad lista med sökfält. Källor: `cv_texts`, `letters`,
mallregistret, `admin_candidate_pool`, `admin_candidate_interests`.
Handlingarna som finns i `recruiters`-rutten behålls.

### 4.9 Inställningar (`/admin/installningar`)

Priser och planer lästa ur Stripe och ur `src/lib/stripe/planPrices.ts`, med
en varning när de inte stämmer överens. Provanropet visade att priset
299 kr har `recurring.interval = month`, inte kvartal, vilket antingen är
ett kvartalspris felkonfigurerat som månad eller ett andra månadspris. Det
ska synas på den här sidan. Kupongöversikt, cron-status (senaste körning,
utfall per delsteg), admin-användare. Prissynk behåller
`api/admin/pricing/sync`. Adminen skriver aldrig till Stripe.

## 5. Datalager

### 5.1 Ny auth-helper

`src/lib/admin/requireSuperAdmin.ts`:

```ts
export async function requireSuperAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; response: NextResponse }
>
```

Läser sessionen på servern, slår mot `admin_users` med `role = 'super_admin'`,
returnerar 401 utan session och 403 utan roll. Varje rutt under
`src/app/api/admin/**` börjar med den. Ingen rutt gör en egen
`admin_users`-fråga efter våg 1.

Layouten `src/app/admin/layout.tsx` blir en server component som kör samma
kontroll och gör `redirect('/')` innan något renderas. Dagens
klientkontroll i `useEffect` tas bort.

### 5.2 Nya tabeller

```sql
-- En rad per dag. Fylls av cron i midnattsslotten, samt on-demand.
create table admin_daily_metrics (
  dag date primary key,
  mrr_ore bigint,
  revenue_ore bigint,
  new_paying int,
  churned int,
  active_subs int,
  trialing_subs int,
  failed_payments int,
  new_accounts int,
  active_users int,
  gsc_clicks int,
  gsc_impressions int,
  gsc_ctr numeric,
  gsc_position numeric,
  emails_sent int,
  emails_opened int,
  ai_cost_sek numeric,
  uppdaterad timestamptz not null default now()
);

-- Topprader per dag och dimension, för Trafik.
create table admin_gsc_daily (
  dag date not null,
  dimension text not null,      -- page eller query
  nyckel text not null,
  clicks int, impressions int, ctr numeric, position numeric,
  primary key (dag, dimension, nyckel)
);

-- Tratten per vecka och källa, för Funnel.
create table admin_funnel_weekly (
  vecka date not null,          -- måndagen
  kalla text not null default 'alla',
  steg text not null,
  antal int not null,
  primary key (vecka, kalla, steg)
);

-- Fel och drifthändelser.
create table admin_error_log (
  id uuid primary key default gen_random_uuid(),
  kalla text not null,          -- route, edge, auth eller cron
  rutt text,
  meddelande text not null,
  antal int not null default 1,
  metadata jsonb,
  created_at timestamptz not null default now()
);
```

RLS: alla fyra tabellerna får `enable row level security` och **noll
policies**. De skrivs och läses uteslutande av service role, precis som
`email_log`, `email_events`, `email_schedule` och `cancel_intents` redan
gör i dag. Det är den säkraste formen: utan policy kommer varken `anon` eller
`authenticated` åt en rad.

### 5.3 Ny vy

`admin_user_rows`: en rad per profil med räknare för brev, CV, ansökningar,
analyser och senaste aktivitet, så att användarlistan blir en fråga i
stället för sex. Skapas utan `security_definer` och får
`revoke select from anon, authenticated`, så den bara nås via service role.

Samma revoke ska läggas på de befintliga vyerna `admin_candidate_pool`,
`admin_retention_cohorts`, `admin_test_stats`, `admin_activity_feed`,
`admin_activity_daily`, `admin_activity_by_function` och
`admin_candidate_interests`: i dag har rollen `authenticated` select-rätt på
dem, vilket betyder att vilken inloggad användare som helst kan läsa
kandidatpoolen och retentionskohorterna. Det är den allvarligaste
säkerhetsbristen i den här inventeringen och åtgärdas i våg 1.

### 5.4 Nya API-rutter

Alla under `src/app/api/admin/`, alla med `requireSuperAdmin` som första
rad, alla svarar med färdiga aggregat och aldrig med råtabeller.

| Rutt | Ger |
|---|---|
| `oversikt` | De fem sektionernas tal på Översikt |
| `intakter` | MRR, churn, plan-mix, trial, misslyckade, kuponger |
| `trafik` | GSC-serier, toppsidor, toppord, tappare |
| `anvandare` | Paginerad lista med filter |
| `anvandare/[id]/tidslinje` | Sammanslagen tidslinje |
| `funnel` | Tratt per vecka och källa, funktionsanvändning |
| `mejl` | Per mall, per livscykelsteg, kö, studsar |
| `drift` | Fel, hängande jobb, kvot, betalvägg, AI-kostnad |
| `metrics/refresh` | On-demand påfyllning av dagens rad, 15 min spärr |

Rutter som raderas: hela `statistics/**` (fem rutter), `openai-usage`,
`cleanup`, `email/campaign-gratisniva`. Rutter som behålls och flyttas bakom
helpern: `stripe-revenue`, `email-stats`, `pricing`, `pricing/sync`,
`recruiters`, `users/bulk`, `users/[id]`, `email/campaign`.

### 5.5 Datainsamling i cronen

I `/api/cron/pricing-sync`, midnattsslotten, efter befintliga steg, ett nytt
block `collectAdminMetrics(supabaseAdmin)` i `src/lib/admin/collect.ts`.
Ordning: Stripe (paginerat), GSC (fyra frågor), PostHog (fyra HogQL-frågor),
Supabase-aggregaten, skriv en rad i `admin_daily_metrics` plus rader i
`admin_gsc_daily` och `admin_funnel_weekly`. Varje delsteg fångar sitt eget
fel och skriver till `admin_error_log` utan att stoppa de övriga. Cronens
svar utökas med `adminMetrics`.

Backfyllning: ett engångsskript `scripts/admin-backfill.ts` som fyller 90
dagar bakåt ur Stripe, GSC och Supabase. GSC ger bara vad Google har kvar,
och provanropet visade luckor, så tomma dagar ska skrivas som null och inte
som noll.

## 6. Designspec för Opus

Adminen är Tråden. Läs `docs/designsystem.md` innan första raden kod. Inga
undantag för att det är en interninsida.

**Skal.** `src/components/admin/AdminShell.tsx`: sidomeny i `bg-panel` med
`border-kant`, aktiv rad med `.thread-row`, topprad med sidnamn och
periodväljare. Huvudytan är `bg-mark`. Inget eget bakgrundsval i sidorna.
Sidomenyn har tre grupper med `text-steg uppercase text-ink-3` som
gruppetikett.

**`PageHeader`** från `src/components/shell/` är sidans enda h1. Bygg ingen
egen admin-header.

**`MetricCard` byggs om från grunden** i `src/components/admin/MetricCard.tsx`
på Tråden-tokens:

```tsx
<div className="rounded-xl border border-kant bg-panel p-4">
  <div className="text-sm font-medium text-ink-3">{etikett}</div>
  <div className="mt-1 text-tal tabular-nums text-ink-1">{varde}</div>
  <div className="mt-1 text-meta text-ink-3">
    <span className={delta >= 0 ? 'text-positiv' : 'text-fel'}>{deltaText}</span> {jamforelse}
  </div>
</div>
```

Ingen ikon i kortet. Ingen färgad ikonruta. Dagens `iconClass`-mönster med
`bg-amber-50`, `bg-slate-100` och `bg-indigo-50` är borta. Delta är text
med `text-positiv` eller `text-fel`, aldrig en pil i en färgad platta.

**`SectionCard` byggs om** till en panel med etikettrubrik enligt
designsystemet avsnitt 6: `<h2 className="text-sm font-medium text-ink-3">`
över panelen, inte en fet rubrik inuti den.

**Diagrampalett.** Recharts, lazy-laddad som i dashboarden. Färger läses ur
CSS-variabler, aldrig som hex i komponenten:

| Roll | Variabel |
|---|---|
| Primär serie | `var(--ink-1)` |
| Sekundär serie | `var(--kant-stark)` |
| Framhävd serie, högst en per diagram | `var(--accent)` |
| Positivt utfall | `var(--positiv)` |
| Varning | `var(--varning)` |
| Fel | `var(--fel)` |
| Rutnät | `var(--kant)` |
| Axeltext | `var(--ink-3)`, 12 px |

Inga gradientfyllningar. Inga `boxShadow` i tooltips: tooltip är
`bg-panel border border-kant rounded-lg` med `shadow-svav`, eftersom den
svävar. Staplar `radius={[4,4,0,0]}`, linjer `strokeWidth={2}`, inga
prickar utom på hover. Ett diagram per sektion.

**Tabeller.** `bg-panel`, `border-kant`, rader med `divide-y divide-kant`,
cellpadding `px-4 py-3`, alla tal i `tabular-nums`, rubrikrad i
`text-sm font-medium text-ink-3`. Breda tabeller får egen
`overflow-x-auto`. Sorterbara kolumner markeras med chevron i ink-2, aldrig
med färg.

**Tillstånd.** Laddning är `LoadingSkeleton`, aldrig `animate-pulse`. Tom
lista är `EmptyState`. Fel är `FlowError`. Ett skelett får aldrig ligga
kvar.

**Orange.** Högst tre orange inslag per skärm, precis som i appen. På
Översikt är det tråden i sidomenyn, den framhävda serien i diagrammet, och
ingenting mer. Ingen `MarginPlate` i adminen: det finns inget framhävt val
att peka på.

**Grep efter varje sida**, förväntat noll träffar i dina filer:

```bash
grep -rnE "bg-orange-|bg-amber-|from-orange|to-orange|bg-gradient|shadow-(sm|md|lg|xl|2xl)|drop-shadow|rounded-(2xl|3xl)|font-(bold|extrabold|black)|framer-motion|Sparkles|text-orange-[0-9]|border-orange|ring-orange|bg-white\b|bg-gray-|text-gray-|border-gray-|text-slate|bg-slate|border-slate|animate-pulse" src/app/admin src/components/admin --include=*.tsx
```

## 7. Vågor och tidsuppskattning

Kalibrering: en sidgrupp i inloggat läge tog cirka 1 till 2 timmar per
Opus-agent. Adminsidor är enklare i UI men tyngre i datalager, så
uppskattningen ligger i övre halvan.

**Våg 1, grund. En agent, sekventiellt. 3 timmar.**
Filägarskap: `src/lib/admin/**`, `src/app/admin/layout.tsx`,
migrationerna, `src/components/admin/AdminShell.tsx`, `MetricCard.tsx`,
`SectionCard.tsx`, `AdminChart.tsx`.

1. Radera `src/app/admin/**` utom `layout.tsx`, radera
   `src/components/admin/**` i sin helhet, radera
   `src/app/api/admin/statistics/**`, `openai-usage`, `cleanup`,
   `email/campaign-gratisniva`.
2. `requireSuperAdmin.ts`, och flytta de sju behållna rutterna bakom den.
3. Migration: fyra nya tabeller med RLS och noll policies, vyn
   `admin_user_rows`, och `revoke select on ... from anon, authenticated`
   på de sju befintliga admin-vyerna.
4. `AdminShell`, `MetricCard`, `SectionCard`, `AdminChart` på Tråden-tokens.
5. `src/lib/admin/collect.ts` plus inhakningen i cronen, och
   `scripts/admin-backfill.ts`.

Våg 1 måste vara klar och pushad innan våg 2 startar. Alla efterföljande
agenter importerar dess komponenter och får aldrig ändra dem: saknas en
prop, löser agenten det lokalt i sidan och skriver upp det i rapporten.

**Våg 2, de fem frågorna. Fyra agenter parallellt. 8 agenttimmar.**

| Agent | Äger | Tid |
|---|---|---|
| A | `src/app/admin/page.tsx` (Översikt) och `api/admin/oversikt` | 2 h |
| B | `src/app/admin/intakter/**` och `api/admin/intakter` | 2 h |
| C | `src/app/admin/trafik/**`, `src/app/admin/mejl/**`, `api/admin/trafik`, `api/admin/mejl` | 2,5 h |
| D | `src/app/admin/funnel/**`, `src/app/admin/drift/**`, `api/admin/funnel`, `api/admin/drift` | 2,5 h |

**Våg 3, resten. Två agenter parallellt. 4 agenttimmar.**

| Agent | Äger | Tid |
|---|---|---|
| E | `src/app/admin/anvandare/**` och de två rutterna | 2 h |
| F | `src/app/admin/innehall/**`, `src/app/admin/installningar/**` | 2 h |

**Våg 4, validering. 1,5 timmar.**
`npx tsc --noEmit`, grep-regeln per sida, `npm run build`, mätning med ett
adminspår i `scripts/perf-inloggat.ts`, och klicktest i riktig webbläsare
enligt ägarens krav (Pixel 7 plus desktop, skärmdump per sida). Fable-agenter
används här för granskning av text och design, inte för byggandet.

**Totalt: 16,5 agenttimmar**, varav 3 sekventiellt i våg 1, 8 parallellt i
våg 2 (cirka 2,5 timmar väggklocka), 4 parallellt i våg 3 (cirka 2 timmar)
och 1,5 i våg 4. Väggklocka cirka 9 timmar.

## 8. Risker

**GSC-luckor och fördröjning.** Datan ligger två dagar efter och
provanropet 2026-09-14 gav bara 5 dagar med rader i ett 30-dagarsfönster.
Adminen ska visa "senast med data" och skriva null, aldrig noll, för dagar
utan svar. Ett noll ser ut som ett ras.

**Stripe-paginering.** 29 prenumerationer och 48 debiteringar ryms i en
sida i dag, vilket döljer buggen tills volymen växer. Paginera med
`starting_after` från första raden kod.

**PostHog-kvot.** Personal API har kvot per minut och per timme. Fyra
frågor per natt plus on-demand med 15 minuters spärr ligger långt under.
Bygg aldrig en sida som kör en HogQL-fråga per sidladdning.

**Cron-taket.** Vercel tillåter två crons och båda är tagna av
pricing-sync. Metrikinsamlingen måste in i midnattsslotten. Lägg aldrig en
tredje post i `vercel.json`: deployen går igenom och cronen körs inte.

**Cronen blir lång.** Midnattsslotten gör redan fyra jobb, och
`maxDuration` är 60 sekunder. Insamlingen ska ha egen timeout per delsteg
(10 sekunder), fånga sitt fel och låta resten fortsätta. Om totaltiden
närmar sig taket flyttas GSC och PostHog till 06:00-slotten.

**Mätfelen i aktiveringsdatan.** `first_*_at` och `acquisition_source` är
obrukbara i dag. Varje tal som bygger på dem får en datakvalitetsnot i
gränssnittet tills fixen är live plus två veckor. Skriv inte om koden som
sätter dem inom det här projektet: det är ett eget ärende.

**Premium_grants är tom.** Noll rader trots att engångsköp finns i Stripe.
Antingen har ingen köpt ett engångspaket sedan 2026-09-11, eller så skriver
inte webhooken. Det ska verifieras innan Intäkter litar på tabellen som
källa för nya betalande; till dess är Stripe primärkälla och
`premium_grants` en kontroll.

## 9. Mätning av om adminen lyckats

Ägaren använder den dagligen. Två hårda krav, inget annat:

1. Varje sida laddar under 1,5 s, mätt med `scripts/perf-inloggat.ts` på
   Pixel 7-emulering, median av tre. CLS 0.
2. De fem frågorna går att besvara från Översikt utan att klicka vidare, på
   under en minut.

Ingen PWA. Ingen mobilanpassning utöver att sidorna inte får ha horisontell
body-scroll: adminen används på desktop.

## 10. Kvar till ägaren

Bara två saker, och båda kan vänta till efter bygget.

1. **Priset 299 kr har `recurring.interval = month` i Stripe.** Enligt
   prisstegen ska kvartal vara 299 kr per kvartal. Antingen är produkten
   felkonfigurerad eller så är det ett andra månadspris. Adminen kommer
   visa avvikelsen; rättningen i Stripe är ägarens, eftersom vi aldrig
   skriver till Stripe.
2. **`RESEND_WEBHOOK_SECRET` och spårning.** Webhooken finns och skriver,
   men fungerar bara om hemligheten är satt i Vercel och om open- och
   click-tracking är på för domänen. Siffrorna tyder på att det fungerar
   (115 öppningar på kampanjen). Bekräfta att det är påslaget, annars
   slutar Mejl-sidan svara utan att något ser trasigt ut.
## Våg 1 levererat

Byggt 2026-09-14 på branchen `admin/ny`. Fem commits, ett steg var. Det här
avsnittet är kontraktet: våg 2 och 3 importerar det som står här och ändrar
aldrig filerna. Saknas en prop, lös det lokalt i sidan och skriv upp det i
rapporten.

### Vad som raderades

Hela `src/components/admin/**` (23 filer), alla sidor under `src/app/admin/**`
utom `layout.tsx` (16 filer), samt API-rutterna `statistics/**` (fem),
`openai-usage`, `cleanup` och `email/campaign-gratisniva`. Ingenting utanför
admin importerade något av det. E-postmallen
`src/lib/email/lifecycle/templates/campaign-gratisniva.ts` ligger kvar och
används fortfarande av lifecycle-registret: det var API-rutten som skulle bort,
inte mallen.

### Auth

`src/lib/admin/requireSuperAdmin.ts`:

```ts
type SuperAdminResult =
  | { ok: true; userId: string; email: string | null }
  | { ok: false; response: NextResponse }

requireSuperAdmin(): Promise<SuperAdminResult>   // för API-rutter
getSuperAdminUserId(): Promise<string | null>    // för server components
hasSuperAdminRole(userId: string): Promise<boolean>
ADMIN_ROLE === 'super_admin'
```

Varje ny rutt under `src/app/api/admin/**` börjar med:

```ts
const auth = await requireSuperAdmin();
if (!auth.ok) return auth.response;
```

Rollen läses med service role, så kontrollen fungerar även när `admin_users`
är RLS-låst. 401 utan session, 403 utan rollen. Ingen rutt gör en egen
`admin_users`-fråga, och de sju behållna rutterna gör det inte längre heller.
Fem av dem kontrollerade tidigare bara att raden fanns, inte att rollen var
`super_admin`.

`src/app/admin/layout.tsx` är en server component med
`export const dynamic = 'force-dynamic'` som redirectar till `/dashboard`.
Skriv aldrig en behörighetskontroll i `useEffect` i en adminsida.

### Tabeller

`admin_daily_metrics`, primärnyckel `dag` (date). Kolumner: `mrr_ore`,
`revenue_ore` (bigint), `new_paying`, `churned`, `active_subs`,
`trialing_subs`, `failed_payments`, `new_accounts`, `active_users`,
`gsc_clicks`, `gsc_impressions`, `emails_sent`, `emails_opened` (int),
`gsc_ctr`, `gsc_position`, `ai_cost_sek` (numeric), `uppdaterad` (timestamptz).
**Alla tal är nullbara med flit.** En dag utan GSC-svar har null, inte noll.
Rita aldrig en null som en nolla i ett diagram: `AdminChart` har
`connectNulls={false}` just därför.

`admin_gsc_daily`, primärnyckel `(dag, dimension, nyckel)`. `dimension` är
`page` eller `query`. Kolumner `clicks`, `impressions` (int), `ctr`,
`position` (numeric).

`admin_funnel_weekly`, primärnyckel `(vecka, kalla, steg)`. `vecka` är
måndagen, `kalla` är `'alla'` tills `acquisition_source` går att lita på,
`steg` är ett av `FUNNEL_STEG` i `collect.ts`.

`admin_error_log`: `id`, `kalla` (route, edge, auth eller cron), `rutt`,
`meddelande`, `antal`, `metadata` (jsonb), `created_at`.

Alla fyra har RLS på och **noll policies**. De nås bara med service role,
alltså `getSupabaseAdmin()`. En sida som försöker läsa dem med användarens
klient får noll rader utan felmeddelande.

### Vyn

`admin_user_rows`, en rad per profil, 311 i dag. Ger `id`, `email`,
`full_name`, `created_at`, `last_active`, `subscription_tier`,
`subscription_status`, `premium_until`, `premium_source`,
`acquisition_source`, `stripe_customer_id`, `first_cv_uploaded_at`,
`first_letter_created_at`, `first_cv_analyzed_at`, plus räknarna
`letter_count`, `cv_count`, `application_count`, `analysis_count` (int) och
`last_activity_at` (timestamptz). Användarlistan blir en fråga, inte sex.

Kom ihåg mätfelen: `first_cv_uploaded_at` och `first_letter_created_at` är
satta på 2 av 311 konton och `acquisition_source` är null på samtliga. Visa
talen, men sätt `datakvalitet` på kortet.

### Säkerhetsrättningen

`revoke` körd på `admin_user_rows` och på de sju befintliga admin-vyerna.
Hålet var värre än inventeringen trodde: förutom att `authenticated` hade
select på kandidatpoolen och retentionskohorterna hade både `anon` och
`authenticated` insert, update, delete och truncate på `admin_activity_daily`
och `admin_activity_by_function`. Verifierat med `set role authenticated` att
alla tolv nu nekas. Läs dem bara med service role.

### PostHog-händelserna, utrett i våg 4

Funnel-agenten fann noll rader för `paywall_shown`, `paywall_cta_clicked` och
alla `match_*` de senaste 30 dagarna, och bara en `pwa_prompt_shown`. Slutsatsen
löd att spårningen var trasig. Den var den inte.

**Händelserna gick live samma dag som de granskades.** `match_*` kom i
`7d8573d7` (2026-09-14 09:46), `pwa_prompt_shown` i `b154cdd8` (14:13) och
betalväggsparet i `6e4e1c85` (16:47). Ett trettiodagarsfönster över kod som är
timmar gammal ger noll rader oavsett hur väl den fungerar. `/dashboard/jobbmatchning`
har dessutom noll sidvisningar i PostHog: ingen har varit där än.

**Verifierat i produktion.** Ett QA-konto loggades in på
`https://www.jobbcoach.ai/dashboard/jobbmatchning`. `match_page_viewed` kom
in i PostHog inom en minut, med användarens id som `distinct_id`, följt av
`$identify`, `$pageview` och `$web_vitals` på nästa sida. Klienten,
kön i `src/lib/analytics/events.ts`, EU-värden `eu.i.posthog.com` och
identifieringen fungerar alltså hela vägen.

**Ingen samtyckesspärr finns.** `PostHogProvider` initierar utan villkor efter
LCP. Det finns ingen cookie-gate i mätvägen, så den hypotesen är avskriven.

**Fällan för framtida QA:** PostHog filtrerar bort klienter där
`navigator.webdriver` är sant, alltså varje Puppeteer-session. Det syns inte
som ett fel: `posthog.capture()` returnerar utan att kasta, men ingen POST
lämnar sidan. Ett QA-skript som ska mäta händelser måste därför köra med
`--disable-blink-features=AutomationControlled` och maskera flaggan:

```ts
await page.evaluateOnNewDocument(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
})
```

Utan det ser en fungerande mätning ut som en trasig, vilket är precis det
misstag den här utredningen började med.

### is_admin() ur de sju vyerna (våg 4)

Fem av de behållna vyerna hade `where is_admin()` i sin definition:
`admin_activity_feed` (och därmed `admin_activity_daily` och
`admin_activity_by_function` som ligger ovanpå den),
`admin_candidate_interests`, `admin_candidate_pool`,
`admin_retention_cohorts` och `admin_test_stats`. Adminen läser dem med
service role, som inte har någon JWT, så villkoret var alltid falskt och alla
sju gav noll rader utan felmeddelande. Innehålls kandidatpool var tom av den
anledningen, och Funnel hade byggt om kohorträkningen i TypeScript för att
komma runt det.

Villkoret är borta. Skyddet ligger i grants, där det hör hemma: alla åtta
`admin_*`-vyer har bara `select` till `service_role`, och `anon` och
`authenticated` är revoke:ade. Verifierat med `has_table_privilege` över alla
sexton kombinationer efter migrationen. Varje vy har `security_invoker = true`,
så underliggande RLS utvärderas som den anropande rollen.

Funnel läser `admin_retention_cohorts` igen. Den lokala räkningen hade en
gräns på 50 000 aktivitetsrader som hade börjat ljuga tyst så snart
`user_activities` växte förbi den.

### Läsvägen för våg 2 och 3

`src/lib/admin/metrics.ts`:

```ts
hamtaDagligaMetrik(antalDagar = 30): Promise<DagligaMetrik[]>  // fallande, senaste först
hamtaDag(dag: string): Promise<DagligaMetrik | null>
fyllPaDag(dag?: string, tvinga?: boolean): Promise<PafyllResultat>
ADMIN_METRICS_TAG = 'admin-metrics'
ADMIN_CACHE_SEKUNDER = 900
```

De två första är `unstable_cache` med 15 minuters revalidate och taggen ovan.
`fyllPaDag` har 15 minuters spärr per dag och rensar taggen efteråt; den är
motorn bakom knappen "Hämta nu" och rutten `metrics/refresh`.

**Ingen sida får prata direkt med Stripe, GSC eller PostHog i kritiska
vägen.** En HogQL-fråga per sidladdning spränger PostHogs kvot, och ett
Stripe-anrop gör LCP under 1,5 s omöjligt. Läs tabellen.

`src/lib/admin/email.ts` har `EMAIL_EVENT` (`DELIVERED`, `OPENED`, `CLICKED`,
`BOUNCED`, alla utan `email.`-prefix), `EMAIL_EVENT_TYPES` och
`EMAIL_JOIN_KEY`. Importera dem, skriv aldrig strängen i en fråga.

### Insamlingen

`src/lib/admin/collect.ts` exporterar utöver `collectAdminMetrics`:
`manadsbeloppOre`, `mrrOreFranSubscriptions`, `dagStr`, `veckansMandag`,
`hogql`, `loggaAdminFel`, `FUNNEL_STEG`, samt delstegen `samlaStripe`,
`samlaGsc`, `samlaFunnel`, `samlaSupabase`.

```ts
collectAdminMetrics(admin, dag?, { hoppaGsc?, hoppaPosthog? }): Promise<CollectResultat>
loggaAdminFel(admin, kalla, meddelande, metadata?): Promise<void>
```

`loggaAdminFel` är det Drift-sidan ska läsa och det nya rutter ska skriva till
när de fallerar.

Kör inte insamlingen från en ny cron. Båda Vercel-crons är upptagna av
`/api/cron/pricing-sync` och en tredje post i `vercel.json` deployar men körs
aldrig. Inhakningen ligger i midnattsslotten och samlar in gårdagen.

`scripts/admin-backfill.ts` fyller bakåt:
`npx tsx scripts/admin-backfill.ts [dagar] [--hoppa-gsc] [--hoppa-posthog]`.

Körd skarpt 2026-09-14: 90 av 90 dagar skrivna, noll misslyckade, noll rader i
`admin_error_log`. 88 av 90 dagar har GSC-data; de två som saknas är de
senaste, alltså fördröjningen. 8 800 rader i `admin_gsc_daily`, 98 i
`admin_funnel_weekly`. MRR 596 kr, 3 aktiva och 1 trialing, vilket stämmer med
provanropet i avsnitt 1.

**En sak om MRR-serien:** Stripe har ingen historisk MRR, så varje backfylld
dag fick dagens värde. De första nittio dagarna är därför en rak linje. Från
och med nu är serien sann. Skriv det i gränssnittet om ni ritar den över hela
fönstret.

### Komponenter

Alla i `src/components/admin/`. Ändra dem inte.

**`AdminShell { children, toolbar? }`** (klientkomponent, används av layouten,
inte av sidorna). Exporterar även `ADMIN_NAV` och
`isActiveAdminRoute(pathname, href)`. Lägg till en sida genom att lägga den i
`ADMIN_NAV`. `toolbar` är platsen för periodväljaren i toppraden.

**`MetricCard { etikett, varde, delta?, deltaText?, jamforelse?, inverterad?, andraJamforelse?, datakvalitet?, className? }`**
(serverkomponent). `varde` är en ReactNode som redan är formaterad: kortet
formaterar aldrig själv, eftersom en krona, en procent och ett antal skrivs
olika. `delta` är ett tal; positivt ger `text-positiv`, negativt `text-fel`.
`inverterad` vänder färgen för tal där högre är sämre (churn, misslyckade
betalningar). `andraJamforelse` är en andra meta-rad för en andra jämförelse,
till exempel förra veckan under i går. `datakvalitet` är meta-raden för tal som
bygger på `first_*_at` och `acquisition_source`. De två ska inte blandas ihop:
den ena säger att talet rört sig, den andra att talet inte går att lita på.

**`SectionCard { rubrik, action?, children, naken?, className? }`**
(serverkomponent). Rubriken står ovanför panelen som etikett i 14/500 ink-3.
`action` är en textlänk till höger. `naken` tar bort panelens padding, för
listor med `divide-y` och för tabeller som sätter sin egen cellpadding.

**`AdminChart { data, xNyckel, serier, hojd?, yAxisWidth?, formateraX?, formateraY?, tomText?, className? }`**
(klientkomponent, `'use client'` krävs i den som renderar den).

`yAxisWidth` är y-axelns bredd i pixlar, standard 56. Höj den när etiketterna
bär en enhet: `600 kr` i tolv pixlars grad behöver 72. Komponenten har ingen
negativ `margin.left` längre. Den drog in axeln under plotytan och klippte
etiketten från vänster, så `600 kr` lästes som `00 kr`, och två sidor hade
byggt varsin lokal kortning runt det.

```ts
type AdminSerieRoll = 'primar' | 'sekundar' | 'framhavd' | 'positiv' | 'varning' | 'fel'
interface AdminSerie { nyckel: string; namn: string; typ: 'linje' | 'stapel'; roll: AdminSerieRoll }
```

Recharts laddas lazy i ett stycke via `AdminChartInner`. Höjden står på
behållaren, så ytan är reserverad innan biblioteket kommer in och CLS blir
noll. Färgen kommer ur rollen, aldrig ur ordningen, och läses ur
CSS-variabler. Högst en `framhavd` per diagram: den är orange och räknas mot
taket på tre orange inslag per skärm, där tråden i sidomenyn redan tagit ett.

Tom `data` ger `tomText` i rätt höjd, så sidan behöver ingen egen tomkontroll
runt diagrammet.

**`AdminChart tar medvetet inte två y-axlar.`** Avsnitt 4.3 beskriver klick
och visningar med varsin axel. Två skalor i samma ruta låter linjerna korsa
varandra på ställen som inte betyder något, och det är den vanligaste
diagramfällan som finns. Rita två diagram under varandra, eller indexera båda
mot samma bas. Samma sak gäller den inverterade positionslinjen: den blir ett
eget diagram.

Sidhuvudet är `PageHeader` från `src/components/shell/`, adminens enda h1.
Bygg ingen egen. Laddning är `LoadingSkeleton`, tomt är `EmptyState`, fel är
`FlowError`.

### Verifiering

`npx tsc --noEmit` rent. `npx vitest run` 188 tester i 17 filer, varav 27 nya
för adminen (8 för `requireSuperAdmin`, 19 för `collect` med tyngdpunkt på
MRR-normaliseringen). `npm run build` med
`NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` går igenom, `/admin` är
dynamisk och exakt de sju behållna API-rutterna finns kvar. Grep-regeln i
avsnitt 6 ger noll träffar i `src/app/admin` och `src/components/admin`, och
det finns inga em-dash i någon adminfil.

Kvar till våg 4: klicktest i riktig webbläsare, som kräver sidor att klicka på.
