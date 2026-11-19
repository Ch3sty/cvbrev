# Granskning: Spatial förmåga, omgång 3, bankversion 5 (100 nya uppgifter)

Datum 2026-11-19. Testansvarig. Underlag: docs/fragebank/spatial-2026-11-19-omg3.md, bankerna i src/lib/spatialV1/, ritaren (ritare.tsx, svgMatt.tsx, types.ts, geometri.json), src/components/tests/steg2/Uppgifter.tsx, src/lib/tester/steg2/namn.ts och scripts/spatial-verifiera.mjs. Bankerna, skripten och gränssnittet är inte ändrade i granskningen.

## Beslut

**Godkänt efter strykning.** Speglingarna (30) och kropparna (60) är rätt, entydiga och ligger på rätt nivå. De tio nya expertvikningarna, sp-e-b-41 till sp-e-b-50, stryks. Facit stämmer i alla tio, men de är samma uppgiftsform som avancerad B redan har och hör inte hemma på expert (punkt 4). Familjenamnen ändras i samma commit, med ett villkor (punkt 5).

## Vad som gjordes

1. **Verifieraren körd själv**: `node scripts/spatial-verifiera.mjs --version 5` ger 100 uppgifter, 0 fel, 0 varningar. Hela banken: 587 uppgifter, 0 fel, 85 varningar, samma 85 äldre som efter omgång 2. `git diff --numstat` på bankerna är bara tillagda rader (5202, 5822 och 8296, 0 borttagna). `npx vitest run src/lib/spatialV1`: 4 filer, 79 test, gröna, också ritarens hash över de 3 461 befintliga figurerna.
2. **Alla 100 renderade med appens ritare** (`SpatialSvg` via tsx, puppeteer) som tio kontaktkartor, en per nivå och typ, med facit i koppar, feltyp och förklaring. Dessutom varje uppgift i den storlek den visas: Pixel 7 (412 px, innehåll 380 px, referens och alternativ med cirka 160 px figur) och desktop (kolumnen 560 px, referensen cirka 250 px, alternativen fyra i rad med cirka 107 px figur), och referenserna för vy och snitt förstorade två gånger. Allt ligger i sessionens scratchpad `omg3g/` (k-, m- och d-*.png samt enskild/), utanför git. Varje karta är tittad på.
3. **Egen lösare**, skriven utan generatorns och verifierarens kod (scratchpad `omg3g/losare.cjs`):
   - **A**: speglar referensen i linjerna i frågans ordning i figurens omskrivna rektangel (ritaren centrerar figuren och drar linjerna genom mitten), med den grå rutan. Exakt ett alternativ är rätt i alla 30, och det står på facit. Frågans ordning stämmer med `axlar`, vridningen och riktningen i förklaringen stämmer, ingen referens är vrid- eller spegelsymmetrisk (inte heller utan den grå rutan), och varje distraktor är det typen säger.
   - **C**: höjderna räknas ur `h` med kolumnordningen från pilens håll (mot de grå sidorna växer x åt höger, mot de vita växer y åt vänster). Exakt ett alternativ är rätt i alla 60, facit har tre kolumner utan tom kolumn och är aldrig symmetriskt, förklaringens höjder stämmer, och varje distraktor är det typen säger ("främre raden" är den första icke-tomma stapeln från pilen i varje kolumn).
   - **Kroppar och dolda kuber**: egen isometrisk bild på triangelnätet med djupbuffer, där varje triangel får sidans typ (ovansida, grå, vit, platta), en markering när sidans andra halva skyms, och snittlinjen. Alla 4^9 = 262 144 kroppar är ritade för varje kombination av pil och snittrad. För varje uppgift ger alla kroppar med samma bild samma svar, i alla 60. Det gäller också när snittlinjen på sidorna räknas bort. Upp till 18 kroppar ger samma bild (sp-a-c-42), så dolda kuber finns, men ingen av dem kan ändra facit.
   - **B**: vecklar upp hålen baklänges geometriskt (spegling över viklinjen, punkt i polygon mot den grå delen) och kontrollerar att arket efter varje vikning är det som ritas, att pilen börjar i den grå delen och att inget hål hamnar på en viklinje. Exakt ett alternativ är rätt i alla tio, sex hål, och förklaringens antal stämmer.
   - **Kopior och dubbletter**: inga dubbla alternativ, och ingen kropp används två gånger bland de nya i tittarens ram (spegelvänd inräknad), inte heller mellan vy och snitt. Kopiespärren mot äldre nivåer är verifierarens och ger 0 fel.
4. **Svenskan**: inga tankstreck i frågor, förklaringar eller misstagstexter. "Kroppen sågas itu längs den streckade linjen. Hur ser snittytan ut från pilens håll?" och misstagstexterna läses naturligt. En stilsak som inte kräver åtgärd: "Här blir det den första figuren vriden 90 grader moturs" är tungt. "Den första figuren" betyder referensen, som i form A:s äldre förklaringar ("Rätt figur är den första vriden ..."). Bättre nästa gång: "Här blir det figuren vriden 90 grader moturs."
5. **Ritningen i mobil och desktop**: pilen syns och pekar mot rätt sidor, snittlinjen går att följa över ovansidor och skurna sidor, och kubkanten är läsbar också i desktopens referens. Expertsnitten med tre höga staplar (till exempel sp-e-c-50 och sp-e-c-55) är täta men läsbara, och det är meningen på expert. Alternativen på desktop (107 px) är staplar på högst 3×3 och läses utan problem. Snittlinjen i koppar har samma färg som "rätt svar" i genomgången. I själva uppgiften finns ingen sådan markering, så den stör inte lösningen, men designansvarig bör se den, som underlaget säger.

## Punkt 3: gränssnittet i version 4

`git diff HEAD` på Uppgifter.tsx och namn.ts: alla tre ändringarna i Uppgifter.tsx (rubriken, etiketten "Kroppen" och att raden "Spegelbilder räknas inte" försvinner) slår bara till när referensen är `kind: 'kropp'` eller en brick med `axlar`. Ingen uppgift med `fran_version` 1 till 4 har något av det (räknat: 0), artiklarnas uppgifter har det inte heller, och `poolFor(niva, 4)` tar inga uppgifter med version 5. namn.ts lägger bara till `SPATIAL_TYP_NAMN`, och `FORM_NAMN` är orörd. Ritaren ger byte för byte samma markup för alla 3 461 befintliga figurer (testets hash). Bankerna läses bara på servern (select.ts, motor.server.ts), så de nya raderna når inte klientens paket.

**Inget syns för användarna innan version 5 aktiveras.**

Ett fynd som gäller efter aktiveringen: `gruppNamn` i Steg2Review.tsx (listan över uppgifter i genomgången) och `grupp` i motor.server.ts ("Var du tappar") använder `FORM_NAMN`. Utan namnbyte heter en kropp "Tärningar" och en spegling "Vriden figur" där, fast uppgiften själv hette "Kroppar" och "Speglad figur". Det löses med punkt 5.

## Punkt 4: tre frågor och expertvikningarna

**Facit på samma plats i 18 av 33 nya grunduppgifter.** Godtas utan åtgärd. Alternativen blandas per session (`permutationForSession` i fragor.server.ts). Sessioner utan blandning är gamla sessioner vars uppgifter redan är valda ur äldre versioner. Ingen användare ser alltså bankens ordning. Banken som helhet ligger under 40 procent per plats i version 5 (grund 30, 31, 21 och 18 procent; avancerad 21, 33, 19 och 27; expert 24, 26, 25 och 25). Generatorn bör ändå rotera facits plats nästa omgång, så att bankfilen inte ser skev ut vid granskning.

**Grund vy har få möjliga facitbilder.** Godtas utan åtgärd, men underlaget räknar fel: med tre kolumner, höjd 1 eller 2 och inte symmetriskt finns fyra bilder, inte sex (1 1 2, 2 1 1, 1 2 2 och 2 2 1). De elva uppgifterna fördelar sig 4, 3, 2 och 2. Det ger ingen ledtråd: varje facitbild finns också som distraktor i andra uppgifter (bakifrån är alltid facit spegelvänd), så att känna igen bilden säger inget om vilken som är rätt. Svaret måste fortfarande läsas ur kroppen. På grund är ett litet bildförråd rimligt.

Ett närliggande fynd som inte kräver åtgärd nu: i alla 60 kroppar är facit och "bakifrån" det enda spegelparet bland alternativen. Den som ser det kan gissa mellan två utan att titta på kroppen, och väljer man sedan det alternativ som ligger närmast de två andra träffar man ungefär 60 procent i stället för 25. Det är bättre än äldre form A på avancerad, där facit är det enda alternativet som inte är spegelvänt, och "bakifrån" är ett äkta misstag som ska vara med. Nästa omgång bör ändå ha en del uppgifter där också två distraktorer är varandras spegelbilder.

**Expert B, två vikningar med två hål: stryk alla tio.** Facit och distraktorer stämmer i alla tio. Men formen finns redan på avancerad: sp-a-b-38 (två vikningar, en sned, två hål, 5 hål i facit) och sp-a-b-39 (två vikningar, båda sneda, två hål, 6 hål) från omgång 2, plus 22 äldre avancerade med minst en sned vikning. Expert B är i dag tre vikningar med klipp, i alla 40. De nya är alltså avancerad svårighet med expertens `difficulty` 4 och `p_prior` 0,42, och de skulle stå för var femte B i expertens nivåtest. Det sänker expertnivån och snedvrider kalibreringen. Att alla tio ger exakt sex hål (underlaget) förstärker bilden av en smal variant. Strykningen kostar lite: expertens B-pool blir 40 som i version 4, och resten av omgången är oberoende av dem. Varianten `tva_vik` i vikning.mjs och `nivaB` kan stå kvar. Vill vi använda uppgifterna kan de flyttas till avancerad i en senare omgång, med ny kopiekontroll.

## Punkt 5: familjenamnen

**Beslut: ja, i samma commit som aktiveringen.** A blir "Vriden och speglad figur" och C "Tärningar och kroppar" i `FORM_NAMN`. Skälet är punkt 3: utan bytet säger "Var du tappar" och genomgångens lista "Tärningar" om en kropp och "Vriden figur" om en spegling, och det är fel ord för uppgiften. Att namnet byts också på äldre resultat är priset, och där är det en förbättring, eftersom gruppen räknar båda typerna från version 5.

**Villkor:** rubriken över själva uppgiften (`formNamn` i Uppgifter.tsx) ska inte följa med. En vanlig vridningsuppgift med rubriken "Vriden och speglad figur" och raden "Spegelbilder räknas inte" under säger emot sig själv, och en tärning ska heta "Tärningar". Lägg därför uppgiftsrubrikerna för de äldre typerna i `SPATIAL_TYP_NAMN` (till exempel `vriden: 'Vriden figur'` och `tarning: 'Tärningar'`) och låt `formNamn` använda dem för form A och C. `FORM_NAMN` används då bara för grupperna. Kontrollera i riktig webbläsare på Pixel 7 att "Vriden och speglad figur" får plats i "Var du tappar" och i genomgångens lista (den har `truncate`).

## Per id

Facit är bokstaven i bankens ordning, före blandningen. "Kroppar med samma bild" är antalet av alla 4^9 kroppar som ritas likadant, snittlinjen inräknad. Alla ger samma svar som facit.

### Grund A, spegling

| Id | Facit | Linjer i ordning | Facit är referensen vriden | Distraktorer | Beslut |
|---|---|---|---|---|---|
| sp-g-a-43 | C | vågrät, sedan lodrät | ett halvt varv | bara andra, kvarts varv, bara första | Godkänd. |
| sp-g-a-44 | C | lodrät, sedan vågrät | ett halvt varv | bara andra, bara första, kvarts varv | Godkänd. |
| sp-g-a-45 | B | lodrät, sedan vågrät | ett halvt varv | bara första, bara andra, kvarts varv | Godkänd. |
| sp-g-a-46 | C | lodrät, sedan vågrät | ett halvt varv | kvarts varv, bara andra, bara första | Godkänd. |
| sp-g-a-47 | A | vågrät, sedan lodrät | ett halvt varv | bara första, bara andra, kvarts varv | Godkänd. |
| sp-g-a-48 | A | vågrät, sedan lodrät | ett halvt varv | kvarts varv, bara första, bara andra | Godkänd. |
| sp-g-a-49 | A | lodrät, sedan vågrät | ett halvt varv | bara första, kvarts varv, bara andra | Godkänd. |
| sp-g-a-50 | A | vågrät, sedan lodrät | ett halvt varv | kvarts varv, bara andra, bara första | Godkänd. |
| sp-g-a-51 | A | lodrät, sedan vågrät | ett halvt varv | bara första, kvarts varv, bara andra | Godkänd. |
| sp-g-a-52 | A | lodrät, sedan vågrät | ett halvt varv | bara andra, bara första, kvarts varv | Godkänd. |
| sp-g-a-53 | A | lodrät, sedan vågrät | ett halvt varv | kvarts varv, bara första, bara andra | Godkänd. |

### Grund C, vy

| Id | Facit | Höjder från vänster | Pil | Kroppar med samma bild | Distraktorer | Beslut |
|---|---|---|---|---|---|---|
| sp-g-c-41 | A | 2, 2, 1 | mot vita | 2, alla samma svar | en för mycket, andra sidan, bakifrån | Godkänd. |
| sp-g-c-42 | A | 1, 2, 2 | mot vita | 1, alla samma svar | bakifrån, en för mycket, andra sidan | Godkänd. |
| sp-g-c-43 | B | 2, 2, 1 | mot vita | 2, alla samma svar | bakifrån, en för mycket, andra sidan | Godkänd. |
| sp-g-c-44 | A | 1, 1, 2 | mot vita | 1, alla samma svar | andra sidan, bakifrån, en för mycket | Godkänd. |
| sp-g-c-45 | A | 2, 2, 1 | mot vita | 2, alla samma svar | andra sidan, bakifrån, en för mycket | Godkänd. |
| sp-g-c-46 | B | 1, 2, 2 | mot vita | 2, alla samma svar | en för mycket, bakifrån, andra sidan | Godkänd. |
| sp-g-c-47 | B | 1, 1, 2 | mot vita | 1, alla samma svar | en för mycket, andra sidan, bakifrån | Godkänd. |
| sp-g-c-48 | A | 2, 1, 1 | mot grå | 1, alla samma svar | bakifrån, andra sidan, en för mycket | Godkänd. |
| sp-g-c-49 | A | 1, 1, 2 | mot vita | 1, alla samma svar | bakifrån, en för mycket, andra sidan | Godkänd. |
| sp-g-c-50 | B | 2, 2, 1 | mot grå | 2, alla samma svar | en för mycket, bakifrån, andra sidan | Godkänd. |
| sp-g-c-51 | A | 2, 1, 1 | mot vita | 2, alla samma svar | bakifrån, en för mycket, andra sidan | Godkänd. |

### Grund C, snitt

| Id | Facit | Höjder från vänster | Pil och snittrad | Kroppar med samma bild | Distraktorer | Beslut |
|---|---|---|---|---|---|---|
| sp-g-c-52 | C | 3, 1, 1 | mot grå, rad 2 | 2, alla samma svar | vyn, rad bakom, bakifrån | Godkänd. |
| sp-g-c-53 | A | 3, 2, 1 | mot vita, rad 2 | 12, alla samma svar | rad bakom, bakifrån, vyn | Godkänd. |
| sp-g-c-54 | C | 2, 1, 1 | mot vita, rad 2 | 2, alla samma svar | rad bakom, bakifrån, vyn | Godkänd. |
| sp-g-c-55 | A | 2, 1, 1 | mot grå, rad 1 | 1, alla samma svar | rad framför, rad bakom, vyn | Godkänd. |
| sp-g-c-56 | D | 1, 3, 2 | mot grå, rad 1 | 3, alla samma svar | bakifrån, rad bakom, vyn | Godkänd. |
| sp-g-c-57 | A | 1, 1, 2 | mot vita, rad 2 | 1, alla samma svar | bakifrån, vyn, rad bakom | Godkänd. |
| sp-g-c-58 | C | 2, 2, 1 | mot vita, rad 1 | 2, alla samma svar | rad bakom, vyn, bakifrån | Godkänd. |
| sp-g-c-59 | B | 1, 1, 3 | mot vita, rad 1 | 2, alla samma svar | bakifrån, rad bakom, vyn | Godkänd. |
| sp-g-c-60 | B | 3, 1, 1 | mot grå, rad 2 | 1, alla samma svar | bakifrån, rad bakom, vyn | Godkänd. |
| sp-g-c-61 | A | 1, 2, 2 | mot grå, rad 1 | 2, alla samma svar | rad bakom, bakifrån, vyn | Godkänd. |
| sp-g-c-62 | C | 1, 1, 3 | mot vita, rad 1 | 1, alla samma svar | rad bakom, bakifrån, vyn | Godkänd. |

### Avancerad A, spegling

| Id | Facit | Linjer i ordning | Facit är referensen vriden | Distraktorer | Beslut |
|---|---|---|---|---|---|
| sp-a-a-41 | C | sned, sedan lodrät | 90 grader moturs | bara första, bara andra, fel ordning | Godkänd. |
| sp-a-a-42 | B | sned, sedan lodrät | 90 grader moturs | bara andra, bara första, fel ordning | Godkänd. |
| sp-a-a-43 | A | vågrät, sedan sned | 90 grader moturs | fel ordning, bara första, bara andra | Godkänd. |
| sp-a-a-44 | C | vågrät, sedan sned | 90 grader medurs | bara första, fel ordning, bara andra | Godkänd. |
| sp-a-a-45 | B | sned, sedan vågrät | 90 grader moturs | fel ordning, bara första, bara andra | Godkänd. |
| sp-a-a-46 | B | sned, sedan vågrät | 90 grader medurs | bara första, fel ordning, bara andra | Godkänd. |
| sp-a-a-47 | A | vågrät, sedan sned | 90 grader medurs | bara första, bara andra, fel ordning | Godkänd. |
| sp-a-a-48 | C | sned, sedan vågrät | 90 grader medurs | bara första, bara andra, fel ordning | Godkänd. |
| sp-a-a-49 | B | sned, sedan lodrät | 90 grader moturs | fel ordning, bara första, bara andra | Godkänd. |
| sp-a-a-50 | C | vågrät, sedan sned | 90 grader moturs | bara andra, fel ordning, bara första | Godkänd. |
| sp-a-a-51 | C | sned, sedan vågrät | 90 grader moturs | bara andra, fel ordning, bara första | Godkänd. |

### Avancerad C, vy

| Id | Facit | Höjder från vänster | Pil | Kroppar med samma bild | Distraktorer | Beslut |
|---|---|---|---|---|---|---|
| sp-a-c-41 | D | 1, 2, 3 | mot grå | 6, alla samma svar | bakifrån, främre raden, andra sidan | Godkänd. |
| sp-a-c-42 | A | 2, 3, 3 | mot grå | 18, alla samma svar | bakifrån, en för lite, främre raden | Godkänd. |
| sp-a-c-43 | C | 3, 2, 2 | mot vita | 12, alla samma svar | främre raden, andra sidan, bakifrån | Godkänd. |
| sp-a-c-44 | B | 1, 3, 3 | mot vita | 1, alla samma svar | en för lite, främre raden, bakifrån | Godkänd. |
| sp-a-c-45 | B | 2, 2, 3 | mot vita | 1, alla samma svar | bakifrån, en för lite, främre raden | Godkänd. |
| sp-a-c-46 | D | 2, 1, 3 | mot grå | 1, alla samma svar | bakifrån, andra sidan, främre raden | Godkänd. |
| sp-a-c-47 | C | 2, 2, 3 | mot vita | 2, alla samma svar | andra sidan, bakifrån, främre raden | Godkänd. |
| sp-a-c-48 | B | 3, 2, 2 | mot vita | 6, alla samma svar | bakifrån, andra sidan, främre raden | Godkänd. |
| sp-a-c-49 | C | 2, 1, 3 | mot vita | 2, alla samma svar | andra sidan, bakifrån, främre raden | Godkänd. |
| sp-a-c-50 | D | 2, 2, 3 | mot vita | 1, alla samma svar | en för lite, främre raden, bakifrån | Godkänd. |
| sp-a-c-51 | B | 1, 2, 3 | mot vita | 2, alla samma svar | andra sidan, främre raden, bakifrån | Godkänd. |

### Avancerad C, snitt

| Id | Facit | Höjder från vänster | Pil och snittrad | Kroppar med samma bild | Distraktorer | Beslut |
|---|---|---|---|---|---|---|
| sp-a-c-52 | A | 1, 3, 3 | mot grå, rad 2 | 6, alla samma svar | bakifrån, vyn, rad bakom | Godkänd. |
| sp-a-c-53 | B | 3, 2, 1 | mot grå, rad 1 | 4, alla samma svar | vyn, bakifrån, rad bakom | Godkänd. |
| sp-a-c-54 | B | 3, 1, 1 | mot vita, rad 1 | 1, alla samma svar | vyn, rad bakom, bakifrån | Godkänd. |
| sp-a-c-55 | B | 2, 1, 3 | mot grå, rad 1 | 3, alla samma svar | vyn, rad bakom, bakifrån | Godkänd. |
| sp-a-c-56 | B | 2, 1, 1 | mot grå, rad 0 | 1, alla samma svar | vyn, rad framför, bakifrån | Godkänd. |
| sp-a-c-57 | D | 1, 2, 3 | mot vita, rad 0 | 1, alla samma svar | vyn, bakifrån, rad framför | Godkänd. |
| sp-a-c-58 | B | 1, 1, 3 | mot vita, rad 1 | 1, alla samma svar | bakifrån, vyn, rad bakom | Godkänd. |
| sp-a-c-59 | B | 2, 1, 1 | mot grå, rad 2 | 10, alla samma svar | bakifrån, rad bakom, vyn | Godkänd. |
| sp-a-c-60 | B | 3, 1, 1 | mot vita, rad 2 | 12, alla samma svar | bakifrån, rad bakom, vyn | Godkänd. |
| sp-a-c-61 | A | 3, 1, 1 | mot vita, rad 2 | 12, alla samma svar | rad bakom, bakifrån, vyn | Godkänd. |
| sp-a-c-62 | B | 3, 1, 1 | mot grå, rad 2 | 3, alla samma svar | vyn, bakifrån, rad bakom | Godkänd. |

### Expert A, spegling

| Id | Facit | Linjer i ordning | Facit är referensen vriden | Distraktorer | Beslut |
|---|---|---|---|---|---|
| sp-e-a-41 | C | lodrät, sedan sned | 90 grader medurs | bara första, fel ordning, bara andra | Godkänd. |
| sp-e-a-42 | A | sned, sedan lodrät | 90 grader moturs | bara andra, bara första, fel ordning | Godkänd. |
| sp-e-a-43 | B | sned, sedan vågrät | 90 grader moturs | fel ordning, bara andra, bara första | Godkänd. |
| sp-e-a-44 | A | sned, sedan vågrät | 90 grader medurs | bara första, fel ordning, bara andra | Godkänd. |
| sp-e-a-45 | A | sned, sedan lodrät | 90 grader medurs | bara första, fel ordning, bara andra | Godkänd. |
| sp-e-a-46 | A | sned, sedan vågrät | 90 grader medurs | fel ordning, bara första, bara andra | Godkänd. |
| sp-e-a-47 | A | lodrät, sedan sned | 90 grader medurs | bara första, fel ordning, bara andra | Godkänd. |
| sp-e-a-48 | A | sned, sedan vågrät | 90 grader medurs | bara andra, bara första, fel ordning | Godkänd. |

### Expert C, vy

| Id | Facit | Höjder från vänster | Pil | Kroppar med samma bild | Distraktorer | Beslut |
|---|---|---|---|---|---|---|
| sp-e-c-41 | B | 1, 3, 2 | mot grå | 1, alla samma svar | främre raden, bakifrån, andra sidan | Godkänd. |
| sp-e-c-42 | B | 2, 3, 3 | mot grå | 2, alla samma svar | bakifrån, andra sidan, främre raden | Godkänd. |
| sp-e-c-43 | C | 1, 3, 3 | mot grå | 1, alla samma svar | främre raden, bakifrån, en för lite | Godkänd. |
| sp-e-c-44 | A | 2, 3, 3 | mot grå | 6, alla samma svar | främre raden, andra sidan, bakifrån | Godkänd. |
| sp-e-c-45 | C | 2, 1, 3 | mot vita | 2, alla samma svar | bakifrån, andra sidan, främre raden | Godkänd. |
| sp-e-c-46 | B | 3, 3, 2 | mot grå | 6, alla samma svar | en för lite, bakifrån, främre raden | Godkänd. |
| sp-e-c-47 | C | 1, 3, 3 | mot vita | 1, alla samma svar | främre raden, bakifrån, andra sidan | Godkänd. |
| sp-e-c-48 | C | 3, 2, 2 | mot grå | 4, alla samma svar | främre raden, bakifrån, en för lite | Godkänd. |

### Expert C, snitt

| Id | Facit | Höjder från vänster | Pil och snittrad | Kroppar med samma bild | Distraktorer | Beslut |
|---|---|---|---|---|---|---|
| sp-e-c-49 | A | 3, 2, 1 | mot grå, rad 1 | 2, alla samma svar | bakifrån, vyn, rad framför | Godkänd. |
| sp-e-c-50 | D | 1, 3, 3 | mot vita, rad 1 | 9, alla samma svar | vyn, bakifrån, rad framför | Godkänd. |
| sp-e-c-51 | C | 3, 1, 1 | mot grå, rad 1 | 2, alla samma svar | rad bakom, vyn, bakifrån | Godkänd. |
| sp-e-c-52 | D | 2, 3, 1 | mot grå, rad 1 | 3, alla samma svar | rad bakom, bakifrån, vyn | Godkänd. |
| sp-e-c-53 | B | 3, 1, 1 | mot grå, rad 1 | 1, alla samma svar | rad bakom, vyn, bakifrån | Godkänd. |
| sp-e-c-54 | B | 3, 2, 1 | mot grå, rad 1 | 2, alla samma svar | rad framför, vyn, bakifrån | Godkänd. |
| sp-e-c-55 | D | 3, 3, 1 | mot grå, rad 1 | 3, alla samma svar | vyn, rad framför, bakifrån | Godkänd. |
| sp-e-c-56 | A | 1, 3, 3 | mot vita, rad 1 | 9, alla samma svar | vyn, bakifrån, rad framför | Godkänd. |

### Expert B

| Id | Facit | Hål i facit | Distraktorer | Beslut |
|---|---|---|---|---|
| sp-e-b-41 | B | 6 | utelämnad, fel ordning, fel axel | **Stryk.** Facit stämmer, nivån stämmer inte, se punkt 4. |
| sp-e-b-42 | C | 6 | fel ordning, utelämnad, fel axel | **Stryk.** Facit stämmer, nivån stämmer inte, se punkt 4. |
| sp-e-b-43 | C | 6 | utelämnad, fel ordning, fel axel | **Stryk.** Facit stämmer, nivån stämmer inte, se punkt 4. |
| sp-e-b-44 | D | 6 | utelämnad, fel axel, fel ordning | **Stryk.** Facit stämmer, nivån stämmer inte, se punkt 4. |
| sp-e-b-45 | A | 6 | en fel plats, utelämnad, fel axel | **Stryk.** Facit stämmer, nivån stämmer inte, se punkt 4. |
| sp-e-b-46 | B | 6 | utelämnad, fel axel, bara sista | **Stryk.** Facit stämmer, nivån stämmer inte, se punkt 4. |
| sp-e-b-47 | A | 6 | utelämnad, fel ordning, fel axel | **Stryk.** Facit stämmer, nivån stämmer inte, se punkt 4. |
| sp-e-b-48 | A | 6 | en fel plats, utelämnad, fel axel | **Stryk.** Facit stämmer, nivån stämmer inte, se punkt 4. |
| sp-e-b-49 | B | 6 | fel ordning, fel axel, utelämnad | **Stryk.** Facit stämmer, nivån stämmer inte, se punkt 4. |
| sp-e-b-50 | D | 6 | utelämnad, fel axel, fel ordning | **Stryk.** Facit stämmer, nivån stämmer inte, se punkt 4. |

## Aktivering, i samma commit

1. Stryk sp-e-b-41 till sp-e-b-50 ur version 5. Enklast är `"pensionerad_fran": 5` på de tio raderna i bankExpert.json: de visas aldrig, och id:na går ändå att slå upp. Att ta bort raderna går också, eftersom ingen session har sett dem. Inga andra rader ändras.
2. Underlagets steg 1 och 2 (`SPATIAL_VERSION = 5`, kommentaren i select.ts, `version5.test.ts` och `version4.test.ts`). Expertpoolen i version 5 blir 186, inte 196. I `version5.test.ts` räknar rad 59 de nya per nivå och behöver filtrera bort pensionerade. Tas raderna bort i stället blir de nya 90, och då berörs också raderna 39, 52 och 246 om `tva_vik`. Kommentaren i select.ts ska inte nämna "B två vikningar på expert".
3. Namnbytet i punkt 5, med villkoret om uppgiftsrubrikerna.
4. Kör `node scripts/spatial-verifiera.mjs`, `node scripts/validate-spatial.mjs`, `npx vitest run src/lib/spatialV1 src/lib/tester/steg2 --exclude ".claude/**"` och `npx tsc --noEmit -p .`. Klicktesta sedan ett nivåtest med en kropp, ett snitt och en spegling i riktig webbläsare (Pixel 7 och desktop) innan det kallas klart, och titta då också på genomgångens lista och "Var du tappar".
5. Kör aldrig `scripts/gen-spatial.mjs` på bankerna.

## Metodanmärkning till nästa omgång

- Rotera facits plats i generatorn.
- Ge en del kroppar ett andra spegelpar bland distraktorerna (punkt 4).
- En ny B-variant på expert ska vara svårare än det avancerad redan har. Jämför med avancerads former före genereringen, inte efter.

Aktivering: ja efter strykningarna: sp-e-b-41, sp-e-b-42, sp-e-b-43, sp-e-b-44, sp-e-b-45, sp-e-b-46, sp-e-b-47, sp-e-b-48, sp-e-b-49, sp-e-b-50
