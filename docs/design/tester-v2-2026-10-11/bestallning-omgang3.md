# Beställning omgång 3: bryter mönstret, figurpass och övningsprov för figurserier, deduktiv slutledning, verbalt parti 04, admin Frågor

Datum 2026-10-12. Beställare: testansvarig. Mottagare: Opus E (figurserier), Opus F (deduktiv, verbalt, admin), art-director, svensk-ux-copywriter, saas-lead. Utgångspunkt: main 3eb511f8 (figurserier live på tre nivåer, textpass och sifferpass, bank 3.1). Underlag: `riktlinjer.md` (2.4, 3, "Omgång 3"), `bestallning-omgang2.md`, `figurserier-spec.md`, `docs/tester/figurserier.md`, `docs/qa/figurserier/granskning-03.md`, `kontrakt-kalibrering.md`, `docs/design/tester-lyft-2026-10-11/beslut-testansvarig.md` avsnitt 6, koden i `src/lib/figurserierV1/`, `scripts/lib/serie/`, `src/lib/tester/`, `src/lib/traning/`, `src/app/admin/`.

Ordregler: svenska facktermer, inga tankstreck, "samma format som" och aldrig "samma test", ingen Sparkles-ikon, inga tal i löptext där en siffra eller en liten visualisering räcker, inga leverantörslogotyper.

## 0. Läget, data mot bedömning

Data (Supabase i dag, undantagna konton borta): inga slutförda pass, Nivåkoller, text- eller sifferpass och inga figurseriesessioner från vanliga konton ännu. Senaste 14 dagarna: 37 klassiska matristest, 7 verbala, 1 numeriskt. `fraga_statistik` har noll rader, `fraga_rapporter` noll rader; `per_typ`, `fraga_kalibrering_vy` och figurserievillkoret i rapporttabellen finns i prod. Figurseriebanken: 36 / 30 / 32, enbart "härnäst".

Bedömning: allt här beställs före data. Det som avgör om Premium känns värt 149 kronor är variationen i det dagliga passet och en ny testtyp att sträcka sig mot efter två veckor, inte en kalibreringsflagga utan något att flagga på månader. Innehåll och pass först, admin tunt men nu, noggrannhet väntar.

## 1. Prioritering

**Byggs nu**

1. Bryter mönstret i regelform (grund, avancerad). Störst variation per krona: samma renderare, vyn redan ritad (`FigurserieRad`, spec 7).
2. Figurpass: en tredje passrad under dagens pass, samma modell som textpass och sifferpass. Inte i Nivåkollen, inte på skalan 1 till 10; skälet från omgång 2 står, en andra testtyp i nivån gör kurvan osann.
3. Övningsprov mot klockan för figurserier. Aons tal är belagda i repo (`beslut-testansvarig.md` 6: 20 uppgifter på 5 minuter, samstämmiga tredjepartskällor, samma beläggsnivå som Matrigmas 35) och får stå med cirka. SHL induktiv saknar tal och får vårt format.
4. Deduktiv slutledning: tre klassiska nivåtest och eget kort. Ren text, generator med lösare, saknas på svenska.
5. Verbalt parti 04 med två påståenden av samma typ per text, så det riktade textpasset blir riktat på riktigt.
6. Admin Frågor: kalibreringsflaggan, okalibrerade, statistik per test_kind, rapporterna med länk till frågan.

**Väntar till omgång 4:** noggrannhet och uppmärksamhet (sällan avgörande, uppvärmningen finns redan), serieform av bryter på expert, riktat figurpass per familj, övningsprov och pass för deduktiv, figurserier i Nivåkollen (kräver beslut om en andra skala och 25 sessioner per nivå), figurserier parti 3 när första p-värdena finns, verbalt expert parti.

---

## A. Opus E: figurserier

### A1. Bryter mönstret, regelform

Sex figurer, ingen lucka; figurerna är alternativen (spec 7). Fem delar en regel, en bryter den, ordningen spelar ingen roll. Vyn finns; nytt är generator, spärrar, bank och plats i pass och övningsprov. De klassiska nivåtesten (`serie_version: 1`) ändras inte, så percentilen håller.

Datamodell: `form: 'bryter'`, `rad` sex celler, `correctAnswer` 0 till 5, `options` tom, `rule`, `misstag` fem texter ("Den här följer regeln: ..."), `p_prior` per mall. De sex blandas seedat på sessionId. Frågerad `SERIE_FRAGA_BRYTER = 'Vilken figur bryter mönstret?'`.

Regelbibliotek i `scripts/lib/serie/bryter-regler.mjs`:

| Mall | Nivå | Regel de fem delar | Brytaren | Primitiver | Antal | p_prior |
|---|---|---|---|---|---|---|
| B1 Antal | grund | samma antal (streck, sektorer, kantprickar) i olika vridning | ett mer eller mindre | strålar, sektorhjul, 3×3-kant, duo kant | 8 | 0,75 |
| B2 Samband | grund | två egenskaper följs åt (cirkel alltid svart, kvadrat alltid tom) | rätt form, fel fyllning | grundform, duo kärna | 8 | 0,72 |
| B3 Relation i duo | avancerad | kärnpilen pekar mot kantpricken eller satelliten i alla fem | pekar 90 eller 180 grader fel | duo kant + pil, duo orbital + pil | 10 | 0,50 |
| B4 Vridet mönster | avancerad | alla är vridningar av ett osymmetriskt mönster | spegelbilden | sektorhjul, strålar, 3×3-block | 6 | 0,48 |

Spärrar i `scripts/lib/serie/sparrar-bryter.mjs`, fel i `bygg()` och i `v7-facit-check.mjs --bryter`:

| Nr | Namn | Definition |
|---|---|---|
| BM1 | entydig | För varje regel i biblioteket och varje delmängd om fem gäller: regeln uppfylls bara av de fem som inte innehåller brytaren. Annars slängs frågan. |
| BM2 | olika | Alla sex figurer har olika kanonisk nyckel (S8). |
| BM3 | fria dimensioner varierar | Varje dimension som inte ingår i regeln har minst tre olika värden bland de fem. Regeln får inte kunna läsas som "den som ser annorlunda ut". |
| BM4 | brytaren är ingen outlier | Brytaren är aldrig ensam om ett värde på en fri dimension; minst en av de fem delar varje fritt värde med den. |
| BM5 | synlig skillnad | Brytarens avvikelse är minst ett antalssteg, 45 grader eller tom mot svart (R5). |

G1 till G12, S1 till S5 och V11/V12 via `v7-geometri-check.mjs --bryter` (sex celler, gräns 70 noder och 8 kB per fråga enligt spec 10). Grund 16, avancerad 16, allt genererat i `kandidater/bryter-{grund,avancerad}.json`, PNG per fråga till `docs/qa/figurserier/bryter/`, mitt beslut per id i `docs/qa/figurserier/granskning-04.md`. Familj: `B1` antal, `B2` fyllning, `B3` flera, `B4` vridning, så "Var du tappade" talar samma språk som härnäst.

### A2. Parti 2 härnäst

Figurpasset drar fyra uppgifter om dagen med 30 dagars karens; avancerad behöver mest. `gen-figurserier.mjs --parti=2` ger 8 grund (F1, F2) och 16 avancerad (F4, F5), `fran_version: 2`, samma kedja och kvoter, samma granskning-04. Efter befordran: grund 44 och avancerad 46 härnäst plus 16 bryter var. Det räcker cirka två veckor på avancerad utan upprepning; därefter äldst sedd först med `meta.upprepad: true` (B2-mekanismen).

### A3. Figurpass

Raden "Figurpass" under dagens pass, bredvid Textpass och Sifferpass (`hemvy.ts`, `vnpass`-mönstret), symbol `figurer`, bock när gjort, låst med "Ingår i Premium" för gratis. Visas när planen har `figurserie` i `testtyper` eller när hon har gjort ett klassiskt figurserietest.

- `test_type: 'figurserie-pass'`, `meta: { niva, fragor, serie_version: 1, upprepad }`, `featureForTestType` ger `test_daily_pass`, 403 för gratis.
- Fyra uppgifter: tre härnäst, en bryter. Efter svar: regelpanelen med regel och misstag, Nästa. Lugn tidsrad, ingen nedräkning. Cirka tre minuter.
- Nivå: grund tills bästa klassiska `figurserier-grund` är minst `SITTER_PROCENT`, därefter avancerad; den som sitter på avancerad får raden "Expertnivån: gör nivåtestet". Visas som ord, aldrig tal.
- Exponering: `sedda.server.ts` får slaget `figurserie` över klassiska test, figurpass och övningsprov.
- Resultat: "3 av 4 rätt", ringen bär andelen, tempot mot budgeten 45 s per uppgift, genomgång, statusrad "I morgon". Dagsringen fylls av första passet oavsett typ, serien räknar dagen, matrisnivån och kurvan påverkas inte, "Första veckan" räknar alla pass.
- Motor: utbyggnad av `src/lib/tester/pass.server.ts` med `kind: 'figurserie'`, rättning via `figurserierV1/fragor.server.ts`. `p_statistik` med `test_kind: 'figurserie'`, `typ: 'pass'`. Ingen kalibreringsfråga.
- Mätning: `pass_klart` med `test_kind: 'figurserie'`.

### A4. Övningsprov mot klockan för figurserier

`Provtyp` får `figurer`. Format ur planens leverantör:

| Leverantör | Format | cirka | Anmärkning |
|---|---|---|---|
| Aon | Samma format som Aon scales ix: 20 uppgifter på 5 minuter, total tid | ja (tredjepart, källa `beslut-testansvarig.md` 6) | "Övningsprovet blandar härnäst och bryter mönstret lika." |
| SHL, Matrigma, Alva, Vet inte, Annat | Vårt format: 20 uppgifter på 15 minuter | nej | SHL: "SHL Verify G+ blandar siffror, slutledning och figurer. Övningsprovet övar figurdelen." |

Sammansättning: 10 härnäst (6 grund, 10 avancerad, 4 expert räknat över hela provet) och 10 bryter, seedat, karens via `sedda`. `PROVFORMAT.aon` i `tempo.ts` byter till `verifierad: true, cirka: true, kalla: 'beslut-testansvarig.md 6'` och väljs för figurer; logikens Aon står kvar (`EGET_AON`). `test_type: 'figurserie-prov'`, `meta.format`. Resultat: ring med antal rätt, tid och obesvarade, genomgång med "Var du tappade" per familj och tempot mot budgetlinjen. Ingen kurva, inget nivåmärke. Provraden på kortet Figurserier blir levande (låst för gratis med formatet synligt); den dämpade raden från omgång 2 stryks.

### A5. Acceptans, del A

- Generatorn ger 16 + 16 bryter och 8 + 16 härnäst på under två minuter, två körningar byte-identiska; hela kedjan grön inklusive geometri på alla sex celler.
- Fixtur per spärr BM1 till BM5 som fälls med rätt text och en som klarar; BM1 med en sexa där två figurer kan vara brytare.
- Min granskning av alla 56 PNG med facit för hand på alla bryter och minst tre per härnäst-mall. Inget i skarp bank utan mitt ja. Golv: 12 godkända bryter per nivå, annars väntar figurpassets bryter-uppgift och provet kör 20 härnäst.
- Klicktest (Pixel 7 och 1280, ljust och mörkt): Premium med Aon i planen gör figurpass dag 1 och dag 2 (dagsringen, "2 dagar i rad"), bryter-uppgiften visar koppar på brytaren och tonar inget ned, övningsprovet startar i Aons format och lämnas in av klockan (obesvarade räknas); Premium med SHL får vårt format med anmärkningen; gratis får låst rad och 403; klassiskt figurserietest oförändrat före och efter (vitest på urvalet per sessions-id); matrisnivån oförändrad. Frågesidan under 2,0 s på 360.
- Grep på "samma test", "snart", "kommer" i figurseriecopy ger noll. `tsc`, `test:run`, build gröna.

---

## B. Opus F: deduktiv, verbalt parti 04, admin

### B0. Först: varför `fraga_statistik` är tom

Med ett QA-konto i prod: gör ett pass och kontrollera att `slutfor_traningssession` skriver en rad i `fraga_statistik` och att vyn visar den. Saknas raden rättas buggen före B3; annars har bara ingen gjort ett pass än, och det skrivs i leveransen. Inga prodmigreringar utan ägarens ja.

### B1. Deduktiv slutledning

Formatet finns i SHL Verify G+ (deduktiv del) och Aons deduktiva moduler; vi säger inga tal om dem. Nu tre klassiska nivåtest och kortet; övningsprov och pass i omgång 4.

Tre uppgiftstyper:

| Typ | Nivå | Vad | Alternativ | Antal | p_prior |
|---|---|---|---|---|---|
| D1 Premisskedja | grund | två till tre premisser ("Alla som arbetar natt får tillägg. Ingen i receptionen arbetar natt."), fråga "Vad måste gälla?" | fyra: en nödvändig, två rimliga men inte nödvändiga, en omöjlig | 24 | 0,75 |
| D2 Schemapussel | grund 6, avancerad 30 | fyra till fem personer eller saker på platser, tre till fem villkor, fråga "Vem står på plats 3?" eller "Vilket måste vara sant?" | fem | 36 | 0,55 |
| D3 Villkor i rörelse | expert | fem till sex element, fem till sex villkor, fråga av typen "Om Bea står på plats 2, vilket är då omöjligt?" | fem | 24 | 0,40 |

Generator och lösare i `scripts/lib/deduktiv/`: villkorsspråk i JSON (`plats`, `inte_plats`, `granne`, `inte_granne`, `vanster_om`, `direkt_vanster_om`, `samma_grupp`, `ordning`), uttömmande lösare över alla tilldelningar, textmallar per villkor ("Bea står direkt till vänster om Carl.") så svenskan är enhetlig. D1 skrivs för hand av Opus F (24 st) och valideras mot en finit mängdmodell (alla, inga, några; påståendet är nödvändigt, omöjligt eller obestämt i alla modeller).

Spärrar, fel i generatorn och i `validate-deduktiv.mjs`:

| Nr | Definition |
|---|---|
| DD1 | Exakt en lösning (D2, D3). D1: facit nödvändigt i alla modeller, varje distraktor obestämt eller omöjligt. |
| DD2 | Inget villkor är överflödigt: tas ett bort finns fler lösningar. |
| DD3 | Minst tre av fyra distraktorer är nära missar: tilldelningen uppfyller alla villkor utom exakt ett. Varje villkor bryts av någon distraktor. |
| DD4 | Namnen ur en fast lista med korta, vanliga svenska förnamn, aldrig samma begynnelsebokstav två gånger i en uppgift; saker ur neutrala listor (färger, veckodagar, avdelningar). |
| DD5 | Förklaringen är lösarens gång: villkoren i den ordning de låser en plats, ett steg per rad, och schemat som rad till sist. |

Bank i `src/lib/deduktivV1/` (`types.ts`, `bankGrund|Avancerad|Expert.json`, `select.ts` 12 av poolen seedat på sessionId, `fragor.server.ts`), sessioner i `logic_test_v4_sessions` med `test_type: deduktiv-grund|avancerad|expert`, `meta.deduktiv_version: 1`, rättning serverside, `fraga_statistik.test_kind` och `RAPPORT_TEST_KIND` får `deduktiv` (additiv migrering, skrivs, körs i prod bara efter ägarens ja; rutten faller tillbaka som för figurserie). Kandidater till `kandidater/`, PNG eller HTML per uppgift till `docs/qa/deduktiv/`, mitt beslut i `docs/qa/deduktiv/granskning-01.md`. Golv 20 per nivå.

Test: 12 uppgifter, 15 minuter, alla nivåer. Gate som övriga testtyper: grund gratis, avancerad och expert Premium. Resultat: genomgång per uppgift med lösningsgången (DD5), "Var du tappade" per villkorstyp. Kort i Alla tester: grupp `deduktiv` efter figurer, `ENHET.deduktiv = 'uppgifter'`, `NIVA_GOR.deduktiv` = tre villkor, fem villkor, villkor i rörelse. Provraden dämpad: "Övningsprov mot klockan" / "Inte än för deduktiv. Logikens övningsprov övar tempot." Percentil från 25 sessioner per test_type som i dag.

### B2. Verbalt parti 04

16 texter: 8 grund, 8 avancerad. Varje text har två påståenden av en måltyp (`direkt`, `slutledning`, `kvantor`, `utanfor`) och ett vardera av två andra; per nivå två texter per måltyp. Skrivs enligt `bestallning-svarare-fragor.md` 4.1 till 4.3, läggs i `underlagParti04.json` med `UNDERLAG_VERSION = 4`; version 1 till 3 rörs inte (snapshot). `VN_MINST_AV_TYP.verbal` står kvar på 1 så ingen familj döljs, men `valjUnderlag` för riktat föredrar texter med två av typen, och de typade påståendena står först i passet. Granskas i `docs/qa/omgang3/verbalt-parti-04/granskning.md`.

### B3. Admin Frågor

Ny sida `/admin/fragor` i gruppen Innehåll i `AdminShell`, befintliga komponenter, tomma tillstånd aldrig streck. Service role läser `fraga_kalibrering_vy`, `fraga_statistik`, `fraga_rapporter` (undantagna bort via `uteslut`) och registret `src/lib/fragor/register.server.ts` över alla banker: test_kind, id, nivå, familj, p_prior, bankfil. Tröskelvärdena flyttar till `src/lib/kalibrering/flaggor.ts` (30 svar, 20 konton, 0,25, nivåbanden); `kalibrering-rapport.mjs` behåller sin kopia med ett vitest som fäller om de skiljer sig.

Tre flikar:

1. **Kalibrering.** Filter på test_kind, nivå och status: okalibrerad (under 30 svar), kalibrerad, priorn fel (|p − p_prior| över 0,25), fel nivå (utanför bandet). Flaggade först, sedan okalibrerade med flest svar. Kolumner: id (länk), nivå, familj, svar, p_prior och uppmätt p som en liten stapel med avvikelsen i title, median tid. Serverpaginerat, 25 per sida.
2. **Per testtyp.** En rad per test_kind: frågor i bank, kalibrerade, svar senaste 7 och 30 dagarna, median p per nivå. Tomt: "Inga svar än."
3. **Rapporter.** `fraga_rapporter` nyast först: fråga (länk), test_kind, orsak, kommentar, datum, antal rapporter på samma fråga.

Frågesidan `/admin/fragor/[kind]/[id]`: frågan renderad med facit markerat, regel och misstag, raden ur vyn, rapporterna på frågan. Återanvänder genomgångskomponenterna (`FigurserieReview`, matrisens, verbalens, numerikens och deduktivens), serverrenderat, ingen ny API-rutt.

### B4. Acceptans, del B

- B0 rapporterad med utfall.
- Deduktiv: generatorn ger 36 D2 och 24 D3 på under två minuter, deterministiskt; DD1 till DD5 med fixturer (en D2 med två lösningar fälls, en med överflödigt villkor fälls); 24 D1 validerade mot mängdmodellen; min granskning med lösning för hand på alla D1, tio D2 och alla D3.
- Parti 04: 16 texter, `UNDERLAG_VERSION = 4`, snapshot för 1 till 3 grönt, validatorn grön, riktat textpass på kvantor ger en text med två kvantorpåståenden först.
- Admin: med tom `fraga_statistik` visar Kalibrering alla frågor som okalibrerade utan fel; vitest på flaggorna med fixturdata (prior 0,40, uppmätt 0,70 flaggas; 0,60 inte); rapportfliken visar en QA-rapport med fungerande länk; undantagna konton syns inte.
- Klicktest: gratis gör deduktiv grund och ser lösningsgången; Premium gör expert; avancerad 403 för gratis; kortet i tre tillstånd; admin i skärmdump på 1280.
- Grep "samma test", "snart", "kommer" i deduktivcopy noll. `tsc`, `test:run`, build gröna.

---

## C. Art-director

En artefakt för ägarens godkännande, Pixel 7 och 1280, ljust och mörkt, riktiga uppgifter ur generatorerna, `deduktiv-spec.md` i samma katalog som text:

1. **Deduktiv frågevy.** Villkoren klistrade överst (som textpasset), frågan, alternativen som rader. Efter svar: rätt markerat, lösningsgången som numrerade steg och schemat som en remsa med platser och namn (lösarens utdata, ingenting ritat för hand). Inget hjälprutnät under frågan i omgång 3.
2. **Deduktivkortet** med illustration i grafik v3:s språk utan leverantörsreferens, och resultatsidan med "Var du tappade" per villkorstyp.
3. **Bryter mönstret i pass och övningsprov.** Spec 7 gäller; art-director kontrollerar den mot riktiga B1 till B4-frågor, bestämmer frågeradens ord och ritar miniatyren i genomgångslistan (sex rutor, brytaren i koppar).
4. **Figurpassraden** och provraden på Figurserier i levande tillstånd.

Admin behöver ingen artefakt. Generatorer, lösare och spärrar startar före godkännandet; vyer väntar.

## D. Copywriter

`copy-omgang3.md` i samma katalog: deduktivkortets titel, metod, brödtext och i-ruta; `NIVA_GOR.deduktiv`; villkors- och förklaringsmallarna i generatorn (korta, otvetydiga, aldrig "lätt"); figurpassets rad, resultat och statusrad; provradens format och anmärkning för figurer; bryter-frågeraden och misstagsmallen; hjälpens mening om bryter mönstret. Putsar regel- och misstagstexter i B1 till B4 efter min granskning.

## E. Uppdelning, granskningsordning, leverans

**Opus E.** Branch `feat/figurserier-3` från `feat/omgang3`, worktree `.claude/worktrees/figurserier-3`. Rör `scripts/lib/serie/`, `gen-figurserier.mjs`, kontrollskriptens serie- och bryter-lägen, `src/lib/figurserierV1/`, `src/components/tests/serie/`, `src/lib/tester/pass*.ts` och `sedda.server.ts`, `hemvy.ts` (figurpassraden), `src/lib/ovningsprov/` och `tempo.ts`, `testCatalog.ts` (provraden på Figurserier). Ordning: regelbibliotek och spärrar med fixturer, generering och PNG, parti 2, figurpass, övningsprov, befordran efter mitt ja, klicktest.

**Opus F.** Branch `feat/deduktiv-admin` från `feat/omgang3`, worktree `.claude/worktrees/deduktiv-admin`. Rör `scripts/lib/deduktiv/`, `src/lib/deduktivV1/`, `src/components/tests/deduktiv/`, `testConfig.ts`, `underlagParti04.json`, `underlagVersion.ts`, `pass-urval.ts`, `src/app/admin/fragor/`, `src/lib/fragor/`, `src/lib/kalibrering/`, `fragaRapport.ts`, migreringen för `deduktiv`. Ordning: B0, lösare och spärrar med fixturer, D1 skrivna, generering, admin, parti 04, kortet sist efter rebase mot E (deduktivgruppen i `testCatalog.ts` är det enda delade stället), klicktest.

**Min granskningsordning:** 1 E:s regelbibliotek och spärrtexter samt F:s villkorsspråk och lösarkrav, som text före körning; 2 B0:s utfall; 3 art-directors artefakt mot spec 7 och mot hur deduktiva test faktiskt ser ut, innan ägaren ser den; 4 bryter- och parti 2-kandidaterna; 5 deduktivkandidaterna; 6 parti 04; 7 admin i skärmdump med fixturdata; 8 klicktestens skärmdumpar; 9 `reference_matrix_test_system.md`, `docs/tester/figurserier.md` och nya `docs/tester/deduktiv.md` uppdaterade.

**Acceptans:** A enligt A5, B enligt B4. Deploy av B2 och B3 först (fristående), A3 och A4 när bryter är befordrad och artefakten godkänd, B1 när deduktivbanken nått golvet och artefakten är godkänd. Leverans: ett kort meddelande per agent med sökvägar, kedjans utfall och raden om att inga prodmigreringar körts utan ägarens ja. Inga rapportfiler utöver de som nämns här.

Data: avsnitt 0. Bedömning: att variation i passet väger tyngre än en kalibreringsflagga utan data, att Aons tal nu får stå med cirka på samma beläggsnivå som Matrigmas, att figurserier hålls utanför Nivåkollen tills en andra skala är beslutad, att deduktiv byggs med lösare i stället för skrivna pussel, att noggrannhet kan vänta.
