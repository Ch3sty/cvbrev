# Granskning: figurserier, parti 5 (omgång 3, 2026-11-19)

Testansvarig. Alla 95 kandidater lästa (rad, alternativ, regeltext, misstag, regler) och ritade med appens renderare (`cellSvg`, via `render-matris-granskning.tsx --serie`) i 25 kontaktark med fyra uppgifter per ark, alla sedda. Alla 56 lägespar för klockan är dessutom ritade i appens storlek: mobil (ruta 92 px, figuren med 10 % luft, både 1x och 2,625x som Pixel 7) och dator (ruta 100 px i 640-kolumnen, 1x och 2x). Bilderna ligger i scratchpad, inget i git. Filerna är orörda.

**Beslut: godkänt med tre strykningar.** 92 av 95 godkänns. Facit följer regeltexten och syns i bilden i alla 95, ingen distraktor följer en enkel alternativ regel, och visarna går att skilja på mobil.

## Stryks

| # | Id | Problem | Beslut |
|---|---|---|---|
| 1 | fs-e-flera-19 (F9) | Båda visarna har samma regel i båda serierna (90 grader moturs i den första, tredje och femte, 45 grader medurs i den andra och fjärde). Klockan vrids alltså som en stel figur: figur 1, 3 och 5 har samma form (visarna 45 grader isär), figur 2 och 4 en annan (90 grader isär). Det är F5 på en figur, avancerad, inte "fyra serier att hålla isär". | Stryk. Generatorn bör spärra vaxelvis-vaxelvis där `ke` och `ko` är lika på båda visarna. |
| 2 | fs-a-flera-35 (F10) | Kopia av fs-a-flera-34. Båda har den långa visaren 45 grader moturs och den korta visaren som går runt samma tre lägen (snett uppåt höger, snett nedåt vänster, nedåt); bara ordningen i cykeln är omvänd (1, 5, 4 mot 5, 1, 4). `klockNyckel` räknar cykeln som steg och skiljer därför på ordningen, men parti 4:s regel sorterar cykelns värden. Mot den regeln är det samma nyckel. | Stryk. Låt `klockNyckel` räkna cykeln som mängden lägen, och vrida bort fasen, inte som stegföljden. |
| 3 | fs-g-vrid-42 (F1) | Kopia vriden som helhet. Pilen i mitten 45 grader moturs med pricken stilla i hörnet; fs-g-vrid-15 (parti 3) är samma uppgift med pricken två lägen tidigare, alltså hela figuren vriden 90 grader. Regelnyckeln räknar den stilla prickens läge som konstant och släpper igenom den. Det är också tredje "45 grader moturs" under duo-kant-pil på grund (vrid-15, vrid-19). | Stryk. Samma regel som klockan bör gälla duo: en del som står still är bara "stilla", inte ett läge. |

## Det jag prövade

**Facit och distraktorer.** Varje uppgift löst från raden: lägena per visare eller del, stegen, serierna och cyklerna, mot alla sex alternativ. Facit är entydigt i alla 95. Ingen distraktor följer regeln, ingen motiveras av "andra och fjärde lika", spegling eller en annan period (verifierarens egna tolkning bekräftar samma sak). De växande stegen på klockan går över 180 grader (225 och 270 grader i sista steget), så att den sista vridningen ser ut att gå åt andra hållet med 135 eller 90 grader. Facit blir ändå samma med varje läsning modulo åtta lägen, och det är expertens sak.

**Visarna på mobil.** I 92 px är figuren cirka 47 px bred. Den långa visaren går ut nära urtavlan, den korta slutar halvvägs och är tydligt bredare. Det går att skilja i alla 56 lägespar, också i 1x. De två svåraste fallen:

- Visarna åt motsatt håll (en linje genom mitten, till exempel L0k4 och L4k0). Längden avgör: den långa halvan når urtavlan. fs-e-flera-24 har båda varianterna i rad (figur 4 och 5), och de går att läsa isär.
- Pendeln med 45 graders utslag på den korta visaren (fs-a-vrid-24, 26, 33, 34). Det är partiets finaste skillnad, samma som ett pilsteg, och syns tydligt på 2,625x. Godtagbart på avancerad.

Står visarna 45 grader isär ligger den korta nära den långas bas, men vinkeln syns.

**Förklaringar och svenska.** Regeltexterna stämmer med reglerna i alla 95. Inga tankstreck i kandidatfilerna eller i omgångens dokument. Klockans misstag säger vilken visare de gäller. Duo-texterna börjar fortfarande "Fortsätter serien i den första, tredje och femte figuren." utan subjekt (14 gånger i partiet); det är samma formulering som i de aktiverade bankerna (94 gånger), så det är inget hinder, men "Pricken fortsätter serien ..." vore bättre vid nästa copyomgång.

**Nivån.**

- **F10 mot F4.** F10 är F4:s form (ett steg och en cykel eller ett kvartsvarv) i en ny figur. Steg och kvartsvarv motsvarar F4:s duo-orbital-pil och duo-kant-pil, steg och pendel motsvarar pil-steg-längd. Skillnaden ligger i att båda delarna är visare i samma figur och måste hållas isär på längd och bredd, och det är just det SHL:s och Aons klockuppgifter mäter. Det räcker för en egen mall på avancerad, och p_prior 0,52 strax under F4:s 0,55 är rimligt. Följ upp mot svarsdata; ligger F10 på F4:s nivå kan de slås ihop i statistiken.
- **F9.** Tunga uppgifter: växande steg på den ena visaren och två serier på den andra, eller två serier på båda. Verkligt svåra, utom flera-19 (punkt 1). I fs-e-flera-21, 22 och 25 har visarna samma steg i luckans serie (den andra och fjärde), så att facit är figur 4 vriden som helhet. Den första serien skiljer, så uppgifterna kräver ändå att man ser två serier, men de är lättare än övriga F9. De godkänns; p_prior 0,32 står tills statistiken finns.
- **F7 och F8 med klockan** ligger rätt mot mallarnas övriga uppgifter.

**Kopior.** Utöver verifierarens regelnyckel prövade jag en egen klocknyckel: varje visares regel utan läge, cykeln som mängd lägen modulo vridning. Den hittar punkt 2. Två närliggande mönster godkänns som egna uppgifter:

- **Bytta visare** (sju par i F10): samma två regler men på motsatt visare, till exempel fs-a-vrid-23 (lång 45 grader, kort 90 grader medurs) och fs-a-flera-27 (lång 90 grader, kort 45 grader medurs). För den som löser är det en annan uppgift, eftersom det är visarnas roller som ska hållas isär. Paren: vrid-20/flera-28, vrid-22/flera-31, vrid-23/flera-27, vrid-27/flera-30, vrid-31/flera-36, vrid-32/flera-33, flera-34/flera-35 (den sista stryks ändå).
- **Spegelvända** (samma regler åt andra hållet), till exempel vrid-19 och vrid-23. Konventionen sedan parti 1 räknar riktningen som konstant.

Vill vi ha fler F10 senare bör generatorn spärra både bytta och spegelvända par; mallen är redan smal (26 uppgifter med samma idé).

## Anmärkningar, inget hinder

4. **fs-g-vrid-38** (sektorhjulet 45 grader medurs, fyra svarta) är fjärde "sektorerna 45 grader medurs" på grund (vrid-06, 30, 34 med två, tre och en). Antalet är en konstant i nyckeln, så den står, men inte fler på den varianten.
5. **fs-g-vand-38** (pricken ett steg medurs runt banan, kryss i mitten) är samma rörelse som orbitalens fs-g-vand-05 och vand-18 med en symbol i stället för mittpunkten. Olika primitiver, godkänd.
6. **Grund F1** har tre duo-kant-pil i partiet med pricken stilla på samma plats (vrid-36, 40, 42). Med vrid-42 struken är det två, med olika vridning (135 och 45 grader medurs).
7. **fs-e-antal-20** (3×3-kanten, två serier och antal) har två alternativ med sju svarta rutor (B facit, F fel läge); läget skiljer tydligt.

## Renderaren mot HEAD

Egen jämförelse, inte stickprov: `src/lib/logicTestV7` från HEAD (`git archive`) i scratchpad, och `cellSvg` från HEAD och från arbetskopian körd på varje figur i alla 23 banker (alla `bankParti*`, `bankGrund/Avancerad/Expert`, bryter-bankerna och alla `questionBank*.v7.json`, rad, rutnät och alternativ). **12 448 figurer, 0 skiljer**, samma hash över all utdata (f3ffe92bdd7ec696). HEAD-kopian saknar `KlockaRenderer`, så jämförelsen är mot rätt version. Mitt tal är lägre än agentens 12 539 för att jag räknar celler i rad, rutnät och alternativ och inget annat; slutsatsen är densamma. Ändringen i `renderers.v7.tsx` är bara en ny gren i `SvgCellV7` och en ny komponent.

## Verifiering

- `figurserier-verifiera.ts` på de tre kandidatfilerna: 95 uppgifter, 0 fel, kedjan grön.
- `figurserier-verifiera.ts` på alla härnäst-banker plus parti 5: 415 uppgifter, 0 fel, 48 kända följdpar och 33 kända regelnyckelpar bland granskade eller äldre (upplysning).
- `v7-geometri-check.mjs --serie` på parti 5: 95 frågor, 1 045 figurer, G3 klocka 56 lägespar, inga fel (G1, G2, G3, G4, G6, G7, G9, G11, G12, S1 till S5, K1, V11, V12). Noder 37 till 114, högst 12,2 kB.
- `v7-geometri-check.mjs --serie` på de aktiverade bankerna: inga fel.

## Aktiveringen

Som i omgångens dokument, avsnittet Aktiveringen, med de tre id:na borttagna ur `GODKANDA_PARTI5` och bankfilerna: 12 på grund, 34 på avancerad och 46 på expert, 92 totalt. Talen i `figurpass.test.ts` blir därefter. Ingen `--ersatt`-runda; strykningarna ersätts inte.

Aktivering: ja efter strykningarna (fs-e-flera-19, fs-a-flera-35, fs-g-vrid-42)
