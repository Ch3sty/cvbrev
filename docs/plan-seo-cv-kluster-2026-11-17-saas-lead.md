# Saas-leads beslut: SEO för CV-klustret, 2026-11-17

Svar på produktfrågorna P1 till P6 i `docs/plan-seo-cv-kluster-2026-11-17.md` och granskning av specen ur produktperspektiv. Allt nedan är kontrollerat i koden på main bc1eaca1 (samma som origin/main) 2026-11-17. SEO-strategens villkor i avsnitt 4 står orörda; säljfrågorna S1 till S6 svarar säljansvarig på i egen fil. Inga priser och inga gratisnivåer ändras.

## Produktfacit mot koden

Specens facit stämmer på alla tal utom ett.

| Påstående i specen | Koden | Stämmer |
|---|---|---|
| 40 mallar, 2 gratis (Linne, Björk) | `MALL_KATALOG` 40 rader, `niva: 'gratis'` på linne och bjork | Ja |
| 26 med Word, 24 utöver gratismallarna | 12 av de första 20 plus 21 till 34 har `word: true` | Ja |
| 15 med fotoplats, Björk den enda gratis | 15 rader med `foto: true`, bjork gratis | Ja |
| 17 i familjen en-spalt | 7 i utbud 1 plus 10 i utbud 2 | Ja |
| Fotomallar med Word "i dag 9" (B5, /cv-mallar/foto) | Björk, Koppar, Kalksten, Granit, Fasad, Alm, Sand, Loft, Betong, Ek: **10** | Nej, 10 |
| Jobbcoachen 3 förslag gratis per konto, 30 per dygn Premium | `FREE_CV_BYGG_AI_PER_ACCOUNT = 3`, `PAID_CV_BYGG_AI_PER_DAY = 30` i quotaService.ts rad 373 till 374 | Ja |
| En gratis nedladdning per konto, PDF eller Word | `FREE_CV_EXPORTS = 1`, generate-formatted räknar Word i gratismall som vanlig gratisexport | Ja |
| Två sparade CV på gratiskontot | `CV_GRANS_GRATIS = 2` i premiumAccess.ts | Ja |
| Tolv rubrikuppsättningar | `UPPSATTNING_IDS` har 12 poster | Ja |
| Nya byggaren live | 30486220 "arket är byggaren" och f039f965 ligger på origin/main; /dashboard/skapa-cv har StartBlad, ByggareClient, blad | Ja |
| /cv-mallar/prova läser mall, yrke, namn, titel | ProvaKontext.tsx rad 129 till 135: `mall`, `yrke`, `namn`, `titel` | Ja |
| "Intyg" och "utbildningen först" som val | `Ordning = 'standard' | 'intyg' | 'utbildning' | 'kompetenser'` i kontrakt.ts | Ja, fyra ordningar |
| Sidantal syns vid uppladdning | `sidantal_visat` i Mallyta.tsx | Ja |
| Lagringsundantaget: sparas i kontot efter första avsnittet, sedan efter varje avsnitt | ByggareClient.tsx rad 295 till 331: första sparade bladet skapar raden via /api/cv/save-improved, därefter PUT /api/cv/strukturerad efter varje blad och vid uppladdning | Ja |
| 74 yrkessidor, "listan har 75" (B8) | `YRKE_TILL_MALLAR` har 74 nycklar utan dubbletter, `YRKESMALL_SLUGS` 74, sitemap 74 | 75 finns inte i koden, se ändring 3 |

Talet 9 får ingen egen konsekvens eftersom specen redan säger att talen ska räknas ur katalogen, men formuleringen rättas så att ingen bygger efter fel tal (ändring 2).

## Beslut P1 till P6

**P1. Pilotens mallblock med tre riktiga miniatyrer.** Saas-lead, 2026-11-17: **Ja, som B3, med en regel för urvalet.** Motivering: `MallMiniatyr` och `losMallIdEllerForval` finns, prova tar `mall` och `yrke` ur adressen, och miniatyrer av riktiga mallar är det som fick nedladdningarna igång efter 16 nov. Regeln: de tre miniatyrerna ska vara tre olika mallar och minst en gratis; löser yrkets `free` till Linne visas Björk som tredje och tvärtom, och löser `premium` till en gratismall tas första premiummallen i samma familj ur katalogen. Varje miniatyr länkar till `/cv-mallar/prova?mall=<id>&yrke=<slug>`.

**P2. Trettonde rubrikuppsättningen "Engelska".** Saas-lead, 2026-11-17: **Inte i det här svepet. Förvalet står.** Motivering: en engelsk uppsättning i `rubriker.ts` är liten, men produkten skulle fortfarande skriva grå exempeltext, Jobbcoachens förslag, kontaktetiketter och Word-filens rubriker på svenska, och `test:ats` kontrollerar svenska rubriker, så ett löfte om "CV-mall på engelska" blir osant tills hela kedjan är engelsk. Tas upp i nästa mallomgång med hela omfånget (rubriker, exempeltext, förslagens språk, ATS-test). cv-pa-engelska-resume skriver som A6 säger: svenska uppsättningar, egen rubrik per avsnitt.

**P3. Stilsidornas galleri.** Saas-lead, 2026-11-17: **Förvalet: samma mallkort som /cv-mallar, klick till prova med mallen förvald.** Motivering: en komponent och ett beteende att underhålla, och uppladdningen är konverteringsvägen, inte galleriet. Tillägg: uppladdningsraden på stilsidorna ska vara samma `Uppladdning`-komponent inuti `ProvaProvider` (mönstret i CvMallarPageContent.tsx rad 74 till 107), inte bara en länk till `/cv-mallar#ladda-upp`, eftersom besökaren på /cv-mallar/word har högst avsikt av alla och inte ska byta sida för att ladda upp. Går det inte utan ny komponent faller det tillbaka till länken.

**P4. Word-undantaget för långt CV i sidospaltsmallar.** Saas-lead, 2026-11-17: **Ja, en mening, men i FAQ-svaret "Ser Word-filen likadan ut som PDF:en?" i stället för i avsnittet om Word mot PDF.** Motivering: sanningskravet säger att vi ska nämna det, men det rör fyra mallar vid långa CV och hör hemma där frågan ställs, inte i säljtexten. Lydelse: "Ja, samma layout, typsnitt och sidantal. I mallarna med sidospalt (Kalksten, Granit, Sand och Ek) kan ett avsnitt hamna på nästa sida i Word när CV:t är långt." Att Sockel, Ramverk och Kant ritar fasta element på varje sida nämns inte: de har ingen Word-version.

**P5. Inloggade på en stilsida.** Saas-lead, 2026-11-17: **RedirectLoggedIn till /dashboard/cv-mallar som på /cv-mallar, med `?mall=bjork` från /cv-mallar/foto.** Motivering: dashboardgalleriet har inget stilfilter (parametrarna är cv, mall, format, kop, ladda, foto), men läser `mall` via `losMallId` (page.tsx rad 104), så fotomallens sida kan förvälja den gratis fotomallen utan ny kod; /word och /enkla landar på förvalet Linne som redan är både Word och en spalt.

**P6. Demon på /verktyg/skapa-cv.** Saas-lead, 2026-11-17: **Ta bort den animerade demon helt och visa en stillbild av arket i Linne. Ny demo i senare omgång. Telefonskärmen får ny text.** Motivering: `SkapaCvLiveDemo.tsx` är inte en stegräknare på en demo utan hela demon är det gamla formulärflödet (steg1Inputs, steg3Inputs, aktiva steg 1 till 7, "Granska"), så att ta bort räknaren lämnar en demo som visar en produkt som inte finns. Stillbilden: `MallMiniatyr` med Linnes stora bild (`/mallar/v2/linne-stor.webp`), under den raden "Linne, gratis i PDF och Word" (samma rad som `ARTIKEL.mallrad`), hela blocket länkat till `/cv-mallar/prova?mall=linne`. `SkarmSkapaCv.tsx`: kick "Skapa CV", rubrik "Erfarenhet", sub "Mall: Linne. Tryck på ett avsnitt för att fylla i.", knappen "Spara" (texter.ts rad 65). Inget "steg 3 av 7", ingen "Nästa steg". Sammansättningen `handling` i VerktygsMall får inte bli tom; stillbilden tar platsen.

## Granskning ur produktperspektiv

### Skadar något konvertering eller produkt?

Nej, med tre tillägg.

1. **Kampanjfrysen 23 till 30 november gäller.** plan-mallar-2026-11-15 avsnitt 9: inget i mallflödets komponenter ändras på main under Black Week. Svepet ändrar CvMallarPageContent.tsx, ExempelMall.tsx och next.config.ts, alltså mallflödet. Beslut: hela svepet pushas till main senast **fredag 21 november 18:00** efter full grön grind, annars väntar mergen till 1 december. Ingen delpush av bara spår A under frysen (länkmålen /cv-mallar/word, /foto och /enkla finns inte då). IndexNow och indexeringslistan följer pushen.
2. **Pilotens tre djupyrken.** `yrkesmall-content.ts` har handskrivet djupinnehåll för 20 yrken, och tre av dem är pilotyrken: saljare (rad 1121), larare (rad 2169), barnskotare (rad 5275). B3 flyttar bara `rekryterarTipsen`, `atsInfo` och `faqItems`; `viktigtAttTankaPa`, `varforVarMallPassar` och `arbetsuppgifter` försvinner från sajten. Produktbeslut: de två fälten `viktigtAttTankaPa` och `arbetsuppgifter` följer med in i mallblocket som ett H3 "Det här ska synas i CV:t för ${yrkeLitet}" när exempelsidan inte redan har samma rubrik (normaliserad jämförelse som för tipsen); `varforVarMallPassar` stryks eftersom det beskriver yrkesmallar som inte finns. SEO-strategen avgör om det räknas som rubrik tillagd i undantagslistan (RUBRIK_BYTT på de fem) eller stryks; produkten klarar båda.
3. **Pilotblockets tre miniatyrer måste vara olika mallar** (P1 ovan). Utan regeln får yrken vars gamla free-id löser till Linne två Linne-kort.

### Är pilotens fem yrkespar rimliga?

Ja. Alla fem har publicerade CV-exempel sedan november 2025 (`publicerad.ts`), alla fem finns i `YRKE_TILL_MALLAR`, ingen av dem heter word, foto eller enkla, och kontrollgruppen är fem yrken med liknande volym där två (sjukskoterska, underskoterska) också har djupinnehåll, så jämförelsen 12 januari blir rättvis. Att tre av fem har djupinnehåll är en svaghet i mätningen (piloten förlorar text som kontrollgruppen behåller) och är skälet till tillägg 2 ovan.

### Övrigt kontrollerat

- `src/proxy.ts` skriver inte om /cv-mallar eller /artiklar, så 308:orna i B2 går rent genom next.config.
- ExempelMall.tsx rad 70 pekar redan primärknappen till `/cv-mallar/prova?yrke=<slug>`, så B3 bygger på en befintlig väg.
- /cv-exempel har 89 nycklar och 81 av dem har "Professionell Mall" i `metaTitle`; B6 tar bort ordet mall ur alla, vilket är rätt eftersom exempelsidan aldrig ska sälja en mall per yrke.
- `TOTAL_CV_YRKEN = 89` och `TOTAL_BREV_YRKEN = 89` finns för B7.
- `data-cta-klick` finns på alla knappar i dag; B10 kräver bara att nya länkar får samma attribut.
- Den ocommittade `/strumpan`-redirecten i next.config.ts ligger i arbetskopian på main; byggarna arbetar på egna grenar från bc1eaca1 och berörs inte, men den som mergar till main ska lämna raden orörd.

## Ändringar i specen (exakta ersättningar, görs av den som äger specfilen)

1. **B5 /cv-mallar/foto, description.** Ersätt `("eller Word" bara om minst en fotomall har Word, i dag 9)` med `("eller Word" bara om minst en fotomall har Word, i dag 10: Björk, Koppar, Kalksten, Granit, Fasad, Alm, Sand, Loft, Betong och Ek)`.
2. **B5 /cv-mallar/word, "Undantag i Word".** Ersätt `Ett avsnitt "Undantag i Word" om det finns kända skillnader mot PDF (fråga saas-lead P4, undantaget för långt CV i sidospaltsmallar, bc1eaca1).` med `Inget eget avsnitt om undantag. FAQ-svaret "Ser Word-filen likadan ut som PDF:en?" lyder: "Ja, samma layout, typsnitt och sidantal. I mallarna med sidospalt (Kalksten, Granit, Sand och Ek) kan ett avsnitt hamna på nästa sida i Word när CV:t är långt." (P4).`
3. **B8, andra punkten.** Ersätt `Yrkesmallarna från YRKESMALL_PUBLIKA (69 i stället för 74). Kontrollera varför listan har 75 och sitemap 74 i dag och skriv orsaken i commit-meddelandet; ändra inte beteendet om det är avsiktligt.` med `Yrkesmallarna från YRKESMALL_PUBLIKA (69 i stället för 74). YRKE_TILL_MALLAR har 74 nycklar, YRKESMALL_SLUGS 74 och sitemap 74 (kontrollerat 2026-11-17); logga YRKESMALL_LIST.length i bygget och skriv talet i commit-meddelandet.`
4. **B3 punkt 2, tre miniatyrer.** Ersätt `Tre riktiga miniatyrer (\`MallMiniatyr\`): yrkets \`free\`- och \`premium\`-mall ur YRKE_TILL_MALLAR (lös gamla id med \`losMallIdEllerForval\`) och den andra gratismallen;` med `Tre riktiga miniatyrer (\`MallMiniatyr\`) av tre olika mallar, minst en gratis: yrkets \`free\`- och \`premium\`-mall ur YRKE_TILL_MALLAR (lös gamla id med \`losMallIdEllerForval\`) och den andra gratismallen; löser free till Linne är den tredje Björk och tvärtom, löser premium till en gratismall tas första premiummallen i samma familj ur MALL_KATALOG;`
5. **B3 punkt 2, efter H3 om rekryterare.** Lägg till raden: `H3 \`Det här ska synas i CV:t för ${yrkeLitet}\` med yrkesmallens \`viktigtAttTankaPa\` och \`arbetsuppgifter\` när fälten finns (saljare, larare, barnskotare) och exempelsidan inte redan har samma rubrik (normaliserad jämförelse); \`varforVarMallPassar\` flyttas inte. SEO-strategen avgör om rubriken går in i RUBRIK_BYTT för de fem.`
6. **B1, SkapaCvLiveDemo och SkarmSkapaCv.** Ersätt `\`SkapaCvLiveDemo.tsx\` och \`SkarmSkapaCv\`: om demon visar sju steg eller en stegräknare, byt mot ett stillbild-ark av nya byggaren eller ta bort stegräknaren; fråga saas-lead (P6) om demon ska bytas helt. Ingen ny funktion i demon.` med `\`SkapaCvLiveDemo.tsx\` tas bort och \`handling\` får en stillbild: \`MallMiniatyr\` med Linnes stora bild, raden "Linne, gratis i PDF och Word" (samma rad som ARTIKEL.mallrad) och länk till /cv-mallar/prova?mall=linne. \`SkarmSkapaCv.tsx\`: kick "Skapa CV", rubrik "Erfarenhet", sub "Mall: Linne. Tryck på ett avsnitt för att fylla i.", knapp "Spara"; inget "steg 3 av 7". Ingen ny demo i det här svepet (P6).`
7. **B5, gemensamma krav.** Ersätt `uppladdningsraden till \`#ladda-upp\` på /cv-mallar eller samma Uppladdning-komponent` med `samma \`Uppladdning\`-komponent inuti \`ProvaProvider\` som på /cv-mallar (CvMallarPageContent.tsx rad 74 till 107); bara om det kräver en ny komponent faller sidan tillbaka till en länk till \`/cv-mallar#ladda-upp\` (P3)`.
8. **B5, gemensamma krav, RedirectLoggedIn.** Ersätt `\`RedirectLoggedIn\` till /dashboard/cv-mallar som på /cv-mallar.` med `\`RedirectLoggedIn\` till /dashboard/cv-mallar som på /cv-mallar; från /cv-mallar/foto till /dashboard/cv-mallar?mall=bjork (P5).`
9. **Avsnitt 3, Ordning och grind, punkt 3.** Ersätt `sedan push till main och IndexNow (\`npx tsx scripts/indexnow.ts\`). Ingen push före full grön grind.` med `sedan push till main och IndexNow (\`npx tsx scripts/indexnow.ts\`). Ingen push före full grön grind. Pushen sker senast fredag 21 november 18:00; hinns det inte väntar mergen till 1 december enligt kampanjfrysen i plan-mallar-2026-11-15 avsnitt 9, utan delpush av något av spåren.`
