# Att granska: bank_version 3, omgång 2

Datum 2026-10-12. Från Opus A till testansvarig. Omgång 2 svarar på dina två granskningar, `granskning-grund-avancerad.md` och `granskning-expert-verbal-numerisk.md`.

- Bara de 97 nya frågorna är renderade, och de visas i den nya grafiken (grafik v3 från main).
- De godkända frågorna är låsta i kandidatfilerna och har inte byggts om.
- De strukna frågorna finns inte längre i filerna.

Ingenting ligger i en skarp bank, och `BANK_VERSION` är fortfarande 2.

## 1. Var allt ligger

| Fil | Nya | Sida |
|---|---|---|
| `grund-v3-parti-01.v7.json` | 8 | `omgang2/grund-v3-parti-01/index.html` |
| `avancerad-v3-parti-01.v7.json` | 45 | `omgang2/avancerad-v3-parti-01/index.html` |
| `expert-v3-parti-01.v7.json` | 20 | `omgang2/expert-v3-parti-01/index.html` |
| `expert-plus-parti-03.v7.json` | 24 | `omgang2/expert-plus-parti-03/index.html` |

Varje kort visar mallen och p_prior. Frågor med två eller fler regler har dessutom en rad som visar vilken regel varje alternativ bryter.

Listan över nya id per fil finns i `nya.json`. Den innehåller alla frågor som ingen beslutsfil har godkänt.

## 2. Volym om allt godkänns

| Nivå | Kvar | Godkända | Nya | Summa | Mål |
|---|---|---|---|---|---|
| Grund | 25 | 80 | 8 | 113 | 113 |
| Avancerad | 35 | 23 | 45 | 103 | 103 |
| Expert | 35 | 20 (P4 8, P5 8, överlagring 3, spegling 1) | 20 + 24 | 99 | 99 |

## 3. Vad som är ändrat i generatorn

1. **Varje regel testas.** Urvalet av distraktorer kräver nu, för alla frågor med två eller fler regler, att minst två distraktorer bryter varje regel.
   - Grund och avancerad: minst en av dem bryter bara den regeln.
   - Expert: minst en nära miss totalt. Fler nära miss gör facit till majoritet, så kravet kan inte vara högre där.
   - Sökningen tar först en nära miss per regel.
2. **S11 majoritet**, som i din fil. Facits värde får inte vara strikt vanligast i någon egenskap. För mängder får facit inte vara ensamt centrum (minst sammanlagd symmetrisk differens), och elementen i fler än tre alternativ får inte vara just facit. Fel på expert och plus, upplysning på grund och avancerad.
3. **S12 utanför.** Ingen distraktor får ha ett värde som saknas i rutnätet i en egenskap som styrs av en latinsk kvadrat, ett schackmönster eller en diagonal. Noll på expert och plus, högst en på grund och avancerad.
4. **S13 otestad** är spärren som granskningen av grund och avancerad kallade S11. Jag har döpt om den till S13 för att numreringen ska följa expertgranskningen: en regel vars egenskap är densamma i alla sex alternativ är ett fel för alla nya frågor.
5. **S4** räknar enrad bara på egenskaper där alternativen skiljer sig. Med den räkningen är version 3-prognosen på avancerad 12 procent enradsfrågor.
6. **Delade rader.** Två frågor i samma recept får dela högst en rad och aldrig facit plus en rad. Spärren gäller i bygget och över varje recept, men inte mellan två redan godkända frågor. Tre sådana par finns redan bland de godkända, och de bör du titta på:
   - grund vand-03 och vand-01
   - grund vand-13 och vand-07
   - grund antal-05 och antal-04
7. **Plus med fran_version 3:** minst en nära miss och varje regel bruten av två distraktorer. En distraktor som bryter alla tre reglerna är tillåten, eftersom det krävs för att facit inte ska bli majoritet (räkningen i din fil). Den distraktorn får tre meningar i misstagstexten, med meningarna om rad och kolumn sammanslagna.
8. **Frågor du godkände i omgång 1 som bryter S11 eller S12.** De står kvar med ditt beslut i `GODKANDA_FORE_S11` i `sparrar.mjs`:
   - S12: v7g-v3-lant-03, -04, -06, -07 och v7a-v3-lant-01 (strålar på andra platser)
   - S11, facit som centrum: v7e-v3-over-02, v7e-plus-over-18 och -20

## 4. Per mall: vad du ska titta på

**Grund (8)**
- M2-pil-schack 4 och M2-orbital-schack 2 (byte-07 till -12): spets, längd eller mittpunkt varierar nu i alternativen. Det är fortfarande enradsfrågor, eftersom schack längs en rad är en växling. Det är tillåtet på grund.
- vrid-23 och vand-14 ersätter vrid-21 och vand-12.

**Avancerad (45)**
- M2-pil-diagonal 7 (vrid-20 till -26) och M2-pil-fri-diagonal 6 (vrid-27 till -30, -39 och -40).
- M4-pil 8 (vrid-31 till -38).
- M2-pil-tre 6 (byte-12 till -17).
- M2-orbital-diagonal 15 (vand-12 till -26): ersätter också orbital med schack. Misstagstexten för mittpunkten på diagonalen är ny: "Mittpunkten är fylld på diagonalen ...".
- M3-balans-sida 2 (tva-05 och -06), byggd så här:
  - Kvadratens sida går i schackmönster och cirkeln står alltid på andra sidan. Annars krockar formerna i samma fack.
  - Det betyder att sidan är en regel som syns på båda formerna.
  - Konstruktionen ger bara två olika utseenden (S10), så det blev två frågor. Två pilar med diagonal tar volymen.
  - Beslut: räcker det som tredje regel?
- antal-summa-radvis 1 (antal-04):
  - Jag följde inte planen här. Riktning som växlar per rad, med samma riktning i hela raden, är parallellt enligt V7-regel 1, eftersom alla kolumner då får samma sekvens.
  - Jag byggde därför riktningen i schackmönster.
  - Beslut: godtas det?

**Expert (20)**
- P6 (v7e-v3-tva-01 till -04): samma rutnät som p6-01 till -04, med nya alternativ. Band expert, p_prior 0,45.
- P8 som vanlig överlagring (v7e-v3-over-04 till -11, fyra sektorhjul och fyra strålar):
  - Distraktorerna är union, snitt, kopia av en ruta, XOR av fel par och facit vridet 45 eller 90 grader.
  - Inga distraktorer med ett element mer eller mindre.
  - Ingen fråga har facit som centrum (S11).
- Fyllnad: överlagring 4 (over-12 till -15) och spegling 4 (speg-02 till -05).

**Plus parti 03 (24)**
- P1' p1-25 till -32, P2 p2-17 till -24 och P3 p3-17 till -24, på parti 02:s rutnät. Alla 28 rutnät i P6 och plus är identiska med de strukna.
- Alternativen tar bara värden ur rutnätet, och ingen egenskap har facit som majoritet.
- P3 har bara vänsterförskjutning, med undantaget från S8 som i omgång 1.
- Kontrollera att distraktorerna som bryter alla tre regler inte känns som slumpfigurer.

## 5. Kontrollerna

Följande kontroller är gröna på alla fyra filerna och på alla tio bankfiler:
- validate och parallel
- facit med S1 till S13 och delade rader
- distraktorkontrollen med `--krav=plus` (v3-kraven för plus)
- geometrin G1 till G12 och V1 till V12, som visar 28 till 140 noder och högst 14,6 kB per fråga

`bank-version-3.mjs --kontroll` och hela vitest är också gröna.

Prognosen för version 3 med kandidaterna:

| Nivå | Ruta 0 | Ingen ruta över | Enrad |
|---|---|---|---|
| Grund | 8 % | 18 % | 49 % |
| Avancerad | 3 % | 13 % | 12 % |
| Expert | 0 % | 4 % | 1 % |

Bland de nya frågorna har 8 på avancerad S11-majoritet. Det är bara en upplysning på den nivån.

## 6. Befordran

Skriv beslutsfilen `beslut-omgang2.json` på samma sätt som tidigare. Därefter:

- Strukna frågor byggs om med `node scripts/gen-bank-v3.mjs`, som låser allt som är godkänt.
- Befordran görs med `node scripts/befordra-bank-v3.mjs`. Skriptet läser en beslutsfil med alla godkända id.
