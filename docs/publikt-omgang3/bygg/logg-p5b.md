# Logg P5b, slutagenten (2026-11-22)

Grenen `design/publikt-omgang3` i `C:\Users\chris\cvbrev-publikt3`. Allt är committat, inget är pushat. Inga migreringar. Servern, webbläsarna och `.next` är borttagna efter sista körningen; `arbetsyta.mjs` visar inga servrar.

## Före push

1. **Två fel kvar i SEO-grinden, båda från byggmiljön, inga undantag skrivna.** `/verktyg/bli-upptackt` och `/verktyg/personlighetstest` får `og:image` från `verktyg/opengraph-image` i det lokala bygget, men har ingen på live. Sidornas metadata (`layout.tsx`) och `verktyg/opengraph-image.tsx` är oförändrade mot `origin/main`. Skillnaden kommer av att arbetskopian bara kan byggas med webpack (se punkt 6), medan Vercel bygger med Turbopack. Tidigare lokala avtryck byggda med Turbopack i rotmappen har också tom `og:image` för sidorna. **Kontrollera på Vercels förhandsvisning** att de två sidorna har samma `og:image` som live (ingen). Gör de inte det är det ett SEO-beslut; jag har inte skrivit något undantag.
2. **Klicka igenom med ett riktigt konto, det jag inte fick göra här:**
   - CV till jobbmatchningen: lägg in en PDF på `/verktyg/jobbmatchning`, skapa konto, landa i Matchade jobb med CV:t valt. Tolkningen är ett AI-anrop, och uppdraget gav bara ett brevutkast och en mini-analys, så jag kontrollerade bara uppladdningsfältet och felraden för fel filtyp.
   - CV-uppladdningen på `/cv-mallar` med en riktig PDF (samma skäl: tolkningen är AI).
   - Google-vägen för brevet och för Sökta tjänster.
   - Brevet med Björk (gratismall): ska landa på brevet i Björk, inte i Mallar.
   - "Jag ska söka" på arket på Sökta tjänster: ska landa i filtret Ska sökas.
   - Ladda ner i brevrummet efter ett brev från startflödet: ska visa Premiumspärren som i dag.
   - Provet utan konto genom alla fem uppgifter (provflöden körs inte mot produktionen i klicktest, enligt minnesregeln).
3. **Frågor till ägaren (datalagring):**
   - Jobbcoachens fråga från `/verktyg/jobbcoachen` står i adressen till `/register` och `/dashboard/jobbcoachen?fraga=...`. PostHog tar sidvisningar med hela adressen. SEO satte villkoret "inga värden i mätningen" för arket på Sökta tjänster; samma fråga gäller här. Inte ändrat.
   - Kontots äldre förifyllning från Matchade jobb (P5a:s fråga, står kvar).
4. **Små tryckytor kvar i delade komponenter som inte är ombyggda i omgången** (oförändrade mot `origin/main` eller delade med inloggat och `/embed`, därför inte rörda):
   - CV-arkets verktygsrad på `/cv-mallar` och stilsidorna: "2" 28 px, typsnitt, Standard, PDF och Word 40 px, färgrutorna 32 px breda (`src/components/cv/Dokument`).
   - "Ladda upp" 25 px hög på mallsidorna per yrke.
   - Jobbkartans länsrader, 17 px (375) och 21 px (1440) höga.
5. **Texter som SEO bör ta ställning till** (står på `origin/main`, inte rörda):
   - Tankstreck i JSON-LD på `/artiklar`: CollectionPage heter "Karriärbiblioteket", tankstreck, "alla artiklar". Ändras det fäller grinden på schemat.
   - "5 till 40 miljoner kronor" i artikeln `skapa-cv-med-ai` (befintlig löptext, regel 6 i avsnitt 5).
   - Talstreck i sifferspann i 124 artiklar (år med talstreck emellan): befintlig artikeltext.
6. **Bygget.** `npm run build` (Turbopack) går inte i arbetskopian: "Symlink node_modules is invalid", eftersom `node_modules` är en länk till rotmappen. `npx next build --webpack` gick igenom, men Nexts typkontroll tog slut på minnet vid 4 GB; med `NODE_OPTIONS=--max-old-space-size=6144` gick den igenom. Vercel bygger med Turbopack, så **titta på Vercels bygglogg** efter push.
7. **Valfritt från P3b:** de 32 brevminiatyrerna i startflödets väljare ritas fortfarande med mallens CV-bild (`scripts/brevmallar-miniatyrer.ts`, se `logg-p3b.md` beslut 2). Inte gjort.
8. **Efter push:** revalidera de rörda adresserna, ta ny baslinje mot live dagen efter med samma sidlista, och sidans första baslinje för `/verktyg/sokta-tjanster` (`seo-baslinje.md`).
9. **Städa lokalt:** `.env.local` är kopierad till arbetskopian (gitignorerad) för bygget och servern; ta bort den med arbetskopian. Snapshotkommandot skrev av misstag till `C:\c\Users\chris\AppData\...` (Git Bash gjorde om sökvägen); filerna är flyttade, men de tomma mapparna under `C:\c` står kvar, eftersom en säkerhetsspärr nekade borttagningen. Ta bort `C:\c` för hand.
10. Tre bekräftelsemejl gick till testadresserna (`@jobbcoach-qa.test`, en domän som inte finns) när kontona skapades i formuläret, som i tidigare QA. Schemalagda mejl till dem (`email_schedule`, 6 rader) är raderade.

## Commits

| Hash | Vad |
|---|---|
| `42499358` | Brevpunkterna ur `kvar-brev.md` och borttagna filer |
| `ebc3aa60` | Ingen ny BreadcrumbList på verktygssidorna, "Se alla 40 brevmallar" i exempelsidornas HTML |
| `b4a57f77` | Telefonmenyns block, menyval 44 px, Jobbcoachens fråga i kontots fält |
| (denna) | Loggen och SEO-avtrycket |

## Steg 1: brevpunkterna (`42499358`)

Ordagrant enligt `seo-slutbesked.md`:
- `/verktyg/personligt-brev`: raden "I annonsen: intressentdialog" över Före och Efter i regel 1 (punkt 49, ny klass `.pb-fe-annons`); tonblockets ingress (punkt 50 och 51); kortet Personligt brev-exempel (punkt 53); gratislistans andra underrad med "och de två senaste breven går att ändra"; "42 miljoner" bort ur hjältens brev ("där jag ledde en ombyggnad inom budget och två veckor före plan", som `Brevpar`) och ur kravpanelens citat för Budgetansvar. Ingen lapp säger Sweco (punkt 63). Den lokala ölösningen i `personligt-brev.css` är struken.
- Twitter-beskrivningen (BRV-1): SEO har ingen lydelse under 158 tecken, så jag kortade BRV-1:s egen lydelse genom att stryka "klart på minuter": "40 mallar, fem toner. Första personliga brevet gratis att läsa, kopiera och ändra. Nedladdning som PDF, och som Word i 26 av mallarna, ingår i Premium." 151 tecken, talen ur `BREV_MALL_ANTAL` och `BREV_WORD_ANTAL`. Ny text utan godkännande i den meningen att SEO inte har sett kortningen.
- Brevnavet och kategorisidorna: "Alla exempel och mallar" på båda ställena och meningen "Bläddra i hela biblioteket eller välj en annan bransch bland alla exempel." (punkt 59). "Tio branscher" räknas nu ur datan i `BranschBrickor` (`storForst(talOrd(antal))`, propen heter `uppmaning`).
- Exempelsidorna: Öppningen, Mitten, Avslutet (punkt 55). Navets chip står kvar.
- Borttaget efter sökning i `src` och `scripts`: `ExempelMall.tsx`, `SkarmCvAnalys.tsx`, och de som bara den använde: `telefon/delar.tsx`, `ExempelHjalte.tsx`, `VarforLista.tsx`, `AnsokanPar.tsx`. `StartFlowIllustrations.tsx` i `skapa-brev/start` fanns inte längre (den i `components/illustrations` används av intervjuprovet och står kvar).

## Steg 2: grindarna

Minnet ur `arbetsyta.mjs` före varje tung körning står vid körningen.

| Grind | Kommando | Minne | Resultat |
|---|---|---|---|
| Typkontroll 1 | `npx tsc --noEmit` | 3,4 GB | exit 0, inga fel |
| Vitest | `npx vitest run --maxWorkers=2` | 3,5 GB | 373 filer gröna, 3 överhoppade (376); 4 707 tester gröna, 13 överhoppade (4 720); exit 0. Inga fel, alltså inga som föll redan på `origin/main` |
| Bygge 1 | `npx next build` (Turbopack) | 3,2 GB | föll: länkade `node_modules` (miljön, se Före push 6) |
| Bygge 2 | `npx next build --webpack` | 3,0 GB | kompilerade på 89 s, föll i Nexts typkontroll: minnet tog slut vid 4 GB |
| Bygge 3 | samma med `NODE_OPTIONS=--max-old-space-size=6144` | 6,0 GB | exit 0, 804 statiska sidor |
| Statiska sidor | ruttabellen | | Alla publika sidor ○ eller ●. Dynamiska: `/artiklar`, `/login`, `/register`, `/skapa-brev/start`, `/verktyg/rekryteringstester/prova` (alla läser `searchParams`, så också på `origin/main`) och nya rutten `/verktyg/skapa-cv/start` (route handler). Varningen om edge runtime gäller en äldre sida |
| SEO-avtryck 1 | `seo-diff-artiklar.ts ta`, 498 sidor i nio delar om 60 (hela listan i ett argument blev för lång kommandorad i Windows), sammanslagna | 5,9 GB före servern | 498 av 498 svarade 200 |
| SEO-jämförelse 1 | `seo-diff-artiklar.ts jamfor` | | **Fel: 11** |
| Typkontroll 2, vitest berörda | `tsc`, `vitest run src/components/publikt src/app/(public)/verktyg` | | exit 0; 15 filer, 166 tester gröna |
| Bygge 4 | webpack, 6 GB heap | 4,9 GB | exit 0 |
| SEO-jämförelse 2 | samma | | **Fel: 2** |
| Typkontroll 3 | `tsc` | | exit 0 |
| Bygge 5 | webpack, 6 GB heap | 4,8 GB | exit 0 |
| SEO-jämförelse 3 (slutlig) | samma | | **Fel: 2** (se Före push 1). Rapporten: `docs/qa/seo-diff/publikt-omgang3-diff.md`, avtrycket `publikt-omgang3-efter.json` |

### Felen i SEO-grinden och vad jag gjorde

- **Nio verktygssidor fick en ny BreadcrumbList** (skapa-cv, bli-upptackt, cv-analys, personligt-brev, linkedin-optimering, jobbmatchning, rekryteringstester, jobbcoachen, personlighetstest). Grundens `Hjalte` skriver schemat för brödsmulan, och baslinjen har inget sådant block på sidorna. SEO har bara sagt ja till BreadcrumbList på `/verktyg/sokta-tjanster`. Rättat i koden: `brodsmulorSchema={false}` på de nio, brödsmulan står kvar synligt (`ebc3aa60`).
- **`og:image` på två sidor:** byggmiljön, se Före push 1. Inget undantag.
- **Undantag tillagda: inga.** `scripts/seo-baslinje/publikt-omgang3-undantag.json` är orörd.
- Ordantal: ingen sida sjönk mer än 0,6 procent (största: `/jobbkartan` 1 085 till 1 079). Två länkar som lämnade ramen (`#mini-analys` på cv-analys och `/verktyg/rekryteringstester/prova` på testsidan) finns i innehållet.

### `/verktyg/sokta-tjanster`

`docs/qa/seo-diff/sokta-tjanster-efter.json`: status 200, robots "index, follow", canonical `https://www.jobbcoach.ai/verktyg/sokta-tjanster`, title 56 tecken och description 146 tecken ordagrant som beskedet, en h1 "Håll koll på varje jobb du har sökt", elva H2 i beskedets ordning med H3:orna under, åtta frågor synliga och samma åtta i FAQPage, typerna BreadcrumbList (Hem / Verktyg / Sökta tjänster), FAQPage, HowTo (fyra steg lika med H3 under "Så fungerar det") och WebApplication. Med i `/sitemap.xml`. Inkommande länkar finns från ramen, `/`, `/funktioner`, `/priser`, `/verktyg/jobbmatchning`, `/verktyg/jobbcoachen`, `/artiklar/soka-jobb-via-mail` och `/artiklar/uppfoljning-efter-intervju`. Ordantal i `main` 1 716 (räknat med bildernas text).

### Kontrollistan i `seo-slutbesked.md`, punkt för punkt

Kontrollerad med ett skript mot det byggda (en hämtning per sida, 499 sidor), utöver grinden.

1 till 3. Artiklarna: grinden fäller ingen artikel på rubrikträd, första bild, länkmål eller BlogPosting.
4. `soka-jobb-via-mail` 2, `uppfoljning-efter-intervju` 2 och `personligt-brev-jobbansokan` 1 länk till `/verktyg/sokta-tjanster` utanför ramen. `ai-jobbmatchning` har matchningskortet (`jobb-matchning`), inte Sökta tjänster, vilket stämmer med beskedets tabell.
5. Ramen: header, megameny (21 länkar) och telefonmeny (27 länkar) ligger i `data-site-chrome` och står i serverns HTML stängda; foten likaså; Priser är egen länk; ankartexten för Sökta tjänster är "Sökta tjänster" (märket Nyhet är `::after`).
6. Brevexemplen per yrke (alla i sidlistan): en h1, H2 "Komplett exempel på 60 sek", `/skapa-brev/start?yrke=<yrke>` tre gånger (hjälten, kommentarskortet, slutet). **"Se alla 40 brevmallar" stod bara i visaren efter klick**; rättat så att länken står i serverns HTML under exemplet och göms medan visaren är öppen (`ebc3aa60`). Fyra ord mer per sida.
7. Grinden fäller inga CV-exempel eller mallsidor.
8. Testsidan: bara rubrikbytet i undantagsfilen; `/verktyg/rekryteringstester/prova` har `noindex`.
9. Jobbmatchningen: grinden utan fel; länken "Håll koll på dina sökta jobb" går till `/verktyg/sokta-tjanster`.
10. `/personligt-brev-exempel`: 89 yrkeslänkar och 10 branschlänkar i HTML:en, FAQPage med nio frågor, ItemList, BreadcrumbList, FAQPage.
11. `/cv-mallar`: `id="yrken"` finns, 74 h3 under den, 40 mallkort i HTML:en, inget `aria-hidden` kring dem, fotens "CV-mallar per yrke" pekar på `/cv-mallar#yrken`.
12. `/exempel`, `/jobbkartan`, `/for-rekryterare` med insikterna: grinden (hård regel) utan fel.
13. Startsidan: fem frågor, "Så hjälper vi dig komma förbi" till `/priser`, tre länkar till `/verktyg/sokta-tjanster`, en h1.
14. `/verktyg/personligt-brev`: 8 H2, 25 H3, HowTo-stegen är synliga H3, 8 frågor. `/verktyg/cv-analys`: h1-texten "CV-analys med läsbarhetspoäng: se var ditt CV tappar, del för del" med kolon; 7 H2, 16 H3 och nio frågor, eftersom textbeslut CVA-10 (SEO:s lydelse) lade till "Kan jag ladda upp ett inskannat CV som PDF?"; grinden utan fel.
15. Övriga verktygssidor, /funktioner, /priser, /om-oss: grinden utan fel utöver de två `og:image`.
16. Se avsnittet ovan.
17. Tankstreck: se Före push 5 (bara befintligt). Inget "42 miljoner"; "40 miljoner" bara i artikeln `skapa-cv-med-ai` (befintlig). "Källa till varje svar" finns ingenstans. Inga kampanjord i title, H1, description eller schema (skriptets träffar var vanliga ord som "rabatterat pris" och "kampanj" i butiksyrkenas FAQ).
18. `noindex` på `/verktyg/rekryteringstester/prova`, `/skapa-brev/start`, `/skapa-brev/start?yrke=projektledare`, `/artiklar?tag=cv`, `/artiklar?page=2`.
19. LCP och CLS, mätt i webbläsaren:

| Sida | 375 | 1440 |
|---|---|---|
| `/` | P, CLS 0 | H1, CLS 0,003 |
| `/artiklar/bra-personligt-brev` | H1, CLS 0 | artikelbilden 1536 x 1024, CLS 0,002 |
| `/personligt-brev-exempel/projektledare` | P, CLS 0 | brevbilden 480 x 679, CLS 0,001 |
| `/cv-exempel/projektledare` | P, CLS 0 | P, CLS 0,001 |
| `/cv-mallar/lakare` | P, CLS 0 | mallbilden i en ruta med fast mått, CLS 0,001 |

Förskjutningen på 1440 är typsnittsbytet (menyns text flyttar 3 px när webbtypsnittet laddas). Inte rättat.
20. Grinden: Fel 2, se Före push 1.

### Sajtkartan, robots, canonical

`/sitemap.xml` har 488 adresser: alla 487 från baslinjens sajtkarta plus `/verktyg/sokta-tjanster`. Ingen adress har försvunnit eller bytt namn; de elva i sidlistan som inte står i sajtkartan är samma elva som baslinjen räknar som utanför. `robots.txt` stänger `/skapa-brev/start`, `/cv-mallar/start` och `/cv-mallar/prova` som förut.

## Steg 3: i webbläsaren

Headless Chrome, en i taget, förladdning (`Next-Router-Prefetch`) och PostHog avstängda i varje sida.

### Sidtyperna, 375 och 1440 (80 laddningar, körd två gånger)

40 adresser: startsidan, /funktioner, /priser, /om-oss, /register, /login, /auth/forgot-password, alla tio sidor under /verktyg plus provsidan, /cv-mallar med `/cv-mallar/word` och `/cv-mallar/lakare`, /cv-exempel med kategorin vård och projektledare, /personligt-brev-exempel med kategorin tech, projektledare och undersköterska, /skapa-brev/start utan och med `?mall=koppar`, `?yrke=projektledare` och båda, artiklarna `bra-personligt-brev` (mallvisaren), `logiktest-tips` (test) och `soka-jobb-via-mail`, /rakna-ut med `lon-efter-skatt`, /jobbkartan, /for-rekryterare, /hjalpcenter.

- Alla 80 svarade 200, ingen sidledsrullning, inga konsolfel eller sidfel, inga trasiga bilder, en h1 på varje sida.
- Menyn öppnas i telefon och på dator på alla sidor som har den; alla menylänkar svarar 200 (inga omdirigeringar). Registreringen, inloggningen, Glömt lösenordet och provsidan har ingen meny, enligt sina skisser.
- **Rättat (`b4a57f77`):**
  - Telefonmenyns fyra färgblock krympte till sin rubrik, så länkkorten syntes bara som en vit kant. Orsaken: blocken har `overflow: hidden`, och raderna i menyns grid fick krympa. `.p3-tm-kropp` har nu `grid-auto-rows: max-content`; blocken är 130 till 195 px och visar alla länkar.
  - "Sökta tjänster" fick underradens stil (13 px, normal vikt, grå) i båda menyerna, eftersom namnet ligger i en `span` för märket Nyhet. Rättat i `ram.css`.
  - Datormenyns val och Logga in var 40 px höga, nu 44.
- Kvar: se Före push 4.

### Flödena fram till kontogränsen (14 sidladdningar, inga AI-anrop)

| Flöde | Vad jag såg |
|---|---|
| Provet utan konto från testsidans kort | Nio testtyper; valde figurserier; "Starta provet" gick till `/verktyg/rekryteringstester/prova?typ=figurserie` med startskärmen "Figurserier, fem uppgifter". Provet startades inte |
| CV-uppladdningen på /cv-mallar | Ett filfält (`.pdf,.docx`); en textfil gav "Vi läser PDF och Word. Välj en sådan fil, eller skriv ditt namn och fyll i direkt." Filterchipsen finns (åtta) |
| CV-byggarens startblad | GET-formuläret (yrke och två startval) gick till `/register?redirect=/dashboard/skapa-cv?fran=registrering&ladda=1&titel=Projektledare` |
| Mallvisaren på projektledare | "Byt mall" öppnade visaren med sju mallar, Koppar gav "Använd som mall" till `/skapa-brev/start?yrke=projektledare&mall=koppar`, "Se alla 40 brevmallar" finns i visaren |
| Startflödet | "Mallen du valde: Koppar. Ingår i Premium, även som Word." och arket i Koppar bredvid (1440) |
| Väljaren | 40 mallar, filtren Alla 40, Gratis, Enkla, Med färg, Sidospalt; Gratis gav 2; Esc stängde och fokus gick tillbaka till Byt mall. I 375: 40 mallar och "Använd ..." synlig |
| Tonvalet | Fem toner; i 375 ryms de utan sidledsrullning, knapparna 66 px |
| Annonsfältet på säljsidan | Annonsen följde med till `/skapa-brev/start` (fältet ifyllt, raden "Annonsen du klistrade in följde med."), adressen utan annonsen |
| Arket på Sökta tjänster | Knappen gick till `/register?redirect=/dashboard/sokta-tjanster?logga=1`, utan tjänst eller arbetsgivare; utkastet låg i `localStorage` (`jc_sokt_prova`) |
| Uppladdningen på jobbmatchningen | Ett filfält; en textfil gav "Vi läser PDF och Word (docx). Spara CV:t i något av dem." |
| Jobbcoachens frågefält | Frågan gick till `/register?redirect=/dashboard/jobbcoachen?fraga=...`; ett förslag fyllde fältet |

### Mini-analysen (ett AI-anrop)

En PDF med påhittat innehåll (Testperson Exempel, ritad av webbläsaren) gav 200 från `/api/public/quick-score`, poängen 78 av 100, "Det viktigaste att ändra först", "I kontot ser du" och kontogränsen.

### Testkonton (ett per flöde, ett i taget)

Sättet är det etablerade (`scripts/qa-tratt-valkommen.mjs`): kontot skapas i registreringsformuläret med en unik adress `qa-p5b-<flöde>-<tid>@jobbcoach-qa.test`, id och token sparas direkt, och städningen sker per id efter räkning (`feedback_testdata_stadning`). Jag skrev en egen städning med samma regler som `scripts/qa-registrering-stada.mjs`, eftersom det skriptet skriver över committade loggfiler i `docs/qa/registrering/`.

| Konto | Id | Vad jag såg |
|---|---|---|
| Brevet | `f144597c-363e-4b11-a2cd-330f954518c9` | Startflödet med Koppar och tonen Professionell; brevutkastet (det enda AI-anropet för brev) gav 200 och spärren "Brevet öppnas i Koppar, mallen du valde"; valet låg i `jc_pending_draft_val` med token, mall och ton; registreringen landade på `/dashboard/mina-brev/mallar?brev=<id>&mall=koppar` med "Du provar mallen Koppar"; en rad i `letters` med `mall_id` linne (gratisnivån sparar Premiummallen i Linne), `tonality` professional, `language` sv, fyra stycken |
| Sökt tjänst | `48783dde-58b9-4c99-95dc-c0233e114ec0` | Arket, registreringen utan värden i adressen, landade på `/dashboard/sokta-tjanster?fran=publikt-sokta` med "Testtjänst QA" hos "Testgivaren QA"; en rad i `job_applications`; utkastet borta ur `localStorage` |
| Jobbcoachen | `33f91cfa-0741-4d94-addd-e00a3e777284` | **Föll först:** landade på `/dashboard/jobbcoachen?fraga=...` men fältet var tomt, eftersom sidan aldrig skickade `startFraga` till `CoachVy`. Rättat (`b4a57f77`, en rad i `src/app/dashboard/jobbcoachen/page.tsx`). Efter ombygget: inloggad med samma konto, frågan står i fältet, inget skickat |
| CV till matchningen | inget konto | Kräver tolkningen (AI), se Före push 2 |

**Städningen** (räknat före radering, bara rader med de tre id:na och brevets token): `email_confirmations` 3, `email_schedule` 6, `job_applications` 1, `letters` 1, `user_activities` 20, `public_letter_drafts` 1 (per token), `profiles` 3, och de tre användarna i auth. Kontrollfrågan efteråt: 0 profiler och 0 användare med id:na. Första körningen stoppades av Management API:s takt efter `letters`; andra körningen räknade om och tog resten. IP-gränsens egen rad (`::1`) är inte rörd.

Sidladdningar mot den lokala servern under kontoflödena: tre till fem per konto (registreringen, landningen, och för Jobbcoachen inloggningen och sidan), förladdningen avstängd. Ingen seghet, inga 5xx.

## Ny text utan godkännande (P5b)

- Twitter-beskrivningen på `/verktyg/personligt-brev`: BRV-1:s lydelse utan "klart på minuter" (151 tecken).
- Ingen annan ny text. "Se alla 40 brevmallar" på exempelsidorna är SEO:s godkända text (punkt 54), nu också i serverns HTML.
