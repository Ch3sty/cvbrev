# Poängmodellen i CV-analysen, version 1

Läsbarhetspoängen (0 till 100) säger hur väl ett rekryteringssystem och en rekryterare kan läsa ett CV. Från och med version 1 är den en ren funktion av CV:ts innehåll, skriven i kod: `src/lib/cv/poang/modell.ts`. AI:n skriver förslagen (texterna), aldrig talen.

Gäller från 2026-11-21. Versionen står i `POANG_VERSION` och följer med varje uträknat resultat som `poangVersion`, så att tal från olika versioner aldrig blandas.

## Varför

Förut bad analysen modellen själv skriva `atsFriendliness.score` (0 till 100) och `atsImpact` per förslag. Samma CV kunde få 55 ena gången och 65 nästa, utan att något ändrats, och ett förslag kunde lova +6 som inte stämde. När ett förbättrat CV sparades skrevs analysens poäng om till potentialen i stället för att CV:t poängsattes.

## Principer

1. **Samma CV ger alltid samma poäng.** Poängen räknas ur lagrad data: `cv_texts.structured_data` (och `cv_text` för kontaktuppgifter i det äldre roles-formatet). Saknar CV:t struktur läses det in en gång med samma inläsning som uppladdningen och sparas. Inget i modellen beror på slump, datum, klockslag eller AI-svar.
2. **Varje delpoäng är något man kan peka på i CV:t.** Sju kategorier, maxpoäng som summerar till 100.
3. **Fler ord ger aldrig fler poäng.** För lång profil, för många punkter, för många kompetenser, överlånga punkter och för långt CV drar ner.
4. **Plus som stämmer.** Ett förslags plus är `poäng(CV med förslaget infört) − poäng(CV i dag)`. Potentialen är poängen med alla förslag införda, inte summan av plusen.
5. **Löftet håller hela vägen.** Analysflödet sparar exakt det CV som potentialen räknades på (`byggForbattratCv`), så det sparade CV:t får den poäng som utlovades. Redigerar hon en text räknas poängen på det som sparas.

## Kategorierna

Poängen per kategori avrundas till heltal och summeras, så att uppdelningen alltid går jämnt upp i totalen. Delpoängen inom en kategori kan vara bråktal (en andel av rollerna, till exempel).

### 1. Kontaktuppgifter, 10

| Kontroll | Poäng | Regel |
|---|---|---|
| Namn | 2 | minst två tecken |
| E-postadress | 3 | ser ut som en adress |
| Telefonnummer | 3 | minst sju siffror |
| Ort eller adress | 2 | något står |

I roles-formatet (inläsningens format, saknar kontaktfält) läses uppgifterna lokalt ur CV-texten med samma regex som maskeringen (`src/lib/privacy/extractContact.ts`).

### 2. Personbeskrivning, 15

| Kontroll | Poäng | Regel |
|---|---|---|
| Det finns en personbeskrivning | 5 | minst 15 ord ger 5, 5 till 14 ord ger 2 |
| Lagom lång | 4 | 35 till 110 ord ger 4, 20 till 34 eller 111 till 150 ord ger 2, annars 0 |
| Säger vilken roll du har eller söker | 3 | ett ord (minst fem bokstäver) ur titeln, målrollen eller någon av de tre första rolltitlarna står i texten |
| Något konkret | 3 | ett tal som inte är ett årtal, eller ett räkneord (två, tre, tio, hundra, procent och så vidare) |

### 3. Erfarenhet, 35

Räknas på de fem första rollerna i CV:ts ordning. Äldre roller väger inte in (förslag för dem kan fortfarande föras in men ger inget plus).

Ett *påstående* är en rad, punkt eller mening med minst tre ord. Fyra meningar i ett stycke är fyra påståenden, precis som fyra punkter, så formatet i inläsningen spelar ingen roll.

| Kontroll | Poäng | Regel |
|---|---|---|
| Minst en roll | 5 | |
| Titel, arbetsgivare och period | 8 | 8 × andelen roller med alla tre, där perioden går att tolka |
| Beskriver vad du gjorde | 6 | 6 × andelen roller med minst ett påstående |
| Lagom många punkter | 4 | per roll: 2 till 8 påståenden ger 1, ett eller 9 till 12 ger 0,5, annars 0; 4 × medelvärdet |
| Resultat i siffror | 6 | 6 × andelen roller med minst ett påstående med tal (se ovan) |
| Börjar med vad du gjorde | 6 | per roll: andelen påståenden som börjar med ett handlingsverb, delat med 0,5 och taket 1; 6 × medelvärdet |

Handlingsverb: en lista med vanliga svenska verb i presens, preteritum och supinum (ledde, ansvarar, byggt) plus ord på -ade, -erar och -erat. Ett inledande "jag" hoppas över. "Ansvarig för" är inget verb.

### 4. Kompetenser, 12

Kompetenserna delas på vanliga avgränsare och dubbletter tas bort (skiftlägesokänsligt), samma regel som analysflödet städar listan med när det sparar.

| Kontroll | Poäng | Regel |
|---|---|---|
| Det finns kompetenser | 3 | minst en |
| Lagom många | 6 | 6 till 20 ger 6, 3 till 5 ger 3, 1 till 2 ger 1, 21 till 30 ger 4, fler än 30 ger 2 |
| Korta, sökbara termer | 3 | minst 90 % har högst fyra ord ger 3, annars 3 × andelen |

### 5. Utbildning, 8

| Kontroll | Poäng | Regel |
|---|---|---|
| Minst en utbildning | 4 | namn eller skola står |
| Namn och skola | 2 | 2 × andelen med båda |
| År eller period | 2 | 2 × andelen med tolkbart år |

### 6. Språk, 5

Läget läses med `sprakLage` (`src/lib/cv/sprak.ts`).

| Kontroll | Poäng | Regel |
|---|---|---|
| Språk står med | 3 | läget är "finns" |
| Nivå på varje språk | 2 | alla språk har en nivå som går att tolka |

Saknar roles-formatet språknyckeln (CV inlästa före 2026-11-21) letar vi efter ett språkavsnitt i texten: en rad som börjar med "Språk", "Språkkunskaper" eller "Languages" och kända språknamn på raderna under. "Svenska kunder" i en rollbeskrivning blir aldrig ett språk.

### 7. Datum, ordning och längd, 15

| Kontroll | Poäng | Regel |
|---|---|---|
| Alla perioder går att tolka | 4 | 4 × andelen perioder (roller och utbildningar) med startår och ett slut som är ett år eller "pågående" |
| Samma datumformat | 2 | alla tolkbara perioder bara år, eller alla med månad |
| Senaste rollen först | 3 | rollerna med tolkbar period står i fallande ordning (pågående först) |
| Lagom långt | 3 | 200 till 1100 ord ger 3, 120 till 199 eller 1101 till 1500 ord ger 1,5 |
| Inga överlånga punkter | 3 | minst 90 % av påståendena har högst 35 ord ger 3, annars 3 × andelen |

Orden räknas i personbeskrivning, roller, utbildningar, kompetenser, språk, projekt och certifikat. Kontaktuppgifterna räknas inte.

Ett tomt slut betyder pågående (så sparar CV-formatet nuvarande jobb). Poängen jämför aldrig med dagens datum.

## Förklaringen till användaren

> Poängen räknas ur det som står i ditt CV: kontaktuppgifter, personbeskrivning, roller, kompetenser, utbildning, språk, datum och längd. Varje del har en högsta poäng och tillsammans blir det 100. Samma CV ger alltid samma poäng, och plus på ett förslag är exakt vad poängen blir med förslaget infört.

## Förslagen

| Förslag | Hur det förs in | Plus |
|---|---|---|
| Personbeskrivning | ersätter `summary` med förslagets text | ja |
| Roll | ersätter rollens `description` med förslagets rader (en rad per punkt) | ja |
| Kompetens | läggs i "Kompletterande färdigheter" om den inte redan står | ja |
| Allmänt råd | förs inte in | aldrig |

### Förslag hittar aldrig på fakta

Kontrollen "Resultat i siffror" får aldrig bli ett skäl att lägga in tal som inte står i CV:t.

1. Ett förslag får bara använda tal, resultat, arbetsgivare, titlar och kompetenser som finns i användarens CV. Det står i prompterna (edge-funktionen `analyze-cv-background`).
2. Saknar en roll siffror skriver förslaget platshållaren `[antal]` där hennes egen siffra ska in, till exempel "Besvarade [antal] kundärenden per dag".
3. Poängmodellen räknar aldrig en platshållare som ett tal (`harTal` tar bort allt inom hakparentes först). Ett förslag med `[antal]` ger alltså inget plus för siffror förrän hon fyllt i sin siffra, och då räknas det hon skrivit.
4. Koden kontrollerar efter genereringen (`poangsattAnalys`, även för sparade analyser): varje tal i ett roll- eller profilförslag som inte står någonstans i CV:t (kontaktuppgifterna undantagna) byts mot `[antal]`. Förslaget får `fyllI: true` och `ersattaTal`, och korten i väljsteget skriver "Fyll i din egen siffra där det står [antal]".
5. Kompetensförslag står inte i CV:t och är förslag att lägga till om de stämmer. Korten säger "Föreslås utifrån" och "Lägg bara till den om den stämmer för dig", aldrig att hon har kompetensen.

Rollförslag matchas mot CV:ts roller: först rollens plats (`experienceIndex`, från analysversionen som arbetar på lagrad struktur) om titeln stämmer, sedan titel och arbetsgivare, sedan bara titel. Ett förslag som inte går att matcha tas bort ur resultatet. Förslag sorteras efter verkligt plus.

Ett förslag kan ge noll eller till och med sänka poängen (en omskrivning med elva punkter). Då visas inget plus, men förslaget finns kvar. Potentialen räknar med det som det är.

## Var poängen räknas

| Yta | Hur |
|---|---|
| Analysjobbets svar, `GET /api/cv/jobs/[jobId]` | `poangsattAnalys(result, cv-raden)`, sedan gratisfiltreringen, sedan `medSammanfattning` så att potentialen bara räknar förslag hon ser |
| Återupptagen analys, `/dashboard/cv-analys?job=` | `poangsattAnalys` med CV-raden ur listan |
| Väljsteget och granskningen | `poangMedVal` och `byggForbattratCv` på klienten, samma funktion |
| Sparat förbättrat CV, `POST /api/cv/save-improved-analysis` | servern poängsätter det sparade CV:t och versionsmärker raden |
| Mina CV | `poangForRad` per analyserat CV, `poangsattAnalys` för fynden |
| Hemskärmens bricka, välkomstskärmen, Kom igång-mejlen | `senasteAnalysPoang` och `poangForAnalyser` (`src/lib/cv/poang/server.ts`) |
| Snabbpoängen, inloggad | `poangForRad` på CV:ts sparade struktur (struktureras en gång om den saknas) |
| Snabbpoängen, publik | `poangForRad` på filen strukturerad med uppladdningens inläsning (maskerad text), ingenting sparas |

## Gamla analyser

Ingen migrering. Sparade analyser har AI:ns tal, men de läses aldrig: alla ytor ovan räknar poängen ur CV-raden vid läsning och skriver över `atsFriendliness.score`, `atsImpact` och `poang` i det som skickas ut. Har CV-raden ingen struktur används analysens sparade `structuredCV` (också lagrad data). Rader som skrivs från och med nu (förbättrat CV) får `poangVersion`.

Funktionen `dashboard_summering()` i databasen returnerar fortfarande det sparade talet som `senaste_poang`; det används inte längre.

## Kalibrering

Fixturerna ligger i `src/lib/cv/poang/__tests__/fixturer.ts` (inga användares CV). "AI förr" är det påhittade talet i fixturens analys, för att visa åt vilket håll det rör sig.

| CV | AI förr | I dag | Med alla förslag | Kontakt | Profil | Erfarenhet | Kompetenser | Utbildning | Språk | Format |
|---|---|---|---|---|---|---|---|---|---|---|
| Tunt (en roll utan beskrivning) | 55 | 36 | 61 | 5 | 0 | 13 (+22) | 9 | 0 | 0 | 9 (+3) |
| Normalt | 62 | 69 | 95 | 10 | 7 (+8) | 22 (+13) | 9 (+3) | 8 | 3 | 10 (+2) |
| Starkt (Erik Lindberg) | 71 | 100 | 100 | 10 | 15 | 35 | 12 | 8 | 5 | 15 |
| Studentens | 48 | 71 | 94 | 10 | 5 (+7) | 24 (+11) | 7 (+5) | 8 | 5 | 12 |
| Långt yrkesliv | 80 | 99 | 99 | 10 | 15 | 34 | 12 | 8 | 5 | 15 |
| Utan struktur (reservinläsning) | 40 | 26 | 33 | 8 | 0 | 15 | 0 (+7) | 0 | 0 | 3 |
| Kort men välskrivet | 66 | 92 | 95 | 10 | 13 | 32 (+3) | 12 | 8 | 5 | 12 |

Spridningen är större än förut: tunna CV hamnar lägre, genomarbetade högre. 100 kräver att varje kontroll är uppfylld.

## Ändra modellen

Ändras en regel ska `POANG_VERSION` räknas upp, dokumentet uppdateras och fixturtabellen köras om (`npx vitest run src/lib/cv/poang`, testet "kalibrering" skriver ut tabellen).
