# Not: artiklarnas reklam (skiss `artikelreklam`)

Källa: `sidor/artikelreklam.html`, byggd till `ut/skiss-artikelreklam.html`. Bilder: `bilder/artikelreklam-375-*.png`, `-412-*`, `-1440-*`.
Egna delfiler: `delar/artikelreklam-kort-tester.html`, `-kort-analys.html`, `-kort-brev.html`, `-kort-jobb.html` (de fyra rutorna) och `delar/artikelreklam-ram-stor.html` (testets ram i slutkortet).
Kod: `src/components/artiklar/reklam/ArtikelReklam.tsx`, `TypProvKort.tsx`, `reklam-copy.ts`, `src/components/publikt/innehall/ArtikelHjalte.tsx`, `innehall.css` (`.ib-prova`, `.ib-black`), `src/lib/cta/clusters.ts`.

Skissen har två delar. Överst en artikelsida (Matrigma test) med menyn, toppen, två stycken, rutan för tester där den står i dag, sidokolumnens kort och slutkortet. Under den skissblad med rutan i sina fyra färger, var och en med ett stycke ur en riktig artikel, i artikelspaltens bredd (788 px) och i telefonbredd (375 px). I telefonbilderna visas bara telefonbredden.

## Vad som ändras mot i dag

1. **Rutan efter andra stycket** (`InlineKort`, `ProvKort`). I dag ett ljust kort med vänsterkant och ett litet objekt eller matrisen. I skissen ett mörkt block i delens färg med klack: indigo för tester, petrol för CV-analys, plommon för personliga brev, skog för Jobbsöket. Ordningen i rutan: delens namn med ikon, rubriken, texten, raden om vad som är gratis i en egen ruta med bock, kopparknappen och Premium-raden. Till höger (på telefon mellan rubriken och texten) det riktiga verktyget i liten skala:
   - Tester: uppgiften i testets ram med klocka och sex svar.
   - CV-analys: Saras ark med nålarna, 93 av 100 och "7 poäng kvar till 100".
   - Personliga brev: brevet med två markerade krav, annonsens krav med bockar och "3 av 4 krav har fått svar".
   - Jobbsöket: en träff med matchgrad, sista ansökningsdag och "Därför passar du", och nästa träff bakom.
2. **Sidokolumnens kort** (`SidoPaketKort`): samma ord, i grundens Premiumfärg med klack, med testets klocka och stapel som bild.
3. **Slutkortet efter texten** (`SlutKort`): samma ord. De tre telefonerna med gamla skärmar byts mot testets ram i större skala och resultatet "12 av 15 rätt på expertnivån". Ritat för testartiklarna. CV- och brevartiklarnas slutkort får arket med 93 och brevet mot annonsen, Allt-vinkeln får träffen: samma instrument som i rutorna, större.
4. **Artikelsidans topp.** Menyn står i grafit. Toppen är ljus, i klustrets ljusa ton (här indigo), med samma innehåll som i dag: brödsmula, etikett, H1, ingress, knapp, "Läs guiden", författarrad och artikelbilden snett. Se beslut 1.

Artikelns egen typografi, rubriker, snabbsvar och innehållsförteckning är ritade som i dag och är inte ett förslag.

## Ordantal per kort

Räknat på kortens egna texter (etikett, rubrik, text, knapp, länk, Premium-rad). Bilderna är `aria-hidden` i skissen och räknas inte. Jag har inte mätt `TestBredd`-raden i dagens provkort; har den synlig text är dagens tal något högre.

| Kort | I dag | I skissen | Skillnad |
|---|---|---|---|
| Tester (`INLINE_PROVA`) | 81 | 79 | −2 (etiketten "Prova på riktigt" blir "Rekryteringstester") |
| CV-analys (`INLINE.analys`) | 47 | 53 | +6 (lydelserna i REK-1) |
| Personliga brev (`INLINE.brev`) | 49 | 56 | +7 (lydelserna i REK-2 ger +6, etiketten +1) |
| Jobbsöket (nytt kort) | 39 i coachkortet, som ligger närmast | 45 | nytt |
| Sidokortet (`SIDO.test`) | 46 | 46 | 0 |
| Slutkortet (`SLUT.test`) | 83 | 83 | 0 |

Inget kort tappar mer än två ord. CV-analysen och breven går sex och sju ord upp, ett och två ord över SEO:s ram på fem. Orsaken är de redan föreslagna lydelserna i textspåret, inte formen.

## Oförändrat för SEO

- Rutornas rubriker är stycken, aldrig h2 eller h3. Instrumenten har inga rubriker och är `aria-hidden`.
- Länkmålen står kvar: provet och testsidan (två länkar i testkortet), /verktyg/cv-analys, /skapa-brev/start, /priser.
- Artikelns H1, H2, snabbsvar, författarens namn (h3 i dag) och bilden med samma alt-text rörs inte.
- Mätningen (`data-cta-position`, `data-cta-klick`) berörs inte av formen.

## Rubriker och påståenden som bytts

| Kort | I dag | I skissen | Källa |
|---|---|---|---|
| Tester | "expertfrågor", "Fem frågor gratis här", knappen "Prova fem frågor" | "expertuppgifter", "Fem uppgifter gratis här", "Prova fem uppgifter" | Ordlistan i briefen: uppgift, inte fråga |
| CV-analys | "Poängen och det tyngsta fyndet är gratis." | "Läsbarhetspoängen och genomgången i sju delar är gratis, för varje CV." | REK-1 |
| CV-analys | "Hela analysen med varje fynd och åtgärd ingår i Premium" | "Alla förslag från Jobbcoachen, och nya efter varje ändring, ingår i Premium" | REK-1 |
| Personliga brev | "Ett personligt brev var sjunde dag att läsa på skärmen, gratis." | "Ett personligt brev var sjunde dag är gratis, och de två senaste går att ändra." | REK-2 |
| Personliga brev | "som PDF" | "som PDF eller Word" | REK-2 |
| Sidokortet | "Fem frågor gratis här." | "Fem uppgifter gratis här." | Ordlistan |
| Hjältens knapp | "Prova fem frågor gratis" | "Prova fem uppgifter gratis" | Ordlistan |

Jobbsökets kort är nytt: "Se vilka annonser som passar ditt CV", "Vi läser ditt CV och söker bland annonserna i Platsbanken. Varje träff visar varför du passar.", "Tre träffar är gratis, med skälen utskrivna.", knappen "Hitta jobb gratis", "De 25 bästa träffarna ingår i Premium, 149 kr i månaden."

## Det som kräver beslut

1. **Toppen: ljus eller vägg.** I dag står artikelns topp på en mörk vägg i klustrets färg (`ArtikelHjalte`, `yta="vagg"`). Uppdraget bad om menyn på en ljus artikelsida, så skissen ritar toppen ljus och menyn i grafit. Det är en ändring av hjälten, inte bara av menyn. Sista skissbladet visar det andra valet: väggen står kvar och menyn tar klustrets färg, som på verktygssidorna. Ägaren väljer.
2. **Jobbsökets kort finns inte i dag.** Intervjuartiklarna har provkortet, karriärartiklarna räknarna eller länkraden, och coachkortet står på en enda artikel. Förslag: kortet står i artiklarna om att söka jobb (till exempel `soka-jobb-via-mail`, sajtens mest visade artikel, som enligt klusterreglerna får mallkortet i dag). Räknarkortet och länkraden står kvar där de står, så att inga länkar försvinner. Var kortet ska stå är saas-leads och SEO:s beslut. Det ger fler ord, inte färre.
3. **Träffen eller Sökta tjänster.** Jag valde träffen (tre gratis, med skälen). Sökta tjänster är gratis för alla och passar artiklarna om uppföljning bättre. Ett femte kort med vägen från Ska sökas till Erbjudande går att rita i samma form.
4. **Rutan på telefon är nästan en skärm hög** (ungefär 700 px för tester). Knappen syns efter en rullning. Vill man ha knappen högre kan bilden krympas eller läggas sist.
5. **Mörk ruta i ljus artikel.** Rutan är avsiktligt artikelns starkaste yta. Tre rutor finns per artikel (rutan, sidokortet, slutkortet) och alla är mörka. Blir det för mycket kan sidokortet göras ljust.
6. **Övriga kort är inte ritade:** mallkortet (`INLINE.mallar`), coachkortet, räknarkortet, länkraden, de fem `TypProvKort`, intervjuartiklarnas provkort, gratiskortet och listans slutkort. De följer samma form: delens färg, verktyget i bild, gratisraden, en knapp. Mallkortet bör visa riktiga mallminiatyrer.
7. **Matrisen i skissen** är ritad för hand efter texten (form, tecken, fyllning). Bygget ska använda den riktiga expertuppgiften (`MatrisExpert`), som i dag.
8. **Träffens tal** (91 och 86) är exempel på matchgraden som visas i Matchade jobb.

## Filer bygget rör

- `src/components/artiklar/reklam/ArtikelReklam.tsx` (`InlineKort`, `ProvKort`, `SidoPaketKort`, `SlutKort`, `Telefoner` utgår)
- `src/components/artiklar/reklam/TypProvKort.tsx` (samma form)
- `src/components/artiklar/reklam/reklam-copy.ts` (etiketter, gratisraden som eget fält, det nya kortet) och dess test
- `src/components/publikt/innehall/innehall.css` (`.ib-prova`, `.ib-black`, `.ib-gratis`)
- `src/components/publikt/PremiumBlock.tsx` (bilden i slutkortet)
- `src/lib/cta/clusters.ts` om Jobbsökets kort får en plats (`InlineVerktyg`)
- `src/components/publikt/innehall/ArtikelHjalte.tsx` och menyn om toppen blir ljus
- `scripts/seo-diff-artiklar.ts`: ny baslinje före bygget, ordantalen ovan

## Förslag till grunden

- Artikelspaltens typografi (`.art`) och artikelns topp bör ligga i kit.css. Två skisser har nu var sin kopia (den här och `brev-artikel`).
- Rutan (`.rk` med `.rkhall` som behållare) bör ligga i grunden om fler skisser ska visa den. Den bryter på behållarens bredd (620 px), inte på fönstrets, så att samma ruta fungerar i spalt, sidokolumn och telefon.
- Grundens `.svav .stor`, `.nal` och arkets textstorlekar följer fönstrets bredd. I små instrument måste de sättas om för hand. En liten variant (`.ark.liten`) skulle spara det.
- `brev-artikel` ritade en egen plommonruta för breven. Den här skissens brevruta ersätter den, enligt deras not.
