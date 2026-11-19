# Granskning: Spatial förmåga, bankversion 3 (100 nya uppgifter)

Datum 2026-11-19. Testansvarig. Underlag: docs/fragebank/spatial-2026-11-19.md, bankerna i src/lib/spatialV1/, scripts/spatial-verifiera.mjs och scripts/gen-spatial-v3.mjs. Bankerna är inte ändrade i granskningen.

## Beslut

**Godkänt.** Alla 100 uppgifter får aktiveras med `SPATIAL_VERSION = 3`. Inga rättelser krävs i bankerna. Anmärkningarna nedan gäller nästa omgång (version 4) och generatorns dubblettspärr.

## Vad som gjordes

1. **Verifieraren körd själv**: `node scripts/spatial-verifiera.mjs` ger 388 uppgifter, 0 fel, 18 varningar. Varningarna är de 15 kända på version 1 och 2 plus tre nya på grund B (sp-g-b-25, -30, -31), alla "fel axel"-distraktorer som är facit vridet ett kvarts varv.
2. **Egen, fristående kontroll av form A, B och D** (skriven utan att läsa verifierarens kod, i sessionens scratchpad `spatial-granskning/egen-kontroll.mjs`): rutor följs genom vikningarna, hål och klipp ges bara där alla lager har hål, facit jämförs i läge och i egen ram. Resultat på alla 100: facit stämmer i alla A-, B- och D-uppgifter, exakt ett alternativ är rätt i varje. Samma kontroll på alla 388 ger samma utfall. Form C (tärningar) har bara verifierarens 3D-kontroll och ögat, se punkt 3.
3. **Alla 100 renderade med appens ritare** (SpatialSvg via tsx, skärmdumpade med Chrome genom puppeteer-core) som tolv kontaktkartor, en per nivå och form, med facit markerat, plus en urvalskarta med nästan-dubbletterna. Bilderna ligger i sessionens scratchpad `spatial-granskning/*.png`, utanför git. Varje uppgift är tittad på: figurerna ritas rätt, facit går att se, inget alternativ ser rätt ut utöver facit. Tärningarna på grund och avancerad går att lösa på de synliga sidorna; på expert (alla distraktorer "vriden") avgörs riktningen på pilen eller triangeln av grannarnas ordning runt hörnet, vilket är avsiktligt svårt och samma som i dagens 24.
4. **Distraktorer som är facit vridet eller speglat**:
   - Grund B, "fel axel" (sp-g-b-25, -30, -31 och 13 gamla): facit speglat över den andra mittlinjen, vilket är facit vridet ett kvarts varv. Arket ligger still och viklinjen är ritad, så alternativet kräver att man vikt längs en linje som inte finns. Entydigt fel.
   - Form D, "spegelvänd" (i 17 av 27 nya D): det ihopvikta arket med hålen speglade i sin egen ram. Alternativen ritas centrerade, så vilken halva som blev kvar syns inte, men arket ligger still och hålens sida följer av vikriktningen. Entydigt fel, och samma konstruktion som i dagens bank. I sp-e-d-25 och sp-e-d-29 råkar även "klipp på fel kant" vara facit speglat; fortfarande fel.
   - Form C, "spegel": samma tre symboler i omvänd ordning runt hörnet. Symmetriska symboler (ring, prick) ger ingen ledtråd, så bara ordningen avgör. Det är kärnan i uppgiften, inte en tvetydighet.
   - Ingen distraktor i någon form är facit vridet i planet på ett sätt som kan uppfattas som rätt.
5. **Svårighet mot nivå**: strukturen är samma som i version 1 och 2 och skiljer nivåerna åt på samma sätt. A: grund 3 och 4 i nät utan markering, avancerad 4 med bara speglingar som distraktorer, expert 5 med markerad ruta och bara speglingar. B: grund en vikning, avancerad två (varav diagonala), expert tre med klipp. C: grund "fel symbol" och "främmande" som går att slå ut, avancerad speglingar, expert bara vridna. D: grund en vikning, avancerad två med klipp, expert tre med klipp. difficulty och p_prior är identiska med dagens per nivå och form. Distraktortypernas fördelning i de nya ligger inom några procentenheter från de gamla på varje nivå och form.
6. **Nästan-dubbletter** (egen nyckel, kanoniserad under kvadratens åtta symmetrier, scratchpad `spatial-granskning/dubbletter.mjs`):
   - Grund B är uttömd, som frågebanken säger. De åtta nya är vridningar eller speglingar av befintliga, och varje ny delar facitark med en gammal (bara vikriktningen skiljer). Accepteras, eftersom formen bara har 32 uppgifter.
   - Hela uppgiften vriden i förhållande till en annan på samma nivå: sp-a-b-31 och sp-a-b-32 (båda nya), sp-a-d-33 mot sp-a-d-07, sp-e-b-27 mot sp-e-b-15, sp-e-d-28 mot sp-e-d-12. Vikföljderna ser olika ut och facit är olika figurer, så de löses var för sig. Accepteras, men se anmärkning.
   - Form A: flera nya har samma fria form som gamla (till exempel sp-g-a-25 och sp-g-a-32, sp-a-a-13 och sp-a-a-31). Det är inom generatorns tak per fri form (4, 3, 3) och alternativen skiljer sig.
   - Form C: ingen referensvy återanvänds. Att samma tre symboler syns på flera referenser i annan ordning är avsiktlig variation.

## Aktiveringen är säker

- **Nivåtestet**: `spatialMeta()` skriver `spatial_version` på varje session och `spatialInnehall()` drar ur `poolFor(niva, spatialVersion(meta))`. I produktionen finns tre spatial-sessioner, alla avslutade, alla med `spatial_version`. Inga pågående.
- **Passen** (`spatial-pass`): `meta.fragor` lagrar uppgifternas id vid skapandet, och `sedda` räknas på id. En större pool påverkar bara nya pass. Inga spatial-pass finns i produktionen.
- **I-prov-provet** (`iprov-prov`): varje deltest lagrar `ids` i meta. Inga I-prov-sessioner finns i produktionen.
- **Övningsprov per typ** (`prov-typer.server.ts`): referenserna lagrar uppgiftens id.
- **Nivåkoll**: använder inte spatial alls (matris, figurserier, deduktivt).
- `fraga_statistik` får bara nya id.

Steg vid aktivering, i samma commit:
1. `SPATIAL_VERSION = 3` i `src/lib/spatialV1/select.ts`.
2. `expect(SPATIAL_VERSION).toBe(2)` i `src/lib/spatialV1/__tests__/version3.test.ts` ändras till 3.
3. Kör `npx vitest run src/lib/spatialV1 src/lib/tester/steg2` och `npx tsc --noEmit -p .`.
4. Kör aldrig `scripts/gen-spatial.mjs` igen på bankerna.

## Anmärkningar till version 4

- Lägg en nyckel kanoniserad under vridning och spegling i generatorns dubblettspärr (B och D: rörliga rutor per vikning plus hål och klipp; A: fri form), så att inga två uppgifter på samma nivå är samma uppgift vriden. De fyra paren ovan hade då stoppats.
- Grund B kan inte få fler uppgifter utan att formen vidgas. Beslut: nästa omgång får en diagonal halvvikning på grund B (samma som avancerad redan har, men en vikning). Det kräver en ny spärr för att hålet inte ligger på diagonalen.
- Expert C bör på sikt få en förklaring per uppgift som säger vilka grannar som avgör riktningen, i stil med sp-g-c-25:s text. Dagens "grannarna runt den har vridits bort" räcker för rättning men lär inte ut metoden.
