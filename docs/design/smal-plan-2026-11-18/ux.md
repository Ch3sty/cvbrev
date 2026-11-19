# UX: smal plan ska kännas lika rik (2026-11-18)

Bidrag från mobile-ux-designer. Gäller appen Testklar och /dashboard/tester.

## Vad felet egentligen är

Rikedomen i dag kommer av **antal testtyper**: en rad per typ i "Fler pass i dag", en rad per typ i Utveckling. Djupet finns redan i datan men ritas inte: matrisbanken har elva mönsterfamiljer (vridning, spegling, överlagring, latinska kvadrater...), motorn räknar andel rätt och tempo per familj, dagens pass har ett tema, och det finns riktade pass, tempopass, uppvärmning, nivåkoll och övningsprov. För Alva-användaren visas bara två av dessa familjer ("Var du tappar") och en enda nivårad. Bredd ska aldrig vara måttet på rikedom; djupet i det egna provet ska vara det.

## Tre alternativ

### A. Mönsterkartan: djupet blir instrumentet

Idag och Utveckling ritas per **mönsterfamilj inom det valda testet**, inte per testtyp. Elva familjer ger lika många rader som sju testtyper, och varje rad rör sig redan efter första passet.

Fördelar: sant (mäts redan), fokus på provet, rör sig tidigt. Nackdel: bara matrisen har familjetaxonomi i dag; verbalt, numeriskt och steg 2-typerna behöver en motsvarighet (form eller frågetyp) innan de får samma djup.

### B. Låna bredden, märk den

Visa alla sju pass även för den smala, med etiketten "utanför ditt test".

Fördelar: noll ny data, lika fylligt. Nackdelar: rör till vardagen, vattnar ur Mitt test (varför välja alls?), och det lurar: fler rader ser ut som mer plan. Avråder.

### C. Dagen har tre platser

Idag får en fast struktur oavsett antal typer: **Uppvärmning (3 min), Dagens pass, Fördjupning**. Fördjupningen är ett riktat pass på svagaste familjen, ett tempopass, eller ett övningsprov när planen säger det. Den breda får samma tre platser; deras tredje plats roterar mellan deltesterna.

Fördelar: samma rytm för alla, dagen känns som ett program och inte en lista, fungerar i dag för matrisen. Nackdel: ensam ger den inte känslan av att utvecklas på djupet.

## Mitt val: A + C, bredden som frivilligt lager

Dagen får tre platser (C). Utveckling och "Var du tappar" ritas per mönster (A). Fler tester flyttar ut ur vardagen till ett eget kort längst ner, "Bredda dig", som aldrig blandas med dagens plan.

### Idag, Alva Logic, mobil 375

```
+------------------------------------------+
| tis 18 nov          Alva Logic, 7 dagar  |
|                                          |
| [ DAGENS PASS                          ] |
| [ Nio uppgifter, tema: Två rutor       ] |
| [ läggs ihop            ( Starta )     ] |
|                                          |
| Dagar i rad  o o o * . . -   Fyra dagar  |
|                                          |
| Din nivå  6,3  ~~~~/~~~  sikte 7         |
|                                          |
| I DAG I DITT TEST                        |
| > Uppvärmning          3 min       [v]   |
| > Dagens pass          9 uppg      [ ]   |
| > Fördjupning: Spegling                  |
|   2 av 5 rätt. Fem uppgifter.   Öva      |
|                                          |
| INFÖR PROVET                 Ändra datum |
| > Övningsprovet  Alva, 20 uppg på 15 min |
|   Ligger i planen 23 nov.     Gör ett nu |
|                                          |
| DINA MÖNSTER                  Alla elva  |
| Figuren vrider sig      ####### sitter   |
| Två rutor läggs ihop    ####.   övar     |
| Spegling                ##...   svag     |
| + 8 mönster att öppna                    |
|                                          |
| BREDDA DIG                               |
| Alva har bara figurmatriser. Andra       |
| rekryterare använder också...            |
| > Deduktiv slutledning  Nivåkoll gratis  |
| > Alla tester                            |
+------------------------------------------+
```

Reglerna: dagkortet är enda primärknappen. "I dag i ditt test" har alltid tre rader; bocken sätts när raden är gjord. Fördjupningen väljs i ordning: svagaste familjen, därefter långsammaste ("Öva tempot"), därefter en familj som inte mötts än ("Nytt mönster"). Den som aldrig tappar får alltså ändå något nytt. Dagen före provet byts fördjupningen mot övningsprovet, på provdagen återstår bara uppvärmningen.

"Dina mönster" visar tre rader på Idag (svagast, i övning, starkast) och länkar till hela listan. Tillstånden är tre ord, aldrig rå procent: **svag** (under hälften rätt), **övar** (rätt men långsamt eller färre än fem svar), **sitter** (minst fem svar, nästan alla rätt inom provets tid). Varje rad är ett riktat pass.

### Utveckling, Alva Logic

```
+------------------------------------------+
| NIVÅN, ALVA LOGIC   dag 38 sedan koll,   |
|                     7 kvar till provet   |
| 6,3  upp 1,3 sedan nivåkollen            |
| [ kurva: punkt per pass, sikte, provdag ]|
|                                          |
| MÖNSTREN            3 sitter · 5 övar    |
|                     · 1 svag · 2 omötta  |
| [ 11 små rutor i rutnät, fyllnad = ]     |
| [ andel rätt, ring = tempo ok     ]      |
|                                          |
| TEMPO               senaste 5 pass       |
| [ staplar: snitt s per pass mot provets ]|
| [ streckade linje                       ]|
|                                          |
| TRÄFFSÄKERHET       per vecka            |
| [ sparkline: andel rätt v.42..v.47 ]     |
|                                          |
| MÄRKEN  (o) (o) ( ) ( ) ( )              |
+------------------------------------------+
```

Fyra instrument som alla rör sig från dag ett: nivån, mönstren, tempot över pass (inte bara senaste passet) och träffsäkerhet per vecka. "Nivå per testtyp" visas bara när planen har två eller fler typer. För den breda står mönstren per typ som flikar (Figurer · Deduktivt · Ord); samma komponenter, bara ett lager till.

Gratisnivån: mönsterrutnätet visar tillstånd men bara Premium öppnar riktade pass, precis som i dag. Historiken i kurvan låst som nu.

### Webben, /dashboard/tester

Samma modell ur `hemvy.ts`. Hemvyn får sektionen "I dag i ditt test" i stället för "Fler pass i dag" när planen har en typ, och "Dina mönster" som kort. Din utveckling byter `Nivaerna`-raderna mot mönsterrutnätet när planen har en typ; `VarDuTappar` blir hela rutnätet i stället för två rader. På dator ligger kurvan på väggen och de fyra korten i två spalter, så inget nytt layoutmönster behövs. "Bredda dig" ersätter rubriken "Fler tester" i katalogen med samma rader.

## Två fel att rätta

1. **"dag 38 av 45"** räknar från första nivåkollen (11 okt) till provet, inte planens längd. Inte en bugg i talet men fel etikett. Skriv "dag 38 sedan nivåkollen, 7 kvar till provet" eller bara dagar kvar.
2. **Märket Provdagen** sätts när `idag > provdatum` och raden i `test_milstolpar` tas aldrig bort. Troligen hade kontot ett tidigare provdatum som passerat innan det byttes till 25 nov. Regel: märket ska bara räknas när provdatumet som passerade är det som fortfarande står i planen, eller raden rensas när datumet ändras framåt.

## Beroenden

Copy: de tre tillståndsorden, "Bredda dig"-texten, fördjupningens namn. Testansvarig: trösklarna för svag/övar/sitter och taxonomi för övriga typer. Byggordning: matrisen först (datan finns), övriga typer när de har familjer.
