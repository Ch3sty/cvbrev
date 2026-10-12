# Granskning bank_version 3, omgång 2

Datum 2026-10-12. Testansvarig. Beslut per fråga i `beslut-omgang2.json`. Underlag: alla 97 PNG i `omgang2/`, kandidatfilerna och ett eget läsande skript som räknar facit oberoende av generatorn (rotationssteg och radstart ur rutnätet, schack och diagonal ur de synliga rutorna, xor/diff/snitt, speglingar prövade mot alla åtta transformationer, latinska kvadrater), kontrollerar regeltexten mot rutnätet (grader, medurs/moturs, radstart), räknar vilka regler varje distraktor bryter, S11 per egenskap och centrum, S12, S13, kopior, tomma eller felplacerade misstagstexter, tankstreck och delade rader.

## Utfall

| Del | Nya | Godkända | Strukna |
|---|---|---|---|
| Grund (M2-pil-schack 4, M2-orbital-schack 2, M1 2) | 8 | 8 | 0 |
| Avancerad M2-pil-diagonal 7, M2-pil-fri-diagonal 6, M4-pil 8, M2-orbital-diagonal 15, antal-summa 1 | 37 | 37 | 0 |
| Avancerad M2-pil-tre 6, M3-balans-sida 2 | 8 | 0 | 8 |
| Expert P6 4, överlagring 12, spegling 4 | 20 | 19 | 1 (over-15) |
| Plus parti 03 (P1' 8, P2 8, P3 8) | 24 | 24 | 0 |
| Avvikelse 3 (tidigare godkända) | 8 | 5 | 3 |
| Avvikelse 4 (delade rader, grund) | 6 | 3 | 3 |

Facit stämmer i alla 97 mot min egen tolkning, exakt ett alternativ uppfyller reglerna i varje fråga, regeltexterna stämmer med rutnäten (steg, riktning, radstart, vilken egenskap som är schack respektive diagonal), inga tankstreck, inga tomma misstagstexter, inga kopior av synliga rutor som facit. Grafik v3: inga tomma alternativ, inga krockar, orbital med streckad ram, pilarnas längd och spets går att skilja på mobilbredd.

Generatorändringarna fungerar: i alla 37 godkända M2/M4 bryts varje regel av minst två distraktorer, varav en ensam, och ingen egenskap är konstant över alternativen. Facit är inte majoritet i någon egenskap i de 37. I P6 och P8 är facit inte centrum. Plus parti 03 följer räkneexemplet ur expertgranskningen.

## Det som fäller: majoritet i tre egenskaper samtidigt

M2-pil-tre (byte-12 till -17) och M3-balans-sida (tva-05 och -06) bygger distraktorerna som "en egenskap fel" fyra gånger plus en helt fel. Då blir facits värde vanligast i varje regelstyrd egenskap (3, 4 och 4 av 6), och majoritetsröstning per egenskap ger facit utan att en regel lästs. På avancerad är S11 upplysning, och det står fast för tvåregelfrågor där majoriteten bara uppstår i en egenskap. När facit går att rekonstruera helt ur majoriteten är det en genväg på alla nivåer. Regeln skärps därför: **S11 är fel på alla nivåer när facits värde är strikt vanligast i varje regelstyrd egenskap samtidigt.** Byggs om som plus redan gör: en nära miss per regel och två distraktorer som bryter alla tre (med olika fel i rörelsen), så varje egenskap landar på 3 mot 3. Rutnäten håller och återanvänds.

over-15: facit är den enda figuren med en enda fylld ruta. Byt distraktorn "facit plus en ruta" mot en annan enskild ruta.

## Ställningstaganden till Opus avvikelser

1. **M3-balans-sida 2 i stället för 4: godtas.** Sidan i schack, synlig på båda formerna, är en riktig tredje regel, och S10 ger bara två utseenden. Volymen tas av pilarna med diagonal. De två byggs om bara för distraktorerna.
2. **antal-summa med riktning i schack: godtas.** Riktning per rad med samma riktning i hela raden ger samma sekvens i alla kolumner och faller på V7 regel 1; resonemanget stämmer. Frågan antal-04 håller (antal 2/2/2 mot 3, riktning 3 mot 3).
3. **Åtta tidigare godkända som bryter S11 eller S12.** De fem latin-antal (lant-03, -04, -06, -07, v7a-lant-01) behålls: i den regelstyrda egenskapen, antalet, ligger högst en distraktor utanför rutnätet, vilket S12 tillåter på grund och avancerad. Strålarnas lägen är dekoration och ingen regel. Noteras för 3.1: lägg strålarna på lägen som finns i rutnätet, så att tre av fem distraktorer inte ser främmande ut. De tre med facit som centrum (over-02, plus-over-18, plus-over-20) stryks. Det är samma fel som fällde P8 i omgång 1, och jag godkände dem innan spärren var formulerad. Samma rutnät, nya distraktorer. `GODKANDA_FORE_S11` i `sparrar.mjs` kan krympas till de fem lant.
4. **Tre par på grund som delar två rader: den med högst löpnummer stryks** (vand-03, vand-13, antal-05). vand-03 och vand-13 delar dessutom facit med sin partner.
5. **Plus tillåter distraktorer som bryter alla regler: godtas**, med villkoret att de bara tar värden ur rutnätet (S12, uppfyllt i alla 24) och ser ut som riktiga figurer (de gör det; svart kvadrat med plus och lång öppen pil är inte slumpfigurer). Räkningen kräver två sådana per fråga för att varje egenskap ska landa på 3 mot 3, och det är också så P1 och P2 är byggda.

## Anmärkningar som inte fäller

- Opus skriver att P8 saknar distraktorer med ett element mer eller mindre. Det stämmer inte: over-05, -07, -08, -09, -10 och -11 har en eller två sådana ("ett streck saknas", "en svart sektor för mycket"). De fäller inte, för facit är inte centrum i någon av de åtta, och texterna är ärliga.
- over-13 har facit med ett enda element, men alternativ C har också ett, så ingen unik egenskap.
- vand-18/vand-22 och vand-22/vand-25 delar en rad vardera med olika facit. Tillåtet.
- P3 har bara en nära miss (spets ensam); vinkel och längd bryts alltid tillsammans. Tillåtet på plus enligt omgång 1, men diagnosen "fel riktning" och "längden har inte växlat" går då aldrig att ställa var för sig. Notera för 3.1.
- Grund M2-schack (byte-07 till -12) är enradsfrågor av konstruktion, som Opus skriver. Tillåtet på grund, p_prior 0,65 rimligt.

## Befordran

Volym efter det här beslutet, mot golven (grund 93, avancerad 80, expert 80):

| Nivå | Kvar | Godkända | Summa | Golv |
|---|---|---|---|---|
| Grund | 25 | 80 + 8 - 3 = 85 | 110 | 93 |
| Avancerad | 35 | 23 + 37 = 60 | 95 | 80 |
| Expert | 35 | 20 + 19 + 24 - 3 = 60 | 95 (97 om plus-over-18 och -20 inte ingår i de 20) | 80 |

**Version 3 kan befordras nu** med de godkända, utan att vänta på ombyggnaden. De 15 strukna (8 avancerad, 4 expert/plus, 3 grund) byggs om med `gen-bank-v3.mjs` enligt skälen i beslutsfilen och går in i 3.1 efter en kort granskning av bara alternativen. Krav före befordran: `GODKANDA_FORE_S11` rensad från de tre expertfrågorna, S11-skärpningen ovan inlagd som fel i `sparrar.mjs` (facit majoritet i alla regelstyrda egenskaper), `v7-facit-check` grön på de godkända, och p_prior enligt tidigare beslut (P4/P5 0,35, P6 0,45).

## Data och bedömning

Data: facitkontrollen (97 av 97), regelbrott per distraktor, majoritetsräkningen (8 av 97 med facit som majoritet i alla egenskaper), centrum (0 av 20 på expert), delade rader. Bedömning: att majoritet i alla egenskaper är en genväg även på avancerad, att strålarnas lägen i latin-antal är dekoration och inte S12, att P6 håller som expertfråga med p_prior 0,45, och att expert kan gå ut på 95 utan de fyra strukna.
