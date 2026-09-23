# Plan: omdesign av det inloggade läget

> Beslutad plan. Framtagen av fyra granskare: SaaS-tillväxt, SaaS-retention,
> UX visuell identitet (sammankallande) och UX mobil. Underlaget är fyra
> granskningar och tre ställningstaganden, samtliga med kodverifiering på main
> (ffd5b71e). Alla siffror är räknade i koden.
>
> Designreglerna ligger i `docs/designsystem.md` och upprepas inte här.
> Detta dokument kompletterar och utökar dem. Varje punkt nedan är ett beslut.

## 1. Vision

Det inloggade läget är **Mitt jobbsök**: ett dagligt nav där användarens
ansökningar står i centrum och verktygen är steg i den resan, inte en meny att
välja ur. Alla fyra granskare landade oberoende av varandra i samma slutsats,
att produkten idag är en verktygskatalog med en aktiveringstratt framför sig,
och att den enda funktion som förändras utan att användaren gör något är
ansökningar som väntar på svar. Det är den enda naturliga dagliga rytm vi har,
och därför bär den hemskärmen. Efter omgången öppnar användaren appen för att
se vad som hänt med hennes ansökningar, inte för att generera ett dokument, och
varje verktyg nås därifrån när det behövs. Affärsmässigt är det också det enda
som gör 149 kr rimligt: enskilda AI-utdata kan konkurrenterna matcha, men en
historik med elva ansökningar, tre intervjuer och svarsfrekvens per CV blir
dyrare att lämna för varje vecka.

## 2. Principer

1. **Ansökningarna är centrum.** Allt annat är steg i den resan.
2. **En vy, en primär handling.** Max en fylld orange yta per skärm.
3. **Vi säger ingenting koden inte backar.** Inga löften om trial, ranking
   eller kvoter som inte stämmer exakt.
4. **Värdet först, spärren sedan.** Mallen renderas innan nedladdningen
   spärras, analysen visar tre fynd innan resten låses.
5. **Flöden överlever avbrott.** URL-steg och autospara i allt med mer än ett
   steg.
6. **Mobil först på riktigt.** 44 px träffytor, 12 px minsta etikett, en
   sanning om bottennavets höjd.
7. **En sidmall för alla sidor.** Sidhuvud, primär handling, innehåll, tomt
   tillstånd. Inga egna hjältar per sida.
8. **Siffror i sammanhang.** Aldrig en rad med bara nollor, aldrig
   "Obegränsat" till någon som har en gräns.

## 3. Informationsarkitektur

### Sidebar (desktop)

Tre grupper. Ansökningar först efter Översikt, eftersom det är den nya kärnan.

```
+----------------------------------+
|  Jobbcoach.ai                    |
+----------------------------------+
|  [ ] Översikt                    |
|  [ ] Ansökningar            11   |
|  [ ] CV                      8   |
|  [ ] Brev                   11   |
|                                  |
|  VERKTYG                         |
|  [ ] Skriv brev                  |
|  [ ] Analysera CV                |
|  [ ] Jobbmatchning               |
|  [ ] CV-mallar                   |
|  [ ] Rekryteringstester          |
|  [ ] LinkedIn                    |
|  [ ] Jobbcoachen                 |
|  [ ] Bli upptäckt                |
|                                  |
|  KONTO                           |
| +------------------------------+ |
| | [ ] Premium      Gratis      | |  tunn orange ram bara i gratisläge
| +------------------------------+ |
|  [ ] Profil                      |
+----------------------------------+
|  Hjälp                           |
+----------------------------------+
```

Belöningar finns inte, se avsnitt 5. Utloggning ligger i profilmenyn.

### Mobilnav

Fyra slots, ingen FAB. En yta som betyder olika saker på olika sidor lär
användaren att inte lita på den, och Skapa-arket ger både CV-uppladdning och
ansökningsloggning en väg som idag saknas helt i navet.

```
+--------------------------------------------------+
|   [ ]         [ ]         [ ]         [ ]        |
|   Hem     Ansökningar   Skapa      Profil        |
|                                        *         |
+--------------------------------------------------+
    48 px hög, 12 px etiketter, safe-area under
    * prick vid mindre än 2 dagar kvar eller betalningsfel
```

Skapa öppnas som **bottenark**, aldrig som centrerad modal, med tre rader på
minst 56 px, stängbart med svep nedåt och tryck utanför. Ordningen är dynamisk:
"Logga ansökan" överst när användaren har minst en ansökan, annars "Nytt CV"
överst. Raderna är alltid samma tre, bara ordningen ändras, så ingen rad byter
mål mellan besök.

### Header

Hälsning till vänster, meddelanden, notiser och profilmeny till höger. Ingen
streak-pill, inget datum. Profilmenyn innehåller namn, e-post, premiumstatus,
Prenumeration, Profil, Logga ut.

Notisklockan är **alltid synlig och flyttar sig aldrig**. Utan nytt visas den
utan badge, och vid klick visar den tomma tillståndet enligt sidmallen med
meningen "Inget nytt just nu. Vi hör av oss när en ansökan blivit tyst för
länge." Ett element som försvinner och dyker upp i headern är värre än ett tomt.
Pollingen sänks från 60 sekunder till en gång per sidladdning plus realtime på
notistabellen. Om realtime inte hinner byggas i omgången gäller fem minuter,
aldrig en.

### Sidmall

Alla dashboardsidor följer detta skelett. Inga egna hjältar.

```
+--------------------------------------------------------------+
| SIDHUVUD                                                     |
|   h1  text-2xl font-semibold tracking-tight text-neutral-900 |
|   en rad text-sm text-neutral-600 som säger vad sidan gör    |
|                                    [ Primär handling h-11 ]  |
+--------------------------------------------------------------+
| STATUS  (valfri, en rad, aldrig ett kort)                    |
+--------------------------------------------------------------+
| INNEHÅLL                                                     |
|   kort: bg-white rounded-xl border border-neutral-200        |
|   ingen skugga, ingen gradient, ingen toppstrip              |
+--------------------------------------------------------------+
```

Tomt tillstånd, samma överallt:

```
+--------------------------------------------------------------+
|                    [ illustration 96 ]                       |
|              Inga ansökningar än                             |
|     Logga den första så håller vi koll på svaren.            |
|                 [ Logga en ansökan ]                         |
+--------------------------------------------------------------+
```

## 4. Hemskärm per tillstånd

### A. Ny utan CV

Oförändrad. Heron ber om CV:t och gör exakt en sak. Under den två textlänkar.

### B. CV men inget brev

Hero som pekar mot första brevet, profilkort om något saknas, tre
snabbåtgärdskort. Korten finns kvar här eftersom upptäckt behövs i detta läge.

### C. Aktiv, gratis eller betalande

Från elva sektioner till fem. Detta är omgångens tyngsta enskilda förändring.

```
Desktop:
+--------------------------------------------------------------+
| Premium aktivt · 3 dagar kvar                      Hantera   |
+--------------------------------------------------------------+
| Ditt jobbsök i september                                     |
|  11 sökta   9 väntar svar   2 intervju   1 svar              |
|  Senaste ansökan 3 dagar sedan            [ Logga ansökan ]  |
+--------------------------------------------------------------+
| 9 ansökningar har varit tysta i över två veckor.   Följ upp  |
+--------------------------------------------------------------+
| Pågår nu                                                     |
|  Systemutvecklare, Volvo      Väntar svar      17 dagar   >  |
|  Projektledare, Kommunen      Intervju bokad   2 okt      >  |
|  UX-designer, Spotify         Väntar svar      4 dagar    >  |
|                                            Se alla (11)      |
+--------------------------------------------------------------+
| Brev 1/1   Analys 0/1   Chatt 4/10        Se vad Premium ger |
+--------------------------------------------------------------+
| Senaste aktivitet                                            |
+--------------------------------------------------------------+
```

```
Mobil 375 px:
+------------------------------+
| Premium · 3 dagar kvar       |
+------------------------------+
| Ditt jobbsök i september     |
|  11          9               |
|  sökta       väntar svar     |
|  2           1               |
|  intervju    svar            |
| [ Logga ansökan          ]   |
+------------------------------+
| 9 tysta i över två veckor  > |
+------------------------------+
| Pågår nu                     |
|  Volvo      17 dagar      >  |
|  Kommunen   Intervju      >  |
|  Spotify    4 dagar       >  |
|            Se alla (11)      |
+------------------------------+
| Brev 1/1  Analys 0/1         |
+------------------------------+
| Senaste aktivitet            |
+------------------------------+
```

De fyra siffrorna ligger i **två rader om två** på mobil, med `tabular-nums`
och etiketten under siffran. Fyra siffror på en rad ger 70 px per kolumn och
trunkerade etiketter.

**Huvudsiffra:** fyra beskrivande antal, ingen svarsfrekvens. En arbetslös med
0 svar på 20 ansökningar ska inte mötas av ett underkänt betyg varje morgon.
Svarsfrekvens bor på ansökningssidan, dit man går aktivt för att analysera. Vid
noll aktivitet renderas meningen "Du har inte sökt något jobb den här veckan än"
i stället för en rad nollor.

**Progression:** "3 ansökningar den här veckan" i statusraden ersätter streaken
och mäter jobbsökandet i stället för appanvändningen. Den byggs samtidigt som
streaken tas bort, aldrig efter.

**Tas bort ur hemskärmen:** `NastaSteg` som eget kort (uppgår i
uppföljningsraden), `CvStatusCard`, `SoktaTjansterStatusRad`,
`BliUpptacktStatusRad`, `StreakOchStatus`, `DashboardSnabbAtgarder` i nuvarande
form.

**Snabbåtgärder:** kort i tillstånd B, **en enda rad** i tillstånd C. Raden är
en riktig rad med textlänk, inte ett hopkrympt kort med ram. Den rankas av
befintliga `useUnusedFeatures` och visar exakt en oprövad funktion i taget med
en mening om varför just nu ("Du har sökt 11 jobb men aldrig kört en
CV-analys"). Raden byts när funktionen använts, annars blir den blind efter
tredje besöket.

### Trial dag 1 till 5

Dag 1: raden säger vad hon fått, inte att hon fått något. "Du har Premium i fem
dagar. Ladda ner så många brev du vill." Dag 2 till 3 tyst. Dag 4: raden blir
orange och `UpgradeSheet` visar tre förlustrader **rangordnade efter faktisk
användning** under dag 1 till 3. Dag 6: `DowngradedNotice` en gång, med exakt
vad som ändrats.

### Betalande

Samma som C, utan kvotrad. Statusraden säger "Premium aktivt". Ingen
uppgraderingsimpuls på hemskärmen. Månad till kvartal erbjuds på
prenumerationssidan efter 60 dagar, aldrig på hemskärmen.

## 5. Sida för sida

**Ansökningar (sökta tjänster).** Produktens viktigaste sida. Görs om: sidhuvud
enligt mallen, statusrad med de fyra siffrorna, lista grupperad efter vad som
kräver handling (tysta över 14 dagar först, sedan intervjuer, sedan övriga).
Här bor svarsfrekvens, och här byggs **"CV A ger 30 procent svar, CV B ger 8"**,
den enda insikt i produkten som ingen konkurrent kan kopiera eftersom den kräver
vår egen historik. Justeras: "Markera som sökt" sätter alltid `cv_id` och har
valbar kanal. Tas bort: sid-FAB:en och ghost-tratten `FunnelBars` med sina 42
procent som implicit norm.

*Tomt tillstånd:* när användaren har sparade brev är importvägen primär handling,
"Vi hittade 11 brev. Lägg in dem som ansökningar", i stället för det generiska
tomma tillståndet. Merparten av de 304 kontona är i exakt det läget.
`BackfillBanner` snoozas 30 dagar, aldrig för alltid.

*Betalvägg:* en enda på sidan, på AF-rapporten och exporten. Loggning är gratis
för alltid eftersom den skapar inlåsningsvärdet, men uttaget av den sammanställda
rapporten följer principen gratis att skapa, betalt att ta ut.

*Mobil:* listan är rader, inte kort.

**CV.** Görs om: `CvHeroBanner` ersätts av sidhuvud, `CvUnlocksFlow` ("Du har
låst upp 4 funktioner") tas bort helt som dekoration utan innehåll. Justeras:
"Premium ∞" blir "Premium, inga gränser". CV-kort blir rader. Mobil: en kolumn,
gradientknappar bort.

**Brev, lista.** Primär handling flyttar till sidhuvudet, sid-FAB:en tas bort.
"Markera som sökt" lyfts ur overflow-menyn till synlig åtgärd, och kortet byter
till chip "Sökt 4 maj" efter loggning.

**Brev, skapa.** Görs om enligt flödesmönstret i avsnitt 6. Det enskilt
viktigaste tekniska lyftet: flödet tappar idag allt vid avbrott.

**Brev, detalj.** Lägg till "Markera som sökt", som saknas just där man läser
brevet innan avsändning.

**CV-analys.** Görs om enligt flödesmönstret. Gating-logiken behålls, den är
rätt byggd.

**Jobbmatchning.** Alla träffar visas med de sista suddade och `PaywallCard`
under, i stället för att listan klipps vid 10 med en prisrad. "Logga ansökan"
direkt på jobbkortet. "I realtid" stryks, datan är cachad Platsbanken.

**Jobbcoachen.** `100vh` till `100dvh`, annars hamnar inmatningsfältet bakom
browserchromet på iOS precis när tangentbordet är uppe. Sidhuvud enligt mallen.

**LinkedIn.** Görs om enligt flödesmönstret.

**Tester.** Femton nästan identiska kataloger med copy-paste-resultat på cirka
670 rader styck blir en dynamisk route med delad resultatkomponent. Testkortet
öppnar alltid testet, gaten kommer vid tredje sessionen, inte vid klicket.
`TesterHubHero` ersätts av sidhuvud.

**Bli upptäckt.** Görs om från underkännandelista till förberedelse. Tomt
tillstånd blir illustration, en mening, en knapp, i stället för ett tjugotal
negativa signaler. Ett nästa steg i taget. Rankningslöftena stryks, se avsnitt 9.
Läggs till: "Din profil har visats N gånger den här veckan", så investeringen
får observerbar återkoppling.

**Belöningar.** Tas bort helt: XP, nivåer och `/dashboard/rewards`. Alla tio
milstolpar är premiumdagar eller rabatt på vår egen produkt, alltså en
rabattstege förklädd till spel, systemet ger XP för att klicka på belöningen man
fick av sin XP, och sidan är redan föräldralös utan väg från sidebar, mobilnav
eller profilmeny. Med 3 betalande av 304 har vi heller inget utrymme att lära
användare att priset är förhandlingsbart.

Borttagningen omfattar `AchievementManager` i `dashboard/layout.tsx` och
XP-anropen i `letters/route.ts`, `cv/jobs/[jobId]/route.ts` och
`cv/kompetensutveckling/status/route.ts`. Halvvägs borttagen gamification är
sämre än båda alternativen, eftersom systemet annars fortsätter skriva till
`xp_history` och `global_user_stats` utan att någon yta läser dem.
**Redan utfärdade rabattkoder fortsätter lösas in tills de löper ut.**

**Streak.** Tas bort från hemskärmen och helt ur produkten. Den är matematiskt
omöjlig att hålla på gratisnivån eftersom de enda streakhöjande handlingarna är
kvotbegränsade, vilket gör den till ett tävlingsmoment bara betalande kan vinna,
presenterat för någon som är arbetslös.

**Profil.** `ProfileHero` ersätts av sidhuvud. `ProfileOverviewCards` är redan
omgjord. Profilkompletteringen behålls.

**Prenumeration.** `PrenumerationHero`, `PremiumFeaturesGrid` och
`TrialCTACard` tas bort helt. Gratisläget blir sidhuvud, `UsageStats` (redan
rättad), `PlanCards`, `GratisMotPremium`, FAQ. Premiumläget blir statusrad,
`UsageStats`, `ManageSubscriptionCard`.

## 6. Flödesmönster och gemensamma komponenter

Gemensamt skal för skapa-brev, skapa-cv, cv-analys och linkedin:

```
+------------------------------+
| <  Personligt brev     2/5   |   sticky topp, 48 px
|  ============------------    |   tunn progressrad
+------------------------------+
|  Ett steg, en fråga          |
|  (scrollar)                  |
+------------------------------+
|  [ Fortsätt            ]     |   sticky fot, h-11
+------------------------------+
```

**Tangentbordet är mobilflödets verkliga fiende.** På iOS lägger sig det
virtuella tangentbordet över fixed-positionerade element, så en fixed fot hamnar
bakom tangentbordet i exakt de steg som har inmatning. Därför:

- Skalets fot använder `position: sticky` i en flex-kolumn med `100dvh`-höjd,
  aldrig `position: fixed`.
- Flödesskalet **döljer bottennavet** (`--bottom-nav-h: 0`) medan ett flöde är
  öppet. Ett flöde är ett läge, inte en sida, och navet ska inte konkurrera med
  "Fortsätt" om samma 96 px.
- Alla fält får `enterKeyHint` och `inputMode`. Idag finns 0 `enterKeyHint` och
  19 `inputMode` mot 46 inmatningsfält.

**Steg och autospara.** Steget ligger i URL:en (`?steg=2`) så bakåtknappen
fungerar och sidan tål omladdning. Utkast sparas under nyckeln
`flow:<namn>:<version>` med tidsstämpel, vid stegbyte och vid
`visibilitychange`, aldrig på varje tangenttryckning. Vid återkomst visas ett
val med två knappar, "Fortsätt" och "Börja om", där "Börja om" kräver
bekräftelse. Utan kollisionsregeln byter vi ett tappat flöde mot ett raderat
flöde. Utkast äldre än sju dagar rensas automatiskt.

**Övrigt.** Sticky fot är alltid enda primära handlingen, "Tillbaka" är chevron
uppe till vänster. AI-anrop går alltid att avbryta, och ett avbrutet anrop
återställer till föregående steg med datan kvar. Fel visas i flödet, aldrig som
toast som hinner försvinna.

**Gemensamma komponenter** som byggs en gång: `PageHeader`, `EmptyState`,
`StatusRow`, `Sheet` (bottenark mobil, centrerad modal desktop),
`ConfirmDialog`, `LoadingSkeleton`.

## 7. Grafisk profil

Designsystemet utökas med:

- **Illustrationsroller:** 24 px inline i rad, 48 px bredvid rubrik i kort,
  96 px i tomt tillstånd, 240 px bara i hero tillstånd A. En per vy.
- **Textminimum 12 px.** Idag 218 `text-[10px]` och 404 `text-[11px]`.
- **Touch 44 px** minimum, 48 px i navigation.
- **En sanning om bottennavets höjd:** CSS-variabeln `--bottom-nav-h` som alla
  sticky element räknar mot. Idag finns sex olika gissningar (64, 70, 76, 88,
  5.5rem, 96 px).
- **Z-index-skala:** innehåll 0, sticky 30, nav 40, sheet 50, modal 60, toast 70.
- **Safe areas** på allt sticky.
- **Fokusring orange**, inte rosa. Den är `rgba(236,72,153,0.6)` idag, alltså
  rosa på varje tangentbordsfokus.

Mekaniskt svep, verifierade antal i `src/app/dashboard` och `src/components`:

| Vad | Antal | Åtgärd |
|---|---|---|
| `rounded-3xl` | 275 | till `rounded-xl` |
| `rounded-2xl` | 437 | till `rounded-xl` |
| `font-black` | 232 | till `font-semibold` |
| Röd-rosa (`BE185D`) | 290 | bort, orange accent |
| Em-dash | 350 | till komma eller punkt |
| `slate-` | 3795 | till `neutral-` |
| `text-[10px]` och `[11px]` | 622 | till minst 12 px |
| `100vh` | 12 | till `100dvh` |

Lucide i gradientruta ersätts av illustrationer enligt `primitives.tsx`.
Skuggor tas bort från stillastående kort, behålls på dropdown, modal, sheet och
sticky mobil-CTA.

## 8. Retention och kommunikation

Idag är alla livscykelmail kommersiella: reverse trial, winback, quota_wall,
trial dag 3/5/7, onetime_expired, payment_failed, cancel, gratisniva. Noll
handlar om användarens jobbsökande. Ett produktlöfte som bara hör av sig när det
vill ha betalt läser som en säljmaskin, mot en målgrupp som ofta är arbetslös.

**`weekly_digest`, söndag kväll.** Så här många jobb sökte du, så här många
väntar på svar, de här två borde du följa upp. Datan finns i
`job_applications`, runnern och mallayouten finns. Det är det enda mail som ger
innan det ber, och den enda åtgärd i planen som når de konton som inte öppnar
appen.

*Avregistrering:* veckomailet har en egen avregistreringslänk som bara stänger
digesten och lämnar transaktionsmailen orörda, plus en rad i profilen. Det slutar
skickas automatiskt efter fyra veckor utan inloggning. Ett mail man inte kan
stänga av blir spam oavsett innehåll.

**Uppföljningsnotis i appen** när en ansökan varit tyst i 14 dagar. Den ger
notisklockan innehåll för alla konton, inte bara de som får rekryterarintresse.

**AF-rapporten** får påminnelse och deadline i UI. Den måste lämnas varje månad
och är vårt starkaste naturliga återkomstankare, men finns idag bara om man
råkar klicka in.

## 9. Sanningskrav

Löften i UI som koden inte backar. Alla rättas i våg 1.

| Löfte | Var | Sanning | Åtgärd |
|---|---|---|---|
| "Prova gratis i 7 dagar", "0 kr första 7 dagarna" | `PrenumerationHero`, `ProfileHero`, `PremiumGateModal`, `PricingCard`, `PrenumerationFAQ`, `TidsbegransadPremiumCard` m fl, 8 filer | Modellen är 5 dagars reverse trial, redan förbrukad när användaren läser detta | Stryk. Ersätt med "Fem dagar Premium ingår när du skapar konto" |
| "7 brev i veckan" | `StreakOchStatus` `FREE_LIMITS` | `DAILY_LIMIT_LETTERS = 1` per dygn | Komponenten tas bort, kvot visas bara av `QuotaNudgeRow` |
| "Obegränsat" till gratisanvändare | `StreakOchStatus` m fl | Gratis har kvoter | Bort med komponenten, `UsageStats` redan rättad |
| "Kompletta profiler visas först" | `ProfileStrengthCard` | `computeProfileStrength` räknas i klienten och sparas aldrig till `candidate_profiles`. Ingen sortering på profilstyrka finns | Stryk meningen |
| "fler verifierade resultat lyfter dig i sökresultaten" | `ProfileStrengthCard` | Samma som ovan | Stryk |
| "Det här kan ingen annan plattform visa" | `VerifiedResultsCard` | Obelagt konkurrentpåstående | Stryk |
| "i realtid" om jobbmatchning | jobbmatchning | Datan är cachad Platsbanken | Stryk |
| Ghost-tratt 12/5/3/1 | `FunnelBars` | 42 procent svarsfrekvens som implicit norm | Neutrala staplar utan siffror |

Att rätta dessa är inte kosmetik. En användare som upptäcker att ett av dem är
osant slutar lita på ATS-poängen, matchningsprocenten och testresultaten också.

## 10. Åtgärdslista

> 2026-09-23: sidomenyn byggd om enligt den visuella linjen (docs/design/analys-visuell-linje-2026-09-22.html, regel 8): fyra tunga val med antal, verktygen i tre grupper (Skriv och förbättra, Hitta jobb, Träna), inga underrader i menyn; hemskärmen med display-h1, Nästa handling som bläckyta och aktiviteten som meningar per dag. Detaljer i docs/bygg-noter-paket.md, "Visuell linje: avgjort".

### Våg 1: sanning, intäkt och blockerare (en vecka)

1. Stryk alla "7 dagar"-löften i 8 filer. **S.** Inga beroenden.
2. Ta bort `StreakOchStatus` (löser kvotmotsägelsen utan ny kod). **S.**
3. Stryk rankningslöftena i Bli upptäckt. **S.**
4. Logga premiumanvändning (nedladdat brev, körd analys, genomfört test, låst
   mall) som rad per händelse i befintlig aktivitetslogg, och låt `UpgradeSheet`
   dag 4 rangordna sina tre förlustrader efter loggen. **S.** Inga beroenden.
   Detta är den kod som gör reverse trial till en konverteringsmekanism i
   stället för en gratisperiod.
5. Jobbmatchning: alla träffar visas med de sista suddade och `PaywallCard`
   under, i stället för klippt lista med prisrad. **S.**
6. Testkorten öppnar testet i stället för prenumerationssidan, gaten flyttas
   till tredje sessionen. **S.**
7. `100vh` till `100dvh` (12 st), fokusring till orange. **S.**
8. `--bottom-nav-h` som enda sanning, ersätter sex gissningar. **S.**
9. Nytt mobilnav: fyra slots utan FAB, Skapa-ark som bottenark. **M.** Beror
   på 8. Görs nu, inte i våg 2, så att allt efterföljande byggs mot rätt
   navhöjd från början i stället för mot en höjd vi vet ska ändras.
10. Ta bort sid-FAB:arna i `mina-brev` och `sokta-tjanster`. **S.** Beror på 9.
11. `weekly_digest` med egen avregistrering. **M.** Inga beroenden. Den enda
    åtgärden som når konton som inte öppnar appen.
12. Em-dash-svep, 350 st. **S.**

### Våg 2: struktur

13. `PageHeader` och `EmptyState` som delade komponenter. **M.**
14. Hemskärm tillstånd C till fem sektioner, inklusive "3 ansökningar den här
    veckan" som ersätter streaken. **L.** Beror på 2 och 13.
15. Ansökningssidan som produktens centrum, med importväg i tomt tillstånd,
    svarsfrekvens och CV-jämförelse. **L.** Beror på 14.
16. Betalvägg på AF-rapport och export, aldrig på loggning. **S.** Beror på 15.
17. Prenumerationssidan skrivs om. **M.** Beror på 1 och 13.
18. CV-sidan, bort med `CvHeroBanner` och `CvUnlocksFlow`. **M.** Beror på 13.
19. Flödesskalet med URL-steg, autospara, sticky fot och dolt nav. **L.**
    Beror på 8 och 13.
20. Uppföljningsnotis i appen, plus notisklockans tomma tillstånd och sänkt
    polling. **M.** Beror på 15.
21. Gamification tas bort helt, inklusive `AchievementManager` och de tre
    XP-anropen. Utfärdade rabattkoder fortsätter lösas in. **M.** Beror på 14.

### Våg 3: djup

22. Testområdet till dynamisk route med delad resultatkomponent. **L.**
23. Mekaniskt svep av resten (rounded, font-black, slate, textstorlekar,
    lucide i gradientruta). **L.** Beror på 13.
24. Bli upptäckt byggs om till förberedelseflöde med profilvisningar. **M.**
25. AF-rapport med påminnelse och deadline i UI. **M.** Beror på 15.
26. `enterKeyHint` och `inputMode` på alla 46 inmatningsfält. **S.** Beror på 19.

Summering: **12 punkter i våg 1, 9 i våg 2, 5 i våg 3.**

## 11. Enighetsprotokoll

### De sex konfliktpunkterna

1. **FAB i mobilnavet.** Alla fyra enades om att ta bort FAB:en till förmån för
   fyra slots plus ett Skapa-ark som bottenark, med dynamisk ordning på arkets
   tre rader.
2. **Notisklockan.** Enighet om att behålla och fylla den med
   uppföljningsnotiser, men den flyttar sig aldrig: alltid synlig utan badge,
   med ett tomt tillstånd som lovar något konkret, och sänkt polling.
3. **Snabbåtgärder.** Enighet om kort i tillstånd B och en enda rankad rad i
   tillstånd C, där raden är en riktig rad med textlänk och byts när funktionen
   använts.
4. **Huvudsiffra.** Enighet om fyra beskrivande antal på hemskärmen och
   svarsfrekvens enbart på ansökningssidan, där även CV-jämförelsen byggs.
5. **Gamification.** Enighet om att ta bort XP, nivåer och rewards helt,
   inklusive alla skrivpunkter, med villkoret att utfärdade rabattkoder
   fortsätter lösas in.
6. **Streak.** Enighet om att ta bort den helt, med ersättningen "3 ansökningar
   den här veckan" byggd samtidigt och inte efteråt.

### De nio invändningarna

1. **Trial-insäljningen för tunn i våg 1 (tillväxt).** Infogad som våg 1 punkt
   4: användningslogg plus rangordnade förlustrader i `UpgradeSheet`.
2. **Ansökningssidan saknar väg in och betalvägg (tillväxt).** Infogad i
   avsnitt 5 och som våg 2 punkt 15 och 16: importväg i tomt tillstånd,
   betalvägg på AF-rapport och export, aldrig på loggning.
3. **Våg 1 flyttar ingen intäkt (tillväxt).** Infogad: jobbmatchningens lista
   och testkorten flyttades upp till våg 1 punkt 5 och 6.
4. **`weekly_digest` borde ligga i våg 1 (retention).** Infogad som våg 1 punkt
   11, medan uppföljningsnotisen ligger kvar i våg 2 där den hör ihop med
   ansökningssidan.
5. **Avregistreringsväg för veckomailet saknas (retention).** Infogad i avsnitt
   8: egen avregistreringslänk, rad i profilen, automatiskt stopp efter fyra
   veckor utan inloggning.
6. **Tomt tillstånd för konton med brev men inga ansökningar (retention).**
   Infogad i avsnitt 5: importvägen är primär handling, `BackfillBanner` snoozas
   30 dagar i stället för för alltid.
7. **Tangentbordet saknas i flödesmönstret (mobil).** Infogad i avsnitt 6:
   sticky i stället för fixed, dolt bottennav under flöden, `enterKeyHint` och
   `inputMode`.
8. **Autospara utan kollisionsregel (mobil).** Infogad i avsnitt 6: nyckel med
   version och tidsstämpel, val mellan Fortsätt och Börja om, sjudagarsrensning.
9. **Våg 1 punkt 4 och punkt 11 motsäger varandra (mobil).** Löst genom
   mobilgranskarens föredragna alternativ: hela mobilnavet flyttades till våg 1
   punkt 9, så FAB:en aldrig lagas för att sedan raderas.

### Krockande invändningar

Tillväxt ville flytta två intäktspunkter till våg 1 medan mobil ville flytta
hela navbygget dit, vilket tillsammans gör våg 1 tung. Jag tog in båda men lät
dem bära olika vikt: de fyra intäktspunkterna är alla S och rena omkopplingar av
befintliga komponenter, medan navbygget är den enda M-punkten som får plats,
eftersom alternativet är att bygga två vågor mot en navhöjd vi redan beslutat
att ändra.
