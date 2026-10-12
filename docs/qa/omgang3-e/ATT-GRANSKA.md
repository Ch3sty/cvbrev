# Omgång 3, spår E: kandidater att granska (bryter mönstret och härnäst parti 2)

Datum 2026-10-12. Från Opus E till testansvarig. Branch `feat/figur-e`. Inget ligger i skarp bank: kandidaterna står i `src/lib/figurserierV1/kandidater/`, och de nya bankfilerna (`bankBryterGrund.json`, `bankBryterAvancerad.json`, `bankParti2Grund.json`, `bankParti2Avancerad.json`) är tomma tills ditt ja. Beslut per id i `docs/qa/figurserier/granskning-04.md` (ja, nej, ändra med vad), som beställningen säger.

## Var bilderna ligger

| Katalog | Antal | Fil |
|---|---|---|
| `bryter-grund/` | 16 PNG (B1 8, B2 8) | `kandidater/bryter-grund.json` |
| `bryter-avancerad/` | 16 PNG (B3 10, B4 6) | `kandidater/bryter-avancerad.json` |
| `parti2-grund/` | 8 PNG (F1 4, F2 4) | `kandidater/parti2-grund.json` |
| `parti2-avancerad/` | 16 PNG (F4 10, F5 6) | `kandidater/parti2-avancerad.json` |

Plus en `index.html` per katalog. Filnamn `<mall>-<id>.png`.

Bryter-bilden: id, noder och kB mot gränsen (70 noder, 8 kB), nivå, familj, mall och variant, p_prior; en rad med primitiven, regeln som data och vilken bokstav som bryter; frågeraden och hjälpraden; de sex rutorna 3 + 3 på 360 med bokstav, brytaren i kopparram med punkt (spec 7, läget efter svar); regeltexten och misstaget per figur ordagrant som genomgången visar dem. Bokstäverna står i bankens ordning; i appen blandas de sex seedat på sessionId.

Härnäst-bilderna är samma mall som granskning 01 till 03.

## Kedjans utfall

| Steg | Utfall |
|---|---|
| `node scripts/gen-figurserier.mjs --bryter` | 16 + 16 på under 1 s, två körningar byte-identiska |
| `node scripts/gen-figurserier.mjs --parti=2` | 8 + 16 på under 1 s, byte-identiska; ingen rad och ingen lägesrad som redan finns i bankerna eller bland tidigare kandidater, numreringen fortsätter (fs-g-vrid-12 och framåt) |
| `node scripts/validate-figurserier.mjs` (bankerna + parti 2) | 122 utan fel |
| `node scripts/v7-facit-check.mjs --serie` (parti 2) | FS1 till FS6, S5, S6, S11 till S13 utan fel; två upplysningar S11 på fs-a-vaxl-15 (fel bara på expert) |
| `node scripts/v7-distraktor-check.mjs --serie` (parti 2) | A5 uppfyllt för alla 24 |
| `node scripts/v7-geometri-check.mjs --serie` (parti 2) | G1 till G12, S1 till S5, V11, V12 utan fel; störst 114 noder och 11,9 kB |
| `node scripts/v7-facit-check.mjs --bryter` | struktur och BM1 till BM5 utan fel, alla 32 |
| `node scripts/v7-geometri-check.mjs --bryter` | G1, G2, G4, G11, G12, S1 till S5, S8, V11, V12 utan fel på alla sex celler; störst 60 noder och 6,2 kB |
| `vitest src/lib/figurserierV1` | 35 gröna, varav 10 nya: en fixtur per spärr BM1 till BM5 som fälls med rätt text, en som klarar alla, BM1 med en sexa där två figurer kan vara brytaren |

## Spärrarna som de är byggda

Texten står i filhuvudet i `scripts/lib/serie/sparrar-bryter.mjs`. Två tolkningar du bör godkänna:

1. **BM1 och regler som håller för alla sex.** "Varje regel i biblioteket uppfylls bara av de fem utan brytaren" går inte att uppfylla bokstavligt i B4: en spegelbild har alltid samma antal som originalet, så "samma antal" håller för alla sex. Jag läser BM1 så här: en regel som håller för alla sex är något figurerna delar, inte en läsning som pekar ut någon; för varje annan regel i biblioteket gäller att den håller för de fem utan brytaren och för ingen annan femgrupp. Biblioteket är lika (per egenskap, också "samma mönster upp till vridning" och "upp till spegling"), samband (en egenskap bestämmer en annan) och relation (två lägen har samma vinkel mellan sig).
2. **BM4 i B4.** Brytaren är en spegling, så "samma värde på vridningen" saknar mening. Där kräver BM4 i stället att brytaren har en granne bland de fem som skiljer sig i högst två lägen. I B2 och B3 gäller BM4 också regelns egenskaper var för sig: brytarens form, fyllning, prickläge och pilriktning finns alla hos någon av de fem, så bara kombinationen bryter.

BM3 i B3: pricken och pilen ingår båda i relationen, så kravet på tre olika värden gäller dem var för sig.

## Där jag avvek, och varför

1. **3×3-blocket står inte i B4.** Blocket har fyra äkta vridningar (90 grader), och fem olika figurer kräver fem. Att flytta mönstret ett steg längs kanten är ingen vridning man ser. B4 är sektorhjul (3) och strålar (3), mönster med tre eller fyra lägen utan symmetri.
2. **Kvoten per primitiv.** Mallens ⌈n/3⌉ går inte i B3 (två grupper, tio frågor). Kvoten är jämn fördelning per grupp i stället: B1 2 per primitiv, B2 3/3/2, B3 5/5, B4 3/3.
3. **Antalet i B1** är två till fyra hos de fem (brytaren ett mer eller ett mindre), så att grund räknar till högst fem.
4. **Duo med flera kantprickar i B1** (fsb-g-antal-04 och 08). Granskning 01 F2 tog bort flera kantprickar ur härnäst, men beställningen tar med dem i B1. Titta extra på dem: utan ram kan prickarna läsas som ett tärningsmönster.
5. **Texterna är copywriterns** (copy-omgang3.md 1.2 och 1.3) rakt av, med "svarta sektorer" och "svarta rutor" som enhet i stället för "sektorer" och "rutor" (hjulet har alltid åtta sektorer; det som räknas är de svarta).
6. **Copy 6.1 till 6.3 är utkörda** i de tre skarpa bankerna och kandidatfilerna (`scripts/figurserier-copy-omgang3.mjs`, idempotent, bara text) och i misstagsmallarna. Familjernas korttexter (copy 1.5) är inte bytta: copywritern skrev att det väntar på ditt ja.

## Det jag vill att du tittar extra på

- B2 med grundform: symbolen är fri och har minst tre värden bland de fem. Läses "symbolen spelar ingen roll" utan att det står?
- B3: kantprick på ett hörn och pil 45 grader mot hörnet. Pekar den tydligt mot pricken på 360?
- B4: spegelbilden ligger alltid nära en av de fem (högst två lägen ifrån). Det är meningen, men det gör B4 till den svåraste mallen.
- Parti 2: samma mallar som granskning 01 till 03, inga nya varianter.
