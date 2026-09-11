# Ställningstagande: tillväxt och konvertering

Granskare: SaaS-tillväxt. Till utkastet i `plan-utkast.md`.

## 1. De sex konfliktpunkterna

### Konflikt 1: FAB i mobilnavet

**Jag ansluter till sammankallandes förslag: bort med FAB:en, fyra slots plus Skapa-ark.** Jag föreslog en kontextuell FAB, och argumentet emot är starkare än mitt eget: en knapp som betyder olika saker på olika sidor är inte kontext, det är otydlighet. Skapa-arket löser dessutom det jag egentligen ville åt, att logga en ansökan ska vara nåbart i ett tryck från var som helst. Ett villkor för min anslutning: arket öppnas med "Logga ansökan" överst när användaren har minst en ansökan, annars "Nytt CV" överst. Ordningen i en lista är inte samma sak som en knapp som byter mål.

### Konflikt 2: Notisklockan

**Ansluter.** Behåll klockan, fyll den med uppföljningsnotiser, dölj den när listan är tom. En tom klocka är ett löfte som aldrig infrias, och användaren slutar titta efter tredje gången. Detta är ingen kärnfråga för mig.

### Konflikt 3: Snabbåtgärder

**Ansluter, med en precisering.** Kort i tillstånd B, en rad i tillstånd C är rätt uppdelning. Preciseringen: raden i tillstånd C får inte vara en statisk lista med alla åtta verktygen, den ska visa exakt en oprövad funktion i taget med en mening om varför just nu ("Du har sökt 11 jobb men aldrig kört en CV-analys"). En verktygsrad som aldrig förändras är samma problem som dagens sex kort, bara mindre. Gör den till en rad som byts när den använts, så blir den upptäcktsmotorn för verktyg som annars aldrig hittas.

### Konflikt 4: Huvudsiffra

**Jag ger mig, och det var förutsett.** Jag skrev själv att svarsfrekvens kan läsas som ett betyg på användaren och att ett UX-argument väger tyngre. Fyra beskrivande antal på hemskärmen, svarsfrekvens på ansökningssidan, är rätt avvägning. Jag håller fast vid en sak: "CV A ger 30 procent svar, CV B ger 8" måste faktiskt byggas på ansökningssidan, inte bara nämnas. Det är den enda insikten i hela produkten som ingen konkurrent kan kopiera, eftersom den kräver vår egen historik, och den är därför vårt starkaste enskilda skäl att betala månad efter månad.

### Konflikt 5: Gamification

**Ansluter till borttagning, och gör det med ett tillväxtargument utöver sammankallandes tre.** XP-stegen är en rabattstege förklädd till spel, och en rabattstege underminerar prissättningen: vi lär användaren att priset är förhandlingsbart om hon klickar tillräckligt mycket. Med 3 betalande av 304 har vi inget utrymme att träna kunder i att vänta på rabatt. Ett villkor: `SavedDiscountsAccordion` och redan utfärdade rabattkoder måste fortsätta lösas in tills de löper ut, annars bryter vi ett löfte mot befintliga konton, vilket är exakt det avsnitt 9 handlar om.

### Konflikt 6: Streak

**Ansluter: bort från hemskärmen, och bort helt om konflikt 5 går igenom.** En streak som är matematiskt omöjlig att hålla på gratisnivån är ett tävlingsmoment som bara betalande kan vinna, presenterat för någon som är arbetslös. Det är fel register, och dessutom en dold säljmekanism som vi inte kan försvara öppet. Ersättningen "3 ansökningar den här veckan" mäter rätt sak.

## 2. Tre övriga invändningar

### Invändning 1: Trial-insäljningen är för tunn i våg 1

Avsnitt 4 beskriver trial dag 1 till 5 korrekt, men i åtgärdslistan finns bara "stryk 7-dagarslöftena" som våg 1. Själva mekaniken, att dag 4 faktiskt vet vad användaren gjort under dag 1 till 3, ligger ingenstans. Utan användningslogg blir `showLossSummary` en generisk funktionslista, alltså precis den svaga variant vi redan har.

**Ändringsförslag:** lägg till en punkt i våg 1: logga premiumanvändning (nedladdat brev, körd analys, genomfört test, låst mall) som en rad per händelse i befintlig aktivitetslogg, och låt `UpgradeSheet` dag 4 rangordna sina tre förlustrader efter den loggen. Insats S, inga beroenden, och det är den enda kod som gör reverse trial till en konverteringsmekanism i stället för en gratisperiod.

### Invändning 2: Ansökningssidan saknar en betalvägg och en väg in

Avsnitt 5 gör ansökningar till produktens centrum, vilket jag driver hårdast av alla. Men sidan har idag noll köpimpulser, och utkastet lägger inte till någon. Samtidigt är tomma tillståndet det farligaste stället i hela produkten: den som aldrig loggar sin första ansökan får aldrig se navet fungera, och då faller hela visionen.

**Ändringsförslag:** två tillägg. Ett, importknapp i tomma tillståndet: "Du har 11 brev hos oss. Vill du logga dem som ansökningar?" Den fyller pipelinen på ett klick från data vi redan har, i stället för att be om elva manuella inmatningar. Två, en enda betalvägg på sidan, `PaywallCard` på AF-rapporten och exporten (månadsöversikten till Arbetsförmedlingen), inte på loggningen. Loggning måste vara gratis för alltid eftersom den skapar vårt inlåsningsvärde, men uttaget av den sammanställda rapporten är precis den "gratis att skapa, betalt att ta ut"-princip som redan är fattat beslut i `plan-konvertering.md`.

### Invändning 3: Våg 1 är sanning och kosmetik, men inget som flyttar intäkt

Punkterna 1 till 8 är rätt och ska göras, men av dem påverkar bara den första konvertering direkt. Våg 2 innehåller allt som faktiskt tjänar pengar, och en L-punkt som beror på en annan L-punkt (10 beror på 9) betyder att ansökningsnavet är minst fyra till sex veckor bort. Med 3 betalande kunder har vi inte den kalendern.

**Ändringsförslag:** flytta två saker upp till våg 1. Jobbmatchningens klippta lista (10 träffar plus prisrad) byts till alla träffar med de sista suddade och `PaywallCard` under, och testkorten öppnar testet i stället för prenumerationssidan. Båda är S, båda är rena omkopplingar av befintliga komponenter, och båda flyttar en spärr från före värdet till efter. Det är den enda ändringen i hela planen som kan höja konvertering samma vecka den släpps.

## 3. Bekräftelse

Övrigt godkänt.
