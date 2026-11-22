# Textbeslut, publikt omgång 3

Saas-lead, 2026-11-22. Ett beslut för alla publika textändringar, jämkat ur `kartlaggning.md` (105 poster), `textforslag.md` (UX-copy) och `seo-krav.md` (SEO), med skisskoordinatorns tillägg samma dag. Kontrollerat mot koden i `C:\Users\chris\cvbrev-publikt3` på `5adfc7a1`, med `fix/brev-kvar` och `feat/jobbsoket-omgang2` räknade som live.

Så läser byggaren filen:
- Del 1 är besluten på det som var öppet. Del 2 är lydelsen per post. Del 3 är ordningen. Del 4 är det skisserna måste ändra. Del 5 är rapporten till ägaren.
- **"Enligt textforslag.md"** betyder att copys lydelse i den posten gäller ordagrant. Allt som står utskrivet här går före textforslag.md.
- Tal och priser skrivs aldrig in för hand. Där en lydelse innehåller ett tal eller priset läses det ur samma konstant som i dag (`PLANS`/`paketMedPris`, `FREE_TEMPLATE_COUNT`, `TEMPLATE_COUNT`, `FREE_TIER_JOB_LIMIT`, `UPPFOLJNING_GRATIS_UTKAST` och så vidare). `{PREMIUM_PRIS}` nedan betyder den konstanten.
- Undantagsfilen för SEO-grinden är `scripts/seo-baslinje/publikt-omgang3-undantag.json` (SEO R1). Varje rad har datum och skäl.

---

## Del 1. Beslut på det öppna

Regler jag har följt: där SEO märkt en post HÖG gäller SEO:s krav om lydelsen är sann. En sann lydelse går före en rankande. Ägarens frågor står i Del 5 och avgörs inte här.

### Beslut på copys lista "Kräver beslut"

**B-1. H1 och etiketten på /verktyg/cv-analys.** H1 blir SEO:s "CV-analys med läsbarhetspoäng: se var ditt CV tappar, del för del", och etiketten över blir copys "Gratis för varje CV". Skäl: H1 bär sidans enda klickande sökord och poängens namn, och etiketten är sann (poängen och genomgången räknas för varje sparat CV utan kvot, `analysData.ts:300-311`).

**B-2. Mini-analysens innehåll (CVA-12).** Texten säger nu det som rutten faktiskt lämnar: copys lydelse, rubriken "Det viktigaste att ändra först" och den fasta listan "I kontot ser du". Skissens löfte "Delen där du tappar mest" får inte stå förrän rutten lämnar ut den. Skäl: texten under rubriken kommer ur basanalysen (`quick-score/route.ts:141-152`), inte ur poängmodellens delar. Produktfrågan står i listan "Till produkten".

**B-3. "Samma CV ger alltid samma poäng."** Meningen står inte på någon publik sida. I stället: "Varje poäng går att peka på i ditt CV." Skäl: inloggat stämmer meningen för ett sparat CV, men publikt struktureras varje uppladdning på nytt med en modell (`quick-score/route.ts:146`, `cv-parser.ts:56`) och kontot fyller tomma kontaktfält ur profilen (upp till tio poängs skillnad). Det kostar ingen ranking, meningen bär inga sökord.

**B-4. "Vad som saknas" per träff (GEM-10, JM-5, STA-4, TEL-3).** Löftet stryks överallt. Skäl: raden "saknas" visas bara när annonsen har en kravprofil (`src/components/jobb3/jobb/annons.ts:57-61`), och ett villkor i en säljrad läser ingen. SEO har märkt JM-5 LÅG och inget sökord bär orden.

**B-5. /integrationer (INF-1).** Ägarens fråga, se Del 5. Posten lämnas orörd tills han svarat.

**B-6. Nivåkollen efter provet (REG-5).** Raderna står kvar. Skäl: de visas efter ett gjort prov och säger vad nästa skärm heter. De byggdes 2026-11-20 i den godkända skissen för de publika proven (`a24fc818`), efter regeln om gratisnivåns ord (`gratis-copy.ts:8-9`), som gäller reklam och listor.

**B-7. SkarmBana (TEL-2). Ägarens beslut i natt.** Skärmen ska stämma med innehållet som finns nu och byts i den här omgången, inte efter Black Week. Lydelsen är copys TEL-2 (Översikt i Jobbsöket). Beslut 16 punkt 7 i `docs/beslut-jobbsoket-2026-11-21.md` är därmed upphävt.

**B-8. Raden under paketnamnet (GEM-6).** "Tester, CV, personliga brev, Jobbsöket och Jobbcoachen" i `plans.ts`, och sökordet "jobbmatchning" står kvar utskrivet i prissidans hjälte. Skäl: SEO kräver Jobbsöket, och raden bär inga sökfrågor (LÅG).

**B-9. Korten för Sökta tjänster och Inför intervjun (GEM-12).** Båda byggs, i `paket-copy.ts`, och syns därmed på /priser och /funktioner. Skäl: två av rummets fyra flikar saknas på sidorna som säljer rummet, och SEO välkomnar nya H3 där (LÅG).

**B-10. Kom igång-listan på /priser (GEM-13).** Raden "Logga en tjänst du har sökt" läggs inte till, men listan rättas till det den faktiskt är. Skäl: betalandes lista är `KOM_IGANG_LISTA.allt` med tolv brickor och utan `sokt_tjanst` (`git show feat/jobbsoket-omgang2:src/lib/onboarding/komigang.ts`, raderna 69-84), medan sidan säger elva steg och räknar upp övningsprov och personlighetstest som inte finns i listan. Lydelsen står i Del 2.

**B-11. Rubriken "Uppdaterat varje dag" (JM-4).** Står. Skäl: annonserna hämtas varje dag, SEO kräver den.

**B-12. Menyn (NAV-1).** Copys fyra grupper, dagens ankartexter, "Sökta tjänster" till `/funktioner#sokta-tjanster` tills `/verktyg/sokta-tjanster` är live. Den nya sidan byggs i push 5 med SEO:s disposition och copywriterns text, och då byts länkmålet på alla ställen.

**B-13. Taket för uppföljningsmejl i Premium (PRI-7).** Talet skrivs inte ut. "Till varje sökt tjänst" står. Skäl: det är sant över dagar, och taket (30 per dygn, `typer.ts:406`) nås inte av en människa.

**B-14. Juridiken.** Ägarens fråga, se Del 5. De fyra FAQ-svaren lämnas ordagrant.

**B-15. SkarmIntervjufragor.** Byts i push 3 mot vyns egna strängar ur Inför intervjun på `feat/jobbsoket-omgang2` (`IntervjuHubb.tsx`, `src/app/dashboard/intervju/infor-intervjun-copy.ts`). Byggaren hittar inte på rubriker. Skäl: "Frågor rekryteraren lär ställa" och "Öva på svaret" finns inte inloggat, och skärmen är `aria-hidden`, så bytet kostar inget i sök.

**B-16. Tillägget i `uppfoljning-efter-intervju` (ART-18).** SEO:s form: en mening sist i ett befintligt stycke, HowTo, snabbsvar och FAQ orörda. Grenen bär sju dagar och ett eget utkast för läget (`feat/jobbsoket-omgang2:src/lib/jobbsok/typer.ts:25`, `uppfoljning.ts:243, 273`), så villkoret i beslut 9 är uppfyllt.

**B-17. FAQ-frågorna på /verktyg/cv-analys (CVA-5, CVA-6).** Båda byts till SEO:s frågor: "Vad är gratis i CV-analysen?" och "Räknas poängen om när jag ändrar i CV:t?". Skäl: CVA-5 är HÖG och SEO:s fråga är sann; CVA-6:s gamla fråga förutsätter en körning som inte finns, och briefen förbjuder att beskriva produkten som "kör om analysen". Kostnad: två rader i `FAQ_BYTT`.

**B-18. Gruppnamnet i jämförelsetabellen (PRI-7).** "Jobb och coachning" blir "Jobbsöket". Om grindens träd läser `title` i `priser-data.ts:157` som rubrik skrivs bytet i `RUBRIK_BYTT`.

### Beslut där copy och SEO, eller copy och koden, vill olika

**B-19. Jobbcoachen och källorna.** Varken "med källa till varje svar" (copys STA-6) eller skissens "Varje svar anger källa". Lydelsen är "med källor du kan kolla själv". Skäl: modellen citerar bara när svaret bygger på kunskapsbasen, och hälsningar och följdfrågor får inga källor (`src/app/api/jobbcoachen/chat/route.ts:26, 270, 377-378`).

**B-20. HowTo-schemats `totalTime` på /verktyg/cv-analys.** Stryks. Skäl: SEO tillåter `PT1M` bara om stegtexten säger "under en minut", och det gör den inte efter omskrivningen.

**B-21. OG-bilden på /verktyg/cv-analys.** "Förbättra ditt CV på 60 sek" blir "CV-analys: se var ditt CV tappar poäng". Skäl: SEO vill ha "60 sekunder" ut ur OG, och förbättringen tar inte 60 sekunder, poängen gör det.

**B-22. Steg 1 i `ai-jobbmatchning` (ART-10, HÖG).** SEO:s krav: lika kort fetstil som säger vad som händer. Lydelsen blir "**1. Ditt CV läses in.**", inte copys "Du laddar upp ditt CV". Skäl: senaste CV:t läses in av sig självt (`MatchadeJobb.tsx:470-478`), och den som redan har ett CV laddar inte upp något.

**B-23. Stycket på rad 160 i `soka-jobb-via-mail` (ART-17, HÖG).** Tidsuttrycket byts och länkmeningen läggs före meningen som slutar med kolon, så att kolonet fortfarande leder till exemplet. Skäl: i copys ordning läses exempelmejlet som vårt utkast, vilket det inte är.

**B-24. Tillsatta och borttagna annonser (JM-4 och tillägget JM-7).** Ordet "tillsatta" står inte i någon säljrad. Det som går att belägga är att en borttagen annons inte följer med i nästa sökning: matchningen söker mot JobTechs sökning, som bara lämnar publicerade annonser (`supabase/functions/match-jobs/index.ts:275`), och poolen byts ut i sin helhet vid varje hämtning (`supabase/functions/sync-global-jobs/index.ts:94-101`). En annons kan ligga kvar efter att tjänsten är tillsatt, så "tillsatta ut" är osant.

**B-25. "Vi söker direkt mot Arbetsförmedlingens öppna API" (tillägget JM-8).** Blir "Vi hämtar annonserna ur Arbetsförmedlingens öppna API". Skäl: Matchade jobb använder både en hämtad pool (`MatchadeJobb.tsx:280, 352`) och en direkt sökning (`:494`), och den nya lydelsen är sann för båda. FAQ-frågan står.

**B-26. Bli upptäckt, arbetsgivaren.** Ingen ändring. Skäl: ingressen (`page.tsx:125`) och kortet och FAQ:n (`page.tsx:39`, `bli-upptackt-faq-data.ts:10`) säger samma sak, att arbetsgivaren är dold tills du tackat ja. Ingen motsägelse i sak.

**B-27. Bli upptäckt, FAQ-svaret om lön och styrkorna.** FAQ-svaret räknar upp samma saker som kortet (tillägget BU-1), och telefonen visar två styrkor, inte tre (BU-2). Skäl: kortet säger "två främsta styrkor" och rekryterarens förhandsvisning visar två (`RecruiterPreviewCard.tsx:198`, `slice(0, 2)`). "Percentiler" i samtycket är ägarens; sidan säger fortsatt "nivå och placering".

**B-28. CV-nedladdning gratis.** En nedladdning är gratis (`src/lib/cv/template-antal.ts:34`, `FREE_CV_EXPORTS = 1`). Alla texter och skisser säger det. Skissen för /verktyg/cv-analys rättas (Del 4).

**B-29. "Granskat av rekryterare" (/funktioner) och "Tusentals användare" (/om-oss).** Båda ersätts, inget belägg finns. Lydelserna i Del 2 (FUN-11, INF-4) har samma längd, så ordantalet håller.

**B-30. Glömt lösenordet.** Citatet med tankstreck skrivs om. Siffrorna "100% krypterat" och "24 h länken giltig" är säkerhetslöften och går till ägaren (Del 5); tills dess står de.

**B-31. JobbcoachenLiveDemo.** Lönebeloppen och statistiken "var fjärde person mellan 40 och 50" ut. Skäl: lön skrivs aldrig i exempel (beslut 18), och talet har ingen kontrollerad källa. LAS-svaret står, det stämmer med 11 § LAS.

**B-32. Bifynd B1 till B8.**
- B1 in (H1, etikett, OG-bild, `totalTime`), se B-1, B-20, B-21.
- B2 in. Skrivtipset om bilden får copys text, rubriken står (SEO).
- B3 in, alla fem raderna. Startsidans ordantal behöver dem (raden om grundnivån ersätter den strukna om nivåtestet).
- B4 in bara i filer vi redan rör: `GRATIS_TESTRAD`/rad 1 i `GRATIS_LISTA` ("förklaring efter varje uppgift") och startsidans rad 228. Resten tas i ett eget svep över testtexterna. Skäl: `gratis-copy.ts` ändras ändå, och "uppgift" är produktens ord.
- B5 in, båda svaren. `jobbcoachen-faq-data.ts:50` är också skisskoordinatorns punkt 3.
- B6 in, i samma push som de publika motsvarigheterna (push 2). Lydelser i Del 2. Mejlmallar undantas (Del 5).
- B7 inte in. Ett korts rubrik, inget osant.
- B8 inte in, ägarens fråga (Del 5).

---

## Del 2. Den slutliga lydelsen per post

Kolumnen **Grind** anger raden i undantagsfilen. `LD` betyder `LD_UNDANTAG` med de typer som står inom parentes. För varje rörd artikel gäller dessutom `LD (BlogPosting)` och ny `dateModified` (SEO R3, R7), utan att det upprepas.

### Förutsättning för alla poster

Bygget utgår från main med `fix/brev-kvar` och `feat/jobbsoket-omgang2` inslagna. Rader som citerar grenen (Kom igång-brickorna, Inför intervjun) finns inte på main förrän dess.

### 1. /verktyg/cv-analys

| Post | Fil och rad | Lydelse | Grind |
|---|---|---|---|
| B1 | `page.tsx:137` och etiketten | H1 `CV-analys med läsbarhetspoäng: se var ditt CV tappar, del för del`. Etikett `Gratis för varje CV`. OG-bilden (`opengraph-image.tsx`): `CV-analys: se var ditt CV tappar poäng`. `totalTime` (`page.tsx:61`) stryks. | `H1_BYTT`, `LD (HowTo)` |
| CVA-1 | `page.tsx:14-21, :158` | Enligt textforslag.md, med ett byte: ingressen under H2 blir `Varje poäng går att peka på i ditt CV. Fler ord ger aldrig fler poäng. Så här fördelas de hundra.` (oförändrad hos copy, står här för att den ersätter skissens mening om samma tal). | `RUBRIK_BYTT` (H2 och sex H3-par, sjunde H3 ny) |
| CVA-2 | `page.tsx:52, :85-87, :143-146`, `layout.tsx:13`, `cv-analys-faq-data.ts:23-24` | Enligt textforslag.md. | `LD (WebApplication, HowTo, FAQPage)` |
| CVA-3 | `layout.tsx:9, :11, :21`, `page.tsx:42, :60`, `cv-analys-faq-data.ts:19-20`, `CVAnalysMini.tsx:151` | Enligt textforslag.md. HowTo-rubriken: `Se läsbarhetspoängen och vad som saknas`. | `RUBRIK_BYTT` (H3 "Få ATS-poäng och förslag"), `FAQ_BYTT` ("Vad betyder ATS-poängen?" till "Vad betyder läsbarhetspoängen?"), `LD (WebApplication, HowTo, FAQPage)` |
| CVA-4 | `page.tsx:76-80, :138-139`, `layout.tsx:23` | Enligt textforslag.md. | `RUBRIK_BYTT` (H3 "Vi analyserar i bakgrunden" till "Vi går igenom sju delar"), `LD (HowTo)` |
| CVA-5 | `layout.tsx:7`, `page.tsx:49, :170-171`, `cv-analys-faq-data.ts:31-32` | Enligt textforslag.md, med SEO:s fråga (B-17): fråga `Vad är gratis i CV-analysen?`, svar copys alternativ ordagrant ("Läsbarhetspoängen och genomgången i sju delar är gratis för varje CV du sparar, ..."), priset ur `{PREMIUM_PRIS}`. | `META_BYTT`, `RUBRIK_BYTT` (slutblockets H2 till "Alla förslag, och nya när du har ändrat."), `FAQ_BYTT`, `LD (WebApplication, FAQPage)` |
| CVA-6 | `cv-analys-faq-data.ts:35-36` | Fråga `Räknas poängen om när jag ändrar i CV:t?`, svar copys alternativ ordagrant ("Ja. Poängen räknas om varje gång du sparar CV:t, ..."). | `FAQ_BYTT`, `LD (FAQPage)` |
| CVA-7 | `cv-analys-faq-data.ts:15-16` | Enligt textforslag.md. Frågan står. | `LD (FAQPage)` |
| CVA-8 | `page.tsx:71-73` | Enligt textforslag.md. | `LD (HowTo)` |
| CVA-9 | `page.tsx:89-95`, `cv-analys-faq-data.ts:43-44` | Enligt textforslag.md. Talen 40, 26 och två ur konstanterna. | `RUBRIK_BYTT` (H3 "Spara den förbättrade versionen" till "Hämta Jobbcoachens förslag"), `LD (HowTo, FAQPage)` |
| CVA-10 | `cv-analys-faq-data.ts:27-28` och ny fråga | Enligt textforslag.md, nya frågan `Kan jag ladda upp ett inskannat CV som PDF?` före säkerhetsfrågan. | `LD (FAQPage)` |
| CVA-11 | `CVAnalysMini.tsx:117-120, :133` | Enligt textforslag.md. | ingen |
| CVA-12 | `CVAnalysMini.tsx:82-110` | Enligt textforslag.md (B-2). | ingen |
| B2 | `page.tsx:28` | Enligt textforslag.md (B2). Rubriken "Hoppa över bilden" står. | ingen |

Säkerhetssvaret (`cv-analys-faq-data.ts:39-40`) står ordagrant.

### 2. Gemensamma källor

| Post | Fil och rad | Lydelse | Grind |
|---|---|---|---|
| GEM-1, GEM-2, GEM-3 | `gratis-copy.ts:51-106` | Enligt textforslag.md, med B4: rad 1 i `GRATIS_LISTA` och testraden blir `Grundnivån i alla åtta testtyperna med ett test om dagen, personlighetstestet och förklaring efter varje uppgift`. `gratis-copy.test.ts` och filens kommentar ("fem rader") följer med. | `LD (FAQPage)` för `/` |
| GEM-4 | `plans.ts:93-99` | Enligt textforslag.md (sex rader). | `LD (Product)` för `/priser` |
| GEM-5 | `plans.ts:95`, `linkedin-optimering/page.tsx:208`, `linkedin-optimering-faq-data.ts:47`, `skapa-cv/page.tsx:233`, `reklam-copy.ts:77, :223` | Enligt textforslag.md. | `LD (FAQPage)` för `/verktyg/linkedin-optimering` |
| GEM-6 | `plans.ts:169, :184, :199`, `priser/page.tsx:105` | Enligt textforslag.md (B-8). | ingen |
| GEM-7 | `paket-copy.ts:193-202` | Enligt textforslag.md. | ingen |
| GEM-8 | `paket-copy.ts:210` | Enligt textforslag.md. | ingen |
| GEM-9 | `paket-copy.ts:211, :216` | Enligt textforslag.md. | ingen |
| GEM-10 | `paket-copy.ts:245` | Enligt textforslag.md. | ingen |
| GEM-11 | `paket-copy.ts:254` | `Fråga vad du vill om lön, intervju, uppsägningstid eller hur du svarar på ett avslag. Svaren utgår från svensk arbetsmarknad, med källor du kan kolla själv, inte från en amerikansk mall. Jobbcoachen känner till din målroll, ort och bransch och de dokument du själv delar i samtalet, och föreslår frågor utifrån läget i dina sökta tjänster.` (copys lydelse, står här för B-19) | ingen |
| GEM-12 | `paket-copy.ts:239-256` | Enligt textforslag.md, båda korten (B-9). Raden under Inför intervjun läser gratisgränsen ur konstanten. | Ny H3 på /priser och /funktioner. Fäller grinden en ny rubrik på /funktioner skrivs den i `RUBRIK_BYTT` som ny. |
| GEM-13 | `paket-copy.ts:269-281` | Etikett ``${KOM_IGANG_LISTA.allt.length} steg`` (i dag tolv). Steg, i produktens ordning: `Profilen ifylld`, `CV uppladdat`, `CV-analysen: läsbarhetspoängen och Jobbcoachens förslag`, `CV:t uppdaterat efter genomgången`, `Första jobbmatchningen: jobb du inte hittat själv`, `Mall vald och nedladdad`, `Personligt brev på en annons`, `LinkedIn-profilen omskriven`, `Bli upptäckt: profilen synlig för rekryterare`, `Jobbcoachen: intervjun och lönen förberedd`, `Rekryteringstesterna: din nivå i matrislogik`, `Intervjuprovet: ett svar med återkoppling`. Ett test vaktar att antalet rader är lika med `KOM_IGANG_LISTA.allt.length`. | ingen |

### 3. /priser

| Post | Fil och rad | Lydelse | Grind |
|---|---|---|---|
| PRI-1 | `priser-data.ts:131-134` | Enligt textforslag.md (två rader). | ingen |
| PRI-2 | `priser/page.tsx:253-258` | Enligt textforslag.md. "(ATS)" står en gång på sidan, här. | ingen |
| PRI-3 | `priser/page.tsx:272` | Enligt textforslag.md. | ingen |
| PRI-4 | `priser/page.tsx:274` | Enligt textforslag.md. | ingen |
| PRI-5 | `priser-data.ts:137-140` | Enligt textforslag.md. | ingen |
| PRI-6 | `priser-data.ts:143-146` | Enligt textforslag.md. | ingen |
| PRI-7 | `priser-data.ts:156-178` | Enligt textforslag.md (B-13, B-18). | `RUBRIK_BYTT` om gruppnamnet räknas som rubrik |
| PRI-8 | `priser-data.ts:193-194` | Enligt textforslag.md. | `LD (FAQPage)` |
| PRI-9 | `priser-data.ts:222` | Enligt textforslag.md (152 tecken). Kommentaren på rad 217 till 152. | `META_BYTT` |
| PRI-10 | `priser/page.tsx:71-77` | Enligt textforslag.md. | ingen |
| PRI-11 | `priser-data.ts:75-80` | Enligt textforslag.md. | ingen |

### 4. /funktioner

| Post | Fil och rad | Lydelse | Grind |
|---|---|---|---|
| FUN-1 | `FunktionerSida.tsx:87-88` | Enligt textforslag.md. | `LD (FAQPage)` |
| FUN-2 | `FunktionerSida.tsx:96` | Enligt textforslag.md. | `LD (FAQPage)` |
| FUN-3 | `FunktionerSida.tsx:269-276` | Enligt textforslag.md. | ingen (etikett, ingen rubrik) |
| FUN-4 | `FunktionerSida.tsx:366-370` | Enligt textforslag.md. Ankaret `#sokta-tjanster` står. | ingen |
| FUN-5 | `FunktionerSida.tsx:175` | Enligt textforslag.md. | ingen |
| FUN-6 | `FunktionerSida.tsx:67` | Enligt textforslag.md. | ingen |
| FUN-7 | `FunktionerSida.tsx:68, :209`, `registrering-copy.ts:41` | Enligt textforslag.md. | `RUBRIK_BYTT` (H3 "Bygg CV:t steg för steg" till "Skriv CV:t direkt på arket") |
| FUN-8 | `FunktionerSida.tsx:212` | Enligt textforslag.md. | `RUBRIK_BYTT` (H3 "Ladda ner som PDF" till "Ladda ner som PDF eller Word") |
| FUN-9 | `FunktionerSida.tsx:64` | Enligt textforslag.md. | ingen |
| FUN-10 | `FunktionerSida.tsx:53-61`, `funktioner/page.tsx:17, :25` | Enligt textforslag.md. | ingen (OG och twitter) |
| FUN-11 (ny) | `FunktionerSida.tsx:118` | `<b>Byggt för svensk arbetsmarknad och för hur en rekryterare läser.</b>` | ingen |

### 5. Startsidan

| Post | Fil och rad | Lydelse | Grind |
|---|---|---|---|
| STA-1 | `Startsidan.tsx:256` | Enligt textforslag.md. | ingen |
| STA-2 | `Startsidan.tsx:252-253` | Enligt textforslag.md. | ingen |
| STA-3 | `Startsidan.tsx:258` | Enligt textforslag.md. | ingen |
| STA-4 | `Startsidan.tsx:274` | Enligt textforslag.md. | ingen |
| STA-5 | `Startsidan.tsx:303` | Enligt textforslag.md. | ingen |
| STA-6 | `Startsidan.tsx:86, :302`, `FunktionerSida.tsx:73` | Rad 86 och Funktioner 73: `Lön, intervjufrågor, avtal och avslag, utifrån svensk arbetsmarknad och med källor du kan kolla själv.` Rad 302: samma mening plus `Inte från en amerikansk mall.` (B-19) | ingen |
| STA-7 | `Startsidan.tsx:99-105` | Enligt textforslag.md. | ingen |
| STA-8 | `Startsidan.tsx:361` | Enligt textforslag.md. | ingen |
| B3 | `Startsidan.tsx:98, :156, :231, :271, :305` | Enligt textforslag.md (B3), alla fem. | ingen |
| B4 | `Startsidan.tsx:228` | "fråga" blir "uppgift" i raden, övriga ord orörda. | ingen |

Startsidans FAQ-svar om gratisnivån: GEM-1 till GEM-3. Description och titel rörs inte.

### 6. /verktyg/personligt-brev

| Post | Fil och rad | Lydelse | Grind |
|---|---|---|---|
| BRV-1 | `brev-faq-data.ts:19`, `page.tsx:364`, `layout.tsx:25` | Enligt textforslag.md. "gratis" står kvar i båda. | `LD (FAQPage)` |
| BRV-2 | `page.tsx:247` | Enligt textforslag.md (bara ingressen, stegen och HowTo orörda). | ingen |

### 7. /verktyg/jobbmatchning

| Post | Fil och rad | Lydelse | Grind |
|---|---|---|---|
| JM-1 | `page.tsx:67, :101, :112-113, :171, :197, :222` | Enligt textforslag.md. | `RUBRIK_BYTT` (H3 och HowTo-steg 1 "Aktivera ditt CV" till "Välj eller ladda upp ditt CV"), `LD (HowTo)` |
| JM-2 | `jobbmatchning-faq-data.ts:19, :43, :47` | Enligt textforslag.md. | `LD (FAQPage)` |
| JM-3 | `page.tsx:319` | Enligt textforslag.md. | ingen |
| JM-4 | `page.tsx:54, :93, :177`, `jobbmatchning-faq-data.ts:35` | Enligt textforslag.md (rad 54 och FAQ-svaret säger "borttagen", aldrig "tillsatta", B-24). Hjältens tal: `3 gånger` med `per dygn hämtas nya annonser`. | `LD (WebApplication, FAQPage)` |
| JM-5 | `page.tsx:199` | Enligt textforslag.md. | ingen |
| JM-6 | `page.tsx:64-71, :303-305` | Enligt textforslag.md. | ingen |
| JM-7 (ny) | `page.tsx:200` | `Nya annonser in tre gånger per dygn, borttagna ut` (B-24). | ingen |
| JM-8 (ny) | `page.tsx:125`, `jobbmatchning-faq-data.ts:23` | Steg 3: `Vi hämtar annonserna ur Arbetsförmedlingens öppna API, i hela Sverige.` FAQ-svaret, första meningen: `Vi hämtar annonserna ur Arbetsförmedlingens öppna API, som är Sveriges största samling av lediga jobb.` Resten av svaret står. | `LD (HowTo, FAQPage)` |
| B5 | `jobbmatchning-faq-data.ts:39` | Enligt textforslag.md (B5). | `LD (FAQPage)` |

Sidan har sju H2 (skisskoordinatorns anmärkning). SEO:s lista med åtta stämmer inte, men grinden läser den riktiga baslinjen.

### 8. /verktyg/jobbcoachen

| Post | Fil och rad | Lydelse | Grind |
|---|---|---|---|
| JC-1 | `page.tsx:174` | Enligt textforslag.md. | ingen |
| JC-2 | `page.tsx:52-53, :72-74`, `jobbcoachen-faq-data.ts:21-22, :45-46` | Enligt textforslag.md. | `LD (WebApplication, HowTo, FAQPage)` |
| JC-3 (ny) | `components/JobbcoachenLiveDemo.tsx:33, :51` och källetiketterna | Demo 1, frågan byts till `Vad skriver jag i ett uppföljningsmejl?` och svaret till `Håll det kort. Säg vilken tjänst det gäller, att du fortfarande är intresserad och fråga när de räknar med att ge besked. Tre till fyra meningar räcker. Vill du att vi skriver ett utkast tillsammans?` utan källmärke och utan källetiketter. Demo 3, svaret: `Inte alls. Många byter bransch mitt i arbetslivet. Det som funkar bäst är att börja från dina överförbara kompetenser. Vad jobbar du med i dag, så ser vi vilka roller som ligger nära?` utan källmärke; etiketten "SCB Arbetskraftsundersökning" tas bort. Demo 2 (LAS) står. | ingen (demot är inte schema) |
| B5 | `jobbcoachen-faq-data.ts:50` | Enligt textforslag.md (B5). | `LD (FAQPage)` |

### 9. /verktyg/skapa-cv

| Post | Fil och rad | Lydelse | Grind |
|---|---|---|---|
| SCV-1 | `page.tsx:47`, `skapa-cv-faq-data.ts:57` | Enligt textforslag.md. | `LD (FAQPage)` |
| SCV-2 | `skapa-cv-faq-data.ts:39` | Enligt textforslag.md. | `LD (FAQPage)` |

### 10. /verktyg/bli-upptackt

| Post | Fil och rad | Lydelse | Grind |
|---|---|---|---|
| BU-1 (ny) | `bli-upptackt-faq-data.ts:30` | `Nej. Din profil visar din roll, dina kompetenser, dina villkor, dina testresultat med nivå och placering och, om du valt det, dina två främsta styrkor i ord. Lön är något du och rekryteraren pratar om själva, om och när ni börjar chatta.` | `LD (FAQPage)` |
| BU-2 (ny) | `src/components/publikt/telefon/skarmar/SkarmBliUpptackt.tsx` | Telefonen visar två styrkor, inte tre. Ingen annan text ändras. | ingen (`aria-hidden`) |

### 11. Mallar och exempel

| Post | Fil och rad | Lydelse | Grind |
|---|---|---|---|
| EX-1 | `galleri-faq.ts:37`, `ExempelCTABand.tsx:45` | Enligt textforslag.md. | `LD (FAQPage)` för `/cv-exempel` |

### 12. Informationssidor och inloggning

| Post | Fil och rad | Lydelse | Grind |
|---|---|---|---|
| INF-1 | `integrationer/page.tsx:9-31` | Orörd tills ägaren svarat (Del 5). | |
| INF-2 | `OmOssSida.tsx:52` | Enligt textforslag.md. | ingen |
| INF-3 | `hjalpcenter/page.tsx:15, :19-38` | Enligt textforslag.md (bara tillägg). | `META_BYTT` |
| INF-4 (ny) | `OmOssSida.tsx:34` | `En enkel idé: göra det lättare att skriva personliga brev som fungerar för svenska arbetsgivare. De som använde den kom snabbare till sitt första utkast.` | ingen |
| AUTH-1 (ny) | `src/app/auth/forgot-password/page.tsx:9` | `Vi har alla glömt något. Det här är inte ditt jobb.` Siffrorna på rad 15-18 står tills ägaren svarat. | ingen |

### 13. Menyn och sidfoten

| Post | Fil och rad | Lydelse | Grind |
|---|---|---|---|
| NAV-1 | `nav-data.ts:47-74` | Enligt textforslag.md. Ankartexterna orörda. Jobbcoachen under Jobbsöket också i foten. "Priser" står kvar som egen länk i header och fot (SEO, Menyn och foten krav 2). | ingen (grinden fäller inte på ramen; SEO:s tio krav kontrolleras för hand) |

### 14. Registrering

| Post | Fil och rad | Lydelse | Grind |
|---|---|---|---|
| REG-1 | `registrering-copy.ts:354` | Enligt textforslag.md. | ingen |
| REG-2 | `registrering-copy.ts:195, :197, :218` | Enligt textforslag.md. | ingen |
| REG-3 | `registrering-copy.ts:57, :258, :260-266, :269` | Enligt textforslag.md. | ingen |
| REG-4 | `registrering-copy.ts:53, :246, :254` | Enligt textforslag.md. | ingen |
| REG-5 | | Ingen ändring (B-6). | |

### 15. Artiklarnas reklam

| Post | Fil och rad | Lydelse | Grind |
|---|---|---|---|
| REK-1 | `reklam-copy.ts:81, :84` | Enligt textforslag.md. | ingen |
| REK-2 | `reklam-copy.ts:88, :91, :225` | Enligt textforslag.md. | ingen |
| REK-3 | `reklam-copy.ts:135` | `Uppsägningstid och lön efter skatt räknar du ut gratis här. Löneförhandlingen förbereder du med Jobbcoachen, som svarar med källor du kan kolla själv och läser ditt CV när du delar det i samtalet.` (B-19) | ingen |
| REK-4 | `reklam-copy.ts:236-243` | Enligt textforslag.md. | ingen |

Kraven från SEO: REK-1 och REK-2 inom fem ord från dagens längd. Copys lydelser håller det.

### 16. Artiklarna

| Post | Fil och rad | Lydelse | Grind |
|---|---|---|---|
| ART-1 | `jobbcoach-online.mdx` (raderna i copys post) | Enligt textforslag.md. | `LD (BlogPosting, FAQPage)` |
| ART-2 | `jobbcoach-online.mdx` | Enligt textforslag.md. | `LD (BlogPosting)` |
| ART-3 | `jobbcoach-online.mdx:370` | Enligt textforslag.md. | `LD (BlogPosting)` |
| ART-4 | `jobbcoach-online.mdx:259` | Enligt textforslag.md. | `LD (BlogPosting)` |
| ART-5 | `jobbcoach-online.mdx:21, :1021` | Enligt textforslag.md. | `LD (BlogPosting, FAQPage)` |
| ART-6 | `jobbcoach-online.mdx:46, :51, :896-899` | Enligt textforslag.md. | `LD (BlogPosting)` |
| ART-7 | `vad-ar-en-jobbcoach.mdx` | Enligt textforslag.md. | `LD (BlogPosting, FAQPage)` |
| ART-8 | `vad-ar-en-jobbcoach.mdx:643` | Enligt textforslag.md. | `LD (BlogPosting)` |
| ART-9 | `vad-ar-en-jobbcoach.mdx:23, :649-655, :887-889` | Enligt textforslag.md. | `LD (BlogPosting, FAQPage)` |
| ART-10 | `ai-jobbmatchning.mdx:15, :51, :69, :97, :107` | Rad 15 och 107, första meningen: `I vårt verktyg sker det i fyra steg: ditt CV läses in, systemet extraherar yrkesdata ur det, kompetenser, roller, erfarenhet och nivå, sedan söks tusentals aktuella annonser igenom, och till sist får du träffarna sorterade efter hur väl de matchar din profil.` Rad 51: `**1. Ditt CV läses in.** Dokumentet är råmaterialet, ingen separat profil att fylla i.` Rad 69 och 97 enligt textforslag.md. (B-22) | `LD (BlogPosting, FAQPage)` |
| ART-11 | `ai-jobbmatchning.mdx:57` | Enligt textforslag.md. | `LD (BlogPosting)` |
| ART-12 | `ai-jobbmatchning.mdx:89` | Enligt textforslag.md. | `LD (BlogPosting)` |
| ART-13 | `din-digitala-jobbcoach.mdx:159, :161, :173, :175` | Enligt textforslag.md. | `LD (BlogPosting)` |
| ART-14 | fjorton filer | Enligt textforslag.md, en mening per fil. | `LD (BlogPosting)`, plus `FAQPage` för `cv-och-personligt-brev` |
| ART-15 | `skriva-cv-guide.mdx:17, :233` | Enligt textforslag.md. | `LD (BlogPosting, FAQPage)` |
| ART-16 | fyra artiklar | Enligt textforslag.md. | `LD (BlogPosting)` |
| ART-17 | `soka-jobb-via-mail.mdx:21, :34, :160, :162, :202` | Rad 21, 34, 162 och 202 enligt textforslag.md (bara tidsuttrycket). Rad 160: `Inget svar betyder oftast ingenting alls, rekryteringar drar ut på tiden. Loggar du ansökan under Sökta tjänster säger vi till efter tolv tysta dagar och skriver [utkastet till uppföljningsmejlet](/funktioner#sokta-tjanster) åt dig. Efter en till två veckor är en kort påminnelse helt rimlig:` (B-23) | `LD (BlogPosting, FAQPage)` |
| ART-18 | `uppfoljning-efter-intervju.mdx`, under "När och hur gör man en ytterligare uppföljning?" | Enligt textforslag.md. | `LD (BlogPosting)` |
| ART-19 | `personligt-brev-mall-gratis.mdx:29, :343` | Enligt textforslag.md. | `LD (BlogPosting, FAQPage)` |

### 17. Telefonskärmarna

| Post | Fil | Lydelse | Grind |
|---|---|---|---|
| TEL-1 | `SkarmCvAnalys.tsx` | Enligt textforslag.md. Exemplets tal räknas med `poangForRad` på Saras exempel-CV om det går; annars copys tal (93, +5, +2), där Erfarenhet tappar på punkternas verb och inte på saknade siffror. | ingen |
| TEL-2 | `SkarmBana.tsx` | Enligt textforslag.md (B-7). Raderna under "Att göra nu" stäms av mot `src/lib/jobbsok/attGora.ts` och får bara säga det motorn kan skriva. | ingen |
| TEL-3 | `SkarmMatchning.tsx` | Enligt textforslag.md. Kommentaren överst skrivs om. | ingen |
| TEL-4 | `SkarmAktivera.tsx` | Enligt textforslag.md. | ingen |
| TEL-5 | `SkarmCoach.tsx` | Enligt textforslag.md. | ingen |
| TEL-6 | `SkarmMatris.tsx` | Enligt textforslag.md. | ingen |
| SkarmIntervjufragor | `SkarmIntervjufragor.tsx` | B-15. | ingen |

### 18. Inloggade texter med samma fel (B6)

Samma push som de publika motsvarigheterna (push 2). Ingen mejlmall rörs.

| Fil och rad | Lydelse |
|---|---|
| `registrering-copy.ts:431` | `Analysen visar poängen och vad som saknas, del för del, gratis.` |
| `komigang.ts`, `cv_upp` för tester (main `:208`) | `Ingår gratis, poängen och genomgången` |
| `komigang.ts`, `analys` (main `:231` och grenens text "Poäng, fynd, nyckelord") | `Läsbarhetspoängen i sju delar` |
| `komigang.ts`, `analys_gratis` (main `:399`) | `Poängen och vad som saknas, del för del` |
| `komigang.ts`, `brev` i gratislistan ("Ett ingår gratis att läsa") | `Ett ingår gratis att läsa och ändra` |
| `src/lib/onboarding/paket-rader.ts:160` | `{ text: 'Poängen och genomgången', ingar: true }` |
| `src/components/paywall/paywall-copy.ts:113` | `Poängen och genomgången ingår` |
| `paywall-copy.ts:323` (första meningen) | `Du har sett din läsbarhetspoäng och vad som saknas i varje del.` Resten av meningen står om den säger förslag; säger den "fynd" byts ordet mot "förslag". |
| `paket-copy.ts:631` | `Du sa att du vill jobba med ditt CV. ${PREMIUM} ger alla mallar, alla förslag i analysen och de personliga breven.` |
| `src/app/forhandsvisning-publikt/page.tsx:162` | Rörs inte (sidan ger 404 i produktion). |

Byggaren söker efter "tyngsta fyndet", "en analys per konto" och "hela analysen" i användarsträngar (inte kommentarer, inte mejlmallar) när push 2 är klar. En träff utanför tabellen rapporteras, den rättas inte på egen hand.

---

## Del 3. Ordningen

Före push 1: ny SEO-baslinje mot live, med alla sidor och artiklar som rörs i omgången (SEO R8, också de som inte står i grindens lista). Varje push körs mot den baslinjen. Publika sidor ligger cachade ett dygn, så varje push följs av revalidering av de rörda adresserna.

Ordningen följer beslut 16: det som ägaren redan vill ha live först, strukturerad data i samma push som den synliga texten, och allt som beskriver samma sak i samma push.

**Push 1. Matchningen och Jobbcoachen.**
Poster: FUN-1, GEM-10, GEM-11, STA-4, STA-5, STA-6, JM-1 till JM-8, JC-1, JC-2, JC-3, REK-3, ART-3, ART-8, ART-10, ART-11, ART-12, TEL-3, TEL-4, TEL-5, B5 (båda svaren), BU-1, BU-2.
Varför ihop: alla sju "när du öppnar sidan" (R7), aktiveringen i text och telefon, och allt Jobbcoachen påstås känna till.
SEO-diff: `/`, `/funktioner`, `/priser`, `/verktyg/jobbmatchning`, `/verktyg/jobbcoachen`, `/verktyg/bli-upptackt`, `/rakna-ut`, artiklarna `jobbcoach-online`, `vad-ar-en-jobbcoach`, `ai-jobbmatchning` och en artikel ur karriärklustret (REK-3).
Trångt: `/verktyg/jobbmatchning` (gräns cirka 21 ord): JM-7 och JM-8 är samma längd, resten längre. `ai-jobbmatchning` är HÖG: stegen fyra, FAQ-frågan och ankartexten med "jobbmatchningen" kontrolleras för hand.

**Push 2. Gratisnivån, Premium och CV-analysen.**
Poster: CVA-1 till CVA-12, B1, B2, GEM-1 till GEM-9, GEM-12, GEM-13, PRI-1 till PRI-11, FUN-2 till FUN-11, STA-1, STA-2, STA-3, STA-7, STA-8, B3, B4, BRV-1, BRV-2, SCV-1, SCV-2, EX-1, REG-1 till REG-4, REK-1, REK-2, REK-4, ART-1, ART-2, ART-4 till ART-7, ART-9, ART-13 till ART-16, ART-19, TEL-1, TEL-6, INF-4, AUTH-1 och de inloggade raderna i Del 2 avsnitt 18.
Varför ihop: gratiskällan, Premiumlistan och prissidans tabell bär samma fakta och läses av /priser, /funktioner, startsidan, reklamkorten och registreringen (L1, L2, L5, L6, L7 och beslut 4). En artikel som säger "tyngsta fyndet" samma dag som prissidan säger "genomgång i sju delar" säger emot sig själv. De inloggade texterna går med så att ingen möter gamla ord dagen efter.
SEO-diff: `/`, `/priser`, `/funktioner`, `/verktyg/cv-analys`, `/verktyg/personligt-brev`, `/verktyg/skapa-cv`, `/verktyg/linkedin-optimering`, `/verktyg/jobbcoachen`, `/cv-exempel`, `/exempel`, `/om-oss`, alla artiklar i ART-1, 2, 4 till 7, 9, 13 till 16 och 19, och tre artiklar med reklamkortet (ett per kluster).
Trångt: startsidan, gräns cirka 20 ord. STA-1 och B3 (raden om grundnivån ersätter den om nivåtestet) måste räknas före och efter; resten av sidans poster blir längre. `/verktyg/cv-analys`, gräns cirka 17 ord: FAQ-frågan om tid står kvar, sju deltexter ersätter sex, och FAQ-frågan om inskannad PDF läggs till, så sidan ska gå upp. Räknas ändå. `/om-oss`, gräns cirka 6 ord: INF-4 är lika lång, INF-2 lägger till. Reklamkorten: plus minus fem ord (REK-1, REK-2), annars sjunker alla artiklar samtidigt.

**Push 3. Ramen, hjälpen och telefonerna som återstår.**
Poster: NAV-1, INF-3, TEL-2 (startsidan och /om-oss), SkarmIntervjufragor.
Varför efter push 2: megamenyns Premiumrad läser `beskrivning` som ändras i push 2 (GEM-6).
SEO-diff: `/`, `/om-oss`, `/hjalpcenter`, `/verktyg/rekryteringstester`, och ramens länklista för hand mot SEO:s tio krav.
Trångt: `/hjalpcenter`, gräns cirka 1 ord: bara tillägg, inget kort eller ämne får strykas.

**Push 4. Artiklarna om uppföljning.**
Poster: ART-17, ART-18.
Varför egen: `soka-jobb-via-mail` är den mest klickade sidan som rörs och HÖG. Får den stå ensam syns ett tapp i Search Console för sig.
SEO-diff: `soka-jobb-via-mail`, `uppfoljning-efter-intervju`. Ingen risk för ordantalet, men FAQ-svaret och snabbsvaret i `soka-jobb-via-mail` får bara ändras i tidsuttrycket.

**Push 5. Sidan /verktyg/sokta-tjanster.**
Sidan byggs enligt SEO:s disposition och källkrav, copywritern skriver texten, skissen finns. Samma push byter länkmålet `/funktioner#sokta-tjanster` till `/verktyg/sokta-tjanster` i menyn, foten, JM-6, ART-17 och ART-18, och lägger sidan i sajtkartan och grindens `PUBLIKT_V2`.
SEO-diff: den nya sidan mot SEO:s krav, plus de rörda artiklarna och `/verktyg/jobbmatchning`.

**Väntar på ägaren:** INF-1 och allt i Del 5.

Formomgången (skisserna) bygger sidorna senare och tar lydelserna ur den här filen. Textpusharna väntar inte på den.

---

## Del 4. Skisserna: det som säger emot besluten

Ändras i `docs/design/publikt-omgang3/`:

1. `sidor/cv-analys.html:117`, `:152` och `:267`: "Samma CV ger alltid samma poäng" och "samma CV ger alltid samma tal" bort (B-3). På rad 152 räcker "Varje poäng går att peka på i ditt CV. Fler ord ger aldrig fler poäng."
2. `sidor/cv-analys.html:93`, `:166` och `:186-189`: exemplet där Erfarenhet tappar på saknade siffror och Jobbcoachens förslag ändå ger +5. Erfarenhet tappar på punkter som inte börjar med vad hon gjorde; saknade siffror hör till "Du själv" (`analysTexter.ts:81`, TEL-1).
3. `sidor/cv-analys.html:270`: FAQ-svaret "till exempel en roll som saknar resultat i siffror" ersätts av svaret i CVA-2.
4. `sidor/cv-analys.html`: H1, etikett, FAQ-frågorna och slutblocket enligt Del 2 avsnitt 1. FAQ-frågan "Hur lång tid tar en CV-analys?" ritas tillbaka.
5. CV-nedladdning: skissen för /verktyg/cv-analys säger att nedladdning ingår i Premium. En nedladdning är gratis (B-28).
6. "Utan tak" om Premium som helhet: `sidor/start.html:257` ("Alla verktyg utan tak", ersätts av STA-8), `sidor/funktioner.html:458` ("Allt på den här sidan, utan tak."), `sidor/registrering.html:157` ("när du vill ha allt utan tak"). "Personliga brev utan tak" och intervjuprovet utan tak är sanna och står.
7. `delar/chatt.html:4`: de tre knapparna "Skriv utkastet", "Öva intervjufrågor", "Vad säger jag om lön?" finns inte i vyn. Rita vyns förslag ur `src/lib/jobbsok/coach.ts:41-46`, som i TEL-5.
8. `sidor/jobbcoachen.html:293` och `:296` ("Varje svar anger källa") och `sidor/om-oss.html:144` ("varje siffra går att följa till källan"): svaren anger källan när de bygger på kunskapsbasen, inte alltid (B-19).
9. `sidor/priser.html` (rapporten på gratisnivån, "Ingår inte"): gratis ser antalen per månad, raderna, utskriften och kopieringen är Premium (`Rapport.tsx:343-351`). Rutan säger "Antalen per månad".
10. `sidor/priser.html`, Kom igång: listan ritas med tolv steg enligt GEM-13.
11. `sidor/funktioner.html` hjälte: "granskat av rekryterare" ersätts enligt FUN-11.
12. `sidor/om-oss.html`: "Tusentals användare" ersätts enligt INF-4.
13. `sidor/start.html`: den strukna raden om nivåtestet ritas med ersättaren i B3 ("Grundnivån visar var du står i varje typ,").
14. `delar/fot.html`: Jobbcoachen står under Rekryteringstester. Den hör till Jobbsöket (SEO, Menyn och foten krav 4).
15. Skisserna för /verktyg/jobbmatchning och artikelreklamen: inget "vad som saknas" per träff, inget "tillsatta ut", inget "direkt mot API:t" (B-4, B-24, B-25).

---

## Del 5. Rapport till ägaren

**Beslutat.** Alla 105 poster och de nio som kom till under dagen har en slutlig lydelse eller ett beslut. Copys text gäller i nästan alla poster; jag har ändrat den där den lovade mer än koden backar, och följt SEO där sidan har ranking att förlora. Inga priser, gränser, policytexter eller mejl är rörda. Arbetet går i fem pushar, den första om matchningen och Jobbcoachen, den andra och största om gratisnivån, Premium och CV-analysen. Den nya sidan för Sökta tjänster kommer sist.

**Fem beslut du bör känna till.**
1. Telefonen i startsidans hjälte (SkarmBana) byts nu, enligt ditt besked i natt, mot Översikt i Jobbsöket.
2. På /verktyg/cv-analys byts H1, en H2, sex H3 och två FAQ-frågor. Sidan har nästan ingen sökvolym utom "cv analys", som står kvar i H1. Det osanna (ATS-poäng, fyra delar, en analys per konto) försvinner helt.
3. "Samma CV ger alltid samma poäng" står inte publikt. Poängen kan skilja mellan provet på sidan och kontot.
4. Jobbcoachen beskrivs som den är: målroll, ort, bransch och de dokument användaren delar, med källor när svaret bygger på kunskapsbasen. Demot på sidan visar inga lönebelopp längre.
5. Kom igång-listan på /priser blir tolv steg, som i kontot, i stället för elva steg som delvis inte finns.

**Bara du kan avgöra (mitt råd, och vad som gäller tills du svarat).**
1. **/integrationer.** Råd: behåll adressen, byt till två sanna kort (LinkedIn som PDF, Platsbanken) och ta bort korten för e-post och rekryteringssystem. Tills dess: sidan orörd. Den har 15 visningar på 90 dagar och länkas inte.
2. **Datalagring och säkerhet.** Fyra FAQ-svar lovar "all data lagras i EU" och "det enda som blir kvar är kvitton hos Stripe", medan policyn inte säger var Google, Stripe och Resend lagrar och att kontouppgifter kan sparas en tid. Glömt lösenordet säger "100% krypterat" och "24 h". Bli upptäckts samtycke säger "percentiler" där sidan säger "nivå och placering". Sökta tjänster-sidans fråga "Vem kan se mina sökta tjänster?" saknar svar. Råd: låt mig skriva ett förslag som du godkänner, och stryk "100% krypterat" om ingen kan peka på vad det betyder. Tills dess: allt orört.
3. **Mejl.** Gratisnivåns kampanjmall (`campaign-gratisniva.ts`) säger fortfarande "en analys per konto" och "det tyngsta fyndet", Kom igång-mejlet om Jobbcoachen har samma fel som startsidan hade, och mejlet om Jobbsöket väntar på din utskicksdag (förslaget var 2 december). Råd: rätta båda mallarna innan nästa utskick. Tills dess: orörda, inget skickas.
4. **Priser och gränser.** Inget ändras. Taket på uppföljningsmejl i Premium skrivs inte ut. Säg till om du vill ha det synligt.
5. **Facebook-adressen.** Foten och startsidans schema pekar på olika adresser. Säg vilken som gäller, så rättas båda.

**Nästa steg.** En Opus-agent tar ny SEO-baslinje och bygger push 1 i dag, sedan push 2. Push 3 och 4 följer samma dag om grinden är grön. Skissagenterna rättar sina sidor enligt Del 4. SEO läser av positionerna fyra veckor efter push 1, och avläsningen av Jobbsöket 5 och 19 december gäller oförändrad.

---

## Till produkten

Frågor om beteende, inte text. Texten ovan är sann med produkten som den är.

1. **Mini-analysen (CVA-12).** Den publika rutten visar texter ur basanalysen (`quick-score/route.ts:141-152`), inte ur poängmodellens sju delar. Råd: låt rutten lämna ut delen där CV:t tappar mest och vad som saknas där, ur samma genomgång som kontot. Då blir skissens löfte sant och texten kan byta till det.
2. **Poängen publikt mot kontot.** Kontot fyller tomma kontaktfält ur profilen (upp till tio poäng) och räknar på den sparade strukturen; publikt struktureras varje uppladdning på nytt. Råd: visa i provet att kontaktuppgifterna räknas utan profil, eller räkna likadant.
3. **"Vad som saknas" per träff.** Visas bara för annonser med kravprofil. Kan det visas oftare, kan löftet komma tillbaka.
4. **Kom igång för betalande.** Brickan "Logga en tjänst du har sökt" finns bara i gratislistorna (beslut 21). När den läggs in i `allt` ska GEM-13 få en rad till, och testet i GEM-13 fångar det.
5. **SkarmIntervjufragor.** Telefonen visar en vy som inte finns. Efter push 3 visar den Inför intervjun; vill vi visa intervjuprovets fråga och återkoppling behövs en skiss.
