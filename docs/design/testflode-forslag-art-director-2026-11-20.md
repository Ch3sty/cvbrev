# Testsessionen: art directorns förslag

Art director, 2026-11-20. Mitt bidrag till den gemensamma planen (UX, saas-lead, art director) för hur rekryteringstesterna genomförs. Ägaren godkänner planen innan något byggs. Ingen kod, ingen artefakt.

Underlag: `docs/rapporter/testflode-inventering-2026-11-19.md`, cirka trettio skärmdumpar ur `scratchpad/testflode/` (desktop 1400×900 och Pixel 7 412×915), `src/app/globals.css`, `src/components/rum/**`, `src/components/shell/knappar.ts`, `PassShell`, `TestFlowShell`, `Klocka`, `Segmentstapel`, `Regelpanel`, `Startark`, `src/app/app/testklar.css`, spec-rummen avsnitt 3 och 4, mina tidigare beslut i `tester-lyft-2026-10-11` och `bankbredd-2026-11-19`.

Ägarens ord styr: smooth, snyggt, responsivt, konsekvent. Levande och påkostat, inte platt. Målgruppen är vuxna jobbsökare, så ingen barnslighet.

---

## 0. Diagnosen i tre meningar

Vi har tre skal, fyra svarsmodeller, fyra klockor och fem resultatdesigner. Inget av det är fult var för sig; figurseriernas Träna och övningsprovets startark håller redan nivån. Problemet är att användaren möter en ny produkt varje gång hon byter dörr, och att det hon ser under ett test (sidomeny, rutnät, "✓ 0 / 15", tre rubriker ovanför matrisen) tar fokus från uppgiften.

Lösningen är inte mer design utan **en enda sessionsram** som alla femton komponenter ritas i, med **en svarsgest**, **en klocka**, **en framstegsvisning**, **ett kortutförande** och **två skärmar runt sessionen** (start och resultat) som ser likadana ut i alla lägen.

---

## 1. Sessionsramen

Internt namn: **Sessionsramen** (`SessionsRam`). Namnet syns aldrig för användaren. Den ersätter `TestFlowShell`, `PassShell` och de två egna skalen i övningsprov och I-prov.

### 1.1 Anatomi

```
┌──────────────────────────────────────────────┐
│ [X]  Figurer och mönster          ( 18 )     │  HUVUD  56 px mobil, 64 dator, papper
│      Grundnivå                               │
│ ■■■■■■■■■■■□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□  │  FRAMSTEG  6 px, koppar på kant
├──────────────────────────────────────────────┤
│                                              │
│   [ underlag ]   sticky på mobil, egen scroll │  FRÅGEYTA  golv, enda scrollytan
│                                              │
│   Uppgiften                                  │
│   Alternativen                               │  SVARSYTA  en del av frågeytan
│                                              │
├──────────────────────────────────────────────┤
│ Föregående              [ Nästa ]            │  FOT  72 px + safe-area, papper
└──────────────────────────────────────────────┘
```

Fyra delar, alltid i den här ordningen, alltid med samma höjder. Det som varierar mellan testtyper bor enbart i frågeytan.

**Huvudet.** X till vänster (44×44 träffyta, `IkonX`, aldrig lucide). Titel 15/20 600 `text-ink-1`, undertitel 12/16 500 `text-ink-3`. Titeln är testtypens namn som det står i Tester ("Figurer och mönster", aldrig "Logiktest"); undertiteln är läget och nivån ("Grundnivå", "Träna, nivå 3", "Nivåkollen", "Övningsprov, Alva-format", "Deltest 1 av 6, synonymer"). Till höger står klockan (1.7) när läget har tid. Inget räknetal i huvudet: antalet och positionen bärs av framstegsstapeln och finns i dess `aria-label`. "✓ 0 / 15" försvinner för gott, det läses som antal rätt.

**Framstegsstapeln.** 6 px hög, full bredd, direkt under huvudet, `bg-kant` med kopparfyllning. Två former med samma mått: *kontinuerlig* (en yta som växer, Träna och nivåtest med fast lista) och *segmenterad* (ett segment per uppgift med 3 px luft, övningsprov och I-prov där man får gå tillbaka). Segmenten är klickbara i fasta format; träffytan är 24 px hög även om linjen är 6. Tryck på stapeln i ett fast format öppnar **översikten** som ett ark nerifrån (uppgiftsrutnät med 44 px celler, besvarade i ton, aktuell i bläck, hoppade i koppar-ljus). Rutnätet lämnar alltså frågeytan, där det i dag konkurrerar med uppgiften (deduktiv, spatial, personlighet).

**Frågeytan.** Golvets färg (`bg-golv`, i Träningens rum #EBEDF6). Två slots: *underlag* (text, tabell, diagram, premisser) och *uppgift + alternativ*. På mobil är underlaget sticky med egen scroll och höjd högst 38 vh (`VnUppgift`-mönstret), så att uppgiften och minst första raden alternativ alltid syns under det. Rullar gör bara underlaget, aldrig alternativen.

**Svarsytan.** Ligger i frågeytan, direkt under uppgiften, 16 px luft. Aldrig i foten, aldrig i ett eget kort.

**Foten.** Papper, `border-t border-kant`, innehåll 48 px knapp med 12 px över och under = 72 px, plus `env(safe-area-inset-bottom)`. Exakt en `KNAPP_PRIMAR`. Sekundär handling som `LANK` till vänster i samma rad ("Föregående") eller på en egen 36 px rad under ("Vet inte, visa regeln"). Foten finns i alla lägen, även där svaret bekräftas automatiskt i dag, så att knappen alltid står på samma ställe.

### 1.2 Mått och maxbredder

Ramens spalt (huvud, framsteg, fot) är **640 px** centrerad på dator, full bredd med 16 px marginal på mobil. Den flyttar sig aldrig, oavsett innehållsform; X, klockan och knappen står på samma pixel från fråga 1 till resultatet.

Frågeytans kolumn väljs av innehållsformen:

| Innehållsform | Mobil | Dator | Används av |
|---|---|---|---|
| **Smal** | fluid, max 320 px matris | 432 px | Matris, spatial, talserie, ordförråd |
| **Mellan** | fluid | 640 px | Verbal, numerisk, personlighet, I-provets ordtester |
| **Remsa** | fluid, två remsor om 3 | 672 px, sex i rad | Figurserier |
| **Bred** | fluid, premisser sticky | 1000 px, två spalter 400 + 560 | Deduktiv, numerisk med brett diagram |

Luft: 16 px mellan underlag och uppgift, 16 px mellan uppgift och alternativ, 8 px mellan alternativrader, 10 px mellan alternativrutor. Marginal 16 px mobil, 24 px dator.

Två hårda regler som i dag bryts:

- **Mobil 412×915:** uppgiften och minst första raden alternativ ska synas utan rullning i alla typer. Matrisen får därför högst 320 px på mobil (cellerna blir 104 px, fortfarande större än Matrigmas), så att A till C och D till F ryms under den. Verbala passagen får aldrig trycka ned första påståendet (sticky underlag 38 vh).
- **Dator 1400×900:** hela uppgiften, alla alternativ och foten utan rullning för bildformer. Textformer får rulla i underlaget, aldrig i alternativen. Numeriskt löser det genom att underlaget går i vänster spalt och frågan med alternativ i höger (samma `DeduktivLayout` som deduktiv), i stället för diagram över svar.

### 1.3 Typskala i sessionen

| Roll | Mobil | Dator | Snitt | Token/klass |
|---|---|---|---|---|
| Titel i huvudet | 15/20 600 | samma | Inter | `text-ink-1` |
| Undertitel i huvudet | 12/16 500 | samma | Inter | `text-ink-3` |
| Uppgiftens fråga ("Vilken figur passar?") | 20/26 700 | 24/30 | display | `text-ink-1`, `text-wrap: balance` |
| Instruktionsrad under frågan | 14/20 | samma | Inter | `text-ink-2` |
| Underlagstext (passage, premiss) | 16/26 | 17/28 | Inter | `text-ink-1`, max 640 px (cirka 70 tecken) |
| Ord i ordförråd och synonymer | 32/36 800 versaler | 40/44 | display | `text-ink-1`, `letter-spacing: .02em` |
| Talrad i talserier | 24/28 700 tabular | 28/32 | display | `text-ink-1` |
| Alternativtext | 16/22 500 | samma | Inter | `text-ink-1` |
| Bokstav på brickan | 12/16 700 | samma | Inter | se 1.5 |
| Klockans tal | 13/16 700 tabular | samma | display | `text-ink-1`, koppar-ink sista två minuterna |
| Facitarkets rubrik ("Rätt", "Inte den här") | 12/16 600 versaler | samma | Inter | `text-ey` |
| Regeln i facitarket | 18/23 700 | samma | display | `.regelpanel-regel` |
| Misstaget | 14/20 | samma | Inter | `text-ink-2` |

Ny utility: `.text-fraga` (20/26 → 24/30, 700, display, balance). Allt annat finns redan. Inga egna storlekar i komponenterna.

### 1.4 Färgroller

Fem tillstånd, samma tokens i alla typer och i båda skärmlägena:

| Tillstånd | Kant | Yta | Bricka | Text |
|---|---|---|---|---|
| Neutral | `kant` 1 px | `papper` | `papper-2`, text `ink-2` | `ink-1` |
| Hover (pekare) | `kant-stark` | `papper` | samma | samma |
| **Vald** | `ink-1` 2 px (inset) | `papper` | `ink-1`, text `papper` | `ink-1` |
| **Rätt** (bara efter facit) | `positiv` 2 px | `positiv-mjuk` | `positiv`, vit bock | `ink-1` |
| **Fel** (bara det valda, efter facit) | `fel` 2 px | `fel-mjuk` | `fel`, vitt kryss | `ink-1` |
| Dämpad (övriga efter facit) | `kant` | `papper` | `papper-2` | opacitet .38 på hela kortet |
| Fokus | `--fokus` 2 px ring, 2 px offset | | | |

Kopparn har två roller i sessionen och bara två: **handlingen** (knappen) och **framsteget** (stapeln, segmenten, klockan på slutet). Den är inte längre färgen för "rätt svar". I dag ritas det rätta alternativet i koppar (`PassFraga`, `.ratt-fylld`), vilket gör att facit och knapp har samma kulör och att ögat inte ser skillnad på "det här kan du trycka på" och "det här var rätt". Rätt blir `positiv`, fel blir `fel`; båda har mjuka ytor och mörka varianter i tokens redan. Luckan i matrisen fylls efter facit med figuren i `ink-1` och en 2 px `positiv`-ram, inte i koppar-bläck.

Regeln från Provbladet att resultatväggen aldrig är röd står kvar: rött finns bara på det kort hon valde fel, under sessionen, i Träna. Aldrig i rubriker, aldrig i tal, aldrig på väggen.

Tvåpixelkanten ritas som `box-shadow: inset 0 0 0 1px` ovanpå 1 px `border`, inte som bredare border, så ingenting flyttar sig när tillståndet byter (CLS 0).

### 1.5 Ett enda kortutförande

Alla svarsalternativ i alla typer är **Svarskort** i en av två former. Samma komponent, samma tillstånd, samma bricka, samma rörelse.

**Rad** (text, tal, påstående): min-höjd 56 px, radie 14, padding 14 px 16 px, brickan 24 px rund till vänster med 12 px luft, texten vänsterställd. Används av deduktiv, numerisk, talserie, ordförråd, verbal expert, I-provets ordtester, personlighetens Likert (fem rader på mobil, fem kort i rad på dator med samma tillstånd).

**Ruta** (figur): kvadrat, min 80 px, radie 14, brickan 24 px uppe till vänster, figuren centrerad med 12 px marginal. Används av matris (3 kolumner), spatial (2 kolumner), figurserie (remsa om 6 på dator, 2×3 på mobil).

Verbalts tre svar "Sant / Falskt / Går inte att avgöra" blir tre **rader** utan bricka, inte tre pillerknappar; en enda design även där.

Brickan är nyckeln till kortens släktskap. Den bär bokstaven i neutralt läge, bokstaven i vitt på bläck när valt, en bock när rätt, ett kryss när fel. Den flyttas aldrig och byter aldrig storlek.

### 1.6 Ikonografi

Allt ur `RumSymboler` (24, stroke 1,75): `IkonX`, `IkonTillbaka`, `IkonCheck`, `IkonChev`, `IkonFraga`, `IkonInfo`. Tre nya i samma familj: `IkonKryss` (fel på brickan), `IkonKlocka` (startarkets regel), `IkonFlagga` ("Något ser fel ut"). Testtypens glyf (`TestGlyfer`, 48) står på startarket och resultatet, aldrig i huvudet under sessionen. Lucide försvinner ur sessionerna helt.

### 1.7 Klockan

En klocka för hela produkten: **ringen** (`Klocka`, 36 px i huvudets högra hörn, 40 på dator). Den töms medurs, visar hela minuter, går över till m:ss de sista två minuterna och blir koppar. Inget blinkar.

Tre lägen för ringen:

- *Provets tid* (nivåtest, övningsprov, I-provets deltest): räknar ned från budgeten.
- *Uppgiftens tid* (Alva-format, Träna när testansvarig vill ha tempo per uppgift): fylls om per uppgift.
- *Ingen ring* (Nivåkollen, personlighet): hörnet är tomt. Nivåkollen har ingen tidspress att visa; tempot sparas ändå.

Uppräkningen "00:42" utan gräns och den 4 px tidsraden med "provets tid 1:23" pensioneras som synliga element. Tiden per uppgift mot provets tid står i stället i facitarket efter svaret ("29 s, provets tid 80 s") och i resultatets tempokort, där den betyder något. Det som skickas till servern (`timeSpent`, `tid`) ändras inte.

### 1.8 Mörkt läge

Allt ovan löser sig i tokens: golv, papper, kant, ink, positiv, fel, koppar-ink har mörka värden i rummet redan. Tre saker att vakta:

- Skuggan `shadow-lyft` syns inte på mörkt golv; Svarskort har därför aldrig skugga, bara kant. Matrisytan och underlagskortet får `border-[color:var(--lyft-kant)]` som LyftKort.
- Numeriska diagram är i dag hårdkodade i orange, rött och rosa (se skärmdumpen `numerisk-grund-fraga1-desktop`). De ska ritas i `diagram-test` med fyra ljushetssteg (100, 75, 55, 40 procent) och `ink-3` för axlar, så att de håller i båda lägena och inte skriker. Samma regel som bankbredden: aldrig åtta kulörer.
- Figurer i matris och figurserie följer redan `.matrisyta`-regeln (ink, papper, kant-stark). Den utvidgas till spatial och figurserie, som i dag ritar i fasta färger.

---

## 2. Ramen i rummet, och i Testklar

### 2.1 Rummet dimmas, det försvinner inte

Sessionen är ett läge, inte en sida. Under sessionen finns **ingen vägg, ingen sidomeny, inget dörrnav**; ramen tar hela viewporten (`fixed inset-0`, utan `lg:left-[248px]`). Rummet finns kvar som golvets kulör (indigo-tonat #EBEDF6) och i kopparn. Det räcker för att hon ska veta var hon är; allt annat tar fokus från uppgiften. Duolingo gör exakt så: lektionen täcker appen.

Väggen kommer tillbaka på de två skärmar som ramar in sessionen: **startarket** och **resultatet**. Där står rummets mörka indigo, display-rubriken, glyfen och scenen. Rytmen blir: vägg (start) → golv (sessionen, lugn) → vägg (resultatet, avslöjandet). Det är en dramaturgi i tre akter, och den är densamma i alla lägen.

Koppar under sessionen: knappen och framstegsstapeln. Inget annat. Inga kopparrubriker, inga kopparpunkter på kort, ingen kopparfylld figur.

### 2.2 Samma sessionsvisning i Testklar

Appen ritar redan samma sidor via proxyn, i samma React-träd, under `[data-mobilapp]`. Sessionsramen ska därför inte veta om den står i appen. Det som skiljer är typsnittet och tre detaljer:

- **Snittet.** Ramen använder `var(--font-sess-display)` och `var(--font-sess-text)`. På webben pekar de på Schibsted Grotesk och Inter (`--font-display`, standard). `[data-mobilapp]` sätter dem till `--tk-disp` (Bricolage Grotesque, `opsz` 32 för frågor, 48 för ord) och `--tk-text` (Figtree). Inga klassnamn med `font-display` i sessionskomponenterna; bara de två variablerna.
- **Färgerna.** Appens `--a-bg`, `--a-papper`, `--kop` är egna namn för samma roller. Appen mappar dem till rummets tokens på sin rot (`--golv: var(--a-bg)` och så vidare), så att ramen läser `--golv`, `--papper`, `--koppar`, `--positiv`, `--fel` överallt. Appen har bara ljust läge, det är ett värde i samma tokens.
- **Knappen.** `tk-knapp.kop` är 52 px med vit text; `KNAPP_PRIMAR` är 48 px med mörk text. I sessionen gäller webbens knapp i båda, så att foten är identisk. Appens övriga vyer rör vi inte.
- **Android-tillbaka** gör samma sak som X (finns redan). Haptik (Capacitor Haptics, `impact light`) vid rätt och fel i Träna, bara i appen, aldrig ljud.

Ingen tvillingkod. En sessionsram, två typsnittspar.

---

## 3. Startark och resultat som mallar

### 3.1 Startarket

Övningsprovets `Startark` är den enda skärmen i produkten som säger vad som gäller innan man börjar. Den blir mallen för alla lägen. Anatomi, uppifrån:

1. **Topprad på väggen** med `IkonTillbaka` till vänster och lägets namn centrerat ("Nivåkollen", "Grundnivå", "Träna", "Övningsprov", "I-provet").
2. **Eyebrow** i koppar-ljus: testtypens namn.
3. **Rubrik** `.text-h1`: lägets rubrik ("Nivåkollen i figurer och mönster", "Figurer och mönster, grundnivå", "Träna två rutor läggs ihop", "Övningsprov mot klockan", "Övningsprovet").
4. **Scenen**: Provbladets illustration (160×120 på dator till höger om texten, 96 px hög över texten på mobil) i vagg-ink-kontur med vagg-2-yta och en kopparyta. Samma SVG som på testkortet. Alla åtta typer får en, de fyra som saknas (figurserier, deduktiv, talserier, spatial, ordförråd) ritas i samma riktning som `tester-lyft-2026-10-11/riktning.md`.
5. **Tre regler** i tre rader, alltid tre, alltid i samma ordning: *Omfång* ("12 uppgifter, cirka 8 minuter"), *Återkoppling* ("Rätt svar efteråt" eller "Regeln efter varje svar"), *Vad som sparas* ("Nivån räknas, provet går att göra om i morgon"). Ikon 28 px till vänster, rubrik 14/600, rad 12/16.
6. **Det lyfta kortet** med exakt en kopparknapp ("Starta") och en fotnot ("Avbryter du sparas inget resultat"). Knappen står i foten på mobil (spec 16.3.1), aldrig på väggen.

Varianter per läge, bara i innehållet:

| Läge | Regel 1 | Regel 2 | Regel 3 | Extra |
|---|---|---|---|---|
| Nivåkoll | 12 uppgifter, cirka 8 min, svårigheten följer dina svar | Rätt svar efteråt | Nivån räknas, en gång om dagen | |
| Nivåtest | 15 frågor, 20 min | Rätt svar efteråt | Resultatet syns i Din utveckling | "Fortsätt där du var" när en session är öppen |
| Träna | 6 uppgifter, egen takt | Regeln efter varje svar, "Vet inte" visar den direkt | Nivån rör sig högst ett halvt steg | Kortare: arket är ett ark nerifrån på mobil |
| Övningsprov | som i dag | Ingen hjälp under tiden | Obesvarade räknas som fel | formatväljare när flera format finns |
| I-provet | halva/hela | Deltesten i ordning, ingen väg tillbaka | lista med sex deltester | mellanskärm per deltest i samma mall, kortad |

Träna får också ett startark. Det är en friktionsfråga som UX kan tycka annorlunda om (se 7). Mitt skäl: utan startark finns ingen plats för "vad händer nu", och sessionen i dag börjar med ett laddskelett som blir fråga 1 utan förvarning. Arket är serverrenderat, knappen är i bild, och på mobil är det ett ark nerifrån som stängs med ett tryck. Det kostar en sekund och ger ett sammanhang.

### 3.2 Resultatet

`TestResultsPage` är mest komplett och redan gemensam för åtta typer. Den blir mallen, med `PassResultatVy`:s nivåskala som tillägg. En vy, fyra block, alla lägen:

1. **Väggen, avslöjandet.** Topprad med X och lägets namn. Ring 56 px som fylls till andelen rätt. Eyebrow i koppar-ljus ("Testet klart", "Nivåkollen klar", "Träningen klar", "Övningsprovet klart"). **Ett huvudtal** i `.text-h1-liten` ("12 av 15 rätt", eller "Nivå 5,4" när läget mäter nivå). Under det **två tal**, aldrig tre (tid och tempo, eller nivå och tempo). En mening i vagg-mjuk. Nivåskalan ritas när läget rör nivån (Nivåkoll, Träna, övningsprov). Fyrstegsavslöjandet (`.steg s1..s4`, 120/420/720/1020 ms) i alla lägen inom tio minuter.
2. **Genomgången** som LyftKort: rubrik med antal, miniatyrer av de missade, kopparknappen "Gå igenom", länk "Visa alla". Finns i alla lägen, även matrisens Nivåkoll som saknar den i dag.
3. **Var du tappade** och **Tempo mot provets tid** som Kort, samma som i dag.
4. **Statusraden** med nästa steg och en länk.

Två saker som varierar: huvudtalet (rätt eller nivå) och vad statusraden föreslår. Allt annat är identiskt. Träna-kortlistan (`VnResultatVy`, `Steg2ResultatVy` med flera) försvinner.

### 3.3 Illustration och maskot

Ingen maskot i produkten. Riktningen från oktober står: provbladet, tecknat med lugn hand, inga figurer, inga metaforer. Målgruppen är vuxna som ska klara Matrigma på måndag; en figur som hejar på dem tar bort allvaret vi säljer. Pedro hör till sociala kanaler och stannar där.

Det levande kommer i stället från tre saker: **scenerna** (en per testtyp, i rörelse 600 ms när arket öppnas, kontur ritas in med `rita`), **märkena** (`marke-grund/avancerad/expert` finns, används på resultatet när en nivå klaras första gången, 72 px, `marke`-animeringen), och **avslöjandet** på resultatväggen. Det är påkostat utan att vara barnsligt.

Om ägaren ändå vill ha en figur: den ska i så fall vara ett föremål, inte en varelse (en penna, ett provblad som viker sig), och den får aldrig stå i sessionen. Men jag avråder.

---

## 4. Rörelse och mikroåterkoppling

Alla tider i millisekunder, alla kurvor som i tokens. Kurvan för "något kommer fram" är `cubic-bezier(.2,.8,.2,1)` (finns i `tk-ark` och `marke`); för "något byter läge" `ease-out`. Rörelse bara på `transform` och `opacity`, aldrig på höjd, bredd eller marginal.

| Ögonblick | Vad rör sig | Tid | Kurva |
|---|---|---|---|
| Tryck på kort (pekare ned) | `scale(.985)` | 90 | ease-out |
| Släpp | tillbaka till `scale(1)` | 140 | ease-out |
| Markera | kant → `ink-1`, brickan fylls | 120 | ease-out |
| Avmarkera | tillbaka | 120 | ease-out |
| Bekräfta, rätt (Träna) | kant → `positiv`, yta → `positiv-mjuk` | 160 | ease-out |
| Bocken på brickan | `scale(.6)` → `1`, opacitet 0 → 1 | 240 | `.2,.8,.2,1` |
| Bekräfta, fel (Träna) | valt kort kant → `fel`, yta → `fel-mjuk` | 160 | ease-out |
| Rätt svar visas efter fel | rätt kort kant → `positiv`, 120 ms efter felet | 160 | ease-out |
| Övriga kort dämpas | opacitet → .38 | 160 | ease-out |
| Facitarket | `translateY(100%)` → 0, från fotens överkant | 280 | `.2,.8,.2,1` |
| Nästa uppgift, ut | opacitet → 0, `translateX(-12px)` | 120 | ease-in |
| Nästa uppgift, in | opacitet 0 → 1, `translateX(16px)` → 0 | 200 | ease-out |
| Framstegsstapeln | `scaleX` till ny andel | 240 | ease-out |
| Segment fylls | yta → `ton-ink` | 160 | ease-out |
| Klockans ring | `stroke-dashoffset` | 1000 | linear, per tick |
| Klockan blir koppar | `stroke` och text | 300 | ease-out |
| Sista svaret → resultat | ramen tonar ut 160, väggen tonar in 240 | 400 | ease-out |
| Resultatets avslöjande | `.steg s1..s4` | 260 vardera, start 120/420/720/1020 | ease-out |
| Ringen på resultatet | `fyll` till andelen | 500, start 300 | ease-out |
| Märke | `scale(.92)` → 1 | 600, start 200 | `.2,.8,.2,1` |

Inget skakar. Fel svar i Duolingo är rött och stilla; vuxna behöver inte mer. Ingen konfetti. Inget ljud på webben; haptik bara i appen.

**Framstegsstapeln i Träna** växer vid bekräftat svar, inte vid "Nästa", så att belöningen kommer samtidigt som facit. I test växer den när nästa uppgift ritas.

**Nästa uppgift** rullar frågeytan till toppen innan den nya ritas (som `PassShell` gör via `nyckel`), så att inkommande uppgift aldrig syns halvvägs.

**`prefers-reduced-motion: reduce`:** alla `transition` och `animation` till `none`, facitarket står på plats direkt, stapeln hoppar, avslöjandet visar allt på en gång, `scrollBy` utan `smooth`. Regeln finns redan i `globals.css` för `.motion` och utvidgas till `[data-sessionsram]`.

**CLS 0:**
- Tillstånd via `box-shadow` och färg, aldrig via `border-width`.
- Facitarket ligger `position: absolute` ovanför foten inuti ramen, frågeytan har redan `padding-bottom` lika med arkets maxhöjd reserverad när läget är Träna. Ingenting under flyttas när arket kommer.
- Alla figurer har `aspect-ratio`, underlagskortet har `min-height` lika med sin första rendering.
- Klockans tal är tabular och ringen har fast bredd, så "20" och "1:59" tar samma plats.
- Knappen i foten byter text ("Svara" → "Nästa") utan att byta bredd (full bredd).

**Prestandabudget** (inloggat: LCP 1,5 s för flöden, CLS 0): startarket och första uppgiften serverrenderas; verbal och numerisk, som i dag väljer frågor i klienten, får sin första fråga ur servern eller behåller klienturvalet med en serverrenderad skelettfri första bild. Inget laddskelett som blir fråga 1 utan övergång.

---

## 5. Återkopplingens form: Träna mot test

Två lägen, och användaren ska se vilket hon är i utan att läsa.

### 5.1 Träna: facitarket

Efter bekräftat svar glider **facitarket** upp från foten (280 ms). Det är en vidareutveckling av `Regelpanel`, flyttad från frågeytan till ett ark som delar yta med foten, så att knappen "Nästa" står *inne i arket* som i Duolingo. Arket har färg efter utfallet:

- **Rätt:** yta `positiv-mjuk`, bock 24 px i `positiv`, eyebrow "Rätt" i `positiv`, tiden i `ink-3` till höger ("29 s, provets tid 80 s").
- **Fel:** yta `fel-mjuk`, kryss 24 px i `fel`, eyebrow "Inte den här" i `fel`, tiden som ovan.
- **Vet inte:** yta `ton`, eyebrow "Regeln" i `ton-ink`. Inget kryss, inget rött; att be om regeln är inte ett fel.

Under eyebrow: regeln i 18/23 display (bankens `rule`), misstaget för det valda alternativet i 14/20, "Något ser fel ut" som `LANK`, och kopparknappen "Nästa". Arket får högst 60 vh på mobil och scrollar inuti om regeln är lång; matrisen ovanför krymper aldrig, och luckan fylls med rätt figur (1.4).

Kortens tillstånd (rätt, fel, dämpad) sätts samtidigt som arket kommer, 120 ms före, så att ögat först ser svaret och sedan förklaringen.

Talseriens Träna (`Steg2PassFlode`) byter i dag hela vyn mot en genomgång med regeln högst upp. Det försvinner; talraden står kvar där den var och arket kommer underifrån som för alla andra.

### 5.2 Test, Nivåkoll, övningsprov, I-provet: tystnaden

Inget ark. Efter bekräftat svar byter kortet till **vald** (bläck), stapeln växer, nästa uppgift kommer (320 ms). Ingen färg som avslöjar något, ingen bock, ingen regel. Att det är tyst är i sig signalen "det här räknas".

Raden "Ingen återkoppling under tiden" som i dag ligger ovanför fråga 1 i Nivåkollen flyttar till startarkets regel 2 och försvinner ur sessionen.

Reglaget "Förklarande text av" i matrisens nivåtest tas bort. Det är ett tredje läge som ingen bad om, och det står mitt i sessionen.

### 5.3 En svarsgest överallt

Det här är det beslut som bär resten: **tryck markerar, kopparknappen bekräftar**, i alla lägen och alla typer. I Träna heter knappen "Svara" och blir "Nästa" i arket. I test heter den "Nästa" (sista: "Lämna in", med bekräftelse). Tangentbord: a till f markerar, Enter bekräftar, vänsterpil "Föregående" där den finns; lyssnarna ignorerar tryck när ett ark eller en dialog är öppen.

Auto-nästa efter 150 ms (matris, figurserie, talserie, spatial, ordförråd, I-provet) pensioneras. Det går fort men känns otryggt, särskilt på mobil där ett feltryck inte går att ta tillbaka, och det gör att Träna och test kräver olika gest. Matrigma, Alva och SHL bekräftar; att öva med samma gest som provet är en del av träningen. Adaptiva lägen där servern väljer nästa fråga fungerar identiskt: knappen väntar på svaret, med en 200 ms skelettfri spinner i knappen om servern är långsam.

---

## 6. Identiskt överallt, och vad som får variera

### 6.1 Identiskt i alla lägen och typer

| Element | Regel |
|---|---|
| Huvudet | 56/64 px, X vänster, titel + undertitel, ring höger eller tomt. Aldrig ett räknetal i text. |
| Framstegsstapeln | 6 px, koppar på kant, kontinuerlig eller segmenterad. |
| Foten | 72 px + safe-area, en kopparknapp, sekundär som länk. Finns alltid. |
| Svarsgesten | Tryck markerar, knappen bekräftar. |
| Svarskortet | Rad eller ruta, samma bricka, samma fem tillstånd, samma tider. |
| Klockan | Ringen, eller inget. |
| Stäng | X med samma bekräftelsedialog i alla lägen ("Avsluta?" med "Avsluta och se resultat" / "Fortsätt"). Aldrig utan bekräftelse när svar finns. |
| Lämna in | Alltid med bekräftelse. |
| Startarket | Samma mall, tre regler, en knapp. |
| Resultatet | Samma vägg, samma fyra block, ett huvudtal och två tal. |
| Facitarket | Samma ark i alla Träna-typer. |
| Typskalan | 1.3, inga egna storlekar. |
| Färgrollerna | 1.4, inga egna kulörer. |
| Rörelsen | Tabellen i 4, inga egna tider. |
| Ordvalen | Typens namn som i Tester, nivån "grundnivå" överallt, enheten "uppgift" överallt utom personlighet ("påstående"). Copywritern äger listan, men ett ord per sak. |

### 6.2 Får variera, med regel

| Typ | Innehållsform | Vad som är eget | Regel |
|---|---|---|---|
| Matris | Smal | matrisytan 3×3 med radie 16, sex rutor | Luckan fylls efter facit i ink med positiv ram |
| Figurserie | Remsa | serien som remsa, sex rutor på rad | Två remsor om tre på mobil, aldrig 3×2-rutnät som matrisen |
| Spatial | Smal | figuren i ett underlagskort, fyra rutor 2×2 | Figurkortet är underlagsslotten, sticky på mobil |
| Talserie | Smal | talraden i display tabular, fem rader | Talraden är underlagsslotten |
| Ordförråd, synonymer, motsatsord | Smal | ordet i versaler display, fyra till fem rader | Ordet är underlagsslotten, centrerat |
| Deduktiv | Bred | premisserna i underlagskort, fyra till fem rader | Två spalter på dator, sticky premisser på mobil |
| Verbal | Mellan | passagen i underlagskort, ett påstående i taget, tre rader | Alltid ett påstående per skärm, även i nivåtest (fyra påståenden på samma skärm försvinner); passagen sticky |
| Numerisk | Bred | tabell eller diagram i underlagskort, fyra rader | Underlag vänster på dator, sticky på mobil; diagram i `diagram-test`-skalan |
| Personlighet | Mellan | påståendet som uppgift, fem rader (Likert) | Samma kort som alla andra; orange-röda gradienten och framer-motion försvinner; ingen klocka |
| I-provet | Smal/Mellan efter deltest | mellanskärm per deltest | Mellanskärmen är startarkets mall, kortad till rubrik, två regler, knapp |

Det som får variera är alltså bara *vad som står i underlagsslotten och hur många kort i vilken form*. Inget annat.

---

## 7. Mina tio ställningstaganden, och var jag tror att UX eller saas-lead tycker annorlunda

1. **Tryck markerar, knappen bekräftar, överallt.** Auto-nästa försvinner. UX kan invända att det är ett extra tryck per uppgift och att bildtesterna är snabba i dag. Mitt svar: en gest att lära, inga feltryck på mobil, och samma gest som i riktiga prov. Om det måste finnas ett snabbläge är det en inställning, aldrig en standard, och aldrig olika per typ.

2. **Sidomenyn och dörrnavet döljs under sessionen.** saas-lead kan vilja ha vägen till betalväggen eller andra tester ett klick bort. Mitt svar: betalväggen möter henne på startarket och resultatet, där den hör hemma; under sessionen ska hon bara se uppgiften.

3. **Rätt är grönt, fel är rött, koppar är bara handling och framsteg.** Det bryter mot "koppar är svaret" i Provbladets illustrationer och mot `.ratt-fylld`. Illustrationsregeln står kvar för bilder; i sessionen behöver ögat tre färger med olika betydelse. Resultatväggen är fortfarande aldrig röd.

4. **Ingen maskot.** Ägaren sa Duolingo; Duolingo har Duo. Jag säger att vuxna jobbsökare får sitt "levande" från scener, märken och avslöjande, inte från en figur. Pedro stannar i sociala kanaler. Det här är det ställningstagande som har störst chans att ändras av ägaren.

5. **Startark i alla lägen, även Träna.** UX kan tycka att det är friktion för den som tränar varje dag. Mitt svar: ett ark nerifrån på mobil, serverrenderat, ett tryck. Det ger plats för reglerna, "Fortsätt där du var" och betalväggen, och det tar bort laddskelettet som blir fråga 1.

6. **En klocka: ringen. Tidsraden och uppräkningen pensioneras.** Testansvarig kan vilja ha "provets tid" synlig per uppgift i Träna som tempoträning. Mitt svar: tiden står i facitarket efter svaret och i tempokortet på resultatet; en stapel som fylls medan man tänker stressar utan att hjälpa. Datan som sparas är oförändrad.

7. **Framsteg visas bara som stapel, aldrig som "n / N" i huvudet.** UX kan vilja ha talet synligt. Mitt svar: talet finns i `aria-label` och i översikten (tryck på stapeln). Visuellt bär stapeln positionen bättre än "7 / 15", och "✓ 0 / 15" ska bort för att det läses som antal rätt.

8. **Rutnätet med frågenummer lämnar frågeytan** och blir en översikt i ett ark. Det är ett byte som UX kan ifrågasätta för övningsprovet, där man hoppar mellan uppgifter. Segmenten i stapeln är klickbara och arket är ett tryck bort; rutnätet under alternativen är det som i dag trycker ned deduktivs och spatials svar.

9. **Verbalt visar ett påstående i taget även i nivåtestet.** Det ändrar nivåtestets form (fyra påståenden per passage på samma skärm i dag). Testansvarig kan mena att provleverantörerna visar flera. Mitt svar: Nivåkollen, Träna och övningsprovet gör redan ett i taget, och det är det enda som får plats på mobil med passagen synlig.

10. **Reglaget "Förklarande text av" och personlighetens egna gradient, framer-motion och 15 px höga översiktsknappar tas bort.** Ingen tredje väg i sessionen, inga egna färgskalor. Personlighetstestet får samma kort och samma ark som allt annat; dess Likert är fem rader.

Utöver de tio: facitarket med knappen *inne i arket* (5.1) är nytt för oss och närmast Duolingo av allt i förslaget. Jag tror UX håller med, men det ändrar `Regelpanel` i grunden.

---

## 8. Vad som inte är mitt bord

Ordlistan (vilket ord för typ, nivå, enhet, knapp, dialog) ägs av copywritern med inventeringens avsnitt 3 som underlag; jag ställer bara kravet *ett ord per sak*. Tidsgränserna, antalet uppgifter per läge, adaptiv logik och vad som räknas som nivå ägs av testansvarig. Sparande, routes, mätpunkter och kvoter är byggarens och saas-leads; inventeringens avsnitt 7 listar vad som inte får gå sönder. Prissättning och var betalväggen står på startarket avgör saas-lead.

Ett byggförslag i steg, om planen godkänns: (1) tokens och `.text-fraga`, Svarskort och Sessionsramen som tomma skal med Storybook-liknande QA-sida; (2) figurseriernas Träna flyttas in först (bästa sessionen i dag, minst att ändra), sedan matris; (3) startark och resultat som mallar; (4) resterande typer i ordning efter trafik; (5) Testklar verifieras på Pixel 7 efter varje steg. Riktig webbläsartest som ny användare före varje "klart", enligt husreglerna.
