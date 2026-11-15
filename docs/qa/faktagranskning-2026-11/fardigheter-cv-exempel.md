# Faktagranskning: content/artiklar/fardigheter-cv-exempel.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, 7,4 sekunder stämmer men studiens urval blandas ihop med 2012-versionen, listan med "50 mjuka" har 40, och CV-analysen beskrivs med en funktion den saknar.

## Fynd att åtgärda

| Rad | Citat ur texten | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 36 | "Enligt TheLadders ögonrörelsestudie från 2018, där 30 rekryterare följdes med eye-tracking" | obelagt | 2018-rapporten anger inte antalet rekryterare; "30 rekryterare" kommer från 2012-studien (som gav 6 sekunder). Stryk "där 30 rekryterare följdes med eye-tracking". | https://www.theladders.com/career-advice/you-only-get-6-seconds-of-fame-make-it-count ; https://www.hrdive.com/news/eye-tracking-study-shows-recruiters-look-at-resumes-for-7-seconds/541582/ |
| 29, 600, 579 | "de flesta ATS-system letar efter ordagranna matchningar", "ATS-system letar efter exakta matchningar" | obelagt | Ingen källa för "de flesta". Arbetsförmedlingen skriver att ATS "prioriterar ansökningar som använder samma begrepp som arbetsgivaren". Ersätt med den formuleringen. | https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2026-02-10-sa-skriver-du-ett-cv-som-far-ai-att-valja-dig |
| 34 | "saknar du rätt nyckelord kan du sorteras bort innan en människa hunnit titta, oavsett hur kvalificerad du är" | obelagt | Närmar sig ATS-myten (se "75 %"-myten, Preptel 2012). Många ATS rankar eller sorterar men avvisar inte automatiskt. Mildra: "saknar du rätt nyckelord kan du hamna längre ner i rekryterarens lista". | The Conversation 2026 / AF-länken ovan |
| 241 | "## 50 exempel på mjuka färdigheter (personliga)" | fel | Avsnittet listar 40 mjuka färdigheter (4 x 10). Ändra rubriken till "40 exempel" eller lägg till tio. (Hårda: 55 listade under "50 exempel", OK.) | Räkning i filen |
| 620 | "Du laddar upp CV och jobbannons, så visar vi exakt vilka nyckelord du saknar." | fel (produkt) | CV-analysen tar bara emot CV:t och bedömer mot målroll, inte mot en inklistrad annons. Ersätt med "Du laddar upp CV:t och får poäng och förslag på nyckelord för din målroll." | src/app/api/cv/analyze/route.ts; src/app/dashboard/cv-analys/components/steps/AnalysisOverviewStep.tsx |
| 633–634 | "60-70% hårda färdigheter / 30-40% mjuka färdigheter" | obelagt | Ingen källa; presenteras som norm. Skriv om som tumregel ("vår tumregel: övervägande hårda färdigheter") eller stryk procenten. | Ingen |

## Belagda påståenden
- Rekryterare lägger i genomsnitt 7,4 sekunder på en första genomläsning enligt Ladders eye-tracking 2018 (rad 29, 36): Ladders, länk ovan.
- Produktlänkar /verktyg/cv-mallar och /verktyg/skapa-cv finns (rad 647).
- CV-exemplen med siffror (t.ex. "minskade kundklagomål med 40%") är tydligt märkta mallformuleringar, inte påstådda verkliga fall. OK.

## Rättning (omgång 1, 2026-11-15)
- Rad 36 (obelagt): "där 30 rekryterare följdes med eye-tracking" struket. 7,4 sekunder och 2018 kvar.
- Rad 29, 579, 600 (obelagt): "de flesta ATS-system letar efter ordagranna/exakta matchningar" ersatt med Arbetsförmedlingens formulering att ATS "prioriterar ansökningar som använder samma begrepp som arbetsgivaren" (snabbsvaret anger Arbetsförmedlingen som källa).
- Rad 34 (obelagt): "sorteras bort innan en människa hunnit titta" mildrat till "hamna längre ner i rekryterarens lista".
- Rad 241 (fel): rubrik ändrad. Före: "## 50 exempel på mjuka färdigheter (personliga)". Efter: "## 40 exempel på mjuka färdigheter (personliga)".
- Rad 620 (fel, produkt): CV-analysen beskrivs nu som uppladdning av CV:t med poäng och förslag på nyckelord för målrollen; jämförelsen mot annonsen görs med artikelns steg. Länken kvar.
- Rad 633-634 (obelagt): procentsatserna strukna, omskrivet till "Vår tumregel: övervägande hårda färdigheter" och "Ett par mjuka färdigheter, helst visade genom resultat".
- Källrad skapad sist: Ladders 2018 via HR Dive, Arbetsförmedlingen 2026.
- `updated: "2026-11-15"` tillagt. Inga FAQ-frågor eller description ändrade. Bildunderlaget berördes inte, bilden inte omgjord.
- I den ändrade raden 600 byttes ett befintligt tankstreck ("– inte") mot kommatecken.

## Andra granskningen (2026-11-15)
GODKÄND. HR Dive återger Ladders 2018 med 7,4 sekunder och anger inget antal rekryterare, så strykningen av "30 rekryterare" är rätt. Arbetsförmedlingen skriver ordagrant "ATS-system prioriterar ansökningar som använder samma begrepp som arbetsgivaren"; formuleringen används nu i snabbsvar, rad 579 och rad 600. Listan under "40 exempel på mjuka färdigheter" har 40 punkter (4 x 10). CV-analysens beskrivning ("förslag på nyckelord för din målroll") motsvarar AnalysisOverviewStep ("efterfrågade kompetenser som matchar din målroll"); ingen annonsjämförelse påstås. Procentnormen 60-70/30-40 är borta. Källrad finns, talstrecket på rad 600 borta.

## Svar till samordnaren
fardigheter-cv-exempel, GODKÄND, inga brister.
