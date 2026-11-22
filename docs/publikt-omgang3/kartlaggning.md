# Publika sidor mot produkten: samlad kartläggning, omgång 3

Granskat 2026-11-22 mot commit `5adfc7a1` (arbetskopian `cvbrev-publikt3`). Grenarna `fix/brev-kvar` och `feat/jobbsoket-omgang2` räknas som live. Bara kodläsning, ingen server, ingen databas. Inget i produktkoden är ändrat.

## Sammanfattning

- **Antal poster:** /verktyg/cv-analys 12, gemensamma källor för /priser och /funktioner 13, /priser 11, /funktioner 10, startsidan 8, /verktyg/personligt-brev 2, /verktyg/jobbmatchning 6, /verktyg/jobbcoachen 2, /verktyg/skapa-cv 2, övriga verktygssidor 0, mallar och exempel 1, informationssidor 3, meny och sidfot 1, registrering 5, artiklarnas reklam 4, artiklar 19, telefonskärmar 6. Totalt 105 poster.
- **De fem allvarligaste:** (1) startsidan lovar "poäng 1 till 10 på tydlighet och struktur, innehåll, resultat och nyckelord" (STA-1). (2) Gratislöftet "poängen och det tyngsta fyndet" står i den gemensamma gratiskällan och når /priser, startsidans FAQPage, artiklarnas gratiskort och registreringen, fast gratis ser hela genomgången i sju delar för varje CV (GEM-1, CVA-5, PRI-1). (3) /verktyg/cv-analys beskriver sex kategorier och "förslag i fyra delar" i synlig text, HowTo, WebApplication och FAQPage, fast analysen har sju delar och mäter inga nyckelord (CVA-1, CVA-2, CVA-4). (4) "Matchningen körs när du öppnar sidan" står kvar på sju ställen, ett i FAQPage på /funktioner (FUN-1, GEM-10, STA-4, JM-3, ART-3, ART-8, ART-11). (5) Startsidan säger att Jobbcoachen känner till matchningar och testresultat, och /funktioner lägger matchningen och Jobbcoachen under "Bara i Jobbcoach Premium" (STA-5, FUN-3).
- **Struket som redan rättat:** brevets säljsida (sju mallar, gamla mallnamn, "de sju mallarna", HowTo om mall), tonraden på prissidans kort, SkarmBrev ("Ton: saklig"), exempelvisningens "Sju mallar" och "Mallen Klassisk", MallVisningar ("Fyra är gratis"), MallMiniatyr på /funktioner, tre artikelrader om brevmallar, den publika delningssidan för Sökta tjänster, kampanjmejlet, skärmbilden i `public/`, mini-analysens svar på inskannad PDF och artikeln om uppföljning efter intervju (sju dagar efter intervju gäller nu). Se avsnittet "Struket".
- **Dagspasset** säljs inte (`src/lib/plans/plans.ts:146` `saljs: false`) och nämns inte på någon publik sida. Bara Jobbcoach Premium, 149 kr i månaden, säljs (`plans.ts:180-194`, `:232`).

Allvar: 1 osant om pris, gräns eller funktion. 2 vilseledande. 3 kosmetiskt. "Gamla" anger postnummer i `docs/publika-sidor-jobbsoket-2026-11-21.md` (JS) eller avsnitt i `docs/rapporter/publika-sidor-avvikelser-2026-11-21.md` (AVV).

## Produktfacit som posterna vilar på

- CV-analysen: sju delar, 100 poäng (`src/lib/cv/poang/modell.ts:66-74`). Namnet är läsbarhetspoäng (`src/app/dashboard/cv-analys/analysTexter.ts:15`). Genomgången visas för varje CV utan kvot och utan analysjobb (`src/app/dashboard/cv-analys/analysData.ts:300-311`). Det som räknas en gång per konto är "Hämta Jobbcoachens förslag" (`analysTexter.ts:43-45`, `analysData.ts:343-363`). Poängen räknas om när användaren sparar (`analysTexter.ts:37`). Kontrollerna står i `src/lib/cv/poang/genomgang.ts:83-109`; ingen kontroll gäller nyckelord, bransch, kolumner eller filformat, kompetenser räknas bara som antal och längd (`modell.ts:274-283`).
- Inskannad PDF läses bara inloggat och bara på svenska (`src/lib/cv-parser/ocr.ts:74-79`). Publikt får besökaren ett besked med väg till kontot (`src/app/api/public/quick-score/route.ts:35-46, 116-122`).
- Brev: fem toner plus auto i Premium (`src/lib/letters/brevRegler.ts:34-35`, `src/components/brev3/arbete/texter.ts:8-23`). Gratis kan ändra de två senaste breven (`src/lib/letters/letter-quota.ts:12`, `src/lib/letters/lista.ts:16, 65-67`). Nedladdning kräver Premium (`src/app/api/letters/download/route.ts:339`).
- Jobbsöket: flikarna Översikt, Matchade jobb, Sökta tjänster, Inför intervjun (`src/components/jobb3/kit/flikar.ts:23-26`). Matchningen körs bara på knapparna "Sök igen" och "Hitta jobb som passar" (`src/components/jobb3/jobb/MatchadeJobb.tsx:481, 962, 1072, 1082`), CV:t läses in automatiskt och knappen heter "Byt CV" (`MatchadeJobb.tsx:470-478, 866, 918`). Annonserna hämtas 05, 13 och 21 UTC (`supabase/migrations/20260616_schedule_sync_global_jobs.sql:28-30`). Gratis tre träffar, Premium 25 (`src/lib/jobmatching/freeLimit.ts:10, 17`). Uppföljningsmejl: första gratis, sedan Premium med 30 per dygn (`src/lib/jobbsok/uppfoljning.ts:282`, `src/lib/jobbsok/typer.ts:406`). Rapportens radlistor, utskrift och kopiering är låsta för gratis (`src/components/jobb3/sokta/Rapport.tsx:343-351, 380`). Jobbcoachen får målroll, stad och bransch ur profilen och bara de dokument användaren bifogar (`src/app/api/jobbcoachen/chat/route.ts:240-253`), och visar "Frågor utifrån ditt läge" (`src/components/jobb3/coach/CoachVy.tsx:340`). Att dela CV är spärrat bara när kvoten är slut (`CoachVy.tsx:364`).
- Omgång 2 (räknas som live): statusen "Kallad till test" (`git show feat/jobbsoket-omgang2:src/lib/applications/status.ts`, `test_invited`), påminnelse sju dagar efter intervju eller provjobb (`feat/jobbsoket-omgang2:src/lib/jobbsok/typer.ts:25` `INTERVJU_BESKED_DAGAR = 7`), "När är intervjun?" (`feat/jobbsoket-omgang2:src/components/jobb3/intervju/IntervjuFraga.tsx`), "Vilken tjänst gäller provet?" (`feat/jobbsoket-omgang2:src/components/tester-v4/hem/TjanstFraga.tsx`), brickan "Logga en tjänst du har sökt" (`feat/jobbsoket-omgang2:src/lib/onboarding/komigang.ts:403`).

---

## 1. /verktyg/cv-analys

**CVA-1** (gamla: AVV CV-analys `page.tsx:14-21, 158`)
- Fil och rad: `src/app/(public)/verktyg/cv-analys/page.tsx:14-21` och `:158`
- Står i dag: "Sex saker rekryteraren och systemet ser först", med raderna "Läsbarhet för rekryteringssystem", "Struktur", "Språk och grammatik", "Nyckelord", "Kvantifiering", "Profil och styrkor". Rad 15: "Att rubriker, formatering och filstruktur fungerar i de system svenska arbetsgivare sorterar med. Inga kolumner som förvirrar maskinen." Rad 18: "Vi jämför med vanliga söktermer i din bransch och flaggar de viktigaste som saknas".
- Fel därför att: analysen har sju andra delar och kontrollerar varken filstruktur, kolumner, grammatik eller branschens söktermer.
- Belägg: `src/lib/cv/poang/modell.ts:66-74`, `src/lib/cv/poang/genomgang.ts:83-109`, `src/app/dashboard/cv-analys/analysTexter.ts:116`.
- Var syns det: synlig text (kontrollrutan, H2 och sex rubriker).
- Typ: OSANT
- Allvar: 1

**CVA-2** (gamla: AVV `page.tsx:52, 87, 145`, `layout.tsx:13`, FAQ `:24`)
- Fil och rad: `page.tsx:52`, `:87`, `:145`; `layout.tsx:13`; `components/cv-analys-faq-data.ts:24`
- Står i dag: rad 52 "förslag i fyra delar (personbeskrivning, roller, kompetenser, allmänna råd)"; rad 87 "Du får en ATS-poäng från 0 till 100, poängen du kan nå med förslagen och förslag i fyra delar med exakt vad som bör ändras."; rad 145 `{ tal: '4', text: 'delar med förslag' }`; layout rad 13 "Du får en ATS-poäng plus konkreta förslag i fyra delar."; FAQ rad 24 "Förslagen kommer i fyra delar. Personbeskrivning: ... Roller: ... Kompetenser: ... Allmänna råd: struktur, formatering, innehåll och nyckelord som rekryteringssystemen letar efter".
- Fel därför att: genomgången har sju delar (Kontaktuppgifter, Personbeskrivning, Erfarenhet, Kompetenser, Utbildning, Språk, Datum, ordning och längd), och "allmänna råd" finns inte som del.
- Belägg: `modell.ts:66-74`; `analysTexter.ts:55-56` ("Sju delar. ... har poäng kvar.").
- Var syns det: JSON-LD WebApplication (`featureList`), JSON-LD HowTo steg 3 och samma text som synligt steg (rad 153), löftesraden (synlig), OG-description, FAQPage och synlig FAQ.
- Typ: OSANT
- Allvar: 1

**CVA-3** (gamla: AVV AVVÄGNING)
- Fil och rad: `layout.tsx:9`, `:11`, `:21`; `page.tsx:42`, `:52`, `:60`, `:85`, `:87`; `components/cv-analys-faq-data.ts:19-20`; `components/CVAnalysMini.tsx:151`
- Står i dag: "ats-poäng" (keywords), "CV-analys på 60 sekunder med ATS-poäng" (OG- och twitter-titel), "CV-analys som ger ATS-poäng från 0 till 100", "ATS-poäng 0-100", "få ATS-poäng", "Få ATS-poäng och förslag", "Vad betyder ATS-poängen?" med svaret "ATS-poängen är ett mått från 0 till 100 på hur väl ditt CV fungerar med Applicant Tracking Systems", mini: "så får du en ATS-poäng och det viktigaste du bör ändra".
- Fel därför att: produkten kallar talet läsbarhetspoäng, och FAQ-svaret säger att poängen mäter hur CV:t fungerar i ett ATS, vilket SEO-regel 5 i AVV förbjuder.
- Belägg: `analysTexter.ts:15`, `:31-32`; regeln i `docs/rapporter/publika-sidor-avvikelser-2026-11-21.md:157`.
- Var syns det: metatitel (OG, twitter), keywords, JSON-LD WebApplication och HowTo, HowTo-steget som synlig rubrik, FAQPage och synlig FAQ, mini-analysens ruta.
- Typ: NAMN
- Allvar: 2

**CVA-4** (gamla: AVV FÖRÅLDRAT `:80, :138`, FAQ `:16`)
- Fil och rad: `page.tsx:80`, `:138`; `layout.tsx:13`, `:23`; `components/cv-analys-faq-data.ts:16`
- Står i dag: "Vi kontrollerar struktur, språk, nyckelord och kvantifierade resultat." (rad 80); "Vi läser ditt CV som ett rekryteringssystem gör och kontrollerar struktur, språk, nyckelord och kvantifiering." (rad 138); "Vi kontrollerar struktur, språk, nyckelord och kvantifiering." (layout 13 och 23); FAQ: "kontrollerar struktur, språk, nyckelord och kvantifiering".
- Fel därför att: ingen kontroll gäller nyckelord eller språk; siffror och verb räknas inom delen Erfarenhet.
- Belägg: `genomgang.ts:83-109`, `modell.ts:274-283`.
- Var syns det: HowTo steg 2 (JSON-LD och synligt), ingressen, OG- och twitter-description, FAQPage och synlig FAQ.
- Typ: OSANT
- Allvar: 2

**CVA-5** (gamla: AVV `:171`, FAQ `:32`)
- Fil och rad: `layout.tsx:7`, `:13`, `:23`; `page.tsx:49`, `:143`, `:170-171`; `components/cv-analys-faq-data.ts:31-32`
- Står i dag: "En analys gratis per konto." (description, OG, twitter); "1 CV-analys gratis per konto, ingen kortuppgift" (offers); löftet "1 analys / gratis per konto"; slutblocket "Hela analysen, varje fynd med åtgärd." och "Poängen och det tyngsta fyndet är gratis. Hela analysen, alla mallar och personliga brev utan tak ingår i Premium."; FAQ "Hur många analyser får jag göra gratis?" med "En analys per konto är gratis ... Du ser läsbarhetspoängen, hur många fynd vi hittade och det tyngsta fyndet i klartext med åtgärd. Vill du se alla fynd och köra om analysen efter en rättning ingår det i Premium".
- Fel därför att: gratis ser poängen och vad som saknas i alla sju delar för varje CV utan kvot; det som räknas en gång per konto är att hämta Jobbcoachens förslag, och Premium ger alla förslag och nya förslag.
- Belägg: `analysData.ts:300-311`, `:343-363`; `analysTexter.ts:43-45`, `:51`.
- Var syns det: metabeskrivning, OG, twitter, JSON-LD WebApplication (offers), löftesraden, slutblocket, FAQPage och synlig FAQ.
- Typ: OSANT
- Allvar: 1

**CVA-6** (ny)
- Fil och rad: `components/cv-analys-faq-data.ts:35-36`
- Står i dag: "Kan jag köra analysen igen när jag ändrat i CV:t?" med "Ja. Med Premium kör du analysen utan tak, så du kan rätta efter fynden, ladda upp igen och se om poängen rör sig."
- Fel därför att: poängen räknas om för alla när de sparar, utan kvot; Premium gäller nya förslag, inte nya körningar av poängen.
- Belägg: `analysTexter.ts:37`, `:45`, `:59`; `analysData.ts:300-311`.
- Var syns det: FAQPage och synlig FAQ.
- Typ: OSANT
- Allvar: 1

**CVA-7** (ny)
- Fil och rad: `page.tsx:76-80`; `components/cv-analys-faq-data.ts:15-16`
- Står i dag: HowTo steg 2 "Vi analyserar i bakgrunden" med "Det tar 30 till 60 sekunder."; FAQ "Mellan 30 och 60 sekunder från att du klickat på \"Analysera\"."
- Fel därför att: genomgången visas direkt för varje CV utan analysjobb, och knappen heter "Hämta Jobbcoachens förslag" ("Tar under en minut"), ingen knapp heter Analysera.
- Belägg: `analysData.ts:300-311`; `analysTexter.ts:43-44`; `docs/bygg-noter-cv-rummet.md:528-532`.
- Var syns det: JSON-LD HowTo och synligt steg, FAQPage och synlig FAQ.
- Typ: GAMMAL VY
- Allvar: 2

**CVA-8** (gamla: AVV FÖRÅLDRAT `:73`)
- Fil och rad: `page.tsx:71-73`
- Står i dag: "Ladda upp ett befintligt CV som PDF eller välj ett du redan sparat. Analysen är byggd för svenska CV."
- Fel därför att: uppladdningen tar också Word, och en inskannad PDF läses inloggat men bara på svenska; ingenting av det sägs.
- Belägg: `src/app/api/cv/upload/route.ts:32`; `ocr.ts:74-79`; SEO-regel 6 i AVV rad 158.
- Var syns det: JSON-LD HowTo steg 1 och synligt steg.
- Typ: SAKNAS
- Allvar: 2

**CVA-9** (ny)
- Fil och rad: `page.tsx:89-95`; `components/cv-analys-faq-data.ts:43-44`
- Står i dag: HowTo steg 4 "Spara den förbättrade versionen" med "Välj vilka förslag du vill applicera, granska före och efter och ladda ner som PDF."; FAQ "Du får upp resultatet direkt och kan välja vilka förslag du vill applicera. Klickar du i en förbättring uppdateras potentialpoängen i realtid ... När du är nöjd kan du spara den förbättrade versionen och ladda ner den som PDF."
- Fel därför att: förslagen måste hämtas (en gång gratis), "Ersätt mitt nuvarande CV" är vägen att spara, analysen har ingen egen nedladdning och filen laddas ner i Mallar som PDF eller Word.
- Belägg: `analysTexter.ts:34-38`; `src/app/dashboard/cv-analys/components/save/SaveActionSegments.tsx:8, 39`.
- Var syns det: JSON-LD HowTo och synligt steg, FAQPage och synlig FAQ.
- Typ: GAMMAL VY
- Allvar: 2

**CVA-10** (ny)
- Fil och rad: `components/cv-analys-faq-data.ts:27-28`
- Står i dag: "Har du ett engelskt CV går det att ladda upp, men räkna med att förslagen blir på svenska."
- Fel därför att: svaret säger inte att ett inskannat CV bara läses på svenska.
- Belägg: `ocr.ts:74-79`.
- Var syns det: FAQPage och synlig FAQ.
- Typ: SAKNAS
- Allvar: 3

**CVA-11** (gamla: AVV FÖRÅLDRAT mini `:118-120`)
- Fil och rad: `components/CVAnalysMini.tsx:117-120`, `:133`
- Står i dag: "Skapa ett gratiskonto så kör vi en full analys av hela CV:t. Du får läsbarhetspoängen, hur många fynd vi hittade och det tyngsta fyndet i klartext med åtgärd." och knappen "Se hela analysen".
- Fel därför att: kontot visar genomgången i sju delar med vad som saknas i varje del, inte ett antal fynd och ett tyngsta fynd.
- Belägg: `analysTexter.ts:55-56`, `:113-118`; `analysData.ts:300-311`.
- Var syns det: synlig text i mini-analysens resultatruta.
- Typ: OSANT
- Allvar: 2

**CVA-12** (gamla: AVV fynd "annan sorts fynd")
- Fil och rad: `components/CVAnalysMini.tsx:82-110`
- Står i dag: "Det här bör du fixa först" och de grå raderna "Förbättring {i + 2} av {result.lockedImprovementCount + 1}".
- Fel därför att: texterna kommer ur en separat basanalys (`analyzeCvBasic`) som kontot aldrig visar, så raderna utlovar fynd som inte låses upp med ett konto.
- Belägg: `src/app/api/public/quick-score/route.ts:142, 152-160`.
- Var syns det: synlig text i mini-analysens resultatruta.
- Typ: GAMMAL VY
- Allvar: 2

Telefonskärmen på sidan: se TEL-1.

---

## 2. Gemensamma källor för /priser och /funktioner (och fler sidor)

**GEM-1** (gamla: AVV gratiskällan)
- Fil och rad: `src/lib/plans/gratis-copy.ts:54`, `:65`, `:81-82`, `:105`
- Står i dag: "En CV-analys med poängen och det tyngsta fyndet" (listan), "en CV-analys med poängen och det tyngsta fyndet" (långa meningen, delarna och FAQ-svaret).
- Fel därför att: gratis ser genomgången i sju delar för varje CV utan kvot; bara Jobbcoachens förslag räknas en gång per konto.
- Belägg: `analysData.ts:300-311`; `analysTexter.ts:43-45`.
- Var syns det: /priser rutan "Vill du se först?" (`src/app/(public)/priser/page.tsx:160` via `paket-copy.ts:162`), startsidans FAQ och FAQPage (`Startsidan.tsx:127`, `:131-148`), artiklarnas gratiskort (`src/components/artiklar/reklam/reklam-copy.ts:256`), registreringens steg 3 på `/dashboard/valkommen` (`registrering-copy.ts:222`, `:230`).
- Typ: OSANT
- Allvar: 1

**GEM-2** (ny)
- Fil och rad: `gratis-copy.ts:55`, `:66`, `:84`
- Står i dag: "Ett personligt brev var sjunde dag, att läsa på skärmen"; "ett personligt brev var sjunde dag att läsa på skärmen".
- Fel därför att: första brevet är fritt och de två senaste breven går att ändra på gratisnivån, inte bara läsa.
- Belägg: `src/lib/letters/letter-quota.ts:12`; `src/lib/letters/lista.ts:16, 65-67`.
- Var syns det: /priser "Vill du se först?", artiklarnas gratiskort, registreringens steg 3.
- Typ: SAKNAS
- Allvar: 3

**GEM-3** (gamla: JS 2.2)
- Fil och rad: `gratis-copy.ts:51-57`, `:63-67`, `:73-89`, `:92-94`, `:103-106`
- Står i dag: sista raden "Tre matchade jobb och tio meddelanden till Jobbcoachen" och motsvarande slut i meningarna.
- Fel därför att: gratislistan nämner inte Sökta tjänster (loggning, Ska sökas, veckans mål, statistik), första uppföljningsmejlet eller intervjuprovet ett per dygn.
- Belägg: `src/lib/jobbsok/uppfoljning.ts:282`; `src/components/jobb3/kit/flikar.ts:25`; beslut 4 i `docs/beslut-jobbsoket-2026-11-21.md:160`.
- Var syns det: /priser, startsidans FAQPage, artiklarnas gratiskort, registreringens steg 3.
- Typ: SAKNAS
- Allvar: 2

**GEM-4** (gamla: JS 2.1)
- Fil och rad: `src/lib/plans/plans.ts:93-99`
- Står i dag: fem rader, från "Åtta testtyper i tre nivåer, övningsprov mot klockan och det fördjupade personlighetstestet" till "Intervjuprovet utan dagsgräns och hela din testhistorik".
- Fel därför att: Premiumlistan saknar uppföljningsmejlen (30 per dygn) och månadsrapporten att skriva ut och kopiera, som är Premium.
- Belägg: `src/lib/jobbsok/typer.ts:406`; `src/components/jobb3/sokta/Rapport.tsx:343-351, 380`.
- Var syns det: /priser listan "Allt i Premium" (`priser/page.tsx:122`), startsidans Premiumblock (`Startsidan.tsx:362`), artiklarnas listslutkort (`reklam-copy.ts:271`), prisschemat (`highlights`).
- Typ: SAKNAS
- Allvar: 2

**GEM-5** (gamla: AVV "hela analysen")
- Fil och rad: `plans.ts:95`; `src/app/(public)/verktyg/linkedin-optimering/page.tsx:208`; `src/app/(public)/verktyg/linkedin-optimering/components/linkedin-optimering-faq-data.ts:47`; `src/app/(public)/verktyg/skapa-cv/page.tsx:233`; `reklam-copy.ts:77`, `:223`
- Står i dag: "Alla CV-mallar, CV-analysen, personliga brev och LinkedIn" (Premiumlistan); "tillsammans med alla CV-mallar, hela CV-analysen, personliga brev utan tak och rekryteringstesterna" (LinkedIn, sida och FAQ); "Alla 40 mallar, Word i alla 26 Word-mallar, hela CV-analysen och nedladdning utan tak ingår i Premium" (skapa-cv); "Alla 40 mallar och hela CV-analysen ingår i Premium, 149 kr i månaden." och "Hela CV-analysen med varje fynd och åtgärd" (reklam).
- Fel därför att: hela genomgången är gratis; det Premium lägger till är Jobbcoachens förslag, nya förslag och "Ersätt mitt nuvarande CV".
- Belägg: `analysData.ts:300-311`; `analysTexter.ts:43-45`; `SaveActionSegments.tsx:39`.
- Var syns det: synlig text på /priser, startsidan, /verktyg/linkedin-optimering (slutblock och FAQPage), /verktyg/skapa-cv (slutblock), artiklarnas inlinekort och slutkort.
- Typ: OSANT
- Allvar: 2

**GEM-6** (gamla: JS 2.5 delvis)
- Fil och rad: `plans.ts:184`
- Står i dag: "Tester, CV, personliga brev, jobbmatchning och Jobbcoachen"
- Fel därför att: raden nämner inte Jobbsöket med Sökta tjänster och uppföljningsmejlen.
- Belägg: `flikar.ts:23-26`; `typer.ts:406`.
- Var syns det: /priser OG-undertitel (`priser-data.ts:227`), artiklarnas sidokort (`reklam-copy.ts:166`, `:174`, `:182`), kontosidan. /priser hjälten har samma ord hårdkodade (`priser/page.tsx:105`).
- Typ: SAKNAS
- Allvar: 3

**GEM-7** (gamla: AVV paket-copy `:195, :196, :200`)
- Fil och rad: `src/components/pricing/paket-copy.ts:195`, `:196`, `:197-202`
- Står i dag: "Ingår i Premium. Gratis: poängen och det tyngsta fyndet."; "inom en minut får du en läsbarhetspoäng från 0 till 100, vad den kan bli när du följt förslagen, och förslagen i fyra delar: personbeskrivning, roller, kompetenser och allmänna råd om struktur, formatering, innehåll och nyckelord. Varje fynd har en åtgärd."; stegen "Nyckelorden rekryteringssystem (ATS) letar efter i din bransch." och "Rätta, kör om, se poängen röra sig."
- Fel därför att: gratis ser hela genomgången, delarna är sju, inga nyckelord mäts och poängen räknas om vid sparning för alla.
- Belägg: `modell.ts:66-74`, `:274-283`; `analysData.ts:300-311`; `analysTexter.ts:37`.
- Var syns det: /priser station CV-analysen (`priser/page.tsx:251-252`), /funktioner #cv-analys (`FunktionerSida.tsx:191-193`).
- Typ: OSANT
- Allvar: 1

**GEM-8** (ny)
- Fil och rad: `paket-copy.ts:210`
- Står i dag: "Ingår i Premium. Gratis: ett personligt brev att läsa, nedladdning ingår inte."
- Fel därför att: gratis ger det första brevet och sedan ett var sjunde dag, och de två senaste går att ändra; raden säger ett brev.
- Belägg: `src/lib/quota/quotaService.ts:38-39`; `letter-quota.ts:12`.
- Var syns det: /priser station Personliga brev (`priser/page.tsx:268`).
- Typ: OSANT
- Allvar: 2

**GEM-9** (gamla: AVV AVVÄGNING `:211, :216`)
- Fil och rad: `paket-copy.ts:211`, `:216`
- Står i dag: "Redigera, ladda ner som PDF, skicka."
- Fel därför att: Word finns i 26 av 40 mallar och nämns inte.
- Belägg: `src/lib/cv/mallar/katalog.ts:139, 155`; `src/components/brev3/arbete/texter.ts:158-159`.
- Var syns det: /priser (text), /funktioner #brev (text och steg).
- Typ: SAKNAS
- Allvar: 3

**GEM-10** (gamla: JS 1.5)
- Fil och rad: `paket-copy.ts:245`
- Står i dag: "Varje gång du öppnar sidan får du de 25 bästa träffarna med skälen utskrivna: vilka krav du täcker och vad som saknas."
- Fel därför att: sidan visar senaste körningen och söker om bara på knapptryck; "vad som saknas" kan bara visas för annonser med utskriven kravprofil.
- Belägg: `MatchadeJobb.tsx:481, 962, 1072, 1082`; för "vad som saknas" finns belägget bara i `docs/bygg-noter-jobbsoket.md` (beslut 16), ej belagt i kod.
- Var syns det: /priser station Matchade jobb (`priser/page.tsx:287`), /funktioner #jobbmatchning (`FunktionerSida.tsx:283`).
- Typ: OSANT
- Allvar: 1

**GEM-11** (gamla: JS 1.15 i sak)
- Fil och rad: `paket-copy.ts:254`
- Står i dag: "Svaren utgår från svensk arbetsmarknad och ditt eget CV, inte från en amerikansk mall."
- Fel därför att: Jobbcoachen ser CV:t bara när användaren bifogar det, annars målroll, stad och bransch ur profilen.
- Belägg: `src/app/api/jobbcoachen/chat/route.ts:240-253`.
- Var syns det: /priser station Jobbcoachen (`priser/page.tsx:298`), /funktioner #jobbcoachen (`FunktionerSida.tsx:292`).
- Typ: OSANT
- Allvar: 2

**GEM-12** (gamla: JS 2.7)
- Fil och rad: `paket-copy.ts:239-256`
- Står i dag: korten "Matchade jobb" ("Från en träff skriver du det personliga brevet med ett klick.") och "Jobbcoachen".
- Fel därför att: inget kort för Sökta tjänster eller Inför intervjun, och Matchade jobb nämner inte Spara till Ska sökas, Markera som sökt eller sista ansökningsdag; Jobbcoachens förslag utifrån läget saknas.
- Belägg: `src/components/jobb3/jobb/AnnonsVy.tsx:52-53`; `MatchadeJobb.tsx:105`; `CoachVy.tsx:340`.
- Var syns det: /priser och /funktioner.
- Typ: SAKNAS
- Allvar: 3

**GEM-13** (gamla: JS 2.8)
- Fil och rad: `paket-copy.ts:269-281`
- Står i dag: "11 steg", bland dem "CV uppladdat och analyserat", "CV:t uppdaterat efter fynden", "Första jobbmatchningen: jobb du inte hittat själv".
- Fel därför att: brickan "Logga en tjänst du har sökt" finns i Kom igång sedan omgång 2 och saknas i listan.
- Belägg: `feat/jobbsoket-omgang2:src/lib/onboarding/komigang.ts:403`. Osäkert om brickan visas i Premiums lista (beslut 21 säger gratislistorna först).
- Var syns det: /priser #guide.
- Typ: SAKNAS
- Allvar: 3

---

## 3. /priser

**PRI-1** (gamla: AVV priser-data `:131-134`)
- Fil och rad: `src/app/(public)/priser/components/priser-data.ts:131-134`
- Står i dag: label "CV-analys", sub "poäng, fynd, nyckelord", gratis "Poäng och tyngsta fyndet" med "en gång", Premium "Hela rapporten" med "kör om utan tak".
- Fel därför att: gratis ser hela genomgången för varje CV; det som gäller en gång är att hämta förslagen; nyckelord mäts inte.
- Belägg: `analysData.ts:300-311`, `:343-363`; `genomgang.ts:83-109`.
- Var syns det: synlig tabell "Vad som ingår, rad för rad".
- Typ: OSANT
- Allvar: 1

**PRI-2** (ny)
- Fil och rad: `src/app/(public)/priser/page.tsx:253-258`
- Står i dag: "Poäng per område: Och de fynd som drar ned mest.", "Nyckelorden: De rekryteringssystem (ATS) letar efter i din bransch.", "Rätta, kör om: Se poängen röra sig."
- Fel därför att: nyckelord mäts inte, och delarna heter delar i produkten.
- Belägg: `genomgang.ts:83-109`; `analysTexter.ts:52-56`.
- Var syns det: synliga steg i CV-analysens station.
- Typ: OSANT
- Allvar: 2

**PRI-3** (gamla: AVV `paket-copy.ts:214`, flyttat)
- Fil och rad: `priser/page.tsx:272`
- Står i dag: "Välj ton: Saklig, personlig eller vi väljer åt dig."
- Fel därför att: tonerna heter Professionell, Entusiastisk, Kreativ, Självsäker och Balanserad, och automatiskt tonval kräver Premium.
- Belägg: `src/components/brev3/arbete/texter.ts:8-23`; `src/lib/letters/brevRegler.ts:34-35`.
- Var syns det: synligt steg i brevets station.
- Typ: NAMN
- Allvar: 2

**PRI-4** (ny)
- Fil och rad: `priser/page.tsx:274`
- Står i dag: "Redigera, ladda ner som PDF, skicka"
- Fel därför att: Word nämns inte.
- Belägg: `katalog.ts:139, 155`.
- Var syns det: synligt steg i brevets station.
- Typ: SAKNAS
- Allvar: 3

**PRI-5** (gamla: AVV `priser-data.ts:137-139`)
- Fil och rad: `priser-data.ts:137-140`
- Står i dag: "CV-nedladdning", sub "som PDF", gratis "1 gång".
- Fel därför att: CV:t laddas också ner som Word i 26 mallar, gratismallarna inräknade.
- Belägg: `katalog.ts:139, 155`; `src/lib/cv/template-antal.ts:34`.
- Var syns det: synlig tabell.
- Typ: SAKNAS
- Allvar: 3

**PRI-6** (gamla: AVV `:145-146`)
- Fil och rad: `priser-data.ts:143-146`
- Står i dag: gratis "1, sedan 1 i veckan" med "läsa, inte ladda ner"; Premium "Utan tak" med "nedladdning som PDF".
- Fel därför att: de två senaste breven går att ändra gratis, och Premium laddar ner som PDF eller Word.
- Belägg: `letter-quota.ts:12`; `lista.ts:65-67`; `katalog.ts:139`.
- Var syns det: synlig tabell.
- Typ: SAKNAS
- Allvar: 3

**PRI-7** (gamla: JS 2.3)
- Fil och rad: `priser-data.ts:156-178`
- Står i dag: gruppen "Jobb och coachning" med Matchade jobb, Jobbcoachen och Intervjuprovet.
- Fel därför att: Sökta tjänster, uppföljningsmejlet (ett gratis, sedan Premium) och rapporten saknas.
- Belägg: `uppfoljning.ts:282`; `typer.ts:406`; `Rapport.tsx:343-351`.
- Var syns det: synlig tabell.
- Typ: SAKNAS
- Allvar: 2

**PRI-8** (gamla: JS 2.4)
- Fil och rad: `priser-data.ts:193-194`
- Står i dag: "Allt vi gör: alla CV-mallar, CV-analysen, personliga brev och LinkedIn, alla rekryteringstester med övningsprov, intervjuprovet utan dagsgräns och personlighetstestet, jobbmatchning med de 25 bästa träffarna och Jobbcoachen."
- Fel därför att: "Allt vi gör" utelämnar uppföljningsmejlen och rapporten.
- Belägg: `typer.ts:406`; `Rapport.tsx:380`.
- Var syns det: FAQPage och synlig FAQ.
- Typ: SAKNAS
- Allvar: 2

**PRI-9** (gamla: JS 2.5)
- Fil och rad: `priser-data.ts:222`
- Står i dag: "CV-analys, personliga brev, rekryteringstester, jobbmatchning och Jobbcoachen ingår."
- Fel därför att: Jobbsöket nämns inte.
- Belägg: `flikar.ts:23-26`.
- Var syns det: metabeskrivning.
- Typ: SAKNAS
- Allvar: 3

**PRI-10** (gamla: JS 2.6)
- Fil och rad: `priser/page.tsx:71-77`
- Står i dag: `{ objekt: 'cv', ..., tal: CV_ANALYSIS_LIMIT, text: 'CV-analys' }`, ritat som "1 CV-analys", och siffrorna slutar med "3 matchade jobb".
- Fel därför att: genomgången är inte begränsad till en; och Sökta tjänster saknas bland gratissiffrorna.
- Belägg: `analysData.ts:300-311`; `quotaService.ts:59` (kvoten gäller förslagen).
- Var syns det: synliga siffror "Gratisnivån i siffror".
- Typ: OSANT
- Allvar: 2

**PRI-11** (ny)
- Fil och rad: `priser-data.ts:75-80`
- Står i dag: "Grundnivån", "alla åtta testtyperna och personlighetstestet", gratis "Ingår, med genomgång".
- Fel därför att: gratisnivån är ett grundnivåtest om dagen, vilket raden inte säger (resten av sidan säger det).
- Belägg: `src/lib/traning/gratisniva.ts:24`; `quotaService.ts:20`.
- Var syns det: synlig tabell.
- Typ: SAKNAS
- Allvar: 3

---

## 4. /funktioner

**FUN-1** (gamla: JS 1.4)
- Fil och rad: `src/app/(public)/funktioner/FunktionerSida.tsx:87-88`
- Står i dag: "Matchningen körs när du öppnar sidan."
- Fel därför att: sidan visar senaste körningen och söker om först på knapptryck.
- Belägg: `MatchadeJobb.tsx:481, 962, 1072, 1082`.
- Var syns det: FAQPage (`FunktionerSida.tsx:382`, `schema`) och synlig FAQ.
- Typ: OSANT
- Allvar: 1

**FUN-2** (gamla: AVV `:93`)
- Fil och rad: `FunktionerSida.tsx:96`
- Står i dag: "en CV-analys med poäng och det tyngsta fyndet"
- Fel därför att: se GEM-1.
- Belägg: `analysData.ts:300-311`.
- Var syns det: FAQPage och synlig FAQ.
- Typ: OSANT
- Allvar: 1

**FUN-3** (gamla: JS 1.13)
- Fil och rad: `FunktionerSida.tsx:269-276`
- Står i dag: "Bara i Jobbcoach Premium, 149 kr i månaden" och ingressen "Jobbmatchning, Jobbcoachen så mycket du vill och intervjuprovet utan dagsgräns, plus alla rekryteringstester, alla CV-mallar, CV-analysen och personliga brev."
- Fel därför att: tre träffar, tio meddelanden till Jobbcoachen och ett intervjuprov om dagen är gratis, och korten i samma block säger det.
- Belägg: `freeLimit.ts:10`; `quotaService.ts:47`; `priser-data.ts:172-175`.
- Var syns det: synlig rubrikrad över blocket på bläck.
- Typ: OSANT
- Allvar: 1

**FUN-4** (gamla: JS 1.14, 2.10)
- Fil och rad: `FunktionerSida.tsx:366-370`
- Står i dag: "Håll koll på var varje ansökan står: sökt, svar, intervju, erbjudande. Gratis för alla med konto, och ett personligt brev från en träff hamnar där av sig självt."
- Fel därför att: brevet blir en sökt tjänst först när användaren trycker "Markera som sökt"; dessutom saknas Ska sökas, veckans mål, uppföljningsmejlet och rapporten.
- Belägg: `src/components/brev3/arbete/BrevetVy.tsx:422, 602-604`; `texter.ts:168-170`.
- Var syns det: synligt kort under "Alla verktyg, samlade" (ankaret `#sokta-tjanster`, länkat från startsidan).
- Typ: OSANT
- Allvar: 2

**FUN-5** (gamla: AVV `:172`)
- Fil och rad: `FunktionerSida.tsx:175`
- Står i dag: "Ingår i Premium. Gratis: första brevet, sedan ett i veckan, att läsa och kopiera. Nedladdning ingår inte."
- Fel därför att: de två senaste breven går att ändra gratis.
- Belägg: `letter-quota.ts:12`; `lista.ts:65-67`.
- Var syns det: synlig gratisrad i brevets station.
- Typ: SAKNAS
- Allvar: 3

**FUN-6** (gamla: AVV AVVÄGNING `:64`)
- Fil och rad: `FunktionerSida.tsx:67`
- Står i dag: "Poäng per område och varje fynd med åtgärd."
- Fel därför att: åtgärdstexterna är Jobbcoachens förslag, en gång gratis och sedan Premium; produkten säger delar, inte områden.
- Belägg: `analysTexter.ts:43-51`.
- Var syns det: synlig länklista "Alla verktyg, samlade".
- Typ: NAMN
- Allvar: 3

**FUN-7** (ny, samma påstående på flera ställen)
- Fil och rad: `FunktionerSida.tsx:68`, `:209`; `src/components/registrering/registrering-copy.ts:41`
- Står i dag: "Steg för steg, med exempel för varje del."; "Bygg CV:t steg för steg: Personuppgifter, profil, erfarenhet, utbildning, kompetenser och språk, med exempel för varje del."; "Bygg det steg för steg eller ladda upp ditt gamla och se vad rekryteraren ser."
- Fel därför att: byggaren är "Direkt på arket" med avsnitt man trycker på, inte ett flöde i steg.
- Belägg: `src/app/dashboard/skapa-cv/texter.ts:1-21`; `src/components/publikt/telefon/skarmar/SkarmSkapaCv.tsx:2-5`.
- Var syns det: /funktioner länklista och avsnittet Skapa CV, registreringens första steg (kortet "Skriva CV").
- Typ: GAMMAL VY
- Allvar: 3

**FUN-8** (gamla: AVV `:209`)
- Fil och rad: `FunktionerSida.tsx:212`
- Står i dag: "Ladda ner som PDF" med "Utan tak i Premium, en nedladdning på gratisnivån."
- Fel därför att: Word finns i 26 mallar, också i gratismallarna.
- Belägg: `katalog.ts:139, 155`.
- Var syns det: synlig rubrik och text i avsnittet Skapa CV och mallar.
- Typ: SAKNAS
- Allvar: 3

**FUN-9** (ny)
- Fil och rad: `FunktionerSida.tsx:64`
- Står i dag: "Matrislogik, deduktivt, verbalt, numeriskt, talserier, spatial förmåga och ordförråd i tre nivåer, övningsprov mot klockan och inför I-provet."
- Fel därför att: figurserier saknas bland testtyperna, så raden räknar sju av åtta.
- Belägg: `src/lib/tester/antal-testtyper.ts:18-21`.
- Var syns det: synlig länklista.
- Typ: SAKNAS
- Allvar: 3

**FUN-10** (gamla: JS 2.9)
- Fil och rad: `FunktionerSida.tsx:53-61`, `:63-75`; `src/app/(public)/funktioner/page.tsx:17`, `:25`
- Står i dag: sju ankare och elva verktyg utan Sökta tjänster; "Åtta verktyg på en plattform: personliga brev, CV-analys, jobbmatchning, jobbcoach, rekryteringstester, LinkedIn-optimering, CV-skapande och 40 CV-mallar."
- Fel därför att: Sökta tjänster och Inför intervjun saknas bland verktygen.
- Belägg: `flikar.ts:23-26`.
- Var syns det: synliga ankare och länklista, OG- och twitter-description.
- Typ: SAKNAS
- Allvar: 3

Telefonskärmarna på sidan: TEL-1, TEL-3, TEL-5, TEL-6.

---

## 5. Startsidan (`src/components/publikt/start/Startsidan.tsx`)

**STA-1** (gamla: AVV `:256`)
- Fil och rad: `Startsidan.tsx:256`
- Står i dag: "Ladda upp som PDF eller Word. Inom en minut får du poäng 1 till 10 på tydlighet och struktur, innehåll, resultat och nyckelord, och en lista med fynd där varje fynd har en åtgärd. Rätta, kör om, se poängen röra sig."
- Fel därför att: produkten ger en poäng av 100 i sju delar, ingen poäng 1 till 10 och ingen nyckelordsdel.
- Belägg: `modell.ts:66-74`; `analysTexter.ts:18`.
- Var syns det: synlig text i CV-analysens station.
- Typ: OSANT
- Allvar: 1

**STA-2** (gamla: AVV `:252-253`)
- Fil och rad: `Startsidan.tsx:252-253`
- Står i dag: "Poäng per område, varje fynd med åtgärd och nyckelorden rekryteringssystemen letar efter."
- Fel därför att: inga nyckelord mäts och åtgärdstexterna är förslag som kräver hämtning.
- Belägg: `genomgang.ts:83-109`; `analysTexter.ts:43-45`.
- Var syns det: synlig ingress.
- Typ: OSANT
- Allvar: 2

**STA-3** (gamla: AVV `:258`)
- Fil och rad: `Startsidan.tsx:258`
- Står i dag: "Poängen och tyngsta fyndet gratis"
- Fel därför att: se GEM-1.
- Belägg: `analysData.ts:300-311`.
- Var syns det: synlig rad under knappen.
- Typ: OSANT
- Allvar: 1

**STA-4** (gamla: JS 1.6)
- Fil och rad: `Startsidan.tsx:274`
- Står i dag: "Vi utgår från det du kan och visar de 25 bästa träffarna varje gång du öppnar sidan: vilka krav du täcker och vad som saknas."
- Fel därför att: se GEM-10.
- Belägg: `MatchadeJobb.tsx:481, 962, 1072, 1082`.
- Var syns det: synlig text i jobbmatchningens station.
- Typ: OSANT
- Allvar: 1

**STA-5** (gamla: JS 1.15)
- Fil och rad: `Startsidan.tsx:303`
- Står i dag: "Svaren känner till ditt CV, dina matchningar och hur testerna gått, så att rådet gäller just din ansökan."
- Fel därför att: chatten får varken matchningar eller testresultat, och CV:t bara när användaren bifogar det.
- Belägg: `src/app/api/jobbcoachen/chat/route.ts:240-253`.
- Var syns det: synlig text i Jobbcoachens station.
- Typ: OSANT
- Allvar: 1

**STA-6** (ny, samma text på två sidor)
- Fil och rad: `Startsidan.tsx:86`, `:302`; `src/app/(public)/funktioner/FunktionerSida.tsx:73`
- Står i dag: "Lön, intervjufrågor, avtal och avslag, utifrån svensk arbetsmarknad och ditt CV." (rad 86 och Funktioner rad 73); rad 302 samma mening plus "Inte från en amerikansk mall."
- Fel därför att: svaren bygger på CV:t bara om det bifogas; förslagen utifrån läget i de sökta tjänsterna nämns inte.
- Belägg: `chat/route.ts:240-253`; `CoachVy.tsx:340, 364`.
- Var syns det: synlig text på startsidan (länklistan och Jobbcoachens ingress) och på /funktioner (länklistan).
- Typ: OSANT
- Allvar: 2

**STA-7** (gamla: JS 2.11)
- Fil och rad: `Startsidan.tsx:99-105`
- Står i dag: "Håll koll på var varje ansökan står: sökt, svar, intervju, erbjudande. Gratis för alla."
- Fel därför att: nyheterna (Ska sökas, veckans mål, uppföljningsmejlet, intervjun på tjänsten) saknas, och rapportens utskrift och kopiering är Premium.
- Belägg: `Rapport.tsx:380`; `uppfoljning.ts:282`.
- Var syns det: synlig rad i "Och resten av jobbsöket".
- Typ: SAKNAS
- Allvar: 3

**STA-8** (ny)
- Fil och rad: `Startsidan.tsx:361`
- Står i dag: "Alla verktyg utan tak. Mindre än en lunch i månaden, säg upp när du vill."
- Fel därför att: Premium har tak: 25 träffar per körning, 30 uppföljningsutkast per dygn och 30 förslag per dygn i CV-byggaren.
- Belägg: `freeLimit.ts:17`; `typer.ts:406`; `src/app/(public)/verktyg/skapa-cv/page.tsx:37` (läser `PAID_CV_BYGG_AI_PER_DAY`).
- Var syns det: synlig text i Premiumblocket.
- Typ: OSANT
- Allvar: 2

Hjältens telefon: TEL-2. Övriga telefoner på sidan: TEL-1, TEL-3, TEL-5, TEL-6. FAQ-svaret om gratisnivån: GEM-1 och GEM-3. Premiumlistan: GEM-4 och GEM-5.

---

## 6. /verktyg/personligt-brev

**BRV-1** (gamla: AVV `brev-faq-data.ts:18`)
- Fil och rad: `src/app/(public)/verktyg/personligt-brev/components/brev-faq-data.ts:19`; `page.tsx:364`; `layout.tsx:25`
- Står i dag: "Allt du skrivit ligger kvar att läsa och kopiera, även på gratisnivån." (FAQ); "Allt du skrivit ligger kvar att läsa och kopiera." (resultatkortet); "Första personliga brevet gratis att läsa." (twitter-description).
- Fel därför att: de två senaste breven går att ändra på gratisnivån, inte bara läsa.
- Belägg: `letter-quota.ts:12`; `lista.ts:65-67`.
- Var syns det: FAQPage och synlig FAQ, synligt kort "Ett brev gratis", twitter-description.
- Typ: SAKNAS
- Allvar: 3

**BRV-2** (gamla: AVV `page.tsx:113-153` FÖRÅLDRAT)
- Fil och rad: `page.tsx:122`, `:129-158`, `:247`
- Står i dag: "Fyra steg från tomt papper till färdig ansökan: välj CV, klistra in annons, välj mall och ton, kopiera eller ladda ner." och stegen "Välj ditt CV", "Klistra in jobbannonsen", "Välj mall och ton", "Kopiera eller ladda ner brevet".
- Fel därför att: Skriv brev är en enda skärm där CV, annons, mall och ton väljs samtidigt; tolkningsfråga, inget i stegen är osant.
- Belägg: `src/components/brev3/arbete/texter.ts:31-58` ("Annonsen och valen").
- Var syns det: JSON-LD HowTo och synliga steg.
- Typ: GAMMAL VY
- Allvar: 3

Struket på sidan: se avsnittet "Struket".

---

## 7. /verktyg/jobbmatchning

**JM-1** (gamla: JS 1.20, 3.4)
- Fil och rad: `src/app/(public)/verktyg/jobbmatchning/page.tsx:67`, `:101`, `:112-113`, `:171`, `:197`, `:222`, `:319`
- Står i dag: "om du inte har ett att aktivera än"; "Fyra steg från aktiverat CV till sorterade jobbmatchningar: aktivera CV, ..."; "Aktivera ditt CV" med "Aktivering tar några sekunder."; "Aktivera ditt CV så söker vi bland tusentals lediga jobb från Arbetsförmedlingen."; "Aktivera ditt CV, så ser du dina tre bästa träffar"; "Fyra steg från aktiverat CV"; "Aktivera ditt CV och se dina 3 bästa träffar".
- Fel därför att: det finns inget aktiveringssteg; senaste CV:t läses in automatiskt, knappen heter "Byt CV" och sökningen startar på "Hitta jobb som passar".
- Belägg: `MatchadeJobb.tsx:470-478, 866, 918, 1082`.
- Var syns det: JSON-LD HowTo (description och steg 1), synliga steg, hjältens ingress, provkortet, Premiumavslutet, länklistan.
- Typ: GAMMAL VY
- Allvar: 2

**JM-2** (gamla: JS 1.21)
- Fil och rad: `components/jobbmatchning-faq-data.ts:19`, `:43`, `:47`
- Står i dag: "Aktivera ditt CV i vår jobbmatchningstjänst så söker vi automatiskt"; "Det enda kravet är att du har ett CV att aktivera."; "När CV:t är aktiverat extraheras all data automatiskt".
- Fel därför att: se JM-1.
- Belägg: `MatchadeJobb.tsx:470-478`.
- Var syns det: FAQPage och synlig FAQ.
- Typ: GAMMAL VY
- Allvar: 2

**JM-3** (gamla: JS 1.7)
- Fil och rad: `page.tsx:319`
- Står i dag: "De 25 bästa träffarna, varje gång du öppnar sidan, ingår i Premium, utan bindningstid."
- Fel därför att: se GEM-10.
- Belägg: `MatchadeJobb.tsx:481, 962, 1072, 1082`.
- Var syns det: synligt Premiumavslut.
- Typ: OSANT
- Allvar: 1

**JM-4** (gamla: JS 1.8, 1.9)
- Fil och rad: `page.tsx:54`, `:93`, `:177`; `components/jobbmatchning-faq-data.ts:35`
- Står i dag: "Uppdaterat varje dag: Nya jobb syns i din lista inom timmar efter att de publicerats. Tillsatta tjänster försvinner av sig själva."; featureList "daglig uppdatering"; hjältens tal "Dagligen: nya annonser in, tillsatta ut"; FAQ "Annonserna uppdateras dagligen. När en arbetsgivare publicerar en ny tjänst på Arbetsförmedlingen syns den i din lista inom timmar."
- Fel därför att: annonserna hämtas tre gånger per dygn, men listan byts först när användaren söker igen.
- Belägg: `supabase/migrations/20260616_schedule_sync_global_jobs.sql:28-30`; `MatchadeJobb.tsx:962, 1072`.
- Var syns det: synliga skäl, JSON-LD WebApplication, hjältens tal, FAQPage och synlig FAQ.
- Typ: OSANT
- Allvar: 2

**JM-5** (gamla: JS 1.5 i sak)
- Fil och rad: `page.tsx:199`
- Står i dag: "Vilka krav du täcker och vad som saknas, per träff"
- Fel därför att: "vad som saknas" kan bara visas för annonser med utskriven kravprofil.
- Belägg: ej belagt i kod; belägget är `docs/bygg-noter-jobbsoket.md` beslut 16 (8 av 600 annonser i mätningen).
- Var syns det: provkortets punktlista.
- Typ: OSANT
- Allvar: 3

**JM-6** (gamla: JS 2.12)
- Fil och rad: `page.tsx:64-71`, `:303-305`
- Står i dag: "Jobbmatchningen hänger ihop med resten av kontot: brevet skrivs från träffen, och rekryterare kan hitta dig åt andra hållet."
- Fel därför att: Spara till Ska sökas, Markera som sökt, sista ansökningsdag och Sökta tjänster nämns inte.
- Belägg: `AnnonsVy.tsx:52-53`; `MatchadeJobb.tsx:105`.
- Var syns det: synlig text och länklista "Från träff till ansökan".
- Typ: SAKNAS
- Allvar: 3

Telefoner: TEL-3, TEL-4.

---

## 8. /verktyg/jobbcoachen

**JC-1** (gamla: JS 1.18)
- Fil och rad: `src/app/(public)/verktyg/jobbcoachen/page.tsx:174`
- Står i dag: "Jobbcoachen så mycket du vill, med ditt CV i samtalet, ingår i Premium."
- Fel därför att: att dela CV:t är inte Premium; knappen spärras bara när gratiskvoten är slut.
- Belägg: `CoachVy.tsx:364`.
- Var syns det: synligt slutblock.
- Typ: OSANT
- Allvar: 1

**JC-2** (gamla: JS 2.13)
- Fil och rad: `page.tsx:14-21`, `:52-53`, `:56-97`; `components/jobbcoachen-faq-data.ts:44-47`
- Står i dag: sex ämnen, HowTo med "Ställ frågan", FAQ "Kan jag dela mitt CV med Jobbcoachen?".
- Fel därför att: förslagen på frågor utifrån läget i de sökta tjänsterna nämns inte.
- Belägg: `CoachVy.tsx:9`, `:340`.
- Var syns det: synlig text, JSON-LD WebApplication och HowTo, FAQPage.
- Typ: SAKNAS
- Allvar: 3

Telefon: TEL-5.

---

## 9. /verktyg/skapa-cv

**SCV-1** (ny)
- Fil och rad: `src/app/(public)/verktyg/skapa-cv/page.tsx:47`; `components/skapa-cv-faq-data.ts:57`
- Står i dag: "Du fortsätter där du slutade från Mina CV, på vilken enhet som helst."; "fortsätta där du slutade från Mina CV".
- Fel därför att: fliken heter Ditt CV.
- Belägg: `src/components/cv/rum3/flikar.ts:20`; `src/app/dashboard/skapa-cv/texter.ts:21`.
- Var syns det: synlig text i "Det här gör CV-byggandet enkelt", FAQPage och synlig FAQ.
- Typ: NAMN
- Allvar: 3

**SCV-2** (ny)
- Fil och rad: `components/skapa-cv-faq-data.ts:39`
- Står i dag: "Du bygger ditt CV och laddar ner det som PDF en gång utan att lämna kortuppgifter."
- Fel därför att: gratisnedladdningen kan också vara Word i gratismallarna.
- Belägg: `katalog.ts:139`; `src/app/(public)/cv-mallar/components/cv-mallar-faq.ts:25`.
- Var syns det: FAQPage och synlig FAQ.
- Typ: SAKNAS
- Allvar: 3

"Hela CV-analysen" i slutblocket: GEM-5.

## 10. Övriga verktygssidor

- **/verktyg/rekryteringstester** (med `/prova`): inga avvikelser hittade i texterna. Talen läses ur `gratis-copy.ts` (ett grundnivåtest om dagen, åtta testtyper) och stämmer med `quotaService.ts:20` och `antal-testtyper.ts:18-21`. Telefoner: TEL-6 (SkarmMatris), SkarmPersonlighet och SkarmIntervjufragor (se avsnitt 15).
- **/verktyg/personlighetstest**: inga avvikelser hittade (femtio påståenden gratis, fördjupat i Premium).
- **/verktyg/linkedin-optimering**: bara "hela CV-analysen" (GEM-5).
- **/verktyg/bli-upptackt**: inga avvikelser. Placering i stället för andel rätt följer beslut 1 i `docs/beslut-jobbsoket-2026-11-21.md:154`.

---

## 11. Mallar och exempel

- **/cv-mallar** (huvudsidan, stilsidorna, FAQ, `mallar-produkt.ts`): stämmer med katalogen (40 mallar, Linne och Björk gratis, 26 Word, en nedladdning).
- **/cv-exempel** (mallen `src/components/publikt/innehall/exempel/ExempelMall.tsx`): mallnamnen läses ur katalogen. Telefonen i slutet är SkarmCvAnalys (TEL-1, `ExempelMall.tsx:467`).
- **/personligt-brev-exempel**: navet och yrkessidorna rättades i brevets våg 1 och 2. Kategorisidorna (`src/app/(public)/personligt-brev-exempel/kategori/[kategori]/page.tsx`) är tio samlingssidor (vård, tech, industri, ekonomi, service, logistik, utbildning, offentlig sektor, hantverk, student) med CollectionPage-schema och länkar till yrkenas brev; de påstår inget om produkten.
- **/skapa-brev/start**: stämmer (spärren säger "Vill du ladda ner det som PDF eller Word ingår det i Premium", `StartFlow.tsx:302-303`).

**EX-1** (ny)
- Fil och rad: `src/app/(public)/exempel/components/galleri-faq.ts:37`; `src/app/(public)/exempel/components/ExempelCTABand.tsx:45`
- Står i dag: "Vill du sedan bygga ditt eget CV med våra verktyg registrerar du dig gratis, och då ingår en CV-analys."; "Två CV-mallar, en CV-analys och ett personligt brev var sjunde dag, utan att betala."
- Fel därför att: gratis ser genomgången för varje CV; det som räknas en gång är förslagen.
- Belägg: `analysData.ts:300-311`.
- Var syns det: FAQPage och synlig FAQ på /cv-exempel (`src/app/(public)/cv-exempel/page.tsx:74-75, 102`), synligt slutband på /exempel.
- Typ: OSANT
- Allvar: 3

---

## 12. Informationssidor

**INF-1** (gamla: JS 1.26)
- Fil och rad: `src/app/(public)/integrationer/page.tsx:9-31`
- Står i dag: LinkedIn "Importera profil och optimera för jobbsökning" med "Planerad Q2 2026"; Arbetsförmedlingen "Sök jobb direkt från plattformen" med "Under utveckling"; Gmail och Outlook "Skicka personliga brev direkt från din e-post" med "Planerad Q3 2026".
- Fel därför att: Matchade jobb läser redan Platsbanken, CV-byggaren läser redan LinkedIns PDF, och båda datumen har passerat.
- Belägg: `src/app/dashboard/skapa-cv/texter.ts:29`; `MatchadeJobb.tsx:481`; migrationen `20260616_schedule_sync_global_jobs.sql:28-30`.
- Var syns det: synlig text. Sidan länkas inte från menyn eller sajtkartan men nås publikt.
- Typ: OSANT
- Allvar: 2

**INF-2** (gamla: JS 2.26)
- Fil och rad: `src/app/(public)/om-oss/OmOssSida.tsx:52`
- Står i dag: "Vi lanserar verktyg löpande, ...: jobbmatchning, rekryteringstester, LinkedIn-profilen och Jobbcoachen."
- Fel därför att: Sökta tjänster och CV-analysen nämns inte bland verktygen.
- Belägg: `flikar.ts:23-26`.
- Var syns det: synlig historik.
- Typ: SAKNAS
- Allvar: 3

**INF-3** (ny)
- Fil och rad: `src/app/(public)/hjalpcenter/page.tsx:15`, `:19-38`
- Står i dag: "Hjälp med Jobbcoach.ai: kom igång med kontot, skapa och redigera personliga brev, hantera betalning och prenumeration."; korten Komma igång, Personliga brev, Konto och Fakturering.
- Fel därför att: hjälpcentret nämner bara breven, inte testerna, CV-rummet eller Jobbsöket.
- Belägg: `flikar.ts:23-26`; `src/components/cv/rum3/flikar.ts:20-22`.
- Var syns det: metabeskrivning och synliga kort.
- Typ: SAKNAS
- Allvar: 3

/karriar, /press och /kontakt: inga produktpåståenden som avviker (/press "149 SEK/månad" stämmer med `plans.ts:185`). /for-rekryterare: inte detaljgranskad mot rekryterarsidans kod, se sist.

---

## 13. Menyn och sidfoten

**NAV-1** (ny)
- Fil och rad: `src/components/landing/nav-data.ts:47-74`
- Står i dag: grupperna "Skriv och förbättra", "Hitta jobb" (Jobbmatchning, Bli upptäckt, Jobbkartan) och "Träna" (Rekryteringstester, Jobbcoachen, Räkna ut lön och skatt). Kommentaren på rad 5-6 säger "Samma tre grupper som sidomenyn i inloggat läge".
- Fel därför att: inloggat heter rummen Rekryteringstester, CV, Personliga brev och Jobbsöket, Jobbcoachen hör till Jobbsöket, och Matchade jobb och Sökta tjänster finns inte i menyn (Sökta tjänster har ingen publik sida).
- Belägg: `src/lib/rum/copy.ts:29-34`, `:38-44`; `flikar.ts:23-26`.
- Var syns det: synlig header-meny, mobilmeny och sidfot.
- Typ: NAMN
- Allvar: 3

Sidfoten (`src/components/Footer.tsx`) läser `nav-data.ts` och har inga egna produktpåståenden.

---

## 14. Registrering och inloggning

**REG-1** (gamla: AVV `registrering-copy.ts:354`)
- Fil och rad: `src/components/registrering/registrering-copy.ts:354`
- Står i dag: "CV-analysen: Poängen och det tyngsta fyndet i ditt CV."
- Fel därför att: se GEM-1.
- Belägg: `analysData.ts:300-311`.
- Var syns det: panelen "Det här ingår gratis" på /register (`RegisterKontoSteg.tsx:651-673`).
- Typ: OSANT
- Allvar: 1

**REG-2** (ny)
- Fil och rad: `registrering-copy.ts:194-198`, `:218`
- Står i dag: "Hela CV-analysen. Varje fynd med åtgärd, kör om utan tak."; "Börja gratis direkt, eller ta med hela analysen och alla mallar från start."
- Fel därför att: se GEM-5 och CVA-6.
- Belägg: `analysData.ts:300-311`; `analysTexter.ts:37`, `:43-45`.
- Var syns det: steg 3 efter registreringen (`src/app/dashboard/valkommen/ForslagSteg.tsx`), alltså inloggat direkt efter kontot.
- Typ: OSANT
- Allvar: 2

**REG-3** (gamla: JS 2.14)
- Fil och rad: `registrering-copy.ts:54-57`, `:256-270`
- Står i dag: "Vi matchar ditt CV mot lediga jobb i Platsbanken och skriver varför de passar."; gratis "Tre matchade jobb", "Tio meddelanden till Jobbcoachen".
- Fel därför att: Sökta tjänster, Ska sökas, veckans mål och första uppföljningsmejlet saknas.
- Belägg: `uppfoljning.ts:282`; `flikar.ts:25`.
- Var syns det: registreringens första steg (kortet "Hitta jobb att söka") och steg 3.
- Typ: SAKNAS
- Allvar: 2

**REG-4** (gamla: JS 2.15)
- Fil och rad: `registrering-copy.ts:51-53`, `:244-255`
- Står i dag: "Svara på en vanlig intervjufråga och få återkoppling som från en rekryterare."
- Fel därför att: intervjun på den sökta tjänsten (tid, plats, "När är intervjun?", "Hur gick intervjun?") nämns inte.
- Belägg: `feat/jobbsoket-omgang2:src/components/jobb3/intervju/IntervjuFraga.tsx`; `flikar.ts:26`.
- Var syns det: registreringens första steg och steg 3.
- Typ: SAKNAS
- Allvar: 3

**REG-5** (ny)
- Fil och rad: `registrering-copy.ts:285`, `:338`, `:464`; `src/components/publikt/prov/prov-copy.ts:88`, `:95`, `:104`, `:142`, `:253`
- Står i dag: "sedan gör du Nivåkollen: ett kort test på cirka 8 minuter"; "Nivåkollen, N minuter: visar var du står och räknar in de här svaren"; "Nivåkollen mäter var du står, och kontot visar ..."; "Du kan också göra Nivåkollen i alla åtta testtyper."
- Fel därför att: källan för gratisnivån säger "aldrig Nivåkollen publikt", och de här raderna syns före kontot.
- Belägg: `gratis-copy.ts:8-9`. Osäkert: raderna kan vara beslutade i skissen för de publika proven (omgång 3, live 2026-11-21).
- Var syns det: kontostegets panel efter ett prov på /register, spärren under provresultatet i de publika proven.
- Typ: NAMN
- Allvar: 3

Inloggningen (`src/app/login`, `LOGIN` i `registrering-copy.ts:159-178`) och `src/app/auth` lovar inget om produkten.

---

## 15. Artiklarnas reklam (`src/components/artiklar/reklam/`)

**REK-1** (gamla: AVV `reklam-copy.ts:81`)
- Fil och rad: `reklam-copy.ts:81`, `:84`
- Står i dag: "Ladda upp CV:t, så läser vi det som en rekryterare gör i första urvalet. Poängen och det tyngsta fyndet är gratis."; "Hela analysen med varje fynd och åtgärd ingår i Premium, 149 kr i månaden."
- Fel därför att: se GEM-1 och GEM-5.
- Belägg: `analysData.ts:300-311`; `analysTexter.ts:43-45`.
- Var syns det: inlinekortet för CV-analysen i artiklarna.
- Typ: OSANT
- Allvar: 1

**REK-2** (gamla: AVV `reklam-copy.ts:88, 91`)
- Fil och rad: `reklam-copy.ts:88`, `:91`, `:225`
- Står i dag: "Klistra in annonsen, välj ton, vi skriver utkastet utifrån ditt CV. Ett personligt brev var sjunde dag att läsa på skärmen, gratis."; "Personliga brev utan tak, som PDF, ingår i Premium"; "Personliga brev utan tak, som PDF".
- Fel därför att: Word finns i 26 mallar och de två senaste breven går att ändra gratis.
- Belägg: `katalog.ts:139`; `letter-quota.ts:12`.
- Var syns det: inlinekortet för brev och slutkortet i CV-klustret.
- Typ: SAKNAS
- Allvar: 3

**REK-3** (gamla: JS 1.17)
- Fil och rad: `reklam-copy.ts:135`
- Står i dag: "Löneförhandlingen förbereder du med Jobbcoachen, som utgår från ditt CV."
- Fel därför att: se STA-6.
- Belägg: `chat/route.ts:240-253`.
- Var syns det: inlinekortet med räknarna i karriärklustret.
- Typ: OSANT
- Allvar: 2

**REK-4** (gamla: JS 2.19)
- Fil och rad: `reklam-copy.ts:236-243`
- Står i dag: "Jobbmatchning, de bästa träffarna med skälen utskrivna", "Jobbcoachen, så mycket du vill", "Intervjuprov utan dagsgräns och historik".
- Fel därför att: uppföljningsmejlen och rapporten saknas.
- Belägg: `typer.ts:406`; `Rapport.tsx:380`.
- Var syns det: slutkortet "Allt ingår".
- Typ: SAKNAS
- Allvar: 3

Telefonerna i reklamen (`ArtikelReklam.tsx:312-340`): TEL-1, TEL-3, TEL-5, TEL-6.

---

## 16. Artiklar (`content/artiklar/*.mdx`)

Frontmatterns `faq:` blir FAQPage (`src/app/(public)/artiklar/[slug]/page.tsx:243`).

**ART-1** (gamla: AVV jobbcoach-online)
- Fil och rad: `content/artiklar/jobbcoach-online.mdx:13`, `:48`, `:153`, `:184`, `:193`, `:289-333`, `:351-352`, `:568`, `:840`, `:957`
- Står i dag: "Vår CV-analys bedömer ditt CV mot struktur, språk, nyckelord och kvantifiering och ger förslag inom sex kategorier" (13, 957); "Ger en poäng från 0 till 100 för hur väl struktur och nyckelord i CV:t fungerar i ett rekryteringssystem" (48); "Förslag inom sex kategorier: ATS-kompatibilitet, Struktur, Språk och grammatik, Nyckelord, Kvantifiering samt Profil och styrkor" (193); "De sex kategorier vi ger förslag inom:" med tabellen (289-333); "Kritiskt problem: Nyckelord" (351); "Poäng och fynd med åtgärd inom sex kategorier" (568); "Med Premium ser du alla fynd i alla sex kategorier" (840).
- Fel därför att: sju delar med andra namn, inga nyckelord.
- Belägg: `modell.ts:66-74`; `genomgang.ts:83-109`.
- Var syns det: FAQPage (13), synlig text, tabell, exempelruta.
- Typ: OSANT
- Allvar: 1

**ART-2** (gamla: AVV jobbcoach-online)
- Fil och rad: `jobbcoach-online.mdx:89`, `:214`, `:398`, `:410`, `:523`, `:836`, `:840`, `:889`, `:914`, `:948`
- Står i dag: "en CV-analys som visar poängen och det tyngsta fyndet" (89); "En analys per konto är gratis. Du ser poängen, hur många fynd vi hittade och det tyngsta fyndet med åtgärd. Alla fynd och nya analyser efter att du rättat ingår i Premium" (214); "149 kr i månaden för alla fynd och nya analyser" (523); "Gratis: din poäng och det tyngsta fyndet." (914).
- Fel därför att: se GEM-1 och CVA-6.
- Belägg: `analysData.ts:300-311`; `analysTexter.ts:37`, `:43-45`.
- Var syns det: synlig text och kort.
- Typ: OSANT
- Allvar: 1

**ART-3** (gamla: JS 1.12)
- Fil och rad: `jobbcoach-online.mdx:370`
- Står i dag: "Annonserna hämtas flera gånger per dygn, och matchningen görs när du öppnar sidan."
- Fel därför att: se GEM-10.
- Belägg: `MatchadeJobb.tsx:481, 962, 1072, 1082`.
- Var syns det: synlig text.
- Typ: OSANT
- Allvar: 1

**ART-4** (ny)
- Fil och rad: `jobbcoach-online.mdx:89`, `:259`
- Står i dag: "personliga brev att läsa (det första och sedan ett var sjunde dag)"; "Ett brev är gratis, sedan ett var sjunde dag, att läsa men inte ladda ner."
- Fel därför att: de två senaste breven går att ändra gratis.
- Belägg: `letter-quota.ts:12`; `lista.ts:65-67`.
- Var syns det: synlig text.
- Typ: SAKNAS
- Allvar: 3

**ART-5** (gamla: AVV AVVÄGNING)
- Fil och rad: `jobbcoach-online.mdx:21`, `:1021`
- Står i dag: "CV-analysen läser både svenska och engelska CV"
- Fel därför att: ett inskannat CV läses bara på svenska.
- Belägg: `ocr.ts:74-79`.
- Var syns det: FAQPage (21) och synlig lista.
- Typ: SAKNAS
- Allvar: 3

**ART-6** (gamla: JS 2.22, 2.23)
- Fil och rad: `jobbcoach-online.mdx:44-52`, `:886-900`
- Står i dag: listan "En modern online jobbcoach hjälper dig med" (sju punkter, bland dem "Nyckelord: Visar vilka branschtermer som saknas i ditt CV"); "Vad Premium ger" med "Alla CV-mallar, hela CV-analysen, personliga brev och LinkedIn".
- Fel därför att: Sökta tjänster och uppföljningen saknas, nyckelordskontrollen finns inte och hela analysen är gratis.
- Belägg: `genomgang.ts:83-109`; `analysData.ts:300-311`; `typer.ts:406`.
- Var syns det: synliga listor.
- Typ: SAKNAS
- Allvar: 2

**ART-7** (gamla: AVV vad-ar-en-jobbcoach)
- Fil och rad: `content/artiklar/vad-ar-en-jobbcoach.mdx:13`, `:21`, `:23`, `:203`, `:557`, `:579`, `:587`, `:819`, `:869`, `:886`, `:893`
- Står i dag: "Den visar din poäng och det tyngsta fyndet" (13); "Gratis får du en poäng från 0 till 100 och det tyngsta fyndet." (21, 869); "en CV-analys med poäng och det tyngsta fyndet" (23, 886); "Med Premium ser du hela analysen, med förbättringsförslag för struktur, språk, nyckelord, mätbara resultat och profiltext." (203); "struktur, språk, nyckelord, mätbara resultat och profiltext" (557, 579); "Första analysen är gratis och visar poängen och det tyngsta fyndet. Hela analysen, med alla förslag och nya körningar när du har skrivit om, ingår i Jobbcoach Premium" (587); "hela CV-analysen" (893).
- Fel därför att: se GEM-1, GEM-5 och CVA-4.
- Belägg: `analysData.ts:300-311`; `genomgang.ts:83-109`.
- Var syns det: FAQPage (13, 21, 23), synlig text, tipsrutor, prislistan.
- Typ: OSANT
- Allvar: 1

**ART-8** (gamla: JS 1.11)
- Fil och rad: `vad-ar-en-jobbcoach.mdx:643`
- Står i dag: "Vi hämtar nya annonser flera gånger om dygnet, och när du öppnar sidan matchar vi din profil mot dem och visar varför varje träff passar dig."
- Fel därför att: se GEM-10.
- Belägg: `MatchadeJobb.tsx:481, 962, 1072, 1082`.
- Var syns det: synlig text.
- Typ: OSANT
- Allvar: 1

**ART-9** (gamla: JS 2.20, 2.21)
- Fil och rad: `vad-ar-en-jobbcoach.mdx:23`, `:641-655`, `:881-897`
- Står i dag: "ett personligt brev och sedan ett var sjunde dag (att läsa, inte ladda ner), tre matchade jobb och tio frågor till Jobbcoachen" (23, 887-889); sju verktyg i "Så fungerar Jobbcoach.ai"; "I Inför intervjun övar du på frågorna du kommer att få" (655).
- Fel därför att: Sökta tjänster och uppföljningsmejlet saknas, de två senaste breven går att ändra, och Inför intervjun visar nu också intervjuerna på gång.
- Belägg: `flikar.ts:25-26`; `letter-quota.ts:12`; `feat/jobbsoket-omgang2:src/components/jobb3/intervju/IntervjuHubb.tsx:8`.
- Var syns det: FAQPage (23) och synlig text.
- Typ: SAKNAS
- Allvar: 2

**ART-10** (gamla: JS 1.22)
- Fil och rad: `content/artiklar/ai-jobbmatchning.mdx:15`, `:51`, `:69`, `:97`, `:107`
- Står i dag: "du aktiverar ditt CV, systemet extraherar yrkesdata" (15, 107); "**1. Du aktiverar ditt CV.**" (51); "Matchningen utgår från dokumentet du aktiverat." (69); "aktivera ditt CV i jobbmatchningen" (97).
- Fel därför att: se JM-1.
- Belägg: `MatchadeJobb.tsx:470-478, 866`.
- Var syns det: FAQPage (15) och synlig text.
- Typ: GAMMAL VY
- Allvar: 2

**ART-11** (gamla: JS 1.10)
- Fil och rad: `ai-jobbmatchning.mdx:57`
- Står i dag: "Hos oss hämtas nya annonser flera gånger per dygn, och matchningen görs när du öppnar sidan."
- Fel därför att: se GEM-10.
- Belägg: `MatchadeJobb.tsx:481, 962, 1072, 1082`.
- Var syns det: synlig text.
- Typ: OSANT
- Allvar: 1

**ART-12** (gamla: JS 2.25)
- Fil och rad: `ai-jobbmatchning.mdx:89`
- Står i dag: "Sortera träffarna i tre högar: söker nu, bevakar, nej tack."
- Fel därför att: produktens Spara till Ska sökas och Markera som sökt gör just det men nämns inte.
- Belägg: `AnnonsVy.tsx:52-53`.
- Var syns det: synlig text.
- Typ: SAKNAS
- Allvar: 3

**ART-13** (gamla: JS 1.19, 2.24, AVV)
- Fil och rad: `content/artiklar/din-digitala-jobbcoach.mdx:159`, `:161`, `:173`, `:175`
- Står i dag: "alla CV-mallar, hela CV-analysen, nedladdning av breven, alla träffar i jobbmatchningen och alla rekryteringstester" (173); "en CV-analys med poäng och det tyngsta fyndet, ett personligt brev att läsa och sedan ett var sjunde dag" (175).
- Fel därför att: Premium ger de 25 bästa träffarna, inte alla; gratis ser hela genomgången; rad 159 och 161 saknar Jobbcoachens förslag utifrån läget och Sökta tjänster.
- Belägg: `freeLimit.ts:17`; `analysData.ts:300-311`; `CoachVy.tsx:340`.
- Var syns det: synlig text.
- Typ: OSANT
- Allvar: 1

**ART-14** (gamla: AVV "Fler artiklar", 14 filer)
- Fil och rad: `ats-vanligt-cv.mdx:156`; `cv-exempel-yrken.mdx:254`; `cv-och-personligt-brev.mdx:17`, `:203`; `cv-profil-sammanfattning.mdx:363`; `datorkunskaper-cv.mdx:97`; `fardigheter-cv-exempel.mdx:621`; `fardigheter-kompetenser-cv.mdx:207`; `hur-skriver-man-cv.mdx:256`; `nyckelord-i-cv.mdx:129`; `personligt-brev-kompetenser-egenskaper.mdx:108`, `:246`; `skriva-cv-guide.mdx:199`; `vanliga-cv-misstag.mdx:227`; `hur-ska-ett-cv-se-ut.mdx:279`
- Står i dag (urval): "pekar på vad som saknas: struktur, nyckelord och formuleringar" (ats-vanligt-cv); "ser vilka branschtermer och resultat som saknas" (cv-exempel-yrken); "att rätt nyckelord finns med" (cv-och-personligt-brev); "vilka viktiga branschord som saknas" (cv-profil-sammanfattning); "går igenom språk och nyckelord" (datorkunskaper-cv); "en poäng och förslag på nyckelord för din målroll" (fardigheter-cv-exempel); "visar vilka nyckelord som är typiska för yrket och saknas hos dig" (fardigheter-kompetenser-cv); "går igenom struktur, språk och nyckelord" (hur-skriver-man-cv); "jämför med de begrepp som annonser för ditt yrke brukar efterfråga och visar vad som saknas" (nyckelord-i-cv); "(en gratis analys) går i sin tur igenom struktur, språk, nyckelord och kvantifiering" och "(en gratis analys) gå igenom språk, nyckelord och kvantifiering" (personligt-brev-kompetenser-egenskaper); "konkret feedback på struktur, nyckelord och förbättringsområden" (skriva-cv-guide); "saknade branschord" (vanliga-cv-misstag); "kört genom en CV-analys för att kontrollera ATS-kompatibilitet" (hur-ska-ett-cv-se-ut).
- Fel därför att: genomgången mäter inga nyckelord eller branschord; Jobbcoachens förslag kan föreslå kompetenser att lägga till, så det är en tolkningsfråga för förslagen men inte för poängen.
- Belägg: `genomgang.ts:83-109`; `modell.ts:274-283`; `analysTexter.ts:75` ("Lägg till om de stämmer").
- Var syns det: synlig text; i `cv-och-personligt-brev.mdx:17` FAQPage.
- Typ: OSANT
- Allvar: 2

**ART-15** (gamla: AVV AVVÄGNING)
- Fil och rad: `content/artiklar/skriva-cv-guide.mdx:17`, `:233`
- Står i dag: "kan du köra det genom vår CV-analys och få ett ATS-poäng på 0-100."
- Fel därför att: talet heter läsbarhetspoäng.
- Belägg: `analysTexter.ts:15`.
- Var syns det: FAQPage (17) och synlig FAQ.
- Typ: NAMN
- Allvar: 2

**ART-16** (gamla: AVV, fyra filer)
- Fil och rad: `bra-cv-guide.mdx:395`; `hur-ska-ett-cv-se-ut.mdx:293`, `:371`; `cv-pa-engelska-resume.mdx:536`; `cv-och-personligt-brev.mdx:190`
- Står i dag: "du får en poäng och det viktigaste att åtgärda direkt, och i Premium hela analysen av struktur, innehåll, nyckelord och ATS-kompatibilitet" (bra-cv-guide); "som visar din poäng och det viktigaste att åtgärda. Den fullständiga genomgången av struktur, innehåll och ATS-anpassning ingår i Jobbcoach Premium." (293); "se din poäng och det viktigaste att åtgärda" (371, cv-pa-engelska-resume); "Med **djupgående CV-analys (Premium)**" (cv-och-personligt-brev:190).
- Fel därför att: den fullständiga genomgången är gratis; Premium ger förslagen.
- Belägg: `analysData.ts:300-311`; `analysTexter.ts:43-45`.
- Var syns det: synlig text.
- Typ: OSANT
- Allvar: 2

**ART-17** (gamla: JS 1.25, 2.27)
- Fil och rad: `content/artiklar/soka-jobb-via-mail.mdx:21`, `:34`, `:160`, `:162`, `:202`
- Står i dag: "Efter ungefär en vecka utan svar är det rimligt att skicka en kort och vänlig påminnelse"; "Följ upp med ett kort mejl efter ungefär en vecka om du inte fått svar."; "Exempel: uppföljningsmejl efter en vecka".
- Fel därför att: produkten föreslår uppföljning efter tolv dagars tystnad för en skickad ansökan, och uppföljningsmejlet nämns inte; beslut 9 säger "en till två veckor" och en länk.
- Belägg: `src/lib/applications/status.ts:51-52`; beslut 9 i `docs/beslut-jobbsoket-2026-11-21.md:170`.
- Var syns det: FAQPage (21), snabbsvarsrutan, synlig text och exempelrubrik.
- Typ: SAKNAS
- Allvar: 3

**ART-18** (gamla: JS 2.27)
- Fil och rad: `content/artiklar/uppfoljning-efter-intervju.mdx:36-38`, `:52`, `:216`
- Står i dag: "Skicka ett kort, artigt uppföljningsmejl och fråga om status om tiden gått ut." och "efter ungefär 5 till 7 arbetsdagar om ingen tidsram nämndes".
- Fel därför att: rådet stämmer nu med produkten (sju dagar efter intervju), men produktens uppföljningsmejl efter intervju nämns inte.
- Belägg: `feat/jobbsoket-omgang2:src/lib/jobbsok/typer.ts:25`; `feat/jobbsoket-omgang2:src/lib/jobbsok/uppfoljning.ts` (`mallEfterMoment`).
- Var syns det: synlig text (HowTo-steget och snabbsvaret ska enligt SEO inte röras).
- Typ: SAKNAS
- Allvar: 3

**ART-19** (ny)
- Fil och rad: `content/artiklar/personligt-brev-mall-gratis.mdx:29`, `:343`
- Står i dag: "Brevet går att läsa gratis, och nedladdning som PDF ingår i Premium"
- Fel därför att: Word finns i 26 mallar och de två senaste breven går att ändra gratis.
- Belägg: `katalog.ts:139`; `letter-quota.ts:12`.
- Var syns det: FAQPage (29) och synlig FAQ.
- Typ: SAKNAS
- Allvar: 3

Sökorden "sju mallar", "sex mallar", "Mitt jobbsök", "Nivåkoll", "1 till 10" (om CV), "CV-paketet", "Träningspaketet", "Dagspasset", "79 kr", "99 kr", "Mina brev", "Mina CV", "flödesdiagram" och de gamla mallnamnen gav inga träffar som beskriver produkten. "Hela paketet" (personligt-brev-avslutning-exempel.mdx:79) och "fyra delar" i brevartiklarna gäller brevets disposition, inte produkten. "veckoabonnemang" i online-cv-byggare-gratis.mdx gäller konkurrenter.

---

## 17. Telefonskärmarna (`src/components/publikt/telefon/skarmar/`)

| Skärm | Bedömning | Post |
|---|---|---|
| SkarmCvAnalys | Ritar en vy som inte finns | TEL-1 |
| SkarmBana | Ritar en vy som inte finns | TEL-2 |
| SkarmMatchning | Fel text och gammal vy | TEL-3 |
| SkarmAktivera | Ritar en vy som inte finns | TEL-4 |
| SkarmCoach | Fel text | TEL-5 |
| SkarmMatris | Fel text | TEL-6 |
| SkarmBrev | Stämmer ("Ton: Professionell", "6 av 7 krav har fått svar", "Ladda ner PDF", jfr `brev3/arbete/texter.ts:8-14, 44, 159`) | |
| SkarmAnnons | Stämmer i sak; rubriken "Det annonsen kräver" heter "Krav vi läst ut ur annonsen" i vyn (`texter.ts:42`) | |
| SkarmMallar | Stämmer (läser katalogen) | |
| SkarmSkapaCv | Stämmer ("Direkt på arket") | |
| SkarmLinkedin | Stämmer i stort, inte detaljjämförd | |
| SkarmBliUpptackt | Stämmer (placering, inte andel rätt, beslut 1) | |
| SkarmPersonlighet | Stämmer så långt kontrollerat ("Dina fem dimensioner" i `src/components/personalityTest/BigFiveChart.tsx:33`, "Det du kan säga på intervjun" i `src/app/dashboard/intervju/infor-intervjun-copy.ts:156`) | |
| SkarmIntervjufragor | Ej belagt: rubriken "Frågor rekryteraren lär ställa" och knappen "Öva på svaret" hittades inte i inloggat läge | |
| SkarmNivakoll | Används bara på `/forhandsvisning-publikt`, som enligt JS-listan ger 404 i produktion | |

**TEL-1** (gamla: AVV SkarmCvAnalys)
- Fil och rad: `SkarmCvAnalys.tsx:15-20`, `:41`, `:43`, `:49`, `:61`, `:71`
- Står i dag: delarna "Personbeskrivning", "Roller", "Kompetenser", "Allmänna råd"; "Läsbart för systemen"; "10 förslag, 86 med dem. Det tyngsta står först."; "Förslag per del"; "Tyngsta fyndet"; knappen "Rätta och kör om".
- Fel därför att: vyn har sju delar, rubriken "{kvar} poäng kvar till 100", kortet "Vägen till 100" och knapparna "Åtgärda i CV:t" och "Hämta Jobbcoachens förslag".
- Belägg: `analysTexter.ts:18`, `:34`, `:43`, `:55-56`, `:99`; `modell.ts:66-74`.
- Var syns det: telefonskärm på /verktyg/cv-analys, /funktioner (`FunktionerSida.tsx:137`, `:196`), /priser (`priser/page.tsx:147`, `:259`), startsidan (`Startsidan.tsx:259`, `:371`), CV-exempel (`ExempelMall.tsx:467`), artiklarnas reklam (`ArtikelReklam.tsx:322`, `:338`).
- Typ: GAMMAL VY
- Allvar: 2

**TEL-2** (gamla: JS 3.1, AVV)
- Fil och rad: `SkarmBana.tsx:10-20`, `:27-29`, `:45`
- Står i dag: "Mitt jobbsök", "Vägen till intervjun", "Tre av fem steg klara. Nu: Rekryteringstester.", "Nivåkollen klar, dagens pass väntar. Personlighetsprofilen sparad.", "Poäng 74 av 100, två fynd åtgärdade", "Skrivet på annonsen, nedladdat som PDF", knappen "Starta dagens pass".
- Fel därför att: Översikt har fyra flikar, "Att göra nu" och veckans mål, inte fem stationer; Nivåkollen ska inte stå i reklam.
- Belägg: `flikar.ts:23-26`; `src/components/jobb3/oversikt/OversiktVy.tsx:6`; `gratis-copy.ts:8-9`.
- Var syns det: startsidans hjälte (`Startsidan.tsx:187`), /om-oss (`OmOssSida.tsx:105`). Beslut 16 punkt 7 säger att skärmen står kvar tills Black Week är över.
- Typ: GAMMAL VY
- Allvar: 2

**TEL-3** (gamla: JS 3.2)
- Fil och rad: `SkarmMatchning.tsx:2`, `:14-16`, `:26-29`, `:50`
- Står i dag: "Dina matchningar", "Dina 25 bästa träffar", "Du täcker:", "Saknas: PMP-certifiering", knappen "Skriv brev från träffen". Kommentaren säger "körda när sidan öppnas".
- Fel därför att: rummet heter Matchade jobb och visar sista ansökningsdag, annonsen bredvid listan och handlingarna Skriv brev, Spara till Ska sökas och Markera som sökt.
- Belägg: `flikar.ts:24`; `AnnonsVy.tsx:52-53`; `MatchadeJobb.tsx:19-20, 105`.
- Var syns det: startsidan (`Startsidan.tsx:277`), /funktioner (`FunktionerSida.tsx:139`, `:280`), /priser (`priser/page.tsx:288`), /verktyg/jobbmatchning (`page.tsx:186`), artiklarnas reklam (`ArtikelReklam.tsx:331`, `:339`).
- Typ: GAMMAL VY
- Allvar: 2

**TEL-4** (gamla: JS 3.3)
- Fil och rad: `SkarmAktivera.tsx:29-31`, `:47`, `:60`
- Står i dag: "CV:t är aktiverat", "Sex datapunkter lästa ur projektledare-cv.pdf. Nu söker vi i Platsbanken.", "Söker bland 1 843 lediga jobb", knappen "Visa träffarna".
- Fel därför att: det finns inget aktiveringssteg; CV:t läses in automatiskt och sökningen startar på "Hitta jobb som passar".
- Belägg: `MatchadeJobb.tsx:470-478, 1082`.
- Var syns det: /verktyg/jobbmatchning (`page.tsx:234`).
- Typ: GAMMAL VY
- Allvar: 2

**TEL-5** (gamla: JS 3.5, beslut 18)
- Fil och rad: `SkarmCoach.tsx:15`, `:20-21`, `:23`
- Står i dag: "Svaren utgår från svensk arbetsmarknad och ditt CV."; "Med din bakgrund från NCC och LOU-upphandlingarna ligger spannet i Göteborg runt 48 000 till 56 000 kr i månaden. Begär 54 000"; "Vill du att vi övar på frågan om varför du lämnade NCC?"
- Fel därför att: Jobbcoachen ser CV:t bara om det bifogas, och lönen skrivs ut utan källa mot regeln att lön aldrig skrivs ut.
- Belägg: `chat/route.ts:240-253`; `CoachVy.tsx:340` ("Frågor utifrån ditt läge"); beslut 18 i `docs/beslut-jobbsoket-2026-11-21.md:188`.
- Var syns det: startsidan (`Startsidan.tsx:306`), /funktioner (`FunktionerSida.tsx:289`), /priser (`priser/page.tsx:301`), /verktyg/jobbcoachen (`page.tsx:131`), /rakna-ut (`page.tsx:291`), kalkylatorsidorna (`KalkylatorSida.tsx:121`), artiklarnas reklam (`ArtikelReklam.tsx:330`).
- Typ: OSANT
- Allvar: 2

**TEL-6** (ny)
- Fil och rad: `SkarmMatris.tsx:20`, `:26`
- Står i dag: "Fråga 9 av 15" och knappen "Svara och gå vidare".
- Fel därför att: sessionsramen säger "uppgift N av M" och knapparna heter "Svara" och "Nästa"; själva brädet är inte jämfört med omgång 3:s formspråk.
- Belägg: `src/components/session/copy.ts:99-100`, `:110`, `:117`.
- Var syns det: startsidan, /funktioner, /priser, /verktyg/rekryteringstester (`page.tsx:415`), artiklarnas reklam.
- Typ: NAMN
- Allvar: 3

---

## 18. Integritetspolicy och villkor (bara notering, inga ändringar föreslås)

- Fyra FAQ-svar säger "all data lagras i EU": `cv-analys-faq-data.ts:40`, `FunktionerSida.tsx:84`, `Startsidan.tsx:123`, `brev-faq-data.ts:27`. Policyn anger EU för Supabase, PostHog och Vercels serverfunktioner men säger inget om var Google (Gemini API), Stripe och Resend lagrar (`src/app/(public)/integritetspolicy/page.tsx:148-163`). Det är inte en direkt motsägelse, men FAQ-svaren lovar mer än policyn.
- Samma FAQ-svar säger "Det enda som blir kvar är kvitton hos Stripe". Policyn säger att kontoinformation sparas "så länge ditt konto är aktivt hos oss, och en rimlig tid därefter för administrativa ändamål eller om det krävs enligt lag" (`integritetspolicy/page.tsx:225`). Möjlig motsägelse, ägarens fråga.
- Maskningen beskrivs nu likadant i policyn och koden (`integritetspolicy/page.tsx:157`), så AVV:s juridiska rader är inaktuella.

---

## Struket (redan rättat i koden eller ändrat av grenarna)

- Brevets säljsida: "Sju mallar", "7 brevmallar", "{MALLANTAL} mallar", gamla mallnamn i FAQ, "de sju mallarna", HowTo om mall och PDF/Word (AVV Brev). Rättat: `layout.tsx:8`, `page.tsx:104-157, 268-302`, `brev-faq-data.ts:15, 31`.
- `paket-copy.ts:214` tonraden: nu "Välj ton, från professionell till kreativ. I Premium väljer vi åt dig efter annonsen." (prissidans egen rad står kvar, PRI-3).
- `SkarmBrev.tsx:15` "Ton: saklig": nu "Ton: Professionell".
- `ExempelMall.tsx` "Sju mallar" och "Mallen Klassisk": nu katalogens namn (`:45`, `:163`).
- `ExempelHero.tsx` "6 mallar", `InteractiveLetterPreview.tsx` "Traditionell", `MallVisningar.tsx` "Fyra är gratis": borta.
- `FunktionerSida.tsx` MallMiniatyr "executive/modern/classic": nu CV-katalogens bilder (`:43-44`, `:239-259`).
- Artiklar: `jobbcoach-online.mdx:231` (nu 40 mallar), `personligt-brev-mall-word.mdx:448` (nu 40 brevmallar), `fardiga-personliga-brev.mdx:245` (säger nu att de två senaste går att ändra).
- Mini-analysens svar på inskannad PDF: nu 422 med väg till kontot (`quick-score/route.ts:35-46, 116-122`, `CVAnalysMini.tsx:189-209`).
- JS 1.1 delningssidan: ritar tratten (`src/app/dela/sokta-tjanster/[token]/page.tsx:36, 156-164`).
- JS 1.2, 1.3 kampanjmejlet: rutten svarar 410 (`src/app/api/admin/email/campaign/route.ts:92-93`). Mejl ligger ändå utanför omfånget.
- JS 3.6 skärmbilden: finns inte längre i `public/`.
- JS 1.24 artikeln om uppföljning efter intervju: med `feat/jobbsoket-omgang2` påminner produkten efter sju dagar efter en intervju (`typer.ts:25` på grenen), så rådet "en vecka" säger inte längre emot. Kvar som SAKNAS: ART-18.
- JS 1.16, 1.23, 2.16, 2.17, 2.18 (mejl och veckobrev): utanför omfånget enligt uppdraget.
- `fix/brev-kvar` (långa brev på en sida): ingen publik text påstår att långa brev går över två sidor, så grenen ändrar ingen post.

---

## Inte granskat eller osäkert

- **Telefonskärmarna för testerna** (SkarmMatris, SkarmPersonlighet, SkarmIntervjufragor) är jämförda på text, inte på bild mot omgång 3:s formspråk. SkarmIntervjufragors rubrik och knapp är ej belagda i inloggat läge.
- **"Vad som saknas" per träff** (GEM-10, JM-5): belägget är byggnoterna, inte koden.
- **Var Matchade jobb hämtar annonserna**: "Vi söker direkt mot Arbetsförmedlingens öppna API" (`jobbmatchning/page.tsx:125`, FAQ `:23`) är inte prövat; jag hittade inte hur `match-jobs` läser annonserna, så posten är inte skriven.
- **Poängen publikt mot inloggat**: samma CV kan få upp till 10 poäng mer inloggat (AVV). Ingen publik text lovar att poängen är densamma, så ingen post.
- **Nivåkollen i de publika proven och registreringen** (REG-5): kan vara ett medvetet beslut i omgång 3.
- **Kom igång-brickan i Premiums lista** (GEM-13): osäkert om den visas för betalande.
- **/for-rekryterare** och insikterna: bara sökta efter testpåståenden, inte jämförda med rekryterarsidans kod.
- **Artiklarna** är sökta med nyckelord, inte lästa i sin helhet utom de rader som citeras. De stora datafilerna för CV- och brevexempel är bara sökta.
- **Bilder och OG-bilder**: bara textfälten i `verktyg/cv-analys/opengraph-image.tsx` är lästa; övriga OG-bilder, maskot- och Instagrambilder är inte öppnade. Appbutikens texter (`mobilapp/butik/`) är inte granskade.
- **Inloggade texter** med samma fel (Kom igång-brickorna, betalväggar, `PROVA_OCKSA` i `registrering-copy.ts:421-434`, `paket-copy.ts:631`) ligger utanför omfånget och är inte listade.
- **Sociala länkar**: sidfoten pekar på `facebook.com/jobbcoachai` medan startsidans Organization-schema anger `facebook.com/jobbcoach.ai` (`Footer.tsx:18`, `Startsidan.tsx:141`). Inte produkt, inte prövat vilken som gäller.
