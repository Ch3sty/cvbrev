# Granskning deduktiv slutledning, kandidater 02

Datum 2026-10-12. Granskare: testansvarig. Underlag: `src/lib/deduktivV1/kandidater/grund.json` (id dd-g-d2-07 till dd-g-d2-11, ersättarna enligt V5 i beslut-01) och sidorna i `docs/qa/omgang3-f/deduktiv/`. Beslut i `beslut-02.json`. Samma krav som i granskning-01: entydig svenska, exakt en lösning, rimliga distraktorer, ingen genväg, lösningsgång i mer än ett steg utan steg med tre villkor, rätt grundsvårighet.

Så här granskade jag. Alla fem löstes för hand mot den svenska texten. För varje uppgift räknade jag antal lösningar med alla villkor och med ett villkor i taget borttaget, sanningsvärdet för alla fem alternativ i schemat, minsta villkorsmängd som ger facit, och för varje distraktor om det villkor misstaget pekar på går att bryta ensamt så att distraktorn blir sann, samt om det är den nära miss som flyttar färst element (V2).

## 1. Uppgift för uppgift

| id | schema | facit | lösningar utan villkor 1 / 2 / 3 | steg | minsta villkorsmängd för facit |
|---|---|---|---|---|---|
| dd-g-d2-07 | Viktor, Hugo, Mats, Olle | A Mats direkt till vänster om Olle | 4 / 2 / flera | 2 (villkor 1, sedan 2 och 3) | alla tre |
| dd-g-d2-08 | Röd, Svart, Grön, Lila | B Svart direkt till vänster om Grön | 2 / flera / flera | 3 (3, 2, 1) | alla tre |
| dd-g-d2-09 | Åsa, Filip, Sven, Cilla | C Filip på plats 2 | 2 / 2 / flera | 3 (3, 1, 2) | alla tre |
| dd-g-d2-10 | Röd, Svart, Blå, Lila | D Röd direkt till vänster om Svart | 2 / flera / 2 | 3 (2, 3, 1) | alla tre |
| dd-g-d2-11 | Karin, Hugo, Dan, Ulla | E Karin inte bredvid Ulla | flera / 3 / flera | 2 (villkor 1, sedan 2 och 3) | villkor 1 och 3 |

Alla fem har exakt en lösning med alla villkor, och inget villkor är överflödigt för schemat (DD2). Exakt ett alternativ är sant i schemat i alla fem, och de fyra andra strider mot villkoren, så etiketterna stämmer. Svenskan är entydig: "direkt till vänster om", "någonstans till vänster om", "bredvid", "inte bredvid", "ligger på plats", med olika begynnelsebokstäver i alla uppgifter. Inga talstreck.

**Lösningsgången** uppfyller V5 i alla fem: ett plats-villkor låser först och inget steg citerar tre villkor. 08, 09 och 10 är de bästa, tre steg med ett villkor i varje, där steget i 09 "Cilla står inte bredvid Filip, det låser Sven på plats 3" är precis den sortens slutsats grund ska lära ut (två som inte får stå bredvid varandra på tre platser i rad måste ta ytterplatserna). 07 och 11 tar de två sista villkoren i ett gemensamt steg som låser tre platser. Det är godtagbart på grund, men svagare som undervisning; se punkt 3.

**Misstagen** pekar i alla 20 fall på ett villkor som verkligen är en nära miss, och i alla fall jag räknade är det, eller delar det, minsta antalet flyttade element (V2 följd). I 08 pekar alla fyra på villkor 1 och i 09 likaså; där är det korrekt, eftersom bytet av de två sista elementen är den enda tvåflyttsmissen.

**Svårighet.** Fyra element, tre villkor, ett plats-villkor som startpunkt: rätt för D2 på grund. p_prior 0,55 är rimlig; 08 och 10 är nog något lättare än 07 och 09 eftersom kedjan går rakt uppifrån och ned. Kalibreringen avgör.

## 2. Beslut

Alla fem godkänns. Grund går från 25 till 30 (24 D1, 6 D2). Inget stryks, inga nya villkor för befordran. Två iakttagelser nedan gäller omgång 4, inte den här befordringen, eftersom samma mönster finns i de 30 avancerade uppgifter som redan är godkända och regeln då måste gälla hela banken på en gång.

## 3. Till omgång 4, inga villkor nu

**Alternativ som följer ur varandra.** I "måste vara sant" kan ett alternativ som logiskt medför ett annat alternativ aldrig vara det enda rätta svaret, oberoende av villkoren. En provvan kandidat stryker det utan att lösa. Det förekommer här: 09 E (Sven direkt till vänster om Filip) medför D (Sven någonstans till vänster om Filip); 10 B (svart på plats 1) och E (svart direkt till vänster om röd) medför båda C (svart någonstans till vänster om röd); 11 D (Karin direkt till vänster om Dan) medför C (Dan bredvid Karin). I 10 faller därmed två av fyra distraktorer för den som läser alternativen mot varandra. Förslag till DD3: inget alternativ får medföra ett annat alternativ utan hjälp av villkoren. Gäller sannolikt flera av de godkända avancerade måste-uppgifterna; kör kontrollen över hela banken innan regeln införs.

**Facit som inte behöver alla villkor.** I 11 följer facit "Karin står inte bredvid Ulla" ur villkor 1 och 3 ensamma: med Dan på plats 3 och Hugo någonstans till vänster om Ulla hamnar Karin aldrig bredvid Ulla i någon av de tre lösningarna. Villkor 2 behövs för schemat men inte för svaret. Spärren i granskning-01 (facit följer inte ur ett enda villkor) klaras, och på grund med tre villkor är det en liten genväg som ingen hittar utan att först pröva E. Föreslår ändå en skarpare regel för D2 i omgång 4: minsta villkorsmängd för facit ska vara alla villkor när uppgiften har tre, och minst alla utom ett när den har fyra eller fler.

**Steg med två villkor på grund.** 07 och 11 avslutar med "Tillsammans låser de X på 1, Y på 2 och Z på 3". Det går att dela: i 07 ger villkor 3 med Olle låst att Hugo står på plats 1 eller 2, villkor 2 tar bort plats 1, och resten följer. Föredra generatorns enkelsteg när det finns en sådan väg, även om det kräver ett "kvar"-steg av samma slag som V1 införde.

## 4. Utfall mot golvet

| Nivå | Före | Godkända nu | Strukna | Efter |
|---|---|---|---|---|
| Grund | 25 | 5 | 0 | 30 (24 D1, 6 D2) |

Befordra med `node scripts/befordra-deduktiv.mjs` över beslut-01 och beslut-02 i ordning; V3-diffen för de 25 redan godkända ska fortfarande vara ren.
