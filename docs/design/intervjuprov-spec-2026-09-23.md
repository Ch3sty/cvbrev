# Intervjuprovet: överlämning till bygget

Design: `docs/design/intervjuprov-2026-09-23.html` (godkänns av ägaren före bygge).
Bakgrund: `docs/rapporter/analys-seo-tillvaxt-2026-09-23.html`, åtgärd 8.
Förebild: testprovet i `src/app/(public)/verktyg/rekryteringstester/prova/ProvaFlow.tsx`
och brevprovets gate i `src/app/(public)/skapa-brev/start/StartFlow.tsx` (DraftGate).
Datum: 2026-09-23. Bygg med Opus. Inget i `src/` är ändrat av designen.

## 1. Vad som byggs

En panel i artikelns löptext där besökaren skriver sitt svar på en intervjufråga,
får en kort bedömning direkt (nivå 1 till 5 med en mening, det som fungerar, det
som saknas) och möter registreringsspärren före den fullständiga återkopplingen
och ett omskrivet svar. Samma tratt som testprovet: `sample_started`,
`sample_completed`, `signup_gate_shown` med `kind: 'interview'`.

Två frågor, en per artikel:

| id | Artikel | Fråga |
|---|---|---|
| `styrkor` | `content/artiklar/styrkor-svagheter-intervju.mdx` | "Vilka är dina styrkor och svagheter?" |
| `star` | `content/artiklar/kompetensbaserad-intervju-star-metoden.mdx` | "Berätta om en gång då du löste ett problem som ingen annan tog tag i." |

## 2. Filer

Nya:

| Fil | Innehåll |
|---|---|
| `src/components/artiklar/intervjuprov/Intervjuprov.tsx` | Klientkomponenten, alla fem tillstånd. `'use client'`. |
| `src/components/artiklar/intervjuprov/intervjuprov-copy.ts` | Alla strängar ur copytabellen i designfilen, avsnitt "Slutcopy". Inga strängar inline i komponenten. |
| `src/components/artiklar/intervjuprov/fragor.ts` | `FRAGOR: Record<FragaId, { text, platshallare, tips, promptFokus }>`. `FragaId = 'styrkor' \| 'star'`. |
| `src/lib/intervju/bedomning.ts` | Serverfunktion `bedomIntervjusvar(fraga, svar)`: prompt, JSON-schema, anrop via `generateJSON`, nivåetikett ur talet. |
| `src/app/api/public/intervjuprov/route.ts` | POST: validering, kvot, bedömning, lagring, synligt svar. |
| `src/app/api/public/intervjuprov/claim/route.ts` | POST `{ token }`: kopplar raden till det nya kontot, returnerar `redirect`. |
| `src/app/dashboard/intervju/[id]/page.tsx` | Serverrenderad sida: frågan, svaret, hela återkopplingen, det omskrivna svaret, länk till Jobbcoachen. Se beslut 1. |
| `supabase/migrations/<datum>_intervjuprov.sql` | Tabellen `anon_interview_samples`, se avsnitt 6. |

Ändrade:

| Fil | Ändring |
|---|---|
| `src/lib/analytics/events.ts` | `'interview'` läggs till i `kind`-unionen för `sample_started`, `sample_completed`, `signup_gate_shown`, `draft_claimed`. Ny valfri egenskap `question?: 'styrkor' \| 'star'` på de tre sample-eventen, `level?: number` på `sample_completed`. |
| `src/lib/letters/claim-draft-client.ts` | `storePendingIntervju(token)`, `claimPendingIntervju()` med nyckel `jc_pending_intervju` och URL-parametern `intervju`, samma mönster som `claimPendingTestSession`. |
| `src/components/auth/register-form.tsx` rad 174 | `\|\| (await claimPendingIntervju())` sist i kedjan. |
| `src/app/(public)/artiklar/[slug]/page.tsx` ~rad 392 | `Intervjuprov: (p) => <Intervjuprov {...p} slug={slug} />` i `components`. |
| `src/lib/quota/quotaService.ts` | `DAILY_LIMIT_INTERVIEW_SAMPLES = 1` och `checkDailyInterviewQuota(supabase, userId)`, se avsnitt 6. |
| `src/app/admin/tratt/funnel-data.ts` | `interview` som eget kluster i sample-tratten, om tratten filtrerar på `kind`. |
| `content/artiklar/styrkor-svagheter-intervju.mdx` | `<Intervjuprov fraga="styrkor" />` direkt efter listblocket (svagheter lista, dåliga egenskaper, utvecklingsbara sidor). En annan agent lägger in listblocket just nu: lägg provet efter det blocket, före `## Så väljer du rätt styrkor och svagheter för just din roll`. Finns blocket inte när ni bygger, lägg provet före samma h2 och skriv en rad i bygg-noterna. |
| `content/artiklar/kompetensbaserad-intervju-star-metoden.mdx` | `<Intervjuprov fraga="star" />` efter avsnittet `## Ett färdigt STAR-svar från början till slut`, före `## Så förbereder du dina STAR-historier`. |

Inget ändras i `ProvaFlow.tsx` eller `StartFlow.tsx`. Spärrkortet återanvänds som mönster
(samma layout, samma villkorsrad, samma `IlluBlurGate`), inte som delad komponent:
de två befintliga gaterna är inline i sina flöden och står dessutom kvar i den gamla
tokenuppsättningen (`neutral-*`, `orange-600`). Se beslut 4.

## 3. Komponent-API

```tsx
interface IntervjuprovProps {
  fraga: 'styrkor' | 'star'
  /** Artikelns slug, för source_page och slug i eventen. Sätts av page.tsx. */
  slug?: string
}
export default function Intervjuprov(props: IntervjuprovProps)
```

Rot: `<aside className="not-prose my-8 rounded-xl border border-kant bg-panel p-4 sm:p-6" aria-labelledby={rubrikId}>`.
Rubriken är `<p>` i `font-display text-[22px] font-bold leading-7 tracking-[-0.02em]`,
aldrig h2 eller h3 (SEO-spärrlistan punkt 3 i `docs/design/analys-artiklar-2026-09-23.html`).

Tillstånd (`type Phase = 'inbjudan' | 'skriver' | 'laddar' | 'resultat'` plus `fel: FelTyp | null`):

| Tillstånd | Vad som visas | Detaljer |
|---|---|---|
| inbjudan | eyebrow, rubrik, ingress, fråga som citat, fält, metarad, knapp, fotnot | Serverrenderas med samma markup som klienten hydrerar till. |
| skriver | som inbjudan utan ingressen, räknare, tipsrad | Ingressen fälls bort vid första tecknet. Tipsraden: fyra chips för `star`, en mening för `styrkor`. |
| laddar | fältet i `text-ink-3` och `readOnly`, knappen ersatt av `LoadingSkeleton variant="writing" label="Vi läser ditt svar som en rekryterare" meta="Brukar ta under tio sekunder."` | Efter 20 s byts meta till "Tar lite längre än vanligt, vi är kvar." |
| resultat | eyebrow "Din bedömning", talet i `text-tal-display`, femsegmentsmätare i `bg-ink-1`/`bg-insunken`, meningen i `text-varde`, två punkter, två låsta block med platshållarrader, sr-only-mening, spärrkortet under panelen | Fokus flyttas till eyebrow (`tabIndex={-1}`). Panelen har `aria-live="polite"`. |
| fel | felraden (`FlowError`) under metaraden, eller statusraden (`StatusRow`) vid kvot | Fältet behåller alltid texten. |

Fältet: `<textarea>` med `h-11`-familjens fältstil ur designsystemet avsnitt 6 ("Fält"),
`min-h-[152px]`, `text-base leading-6` (16 px, annars zoomar iOS), `maxLength={1200}`,
synlig etikett "Ditt svar". Räknaren `{n} av 1 200` i `text-meta tabular-nums`, `aria-live="polite"`
men bara var 50:e tecken uppläst (throttle), annars tjatar skärmläsaren.

Knappen: primär ur designsystemet, `h-11`, full bredd på mobil, `sm:w-auto`. Aldrig `disabled`
för kort text: klick under 200 tecken ger fältet `border-fel`, hjälptexten i `text-fel` med
`role="alert"` och fokus tillbaka i fältet. Inget anrop.

Platshållarraderna i de låsta blocken är tomma `div` med `aria-hidden`, som i `DraftGate`.
Vi blurrar aldrig riktig text: återkopplingen och det omskrivna svaret lämnar aldrig
servern före claim. Antalet rader kommer från svaret (`lockedPointCount`, `improvedLineCount`).

Spärrkortet: `<section className="mt-6 rounded-xl border border-kant-stark bg-panel p-4 sm:p-6">`,
`IlluBlurGate size={96}` med `hidden sm:block text-ink-1`, rubrik `text-kort`, text, primär knapp
`Skapa konto gratis` med `ArrowRight` (ingen annan ikon, aldrig Sparkles), villkorsrad
"Inget kreditkort · Avsluta när du vill" och textlänken "Skriv om och bedöm igen" som
återställer till `skriver` med texten kvar.

Knappen länkar till `/register?intervju={token}` och kör `storePendingIntervju(token)` vid
resultat, precis som `storePendingTestSession`. `data-cta="intervjuprov-gate"` på knappen,
`data-cta="intervjuprov-bedom"` på bedömningsknappen.

## 4. Händelser

Alla via `capture()` i `src/lib/analytics/events.ts`. `cluster: 'interview'` på samtliga.

| Händelse | När | Egenskaper |
|---|---|---|
| `sample_started` | Första `input`-eventet i fältet, en gång per montering | `kind: 'interview'`, `question`, `slug` |
| `sample_completed` | Resultatet renderas | `kind: 'interview'`, `question`, `slug`, `duration_ms` (från första tecknet), `level` |
| `signup_gate_shown` | Samma effekt som `sample_completed`, direkt efter | `kind: 'interview'`, `question`, `slug` |
| `signup_started` | Klick på "Skapa konto gratis" | `source_page: '/artiklar/' + slug` |
| `draft_claimed` | Efter lyckat claim i `claimPendingIntervju` | `kind: 'interview'` |

Reklamkortens `article_cta_*` rörs inte: provet har inga `data-cta-position`-attribut,
annars räknas det som ett reklamkort i `ArtikelKlient`.

## 5. API

### POST `/api/public/intervjuprov`

`export const maxDuration = 30`.

Begäran: `{ question: 'styrkor' | 'star', answer: string, slug?: string }`.

Ordning i routen:

1. Validera: `question` i `FRAGOR`, `answer.trim()` mellan 200 och 1 200 tecken.
   Under 200: 400 `{ error: 'too_short' }` (klienten stoppar det redan). Över 1 200:
   400 `{ error: 'too_long', message: copy.fel.langt }`.
2. Kvot. Inloggad (Supabase-session i cookien): `checkDailyInterviewQuota(supabase, user.id)`,
   vid nej 429 med `quotaExceededBody()`. Anonym: `checkIpRateLimit(admin, ip, 'anon_interview', 3)`,
   vid nej 429 `{ error: 'rate_limited', message: copy.kvot.ip, registerHref: '/register', resetAt }`.
   Sedan `checkDailyBudget(admin, 'anon_interview', 100)`, vid nej 503
   `{ error: 'budget_exceeded', message: copy.kvot.budget, registerHref: '/register' }`.
   IP-spärren räknar upp vid kontrollen, så ett irrelevant svar räknas som ett prov. Avsiktligt.
3. `bedomIntervjusvar(question, answer)`. Kastar den: 500 `{ error: 'assessment_failed', message: copy.fel.server }`.
4. `relevant === false`: 422 `{ error: 'irrelevant', message: copy.fel.irrelevant.text }`. Ingen rad sparas.
5. Spara raden i `anon_interview_samples` (svaret, hela bedömningen, `ip_hash`, `user_id` om inloggad, `expires_at` sju dagar).
6. Svara 200:

```json
{
  "token": "uuid",
  "level": 3,
  "levelLabel": "Godkänt",
  "summary": "Styrkan har ett bevis, men svagheten stannar vid en bekännelse.",
  "works": "Du namnger styrkan och bevisar den med tre projekt ...",
  "missing": "Svagheten har inget exempel på när den märkts och ingen plan ...",
  "lockedPointCount": 5,
  "improvedLineCount": 6,
  "missingKind": "planen",
  "expiresAt": "2026-09-30T12:00:00Z"
}
```

`missingKind` fyller etiketten "Ditt svar, omskrivet med {planen | resultatet | exemplet}".
`improvedLineCount` = `ceil(improvedAnswer.length / 70)`, mellan 4 och 8. `lockedPointCount` =
antalet punkter i `full.points`. Inget ur `full` eller `improvedAnswer` skickas.

### POST `/api/public/intervjuprov/claim`

Som `test-session/claim/route.ts`: kräver inloggad användare, hämtar raden på `token`,
kräver `claimed_by is null` och `expires_at > now()`, sätter `claimed_by = user.id`
(idempotent: redan claimad av samma användare ger samma svar), loggar aktivitet via
`logActivityServer`, svarar `{ redirect: '/dashboard/intervju/' + token }`.

### `GET /dashboard/intervju/[id]` (sida)

Serverrenderad. Läser raden där `token = id` och `claimed_by = auth.uid()`, annars 404.
Visar: frågan som citat, användarens svar i en insunken ruta, nivå och mening, "Det som
fungerar" och "Det som saknas", sedan hela återkopplingen (punkterna med rubrik och text,
för `star` grupperade Situation, Uppgift, Handling, Resultat), sedan det omskrivna svaret med
raden `improvedWhy`, och sist en primärknapp "Öva vidare med Jobbcoachen" till
`/dashboard/jobbcoachen`. En `PageHeader` med h1 "Ditt intervjusvar, bedömt". Ingen betalvägg:
allt på sidan är redan betalt med kontot. Sidan är enda ställe där `full` och
`improvedAnswer` visas.

## 6. Kvot och lagring

Anonym: tre prov per IP och dygn (`public_rate_limits`, scope `anon_interview`) och 100 per
dygn totalt (`public_generation_budget`, scope `anon_interview`). Samma nivåer som testprovet
och mini-CV-analysen.

Inloggad: kvoten räknas i `quotaService`, mot befintlig tabell, dagsrytm midnatt Stockholm,
som övriga gratisfunktioner (`project_kvotmodell_dagsrytm`):

```ts
export const DAILY_LIMIT_INTERVIEW_SAMPLES = 1

export async function checkDailyInterviewQuota(supabase, userId): Promise<QuotaResult> {
  if (await userHasAccess(supabase, userId, 'chat_unlimited')) return accessResult(DAILY_LIMIT_INTERVIEW_SAMPLES)
  const since = startOfTodayStockholm().toISOString()
  const { count } = await supabase
    .from('anon_interview_samples')
    .select('token', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since)
  const used = count ?? 0
  return { allowed: used < DAILY_LIMIT_INTERVIEW_SAMPLES, isPremium: false, used, limit: DAILY_LIMIT_INTERVIEW_SAMPLES, nextResetAt: nextMidnightStockholm().toISOString() }
}
```

Behörigheten `chat_unlimited` är den som Allt ger Jobbcoachen; intervjuprovet hör till samma spår.
Se beslut 3 om det ska vara en egen feature-nyckel.

Tecken som bedöms gratis: 200 till 1 200 per svar, både anonymt och inloggat. Servern klipper
aldrig tyst: över 1 200 ger 400 med copy `fel.langt`.

Tabell:

```sql
create table if not exists public.anon_interview_samples (
  token uuid primary key default gen_random_uuid(),
  question text not null check (question in ('styrkor','star')),
  answer text not null,
  level smallint not null check (level between 1 and 5),
  summary text not null,
  works text not null,
  missing text not null,
  missing_kind text not null,
  full jsonb not null,
  improved_answer text not null,
  improved_why text,
  ip_hash text not null,
  user_id uuid references auth.users (id) on delete set null,
  claimed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);
create index if not exists anon_interview_samples_expires_idx on public.anon_interview_samples (expires_at);
create index if not exists anon_interview_samples_user_idx on public.anon_interview_samples (user_id, created_at);
alter table public.anon_interview_samples enable row level security;
```

Inga policies: bara admin-klienten skriver, sidan i dashboarden läser via admin-klienten efter
egen `claimed_by`-kontroll. Rensning av utgångna rader: samma ställe som `public_letter_drafts`
rensas (kontrollera `src/lib/letters/public-draft.ts` och cron-slotten 00:00 UTC i
`api/cron/pricing-sync`). Finns ingen rensning där ännu, lägg en `delete ... where expires_at < now()`
för både `anon_interview_samples` och `anon_test_sessions` i 00:00-slotten. Aldrig ett tredje cron-jobb.

Integritetspolicyn: nämn att svaret sparas i sju dagar, som brevutkasten.
`src/types/database.types.ts` regenereras inte; casta som i cron-routen.

## 7. Bedömningen (Gemini)

`src/lib/intervju/bedomning.ts`, via `generateJSON` i `src/lib/gemini/generate.ts`.
Modell `GEMINI_MODELS.quality` (gemini-3.5-flash), `temperature: 0.3`, `maxOutputTokens: 1800`,
`thinkingBudget: 0` som start (mät kvaliteten på tio riktiga svar innan thinking slås på).
Skicka `schema` så svaret alltid parsar.

Input till modellen: frågans text, `promptFokus` ur `FRAGOR` (vad en rekryterare letar efter i
just den frågan), användarens svar. Inget annat: ingen roll, ingen annons i version 1 (beslut 5).

Systeminstruktion, skiss:

> Du är en erfaren svensk rekryterare som bedömer ett muntligt svar på en intervjufråga.
> Svara på svenska med svenska facktermer (kompetenser, kravprofil, meriterande, urval).
> Skriv i vi-form ("vi saknar", "rekryteraren hör"), aldrig "AI", aldrig talstreck.
> Bedöm bara det som står. Hitta inte på detaljer om kandidaten.
> Nivåskala: 1 svaret svarar inte på frågan eller är tomt på innehåll, 2 påståenden utan
> exempel, 3 ett konkret exempel men en del saknas (planen, resultatet, jag-formen),
> 4 komplett struktur, litet som saknas, 5 komplett, konkret, med siffra eller tydligt utfall
> och tydlig koppling till rollen.
> Om texten inte är ett försök att svara på frågan (en fråga till oss, en annons, slumptext,
> ett CV) sätt relevant=false och lämna resten tomt.
> works och missing är en till två meningar var, konkreta, hänvisar till ord i svaret.
> summary är en mening som säger vad rekryteraren hör, inleds inte med nivåordet.
> full.points är fyra till sex punkter med rubrik och två till tre meningar, i den ordning
> kandidaten bör åtgärda dem. För frågan star: exakt fyra punkter, en per del.
> improvedAnswer är kandidatens eget svar omskrivet så att bristen är åtgärdad, 600 till
> 1 000 tecken, i jag-form, talat språk, inga påhittade siffror (skriv "[antal]" där
> kandidaten själv måste fylla i). improvedWhy är en mening om vad som ändrades.
> missingKind är ett ord i bestämd form för det viktigaste som saknades: "planen",
> "resultatet", "exemplet", "kopplingen" eller "jag-formen".

Svarsschema (JSON):

```json
{
  "relevant": true,
  "level": 3,
  "summary": "string",
  "works": "string",
  "missing": "string",
  "missingKind": "planen",
  "full": { "points": [ { "title": "string", "text": "string" } ] },
  "improvedAnswer": "string",
  "improvedWhy": "string"
}
```

Servern sätter `levelLabel` ur `level` (1 Otillräckligt, 2 Tunt, 3 Godkänt, 4 Starkt,
5 Övertygande), klipper `level` till 1 till 5, och kastar om `relevant` är sant men
`improvedAnswer` är kortare än 300 tecken eller `full.points` är tom (då 500, användaren
får försöka igen). Modellens text går aldrig till klienten oparsad.

Kostnadsuppskattning: ungefär 1 200 tokens in och 900 ut per bedömning. Vid 100 per dygn
under en krona om dagen med flash. Loggas med `calculateGeminiCost` som övriga anrop.

## 8. Acceptanskriterier

1. Båda artiklarna visar provet på angiven plats, på Pixel 7 och desktop, i Trådens tokens.
   Inga `neutral-*`, `orange-*` eller hex i komponenten.
2. Artikelns SEO-avtryck är oförändrat: kör seo-diff-skriptet ur
   `docs/design/analys-artiklar-2026-09-23` före och efter. Noll ändrade h1/h2/h3, title,
   description, canonical, FAQ- och HowTo-schema. Provet bidrar inga rubriker.
3. Ett svar på 264 tecken ger resultat inom 15 sekunder, med `sample_started`,
   `sample_completed` (med `duration_ms`, `level`) och `signup_gate_shown` i PostHog,
   alla med `kind: 'interview'`, `cluster: 'interview'`, `question`, `slug`.
4. Nätverkssvaret från `/api/public/intervjuprov` innehåller inte `full`, `improvedAnswer`
   eller `improvedWhy`. Kontrolleras i DevTools.
5. Under 200 tecken: inget nätverksanrop, felkant på fältet, hjälptexten i `text-fel`
   med `role="alert"`, fokus i fältet.
6. Fjärde provet från samma IP samma dygn: 429, statusraden med kvottexten och
   kontoknappen, fältet dolt.
7. Irrelevant text (klistra in en fråga om svarstid) ger 422 och felraden
   "Det här ser inte ut som ett svar på frågan", texten kvar i fältet.
8. "Skapa konto gratis" leder till `/register?intervju={token}`. Efter registrering
   (lösenord och Google) landar användaren på `/dashboard/intervju/{token}` med hela
   återkopplingen och det omskrivna svaret, och `draft_claimed` med `kind: 'interview'` loggas.
   Om claim misslyckas landar användaren på spårvalet som förut, utan felruta.
9. Sidan i dashboarden ger 404 för annan användares token.
10. `prefers-reduced-motion`: laddningsradernas fyllning står stilla, tråden står stilla.
11. Tangentbord: tab-ordning fält, knapp, (resultat) kontoknapp, "Skriv om och bedöm igen".
    Fokusringen är accent på alla fyra.
12. Skärmläsare (TalkBack på Pixel 7 eller NVDA på desktop): resultatet läses upp när det
    kommer (`aria-live`), platshållarraderna hoppas över, sr-only-meningen läses.
13. CLS 0 på artikeln före och efter interaktion (mät med `scripts/perf-publikt.ts`,
    filtrera på slug). LCP-budget för artiklar oförändrad.
14. `sample_started → signup_gate_shown` och `signup_gate_shown → signup_completed` syns i
    `/admin/tratt` för klustret `interview` inom en vecka efter release.
15. Inloggad användare (icke-admin) som gör provet i artikeln får det räknat mot
    `checkDailyInterviewQuota`: andra försöket samma dag ger 429 med `quotaExceededBody`
    och `QuotaLockCard`-texten i statusraden. Testa med ett icke-admin-konto, ägarkontot
    passerar alla kvoter.

## 9. QA i riktig webbläsare (före "klart")

Kör `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npx next build && npx next start -p 8300`
(dev-servern gav 500 på artikelsidor under turbopack 2026-09-23, så QA görs på build).
Skärmdumpar till `docs/qa/qa-intervjuprov/`, namngivna `pixel7-{fraga}-{steg}-{namn}.png`
och `desktop-{fraga}-{steg}-{namn}.png`. Chrome med Pixel 7-emulering (412 × 915, DPR 2) och
desktop 1280 × 800, som `scripts/perf-publikt.ts`. Ny inkognitosession per genomgång.

Steg, i den här ordningen, för `styrkor` på Pixel 7 och `star` på desktop, sedan omvänt i kortform:

1. Öppna artikeln, scrolla till provet. Dump: provet i första läge, med rubriken före och efter synlig.
2. Tryck "Bedöm mitt svar" med tomt fält. Dump: felkant och hjälptext.
3. Skriv 80 tecken, tryck. Dump: felkant, hjälptexten `fel.kort`, räknaren visar 80 av 1 200, fokus i fältet, inget nätverksanrop.
4. Klistra in exempelsvaret ur designfilen (264 tecken). Dump: räknare, tipsrad, fältet i fokus.
5. Tryck. Dump under laddningen (fånga inom 2 sekunder).
6. Dump resultatet: nivå, mening, punkter, låsta block, spärrkortet. Hela panelen i en bild (fullPage-klipp av elementet).
7. Kontrollera nätverkssvaret i DevTools: inga låsta fält. Dump av svaret.
8. Tryck "Skriv om och bedöm igen". Dump: texten kvar, tillstånd skriver.
9. Klistra in frågetexten om svarstid (designfilen, tillstånd e). Tryck. Dump: felraden irrelevant.
10. Tryck "Skapa konto gratis". Registrera nytt konto (lösenord). Dump: landningen i dashboarden med hela återkopplingen.
11. Logga ut, öppna samma dashboard-URL med ett annat konto. Dump: 404.
12. Ny inkognito, gör provet fyra gånger (tre riktiga, ett irrelevant räknas). Dump: statusraden vid 429.
13. Slå på reduced motion i Chrome DevTools rendering. Dump under laddning: raderna står stilla.
14. Tab-runda med tangentbordet på desktop. Dump av varje fokusring (fält, knapp, kontoknapp, textlänk).
15. PostHog: verifiera de tre sample-eventen plus signup_started, signup_completed, draft_claimed för testkontot. Dump av eventlistan. Ta sedan bort testkontot ur data via `admin_undantagna_konton`.

Varje avvikelse skrivs i `docs/qa/qa-intervjuprov-<datum>.md` med steg, förväntat, faktiskt, och rättas innan något kallas klart (`feedback_riktig_webblasartest`).

## 10. Öppna beslut för ägaren

Se rapporten i chatten. Kort: (1) landning efter claim, egen sida eller Jobbcoachen, (2) STAR-frågans
lydelse, (3) feature-nyckel för inloggad kvot, (4) om spärrkortet bryts ut till en delad komponent nu,
(5) valfritt rollfält, (6) om provet ska visas för inloggade i artikeln, (7) fotnotens formulering om lagring.
