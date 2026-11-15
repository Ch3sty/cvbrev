# Faktagranskning: content/artiklar/cv-profil-sammanfattning.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, artikeln är råd och tydligt märkta exempelprofiler; en Arbetsförmedlingen-hänvisning saknar källa och CV-analysen beskrivs som en annonsjämförelse.

## Fynd att åtgärda
| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 47 | "Arbetsförmedlingen skriver i sina råd om CV:t att en kort sammanfattning ökar chansen att fånga arbetsgivarens uppmärksamhet snabbt" | obelagt | Ingen länk, och Arbetsförmedlingens CV-artikel från 2026-02-10 tar inte upp någon sammanfattning överst (den råder att lägga nyckelkompetenser tidigt). Arbetsförmedlingens äldre CV-guider går inte att nå (404). Länka till den exakta sidan eller skriv om utan Arbetsförmedlingen: "En kort sammanfattning överst gör att rekryteraren ser det viktigaste direkt." | https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2026-02-10-sa-skriver-du-ett-cv-som-far-ai-att-valja-dig |
| 362 | "Klistra in ditt CV och jobbannonsen i vår CV-analys, så ser du vilka nyckelord från annonsen som saknas i profilen" | fel (produkt) | CV-analysen tar bara emot CV:t, ingen annons; den jämför mot vanliga söktermer i branschen. Ersätt med: "Ladda upp CV:t i vår CV-analys, så ser du vilka viktiga branschord som saknas och var texten kan bli skarpare." Den som vill jämföra mot en viss annons hänvisas till jobbmatchningen eller brevverktyget. | src/app/api/cv/analyze/route.ts (tar bara cvId); /verktyg/cv-analys ("Vi jämför med vanliga söktermer i din bransch") |

## Belagda påståenden
- Systemnamnen i exemplen finns och används i respektive bransch: Cosmic och Take Care (vårdjournaler), Unikum (skola), Ongoing WMS (lager), Fortnox och Visma (redovisning), Heidenhain och Fanuc (CNC-styrsystem), Zendesk, HubSpot.
- Behörighetsbegreppen är korrekta: delegering för läkemedel, SBAR, truckkort A och B, YKB, ADR, CE-behörighet, heta arbeten, LOU, HACCP, CSRD.
- Exempelprofilerna är uttryckligen märkta "Siffrorna är exempel" (rad 81) och påstås inte vara verkliga personer.
- /verktyg/skapa-cv finns (rad 362).

## Rättning (omgång 1, 2026-11-15)
- Rad 47 (Arbetsförmedlingen-hänvisning): omskrivet utan Arbetsförmedlingen: "En kort sammanfattning överst gör att rekryteraren ser det viktigaste direkt."
- Rad 362 (CV-analysen med annons): rättat till att analysen visar viktiga branschord som saknas; jobbmatchningen tillagd (intern länk /verktyg/jobbmatchning) för jämförelse mot lediga jobb.
- updated tillagt. Bilden berördes inte. Inga rubriker, FAQ-frågor eller description ändrade.

## Andra granskningen (2026-11-15)
UNDERKÄND.
- Rad 362: H2 "## Testa din profil mot annonsen" står kvar ovanför ett stycke som nu (rätt) beskriver CV-analysen utan annons och jobbmatchningen mot lediga jobb. Rubriken lovar fortfarande en jämförelse mot annonsen som inget av de länkade verktygen gör (src/app/api/cv/analyze/route.ts tar bara cvId). Krävs: byt rubriken, till exempel "## Testa din profil innan du skickar", eller lägg till en mening om brevverktyget, som är det verktyg som läser annonsen.

Övrigt kontrollerat och godkänt: Arbetsförmedlingen-hänvisningen är borta, brödtexten om CV-analysen stämmer med produkten, inga talstreck.

## Rättning omgång 2 (2026-11-15)
- Rad 361, H2 bytt. Före: "## Testa din profil mot annonsen". Efter: "## Testa din profil innan du skickar". Stycket under (CV-analys utan annons, jobbmatchning mot lediga jobb, CV-verktyget) oförändrat. Inga ankarlänkar till den gamla rubriken hittades i content/ eller src/.
- Inga FAQ-frågor eller description ändrade. Rubriken citeras inte i artikelbildens underlag, bilden inte omgjord.

## Tredje kontrollen (2026-11-15)
GODKÄND. H2 rad 361 är nu "Testa din profil innan du skickar"; stycket under beskriver CV-analysen utan annons och jobbmatchningen mot lediga jobb. Inga ankarlänkar till den gamla rubriken i content/ eller src/. FAQ identiska, inga talstreck.
