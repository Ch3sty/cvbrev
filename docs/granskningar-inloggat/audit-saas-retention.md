# Granskning: SaaS-retention, aktivering och användartillfredsställelse

Granskare: SaaS-produktexpert, fokus retention och daglig återkomst.
Underlag: kodgenomgång av src/app/dashboard, src/components/dashboard,
src/lib/quota, src/lib/email/lifecycle, src/app/api/gamification.

## 1. Helhetsbedömning

En ny användare möter ett rent och välbyggt aktiveringsflöde: tillstånd A i
`DashboardHero` gör exakt en sak, ber om CV:t, och det fungerar. Den aktiva
användaren möter något helt annat, nämligen nio staplade sektioner i tillstånd
C som var och en är rimlig men som tillsammans varken har hierarki eller riktning,
och där tre av dem säger samma sak med olika siffror. Tjänsten är idag en
verktygsmeny med en aktiveringstratt framför sig, inte en partner som vet var du
befinner dig i ditt jobbsökande, och den skillnaden är hela retentionproblemet:
det finns ingen anledning att öppna Jobbcoach en tisdag om du inte just den dagen
råkar vilja generera ett dokument. Det som mest aktivt hindrar "innovativ,
framstående, seriös" är att 96 filer under /dashboard fortfarande bär den
röd-rosa gradienthero som designsystemet pensionerat, att två komponenter på
samma skärm visar motstridiga kvoter (`StreakOchStatus` säger 7 brev i veckan,
`quotaService` säger 1 per dag), och att samtliga sjutton livscykelmail handlar
om pengar och inte ett enda om användarens jobbsökande. Ett produktlöfte som
bara hör av sig när det vill ha betalt läser som en säljmaskin, och en säljmaskin
rekommenderar man inte vidare.

## 2. De tio viktigaste problemen

**1. Det finns inget dagligt hem, bara en verktygslåda med statistik ovanpå.**
`src/app/dashboard/page.tsx` tillstånd C renderar statusrad, kvotrad, profilkort,
nästa steg, aktivitet, sex snabbåtgärder, CV-kort, sökta-rad, bli-upptäckt-rad och
statuswidget. Ingenstans står det vad användaren ska göra idag. `NastaSteg` är det
enda som försöker, men den visar bara två sorters nudge (uppföljning efter 14 dagars
tystnad och AF-rapportfönstret) och är dessutom gömd bakom `rewardClaimed`. En
jobbsökare som loggat in dag 3 utan pågående ansökningar får noll vägledning.
Retention byggs av en anledning att återvända, och den anledningen finns inte i koden.

**2. Motstridiga kvotsiffror på samma skärm.**
`StreakOchStatus.tsx` rad 18: `const FREE_LIMITS = { letters: 7, analyses: 1, linkedin: 1 }`
med etiketten "Veckans gratiskvot", medan `QuotaNudgeRow` hämtar sanningen från
`/api/quota/status` som säger `DAILY_LIMIT_LETTERS = 1`. Båda renderas i tillstånd C.
Det här är samma bugg som plan-inloggat-saljflode punkt 1 skulle rätta, men bara
`UsageStats` blev rättad. Förtroendeskada: användaren kan inte lita på någon siffra
vi visar om två av dem motsäger varandra.

**3. Belöningssystemet är en rabattstege, och butiken är dessutom gömd.**
Alla tio milstolpar i `premium_rewards` är premiumdagar eller rabatt på vår egen
produkt. Ingen av dem hjälper någon att få jobb. Värre: `reward_claim` ger 50 XP
och `reward_activation` 25 XP, alltså XP för att klicka på belöningen man fick av
sin XP. Och sidan är föräldralös: en grep på "dashboard/rewards" i src/components
och src/app/dashboard ger en enda träff, inuti `ActivationModal`. Den finns inte i
sidebar, mobilnav eller `ProfileMenu`. Vi delar ut en valuta, gömmer butiken, och
det enda som säljs där är vår egen prislista.

**4. Streaken mäter fel sak, kan gå sönder orättvist och går inte att hålla gratis.**
Streaken uppdateras bara inuti `award-xp`, som bara anropas från tre ställen (brev
25 XP, CV-analys 40 XP, kompetensanalys 50 XP). Logga fem ansökningar, gör tre
tester, gå på intervju: streaken bryts ändå. Dagen beräknas med `new Date()` och
`toISOString().split('T')[0]`, alltså serverns UTC, medan kvotmodellen kör
Stockholm, så en aktivitet kvällen före kan nolla streaken. Och eftersom de enda
streakhöjande handlingarna är kvotbegränsade är en 30-dagarsstreak matematiskt
omöjlig på gratisnivån. Achievementen `month_master` är alltså i praktiken låst
bakom betalning utan att det sägs. Ingen freeze, ingen nådedag, ingen återställning.

**5. Resan bryts mellan brev och sökta tjänster, och mellan ansökan och allt annat.**
"Markera som sökt" finns i `skapa-brev` previewen som sekundär knapp bredvid den
gradientfyllda PDF-knappen, och i `mina-brev`-listan gömd som fjärde val i en
overflow-meny under två nedladdningsalternativ. I `mina-brev/[id]/page.tsx` finns
den inte alls, alltså precis där man läser brevet innan avsändning. Efter att man
tryckt ändras inget på kortet, så nästa besök ger ingen ledtråd om vad som är
loggat. Åt andra hållet är det värre: `job_applications.cv_id` finns i datan men
visas ingenstans, så insikten "CV A ger 30 procent svar, CV B ger 8" är möjlig och
osynlig. Jobbmatchning kan inte logga en ansökan alls, och en ansökans detaljvy har
varken "skriv brev till den här" eller "sök liknande". Varje funktion är en
återvändsgränd.

**6. Alla livscykelmail handlar om pengar.**
`registry.ts` listar sjutton mail: reverse trial, winback, quota_wall, trial_day
3/5/7, onetime_expired, payment_failed, cancel, gratisniva. Noll om jobbsökandet.
Ingen veckosammanfattning, ingen uppföljningspåminnelse, inga jobbaviseringar.
`saved-search-alert.ts` finns men används bara i `/app/rekryterare/`, alltså för
rekryterare. Vi har byggt notisinfrastrukturen och riktat hela den mot plånboken.

**7. Notiser skapas bara av rekryterarintresse.**
`from('notifications').insert` förekommer på två ställen, båda i
interest-flödet. `NotificationBell` pollar var 60 sekund efter data som för de
flesta konton aldrig kommer att existera, eftersom Bli upptäckt väntar på volym.
En klocka som aldrig ringer är en tom yta i headern. AF-rapporten, som måste
lämnas varje månad och därmed är vårt starkaste naturliga återkomstankare, har
varken påminnelse eller deadline i UI. Den finns bara om man råkar klicka in.

**8. Prenumerationssidan och profil/CV är kvar i det gamla uttrycket och ljuger om erbjudandet.**
`PrenumerationHero.tsx` FreeHero: röd-rosa gradient, `rounded-3xl`, och copyn
"Prova gratis i 7 dagar" plus "0 kr första 7 dagarna" när modellen är fem dagars
reverse trial som redan är förbrukad när användaren läser detta. `CvHeroBanner`
EmptyHero har samma gradient och ett talstreck mitt i H1 ("Ladda upp ditt CV",
talstreck, "vi gör resten"). `TesterHubHero` likaså. Räknat: 96 filer innehåller
`BE185D`, 106 innehåller `rounded-3xl`, 38 `font-black`, 213 rader innehåller
em-dash. Det här är inte enskilda missar utan att designsystemet bara landat i
tre ytor.

**9. Bli upptäckt är en underkännandelista, och den lovar mer än vi kan hålla.**
Vid tomt tillstånd möter användaren samtidigt: "0 %" i stor fet text intill
meningen "Kompletta profiler visas först", fyra brickor som säger "Inte gjort",
sex blurrade hänglåskort, "Visa alla steg (9 kvar)", "Ej synlig" på tre ställen
och en gråad knapp "Visa intresse". Ett tjugotal negativa signaler på en skärm, och
det i samma produkt där Sökta tjänsters tomma tillstånd är en illustration, en
mening och en knapp. Allvarligast är copyn: "Kompletta profiler visas först" och
"fler verifierade resultat lyfter dig i sökresultaten" är rankningslöften, men
profilstyrkan beräknas klientside i `computeProfileStrength` och sparas aldrig till
`candidate_profiles`. Vi driver alltså testtagande med ett påstående koden inte
backar. Dessutom "Det här kan ingen annan plattform visa", ett obelagt
konkurrentpåstående placerat intill "en omgång om dagen ingår gratis". Och efter
allt arbete är hela leveransen meningen "Nu väntar vi bara på rekryterarna", utan
profilvisningar, tidshorisont eller något tecken på att systemet lever.

**9b. Tomma tillstånd visar nollor i stället för nästa steg.**
`DashboardStatusRow` renderar "0 Brev · 0 Ansökningar · 0 Svar · 0 d Streak" så
snart användaren har ett CV och ett brev men inget loggat. `header.tsx` har en
`isMissingName` som fångar strängen "Ej angivet", vilket bekräftar att
platshållaren fortfarande ligger i data. Och `ShareTab` låter användaren skapa en
publik 30-dagarslänk till en helt tom AF-statistik, alltså exponera sin egen
nollprestation för en handläggare.

**10. Mobilen bär den gamla vikten.**
`MobileBottomNav` har fem slots varav FAB:en är röd-rosa gradient med
`boxShadow: 0 10px 24px -6px rgba(220,38,38,0.5)` och visar ett hänglås när CV
saknas. Ett hänglås som första intryck på mobil, där halva trafiken ligger,
säger "du får inte" innan vi sagt "du kan". Fliken "Jobb" leder till
jobbmatchning men matchar också jobbcoachen, och Sökta tjänster, som är den enda
funktion med genuint daglig användning, saknas helt i bottennavet.

## 3. Förslag

### Görs om från grunden

**A. Dashboardens tillstånd C blir "Din dag".** En vy med en tydlig
prioriteringsordning i stället för nio jämnstarka sektioner. Allt annat flyttar
till sina egna sidor.

```
+--------------------------------------------------+
| Premium aktivt · 3 dagar kvar          Hantera   |  TrialStatusRow (oförändrad)
+--------------------------------------------------+
| IDAG                                             |
| Följ upp Nordea. Du sökte 15 dagar sedan och     |  EN handling, dynamisk.
| har inte hört något.                             |  Fallback när inget brådskar:
| [ Öppna ansökan ]   Hoppa över idag              |  "Sök ett jobb till idag."
+--------------------------------------------------+
| Denna vecka: 3 ansökningar · 1 svar · 2 dagar    |  En rad, ingen nolla utan
| i rad                          [ Skapa brev ]    |  sammanhang. Vecka, inte totalt.
+--------------------------------------------------+
| DINA ANSÖKNINGAR                                 |
| Nordea, Systemutvecklare    Väntar sedan 15 d >  |  Max 3 rader, direkt från
| Klarna, Backend             Intervju bokad    >  |  sokta-tjanster. Den enda
| Spotify, Fullstack          Väntar sedan 4 d  >  |  listan som är tidskänslig.
|                               Se alla (11)       |
+--------------------------------------------------+
| Brev  Analys  Chatt                    1/1  0/1  |  QuotaNudgeRow, oförändrad.
+--------------------------------------------------+
| Verktyg du inte provat: Jobbmatchning         >  |  EN rad, inte sex kort.
+--------------------------------------------------+
```

Motivering: den dagliga anledningen att återvända är inte "generera ett dokument",
det är "vad hände med mina ansökningar". Sökta tjänster är tjänstens enda
funktion med naturlig daglig rytm, och den ligger idag begravd som en statusrad
långt ned. Den ska bära hemskärmen.

**B. Streak och XP kopplas till jobbsökandet, inte till appanvändningen.**
Streaken byts mot "dagar i rad med minst en sökaktivitet", där sökaktivitet är:
loggad ansökan, skapat brev, genomfört test, körd analys. Flytta
streakberäkningen ut ur `award-xp` till en egen `recordActivityDay(userId)` som
alla fyra vägarna anropar, och använd `startOfTodayStockholm()` från
`quotaService` i stället för UTC. Lägg in en vilodag i veckan som inte bryter
streaken: jobbsökande är inte Duolingo, och en användare som tar helgledigt ska
inte straffas. XP flyttas samtidigt till det som faktiskt betyder något:
ansökan skickad, svar mottaget, intervju bokad. Datan finns redan i
`job_applications`. Ta bort XP för `reward_claim` och `reward_activation`, alltså
poäng för att klicka på sina egna poäng.

**D. Bli upptäckt byggs om från underkännandelista till förberedelse.** Ta bort
"0 %"-mätaren vid nollstart och ersätt med samma mönster som Sökta tjänster: en
illustration, en mening om vad det ger, en knapp. Visa max ett nästa steg i taget i
stället för nio kvarvarande. Radera "Kompletta profiler visas först", "fler
verifierade resultat lyfter dig i sökresultaten" och "Det här kan ingen annan
plattform visa" tills de är sanna och verifierbara. Lägg till en mellanleverans:
"Din profil har visats N gånger den här veckan", även när N är litet. Utan någon
observerbar återkoppling mellan investering och rekryterarkontakt tappar vi varje
användare som gjorde jobbet.

**C. Ett veckomail som handlar om användaren.** Nytt mail `weekly_digest`, söndag
kväll: så här många jobb sökte du, så här många väntar på svar, de här två borde
du följa upp, och en rad om vad som hände i din bransch om vi har data. Det är
det enda mail i systemet som ger innan det ber, och det är det som gör att
adressen inte avregistreras. Kör det i den befintliga lifecycle-runnern så
crontaket på två Vercel-jobb inte spräcks.

### Justeras

- **`StreakOchStatus` tas bort helt** och dess enda kvarvarande funktion, kvot-
  och premiumöversikten, är redan täckt av `QuotaNudgeRow` plus `TrialStatusRow`.
  Det löser problem 2 utan att skriva ny kod.
- **`DashboardSnabbAtgarder` går från sex kort till en rad.** Sex jämnstora kort är
  sex sätt att inte välja. Behåll logiken från `useUnusedFeatures` men rendera bara
  den högst rankade oprövade funktionen som en enda rad med en pil.
- **`NastaSteg` skrivs om till designsystemet** (den bär idag `rounded-3xl`,
  `font-black`, `--jc-gradient-hero` och en dekorativ orb) och tappar villkoret
  `rewardClaimed`. En uppföljningspåminnelse ska inte vara beroende av om någon
  klarat onboarding.
- **"Markera som sökt" lyfts ur overflow-menyn** och läggs som synlig åtgärd på
  brevkortet, i `mina-brev/[id]/page.tsx` och i jobbmatchningens jobbkort. Efter
  loggning byter kortet tillstånd till en chip "Sökt 4 maj", annars vet användaren
  aldrig vad som är loggat. Samtidigt: sätt `cv_id` även från `mina-brev`-vägen,
  låt kanalen vara valbar i stället för hårdkodad `'ad'`, och visa vilket CV som
  användes i ansökans detaljvy.
- **`BackfillBanner` får aldrig döljas permanent.** Den dismissas idag till
  localStorage utan utgång, så ett felklick stänger importvägen för alltid även när
  tjugo nya obokförda brev tillkommit. Snooza i 30 dagar i stället.
- **Ghost-tratten i `FunnelBars`** visar 12/5/3/1, alltså 42 procents svarsfrekvens
  som implicit normalnivå. Byt till neutrala staplar utan siffror.
- **Mobilnavet**: byt "Jobb" mot "Sökta", ta bort hänglåset på FAB:en (visa plus
  alltid, låt destinationen vara CV-uppladdningen), och ersätt gradient-FAB:en med
  `bg-orange-600` enligt designsystemet.
- **`DashboardStatusRow` byter från totalsummor till veckan** och skriver aldrig
  ut en rad med bara nollor. Vid noll aktivitet renderas i stället en mening:
  "Du har inte sökt något jobb den här veckan än."

### Tas bort helt

- `StreakOchStatus.tsx` (se ovan).
- `CvStatusCard.tsx` i tillstånd C. Att i tillstånd C, där användaren per
  definition har både CV och brev, rendera ett kort som berättar att CV finns är
  ren upprepning. Dess variant A är dessutom död kod, eftersom cvCount 0 ger
  tillstånd A.
- `OnboardingDag2.tsx` och `OnboardingNextStep.tsx`: ersatta av `useNextBestAction`
  enligt hookens egen kommentar, men filerna ligger kvar och kan renderas av misstag.
- De röd-rosa gradienthjältarna i `PrenumerationHero`, `CvHeroBanner`,
  `TesterHubHero` och `CvUnlocksFlow`. Diagrammet "du har låst upp 4 funktioner"
  säger ingenting om användarens situation och blir fyra vanliga rader.
- Copyn "Prova gratis i 7 dagar" och "0 kr första 7 dagarna" i `PrenumerationHero`,
  som beskriver ett erbjudande vi inte längre har.
- XP för `reward_claim` och `reward_activation`, samt nivåtitlarna från 38 och
  uppåt ("Apokalyptisk", "Allmäktig", "Gudomlig"). De är onåbara och tonen är fel
  för någon som söker jobb under press.

## 4. Tre saker jag inte kompromissar om

**1. Sökta tjänster ska bära hemskärmen.** Allt annat i produkten är händelser som
inträffar några gånger per jobbsökning. Ansökningar som väntar på svar är det enda
som förändras varje dag utan att användaren gör något, och därmed det enda som
kan bära en daglig vana. Utan detta är varje annan retentionåtgärd kosmetisk.

**2. Vi säger ingenting vi inte kan backa i kod.** Två fall är akuta: kvoterna,
där `StreakOchStatus` säger 7 brev i veckan och `quotaService` säger 1 per dag på
samma skärm, och rankningslöftet i Bli upptäckt, där vi driver testtagande med
"kompletta profiler visas först" trots att profilstyrkan räknas i klienten och
aldrig sparas. Det första är slarv, det andra gränsar till att sälja en tjänst vi
inte levererar. En användare som upptäcker antingen slutar lita på ATS-poängen,
matchningsprocenten och testresultaten också. Det här är inget designproblem, det
är hela produktens trovärdighet.

**3. Minst ett återkommande mail som inte ber om pengar.** Sjutton av sjutton
säljmail är en position vi inte kan försvara mot en användare som är arbetslös.
Veckosammanfattningen är dessutom vår billigaste retentionkanal, eftersom
datan redan ligger i `job_applications`.

## 5. Tre saker jag gärna ger upp

**1. Att behålla gamification över huvud taget.** Jag föreslår att XP och streak
kopplas till riktig aktivitet, men om någon argumenterar att XP och nivåtitlar är
fel register för en vuxen som söker jobb under press, och att "3 ansökningar denna
vecka" är all belöning som behövs, så har de förmodligen rätt. Ta då bort XP,
nivåer och `/dashboard/rewards` helt i stället för att laga dem.

**2. Streakens plats i statusraden.** Om UX-granskarna anser att siffran skapar
mer ångest än stolthet på en dashboard för arbetssökande, tar jag bort den utan
strid. Den är min svagaste position.

**3. Antalet snabbåtgärder.** Jag vill ned till en rad, men om konverterings-
experten kan visa att de sex korten är en fungerande upptäcktsyta för de funktioner
som annars aldrig hittas, kan jag leva med tre kort i stället för en rad. Det är
en avvägning mellan fokus och upptäckbarhet där jag inte har data.
