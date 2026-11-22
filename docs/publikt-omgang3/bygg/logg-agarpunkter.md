# Logg: ägarpunkterna (2026-11-22)

Grenen `design/publikt-omgang3` i `C:\Users\chris\cvbrev-publikt3`. Underlaget är `docs/publikt-omgang3/beslut-agarpunkter.md` (saas-lead). Lydelserna är införda ordagrant. Inget är pushat, inga mejl skickade, ingen SQL körd av mig och inga anrop mot produktionen.

Under arbetet kom samordnarens besked att S-1 är körd i produktion (ägarens ja, `docs/publikt-omgang3/bygg/logg-s1.md`). Därför är också de fyra FAQ-svaren om säkerhet (D-1 till D-4) införda, och migreringen för `cvs` är märkt som redan körd.

## Commits

| Hash | Vad |
|---|---|
| `87c8917f` | Lagringen: vägarna i `cvs`, S-1:s migrering, profilfotots regler som ej körd fil |
| `650d6d4d` | Mejlen och Premiumlistan, M1 till M27 |
| `94e05778` | D-13 (inga uppgifter om tjänsten i adressen) och `email_events` vid kontoradering |
| `8c172e49` | Publika texter: /integrationer, D-1 till D-12, undantagsraderna |
| (denna) | Delningsbilden på /integrationer, migreringen exakt som körd, loggen och SEO-avtrycket |

## Migreringarna

- `supabase/migrations/20261122180000_cvs_egen_mapp.sql`: exakt det som kördes i produktion 2026-11-22 (drop med `if exists`, fyra regler, uppdateringen med både `using` och `with check`, i `begin`/`commit`). Märkt som redan körd. Kör den inte igen.
- `supabase/migrations/20261122190000_profile_photos_egen_mapp.sql`: **inte körd**, ägarens beslut. Ett eget avgränsat block med fyra regler för `profile-photos`: bara den egna mappen `users/<id>/`. Den tar inte bort några befintliga regler på hinken, eftersom deras namn inte syns i koden (läs `pg_policies` först).

## Genomgången av lagringens sökvägar

Alla anrop mot `storage` i `src`, `supabase/functions` och `mobilapp` (sökning på `.storage`, `storage.from(`, `getPublicUrl`, hinkarnas namn).

### Hinken `cvs` (reglerna gäller live sedan S-1)

| Anrop | Nyckel | Väg | Resultat |
|---|---|---|---|
| `src/app/api/cv/upload/route.ts`: `list(userFolder)`, `upload(.placeholder)`, `upload(sparSokvag, upsert)`, `download(original_file_path)` | användarens | `users/<id>/<rensat filnamn>`, version `users/<id>/<namn>__v<tid>.<ändelse>` (`unikSokvag`) | ok. Vägen byggs nu i `src/lib/lagring/sokvagar.ts` (`cvSokvag`), samma resultat som förut |
| samma, `getPublicUrl` (rad 371 och 455) | | | ok som funktion: skickas i svaret som `publicUrl`, men ingen klient läser det (`use-profile.ts` lägger det i `cv.url`, som ingen läser). En publik adress till en privat hink fungerar inte; ingenting använder den, så inget slutar fungera. Inte ändrat |
| `src/app/api/cv/route.ts` GET `getPublicUrl`, DELETE `remove(original_file_path)` | användarens | vägen ur `cv_texts` | ok. Samma om `publicUrl` som ovan. Raderingen går på egna rader (`user_id`) |
| `src/app/api/cv/delete/route.ts` `remove([original_file_path])` | användarens | vägen ur `cv_texts` | ok. Alla 354 filer ligger under `users/<id>/` (S-1:s kontroll) |
| `src/app/api/jobbcoachen/upload/route.ts` `upload`, `getPublicUrl` | användarens | `users/<id>/chat_attachments/<samtal eller temp>/<tid>_<filnamn>` | ok, **härdad**: samtalets id kom från formuläret och blev mappnamn rakt av. Nu bara om det är ett rent id (`[A-Za-z0-9_-]{1,64}`), annars `temp` (`bilagaSokvag`). `public_url` läses inte av klienten (`CoachVy` sätter tom sträng) |
| `src/store/cv-store.ts:130-134` `uploadCV` | användarens | `<id>-<tid>.<ändelse>` i hinkens **rot** | hade slutat fungera med de nya reglerna, men **anropades inte**: alla `uploadCV` i appen kommer från `useProfile` (POST till `/api/cv/upload`). Borttagen, med `parseCV`-importen |
| `src/lib/konto/raderaKonto.server.ts` `list`/`remove` | service role | `users/<id>/` rekursivt, uuid-kontroll | ok, går förbi reglerna |
| `supabase/functions/ingest-document` | | hinken `ai-documents` | inte `cvs`, inte rörd |
| Listning av `users/` eller en annans mapp | | | inga sådana anrop i appen. Bara driftskript i `scripts/` gör det, med service role |

**Inget anrop som används på riktigt ligger utanför `users/<användarens id>/`.** Den enda vägen i roten var död kod och är borttagen. Inget slutar fungera när reglerna nu gäller.

### Hinken `profile-photos`

- Uppladdning och byte (`src/app/api/profile/photo/upload/route.ts`) och radering (`.../delete/route.ts`) läser sessionen med användarens cookies men skriver lagringen och profilraden med **service role**, som går förbi reglerna. Vägen är `users/<id>/profile-photo-<tid>.<ändelse>` (nu via `profilfotoSokvag`).
- Ingen kod i appen anropar hinken med användarens nyckel.
- **Svar:** uppladdning, byte och radering av profilfoto fungerar med dagens regler, eftersom reglerna aldrig prövas. De gamla ägarreglerna jämförde första mappen med id:t och hade aldrig träffat `users/<id>/`; de är dessutom borttagna sedan S-1. Hinken är publik, så fotot nås av den som har adressen. Den ej körda migreringen ger användarens nyckel samma gräns som i `cvs`, om någon kod någon gång går mot hinken utan service role.

### Tester

`src/lib/lagring/__tests__/sokvagar.test.ts`: varje väg som rutterna bygger klarar samma prövning som reglerna (första mappen `users`, andra kontots id), också en ny version med samma filnamn och `.placeholder`; ett samtals-id med snedstreck eller punkter blir `temp`; rotens väg, en annans mapp och `users/` själv faller.

## Punkt 1, /integrationer (`src/app/(public)/integrationer/page.tsx`)

Ordagrant enligt beslutet: fyra kort (LinkedIn, Arbetsförmedlingen, Din e-post, Google; `Users` ut och `LogIn` in), `INTEGRATIONER`, hjältens `varde`, läget, vinsterna, förslagsöns `varde`, kommentaren överst. Egen metadata i `page.tsx`: title (49 tecken), description (137 tecken, beslutet säger 138; texten är ordagrant), canonical, robots `index, follow`, Open Graph och Twitter.

Upptäckt i grinden: en egen `openGraph` ersätter rotens, så sidan tappade rotens delningsbild. Rättat: bilden (`/opengraph-image`, 1200 x 630) står uttryckligen i `openGraph.images` och `twitter.images`.

Undantagsrader: `META_BYTT` för title, description, canonical och robots (robots behövdes också, eftersom sidan hade ingen robots-tagg; canonical läggs som `META_BYTT`, eftersom grindens `META_TILLAGD` inte läses ur undantagsfilerna), `RUBRIK_BYTT` för de tre rubrikerna. Sidan ligger utanför den hårda regeln, så rubrikbytena redovisas ändå bara.

## Punkt 2, datalagring och säkerhet

| Post | Fil | Infört |
|---|---|---|
| D-1 | `src/components/publikt/start/Startsidan.tsx:144` | ja (efter samordnarens besked om S-1) |
| D-2 | `src/app/(public)/funktioner/FunktionerSida.tsx:283` | ja |
| D-3 | `src/app/(public)/verktyg/cv-analys/components/cv-analys-faq-data.ts:46` | ja, med "i en lagring som bara ditt konto når" (S-1 är körd och kontrollerad). Meningen gäller CV-filen, som ligger i `cvs`; inget om profilfoton |
| D-4 | `src/app/(public)/verktyg/personligt-brev/components/brev-faq-data.ts:27` | ja |
| D-5 | `src/app/(public)/for-rekryterare/components/rekryterare-faq-data.ts:16` | ja |
| D-6 | `src/app/(public)/exempel/components/ExempelCTABand.tsx:77` | ja |
| D-7 | `src/app/(public)/om-oss/layout.tsx:7` | ja, 157 tecken |
| D-8 | `src/app/auth/forgot-password/page.tsx` | ja, citatet, talen och kommentaren |
| D-9 | `src/app/auth/reset-password/page.tsx` | ja, talen och kommentaren |
| D-10 | `src/app/(public)/verktyg/bli-upptackt/page.tsx` (två kort och `varde`), `components/bli-upptackt-faq-data.ts:10` | ja |
| Rekryterarsvaret | `rekryterare-faq-data.ts:12` | ja. Fotot visas aldrig för rekryterare (ingen träff på foto i `src/lib/recruiter`, `src/app/api/recruiter`, `src/app/rekryterare`), så `, foto` är inte tillagt |
| D-11 | `src/app/(public)/verktyg/sokta-tjanster/sokta-tjanster-data.ts` (nionde frågan), `page.tsx:639` | ja. `APPLICATION_SHARE_TTL_DAYS` flyttad till `src/lib/applications/shareTtl.ts`, återexporterad ur `shareLinks.ts` |
| D-12 | `src/app/(public)/verktyg/jobbcoachen/components/jobbcoachen-faq-data.ts` | ja, efter frågan om att dela CV:t |
| D-13 | se nedan | ja |

`docs/publikt-omgang3/bygg/vantar-pa-s1.md` skrevs med de fyra svaren färdiga att föra in; den är märkt som införd och står kvar som underlag.

### D-13, förifyllningen i adressen

- `soktaHref` tar inte längre `tjanst` och `arbetsgivare` (`src/lib/jobbsok/adress.ts`).
- `src/app/dashboard/sokta-tjanster/page.tsx` läser inga parametrar om tjänsten; `forifylltUr` och propen till `SoktaVy` är borta.
- **En levande väg som beslutet inte nämner:** testernas Hem (`src/components/tester-v4/hem/TjanstFraga.tsx`) skickade `?logga=1&tjanst=...&arbetsgivare=...&fran=test-hem-plan`. Den bär nu tjänst och arbetsgivare i webbläsaren, under nyckeln `jc_sokt_forifyllt` i 24 timmar (`src/lib/jobbsok/forifyllning.ts`, samma mönster som `provaSokt.ts`, allt i try/catch), och adressen bär bara `?logga=1&fran=test-hem-plan`. `fran` är en källmärkning, inga uppgifter om personen.
- `SoktaVy` läser förifyllningen när `?logga` öppnar arket, bara om dess `fran` är samma som adressens, och tömmer den när arket stängs (också efter sparandet). Utan förifyllning läses det publika utkastet som förut.
- Kommentarerna i `LoggaArk.tsx` är omskrivna.
- Tester: `testvag-uppdatering.test.tsx` öppnar nu `?logga=1&fran=test-hem` med förifyllningen i lagringen, och två nya fall (förifyllningen når arket och töms; en med annat `fran` används inte). `HemVy.test.tsx` och `kalladTillTest.test.ts` låser den nya adressen. `forifyllning.test.ts` nytt.
- Steg 6 i beslutet (`$current_url` i webbläsaren med konto) är inte gjort: uppdraget gav inga konton. Adressen är låst i testerna.

## Punkt 3, mejlen

| Post | Fil | Infört |
|---|---|---|
| M1 | `src/lib/plans/plans.ts` (`HELA_PAKETET_RADER`, sex rader, kommentaren) | ja. Test `src/lib/plans/__tests__/hela-paketet-rader.test.ts`; `paketnamn.test.ts` uppdaterad |
| M2, M3 | `src/lib/email/lifecycle/templates/conversion.ts` | ja |
| M4 till M7 | `templates/campaign-gratisniva.ts` | ja, `GRATIS_BREVFONSTER` importerad |
| M8 | `src/lib/plans/gratis-copy.ts` (`GRATIS_TESTRAD = GRATIS_LISTA[0]`, flyttad under listan) | ja, vakt i `gratis-copy.test.ts` |
| M9 | `templates/transactional.ts` | ja |
| M10 till M16 | `templates/komigang.ts` | ja |
| M17 till M19 | `src/lib/onboarding/komigang.ts` | ja. Den lokala `talOrd` blev oanvänd och är borttagen |
| M20, M21 | `src/lib/email/quota-back.ts` | ja, posterna borta ur `FEATURE_COPY`, kommentaren utökad. Rutten `/api/quota/remind` är orörd (mejlregel 2 är ägarens): en påminnelse för `cv_analysis` eller `chat_message` skulle nu få standardtexten ("Din kvot är tillbaka"). Enligt beslutet finns inga väntande |
| M22, M23 | `src/lib/email/recruiter-interest.ts` | ja |
| M24 till M26 | `src/lib/email/password-reset-email-generator.ts` | ja: 24 timmar (HTML och text), låset och varningstriangeln borta (spannet med låset hade bara ikonen och är borttaget), `/support` till `/kontakt` |
| M27 | `src/lib/email/confirmation-email-generator.ts` | ja. Mallen används (`/api/auth/send-confirmation`, anropad från registreringen, `KontoArk`, verifieringsbannern med flera) |

Tester: `src/lib/email/lifecycle/__tests__/agarpunkter-mejl.test.ts` (renderar kvotväggen, gratisnivåns kampanj, uppsägningen, lösenordsmejlet, bekräftelsen och rekryterarmejlet i minnet, och vaktar Kom igång-mallens text), `src/lib/email/__tests__/quota-back.test.ts`.

Mejlreglerna under "Mejlregler, ägarens" är inte rörda. Ingen mottagare eller tidpunkt är ändrad.

### Sökningen i `src/lib/email/**` efter införandet (rapporteras, inte rättat)

- `templates/campaign-gratisniva.ts:52` "Jobbcoachen: tio meddelanden per konto" (sant).
- `templates/komigang.ts:205` preheadern "Utan tak i ..." för Jobbcoachen (beslutet säger att den står).
- `templates/transactional.ts:99` "Erbjudandet gäller en gång per konto." (winback-erbjudandet).
- `quota-back.ts:59` kommentar om "per konto".
- `password-reset-email-generator.ts:121` "💡 Tips för ett säkert lösenord:", en emoji som beslutet inte nämner.
- Utanför mejlen, i samma funktion som M17: `src/lib/onboarding/komigang.ts` rad cirka 520, 552, 567-568 och 594 säger fortfarande "Uppdatera efter fynden", "Poäng, fynd, nyckelord" och "alla fynd med åtgärd" (Kom igångs ingresser i kontot). Inte i beslutet.

Inte gjort: förhandsvisningen i adminens mejlvy med en riktig profil (kräver inloggning som admin mot produktionen).

## Punkt 5, kod som gör policyn sann

`src/lib/konto/raderaKonto.server.ts`: kontots rader i `email_events` raderas på hela mottagaradressen. Adresserna (inloggningens och profilens) läses före raderingen. Resends webhook sparar `data.to` som en lista med en mottagare, så varje adress raderas i två former på `payload->>to`: adressen och `["adress"]`, som den står och med gemener. Aldrig ett mönster. Fel avbryter raderingen före `deleteUser`, som för de andra lösa raderna. Adminens radering (`api/admin/users/[id]` och `bulk`) anropar `rensaLosaRader` före `deleteUser` och får samma radering: utan adresser läser funktionen dem själv. Tester i `raderaKonto.test.ts` (fem nya fall).

Att kontrollera efter deploy (jag har inte läst databasen): att `payload` är `jsonb` eller `json` och att `payload->>to` för en befintlig rad ser ut som `["adress"]`. Gör den inte det raderas inga rader, men raderingen fungerar.

Inte rört, ägarens enligt beslutet: e-postadressen till PostHog, radering av PostHog-personen, profilfotots publika hink, policytexterna.

## Grindarna

Minnet ur `arbetsyta.mjs` före varje tung körning.

| Grind | Minne | Resultat |
|---|---|---|
| `npx tsc --noEmit` (första) | 2,2 GB, försökt två gånger, kört ändå | exit 0, inga fel |
| `npx vitest run` (första) | 3,7 GB | 381 filer gröna, 3 överhoppade; 4 756 tester gröna, 13 överhoppade |
| `npx tsc --noEmit` (efter alla ändringar) | 4,1 GB | exit 0 |
| `npx vitest run` (efter alla ändringar) | 4,0 GB | 381 filer gröna, 3 överhoppade (384); 4 757 tester gröna, 13 överhoppade (4 770); exit 0 |
| Bygge 1, `next build --webpack`, 6 GB heap | 4,2 GB | exit 0, kompilerat på 107 s, 804 statiska sidor, `/integrationer` statisk |
| SEO-grinden 1 | | 498 av 498 svarade 200. **Fel: 3**: de två kända `og:image` och `og:image` borta på `/integrationer` (rättat, se punkt 1) |
| Bygge 2 | | exit 0, 47 s, 804 sidor |
| SEO-grinden 2 (slutlig) | | 498 av 498 svarade 200. **Fel: 2**, bara de två kända lokala (`og:image` på `/verktyg/bli-upptackt` och `/verktyg/personlighetstest`). Rapport `docs/qa/seo-diff/agarpunkter-diff.md`, avtryck `docs/qa/seo-diff/agarpunkter-efter.json`, baslinje `publikt-omgang3-efter-live.json` |

Grindens rader för de rörda sidorna: `/` ord +2,5 %, `/funktioner` +1,6 %, `/priser` +0,8 %, `/verktyg/cv-analys` +1,1 %, `/verktyg/personligt-brev` +1,5 %, `/for-rekryterare` +0,6 %, `/verktyg/bli-upptackt` +4,6 %, `/verktyg/jobbcoachen` +6,7 % med den nya frågan synlig och i FAQPage, `/om-oss` description bytt, `/integrationer` 106 till 257 ord. JSON-LD ändrad bara i tillåtna typer. Product-schemat på `/priser` ändrades inte (listan står inte i schemat), så GEM-4-skälet i raden är bara redovisning.

`/verktyg/sokta-tjanster` (utanför baslinjen): status 200, nio frågor synliga och samma nio i FAQPage, den nya sist. Ta sidans första baslinje mot live efter deploy.

### I webbläsaren

Headless Chrome mot det byggda, en sida i taget, PostHog och förladdning avstängda, inga konton och inga AI-anrop. `/integrationer`, `/auth/forgot-password`, `/verktyg/bli-upptackt`, `/verktyg/sokta-tjanster` och `/verktyg/jobbcoachen` i 375 och 1440: alla 200, en h1, ingen sidledsrullning, inga sidfel. Bilderna `docs/design/publikt-omgang3/bilder-byggt/agarpunkter-<sida>-<bredd>.png` (mappen är gitignorerad). Tittat på: `/integrationer` håller grundens form med fyra kort i fyra färger; Glömt lösenordet visar de nya talen och citatet.

Efteråt: servern och webbläsaren stängda (också en kvarbliven `next start` som TaskStop inte tog), `.next` borttagen, `arbetsyta.mjs` visar inga servrar.

## Efter push

- Revalidera `/`, `/funktioner`, `/verktyg/cv-analys`, `/verktyg/personligt-brev`, `/for-rekryterare`, `/verktyg/bli-upptackt`, `/verktyg/jobbcoachen`, `/verktyg/sokta-tjanster`, `/om-oss`, `/exempel`, `/integrationer`, `/priser`.
- Klicka testernas Hem till arket i Sökta tjänster med ett konto: tjänst och arbetsgivare ifyllda, adressen bara `?logga=1&fran=test-hem-plan`.
- Kontrollera formen på `email_events.payload->>to` (se punkt 5).
