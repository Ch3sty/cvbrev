# saas-lead, omgång 5: enhetlig gratisnivå och Idags roll (2026-11-19)

Nuläget på webben är just det ägaren underkänner. `quotaService` ger gratis ett slutfört grundnivåtest per testtyp och dygn, alltså upp till nio om dagen. Allt över grundnivån kräver `tests_above_base`. Passen är gratis bara dag 0 (`gratisniva.ts`). Regeln skiljer sig mellan testtyper och mellan nivåer.

## 1. Tre enhetliga modeller

**A. Ett test om dagen, valfri typ och nivå.** Kvoten är ett slutfört test per dygn över alla typer, och nivåkollen räknas som ett test. Påfyllning vid midnatt svensk tid, som kvotmodellen redan gör. Genomgången är alltid öppen.
- *Aktivering:* bra. Allt syns och allt går att prova.
- *Köp:* starkt köpögonblick när kvoten är slut mitt i ett engagemang ("Nästa i morgon, eller allt nu med Premium"). Den som har prov om fem dagar räknar ut att ett test om dagen inte räcker.
- *Missbruk:* nya konton för fler tester. Lågt värde per konto, acceptabelt.
- *Snålhet:* strängare än i dag i volym (1 i stället för upp till 9), lösare i bredd.

**B. Provperiod, allt öppet i X dagar.** Det har vi provat. Den omvända provperioden 2026-09: 60 av 61 trialhändelser låg på dag 0, 16 av 19 var inaktiva efter dag 1 och ingen betalade, eftersom ingen såg ett pris. Den togs bort 22 september. Ger mest aktivering men sämst köp. Avvisas.

**C. Allt går att göra, men facit och förklaring låses efter N svar per dag.** Visar produkten fullt och köpet sker vid förklaringen, där värdet ligger. Men den bryter principen att genomgången alltid är öppen (`genomgangGratis`). Den känns dessutom som att bli lurad mitt i ett test inför ett viktigt prov. Det skadar förtroendet och ger fler avbrutna sessioner. Avvisas.

**Mitt val: A.** En regel, samma för alla typer, i en befintlig mekanism (`checkTestSessionQuota` byter nyckel från test_type till kontot). Den är snål i andan, ger en daglig anledning att komma tillbaka och har ett tydligt köpögonblick. Övningsprov mot klockan och kurvans historik förblir Premium: provet för att det är det dyraste att bygga, kurvan för att den är det betalande ser växa.

Mät: `kvot_slut_visad` med typ och plan_test, sedan `paywall_cta_clicked` från samma yta. Avläsning efter fyra veckor: andel gratiskonton som kommer tillbaka dag 2 till 7 för sitt dagliga test, och köp efter `kvot_slut_visad`.

## 2. Idag utan pass

Idag ska svara på en fråga: **vad gör jag i dag för att bli bättre till provet?** Svaret är ett riktigt test ur Tester, inte ett pass.

- **Dagens test:** ett test valt åt dem, med skälet bredvid: omätt typ, svagaste typ eller det som ingår i deras prov. För gratis är det deras dagliga test, och då har Idag ett syfte som Tester saknar: att välja åt dem.
- **Läget mot provet:** nivån per typ som visuell indikator och nedräkningen när datum finns.
- **Sedan sist:** vad som rört sig. Ett tal som ändrats är skälet att öppna appen.
- **Köpraden** när kvoten är använd: "Dagens test är gjort. Fortsätt med Premium."

Klarar Idag inte de fyra delarna på en skärm utan att upprepa Tester, slår vi ihop den med Tester som ett huvud överst. En flik utan eget syfte kostar mer än den ger.
