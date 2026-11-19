# Granskning: Spatial förmåga, omgång 2, bankversion 4 (100 nya uppgifter)

Datum 2026-11-19. Testansvarig. Underlag: docs/fragebank/spatial-2026-11-19-omg2.md, bankerna i src/lib/spatialV1/, scripts/spatial-verifiera.mjs och scripts/gen-spatial-v4.mjs. Bankerna och skripten är inte ändrade i granskningen.

## Beslut

**Godkänt.** Alla 100 uppgifter med `fran_version: 4` får aktiveras med `SPATIAL_VERSION = 4`. Inga rättelser krävs i de nya raderna. Av de 14 äldre kopieparen ska ett pensioneras i samma commit: `sp-g-c-15` får `pensionerad_fran: 4` (punkt 4).

## Vad som gjordes

1. **Verifieraren körd själv**: `node scripts/spatial-verifiera.mjs --version 4` ger 100 uppgifter, 0 fel, 1 varning (sp-g-b-35). Hela banken: 487 uppgifter, 0 fel, 85 varningar, som frågebanken säger. Raderna från version 1 till 3 är byte för byte desamma som i HEAD (129 per nivå); diffen är bara 34, 33 och 33 tillagda rader.
2. **Alla 100 renderade med appens ritare** (`SpatialSvg` via tsx, skärmdumpade med Chrome genom puppeteer-core) som tolv kontaktkartor, en per nivå och form, med facit i grön ram, plus förstorade tärningar för expert C. Bilderna ligger i sessionens scratchpad `spatial-omg2-granskning/*.png`, utanför git. Varje uppgift är tittad på och löst från bilden: figurerna ritas rätt, facit går att se och inget annat alternativ ser rätt ut.
3. **Egen, fristående kontroll av A, B och D** (omgång 1:s `egen-kontroll.mjs`, körd på version 4): facit stämmer i alla 75 och exakt ett alternativ är rätt i varje. Kontrollen ger två "kontur"-fel, på sp-g-b-37 och sp-a-b-39. Båda har en diagonal vikning, och kontrollen avgör rutor med mittpunktstest, som inte klarar rutor som diagonalen delar. Det är en brist i mitt verktyg, inte i uppgifterna: facits hål stämmer i båda, och vikningen är handräknad i sp-g-b-37 och synad i bilden för sp-a-b-39.
4. **Egen tärningslösare för form C** (scratchpad `egen-kub.mjs`), skriven utan verifierarens kod: sidornas 3D-riktningar läses direkt ur ritarens hörn och matriser i `geometri.json`, kubens 24 vridningar byggs som teckenpermutationer, och en dold sida får inte visa en symbol som redan syns. Alla 24 nya tärningar har exakt ett möjligt alternativ och det står på facit. Samma lösare på alla 120 tärningar i bankerna: 0 fel.
5. **Förklaringarna**: rotationsriktningen i varje A-förklaring (medurs, moturs, halvt varv) är räknad ur figurerna och stämmer i alla 25. Antalet hål i B-förklaringarna stämmer med facit. I expert C stämmer första ledet (vart pilen eller spetsen pekar på den första tärningen) med lösarens 3D-läsning i alla åtta, och att sidan som tar grannens plats är den motsatta följer av ordningen runt hörnet, handräknat på sp-e-c-33. Andra ledet följer då av det första.
6. **Svårighet mot nivå**: `difficulty` och `p_prior` är identiska med version 3 per nivå och form (grund A d1 och B, C, D d2, p 0,8; avancerad A d2, övriga d3, p 0,6; expert A d3, övriga d4, p 0,42). De nya vikningsformerna ligger rätt: grund B har fortfarande en enda vikning (diagonal, remsa eller två hål), avancerad B två vikningar, expert B tre med klipp. Två hål på grund ökar räknandet men inte antalet steg, och fyra hål i facit är lätt att se. Expert C behåller "bara vriden" som distraktorer, alltså fortfarande nivåns svåraste.
7. **Svenskan**: inga tankstreck i frågor, förklaringar eller misstagstexter. Frågorna "Arket viks och två hål stansas" och misstagstexten "Du ritade bara de två hålen som stansades" läses naturligt. Expert C:s nya förklaringar är begripliga och lär ut metoden, som granskningen av omgång 1 bad om. En liten stilsak som inte kräver åtgärd: "Vik upp baklänges, den sista vikningen först" står också när arket viks en gång. Mallen är densamma som i version 1 till 3.

## Punkt 3: varningen för sp-g-b-35

Facit är (0,1), (0,2), (1,0), (1,3). Alternativet "fel axel" är hålen speglade över den vågräta mittlinjen, (0,2), (1,3), (2,3), (3,2), och det råkar vara facit vridet ett kvarts varv medurs. Arket ligger still, viklinjen är ritad lodrätt och alternativen visas i arkets egen ram, så alternativet kräver en vikning längs en linje som inte finns. Det är entydigt fel och samma fall som de 15 godkända "fel axel"-varningarna på grund B i version 1 till 3. **Godkänd, varningen får stå.**

## Punkt 4: de 14 äldre kopieparen

| Par | Nivåer | Versioner | Beslut |
|---|---|---|---|
| sp-g-c-15 mot sp-g-c-01 | grund mot grund | 1 och 1 | **Pensionera sp-g-c-15 från version 4.** Samma referenshörn vridet ett tredjedels varv (ring, kvadrat, prick i samma ordning runt hörnet) och samma facit. Det är en riktig kopia på samma nivå och kan komma i samma pass. Tärningar är inte uttömda som grund B, så det finns inget skäl att behålla den. |
| sp-a-c-19 mot sp-g-c-27 | avancerad mot grund | 1 och 3 | Behålls. Samma referens och facit, men grund har "fel symbol" och "främmande" som går att slå ut, avancerad har en spegling. Det är olika svåra uppgifter på olika nivåtest. |
| 12 par i form A, avancerad mot grund: sp-a-a-02/sp-g-a-02, -06/-17, -08/-05, -10/-01, -13/-33, -16/-16, -18/-06, -23/-04, -24/-31, -28/-23, -29/-26, -31/-22 | avancerad mot grund | 1 till 3 | Behålls. Referensen och facit är samma figur, men avancerad har bara speglingar som distraktorer medan grund har "flyttad" och "spegel vriden". Svårigheten skiljer sig så som nivåerna ska, och en användare möter dem bara om hen gör båda nivåtesten. |

Pensioneringen rör inga id i version 1 till 3: `poolFor(niva, 3)` filtrerar på `pensionerad_fran > version`, så sp-g-c-15 är kvar i version 1 till 3 och grundpoolen där är fortfarande 129. Version 4 får 162 i grund. `version4.test.ts` räknar bara pool 3 (129) och minst 33 nya per nivå, så testerna håller. Startade sessioner, pass och I-prov-prov slår upp uppgifter på id i hela banken, så en pensionerad uppgift som redan visats går fortfarande att rätta.

## Metodanmärkning till nästa omgång

- Min fristående kontroll klarar inte diagonala vikningar på rutnivå. Den borde följa halvrutor (trianglar) i stället för mittpunkter, så att avancerad B med diagonal kan kontrolleras fullt ut. Verifieraren och generatorns test täcker dem i dag.
- Grund B, diagonal och remsa är uttömda (två uppgifter vardera). Nästa grund B-variant kräver ett nytt beslut.

## Per id

### Grund A

| Id | Facit | Facit är referensen vriden | Distraktorer | Beslut |
|---|---|---|---|---|
| sp-g-a-34 | B | 90 grader moturs | spegel, flyttad, spegel vriden | Godkänd. Handräknad. |
| sp-g-a-35 | B | 90 grader moturs | spegel vriden, spegel, flyttad | Godkänd. |
| sp-g-a-36 | D | 90 grader moturs | flyttad, spegel vriden, spegel | Godkänd. |
| sp-g-a-37 | B | 90 grader moturs | spegel vriden, spegel, flyttad | Godkänd. |
| sp-g-a-38 | D | ett halvt varv (180 grader) | spegel vriden, spegel, flyttad | Godkänd. |
| sp-g-a-39 | B | ett halvt varv (180 grader) | spegel vriden, flyttad, spegel | Godkänd. |
| sp-g-a-40 | B | 90 grader moturs | flyttad, spegel, spegel vriden | Godkänd. |
| sp-g-a-41 | A | 90 grader moturs | spegel vriden, spegel, flyttad | Godkänd. |
| sp-g-a-42 | B | 90 grader medurs | spegel vriden, flyttad, spegel | Godkänd. |

### Grund B

| Id | Facit | Variant och hål i facit | Distraktorer | Beslut |
|---|---|---|---|---|
| sp-g-b-33 | A | två hål, 4 hål | fel axel, extra, stansat | Godkänd. Handräknad: hålen (1,2) och (3,3) speglas över x=2. |
| sp-g-b-34 | B | remsa, 2 hål | extra, fel axel, stansat | Godkänd. Handräknad: hålet ligger i den dubbla remsan, speglas över y=1. |
| sp-g-b-35 | A | två hål, 4 hål | stansat, fel axel, extra | Godkänd. Varning: fel_axel är facit vridet ett kvarts varv, se punkt 3. |
| sp-g-b-36 | C | två hål, 4 hål | extra, stansat, fel axel | Godkänd. Handräknad. |
| sp-g-b-37 | D | diagonal, 2 hål | extra, fel axel, stansat | Godkänd. Handräknad: hålet (3,2) speglas över huvuddiagonalen till (2,3), inte i en delad ruta. |
| sp-g-b-38 | C | remsa, 2 hål | stansat, extra, fel axel | Godkänd. Handräknad: hålet i den dubbla remsan. |
| sp-g-b-39 | B | två hål, 4 hål | fel axel, stansat, extra | Godkänd. Handräknad. |
| sp-g-b-40 | C | diagonal, 2 hål | extra, stansat, fel axel | Godkänd. Handräknad: hålet (3,2) speglas över den andra diagonalen till (1,0). |

### Grund C

| Id | Facit | Det som avgör | Distraktorer | Beslut |
|---|---|---|---|---|
| sp-g-c-33 | A | pricken och kvadraten i samma ordning | fel symbol, främmande, fel symbol | Godkänd. |
| sp-g-c-34 | A | dubbelringen och stjärnan i samma ordning | fel symbol, fel symbol, främmande | Godkänd. |
| sp-g-c-35 | C | stjärnan och den fyllda kvadraten i samma ordning | fel symbol, främmande, fel symbol | Godkänd. |
| sp-g-c-36 | D | kvadraten och ringen i samma ordning | fel symbol, främmande, spegel | Godkänd. |
| sp-g-c-37 | C | ringen och kvadraten i samma ordning | fel symbol, fel symbol, främmande | Godkänd. |
| sp-g-c-38 | D | den fyllda kvadraten och stjärnan i samma ordning | fel symbol, främmande, fel symbol | Godkänd. |
| sp-g-c-39 | A | stjärnan och pricken i samma ordning | fel symbol, främmande, fel symbol | Godkänd. |
| sp-g-c-40 | D | kvadraten och stjärnan i samma ordning | främmande, fel symbol, fel symbol | Godkänd. |

### Grund D

| Id | Facit | Ihopvikt facit | Distraktorer | Beslut |
|---|---|---|---|---|
| sp-g-d-34 | C | två hål | spegelvänd, fel linje, hål saknas | Godkänd. Spegelvänd är facit speglat i egen ram, men fel eftersom arket ligger still, samma konstruktion som i dagens bank. |
| sp-g-d-35 | D | två hål | fel linje, hål saknas, spegelvänd | Godkänd. Spegelvänd är facit speglat i egen ram, men fel eftersom arket ligger still, samma konstruktion som i dagens bank. |
| sp-g-d-36 | B | ett hål | hål saknas, spegelvänd, fel linje | Godkänd. Spegelvänd är facit speglat i egen ram, men fel eftersom arket ligger still, samma konstruktion som i dagens bank. |
| sp-g-d-37 | D | två hål | fel linje, hål extra, hål saknas | Godkänd. |
| sp-g-d-38 | A | ett hål | hål saknas, fel linje, spegelvänd | Godkänd. Spegelvänd är facit speglat i egen ram, men fel eftersom arket ligger still, samma konstruktion som i dagens bank. |
| sp-g-d-39 | C | två hål | fel linje, hål extra, hål saknas | Godkänd. |
| sp-g-d-40 | B | två hål | fel linje, hål extra, spegelvänd | Godkänd. Spegelvänd är facit speglat i egen ram, men fel eftersom arket ligger still, samma konstruktion som i dagens bank. |
| sp-g-d-41 | D | två hål | hål saknas, fel linje, spegelvänd | Godkänd. Spegelvänd är facit speglat i egen ram, men fel eftersom arket ligger still, samma konstruktion som i dagens bank. |
| sp-g-d-42 | C | ett hål | hål extra, fel linje, spegelvänd | Godkänd. Spegelvänd är facit speglat i egen ram, men fel eftersom arket ligger still, samma konstruktion som i dagens bank. |

### Avancerad A

| Id | Facit | Facit är referensen vriden | Distraktorer | Beslut |
|---|---|---|---|---|
| sp-a-a-33 | C | 90 grader medurs | spegel, spegel, spegel | Godkänd. |
| sp-a-a-34 | D | 90 grader moturs | spegel, spegel, spegel | Godkänd. |
| sp-a-a-35 | C | ett halvt varv (180 grader) | spegel, spegel, spegel | Godkänd. Handräknad. |
| sp-a-a-36 | A | 90 grader medurs | spegel, spegel, spegel | Godkänd. |
| sp-a-a-37 | B | 90 grader moturs | spegel, spegel, spegel | Godkänd. |
| sp-a-a-38 | B | 90 grader moturs | spegel, spegel, spegel | Godkänd. |
| sp-a-a-39 | A | ett halvt varv (180 grader) | spegel, spegel, spegel | Godkänd. |
| sp-a-a-40 | B | 90 grader moturs | spegel, spegel, spegel | Godkänd. |

### Avancerad B

| Id | Facit | Variant och hål i facit | Distraktorer | Beslut |
|---|---|---|---|---|
| sp-a-b-33 | A | remsa först, 3 hål | en fel plats, bara sista, fel axel | Godkänd. Handräknad: tre lager under hålet, (1,2), (0,2) och (3,0). |
| sp-a-b-34 | A | remsa först, 3 hål | fel axel, bara sista, en fel plats | Godkänd. |
| sp-a-b-35 | D | två hål, 6 hål | en fel plats, bara sista, fel axel | Godkänd. |
| sp-a-b-36 | D | remsa först, 3 hål | fel axel, bara sista, en fel plats | Godkänd. |
| sp-a-b-37 | D | två hål, 8 hål | bara sista, fel axel, en fel plats | Godkänd. |
| sp-a-b-38 | C | två hål, 5 hål | fel axel, bara sista, en fel plats | Godkänd. |
| sp-a-b-39 | A | två hål, 6 hål | en fel plats, fel axel, bara sista | Godkänd. Första vikningen är diagonal och den andra sned, se metodanmärkningen. |
| sp-a-b-40 | D | remsa först, 3 hål | en fel plats, fel axel, bara sista | Godkänd. Handräknad: (1,1), (2,0) och (3,0). |

### Avancerad C

| Id | Facit | Det som avgör | Distraktorer | Beslut |
|---|---|---|---|---|
| sp-a-c-33 | B | ringen och stjärnan i samma ordning | spegel, bytta, fel symbol | Godkänd. |
| sp-a-c-34 | C | triangeln och stjärnan i samma ordning | vriden, spegel, fel symbol | Godkänd. |
| sp-a-c-35 | A | kvadraten och pilen i samma ordning | spegel, fel symbol, vriden | Godkänd. |
| sp-a-c-36 | B | pricken och kvadraten i samma ordning | fel symbol, bytta, spegel | Godkänd. |
| sp-a-c-37 | B | ringen och pricken i samma ordning | bytta, spegel, fel symbol | Godkänd. |
| sp-a-c-38 | B | pricken och pilen i samma ordning | främmande, spegel, fel symbol | Godkänd. |
| sp-a-c-39 | A | pilen och pricken i samma ordning | fel symbol, spegel, främmande | Godkänd. |
| sp-a-c-40 | A | triangeln och pilen i samma ordning | fel symbol, spegel, vriden | Godkänd. |

### Avancerad D

| Id | Facit | Ihopvikt facit | Distraktorer | Beslut |
|---|---|---|---|---|
| sp-a-d-34 | B | ett hål och klipp | hål extra, klipp fel kant, fel linje | Godkänd. |
| sp-a-d-35 | A | två hål och klipp | klipp fel kant, hål saknas, fel linje | Godkänd. |
| sp-a-d-36 | A | ett hål och klipp | fel linje, hål extra, spegelvänd | Godkänd. Spegelvänd är facit speglat i egen ram, men fel eftersom arket ligger still, samma konstruktion som i dagens bank. |
| sp-a-d-37 | B | två hål och klipp | hål saknas, klipp fel kant, spegelvänd | Godkänd. Spegelvänd är facit speglat i egen ram, men fel eftersom arket ligger still, samma konstruktion som i dagens bank. |
| sp-a-d-38 | D | ett hål och klipp | hål saknas, klipp fel kant, hål extra | Godkänd. |
| sp-a-d-39 | C | två hål och klipp | hål saknas, fel linje, klipp fel kant | Godkänd. |
| sp-a-d-40 | D | ett hål och klipp | spegelvänd, fel linje, klipp fel kant | Godkänd. Spegelvänd är facit speglat i egen ram, men fel eftersom arket ligger still, samma konstruktion som i dagens bank. |
| sp-a-d-41 | D | ett hål och klipp | hål extra, fel linje, hål saknas | Godkänd. |
| sp-a-d-42 | D | ett hål och klipp | hål saknas, klipp fel kant, fel linje | Godkänd. |

### Expert A

| Id | Facit | Facit är referensen vriden | Distraktorer | Beslut |
|---|---|---|---|---|
| sp-e-a-33 | A | ett halvt varv (180 grader) | spegel, spegel, spegel | Godkänd. Handräknad. |
| sp-e-a-34 | A | ett halvt varv (180 grader) | spegel, spegel, spegel | Godkänd. |
| sp-e-a-35 | C | 90 grader medurs | spegel, spegel, spegel | Godkänd. |
| sp-e-a-36 | A | ett halvt varv (180 grader) | spegel, spegel, spegel | Godkänd. |
| sp-e-a-37 | A | 90 grader moturs | spegel, spegel, spegel | Godkänd. |
| sp-e-a-38 | A | ett halvt varv (180 grader) | spegel, spegel, spegel | Godkänd. |
| sp-e-a-39 | C | 90 grader moturs | spegel, spegel, spegel | Godkänd. |
| sp-e-a-40 | D | 90 grader moturs | spegel, spegel, spegel | Godkänd. |

### Expert B

| Id | Facit | Variant och hål i facit | Distraktorer | Beslut |
|---|---|---|---|---|
| sp-e-b-33 | D | 6 hål, klipp | fel axel, utelamnad, fel ordning | Godkänd. |
| sp-e-b-34 | A | 4 hål, klipp | bara sista, en fel plats, utelamnad | Godkänd. |
| sp-e-b-35 | B | 4 hål, klipp | fel axel, utelamnad, bara sista | Godkänd. |
| sp-e-b-36 | B | 6 hål, klipp | utelamnad, bara sista, en fel plats | Godkänd. |
| sp-e-b-37 | A | 6 hål, klipp | bara sista, utelamnad, fel ordning | Godkänd. |
| sp-e-b-38 | A | 4 hål, klipp | bara sista, utelamnad, fel axel | Godkänd. |
| sp-e-b-39 | B | 4 hål, klipp | fel axel, utelamnad, bara sista | Godkänd. |
| sp-e-b-40 | C | 4 hål, klipp | utelamnad, bara sista, en fel plats | Godkänd. |

### Expert C

| Id | Facit | Det som avgör | Distraktorer | Beslut |
|---|---|---|---|---|
| sp-e-c-33 | C | första: pekar triangelns spets mot pricken; pilen tagit prickens plats runt hörnet, och pilen är sidan mittemot pricken | vriden, vriden, vriden | Godkänd. Förklaringens riktning (spetsen mot pricken) stämmer med egen 3D-läsning. |
| sp-e-c-34 | B | första: pekar pilen bort från triangeln; pricken tagit triangelns plats runt hörnet, och pricken är sidan mittemot triangeln | vriden, vriden, vriden | Godkänd. Riktningen (pilen bort från triangeln) stämmer. |
| sp-e-c-35 | D | första: pekar pilen mot triangeln; kvadraten tagit triangelns plats runt hörnet, och kvadraten är sidan mittemot triangeln | vriden, vriden, vriden | Godkänd. Riktningen (pilen mot triangeln) stämmer. |
| sp-e-c-36 | D | första: pekar pilen bort från den fyllda kvadraten; ringen tagit den fyllda kvadratens plats runt hörnet, och ringen är sidan mittemot den fyllda kvadraten | vriden, vriden, vriden | Godkänd. Riktningen (pilen bort från den fyllda kvadraten) stämmer. |
| sp-e-c-37 | C | första: pekar triangelns spets mot den fyllda kvadraten; pilen tagit den fyllda kvadratens plats runt hörnet, och pilen är sidan mittemot den fyllda kvadraten | vriden, vriden, vriden | Godkänd. Riktningen (spetsen mot den fyllda kvadraten) stämmer. |
| sp-e-c-38 | B | första: pekar triangelns spets mot den fyllda kvadraten; pilen tagit den fyllda kvadratens plats runt hörnet, och pilen är sidan mittemot den fyllda kvadraten | vriden, vriden, vriden | Godkänd. Riktningen (spetsen mot den fyllda kvadraten) stämmer. |
| sp-e-c-39 | D | första: pekar pilen mot triangeln; kvadraten tagit triangelns plats runt hörnet, och kvadraten är sidan mittemot triangeln | vriden, vriden, vriden | Godkänd. Riktningen (pilen mot triangeln) stämmer. |
| sp-e-c-40 | B | första: pekar triangelns spets bort från den fyllda kvadraten; pilen tagit den fyllda kvadratens plats runt hörnet, och pilen är sidan mittemot den fyllda kvadraten | vriden, vriden, vriden | Godkänd. Riktningen (spetsen bort från den fyllda kvadraten) stämmer. |

### Expert D

| Id | Facit | Ihopvikt facit | Distraktorer | Beslut |
|---|---|---|---|---|
| sp-e-d-34 | A | ett hål och klipp | hål extra, hål saknas, klipp fel kant | Godkänd. |
| sp-e-d-35 | D | ett hål och klipp | hål extra, hål saknas, fel linje | Godkänd. |
| sp-e-d-36 | B | ett hål och klipp | hål saknas, fel linje, hål extra | Godkänd. |
| sp-e-d-37 | C | två hål och klipp | hål saknas, klipp fel kant, spegelvänd | Godkänd. Spegelvänd är facit speglat i egen ram, men fel eftersom arket ligger still, samma konstruktion som i dagens bank. |
| sp-e-d-38 | D | ett hål och klipp | hål extra, klipp fel kant, fel linje | Godkänd. |
| sp-e-d-39 | B | ett hål och klipp | hål saknas, hål extra, fel linje | Godkänd. |
| sp-e-d-40 | C | två hål och klipp | klipp fel kant, fel linje, hål saknas | Godkänd. |
| sp-e-d-41 | C | två hål och klipp | spegelvänd, fel linje, hål saknas | Godkänd. Spegelvänd är facit speglat i egen ram, men fel eftersom arket ligger still, samma konstruktion som i dagens bank. |
| sp-e-d-42 | A | ett hål och klipp | fel linje, hål saknas, klipp fel kant | Godkänd. Klipp på fel kant är facit speglat i egen ram, men fel eftersom arket ligger still, som sp-e-d-25 och -29. |

## Aktivering, i samma commit

1. `SPATIAL_VERSION = 4` i `src/lib/spatialV1/select.ts`, med en rad om bankversion 4 i kommentaren.
2. `"pensionerad_fran": 4` på sp-g-c-15 i `bankGrund.json`. Inga andra rader ändras.
3. `version4.test.ts`: `expect(SPATIAL_VERSION).toBe(3)` blir 4. `version3.test.ts`: `toBe(3)` blir `toBeGreaterThanOrEqual(3)`.
4. Kör `node scripts/spatial-verifiera.mjs`, `npx vitest run src/lib/spatialV1 src/lib/tester/steg2 --exclude ".claude/**"` och `npx tsc --noEmit -p .`.
5. Kör aldrig `scripts/gen-spatial.mjs` på bankerna.

Aktivering: ja
