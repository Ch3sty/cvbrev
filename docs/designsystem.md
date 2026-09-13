# Designsystem: Tråden (v2)

> Gäller dashboard, flöden, betalväggar och auth. Publika sidor och prissidan
> tas i en senare omgång (avsnitt 12). Artikelbilder 1200×630 följer
> `reference_article_image_standard` och berörs inte.
>
> Motiv och beslut: `docs/design/koncept-2026-09-13.md`. Tokenvärdena bor i
> `src/app/globals.css`, klassnamnen i `tailwind.config.js`.

## 1. Principer

Jobbcoach är papper på ett bord och en orange linje som visar var du är.
Hierarki byggs av toner, kanter och typografi, aldrig av skuggor eller
gradienter. Orange är linje eller bläck, aldrig en yta, och handlingen är
svart. En vy har en primär handling, en illustration och högst tre orange
inslag. Status är en rad, innehåll är ett kort.

## 2. Toner och färg

Alla värden ligger som CSS-variabler under `:root` i `globals.css` och har
Tailwind-namn i `tailwind.config.js`. Hex skrivs aldrig i en komponent.

| Variabel | Värde | Tailwind | Roll |
|---|---|---|---|
| `--mark` | `#EDE8DF` | `bg-mark` | Sidbakgrund. Skalet sätter den, sidan aldrig. |
| `--panel` | `#FFFFFF` | `bg-panel` | Kort, sektioner, sidomeny, topprad, nav |
| `--insunken` | `#ECE6DC` | `bg-insunken` | Fält, skelett, aside. Alltid inuti en panel. |
| `--insunken-topp` | `#D6CDBF` | `bg-insunken-topp` | Inre överkant, via `shadow-insunken` |
| `--kant` | `#DBD2C4` | `border-kant` | Hårlinje |
| `--kant-stark` | `#C4B9A8` | `border-kant-stark` | Upphöjd panel, hover, understruken länk |
| `--ink-1` | `#1C1917` | `text-ink-1`, `bg-ink-1` | Rubriker, värden, primärknapp, val |
| `--ink-2` | `#57534E` | `text-ink-2` | Brödtext, ikoner |
| `--ink-3` | `#6B645E` | `text-ink-3` | Metadata, sektionsetiketter |
| `--ink-hover` | `#2C2724` | `hover:bg-ink-hover` | Primärknappens hover |
| `--accent` | `#D9480F` | `bg-accent` | Tråden, framstegslinje, fokusring, punkt i varm statusrad. Aldrig text, aldrig yta. |
| `--accent-ink` | `#9A3412` | `text-accent-ink` | Orange som text |
| `--accent-mjuk` | `#FBE7D3` | `bg-accent-mjuk` | Marginalplattans fyllning |
| `--positiv` / `--positiv-mjuk` | `#047857` / `#D9F2E6` | `text-positiv`, `bg-positiv-mjuk` | Sparat, intervju |
| `--varning` / `--varning-mjuk` | `#A14A05` / `#FBEBD0` | `text-varning`, `bg-varning-mjuk` | Kvot, trial dag 4 till 5 |
| `--fel` / `--fel-mjuk` / `--fel-kant` / `--fel-morker` | `#B91C1C` / `#FBE3E3` / `#F2C4C4` / `#7F1D1D` | `text-fel`, `bg-fel-mjuk`, `border-fel-kant`, `text-fel-morker` | Feltext, felram, felrad |

Illustrationsvariablerna pekar om: `--illu-fill: var(--panel)`,
`--illu-accent: var(--accent)`, `--illu-soft: var(--accent-mjuk)`,
`--illu-muted: var(--kant-stark)`. `--ia` är `none` som standard och tänds
bara av `MarginPlate`.

### Kontrast

Mätt per par som faktiskt förekommer (WCAG 2.x, konceptet avsnitt 13).

| Par | Kvot | Krav |
|---|---|---|
| panel / mark | 1,22 | tonsteg ≥ 1,2 |
| panel / insunken | 1,25 | tonsteg ≥ 1,2 |
| vit på ink-1 | 17,5 | AA |
| ink-3 på mark | 5,0 | AA, gäller ner till 12 px |
| ink-3 på insunken | 4,7 | AA |
| accent-ink på mark | 6,4 | AA |
| accent på mark | 3,9 | UI-grafik 3:1 |
| accent på panel | 4,6 | UI-grafik 3:1 |
| positiv på panel | 5,5 | AA |
| varning på varning-mjuk | 5,1 | AA |
| fel på fel-mjuk | 5,3 | AA |
| kant-stark på panel | 2,0 | inget: en kant är aldrig ensam gräns |

### Två räkneregler

**Orange högst tre gånger per skärm på 375 px.** Räkna tråden, prickenden i
`StatusRow tone="warm"`, text i `text-accent-ink` och marginalplattan som en
träff var. Blir det fler, ta bort accenten från det minst viktiga.

**En marginalplatta per vy.** Plattan sitter på vyns framhävda element:
rekommenderat valkort, aktiv sektion, Nästa handling, betalväggen. Allt annat
får naken ikon i 24.

Toggles, bockar och aktiv flik i navigationen är ink-1 och räknas inte.

## 3. Typskala

Inter, vikterna 400, 500 och 600. Karaktären kommer ur kontrasten i skalan,
inte ur familjen. Storlek, radavstånd, spårning och vikt ligger i
`tailwind.config.js` under `fontSize`, så klassen bär hela stilen.

| Roll | Klass | Storlek / radavstånd / vikt |
|---|---|---|
| Sidrubrik (h1) | `text-h1` | 28 / 32 / 600, -0.02em |
| Flödesfråga | `text-fraga` | 22 / 28 / 600, -0.02em |
| Stort tal | `text-tal tabular-nums` | 40 / 40 / 500, -0.02em |
| Kortrubrik | `text-kort` | 16 / 22 / 600, -0.01em |
| Metadata | `text-meta text-ink-3` | 13 / 18 / 400 |
| Stegetikett | `text-steg uppercase text-ink-3` | 12 / 16 / 500, 0.06em |
| Sektionsetikett | `text-sm font-medium text-ink-3` | 14 / 20 / 500 |
| Brödtext | `text-sm leading-[22px] text-ink-2` | 14 / 22 / 400 |

Sektionsrubriker ("Pågår nu", "Senaste aktivitet") är etiketter i ink-3, inte
h2 i 18/600. Då blir kortrubriken 16/600 den tyngsta texten i innehållet och
sidrubriken den enda som är större. Stora tal står i vikt 500 och får plats
fyra i bredd på 375 px. `text-steg` i `text-accent-ink` används bara för
"Rekommenderas". Tyngre vikt än 600 finns inte.

Minsta textstorlek är 12 px. `text-[10px]` och `text-[11px]` används inte.

## 4. Djup utan skugga

```
Mark      #EDE8DF                                    nivå 0
 └ Panel  #FFFFFF, border-kant, rounded-xl           nivå 1
    ├ Insunken #ECE6DC, border-kant, shadow-insunken nivå 1 minus
    └ Upphöjd  #FFFFFF, border-kant-stark            nivå 2
       └ Vald  #FFFFFF, border-ink-1, shadow-val     val
```

Spacing: bara 4 / 8 / 12 / 16 / 24 / 32 / 48 px, alltså Tailwind `1 2 3 4 6 8
12`. Inga `gap-2.5`, `p-3.5`, `py-0.5`. Sidor `space-y-4` på mobil och
`sm:space-y-6`. Kort `p-4`, `sm:p-5`.

Radier: `rounded-lg` (8) för kontroller, fält, plattor och menyrader,
`rounded-xl` (12) för kort, paneler och ark, `rounded-md` för chips.
`rounded-2xl` och `rounded-3xl` används inte.

Tre skuggtokens, inga andra:

| Token | Värde | Var |
|---|---|---|
| `shadow-insunken` | `inset 0 1px 0 var(--insunken-topp)` | Fält och insunkna ytor. Ljuset kommer uppifrån, överkanten ligger i skugga. |
| `shadow-val` | `inset 0 0 0 1px var(--ink-1)` | Valt alternativ, tillsammans med `border-ink-1` |
| `shadow-svav` | `0 8px 24px rgba(28,25,23,.12), 0 1px 2px rgba(28,25,23,.08)` | Bara element som svävar: sheet, dropdown, toast, sticky fot |

`shadow-sm/md/lg/xl` och `drop-shadow-*` används inte. Inga gradienter i
inloggat läge.

## 5. Tråden

En orange linje som betyder en sak: **här är du.** Den markerar aldrig val.
Allt nedan är ren CSS i `globals.css`, ingen JS.

| Var | Klass | Hur |
|---|---|---|
| Aktiv rad i sidomenyn | `.thread-row` | 3 px vid radens vänsterkant, 12 px utanför raden, 8 px indrag i höjd |
| Aktiv sektion på en lång sida | `.thread-head` på panelen, `.thread-head-block` på huvudet | 3 px längs sektionshuvudet, 16 px indrag. Panelen får `border-kant-stark`. |
| Aktivt steg i ett flöde | `FlowShell` | 2 px framstegslinje under toppraden |
| Laddning | `.loading-thread` | 2 px, 40 procent bredd, löper längs panelens överkant i 1200 ms |
| Bekräftelse | `.confirm-panel` | Linjen går till 100 procent och stannar som panelens 3 px överkant |
| Fokus | `outline: 2px solid var(--accent)` på `:focus-visible` | Fokusringen är tråden |

Val markeras i stället med `border-ink-1 shadow-val` plus en fylld bock i
ink-1, 22 px, i övre högra hörnet. Toggles är ink-1. Valt segment får
`border-ink-1` och vikt 500. Så finns det bara en orange linje i systemet,
och den är igenkännbar för att den är ensam.

## 6. Komponenter

Allt i `src/components/shell/` om inget annat sägs. Bygg aldrig om dem per
sida. Saknas en prop: lös det lokalt i sidan och skriv upp det.

**`PageHeader { title, description?, action?, children?, className? }`**
Sidans enda h1 (`text-h1`). Ingen egen rubrik under. `action` blir full bredd
på mobil, auto från `sm`.

**`StatusRow { children, tone?, showDot?, action?, label?, className? }`**
Alltid en rad i panel med `border-kant`, aldrig ett kort, aldrig en fylld yta.
Tonen byter bara text och punkt: `neutral` (`text-ink-1`, punkt `bg-ink-3`),
`warm` (`text-accent-ink`, punkt `bg-accent`), `positive` (`text-ink-1`, punkt
`bg-positiv`). Trialrad `tone="warm"`, kvotrad `tone="neutral"`. Högst en
`warm` per vy.

**`ChoiceCard { selected, onSelect, title, description?, meta?, eyebrow?, leading?, variant?, children?, className? }`**
`role="radio"`. Rekommenderat val: `variant="featured"`,
`eyebrow="Rekommenderas"`, `leading={<MarginPlate><IlluPlattaSmartTon size={48} /></MarginPlate>}`.
Övriga: `variant="plain" leading={<IkonProfessionell />}` (naken ikon 24 i
ink-2). Det valda tillståndet ritas av komponenten, skicka aldrig egna klasser
för det.

**`Segment { value, onChange, options, label, className? }`**
Två till fyra lika alternativ, till exempel språk. Lika breda knappar på 44 px
i `role="radiogroup"`. Valt: `border-ink-1 shadow-val`, vikt 500.

**`MarginPlate { children, className? }`**
56 px, `bg-accent-mjuk border border-kant rounded-lg`. Sätter `--ia:
var(--accent)` och är därmed det enda stället där ikonernas accentform tänds.
En per vy.

**`EmptyState { illustration?, title, description?, action?, secondaryAction?, bare?, className? }`**
Scen i 96 (standard `IlluTomMapp`), kortrubrik, en mening, en knapp. `bare`
tar bort panelramen, används för dashboardens tillstånd A med
`IlluArketLyfter`. Ett skelett får aldrig ligga kvar: vid noll rader visas
`EmptyState`, vid fel ett felmeddelande.

**`LoadingSkeleton { variant?, count?, label?, meta?, className? }`**
Varianter `row | card | list | text | statusRow | writing`. Skelettblocken
står stilla i `bg-insunken`, bara tråden rör sig. `role="status"`,
`aria-busy`, `aria-live="polite"`. Generering:
`variant="writing" label="Brevet skrivs" meta="Brukar ta 20 sekunder"`. Ingen
spinner, ingen pulserande yta.

**`Confirmation { title, description?, action?, secondaryAction?, illustration?, children?, className? }`**
`role="status" aria-live="polite"`. Titeln säger vad som skapades: "Ditt brev
till Klarna är klart", aldrig "Klart!". Komponenten sköter animeringen
(`.confirm-panel`, `.confirm-rise`, `.confirm-draw`), lägg inte till egen.
Ingen konfetti, ingen maskot.

**`FlowShell { title, step, totalSteps, onBack?, onExit?, exitLabel?, primaryLabel?, onPrimary?, primaryDisabled?, primaryBlockedReason?, primaryBusy?, busyLabel?, footerSecondary?, banner?, children }`**
Mark, topprad i panel, 2 px framstegslinje, sticky fot. Fortsätt-knappen
ligger alltid i foten. Steget börjar så här:

```tsx
<p className="text-steg uppercase text-ink-3">Steg 4 av 6</p>
<h2 className="text-fraga text-ink-1">Hur ska brevet låta?</h2>
```

**`FlowProgress { progress, estimatedTimeRemaining?, stages, onCancel?, cancelLabel? }`**
Långa väntor. `role="progressbar"` med `aria-valuenow`.

**`FlowError { message, title?, onRetry?, retryLabel?, secondaryAction?, className? }`**
`role="alert"`. Ingen rörelse, ingen röd yta bakom rubriken, rött aldrig på
hela kortet.

**`Sheet { open, onClose, title?, description?, children, footer?, size?, bare?, className? }`** och
**`ConfirmDialog { open, onCancel, onConfirm, title, description?, confirmLabel?, cancelLabel?, destructive? }`**
Panel med `shadow-svav`, 240 ms. Inga egna modaler, ingen `window.confirm`.

**`PaywallCard { variant, isPremium?, findingsTotal?, hiddenCount?, quota?, onCopy?, onDismiss?, onSecondary?, planOrder?, className? }`**
i `src/components/paywall/`. Varianter: `nedladdning`, `cv-export`, `kvot`,
`analys`, `test-tak`, `nedgraderad`, `cv-antal`, `jobbtraffar`, `af-rapport`.
Copy ordagrant från `paywall-copy.ts`. Premium får `null`. Kortet är en
upphöjd panel med `border-kant-stark`: det är inte en position, det är ett
erbjudande, alltså ingen tråd. Värdet visas alltid före spärren, brevet i sin
helhet ovanför. En ink-knapp, det sekundära alltid en textlänk. Aldrig en egen
betalvägg i en sida. Produktvalet är `UpgradeSheet`, dagspass först i
betalväggar, månad först på prissidan.

### Panel, lista och sektionsrubrik

```tsx
<div className="mb-2 flex items-center justify-between">
  <h2 className="text-sm font-medium text-ink-3">Pågår nu</h2>
  <Link className="text-sm text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1">
    Alla 11
  </Link>
</div>
<section className="rounded-xl border border-kant bg-panel p-4 sm:p-5">…</section>
```

Lista i panel: rader med `divide-y divide-kant`, varje rad `px-4 py-3`, titel
`text-kort text-ink-1`, undertext `text-meta text-ink-3`.

### Knappar

Höjd 44 px (`h-11`), full bredd på mobil och auto från `sm`. Exakt en primär
per vy, en sida får sakna den.

- Primär: `inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover disabled:opacity-40`
- Sekundär: `inline-flex h-11 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 hover:bg-insunken`
- Text och länk: `text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1`
- Destruktiv: som sekundär med `text-fel border-fel-kant`. Aldrig fylld röd.

En sekundär handling i en betalvägg är alltid en textlänk, aldrig en andra
knapp.

### Fält

```tsx
<label className="block">
  <span className="mb-1 block text-sm font-medium text-ink-2">Telefon</span>
  <input className="h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1" />
  <span className="mt-1 block text-meta text-ink-3">Används bara när du väljer att bli kontaktad.</span>
</label>
```

Fel: `border-fel` på fältet och hjälptexten i `text-fel`. Sparat: hjälptexten
i `text-positiv` med ordet "Sparat".

### Stort tal

```tsx
<div>
  <div className="text-tal tabular-nums text-ink-1">11</div>
  <div className="text-meta text-ink-3">sökta</div>
</div>
```

## 7. Illustrationer och ikoner

Primitiverna ligger i `src/components/illustrations/primitives.tsx`: konturer
i `currentColor`, fyllning via `--illu-fill`, unika id via `useIlluId()`,
`aria-hidden`, `focusable="false"`, inga animationer i SVG, aldrig hårdkodat
`fill="white"`. Linjetjocklek och hörnradie per viewBox ligger i `ILLU`:

| viewBox | Stroke | Radie |
|---|---|---|
| 24 | 1,75 | 2 |
| 48 | 2 | 4 |
| 96 | 3 | 8 |
| 240 | 6 | 20 |

### Ikoner, 24 px

`src/components/illustrations/Ikoner.tsx`. 24 px, stroke 1,75,
`currentColor`, normalt i `text-ink-2`. Bredare proportioner än Lucide och en
avsiktlig asymmetri per motiv: dörren till höger på huset, fotot till vänster
på CV:t, plusset i nedre högra hörnet på Skapa.

De tolv motiven i kartan `IKONER`: Hem, Ansökningar, Skapa, Profil, Brev, CV,
Analys, Professionell, Entusiastisk, Kreativ, Självsäker, Balanserad. Filen
har dessutom gränssnittsmotiven Klocka, Meddelanden, Hjälp, Fel, Sköld, Krona,
LaddaNer, Länk, Matchning, Mallar, Synlig och Bugg.

Accentformen är en fylld form med `fill: var(--ia, none)`. Den tänds bara
inuti `MarginPlate`, aldrig i navigation eller listor. Samma symbol, två
lägen, ingen extra fil.

Lucide får finnas kvar för generiska handlingar: pil, kryss, chevron, meny,
Check, Copy, Download, i 20 px och `strokeWidth 1.75`. Aldrig Sparkles.
Aldrig emoji. Aldrig en ikon i en egen rundad ruta utöver marginalplattan.

### Tre storlekar

| Storlek | Var | Komponent |
|---|---|---|
| 24, naken | Listrad, navigation, manuella val | `Ikoner.tsx` |
| 48 på platta 56 | Vyns framhävda element | `IlluPlatta*` i `MarginPlate` |
| 96 | Tomt tillstånd, bekräftelse | `IlluTomMapp`, `IlluTomSokning`, `IlluBrevBekraftat` |
| 240 | Hero, bara dashboardens tillstånd A | `IlluArketLyfter` |

Plattmotiven i `src/components/illustrations/TradenScener.tsx`:
`IlluPlattaUppfoljning`, `IlluPlattaPresentation`, `IlluPlattaSmartTon`,
`IlluPlattaNedladdning`, `IlluPlattaCvPoang`, `IlluPlattaAnsokan`,
`IlluPlattaTest`, `IlluPlattaPremium`. Ytspecifika motiv ligger kvar i sina
egna filer (`PaywallIllustrations`, `JobbmatchningIllustrations` med flera).

### Scenregler för 96 och 240

1. En scen berättar ett ögonblick, inte en kategori. Tomt tillstånd för
   ansökningar är inte "en mapp", det är en öppen mapp som väntar på sitt
   första ark.
2. Högst tre element: ett bärande, ett rörligt, ett accentelement. Ingen mark,
   ingen horisont, ingen bakgrundscirkel.
3. Det rörliga elementet lutar 4 till 8 grader.
4. Accentformen är fylld och liten, högst en tiondel av motivet.
5. Aldrig ovanpå text. På mobil står scenen ovanför texten, på desktop i egen
   kolumn till höger.

En illustration per vy, aldrig två. Mail använder aldrig inline-SVG, headern
är PNG i `public/email/`.

## 8. Rörelse

CSS-transitions och keyframes, inte framer-motion. Ingen skalning på kort,
ingen fjäder, ingen konfetti. Rörelsen är tråden.

| Vad | Tid | Kurva | Var |
|---|---|---|---|
| Sidentré | 200 ms, y 8 → 0 | ease-out | `animate-thread-enter` |
| Statusrad, dropdown, toast | 200 ms, y -4 → 0 | ease-out | `animate-thread-drop` |
| Laddningstråd | 1200 ms loop | ease-in-out | `.loading-thread` |
| Lång väntan, tre rader | 1800 ms loop, 600 ms förskjutning | ease-out | `.writing-lines` |
| Bekräftelse | panel 240, linje 200 från 240, bock 480 från 440, rubrik 200 från 560 | ease-out | `.confirm-panel`, `.confirm-draw`, `.confirm-rise` |
| Framstegslinje vid stegbyte | 240 ms, `transition-[width]` | ease-out | `FlowShell` |
| Val | 160 ms | ease-out | `ChoiceCard` |
| Hover på kant | 120 ms | linear | `Segment`, panelhover |
| Tryck | 80 ms, bakgrund till insunken | linear | `active:bg-insunken` |
| Ark | 240 ms, upp från botten på mobil | ease-out | `@keyframes sheetUp` |
| Fel | 0 | | `FlowError` |

Bekräftelsen är det enda tillfället då tempot skiljer sig, och det är
kontrollerat: ingenting nytt dyker upp, det är samma linje som äntligen kommer
fram.

`@media (prefers-reduced-motion: reduce)` nollar `.loading-thread`,
`.writing-lines`, `.confirm-panel`, `.confirm-draw` och `.confirm-rise` till
sina sluttillstånd. Rörelse som startar vid inladdning ligger bakom
`motion-safe:`.

## 9. Tillgänglighet

- Fokusringen är tråden: `outline: 2px solid var(--accent)` med 2 px offset på
  `:focus-visible`. Aldrig borttagen, aldrig ersatt.
- Minsta träffyta 44 px, och 48 px i navigation. `py-2` ger cirka 34 px och är
  för litet. Gäller även stängknappar, ikonknappar och filterpiller.
- Exakt ett `h1` per sida, alltid synligt, alltid `PageHeader`.
- Laddning: `role="status" aria-busy aria-live="polite"`. Framsteg:
  `role="progressbar"` med `aria-valuenow`. Fel: `role="alert"`.
  Bekräftelse: `role="status" aria-live="polite"`.
- Val: `role="radio"` med `aria-checked`, grupper `role="radiogroup"` med
  `aria-label`. Aktiv navigationsrad `aria-current="page"`.
- Illustrationer och ikoner utan namn är `aria-hidden="true"`. Betydelsebärande
  ikoner får `title`.
- Ingen färg är ensam informationsbärare: en punkt följs alltid av text.
- Minsta textstorlek 12 px, metadata 13 px.

### Mobil, safe areas och z-index

375 px först. Ingen horisontell body-scroll, breda tabeller får egen
`overflow-x-auto`. Allt sticky respekterar `env(safe-area-inset-bottom)`.
Bottennavets höjd är en sanning, `--bottom-nav-h`, som alla sticky element och
`.dashboard-main-content` räknar mot. Inga hårdkodade offsets.

Flerstegsflöden sätter `--bottom-nav-h: 0` medan flödet är öppet, och foten
använder `position: sticky` i en `100dvh`-kolumn, aldrig `position: fixed`,
eftersom iOS lägger tangentbordet över fixed-element. Använd `100dvh`, aldrig
`100vh`.

| Lager | z-index |
|---|---|
| Innehåll | 0 |
| Sticky element | 30 |
| Navigation | 40 |
| Sheet och bottenark | 50 |
| Modal och dialog | 60 |
| Toast | 70 |

## 10. Förbjudna mönster

| Gammalt | Nytt |
|---|---|
| `bg-white`, `bg-gray-50` som sidbakgrund | inget, skalet ger `bg-mark` |
| `bg-white` på kort | `bg-panel` |
| `bg-gray-50`, `bg-gray-100` inuti panel | `bg-insunken shadow-insunken` |
| `border-gray-*`, `border-slate-*` | `border-kant`, `border-kant-stark` |
| `text-gray-900`, `text-black` | `text-ink-1` |
| `text-gray-700`, `text-gray-600` | `text-ink-2` |
| `text-gray-500`, `text-gray-400` | `text-ink-3` |
| `text-orange-*` | `text-accent-ink` |
| `bg-orange-*`, `bg-amber-*` som yta | bort, `bg-panel` |
| `bg-orange-500/600` primärknapp | `bg-ink-1 text-white hover:bg-ink-hover` |
| `border-orange-*`, `ring-orange-*` på valt kort | `ChoiceCard selected` |
| `bg-gradient-*`, `from-*`, `via-*`, `to-*` | bort |
| `shadow-sm/md/lg/xl`, `drop-shadow-*` | `border border-kant`, annars `shadow-svav` |
| `rounded-2xl`, `rounded-3xl` | `rounded-xl` |
| `font-bold`, `font-extrabold`, `font-black` | `font-semibold` |
| `text-green-600` | `text-positiv` |
| `text-red-600`, `bg-red-50` | `text-fel`, `bg-fel-mjuk border-fel-kant` |
| `text-amber-600`, `text-yellow-600` | `text-varning` |
| `text-3xl`, `text-4xl` för stora tal | `text-tal tabular-nums` |
| `text-2xl` sidrubrik | `text-h1` |
| `animate-pulse`, `animate-shimmer`, `card-hover-effect` | `.loading-thread` |
| `framer-motion` | CSS-klasserna i avsnitt 8 |
| `Sparkles` från lucide | bort, alltid |
| Lucide för navigation och tonaliteter | `Ikoner.tsx` |
| em-dash i copy | bort, alltid |

Kör efter varje sida, förväntat: inga träffar i dina filer.

```bash
grep -rnE "bg-orange-|bg-amber-|from-orange|to-orange|bg-gradient|shadow-(sm|md|lg|xl|2xl)|drop-shadow|rounded-(2xl|3xl)|font-(bold|extrabold|black)|framer-motion|Sparkles|text-orange-[0-9]|border-orange|ring-orange|bg-white\b|bg-gray-|text-gray-|border-gray-|text-slate|bg-slate|border-slate|animate-pulse|animate-spin|—" src/app/dashboard src/components/tests src/components/interests src/components/jobbcoachen src/components/kontakt --include=*.tsx
```

Två undantag får finnas, och varje förekomst skrivs upp i rapporten:
`bg-white` i brevmallars och CV-mallars förhandsvisning (dokumentet är papper),
och `animate-spin` inuti en knapp i busy-läge.

## 11. Mörkt läge

Inte byggt. Principen är tokenprincip: samma roller, omvänd stege, och inga
värden får väljas som omöjliggör den.

| Roll | Mörkt värde |
|---|---|
| mark | `#1A1714` |
| panel | `#232019`, ljusare än mark: papperet ligger fortfarande på bordet |
| insunken | `#15120E`, mörkare än panel: fortfarande lägre |
| kant | `#3A342C` |
| kant-stark | `#554D42` |
| ink-1 / ink-2 / ink-3 | `#F3EEE6` / `#C9C1B6` / `#9A918A` |
| accent | oförändrad `#D9480F` (5,2:1 mot mörk mark) |
| accent-ink | `#F4A575` |
| accent-mjuk | accent på 18 procent |

Primärknappen inverteras till ink-1 med mörk text. Illustrationerna behöver
inget nytt: konturerna följer `currentColor` och fyllningen `--illu-fill`.
Därför skrivs aldrig hex i en komponent.

## 12. Publika sidor

Tas i en senare omgång. Hero-gradienten och `--jc-gradient-*` ligger kvar på
publika sidor tills dess, men aldrig i inloggat läge. Knappstilen följer efter
till ink, så att publikt och inloggat blir ett system och inte två.
Logotypens `#F97316` läses som samma familj som accenten och byts inte.
Färgerna `navy` och `pink` i `tailwind.config.js` tillhör de publika ytorna
och används aldrig i dashboarden.

## 13. Copy

Svenska. Inga em-dash. Inga AI-klichéer. Aktiv form. Flöden ställer frågor.
Knappen säger exakt vad som händer. Bekräftelsen säger vad som skapades och
var det finns. Felet säger vad som gick fel och hur man går vidare.
Gratisnivån är alltid "ett brev om dagen". Sidhuvudets underrad säger vad
sidan gör, inte vad den heter.

## 14. Ändringslogg

**v2, Tråden, 2026-09-13.** Ersätter v1. Vad som ändrades:

- Färgsystemet gick från Tailwinds neutral- och orangeskalor till egna tokens
  (`mark`, `panel`, `insunken`, `kant`, `ink-1..3`, `accent`) med mätt
  kontrast per par.
- Primärknappen är ink-1, inte orange. Orange är linje och bläck, aldrig yta,
  och räknas: högst tre per skärm, en platta per vy.
- Tråden infördes som enda betydelsebärande linje: position.
- Djup byggs av tre toner plus `shadow-insunken` och `shadow-val`. Skugga bara
  på det som svävar (`shadow-svav`).
- Typskalan flyttade in i `tailwind.config.js` som `text-h1`, `text-fraga`,
  `text-tal`, `text-kort`, `text-meta`, `text-steg`. Sektionsrubriker blev
  etiketter i 14/500 ink-3.
- Nya komponenter: `MarginPlate`, `ChoiceCard`, `Segment`, `Confirmation`,
  `FlowShell`, `FlowProgress`, `FlowError`, `FlowResumeBanner`.
- Ikonerna blev egna, tolv motiv i `Ikoner.tsx`, med scenerna i
  `TradenScener.tsx` i 48, 96 och 240.
- Rörelsen gick från framer-motion till CSS med `prefers-reduced-motion`.
- Mörkt läge och publika sidor beskrivs som princip, inte som byggt.

**v1, 2026-09-11.** Linear/Vercel-uttryck på Tailwinds neutralskala, orange
primärknapp, `docs/plan-konvertering.md` spår E.
