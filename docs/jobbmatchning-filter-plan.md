# Plan: Jobbmatchning — filter, sök-UX & design-uppfräschning (Fas 1)

## Kontext

Vi använder bara ~9 av ~40 JobSearch-API-parametrar. Användaren vill (1) ge tre sökvägar: matcha mot CV (som nu), CV + filter, eller fritt sök med filter; (2) fräscha upp UI:t — bort med lila/indigo-element till förmån för appens orange-design; (3) göra sökrutan tydlig (idag svår att se); (4) lägga filtren i en synlig panel/sidebar; (5) lägga till ortsfilter geografiskt anpassat efter användaren. Allt **mobile first**.

Beslut (bekräftat): **allt-i-ett sökvy** (inget förhandsval av läge — CV-matchning är default, filter/fritext förfinar), **server-side filtrering** (filtren skickas till JobSearch så rätt urval rankas).

## Verifierade fakta (mot live-API)

- JobSearch keyless. Filter kombineras med `occupation-name` (concept_id) server-side: 146 → 4 remote, → 41 senaste veckan, 215 inom 30km. Verifierat.
- Jobb-hit innehåller `working_hours_type`, `scope_of_work`, `application_deadline`, `municipality` (visas delvis redan).
- `SWEDISH_MUNICIPALITIES` (290 orter med lat/lon) finns redan i [match-jobs/index.ts](supabase/functions/match-jobs/index.ts) — återanvänds för geo-radie OCH för att föreslå närliggande orter.

## Filter i denna fas

| Filter | JobSearch-param | UI-kontroll |
|---|---|---|
| Distansjobb | `remote=true` | Toggle |
| Heltid/deltid | `worktime-extent` (concept_id) | Segment (Alla/Heltid/Deltid) |
| Utan krav på erfarenhet | `experience=false` | Toggle |
| Publicerat senaste | `published-after=<min>` | Segment (Alla/24h/3d/7d) |
| Sortering | `sort` | Segment (Relevans/Nyast/Deadline) |
| Geo-radie | `position`+`position.radius` | Slider (km) |
| Orter (geografiskt) | `municipality` (concept_id) | Chips: användarens ort + närliggande föreslagna |

## Designändringar (orange, mobile first)

Appens gradient: `from-orange-500 via-red-600 to-pink-700`. Inputfokus: `focus:ring-orange-500`.

- **Byt ALLA indigo/purple/pink-element** i [jobbmatchning/page.tsx](src/app/dashboard/jobbmatchning/page.tsx) till orange: sökrute-fokus (rad 469), sök-knapp (474), retry-knapp (495), distans-checkbox (511-515), "fler jobb"-CTA-blocket (547, 562). Inga lila kvar.
- **Sökrutan tydligare:** större, tydlig kant, egen rubrik ("Sök fritt eller förfina"), placeholder som förklarar. Ligger överst, alltid synlig i sökvyn.
- **Bort med "Hitta lediga tjänster"-knappen** på CV-översikten (den stora orange CTA längst ner). Ersätts med naturlig övergång: aktivera CV → sökvyn öppnas direkt (eller en diskretare "Visa matchande jobb"-länk). Utvärdera vid impl vilken som känns bäst, men den stora knappen tas bort.
- **Filterpanel:** på desktop en vänster-sidebar bredvid resultaten; på mobil en utfällbar "Filter"-knapp som öppnar panelen (drawer/accordion). Mobile-first: panelen får inte tränga ut jobben på liten skärm. Återanvänd kort-/chip-stilen från CV-sidan (rundade, orange).
- **Resultaträknare** ("241 jobb, 87 höga matchningar, 69% snittrelevans") behålls/stylas om i orange.

## Ortsfilter — geografiskt anpassat

Användaren har `extracted_location` (t.ex. "Stockholm"). Härled närliggande orter via `SWEDISH_MUNICIPALITIES` + `calculateDistance` (finns redan): visa användarens ort + de N närmaste som valbara chips. Vald ort → `municipality` concept_id i sökningen (kräver ort→concept_id-uppslag; municipality-concept_id finns redan på jobb-hits och kan mappas, alt. slå upp via taxonomy en gång).

## Ändringar per lager

### Edge ([match-jobs/index.ts](supabase/functions/match-jobs/index.ts))
- Ta emot `filters`-objekt i request (rad ~28). Skicka in i `aggregateJobs` (rad ~178).
- **Cache-nyckel (KRITISKT):** lägg `filter_hash`-kolumn i `job_matchings_cache` (SHA-256 av filter-objektet). STEG 0 läsning + STEG 8 upsert på `user_id,cv_id,filter_hash`. Tomma filter → stabilt hash = dagens standard-cache. Migration krävs.

### Aggregator ([multi-source-aggregator.ts](supabase/functions/match-jobs/multi-source-aggregator.ts))
- Utöka params + `fetchWithPagination` med `remote`, `worktime-extent`, `experience`, `published-after`, `sort`, `position`+`position.radius`, `municipality`. Appliceras på alla sök-strategier.

### Frontend ([jobbmatchning/page.tsx](src/app/dashboard/jobbmatchning/page.tsx))
- Nya state för varje filter; skicka i `requestBody.filters`; kör om `fetchJobs()` vid ändring.
- Ny `<JobFilterPanel>`-komponent (sidebar desktop / drawer mobil). Ny/omstylad sökruta. Byt alla lila → orange. Ta bort stora CTA-knappen.
- Geo: härled närliggande orter klientsidan från användarens ort (kommun-koordinattabell kan speglas till frontend eller exponeras via en liten endpoint).

## Vad som INTE ingår (separat fas)
- Schemalagda match-mejl / "nya jobb"-notiser (cron + mejl). `published-after`-FILTRET finns dock i UI:t.
- `skill`/`language`-concept_id-filter (kräver Taxonomy-uppslag av CV-skills).
- JobEd Connect / SSYK.

## Risker & mitigering
| Risk | Mitigering |
|---|---|
| Cache returnerar fel resultat per filter | filter_hash i cache-nyckeln; testa två filterset |
| worktime-extent/municipality fel concept_id | Slå upp + verifiera mot taxonomy live före deploy |
| Hårda filter → tom lista | UI visar tydlig "X jobb matchar"; filter är opt-in |
| Designomskrivning bryter layout | Mobile-first, testa 360px-bredd; behåll befintlig grid |
| Edge-deploy fel kod | Deploy från synkade match-jobs/ via `--use-api`, jämför version |

## Verifiering
- Varje filter: kör match-jobs, bekräfta rätt/färre jobb, körtid under budget, inga 546.
- Cache: två filterset → olika resultat; standardsökning → cachas som förut.
- Mobil (360px) + desktop: filterpanel, sökruta synlig, inga lila element kvar.
- Ortsfilter: användarens ort + närliggande föreslås korrekt.
- Grundmatchning utan filter: topp-jobb oförändrade (ingen regression).

## Leverans
Ny branch `feat-jobbmatchning-filter`. Edge via `--use-api`. Separata commits (edge/aggregator, design+sökruta, filterpanel, ortsfilter). Ingen merge till main förrän verifierat på mobil + desktop.
