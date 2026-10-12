# Granskning deduktiv slutledning, kandidater 01

Datum 2026-10-12. Granskare: testansvarig. Underlag: `docs/qa/omgang3-f/deduktiv/index.html` med en sida per uppgift, kandidatfilerna `src/lib/deduktivV1/kandidater/grund.json`, `avancerad.json`, `expert.json`, generatorn i `scripts/lib/deduktiv/` (särskilt `forklaring.mjs` och `losare.mjs`). Beslut i `beslut-01.json`. Villkoren i beslutsfilen ska vara införda innan `befordra-deduktiv.mjs` körs.

Så här granskade jag. Utöver läsning av alla 84 sidor skrev jag en egen uttömmande lösare (annan kod än Opus, samma villkorsspråk) och körde den på alla 60 schemapussel: antal lösningar med och utan antagande, facit mot schemat, varje distraktors sanningsvärde, DD2 per villkor, minsta villkorsmängd som ger svaret, nära missar per distraktor och om misstagets villkorsnummer är en nära miss, samt varje stegs påstådda lås mot de villkor steget citerar. För D1 körde jag en egen mängdmodell (tre individer i universum, med och utan existensläsning) mot alla 96 alternativ. Jag löste dessutom alla 24 D3 och tolv D2 för hand mot den svenska texten, för att se att orden betyder det lösaren räknar på.

## 1. Vad som håller

- **Facit och entydighet.** Alla 36 D2 har exakt en lösning, alla 24 D3 exakt en med antagandet och minst tre utan. Inget villkor är överflödigt. Mitt schema stämmer med remsan i alla 60. Alla 96 D1-alternativ får samma roll i min mängdmodell som i Opus (nödvändig, obestämd, omöjlig), med och utan existensläsning, och etiketterna följer rollerna.
- **Svenskan i villkoren.** "står bredvid", "står inte bredvid", "någonstans till vänster om", "direkt till vänster om", "går före", "går samma dag" med inledningen om måndag och tisdag: entydigt i alla 60. Inget "minst", "högst" eller "eller". Inga talstreck, inget "lätt". Begynnelsebokstäverna är olika i alla uppgifter, namnen klarar DV2.
- **Vem-frågorna.** Ingen av de 15 vem-uppgifterna låter sig besvaras utan alla villkor. Misstagen ("Ulla står på plats 2. Med Ulla på plats 1 bryts villkor 1: ...") pekar i alla fall på ett villkor som faktiskt är en nära miss, och alla distraktorer är nära missar.
- **D1:s misstag och lösningsgång**, skrivna för hand, är korrekta och lagom korta. Tre varianter av distraktor (omvänd premiss, "några, inte alla", omöjlig) varieras väl över de 24.

## 2. Strukna

**Fyra D3 där antagandet plus ett enda villkor ger svaret.** Beställningens tillägg till DD1 (facit följer inte ur ett villkor) gäller D2; Opus läste det inte på D3, och generatorn släppte igenom fyra uppgifter som en expertkandidat löser genom att läsa ett villkor:

| id | genvägen |
|---|---|
| dd-e-d3-04 | Maja på plats 4 och villkor 6 (Maja direkt till vänster om Olle) ger Olle på 5, så "Olle står på plats 6" är omöjligt. |
| dd-e-d3-16 | Eva på plats 1 och villkor 4 (Eva direkt till vänster om Carl) ger Carl på 2, så "Carl står på plats 4" är omöjligt. |
| dd-e-d3-20 | Åsa på plats 2 och villkor 3 (Lisa går före Åsa) ger Lisa på 1, så "Lisa står på plats 3" är omöjligt. |
| dd-e-d3-22 | Sara på plats 6 och villkor 5 (Hanna direkt till vänster om Sara) ger Hanna på 5, så "Sara står bredvid Åsa" är omöjligt. |

Sex D3 faller på två villkor (02, 07, 08, 14, 19, 23). De står: genvägen kräver att man ser vilka två villkor som samverkar och i flera fall en tanke om dagarna (14: Kim, Leo och Dan måste gå samma dag, och måndagen har bara två platser kvar). Det är sådant ett expertprov ska mäta. Ny spärr DD6 i beslutsfilen.

**Fem D2 på grund med en enda rad som lösningsgång.** dd-g-d2-01, 02, 03, 04 och 06 förklaras med ett steg: "Tillsammans låser de Rut på plats 1, Jonas på plats 2, Lisa på plats 3 och Gustav på plats 4." Det är korrekt men lär ingen någonting, och grund är nivån där lösningsgången ska bära. Orsaken är att ingen av dem har ett villkor som låser en plats ensamt. dd-g-d2-05 (Åsa på plats 4 först, sedan de två andra) står kvar. Ersättare beställs med krav i beslutsfilen. Grund klarar golvet på D1 ensamt.

## 3. Villkor för befordran (ändringar i generatorn, inte i pusslen)

**V1. Prövningssteget ska gå att följa.** I 13 uppgifter (dd-a-d2-05, 18, 21, 23, 26, 27, dd-e-d3-05, 07, 10, 11, 14, 18, 19) fastnar lösaren och skriver "Med Lisa på plats 3 går de inte ihop. Det låser Vera på plats 1, Cilla på plats 2, Erik på plats 3, Per på plats 4 och Lisa på plats 5" med märket [1, 2, 4]. Två saker saknas: varför Lisa bara kunde stå på 3 eller 5 (kandidaten vet inte det), och varifrån de fyra andra låsen kommer (de följer ur alla villkor, inte ur de citerade; min kontroll visar att villkor 1, 2 och 4 plus de låsta platserna lämnar sex lösningar). Krav: prövningen skrivs som tre delar. Först ett steg med de villkor som snävar in elementet: "Kvar för Lisa: plats 3 eller 5." Sedan motsägelsen med de villkor som ger den: "Med Lisa på plats 3 går villkor 1, 2 och 4 inte ihop. Alltså står Lisa på plats 5." Därefter fortsätter den vanliga slingan med ett villkor i taget, så att varje lås pekar på det villkor som ger det. Spärr: varje lås i ett steg ska följa ur stegets citerade villkor plus redan låsta platser (det min kontroll räknade), annars fälls uppgiften i `validate-deduktiv.mjs`.

**V2. Misstagsmallen för "måste vara sant".** Alla distraktorer i alla 21 måste-uppgifter får "Det stämmer bara om du bryter villkor 1: ..." (i enstaka fall villkor 2). Generatorn tar den lägst numrerade nära missen. Två fel: "bara" är osant när distraktorn har flera nära missar (de flesta har tre till fyra), och att alla fyra pekar på samma villkor säger kandidaten ingenting. Krav: välj den nära miss vars tilldelning flyttar färst element jämfört med schemat, skriv utan "bara": "I schemat stämmer det inte. För att få det sant måste minst ett villkor brytas, till exempel villkor 3: ..." Copywritern putsar orden, inte valet.

**V3. Oförändrade pussel.** Efter V1 och V2 ska `gen-deduktiv.mjs` ge byte-identiska `villkor`, `fraga`, `options`, `correctAnswer`, `etiketter` och `formell` för alla godkända id; bara `losning.steg` och `misstag` får ändras. Diffa före befordran. Ersättarna till grund D2 läggs till med nya id (dd-g-d2-07 till 11), inget befintligt id återanvänds.

**V4. Ny spärr DD6 (D3).** Facit får inte vara omöjligt ur antagandet plus färre än två villkor. Fixtur: dd-e-d3-04 som den ser ut nu ska fällas.

**V5. Ersättare till grund D2.** Fem nya med minst två steg i lösningsgången och inget steg med tre villkor: i praktiken ett plats-villkor som låser först. Granskas av mig i granskning-02 innan de befordras; grund lanseras med 25 oavsett.

## 4. Ställningstaganden till Opus tre frågor

1. **DD1 i D3, exakt en lösning med antagandet.** Godtas för den här banken. Vyn klarar öppna rutor, men generatorn, spärrarna och misstagen är byggda för en lösning, och ett "omöjligt" ur ett entydigt schema är ett ärligt expertformat när genvägarna är stängda (DD6). Art-directors variant med två lösningar kvar och "Kvar"-märket mäter något annat, nödvändighet mot möjlighet, och är värd att bygga som egen mall i omgång 4, inte att tvinga in här.
2. **Stegmallen enligt spec 2.1.** Godtas: "{villkoret} Det låser Bo på plats 3." är lösarens mall och copy 4.5 är putsförslag. Prövningsstegets formulering ändras enligt V1. "går före" i stället för "kommer före" godtas.
3. **Misstag ur lösaren i D2 och D3.** Godtas. D3:s "I schemat står X på plats 4. Det går ihop med villkoren, så det är inte svaret." är korrekt och tydligt. Vem-misstagen är bra. Måste-misstagen enligt V2.

## 5. Till omgång 4, inga villkor nu

- I 8 av 15 vem-uppgifter är ett alternativ den person som ett villkor placerar någon annanstans (dd-a-d2-01 C Erik, 07 E blå, 11 D Ulla, 13 E Viktor, 15 C grön, 17 A svart, 25 C vit, 29 C Alva). Det är en nära miss enligt DD3 men en bortkastad distraktor. Tillägg till DD3: en distraktor vars enda nära miss är ett plats-villkor på sig själv räknas inte.
- Steg med tre villkor som låser fyra platser på en gång (dd-a-d2-02, 06, 07, 22, 25, 30) går att följa på avancerad men är tunga. Föredra två villkor per steg när det finns ett sådant val.
- p_prior 0,40 för D3 är nog för lågt när schemat alltid är entydigt; kalibreringen avgör.
- Art-directors D3 med öppna rutor som egen mall, se 4.1.

## 6. Utfall mot golvet

| Nivå | Kandidater | Godkända | Strukna | Golv |
|---|---|---|---|---|
| Grund | 30 | 25 (24 D1, 1 D2) | 5 | 20, nått |
| Avancerad | 30 | 30 | 0 | 20, nått |
| Expert | 24 | 20 | 4 | 20, nått utan marginal |

Golvet nås på alla tre nivåer. Deduktiv kan lanseras när V1 till V4 är införda och diffen i V3 är ren. Expert ligger exakt på golvet; fyra ersättare med DD6 beställs till omgång 4 så att provet får variation i urvalet.
