# Faktagranskning: content/artiklar/vad-ar-en-jobbcoach.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: större omskrivning rekommenderas. Artikeln bygger på en påhittad fallstudie med citat ("Emma") och en påhittad användareffekt, och den har fel priser och paket genomgående. Den beskriver också flera produktflöden som inte finns (LinkedIn-URL, tonval, jobbmatchning mot inklistrad annons, "alla mallar gratis"). Punkträttning skulle lämna ett skal.

## Fynd att åtgärda

### Påhittat
| Rad | Citat | Förslag |
|---|---|---|
| 753–828 | "Case study: Så hjälpte Jobbcoach.ai Emma få 5 intervjuer på 2 veckor" med poäng 43/100 → 79/100, "15 ansökningar … 5 intervjuer … 1 jobberbjudande … 20% löneökning", "sparade … 8000-12000 kr" | Påhittad fallstudie som framställs som en verklig användare. Stryk hela avsnittet. Behåll eventuellt före/efter-raderna som ett tydligt märkt illustrativt exempel ("Ett påhittat exempel:") utan resultat. |
| 827 | Citatet "Efter första CV-analysen förstod jag varför jag aldrig kom till intervju …" (Emma, Product Manager) | Påhittat citat. Stryk. |
| 957 | "Du har sett konkret hur Emma gick från 0 till 5 intervjuer på två veckor." | Stryk, eftersom stycket hänvisar till den påhittade fallstudien. |
| 14, 859 | "De flesta användare som implementerar förslagen ser fler intervjuinbjudningar inom 1-2 veckor." | Ingen data om användarnas utfall finns. Stryk eller skriv om utan effektlöfte. |
| 824 | "33% success rate, genomsnittet är 2-5%" | Siffran ingår i den påhittade fallstudien och "genomsnittet" saknar källa. Stryk. |

### Fel (produkt och priser)
| Rad | Citat | Rätt uppgift | Källa |
|---|---|---|---|
| 16, 869 | "gratis eller från 79 kr i veckan" | Bara Jobbcoach Premium säljs, 149 kr i månaden. Veckopaket säljs inte. | src/lib/access/features.ts (suggestPlan → all_month), src/app/(public)/priser/page.tsx |
| 22, 921–927 | CV-paketet 79 kr/v, Träningspaketet 79 kr/v, Hela paketet 99 kr/v och 149 kr/mån | Ersätt med: "Jobbcoach Premium, 149 kr i månaden, ingen bindningstid. Gratis: Nivåkollen i testerna med genomgång och ett första träningspass, personlighetstestets grund, 3 CV-mallar och en nedladdning, en CV-analys med poäng och det tyngsta fyndet, ett personligt brev och sedan ett i veckan (att läsa, inte ladda ner), tre matchade jobb och tio frågor till Jobbcoachen." | priser/page.tsx rad 155–160, template-antal.ts, quotaService.ts, freeLimit.ts |
| 595 | "Hela analysen med obegränsade omkörningar ingår i CV-paketet, 79 kr i veckan." | Full CV-analys ingår i Premium, 149 kr/mån. | features.ts (cv_analysis_full) |
| 611 | "Nedladdning av det personliga brevet ingår i CV-paketet, 79 kr i veckan." | Ingår i Premium, 149 kr/mån. | features.ts (letter_download) |
| 676 | "79 kr i veckan eller 149 kr i månaden" | "149 kr i månaden (Premium)" | se ovan |
| 701 | "Obegränsade ansökningar med CV-paketet eller Hela paketet" | Paketnamnen finns inte längre. Skriv "med Premium". | se ovan |
| 959 | "Hela paketet för 149 kr i månaden" | "Jobbcoach Premium, 149 kr i månaden" | se ovan |
| 606 | "Välj ton: Professionell, Entusiastisk eller Konservativ" | Tonvalen är Professionell, Entusiastisk, Kreativ, Självsäker, Balanserad och "Vi väljer ton åt dig". Det finns ingen "Konservativ". | src/app/dashboard/skapa-brev/components/LetterFlowSummary.tsx rad 28–44 |
| 620 | "Klistra in din LinkedIn-profil-URL" | Användaren klistrar in profiltexten sektion för sektion eller fyller i från sitt CV. Ingen URL-import finns. LinkedIn-verktyget ingår i Premium. | src/app/dashboard/linkedin-optimizer/components/steps/Step1Mode.tsx, Step2Profile.tsx; features.ts (linkedin) |
| 645 | "Alla mallar är gratis att ladda ner." | 3 av 41 mallar är gratis, med en gratis nedladdning. De övriga 38 kräver Premium. | src/lib/cv/template-antal.ts (TEMPLATE_COUNT 41, FREE_TEMPLATE_COUNT 3, FREE_CV_EXPORTS 1) |
| 642 | "Bläddra bland 12+ professionella mallar" | Stämmer formellt men är inaktuellt: det finns 41 mallar. | template-antal.ts |
| 649–657 | Jobbmatchning: "Ladda upp ditt CV och klistra in jobbannonsen … matchningspoäng (0-100)" | Jobbmatchningen är en nattlig matchning av profilen mot lediga jobb med skäl per träff. Gratis visar 3 träffar per natt, Premium 25. Man klistrar inte in en enskild annons. | src/app/dashboard/jobbmatchning/JobbmatchningClient.tsx, src/lib/jobmatching/freeLimit.ts |
| 35, 57–58 | "gratis coaching via … a-kassa"; "A-kassor och fackförbund: inkluderar ofta någon form av karriärrådgivning i ditt medlemskap" | A-kassor betalar ut ersättning och erbjuder inte karriärcoachning. Det gör fackförbunden (t.ex. Unionen, Akademikerförbundet SSR). Stryk "a-kassa". | Allmänt känd ansvarsfördelning (a-kassornas uppdrag enligt lagen om arbetslöshetsförsäkring) |
| 188 | "Rekryterare spenderar 6-7 sekunder på första skanningen." | Ladders eye-tracking 2018: i snitt 7,4 sekunder (2012-versionen: 6 sekunder). Skriv "omkring 7 sekunder (Ladders 2018)". | TheLadders Eye-Tracking Study 2018 (theladders.com), redan verifierad av samordnaren |

### Obelagt
| Rad | Citat | Förslag |
|---|---|---|
| 111 | "Över 70% av svenska företag använder ATS" | Ingen källa. Stryk. En belagd uppgift i närheten: Experis 2023, 28 % av svenska arbetsgivare använde AI i rekrytering (men det mäter inte ATS). |
| 35, 65, 675, 738 | "privat coach kostar 800-1500 kr i timmen", "paket (5000-15000 kr totalt)" | Ingen prisundersökning hittad. Skriv "ofta från några hundra till över tusen kronor i timmen, enligt coachernas egna prislistor" eller ange en verklig källa. |
| 55 | "Kvaliteten varierar kraftigt … många rapporterar långa väntetider och generiska råd." | Obelagt omdöme om en myndighet. Stryk eller belägg (t.ex. med IAF-rapporter). |
| 60–61 | Trygghetsråden "hjälper uppsagda … Tillgång via tidigare arbetsgivare" | Förenklat och delvis inaktuellt. Sedan omställningsavtalen 2022 ger TRR och TSL även stöd till anställda (kompetensstöd), och rätten bygger på arbetsgivarens kollektivavtal. Skriv om. |
| 840 | "2-3 intervjuer per 10 ansökningar" | Ingen källa. Stryk siffran. |
| 18, 609, 691, 885 | "utkast på 90 sekunder" | Obelagt (produkt). Skriv "på någon minut". |
| 31, 161, 586, 959 | "60 sekunder" för CV-analysen | Obelagt (produkt). |
| 20, 161, 902 | "ATS-kompatibilitetspoäng" | Obelagt (produkt). Gratisanalysen ger en poäng och det tyngsta fyndet. Ingen separat ATS-poäng bekräftad i koden. |
| 153 | "Du får 85+ i ATS-poäng" | Obelagt (produkt). Stryk. |
| 202, 580, 587 | "7 områden … 7 delpoäng (Nyckelord, Formatering, Mätbarhet, Relevans, ATS-kompatibilitet, Tydlighet, Struktur)" | Obelagt (produkt). Koden visar kategoriflikar (testerna i cv-analys räknar med 4 kategorier) och ingen lista med sju delpoäng. Stryk listan eller stäm av mot analysens faktiska kategorier. |
| 565 | "kollar vi automatiskt av 18 av dessa punkter" | Obelagt (produkt). Stryk. |
| 637, 645 | "garanterat fungerar med alla stora ATS-system"; "testade med Teamtailor, Greenhouse, Workday och SAP SuccessFactors" | Obelagt (produkt). Inga tester dokumenterade. Stryk "garanterat" och systemlistan. |
| 621 | "synlighet jämfört med andra i din bransch" | Obelagt (produkt). Stryk. |
| 696, 867 | "Alltid uppdaterad med senaste ATS-algoritmer" | Obelagt (produkt). Stryk. |
| 711 | Intervjuträning "Begränsat (vi fokuserar på handlingar före intervju)" | Delvis inaktuellt. Det finns ett intervjuläge (src/app/dashboard/intervju, feature interview_unlimited) och rekryteringstesterna är kärnprodukten. Jämförelsetabellen nämner inte testerna alls. |

## Belagda påståenden
- Gratisnivån: 3 CV-mallar och en CV-analys med poäng och det tyngsta fyndet (template-antal.ts, quotaService.ts CV_ANALYSIS_LIMIT 1, priser/page.tsx).
- Personligt brev: att läsa gratis, ett första och sedan ett i veckan (priser/page.tsx rad 159).
- Brevflödet tar emot annons-URL (job_ad_url i src/app/dashboard/skapa-brev).
- /verktyg/linkedin-optimering, /verktyg/jobbmatchning, /verktyg/cv-mallar och /verktyg/jobbcoachen finns som sidor.
- Interna artikellänkar (jobbcoach-online, vanliga-cv-misstag, hur-skriver-man-ett-personligt-brev, ai-rekrytering-sverige, byta-karriar-jobbsokande-guide) finns.
- Unionen erbjuder karriärcoachning till medlemmar (allmänt känt).

## Rättning (omgång 1, 2026-11-15)
Hel omskrivning med samma slug, ämne och struktur, enligt samordnarens beslut. Produkten beskrivs som koden: bara Jobbcoach Premium, 149 kr i månaden, ingen bindningstid, gratisnivån enligt priser/page.tsx.

Påhittat
- Rad 753–828 (Emma-fallstudien med poäng, resultat, besparing och citat): struken i sin helhet. Före/efter-raderna för CV:t behållna i ett nytt, tydligt märkt avsnitt "Ett konstruerat exempel: samma erfarenhet, nya ord" utan poäng, resultat eller citat.
- Rad 827 (Emmas citat): struket.
- Rad 957 (hänvisningen till Emma i Nästa steg): struken, stycket omskrivet.
- Rad 14, 859 ("fler intervjuinbjudningar inom 1-2 veckor"): struket, FAQ-svaret omskrivet utan effektlöfte ("Hur snabbt det leder till intervjuer kan vi inte lova").
- Rad 824 ("33% success rate, genomsnittet är 2-5%"): struket med fallstudien.

Fel (produkt och priser)
- Rad 16, 22, 595, 611, 676, 701, 869, 921–927, 959: alla veckopaket (CV-paketet, Träningspaketet, Hela paketet 79/99 kr i veckan) borta. Ersatt med Jobbcoach Premium 149 kr i månaden och gratisnivån enligt priser/page.tsx (Nivåkollen med genomgång och ett första träningspass, personlighetstestets grund, 3 CV-mallar och en nedladdning, en CV-analys med poäng och tyngsta fyndet, ett brev och sedan ett i veckan att läsa, tre matchade jobb, tio frågor till Jobbcoachen). Premiums innehåll enligt HELA_PAKETET_RADER i plans.ts. FAQ i frontmatter och brödtext, tabellen och brödtexten säger samma sak. Länk till /priser tillagd i pris-FAQ:n.
- Rad 606 (tonval): rättat till Professionell, Entusiastisk, Kreativ, Självsäker, Balanserad eller "låt oss välja åt dig".
- Rad 620 (LinkedIn-URL): rättat till att klistra in profiltexten avsnitt för avsnitt eller fylla i från CV:t; LinkedIn-verktyget anges ingå i Premium.
- Rad 645 ("Alla mallar är gratis"), 642 ("12+ mallar"): rättat till 41 mallar, 3 gratis med en nedladdning, alla plus PDF och Word i Premium.
- Rad 649–657 (jobbmatchning mot inklistrad annons, matchningspoäng 0-100, "under 60%"): omskrivet till nattlig matchning av profilen med skäl per träff, 3 träffar gratis, upp till 25 per natt i Premium, brev direkt från en träff.
- Rad 35, 57–58 (a-kassa): a-kassan struken som coachningskälla; tillagt att a-kassan sköter ersättningen och att det är fackförbundet man vänder sig till. Rubriken "A-kassor och fackförbund" ändrad.
- Rad 188 (6-7 sekunder): rättat till "i snitt omkring 7 sekunder ... enligt jobbsajten TheLadders ögonrörelsestudie från 2018".
- Död länk /api/download-exempel?type=personligt-brev-content-manager (routen finns inte): knappen "Ladda ner detta exempel (Word)" borttagen, "Skapa ditt eget brev" står kvar.

Obelagt
- Rad 111 ("Över 70% av svenska företag använder ATS"): struket, ersatt med "Många arbetsgivare tar emot ansökningar i ett rekryteringssystem ...".
- Rad 35, 65, 675, 738 (800-1500 kr/timme, paket 5000-15000 kr): ersatt med "ofta över tusen kronor i timmen" och en belagd uppgift: Unionens karriärcoachning 1 800 kr i timmen ordinarie, 1 350 kr för medlemmar (unionen.se, PT för din karriär, kontrollerat). "Du har budget för det (5000-15000 kr)" ändrat till "budget för flera timmars coachning".
- Rad 55 (omdöme om Arbetsförmedlingen): struket, omskrivet neutralt (stöd utan kostnad, ibland via leverantör, fråga handläggaren).
- Rad 60–61 (Trygghetsråden): omskrivet. Stöd via omställningsavtal, i regel kollektivavtal hos arbetsgivaren; omställningsstöd vid uppsägning och sedan 2022 kompetensstöd för anställda (kontrollerat mot PTK/TRR-material).
- Rad 840 ("2-3 intervjuer per 10 ansökningar"): struket.
- Rad 18, 609, 691, 885 ("90 sekunder"): ändrat till "någon minut".
- Rad 31, 161, 586, 959 ("60 sekunder"): ändrat till "någon minut" eller struket.
- Rad 20, 161, 902 ("ATS-kompatibilitetspoäng"): ändrat till "en poäng från 0 till 100 och det tyngsta fyndet".
- Rad 153 ("85+ i ATS-poäng"): struket.
- Rad 202, 580, 587 (7 områden, 7 delpoäng): ersatt med de kategorier som verktygets egen sida anger (struktur, språk, nyckelord, mätbara resultat, profiltext), utan antal.
- Rad 565 ("18 av dessa punkter"): struket, rutan omskriven.
- Rad 637, 645 ("garanterat", testade med Teamtailor m.fl.): struket. Tillagt råd att kontrollera att texten går att markera i PDF:en om man väljer en mall med kolumner.
- Rad 621 ("synlighet jämfört med andra i din bransch"): struket.
- Rad 696, 867 ("alltid uppdaterad med senaste ATS-algoritmer"): struket, tabellraden omskriven till "Nyckelord och layout: ingår i CV-analysen och i breven".
- Rad 711 (intervjuträning "Begränsat"): tabellen uppdaterad med Inför intervjun (övning på intervjufrågor, inget rollspel) och en ny rad för rekryteringstester. Nytt avsnitt "Verktyg 6: Rekryteringstester och intervjuträning" och "Verktyg 7: Jobbcoachen".
- Även "Ofta 1-4 veckor för första mötet" (väntetid) och "särskilt 50+ anställda" (branscher) saknade källa och är omskrivna utan siffra.

Rubriker (före/efter)
- H2 "Case study: Så hjälpte Jobbcoach.ai Emma få 5 intervjuer på 2 veckor" → borttagen; ny H2 "Ett konstruerat exempel: samma erfarenhet, nya ord".
- H3 "INNAN: Generiskt brev (sorteras bort automatiskt)" → "INNAN: Generiskt brev"
- H3 "EFTER: Skräddarsytt och värdefokuserat (får intervju)" → "EFTER: Skräddarsytt och värdefokuserat"
- H3 "Verktyg 1: CV-analys (60 sekunder)" → "Verktyg 1: CV-analys"
- H3 "Verktyg 2: Personligt brev-generator (90 sekunder)" → "Verktyg 2: Personliga brev"
- H3 "Verktyg 4: CV-mallar (ATS-optimerade)" → "Verktyg 4: CV-mallar"
- H3 "Verktyg 5: Jobb-matchning" → "Verktyg 5: Jobbmatchning"
- Nya H3: "Verktyg 6: Rekryteringstester och intervjuträning", "Verktyg 7: Jobbcoachen"
- H4 "A-kassor och fackförbund" → "Fackförbund"; H4 "Trygghetsråden (TRR, TSL)" → "Omställningsorganen (TRR, TSL)"
- H4 i jämförelserutan: "Kreativ formatering (ATS kan inte läsa)" → "Kreativ formatering (svår för systemet att läsa)"; "ATS-optimerad formatering" → "Lättläst formatering"
- Title, seoTitle, slug och alla FAQ-frågor oförändrade.

Description
- Före: "Vad är en jobbcoach, vad gör den och vad kostar det? Vi reder ut rollen, priserna (gratis till 15 000 kr) och när du faktiskt behöver coachning."
- Efter: "Vad är en jobbcoach, vad gör den och vad kostar det? Vi reder ut rollen, var du hittar kostnadsfritt stöd och när du faktiskt behöver coachning." (144 tecken). Skäl: 15 000 kr var obelagt.

Övrigt
- Källrad tillagd sist: TheLadders 2018, Unionen (PT för din karriär), TRR (Frågor och svar).
- Språk: engelska ord i brödtext och checklistor försvenskade (headline → rubrik, bullet points → punkter, transferable skills → överförbara kompetenser m.fl.); tankstreck som pausmarkör i brevexemplets listor ersatta med kolon. Inga — i filen.
- Interna länkar: alla tidigare kvar utom den döda /api/download-exempel. Nya: /verktyg/rekryteringstester, /priser.
- `updated: "2026-11-15"` tillagt. Bildunderlaget citerar bara meningar som står kvar ordagrant; validering (--torr) utan fel, bilden inte omgjord.

## Andra granskningen (2026-11-15)
UNDERKÄND. Hela artikeln kontrollerad mot koden och källorna. Priserna och gratisnivån stämmer med priser/page.tsx, plans.ts (HELA_PAKETET_RADER, all_month 149 kr, det enda som säljs), template-antal.ts (41/3/1), freeLimit.ts (3 och 25 per natt) och quotaService.ts (10 frågor). Inför intervjun stämmer med infor-intervjun-copy.ts och interview_unlimited. Unionen (1 800/1 350 kr i timmen) och TRR (kollektivavtal, omställningsstöd, kompetensstöd, avtal från 1 oktober 2022) är kontrollerade. Inga veckopaket, inget Dagspass och inga talstreck. Emma-fallstudien, citatet och effektlöftena är borta.
- Rad 36, 66, 17/836 (FAQ): "en privat coach kostar ofta över tusen kronor i timmen" / "timpriset ligger ofta på över tusen kronor" / "över tusen kronor i timmen för många privata coacher". Den enda källan är Unionens prislista, en enda datapunkt. "Ofta" och "många" är en generalisering som källan inte bär. Krävs: "kan kosta över tusen kronor i timmen; Unionens karriärcoachning kostar till exempel 1 800 kr" eller en prisundersökning som källa.
- Rad 32 "i stället för efter veckors väntan och för tusentals kronor" och rad 762 "inte om flera veckor": väntetiden i veckor saknar källa (första granskningen strök "1-4 veckor", och tabellen på rad 690 säger korrekt "Beror på coachens kalender"). Krävs: stryk veckorna, till exempel "utan att boka tid".
- Rad 794: "det är samma jobb beskrivet med annonsernas ord. Det är just den översättningen som CV-analysen ... hjälper dig med". CV-analysen tar bara emot CV:t, ingen annons, och kan inte översätta mot annonsernas ord. Krävs: ta bort CV-analysen här, eller skriv "en bra jobbcoach" och hänvisa till brevverktyget, som tar annonsen.

## Rättning omgång 2 (2026-11-15)
- Timpriset (rad 17 FAQ, 36, 66, 685, 836 FAQ-block): "ofta"/"många" struket. Rad 36: "En privat coach kan kosta över tusen kronor i timmen, och Unionens karriärcoachning kostar till exempel 1 800 kr." Rad 66: "timpriset kan ligga på över tusen kronor". Tabellen rad 685: "Kan vara över tusen kronor i timmen" (Unionen-exemplet kvar). FAQ i frontmatter och FAQItem-blocket säger samma sak: "mot en privat coach som kan kosta över tusen kronor i timmen, som Unionens karriärcoachning för 1 800 kr". Unionens sida finns redan i källraden.
- Väntetid i veckor: rad 32 "i stället för efter veckors väntan och för tusentals kronor" -> "utan att du behöver boka tid eller betala per timme". Rad 762 "inte om flera veckor" -> "utan att boka tid".
- Rad 794: CV-analysen påstås inte längre översätta mot annonsernas ord. Nu: "Det är just den översättningen en bra jobbcoach hjälper dig med. När du har en annons att svara på tar vårt brevverktyg (/verktyg/personligt-brev) in annonsen och anpassar brevet efter den, och CV-analysen (/verktyg/cv-analys) går igenom själva CV:t." Länken till CV-analysen kvar, länk till brevverktyget tillagd.
- Rubriker, FAQ-frågor, description och title oförändrade. Underlaget docs/qa/artikelbilder/underlag/vad-ar-en-jobbcoach.json citerar ingen ändrad rad; bilden inte omgjord. Inga talstreck i ändrade rader.

## Produktsvep (2026-11-15)
- FAQ "Vad kostar Jobbcoach.ai?" (frontmatter och FAQItem): "jobbmatchning varje natt med alla träffar" blev "jobbmatchning med dina 25 bästa träffar"; Bli upptäckt struken ur Premium-listan (Premium krävs inte enligt koden).
- Verktyg 5 Jobbmatchning: "Varje natt matchar vi ..." blev att annonserna hämtas flera gånger om dygnet och att matchningen görs när du öppnar sidan; "nattens träffar" blev "dina träffar"; "alla nattens träffar, upp till 25 per natt" blev "dina 25 bästa träffar".
- Verktyg 4 CV-mallar: "nedladdning i både PDF och Word ingår i Premium" rättat, CV exporteras bara som PDF.
- Verktyg 2 brev: "eller låt oss välja åt dig" fick tillägget "(med Premium)".
- Inga rubriker, FAQ-frågor eller description ändrade. Bilden berörs inte.

## Tredje kontrollen (2026-11-15)
UNDERKÄND.
- Rad 596, "2. Klistra in jobbannonsen eller länken till den". Problem: brevverktyget hämtar inte annonser från en länk; annonsen klistras in som text (produktfacit: "annonsen klistras in (ingen URL-hämtning)"; i src/app/dashboard/skapa-brev finns inget URL-fält, job_ad_url fylls bara när brevet startas från en jobbmatchningsträff). Raden ändrades i denna gren (tidigare "(eller URL till annonsen)") men felet följde med. Krävs: "2. Klistra in jobbannonsen". Källa: produktfacit, src/app/dashboard/skapa-brev/CreateLetterClient.tsx.

Kontrollerat utan anmärkning: timpriset (rad 17, 36, 66, 685, 836) säger "kan kosta över tusen kronor" med Unionens 1 800 kr som exempel, frontmatter-FAQ och FAQItem lika; veckoväntan struken (rad 32, 762); rad 794 tillskriver inte längre CV-analysen annonsmatchning; produktsvepet stämmer med facit (matchning när sidan öppnas, annonser hämtas flera gånger om dygnet, gratis 3 och Premium 25 träffar, Bli upptäckt inte i Premium-listan, CV bara som PDF, "låt oss välja" ton bara med Premium, 41/3/1 mallar, fem toner). Inga talstreck i ändrade rader.

## Rättning omgång 4 (samordnaren, 2026-11-15)
Bristen i tredje kontrollen åtgärdad exakt enligt kravet (se kontrollens punkt).
