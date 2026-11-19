# Granskning: figurserier, parti 3 (2026-11-19)

Testansvarig. Alla 100 uppgifter lästa (rad, alternativ, regeltext, misstag) och ritade med appens renderare (`cellSvg`) i tio ark via headless Chrome, alla 100 sedda. Verifieraren och hela kedjan körda på nytt: 222 uppgifter, 0 fel i alla fyra steg. Dessutom en egen sökning efter samma lägesföljd under olika primitiver, som generatorn inte prövar. Bankerna är orörda.

**Beslut: godkänt med villkor.** Fem uppgifter byts ut (punkt 1 till 4). Övriga 95 godkänns: varje rad har en regel en människa hittar på sin nivå, ingen distraktor följer en enkel alternativ regel (verifierarens regelbibliotek och min egen läsning är överens), figurerna är tydliga och skiljbara i renderingen, och regeltexterna är begriplig svenska.

## Byts ut

| # | Id | Problem | Rättelse |
|---|---|---|---|
| 1 | fs-a-antal-14 | Samma mall och samma hörnföljd 8, 7, 6, 5, 4 till 3 som fs-a-antal-10; bara fyllningsordningen är roterad. Två av bankens fyra månghörningsuppgifter är alltså samma. | Byt till den ökande varianten (3 till 8 hörn), som mallen stöder. |
| 2 | fs-g-vax-13, fs-g-vax-17 | Samma lägesföljd 1, 7, 4, 0, 3 till 5 som fs-g-vax-12 (och fs-e-vax-03 i version 1): tre nya grunduppgifter i samma familj med identisk rörelse, bara primitiven skiljer. | Behåll vax-12, ge 13 och 17 nytt startläge eller annan riktning. |
| 3 | fs-e-vaxl-24 | Samma mall och samma regler som fs-e-vaxl-14 (ett steg medurs, två steg moturs, mittpunkten i tretakt), hela raden vriden två lägen. | Byt stegen, till exempel två medurs och ett moturs. |
| 4 | fs-a-flera-13 | Samma regler (tre steg, pilen 90 grader medurs) och exakt samma pilföljd 225, 315, 45, 135, 225 som fs-a-flera-07; bara kant i stället för bana. | Byt pilens vridning till moturs eller 45 grader. |

## Anmärkningar, inget hinder

5. **Samma lägesföljd under annan primitiv** förekommer också i fs-g-vrid-23/24 och fs-a-vaxl-27/fs-e-vaxl-23 (samma vinklar, olika nivå). Bankens konvention sedan version 1 tolererar det, så jag stoppar inte. Men generatorn bör framöver avvisa samma lägesföljd inom samma nivå och familj, inte bara identisk rad.
6. **fs-g-vand-11** (tre svarta rutor som går tre steg längs 3×3-kanten) läses som att en figur byter form, inte som att rutorna flyttar. För svår för F1:s prior 0,78 på grund. Låt den stå och låt statistiken avgöra, eller sänk p_prior till 0,6.
7. **Expert** är 16 av 22 växelvis i tretakt plus 6 antal; ingen F6 (tre regler). Nästa omgång bör ta spärren som stoppar F6 (S6 på expert) i stället för att hoppa över mallen.
8. **Renderingen.** Månghörningens 7 och 8 hörn går att skilja i 78 pixlar och tydligt i appens storlek; strålar med sju streck är täta men det saknade strecket syns; duo med kantprick saknar ram, så "kanten" är rutans osynliga kant, som i version 1. Inga NaN, inga sammanfallande alternativ (fs-a-flera-10 C och D skiljer i fyllning).
9. **Svårighet mot nivån.** F1 med tre steg per figur (vand-10, vand-12, vrid-17, vrid-22) är tyngre än ett steg men mäts med samma prior; statistiken får skilja dem. F3 på grund, F4/F5 på avancerad och F7 på expert ligger rätt. F7 i 45 sekunder per uppgift är mycket, men expertnivån ska vara det.

## Versionshöjningen

Säker som den är gjord. De klassiska nivåtesten räknar urvalet ur `poolFor(niva, serieVersion(session.meta))`, versionen skrivs vid start (`SERIE_META`) och saknad version läses som 1, så startade sessioner behåller sitt urval. Figurpasset, övningsprovet och Nivåkollen sparar id i meta och slår upp dem med `allaFragor`/`allaFigurFragor`, som tar med parti 3, parti 2, bryter och de pensionerade. `figurpass.test.ts` låser `SERIE_VERSION` till 3. Percentilen för de klassiska figurserietesten delas inte per bankversion (som för deduktivt); godtagbart eftersom mallarnas priors är desamma, men det bör stå i changelogen.
