# Saas-lead: konvertering i den nya texten, publikt omgång 3

Saas-lead, 2026-11-22. Läst: `nytt-innehall.md` (radnummer nedan avser den filen), `seo-besked-skisser.md`, `textbeslut.md`, `BYGGBRIEF.md`. Kontrollerat mot koden i `C:\Users\chris\cvbrev-publikt3`. Inga priser, gränser, juridik eller mejl är rörda, och inget nytt erbjudande föreslås. Varje punkt går att svara ja eller nej på.

Helhetsbedömning: texten säljer redan rätt. Gratis står där beslutet tas, Premium har pris efter namnet och prov före konto finns på tester, CV-analys och brev. Det jag vill ändra är främst vart knapparna leder, plus tre rader där gratisnivån låter större än den är och därför ger en besvikelse vid betalväggen.

## Del 1. Ändringar för konverteringens skull

### K1. sokta-tjanster: kontoknapparna landar i det öppna loggarket (störst effekt)

- **Var:** rad 68 (hjältens knapp), 91 (arkets knapp), 241 (Premiumytans knapp), 286 och 288 (slutblocket och telefonens fasta rad).
- **I dag:** samtliga går till `/register`.
- **Mitt förslag:** samma lydelser, men målet blir `/register?redirect=%2Fdashboard%2Fsokta-tjanster%3Flogga%3D1`.
- **Varför:** en bar `/register` landar i spårvalet, där frågan om vad man vill börja med ställs igen. Med adressen ovan landar kontot direkt i Sökta tjänster med arket "Logga sökt tjänst" öppet, alltså exakt det knappen lovade. Då blir arkets knapp sann i stället för en bild som leder till ett formulär för något annat.
- **Belägg:** `registerIngang` tar emot `redirect` (`src/components/registrering/intent.ts:203-218`), `sakerRedirect` släpper igenom `/dashboard/...` (`:99-105`), cookien bär redirecten genom Google (`:121-136`, `googleCallbackMal`) och `?logga=1` öppnar arket (`src/components/jobb3/sokta/SoktaVy.tsx:57-61`).
- **Pris:** kontot hoppar över förslaget med köpknappen efter registreringen (`landningsgren`, `intent.ts:256-268`). Det tar jag. Den som kommer hit vill logga gratis, och Premium möter hen sedan vid andra uppföljningsutkastet och vid rapportens rader.
- **Länkar och SEO:** inga ankartexter ändras, bara målet för länkar till `/register`. Den sidan är inget SEO-mål.

### K2. sokta-tjanster: Google nämns i raden om kortet

- **Var:** rad 236.
- **I dag:** Inget kort behövs. Du skapar kontot med din e-postadress.
- **Mitt förslag:** Inget kort behövs. Du skapar kontot med Google eller med din e-postadress.
- **Varför:** Google är den kortaste vägen till konto och finns som knapp på `/register` (registreringssektionen, rad 1989). Den nuvarande raden låter som att det bara finns ett formulär att fylla i.

### K3. sokta-tjanster: två kopparknappar på datorn (svar på UX-kontrollen, rad 292)

- **Mitt förslag:** hjältens "Börja logga gratis" är kopparknappen. Arkets "Logga sökt tjänst" blir `.knapp-vit` på datorn, men bara när båda syns på samma skärmyta. I telefonen ligger de på var sin skärmyta, och där är båda koppar.
- **Varför:** hjältens knapp bär ordet gratis, och det är den uppgiften som får besökaren att börja. Arket är ett exempel. UX föreslår motsatsen. Med K1 leder båda till samma ställe, så det handlar bara om vilken som drar blicken först.

### K4. start: brevblocket säger hur många mallar som är gratis

- **Var:** rad 2489.
- **I dag:** Brevet får samma mall som ditt CV, så att ansökan hänger ihop. Du väljer bland 40 mallar och fem toner.
- **Mitt förslag:** Brevet får samma mall som ditt CV, så att ansökan hänger ihop. Du väljer bland 40 mallar, Linne och Björk gratis, och fem toner.
- **Varför:** blocket har knappen "Skriv ett brev gratis". Läst ihop med den låter det som att alla 40 är gratis, och då blir betalväggen vid mallvalet en besvikelse i stället för ett erbjudande. Namnen och antalet ska läsas ur `BREV_GRATIS_NAMN` och `BREV_MALL_ANTAL`, samma källor som prissidans tabell (rad 1959). Fyra ord fler, och startsidan får växa.

### K5. start: gratisraden för matchningen säger vad man får

- **Var:** rad 2474.
- **I dag:** Chip: Gratis. Rad: Tre träffar
- **Mitt förslag:** Chip: Gratis. Rad: Tre träffar, med skälen utskrivna
- **Varför:** "Tre träffar" ensamt låter snålt bredvid de två andra gratisraderna. Lydelsen finns redan på /funktioner (rad 929) och i reklamkortet (rad 2669), så det blir samma sanning på tre ställen. Tre ord fler.

### K6. priser: förnyelsemejlet står vid köpknappen, inte bara längst ned

- **Var:** rad 1876 (raden under köpknappen på prislappen).
- **I dag:** Kortbetalning via Stripe. Kvitto på mejl.
- **Mitt förslag:** Kortbetalning via Stripe. Kvitto på mejl. Dagen före förnyelsen mejlar vi vad du har gjort.
- **Varför:** rädslan för att glömma en prenumeration avgör köpet, och den sitter vid knappen. Meningen finns redan i sidans Premiumyta (rad 1972), men där läser bara den som har scrollat hela sidan.
- **Belägg:** `paket_fornyas` schemaläggs inom 36 timmar före dragningen och hoppas över för uppsagda prenumerationer (`src/lib/email/lifecycle/runner.ts:389-446`). Mejlet räknar upp brev, mallar, poäng och ansökningar för perioden (`templates/komigang.ts:354-388`). Cronen kör det (`src/app/api/cron/pricing-sync/route.ts:482`). Undantaget står i Del 3, punkt 3.

### K7. funktioner: Premiumytan får en köpknapp

- **Var:** rad 1039.
- **I dag:** `.knapp` Se vad som ingår, till `/priser`.
- **Mitt förslag:** `.knapp` blir köpknappen ur `kopKnapp()` ("Köp Premium, 149 kr i månaden"), med samma beteende som `PriserKopKnapp.tsx:56`: köpsteget för den som är inloggad, annars `/register?paket=` med `SALD_PLAN`. "Se vad som ingår" står kvar som `.lank` till `/priser`.
- **Varför:** SEO skriver att konverteringen väger tyngst på /funktioner (beskedet, rad 28-30 och 94). Den som har läst hela funktionssidan har bestämt sig mer än någon annan besökare, och i dag ligger köpet ett sidbyte bort. Inga länkar försvinner: ankartexten till `/priser` står kvar.

### K8. artikelreklam: CV-analyskortet leder till uppladdningen

- **Var:** rad 2641.
- **I dag:** Analysera mitt CV, till `/verktyg/cv-analys`.
- **Mitt förslag:** samma knapptext, men målet blir `/verktyg/cv-analys#mini-analys`.
- **Varför:** i dag landar läsaren på hjälten, och där står en likadan knapp som pekar på `#mini-analys` (rad 652). Det blir alltså två klick med samma text för att komma till samma ställe. Ankaret finns (`CVAnalysMini.tsx:78, :136`).
- **SEO avgör:** målet byts i alla artiklar med kortet. Läser grinden fragmentet som en ny länk behövs en rad i `LANK_BYTT`. Säger SEO nej står dagens mål kvar.

## Del 2. Min ståndpunkt på "Stämmer inte"

Uppdraget numrerar punkterna 4, 6 och 10. I filen heter de 68, 16 och 60, och det är filens nummer som står här.

- **68 (reklamkortet Sökta tjänster, etikett och knapp):** ja till copys "Jobbsöket" och "Håll koll på sökta jobb". Etiketten följer delnamnet som användaren ser i kontot, och knappen säger vad man får i stället för att beskriva sidan. Dessutom ryms den.
- **16 (brevets sista steg på /funktioner):** ja till skissens "Redigera, välj mall och skicka. Nedladdning ingår i Premium.", som SEO redan har sagt ja till. Den säger var gratis tar slut, i samma ögonblick som läsaren vill ha brevet ut. GEM-9 låter nedladdningen verka gratis och ger en besvikelse vid betalväggen. Mitt textbeslut GEM-9 viker för SEO:s ja på just den här raden.
- **60 (jobbmatchningens tredje talbricka):** dagens "Hela Sverige, alla branscher" står. Första brickan säger redan gratis ("3 träffar gratis"), så "0 kr att börja" skulle säga samma sak två gånger. "Hela Sverige" besvarar i stället den fråga som får folk att avstå, nämligen om tjänsten täcker min ort.
- **UX-punkten, två kopparknappar på Sökta tjänster:** se K3. Hjälten är koppar och arket vitt på datorn.
- **2 (etiketten på Sökta tjänster):** ja till SEO:s. Gratis säger första talbrickan.
- **11 (länken "Så hjälper vi dig komma förbi"):** ja, länken står kvar. Den är startsidans enda väg från medierna till priset.
- **24 ("Gratis för alla med konto" i stället för "Nyhet" på prissidan):** ja. Gratis är argumentet för att skapa konto, och "nyhet" säljer ingenting.
- **25 (tonens Premiumcell):** ja till "Du väljer, eller så väljer vi efter annonsen". Ett Premium som låter som att man förlorar ett val säljer sämre.
- **39 och 40 (CV-analysens löften):** ja till båda omskrivningarna. Ett löfte som provet inte håller kostar mer i förtroende vid kontot än det ger i klick.
- **50 (tonbyte):** ja. Det är sant, och det förklarar varför veckans gratisbrev tar slut.
- **51 ("Du väljer ton innan brevet skrivs"):** byt till "I kontot väljer du ton innan brevet skrivs." Startflödet utan konto saknar tonval, och den nya lydelsen gör tonen till en anledning att skapa konto.
- **53 ("Brev som fungerat" på verktygssidan):** ja till samma byte som på startsidan, "Brev att utgå från". Det är ett obelagt löfte om utfall.
- **61 (kedjans länk på jobbmatchningen):** ja till SEO:s "Håll koll på dina sökta jobb".
- **65 (Jobbcoachens brickor):** inga invändningar från försäljningen. "Sekunder till första svaret" ska bort eftersom det inte är mätt. Resten avgör SEO.
- **69 (påhittade tal i brevkortet):** ja, de stryks. Observera att samma tal ("42 miljoner", "fyra sådana", "Fyra upphandlingar") står kvar i exemplen på /verktyg/personligt-brev (rad 1729, 1768, 1770, 1792, 1811-1814). SEO och copy bör välja en regel för båda ställena, så att samma exempel inte är förbjudet i artikeln men tillåtet på verktygssidan.
- **71 (Word i Linne och Björk):** ja. "Din gratis nedladdning kan vara en Word-fil" är sant och säljer gratismallarna.
- Punkterna 13, 20, 22, 29, 37, 42 och 44: inga invändningar från försäljningen. Övriga punkter rör SEO, juridik eller form och lämnas därhän.

## Del 3. Det som saknas för att sidorna ska sälja

1. **Ett arket på Sökta tjänster som går att fylla i.** I dag är arket en bild med Saras exempel. Gör "Tjänst" och "Arbetsgivare" till riktiga fält och lägg in värdena i redirecten från K1: `/dashboard/sokta-tjanster?logga=1&tjanst=...&arbetsgivare=...`. Inloggat tar redan emot dem och fyller i arket (`src/app/dashboard/sokta-tjanster/page.tsx:26-44`). Det blir samma mönster som brevutkastet, där det man gjort före kontot följer med in, och det är vårt bästa mönster för att få besökare att skapa konto. Insats S i P4: en liten klientkomponent på den publika sidan, och inloggat rörs inte.
2. **Egna mätvarianter för de två nya reklamkorten.** `article_cta_shown` och `article_cta_clicked` läser `data-cta-variant` (`src/components/artiklar/ArtikelKlient.tsx:46-70`). Ge korten egna värden, till exempel `jobb-matchning` och `jobb-sokta`, och sätt `data-cta-klick` på knappen. Annars går det inte att avgöra om korten slår dagens kort i artiklarna om uppföljning, och de artiklarna är bland de mest klickade sidorna som rörs.
3. **Förnyelsemejlet ska gå till alla betalande, annars stämmer säljraden inte för alla.** Runnern hoppar över profiler med `quota_emails_opt_out` (`runner.ts:428`), fast mejlet är markerat som transaktionellt (`templates/komigang.ts:356`). Raden i K6 och på rad 1972 är alltså osann för den som har stängt av påminnelser. Det här är en produktfråga och ingen text: låt `paket_fornyas` gå före avregistreringen, så som ett kvitto gör. Tills det är rättat står raden kvar, eftersom den är sann för nästan alla. Det är en mejlregel, så ändringen beslutas av ägaren och görs inte i den här omgången.
