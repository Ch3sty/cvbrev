# Byggnoter: Jobbsöket, omgång 1

Spec: BYGGSPEC (art director, 2026-11-21). Ett avsnitt per uppdrag.

## Motorn (etapp 1A, gren `feat/jobbsoket-omgang1`, arbetskopia `cvbrev-qa-b`)

### Vad som byggdes

Datamodell, regler, serverladdare och API-rutter. Inga vyer, ingen CSS.

- Migreringen `supabase/migrations/20261121180000_jobbsoket_omgang1.sql`. **Inte körd.** Art director kör den.
- Rena, klientsäkra funktioner i `src/lib/jobbsok/` (import från `@/lib/jobbsok`). Test: `src/lib/jobbsok/__tests__/motor.test.ts`, 40 fall, byggda på Elins exempeldata.
- Serverladdare i `src/lib/jobbsok/server.ts` (import från `@/lib/jobbsok/server`, bara server).
- Rutter under `src/app/api/jobbsok/`, plus tillägg i `/api/applications/[id]/events` och `/api/applications/[id]/events/[eventId]` (intervjuns tid) och `/api/applications` (valfritt `af_ad_id`).
- AI-anropet `src/lib/openai/uppfoljningsmejl.ts` (Gemini, samma mönster som `brevKrav.ts`).
- Utbrutet ur befintliga rutter, oförändrat i sak: `src/lib/applications/skapa.ts` (POST /api/applications) och `src/lib/applications/afRapportData.ts` (GET /api/applications/report).
- Mäthändelser i `src/lib/analytics/events.ts` och `ServerEventName` i `src/lib/analytics/server.ts`.

### Tabeller och kolumner

| Var | Kolumn | Typ | Innehåll |
|---|---|---|---|
| `job_saved_ads` (ny) | `id`, `user_id` | uuid | |
| | `job_title`, `company` | text 1–200 | krävs |
| | `location` | text ≤200 | |
| | `job_ad_url` | text ≤2048 | |
| | `last_application_date` | date | sista ansökningsdag, null = ingen |
| | `source` | text `'match'`/`'egen'` | |
| | `af_ad_id` | text ≤100 | AF:s annons-id; unikt per (`user_id`, `af_ad_id`) när inte null |
| | `match_score` | smallint 0–100 | ögonblicksbild |
| | `note` | text ≤2000 | |
| | `application_id` | uuid → `job_applications` **on delete set null** | satt = sökt, raden döljs |
| | `created_at`, `updated_at` | timestamptz | trigger på updated_at |
| `job_application_followups` (ny) | `id`, `application_id` (cascade), `user_id` | uuid | |
| | `subject` | text ≤200, nullbar | null = loggad utan utkast |
| | `body` | text ≤4000, nullbar | utkastet som senast sparades, namnet ingår |
| | `rewrites` | smallint 0–3 | "Skriv om kortare" |
| | `sent_at` | date | null = utkast som inte skickats |
| | `sent_via` | `'epost'`/`'kopierat'`/`'eget'` | satt om och bara om `sent_at` är satt (check) |
| | | | unikt index: högst ett oskickat per `application_id` |
| `job_application_events` | `interview_at` | timestamptz | intervjuns tid; **00:00 svensk tid = bara datum** |
| | `interview_place` | text ≤200 | |
| `profiles` | `weekly_application_goal` | smallint 1–10 | null = förvalet 3 |

RLS: de nya tabellerna har bara en select-policy (`user_id = auth.uid() or is_admin()`); de skrivs av rutterna med admin-klienten efter sessionskontroll. Kolumnerna på `job_application_events` och `profiles` följer befintliga policyer och skrivs med användarens session.

### Typerna (`@/lib/jobbsok`, filen `typer.ts`)

Allt som vyerna delar exporteras därifrån: `Dag` ('YYYY-MM-DD' i svensk tid), `Handelse`, `Uppfoljning`, `SparadAnnons`, `TjanstMedHistorik`, `TjanstLage`, `IntervjuInfo`/`IntervjuLage` (`'bokad' | 'utan_tid' | 'hur_gick' | 'vantar_besked'`), `Station`, `Bricka`/`BrickTon`, `AttGoraHandling`, `AttGoraNu`, `Vagg`, `VeckansMal`, `SkaSokasRad`, `Bana`/`BanStation`, `TjanstensSteg`/`StegPunkt`, `HandelseListRad`, `VeckoStapel`, `ManadsStapel`, `Tratt`, `KanalRad`, `Forberedelse`/`FragaLage`, `CoachForslag(Lista)`, `SoktaVy`, `SoktaFilter`, `TjanstFokus`, `SoktaLista`, samt konstanterna `VECKANS_MAL_FORVAL` (3), `UPPFOLJNING_MAX_OMSKRIVNINGAR` (3), `UPPFOLJNING_PREMIUM_PER_DYGN` (30), `UPPFOLJNING_MAX_ORD` (90), `ATT_GORA_MAX` (3), `FORBERED_INOM_DAGAR` (14), `SISTA_DAG_INOM_DAGAR` (7). Läs fältkommentarerna i `typer.ts`; de är en del av kontraktet.

### Rena funktioner (signaturer)

```ts
// datum.ts
idagSv(nu?): Dag; dagFor(iso|Date|Dag): Dag | null; plusDagar(dag, n); dagarMellan(fran, till): number
veckaStart(dag): Dag (måndag); isoVecka(dag): number; veckodagNamn/veckodagKort/veckodagOchDag(dag)
franStockholm(dag, 'HH:mm'?): ISO | null; klockslag(iso): '10.00' | null (null vid 00:00)
kortDag(dag) '26 nov'; langDag(dag) '26 november'; narText(dag, idag) 'i dag' | 'i morgon' | 'på tisdag' | 'den 3 december'

// lage.ts
brickBokstaver(company): string            // 'Umeå Energi' UE, 'Norrmejerier' NO, 'Ålö AB' ÅL
tjanstLage(t: TjanstMedHistorik, nu?): TjanstLage
stationFor(status), arAvslutad(status), intervjuInfo(status, handelser, nu?): IntervjuInfo | null
senasteAktivitet(t): Dag; kanBliTyst(status, intervju); nastaPaminnelse(skickad: Dag): Dag; harFattSvar(t)

// bana.ts
bana(tjanster: TjanstLage[], skaSokas: SkaSokasRad[]): Bana   // fyra stationer + avslutade
tjanstensSteg(t, lage): TjanstensSteg                         // Sökt, Svar, Intervju, Erbjudande
skaSokasLista(rader: SparadAnnons[], idag): SkaSokasRad[]     // dolda (application_id) bort, sorterade
skaSokasRad(rad, idag); sistaDagText(dag, idag); intervjuEtikett(tid) 'tis 24 nov 10.00'; intervjuEtikettKort(tid) 'tis 10.00'; brickaFor(t)

// veckansMal.ts
veckansMal(ansokningar, malKolumn: number | null, nu?): VeckansMal; tolkaVeckansMal(v): number | null

// attGora.ts
attGoraNu(ind: AttGoraIndata): AttGoraNu
  // AttGoraIndata = { tjanster, skaSokas, veckansMal, harCv, sokteForraManaden,
  //   intervjuprov?: { ovade, lagst: { kort, betyg } | null }, bastaTraff?: { id, jobTitle, company, score },
  //   fornamn?, avfardade?: Set<nyckel>, nu? }
attGoraKandidater(ind), sorteraHandlingar(h), vaggForHandling(h, ind, idag), vaggUtanHandling(ind, idag)
ordtal(n) 'tre'; titelILopText(titel)

// lista.ts
soktaLista(tjanster, skaSokas): SoktaLista     // grupper + antal per filter
filtrera(lista, filter): { tjanster, skaSokas }
soktaVagg(tjanster): { rubrik, text }           // "Sex är på väg"
avslutadeText(avslutade): string | null         // "Tre avslag, det senaste 12 november."
gruppFor(t)

// intervju.ts
intervjuerPaGang(tjanster, nu?): IntervjuPaGang[]   // { id, company, jobTitle, bokstaver, lage, tid, harKlockslag, plats, dag, dagarKvar, text, handelseId }
forberedelse(prov: ProvSammanfattning[], kravMedTraffar: BrevKrav[] | null): Forberedelse
antalOvadeFragor(prov); senastePerFraga(prov); genomfordDag(tid, nu?); hurGickFran(tid)

// handelser.ts
handelselista(t, lage, nu?): HandelseListRad[]   // typ 'handelse' | 'foljde_upp' | 'kommande_intervju'
handelseEtikett(rad): string

// statistik.ts
tratt(historik, lagen): Tratt; veckostaplar(lagen, nu?, max=12); manadsstaplar(lagen, nu?, max=12); kanaler(lagen)

// coach.ts
coachForslag(tjanster, nu?): CoachForslagLista   // 'fran_laget' (högst 4) eller 'fasta'; FASTA_FORSLAG

// uppfoljning.ts
uppfoljningsmall(u: UppfoljningUnderlag, namn): { subject, body }
valideraAiMejl(raw, maxOrd?); sattIhop(stycken, sprak, namn); styckenUrMejl(body); ordIMejlet(body)
valjKompetenser(skills, roller, krav, max=3); underlagForModellen(u); mailtoHref({ subject, body }, till?)
uppfoljningSparr({ harBetalt, utkast, applicationId, nu? }): { lage: 'ny'|'ateranvand'|'premium_required'|'dygnstak', kvarIdag }
farUtkast(sparr); valideraMejlText(raw); valideraSkickad(raw, nu?)

// adress.ts (F8)
tolkaSoktaAdress(params): { vy, filter, logga: false|'sokt'|'ska-soka', manad }
soktaHref({ vy?, filter?, logga?, manad? }); tjanstHref(id, fokus?) '/dashboard/sokta-tjanster/<id>?steg=forbered|folj-upp|hur-gick|andra-tid'
tolkaTjanstAdress(params): TjanstFokus; jobbHref(annonsId?) '/dashboard/jobbmatchning?annons=<id>'; tolkaJobbAdress(params)

// matchning.ts (F7)
sistaAnsokningsdag(annons, nu?): { dag, dagarKvar, passerad, text } | null
kompetenserEnOchEn(annons, activeCv): { grund: 'kravprofil'|'annonstext'|'ingen', rader: { namn, iCv, kalla }[], traffar, totalt }
sparadFranAnnons(annons, matchScore?): kroppen till POST /api/jobbsok/ska-sokas

// validering.ts (samma fel som rutterna ger)
valideraNySparad, valideraAndradSparad, valideraIntervjutid, valideraUtfall, valideraVeckansMal, arUuid
// schema.ts
arSchemaFel(error): boolean
```

Gamla parametrar som `tolkaSoktaAdress` förstår: `?filter=uppfoljning` (blir `folj-upp`), `?rapport=1`, `?tab=statistik|rapport|dela`, `?month=`. Länkarna i `NastaHandling.tsx` (`?filter=uppfoljning`, `?rapport=1`) landar därmed rätt så snart vyn läser adressen med funktionen.

### Serverladdare (`@/lib/jobbsok/server`)

Alla tar `userId` (från `hamtaVerifieradAnvandare()`), skapar själva sessionsklienten och läser parallellt. Saknas migreringen: Ska sökas och uppföljningar blir tomma och `migreringSaknas: true`.

```ts
hamtaJobbsokOversikt(userId, { nu?, avfardade? }): Promise<JobbsokOversikt>
  // { idag, harCv, fornamn, harBetalt, tjanster, tjansterKort (högst 4 öppna), bana, attGora, veckansMal,
  //   skaSokas, intervjuerPaGang, nyaTraffar, bliUpptacktSynlig, summering (delad via cache()), migreringSaknas, lasfel }
hamtaToppTraffar(userId, antal=3, { nu? }): Promise<ToppTraffar>
  // { traffar: { id, jobTitle, company, ort, distans, score, skal[], sistaDag, sistaDagText, ny }[], lasta, kordAt }
  // Läser hela senaste körningen i job_matchings_cache: lägg den i en egen Suspense-gräns.
hamtaSoktaTjanster(userId, { nu?, manad? }): Promise<SoktaTjansterData>
  // { idag, harBetalt, tjanster, lista, vagg, avslutadeText, bana, veckansMal,
  //   statistik: { tratt, veckostaplar, manadsstaplar, kanaler, cvJamforelse, forstaSokt },
  //   rapport: { deadline, manad, locked, data }, backfill, ansokningar (JobApplication[] för dagens komponenter), migreringSaknas, lasfel }
hamtaSoktTjanst(userId, id, { nu? }): Promise<SoktTjanstData | null>
  // { tjanst, ansokan, handelser, handelselista, steg, forberedelse, uppfoljning: { utkast, senastSkickad,
  //   nastaPaminnelse, sparr, omskrivningarKvar }, brev, cv, franSkaSokas, harBetalt, migreringSaknas }
hamtaIntervjuerPaGang(userId, { nu? }): Promise<IntervjuPaGang[]>   // tillägg till getInforIntervjunData
hamtaCoachForslag(userId, { nu? }): Promise<CoachForslagLista>      // tillägg till Jobbcoachens sida
```

Lägre nivå (för egna laddare): `lasAnsokningar`, `lasUppfoljningar`, `lasSparade`, `lasVeckansMal` (alla `{ rader, fel, saknas }`), `sattIhopHistorik`, `sokteForraManaden`.

Befintliga laddare är orörda: `getDashboardSummary`, `getInforIntervjunData`, `getJobbmatchningData`, sidornas egna frågor.

### API-rutter

Alla kontrollerar sessionen (401 `unauthorized`), svarar `{ success: true, ... }` eller `{ error, code, ... }`. 503 `migrering_saknas` när migreringen inte är körd.

| Metod och sökväg | Indata | Svar | Fel |
|---|---|---|---|
| GET `/api/jobbsok/ska-sokas` | | `{ data: SkaSokasRad[] }` | |
| POST `/api/jobbsok/ska-sokas` | `{ job_title, company, location?, job_ad_url?, last_application_date?, source?, af_ad_id?, match_score?, note? }` (se `sparadFranAnnons`) | `{ data: SparadAnnons, rad: SkaSokasRad, alreadyExists? }` | 400 `invalid_field`+`falt`, 409 `redan_sokt`+`application_id` |
| PUT `/api/jobbsok/ska-sokas/[id]` | delmängd av fälten ovan (utom source/af_ad_id/match_score) | `{ data, rad }` | 400, 404 |
| DELETE `/api/jobbsok/ska-sokas/[id]` | | `{ success }` | 404 |
| POST `/api/jobbsok/ska-sokas/[id]/sokt` | valfritt `{ applied_at?, application_channel?, cv_id?, letter_id?, notes?, ... }` | `{ data: JobApplication, sparadId, alreadyExists? }` | 404, 400/404/500 som POST /api/applications |
| GET `/api/jobbsok/uppfoljning/[applicationId]` | | `{ data: { utkast, senastSkickad, nastaPaminnelse, sparr, omskrivningarKvar } }` | 404 |
| POST `/api/jobbsok/uppfoljning/[applicationId]` | | `{ data: Uppfoljning, kalla: 'sparat'\|'ai'\|'mall'\|'ateranvant', sparr }` | 402 `premium_required`+`sparr`, 429 `dygnstak`+`sparr`, 404 |
| PUT `/api/jobbsok/uppfoljning/[applicationId]` | `{ subject, body }` | `{ data }` | 400 `invalid_field`, 404 `utkast_saknas` |
| POST `/api/jobbsok/uppfoljning/[applicationId]/kortare` | | `{ data, omskrivningarKvar }` (ämnesraden står kvar, bara brödtexten kortas) | 404 `utkast_saknas`, 409 `tak`, 409 `andrat_under_tiden`, 502 `ai_fel` + `textOrord: true` + `data` (det orörda utkastet) |
| POST `/api/jobbsok/uppfoljning/[applicationId]/skickad` | `{ via?: 'epost'\|'kopierat'\|'eget', datum? }` | `{ data, nastaPaminnelse }` | 400 `invalid_field` |
| DELETE `/api/jobbsok/uppfoljning/[applicationId]/skickad?uppfoljning=<id>` | | `{ success }` | 404, 409 `utkast_finns` |
| PUT `/api/jobbsok/intervju/[applicationId]` | `{ datum: Dag\|null, tid?: 'HH:mm', plats? }` | `{ data: Handelse }` | 400, 404 `kallelse_saknas` |
| DELETE `/api/jobbsok/intervju/[applicationId]` | | `{ data: Handelse }` | 404 |
| POST `/api/jobbsok/intervju/[applicationId]/utfall` | `{ svar: 'genomford' }`, `{ svar: 'flyttad', datum, tid?, plats? }`, `{ svar: 'installd' }` | `{ svar, data: Handelse }` | 400, 404 `kallelse_saknas` |
| GET/PUT `/api/jobbsok/veckans-mal` | PUT `{ mal: 1..10 \| null }` | `{ data: VeckansMal }` | 400 `invalid_field` |
| POST `/api/applications/[id]/events` (tillägg) | `intervju?: { datum, tid?, plats? }` på `interview_invited` | som förut | 400 `invalid_field`; utan migreringen sparas händelsen ändå utan tiden |
| PUT `/api/applications/[id]/events/[eventId]` (tillägg) | `intervju?: { datum\|null, tid?, plats? }` | som förut | 503 `migrering_saknas` |
| POST `/api/applications` (tillägg) | `af_ad_id?` | som förut | döljer Ska sökas-raden för samma annons |

Klientflödet för uppföljningen: öppna blocket → POST (hämtar eller skapar) → visa `data.subject`/`data.body`; ändringar → PUT; "Öppna i e-post" = `mailtoHref(...)`, "Kopiera mejlet" kopierar; därefter "Skickade du mejlet?" Ja → POST `/skickad` med `via`. "Jag har redan skickat det" → POST `/skickad` utan kropp (via `eget`), syns även när POST gav 402. Betalväggen visas när `sparr.lage === 'premium_required'` (dagens `PaywallCard`).

**Skriv om kortare förstör aldrig något.** Går underlaget, maskningen, AI-anropet eller valideringen av svaret fel svarar rutten 502 `ai_fel` med `textOrord: true` och utkastet som det var; raden skrivs inte och `rewrites` räknas inte upp. Skrivningen sker bara efter ett godkänt svar och har villkoret `rewrites = <tidigare värde>` och `sent_at is null`, så två samtidiga tryck räknas inte dubbelt (409 `andrat_under_tiden`). Vyn säger då: **"Det gick inte att skriva om just nu. Din text är kvar."** och behåller texten i fältet.

### Mäthändelser (serverside, `captureServer`)

`ska_sokas_sparad`, `ska_sokas_markerad_sokt`, `uppfoljning_utkast_oppnat` (`kalla`, `premium`, `orsak`, `ms`), `uppfoljning_sparr`, `uppfoljning_kortare`, `uppfoljning_loggad` (`via`, `med_utkast`, `dagar_tyst`), `intervjutid_satt` (`andring`, `har_klockslag`, `har_plats`, `dagar_kvar`, `kalla`), `intervju_utfall`, `veckans_mal_andrat`. Inga arbetsgivarnamn eller personuppgifter. Kostnaden för AI-anropen skrivs i `ai_usage_costs` (`feature_name` `uppfoljning_utkast` / `uppfoljning_kortare`).

### Egna beslut

1. **Veckans mål i `profiles.weekly_application_goal`.** Sökprofilen ligger som jsonb i `profiles.job_preferences` (lästa i `getJobbmatchningData.ts`, `ProfilClient.tsx`, `brev3/hem/data.ts`), det finns ingen egen tabell. `profiles_skydda_kolumner` (steg 1 och 2) räknar upp sina skyddade kolumner med namn; den nya kolumnen står inte där, så sessionen får skriva den.
2. **Ordningen i Att göra nu** (rättad av art director 2026-11-21, skissens ordning gäller): först "Hur gick intervjun?", sedan kommande intervjuer inom 14 dagar efter intervjutid, sedan allt övrigt i stigande datum med det som passerat först, och "Sök en tjänst till" alltid sist (fyllnad, bara när det finns plats). Med Elins data: Förbered intervjun (Umeå Energi), Följ upp Norrmejerier, Sök Ålö AB senast torsdag. `AttGoraHandling.tid` bär intervjutiden för sorteringen.
3. (utgår, ingår i punkt 2)4. **"Sök före sista dag"**: rubriken säger "senast torsdag" i stället för skissens "före torsdag" (sista dagen räknas med).
5. **Tystnad**: kan inte uppstå för avslutade, erbjudanden eller en kallelse med satt tid. En kallelse utan tid och en genomförd intervju kan bli tysta. Senaste aktivitet = senaste händelsens `occurred_at` eller senaste `sent_at` (inte `status_updated_at`, som triggern sätter vid varje ändring).
6. **Hur gick intervjun?** visas från dagen efter intervjudagen (svensk tid); på intervjudagen står den kvar som bokad. "Den är genomförd" loggar på intervjudagen (aldrig framåt). "Inställd" tar bort tid och plats; statusen står kvar som kallad (läge `utan_tid`).
7. **Tid utan klockslag** sparas som 00:00 svensk tid och läses som "bara datum" (`klockslag()` ger null). Ingen extra kolumn.
8. **Intervjuer på gång** tar med genomförda som väntar besked (skissen visar LF), inte bara kallade.
9. **Spärren**: ett "utkast" är en rad med `body`. "Jag har redan skickat det" skapar en rad utan text och räknas aldrig. Gratis: när kontots enda utkast hör till samma tjänst öppnas det igen som ett nytt oskickat utkast med samma text (ingen AI). Premium-taket räknas från midnatt svensk tid. Ångra en skickad uppföljning med text gör den oskickad igen i stället för att radera (annars kunde gratiskontot få ett nytt utkast). Behörigheten är `userHasPremiumAccess` (alla betalda spår), som rapporten.
10. **Namnet** sätts in av servern efter AI-svaret (`sattIhop`), ur `profiles.full_name` (platshållarnamn hoppas över). "Skriv om kortare" skickar brödtexten utan hälsning och signatur, maskad med `maskForModel`.
11. **Ämnesraden är alltid mallens** ("Min ansökan till tjänsten som ekonomiassistent"): i rökprovet blev AI:ns egna rubrikaktiga ("Uppföljning av ansökan Ekonomiassistent"). AI:n skriver bara de tre styckena; prompten förbjuder "ser fram emot", "bidra till ert team", "mycket intresserad". **AI-tidsgräns 8 s**, sedan mallen. Svaret måste ha 2–4 stycken, högst 90 ord, inga hakparenteser, e-postadresser eller länkar; talstreck byts mot komma.
12. **Brickan**: initialerna i de två första orden, annars två första bokstäverna; bolagsformer (AB, publ…) räknas inte. Skissens exempel är inte konsekventa (KO, VO, LF); regeln ger KF, VL, LV för dem.
13. **Grupperna** i Sökta tjänster har även Erbjudande (tackat ja står där). Tackat nej och avslag är Avslutade.
14. **`job_saved_ads.application_id` on delete set null**: tas den sökta tjänsten bort kommer raden tillbaka under Ska sökas.
15. **Toppträffarna** på Översikt läses i en egen laddare (`hamtaToppTraffar`) och inte i Översiktens varv, eftersom en körning kan vara 600 annonser. Att göra nu pekar därför på Matchade jobb (eller en `bastaTraff` om vyn skickar in den).
16. **Kompetenserna en och en**: bara annonser med utskriven kravprofil kan visa vad som saknas (8 av 600 i mätningen i `match-score.ts`). Utan kravprofil listas CV:ts kompetenser som nämns i annonsen, ingen markeras som saknad. Jämförelsen är kopierad ur `match-score.ts` (`skillHit` är inte exporterad och filen ligger under `src/app/dashboard`).
17. **`skapaSoktTjanst`** tar dagens datum i svensk tid (förut UTC-dagen), annars samma beteende som POST /api/applications.
18. **Rapportfönstret** i Att göra nu räknar dag och förra månad i svensk tid (dagens hook använder webbläsarens klocka); villkoret är detsamma.
19. Översikten använder **senaste** betyget per fråga (som tjänstens förberedelse), läst med `hamtaProv`, inte summeringens bästa betyg.

### Rökprov mot databasen (2026-11-21, efter att art director kört migreringen)

Dev-server 5231, en inloggad session per QA-konto (gratis och Premium), ett anrop per rutt, skriptet i `scratchpad\jobbsok\bygg\motor\rokprov.mjs`, svaren i `rokprov-logg.json`. Alla rutter svarade som väntat:

- Ska sökas: POST (match och egen) 200, samma annons igen 200 `alreadyExists`, PUT 200, DELETE 200, GET 200, `/sokt` 200 (sökt tjänst skapad, raden dold).
- Intervjun: kallelse med tid via `POST /api/applications/[id]/events` 200 (`interview_at` 2026-11-24T09:00Z), `PUT .../events/[eventId]` 200, `PUT /api/jobbsok/intervju/[id]` 200, `utfall` genomförd 200 (loggad på intervjudagen 18 nov, omgång 1), `DELETE /api/jobbsok/intervju/[id]` 200.
- Veckans mål: PUT 4 och GET 200 ("Veckans mål: 2 av 4 sökta").
- Uppföljning Premium: GET 200, POST 200 `kalla: 'ai'` (1,7 s), POST igen 200 `kalla: 'sparat'` (inte omskrivet), PUT 200, kortare 200 (`rewrites` 1), skickad utan kropp 200 (`sent_via: 'eget'`, `nastaPaminnelse` 3 dec), ångra 200.
- Gratisspärren: första utkastet 200 `kalla: 'ai'`, andra tjänsten 402 `premium_required`, "Jag har redan skickat det" på samma tjänst 200.
- Inbäddade frågan `job_applications.select('*, job_application_events(*)')`: fungerar (Premium 7 rader, händelserna per rad 1 till 3).
- Alla laddare (via en tillfällig rutt som är borttagen): inga fel. Premiums Översikt ger Förbered intervjun (Umeå Energi), Följ upp Norrmejerier, Sök Ålö AB senast torsdag; banan Ska sökas 2, Sökt 4 (NO tyst 15 dagar), Intervju 2 (1 bokad, 1 väntar besked); Jobbcoachen fyra förslag ur läget.

Rättat efter rökprovet: ämnesraden (beslut 11) och promptens ordval. Testdatan står i `scratchpad\jobbsok\bygg\motor\testdata.json` med id per rad för radering.

### Det som inte är prövat

- Felvägen i "Skriv om kortare" (502 `ai_fel`) är granskad i koden men inte framkallad mot databasen; 409 `tak` och 409 `andrat_under_tiden` likaså.
- Reservmallen har inte använts skarpt (AI:n svarade båda gångerna); den är enhetstestad.
- Premiums dygnstak (30) och gratis "öppna samma tjänsts utkast igen" efter att det skickats (`ateranvand`) är bara enhetstestade.
- `hamtaToppTraffar` gav tomt (QA-kontona har ingen matchningskörning och inget CV); poängsättningen mot en riktig körning är inte prövad. QA-kontona saknar också CV och intervjuprov, så förberedelsens betyg och kompetenserna i AI-underlaget är tomma i testdatan.
- Mäthändelserna har skickats men inte kontrollerats i PostHog.
- Att trigger `sync_job_application_current_status` även sätter `status_updated_at` när bara intervjutiden ändras. Ofarligt för den nya motorn, men dagens summering räknar tystnad på `status_updated_at`.
### Hur man backar

Koden: `git revert` på motorns commit. Rutten för rapporten och POST /api/applications går tillbaka till sin inbyggda logik. Migreringen är bara tillägg och kan stå kvar; vill man ta bort den står rollback-SQL:en överst i filen (först när koden som läser den är backad).

## Sammankopplingen, del 1 (etapp 3, gren `feat/jobbsoket-b`, arbetskopia `jobb-b`)

2026-11-21. `feat/jobbsoket-c` sammanslagen i `feat/jobbsoket-b` (merge-commit 7e1a5e3f), sedan rättningarna efter art directors bildgranskning. Ingen dev-server och ingen webbläsare i den här delen: bara kod, tsc och vitest.

### Sammanslagningen

- Enda krocken: importraderna i `src/app/dashboard/layout.tsx`. Båda behålls, i ordningen `jobb3.css`, `jobb3-b.css`, `jobb3-c.css` (prefixen `j3-b-` och `j3c-` krockar inte).
- `src/lib/jobbsok/adress.ts` krockade inte: bara B hade ändrat den (`las()` läser allt med `get`).

### Rättningar

1. **Kallad till intervju visar dagen kallelsen kom.** `handelseEtikett` (motorn, `handelser.ts`) gav intervjutiden för varje rad med `tid`, och raden Kallad till intervju bär `interview_at`. Nu används tiden bara på raden för den kommande intervjun; TjanstVy använder `handelseEtikett` för alla rader. Samma kod på dator och telefon (Handelsebana har ingen brytpunkt). Test i `motor.test.ts`.
2. **Intervjuer på gång:** en tjänst som väntar besked (genomförd intervju loggad) får "Uppdatera" till tjänstens sida. "Hur gick det?" står bara i läget `hur_gick` (tiden passerad, ingen genomförd).
3. **Egen betalvägg för uppföljningsmejlet:** variant `uppfoljning` i `paywall-copy.ts` (rubrik och text ur B:s vy), plats `uppfoljning` i `PLATS_FOR_VARIANT` och `BetalvaggPlats`. Vyn ritar `<PaywallCard variant="uppfoljning" bare />` i SparrRam. Visning (`paywall_shown`, `betalvagg_visad`) och klick (`paywall_cta_clicked`) mäts som de andra, köpknappen och köpsteget bär platsen `uppfoljning`, så ett köp därifrån räknas inte längre som Jobbcoachens. Ingen feature (ingen `feature_blocked`): uppföljningen har ingen nyckel i `features.ts`, och den rördes inte. Priser, kampanjlogik och kampanjkod oförändrade. Serverns `uppfoljning_sparr` står kvar. Test i `paywall-copy.render.test.tsx` och `PaywallCard.analytics.test.tsx`.
4. **Hydreringsvarningen på Bli upptäckt:** `useCollapsedSections` läste localStorage i första render när DB-raden saknades. Servern ritade alla steg öppna, klienten de lokalt hopfällda, och `aria-expanded` och fällningens stil skilde. Varningen kom och gick eftersom den bara syns så länge DB-raden saknas (en tidig fällning sparas bara lokalt innan användarens id hämtats). Nu gäller DB-läget (eller inget) i första render och det lokala läses efter monteringen. Dessutom skriver `CvPickerCard` och `VerifiedResultsCard` datum med `timeZone: 'Europe/Stockholm'` (servern kör UTC).
5. **Förifyllt ark (`?logga=1`):** öppnas Fler detaljer när adressen bär ort eller länk, så att det som följer med syns.
6. **Borttaget:** `src/components/illustrations/ApplicationIllustrations.tsx` och `src/hooks/use-applications.ts` (bara de gamla Sökta tjänster-vyerna använde dem).

### Kontrollerat i koden, inget att rätta

- B:s länkar till intervjufrågorna går genom `nyttProvHref(fraga)` (`/dashboard/intervju/ny?fraga=<FragaId>`), med id ur `FRAGA_ORDNING`. C:s sida läser `fraga` med `arFragaId` och öppnar svaret direkt.
- C:s "Förbered intervjun" (Intervjuer på gång) och "Till förberedelsen" (bedömt svar) pekar på `tjanstHref(id, 'forbered')`, som B:s sida läser med `tolkaTjanstAdress`.
- `?logga=1|ska-soka` med `tjanst`, `arbetsgivare`, `ort`, `lank`, `sista`, `af`, `matchning` läses i `sokta-tjanster/page.tsx` och öppnar arket förifyllt; `af` följer med till `POST /api/applications` och `/api/jobbsok/ska-sokas`.

### Inte rättat, väntar på webbläsaren (del 2)

- **Strecket i korten** (mörkt frågekort på tjänstens sida, STAR-brickorna S och T på det bedömda svaret, bara i 1440). Ingen regel i kitet eller vyerna ritar en kant, linje eller kontur där, och kitsidans bilder av samma komponenter saknar strecket. Mätt i bilderna: en pixel bred, en rektangel 6 px innanför kortets sidor och 7 px över dess nederkant, bara nedre delen ritad och på T streckad; färgen är kortets egen blandad med ungefär 40 % av ytan bakom kortet (ljusare på det mörka kortet över vit panel, mörkare på de ljusa brickorna över mörk vägg); identisk i ljust och mörkt läge, borta i 412. Det pekar på en rastersöm i ett eget kompositlager (delvis omritad textyta i 1x) snarare än ett ritat element. På det bedömda svaret ligger den vågräta linjen exakt där kullarnas svg börjar (y 275). Prövas i del 2: skärmbild med deviceScaleFactor 1 och 2, och DevTools lager och omritningar.
- Hydreringsvarningen på Inför intervjun (gratis): hubben ritas på servern, och dess klientdelar (Topprad, JobbFlikar, InforIntervjunClient) läser inget datum, ingen slump och inget lagrat i första render (useTema, NotificationBell och MessagesHeaderButton börjar likadant på servern). Orsaken är inte hittad; prövas i del 2.

## Slutkontrollen (etapp 3 del 2, gren `feat/jobbsoket-a`, arbetskopia `cvbrev-qa-b`)

2026-11-21, på 1a4cf71a (A:s gren med B och C inslagna). Avbruten i förtid på art directors besked (ägaren rundade av sessionen). Hjälpskripten ligger i `scratchpad\jobbsok\bygg\slut\` (`start.cjs` startar en webbläsare med båda QA-kontona, `kor.cjs <steg>` kör ett steg mot dev-servern på 5231).

### Kört och utfall

- **Vitest, hela sviten:** 317 filer gröna, 3 överhoppade; 4103 test gröna, 13 överhoppade. Inga röda.
- **`npm run build`:** grönt (kompilerat på 66 s, 800 statiska sidor). Inga varningar som rör Jobbsökets filer (bara den kända om `NODE_TLS_REJECT_UNAUTHORIZED`). Turbopack skriver inga ruttstorlekar. Bygget kördes före rättningarna nedan; `npx tsc --noEmit` är grön efter dem.
- **Klicktest a, Översikt (Premium, 1440 och 412):** väggens primärknapp "Förbered intervjun" landar på tjänsten med `?steg=forbered` och blocket Förbered intervjun; bakåt fungerar. "Öppna utkastet" landar på Norrmejerier med `?steg=folj-upp` och det sparade utkastet. Ändra veckans mål öppnar arket och stängs med Esc. "Logga sökt tjänst" går till `?logga=1` och öppnar arket. Telefonens fyra flikar (höjd 44) når alla fyra sidor med rätt aktiv flik. Profilkompletteringens fält Telefon och Ort ligger i linje (samma överkant). "Skriv brevet" var trasig, se Rättat.
  - En landning på `/dashboard` utan parametrar öppnar senaste rummet (Personliga brev efter ett besök i skapa-brev). Det är regeln, inte ett fel; Översikt prövades med `/dashboard?oversikt=1`.
- **Klicktest b, Matchade jobb (Premium):** vald annons står i adressen, bakåt och framåt fungerar; Spara till Ska sökas ger "Sparad i Ska sökas" och raden syns under Sökta tjänster (filtret Ska sökas); Markera som sökt därifrån öppnar arket förifyllt (tjänst, arbetsgivare, dagens datum) och tjänsten hamnar bland de sökta; Skriv brev från en träff öppnar skapa-brev med annonsen ifylld.
- **Sammanfattningsvägen (Premium):** Matchade jobb läste sammanfattningen, och träffarna var desamma som ur hela körningen (11 av 11, samma ordning; kontrollerat med en tillfällig logg som är borttagen). Läsningen av hela körningen tog 3,8 s i samma anrop, vilket sammanfattningen sparar.

### Rättat under slutkontrollen

1. **Dina brev** (`src/components/brev3/hem/data.ts`): jobblistan "Börja med ett jobb som passar ditt CV" hämtas genom `hamtaBasta` (samma väg som Översikt och Matchade jobb: sammanfattningen, annars hela körningen, med ort och avstånd) i stället för de tolv första annonserna i körningen. Inget annat i brevrummet är ändrat.
2. **"Skriv brevet" i Att göra nu** (Sök före sista dag) pekade på `/dashboard/skapa-brev?ska-sokas=<id>`, som ingen läste: Skriv brev öppnades tomt. Ny rutt `/dashboard/sokta-tjanster/skriv-brev?id=<id>` (`page.tsx` och `src/components/jobb3/sokta/TillSkrivBrev.tsx`): en sparad träff som finns bland de bästa går till Matchade jobb med `?skriv=1` (hela annonstexten), annars fylls Skriv brev i med raden (tjänst, arbetsgivare, ort, länk) genom samma förifyllning som Matchade jobb använder. Prövat: Ålö AB (en träff som inte finns i körningen) öppnade Skriv brev med tjänsten ifylld.
3. **Sidomenyns märke vid Matchade jobb** (`src/lib/dashboard/getSummary.ts`): finns tabellen men ingen sammanfattning för kontot står inget märke, i stället för `matchningar_nya()` (som räknar alla lästa annonser och kunde visa upp till 25 fast listan hade färre). Reserven gäller bara om tabellen saknas.

### Kvar att kontrollera (i prioritetsordning)

1. **Gratisnivån och sammanfattningen:** gratiskontot har ingen sammanfattning än. Ladda Matchade jobb (reserven skriver den), ladda om Matchade jobb och Översikt (läser den), kontrollera att HTML:en bara har de tre öppna annonserna och att en ny sökning eller ändrad sökprofil ger en ny sammanfattning. Kräver dev-server och gratiskontot.
2. **Klicktest c till j:** Sökta tjänster (logga Jag har sökt och Jag ska söka, förifyllt via adressen, Lista/Statistik/Rapport och filter med bakåt, sök), en sökt tjänst (Kallad till intervju med dag, tid och plats, Ändra tid, Rätta en händelse, Redigera, Ta bort), Hur gick intervjun?, uppföljningen (Premium hela vägen och gratisväggen med `plats=uppfoljning`), Rapporten (månad, kopiera, delningslänk, gratislåset), Inför intervjun (svar och bedömning, ett AI-anrop, "upp från", Uppdatera), Jobbcoachen (förslag i fältet, en fråga, ett AI-anrop), Bli upptäckt (fällning före laddning, ingen hydreringsvarning), Meddelanden, Arbetsstil, omdirigeringen från `/dashboard/introduktion`, Dina brev med listan från rättning 1.
3. **Strecket i korten och hydreringsvarningen** (punkt k): inte prövade i webbläsaren. Jämför deviceScaleFactor 1 och 2 och läs attributet med React:s utvecklingsvarning i konsolen.
4. **Tomma lägen** för Sökta tjänster och Översikt (punkt l).
5. **Slutbilder** (1440 och 412, gratis och mörkt läge): inga tagna.
6. **Prestanda** (`npx tsx scripts/perf-inloggat.ts --port <p> --filter ...` mot `npx next start`, efter ett nytt bygge med rättningarna): inte körd. Före sammanfattningen tog läsningen av hela körningen 1,5 till 6,6 s (A:s mätning), i slutkontrollen 3,8 s.
7. **Ett nytt `npm run build`** med rättningarna 1 till 3.

## Rättningar efter slutkontrollen (2026-11-21, gren `fix/jobbsoket-slutkontroll`)

Punkt 1 till 7 i "Görs nu i den här sessionen" i `docs/beslut-jobbsoket-2026-11-21.md`. Inget commitat; bara raderingen i punkt 1 är stagead. Under arbetet kördes bara enstaka vitest-filer, ingen typkontroll, inget bygge och ingen webbläsare.

1. **Skärmbilden** `public/Skärmbild 2025-09-26 220531.jpg` borttagen med `git rm`. Bilden visar en gammal dashboard; kontonamnet som syns ser ut att vara ägarens eget (förnamnet stämmer med ägarens), inte en kunds. Den visar också titlar på två egna brev med företagsnamn och "140 aktiva användare", inget annat känsligt. Ingen fil i `src` eller `content` hänvisar till den. Ej prövat: att adressen ger 404 på den lokala servern.
2. **Kampanjmejlet pensionerat.** `src/app/api/admin/email/campaign/route.ts`: POST svarar 410 med "Mejlet är pensionerat 2026-11-21. Texten stämmer inte längre med produkten." i alla lägen, efter adminkontrollen; utskickskoden och Resend är borta ur rutten. GET orörd. `src/lib/email/campaign-sokta-tjanster.ts` har en kommentar överst om varför. Ej prövat mot servern.
3. **Profilvisningarna** räknas som visningar: `src/components/jobb3/oversikt/oversikt.ts` (`bliUpptacktRad`) och testet i `__tests__/oversikt.test.ts`, `src/lib/rum/copy.ts` (`BLI_UPPTACKT.tittat`), `src/app/dashboard/bli-upptackt/BliUpptacktClient.tsx` ("visning/visningar **av profilen**"), `src/app/dashboard/bli-upptackt/components/ProfileStrengthCard.tsx` och kitsidan `src/app/jobb3-kit/page.tsx`. Ingen sträng i `src` säger längre att ett antal rekryterare har sett profilen. Kvar och rätt: mejlet `recruiter-interest.ts` (namngiven arbetsgivare) och notisklockans tomma läge ("när en rekryterare tittat på din profil", inget antal). Den publika `/verktyg/bli-upptackt` har inte samma påstående.
4. **Delningssidan och rutan.** `src/app/dela/sokta-tjanster/[token]/page.tsx`: raden "Sökt 6 november 2026" (`langDagMedAr`) och väggens ingress "Läget den 21 november 2026." (`langDagMedAr(idagSv())`). `langDagMedAr` fanns redan i `src/lib/jobbsok/datum.ts`; vitest-fall i `src/lib/jobbsok/__tests__/datum.test.ts` (också strax efter svensk midnatt). `src/components/jobb3/sokta/Rapport.tsx`: rutans nya text och kryssrutans nya text; rapportbladets fot skriver dagens datum med `langDagMedAr(idagSv())` i stället för `Intl` utan tidszon, så servern och webbläsaren skriver samma dag. Ej prövat: delningssidan i 412 och 1440.
5. **Spärren för intervjusteget.** `src/lib/jobbsok/lage.ts`, `kanBliTyst`: kallad (med eller utan tid), genomförd intervju och genomfört provjobb blir aldrig tysta; kommentaren säger att spärren gäller till omgång 2. Testet i `src/lib/jobbsok/__tests__/motor.test.ts` omskrivet (kallelse utan tid och genomförd intervju för 20 dagar sedan är inte tysta, står under Intervju i listan, inte under Följ upp). Genomläst: Att göra nu, listans grupper, tjänstens sida (kallelse utan tid får blocket Förbered och ingressen "Sätt tiden när du vet den", genomförd står som Intervju genomförd), coachförslagen, statistiken, tratten och banan, `tystnad.ts` (notisen och veckobrevet). Ingen text ändrad. Kvar som förut: en tjänst i intervjusteget som redan har ett osparat uppföljningsutkast visar Följ upp-blocket på tjänstens sida (`TjanstVy.tsx`, `t.tyst || u.utkast`); inte ändrat. Ej prövat i webbläsaren.
6. **Nolläget på Översikt.** `src/lib/jobbsok/adress.ts`: `soktaHref` tar `fran`, som sätts i adressen; tolkningen läser den inte (test i `motor.test.ts`). Sidan låter parametern stå kvar medan arket är öppet (den tas bort när arket stängs, som `logga`), och PostHog fångar sidvisningen vid adressbytet. `src/lib/jobbsok/attGora.ts`, `sokEnTill`: "Sök din första tjänst" och den nya texten utan bästa träff när kontot inte har några rader; nytt test i `motor.test.ts`, och det gamla testet för "Sök en tjänst till" har nu en sökt tjänst i indata. `src/components/jobb3/oversikt/OversiktVy.tsx`: länken "Har du redan sökt en tjänst? Logga den" i `NyVy` (`fran=oversikt-ny`) och under väggens knapp i `MainVy` i alla bredder (`fran=oversikt-forsta`). Länkarna står under varandra genom en ny variant `Chips stapel` (`src/components/jobb3/kit/JobbVagg.tsx`, `src/app/jobb3.css`: kolumn, radbrytning tillåten, 44 px tryckyta som förut). Väggens höjd är en minsta höjd och växer av sig själv; ingen höjd ändrad. Ej prövat: 412 x 915 och 1440, att inget täcks eller klipps, och att trycket öppnar arket.
7. **Listan i delningslänken är Premium.** `src/app/api/applications/share/route.ts`, POST: `show_company_names` är sann bara när anropet ber om det (`=== true`, tidigare var standardvärdet sant) och `userHasPremiumAccess` (samma som rapporten) säger ja; svaret har `showCompanyNames`. Nytt test `src/app/api/applications/share/__tests__/route.test.ts`. `Rapport.tsx`: med `last` ersätts kryssrutan av "Listan med företag, tjänst och datum ingår i Premium. Länken visar antalen." och listan begärs aldrig. Befintliga länkar rörs inte. Ej prövat med riktiga konton.

Körda testfiler (en i taget, alla gröna): `oversikt.test.ts`, `datum.test.ts`, `motor.test.ts`, `followUp.test.ts`, `weekly-digest.test.ts`, `share/__tests__/route.test.ts`.

### Efter klicktestet i produktion

Underlag: `docs/qa/jobbsoket-slutkontroll-2026-11-21.md`. Inget commitat, ingen databas, inget bygge, ingen webbläsare. Nya fall i `src/lib/jobbsok/__tests__/datum.test.ts` och den nya `src/lib/jobbsok/__tests__/klicktest-2026-11-21.test.ts`.

1. **Sista ansökningsdag en dag fel på servern (React #418).** Orsak: AF:s `application_deadline` ("2026-11-30T23:59:59") saknar zon och är svensk tid; `dagFor()` gjorde `new Date(v)`, som servern (UTC) läste som 00.59 den 1 december i Stockholm. Ändrat: `dagFor` läser en tid utan zon som svensk lokal tid (dagen är datumdelen), ny `tidpunkt(v)` ger millisekunder på samma sätt (`src/lib/jobbsok/datum.ts`). Samma fel rättat i `src/components/jobb3/jobb/annons.ts` (`arNy`, publiceringsdagens "för N dagar sedan", "Sista ansökningsdag" i brevunderlaget), `src/lib/rum/nyaTraffar.ts` (nya bland de bästa) och `MatchArk.tsx` (CV:ts datum med `timeZone`). Date- och timestamptz-kolumnerna (sökdatum, händelsens dag, `interview_at`, `sent_at`) flyttas inte; testat. Kvar i matchningens filer (rörs av den andra sessionen): `relativDatum` i `match-reasons.ts` och `Date.parse(job.publication_date)` i `hamtaToppTraffar`. Se i webbläsaren: annonsen med sista dag 30 nov säger "30 nov, 9 dagar kvar" på Matchade jobb och Översikt, och ingen #418 i konsolen.
2. **"Ja, det är skickat" skrev ett nytt AI-utkast.** Orsak: `Uppfoljning`s effekt hade `start.utkast` som beroende; `router.refresh()` efter ja gav `start.utkast = null`, effekten körde igen och POST skrev ett nytt utkast. Ändrat (bara klienten, rutten orörd): hämtningen körs bara vid monteringen; vid start läses läget ur `start` och är tjänsten uppföljd inom påminnelsetiden (`nyligenUppfoljd` i `src/lib/jobbsok/uppfoljning.ts`) visas "Följde upp ..." med Ångra utan anrop. Tjänstens sida visar blocket Följ upp även när tjänsten följdes upp i dag, så att läget står kvar efter omladdning med och utan `?steg=folj-upp`. Ångra går tillbaka till läget före (utkastet, betalväggen) utan anrop, eller läser läget med GET innan något skapas. Filer: `src/components/jobb3/sokta/Uppfoljning.tsx`, `TjanstVy.tsx`. Se i webbläsaren: Premium, Kopiera mejlet, Ja: "Följde upp i dag" och Ångra, inget nytt POST i nätverket; ladda om med och utan `?steg=folj-upp`: samma läge; Ångra: utkastet tillbaka. Gratis: "Jag har redan skickat det" efter betalväggen, ladda om: "Följde upp i dag", ingen 402.
3. **Kallelse före sökdatumet.** Orsak: triggern räknar statusen efter datumen, och en händelse före sökdagen räknades bort. Ändrat: `handelseForeSokt`, `soktEfterHandelse`, `tidigasteHandelse` och texterna i `src/lib/jobbsok/validering.ts`; 400 `invalid_field` i `POST /api/applications/[id]/events`, `PUT .../events/[eventId]` (inte för "Sökt") och `PUT /api/applications/[id]` (bara när sökdatumet ändras, så att äldre rader går att redigera). Arket Lägg till händelse (`SmaArk.tsx`) har `min` = sökdagen och samma fel; Redigera sökt tjänst (`LoggaArk.tsx`) har `max` = tidigaste händelsen och samma fel. "Den är genomförd" (utfall-rutten) och "Sökt ändå" går inte genom kontrollerna. Se i webbläsaren: kallelse med dag före sökdagen ger texten i arket; sökdatum efter en händelse ger "Du har en händelse den ...".
4. **Block som stod kvar.** Orsak: (a) `fastBlock` i `TjanstVy` höll kvar "hur-gick" när serverdatan inte längre gav det; (b) händelselistan kom bara ur serverdatan efter `router.refresh()`, som i produktion var långsam, så raden "läggs till när du har skickat" stod kvar. Ändrat: bara Följ upp står kvar som valt block; Hur gick intervjun? göms direkt efter svaret; uppföljningen som just loggades visas direkt som "Följde upp" (`foljdeUppRad` i `src/lib/jobbsok/handelser.ts`) och tystnaden räknas bort tills serverdatan har raden. Fil: `TjanstVy.tsx`. Se i webbläsaren: "Den är genomförd" tar bort frågeblocket direkt; efter ja och efter "Jag har redan skickat det" står "Följde upp 21 nov" i händelserna direkt och raden "läggs till" är borta.
5. **Ta bort på en aktiv Ska sökas-rad.** Ändrat: `SparadKort` (`src/components/jobb3/kit/Rader.tsx`) har `bort`, en egen rad under foten i alla bredder; `Lista.tsx` lägger "Ta bort" där med samma fråga och DELETE som den passerade raden; `src/app/jobb3.css` (`.j3-spar-bort`, 44 px tryckyta under 1280 px). Se i webbläsaren: 412 och 1440, "Skriv brev" behåller 48 px, "Ta bort" står under, frågan "Ta bort raden?" och raden försvinner.

### Matchningens läsning och sparning

**Orsaken.** Fel 2 och 3 i punkt 1 av `docs/qa/jobbsoket-slutkontroll-2026-11-21.md`. Varje laddare (Matchade jobb, annonsrutten, Översikt, Dina brev, Skriv brev-rutten) gick genom `hamtaBasta`, och när sammanfattningen inte dög läste var och en hela körningen (`jobs`, 1,9 MB i snitt, 3,7 MB som mest) för sig. Inget delades mellan dem, och när läsningen föll på tidsgränsen skrevs ingen sammanfattning, så nästa laddning läste igen. Läsfelet gav `null`, alltså samma svar som "ingen körning", och sidan sa "Vi har inte letat än". Målgången (`mina-brev/[id]/skickat`) läste `jobs->0` till `jobs->9`, vilket också packar upp hela kolumnen. På telefonen stod samma annons i både telefonvyn och den dolda datorpanelen, och båda hämtade den. Klienten skickade sin sammanfattning först när `hasMore` blev falskt; påfyllningen läser den sparade körningen och gör om hela sökningen när sparningen fallit (cirka 35 s), så en omladdning dessförinnan gav ingen sammanfattning alls. Efter en ändrad sökprofil räknade servern om ur den gamla körningen och skrev över sammanfattningen med den gamla tiden. "Senast sökt" tog tiden när sessionStorage skrevs, och serverns suddning stod kvar över de återställda raderna tills `/api/jobs/redact` svarat.

**Ändrat i appen.**
- `src/lib/jobmatching/kalla.ts` (ny, ren): valet av källa. Läget `liten` läser aldrig hela körningen; läget `hel` läser den bara när ingen sammanfattning duger, och aldrig när sammanfattningen är mer än två minuter nyare än körningen (då räknas en ändrad sökprofil om ur sammanfattningens annonser). Prövat i `src/lib/jobmatching/__tests__/kalla.test.ts`.
- `src/lib/jobmatching/sammanfattning.server.ts`: `hamtaBastaUtfall` (ger `{ basta, lasfel }`), `hamtaBasta(…, lage = 'liten')`. Hela körningen läses genom `lasHelaKorningen` med React `cache`, högst en gång per förfrågan. Går läsningen fel visas sammanfattningen för CV:t även med äldre sökprofil; finns ingen blir det `lasfel`. `hamtaPool` ger sammanfattningen när den är nyare än körningen.
- Översikt (`hamtaToppTraffar`), Dina brev (`brev3/hem/data.ts`), Skriv brev-rutten och Målgången läser bara sammanfattningen. Utan sammanfattning visar de samma tomma läge som förut när `hamtaBasta` gav null. Sidomenyn läste redan bara `publicerade`.
- Matchade jobb (`page.tsx`, `senasteKorning.ts`) och annonsrutten använder läget `hel`. Vid läsfel utan sammanfattning visar sidan Felrutan "Vi kunde inte hämta alla träffar just nu. Försök igen." (befintlig text) med omladdning, inte "Vi har inte letat än".
- `MatchadeJobb.tsx`: sammanfattningen skickas när första omgången är rankad och igen när påfyllningen ändrat toppen; "Senast sökt" tar sökningens tid (sessionStorage) och poolens körningstid när poolen hämtats; suddningen nollställs när listans källa byts; samma annons hämtas en gång även när två vyer ber om den; `sparad: false` från match-jobs hoppar över påfyllningen.
- Datumrättningen ovan följd upp i `match-reasons.ts` (`relativDatum`) och `hamtaToppTraffar` ("ny"): `tidpunkt` i stället för `new Date`/`Date.parse`.

**Förberett i edge-funktionen, väntar på ägarens ja (inte driftsatt).** `supabase/functions/match-jobs/index.ts`: felet från upserten kontrolleras och loggas ("Cache save FAILED", aldrig "Cached" vid fel); de 300 bästa sparas (som före höjningen till 600) i stället för 600, utan fält som ingen läsare använder (`scoringBreakdown`, `quickScore`, `logo_url`, `number_of_vacancies`, `scope_of_work`, `salary_type`, `duration`); `total_jobs_found` är som förut; svaret har `sparad` (true/false/null). Appens kod fungerar med både gamla och nya funktionen.

**Rättelse om varför sparningen föll (samordnaren, 2026-11-21 kväll).** Klicktestet skrev att upserten föll på tidsgränsen. En annan session hittade samma dag den verkliga orsaken och rättade den i produktion (commit `ea919c90`, migreringen `20261121150000_job_matchings_cache_skrivsparr`, körd cirka 15.24): utlösaren `set_job_matchings_cache_updated_at` skrev i kolumnen `updated_at`, som inte fanns, så varje uppdatering av en befintlig cacherad föll med 42703. Klicktestets sökning gjordes 15.10, före rättningen. Sparningen ska alltså fungera i produktion nu, och det är inte prövat efter rättningen. Läsningarna av `jobs` som föll på tidsgränsen (fem på en minut) är en egen sak och rättas av ändringarna ovan. Nedskärningen till 300 sparade annonser behövs därmed inte för att sparningen ska gå igenom: den halverar tiden för läsningen. Grenen har slagit in `ea919c90`, så edge-funktionen på grenen bär både den sessionens säkerhetsrättning (användaren ur inloggningen) och ändringarna här.

**Ses i webbläsare.** Gratis och Premium, 1440 och Pixel 7: (1) Matchade jobb med en körning visar träffarna, och Postgres-loggen har högst en GET `job_matchings_cache?select=jobs,...` per laddning, ingen när sammanfattningen gäller; (2) Översikt och Dina brev ger ingen sådan GET; (3) ny sökning, ladda om innan påfyllningen är klar: listan är den nya sökningen och "Senast sökt" säger sökningens tid; (4) ändra sökprofil efter en sökning vars sparning föll: listan räknas ur den nya sökningen; (5) telefonen med `?annons=<id>` för en annons som inte följde med sidan: ett anrop till `/api/jobbmatchning/annons`; (6) gratis: HTML:en bär tre öppna annonser och en dold annons ger 404 i annonsrutten.

### Tre rättningar till

Inget commitat, ingen databas, inget bygge, ingen webbläsare.

1. **Markera som sökt på telefon.** Orsak: `.j3-spar-handling .j3-lank` var dold under 1280 px på aktiva rader, och tipset "Tryck på kortet och välj Markera som sökt" pekade på ett tryck som inte fanns (`SparadKort` har inget klick på kortet). Ändrat: länken syns i alla bredder med 44 px tryckyta; foten får radbrytas så att länken hamnar på egen rad om 360 px inte räcker, knappen till höger (`src/app/jobb3.css`). Tipset struket i `src/components/jobb3/sokta/Lista.tsx`. Kommentaren i `Rader.tsx`, kitsidan (exemplet har nu "Ta bort" också) och `docs/bygg-noter-jobbsoket-kit.md` följer med. "Ta bort" (`.j3-spar-bort`) ligger kvar sist. Se i webbläsaren: 360, 412 och 1440, aktiv rad: "Markera som sökt" syns och öppnar arket, "Skriv brev" 48 px, "Ta bort" under; passerad rad: "Ta bort" och "Sökt ändå" som förut.
2. **Målgången** (`src/app/dashboard/mina-brev/[id]/skickat/page.tsx`): sista ansökningsdag med `dagFor` och `kortDag` ur `src/lib/jobbsok/datum.ts` i stället för `Intl` på `new Date(...)`, samma ordalydelse ("30 nov"). Förslaget väljs bland de träffar kontot får se: gratis de tre öppna, Premium som förut de tio första. Ingen oskriven bland dem: sidans läge utan förslag. Träffarna läses nu genom `hamtaBasta` (läget `liten`) för det aktiva CV:t, som Skriv brev-rutten, i stället för sammanfattningen rakt av; utan aktivt CV eller sammanfattning för det CV:t blir det inget förslag.
3. **Skriv brev-rutten** (`src/app/dashboard/sokta-tjanster/skriv-brev/page.tsx`): en sparad träff går till Matchade jobb bara om den är öppen för kontot. En dold träff för ett gratiskonto går den andra vägen, Skriv brev förifyllt med radens uppgifter. Förut kunde den gå till Matchade jobb, som då visade den första öppna annonsen med `skriv=1`.

Delat: `src/lib/jobmatching/oppna.ts` (`oppnaTraffar`, ren) och `src/lib/jobmatching/oppna.server.ts` (`hamtaOppnaTraffar`: aktivt CV, sökprofil, `job_matches_all` och `hamtaBasta` i läget `liten`). Test: `src/lib/jobmatching/__tests__/oppna.test.ts`. Matchade jobb och annonsrutten har kvar sin egen `slice(0, FREE_TIER_JOB_LIMIT)`, samma regel.

## Migreringar

- `20261121180000_jobbsoket_omgang1.sql`: körd i produktion 2026-11-21 med ägarens ja.
- `20261121200000_jobbmatchning_sammanfattning.sql` (tabellen `job_matching_summaries`, RLS på, en läspolicy): körd i produktion 2026-11-21 med ägarens ja.

Båda är bara tillägg (nya tabeller och nullbara kolumner) och går att köra flera gånger.

## Backa

- **Koden:** `git revert` på slutkontrollens commit backar rättningarna ovan. Hela omgången backas genom att inte slå in `feat/jobbsoket-a`, eller med `git revert -m 1` på sammanslagningen i main. Grenarna B och C finns kvar som de var (`feat/jobbsoket-b`, `feat/jobbsoket-c`).
- **Databasen:** migreringarna kan stå kvar när koden backas; gammal kod läser inte de nya tabellerna och kolumnerna. Rollback-SQL står överst i varje migreringsfil och körs först när koden som läser dem är backad.
- **Testdatan:** grunddatan på QA-kontona står i `scratchpad\jobbsok\bygg\motor\testdata.json`, `...\a\testdata.json` och `...\c\testdata.json`, med id per rad.
