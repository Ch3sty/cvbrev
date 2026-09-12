# Designsystem för produkt-UI

> Gäller dashboard, betalväggar, prissida, auth och publika CTA-komponenter
> från konverteringsomgången 2026-09-11 (`docs/plan-konvertering.md`, spår E).
> Artikelbilder 1200×630 följer `reference_article_image_standard` och
> berörs inte av detta dokument.

## Uttryck

Linear/Vercel: lugnt, tätt, precist. Hierarki skapas med typografi och yta,
inte med färg. En vy har en primär handling. Status är en rad, innehåll är
ett kort.

## Spacing

Endast 4 / 8 / 12 / 16 / 24 / 32 / 48 px, alltså Tailwind `1 2 3 4 6 8 12`.
Inga `gap-2.5`, `mb-1.5`, `p-3.5`, `py-0.5`.

- Dashboard: `space-y-6` mellan sektioner.
- Publika sidor: `space-y-12`.
- Kortpadding: `p-4` mobil, `p-5` eller `p-6` desktop.

## Radier

| Element | Klass |
|---|---|
| Knappar, inputs, rader | `rounded-lg` (8 px) |
| Kort, modaler, sheets | `rounded-xl` (12 px) |

`rounded-2xl` och `rounded-3xl` används inte i produkt-UI.

## Border och skugga

Kort avgränsas med `border border-neutral-200`. Skugga används inte på
stillastående kort. Skugga reserveras för element som svävar: dropdown,
popover, modal, sticky mobil-CTA.

## Färg

Orange är accent, inte yta. Regel: **max en fylld orange yta per skärm**, och
det är den primära knappen.

| Roll | Klass |
|---|---|
| Ram | `border-neutral-200` |
| Primär text | `text-neutral-900` |
| Sekundär text | `text-neutral-600` |
| Metadata | `text-neutral-500` |
| Primär knapp | `bg-orange-600 text-white hover:bg-orange-700` |
| Framhävt kort (prissidan) | `border-orange-600 ring-4 ring-orange-50` |
| Varm statusrad (trial dag 4-5) | `bg-orange-50 border-orange-200 text-orange-900` |
| Fel | `text-red-700`, aldrig röd bakgrund på hela kortet |
| Bekräftelse | `text-emerald-700` |

Utgår: orange bakgrund på kort (`bg-orange-50/60`), orange ram på alla kort
(`border-orange-100`), gradient-strip i korttoppar, gradientcirklar bakom
ikoner, röd-till-rosa-gradienten i UI.

## Typografi

| Roll | Klass |
|---|---|
| Sidrubrik | `text-2xl font-semibold tracking-tight` |
| Sektionsrubrik | `text-lg font-semibold` |
| Kortrubrik | `text-base font-semibold` |
| Brödtext | `text-sm text-neutral-600 leading-relaxed` |
| Metadata | `text-xs text-neutral-500` |
| Siffror | alltid `tabular-nums` |

`font-black` och `font-extrabold` används inte. Tyngsta vikt är `font-semibold`.

## Knappar

Höjd `h-11` (44 px träffyta). Full bredd på mobil, auto på desktop.

- Primär: `bg-orange-600 text-white rounded-lg px-4 text-sm font-medium`
- Sekundär: `bg-white border border-neutral-200 text-neutral-700 rounded-lg`
- Tertiär: textlänk `text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:underline underline-offset-4`

Gradient på knappar bara i prissidans primärknappar och dashboardens enda
primära handling. Sekundär handling i en betalvägg är alltid en textlänk,
aldrig en andra knapp.

## Rörelse

Entré: `opacity 0 → 1`, `y 8 → 0`, 200 ms, `easeOut`. Hover på kort ändrar
bara `border-color`. `whileHover={{ scale }}` och `hover:-translate-y-*` på
kort utgår. Respektera `prefers-reduced-motion`.

## Mobil

Designa vid 375 px först. Träffytor minst 44 px. Ingen horisontell body-scroll,
breda tabeller får egen `overflow-x-auto`. Sticky element respekterar
`env(safe-area-inset-bottom)`. `MobileBottomNav` visas inte på publika sidor.

## Ikoner

Sparkles-ikonen (lucide `Sparkle`/`Sparkles`) används aldrig. Lucide-ikoner i
gradientrutor ersätts av illustrationer från `src/components/illustrations/`.
Lucide får användas för rena UI-piktogram (pil, kryss, chevron) i 16 till 20 px.

## Illustrationer

Primitiver i `src/components/illustrations/primitives.tsx`.

- Konturer i `currentColor`. Fyllningar via `--illu-fill`, `--illu-accent`,
  `--illu-soft`, `--illu-muted` (definierade i `globals.css`).
- Linjetjocklek per viewBox: 24 → 1.5, 48 → 2, 96 → 3, 240 → 6.
- Hörnradie 8 procent av viewBox: 2 / 4 / 8 / 20.
- `stroke-linecap="round"`, `stroke-linejoin="round"`.
- Max en gradient per illustration, bara på accentelementet
  (`IlluAccentGradient`). Aldrig på kontur, aldrig som bakgrundscirkel.
- Unika id via `useIlluId()`, aldrig hårdkodade strängar.
- Aldrig `fill="white"` hårdkodat.
- `aria-hidden`, `focusable="false"`, inga animationer i SVG.
- Filer per yta: `PaywallIllustrations`, `PriserIllustrations`,
  `DashboardIllustrations`, `TestIllustrations`, `ClusterIcons`,
  `StartFlowIllustrations`, `CancelIllustrations`, `AuthIllustrations`,
  `SubscriptionIllustrations`.

Mail använder aldrig inline-SVG. Headern är PNG (`public/email/`).

## Copy

Svenska. Inga em-dash. Inga AI-klichéer. Aktiv form. Knappen säger exakt vad
som händer. Felmeddelanden säger vad som gick fel och hur man går vidare.
Gratisnivån beskrivs alltid som "ett brev om dagen".

## Betalväggar

En komponent: `src/components/paywall/PaywallCard.tsx` med varianter
`nedladdning`, `cv-export`, `cv-antal`, `kvot`, `analys`, `test-tak`,
`nedgraderad`. Copy i `paywall-copy.ts`. Värdet visas alltid före spärren:
brevet syns i sin helhet ovanför gaten, de tre synliga analysfynden står
ovanför kortet. Premium får `null`.

Produktvalet är `UpgradeSheet` (dagspass först i betalväggar, månad först på
prissidan). Produkterna definieras i `src/lib/plans/plans.ts`.

## Sidmall och delade komponenter

Alla dashboardsidor följer samma skelett (`docs/plan-inloggat-omdesign.md`,
avsnitt 3). Inga egna hjältar per sida, ingen gradienthero.

```
+--------------------------------------------------------------+
| SIDHUVUD   h1 + en rad + primär handling                     |
+--------------------------------------------------------------+
| STATUS     valfri, en rad, aldrig ett kort                   |
+--------------------------------------------------------------+
| INNEHÅLL   kort: bg-white rounded-xl border border-neutral-200|
+--------------------------------------------------------------+
```

Exakt ett `h1` per sida, alltid synligt. Exakt en fylld orange yta per skärm,
och det är den primära handlingen. Sidhuvudets underrad säger vad sidan gör,
inte vad den heter.

Komponenterna ligger i `src/components/shell/` och byggs aldrig om per sida:

| Komponent | Roll |
|---|---|
| `PageHeader` | Sidhuvud med titel, beskrivning och primär handling |
| `EmptyState` | Tomt tillstånd: illustration 96, rubrik, en mening, en knapp |
| `StatusRow` | Status som rad, toner `neutral`, `warm`, `positive` |
| `Sheet` | Bottenark på mobil, centrerad dialog på desktop |
| `ConfirmDialog` | Ersätter `window.confirm`, bygger på `Sheet` |
| `LoadingSkeleton` | Laddning i samma former som innehållet som kommer |

Ett skelett får aldrig ligga kvar: vid fel visas ett felmeddelande, vid noll
rader visas `EmptyState`.

## Illustrationsroller

| Storlek | Roll |
|---|---|
| 24 px | Inline i en rad |
| 48 px | Bredvid en rubrik i ett kort |
| 96 px | Tomt tillstånd (`EmptyStateIllustrations`) |
| 240 px | Hero, bara i dashboardens tillstånd A |

En illustration per vy, aldrig två. Illustrationen visar vad funktionen gör,
aldrig ett mönster eller en bakgrundscirkel.

## Z-index-skala

Inga andra värden används.

| Lager | z-index |
|---|---|
| Innehåll | 0 |
| Sticky element | 30 |
| Navigation | 40 |
| Sheet och bottenark | 50 |
| Modal och dialog | 60 |
| Toast | 70 |

## Textminimum

Minsta textstorlek är 12 px (`text-xs`). `text-[10px]` och `text-[11px]`
används inte. Etiketter i navigation är minst 12 px.

## Touch

Minsta träffyta är 44 px, och 48 px i navigation. Det gäller även
stängknappar, ikonknappar och filterpiller. En knapp på `py-2` blir cirka
34 px och är därmed för liten.

## Safe areas

Allt sticky respekterar `env(safe-area-inset-bottom)`. Bottennavets höjd är en
sanning, CSS-variabeln `--bottom-nav-h`, som alla sticky element och
`.dashboard-main-content` räknar mot. Hårdkodade offsets används inte.

Flerstegsflöden sätter `--bottom-nav-h: 0` medan flödet är öppet, och deras
fot använder `position: sticky` i en `100dvh`-kolumn, aldrig `position: fixed`,
eftersom iOS lägger tangentbordet över fixed-element. Använd `100dvh`, aldrig
`100vh`.
