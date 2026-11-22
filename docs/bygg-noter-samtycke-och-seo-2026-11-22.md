# Samtyckesraderna, policyns avsnitt 7 och SEO:s tre uppföljningar (2026-11-22)

Gren `design/publikt-omgang3`, arbetskopian `C:\Users\chris\cvbrev-publikt3`, från `21f64389`. Ingen push.

## Överst: det som avviker

1. **PostHog-personen kom tillbaka efter raderingen.** Nyckeln fungerar: raderingen på live gav ingen rad i `posthog_raderingar`, alltså svarade PostHog 2xx. Men 27 minuter senare fanns personen kvar i PostHog (REST och HogQL), med `created_at` 19:46:28.384 UTC. Det är tidsstämpeln på den sista händelsen webbläsaren skickade från Inställningar, inte kontots första händelse (19:45:57). Den sista omgången händelser togs emot 19:46:31.96 till 19:46:32.02, samma sekund som raderingen. Slutsatsen: PostHog raderade personen, och posthog-js sista utskick (händelser från strax före klicket på Radera permanent) skapade en ny person med samma id direkt efteråt. Policyns mening "I användningsstatistiken hos PostHog tar vi bort dig och dina händelser" håller alltså inte helt i dag. Inte rättat (utanför uppdraget). Två vägar: stäng av insamlingen i webbläsaren (`posthog.opt_out_capturing()` eller `reset()` och vänta in utskicket) innan `DELETE /api/konto/radera` i `useKontoHandlingar.ts` och appens `KontoHandlingar.tsx`, eller lägg kontots id i `posthog_raderingar` också efter ett lyckat anrop, så att midnattskörningen raderar en andra gång.
2. **Policyn, appen.** Meningarna om Google Play och RevenueCat är utelämnade. I tredje stycket är bisatsen "eller i appen Testklar" struken ur meningen om raderingen (resten av meningen ordagrant). I stycket om avslutsstatistiken står "om raderingen gjordes på webben eller i appen" kvar: meningen handlar om statistikraden, inte om appen, och kolumnen `kalla` finns.
3. **Policyn, "Raden innehåller aldrig något id".** `konto_avslut` har en egen primärnyckel `id` (`gen_random_uuid()`). Den pekar inte ut kontot, men raden har ett id. Texten införd som godkänd.
4. **og:image, orsaken är inte belagd med ett eget Turbopack-bygge.** `next dev --turbopack` går inte att köra i arbetskopian (Turbopack vägrar den länkade `node_modules`: "Symlink node_modules is invalid, it points out of the filesystem root"). Se Del 3.2 för vad som är belagt.

## Del 0: PostHog-nyckeln på live

- Testkonto `qa-radera-20261122-1945@jobbcoach-qa.test`, id `3056eb94-…`, skapat via `/register` på https://www.jobbcoach.ai och raderat under Inställningar i 1440 utan valt skäl. `DELETE /api/konto/radera` med `{"anledning":null}`, svar 200 `{"raderat":true}`, "Ditt konto är raderat." efter 2,4 s, hel omladdning till `/`, inloggningen nekad.
- `posthog_raderingar`: 0 rader för id:t, 422 totalt före och efter (421 "rest efter raderat konto" och 1 "nyckel saknas", ingen rörd).
- PostHog: personen finns kvar, se Överst punkt 1. 17 händelser kvar (händelserna rensas i omgångar, väntat).
- Kvar i databasen efter raderingen: 0 rader i alla uuid-kolumner i public och adressfälten, 0 i `auth.users`, 0 filer, 0 i `konto_avslut` (testkonto). Ingen städning behövdes.

## Del 1: samtyckesraderna

Commit `7d63faca` (med `scripts/radera-posthog-rester.ts`, flaggan `--koa`), följdrättning för rubrikens radbrytning i commiten med byggnoterna.

- `delas.ts`: tre listor, ordagrant, `AFTER_YES_ITEMS` ny. Kommentaren säger att lydelserna är godkända av ägaren 2026-11-22.
- Dialogen: de tre listorna staplade i en spalt (dialogen är 512 px; tre spalter blev 140 px breda). Samma ruta, rubrikstorlek och radstil på alla tre.
- Sidan före samtycket: tre spalter från 1280 px, staplat under. Mellanlistan lånar `IkonLasUpp` (öppet lås, samma uppsättning som låset på "visas aldrig"), rubriken i samma neutrala bläck som "visas aldrig", punkterna med samma bock och ton som "visas". Rubriken bröts "…till en / kontakt" i 1440; nu `text-wrap: balance` och ikonen i överkant.
- `ConsentModal`, `VisibilityModeCard` (två rader) och `InlineCVUpload`: ordagrant enligt briefen.

### Andra ställen med de gamla lydelserna (inte ändrade)

- `src/app/(public)/for-rekryterare/layout.tsx:12` och `:22`, `page.tsx:169`, `components/rekryterare-faq-data.ts:12`: "verifierade testresultat med percentiler" (placeringen visas bara över mitten). FAQ-svaret säger också "Rå-CV:n visas aldrig" medan beskrivningarna per anställning visas efter ja. `page.tsx:138` "Inga rå-CV:n eller löneanspråk".
- `src/app/(public)/for-rekryterare/components/rekryterare-faq-data.ts:28`: "percentilen jämförs mot alla som gjort exakt samma test hos oss, med antalet testade utskrivet".
- `src/app/(public)/verktyg/bli-upptackt/page.tsx:53`: "verifierade testresultat med nivå och placering" (placering bara över mitten). Raderna 54 och 266 och FAQ-svaret i `bli-upptackt-faq-data.ts:10` stämmer med de nya lydelserna.
- Inga tester eller hjälptexter återgav de gamla raderna.

## Del 2: integritetspolicyns avsnitt 7

Commit `210159bd`. Lydelserna ur `docs/beslut-mejl-och-radering-2026-11-22.md`, med undantagen i Överst punkt 2. `lastUpdatedDate` stod redan på 2026-11-22. Inget annat i policyn eller villkoren ändrat. Kontrollerat mot koden: sökta tjänster, mejllogg med händelser, Stripe, filerna, `audit_logs` (ip och webbläsare nollas, `user_id` blir null genom främmande nyckeln) och `admin_actions` (målet blir null) stämmer med texten.

## Del 3: SEO:s tre uppföljningar

Commit `85637637`.

### 1. Läs vidare

`src/lib/artiklar/lasVidare.ts`: flest gemensamma taggar som förut; fattas det fylls på ur samma kluster (`getCtaVariantForTags`) närmast i tid, med ett fast hashvärde per artikelpar som skiljer artiklar på samma dag (många publicerades samma datum, annars vann samma två artiklar överallt); de nyaste bara om klustret inte räcker. Enhetstest i `src/lib/artiklar/__tests__/lasVidare.test.ts`. Jämförelsen i `scripts/seo-baslinje/las-vidare-jamfor.ts`.

- 154 artiklar, 64 får ändrad Läs vidare, 138 länkar lämnar Läs vidare, varav 135 försvinner helt ur artikeln (tre står kvar i löptexten). Undantagsfil: `scripts/seo-baslinje/las-vidare-kluster-2026-11-22-undantag.json`, 135 LANK_BORTA-rader.
- Ingen artikel som hade en inlänk från Läs vidare blir utan. Artiklar utan inlänk därifrån: 37 före, 9 efter.
- Tappar (bara tre tappar alls): `aktivitetsrapport-arbetsformedlingen` 70 till 6, `cv-och-personligt-brev-samma-mall` 51 till 2, `cubiks-logiks-test` 29 till 4. Alla andra har lika många eller fler.
- Vinner mest: `ljuga-i-cv` 1 till 6, `hobbyer-intressen-cv` 0 till 5, `europass-cv` 0 till 5, `cv-format-kronologiskt-funktionellt` 0 till 5, `utbildning-i-cv` 0 till 4, `provanstallning` 0 till 4, `ny-pa-jobbet` 0 till 4, `datorkunskaper-cv` 0 till 4, `vilka-kompetenser-har-jag` 0 till 3, `saga-upp-sig` 1 till 4.

### 2. og:image på /verktyg/bli-upptackt och /verktyg/personlighetstest

Belagt: de två är de enda verktygssidorna utan egen `opengraph-image.tsx`. Lokalt ärver de bilden i `src/app/(public)/verktyg/opengraph-image.tsx` (`/verktyg/opengraph-image-17fsq3`, svarar 200 också på live), en mapp utan sida och layout. Alla sidor som på live ärver en bild gör det från en mapp med sida (roten, `/verktyg/rekryteringstester` till `/prova`). Vercel bygger med `next build`, som i Next 16 är Turbopack (`next.config.ts` säger "turbopackSourceMaps den vi kör"); grinden bygger med `--webpack`. Live-svaren är förrenderade (`X-Nextjs-Prerender: 1`), så det är inte en gammal cache av en annan sorts sida. Ej belagt: att Turbopack faktiskt tappar bilden från en mapp utan sida (Turbopack går inte att köra i arbetskopian, se Överst punkt 4).

Rättning som håller i båda byggena: egen `opengraph-image.tsx` i båda segmenten, samma mönster och illustrationer som syskonen (`OgFrame`). Bli upptäckt: "Låt rekryterare hitta dig", "Anonym tills du själv tackar ja". Personlighetstest: "Vad rekryteraren läser ut av dig", "Femfaktormodellen, din profil direkt". Båda svarar 200 image/png lokalt. Undantagsfil `scripts/seo-baslinje/og-verktyg-2026-11-22-undantag.json`, två META_TILLAGD-rader som kräver att den nya adressen börjar med sidans egen bildväg. Grinden läser nu META_TILLAGD också ur undantagsfilerna. Efter push: läs og:image på de två sidorna på live.

### 3. META_BYTT kräver texten efter

`scripts/seo-diff-artiklar.ts`: en rad godkänner ett byte av title eller description bara när `efter` är exakt den nya texten (och `fore` den gamla, om den står). Finns rader för sidan men ingen med rätt text fäller grinden med en egen förklaring. Alla befintliga rader fick `efter` ur `docs/qa/seo-diff/publikt-omgang3-efter-live-5.json`: 423 rader i 17 undantagsfiler och `foretag.json`, plus fem i skriptet. Insatt rad för rad efter `falt`, så att filerna i övrigt står orörda. Fem rader fick ingen `efter` eftersom sidan inte finns i avtrycket (omdirigerade eller utanför listan): `/verktyg/cv-mallar` description (`cv-word`), `/artiklar/cv-mall-gratis-guide` title och description (`huvudord`), `/cv-mallar/prova` och `/cv-mallar/start` description. De godkänner inget byte längre. Självtest: live-5 mot sig själv Fel 0; ett påhittat byte av `/kontakt`s title fäller med "META_BYTT finns för sidan, 2026-10-12, men ingen rad har den här texten som efter", och rotation-test-guide med annan text före godkänns av raden med rätt efter.

## Grindar

- `tsc --noEmit`: 0 fel.
- Hela vitest: 420 filer gröna, 3 hoppade; 5 099 test gröna, 13 hoppade.
- `next build --webpack` (`NODE_OPTIONS=--max-old-space-size=6144`): grönt, 808 sidor. Byggt en gång till efter rubrikrättningen, grönt.
- SEO-grinden mot lokalt bygge (`next start -p 8300`), samma 500 sidor som `publikt-omgang3-efter-live-5.json`, nio delar om högst 60: 500 av 500 svarade 200, **Fel 0**. Undantag jag skrivit: 135 LANK_BORTA, 2 META_TILLAGD. Rapport `docs/qa/seo-diff/samtycke-och-seo-2026-11-22-diff.md`, avtryck `docs/qa/seo-diff/samtycke-och-seo-2026-11-22-efter.json`. `/integritetspolicy` 1 679 till 1 967 ord, rubriker oförändrade.

## Klicktestet (lokalt `next start` mot produktionens databas, 1440 och 412)

Testkonto `qa-samtycke-20261122-2009@jobbcoach-qa.test` (id `87cd60f2-…`), nytt via `/register`. AI-anrop: 2 (en CV-uppladdning). Bilder: `C:\Users\chris\AppData\Local\Temp\claude\dceaf5763afec129\2f505274-a60e-456c-8335-21ea685ee053\scratchpad\qa-live-6\bilder\`.

- Sidan före samtycket (`k02`, `k03`): tre listor i ordningen visas, visas först efter ja, visas aldrig. 1440 tre spalter, 412 staplat. Mellanlistan ser ut som de andra två, utan egen färg. Ingen sidledsrullning (412: 412 av 412).
- CV-uppladdningens samtycke (`k05`, 1440 och 412): raden ordagrant, länken GDPR-riktlinjerna kvar. Uppladdat en gång i 1440 (`k06`).
- Dialogen (`k07` till `k09`, 1440 och 412): tre staplade rutor, rubrikerna på en rad, personlighetsraden ordagrant, båda rutorna tomma från början. Aktiverad i 1440: `visibility = anonymous`, `show_personality` falsk, CV valt, samtycket sparat.
- Synlighetsläge (`k10`, 1440 och 412): underraden och Öppen profil ordagrant, inget trängs.
- Efter rubrikrättningen (nytt bygge, nytt konto `qa-samtycke-20261122-2016@…`, id `e1a07c9b-…`, inga AI-anrop): `k11` i båda bredderna, mellanrubriken bryts "Visas först när du / tackat ja till en kontakt" med låset i överkant. Ingen sidledsrullning. Bedömning: listan är diskret, den skiljer sig från de andra bara genom rubriken och det öppna låset.

## Städningen

Räknat först, raderat bara på kontots id och adress. Första kontot: ai_usage_costs 1, candidate_profiles 1, cv_texts 1, email_confirmations 1, email_schedule 2, user_activities 25, user_ui_preferences 1, profiles 1, filer i `cvs/users/<id>/` 2, användaren i auth 1. Andra kontot: email_confirmations 1, email_schedule 2, user_activities 9, profiles 1, användaren i auth 1. Kontrollen efteråt: 0 överallt för båda. `public_rate_limits` och `posthog_raderingar` inte rörda. De två lokala testkontonas händelser i PostHog är kvar (testkonton, filtreras av kohorten). Inga servrar eller Chrome kvar.
