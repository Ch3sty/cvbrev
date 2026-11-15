# Faktagranskning: content/artiklar/jobbcoach-online.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: större omskrivning rekommenderas, artikeln bär tre påhittade användarfall med mätta resultat och ett påhittat HR-citat, påhittad statistik och flera felaktiga produktuppgifter (fel antal analysområden, fel tonval, fel gratisnivå, en CV-analys som påstås jämföra mot annonsen).

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 377-436 | "Lisa, 28, marknadsförare ... Lisa fick intervju 4 dagar senare. HR-ansvarig sa: 'Ditt CV stack ut...'" | påhittat | Fallet framställs som verkligt med resultat och citat. Stryk, eller gör om till tydligt märkt hypotetiskt exempel utan utfall och citat. | – |
| 438-485 | "Marcus, 34 ... fick 7 intervjuer (23% success rate). Tackade ja till en L&D Manager-roll med 18% löneökning" | påhittat | Stryk utfallen, eller märk som påhittat exempel utan resultat. | – |
| 487-542 | "Nina, 41 ... 4 intervjuer (33% success rate) ... 1 jobberbjudande ... 15% löneökning" | påhittat | Som ovan. | – |
| 340-369 | "Exempel på verklig feedback: 43/100 ... 78% av din text kommer att missas av ... Teamtailor och Greenhouse" | påhittat | Inte verklig output; analysen ger inte procent "missad text" per ATS. Märk som illustration och stryk 78 %-siffran. | src/app/api/cv/analyze/route.ts |
| 163, 366, 506 | "78% av din text missas av system som Teamtailor och Greenhouse" / "ATS missar 65% av hennes kompetenser" | påhittat | Ingen källa, ingen sådan mätning görs. Stryk. | – |
| 71 | "Idag använder över 70% av svenska arbetssökande någon form av digital karriärhjälp" | obelagt | Ingen källa hittad. Stryk. | – |
| 12, 157, 974 | "analyserar ditt CV mot hundratusentals framgångsrika ansökningar och exakta ATS-algoritmer" | fel | Analysen tar bara emot CV:t (cvId) och bedömer det mot struktur, språk, nyckelord och kvantifiering. Ingen jämförelsedatabas, och leverantörernas algoritmer är inte kända för oss. Ersätt med "bedömer CV:t mot struktur, språk, nyckelord och kvantifiering". | src/app/api/cv/analyze/route.ts; cv-analys-faq-data.ts rad 16 |
| 14, 575, 993 | "algoritmerna är alltid uppdaterade med hur Teamtailor, Greenhouse och Workday fungerar" | fel | Som ovan, inget sådant i koden. Stryk. | – |
| 188, 197, 289-337 | "Analyserar ditt CV mot 7 områden ... Nyckelord, Formatering, Mätbarhet, Relevans, ATS-kompatibilitet, Tydlighet, Struktur" | fel | Sex kategorier: ATS-kompatibilitet, Struktur, Språk och grammatik, Nyckelord, Kvantifiering, Profil och styrkor. Tabellen rad 291-338 måste skrivas om. | src/app/(public)/verktyg/cv-analys/components/cv-analys-faq-data.ts rad 24; layout.tsx rad 7 |
| 328 | "Roller och arbetsgivare klara inom 6 sekunder" | fel | Ladders 2018: i genomsnitt 7,4 sekunder (6 sekunder var 2012-versionen). | Ladders eye-tracking 2018 (redan verifierat) |
| 218, 858, 433, 540 | "Gratis för första analysen" + Lisa/Nina gör om analysen och ser alla problem "0 kr (gratis version)" | fel | Gratis: en analys per konto som visar poängen, antal fynd och det tyngsta fyndet. Alla fynd och omkörning efter rättning kräver Premium. | cv-analys-faq-data.ts rad 32; quotaService.ts CV_ANALYSIS_LIMIT=1 |
| 22, 1060 | "ladda upp det i CV-analysen, klistra in jobbannonsen, se vilka nyckelord som saknas" | fel | CV-analysen tar ingen annons. Jämförelse mot annonser sker i jobbmatchningen. Byt verktyg i texten. | src/app/api/cv/analyze/route.ts (bara cvId) |
| 236, 868, 1013 | "Välj ton (Professionell / Entusiastisk / Konservativ)" | fel | Tonvalen är "Saklig, personlig eller vi väljer åt dig". | src/app/(public)/priser/page.tsx rad 258 |
| 283, 897 | Jobbcoachen: "Gratis att använda" | fel | Gratis är ett begränsat antal frågor (10 meddelanden), obegränsat i Premium. Skriv "Några frågor gratis, obegränsat med Premium". | src/lib/quota/quotaService.ts FREE_CHAT_MESSAGES_PER_ACCOUNT=10; features.ts chat_unlimited |
| 880 | "Kostnad: Gratis första brevet" | fel (ofullständigt) | Gratis: ett brev, sedan ett i veckan, att läsa men inte ladda ner. | priser/page.tsx rad 159; features.ts letter_download |
| 276-277 | "Tränad specifikt på svenska jobbansökningar" | obelagt (produkt) | Ingen egen modellträning i koden (tjänsten anropar en extern språkmodell). Ersätt med något vi kan stå för, t.ex. "instruerad för svensk arbetsmarknad". | – |
| 994 | "AI kan analysera 1000+ jobbannonser i din bransch på sekunder" | obelagt (produkt) | Stryk. | – |
| 916 | "Prioriterad support" (Premium) | obelagt (produkt) | Hittas inte i features/plans. Stryk. | src/lib/access/features.ts |
| 371 | "se din nya poäng (ofta 75-85/100)" | obelagt | Ingen data. Stryk "ofta 75-85". | – |
| 1108 | "Få 2-5% intervju-rate (branschsnitt)" | obelagt | Ingen källa. Stryk. | – |
| 1118 | "Öka dina chanser till intervju med 3-5x" | obelagt | Ingen källa. Stryk. | – |
| 3, 27, 60, 85, 561, 1083 | "800-1500 kr per timme", "paket 5000-15000 kr", seoTitle "(vs 1500 kr/h)" | obelagt | Ingen källa för spannet. Publika priser varierar kraftigt, t.ex. Unionens karriärcoachning 1 800 kr/h ordinarie (1 350 kr med medlemsrabatt) och Superprofs snitt runt 430 kr/h. Skriv "från några hundra till runt 2 000 kr i timmen" med exempel och källa. | https://www.unionen.se/medlemskapet/medlemsformaner/pt-din-karriar ; https://www.superprof.se/kurser/karriarcoaching/sweden/ (via sökning, sidorna ej öppnade i sin helhet) |
| 31, 106, 566 | "Närmaste lediga tid? Om två veckor", "1-4 veckors väntan", "de flesta är fullbokade" | obelagt | Ingen källa. Mjuka upp eller stryk. | – |
| 1132 | "Ingen registrering krävs för att testa. Du ser resultatet på 60 sekunder." | fel (delvis) | Utan konto finns en minianalys; den fullständiga analysen kräver gratiskonto. Skriv "Testa minianalysen utan konto". | src/app/(public)/verktyg/cv-analys/components/CVAnalysMini.tsx rad 152, 195 |

## Belagda påståenden
- Premium 149 kr/mån, ingen bindningstid (rad 87, 919): src/lib/plans/plans.ts; features.ts suggestPlan (bara all_month säljs).
- LinkedIn-optimering och jobbmatchning ingår i Premium (rad 914-915): features.ts `linkedin`, `job_matches_all`.
- Ett gratis CV-analysresultat på 0-100 (rad 196): cv-analys-faq-data.ts rad 20.
- Minianalys utan konto finns (rad 1132, delvis): CVAnalysMini.tsx.
- Räkneexemplen (5 400 - 298 = 5 102 kr; 3 h x 200 kr mot 149 kr ungefär fyra gånger om) stämmer aritmetiskt men vilar på obelagda coachpriser.

## Rättning (omgång 1, 2026-11-15)
Hela artikeln omskriven till dagens standard, samma slug, ämne, struktur och ungefär samma längd. `updated: "2026-11-15"` tillagt, källrad sist (Unionen, Arbetsförmedlingen Rusta och matcha, Ladders 2018).

- Lisa (rad 377-436): omskrivet till tydligt påhittat exempel ("Säg att Lisa ..."), klockslag, poäng 48/81, intervjuutfall och HR-citatet strukna. Resultatrutan ersatt med "Vad exemplet visar". Gratisnivån korrekt: hon ser poängen och tyngsta fyndet, alla fynd och omkörning kräver Premium.
- Marcus (rad 438-485): påhittat exempel utan utfall; 7 intervjuer, 23 %, 18 % löneökning, 8 000-12 000 kr och timräkningen strukna. Brev via jobbmatchningen i stället för "30 brev".
- Nina (rad 487-542): påhittat exempel; 65 %, poäng 52/84, 4 intervjuer, 33 %, jobberbjudande och 15 % strukna. Omkörning anges som Premium.
- "Exempel på verklig feedback" (rad 340-369): omdöpt till "Så kan ett resultat se ut (påhittat exempel)", 78 %-meningen ersatt med kvalitativ risk för kolumnlayout.
- 78 % / 65 % missad text (rad 163, 366, 506): struket överallt.
- "över 70 % av svenska arbetssökande" (rad 71): struket.
- "hundratusentals framgångsrika ansökningar och exakta ATS-algoritmer" (rad 12, 157, 974): ersatt med "bedömer ditt CV mot struktur, språk, nyckelord och kvantifiering" i frontmatter-FAQ, brödtext och FAQ-block.
- "alltid uppdaterade med Teamtailor, Greenhouse, Workday" (rad 14, 575, 993): struket; jämförelsetabellens rad blev "Kontrollerar rubriker, formatering och nyckelord i varje analys".
- 7 områden (rad 188, 197, 289-337): rättat till sex kategorier; tabellen omskriven till ATS-kompatibilitet, Struktur, Språk och grammatik, Nyckelord, Kvantifiering, Profil och styrkor.
- "6 sekunder" (rad 328): raden försvann med tabellen; i stället en mening med Ladders 2018, 7,4 sekunder, med källa.
- Gratisnivå CV-analys (rad 218, 858, 433, 540): rättat till en analys per konto med poäng, antal fynd och tyngsta fyndet; alla fynd och omkörning i Premium; minianalys utan konto nämnd.
- CV-analysen och annonsen (rad 22, 1060): rättat, jämförelse mot annonser sker själv eller i jobbmatchningen.
- Tonval (rad 236, 868, 1013): rättat enligt koden. Obs: prissidan säger "Saklig, personlig eller vi väljer åt dig", men brevflödet (TonalityLanguageStep.tsx) har Professionell, Entusiastisk, Kreativ, Självsäker, Balanserad och Premium kan välja ton åt dig (brev-faq-data.ts). Artikeln skriver "till exempel professionell, entusiastisk eller balanserad" plus Premiums tonval.
- Jobbcoachen "Gratis att använda" (rad 283, 897): rättat till tio meddelanden gratis, obegränsat med Premium.
- "Gratis första brevet" (rad 880): rättat till ett brev, sedan ett i veckan, att läsa men inte ladda ner.
- "Tränad specifikt på svenska jobbansökningar" (rad 276): ersatt med "instruerad för svensk arbetsmarknad" och källhänvisningarna som verktygssidan beskriver.
- "1000+ jobbannonser" (rad 994): struket.
- "Prioriterad support" (rad 916): struket, liksom "Nya verktyg när de lanseras". Premiumlistan följer HELA_PAKETET_RADER i plans.ts.
- "ofta 75-85/100" (rad 371): struket.
- "2-5 % intervju-rate" (rad 1108) och "3-5x" (rad 1118): strukna; även "5-10 små förändringar" mjukat till kvalitativt.
- Coachpriser (rad 3, 27, 60, 85, 561, 1083): spannet 800-1500 kr/h och paket 5 000-15 000 kr strukna. Ersatt med belagt exempel Unionen 1 800 kr/h, 1 350 kr för medlemmar (sidan kontrollerad 2026-11-15), plus Rusta och matcha via Arbetsförmedlingen (kontrollerad). Superprof inte använd (403). Kostnadstabellerna räknade om på Unionens pris: 7 200 kr (5 400 för medlemmar) mot 298 kr. ROI 4467 % och "13 602 kr" strukna; tidsvärderingen är nu ett uttryckligt antagande.
- Väntetider (rad 31, 106, 566): "två veckor", "1-4 veckor", "de flesta är fullbokade" och dagstidslinjen strukna; tidslinjen visar ett tänkt förlopp i steg.
- "Ingen registrering krävs" (rad 1132): rättat till "Prova minianalysen utan konto. Den fullständiga analysen kräver ett gratiskonto."
- Nytt avsnitt H3 "5. Rekryteringstester och jobbmatchning" enligt paket-copy.ts (fyra testtyper, tre nivåer, 25 träffar per natt, tre gratis), med länkar till /verktyg/rekryteringstester och /verktyg/jobbmatchning.

Ändrade rubriker (före/efter):
- H2 "Varför online jobbcoach har blivit standard 2026" -> "Fem skäl att välja en jobbcoach online" (påståendet var obelagt)
- H3 "2. Kostnad: 5000 kr vs 0-149 kr" -> "2. Kostnad: timpris mot 0 eller 149 kr i månaden"
- H3 "3. Snabbhet: 60 sekunder vs 3 veckor" -> "3. Snabbhet: en minut i stället för en bokad tid"
- H3 "4. Objektivitet och datadrivenhet" -> "4. Samma kriterier varje gång"
- H3 "2. Personliga brev på 30 sekunder" -> "2. Personliga brev på några sekunder"
- Ny H3 "5. Rekryteringstester och jobbmatchning"
- Övriga H2/H3 och Case-rubrikerna oförändrade.

FAQ-frågor: alla sex oförändrade, svaren omskrivna i både frontmatter och FAQ-blocket så att de säger samma sak.

seoTitle: "Jobbcoach online gratis: AI-hjälp på 60 sek (vs 1500 kr/h)" -> "Jobbcoach online gratis: AI-hjälp på 60 sekunder" (timpriset obelagt). title oförändrad.
description: "Jobbcoach online ger dig CV-feedback, personliga brev och ATS-analys på 60 sekunder, gratis att testa. Slipp 1500 kr/h och veckors väntan på en coach." -> "Jobbcoach online ger dig CV-analys, personliga brev och svar på jobbfrågor inom en minut, gratis att testa. Så står den sig mot en coach du betalar per timme." (158 tecken)

Interna länkar: alla kvar; nya länkar till /verktyg/rekryteringstester och /verktyg/jobbmatchning.
Bild: inte omgjord. Underlagets rader (brevöppningen, "Stark öppning", "Nyckelord från jobbannonsen", "Konkreta exempel från ditt CV", "Content Manager") står kvar ordagrant; artikelbild.ts kördes utan fel och gav en byte-identisk bild. imageAlt oförändrad.

## Andra granskningen (2026-11-15)
UNDERKÄND. Hela artikeln granskad mot källor och kod, inte bara diffen. Fynden från omgång 1 är åtgärdade (påhittade fall, citat, procentsatser, coachpriser, tonval, gratisnivåer, CV-analysen och annonsen, Jobbcoachens tio meddelanden). Men omskrivningen beskriver CV-analysen med två funktioner den inte har, och tre produktuppgifter säger mer än koden.

1. **CV-analysen ser inte layout.** Rad 13 ("layout som rekryteringssystem läser dåligt"), 48 ("Pekar ut kolumner, tabeller och rubriker som systemen har svårt att läsa"), 159 ("CV-analysen säger ungefär: 'Ditt CV har tre kolumner och textrutor ...'"), 304 ("Kolumner, tabeller, textrutor och text i sidhuvud eller sidfot"), 361 ("Din CV-mall använder tre kolumner och textrutor"), 404 (Lisas tyngsta fynd "Layouten med kolumner"), 498 (Ninas fynd "två kolumner och färgade rutor"), 966 ("Upptäcka layout ... (kolumner, tabeller, textrutor)"). **Fel (produkt).** Analysen får bara den utdragna CV-texten: route.ts hämtar texten med getCvText(cvId), och supabase/functions/analyze-cv-background/index.ts skickar maskerad text (maskForModel(cvText)) till modellen. Ingen del av flödet ser kolumner, textrutor, färger eller sidhuvud. Krävs: stryk att analysen upptäcker eller pekar ut layout. Rådet om enkel layout med en kolumn kan stå kvar som allmänt råd, inte som något verktyget hittar. Lisas och Ninas fynd byts mot fynd av den sort analysen faktiskt ger (svag profiltext, uppgifter utan resultat, saknade branschord).

2. **Inga betyg per kategori.** Rad 13 och 962 ("ger betyg i sex kategorier"), 46 ("betyg per område"), 136 ("betyg per område"), 193 ("Betyg i sex kategorier"), 572 ("Poäng, betyg i sex kategorier"), 844 ("Med Premium ser du alla fynd och betyget per kategori"), 344-349 (exempelrutan "2/10 Nyckelord", "3/10 ATS-kompatibilitet"). **Fel (produkt).** Resultatet har en samlad ATS-poäng 0-100 (atsFriendliness.score) och en potentialpoäng, plus fynd; inga delbetyg finns i analyze-cv-background/index.ts rad ~463-475 eller i AnalysisOverviewStep.tsx. Även den publika källan säger bara "förslag inom sex kategorier" (cv-analys-faq-data.ts rad 24), inte betyg. Krävs: "fynd i sex kategorier" eller "förslag inom sex kategorier", och exempelrutans två delbetyg ersätts med något som finns (samlad poäng, antal fynd). Upplysning till samordnaren: själva sexkategorilistan (Språk och grammatik, Kvantifiering, Profil och styrkor) följer den publika FAQ:n men motsvarar inte koden, där fynden grupperas som personbeskrivning, roller, kompetenser och allmänna förbättringar (Struktur, Formatering, Innehåll, Nyckelord). Artikeln får luta sig på FAQ:n, men FAQ:n och artikeln bör ses över ihop.

3. **Nyckelord mot annonser.** Rad 499 (Nina: "annonserna hon söker använder 'projektledare' och 'Scrum Master'") och rad 356 ("termer som är vanliga i rollen du söker"). **Fel (produkt), samma som den kända fakta-punkten.** Analysen tar bara CV:t och vet varken vilka annonser du söker eller vilken roll du siktar på; nyckelordsförslagen bygger på yrket den läser ut ur CV:t ("kompetenser som svenska jobbannonser söker efter för det här yrket", analyze-cv-background rad 235). Krävs: "branschtermer som är vanliga i ditt yrke" eller motsvarande, inget om annonserna hon söker.

4. **Jobbcoachen och ditt CV.** Rad 277 "Kan läsa ditt eget CV och svara utifrån det" står under en tillgång som anges som "Tio meddelanden gratis". **Ofullständigt.** Att bifoga CV ingår i Premium: "Vill du ställa fler frågor, spara dina samtal eller bifoga ditt CV ingår Jobbcoachen utan tak i ..." (src/app/(public)/verktyg/jobbcoachen/components/jobbcoachen-faq-data.ts rad 40). Krävs: "Med Premium kan den läsa ditt eget CV ...".

5. **Brevmallarna.** Rad 231 "Välj en av sju mallar". **Ofullständigt.** Tre mallar är gratis, fyra kräver Premium (tier i LETTER_TEMPLATES; personligt-brev/page.tsx räknar GRATISMALLAR). Kostnadsstycket rad 259 nämner bara fler brev och nedladdning. Krävs: "tre av mallarna är gratis, alla sju ingår i Premium" i steget eller i kostnadsstycket.

Kontrollerat och godtaget: Unionen 1 800 kr/h och 1 350 kr för medlemmar (unionen.se, PT för din karriär); Rusta och matcha "främst för dig som har varit inskriven ... under en längre tid", handledare hos vald leverantör, ersättning via Försäkringskassan (arbetsformedlingen.se); Ladders 2018, 7,4 sekunder; räkneexemplen (3 749, 2 849, 7 200, 5 400, 6 902, 5 102 kr) går ihop; tonvalen Professionell, Entusiastisk, Balanserad finns i TonalityLanguageStep.tsx och "vi väljer ton åt dig" är Premium; svenska och engelska; brev från en jobbmatchningsträff (JobDescriptionStep.tsx); gratis brev ett och sedan ett i veckan utan nedladdning (quotaService.ts); tio chattmeddelanden; en CV-analys per konto med poäng, antal fynd och tyngsta fyndet (gateAnalysisResult.ts, FREE_VISIBLE_FINDINGS = 1); minianalysen utan konto ("ATS-poäng och det viktigaste du bör ändra", CVAnalysMini.tsx); 30-60 sekunder; jobbmatchning mot Platsbanken, 25 träffar per natt, tre gratis; testerna fyra typer, tre nivåer, Nivåkollen och ett träningspass gratis; Premiumlistan ordagrant HELA_PAKETET_RADER; uppsägning med ett klick och "Månaden du redan betalat gäller ut" (priser-data.ts rad 215); bara Premium 149 kr/mån, inga veckopaket eller Dagspass. Inga påhittade citat eller verklighetsframställda fall kvar, de tre exemplen är tydligt märkta. Inga talstreck.

## Svar till samordnaren
jobbcoach-online, UNDERKÄND, CV-analysen påstås se layout (kolumner, textrutor) och ge betyg per kategori, Ninas nyckelordsfynd jämför mot annonser, Jobbcoachens CV-läsning och fyra av sju brevmallar anges inte som Premium.

## Rättning omgång 2 (2026-11-15)
Kontrollerat själv i koden: analyze-cv-background får bara CV-texten; resultatet är en samlad poäng och fynd; nyckelordsförslagen bygger på yrket i CV:t ("kompetenser som svenska jobbannonser söker efter för det här yrket"); jobbcoachen-faq-data.ts rad 40 (bifoga CV ingår i Premium); letter-templates.ts har sju mallar, tre med tier 'free'.

- Brist 1 (layout): alla påståenden om att analysen ser kolumner, tabeller, textrutor eller färger strukna.
  - Frontmatter-FAQ och FAQ-block: "layout som rekryteringssystem läser dåligt" / punkten "Upptäcka layout ..." ersatta med "profiltexter som kunde stå i vilket CV som helst" / "Hitta en profiltext som kunde stå i vilket CV som helst".
  - Listan under "Vad är en online jobbcoach?": ATS-punkten säger nu att analysen ger en poäng 0-100 för hur väl struktur och nyckelord fungerar i ett rekryteringssystem (enligt cv-analys-faq-data.ts).
  - Avsnitt 4 "Samma kriterier varje gång": konstruerade exemplet bytt från kolumnlayout till en svag profiltext ("Profiltexten räknar upp egenskaper ... Börja med din yrkesroll och lägg till ett konkret resultat"); "konkret risk" -> "konkret brist".
  - Kategoritabellen, ATS-raden, Vanliga problem: "Kolumner, tabeller, textrutor och text i sidhuvud eller sidfot" -> "Titel, arbetsgivare och datum är otydliga eller saknas".
  - Exempelrutan: fyndet "ATS-kompatibilitet ... tre kolumner och textrutor" ersatt med "Profil och styrkor: Profiltexten räknar upp egenskaper ...".
  - Lisa: tyngsta fyndet nu "Erfarenheterna beskriver arbetsuppgifter, inte vad de ledde till"; steg 3 skriver om rollerna med resultat och byter till enkel mall som allmänt råd ("eftersom en layout med kolumner kan läsas fel"), inte som analysens fynd; steg 4 exemplifierar med "saknade branschord och en svag profiltext". Hennes kolumn-CV i situationsbeskrivningen står kvar.
  - Nina: fynd 1 nu "Profil och styrkor: Profiltexten räknar upp egenskaper men säger inte vad hon har levererat"; Dag 1 "Flyttar in innehållet i en enkel CV-mall" -> "Skriver om profiltexten så att den börjar med rollen och ett resultat".
  - "Börja här"-rutan steg 2: "byt till en enkel CV-mall om layouten är problemet" -> "Har ditt CV flera kolumner är en enkel CV-mall ett säkrare val." (allmänt råd).
  - Avslutningen "Om ditt CV har en layout som systemen läser fel, ..." -> "Om ditt CV saknar nyckelord, har en profiltext som kunde stå i vilket CV som helst och inte visar dina resultat ...".
- Brist 2 (betyg per kategori): "betyg i sex kategorier" -> "förslag inom sex kategorier" (frontmatter-FAQ, FAQ-block, avsnitt 1 "Vad det gör", resultatlistan "Förslag inom sex kategorier: ..."); "betyg per område" -> "en samlad poäng och fynd med (konkreta/förslag på) åtgärder" (rad 46, 136); jämförelsetabellen "Poäng och fynd med åtgärd inom sex kategorier"; Steg 1 "alla fynd och betyget per kategori" -> "alla fynd i alla sex kategorier"; fetstilsraden "De sex kategorier vi bedömer:" -> "De sex kategorier vi ger förslag inom:" (fetstil, inte rubrik). Exempelrutans delbetyg 2/10 Nyckelord och 3/10 ATS-kompatibilitet ersatta med en ruta "9 / Fynd att åtgärda" bredvid samlad poäng 43/100 (grid 3 -> 2 kolumner).
- Brist 3 (nyckelord mot annonser): exempelrutan "termer som är vanliga i rollen du söker" -> "branschtermer som är vanliga i ditt yrke"; Nina "annonserna hon söker använder ..." -> "Hon skriver genomgående 'projektkoordinator' och saknar branschtermer som är vanliga i hennes yrke, till exempel ...".
- Brist 4 (Jobbcoachen och CV): "Kan läsa ditt eget CV ..." -> "Med Premium kan den läsa ditt eget CV och svara utifrån det".
- Brist 5 (brevmallar): steget "Välj en av sju mallar (tre är gratis, alla sju ingår i Premium), ..." och kostnadsstycket "Fler brev, de fyra mallarna utöver gratismallarna och nedladdning som PDF ingår i Premium."
- Rubriker (H2/H3), FAQ-frågor, title, seoTitle, description: oförändrade. Interna länkar: alla kvar. Bild inte omgjord (underlaget citerar bara brevexemplet, som är orört). Inga talstreck, taggarna balanserade (94/94 div), MDX kompilerar.
- Upplysning från granskaren om att sexkategorilistan i cv-analys-faq-data.ts inte motsvarar kodens gruppering är inte åtgärdad här (utanför artikeln).

## Rättning omgång 3 (samordnaren, 2026-11-15)
Brevmallarna enligt koden (DOCX_TEMPLATES, tier): sex mallar, fyra gratis och två i Premium (omgång 2 skrev sju/tre).

## Produktsvep (2026-11-15)
- Avsnitt 5, Rekryteringstester: "samma fyra typer: matrislogik, verbalt resonemang, numeriskt och personlighet, i tre nivåer" ersatt med de åtta testtyperna (matrislogik, figurserier, deduktiv slutledning, verbalt, numeriskt, talserier, spatial förmåga, ordförråd) i flera nivåer plus personlighetstest; gratisraden förtydligad till "ett träningspass samma dag och grundversionen av personlighetstestet".
- Avsnitt 5, Jobbmatchning: "Varje natt får du de 25 bästa träffarna" ersatt med att annonserna hämtas flera gånger per dygn och matchningen görs när du öppnar sidan; gratis tre träffar, Premium dina 25 bästa ("alla träffar" borttaget).
- Jobbcoachen: "Med Premium kan den läsa ditt eget CV" ändrat till "Du kan bifoga ditt eget CV så att den svarar utifrån det" (bifogning är inte Premiumspärrad i koden, src/app/api/jobbcoachen, ChatInput.tsx).
- Avsnittet om kostnad: "ett personligt brev att läsa" förtydligat till "personliga brev att läsa (det första och sedan ett i veckan)".
- Steg 4, "När Premium är värt det": "se alla träffar" ändrat till "se fler än tre träffar". "Vad Premium ger": "Jobbmatchning varje natt, alla träffar med skälen" ändrat till "Jobbmatchningen med dina 25 bästa träffar och skälen"; raden "Bli upptäckt av rekryterare, anonymt" struken (Premium krävs inte enligt facit).
- Inga rubriker, FAQ-frågor eller description ändrade. Bildunderlaget berörs inte.

## Tredje kontrollen (2026-11-15)
UNDERKÄND. Bristerna från andra granskningen är åtgärdade: inga påståenden om att analysen ser layout, "förslag inom sex kategorier" i stället för betyg, nyckelord mot yrket och inte mot annonser, sex brevmallar varav fyra gratis (facit), och produktsvepet stämmer med facit (åtta testtyper, grundversionen av personlighetstestet gratis enligt src/lib/plans/plans.ts, annonserna hämtas flera gånger per dygn och matchningen görs när sidan öppnas, tre träffar gratis och 25 i Premium, Bli upptäckt-raden struken). Att bifoga CV i Jobbcoachen är inte Premiumspärrat i koden (src/app/api/jobbcoachen/chat och upload saknar spärr), så produktsvepets rad 277 håller. FAQ i frontmatter och FAQ-block säger samma sak. Inga talstreck i ändrade rader.

- Rad 23 (frontmatter-FAQ), rad 49 (listan "En modern online jobbcoach hjälper dig med") och rad 1036 (FAQ-blocket): "låt jobbmatchningen visa vilka krav du täcker och vilka som saknas" / "visar vilka krav du täcker och vilka som saknas". Problem: säger mer än produkten och motsäger rad 370 ("Varje träff har skälen utskrivna: vilka roller och krav du täcker"). Skälen per träff är två till tre korta rader som "X av Y kompetenser i kravprofilen", "2 av dina 3 roller" och ort (src/app/dashboard/jobbmatchning/data/match-reasons.ts, buildMatchReasons); detaljvyn listar annonsens krav och meriterande (JobDetailModal.tsx, ReqColumn) men markerar inte vilka som saknas hos dig. Raderna finns inte på origin/main, de kom in i omskrivningen. Krävs: stryk "och vilka som saknas" på alla tre ställena, till exempel "låt jobbmatchningen visa hur många av kraven du täcker", samma lydelse i frontmatter och FAQ-block. Källa: produktfacit (2-3 skäl per träff) och match-reasons.ts.

Upplysning, inget krav på artikeln: den publika FAQ:n src/app/(public)/verktyg/jobbcoachen/components/jobbcoachen-faq-data.ts rad 40 säger fortfarande att bifoga CV ingår i Premium, vilket inte stämmer med koden.

## Rättning omgång 4 (samordnaren, 2026-11-15)
Bristen i tredje kontrollen åtgärdad exakt enligt kravet (se kontrollens punkt).
