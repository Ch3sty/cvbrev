# Spec: provet utan konto för verbalt, numeriskt och figurserier

2026-11-09, testplanen steg 1 punkt 3. Byggs efter 23 november, när provet och kontosteget i ny design har gått live (grenen `feat/prov-konto-v2`, skissen `docs/design/skiss-prov-konto-2026-11-09.html`). Inget i den här specen är byggt. Den beskriver hur de tre typerna läggs in i den nya designen utan att den ändras.

## 1. Vad vi bygger

Tre nya prov på samma sida och i samma skal som matrislogikens prov: fem uppgifter, inget konto, ingen tidtagning, resultatet direkt, och kontot som nyckeln till genomgången och Nivåkollen. Provet räknas in i typens Nivåkoll när kontot skapas, precis som matrisens prov räknas in i matrisens Nivåkoll i dag.

| Typ | Vad provet visar | Uppgifter | Hämtas ur |
|---|---|---|---|
| Figurserier | Fem rader att fortsätta, sex alternativ | 2 grund, 2 avancerad, 1 expert, bara "härnäst" | `harnastPool` i `src/lib/figurserierV1/select.ts` |
| Verbalt | En text med fyra påståenden plus ett femte ur en andra text | text 1 ur grund (fyra påståenden), text 2 ur avancerad (ett påstående) | `passPool('verbal', ...)` i `src/lib/tester/pass-bank.server.ts` |
| Numeriskt | Ett underlag med fyra frågor plus en femte ur ett andra underlag | underlag 1 ur grund, underlag 2 ur avancerad | `passPool('numerisk', ...)` |

Fem uppgifter i alla typer, så att brickorna, rubriken ("Fyra rätt av fem") och spärren i den nya designen går att använda oförändrade. Verbalt och numeriskt har ett andra underlag med bara en uppgift; det ger en svårare sista uppgift utan att provet blir längre än fem.

## 2. Sidan och ingången

- Samma route, `/verktyg/rekryteringstester/prova`, med `?typ=figurer|verbal|numerisk`. Utan parameter matrislogik som i dag. Ingen ny sida, så att SEO-sidan och provkortet i artiklarna står kvar.
- Introt i skissen ("Prova ett rekryteringstest") får typens rubrik och en mening per typ. Exempelfrågan i introt är typens egen, ritad med testernas komponenter: `FigurserieRad` för figurserier, en kort text med ett påstående för verbalt, en liten tabell för numeriskt. Inga statiska bilder.
- Testsidan (`/verktyg/rekryteringstester`) och testartiklarnas provkort länkar till typens prov där artikeln handlar om typen (verbalt, numeriskt, induktivt). Mäts som `article_cta_clicked` med `variant: 'prov-<typ>'`.

## 3. Frågan

Flödesskalet från skissen: topprad med logga och "Har du redan ett konto? Logga in", scrollande mitt, samtycket under mitten. Frågevyn per typ är den inloggade:

- Figurserier: raden och sex alternativ, samma 880 px-kort som matrisen på dator.
- Verbalt: texten i en ram överst (textpassets `Underlag`, egen rullning högst 42 vh), påståendet och tre lika breda knappar.
- Numeriskt: underlaget överst, frågan och alternativen som rader. Kravet från skissen gäller: frågan och alla alternativ ska rymmas på Pixel 7 utan rullning efter att underlaget rullats förbi. Numeriskt visar i dag tabellen före frågan, så frågan hamnar under skärmkanten (planens punkt 20). Det beslutet måste art-director ta före bygget: antingen frågan överst och tabellen under, eller tabellen ihopfälld till en rad med "Visa tabellen". Vi bygger inte förrän det är bestämt.

Ingen tidtagning och ingen återkoppling under provet, som i dag.

## 4. Resultatet och kontosteget

Oförändrat från skissen: talet, fem brickor med de missade markerade, och spärren "Se vad jag missade". Raderna i spärren byts per typ:

- "Uppgift 3 med rätt svar och regeln bakom" (figurserier), "med rätt svar och förklaringen" (verbalt, numeriskt).
- "Genomgång av alla fem uppgifter".
- "Nivåkollen, cirka X minuter, räknar in de här svaren", där X ur `MINUTER` i `src/lib/nivakoll/copy.ts` (7, 5 och 10).

Premiumraden står kvar som en rad i bläck, med priset ur plans.

Percentilraden ("Bland de 30 procent som löser flest") läser `prov_utfall` och visas först vid 200 avslutade prov per typ. Utfallen lagras med typen, så att de tre typernas fördelningar aldrig blandas med matrisens.

## 5. Server och data

- `anon_test_sessions` får kolumnen `test_kind text not null default 'matris'` (additiv migrering, ingen ändring av befintliga rader). `questions` sparar typens nycklar i ordning.
- `POST /api/public/test-session` tar `{ typ }` vid start. Urvalet seedas på token som i dag. Klienten får uppgifterna utan facit, regel och förklaring (som `toPublicQuestion`).
- Rättningen återanvänder servrarnas befintliga funktioner: `bedomFigur` (figurserier), `ratta` i `pass-bank.server.ts` (verbalt och numeriskt). Inget facit lämnar servern före kontot.
- `prov_utfall` får `test_kind` (additiv kolumn, default `'matris'`).
- Hämtningen till kontot (`/api/traning/efter-provet` och claim-flödet) skapar ingen matrissession för de nya typerna. I stället räknas provets svar in i typens första Nivåkoll: `skapaNivakoll` i `src/lib/nivakoll/motor.server.ts` får ett valfritt `smakprov` (token), lägger provets uppgifter först i urvalet med svaren ifyllda och fyller på till Nivåkollens antal. Samma regel som matrisens smakprov: högst 30 dagar gammalt, minst tre besvarade.
- IP-gränsen tre prov per dygn gäller över alla typer tillsammans.

## 6. Mätning

Samma händelser som skissen, med `test_kind` i varje: `sample_started`, `sample_completed`, `signup_gate_shown`, `signup_flow_viewed` (entry `smakprov`), `signup_completed`. Inga nya händelsenamn. `nivamatning_klar` har redan `test_kind` (testplanen steg 1) och visar om provet ledde till Nivåkollen i samma typ.

Avläsning fyra veckor efter driftsättning, per typ: start till slutfört (ska ligga på matrisens 85 procent) och kontosteg till konto (målet 30 procent, som för matrisen).

## 7. Ordning och storlek

1. Art-directors beslut om numeriskt (avsnitt 3). Före allt annat.
2. Migreringen med `test_kind` på `anon_test_sessions` och `prov_utfall` (additiv, körs med ägarens ja).
3. Server: urval, rättning, resultat per typ (S).
4. Klient: frågevyerna i flödesskalet, introts exempel per typ (M).
5. Smakprovet i Nivåkollen (S).
6. Klicktest Pixel 7 och 1280, ljust och mörkt, som ny besökare per typ, med kontosteget och Nivåkollen efteråt.

Figurserier först: frågevyn är närmast matrisens och kräver inget designbeslut.

## 8. Kräver beslut före bygget

- Numeriska provets layout på mobil (avsnitt 3). Art-director.
- Om verbalt och numeriskt ska ha fem uppgifter (ett andra underlag med en uppgift) eller fyra (bara ett underlag). Fyra gör brickorna och rubriken olika mellan typerna. Vi rekommenderar fem. Testansvarig.
- Migreringen i avsnitt 5. Ägaren.
