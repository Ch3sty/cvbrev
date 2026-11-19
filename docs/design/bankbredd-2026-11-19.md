# Bankbredd: ett stort tal och åtta staplar

Art director 2026-11-19. Svar på säljgranskningen (docs/rapporter/genomgang-salj-2026-11-19.md, avsnitt 2, argumentet "Över 3 000 uppgifter i åtta testtyper"). Skiss: scratchpad/bankbredd/skiss.html (sessionen af2c641b). Ingen produktionskod är byggd; det här är byggspecen för Opus.

Regeln "data som bild, inte text" gäller: ett huvudtal i display plus en liten visualisering. Talen per typ står aldrig på ytan. De finns i skärmläsartexten och i hovern.

## 1. Beslut

| Fråga | Beslut | Motivering |
|---|---|---|
| Talet | **över 3 500** (3 533 aktiva uppgifter i dag) | Golvavrundning till närmaste hundratal, räknat så att "över" alltid är sant. Ett vitest vaktar konstanten mot bankerna, så talet uppdateras när banken ändras. Sälj skrev "över 3 000" med tanke på pensioneringar; med testet behövs inte den marginalen, och 3 500 säljer mer. |
| Skala | Linjär, noll som bas | Höjd = antal / största antal (spatial förmåga, 576). Minsta stapeln (numeriskt, 288) blir halva höjden. Ingen axel, inga tick: det är en säljbild, inte en analys. |
| Ordning | Nio-radens ordning utan personlighetstestet | matrislogik, figurserier, deduktiv slutledning, talserier, spatial förmåga, ordförråd, verbalt resonemang, numeriskt resonemang. Samma ordning som TestBredd, så att den som sett Nio-raden känner igen glyferna. |
| Färg | En färg för alla staplar; den markerade typen i koppar | Nio-glyferna står i en färg (TestBredd), och staplarna följer dem: ink-3 på ljus yta, vägg-svag på vägg. Identiteten bärs av glyfen under stapeln, inte av kulör. Den typ kortet handlar om får kopparn på stapeln och glyfens kopparyta, övriga glyfer dämpas till ink-3 (samma regel som TestBredd). Aldrig åtta kulörer: de skulle slå sönder den enfärgade glyfraden och säga att typerna är olika sorters saker. |
| Personlighetstestet | Ingen stapel | Det är 120 påståenden i ett test, inte en bank av uppgifter. Det nämns i brödtexten på varje yta. Elementet har därför åtta staplar, inte nio. |
| Följeraden | Ur textdäcket T8 (docs/rapporter/textdack-2026-11-19.md, inte klart 2026-11-19) | Platshållare tills däcket finns: "Nivån räknas bara på uppgifter du inte sett den senaste månaden." (säljgranskningens formulering som håller mot koden, settInomFonstret 30 dagar). |
| Hover | `title` per stapel ("Spatial förmåga, 576 uppgifter") | Noll JS, ingen tooltip-komponent. Skärmläsaren får hela listan i figurens aria-label. |
| /priser | I Premium-stationen för tester, inte på gratisplattan | På gratisplattan ("Grundnivån i alla nio") skulle 3 500 läsas som gratis. Bara grundnivån är gratis, cirka 1 300 uppgifter. Gratisplattan behåller Nio-rutnätet. Stöds av testansvarigs krav att påståendet ska vara sant där det står. |

Validering av färgerna (dataviz-skillens validator): koppar mot ink-3 på papper ΔE 24 (normal), 11,6 (protan), kontrast över 3:1 för båda. Koppar-ljus mot vägg-svag på #1B2246 kontrast över 3:1. Markeringen bärs dessutom av glyfens vikt och kopparyta, aldrig av stapelns färg ensam.

## 2. Talet räknas ur koden

### 2.1 Vad som räknas

En uppgift är det användaren svarar på: en matris, en figurserie, en deduktiv uppgift, en talserie, en spatial uppgift, ett ord, **ett påstående** i verbalt, **en fråga** i numeriskt. Texter och underlag räknas inte, deras påståenden och frågor gör det.

Bara aktiva uppgifter räknas: det den aktiva versionen av varje bank kan visa i nivåtest och träning. Pensionerade uppgifter och partier som inte är aktiva räknas inte.

### 2.2 Exakt funktion per testtyp

| Typ | Funktion | Version | Grund / avancerad / expert | Summa |
|---|---|---|---|---|
| matris | `ALLA_GRUND`, `ALLA_AVANCERAD`, `ALLA_EXPERT` filtrerade med `valbarI(q, TRANINGSVERSION)` (src/lib/logicTestV7/selectQuestions.v7.ts). Summan är `TRANINGSBANK.length` i src/lib/traning/bank.server.ts. **Inte `poolFor`**: den hanterar bara version 1 till 3 och ger 28 per nivå för version 7. | TRANINGSVERSION 7 | 167 / 175 / 157 | 499 |
| figurer | `poolFor(niva, SERIE_VERSION)` i src/lib/figurserierV1/select.ts | 5 | 120 / 144 / 122 | 386 |
| deduktiv | `poolFor(niva, DEDUKTIV_VERSION)` i src/lib/deduktivV1/select.ts | 5 | 132 / 121 / 101 | 354 |
| talserier | `poolFor(niva)` i src/lib/talserierV1/select.ts (default TALSERIE_VERSION) | 4 | 171 / 168 / 166 | 505 |
| spatial | `poolFor(niva)` i src/lib/spatialV1/select.ts (default SPATIAL_VERSION) | 5 | 195 / 195 / 186 | 576 |
| ordforrad | `poolFor(niva)` i src/lib/ordforradV1/select.ts (default ORD_VERSION) | 4 | 197 / 205 / 155 | 557 |
| verbalt | `passPool('verbal', niva)` i src/lib/tester/pass-bank.server.ts, summan av `statements.length` per text | underlag 4 | 176 / 192 / (ingen expert) | 368 |
| numeriskt | `passPool('numerisk', niva)` i samma fil, summan av `questions.length` per underlag | underlag 3 | 144 / 144 / (se not) | 288 |
| **Totalt** | | | | **3 533** |

Räknat 2026-11-19 med scratchpad/bankbredd/rakna.ts och rakna-matris.ts mot main. Siffrorna är identiska med säljgranskningens tabell.

Noter som bara stärker påståendet och därför inte räknas in (konservativ räkning):

- Figurpasset och övningsprovet drar ur `harnastPool` (parti 2) och `bryterPool`: 144 / 176 / 122 unika i stället för 120 / 144 / 122, alltså 56 fler.
- Numeriskt expert finns i provet (`poolFor('expert')` i src/lib/numericalTestProv/selectProv.ts): 12 underlag, 48 frågor.
- Med båda inräknade är banken 3 637. Talet 3 500 håller i båda räkningarna.

### 2.3 Konstanten

Bankerna är serverkod med facit och får inte in i klientens JavaScript (PaywallCard är en klientkomponent). Därför samma mönster som `ANTAL_TESTTYPER` (src/lib/tester/antal-testtyper.ts): en ren fil med talen inskrivna och ett vitest som räknar om dem ur bankerna.

```ts
// src/lib/tester/bankbredd.ts (ren fil, inga bankimporter)
import type { TestTyp } from '@/components/illustrations/TestGlyfer'

/** De åtta testtyperna med en bank av uppgifter, i Nio-radens ordning. Personlighetstestet har ingen. */
export type BankTyp = Exclude<TestTyp, 'personlighet'>
export const BANK_TYPER: readonly BankTyp[] = ['matris', 'figurer', 'deduktiv', 'talserier', 'spatial', 'ordforrad', 'verbalt', 'numeriskt']

/** Aktiva uppgifter per typ. Vaktas av bankbredd.test.ts, som räknar ur bankerna (avsnitt 2.2). */
export const BANK_PER_TYP: Record<BankTyp, number> = {
  matris: 499, figurer: 386, deduktiv: 354, talserier: 505, spatial: 576, ordforrad: 557, verbalt: 368, numeriskt: 288,
}
export const BANK_TOTAL = Object.values(BANK_PER_TYP).reduce((a, b) => a + b, 0) // 3533

/** Talet som visas: golvavrundat till hundratal så att "över" alltid är sant. 3533 ger 3500, exakt 3500 skulle ge 3400. */
export const BANK_VISAT = Math.floor((BANK_TOTAL - 1) / 100) * 100

/** "över 3 500", för copy som nämner talet i text (mejl, FAQ). Tusentalsavståndet är tunt mellanslag (U+2009). */
export const BANK_TEXT = `över ${BANK_VISAT.toLocaleString('sv-SE').replace(/ /g, ' ')}`
```

Vitestet `src/lib/tester/__tests__/bankbredd.test.ts` importerar funktionerna i 2.2 (server-only är aliasat i vitest.config.ts) och kräver att varje tal i `BANK_PER_TYP` är lika med det räknade, att `BANK_TOTAL` är summan och att `BANK_VISAT < BANK_TOTAL`. Ändras banken faller testet, byggaren uppdaterar talen och elementet och all copy som läser `BANK_TEXT` följer med.

All text som nämner talet (Black Week-mejlet F1, FAQ, registreringens steg 3) ska läsa `BANK_TEXT`, inte skriva "över 3 000" för hand. Säljgranskningens mejlförslag säger "över 3 000"; med konstanten blir det "över 3 500" överallt, samma tal i bild och text. Mejlet är serverkod och kan importera konstanten direkt.

## 3. Komponenten

`src/components/publikt/Bankbredd.tsx`, serverkomponent utan hooks (som TestBredd). Stilen i globals.css med prefix `bb-`, bredvid `tb-`, eftersom PaywallCard i inloggat också ritar den. Glyferna är `TESTGLYFER` ur TestGlyfer.tsx, oförändrade.

```ts
export type BankbreddProps = {
  /** 'rad': 32 px tal och 40 px staplar (PaywallCard, kort, slutkort). 'platta': 48/56 px tal och 72 px staplar (stationen på /priser). */
  form: 'rad' | 'platta'
  /** Den typ kortet handlar om: kopparn på stapel och glyf, övriga glyfer ink-3. */
  markerad?: BankTyp
  /** 'ljus' (papper, panel) eller 'vagg' (bläck, premium, vägg). */
  yta?: 'ljus' | 'vagg'
  /** Följeraden ur T8. Tomt ger ingen rad. */
  text?: string
  /** Skärmläsartext. Utelämnad: "Över 3 500 uppgifter i åtta testtyper: matrislogik 499, ..., numeriskt resonemang 288." plus ", {typ} låst" när något är markerat. */
  label?: string
  className?: string
}
```

Markup (samma som skissens skript bygger):

```html
<figure class="bb bb-rad bb-ljus" role="img" aria-label="...">
  <p class="bb-tal"><span class="bb-over">över</span><b>3 500</b><span class="bb-enhet">uppgifter</span></p>
  <ol class="bb-staplar" data-nagon-markerad>
    <li data-typ="matris" style="--v:.866" title="Matrislogik, 499 uppgifter"><i></i><svg .../></li>
    ... åtta li, --v = antal / max med tre decimaler ...
  </ol>
  <figcaption class="bb-text">Nivån räknas bara på uppgifter du inte sett den senaste månaden.</figcaption>
</figure>
```

Talet skrivs "över" (liten) + "3 500" (display 800) + "uppgifter" (liten) på en baslinje i raden, i tre rader på plattan. Inget plustecken: "3 500+" är inte svenska. Tusentalsavstånd är tunt mellanslag.

### 3.1 Mått

| | rad | platta |
|---|---|---|
| Talet | 32/32, Schibsted Grotesk 800, -0,03 em, ink-1 | 48/48 mobil, 56/56 från 700 px, -0,035 em |
| "över", "uppgifter" | 13 px, 500, ink-3, Inter, baslinje med talet | 14 px, över och under talet |
| Staplar | höjd 40 px, bredd högst 14 px (tunna, centrerade i kolumnen), 8 kolumner `minmax(0,1fr)`, gap 6, hela blocket `flex: 1 1 210px; max-width: 280px` | höjd 72 px, bredd högst 18 px, gap 8, `flex-basis: 260px; max-width: 360px` |
| Stapelns form | 4 px radie uppåt, rak mot baslinjen, höjd `calc(var(--v) * 100%)` | samma |
| Baslinje | 1 px hårlinje över hela stapelraden: `--kant` på ljus, `--vagg-kant` på vägg | samma |
| Glyf | högst 24 px, `width: 100%; aspect-ratio: 1`, 6 px under stapeln | högst 28 px, 8 px under |
| Layout | `display: flex; flex-wrap: wrap; align-items: center; gap: 12px 22px`. Smalare än cirka 440 px bryter staplarna under talet (mobil), annars står de bredvid med talet centrerat mot stapelblocket. | `gap: 16px 28px`, samma brytning |
| Följeraden | 13 px, ink-3, max 40 ch, hel bredd under | 14 px |
| Höjd på mobil (358 px kort) | cirka 32 + 12 + 40 + 6 + 24 = 114 px plus följerad | cirka 48 + 16 + 72 + 8 + 28 = 172 px plus följerad |

Fast geometri i CSS, inga mätningar i JS: CLS noll. Kortet som bär elementet sätter marginalerna (PaywallCard `mt-3`, pub-kort 18 px, slutkortet 26 px).

### 3.2 Färger

| | ljus | vagg |
|---|---|---|
| Staplar, omarkerade | `--ink-3` | `--vagg-svag` (på premium-bläcket saknas den: `rgba(255,255,255,.34)`) |
| Markerad stapel | `--koppar` | `--koppar-ljus` |
| Glyfer utan markering | `--ink-2`, `--illu-accent: currentColor` | `--vagg-mjuk` |
| Markerad glyf | `--ink-1`, `--illu-accent: var(--koppar)` | `--vagg-ink`, accent `--koppar-ljus` |
| Övriga glyfer när något är markerat | `--ink-3` | `--vagg-mjuk` med opacity .8 |
| Talet | `--ink-1` | `--vagg-ink` |
| "över", "uppgifter", följeraden | `--ink-3` | `--vagg-mjuk` |

Mörkt läge följer tokens; inget eget block behövs. Variabler på `.bb` (`--bb-stapel`, `--bb-mark`, `--bb-bas` med flera) så att `.bb-vagg` bara byter värden.

## 4. Ytorna

| Yta | Form | Yta | Markerad | Plats | Text |
|---|---|---|---|---|---|
| PaywallCard, varianterna `testniva` och `test-tak` | rad | ljus | `testTyp` (prop som i dag) | Ersätter TestBredd-raden mellan brödtext och prisrad | Ingen följerad; brödtexten bär meningen om månaden (säljs F3, slutlig text T8) |
| Kortet "Premium tar bort taket", src/app/(public)/verktyg/rekryteringstester/page.tsx rad 644 | rad | vagg | ingen | Efter kortets stycke | Följeraden T8 |
| /priser, stationen Rekryteringstester (avsnitt 4, `Station rum="tran" stor`) | platta | ljus | ingen | Stationens bild | Följeraden T8 |
| Slutkortet i artiklarna, `SlutKort` paket `test` (ArtikelReklam.tsx), PremiumBlock | rad | vagg | ingen | Mellan rubrik och punkter i textspalten; telefonerna står kvar | Följeraden T8 |

PaywallCard: labeln blir `Över 3 500 uppgifter i åtta testtyper ... , deduktiv slutledning låst`; aria-texten "Nio testtyper" (säljs punkt om rad 350) försvinner i samma ändring. PaywallCard är `'use client'`, så den importerar bara `BANK_PER_TYP` ur den rena filen, aldrig bankerna.

Steg 3 i registreringen och Black Week-mejlet (säljs förslag) ingår inte i den här skissen. Mejlet är text och läser `BANK_TEXT`. Registreringen får elementet i formen rad, ljus, om copywritern och saas-lead vill ha det där.

## 5. Bygge och QA

- Opus 5.5 bygger: `bankbredd.ts` med vitest, `Bankbredd.tsx`, `bb-`-stilen i globals.css, och de fyra ytorna. PaywallCard-testerna (analytics, kampanj) ska gå igenom oförändrade.
- Följeraden byts från platshållaren till T8-raden när textdäcket är klart; tills dess står platshållaren, som är sann mot koden.
- Riktig webbläsartest enligt regeln: Pixel 7 och dator, testväggen från ett låst nivåtest i ett nytt gratiskonto, kortet på testsidan, stationen på /priser, slutkortet i en testartikel. Mörkt läge på väggen. Ingen horisontell scroll i 358 px.
- Lova aldrig "aldrig samma uppgift" i någon följerad. Karensen i urvalet är sju dagar och en prioritering, mätningen 30 dagar är regeln som håller.
