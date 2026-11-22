# Logg P3: personliga brev (publikt omgång 3)

Byggt 2026-11-22 på `design/publikt-omgang3` i `C:\Users\chris\cvbrev-publikt3`. Ingen commit, ingen push. Ingen dev-server, ingen build, ingen webbläsare och ingen SEO-diff (byggbriefen, Datorn). Allt nedan är genomläst i koden mot skissen, noten, SEO:s besked och sidans gamla version (`git show HEAD:<fil>`), inte sett renderat.

## Beslut 6: mallen följer INTE med in i kontot

Startflödet kan inte ta emot mallen utan ändring i brevmotorn: `claim/route.ts` skapar brevet som ren text utan `mall_id`, och för att mallen ska gälla måste claim skriva brevet i det nya formatet (noten `skapa-brev-start`, punkt A5). Redirecten efter registreringen ligger i `src/lib/letters/claim-draft-client.ts`, utanför paketet. Därför:

- Visarens knapp heter "Skriv ditt eget brev" (som i dag, `VISARE_TEXT.skriv`), på exempelsidorna och i artiklarna.
- Knappens adress får `mall=<id>` först när besökaren har bytt mall i visaren. I Linne (första vyn, den som står i serverns HTML i artiklarna) är adressen exakt som förut: `/skapa-brev/start?yrke=<yrke>` på exempelsidorna och `/skapa-brev/start` i artiklarna. Hjältens och kommentarskortets länk är oförändrad (SEO:s besked 13).
- `/skapa-brev/start` läser `?mall=`, kontrollerar den mot brevets katalog och visar valet i panelen ("Mallen du tittade på: Koppar. Ingår i Premium, även som Word.") och under arket ("Koppar, mallen du tittade på. Du väljer mall när brevet är klart, i ditt konto."). Valet sparas inte. Inga påståenden om att brevet öppnas i mallen.
- Väljaren med alla 40 mallar i startflödet (skissblad 2) är inte byggd: utan att valet sparas vore den en låtsasfunktion.

## 1. /verktyg/personligt-brev (skiss `personligt-brev`): klar

Fil: `src/app/(public)/verktyg/personligt-brev/page.tsx` (omskriven i grundens komponenter), ny `personligt-brev.css`. `layout.tsx`, `brev-faq-data.ts` och schemat orörda.

Byggt, sektion för sektion: hjälten på plommonväggen med grundens `Brevpar` (annonsens krav och brevet, "3 av 4 krav har fått svar"); lyftkortet "Skriv ett brev utan konto" med annonsfältet och gratisraderna; Så fungerar det som `VagSteg` med en bild per steg och tonblocket under; 40 mallar med sju kort (brevets egna miniatyrer, Gratis- och Premiummärke, format) och det mörka kortet "Alla mallarna"; reglerna med brevets tre stycken på en plommonyta, skalan 250 till 350 ord och fem numrerade kort; resultatet som en ö med kravpanelen och de tre korten; fördjupningen med exempelnavets kort (talet ur `BREV_GALLERI`) och fem länkbrickor; Premium som `PremiumO` med tre bockar; frågorna.

Kontrollerat mot den gamla versionen: alla åtta h2 och alla 25 h3 i samma ordning och lydelse, HowTo-stegens fyra texter ordagrant (samma lista ritar stegen och schemat), FAQ åtta frågor och svar ur samma data, alla länkmål kvar (`/skapa-brev/start`, `/register?borja=brev`, `/personligt-brev-exempel` tre gånger, `/cv-mallar`, de fem artiklarna, `/priser`, mailto, brödsmulans `/funktioner`). Skriptkontroll: varje textsträng i gamla page.tsx finns i nya, utom "nyckelorden" (se nedan).

Beslut:
- Hjältens knapp "Skriv ett brev nu" till `/skapa-brev/start` (SEO JA). "Skapa ditt brev gratis" står kvar i Premium.
- "plockar ut nyckelorden" blir "plockar ut kraven" (SEO JA).
- Annonsfältet i lyftkortet är en bild (`aria-hidden`), knappen en vanlig länk (SEO:s villkor när startflödet inte tar emot annonsen).
- Hjältens bild är grundens `Brevpar` med dess påhittade arbetsgivare (Nordhaga Bygg), inte skissens Sweco: grunden säger påhittade arbetsgivare, aldrig riktiga företag. Kravpanelen använder samma fyra krav (`SARA_KRAV`) och citat ur samma brev, så att bilderna säger samma sak (3 av 4, PMP saknas). Skissen ritade sju krav och 42 miljoner.
- Tonblockets rubrik är ett stycke. Exempelmeningarna står i en ruta märkt "Exempel", och ingressen säger "kan låta". Toner och underrader som i kontot (`brev3/arbete/texter.ts`, kopierade, inte importerade). Meningarna om 42 miljoner är bytta mot "inom budget och två veckor före plan" som i grundens brev.
- Regel 1:s efterexempel "Ledde intressentdialogen i tre projekt" (SEO). Regel 2 använder exemplet i texten.
- Den fasta knappraden på telefon (`FastKnapprad`) är borttagen: skissen har den inte, och dess länkmål finns kvar på sidan.
- Kortet "Ett brev gratis" behåller "och de två senaste går att ändra" (dagens text, skissen hade strukit det).

Ny text utan godkännande (finns inte i textbeslut eller nytt-innehall): etiketterna "Från annons till ansökan", "Prova utan konto", "Så mycket är gratis", "Tonen"; underraderna i gratislistan ("Första stycket står på arket direkt.", "Utan kortuppgift. Allt du skrivit ligger kvar.", "Att läsa och kopiera texten är gratis."); "Har du ingen annons? Börja med tjänsten och arbetsgivaren."; tonblocket ("Fem toner. Samma erfarenhet, olika röst.", ingressen, fem exempelmeningar, "Vi väljer ton åt dig" med raden); resultatets ingress ("Varje krav i annonsen får en siffra ... när brevet är klart."); kravpanelens texter ("Kraven i annonsen", "3 av 4 har fått svar i brevet", "Står i annonsen men inte i brevet.", "En mening med ett exempel ur ditt CV räcker.", "Lägg till i brevet"); chipet "utan kortuppgift"; "Se alla yrken"; Premiums tre bockar (enligt noten, talen ur katalogen); "Ditt CV", "Ditt brev".

Avviker från skissen: arket i hjälten är Brevpar (fyra krav) i stället för skissens sjukravsark med siffror i texten; kravpanelen har fyra krav i stället för sju. Steg 2:s bild säger "+1 krav". Språkvalet Svenska och English är en bild, inte ett reglage.

Återstår: att se sidan renderad (375, 412, 1440) och mäta ordantalet i grinden. Twitter-beskrivningen (BRV-1) är fortfarande överhoppad (169 tecken, bygglogg-text).

## 2. /personligt-brev-exempel och kategorisidorna (skiss `brev-exempelnav`): klar

Filer: `src/app/(public)/personligt-brev-exempel/page.tsx` (ritar nu själv i stället för `GalleriPageContent`), `kategori/[kategori]/page.tsx` (ritar nu själv i stället för `KategoriPageContent`), nya `src/components/publikt/innehall/exempel/BrevNav.tsx` (branschbrickorna, hjältens bild), `BrevYrkesKort.tsx` (korten), `brev-exempel.css`. `GalleriPageContent`, `MallarGuideSection`, `KategoriPageContent`, `HubbSok`, `galleri-faq.ts` och `exempel-data.ts` är orörda (CV-sidorna och /exempel använder dem).

Byggt: hjälten med tre riktiga brev (brevmotorns miniatyrer), tre yrkeslappar och talet, sökfältet och situationsraden; lyftkortet med tio branschbrickor största först, talet stort och en stapel, "Alla yrken" mörk; 89 kort med en gemensam Linne-miniatyr (tomt alt), branschen, yrket som h3 och raden; "Behöver du även CV?" som ö i petrol; guiden med bilden mall mot exempel och fyra kort; frågorna; slutön med brevet.

Kontrollerat: h1, h2 "89 yrken", "Behöver du även CV?", guidens h2 och fyra h3, frågornas h2, "Klar att skriva ditt eget brev?"; alla 89 kort i serverns HTML i samma ordning; nio frågor; schemat (ItemList, BreadcrumbList, FAQPage) som förut; länkarna (fyra situationer, tio branscher med samma ankartext som förut ("Vård och omsorg 17"; talet ritas ovanför med CSS), nu största först i stället för katalogens ordning (skissen), 89 yrken, `/cv-exempel`, artikeln Personligt brev mall gratis, brevverktyget, `/exempel`, `/skapa-brev/start`). Sökfältet är samma GET-formulär som förut (`HubbSok`): utan JavaScript står alla kort kvar.

Beslut:
- Guidens fjärde svar: skissens lydelse med SEO:s villkor. "mall" står kvar genom "och varje exempel fungerar som mall" och dagens sista stycke ("kopiera texten från en mall"), "ladda ner" i Premiumraden, "gratis" i flera meningar.
- FAQ-svaret om samma brev för flera jobb: SEO:s lydelse, ändrad lokalt i sidan (`FRAGOR`), synligt och i FAQPage, eftersom `galleri-faq.ts` delas med /exempel.
- Kategorisidorna: samma sida med branschen vald (noten). H1, de tre h2, schemat och länkarna står. Korten har "Personligt brev-exempel" som etikett (dagens rad på korten) och navets rad. Vårdens "20+ yrken" byts mot talet ur datan, synligt och i CollectionPage (SEO JA, `LD_UNDANTAG` finns). Serverkomponent, framer-motion borta.

Ny text utan godkännande: "Alla exempel", "Välj bransch", "Tio branscher. Hitta den som är din." (kategorisidorna: "Tio branscher. Byt till en annan."), "Hela listan står här nedanför", "Tillbaka till hela listan", "yrken, ett färdigt brev var", bilden "Mall och exempel" (aria-hidden), Gratis- och Premiumraderna i guidens fjärde svar, märkena "1 Inledningen" och så vidare (aria-hidden).

Avviker från skissen: hjältens brev är brevmotorns miniatyrer (Erik Lindberg), inte skissens Sara. Kategorisidan har ingen egen hjältbild.

## 3. /personligt-brev-exempel/[yrke] (skiss `brev-exempel`, 89 sidor): klar

Filer: ny `src/components/publikt/innehall/exempel/BrevExempelMall.tsx`, `PersonligtBrevExempelPage.tsx` pekar dit. `page.tsx` (metadata och de fyra schemablocken) och `exempel-data.ts` orörda. `ExempelMall.tsx` är orörd och ritar bara CV-exemplen nu. `TipsKort.tsx` exporterar `tolka` (ingen ändring i CV:ts utdata). `MallValjare.tsx`: knappen Byt mall visar de fem riktiga miniatyrerna och skickar länken "Se alla 40 brevmallar" till visaren.

Arbetsgång: byggd först som en mall och genomläst mot ExempelMalls brevgren (projektledare, sedan reglerna för alla 89: samma fält, samma rubriker). Skriptkontroll: varje textsträng i ExempelMall och AnsokanPar finns i BrevExempelMall, utom CV-grenarnas.

Kontrollerat: h1 (yrket), h2 i samma ordning (Komplett exempel på 60 sek, Det här gör brevet starkt, Tips för yrket, Så skriver du ett personligt brev som yrket, Jobbkartans h2 där den finns, personligt brev för yrket, Skapa hela ansökan, Fler personliga brev-exempel, Mer om yrket, Verktyg som hjälper dig vidare, Imponerad? Skapa ditt nu), alla h3, FAQ, brevets alla fält serverrenderade ord för ord, länkarna (hjälten och kommentarskortet `/skapa-brev/start?yrke=<yrke>`, slutet samma, `/exempel`, `/personligt-brev-exempel` i smulan och ingressen, `/cv-exempel/<yrke>`, `/dashboard/skapa-cv`, `/dashboard/skapa-brev`, relaterade yrken, artiklar, verktyg). Brödsmulan skriver inget schema (page.tsx har BreadcrumbList).

Beslut:
- Siffrorna vid styckena: där ankare finns står siffran först i stycket på telefon och i marginalen från 900 px. Där ankare saknas ritas kommentarerna utan siffror (inga tomma ringar), och korten under "Det här gör brevet starkt" numreras 1 till 4 (SEO JA, inget datajobb).
- Exempelmeningen i tipsen: regeln "ett stycke som slutar med kolon följt av en mening inom raka citattecken" lyfter citatet till en ruta, bara första träffen per tips, alla ord kvar. Passar regeln inte står stycket som förut.
- Slutet: "klart på några minuter" (SEO JA). H2 "Komplett exempel på 60 sek" och beskrivningarna orörda (SEO NEJ).
- H2 "personligt brev för yrket" får stor bokstav med CSS (`::first-letter`), texten orörd.
- Hjältens ark visas bara från 1000 px (telefon: kort hjälte, brevet direkt).
- "Skapa hela ansökan": CV-kortet visar förvalsmallens riktiga CV-miniatyr, brevkortet Linne.

Ny text utan godkännande: "Brevets tre delar" med Inledningen, Huvuddelen, Avslutningen och raderna (aria-hidden bild i skrivguiden).

Avviker från skissen: hjältens ark visar brevets början i en förenklad Linne, med Koppar och Ritning som brevmotorns miniatyrer bakom. Visarens knapp heter "Skriv ditt eget brev" (beslut 6). Slutöns bild är grundens Brevpar (Sara, projektledare) på alla 89 sidor.

Återstår: ordantalet per sida mäts i grinden. Siffrorna i kommentarerna tar några ord ur räkningen (`Nr` är aria-hidden), högst fyra per sida.

## 4. Mallvisaren (`src/components/publikt/brevvisare/`): klar

- Första vyn (Linne) står i serverns HTML i artiklarna som förut; på exempelsidan laddas visaren vid klick som förut.
- Inga rubriker, inga kronor, ingen spärr, fotraden ordagrant (`visarFot`).
- Ny länk efter fotraden: "Se alla 40 brevmallar" till `/verktyg/personligt-brev` (`visarAllaLank()` i `visare-data.ts`, talet ur katalogen), i båda sammanhangen.
- Miniatyrraden ligger över arket i smalt läge (CSS `order`), lodrät remsa till höger i brett läge som förut.
- Formen: papper med klack, plommonytan ur tokens (`data-p3-farg="brev"`), kopparknappen `p3-knapp`. `BrevVisare.tsx` laddar `v3.css` själv så att knappen ser rätt ut också där sidan inte har `Sida`.
- Rutten som ritar brevet (`src/app/api/public/exempel/brev/`) är orörd.

## 5. Artiklarna med visaren (skiss `brev-artikel`): klar för P3:s del

Visarens form och plats i spalten (CSS i `brevvisare.css`), miniatyrerna över arket på telefon, "Läs brevet som text" som utfälld `details` med plus och minus i en liten ruta som i frågorna. `BrevVisareArtikel.tsx` skickar länken "Se alla 40 brevmallar". Inget i `src/components/artiklar/**`, `src/app/(public)/artiklar/**` eller mdx-filerna är rört. Reklamrutan är P4:s.

## 6. /skapa-brev/start (skiss `skapa-brev-start`): klar utom väljaren

Filer: `src/app/(public)/skapa-brev/start/page.tsx`, `StartFlow.tsx`, ny `skapa-brev-start.css`.

Byggt: plommonväggen med länken tillbaka till exemplet, h1 och ingressen; panelen med mörkt huvud ("Tjänsten och du", "Allt går att ändra efteråt"), mallraden när `?mall=` finns, de tre fälten med samma etiketter, hjälptext och platshållare, märket "från exemplet", räknaren med stapel, den streckade raden "Klistra in jobbannonsen också", felrutan, och foten med gratismeningen och "Skriv mitt brev". Arket till höger (från 1000 px) med tjänsten och arbetsgivaren ifyllda och resten tomma streck. Efter utkastet: arket först på telefon med första stycket, lappen "Första stycket" och kortet om resten; panelen med "Ditt brev är klart", dagens text, tre rader och "Skapa konto och läs brevet", "Inget kreditkort. Avsluta när du vill." och raden om sju dagar.

Logiken är oförändrad: samma anrop till `/api/public/letter-draft` med samma fält, `storePendingDraft`, samma mätning (`sample_started`, `sample_completed`, `signup_gate_shown`, `signup_started`), samma kontolänk `/register?draft=<token>`, `useFriSikt` på spärren, samma minimilängd. `noindex`, canonical och titeln orörda.

Beslut:
- Spärrens andra rad är "Brevet sparas i ditt konto" (sant, "vi sparar det åt dig") i stället för skissens "Brevet öppnas i Koppar" (inte sant utan beslut 6).
- Platshållaren i Arbetsgivare är dagens ("Till exempel ICA Maxi Haninge") för alla yrken.
- Ingen avskalad meny, inget tonval, annonsen sist som i dag (noten, beslut 2 till 4).

Ny text utan godkännande: "Tillbaka till exemplet för {yrke}", "Tjänsten och du", "Allt går att ändra efteråt", "Mallen du tittade på", "från exemplet", "Första personliga brevet är gratis. Du ser första stycket direkt och hela brevet när du har skapat ett gratiskonto.", arkets platshållare ("Ditt namn", "din e-post · ditt telefonnummer · din ort", "Arbetsgivaren", "Ansökan: tjänsten du söker"), bildtexten om mallen, "Utkastet är skrivet", "Hela brevet, att läsa och kopiera", "Brevet sparas i ditt konto", "Nedladdning som PDF och Word ingår i Premium", "Första stycket", "Resten av brevet väntar på dig. Du ser det när du har skapat konto."

Återstår: väljaren med alla 40 mallar och att mallen följer med in i kontot (kräver ändring i claim och brevmotorn, se beslut 6). `StartFlowIllustrations` används inte längre av sidan; filen står kvar (P5 städar).

## Filer jag har ändrat

Inom paketet: `src/app/(public)/verktyg/personligt-brev/page.tsx` + `personligt-brev.css` (ny); `src/app/(public)/personligt-brev-exempel/page.tsx`, `[yrke]/PersonligtBrevExempelPage.tsx`, `kategori/[kategori]/page.tsx`; `src/components/publikt/innehall/exempel/BrevExempelMall.tsx` (ny), `BrevNav.tsx` (ny), `BrevYrkesKort.tsx` (ny), `brev-exempel.css` (ny), `MallValjare.tsx`, `TipsKort.tsx` (export); `src/components/publikt/brevvisare/BrevVisare.tsx`, `BrevVisareArtikel.tsx`, `brevvisare.css`, `visare-data.ts`; `src/app/(public)/skapa-brev/start/page.tsx`, `StartFlow.tsx`, `skapa-brev-start.css` (ny). Loggen och fem rader i `onskemal.md`.

Utanför paketet: inga. Läst men inte ändrat: `exempel/components/*` (delas med CV och /exempel), `brev3/arbete/texter.ts`, grunden.

Undantagsfilen: ingen ny rad behövs enligt min genomläsning (inga rubriker, FAQ-frågor eller länkmål försvinner; FAQPage på navet och CollectionPage på vårdens kategorisida har redan `LD_UNDANTAG` från SEO).

## Kontroller

- `node C:\Users\chris\cvbrev\scripts\arbetsyta.mjs`: 3,1 GB ledigt vid start, 1,8 GB vid första försöket (typkontrollen väntade), 2,5 GB vid andra.
- `npx tsc --noEmit`, en gång i slutet: inga fel (hela arbetskopian, med de andra paketens ändringar som de låg då).
- Vitest är inte körd. Berörda tester att köra i integrationen: `src/components/publikt/brevvisare/__tests__/BrevVisareArtikel.test.tsx` och `visare-data.test.ts` (Linnes länk är fortfarande `/skapa-brev/start`, inga rubriker, fotraden ordagrant).
- Ingen dev-server, ingen build, ingen webbläsare, ingen SEO-diff, inga anrop mot produktionen eller databasen.
