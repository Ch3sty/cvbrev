# Granskning: deduktiv slutledning, bankversion 3 (2026-11-19)

Testansvarig. Alla 100 nya uppgifter lästa, verifieraren och validatorn körda på nytt (211 av 211 bevisade, 0 fel). Bankerna är inte ändrade.

**Beslut: godkänt med villkor.** Punkt 1 till 6 rättas före aktivering (fyra textändringar, två utbyten). Övriga 94 uppgifter godkänns som de står. Punkt 7 till 10 är anmärkningar till nästa omgång, inget hinder.

## Rättas före aktivering

| # | Id | Problem | Föreslagen rättelse |
|---|---|---|---|
| 1 | dd-g-d1-51 | Tolkningslucka. Facit "Äppelkakan är inte från bageriet" följer bara om äppelkakan är en dessert; premiss 2 gäller "desserter från bageriet". Lösaren ser inte luckan, kandidaten gör det. | Premiss 2: "Allt som kommer från bageriet innehåller nötter." |
| 2 | dd-g-d1-47 | Tolkningslucka. Premiss 1 gäller bärbara datorer "på kontoret"; mötesrummen sägs inte ligga på kontoret. Då följer varken facit C eller att B strider. | Stryk "på kontoret" i premiss 1. |
| 3 | dd-g-d1-35 | Alternativ B "Någon läkare arbetar med vaccinationer" märkt "strider", men bara läkare på mottagningen har telefontid. En läkare någon annanstans kan vaccinera. | "Någon läkare på mottagningen arbetar med vaccinationer." |
| 4 | dd-g-d1-53 | Språk. "Alla tolkarna på förmedlingen" är talspråk. | "Alla tolkar på förmedlingen tolkar i domstol." |
| 5 | dd-g-d2-20, dd-g-d2-21 | Nästan-dubbletter: samma struktur (kedja a före b före c, en fast på plats 4), bara namn och objekt skiljer. dd-g-d2-18 är spegelbilden (fast på plats 1). Tre av åtta nya grund-D2 är alltså ett och samma pussel. | Byt ut 21 mot ett pussel i familjen granne eller inte_plats, som grund-D2 bara har en av vardera. |
| 6 | dd-a-d2-53, dd-a-d2-73 | Nästan-dubbletter: "A och B samma dag, B på plats 6, A före C, kedja D före E före F, vem står på plats 3", svaret är F i båda. | Byt ut 73 mot ett pussel med annan fråga (plats 1 eller "måste"). |

## Anmärkningar, inget hinder

7. **Svårighet.** Grund-D2 (fyra platser, tre villkor) har samma p_prior 0,55 som avancerad-D2 (fem platser, fyra till fem villkor). Det följer dagens bank, så jag ändrar inte nu, men grund-D2 bör ligga runt 0,62 vid nästa kalibrering. Frågestatistiken tar över från 30 svar. D1 0,75 och D3 0,40 är rimliga.
8. **Variation.** Expert har inte_plats i 10 av 25 och avancerad direkt_vanster_om i 13 av 37; expertens pärmuppgifter 42, 48, 54 och 60 bygger alla på tre "ligger inte på plats". Nästa omgång bör väga upp granne, samma_grupp och rorelse. D1-scenarierna är varierade och vardagliga; inga varumärken, inga stereotyper, namnen är neutrala.
9. **Misstagstexterna** i vem-frågorna ("Bryter mot ett villkor: ...") kontrolleras inte av verifieraren, bara facit. Stickprov (49, 55, 61) håller. Förslag: låt verifieraren pröva att det citerade villkoret faktiskt bryts när alternativet sätts på den efterfrågade platsen.
10. **Grund-D2 bara "måste"-frågor**, avancerad bara "måste" och "vem". Fint för nivåtrappan.

## Säkert att höja DEDUKTIV_VERSION till 3

Ja, efter rättelserna. Kontrollerat i koden:

- **Pågående sessioner.** Nivåkoll, deduktivpass och övningsprov sparar uppgifternas id i `meta.fragor` och slår upp dem med `hittaDeduktivFraga` över alla versioner. De klassiska testen räknar fram urvalet ur `poolFor(niva, deduktivVersion(session.meta))`, och versionen skrivs vid start. Inga pågående sessioner byter frågor.
- **Nya sessioner** får version 3 i alla fem motorer (`fragor.server.ts`, `pass-deduktiv.server.ts`, `nivakoll`, `ovningsprov`, `prov-typer`), eftersom alla läser `DEDUKTIV_VERSION`.
- **Kalibrering.** Ingen kalibreringsfråga finns för deduktivt, så inget bryts. Nya id börjar utan rader i `fraga_statistik` och Nivåkollen använder p_prior till 30 svar.
- **Två tester måste ändras samtidigt:** `version2.test.ts` rad 41 (`toBe(2)`) och `ovningsprov/__tests__/deduktiv.test.ts` rad 30 (`poolFor(..., 2)` till `DEDUKTIV_VERSION`).
- **Percentilen** för de klassiska deduktiva testen delas inte per bankversion (det gör bara matris). Version 2 och 3 blandas i "Var du står". Godtagbart eftersom svårighetsprior och format är desamma, men det bör stå i changelogen.
