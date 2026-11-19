# Granskning: matrislogik, parti 04 (2026-11-19)

Testansvarig. Alla 100 kandidater lästa (rutnät, alternativ, regel, misstag) och ritade med appens renderare (`render-matris-granskning.tsx --fil=...`) till 100 PNG plus 13 kontaktark via headless Chrome, alla sedda. Hela kedjan körd på nytt på kandidatfilen: `validate-v7-questions`, `v7-parallel-check`, `v7-facit-check`, `v7-distraktor-check --krav=v3`, `v7-geometri-check`. Alla gröna (13 upplysningar om oberoende på grund och avancerad, inga på expert). Därtill en egen sökning efter samma regeltext, samma alternativmängd och delade rader mot alla nio banker och alla kandidatfiler, och en jämförelse av de nya expertmallarna mot de mallar avancerad redan har. Bankerna är orörda.

**Beslut: inte godkänt som helhet.** 68 frågor godkänns som de är, 7 godkänns efter textändring, 25 byts ut eller stryks. Expertdelen håller inte nivån: de "nya expertmallarna" finns redan på avancerad under andra namn, och 23 av 36 expertfrågor är avancerad-frågor med p_prior 0,45. Grund och avancerad håller, med undantagen nedan.

## Rättas före befordran

| # | Id | Problem | Rättelse |
|---|---|---|---|
| 1 | v7a-b5-lform-02, v7a-b5-lform-04, v7a-b5-lform-05, v7a-b5-lfler-01, v7g-b5-lfler-01, v7g-b5-lform-01 | Regeltexten innehåller ordet "undefined" ("Alla figurer har undefined som grundform", "en med undefined"). Namntabellerna i `generera.mjs` saknar `triangle` (stack-symbol, rad 405), `ring` (rad 406), `cross` och `ring` (stack-bas, rad 397) och `cross` (latinFlera, rad 462). Texten visas i genomgången. | Fyll på tabellerna (triangel, ring, kryss) och kör om generatorn. Figurerna är rätt, bara texten ändras. |
| 2 | v7a-b5-lant-03 | Regeln säger "Den innersta ringen är alltid grå", men alla ringar i rutnätet är ofyllda (`rings: ["none", ...]`). Misstagen D till F säger tvärtom att den innersta "alltid är ofylld". Parametern `inre: 'gray'` når inte fram till `mk` i ring-formatet när `diag` är satt. | Rätta generatorn så att texten följer figuren (antingen grå innerring i rutnätet eller "ofyllda" i regeln). |
| 3 | v7g-b5-speg-05 | Vågrät spegling följd av spegling i diagonalen, på 3×3-block, som grund med p_prior 0,65. Samma regel ligger på expert i dag (v7e-3c-speg-03) och i partiet på både avancerad (a-speg-01) och expert (e-speg-01). Diagonalspegling av ett block är inte en grundfråga. | Byt till vågrät plus lodrät på sektorhjul eller 2×2-rutor, som de fyra andra grundspeglingarna. |
| 4 | v7a-b5-antal-02 | Samma regel ord för ord som v7a-b5-antal-01 (summa radvis, schack med liggande i hörnen), och samma som v7e-b5-antal-04. Två på samma nivå bryter regel 8 (variera regeln, inte bara startläget). | Behåll antal-01. Bygg antal-02 med stående i hörnen (varianten e-antal-05 har) eller summa kolumnvis. |
| 5 | v7e-b5-vrid-04 till -09 | Mallen E-M2-pil-fri (vridning plus en egenskap på diagonalen, eget startläge per rad) är avancerads M2-pil-fri-diagonal (6 frågor i dag, p_prior 0,55). Två regler, samma text, samma figurer. Ingenting gör dem till expert utom p_prior. | Stryk. Bygg expertens vridning med E-M4-pil (raderna växlar riktning, 135-graderssteg) eller tre regler. Avancerad behöver inga fler (21). |
| 6 | v7e-b5-vand-04 till -09 | Mallen E-M2-orbital-fri är avancerads M2-orbital-diagonal (15 i dag). Fem av sex har identisk regeltext med befintliga avancerad-frågor (v7a-v3-vand-13, -15, -17, -21, -25), och vand-05 och vand-09 är samma fråga (samma regel, bara startläget skiljer). | Stryk. Expertens vandring byggs med E-M4-orbital, som vand-01 till -03. |
| 7 | v7e-b5-antal-01 till -05 | antal-egen-riktning och antal-summa-radvis är avancerads mallar (v7a-v3-antal-02, -04, -05 har samma regeltext som e-antal-01, -05, -02). Med högst fyra streck finns ingen marginal att göra dem svårare. | Stryk alla fem. Expert får ingen antal-andras i det här partiet. |
| 8 | v7e-b5-speg-01 till -04 | Samma regel, samma format (3×3-block) och samma fyllnadsgrad (3 till 4 rutor) som v7a-b5-speg-01 till -04 i samma parti, och som expertens 3c-speglingar. Expert har redan 12 speglingar. | Stryk 01 till 04. speg-05 (lodrät plus diagonal från övre vänstra) är unik i partiet och godkänns. |
| 9 | v7e-b5-byte-06, v7e-b5-byte-07 | byte-06 har samma regel som byte-02 och 4 av 8 synliga rutor lika; byte-07 har samma regel som byte-05. Nästan-dubbletter inom expert. | Stryk eller bygg om med 135-graderssteg. |

## Godkända

- **Grund (25):** speg-01 till -04, byte-01 till -07, over-01 till -05, rot-01 till -04, vand-01 till -03, lform-02, lform-03. Plus lfler-01 och lform-01 efter punkt 1.
- **Avancerad (30):** tva-01 till -04, lant-01, lant-02, antal-01, byte-01 till -07, lform-01, lform-03, speg-01 till -04, lfler-02, rot-01 till -05, vand-01 till -04. Plus lform-02, -04, -05, lfler-01 och lant-03 efter punkt 1 och 2.
- **Expert (13):** vrid-01 till -03 (E-M4-pil, alternerande riktning och 135-graderssteg är genuint svårare än avancerads M4-pil med 45), byte-01 till -05 och byte-08 (tre oberoende regler, det avancerads M2-pil-tre saknar eftersom längd och spets där följer vinkeln), vand-01 till -03 (E-M4-orbital), speg-05.

Regeln i de godkända går att se utan text: rotation och vandring läses både radvis och kolumnvis till samma svar, latinska kvadrater och överlagringar är rena, speglingarna på sektorhjul är tydliga. Distraktorerna är nära miss i en dimension och ingen av dem följer en annan rimlig regel. Figurerna är läsbara i 102 px: åttahörning mot sexhörning syns, orbitalens fyllda mittpunkt skiljs från satelliten, fyra streck läses utan att räkna om.

## Anmärkningar, inget hinder

10. **Beskrivningen är fel om expert.** `matris-2026-11-19.md` kallar E-M4-pil, E-M4-orbital, E-M2-pil-fri, E-M2-orbital-fri och E-M2-pil-fri-tre nya mallar. Avancerad har M4-pil (8), M2-orbital-diagonal (15), M2-pil-fri-diagonal (6) och M2-pil-tre (6) med samma regler. Det nya på expert är oberoendekravet och 135-graderssteg i M4. Skriv om stycket. Recepten bör dessutom heta som avancerads när mallen är densamma, annars räknar passets exponeringsregel (högst två per recept) dem som olika mallar.
11. **Samma regel på två nivåer** förekommer för block (g-rot-01 till -04 mot a-rot-03, -04 och bankens v7a-v3-rot-01 till -05), orbital-schack (g-byte-02, -03 mot a-byte-01, -02) och lfler (g-lfler-01 mot a-lfler-01). Bankens konvention tolererar det när innehållet skiljer, och det gör det här. Men nästa generator bör avvisa samma regeltext inom samma nivå och familj, inte bara samma rutnät.
12. **Två rörelser på avancerad** (tva-01 till -04): kvadratens gråa fyllning följer av dess läge (facit-checkens upplysning), så tredje regeln är läsbar ur den första. Tolererat på avancerad, som bankens 80 upplysningar. Rätt nivå.
13. **Grund vandring** (vand-01 till -03) har p_prior 0,8 och svårighet 1 med linjär startförskjutning. Lätta, men grund ska ha lätta.
14. **Distraktorkontrollen** räknar två nära miss som godkänt för frågor med tre regler (byte-01 till -08). Rimligt, eftersom resten bryter två regler, men det bör stå i skriptets hjälptext.

## Aktiveringen (TRANINGSVERSION 5)

Säker som den är byggd, med ett villkor.

- Steg 1 lägger frågorna sist i V3-filerna med `fran_version: 5`. `valbarI(q, 3)` och `valbarI(q, 4)` är då falska (`selectQuestions.v7.ts`, samma regel i `scripts/lib/matris/version.mjs`), så varken klassiska test, pass, Nivåkoll eller övningsprov ser dem. Rättningen hittar dem: `BANK_FOR_RUTT.v4` och `.prov` i `fragor.server.ts` läser GV3 och EV3, `.v6` läser AV3.
- Steg 2 höjer bara `TRANINGSVERSION`. Dagens pass, riktade pass, mätningen (matrisens Nivåkoll) och matrisens övningsprov (`typ: 'general'`) sparar sitt urval i `meta.fragor` vid start och slår upp varje fråga med `hittaTraningsfraga` över hela banken (`src/lib/traning/motor.server.ts` rad 437 och 447, `bank.server.ts`). Ett pass som pågår vid deployen behåller sitt urval.
- Klassiska test står kvar på `BANK_VERSION` 3 (`poolFor(niva, 3)` filtrerar på version 3), och percentilen jämförs per `meta.bank_version` (`percentilUnderlag.ts`). Rörs inte.
- `src/lib/nivakoll/` är Nivåkollen för verbalt, numeriskt, figurserier och deduktivt och läser inte matrisbanken alls.
- Villkor: `src/lib/traning/__tests__/traningsversion.test.ts` låser `TRANINGSVERSION` till 4 och räknar 15 frågor med `fran_version` 4. Den måste skrivas om till version 5 och 15 plus antalet godkända innan `--sla-pa` körs, annars faller vitest. `parti04.test.ts` och `bankversion3.test.ts` är redan förberedda.

## Nästa steg

1. Rätta namntabellerna och ring-texten i generatorn (punkt 1, 2), bygg om g-speg-05 och a-antal-02 (punkt 3, 4), kör om generatorn och kedjan.
2. Bygg expertens vridning och vandring på nytt med M4-recepten och 135-graderssteg; låt antal-andras och spegling på expert vänta till en mall som avancerad inte har.
3. Ny granskning av de ombyggda. Det som är godkänt här behöver inte ses igen om rutnät och alternativ är oförändrade.
4. Skriv `docs/qa/matris-parti-04/beslut.json` med de godkända, befordra i två steg, uppdatera `traningsversion.test.ts`.

## Omgranskning 2026-11-19

Testansvarig. De 18 frågorna lästa ur `src/lib/logicTestV7/kandidater/matris-parti-04.v7.json` och lösta oberoende, rad för rad och kolumn för kolumn, mot renderarens konventioner (`renderers.v7.tsx`: pilens vinkel växer medurs, orbitalens läge 0 är klockan tolv och växer medurs med 45 grader per steg, ringarna ritas yttre först så att sista värdet är den innersta). För varje fråga: facit följer regeln, ingen distraktor uppfyller den, regel och misstag stämmer med rutnätet. Ingen av de 18 har "undefined", "null", "NaN", "[object" eller tankstreck i titel, regel eller misstag. Ingen delar rutnät med någon fråga i de 17 bankerna och kandidatfilerna. `node scripts/validate-v7-questions.mjs` är grön på kandidatfilen (86 frågor) och på de tre V3-bankerna. Därtill en jämförelse av regeltexterna mot alla banker.

### De sju textändrade

| Id | Beslut | Skäl |
|---|---|---|
| v7a-b5-lant-03 | Godkänd | Rad 3 och kolumn 3 har tre och två ringar, facit en ofylld ring. "Alla ringar är ofyllda" stämmer med bilden, och misstagen om den innersta ringen stämmer med renderaren (svart sist i listan är innerst). |
| v7a-b5-lform-02 | Godkänd | Triangel med ring. Texten säger nu triangel, ring och kryss. |
| v7a-b5-lform-04 | Godkänd | Romb med ring, entydigt. |
| v7a-b5-lform-05 | Godkänd | Kvadrat med minus, entydigt. |
| v7a-b5-lfler-01 | Godkänd | Kvadrat med ring, båda egenskaperna entydiga radvis och kolumnvis. Samma regeltext som g-lfler-01 på grund, tolererat enligt punkt 11. |
| v7g-b5-lfler-01 | Godkänd | Cirkel med plus, entydigt. |
| v7g-b5-lform-01 | Godkänd | Cirkel med kryss. "Alla figurer är ofyllda och har ett kryss" stämmer. |

Rutnät och alternativ är desamma som i första granskningen. Bara texten har ändrats, och den är nu rätt.

### De elva nya expertfrågorna

| Id | Beslut | Skäl |
|---|---|---|
| v7e-b5-vrid-10 | Underkänd | Facit (270, kort, fylld) är rätt och entydigt. Men mallen finns redan på avancerad, se nedan. |
| v7e-b5-vrid-11 | Underkänd | Facit (90, kort, öppen) rätt. Avancerads mall, se nedan. |
| v7e-b5-vrid-12 | Underkänd | Facit (225, kort, fylld) rätt. Avancerads mall. Regeln skiljer sig från v7a-v3-vrid-32 bara i att raderna börjar 90 grader moturs i stället för medurs, och pilen är kort i stället för lång. |
| v7e-b5-vrid-13 | Underkänd | Facit (45, lång, fylld) rätt. Avancerads mall, och dessutom samma fråga som v7e-b5-vrid-03: samma steg, samma riktningar, samma diagonalregel. Bara den konstanta spetsen (fylld i stället för öppen) och startläget skiljer. |
| v7e-b5-vrid-14 | Underkänd | Facit (225, lång, fylld) rätt. Avancerads mall, och samma fråga som vrid-10. Bara den konstanta längden skiljer. |
| v7e-b5-vrid-15 | Underkänd | Facit (315, kort, fylld) rätt. Avancerads mall, och samma fråga som vrid-11. Bara den konstanta spetsen skiljer. |
| v7e-b5-vand-10 | Godkänd | Satellit 5, 0, 3 / 3, 0, 5 / 1, 4, ?. Facit läge 7 med fylld mitt, entydigt. Växlande riktning på orbital finns inte i någon bank. |
| v7e-b5-vand-11 | Godkänd | Facit läge 0 med fylld mitt, entydigt. Raderna börjar medurs, till skillnad från vand-10. |
| v7e-b5-vand-12 | Godkänd | Facit läge 5 med fylld mitt, entydigt. Moturs med start moturs, en kombination som vand-01 till -03 saknar. |
| v7e-b5-byte-09 | Godkänd | 315, 180, 45 / 45, 180, 315 / 135, 0, ?. Facit 225, lång (schack), fylld (diagonal). Tre oberoende regler plus växlande riktning, något avancerad inte har. |
| v7e-b5-byte-10 | Godkänd | 45, 180, 315 / 315, 180, 45 / 225, 0, ?. Facit 135, lång (diagonal), fylld (schack). Spegelbild av byte-09 med egenskaperna i omvända roller, inte en dubblett. |

**Varför vridningen faller.** Förra granskningen godkände vrid-01 till -03 med motiveringen att 135-graderssteg är "genuint svårare än avancerads M4-pil med 45". Det stämmer inte. `questionBankAvanceradV3.v7.json` har åtta M4-pil (vrid-31 till -38, p_prior 0,5) med 45, 90 och 135 graders steg, och tre av dem har 135: v7a-v3-vrid-32, -36 och -37. Mallen är densamma: växlande riktning, startförskjutning per rad, en egenskap på diagonalen och en konstant. vrid-10 till -15 har p_prior 0,45 och skiljer sig från avancerad bara i startförskjutningens storlek. Det är samma fel som punkt 5 i förra granskningen: ingenting gör dem till expert utom p_prior. Tre av dem är dessutom inbördes dubbletter (vrid-13 mot -03, -14 mot -10, -15 mot -11), eftersom generatorns spärr mot samma regeltext släpper igenom frågor som bara skiljer sig i den konstanta egenskapen.

Vandringen och byte-frågorna håller expertnivå: växlande riktning på orbitalen finns inte på avancerad, och E-M4-pil-tre kräver tre oberoende regler ovanpå växlingen.

### Anmärkningar

- **vrid-01 till -03 bör strykas.** De godkändes i förra granskningen på samma felaktiga premiss. vrid-01 är spegelbilden av v7a-v3-vrid-38 (45 grader, start 90, fylld spets på diagonalen, lång pil), och vrid-03 har samma mall som v7a-v3-vrid-32. Expert får då ingen vridning i det här partiet, vilket är bättre än vridning på avancerad nivå. En expertvridning behöver något avancerad saknar, till exempel schackmönster plus diagonal ovanpå växlingen, som byte-09 och -10.
- **Spärren mot samma regeltext** bör jämföra regeln utan den konstanta egenskapen ("Pilen är kort/lång hela vägen", "Spetsen är öppen/fylld hela vägen"), och jämföra mot alla nivåer i familjen för mallar som finns på flera nivåer.
- Facit står på plats A i fyra av de elva (vrid-12, vand-12, byte-09, byte-10). Det spelar ingen roll, eftersom alternativen blandas per session (validatorn: 16,5 till 16,8 procent per position efter blandning).

### Beslut

- **Godkända (12):** v7a-b5-lant-03, v7a-b5-lform-02, -04, -05, v7a-b5-lfler-01, v7g-b5-lfler-01, v7g-b5-lform-01, v7e-b5-vand-10, -11, -12, v7e-b5-byte-09, -10.
- **Underkända (6):** v7e-b5-vrid-10 till -15. Stryks utan ersättare.
- **Omprövas:** v7e-b5-vrid-01 till -03 flyttas från `godkanda` till `strukna`.

Efter det: kör om generatorn, kedjan och befordran enligt aktiveringsstegen. `traningsversion.test.ts` ska räkna med de faktiska godkända: de 75 i `godkanda` (där de sju textändrade redan står) minus vrid-01 till -03, plus de fem nya, alltså 77 frågor.

Aktivering: nej, rätta beslut.json (lägg vand-10, -11, -12, byte-09 och -10 i godkanda, flytta v7e-b5-vrid-01 till -03 till strukna och lägg v7e-b5-vrid-10 till -15 där), kör om generatorn och kedjan. Därefter kan de 77 aktiveras utan ny granskning.
