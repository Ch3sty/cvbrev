# Testflödet: inventering av hur testerna genomförs

Datum: 2026-11-19/20. Underlag för UX-agenten, saas-lead och art director inför en gemensam plan för konsekventa testflöden. Ingen kod är ändrad.

**Metod.** Kodläsning av alla sessionskomponenter (tre parallella genomgångar) plus klickgenomgång i riktig Chrome (puppeteer-core, headless) mot produktion www.jobbcoach.ai med ett eget QA-konto med Premium (`allt`). Desktop 1400×900 och Pixel 7 412×915. Kontot och alla dess rader är raderade efteråt (räknade och raderade med id).

**Skärmdumpar:** `C:\Users\chris\AppData\Local\Temp\claude\c--Users-chris-cvbrev\af2c641b-0e2e-44f8-9bbf-21f4b205ae5f\scratchpad\testflode\` (cirka 300 bilder, namn `typ-lage-steg-enhet.png`, steg = start, fraga1, eftersvar, eftersvar2s, fraga5, slut, slut-hel).

---

## 1. Kort sammanfattning

Det finns inte ett testflöde utan **tre ramverk och minst femton sessionskomponenter**:

| Ram | Var den används | Kännetecken |
|---|---|---|
| **A. `TestFlowShell` + `TestMeterRow`** (tests/shared) | Nivåtesten grund/avancerad/expert för alla åtta typer, personlighetstestet, de gamla `*-prov`-sluggarna | Rubrik som h1 till vänster, X till **höger**, tid till vänster, "Fråga/Uppgift/Passage n / N" i mitten, "✓ besvarade" till höger, numrerat frågerutnät, sidomenyn syns på desktop |
| **B. `PassShell`** (traning) | Nivåkollen, Träna (alla typer), logikens övningsprov, Uppvärmning | X till **vänster**, titel + undertitel, "n / N" till höger, kopparstapel med "0:03 … provets tid 1:23", inget rutnät |
| **C. Egna skal** | Övningsprov verbal/numeriskt/figurer/deduktivt (`OvningsprovFlode`), I-provet (`IprovFlode`) | Som B men egen kod, 60 px/640 px resp. 56 px/560 px, nedräkningsring `Klocka`, `Segmentstapel` i stället för rutnät |

Samma testtyp ser alltså olika ut beroende på vilken dörr användaren tar, och samma dörr (t.ex. nivåtest) ser olika ut beroende på typ. Exempel från produktion, grundnivå, desktop:

- **Rubrik:** "Logiktest, grundnivå" (session) → "Logiktest, grund" (resultat) men typen heter "Figurer och mönster" i Tester. "Talserier, grund" (session) men "Talserier, grundnivå" (startsidan).
- **Klocka:** uppräkning "00:02" (sju nivåtest), nedräkning "24:59" från 25 min (verbalt, startsidan säger 20 min), "0:06 … provets tid 4:56" (Nivåkoll/Träna), ring "20" (övningsprov).
- **Svar:** auto-nästa efter 150 ms (matris, figurserie, talserie, spatial, ordförråd), markera + "Svara" (deduktiv), välj + "Nästa fråga" och låst (numeriskt, verbalt expert), fritt per passage + "Nästa" (verbalt).
- **Återkoppling:** direkt i Träna, efter testet i nivåtest/Nivåkoll/övningsprov. Inget val för användaren någonstans.

---

## 2. Jämförelsematris (typ × läge)

Kolumnerna: **Start** = startskärm före fråga 1. **Huvud** = rubrik / tid / framsteg. **Yta** = kolumnbredd och svarsform. **Svar** = auto/knapp, tillbaka, rutnät, "Vet inte". **Återk.** = när rätt/fel visas. **Slut** = resultatskärm och knappar. **Mobil** = fynd på 412×915. **A11y** = tangentbord. Ordval i egen tabell (avsnitt 3).

### 2.1 Nivåtest (grund/avancerad/expert), ram A

Alla startar på `/dashboard/tester/<slug>` (`TestHubPage`, samma för alla): rubrik = config-titel, eyebrow "Grundnivå", h2 med typens fråga, fakta "15 frågor / 20 minuter", knapp **"Starta testet"** (efter första försöket **"Gör om testet"**), kort "Ditt bästa", "Dina försök", hjälp "Vad betyder grundnivån?". **Ingen instruktionsskärm**, inget "fortsätt där du var". Session i `TestRunner.tsx` → komponent per typ. Resultat i `TestResultsPage` (gemensam): mörk vägg "TESTET KLART", "x av y rätt", tid "av 20 min", tempomått, kort "Genomgång" (knapp "Gå igenom de N frågorna/uppgifterna", "Visa alla N"), "Var du tappade här", "Tempo mot provets tid", statusrad ("Samma nivå igen i morgon …") med länk "Ladda upp ditt CV" eller "Alla tester".

| Typ | Komponent (rader) | Huvud | Yta | Svar | Återk. | Mobil | A11y |
|---|---|---|---|---|---|---|---|
| Matris (Figurer och mönster) | `matrix/MatrixTestSession` 713 + `logicV7` | "Logiktest, grundnivå" / ↑ 00:01 / "Fråga 1 / 15" / "✓ 0 / 15" + 2 px stapel | max 420 px, 6 kvadratkort 3×2, A–F 11 px, "Svårighet ●●", reglage "Förklarande text av" | **auto 150 ms**, "Nästa"/"Lämna in", ‹ tillbaka, rutnät "Frågor x av 15 besvarade", ingen "Vet inte" | efter testet (regel under testet om reglaget på) | svarsrad A–C precis vid nederkanten, D–F under vecket; "✓ 0" utan "/15" | ←/→, a–f |
| Figurserie | `serie/FigurserieTestSession` 397 | "Figurserier, grundnivå" / ↑ / "Uppgift n / 15" / ✓ | max 640 px, 6 kort på rad (3 under 600 px) | auto 150 ms, som matris | efter | ok | ←/→, a–f |
| Deduktiv | `deduktiv/DeduktivTestSession` 408 | "Deduktiv slutledning, grundnivå" / ↑ / "Uppgift n / 12" / ✓ | `bred` 1000 px, två kolumner från lg (premisser 400 + fråga 480), rader A–E 52 px | **markera + "Svara"**, ‹, rutnät (22 px breda celler på desktop), ingen "Vet inte" | efter | premisskort sticky max 42 vh; rubriken heter "Premisser" eller "Villkor" beroende på uppgift | a–e, Enter, ← (ingen →) |
| Talserie | `steg2/Steg2TestSession` 386 + `Uppgifter` 558 | **"Talserier, grund"** / ↑ / "Uppgift n / 15" / ✓ | max 420/560 px, talrad + rader A–E 46 px | auto 150 ms, rutnät (rubrik "Frågor"), ingen "Vet inte" | efter | ok | ←/→, a–f |
| Spatial | samma | "Spatial förmåga, grund" | kvadratkort 2×2 (4 på rad på desktop) | som talserie | efter | ok, kort 185 px | ←/→, a–f |
| Ordförråd | samma | "Ordförråd, grund" / "Uppgift n / 20" | ord i versaler 28 px, rader 46 px | som talserie | efter | ok | ←/→, a–f |
| Verbal grund/avancerad | `verbal/VerbalTestSession` 542 + verbal-shared | "Verbalt resonemang, grundnivå" / **↓ 24:59** (25 min, startsidan och resultatet säger 20) / "Passage 1 / 10" / "✓ 0 / 10" som räknar påståenden men visar "/10" | max 768 px, text + 4 påståenden à tre knappar "Sant / Falskt / Kan ej avgöras" (h-11) | **ingen auto**, fritt inom passagen, "Nästa", passagerutnät | efter | **första påståendet syns inte på första skärmen**, texten tar hela höjden | inga kortkommandon |
| Verbal expert | `verbal/VerbalExpertSession` 409 | "Verbalt resonemang, expertnivå" / ↑ / "Fråga n / 32", inget ✓ | numerisk-stil rader A–D | välj + **"Nästa fråga →"**, **låst, ingen väg tillbaka**, inget rutnät, "Lämna in" **utan bekräftelse**, X lämnar **utan bekräftelse** | efter | ej klickat på mobil | inga |
| Numerisk (alla nivåer) | `numerical/NumericalTestSession` 546 + numerical-shared | "Numeriskt test, grundnivå" / ↑ / "Fråga 1 / 20", inget ✓, plus "Fråga 1 av 20 · Lätt" en gång till i kortet | max 768 px, diagram/tabell, rader A–D 56 px med rund bokstav | välj + "Nästa fråga →" (helbred), låst, inget rutnät, X lämnar utan bekräftelse | efter | **svaren hamnar under diagrammet, på desktop helt under vecket** (fråga 1 y=845 av 900) | inga |

Avancerad/expert använder samma komponenter (bekräftat i webbläsare för matris expert, talserie avancerad, numerisk avancerad, verbal expert). Enda skillnaden i utseende är matrisens "Svårighet"-prickar och verbal expert som är en egen komponent.

### 2.2 Nivåkollen, ram B (`/dashboard/tester/pass?typ=matning` resp. `?typ=nivakoll&kind=…`)

| Typ | Komponent | Start | Huvud | Svar | Återk. | Slut |
|---|---|---|---|---|---|---|
| Matris | `PassFlode` 747 + `PassFraga` | **ingen**, laddskelett och direkt fråga 1 | X vänster, "Nivåkollen" / "Tolv uppgifter som följer dina svar", "1 / 12", stapel "0:01 … provets tid 1:23" (**per fråga**) | **tryck = svar och nästa**, ingen footer, ingen "Vet inte" | efter | `MatningResultatVy`: "Nivåkollen klar", "3 av 10", skala, "4 av 12 rätt", "I morgon"-kort med tidval Morgon/Lunch/Kväll, "Träna" + "Tillbaka till Rekryteringstester", **ingen "Gå igenom"** |
| Figurserie | `NivakollFlode` 377 | ingen, rad "Ingen återkoppling under tiden …" ovanför fråga 1 | "Nivåkollen" / "Nivåkollen, figurserier", "1 / **9**", stapel med **total** tid | markera + "Svara", länk "Vet inte" | efter | `NivakollResultatVy`: "Nivåkollen sparad, figurserier", "Din nivå i figurserier 3 av 10", Träna-kort, "Gå igenom Nivåkollen", "Träna", "Tillbaka …" |
| Deduktiv | samma | som ovan + "Utgå bara från det som står …" | "Nivåkollen, deduktivt", "1 / **6**" | som ovan | efter | som ovan |
| Verbal | samma | som ovan | "Nivåkollen, verbalt", "1 / **8**", "provets tid 4:56" | som ovan | efter | som ovan |
| Numerisk | samma | som ovan | "Nivåkollen, numeriskt", "1 / **8**" | som ovan | efter | som ovan |
| Talserie, spatial, ordförråd | finns inte (`NIVAKOLL_FINNS` false) | | | | | |

Menyn i Tester lovar "Tolv uppgifter, cirka åtta minuter" för alla, men bara matrisen har tolv. Talserie/spatial/ordförråd visar "Nivåkoll, 8 min" på kortet i Alla tester trots att knappen leder till grundnivån och menyn säger "Kommer snart". Öppnar man Nivåkollen en gång till samma dag visas gårdagens resultat direkt i stället för en ny kontroll (sågs på mobil för figurserie).

### 2.3 Träna, ram B (`?typ=pass`, `textpass`, `sifferpass`, `figurpass`, `deduktivpass`, `steg2pass`)

Ingen har startskärm. Alla visar återkoppling direkt efter varje svar. Ingen har kortkommandon.

| Typ | Komponent (rader) | Huvud | Svar | Återkoppling | Slut |
|---|---|---|---|---|---|
| Matris | `PassFlode` 747 | mönstrets namn "Två rutor läggs ihop" / "Träna, nivå 3", "1 / 9", tid per fråga | tryck = svar; "Vet inte, visa regeln" före; **"Nästa fråga"** efter | `Regelpanel` "REGELN … Inte den här, 3 s … DITT MISSTAG", rätt figur fylls i matrisen | `PassResultatVy` i mörk vägg: "Träningen sparad", "1 av 9 rätt. Nivån 3,7, ner två tiondelar.", genomgång, "Visa kurvan" |
| Verbal (Ord och text) | `vnpass/VnPassFlode` 401 + `VnUppgift` | "Ord och text" / "Träna, grund", "1 / 4", total tid | tryck = svar, **ingen "Vet inte"**, "Nästa" | "FÖRKLARINGEN Rätt …" | **enkel kortlista** (annan design än matrisen): "TRÄNINGEN KLAR 3 av 4 rätt.", "Tempot", "Var du tappade", "Öva den här typen", "Gå igenom svaren", "Tillbaka till Rekryteringstester" |
| Numerisk | samma | "Siffror och tabeller" / "Träna, grund" | som verbal | "FÖRKLARINGEN" | som verbal |
| Figurserie | `figurpass/FigurPassFlode` 453 | "Figurserier" / "Träna, grund", "1 / 4" | tryck = svar, "Vet inte, visa regeln", "Nästa" | Regelpanel | kortlista |
| Deduktiv | `deduktivpass/DeduktivPassFlode` 456 | "Deduktiv slutledning" / "Träna, grund" | **markera + "Svara"**, "Vet inte, visa lösningen", "Nästa" | `DeduktivLosning` | kortlista |
| Talserie / spatial / ordförråd | `steg2pass/Steg2PassFlode` 381 | "Talserier" / "Träna, uppgift 1 av 6" **och** "1 / 6" | tryck = svar, "Vet inte, visa regeln/lösningen", **"Nästa uppgift"** | hela vyn byts mot genomgång "RÄTT SVAR ÄR C …", "Något ser fel ut" | kortlista "KLART 2 av 6 rätt" (inte "TRÄNINGEN KLAR") |

Matrisens Träna är låst bakom Nivåkollen ("Gör Nivåkollen först"), övriga typer går att träna direkt.

### 2.4 Övningsprov mot klockan, ram B/C (`/dashboard/tester/ovningsprov/<typ>`)

Startark (`Startark` 217, gemensamt): "Övningsprov mot klockan", "Vårt format", "18 uppgifter på 25 minuter. I fast ordning, de svåraste sist. Du kan gå tillbaka.", tre regler ("Klockan räknar ned", "Ingen hjälp under tiden", "Obesvarade räknas som fel"), **"Starta övningsprovet"**, "Avbryter du sparas inget resultat." **Detta är den enda riktiga startskärmen med regler i hela produkten.**

| Typ | Komponent | Huvud | Svar | Slut |
|---|---|---|---|---|
| Logik | `PassFlode` → `LogikProvFraga` 247 (PassShell) | X, "Övningsprov" / "Vårt format", ring **"25"** (minuter), segmentstapel, "uppgift 1" | ingen auto, "Föregående" (textlänk) / "Nästa" (sekundär) / "Lämna in" **utan bekräftelse**; adaptiva format: "Svara och gå vidare" | `OvningsResultatVy`: "ÖVNINGSPROVET KLART 0 av 18 rätt", "Tiden räckte", kurva, genomgång |
| Verbal | `OvningsprovFlode` 586 | "Övningsprov" / "Vårt format, 8 texter", ring "20", "text 1 av 8 … påstående 1" | ett påstående i taget, "Sant / Falskt / Går inte att avgöra" (56 px), ingen auto | som ovan, genomgång fälls ut på plats |
| Numerisk | samma | "Vårt format, 5 underlag" | rader A–D, ingen auto | som ovan |
| Figurer | samma | "Vårt format", ring "14" | kort, ingen auto | som ovan |
| Deduktiv | samma | "Vårt format", ring "20" | rader A–E, ingen auto | som ovan |

Talserie, spatial och ordförråd har inget eget övningsprov (de ingår i I-provet). Menyn för Figurer och mönster säger "Välj format: Alva Logic eller Matrigma", men startarket visar "Vårt format" utan formatval (formatet väljs i Plan inför provet).

### 2.5 I-provet (`/dashboard/tester/iprov`), ram C

`IprovFlode` 544. Startskärm: "Övningsprovet", val "Halva provet 36 uppgifter, 29 min" / "Hela provet 72 uppgifter, 58 min", sex deltester listade, regel "Du kan inte gå tillbaka till ett avslutat deltest", knapp i footer "Starta övningsprovet". Mellanskärm per deltest: "DELTEST 1 AV 6", "Synonymer", "6 uppgifter på högst 3 minuter …", "Klockan startar när du trycker.", "Starta deltestet". Huvud: X (aria "Stäng", ingen bekräftelse), "I-provet, övningsprov" / "Deltest 1 av 6, synonymer", ring "3", segmentstapel. Svar: **auto 180 ms** (till skillnad från övriga övningsprov), "Föregående" / "Nästa", sist "Avsluta deltestet" med bekräftelse. Segmentknapparna är 86×16 px (62×16 på mobil). Resultatet nåddes inte (se avsnitt 8).

### 2.6 Personlighetstestet (`/dashboard/tester/personlighet-grund`), ram A

`personalityTest/TestSessionView` 421 + `LikertScale` 81. Start: "Personlighetstest, grundnivå", "50 påståenden, cirka 10 minuter", "Starta testet". Huvud: X (aria **"Lämna testet"**, ingen bekräftelse), "**Fråga** 1 av 50", orange piller "0 svar", ingen klocka. Yta: "PÅSTÅENDE 1 AV 50", Likert 1–5 ("Stämmer inte alls" … "Stämmer perfekt"), 141×100 px på desktop, staplade på mobil, orange→röd gradient och framer-motion utanför designsystemet. Översikt "ÖVERSIKT — KLICKA FÖR ATT HOPPA" med 50 knappar som är **67×15 px på desktop och 32×14 px på mobil**. Auto-nästa 200 ms. "Lämna in" avstängd tills allt är besvarat, egen modal "Slutför testet?" / "Se min profil". Resultat: "Ditt resultat", fem dimensioner. Kortkommandon 1–5 och ←/→ (det enda flödet med siffertangenter).

---

## 3. Ordval

| Begrepp | Varianter i produktion |
|---|---|
| Typens namn | "Figurer och mönster" (Tester) / "Logiktest" (session, resultat) / "matrislogik" (slug). "Ord och text" (Tester, Träna) / "Verbalt resonemang" (nivåtest) / "verbalt" (Nivåkoll, övningsprov). "Siffror och tabeller" / "Numeriskt test" / "numeriskt". "Deduktiv slutledning" / "deduktivt". |
| Nivå | "grundnivå" (startsida, matris/figur/deduktiv/verbal/numerisk session) / "grund" (talserie/spatial/ordförråd session, **alla** resultatsidor, Träna-undertitlar "Träna, grund") / "Grund" (segment i menyn) / "nivå 3" (matris Träna) |
| Enhet | "Fråga" (matris, numerisk, verbal expert, rutnätsrubriken "Frågor" även i uppgiftstester, aria i alla PassShell-flöden, personlighet), "Uppgift" (figurserie, deduktiv, steg2, Nivåkoll, övningsprov), "Passage" (verbal), "påstående" (verbal, personlighet där huvudet ändå säger "Fråga 1 av 50"), "text"/"underlag" (övningsprov), "frågor" i startsidans fakta för matris men "uppgifter" i menyn för samma test |
| Nästa | "Nästa", "Nästa fråga", "Nästa fråga →", "Nästa uppgift", "Svara", "Svara och gå vidare" |
| Vet inte | "Vet inte, visa regeln", "Vet inte, visa lösningen", "Vet inte" (Nivåkoll), saknas i nivåtest, verbal/numerisk Träna och matrisens Nivåkoll |
| Svarsalternativ verbalt | "Kan ej avgöras" (nivåtest) / "Går inte att avgöra" (Nivåkoll, Träna, övningsprov, genomgången i nivåtestet) |
| Stäng | "Avsluta testet", "Lämna testet", "Avsluta träningen", "Avsluta Nivåkollen", "Avbryt provet", "Avsluta provet", "Stäng" |
| Bekräftelse | "Avsluta testet?" + "Avsluta och se resultat" / "Lämna in testet?" + "Lämna in och se resultatet" / "Slutför testet?" + "Se min profil" / "Avsluta deltestet?" / ingen alls |
| Klart | "TESTET KLART", "Nivåkollen klar", "Nivåkollen sparad, figurserier", "Träningen sparad", "TRÄNINGEN KLAR", "KLART", "ÖVNINGSPROVET KLART" |
| Paywall-bugg | "Träna talserieret ingår i Premium." (steg2/copy.ts bygger `${NAMN}et`) |
| Typografi | em-dash i "ÖVERSIKT — KLICKA FÖR ATT HOPPA" (personlighet) |

---

## 4. Komponenter som renderar sessioner

| Komponent | Rader | Ram | Delar med andra | Kommentar |
|---|---|---|---|---|
| `tests/matrix/MatrixTestSession` | 713 | A | TestFlowShell, TestMeterRow, logicV7, QuestionNavigation, ConfirmDialog | störst, egen hårdkodad titel |
| `tests/serie/FigurserieTestSession` | 397 | A | + FigurserieRad | ~95 % lika Steg2TestSession |
| `tests/deduktiv/DeduktivTestSession` | 408 | A | + DeduktivFraga | enda med "Svara" |
| `tests/steg2/Steg2TestSession` | 386 | A | + Uppgifter (558, delas med Träna och I-prov) | bygger titeln själv → "grund" |
| `tests/verbal/VerbalTestSession` | 542 | A | verbal-shared | nedräkning, läses inte på servern |
| `tests/verbal/VerbalExpertSession` | 409 | A | numerical-shared/QuestionDisplay | linjär, utan bekräftelser |
| `tests/numerical/NumericalTestSession` | 546 | A | numerical-shared | linjär, läses inte på servern |
| `tests/prov/Matris/Verbal/NumeriskProvSession` | 418 + 403 + 312 | A | useRobustAnswerSaving | legacy `*-prov`-sluggar, fortfarande nåbara |
| `personalityTest/TestSessionView` | 421 | A | TestFlowShell | egen modal, egen färgskala |
| `traning/PassFlode` (+ PassFraga, Regelpanel, GenomgangVy) | 747 | B | PassShell | matris Nivåkoll, Träna, riktat, logikens övningsprov |
| `traning/vnpass/VnPassFlode` | 401 | B | PassShell, VnUppgift | |
| `traning/figurpass/FigurPassFlode` | 453 | B | PassShell, Regelpanel, FigurserieRad | |
| `traning/deduktivpass/DeduktivPassFlode` | 456 | B | PassShell, DeduktivFraga | |
| `traning/steg2pass/Steg2PassFlode` | 381 | B | PassShell, Uppgifter | |
| `traning/nivakoll/NivakollFlode` | 377 | B | PassShell, ResultatSkal, VnUppgift, FigurserieRad, DeduktivFraga | |
| `traning/ovningsprov/OvningsprovFlode` | 586 | C | Klocka, Segmentstapel, FigurserieRad, DeduktivLayout | eget skal inline |
| `traning/iprov/IprovFlode` | 544 | C | Klocka, Segmentstapel, Uppgifter | eget skal inline |
| `traning/Uppvarmning` | 192 | B | PassShell, PassFraga | |

Resultatvyer: `TestResultsPage` 493 (nivåtest), `PassResultatVy` 193, `MatningResultatVy` 192, `OmmatningResultatVy` 115, `NivakollResultatVy` 153, `VnResultatVy` 110, `FigurResultatVy` 105, `DeduktivResultatVy` 105, `Steg2ResultatVy` 87, `OvningsResultatVy` 154, I-provets resultat inline, personlighetens `ResultsView` 172. Två olika resultatdesigner i Träna (mörk vägg för matris, enkel kortlista för övriga).

**Duplicering, uppskattning.** Sessionskomponenterna är cirka 8 900 rader. Det som går att dela är i stort sett allt utom frågeytan per typ (som redan finns som delade delar: logicV7, FigurserieRad, DeduktivFraga, Uppgifter, VnUppgift).
- Nivåtesten: ~3 400 rader där sparblocket (`PendingAnswer`, `RETRY_DELAYS`, `saveAnswer`, `flushPending`), `restoreAnswers`, `handleFinishTest`, felkort och laddskelett är kopierade sju gånger. Uppskattningsvis 1 500 till 2 000 rader dubbletter.
- Passflödena (exkl. matris): fem kopior av samma tillståndsmaskin (`Fas`, `forstaObesvarade`, `Meddelande` ×5, startdubblettskydd, 250 ms-timer, `skapa/avsluta/svara/nasta`, betalväggs- och genomgångsblock), cirka 1 500 rader.
- Resultatvyer: `FigurResultatVy` och `DeduktivResultatVy` skiljer bara i namn, `VnResultatVy`/`Steg2ResultatVy` är ~85 % lika.
- Död kod: `logicV6/*` (129), `logicV4/AnswerOptions, QuestionGrid, TestHeader` (205), `verbalV1/*` (164, bara i ett test), oanvända delar i numerical-shared och verbal-shared.

Grovt räknat är 35–45 % av sessionskoden kopior.

---

## 5. De största inkonsekvenserna, i ordning efter hur mycket de stör

1. **Samma test ser ut och beter sig olika beroende på dörr.** Figurserier grundnivå (ram A: rubrik, X höger, rutnät, auto-nästa, ingen återkoppling) och Figurserier Träna (ram B: X vänster, mönsternamn som rubrik, tidsstapel, "Vet inte", direkt förklaring) känns som två olika produkter. Användaren lär sig inte ett gränssnitt utan tre.
2. **Fyra olika svarsmodeller.** Auto-nästa (matris, figur, steg2, I-prov), markera + "Svara" (deduktiv överallt, alla Nivåkoll utom matris), välj + "Nästa fråga" och låst (numeriskt, verbalt expert), tryck = svar + förklaring + "Nästa" (Träna). Den som gjort matrisen och sedan öppnar numeriskt trycker på ett svar och väntar på att något ska hända. Matrisens Nivåkoll saknar helt footer och "Vet inte", övriga Nivåkoller har båda.
3. **Klockan betyder olika saker.** Uppräkning utan gräns (nivåtest, trots "20 minuter" på startsidan), nedräkning från 25 min (verbalt, startsidan och resultatet säger 20), stapel "provets tid" per fråga (matris Träna/Nivåkoll) eller för hela passet (övriga), ring med hela minuter (övningsprov, I-prov). Ingen förklarar vad som händer när tiden tar slut utom övningsprovets startark.
4. **Svaren syns inte utan att scrolla.** Desktop 1400×900: matrisens svar börjar under vecket (y≈760, rad två helt dold), numeriska svar på y≈845. Mobil: matris D–F under vecket, verbalt nivåtest visar inte ett enda påstående på första skärmen. Nivåkoll/Träna löser samma sak med sticky text med egen scroll, nivåtesten gör det inte.
5. **Ingen gemensam start.** Nivåtest: startsida utan instruktioner. Nivåkoll och Träna: ingen startskärm alls, sessionen skapas när sidan öppnas. Övningsprov: ett bra startark med regler. I-prov: eget startark plus mellanskärm per deltest. Personlighet: egen startsida.
6. **Framstegsindikatorn är otydlig och olika.** "✓ 0 / 15" i nivåtest räknar besvarade men ser ut som antal rätt. Verbalt visar "✓ 1 / 10" när ett av 40 påståenden är besvarat. Numeriskt visar inget ✓ men upprepar "Fråga 1 av 20 · Lätt" i kortet. Steg2 Träna visar antalet två gånger ("Träna, uppgift 1 av 6" och "1 / 6"). Nivåkollen lovar tolv uppgifter men har 6–9.
7. **Stäng och lämna in.** X till höger (ram A) eller vänster (B/C). Bekräftelse vid X i fem nivåtest, men inte i numeriskt, verbalt expert, personlighet, Nivåkoll, Träna, övningsprov eller I-prov. "Lämna in" utan bekräftelse i övningsprovet och verbalt expert. Två uppsättningar text för samma dialog.
8. **Namn och nivåord.** "Logiktest" vs "Figurer och mönster", "grundnivå" vs "grund", "Fråga" vs "Uppgift" (rutnätet heter "Frågor" i uppgiftstesterna), "Kan ej avgöras" vs "Går inte att avgöra". Se avsnitt 3.
9. **Resultatskärmarna.** Fem designer: nivåtestets vägg, matrisens Träna-vägg, Nivåkoll-väggen, Träna-kortlistan, övningsprovets vägg, plus personlighet och I-prov. "Gå igenom" saknas efter matrisens Nivåkoll. Tillbakaknapparna heter olika.
10. **Träffytor och tangentbord.** Personlighetens översikt 67×15 px (desktop) och 32×14 px (mobil), I-provets och övningsprovets segment 16 px höga, nivåtestens rutnät 22–39×40 px på desktop, "Vet inte"-länkar 36 px. Kortkommandon finns bara i fyra nivåtestkomponenter och personlighet, aldrig i Nivåkoll, Träna, övningsprov eller I-prov, och lyssnarna kollar inte om en dialog är öppen. Sidomenyn syns under alla sessioner på desktop (sessionen är fixed med `lg:left-[248px]`), vilket tar fokus från uppgiften.

Inget horisontellt scrollfel hittades på 412 px i någon session.

---

## 6. Det som fungerar och kan bli mallen

- **Ramen B (`PassShell`)** är den bästa grunden för huvudet: kompakt, X till vänster som i Duolingo, en rad för framsteg, sticky footer med safe-area, döljer bottennavigeringen (`useFlodeLage`), stapeln är en tydlig visualisering. Den används redan av sex flöden.
- **Träna-flödenas återkoppling** (Regelpanel, "FÖRKLARINGEN", steg2-genomgången) är det som ligger närmast Duolingo-känslan: svar, direkt besked, förklaring, en stor knapp vidare. Regelpanelen i matrisens Träna är bäst utförd (rätt figur fylls i luckan, "DITT MISSTAG", scrollas in i bild).
- **Övningsprovets startark** är den enda startskärmen som säger vad som gäller (format, antal, tid, tre regler). Den kan bli mallen för alla starter, kortad för Träna.
- **`VnUppgift`/`NivakollUppgift`** löser text + svar på mobil med sticky underlag och egen scroll. Mallen för verbalt och numeriskt i alla lägen.
- **`DeduktivLayout`** (två kolumner på desktop, sticky premisser på mobil) fungerar bra i alla tre ramar.
- **Frågeytor som redan delas** (logicV7/PassFraga, FigurserieRad, DeduktivFraga, Steg2 Uppgifter, VnUppgift) kan bli innehållet i en gemensam ram utan att banker eller rendering av själva uppgiften ändras.
- **Nivåtestets resultatsida** (`TestResultsPage` med Genomgång, Tappade, Tempo) är den mest kompletta resultatvyn och redan gemensam för åtta typer.
- **Sparandet i ovningsprov/iprov/pass** är serverstyrt (tid från serverns starttid, servern rättar, klienten har inte facit) och robustare än nivåtestens klientkod.

Bästa enskilda session i dag: **figurserie Träna** (`FigurPassFlode`): PassShell, delad uppgiftsvy, "Vet inte, visa regeln", direkt Regelpanel, en knapp vidare. Det som saknas där är startskärm, kortkommandon och en riktig resultatvägg.

---

## 7. Tekniska förutsättningar och risker för en gemensam sessionsram

**Bankformat.** Fem olika frågeformer: 3×3-matris med 6 alternativ (matris), rad + 6 alternativ (figurserie, två uppgiftsformer "fortsätt"/"bryter"), premisser + 4–5 textalternativ (deduktiv), text + 3 fasta svar per påstående (verbal, 4 påståenden per passage i nivåtest men ett i taget i Nivåkoll/Träna/övningsprov), underlag (tabell/diagram) + 4 alternativ (numerisk, flera frågor per underlag), tal/ord/figur + 4–5 alternativ (steg2). Ramen måste ha en slot för "underlag" (verbal, numerisk, deduktiv) och en för "uppgift + alternativ". Verbal nivåtest med fyra påståenden på samma skärm är den enda som inte passar "en uppgift per skärm".

**Var frågorna kommer ifrån.** Matris, figurserie, deduktiv och steg2 hämtas på servern utan facit. Verbal och numerisk nivåtest väljer frågor i klienten (`selectPassages`, banken i bundlen, seedat på sessions-id). En gemensam ram måste antingen behålla klienturvalet för de två eller flytta dem till servern; det senare ändrar inte frågorna men är ett eget arbete.

**Adaptiv logik.** Matrisens Nivåkoll (`nastaAdaptivaFraga`, ett band upp/ner) och Träna (`valjPass` på målnivå ±0,5, kalibreringsfråga för Premium) avgör nästa fråga på servern efter varje svar. Därför går det inte att gå tillbaka där, och "auto-nästa" är egentligen "vänta på servern". Övriga Nivåkoller är fasta stratifierade urval, övriga Träna en fast nivå (4 eller 6 uppgifter). Logikens adaptiva provformat (Matrigma adaptiv, Alva) har per-uppgiftstid. Ramen måste stödja både "fast lista med fri navigering" och "en i taget, nästa från servern".

**Tidtagning.** Fyra modeller: uppräkning från `started_at` (`useElapsedClock`), nedräkning i klienten (verbal nivåtest, `TOTAL_TIME` 25 min mot config 20), stapel per fråga eller för passet (`Tidsrad`), serverstyrd deadline med auto-inlämning och 410-svar efter tid + 10 s (övningsprov, I-prov, legacy-prov via `useExamDeadline`). Tiden per svar skickas som `timeSpent`/`tid` och används i tempo-korten och `sessionstid` på servern. Att byta klocka visuellt är ofarligt; att byta vad som skickas påverkar tempo-statistik och Din utveckling.

**Sparning och återupptagning.** Nivåtest: POST per svar till `/api/<typ>/answer` med två omförsök, ingen kö, återupptas bara via samma URL (ingen "Fortsätt"-knapp på startsidan, ny start skapar ny session). Pass/Nivåkoll: egna `session/svar/slutfor`-routes per motor under `/api/traning/`, svar läggs i `logic_test_v4_sessions.answers` via `sparaTestsvar`, `slutfor_traningssession` skriver `test_nivapunkter`, URL byts till `/pass/<id>` och `[sessionId]` letar i upp till sex motorer. Övningsprov och I-prov: serverstyrd tid, `osparade`-kö. Personlighet: egen API utan kö. En gemensam ram bör ta över `useRobustAnswerSaving`-mönstret (finns, används bara av legacy-prov) men får inte ändra routes eller tabellformat utan migreringsplan.

**Mätning som inte får gå sönder.**
- Klient: `pass_startat`, `nivamatning_startad`, `vet_inte_tryckt` (bara matris), `betalvagg_visad`, `paywall_cta_clicked`, `paywall_shown`, `feature_blocked` (PassFlode, NivakollFlode, resultatvyer, Startark, TestResultsPage, PaywallCard).
- Server: `pass_klart`, `riktat_klart`, `nivamatning_klar`, `ommatning_klar`, `generalrepetition_klar` (namnet behålls medvetet), `provpaket_klart`, `kalibreringsfraga_svarad`, `milstolpe_nadd`, `fraga_rapporterad`.
- Aktivitetslogg: `test_completed` via `logUserActivity` i TestResultsPage, läses av admin/tratt.
- Luckor i dag: inga PostHog-händelser alls under nivåtestens session, verbal/numerisk/figur/deduktiv/steg2 Träna skickar inga klienthändelser, personlighet och I-provets start skickar inget. En gemensam ram är ett tillfälle att lägga till `session_startad`/`session_klar` med `test_kind`, `lage`, `niva`, men de befintliga namnen ovan måste finnas kvar med samma egenskaper.

**Övriga risker.**
- Gratiskvoten (ett grundnivåtest om dagen, 429 → betalvägg) sitter i startsidans POST och i passmotorerna. Ramen får inte flytta sessionsstarten utan att kvotkontrollen följer med.
- `TestFlowShell` sätter `data-flow-active` och `--flow-footer-h`; cookie-bannern och bottennavigeringen beror på dem (`useFriSikt`).
- Appen Testklar (`/app/tester/...`) återanvänder samma sidor via proxyn; ändrade rutter måste fungera där.
- Prestandabudgeten för inloggat (LCP, CLS 0, serverrenderad initialdata) gäller; verbal och numerisk nivåtest målar i dag ett skelett före första frågan.
- Legacy-sluggarna `matrislogik-prov`, `verbal-resonemang-prov`, `numeriskt-test-prov` är fortfarande nåbara och bör pensioneras i samma veva eller uttryckligen lämnas.

---

## 8. Vad som inte kom åt eller inte gjordes

- **I-provets resultat** nåddes inte; jag körde start, mellanskärm och första deltestet (desktop och mobil), inte alla sex deltester. Resultatet är beskrivet från koden.
- **Avancerad/expert** klickades bara till första frågan (matris expert, talserie avancerad, numerisk avancerad, verbal expert) och bara på desktop. Övriga nivåer antas från koden använda samma komponent.
- **Övningsprov på mobil** testades inte (ett prov per typ och dag, kvoten gick åt på desktop).
- **Nivåkoll på mobil** gav gårdagens resultat för figurserie (redan gjord samma dag); mobilbilderna `figurserie-nivakoll-*-mobil` visar därför resultatskärmen, inte frågor. Matris Nivåkoll gjordes bara på desktop.
- **Riktat pass, ommätning, Uppvärmning, personlighet avancerad och legacy-`*-prov`** klickades inte, de är beskrivna från koden.
- **Gratisläget** testades inte i webbläsaren (kontot hade Premium hela tiden). Kvot- och betalväggstexter kommer från koden.
- **Tangentbord och skärmläsare** är bedömda från koden, inte provade med riktig skärmläsare.
- Ett par tidiga mobilbilder från ett misslyckat första varv kan ligga kvar med missvisande namn där senare körningar inte skrev över dem; grundnivåbilderna på mobil är från det lyckade varvet.
- QA-kontot (christiankarlssson+jobbcoach-qa-flode@gmail.com, id 544303c0…) är raderat med alla rader: logic_test_v4_sessions 44, user_activities 183, test_nivapunkter 13, personality_test_sessions 2, test_milstolpar 2, test_planer 1, user_personality_profile 1, profiles 1, auth-användaren. Granskningskontot för Google Play är orört.
