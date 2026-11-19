# UX-syn på ägarens input: fritt läge som standard, studieplan som lager (2026-11-18)

## Vad som håller

- **Fritt läge som standard tar bort den svåraste frågan i onboardingen.** De flesta vet inte testets namn; i dag tvingas de gissa eller välja "Annat". Att börja brett och smalna av när kallelsen kommer följer verkligheten.
- **Intensitet man valt själv känns som ens egen plan.** "Varje dag tills provet" matchar varför någon betalar 149 kr. Ingen köper en plan som säger vila.
- **Studieplan som lager, inte som läge**, är rätt tanke: samma vyer, mer fokus.

## Vad som riskerar att bli rörigt

1. **Två lägen blir två appar.** Om Idag, Tester och Utveckling byter form när planen slås på får vi dubbel komplexitet och användaren tappar orienteringen. Regel: en Idag, alltid med ett dagens pass. Planen smalnar bara av vad passet väljs ur och lägger till nedräkning och övningsprov.
2. **"Utvecklas inom allt" kräver åtta nivåkoller innan något rör sig.** Utan styrning blir fritt läge en katalog med "ej mätt" överallt. Lösning: dagens pass roterar mellan typerna (rotationen finns redan i hemvy.ts) och varje första möte med en typ är dess Nivåkoll. Då fylls Utveckling av sig självt, en typ per dag.
3. **Intensitet som formulär är friktion.** Tre chips, inget mer. Datumet är frivilligt och frågas sist.
4. **Ordet "studieplan" krockar med "Mitt test".** Behåll ett begrepp utåt: Mitt test är planen. "Studieplan" kan vara internt.
5. **Dagar i rad får inte straffa den som valt tre dagar i veckan.** Serien räknar bara planerade dagar (fungerar redan för vilodagar).

## Idag i fritt läge

```
+------------------------------------+
| tis 18 nov                         |
| [ DAGENS PASS: Deduktivt         ] |
| [ Första gången: Nivåkollen, 8   ] |
| [ min, gratis         ( Starta ) ] |
| Dagar i rad  o o * . . . -         |
| DIN UTVECKLING          Alla typer |
| [8 små rutor: typ, nivå eller      |
|  "koll i morgon"; 3 mätta lyser]   |
| TRÄNA FRITT                        |
| > Figurer och mönster   nivå 6,3   |
| > Ord och text          nivå 5,0   |
| > Siffror och tabeller  Nivåkoll   |
| HAR DU FÅTT EN KALLELSE?           |
| > Välj ditt test, så lägger vi     |
|   passen efter det        Välj     |
+------------------------------------+
```

## Idag med aktiv plan (Alva, varje dag, 25 nov)

```
+------------------------------------+
| tis 18 nov      Alva Logic, 7 kvar |
| [ DAGENS PASS: Två rutor läggs   ] |
| [ ihop                ( Starta ) ] |
| Dagar i rad  o o o * o o o  varje  |
| I DAG I DITT TEST (3 rader, ux.md) |
| INFÖR PROVET  Övningsprovet 23 nov |
| DINA MÖNSTER  (ux.md)              |
| BREDDA DIG    Behåll bredden: ett  |
|   fritt pass i veckan        På/Av |
+------------------------------------+
```

Samma kort, samma ordning. Det som byts: passets källa, raden Inför provet, mönstren i stället för typerna.

## Välja intensitet och datum

```
Hur ofta vill du träna?
[ Varje dag ] [ Vardagar ] [ Tre dagar i veckan ]
När är provet?  [ Vet inte än ]  [ Välj datum ]
```

Två frågor, ett ark, öppnas från "Välj ditt test" eller direkt efter en Nivåkoll ("Ska vi lägga upp passen mot ett prov?"). Standard: Varje dag, inget datum. Utan datum säger planen "tills du är klar"; nivån "sitter" på alla mönster föreslår avslut.

## In och ut

- **In:** Tester-fliken (kortet Mitt test), Idag (kortet Kallelse), nivåkollens resultat.
- **Ändra:** chipsen i Mitt test, alltid ett tryck bort.
- **Ut:** "Avsluta planen" i Mitt test. Automatiskt dagen efter provet: "Hur gick det?" och tillbaka till fritt läge med allt sparat. Inget försvinner; mönsterdjupet ligger kvar i Utveckling.

## Utveckling

Fritt: rutnät med en ruta per typ (webbens `SmaMultiplar` finns), hjälten är typen med mest data, omätta rutor är en handling ("Nivåkoll 8 min"), aldrig "ej mätt". Med plan: hjälten är provets nivå, mönstren och tempot enligt ux.md, övriga typer hopfällda under "Bredden".

## Webben

Identiskt via hemvy.ts. På dator får fritt läge rutnätet i två spalter under dagkortet; arket för intensitet blir en dialog. Katalogen behåller "Ingår i ditt test" bara när en plan är aktiv.
