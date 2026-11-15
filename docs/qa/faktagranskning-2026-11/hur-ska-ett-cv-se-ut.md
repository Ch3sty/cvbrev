# Faktagranskning: content/artiklar/hur-ska-ett-cv-se-ut.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Artikeln består mest av råd, men den har ett citat från en anonym rekryterare som framställs som verkligt, en felaktig sekundsiffra och en överdriven bild av gratis CV-analys.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 302–304 | `<CVExample title="Erfaren rekryterare om vad som avgör">` "Jag vill se vad kandidaten faktiskt har åstadkommit ... Ge mig resultat, ge mig siffror" | påhittat | Ett citat från en rekryterare utan namn eller källa, framställt som verkligt. Stryk det eller gör om det till egen text ("Rekryterare letar efter resultat, inte ansvarslistor"). | – |
| 296 | "Studier visar att rekryterare i genomsnitt lägger bara 6–10 sekunder på en första genomläsning." | fel | Ladders eye-tracking-studie 2018: i genomsnitt 7,4 sekunder (2012: 6 sekunder). Ersätt med "En ögonrörelsestudie från Ladders (2018) visar att rekryterare i snitt lägger 7,4 sekunder på en första genomläsning." | https://www.theladders.com/static/images/basicSite/pdfs/TheLadders-EyeTracking-StudyC2.pdf |
| 290, 370 | "vår kostnadsfria CV-analys som kontrollerar både struktur, innehåll och ATS-optimering" / "Kör en kostnadsfri CV-analys" | fel (produkt) | Gratisnivån ger en CV-analys med poäng och det tyngsta fyndet. Den fullständiga analysen (cv_analysis_full) kräver Jobbcoach Premium, 149 kr i månaden. Skriv till exempel "en gratis CV-analys som visar din poäng och det viktigaste att åtgärda". | src/app/(public)/priser/page.tsx rad 158; src/lib/access/features.ts |
| 44 | "Komplexa layouter med tabeller, kolumner eller grafik kan förvirra dessa system och sortera bort dig innan en människa ens sett ditt CV." | obelagt | Att ATS automatiskt sorterar bort CV:n på grund av layout bygger på 75 %-myten (Preptel 2012). Att kolumner kan läsas in fel är rimligt, men "sortera bort dig" saknar källa. Behåll "kan feltolkas" och stryk "sortera bort dig innan en människa ens sett ditt CV". | The Conversation 2026, Preptel 2012 (redan utrett) |
| 283–285 | "20–24 kryssade ... 14–19 kryssade ... Under 14" | fel (internt) | Checklistan har 25 punkter (7+7+5+6). Ändra till "20–25 kryssade". | Artikelns egen checklista rad 163–278 |
| 33 | "vårt CV-galleri med över 74 exempel" | inaktuellt (tekniskt sant) | Galleriet har 89 CV-exempel. Skriv "89 exempel", eller stryk talet så att det inte åldras. | src/app/(public)/exempel/components/galleri-data.ts (CV_GALLERI, 89 poster) |

## Belagda påståenden
- CV-analysen ger en ATS-poäng (rad 276, 322). Källa: src/app/(public)/verktyg/cv-analys/layout.tsx och page.tsx.
- /verktyg/cv-mallar, /verktyg/skapa-cv och /verktyg/cv-analys finns som rutter.
- Omvänd kronologisk ordning som standard och PDF som format är vedertagna råd, inga sakpåståenden som behöver källa.

## Rättning (omgång 1, 2026-11-15)
- Rekryterarcitatet i `<CVExample title="Erfaren rekryterare om vad som avgör">` (rad 302–304): struket som citat och omskrivet till egen löptext: "Rekryterare letar efter vad du faktiskt har åstadkommit, inte bara vad du har varit "ansvarig för". Resultat, siffror och konkreta exempel säger mer än en lista med ansvarsområden."
- "6–10 sekunder" (rad 296): rättat till 7,4 sekunder enligt Ladders ögonrörelsestudie (2018), med länk till studien i meningen.
- Gratis CV-analys (rad 290, 370): rättat. Gratisanalysen beskrivs nu som att den visar poängen och det viktigaste att åtgärda; den fullständiga genomgången anges ingå i Jobbcoach Premium.
- ATS "sortera bort dig" (rad 44): struket; meningen säger nu att informationen kan läsas in fel eller hamna i fel fält.
- Checklistans resultat (rad 283): "20–24 kryssade" rättat till "20–25 kryssade" (25 punkter).
- "över 74 exempel" (rad 33): talet struket, länktexten är nu "CV-galleri med exempel från en lång rad yrken" så att den inte åldras.
- updated: "2026-11-15" tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden berördes inte och gjordes inte om. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
GODKÄND. Ladders 2018 med 7,4 sekunder stämmer (Ladders pressmeddelande 2018 och studiens PDF), rekryterarcitatet är borttaget och ersatt av egen text, ATS-meningen säger bara "läses in fel eller hamnar i fel fält", checklistan har 25 punkter och "20–25" stämmer, och gratisanalysen beskrivs som i src/app/(public)/priser/page.tsx rad 158 ("visar din poäng och det tyngsta fyndet"), fullständig analys i Premium (cv_analysis_full i src/lib/access/features.ts). Inga talstreck i ändrade rader, inga veckopaket, ingen jämförelse mot annons.

## Svar till samordnaren
hur-ska-ett-cv-se-ut, GODKÄND: inga brister.
