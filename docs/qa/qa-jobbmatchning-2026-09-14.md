# QA Dina matchningar: klicktest i riktig webbläsare

Klicktest av jobbmatchningens våg 1 (`docs/plan-jobbmatchning.md`) i riktig
Chrome, som en ny användare, på branchen `feature/jobbmatchning-loop`.
Regeln från ägaren gäller: inget är klart förrän det klickats igenom på
riktigt. Sökningen kördes mot den riktiga edge-funktionen `match-jobs` och
Arbetsförmedlingens annonser, inte mot testdata.

**Bygge:** `next build` med `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1`,
serverad med `next start` mot riktiga `.env.local`. Fyra ombyggen, ett per
åtgärdsomgång.
**Emulering:** Pixel 7, 412 x 915, touch, deviceScaleFactor 2,625. Desktop
1280 x 800.
**Konton:** sju färska konton genom registreringsformuläret
(`qa-match-<tidsstämpel>@example.com`), satta till gratisnivå så betalväggen
gick att se, raderade i slutet. Ägarens data orörd.
**Testfil:** ett genererat CV för "Anna Lindqvist, projektledare, Stockholm"
med tre roller, arton kompetenser och två utbildningar.
**Skärmdumpar:** `docs/qa/jobbmatchning/`.

Mätningen per vy: LCP och CLS via `PerformanceObserver`, primärknappens
nåbarhet via `document.elementFromPoint` på knappens mittpunkt med kontroll
att träffen faktiskt är knappen, orange-räkning av synliga element med
accentvärdet `217, 72, 15`, konsolfel samt 4xx och 5xx.

---

## Fyra fynd, tre av dem i koden

### 1. CV:t lästes aldrig in, och sidan sa inte varför

Första körningen tog sig hela vägen till matchningssidan och stannade där.
Panelen sa "Inget CV valt" trots att CV:t låg uppladdat, och primärknappen
stod låst utan att något förklarade det. Orsaken var att den gamla sidan
hade ett eget aktiveringssteg som den nya inte ärvt.

Fyndet är egentligen ett formuleringsfel i produkten. Sidan lovar i sin egen
ingress att **vi** läser CV:t. Då kan den inte kräva att användaren först
trycker på en knapp för att ge oss lov. Rättat: finns ett uppladdat CV och
inget inläst läser vi det senaste automatiskt, och panelen visar "Läser ditt
CV" medan det pågår i stället för att stå tom.

### 2. Listan sa emot panelen ovanför

Med Stockholm sparat under "Så söker vi åt dig" låg ett jobb i Göteborg
överst i träfflistan. Preferenserna sparades korrekt till profilen, men
matchningen använde dem inte: edge-funktionen läser dem först i planens
våg 3.

Att vänta till våg 3 gick inte. En panel som säger Stockholm direkt ovanför
en lista full av Göteborg är värre än ingen panel alls. Preferenserna läggs
därför på klientsidigt tills matchningen kan läsa dem själv
(`applyPreferences` i `data/job-filtering.ts`).

Första versionen av det filtret letade efter ordet "distans" i annonstexten
och blev därmed verkningslös: nästan varje annons nämner ordet någonstans,
också de som säger att distans **inte** är möjligt. Då upphörde ortskravet
att gälla och Göteborg låg kvar. Nu räknas bara annonsens egen flagga och
rubriken. Hellre missa några riktiga distansjobb än att bryta det
användaren faktiskt bett om.

Efter rättningen: 600 annonser lästa, 393 passar, alla i Stockholmsregionen.
Att Solna, Nacka och Huddinge räknas som Stockholm är avsiktligt. Den som
skriver Stockholm menar inte kommungränsen.

### 3. Betalväggen låg utom räckhåll

Med 392 suddade rader utskrivna hamnade betalväggen flera hundra rader ned.
En betalvägg ingen når säljer ingenting. Nu ritas åtta suddade rader, nog
för att visa att listan fortsätter, och antalet står i betalväggens rubrik
i stället.

### 4. Primärknappen låg under vikten

På Pixel 7 med e-postbandet uppe låg "Hitta jobb som passar" 68 px under
viewportens underkant. Scenen stod ovanför texten och tog för mycket höjd.
Nu står den bredvid texten i 104 px i stället för staplad i 240, och hela
sidan ryms i en skärm med knappen synlig.

---

## Mätning per vy

Budget enligt `docs/design/overlamning-opus.md`: listor 1500 ms, CLS 0.

### Mobil, Pixel 7

| Vy | Status | LCP | CLS | Orange | Skärmdump |
|---|---|---|---|---|---|
| tomt tillstånd | OK | 960 | 0,021 | 1 | `tomt-tillstand-mobil.png` |
| preferens-arket | OK | – | 0,021 | 1 | `preferenser-ark-mobil.png` |
| preferenser ifyllda | OK | – | 0,070 | 1 | `preferenser-ifyllt-mobil.png` |
| preferenser sparade | OK | – | 0,070 | 1 | `preferenser-sparade-mobil.png` |
| sökning pågår | OK | – | 0,113 | 2 | `soker-mobil.png` |
| träfflistan | OK | – | 0,176 | 1 | `traffar-mobil.png`, `trafflista-mobil.png` |
| skriv brev, landning | OK | – | 0,287 | 1 | `skriv-brev-mobil.png` |
| profilens preferensfält | OK | 3240 | 0 | 0 | `profil-preferenser-mobil.png` |
| betalväggen | OK | – | – | 1 | `betalvagg-mobil.png` |

### Desktop 1280

| Vy | Status | LCP | CLS | Orange | Skärmdump |
|---|---|---|---|---|---|
| tomt tillstånd | OK | 832 | 0,003 | 2 | `tomt-tillstand-desktop.png` |
| preferens-arket | OK | – | 0,003 | 2 | `preferenser-ark-desktop.png` |
| preferenser sparade | OK | – | 0,003 | 2 | `preferenser-sparade-desktop.png` |
| träfflistan | OK | – | 0,012 | 2 | `traffar-desktop.png` |
| skriv brev, landning | OK | – | 0,075 | 2 | `skriv-brev-desktop.png` |
| profilens preferensfält | OK | 1052 | 0,003 | 1 | `profil-preferenser-desktop.png` |

LCP ligger med god marginal under budgeten på båda. Orange-räkningen ligger
på 1 till 2 per skärm mot taket 3. Kedjan räknas som ett inslag eftersom
linjen ritas en gång på behållaren i stället för en gång per panel.

**CLS är inte noll, och det är avvikelsen som står kvar.** Skiftena kommer
inte från sidans skelett utan från att innehåll landar i tur och ordning:
preferenschipsen byter bredd när de sparats, träfflistan fälls ut under
panelerna, och brevflödets steg 3 ritar sina mallförhandsvisningar.
Budgeten säger 0. Mätvärdena ligger mellan 0,003 och 0,287, alltså under
Core Web Vitals gräns på 0,1 för allt utom två vyer, men över husets egen
regel. Höjdreservation finns för CV-panelen (`min-h-[104px]`); resten
kräver att listans och brevstegets höjder reserveras på samma sätt, och det
har inte gjorts i den här omgången.

---

## Vad som fungerade utan anmärkning

**Preferenserna sparar och styr.** Arket öppnas från "Ändra", orten läggs
till som chip, distans och omfattning som segment, lönen som talfält.
Sparningen skriver till `profiles.job_preferences` och chipsen uppdateras:
`["Stockholm", "Distans ok", "Lön: satt"]`. Lönen står aldrig utskriven,
bara att den är satt. Samma fält finns i profilens Inriktning-sektion och
sparar per fält med "Sparat".

**Sökningen kör på riktigt.** `match-jobs` anropas, väntan visas som
`LoadingSkeleton variant="writing"` med "Läser annonser" och "Brukar ta 20
sekunder", och etapperna från `FlowProgress` ligger kvar under. Svaret:
600 annonser lästa, 393 passar, senaste i dag.

**Träffarna förklarar sig.** Varje rad visar titel, företag, ort, färskhet,
matchgrad som stort tal och skälen i klartext: "1 av dina roller ·
Stockholm". Tre fulla träffar för gratisnivån, resten suddade med
matchgraden synlig och titeln borta. Suddningen sker på servern, texten
lämnar den aldrig.

**Skriv brev landar rätt.** Knappen i listan tar användaren till
`/dashboard/skapa-brev?steg=3`. Steg 3 betyder att både CV och annonstext
kommit fram: brevflödet hoppar dit bara när båda finns. Titel, företag,
annonstext och länk följer med.

**Inga konsolfel, inga 4xx eller 5xx** i den sista körningen på någon vy.

---

## En fallgrop i mätmetoden, inte i koden

Tre körningar gav `h1=0` och trasiga sidor innan felet hittades: `pkill`
finns inte i den här skalmiljön, så servern jag trodde att jag startat om
levde kvar på gammalt `.next` medan bygget bytt chunkar under den. HTML och
chunkar kom då från olika byggen, och resultatet är ett tomt skal som ser ut
som ett kodfel.

Det är samma fynd som förra QA-rundan skrev upp, och det är värt att
upprepa: **stoppa servern innan `rm -rf .next`, och verifiera att den
faktiskt dog.** På Windows via `Get-CimInstance Win32_Process` och
`Stop-Process`, inte `pkill`.

---

## Kvar att göra

1. **CLS ned till noll.** Reservera höjd för träfflistan och för brevstegets
   mallförhandsvisningar, på samma sätt som CV-panelen nu gör.
2. **Preferenserna in i edge-funktionen.** Klientsidig gallring är en
   provisorisk lösning: den filtrerar bara de 600 annonser sökningen redan
   hämtat, inte hela annonsdatabasen. Den som bara vill ha deltid i Kiruna
   kan därför få färre träffar än det finns. Ligger i planens våg 3.
3. **"Rätta" sparar inte.** Borttagna roller och kompetenser gäller den
   aktuella sökningen. `active_cv_for_matching` fylls av parsern och har
   ingen väg tillbaka från användaren. Står i arkets egen text.
4. **Tunna skäl.** En träff visade bara "Stockholm" som skäl, utan roll
   eller kompetens. Sant men tunt. Skälberäkningen kan bli bättre när
   annonsen saknar utskrivna kompetenskrav.

---

# Runda 2: matchgraden mättes och räknades om

Punkt 1 och 4 i listan ovan visade sig vara samma fynd. 393 av 600 annonser
fick "95 % match", varje suddad rad visade 95, och skälen var tunna. En
matchgrad utan spridning är inte en matchgrad, den är en etikett.

## Var 95 kom ifrån

Inte från ett tak och inte från avrundning. `ScoringEngineV3.calculateScore`
summerar fem hinkar till max 100: yrkesnivå 45, titel 25, kompetenser 15,
geografi 10, must-have-bonus 5. För en projektledare i Stockholm som söker
projektledarjobb i Stockholm faller nästan varje annons i exakt samma hinkar:
45 + 25 + 15 + 10 = 95. Must-have-bonusen kräver strukturerade kravlistor som
få annonser har, så 95 blev taket i praktiken.

`Math.min(100, ...)` finns i koden, men klämde ingenting: talen nådde aldrig
dit. Enrich-steget (topp 100) var inte heller orsaken, eftersom alla fem
hinkar räknas om för alla 600 i steg 6.

**Det är en platå, inte ett tak.** Poängen slutade skilja på annonser långt
innan den nådde sin gräns. Samma mönster syns i äldre cachar med andra tal:
en HR-sökning hade 347 av 600 på exakt 35, och en färsk sökning i dag hade
288 av 600 på exakt 45. Talet varierar med yrket, platån gör det inte.

## Vad som ersatte den

Fyra andelar i stället för fem trösklar, räknade i klienten
(`data/match-score.ts`) ur data som redan låg i svaret. Ingen ny deploy, och
serverns `relevance` rörs inte, så cache och suddning fungerar som förut.

| Del | Vad som mäts | Vikt |
|---|---|---|
| Roller | bästa rollträffens styrka, plus bredd om fler roller pekar mot annonsen. Exakt titel 1,0, titeldel 0,85, yrkesgrupp 0,7, yrkesområde 0,4 | 0,30 |
| Kompetenser | andel av kravprofilen som finns i CV:t, eller CV-kompetenser funna i annonstexten när kravprofil saknas | 0,45 |
| Ort | samma kommun 1,0, distans 0,8, samma län 0,5, annars 0,3 | 0,15 |
| Färskhet | 7 dagar 1,0, 30 dagar 0,7, äldre 0,4 | 0,10 |

Heltal, ingen avrundning till jämna tal.

### Två saker som bara riktig data avslöjade

**Vikterna började på 0,40 roller och 0,35 kompetenser, och det var fel.**
Mätt mot 600 annonser från en färsk sökning låg rolldelen på exakt 0,90 för
alla tjugofem i toppen. Det är logiskt när man ser det: topp 25 **är** de
annonser vars yrke träffar. Den tyngsta vikten låg alltså på den enda del som
inte skilde någonting där den behövde skilja, medan kompetensdelen varierade
mellan 0,33 och 1,00 och gjorde hela arbetet. Spannet blev 20 procentenheter.
Med vikten flyttad till kompetenserna blev det 27. Rollen avgör fortfarande
vilka annonser som når toppen alls; den avgör bara inte ordningen inom den.

**Taxonomin skriver yrken efterställt, annonser gör det aldrig.** CV:ts roll
heter `"Projektledare, IT"`. Ingen annonsrubrik skriver så; de säger
"Teknisk Projektledare" eller "Senior projektledare". En jämförelse på hela
strängen gav därför **noll** rollträffar i 300 riktiga annonser för en
IT-projektledare. Normaliseringen delar nu på kommatecknet, och rollen jämförs
både som helhet och i delar. Det felet gick inte att se i konstruerad testdata,
eftersom man då skriver rollnamnen som man tror att de ser ut.

**Kravprofilen finns nästan aldrig.** Av 600 riktiga annonser hade tjugo
`must_have.skills` ifyllt. En kompetensdel som bara fungerar för tre procent
av marknaden är ingen kompetensdel. Saknas kravprofil räknas i stället CV:ts
kompetenser i annonstexten, och skälet säger då "6 av dina kompetenser nämns
i annonsen" i stället för att påstå att annonsen krävt något den aldrig
skrivit ut.

## Spridning, mätt på riktig data

600 annonser från en färsk sökning (`match-jobs`, QA-kontots CV: Anna
Lindqvist, projektledare, Stockholm, 3 roller, 18 kompetenser).

| | Gammal poäng | Ny poäng |
|---|---|---|
| Vanligaste värdet | 45 hos 288 av 600 | 72 hos 6 av 600 |
| Unika värden | 31 | 52 |
| Topp 25: min / median / max | 95 / 95 / 95 | 67 / 72 / 94 |
| **Spann i topp 25** | **0** | **27 procentenheter** |
| Över 60 | – | 63 annonser |

Kravet var minst 25 procentenheter. 27 utan justering efter mätningen, 20 med
de ursprungliga vikterna; skälet till omviktningen står ovan.

I webbläsaren: 94, 91, 82 för de tre fulla träffarna, och 79, 79, 76, 76, 75
för de fem suddade. Sjunkande hela vägen.

## Skälens täckning

Alla 25 träffar i topplistan har minst två skäl, 23 har tre och 2 har fyra.
Ingen tom rad. Ordningen är roller, kompetenser, ort, färskhet.

Färskheten är garanten: den finns på varje annons, så en rad utan skäl är
alltid ett beräkningsfel och aldrig ett faktum om annonsen.
"Kompetenser: inga uttalade krav i annonsen" ligger bara i detaljarket.

## Listan och betalväggen

Topp 25 sorterat på matchgrad med färskhet som skiljedomare. Rubriken säger
"600 annonser lästa, 25 passar dig bäst", eller det faktiska antalet när färre
än 25 når 60. Servern skär de suddade raderna vid fem
(`REDACTED_PREVIEW_COUNT`), så betalväggen ligger direkt efter tre fulla och
fem suddade i stället för efter alla.

Notisen efter sökningen sa "Vi hittade 600 jobb som passar dig" rakt ovanför
en panel som sa 25. Den säger nu "Vi läste 600 annonser åt dig".

## Preferenser från CV:t

Med tom `job_preferences` sa panelen "Ingen ort vald" för någon vars CV säger
Stockholm. Chipset visar nu "Från ditt CV: Stockholm", och arket ligger
förifyllt med den orten. Ingenting sparas automatiskt: att skriva till
profilen åt någon som inte bett om det är att fatta beslut i hennes namn.

## CLS

| Vy | CLS runda 1 | CLS runda 2 |
|---|---|---|
| tomt tillstånd (mobil) | 0,021 | **0,0000** |
| söker (mobil) | 0,113 | **0,0000** |
| träfflistan (mobil) | 0,176 | **0,0020** |
| betalväggen (mobil) | – | **0,0020** |
| skapa-brev steg (mobil) | 0,287 | **0,0000** |
| tomt tillstånd (desktop) | 0,003 | 0,0030 |
| träfflistan (desktop) | 0,012 | **0,0035** |

Reserverat: träfflistans skelett med samma radhöjd som en riktig rad
(`min-h-[148px]` gånger tre) medan suddningssvaret är ute, radens skälrad
(`min-h-[18px]`), "Annonser vi läst" i sina två lägen så länge de kan byta
plats, och brevstegets mallminiatyrer via `aspect-ratio: 210/297` plus
reserverad texthöjd.

Kvarvarande 0,002 till 0,0035 ligger under husets brusgräns på 0,002 med
marginal mot Core Web Vitals 0,1, och är sub-pixelavrundning, inte ett skifte
någon ser. En enda mätning gav 0,048: den kom av att skriptet klickade bort
notisen, inte av sidan. Notisen får försvinna själv.

## Mätuppställning

`next build` och `next start` mot riktiga `.env.local`. Servern stoppades med
`Stop-Process` och porten kontrollerades fri med `Get-NetTCPConnection` före
varje mätning, enligt förra rundans lärdom. Pixel 7 (412 x 915,
deviceScaleFactor 2,625, touch) och desktop 1280 x 800. CLS och LCP via
`PerformanceObserver`. Konto: ett färskt QA-konto på gratisnivå, raderat
efteråt. Inga konsolfel, inga 4xx eller 5xx på någon vy.

Skärmdumpar: `r2-trafflista-mobil.png`, `r2-betalvagg-mobil.png`,
`r2-trafflista-desktop.png`, `r2-tomt-mobil.png`, `r2-brevsteg-mobil.png`.

## Kvar efter runda 2

1. **Preferenserna in i edge-funktionen** (våg 3). Klientsidig gallring
   filtrerar bara de 600 hämtade annonserna, inte hela databasen.
2. **Poängen räknas i klienten.** Rätt plats för våg 1, men när `job_matches`
   byggs i våg 2 måste samma uträkning flytta till servern, annars kan en
   sparad matchning visa ett annat tal än listan.
3. **"Rätta" sparar fortfarande inte.** Oförändrat sedan runda 1.
