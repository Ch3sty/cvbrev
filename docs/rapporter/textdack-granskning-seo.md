# SEO-granskning av textdäcket 2026-11-19

Granskat: docs/rapporter/textdack-2026-11-19.md, T4 till T7 och T10 noga, övriga avsnitt bara för undantagen i SEO-diffen. Måttstock: min rapport genomgang-seo-2026-11-19.md och on-page-standarden (seoTitle högst 60 tecken, description 110 till 158, faq-poster lika många som synliga FAQItem). Ägarens ramar: allt i ett svep före 23 nov, datalagringen rörs inte. Däcket och koden är orörda.

## Kontrollerat, gäller alla punkter

- **Längder:** rotation-test-guide seoTitle 51 (oförändrad), description 149. deduktivt-induktivt-test seoTitle 57, description 145. Alla inom gränserna.
- **FAQ och synlig text:** alla 18 berörda artiklar har lika många `faq:`-poster som `<FAQItem>`. Däcket byter varje FAQ-svar på båda ställena (frontmatter och FAQItem): alva 21/300, cubiks 20/158, deduktivt 21/250, matrigma 19/333, matrislogik 21/238, verifierade 23/101, rotation 21/316, vad-ar-en-jobbcoach 23/883.
- **Länkar:** ingen intern länk försvinner, *förutsatt* att Opus byter exakt den citerade delsträngen och inte hela raden. Raderna aon 344, arbetspsykologiska 368, logiktest-exempel 704, din-digitala 175, tester-hos-myndigheter 196 och matrigma 243 har länkar i meningar som däcket inte citerar. De ska stå kvar.
- **Rubriker:** rotation-test-guide har bara H2. Båda nya H2 hamnar mellan befintliga H2 och hierarkin håller. I deduktivt-induktivt-test följs ny H2 av fem H3, och sedan kommer nästa H2 ("Tre induktiva uppgifter med lösning"). Det håller också. Inga befintliga rubriker ändras.

## T4. Nivåkollen och första passet i 14 artiklar: godkänt med fyra ändringar

1. **alva-labs-logiktest 21/300:** godkänt, se öppen fråga 1 nedan.
2. **deduktivt-induktivt-test 21/250:** stryk "här på sidan". FAQ-svaret läses utan sitt sammanhang i schemat och av AI-motorer. Ny början: `Hos oss provar du fem deduktiva uppgifter utan konto. Med ett gratiskonto gör du ...` (resten som i däcket, och meningen "Öva först utan klocka ..." står kvar).
3. **jobbcoach-online 368:** meningen haltar grammatiskt. Ny: `Gratis gör du ett grundnivåtest om dagen med genomgång och grundversionen av personlighetstestet.`
4. **logiktest-exempel-med-losningar 704:** byt kommat mot ett kolon. `Övningstesterna finns i alla åtta testtyperna: matrislogik, figurserier, deduktivt, verbalt, numeriskt, talserier, spatial förmåga och ordförråd, med facit och förklaring till varje fråga.`
5. **Tillägg i samma redigering:** vad-ar-en-jobbcoach 23 och 883 samt din-digitala-jobbcoach 175 säger "ett personligt brev och sedan ett i veckan". Det bryter husregeln (aldrig "i veckan") och facit (`GRATIS_BREVFONSTER`, var sjunde dag). Byt till `sedan ett var sjunde dag`. Raderna ändras ändå och omfattas av samma undantag.

Allt annat i T4 är godkänt som det står.

## T5. Uppräkningar: godkänt, och KONTROLLERA-punkterna är lösta

- Raderna i aon, matrigma, logiska-tester och vad-ar-en-jobbcoach är godkända.
- **talserier, "Gånger och delat":** stämmer. Namnet finns i src/lib/tester/steg2/namn.ts:10 (`geometrisk`). Meningen godkänns, och H3 "Samma kvot varje gång" står kvar.
- **talserier, tredje ordningen:** den finns inte bara på expertnivån. Banken har 6 sådana serier på avancerad nivå och 18 på expertnivå (`andra_ordningen` med `params.t`), och grundnivån har inga. "Jämn" kan dessutom läsas som jämnt tal. Ny text: `På avancerad nivå och expertnivå förekommer också serier där först den tredje raden av skillnader är lika stor hela vägen.`
- **i-prov 140:** skärp slutet. `I vårt test i spatial förmåga finns också kroppar av kuber och speglingar. I-provets deltest 5 har bara tärningar, och vårt övningsprov för I-provet håller sig till dem.`

## T6. Typbeskrivningar: godkänt med två ändringar

1. **Nya FAQ-frågor på /verktyg/rekryteringstester: byt frågorna (kannibalisering).** "Vad är spatial förmåga ..." krockar med rotation-test-guide, som ligger på position 7,0 för "vad är spatial förmåga". Testsidan ska svara på produktfrågan.
   - Fråga 1: `Vilka uppgifter finns i testet i spatial förmåga?` I svaret byts "tärningar som ska kännas igen vriden" mot `tärningar som ska kännas igen fast de vridits`. Resten av svaret är godkänt.
   - Fråga 2: `Vilka uppgifter finns i testet i deduktiv slutledning?` Svaret är godkänt, men lägg till `Tabellpusslen börjar på avancerad nivå.` efter uppräkningen. Banken har inga tabellpussel på grundnivån.
2. **featureList:** låt figurserier stämma med kortet. Byt `figurserier med klockor och vridna former` mot `figurserier med pilar, former och klockor med två visare`. Resten är godkänt.

Korten, GUIDER-raderna och prov-typer.ts är godkända.

## T7. Nya avsnitt: godkänt efter rättelser i lösningarna

Jag har löst alla sju uppgifterna själv och jämfört med bankerna.

**Frontmatter**
- rotation-test-guide, description: däckets förslag tappar "test" (söks som "spatial förmåga test") och erbjudandet att öva gratis. Ny: `Spatial förmåga test med lösta uppgifter: vridna och speglade figurer, pappersvikning, tärningar och kroppar av kuber. Så tränar du upp förmågan gratis.` (152 tecken)
- deduktivt-induktivt-test: seoTitle (57) och description (145) är godkända. Titeln har frasen "deduktiv slutledningsförmåga" först och sammanhängande, och det är den frasen som söks.

**Kroppar av kuber:** rätt. Vyn blir 2, 3, 2 och snittet 2, 1, 1. Två rättelser så att texten stämmer med produkten (`rad_bakom` och `bakifran` i banken):
- I snittmeningen, ändra till `ge en yta med höjderna 2, 1 och 1, sett från pilen och räknat från vänster`.
- Lägg till efter snittstycket: `Två fällor till: raden bakom snittet, och rätt rad sedd från fel håll, alltså spegelvänd.`

**Spegling i två linjer: sakfel, måste rättas.** Exemplet med en lodrät och en vågrät linje är rätt (ett halvt varv, pricken nere till höger). Men i produkten ritas linjerna genom figurens mitt. På avancerad nivå och expertnivå är *varje* uppgift en rak linje plus en diagonal (`av`, `ha`, `hd`, `dh`, `ah`, `va`, `dv`), och då står linjerna i 45 graders vinkel mot varandra. Två speglingar ger då ett kvarts varv, inte ett halvt. Däckets "Går linjerna diagonalt gäller samma princip" och kvartsvarvet som "fälla" lär läsaren att svara fel just där uppgifterna är svårast.
- I uppgiften, byt "i en lodrät linje till höger om sig, sedan i en vågrät linje under sig" mot `i en lodrät linje genom mitten, sedan i en vågrät linje genom mitten`.
- Sista stycket ersätts helt med: `Fällan är alternativet som bara speglats en gång, med pricken uppe till höger. Det är ett rimligt mellanläge, men frågan gäller slutläget. Räkna linjerna och se på vinkeln mellan dem innan du svarar: en linje ger spegelbilden, och två vinkelräta linjer ger ett halvt varv. På avancerad nivå och expertnivå är den ena linjen sned, och då står linjerna i 45 graders vinkel mot varandra. Två speglingar ger då ett kvarts varv, och vilket håll det vrids åt beror på ordningen. Följ därför en detalj, som pricken, genom båda speglingarna i den ordning uppgiften anger.`

**Deduktivt, inledningen:** stycket motsäger sig självt. Syllogismen räknas som klassisk men också som ett av de "fem format till" (Alla, några och ingen). Ny: `Syllogismen och ordningsuppgiften ovan är de klassiska formaten. I vårt deduktiva test finns sedan november 2026 fem familjer till som bygger vidare på dem, och de återkommer i olika skepnader hos leverantörerna. Här är ett löst exempel på var och en. Uppgifterna är våra egna och finns inte i testet.`

**H3:orna:** stryk siffrorna ("1. " till "5. "). Då får rubrikerna rena id:n, och innehållsförteckningen blir läsbar.

**1. Villkorskedjor:** svaret är rätt. Fällan beskrivs dock så att den inte gäller just den här frågan. Ny sista mening: `Fällan är att läsa kedjan baklänges. Hade uppgiften i stället sagt att morgonordern inte hann fram, hade du inte kunnat dra slutsatsen att lagret stängt tidigt.`

**2. Alla, några och ingen:** rätt. Godkänt.

**3. Sanningssägare och lögnare:** rätt, och lösningen är entydig: Tom är lögnare, Sara och Vera sanningssägare. Uppgiften finns inte i banken. Godkänt.

**4. Tabellpussel: fel, måste bytas.** Uppgiften går att besvara för Alma, men Bea och Carl kan byta lager och ekonomi med varandra, och villkoret "Alma arbetar inte på lagret" används aldrig. "Resten faller på plats" och "en ruta kvar på varje rad" stämmer alltså inte. Inledningen säger dessutom fyra personer, fast uppgiften har tre. Ny version, entydig och med alla villkor i bruk:
- Inledning: `Tre eller fyra personer, lika många avdelningar och bilar, och en lista med villkor som mest säger vad som inte gäller. Lösningen är att rita tabellen och kryssa.`
- Uppgift: `Alma, Bea och Carl arbetar på ekonomi, lager och reception, en var. Var och en kör en egen bil: blå, grön eller röd. Den som kör den blå bilen arbetar på ekonomi. Den som arbetar i receptionen kör den gröna bilen. Carl kör den röda bilen. Bea arbetar inte i receptionen. Vem arbetar var, och vilken bil kör var och en?`
- Lösning: `Alma arbetar i receptionen och kör den gröna, Bea arbetar på ekonomi och kör den blå, och Carl arbetar på lagret och kör den röda. Två villkor kopplar ihop avdelning och bil: ekonomi har den blå bilen, receptionen den gröna. Då har lagret den röda, och Carl, som kör rött, arbetar på lagret. Bea arbetar inte i receptionen och lagret är redan taget, så hon arbetar på ekonomi och kör den blå. Kvar blir Alma, med receptionen och den gröna bilen. Rita alltid rutnätet först. Varje villkor blir ett kryss eller en bock, och till slut finns bara en ruta kvar på varje rad.`
- Banken har inga tabellpussel på grundnivån, och det påverkar sista stycket (se nedan).

**5. Det som inte kan stämma:** svaret är rätt, men alternativen saknas, så läsaren kan inte pröva dem. Lägg in efter frågan: `A) Den röda står på plats 1. B) Den grå står på plats 4. C) Den svarta står på plats 1. D) Den röda står på plats 4. E) Den gula står på plats 3.` Svaret är D. Övriga är möjliga: A röd, gul, grå, svart. B och E röd, svart, gul, grå. C svart, röd, gul, grå. Ändra lösningens "Den röda står på plats 4." till `D, den röda står på plats 4.` Mönstret är detsamma som bankens dd-g-d4-20 (pärmar, bredvid, till vänster om, utesluten plats), men färgerna och villkoren skiljer sig. Det godtar jag.

**Sista stycket: sakfel.** Tabellpusslen finns inte på grundnivån, och "Alla, några och ingen" finns inte på expertnivån. Ny: `Alla fem formaten finns i [vårt deduktiva test](/verktyg/rekryteringstester), med lösningen efter varje svar. Tabellpusslen börjar på avancerad nivå.`

**Kannibalisering:** ingen ny sida, och avsnitten stärker de två sidor som redan syns. logiska-tester fångar i dag de deduktiva frågorna. Mitt förslag: byt ankaret på logiska-tester rad 83 från `[deduktivt test]` till `[test i deduktiv slutledningsförmåga]`. Länkmålet är detsamma, så ingen länk försvinner. Det signalerar vilken sida som äger frasen.

## T10. Nivåkollen publikt: godkänt

Ersättningstabellen stämmer med ordregeln och NIVAKOLL_FINNS. Det som återstår efter T4 är vanliga-intervjufragor-svar:138, `Börja gratis med grundnivån och få en genomgång av dina svar.` Kör `grep -n "Nivåkoll" content/artiklar/*.mdx` efteråt. Den ska ge noll träffar, bortsett från alva om den skulle vänta.

## Öppen fråga 1: Alva-artikeln

**Rätta de två meningarna nu, inget annat.** Avläsningen 2 dec mäter klick på ny seoTitle och description, 14 dagar före mot 14 dagar efter. Ett FAQ-svar i brödtexten påverkar inte den mätningen nämnvärt. Däremot lovar texten "Nivåkollen och ett första pass" och "dagliga pass", och det är fel i sak på en säljsida. Villkor: rör inte title, seoTitle, description, rubriker eller `updated`. Skriv i undantagsfilen och i avläsningen 2 dec att FAQ-svaret ändrades, med datum.

## Öppen fråga 3: rubriken på TypProvKort för spatial

**Byt till däckets `Vridna figurer, pappersvikning, tärningar och kroppar`** (53 tecken, lika långt som de andra korten). Säljs argument håller inte: spatialkortet står bara på rotation-test-guide (`<TypProvKort typ="spatial">`, rad 34), och i-prov använder kortet `iprov`. Knappen leder till grundnivån i spatial förmåga, där kropparna finns, och artikeln får nu ett eget avsnitt om dem. Rubriken är ett `<p>` och syns inte i rubrikträdet, så den kräver inget undantag. Raden `paketrad` ändras enligt T3.

## Undantag i SEO-diffen

**Så fungerar grinden (scripts/seo-diff-artiklar.ts):** skriptet läser varje `scripts/seo-baslinje/*-undantag.json`. På artiklar fäller det på ändrad title eller description, på ändrat rubrikträd (ordning, id och text), på interna länkar som försvunnit, på varje ändrat JSON-LD-block och på FAQ-frågor som försvunnit. Det fäller också om ordantalet i main sjunker mer än 2 procent, och det gäller både artiklar och /verktyg/rekryteringstester. All ändrad brödtext i MDX ändrar BlogPostings `wordCount`, så **varje artikel som rörs behöver LD_UNDANTAG med BlogPosting**. Nya FAQ-frågor och nya länkar är tillåtna och redovisas bara.

**Ny fil:** `scripts/seo-baslinje/textdack-2026-11-19-undantag.json`, med `_om` och nycklarna nedan. Varje post har `path`, `datum` ("2026-11-2x", publiceringsdagen) och `skal`.

| Nyckel | path | Värde |
|---|---|---|
| LD_UNDANTAG `andrade: ["BlogPosting","FAQPage"]` | /artiklar/alva-labs-logiktest, cubiks-logiks-test, deduktivt-induktivt-test, matrigma-test, matrislogik-test-guide, vad-ar-en-jobbcoach, verifierade-testresultat-vs-cv, rotation-test-guide | FAQ-svar och brödtext (T4, T7) |
| LD_UNDANTAG `andrade: ["BlogPosting"]` | /artiklar/aon-cut-e-test, arbetspsykologiska-tester, din-digitala-jobbcoach, jobbcoach-online, logiktest-exempel-med-losningar, logiska-tester, tester-hos-myndigheter, vanliga-intervjufragor-svar, talserier, i-prov | wordCount och description (T4, T5, T10) |
| META_BYTT `falt: "description"` | /artiklar/rotation-test-guide | T7 |
| META_BYTT `falt: "title"` och `falt: "description"` | /artiklar/deduktivt-induktivt-test | T7 |
| RUBRIK_NY, 2 poster | /artiklar/rotation-test-guide | `"h2#<id> Kroppar av kuber: vyn från pilen och snittet"`, `"h2#<id> Spegling i två linjer"` |
| RUBRIK_NY, 6 poster | /artiklar/deduktivt-induktivt-test | en h2 ("Fem format i deduktiva test, med ett löst exempel var") och fem h3 |
| LD_UNDANTAG `andrade: ["FAQPage","WebApplication"]` | /verktyg/rekryteringstester | FAQ-svaret "Är testerna gratis?", två nya frågor, featureList och offers.description (T1, T3, T6). Den äldre posten från 2026-10-12 täcker redan typerna, men gör en egen post med datum och skäl. |
| LD_UNDANTAG `andrade: ["Organization+WebSite+FAQPage"]` | / | GRATIS_FAQ med dagsgränsen (T1). Startsidans graf är ett enda block, så typnamnet ska skrivas exakt så här. |

`rubrik` i RUBRIK_NY har formen `"h2#id text"`. Id:t ska kopieras ur efter-avtrycket och inte gissas. LANK_BORTA, RUBRIK_BYTT och FAQ_BYTT behövs inte, eftersom ingenting tas bort eller döps om. Om T3:s "pass"-rader på /priser eller i rekryteringstester-faq-data byggs i samma svep, hamnar de redan under raden för /verktyg/rekryteringstester. /priser har inget JSON-LD som läser de ändrade strängarna, men kör sidan ändå.

**Körning** (samma mönster som omgang2-*):

```
SIDOR=/,/priser,/verktyg/rekryteringstester,/artiklar/alva-labs-logiktest,/artiklar/aon-cut-e-test,/artiklar/arbetspsykologiska-tester,/artiklar/cubiks-logiks-test,/artiklar/deduktivt-induktivt-test,/artiklar/din-digitala-jobbcoach,/artiklar/jobbcoach-online,/artiklar/logiktest-exempel-med-losningar,/artiklar/logiska-tester,/artiklar/matrigma-test,/artiklar/matrislogik-test-guide,/artiklar/tester-hos-myndigheter,/artiklar/vad-ar-en-jobbcoach,/artiklar/vanliga-intervjufragor-svar,/artiklar/verifierade-testresultat-vs-cv,/artiklar/rotation-test-guide,/artiklar/talserier,/artiklar/i-prov
npx tsx scripts/seo-diff-artiklar.ts ta --bas https://www.jobbcoach.ai --sidor $SIDOR --ut docs/qa/seo-diff/textdack-fore-live.json   # före deploy
npx tsx scripts/seo-diff-artiklar.ts ta --port 8300 --sidor $SIDOR --ut docs/qa/seo-diff/textdack-efter.json   # mot next build + start
npx tsx scripts/seo-diff-artiklar.ts jamfor --fore docs/qa/seo-diff/textdack-fore-live.json --efter docs/qa/seo-diff/textdack-efter.json --rapport docs/qa/seo-diff/textdack-diff.md
```

Grinden är Fel: 0. Kör också verifieringen ur standarden (seoTitle högst 60, description 110 till 158, faq lika många som FAQItem, inga talstreck i metadata) över alla mdx-filer.

## Sammanfattning per punkt

| Punkt | Beslut |
|---|---|
| T4 | Godkänt med ändringar: deduktivt 21/250, jobbcoach-online 368, logiktest-exempel 704, "i veckan" blir "var sjunde dag" på tre ställen |
| T5 | Godkänt med ändringar: tredje ordningen gäller avancerad och expert, i-prov 140 omskriven |
| T6 | Godkänt med ändringar: FAQ-frågorna blir produktfrågor, en tabellpusselmening, featureList för figurserier |
| T7 | Godkänt efter rättelser: spegling (sakfel), tabellpussel (inte entydigt), alternativ i "inte kan stämma", sista stycket (nivåerna), inledningen, rotation-description, H3 utan siffror |
| T10 | Godkänt |
| Öppen fråga 1 | Rätta Alvas två meningar nu, inget annat |
| Öppen fråga 3 | Ny rubrik på spatialkortet enligt däcket |
