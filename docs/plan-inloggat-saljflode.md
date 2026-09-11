# Plan: det inloggade säljflödet

> Underlag: säljdirektiv från SaaS-specialisten plus egen kodgenomgång på main
> (3e412e51). Designreglerna ligger i `docs/designsystem.md` och upprepas inte
> här. Det här dokumentet kompletterar bara.

## 1. Sammanfattning

Fem förändringar i prioritetsordning.

**1. Rätta `UsageStats`.** Komponenten säger "Inga gränser, bara översikt" och
skriver "Obegränsat" under brev till en gratisanvändare som har ett brev per
dygn. Det är inte en designmiss, det är felaktig information på den enda sida
där vi ber om pengar. Den som läser den har ingen anledning att uppgradera,
eftersom vi just sagt att hon redan har allt. Etiketten säger dessutom "denna
vecka" fast modellen är per dygn. Rättas först, det är en ren bugg.

**2. Skriv tillbaka parsad telefon och ort.** Parsern i `cv/parse/route.ts`
plockar redan ut telefon och adress ur uppladdade CV. Ingenting skriver tillbaka
dem till `profiles`. Samtidigt blockerar CV-byggarens steg 0 utan telefon, och
56 procent av kontona saknar den. Vi har alltså datan, kastar bort den, och
stoppar sedan användaren på ett krav hon inte kan uppfylla. Ingen ny fråga
behövs, bara en skrivning.

**3. Gör kvoterna synliga innan de tar slut.** Idag ser gratisanvändaren sitt tak
först när hon blockeras. Brev, analys, chatt och tester har alla kvoter, och tre
av dem syns aldrig förrän de smäller. En kvotrad i tillstånd C gör gratisnivån
begriplig och flyttar köpimpulsen från frustration till planering. Vi vill att
någon uppgraderar för att hon ser att taket kommer, inte för att hon nyss gick
in i det.

**4. Minska valträngseln i sidebaren.** Tretton likvärdiga val i fyra grupper gör
att ingenting leder. Premium-raden ligger sist bland tretton och väger exakt lika
mycket som "Belöningar". Tre grupper i stället för fyra, och kärnflödet överst.

**5. Ge alla betalande en statusrad.** `TrialStatusRow` filtrerar på
`premium_source` i trial-listan, så den som köpt ett dagspass ser ingen
nedräkning alls på dashboarden. Dagspasset tar slut utan förvarning. Det är
den mest sannolika platsen att förlora en kund som redan visat betalningsvilja.

## 2. Informationsarkitektur

### Sidebar

Tre grupper i stället för fyra. Kärnflödet överst utan rubrik, eftersom det inte
behöver förklaras. Verktyg samlar allt som är värdefullt men inte dagligt. Konto
sist.

Slås ihop: "Nytt CV" och "Mina CV:n" blir en rad, "CV" med antal, som leder till
listan där knappen "Nytt CV" ligger. Samma för brev. Det tar bort fyra rader utan
att ta bort någon funktion. "Belöningar" flyttar in under Profil. "Sökta
tjänster" stannar i kärnflödet, den har daglig användning.

Tas bort ur sidebaren: `FeatureSpotlight`. Den konkurrerar med Premium-raden om
samma uppmärksamhet och har ingen egen plats i en hierarki som ska leda någonstans.

Premium-raden flyttar upp till toppen av Konto-gruppen och får en tunn orange ram
när användaren är gratis eller har två dagar kvar, annars är den en rad som alla
andra. Aldrig fylld orange yta: den primära handlingen i vyn ligger i innehållet,
inte i navigationen.

```
+----------------------------------+
|  Jobbcoach.ai                    |
+----------------------------------+
|  [ ] Översikt                    |
|  [ ] CV                      3   |
|  [ ] Brev                    7   |
|  [ ] Sökta tjänster          2   |
|                                  |
|  VERKTYG                         |
|  [ ] Förbättra CV                |
|  [ ] CV-mallar                   |
|  [ ] Jobbmatchning               |
|  [ ] Jobbcoachen                 |
|  [ ] LinkedIn                    |
|  [ ] Rekryteringstester          |
|  [ ] Bli upptäckt                |
|                                  |
|  KONTO                           |
| +------------------------------+ |
| | [ ] Premium      Gratis      | |  <- tunn orange ram bara i gratisläge
| +------------------------------+ |
|  [ ] Profil                      |
+----------------------------------+
|  Hjälp            Logga ut       |
+----------------------------------+
```

Från tretton rader till tolv, men med tre tydliga nivåer i stället för fyra
jämnstarka. Vinsten ligger i grupperingen, inte i antalet.

### Mobilnav

Fem slots plus FAB fungerar inte på 375 px. Fyra flikar med en FAB emellan ger
redan idag 44 px träffytor med marginal, och en femte flik tvingar ner dem mot
30 px. Direktivet vill ha Premium i navet, vilket är rätt mål men fel plats.

Lösningen: behåll fyra slots och FAB, men lägg Premium som prick på
Profil-slotten. Profil är redan vägen till prenumerationssidan. Pricken syns när
trial har två dagar kvar eller mindre, när ett engångsköp har ett dygn kvar,
eller när en betalning misslyckats. Då blir den en notis om något som faktiskt
händer, inte en permanent säljknapp.

```
+------------------------------------------+
|                                          |
|                 ( + )                    |   FAB, 56 px
|                                          |
|   [ ]        [ ]      |      [ ]    [ ]  |
|   Hem       Brev      |     Jobb  Profil |
|                       |               *  |   <- prick vid < 2 dagar kvar
+------------------------------------------+
```

### Header och profilmeny

Ja till profilmeny, men inte som direktivet beskriver den. Headern har idag en
länk till `/dashboard/profil` och samtidigt en Profil-rad i sidebaren och en
Profil-slot i mobilnavet. Tre vägar till samma sida.

Gör headerns profilblock till en dropdown med: namn och e-post överst,
Premium-status som rad, sedan Prenumeration, Profil, Logga ut. Det tar bort
`SidebarFooter`s utloggningsknapp och samlar kontoåtgärderna på ett ställe.

Samtidigt bör headern bantas. Den har idag hälsning, datum, meddelandeknapp,
notisklocka, streak-pill och profilblock, allt i `font-black` med tre olika
gradienter. Streak-pillen flyttar till dashboardens statusrad där siffran hör
hemma. Datumraden tas bort, användaren vet vilken dag det är.

## 3. Dashboard per tillstånd

Genomgående regel: en säljyta per skärm. Om kvotraden visar ett tak ska
statusraden inte samtidigt sälja.

### Trial dag 1 till 3

Ordning: `PurchaseConfirmation` (om nyss köpt), `TrialStatusRow` neutral,
`DashboardHero` eller `DashboardStatusRow`, snabbåtgärder, aktivitet.

Ingen uppgraderingsimpuls alls. Hon har produkten. Det enda vi gör är att visa
vad hon använder, så att dag 4 har något att referera till. Konkret: när hon
laddar ner ett brev, kör en analys eller gör ett test loggas det som
premiumanvändning. Den loggen driver copyn på dag 4.

### Trial dag 4 till 5

Samma ordning, men `TrialStatusRow` blir orange och säger "Behåll Premium".
Här får `UpgradeSheet` ett tillägg: tre rader om vad som försvinner, hämtade ur
`COMPARISON` och valda efter vad hon faktiskt använt. Har hon laddat ner tre brev
står nedladdningen först. Har hon inte laddat ner något står brevkvoten först.

Detta är den enda skärm där en säljyta får ligga överst. Ingen kvotrad visas
samtidigt, hon har inga kvoter än.

### Gratis

Ordning: `DowngradedNotice` (en gång), kvotraden, statusraden, snabbåtgärder,
aktivitet.

Kvotraden ersätter `QuotaNudgeRow` och visar fyra kvoter som en rad, inte fyra
kort. Alltid synlig, inte bara vid stopp.

```
Desktop, tillstånd C gratis:
+--------------------------------------------------------------+
| Brev 1/1   Analys 0/1   Chatt 4/10   Tester 1/1    Se Premium |
+--------------------------------------------------------------+

Mobil, 375 px:
+------------------------------+
| Brev      1/1                |
| Analys    0/1                |
| Chatt     4/10               |
| Tester    1/1                |
| Se vad Premium ger           |
+------------------------------+
```

Siffrorna är `tabular-nums`. En kvot som är slut får `text-neutral-900` i stället
för orange bakgrund. Vi markerar med vikt, inte med larm. Länken till höger är
textlänk, aldrig knapp, eftersom vyns primära handling är att skriva ett brev.

### Betalande

Ordning: statusraden med "Premium aktivt", snabbåtgärder, aktivitet. Ingen
kvotrad, inga kvoter. Ingen uppgraderingsimpuls.

Ett undantag: den som haft månadsplan i mer än 60 dagar får en rad på
prenumerationssidan om kvartal, inte på dashboarden. Uppgradering månad till
kvartal är en kontohandling, inte en dashboardhandling.

### Engångsköp

Samma som betalande, men statusraden räknar ner. Vid ett dygn kvar byter den ton
till orange och säger "Dagspasset går ut ikväll 23:59" med "Förläng" som
textlänk. Det är hela poängen med punkt fem i sammanfattningen: idag ser den här
användaren ingenting.

### Var impulser är förbjudna

Inga uppgraderingsytor i CV-byggarens steg, i brevflödets skrivsteg, på
testresultat innan resultatet är läst, eller som modal vid inloggning. En modal
vid inloggning är det snabbaste sättet att lära någon att stänga våra dialoger
utan att läsa dem.

## 4. Profildata

Principen: fråga aldrig innan vi levererat något. Varje fält vi ber om ska ha
ett synligt skäl i samma ögonblick.

### Vad som förifylls automatiskt

Vid CV-uppladdning skriver vi tillbaka telefon och ort till `profiles` när
fältet är tomt. Vi skriver aldrig över ett värde användaren själv angett.
Parsern har redan datan, så detta kostar en `update` och inga frågor.

Efter uppladdningen visar `QuickScoreReveal` en extra rad:

> Vi hittade också telefon och ort i ditt CV och sparade dem i din profil.
> Ändra

"Ändra" öppnar inline-fälten. Vi berättar vad vi gjort i stället för att be om
lov, men gör det enkelt att rätta.

### Kortet "Komplettera profilen"

Plats: tillstånd B och C, under statusraden, ovanför snabbåtgärderna. Visas bara
när något saknas, max tre fält, och aldrig samma dag som `DowngradedNotice`.

Copy ordagrant:

> **Tre uppgifter saknas i brevhuvudet**
> Brev och CV ser mer genomarbetade ut med fullständiga kontaktuppgifter.
> Rekryterare ska kunna nå dig utan att leta.

Fältraderna har inline-redigering och sparar direkt vid blur. Ingen egen sida,
ingen modal, ingen sparaknapp.

```
+--------------------------------------------------+
|  Tre uppgifter saknas i brevhuvudet              |
|  Brev och CV ser mer genomarbetade ut med        |
|  fullständiga kontaktuppgifter.                  |
|                                                  |
|  Namn      [ Anna Lindqvist            ]         |
|  Telefon   [ 070-123 45 67             ]         |
|  Ort       [ Göteborg                  ]         |
|                                                  |
|  Spara                      Inte nu              |
+--------------------------------------------------+
```

"Inte nu" döljer kortet i sju dagar. Det kommer tillbaka, men inte imorgon.

### Obligatoriskt per funktion

| Funktion | Namn | E-post | Telefon | Ort |
|---|---|---|---|---|
| Brevhuvud | Krav | Krav | Valfritt | Valfritt |
| CV-byggaren steg 0 | Krav | Krav | Krav | Valfritt |
| CV-export | Krav | Krav | Valfritt | Valfritt |
| Kandidatprofil | Krav | Krav | Valfritt | Krav |
| Jobbmatchning | Nej | Nej | Nej | Krav |
| Jobbcoachen | Nej | Nej | Nej | Valfritt |

### Export utan namn

Blockera exporten, men aldrig med ett felmeddelande. Visa fältet direkt i
exportdialogen:

> **Vi behöver ditt namn först**
> Det hamnar överst i dokumentet.
> Namn [ ................ ]  Spara och ladda ner

Ett fält, en knapp, och nedladdningen fortsätter automatiskt. Idag faller namnet
tillbaka på e-postens lokaldel, vilket ger CV med rubriken "anna.lindqvist92".
Det är värre än att fråga.

### Toggeln för telefon i brev

Sätt `include_phone_in_letters` och `include_location_in_letters` till true som
default när värdet finns. 128 konton har telefon men toggeln av, vilket betyder
att numret finns i databasen och aldrig når brevhuvudet. Sju konton har den på.
En default som 98 procent inte valt är fel default.

Migreringen sätter true för befintliga konton som har ett värde. Användaren kan
stänga av i profilen, och det valet respekteras framåt.

### Google-konton

Triggern `handle_new_user` läser `full_name` men Google skickar `name`. Den läser
aldrig `avatar_url`. Rätta triggern att läsa båda, och låt callbacken alltid
kopiera e-post från auth till profiles.

Ta bort "Ej angivet" som fallback. Ett null-värde går att upptäcka och fråga om,
en sträng som ser ifylld ut gör det inte. 28 konton har idag "Ej angivet" som
namn och hamnar därmed aldrig i vårt kompletteringsflöde.

## 5. Prenumerationssidan

Struktur i gratisläge, uppifrån: hero med rubrik, kvotöversikt (rättad
`UsageStats`), produktkorten, `GratisMotPremium`, FAQ. Funktionsrutnätet
`PremiumFeaturesGrid` tas bort ur gratisläget: det upprepar jämförelsetabellen
med sämre precision.

### UsageStats, ny copy

Rubriken "Din användning" står kvar. Underrubriken byts:

- Gratis: "Så mycket har du kvar idag. Kvoterna nollställs vid midnatt."
- Premium: "Så mycket har du använt. Inga gränser på din plan."

Etiketten "Personliga brev denna vecka" blir "Brev idag". Värdet för gratis blir
`{använt} av 1`, aldrig "Obegränsat". Ordet "Obegränsat" får bara visas för den
som faktiskt har obegränsat.

Sektionen ska dessutom visa alla fyra kvoterna, inte tre godtyckliga mått. Brev,
analys, chatt och tester. Samma siffror som dashboardens kvotrad, från samma
källa, annars glider de isär.

Komponenten behöver också en designpassning: den har idag `rounded-3xl`,
`font-bold`, inline-`boxShadow` på ett stillastående kort, gradientruta med
`Infinity`-ikon och en em-dash i copyn. Allt utgår enligt designsystemet.

## 6. Copy-principer och designregler

Gäller utöver `docs/designsystem.md`.

**Säg alltid siffran.** "1 av 1 brev använt idag", aldrig "din kvot är slut".
Den som ser siffran kan planera, den som ser ordet kan bara känna sig stoppad.

**Säg aldrig obegränsat till någon som har en gräns.** Detta är den enda regeln
i dokumentet som är absolut.

**Beskriv värde i tid eller ansökningar, inte i funktionslistor.** "Skriv brevet
på fem minuter i stället för en timme" säger mer än "AI-driven brevgenerering".

**Statusrader är rader, innehåll är kort.** En status som blir ett kort tar
uppmärksamhet den inte förtjänar. Kvotraden är en rad även när den innehåller
fyra siffror.

**En säljyta per skärm.** Om kvotraden visar ett tak säljer inte statusraden.
Om `PaywallCard` ligger i flödet visas ingen kvotrad ovanför.

**Nedräkningar byter ton en gång, inte gradvis.** Neutral tills sista dygnet,
sedan orange. Ingen färgskala, ingen progress-bar, ingen tickande sekundvisare.

## 7. Åtgärdslista

### Våg 1: buggar och snabba vinster

**1. Rätta `UsageStats`**
Vad: verkliga kvoter per tillstånd, "idag" i stället för "denna vecka", bort med
"Obegränsat" för gratis, designpassning enligt punkt 5.
Filer: `dashboard/profil/prenumeration/components/UsageStats.tsx`, `page.tsx`.
Insats: S. Effekt: hög, tar bort ett direkt felaktigt budskap på säljsidan.
Beroenden: inga.

**2. Skriv tillbaka parsad telefon och ort**
Vad: efter `cv/parse`, uppdatera tomma profilfält. Visa vad vi hittade.
Filer: `api/cv/parse/route.ts`, `QuickScoreReveal.tsx`.
Insats: S. Effekt: hög, bör täcka en stor del av de 56 procenten utan att fråga.
Beroenden: inga.

**3. Rätta triggern och callbacken**
Vad: läs `name` och `avatar_url`, kopiera e-post, ta bort "Ej angivet".
Filer: migration för `handle_new_user`, `auth/callback/route.ts`.
Insats: S. Effekt: medel, men förutsättning för att punkt 6 ska hitta rätt konton.
Beroenden: inga. Kör före punkt 6.

**4. Default true för kontaktuppgifter i brev**
Vad: migrering som sätter togglarna till true där värde finns, ny default framåt.
Filer: migration, `dashboard/profil/page.tsx`.
Insats: S. Effekt: medel, 128 konton får sina uppgifter i brevhuvudet.
Beroenden: inga.

**5. Generell premiumstatusrad**
Vad: `TrialStatusRow` täcker även engångsköp och prenumeration. Nedräkning för
dagspass med tonbyte sista dygnet.
Filer: `TrialStatusRow.tsx` (döps till `PremiumStatusRow`), `dashboard/page.tsx`.
Insats: M. Effekt: hög, tar bort en tyst förlust av redan betalande kunder.
Beroenden: inga.

**6. Kortet "Komplettera profilen"**
Vad: inline-kort i tillstånd B och C, max tre fält, sju dagars snooze.
Filer: ny `components/dashboard/ProfilKomplettering.tsx`, `dashboard/page.tsx`.
Insats: M. Effekt: medel. Beroenden: punkt 2 och 3 först, annars frågar vi om
sådant vi redan kunde ha.

### Våg 2: struktur

**7. Kvotraden i tillstånd C**
Vad: fyra kvoter som en rad, ersätter `QuotaNudgeRow`.
Filer: ny `components/dashboard/KvotRad.tsx`, `dashboard/page.tsx`,
`lib/quota/quotaService.ts` (samlad läsning av alla fyra).
Insats: M. Effekt: hög på sikt, flyttar köpimpulsen före frustrationen.
Beroenden: punkt 1, så siffrorna kommer från samma källa.

**8. Sidebar i tre grupper**
Vad: slå ihop CV och brev, flytta Belöningar, ta bort `FeatureSpotlight`,
Premium-raden överst i Konto.
Filer: `Sidebar.tsx`, `sidebar/*`.
Insats: M. Effekt: medel. Beroenden: inga.

**9. Profilmeny i headern**
Vad: dropdown med namn, e-post, premiumstatus, tre länkar. Banta headern.
Filer: `components/dashboard/header.tsx`, `SidebarFooter.tsx`.
Insats: M. Effekt: medel. Beroenden: punkt 8, gör dem samtidigt.

**10. Prick på Profil-slotten i mobilnav**
Vad: prick vid mindre än två dagar kvar eller misslyckad betalning.
Filer: `MobileBottomNav.tsx`, `dashboard/layout.tsx`.
Insats: S. Effekt: medel. Beroenden: punkt 5.

**11. Vad du förlorar i `UpgradeSheet`**
Vad: tre rader ur `COMPARISON`, valda efter faktisk användning under trial.
Filer: `paywall/UpgradeSheet.tsx`, ny logg för premiumanvändning.
Insats: M. Effekt: hög på dag 4 till 5.
Beroenden: användningsloggen i punkt 12.

**12. Logga premiumanvändning under trial**
Vad: registrera nedladdning, analys och test som premiumhändelser.
Filer: `lib/activity-logger.ts`, respektive flöde.
Insats: M. Effekt: indirekt, men förutsättning för punkt 11.
Beroenden: inga.

**13. Exportgate med inline-fält**
Vad: blockera export utan namn, visa fältet i dialogen.
Filer: `CVExportOptions.tsx`, `api/letters/download/route.ts`.
Insats: M. Effekt: medel, tar bort CV med e-postadress som rubrik.
Beroenden: punkt 3.

## 8. Avvikelser från säljdirektiven

**Direktiv 5: fem slots i mobilnavet.** Avviker. Fem flikar plus FAB ger under
44 px träffyta på 375 px, vilket bryter mot designsystemets mobilregel och gör
navet sämre för alla för att sälja till några. Förslag: behåll fyra slots och
lägg Premium som prick på Profil-slotten, som redan leder dit. Pricken visas
bara när något faktiskt händer, vilket gör den till information i stället för
dekoration. Mät samma sak: andel mobila köp.

**Direktiv 6: profilmeny som tredje permanent Premium-yta.** Avviker delvis. Ja
till menyn, nej till motiveringen. Tre permanenta säljytor för samma sak lär
användaren att filtrera bort dem. Premium-status ska stå i menyn som en rad, men
menyns syfte är att samla kontoåtgärder och ta bort dubbletten mellan header,
sidebar och mobilnav. Om menyn byggs som säljyta blir den en fjärde sak att
ignorera.

**Direktiv 2: kvotöversikt med fyra mått.** Följer, med ett tillägg. Fyra siffror
får inte bli fyra kort. Blir de kort tar de mer plats än dashboardens faktiska
innehåll, och en gratisanvändare möts av en vägg av begränsningar innan hon ser
vad hon kan göra. En rad, fyra siffror.

**Direktiv 12: default true för kontaktuppgifter.** Följer, med förbehåll. Att
ändra default framåt är rätt. Att retroaktivt slå på för 128 befintliga konton
ändrar vad som står i deras brev utan att de bett om det. Telefonnumret är deras
eget och hamnar i deras eget brevhuvud, så integritetsrisken är låg, men de bör
få veta. Förslag: kör migreringen och visa en engångsrad i profilen: "Din telefon
och ort visas nu i brevhuvudet. Stäng av". Ingen ny fråga, men inte heller en
tyst ändring.

**Direktiv 15: blockera export om namn saknas.** Följer, med skärpning. Direktivet
säger inline-fält i stället för felmeddelande, vilket är rätt. Lägg till att
nedladdningen ska fortsätta automatiskt när fältet fyllts i. En gate som kräver
att användaren klickar "ladda ner" igen efter att ha svarat är en gate som
känns som ett straff.

**Tillägg som saknas i direktiven: kvoten för sparade brev.** `COMPARISON` säger
att gratis får spara två brev åt gången, och `use-profile.ts` bekräftar
`maxSavedLetters: 2`. Den gränsen syns ingenstans förrän den slår till, och den
är svårare att förstå än en dygnskvot eftersom den inte nollställs. Den bör ha
en rad i kvotöversikten, eller åtminstone en förklaring i `mina-brev` innan det
tredje brevet sparas.
