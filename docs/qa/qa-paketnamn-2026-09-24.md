# QA: paketnamnen, 2026-09-24

Underlag: `docs/rapporter/beslut-paketnamn-2026-09-24.md`, avsnittet "Ägarens beslut 2026-09-24".
Namnen: `cv_week` CV-paketet, `test_week` Träningspaketet, `all_day` Dagspasset,
`all_week`/`all_month`/`all_quarter` Hela paketet. Nycklar, scopes, priser och prisid orörda.

## 1. Kod

- En sanning: `PLANS.name` i `src/lib/plans/plans.ts`. Hjälparna `paketNamn`,
  `paketNamnForScope`, `prisPeriod`, `paketMedPris`, `paketMedLangd` och
  `paketNamnUrMetadata` (gammalt `planName` i schemalagda mejl blir det nya namnet).
  Nytt fält `beskrivning` (högst 60 tecken, testat).
- Test `src/lib/plans/__tests__/paketnamn.test.ts`: faller om något av de sex gamla
  namnen (plus `Allt-manaden`) står i `src/` utanför `plans.ts`, migreringar och
  testfiler med markören `@gamla-paketnamn`.
- Test `src/lib/plans/__tests__/regel-r1.test.ts`: R1 över reklamkorten, paketcopyn
  (prissidan, spårvalet, köpsteget, kontosidan), betalväggen i alla 16 varianter och
  fyra spår, och mejlmallarnas ämnesrader. Kvittots ämne: "Kvitto: Hela paketet, en månad, 149 kr".
- PaywallCard: prisrad under brödtexten, beloppet i knappen ("Skaffa CV-paketet, 79 kr
  i veckan"), `paywall_shown` har `price_shown: true`.
- `npx tsc --noEmit` rent. `npx vitest run`: 61 filer, 757 test, alla gröna.

## 2. Stripe (live-nyckel, ägaren godkände bytet)

`scripts/stripe-byt-paketnamn.ts --dry-run`, sedan skarpt, sedan ny hämtning. Bara
`product.name` och `price.nickname` ändrade; belopp, valuta, intervall och active
oförändrade (verifierat i samma körning).

| Paket | Pris | Produkt | Namn före → efter | Nickname |
|---|---|---|---|---|
| cv_week | price_1UIG66PWMWdjmTDjwItel4bO, 79 SEK/vecka | prod_VIrpGplWXmlz9L | CV-veckan → CV-paketet | null → vecka |
| test_week | price_1UIG67PWMWdjmTDj3xQpQaLV, 79 SEK/vecka | prod_VIrpzDlJbGbiKy | Testveckan → Träningspaketet | null → vecka |
| all_day | price_1UEZuIPWMWdjmTDjSpvJpwn1, 49 SEK engångs | prod_VF42Yw6JSrtgbW | Allt-dagen → Dagspasset | null → dag |
| all_week | price_1UIG67PWMWdjmTDjs4l3izQe, 99 SEK/vecka | prod_VIrpRSPJoAzHMs | Allt-veckan → Hela paketet | null → vecka |
| all_month | price_1SQSVlPWMWdjmTDjx1yo9m00, 149 SEK/månad | prod_TNCv7ZRIoEYdFe | Allt-månaden → Hela paketet | null → månad |
| all_quarter | price_1UEaEOPWMWdjmTDjFn7FR2ou, 299 SEK/3 mån | prod_VF4NmFZJo6mZ0b | Allt-kvartalet → Hela paketet | null → kvartal |

Hela paketet är fortfarande tre Stripe-produkter med samma namn. Att slå ihop dem till
en produkt med tre priser rör webhooken och `premium_grants.scope` och är inte gjort.

## 3. SEO-diff

`scripts/seo-diff-artiklar.ts` på 50 sidor (standardurvalet plus vad-ar-en-jobbcoach,
/cv-exempel/underskoterska, /personligt-brev-exempel/underskoterska). Före: orört
produktionsbygge av `656c2ca0`. Filer: `docs/qa/seo-diff/paketnamn-fore.json`,
`paketnamn-efter.json`, `diff-paketnamn.md`. Grinden fäller (15 sidor) och varje
skillnad är namnbytet:

- title, canonical och h1 oförändrade på alla 50 sidor.
- description: /priser ("CV-paketet och Träningspaketet 79 kr i veckan, Hela paketet 99 kr. Allt
  öppet direkt, ...", 153 tecken) och /verktyg/bli-upptackt ("... Ingår i Hela paketet, 99 kr i veckan.").
- Rubriker: /priser och startsidan (H2 "Tre paket. Ett för CV:t, ett för träningen, ett för
  hela jobbsöket." och h3 per kort), /verktyg/rekryteringstester (h3 "Träningspaketet tar bort
  taket"). Utanför namnbytet: h2 "Skapa hela paketet" blev "Skapa hela ansökan" på cv-exempel-
  och brevexempelsidorna, eftersom "hela paketet" med gement h inte får stå i annan betydelse.
- JSON-LD: FAQ-svar och Offer-namn med paketnamnen (verktygssidorna, /priser, bli-upptackt,
  linkedin, vad-ar-en-jobbcoach), `wordCount` 6337 → 6356 på vad-ar-en-jobbcoach, LinkedIn-
  sidans HowTo-steg ("kopierar alla sektioner eller en i taget"). `datePublished` på
  exempelsidorna är byggtid och ändras vid varje bygge.
- Inga interna länkar borta på någon sida.

## 4. Klicktest i riktig webbläsare

`scripts/qa-paketnamn.mjs` (Chrome via puppeteer-core) mot produktionsbygge
(`NEXT_DIST_DIR=.next-namn`, `next start -p 5302`), Pixel 7 och desktop 1280.
62 kontroller, 62 OK. Skärmdumpar i `docs/qa/paketnamn/`, resultat i `resultat.json`.

- Artikeln logiska-tester: inline-raden "... ingår i Träningspaketet, 79 kr i veckan",
  slutkortet "Börja med Träningspaketet, 79 kr i veckan" och "Eller Hela paketet, 99 kr i
  veckan, med CV och personliga brev", sidokortet på desktop (01, 02, 08 till 10).
- Prissidan: tre kort med förklaringsrad, ny H2, dagen i längdvalet visar "En dag,
  Dagspasset. 49 kr, förnyas inte." och knappen "Börja med Dagspasset, 49 kr, ett dygn",
  FAQ "Kan jag byta paket mitt i veckan?" (03 till 05, 11 till 13).
- /verktyg/rekryteringstester: "Träningspaketet tar bort taket", det fördjupade
  personlighetstestet (06, 07, 14, 15).
- Inloggad med QA-kontot qa-namn-2026-09-24@jobbcoach.ai: betalväggen på LinkedIn-sidan
  ("LinkedIn-profilen ingår i CV-paketet, 79 kr i veckan", prisrad, "Skaffa CV-paketet, 79 kr
  i veckan"), sidomenyn gratis ("Tre paket, från 49 kr", grå rader "Ingår inte. Finns i
  CV-paketet och Hela paketet."), spårvalet och köpsteget ("Fortsätt med Träningspaketet,
  79 kr i veckan", "Träningspaketet, från i kväll"), sidomenyn med Träningspaketet ("Du har
  Träningspaketet", "Förnyas 1 oktober, 79 kr", fotraden) (16 till 27).
- Ingen sida i testet visar något av de gamla namnen, "coachen utan tak" eller "spår".

Betalväggens knapp fick `min-h-11` och `py-2` i stället för fast `h-11`: med beloppet
bryter texten på Pixel 7 till två rader.

Städning: QA-kontot raderat med id `76e576de-b857-41b3-bcf9-5cf63684c35e` (räknat före:
90 rader i user_activities, 1 profil, 0 i övriga tabeller; efter: 0 och auth-användaren
borta). Byggkatalogerna `.next-namn` och `.next-namn-fore` raderade, `tsconfig.json`
återställd.

## 5. Kvar

- Stripe: Hela paketet som en produkt med tre priser (ägarens val, kan vänta).
- Kvittot från Stripe och kundportalen visar nu de nya produktnamnen; prenumerationer
  som redan löper byter namn i portalen direkt, pris och förnyelsedag oförändrade.
- Avläsning fyra veckor efter deploy: `paywall_cta_clicked` per variant, med
  `price_shown` som skiljelinje.
