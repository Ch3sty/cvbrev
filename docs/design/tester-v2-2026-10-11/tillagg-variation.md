# Tillägg till plan-facit-genvag: för lätt, repetitivt, felaktigt

Datum 2026-10-12. Författare: testansvarig. Gäller samma svep som bank_version 3 och ändrar inte planens kärna (avsnitt 0 till 6 i `plan-facit-genvag.md` står). Ägarens krav: ingen ska tröttna för att träningen är för lätt, repetitiv eller fel. Underlag läst i dag: `src/lib/traning/{passgenerator,svarighet,flaggor,bank.server,motor.server}.ts`, `src/components/traning/PassFraga.tsx`, bankerna, `riktlinjer.md` 2.2 till 2.5, `bestallning-svarare-fragor.md` 1 och 4. Data och bedömning skiljs i avsnitt 6.

---

## 1. Mot "för lätt"

### 1.1 p_prior per mall från dag ett

I dag saknar alla 3c-frågor `p_prior` (0 av 62 på grund), så nivån räknas ur `difficulty` tills 30 svar finns, och det tar månader. Varje version 3-fråga får `p_prior` ur sin mall, satt i receptet, aldrig per fråga för hand:

| Mall | Nivå | p_prior |
|---|---|---|
| M1 linjär (pil, orbital, sektorhjul) | grund | 0,80 |
| M1 fri (3×3-block, 2×2, strålar) | grund | 0,72 |
| latin-form, latin-antal, spegling, overlagring, antalSumma | grund | 0,65 |
| M2 (radvis plus latin eller diagonal) | avancerad | 0,55 |
| M3, M4 | avancerad | 0,50 |
| latin-flera, overlagring, spegling; P1', P2, P3 | expert | 0,45 |
| P4, P5 | expert plus | 0,35 |
| P6, P7, P8 | expert plus | 0,30 |

Regler: ingen expertfråga över 0,50, ingen grundfråga under 0,60; `validate-v7-questions.mjs` felar på en version 3-fråga utan `p_prior` eller utanför nivåns spann. Mätt p ersätter priorn vid 30 svar som i dag; avvikelse över 0,25 syns i admin (riktlinjerna 2.4). `BANK_KALIBRERAD_OVER_7_5` står kvar på false.

### 1.2 Två mallar utöver planens

- **M4 Egen riktning per rad** (avancerad, 8, familj vridning): M1 linjär där rad 1 går medurs, rad 2 moturs, rad 3 medurs, plus en latinsk kvadrat på en andra dimension (annars enrad, S4). Regeltext: "Varje rad vrider sig åt sitt eget håll; raderna växlar riktning."
- **P8 Dubbel överlagring** (expert plus, 8, familj overlagring): tredje kolumnen är XOR av de två första i varje rad och tredje raden XOR av de två första i varje kolumn, så luckan följer av båda. Sektorhjul och strålar. Distraktorer: "rätt radvis, fel kolumnvis" och omvänt.

Mål per nivå höjs från 93/83/91 till **113 / 103 / 99**: grund +20 (M1 fri strålar 8, sektorhjul 6, latin-antal `diag: 'olika'` 6), avancerad +20 (M4 8, M2 12), expert +8 (P8). Allt genereras; merkostnaden är granskningen. Faller P8 på dag 3 följer det i version 3.1.

### 1.3 Svårigheten inom passet

Kontrollerat: passet är **inte** adaptivt. `valjPass` låser nio frågor (60/20/20 runt nivån) och sorterar lättast först; bara mätning och ommätning använder `nastaAdaptivaFraga`. Det ska så förbli, eftersom genomgången och "Sträckuppgift över din nivå" bygger på känt band. Ändringen ligger mellan passen, i `motor.server.ts`:

- **Sträckregel:** när de två senaste passen (pass eller riktat) båda gav minst 8 av 9 på frågor som räknas riktas dagens pass mot `niva + STEG_UPP` (0,5) oavsett tema, och över-bandet dras ur p ≤ p_nivå − 0,25. `meta.strack: true`; raden efter passet säger "Två pass i rad. Det här var ett steg svårare." (copywriter putsar).
- **Golvregel:** gav förra passet högst 3 av 9 riktas dagens mot `niva − 0,5` och under-bandet får 3 frågor. Ingen text; passet ska bara kännas möjligt.
- Taket 7,5 gäller. Riktade pass omfattas inte.

---

## 2. Mot "repetitivt"

### 2.1 Exponeringsregler (`passgenerator.ts`)

Finns: aldrig samma fråga i samma session, aldrig i dag eller i går, helst osedd, annars efter 30 dagar, stegvis nedsläpp när banken inte räcker, upprepade räknas inte mot nivån. Nytt:

1. **30 dagar är ett löfte, inte ett helst**, för pass och riktat pass så länge poolen har minst 9 osedda frågor inom ±0,30 i p. Först då får friskhet 2 och 3 användas.
2. **Ingen mall två gånger i rad.** Alla version 3-frågor får fältet `recept` (till exempel `M1-pil-linjar`, `P4-sektor-xor`). Efter sorteringen byter `valjPass` grannar så att två intilliggande frågor aldrig delar `recept`, och högst två per pass delar `family` (riktade pass undantagna). Frågor utan `recept` räknas som `recept = family`.
3. **Högst två frågor per pass med samma primitiv** (pil, orbital, strålar, sektorhjul, 3×3, 2×2, grundform, ringar, balanslinje), läst ur första cellen via `primitivFor` i `celler.mjs`.
4. **Variation inom mallen:** inom ett recept om n frågor förekommer varje bas, symbol, fyllning och rotationsriktning högst ⌈n/2⌉ gånger, och två frågor delar aldrig både `strukturNyckel` och primitiv. Ny spärr S10 `utseende` i `kontroll.mjs`, fel vid bygget för version 3. S8 står.
5. Mätning, ommätning och övningsprov behåller dagens regler.

### 2.2 Bankstorlek: räkningen

Premium, dagligen i 28 dagar: 28 pass om 9 = 252, mätning 12, 3 ommätningar om 12 = 36, 2 övningsprov om 35 = 70. **370 visningar.** Med ett riktat pass om dagen dessutom: **622**.

Passet drar 60 procent inom ±0,15 i p runt nivån, så det som ska räcka är hennes band, inte hela banken. Tre band (`BAND_GRANS`: lätt p ≥ 0,65, mellan 0,48 till 0,65, svår under). En användare som stannar i ett band i fyra veckor behöver 0,6 × 252 = 152 osedda för passen plus en tredjedel av mätningarnas och provens 118 = 40. **Krav för "aldrig en upprepning": minst 190 valbara per band, 570 totalt (340 per band med riktat pass).**

Version 3 med 1.2 ger 113 / 103 / 99 = **315**. Det räcker **inte** till löftet för någon som kör pass varje dag i samma band; det räcker till cirka 18 dagar pass plus mätningar och ett prov, sedan kommer vecka 1 tillbaka som upprepade (räknas inte mot nivån). Den som rör sig över banden, vilket de flesta gör när nivån stiger, klarar sig längre.

Beslut: version 3 går ut med 315 och reglerna i 2.1. Löftet i hjälpen är "ingen fråga kommer tillbaka inom 30 dagar så länge banken räcker", vilket är sant med regel 1. **Parti 03** beställs när måttet i 2.3 visar behovet, mål 190 per band: grund +60 (billigt, genererat), avancerad +80, expert +90 (dyrt i granskning).

### 2.3 Mått

Nytt i admin Frågestatistik: andel pass per vecka sedan första träningsdagen med `meta.upprepade.length > 0`, Premium, ägare och testkonton undantagna. Över 10 procent i vecka 3 eller 4 utlöser parti 03.

---

## 3. Mot "felaktigt"

### 3.1 Slutkontroller före release, i ordning, alla gröna

1. `validate-v7-questions.mjs` (struktur, anti-trivial, läsbarhet, tankstreck, `p_prior`-spann, `recept`).
2. `v7-parallel-check.mjs`.
3. `v7-facit-check.mjs`: S1 till S10 som fel för `fran_version` 3, tabellen "facit per ruta", `facit_ruta0` noll utanför latin-antal och latin-form.
4. `v7-distraktor-check.mjs --krav=plus`; S5 noll, S6 högst 1 (noll på expert).
5. Oberoendekravet (bestallning 1.1) på alla version 3-frågor med två eller fler regler, inte bara plus.
6. `v7-geometri-check.mjs` G1 till G12, `G7_KANDA` och `G11_KANDA` tomma, ingen G5-upplysning.
7. Snapshot-testet för version 2 och `kontroll-sparrar.test.ts`.
8. **Min visuella granskning av varje ny fråga** på granskningssidan (`render-matris-granskning.tsx --fil`, PNG i 360-skala i `docs/qa/tester-v3/kandidater/`): facit för hand på minst tre per recept, alla M4 och P8, distraktorer mot misstagstexterna, blindtestet (planen 5.3). Beslut per fråga i `granskning-v3.md`. Inget går in i skarp bank utan mitt ja.
9. Klicktest enligt planen 5.4.

### 3.2 Rapportknappen "Något ser fel ut"

Kontrollerat: finns inte. `PassFraga.tsx` har bara "Vet inte, visa regeln"; `bugg-feedback` är ett mejlformulär med fel form. Minsta bygge:

- Textlänk "Något ser fel ut" i regelpanelen under "Nästa" (passet) och i resultatets genomgång per fråga (alla former). Aldrig under pågående övningsprov.
- Ark med tre knappar: "Rätt svar verkar fel", "Går inte att läsa", "Annat", frivilligt textfält om 200 tecken, Skicka. Kvitto i en rad: "Tack, vi tittar på frågan." Ingen belöning.
- `POST /api/traning/fraga-rapport` med `{ q_id, session_id, test_kind, bank_version, orsak, kommentar }`, inloggad, 10 per konto och dag. Tabell `fraga_rapporter` (id, user_id, q_id, session_id, test_kind, bank_version, orsak, kommentar, created_at), RLS utan policyer, bara servern; undantagna konton bort vid läsning. Migrering skrivs, körs med ägarens ja.
- Admin: kolumn "Rapporter" i Frågestatistik med antal och senaste orsak; två på samma fråga markerar raden. PostHog `fraga_rapporterad` med `fraga_id`, `orsak`.
- Mobile-ux-designer placerar länken; ingen ny vy, ingen artefakt.

---

## 4. Verbalt och numeriskt: parti 02

Banker: verbalt 24 / 24 / 12 texter, numeriskt 12 / 12 / 12 underlag. Kandidater parti 01: 8 texter och 8 underlag avancerad, ännu inte granskade av mig. Klassiska test kortade till 10 texter och 5 underlag; provet drar 6 texter och 3 underlag per nivå.

Ingen upprepning på fyra veckor i dagens form (ett klassiskt test i veckan plus ett prov): verbalt 4 × 10 + 6 = **46 texter per nivå**, numeriskt 4 × 5 + 3 = **23 underlag per nivå**. Passformen (36 per nivå, riktlinjerna 2.5) byggs inte nu.

**Parti 02, Opus A, i väntetid under min matrisgranskning:** verbalt avancerad 8 texter (till 40), verbalt grund 12 i grundformat (120 till 160 ord, en ståndpunkt, en fjärdedel "går inte att avgöra") till 36, numeriskt avancerad 8 (till 28) och grund 8 (till 20). Expert rörs inte. Samma validatorer som bestallning 4.1 och 4.2; `--niva=grund` ger kortare text och inget kvantorkrav. Jag granskar parti 01 och 02 ihop. Befordran i samma deploy som version 3 bara om granskningen hinner, annars 3.1. Rapportknappen gäller även här via `test_kind`.

---

## 5. Vem bygger vad, och min granskningsordning

**Opus A bygger**, i ordning: A1 spärrar S1 till S10, `recept`-fält och `p_prior`-spann i valideringen; A2 versionsmekanik enligt planen samt sträck- och golvregel och mallordning i `passgenerator.ts`/`motor.server.ts` med vitest; A3 recept-v3 med M4 och P8 och p_prior per mall, generering, renderingar; rapportknappen (api, tabell, migrering, admin-kolumn, klientlänk); admin-måttet i 2.3; parti 02 verbalt och numeriskt; A4 befordran efter min granskning; klicktest.

**Opus B bygger** grafiken enligt art-directors `grafik-v3-spec.md` (worktreen grafik-v3) och planens 4.3: `geometri.json`, renderaren utan hårdkodade mått, geometrikontrollen grön, omrendering, webbläsartest. Startar när ägaren godkänt före/efter-sidan och efter-lyftet ligger på main.

**Min granskningsordning:** 1) receptlistan med M4 och P8 som text, före körning; 2) `facit-check-fore.txt` mot planens förutsägelser; 3) kandidaterna, grund först, sedan avancerad, sedan expert och plus; 4) före/efter-sidan mot G1 till G12 innan ägaren ser den; 5) parti 01 och 02 verbalt och numeriskt; 6) klicktestets skärmdumpar; 7) `granskning-v3.md` och `reference_matrix_test_system.md`.

---

## 6. Data och bedömning

Data: bankstorlekar, att passet inte är adaptivt, att rapportknappen saknas, att 3c saknar p_prior, exponeringsreglerna i koden, räkningarna i 2.2 och 4. Bedömning: p_prior per mall (kalibreringen avgör), att 315 räcker cirka 18 dagar i ett band, att M4 och P8 går på en runda, att sträckregeln inte skrämmer (följs i dag 2-återkomst och andel pass med högst 3 rätt).
