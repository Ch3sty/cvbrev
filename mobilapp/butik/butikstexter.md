# Testklar i Google Play, butikstexter

Underlag för Play Console (Huvudsida i butiken). Följer docs/plan-app.md och konceptet docs/design/app-koncept-2026-11-13.html (Ikon och butik). Teckengränser kontrolleras med `node -e` nedan.

## Appens namn (högst 30 tecken)

Testklar: Logiktest & övning

## Kort beskrivning (högst 80 tecken)

Öva rekryteringstest och I-provet. Åtta testtyper, regeln efter varje svar.

## Fullständig beskrivning (högst 4 000 tecken)

Du har fått ett rekryteringstest i kallelsen. Testklar, appen från jobbcoach.ai, tränar dig fram till dagen.

Börja med Nivåkollen. Den är gratis och ger dig din nivå på åtta minuter. Sedan gör du ett grundnivåtest om dagen gratis, i vilken av de åtta testtyperna du vill: matrislogik, figurserier, deduktiv slutledning, talserier, numeriskt resonemang, ordförråd, verbal förmåga och spatial förmåga. I de format som arbetsgivarnas tester brukar ha.

Efter varje svar visar vi regeln. Du ser varför svaret stämmer, så att du lär dig mönstret i stället för att gissa nästa gång.

VAD DU FÅR GRATIS
• Nivåkollen: din nivå på åtta minuter.
• Ett grundnivåtest om dagen, i valfri testtyp.
• Regeln efter varje svar, med förklaring.
• Grundversionen av personlighetstestet.

VAD PREMIUM ÖPPNAR
• Träning på din nivå, så ofta du vill. Tio minuter om dagen på din nivå.
• Avancerad nivå och expertnivå i alla testtyper.
• Övningsprov mot klockan i provets format, för de sista dagarna före provet.
• Övning inför I-provet: samma delar och samma tidspress.
• Kurvan som visar hur nivån rör sig vecka för vecka, med hela historiken.
• En påminnelse om dagens träning, på den tid du väljer.

Nivån räknas bara på uppgifter du inte sett den senaste månaden. Den visar vad du kan, inte vad du minns.

FÖR VEM
Testklar är för dig som ska göra ett logiktest eller ett rekryteringstest i en ansökan, för dig som vill bli snabbare på figurmatriser, talserier och deduktiva uppgifter, och för dig som ska skriva I-provet.

PREMIUM
Nivåkollen och ett grundnivåtest om dagen är gratis. Premium öppnar avancerad nivå och expertnivå i alla testtyper, träning på din nivå så ofta du vill, övningsproven och hela kurvan. Premium kostar 149 kr i månaden och förnyas varje månad tills du säger upp det. Du säger upp när du vill i Google Play.

SAMMA KONTO SOM PÅ WEBBEN
Logga in med Google eller e-post. Har du redan ett konto på jobbcoach.ai finns din nivå, dina resultat och din Premium här, och tvärtom.

Testerna är framtagna av jobbcoach.ai och är övningar. De är inte de officiella proven och har ingen koppling till testutgivarna eller Försvarsmakten.

Frågor? Skriv till oss via jobbcoach.ai/kontakt.

## Nytt i den här versionen (högst 500 tecken)

Fler sorters uppgifter i träningen: kroppar av kuber och speglingar i spatial förmåga, sanningssägare och lögnare, tabellpussel och villkorskedjor i deduktiv slutledning, klockor i figurserier och matriser. Ett grundnivåtest om dagen är gratis, i vilken testtyp du vill. Ordet pass är borta: nu heter det träning och test, som på webben. Klockan fortsätter räkna om du laddar om sidan mitt i ett test.

## Övrigt i Play Console

| Fält | Värde |
|---|---|
| Apptyp | App |
| Kategori | Utbildning |
| Taggar (väljs i Play Console) | Utbildning, Studiehjälp, Hjärngympa (välj de närmaste som Play erbjuder) |
| Utvecklarens namn | Jobbcoach |
| Webbplats | https://www.jobbcoach.ai |
| E-post för kontakt | [PLATSHÅLLARE: support-adress, till exempel hej@jobbcoach.ai] |
| Telefon | [PLATSHÅLLARE: valfritt, lämna tomt om ingen] |
| Integritetspolicy | https://www.jobbcoach.ai/integritetspolicy (kontrollerad 2026-11-13, svarar 200) |
| Radera konto, webbadress (krav i Play) | https://www.jobbcoach.ai/radera-konto |
| Pris | Gratis att ladda ned, köp i appen (Premium 149 kr i månaden) |
| Annonser | Nej, appen visar inga annonser |
| Målgrupp och innehåll | Målgrupp 18 år och äldre (rekryteringstester). Inte riktad till barn. |
| Innehållsklassning (IARC-enkäten) | Kategori: Referens, nyheter eller utbildning. Svara nej på våld, sexuellt innehåll, svordomar, droger, spel om pengar och användargenererat innehåll. Användarna kan inte kommunicera med varandra. Digitala köp: ja. Väntat utfall: PEGI 3 / alla åldrar. |
| Nyhetsapp | Nej |
| Hälsoapp | Nej |
| Myndighetsapp | Nej |
| Finansiella funktioner | Nej |

## Grafik

| Fil | Mått | Användning |
|---|---|---|
| ikon-512.png | 512 x 512, 32-bitars PNG | Appikon i butiken (Play rundar hörnen själv) |
| featuregrafik-1024x500.png | 1024 x 500 | Featuregrafik |
| telefon-1-1080x1920.png | 1080 x 1920 | "Ett pass om dagen, fram till provet" (orange, står först) |
| telefon-2-1080x1920.png | 1080 x 1920 | "Nivåkollen gratis. Din nivå på åtta minuter." |
| telefon-3-1080x1920.png | 1080 x 1920 | "Samma format som ditt test, mot klockan" |
| telefon-4-1080x1920.png | 1080 x 1920 | "Se nivån stiga, vecka för vecka" |

Allt genereras med `node mobilapp/resurser/generera.mjs` från repots rot. Telefonbilderna renderas ur konceptets butiksbilder; ändras vyerna i appen tas bilderna om ur appen eller konceptet.

## Varumärken

Testutgivarnas varumärken (Matrigma, Alva, SHL, Aon med flera) står inte i titel, kort beskrivning eller fullständig beskrivning. Play bedömer namn på andras produkter i butikstexten som risk för vilseledande metadata, och konceptets förslag till kort beskrivning ersattes därför av ägaren 2026-11-13. I-provet står med eftersom det är provets allmänna namn och appen tränar just det formatet; meningen om att övningarna inte är de officiella proven ska stå kvar.

## Kontroll av längder

```
node -e "const t=['Testklar: Logiktest & övning','Öva rekryteringstest och I-provet. Åtta testtyper, regeln efter varje svar.'];t.forEach(s=>console.log([...s].length,s))"
```
