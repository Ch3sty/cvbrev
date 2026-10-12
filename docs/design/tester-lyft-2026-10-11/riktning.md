# Riktning för illustrationerna: Tester-lyftet (2026-10-11)

Art director till illustratören. Det här gäller före allt annat i den här
omgången. Uppdateras om jag ändrar mig; versionen står längst ner.

## Idén i en mening

Vi ritar **provbladet**: det användaren faktiskt kommer att se på testdagen,
förenklat till sin kärna, tecknat med en lugn hand på papper. Inga maskoter,
inga människor, inga metaforer (ingen hjärna, ingen glödlampa, inga kugghjul).
Den som aldrig gjort ett test ska titta på bilden och förstå vad frågan ser
ut som. Den som redan kan ska känna igen sig på en sekund.

## Palett (tokens, aldrig hex i komponenten)

Alla illustrationer står i Träningens rum (indigo). De ska fungera på tre
underlag: **papper** (kort), **golv** och **vägg** (mörk indigo). Därför:

| Roll | Token | Ljust | Mörkt | Vad den gör i bilden |
|---|---|---|---|---|
| Kontur | `currentColor` | ink-1 `#1A1A1F` på papper, vagg-ink `#F5F6FC` på vägg | ink-1 `#F3F2F7` | Alla linjer |
| Dämpad kontur | `--illu-dim` = ink-3 / vagg-svag | `#65656E` / `#6F78B0` | `#9391A1` | Rutnät, hjälplinjer, "de andra svarsalternativen" |
| Yta | `--illu-fill` = papper / vagg-2 | `#FFFFFF` / `#2B3470` | `#171B2E` | Figurernas insida, "bladet" |
| Mjuk yta | `--illu-mjuk` = ton / vagg-mjuk 18 % | `#DFE3F6` | `#232B55` | En skuggad ruta, en markerad rad i tabellen |
| Koppar | `--illu-accent` = `#E07A2F` | samma | samma | **Exakt en yta per bild**: det rätta svaret, den sökta figuren, den ifyllda cellen, markören |

Koppar är svaret. Aldrig två kopparytor, aldrig koppar som kontur runt hela
bilden, aldrig koppar som bakgrund. Ingen annan kulör alls (ingen grön,
ingen röd, ingen blå utanför rummets indigo).

## Linjevikter och geometri

Vi följer tabellen i `docs/designsystem.md` avsnitt 7 och lägger till ett
steg för de nya testbilderna:

| viewBox | Stroke | Radie | Var |
|---|---|---|---|
| 48 | 2 | 4 | Symbolen på testkortet och i kurvans små multiplar (finns: `SymMatris`, `SymOrd`, `SymSiffror`, `SymPerson`) |
| **160 × 120** | **3** | **8** | **Nytt: testbilden på testkortet och i introduktionen** |
| 240 | 6 | 20 | Scen i introduktionen på dator (en bild, inte fem) |

- `stroke-linecap="round"`, `stroke-linejoin="round"`, `vector-effect` används
  inte: bilden skalar med sin ruta och linjen får bli tjockare på dator.
- Allt ligger på ett 8-pixelsrutnät i 160 × 120. Rundade hörn 8, aldrig
  perfekt skarpa, aldrig helt runda.
- Fyllningar är platta. Ingen gradient inne i figurerna. Den enda toningen i
  rummen är kurvans yta (`#g-yta`) och den tillhör instrumenten, inte
  illustrationerna.
- Ingen skugga, ingen blur, ingen glow, ingen bakgrundscirkel, ingen rundad
  platta bakom bilden. Bilden står direkt på papperet.
- Djup görs med överlapp och en dämpad kontur bakom en stark, inte med
  skugga.

## Hur rummet och kopparn används

Bilden står på kortets papper, till höger om texten på dator (160 × 120) och
över texten på mobil (hela bredden, höjd 96 med viewBox bevarad). I
introduktionen på väggen står samma bilder i vagg-ink-kontur med vagg-2 som
yta och koppar som accent. Alltså: **samma SVG, bara `currentColor` och
`--illu-fill` byter**. Rita ingenting som förutsätter vit bakgrund.

## De fem bilderna och vad de ska säga

1. **Logik, matris** (3 × 3): åtta rutor med enkla figurer som följer en
   regel (form roterar, antal ökar), nionde rutan tom med ett streckat
   hörn, och under: tre små svarsalternativ där det rätta är kopparfyllt.
   Säger: "du ska hitta regeln och fylla luckan".
2. **Verbalt**: ett textblock (fem till sex linjer i dämpad kontur, en rad
   markerad med mjuk yta), bredvid tre korta rader med små cirklar:
   "Sant", "Falskt", "Går ej att avgöra", där en cirkel är koppar.
   Säger: "läs texten, ta ställning till påståendet".
3. **Numeriskt**: en tabell 3 × 3 med staplar eller tal i dämpad kontur, en
   cell markerad med mjuk yta, en liten klocka i hörnet (ring med två
   visare, kontur 3), en kopparfylld svarsruta. Säger: "läs av, räkna,
   under tid".
4. **Personlighet**: fem punkter på en linje (skala "stämmer inte alls" till
   "stämmer helt"), en koppar, och över den två korta påståenderader.
   Säger: "här finns inget rätt svar, bara ditt".
5. **Provläge**: ett blad med rutor i rad (frågor), varav de första är
   ifyllda i mjuk yta, en koppar på "här är du", och en tidslinje nertill
   med ett streck för provets längd. Säger: "som på riktigt, mot klockan,
   facit efteråt".

## Storlekar i vyerna

- Testkortet (dator 1200): bild 160 × 120 höger, text vänster, korten i en
  spalt med full bredd.
- Testkortet (mobil 412): bild över texten, höjd 96, centrerad, max-bredd 200.
- Introduktionen (dator): en scen 240 × 180 höger om texten på väggen.
- Introduktionen (mobil): ingen scen, bara de fyra små symbolerna i rad
  (48, befintliga).
- Hjälprutan "Vad är det här?": ingen bild. Hjälp är text.

## Förbjudet

- Sparkles, gnista, konfetti, emoji, stjärnor.
- Människor, ansikten, händer, hjärnor, glödlampor, raketer, trofér,
  medaljer, kugghjul, måltavlor med pilar.
- Bakgrundscirklar, färgade plattor bakom ikonen, ikonrader i färgade
  rutor.
- Mer än en kopparyta per bild.
- Gradienter, skuggor, blur, glow i SVG.
- Text som del av bilden (inga bokstäver eller siffror ritade som konturer,
  inga `<text>`). Undantag: siffror får antydas som korta streck.
- Hårdkodat vitt eller svart. `currentColor` och variabler.
- `<animate>` i SVG. Rörelse är CSS och bara i instrumenten.

## Leverans

`illustrationer.svg` med en `<symbol id="illu-matris">` osv per bild
(viewBox 0 0 160 120) så att jag kan `<use>` dem i skissen, plus
`illustrationer.html` som visar dem på papper, golv och vägg i ljust och
mörkt. README med en rad per bild om vad den säger.

## Granskning av leveransen (13:20)

Illustratörens fem testbilder och scenen `illu-scen-vagen` följer regeln och
är inlagda ordagrant i `skiss.html`. Två noteringar:

- Matrisens latinska kvadrat är bättre än min skiss: ingen rad kan läsas av
  för sig, så bilden ljuger inte om testet. Behåll.
- `marke-grund`, `marke-avancerad`, `marke-expert` stryks tills vidare. De
  är fint ritade men belönar nivåjakt, som specen tog bort ur resultatet.
  `illu-tomt-utveckling` behålls för det tomma tillståndet på Din utveckling.

Nya variabler att peka ut i `globals.css` när bilderna byggs som
komponenter: `--illu-dim` (ink-3 / vagg-svag) och `--illu-mjuk` (ton /
vagg-mjuk 18 %), utöver befintliga `--illu-fill` och `--illu-accent`.

Version 1.1, 2026-10-11, art-director.
