# SEO:s besked på skisserna, publikt omgång 3

Skrivet 2026-11-22 av SEO, chef för innehållet i ombyggnaden. Underlag: de 23 noterna i `docs/design/publikt-omgang3/noter/`, skisserna i `sidor/`, `BYGGBRIEF.md`, `textbeslut.md`, `seo-krav.md`, baslinjen mot live (`docs/qa/seo-diff/publikt-omgang3-fore-live.json`, 498 sidor) och Search Console för 2026-08-22 till 2026-11-19 (90 dagar) och 2026-10-23 till 2026-11-19 (28 dagar), hämtat i dag med tjänstekontot, bara läsning.

## Så läser byggaren beskedet

- **JA**: bygg som skissen.
- **NEJ**: bygg inte. Det som står i dag står kvar.
- **JA MED ÄNDRING**: bygg, men med min lydelse eller mitt villkor.
- Där en post redan har en lydelse i `textbeslut.md` gäller den ordagrant, också när skissen har ritat en annan. Jag skriver då "textbeslut X". Mitt besked ändrar inget textbeslut utom där jag säger det uttryckligen.
- Två gränser jag inte går över: en osann lydelse får aldrig stå kvar för rankingens skull, och priser, gränser, juridik, datalagring och mejl rör jag inte.
- Varje JA som byter en rubrik, en FAQ-fråga, en länk eller ett schemablock har en rad i `scripts/seo-baslinje/publikt-omgang3-undantag.json`. Allt annat fäller grinden, och det är meningen.

## Vad sidorna rankar på (styr hur hårt jag håller)

| Sidor | 90 dagar | Det som bär |
|---|---|---|
| Artiklarna, 152 st | 2 152 klick, 188 677 visningar | Allt. Rubrikträd, frågor och länkar rörs inte av skalet. |
| Brevexemplen per yrke | 177 klick, 15 731 visningar, p 16 | Yrket i H1 och "personligt brev [yrke]" (säljare 198 v p 10,7, projektledare 133 v p 6,7) |
| CV-exemplen per yrke | 98 klick, 9 210 visningar, p 17 | Samma mönster |
| Mallsidorna under /cv-mallar | 66 klick, 6 905 visningar, p 17 | "cv mall [yrke]" |
| /verktyg/rekryteringstester | 1 864 v, p 34 | "rekryteringstester" 391 v p 29, "rekryteringstest" 102 v |
| /verktyg/jobbmatchning | 955 v, p 13 | "jobbmatchning" 234 v p 14 (sajten), "jobb match ai" |
| /personligt-brev-exempel | 868 v, p 28 | "exempel på personligt brev" 176 v, "personligt brev mall gratis" 131 v, "gratis personligt brev" 83 v |
| /cv-mallar | 544 v, p 28 | "cv mall" 93 v, "cv mallar" 88 v |
| /exempel | 1 797 v, p 52 | "cv exempel" 276 v |
| Startsidan | 1 437 v, p 27 | "jobbmatch ai" p 7, "ai cv" |
| /funktioner, /priser, /om-oss, /verktyg/cv-analys, /jobbcoachen, /bli-upptackt, /personlighetstest, /linkedin-optimering | under 350 v var | nästan inget utom sidans eget namn |

På sidorna i sista raden väger konvertering tyngre än varje ord. På alla andra rader är varje rubrik, fråga och länk viktig.

## Gemensamma villkor för alla skisser

1. **Rubrikerna i instrumenten.** Testramen, CV-arket, träffen, brevet, spåret, profilkortet, kandidatkortet och alla småbilder har inga h1 till h6. Namn på personer (Sara Lindström), mallar och kort i bilderna är stycken.
2. **`aria-hidden` på instrument** är tillåtet, men den sida som byter synlig text mot ett `aria-hidden` instrument tappar ord. Varje sida räknas före och efter (gräns 2 procent).
3. **Dolt innehåll.** Allt som står bakom "Visa alla", flikar, filter och sökfält ska finnas i serverns HTML från början och döljas med CSS eller `details`. Aldrig `aria-hidden`, `inert` eller hämtat vid klick. Ett sökfält eller filter döljer kort som redan finns, det ritar inga nya.
4. **Exempel och tal.** Alla tal som beskriver produkten läses ur konstanterna eller datan (`TEMPLATE_COUNT`, `FREE_TEMPLATE_COUNT`, antalet yrken, `NO_RESPONSE_NUDGE_DAYS`, `PLANS`). Påhittade exempeltal (matchgrad, poäng, kurvor) märks "Exempel" och står i `aria-hidden` bilder.
5. **Ramen.** Menyn och foten bär `data-site-chrome`, och deras länkar står i HTML:en från början. Se avsnittet Menyn och foten.
6. **Kampanjord** (Black Week, Cyber Monday, kampanjpris) står aldrig i title, H1, description, FAQ eller schema. På prislappen och i kampanjraden får de stå som i dag.
7. **Sökta tjänster** byggs i den här omgången. Alla nya länkar till funktionen pekar direkt på `/verktyg/sokta-tjanster`. Hinner sidan inte bli klar före push pekar de på `/funktioner#sokta-tjanster`, aldrig på en sida som kräver inloggning.

---

## 1. Startsidan (`start`)

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| H1, alla åtta H2 och H3 Rekryteringstester, CV-analys, Jobbmatchning oförändrade | JA | |
| Hjältens telefon byts mot fyra kort | JA | Korten har inga rubriker. Ordet "Jobbmatchning" och citaten med "AI" i löptexten står kvar. |
| Tre verktyg som stora färgblock | JA | Styckena under H3 står som i dag utom posterna i textbeslutet. |
| "poäng 1 till 10 på tydlighet ..." blir "En läsbarhetspoäng av 100 och vad som saknas, del för del" | JA MED ÄNDRING | Textbeslut STA-1. Lika långt som i dag; meningen är sidans längsta och en kortare kostar ord. |
| "Poängen och tyngsta fyndet gratis" | JA MED ÄNDRING | Textbeslut STA-3. |
| "de 25 bästa träffarna varje gång du öppnar sidan" | JA MED ÄNDRING | Textbeslut STA-4, med R7: "Annonserna hämtas tre gånger per dygn. Du söker om med ett tryck när du vill se de senaste." Orden "jobbmatchning" och "träffar" står kvar i stycket. |
| Jobbcoachen "känner till din målroll och de dokument du själv delar" | JA MED ÄNDRING | Textbeslut STA-5. |
| "Lön, intervjufrågor, avtal och avslag ..." blir "Intervjufrågor, uppföljning, avtal och avslag ..." | JA MED ÄNDRING | Textbeslut STA-6: "Lön, intervjufrågor, avtal och avslag, utifrån svensk arbetsmarknad och med källor du kan kolla själv." Lön som ämne är sant; inga belopp. |
| Samtalet om uppföljning i stället för lönespannet | JA | Utan lönebelopp. |
| "Tio frågor gratis" blir "Tio meddelanden gratis" | JA | |
| "Ett nivåtest visar var du står" struket | JA MED ÄNDRING | Ersätts med textbeslut B3: "Grundnivån visar var du står i varje typ," (inte notens förslag om facit). |
| Brickan "60 sek till första CV-poängen" blir "8 testtyper, grundnivån gratis" | JA | |
| "Brev som fungerat" blir "Brev att utgå från, yrke för yrke" | JA | Länken till `/personligt-brev-exempel` står. |
| Medierna på mörk yta | JA | De fyra länkarna står. |
| Sökta tjänster som eget block i "Och resten av jobbsöket" | JA | Knappen pekar på `/verktyg/sokta-tjanster` (`LANK_BYTT` för `/`). De nio länkarna i blocket står. |
| Premiumyta med raden om uppföljningsmejl och rapport | JA MED ÄNDRING | Textbeslut STA-8; "Alla verktyg utan tak" står inte (textbeslut Del 4 punkt 6). |
| Metatitel | NEJ | Sann, rörs inte. |
| Description med testerna först | NEJ | Rörs inte i den här omgången. Färre samtidiga byten på den sida som bär "jobbmatch ai". |
| "543+ har skapat konto" ur databasen | JA | Läses som i dag. |

Ordantal: 1 039 i dag, gräns 20 ord. STA-1 och B3 räknas före och efter.

## 2. Menyn (`meny`) och foten

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| Färgen per rum, kopparknappen | JA | Ingen SEO-verkan. |
| Fyra delar i megamenyn i ordningen Rekryteringstester, CV, Personliga brev, Jobbsöket | JA | Dagens ankartexter står ordagrant (seo-krav, Menyn och foten krav 1). Underraderna är fria inom sanningen. |
| Jobbcoachen flyttar till Jobbsöket | JA | Också i foten (skissens fot hade den under Rekryteringstester; den rättningen gäller). |
| Räkna ut lön och skatt och Jobbkartan bland övriga länkar | JA | |
| Nya länkar: Sökta tjänster, Personlighetstest, Personligt brev-exempel | JA | Ankartexterna "Sökta tjänster", "Personlighetstest", "Personligt brev-exempel". |
| Märket Nyhet på Sökta tjänster | JA MED ÄNDRING | Märket står utanför länkens text (eget element bredvid `<a>`, eller `::after`), så att ankartexten är "Sökta tjänster" och inte "Sökta tjänster Nyhet". Märket tas bort 2027-01-12, samma dag som januariavläsningen. |
| Priser som egen länk i headern och i foten | JA | "Se vad som ingår" får finnas som extra länk. |
| "Jobbcoachen: Svar med källor" blir "Intervju, avtal och avslag" | JA | |
| "LinkedIn-profilen: Syns i rekryterarnas sök" blir "Rubrik och sammanfattning som hittas" | JA | |
| Menyns fotrad om Premium | JA MED ÄNDRING | Läses ur `plans.ts` (textbeslut GEM-6, "Tester, CV, personliga brev, Jobbsöket och Jobbcoachen"). |
| Telefonmenyn över hela skärmen | JA | Länkarna i HTML:en också när menyn är stängd. |
| Megamenyn öppnas med skript | JA | Länkarna står i serverns HTML från början, inom `data-site-chrome`. |
| Kampanjraden | JA | Står som i dag. |
| "CV-mallar per yrke" | JA MED ÄNDRING | Pekar på `/cv-mallar#yrken`, ett ankare som P2 sätter på avsnittet "CV-mallar för ditt yrke", så att två länkar inte går till samma adress. Texten står. Länken till `/cv-mallar` med texten "CV-mallar" står kvar. |
| Facebook-adressen | NEJ | Ägarens fråga (textbeslut Del 5). Foten behåller dagens adress. |

Ingen adress som har en ramlänk i dag tappar den. Kontrolleras för hand mot efter-avtrycket (grinden skriver ramens skillnader men fäller inte på dem).

## 3. /funktioner (`funktioner`)

Sidan har 262 visningar på 90 dagar och position 60. Konvertering väger tyngst; rubriker och frågor står ändå.

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| Hjältens fyra dörrar i stället för ankarraden | JA | Alla åtta ankare står: `#tester`, `#brev`, `#cv-analys`, `#cv-skapa-mallar`, `#jobbmatchning`, `#jobbcoachen`, `#linkedin`, `#sokta-tjanster`. |
| "granskat av rekryterare" blir "Det mesta provar du gratis." | JA MED ÄNDRING | Textbeslut FUN-11: "Byggt för svensk arbetsmarknad och för hur en rekryterare läser." |
| Testblocket med testramen och två kort | JA | |
| Nya H3 "Åtta testtyper, tre nivåer" och "Resultatet, uppgift för uppgift" | JA | Nya rubriker fäller inte grinden här. |
| "Efter varje uppgift", "test för test" | JA | |
| Brevet mot annonsen, tonerna som rad | JA | |
| Brev, gratisraden "Första brevet, sedan ett var sjunde dag. Alla brev sparas i ditt konto." | JA MED ÄNDRING | Textbeslut FUN-5, med att de två senaste går att ändra. |
| "Redigera, välj mall och skicka. Nedladdning ingår i Premium." | JA | |
| De fem tonerna utskrivna | JA | |
| CV-analysen: arket med sju delar, stapeln | JA | |
| CV-analysens gratisrad och fyra steg | JA MED ÄNDRING | Textbeslut GEM-7 och FUN-5. |
| H3 "Bygg CV:t steg för steg" | JA MED ÄNDRING | Rubriken byts, inte står kvar som noten säger: textbeslut FUN-7, "Skriv CV:t direkt på arket" (finns i undantagsfilen). |
| H3 "Ladda ner som PDF" | JA MED ÄNDRING | Textbeslut FUN-8, "Ladda ner som PDF eller Word". |
| Mallväggen med åtta riktiga mallar och talen 40, 2, 26, 15 | JA | Talen ur konstanterna. |
| CV-nedladdning gratis en gång | JA | Följer koden (`FREE_CV_EXPORTS = 1`, textbeslut B-28). |
| Etiketten "Bara i Jobbcoach Premium" blir "Jobbsöket" med ny ingress | JA MED ÄNDRING | Textbeslut FUN-3. H2 "Jobben hittar dig, och du går förberedd in i intervjun." står. |
| "Varje gång du öppnar sidan får du de 25 bästa träffarna" och FAQ-svaret om uppdatering | JA MED ÄNDRING | R7 ordagrant, textbeslut FUN-1. Frågan "Hur ofta uppdateras jobbmatchningen?" står. |
| "matchar dem mot alla annonser i Platsbanken" | JA | "mot annonserna i Platsbanken, som hämtas tre gånger per dygn". |
| Matchade jobb med träffen och de tre handlingarna | JA | |
| Ny H2 "Sökta tjänster" mellan Matchade jobb och Jobbcoachen | JA | Länk "Så fungerar Sökta tjänster" till `/verktyg/sokta-tjanster`. Ankaret `#sokta-tjanster` sitter på den här sektionen. |
| Jobbcoachen "känner till din målroll, ort och bransch ..." | JA MED ÄNDRING | Textbeslut GEM-11. |
| Korten Inför intervjun och Bli upptäckt | JA | Textbeslut GEM-12 för Inför intervjun. |
| Raden Gratis och Premium vänd | JA | |
| "Femfaktormodellen (Big Five)" | JA | "Big Five" står kvar i texten. |
| "anonymt tills du själv tackar ja" | JA | |
| LinkedIn-exemplet Sara på Nordanvind Energi | JA | |
| Tolv brickor i "Alla verktyg, samlade" | JA | De elva länkarna står, Sökta tjänster läggs till. |
| Premiumytan | JA MED ÄNDRING | "Allt på den här sidan, utan tak." står inte (textbeslut Del 4 punkt 6). |
| FAQ-svaret "Hur kommer jag igång gratis?" | JA MED ÄNDRING | Textbeslut FUN-2. |
| OG och twitter med Sökta tjänster | JA | Textbeslut FUN-10. |
| Fasta knappraden i telefonen | JA | Står kvar. |

## 4. /priser (`priser`)

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| Prislappen till höger, de fyra delarna som brickor | JA | H1 "Jobbcoach Premium, 149 kr i månaden" och titeln står. Priset ur `PLANS`. |
| Premiumlistan med sex rader | JA MED ÄNDRING | Textbeslut GEM-4. |
| "Vill du se först?" som fyra kort | JA | Varje fakta i dagens långa mening ska finnas i korten. Räkna orden. |
| Instrumenten i "funktion för funktion" | JA | H3 Rekryteringstester, CV-analysen, Personliga brev, Matchade jobb, Jobbcoachen står. |
| Ny H3 "Sökta tjänster" | JA | Med länk till `/verktyg/sokta-tjanster`. Kortet Inför intervjun ska också finnas (textbeslut B-9). |
| Kom igång som väg | JA MED ÄNDRING | Tolv stopp i produktens ordning och etiketten `${KOM_IGANG_LISTA.allt.length} steg` (textbeslut GEM-13), inte "Kom igång, steg för steg". H2 står. |
| Tabellen omritad, kvar som tabell i HTML | JA | Radernas etiketter "CV-analys", "CV-nedladdning", "Personliga brev", "Matchade jobb", "Jobbcoachen", "Intervjuprovet" står. Gruppnamnet "Jobbsöket" (textbeslut B-18) är ingen rubrik i dag, så inget undantag. |
| Rapporten på gratisnivån "Ingår inte" | JA MED ÄNDRING | "Antalen per månad" (textbeslut Del 4 punkt 9). |
| Nya rader i jämförelsen | JA | |
| "3 500+ uppgifter" | JA | Räknas ur banken som i dag. |
| Kampanjpriset på prislappen | JA | Bara på prislappen och i kampanjraden (villkor 6). |
| Övriga påståenden i notens tabell | JA MED ÄNDRING | Textbeslut PRI-1 till PRI-11. |
| Description | JA MED ÄNDRING | Textbeslut PRI-9 (finns i undantagsfilen). |

## 5. /om-oss (`om-oss`)

Sidan har 300 ord och gränsen är 6 ord. Bara byten av samma längd och tillägg.

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| Hjältens fyra block | JA | Inga rubriker i blocken. H1 och H2 står. |
| Historien som fyra kort med bild | JA | De sju H3 i samma ordning. |
| "Tusentals användare kom snabbare ..." | JA MED ÄNDRING | Textbeslut INF-4, inte skissens kortare mening. |
| "Du provar varje verktyg utan kortuppgifter." | JA | "Du provar det mesta utan kortuppgifter." |
| Rekryteringstester först i uppräkningen | JA | |
| "varje siffra går att följa till källan" | JA MED ÄNDRING | Meningen blir: "Vi gissar inte, vi hänvisar, och när svaret bygger på källorna står de med." (textbeslut B-19: källor när svaret bygger på kunskapsbasen). |
| Slutytan med talen 543+ och 278+ | JA | Ur databasen som i dag. |

## 6. /verktyg/cv-analys (`cv-analys`)

Beskeden i noten är redan mina och står i textbeslutet. Här bara det som återstår.

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| H1 med första ledet som etikett inuti h1 (`.h1 .over`) | JA MED ÄNDRING | h1-elementets text ska vara exakt "CV-analys med läsbarhetspoäng: se var ditt CV tappar, del för del", kolon med, i DOM:en (får formas med CSS, aldrig `aria-hidden`). Etiketten "Gratis för varje CV" står utanför h1. |
| Arket i hjälten, lyftkortet med meningen om inskannade PDF:er | JA | |
| Stegen som väg | JA | HowTo-stegen ordagrant som de synliga. |
| De sju delarna med stapeln | JA | Varje del minst lika lång text som dagens kategori. |
| Ny H2 "Vägen till 100 poäng" | JA | |
| Skrivtipsen som kort med före och efter | JA | De fem H3 och texterna står, före och efter läggs till. |
| Premium och frågorna | JA | Svaret om säkerhet ordagrant. Frågan "Hur lång tid tar en CV-analys?" står. |
| "60 sekunder" struket överallt på sidan | JA | |

Ordantal: 968 i dag (inte 869 som i seo-krav), gräns 19 ord.

## 7. /verktyg/skapa-cv (`skapa-cv`)

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| Arket i hjälten | JA | |
| Startbladet "Vilket jobb söker du?" som lyft kort utan rubrik | JA | Ingen ny H2. Länken "Skapa mitt CV gratis" står som `<a>`. |
| Stegen som väg med bild | JA | HowTo ordagrant. |
| Plattan med fyra nålar, fyra kort under | JA | Alla åtta H3 för fördelarna står. |
| Linne, Björk, Koppar och raden "37 mallar till" | JA MED ÄNDRING | Talet räknas, `TEMPLATE_COUNT - 3`. |
| Gör skillnad med tre tal | JA | De tre H3 står. |
| "hela CV-analysen" blir "CV-analysens alla förslag" | JA | Textbeslut GEM-5. |
| "3 förslag på punkter, gratis" | JA | |
| FAQ "laddar ner det som PDF en gång" | JA | Står; sant enligt `FREE_CV_EXPORTS = 1`. |
| Kampanjpriserna | JA | Inte i rubriker, description eller schema. |

## 8. /cv-mallar med stilsidorna (`cv-mallar`)

Sidan och mallsidorna under den har nu den hårda regeln (`HARD_SIDOR`).

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| Hjälten med åtta miniatyrer och fyra talbrickor | JA | H1 och ingressen står. Talen ur konstanterna. |
| Mallväljaren i lyftkortet | JA | |
| Yrkena i tio grupper bakom "Visa alla" (H3 bakom en knapp) | JA MED ÄNDRING | Alla 74 yrkens H3, text och "Se mall"-länk står i serverns HTML från början, dolda med CSS eller `details` (villkor 3). Gruppernas antal räknas ur `yrkesmall-data.ts`. Ingen länk får försvinna. |
| Sökfältet "Sök ditt yrke" | JA | Klientkomponenten döljer kort, ritar inga nya. |
| Alla 40 mallar med filterchips | JA | Samma villkor: alla 40 kort och länkar i HTML:en. |
| Premiumremsan under rutnätet | JA MED ÄNDRING | "{38} mallar till ingår i Premium, med PDF i alla och Word i {26} av de 40. Du ser ditt CV i varje mall innan du bestämmer dig." Talen ur konstanterna. Meningen om att man betalar först vid nedladdning står bara om betalväggen faktiskt sitter där i mallväljaren; byggaren kontrollerar, annars stryks den. |
| Word-sektionen, "Visa alla 26" på telefon | JA MED ÄNDRING | Samma som yrkena: alla 26 H3 i HTML:en. |
| Steg 2 "Formuläret leder dig genom varje avsnitt." | JA | "Du skriver direkt på arket, avsnitt för avsnitt." H3 "Fyll i dina uppgifter" står. HowTo ändras med (`LD_UNDANTAG`). |
| Mer än en snygg layout med bilder, "40 av 40 lästes rätt" | JA | Meningen i texten står kvar, bilden är `aria-hidden`. |
| Guiden, gratis-avsnittet, PDF eller Word, stilarna | JA | Löptext och länkar ordagrant. |
| 21 frågor | JA | Ordagrant. |
| Slutplattan med 89 exempel och 74 yrken | JA MED ÄNDRING | Talen ur datan. |
| Stilsidorna (`StilSida.tsx`) med samma mallkort | JA | Samma villkor om rubriker och ord. |

## 9. /verktyg/linkedin-optimering (`linkedin`)

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| Hjälten med sökrutan och Saras profil | JA | "Ingår i Jobbcoach Premium, {pris}." Priset ur `PLANS`. |
| Före och efter som stycke, inte H2 | JA | |
| Stegen som kort, steg 2 "Om mig och Erfarenhet behövs, resten är valfritt." | JA | HowTo-steg 2 följer med (`LD_UNDANTAG`). |
| Fem sektioner som bild, brickan "Ett pass, 30 till 60 sekunder" | JA | Talet står redan på sidan. |
| Varför du inte syns, Bred eller skarp | JA | |
| "De flesta använder färre än 30." (tecken i rubriken) | JA MED ÄNDRING | Inget belägg. Blir: "Många använder bara en bråkdel av dem." |
| "LinkedIns algoritm prioriterar profiler som är kompletta" | NEJ | Står; inget tal och inget löfte om vår produkt. |
| "Klart på fem minuter", "5 min" | NEJ | Står; stämmer med FAQ-svaret om tid. |
| Hjältens "vi optimerar fem sektioner" blir "vi skriver om" | NEJ | Inte osant, och sidans frågor är "linkedin optimering" (13 v) och "optimering af linkedin" (16 v). H3 "Vi optimerar fem sektioner samtidigt" står också. |
| "hela CV-analysen" i slutblocket och FAQ | JA | Textbeslut GEM-5. |
| FAQ "alla fält då är ifyllda" | JA | "fälten då är ifyllda". |
| Exemplet Sara i stället för Anna Lindberg på Klarna och Voi | JA | |
| Tre länkbrickor under Premium (CV-analys, Skapa CV, CV-mallar) | JA | Ankartexterna exakt "CV-analys", "Skapa CV", "CV-mallar". |
| Svenska eller engelska | JA MED ÄNDRING | Lägg till en mening i steg 2 eller i FAQ-svaret om tid: verktyget skriver profilen på svenska eller engelska (`Step1Mode.tsx:184-189`). Fler ord, sant. |

## 10. /verktyg/rekryteringstester (`rekryteringstester`)

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| Hjälten med uppgiften i ramen | JA | |
| Lyftkortet med nio prov till `/prova?typ=` | JA | Nya interna länkar är bra. Provsidan behåller `noindex` och canonical. |
| Filmen står kvar | JA | VideoObject oförändrat. |
| Stegen som fyra skärmar | JA | |
| H3 "Lös frågorna i din takt" blir "Lös uppgifterna i din takt" | JA | Ingen sökfråga till sidan bär "frågor". `RUBRIK_BYTT`, och HowTo följer med. |
| Steg 2: klockan visar provets tid, ingenting bryter mitt i en uppgift | JA | |
| Steg 3: antal rätt, tiden mot provets tid, var missarna sitter | JA | |
| "Fem frågor gratis här", "fråga för fråga" | JA | "uppgifter", "uppgift för uppgift". |
| Provet utan konto, nio typer, ett öppet facit | JA | |
| Ingressen om ett kort nivåtest struken | JA MED ÄNDRING | Ersätts med en mening av samma längd: "Grundnivån visar var du står i varje typ." |
| Sex färdigheter och åtta testtyper med riktiga småuppgifter | JA | Uppgifterna ur bankens publika exempel. H3 står. |
| Vilket test ska du göra? som inbjudningar | JA | Leverantören som H3 som i dag, guidelänkarna med samma ankartext. |
| Personlighetsplattan med tre tal | JA | De fem dimensionernas H3 står. |
| Kurvan under Träning som syns | JA MED ÄNDRING | Märkt "Exempel", `aria-hidden`, inga tal i löptext. |
| TRR-siffrorna som stapelbild | JA | Talen ur dagens text. |
| Testtypernas namn | JA MED ÄNDRING | I rubriker och löptext gäller de publika namnen (Matrislogik, Verbalt resonemang, Numeriskt resonemang), de är sökorden. I de ritade skärmarna (`aria-hidden`) får produktens namn stå. |
| FAQ-svaren om tid och om vad som är gratis | JA | Frågorna står (`LD_UNDANTAG`). |
| Kampanjpriserna i löptext | JA | Inte ritade, villkor 6. |

## 11. /verktyg/personlighetstest (`personlighetstest`)

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| Hjälten, provet i lyftkortet, stegen som väg | JA | Provet serverrenderat med fem svar i HTML:en. |
| Faktorerna mot en kravprofil | JA MED ÄNDRING | Ett fast exempel, Sara mot Ledarskap och projektledning, med spannen ur `KRAVPROFILER`, inte ritade. Inga siffror 1 till 5 på axeln: FAQ-svaret säger bandord i stället för poäng, och bilden ska säga samma sak. |
| Ny H3 "Frågor rekryteraren lär ställa" | JA | |
| Länken till /verktyg/rekryteringstester | JA | |
| Trappan 20, 50, 120 | JA | |
| Raden om tolkningen i gratiskontot | JA | |

## 12. /verktyg/personligt-brev (`personligt-brev`)

Sidan växer på "gratis personligt brev" (28 dagar p 12). H3 "Ett brev gratis" och frågan "Hur många brev kan jag skapa gratis?" står.

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| Arket med kraven i hjälten | JA | |
| Hjältens knapp "Skriv ett brev nu" till `/skapa-brev/start` | JA | "Skapa ditt brev gratis" finns kvar längre ned. |
| Lyftkortet med annonsfältet | JA | Fungerar fältet inte utan ändring i startflödet blir det en bild och knappen en vanlig länk. |
| Stegen som väg | JA | HowTo ordagrant. |
| Tonblocket under stegen | JA MED ÄNDRING | Rubriken "Fem toner. Samma erfarenhet, olika röst." är ett stycke, ingen ny H3. Exempelmeningarna märks "Exempel" och påstår inte att motorn skriver exakt så. |
| 40 mallar med klack och märken | JA | De sju mallarnas H3 och länkkortet till /cv-mallar står. |
| Fem regler med före och efter | JA MED ÄNDRING | Regel 1:s efterexempel på svenska: "Ledde intressentdialogen i tre projekt" i stället för "Stakeholder management i tre projekt". |
| Kravpanelen i full storlek | JA | De tre resultatkortens H3 står. |
| Exempelnavet med talet 89 | JA MED ÄNDRING | Talet ur datan. |
| Premium med tre bockar | JA | Talen 40 och 26 ur konstanterna. |
| "plockar ut nyckelorden" blir "kraven" | JA | Produktens ord, inga sökfrågor på sidan bär "nyckelord". |
| FAQ-svaret om ChatGPT "optimerar för ATS-systemen" | NEJ | Står. |
| Exemplet Sara hos Sweco | JA | Inga påhittade projekt på riktiga bolag. |

## 13. Brevexemplen per yrke (`brev-exempel`, 89 sidor)

De viktigaste produktsidorna vi har. Brevets text, H1 och alla H2 står ordagrant på alla 89.

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| Hjälten med A4-arket bara i brett läge | JA | På telefon är brevet först. LCP är text eller en bild med fasta mått. |
| Papperet på plommonytan, satt som Linne | JA | Brevets text serverrenderad ord för ord. |
| Kommentarer med siffror vid styckena | JA | Där ankare saknas ritas kommentarerna utan siffror. Inget datajobb krävs i den här omgången. |
| Öppet läge med visaren | JA | Inga rubriker i visaren. |
| Knappen "Använd som mall" med `&mall=` | JA MED ÄNDRING | Hjältens och kommentarskortets länk står kvar exakt som `/skapa-brev/start?yrke=<yrke>`; bara visarens knapp får `&mall=`. Annars försvinner en länk på 89 sidor. |
| Länken "Se alla 40 mallar" efter fotraden | JA MED ÄNDRING | Pekar på `/verktyg/personligt-brev`, inte /cv-mallar, med texten "Se alla 40 brevmallar". Den som läser ett brevexempel vill ha brevmallar, och verktygssidan rankar på "personligt brev mall gratis". I dag länkar bara 14 av de 88 brevexemplen i sajtkartan dit. |
| Det här gör brevet starkt, Tips, Skrivguiden | JA | H3 och texter ordagrant. |
| Exempelmeningen i tipsen i egen ruta | JA MED ÄNDRING | Bara om alla ord står kvar. Passar regeln inte ett yrke står texten som stycke. |
| Frågorna, Skapa hela ansökan, Fler exempel | JA | |
| Slutet "klart på en minut" blir "klart på några minuter" | JA | |
| H2 "Komplett exempel på 60 sek" | NEJ | Står på alla 89. Inte bevisat osant, och rubriken ligger på sidor med trafik. |
| Description "Skriv ditt brev på 2 minuter" | NEJ | Står. |
| H2 "personligt brev för projektledare" med stor bokstav | JA | Bara med CSS, texten rörs inte. |
| Miniatyrerna med Erik Lindberg | JA | Står som i dag. |

## 14. /personligt-brev-exempel och kategorisidorna (`brev-exempelnav`)

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| Hjälten med tre brev, sökfältet, situationsraden | JA | H1 "Personligt brev-exempel för 89 yrken. Börja med ditt." står; talet ur datan som i dag. |
| Branscherna i lyftkortet, största först | JA | Samma tio länkar. |
| 89 kort med brevminiatyr | JA MED ÄNDRING | En gemensam Linne-miniatyr med tomt alt (dekor), inte 89 olika bilder. Yrket som H3 och raden står. |
| Behöver du även CV? som ö | JA | |
| Guidens fjärde svar om gratis och nedladdning | JA MED ÄNDRING | Skissens lydelse, med orden "gratis", "mall" och "ladda ner" kvar i svaret: sidan rankar på "personligt brev mall gratis" (131 v) och "gratis personligt brev" (83 v). H3 står. Rådet om Word, Garamond och Calibri står. |
| FAQ "dubblar dina chanser" | JA MED ÄNDRING | Sista meningen blir: "Det tar bara några minuter extra, och rekryteraren ser att brevet gäller just den tjänsten." (`LD_UNDANTAG`). |
| Kategorisidorna i navets form | JA | H1, H2 "{n} yrken inom {bransch}", "Behöver du även CV?", "Hittade du inte ditt yrke?" och schemat står. Serverkomponenter i stället för klientkomponenter. |
| Vårdens ingress "20+ yrken" | JA MED ÄNDRING | Talet ur datan (17). Gäller också `/cv-exempel/kategori/vard`, som läser samma text (`LD_UNDANTAG` för CollectionPage på båda). |
| /cv-exempel följer med i petrol | JA | Samma villkor. |

## 15. Visaren i artiklarna (`brev-artikel`)

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| Visaren i spalten, miniatyrerna över arket på telefon | JA | Inga rubriker. |
| "Läs brevet som text" som `details` | JA | Utfälld från start, som i dag. |
| Länken "Se alla 40 mallar" | JA MED ÄNDRING | Som för exempelsidorna: `/verktyg/personligt-brev`, "Se alla 40 brevmallar". |
| Länken "Skriv ditt eget brev" med `?mall=` | JA | Artikeln har kvar `/skapa-brev/start` utan parameter genom reklamen; kontrolleras i diffen. |
| Reklamrutan för brev som plommonkort | JA | Rubriken är ett stycke. Paketraden enligt textbeslut REK-2 ("som PDF eller Word"). |

## 16. Startflödet för brev (`skapa-brev-start`)

Sidan har `noindex` och inga visningar. Inget av det här påverkar sök.

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| Plommonväggen, panelen, arket | JA | H1 och H2 "Ditt brev är klart" står. `noindex` står. |
| Mallen och yrket följer med | JA | Utan ändring i databasens schema (BYGGBRIEF); mallen sparas bredvid utkastets token som för CV:t. |
| Nya texter i panelen och spärren | JA | |
| Platshållaren i Arbetsgivare | JA | En per yrke om datan har den, annars dagens. |

## 17. /verktyg/jobbmatchning (`jobbmatchning`)

Den verktygssida som har mest att förlora: "jobbmatchning" gick från p 8 till p 3,7 på 28 dagar enligt seo-krav. H1, titel, description, alla sju H2 och alla H3 utom steg 1 står.

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| Hjälten som Matchade jobb i kontot | JA | Ingen mening säger "aktivera". |
| Hjältens ingress | JA MED ÄNDRING | Textbeslut JM-1, inte skissens. |
| Hjältens tal "Dagligen: nya annonser in, tillsatta ut" | JA MED ÄNDRING | Textbeslut JM-4: "3 gånger" med "per dygn hämtas nya annonser". Inte skissens "25 bästa träffarna i Premium". |
| Provkortet med 25 rutor | JA MED ÄNDRING | Raderna enligt textbeslut JM-5 och JM-7 ("Nya annonser in tre gånger per dygn, borttagna ut"). |
| H3 och HowTo-steg 1 "Aktivera ditt CV" | JA MED ÄNDRING | "Välj eller ladda upp ditt CV", inte skissens "Ditt CV läses in" (finns i undantagsfilen). Stegets text enligt textbeslut JM-1. |
| Steg 3 "Vi söker direkt mot Arbetsförmedlingens öppna API" | JA MED ÄNDRING | Textbeslut JM-8: "Vi hämtar annonserna ur Arbetsförmedlingens öppna API, i hela Sverige." |
| Datapunkterna som Saras CV med nålar | JA | Sex H3 och texterna ordagrant. |
| Grenarna som eget block | JA | Exemplet och texten i skäl 1 står. |
| H3 "Uppdaterat varje dag" blir "Nya annonser tre gånger per dygn" | NEJ | Rubriken är sann och står (textbeslut B-11). Texten under blir R7 ordagrant. |
| Kedjan träff, sparad, sökt | JA | De sex länkarna står med samma ankartext. |
| Nya länkar till Rekryteringstester och Sökta tjänster | JA | Sökta tjänster till `/verktyg/sokta-tjanster`. |
| Länken till CV-exempel "om du inte har ett eget än" | JA | Adressen står. |
| Premiumavslutet | JA MED ÄNDRING | Textbeslut JM-3. |
| FAQ-svaren | JA MED ÄNDRING | Textbeslut JM-2, JM-4, JM-8, B5. Alla åtta frågor står. |
| Matchgraderna 91, 86, 82 | JA | Märkta "Exempel" i bilden. |
| Fasta knappraden | JA | Står kvar. |

Ordantal 1 037, gräns 20 ord.

## 18. /verktyg/jobbcoachen (`jobbcoachen`)

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| Samtalet i hjälten | JA MED ÄNDRING | Exemplet om uppföljning utan namngivna källor, med textbeslut JC-3:s svar ("Håll det kort ..."). Inga källmärken till Arbetsförmedlingen eller Unionen förrän någon har sett att kunskapsbasen ger dem. |
| Lyftet med ett stilla svar om uppsägningstid | JA | Demo 2 (LAS) står, den stämmer med 11 § LAS (textbeslut B-31). |
| Stegen som väg | JA | |
| Nytt block "Jobbcoachen föreslår frågor utifrån ditt läge" med H3 | JA | Raden om vad Jobbcoachen inte läser får stå, den beskriver produkten och inte lagringen. |
| Sex områden med frågan som bubbla | JA | Exempelfrågorna står. |
| Källorna som färgblock | JA | |
| Gratiskvoten som tio brickor | JA | |
| Ny FAQ-fråga "Vad vet Jobbcoachen om mig?" | NEJ | Svaret ligger för nära datahantering och är ägarens. Innehållet står i det nya blocket i stället. |
| Slutblocket, FAQ 8, featureList | JA MED ÄNDRING | Textbeslut JC-1, B5, JC-2. |

## 19. /verktyg/bli-upptackt (`bli-upptackt`)

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| Alla nya bilder (reglaget, kandidatkortet, mötet, vägen) | JA | H1, åtta H2, sexton H3 och all löptext står. |
| Exemplet Sara i Västra Götaland | JA | |
| Två styrkor i stället för tre | JA | |
| FAQ-svaret om lön | JA MED ÄNDRING | Textbeslut BU-1. |
| Arbetsgivaren, percentiler | NEJ | Ägarens (textbeslut B-26, Del 5). |
| "Tidig åtkomst" över H1 | JA | Står. |
| Kandidatens egna ord | JA | Märkta "Exempel". |

## 20. Artiklarnas reklam och topp (`artikelreklam`)

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| Rutan efter andra stycket som mörkt block med instrument | JA | Rubriken är ett stycke, instrumentet `aria-hidden`. |
| Sidokortet och slutkortet | JA | |
| Artikelns topp | JA MED ÄNDRING | BYGGBRIEF beslut 8: väggen i klustrets färg står kvar. H1, ingress, författarrad (h3 med samma id) och artikelbilden som första bild står. |
| Reklamkortens ordantal | JA | Tester 79 (i dag 81), CV-analys 53 (47), brev 56 (49), sidokort och slutkort oförändrade. Ramen på fem ord gällde att korten inte får krympa; att de växer är bra. |
| Nya kortet för Jobbsöket | JA MED ÄNDRING | Två varianter i samma form. Träffen (skissens kort) i artiklarna om matchning, till exempel `ai-jobbmatchning`. Sökta tjänster (vägen från Ska sökas till Erbjudande) i artiklarna om uppföljning: `soka-jobb-via-mail`, `uppfoljning-efter-intervju`, `personligt-brev-jobbansokan`. Kortet ersätter dagens kort bara om dagens korts länkmål står kvar i artikeln; annars läggs det till som slutkort. |
| Etiketter och knappar med "uppgift" i stället för "fråga" | JA | |
| Gratisraden i egen ruta | JA | Lydelser enligt textbeslut REK-1 till REK-4. |
| Övriga kort (mallkortet, coachkortet, räknarkortet, länkraden, provkorten) i samma form | JA | Samma länkmål som i dag. Mallkortet visar riktiga miniatyrer. |

## 21. Logga in, glömt lösenordet och Skapa konto (`inloggning`, `registrering`)

`/login` och `/register` är indexerade i dag (21 och 108 ord, `/register` p 2 på varumärket). H1 och titlar står.

| Ändring | Besked | Lydelse och villkor |
|---|---|---|
| Kortet på grafit, beskeden som rader | JA | |
| Panelen "Allt ligger kvar där du lämnade det" | JA | |
| Glömt lösenordet utan citat och tal | JA | Citatet enligt textbeslut AUTH-1 tills ägaren har svarat om talen; talen "100% krypterat" och "24 h" står kvar tills dess (textbeslut B-30). Skissens strykning av dem väntar på ägaren. |
| Registreringens fyra kort i "Det här ingår gratis" | JA | Rubriken "Börja med det som avgör urvalet" står. |
| "Urvalstester" blir "Rekryteringstester" | JA | |
| Fem val i "Vad vill du börja med?" | JA | Ingen SEO-verkan. |
| Köpstegets lista | JA | Samma källa som /priser (`HELA_PAKETET_RADER`). Samtycke och villkorsrader ordagrant. |

---

## Den nya sidan /verktyg/sokta-tjanster

GSC har noll visningar på "sökta jobb", "aktivitetsrapport", "ansökningar" och "uppföljning" på hela sajten (90 dagar, sökt igen i dag). Allt om sökord här är en bedömning. Primärordet är **"sökta jobb"**: det är vad folk skriver, och Arbetsförmedlingen äger "aktivitetsrapport".

**Adress:** `/verktyg/sokta-tjanster`. **Canonical:** `https://www.jobbcoach.ai/verktyg/sokta-tjanster`. **Robots:** index, follow. I sajtkartan.

**Title** (56 tecken): `Sökta jobb: håll koll på dina ansökningar | Jobbcoach.ai`

**Description** (146 tecken, talet ur `NO_RESPONSE_NUDGE_DAYS`): `Logga sökta jobb, se var ansökningarna står och få ett utkast till uppföljningsmejl efter tolv tysta dagar. Med underlag till aktivitetsrapporten.`

**Eyebrow:** Sökta tjänster. **H1:** Håll koll på varje jobb du har sökt.

**H2 och H3, i ordning:**
1. H2 "Logga ett jobb du har sökt" (lyftkortet med arket)
2. H2 "Så fungerar det", med H3 som HowTo-steg: "Spara annonsen du ska söka", "Logga när du har sökt", "Uppdatera när något händer", "Följ upp och ta ut månaden"
3. H2 "Från Ska sökas till erbjudande"
4. H2 "Spara annonsen med sista ansökningsdag", med H3 "Veckans mål håller farten uppe"
5. H2 "Se var ansökningarna tar stopp", med H3 "Aktivitet per vecka", "Hur du sökte", "Svar per CV"
6. H2 "Uppföljningsmejlet efter tolv tysta dagar" (skissens "Tyst i tolv dagar? Utkastet är redan skrivet." byts: utkastet skrivs när man öppnar det, och rubriken ska bära "uppföljningsmejl")
7. H2 "Intervjun hör till tjänsten du sökte"
8. H2 "Underlag till din aktivitetsrapport" (skissens "redan ifyllt" stryks: gratis ser antalen, raderna är Premium)
9. H2 "Gratis att logga. Premium när du vill ta ut mer." Listornas namn "Gratis för alla med konto" och "Jobbcoach Premium" får vara H3.
10. H2 "Resten av jobbsöket ligger ett tryck bort"
11. H2 "Frågor om Sökta tjänster"

Rapportbladets "Sara Lindström" är ett stycke, ingen rubrik.

**FAQ, åtta frågor** (synliga och i FAQPage, ordagrant lika):
1. Kostar det något att logga sökta jobb?
2. Skickar ni uppföljningsmejlet åt mig? (Nej: utkastet öppnas i din egen e-post, och du skickar själv.)
3. Skickar ni min aktivitetsrapport till Arbetsförmedlingen? (Nej: du lämnar in den själv, på Mina sidor eller på annat sätt Arbetsförmedlingen anger.)
4. Vad ska stå i en aktivitetsrapport? (Bara det som står i Arbetsförmedlingens källa, med länk och datum då den lästes; se seo-krav, tabellen över påståenden.)
5. Varför föreslår ni uppföljning efter just tolv dagar?
6. Måste jag hitta jobben genom er jobbmatchning?
7. Kan jag lägga in jobb jag sökte innan jag skapade kontot?
8. Hur hänger intervjun ihop med den sökta tjänsten?

Skissens nionde fråga, "Vem kan se mina sökta tjänster?", står inte på sidan förrän ägaren har godkänt svaret (datalagring). Raden "ingen där ser ditt konto" i rapportavsnittet stryks av samma skäl.

**Påståenden som måste stämma:** tolv dagar ur `NO_RESPONSE_NUDGE_DAYS`, sju dagar efter intervju ur `INTERVJU_BESKED_DAGAR`, första uppföljningsutkastet gratis per konto och sedan Premium (`UPPFOLJNING_GRATIS_UTKAST`), Ska sökas och veckans mål gratis, statistiken gratis, rapportens antal gratis och raderna, utskriften och kopieringen i Premium. Aldrig att vi skickar mejl eller rapport, aldrig att rapporten "godkänns". Varje mening om Arbetsförmedlingens regler hänvisar till [Aktivitetsrapportera](https://arbetsformedlingen.se/for-arbetssokande/arbetslos---vad-hander-nu/aktivitetsrapportera) och står med datumet då källan lästes.

**Schema:** WebApplication (`name` "Jobbcoach.ai Sökta tjänster", `offers` med pris 0 SEK, `featureList` ur sidans egna rader), HowTo (de fyra stegen ordagrant som H3 och text), FAQPage (de åtta frågorna), BreadcrumbList "Hem / Verktyg / Sökta tjänster".

**Ord:** 900 till 1 100 i `main`, i nivå med de andra verktygssidorna (bedömning).

**Länkar ut från sidan:** /verktyg/jobbmatchning, /verktyg/personligt-brev, /verktyg/jobbcoachen, /verktyg/rekryteringstester (först i "Resten av jobbsöket"), artiklarna `soka-jobb-via-mail` och `uppfoljning-efter-intervju`, och Arbetsförmedlingens sida.

**Länkar in till sidan, med ankartext:**

| Från | Ankartext |
|---|---|
| Menyn och foten | Sökta tjänster |
| Startsidan, blocket i "Och resten av jobbsöket" | Så fungerar Sökta tjänster |
| /funktioner, nya H2 och brickan | Så fungerar Sökta tjänster, Sökta tjänster |
| /priser, nya H3 | Så fungerar Sökta tjänster |
| /verktyg/jobbmatchning, Från träff till ansökan | Håll koll på dina sökta jobb |
| /verktyg/jobbcoachen, nya blocket | Sökta tjänster |
| `soka-jobb-via-mail` (ART-17) | utkastet till uppföljningsmejlet (målet blir `/verktyg/sokta-tjanster` i stället för `/funktioner#sokta-tjanster`) |
| `uppfoljning-efter-intervju` (ART-18) | samma form som ART-17 |
| Artikelreklamens kort för Sökta tjänster | knappen |

Efter push får sidan sin första baslinje mot live (se `docs/publikt-omgang3/bygg/seo-baslinje.md`).

---

## Rader i undantagsfilen från det här beskedet

Tillagt i `scripts/seo-baslinje/publikt-omgang3-undantag.json` (inget borttaget):

- `RUBRIK_BYTT`: /verktyg/rekryteringstester, "h3 Lös frågorna i din takt" till "h3 Lös uppgifterna i din takt".
- `LD_UNDANTAG`: /verktyg/rekryteringstester (WebApplication, HowTo, FAQPage), /verktyg/linkedin-optimering (HowTo, FAQPage), /cv-mallar (HowTo), /personligt-brev-exempel (FAQPage), /personligt-brev-exempel/kategori/vard och /cv-exempel/kategori/vard (CollectionPage), /artiklar/soka-jobb-via-mail (BlogPosting, FAQPage) och /artiklar/uppfoljning-efter-intervju (BlogPosting). De två sista saknades för textbeslut ART-17 och ART-18.
- `LANK_BYTT`: /, "/funktioner#sokta-tjanster" till "/verktyg/sokta-tjanster".
- `HARD_SIDOR` (ny nyckel, grinden läser den sedan i dag): /cv-mallar med allt under, /exempel, /jobbkartan, /for-rekryterare med allt under, /verktyg/sokta-tjanster.

Rubrikbyten, FAQ-byten och schemaändringar som redan stod i textbeslutet hade sina rader sedan förut. Allt jag har sagt NEJ till har ingen rad, så grinden fäller det om det byggs ändå.
