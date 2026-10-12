# Granskning: expert (parti 02, P4/P5, expert-v3), verbalt och numeriskt parti 02

Datum 2026-10-12. Testansvarig. Beslut per fråga i `beslut-expert-verbal-numerisk.json`. Grund och avancerad granskas av en annan instans och rörs inte här.

Underlag: alla 64 PNG i `expert-plus-parti-02/`, `expert-v3-parti-01/` och P4/P5 i `expert-plus-parti-01/`, kandidatfilerna, plus ett eget läsande skript (`matris-analys.mjs` i min arbetskatalog) som räknar facit oberoende av generatorn, kopior, majoritet per dimension, utanför-värden och centroid. Numeriskt: alla uttryck omräknade med eget skript, avrundning och svensk talform kontrollerade. Verbalt: alla 80 påståenden lästa mot texten.

## Utfall

| Del | Godkända | Strukna |
|---|---|---|
| P4 och P5 ur parti 01 | 16 | 0 |
| Expert-v3: överlagring 3, spegling 1 | 4 | 0 |
| Parti 02: P1' 8, P2 8, P3 8 | 0 | 24 |
| P6 | 0 | 4 |
| P8 | 0 | 16 |
| Verbalt avancerad (va-09 till 16) | 8 | 0 |
| Verbalt grund (vg-01 till 12) | 12 | 0 |
| Numeriskt avancerad (na-09 till 16) | 8 underlag, 32 frågor | 0 |
| Numeriskt grund (ng-01 till 08) | 8 underlag, 32 frågor | 0 |

Facit stämmer i alla 64 matriser mot min egen tolkning, exakt ett alternativ uppfyller reglerna i varje fråga, inga tomma misstagstexter utanför facit, vridningsriktningen i P4/P5 stämmer med regeltexten (index uppåt är medurs i renderaren). Ingen fråga faller på facit. Det som fäller 44 av dem är distraktorerna.

## Det viktigaste felet: majoritetsgenvägen (ny spärr S11)

Opus byggde parti 02 så att S6 klaras (inget värde ensamt). Men i alla 24 parti 02-frågor och i alla fyra P6 är facits värde strikt vanligast bland de sex alternativen i två dimensioner. Den som bara räknar värden i alternativen stryker fyra av fem distraktorer utan att läsa en enda regel; kvar står facit och en kopia av ruta 0 (P1, P6) eller ett alternativ med ett värde som inte finns i rutnätet (P2, P3). Det är samma typ av genväg som ägaren pekade på med ruta 0, bara flyttad från rutnätet till alternativen. Räknat: "4 av 5 strukna utan regel" i 28 av 28.

Orsaken är distraktorbyggarens "ändra en dimension": när tre eller fyra distraktorer skiljer sig från facit i exakt en dimension blir facits värde automatiskt majoritet i de övriga. Det var inte en regel i planen, så Opus bröt inget; spärren saknades. Den läggs till nu:

- **S11 majoritet** (fel på expert och plus, upplysning på grund och avancerad): i ingen dimension (`dimsFor`) får facits värde vara strikt vanligast bland de sex alternativen; lika är tillåtet. För mängdprimitiver (sektorhjul, strålar, 3×3-block): facit får inte vara det enda alternativet med minst sammanlagd symmetrisk differens till de övriga, och mängden element som finns i fler än tre alternativ får inte vara lika facit.
- **S12 utanför** (fel på expert och plus): i en dimension som styrs av en regel (latin, schack, diagonal) får ingen distraktor bära ett värde som saknas i de åtta synliga rutorna. På grund och avancerad högst en sådan distraktor per fråga.
- Diagnostiken behålls: minst en distraktor ska skilja sig från facit i exakt en dimension (så att "symbolen har inte växlat" finns kvar som misstag), de övriga i två eller fler. Räkneexempel som klarar allt för P1 med facit (b0, f0, s0): (b0, f0, s1), (b1, f1, s0), (b2, f2, s0), (b1, f2, s1), (b2, f1, s1). För P3 med facit (a0, L0, H0): (a0, L1, H1), (a1, L0, H1), (a1, L1, H0), (a2, L0, H1), (a2, L1, H0), där a1 och a2 är de två riktningar som redan står i rad 3 och kolumn 3.

Rutnäten i parti 02 och P6 är korrekta och får återanvändas med samma seed; bara alternativen byggs om, nytt löpnummer enligt ATT-GRANSKA 9.2.

## Ställningstaganden till Opus avvikelser

1. **Parti 02 ersätter de 24 i parti 01: ja i princip, men parti 02 går inte in heller.** Parti 01 faller på S6 och G1, parti 02 på S11 och S12. Båda stryks; parti 03 byggs om på parti 02:s rutnät med distraktorregeln ovan.
2. **P3 bara vänsterförskjutning med undantag från S8: godkänt.** Högerförskjutning ger konstant riktning på diagonalen, och då är spetsen en funktion av riktningen. De åtta har olika riktningsmängder, spetsfas och längdfas, så variationen finns i utseendet. Undantaget skrivs in i `kontroll.mjs` med den motiveringen.
3. **P7 ej byggd, P8 i stället: nej.** P8 är i sak en regel. Kolumn-XOR följer matematiskt av rad-XOR (båda ger XOR av de fyra rutorna uppe till vänster), så den andra riktningen är en kontroll, inte en läsning. Tilläggets tänkta distraktorer "rätt radvis, fel kolumnvis" går därför inte att bygga, och Opus föll tillbaka på facit plus eller minus ett element: facit är centrum i 14 av 16. P8 byggs om som vanlig expert-överlagring (band expert, p_prior 0,45, 8 frågor, 4 sektorhjul och 4 strålar) med distraktorerna union, snitt, kopia av en ruta, XOR av fel par och facit vridet 45 grader, kontrollerat mot S11. Regeltexten "åt två håll" får stå kvar, den är sann. Volymen från P7 tas inte igen; expert får vara under 99.
4. **P6 bara 4: godkänt som antal, men mekanismen är två latinska kvadrater plus schack**, alltså P2:s styrka med lägen i stället för form och symbol. Inte tre oberoende läsningar. Band expert, p_prior 0,45. Rutnäten håller (åtta olika lägespar, ingen takt).
5. **p_prior:** P4 och P5 sätts till 0,35 av befordringsskriptet som planerat.

## Volym och konsekvens

Expert efter det här beslutet: 35 kvar + 20 godkända = 55 valbara, under golvet 80. Version 3 kan inte gå ut på expert förrän parti 03 (24 + 4 + 8 = 36 frågor) är byggt och granskat. Bygget är en distraktorregel i `distraktorer.mjs`, en omkörning och en kort granskning från mig (rutnäten är redan kontrollerade, så jag tittar på alternativen). Går det inte på en dag går grund och avancerad ut först, och expert väntar på version 3 med de 55 plus pensioneringen uppskjuten för expert till 3.1.

## Anmärkningar som inte fäller

- `v7e-v3-over-02`: facit är en enda svart ruta och kolumn 1 har identisk översta och nedersta ruta (mittrutan delar inget med den översta). Entydigt och regelrätt, men visuellt magert; byts gärna mot ny seed i 3.1.
- `v7e-plus-over-15` har en distraktor med dubbel diagnos. Texten är ärlig och får stå.
- Numeriskt: tre distraktorer ligger inom 3 procent från facit (na-09 q3 10,4 mot 10,6; na-11 q3 13,9 mot 13,6; na-11 q4 29,4 mot 30,0). De är räknade fel på rad eller kolumn, inte avrundningsfel, så de får stå. na-09 q3 "per arbetad timme" bör heta "per arbetad persontimme" i en putsning; frågan är ändå entydig eftersom bara den tolkningen finns bland alternativen.
- Verbalt: 12 av 32 på avancerad och exakt ett per text på grund går inte att avgöra, som beställt. Kvantorerna är antingen motsagda av ett motexempel i texten (samtliga, alltid, varje, aldrig) eller uttryckligen lämnade öppna ("finns ingen samlad statistik", "har ännu inte utvärderats", "har ännu inte publicerats"). Inga faktafel hittade i sakuppgifterna (LAS, sjuklön, karens, allemansrätten, elsparkcykelreglerna).

## Vad som är data och vad som är bedömning

Data: facitkontrollen, majoritetsräkningen (28 av 28), utanför-räkningen (16 av 24), centroiden i P8 (14 av 16), omräkningen av alla numeriska uttryck. Bedömning: att majoritetsgenvägen är lika allvarlig som ruta 0 (den ger 50 procent utan att regeln lästs, mot prior 0,45), att P6 är P2-styrka, och att parti 03 går på en dag.
