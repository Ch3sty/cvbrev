# UX omgång 2: fritt, föreslaget, framhävt (2026-11-18)

Uppdaterad modell efter ägarens besked. Principen: **appen föreslår, användaren väljer.** Inget schema, inga låsta dagar, inga tvingade provtillfällen. En Idag för alla; Plan inför provet lägger bara till fokus, nedräkning och framhävning.

## Idag utan tvång

Ryggraden är ett enda förslag, inte en plan. Allt annat är öppet.

```
+------------------------------------+
| tis 18 nov    Plan inför provet:   |
|               Alva Logic, 7 kvar   |
| [ FÖRSLAG I DAG                  ] |
| [ Pass på Spegling: där du        ] |
| [ tappade senast     ( Starta )  ] |
| [ Något annat? Välj nedan        ] |
|                                    |
| Dagsmål  (ring 2/3 pass)  Ändra    |
| Dagar i rad  o o o * . . .         |
|                                    |
| TRÄNA                              |
| > Figurer och mönster  I DITT TEST |
|   nivå 6,3, nio uppgifter          |
| > Deduktiv slutledning   nivå 5,3  |
| > Ord och text          Nivåkoll   |
| > Alla tester                      |
|                                    |
| MÄT DIG NÄR DU VILL                |
| > Nivåkoll, 8 min    senast 11 nov |
| > Övningsprov Alva   20 uppg/15min |
|   Förslag: ett 23 nov, ett 24 nov  |
+------------------------------------+
```

Reglerna: förslaget väljs av motorn (svagaste mönstret, sedan tempot, sedan omätt typ, sedan rotation) och går alltid att byta med ett tryck. **Dagsmålet är frivilligt** och ett antal pass (1, 2, 3 eller av), aldrig ett schema. Ringen fylls av vad som helst som slutförs. Dagar i rad räknar varje dag med en slutförd session; utan planerade dagar finns inget att missa, bara söndagen fri.

## Nivåkoll och övningsprov

Alltid tillgängliga på två ställen: raden "Mät dig när du vill" på Idag och i varje tests ark i Tester. Motorn **föreslår** en ommätning efter ungefär fem pass eller sju dagar ("Dags att se om nivån rört sig?") som ett förslag i dagkortet, aldrig som ett lås. Övningsprovets förslag två dagar före provet står som meta på raden. Den som vill göra tre övningsprov samma kväll får det.

## Tester: en lista, planens test framhävt

Inga två sektioner. Alla tester i en lista; planens test står först, med kortets ton och chippen "I ditt test".

```
| PLAN INFÖR PROVET  Alva Logic   Ändra |
| [#] Figurer och mönster   I DITT TEST |
|     nivå 6,3 · 11 mönster · 14 pass   |
| [ ] Deduktiv slutledning   nivå 5,3   |
| [ ] Figurserier            Nivåkoll   |
| [ ] Ord och text ...                  |
| [ ] Övningsprov Alva        mot klockan|
```

Framhävningen är ton och plats, inte storlek eller gömda rader. Utan plan: samma lista, ingen chip, Mitt test-kortet säger "Vet du vilket test? Välj, så framhäver vi det."

## Utveckling

Rutnät med en ruta per typ, alla alltid synliga. Planens typ är hjälten (kurva, mönster, tempo enligt ux.md) och övriga står under som mindre rutor med nivå och sparkline. Omätta rutor är en handling ("Nivåkoll 8 min"). Byts planen byts hjälten; ingen data försvinner.

## Ingång från artikel

Artikeln om Alva Logic har knappen "Träna inför Alva Logic". Den sätter leverantören utan att fråga något och landar i Idag: dagkortet säger "Plan inför provet: Alva Logic · Lägg till provdatum", förslaget är Nivåkollen i figurer och mönster, och hela listan Träna syns under. Datumfrågan är ett valfritt chip, aldrig en spärr på vägen in. Samma på webben: artikelns knapp går till /dashboard/tester med planen satt.

## Där jag fortfarande är oenig

1. **Datumet är den starkaste motorn vi har.** Fritt ja, men nedräkningen ska frågas efter, mjukt och tidigt, inte gömmas.
2. **"Obegränsat" kräver att banken räcker.** Att se samma uppgift två gånger samma vecka skadar förtroendet mer än ett ärligt "du har sett alla på din nivå i dag, i morgon finns nya". Jag vill ha den raden kvar som sista utväg tills banken räknats fram.
3. **Ett förslag per dag ska stå kvar som ryggrad.** Helt platt lista utan förslag är Tester-fliken igen, och då har Idag inget skäl att finnas.
