# Testansvarig: smal plan, djup i stället för bredd (2026-11-18)

Den som valt Alva Logic ska inte lockas att bocka i fler deltester för att vyn ska kännas rik. Allt vi visar ska tränas och mätas för just det provet. Nedan skiljer jag på vad datan redan bär och vad som kräver kod eller ny lagring.

## 1. Vad som finns att mäta och träna, per val

**Alva Logic och Matrigma (bara matriser).** Här är vi starkast och visar minst av det.

- Regelfamiljer: elva mönsterfamiljer i `logicTestV7/familjer.json`, satta på varje fråga. Andel rätt och "rätt men långsam" per familj räknas redan (`familjer.ts`, `berakna.ts`), men bara ackumulerat över all tid och bara de två svagaste visas.
- Nivå: 1 till 10 med en decimal (tak 7,5), en punkt per dag i `test_nivapunkter`. Nivå per familj finns inte lagrad men går att räkna ur svaren (varje svar har frågans id och p), så det kräver kod, inte ny data.
- Tempo: Alva 120 s per uppgift och per-uppgiftstid i övningsprovet, Matrigma 68 s. Per pass sparas `snitt_s`, `over_budget` och tid per fråga. Visas i dag bara för senaste passet och fem snitt.
- Träffsäkerhet: rätt av räknade frågor per pass, sträck och golv (`strack.ts`), formordet (`form.ts`: stigande, stabil, vilar).
- Nivåkoll var sjunde dag: ligger i planen (`plan.ts`) men syns inte på kurvan förrän den är gjord.
- Övningsprov i provets format: sparas med rätt, över tid och tidsgräns, jämförbart mellan gånger.
- Riktade pass per familj och tempopass finns (`valjRiktat`), bara via "Var du tappar".
- Uppvärmning: tre frågor på provdagen, sparas inte. Rätt så.

**SHL Verify (siffror, deduktivt, figurserier, text).** Nivåkoll med nivå per deltyp, familjer för alla fyra (figurserier 7, deduktivt 10, text 4 påståendetyper, siffror 5 misstagstyper), pass med regel efter svar. Ingen kurva och ingen ommätning: nivåpunkter skrivs bara för matris. Kolumnen `test_kind` finns i `test_nivapunkter`, så kurva per deltyp är kod, inte schema.

**I-provet (ordförråd, spatial, talserier).** Svagast mätt: nivåtest i procent, familjer (talserier 8, spatial 4 former, ordförråd synonym/motsats) bara i passens "tappade", inget nivåtal, ingen kurva, ingen nivåkoll. Övningsprovet i provets ordning finns. Här krävs ny nivåberäkning före djup.

## 2. Utveckling på djupet inom ett test

Gäller i första hand matris, där underlaget finns. Ordningen är min prioritering.

1. **Mönsterkartan ersätter "Nivå per testtyp" när planen har ett deltest.** Elva rader, en per familj, status i fyra steg: inte mött, mött, säker, snabb. Säker: minst sex svar nära nivån de senaste fjorton dagarna med minst fem rätt. Snabb: säker och högst ett över provets tid. Under sex svar står antalet, aldrig ett omdöme. Elva saker att ta sig igenom i stället för en rad, och sant. Kod i `berakna.ts` och vyerna, ingen ny tabell.
2. **Nivåband per familj.** Nivåkollens formel (`beraknaNiva`) på familjens svar, visat som band (under, på, över din nivå), aldrig decimal under tolv svar: standardfelet på tolv frågor är cirka 0,6 nivåer.
3. **Kurvan med planerade nivåkoller.** Kommande ommätningar som ihåliga ringar på axeln, "ny nivåkoll om fyra dagar". Då har en punkt en riktning. Finns i `plandagar`, bara ritning.
4. **Tempot över tid.** Andel över provets tid per vecka mot Alvas 120 s, ur `over_budget` per pass. Kod.
5. **Jämnhet.** Spridningen i rätt av räknade på fem senaste pass, som ord (jämn, ojämn) bredvid formordet. Kod.
6. **Övningsproven som egen serie.** Rätt av 20 och antal över tid per gång. Data finns.
7. **"Fler pass i dag" blir riktade pass för ett deltest.** Rubriken "Mer i dag", de två svagaste familjerna och ett tempopass. Det ärliga svaret på "jag vill göra mer": mer av det provet mäter. `varDuTappar` och `vnPassSektion` måste läsa planen.

Appen och webben delar motorn, så allt är gemensamt. Appen saknar Din utveckling, så mönsterkartan måste in i Utveckling-fliken.

## 3. Hjälper andra testtyper inför Alva Logic?

Det vi får säga: träning i samma format ger vana vid formatet, tempot och regelfamiljerna, den effekt som är belagd. Retest- och övningseffekter på samma test är väl dokumenterade (Hausknecht m.fl. 2007), medan granskningen av kognitiv träning (Simons m.fl. 2016) finner svagt stöd för överföring till andra uppgifter. Det vi inte får säga: att talserier, deduktivt eller ordförråd gör någon bättre på Alva Logic, eller ger "allmän logisk skärpa".

Enda försiktiga undantaget: figurserier delar familjerna vridning, vandring och antal med matriserna. Där går "samma mönster i en annan form", aldrig "hjälper inför provet".

"Fler tester" blir en egen sektion under planen, rubrik "Utanför ditt test", meta "Ingår inte i Alva Logic. Räknas inte in i din plan eller kurva." Aldrig i passrotationen eller "Mer i dag", ingen köptext som antyder nytta för provet.

## 4. De två felen

**Dag 38 av 45.** `UtvecklingVy.tsx` rad 96 räknar `dagarMellan(start.dag, idag)` av `dagarMellan(start.dag, prov)`, där `start` är kontots första mätningspunkt någonsin (`motor.server.ts` 1378 och 1455). Planen har ingen egen startdag: `test_planer` saknar kolumn, och nytt provdatum i `plan/route.ts` nollar bara utfallet. Första nivåkoll 11 oktober och provdatum 25 november ger därför 38 av 45 och en kurva från 11 oktober. Samma modell på webben (`Helkurva.tsx` 127, `byggPlan`). Ingen räknebugg, en modellmiss. Åtgärd: lagra planens start när provdatum eller Mitt test sätts, eller skriv "38 dagar sedan första nivåkollen, 7 kvar".

**Provdagen uppnådd.** `milstolpar.ts` rad 158 sätter märket så fort ett provdatum passerat, och raden i `test_milstolpar` tas aldrig bort. Byts provdatum, eller raderas och skapas planen om, står märket kvar utan koppling till vilket prov det gällde. Sannolik orsak: ett tidigare provdatum som passerade. Databasfrågan nekades, så raden bör bekräftas. Åtgärd: visa märket bara när provdatum saknas eller är passerat, på sikt nyckla det till datumet.
