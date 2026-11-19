# Granskning: deduktiv slutledning, omgång 3, D4 och bankversion 5 (2026-11-19)

Testansvarig. Alla 100 uppgifter är lösta för hand. Dessutom har jag skrivit en egen lösare som tolkar TEXTEN för sanning, tabell och kan_inte (79 uppgifter) utan generatorns eller verifierarens kod. om_sa och kvantor (21) är lösta för hand, alternativ för alternativ. Bankerna och skripten är inte ändrade.

- `node scripts/deduktiv-verifiera.mjs`: 401 av 401 bevisade (141 grund, 145 avancerad, 115 expert). 0 nästan-dubbletter med version 4 eller senare. Lös nyckel: 64 varningar, 19 med version 4 och 0 med D4.
- `node scripts/validate-deduktiv.mjs`: alla kontroller gröna.
- Egen lösare: facit är det enda giltiga svaret i alla 79. Inget villkor är överflödigt i kan_inte, och varje distraktor stämmer i minst en ordning.
- Inga tankstreck, långa eller korta, i villkor, frågor, alternativ, misstag eller lösningstexter.
- Ingen tolkningslucka i vardagssvenska. "Några" definieras i alla kvantor-uppgifter, och "eller" står bara i "varken ... eller" och i definitionen av sanningssägare.

**Beslut: inte godkänt för aktivering än.** Facit stämmer i alla 100. Sju uppgifter stryks: fem är nästan-dubbletter i sanning och två är kan_inte på grund som inte avgörs i ett steg. Dessutom måste lösningstexterna rättas på två ställen i generatorn. I tabell hoppar 13 förklaringar över halva lösningen med "Det som återstår ger att ...". I kan_inte pekar en förklaring ut fel pärm, och två har fel ordföljd. Inga nya uppgifter behövs.

## Strykningar

Måttstocken är densamma som i omgång 2. Samma steg i samma ordning av samma skäl är en nästan-dubblett, också när ett påstående har bytt form utan att byta roll. Samma byggstenar i andra roller får stå kvar.

| Id | Skäl |
|---|---|
| dd-g-d4-17 | Samma pussel som dd-g-d4-14. X säger "Y och Z är båda lögnare" och Y säger "Minst en av X och Z är lögnare". Paret avgör ensamt att X ljuger och Y talar sanning, och det tredje påståendet avgör bara Z. Underlaget nämner själv paret. |
| dd-a-d4-08 | dd-g-d4-19 med ett ord bytt: "Minst en av" har blivit "Exakt en av". Samma steg och samma lösning (den första personen är ensam lögnare). Den är dessutom på grundnivå. |
| dd-a-d4-10 | dd-g-d4-15 där "Nora är sanningssägare" har blivit "Per och jag är båda sanningssägare". Det betyder samma sak i pusslet. "Ingen av oss tre" faller på anklagelsen, den som går i god för honom faller med honom och anklagaren talar sanning. |
| dd-a-d4-17 | dd-g-d4-15 där anklagelsen "Sara är lögnare" har blivit "Hugo och Pia är båda lögnare". Påståendet har samma roll och ger samma utfall. Uppgiften ligger på grundnivå. |
| dd-e-d4-11 | dd-a-d4-13 med två räknepåståenden bytta. Stegen är desamma i samma ordning: anta att Cilla talar sanning, villkor 4 fäller Nora/Lisa, villkor 2 fäller Dan/Jonas, Cillas påstående gör Karin till sanningssägare, och det krockar med det Karin säger. Frågan och facit är också desamma ("Cilla är sanningssägare" kan inte vara sant). En expertuppgift som är en avancerad uppgift i ny form. |
| dd-g-d4-27 | Pusslet går inte att avgöra i ett steg. Det kräver att man går igenom vita pärmens lägen. Förklaringen är en enda mening ("Då finns ingen plats kvar för den svarta pärmen", bara villkor 2), och första steget har fel ordföljd ("Anta att den röda pärmen ligger inte bredvid ..."). |
| dd-g-d4-28 | Samma sak. Man måste gå igenom tre lägen för röd och grön, förklaringen är en mening och ordföljden är fel i första steget. |

Efter strykningarna: grund 27 nya (pool 132), avancerad 33 (pool 121), expert 33 (pool 101). sanning har 6, 7 och 9 uppgifter per nivå, och kan_inte på grund har 9. Antalen i `version5.test.ts` och i underlaget ändras.

## Rättelser före aktivering (bara lösningstext, samma id)

Villkor, alternativ, facit, etiketter och misstag ändras inte, utom misstaget i punkt 4. Om generatorn körs om måste det kontrolleras med en diff: allt utom `losning.steg` ska vara byte för byte detsamma. Annars rättas texten direkt i bankerna.

1. **tabell, 13 förklaringar:** dd-a-d4-18, 20, 22, 24, 26 och dd-e-d4-13, 14, 16, 17, 19, 20, 22, 23. `forklaraTabell` slutar skriva så snart kandidaterna avgör facit och sammanfattar resten som "Det som återstår ger att ...". Kvar finns ett till fem dolda steg, ofta just de som kopplar ihop kategorierna, och det är själva pusslet.
   - dd-a-d4-18 är värst. Att Hanna kör den röda bilen (villkor 4, 8 och 9), att Rut kör den svarta (6) och att Rut därför inte arbetar på lagret (1) syns inte alls.
   - dd-a-d4-26 döljer tre steg (Alva svart, Frida röd, Frida inte testare).
   - Låsningarna som `tyst()` gör tyst genom "Den som ..."-villkoren ska också skrivas ut som steg.
   - dd-e-d4-23 har stegen i fel ordning: "Isak går alltså kursen i svenska" (villkor 2) kommer före "Isak bor alltså i Gävle" (villkor 6), som den bygger på.

   Kravet: varje låsning fram till facit står som ett eget steg, i den ordning den följer.
2. **kan_inte:**
   - dd-g-d4-30: "Anta att den gröna pärmen ligger på plats 3. Då finns ingen plats kvar för den gröna pärmen." Den gröna står ju där. `tom()` tar det första tomma elementet i indexordning och kan då välja det antagna. Skriv "Då finns ingen plats kvar för den röda pärmen" med villkor 1 och 2. I generatorn ska elementet som töms först väljas, och aldrig ett element som antagandet har placerat.
   - dd-g-d4-29: slutsteget saknar villkor. Markera 1 och 2.
   - Ordföljden i bisats, dd-a-d4-32 och dd-a-d4-36: "Anta att Anna inte står bredvid Rasmus." och "Anta att Rasmus inte står bredvid Vera." Rätta mallen i `forklaraKanInte` så att "inte" hamnar före verbet efter "Anta att".
3. Kör verifieraren och validatorn igen. Testansvarig läser de 13 tabelltexterna och de fyra kan_inte-texterna en gång till. Det är ingen ny granskning av pusslen.
4. dd-g-d4-07, misstaget för C: "Villkoren avgör inte om Karin inte leder mötet." blir "Villkoren avgör inte om Karin leder mötet."

## De fyra frågorna

**1. Lockpremisserna i om_sa g-04, g-06 och g-07: godtas.** Varje lockpremiss bär en namngiven felslutning (neka förledet i g-04 och g-06, bekräfta efterledet i g-07), och misstagstexten för distraktorn förklarar den på rätt sätt. Det är det uppgiften testar. Villkor: undantaget i E2 gäller bara när ett misstag pekar på villkoret och villkoret bär en sådan felslutning, och det ska inte bli fler än tre per nivå. g-06 och g-07 är båda ett steg bakåt, men g-06 är en gaffel och g-07 en kedja genom "om inte" med dubbel negation. De får stå kvar.

**2. Grundnivåns kan_inte i ett steg: godtas för de nio som står kvar.** g-20 till g-26, g-29 och g-30 avgörs verkligen direkt efter antagandet. Det passar grund och p_prior 0,70. g-27 och g-28 kräver att man går igenom fall och stryks därför. Frågestatistiken avgör senare om p_prior ska höjas. Anmärkning: g-21 och g-29 bygger på samma byggstenar (en fast pärm på plats 2 och "inte på plats" stänger det enda lediga paret), men villkoret och påståendet har bytt roll. De får stå kvar.

**3. Förklaringar på upp till elva steg: godtas.** dd-e-d4-06 (11 steg), dd-e-d4-23 och dd-a-d4-18 är renderade i genomgången, se punkt 4 nedan. Stegen är korta och läses var för sig. Panelen blir ungefär en och en halv skärm lång på Pixel 7, och det är rimligt för en genomgång på expertnivå. Efter rättelse 1 får expertens tabellpussel sju till tio steg. Taket bör vara tolv.

**4. ORD-splitten: rätta nu.** `split(/s+/)` på rad 314 i `deduktiv-verifiera.mjs` delar vid bokstaven s, så Jaccard-jämförelsen mellan D1-premisser jämför bitar av ord. Jag har kört båda varianterna på alla D1. Med `/s+/` och med `/\s+/` blir det 0 par över 0,5, så rättelsen ger inga nya varningar och kostar ingenting. Lämnas felet kvar mäter kontrollen fel nästa gång någon lägger till D1.

## Familjenamnen

Alla fem är på svenska och utan engelska ord. "Sanning och lögn", "Om och så" och "Tabellpussel" går att förstå direkt. Två bör bytas, men det hindrar inte aktiveringen:

- `kvantor: 'Slutsatser som lockar'` säger inte vad uppgiften handlar om. I "Var du tappade" vet användaren inte vad som lockar. Förslag: **"Alla, några och ingen"**.
- `kan_inte: 'Vad kan inte vara sant'` är en fråga utan frågetecken bland namn som annars är substantiv. Förslag: **"Det som inte kan stämma"**.

Alla namn ryms på en rad i genomgångens lista (`truncate`) i Pixel 7-bredd.

## Webbläsaren

Jag renderade `DeduktivGenomgang` med appens CSS från den lokala dev-servern (localhost:3000) i Chrome via puppeteer. Uppgifterna var dd-e-d4-06, dd-e-d4-23 och dd-a-d4-18, med ett fel svar valt, i Pixel 7 (412 px, ljust och mörkt) och desktop (1280 px). Skärmdumparna ligger i sessionens scratchpad (`bilder/`), utanför git.

- Fem alternativ och ingen remsa visas rätt. Rubriken är "Villkor". Ingen sida får vågrät scroll.
- dd-e-d4-06: elva steg, villkorsmärken på stegen och tomma rader för antagandena. Det går att läsa och följa.
- Fynd för designansvarig, inget hinder: när ett steg har tre eller fyra villkor staplas märkena lodrätt (`flex-col` i `DeduktivLosning`), och det ger tomma rader under texten. I dd-e-d4-23 tar "[1, 2, 3, 7]" fyra rader för en rad text. Märkena bör radbrytas i sidled.

## Godkända

- **om_sa:** dd-g-d4-01 till 06, dd-a-d4-01 till 04 och dd-e-d4-01 och 02 godkänns som de står. dd-g-d4-07 godkänns med rättelse 4. Alla tretton följer olika regler, och kontrapositionen i a-02 och a-03 passar avancerad.
- **kvantor:** dd-g-d4-08 till 12 och dd-a-d4-05 till 07. Alternativen har samma status med och utan krav på att mängderna har medlemmar, och misstagstexterna är korrekta.
- **sanning:** dd-g-d4-13, 14, 15, 16, 18, 19, dd-a-d4-09, 11, 12, 13, 14, 15, 16 och dd-e-d4-03 till 10 och 12.
- **tabell:** alla 22 pussel. De 13 måste- och vem-frågorna godkänns först när rättelse 1 är gjord.
- **kan_inte:** dd-g-d4-20 till 26, 29 och 30 (29 och 30 efter rättelse 2), dd-a-d4-28 till 31, 33 till 35, 32 och 36 (efter rättelse 2), samt dd-e-d4-25 till 34.

## Anmärkningar, inget hinder

- **Par som får stå kvar** (samma byggstenar i olika roller):
  - dd-g-d4-15 och 16: "Ingen av oss" faller på samma sätt, men anklagaren ljuger i 16 och talar sanning i 15.
  - dd-a-d4-09 och 14: samma knep med "exakt en av X och mig", men olika kedjor efter det.
  - dd-a-d4-28 och 33: block om tre med en utomstående till vänster, men "inte bredvid" sitter på olika roller.
  - dd-a-d4-29 och 30: blocket tvingas till plats 1 till 3, men det faller av olika skäl.
- **Knepet med "exakt en av X och mig"** bär dd-a-d4-09, 11, 14 och 15 samt dd-e-d4-09 och 10. Det blir för många om nästa omgång lägger till fler.
- **Lösningstexter som kan bli bättre i nästa generatorvarv:**
  - "Det enda som går ihop med det X säger" (till exempel g-13 och a-09) stämmer, men den som inte ser knepet får ingen hjälp. Skriv ut de två fallen.
  - dd-e-d4-06, steg 5: "Då stämmer det Olga säger" låter som att det följer av det man redan vet, men det följer av Olgas eget påstående. Om hon ljuger finns minst två lögnare, och då stämmer det hon säger.
  - dd-e-d4-02 förklaras som fallanalys, precis som e-01, fast underlaget kallar gången motsägelse. Skriv den som motsägelse: "Anta att Vera blir chef. Då flyttar hon till Malmö och behåller sin plats. Det går inte ihop."
  - I kan_inte saknar flera slutsteg villkor som behövs (g-22, g-24, g-25 och g-26).
  - I dd-e-d4-32 upprepar steg 2 villkor 5.
- **Mallar för misstag:**
  - "Lösningen är att lögnarna är X. Där är det falskt." Skriv "I den lösningen är det falskt."
  - Exemplen i tabellens kan_inte saknar "och" före sista ledet.
  - "Då finns inget kvar för Tom" blir tydligare som "Då finns ingen lunchtid kvar för Tom".

Aktivering: nej, rätta lösningstexterna i dd-a-d4-18, 20, 22, 24, 26, dd-e-d4-13, 14, 16, 17, 19, 20, 22, 23, dd-g-d4-29, dd-g-d4-30, dd-a-d4-32, dd-a-d4-36 och misstaget C i dd-g-d4-07, och stryk dd-g-d4-17, dd-g-d4-27, dd-g-d4-28, dd-a-d4-08, dd-a-d4-10, dd-a-d4-17 och dd-e-d4-11

## Slutkontroll

Testansvarig, samma dag. Jag har bara läst de rättade texterna, steg för steg och mot villkoren. Bankerna och skripten är inte ändrade.

- De sju strukna uppgifterna är borta ur bankerna. Det finns inga tankstreck i bankerna.
- **dd-g-d4-07 C:** godkänd. Texten lyder nu "Villkoren avgör inte om Karin leder mötet."
- **dd-g-d4-29 och 30:** godkända. dd-g-d4-30 pekar nu ut den röda pärmen, och båda markerar villkor 1 och 2.
- **dd-a-d4-32 och 36:** godkända. Ordföljden är rättad ("Anta att Anna inte står bredvid Rasmus").
- **De 13 tabellförklaringarna:** varje steg följer av villkoren och av de steg som kommer före. Inget steg saknas, och "Det som återstår" är borta. Ordningen stämmer också i dd-e-d4-23, där Isak bor i Gävle före svenskan. dd-a-d4-18 visar nu hela resonemanget om bilarna. Svenskan är naturlig.

Det som återstår är villkorsnumren. I elva steg saknas ett villkor som steget behöver för att utesluta någon. Det gäller oftast steg av typen "Ingen annan kan ..." och "X bor alltså i ...". Slutsatserna stämmer, men läsaren ser inte varför en person faller bort. Märkena ska kompletteras så här:

| Id | Steg | Märken nu | Ska vara | Varför |
|---|---|---|---|---|
| dd-a-d4-20 | 1 | 2, 5 | 1, 2, 5 | Sara faller bort som designer för att hon inte bor i Lund. |
| dd-a-d4-22 | 1 | 2, 4 | 2, 4, 6 | Olga är inte ledig på onsdag för att hon inte går svenska. |
| dd-a-d4-26 | 1 | 6 | 4, 5, 6 | Bara Bo kan köra den blå bilen. |
| dd-e-d4-14 | 1 | 1, 4 | 1, 4, 6, 8 | Tom, Gun och Leo äter inte klockan 12. |
| dd-e-d4-16 | 1 | 3, 8 | 3, 8, 9 | Jonas och Viktor är inte lediga på onsdag. |
| dd-e-d4-17 | 3 | 3, 5 | 3, 5, 8 | Jenny går inte svenska och kan därför inte bo i Gävle. |
| dd-e-d4-19 | 1 | 3, 5, 6 | 3, 5, 6, 8 | Per bor inte i Umeå för att han inte är designer. |
| dd-e-d4-19 | 2 | 5, 8 | 5, 7, 8, 10 | Lisa, Åsa och Mats bor inte i Umeå. |
| dd-e-d4-20 | 1 | 1, 4, 6 | 1, 4, 6, 10 | Bea kör inte den gröna bilen för att hon inte arbetar i receptionen. |
| dd-e-d4-20 | 5 | 5, 11 | 5, 9, 11 | Tom arbetar inte på lagret för att han inte kör den vita bilen. |
| dd-e-d4-23 | 3 | 1, 2, 3, 7 | 1, 2, 3, 7, 9 | Nora går inte arbetsrätt för att hon inte bor i Malmö. |

Felet sitter troligen i hur `forklaraTabell` samlar skälen. När en person faller bort genom ett "Den som ..."-villkor räknas det villkoret inte alltid med. Bara märkena ändras, inte texterna. Ingen ny granskning behövs, men kör verifieraren och validatorn en gång till.

Anmärkning, inget hinder: några steg har ett märke för mycket. Det gäller dd-a-d4-20 steg 2 och 4 (bara villkor 5 eller 4 och 6 behövs), dd-a-d4-22 steg 2 (villkor 6) och dd-e-d4-22 steg 8 (villkor 2). Det vilseleder inte.

Aktivering: nej, komplettera villkorsmärkena i dd-a-d4-20 steg 1, dd-a-d4-22 steg 1, dd-a-d4-26 steg 1, dd-e-d4-14 steg 1, dd-e-d4-16 steg 1, dd-e-d4-17 steg 3, dd-e-d4-19 steg 1 och 2, dd-e-d4-20 steg 1 och 5 och dd-e-d4-23 steg 3 enligt tabellen ovan
