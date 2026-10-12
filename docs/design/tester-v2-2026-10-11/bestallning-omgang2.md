# Beställning omgång 2: Figurserier, passform för verbalt och numeriskt, resterna efter svepet

Datum 2026-10-12. Beställare: testansvarig. Mottagare: Opus C (figurserier), Opus D (passform och rester), art-director (`figurserier-spec.md` skrivs parallellt i samma worktree), saas-lead. Utgångspunkt: main 03ee4aaa (bank_version 3, grafik v3, verbalt/numeriskt parti 02 live). Underlag: `riktlinjer.md` (1.2, 2.5, 3, "Omgång 2"), `grafik-v3-spec.md` 12, `granskning-figurer.md` (G1 till G12, avsnitt 4), `plan-facit-genvag.md`, `tillagg-variation.md`, `docs/qa/bank-v3/granskning-omgang2.md`, `kontrakt-kalibrering.md`, minnet `reference_matrix_test_system.md`, koden i `src/lib/logicTestV7/`, `scripts/lib/matris/`, `src/lib/ovningsprov/`, `src/lib/tester/`, `src/lib/traning/`, `src/app/dashboard/tester/`.

Ordregler: svenska facktermer, inga tankstreck, "samma format som" och aldrig "samma test", ingen Sparkles-ikon, inga tal i löptext där en siffra eller en liten visualisering räcker. Mejlen `veckan` och `efter_provet` utgår (ägarbeslut: högst två mejl).

## 0. Läget, data mot bedömning

Data (läst i worktreen i dag):
- Matriser version 3: 110 / 95 / 95 valbara. 15 strukna i omgång 2 väntar på ombyggnad (8 avancerad, 4 expert och plus, 3 grund).
- Verbalt: grund 36 texter, avancerad 32, expert 12. Numeriskt: grund 20 underlag, avancerad 20, expert 12. Parti 01 (va-01 till 08, na-01 till 08) ligger i `kandidater/`, inte i skarp bank.
- `verbalTestProv/selectProv.ts` och `numericalTestProv/selectProv.ts` importerar bara `questionBank.json`; övningsprovets motor läser samma pooler. Parti 02 når inte övningsprovet.
- 48 frysta verbala titlar börjar med "PASSAGE", nummer och långt tankstreck. `rensaTitel` finns bara i `ovningsprov/motor.server.ts`.
- `tempo.ts` har `PROVFORMAT.aon` (20 på 5 minuter, `verifierad: true`); `ovningsprov/format.ts` säger att Aons tal inte är verifierade. Ingen källa i repo. Tills bevakningen lämnar en källa i `docs/`: vårt format.
- Perf "tester prov": LCP 2 220 ms, 5 rundturer före LCP (`docs/qa/efter-lyftet/perf-inloggat.json`). Budget 2 000.

Bedömning: nivån, kurvan och passet i Rummet är byggda för matriser (`test_kind: 'matris'` genom motorn), och en andra testtyp i nivån gör kurvan osann. Figurserier får därför tre klassiska nivåtest och eget kort nu; pass, Nivåkoll och övningsprov i omgång 3, när 25 sessioner per nivå har kalibrerat banken och formatet är verifierat.

---

## A. Figurserier (Opus C)

### A1. Omfattning

Byggs: testtypen `figurserie` med `figurserier-grund|avancerad|expert` (15 uppgifter ur en pool per nivå, samma urvalsmekanik som matriserna), resultatsida med genomgång (regel och misstag per fråga, "Var du tappade" per familj), percentil från 25 sessioner per test_type, kortet "Figurserier" i Alla tester, generator med spärrar, valideringskedja, flytten av Aon från logikkortet.

Byggs inte: pass, riktat pass, Nivåkollen, övningsprov, smakprov, kalibreringsfråga. Hjälpen och kortet lovar inget om dem.

Gate: samma som motsvarande matrisnivå (`featureForTestType`, serverside i session-POST). Avancerad och expert Premium.

Format: tre figurer per rad, två rader, luckan sist, samma skala och hårlinjer som matrisen (grafik-v3-spec 12). Det visuella beslutas i `figurserier-spec.md`; Opus C gör inga egna val där specen tiger. Inga nya primitiver: V7:s celler via `SvgLayeredCell` och grafik v3, `LuckaV7`, sex alternativ tre i bredd.

### A2. Datamodell

`src/lib/figurserierV1/`: `types.ts`, tre bankfiler, `select.ts` (seedad Fisher-Yates på sessionId, 15 av poolen; test- och resultatsida härleder samma urval), `familjer.json`, `fragor.server.ts`. En fråga: `id` (`fs-g-vrid-01`), `niva`, `family`, `recept`, `difficulty`, `p_prior`, `rad` (fem celler), `options` (sex celler), `correctAnswer`, `rule`, `misstag` (fem), `fran_version: 1`.

Sessioner i `logic_test_v4_sessions`: `test_type` `figurserier-*`, `meta.alternativ_blandade: true`, `meta.serie_version: 1`, `meta.antal: 15`. Rättning serverside (egen route eller `logicTestV4/answer` med `BANK_FOR_RUTT.figurserier`; poolerna blandas aldrig med matrisernas). `p_statistik`, `fraga_statistik.test_kind` och `RAPPORT_TEST_KIND` får `figurserie`. Rapportknappen gäller i genomgången.

### A3. Recept, antal, p_prior

Positionerna 0 till 5, 0 till 4 visas, 5 är luckan. Regeltyper i `tolka-serie.mjs`: `konstant`, `steg k` (n = 8, 4, 2), `vaxande steg` (offset 0, 1, 3, 6, 10, 15 mod n), `antal ±1` (utan omstart), `cykel` över en värdelista (fyllning, symbol), `vaxelvis` (0, 2, 4 följer en regel, 1, 3, 5 en annan; luckan tillhör den udda). Växande steg är tillåtet i en rad (ingen ruta "till vänster om luckan" att skydda); FS1 tar kopiorna.

| Mall | Nivå | Regler | Primitiver | Antal | p_prior |
|---|---|---|---|---|---|
| F1 Ett steg | grund | `steg k`, period ≥ 6 | pil, orbital, strålar, sektorhjul, månghörning | 16 | 0,78 |
| F2 Antal eller fyllning | grund | `antal ±1` eller `cykel` | räknestreck, ringar, 3×3-block, grundform, 2×2 | 12 | 0,72 |
| F3 Växande steg | grund | `vaxande steg` | pil, orbital, strålar | 8 | 0,65 |
| F4 Två regler | avancerad | två dimensioner, olika period, inte i takt | pil (vinkel + spets eller längd), orbital (läge + mittpunkt), strålar och sektorhjul (vridning + antal), grundform (form + fyllning) | 20 | 0,55 |
| F5 Växelvis | avancerad | `vaxelvis` på en dimension, `konstant` eller `steg` på en annan | pil, orbital, 2×2, grundform | 10 | 0,50 |
| F6 Tre regler | expert | tre dimensioner, minst en `vaxande steg` eller `vaxelvis`, ingen i takt | pil, strålar, sektorhjul, 2×2 | 20 | 0,40 |
| F7 Två serier i otakt | expert | `vaxelvis` på två dimensioner med olika indelning (jämn/udda mot tretakt) | pil, orbital, grundform | 10 | 0,35 |

Start: 36 / 30 / 30, allt genererat. `p_prior` per mall i receptet, aldrig per fråga; validatorn felar utan `p_prior` eller utanför spannet (grund ≥ 0,60, expert ≤ 0,45). Inom en mall: varje primitiv högst ⌈n/3⌉ gånger, ingen strukturnyckel fler än ⌈n/2⌉ (S8 och S10 på rad): variera regeln, inte startläget. Familjer med egna namn: `vridning`, `vandring`, `antal`, `fyllning`, `vaxande`, `vaxelvis`, `flera`; alla sju på avancerad och expert, minst fyra på grund.

### A4. Spärrar

Ur minnet gäller oförändrat: synlig referensram, inga glyfer, symmetrifilter (G6, minst fyra distinkta lägen), högst fyra streck, varierade alternativ, variera regeln, sex alternativ. G1 till G5 och G10 till G12 via `v7-geometri-check.mjs --serie` (fem celler plus sex alternativ). En primitiv per cell.

Nya, i `scripts/lib/serie/sparrar.mjs`, fel i `bygg()` och i `v7-facit-check.mjs --serie`:

| Nr | Namn | Definition |
|---|---|---|
| FS1 | `aterkomst` (G9) | Facit och alla distraktorer skiljer sig per dimension från var och en av de fem visade. Ingen visad figur lika någon annan. |
| FS2 | `period` (G9) | Hela figurens period (minsta gemensamma multipel; oändlig för `antal ±1` och `vaxande steg`) minst 6. Ensamt `steg` med n = 4, eller k = 2 vid n = 8, fälls. |
| FS3 | `takt` (G7) | För varje par av rörliga dimensioner är A → B över de fem visade ingen bijektion. |
| FS4 | `entydig` | Alla regelhypoteser som passar de fem visade (alla typer, alla k, båda riktningar, båda indelningar) ger samma sjätte figur, och exakt ett alternativ är den. Annars tvetydig, slängs. |
| FS5 | `steg_fram` | Position 4 som distraktor är förbjuden (kopia); position 6 tillåten bara om den inte är lika någon visad. |
| FS6 | `antal_tak` | Antal inom primitivens gränser i hela raden och alla alternativ (streck 1 till 4, sektorer 1 till 5, ringar 1 till 3). Inga tomma figurer, inte heller som alternativ. |

Från `sparrar.mjs` återanvänds S5, S6 (högst en på grund och avancerad, noll på expert), S11 majoritet och röstning (fel på alla nivåer när facit är strikt vanligast i varje regelstyrd dimension), S12 (noll på expert), S13. S1 till S4 och S9 är matrisspecifika.

### A5. Distraktorer

Kandidater i ordning: per regelstyrd dimension facit med värdet ett steg för långt, ett steg bakåt (om inte kopia), ett annat värde ur raden; därefter två dimensioner fel. Urvalet av fem: minst två bryter varje regel, minst en bryter bara den (grund och avancerad); expert minst en nära miss och två som bryter alla regler med olika fel, så ingen dimension blir majoritet. Misstagstext per distraktor ur `misstag-serie.mjs` ("Vrider åt fel håll.", "Ett steg för långt.", "Antalet har inte ökat sista steget.", "Följer den jämna serien, men luckan hör till den udda."). Aldrig "lätt".

### A6. Kod, i ordning

1. `scripts/lib/serie/{tolka-serie,sparrar,distraktorer,misstag-serie,generera-serie,recept-serie}.mjs`; `celler.mjs`, `dimNyckel`, `vKey` importeras från `scripts/lib/matris/`.
2. `scripts/gen-figurserier.mjs` (deterministiskt, dubblettkontroll på kanonisk radnyckel), `scripts/validate-figurserier.mjs`, serie-läge i `v7-facit-check`, `v7-distraktor-check`, `v7-geometri-check`. Kedjan i filhuvudena.
3. `render-matris-granskning.tsx --serie --fil`: PNG per fråga med rad, alternativ, regel, misstag, distraktorrad till `docs/qa/figurserier/kandidater/<fil>/`.
4. `src/lib/figurserierV1/` och `src/components/tests/serie/{FigurserieRad,FigurserieTestSession}.tsx` efter specen; luckan med samma höjdmekanism som fyllda rutor.
5. `testConfig.ts`: tre poster `kind: 'figurserie'`, 15 uppgifter, minuter som matrisnivåerna. `TestRunner` väljer vyn; resultatsidan grupperar på familj; percentilrouten nycklar redan på `test_type`.
6. Alla tester: grupp `figurer` i `testCatalog.ts` mellan logik och verbalt, kort enligt riktlinjerna 1.5, `NIVA_GOR.figurer` = en, två, tre regler, `ENHET.figurer = 'uppgifter'`. Provraden dämpad utan lås och pil: "Övningsprov mot klockan" / "Inte än för figurserier. Logikens övningsprov övar tempot." Copywriter putsar.
7. Aon: `formatForPlan('aon')` ger `PROVFORMAT.eget` med anmärkningen "Aon scales ix använder figurserier, inte rutnät. Öva dem under Figurserier. Övningsprovet här övar tempot med matriser." `PROVFORMAT.aon` står kvar för gamla sessioner (`verifierad: false`, `cirka: true`), väljs aldrig för nya. `hjalp-copy.ts` rad 90 pekar på kortet.
8. Mätning: klassiska händelser med `test_kind: 'figurserie'`; admin Frågestatistik filtrerar på test_kind.

### A7. Acceptans, del A

- Generatorn ger 36 / 30 / 30 på under två minuter, två körningar byte-identiska; hela kedjan grön inklusive geometri på rad och alternativ.
- Fixtur per spärr (FS1 till FS6, S11 till S13) som fälls med rätt text, en som klarar; FS4 med en rad där `steg 3` och `vaxande steg` båda passar men förutsäger olika sjätte.
- Min granskning av alla 96 PNG, beslut per id i `docs/qa/figurserier/granskning-01.md`. Inget i skarp bank utan mitt ja.
- Klicktest (Pixel 7 och 1280, ljust och mörkt): gratis gör grund och ser genomgången; Premium gör expert; avancerad 403 för gratis; kortet i tre tillstånd; logikkortet med Aon visar vårt format och anmärkningen; gammal session med `meta.format: 'aon'` oförändrad. Frågesidan under 2,0 s på 360.
- Grep på "samma test", "Aon scales ix, 20", "snart", "kommer" i figurserie-copy ger noll. `tsc`, `test:run`, build gröna.

---

## B. Passform för verbalt och numeriskt, riktade pass per familj (Opus D)

### B1. Banken: parti 01 in, parti 03, två renderarfixar

Krav för passform: 36 per nivå där passet finns (riktlinjerna 2.5).

| Bank | I dag | Efter parti 01 | Krav | Parti 03 |
|---|---|---|---|---|
| Verbalt grund | 36 | 36 | 36 | 0 |
| Verbalt avancerad | 32 | 40 (va-07 nytt påstående 3, va-03 ordval, varierade förklaringar enligt granskning-parti-01 avsnitt 3) | 36 | 0 |
| Verbalt expert | 12 | 12 | 20 | 8 texter, argumentationsanalys, `--niva=expert` |
| Numeriskt grund | 20 | 20 | 36 | 16 underlag i grundformat (tabell 10, diagram 6) |
| Numeriskt avancerad | 20 | 27, plus na-04 när linjediagrammet visar värden | 36 | 8 underlag |
| Numeriskt expert | 12 | 12 | ingen passform i omgång 2 | 0 |

Parti 01 och 03 läggs i `underlagParti03.json` per bank med `UNDERLAG_VERSION = 3`; `underlagsVersion(meta)` läser 1, 2, 3; version 3 = bank + parti 02 + parti 03. Version 1 och 2 rörs inte (snapshot-test på urval per version och sessions-id). Renderarfixar före befordran: `BarChart.tsx` i svensk talform ("18,5 %"), `LineChart.tsx` med värdet vid varje punkt; vitest och skärmdump på 360. Parti 03 skrivs enligt `bestallning-svarare-fragor.md` 4.1 till 4.3 och tillägget 4 (grund 120 till 160 ord, en ståndpunkt, en fjärdedel "går inte att avgöra"; numeriskt grund ett till två steg). Jag granskar parti 03 i `docs/qa/tester-v2/verbalt-numeriskt-03/granskning.md`; parti 01 går in direkt med rättelserna.

### B2. Passets form

**Textpasset**: en text klistrad överst, fyra påståenden ett i taget, tre lika breda knappar. Efter svar: rätt markerat, förklaringen under, "Nästa". Cirka tre minuter. **Sifferpasset**: ett underlag överst (tabellen rullar i egen ram), fyra frågor, alternativ som rader, "Räknare tillåten" i meta. Efter svar: rätt markerat, förklaringen med räknestegen. Cirka fem minuter. Lugn tidsrad, ingen nedräkning, aldrig rött. Resultat: "3 av 4 rätt", ringen bär andelen, tempot mot budgeten per text eller underlag (150 respektive 300 s), genomgång, statusrad "I morgon".

Nivå: ingen skala 1 till 10 för verbalt och numeriskt i omgång 2. Passet drar ur grund tills bästa klassiska grundresultat är minst `SITTER_PROCENT`, därefter avancerad. Expert ingen passform; den som sitter på avancerad får raden "Expertnivån: gör nivåtestet". Nivån visas som "Grund" eller "Avancerad", aldrig som tal.

Exponering: ingen text eller underlag två gånger på 30 dagar per konto, räknat över pass, riktat, klassiskt och övningsprov (övningsprovets lista över det hon haft blir gemensam i `src/lib/tester/sedda.server.ts`). Räcker banken inte: äldst sedd först, `meta.upprepad: true`, räknas inte i frågestatistiken.

**Riktade pass**: verbalt per påståendetyp `typ` (`direkt`, `slutledning`, `kvantor`, `utanfor`; frysta texter saknar fältet och räknas `okand`): en text där minst två av fyra påståenden har typen; färre än tre osedda sådana texter inom nivån döljer familjen. Numeriskt per misstagstyp ur distraktorernas `misstag.typ` (`fel_rad`, `fel_kolumn`, `steg_saknas`, `fel_enhet`, `fel_bas`): ett underlag där minst två frågor har en distraktor av typen. "Var du tappade" visar typerna med en liten stapel var, aldrig procent i text; "Öva den här typen" som textlänk (Premium).

Var passet syns: hemvyns Fler tester (`hemvy.ts flerTester`, `HEM.flerTester`): raden "Siffror och text får det senare" stryks. Har planen `verbal` eller `numerisk` i `testtyper` visas "Textpass" respektive "Sifferpass" som rader under dagens pass med bock när gjort. Dagsringen fylls av första passet oavsett typ; serien räknar dagen om något pass är gjort; matrisnivån och kurvan påverkas inte; "Första veckan" räknar alla pass. Gratis: raden låst med "Ingår i Premium".

### B3. Kod

- `test_type`: `verbal-pass`, `numerisk-pass`, `verbal-riktat`, `numerisk-riktat`; `meta`: `{ typ, niva, underlag_id, familj, underlag_version: 3, upprepad }`. `featureForTestType` ger `test_daily_pass`; 403 för gratis.
- Motor: syster till `ovningsprov/motor.server.ts` i `src/lib/tester/pass.server.ts` (urval, svar, avslut, `p_statistik` med `test_kind` `verbal`/`numerisk` och `typ` enligt kontraktet), eller utbyggnad av samma motor; Opus väljer det som inte dubblerar rättningen. Ingen kalibreringsfråga.
- Rutter: `passHref` får `textpass | sifferpass`; sidor under `/dashboard/tester/pass/` i `PassShell`; vyerna återanvänder text- och tabellrenderingen i `VerbalTestSession` och `NumericalTestSession`, inte deras sessionslogik.
- Hemvyn, Din utveckling (`data.server.ts`: pass per testtyp), kortens segment "gjord" räknar klassiska test som i dag.
- Mätning: `pass_klart` och `riktat_klart` får `test_kind`; admin pass per vecka per test_kind, undantagna konton bort.

### B4. Acceptans, del B

- Banker efter parti 01 och 03: verbalt 36 / 40 / 20, numeriskt 36 / 35 (36 med na-04) / 12; `UNDERLAG_VERSION = 3`; snapshot för version 1 och 2 grönt; validatorerna gröna; diagrammen i svensk talform med värden.
- Textpass och sifferpass varje dag, aldrig samma text eller underlag på 30 dagar (vitest på `sedda`), riktat pass när minst tre finns, annars dold familj. Gratis får låst rad och 403.
- Klicktest: Premium med `verbal` och `numerisk` i planen gör båda passen dag 1 och dag 2 (dagsringen, "2 dagar i rad"), riktat textpass på kvantor; tabellen rullar i egen ram; resultatet visar "3 av 4 rätt" och tempot mot budgetlinjen; matrisnivån oförändrad före och efter.
- Grep "Siffror och text får det senare" noll. `tsc`, `test:run`, build gröna.

---

## C. Rester (Opus D)

**C1. Bank 3.1, de 15 strukna.** Byggs om med `gen-bank-v3.mjs` enligt `beslut-omgang2.json`: M2-pil-tre (byte-12 till 17) och M3-balans-sida (tva-05, 06) med samma rutnät och nya distraktorer (en nära miss per regel, två som bryter alla med olika fel; S11-röstning som fel); over-15 med en annan enskild ruta; over-02, plus-over-18, plus-over-20 utan facit som centrum; grund vand-03, vand-13, antal-05 med nya löpnummer och rutnät utan delade rader. `GODKANDA_FORE_S11` krymps till de fem lant. Nya frågor får `fran_version: 4`. Ny konstant `TRANINGSVERSION = 4` i `selectQuestions.v7.ts`: `TRANINGSBANK`, passen, riktade pass, Nivåkollen och övningsprovet läser `valbarI(q, TRANINGSVERSION)` (de sparar urvalet i meta); `BANK_VERSION = 3` står kvar för klassiska test, så version 3-sessioner och percentilen rörs inte. Vitest: version 3-poolen 110 / 95 / 95 oförändrad, `TRANINGSBANK` har de 15. Jag granskar alternativen på de 12 med återanvänt rutnät och hela frågan på de 3 nya, i `docs/qa/bank-v3/granskning-3-1.md`.

**C2. Provet och övningsprovet läser underlagsversionen.** Båda `selectProv.ts` får `poolFor(niva, version)` (bank + parti 02 + parti 03 vid version 3) och `PROV_MERGED_BANK` över allt för rättning av gamla sessioner. Övningsprovets motor sätter `meta.underlag_version: UNDERLAG_VERSION` och väljer ur versionens pool; sessioner utan fältet läser version 1. De arkiverade provsidorna ändrar inte urval för befintliga sessioner (vitest på fem fasta id). Övningsprovets 3 + 3 + 2 står.

**C3. Tankstreck i frysta titlar.** Bankfilerna rörs inte. `rensaTitel` flyttas till `src/lib/tester/titel.ts` som `visningstitel(title)` (tar bort "PASSAGE", nummer och långt eller kort tankstreck eller kolon) och används överallt där en titel visas: `VerbalTestSession` (rad 480), `VerbalExpertSession` (365), `VerbalReview`, resultatsidans genomgång, övningsprovet, textpasset, miniatyrer. Vitest på funktionen och ett rendertest som felar om ett tankstreck når DOM. `validate-verbal-bank.mjs` behåller upplysningen om de 48.

**C4. Passets rubrik visar temat.** Toppradens titel är passets tema (`familjNamn(vy.tema)`, annars `PASS_COPY.topp.blandat`) under hela passet och i resultatet; riktat pass visar familjen. Den aktuella frågans familj visas aldrig som rubrik eller eyebrow medan frågan är obesvarad (det avslöjar regeln), bara i regelpanelen efter svaret och i genomgången. Opus D kontrollerar `PassFlode`, `PassShell`, `PassFraga`, `Regelpanel`, `GenomgangVy` och tar bort varje ställe där rubriken byts per fråga. Rendertest: rubriken identisk på fråga 1 och 5 i ett pass med blandade familjer.

**C5. Perf "tester prov".** Mål under 2 000 ms LCP på 360 i tre körningar med `scripts/perf-inloggat.ts --filter "tester prov"`, 0 rundturer före LCP. Spåret: `MatrixTestSession` hämtar sessionen med `fetch` vid mount trots att `getRunData` redan läst raden; svaren går in som props, mount-hämtningen bara som fallback, första frågans svg i första HTML via `TestRunner`. Urval och rättning oförändrade (vitest på urvalet per sessions-id före och efter).

---

## D. Uppdelning, granskningsordning, acceptans

**Opus C, figurserier.** Branch `feat/figurserier` från `feat/omgang2`, worktree `.claude/worktrees/figurserier`. Rör `scripts/lib/serie/`, `gen-figurserier.mjs`, serie-lägena i kontrollskripten, `src/lib/figurserierV1/`, `src/components/tests/serie/`, `testConfig.ts`, `testCatalog.ts` och kortet, `tempo.ts` (Aon), `format.ts`, `hjalp-copy.ts`, `fragaRapport.ts`. Generator och spärrar startar direkt; renderaren väntar på `figurserier-spec.md`. Ordning: tolka och spärrar med fixturer, generator och recept, generering och renderingar, renderare och testsidor, kort och Aon, befordran efter min granskning, klicktest.

**Opus D, passform och rester.** Branch `feat/passform-rester` från `feat/omgang2`, worktree `.claude/worktrees/passform-rester`. Ordning: C3 och C4 (små, fristående); renderarfixarna, parti 01 in med `UNDERLAG_VERSION = 3` och C2 i samma commit; C1 till kandidater; parti 03; passform och riktade pass; C5; befordran av parti 03 och 3.1 efter min granskning; klicktest. Agenterna delar inga filer (`fragaRapport.ts` och `testConfig.ts` ändras bara av Opus C). Rebase mot `feat/omgang2` före leverans.

**Min granskningsordning:** 1 Opus C:s receptlista och spärrtexter som text, före körning; 2 `figurserier-spec.md` mot G1 till G12 och grafik-v3-spec 12 innan ägaren ser den; 3 C3 och C4 i skärmdump; 4 bank 3.1-kandidaterna; 5 figurseriekandidaterna, grund, avancerad, expert, med facit för hand på minst tre per mall och alla F6 och F7; 6 parti 03; 7 klicktestens skärmdumpar; 8 `reference_matrix_test_system.md` och `docs/tester/` uppdaterade med serieverktygen, `TRANINGSVERSION` och `UNDERLAG_VERSION 3`.

**Acceptans per del:** A enligt A7, B enligt B4, C enligt testerna i C1 till C5. Deploy av B och C först (fristående); A när min granskning av 96 frågor är klar och ägaren godkänt figurserier-specen i artefakt. Leverans: ett kort meddelande per agent med sökvägar, kedjans utfall och raden om att inga prod-migreringar körts utan ägarens ja. Inga rapportfiler utöver de som nämns här.

Data: avsnitt 0. Bedömning: att figurserier väntar med pass och övningsprov till omgång 3, p_prior per mall, 96 som startvolym, att passets nivå kan läsas ur klassiska resultat tills verbalt och numeriskt får egen nivå, att mount-hämtningen är det som kostar i perf.
