# Figurserier, kandidater att granska (omgång 2, A7)

Datum 2026-10-12. Från Opus C till testansvarig. Branch `feat/figurserier`. Inget ligger i skarp bank: kandidaterna står i `src/lib/figurserierV1/kandidater/{grund,avancerad,expert}.json`, bankfilerna `bank*.json` är tomma tills ditt ja.

## Var bilderna ligger

- `kandidater/grund/` 36 PNG, `kandidater/avancerad/` 30, `kandidater/expert/` 30, plus `index.html` per nivå. Filnamn `<mall>-<id>.png`.
- Varje bild: id, nivå, familj, mall och variant, p_prior, noder och kB; en rad med reglerna per egenskap, perioden och vad varje distraktor bryter; raden som remsa 3 + 3 på 360 med luckan sist; alternativen tre i bredd med facit i koppar; regeltexten och misstaget per alternativ ordagrant som genomgången visar dem; strukturnyckeln längst ned.

Beslut per id i `docs/qa/figurserier/granskning-01.md` (ja, nej, ändra med vad).

## Kedjans utfall

| Steg | Utfall |
|---|---|
| `node scripts/gen-figurserier.mjs` | 36 / 30 / 30 på cirka 1 s, två körningar byte-identiska |
| `node scripts/validate-figurserier.mjs` | 96 utan fel; familjer grund 4, avancerad 7, expert 7 |
| `node scripts/v7-facit-check.mjs --serie` | FS1 till FS6, S5, S6, S11 till S13 utan fel; 39 upplysningar S11 majoritet på grund och avancerad (fel bara på expert, där 0) |
| `node scripts/v7-distraktor-check.mjs --serie` | kraven i A5 uppfyllda för alla 96 |
| `node scripts/v7-geometri-check.mjs --serie <tre filer>` | G1, G2, G3 (alla 1 064 duo-kombinationer), G4, G6, G7, G9, G11, G12, S1 till S5, V11, V12 utan fel; störst 115 noder och 11,9 kB (gräns 120 och 14 kB) |

## Receptlistan som den byggdes

| Mall | Antal | p_prior | Varianter (antal frågor) |
|---|---|---|---|
| F1 Ett steg | 16 | 0,78 | pil (4), orbital (3), strålar (3), sektorhjul (3), 3×3-blockets kant (3); steg 1 eller 3 åt båda hållen |
| F2 Antal | 12 | 0,72 | strålar (4), sektorhjul (4), 3×3-blockets kant (4); ±1 från ett fast ställe |
| F3 Växande steg | 8 | 0,65 | pil (3), orbital (3), strålar (2); steget 1 eller 2 och växer med 1, båda hållen |
| F4 Två regler | 20 | 0,55 | pil vridning + längd eller spets (4), orbital läge + mittpunkt (2), strålar och sektorhjul kvartsvarv + antal (4), sektorhjul steg + antal i cykel (2), grundform form + fyllning (2), duo kant + pil (2), duo orbital + form (2), växande + spets/mittpunkt (2) |
| F5 Växelvis | 10 | 0,50 | pil (3), orbital (3), duo kant + pil (2), sektorhjul (2) |
| F6 Tre regler | 20 | 0,40 | pil (7), duo kant + pil eller symbol (7), duo orbital + form (6); alla med växande steg eller växelvis |
| F7 Två serier i otakt | 10 | 0,35 | pil (3), orbital (3), duo orbital + form (2), duo kant + symbol (2); växelvis mot tretakt |

## Där jag avvek från beställningen, och varför

1. **Primitiverna följer figurserier-spec.md 3.1.** Räknestreck, ringar och 2×2 är förbjudna i serien enligt specen, så de står inte i F2, F5 och F6. Duo ersätter 2×2 i F5 och F6, och duo orbital + form ersätter grundform i F7 (grundformens egenskaper är kategorier och kan inte gå växelvis).
2. **Månghörning och duons kantantal står inte i F2.** Båda har exakt sex värden (3 till 8 hörn, 1 till 6 prickar), så varje distraktor som bara bryter antalet blir en kopia av en visad figur och kravet "minst en bryter bara regeln" går inte att uppfylla. Månghörningens vridning används inte (triangelns 45-graderslägen är för lika). 3×3-blocket räknar längs kanten, 1 till 7.
3. **FS6:s gränser.** Beställningen säger sektorer 1 till 5; då ryms inte antal ±1 genom sex positioner. Jag följde specen: strålar och sektorer 1 till 7, kantprickar 1 till 6, hörn 3 till 8. Streck 1 till 4 och ringar 1 till 3 gäller primitiver som inte finns i serien.
4. **FS4 "steg 3 mot växande steg".** Med fem visade kan de två aldrig båda passa (differenserna är antingen lika eller växande, också mod 8). Fixturen visar därför att raden 0, 3, 6, 1, 4 blir entydig, och två tvetydiga fixturer där två läsningar passar och ger olika sjätte (tretakt mot "varannan lika", och växelvis mot cykel).
5. **Primitivkvoten** räknar duo med kantprickar och duo med orbital som två grupper; med en grupp ryms inte 20 F6-frågor (bara pil och duo har tre egenskaper som kan gå växelvis eller växande).
6. **"Bryter mönstret"** finns inte i beställningens recept (alla 96 är "härnäst"), så ingen av formerna genereras. Vyn kan rita regelformen när den beställs.

## Spärrtexterna

FS1 `aterkomst`, FS2 `period`, FS3 `takt`, FS4 `entydig`, FS5 `steg_fram`, FS6 `antal_tak`, S5 `facit_udda`, S6 `eliminerbar` (högst 1, expert 0), S11 `majoritet` (fel på expert) och `röstning` (fel på alla nivåer), S12 `utanfor` (värde utanför raden i en cykel, högst 1, expert 0), S13 `otestad`. Definitionerna står i filhuvudet i `scripts/lib/serie/sparrar.mjs`.

## Det jag vill att du tittar extra på

- Duo med flera kantprickar som vandrar (fs-e-vand-01 till 03, fs-e-flera-01 och 02, fs-e-antal-01 och 02): prickarna läses som en båge vars första prick är läget. Svårast att se av alla.
- F2 med avtagande antal: misstaget "står på fel plats. I raden står ... still" om bågens början.
- Familjen per fråga är satt per variant (tabellen ovan); F6 får vridning, växande, vandring, fyllning, flera och antal så att alla sju finns på expert.
- Regeltexterna är generatorns; copywriter bör putsa dem när du godkänt frågorna.
