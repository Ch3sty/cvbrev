# 📘 Systemöversikt & Implementeringsguide för Logiktester (v3)

Detta dokument är en guide för utvecklare som arbetar med systemet för logiktester. Syftet är att förklara de grundläggande arkitektoniska principerna, dataflödet och de kritiska designregler som måste följas för att säkerställa att testerna är rättvisa, robusta och underhållbara.

## 1. Kärnarkitektur: Data, inte Kod

Hela systemet bygger på en fundamental princip: **parametrisk data är kung**. Istället för att lagra färdiga SVG-filer, lagrar vi en beskrivning av hur varje bild ska se ut.

-   **Vad:** En cirkel med en prick i övre vänstra hörnet lagras inte som `<svg>...`, utan som `{ kind: 'corner_dot', pos: 'TL' }`.
-   **Varför:**
    1.  **Underhållbarhet:** Om vi vill ändra tjockleken på alla linjer i hela testet, ändrar vi det på ett enda ställe (`renderers.v3.tsx`), inte i hundratals SVG-filer.
    2.  **Validering:** Vi kan programmatiskt analysera och validera reglerna. Det var så vi upptäckte problemet med roterande cirklar. Med rå SVG är detta nästan omöjligt.
    3.  **Flexibilitet:** Vi kan rendera samma logik till andra format (t.ex. Canvas, eller till och med textbeskrivningar för tillgänglighet) genom att bara byta ut renderaren.

## 2. De Kritiska Principerna (De gyllene reglerna)

Dessa regler är **inte förhandlingsbara**. Att bryta mot dem riskerar att göra frågorna tvetydiga, orättvisa eller olösbara.

### a) Principen om Visuell Entydighet
Varje logisk operation *måste* ha en uppenbar och otvetydig visuell representation.

-   **Rotation:** Använd **endast asymmetriska former** (som pilen i `v3-q2`) när regeln involverar rotation. Att rotera en cirkel eller en fylld kvadrat är meningslöst för användaren och ett fatalt designfel.
-   **Position:** Om en regels logik bygger på position (t.ex. "topp", "vänster hörn", "mitten"), **måste** en visuell referensram användas. Detta hanteras med `showGrid: true`-flaggan i `detailed.json` och den gråa rutan som renderas. En "osynlig" ram är inte acceptabel.

### b) Principen om Minimal Kognitiv Belastning
Testet ska mäta logisk slutledningsförmåga, inget annat.

-   **Inga gissningar:** Användaren ska aldrig behöva gissa referensramen, färgkodningen eller dolda regler. All information som krävs för att lösa problemet måste finnas i matrisen.
-   **Konsekvens:** Håll stilen (linjetjocklek, färger, grundstorlekar) konsekvent genom hela testet. Om en form plötsligt är lite större, kommer användaren att (med rätta) anta att det är en del av logiken.

## 3. Implementationens Flöde

En typisk implementation följer dessa steg:

1.  **Ladda Data:** Applikationens "source of truth" är `minimal_icon_logic_questions_v3_detailed.json`. Denna fil innehåller all information som behövs för att bygga och validera testet.

2.  **Säkerställ Typsäkerhet:** Använd typerna från `types.v3.ts` för att mappa den inlästa JSON-datan till starkt typade objekt i din applikation. Detta fångar uppenbara fel redan vid kompilering.

3.  **Rendera Gränssnittet:**
    -   En huvudkomponent (`MatrixQuestionComponent`) tar emot ett helt `Question`-objekt.
    -   Denna komponent kontrollerar `question.showGrid`. Om `true`, ritar den först den gråa referensramen inuti varje `<svg>`-behållare.
    -   Därefter anropas den specialiserade `SvgCellV3`-komponenten från `renderers.v3.tsx`, som tar emot ett `cell`-objekt och ritar dess innehåll *inuti* den redan existerande `<svg>`-taggen. Denna separation är viktig.

4.  **Validera Svarsalternativ (Utvecklingsmiljö):**
    -   Använd `signatures.v3.ts` för att säkerställa att inga två svarsalternativ för en fråga är visuellt identiska.
    -   Anropa `assertUniqueOptions(question.options)` när frågorna laddas in under utveckling. Detta är en kritisk QA-kontroll för att förhindra trasiga frågor i framtiden.

## 4. Råd för Framtida Utveckling

När du vill skapa nya frågor eller ett helt nytt testpaket, följ denna checklista:

1.  **Definiera en ny `kind` i `types.v3.ts`:** Vad heter den nya celltypen? Vilka parametrar behöver den (t.ex. `rotation`, `fill`, `count`)?
2.  **Implementera renderingslogik i `renderers.v3.tsx`:** Lägg till ett nytt `case` i `SvgCellV3`-komponenten som kan rita din nya typ.
3.  **Skapa en signatur i `signatures.v3.ts`:** Lägg till ett nytt `case` som skapar en unik textsträng baserat på den nya typens parametrar.
4.  **Skapa frågan i `detailed.json`:** Bygg din matris och svarsalternativ med den nya typen. **Ställ dig själv frågan: "Är regeln 100% visuellt entydig?"**
5.  **Testa rigoröst:** Kör `assertUniqueOptions` och granska frågan manuellt för att säkerställa att den följer de kritiska principerna.

Genom att följa denna struktur säkerställer vi att testsystemet förblir skalbart, robust och framför allt – rättvist för användaren.