# Deduktiv slutledning, omgång 3: 93 nya uppgifter (bankversion 5)

Datum 2026-11-19. Till testansvarig för granskning före aktivering. Bygger på de tre granskningarna i `deduktiv-2026-11-19-omg2-granskning.md`.

**Efter granskningen** (`deduktiv-2026-11-19-omg3-granskning.md`) är sju uppgifter strukna och sjutton lösningstexter rättade. Antalen och aktiveringen står i avsnittet "Efter granskningen" sist. Tabellerna nedan beskriver de 100 som granskades.

Det viktigaste fyndet i omgång 2 var att många nya pussel hade samma lösningsgång som befintliga, bara med andra namn, flyttade platser eller spegling. Den här omgången bygger därför inte fler schemapussel av samma slag. Alla 100 uppgifter är en ny uppgiftstyp, **D4**, i fem nya familjer med egna lösningsgångar.

## Antal per nivå och familj

| Familj | Vad man gör | Grund | Avancerad | Expert | Totalt |
|---|---|---|---|---|---|
| `om_sa` Om och så | villkorskedjor framåt och bakåt, kontraposition, fallanalys, motsägelse | 7 | 4 | 2 | 13 |
| `kvantor` Alla, några och ingen | syllogismer med alla, några och ingen; hitta slutsatsen som inte följer, eller det som inte kan vara sant | 5 | 3 | 0 | 8 |
| `sanning` Sanning och lögn | sanningssägare och lögnare, tre eller fyra personer | 7 | 10 | 10 | 27 |
| `tabell` Tabellpussel | person gånger två egenskaper (till exempel roll och stad) | 0 | 10 | 12 | 22 |
| `kan_inte` Det som inte kan stämma | rad eller hylla med flera lösningar; ett påstående är omöjligt | 11 | 9 | 10 | 30 |
| **Totalt** | | **30** | **36** | **34** | **100** |

Pooler: grund 105 blir 135, avancerad 88 blir 124, expert 68 blir 102.

Frågeformer:

- Grund: 14 "Vad måste gälla?" eller "Exakt vilka av dem är lögnare?", 3 "Vilken slutsats följer inte av villkoren?", 13 "Vilket kan inte vara sant?".
- Avancerad: 15 måste- och vilka-frågor, 2 följer-inte-frågor, 19 kan-inte-frågor.
- Expert: 17 måste-, vilka- och vem-frågor (8 vem), 17 kan-inte-frågor.

Facit står på alla fem platserna, jämnt fördelat inom varje nivå.

Id: `dd-g-d4-01` till `30`, `dd-a-d4-01` till `36`, `dd-e-d4-01` till `34`. Ordningen inom nivån är om_sa, kvantor, sanning, tabell, kan_inte.

## Uppgiftstypen D4

- Fem alternativ och ingen remsa (`losning.schema: null`). Lösningsgången pekar på villkorens nummer som i D1 till D3.
- Villkorskortet visar rubriken "Villkor", eftersom `premisser` bara sätts för D1. Ingen komponent behövde ändras: frågevyn, genomgången och lösningspanelen klarar redan uppgifter utan remsa.
- p_prior: grund 0,70, avancerad 0,55, expert 0,40. difficulty 1, 2 och 3.
- Familjerna har namn i "Var du tappade" (`familjer.ts`).

### Språket

- **några** definieras i varje kvantor-uppgift: "Ordet några betyder här minst en, kanske alla."
- **eller** står bara i "varken ... eller" och i definitionen "antingen sanningssägare eller lögnare". Disjunktion skrivs i stället som ett om-villkor ("Om det inte regnar på fredag, hyr Gun parasoller").
- **bara** står inte i någon D4-text, lösningstexter och misstag inräknade.
- Sanningssägarna definieras: "Var och en är antingen sanningssägare eller lögnare. En sanningssägare säger alltid något sant, och en lögnare säger alltid något falskt." Antal uttrycks alltid med "exakt" eller "minst".
- "Exakt vilka av dem är lögnare?" har alternativ som "Anna och Bo", "Ingen av dem" och "Alla tre", alltså hela gruppen.
- Inga tankstreck. Validatorn fäller "bara" och fritt "eller" i D4.

## Familjerna och lösningsgångarna

### om_sa (13, skrivna för hand, text och lösning ur mallar)

Varje uppgift har en egen följd av steg. "Framåt" är modus ponens, "bakåt" modus tollens.

| Id | Lösningsgång |
|---|---|
| g-01 | framåt, framåt |
| g-02 | bakåt, bakåt genom "om inte" |
| g-03 | framåt, sedan bakåt |
| g-04 | ett steg framåt från "om inte"; fällan är att neka förledet i villkor 1 |
| g-05 | bakåt, sedan framåt från "om inte" |
| g-06 | bakåt i en gaffel; den andra grenen är öppen |
| g-07 | bakåt genom "om inte" ger en positiv slutsats; fällan är att bekräfta efterledet |
| a-01 | framåt, sedan två steg bakåt |
| a-02 | facit är ett om-påstående: kedjan vänd (kontraposition av slutsatsen) |
| a-03 | facit är ett om-påstående: ett villkor vänds först, sedan kedja |
| a-04 | två kedjor som krockar; facit "X och Y" kan inte vara sant |
| e-01 | fallanalys: båda fallen ger samma sak |
| e-02 | motsägelse: ett antagande ger två saker som inte går ihop |

**Lockvillkor.** I g-04, g-06 och g-07 behövs villkor 1 inte för facit. Det bär fällan (neka förledet, bekräfta efterledet), och en distraktors misstag pekar på det. Spärren E2 och verifieraren godtar ett villkor som är överflödigt för facit bara när ett misstag pekar på det. Det är samma bruk som i D1, där en premiss ibland bara finns för en distraktor. Testansvarig avgör om det håller.

### kvantor (8, skrivna för hand)

D1-banken har 84 premisskedjor, och de täcker nästan alla vanliga syllogismer. Mitt första utkast hade tio uppgifter, och sju av dem hade samma premisser som en befintlig D1 (exakt nyckel) eller samma form med "inga" och "några" lästa åt båda hållen (lös nyckel). Alla sju är bytta. De åtta som står kvar har premissformer som ingen D1 har, och frågan är en annan än D1:s "Vad måste gälla?":

| Id | Premisser | Fråga | Fällan |
|---|---|---|---|
| g-08 | alla, alla i kedja | kan inte vara sant | vända på alla |
| g-09 | alla, några, en person | följer inte | att Ida är en av "några studenter" |
| g-10 | alla, ingen, en person bakåt | följer inte | läsa in mer än det står |
| g-11 | ingen, ingen, en person | följer inte | slutsats ur två nej |
| g-12 | alla, alla med samma början, en person | kan inte vara sant | att ingen har båda |
| a-05 | några, några, alla | följer inte | kedja två några |
| a-06 | några inte, alla, alla | kan inte vara sant | ett alla som bryts av några inte |
| a-07 | några, ingen, alla från samma grupp | följer inte | göra några till ingen |

Statusen för varje alternativ räknas av mängdmodellen, med och utan krav på att mängderna har medlemmar. Den ska vara densamma i båda läsningarna.

### sanning (27, genererade)

Påståendena: "X är lögnare", "X är sanningssägare", "X och Y är båda ...", "Minst en av X och Y ...", "Exakt en av X och Y ...", "Exakt k av oss tre/fyra ...", "Minst k av oss fyra ...". Påståenden om sig själv ("Bo och jag", "av Tom och mig") förekommer från avancerad, högst ett per uppgift, och aldrig "jag är lögnare".

- Grund: tre personer, "Exakt vilka"-frågor och "Vad måste gälla?", ett antagande som faller.
- Avancerad: tre eller fyra personer. Vissa löses direkt ur ett självpåstående ("Det enda som går ihop med det Ida säger är ...").
- Expert: fyra personer och minst ett antagande i varje uppgift, två i fyra av tio.

Lösningstexten är lösarens: varje steg är ett villkor som tvingar fram en eller flera personer, och ett antagande som leder till motsägelse skrivs "Anta att ... Det går inte ihop med det Karin säger. Antagandet håller inte."

### tabell (22, genererade)

Fyra personer på avancerad och fem i expertens vem-frågor, två kategorier (roll, stad, kurs, ledig dag, tjänstebil, arbetsplats, lunchtid). Villkoren: "X är Y", "X är inte Y", "X är varken Y eller Z", "Varken X eller Z är Y", "Den som är Y bor i Z" och "Den som är Y bor inte i Z". Varje uppgift har minst ett villkor som knyter ihop de två kategorierna, så att man arbetar i två dimensioner.

Två villkor om samma person i samma kategori, eller om samma värde, förekommer inte. Pusslet ska gå att lösa utan gissning: varje steg är "X är alltså Y" eller "Ingen annan kan vara Y. X är alltså Y." Steget pekar bara på de villkor som tog bort just de möjligheterna.

### kan_inte (30, genererade)

Raden, hyllan och turordningen från D2, men pusslet har två till tio lösningar och ingen enda ordning. Frågan är vilket påstående som inte kan vara sant. Alla villkor behövs för att facit ska bli omöjligt, och de fyra distraktorerna är möjliga, de flesta i högst hälften av lösningarna. Misstaget visar en ordning där distraktorn stämmer ("Det kan stämma, till exempel med ordningen Isak, Sven, Leo och Olga, från plats 1."). Lösningen antar facit och följer det till en plats eller ett element som inte får plats.

Gången skiljer sig från D3: där fäster antagandet i frågan pusslet, och man prövar alternativen mot en nästan låst ordning. Här finns ingen fast ordning. Man prövar varje påstående mot alla ordningar som går.

## Manuell jämförelse av lösningsgångarna

Jag har gått igenom varje familj för hand, med stegen i lösningstexten och villkorstyperna sida vid sida.

- **om_sa:** de tretton har tretton olika följder av regler (tabellen ovan). Inga två har samma steg i samma ordning. Närmast varandra är a-02 och a-03, som båda har ett om-påstående som facit. I a-02 vänds slutsatsen, i a-03 vänds ett villkor först. g-04, g-06 och g-07 har ett steg var, men med olika regel och olika fälla.
- **kvantor:** åtta olika premissformer (tabellen ovan). Ingen har samma form som någon av de 84 premisskedjorna, inte heller med "inga" och "några" lästa åt båda hållen.
- **sanning:** inga två har samma uppsättning påståenden. Gången är i grunden densamma i hela familjen: anta, se motsägelsen, lås. Det som skiljer är vilket påstående som bär motsägelsen och hur många antaganden som behövs (0 till 2). g-14 och g-17 ligger nära varandra (minst en, minst en, båda lögnare; mot minst en, båda lögnare, lögnare) men faller på olika personer.
- **tabell:** inga två har samma uppsättning villkorstyper. Gångarna är följder av "låst ur villkor" och "ingen annan kan". Den följden sammanfaller ibland mellan två uppgifter, men då på olika villkor.
- **kan_inte:** inga två har samma villkorstyper tillsammans med samma slags omöjliga påstående. Den kontrollen lade jag till efter genomgången. Före den var avancerad 29 och expert 32 samma pussel med ett "inte på plats" flyttat till en annan person, alltså samma slag av likhet som fällde omgång 2. Grund har elva uppgifter som alla avgörs i ett steg efter antagandet. De är lätta, men pusslen skiljer sig.

## Verifieringen

1. **`scripts/deduktiv-verifiera.mjs`** har en egen D4-del. Den delar ingen kod med `scripts/lib/deduktiv/` och tolkar TEXTEN med egna mallar:
   - om_sa ur atomerna, sanning ur citaten, tabell ur kategoriernas fraser och kan_inte med samma tolkning som schemapusslen. kvantor läses som D1 ur `formell`.
   - Den prövar alla modeller: 2^n för om_sa och sanning, n!·n! för tabell och n! för kan_inte. För kvantor prövas mängdmodellen i båda läsningarna.
   - Den kräver exakt ett svar som är facit, och att inget villkor är överflödigt (lockvillkoren ovan undantagna).
   - Vem- och vilka-frågor kräver exakt en lösning, kan_inte minst två.
2. **Nya nycklar för dubbletter** i verifieraren:
   - Exakt nyckel (fäller): samma villkor efter namnbyte. För om_sa räknas också att en atom vänds till sin negation, och för kan_inte spegling som tidigare.
   - Jämförs mot alla, pensionerade inräknade: kvantor mot alla D1-premisskedjor, kan_inte mot alla D2- och D3-pussel (D3 utan antagandet).
   - Lös nyckel (varnar):
     - om_sa: följden av regler,
     - kvantor: premissformerna med "inga" och "några" åt båda hållen, också mot D1,
     - sanning: antalet personer och påståendenas slag,
     - tabell: antalet personer och villkorstyperna,
     - kan_inte: villkorstyperna och det omöjliga påståendets typ.
   - Generatorn använder verifierarens nycklar och tar inte en uppgift som delar exakt eller lös nyckel med någon annan.
   - Prövat på förstörda kopior: en sanningsuppgift med två namn bytta, en kvantor med premisserna i omvänd ordning, en kan_inte med två namn bytta och en om_sa med fel facit. Alla fyra fångades.
3. **Spärrarna E1 till E7** (`scripts/lib/deduktiv/d4.mjs`, körs av `validate-deduktiv.mjs`):
   - E1 exakt ett svar och rätt roll per alternativ,
   - E2 inget överflödigt villkor,
   - E3 facit följer inte ur ett ensamt villkor,
   - E4 inget alternativ medför ett annat utan villkoren (som DD7),
   - E5 facit är inte ensamt om sin form (som DD9),
   - E6 lösningstexten är lösarens,
   - E7 texten är mallens.

Resultat:

- `node scripts/deduktiv-verifiera.mjs`: 401 av 401 bevisade (141 grund, 145 avancerad, 115 expert).
  - 0 nästan-dubbletter med version 4 eller senare.
  - Lös nyckel: 0 varningar för D4. De 19 varningarna med version 4 är desamma som efter omgång 2.
- `node scripts/validate-deduktiv.mjs`: alla kontroller gröna.
- `npx tsc --noEmit -p .`: inga fel.
- `npx vitest run src/lib/deduktivV1 src/lib/ovningsprov src/lib/nivakoll src/lib/tester src/lib/traning src/components/tests --exclude ".claude/**"`: 389 gröna (10 överhoppade som förut).

## Aktivering, exakta rader

Inget är aktiverat. `DEDUKTIV_VERSION` står på 4, och ingen session drar D4. `deduktivVersion()` läser redan `deduktiv_version: 5` ur meta.

- `src/lib/deduktivV1/select.ts:31`: `DEDUKTIV_VERSION = 4` blir `5`.
- `src/lib/deduktivV1/__tests__/version5.test.ts:51`: `toBe(4)` blir `toBe(5)`.
- `src/lib/deduktivV1/__tests__/version4.test.ts:49`: `toBe(4)` blir `toBeGreaterThanOrEqual(4)`.

Kör sedan verifieraren, validatorn och vitest igen. Pass, övningsprov, nivåkoll och provtyper läser `poolFor(niva, DEDUKTIV_VERSION)` och får D4 samtidigt.

Innan aktiveringen bör någon klicka igenom en D4-uppgift i genomgången i webbläsaren, en med lång lösning (till exempel dd-e-d4-06): fem alternativ, ingen remsa och upp till elva steg.

## Att ta ställning till

1. **Lockvillkoren i om_sa** (g-04, g-06, g-07), se ovan.
2. **kan_inte på grund** avgörs i ett steg efter antagandet. Om frågestatistiken visar att de är för lätta kan p_prior höjas eller några strykas.
3. **Expertens sanningsuppgifter** har upp till elva steg i lösningen. Stegen är korta, men listan är lång på mobil.
4. **Ett fel i den gamla D1-kontrollen**, inte ändrat: `ORD` i verifieraren delar texten med `split(/s+/)` i stället för `split(/\s+/)`, alltså vid bokstaven s. Jaccard-jämförelsen mellan premisskedjor jämför därför bitar av ord. De nya premissnycklarna för D1 och kvantor gör inte det felet. Rättas felet kan nya varningar dyka upp bland äldre D1.

## Ändrade och nya filer

Nya:

- `scripts/lib/deduktiv/d4.mjs`: modeller, texter, spärrar E1 till E7, förklaringarna.
- `scripts/lib/deduktiv/d4-innehall.mjs`: om_sa-skeletten och kvantor, skrivna för hand.
- `scripts/gen-deduktiv-omg3.mjs`: bygger D4 och skriver bankerna. Gamla uppgifter med fran_version 5 tas bort först, så skriptet kan köras om.
- `src/lib/deduktivV1/__tests__/version5.test.ts`
- `docs/fragebank/deduktiv-2026-11-19-omg3.md`

Ändrade:

- `src/lib/deduktivV1/bankGrund.json`, `bankAvancerad.json`, `bankExpert.json`: bara tillägg sist. Ingen befintlig uppgift har ändrats.
- `src/lib/deduktivV1/types.ts`: typen D4, de fem familjerna och fran_version 5.
- `src/lib/deduktivV1/select.ts`: `DeduktivVersion` med 5 och `deduktivVersion()` läser 5. `DEDUKTIV_VERSION` står kvar på 4.
- `src/lib/deduktivV1/familjer.ts`: namnen på de nya familjerna.
- `scripts/deduktiv-verifiera.mjs`: D4-verifieringen och de nya nycklarna. Schemanycklarna gäller nu bara D2 och D3.
- `scripts/validate-deduktiv.mjs`: D4, fran_version 5, språkkontrollen och E1 till E7.
- `scripts/lib/deduktiv/sparrar.mjs`: DD7 och DD9 hoppar över D4, som har E4 och E5.
- `scripts/lib/deduktiv/tema.mjs`: FAMILJER med de fem nya.

## Efter granskningen

Allt enligt `deduktiv-2026-11-19-omg3-granskning.md`. Generatorn är inte körd om. Bankerna är rättade direkt med de rättade förklaringarna i `d4.mjs`.

- **Strukna** (fanns bara i version 5, raderna är borttagna): dd-g-d4-17, 27 och 28, dd-a-d4-08, 10 och 17 samt dd-e-d4-11. Id:n lämnar luckor och återanvänds inte.
- **Lösningstexter rättade:**
  - tabell: dd-a-d4-18, 20, 22, 24 och 26 samt dd-e-d4-13, 14, 16, 17, 19, 20, 22 och 23. `forklaraTabell` drar nu en följd i taget och skriver ut varje låsning i den ordning den följer, också låsningarna genom "Den som ..."-villkoren. Den slutar först när facit står som ett eget steg. "Det som återstår ger att ..." finns inte längre (vitest kontrollerar det). De nya förklaringarna har sex till tio steg. Tabellens kan_inte-förklaringar är godkända och oförändrade.
  - kan_inte: dd-g-d4-29 har fått villkor 1 och 2 i slutsteget. I dd-g-d4-30 pekas den röda pärmen ut med villkor 1 och 2, och elementet som antagandet placerar pekas aldrig ut. I dd-a-d4-32 och 36 står "inte" före verbet efter "Anta att".
  - Misstag C i dd-g-d4-07: "Villkoren avgör inte om Karin leder mötet."
- **Diffkontroll:** för de 93 som är kvar är allt utom `losning.steg` byte för byte detsamma som före rättelsen. Undantaget är misstaget i dd-g-d4-07. Bara de sjutton uppräknade har nya steg. Alla uppgifter i version 1 till 4 är oförändrade.
- **Verifieraren:** ORD-splitten är rättad till `/\s+/`. Det ger inga nya varningar bland D1.
- **Spärrarna:**
  - E6 fäller en D4-lösning med fler än tolv steg.
  - Ett lockvillkor i om_sa godtas bara när misstaget namnger felslutningen ("säger inget om vad som gäller om" eller "visar inte att").
  - Validatorn fäller fler än tre om_sa-uppgifter med lockvillkor per nivå. I dag finns tre, alla på grund.
- **Familjenamnen:** kvantor heter "Alla, några och ingen", kan_inte "Det som inte kan stämma".
- **Generatorn** vägrar skriva över fran_version 5 utan `--ersatt`, eftersom en ny körning inte ger den rättade banken.

| Familj | Grund | Avancerad | Expert |
|---|---|---|---|
| om_sa | 7 | 4 | 2 |
| kvantor | 5 | 3 | 0 |
| sanning | 6 | 7 | 9 |
| tabell | 0 | 10 | 12 |
| kan_inte | 9 | 9 | 10 |
| **Nya** | **27** | **33** | **33** |
| Pool i version 5 | 132 | 121 | 101 |

Kontroller:

- `node scripts/deduktiv-verifiera.mjs`: 394 av 394 bevisade, 0 nästan-dubbletter, 0 varningar för D4. De 19 varningarna med version 4 är desamma som tidigare.
- `node scripts/validate-deduktiv.mjs`: grönt.
- `npx tsc --noEmit -p .`: inga fel.
- vitest (deduktivV1, ovningsprov, nivakoll, tester, traning, components/tests): 389 gröna.

Aktivering, exakta rader (oförändrade):

- `src/lib/deduktivV1/select.ts:31`: `DEDUKTIV_VERSION = 4` blir `5`.
- `src/lib/deduktivV1/__tests__/version5.test.ts:51`: `toBe(4)` blir `toBe(5)`.
- `src/lib/deduktivV1/__tests__/version4.test.ts:49`: `toBe(4)` blir `toBeGreaterThanOrEqual(4)`.

## Efter slutkontrollen

- **Orsaken:** `forklaraTabell` tog bara med själva "Den som ..."-villkoret när en person föll bort genom det. Villkoret som utlöste länken räknades inte med. Nu följer skälet med. Ett lås som redan står i ett tidigare steg räknas inte igen, eftersom det steget redan har sina märken.
- **De elva stegen i slutkontrollens tabell** har exakt de märken som tabellen anger.
- **Samma orsak** gav saknade märken i 16 steg till, utanför listan:
  - dd-a-d4-20 s4, 24 s6, 26 s7 och s8,
  - dd-e-d4-13 s6, 14 s6, 16 s4, s6, s7 och s9, 19 s8 och s9, 20 s2, 22 s4 och s8, 23 s7.
  - Där har bara märken lagts till, och bankerna följer lösaren (E6). Testansvarig kan läsa dem vid tillfälle.
- **Diffkontroll:** 27 steg har nya märken. Inget annat har ändrats, varken texter, alternativ eller facit.
- **Kontroller:** verifieraren 394 av 394 bevisade, validate-deduktiv grön, vitest för deduktivV1 35 gröna.
