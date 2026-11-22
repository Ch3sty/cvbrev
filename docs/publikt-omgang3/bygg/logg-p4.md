# Logg P4: Jobbsöket, artiklarna och övriga sidor (2026-11-22)

Ingen migrering behövs för något i paketet. Ingen commit, ingen push. Typkontrollen (`npx tsc --noEmit`) kördes en gång i slutet med 3,1 GB ledigt: inga fel. Berörda tester kördes: `provaSokt.test.ts` (ny), `provaCv.test.ts` (ny), artikelreklamens två testfiler och registreringens tester, 73 av 73 gröna. Ingen dev-server, inget bygge, ingen webbläsare, ingen SEO-diff (integrationens).

## Ändrat utanför de publika sidornas filer (tillåtet enligt det omskrivna mandatet, "inga genvägar")

- `src/app/dashboard/valkommen/ValkommenClient.tsx`: hämtkedjan har två nya led sist, `claimPendingSokt()` och `claimPendingJobbCv()`. De gör inget när besökaren inte har något utkast.
- `src/components/jobb3/coach/CoachVy.tsx`: ny valfri prop `startFraga`, som är fältets startvärde. Utan den beter sig vyn som förut.
- `src/app/dashboard/jobbcoachen/page.tsx`: läser `?fraga=` (högst 500 tecken) och skickar den som `startFraga`.
- Nya filer i lib:
  - `src/lib/jobbsok/provaSokt.ts` med test.
  - `src/lib/jobmatching/provaCv.ts` med test.
- `src/app/sitemap.ts`: `/verktyg/sokta-tjanster`.

## 1. /verktyg/sokta-tjanster (ny, klar)

**Byggt**
- Text: allt ur `nytt-innehall.md` (avsnittet sokta-tjanster), ordagrant.
- Title, description, H1, elva H2 och H3: i SEO:s ordning.
- FAQ: åtta frågor, synliga och i FAQPage (`Faq schema`). Frågan "Vem kan se mina sökta tjänster?" står inte.
- Schema: WebApplication (featureList ur samma lista), HowTo (de fyra stegen ordagrant som H3) och BreadcrumbList Hem / Verktyg / Sökta tjänster.
- Övriga filer: `layout.tsx` (metadata, canonical, robots index), `opengraph-image.tsx` (OgFrame med jobbmatchningens illustration), `sokta-tjanster-data.ts` (text och tal), `sokta-tjanster.css` (`st-`).
- **Arket fungerar (inga genvägar):** `LoggaArkPublik.tsx` är ett riktigt formulär med kontots fält och etiketter.
  - Fälten: Jag har sökt / Jag ska söka, Tjänst, Arbetsgivare, Datum sökt eller Sista ansökningsdag, Hur sökte du? (Annons, Spontan, Via kontakt).
  - Validering som kontots rutter, med felrader vid fälten.
  - Vid Logga sparas utkastet i webbläsaren (`jc_sokt_prova`, 24 timmar, samma mönster som CV-mallarnas `jc_cv_prova`). Sedan går besökaren till `/register?redirect=<Sökta tjänster med arket förifyllt>`.
  - Efter registreringen skapar valkommen-sidan tjänsten genom kontots egna rutter: `/api/applications` för en sökt tjänst, `/api/jobbsok/ska-sokas` för en sparad annons. Därefter landar hon i Sökta tjänster (filtret Ska sökas för en sparad annons).
  - Loggar hon in i stället, eller fungerar inte lagringen, bär redirecten tjänst, arbetsgivare och sista dag. Då öppnas kontots ark förifyllt (`forifylltUr` fanns redan).
- Hjältens knapp "Börja logga gratis" går till arket (`#logga`). Arkets knapp är kopparknappen och hjältens är vit (UX-kontrollen i nytt-innehall).
- Tal: alla ur konstanterna `NO_RESPONSE_NUDGE_DAYS`, `INTERVJU_BESKED_DAGAR`, `UPPFOLJNING_GRATIS_UTKAST`, `VECKANS_MAL_*`, `APPLICATION_SHARE_TTL_DAYS`, `JOB_MATCHES_PER_RUN` och `PLANS`. "tolv" och "sju" skrivs med en egen ordhjälp till och med tjugo, eftersom `talOrd` slutar vid tio.
- Händelsernas namn läses ur `STATUS_META`.
- Arbetsförmedlingen: bara det som är belagt i `seo-krav.md`, med länk till Aktivitetsrapportera och datumet då källan lästes (22 november 2026).

**Beslut**
- Premiumkortets pris skrivs som `PLAN.amount` och `suffix`, utan `PrisRad` och dess kampanjpris ("Inga kampanjord här", nytt-innehall).
- Gratiskortet är papper på Premium-ytan. Bläcket rättas lokalt, eftersom grundens Premium-regel annars gör texten ljus.
- I FAQ 4 står länken till Arbetsförmedlingen under svaret (`lank`). Ankartexten "Aktivitetsrapportera, arbetsformedlingen.se" är min.

**Ny text utan godkännande**
- Arkets knapp i läget Jag ska söka: "Spara till Ska sökas".
- Raden under arket: "Sedan skapar du ett gratis konto, så ligger tjänsten där."
- Fältens platshållare: "Till exempel projektledare" och "Företagets namn".
- Felraderna.

**Avviker från skissen**
- Arket har tomma fält med platshållare i stället för skissens exempelvärden, eftersom det är ett riktigt formulär.
- Mejlet, intervjukortet och rapportbladet är bilder som visar kontot (exempel), inga handlingar.

**Återstår**
- Klicktest i webbläsaren: logga, skapa konto och se tjänsten i kontot. Det ska göras både för Jag har sökt och Jag ska söka, och med Google-vägen.
- Ta sidans första SEO-avtryck efter push (`seo-baslinje.md`).

## 2. /verktyg/jobbmatchning (klar)

**Byggt**
- Sidan är byggd på grunden (`Sida jobb`), enligt skissen.
- Hjälten är `MatchadeJobb`.
- Lyftet har de 25 rutorna, där tre är öppna och talen kommer ur `FREE_TIER_JOB_LIMIT` och `JOB_MATCHES_PER_RUN`.
- Stegen är en väg med kontots småbilder. HowTo byggs ur samma lista, och steg 1 heter "Välj eller ladda upp ditt CV".
- Datapunkterna står bredvid Saras ark.
- Skälen har små bilder, och grenarna ligger på en ö.
- Kedjan visar träff, sparad, sökt.
- Länkbrickorna: Rekryteringstester är ny och står först. Sökta tjänster pekar på `/verktyg/sokta-tjanster`. Övriga sex står med samma ankartext.
- Därefter Premium och frågorna.
- Alla sju H2 och H3 "Uppdaterat varje dag" står (B-11).
- **Prova-ytan fungerar (inga genvägar):** `CvProvaJobb.tsx` låter besökaren lägga in sitt CV i lyftet.
  - Inläsningen går genom samma rutt som CV-mallarnas provsida (`/api/public/cv/tolka`, med samma spärrar och Turnstile).
  - Hon ser "Det här läste vi ur ditt CV": yrkesroller, kompetenser, utbildning och plats.
  - Utkastet sparas i `jc_jobb_prova`, en egen nyckel så att ett utkast från CV-mallarna aldrig skickar någon hit.
  - "Se mina träffar" går till `/register?redirect=/dashboard/jobbmatchning`.
  - Efter kontot hämtar valkommen-sidan hem CV:t via `/api/cv/prova/hamta` (samma rutt som CV-mallarna) och skickar henne till Matchade jobb, där det senaste CV:t läses in av sig självt.
- Hjältens knapp och den fasta knappraden går till `#prova`. `/register?borja=jobb` står kvar i stegen, Premium och FAQ.

**Beslut**
- FAQ 5 (JM-4, som hoppades över i textpushen): textforslag-lydelsen utan slutledet "så du slipper söka jobb som redan är tillsatta", eftersom B-24 säger att ordet "tillsatta" aldrig står.
- Kedjans arbetsgivare är Nordhaga Bygg (påhittad) i stället för skissens Sweco, som är ett riktigt företag.
- Kedjans text om tolv dagar: "föreslår vi ett uppföljningsmejl", inte "ligger ett utkast klart" (nytt-innehall).
- Saras ark står utan nålar, eftersom `CvArk` inte kan sätta skissens nummer per del (önskemål till grunden).
- Ankartexten "Håll koll på dina sökta jobb" (SEO:s tabell Länkar in) står i kedjans tredje kort. Brickan "Sökta tjänster" står också.

**Ny text utan godkännande**
- Lyftets etikett "Prova utan kort".
- Raderna "Exempel ur Saras CV: ...".
- Kedjans kort.
- Brickan Rekryteringstester: "Kallad till test efter ansökan? Träna först."
- Premiums fyra rader ur skissen (40 mallar ur `BREV_MALL_ANTAL`).
- CV-ytans texter och felrader.
- Länken "skapa kontot och bygg ett där".

**Återstår**
- Klicktest: lägg in CV, skapa konto, landa i Matchade jobb med CV:t valt.

## 3. /verktyg/jobbcoachen (klar)

**Byggt**
- Sidan står i skog (`Sida jobb`).
- Hjälten är samtalet med JC-3:s svar om uppföljningsmejl, utan källmärken och utan belopp.
- **Skrivfältet och förslagen fungerar (inga genvägar):** `CoachFraga.tsx` låter besökaren skriva en egen fråga eller trycka på ett förslag, så står det i fältet som i kontot.
  - Skicka går genom `/register?redirect=/dashboard/jobbcoachen?fraga=...`.
  - Kontots Jobbcoachen öppnas med frågan i fältet, och hon skickar sitt första riktiga meddelande. Det följer sidans egen text "Den skickas först när du själv vill".
  - Förslagen i det nya blocket och exempelfrågorna i de sex områdena är länkar in i samma flöde.
  - Sidans knappar "Fråga gratis" går till Jobbcoachen i kontot, utom slutknappen efter frågorna, som har kvar `/register` så att det gamla länkmålet står kvar.
- Lyftet: `JobbcoachenLiveDemo.tsx` är nu en serverkomponent utan JavaScript.
  - LAS-svaret (demo 2, B-31) står stilla, med källmärken och källor.
  - Inga lönebelopp och inget "var fjärde person".
- Stegen är en väg. Det nya blocket "Jobbcoachen föreslår frågor utifrån ditt läge" är en h3 på en ö, med länken Sökta tjänster.
- Därefter de sex områdena med frågan som bubbla, källorna på en ö, gratiskvoten som tio brickor och Premium utan tak.
- Frågorna: åtta, och "Vad vet Jobbcoachen om mig?" står inte (SEO NEJ).
- Fem H2 och sexton H3 står ordagrant.

**Beslut**
- "Till exempel:" före exempelfrågan i områdena är struket, eftersom frågan står som bubbla (skissen). Det tappar tolv ord, och sidan växer mer än så.
- Kvotens ruta: "Gratis: tio meddelanden per konto" läses ur `FREE_CHAT_MESSAGES_PER_ACCOUNT`.
- Lyftets rubrik är ett stycke, ingen h2 (noten).

**Ny text utan godkännande**
- Lyftets tre delar och "Varje svar visar var det kommer ifrån".
- Blockets två listor (vad svaren utgår från och vad Jobbcoachen inte läser).
- Kvotrutorna.
- Stegbilderna.
- Raden om kunskapsbasen.

**Återstår**
- Klicktest: skriv en fråga, skapa konto, och se frågan i fältet i Jobbcoachen.
- Kontrollera att kunskapsbasen ger LAS-källorna (noten, beslut 1).

## 4. /verktyg/bli-upptackt (klar)

**Byggt**
- Hjälten har reglaget, kandidatkortet (Sara som projektledare i Västra Götaland, två styrkor) och kontaktförfrågan.
- Stegen är en väg.
- Värdekorten har föremål.
- Arbetsstilen ligger på en ö i indigo, och kunskapstesterna står som eget kort.
- Tryggheten är en väg i fyra led och låskort.
- Matchningen är ett möte och fortfarande interaktiv: fyra sökningar, allt för den första står i serverns HTML.
- Exempelprofilen visar hela kandidatkortet, följt av ett pappersslut och frågorna.
- H1, åtta H2, sexton H3 och all löptext står. Schemat (Service, FAQPage) är oförändrat.
- Typfelet TS2367 i `BliUpptacktExempel.tsx` är rättat (spektrumets typ).

**Beslut**
- Exempelprofilens mening om vad rekryteraren ser och inte ser står kvar ordagrant. Skissens listor "Syns på kortet / Syns inte" är inte byggda, eftersom texten ligger nära samtycket och arbetsgivarfrågan är ägarens.
- "nedan" står kvar i matchningens ingress (ingen textbeslut-rad).
- Testresultaten skrivs med komma i stället för mittpunkt (husregeln).

**Ny text utan godkännande**
- Förfrågans text.
- Vägens fyra led.
- Kandidatkortets egna ord, märkta Exempel.
- Reglagens etiketter.

**Återstår**
- Ingen. Reglaget är en bild, eftersom synligheten bara finns med konto.

## 5. Artiklarnas reklam och artikelsidans skal (klar, byggd av en gaffel)

Ändrade filer:
- `src/components/artiklar/ArtikelRam.tsx`
- `src/components/artiklar/reklam/ArtikelReklam.tsx`
- `src/components/artiklar/reklam/reklam.css` (ny)
- `src/components/artiklar/reklam/TypProvKort.tsx`
- `src/components/artiklar/reklam/reklam-copy.ts`
- Två testfiler i `reklam/__tests__`
- `src/app/(public)/artiklar/[slug]/page.tsx`
- `src/app/(public)/artiklar/page.tsx`

**Byggt**
- Skalet:
  - `ArtikelRam` ligger i `<Sida farg>` i klustrets färg (`fargForKluster`), och toppen behåller klustrets vägg (beslut 8).
  - Rubrikträdet, författarens h3, artikelbilden som första bild och all JSON-LD är orörda. `/artiklar` har `Sida neutral`.
- Reklamkorten:
  - Alla korten har den nya formen (`ReklamRuta`) med en bild ur produkten:
    - tester: den riktiga expertuppgiften
    - CV-analys: `CvArk` med 93
    - brev: `Brevpar`
    - coach: `Samtal`
    - mallar: riktiga miniatyrer av Linne och Björk
  - Sidokortet är Premium med kopparklack, och slutkortet har grundens Premium-form.
  - Rubrikerna i korten är stycken.
- Copyn:
  - Brödtext och gratisrad är delade utan ordförlust (testat).
  - "fråga" heter nu "uppgift".
  - Talen läses ur konstanter.
- Nytt kort för Jobbsöket, i två varianter, som slutkort efter FAQ:
  - Träffen i `ai-jobbmatchning`.
  - Sökta tjänster (vägen) i `soka-jobb-via-mail`, `uppfoljning-efter-intervju` och `personligt-brev-jobbansokan`. Knappen "Så fungerar Sökta tjänster" går till `/verktyg/sokta-tjanster`.
  - Kortet läggs alltid till och ersätter inget, så inget länkmål kan försvinna.

**Beslut**
- Väggen i toppen står kvar (inte skissens ljusa topp).
- Expertuppgiften står på papper utan `Testram`, eftersom ramen saknar fyllning (önskemål).
- Nioikonraden är struken (ingen synlig text).
- Sidokortet har ingen klockbild.
- Korten får delens färg, inte klustrets.

**Ny text utan godkännande**
- Etiketterna CV-mallar, CV-analys, Personliga brev, Jobbcoachen och Räkna ut.
- Jobbsökskortens lydelser:
  - träffen: "Se vilka annonser som passar ditt CV" med mera
  - Sökta tjänster: H1 som rubrik och hjältens värdemening
- Slutkortets bricka "12 av 15, exempel på ett pass" (aria-hidden).

**Kontrollerat mot HEAD**
- Alla gamla länkmål står kvar, också `/skapa-brev/start` i varje artikel.
- Ingen h2 eller h3 är tillagd eller borttagen.
- Ingen JSON-LD är ändrad.

**Återstår**
- Se storleken på instrumenten i 272 px spalt och vägens etiketter på 375 px i webbläsaren.
- Ordantalet per kort i SEO-diffen.
- Tre önskemål är skrivna i `onskemal.md`:
  - "Prova fem frågor" i `artikel-kluster.ts`
  - `GRATIS_TESTRAD_PROV`
  - Testramens fyllning
- ART-17 och ART-18 är inte införda i mdx-filerna. När de förs in ska länkmålet vara `/verktyg/sokta-tjanster`.

## 6. Övriga sidor med nytt skal (klara, byggda av en gaffel)

Text och funktion är orörda. Inga rubriker, länkar, FAQ eller schemablock är borttagna (kontrollerat mot HEAD genom läsning).

- **/hjalpcenter:** `Sida neutral`, hjälte på väggen, länkkort och en tonad sektion. Ny `hjalpcenter.css`.
- **/kontakt:** hjälte, med lyft som bär formuläret och de tre vägarna. `PubliktSida` och `foretag.css` står kvar inuti, eftersom `KontaktFormPublik` bygger på `pub-kort`.
- **/press:** var klientkod med framer-motion, är nu en serverkomponent. Priset läses ur `PLAN_BY_KEY`.
- **/karriar:** serverkomponent. h1 har samma text som i baslinjen.
- **/integrationer:** bara färgerna, via `Sida` direkt ur `v3/Sida`, eftersom sidan är en klientkomponent. Text, emoji och struktur är orörda.
- **/for-rekryterare:** `Sida neutral`, v2-komponenterna står kvar.
- **Insikterna:**
  - Hjälten står på väggen.
  - Breadcrumb står kvar, eftersom den skriver schemat via next/script.
  - Prosan står på ett papper.
  - Ny `insikter.css`.
  - `InsiktCTA` är tonad.
- **/rakna-ut och kalkylatorerna:** `Sida jobb`, eftersom väggen är skog. `dela.tsx` har tokens med reservfärger (den körs också i artiklarna och /embed), och knapparna är minst 44 px.
- **/jobbkartan:** `Sida jobb`. Det svarta och beiga i `jobbkartan.css` är bytt mot grundens toner.
  - Rampens nya nollsteg är satta för hand och inte kontrollerade mot 2:1-valideringen: SEO och design bör titta.
  - `yrkeskarta.css` är orörd, eftersom P1 och P3 delar den.
- **/exempel:** `ExempelHero` är en serverkomponent på `Hjalte` (BreadcrumbList skrivs fortfarande av page.tsx). Övriga sju komponenter har fått tokens. `ExempelIcons` och P2/P3:s delade komponenter är orörda (önskemål).
- **/authors/[slug]:** profilen står på väggen och artiklarna i en sektion. Ny `authors.css`.

**Återstår**
- Rendering och ordantal i SEO-diffen.
- /for-rekryterare, /rakna-ut och /jobbkartan har grundens färger men v2:s `Rum`. Det är ingen full ombyggnad, eftersom de ligger i `HARD_SIDOR` och saknar egen skiss.

## Undantagsfilen

Ingen ny rad behövs:
- Inga rubriker, FAQ-frågor eller länkmål har försvunnit.
- `/register` och `/register?borja=jobb` står kvar på sina sidor.
- FAQ-svarsändringen på /verktyg/jobbmatchning täcks av befintliga `LD_UNDANTAG`.
