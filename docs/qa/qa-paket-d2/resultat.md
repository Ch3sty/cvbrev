# QA D2: välkomstskärmen, hjälpredan Kom igång och de gråade valen

Klicktest i riktig Chrome (puppeteer-core), produktionsbygge i `.next-d2` på port 3109, 2026-09-22. Pixel 7 (412 × 915, 2x) och desktop 1280 × 900. Skript: `scripts/qa-paket-d2.mjs`, konton via `scripts/qa-paket-d2-konton.mjs` (gratis, CV-veckan, Testveckan och Allt-veckan med scope satt direkt i profiles; skapade och raderade i samma omgång). Resultat: 69 kontroller, 0 fel (`resultat.json`).

## Skärmdumpar

| Nr | Vad | Konto |
|---|---|---|
| 01 | Välkomstskärmen, varianten "Och ett CV redan" (sektion 4 mitten), Pixel 7 | cv |
| 02 | Hemskärmen med raden Kom igång ovanför bottennavet (sektion 2) | cv |
| 03 | Arket Kom igång med CV-veckan, åtta brickor, 2 av 8 | cv |
| 04, 05 | Testsidan gråad: "Du har CV-veckan", "Grundnivån ingår. Resten finns i Testveckan.", gråa rader, fotknapparna (sektion 3) | cv |
| 06 | Grått val öppnar fel spår-kortet med mellanskillnaden 20 kr | cv |
| 07 | Menyn på mobil: huvudet, underraderna, gråa val, fotraden (sektion 3) | cv |
| 08 | Välkomstskärmen Testveckan med scenen och tre steg (sektion 1) | tester |
| 09 | Arket Kom igång med Testveckan, åtta brickor | tester |
| 10 | Mallsidan gråad: "Du har Testveckan", "3 mallar ingår. Alla 41 finns i CV-veckan.", noten, fotknapparna | tester |
| 11 | Galleriet med lås på mall 4 till 41 | tester |
| 12 | Desktop, Testveckan: sidomenyn med huvud, underrader, gråa val och Kom igång (sektion 5) | tester |
| 13 | Desktop: grått val i sidomenyn öppnar fel spår-kortet | tester |
| 14 | Desktop: profilmenyn med huvudet | tester |
| 15 | Välkomstskärmen Allt, varianten med CV | allt |
| 16 | Arket Kom igång med Allt, elva brickor | allt |
| 17 | Hemskärmen gratis med raden "Kom igång, 1 av 5" | gratis |
| 18 | Desktop, gratis: testsidan med ingressen, "Testveckan 79 kr", "Resultatet utan tolkning", sidomenyn (sektion 5 höger) | gratis |
| 19 | Desktop, gratis: grått val öppnar betalväggen för Testveckan | gratis |

## Sida vid sida mot specen

**Sektion 1, välkomstskärmen.** Kryss och paketets namn i toppraden, rubrik i Schibsted Grotesk 700 på 26 px, ingressen, scenen på panel (matrislogiken med klockan, respektive CV:n med pilen), eyebrow "Så här går det till" med tre numrerade steg, primär första steget ("Börja med matrislogik" / "Ladda upp CV:t"), sekundär "Visa allt som ingår" som öppnar arket. Header och bottennav dolda. Stämmer. Varianten "Och ett CV redan" (sektion 4 mitten) visar CV-raden med namn och datum, primär "Kör hela CV-analysen", sekundär "Ladda upp ett annat CV". Stämmer, med förbehållet i avvikelse 3.

**Sektion 2, raden och arket.** Mörk rad i ink-1 ovanför bottennavet med rubrik, "2 av 8 provade. Nästa: kör CV-analysen." och ringen "2/8". Arket: rubrik med "2 av 8", brickorna i specens ordning, klar bricka insjunken med fylld bock, nästa med ink-kant, accent-mjuk ikonyta, etiketten "Föreslaget nästa" och accentprick, kvar med tom ring, ikon per bricka, "Dölj hjälpredan" längst ned. Gratis: "Kom igång, 1 av 5". Stämmer.

**Sektion 3, gråade val.** Testsidan för CV-veckan: statusrad "Du har CV-veckan", "Grundnivån ingår. Resten finns i Testveckan.", grundnivån med "1 kvar i dag", avancerad, expert och provläget gråa med lås och "Testveckan 79 kr, eller Allt", personlighetstestet med tolkning grått, foten "Lägg till Testveckan, 79 kr" och "Eller Allt för 20 kr till i veckan". Trycket öppnar fel spår-kortet med "Mellanskillnad, 20 kr". Mallsidan för Testveckan: "Du har Testveckan", "3 mallar ingår. Alla 41 finns i CV-veckan.", noten om förhandsvisning, gråa mallar med lås i galleriet som går att välja och förhandsvisa, foten "Lägg till CV-veckan, 79 kr". Menyn: huvudet "Du har CV-veckan / Förnyas 29 september, 79 kr / Vad ingår?", underrader ur scope och kvot ("Alla 41 mallar, nedladdning utan tak", "Tre träffar per natt", "10 meddelanden", "Grundnivån, en gång per typ och dygn"), Bli upptäckt grått med "Ingår inte. Finns i Allt.", fotraden "Vill du ha testerna också? Allt kostar 20 kr till i veckan och öppnar allt grått." Stämmer.

**Sektion 5, desktop.** Sidomenyn med huvudet överst, en underrad per val, LinkedIn och Bli upptäckt gråa med lås, "Kom igång / 1 av 8 provade / 1/8" längst ned ovanför Hjälp. Gratis ser samma sak med "Du är på gratisnivån / Tre paket, från 49 kr" och "Kom igång 1 av 5". Testsidan för gratis: ingressen ur specen, "Testveckan 79 kr" utan "eller Allt", "Resultatet utan tolkning". Grått val öppnar betalväggen "Avancerad nivå ingår i Testveckan" med "Ta Testveckan". Stämmer.

## Avvikelser mot specen

1. Spacing och radier följer designsystemet (12 px-radie, 4/8/12/16/24-steg) i stället för specens 14 och 16 px-radier och 18/22-stegen, som i D1.
2. Gråa etiketter står i ink-3 (AA) i stället för specens kant-stark, som i D1.
3. Profilbrickans undertext är "Önskad roll och ort", inte "Önskad roll, ort, tillgänglig från" respektive "Vilket test du kallats till, när": profilen saknar de fälten (D2 fråga 1). Varianten "Och ett CV redan" visar "Poäng 61 med gratisnivån" bara när en analys finns; QA-kontot hade ingen, så raden visar bara datumet.
4. Tryck på en bricka går rakt till handlingen; specens "Brickan öppnad" (sektion 4 vänster) med beskrivning och tre steg är inte byggd (D2 fråga 5).
5. Raden på mobil ligger bara på hemskärmen; på desktop står den i sidomenyn på alla sidor (D2 fråga 4).
6. Sidomenyn på 256 px trunkerar de längsta raderna ("Förnyas 29 september, 79 kr" bakom "Vad ingår?", "Alla typer, alla nivåer, provläge mot klockan"). Kom igång-raden där bär specens korta form "Kom igång / 1 av 8 provade".
7. Personlighetstestets grundnivå heter "Personlighetstest, grund" (katalogen) med underraden "Resultatet utan tolkning"; specen skriver "Personlighet, grundnivå". Avancerad nivå heter "Personlighetstestet, med tolkning" som i specen.
8. Välkomstskärmen har en egen topprad i stället för FlowShell, eftersom FlowShell alltid ritar en stegräknare (D2 fråga 10).
9. Mobilmenyn har fler val än specens tio (Skriv nytt brev, Analysera CV, Profil); de bär befintliga underrader.

Övriga frågor och förslag står under "D2 frågor" i docs/bygg-noter-paket.md.
