# Spatial förmåga, omgång 3: 100 nya uppgifter (bankversion 5)

Datum 2026-11-19. Uppgifterna ligger sist i bankfilerna med `fran_version: 5` och är **inte aktiva**. `SPATIAL_VERSION` är fortfarande 4. Arbetssättet är omgång 2:s (`spatial-2026-11-19-omg2.md`, commit 1c6d54f1, granskningen i `spatial-2026-11-19-omg2-granskning.md`), med kopiespärren mot alla nivåer. Generatorn är `scripts/gen-spatial-v5.mjs`. `scripts/gen-spatial.mjs` är inte körd.

## Varför nya uppgiftstyper

Formerna A till D börjar ta slut. Omgång 2 fann ingen ny avancerad B i den gamla formen på 60 000 försök, och grund A fäller redan de flesta kandidater som kopior. Vi bygger därför nya typer **inom formerna**. Nivåtestets fördelning (4 A, 3 B, 4 C, 4 D), tiden per form, "Var du tappar" och passens urval per form fungerar som förut, och aktiveringen är bara versionshöjningen.

| Typ | Form | Vad användaren ser | Facit |
|---|---|---|---|
| Spegling i två linjer | A | En brickfigur med två streckade linjer genom mitten. "Figuren speglas först i den lodräta linjen och sedan i den vågräta." | Figuren speglad i linjerna i tur och ordning. |
| Kropp från pilens håll (vy) | C | Kuber staplade på en 3×3-platta, ritade snett ovanifrån som tärningen, och en pil på plattan. | Den högsta stapeln i varje kolumn sett från pilen. |
| Snitt | C | Samma slags kropp med en streckad kopparlinje där den sågas itu, tvärs över pilen. | Staplarna i raden som sågas, sett från pilen. |
| Två vikningar med två hål | B, expert | Arket viks två gånger, minst en vikning är sned, och två hål stansas. Inga klipp. | Hålen speglade tillbaka, minst sex hål. |

## Antal per nivå

| Nivå | A spegling | B två vikningar | C vy | C snitt | Nya | Pool v4 | Pool v5 |
|---|---|---|---|---|---|---|---|
| Grund | 11 | | 11 | 11 | 33 | 162 | 195 |
| Avancerad | 11 | | 11 | 11 | 33 | 162 | 195 |
| Expert | 8 | 10 | 8 | 8 | 34 | 162 | 196 |

`difficulty` och `p_prior` sätts som förut per nivå och form (grund A d1, övriga d2, p 0,8; avancerad A d2, övriga d3, p 0,6; expert A d3, övriga d4, p 0,42).

## Typerna i detalj

### A: spegling i två linjer (`scripts/lib/spatial/spegling.mjs`)

- **Grund**: en lodrät och en vågrät linje i någon ordning. Facit är ett halvt varv. Distraktorer: bara första speglingen, bara andra, och figuren vriden ett kvarts varv.
- **Avancerad och expert**: en rak och en sned linje i någon ordning. Facit är ett kvarts varv, och åt vilket håll beror på ordningen. Distraktorer: omvänd ordning (kvarts varv åt andra hållet), bara första, bara andra. Expert har större figur (5×5, 7 eller 8 rutor) och den grå rutan.
- Två speglingar är alltid en vridning. Därför finns alltid en distraktor som också är en vridning (SP-S4), annars hittar man facit genom att leta efter "den som är vriden".
- Figuren har ingen symmetri alls, inte heller utan den grå rutan (SP-S2), så varje alternativ är något annat än facit.
- I frågan heter linjerna "lodräta", "vågräta" och "sneda". Det finns aldrig två sneda linjer i samma uppgift, så namnen är entydiga.
- Uppgiften bär `vridning` som form A, så `sparrar.test.ts` kontroll "facit är en vridning" gäller också här.

### C: kropp och snitt (`scripts/lib/spatial/kropp.mjs`)

- Kroppen är `h[y][x]`, 0 till 3 kuber per ruta på en 3×3-platta. Pilen ligger på plattan och pekar rakt mot de grå sidorna (`blick: 'l'`) eller de vita till höger (`'r'`).
- Alternativen är brickfigurer i 3×3, alltid tre kolumner breda med minst en kub i varje kolumn. Då tappar figuren aldrig sitt läge i sidled när brickan centreras.
- **Vy**, distraktorer: kroppen från den andra sidan, bakifrån (spegelvänd), bara de främsta staplarna (avancerad och expert, där en högre stapel bakom en lägre ska synas), en kub för mycket eller för lite. Avancerad kräver minst en kolumn och expert minst två där den högsta stapeln står bakom en lägre.
- **Snitt**, distraktorer: hela vyn, raden bakom, raden framför, bakifrån. Grund: snittets rad är inte skymd av en högre stapel framför. Expert: snittet går genom mittraden och raden är skymd i minst en kolumn.
- **Entydig teckning (SP-K2)**: en isometrisk bild kan se likadan ut för flera kroppar, till exempel när en låg stapel står rakt bakom en högre. Spärren målar alla 4^9 kroppar på plattan på isometrins triangelnät och kräver att varje kropp som ger samma bild ger samma facit. Dolda kuber får alltså finnas, men bara där de inte ändrar svaret. Verifieraren gör samma kontroll med ett eget djupbuffer.
- Facit är aldrig spegelsymmetriskt (SP-K4), annars vore "bakifrån" också rätt.
- Ingen kropp används två gånger bland de nya, i något läge på plattan.

### B: två vikningar med två hål på expert (`vikning.mjs`, `EXPERT_TVA_VIK`)

Varianten `tva_vik` i `byggUppgiftB`. Expert får två vikningar i stället för tre, minst en sned, två stansade hål och inga klipp. Facit har 6 till 8 hål (alla tio har 6). Distraktorerna är expertens: utelämnad vikning, fel ordning, fel axel, bara sista, en fel plats. `sparrarB` känner igen varianten med `nivaB(q)` (expert, inget klipp, två vikningar); alla äldre uppgifter prövas exakt som förut. De nya har `klipp` falskt och hamnar alltså i passens "Uppvikning", inte i I-provets "pappersvikning med klipp".

## Ritaren

Två tillägg i `src/lib/spatialV1/ritare.tsx`, måtten i `geometri.json` (`brickAxel`, `kropp`):

- `BrickFigur.axlar`: streckade ram-grå linjer genom figurens mitt, ovanpå rutorna. Utan `axlar` ritas brickan som förut.
- `kind: 'kropp'` (`KroppFigur`): plattan med rutnät i ram-grått, kubernas fria sidor bakifrån och fram (ovansida papper, vänster grå, höger papper, bläckkontur som tärningen, kant 10,8), pilen i bläck och vid snitt en streckad kopparlinje på plattan och över varje synlig sida som snittet går genom. Kopparn är nytt i själva uppgiften; i bläck gick snittlinjen inte att skilja från kubernas kanter.

**Bakåtkompatibelt, prövat:** `scripts/lib/spatial/markup-ogonblick.tsx` skrev markupen för alla 3 461 befintliga figurer (bankerna och artiklarnas uppgifter) före ändringen och efter alla ändringar. Filerna är byte för byte lika. `version5.test.ts` räknar samma hash (sha256 `64b5113a…`) varje körning.

Egna tester för ritaren i `version5.test.ts`: brickan med linjer är samma markup som utan plus en linje per spegellinje; kroppen ritar en sida per fri kubsida i djupordning, plattan först och pilen sist; snittlinjen finns bara med snitt och bara på sidor i snittets rad; allt målat ligger i [14, 86] för den största kroppen och 200 slumpade. `svgMatt.tsx` mäter dessutom kubkanten (13,7 px på 360), pilen, snittlinjen och antalet spegellinjer.

Gränssnittet (`Uppgifter.tsx`, `namn.ts`): en kropp får rubriken "Kroppar" och etiketten "Kroppen", en spegling rubriken "Speglad figur" och slipper raden "Spegelbilder räknas inte". Allt annat är oförändrat, och inget av det syns förrän version 5 är aktiv.

## Kopiespärren

Som i omgång 2 gäller den alla banker och nivåer, och ett par där någon har `fran_version` 4 eller senare är alltid fel.

- **Spegling** har form A:s nyckel (referens och facit under kvadratens åtta symmetrier). En speglingsuppgift med samma figur och samma facit som en vridningsuppgift fälls alltså som kopia, liksom samma uppgift vriden eller speglad med linjerna vridna. Grund fällde 681 kandidater så.
- **Kropp** läggs i tittarens ram (kolumn från vänster, djup från pilen), tomma rader längst bort och närmast tas bort, och ramen jämförs också spegelvänd i sidled. En kropp vriden ett kvarts varv och sedd från andra sidan, eller hela uppgiften speglad på skärmen, blir samma nyckel. Testerna bygger båda och ser att de klarar verifieraren och fälls.
- **B** använder omgång 2:s nyckel för vikningar.

## Kontrollerna

- `node scripts/spatial-verifiera.mjs --version 5`: **100 uppgifter, 0 fel, 0 varningar.** Hela banken: 587 uppgifter, 0 fel, 85 varningar (samma 85 äldre som efter omgång 2).
- `node scripts/validate-spatial.mjs`: klarar spärrarna, facit under 40 procent per plats per bank.
- `node scripts/spatial-geometri-check.mjs`: geometrin håller, högst 75 noder och 8 277 byte per uppgift.
- `node scripts/artikel-steg2-check.mjs`: artiklarnas 49 uppgifter klarar spärrarna och finns inte i bankerna.
- `npx tsc --noEmit -p .`: 0 fel.
- `npx vitest run src/lib/spatialV1 src/lib/tester/steg2 src/components/publikt/__tests__/TestBredd.test.tsx src/lib/quota/__tests__/grundkvot.test.ts src/lib/tester/v4/__tests__/hintar.test.ts --exclude ".claude/**"`: 8 filer, 111 test, gröna. I `sparrar.test.ts` (två test) och `version4.test.ts` (hörnets test) gäller tärningstesten nu bara tärningar (`referens.kind === 'kub'`).
- **Verifieraren är oberoende** för de nya typerna: egen spegling i figurens ram, egen kolumnordning räknad ur var kolumnerna hamnar på skärmen, och ett djupbuffer i stället för generatorns målarordning. Före skrivningen körde vi den på 912 kroppar och 531 speglingar från generatorn: 0 avvikelser. Den fäller fel facit, ett alternativ som inte är staplar, en kropp där en dold stapel ändrar svaret och linjer i fel ordning i frågan (testade).
- **Bilderna**: alla 100 renderade med appens ritare som tio kontaktkartor (referens eller sekvens, de fyra alternativen med facit i koppar, feltyp och förklaring) och skärmdumpade med puppeteer i sessionens scratchpad `omg3/k-<nivå>-<typ>.png`, utanför git. Vi har tittat på varje karta. Handräknat ur data och bild: sp-g-c-41, sp-g-c-48, sp-e-c-50, sp-e-c-51 (facit stämmer, kolumnordningen från pilen stämmer med bilden), sp-g-a-44 och sp-a-a-44 (vridningens riktning). Ritningen läses som avsett: pilen visar sidan, snittlinjen följer raden över ovansidor och den skurna sidan.

## Att veta inför granskningen

- Facits plats bland de nya är skev (grund 18 av 33 på första platsen). Banken som helhet klarar 40-procentsgränsen, och alternativen blandas ändå per session.
- Grund vy har få olika facit (tre kolumner, höjd 1 eller 2, inte symmetriskt ger bara sex möjliga). Uppgifterna skiljer sig i kroppen, inte i facitbilden.
- Expert B: alla tio ger exakt sex hål. Det är inom spärren men ett smalt spann.
- Kopparn i snittlinjen är samma färg som "rätt svar" i genomgången. I frågan finns ingen sådan markering, men designansvarig bör se den.
- "Var du tappar" räknar kropparna under form C, "Tärningar", och speglingen under form A, "Vriden figur". Se aktiveringen, steg 3.

## Aktivering

Efter testansvarigs granskning, i samma commit:

1. `src/lib/spatialV1/select.ts`: raden `export const SPATIAL_VERSION = 4;` blir `export const SPATIAL_VERSION = 5;`, och kommentaren ovanför får en rad: ` * Bankversion 5 (docs/fragebank/spatial-2026-11-19-omg3.md): 100 nya uppgifter med fran_version 5 i nya typer inom formerna (A spegling, B två vikningar på expert, C kroppar och snitt); samma fördelning per form.` `perFormFor(5)` ger samma fördelning som version 2 till 4.
2. Testerna:
   - `src/lib/spatialV1/__tests__/version5.test.ts`: `expect(SPATIAL_VERSION).toBe(4)` blir `expect(SPATIAL_VERSION).toBe(5)`.
   - `src/lib/spatialV1/__tests__/version4.test.ts`: `expect(SPATIAL_VERSION).toBe(4)` blir `expect(SPATIAL_VERSION).toBeGreaterThanOrEqual(4)`.
3. Valfritt, ägarens beslut eftersom det ändrar text som syns i dag: i `src/lib/tester/steg2/namn.ts` blir `A: 'Vriden figur',` till `A: 'Vriden och speglad figur',` och `C: 'Tärningar',` till `C: 'Tärningar och kroppar',`, så att "Var du tappar" täcker de nya typerna.
4. Kör `node scripts/spatial-verifiera.mjs`, `npx vitest run src/lib/spatialV1 src/lib/tester/steg2 --exclude ".claude/**"` och `npx tsc --noEmit -p .`, och klicktesta ett nivåtest med en kropp och en spegling i riktig webbläsare (Pixel 7 och desktop) innan det kallas klart.
5. Kör aldrig `scripts/gen-spatial.mjs` på bankerna. Kopior bland version 5 byts ut med `node scripts/gen-spatial-v5.mjs --ersatt`.

## Id

Grund
- A spegling: sp-g-a-43 till sp-g-a-53 (11)
- C vy: sp-g-c-41 till sp-g-c-51 (11)
- C snitt: sp-g-c-52 till sp-g-c-62 (11)

Avancerad
- A spegling: sp-a-a-41 till sp-a-a-51 (11)
- C vy: sp-a-c-41 till sp-a-c-51 (11)
- C snitt: sp-a-c-52 till sp-a-c-62 (11)

Expert
- A spegling: sp-e-a-41 till sp-e-a-48 (8)
- B två vikningar: sp-e-b-41 till sp-e-b-50 (10)
- C vy: sp-e-c-41 till sp-e-c-48 (8)
- C snitt: sp-e-c-49 till sp-e-c-56 (8)

Diffen mot bankerna är bara tillagda rader. Inga rader från version 1 till 4 är ändrade.

## Efter granskningen (2026-11-19)

sp-e-b-41 till sp-e-b-50 (två vikningar på expert) ströks: samma form som avancerad. Aktiverad med 90 nya (grund 33, avancerad 33, expert 24), SPATIAL_VERSION 5. Familjenamnen i FORM_NAMN blev Vriden och speglad figur och Tärningar och kroppar; rubriken över uppgiften behåller Vriden figur och Tärningar för de äldre typerna. I-prov-provets tärningsdeltest filtrerar nu på tärningar så att kropparna inte hamnar där. Facits plats roteras inte än i generatorn; görs nästa omgång.
