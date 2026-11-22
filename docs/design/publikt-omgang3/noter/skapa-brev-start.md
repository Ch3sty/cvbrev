# Not: /skapa-brev/start (skiss `skapa-brev-start`)

Källa: `sidor/skapa-brev-start.html`, med `delar/brev-exempel-visare-stil.html` (arket) och `delar/skapa-brev-start-mallar.html` (de 40 mallarna i väljaren). Bilder: `bilder/skapa-brev-start-375-*.png`, `-412-*`, `-1440-*`.
Kod i dag: `src/app/(public)/skapa-brev/start/page.tsx` och `StartFlow.tsx`, `src/app/api/public/letter-draft/route.ts` och `claim/route.ts`, `src/lib/letters/public-draft.ts`, `src/lib/letters/claim-draft-client.ts`.

Sidan är noindex med canonical till exempelsidan. Den rankar inte, men hit leder alla brevsidornas knappar: 89 exempelsidor, navet, säljsidan, 22 artiklar och reklamrutan.

## Tre lägen i skissen

1. **Start** (överst): besökaren kommer från visaren på exempelsidan för projektledare med Koppar vald.
2. **Efter "Skriv mitt brev"** (skissblad 1): utkastet är klart, spärren.
3. **"Byt mall" öppen** (skissblad 2): väljaren med alla 40.
Skissbladen (streckad kopparram) hör till skissen.

## Vad som ändras mot i dag

Sidan är i dag en vit sida med tre fält i den gamla formen (orange knapp, grå ramar, tre små ikoner som steg). Den ser inte ut som resten av sajten och inte som brevrummet.

1. **Hela flödet står på plommonväggen**, som Skriv brev inloggat: en panel med mörkt huvud till vänster, arket till höger. På telefon bara panelen.
2. **Yrket följer med, synligt.** Rubriken säger yrket som i dag. Fältet Tjänsten du söker är ifyllt och märkt "från exemplet". Överst en länk tillbaka till exemplet.
3. **Mallen följer med.** Överst i panelen raden "Mallen du valde: Koppar. Ingår i Premium, även som Word." med "Byt mall". I brett läge står arket bredvid i den mallen, med tjänsten ifylld och resten som tomma streck, och texten "Koppar, mallen du valde. Du provar den med ditt eget brev. Linne och Björk är gratis."
4. **Fälten** är desamma tre, med samma etiketter och hjälptext. Räknaren "0 av minst 200 tecken" har fått en stapel. "Klistra in jobbannonsen också" är en streckad rad med plus i stället för en liten textlänk.
5. **Panelens fot**: "Första personliga brevet är gratis. Du ser första stycket direkt och hela brevet när du har skapat ett gratiskonto." och knappen "Skriv mitt brev". Knappen är ritad matt, eftersom fälten är tomma.
6. **Utkastet klart.** Första stycket står på arket i den valda mallen, resten är tomma streck (aldrig suddad text, som i dag). En lapp säger "Första stycket", ett kort på arket säger att resten väntar. Panelen: H2 "Ditt brev är klart", samma text som i dag, tre rader om vad kontot ger, knappen "Skapa konto och läs brevet", "Inget kreditkort. Avsluta när du vill." och raden om sju dagar. På telefon ligger arket före panelen, så att man ser brevet först.
7. **Byt mall** öppnar en väljare med alla 40 mallarna, filtren ur brevrummet (Alla 40, Gratis, Enkla, Med färg, Sidospalt), "Gratis" på Linne och Björk, "Vald" på den man har, och en fot med mallens namnrad och "Använd Koppar".

Illustrationerna i `StartFlowIllustrations` (IlluUtkastKlart, IlluBlurGate, stegikonerna) behövs inte längre. Arket är bilden.

## Text: oförändrat och nytt

Oförändrat: H1 ("Skriv ditt personliga brev som projektledare", utan yrke "Skriv ditt personliga brev"), ingressen, de tre fältens etiketter och hjälptext, "Klistra in jobbannonsen också", "Skriv mitt brev", H2 "Ditt brev är klart" och stycket under, "Skapa konto och läs brevet", "Inget kreditkort. Avsluta när du vill.", "Utkastet för projektledare sparas i sju dagar."

Nytt: "Tillbaka till exemplet för projektledare", panelhuvudet "Tjänsten och du" och "Allt går att ändra efteråt", raden om mallen, märket "från exemplet", fotens mening om gratisbrevet, arkets underrad, de tre raderna i spärren ("Hela brevet, att läsa och kopiera", "Brevet öppnas i Koppar, mallen du valde", "Nedladdning som PDF och Word ingår i Premium"), lappen "Första stycket" och kortet "Resten av brevet väntar på dig. Du ser det när du har skapat konto.", väljarens "Välj mall" och raden "Linne och Björk är gratis. De övriga 38 ingår i Premium, och du provar dem med ditt eget brev."

Platshållaren i Arbetsgivare är "Till exempel Sweco" i skissen (i dag "Till exempel ICA Maxi Haninge" för alla yrken). Förslag: en platshållare som passar yrket, annars dagens.

## Vad det kräver i bygget

**A. Mallen in i startflödet** (det som gör att knappen kan heta "Använd som mall")
1. `page.tsx`: läs `mall` ur searchParams bredvid `yrke`, kontrollera den mot `brevMallKatalog()` och fall tillbaka på förvalet (Linne). Skicka `initialMall` till StartFlow.
2. Länkarna hit får `&mall=<id>`: visarens knapp och länk (`BrevVisare.tsx`, `handling.href` byggs med vald mall), exempelsidans hjälte och kommentarskort (Linne, eller ingen parameter). Klickmätningen har redan mallen.
3. `StartFlow.tsx`: håll mallen i state, visa raden och arket. Arket kan ritas av brevmotorns renderare, som enligt byggnoten går att ladda i klienten (`src/lib/letters/brevmall/render.ts`), med tjänsten ur fältet och tomma stycken. Efter utkastet: samma ark med första stycket. Alternativet är en liten rutt som ritar ett tomt ark per mall. Rutten `/api/public/exempel/brev` duger inte som den är: den ritar exempelbrev och byter Kalksten och Granit mot Linne.
4. Mallen ska överleva registreringen. Enklast som för CV-utkastet: `claim-draft-client.ts` sparar redan "yrke:mall" för CV:t, brevet kan spara mallen bredvid utkastets token på samma sätt. Då behövs ingen ny kolumn. Vill man kunna se valet i statistiken läggs `mall_id` på `public_letter_drafts` (en nullbar kolumn, en migrering).
5. `claim/route.ts` skapar i dag brevet som ren text utan `mall_id`, och det ritas då i den gamla formen tills första ändringen (byggnoten för brevrummet, "Det jag såg men inte ändrade"). För att mallen ska gälla måste claim skriva brevet i det nya formatet: styckena och `mall_id`. Gratiskonto: Linne och Björk sparas. Är den valda mallen en Premiummall sparas brevet i Linne och öppnas med mallen provad, precis som brevrummet redan gör (`/dashboard/mina-brev/mallar?brev=<id>&mall=koppar`, "Du provar mallen Koppar"). Spärren i skissen säger därför "Brevet öppnas i Koppar", inte "sparas i Koppar".
6. Väljaren: `src/components/brev3/mallar/MallValjare.tsx` finns och tar bara props. Utan konto ska Premiummallarna gå att välja (prova), så den behöver ett läge utan låstagg och utan köpsteg. Miniatyrer: katalogens CV-miniatyrer fungerar direkt (skissen använder dem). Brevminiatyrer finns bara för åtta mallar i dag, resten ritas med `scripts/brevmallar-miniatyrer.ts`.

**B. Annonsen in från säljsidan** (om annonsfältet i säljsidans lyftkort byggs)
7. Säljsidan lägger annonsen i sessionStorage och går till `/skapa-brev/start`. StartFlow läser den, fäller ut fältet och fyller det. Ingen text i URL:en, och ingenting sparas på servern förrän besökaren trycker på Skriv mitt brev.

**C. Mätning**
8. `sample_started` och `sample_completed` får `template` så att det går att se vilka mallar som bär in folk.

Storlek: A är det som krävs för uppdragets "mallen och yrket följer med". Punkt 5 är den enda som rör brevets motor. B och C är små.

## Det som kräver beslut

1. **Premiummall utan konto.** Skissen låter besökaren välja vilken mall som helst och säger öppet att den ingår i Premium. Efter registreringen provar man mallen och brevet står sparat i Linne. Alternativet är att bara Linne och Björk går att välja före konto. Mitt förslag är det första: det är så brevrummet redan fungerar, och visaren har redan visat mallen.
2. **Ton.** Det publika flödet har inget tonval i dag, och jag har inte ritat något. Säljsidan lyfter fram fem toner. Ska tonen in här blir det ett fjärde val och en ändring i `/api/public/letter-draft`.
3. **Annonsen.** I dag är den ett valfritt tillägg sist. Säljsidan säger "Klistra in annonsen och berätta kort om dig". Jag har behållit ordningen men gjort raden tydligare. Vill sälj ha annonsen först är det en omkastning av fälten.
4. **Sidhuvud och fot.** Skissen har vanlig meny och fot. Inloggat har flödet helskärm. En avskalad meny (logga och Logga in) vore lugnare, men det är ett beslut för alla publika flöden, inte bara det här.
5. **Arket på telefon** visas inte i startläget, bara mallraden. Efter utkastet visas det, först.

## Filer bygget rör

- `src/app/(public)/skapa-brev/start/page.tsx`, `StartFlow.tsx` (i praktiken omskriven).
- `src/app/api/public/letter-draft/claim/route.ts`, `src/lib/letters/public-draft.ts`, `src/lib/letters/claim-draft-client.ts`.
- `src/components/publikt/brevvisare/BrevVisare.tsx`, `MallValjare.tsx` på exempelsidan och `ExempelMall.tsx` (länkarna).
- `src/components/brev3/mallar/MallValjare.tsx` (läge utan konto) eller en publik syskonkomponent.
- `src/components/illustrations/StartFlowIllustrations` kan tas bort om inget annat använder dem.
- Eventuellt en migrering för `public_letter_drafts.mall_id`.

## Förslag till grunden

- Formulärets delar (panel med mörkt huvud, fält, etikett, räknare med stapel, streckad "lägg till"-rad) finns inte i kit.css. Login, registrering, CV-uppladdningen och det här flödet behöver samma. Mina heter `.panel`, `.inp`, `.etk`, `.rakna`, `.mer`.
- **Fällan med ljus text slog till igen**: en `.h2` och en `.liten` i en vit panel på väggen ärver väggens ljusa färg. Grunden rättar `.kort`, `.lyft`, `.svav`, `.traff`, men inte egna pappersytor. En klass `.papper` som nollställer rubrik, stycke, `.ey` och `.liten` till bläck vore säkrare än listan.
- `loading="lazy"` på bilder långt ner i en skiss ger tomma rutor i rendera.mjs. Antingen låter skriptet sidan rulla igenom före bilderna, eller så skriver man aldrig lazy i skisser. Jag har tagit bort det i väljaren.
