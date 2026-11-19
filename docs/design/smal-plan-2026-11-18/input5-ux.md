# UX omgång 5: Idag utan pass, nivån som bild, Utveckling som man rör vid (2026-11-19)

Skiss v3 renderad. Tester håller. Idag är i dag en andra katalog med knappen Starta sju gånger; det är därför den känns utan syfte.

## 1. Idag: tre koncept

**A. Nästa steg.** Ett enda kort, räknat ur resultaten: omätt typ i provet ger Nivåkoll, svagaste mönstret ger "Öva: Spegling", säker nivå ger "Prova avancerad nivå", under en vecka kvar ger Övningsprov. Resten bor i Tester. Fördel: kort, tydligt syfte. Nackdel: en flik för ett kort.

**B. Coachytan.** Nedräkning, nivåring, svagaste mönstret, senaste resultat och tre nästa steg. Fördel: personlig. Nackdel: dubblerar Utveckling och blir lång igen.

**C. Slå ihop.** Tester blir startfliken med Nästa steg-kortet och planhuvudet överst; två flikar, Tester och Utveckling. Fördel: ingen tom vy, ett ställe att välja ifrån, ägarens poäng tagen på allvar. Nackdel: nedräkningen och banan får mindre plats.

**Mitt val: C med A:s kort.** Ordet "pass" försvinner; enheterna är det som redan finns: Nivåkoll, nivåerna (Grund, Avancerad, Expert), Övningsprov och "Öva: <mönster>" (fem uppgifter på en familj). Från en artikel om Alva Logic är hinten kortet: "Alva mäter figurmatriser. Börja med Nivåkollen, åtta minuter." Gratis visas med en enda låsregel i kortet och i menyn, samma för alla typer; inte några typer öppna och andra låsta.

```
+------------------------------------+
| PLAN INFÖR PROVET   Alva Logic     |
| 7 dagar kvar   o-o-o-*-.-.-[+]     |
| [ NÄSTA STEG                     ] |
| [ Öva: Spegling. 2 av 5 rätt,    ] |
| [ här tappar du mest.  ( Starta )] |
| ALLA TESTER      ingår i Alva först|
| [#] Figurer och mönster            |
|     Ingår i Alva Logic             |
|     [■■■■■■■□□□] 6,3          >    |
| [#] Övningsprov Alva  senast 13/20 |
| [ ] Deduktiv slutledning           |
|     [■■■■■□□□□□] 5,3          >    |
| [ ] Figurserier                    |
|     [□□□□□□□□□□] Nivåkoll, 8 min   |
+------------------------------------+
```

## 2. Nivån som bild

En **nivåmätare** i tio segment, samma överallt: i listan under namnet, i Utveckling per typ, i menyn stor. Decimalen fylls som delsegment, talet står litet till höger. Omätt: tomma segment och ordet Nivåkoll. I menyn får mätaren tre markeringar, Grund, Avancerad, Expert, så det syns vilken nivå som passar nu, och "din nivå" som punkt.

```
Menyn:  Figurer och mönster · Ingår i Alva Logic
        [■■■■■■■□□□]  6,3
         grund  ^avancerad   expert
        > Nivåkoll      > Grundnivå   > Avancerad nivå (din)
        > Expertnivå    > Öva: mönster   > Övningsprov Alva
```

## 3. Din utveckling, interaktiv

- **Grafen:** chips per testtyp ovanför (på/av, planens typ förvald), period-chips "4 veckor · Planen · Allt". Nivåkoll som fylld ring, övningsprov som kvadrat, övning som liten punkt. Tryck på en punkt öppnar en bubbla: datum, typ, resultat, "Öppna". Svep på mobil byter typ.
- **Jämför:** chip "Nivåkoll mot övningsprov" visar bara de två serierna med provdagen som streck. Provet räknas inte om till nivå utan testansvarigs regel; det står i bubblan.
- **Nivå per testtyp:** raden är tryckbar och filtrerar grafen till den typen.
- **Mönstren:** rutan öppnar ett ark med andel rätt, tempo och "Öva".
- **Listan Nivåkoller och övningsprov** blir "Resultat" med filter per typ och går att öppna per rad.

Webben: samma, med chips som flikar och bubblan som tooltip med tangentbordsfokus.
