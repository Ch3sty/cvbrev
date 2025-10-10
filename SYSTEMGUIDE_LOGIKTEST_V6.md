# 📘 Systemöversikt & Implementeringsguide för Logiktester (v6 - Avancerad)

Detta dokument är en guide för utvecklare som arbetar med det **avancerade** `v6`-testpaketet. Syftet är att förklara de arkitektoniska principerna, de mer komplexa regeltyperna och de designregler som är avgörande för att testets svårighetsgrad ska vara rättvis och logiskt grundad.

## 1. Kärnarkitektur: Parametrisk Data

Systemet bygger på principen att **parametrisk data är kung**. Istället för att lagra färdiga SVG-filer, lagrar vi en abstrakt beskrivning av varje bild.

-   **Vad:** En fylld pil som är roterad 90 grader lagras som `{ kind: 'arrow', rotation: 90, fill: true }`.
-   **Varför:** Denna metod är fundamental för att kunna bygga, validera och underhålla komplexa tester på ett robust sätt. Det möjliggör automatisk validering och säkerställer visuell konsekvens.

## 2. De Kritiska Principerna (Gyllene Regler)

Dessa regler är **inte förhandlingsbara**. Att bryta mot dem gör frågorna tvetydiga och ogiltiga.

### a) Principen om Visuell Entydighet
Varje logisk operation, oavsett hur komplex, *måste* ha en uppenbar och otvetydig visuell representation.

-   **Rotation:** Använd **endast asymmetriska former** där varje rotation är unik (t.ex. pil, L-form).
-   **Position:** Om en regels logik bygger på position (t.ex. "hörn", "mitten"), **måste** en visuell referensram användas (`showGrid: true`).
-   **Kontrast:** Transformationer på fyllda former måste vara fullt synliga. Exempel: En linje som "stansas ut" ur en fylld form ritas med inverterad färg (vit) för maximal tydlighet (se `v6-q8` och `v6-q14`).

### b) Principen om Rättvis Svårighetsgrad
Svårigheten ska komma från logikens komplexitet, inte från dålig design.

-   **Inga Gissningar:** Användaren ska aldrig behöva gissa referensramar, tvetydiga symboler eller dolda regler.
-   **Fokus på Logik:** Testet mäter logisk slutledning, inte visuell perception, minneskapacitet eller matematiska specialkunskaper.

## 3. Avancerade Regeltyper i v6

Detta testpaket höjer svårighetsgraden genom att använda tre primära kategorier av mer komplexa regler.

### a) Regler med Flera Variabler (t.ex. Q1, Q2, Q15)
Logiken bygger på att två eller tre oberoende variabler förändras samtidigt.
- **Exempel (`v6-q15`):** `Rad` styr form, `Kolumn` styr rotation, och `Cellposition` styr förflyttning. Användaren måste identifiera och hålla reda på alla tre mönster samtidigt.

### b) Logiska Operationer (t.ex. Q3, Q5, Q10, Q11, Q14)
Kolumn 3 är resultatet av en operation mellan Kolumn 1 och 2.
- **Union (`v6-q3`):** `C = A ∪ B` (allt från A och B slås ihop).
- **Subtraktion (`v6-q11`, `v6-q14`):** `C = A - B` (det som finns i B tas bort från A).
- **Intersection (`v6-q10`):** `C = A ∩ B` (endast det som finns i båda visas).
- **XOR (`v6-q5`, `v6-q12`):** `C = A ⊕ B` (det som finns i antingen A eller B, men *inte* i båda). Detta är en klassisk, avancerad regel.

### c) Abstrakta & Villkorliga Regler (t.ex. Q4, Q6, Q7, Q13)
Logiken är inte en direkt progression, utan baseras på egenskaper eller "om-då"-villkor.
- **Analogier (`v6-q4`):** Förhållandet `A → B` är detsamma som `C → ?`. Användaren måste först härleda transformationsregeln och sedan applicera den.
- **Villkor (`v6-q6`):** "OM formen är fylld, GÖR X. OM den är ofylld, GÖR Y." Detta kräver att man identifierar två separata regler och deras utlösande villkor.
- **Abstrakta Egenskaper (`v6-q7`):** Logiken baseras på en *egenskap* hos figuren, t.ex. "antalet slutna ytor", snarare än själva figuren.

## 4. Implementationens Flöde

1.  **Ladda Data:** Använd `minimal_icon_logic_questions_v6_detailed.json` som "source of truth".
2.  **Typsäkerhet:** Använd typerna från `types.v6.ts` för att garantera dataintegritet.
3.  **Rendering:** Använd `MatrixQuestionComponentV6` (eller motsvarande) för att rendera frågan. Kom ihåg att kontrollera `question.showGrid` och rendera referensramen först, och sedan anropa `SvgCellV6` från `renderers.v6.tsx`.
4.  **Validering (i dev):** Använd `signatures.v6.ts` och `assertUniqueOptions` för att automatiskt fånga visuella dubbletter bland svarsalternativen vid inläsning.

Genom att följa denna struktur säkerställer vi att även avancerade tester förblir robusta, rättvisa och underhållbara.