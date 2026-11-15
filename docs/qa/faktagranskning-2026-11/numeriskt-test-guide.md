# Faktagranskning: content/artiklar/numeriskt-test-guide.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, testformatet och räkneexemplen stämmer, men två källhänvisningar (Arbetsförmedlingen, Akavia) säger mer än källorna och superlativet om tränbarhet saknar stöd.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 20 (frontmatter), 132, 221 (FAQ) | "Arbetsförmedlingen påminner om att flera aspekter vägs samman: antal rätta svar, antal genomförda uppgifter, prioriteringar och effektivitet" | obelagt | Den länkade AF-sidan är en kategorisida utan den texten, och webbinariet gick inte att kontrollera. Stryk AF som avsändare, eller hitta en skriftlig källa. Att Aon Scales är tidspressat och att både tempo och precision räknas står i Aons och testförlagens beskrivningar. | https://arbetsformedlingen.se/play/webbinarium/hur-tanker-arbetsgivaren-om-tester-vid-rekrytering |
| 156 | "Akavia är tydlig: ... Och stress är ofta en avsiktlig del av testet" | obelagt | Akavia säger det om simuleringsövningar: "I simuleringsövningar kan en viss nivå av stress behövas för att ge en realistisk bild." Stryk stressledet eller avgränsa till simuleringar. Samma fel finns i rotation-test-guide.mdx. | https://www.akavia.se/rad-och-stod/soka-jobb/anstallningsintervju/jobbtest/ |
| 27, 150 | "det här är den mest tränbara av alla testtyper" / "Det här är testtypen där träning ger mest" | obelagt | Ingen källa, och rotation-test-guide.mdx påstår samma sak om spatial förmåga. Skriv "uppgifterna bygger på ett fåtal räkneoperationer, så träning ger snabbt effekt" utan superlativ. | – |
| 37 | "Aons numeriska test i serien Scales (tidigare cut-e), ett av de vanligaste på den svenska marknaden" | obelagt | Ingen källa för förekomsten på svenska marknaden. Stryk "ett av de vanligaste på den svenska marknaden" eller skriv "som många större arbetsgivare använder". | – |

## Belagda påståenden
- Aon Scales numerical: 37 uppgifter på 12 minuter, kortare variant 18 uppgifter på 6 minuter, sant/falskt/kan inte avgöra mot data i flikar, tempot gör att få hinner klart: sekundärkällor (JobTestPrep, practiceaptitudetests.com); Aons egen kunskapsbas bekräftar 6 minuter för mobilversionen, https://aonassessment.deskpro.com/en-US/kb/articles/evne-og-ferdighetstester . Cirka 20 sekunder per uppgift stämmer räknemässigt (720/37, 360/18).
- Akavia räknar numeriska test till färdighetstester som mäter numerisk, verbal eller abstrakt problemlösningsförmåga; öva för att vara mentalt förberedd; praktiska råd: Akavia jobbtest-sidan.
- Räkneexemplen (80→100 = 25 %, 240 000→300 000 = 25 %, 150/600 = 25 %, 180:120 = 3:2, 297/1 980 ≈ 15 %) stämmer.
- Produkt: numeriskt test på grundnivå (20 uppgifter, 25 minuter) är gratis, avancerad och expert kräver tests_above_base: src/app/dashboard/tester/testConfig.ts rad 405–452; /verktyg/rekryteringstester/prova finns.

## Rättning (omgång 1, 2026-11-15)
- Rad 20, 132, 221 (Arbetsförmedlingen om vad som vägs samman): AF struket som avsändare. Omskrivet till det som står i testförlagens beskrivningar: testet är tidspressat och i regel räknas både hur många uppgifter du hinner och hur många du får rätt. FAQ i frontmatter och brödtext säger samma sak. AF:s webbinarielänk (kategorisida utan texten) borttagen ur källraden.
- Rad 156 (Akavia och stress): stressledet struket. Kvar: Akavias råd om att bli bekant med upplägget och mentalt förberedd, plus "Tidspressen hör till testet".
- Rad 27, 150 ("den mest tränbara av alla testtyper", "testtypen där träning ger mest"): superlativen strukna, nu "uppgifterna bygger på ett fåtal räkneoperationer ..., så träning ger snabbt effekt" och "Här ger träning snabbt effekt". Samordnad med rotation-test-guide, där samma superlativ ersatts med Uttal m.fl. 2013; ingen av artiklarna påstår längre att den egna testtypen är mest tränbar.
- Rad 37 ("ett av de vanligaste på den svenska marknaden"): struket.
- updated: "2026-11-15" tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden berörs inte (underlagets "Håll tempot" finns kvar ordagrant), ej omgjord. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
UNDERKÄND.
- Rad 38 (ändrad rad): "en variant har 37 uppgifter på 12 minuter, en kortare 18 uppgifter på 6 minuter". Siffrorna är belagda i första granskningen (Aons kunskapsbas för 6 minuter, testförberedelsesajter för 37 på 12), men efter rättningen innehåller källraden (rad 200) bara Akavia. Formkravet är att belagda siffror har en källa i källraden. Krävs: lägg till Aons kunskapsbas (https://aonassessment.deskpro.com/en-US/kb/articles/evne-og-ferdighetstester) och en källa för 37 uppgifter på 12 minuter (till exempel https://www.practiceaptitudetests.com/testing-publishers/cut-e/) i källraden, eller stryk talen.
- Resten håller. AF är borta som avsändare. Den nya formuleringen på rad 21, 133 och 222 ("i regel räknas både hur många uppgifter du hinner och hur många du får rätt") täcks av Akavia, som redan står i källraden: "Vanligtvis bedöms flera aspekter i resultatet såsom antal rätta svar, antal genomförda uppgifter, prioriteringar och effektivitet". Superlativen och "ett av de vanligaste på den svenska marknaden" är strukna, Akavia-stressledet likaså. FAQ samstämmiga, inga talstreck, produktuppgiften (öva gratis) stämmer med grundnivån.

## Rättning omgång 2 (2026-11-15)
- Rad 38: kontrollerat källorna själv. practiceaptitudetests.com/testing-publishers/cut-e/ anger scales numerical 37 uppgifter på 12 minuter. Aons kunskapsbas anger 6 minuter men inget antal uppgifter, och ingen av källorna belägger 18 uppgifter. Därför: "en kortare 18 uppgifter på 6 minuter" ersatt med "och Aon anger själv en kortare version på 6 minuter", och 20-sekundersuträkningen knuten till den längre varianten ("I den längre varianten ger det dig i snitt runt 20 sekunder per uppgift", 720/37 ≈ 19,5).
- Källraden: Aon Assessment (kunskapsbasen) och Practice Aptitude Tests om cut-e tillagda efter Akavia.
- Inga rubriker, FAQ, description eller bild ändrade; raden citeras inte i underlaget. Inga talstreck.

## Tredje kontrollen (2026-11-15)
GODKÄND. Rad 38: 37 uppgifter på 12 minuter bärs av Practice Aptitude Tests ("The numerical test offers 37 tasks in 12 minutes"), 6 minuter av Aons kunskapsbas ("Numerical reasoning | scales numerical mobile ... Time: 6 minutes"), båda kontrollerade 2026-11-15 och tillagda i källraden (rad 200). De obelagda 18 uppgifterna är strukna, och 20 sekunder per uppgift är knutet till den längre varianten (720/37). Inga talstreck.
