# Audit: visuell identitet, informationsdesign, konsekvens

Granskare: UX-lead (designsystemets författare). Underlag: JSX-genomgång på
main, commit ffd5b71e. Siffrorna nedan är räknade i koden, inte uppskattade.

## 1. Helhetsbedömning

En ny användare möter två olika produkter i samma app: dashboardens nya rader
och betalväggarna talar ett lugnt, tätt språk, medan prenumerationssidan,
CV-sidan och alla verktygssidor fortfarande kör röd-rosa gradienthero med
`font-black` och lucide-ikoner i orange gradientrutor. En aktiv användare
möter tolv staplade sektioner på dashboarden där minst tre säger samma sak,
vilket gör att inget leder och att sidan känns som en samling widgets snarare
än ett verktyg. Det som hindrar "seriös och modern" är inte bristen på
grafiska effekter utan överskottet: 201 `rounded-3xl`, 88 `font-black` och 153
filer med hårdkodad orange-till-röd gradient drar uttrycket mot 2021 års
SaaS-mall. Det som hindrar "innovativ" är att produktens faktiska intelligens,
analysen och matchningen, presenteras i samma dekorativa förpackning som en
XP-mätare, så användaren kan inte se vad som är substans. Och det som hindrar
"framstående" är inkonsekvensen i sig: när varje sida har sitt eget sidhuvud
och sin egen kortstil läser helheten som något hopsatt, inte designat.

## 2. De tio viktigaste problemen

1. **Dashboarden säger samma sak tre gånger.** `NastaSteg` ("9 ansökningar
   utan svar"), `SoktaTjansterStatusRad` (samma uppföljningssiffra) och
   `DashboardStatusRow` (11 ansökningar) upprepar varandra i tillstånd C. Tolv
   sektioner totalt. Kostar tydlighet och gör den primära handlingen osynlig.
2. **Prenumerationssidan är den gamla designen rakt av.** Röd-rosa
   gradienthero med krona, `PremiumFeaturesGrid` med sex lucide-ikoner i
   gradientrutor, orange toppstreck, em-dash i copyn. Detta är sidan där vi
   ber om pengar, alltså den sämsta platsen att se billig ut på. Förtroende
   och konvertering.
3. **"Du har låst upp 4 funktioner" med nav-och-ekrar-diagram**
   (`CvUnlocksFlow.tsx`). Ett SVG-diagram med pulserande nav som säger noll om
   vad användaren ska göra. Ren dekoration som kostar laddtid och skärmyta.
4. **CV-sidans hero** (`CvHeroBanner.tsx`) är ännu en röd-rosa gradient med
   "Premium ∞". Oändlighetstecknet är en symbol, inte en siffra, och bryter
   mot regeln att alltid säga gränsen i klartext.
5. **Testområdet är femton nästan identiska kataloger** med
   copy-paste-resultatsidor på 670 rader styck. 62 `rounded-3xl` och 113
   skuggor bara här. Varje framtida designändring måste göras femton gånger,
   vilket garanterar att de glider isär igen.
6. **Inget gemensamt sidhuvud.** `mina-brev` och `sokta-tjanster` har
   `text-2xl font-bold text-slate-900`, `jobbmatchning` en variant utan
   `leading-tight`, och `cv-mallar`, `rewards` och `bli-upptackt` saknar `h1`
   helt. Det sista är ett tillgänglighetsfel, inte bara ett stilfel.
7. **266 em-dash i copy** över dashboard och komponenter, trots att regeln är
   noll. Det är den mest igenkännliga AI-signaturen vi har och underminerar
   "seriös" direkt.
8. **`slate-` överallt i stället för `neutral-`.** Över 1800 träffar. Slate är
   blåtonad grå, neutral är varm. Mot orange accent ger slate ett kallt,
   generiskt intryck som slåss med varumärkesfärgen.
9. **Skuggor på stillastående kort** (68 i profil, 113 i tester). Skugga ska
   betyda "detta svävar". När allt har skugga betyder den ingenting och sidan
   ser suddig ut i stället för skiktad.
10. **Gradientknappar som primär handling** på gamla sidor konkurrerar med
    dashboardens enda orange knapp. Regeln om en fylld orange yta per skärm är
    bruten på i stort sett varje verktygssida.

## 3. Förslag

### Görs om från grunden

**Dashboarden i tillstånd C.** Från tolv sektioner till fem. Ordning: en
statusrad, en handling, innehåll, sedan resten. Allt som upprepar en siffra
någon annan sektion redan visar tas bort.

```
Desktop, tillstand C
+--------------------------------------------------------------+
| Hej Christian                                                |
| 92 brev   11 ansokningar   3 svar   1 d streak  [Nytt brev]  |
+--------------------------------------------------------------+
| 9 ansokningar har varit tysta i over tva veckor.  Folj upp   |
+--------------------------------------------------------------+
| Senaste aktivitet                                            |
|  . Brev till Volvo skapat            i gar                   |
|  . CV-analys klar, 72 poang          2 dagar sedan           |
+--------------------------------------------------------------+
| Snabbatgarder   (tre kort, inte sex)                         |
+--------------------------------------------------------------+
```

Mobil: samma ordning, statusraden blir tva rader, knappen full bredd.

**Prenumerationssidan och CV-sidan.** Båda heros ersätts med samma sidhuvud
som alla andra sidor. `PremiumFeaturesGrid` och `CvUnlocksFlow` tas bort och
ersätts av jämförelsetabellen respektive CV-listan. Ingen sida behöver
förklara vad Premium är på sex kort när tabellen gör det bättre.

**Testområdet.** Femton kataloger blir en dynamisk route med testtypen som
parameter, och en delad resultatkomponent. Det är lika mycket
informationsdesign som teknik: samma test ska se likadant ut oavsett nivå.

### Sidmall som alla dashboardsidor följer

```
+--------------------------------------------------------------+
| SIDHUVUD                                                     |
|   h1  text-2xl font-semibold tracking-tight text-neutral-900 |
|   en rad text-sm text-neutral-600 som sager vad sidan gor    |
|                                    [ Primar handling h-11 ]  |
+--------------------------------------------------------------+
| STATUS  (valfri, en rad, aldrig ett kort)                    |
+--------------------------------------------------------------+
| INNEHALL                                                     |
|   kort: bg-white rounded-xl border border-neutral-200        |
|   ingen skugga, ingen gradient, ingen toppstrip              |
+--------------------------------------------------------------+
```

Regler för mallen:

- Exakt ett `h1` per sida, alltid synligt, aldrig ersatt av en gradienthero.
- Exakt en fylld orange yta per skärm, och det är den primära handlingen.
- Sidhuvudets underrad säger vad sidan gör, inte vad den heter.
- Kortpadding `p-4` mobil, `p-5` desktop. Sektionsavstånd `space-y-6`.
- Tomt tillstånd: illustration 96 px, rubrik, en mening, en knapp. Aldrig en
  tom yta med bara text, och aldrig ett skelett som ligger kvar.

```
TOMT TILLSTAND
+--------------------------------------------------------------+
|                    [ illustration 96 ]                       |
|              Inga brev an                                    |
|     Klistra in en annons sa skriver vi utkastet.             |
|                 [ Skapa ditt forsta brev ]                   |
+--------------------------------------------------------------+
```

**Illustrationer.** En per vy, aldrig två. Storlek efter roll: 24 px inline i
en rad, 48 px bredvid en rubrik i ett kort, 96 px i tomt tillstånd, 240 px
bara i hero i tillstånd A. Alla enligt `primitives.tsx` med `currentColor` och
max en gradient på accentelementet. Illustrationen ska visa vad funktionen gör,
aldrig vara ett mönster eller en bakgrundscirkel.

### Justeras

- `slate-` byts systematiskt mot `neutral-`, `font-bold` mot `font-semibold`,
  `rounded-3xl` och `rounded-2xl` mot `rounded-xl`. Detta är ett sök och
  ersätt-pass per katalog, inte en omskrivning.
- Alla 266 em-dash byts mot komma eller punkt.
- Skuggor tas bort från stillastående kort, behålls på dropdown, modal, sheet
  och sticky mobil-CTA.

### Tas bort helt

- `CvUnlocksFlow` (nav-och-ekrar-diagrammet).
- `PremiumFeaturesGrid` (sex kort som upprepar jämförelsetabellen).
- Prick-patterns och `DotPatternBg` i alla varianter.
- "Premium ∞" som statusvisning.
- Dubblerade ansökningssiffror: behåll statusraden, ta bort
  `SoktaTjansterStatusRad` och låt `NastaSteg` bara visa uppföljningen.

## 4. Tre saker jag inte kompromissar om

**En fylld orange yta per skärm.** Så fort två saker skriker lika högt slutar
användaren höra någon av dem. Det här är den enda regeln som ensam avgör om
gränssnittet känns dyrt eller billigt, och den är gratis att följa.

**Inga em-dash och inget "obegränsat" till någon som har en gräns.** Det
första är en AI-signatur som kostar förtroende hos en svensk publik, det andra
är faktafel i säljande text. Båda är enkla att undvika och dyra att ha kvar.

**Varje sida har ett synligt `h1` enligt sidmallen.** Tre sidor saknar det
idag. Det är samtidigt tillgänglighet, orientering och det som gör att
produkten läser som en produkt och inte som femton fristående verktyg.

## 5. Tre saker jag gärna ger upp

**Att ta bort belöningar och XP helt.** Min instinkt är att det drar mot
lekfullt när vi vill verka seriösa, men om någon visar retentiondata som säger
att streaken driver återbesök bland aktiva så väger det tyngre än mitt
stilargument. Då vill jag i stället flytta det till en egen sida och ut ur
dashboarden.

**Sidhuvudets primära handling till höger.** Jag föreslår knappen i sidhuvudet,
men mobilexperten kan ha rätt i att den hör hemma längst ner som sticky på
mobil. Placeringen är förhandlingsbar så länge det bara finns en.

**Att slå ihop de femton testkatalogerna till en route.** Det är rätt ur
underhållsperspektiv, men om någon visar att testtyperna kommer att divergera
kraftigt i innehåll så är delad layout plus separata innehållsfiler en
rimligare väg. Kravet jag håller fast vid är att de ser identiska ut, inte hur
det löses tekniskt.
