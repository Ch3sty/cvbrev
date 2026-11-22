# SEO:s krav på texträttningarna, publikt omgång 3

Skrivet 2026-11-22 av SEO. Underlag: `kartlaggning.md` (105 poster), `docs/design/publikt-omgang3/BRIEF.md`, noterna `noter/cv-analys.md` och `noter/start.md`, `delar/mega.html`, `delar/fot.html`, `underlag/text-live-2026-11-22/_rubriktrad.txt`, sidornas kod i `src/app/(public)/` och `content/artiklar/`, grinden `scripts/seo-diff-artiklar.ts`.

Det här dokumentet sätter ramarna. Lydelserna skriver UX-copy; saas-lead jämkar. Där jag själv skriver en lydelse är det för att uppdraget bad om det (rubrikbytena, den nya sidan) eller för att visa att ramen går att hålla.

## Search Console: åtkomsten fungerade

Hämtat 2026-11-22 med tjänstekontot (bara läsning, `dataState: final`), skriptet kört från `C:\Users\chris\cvbrev` med svaret sparat utanför projektet.

- **28 dagar:** 2026-10-22 till 2026-11-18.
- **90 dagar:** 2026-08-21 till 2026-11-18.
- Siffrorna per sida är summan för sidan. Sökfrågorna per sida är de Google visar; anonymiserade frågor saknas, så frågornas summa är lägre än sidans.
- Position är viktat medel. "v" = visningar, "k" = klick, "p" = position.

Tre saker i datan styr hela omgången:

1. **Verktygssidorna har nästan ingen sökvolym på produktorden.** /verktyg/cv-analys har 345 visningar på 90 dagar, varav 35 på "cv analys" (p 6,1). Ingen sökfråga till sidan innehåller "ats-poäng", "nyckelord", "60 sekunder" eller "fyra delar". Att rätta det osanna på verktygssidorna kostar därför nästan ingen ranking. Risken sitter i grinden (rubriker, FAQ, ordantal), inte i Google.
2. **Trafiken som kan gå förlorad finns i artiklarna och på /verktyg/jobbmatchning.** `soka-jobb-via-mail` (2 343 v, 21 k, p 8,2), `ai-jobbmatchning` (1 209 v, p 8,7, varav 800 v på "jobbmatch ai" p 6,2), `uppfoljning-efter-intervju` (1 247 v, p 9,4) och /verktyg/jobbmatchning ("jobbmatchning" 194 v, p 8,0, och p 3,7 de senaste 28 dagarna) är där en slarvig rättning kan kosta. Där gäller: byt bara den osanna meningen, rör inga rubriker eller frågor.
3. **"Aktivitetsrapport", "sökta jobb", "ansökningar" och "uppföljning" ger noll visningar på hela sajten** (90 dagar, sökt med mönster på både sökfråga och sida/sökfråga). Allt om den nya sidan /verktyg/sokta-tjanster är därför en bedömning, inte belagt i vår egen data.

---

## Gemensamma regler för alla poster

Reglerna nedan gäller överallt och upprepas inte per sida.

**R1. Titlar, H1, H2, H3 och adresser rörs inte om de inte är osanna.** Ett rubrikbyte på en sida i grindens hårda regel (alla verktygssidor, /, /priser, /funktioner, artiklarna, /cv-exempel, /om-oss, /hjalpcenter) kräver en rad i `RUBRIK_BYTT` (eller `H1_BYTT`) i en undantagsfil `scripts/seo-baslinje/publikt-omgang3-undantag.json`, med datum och skäl. Ny rubrik ska ha samma nivå som den gamla.

**R2. FAQ-frågor står kvar ordagrant.** Svaret får skrivas om. Byts en fråga ska den nya stå både synligt och i FAQPage, och bytet skrivas i `FAQ_BYTT`. En fråga får inte strykas utan ersättare.

**R3. Schema följer det synliga.** WebApplication, HowTo, FAQPage, Product, Organization, WebSite och BlogPosting behålls som typer. HowTo-stegens `name` och `text` ska vara exakt de rubriker och texter som syns i stegen. FAQPage `name` och `acceptedAnswer.text` ska vara exakt det som syns. Varje ändrat schemablock kräver `LD_UNDANTAG` med `andrade: [...]` för sidan. För artiklar ändras BlogPostings `wordCount` vid varje textändring, så varje rörd artikel behöver `andrade: ['BlogPosting']`, plus `'FAQPage'` om ett FAQ-svar ändras.

**R4. Metadata.** seoTitle högst 60 tecken, description 110 till 158 tecken, sidans primära sökord först i titeln. Kampanjord (Black Week, Cyber Monday, rabatt, kronor i kampanj) får aldrig stå i title, H1, description, FAQ eller schema. Ändrad title eller description kräver `META_BYTT`. OG- och twitter-titlar följer samma sanningskrav men är inte rankingbärande; de får ändras fritt inom sanningen.

**R5. Ordantal.** Grinden fäller en sida om orden i `main` sjunker mer än 2 procent. Rättningar ska ersätta, inte stryka. Ett osant påstående byts mot ett sant påstående av ungefär samma längd. Telefonskärmarna är `aria-hidden` (`src/components/publikt/telefon/Telefon.tsx:28`) och räknas inte; de nya instrumenten i skisserna räknas om de inte också är `aria-hidden`. Instrument får aldrig innehålla `h2` eller `h3` (de blir annars nya rubriker i trädet, och i artiklar fäller varje ny rubrik grinden).

**R6. Samma sak sägs likadant överallt.** Gratisnivån, matchningens rytm, Jobbcoachens kunskap och CV-analysens delar beskrivs med samma fakta på alla sidor, i samma push. En sida som säger "när du öppnar sidan" när en annan säger "tre gånger per dygn" är ett kvalitetsproblem för både Google och läsaren.

**R7. Fasta formuleringar (redan beslutade, jag står bakom dem):**
- Matchningen: "Annonserna hämtas tre gånger per dygn. Du söker om med ett tryck när du vill se de senaste." Alla sju ställen (FUN-1, GEM-10, STA-4, JM-3, ART-3, ART-8, ART-11) i samma push.
- CV-analysen: namnet är **läsbarhetspoäng**. "ATS" får stå en gång i metatitel eller beskrivning och en gång i brödtexten som förklaring, i formen "läsbarhetspoäng för rekryteringssystem (ATS)". Aldrig att poängen kommer från ett ATS. Aldrig "ATS-poäng", "fyra delar", "sex saker", "en analys per konto", "kör om analysen".
- Inskannade PDF:er: en mening i uppladdningssteget och en FAQ-fråga på /verktyg/cv-analys.
- `dateModified` uppdateras på varje artikel som rörs.

**R8. Grindens täckning.** Grinden mäter i dag verktygssidorna, /, /priser, /funktioner, /om-oss, /hjalpcenter, /cv-exempel, de tjugo mest klickade artiklarna (bland dem `soka-jobb-via-mail`, `ats-vanligt-cv`, `personligt-brev-kompetenser-egenskaper`), `bra-cv-guide`, `cv-exempel-yrken`, `skriva-cv-guide` och `hur-ska-ett-cv-se-ut`. **Krav:** varje artikel som rörs i omgången tas med i avtrycket före och efter, också de som inte står i listan (`jobbcoach-online`, `vad-ar-en-jobbcoach`, `ai-jobbmatchning`, `din-digitala-jobbcoach`, `uppfoljning-efter-intervju`, `personligt-brev-mall-gratis`, `nyckelord-i-cv` och resten av ART-14 och ART-16). Ta en ny baslinje mot live innan bygget börjar.

**Ordantalen nedan** är `main`-orden i det senaste avtrycket i `docs/qa/seo-diff/` (filerna är daterade 2026-11-21). De är vägledande; den nya baslinjen avgör.

---

## 1. /verktyg/cv-analys

### Vad sidan rankar på i dag

| Period | Klick | Visningar | Position |
|---|---|---|---|
| 28 dagar | 1 | 107 | 10,7 |
| 90 dagar | 12 | 345 | 11,7 |

Sökfrågor 90 dagar: "cv analys" 2 k, 35 v, p 6,1; "cv granskning" 11 v, p 48,8; "ats anpassat cv" 9 v, p 34,3; "ai cv" 8 v, p 45,5; "svammelord" 3 v, p 10,0; "analyse cv" 2 v, p 6,5; "ats granskare" 2 v, p 28,5; "analyser cv", "cv analyser" 1 v vardera, p 7 och 11.

Sidan lever på ett enda ord: **"CV-analys"**. Inget annat ord i sökfrågorna bär något.

### Får inte röras

- Titeln "CV-analys: poäng och konkreta förslag | Jobbcoach.ai" (52 tecken). Den är sann och har "CV-analys" först. Den står kvar.
- Adressen, canonical, brödsmulorna "Hem / Verktyg / CV-analys".
- H2 "Analysera ditt CV direkt", "Så fungerar det", "Fem saker som lyfter vilket CV som helst", "Frågor om CV-analysen".
- H3 under skrivtipsen: "Kvantifiera dina resultat", "Börja varje punkt med ett verb", "Använd annonsens egna ord", "En sida räcker ofta", "Hoppa över bilden" (skrivråd, inte produktpåståenden; brödtexten under "Hoppa över bilden" får nyanseras med att 15 mallar har plats för foto, men rubriken står). Ordet "svammelord" i brödtexten står kvar (p 10).
- HowTo-steg 1 "Ladda upp ditt CV".
- FAQ-frågorna "Vilka förbättringsförslag får jag?", "Behöver jag ha CV:t på svenska?", "Är mitt CV säkert hos er?" (svaret ordagrant, se nedan), "Vad händer efter analysen?", och **"Hur lång tid tar en CV-analys?"** (se CVA-7).
- FAQ-svaret om säkerhet står ordagrant. Jag tar inte ställning till det.
- Schematyperna WebApplication, HowTo, FAQPage.

### Får och bör ändras

- **H1:** byts (se rubrikbytena sist). Krav: "CV-analys" och "läsbarhetspoäng" i H1.
- **Description** (osann i dag, "En analys gratis per konto"): 110 till 158 tecken, börjar med eller innehåller "CV-analys" i första satsen, säger "läsbarhetspoäng", säger sant vad som är gratis (poängen och vad som saknas i alla sju delar, för varje CV). "ATS" får stå här en gång, och då inte i titeln. Exempel som håller ramen, inte slutlig lydelse: "CV-analys med läsbarhetspoäng: vi går igenom ditt CV i sju delar och visar var poängen tappas. Gratis för varje CV, ingen kortuppgift." (134 tecken).
- **OG- och twitter-titel:** "ATS-poäng" och "60 sekunder" ut. "CV-analys" först.
- **keywords-meta:** stryk "ats-poäng". Fältet har inget rankingvärde, men det får inte säga det vi förbjuder.
- **WebApplication:** `name` "Jobbcoach.ai CV-analys" kan stå kvar eller bli "Jobbcoach.ai CV-analys med läsbarhetspoäng"; `description`, `featureList` och `offers.description` skrivs om sant ("ATS-poäng", "fyra delar", "60 sekunder", "1 CV-analys gratis per konto" ut).
- **HowTo:** `description` och stegen 2 till 4 följer de nya synliga stegen exakt. `totalTime` får vara `PT1M` om stegtexten säger "under en minut" om förslagen (belagt i `analysTexter.ts:43-44`, "Tar under en minut"); annars stryks fältet. Steg 1:s text får meningen om Word och inskannade PDF:er.
- **H2 och H3 under "Vad vi kontrollerar":** byts (se rubrikbytena). Sju H3 med delarnas namn exakt som i produkten: Kontaktuppgifter, Personbeskrivning, Erfarenhet, Kompetenser, Utbildning, Språk, "Datum, ordning och längd".
- **FAQ:** tre frågor byts, en läggs till, ingen stryks (se rubrikbytena). Svaret på "Vad betyder läsbarhetspoängen?" är det enda stället i brödtexten där "rekryteringssystem (ATS)" står som förklaring.

### Risk per post

| Post | Risk | Varför |
|---|---|---|
| CVA-1 | **HÖG** | En H2 och sex H3 byts mot en H2 och sju H3; utan undantag fäller grinden, och texten under är en stor del av sidans 869 ord. |
| CVA-2 | MEDEL | Ändrar featureList, HowTo-steg 3, FAQ-svar och löftesraden; inga sökfrågor bär "fyra delar", men tre schemablock ändras. |
| CVA-3 | **HÖG** | "ATS-poäng" står i en HowTo-rubrik (H3 "Få ATS-poäng och förslag") och i en FAQ-fråga; sidan har visningar på "ats anpassat cv" och "ats granskare". |
| CVA-4 | MEDEL | HowTo-steg 2, ingressen och FAQ-svar; ingen sökfråga bär "nyckelord" på sidan, men ingressen är den mest lästa texten. |
| CVA-5 | **HÖG** | Metabeskrivningen, offers, H2 i slutblocket och en FAQ-fråga ("Hur många analyser får jag göra gratis?") ändras samtidigt. |
| CVA-6 | MEDEL | FAQ-frågan "Kan jag köra analysen igen när jag ändrat i CV:t?"; byts den krävs FAQ_BYTT. |
| CVA-7 | **HÖG** | Skissen stryker FAQ-frågan "Hur lång tid tar en CV-analys?", vilket fäller grinden, och HowTo-rubriken "Vi analyserar i bakgrunden" byts. |
| CVA-8 | LÅG | Bara steg 1:s text; meningen om inskannade PDF:er läggs till (fler ord, inget försvinner). |
| CVA-9 | MEDEL | HowTo-rubriken "Spara den förbättrade versionen" byts och FAQ-svaret "Vad händer efter analysen?" skrivs om. |
| CVA-10 | LÅG | Ett FAQ-svar får en mening till. |
| CVA-11 | LÅG | Mini-analysens resultatruta visas först efter uppladdning och läses inte av Google. |
| CVA-12 | LÅG | Samma ruta som CVA-11. |

**Krav på HÖG-posterna:**
- **CVA-1:** H2 "Sex saker rekryteraren och systemet ser först" blir "Sju delar som ger din läsbarhetspoäng". De sex H3 skrivs i `RUBRIK_BYTT` (sex par, den sjunde H3 som ny rubrik). Varje del får en egen text på minst samma längd som dagens kategori (dagens sex texter är cirka 20 till 30 ord vardera), så att orden inte sjunker. Projektledarexemplet (Sara Lindström) får gärna bära siffrorna.
- **CVA-3:** HowTo-rubriken blir "Se läsbarhetspoängen och vad som saknas". FAQ-frågan blir "Vad betyder läsbarhetspoängen?" i `FAQ_BYTT`. Svaret innehåller "rekryteringssystem (ATS)" en gång. Ingen annan mening på sidan säger "ATS".
- **CVA-5:** Description enligt ramen ovan, i `META_BYTT`. FAQ-frågan blir "Vad är gratis i CV-analysen?" (inte skissens "Hur mycket är gratis?", som inte säger vad frågan gäller när den visas fristående i Google). Slutblockets H2 enligt rubrikbytena.
- **CVA-7:** FAQ-frågan "Hur lång tid tar en CV-analys?" **står kvar** med ett sant svar: poängen och genomgången visas när CV:t är uppladdat och sparat, och Jobbcoachens förslag tar under en minut. HowTo-rubriken "Vi analyserar i bakgrunden" blir "Vi går igenom sju delar", i `RUBRIK_BYTT`.

### Ordantal

869 ord, gräns cirka 17 ord. **Risken är hög.** Skissen stryker tidsangivelser, en FAQ-fråga och sex kategoritexter. Kraven ovan (FAQ:n kvar, sju deltexter i stället för sex, meningen om inskannad PDF, ny sektion "Vägen till 100 poäng") gör att sidan bör gå upp i ord, inte ned. Räkna före och efter.

---

## 2. Gemensamma källor (GEM-1 till GEM-13)

Posterna syns på /priser, /funktioner, startsidan, artiklarnas reklamkort och registreringen. Rankingdata per sida står under respektive sida. Här bara risken.

| Post | Risk | Varför |
|---|---|---|
| GEM-1 | MEDEL | Gratiskällan når startsidans FAQPage-svar ("Vad kostar det, och vad får jag utan att betala?"); frågan står, svaret ändras, så `LD_UNDANTAG` för `/` med FAQPage. |
| GEM-2 | LÅG | Kort tillägg om att de två senaste breven går att ändra; ingen rubrik eller fråga. |
| GEM-3 | LÅG | Tillägg i listan; fler ord, inga rubriker. |
| GEM-4 | MEDEL | Premiumlistan når /priser Product-schemats `highlights`; schemat ändras och kräver undantag för Product. |
| GEM-5 | MEDEL | Når FAQPage-svaret "Vad kostar LinkedIn-optimeringen?" på /verktyg/linkedin-optimering (frågan står). |
| GEM-6 | LÅG | OG-undertitel och sidokort; ingen rankingbärande text. |
| GEM-7 | MEDEL | Synlig text i stationerna på /priser och /funktioner; texten om nyckelord och fyra delar är lång och får inte ersättas med kortare. |
| GEM-8 | LÅG | En rad i brevets station. |
| GEM-9 | LÅG | Lägger till "eller Word"; fler ord. |
| GEM-10 | MEDEL | En av de sju matchningsraderna; måste gå i samma push som de andra sex (R7). |
| GEM-11 | LÅG | En mening om Jobbcoachen, ingen rubrik. |
| GEM-12 | LÅG | Nya kort för Sökta tjänster och Inför intervjun ger fler ord och fler interna länkar, inget försvinner. |
| GEM-13 | LÅG | En rad i Kom igång-listan. |

Krav för hela gruppen: källfilerna (`gratis-copy.ts`, `plans.ts`, `paket-copy.ts`) är de enda ställena där talen och listorna bor. Rätta där, så att /priser, /funktioner, startsidan och reklamen säger samma sak (R6).

---

## 3. /priser

### Vad sidan rankar på i dag

| Period | Klick | Visningar | Position |
|---|---|---|---|
| 28 dagar | 1 | 70 | 15,2 |
| 90 dagar | 1 | 180 | 10,8 |

Sökfrågor 90 dagar: "skriva personligt brev online pris" 41 v, p 7,5; "vad kostar rekryteringsverktyg" 10 v, p 78,4; "cv skriven av expert pris" 8 v, p 8,8; "cv-pris i sverige" 7 v, p 7,7; "personligt brev pris i sverige" 7 v, p 4,4; "jobbcoach" 5 v, p 3,0.

### Får inte röras

- Titeln "Priser: Jobbcoach Premium, 149 kr i månaden | Jobbcoach.ai" och H1 "Jobbcoach Premium, 149 kr i månaden".
- H2 "Allt i Premium", "Vill du se först?", "Vad du faktiskt får, funktion för funktion", "Hjälpredan Kom igång tar dig igenom allt i rätt ordning", "Vad som ingår, rad för rad", "Fler frågor om priset?". H3 "Rekryteringstester", "CV-analysen", "Personliga brev", "Matchade jobb", "Jobbcoachen".
- FAQ-frågorna "Vad ingår i Jobbcoach Premium?", "Vad händer när månaden är slut?", "Kan jag börja gratis?", "Hur säger jag upp?".
- Orden **"personliga brev"** och **"149 kr"** i description (de bär de enda sökfrågorna med position under 10).
- Schematyperna Product, AggregateOffer, Offer, FAQPage, Organization.

### Får och bör ändras

- **Description** (PRI-9): får ta in Jobbsöket så länge den håller 110 till 158 tecken och "personliga brev" och "149 kr i månaden" står kvar. Dagens 148 tecken ger litet utrymme; byt hellre "Jobbcoachen" mot "Jobbsöket" än att förlänga, om Jobbcoachen ändå nämns som del av Jobbsöket på sidan. Inga kampanjord.
- **Ny H3 "Sökta tjänster"** i "Vad du faktiskt får" är välkommen (GEM-12). Nya rubriker på /priser fäller inte grinden.
- **Jämförelsetabellen** (PRI-1, PRI-5 till PRI-7, PRI-11): radernas etiketter "CV-analys", "CV-nedladdning", "Personliga brev", "Matchade jobb", "Jobbcoachen", "Intervjuprovet" står kvar. Underraden "poäng, fynd, nyckelord" byts.
- **FAQ-svaret "Vad ingår i Jobbcoach Premium?"** (PRI-8) ska nämna "uppföljningsmejl" och "rapport till Arbetsförmedlingen" (beslut 4) och säga samma sak som listan och tabellen.

### Risk per post

| Post | Risk | Varför |
|---|---|---|
| PRI-1 | LÅG | Tabellrad; etiketten "CV-analys" står kvar. |
| PRI-2 | LÅG | Tre synliga steg i stationen, ingen rubrik. |
| PRI-3 | LÅG | Tonraden; inga sökfrågor på toner. |
| PRI-4 | LÅG | Lägger till Word. |
| PRI-5 | LÅG | Lägger till Word i tabellen. |
| PRI-6 | LÅG | Tabellrad. |
| PRI-7 | LÅG | Nya rader i tabellen, fler ord. |
| PRI-8 | MEDEL | FAQPage-svar; frågan står, Product och FAQPage ska säga samma sak. |
| PRI-9 | MEDEL | Metabeskrivningen på en sida med position 4 till 8 på pris-frågor om personliga brev. |
| PRI-10 | LÅG | Siffrorna i "Gratisnivån i siffror". |
| PRI-11 | LÅG | Tabellrad. |

### Ordantal

1 224 ord, gräns cirka 24 ord. Låg risk: nästan alla poster lägger till.

---

## 4. /funktioner

### Vad sidan rankar på i dag

| Period | Klick | Visningar | Position |
|---|---|---|---|
| 28 dagar | 0 | 182 | 69,9 |
| 90 dagar | 0 | 259 | 60,6 |

Sökfrågor 90 dagar: "cv hjälp" 44 v, p 81,0; "verktyg för rekrytering" 31 v, p 69,2; "hjälp med cv" 30 v, p 86,2; "online rekryteringsverktyg" 17 v, p 63,2; "rekryteringsverktyg" 13 v, p 81,4; "jobbmatchning" 4 v, p 51,5. Sidan rankar inte på något den kan vinna i dag.

### Får inte röras

- Titeln "Funktioner: alla verktyg för jobbsöket | Jobbcoach.ai" och description (ändrad 2026-10-12, sann).
- H1 "Allt du behöver för att landa nästa jobb".
- H2 "Rekryteringstester", "Personliga brev", "CV-analysen", "Ett CV som både systemet och rekryteraren läser", "Jobben hittar dig, och du går förberedd in i intervjun.", "Matchade jobb", "Jobbcoachen", "Bli hittad på LinkedIn", "Alla verktyg, samlade", "Vanliga frågor". H3 "40 mallar, 2 gratis", "Foto och LinkedIn där mallen stöder det".
- FAQ-frågorna, alla fem, bland dem "Hur ofta uppdateras jobbmatchningen?".
- Ankaret `#sokta-tjanster` (startsidan länkar dit).

### Får och bör ändras

- H3 "Bygg CV:t steg för steg" och "Ladda ner som PDF" byts (FUN-7, FUN-8; se rubrikbytena sist).
- Eyebrow-raden "Bara i Jobbcoach Premium, 149 kr i månaden" (FUN-3) är ingen rubrik i trädet och får skrivas om fritt inom sanningen (beslut 8).
- FAQ-svaret på "Hur ofta uppdateras jobbmatchningen?" blir R7:s två meningar.
- OG- och twitter-description (FUN-10) får ta in Sökta tjänster; "Åtta verktyg" får inte komma tillbaka.

### Risk per post

| Post | Risk | Varför |
|---|---|---|
| FUN-1 | MEDEL | FAQPage-svar och en av de sju matchningsraderna; frågan står. |
| FUN-2 | MEDEL | FAQPage-svar om gratisnivån; frågan står. |
| FUN-3 | LÅG | Eyebrow, inte H2. |
| FUN-4 | LÅG | Kortets text; ankaret `#sokta-tjanster` måste stå kvar. |
| FUN-5 | LÅG | Gratisraden i brevets station. |
| FUN-6 | LÅG | Länklistans underrad. |
| FUN-7 | MEDEL | H3 "Bygg CV:t steg för steg" byts och kräver RUBRIK_BYTT; samma rad på registreringen saknar SEO-värde. |
| FUN-8 | MEDEL | H3 "Ladda ner som PDF" byts och kräver RUBRIK_BYTT; bytet lägger till "Word", ett sökord. |
| FUN-9 | LÅG | Lägger till figurserier. |
| FUN-10 | LÅG | Ankare och OG-text; fler länkar, inga borta. |

### Ordantal

1 065 ord, gräns cirka 21 ord. Låg risk.

---

## 5. Startsidan /

### Vad sidan rankar på i dag

| Period | Klick | Visningar | Position |
|---|---|---|---|
| 28 dagar | 7 | 483 | 34,3 |
| 90 dagar | 42 | 1 435 | 27,2 |

Sökfrågor 90 dagar: "ai cv" 243 v, p 24,1; "jobbcoach" 1 k, 109 v, p 54,4; "cv hjälp" 98 v, p 66,2; "hjälp med cv" 67 v, p 70,9; "jobb match" 61 v, p 35,0; "jobbmatch ai" 59 v, p 7,3; "ai jobbansökan" 45 v, p 25,5; "skapa cv med ai" 24 v, p 22,3; "jobb match ai" 15 v, p 8,2; "personligt brev ai" 11 v, p 17,8.

Det enda startsidan rankar bra på är **"jobbmatch ai"** (p 7 till 8). Den visas också på "ai cv", men långt ned.

### Får inte röras

- Titeln "Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester". Den är sann. (Bindestrecket i titeln är ett tecken i metadata, inte löptext; titeln rörs inte i den här omgången.)
- H1 "Därför får du inte svar på dina ansökningar", H2 alla åtta i samma ordning, H3 "Rekryteringstester", "CV-analys", "Jobbmatchning". Skissen håller det.
- De fem FAQ-frågorna, bland dem "Vad är ATS, och varför ska mitt CV vara anpassat?" (startsidan är inte /verktyg/cv-analys; ATS-förklaringen här är sann och står kvar).
- Ordet **"Jobbmatchning"** som H3 och ordet **"AI"** i den löptext som finns (citatet om Teamtailor och EU:s klassning av AI-rekrytering). Det är det som bär "jobbmatch ai" och "ai cv".
- De fyra medielänkarna och de nio länkarna i "Och resten av jobbsöket".
- Organization, WebSite, FAQPage.

### Får och bör ändras

- **Description** ("Skapa ATS-anpassade CV:n och personliga brev ..."): inte osann. Den får skrivas om för att sätta rekryteringstesterna först, men det är inget SEO-krav. Skrivs den om ska "CV", "personliga brev", "jobbmatchning" och "rekryteringstester" stå kvar, 110 till 158 tecken.
- STA-1 till STA-8 är synlig löptext utan rubriker. Byt mening mot mening.
- FAQ-svaret om gratisnivån (GEM-1, GEM-3) ändras, frågan står.

### Risk per post

| Post | Risk | Varför |
|---|---|---|
| STA-1 | MEDEL | Den längsta osanna meningen på sidan (cirka 40 ord) i CV-analysens station; ersätts den med en kort rad sjunker orden. |
| STA-2 | LÅG | Ingressen. |
| STA-3 | LÅG | Raden under knappen. |
| STA-4 | MEDEL | En av de sju matchningsraderna, i stationen under H3 "Jobbmatchning" som bär sidans bästa sökfråga; ordet "jobbmatchning" och "träffar" ska stå kvar i stycket. |
| STA-5 | LÅG | En mening om Jobbcoachen. |
| STA-6 | LÅG | Samma text som på /funktioner; byts på båda i samma push. |
| STA-7 | LÅG | Raden i "Och resten av jobbsöket"; länken står. |
| STA-8 | LÅG | Premiumblocket. |

### Ordantal

1 034 ord, gräns cirka 20 ord. **Risken är medel till hög.** Skissens not säger att styckena "förkortade bara där de var osanna". Det räcker inte: varje förkortning måste vägas upp. STA-1 och skissens borttagna rad "Ett nivåtest visar var du står" (cirka sex ord) är de som tär. Den nya Sökta tjänster-blocket och Premiumraden om uppföljningsmejl och rapport ger tillbaka; räkna före och efter.

---

## 6. /verktyg/personligt-brev

### Vad sidan rankar på i dag

| Period | Klick | Visningar | Position |
|---|---|---|---|
| 28 dagar | 1 | 199 | 18,6 |
| 90 dagar | 2 | 307 | 25,2 |

Sökfrågor 90 dagar: "personligt brev mall gratis" 52 v, p 17,2; "gratis personligt brev" 50 v, p 26,1 (28 dagar: 31 v, p 12,3); "mall för personligt brev" 18 v, p 29,9; "mall personligt brev" 12 v, p 25,8; "hjälp med personligt brev" 11 v, p 31,4; "personligt brev ai" 8 v, p 33,4.

### Får inte röras

- Title, description, H1 "Skräddarsy ditt brev till varje annons".
- **H3 "Ett brev gratis"** och FAQ-frågan **"Hur många brev kan jag skapa gratis?"**: de bär "gratis personligt brev", sidans växande sökfråga. Båda är sanna (första brevet är gratis).
- H2 "40 mallar för personliga brev" och mallarnas H3.
- HowTo-stegen "Välj ditt CV", "Klistra in jobbannonsen", "Välj mall och ton", "Kopiera eller ladda ner brevet" (BRV-2: kartläggningen kallar det en tolkningsfråga och säger att inget är osant; då rörs de inte).

### Får och bör ändras

- FAQ-svaret och resultatkortet (BRV-1) får meningen om att de två senaste breven går att ändra. Ordet "gratis" ska stå kvar i båda.
- Twitter-description får rättas fritt.

### Risk per post

| Post | Risk | Varför |
|---|---|---|
| BRV-1 | MEDEL | FAQPage-svaret och kortet under H3 "Ett brev gratis" ligger på sidans enda växande sökfråga; bara tillägg, "gratis" kvar. |
| BRV-2 | LÅG | Om stegen lämnas som de är. Ändras HowTo-rubrikerna blir risken HÖG; SEO säger nej till det. |

### Ordantal

1 100 ord, gräns cirka 22 ord. Låg risk.

---

## 7. /verktyg/jobbmatchning

### Vad sidan rankar på i dag

| Period | Klick | Visningar | Position |
|---|---|---|---|
| 28 dagar | 6 | 331 | 13,4 |
| 90 dagar | 15 | 939 | 12,9 |

Sökfrågor 90 dagar: "jobbmatchning" 194 v, p 8,0 (28 dagar: 71 v, p 3,7); "jobb match" 1 k, 87 v, p 11,2; "jobb match ai" 74 v, p 7,6; "jobb matchningar" 66 v, p 27,5; "cv hjälp" 41 v, p 61,8; "job match ai" 7 v, p 8,6; "cv optimeraren" 3 v, p 7,3.

Det här är den verktygssida som har mest att förlora. "jobbmatchning" har gått från p 8 till p 3,7.

### Får inte röras

- Titeln "Jobbmatchning: lediga jobb som passar ditt CV | Jobbcoach.ai" och description (båda sanna).
- H1 "Hitta jobb som matchar ditt CV automatiskt". CV:t läses in automatiskt och matchningen sker utan att användaren söker själv; jag bedömer H1 som sann.
- H2 "Tre träffar gratis, med skälen", "Så fungerar det", "Sex datapunkter ur ditt CV", "Sex skäl att låta oss söka åt dig", "Från träff till ansökan", "Hitta ditt nästa jobb automatiskt.", "Vanliga frågor om att söka jobb".
- H3 "Vi extraherar yrkesdata", "Vi söker tusentals annonser", "Du får jobben sorterade", de sex datapunkterna, de sex skälen, **också "Uppdaterat varje dag"** (annonserna hämtas tre gånger per dygn, så rubriken är sann; texten under är det inte).
- Alla åtta FAQ-frågor, bland dem "Hur ofta uppdateras jobbannonserna?" och "Behöver jag ladda upp ett CV?".
- Orden "jobbmatchning", "matchar", "lediga jobb", "Arbetsförmedlingen" i löptexten.

### Får och bör ändras

- H3 och HowTo-steg 1 "Aktivera ditt CV" byts (JM-1; se rubrikbytena). HowTo `description` "Fyra steg från aktiverat CV ..." skrivs om.
- Texten under "Uppdaterat varje dag", featureList "daglig uppdatering", hjältens tal och FAQ-svaret om uppdatering säger R7:s två meningar.
- FAQ-svaren med "aktivera" (JM-2) skrivs om; frågorna står.

### Risk per post

| Post | Risk | Varför |
|---|---|---|
| JM-1 | **HÖG** | Ordet "aktivera" står i en H3, HowTo-steg 1, HowTo-beskrivningen, hjälten, provkortet, slutblocket och länklistan på sidan med p 3,7 på "jobbmatchning". |
| JM-2 | MEDEL | Tre FAQ-svar; frågorna står. |
| JM-3 | MEDEL | En av de sju matchningsraderna, i slutblocket. |
| JM-4 | MEDEL | FAQ-svaret "Hur ofta uppdateras jobbannonserna?", featureList och skälets text; H3 står. |
| JM-5 | LÅG | En punkt i provkortet. |
| JM-6 | LÅG | Länkar och text läggs till i "Från träff till ansökan". |

**Krav på JM-1:** bara H3 och HowTo-steg 1 får nytt namn, "Välj eller ladda upp ditt CV" (i `RUBRIK_BYTT`). Övriga tre steg står ordagrant. Varje mening med "aktivera" byts mot en mening av samma längd som säger vad som händer (senaste CV:t läses in, "Byt CV", "Hitta jobb som passar"). Ordet "CV" ska stå kvar i varje mening där "aktivera ditt CV" stod, och länktexten i länklistan ska fortsatt innehålla "jobbmatchning" eller "träffar". Inga nya H2.

### Ordantal

1 031 ord, gräns cirka 21 ord. Låg risk om kravet ovan följs.

---

## 8. /verktyg/jobbcoachen

### Vad sidan rankar på i dag

| Period | Klick | Visningar | Position |
|---|---|---|---|
| 28 dagar | 0 | 22 | 10,5 |
| 90 dagar | 7 | 157 | 31,3 |

Sökfrågor 90 dagar: "karriärcoaching" 36 v, p 98,3; "karriärrådgivning" 3 v, p 30,3; "karriärcoaching online" 3 v, p 88,3. Sidan rankar i praktiken inte.

### Får inte röras

Title, description, H1 "Karriärrådgivning från någon som faktiskt kan svensk arbetsmarknad", alla H2 och H3 (bland dem "Ställ frågan" och de sex områdena), alla åtta FAQ-frågor, bland dem "Kan jag dela mitt CV med Jobbcoachen?".

### Får och bör ändras

Slutblocket (JC-1) och ett tillägg om frågorna utifrån läget i de sökta tjänsterna (JC-2), gärna som en mening i HowTo-steget "Ställ frågan" och i FAQ-svaret "Hur fungerar Jobbcoachen?".

| Post | Risk | Varför |
|---|---|---|
| JC-1 | LÅG | Slutblockets mening. |
| JC-2 | LÅG | Tillägg i text, HowTo-steg och FAQ-svar; rubriker och frågor står. |

Ordantal: 1 005 ord, gräns cirka 20. Låg risk.

---

## 9. /verktyg/skapa-cv

### Vad sidan rankar på i dag

| Period | Klick | Visningar | Position |
|---|---|---|---|
| 28 dagar | 3 | 672 | 39,2 |
| 90 dagar | 9 | 1 485 | 38,5 |

Sökfrågor 90 dagar: "cv byggare" 115 v, p 40,3; "skriv cv online" 93 v, p 41,2; "cv gratis" 77 v, p 51,3; "cv online" 75 v, p 25,2; "cv-skapare" 70 v, p 57,0; "cv online gratis" 62 v, p 29,6; "skapa cv gratis" 62 v, p 37,2; "cv-online" 60 v, p 27,8; "gratis cv online" 60 v, p 32,2.

### Får inte röras

Title "Skapa CV gratis: skriv direkt på arket, PDF eller Word", description, H1 "Skapa ditt CV gratis på minuter", alla H2 och H3, alla FAQ-frågor. Orden "gratis", "online", "CV-byggaren".

| Post | Risk | Varför |
|---|---|---|
| SCV-1 | LÅG | "Mina CV" blir "Ditt CV" i en mening och ett FAQ-svar. |
| SCV-2 | LÅG | FAQ-svaret på "Är det gratis att skapa CV online hos er?" får "eller Word"; "gratis" och "online" står kvar. |
| GEM-5 (slutblocket) | LÅG | "hela CV-analysen" byts i slutblocket. |

Ordantal: 1 027 ord, gräns cirka 21. Låg risk.

---

## 10. /verktyg/linkedin-optimering

90 dagar: 0 klick, 146 v, p 13,2. Sökfrågor: "köpa hjälp med linkedin-profil online" 32 v, p 6,9; "optimering af linkedin" 17 v; "linkedin optimering" 14 v, p 27,6.

Bara GEM-5 berör sidan: slutblocket och FAQ-svaret "Vad kostar LinkedIn-optimeringen?". Frågan står. Risk MEDEL för FAQPage-svaret (undantag krävs), LÅG för ranking. Ordantal 1 154, gräns cirka 23.

---

## 11. Mallar och exempel (EX-1)

/cv-exempel 90 dagar: 1 klick, 1 026 v, p 40,1 ("cv exempel" 233 v, p 34,4). /exempel: 0 klick, 1 760 v, p 52,8 ("cv exempel" 271 v, p 46,7).

| Post | Risk | Varför |
|---|---|---|
| EX-1 | LÅG | Ett FAQ-svar på /cv-exempel (frågan står) och ett slutband på /exempel; `LD_UNDANTAG` med FAQPage för /cv-exempel. |

Ordantal /cv-exempel 2 308, gräns cirka 46. Ingen risk.

---

## 12. Informationssidor (INF-1 till INF-3)

/integrationer 90 dagar 15 v; /om-oss 65 v, 1 klick, p 11,8; /hjalpcenter 29 v, p 29,7.

| Post | Risk | Varför |
|---|---|---|
| INF-1 | LÅG | /integrationer har nästan inga visningar och länkas inte från menyn; rätta texten, adressen står. |
| INF-2 | LÅG | Tillägg i historiken på /om-oss (300 ord, gräns 6 ord: byt inget, lägg bara till). |
| INF-3 | LÅG | Metabeskrivning och kort på /hjalpcenter; description kräver `META_BYTT`, och sidan har bara 55 ord, så inget kort får strykas. |

---

## 13. Menyn och sidfoten (NAV-1)

Risk MEDEL. Inga sökfrågor gäller menyn, men ramen bär den sajtövergripande internlänkningen och ankartexterna. Grinden skriver ut ramens skillnader men fäller inte på dem, så kraven här måste hållas för hand. Se avsnittet "Menyn och foten" sist.

---

## 14. Registrering (REG-1 till REG-5)

/register 90 dagar: 35 v, p 2,1 (varumärkessök). Panelerna efter ett prov och steg 3 på /dashboard/valkommen ligger bakom formulär eller inloggning.

| Post | Risk | Varför |
|---|---|---|
| REG-1 | LÅG | Panel på /register, ingen rankingbärande text. |
| REG-2 | LÅG | Inloggat steg, indexeras inte. |
| REG-3 | LÅG | Registreringens kort. |
| REG-4 | LÅG | Registreringens kort. |
| REG-5 | LÅG | Spärrtext under provresultatet; indexeras inte som eget innehåll. |

---

## 15. Artiklarnas reklam (REK-1 till REK-4)

Reklamkorten ligger i `main` på alla artiklar och räknas i ordantalet. Deras rubriker är undantagna i grinden (`TILLATNA_RUBRIKER`), texten är det inte.

| Post | Risk | Varför |
|---|---|---|
| REK-1 | MEDEL | Kortet syns på många artiklar; blir texten kortare sjunker orden på alla samtidigt. Krav: samma längd, plus minus fem ord. |
| REK-2 | MEDEL | Samma skäl som REK-1. |
| REK-3 | LÅG | En mening i karriärklustrets kort. |
| REK-4 | LÅG | Slutkortets lista får rader, inte färre. |

---

## 16. Artiklarna

För alla artiklar: R1 till R8 gäller. Ingen H2, H3, FAQ-fråga eller HowTo-text rörs om inte posten säger det. `dateModified` sätts till byggdagen. Den osanna meningen byts mot en sann mening av samma längd i samma stycke. Länkar står kvar.

### 16.1 `jobbcoach-online` (ART-1 till ART-6)

90 dagar: 0 klick, 61 v, p 9,3. seoTitle "Jobbcoach online gratis: AI-hjälp på 60 sekunder" (48 tecken). Sökfrågor: "karriärcoaching online" 4 v, p 24.

- **Får inte röras:** seoTitle (den gäller hela tjänsten, inte CV-analysens tid; "60 sekunder" är inte ett påstående om analysen), description, alla H2 och H3 (bland dem "### 4. CV-analys och feedback", "### Steg 1: Testa CV-analysen (5 minuter)"), alla sex FAQ-frågor.
- **Bör ändras:** tabellen "De sex kategorier vi ger förslag inom" (rad 289 till 333) byts mot de sju delarna, inte stryks. "ATS-kompatibilitet" och "Nyckelord" som kategorier försvinner; rätt läge för ordet ATS är en förklarande mening.

| Post | Risk | Varför |
|---|---|---|
| ART-1 | MEDEL | Tabell, FAQ-svar och exempelruta; liten trafik, men tabellen är många ord och får bara ersättas med en lika lång. |
| ART-2 | LÅG | Gratis-meningarna i löptext och kort. |
| ART-3 | MEDEL | En av de sju matchningsraderna. |
| ART-4 | LÅG | Tillägg om de två senaste breven. |
| ART-5 | MEDEL | FAQ-svaret om engelska CV (frågan "Kan jag använda online jobbcoach om jag söker jobb utomlands?" står). |
| ART-6 | LÅG | Listor får rader. |

Ordantal 6 045, gräns cirka 120. Låg risk.

### 16.2 `vad-ar-en-jobbcoach` (ART-7 till ART-9)

90 dagar: 0 klick, 182 v, p 20,1. Sökfrågor: "jobbcoach" 82 v, p 33,1; "vad gör en jobbcoach" 17 v, p 5,5; "jobbcoach lön" 13 v, p 14,8; "lön jobbcoach" 4 v; "digital jobbcoach" 3 v.

- **Får inte röras:** seoTitle "Vad är en jobbcoach? Så funkar det och vad det kostar 2026", description, H2 (bland dem "Så fungerar Jobbcoach.ai: Steg-för-steg guide"), FAQ-frågorna, också **"Hur vet jag om mitt CV är ATS-optimerat?"** och **"Vad kostar Jobbcoach.ai?"**. Allt om vad en jobbcoach gör och tjänar.
- **Bör ändras:** svaren på de två frågorna ovan och raderna 203, 557, 579, 587, 643, 655, 869, 886 till 893.

| Post | Risk | Varför |
|---|---|---|
| ART-7 | MEDEL | Tre FAQ-svar i FAQPage; frågorna står. Svaret på ATS-frågan får inte längre lova en nyckelordskontroll. |
| ART-8 | MEDEL | En av de sju matchningsraderna. |
| ART-9 | MEDEL | FAQ-svar (rad 23) och sju verktyg i "Så fungerar Jobbcoach.ai"; listan får en punkt, ingen tas bort. |

Ordantal 5 695, gräns cirka 114. Låg risk.

### 16.3 `ai-jobbmatchning` (ART-10 till ART-12)

| Period | Klick | Visningar | Position |
|---|---|---|---|
| 28 dagar | 1 | 671 | 7,1 |
| 90 dagar | 4 | 1 209 | 8,7 |

Sökfrågor 90 dagar: "jobbmatch ai" 2 k, 800 v, p 6,2; "jobbmatchning" 38 v, p 44,9; "jobbmatch.ai" 30 v, p 6,1; "jobb match" 29 v, p 45,4.

Sidan är den enskilt viktigaste för matchningsorden: 800 visningar på "jobbmatch ai" på sida ett.

- **Får inte röras:** seoTitle "AI-jobbmatchning: så fungerar det och så använder du den", description, H2 "Problemet med sökrutan", "Så fungerar matchningen, steg för steg", "Så får du bättre matchningar: mata motorn rätt", "Vad AI-matchningen är bra på, och vad den inte är", "Matchningen i ett smart jobbsökarflöde". Alla sex FAQ-frågor. De fyra fetstilta stegen ska förbli fyra, numrerade 1 till 4.
- **Bör ändras:** "aktiverar" i FAQ-svaret (rad 15) och den synliga kopian (rad 107), steg 1 (rad 51), rad 69, rad 97, och "när du öppnar sidan" (rad 57).

| Post | Risk | Varför |
|---|---|---|
| ART-10 | **HÖG** | FAQ-svaret "Hur fungerar jobbmatchning med AI i praktiken?" och stegrubriken "**1. Du aktiverar ditt CV.**" ligger i den artikel som har sajtens bästa position på matchningsorden. |
| ART-11 | MEDEL | En av de sju matchningsraderna, i steg 4. |
| ART-12 | LÅG | Rådet om tre högar får en mening om Spara till Ska sökas och Markera som sökt. |

**Krav på ART-10:** FAQ-frågan och de fyra stegens antal och ordning står. Steg 1 skrivs om till en lika kort fetstil som säger vad användaren gör (till exempel att CV:t läses in), utan "aktiverar". FAQ-svaret behåller formen "I vårt verktyg sker det i fyra steg:" och samma uppräkning, bara första ledet byts. Länken på rad 97 pekar fortsatt på `/verktyg/jobbmatchning`, och ankartexten innehåller fortsatt "jobbmatchningen". Ordet "AI" i stycken och rubriker rörs inte.

Ordantal 1 736, gräns cirka 35. Låg risk om kravet följs.

### 16.4 `din-digitala-jobbcoach` (ART-13)

90 dagar: 0 klick, 4 v. Risk LÅG: rad 159, 161, 173 och 175 rättas i löptext; FAQ-frågan "Är Jobbcoachen gratis?" står, HowTo rörs inte. Ordantal cirka 2 700 enligt MDX-räkning, gräns cirka 54.

| Post | Risk | Varför |
|---|---|---|
| ART-13 | LÅG | Löptext i en artikel utan visningar; HowTo och FAQ-frågor står. |

### 16.5 ART-14: nyckelordspåståenden i fjorton artiklar

| Artikel | 90 dagar | Det som bär artikeln (rörs inte) |
|---|---|---|
| `ats-vanligt-cv` | 12 k, 1 024 v, p 16,5 | "ats cv" 60 v, "ats lösning" 21 v, "vad är ats system" 16 v, p 16,5 |
| `cv-exempel-yrken` | 0 k, 340 v, p 61,4 | "cv exempel" 88 v |
| `cv-och-personligt-brev` | 1 k, 956 v, p 54,5 | "personligt brev" 89 v, "hjälp med cv och personligt brev" 54 v; FAQ rad 17 |
| `cv-profil-sammanfattning` | inga visningar | |
| `datorkunskaper-cv` | 6 k, 1 073 v, p 7,9 | "datorkunskaper i cv" 67 v, p 13,1; "god datorvana" p 5,0 |
| `fardigheter-cv-exempel` | 1 k, 663 v, p 40,1 | "färdigheter cv" 45 v, p 27,0 |
| `fardigheter-kompetenser-cv` | 4 k, 925 v, p 31,5 | "kompetenser cv" 70 v, p 26,9 |
| `hur-skriver-man-cv` | 0 k, 89 v, p 32,2 | |
| `nyckelord-i-cv` | 7 k, 527 v, p 7,2 | "nyckelord cv" 110 v, p 12,4 |
| `personligt-brev-kompetenser-egenskaper` | 6 k, 1 592 v, p 35,1 | "egenskaper" 105 v, p 31,2 |
| `skriva-cv-guide` | 0 k, 1 674 v, p 63,1 | "skriva cv" 104 v |
| `vanliga-cv-misstag` | 0 k, 36 v | |
| `hur-ska-ett-cv-se-ut` | 3 k, 351 v, p 27,5 | "hur ska ett cv se ut 2026" 16 v, p 8,6 |

| Post | Risk | Varför |
|---|---|---|
| ART-14 | MEDEL | Fjorton artiklar, tre av dem i grindens topplista; i `nyckelord-i-cv` handlar hela artikeln om nyckelord. |

**Krav:** bara meningen som beskriver **vår CV-analys** ändras. Artiklarnas egna råd om nyckelord, branschord och ATS är redaktionellt innehåll som rankar ("nyckelord cv" p 12) och står kvar. Den nya meningen får säga att Jobbcoachens förslag kan föreslå kompetenser att lägga till (belagt i `analysTexter.ts:75`), men aldrig att poängen eller genomgången jämför nyckelord. I `cv-och-personligt-brev` rad 17 ändras FAQ-svaret, frågan står. "ATS-kompatibilitet" i `hur-ska-ett-cv-se-ut` rad 279 byts mot läsbarhetspoäng. `skriva-cv-guide`s description ("nyckelorden som tar dig förbi ATS") är ett skrivråd, inte ett produktpåstående, och rörs inte.

### 16.6 `skriva-cv-guide` (ART-15)

Se tabellen ovan. FAQ-frågan "Hur får jag mitt CV förbi ATS-systemen?" står. I svaret (rad 17 och 233) blir "få ett ATS-poäng på 0-100" en läsbarhetspoäng av 100. Risk MEDEL (FAQPage i en artikel med 1 674 visningar, även om positionen är låg). Ordantal 3 218, gräns cirka 64.

| Post | Risk | Varför |
|---|---|---|
| ART-15 | MEDEL | FAQPage-svar; frågan står. |

### 16.7 ART-16: "hela analysen" i Premium (fyra artiklar)

`bra-cv-guide` 90 dagar 0 k, 383 v, p 59,5; `hur-ska-ett-cv-se-ut` se ovan; `cv-pa-engelska-resume` 0 k, 983 v, p 19,8 ("cv på engelska" 104 v, p 30,0; "cv mall engelska" 92 v, p 23,1); `cv-och-personligt-brev` se ovan.

| Post | Risk | Varför |
|---|---|---|
| ART-16 | LÅG | Löptext; inga rubriker eller frågor. Fetstilen "**djupgående CV-analys (Premium)**" i `cv-och-personligt-brev:190` är ingen rubrik. |

### 16.8 `soka-jobb-via-mail` (ART-17)

| Period | Klick | Visningar | Position |
|---|---|---|---|
| 28 dagar | 5 | 755 | 8,0 |
| 90 dagar | 21 | 2 343 | 8,2 |

Sökfrågor 90 dagar: "ämnesrad" 25 v, p 21,2; "hur skickar man cv via mail" 18 v, p 14,9; "skicka cv via mail" 13 v, p 21,3; "jobbansökan mail exempel" 10 v, p 11,1; "jobbansökan mail" 9 v, p 38,8; "spontanansökan mail exempel" 7 v, p 14,1; "intresseanmälan mall" 5 v, p 16,6; "följa upp jobbansökan via mail exempel" 1 v, p 29.

Den mest klickade sidan av alla som rörs i omgången, och den står i grindens topplista.

- **Får inte röras:** seoTitle "Skicka CV via mail: ämnesrad och exempel på jobbansökan", description, H1, alla åtta H2 (bland dem **"Uppföljning: så påminner du utan att tjata"**), alla sex FAQ-frågor (bland dem **"När och hur följer man upp en mejlansökan?"**), exempelmejlens text, ämnesradsformeln.
- **Ändras (beslutat):** "efter ungefär en vecka" blir "efter en till två veckor" på rad 21 (FAQ-svaret), rad 34 (snabbsvaret), rad 160 (löptexten under uppföljnings-H2) och rad 202 (den synliga FAQ:n). Bara tidsuttrycket byts i FAQ-svaret och snabbsvaret; ingen länk där.
- **Länken till uppföljningsmejlet** läggs i ett befintligt stycke under H2 "Uppföljning: så påminner du utan att tjata", lämpligen rad 160, som en mening. Länkmål: den nya sidan `/verktyg/sokta-tjanster` när den är live; tills dess `/funktioner#sokta-tjanster`. Ankartext med "uppföljningsmejl". Inte i FAQ, inte i HowTo (artikeln har ingen).
- **Exemplets rubrik** "Exempel: uppföljningsmejl efter en vecka" är ingen rubrik i trädet (`CVExample` ritar den som `<p>`, `src/components/mdx/CVExample.tsx:17`). Den kan stå kvar; exemplets egen text säger "För en dryg vecka sedan", vilket ryms i en till två veckor. Vill UX byta den är det fritt för SEO.

| Post | Risk | Varför |
|---|---|---|
| ART-17 | **HÖG** | Ändringen ligger i FAQ-svaret och snabbsvaret på den mest klickade sidan som rörs, och i ett stycke under H2:n som bär uppföljningsfrågorna. |

**Krav på ART-17:** exakt de fyra tidsuttrycken byts, plus en mening med länk i stycket på rad 160. Inga andra ord i FAQ-svaret eller snabbsvaret ändras. FAQ-frågan, H2:n och exemplen står. `LD_UNDANTAG` med BlogPosting och FAQPage. `dateModified` sätts.

Ordantal 2 452, gräns cirka 49. Ingen risk (orden ökar).

### 16.9 `uppfoljning-efter-intervju` (ART-18)

| Period | Klick | Visningar | Position |
|---|---|---|---|
| 28 dagar | 4 | 633 | 8,5 |
| 90 dagar | 7 | 1 247 | 9,4 |

Sökfrågor 90 dagar: "dålig känsla efter intervju" 10 v, p 41,5; "tack för ett trevligt samtal" 8 v, p 9,5; "besked efter intervju" 4 v; "efter intervju" 4 v; "följa upp intervju" 3 v, p 27,7; "hur man följer upp efter en anställningsintervju" 3 v, p 8,7.

- **Får inte röras:** seoTitle "Uppföljning efter intervju: tackmejl, mall & timing 2026", description, H1, alla nio H2, alla sex FAQ-frågor och svar, HowTo (`howto:` i frontmatter) och snabbsvaret. Rådet "5 till 7 arbetsdagar" stämmer med produkten och står.
- **Får ändras:** en mening om att produkten föreslår ett uppföljningsmejl sju dagar efter intervjun, i ett befintligt stycke under "Efter tackmejlet: tålamod och tajming" eller "När och hur gör man en ytterligare uppföljning?", med länk som i ART-17.

| Post | Risk | Varför |
|---|---|---|
| ART-18 | MEDEL | HowTo-artikel med 1 247 visningar; säker så länge HowTo, snabbsvar och FAQ inte rörs. |

Ordantal 3 216, gräns cirka 64. Ingen risk.

### 16.10 `personligt-brev-mall-gratis` (ART-19)

| Period | Klick | Visningar | Position |
|---|---|---|---|
| 28 dagar | 0 | 224 | 25,3 |
| 90 dagar | 0 | 331 | 38,6 |

Sökfrågor 90 dagar: "personligt brev mall" 113 v, p 15,2; "gratis personligt brev" 44 v, p 72,9; "personligt brev mall gratis" 36 v, p 75,9; "mall för personligt brev" 25 v, p 14,2; "personligt brev-mall" 18 v, p 19,5.

- **Får inte röras:** seoTitle "Personligt brev mall gratis: så ser en mall ut som fungerar", description, H2, alla elva FAQ-frågor, bland dem "Var hittar jag en gratis mall jag kan ladda ner som Word eller PDF?".
- **Ändras:** FAQ-svaret (rad 29) och den synliga FAQ:n (rad 343) får "eller Word" och att de två senaste breven går att ändra. Orden "gratis", "mall", "Word", "PDF" står kvar i svaret.

| Post | Risk | Varför |
|---|---|---|
| ART-19 | MEDEL | FAQPage-svaret på frågan som bär "Word eller PDF" i en artikel på p 15 för "personligt brev mall"; bara tillägg. |

---

## 17. Telefonskärmarna (TEL-1 till TEL-6)

Telefonerna är `aria-hidden` och bär ingen text för Google. Risken ligger i det som ersätter dem.

| Post | Risk | Varför |
|---|---|---|
| TEL-1 | LÅG | Ersätts av CV-arket. Krav: instrumentet har inga `h2`/`h3`; är det inte `aria-hidden` får det gärna bära sann text. |
| TEL-2 | LÅG | Ersätts av startsidans fyra kort och på /om-oss. Inga rubriker i korten. |
| TEL-3 | LÅG | Ersätts av träffen i Matchade jobb. |
| TEL-4 | LÅG | Ska bort från /verktyg/jobbmatchning; ersättaren får inte säga "aktivera". |
| TEL-5 | LÅG | Lönespannet ut (beslut 18); inga kronor i exempel. |
| TEL-6 | LÅG | "Uppgift N av M", "Svara", "Nästa". |

---

## Sammanställning: ordantal per sida

| Sida | Ord i main (senaste avtryck) | Gräns, 2 % | Risk att fälla |
|---|---|---|---|
| / | 1 034 | 20 | Medel till hög |
| /verktyg/cv-analys | 869 | 17 | Hög utan kraven, låg med dem |
| /priser | 1 224 | 24 | Låg |
| /funktioner | 1 065 | 21 | Låg |
| /verktyg/personligt-brev | 1 100 | 22 | Låg |
| /verktyg/jobbmatchning | 1 031 | 21 | Låg med kravet på JM-1 |
| /verktyg/jobbcoachen | 1 005 | 20 | Låg |
| /verktyg/skapa-cv | 1 027 | 21 | Låg |
| /verktyg/linkedin-optimering | 1 154 | 23 | Låg |
| /cv-exempel | 2 308 | 46 | Ingen |
| /om-oss | 300 | 6 | Låg, men bara tillägg |
| /hjalpcenter | 55 | 1 | Låg, men inget får strykas |
| Artiklarna | 1 736 till 6 045 | 35 till 120 | Låg; reklamkorten (REK-1, REK-2) är den gemensamma risken |

---

## Ny sida: /verktyg/sokta-tjanster

### Sökord

**GSC säger noll.** Sökningar på "aktivitetsrapport", "aktivitetsrapportera", "sökta jobb", "sökta tjänster", "ansökningslogg", "logga ansökningar", "hålla koll på ansökningar" och "uppföljning ansökan" ger inga visningar på hela sajten på 90 dagar. Den närmaste frågan vi har är "följa upp jobbansökan via mail exempel" (2 v, p 29,5, till två artiklar). Allt nedan om sökord är därför **min bedömning**, utan volymdata från verktyg.

Bedömning av sökavsikt:
- **"aktivitetsrapport", "aktivitetsrapport arbetsförmedlingen", "aktivitetsrapportera"**: mest navigerande (folk vill logga in hos Arbetsförmedlingen). En verktygssida kommer inte att ranka högt där; Arbetsförmedlingen äger ordet. Ordet ska ändå stå i H2, brödtext och FAQ, och den artikel om aktivitetsrapporten som beslut 19 lägger i innehållsplanen ska bära det som primärord och länka hit.
- **"sökta jobb", "lista över sökta jobb", "hålla koll på sökta jobb", "hålla koll på jobbansökningar"**: informations- och verktygsavsikt, låg konkurrens från Arbetsförmedlingen. **Primärord för sidan: "sökta jobb".** Produkten heter Sökta tjänster; "jobb" är ordet folk söker på, "tjänster" står i H1-närhet och i schemats namn.
- **"jobbansökningar excel", "mall för sökta jobb"**: folk som för listan själva. Bör nämnas i brödtexten ("i stället för ett kalkylark").
- **"följa upp jobbansökan", "uppföljningsmejl"**: stöds av `soka-jobb-via-mail` (p 8,2); sidan länkar dit och tvärtom.

### Title, description, H1

- **Title** (52 tecken): "Sökta jobb: håll koll på ansökningar | Jobbcoach.ai". Primärordet först, inga kampanjord.
- **Description** (förslag, 158 tecken, alltså på gränsen, kontrollera mot slutlig produkttext): "Logga varje jobb du söker, se var ansökningarna står och följ upp efter tolv tysta dagar. Gratis att börja, och underlaget till aktivitetsrapporten finns där." Måste säga sant att rapportens utskrift och kopiering är Premium någonstans på sidan, men behöver inte göra det i description. Får aldrig säga att vi skickar rapporten till Arbetsförmedlingen.
- **H1:** "Håll koll på varje jobb du har sökt".
- **Eyebrow:** "Sökta tjänster".
- **Adress:** `/verktyg/sokta-tjanster`, läggs i sajtkartan och i grindens `PUBLIKT_V2`.
- **Schema:** WebApplication (`name` "Jobbcoach.ai Sökta tjänster"), HowTo (stegen nedan, ordagrant synliga), FAQPage, BreadcrumbList "Hem / Verktyg / Sökta tjänster".

### H2-disposition

1. **H2 "Logga en sökt tjänst på en minut"** (handlingen, med provkort eller instrument).
2. **H2 "Så fungerar det"** med H3 som HowTo-steg: "Logga tjänsten du har sökt", "Spara annonser i Ska sökas", "Följ upp när det har varit tyst", "Ta fram månadens underlag".
3. **H2 "Se var varje ansökan står"**: statusarna (Sökt, Kallad till test, Intervju, Erbjudande med flera), tratten, veckans mål (förval tre).
4. **H2 "Uppföljningsmejlet efter tolv tysta dagar"**: utkastet öppnas i användarens egen e-post, vi skickar aldrig själva; första utkastet gratis, sedan Premium. Länk till `soka-jobb-via-mail` och `uppfoljning-efter-intervju`.
5. **H2 "Underlag till aktivitetsrapporten"**: de källverifierade fakta nedan, med länk till Arbetsförmedlingens sida. Vad som är gratis och vad Premium lägger till (radlistor, utskrift, kopiering).
6. **H2 "Från träff till sökt tjänst"**: kopplingen till Matchade jobb (Spara till Ska sökas, Markera som sökt) och till Personliga brev. Länkar till /verktyg/jobbmatchning och /verktyg/personligt-brev.
7. **H2 "Frågor om Sökta tjänster"**: förslag på frågor: "Kostar det något att logga sökta jobb?", "Skickar ni min aktivitetsrapport till Arbetsförmedlingen?" (svar: nej, du lämnar in den själv), "Vad ska stå i aktivitetsrapporten?", "När föreslår ni ett uppföljningsmejl?", "Kan jag dela listan med någon?".

Ordmål: i nivå med de andra verktygssidorna, 900 till 1 100 ord i `main` (bedömning, för att matcha mallen).

### Arbetsförmedlingens aktivitetsrapport: påståenden som kräver källa

Hämtat 2026-11-22 från [Aktivitetsrapportera, arbetsformedlingen.se](https://arbetsformedlingen.se/for-arbetssokande/arbetslos---vad-hander-nu/aktivitetsrapportera) och den engelska motsvarigheten [Report activities](https://arbetsformedlingen.se/other-languages/english-engelska/unemployed---what-happens-now/report-activities). Sidan visar inget datum för senaste uppdatering. Föreskriften bakom är [AFFS 2025:1](https://arbetsformedlingen.se/download/18.563fef47198c576afe11f23/1756712577836/AFFS-2025-1-arbetsformedlingens-foreskrifter-om-hur-en-sokande-ska-vara-anmald-som-arbetssokande.pdf) (inte läst i sin helhet).

| Påstående sidan kan göra | Belagt i källan | Källans ord |
|---|---|---|
| Rapporten lämnas mellan den 1:a och den 14:e varje månad | Ja | "tidigast den 1:a och senaste den 14:e varje månad" |
| Den gäller månaden innan | Ja | "rapportera de aktiviteter du gjorde månaden innan" |
| Alla sökta jobb ska med, också spontanansökningar och jobb Arbetsförmedlingen tipsat om | Ja | annonserade, ej annonserade och anvisade jobb |
| Också intervjuer, rekryteringsträffar, arbete och studier ska med | Ja | |
| Den lämnas på Mina sidor, med blankett per post eller på servicekontor, eller muntligt per telefon; inte per mejl | Ja | |
| Spara underlag i minst tre månader som visar att du sökt jobben | Ja | "Arbetsförmedlingen gör ibland kontroller" |
| Rapporten kan inte lämnas i efterhand | Ja | |
| Sen rapport kan ge varning eller dagar utan ersättning | Ja | Skriv det försiktigt och med länk, eller inte alls; det är Arbetsförmedlingens och a-kassans beslut. |
| Vilka uppgifter per jobb som krävs (arbetsgivare, titel, datum) | **Nej**, sidan anger det inte | Får inte påstås. Säg att vår lista har de uppgifterna, inte att Arbetsförmedlingen kräver dem. |
| Att vår rapport "godkänns" eller har rätt format | **Nej** | Får aldrig påstås. |
| Att vi skickar rapporten | Nej, och produkten gör det inte | Får aldrig påstås (beslut 4). |

**Krav:** varje mening om Arbetsförmedlingens regler länkar till eller hänvisar till sidan ovan, och artikeln eller sidan bär datumet då källan lästes. Kontrollera källan igen vid byggdagen och vid årsrevisionen i januari.

---

## Menyn och foten

Skisserna (`delar/mega.html`, `delar/fot.html`) grupperar efter Rekryteringstester, CV, Personliga brev och Jobbsöket. För internlänkningen betyder det:

**Vinster.**
- Personlighetstest (`/verktyg/personlighetstest`) och Personligt brev-exempel (`/personligt-brev-exempel`) får länkar från menyn. Båda är bra.
- Ingen adress som i dag har en ramlänk tappar den. Jag har jämfört `src/components/landing/nav-data.ts` (GRUPPER, LAS, FORETAG) mot skisserna: Personligt brev, CV-analys, Skapa CV, CV-mallar, LinkedIn-profilen, Jobbmatchning, Bli upptäckt, Jobbkartan, Rekryteringstester, Jobbcoachen, Räkna ut lön och skatt, Artiklar, CV-exempel, CV-mallar per yrke, Exempel och mallar, Insikter för rekryterare, Priser, Om oss, Funktioner, Kontakt, Hjälpcenter och För rekryterare finns alla kvar i menyn eller foten.

**Krav.**
1. **Ankartexterna står kvar som i dag**, eftersom de är sidornas primärord: "CV-analys", "Skapa CV", "CV-mallar", "Personligt brev", "Jobbmatchning", "Rekryteringstester", "Jobbcoachen", "Bli upptäckt", "LinkedIn-profilen", "Jobbkartan", "Räkna ut lön och skatt", "CV-exempel", "Personligt brev-exempel", "Insikter för rekryterare", "För rekryterare", "Priser". Underraderna i menyn (till exempel "Läsbarhetspoäng i sju delar") är fria så länge de är sanna.
2. **Priser** står kvar som egen länk med texten "Priser" i headern (skissen har det) och i foten (skissen har det i raden under loggan). Menyns "Se vad som ingår" får finnas som en extra länk, men ersätter inte.
3. **Sökta tjänster** länkas bara när `/verktyg/sokta-tjanster` är live. Tills dess pekar länken på `/funktioner#sokta-tjanster`, aldrig på en sida som leder till inloggning eller 404.
4. **Jobbcoachen** står under Jobbsöket i både menyn och foten. Skissens fot har den under Rekryteringstester, vilket säger emot menyn och produkten (Jobbcoachen hör till Jobbsöket).
5. **Räkna ut lön och skatt** och **Jobbkartan** hör inte till Rekryteringstester. Lägg dem under Jobbsöket eller i en egen rad med "Insikter för rekryterare" och "För rekryterare", som i menyns fot.
6. Menyns fotrad "Tester, CV, personliga brev, jobbmatchning och Jobbcoachen" har samma brist som GEM-6 (Jobbsöket saknas). Läs den ur samma källa som rättas, `plans.ts`.
7. "CV-mallar" och "CV-mallar per yrke" pekar båda på `/cv-mallar`. Det är ofarligt men slösar en länk; pekar "CV-mallar per yrke" på en sektion (`/cv-mallar#yrken` eller motsvarande ankare) blir det tydligare. Ingen av texterna får försvinna.
8. Ordningen i menyn och foten: Rekryteringstester först (briefen), sedan CV, Personliga brev, Jobbsöket. Inget SEO-skäl emot.
9. Foten ska fortsatt vara vanliga `<a>`-länkar i serverrenderad HTML, inte en meny som öppnas med skript. Megamenyn får öppnas med skript men länkarna ska finnas i HTML:en från början (som i dag), annars ser Google dem inte.
10. Sociala länkar: foten säger `facebook.com/jobbcoachai` och startsidans Organization-schema `facebook.com/jobbcoach.ai`. Samma adress på båda ställena när foten ritas om; vilken är ägarens fråga.

---

## Rubrikbyten i skisserna

Noter som finns: `noter/cv-analys.md` och `noter/start.md`. Startsidans not byter inga rubriker (H1, alla H2 och H3 står), så nästan allt nedan gäller /verktyg/cv-analys.

### /verktyg/cv-analys

| Rubrik | I dag | Skissen | Svar | Min lydelse och skäl |
|---|---|---|---|---|
| H1 | "Få konkret feedback på ditt CV på 60 sekunder" | "Se var ditt CV tappar poäng, del för del" | **JA MED ÄNDRING** | "CV-analys med läsbarhetspoäng: se var ditt CV tappar, del för del". Tiden är inte belagd för poängen, och regeln säger att läsbarhetspoäng är namnet i H1. Sidans enda klickande sökord är "cv analys" (p 6,1); det ska stå i H1, inte bara i etiketten. `H1_BYTT`. |
| Etikett | "CV-analys, vet varför CV:t inte får svar" | "CV-analys med läsbarhetspoäng" | **JA MED ÄNDRING** | Med min H1 blir etiketten en upprepning. Etiketten blir "CV-analys" eller en kort förmån, inte samma ord som H1. |
| Löftesraden | "1 analys gratis per konto", "60 sek till poängen", "4 delar med förslag" | "7 delar", "100 poäng", "0 kr för poängen, varje CV" | **JA** | Sant, och data som bild. |
| HowTo-steg 1 (H3) | "Ladda upp ditt CV" | oförändrad | **JA** | Står. Texten får meningen om Word och inskannade PDF:er. |
| HowTo-steg 2 (H3) | "Vi analyserar i bakgrunden" | "Vi går igenom sju delar" | **JA** | `RUBRIK_BYTT`. |
| HowTo-steg 3 (H3) | "Få ATS-poäng och förslag" | "Se poängen och vad som saknas" | **JA MED ÄNDRING** | "Se läsbarhetspoängen och vad som saknas". Namnet ska stå i rubriken. `RUBRIK_BYTT`. |
| HowTo-steg 4 (H3) | "Spara den förbättrade versionen" | "Hämta Jobbcoachens förslag" | **JA** | `RUBRIK_BYTT`. |
| H2 | "Sex saker rekryteraren och systemet ser först" | "Sju delar, hundra poäng" | **JA MED ÄNDRING** | "Sju delar som ger din läsbarhetspoäng". Rubriken bär då sidans namn på poängen; skissens lydelse säger inget för den som inte sett grafiken. `RUBRIK_BYTT`. |
| H3 under den H2:n | sex kategorier | de sju delarna | **JA** | Exakt produktens namn: Kontaktuppgifter, Personbeskrivning, Erfarenhet, Kompetenser, Utbildning, Språk, "Datum, ordning och längd". Sex par i `RUBRIK_BYTT`, den sjunde som ny. Text per del i samma längd som i dag. |
| Ny H2 | (saknas) | "Vägen till 100" | **JA MED ÄNDRING** | "Vägen till 100 poäng". Begripligt utan grafiken. Nya rubriker fäller inte grinden på verktygssidan. |
| H2 slutblock | "Hela analysen, varje fynd med åtgärd." | "Hela analysen, varje förslag utskrivet." | **JA MED ÄNDRING** | "Alla förslag, och nya när du har ändrat." Skissens "Hela analysen" säger fortfarande att analysen är Premium, fast genomgången är gratis. Kampanjord och pris står inte i rubriken. `RUBRIK_BYTT`. |
| FAQ | "Vad betyder ATS-poängen?" | "Vad betyder läsbarhetspoängen?" | **JA** | Svaret bär "rekryteringssystem (ATS)" en gång. `FAQ_BYTT`. |
| FAQ | "Hur många analyser får jag göra gratis?" | "Hur mycket är gratis?" | **JA MED ÄNDRING** | "Vad är gratis i CV-analysen?" En FAQ-fråga visas fristående i Google och måste säga vad den gäller. `FAQ_BYTT`. |
| FAQ | "Kan jag köra analysen igen när jag ändrat i CV:t?" | "Kan jag se poängen igen när jag ändrat i CV:t?" | **JA MED ÄNDRING** | "Räknas poängen om när jag ändrar i CV:t?" Det är vad som händer (omräkning vid sparning), och svaret blir ett rent ja. `FAQ_BYTT`. |
| FAQ, ny | (saknas) | "Kan jag ladda upp en inskannad PDF?" | **JA MED ÄNDRING** | "Kan jag ladda upp ett inskannat CV som PDF?" Ordet CV i frågan. Svaret: läses i kontot, bara på svenska. |
| FAQ, struken | "Hur lång tid tar en CV-analys?" | struken | **NEJ** | Frågan står kvar med sant svar: poängen och genomgången syns när CV:t är sparat, Jobbcoachens förslag tar under en minut (`analysTexter.ts:43-44`). En struken fråga fäller grinden, och "hur lång tid tar" är en vanlig frågeform. |
| H3 skrivtips | "Hoppa över bilden" | står kvar, textspåret avgör | **JA (står)** | Rubriken är ett råd och står. Texten får säga att 15 mallar har plats för foto om arbetsgivaren vill ha ett. |

### Startsidan

| Ändring | Svar | Skäl |
|---|---|---|
| H1, alla H2 och H3 oförändrade | **JA** | Rätt. |
| "Tio frågor gratis" blir "Tio meddelanden gratis" | **JA** | Sant, ingen rubrik. |
| Bricka "60 sek till första CV-poängen" blir "8 testtyper, grundnivån gratis" | **JA** | Sant, och testerna först. |
| "Brev som fungerat, yrke för yrke" blir "Brev att utgå från, yrke för yrke" | **JA** | Länken till `/personligt-brev-exempel` står kvar; det är länktexten som ändras och den bär inget sökord. |
| "Ett nivåtest visar var du står" struken | **JA MED ÄNDRING** | Ja till att Nivåkollen går ut, men raden ersätts med en sann mening om testerna av samma längd (ordantalet, gräns 20 ord). |
| Metatitel och beskrivning (beslut 1 i noten) | Titel **NEJ**, beskrivning **valfri** | Titeln är sann och rörs inte. Beskrivningen får skrivas om med testerna först om "CV", "personliga brev", "jobbmatchning" och "rekryteringstester" står kvar. |

### /funktioner och /verktyg/jobbmatchning (rubriker som posterna kräver, ingen skiss ännu)

| Rubrik | I dag | Svar | Min lydelse |
|---|---|---|---|
| /funktioner H3 | "Bygg CV:t steg för steg" | JA MED ÄNDRING | "Skriv CV:t direkt på arket" (samma ord som /verktyg/skapa-cv, "Arket är byggaren"). |
| /funktioner H3 | "Ladda ner som PDF" | JA MED ÄNDRING | "Ladda ner som PDF eller Word". |
| /verktyg/jobbmatchning H3 och HowTo-steg 1 | "Aktivera ditt CV" | JA MED ÄNDRING | "Välj eller ladda upp ditt CV". |

---

## Det jag inte har gjort

- Inga lydelser för de 105 posterna utom där uppdraget bad om det.
- Inget om datalagring, GDPR, integritetspolicy eller villkor (kartläggningens avsnitt 18).
- /for-rekryterare och insikterna är inte granskade (inga poster).
- Ordantalen är tagna ur befintliga avtryck, inte nymätta mot live.
- Sökordsbedömningen för /verktyg/sokta-tjanster saknar volymdata från externa verktyg.
