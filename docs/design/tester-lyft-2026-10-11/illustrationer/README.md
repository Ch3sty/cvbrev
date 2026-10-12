# Illustrationer: Tester-lyftet (2026-10-11)

Ritade efter `../riktning.md` (version 1): provbladet tecknat med lugn hand,
inga människor, inga metaforer, exakt en kopparyta per bild, ingen text i
bilden. Alla filer är inline-SVG utan hårdkodat vitt eller svart.

## Filer

| Fil | Vad |
|---|---|
| `illustrationer.svg` | Symbolarket. En `<symbol id="…">` per motiv, att inlina i sidan och `<use href="#illu-matris"/>`. |
| `illustrationer.html` | Galleriet: alla motiv på papper, golv och vägg, i ljust och mörkt läge, i 240 × 180, 160 × 120 och 128 × 96. Öppna direkt i webbläsaren. |
| `illu-*.svg`, `marke-*.svg` | Källan per motiv. Ändra här och kör `node bygg.mjs`, som skriver om arket och galleriet. |
| `bygg.mjs` | Bygger arket och galleriet ur källfilerna. |

## Motiven

### Testbilderna, viewBox 160 × 120, stroke 3, radie 8

| Symbol | Säger | Kopparytan |
|---|---|---|
| `illu-matris` | Du ska hitta regeln och fylla luckan. Rutnät 3 × 3 med cirkel, kvadrat och triangel i latinsk kvadrat (ingen rad kan läsas av för sig), nionde rutan tom med streckad ram, tre svarsalternativ till höger. | Det rätta svaret, kvadraten i mittenalternativet. |
| `illu-verbalt` | Läs texten, ta ställning till påståendet. Textblock med fem rader i dämpad kontur, en rad på mjuk yta, tre svar bredvid (sant, falskt, går inte att avgöra). | Den valda svarscirkeln. |
| `illu-numeriskt` | Läs av, räkna, under tid. Tabell 3 × 3 med tal antydda som streck, en cell på mjuk yta med sitt tal i stark kontur, klocka i hörnet. | Svarsrutan. |
| `illu-personlighet` | Här finns inget rätt svar, bara ditt. Två påståenderader över en skala med fem punkter, ändarnas etiketter antydda som streck. | Din punkt på skalan. |
| `illu-provlage` | Som på riktigt, mot klockan, facit efteråt. Blad med tio frågor i rad, tre gjorda på mjuk yta, tidslinje nertill med provets längd och gången tid i stark kontur. | Frågan du står på. |

Storlekar i vyerna enligt riktningen: 160 × 120 till höger om texten på
testkortet (dator), hela bredden med höjd 96 över texten (mobil, viewBox
bevarad, max-bredd 200). Galleriet visar även 240 × 180 för introduktionen.

### Scenen, viewBox 240 × 180, stroke 6, radie 8 till 10

| Symbol | Säger | Kopparytan |
|---|---|---|
| `illu-scen-vagen` | Vägen från ansökan via test till intervju. Ett spår i dämpad kontur, ansökan som blad, provbladet som lutar sex grader, intervjun som en bokad dag i kalendern. | Den ifyllda cellen i provbladet. |

Bara på dator, 240 × 180 till höger om texten på väggen. På mobil står de
fyra befintliga 48-symbolerna i rad i stället.

### Utanför riktning version 1, från den ursprungliga briefen

| Symbol | Säger | Kopparytan |
|---|---|---|
| `illu-tomt-utveckling` (160 × 120) | Kurvan ritas när du gjort ditt första test. Axlar, streckad kurva, tomma ringar där försöken kommer. Tomt tillstånd på fliken Din utveckling. | Punkten där du börjar, som i `SymPlan`. |
| `marke-grund`, `marke-avancerad`, `marke-expert` (120) | Nivåmärken på samma graverade kopparplatta som `MarkeMatning` och de andra: en trappa i tre steg, ett, två eller tre steg ifyllda i samma ljusa ton som märkenas gravyr. | Plattan är kopparytan. Gradienterna har egna id (`g-marke-niva*`) och krockar inte med konceptets `g-marke`. |

Storlekar för märkena som för de befintliga: 132 i kvitto, 48 vid rad, 24 i
legend. Riktningen tar inte upp dem; stryk om de inte behövs.

**Ingen ikon för hjälprutan.** Briefen bad om en "Vad är det här?"-symbol,
riktningen säger att hjälp är text. Riktningen gäller.

## Färg och underlag

Bilden byter aldrig; underlaget sätter variablerna. Värdena ur
`docs/designsystem.md` v3, Träningens rum:

| Variabel | Papper och golv, ljust | Papper och golv, mörkt | Vägg (båda lägen) |
|---|---|---|---|
| `currentColor` (kontur) | ink-1 `#1A1A1F` | ink-1 `#F3F2F7` | vagg-ink `#F5F6FC` |
| `--illu-dim` (rutnät, hjälplinjer, övriga svar) | ink-3 `#65656E` | ink-3 `#9391A1` | vagg-svag `#6F78B0` |
| `--illu-fill` (bladet, figurernas insida) | papper `#FFFFFF` | papper `#171B2E` | vagg-2 `#2B3470` |
| `--illu-mjuk` (markerad rad eller cell, gjorda frågor) | ton `#DFE3F6` | ton `#232B55` | vagg-mjuk 18 % |
| `--illu-accent` (kopparn) | `#E07A2F` | samma | samma |

`--illu-fill` och `--illu-accent` finns redan i `primitives.tsx`; `--illu-dim`
och `--illu-mjuk` är nya namn ur riktningen och behöver pekas ut i
`globals.css` när bilderna byggs som komponenter (inte gjort här, ingen kod
är ändrad). `--illu-accent` har `#E07A2F` som reservvärde så att källfilerna
går att öppna fristående; övriga variabler saknar reserv med avsikt.

## Granskning

Renderat med puppeteer mot Chrome 139 i 2× skala, alla sex ytor (tre
underlag × två lägen). Kontrollerat: en kopparyta per bild, figurerna skiljbara
i 128 × 96, den mjuka ytan synlig i mörkt läge, väggversionen utan vit
genomslag, märkena läsbara i 48. Det som inte håller i 24 är trappan i
märkena, vilket också gäller de befintliga märkena i den storleken.
