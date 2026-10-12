# Att granska, omgång 3 spår F: deduktiv slutledning och verbalt parti 04

## Granskning 02 (efter granskning 01)

Befordrat enligt beslut-01: grund 25, avancerad 30, expert 20 (docs/qa/deduktiv/befordran-01.md). Kvar att granska:

- **dd-g-d2-07 till 11**, ersättarna enligt V5, i deduktiv/index.html under Grund. Beslut i docs/qa/deduktiv/granskning-02.md och beslut-02.json; befordra-deduktiv.mjs läser alla beslutsfiler i ordning.
- **Prövningsstegen** i de 13 uppgifterna från V1 (till exempel dd-e-d3-05 och dd-a-d2-26), nu i två steg med kvar och motsägelse.
- Parti 04: villkoren för va-21 och va-24 är införda. Rekommendationen för vg-17 är inte gjord: med ett "går inte att avgöra" till får grund 10 av 32 (31 procent) och validatorn kräver högst 30.


Datum 2026-10-12. Från Opus F till testansvarig. Branch `feat/dedukt-f`. Inget av detta ligger i en skarp bank: deduktivens bankfiler är tomma (`BANK_BEFORDRAD = false`) och parti 04 ligger i `underlagParti04.json`, som bara nås av sessioner med `underlag_version: 4` efter deploy.

## 1. Deduktiv slutledning, 84 kandidater

Öppna `docs/qa/omgang3-f/deduktiv/index.html`. En sida per uppgift med villkoren numrerade, frågan, alternativen (facit i koppar, etiketten och misstaget under varje), lösningsgången med villkorens nummer i märket och remsan ur lösaren.

| Nivå | Fil | Innehåll |
|---|---|---|
| Grund | `src/lib/deduktivV1/kandidater/grund.json` | 24 D1 (skrivna för hand) och 6 D2 (fyra element, tre villkor, "Vilket måste vara sant?") |
| Avancerad | `.../avancerad.json` | 30 D2 (fem element, sex i turordningen, fyra till fem villkor), hälften "Vem står på plats k?", hälften "Vilket måste vara sant?" |
| Expert | `.../expert.json` | 24 D3 (fem eller sex element, fem till sex villkor och ett antagande), "Om X står på plats k, vilket är då omöjligt?" |

Beställningens granskning: lösning för hand på alla D1, tio D2 och alla D3. Golv 20 per nivå.

**Ditt beslut** i `docs/qa/deduktiv/granskning-01.md`, och samma beslut som JSON i `docs/qa/deduktiv/beslut-01.json`:

```json
{ "godkanda": ["dd-g-d1-01", "..."], "andra": [{ "id": "dd-a-d2-07", "varfor": "..." }], "strukna": [], "golv_per_niva": 20 }
```

Befordran: `node scripts/befordra-deduktiv.mjs --beslut=docs/qa/deduktiv/beslut-01.json` fyller bankfilerna, kör `validate-deduktiv.mjs` på dem och sätter `BANK_BEFORDRAD`.

### Automatiska kontroller (gröna)

- `node scripts/gen-deduktiv.mjs`: 30 / 30 / 24 på cirka 2 s, två körningar byte-identiska.
- `node scripts/validate-deduktiv.mjs`: alla kontroller gick igenom.
- `npx vitest run src/lib/deduktivV1`: 13 tester, en fixtur per spärr som fälls med rätt text (DD1 två lösningar, DD1 fel facit, DD2 överflödigt villkor, DD2 överflödigt antagande, DD3 distraktorer utan nära miss, DD4 samma begynnelsebokstav och okänt namn, DD5 omkastad gång och fel remsa, D1 obestämt facit och fel roll, DV2 långt namn, DV3 steg som pekar på ett villkor som inte finns, DV5 koppar på fel plats).

### Hur spärrarna är lästa (bedömning, rätta mig)

- **DD1 i D3.** Beställningen säger exakt en lösning för D2 och D3. D3 har därför exakt en lösning *med* antagandet, minst två *utan* det, och facit går ihop med villkoren utan antagandet (antagandet är det som gör alternativet omöjligt). Art-directors spec visar D3 med två lösningar kvar och öppna rutor i remsan; vyn klarar öppna rutor, men generatorn följer beställningen. Säg till om du vill ha spec-varianten.
- **DD1, tillägg.** Vem-frågan har inget plats-villkor på den frågade platsen, och facit i "måste vara sant" följer inte ur ett enda villkor och står inte ordagrant bland villkoren.
- **DD3.** "Nära miss" betyder: det finns en tilldelning som bryter exakt ett villkor och där distraktorn hade varit svaret (vem: namnet på platsen; måste: påståendet sant; omöjligt: påståendet falskt, med antagandet kvar). En distraktor kan ha flera nära missar; "varje villkor bryts av någon distraktor" räknas över alla nära missar, annars går det inte med fem villkor och fyra distraktorer.
- **DD5.** Ett steg tar först ett ensamt villkor som, med de platser som redan är låsta, låser minst en plats till ("Det låser Bo på plats 3"); platser som då bara kan gå till ett element låses i samma steg. Räcker inget ensamt villkor tar steget minsta paret eller trion ("Tillsammans låser de ..."). Fastnar lösaren prövas ett element med två möjliga platser ("Med Bo på plats 2 går villkoret inte ihop. Det låser ..."). Uppgifter som kräver mer än tre villkor i ett steg slängs.
- **D1 och mängdmodellen.** Varje påstående klassas i alla modeller med högst fyra termer och en individ, både med och utan existensläsning ("alla A är B" med eller utan att det finns några A). Ett påstående får bara stå om det får samma status i båda; två av mina första utkast föll på det och skrevs om (bonus och introduktion).

### Avvikelser mot copy och spec som du bör se

1. **Stegmallen** följer art-directors spec ("{villkoret} Det låser X på plats p"), inte copy 4.5. Spec 2.1 säger att följden är lösarens mall som copywritern putsar. Prövningsstegets formulering är min.
2. **ordning** skrivs "A går före B", inte "kommer före" (copy 4.4 erbjuder det så att greppen på "kommer" blir tom).
3. **samma_grupp** finns bara i turordningen ("A och B går samma dag", plats 1 till 3 måndag, 4 till 6 tisdag). Personer på rad och pärmar på hylla använder plats, inte plats, bredvid, inte bredvid, till vänster om och direkt till vänster om.
4. **Saker** är pärmar i färger ("Den röda pärmen ligger ..."), remsan visar färgen ("Röd").
5. **Misstagen i D2 och D3** skrivs av generatorn ur lösaren (spec 2.3 säger för hand för D3). D2 vem: "Cilla står på plats 2. Med Cilla på plats 3 bryts villkor 3: ...". D2 måste: "Det stämmer bara om du bryter villkor 2: ...". D3: "I schemat står X på plats 4. Det går ihop med villkoren, så det är inte svaret." D1:s misstag är skrivna för hand.
6. **Familjerna** är villkorstyperna med copyns namn (4.6), D1 är "premiss". För D2 och D3 är familjen den villkorstyp lösningsgången pekar på flest gånger. "rorelse" används inte av någon uppgift ännu.
7. **DV2.** Namnen är högst sex bokstäver vid fem platser och högst fem vid sex (Rasmus, Gustav och Viktor står inte i sexuppgifter).

## 2. Verbalt parti 04, 16 texter

Öppna `docs/qa/omgang3-f/verbalt-parti-04.html`. Måltypen per text är markerad, påståendena av måltypen har kopparram.

| Nivå | Fil | Id | Måltyp, två texter var |
|---|---|---|---|
| Grund | `src/lib/verbalTestV1/underlagParti04.json` | vg-13 till vg-20 | direkt 13, 14; slutledning 15, 16; kvantor 17, 18; utanför 19, 20 |
| Avancerad | `src/lib/verbalTestV2/underlagParti04.json` | va-17 till va-24 | direkt 17, 18; slutledning 19, 20; kvantor 21, 22; utanför 23, 24 |

Kontroller: `validate-verbal-bank.mjs --niva=grund` och `--niva=avancerad` utan fel och utan varningar; grund 9 av 32 "går inte att avgöra" (28 procent), avancerad 12 av 32 (38 procent); varje avancerad text har minst ett kvantorpåstående. `UNDERLAG_VERSION = 4`; version 1 till 3 väljer exakt som förut (`underlagVersion4.test.ts` mot en baslinje för version 3 läst före ändringen). Riktat textpass: en osedd text med två påståenden av familjen dras först (vitest på kvantor).

**Ditt beslut** i `docs/qa/omgang3/verbalt-parti-04/granskning.md`. Texter du stryker tar jag bort ur `underlagParti04.json` före deploy.
