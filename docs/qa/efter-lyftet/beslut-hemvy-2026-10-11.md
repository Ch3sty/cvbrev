# Beslut: hemvyn i Rekryteringstester efter mätningen på mobilen

Art-director, 2026-10-11. Underlag: ägarens anmärkning efter mätningen, skärmdumparna i `docs/qa/efter-lyftet/` (m360 och desktop, 03-hemvyn-efter-tillbaka), koden i worktreen efter-lyftet (main 7da99bca): `src/components/traning/Hemvy.tsx`, `src/lib/traning/hemvy.ts`, `src/lib/traning/hem-copy.ts`, `src/components/rum/` (Topprad, Dagsrad, Rubrik, SektRubrik, Sidomeny, Dorrnav), `src/app/dashboard/tester/page.tsx`, `src/app/dashboard/tester/alla/page.tsx`, `TesterHubClient.tsx`, `components/AllaTesterVagg.tsx`.

Beslutet är fattat med ägarens mandat. Testansvarigs perspektiv redovisas under varje punkt. Ordalydelser är copywriterns (`copy-plan-2026-10-11.md`); här bestäms form och placering. Där en text citeras är den dagens text, inte den beslutade.

## 1. Fri träning från hemvyn: Lägesraden

### Beslutet

En **lägesrad** med två lägen överst på väggen, direkt under Toppraden, på båda sidorna: hemvyn (`/dashboard/tester`) och Alla tester (`/dashboard/tester/alla`). Vänster läge är planen (dagens "Dagens pass", copy bestämmer ordet), höger läge är Alla tester. Alltid synlig, ett tryck, mobil och dator. Ingen flikrad på golvet, inget kort, ingen meny.

Varför just den: ägaren letade efter ett *läge*, inte en sida. Planen och den fria träningen är rummets två sätt att träna, och två sätt visas som två lägen bredvid varandra där rummet börjar. Ett kort högt upp hade konkurrerat med det lyfta kortet (regeln är en primär handling per vy), och att döpa om Fler tester hade lagt dörren längst ner på golvet, där ägaren inte hittade den.

### Form

- **Komponent:** ny `src/components/rum/Lagesrad.tsx`, server component, props `aktiv: 'plan' | 'alla'`. Två `Link`, inget `Segment` (Segment är en kantad knappgrupp på golvet; väggen har inga kanter runt text). Renderas av `Hemvy.tsx` precis efter `<Topprad>` och av `AllaTesterVagg.tsx` och Din utvecklings vägg på samma plats, så raden står stilla när man växlar.
- **Placering:** på väggen, första raden under Toppraden, före Rubrik. Vänsterkant i linje med rubriken. Höjd 44 px, radavstånd 8 px under.
- **Typografi:** 15/600 display, samma som rummets namn i Toppraden. Aktivt läge `text-vagg-ink` med en 2 px kopparlinje under texten (inte under hela raden), inaktivt `text-vagg-mjuk` utan linje. Avstånd mellan lägena 24 px. Hela textens höjd är träffyta (44 px), fokusring enligt väggens fokusstil.
- **Dator:** samma rad, samma plats. Sidomenyn behåller **Alla tester som undersida** med antalschippen; sidomenyn är rummets register, lägesraden är rummets två sätt. Undersidan och lägesraden ska bära **samma ord** för planen, så "Dagens pass" i sidomenyn byter till det ord copywritern väljer för lägesraden (`UNDERSIDA.dagensPass` i `src/lib/rum/copy.ts` är enda källan). Två namn på samma sida är inte tillåtet.
- **Aktivt läge:** `aktiv` sätts av sidan som ritar raden, aldrig ur sökvägen. Kurvan, Test och datum och genomgångar bär ingen lägesrad; de är undersidor till planen och har sin egen väg tillbaka.
- **Alla tester:** lägesraden står på väggen, flikarna Tester och Din utveckling (`TesterTabs`, Segment) står kvar på golvet. Två olika ytor, två olika roller: väggen säger var du är, golvet vad du väljer i listan. Ingen tredje nivå införs.
- **Mätning:** `markeraRumYta` i `src/components/rum/rumMatning.ts` får ytan `'lagesrad'` så att `traning_hem_visad` och Alla testers visning kan skiljas på hur man kom dit. Ingen ny händelse.

### Den som aldrig gjort en plan

- Dörren Tester landar som i dag: med valt testspår och utan plan går hon till ingången (`installningar?forsta=1`). Ingången är ett flöde och bär ingen lägesrad, men ingången får en **sekundär länk till Alla tester** i sin fot (LANK, aldrig knapp), så att den som bara vill prova ett test kan gå förbi planen utan att gå tillbaka. Texten är copywriterns.
- Hemvyn i tomt läge (T1) och i 1a (datum utan mätning) bär lägesraden med planläget aktivt. Alla tester går alltid att trycka.
- Från Alla tester går planläget till `/dashboard/tester`. Har hon ingen plan möter hon ingången, vilket är rätt: planläget för den som saknar plan är att göra en. Ingången har nu vägen tillbaka till Alla tester, så ingen fastnar.

### Fler tester på golvet

Sektionen Fler tester behålls som den är (raderna leder direkt till testerna) och får **sektionslänken "Alla tester"** i `SektRubrik` (`lank` finns redan i komponenten; `flerTester()` i `hemvy.ts` sätter `lank: { href: TRANING_RUTT.alla }`). Två vägar till samma sida, en högst upp och en vid raderna om fler tester. Ingen omdöpning.

### Testansvarigs perspektiv

Planen förblir landningen från dörren och det lyfta kortet förblir den enda primära handlingen; fri träning läggs bredvid, inte före. Det stöder dag 2-återkomsten: den som inte vill göra dagens pass har en annan anledning att stanna i rummet i stället för att lämna det. Risken är att planen urholkas om fria tester är lika framhävda som passet; därför är lägesraden text på väggen och inte en knapp, passet står kvar i koppar, och nivån räknas bara ur planens pass och mätningar precis som nu. Ingen kvot eller betalvägg flyttas.

## 2. Sifferregeln på väggens topp

Regeln: tal radas aldrig upp; ett huvudtal eller en visualisering bär budskapet, resten står i detaljvyn. I dag står samma tal två till tre gånger inom 400 px.

| Ställe | I dag | Beslut |
| --- | --- | --- |
| Kurvans punktetikett "3,0" (och "1,0") vid senaste punkten, `Kurva.tsx` | Talet står vid punkten, på y-axeln och i dagsraden | **Stryk** punktens taletikett. Axeln är visualiseringen. Under punkten står bara ordet ("mätning"), på dator utan talet (`HEM.kurva.matningDator` blir samma som `matning`). Siktets etikett ("Mål 5") behålls; det är ett tal som inte står någon annanstans på väggen. |
| Kurvans rubrik "DIN NIVÅ, DAG FÖR DAG · form: stabil", `KurvaPaVaggen` | Eyebrow plus avdelare plus kopparprick plus ord | **Behåll eyebrowen, ersätt formmarkören.** Formen visas först från **tre punkter** (en eller två punkter har ingen form; "stabil" efter en mätning är en tom utsaga). När den visas står den **under** eyebrowen som en egen rad med kopparpricken och ordet, utan avdelaren "·". Ordet och tröskeln är modellens (`kurvaRubrik()` i `hemvy.ts` sätter `form` bara när `s.punkter.length >= 3`). |
| Statistikrutan (Dagsrad) med tre tal under rubriken "14 dagar till Alva Logic": "3 nivå, mätt i dag / 1 mätning gjord / 14 dagar till provet" | Tre tal på rad, 14 dubblerat ur rubriken, "1 mätning gjord" och "mätningens nivå" är utfyllnad | **Ersätt med ring plus ett huvudtal.** Dagsraden blir ringen (dagens pass) och **ett** tal: nivån, i `text-tal-rad`, med en etikett som säger varifrån ("från 3,0" när det finns en förändring sedan mätningen, annars "mätt i dag"/"mätt i går"). `dagsradTal()` i `hemvy.ts` returnerar ett `Tal`, inte tre; `Dagsrad.tsx` tar `tal: Tal`. Serien står redan i raden under rubriken (`HEM.rad.serie`), dagarna till provet står i rubriken, målet står i kurvan. Inget tal får stå både i rubriken, i raden under rubriken och i dagsraden; raden under rubriken slutar därför säga "Nivå 3." när dagsraden visar nivån (copy formulerar om `radText`). Gäller alla tillstånd som har dagsrad, även 1c inför provet där tredje talet i dag dubblerar rubrikens "2 dagar till". På dator blir dagsraden ett kompakt glaskort till höger om rubriken, som nu, men smalare. |
| Jobbsöksraden "13 sökta tjänster, 1 intervju, 97 personliga brev." (`Statusrad`, `jobbsokRad()`) | Tre tal i löptext med en grå prick | **Ersätt med en Rad** i en `rader`-sektion: symbol `jobb` (DorrJobb, som redan finns i `SymbolFor`), titel (copy, rummets namn), meta med **högst ett tal**, chevron, hela raden länk till `TRANING_RUTT.jobbsok`. Talet är det som ligger längst fram i jobbsöket: intervjuer om det finns någon, annars sökta tjänster; brev räknas aldrig på testväggen. `jobbsokRad()` skrivs om till en mening med ett tal; tomt läge är en mening utan tal (finns redan). `Statusrad` behålls för rena textstatusar ("I morgon", inför provet). |

## 3. Övriga avvikelser på hemvyn, samma svep

Bara det som syns i skärmdumparna eller står i koden.

1. **"Hela kurvan" bryts på två rader på mobil** (`Hemvy.tsx`, `KurvaPaVaggen`). Länken har `min-h-11` men ingen `whitespace-nowrap`, och eyebrowen trycker den. Beslut: länken `whitespace-nowrap shrink-0`, eyebrowen `min-w-0 truncate`; formraden (punkt 2) står under och trycker inte längre.
2. **Kurvan ritas med en enda punkt** ("ingen tom graf" i `hemvy.ts` rad 22). Med en mätning är kurvan ett rutnät med en prick och sju tomma ringar. Beslut: **kurvan tänds vid två punkter.** Under två punkter ritas `Planbild` (planens dagrad, finns redan för 1a) när det finns datum, och ingenting när datum saknas (datumboxen och veckoraden räcker). `kurvaFor()` returnerar `undefined` under två punkter; `byggHemvy` väljer planbild som i 1a.
3. **Stapel på noll** i Var du tappar ("0 av 2 rätt i mätningen" med tomt spår, desktop 03). Regeln i samma filhuvud: aldrig "0". Beslut: när `ratt === 0` ritas ingen stapel (`stapel: undefined` i `varDuTappar()`), metan säger det i ord (copy). Kopparstapeln reserveras för rader med något att visa.
4. **Provdagens rad i tredjedelskolumnen på dator** (desktop 03): fem rader meta trängs mot länken "Ange leverantör" på samma rad. Beslut i `Rader.tsx`/`Rad`: i en tredjedelskolumn (`lg:order-2` utan spann) står `hoger` **under** metan, vänsterställd, i stället för till höger; metan är högst två meningar (copywritern kortar och byter ut "generalrepetition"). På mobil ändras inget.
5. **Andra raden på dator är obalanserad** (desktop 03: Fler tester i spalt 1, jobbsöksraden i spalt 2, spalt 3 tom). `andraRadSpann` i `Hemvy.tsx` gäller bara när det lyfta kortet är brett. Beslut: regeln gäller alltid: andra radens första `rader`-sektion spänner två spalter, nästa står i den tredje; statusrader går i en egen rad över hela bredden. Med punkt 2 ovan är Jobbsöket en `rader`-sektion och hamnar i tredje spalten.

Inte med, avsiktligt: Kom igång "0 av 12 provade" i sidomenyn (inte hemvyn, egen rättning), rubriken "Ett pass om dagen" (copy), ringen (håller).

## Vad som byggs, i ordning

1. `Lagesrad.tsx`, in i `Hemvy.tsx`, `AllaTesterVagg.tsx`, Din utvecklings vägg; `UNDERSIDA.dagensPass` byter ord; länk i ingångens fot; `markeraRumYta('lagesrad')`; sektionslänk på Fler tester.
2. `hemvy.ts`: `dagsradTal` till ett tal, `kurvaRubrik` med tröskel tre, `kurvaFor` med tröskel två och planbild som fallback, `jobbsokStatus` till rader-sektion med ett tal, `varDuTappar` utan nollstapel.
3. `Dagsrad.tsx` ett tal, `Kurva.tsx` utan punktetikett, `KurvaPaVaggen` utan radbrytning, `Rad` med `hoger` under i smal spalt, `andraRadSpann` alltid.
4. Riktig webbläsartest på Pixel 7 och desktop enligt `feedback_riktig_webblasartest`: skärmdump av hemvyn i T1, 1a, 1b (en punkt och tre punkter), 1c, och Alla tester, med lägesraden aktiv på rätt sida.
