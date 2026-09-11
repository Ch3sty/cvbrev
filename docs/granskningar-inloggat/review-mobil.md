# Ställningstagande: mobil, flöden, interaktionsdesign

## 1. De sex konfliktpunkterna

**1. FAB i mobilnavet. Jag står bakom förslaget: bort, fyra slots plus Skapa-ark.**
Det är min position och sammankallandes skäl är rätt formulerat. Jag vill bara
spika en detalj som avgör om det fungerar: Skapa-arket måste öppnas som ett
bottenark med tre rader på minst 56 px, inte som en centrerad modal, annars
flyttar vi tummen från nederkanten till mitten av skärmen och tappar hela
vinsten med enhandsgrepp. Arket ska också gå att stänga med svep nedåt och med
tryck utanför.

**2. Notisklockan. Jag godtar förslaget, med ett tillägg.**
Behåll och fyll med uppföljningsnotiser, dölj när tom. Tillägget är att klockan
inte ska pollas var 60 sekund på mobil: en poll per sidladdning plus realtime på
den tabell notiserna ligger i räcker, eftersom en minutvis poll på mobil kostar
batteri och data utan att ge något användaren märker. Om det blir för dyrt att
bygga realtime i den här omgången accepterar jag poll, men då på fem minuter,
inte en.

**3. Snabbåtgärder. Jag godtar förslaget, kort i B och en rad i C.**
Det var inte min position, jag ville ha fyra kompakta kort i två kolumner i C,
men sammankallandes uppdelning per tillstånd löser samma problem med mindre yta
och jag har inget bättre argument. Villkoret jag behåller är att raden i
tillstånd C måste vara en riktig rad med en textlänk, inte ett hopkrympt kort
med ram, annars har vi bara gjort korten mindre.

**4. Huvudsiffra. Jag står bakom förslaget: inga svarsfrekvenser på hemskärmen.**
Fyra beskrivande antal är rätt register för en målgrupp som ofta söker under
press, och meningen i stället för nollor är precis den regel jag saknade i min
egen granskning. Enda skärpningen: de fyra siffrorna ska rymmas på två rader om
två på 375 px, med `tabular-nums` och etiketten under siffran, inte bredvid.
Fyra siffror i en rad blir 70 px per kolumn och etiketterna trunkeras.

**5. Gamification. Jag godtar borttagningen helt.**
XP och nivåer är inte min kärnfråga, men de tre skälen håller och en
föräldralös sida som ingen nås till är per definition inte värd att designa om.
Från mitt håll är vinsten att tillstånd C tappar ytterligare en sektion.

**6. Streak. Jag står bakom förslaget: bort från hemskärmen.**
Streaken straffar den som tar ledigt en söndag, i en produkt vars användare ofta
redan bär skuld över sitt jobbsökande. "3 ansökningar den här veckan" mäter det
som faktiskt betyder något och kan inte gå sönder på ett sätt som känns som ett
underkännande.

## 2. Tre invändningar med ändringsförslag

**A. Avsnitt 6 saknar tangentbordet, och det är mobilflödets verkliga fiende.**
Skalet beskriver sticky fot med `h-11`, men på iOS lägger sig det virtuella
tangentbordet över fixed-positionerade element, så "Fortsätt" hamnar bakom
tangentbordet i exakt de steg som har inmatning: annonstexten i skapa-brev,
varje fält i skapa-cv, profiltexten i linkedin. Det är samma klass av fel som
`100vh` i chatten, men i fyra flöden i stället för ett.
*Ändringsförslag:* lägg till i avsnitt 6 att skalets sticky fot använder
`position: sticky` i en flex-kolumn med `100dvh`-höjd, inte `position: fixed`,
och att flödesskalet döljer bottennavet helt (`--bottom-nav-h: 0`) medan ett
flöde är öppet. Ett flöde är ett läge, inte en sida, och navet ska inte
konkurrera med "Fortsätt" om samma 96 px. Lägg också till `enterKeyHint` och
`inputMode` på alla fält i skalet, det finns tre förekomster i hela
dashboardkoden idag mot 46 inmatningsfält.

**B. Autospara utan kollisionsregel skapar ett nytt fel.**
"Varje steg autosparar till `localStorage` under en nyckel per flöde" räcker
inte som spec. Om användaren har ett halvfärdigt brev sparat och startar ett
nytt brev från en annan annons, skriver den nya sessionen över den gamla utan
att någon får veta, och vi har bytt ett tappat flöde mot ett raderat flöde.
*Ändringsförslag:* nyckeln blir `flow:<namn>:<version>` med ett tidsstämplat
utkast, och "Fortsätt där du slutade" visas som ett val vid flödets start med
två knappar, "Fortsätt" och "Börja om", där "Börja om" kräver en bekräftelse.
Utkast äldre än sju dagar rensas automatiskt. Spara vid stegbyte och vid
`visibilitychange`, inte på varje tangenttryckning.

**C. Åtgärdslistans våg 1 punkt 4 och punkt 11 motsäger varandra.**
Punkt 4 säger "ta bort hänglåset på mobil-FAB, gradient till `bg-orange-600`",
alltså att vi lagar FAB:en i vecka ett, medan punkt 11 i våg 2 säger att FAB:en
tas bort helt. Vi skulle alltså designa om en yta vi redan beslutat att radera.
*Ändringsförslag:* skriv om punkt 4 till "FAB:en pekar alltid mot skapa-brev
och får `bg-orange-600` utan hänglås", alltså minsta möjliga plåster tills
punkt 11 landar, och notera i punkt 4 att den är temporär. Alternativt flyttar
vi punkt 11 till våg 1, den är **M** och beror bara på `--bottom-nav-h` som
ändå ligger i våg 1 som punkt 6. Jag föredrar det senare: nytt nav i vecka ett
gör att våg 2 och 3 kan bygga mot rätt navhöjd från början i stället för att
räkna mot en höjd vi vet ska ändras.

## 3. Övrigt godkänt

Övrigt godkänt.
