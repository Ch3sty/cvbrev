# Matrislogikens mönsterfamiljer

Våg 3c i Rummen (`docs/design/spec-rummen-2026-10-10.md`, avsnitt 6). Taxonomin är härledd ur de regler generatorerna och de 84 befintliga V7-frågorna redan använder, och gäller i alla tre nivåer. Källan i koden är `src/lib/logicTestV7/familjer.json` (läses av `familjer.ts` och av valideringsskripten). Fältet heter `family` i bankerna.

## Familjerna

| id | Namn i gränssnittet | Vad det går ut på | Regler som ingår | Format |
|---|---|---|---|---|
| `vridning` | Vridning | En figur vrider sig lika långt för varje ruta, läst som en lång rad. | Vektor-rotation 45, 90, 135 grader, medurs och moturs. Strålar som vrids. Femhörningen som vrids (v7g-q25). | Pil, streck från mitten, månghörning |
| `monsterrotation` | Mönster som roterar | Ett mönster av flera delar vrider sig som en helhet. | Tile-rotation (3×3-block, fyra olika lägen), sektorhjul 45 till 135 grader, 2×2-mönster med två eller tre fyllningar. | 3×3-block, sektorhjul, 2×2-rutor |
| `vandring` | Vandring runt en ram | En markering flyttar mellan fasta platser i en synlig ram. | Ruta i 2×2 medurs eller moturs, prick runt cirkeln (orbital) 45 till 135 grader. | Ruta i 2×2, prick runt en cirkel |
| `rotation-med-byte` | Rotation med byte | Figuren vrider sig och byter samtidigt fyllning, längd eller spets. | Pil som vrids och växlar längd eller spets, prick som vandrar medan mittpunkten växlar fyllning. | Pil, prick runt en cirkel |
| `tva-rorelser` | Två rörelser samtidigt | Två saker flyttar sig var för sig, och båda måste följas. | Balanslinjen (kvadrat och cirkel med fack och sida), svart ruta och prick som går åt olika håll i 2×2. | Former kring en linje, ruta och prick i 2×2 |
| `latin-antal` | Antal i rad och kolumn | Varje antal finns en gång i varje rad och kolumn. | Latinsk kvadrat på antal: streck (stående eller liggande), streck från mitten, ringar, sektorer. | Streck, strålar, ringar, sektorer |
| `latin-form` | Form och fyllning i rad och kolumn | Varje form, fyllning, symbol eller läge finns en gång i varje rad och kolumn. | Latinsk kvadrat på en egenskap: antal hörn, fyllning, grundform, symbol, innerring, prickens läge, rutans läge. | Månghörning, grundform med symbol, ringar, orbital, 2×2 |
| `latin-flera` | Flera egenskaper i rad och kolumn | Två eller tre egenskaper följer var sin ordning. | Två eller tre oberoende latinska kvadrater (form och fyllning, form och symbol, form, symbol och fyllning). | Månghörning, grundform med symbol, ringar |
| `overlagring` | Överlagring | Den tredje rutan bildas av de två första: allt, bara det som skiljer eller bara det gemensamma. | Union (sammanslagning), XOR, snitt och differens, per rad eller per kolumn. | 3×3-block, 2×2-rutor, strålar, ringar, sektorhjul |
| `spegling` | Speglingar | Rutorna speglas i en linje, två gånger i rad. | Tile-spegling i lodrät, vågrät och diagonal linje, samma i 2×2 och i sektorhjul, per rad eller per kolumn. | 3×3-block, 2×2-rutor, sektorhjul |
| `antal-andras` | Antal som ändras | Antalet växer, minskar eller läggs ihop från ruta till ruta. | Antal som ökar eller minskar med ett och börjar om, med eller utan växlande riktning. Summa av två rutor. Streck och sektorer som läggs till ett i taget. | Streck, strålar, sektorer |

Spec-exemplet "Rotation med fyllningsbyte" är familjen `rotation-med-byte`; namnet blev bredare eftersom bytet också kan vara längd eller spets.

## Hur familjen sätts

Maskinellt, ur de åtta synliga rutorna (`scripts/lib/matris/tolka.mjs`). Varje cell delas upp i de dimensioner en människa läser (pilens vinkel, längd och spets; rutan i 2×2 per fyllning; balanslinjens fack och sida per form). För varje dimension prövas alla enkla regler: konstant, vridning i läsordning, period, latinsk kvadrat, rad, kolumn, diagonal, överlagring, spegling i två steg och summa. Reglerna som bär frågan avgör familjen:

1. spegling eller överlagring finns: `spegling`, `overlagring`
2. balanslinjen: `tva-rorelser`
3. läsordningsregel på ett antal, eller en mängd som byter storlek: `antal-andras`
4. 2×2 där flera fyllningar vrids lika långt: `monsterrotation`
5. två rörliga dimensioner: `tva-rorelser`; en rörlig plus en som växlar: `rotation-med-byte`
6. en rörlig dimension: pil, strålar, månghörning ger `vridning`, en ensam markering ger `vandring`, flera delar ger `monsterrotation`
7. bara rutnätsregler: en egenskap ger `latin-antal` (antal) eller `latin-form`, flera ger `latin-flera`

Samma tolkning är facitkontrollen: regeln ska peka på exakt ett alternativ, facit, och ingen annan enkel regel får ge ett annat svar.

## misstag

Fältet `misstag` har en post per alternativ på originalindex (före blandningen per session), tom sträng för facit. Texten säger vilken dimension alternativet har fel i, till exempel "Vridningen stämmer, men spetsen har inte växlat mellan fylld och öppen.", "Tredje raden och tredje kolumnen har redan en grå." eller "Tar med det som finns i båda. Det gemensamma ska bort." Den byggs av `scripts/lib/matris/misstag.mjs` ur regeln som bär dimensionen. Generatorerna kastar varje distraktor som inte går att förklara, så nya frågor har alltid text. På de frusna frågorna står distraktorer utan maskinell förklaring som tom sträng och i `misstagGranskas`.

## Antal frågor per nivå och familj

Frusna (de 28 per nivå som de klassiska testerna drar ur) + nya i 3c.

| Familj | Grund | Avancerad | Expert | Summa |
|---|---|---|---|---|
| Vridning | 5 + 7 | 5 + 5 | 0 + 4 | 26 |
| Mönster som roterar | 1 + 6 | 5 + 7 | 22 + 6 | 47 |
| Vandring runt en ram | 6 + 6 | 0 + 5 | 0 + 4 | 21 |
| Rotation med byte | 1 + 5 | 0 + 7 | 0 + 7 | 20 |
| Två rörelser samtidigt | 0 + 4 | 0 + 6 | 6 + 8 | 24 |
| Antal i rad och kolumn | 3 + 7 | 1 + 4 | 0 + 3 | 18 |
| Form och fyllning i rad och kolumn | 7 + 8 | 11 + 4 | 0 + 2 | 32 |
| Flera egenskaper i rad och kolumn | 3 + 5 | 2 + 6 | 0 + 8 | 24 |
| Överlagring | 1 + 6 | 3 + 8 | 0 + 8 | 26 |
| Speglingar | 0 + 4 | 1 + 6 | 0 + 7 | 18 |
| Antal som ändras | 1 + 4 | 0 + 4 | 0 + 5 | 14 |
| **Summa** | **28 + 62 = 90** | **28 + 62 = 90** | **28 + 62 = 90** | **270** |

Svårighetsprior (`difficulty`, 1 till 4): grund 3c 26/28/8/0, avancerad 3c 0/16/43/3, expert 3c 0/0/22/40 (antal med prior 1/2/3/4). De frusna behåller sina handsatta värden.

## Filer

- `src/lib/logicTestV7/questionBank{Grund,Avancerad,Expert}3c.v7.json`: de nya frågorna. Id `v7g-3c-*`, `v7a-3c-*`, `v7e-3c-*`.
- `scripts/gen-{grund,advanced,expert}-pool.mjs`: generatorerna, recepten i `scripts/lib/matris/recept.mjs`. Ett incheckat id får aldrig byta innehåll; generatorn vägrar.
- `scripts/berika-v7-banker.mjs`: sätter `family` och `misstag` på de 84 frusna utan att röra något annat.
- `scripts/v7-facit-check.mjs`: maskinell facit- och latin-square-kontroll av alla sex banker.
