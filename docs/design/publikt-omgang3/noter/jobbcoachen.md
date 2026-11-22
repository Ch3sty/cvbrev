# Not: /verktyg/jobbcoachen

Skiss: `sidor/jobbcoachen.html`, rum `jobb` (i dag `neu`: briefen lägger Jobbcoachen under Jobbsöket). Bilder: `bilder/jobbcoachen-375|412|1440-NN.png`.

## Vad som ändras mot i dag, sektion för sektion

1. **Hjälten.** Telefonen `SkarmCoach` är borta (lönespannet 48 000 till 56 000 kr, "med din bakgrund från NCC", "Svaren utgår från ... ditt CV"). I stället står samtalet i stor skala, med startsidans exempel om uppföljning efter tolv tysta dagar, källmärken i texten, källorna under svaret och skrivfältet. Bredvid ligger kortet Frågor utifrån ditt läge med två brickor ur de sökta tjänsterna.
2. **Lyftet (i dag den rullande demon).** Tre exempel som byts av sig själva blir ett svar som står stilla och går att läsa: frågan om uppsägningstid, svaret med två källmärken och de tre delarna förklarade (kort svar, källan i texten, källorna går att öppna). Knappen går till registreringen.
3. **Så fungerar det.** Fyra steg som väg, varje steg med en bild: skrivfältet, de sex källorna, ett svar med källmärke och två bubblor ur ett samtal.
4. **Nytt block under stegen: Jobbcoachen föreslår frågor utifrån ditt läge (2.13).** Listan som den ser ut i kontot (brickan och frågan), och två rutor som säger vad svaren utgår från och vad Jobbcoachen inte läser.
5. **Sex områden vi hjälper dig med.** Sex textrader blir sex kort där exempelfrågan står som en bubbla överst.
6. **Verifierad svensk arbetsmarknadsdata.** Sex rader blir ett färgblock med sex källkort, och raden om hur kunskapsbasen uppdateras (ur FAQ-svaret) står under.
7. **Sluta googla. Fråga någon som vet.** Gratiskvoten som tio brickor, Premium som en stapel utan slut.
8. **Frågorna.** De åtta i dag, plus en ny.

## Oförändrat för SEO

- H1 och de fem H2 i samma ordning: Så fungerar det · Sex områden vi hjälper dig med · Verifierad svensk arbetsmarknadsdata · Sluta googla. Fråga någon som vet. · Vanliga frågor om karriärrådgivning.
- Alla sexton H3 ordagrant (fyra steg, sex områden, sex källor). Ingen ny H2: lyftets rubrik är satt som stor text utan rubriknivå, och det nya blocket har en H3.
- Löptexten i stegen, områdena och källorna står ordagrant. Exempelfrågorna är desamma, bara flyttade till bubblan.
- De åtta FAQ-frågorna ordagrant och i samma ordning. Sju svar ordagrant, ett ändrat (nedan).
- Schema: WebApplication, HowTo, FAQPage. Title, description, canonical och slug rörs inte.

## Bytt för att det var osant

| Var | I dag | I skissen |
|---|---|---|
| Telefonen i hjälten (3.5, beslut 18) | "Svaren utgår från svensk arbetsmarknad och ditt CV.", lönespann i kronor, "Med din bakgrund från NCC" | Samtalet om uppföljning, inget belopp, ingen hänvisning till CV:t |
| Demon (`JobbcoachenLiveDemo.tsx`) | Tre svar med belopp och tal: "cirka 30 200 kr i månaden", "runt 32 500", "var fjärde person mellan 40 och 50 byter bransch" | Ett svar utan belopp. Kartläggningen tar inte upp demon, men den bryter mot samma regel som telefonen: lön skrivs aldrig ut, och talen har ingen kontrollerad källa |
| Slutblocket (1.18) | "Jobbcoachen så mycket du vill, med ditt CV i samtalet, ingår i Premium." | "Jobbcoachen så mycket du vill ingår i Premium." Att dela CV:t är inte Premium |
| FAQ 8, sista meningen | "två CV-mallar, en CV-analys, ett personligt brev var sjunde dag ..." | "två CV-mallar, CV-analysens poäng och genomgång, ett personligt brev var sjunde dag ..." CV-facit: aldrig "en analys per konto" |
| `featureList` i schemat (2.13) | saknar förslagen utifrån läget | bör få "frågeförslag utifrån dina sökta tjänster". Inte ritat |

Det nya blocket säger: svaren utgår från målroll, ort och bransch ur profilen, dokument som användaren själv delar och det som redan sagts i samtalet. Jobbcoachen läser inte matchade jobb och inte testresultat. Förslagen räknas fram ur de sökta tjänsterna, utan att svaret känner till dem (`src/lib/jobbsok/coach.ts`, `src/app/api/jobbcoachen/chat/route.ts`).

## Kräver beslut

1. **Källorna i exemplen måste finnas.** Skissen visar "Arbetsförmedlingen" och "Unionen" som källor till rådet om uppföljning, och "Lagen om anställningsskydd" och "Unionen: Uppsägningstid" till svaret om uppsägningstid. Jag har inte kontrollerat att kunskapsbasen har de dokumenten eller att svaren blir så. Byggaren ställer frågorna till den riktiga Jobbcoachen och ritar av svaret, eller byter exempel.
2. **"Lagen ger dig minst en månad"** är ett påstående om lag i en säljtext. Kräver källa (LAS 11 §) eller ett annat exempel.
3. **Ny FAQ-fråga: "Vad vet Jobbcoachen om mig?"** Den ändrar FAQPage-schemat. SEO avgör om den ska med, och svaret ligger nära texter om datahantering: ägaren bör se det.
4. **Exempelfrågan "Vad tjänar en projektledare i Göteborg?"** står kvar i området Marknadslön. Den skriver inte ut någon lön, men den lovar "en siffra att utgå från". Det är sant om svaret har källa.
5. **Förslaget "Hur svarar jag på lönefrågan hos Polhem Ombyggnad?"** är ett av produktens riktiga förslag (`coach.ts`). Företagsnamnet är påhittat.
6. **Rummet.** Sidan står i skog. I dag är den grå. Stämmer med menyn och foten i skissgrunden.

## Filer bygget rör

- `src/app/(public)/verktyg/jobbcoachen/page.tsx` (slutblockets text, `featureList`, ordningen på blocken).
- `src/app/(public)/verktyg/jobbcoachen/components/JobbcoachenLiveDemo.tsx` (skrivs om eller ersätts) och `jobbcoachen-faq-data.ts` (svar 8, eventuellt en nionde fråga).
- `src/components/publikt/telefon/skarmar/SkarmCoach.tsx`: används också på startsidan, `/funktioner`, `/priser`, `/rakna-ut`, kalkylatorsidorna och i artikelreklamen. Texten och exemplet byts där i samma push (beslut 18), även om telefonen försvinner från den här sidan.
- `VerktygsMall` räcker inte till de nya blocken: sidan behöver en egen uppställning, som jobbmatchningen.

## Förslag till grunden

- **`delar/chatt.html`** saknar källor. Lägg till källmärket (`.kref`) och källraden (`.kallor`, `.kalla`) i `kit.css` och i delen, så att startsidans samtal också visar att svaren har källa.
- **Förslagsraden med bricka (`.forslagrad`)** behövs på startsidan om Jobbcoachens avsnitt ska visa förslagen utifrån läget.
- **Papper på en ö:** grunden rättar textfärgen för `.kort`, `.lyft`, `.svav` och `.traff`. Mina egna pappersytor (`.kallkort`, `.laget`) fick ljus rubrik tills jag satte färgen själv. En allmän regel för rubriker på papper på en ö vore säkrare.
- **Brickornas bredd under 400 px:** ordet "meddelanden" ryms inte i en bricka på 375 px. Jag gav den första brickan mer bredd på sidan.
