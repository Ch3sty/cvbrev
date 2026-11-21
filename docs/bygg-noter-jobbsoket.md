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
