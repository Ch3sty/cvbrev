# Rummen, våg 1a: tokens, mörkt läge och designsystemet

Datum 2026-10-10. Branch `design/rummen-1a` från `design/rummen` (som är `main`
på `df2212b0`). Ingen push, ingen merge. Spec:
`docs/design/spec-rummen-2026-10-10.md`, avsnitt 3 och 6 (våg 1a).

**Status: byggt, typkontrollerat och klicktestat** i Chrome på Pixel 7 och
desktop 1280, ljust och mörkt läge, tre konton (gratis, Hela paketet via
`premium_grants`, mycket data) plus ett super_admin för adminen. Hård
omladdning per vy. 60 av 60 vyer utan anmärkning.

## Vad som ändrats

| Fil | Ändring |
|---|---|
| `src/app/globals.css` | Rummens tokens under `:root:has([data-rum])`, fem rum i ljust läge, mörkt läge i båda formerna (media och `data-theme`) med rummens mörka värden inuti båda, alias från Tråden, `.vagg`, `.knapp-primar`, `.kurva-yta`, `.skelett-vagg`, koppar-fokusring i inloggat, `[data-rum]`-övergången, rörelseklasserna, typklasserna. `--diagram-cv`/`--diagram-test` bytte värde. Borttaget: `.animate-shimmer`, `.card-hover-effect`, `.animate-pulse-pink`, `.animate-glow`, body-regeln med `--foreground-rgb`. |
| `tailwind.config.js` | `golv`, `papper`, `vagg`, `ljus`, `ton`, `rum`, `koppar`; `rounded-vagg`, `rounded-ark`; `shadow-lyft`; `text-tal-rad`, `text-tal-tre`, `text-kort-t`, `text-ey`, `text-ax`. Inget `darkMode`. |
| `src/app/layout.tsx` | Tema-skriptet i `<head>` (`localStorage.tema` till `data-theme`), `suppressHydrationWarning` på `<html>`. |
| `src/app/dashboard/layout.tsx` | `viewport.themeColor` indigo `#1B2246` / `#0E1120`. |
| `src/app/dashboard/DashboardShell.tsx` | `data-rum="jobb"` på yttersta diven (serverns HTML). |
| `src/components/illustrations/primitives.tsx` | Storlek 120 (stroke 3, radie 10). |
| `docs/designsystem.md` | v3 "Rummen", avsnitten enligt spec 6 (våg 1a), Tråden i avsnitt 12. |
| `scripts/kontrast-rummen.mjs` | Maskinell kontrastkontroll mot tabellen i designsystemet. |
| `scripts/grep-rummen.mjs` | Grep-listan ur spec 1.7. |
| `scripts/qa-rummen-1a.mjs` | Klicktestet i den här rapporten. |

### Tolkningar där specen lämnade en lucka

1. **Tokens gäller bara där det finns ett rum.** Spec 3.2 skriver blocket på
   `:root`, men beslut 1 och avsnitt 12 säger att publika sidor inte ingår.
   Publika sidor, kassan och adminen läser samma variabler (`--mark`,
   `--accent`, `--ink-1`), så ett globalt block hade gjort dem koppar och
   skog. Blocket står därför under `:root:has([data-rum])`. `:has` på roten
   gör att ark i portaler (`Sheet`, `UpgradeSheet`) också står i rummet.
2. **`data-rum="jobb"` redan i 1a.** Specen lägger `data-rum` i våg 1b, men
   tokens behöver en markör i 1a. Värdet är konstant `jobb` (övergångsregeln:
   beige blir skoggolv); `rumForPath` kommer i 1b.
3. **Body.** Spec 2.1 vill ha `bg-golv text-ink-1` på body. Body delas med
   publika sidor, så klasserna står kvar och `:root:has([data-rum]) body` ger
   golvet och ink-1 i inloggat.
4. **`text-h1` 34/36** gäller bara inne i ett rum. Artikelramen och adminen
   använder samma klass och har kvar 32/35.
5. **`--bottom-nav-h` står kvar på 56 px** tills dörrnavet (72 px) kommer i
   våg 1b. Med 72 nu hade innehållet och Kom igång-raden legat 16 px fel mot
   dagens nav.
6. **Alias på både rot och rum.** `var()` löses där egenskapen står. Ett alias
   bara på `<html>` hade gett fel rum i 1b.
7. **Övergången i mörkt läge.** Trådens bläckytor med vit text
   (`bg-ink-1 text-white`: InkPanel, primärknapparna, pakethuvudet i
   sidomenyn) blev ljusa med vit text när ink-1 vändes, och knappar som
   "Starta testet", "Visa" och "Ladda upp CV" försvann. Det vore en
   funktionsregression. I mörkt läge får de väggens färg (`--vagg`, hover
   `--vagg-2`), vilket är dit aliasen `ink-1-mjuk/-kant/-accent` redan pekar.
   Regeln är märkt för borttagning i våg 1b och 4. Felet hittades i en
   första efter-körning; skärmdumparna i `efter/` är tagna med regeln, till
   exempel `efter/mycket-desktop-morkt-cv.png` och
   `efter/mycket-pixel7-morkt-tester.png`.
8. **`@keyframes pulse` står kvar** fast `.animate-pulse-pink` togs bort: de
   har samma namn som Tailwinds `pulse` och skriver över den, så
   `animate-pulse` på publika sidor hade bytt utseende.

## Kontrast

`node scripts/kontrast-rummen.mjs`: **inga avvikelser.** 31 par i ljust och
30 i mörkt, fem rum, 240 textpar kontrollerade. Lägsta textpar:
koppar-text på koppar-djup (knappens mörka ände) 4,5:1. Mörkt läge är
identiskt i båda formerna. Tabellen i `docs/designsystem.md` avsnitt 2
stämmer med uträkningen.

Avvikelser mot spec 3.5 (alla fortfarande över kravet):

| Par | Spec | Räknat |
|---|---:|---:|
| vagg-ink på vagg (indigo) | 15,1 | 14,3 |
| vagg-mjuk på vagg-2 | 6,2 | 5,7 |
| koppar-ljus på vagg-2 | 6,7 | 6,6 |
| koppar-ljus på vagg (beslut 1) | 9,4 | 8,9 |
| koppar-text på koppar | 6,3 | 6,2 |
| koppar-ink mörkt på papper mörkt | 7,9 | 8,2 |
| ink-3 på golv indigo | 4,8 | 4,9 |
| ljus på vagg | 6,3 | 6,2 |

Adminens spårfärger mot panelen: petrol 7,3:1, indigo 8,4:1. ΔE76 petrol mot
indigo 52,6 (36,1 med deuteranopi).

## Prestanda

`npm run perf:inloggat` mot produktionsbygge (`NEXT_DIST_DIR=.next-r1`), Pixel
7, 3x CPU, LTE, median av tre. Hela tabellen: `perf-jamforelse.md`, rådata
`perf-fore.*` och `perf-efter.*`.

| | Före (main) | Efter (1a) |
|---|---|---|
| Inom budget | 34 av 39 | 34 av 39 |
| Över 20 procent | 0 | 1 (tester 1 912 ms, brus: 896 ms vid omkörning med fem körningar, `perf-efter-tester-omkorning.txt`) |
| CLS över 0 | tester prov 0,068, skapa-cv 0,011, jobbcoachen 0,008 | skapa-cv 0,011, jobbcoachen 0,008, linkedin-optimizer 0,292 |

Maskinen svängde under kvällen. Omkörningar med fem körningar efter
ändringen: dashboard 948 ms, mina-brev 980 ms. Samma routes på ett nytt bygge
av main direkt efteråt: dashboard 1 028 ms, tester 1 056 ms, prenumeration
1 424 ms. Ingen regression som går att skilja från bruset.

**linkedin-optimizer CLS 0,292 finns redan på main**: ett nytt bygge av main
gav 0,292 i två av tre mätomgångar. Skiftet kommer från CV-listan i steg 1
(`CvSelectorList`), som läser `useCVStore` på klienten och byter skelettet mot
listan efter första målningen. Det beror på timing, inte på tokens, och hör
till en egen rättelse (reservera höjden eller skicka CV-listan från servern).

## Klicktest

`node scripts/qa-rummen-1a.mjs --port 5231 --fas fore|efter`. Samma skript
före och efter. Kontroller per vy: header och nav i bild, h1 i bild, ingen
horisontell scroll, inga konsolfel, inga 4xx/5xx, headern kvar när body
rullas (emulerat adressfält). Resultat: `fore/resultat-fore.json`,
`efter/resultat-efter.json`.

- **Fem vyer × tre konton × två former × två lägen:** 60 av 60 utan anmärkning, före och efter.
- **Acceptans 2, mörkt läge** (Pixel 7, kontot med mycket data):
  - `data-theme="dark"` via `localStorage.tema`: `data-theme=dark`, `color-scheme: dark`, golv `#0B140E`, papper `#141E17` på dashboard, tester och profil.
  - Systemets mörka läge utan attribut: samma värden.
  - `data-theme="light"` under mörkt systemläge: golv `#E8EEE7`, papper `#FFFFFF`.
- **Acceptans 4, admin:** `--diagram-cv` `#1e5f5f`, `--diagram-test` `#3b4790` på Översikt, Intäkter och Tratt; direktetiketterna läsbara. Adminen står kvar i Tråden, även under mörkt systemläge.
- **Nätverksfel på POST** (profilens autospara, anropet avbrutet): fältet säger "Ändringen sparades inte. Försök igen.", aldrig "Sparat".
- **Konton:** skapade och raderade med id i samma körning, inga tidsfönster.

### Skärmdumpar

Mönster `<konto>-<form>-<läge>-<vy>.png` i `fore/` och `efter/`, där konto är
`gratis|hela|mycket`, form `pixel7|desktop`, läge `ljust|morkt`, vy
`dashboard|tester|cv|brev|profil`.

- Ljust före och efter: till exempel `fore/gratis-pixel7-ljust-dashboard.png` och `efter/gratis-pixel7-ljust-dashboard.png` (beige blev skoggolv, orange blev koppar, rubriken 34 px).
- Mörkt: `efter/mycket-pixel7-morkt-tester.png`, `efter/mycket-desktop-morkt-cv.png`, `efter/mycket-pixel7-morkt-brev.png`, `efter/mycket-pixel7-morkt-profil.png`.
- Acceptans 2: `efter/tema-attribut-morkt-*.png`, `efter/tema-system-morkt-*.png`, `efter/tema-attribut-ljust-under-morkt-system-*.png`.
- Admin: `admin/fore-admin-*.png` och `admin/efter-admin-*.png`.
- Nätverksfel: `efter/natfel-profil-autospara.png`.

## Övriga grindar

- `tsc --noEmit`: grönt.
- `vitest run`: 947 av 948. Det som faller är `src/lib/tests/__tests__/prov-rad.test.ts` (`hamtaEllerGorAnsprakProv`), som våg 1a inte rör (`src/lib` är oförändrat). Det faller likadant isolerat.
- `next build` med `NEXT_DIST_DIR=.next-r1`: grönt.
- Grep-listan (`grep-lista.txt`, `node scripts/grep-rummen.mjs`). Våg 1a tar inte bort något. Finns kvar, tas i våg 1b till 4: em-dash 45 i 17 filer, `bg-gradient` 136/40, `linear-gradient` 44/24, `animate-pulse` 17/11, `shadow-sm..xl` 144/64, `text-gray-` 561/70, `bg-white` 280/113, `rounded-3xl` 26/19, `font-bold..black` utan display 305/83, lucide i nav och skal 9 filer. `Sparkles` 1 är en kommentar i `Ikoner.tsx`. `dark:` 0.

## Känt i mörkt läge efter 1a

Hårdkodade `text-gray-*` och `bg-white` (grep-listan) blir fel i mörkt läge
på de sidor som har dem. De fem vyerna i testet klarar sig, men flöden och
äldre sidor är inte genomgångna. Primärknapparna står i väggens mörka grön
och syns sämre mot papperet än i ljust läge tills kopparknappen kommer i 1b.

## Frågor till art-director

1. **Ska 1a släppas till `main` ensam?** Mörkt läge slås på av systemets
   inställning. Med 1a ensam får alla med mörkt system ett mörkt inloggat där
   bara de omigrerade ytorna är genomgångna. Förslag: 1a mergas bara in i
   `design/rummen` och går till `main` tillsammans med 1b, eller så slås
   media-formen av tills dess och bara `data-theme="dark"` gäller.
2. **Fokusringen på golvet.** Koppar mot golv är 2,5 till 2,6:1 i ljust läge,
   under 3:1 för fokusindikatorer (WCAG 1.4.11). Mot papper 3,0:1. Mörkare
   ring på golvet, eller dubbel ring med en ljus kant?
3. **`--varning`.** Specens `#9A5B08` ger 4,49:1 mot varning-mjuk. Bygget
   använder `#985A08` (4,6:1, samma kulör). Godkänt, eller hellre ljusare
   varning-mjuk?
4. **Kontrasttalen i spec 3.5** avviker något från uträkningen (tabellen
   ovan). Ska specen rättas?
5. **Övergångsregeln för bläckytor i mörkt läge** (punkt 7 ovan): godkänd som
   tillfällig, eller hellre en annan yta?
6. **`themeColor` indigo** gäller nu hela inloggat medan vyerna står i skog
   och vit header tills 1b. Statusfältet ovanför den vita headern blir
   indigo i 1a.
7. **Branchnamnet:** uppdraget sa `design/rummen-1a`, spec 6 skriver
   `design/rummen-vag-1a`. Jag följde uppdraget.
