# saas-lead, omgång 2: gratis mot Premium, återkomst och mätning (2026-11-18)

## Gratis mot Premium när träningen är fri

Ägarens gratisnivå från 2026-10-11 (`gratisniva.ts`) ligger fast. I fritt läge blir dragningen:

| Gratis | Premium |
|---|---|
| Se alla tester och vad varje test innehåller | Obegränsade pass i alla testtyper, när de vill |
| Nivåkollen en gång per testtyp | Nivåkoll igen när de själva vill |
| Ett grundpass dag 0 | Övningsprov mot klockan, obegränsat |
| Resultat och genomgång av allt de gjort | Plan inför provet med nedräkning och dagsmål |
| Senaste nivån per testtyp | Hela kurvan, tempot över tid, mönsterfamiljerna |

Plan inför provet ska gå att skapa gratis, så att planens test framhävs och datumet syns, men passen i den är Premium. Planen är då en säljyta, inte en spärr. Inget i Premium får se ut som ett schema som begränsar: knappen är alltid "Träna", aldrig "Nästa pass om två dagar".

## Vad driver återkomst utan schema

I fallande effekt för betalande:

1. **Nedräkningen** till provdatumet. Den enda brådska som finns, och den är användarens egen. Fråga efter datum när planen skapas, med "Vet inte" som val.
2. **Ett frivilligt dagsmål** (till exempel två pass) med dagar i följd som enkel rad. Det är ingen XP eller poäng (de är borttagna och ska inte tillbaka), bara "fem dagar i rad". Missad dag nollställer tyst, utan skuld.
3. **Kurvan som rör sig.** Varje pass ska kunna flytta något synligt: tempot, familjen man tappar på, nivån. Annars känns obegränsad träning som att stampa.
4. **Påminnelse** vid tid de själva väljer, som push i appen (användarens eget val). Mejl till befintliga användare kräver ägarens ja.
5. **Förslag om nivåkoll** efter ett antal pass ("Du har gjort åtta pass sedan sist. Mät nivån?"). Förslag, aldrig spärr.

För gratis finns i dag ingen anledning att komma tillbaka efter dag 0. Det är medvetet enligt gratisnivån: målet är köp, inte gratisåterkomst.

## Mätning

Händelser, alla med `plattform` (webb eller app), `har_plan`, `plan_test` och `testtyp`:

- `plan_skapad` (test, har_datum, dagsmal), `plan_andrad`, `plan_avslutad`
- `pass_klart` (i_planens_test ja/nej), `nivakoll_gjord` (foreslagen eller egen), `ovningsprov_klart`
- `dagsmal_natt`, `paminnelse_visad`, `paminnelse_oppnad`
- `paywall_shown` och `paywall_cta_clicked` med `lage` (fritt eller plan)

Rätta först kopplingen till person för serverhändelserna: `pass_klart` visar i dag 36 personer i PostHog mot 20 i databasen.

**Avläsning fyra veckor efter driftsättning och vid första månadsförnyelsen:**

- Betalande: träningsdagar per vecka (mål minst 3), förnyelse av 149 kr.
- Nya konton: andel som gör ett pass dag 2 till 7. Baslinjen är 2 av 15.
- Köp per läge (fritt eller plan) och per ingång (artikel eller direkt).
- Andel pass utanför planens test, för att se om fritt läge används.

Volymen är liten (3 köp hittills). Läs av riktning och enskilda konton, inte procent.

## Oenig

- Gratisanvändaren möter i fritt läge en katalog där nästan allt är låst. Jag föreslår ett gratis pass i veckan som återkomstkrok, men det ändrar gratisnivån och är ägarens beslut.
- Obegränsad träning kräver att frågebanken räcker utan synliga upprepningar. Räkna behovet per testtyp innan bygget börjar.
