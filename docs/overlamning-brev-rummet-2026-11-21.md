# Överlämning: brevrummet, det som återstår

Skriven 2026-11-21 till den agent som tar över. Du har inte sett sessionen som byggde brevrummet. Allt du behöver står här eller i filerna som pekas ut.

## Läget

- Nya brevrummet är live på main sedan 2026-11-21 (`1c1dda8c`). Fyra brevmallar putsades samma dag (`d29dd704`, `473ef15c`). Alla tre commits ligger på `origin/main`, kontrollerat mot GitHub.
- Inget brevarbete ligger kvar lokalt. Arbetskopior, grenar och QA-konton är borttagna.
- Den lokala mappen `C:/Users/chris/cvbrev` är uppdaterad till `origin/main` sedan städningen 2026-11-21. Sessionsstarten visar om den hamnar efter igen.
- Grenen `feat/jobbsoket-a` och arbetskopian `C:/Users/chris/cvbrev-qa-b` finns inte längre. Allt därifrån ligger i main (städningen 2026-11-21).

Läs först:

- `docs/bygg-noter-brev-rummet.md` (hela bygget, putsningen och backning)
- `docs/qa/brev-rummet-slutkontroll-2026-11-21.md`
- minnet `project_brev_rummet_omgang1`

## Så fungerar brevprodukten nu

Det här är facit för all text om personliga brev. Stäm av mot koden om något är oklart (`src/lib/letters/brevRegler.ts`, `src/lib/letters/brevmall/katalog.ts`).

- Brev skrivs i samma 40 mallar som CV:t. Gratis: Linne och Björk. Övriga ingår i Premium.
- Word finns för 26 av de 40 mallarna. PDF finns för alla.
- Nedladdning som PDF eller Word kräver Premium.
- Ett gratisbrev per rullande sju dygn.
- Alla brev sparas av sig själva. På gratisnivån är de två senaste öppna att ändra. Äldre går att läsa och kopiera, inte ändra.
- Fem valbara toner. Tonen auto och typsnittet Helvetica ingår i Premium.
- Svenska eller engelska.
- Sidorna: `/dashboard/mina-brev`, `/dashboard/mina-brev/mallar?brev=<id>`, `/dashboard/skapa-brev` (en skärm, inte sex steg), `/dashboard/mina-brev/[id]`, `/dashboard/mina-brev/[id]/skickat`.

Produktfacit i minnet `project_faktagranskning_2026_11` beskriver fortfarande läget före bygget. Uppdatera det när du är klar.

## A. Det som återstår att testa

Inget av detta är prövat. Det som redan är prövat står i slutkontrollen.

| # | Test | Så gör du | Godkänt när |
|---|------|-----------|-------------|
| A1 | Köpreturen | Gratiskonto i Stripes testläge (minnet `reference_stripe_testlage`). Öppna ett brev, tryck Ladda ner, genomför köpet. | Returen till `/dashboard/mina-brev/<id>?ladda=1&format=pdf` laddar ner filen av sig själv. Samma med `format=docx`. |
| A2 | Putsade mallar inloggat i produktion | Premiumkonto. Byt ett kort och ett långt brev till Not, Mörkrum, Kvadrat och Panorama. | Brevet, miniatyren på Mallar och PDF:en ser rätt ut. Varje PDF är en sida. |
| A3 | Nots Word-fil | Ladda ner och öppna i Word. | Sidmarginaler 40 mm, brödtext 11 pt, en sida. Hittills är filen bara läst som XML. |
| A4 | Kvadrat, snävaste fallet | Kvadrat med Georgia eller Arial och ett långt brev. | PDF:en är en sida. Beräkningen säger att brevet slutar 2 mm före sidgränsen. |
| A5 | Word i allmänhet | Öppna en Word-fil från två eller tre andra mallar i Word. | Ser ut som PDF:en, inget brutet. |
| A6 | Black Week-priset på brevens betalväggar | Från måndag 23 nov: gratiskonto som aldrig haft Premium, öppna nedladdningsspärren och veckospärren. | 99 kr visas 23 till 29 nov, 49 kr den 30 nov. Bara kontroll. |
| A7 | Riktig telefon | Ägaren gör det själv, helst på iPhone. Påminn i rapporten. | Skriv brev, Brevet och spärrarna fungerar i Safari. |

Putsade mallar är hittills bara granskade på bild från samma kod lokalt. Miniatyren är rastrerad i headless Chrome, inte sedd i den riktiga komponenten `BrevMiniatyr`.

## B. Det som återstår att fixa: publika sidor

Sökningen gjordes mot `origin/main` (`6c7ab596`) med `git grep`. Listan är inte uttömmande. Gör ett eget svep innan du börjar: sex mallar, sju mallar, 6 mallar, 7 brevmallar, fyra är gratis, de gamla mallnamnen (Klassisk, Minimalist, Kompakt, Modern, Executive, Kreativ, Traditionell), "redigera" om gratisnivån.

### B1. Säljsidan för brev, störst avvikelse

`src/app/(public)/verktyg/personligt-brev/` bygger på det gamla registret `LETTER_TEMPLATES` (`src/lib/letters/letter-templates.ts`) med sju mallar som produkten inte längre använder.

| Fil och rad | Står nu |
|---|---|
| `layout.tsx:7`, `:14`, `:24` | "Sju mallar, fem toner" i title/description/OG |
| `page.tsx:43-51` | `MALLTEXT` med de sju gamla mallarna, antal och gratisnivå ur gamla registret |
| `page.tsx:100`, `:110`, `:145` | "Sju mallar", "7 brevmallar" (även i strukturerad data) |
| `components/brev-faq-data.ts:30` | "Vilken mall ska jag välja?" svarar med Klassisk, Minimalist, Modern, Kreativ, Executive, Traditionell |
| `components/brev-faq-data.ts:34` | "de sju mallarna" |

Sidan visar alltså mallar som en ny användare inte får. Se beslut C1 innan du bygger om mallsektionen. Siffror och FAQ-svar kan rättas direkt.

### B2. Artiklar och komponenter

| Fil och rad | Står nu | Bedömning |
|---|---|---|
| `content/artiklar/jobbcoach-online.mdx:231` | "en av sex mallar (fyra är gratis, alla sex ingår i Premium)" | Fel. Beskriver produkten. Rätta. |
| `content/artiklar/personligt-brev-mall-word.mdx:448` | "en av sex brevmallar" | Fel. Beskriver produkten. Rätta. |
| `content/artiklar/fardiga-personliga-brev.mdx:245` | "du kan läsa, redigera och kopiera texten gratis" | Halvt fel. Bara de två senaste går att ändra på gratisnivån. Rör inte priset i samma stycke. |
| `src/components/artiklar/MallVisningar.tsx:71` | "Samma brev i sex mallar. Fyra är gratis." | "Fyra är gratis" är fel. Kontrollera vad visningen faktiskt ritar. |
| `src/components/exempel-shared/ExempelHero.tsx:152` | "6 mallar" | Beskriver exempelvisningen, som ännu har de gamla mallarna. Se C2. |
| `src/components/publikt/innehall/exempel/ExempelMall.tsx:114` | "Sju mallar" | Samma. Notera att 6 och 7 säger emot varandra redan i dag. |
| `src/components/publikt/innehall/exempel/ExempelMall.tsx:147` | "Mallen Klassisk" | Samma. |
| `src/app/(public)/personligt-brev-exempel/[yrke]/InteractiveLetterPreview.tsx:26` | "Traditionell svensk brevmall" | Exempelvisningen. Se C2. |
| `src/app/api/public/exempel/brev/route.ts` | Exempelbrevet i de gamla mallarna | Rör inte. Se C2. |
| `src/components/publikt/MallMiniatyr.tsx`, `src/components/publikt/telefon/skarmar/SkarmAnnons.tsx` | Läser gamla registret | Kontrollera vilka sidor de syns på. |

Avgör per träff om texten beskriver exempelvisningen (stämmer tills C2 är gjord) eller produkten (ska rättas nu).

### B3. Smått i koden

- `src/components/letters/download-button.tsx` är oanvänd. Ta bort om inget importerar den.
- `src/lib/letters/letter-templates.ts` kan tas bort först när inga publika ytor läser den (efter C1 och C2).
- Om A4 visar två sidor: justera Kvadrat i `src/lib/letters/brevmall/puts.ts`. Målet är 8 mm luft till sidgränsen.

## C. Det ägaren behöver ta ställning till

Ägarens linje: agenterna beslutar, ägaren får rapport. Ta alltså besluten själv där det går och redovisa dem. Det här är undantagen.

| # | Fråga | Förslag |
|---|-------|---------|
| C1 | Ska säljsidan `/verktyg/personligt-brev` visa de 40 nya mallarna? Det är en ombyggnad av mallsektionen, inte en textändring. | Rätta siffror och FAQ nu. Bygg om mallsektionen ihop med C2, via skiss som ägaren godkänner. |
| C2 | Ska de publika exempelbreven (`/personligt-brev-exempel/...`) flyttas till de nya mallarna? | Ja, som egen omgång efter Black Week. Sidorna rankar, så SEO-diffen är grind. |
| C3 | Får publika sidor ändras under Black Week (23 till 30 nov)? | Rena faktarättningar ja. Ombyggnader väntar till december. Stäm av med ägaren om du är osäker. |
| C4 | Avläsning av brevrummet 5 december | Gör den mot utgångsläget i minnet (171 brev varav 34 sparade, 74 personer skrev brev, 46 av dem hade inget under Mina brev). |

Priser, kvoter och spärrar är inte uppe för beslut. De är ägarens och ska stå som de står.

## Ramar

- **CV-koden får inte påverkas.** Rör ingen fil under `src/lib/cv` eller `src/components/cv`. Om du ändrar något under `src/lib/letters/brevmall/`: bevisa med kontrollsummor före och efter att CV:ts HTML (40 mallar), HTML med foto (15) och Word (26) är identiska. Metoden står i byggnoterna under "Putsning av fem brevmallar".
- **SEO-diff som grind** för varje publik sida du ändrar. Title, description och H1 ändras bara där de innehåller ett faktafel. Tidigare diffar ligger under `docs/qa/*/seo-diff.md`.
- **Juridik och priser:** ändra aldrig texter om datalagring, GDPR, policy eller villkor. Ändra inga priser.
- **Text:** svenska, copywriter-ton, "vi", inga tankstreck, svenska facktermer, namnen enligt minnet `project_paketnamn_2026_09_24`. Hämta priser och paketnamn ur hjälparna (`paketKort()`, `prisPeriod()`), skriv dem inte för hand.
- **QA-konton:** `SCRATCH=<mapp> npx tsx scripts/qa-brev-konton.mjs skapa` och `radera`. Läs skriptet först. Radera bara egna rader per id och räkna före.
- **Last mot produktion:** Supabase är en liten instans. En agent åt gången, få sidladdningar, stäng testprocesser efteråt.
- **QA-bilder** ligger i scratchpad, aldrig i git.
- **Test en gång:** under arbetet bara tsc, berörda vitest och skärmdump. Bygge, hela vitest och klicktest (1440 och Pixel 7, gratis och Premium) en gång före push.
- **Modeller:** implementation på Opus 5.5, designbeslut på Fable.
- **Arbetskopia med länkad `node_modules`:** kör `npx next dev --webpack`. `next build` kräver att `turbopack.root` och `outputFileTracingRoot` tillfälligt sätts till `C:/Users/chris/cvbrev` och att bygget körs från `C:\`. Committa aldrig den ändringen. Ta bort länken före arbetskopian.

## Klart när

1. A1 till A6 är körda och utfallet står i rapporten, även det som föll.
2. B1 (siffror och FAQ) och B2 (produkttexterna) är rättade, med SEO-diff utan oavsiktliga ändringar.
3. Produktfacit i minnet och `project_brev_rummet_omgang1` är uppdaterade.
4. Ägaren har fått en rapport: vad som rättades, vad som testades, vad som föll, vad som väntar på C1 till C3, och påminnelsen om A7.
