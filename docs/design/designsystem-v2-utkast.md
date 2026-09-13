# Designsystem v2: Tråden (utkast)

> Utkast 2026-09-13, iteration 2. Ersätter `docs/designsystem.md` (v1) när
> fas 2 är byggd. Motiv och beslut i `docs/design/koncept-2026-09-13.md`,
> förhandsvisning i `docs/design/rod-trad-preview.html`.
>
> Gäller dashboard, flöden, betalväggar och auth. Publika sidor och prissidan
> tas i en senare publik omgång; knappstilen följer då efter. Artikelbilder
> följer `reference_article_image_standard` och berörs inte.

## Uttryck

Papper på ett bord och en orange linje som visar var du är. Marken är varm
benvit, panelerna vitt papper, fälten insunkna. Handlingen är svart som en
penna. Orange är linje eller bläck, aldrig yta.

En vy har en primär handling. Status är en rad, innehåll är ett kort. En
illustration per vy, på sin egen plats.

## Tokens

I `globals.css` under `:root`, exponerade i `tailwind.config` som färgnamn.
Hex skrivs aldrig i komponenter.

| Token | Värde | Tailwind | Roll |
|---|---|---|---|
| `--mark` | `#EDE8DF` | `mark` | Sidbakgrund |
| `--panel` | `#FFFFFF` | `panel` | Kort, sektioner, sidomeny, topprad, nav |
| `--insunken` | `#ECE6DC` | `insunken` | Fält, skelett, aside. Plus `--insunken-topp #D6CDBF` som inre överkant |
| `--kant` | `#DBD2C4` | `kant` | Hårlinje |
| `--kant-stark` | `#C4B9A8` | `kant-stark` | Upphöjd panel, hover |
| `--ink-1` | `#1C1917` | `ink-1` | Rubriker, värden, primärknapp, val |
| `--ink-2` | `#57534E` | `ink-2` | Brödtext, ikoner |
| `--ink-3` | `#6B645E` | `ink-3` | Metadata, sektionsetiketter |
| `--accent` | `#D9480F` | `accent` | Tråden, framstegslinje, fokusring. Aldrig text, aldrig yta |
| `--accent-ink` | `#9A3412` | `accent-ink` | Orange som text |
| `--accent-mjuk` | `#FBE7D3` | `accent-mjuk` | Marginalplatta |
| `--positiv` / `-mjuk` | `#047857` / `#D9F2E6` | `positiv` | Sparat, intervju, bock i bekräftelse |
| `--varning` / `-mjuk` | `#A14A05` / `#FBEBD0` | `varning` | Kvot, trial dag 4 till 5 |
| `--fel` / `-mjuk` | `#B91C1C` / `#FBE3E3` | `fel` | Feltext, felram, felrad |

Illustrationsvariablerna pekar om: `--illu-fill: var(--panel)`,
`--illu-soft: var(--accent-mjuk)`, `--illu-muted: var(--kant-stark)`,
`--illu-accent: var(--accent)`.

Tonstegen är mätta: panel 1,22:1 över mark, insunken 1,25:1 under panel.
Alla textpar klarar AA. `accent` får aldrig bära text.

**Orange högst tre gånger per skärm: tråden, bläcket, illustrationens
accentform.** Ingen orange knapp, ingen orange fyllning på rader, ingen
orange i navigation, inga orange toggles eller bockar.

### Mörkt läge, princip

Samma roller, omvänd stege: mark `#1A1714`, panel `#232019`, insunken
`#15120E`, kant `#3A342C`, kant-stark `#554D42`, ink-1 `#F3EEE6`, ink-2
`#C9C1B6`, ink-3 `#9A918A`, accent oförändrad, accent-ink `#F4A575`,
accent-mjuk = accent på 18 procent. Primärknappen inverteras. Byggs inte i
fas 2, men tokens får inga värden som omöjliggör det.

Utgår: `bg-white` som sidbakgrund, `bg-orange-*` överallt, `border-orange-*`
på vilande kort, `--jc-gradient-*` i inloggat läge, `animate-pulse-pink`,
`card-hover-effect`, `backdrop-blur` på skalets bakgrund, framer-motion i
valkort.

## Tråden

En orange linje som betyder en sak: **position**.

| Var | Hur |
|---|---|
| Aktiv rad i sidomenyn | 3 px vänsterkant på raden, 8 px indrag |
| Aktiv sektion på lång sida | 3 px längs sektionshuvudet, 16 px indrag, klass `thread-head` |
| Aktivt steg i flöde | 2 px framstegslinje under toppraden |
| Laddning | 2 px linje som löper längs panelens överkant, 1200 ms |
| Bekräftelse | Linjen når 100 procent och stannar som panelens 3 px överkant |

Tråden markerar aldrig val. Val markeras med kant `ink-1` (1 px + 1 px inset)
och en fylld bock i `ink-1`, 22 px, övre högra hörnet.

## Djup

| Nivå | Yta | Kant | Var |
|---|---|---|---|
| 0 | `mark` | | Sidan |
| 1 | `panel` | `kant`, radie 12 | Kort, sektion, lista |
| 1 minus | `insunken` + inre överkant | `kant`, radie 8 | Input, skelett, aside |
| 2 | `panel` | `kant-stark` | Framhävt kort (Nästa handling, betalvägg) |
| val | `panel` | `ink-1` + bock | Valt alternativ |

Skugga bara på element som svävar: sheet, dropdown, toast, sticky fot.

## Spacing och radier

Endast 4 / 8 / 12 / 16 / 24 / 32 / 48 px. Sida `p-4`, `space-y-4` på mobil
och `space-y-6` från `sm`. Kort `p-4`, `sm:p-5`. Radier: kontroller och
platta 8, kort och sheet 12. Inga andra.

## Typografi

Inter. Vikter 400, 500, 600. Karaktär genom kontrast i skalan.

| Roll | Klasser |
|---|---|
| Sidrubrik | `text-[28px] leading-8 font-semibold tracking-[-0.02em]` |
| Flödesfråga | `text-[22px] leading-7 font-semibold tracking-[-0.02em]` |
| Stort tal | `text-[40px] leading-none font-medium tracking-[-0.02em] tabular-nums` |
| Kortrubrik | `text-base font-semibold tracking-tight` |
| Sektionsetikett | `text-sm font-medium text-ink-3` (ersätter h2 18/600) |
| Brödtext | `text-sm leading-[22px] text-ink-2` |
| Metadata | `text-[13px] leading-[18px] text-ink-3` |
| Stegetikett | `text-xs font-medium uppercase tracking-[0.06em] text-ink-3`, bara i flöden och "Rekommenderas" (då `text-accent-ink`) |

Stora tal står fyra i bredd på 375 px i vikt 500. Sektionsrubriker är
etiketter, inte rubriker: kortrubriken 16/600 är tyngst i innehållet.

## Ikoner

Egen uppsättning i `src/components/illustrations/Ikoner.tsx`, ritad i
förhandsvisningens ikonark: Hem, Ansökningar, Skapa, Profil, Brev, CV,
Analys, Professionell, Entusiastisk, Kreativ, Självsäker, Balanserad.

- 24 px, `stroke 1.75`, `currentColor`, i `text-ink-2`.
- Bredare proportioner, en avsiktlig asymmetri per motiv.
- Accentformen är en fylld form med `fill: var(--ia, none)`. Den tänds bara
  på marginalplattan (`--ia: var(--accent)`), aldrig i nav eller listor.
- Lucide bara för pil, kryss, chevron, meny, 20 px, `strokeWidth 1.75`.
  Aldrig Sparkles. Aldrig emoji.

## Marginalplattan och illustrationer

`MarginPlate`: 56 px, `bg-accent-mjuk border border-kant rounded-lg`,
motiv 48 med stroke 2 och fylld accentform. **En per vy**, på vyns framhävda
element. Allt annat får naken ikon 24.

Primitiverna i `primitives.tsx` behålls (currentColor, `useIlluId`, en
accent, `aria-hidden`, inga SVG-animationer). Scen-regler för 96 och 240:

1. En scen berättar ett ögonblick, inte en kategori.
2. Högst tre element: bärande, rörligt, accent.
3. Det rörliga lutar 4 till 8 grader.
4. Accentformen fylld och liten, högst en tiondel.
5. Aldrig ovanpå text. Mobil: ovanför. Desktop: egen kolumn till höger.

| Storlek | Var |
|---|---|
| 24 (naken) | Listrad, nav, manuella val |
| 48 på platta 56 | Vyns framhävda element |
| 96 | Tomt tillstånd, bekräftelse |
| 240 | Hero, bara dashboard A |

## Komponenter (`src/components/shell/`)

| Komponent | v2 |
|---|---|
| `PageHeader` | h1 28. Färger via tokens. |
| `StatusRow` | Alltid panel. Ton byter punkt och text: `neutral` (ink-3), `warm` (accent-punkt, accent-ink), `positive` (positiv). Ingen fyllning. |
| `LoadingSkeleton` | Block i insunken, stillastående. Wrapper med tråd längs överkanten. Variant `writing`. |
| `EmptyState` | Scen 96, kortrubrik, en mening, ink-knapp. |
| **`Confirmation`** (ny) | Panel som glider upp 8 px, linje till 100 procent som stannar som 3 px överkant, bock ritas 480 ms, rubrik "Ditt brev till {företag} är klart". |
| `Sheet`, `ConfirmDialog` | Panel med skugga, 240 ms. |
| `FlowShell` | Mark, topprad panel, 2 px framstegslinje, sticky fot. Rubrik som fråga. |
| `FlowError` | Felrad, ingen rörelse. |
| **`MarginPlate`** (ny) | 56, en per vy. |
| **`ChoiceCard`** (ny) | `featured` (platta 56) och `plain` (naken ikon 24). Val = kant ink-1 + bock. `role="radio"`. |
| **`Segment`** (ny) | Lika breda knappar på 44 px. Valt: kant ink-1, vikt 500. |
| **`Ikoner`** (ny) | De tolv motiven. |

## Knappar

Höjd 44. Full bredd på mobil, auto från `sm`. Aldrig understruken.

- Primär: `bg-ink-1 text-white rounded-lg text-sm font-medium`, hover
  `#2C2724`. Exakt en per skärm, en sida får sakna den.
- Sekundär: `bg-panel border border-kant text-ink-1`.
- Tertiär: textlänk `font-medium underline underline-offset-4
  decoration-kant-stark`; `text-ink-2` dämpad, `text-accent-ink` varm.

Alternativet orange knapp `#BE4A0C` (5,0:1) finns dokumenterat i konceptet
men är inte huvudspår.

## Fält

`h-11 bg-insunken border border-kant rounded-lg text-base px-3` plus
`shadow-[inset_0_1px_0_#D6CDBF]`. Fokus: `bg-panel border-kant-stark` och
fokusring i accent. Hjälptext 13 px i ink-3, sparat i positiv, fel i fel med
kant fel och panelbakgrund. Toggles i ink-1.

## Tillstånd

| Tillstånd | Regel |
|---|---|
| Laddar | Skelett stillastående, tråd längs överkant. `role="status" aria-busy`. |
| Lång väntan | Rubrik "Skriver ditt brev till {företag}", tre rader som fylls, meta om tid. |
| Bekräftelse | `Confirmation`. Ingen konfetti, ingen maskot. |
| Tomt | `EmptyState` med scen. Aldrig ett skelett som ligger kvar. |
| Fel | Felrad i fel-mjuk, ikon 20, fet rubrik, en mening, textlänk. Ingen rörelse. Rött aldrig på hela kortet. |

## Rörelse

CSS-transitions, inte framer-motion (utom sheets). Ingen skalning, ingen fjäder.

| Vad | Tid | Kurva |
|---|---|---|
| Sidentré | y 8→0, 200 ms | ease-out |
| Stegbyte | ut 120, in 200, linje 240 | ease-out |
| Val | 160 ms | ease-out |
| Hover kant | 120 ms | linear |
| Tryck | 80 ms | linear |
| Statusrad, toast | y -4→0, 200 ms | ease-out |
| Sheet | 240 ms | ease-out |
| Laddningstråd | 1200 ms loop | ease-in-out |
| Bekräftelse | panel 240, linje 200, bock 480, rubrik 200 från 560 | ease-out |
| Fel | 0 | |

`prefers-reduced-motion`: allt till opacity.

## Informationsarkitektur

Enligt `docs/plan-inloggat-omdesign.md` avsnitt 3.

- **Mobilnav:** Hem, Ansökningar, Skapa, Profil. 48 px, 12 px etiketter,
  safe-area. Aktiv: `text-ink-1`, stroke 2,25. Prick i ink-1 vid Profil.
  Skapa öppnar bottenark med tre rader på 56 px.
- **Topprad:** hälsning vänster, klocka och avatar höger. Klockan flyttar
  sig aldrig.
- **Sidomeny:** 256 px panel, grupper Översikt/Ansökningar/CV/Brev, Verktyg,
  Konto, Hjälp längst ner. Aktiv rad: `bg-insunken` + tråd. Antal i ink-3.

## Desktop

Innehåll max 960 px, marginal 32. Dashboard C: två kolumner från `lg`, 640
huvud + 320 höger (Nästa handling, kvot). Alla andra sidor en kolumn på 720.
Hero A: scenen till höger om texten.

## Sidmall

```
+--------------------------------------------------------------+ mark
| SIDHUVUD   h1 28 + en rad + (valfri) primär handling          |
+--------------------------------------------------------------+
| STATUS     en rad, aldrig ett kort                            |
+--------------------------------------------------------------+
| INNEHÅLL   panel, aktiv sektion får tråd i huvudet            |
+--------------------------------------------------------------+
```

Exakt ett `h1`. Högst en primär knapp. Orange högst tre gånger.

## Betalväggar

`PaywallCard` behåller varianter och copy. Kortet är en upphöjd panel
(kant-stark), platta 56 med illustration (vyns enda), ink-knapp och textlänk.
Värdet före spärren: brevet i sin helhet ovanför. Trial dag 5 som varm
statusrad med "Behåll Premium" i accent-ink.

## Mobil, touch, safe areas, z-index, textminimum

Oförändrat från v1: 375 px först, 44 px träffyta (48 i nav), 12 px minsta
text (13 för metadata), `100dvh`, `--bottom-nav-h`, z-skalan 0/30/40/50/60/70.

## Copy

Svenska. Inga em-dash. Aktiv form. Flöden ställer frågor. Bekräftelsen säger
vad som skapades och var det finns. Felet säger vad som gick fel och hur man
går vidare. Gratisnivån är "ett brev om dagen".

## Migreringsordning

1. `globals.css`: tokens, tråd, laddning, bekräftelse. Ta bort gamla
   keyframes och gradientvariabler ur inloggat läge.
2. `tailwind.config`: färgnamn.
3. `DashboardShell`: mark, topprad, nav enligt plan.
4. `shell/`: befintliga plus `MarginPlate`, `ChoiceCard`, `Segment`,
   `Confirmation`.
5. `Ikoner.tsx`.
6. `TonalityLanguageStep`: `ChoiceCard` + `Segment`, bort med
   `SmartToneNetwork` och framer-motion.
7. Dashboard A och C. 8. Profil. 9. `PaywallCard`. 10. Övriga.

Varje steg skärmdumpas på Pixel 7 och desktop enligt `docs/qa/` och
klicktestas som ny användare innan det kallas klart. Prestandabudgeten mäts
med `scripts/perf-inloggat.ts`.
