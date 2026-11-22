# Textförslag, publikt omgång 3

UX-copyns underlag till saas-lead, 2026-11-22. Skrivet mot `docs/publikt-omgang3/kartlaggning.md` (105 poster), `docs/design/publikt-omgang3/BRIEF.md` och koden i `C:\Users\chris\cvbrev-publikt3` på commit `5adfc7a1`, med grenarna `fix/brev-kvar` och `feat/jobbsoket-omgang2` räknade som live. Ingen produktkod är ändrad. `docs/publikt-omgang3/seo-krav.md` kom medan jag skrev. Jag har läst den i sin helhet och stämt av förslagen mot den i ett sista varv: där SEO har satt en rubrik eller ett krav som går att förena med sanningen har jag tagit SEO:s lydelse, och det som återstår att jämka står i avsnittet "Avstämt mot SEO:s krav" sist.

## Så läser du filen

- En sektion per sida, i kartläggningens ordning. Varje post har kartläggningens ID.
- **I dag** är citatet ur koden. **Förslag** är färdigt att klistra in. Där texten byggs av konstanter står talet utskrivet som det blir i dag (40 mallar, 26 Word-mallar, 2 gratis, 3 träffar, 25 träffar, 10 meddelanden, 149 kr i månaden) och bygget läser det ur samma konstant som förut.
- Längden är behållen eller längre i varje post. Där en mening var osann står en sann i dess ställe, ingenting är bara struket.
- Alla förslag är utan tankstreck och utan emoji. Citattecken i exempel är raka, som i koden i dag.
- Två poster föreslår jag att **inte** ändra (GEM-13, REG-5 i sin helhet). De står med skäl, och i slutlistan.
- Sist: avstämningen mot SEO:s krav, en tabell över ställen där förslaget går en annan väg än kartläggningen eller skissen, bifynd som inte är poster, och listan över det som kräver beslut.

## Sju lydelser som ska vara desamma överallt

De här återkommer på många ställen. Ändras en av dem i jämkningen ska den ändras i alla poster som räknas upp.

| Nr | Sak | Lydelse | Poster |
|---|---|---|---|
| L1 | Gratis i CV-analysen | "läsbarhetspoängen och genomgången i sju delar, för varje CV" | CVA-5, GEM-1, GEM-7, PRI-1, PRI-10, FUN-2, STA-3, EX-1, REG-1, REK-1, ART-2, ART-7, ART-13, ART-16 |
| L2 | Premium i CV-analysen | "CV-analysens alla förslag", och där det finns plats "alla förslag från Jobbcoachen och nya förslag efter varje ändring" | CVA-5, CVA-6, GEM-4, GEM-5, GEM-7, PRI-1, PRI-8, FUN-3, REG-2, REK-1, ART-2, ART-6, ART-7, ART-13, ART-16 |
| L3 | När matchningen körs | "Annonserna hämtas tre gånger per dygn. Du söker om med ett tryck när du vill se de senaste." | GEM-10, FUN-1, STA-4, JM-3, JM-4, ART-3, ART-8, ART-11 |
| L4 | Vad Jobbcoachen känner till | "Jobbcoachen känner till din målroll, ort och bransch och de dokument du själv delar i samtalet, och föreslår frågor utifrån läget i dina sökta tjänster." | GEM-11, STA-5, STA-6, JC-1, JC-2, REK-3, ART-13, TEL-5 |
| L5 | Gratis i personliga brev | "första personliga brevet, sedan ett var sjunde dag, och de två senaste går att ändra" | GEM-2, GEM-8, FUN-5, PRI-6, BRV-1, REK-2, ART-4, ART-9, ART-13, ART-19 |
| L6 | Gratis i Sökta tjänster | "Sökta tjänster med Ska sökas, veckans mål och det första uppföljningsmejlet" | GEM-3, GEM-12, PRI-7, FUN-4, STA-7, REG-3, ART-9 |
| L7 | Premium i Sökta tjänster | "Uppföljningsmejl till dina sökta tjänster och rapporten till Arbetsförmedlingen, att skriva ut eller kopiera" | GEM-4, GEM-6, PRI-7, PRI-8, REK-4, ART-6, ART-9 |

Tre ord som gäller genomgående: delarna i analysen heter **delar** (aldrig områden, kategorier eller fynd), talet heter **läsbarhetspoäng**, och det Jobbcoachen skriver heter **förslag**. "Fynd" och "åtgärd" används inte längre om CV-analysen.

---

## 1. /verktyg/cv-analys

Ordningen på sidan efter ändringen: hjälte, prova utan konto, Så fungerar det (fyra steg), Vad vi kontrollerar (sju delar), skrivtips, Premium, frågor. H1 är ingen post i kartläggningen, se bifynd B1.

**"ATS" på sidan:** en gång i metabeskrivningen (CVA-5) och en gång i brödtexten, i FAQ-svaret "Vad betyder läsbarhetspoängen?" (CVA-3). Ingen annan text på sidan använder ordet. Vill SEO ha förklaringen på en annan plats flyttas parentesen, den läggs inte till.

### CVA-1 · `src/app/(public)/verktyg/cv-analys/page.tsx:14-21, :158`

- **I dag:** H2 "Sex saker rekryteraren och systemet ser först" med raderna Läsbarhet för rekryteringssystem, Struktur, Språk och grammatik, Nyckelord, Kvantifiering, Profil och styrkor.
- **Förslag:**

  Etikett: `Vad vi kontrollerar` (oförändrad)

  H2: `Sju delar som ger din läsbarhetspoäng`

  Ingress under rubriken (ny, mallen har fältet `ingress`): `Varje poäng går att peka på i ditt CV. Fler ord ger aldrig fler poäng. Så här fördelas de hundra.`

  Raderna (rubrik, sedan text). Rubriken är delens namn, exakt som i produkten. Poängen står som en egen bricka bredvid rubriken, inte i den:

  1. `Kontaktuppgifter` · bricka `10 poäng`
     `Namn, e-postadress, telefonnummer och ort. Det låter självklart, men saknas en av dem vet rekryteraren inte hur du nås eller var du finns.`
  2. `Personbeskrivning` · bricka `15 poäng`
     `Din öppning. Den ska vara lagom lång, säga vilken roll du har och innehålla något man kan räkna: år, antal eller resultat.`
  3. `Erfarenhet` · bricka `35 poäng`
     `Den tyngsta delen. Varje roll behöver titel, arbetsgivare och period, två till åtta punkter som börjar med vad du gjorde och minst en siffra. "Ansvarig för försäljning" blir "Ökade försäljningen 40 procent på 8 månader". De fem första rollerna i CV:t räknas.`
  4. `Kompetenser` · bricka `12 poäng`
     `Ett eget avsnitt med lagom många kompetenser, skrivna som korta, sökbara termer. "Budgetansvar" går att söka på. En hel mening gör det inte.`
  5. `Utbildning` · bricka `8 poäng`
     `Minst en utbildning, med namn, skola och år eller period. Rekryteraren vill se vad du läste, var och när. Mer än så behövs sällan.`
  6. `Språk` · bricka `5 poäng`
     `Språken står med, och varje språk har en nivå. "Engelska, flytande" säger mer än bara "Engelska", och nivån är det rekryteraren letar efter.`
  7. `Datum, ordning och längd` · bricka `15 poäng`
     `Perioder som går att läsa, samma datumformat genom hela CV:t, senaste rollen först, korta punkter och ett CV som är lagom långt.`

  Rad under listan: `Läsbarhetspoängen visar hur lätt ditt CV är att läsa för en rekryterare och för rekryteringssystemen. Vi räknar den själva, ur det som står i ditt CV.`

- **Skäl:** H2 är SEO:s lydelse (skissen har "Sju delar, hundra poäng"). De sju H3 är produktens egna namn, som SEO kräver, och varje text är minst lika lång som dagens kategoritexter. Sista raden säger rakt ut att talet inte kommer från ett rekryteringssystem, utan att använda ordet ATS en gång till.
- **Hänger ihop med:** CVA-2, CVA-4, TEL-1, GEM-7, ART-1.

### CVA-2 · `page.tsx:52, :87, :145` · `layout.tsx:13` · `cv-analys-faq-data.ts:24`

- **I dag:** "förslag i fyra delar (personbeskrivning, roller, kompetenser, allmänna råd)"; "Du får en ATS-poäng från 0 till 100, poängen du kan nå med förslagen och förslag i fyra delar med exakt vad som bör ändras."; löftet `4` "delar med förslag"; OG "Du får en ATS-poäng plus konkreta förslag i fyra delar."; FAQ "Förslagen kommer i fyra delar. ..."
- **Förslag:**

  `page.tsx:52` (WebApplication, `featureList`):
  `Läsbarhetspoäng 0-100, genomgång i sju delar (kontaktuppgifter, personbeskrivning, erfarenhet, kompetenser, utbildning, språk, datum, ordning och längd), Jobbcoachens förslag med nuvarande text och förslag bredvid varandra, byggd för svenska CV`

  `page.tsx:85-87` (HowTo steg 3, också synligt steg):
  namn `Se läsbarhetspoängen och vad som saknas`
  text `Du får en läsbarhetspoäng från 0 till 100 och ser vad som saknas i varje del, utmärkt direkt på ditt CV. Du ser också hur många poäng som återstår till 100 och i vilka delar de sitter.`

  `page.tsx:143-146` (löftesraden, alla tre):
  `7` `delar i genomgången`
  `100` `poäng att nå`
  `0 kr` `för poängen, varje CV`

  `layout.tsx:13` (OG-description), 165 tecken:
  `Vi går igenom ditt CV i sju delar, från kontaktuppgifter till datum, ordning och längd. Du får en läsbarhetspoäng av 100 och ser vad som saknas. Gratis för varje CV.`

  `cv-analys-faq-data.ts:23-24`:
  fråga `Vilka förbättringsförslag får jag?` (oförändrad)
  svar `Jobbcoachen skriver förslag på nya formuleringar i de delar där du tappar poäng. Personbeskrivning: din öppning, omskriven så att den säger vilken roll du har och vad du kan. Erfarenhet: rollerna med punkter som börjar med vad du gjorde, och plats för din egen siffra där ett resultat saknas. Kompetenser: termer du kan lägga till om de stämmer. Du ser din nuvarande text och förslaget bredvid varandra, och hur många poäng förslaget ger. Det ingen kan skriva åt dig, som ett telefonnummer, ett årtal eller en språknivå, står i genomgången med var du fyller i det.`

- **Skäl:** löftesraden följer skissen. "60 sek till poängen" utgår ur raden eftersom raden nu bär de tre tal som är sidans huvudsak, se B1 om tidsuppgiften.
- **Hänger ihop med:** CVA-1, CVA-3, CVA-5, GEM-7, TEL-1.

### CVA-3 · `layout.tsx:9, :11, :21` · `page.tsx:42, :52, :60, :85, :87` · `cv-analys-faq-data.ts:19-20` · `CVAnalysMini.tsx:151`

- **I dag:** "ats-poäng" (keywords), "CV-analys på 60 sekunder med ATS-poäng" (OG och twitter), "CV-analys som ger ATS-poäng från 0 till 100", "få ATS-poäng", "Få ATS-poäng och förslag", "Vad betyder ATS-poängen?", "så får du en ATS-poäng och det viktigaste du bör ändra".
- **Förslag:**

  `layout.tsx:9` (keywords):
  `cv analys, läsbarhetspoäng cv, ats cv, cv feedback, granska cv, cv betyg, cv granskare, cv optimering, cv check svenska`

  `layout.tsx:11` och `:21` (OG- och twitter-titel), 51 tecken:
  `CV-analys med läsbarhetspoäng av 100 | Jobbcoach.ai`

  `page.tsx:42` (WebApplication, `description`):
  `CV-analys som ger en läsbarhetspoäng från 0 till 100, en genomgång i sju delar och Jobbcoachens förslag på nya formuleringar. Anpassad för svenska arbetsgivare.`

  `page.tsx:60` (HowTo, `description`):
  `Fyra steg från uppladdat CV till starkare ansökan: ladda upp, vi går igenom sju delar, se läsbarhetspoängen, hämta Jobbcoachens förslag.`

  `page.tsx:85` och `:87`: se CVA-2.

  `cv-analys-faq-data.ts:19-20`:
  fråga `Vad betyder läsbarhetspoängen?`
  svar `Läsbarhetspoängen är ett tal från 0 till 100 som visar hur lätt ditt CV är att läsa för en rekryterare och för rekryteringssystem (ATS), de system svenska arbetsgivare sorterar ansökningar i. Vi räknar den ur det som står i CV:t, i sju delar: kontaktuppgifter, personbeskrivning, erfarenhet, kompetenser, utbildning, språk och till sist datum, ordning och längd. Bredvid poängen ser du hur många poäng som återstår till 100, i vilka delar de sitter och hur långt Jobbcoachens förslag tar dig.`

  `CVAnalysMini.tsx:151`:
  `Ladda upp ditt CV som PDF eller Word, så får du din läsbarhetspoäng och det viktigaste du bör ändra. Inget konto behövs, och vi sparar varken filen eller texten.`
  (Andra meningen står ordagrant kvar. Den rör lagring och ändras inte.)

- **Skäl:** "ats cv" står kvar bland keywords, där det inte är ett påstående om poängen. "ats-poäng" utgår. Jag skriver inte "samma CV ger alltid samma poäng" på den publika sidan, se beslut 3.
- **Hänger ihop med:** CVA-2, CVA-5, ART-15, GEM-7.

### CVA-4 · `page.tsx:80, :138` · `layout.tsx:13, :23` · `cv-analys-faq-data.ts:16`

- **I dag:** "Vi kontrollerar struktur, språk, nyckelord och kvantifierade resultat."; "Vi läser ditt CV som ett rekryteringssystem gör och kontrollerar struktur, språk, nyckelord och kvantifiering."; "Vi kontrollerar struktur, språk, nyckelord och kvantifiering."
- **Förslag:**

  `page.tsx:76-80` (HowTo steg 2, också synligt steg):
  namn `Vi går igenom sju delar`
  text `Kontaktuppgifter, personbeskrivning, erfarenhet, kompetenser, utbildning, språk och till sist datum, ordning och längd. Varje del har sina poäng, och tillsammans blir de 100.`

  `page.tsx:138` (hjältens ingress):
  `Vi går igenom ditt CV i sju delar, från kontaktuppgifter till datum, ordning och längd, och räknar en läsbarhetspoäng av 100.`

  `page.tsx:139` (fetstilta raden, följdändring):
  `Du ser var varje tappad poäng sitter och hur du tar tillbaka den.`

  `layout.tsx:13`: se CVA-2.

  `layout.tsx:23` (twitter-description), 124 tecken:
  `Sju delar, hundra poäng. Du ser var ditt CV tappar och vad som saknas i varje del. Läsbarhetspoängen är gratis för varje CV.`

  `cv-analys-faq-data.ts:16`: se CVA-7.

- **Hänger ihop med:** CVA-1, CVA-2, CVA-7, ART-7, ART-14.

### CVA-5 · `layout.tsx:7, :13, :23` · `page.tsx:49, :143, :170-171` · `cv-analys-faq-data.ts:31-32`

- **I dag:** "En analys gratis per konto."; "1 CV-analys gratis per konto, ingen kortuppgift"; löftet "1 analys / gratis per konto"; "Hela analysen, varje fynd med åtgärd." och "Poängen och det tyngsta fyndet är gratis. Hela analysen, alla mallar och personliga brev utan tak ingår i Premium."; FAQ "Hur många analyser får jag göra gratis?" med "En analys per konto är gratis ...".
- **Förslag:**

  `layout.tsx:7` (metabeskrivning), 152 tecken:
  `CV-analys som ger ditt CV en läsbarhetspoäng av 100 i sju delar, för rekryterare och rekryteringssystem (ATS). Poängen är gratis för varje CV du sparar.`

  `layout.tsx:13` och `:23`: se CVA-2 och CVA-4.

  `page.tsx:49` (WebApplication, `offers.description`):
  `Läsbarhetspoängen och genomgången i sju delar gratis för varje CV, ingen kortuppgift`

  `page.tsx:143`: se CVA-2.

  `page.tsx:170-171` (slutblocket):
  rubrik `Alla förslag, och nya när du har ändrat.`
  text `Läsbarhetspoängen och genomgången i sju delar är gratis för varje CV. Alla förslag från Jobbcoachen, nya förslag efter varje ändring, alla mallar och personliga brev utan tak ingår i Premium.`

  `cv-analys-faq-data.ts:31-32`:
  fråga `Hur många analyser får jag göra gratis?` (oförändrad)
  svar `Det finns ingen gräns för själva analysen. Läsbarhetspoängen och genomgången i sju delar är gratis för varje CV du sparar, utan att du lämnar kortuppgifter. Det som räknas är Jobbcoachens förslag: dem hämtar du en gång gratis per konto, och då är det tyngsta förslaget öppet. Alla förslag, och nya förslag när du har ändrat i CV:t, ingår i Premium, 149 kr i månaden.`

  Om frågan ändå byts, SEO:s lydelse med samma fakta:
  fråga `Vad är gratis i CV-analysen?`
  svar `Läsbarhetspoängen och genomgången i sju delar är gratis för varje CV du sparar, utan att du lämnar kortuppgifter. Jobbcoachens förslag hämtar du en gång gratis per konto, och då är det tyngsta förslaget öppet. Alla förslag, och nya förslag när du har ändrat i CV:t, ingår i Premium, 149 kr i månaden.`

- **Skäl:** slutblockets rubrik är SEO:s lydelse. FAQ-frågan låter jag stå ordagrant: den följer SEO:s egen regel R2, kräver inget undantag i grinden, och svaret "ingen gräns" är sant. SEO föreslår i stället bytet till "Vad är gratis i CV-analysen?". Saas-lead väljer, se avstämningen sist.
- **Hänger ihop med:** GEM-1, GEM-5, PRI-1, STA-3, REG-1, REK-1, CVA-6, CVA-11.

### CVA-6 · `cv-analys-faq-data.ts:35-36`

- **I dag:** "Kan jag köra analysen igen när jag ändrat i CV:t?" med "Ja. Med Premium kör du analysen utan tak, så du kan rätta efter fynden, ladda upp igen och se om poängen rör sig. ..."
- **Förslag:**
  fråga `Kan jag köra analysen igen när jag ändrat i CV:t?` (oförändrad)
  svar `Du behöver inte köra om något. Poängen räknas om varje gång du sparar CV:t, gratis och utan gräns, så du ser direkt om ändringen gjorde skillnad. Det är användbart när du testar olika formuleringar, lägger till en siffra i en roll eller byter ordning på avsnitten. Med Premium kan du dessutom be Jobbcoachen om nya förslag efter ändringen, så ofta du vill.`
  Om frågan ändå byts, SEO:s lydelse med samma fakta:
  fråga `Räknas poängen om när jag ändrar i CV:t?`
  svar `Ja. Poängen räknas om varje gång du sparar CV:t, gratis och utan gräns, så du ser direkt om ändringen gjorde skillnad. Det är användbart när du testar olika formuleringar, lägger till en siffra i en roll eller byter ordning på avsnitten. Med Premium kan du dessutom be Jobbcoachen om nya förslag efter ändringen, så ofta du vill.`

- **Skäl:** frågan är som folk söker, svaret rättar föreställningen. Produktfacit förbjuder "kör om analysen" som beskrivning av produkten, och svaret säger just att det inte behövs. SEO föreslår bytet ovan. Saas-lead väljer, se avstämningen sist.
- **Hänger ihop med:** CVA-5, GEM-7, PRI-1, PRI-2, REG-2, ART-2.

### CVA-7 · `page.tsx:76-80` · `cv-analys-faq-data.ts:15-16`

- **I dag:** steg 2 "Vi analyserar i bakgrunden" med "Det tar 30 till 60 sekunder."; FAQ "Mellan 30 och 60 sekunder från att du klickat på "Analysera". ..."
- **Förslag:**

  `page.tsx:76-80`: se CVA-4.

  `cv-analys-faq-data.ts:15-16`:
  fråga `Hur lång tid tar en CV-analys?` (oförändrad)
  svar `Här på sidan, utan konto, får du läsbarhetspoängen och det viktigaste att ändra inom en halv minut från att du valt filen. I kontot står poängen och genomgången i sju delar klara så snart ditt CV är inläst, och de räknas om varje gång du sparar. Vill du ha Jobbcoachens förslag på nya formuleringar hämtar du dem med ett tryck, och det tar under en minut. Du behöver inte göra något under tiden.`

- **Skäl:** skissen strök frågan för att tiden inte var belagd. Den går att belägga: den publika rutten avbryts efter 30 sekunder (`src/app/api/public/quick-score/route.ts:21`, `maxDuration = 30`), och knappen i kontot säger själv "Tar under en minut" (`analysTexter.ts:44`). Då kan frågan stå kvar för sökningens skull.
- **Hänger ihop med:** CVA-4, CVA-9, ART-1 (raden "Vänta mellan 30 och 60 sekunder").

### CVA-8 · `page.tsx:71-73`

- **I dag:** "Ladda upp ett befintligt CV som PDF eller välj ett du redan sparat. Analysen är byggd för svenska CV."
- **Förslag:**
  namn `Ladda upp ditt CV` (oförändrat)
  text `Ladda upp ditt CV som PDF eller Word, eller välj ett du redan har sparat. Är din PDF inskannad läser vi av bilden när du är inloggad, och bildläsningen läser svenska. Analysen är byggd för svenska CV.`
- **Hänger ihop med:** CVA-10, ART-5.

### CVA-9 · `page.tsx:89-95` · `cv-analys-faq-data.ts:43-44`

- **I dag:** steg 4 "Spara den förbättrade versionen" med "Välj vilka förslag du vill applicera, granska före och efter och ladda ner som PDF."; FAQ "Du får upp resultatet direkt och kan välja vilka förslag du vill applicera. Klickar du i en förbättring uppdateras potentialpoängen i realtid ..."
- **Förslag:**

  `page.tsx:89-95` (HowTo steg 4, också synligt steg):
  namn `Hämta Jobbcoachens förslag`
  text `Jobbcoachen skriver förslag på nya formuleringar där du tappar poäng. Du väljer vilka som följer med, sparar och ser poängen räknas om. Sedan väljer du en av 40 mallar och laddar ner CV:t som PDF, eller som Word i 26 av mallarna.`

  `cv-analys-faq-data.ts:43-44`:
  fråga `Vad händer efter analysen?` (oförändrad)
  svar `Du ser poängen, vad som saknas i varje del och hur många poäng som återstår till 100. Därifrån öppnar du CV:t och fyller i det som saknas, eller hämtar Jobbcoachens förslag och väljer vilka som ska följa med. Poängen räknas om när du sparar. När du är nöjd väljer du en av 40 mallar och laddar ner CV:t som PDF, eller som Word i 26 av mallarna. Två mallar och en nedladdning är gratis.`

- **Hänger ihop med:** CVA-2, CVA-7, PRI-5, FUN-8.

### CVA-10 · `cv-analys-faq-data.ts:27-28`

- **I dag:** "Analysen är byggd för svenska CV och svensk arbetsmarknad: förslagen, nyckelorden och omskrivningarna kommer på svenska. Har du ett engelskt CV går det att ladda upp, men räkna med att förslagen blir på svenska. ..."
- **Förslag:**

  fråga `Behöver jag ha CV:t på svenska?` (oförändrad)
  svar `Analysen är byggd för svenska CV och svensk arbetsmarknad, och Jobbcoachens förslag kommer på svenska. Har du ett engelskt CV går det att ladda upp som Word eller som PDF med markerbar text, men räkna med att förslagen blir på svenska. Är CV:t inskannat, alltså sparat som bild, läser vi bara av svensk text. Svenska arbetsgivare föredrar oftast ansökningar på svenska om jobbet inte är uttalat internationellt.`

  Ny fråga, sist före "Är mitt CV säkert hos er?" (SEO-regel 6):
  fråga `Kan jag ladda upp ett inskannat CV som PDF?` (SEO:s lydelse, med ordet CV i frågan)
  svar `Ja, när du är inloggad. Då läser vi av bilden och gör om den till text, och det tar ungefär en halv minut. Bildläsningen läser svenska. Här på sidan, utan konto, kan vi inte läsa en inskannad PDF. Ladda då upp en PDF med markerbar text eller en Word-fil, eller skapa ett gratiskonto.`

- **Skäl:** "nyckelorden" utgår ur första meningen eftersom analysen inte mäter nyckelord (CVA-4).
- **Hänger ihop med:** CVA-8, ART-5.

### Svaret "Är mitt CV säkert hos er?" · `cv-analys-faq-data.ts:39-40`

Ägarens, ändras inte.

### CVA-11 · `CVAnalysMini.tsx:117-120, :133`

- **I dag:** "Vi hittade mer i ditt CV"; "Skapa ett gratiskonto så kör vi en full analys av hela CV:t. Du får läsbarhetspoängen, hur många fynd vi hittade och det tyngsta fyndet i klartext med åtgärd."; knappen "Se hela analysen".
- **Förslag:**
  rubrik `Se hela genomgången, del för del`
  text `Skapa ett gratiskonto, så går vi igenom hela CV:t i sju delar. Du ser läsbarhetspoängen, vad som saknas i varje del och hur du når 100. Jobbcoachens förslag hämtar du en gång gratis.`
  knapp `Se hela genomgången`
  rad under knappen: `Inget kreditkort. Avsluta när du vill.` (oförändrad)
- **Hänger ihop med:** CVA-5, CVA-12, REG-1.

### CVA-12 · `CVAnalysMini.tsx:82-110`

- **I dag:** "Det här bör du fixa först", raden "Vi hittade inget akut att ändra. Den fullständiga analysen går djupare." och de grå raderna "Förbättring 2 av 3".
- **Förslag:**
  rubrik `Det viktigaste att ändra först`
  rad när inget hittats: `Vi hittade inget akut att ändra. Genomgången i kontot visar varje del för sig.`
  De grå raderna "Förbättring N av M" utgår. I deras ställe en fast lista med rubriken `I kontot ser du`:
  `Poängen del för del, i alla sju delar`
  `Vad som saknas i varje del, utmärkt på ditt CV`
  `Jobbcoachens förslag på nya formuleringar`
- **Skäl:** de numrerade grå raderna lovar fynd som kontot aldrig visar. En fast lista över det kontot faktiskt visar lovar inget som inte finns. Att texten under rubriken fortfarande kommer ur en annan analys än kontots går inte att lösa med ord, se beslut 2.
- **Hänger ihop med:** CVA-11, TEL-1.

---

## 2. Gemensamma källor för /priser och /funktioner (och fler sidor)

### GEM-1, GEM-2, GEM-3 · `src/lib/plans/gratis-copy.ts:51-57, :63-67, :73-89, :92-94, :103-106`

De tre posterna rör samma fem strängar och skrivs därför en gång. Texterna syns på /priser ("Vill du se först?"), i startsidans FAQ och FAQPage, på artiklarnas gratiskort och i registreringens steg 3.

- **I dag (listan):** "Grundnivån i alla åtta testtyperna med ett test om dagen, personlighetstestet och förklaring efter varje fråga", "Två CV-mallar och en nedladdning", "En CV-analys med poängen och det tyngsta fyndet", "Ett personligt brev var sjunde dag, att läsa på skärmen", "Tre matchade jobb och tio meddelanden till Jobbcoachen".
- **Förslag:**

  `GRATIS_LISTA` (sex rader, den nya sist så att index 1, 2 och 3 som registreringen läser står kvar):
  1. `Grundnivån i alla åtta testtyperna med ett test om dagen, personlighetstestet och förklaring efter varje fråga` (oförändrad, se B4)
  2. `Två CV-mallar och en nedladdning` (oförändrad)
  3. `CV-analysens läsbarhetspoäng och genomgång i sju delar, för varje CV`
  4. `Ett personligt brev var sjunde dag, och de två senaste går att ändra`
  5. `Tre matchade jobb, tio meddelanden till Jobbcoachen och ett intervjuprov om dagen`
  6. `Sökta tjänster med Ska sökas, veckans mål och det första uppföljningsmejlet`

  `GRATIS_MENING_LANG`:
  `Utan att betala gör du grundnivån i alla åtta testtyperna, ett test om dagen, och personlighetstestet med 50 påståenden, får två CV-mallar och en nedladdning, CV-analysens läsbarhetspoäng och genomgång i sju delar för varje CV, ett personligt brev var sjunde dag där de två senaste går att ändra, tre matchade jobb, tio meddelanden till Jobbcoachen och Sökta tjänster med det första uppföljningsmejlet. Inget kort behövs.`

  `GRATIS_MENING_LANG_DELAR` (samma mening, fetstil inom asterisker):
  `Utan att betala gör du ` *grundnivån i alla åtta testtyperna, ett test om dagen* `, och ` *personlighetstestet* ` med 50 påståenden, får ` *två CV-mallar* ` och en nedladdning, ` *CV-analysens läsbarhetspoäng* ` och genomgång i sju delar för varje CV, ` *ett personligt brev* ` var sjunde dag där de två senaste går att ändra, ` *tre matchade jobb* `, ` *tio meddelanden* ` till Jobbcoachen och ` *Sökta tjänster* ` med det första uppföljningsmejlet. Inget kort behövs.`

  `GRATIS_MENING_KORT`:
  `Ett grundnivåtest om dagen, två CV-mallar, CV-analysens läsbarhetspoäng för varje CV, ett personligt brev var sjunde dag, tre matchade jobb, tio meddelanden till Jobbcoachen och Sökta tjänster ingår utan att betala.`

  `GRATIS_FAQ` (startsidans FAQ-svar, också FAQPage):
  `Gratisnivån kräver inget kort: grundnivån i alla åtta testtyperna, ett test om dagen, och personlighetstestet, 2 CV-mallar och en nedladdning, CV-analysens läsbarhetspoäng och genomgång i sju delar för varje CV, ett personligt brev var sjunde dag, 3 matchade jobb, 10 meddelanden till Jobbcoachen och Sökta tjänster med det första uppföljningsmejlet.`

- **Skäl:** intervjuprovet får plats i rad 5 i listan men inte i meningarna, som redan är långa. Kommentaren i filen säger "fem rader" och testet `gratis-copy.test.ts` vaktar listan, så bygget ändrar båda.
- **Hänger ihop med:** CVA-5, GEM-7, GEM-8, PRI-1, PRI-6, PRI-7, PRI-10, FUN-2, STA-3, REG-1, REG-3, EX-1, ART-2, ART-7, ART-9, ART-13.

### GEM-4, GEM-5 (första stället) · `src/lib/plans/plans.ts:93-99`

- **I dag:** fem rader, bland dem "Alla CV-mallar, CV-analysen, personliga brev och LinkedIn".
- **Förslag** (`HELA_PAKETET_RADER`, sex rader):
  1. `Åtta testtyper i tre nivåer, övningsprov mot klockan och det fördjupade personlighetstestet` (oförändrad)
  2. `Alla CV-mallar, CV-analysens alla förslag, personliga brev och LinkedIn`
  3. `Jobbmatchning, de 25 bästa träffarna med skälen` (oförändrad)
  4. `Uppföljningsmejl till dina sökta tjänster och rapporten till Arbetsförmedlingen, att skriva ut eller kopiera`
  5. `Jobbcoachen, fråga så mycket du vill` (oförändrad)
  6. `Intervjuprovet utan dagsgräns och hela din testhistorik` (oförändrad)
- **Skäl:** rad 2 och 4 följer startsidans skiss. "Rapporten till Arbetsförmedlingen" är orden beslut 4 i `docs/beslut-jobbsoket-2026-11-21.md` kräver. Vi skriver aldrig att vi skickar rapporten.
- **Hänger ihop med:** GEM-6, PRI-7, PRI-8, REK-4, ART-6, ART-9. Listan läses av /priser, startsidan, artiklarnas listslutkort och prisschemat (`highlights`), så en ändring här slår igenom på alla fyra.

### GEM-5 (övriga ställen) · `linkedin-optimering/page.tsx:208` · `linkedin-optimering-faq-data.ts:47` · `skapa-cv/page.tsx:233` · `reklam-copy.ts:77, :223`

- **I dag:** "tillsammans med alla CV-mallar, hela CV-analysen, personliga brev utan tak och rekryteringstesterna"; "Alla 40 mallar, Word i alla 26 Word-mallar, hela CV-analysen och nedladdning utan tak ingår i Premium"; "Alla 40 mallar och hela CV-analysen ingår i Premium, 149 kr i månaden."; "Hela CV-analysen med varje fynd och åtgärd".
- **Förslag:**

  `linkedin-optimering/page.tsx:208`:
  `LinkedIn-optimeringen ingår i Jobbcoach Premium, tillsammans med alla CV-mallar, CV-analysens alla förslag, personliga brev utan tak och rekryteringstesterna. Säg upp när du vill. Vi loggar aldrig in på din LinkedIn, du klistrar in texten själv.`

  `linkedin-optimering-faq-data.ts:47`:
  `LinkedIn-optimeringen ingår i Jobbcoach Premium, 149 kr i månaden, tillsammans med alla CV-mallar, CV-analysens alla förslag, personliga brev utan tak och rekryteringstesterna. Du säger upp när du vill. Utan prenumeration kan du se exemplet här på sidan och skapa ett konto, men inte köra optimeringen på din egen profil.`

  `skapa-cv/page.tsx:233`:
  `Skriv direkt på arket, låt Jobbcoachen föreslå punkterna och ladda ner i en mall som systemen kan läsa. Du börjar gratis utan kortuppgift. Alla 40 mallar, Word i alla 26 Word-mallar, CV-analysens alla förslag och nedladdning utan tak ingår i Premium.`

  `reklam-copy.ts:77` (inlinekortet för mallar, paketraden):
  `Alla 40 mallar och CV-analysens alla förslag ingår i Premium, 149 kr i månaden.`

  `reklam-copy.ts:223` (slutkortet i CV-klustret, första raden):
  `CV-analysens alla förslag, och nya efter varje ändring`

- **Hänger ihop med:** GEM-4, REK-1, REG-2.

### GEM-6 · `plans.ts:184` (och samma rad på `:169`, `:199`) · `priser/page.tsx:105`

- **I dag:** "Tester, CV, personliga brev, jobbmatchning och Jobbcoachen"; i prissidans hjälte "Rekryteringstester, CV, personliga brev, jobbmatchning och Jobbcoachen".
- **Förslag:**

  `plans.ts:184` (`beskrivning`, högst 60 tecken), 54 tecken:
  `Tester, CV, personliga brev, Jobbsöket och Jobbcoachen`

  `priser/page.tsx:105` (fetstilta raden under H1, utan teckengräns):
  `Rekryteringstester, CV, personliga brev och Jobbsöket med jobbmatchning, sökta tjänster och Jobbcoachen`

- **Skäl:** raden under paketnamnet ryms inte med både "jobbmatchning" och "sökta tjänster" inom 60 tecken. Rummets namn bär båda. På prissidan, där sökordet "jobbmatchning" gör nytta, står det utskrivet. Se beslut 8.
- **Hänger ihop med:** GEM-4, PRI-9. Raden syns också i OG-undertiteln för /priser och på artiklarnas tre sidokort.

### GEM-7 · `src/components/pricing/paket-copy.ts:195-202`

- **I dag:** "Ingår i Premium. Gratis: poängen och det tyngsta fyndet."; "... inom en minut får du en läsbarhetspoäng från 0 till 100, vad den kan bli när du följt förslagen, och förslagen i fyra delar: personbeskrivning, roller, kompetenser och allmänna råd om struktur, formatering, innehåll och nyckelord. Varje fynd har en åtgärd."; stegen "Nyckelorden rekryteringssystem (ATS) letar efter i din bransch." och "Rätta, kör om, se poängen röra sig."
- **Förslag:**

  `sub` (`:195`):
  `Ingår i Premium. Gratis: läsbarhetspoängen och genomgången i sju delar, för varje CV.`

  `text` (`:196`):
  `De flesta CV:n sållas bort innan en människa läst dem. Analysen visar var ditt tappar, och vad du ändrar. Ladda upp som PDF eller Word, så går vi igenom CV:t i sju delar och räknar en läsbarhetspoäng av 100: kontaktuppgifter, personbeskrivning, erfarenhet, kompetenser, utbildning, språk och till sist datum, ordning och längd. Du ser var varje tappad poäng sitter. Jobbcoachen skriver förslag på nya formuleringar, och poängen räknas om när du sparar.`

  `steg` (`:197-202`):
  `Ladda upp, vi läser som en rekryterare gör på sex sekunder.` (oförändrad)
  `En läsbarhetspoäng av 100: hur lätt CV:t är att läsa för rekryteraren och för rekryteringssystemen (ATS).`
  `Vad som saknas i var och en av de sju delarna, och Jobbcoachens förslag på nya formuleringar.`
  `Rätta och spara, så räknas poängen om.`

  `scenAlt` (`:193`): `CV-analysens genomgång` (i dag "CV-analysens rapport").

- **Skäl:** "(ATS)" står kvar en gång i stegen, som förklaring, eftersom ordet fanns där och sidorna /priser och /funktioner rankar på det. "inom en minut" utgår: poängen visas så snart CV:t är inläst, och det är förslagen som tar under en minut.
- **Hänger ihop med:** CVA-1, CVA-5, CVA-6, PRI-2, FUN-6, STA-1, TEL-1.

### GEM-8 · `paket-copy.ts:210`

- **I dag:** "Ingår i Premium. Gratis: ett personligt brev att läsa, nedladdning ingår inte."
- **Förslag:** `Ingår i Premium. Gratis: första personliga brevet, sedan ett var sjunde dag. De två senaste går att ändra, nedladdning ingår inte.`
- **Hänger ihop med:** GEM-2, FUN-5, PRI-6, BRV-1.

### GEM-9 · `paket-copy.ts:211, :216`

- **I dag:** "Redigera, ladda ner som PDF, skicka."
- **Förslag:**
  `:211` (sista meningen i texten): `Redigera, ladda ner som PDF eller Word, skicka.`
  `:216` (sista steget): `Redigera, ladda ner som PDF eller Word, skicka.`
- **Skäl:** Word finns i 26 av 40 mallar. I en rad på sex ord ryms inte talet, och det står på brevets egen sida.
- **Hänger ihop med:** PRI-4, PRI-6, REK-2, ART-19.

### GEM-10 · `paket-copy.ts:245`

- **I dag:** "... matchar dem mot alla annonser i Platsbanken, som fylls på tre gånger per dygn. Varje gång du öppnar sidan får du de 25 bästa träffarna med skälen utskrivna: vilka krav du täcker och vad som saknas. Från en träff skriver du det personliga brevet med ett klick."
- **Förslag** (hela texten):
  `Den som söker på sin vanliga yrkestitel missar jobben som efterfrågar samma kompetens under ett annat namn, i en annan bransch. Vi utgår i stället från dina kompetenser, erfarenheter och utbildningar och matchar dem mot annonserna i Platsbanken. Annonserna hämtas tre gånger per dygn, och du söker om med ett tryck när du vill se de senaste. Du får de 25 bästa träffarna med skälen utskrivna: vilken av dina roller som matchar och vilka av dina kompetenser annonsen frågar efter. Från en träff skriver du det personliga brevet, sparar annonsen till Ska sökas eller markerar den som sökt.`
- **Skäl:** "vad som saknas" utgår. Raden "saknas i ditt CV" visas bara när annonsen har en utskriven kravprofil (`src/components/jobb3/jobb/annons.ts:60`, `kit/delar.tsx:357-361`), och det har få annonser. "alla annonser" blir "annonserna", som i skissen: vyn säger själv "upp till 600 annonser" (`MatchadeJobb.tsx:1050`). Sista meningen löser också GEM-12 för det här kortet.
- **Hänger ihop med:** FUN-1, STA-4, JM-3, JM-5, ART-3, ART-8, ART-11, TEL-3.

### GEM-11 · `paket-copy.ts:254`

- **I dag:** "Fråga vad du vill om lön, intervju, uppsägningstid eller hur du svarar på ett avslag. Svaren utgår från svensk arbetsmarknad och ditt eget CV, inte från en amerikansk mall."
- **Förslag:**
  `Fråga vad du vill om lön, intervju, uppsägningstid eller hur du svarar på ett avslag. Svaren utgår från svensk arbetsmarknad, med källor du kan kolla själv, inte från en amerikansk mall. Jobbcoachen känner till din målroll, ort och bransch och de dokument du själv delar i samtalet, och föreslår frågor utifrån läget i dina sökta tjänster.`
- **Hänger ihop med:** STA-5, STA-6, JC-1, JC-2, REK-3, TEL-5.

### GEM-12 · `paket-copy.ts:239-256`

- **I dag:** korten "Matchade jobb" och "Jobbcoachen". Inget kort för Sökta tjänster eller Inför intervjun.
- **Förslag:** Matchade jobb och Jobbcoachen är lösta i GEM-10 och GEM-11. Två nya kort, efter Matchade jobb och före Jobbcoachen:

  Kort 1
  rubrik `Sökta tjänster`
  rad under rubriken `Gratis för alla med konto. I Premium: uppföljningsmejl till varje sökt tjänst och rapporten att skriva ut.`
  text `Den som söker många jobb tappar lätt bort vem som har svarat. Här sparar du annonsen du ska söka, med sista ansökningsdag, loggar den du har sökt och följer varje tjänst från Sökt till Erbjudande. Veckans mål håller takten uppe. Efter tolv tysta dagar föreslår vi ett uppföljningsmejl och skriver utkastet, som öppnas i din egen e-post. Vi skickar aldrig något åt dig. Månadens sökta jobb står sammanställda som underlag till aktivitetsrapporten hos Arbetsförmedlingen, och den lämnar du in själv.`
  bildtext `Sökta tjänster, från Ska sökas till Erbjudande`

  Kort 2
  rubrik `Inför intervjun`
  rad under rubriken `Ingår i Premium. Gratis: ett intervjuprov om dagen.`
  text `Svara på en intervjufråga och få återkoppling som från en rekryterare: vad som hördes, och vad som saknades. När du är kallad skriver du in när intervjun är, så står den under Intervjuer på gång med förberedelserna bredvid. Efteråt frågar vi hur det gick, och hör du inget på sju dagar påminner vi om att fråga efter besked.`
  bildtext `Intervjuprovet med återkoppling på svaret`

- **Skäl:** rummets fyra flikar heter Översikt, Matchade jobb, Sökta tjänster och Inför intervjun, och två av dem saknas på sidorna som säljer rummet. Korten kräver en plats i layouten, så om de byggs avgör formspåret, se beslut 9.
- **Hänger ihop med:** PRI-7, FUN-4, FUN-10, STA-7, GEM-10.

### GEM-13 · `paket-copy.ts:269-281`

- **I dag:** "11 steg", bland dem "CV uppladdat och analyserat", "CV:t uppdaterat efter fynden", "Första jobbmatchningen: jobb du inte hittat själv".
- **Förslag:** ingen ändring.
- **Skäl:** listan på /priser beskriver Premiums Kom igång. Brickan "Logga en tjänst du har sökt" finns på grenen bara i gratislistorna (`git show feat/jobbsoket-omgang2:src/lib/onboarding/komigang.ts`, raderna 67 till 85 och 103 till 107). Premiums lista saknar den, och beslut 21 säger att betalandes lista väntar. Lägger vi till raden publikt lovar vi ett steg som inte finns. Orden "analyserat" och "efter fynden" speglar brickornas egna titlar inloggat ("CV-analysen körd", "Uppdatera CV:t efter fynden") och byts när de byts. Se beslut 10.
- **Hänger ihop med:** inget.

---
## 3. /priser

Gratisrutan "Vill du se först?", listan "Allt i Premium" och fem av stationernas texter läser de gemensamma källorna: se GEM-1 till GEM-11.

### PRI-1 · `src/app/(public)/priser/components/priser-data.ts:131-134`

- **I dag:** rad "CV-analys", under "poäng, fynd, nyckelord", gratis "Poäng och tyngsta fyndet" med "en gång", Premium "Hela rapporten" med "kör om utan tak".
- **Förslag** (två rader i stället för en, i gruppen "CV och personliga brev"):

  | Rad | Under | Gratis | Premium |
  |---|---|---|---|
  | `CV-analys` | `läsbarhetspoäng i sju delar` | `Poängen och genomgången`, under: `för varje CV` | `Ingår`, under: `för varje CV` |
  | `Jobbcoachens förslag` | `nya formuleringar till ditt CV` | `1 hämtning`, under: `det tyngsta förslaget öppet` | `Alla förslag`, under: `nya efter varje ändring` |

- **Skäl:** det som skiljer gratis från Premium är förslagen, inte analysen. Med en rad måste en cell bära två saker. Två rader visar gränsen där den går.
- **Hänger ihop med:** CVA-5, GEM-1, GEM-7, PRI-2, PRI-10.

### PRI-2 · `src/app/(public)/priser/page.tsx:253-258`

- **I dag:** "Poäng per område: Och de fynd som drar ned mest.", "Nyckelorden: De rekryteringssystem (ATS) letar efter i din bransch.", "Rätta, kör om: Se poängen röra sig."
- **Förslag** (rubrik, sedan text):
  `Ladda upp` `Vi läser som en rekryterare gör på sex sekunder.` (oförändrad)
  `Poäng per del` `Hur lätt CV:t är att läsa för rekryteraren och rekryteringssystemen (ATS), och vad som saknas i var och en av de sju delarna.`
  `Jobbcoachens förslag` `Nya formuleringar där du tappar poäng. En hämtning ingår gratis.`
  `Rätta och spara` `Se poängen räknas om.`
- **Hänger ihop med:** GEM-7, PRI-1, CVA-6.

### PRI-3 · `priser/page.tsx:272`

- **I dag:** "Välj ton: Saklig, personlig eller vi väljer åt dig."
- **Förslag:** `Välj ton` `Fem toner, från professionell till kreativ. I Premium väljer vi åt dig efter annonsen.`
- **Skäl:** samma lydelse som redan står i `paket-copy.ts:214`, så att /priser och /funktioner säger samma sak.
- **Hänger ihop med:** inget.

### PRI-4 · `priser/page.tsx:274`

- **I dag:** "Redigera, ladda ner som PDF, skicka"
- **Förslag:** `Redigera, ladda ner som PDF eller Word, skicka` med texten `Det som står i CV:t vinner.` (oförändrad)
- **Hänger ihop med:** GEM-9, PRI-6.

### PRI-5 · `priser-data.ts:137-140`

- **I dag:** "CV-nedladdning", under "som PDF", gratis "1 gång".
- **Förslag:** rad `CV-nedladdning`, under `som PDF, och som Word i 26 av mallarna`, gratis `1 gång`, Premium `Utan tak`.
- **Hänger ihop med:** FUN-8, SCV-2, CVA-9.

### PRI-6 · `priser-data.ts:143-146`

- **I dag:** gratis "1, sedan 1 i veckan" med "läsa, inte ladda ner"; Premium "Utan tak" med "nedladdning som PDF".
- **Förslag:** gratis `1, sedan 1 i veckan`, under: `läs, kopiera och ändra de två senaste`. Premium `Utan tak`, under: `nedladdning som PDF eller Word`.
- **Hänger ihop med:** GEM-2, GEM-8, FUN-5, BRV-1.

### PRI-7 · `priser-data.ts:156-178`

- **I dag:** gruppen "Jobb och coachning" med Matchade jobb, Jobbcoachen och Intervjuprovet.
- **Förslag:** gruppen heter `Jobbsöket`. Raderna i den här ordningen:

  | Rad | Under | Gratis | Premium |
  |---|---|---|---|
  | `Matchade jobb` | `kompetens mot alla branscher` | `3 träffar` | `25 träffar`, under: `med skälen utskrivna` (oförändrad) |
  | `Sökta tjänster` | `Ska sökas, veckans mål och statistik` | `Ingår` | `Ingår` |
  | `Uppföljningsmejl` | `utkast som öppnas i din egen e-post` | `1 utkast` | `Till varje sökt tjänst` |
  | `Rapport till Arbetsförmedlingen` | `månadens sökta jobb, du lämnar in den själv` | `Antalen per månad` | `Hela rapporten`, under: `skriv ut eller kopiera som text` |
  | `Intervjuprovet` | `svara på en intervjufråga, få återkoppling som från en rekryterare` | `1 om dagen` | `Utan tak` (oförändrad) |
  | `Jobbcoachen` | `lön, intervju, avtal` | `10 meddelanden` | `Utan tak` (oförändrad) |

- **Skäl:** gruppen får rummets namn. Taket på 30 utkast per dygn i Premium står inte i tabellen: "till varje sökt tjänst" är sant och ingen läsare når taket. Vill saas-lead ha talet utskrivet blir underraden `högst 30 utkast per dygn`.
- **Hänger ihop med:** GEM-3, GEM-4, PRI-8, FUN-4, STA-7.

### PRI-8 · `priser-data.ts:193-194`

- **I dag:** "Allt vi gör: alla CV-mallar, CV-analysen, personliga brev och LinkedIn, alla rekryteringstester med övningsprov, intervjuprovet utan dagsgräns och personlighetstestet, jobbmatchning med de 25 bästa träffarna och Jobbcoachen. 149 kr i månaden, och inget av det kostar extra."
- **Förslag:**
  fråga `Vad ingår i Jobbcoach Premium?` (oförändrad)
  svar `Allt vi gör: alla rekryteringstester med övningsprov och det fördjupade personlighetstestet, alla CV-mallar, CV-analysens alla förslag, personliga brev och LinkedIn, jobbmatchning med de 25 bästa träffarna, uppföljningsmejl till dina sökta tjänster, rapporten till Arbetsförmedlingen att skriva ut eller kopiera, intervjuprovet utan dagsgräns och Jobbcoachen. 149 kr i månaden, och inget av det kostar extra.`
- **Skäl:** testerna står först, som ägaren vill överallt där verktyg räknas upp.
- **Hänger ihop med:** GEM-4, PRI-7.

### PRI-9 · `priser-data.ts:222`

- **I dag:** "Jobbcoach Premium kostar 149 kr i månaden. CV-analys, personliga brev, rekryteringstester, jobbmatchning och Jobbcoachen ingår. Säg upp när du vill."
- **Förslag** (metabeskrivning), 152 tecken:
  `Jobbcoach Premium, 149 kr i månaden: rekryteringstester, CV-analys, personliga brev, jobbmatchning, sökta tjänster och Jobbcoachen. Säg upp när du vill.`
- **Skäl:** med "sökta tjänster" tillagt blir dagens meningsbyggnad 164 tecken. Den här ryms inom 158 med alla sex sökord kvar. Kommentaren på rad 217 ("description 148") ändras till 152.
- **Hänger ihop med:** GEM-6.

### PRI-10 · `priser/page.tsx:71-77`

- **I dag:** plattorna "50 påståenden", "2 CV-mallar", "1 CV-analys", "1 brev, sedan ett i veckan", "3 matchade jobb".
- **Förslag:** plattan för CV-analysen: talet `7`, texten `delar i CV-analysen, varje CV`. Ny platta sist: talet `1`, texten `uppföljningsmejl i Sökta tjänster`. Övriga fyra står kvar.
- **Skäl:** "1 CV-analys" är osant, och gränsen på en hämtning av förslagen är inget att visa upp på en platta som säljer gratisnivån. Sju delar är det gratisnivån faktiskt ger. Talet för uppföljningsmejlet läses ur `UPPFOLJNING_GRATIS_UTKAST`.
- **Hänger ihop med:** GEM-1, GEM-3, PRI-1, PRI-7.

### PRI-11 · `priser-data.ts:75-80`

- **I dag:** "Grundnivån", under "alla åtta testtyperna och personlighetstestet", gratis "Ingår, med genomgång".
- **Förslag:** gratis `Ett test om dagen`, under: `med genomgång`. Premium `Ingår, plus träning på din nivå utan tak` (oförändrad).
- **Hänger ihop med:** inget.

---

## 4. /funktioner

Stationerna för CV-analysen, personliga brev, Matchade jobb och Jobbcoachen läser `paket-copy.ts`: se GEM-7 till GEM-12.

### FUN-1 · `src/app/(public)/funktioner/FunktionerSida.tsx:87-88`

- **I dag:** "Vi hämtar annonserna från Arbetsförmedlingen och JobTech tre gånger per dygn, så nya annonser kommer med inom några timmar. Matchningen körs när du öppnar sidan. Gratis ser du dina 3 bästa träffar, i Premium de 25 bästa, med skälen utskrivna."
- **Förslag:**
  fråga `Hur ofta uppdateras jobbmatchningen?` (oförändrad)
  svar `Vi hämtar annonserna från Arbetsförmedlingen och JobTech tre gånger per dygn, så nya annonser kommer med inom några timmar. Du söker om med ett tryck när du vill se de senaste, och mellan sökningarna ligger dina träffar kvar som de var. Gratis ser du dina 3 bästa träffar, i Premium de 25 bästa, med skälen utskrivna.`
- **Hänger ihop med:** GEM-10, STA-4, JM-3, JM-4, ART-3, ART-8, ART-11. Alla i samma push.

### FUN-2 · `FunktionerSida.tsx:96`

- **I dag:** "Skapa konto, så är gratisnivån igång direkt: 2 CV-mallar och en nedladdning, en CV-analys med poäng och det tyngsta fyndet, första personliga brevet och sedan ett var sjunde dag, och i testerna grundnivån i alla åtta testtyperna, ett test om dagen. Vill du ha mer ingår allt i Premium, 149 kr i månaden."
- **Förslag:**
  fråga `Hur kommer jag igång gratis?` (oförändrad)
  svar `Skapa konto, så är gratisnivån igång direkt: i testerna grundnivån i alla åtta testtyperna, ett test om dagen, 2 CV-mallar och en nedladdning, CV-analysens läsbarhetspoäng och genomgång i sju delar för varje CV, första personliga brevet och sedan ett var sjunde dag, tre matchade jobb och Sökta tjänster med det första uppföljningsmejlet. Vill du ha mer ingår allt i Premium, 149 kr i månaden.`
- **Hänger ihop med:** GEM-1, GEM-3.

### FUN-3 · `FunktionerSida.tsx:269-276`

- **I dag:** "Bara i Jobbcoach Premium, 149 kr i månaden" och "Jobbmatchning, Jobbcoachen så mycket du vill och intervjuprovet utan dagsgräns, plus alla rekryteringstester, alla CV-mallar, CV-analysen och personliga brev."
- **Förslag:**
  etikett `Mer i Jobbcoach Premium, 149 kr i månaden`
  H2 `Jobben hittar dig, och du går förberedd in i intervjun.` (oförändrad)
  ingress `Tre träffar, tio meddelanden till Jobbcoachen och ett intervjuprov om dagen är gratis. Premium ger de 25 bästa träffarna, Jobbcoachen så mycket du vill och intervjuprovet utan dagsgräns, plus alla rekryteringstester, alla CV-mallar, CV-analysens alla förslag och personliga brev utan tak.`
- **Skäl:** beslut 8 i `docs/beslut-jobbsoket-2026-11-21.md`: blocket handlar om det som blir mer med Premium.
- **Hänger ihop med:** GEM-10, GEM-11.

### FUN-4 · `FunktionerSida.tsx:366-370`

- **I dag:** "Håll koll på var varje ansökan står: sökt, svar, intervju, erbjudande. Gratis för alla med konto, och ett personligt brev från en träff hamnar där av sig självt."
- **Förslag:**
  `Håll koll på var varje ansökan står: sökt, svar, intervju, erbjudande. Spara annonsen du ska söka under Ska sökas, sätt veckans mål och låt oss skriva utkastet till uppföljningsmejlet när det har varit tyst i tolv dagar. Gratis för alla med konto, med det första uppföljningsmejlet. Fler utkast och rapporten till Arbetsförmedlingen att skriva ut ingår i Premium. Ett personligt brev hamnar här när du trycker Markera som sökt.`
- **Skäl:** första meningen står kvar ordagrant, den bär ankarets sökord.
- **Hänger ihop med:** GEM-12, PRI-7, STA-7.

### FUN-5 · `FunktionerSida.tsx:175`

- **I dag:** "Ingår i Premium. Gratis: första brevet, sedan ett i veckan, att läsa och kopiera. Nedladdning ingår inte."
- **Förslag:** `Ingår i Premium. Gratis: första brevet, sedan ett i veckan, att läsa och kopiera. De två senaste går att ändra. Nedladdning ingår inte.`
- **Hänger ihop med:** GEM-8, PRI-6, BRV-1.

### FUN-6 · `FunktionerSida.tsx:67`

- **I dag:** "Poäng per område och varje fynd med åtgärd."
- **Förslag:** `Läsbarhetspoäng i sju delar, och vad som saknas i varje del.`
- **Hänger ihop med:** GEM-7.

### FUN-7 · `FunktionerSida.tsx:68, :209` · `src/components/registrering/registrering-copy.ts:41`

- **I dag:** "Steg för steg, med exempel för varje del."; "Bygg CV:t steg för steg: Personuppgifter, profil, erfarenhet, utbildning, kompetenser och språk, med exempel för varje del."; "Bygg det steg för steg eller ladda upp ditt gamla och se vad rekryteraren ser."
- **Förslag:**
  `FunktionerSida.tsx:68`: `Skriv direkt på arket, med exempeltext i varje avsnitt.`
  `FunktionerSida.tsx:209`: rubrik `Skriv CV:t direkt på arket`, text `Kontaktuppgifter, personbeskrivning, erfarenhet, utbildning, kompetenser och språk. Tryck på ett avsnitt och fyll i, med exempeltext för varje del.`
  `registrering-copy.ts:41`: `Skriv det direkt på arket eller ladda upp ditt gamla och se vad rekryteraren ser.`
- **Hänger ihop med:** inget.

### FUN-8 · `FunktionerSida.tsx:212`

- **I dag:** "Ladda ner som PDF" med "Utan tak i Premium, en nedladdning på gratisnivån."
- **Förslag:** rubrik `Ladda ner som PDF eller Word`, text `Word finns i 26 av mallarna, gratismallarna inräknade. Utan tak i Premium, en nedladdning på gratisnivån.`
- **Hänger ihop med:** PRI-5, SCV-2.

### FUN-9 · `FunktionerSida.tsx:64`

- **I dag:** "Matrislogik, deduktivt, verbalt, numeriskt, talserier, spatial förmåga och ordförråd i tre nivåer, övningsprov mot klockan och inför I-provet."
- **Förslag:** `Matrislogik, figurserier, deduktivt, verbalt, numeriskt, talserier, spatial förmåga och ordförråd i tre nivåer, övningsprov mot klockan och inför I-provet.`
- **Hänger ihop med:** inget.

### FUN-10 · `FunktionerSida.tsx:53-61, :63-75` · `src/app/(public)/funktioner/page.tsx:17, :25`

- **I dag:** sju ankare utan Sökta tjänster; "Åtta verktyg på en plattform: personliga brev, CV-analys, jobbmatchning, jobbcoach, rekryteringstester, LinkedIn-optimering, CV-skapande och 40 CV-mallar."
- **Förslag:**
  Ankarraden, nytt ankare efter Jobbmatchning: `Sökta tjänster`, till `#sokta-tjanster` (ankaret finns redan).
  `page.tsx:17` (OG-description), 159 tecken:
  `Alla verktyg på en plattform: rekryteringstester, CV-analys, 40 CV-mallar, personliga brev, jobbmatchning, sökta tjänster, Jobbcoachen och LinkedIn-optimering.`
  `page.tsx:25` (twitter-description), 145 tecken:
  `Alla verktyg på en plattform: rekryteringstester, CV-analys, personliga brev, jobbmatchning, sökta tjänster, Jobbcoachen och LinkedIn-optimering.`
- **Skäl:** talet "åtta verktyg" stämmer inte längre och blir fel igen nästa gång något tillkommer, så det utgår. Inför intervjun har ingen egen publik sida och får ingen rad i länklistan: det beskrivs i kortet i GEM-12 om det byggs.
- **Hänger ihop med:** FUN-4, GEM-12, NAV-1.

---

## 5. Startsidan · `src/components/publikt/start/Startsidan.tsx`

FAQ-svaret om gratisnivån: GEM-1 till GEM-3. Premiumlistan: GEM-4.

### STA-1 · `Startsidan.tsx:256`

- **I dag:** "Ladda upp som PDF eller Word. Inom en minut får du poäng 1 till 10 på tydlighet och struktur, innehåll, resultat och nyckelord, och en lista med fynd där varje fynd har en åtgärd. Rätta, kör om, se poängen röra sig."
- **Förslag:** `Ladda upp som PDF eller Word. Vi går igenom CV:t i sju delar, från kontaktuppgifter till datum, ordning och längd, och räknar en läsbarhetspoäng av 100. Du ser var varje tappad poäng sitter och vad som saknas. Jobbcoachen föreslår nya formuleringar, och poängen räknas om när du sparar.`
- **Hänger ihop med:** STA-2, STA-3, GEM-7, TEL-1.

### STA-2 · `Startsidan.tsx:252-253`

- **I dag:** "**Vet exakt varför CV:t inte får svar.** Poäng per område, varje fynd med åtgärd och nyckelorden rekryteringssystemen letar efter."
- **Förslag:** `**Vet exakt varför CV:t inte får svar.** En läsbarhetspoäng av 100 och vad som saknas, del för del, utmärkt direkt på ditt CV.`
- **Hänger ihop med:** STA-1.

### STA-3 · `Startsidan.tsx:258`

- **I dag:** "Poängen och tyngsta fyndet gratis"
- **Förslag:** `Poängen och genomgången gratis, för varje CV`
- **Hänger ihop med:** GEM-1, CVA-5.

### STA-4 · `Startsidan.tsx:274`

- **I dag:** "... Vi utgår från det du kan och visar de 25 bästa träffarna varje gång du öppnar sidan: vilka krav du täcker och vad som saknas. Från en träff skriver du brevet med ett klick."
- **Förslag:** `Den som söker på sin vanliga yrkestitel missar jobben som efterfrågar samma kompetens under ett annat namn. Vi utgår från det du kan och visar de 25 bästa träffarna med skälen utskrivna. Annonserna hämtas tre gånger per dygn, och du söker om med ett tryck när du vill se de senaste. Från en träff skriver du brevet, sparar annonsen till Ska sökas eller markerar den som sökt.`
- **Hänger ihop med:** GEM-10, FUN-1, JM-3, ART-3, ART-8, ART-11, TEL-3.

### STA-5 · `Startsidan.tsx:303`

- **I dag:** "Fråga vad du vill om lön, intervju, uppsägningstid eller hur du svarar på ett avslag. Svaren känner till ditt CV, dina matchningar och hur testerna gått, så att rådet gäller just din ansökan."
- **Förslag:** `Fråga vad du vill om lön, intervju, uppsägningstid eller hur du svarar på ett avslag. Jobbcoachen känner till din målroll, ort och bransch och de dokument du själv delar i samtalet, och föreslår frågor utifrån läget i dina sökta tjänster.`
- **Skäl:** "lön" står kvar som ämne. Jobbcoachen svarar på lönefrågor med källa, och det är ett sökord. Regeln om lön gäller belopp i exempel, och inget belopp står här.
- **Hänger ihop med:** STA-6, GEM-11, JC-1, TEL-5.

### STA-6 · `Startsidan.tsx:86, :302` · `FunktionerSida.tsx:73`

- **I dag:** "Lön, intervjufrågor, avtal och avslag, utifrån svensk arbetsmarknad och ditt CV."; på rad 302 följt av "Inte från en amerikansk mall."
- **Förslag:**
  `Startsidan.tsx:86` och `FunktionerSida.tsx:73`: `Lön, intervjufrågor, avtal och avslag, utifrån svensk arbetsmarknad och med källa till varje svar.`
  `Startsidan.tsx:302`: `Lön, intervjufrågor, avtal och avslag, utifrån svensk arbetsmarknad och med källa till varje svar. Inte från en amerikansk mall.`
- **Skäl:** "och ditt CV" byts mot det som alltid är sant om svaren, källan. Vad Jobbcoachen känner till om användaren står i stycket intill (STA-5), så raden behöver inte bära det.
- **Hänger ihop med:** STA-5, GEM-11, REK-3.

### STA-7 · `Startsidan.tsx:99-105`

- **I dag:** "Håll koll på var varje ansökan står: sökt, svar, intervju, erbjudande. Gratis för alla."
- **Förslag:** `Håll koll på var varje ansökan står, från Ska sökas till erbjudande, med veckans mål och utkast till det första uppföljningsmejlet. Gratis för alla med konto.`
- **Hänger ihop med:** FUN-4, GEM-3, PRI-7.

### STA-8 · `Startsidan.tsx:361`

- **I dag:** "Alla verktyg utan tak. Mindre än en lunch i månaden, säg upp när du vill."
- **Förslag:** `Alla verktyg, alla nivåer, alla mallar. Mindre än en lunch i månaden, säg upp när du vill.`
- **Skäl:** Premium har tak på tre ställen (25 träffar per sökning, 30 utkast per dygn, 30 förslag per dygn i CV-byggaren). "Alla" är sant, "utan tak" är det inte. Skissen har kvar den gamla raden.
- **Hänger ihop med:** GEM-4.

---

## 6. /verktyg/personligt-brev

### BRV-1 · `brev-faq-data.ts:19` · `page.tsx:364` · `layout.tsx:25`

- **I dag:** "Allt du skrivit ligger kvar att läsa och kopiera, även på gratisnivån."; "Allt du skrivit ligger kvar att läsa och kopiera."; "Första personliga brevet gratis att läsa."
- **Förslag:**
  `brev-faq-data.ts:19`:
  fråga `Hur många brev kan jag skapa gratis?` (oförändrad)
  svar `Det första brevet är gratis, sedan skriver du ett nytt i veckan. Allt du skrivit ligger kvar att läsa och kopiera, även på gratisnivån, och de två senaste breven går att ändra. Vill du skriva utan tak och ladda ner breven som PDF och Word ingår det i Premium, 149 kr i månaden.`
  `page.tsx:364` (kortet "Ett brev gratis"): `Sedan skriver du ett nytt i veckan, utan kortuppgift. Allt du skrivit ligger kvar att läsa och kopiera, och de två senaste går att ändra.`
  `layout.tsx:25` (twitter-description), 169 tecken: `40 mallar, fem toner, klart på minuter. Första personliga brevet gratis att läsa, kopiera och ändra. Nedladdning som PDF, och som Word i 26 av mallarna, ingår i Premium.`
- **Hänger ihop med:** GEM-2, GEM-8, FUN-5, PRI-6.

### BRV-2 · `page.tsx:122, :129-158, :247`

- **I dag:** "Fyra steg från tomt papper till färdig ansökan: välj CV, klistra in annons, välj mall och ton, kopiera eller ladda ner." och stegen "Välj ditt CV", "Klistra in jobbannonsen", "Välj mall och ton", "Kopiera eller ladda ner brevet". Ingressen: "Fyra steg från tomt papper till färdig ansökan. Du gör valen, vi sätter ihop brevet."
- **Förslag:** stegen och HowTo-schemat står kvar ordagrant. En mening byts, den synliga ingressen på rad 247:
  `Fyra steg från tomt papper till färdig ansökan. CV, annons, mall och ton väljer du på en och samma skärm, och allt går att ändra efteråt.`
- **Skäl:** inget i stegen är osant, och fyra namngivna steg är värda mer för sökningen än en omskrivning. Det som var missvisande är intrycket av fyra skärmar, och det rättar en mening. "Allt går att ändra efteråt" är vyns egen rad (`src/components/brev3/arbete/texter.ts:35`).
- **Hänger ihop med:** inget.

Svaret "Är det säkert att lämna mitt CV och era brev?" (`brev-faq-data.ts:27`): ägarens, ändras inte.

---

## 7. /verktyg/jobbmatchning

### JM-1 · `src/app/(public)/verktyg/jobbmatchning/page.tsx:67, :101, :112-113, :171, :197, :222, :319`

- **I dag:** "om du inte har ett att aktivera än"; "Fyra steg från aktiverat CV till sorterade jobbmatchningar: aktivera CV, ..."; "Aktivera ditt CV" med "Ladda upp ett CV eller välj ett du redan sparat. Aktivering tar några sekunder."; "Aktivera ditt CV så söker vi bland tusentals lediga jobb från Arbetsförmedlingen."; "Aktivera ditt CV, så ser du dina tre bästa träffar och exakt varför de passar."; "Fyra steg från aktiverat CV ..."; "Aktivera ditt CV och se dina 3 bästa träffar ...".
- **Förslag:**
  `:67` (länklistan): `Färdiga CV:n yrke för yrke, om du inte har ett eget än.`
  `:101` (HowTo, `description`): `Fyra steg från uppladdat CV till sorterade jobbmatchningar: välj eller ladda upp CV, vi extraherar yrkesdata, vi söker tusentals annonser, du får jobben sorterade efter relevans.`
  `:112-113` (HowTo steg 1, också synligt steg): namn `Välj eller ladda upp ditt CV` (SEO:s lydelse), text `Ladda upp ett CV eller använd det du redan har sparat. Ditt senaste CV läses in av sig självt, och du byter under Byt CV.`
  `:171` (hjältens ingress): `Ladda upp ditt CV så söker vi bland tusentals lediga jobb från Arbetsförmedlingen.`
  `:197` (provkortet): `Ladda upp ditt CV, så ser du dina tre bästa träffar och varför de passar. Inget kort, ingen bindning.`
  `:222` (ingressen under Så fungerar det): `Fyra steg från uppladdat CV till en lista sorterad efter hur väl du passar.`
  `:319`: se JM-3.
- **Skäl:** "exakt varför" blir "varför" på rad 197. Skälen är sanna men inte uttömmande.
- **Hänger ihop med:** JM-2, JM-3, ART-10, TEL-4.

### JM-2 · `jobbmatchning-faq-data.ts:19, :43, :47`

- **I dag:** "Aktivera ditt CV i vår jobbmatchningstjänst så söker vi automatiskt bland tusentals lediga tjänster ..."; "Det enda kravet är att du har ett CV att aktivera."; "När CV:t är aktiverat extraheras all data automatiskt och du kan börja söka jobb direkt."
- **Förslag:**
  `:19`: `Ladda upp ditt CV i vår jobbmatchningstjänst och tryck på Hitta jobb som passar, så söker vi bland tusentals lediga tjänster i hela Sverige. Vi läser ut din yrkeserfarenhet, dina kompetenser, din utbildning och din ort och ger dig en matchning i procent per annons. De jobb där du har starkast match hamnar överst i listan.`
  `:43` (sista meningen): `Det enda kravet är att du har ett CV att ladda upp.`
  `:47` (sista meningen): `När CV:t är inläst plockar vi ut all data automatiskt och du kan börja söka jobb direkt.`
- **Hänger ihop med:** JM-1, ART-10.

### JM-3 · `page.tsx:319`

- **I dag:** "Aktivera ditt CV och se dina 3 bästa träffar med skälen utskrivna, utan kortuppgift. De 25 bästa träffarna, varje gång du öppnar sidan, ingår i Premium, utan bindningstid."
- **Förslag:** `Ladda upp ditt CV och se dina 3 bästa träffar med skälen utskrivna, utan kortuppgift. De 25 bästa träffarna ingår i Premium, utan bindningstid. Annonserna hämtas tre gånger per dygn, och du söker om med ett tryck när du vill se de senaste.`
- **Hänger ihop med:** JM-1, GEM-10, FUN-1, STA-4, ART-3, ART-8, ART-11.

### JM-4 · `page.tsx:54, :93, :177` · `jobbmatchning-faq-data.ts:35`

- **I dag:** "Uppdaterat varje dag: Nya jobb syns i din lista inom timmar efter att de publicerats. Tillsatta tjänster försvinner av sig själva."; featureList "daglig uppdatering"; hjältens tal "Dagligen: nya annonser in, tillsatta ut"; FAQ "Annonserna uppdateras dagligen. När en arbetsgivare publicerar en ny tjänst på Arbetsförmedlingen syns den i din lista inom timmar. ..."
- **Förslag:**
  `:54`: rubrik `Uppdaterat varje dag` (oförändrad), text `Annonserna hämtas tre gånger per dygn. Du söker om med ett tryck när du vill se de senaste, och annonser som tagits bort följer inte med i nästa sökning.`
  `:93` (`featureList`): `Tusentals lediga jobb från Arbetsförmedlingen, matchning i procent per annons, distans-filter, nya annonser tre gånger per dygn, sortering på relevans, alla branscher i Sverige`
  `:177` (hjältens tal): `3 gånger` med texten `per dygn hämtas nya annonser`
  `jobbmatchning-faq-data.ts:35`:
  fråga `Hur ofta uppdateras jobbannonserna?` (oförändrad)
  svar `Annonserna hämtas från Arbetsförmedlingen tre gånger per dygn. Du söker om med ett tryck när du vill se de senaste, och mellan sökningarna ligger dina träffar kvar som de var. En annons som har tagits bort hos Arbetsförmedlingen följer inte med i nästa sökning, så du slipper söka jobb som redan är tillsatta.`
- **Skäl:** rubriken på rad 54 är en H3 och står kvar, som SEO kräver: annonserna hämtas varje dag, så den är sann. Det är texten under som var fel.
- **Hänger ihop med:** JM-3, FUN-1. Raden "Nya annonser in tre gånger per dygn, tillsatta ut" på `page.tsx:200` stämmer redan.

### JM-5 · `page.tsx:199`

- **I dag:** "Vilka krav du täcker och vad som saknas, per träff"
- **Förslag:** `Varför rollen passar och vilka av dina kompetenser annonsen frågar efter, per träff`
- **Hänger ihop med:** GEM-10, TEL-3.

### JM-6 · `page.tsx:64-71, :303-305`

- **I dag:** "Jobbmatchningen hänger ihop med resten av kontot: brevet skrivs från träffen, och rekryterare kan hitta dig åt andra hållet."
- **Förslag:**
  `:303-305`: `Jobbmatchningen hänger ihop med resten av kontot. Från en träff skriver du brevet, sparar annonsen till Ska sökas med sista ansökningsdag eller markerar den som sökt, och följer den sedan under Sökta tjänster. Rekryterare kan dessutom hitta dig åt andra hållet.`
  Ny rad i länklistan, efter "Personligt brev från träffen": rubrik `Sökta tjänster`, text `Spara annonsen till Ska sökas, logga den du har sökt och se när det är dags att följa upp.`, länk `/funktioner#sokta-tjanster`.
- **Hänger ihop med:** FUN-4, GEM-12.

---

## 8. /verktyg/jobbcoachen

### JC-1 · `src/app/(public)/verktyg/jobbcoachen/page.tsx:174`

- **I dag:** "10 meddelanden ingår gratis på ditt konto, utan kortuppgift. Jobbcoachen så mycket du vill, med ditt CV i samtalet, ingår i Premium."
- **Förslag:** `10 meddelanden ingår gratis på ditt konto, utan kortuppgift, och du kan dela ditt CV i samtalet från första frågan. Jobbcoachen så mycket du vill ingår i Premium.`
- **Hänger ihop med:** GEM-11, STA-5.

### JC-2 · `page.tsx:52-53, :72-74` · `jobbcoachen-faq-data.ts:45-46`

- **I dag:** featureList slutar "dokumentdelning av CV och brev"; HowTo steg 1 "Skriv en fråga om lön, intervju, arbetsrätt, karriärbyte eller annat som rör jobblivet i Sverige."; FAQ "Kan jag dela mitt CV med Jobbcoachen?".
- **Förslag:**
  `:52-53` (`featureList`): `Karriärrådgivning från svenska källor, klickbara källhänvisningar i varje svar, marknadslön per yrke, arbetsrätt och LAS, intervjuförberedelse, karriärbyte, A-kassa och CSN, dokumentdelning av CV och brev, frågeförslag utifrån dina sökta tjänster`
  `:72-74` (HowTo steg 1, också synligt steg): namn `Ställ frågan` (oförändrat), text `Skriv en fråga om lön, intervju, arbetsrätt, karriärbyte eller annat som rör jobblivet i Sverige. Har du loggat sökta tjänster föreslår Jobbcoachen frågor utifrån ditt läge, till exempel vad du skriver i ett uppföljningsmejl.`
  `jobbcoachen-faq-data.ts:21-22`, en mening till sist i svaret på `Hur fungerar Jobbcoachen?` (SEO:s önskan): `Har du loggat sökta tjänster föreslår Jobbcoachen dessutom frågor utifrån ditt läge.`
  `jobbcoachen-faq-data.ts:45-46`:
  fråga `Kan jag dela mitt CV med Jobbcoachen?` (oförändrad)
  svar `Ja. När du är inloggad kan du bifoga ett sparat CV eller personligt brev till en fråga. Jobbcoachen läser då innehållet och kan ge mer specifika råd, till exempel feedback på en formulering, förslag på vilka roller som passar din erfarenhet eller vad du bör ändra inför en specifik tjänst. Utan bifogat dokument känner Jobbcoachen till din målroll, ort och bransch ur profilen. Har du loggat sökta tjänster får du också förslag på frågor utifrån läget, till exempel inför en bokad intervju.`
- **Hänger ihop med:** GEM-11, TEL-5.

---

## 9. /verktyg/skapa-cv

### SCV-1 · `src/app/(public)/verktyg/skapa-cv/page.tsx:47` · `skapa-cv-faq-data.ts:57`

- **I dag:** "Du fortsätter där du slutade från Mina CV, på vilken enhet som helst."; "fortsätta där du slutade från Mina CV".
- **Förslag:**
  `page.tsx:47`: `CV:t sparas i ditt konto när du sparat första avsnittet, och sedan efter varje avsnitt. Du fortsätter där du slutade under Ditt CV, på vilken enhet som helst.`
  `skapa-cv-faq-data.ts:57`: `CV:t sparas i ditt konto när du har sparat första avsnittet, och därefter efter varje avsnitt du fyller i. Du kan stänga sidan när du vill och fortsätta där du slutade under Ditt CV, på vilken enhet som helst.`
- **Skäl:** bara flikens namn byts. Texten beskriver hur byggaren sparar och faller under ägarens förtydligande 2026-11-17, den säger inget om var data lagras.
- **Hänger ihop med:** inget.

### SCV-2 · `skapa-cv-faq-data.ts:39`

- **I dag:** "Ja. Du bygger ditt CV och laddar ner det som PDF en gång utan att lämna kortuppgifter. ..."
- **Förslag** (första meningen, resten oförändrat): `Ja. Du bygger ditt CV och laddar ner det en gång, som PDF eller som Word, utan att lämna kortuppgifter.`
- **Hänger ihop med:** PRI-5, FUN-8.

Slutblockets "hela CV-analysen": GEM-5.

## 10. Övriga verktygssidor

Inga poster. /verktyg/linkedin-optimering: GEM-5.

---

## 11. Mallar och exempel

### EX-1 · `src/app/(public)/exempel/components/galleri-faq.ts:37` · `ExempelCTABand.tsx:45`

- **I dag:** "Vill du sedan bygga ditt eget CV med våra verktyg registrerar du dig gratis, och då ingår en CV-analys."; "Två CV-mallar, en CV-analys och ett personligt brev var sjunde dag, utan att betala."
- **Förslag:**
  `galleri-faq.ts:37` (sista meningen): `Vill du sedan bygga ditt eget CV med våra verktyg registrerar du dig gratis, och då ingår CV-analysens läsbarhetspoäng för varje CV du sparar.`
  `ExempelCTABand.tsx:45`: `Använd exemplen som inspiration och bygg ditt eget med våra verktyg. Två CV-mallar, CV-analysens läsbarhetspoäng och ett personligt brev var sjunde dag, utan att betala.`
- **Hänger ihop med:** GEM-1.

---

## 12. Informationssidor

### INF-1 · `src/app/(public)/integrationer/page.tsx:9-31`

- **I dag:** LinkedIn "Importera profil och optimera för jobbsökning", "Planerad Q2 2026"; Arbetsförmedlingen "Sök jobb direkt från plattformen", "Under utveckling"; Gmail & Outlook "Skicka personliga brev direkt från din e-post", "Planerad Q3 2026"; ATS-system "Integration med Applicant Tracking Systems", "Enterprise-funktion".
- **Förslag:** två kort går att skriva sant i dag.
  LinkedIn: `Spara din LinkedIn-profil som PDF och ladda upp den, så läser vi ut roller, utbildning och kompetenser till ditt CV.` Etikett: `Finns i dag`
  Arbetsförmedlingen: `Matchade jobb läser annonserna i Platsbanken, som hämtas tre gånger per dygn.` Etikett: `Finns i dag`
  Rubriken över korten, i dag "Integrationer under utveckling": `Det här hänger ihop redan i dag`
  Texten under den: `Du behöver inte koppla ihop något själv. Annonserna kommer från Platsbanken, och din LinkedIn-profil läser vi in som PDF.`
- **Skäl:** korten för Gmail & Outlook och ATS-system kan jag inte skriva sant utan att veta om något av det ska byggas. Se beslut 5.
- **Hänger ihop med:** inget.

### INF-2 · `src/app/(public)/om-oss/OmOssSida.tsx:52`

- **I dag:** "Vi lanserar verktyg löpande, alla med svenska källor och svensk arbetsmarknad som utgångspunkt: jobbmatchning, rekryteringstester, LinkedIn-profilen och Jobbcoachen."
- **Förslag:** `Vi lanserar verktyg löpande, alla med svenska källor och svensk arbetsmarknad som utgångspunkt: rekryteringstester, CV-analys, jobbmatchning, sökta tjänster, LinkedIn-profilen och Jobbcoachen.`
- **Hänger ihop med:** TEL-2 (samma sida visar SkarmBana).

### INF-3 · `src/app/(public)/hjalpcenter/page.tsx:15, :19-38`

- **I dag:** "Hjälp med Jobbcoach.ai: kom igång med kontot, skapa och redigera personliga brev, hantera betalning och prenumeration. Hittar du inte svaret, kontakta oss."; korten Komma igång, Personliga brev, Konto & Fakturering.
- **Förslag:**
  `:15` (metabeskrivning), 149 tecken: `Hjälp med Jobbcoach.ai: kontot, rekryteringstester, CV, personliga brev, Jobbsöket, betalning och prenumeration. Hittar du inte svaret, kontakta oss.`
  De tre korten som finns står kvar ordagrant, med rubriker och ämnen som i dag. Tre nya kort läggs till (rubrik, rad, tre ämnen, länk):
  `Rekryteringstester` · `Grundnivån, nivåerna och övningsprovet` · `Åtta testtyper`, `Personlighetstestet`, `Övningsprov mot klockan` · `/verktyg/rekryteringstester`
  `CV` · `Skriv, analysera och ladda ner` · `Skapa CV`, `CV-analys`, `Mallar och format` · `/verktyg/skapa-cv`
  `Jobbsöket` · `Matchade jobb, sökta tjänster och intervjun` · `Jobbmatchning`, `Sökta tjänster`, `Jobbcoachen` · `/verktyg/jobbmatchning`
  Ordningen blir Komma igång, Rekryteringstester, CV, Personliga brev, Jobbsöket, Konto & Fakturering.
- **Skäl:** sidan har 55 ord och grinden tål knappt att ett enda försvinner, så inget befintligt kort eller ämne rörs. Det som saknades läggs till.
- **Hänger ihop med:** NAV-1.

---

## 13. Menyn och sidfoten

### NAV-1 · `src/components/landing/nav-data.ts:47-74`

- **I dag:** grupperna "Skriv och förbättra" (Personligt brev, CV-analys, Skapa CV, CV-mallar, LinkedIn-profilen), "Hitta jobb" (Jobbmatchning, Bli upptäckt, Jobbkartan) och "Träna" (Rekryteringstester, Jobbcoachen, Räkna ut lön och skatt).
- **Förslag:** fyra grupper med produktens egna namn, testerna först. Länktexterna är desamma som i dag, så inga ankartexter ändras.
  `Rekryteringstester`: Rekryteringstester, Personlighetstest
  `CV`: CV-analys, Skapa CV, CV-mallar, LinkedIn-profilen
  `Personliga brev`: Personligt brev, Personligt brev-exempel
  `Jobbsöket`: Jobbmatchning, Sökta tjänster (till `/funktioner#sokta-tjanster` tills den egna sidan finns), Jobbcoachen, Bli upptäckt
  Utanför grupperna, som i skissens meny: Jobbkartan, Räkna ut lön och skatt, För rekryterare.
  Raden under varje länk i megamenyn, ur skissen (`delar/mega.html`): `Åtta testtyper i tre nivåer`, `Det rekryteraren läser ut av dig`, `Läsbarhetspoäng i sju delar`, `Skriv direkt på arket`, `40 mallar, två gratis`, `Syns i rekryterarnas sök`, `Skrivet på annonsens krav`, `89 yrken att utgå från`, `Annonser som passar ditt CV`, `Uppföljning och rapport`, `Svar med källor`, `Låt rekryterare hitta dig`.
- **Skäl:** grupperna följer skissens meny och de fyra rummen. Namnet i menyn är "Jobbmatchning", inte "Matchade jobb": det är sidans sökord och sidans H1, och fliken inloggat får heta något annat. Se beslut 12.
- **Hänger ihop med:** FUN-10, INF-3, GEM-6 (megamenyns Premiumrad läser `beskrivning`).

---

## 14. Registrering och inloggning

### REG-1 · `src/components/registrering/registrering-copy.ts:354`

- **I dag:** "CV-analysen: Poängen och det tyngsta fyndet i ditt CV."
- **Förslag:** namn `CV-analysen`, text `Läsbarhetspoängen och vad som saknas, del för del, för varje CV.`
- **Hänger ihop med:** GEM-1, CVA-5, CVA-11.

### REG-2 · `registrering-copy.ts:194-198, :218`

- **I dag:** "**Hela CV-analysen.** Varje fynd med åtgärd, kör om utan tak."; "**Personliga brev** på annonsen, som PDF."; "Börja gratis direkt, eller ta med hela analysen och alla mallar från start."
- **Förslag:**
  `:195`: fet `CV-analysens alla förslag.`, text ` Jobbcoachen skriver om, så ofta du vill.`
  `:197`: fet `Personliga brev`, text ` på annonsen, som PDF eller Word.`
  `:218`: `Börja gratis direkt, eller ta med Jobbcoachens förslag och alla mallar från start.`
- **Skäl:** rad 197 står inte i kartläggningen men säger samma sak som REK-2 och rättas därför här.
- **Hänger ihop med:** GEM-5, CVA-6, REK-2.

### REG-3 · `registrering-copy.ts:54-57, :256-270`

- **I dag:** "Hitta jobb att söka: Vi matchar ditt CV mot lediga jobb i Platsbanken och skriver varför de passar."; under "Matchningen läser ditt CV, så första steget är att lägga in det. Tre träffar ingår gratis."; gratis "Tre matchade jobb", "Tio meddelanden till Jobbcoachen".
- **Förslag:**
  `:57`: `Vi matchar ditt CV mot lediga jobb i Platsbanken, skriver varför de passar och håller koll på dem du har sökt.`
  `:258`: `Matchningen läser ditt CV, så första steget är att lägga in det. Tre träffar ingår gratis, och Sökta tjänster håller koll på svaren.`
  `:260-266` (Premiumraderna), ny andra rad: fet `Uppföljningsmejl`, text ` till dina sökta tjänster, och rapporten till Arbetsförmedlingen att skriva ut.` Raden om intervjuprovet flyttas ned och slås ihop med sista raden: fet `Intervjuprovet och Jobbcoachen`, text ` utan tak, alla CV-mallar, CV-analysens alla förslag, personliga brev och alla rekryteringstester.`
  `:269` (gratislistan): `Tre matchade jobb`, `Sökta tjänster med Ska sökas och veckans mål`, `Det första uppföljningsmejlet`, `Tio meddelanden till Jobbcoachen`
- **Skäl:** kortet har tre Premiumrader i dag. Jag håller det vid tre så att formen inte behöver ändras.
- **Hänger ihop med:** GEM-3, GEM-4.

### REG-4 · `registrering-copy.ts:51-53, :244-255`

- **I dag:** "Förbereda intervjun: Svara på en vanlig intervjufråga och få återkoppling som från en rekryterare."; under "Ett intervjuprov om dagen ingår gratis. Att öva utan tak ingår i Premium."
- **Förslag:**
  `:53`: `Svara på en vanlig intervjufråga och få återkoppling som från en rekryterare. Har du en intervju bokad lägger du in tiden, så säger vi till när det är dags att förbereda dig.`
  `:246`: `Ett intervjuprov om dagen ingår gratis, och har du en intervju bokad står den under Intervjuer på gång. Att öva utan tak ingår i Premium.`
  `:254` (gratislistan): `Ett intervjuprov om dagen med återkoppling`, `Intervjuer på gång, med tid och plats`, `Personlighetstestet med 50 påståenden`
- **Hänger ihop med:** GEM-12.

### REG-5 · `registrering-copy.ts:285, :338, :464` · `src/components/publikt/prov/prov-copy.ts:88, :95, :104, :142, :253`

- **I dag:** "sedan gör du Nivåkollen: ett kort test på cirka 8 minuter som visar din nivå"; "**Nivåkollen**, 5 minuter: visar var du står och räknar in de här svaren"; "Nivåkollen mäter var du står, och kontot visar ..."; "Nivåkollen mäter var du står mot provens nivå."; "Du kan också göra Nivåkollen i alla åtta testtyper."
- **Förslag:** ingen ändring nu. Om beslutet blir att ordet ska bort också här står lydelserna färdiga:
  `registrering-copy.ts:285`: `Du väljer test och provdatum, sedan mäter vi din nivå: ett kort test på cirka 8 minuter, med genomgång av varje fråga.`
  `registrering-copy.ts:338`: fet `Din nivå`, text `, 5 minuter: ett kort test som visar var du står och räknar in de här svaren`
  `registrering-copy.ts:464`: fet `Din nivå`, text `, cirka N minuter: ett kort test som visar var du står och räknar in de här svaren`
  `prov-copy.ts:104`: `Ett kort test mäter var du står, och kontot visar förklaringen bakom alla fem.`
  `prov-copy.ts:142`: titel `Din nivå på skalan 1 till 10` (oförändrad), text `Ett kort test mäter var du står mot provens nivå.`
  `prov-copy.ts:253`: `Skapa ett gratiskonto så låser vi upp facit för de här fem och sparar resultatet. Du kan också mäta din nivå i alla åtta testtyper.`
  `prov-copy.ts:88` och `:95` ("Mät din nivå på skalan 1 till 10") nämner inte Nivåkollen och står kvar.
- **Skäl:** raderna är inte reklam för en besökare som inte vet vad produkten är. De syns när besökaren just har gjort ett prov och säger vad som händer härnäst, med namnet på det som sedan står på skärmen. Tar vi bort namnet möter hon ett ord inloggat som ingen har sagt till henne. Raderna kom till i skissen för de publika proven, som gick live i går. Se beslut 6.
- **Hänger ihop med:** TEL-2 (där står Nivåkollen i ren reklam och ska bort).

---
## 15. Artiklarnas reklam · `src/components/artiklar/reklam/reklam-copy.ts`

Gratiskortet läser `GRATIS_LISTA` (GEM-1 till GEM-3), listslutkortet läser `HELA_PAKETET_RADER` (GEM-4) och sidokorten läser `beskrivning` (GEM-6). Raderna 77 och 223: GEM-5.

### REK-1 · `reklam-copy.ts:81, :84`

- **I dag:** "Ladda upp CV:t, så läser vi det som en rekryterare gör i första urvalet. Poängen och det tyngsta fyndet är gratis."; "Hela analysen med varje fynd och åtgärd ingår i Premium, 149 kr i månaden."
- **Förslag:**
  `:81`: `Ladda upp CV:t, så läser vi det som en rekryterare gör i första urvalet. Läsbarhetspoängen och genomgången i sju delar är gratis, för varje CV.`
  `:84`: `Alla förslag från Jobbcoachen, och nya efter varje ändring, ingår i Premium, 149 kr i månaden.`
- **Hänger ihop med:** GEM-1, GEM-5, CVA-5.

### REK-2 · `reklam-copy.ts:88, :91, :225`

- **I dag:** "Klistra in annonsen, välj ton, vi skriver utkastet utifrån ditt CV. Ett personligt brev var sjunde dag att läsa på skärmen, gratis."; "Personliga brev utan tak, som PDF, ingår i Premium, 149 kr i månaden."; "Personliga brev utan tak, som PDF".
- **Förslag:**
  `:88`: `Klistra in annonsen, välj ton, vi skriver utkastet utifrån ditt CV. Ett personligt brev var sjunde dag är gratis, och de två senaste går att ändra.`
  `:91`: `Personliga brev utan tak, som PDF eller Word, ingår i Premium, 149 kr i månaden.`
  `:225`: `Personliga brev utan tak, som PDF eller Word`
- **Hänger ihop med:** GEM-2, GEM-9, REG-2.

### REK-3 · `reklam-copy.ts:135`

- **I dag:** "Uppsägningstid och lön efter skatt räknar du ut gratis här. Löneförhandlingen förbereder du med Jobbcoachen, som utgår från ditt CV."
- **Förslag:** `Uppsägningstid och lön efter skatt räknar du ut gratis här. Löneförhandlingen förbereder du med Jobbcoachen, som svarar med källa och läser ditt CV när du delar det i samtalet.`
- **Hänger ihop med:** STA-6, GEM-11.

### REK-4 · `reklam-copy.ts:236-243` (och `CV_RAD` på `:199`)

- **I dag:** "Jobbmatchning, de bästa träffarna med skälen utskrivna", "Jobbcoachen, så mycket du vill", "Intervjuprov utan dagsgräns och historik", "Alla CV-mallar, CV-analysen, personliga brev och LinkedIn", "Alla rekryteringstester, övningsprov och personlighetstestet".
- **Förslag** (sex rader):
  `Jobbmatchning, de bästa träffarna med skälen utskrivna` (oförändrad)
  `Uppföljningsmejl till dina sökta tjänster och rapporten till Arbetsförmedlingen`
  `Jobbcoachen, så mycket du vill` (oförändrad)
  `Intervjuprov utan dagsgräns och historik` (oförändrad)
  `Alla CV-mallar, CV-analysens alla förslag, personliga brev och LinkedIn`
  `Alla rekryteringstester, övningsprov och personlighetstestet` (oförändrad)
- **Hänger ihop med:** GEM-4.

---

## 16. Artiklar · `content/artiklar/*.mdx`

Två regler för bygget. Ett svar som står i frontmatterns `faq:` står också i en synlig `<FAQItem>`, och de två ska ändras till samma lydelse. Tabeller är JSX, så för tabellen i ART-1 står bara cellernas innehåll här.

### ART-1 · `jobbcoach-online.mdx:13, :48, :153, :184, :193, :289-333, :351-357, :568, :840, :957` (och raderna 190, 830 och 975, som säger samma sak)

- **I dag:** "ger förslag inom sex kategorier, med en åtgärd för varje fynd"; "Ger en poäng från 0 till 100 för hur väl struktur och nyckelord i CV:t fungerar i ett rekryteringssystem"; "De sex kategorier vi ger förslag inom:" med tabellen; "Kritiskt problem: Nyckelord"; "Poäng och fynd med åtgärd inom sex kategorier"; "Med Premium ser du alla fynd i alla sex kategorier".
- **Förslag:**

  `:13` (frontmatter, meningarna tre och fyra) och `:957` (samma stycke i det synliga svaret). De två första meningarna och den sista står kvar:
  `Vår CV-analys går igenom ditt CV i sju delar, från kontaktuppgifter till datum, ordning och längd, och räknar en läsbarhetspoäng av 100. Den är bra på att hitta roller som saknar resultat i siffror, en personbeskrivning som inte säger vilken roll du har och punkter som beskriver ansvar i stället för vad du gjorde.`

  `:960-963` (punktlistan "Vad analysen är bra på"):
  `- Hitta roller som saknar ett resultat i siffror`
  `- Hitta en personbeskrivning som kunde stå i vilket CV som helst`
  `- Peka ut punkter som beskriver ansvar i stället för vad du gjorde`
  `- Föreslå en omskrivning du kan utgå från` (oförändrad)

  `:975`: `1. **Rekryteringssystem**: Varje analys går igenom rubriker, datum och ordning efter samma kriterier.`

  `:48`: `- **Läsbarhet för rekryteringssystem (ATS)**: Poängen från 0 till 100 visar hur lätt CV:t är att läsa, för rekryteraren och för systemen som sorterar ansökningar`

  `:153`: `En mänsklig coach har sin erfarenhet och sin smak, och det är ofta en styrka. Men två coacher kan ge dig olika råd om samma CV. Vår CV-analys räknar varje CV på samma sätt: sju delar, hundra poäng, och varje poäng går att peka på i texten.`

  `:184`: `Går igenom ditt CV i sju delar, räknar en läsbarhetspoäng av 100 och visar vad som saknas i varje del. Jobbcoachen skriver förslag på nya formuleringar.`

  `:190-194`:
  `3. Vänta på poängen, det tar under en minut`
  `4. Få ditt resultat:`
  `   - En läsbarhetspoäng från 0 till 100`
  `   - Genomgången i sju delar: Kontaktuppgifter, Personbeskrivning, Erfarenhet, Kompetenser, Utbildning, Språk samt Datum, ordning och längd`
  `   - Jobbcoachens förslag med din nuvarande text, en föreslagen omskrivning och hur många poäng den ger`

  `:289`: `**De sju delar vi går igenom:**`

  `:291-333` (tabellen, kolumnerna Del, Vad vi kollar, Vanliga problem):

  | Del | Vad vi kollar | Vanliga problem |
  |---|---|---|
  | Kontaktuppgifter | Namn, e-postadress, telefonnummer och ort | Orten eller telefonnumret saknas |
  | Personbeskrivning | Längden, att rollen står med och något man kan räkna | En text som kunde stå i vilket CV som helst |
  | Erfarenhet | Titel, arbetsgivare och period, punkterna i varje roll och en siffra per roll | Ansvar beskrivs, inte vad det ledde till |
  | Kompetenser | Ett eget avsnitt med lagom många korta, sökbara termer | Hela meningar i stället för termer |
  | Utbildning | Namn, skola och år eller period | Året saknas |
  | Språk | Att språken står med, och på vilken nivå | Språket står utan nivå |
  | Datum, ordning och längd | Läsbara perioder, samma datumformat, senaste rollen först och lagom längd | Olika datumformat, äldsta rollen först |

  `:340-357` (exempelrutan, som redan är märkt "påhittat exempel"):
  talen: `43/100` med etiketten `Läsbarhetspoäng`, och `57` med etiketten `Poäng kvar till 100`
  ruta 1, rubrik `Erfarenhet, 12 av 35`, text `Tre av fyra roller beskriver ansvar, inte vad det ledde till, och ingen roll har en siffra. Lägg till ett resultat per roll: antal, budget eller procent.`
  ruta 2, rubrik `Personbeskrivning, 5 av 15`, text `Texten räknar upp egenskaper som "driven" och "flexibel" men säger inte vilken roll du har eller vad du har åstadkommit. Börja med yrkesrollen och ett konkret resultat.`

  `:568` (tabellcell): `Läsbarhetspoäng och vad som saknas, i sju delar`

  `:840`: `Får du **under 70 poäng** finns det tydliga saker att rätta innan du skickar fler ansökningar. Börja i den del där du tappar flest poäng. Genomgången visar alla sju delar gratis, och poängen räknas om när du sparar. Med Premium skriver Jobbcoachen förslagen åt dig.`

- **Skäl:** första meningen i FAQ-svaret ("struktur, formatering, nyckelord och tydliga resultat") handlar om vad AI i allmänhet är bra på och står kvar med sökordet. Det är bara meningarna om vår analys som byts.
- **Hänger ihop med:** CVA-1, ART-2, ART-6.

### ART-2 · `jobbcoach-online.mdx:89, :214, :362, :398, :410, :523, :832-836, :842, :888, :914, :948`

- **I dag:** "en CV-analys som visar poängen och det tyngsta fyndet"; "En analys per konto är gratis. ..."; "149 kr i månaden för alla fynd och nya analyser"; "Gratis: din poäng och det tyngsta fyndet."
- **Förslag:**
  `:89` (också ART-4): `Jobbcoach.ai har en gratisnivå och en betald nivå. Gratis får du bland annat CV-analysens läsbarhetspoäng och genomgång i sju delar för varje CV, personliga brev (det första och sedan ett var sjunde dag, där de två senaste går att ändra) och tio frågor till Jobbcoachen. Jobbcoach Premium kostar 149 kr i månaden, utan bindningstid, och då är allt öppet.`
  `:214`: `Läsbarhetspoängen och genomgången i sju delar är gratis för varje CV. Jobbcoachens förslag hämtar du en gång gratis, med det tyngsta förslaget öppet. Alla förslag, och nya förslag efter att du rättat, ingår i Premium (149 kr i månaden). Vill du prova innan du skapar konto finns en minianalys på samma sida som ger en poäng och det viktigaste du bör ändra.`
  `:362`: `När du har gjort ändringarna och sparat räknas poängen om, och du ser vilka delar som har poäng kvar. Det kostar ingenting. Nya förslag från Jobbcoachen ingår i Premium.`
  `:398`: `Inom en minut ser hon sin poäng och delen där hon tappar mest, Erfarenhet:`
  `:410`: `Vill hon att Jobbcoachen skriver förslagen åt henne, till exempel en skarpare personbeskrivning och punkter med resultat, och ger nya förslag efter rättningen, tar hon Premium för en månad`
  `:523`: `**Kostnad:** 0 kr för poängen och genomgången, 149 kr i månaden för alla förslag från Jobbcoachen`
  `:832-836`:
  `3. Vänta på poängen, det tar under en minut`
  `4. Läs igenom ditt resultat:`
  `   - Läsbarhetspoängen (0-100)`
  `   - Hur många poäng som återstår till 100`
  `   - Vad som saknas i varje del`
  `:842`: `**Kostnad:** Gratis för varje CV. Utan konto kan du prova minianalysen.`
  `:888`: `- Jag vill att Jobbcoachen skriver förslagen till mitt CV, och nya efter varje ändring`
  `:914`: `Gratis: din läsbarhetspoäng och vad som saknas, del för del.`
  `:948`: `Får du under 70/100 på CV-analysen, rätta delen där du tappar mest innan du skickar fler ansökningar. Annars riskerar du att samma problem följer med i varje ansökan.`
- **Hänger ihop med:** GEM-1, CVA-5, CVA-6, ART-1.

### ART-3 · `jobbcoach-online.mdx:370`

- **I dag:** "Annonserna hämtas flera gånger per dygn, och matchningen görs när du öppnar sidan. Varje träff har skälen utskrivna: vilka roller och krav du täcker."
- **Förslag:** `Annonserna hämtas tre gånger per dygn, och du söker om med ett tryck när du vill se de senaste. Varje träff har skälen utskrivna: vilka roller och krav du täcker.`
- **Hänger ihop med:** FUN-1, GEM-10, STA-4, JM-3, ART-8, ART-11.

### ART-4 · `jobbcoach-online.mdx:89, :259`

- **I dag:** "personliga brev att läsa (det första och sedan ett var sjunde dag)"; "Ett brev är gratis, sedan ett var sjunde dag, att läsa men inte ladda ner."
- **Förslag:**
  `:89`: se ART-2.
  `:259`: `Ett brev är gratis, sedan ett var sjunde dag. Du läser och kopierar dem och kan ändra de två senaste, men inte ladda ner. Fler brev, de 38 mallarna utöver Linne och Björk och nedladdningen ingår i Premium.`
- **Hänger ihop med:** GEM-2.

### ART-5 · `jobbcoach-online.mdx:21, :1021`

- **I dag:** "CV-analysen läser både svenska och engelska CV, och personliga brev kan skrivas på svenska eller engelska."; "- CV-analysen läser både svenska och engelska CV"
- **Förslag:**
  `:21` (meningen i frontmatter): `CV-analysen läser både svenska och engelska CV, men en inskannad PDF läser vi bara av på svenska, och personliga brev kan skrivas på svenska eller engelska.`
  `:1021`: `- CV-analysen läser både svenska och engelska CV. En inskannad PDF läser vi bara av på svenska`
- **Hänger ihop med:** CVA-8, CVA-10.

### ART-6 · `jobbcoach-online.mdx:44-52, :886-900`

- **I dag:** listan "En modern online jobbcoach hjälper dig med" (sju punkter, bland dem "CV-analys: ... ger en samlad poäng och fynd med konkreta åtgärder" och "Nyckelord: Visar vilka branschtermer som saknas i ditt CV"); "Vad Premium ger" med "Alla CV-mallar, hela CV-analysen, personliga brev och LinkedIn".
- **Förslag:**
  `:46`: `- **CV-analys**: Går igenom ditt CV i sju delar och ger en läsbarhetspoäng av 100, med vad som saknas i varje del`
  `:48`: se ART-1.
  `:51` (punkten om nyckelord byts mot en om Sökta tjänster, så att listan fortfarande har sju punkter): `- **Sökta tjänster**: Håller koll på var varje ansökan står och skriver utkastet till uppföljningsmejlet när det har varit tyst i tolv dagar`
  `:896-899` ("Vad Premium ger", fem punkter):
  `- Alla rekryteringstester, övningsprov och det fördjupade personlighetstestet` (oförändrad)
  `- Alla CV-mallar, CV-analysens alla förslag, personliga brev och LinkedIn`
  `- Jobbmatchningen med dina 25 bästa träffar och skälen` (oförändrad)
  `- Uppföljningsmejl till dina sökta tjänster och rapporten till Arbetsförmedlingen, att skriva ut eller kopiera`
  `- Jobbcoachen, fråga så mycket du vill` (oförändrad)
- **Hänger ihop med:** GEM-4, ART-1.

### ART-7 · `vad-ar-en-jobbcoach.mdx:13, :21, :23, :203, :557, :579, :587, :819, :869, :886, :893`

- **I dag:** "Den visar din poäng och det tyngsta fyndet"; "Gratis får du en poäng från 0 till 100 och det tyngsta fyndet."; "en CV-analys med poäng och det tyngsta fyndet"; "Med Premium ser du hela analysen, med förbättringsförslag för struktur, språk, nyckelord, mätbara resultat och profiltext."; "Första analysen är gratis ..."; "hela CV-analysen".
- **Förslag:**
  `:13` (sista två meningarna) och `:819`: `Testa gärna vår gratis CV-analys först. Den visar din läsbarhetspoäng och vad som saknas, del för del, så att du vet var du ska börja.` (på rad 819 med länken som i dag)
  `:21` (första två meningarna) och `:869`: `Enklaste sättet är att ladda upp det i vår CV-analys. Gratis får du en läsbarhetspoäng från 0 till 100 och ser vad som saknas i var och en av sju delar.` (på rad 869 med länken och kolonet som i dag)
  `:23` (frontmatter, hela svaret, också ART-9): `Mycket går att göra gratis: ett grundnivåtest om dagen i rekryteringstesterna med genomgång, grundversionen av personlighetstestet, två CV-mallar och en nedladdning, CV-analysens läsbarhetspoäng och genomgång i sju delar för varje CV, ett personligt brev och sedan ett var sjunde dag (de två senaste går att ändra, nedladdning ingår inte), tre matchade jobb, tio frågor till Jobbcoachen och Sökta tjänster med det första uppföljningsmejlet. Vill du ha allt finns Jobbcoach Premium för 149 kr i månaden, utan bindningstid. Där ingår alla rekryteringstester, övningsprov och det fördjupade personlighetstestet, alla CV-mallar, CV-analysens alla förslag, personliga brev att ladda ner, LinkedIn-verktyget, jobbmatchning med dina 25 bästa träffar, uppföljningsmejl till dina sökta tjänster och Jobbcoachen så mycket du vill. Som jämförelse kostar Unionens karriärcoachning 1 350 kr i timmen för medlemmar.`
  `:203`: `Ladda upp ditt CV i vår [gratis CV-analys](/verktyg/cv-analys) och få en läsbarhetspoäng från 0 till 100 och en genomgång i sju delar. Med Premium skriver Jobbcoachen förslagen: en skarpare personbeskrivning, roller med mätbara resultat och kompetenser du kan lägga till.`
  `:557`: `Ladda upp ditt CV i vår CV-analys så går vi igenom mycket av CV-listan åt dig: kontaktuppgifter, personbeskrivning, erfarenhet med mätbara resultat, kompetenser, utbildning, språk och datum, med vad som saknas i varje del.` (länken som i dag)
  `:579`: `4. Få din läsbarhetspoäng och se vad som saknas i sju delar, från kontaktuppgifter till datum, ordning och längd. Jobbcoachens förslag visar före och efter`
  `:587`: `Poängen och genomgången är gratis för varje CV och räknas om när du har skrivit om och sparat. Jobbcoachens förslag hämtar du en gång gratis. Alla förslag, och nya efter varje ändring, ingår i Jobbcoach Premium för 149 kr i månaden.`
  `:886`: `- CV-analysens läsbarhetspoäng och genomgång i sju delar, för varje CV`
  `:893`: `- Alla CV-mallar, CV-analysens alla förslag, personliga brev att ladda ner och LinkedIn-verktyget`
- **Skäl:** uppgiften om Unionens timpris står kvar som den är. Den är artikelns egen och inte en post.
- **Hänger ihop med:** GEM-1, GEM-5, ART-9.

### ART-8 · `vad-ar-en-jobbcoach.mdx:643`

- **I dag:** "Vi hämtar nya annonser flera gånger om dygnet, och när du öppnar sidan matchar vi din profil mot dem och visar varför varje träff passar dig."
- **Förslag:** `Vi hämtar nya annonser tre gånger om dygnet. Du söker om med ett tryck när du vill se de senaste, och vi matchar din profil mot dem och visar varför varje träff passar dig.`
- **Hänger ihop med:** FUN-1, GEM-10, STA-4, JM-3, ART-3, ART-11.

### ART-9 · `vad-ar-en-jobbcoach.mdx:23, :641-655, :881-897`

- **I dag:** "ett personligt brev och sedan ett var sjunde dag (att läsa, inte ladda ner), tre matchade jobb och tio frågor till Jobbcoachen"; steg 3 "Läs dina träffar med skälen till varje matchning, och skriv ett personligt brev direkt från en träff"; "I Inför intervjun övar du på frågorna du kommer att få och ser vad en rekryterare läser ut av din profil."
- **Förslag:**
  `:23`: se ART-7.
  `:649`: `3. Läs dina träffar med skälen till varje matchning. Från en träff skriver du ett personligt brev, sparar annonsen till Ska sökas eller markerar den som sökt`
  Nytt stycke efter `:651`, under samma rubrik: `När ansökan är skickad håller Sökta tjänster koll på resten: veckans mål, vem som har svarat och när det är dags att höra av sig. Efter tolv tysta dagar föreslår vi ett uppföljningsmejl och skriver utkastet. Det första är gratis.`
  `:655` (sista meningen): `I Inför intervjun övar du på frågorna du kommer att få, ser dina intervjuer på gång och vad en rekryterare läser ut av din profil.`
  `:887-889` (gratislistan):
  `- Ett personligt brev och sedan ett var sjunde dag (de två senaste går att ändra, nedladdning ingår inte)`
  `- Tre matchade jobb` (oförändrad)
  `- Tio frågor till Jobbcoachen` (oförändrad)
  `- Sökta tjänster med det första uppföljningsmejlet`
  Ny rad i Premiumlistan, efter raden om jobbmatchning: `- Uppföljningsmejl till dina sökta tjänster och rapporten till Arbetsförmedlingen`
- **Skäl:** stycket läggs under "Verktyg 5: Jobbmatchning" i stället för som ett eget verktyg, så att rubrikerna och numreringen står kvar.
- **Hänger ihop med:** GEM-3, GEM-4, ART-7.

### ART-10 · `ai-jobbmatchning.mdx:15, :51, :69, :97, :107`

- **I dag:** "du aktiverar ditt CV, systemet extraherar yrkesdata"; "**1. Du aktiverar ditt CV.**"; "Matchningen utgår från dokumentet du aktiverat."; "aktivera ditt CV i jobbmatchningen".
- **Förslag:**
  `:15` och `:107` (första meningen, resten oförändrat): `I vårt verktyg sker det i fyra steg: du laddar upp ditt CV, systemet extraherar yrkesdata ur det, kompetenser, roller, erfarenhet och nivå, sedan söks tusentals aktuella annonser igenom, och till sist får du träffarna sorterade efter hur väl de matchar din profil.`
  `:51`: `**1. Du laddar upp ditt CV.** Dokumentet är råmaterialet, ingen separat profil att fylla i.`
  `:69`: `**Håll CV:t färskt.** Matchningen utgår från det CV du har valt, och från början är det ditt senaste. Ny roll, ny kompetens eller nytt certifikat som inte står där finns inte, ur motorns perspektiv.`
  `:97` (länktexten): `[ladda upp ditt CV i jobbmatchningen](/verktyg/jobbmatchning)`
- **Hänger ihop med:** JM-1, JM-2.

### ART-11 · `ai-jobbmatchning.mdx:57`

- **I dag:** "Hos oss hämtas nya annonser flera gånger per dygn, och matchningen görs när du öppnar sidan."
- **Förslag:** `Hos oss hämtas nya annonser tre gånger per dygn, och du söker om med ett tryck när du vill se de senaste.`
- **Hänger ihop med:** FUN-1, GEM-10, STA-4, JM-3, ART-3, ART-8.

### ART-12 · `ai-jobbmatchning.mdx:89`

- **I dag:** "**2. Gå igenom de nya träffarna och triagera.** Sortera träffarna i tre högar: söker nu, bevakar, nej tack. Var kräsen med första högen, tre genomarbetade ansökningar slår tio hastiga."
- **Förslag:** `**2. Gå igenom de nya träffarna och triagera.** Sortera träffarna i tre högar: söker nu, bevakar, nej tack. Hos oss gör du det direkt på träffen: Spara till Ska sökas för dem du bevakar, Markera som sökt när ansökan är skickad. Var kräsen med första högen, tre genomarbetade ansökningar slår tio hastiga.`
- **Hänger ihop med:** GEM-10, JM-6.

### ART-13 · `din-digitala-jobbcoach.mdx:159, :161, :173, :175`

- **I dag:** "alla CV-mallar, hela CV-analysen, nedladdning av breven, alla träffar i jobbmatchningen och alla rekryteringstester"; "en CV-analys med poäng och det tyngsta fyndet, ett personligt brev att läsa och sedan ett var sjunde dag".
- **Förslag:**
  `:159`, ny mening efter "följer med som sammanhang.": `Har du loggat sökta tjänster föreslår Jobbcoachen dessutom frågor utifrån läget, till exempel vad du skriver i ett uppföljningsmejl.`
  `:161` (andra meningen): `[CV-analysen](/verktyg/cv-analys) läser ditt CV, ger en läsbarhetspoäng från 0 till 100 och visar vad som saknas i sju delar.` Ny mening sist i stycket: `Och under Sökta tjänster håller du koll på var varje ansökan står.`
  `:173` (sista meningen): `Vill du fortsätta ingår Jobbcoachen utan tak i Jobbcoach Premium, 149 kr i månaden utan bindningstid, tillsammans med alla CV-mallar, CV-analysens alla förslag, nedladdning av breven, de 25 bästa träffarna i jobbmatchningen och alla rekryteringstester.`
  `:175` (första meningen): `Gratisnivån i övrigt räcker för en första ansökan: två CV-mallar med en nedladdning, CV-analysens läsbarhetspoäng och genomgång i sju delar, ett personligt brev och sedan ett var sjunde dag där de två senaste går att ändra, tre träffar i jobbmatchningen och ett grundnivåtest om dagen i rekryteringstesterna.`
- **Hänger ihop med:** GEM-1, GEM-2, GEM-5, GEM-11.

### ART-14 · fjorton filer, en mening i varje

Analysen mäter inga nyckelord eller branschord. Varje mening får i stället säga något analysen gör. Länkar står kvar som i dag.

- **`ats-vanligt-cv.mdx:156`**
  I dag: "pekar på vad som saknas: struktur, nyckelord och formuleringar, med konkreta förbättringsförslag på svenska."
  Förslag: `pekar på vad som saknas: struktur, resultat i siffror och formuleringar, med konkreta förbättringsförslag på svenska.`
- **`cv-exempel-yrken.mdx:254`**
  I dag: "Du får en poäng och ser vilka branschtermer och resultat som saknas, så vet du var texten behöver mer arbete."
  Förslag: `Du får en läsbarhetspoäng och ser var resultat i siffror och andra uppgifter saknas, så vet du var texten behöver mer arbete.`
- **`cv-och-personligt-brev.mdx:17` och `:203`**
  I dag: "Den kan säkerställa att formatet är korrekt, att rätt nyckelord finns med, att starka verb används och att informationen presenteras tydligt"
  Förslag: `Den kan säkerställa att formatet är korrekt, att rollerna har mätbara resultat, att starka verb används och att informationen presenteras tydligt`
- **`cv-profil-sammanfattning.mdx:363`**
  I dag: "så ser du vilka viktiga branschord som saknas och var texten kan bli skarpare."
  Förslag: `så ser du om profilen säger vilken roll du har, om något går att räkna och var texten kan bli skarpare.`
- **`datorkunskaper-cv.mdx:97`**
  I dag: "Vår CV-analys går igenom språk och nyckelord och pekar ut vaga formuleringar"
  Förslag: `Vår CV-analys kontrollerar att kompetenserna står som korta, sökbara termer och pekar ut roller utan resultat`
- **`fardigheter-cv-exempel.mdx:621`**
  I dag: "Du laddar upp CV:t och får en poäng och förslag på nyckelord för din målroll."
  Förslag: `Du laddar upp CV:t och får en läsbarhetspoäng, och Jobbcoachen kan föreslå kompetenser att lägga till om de stämmer på dig.`
- **`fardigheter-kompetenser-cv.mdx:207`**
  I dag: "Analysen läser bara CV:t, inte annonsen, men visar vilka nyckelord som är typiska för yrket och saknas hos dig, och vad du bör betona mer."
  Förslag: `Analysen läser bara CV:t, inte annonsen, men visar om kompetenserna står som korta, sökbara termer och om de är lagom många, och Jobbcoachen kan föreslå fler att lägga till om de stämmer.`
- **`hur-skriver-man-cv.mdx:256`**
  I dag: "går vårt verktyg för CV-analys igenom struktur, språk och nyckelord i CV:t och visar vad du bör skärpa."
  Förslag: `går vårt verktyg för CV-analys igenom CV:t i sju delar, från kontaktuppgifter till datum, ordning och längd, och visar vad du bör skärpa.`
- **`nyckelord-i-cv.mdx:129`**
  I dag: "gör vår CV-analys en liknande kontroll automatiskt, fast mot ditt yrke snarare än en enskild annons: den läser ditt CV som ett rekryteringssystem, jämför med de begrepp som annonser för ditt yrke brukar efterfråga och visar vad som saknas eller är för vagt beskrivet."
  Förslag: `gör vår CV-analys en annan sorts kontroll, av CV:t i sig snarare än mot en enskild annons: den går igenom sju delar, ser att kompetenserna står som korta, sökbara termer och visar vad som saknas eller är för vagt beskrivet.`
- **`personligt-brev-kompetenser-egenskaper.mdx:108`**
  I dag: "Vår CV-analys (en gratis analys) går i sin tur igenom struktur, språk, nyckelord och kvantifiering i ditt CV och visar var det är svagast"
  Förslag: `Vår CV-analys (gratis för varje CV) går i sin tur igenom ditt CV i sju delar, bland dem personbeskrivning, erfarenhet och kompetenser, och visar var det är svagast`
- **`personligt-brev-kompetenser-egenskaper.mdx:246`**
  I dag: "kan vår CV-analys (en gratis analys) gå igenom språk, nyckelord och kvantifiering i ditt CV och visa var formuleringarna är svagast."
  Förslag: `kan vår CV-analys (gratis för varje CV) gå igenom personbeskrivningen och rollerna i ditt CV och visa var siffror och resultat saknas.`
- **`skriva-cv-guide.mdx:199`**
  I dag: "för att få konkret feedback på struktur, nyckelord och förbättringsområden innan du skickar iväg det."
  Förslag: `för att få konkret återkoppling på struktur, resultat och vad som saknas innan du skickar iväg det.`
- **`vanliga-cv-misstag.mdx:227`**
  I dag: "Den pekar ut svaga formuleringar, saknade branschord och vanliga misstag, och ger konkreta förslag på vad du kan förbättra."
  Förslag: `Den pekar ut roller utan resultat, uppgifter som saknas och vanliga misstag i datum och ordning, och Jobbcoachen ger konkreta förslag på vad du kan förbättra.`
- **`hur-ska-ett-cv-se-ut.mdx:279`**
  I dag: "Testad i ATS: kört genom en CV-analys för att kontrollera ATS-kompatibilitet"
  Förslag: `Läsbarheten testad: kört genom en CV-analys för att se läsbarhetspoängen`

- **Skäl:** artikeln `nyckelord-i-cv` handlar om nyckelord, och där säger meningen nu rakt ut att analysen gör en annan kontroll än den artikeln lär ut. Sökordet står kvar i resten av artikeln. I `ats-vanligt-cv` står "som läser dokumentet ungefär som ett ATS gör" kvar: det är inget påstående om var poängen kommer ifrån.
- **Hänger ihop med:** CVA-4.

### ART-15 · `skriva-cv-guide.mdx:17, :233`

- **I dag:** "kan du köra det genom vår CV-analys och få ett ATS-poäng på 0-100."
- **Förslag** (frontmatter och synligt svar, med länken som i dag på rad 233): `Vill du veta hur ditt CV står sig kan du köra det genom vår CV-analys och få en läsbarhetspoäng av 100.`
- **Skäl:** svaret börjar redan med "ATS-system är standard hos de största bolagen", så sökordet står kvar i samma svar.
- **Hänger ihop med:** CVA-3.

### ART-16 · `bra-cv-guide.mdx:395` · `hur-ska-ett-cv-se-ut.mdx:293, :371` · `cv-pa-engelska-resume.mdx:536` · `cv-och-personligt-brev.mdx:190`

- **I dag:** "du får en poäng och det viktigaste att åtgärda direkt, och i Premium hela analysen av struktur, innehåll, nyckelord och ATS-kompatibilitet"; "Den fullständiga genomgången av struktur, innehåll och ATS-anpassning ingår i Jobbcoach Premium."; "Med **djupgående CV-analys (Premium)** ...".
- **Förslag:**
  `bra-cv-guide.mdx:395`: `För professionell feedback kan du [analysera ditt CV här](/verktyg/cv-analys). Svaret kommer inom en minut: du får en läsbarhetspoäng och ser vad som saknas i sju delar, gratis för varje CV, och i Premium skriver Jobbcoachen förslagen på nya formuleringar.`
  `hur-ska-ett-cv-se-ut.mdx:293`: `Vill du få professionell feedback på hur ditt CV ser ut? Börja med vår [gratis CV-analys](/verktyg/cv-analys), som visar din läsbarhetspoäng och vad som saknas i sju delar, från kontaktuppgifter till datum, ordning och längd. Jobbcoachens förslag på nya formuleringar ingår i Jobbcoach Premium.`
  `hur-ska-ett-cv-se-ut.mdx:371` (länkmeningen): `[Kör en gratis CV-analys](/verktyg/cv-analys) och se din läsbarhetspoäng och vad som saknas, del för del, eller [utforska CV-exempel inom din bransch](/cv-exempel) för att se hur andra strukturerar sina ansökningar.`
  `cv-pa-engelska-resume.mdx:536` (andra meningen): `Vill du ha konkret feedback kan du testa vår [CV-analys](/verktyg/cv-analys): ladda upp ditt engelska CV så får du en läsbarhetspoäng och ser vad som saknas, del för del. Jobbcoachens förslag kommer på svenska.`
  `cv-och-personligt-brev.mdx:190`: `Med **CV-analysen** laddar du upp ditt CV och får en läsbarhetspoäng och en genomgång i sju delar, gratis för varje CV. Du ser vad som saknas, och i Premium skriver Jobbcoachen konkreta förslag på nya formuleringar, så att ditt CV blir lätt att läsa för både rekryterare och rekryteringssystem.` (länken efter stycket som i dag)
- **Hänger ihop med:** GEM-1, GEM-5, CVA-10.

### ART-17 · `soka-jobb-via-mail.mdx:21, :34, :160, :162, :202`

- **I dag:** "Efter ungefär en vecka utan svar är det rimligt att skicka en kort och vänlig påminnelse"; "Följ upp med ett kort mejl efter ungefär en vecka om du inte fått svar."; "Exempel: uppföljningsmejl efter en vecka".
- **Förslag:**
  `:21` och `:202` (första meningen, resten oförändrat): `Efter en till två veckor utan svar är det rimligt att skicka en kort och vänlig påminnelse: att du sökt tjänsten, att du fortfarande är mycket intresserad och att du gärna svarar på frågor.`
  `:34` (sista meningen i snabbsvaret): `Följ upp med ett kort mejl efter en till två veckor om du inte fått svar.`
  `:160`: `Inget svar betyder oftast ingenting alls, rekryteringar drar ut på tiden. Efter en till två veckor är en kort påminnelse helt rimlig. Loggar du ansökan under Sökta tjänster säger vi till efter tolv tysta dagar och skriver [utkastet till uppföljningsmejlet](/funktioner#sokta-tjanster):`
  `:162` (exempelrubriken): `Exempel: uppföljningsmejl efter en till två veckor`
- **Skäl:** beslut 9 i `docs/beslut-jobbsoket-2026-11-21.md`: "en till två veckor" och en mening med länk. I FAQ-svaret och snabbsvaret byts bara tidsuttrycket, som SEO kräver. Länken har "uppföljningsmejl" i ankartexten och pekar på `/funktioner#sokta-tjanster` tills `/verktyg/sokta-tjanster` finns. Exempelrubriken på rad 162 är ingen rubrik i trädet och får enligt SEO bytas eller stå.
- **Hänger ihop med:** ART-18, TEL-5 (samma råd i exemplet).

### ART-18 · `uppfoljning-efter-intervju.mdx:36-38, :52, :216`

- **I dag:** HowTo-steget "Skicka ett kort, artigt uppföljningsmejl och fråga om status om tiden gått ut." och snabbsvaret "efter ungefär 5 till 7 arbetsdagar om ingen tidsram nämndes".
- **Förslag:** HowTo-steget (`:36-38`), snabbsvaret (`:52`) och alla FAQ-svar står kvar ordagrant. En mening läggs sist i ett befintligt stycke under rubriken "När och hur gör man en ytterligare uppföljning?":
  `Har du lagt in intervjun under Sökta tjänster påminner vi sju dagar efter intervjun om beskedet dröjer, och skriver [utkastet till uppföljningsmejlet](/funktioner#sokta-tjanster), som du öppnar i din egen e-post.`
- **Skäl:** platsen och länkformen är SEO:s.
- **Hänger ihop med:** ART-17.

### ART-19 · `personligt-brev-mall-gratis.mdx:29, :343`

- **I dag:** "Brevet går att läsa gratis, och nedladdning som PDF ingår i Premium (149 kr i månaden)."
- **Förslag** (sista meningen, frontmatter och synligt svar): `Brevet läser, kopierar och ändrar du gratis, och nedladdning som PDF eller Word ingår i Premium (149 kr i månaden).`
- **Hänger ihop med:** GEM-2, GEM-9.

---

## 17. Telefonskärmarna · `src/components/publikt/telefon/skarmar/`

Texterna står i den ordning de syns, uppifrån och ned, med namnen ur den inloggade vyn. Exempelpersonen är Sara Lindström, projektledare i Göteborg. Skisserna ersätter flera av telefonerna med instrumentet i stor skala. Texterna gäller då den ytan i stället.

### TEL-1 · `SkarmCvAnalys.tsx` (CV-analysens resultat)

- **I dag:** "Läsbart för systemen", "10 förslag, 86 med dem. Det tyngsta står först.", "Förslag per del" med Personbeskrivning, Roller, Kompetenser, Allmänna råd, "Tyngsta fyndet", knappen "Rätta och kör om".
- **Förslag:**
  Etikett: `Läsbarhetspoäng`
  Rubrik: `7 poäng kvar till 100`
  Rad under: `De sitter i två delar.`
  Huvudtal: `93`, med `av 100 i dag`
  Kort, etikett `Vägen till 100`: `I dag` 93, `Våra förslag` +5, `Du själv` +2
  Kort, etikett `Genomgången, del för del`, rubrik `Sju delar. Två har poäng kvar.`
  `Kontaktuppgifter` `10 av 10` `Klar`
  `Personbeskrivning` `15 av 15` `Klar`
  `Erfarenhet` `30 av 35` `Delvis`, med raden `Punkterna börjar med vad du gjorde`
  `Kompetenser` `12 av 12` `Klar`
  `Utbildning` `8 av 8` `Klar`
  `Språk` `3 av 5` `Delvis`, med raden `Nivå på varje språk`
  `Datum, ordning och längd` `15 av 15` `Klar`
  Knapp: `Hämta Jobbcoachens förslag`
  Rad under knappen: `En gång ingår gratis.`
- **Skäl:** delarnas tal summerar till 93, samma tal som i skisserna för startsidan och /verktyg/cv-analys. Skisserna låter Erfarenhet tappa på "två roller saknar ett resultat i siffror" och lägger ändå fem poäng på Jobbcoachens förslag. Det går inte ihop: vi skriver aldrig tal åt användaren, så en saknad siffra hör till "Du själv" (`analysTexter.ts:81`). Här tappar Erfarenhet i stället på punkter som inte börjar med vad hon gjorde, vilket är just det förslagen skriver om. Bäst är att bygget räknar exemplets tal med poängfunktionen på Saras exempel-CV i stället för att rita dem. Ryms inte sju rader i telefonen visas de två som har poäng kvar och raden `Fem delar är klara`.
- **Hänger ihop med:** CVA-1, CVA-2, GEM-7, STA-1. Skärmen syns på sju ytor.

### TEL-2 · `SkarmBana.tsx` (startsidans hjälte och /om-oss)

- **I dag:** "Mitt jobbsök", "Vägen till intervjun", "Tre av fem steg klara. Nu: Rekryteringstester.", "Nivåkollen klar, dagens pass väntar. Personlighetsprofilen sparad.", "Poäng 74 av 100, två fynd åtgärdade", "Skrivet på annonsen, nedladdat som PDF", "Lönefrågan inför intervjun", knappen "Starta dagens pass".
- **Förslag:** skärmen visar Översikt i Jobbsöket.
  Flikar: `Översikt`, `Jobb`, `Sökta`, `Intervju`
  Etikett: `Läget och nästa steg`
  Till höger om etiketten: `Veckans mål: 2 av 3`
  Rubrik: `Förbered intervjun`
  Rad under: `Sweco. Intervjun är på tisdag kl 10.00.`
  Knapp: `Förbered intervjun`, med raden `En kvart räcker.`
  Kort, etikett `Att göra nu`, med raden `Ordnade efter datum. Det som brinner står först.`
  `Följ upp ansökan hos Trafikverket` `Ett kort mejl brukar ge besked.`
  `Sök före sista dag` `Byggledare, Peab. Sista dag onsdag.`
  Kort, rubrik `Sökta tjänster`
  `Projektledare, bygg` `Sweco` `Intervju bokad`
  `Uppdragsledare` `Trafikverket` `Sökt för 12 dagar sedan`
  `Projektledare` `Göteborgs stad` `Sökt i går`

  På startsidan ersätter skissen telefonen med fyra kort. Deras texter, ur `sidor/start.html`:
  `Rekryteringstester` med matrisuppgiften
  `CV-analys` `93 av 100` `7 poäng kvar. De sitter i två delar.`
  `Personliga brev` `Svarar på 3 av 4 krav i annonsen.`
  `Jobbsöket` `3 sökta väntar på svar. Intervju tisdag.`
- **Skäl:** Nivåkollen, de fem stegen, "Mitt jobbsök", "fynd" och lönefrågan utgår. Rubriker och rader är vyns egna där jag hittade dem (`OversiktVy.tsx:182-209`, `oversikt.ts:87-147`). Raderna för de enskilda uppgifterna i "Att göra nu" skrivs av motorn och ska stämmas av mot den när skärmen ritas. Beslut 16 punkt 7 i `docs/beslut-jobbsoket-2026-11-21.md` säger att skärmen står kvar tills Black Week är över, se beslut 7.
- **Hänger ihop med:** INF-2, REG-5.

### TEL-3 · `SkarmMatchning.tsx` (Matchade jobb)

- **I dag:** "Dina matchningar", "Dina 25 bästa träffar", "Kompetens mot alla annonser i Platsbanken. Skälen står under varje träff.", "Du täcker:", "Saknas: PMP-certifiering", knappen "Skriv brev från träffen".
- **Förslag:**
  Flikar: `Översikt`, `Jobb`, `Sökta`, `Intervju`
  Etikett: `Matchade jobb`
  Rubrik: `25 jobb passar dig`
  Rad under: `Vi läser ditt CV och letar bland Arbetsförmedlingens annonser. Varje träff säger varför den passar.`
  Över listan: `25 bästa träffarna`
  Rad: `Senast sökt i dag.` med länken `Sök igen`
  Träff 1: `92 %` `Projektledare, bygg` `Sweco, Göteborg` `Din roll matchar` med kompetenserna `projektledning`, `LOU`, `budgetansvar`, `AMA`. Till höger: `Sista dag 28 nov`
  Träff 2: `88 %` `Uppdragsledare, infrastruktur` `Trafikverket, Mölndal` med kompetenserna `tidplan`, `entreprenadjuridik`, `BAS-P`. Till höger: `Sista dag 3 dec`
  Träff 3: `81 %` `Byggledare` `Peab, Borås`
  Under den öppna träffen, tre knappar: `Skriv brev`, `Spara till Ska sökas`, `Markera som sökt`
- **Skäl:** "Saknas: PMP-certifiering" utgår av samma skäl som i GEM-10. Kommentaren överst i filen ("körda när sidan öppnas") skrivs om av bygget.
- **Hänger ihop med:** GEM-10, STA-4, JM-5. Skärmen syns på sex ytor.

### TEL-4 · `SkarmAktivera.tsx` (/verktyg/jobbmatchning, under Så fungerar det)

- **I dag:** "CV:t är aktiverat", "Sex datapunkter lästa ur projektledare-cv.pdf. Nu söker vi i Platsbanken.", "Söker bland 1 843 lediga jobb", "62 %", knappen "Visa träffarna".
- **Förslag:** skärmen visar Matchade jobb innan första sökningen.
  Etikett: `Matchade jobb`
  Rubrik: `Jobb som passar ditt CV`
  Ruta, rubrik `Ditt CV`, med länkarna `Byt CV` och `Rätta`
  `projektledare-cv.pdf`
  `3 roller` `14 kompetenser` `2 utbildningar`
  `Ort i CV:t: Göteborg`
  Ruta, rubrik `Så söker vi åt dig`, med länken `Ändra`
  `Göteborg` `Distans: nej` `Heltid`
  Kort: `Vi har inte letat än`
  `Tryck här så läser vi igenom Arbetsförmedlingens annonser mot ditt CV.`
  Knapp: `Hitta jobb som passar`
  Medan sökningen går: rubrik `Vi läser Arbetsförmedlingens annonser`, text `Det brukar ta 20 sekunder. Vi läser upp till 600 annonser mot ditt CV.`
- **Skäl:** talet "1 843 lediga jobb" och mätaren på 62 procent är påhittade och utgår. Sidans rubrik "Sex datapunkter ur ditt CV" står kvar, och filen exporterar datapunkternas namn till den. Vyn visar roller, kompetenser, utbildningar och ort, och skärmen visar samma fyra.
- **Hänger ihop med:** JM-1, JM-2, ART-10.

### TEL-5 · `SkarmCoach.tsx` (Jobbcoachen)

- **I dag:** "Inför intervjun på torsdag", "Svaren utgår från svensk arbetsmarknad och ditt CV.", frågan om rimlig lön, svaret "Med din bakgrund från NCC och LOU-upphandlingarna ligger spannet i Göteborg runt 48 000 till 56 000 kr i månaden. Begär 54 000 ...", "Vill du att vi övar på frågan om varför du lämnade NCC?".
- **Förslag:**
  Rubrik: `Jobbcoachen`
  Rad under: `Fråga om lön, intervjuer, arbetsrätt eller ditt CV. Vi svarar med källor du kan kolla själv.`
  Fråga (användaren): `Vad skriver jag i ett uppföljningsmejl?`
  Svar: `Håll det kort. Säg vilken tjänst det gäller, att du fortfarande är intresserad och fråga när de räknar med att ge besked. Tre till fyra meningar räcker.`
  Svaret slutar med källmärket `(Källa 1)`, som i vyn
  Rubrik: `Frågor utifrån ditt läge`
  Rad under: `Hämtade ur dina sökta tjänster.`
  Förslag att trycka på: `Vad frågar jag arbetsgivaren på intervjun?` och `Hur länge är det rimligt att vänta på besked?`
  Fältet: `Fråga vad du vill veta om jobb, lön, intervju eller arbetsrätt`
  Knapp: `Skicka`
- **Skäl:** inget belopp, inget "med din bakgrund från", inget påstående om att svaren bygger på CV:t (beslut 18). Frågan och de två förslagen är ordagrant sådana som vyn föreslår (`src/lib/jobbsok/coach.ts:41-43`). Skissens tre knappar under svaret ("Skriv utkastet", "Öva intervjufrågor", "Vad säger jag om lön?") finns inte i vyn och är utbytta mot de riktiga förslagen.
- **Hänger ihop med:** GEM-11, STA-5, STA-6, JC-2, ART-17. Skärmen syns på sju ytor.

### TEL-6 · `SkarmMatris.tsx` (rekryteringstestet)

- **I dag:** "Matrislogik, expertnivå", "04:12", "Fråga 9 av 15", "Vilken figur hör hemma i den tomma rutan?", knappen "Svara och gå vidare".
- **Förslag:**
  Testets namn: `Matrislogik`
  Rad under: `Expertnivå`
  Räknaren: `uppgift 9 av 15`
  Klockan: `4:12`
  Frågan: `Vilken figur passar i den tomma rutan?`
  Knapp: `Svara`
- **Skäl:** "uppgift", inte "fråga", och knappen heter Svara (`src/components/session/copy.ts:99-117`). Frågan är sessionsramens egen (`src/components/session/typer/Matris.tsx:35`). Klockan skrivs utan inledande nolla, som i ramen. Skissen visar en uppgift på grundnivå med raden "Grundnivå": visar bilden den uppgiften ska raden säga det.
- **Hänger ihop med:** B4, B7.

---

## 18. Integritetspolicy och villkor

Ägarens, ändras inte. De fyra FAQ-svaren som säger "all data lagras i EU" och "Det enda som blir kvar är kvitton hos Stripe" (`cv-analys-faq-data.ts:40`, `FunktionerSida.tsx:84`, `Startsidan.tsx:123`, `brev-faq-data.ts:27`) står kvar ordagrant. Kartläggningens två iakttagelser går vidare som fråga, se beslut 14.

---

## Avstämt mot SEO:s krav

`seo-krav.md` kom medan förslagen skrevs. Så här förhåller de sig till varandra.

**SEO:s lydelser som står i förslagen:** H2 "Sju delar som ger din läsbarhetspoäng" och de sju H3 med produktens namn (CVA-1), HowTo-rubrikerna "Vi går igenom sju delar", "Se läsbarhetspoängen och vad som saknas" och "Hämta Jobbcoachens förslag" (CVA-2, CVA-4, CVA-9), slutblockets "Alla förslag, och nya när du har ändrat." (CVA-5), frågan "Kan jag ladda upp ett inskannat CV som PDF?" (CVA-10), "Välj eller ladda upp ditt CV" (JM-1), "Skriv CV:t direkt på arket" och "Ladda ner som PDF eller Word" (FUN-7, FUN-8), och H1 på /verktyg/cv-analys (B1).

**SEO:s ramar som förslagen håller:**

- "ATS" står en gång i beskrivningen och en gång i FAQ-svaret om läsbarhetspoängen, ingen annanstans på /verktyg/cv-analys. Sidans titel är orörd.
- Frågan "Hur lång tid tar en CV-analys?" står kvar, med ett svar som går att belägga.
- Beskrivningen på /priser har kvar "personliga brev" och "149 kr i månaden" och är 152 tecken. Tabellens etiketter står kvar.
- H3 "Uppdaterat varje dag" på /verktyg/jobbmatchning står kvar (JM-4). HowTo-stegen på /verktyg/personligt-brev är orörda (BRV-2).
- I `soka-jobb-via-mail` byts bara de fyra tidsuttrycken, plus en mening med länk (ART-17). I `uppfoljning-efter-intervju` rörs varken HowTo, snabbsvar eller FAQ (ART-18).
- I `ai-jobbmatchning` är stegen fortfarande fyra, FAQ-svaret har samma form och länken har kvar "jobbmatchningen" i ankartexten (ART-10).
- Reklamkortens texter är inom fem ord från dagens längd (REK-1, REK-2).
- På /hjalpcenter och /om-oss läggs bara till (INF-2, INF-3). Menyns ankartexter är orörda (NAV-1).
- I artiklarna i ART-14 ändras bara meningen om vår CV-analys. Artiklarnas egna råd om nyckelord står kvar.

**Det som återstår att jämka:**

| Fråga | SEO | UX-copy | Beslut |
|---|---|---|---|
| FAQ-frågan om gratis, CVA-5 | Byt till "Vad är gratis i CV-analysen?" | Behåll "Hur många analyser får jag göra gratis?", svaret börjar "Det finns ingen gräns" | 17 |
| FAQ-frågan om att köra om, CVA-6 | Byt till "Räknas poängen om när jag ändrar i CV:t?" | Behåll "Kan jag köra analysen igen när jag ändrat i CV:t?", svaret börjar "Du behöver inte köra om något" | 17 |
| Etiketten över H1, B1 | "CV-analys" eller en kort förmån | "Gratis för varje CV" | 1 |
| Gruppnamnet i tabellen, PRI-7 | Inte bedömt | "Jobbsöket" | 18 |
| Raden under paketnamnet, GEM-6 | Jobbsöket ska in, läses ur `plans.ts` | "Tester, CV, personliga brev, Jobbsöket och Jobbcoachen" | 8 |
| "Samma CV ger alltid samma poäng" | Inte bedömt | Står inte i någon publik text | 3 |
| Ordantalet på startsidan | Gräns 20 ord, risk medel till hög | Varje post på sidan är lika lång eller längre än i dag | Räknas i grinden |

**Inte skrivet:** texten till den nya sidan /verktyg/sokta-tjanster. SEO har lagt titel, H1, disposition och källkraven för aktivitetsrapporten. Sidan ligger utanför de 105 posterna. Sektionen "Vägen till 100 poäng" på /verktyg/cv-analys finns i skissen men är ingen post: skissens text där stämmer med produktfacit, med undantag för exemplets tal (se TEL-1).

---

## Där förslaget går en annan väg än kartläggningen eller skissen

Kartläggningen säger vad som är fel. På de här ställena pekar den, eller skissen, mot en lösning som jag inte har valt.

| Post | Kartläggningen eller skissen | Mitt förslag | Varför |
|---|---|---|---|
| GEM-13 | Lägg till brickan "Logga en tjänst du har sökt" i listan på /priser | Ingen ändring | Brickan finns bara i gratislistorna på grenen. Listan på /priser är Premiums. |
| REG-5 | Nivåkollen ska inte stå publikt | Raderna står kvar, lydelser utan ordet ligger färdiga | Raderna visas efter ett gjort prov och säger vad nästa skärm heter. Det är inte reklam. |
| BRV-2 | HowTo beskriver ett flöde i fyra steg som inte finns | Stegen står kvar, en mening i ingressen byts | Inget i stegen är osant, och fyra namngivna steg är värda mer i sök än en omskrivning. |
| CVA-5, CVA-6 | Skissen och SEO byter FAQ-frågorna | Frågorna står kvar ordagrant, svaren är nya. SEO:s frågor står som alternativ i posterna | Frågorna är sökfraserna, och inget undantag behövs i grinden. Svaren "ingen gräns" och "du behöver inte köra om" är sanna. Se beslut 17. |
| CVA-7 | Skissen stryker frågan om tid och alla tidsuppgifter | Frågan står kvar med ett svar som går att belägga | Rutten avbryts efter 30 sekunder, och knappen i kontot säger "under en minut". |
| CVA-3 och skissen | Skissen skriver "Samma CV ger alltid samma poäng" | Meningen står inte i någon publik text | Poängen kan skilja upp till tio poäng mellan sidan och kontot. Se beslut 3. |
| GEM-10, JM-5, STA-4, TEL-3 | "Vad som saknas" gäller bara vissa annonser | Löftet är struket helt | Ett villkor mitt i en säljrad läser ingen. Se beslut 4. |
| GEM-6 | Raden ska nämna Jobbsöket med Sökta tjänster | "Jobbsöket" ersätter "jobbmatchning" i raden, sökordet står kvar i prissidans hjälte | Alla tre ryms inte inom 60 tecken. Se beslut 8. |
| PRI-1 | En tabellrad ska rättas | Två rader: analysen och Jobbcoachens förslag | Gränsen mellan gratis och Premium går vid förslagen. |
| STA-6 | Nämn förslagen utifrån läget | "och ditt CV" byts mot "med källa till varje svar" | Det är sant om varje svar. Läget och dokumenten står i stycket intill (STA-5). |
| STA-8 | Skissen har kvar "Alla verktyg utan tak" | "Alla verktyg, alla nivåer, alla mallar" | Premium har tre tak. |
| STA-5, TEL-5 | Skissen tar bort ordet lön och har tre knappar som inte finns i vyn | "Lön" står kvar som ämne, och skärmen visar vyns riktiga frågeförslag | Regeln gäller belopp. Jobbcoachen svarar på lönefrågor med källa. |
| TEL-1 | Skissen låter förslagen ge poäng för saknade siffror | Exemplet tappar på punkternas verb i stället | Vi skriver aldrig tal åt användaren. |
| NAV-1 | Menyn ska ha Matchade jobb och Sökta tjänster | Länken heter fortfarande Jobbmatchning | Det är sidans H1 och sökord. Fliknamnet är inloggat. |
| ART-18 | Produktens uppföljning efter intervju saknas | En mening i ett befintligt stycke, HowTo, snabbsvar och FAQ orörda | SEO:s krav på artikeln. |
| INF-1 | Tre kort med passerade datum | Två kort skrivs om, två lämnas till beslut | Jag vet inte om e-postutskick och koppling till rekryteringssystem ska byggas. |

---

## Bifynd som inte är poster

Det här såg jag i koden runt posterna. Inget av det står i kartläggningen, så det räknas inte bland de 105. Lydelserna är färdiga om saas-lead vill ta med dem.

- **B1. H1 och tidsuppgiften på /verktyg/cv-analys.** `page.tsx:137`: "Få konkret feedback på ditt CV på 60 sekunder". Skissen byter till "Se var ditt CV tappar poäng, del för del". SEO har satt H1 till `CV-analys med läsbarhetspoäng: se var ditt CV tappar, del för del`, och den tar jag: sökordet och poängens namn står i rubriken. Etiketten över H1 ska då inte upprepa samma ord. Mitt förslag: `Gratis för varje CV`. Tidsuppgiften i den gamla rubriken var för övrigt inte osann: den publika analysen svarar inom 30 sekunder eller inte alls (`quick-score/route.ts:21`). Därför kan OG-bildens "Förbättra ditt CV på 60 sek" stå kvar, och FAQ-svaret i CVA-7 säga "inom en halv minut". HowTo-schemats `totalTime` (`page.tsx:61`) sätts enligt SEO till `PT1M` eller stryks.
- **B2. Skrivtipset "Hoppa över bilden".** `page.tsx:28`: "Bilder kan göra att systemen läser fel. I Sverige väger innehållet tyngre än utseendet, så lägg platsen på det som säljer dig." Femton av våra mallar har plats för foto. Rubriken står kvar, texten blir: `I Sverige är standard ett CV utan bild, och innehållet väger tyngre än utseendet. Lägg platsen på det som säljer dig. Vill du ändå ha foto finns det mallar med plats för det.`
- **B3. Startsidan, fem rader.** Rad 156, brickan "60 sek till första CV-poängen": `8 testtyper` med texten `grundnivån gratis` (skissen). Rad 305, "Tio frågor gratis": `Tio meddelanden gratis`. Rad 271, "matchad mot alla annonser i Platsbanken": `matchad mot annonserna i Platsbanken`. Rad 98, "Brev som fungerat, yrke för yrke.": `Brev att utgå från, yrke för yrke.` (vi vet inte att breven har fungerat). Rad 231, "Ett nivåtest visar var du står,": skissen stryker ledet och SEO vill ha en sann ersättare av samma längd. Lydelse: `Grundnivån visar var du står i varje typ,` (samma ord som i `paket-copy.ts:228`).
- **B4. "Fråga" där produkten säger "uppgift".** `GRATIS_TESTRAD` ("förklaring efter varje fråga"), startsidan rad 228, registreringens kort för tester och fler. Briefen säger uppgift. Det är ett eget svep över testtexterna och hör inte hit, men skisserna har redan bytt på startsidan.
- **B5. Två FAQ-svar med samma fel som posterna.** `jobbcoachen-faq-data.ts:50`: "två CV-mallar, en CV-analys, ett personligt brev var sjunde dag" blir `två CV-mallar, CV-analysens läsbarhetspoäng, ett personligt brev var sjunde dag`. `jobbmatchning-faq-data.ts:39`: "Vill du se alla 25 träffar" blir `Vill du se de 25 bästa träffarna`.
- **B6. Inloggade texter med samma fel.** `registrering-copy.ts:431` ("Analysen visar poängen och det tyngsta fyndet, gratis."), Kom igång-brickorna på grenen (`komigang.ts:418-419`: "Poängen och det tyngsta fyndet", "Ett ingår gratis att läsa") och `paket-copy.ts:631`. Utanför omfånget, men de säger emot de publika sidorna dagen efter den här pushen.
- **B7. Provkortets rubrik.** `reklam-copy.ts:108`: "Vilken figur hör hemma i den tomma rutan?". Sessionsramen säger "passar i". Det är en rubrik på ett kort och får avvika, men TEL-6 följer ramen.
- **B8. Sidfotens och schemats Facebook-adress** skiljer sig åt (kartläggningens sista punkt). Inte text, inte min sak.

---

## Det här kräver beslut

Frågorna är ställda så att de går att svara ja eller nej på, eller med ett val.

1. **H1 på /verktyg/cv-analys.** Avgjort av SEO: "CV-analys med läsbarhetspoäng: se var ditt CV tappar, del för del". Kvar att välja är etiketten över rubriken, se B1.
2. **Mini-analysens innehåll, CVA-12 (saas-lead).** Texten under "Det viktigaste att ändra först" kommer ur en äldre analys som kontot aldrig visar. Skissen lovar i stället "Delen där du tappar mest, med vad som saknas, i klartext". Ska den publika rutten lämna ut den svagaste delen ur poängmodellen? Utan det bygget är skissens löfte osant och mitt förslag i CVA-12 det som går att säga.
3. **Är poängen densamma utan konto och i kontot? (saas-lead)** Kartläggningen säger att samma CV kan få upp till tio poäng mer inloggat. Skissen skriver "Samma CV ger alltid samma poäng" på tre ställen på den publika sidan. Jag har hållit meningen borta från alla publika texter. Ska skillnaden byggas bort, eller ska meningen bort ur skissen?
4. **"Vad som saknas" per träff, GEM-10, JM-5, STA-4, TEL-3 (saas-lead och SEO).** Jag har strukit löftet eftersom raden bara visas för annonser med utskriven kravprofil. Vill SEO ha kvar orden blir lydelsen "och, när annonsen har en kravprofil, vad som saknas i ditt CV". Vilken?
5. **/integrationer, INF-1 (ägaren).** Finns det en plan för att skicka personliga brev från användarens Gmail eller Outlook, och för en koppling till arbetsgivarnas rekryteringssystem? Om nej: ska de två korten bort, eller ska hela sidan bort? Den länkas inte från menyn eller sajtkartan.
6. **Nivåkollen efter provet, REG-5 (saas-lead).** Räknas kontostegets panel och spärren under provresultatet som reklam? Jag säger nej och föreslår att raderna står kvar. Lydelserna utan ordet står färdiga i posten.
7. **SkarmBana, TEL-2 (saas-lead).** Beslut 16 punkt 7 säger att skärmen står kvar tills Black Week är över. Gäller det fortfarande, eller byts den i den här pushen? På /om-oss står den kvar tills något annat är ritat.
8. **Raden under paketnamnet, GEM-6 (SEO).** "Tester, CV, personliga brev, Jobbsöket och Jobbcoachen" (mitt förslag) eller dagens "Tester, CV, personliga brev, jobbmatchning och Jobbcoachen"? Båda ryms inte inom 60 tecken tillsammans med "sökta tjänster".
9. **Nya kort för Sökta tjänster och Inför intervjun, GEM-12 (saas-lead och formspåret).** Ska /priser och /funktioner få de två korten, eller räcker kortet under "Alla verktyg, samlade" (FUN-4) tills Sökta tjänster har en egen sida?
10. **Kom igång för betalande, GEM-13 (saas-lead).** Ska brickan "Logga en tjänst du har sökt" in i Premiums lista? Först då kan /priser nämna den. Raden blir då `Första sökta tjänsten loggad` och etiketten `12 steg`.
11. **Rubriken "Uppdaterat varje dag", JM-4.** Avgjort av SEO: rubriken står, texten under byts. Förslaget följer det.
12. **Menyn, NAV-1.** Avgjort av SEO i sak: ankartexterna står kvar, Jobbcoachen ligger under Jobbsöket, och "Sökta tjänster" pekar på `/funktioner#sokta-tjanster` tills `/verktyg/sokta-tjanster` är live. Förslaget följer det. Kvar för saas-lead: när den nya sidan byggs, och vem som skriver den. SEO har lagt disposition, titel och H1. Texten är inte skriven.
13. **Taket i Premium för uppföljningsmejl, PRI-7 (saas-lead).** Ska "högst 30 utkast per dygn" stå i tabellen, eller räcker "Till varje sökt tjänst"?
14. **Juridiken (ägaren).** Fyra FAQ-svar säger "all data lagras i EU" och "det enda som blir kvar är kvitton hos Stripe". Policyn anger EU för Supabase, PostHog och Vercels funktioner men säger inget om var Google, Stripe och Resend lagrar, och den säger att kontoinformation kan sparas "en rimlig tid därefter". Jag har inte rört någon av texterna. Är svaren och policyn överens som de står?
15. **SkarmIntervjufragor (saas-lead).** Rubriken "Frågor rekryteraren lär ställa" och knappen "Öva på svaret" finns inte i den inloggade vyn enligt kartläggningen. Skärmen är ingen post och jag har inte skrivit om den. Ska den ritas om mot Inför intervjun som den ser ut efter omgång 2?
16. **Tillägget i artikeln om uppföljning efter intervju, ART-18.** Avgjort av SEO: en mening i ett befintligt stycke, med länk. Förslaget följer det.
17. **Två FAQ-frågor på /verktyg/cv-analys, CVA-5 och CVA-6 (saas-lead).** Jag behåller frågorna "Hur många analyser får jag göra gratis?" och "Kan jag köra analysen igen när jag ändrat i CV:t?" ordagrant, med nya sanna svar. SEO byter dem till "Vad är gratis i CV-analysen?" och "Räknas poängen om när jag ändrar i CV:t?". Båda paren står färdiga i posterna. Vilket?
18. **Gruppens namn i jämförelsetabellen, PRI-7 (SEO).** "Jobb och coachning" blir "Jobbsöket" i mitt förslag. Är gruppnamnet en rubrik i grindens träd krävs ett undantag. Får det bytas?
