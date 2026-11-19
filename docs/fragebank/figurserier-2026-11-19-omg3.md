# Figurserier: parti 5, omgång 3 (2026-11-19)

**Läge: kandidater, inte aktiverat och inte committat.** 95 uppgifter med `fran_version: 5` ligger i `src/lib/figurserierV1/kandidater/parti5-{grund,avancerad,expert}.json` (per mall i `kandidater/parti5/F*.json`). Appen importerar dem inte. De går in i nivåtesten först efter testansvarigs granskning, med `SERIE_VERSION` 5 (avsnittet Aktiveringen).

## Antal per nivå

| Nivå | Antal | Mallar | Klockor |
|---|---|---|---|
| Grund | 13 | F1 12, F2 1 | 2 |
| Avancerad | 35 | F10 26, F5 9 | 29 |
| Expert | 47 | F9 25, F7 12, F8 10 | 32 |

Målet var cirka 100. Vi stannade på 95, eftersom spärrarna tog slut och granskningen hellre vill ha färre uppgifter än kopior.

- **Grund är uttömd.** Följdspärren (samma lägesföljd inom nivå och familj, också under en annan primitiv) lämnade åtta följder i vridning och fyra i vandring. F1 fick exakt de tolv. F3 fick noll: alla 32 växande följder finns redan. F2 fick en, eftersom antalsföljderna per primitiv är två till fyra och nästan alla finns.
- **Avancerad F4 är uttömd.** Därför den nya mallen F10 på den nya primitiven. F10 stannade på 26: regelnyckeln för klockan har bara 8 nycklar per variant med kvartsvarv eller pendel, och följderna med 45 eller 135 grader i familjerna vridning och flera tar slut.
- **F5** stannade på nio. De växelvisa följderna som klarar F9-spärren (första serien förlängd får inte ge facit) är i praktiken redan tagna; varje ny kandidat med en växelvis regel krockade med en befintlig vriden följd. De nio har två regler.

## Ny primitiv: klockan

`kind: 'klocka'`, `{ lang, kort }` med pilens åtta lägen (0 är klockan 12, medurs). En prickad urtavla i ram-grått (som orbitalens bana), en lång och smal visare och en kort och bred visare från mitten, och ett nav i bläck. Två delar som rör sig var för sig i samma figur, som i SHL:s och Aons klockuppgifter.

- **Mått** i `geometri.json` (`klocka`): urtavla radie 32 (yttermått 64), lång visare 25 i kontur 3, kort visare 12,5 i kontur 5, nav 4,5. Visarna skiljer 12,5 enheter, 10,3 px på 360 (G5 kräver 10 px, som kort och lång pil). Den långa visaren slutar 4,25 enheter innanför urtavlans målade kant (G1).
- **Visarna pekar aldrig åt samma håll**, eftersom den långa då döljer den korta. `las` i `celler-serie.mjs` returnerar null, så FS6 fäller cellen. Geometrikontrollen har en ny spärr, K1, och G3 körs på alla 56 lägespar. Pekar visarna åt motsatt håll ser de ut som en linje genom mitten; den korta delen är tydligt bredare.
- **Renderaren** har fått en ny gren i `SvgCellV7` (`KlockaRenderer`). Inget annat i renderaren är ändrat. Alla 12 539 befintliga figurer i alla figurserie- och matrisbanker ritas med samma markup som före ändringen; vi jämförde en hash över hela utdatan före och efter. `klocka.test.ts` kontrollerar urtavlan, visarnas längd, bredd och vinkel i alla 56 lägespar, V2, V5, G5 och tre befintliga figurer ordagrant.
- **Texterna:** "Den långa visaren vrids 45 grader medurs i varje steg." "Den korta visaren pekar växelvis uppåt och snett uppåt höger." "Den korta visaren pekar i tur och ordning åt höger, nedåt och uppåt, och börjar sedan om." Två misstag som förut inte sa vilken del de gällde säger nu vilken visare det är: "Den långa visarens vridning har inte vuxit sista gången." och "Den korta visaren fortsätter serien i den första, tredje och femte figuren."
- **Regelnyckeln är strängare för klockan.** Urtavlan ser likadan ut vriden, så en klockserie som bara är vriden som helhet är samma uppgift. `klockNyckel` i `struktur.mjs` räknar därför inga lägen alls: en visare som står still är bara "stilla", och en cykel räknas som stegen mellan lägena med fasen bortvriden. Två klockor med samma regler och en stilla visare på olika ställen har alltså samma nyckel.

## Nya mallar

**F10 "Två visare"** (avancerad, p_prior 0,52, svårighet 2, 26 uppgifter). Den ena visaren går 45 eller 135 grader i varje steg. Den andra tar kvartsvarv, pendlar mellan två lägen eller går runt tre lägen i tur och ordning. Formen är F4:s (ett steg och en cykel) i en ny figur, så priorn ligger nära F4:s 0,55. Svårare än F4 för att båda delarna är visare och måste hållas isär på längd och bredd. Fördelning: steg och kvart 8, kvart och steg 2, steg och pendel 8, pendel och steg 4, steg och trecykel 4.

**F9 "Två visare i otakt"** (expert, p_prior 0,32, svårighet 4, 25 uppgifter). Två svåra regler samtidigt, en på varje visare:

- växande steg på den långa och två serier på den korta (9)
- två serier på den långa och växande steg på den korta (8)
- två serier på båda visarna, alltså fyra serier att hålla isär (8)

Ingen annan mall har två sådana regler i samma figur. F7 är två serier och en tretakt (0,35), F8 växande steg och ett kvartsvarv eller en trecykel (0,45). F9 ligger därför under båda. Expert får en mall som är verkligt svår på riktigt, inte bara längre.

Två lägen med fem olika värden var går alltid i takt (FS3). I alla klockmallar har därför den ena visaren ett läge som återkommer bland de fem visade, och FS3 prövas på varje fråga.

## Klockan och parti 4:s varianter i de äldre mallarna

- **F1:** en visare går 45 eller 135 grader, den andra står still (2). Övriga tio är parti 4:s varianter och mallens egna, inom de följder som var kvar.
- **F5:** den ena visaren i två serier, den andra i kvartsvarv (3), plus duo med pil i mitten och pricken i två serier (6).
- **F7:** den ena visaren i två serier, den andra i en trecykel (3), plus duo i tretakt (8) och 3×3-kanten med antal (1).
- **F8:** växande steg och kvartsvarv (2) eller trecykel (2) på klockan, plus parti 4:s trecykel i duo (6).

Pilen och orbitalen i tretakt, blocket som vandrar i F1 och F8:s pil-varianter står utanför, som granskningarna av parti 3 och 4 bestämde.

## Spärrarna

`scripts/gen-figurserier-parti5.mjs` är en kopia av parti 4:s generator. Mot alla banker (parti 1 till 4) och de nya i parti 5:

- följdspärren (lägesföljd, vriden växelvis följd, antalsföljd inom nivå och familj)
- regelnyckeln över alla nivåer, med den strängare nyckeln för klockan
- rörelsen: två nya frågor på samma nivå delar aldrig rörelse (granskningen av parti 4, punkt 3)
- F2-nyckeln, raden, lägesraden, kvoterna per primitivgrupp och strukturnyckeln
- V11 (noder och bytes)

`--sammanfoga` prövar raden, lägesraden, regelnyckeln, rörelsen och följden en gång till över alla mallar. Tar spärrarna slut stannar mallen och skriver skälen. `--ersatt` stryker id i `STRYK` och gör ersättare med samma spärrar, när granskningen är klar.

## Ritat och sett

Alla 95 är ritade med appens `cellSvg` i headless Chrome, i tolv ark med raden, luckan, sex alternativ, facit markerat, regeltexten och misstagen. Klockorna är också ritade en och en i fyra gångers förstoring. Bilderna ligger i scratchpad, utanför git. Facit följer regeltexten i alla, ingen distraktor ser ut som facit eller som en visad figur, och texterna är svenska utan tankstreck.

Det vi såg:

- Den korta visaren syns tydligt i appens storlek. I 92 pixlar är den liten men bredare än den långa, så den går att skilja ut. Står visarna 45 grader isär ligger de nära varandra vid navet; läget går ändå att läsa.
- Pendeln med 45 graders utslag (till exempel uppåt och snett uppåt höger) är den finaste skillnaden i partiet. Den är samma skillnad som ett pilsteg.
- fs-g-antal-20 är prickbågen som minskar. "Antalet ska vara två, inte fyra" följer enhetsregeln från copy omgång 3.

## Verifiering

- `node node_modules/tsx/dist/cli.mjs scripts/figurserier-verifiera.ts` med alla härnäst-banker och de tre kandidatfilerna: 415 uppgifter, 0 fel. 48 kända följdpar och 33 kända regelnyckelpar bland granskade eller äldre uppgifter är upplysning, som förut.
- Kedjan, också fristående på de tre kandidatfilerna: `validate-figurserier` (95 utan fel), `v7-facit-check --serie`, `v7-distraktor-check --serie` och `v7-geometri-check --serie` (G3 duo och klocka, K1) utan fel. Bankerna utan kandidaterna är också gröna, och `v7-geometri-check` i matrisläget likaså.
- `npx tsc --noEmit`: 0 fel.
- Vitest med `--exclude ".claude/**"` för `src/lib/logicTestV7`, `src/lib/figurserierV1`, `src/lib/tester`, `src/components/tests/serie`, `src/lib/nivakoll` och `src/lib/ovningsprov`: 265 av 265, nya `klocka.test.ts` inräknad.

## Aktiveringen (görs efter granskningen)

1. **Bankfiler.** Skriv de godkända (och eventuella ersättare från `--ersatt`) till `bankParti5Grund.json`, `bankParti5Avancerad.json` och `bankParti5Expert.json` med ett skript som `befordra-figurserier-parti4.mjs`, med parti 5:s id. Aldrig `befordra-figurserier.mjs`.
2. **`src/lib/figurserierV1/select.ts`:**
   - `import parti5Grund from './bankParti5Grund.json';` och samma för `Avancerad` och `Expert`
   - `export const SERIE_VERSION = 5;`
   - `export type SerieVersion = 1 | 2 | 3 | 4 | 5;`
   - `return v === 5 ? 5 : v === 4 ? 4 : v === 3 ? 3 : v === 2 ? 2 : 1;`
   - `const PARTI5: Record<SerieNiva, SerieFraga[]> = { grund: parti5Grund as unknown as SerieFraga[], avancerad: parti5Avancerad as unknown as SerieFraga[], expert: parti5Expert as unknown as SerieFraga[] };`
   - i `poolFor`: `...(version >= 4 ? PARTI4[niva] : []), ...(version >= 5 ? PARTI5[niva] : [])`
   - i `allaFragor`: `[...BANK[n], ...PARTI3[n], ...PARTI4[n], ...PARTI5[n]]`. Utan den rättas varje svar på en parti 5-fråga som fel.
3. **`src/lib/figurserierV1/types.ts`:** `fran_version: 1 | 2 | 3 | 4 | 5;`
4. **`scripts/figurserier-verifiera.ts`:** `'Parti5Grund', 'Parti5Avancerad', 'Parti5Expert'` i `HARNAST`, en `GODKANDA_PARTI5` med de godkända id:na och `|| (q.fran_version === 5 && GODKANDA_PARTI5.has(q.id))` i `granskad`. Kravet på `fran_version` 5 i `bankParti5*` finns redan.
5. **`src/lib/tester/__tests__/figurpass.test.ts`:** `SERIE_VERSION` 5, härnäst-poolerna plus de godkända per nivå (högst 13, 35 och 47), och `poolFor(n, 5)` är `poolFor(n, 4)` plus parti 5, med rättningstestet speglat.
6. **Changelog:** percentilen delas inte per bankversion. F9 och F10 är nya mallar med egna priors (0,32 och 0,52), och klockan är en ny figur.

Pågående sessioner behåller sitt urval: versionen skrivs vid start och saknad version läses som 1. Renderaren ritar klockan redan nu, så aktiveringen kräver ingen ändring i vyerna.

## Ändrade och nya filer

Nya:

- `scripts/gen-figurserier-parti5.mjs`
- `src/lib/logicTestV7/__tests__/klocka.test.ts`
- `src/lib/figurserierV1/kandidater/parti5-{grund,avancerad,expert}.json` och `kandidater/parti5/F1.json`, `F2.json`, `F3.json` (tom), `F5.json`, `F7.json`, `F8.json`, `F9.json`, `F10.json`
- `docs/fragebank/figurserier-2026-11-19-omg3.md`

Ändrade:

- `src/lib/logicTestV7/types.v7.ts` (`KlockaCell`), `renderers.v7.tsx` (`KlockaRenderer`), `geometri.json` och `geometri.ts` (`klocka`), `svgMatt.tsx` (två klockor i `allaPrimitiver`)
- `scripts/v7-geometri-check.mjs` (klockans element, K1, G3 klocka, G6 för visarna, yttermåttet)
- `scripts/lib/serie/celler-serie.mjs` (primitiven), `struktur.mjs` (visarna som lägesdimensioner, `klockNyckel`), `misstag-serie.mjs` (texterna), `generera-serie.mjs` (en kandidatcell som inte går att läsa tas aldrig in), `recept-serie.mjs` (F9 och F10, `parti: 5`)
- `scripts/figurserier-verifiera.ts` (klockan, `fran_version` per partinummer) och `scripts/validate-figurserier.mjs` (`fran_version` 5)

Inga bankfiler, inga andra testers filer och inget i `select.ts` eller `types.ts` för figurserierna är ändrat.

## Id-lista

**Grund F1:** fs-g-vrid-35, fs-g-vand-36, fs-g-vand-37, fs-g-vand-38, fs-g-vrid-36, fs-g-vrid-37, fs-g-vand-39, fs-g-vrid-38, fs-g-vrid-39, fs-g-vrid-40, fs-g-vrid-41, fs-g-vrid-42

**Grund F2:** fs-g-antal-20

**Avancerad F5:** fs-a-vaxl-42 till fs-a-vaxl-50

**Avancerad F10:** fs-a-vrid-19 till fs-a-vrid-34, fs-a-flera-27 till fs-a-flera-36

**Expert F7:** fs-e-vaxl-32 till fs-e-vaxl-42, fs-e-antal-20

**Expert F8:** fs-e-vax-15 till fs-e-vax-19, fs-e-flera-14 till fs-e-flera-18

**Expert F9:** fs-e-vax-20 till fs-e-vax-28, fs-e-vaxl-43 till fs-e-vaxl-50, fs-e-flera-19 till fs-e-flera-26

## Efter granskningen (2026-11-19)

Testansvarig godkände 92 av 95 (docs/fragebank/figurserier-2026-11-19-omg3-granskning.md). fs-e-flera-19, fs-a-flera-35 och fs-g-vrid-42 är strukna och ersätts inte. Kandidatfilerna står kvar orörda.

### Spärrarna från granskningen

Alla tre ligger i `scripts/lib/serie/struktur.mjs` och används av generatorn och verifieraren. Ingen av dem fäller någon av de 92.

- **Stela visare (punkt 1).** `stelaVisare(q)`: klockan med båda visarna i två serier och samma steg i båda serierna. Generatorn avvisar den, och verifieraren ger fel för en ogranskad fråga. Fäller fs-e-flera-19.
- **Klockans cykel som mängd (punkt 2).** `klockNyckel` räknar cykeln som mängden lägen den går runt, med vridningen bortvriden, inte som stegföljden. Fäller fs-a-flera-35 mot fs-a-flera-34.
- **Duo stilla (punkt 3).** I `regelNyckel` är en del av en duo som står still bara "stilla", inte ett läge. Fäller fs-g-vrid-42 mot fs-g-vrid-15. Nyckeln ger fyra nya par bland redan granskade uppgifter, bland dem fs-g-vrid-27 mot fs-g-vrid-31 som granskningen av parti 4 nämnde. De är upplysning (37 kända par i stället för 33).

`STRYK` i `gen-figurserier-parti5.mjs` har de tre id:na, så att de aldrig kommer tillbaka om `--ersatt` körs.

### Aktiveringen

- `scripts/befordra-figurserier-parti5.mjs` (ny) skriver `bankParti5Grund.json` (12), `bankParti5Avancerad.json` (34) och `bankParti5Expert.json` (46) och filtrerar på de 92 godkända.
- Verifieraren: parti 5 i `HARNAST` och `GODKANDA_PARTI5` (92 id) i `granskad`.
- `select.ts`, `types.ts` och `figurpass.test.ts`: se nästa stycke.

### Verifiering efter befordran

- `figurserier-verifiera.ts` på alla härnäst-banker, parti 5 inräknat: 412 uppgifter, 0 fel. 48 kända följdpar och 37 kända regelnyckelpar är upplysning.
- `validate-figurserier`, `v7-facit-check --serie`, `v7-distraktor-check --serie` och `v7-geometri-check --serie`: inga fel, både i kedjan och fristående på de tre `bankParti5`-filerna. `validate-figurserier` utan argument: 98 utan fel.
- Med kandidatfilerna som argument fäller verifieraren de tre strukna med de nya spärrarna.
- `tsc --noEmit`: 0 fel. Vitest (logicTestV7, figurserierV1, tester, serievyn, nivakoll, ovningsprov, `--exclude ".claude/**"`): 265 av 265, med `select.ts` ännu på version 4.
