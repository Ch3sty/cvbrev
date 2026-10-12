# Figurserier, granskning 03

Datum 2026-10-12. Granskare: testansvarig. Underlag: `omgang3/ATT-GRANSKA-omgang3.md`, `omgang3/lista.json`, de tio PNG i `omgang3/expert/` och kandidatfilen `src/lib/figurserierV1/kandidater/expert.json`. Facit räknat för hand på alla tio (båda serierna i F7, steg, cykler, start och antal per figur, och för antal-frågorna även läsningen via sista sektorn eller strecket). Distraktorstrukturen läst ur kandidatfilen och kontrollerad mot bilderna. Bara expert ändras; grund (36) och avancerad (30) står som i granskning 02.

## 1. Utfall

| Granskade | Ja | Nej | Godkända expert efter detta |
|---|---|---|---|
| 10 | 8 | 2 | 32 |

Facit: rätt i alla tio. Konstanterna som gratis kontroll (F6): borta i vaxl-01, 03 och 07 (noll konstantbrott), hanterad i vaxl-05 (avsnitt 3). Unik rad (F7): alla sex nya rader är unika inom expert, också mot de godkända från 01 och 02. Antal i steg, aldrig cykel (F8): alla fyra antal-frågor har steg plus eller minus ett, och läsningen via första och sista sektorn eller strecket ger samma facit i alla fyra. G1, G2, G4, G11 och G12 i `v7-geometri-check --serie` utan fel enligt kedjan, och bilderna visar inget som skriptet missar: inga nålar, en kantprick per figur, inga tomma figurer, inga kärnprickar.

**Expert når golvet 28 med marginal (32 av 28). Figurserier kan lanseras på alla tre nivåer efter befordran**, med ett villkor på en misstagstext (avsnitt 4, antal-04).

## 2. De fyra ombyggda (vaxl-01, 03, 05, 07)

Raden och id står, bara alternativen är nya. Kontroll per fråga: facit, att inget alternativ delar facits båda regelvärden, att konstanten inte ensam fäller fler än kriteriet tillåter, och att varje regeldimension har en nära miss bland de rena.

| Id | Facit | Konstantbrott | Nära miss bland de rena | Bedömning |
|---|---|---|---|---|
| fs-e-vaxl-01 | E (45 grader, lång, öppen) | 0 av 5 | vinkel C och F, spets B | Båda reglerna behövs: tre vinklar gånger två spetsar, ett alternativ per kombination. Ja. |
| fs-e-vaxl-03 | C (läge 6, cirkel, svart) | 0 av 5 | läge A och D, form E | D är "som i fjärde figuren", E rätt läge fel form. Ja. |
| fs-e-vaxl-05 | B (270 grader, kort, fylld) | 3 av 5 (C, D, E öppna) | vinkel A, längd F | Den som stryker de öppna står med A, B, F och måste pröva både vinkel och längd. Samma kriterium som vaxl-09. Ja, se avsnitt 3. |
| fs-e-vaxl-07 | B (läge 1, cirkel, ofylld) | 0 av 5 | läge A och F, form C | Ja. |

Misstagstexterna stämmer mot alternativen i alla fyra (kontrollerade per bokstav).

## 3. Ställningstagande: tre konstantbrott i vaxl-05

Generatorns krav är högst två konstantbrott; vaxl-05 har tre, och Opus C har räknat uttömmande att ingen kombination med högst två klarar S5 och S6 inom den nåbara mängden. Jag köper avvikelsen för vaxl-05 och tar den som regel framåt, med en precisering:

- **Kriteriet som avgör är inte antalet konstantbrott utan vad som står kvar när konstanten är kollad.** Bland de rena ska varje regeldimension ha en nära miss som bryter bara den. vaxl-05 (A vinkel, F längd) och vaxl-09 (A längd, E vinkel) klarar det. De fyra i granskning 02 föll på just det, inte på antalet.
- Avvikelsen är strukturell, inte tillfällig. Med exakt ett konstantbrott blir det alternativet eliminerbart (S6 tillåter inget på expert). Med två bryter facits värde majoriteten i konstantdimensionen om S11 räknas där. Och noll kräver fem rena som inte kopierar radens figurer och har vinklar i par (S6 på vinkel när F delar facits vinkel); i vaxl-05 finns bara fyra sådana i den nåbara mängden (0 kort, 180 lång, 90 lång, 270 lång). Därför blir utfallet noll eller tre, aldrig ett eller två. Regeln bör skrivas så: **noll konstantbrott i första hand, tre när raden inte ger fem rena, aldrig ett eller två.** "Högst två" beskriver inte vad generatorn faktiskt kan leverera.
- Tre konstantbrott på expert är en svaghet att bevaka, inte ett fel: den som kollar konstanten står med en av tre och behöver fortfarande båda reglerna. Om vi ser i klicktestet att vaxl-05 och vaxl-09 löses markant snabbare än vaxl-01 och 03, är det konstanten som läcker och raden ska bytas till en med fler rena.
- Kravet gäller bara expert: rätt. På avancerad har F5 en regel och den nåbara mängden för få rena; där gör konstantbrott ingen skada eftersom frågan inte påstår två regler.

Det här är min läsning av spärrarna, inte en körning; om S11 inte räknar konstantdimensioner finns tvåbrottslösningar (till exempel 0 kort fylld, 0 lång öppen, 180 lång fylld, 180 kort öppen, 270 lång fylld) och då ska de föredras. Opus C avgör med en körning.

## 4. De sex nya

### Antal (fs-e-antal-04, 05, 06, 07)

Alla fyra är F7 med start växelvis och antal i steg, som beställt i granskning 02 (F8). Läsningen via sista sektorn eller strecket ger i alla fyra samma facit som läsningen via första, vilket var poängen med steg i stället för cykel.

| Id | Rad (start, antal) | Facit | Nära miss start | Nära miss antal | Bedömning |
|---|---|---|---|---|---|
| fs-e-antal-04 | 2,2 / 2,3 / 4,4 / 1,5 / 6,6 | C (start 0, sju sektorer, vit sektor uppe till vänster) | B (ett steg för långt) | E | Ja, med villkor: **misstagstexten för A är fel.** A har start 6 (som den femte figuren), inte "som i den fjärde figuren" (fjärde har start 1). Texten ska vara "De svarta sektorerna står som i den femte figuren" eller motsvarande. Rättas före befordran. |
| fs-e-antal-05 | 3,2 / 4,3 / 4,4 / 7,5 / 5,6 | C (start 2, sju streck, lucka uppe till höger) | B | D | Ja. Antalsvärdena bland distraktorerna sprids (5, 7, 3, 5, 3). Texter stämmer. |
| fs-e-antal-06 | 2,6 / 3,5 / 3,4 / 1,3 / 4,2 | B (en sektor, läge 7) | D | E (inte minskat) | Ja. Texter stämmer. Regeltexten "den sista svarta sektorn medurs blir vit" beskriver inte figur ett till två (där försvinner den första, eftersom tvåan hör till andra serien); copywritern putsar efter befordran, se avsnitt 5. |
| fs-e-antal-07 | 0,2 / 4,3 / 3,4 / 6,5 / 6,6 | B (start 0, sju streck, lucka uppe till vänster) | A (följer fel serie) | D | Ja. Texter stämmer. |

Svaghet i hela antal-familjen på expert, inte fällande: antalsregeln är trivial att kolla (räkna svarta eller streck), så två eller tre av fem distraktorer försvinner i ett svep och det som återstår är startregeln. Frågan mäter växelvis start med antal som störning. Det är vad F7 med antal kan ge, och det är tydligt svårare än avancerad (F4 med en serie). I antal-04 är dessutom antalsbrotten två sektorer mot sju, grovt; en nära miss hade varit sex (inte vuxit). Bevakas i klicktestet; om antal-frågorna på expert ligger nära avancerads lösningsgrad byts antalsbrotten till nära missar.

### Flera regler (fs-e-flera-05, 06)

Facit rätt i båda, raderna unika, bilderna rena. Men båda stryks, av samma skäl som F5 i granskning 01: **regeln som ger frågan dess expertnivå behövs aldrig.**

- **fs-e-flera-05** (orbital, steg som växer 1, 2, 3, 4, 5; form romb, cirkel, kvadrat; fyllning ofylld, svart). Läge och form bryts av exakt samma fyra alternativ (B, C, E, F). Den som ser fyllningsväxlingen och formcykeln, de två enkla reglerna, landar på A utan att titta på pricken. Det växande steget, det enda som är expert i frågan, är överflödigt. Bara D är nära miss (fyllning).
- **fs-e-flera-06** (kant, växelvis tre steg moturs och ett medurs; samma form- och fyllningscykler). Läge och fyllning bryts av exakt samma tre alternativ (A, B, D). Fyllning plus form (C, F är nära missar på form) ger E; den växelvisa lägesregeln behövs aldrig.

ATT-GRANSKA säger att de är byggda efter rekommendationen i granskning 02, 5.5 (en nära miss per regeldimension). Det stämmer inte: flera-05 har nära miss på en dimension, flera-06 på en. Jag kan inte fälla på en rekommendation, men jag kan fälla på att den svåra regeln är redundant, för det är exakt det F5 handlade om. Raderna står (de är bra rader), så ersättarna kan bygga om alternativen med samma id om Opus C hellre gör det än ger nya löpnummer: kravet är en ren nära miss per regeldimension, så att läge, form och fyllning var och en skiljer facit från minst ett alternativ som är rätt i allt annat. Det är inte blockerande: flera-familjen har flera-03 kvar och expert når golvet ändå.

Att de två tidigare F6-tre som godkändes i 01 och 02 också kan lösas med två regler står kvar som "inte retroaktivt". Skillnaden mot flera-05 och 06 är att det där inte är den svåra regeln som är redundant, och att de redan sitter i banken. Nästa F6-omgång på expert ska ha en nära miss per dimension som krav, inte rekommendation.

## 5. Vad generatorn och texterna ska ändra

1. **Konstantbrott:** noll i första hand, tre när raden inte ger fem rena, aldrig ett eller två (avsnitt 3). Bara expert.
2. **F6 med tre regler på expert:** en ren nära miss per regeldimension som krav. `v7-distraktor-check --serie` ska fälla flera-05 och flera-06 i nuvarande skick.
3. **Misstagstext antal-04 A** rättas före befordran (avsnitt 4).
4. **Regeltext för antal i F7:** "en sektor till blir svart medurs" och "den sista svarta sektorn blir vit" gäller inom en serie, inte mellan figur ett och två. Copywritern skriver om till något i stil med "Antalet svarta sektorer ökar med en i varje figur, och gruppen hänger ihop medurs från sin startsektor." Efter befordran, inte före.
5. **Antalsbrott på expert:** nära miss (ett för lite eller ett för mycket) i stället för startvärdet, när poolen tillåter.

## 6. Beslut per id

| Id | Beslut | Skäl |
|---|---|---|
| fs-e-vaxl-01 | ja | noll konstantbrott; nära miss vinkel C och F, spets B |
| fs-e-vaxl-03 | ja | noll konstantbrott; nära miss läge A och D, form E |
| fs-e-vaxl-05 | ja | tre konstantbrott, men A och F är rena nära missar på var sin regel, som vaxl-09 |
| fs-e-vaxl-07 | ja | noll konstantbrott; nära miss läge A och F, form C |
| fs-e-antal-04 | ja, villkor | facit C rätt, båda läsningarna sammanfaller; misstagstext A rättas före befordran |
| fs-e-antal-05 | ja | facit C, B och D nära missar, antalsvärden spridda |
| fs-e-antal-06 | ja | facit B, D och E nära missar |
| fs-e-antal-07 | ja | facit B, A fel serie, D antal |
| fs-e-flera-05 | nej | läge och form bryts av samma fyra alternativ; det växande steget behövs aldrig (F5) |
| fs-e-flera-06 | nej | läge och fyllning bryts av samma tre alternativ; den växelvisa lägesregeln behövs aldrig (F5) |

Expert efter befordran: 24 godkända sedan tidigare plus 8 här, 32 av golvet 28. Alla sju familjer finns (flera genom flera-03). F6 19 mot mallens 20 och F7 13 mot 10, upplysning enligt kedjan.

## 7. Data mot bedömning

Data: facit, serier, starter, antal och vilka dimensioner varje alternativ bryter är räknade ur kandidatfilen och stämda mot bilderna. Bedömning: att redundans i den svåra regeln är fällande på expert (F5, avsnitt 4), att tre konstantbrott är godtagbart när de rena bär båda reglerna (avsnitt 3), och läsningen av varför generatorn landar på noll eller tre (avsnitt 3, inte körd). Prövbart i klicktestet: lösningstid och lösningsgrad för vaxl-05 och 09 mot vaxl-01 och 03, och för antal-familjen på expert mot avancerad.
