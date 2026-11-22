# Brief: omskrivning av `rotation-test-guide` mot "spatial förmåga"

Skriven 2026-11-22 av SEO. Steg 1 i kedjan SEO, copywriter, saas-lead. Copywritern skriver efter den här briefen utan att fråga; det som är öppet för saas-lead står i avsnitt 6 och 9.

Artikeln: `content/artiklar/rotation-test-guide.mdx`, live på https://www.jobbcoach.ai/artiklar/rotation-test-guide. Slug och adress ändras inte.

---

## 0. Det viktigaste först

1. **seoTitle och description bytte redan till "spatial förmåga" den 9 november** (commit `38a28b29`, "U1"). Det som inte ändrades då är H1 (`title`), ingressen och snabbsvaret, som fortfarande handlar om rotationstest. Den här omskrivningen tar resten: H1, snabbsvar, ingress, två nya avsnitt och ett nytt FAQ-svar. Allt annat står kvar.
2. **745 visningar är inte en stadig volym.** Sidans visningar per dag (Search Console, sidfilter, `dataState: all`):

| Period | Visningar per dag på sidan | "spatial förmåga" per dag |
|---|---|---|
| 23 okt till 9 nov | 13 till 42 | 2 till 21, position 7 till 11 |
| 10 till 13 nov | 241, 234, 216, 151 | 146, 148, 127, 99, position 9,4 till 9,6 |
| 14 till 21 nov | 0 till 8 | 5 visningar totalt på åtta dagar, position 9,8 |

Ungefär 840 av sidans 1 742 visningar på 90 dagar kom under fyra dagar. Positionen låg still under toppen (9,4 till 9,6), så toppen ser ut som en tillfällig ökning i efterfrågan, inte en rankingförändring. **Bedömning, utan belägg:** någon händelse utanför oss (nyheter, skola, tv) fick många att söka på ordet de dagarna. Efter 14 november syns sidan nästan inte alls, och det är lägre än nivån före toppen. Indexeringen är i ordning: URL-inspektionen 2026-11-22 säger "Angiven och indexerad", Googles kanoniska adress är vår egen, senaste genomsökning 2026-11-18. Vi vet alltså inte varför visningarna föll efter 14 november. Omskrivningen är rätt ändå, men förväntningen ska vara den stadiga nivån före toppen (ungefär 5 till 15 visningar om dagen på huvudordet), inte 745 på 90 dagar.
3. **Klickfrekvensen är problemet, inte positionen.** "spatial förmåga" gav 1 klick på 742 visningar på position 9,4, "vad är spatial förmåga" 2 klick på 106 på position 7,0. Frågorna är definitionsfrågor ("vad är", "betyder", "hög spatial förmåga"). Rubriken och första stycket i dag svarar på en annan fråga: hur man klarar ett rotationstest. Det är den skillnaden vi rättar.

---

## 1. Målord och sökavsikt

Search Console, sidfilter `/artiklar/rotation-test-guide`. 90 dagar = 2026-08-23 till 2026-11-20, 28 dagar = 2026-10-24 till 2026-11-20. Hämtat 2026-11-22. Ingen annan sida på sajten får visningar på något av orden (kontrollerat med mönster på sökfrågan över alla sidor).

| Sökfråga | 90 d: klick, visn, pos | 28 d: klick, visn, pos | Roll |
|---|---|---|---|
| spatial förmåga | 1, 742, 9,4 | 1, 678, 9,4 | **Huvudord** |
| vad är spatial förmåga | 2, 106, 7,0 | 2, 105, 6,9 | Huvudord (frågeform) |
| hög spatial förmåga | 0, 58, 9,1 | 0, 58, 9,1 | Stödord, eget avsnitt |
| spatial förmåga test | 0, 24, 9,0 | 0, 23, 8,9 | Stödord |
| spatial förmåga övningar | 0, 14, 10,9 | 0, 7, 10,0 | Stödord, ny H3 |
| spatiala förmåga | 1, 12, 10,9 | 0, 5, 13,6 | Böjning, i löptext |
| spatialförmåga | 0, 10, 9,9 | 0, 9, 9,8 | Stavning, en gång i löptext |
| rotationstest | 0, 10, 1,6 | 0, 3, 3,0 | Står kvar (position 1,6) |
| spatial förmåga betyder | 0, 6, 10,2 | 0, 6, 10,2 | Definition |
| vad är spatial | 0, 5, 9,8 | 0, 5, 9,8 | Definition |
| visuospatial förmåga test | 0, 5, 7,6 | 0, 4, 5,8 | En mening i definitionen |
| spatiala tester | 0, 3, 2,3 | | Står kvar |
| vad betyder / vad innebär spatial förmåga | 0, 2 + 2, 7,0 | samma | Definition |
| rumsuppfattning | 0, 1, 2,0 | 0, 1, 2,0 | Står kvar (FAQ) |
| spatial förmåga adhd | 0, 1, 5,0 | | **Tas inte upp** (hälsa, en visning) |

Hela sidan: 39 klick, 1 742 visningar, position 8,0 på 90 dagar.

**Sökavsikten:** blandad, med tyngdpunkt på definition. De som skriver "spatial förmåga" och "vad är spatial förmåga" vill först veta vad ordet betyder, sedan om de har den och hur den testas. "hög spatial förmåga" (58) är en fråga om vad det innebär att ha mycket av den. Test- och övningsorden ("test", "övningar") är mindre men är de som leder till produkten. Ordningen i artikeln blir därför: definition, vad hög förmåga innebär, hur den testas, sedan allt som finns i dag om uppgifterna.

**Vad som rankar i dag (bedömning, begränsat underlag):** vår sökning gav bara engelska källor (Wikipedia "Spatial ability", EBSCO, psychologyfanatic.com) eftersom sökverktyget söker från USA. De svenska källorna vi själva redan citerar, psykologi.se:s psykologilexikon och neurobics.se, är sannolikt med i det svenska resultatet; det har vi inte kunnat se. Ingen konkurrent har kunnat mätas på ordantal. Vår artikel har 5 515 ord i `main` och är redan längre än någon definitionssida, så längden är inte problemet. Det är vad som står först.

## 2. Metadata och frontmatter

| Fält | I dag | Nytt | Tecken |
|---|---|---|---|
| `title` (H1, OG, BlogPosting, brödsmula) | Rotationstest och spatial förmåga: så löser du figurer som vridits | **Spatial förmåga: vad det är, hur rotationstest mäter den och hur du tränar upp den** | 82 (får vara långt) |
| `seoTitle` | Spatial förmåga: vad det är och test att öva gratis (51) | **Spatial förmåga: vad det är, exempel och gratis test** | 52 |
| `description` | Spatial förmåga test med lösta uppgifter: vridna och speglade figurer, pappersvikning, tärningar och kroppar av kuber. Så tränar du upp förmågan gratis. | **Spatial förmåga är att vrida, vika och vända former i huvudet. Så märks hög spatial förmåga, så testas den och här löser du uppgifter med facit.** | 144 |
| `updated` | 2026-11-19 | dagen för push | |
| `date`, `author`, `image`, `imageAlt` | | **orörda** | |
| `tags` | tio taggar | **orörda, exakt samma lista och ordning** | |

Skäl för taggarna: varje tagg är en länk `/artiklar?tag=...` i artikeln, och författaren (Linda Eriksson, h3 i rubrikträdet) väljs ur taggarna i `src/lib/authors.ts`. En borttagen tagg fäller grinden på länkar, en ny kan byta författare och därmed rubrikträd och porträtt. Lägg inte till "hög spatial förmåga" som tagg; ordet bärs av rubriken.

Skäl för seoTitle: "exempel" lovar det sidan har (fem lösta uppgifter, två övningar) och passar definitionsavsikten bättre än "test att öva". "gratis test" är sant: provet i spatial förmåga på sidan kräver inget konto. Vi byter seoTitle bara 13 dagar efter förra bytet, vilket gör mätningen mindre ren; det tar vi, eftersom klickfrekvensen är 0,1 procent.

**howto:** nej. Artikeln är ingen stegguide mot ett resultat.

**FAQ:** sex frågor står kvar ordagrant, en ny läggs till sist (avsnitt 3.6). Sju frågor är en avvikelse från standardens fem till sex; vi tar den eftersom ingen befintlig fråga får strykas och "hög spatial förmåga" är det tredje största ordet.

## 3. Dispositionen

Ordmål: artikeln växer med cirka 450 till 600 ord. Inget stycke stryks. Grinden fäller om rubrikträdet ändras utöver raderna i avsnitt 8, så rubrikerna nedan är exakta.

### 3.1 Snabbsvaret (JSX-rutan direkt efter bilden), skrivs om

- **Rubrik ny:** `Snabbsvar: vad är spatial förmåga?` (h2 i JSX, utan id, som i dag).
- **Innehåll, 70 till 90 ord:** svaret på huvudfrågan i första meningen. Spatial förmåga, på svenska rumsuppfattning, är förmågan att uppfatta former och rum och att i huvudet vrida, vika och flytta dem. Sedan: att den mäts i rekryteringstest och I-provet med vridna figurer, pappersvikning och tärningar; att den går att träna upp (Uttal m.fl. 2013); att hög spatial förmåga märks i yrken med ritningar, modeller och rum.
- **Dagens snabbsvarstext flyttas ordagrant**, inte stryks: meningen "Lås blicken vid en unik, asymmetrisk detalj ..." och resten av stycket blir första stycket under H2 "Tekniken som löser uppgifterna snabbt" (3.10), inlett med en kort mening, till exempel "Kortversionen först:".

### 3.2 Ingressen (mellan snabbsvaret och H2 "Vad är spatial förmåga?"), skrivs om och byggs ut

I dag börjar artikeln i en rotationsuppgift. Ny ordning, 150 till 200 ord:

1. Ny första mening som säger vad spatial förmåga är, i vardagsord, med ett konkret exempel (packa bilens bagageutrymme, läsa en karta upp och ned, se hur en platt kartong blir en låda). Ordet "spatial förmåga" i första meningen, "spatialförmåga" eller "spatiala förmåga" en gång i stycket.
2. En mening om vad artikeln ger: definitionen, vad hög spatial förmåga innebär, hur förmågan testas och fem uppgifter med lösning.
3. **Dagens två ingresstycken står sedan kvar ordagrant**, i samma ordning ("Du ser en figur till vänster ..." och "Spatial förmåga går att träna upp. En metaanalys av 217 studier ..."). De bär "rotationstest" (position 1,6) och Uttal-källan.
4. **`<TypProvKort typ="spatial" ersatterProvkort />` står inte längre här** (SEO:s slutbesked 11.1). Det flyttas till "Så tränar du", se 3.6. Efter ingressen kommer direkt H2 "Vad är spatial förmåga?".

### 3.3 H2 "Vad är spatial förmåga?" står kvar, byggs ut

Rubriken orörd (id `vad-ar-spatial-formaga`). Allt som står där i dag står kvar, också de två övningarna med facit. Läggs till efter punktlistan med de fyra delarna, 80 till 120 ord:

- En mening om att **visuospatial förmåga** är ett närliggande ord som ofta används i vård och neuropsykologi om samma sak, med visuell perception i fokus. Bara om källan säger det; psykologilexikonets sida eller en annan svensk källa ska bära meningen, annars stryks den.
- "Vad betyder spatial?" i en mening: spatial betyder rumslig, från latinets spatium, rum. **Kontrollera mot SAOB eller Svensk ordbok före publicering**; går det inte att belägga skrivs bara "spatial betyder rumslig".

### 3.4 Ny H2 "Vad innebär hög spatial förmåga?" (direkt efter 3.3, före `<ArtikelProv>`)

Nytt avsnitt, 250 till 350 ord. Svarar på "hög spatial förmåga" (58 v).

- Första meningen svarar: att ha hög spatial förmåga betyder att du snabbt och säkert kan hålla en form i huvudet och se hur den ser ut vriden, vikt eller från ett annat håll.
- Hur det märks i vardag och arbete: ritningar, montering, kartor, att uppskatta om något får plats. Meningen om yrken som redan står i "Vad är spatial förmåga?" ("Hög spatial förmåga märks i yrken ...") står kvar där den står och upprepas inte här; hänvisa i stället vidare till H2 "Vilka yrken kräver spatial förmåga?".
- Hur ett test visar det: snabbhet och träffsäkerhet på uppgifter som blir svårare. Vårt test har tre nivåer; säg att en hög nivå i ett test är ett mått på hur du löste just de uppgifterna, inte en diagnos.
- Att låg spatial förmåga inte är ett hinder för de flesta jobb och att förmågan går att träna (Uttal 2013).
- **Inte med:** ADHD, dyslexi, autism, kön, ålder eller andra grupper. Vi har ingen källa vi har läst och det är hälsonära.
- Källor: bara det som står i psykologilexikonet (psykologi.se), Uttal m.fl. 2013 och Shepard och Metzler 1971, som redan finns i källraden. Varje påstående om vad hög förmåga "innebär" utöver det skrivs som vår beskrivning av testet, inte som forskning.

### 3.5 Befintliga H2, orörda rubriker och text

I den här ordningen, alla med samma text och id som i dag:

- "Vad rotationstest mäter"
- "Så fungerar uppgifterna"
- "Vanliga uppgiftstyper du kan möta"
- "Den vanligaste fällan: rotation mot spegling"
- "Spegling i två linjer"
- "2D mot 3D: två svårighetsnivåer"
- "Pappersvikning med hål och klipp"
- "Tärningar: samma tärning eller inte?"
- "Kroppar av kuber: vyn från pilen och snittet"
- "Tekniken som löser uppgifterna snabbt" (får dagens snabbsvar som första stycke, se 3.1)

Två rättningar i löptexten, inga rubriker:

- I "Vanliga uppgiftstyper du kan möta", sista stycket: meningen om matrislogiken får stå, men lägg till att provet i spatial förmåga finns utan konto på sidan (`<ArtikelProv>`).
- Se 3.6 om "prova våra matrisfrågor".

### 3.6 H2 "Så tränar du" står kvar, ny H3 "Övningar för spatial förmåga i vardagen"

Rubriken orörd. Hela dagens text står kvar. Ordningen i avsnittet blir (SEO:s slutbesked 11.1):

1. Dagens inledande stycke och de fyra fetstilta råden, orörda.
2. Stycket "Testet i spatial förmåga hos oss har tre nivåer ...", med de två rättningarna nedan.
3. `<TypProvKort typ="spatial" ersatterProvkort />`, flyttat hit från platsen efter ingressen.
4. **Ny H3 sist i avsnittet**, efter provkortet och före H2 "Vanliga misstag": `### Övningar för spatial förmåga i vardagen`, 150 till 220 ord. Svarar på "spatial förmåga övningar". H3:n står sist så att produktstycket och provkortet inte hamnar under en rubrik om vardagsövningar.

- Tre till fem konkreta övningar som man gör utan test: vrida tärningen i huvudet (som övning 1), skissa en kartong utvikt och hopvikt, vika ett papper, stansa ett hål och gissa mönstret innan man vecklar upp, beskriva vägen hem med väderstreck, bygga en figur av klossar och rita den från tre håll.
- Uttal m.fl. 2013 tog upp flera sorters träning (bland annat datorspel, kurser och träning på spatiala uppgifter). **Kontrollera mot sammanfattningen på doi.org/10.1037/a0028446 före publicering**, och skriv bara de kategorier som står där.
- Ingen övning får lova en effekt som källan inte ger.

**Rättning 1 i produktstycket (punkt 2 ovan):** "Grundnivån är gratis med konto, ett test om dagen." blir **"Grundnivån är gratis med konto, ett grundnivåtest om dagen i valfri testtyp."** (SEO:s slutbesked 11.3).

**Rättning 2 i samma stycke:** "Vill du känna på formatet utan konto kan du [prova våra matrisfrågor](/verktyg/rekryteringstester/prova), där flera uppgifter bygger på att figurer vrids och speglas" stämmer inte längre, eftersom provet i spatial förmåga finns utan konto sedan 21 november. Ny lydelse ungefär: "Vill du känna på formatet utan konto gör du [provet i spatial förmåga](/verktyg/rekryteringstester/prova?typ=spatial), fem uppgifter utan tidtagning, och ser rätt och fel direkt." **Länken `/verktyg/rekryteringstester/prova` måste stå kvar någonstans i artikeln** (grinden: inga länkmål får försvinna). Den står i dag också i listan "Mer om rekryteringstester" och i reklamkorten; byggaren kontrollerar i efter-avtrycket att den finns kvar.

### 3.7 Övriga befintliga H2, orörda

- "Vanliga misstag"
- "Vilka yrken kräver spatial förmåga?"
- "Testet är en del av helheten"
- FAQ-blocket "Vanliga Frågor (FAQ)" (rubriken kommer ur `FAQContainer`)

### 3.8 FAQ

Frågorna nedan står kvar **ordagrant**, i frontmatter och som `<FAQItem>`:

1. Vad är ett rotationstest?
2. Vad mäter spatial förmåga och varför testas den?
3. Kan man träna upp sin spatiala förmåga?
4. Hur skiljer jag en roterad figur från en spegelvänd?
5. Var kan jag öva på rotationstest gratis?
6. Är rumsuppfattning och spatial förmåga samma sak?

Svar som skrivs om:

- **Fråga 5:** frågan står kvar ordagrant, svaret byts mot den exakta lydelsen i 11.3 (bland annat "ett test om dagen" blir "ett grundnivåtest om dagen i valfri testtyp"). Svaret ska vara identiskt i frontmatter och i `<FAQItem>`.

Ny fråga, sist, i frontmatter och som `<FAQItem>`:

7. **"Vad innebär det att ha hög spatial förmåga?"** Svar 50 till 80 ord, samma kärna som första stycket i 3.4.

## 4. Fakta som måste med, med källa

### Om förmågan

| Påstående | Källa | Status |
|---|---|---|
| Spatial förmåga delas i visuell perception, mental rotation, spatial visualisering och spatial orientering | psykologi.se, psykologilexikon | står redan i artikeln |
| Arkitekter, kirurger och piloter som exempel | samma | står redan |
| Träning ger effekt som består (217 studier) | Uttal m.fl. 2013, Psychological Bulletin | står redan |
| Svarstiden ökar med rotationsvinkeln | Shepard och Metzler 1971 | står redan |
| Tre av sex deltester i I-provet är spatiala | Plikt- och prövningsverket, Testa I-provet | står redan |
| "Rumsuppfattning" är myndighetens ord i I-provet | samma | står redan |
| Visuospatial förmåga | ska beläggas, annars stryks meningen | **öppen** |
| "spatial" = rumslig | ordbok, ska beläggas | **öppen** |
| Träningsformerna i Uttal 2013 | abstract, ska läsas | **öppen** |

### Om produkten (kontrollerat i koden 2026-11-22)

- Testtypen heter **Spatial förmåga** och finns i tre nivåer: grundnivå, avancerad och expert, **15 uppgifter** vardera, **12, 15 och 18 minuter** (`src/app/dashboard/tester/testConfig.ts`, steg 2).
- Uppgiftstyper enligt nivåbeskrivningarna: vriden figur, pappersvikning åt båda hållen, tärningar; svårare nivåer med större figurer, fler vikningar och speglingar som liknar vridningar. Kroppar av kuber står i artikeln i dag och i provtexten (`src/lib/tests/prov-typer.ts`: "vridna och speglade figurer, pappersvikning, tärningar och kroppar av kuber"). Använd provtextens uppräkning.
- **Grundnivån är gratis med konto: ett grundnivåtest om dagen, valfri testtyp**, samma kvot för alla åtta testtyper (`src/lib/quota/quotaService.ts`, `GRUND_TEST_TYPER`). Avancerad och expert ingår i Premium. Skriv inte "ett test i spatial förmåga om dagen"; det är ett grundnivåtest om dagen totalt.
- **Provet utan konto:** fem uppgifter, inget konto, ingen tidtagning, adress `/verktyg/rekryteringstester/prova?typ=spatial`; komponenten `<ArtikelProv typ="spatial" />` står redan i artikeln.
- Efter testet går man igenom varje uppgift med förklaringen.
- Skriv inte "AI", "AI-test" eller liknande. Inga priser i artikeln.

## 5. Interna länkar

**In till artikeln (nya eller förstärkta ankare):**

| Från | Plats | Ankartext |
|---|---|---|
| `/artiklar/i-prov` | avsnittet om pappersvikning eller tärningar, där rumsuppfattning nämns | "vad spatial förmåga är" |
| `/artiklar/logiska-tester` | där spatiala test räknas upp (länken finns, byt ankartexten om den säger rotationstest) | "spatial förmåga" |
| `/artiklar/arbetspsykologiska-tester` | samma | "test i spatial förmåga" |
| `/verktyg/rekryteringstester` | kortet eller FAQ-svaret om spatial förmåga | "vad spatial förmåga är och hur den testas" |

Ankartexter i andra artiklar ändrar bara löptext, inga rubriker. Varje rörd artikel kräver `LD_UNDANTAG` med `andrade: ["BlogPosting"]` (ordantalet ändras) och tas med i avtrycket före och efter. Verktygssidan är en hård sida: ny länk är tillåten, ingen rubrik eller FAQ-fråga får ändras.

**Ut från artikeln:** alla länkar som finns i dag står kvar. Nya:

- `/verktyg/rekryteringstester/prova?typ=spatial`, i 3.6 och FAQ 5.
- `/artiklar/i-prov` finns redan två gånger; inget nytt.

## 6. Produkten i artikeln (avgjort, se 10 och 11)

- **Hjälteknappen** överst öppnar provet i spatial förmåga, `/verktyg/rekryteringstester/prova?typ=spatial` (11.2).
- **`<ArtikelProv typ="spatial" />`** står efter den nya H2 "Vad innebär hög spatial förmåga?", som i dag efter definitionen.
- **Handlingen sist i 3.4**, i löptext, saas-leads lydelse: i stil med "Vill du pröva själv: fem uppgifter nedan, utan konto och utan tidtagning, och du ser direkt vilka du fick rätt på." Inte "se var du ligger" eller "din nivå": provet visar rätt och fel, ingen nivå.
- **`<TypProvKort typ="spatial" ersatterProvkort />`** flyttas till "Så tränar du", direkt efter produktstycket (3.6, 11.1). Det får aldrig ligga direkt före eller efter `<ArtikelProv>`.
- Avslutningen orörd: länken till rekryteringstesterna och listan "Mer om rekryteringstester" står kvar.

## 7. Bilden

**Ingen ny bild.** `rotation-test-guide-v2.webp` med `imageAlt` "Uppgift i spatial förmåga steg för steg med tom ruta, bredvid tre tekniker för rotationstest" står kvar. Den visar en uppgift ur testet, är ny sedan 15 november och ett byte kräver `BILD_BYTT` och en ny bild genom `scripts/artikelbild/`. Bilden är inte skälet till låg klickfrekvens.

Om saas-lead eller art-director ändå vill ha en ny bild senare: motiv en tärning eller en vriden figur med etiketten "Spatial förmåga", filnamn `rotation-test-guide-v3.webp`, rader ordagrant ur artikeln.

## 8. Rubriker före och efter, det som står kvar, och grindens undantag

### 8.1 Tabell

| Del | I dag | Efter | Ändring |
|---|---|---|---|
| title / H1 | Rotationstest och spatial förmåga: så löser du figurer som vridits | Spatial förmåga: vad det är, hur rotationstest mäter den och hur du tränar upp den | ny |
| seoTitle | Spatial förmåga: vad det är och test att öva gratis | Spatial förmåga: vad det är, exempel och gratis test | ny |
| description | Spatial förmåga test med lösta uppgifter ... | Spatial förmåga är att vrida, vika och vända former i huvudet ... | ny |
| h3 (författaren) | Linda Eriksson | Linda Eriksson | orörd (taggarna orörda) |
| h2 snabbsvar | Snabbsvar: hur klarar man ett rotationstest? | Snabbsvar: vad är spatial förmåga? | ny, texten flyttas |
| ingress | två stycken | ny mening först, de två styckena kvar ordagrant | utbyggd |
| h2 | Vad är spatial förmåga? | samma | orörd rubrik, text utbyggd |
| h2 | (finns inte) | Vad innebär hög spatial förmåga? | ny |
| h2 | Vad rotationstest mäter | samma | orörd |
| h2 | Så fungerar uppgifterna | samma | orörd |
| h2 | Vanliga uppgiftstyper du kan möta | samma | orörd, en mening tillagd |
| h2 | Den vanligaste fällan: rotation mot spegling | samma | orörd |
| h2 | Spegling i två linjer | samma | orörd |
| h2 | 2D mot 3D: två svårighetsnivåer | samma | orörd |
| h2 | Pappersvikning med hål och klipp | samma | orörd |
| h2 | Tärningar: samma tärning eller inte? | samma | orörd |
| h2 | Kroppar av kuber: vyn från pilen och snittet | samma | orörd |
| h2 | Tekniken som löser uppgifterna snabbt | samma | orörd, får snabbsvarets gamla text först |
| h2 | Så tränar du | samma | orörd |
| h3 | (finns inte) | Övningar för spatial förmåga i vardagen | ny |
| h2 | Vanliga misstag | samma | orörd |
| h2 | Vilka yrken kräver spatial förmåga? | samma | orörd |
| h2 | Testet är en del av helheten | samma | orörd |
| h2 | Vanliga Frågor (FAQ) | samma | orörd |
| FAQ 1 till 6 | se 3.8 | samma frågor ordagrant | svar 5 ändrat |
| FAQ 7 | (finns inte) | Vad innebär det att ha hög spatial förmåga? | ny |

### 8.2 Det som står kvar ordagrant, fråga för fråga

| Sökfråga (90 d) | Det som bär frågan i dag | Krav |
|---|---|---|
| spatial förmåga (742) | seoTitle och description börjar på ordet; H2 "Vad är spatial förmåga?"; ordet i första ingresstycket | H2 orörd; ordet först i nya H1, nya seoTitle, nya description och nya snabbsvaret |
| vad är spatial förmåga (106) | H2 "Vad är spatial förmåga?" | **rubriken ordagrant**, hela dagens avsnittstext kvar |
| hög spatial förmåga (58) | meningen "Hög spatial förmåga märks i yrken där man arbetar med ritningar, modeller och rum." | **meningen ordagrant kvar**; ny H2 och ny FAQ förstärker |
| spatial förmåga test (24) | dagens description börjar "Spatial förmåga test"; taggen "spatial förmåga test" | taggen kvar; "test" står i nya seoTitle; ordföljden "spatial förmåga test" en gång i löptext |
| spatial förmåga övningar (14) | "De övningar för spatial förmåga som lönar sig bäst ..." i "Så tränar du" | **meningen ordagrant kvar**; ny H3 förstärker |
| rotationstest (10, pos 1,6) | H2 "Vad rotationstest mäter", FAQ "Vad är ett rotationstest?", ingressens rotationsstycke, taggen | **allt kvar ordagrant**; ordet finns också kvar i nya H1 |
| spatiala tester (3, pos 2,3) | "Rotationstest är den vanligaste formen av spatialt test" | meningen kvar |
| rumsuppfattning (1, pos 2,0) | FAQ "Är rumsuppfattning och spatial förmåga samma sak?" | frågan ordagrant |

### 8.3 Undantagsraderna för grinden

Ny fil `scripts/seo-baslinje/spatial-formaga-2026-11-22-undantag.json` (grinden läser alla `*-undantag.json` av sig själv). Ta en ny baslinje mot live för artikeln och de rörda artiklarna innan bygget, och kör jämförelsen mot den. Om copywriterns slutliga rubriktexter avviker från briefen ska raderna följa texten exakt; kontrollera id:na i efter-avtrycket (id:t bildas av rubriktexten, som `vad-ar-spatial-formaga`).

```json
{
  "_om": "Omskrivning av rotation-test-guide mot spatial förmåga (SEO-brief docs/artiklar-2026-11/brief-spatial-formaga.md, 2026-11-22): H1, seoTitle, description, snabbsvarets rubrik, två nya rubriker och en ny FAQ-fråga. Övriga rubriker, frågor, taggar, bild och länkar orörda. Läses av scripts/seo-diff-artiklar.ts.",
  "META_BYTT": [
    { "path": "/artiklar/rotation-test-guide", "falt": "title", "datum": "2026-11-22", "skal": "seoTitle Spatial förmåga: vad det är, exempel och gratis test. Sökfrågorna är definitionsfrågor och klickfrekvensen var 0,1 procent (1 klick på 742 visningar, position 9,4, 90 dagar)." },
    { "path": "/artiklar/rotation-test-guide", "falt": "description", "datum": "2026-11-22", "skal": "Description som svarar på vad spatial förmåga är och nämner hög spatial förmåga (58 visningar, 90 dagar)." }
  ],
  "H1_BYTT": [
    { "path": "/artiklar/rotation-test-guide", "fore": "Rotationstest och spatial förmåga: så löser du figurer som vridits", "efter": "Spatial förmåga: vad det är, hur rotationstest mäter den och hur du tränar upp den", "datum": "2026-11-22", "skal": "H1 med huvudordet spatial förmåga först (742 och 106 visningar på 90 dagar); rotationstest står kvar i H1 och i H2 Vad rotationstest mäter." }
  ],
  "RUBRIK_NY": [
    { "path": "/artiklar/rotation-test-guide", "rubrik": "h2# Snabbsvar: hur klarar man ett rotationstest?", "datum": "2026-11-22", "skal": "Snabbsvarets rubrik byts (artiklarnas rubrikträd har ingen RUBRIK_BYTT, så den gamla och den nya står båda här). Texten flyttas ordagrant till H2 Tekniken som löser uppgifterna snabbt." },
    { "path": "/artiklar/rotation-test-guide", "rubrik": "h2# Snabbsvar: vad är spatial förmåga?", "datum": "2026-11-22", "skal": "Nytt snabbsvar som svarar på huvudfrågan vad är spatial förmåga." },
    { "path": "/artiklar/rotation-test-guide", "rubrik": "h2#vad-innebar-hog-spatial-formaga Vad innebär hög spatial förmåga?", "datum": "2026-11-22", "skal": "Nytt avsnitt för sökfrågan hög spatial förmåga (58 visningar, position 9,1, 90 dagar). Befintliga rubriker orörda och i samma ordning." },
    { "path": "/artiklar/rotation-test-guide", "rubrik": "h3#ovningar-for-spatial-formaga-i-vardagen Övningar för spatial förmåga i vardagen", "datum": "2026-11-22", "skal": "Ny H3 under Så tränar du för sökfrågan spatial förmåga övningar (14 visningar, position 10,9, 90 dagar)." }
  ],
  "LD_UNDANTAG": [
    { "path": "/artiklar/rotation-test-guide", "datum": "2026-11-22", "skal": "BlogPosting följer ny headline, description, wordCount och nya avsnitt; BreadcrumbList följer ny title; FAQPage får ett nytt svar på fråga 5 (provet utan konto, ett grundnivåtest om dagen i valfri testtyp) och en ny sjunde fråga. Frågorna 1 till 6 oförändrade.", "andrade": ["BlogPosting", "BreadcrumbList", "FAQPage"] }
  ]
}
```

Om snabbsvarets h2 i efter-avtrycket får ett id (det har det inte i dag) ska raden skrivas med det id:t. Får innehållsförteckningen nya ankarlänkar är det tillåtet (nya länkar fäller inte). Tar Läs vidare-korten bort en artikel som syns i dag behövs en `LANK_BORTA`-rad med skälet att korten väljs automatiskt; skriv den bara om grinden visar det.

## 9. Det jag är osäker på

1. **Varför visningarna föll efter 14 november.** Indexeringen är i ordning och positionen när sidan väl visas är densamma (9,8). Det kan vara att efterfrågan var tillfälligt hög 10 till 13 november och att Google sedan visar sidan för färre varianter, men det är en gissning. Vi följer upp 28 dagar efter push: om "spatial förmåga" och "vad är spatial förmåga" inte är tillbaka på minst nivån före toppen (cirka 5 till 15 visningar om dagen) går frågan till saas-lead och ägaren.
2. **Svenska konkurrenter.** Vi har inte kunnat se det svenska sökresultatet. Bedömningen att det domineras av definitionssidor (lexikon, Wikipedia, träningssajter) är inte belagd.
3. **Visuospatial och ordbokens definition av "spatial".** Står bara med om copywritern hittar källan.
4. **Sju FAQ-frågor** är en avvikelse från standarden. Saas-lead får säga emot; i så fall bärs "hög spatial förmåga" bara av H2.
5. **Kroppar av kuber på alla nivåer?** Nivåbeskrivningarna i `testConfig.ts` nämner inte kropparna, men provtexten och artikeln gör det. Copywritern skriver uppräkningen som provtexten, utan att säga vilken nivå som har vad.

---

## 10. Saas-leads besked (2026-11-22)

Underlag: koden på main (2ca18b61, samma som live) och PostHog för sidan de senaste 30 dagarna: 29 `article_viewed`, 11 `article_cta_clicked` (6 av dem på hjälteknappen), 2 `sample_started`, 2 `signup_gate_shown`, 1 `signup_started`. Det är för lite för att avgöra placeringar med data, så besluten vilar på regeln att produkten visas som hjälp efter svaret, aldrig som avbrott före det.

**1. `<ArtikelProv typ="spatial" />`: enig med SEO.** Provet står efter den nya H2 "Vad innebär hög spatial förmåga?", inte efter snabbsvaret. Den som kom för definitionen får den först.

**2. Handlingen sist i 3.4: ny lydelse.** "Se var du ligger själv" lovar mer än provet ger: provet visar rätt och fel på fem uppgifter, ingen nivå. Copywritern skriver i stil med "Vill du pröva själv: fem uppgifter nedan, utan konto och utan tidtagning, och du ser direkt vilka du fick rätt på." Det står i löptext, ingen knapp.

**3. `<TypProvKort typ="spatial" ersatterProvkort />`: här går jag emot SEO.** Kortet flyttas från platsen efter ingressen till sist i H2 "Så tränar du", direkt efter stycket "Testet i spatial förmåga hos oss har tre nivåer ...", före H2 "Vanliga misstag".
- Skäl: kortet ber om ett konto ("Gör grundnivån i spatial förmåga", via kontot) innan läsaren har fått definitionen. Det är samma skäl som SEO själv ger för att inte lägga provet före definitionen, och det väger tyngre när handlingen är ett konto och inte ett prov utan konto. Den som vill agera direkt har hjälteknappen överst (punkt 4). Under "Så tränar du" har läsaren träningsavsikt, och stycket intill beskriver just de tre nivåerna kortet säljer.
- Ranking: kortet är en komponent utan rubrik, ingen text i artikeln ändras av flytten och inget länkmål försvinner (kortets länk följer med). `ersatterProvkort` fungerar oberoende av plats.
- Förslag SEO kan godta: ser SEO ändå en risk står kortet kvar där det står i dag. Det får aldrig ligga direkt före eller efter `<ArtikelProv>`, eftersom två prov i rad är ett avbrott.

**4. Beställning, S: hjälteknappen ska öppna rätt prov.** Klustret test ger hjälteknappen "Prova fem uppgifter gratis" till `/verktyg/rekryteringstester/prova`, alltså matrisprovet, på en sida om spatial förmåga. Det är sidans mest klickade knapp. Den ska gå till `/verktyg/rekryteringstester/prova?typ=spatial`. Texten är sann även då (provet har fem uppgifter).
- Var: `hjalteKnapp` i `src/components/publikt/innehall/artikel-kluster.ts` får artikelns provtyp, läst ur artikelns `<ArtikelProv typ>` i `src/app/(public)/artiklar/[slug]/page.tsx`.
- Grind: seo-diff körs på varje testartikel vars hjälteknapp ändras. Försvinner länkmålet `/verktyg/rekryteringstester/prova` ur någon artikel begränsas ändringen till `rotation-test-guide` i den här omgången, och resten tas i en egen omgång.

**5. Gratis och Premium i texten.** Det här gäller och står så i artikeln:
- Gratis utan konto: provet, fem uppgifter, utan tidtagning, med rätt och fel direkt.
- Gratis med konto: grundnivån, **ett grundnivåtest om dagen totalt, valfri testtyp** (`GRUND_TEST_TYPER` i `src/lib/quota/quotaService.ts`, där `spatial-grund` ingår), och genomgången av varje uppgift efteråt.
- Premium: avancerad och expert.
- Rättelse av briefen: 3.8 säger att FAQ 5 ska behålla "ett test om dagen", och samma ord står i stycket under "Så tränar du" (rad 287 i dag). Båda ställena skrivs om till "ett grundnivåtest om dagen, valfri testtyp". "Ett test om dagen" i en artikel om spatial förmåga läses som ett spatialt test om dagen, och det är fel. Frågan i FAQ 5 är kvar ordagrant, bara svaret ändras, vilket briefen redan tillåter.
- Inga priser i artikeltexten. Ordet AI används inte.

**6. Sju FAQ-frågor: enig.** Den sjunde frågan påverkar inte konverteringen och står för det tredje största ordet.

**7. Bilden: enig.** Ingen ny bild.

**8. Ingen ny komponent** behövs i den här artikeln. Provet och provkortet finns och fungerar.

**9. Mätning.** Från push: `sample_started`, `sample_completed`, `signup_gate_shown` och `signup_completed` från sidan, och `article_cta_clicked` på hjälteknappen till det spatiala provet. Läses tillsammans med SEO:s avläsning 28 dagar efter push. Avgörande tal: andelen besök som startar provet och andelen spärrar som blir konto, jämfört med de 30 dagarna före push.

## 11. SEO:s slutbesked (2026-11-22)

Gäller före allt annat i briefen. Där beskedet ändrar något högre upp är det redan ändrat där (3.2, 3.6, 3.8 och 6), så copywritern skriver efter briefen som den står.

### 11.1 Provkortet flyttas: godkänt

Jag godtar saas-leads flytt. `<TypProvKort typ="spatial" ersatterProvkort />` står i "Så tränar du", direkt efter stycket "Testet i spatial förmåga hos oss har tre nivåer ...", och den nya H3 "Övningar för spatial förmåga i vardagen" kommer efter kortet, sist i avsnittet (3.6).

Jag ser ingen risk för rankingen. Jag har kontrollerat följande mot grinden och koden:

- **Rubrikträdet:** kortet har inga h2 eller h3 och finns inte i dagens rubrikträd. Ordningen på rubrikerna ändras inte av flytten.
- **Länkmålen:** kortets länkar går via `viaKonto` till `/register?redirect=...`, som grinden inte räknar som länkmål. Ingenting försvinner, och samma länkar finns kvar längre ned på sidan.
- **Första bilden:** kortet har ingen bild. Artikelbilden (`CustomImage` med `priority`) är fortfarande det första i innehållet. Flytten nedåt gör det bara säkrare.
- **Ordantalet:** samma text, bara på en annan plats.
- **Läsarens ordning:** definitionen kommer först och kontot sist, som vi båda vill.

### 11.2 Hjälteknappen till provet i artikelns egen typ: godkänt, med villkor

Jag godtar beställningen för alla testartiklar, inte bara den här. Grinden kräver följande:

1. **Typen läses ur artikelns `<ArtikelProv typ>`.** Är typen `matris` behåller knappen exakt adressen i dag, `/verktyg/rekryteringstester/prova`, utan parameter. Annars blir adressen `/verktyg/rekryteringstester/prova?typ=<typ>`. Har artikeln redan en egen hjälteadress (till exempel med `fran=` eller `mitt_test=`) rörs den inte. Grinden jämför adresserna med frågesträngen, så `?typ=matris` hade varit ett nytt länkmål på tio artiklar och ett försvunnet på lika många.
2. **I den här artikeln behövs ingen undantagsrad.** Den enkla adressen `/verktyg/rekryteringstester/prova` står tre gånger i dag: i hjälteknappen, i löptexten under "Så tränar du" och i listan "Mer om rekryteringstester". Hjälteknappen byter adress och löptexten byter till `?typ=spatial` (3.6), men raden i listan "[Prova ett rekryteringstest utan konto](/verktyg/rekryteringstester/prova)" står kvar ordagrant och bär länkmålet. **Den raden får inte ändras i den här omgången.**
3. **Andra testartiklar.** Live-avtrycket `publikt-omgang3-efter-live-3.json` visar att den enkla adressen finns kvar på andra ställen i `aon-cut-e-test`, `deduktivt-induktivt-test`, `numeriskt-test-guide` och `verbalt-test-guide`. Där behövs ingen rad. I `cubiks-logiks-test` (numerisk), `ordforstaelse-test` (ordförråd) och `talserier` (talserie) står adressen bara en gång, troligen i hjälteknappen. I `i-prov` och `stanine-testresultat` (iprov) finns den enkla adressen bredvid adresser med `typ=iprov`. Där adressen försvinner behövs en `LANK_BORTA`-rad. Lägg bara in raden för de sidor där grinden faktiskt visar att adressen är borta. Raden ser ut så här:

```json
{
  "_om": "Hjälteknappen i testartiklarna öppnar provet i artikelns egen typ, läst ur ArtikelProv (saas-lead och SEO 2026-11-22, docs/artiklar-2026-11/brief-spatial-formaga.md avsnitt 10 och 11). Matrisartiklarnas adress är oförändrad.",
  "LANK_BORTA": [
    { "path": "/artiklar/talserier", "lank": "/verktyg/rekryteringstester/prova", "datum": "2026-11-22", "skal": "Hjälteknappen öppnade matrisprovet på en sida om talserier och går nu till provet i talserier (/verktyg/rekryteringstester/prova?typ=talserie). Samma prov utan konto, rätt typ." }
  ]
}
```

   Filnamnet är `scripts/seo-baslinje/hjalteknapp-provtyp-2026-11-22-undantag.json`. Lägg en rad per sida som grinden fäller, med samma skäl och sidans egen typ. Den nya adressen med `?typ=` är ett nytt länkmål, och nya länkmål fäller inte grinden.
4. **Kör grinden på alla 16 artiklar med `<ArtikelProv>`** före och efter. Det enda som får skilja är hjälteknappens adress. Varken ordantal, rubriker eller JSON-LD får ändras av den här ändringen. Ändras något mer begränsas ändringen till `rotation-test-guide`, som saas-lead föreslog.
5. **Knappens text** "Prova fem uppgifter gratis" är sann för alla typer utom `iprov`, där provet har sex uppgifter. Där ska knappens text antingen läsas ur provets antal eller lämnas orörd.

### 11.3 FAQ 5 och stycket under "Så tränar du": godkänt

Saas-lead har rätt i sak, och jag drar tillbaka kravet på att svaret ska stå kvar ordagrant. **Frågan** står kvar ordagrant. Det är bara svaret som byts. FAQ_BYTT behövs därför inte, eftersom den gäller frågetexten. Det som krävs är att FAQPage finns med i `LD_UNDANTAG`, och det gör den redan i 8.3 (`"andrade": ["BlogPosting", "BreadcrumbList", "FAQPage"]`). Ingen ny rad behövs.

**Exakt nytt svar på FAQ 5**, identiskt i frontmatter och i `<FAQItem>`:

> Hos oss. Utan konto gör du provet i spatial förmåga, fem uppgifter utan tidtagning, och ser direkt vilka du fick rätt på. Med konto finns testet i tre nivåer, grundnivå, avancerad och expert, med femton uppgifter vardera: vridna och speglade figurer, pappersvikning, tärningar och kroppar av kuber. Grundnivån är gratis, ett grundnivåtest om dagen i valfri testtyp, och efter testet går du igenom varje figur med förklaring. Avancerad och expert ingår i Premium. Spatial förmåga går att träna upp, så övningen lönar sig. Träna med timer så att du vänjer dig vid tempot utan att tappa noggrannheten.

**Exakt ny mening i produktstycket under "Så tränar du"**. I dag står "Grundnivån är gratis med konto, ett test om dagen." Den blir:

> Grundnivån är gratis med konto, ett grundnivåtest om dagen i valfri testtyp.

Skälet i raden `LD_UNDANTAG` i 8.3 är uppdaterat efter det här beskedet.

### 11.4 Övrigt i saas-leads besked

Jag är enig i punkterna 1, 2 och 5 till 9. Saas-leads mätning läses tillsammans med min avläsning 28 dagar efter push.
