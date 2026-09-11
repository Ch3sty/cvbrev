# Granskning: mobil, flöden och informationsarkitektur

Granskat vid 375 px. Alla påståenden är verifierade i koden.

## 1. Helhetsbedömning

En ny användare möts av en dashboard som ställer sex likvärdiga frågor samtidigt och en bottennavigation vars mittknapp visar ett hänglås när hon inte hunnit ladda upp något, alltså en produkt som presenterar sig med en spärr i stället för ett första steg. En aktiv användare möts av elva staplade sektioner i tillstånd C där statusraden, kvotraden, Sökta tjänster-raden och Nästa steg-kortet alla rapporterar samma ansökningssiffra med olika typsnitt och olika kortformer, vilket gör att skärmen känns hög och ostyrd snarare än informativ. Det tekniska bygget är i grunden gott: middleware skyddar rutter, laddning sker med sektionsskelett, iOS-zoom är avvärjt globalt och safe-area finns på de flesta sticky element. Problemet är att två designspråk lever parallellt, 176 förekomster av `rounded-3xl`, 81 av `font-black` och 43 röd-rosa gradienter mot en handfull nya komponenter som faktiskt följer designsystemet, och gränsen går mitt igenom samma skärm. Det som mest hindrar "seriös och modern" på mobil är inte färgvalet utan att de tre tyngsta flödena kastar bort allt arbete vid minsta avbrott, vilket är oförlåtligt när halva trafiken sitter på en telefon som ringer.

## 2. De tio viktigaste problemen

**1. Flerstegsflödena sparar ingenting.** `skapa-brev/page.tsx` håller hela flödet i `useState` (rad 77 till 100): valt CV, annonstext, tonalitet, mall, typsnitt, genererat brev. Ingen `localStorage`, ingen `sessionStorage`, ingen URL-synk. Samma sak i `CVCreatorWizard.tsx` och `CVAnalysisWizard.tsx`. Ett inkommande samtal, en flikrensning eller iOS som lägger fliken i viloläge raderar allt. På mobil är det inte ett kantfall, det är vardagen. Retention: användaren kommer inte tillbaka en andra gång till ett flöde som redan svikit henne en gång.

**2. FAB:en säger "Lås" i stället för att hjälpa.** `MobileBottomNav.tsx` rad 82 till 91: har användaren inget CV blir mittknappen en `Lock`-ikon mot `/dashboard/profil/cv`. Den mest framträdande ytan på hela mobilskärmen kommunicerar spärr till just den användare som ännu inte gjort något. Den ska säga "Ladda upp CV" med en uppåtpil. Konvertering: det här är första skärmen efter registrering.

**3. Två konkurrerande FAB:ar på samma skärm.** `/dashboard/mina-brev` renderar `CreateLetterFab` (rad 408) och `/dashboard/sokta-tjanster` renderar sin egen FAB (rad 344), båda runda, båda 56 px, båda `z-30`, båda med ett plustecken, båda placerade `bottom: calc(5.5rem + safe-area)`, alltså rakt ovanför bottennavets FAB som också är ett plustecken. Två plusknappar i samma hörnområde med olika betydelse. Förtroende och tydlighet: användaren kan inte lära sig vad plus betyder.

**4. Röd-rosa gradienten sitter i navigationen.** `MobileBottomNav.tsx` rad 87 använder `linear-gradient(135deg, #F97316 0%, #DC2626 100%)` med röd skugga, och båda sid-FAB:arna använder samma. Det är den uttryckligen förbjudna gradienten, på den yta som syns på varenda inloggad mobilskärm. 43 förekomster totalt i dashboard-koden.

**5. Bottennavets etiketter är inte läsbara och träffytorna för små.** `NavTab` ger `px-2 py-1` runt en 20 px ikon plus `text-[10px]`. Det blir ungefär 28 px hög träffyta, mot kravet 44. Etiketter på 10 px underskrider all rimlig läsbarhet. Fyra slots på 375 px har gott om plats att bli 48 px höga, det är bara padding som saknas.

**6. Tillstånd C är elva sektioner i en enda kolumn.** `dashboard/page.tsx` rad 380 och framåt renderar statusrad, kvotrad, profilkomplettering, nästa steg, aktivitet, snabbåtgärder, CV-status, sökta tjänster, bli upptäckt och streak efter varandra. `DashboardSnabbAtgarder` är dessutom `grid-cols-1` på mobil med sex kort. Grovt räknat handlar det om fem till sex skärmhöjder scroll innan sidan tar slut, och flera sektioner upprepar samma siffra. Retention: den dagliga återkomsten blir en scrollövning.

**7. Gammalt designspråk mitt i det nya, på samma skärm.** `CvStatusCard.tsx` och `SoktaTjansterStatusRad.tsx` ligger direkt under den nya `DashboardStatusRow` och använder `rounded-3xl`, `font-black`, `text-[10px] uppercase tracking-[0.18em]`, `hover:-translate-y-0.5` och knappar på `py-2` (cirka 34 px). `DashboardStatusRow` bredvid är `rounded-xl`, `font-semibold`, `h-11`. Skillnaden syns i samma ögonkast och läser som att sidan är halvfärdig.

**8. Chatten använder `100vh`.** `JobbcoachenLayout.tsx` rad 33: `h-[calc(100vh-11rem)]`. På iOS Safari ändras `100vh` inte när adressfältet fälls in, så inmatningsfältet hamnar bakom browserchromet precis när tangentbordet är uppe. Repot har åtta `100vh` och en enda `dvh`. Chatten är det värsta fallet eftersom den är ett tangentbordsflöde.

**9. Sticky-offsetarna är gissade, var och en för sig.** Samma bottennav kompenseras med `64px`, `70px`, `76px`, `88px`, `5.5rem` och `96px` på olika ställen (`AnalysisFlowProgress`, `SkapaCvProgress`, `SaveBar`, `JobDetailModal`, FAB:arna, `Toast`). `globals.css` sätter samtidigt `.dashboard-main-content { padding-bottom: 5rem }` medan navet med `pb-[max(1.5rem,safe-area)]` blir klart högre än så. Något ligger alltid fel, och ingen enskild fil kan se det.

**10. Träffytor och text under gränsvärdena, systematiskt.** `InfoPopover` har en 32 px trigger och en 28 px stängknapp, och panelen är `absolute left-0 w-72` vilket klipps utanför skärmen för högerställda triggers på 375 px. Filterpillren i `sokta-tjanster` är `py-2` på `text-[12.5px]`. Dashboard-koden har 394 förekomster av `text-[10px]` eller `text-[11px]`. Dessutom är den globala fokusringen i `globals.css` rad 465 rosa (`rgba(236,72,153,0.6)`), vilket motsäger orange accent på varje tangentbordsfokus.

## 3. Förslag

### Görs om från grunden

**Bottennavigationen.** Fyra slots, ingen FAB. FAB:en löser ett problem vi inte har: den tar mittplatsen, tvingar flikarna utåt, kräver en negativ topposition som lägger sig över innehåll, och betyder olika saker på olika sidor. I stället får varje sida sin egen primära handling i innehållet, där designsystemet redan säger att den hör hemma.

```
+--------------------------------------------------+
|   [ ]        [ ]         [ ]          [ ]        |
|   Hem     Ansökningar   Skapa       Profil       |
|                                         *        |
+--------------------------------------------------+
      48 px hög rad, 12 px text, safe-area under
```

"Skapa" öppnar ett ark med tre val: nytt brev, nytt CV, logga ansökan. Det är ett tryck extra mot dagens FAB för brev, men det tar bort tvetydigheten och ger CV och ansökningsloggning en väg som idag saknas helt i navet. Pricken på Profil behålls precis som planen beskriver.

**Flerstegsmönstret.** Ett gemensamt skal för skapa-brev, skapa-cv, cv-analys och linkedin:

```
+------------------------------+
| <  Personligt brev     2/5   |   sticky topp, 48 px
|  ============------------    |   tunn progressrad
+------------------------------+
|                              |
|  Ett steg, en fråga          |
|  (scrollar)                  |
|                              |
+------------------------------+
|  [ Fortsätt            ]     |   sticky botten, h-11
+------------------------------+
      safe-area + navhöjd via variabel
```

Tre regler för skalet: steget ligger i URL:en (`?steg=2`) så bakåtknappen fungerar och sidan tål omladdning; varje steg autosparar till `localStorage` under en nyckel per flöde och erbjuder "Fortsätt där du slutade" vid återkomst; sticky fotknapp är alltid enda primära handlingen och "Tillbaka" är chevron uppe till vänster, aldrig en andra knapp bredvid.

**Tillstånd C på dashboarden.** Från elva sektioner till fyra, i denna ordning: statusrad (brev, ansökningar, svar, streak), en enda kontextuell rad som antingen är kvot eller nästa steg men aldrig båda, snabbåtgärder som två kolumner med kompakta kort, senaste aktivitet. CV-status, Sökta tjänster-raden, Bli upptäckt-raden och streakblocket bakas in i statusraden eller flyttas till respektive sida där de har sammanhang.

```
375 px, tillstånd C:
+------------------------------+
| 92 brev  11 ansökn  3 svar   |
| [ Skapa nytt brev        ]   |
+------------------------------+
| 9 utan svar på två veckor  > |
+------------------------------+
| Vad vill du göra?            |
| +------------+ +-----------+ |
| | Nytt brev  | | Logga     | |
| +------------+ +-----------+ |
| +------------+ +-----------+ |
| | Matcha     | | Analysera | |
| +------------+ +-----------+ |
+------------------------------+
| Senaste aktivitet            |
+------------------------------+
```

### Justeras

Bottennavets träffytor till 48 px och etiketter till 12 px. En enda CSS-variabel `--bottom-nav-h` i `globals.css` som alla sticky element och `.dashboard-main-content` räknar mot, så de sex olika gissningarna blir en sanning. Alla `100vh` till `100dvh`. Fokusringen från rosa till orange. `InfoPopover` får 44 px trigger och blir ett bottenark under `sm` i stället för en absolut panel. Filterpillren och alla knappar under 44 px höjs.

### Tas bort helt

Sid-FAB:arna i `mina-brev` och `sokta-tjanster`, eftersom listans primära handling hör hemma överst i listan. `CvStatusCard`, `SoktaTjansterStatusRad` och `BliUpptacktStatusRad` som separata dashboardkort. Sidebar-drawern på mobil i sin nuvarande form: när bottennavet har fyra slots och "Skapa"-arket finns, räcker det att hamburgaren öppnar en enkel lista över verktygen, inte en spegling av hela desktopmenyn med tolv rader.

### Mobil informationsarkitektur

Ett tryck bort: skapa brev, logga ansökan, se status på ansökningar, öppna profil och prenumeration, dashboard. Två tryck: ladda upp CV, jobbmatchning, CV-analys, mina brev. Göms i verktygsmenyn: CV-mallar, LinkedIn, rekryteringstester, jobbcoachen, bli upptäckt, belöningar. Det tar de fem vanligaste uppgifterna från dagens tre till fem tryck ned till ett eller två, och priset är att sällanverktygen flyttar ett steg bort, vilket är rätt pris.

## 4. Tre saker jag inte kompromissar om

**Flödena måste överleva ett avbrott.** URL-steg plus autospara. Utan det spelar ingen annan förbättring roll, för användaren hinner aldrig till slutet av flödet på en telefon. Det här är inte en designfråga utan en förutsättning för att produkten ska fungera på hälften av trafiken.

**Inga två FAB:ar och inget hänglås i navigationen.** Navigationens jobb är att göra nästa steg uppenbart. En yta som betyder tre olika saker beroende på sida, och som ibland betyder "du får inte", lär användaren att inte lita på den.

**44 px träffytor och 12 px som minsta etikett i navigationen.** Det är inte en smaksak, det är Apples och Googles publicerade minimum, och våra 28 px höga flikar med 10 px text ligger under båda. En tjänst som ser seriös ut men är svår att träffa läses som slarvig.

## 5. Tre saker jag gärna ger upp

**Att FAB:en försvinner helt.** Om någon visar att brevflödet är så dominerande att det förtjänar en permanent genväg, accepterar jag fyra slots plus FAB som idag, förutsatt att FAB:en betyder exakt en sak överallt och att sid-FAB:arna ändå tas bort.

**Ordningen inne i tillstånd C.** Om säljsidan har data på att kvotraden konverterar bättre högre upp än snabbåtgärderna, byter jag gärna. Min invändning gäller antalet sektioner, inte deras inbördes ordning.

**Att "Skapa" blir ett ark med tre val.** Om det visar sig att CV-uppladdning och ansökningsloggning nås tillräckligt bra på annat håll, kan slotten peka rakt in i brevflödet i stället. Arket är en lösning på tvetydigheten, inte ett mål i sig.
