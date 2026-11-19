# Deduktiv slutledning, omgång 2: 100 nya uppgifter (bankversion 4)

Datum 2026-11-19. Till testansvarig för granskning före aktivering. Bygger på anmärkningarna i `deduktiv-2026-11-19-granskning.md`.

## Antal per nivå

| Nivå | Nya | Typ | Pool i version 3 | Pool i version 4 |
|---|---|---|---|---|
| Grund | 38 | 30 D1 premisskedjor, 8 D2 (4 platser, tre villkor, måste-frågor, p_prior 0,62) | 68 | 106 |
| Avancerad | 37 | D2, 26 med 5 platser och 11 i turordningen med 6; 18 måste-frågor, 19 vem-frågor | 67 | 104 |
| Expert | 25 | D3 omöjligt-frågor, fem till sex villkor; 9 turordning, 8 kollegor, 8 pärmar | 45 | 70 |

## Bankversionen

De nya uppgifterna har `fran_version: 4`. `DEDUKTIV_VERSION` står kvar på 3, så ingen session drar dem än. `deduktivVersion()` läser `deduktiv_version: 4` ur meta, och typerna tillåter 4. Aktivering efter granskningen:

1. `DEDUKTIV_VERSION = 4` i `src/lib/deduktivV1/select.ts`.
2. `version4.test.ts` säger `expect(DEDUKTIV_VERSION).toBe(3)`; byt till 4. `version3.test.ts` säger `toBe(3)`; ändra till `toBeGreaterThanOrEqual(3)`, som i `version2.test.ts`.

Id passerar 99 på avancerad (dd-a-d2-100 till 119), så validatorn tar nu två eller tre siffror.

## Anmärkningarna från omgång 1

| Anmärkning | Vad vi gjorde |
|---|---|
| 7, svårighet | Grund-D2 får p_prior 0,62 direkt. |
| 8, variation i familjer | Tak per familj: högst 2 av 8 på grund, 7 av 37 på avancerad och 5 av 25 på expert. Undantaget är före och efter på avancerad (11): turordningens måste-frågor ger nästan bara den familjen, och de behövs för att dela temana jämnt. Högst två "inte på plats" i ett pussel. Expert vilar inte längre på utesluten plats (5 av 25, mot 10 av 25 i omgång 1). |
| 8, jämn fördelning | Avancerad 18 måste och 19 vem; teman 13, 13 och 11. Expert 9, 8 och 8. |
| 9, nästan-dubbletter | Ny kontroll i verifieraren, se nedan. Inga nästan-dubbletter i version 4. |
| D1-scenarier | 30 nya miljöer: flygplats, tandvård, museum, räddningstjänst, bank, teater, hamn, gym, äldreboende, vattenverk, flyttfirma, frisörsalong, skolskjuts, energibolag, universitet, kulturskola, camping, godsterminal, redovisningsbyrå, skidanläggning, djursjukhus, vallokal, fritidsgård, tryckeri, matleverans, idrottshall, försäkringsbolag, bageri, arkitektkontor och simhall. Flera har fyra premisser eller två namngivna personer. |

Familjer (familjen är den villkorstyp som lösningsgången lutar sig mest på):

| Nivå | Familjer |
|---|---|
| Grund | premiss 30, vänster om 2, direkt vänster om 2, utesluten plats 2, inte bredvid 2 |
| Avancerad | före och efter 11, vänster om 7, direkt vänster om 7, utesluten plats 5, inte bredvid 5, bredvid 2 |
| Expert | före och efter 5, utesluten plats 5, vänster om 5, inte bredvid 5, direkt vänster om 3, samma grupp 1, bredvid 1 |

Familjen "villkor i rörelse" finns inte i någon uppgift, inte heller i dag: lösaren sätter familjen efter villkoren och aldrig efter antagandet. Den kan bara komma med en ändring i `scripts/lib/deduktiv/generera.mjs`.

## Verifieringen

1. **`scripts/deduktiv-verifiera.mjs`** prövar alla tilldelningar (D2, D3) och alla mängdmodeller (D1) som i omgång 1. Ny i verifieraren är kontrollen för **nästan-dubbletter**:
   - Schemapussel: villkoren och antagandet tolkas ur texten och skrivs om till en nyckel som inte beror på namn, spegling (plats k blir n+1-k och vänster blir höger), tema eller fråga. Två pussel med samma nyckel är nästan-dubbletter.
   - Premisskedjor: premissernas ord (fyra bokstäver eller fler) får inte överlappa till hälften eller mer (Jaccard).
   - Från version 4 fäller en nästan-dubblett uppgiften. Jämförelsen görs mot alla uppgifter, pensionerade inräknade.
   - Kontrollen är prövad på förstörda kopior: ett pussel med två färger bytta och en premisskedja med ett namn bytt. Båda fångades.
2. **`node scripts/validate-deduktiv.mjs`**: DD1 till DD9 och de övriga spärrarna, grönt.
3. **Tester**: nya `version4.test.ts` prövar antal, p_prior, balansen mellan måste- och vem-frågor och att version 3 är oförändrad. vitest för deduktivV1, ovningsprov, nivakoll, tester och traning är grön (373 tester). `npx tsc --noEmit -p .` ger inga fel.

Resultat: 311 av 311 uppgifter bevisade, 0 nästan-dubbletter i version 4.

## Att ta ställning till: kända par i version 1 till 3

Den nya kontrollen hittar 12 par bland de aktiva uppgifterna på avancerad. Paren är samma pussel med andra namn, spegling eller en annan fråga: 04/29, 29/32, 09/53, 14/63, 43/63, 19/68, 23/50, 23/82, 50/82, 27/61, 58/78 och 69/71 (alla dd-a-d2). Tio par har minst en uppgift från version 3. Inget har ändrats: en uppgift får inte byta innehåll under sitt id. Förslaget är att pensionera den nyare uppgiften i varje par i en senare version, vilket kräver att `pensionerad_fran` får andra värden än 2.

## Id

- Grund, D1: dd-g-d1-55 till dd-g-d1-84 (30)
- Grund, D2: dd-g-d2-26 till dd-g-d2-33 (8)
- Avancerad, D2: dd-a-d2-83 till dd-a-d2-119 (37)
- Expert, D3: dd-e-d3-65 till dd-e-d3-89 (25)

## Efter granskningen (omg2-granskning.md)

- **Texträttelser:** dd-g-d1-59, 73, 75 och 81 är ändrade enligt granskningen. Facit och ordningen på alternativen är oförändrade.
- **Ersättare med samma id:** dd-a-d2-112, 117 och 119 (måste-frågor i turordningen), 114 och 115 (vem-frågor i turordningen), 116 (vem-fråga, kollegor i rad, eftersom turordningen saknade en ny kombination utan före och efter), dd-e-d3-71 (familjen utesluten plats) och dd-e-d3-77 (familjen samma grupp, utan en trio som knyts ihop av två samma dag-villkor).
  - Varje ersättare i turordningen har en kombination av villkorstyper som inte fanns tidigare.
  - Ingen ersättare delar exakt nyckel eller lös nyckel med en annan aktiv uppgift.
  - Före och efter står för 7 av 37 på avancerad, och temana är 14, 13 och 10.
- **Pensioneras från version 4:** dd-a-d2-32, 50, 53, 61, 63, 68, 71, 78 och 82 får `pensionerad_fran: 4`. De finns kvar i version 1 till 3. Avancerad i version 4 har 95 uppgifter, och det finns inga kända par kvar.
  - Adminregistret (`src/lib/fragor/register.server.ts`) markerar uppgifter med `pensionerad_fran` som pensionerade direkt, alltså redan nu, fast de dras i version 3 tills versionen höjs.
- **Lös nyckel i verifieraren:** varnar för par med samma villkor utan platser (graf), eller med samma villkorstyper och samma lösningsgång (gång). Den fäller inte. 22 par varnas, 14 av dem med version 4, och ingen av dem gäller en ersättare. Testansvarig avgör.
- **Verifiering:** 311 av 311 bevisade, 0 nästan-dubbletter, validate-deduktiv grön, tsc ren, vitest 374 gröna.

Aktivering, exakta rader:

- `src/lib/deduktivV1/select.ts:31`: `DEDUKTIV_VERSION = 3` blir `4`.
- `src/lib/deduktivV1/__tests__/version4.test.ts:47`: `toBe(3)` blir `toBe(4)`.
- `src/lib/deduktivV1/__tests__/version3.test.ts:32`: `toBe(3)` blir `toBeGreaterThanOrEqual(3)`.

## Efter omgranskningen

- **Lösningstexter:** dd-g-d1-73 slutar nu "av en praktikant". dd-g-d1-81 citerar premiss 1 som den står. dd-e-d3-77 har granskarens text och fältet `losning_granskad: true`; validatorn godtar då att texten avviker från lösarens ordalydelse men kontrollerar stegen, remsan och lösningen som vanligt.
- **Ersatta med samma id:**
  - dd-a-d2-100: måste-fråga i rad med bredvid och inte bredvid.
  - dd-a-d2-101: vem-fråga med pärmar, bredvid och inte bredvid.
  - dd-a-d2-116: vem-fråga i rad, bredvid och inte bredvid.
  - dd-e-d3-67 och 70: familjen utesluten plats, ingen ren kedja.
  - Ingen av dem delar exakt eller lös nyckel med någon uppgift i version 1 till 4, pensionerade inräknade. Verifieraren varnar inte för någon av dem.
- **Strukna ur version 4:** dd-a-d2-111, 113 och 114. Turordningens vem-frågor med två samma dag-par eller "inte på plats" på två personer gav ingen giltig uppgift på 1,8 miljoner försök per id.
- **Lös nyckel skärpt:** två nycklar till. Mönster är villkorstyperna plus vilka slags steg gången har. Kedja gäller när gången bara är "lås platser, en kedja fyller resten". Alla par som granskaren fällde varnas nu (113/09/39, 111/43, 100/45, 101/79, 70/47, 67/50, 114/110 och 116/06/64). Varningarna är fler: 83 par, varav 38 med version 4, mest från kedjenyckeln. De fäller inte.
- **Nya antal i version 4:** 97 nya (grund 38, avancerad 34, expert 25).
  - Pooler i version 4: 106, 92 och 70.
  - Avancerad har 18 måste- och 16 vem-frågor.
  - Temana fördelas 14, 13 och 7.
  - Före och efter står för 4 av 34.
- **Kontroller:** 308 av 308 bevisade, 0 nästan-dubbletter, validate-deduktiv grön, tsc ren, vitest 374 gröna.

Aktiveringsraderna är desamma som ovan: `select.ts:31`, `version4.test.ts:48` och `version3.test.ts:32`.

## Efter tredje granskningen

- **Strukna:** dd-g-d2-30, dd-a-d2-92, 107, 110 och 118 samt dd-e-d3-70 och 71. Alla sju fanns bara i version 4, så raderna är borttagna. Ingen aktiv uppgift i version 1 till 3 har ändrats.
- **Antal i version 4:** 90 nya uppgifter.

| Nivå | Nya | Pool i version 4 |
|---|---|---|
| Grund | 37 (30 D1 och 7 D2) | 105 |
| Avancerad | 30 (16 måste, 14 vem; temana 13, 12 och 5) | 88 |
| Expert | 23 | 68 |

- **Kontroller:** 301 av 301 bevisade, 0 nästan-dubbletter. Den lösa nyckeln varnar för 64 par, varav 19 med version 4. validate-deduktiv grön, tsc ren, vitest 374 gröna.

Aktivering: `select.ts:31` (`DEDUKTIV_VERSION = 3` blir `4`), `version4.test.ts:49` (`toBe(3)` blir `toBe(4)`) och `version3.test.ts:32` (`toBe(3)` blir `toBeGreaterThanOrEqual(3)`).
