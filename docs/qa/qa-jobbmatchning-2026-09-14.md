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
