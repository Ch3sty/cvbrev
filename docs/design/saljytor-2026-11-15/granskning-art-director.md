# Granskning av säljytorna, form (art-director), 2026-11-15

Underlag: `inventering.md` i samma mapp, komponenterna i `src/components/artiklar/reklam/`, `src/components/publikt/`, `src/components/paywall/`, `src/components/kampanj/`, `src/components/traning/ImorgonKort.tsx`, `src/components/shell/InstallPrompt.tsx`, `src/components/shared/StickyMobileCTA.tsx`, samt `publikt.css`, `innehall.css` och `globals.css`. Dev-servern var inte igång och QA-bilder ligger inte i git, så bedömningen är gjord ur koden. Copy och innehåll granskas av svensk-ux-copywriter och testansvarig; här står bara form.

Ägarens regel i alla förslag: data som bild, inte text. Aldrig Sparkles.

## 0. Helhetsbild

Säljytorna lever i två visuella världar, och det är rätt:

- **Publikt (pub-/ib-klasserna)**: papper på bordet, rummets ton som yta med sex pixlars vänsterkant i rummets bläck, pillerknapp i koppar-toning (999 px), radie 20 till 24, Schibsted Grotesk 800 i rubriker. GratisKortet är den ljusa, streckade varianten i den världen.
- **Inloggat (Rummen)**: papper, `border-kant`, radie 16, `KNAPP_PRIMAR` i koppar med radie 12, `text-kort-t` 22/27, exakt en kopparknapp per vy.

Konsekvensen håller inom varje värld. Det som bryter är tre små läckor som listas under respektive yta (StickyMobileCTA, kampanjradens hårdkodade hex, deduktiva typbilden).

Det stora formproblemet är det ägaren pekar på, och det är ett bildproblem, inte bara ett copyproblem: **testbredden finns ingenstans som bild.** Vi har 29 tester i 9 typer, men i alla kort står testerna som en textrad bland andra textrader, ofta sist och längst. CV-sidan av erbjudandet har däremot bild överallt (mallar, telefoner, analysens poäng). Blicken lär sig att vi är en CV-tjänst med tester som bisats. Lösningen i avsnitt 2 är ett återanvändbart testelement som ger testerna samma bildstatus som resten.

## 1. Bedömning per yta

Skala: **behåll** (ingen formändring), **justera** (angivet vad), **gör om**.

### A. Publikt

| Yta | Bedömning | Vad |
|---|---|---|
| A1 GratisKort (`ib-gratis ib-gratis-bred`) | **Justera** | Formen behålls exakt (beige platta, streckad kant, eyebrow, display-rubrik, pillerknapp, understruken länk, bockrader). Två ändringar: (1) **Mobilordningen är fel.** Gridet lägger textblocket (eyebrow, rubrik, knapp, länk) först och bocklistan under, så på 375 px står knappen före skälen. Listan ska stå mellan rubrik och knapp på mobil; på dator till höger som i dag. (2) **Testerna får bildplats**: testelementet (avsnitt 2) i vänsterspalten under rubriken, före knappen. Bockraden om tester kortas till en rad som pekar på bilden (copy avgör ordalydelse). Fem rader med samma vikt är i övrigt rätt; första raden som understruken länk fungerar som enda avvikelse. |
| A1 SidoPaketKort gratis (desktop-sidokolumn) | **Justera** | Visar bara de tre första raderna, så sidokolumnen nämner aldrig tester. Lägg testelementet i radform (24 px) under de tre raderna, ovanför knappen. Knappen full bredd är rätt i 280 px spalt. |
| A2 InlineKort mallar/analys/brev/coach (`ib-prova`) | **Behåll** | Rummets ton, vänsterkant i rummets bläck, lyft, Objekt 64 till höger (på mobil först). Hierarkin eyebrow, rubrik clamp 20 till 24, text 15, knapp, paketrad 14 i ink-3 är rätt. Enda anmärkning: Objekt 64 är litet i en 210 px spalt på dator; 80 px hade burit bättre, men det är inte prioriterat. |
| A2 ProvKort (matris) | **Behåll** | ProvMatris (3×3 plus sex alternativ på papper-skarm med lyft) är kortets starkaste bild. Två handlingar (knapp + länk) är rätt. Lägg testelementet i radform med matris markerad under texten, så att "en av nio" syns. |
| A2 TypProvKort talserie, ordförråd, spatial | **Behåll** | Uppgiften som bild (chips med streckad lucka, versalordet med alternativ-piller, tärningen) är exakt rätt grepp. Samma radstycke som ProvKort: testelementet i radform med typen markerad. |
| A2 TypProvKort deduktiv | **Justera** | Bilden är ett textblock i en ruta (premiss, fråga, lista A till D i 13 px). Det läser som brödtext i en vit låda, inte som en uppgift. Gör om till det deduktiva motivet i bild: två villkorsrader som streck och en remsa med fyra platser där svaret fylls i koppar (samma motiv som `SymDeduktiv`, uppskalat till 48-boxens proportioner i 170 px). Texten "Vad måste gälla?" får stå kvar som enda rad. |
| A2 TypProvKort iprov | **Gör om** | Sex deltester som numrerad lista i 13 px med rumsfärgade cirklar är data som text, och det är det förbjudna mönstret "ikoner i färgade rutor på rad" i listform. Ersätt med testelementet i rutnätsform där I-provets sex typer (ordförråd ×2 slås ihop till en, spatial, talserier) är markerade i ink-1 och övriga i ink-3. Caption "Sex deltester" (copy avgör). |
| A2 SidoPaketKort Premium (`ib-black`) | **Behåll** | Bläck `--premium`, radie 24, pris 32 px display, konturknapp i koppar-ljus. Rätt kontrast mot artikelns ljusa spalt. Kampanjens genomstrukna pris (`s`) fungerar. |
| A2 SlutKort / PremiumBlock med telefoner | **Behåll** (en justering) | Bläck, gradientordet (det enda tillåtna gradientordet), bockrader, prisrad stor, solfjädern. På mobil är `.pub-solfjader` 650 px hög för en enda telefon (`nth-child(2)`), och sektionen är sist i artikeln; 650 px bild ovanför foten är tungt. Sänk till 540 på under 900 px (telefonen är 590 hög, men den får skäras i botten av sektionskanten som nu). Ingen CLS: min-height är fast. |
| A2 ListaSlutKort | **Behåll** | Samma block. Copybuggen "gör" med litet g tillhör copywritern. |
| A2 Hjälteknapp i artikel | **Behåll** | |
| A2 StickyMobileCTA | **Justera** | Tre läckor: (1) lucide `X` i stället för `IkonX`; (2) knappen ritar sin egen koppar-toning i `style` i stället för klassen `pub-knapp` (dubblerad sanning, och `font-bold` utan `font-display` står på grep-listan); (3) `bg-panel` och en inline `boxShadow` i stället för `--lyft`. Höjd 72 fast och transform-animerad, så CLS är noll, det är rätt. Dölj-knappen 44 px är rätt. |
| A2 ArtikelProv (`art-prov`) | **Behåll** | Provet i rummets ton, ramen på papper, brickorna i 6 px, talet 40 px display. Premiumraden som `pub-liten` under knappen är rätt vikt. |
| A3 KampanjRadPublik | **Behåll** (hygien) | 44 px, display-etikett 800 med .04em, hela raden länk, länkordet döljs under 640. Hex är hårdkodat (#141210, #E07A2F, #1B2246, #93A0EC) av CDN-skäl, acceptabelt för en rad som dör 1 december. |
| A4 Startsidan PremiumBlock | **Behåll** | Centrerad variant. Stationernas gratisrader är copy. |
| A5 /priser gratiskortet (`pub-gratis-kort`, `pub-gratis-rad`) | **Justera** | Sex plattor med stort tal (24 px display) och 12 px etikett. Talet "1" över "Nivåkollen" och "1" över "CV-analys" är tomma huvudtal; en etta säljer inget. Ersätt testplattan med testelementet i rutnätsform (9 glyfer) och etiketten under; behåll de övriga plattorna. Då är den enda plattan utan tal den som i stället har bild, vilket ger raden en tydlig förstaplatta. |
| A6 /verktyg/rekryteringstester, typkorten (`pub-typ-bild`) | **Behåll** | Åtta typer med egen bild på rummets ton är rätt. Testelementet behövs inte här, sidan är redan bilden. |
| A6 övriga verktygssidors PremiumBlock | **Behåll** | |
| A7 ExempelCTABand | **Behåll formen** | Copyfelet tillhör copywritern. Mittpunkterna "·" i raden är ett typografiskt mönster vi inte använder någon annanstans; byt till kommatecken. |
| A8 Registreringen KONTO_GRATIS (`pub-konto-panel`) | **Justera** | Väggpanel i rummets toning med tre rader och 64 px ikoner. Testraden är "Nivåkollen" med en matrisikon: en ikon för nio typer. Byt matrisikonen i första raden mot testelementet i radform (24 px, nio glyfer i vagg-ink med koppar-ljus på den markerade), så att bredden syns innan hon skapar kontot. Övriga två rader orörda. |

### B. Inloggat

| Yta | Bedömning | Vad |
|---|---|---|
| B1 KampanjRadInloggad | **Behåll** | 44 px, serverstyrd närvaro, ingen skiftning. Samma hex som publikt, samma skäl. |
| B1 InstallPrompt | **Behåll** | 44 px rad, papper, kant, textknapp och kryss i `IkonX`. Fixerad ovanför navet, inget skiftar. Förebild för hur en popup ska se ut hos oss. |
| B1 EmailVerificationBanner | Ej läst | Samma rad som InstallPrompt enligt kommentaren; antas följa. |
| B2 PaywallCard | **Behåll** (en justering) | Anatomi godkänd i designsystemet avsnitt 6: `text-kort-t`, 14/22 i ink-2, prisrad 14 medium, `KNAPPRAD` med `KNAPP_PRIMAR` och exakt en `LANK`. Justering för varianterna **testniva** och **test-tak**: texten räknar tester i ord ("alla 19 tester", dessutom fel tal). Lägg testelementet i radform (24 px, nio glyfer, ink-2, den låsta typen markerad i ink-1) mellan brödtexten och prisraden. Då står talet i bilden och copyn kan sluta räkna. |
| B2 GraValSheet | **Behåll** | Ark som papper, kortet `bare`. |
| B3 ImorgonKort | **Behåll** | Låset som rad med `IkonLas` 16 och text, betalväggen under hårlinje, en kopparknapp. Rubriken använder `font-display text-[22px] leading-[27px]` direkt i stället för `text-kort-t`; samma värden, men byt till klassen. |
| B3 TesterHubClient gratisraden, planens betalvägg | **Behåll formen** | Copy. |
| B4 PremiumGateModal, LockedWorkStylePreview, ProvaOcksa, ForslagSteg | Ej läst i detalj | Inventeringen pekar på copyfel, inte form. Tas om de byggs om. |

### Allmänt: CLS och mobil

Alla kort är serverrenderade med fast geometri. Inga bilder laddas (SVG och CSS), så inget skiftar. Kampanjvarianterna döljs med CSS i `<head>` före första målningen. StickyMobileCTA och InstallPrompt är fixerade utanför flödet. Inget att åtgärda.

Mobil 375: GratisKortets ordning (ovan) är enda hierarkifelet. `ib-prova` sätter bilden först på mobil (`order: -1`), vilket är rätt: bild, eyebrow, rubrik, text, knapp.

### Billigt eller maskinellt

- iprov-bildens numrerade lista (ovan).
- Deduktiva typbilden (textlåda).
- `/priser` talplattorna med "1" som huvudtal.
- Mittpunkter "·" som avdelare i ExempelCTABand och intervjuprovet.
- I övrigt är korten rena: ingen glow, inga blobbar, en toning per kort (knappen) och gradientordet bara på bläck.

## 2. Testelementet: "Nio"

### Idé

Ett element som visar testbredden som bild, återanvänt i alla kort som säljer tester eller gratisnivån. Nio testtyper ritade som nio glyfer i samma hand som Rummens symboler (`RumSymboler`, 48-box, kontur 2, radie 4, exakt en kopparyta per symbol). Två former:

- **Rutnät** 3×3: nio typer i en kvadrat, en tyst blinkning till matristestet, som är det test flest känner igen. Används där elementet är kortets bild (GratisKort, /priser, iprov-kortet).
- **Rad**: nio glyfer på en rad, 24 px. Används där kortet redan har en bild eller där spalten är smal (ProvKort, TypProvKort, SidoPaketKort, PaywallCard, registreringens panel).

Färgregel: glyferna står i **en** färg (ink-2 på ljus yta, vagg-ink på vägg) med `--illu-accent: currentColor`, så att raden inte blir nio orange prickar. Är en typ **markerad** ("den här av nio") får den ink-1 och kopparaccenten (`--illu-accent: var(--koppar)`), aldrig en färgad ruta bakom. På vägg markeras med koppar-ljus. Det är samma betydelse som kopparn har överallt: här är du.

Ingen bakgrundscirkel, ingen ruta per glyf. Rutnätet håller ihop av hårlinjer, inte av plattor.

### De nio glyferna (48-box)

Finns redan i `src/components/illustrations/RumSymboler.tsx`:

| Typ | Symbol | Kopparytan |
|---|---|---|
| Matrislogik | `SymMatris` | den streckade tomma rutan |
| Figurserier | `SymFigurer` | luckan sist i remsan |
| Deduktiv | `SymDeduktiv` | platsen svaret fyller |
| Numeriskt | `SymSiffror` | den höga stapeln |
| Ordförråd | `SymOrd` | det markerade ordet |
| Personlighet | `SymPerson` | nålens fäste |

Tre nya ritas i samma fil, samma box, samma stroke:

**`SymTalserie`** (talserier): fyra celler på rad, `rect x=4 y=16 w=40 h=16 rx=4` kontur, skiljelinjer vid x=14, 24, 34 i `strokeWidth 1.5 opacity .5`. Cell 1 en punkt (`circle cx=9 cy=24 r=2`), cell 2 två punkter (cx 17 och 21, cy 24), cell 3 tre punkter (cx 26, 29, 32 på cy 24; använd r 1.6), cell 4 en streckad ruta i koppar `rect x=36.5 y=19.5 w=5 h=9 rx=1.5 stroke=K strokeWidth=2 strokeDasharray="3 2.5"`. Läsning: serie med lucka.

**`SymSpatial`** (spatial förmåga): isometrisk kub. Yttre sexhörning `M24 9 L38 17 L38 33 L24 41 L10 33 L10 17 Z` kontur 2. Inre kanter `M24 25 L24 41 M24 25 L10 17 M24 25 L38 17` kontur 2. Toppytan `M24 9 L38 17 L24 25 L10 17 Z` fylld i K. Läsning: kropp i rummet, en yta i koppar.

**`SymVerbal`** (verbalt resonemang): `rect x=6 y=7 w=36 h=34 rx=5` kontur 2. Tre textrader `M12 15h24 M12 21h18 M12 27h24` stroke 2.5, `strokeLinecap round`, `opacity .7`. Underst ett sant/falskt-par: bock i koppar `M12 35.5l3 3 5.5-6` `stroke=K strokeWidth 2.5`, kryss i currentColor `M29 33l6 6 M35 33l-6 6` `strokeWidth 2 opacity .6`. Läsning: text och ett ställningstagande.

`RumSymboler.tsx` är `'use client'` (för `useIlluId` i märkena). De nio glyferna använder inga gradienter och behöver inga id. För publika serverkomponenter skapas därför `src/components/illustrations/TestGlyfer.tsx` **utan** `'use client'`, som exporterar `TESTGLYFER: Record<TestTyp, (p: IlluProps) => JSX.Element>` med de nio som rena SVG-funktioner (samma koordinater, `IlluSvg` importerad från primitives, som är `'use client'` men bara för hooken; `IlluSvg` själv har inga hooks, så flytta `IlluSvg` och `ILLU` till en hooklös `primitives-bas.tsx` som båda importerar). Inloggat kan fortsätta importera från `RumSymboler`.

Typnyckeln: `type TestTyp = 'matris' | 'figurer' | 'deduktiv' | 'talserier' | 'spatial' | 'ordforrad' | 'verbalt' | 'numeriskt' | 'personlighet'`, i ordningen ovan. Ordningen i rutnätet, rad för rad: matris, figurer, deduktiv / talserier, spatial, ordförråd / verbalt, numeriskt, personlighet. Den ordningen sätter de tre bildlogiska först, de tre I-prov-nära i mitten och språk, siffror, person sist; personlighet står i hörnet nere till höger, där matrisens lucka brukar vara.

### Komponenten

`src/components/publikt/TestBredd.tsx` (serverkomponent), används även i inloggat.

```tsx
export type TestBreddProps = {
  form: 'rutnat' | 'rad'
  /** Den typ kortet handlar om. Får ink-1 och kopparaccenten. */
  markerad?: TestTyp
  /** Flera markerade, för I-provet. Övriga blir ink-3. */
  markerade?: TestTyp[]
  /** Caption under elementet. Copywritern bestämmer texten; tomt = ingen caption. */
  text?: string
  /** 'ljus' (papper, ton, insunken) eller 'vagg' (bläck, premium, vägg). */
  yta?: 'ljus' | 'vagg'
  /** Skärmläsartext för hela elementet. */
  label: string
  className?: string
}
```

Renderar:

```html
<figure class="tb tb-rutnat tb-ljus" role="img" aria-label="{label}">
  <ol class="tb-glyfer">
    <li data-typ="matris" data-markerad>…svg…</li>
    …nio li…
  </ol>
  <figcaption class="tb-text">{text}</figcaption>   <!-- bara om text -->
</figure>
```

SVG:erna renderas med `size` enligt formen och `aria-hidden` (figuren bär etiketten). `li` är `display:block`, inga listpunkter.

### CSS (läggs i `publikt.css`, prefixet `tb-` krockar inte)

```css
.tb { display: grid; gap: 8px; justify-items: start; }
.tb-glyfer { margin: 0; padding: 0; list-style: none; color: var(--ink-2); --illu-accent: currentColor; }
.tb-glyfer li { display: grid; place-items: center; }
.tb-glyfer li[data-markerad] { color: var(--ink-1); --illu-accent: var(--koppar); }
.tb-glyfer[data-nagon-markerad] li:not([data-markerad]) { color: var(--ink-3); }
.tb-text { font-size: 13px; line-height: 1.4; color: var(--ink-3); max-width: 36ch; }

/* Rutnät: 3×3, hårlinjer, inga plattor. 144 px på mobil, 168 på dator. */
.tb-rutnat .tb-glyfer {
  display: grid; grid-template-columns: repeat(3, 48px);
  background: var(--kant); gap: 1px;
  border: 1px solid var(--kant); border-radius: 14px; overflow: hidden;
}
.tb-rutnat .tb-glyfer li { width: 48px; height: 48px; background: var(--papper-skarm); }
.tb-rutnat .tb-glyfer svg { width: 32px; height: 32px; }
@media (min-width: 700px) {
  .tb-rutnat .tb-glyfer { grid-template-columns: repeat(3, 56px); }
  .tb-rutnat .tb-glyfer li { width: 56px; height: 56px; }
  .tb-rutnat .tb-glyfer svg { width: 36px; height: 36px; }
}

/* Rad: nio på en rad, 24 px, gap 8. 9×24 + 8×8 = 280 px, ryms i 295 px (375 minus gutter och kortets padding). */
.tb-rad .tb-glyfer { display: flex; gap: 8px; }
.tb-rad .tb-glyfer svg { width: 24px; height: 24px; }
.tb-rad .tb-text { font-size: 12px; }

/* På vägg och bläck */
.tb-vagg .tb-glyfer { color: var(--vagg-mjuk); }
.tb-vagg .tb-glyfer li[data-markerad] { color: var(--vagg-ink); --illu-accent: var(--koppar-ljus); }
.tb-vagg.tb-rutnat .tb-glyfer { background: var(--vagg-kant); border-color: var(--vagg-kant); }
.tb-vagg.tb-rutnat .tb-glyfer li { background: rgba(255,255,255,.06); }
.tb-vagg .tb-text { color: var(--vagg-mjuk); }
```

Kontrast: ink-2 på papper-skarm 8,7:1 (grafik kräver 3), ink-3 5,8:1, koppar på papper 3,0:1 (grafik, godkänt i avsnitt 2). Vagg-mjuk på bläck är 0,74 vit, gott och väl över 3.

Rutnätet mäter 3×48 + 2×1 + 2 = 148 px på mobil. 24-pixelsraden ger 1 px kontur efter skalning (2 × 24/48), tunt men tydligt i den här handen; glyferna är ritade med få linjer och en fylld yta just för att bära ner till 24. Går de under 24 blir matrisen gröt, så 24 är golvet.

Prestanda: nio inline-SVG på cirka 350 byte var, 3 kB per instans, ingen JS, ingen bild. CLS noll (fast storlek i CSS).

### Placering per kort

**GratisKort** (`ib-gratis-bred`): vänsterspalten blir eyebrow, rubrik, `TestBredd form="rutnat" yta="ljus" text="…"` med `margin-top: 18px`, sedan `pub-handling`. Högerspalten är bocklistan som i dag. På under 900 px: eyebrow, rubrik, rutnät, bocklista, knapp och länk, vilket också rättar mobilordningen. Görs med ett extra wrapper-element och `order` i mediafrågan, eller genom att låta listan vara barn nummer två och handlingen barn nummer tre i gridet (`grid-template-areas` på dator: "text lista" / "handling lista"). Caption är copywriterns, men den ska vara en rad, max 36 tecken, i stil med "Nio testtyper, grundnivån gratis i alla".

Alternativet, att bara ge testraden i listan en glyfrad, avråder jag från: i 14 px listtext blir glyferna 18 till 20 px, och under 24 bär de inte.

**SidoPaketKort gratis**: `form="rad"` under de tre raderna, `margin-top: 14px`, caption 12 px. Knappen under som i dag.

**ProvKort och TypProvKort**: `form="rad" markerad={typ}` direkt under `ib-prova-text`, `margin-top: 14px`, utan caption (texten ovanför säger vad det är; raden säger "en av nio"). `pub-handling` behåller sina 18 px.

**TypProvKort iprov**: byt `Bild` mot `form="rutnat" markerade={['ordforrad','spatial','talserier']}` i högerspalten, caption "Sex deltester" (copy avgör). Ordförråd täcker I-provets två orddeltester och spatial dess tre, så tre markerade glyfer står för sex deltester; captionen bär talet.

**/priser gratiskortet**: ersätt plattan "1 Nivåkollen" med en platta som innehåller `form="rutnat"` (utan egen ram, plattan är ramen) och etiketten under i samma 12 px som grannarna. Plattan spänner två kolumner på dator (`grid-column: span 2`) så att rutnätet får 148 px utan att trängas; på mobil hela raden.

**Registreringens KONTO_GRATIS**: första radens 64-ikon byts mot `form="rad" yta="vagg"` ovanför radens namn och text, så raden blir glyfrad, namn, text. De två andra raderna orörda.

**PaywallCard testniva och test-tak**: `form="rad" markerad={låst typ}` mellan brödtexten och prisraden, `mt-3`. Elementet är ink på papper, kopparn stannar i knappen plus den markerade glyfens lilla yta (regeln i avsnitt 6 om kopparkant gäller kanter, inte symbolens accent, som redan används i `RumSymboler` på golvet).

**PremiumBlock test (SlutKort)**: ingen ändring. Telefonerna är bilden.

## 3. Tokens och värden i dag, för artefaktens "före"

Alla publika kort står i `.pub-sida` (PubliktSida), så dessa tokens gäller (`globals.css` rad 1965 och framåt, ljust läge):

| Variabel | Värde |
|---|---|
| `--mark` (sidbakgrund) | `#EDE8DF` |
| `--panel` | `#FFFFFF` |
| `--insunken` (GratisKortets platta) | `#E4DED3` |
| `--kant` | `#DBD2C4` |
| `--kant-stark` (streckad kant) | `#C4B9A8` |
| `--ink-1` / `--ink-2` / `--ink-3` | `#1C1917` / `#57534E` / `#6B645E` |
| `--koppar` | `#E07A2F` |
| `--koppar-djup` | `#C4621F` |
| `--koppar-ink` (eyebrow) | `#A8491A` |
| `--koppar-ljus` | `#F4B98A` |
| `--koppar-text` (text på knapp, bockens streck) | `#1A1206` |
| `--koppar-mjuk` | `#FBE3D0` |
| `--premium` / `--premium-2` / `--premium-kant` | `#0F0E12` / `#1A191F` / `rgba(255,255,255,.12)` |
| `--vagg-ink` / `--vagg-mjuk` / `--vagg-kant` (på bläck) | `#F5F6FC` / `rgba(255,255,255,.74)` / `rgba(255,255,255,.14)` |
| `--papper-skarm` / `--kant-skarm` / `--golv-skarm` | `#FFFFFF` / `#E3E1DC` / `#F3F1EC` |
| `--lyft` | `0 1px 2px rgba(28,25,23,.06), 0 12px 32px -12px rgba(28,25,23,.22)` |
| `--r-stor` | `24px` |
| `--display` | `var(--font-display), Inter, system-ui, sans-serif` = Schibsted Grotesk (variable woff2) |
| Brödtext | Inter, 16 px, radavstånd 1,55 |

Rumsklasserna (lokala variabler på kortet): `pub-rum-tran` ton `#DFE3F6` ink `#3B4790` (test); `pub-rum-cv` `#D7ECEA` / `#1E5F5F`; `pub-rum-brev` `#F0DCE8` / `#6E2B59`; `pub-rum-jobb` `#DCEBDD` / `#245C37`; `pub-rum-neu` `#E2E1E6` / `#3C3C46` (generic).

### GratisKort (`.ib-gratis.ib-gratis-bred`)

```
aside           display grid; gap 20px; padding 24px; border-radius 20px;
                background var(--insunken) #E4DED3; border 1px dashed var(--kant-stark) #C4B9A8
  ≥900 px       grid-template-columns minmax(0,1fr) minmax(0,1.2fr); align-items center; gap 20px 48px; padding 32px
.pub-kick       Inter 12px/700, letter-spacing .1em, uppercase, color #A8491A, margin-bottom 14px
.pub-h3.ib-rub  Schibsted 800, font-size clamp(22px, 4.4vw, 28px), letter-spacing -.015em (pub-h3) och -.02em (ib-rub, vinner), line-height 1.1, text-wrap balance, color #1C1917
.pub-handling   display flex; align-items center; gap 22px; flex-wrap wrap; margin-top 18px (ib-gratis)
  ≤640 px       flex-direction column; align-items stretch; gap 16px; knappen width 100%; länken text-align center
.pub-knapp      inline-flex; min-height 52px; padding 0 24px; border-radius 999px;
                background linear-gradient(180deg, #E07A2F, #C4621F); color #1A1206;
                Inter 700 16px/1.2; box-shadow 0 1px 0 rgba(255,255,255,.25) inset, 0 6px 18px -6px rgba(196,98,31,.6)
                hover: translateY(-1px), skugga 0 10px 24px -8px rgba(196,98,31,.7)
.pub-lank       Inter 600, underline, underline-offset 4px, thickness 1.5px, color inherit (#1C1917)
.pub-bock       display grid; gap 8px (ib-gratis); font-size 14px; line-height 1.45
.pub-bock li::before   22×22 cirkel, background #E07A2F med vit-bock-SVG i stroke #1A1206 3px, 14px, margin-top 1px; gap 12px till texten
  första raden  Link.pub-lank med font-weight 500
```

### SidoPaketKort gratis (`.ib-gratis` utan -bred)

Samma platta; `ib-rub` med inline `font-size: 18px`; listan `margin-top: 12px`; knappen `width: 100%; margin-top: 16px`.

### InlineKort, ProvKort, TypProvKort (`.pub-sida .ib-prova`)

```
aside           display grid; gap 20px; margin 36px 0; padding 24px; border-radius 24px;
                background var(--rum-ton); border-left 6px solid var(--rum-ink); box-shadow var(--lyft)
  ≥700 px       grid-template-columns minmax(0,1fr) 210px; gap 28px; align-items center; padding 28px
.pub-kick       color var(--rum-ink); margin-bottom 8px
.ib-rub         clamp(20px, 2.4vw, 24px)/1.2, Schibsted 800, -.02em, color #1C1917
.ib-prova-text  margin-top 8px; 15px/1.55; color #57534E
.pub-handling   margin-top 18px
.pub-liten      14px; color #6B645E; margin-top 12px; max-width 46ch
.ib-prova-sida  display grid; justify-items center; color var(--rum-ink); ≤699 px: order -1, matrisen max 200px
.ib-prova-matris  max-width 230px
.ib-pm-g        3 kolumner, background #FFFFFF, radius 16px, padding 8px, --lyft; celler aspect 1, padding 6px, 1px #E3E1DC skiljelinjer
.ib-pm-alt      3 kolumner, gap 6px, margin-top 8px; celler 44px höga, radius 12px, #FFFFFF, 1px #E3E1DC; bokstav 10px #6B645E uppe till vänster; svg 30px
.ib-typbild     max-width 230px; background #FFFFFF; radius 16px; padding 14px; --lyft; color #1C1917
.ib-typbild-fig max-width 170px; padding 8px
.ib-typrad span min-width 34px; padding 6px 4px; radius 10px; 1px #E3E1DC; 700; tabular-nums; luckan dashed, #6B645E
.ib-typord      Schibsted 800 20px, letter-spacing .04em, centrerad
.ib-typalt span padding 4px 10px; radius 999px; 1px #E3E1DC; 13px #57534E
.ib-typpremiss  13px/1.45 #57534E;  .ib-typpastaende 14px/1.4 700;  .ib-typlista upper-alpha 13px/1.4 #57534E
.ib-typdelar li::before  22×22 cirkel, background var(--rum-ton), color var(--rum-ink), 700 12px
```

### SidoPaketKort Premium (`.ib-black`)

```
section         background #0F0E12; color #F5F6FC; border-radius 24px; padding 22px
.pub-kick       color #F4B98A; margin-bottom 8px
.ib-rub         18px, #FFFFFF
.pub-liten      color rgba(255,255,255,.74); margin-top 6px
.ib-pris-l      Schibsted 800 32px/1, -.02em, #FFFFFF, margin-top 14px; small block Inter 500 13px rgba(255,255,255,.74) margin-top 4px; kampanj: s .5em 600 margin-left 8px
.ib-knapp-ram   flex center; min-height 48px; margin-top 16px; radius 999px; border 1.5px solid #F4B98A; #FFFFFF 700 15px; hover rgba(244,185,138,.12)
```

### PremiumBlock / SlutKort (`.pub-sek.pub-yta-premium`)

```
section         padding clamp(56px, 8vw, 112px) 0; background #0F0E12; color #F5F6FC
.pub-wrap       width min(1120px, 100% - 32px)
.pub-tva        grid; gap 40px; ≥900 px två kolumner 1fr/1fr gap 64px; .pub-tva-text max-width 560px
.pub-kick       #F4B98A
.pub-h2 (p)     Schibsted 800 clamp(30px, 6.4vw, 46px), -.02em, 1.05
.pub-gradord    linear-gradient(92deg, #F4B98A 0%, #FFD9B0 45%, #F2A368 100%) som text
.pub-ingress    clamp(17px, 2vw, 20px)/1.5, rgba(255,255,255,.74); b #FFFFFF
.pub-bock       margin-top 28px; gap 12px (bock som ovan, orange cirkel)
.pub-pris       Schibsted 800 clamp(44px, 8vw, 72px)/1, -.03em; small 18px 600 rgba(255,255,255,.74) margin-left 8px; ≤640 block margin-top 8px
.pub-handling   margin-top 28px; .pub-lank #FFFFFF
.pub-solfjader  min-height 650px; telefoner 272×590 absolut i botten; mitten scale 1.06; sidorna translateX ±170px rotate ±9deg; ≤899 bara mittelefonen
```

### KampanjRad (publikt och inloggat)

```
rad             min-height 44px; padding 9px 16px; 14px/1.35; centrerad; ≤640 13px, länkordet dolt
b               Schibsted 800, letter-spacing .04em, margin-right 6px
svart           background #141210; color #E9DFD1; b #E07A2F; inloggat "Nej tack" #A39A8E
indigo          background #1B2246; color #DDE1F6; b #93A0EC; inloggat "Nej tack" #AEB4DA
```

### StickyMobileCTA

```
yta             fixed bottom; height 72px + safe-area; border-top 1px var(--kant); background var(--panel) #FFFFFF; box-shadow 0 -4px 16px -8px rgba(0,0,0,.12); transform-animerad 200 ms
knapp           h 48px; flex 1; radius 999px; 15px 700; background linear-gradient(180deg, #E07A2F, #C4621F); color #1A1206
kryss           44×44; radius 999px; lucide X 20px; color #6B645E; hover var(--insunken)
```

### PaywallCard, GraValSheet, ImorgonKort (inloggat, Rummen, ljust läge)

```
Tokens          --papper #FFFFFF; --papper-2 #F4F3F0; --kant #E3E1DC; --kant-stark #C9C6BF;
                --ink-1 #1A1A1F; --ink-2 #4A4A55; --ink-3 #65656E; --koppar #E07A2F; --koppar-ink #A8491A;
                --koppar-djup #C4621F; --koppar-text #1A1206; --lyft 0 1px 2px rgba(20,20,40,.05), 0 10px 24px -14px rgba(20,20,40,.18)
PaywallCard     section rounded-2xl (16px) border 1px var(--kant) bg var(--papper) p-4 (16px)
  h3            .text-kort-t: Schibsted 700 22/27, -.02em, ink-1
  body          mt-1; 14px/22px; ink-2
  prisrad       mt-2; 14px 500; ink-1
  KNAPPRAD      mt-3.5 (14px); flex-col; gap 10px
  KNAPP_PRIMAR  .knapp-primar: toning #E8863B → #E07A2F → #C4621F; h-12 (48px); w-full; rounded-xl (12px); px 18px; 15px 600 -.005em; color #1A1206
  LANK          14px 500 ink-1 underline offset 4px decoration var(--kant-stark); min-h 44px centrerad
GraValSheet     Sheet bare: papper, radie 24 upptill, dimma rgba(10,12,30,.55); innehållet p-4
ImorgonKort     rounded-2xl border bg-papper p-4; lyft: -mt-[30px] border var(--lyft-kant) shadow-lyft
  eyebrow       .text-ey: Inter 12/16 600 .08em uppercase; koppar-ink, låst: ink-3
  h2            font-display 22/27 700 -.02em; ink-1, låst: ink-2
  text          mt-1.5; 14px/21px ink-2
  låsrad        mt-2.5; 13px ink-3; IkonLas 16
  betalvägg     mt-3.5 border-t var(--kant) pt-3.5; prisrad 14px 500 ink-1; KNAPPRAD som ovan
  klockval      3 kolumner gap 8px; knapp min-h 44px rounded-xl border; vald: border ink-1 + inset 1.5px ink-1
InstallPrompt   fixed; border-t var(--kant); bg var(--papper); rad min-h 44px; text 14px ink-1; textknapp 14px 500 underline decoration var(--kant-stark); kryss 44×44 rounded-lg, IkonX 16 ink-3
```

Mörkt läge för artefakten behövs inte i "före": artiklarna står i `.pub-sida` och följer systemet, men ägaren granskar i ljust.

## 4. Vad jag inte har gjort

Ingen kod är ändrad. Inga skisser i HTML: artefakten med före och efter byggs när copywriterns och testansvarigs beslut om raderna, captionen och vilka tal som får stå finns. Till den artefakten behövs från dem: GratisKortets fem (eller fyra) rader i slutlig lydelse, captionen under rutnätet, och ordningen på raderna.
