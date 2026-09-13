# Överlämning: implementera Tråden (för utförande-agenter)

Skriven 2026-09-13 av art director-rollen. Den här specen ska kunna följas utan designomdöme. Om något inte täcks: välj det enklaste som uppfyller reglerna i avsnitt 3 och skriv upp det i rapporten.

Underlag (läs bara om du behöver mer än specen): `docs/design/koncept-2026-09-13.md`, `docs/design/rod-trad-preview.html` (referensmarkup, sju ramar), `docs/design/kritik-koncept-2026-09-13.md`. Allt som beskrivs här finns committat i `9dd90880` på branchen `design/rod-trad`.

## 1. Tokens: gammal klass, ny klass

Tokens ligger i `src/app/globals.css` (CSS-variabler) och `tailwind.config` (klassnamn). Använd alltid klassnamnen nedan, aldrig hex i komponenter.

| Gammalt mönster | Nytt | Kommentar |
|---|---|---|
| `bg-gray-50`, `bg-slate-50`, `bg-neutral-50`, `bg-stone-50` som sidbakgrund | inget, skalet ger `bg-mark` | Sidan sätter aldrig egen bakgrund |
| `bg-white` på kort och paneler | `bg-panel` | |
| `bg-gray-50`/`bg-gray-100` inuti en panel (fält, insunken yta) | `bg-insunken shadow-insunken` | Alltid inuti en panel, aldrig direkt på mark |
| `border-gray-100`, `border-gray-200`, `border-slate-200` | `border-kant` | |
| `border-gray-300` (starkare kant) | `border-kant-stark` | |
| `text-gray-900`, `text-slate-900`, `text-black` | `text-ink-1` | |
| `text-gray-700`, `text-gray-600` | `text-ink-2` | |
| `text-gray-500`, `text-gray-400` | `text-ink-3` | Minsta tillåtna kontrast på text |
| `text-orange-600`, `text-orange-700` | `text-accent-ink` | Orange text är alltid accent-ink, aldrig accent |
| `bg-orange-50`, `bg-orange-100`, `bg-amber-50` som yta bakom text | bort, `bg-panel` | Orange är aldrig en yta bakom text |
| `bg-orange-500/600` primärknapp | `bg-ink-1 text-white hover:bg-ink-hover` | Se knapp i avsnitt 2 |
| `border-orange-*`, `ring-orange-*` på valt kort | `ChoiceCard selected` | Val markeras med ink, aldrig orange |
| `bg-gradient-*`, `from-*`, `to-*`, `via-*` | bort | Inga gradienter i inloggat läge |
| `shadow-sm/md/lg/xl`, `drop-shadow-*` | bort, `border border-kant` | Djup via toner och kant, aldrig skugga. Undantag: `shadow-insunken` och `shadow-val` (tokens) |
| `rounded-2xl`, `rounded-3xl` | `rounded-xl` | Plattor och ikonrutor `rounded-lg`, chips `rounded-md` |
| `font-bold`, `font-extrabold`, `font-black` | `font-semibold` | Aldrig tyngre än 600 |
| `text-green-600` | `text-positiv` | |
| `text-red-600`, `bg-red-50` | `text-fel`, `bg-fel-mjuk border-fel-kant` | |
| `text-amber-600`, `text-yellow-600` | `text-varning` | |
| `text-3xl`/`text-4xl` för stora tal | `text-tal tabular-nums` | 40/40, vikt 500 |
| `text-2xl`/`text-3xl` sidrubrik | `text-h1` | 28/32, 600 |
| flödesfråga (rubrik i ett steg) | `text-fraga` | 22/28, 600 |
| kortrubrik | `text-kort` | 16/22, 600 |
| metadata, tidsstämplar | `text-meta text-ink-3` | 13/18 |
| steg-etikett ("STEG 4 AV 6", "NÄSTA HANDLING") | `text-steg uppercase text-ink-3` | 12, spärrad; accent-ink bara för "REKOMMENDERAS" |
| sektionsrubrik ("Pågår nu") | `text-sm font-medium text-ink-3` | Inte h2 i 18/600 |
| `framer-motion` import | bort | CSS-klasser i avsnitt 2 ersätter |
| `Sparkles` från lucide | bort, alltid | |
| `lucide-react` för navigationsmotiv och tonaliteter | `src/components/illustrations/Ikoner.tsx` | Lucide får finnas kvar för generiska handlingar (X, ChevronLeft, Check, Copy, Download) |

Ikoner: 24 px, `strokeWidth 1.75`, `text-ink-2` på sekundära rader. En ikon i platta per vy (MarginPlate). Aldrig ikon i egen rundad ruta utöver plattan.

## 2. Komponentkarta

Alla i `src/components/shell/` om inget annat sägs. Props är exakta.

**Sidhuvud** `PageHeader { title, description?, action?, children? }`. Sidans enda h1. Ingen egen rubrik i sidan under.

**Sektionsrubrik** ingen komponent:
```tsx
<div className="mb-2 flex items-center justify-between">
  <h2 className="text-sm font-medium text-ink-3">Pågår nu</h2>
  <Link className="text-sm text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1">Alla 11</Link>
</div>
```

**Panel** `<section className="rounded-xl border border-kant bg-panel p-4">`. Lista i panel: rader med `divide-y divide-kant`, varje rad `px-4 py-3`, titel `text-kort text-ink-1`, undertext `text-meta text-ink-3`.

**Statusrad** `StatusRow { children, tone: 'neutral'|'warm'|'positive', showDot?, action?, label? }`. Trial-rad: `tone="warm"`. Kvotrad: `tone="neutral"`. Max en `warm` per vy.

**Valkort** `ChoiceCard { selected, onSelect, title, description?, meta?, eyebrow?, leading?, variant: 'featured'|'plain' }`. Rekommenderat val: `variant="featured" eyebrow="Rekommenderas" leading={<MarginPlate><IlluPlattaSmartTon size={48}/></MarginPlate>}`. Övriga: `variant="plain" leading={<IkonProfessionell/>}`. Valt tillstånd ritas av komponenten (kant ink, fylld bock), skicka inga egna klasser för valt.

**Segment** (två till fyra lika alternativ, t.ex. språk) `Segment { value, onChange, options: [{value,label}], label }`.

**Formulärfält**
```tsx
<label className="block">
  <span className="mb-1 block text-sm font-medium text-ink-2">Telefon</span>
  <input className="h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1" />
  <span className="mt-1 block text-meta text-ink-3">Används bara när du väljer att bli kontaktad.</span>
</label>
```
Fel: byt `border-kant` mot `border-fel` och hjälptexten till `text-fel`. Sparat: hjälptexten `text-positiv` med texten "Sparat".

**Knappar**
- Primär: `inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white hover:bg-ink-hover disabled:opacity-40`. En per vy.
- Sekundär: `inline-flex h-11 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 hover:bg-insunken`.
- Text/länk: `text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1`.
- Destruktiv: som sekundär med `text-fel border-fel-kant`. Aldrig fylld röd.
- Touch: minst 44 px hög (h-11).

**Stort tal**
```tsx
<div><div className="text-tal tabular-nums text-ink-1">11</div><div className="text-meta text-ink-3">sökta</div></div>
```

**Marginalplatta** `MarginPlate { children }`, 56 px, `bg-accent-mjuk rounded-lg`, innehåll `IlluPlatta*` i 48 från `TradenScener.tsx`. En per vy, på det viktigaste kortet.

**Tomt tillstånd** `EmptyState { illustration: IlluTomMapp|IlluTomSokning|IlluArketLyfter, title, description?, action?, secondaryAction?, bare? }`. 96-scen i listor, `IlluArketLyfter` (240) bara på dashboard för ny användare.

**Laddning** `LoadingSkeleton { variant: 'row'|'card'|'list'|'text'|'statusRow'|'writing', count?, label?, meta? }`. Skelettet står stilla, bara linjen (`.loading-thread`) rör sig. Generering av brev/CV-analys: `variant="writing" label="Brevet skrivs" meta="Brukar ta 20 sekunder"`. Ingen spinner, ingen pulserande yta, ingen procenttext utöver `FlowProgress`.

**Framsteg i flöde** `FlowShell { title, step, totalSteps, onBack?, onExit?, primaryLabel, onPrimary, primaryDisabled?, primaryBlockedReason?, primaryBusy?, busyLabel?, footerSecondary?, banner?, children }`. Fortsätt-knappen ligger alltid i FlowShell-foten. Stegets innehåll börjar med `<p className="text-steg uppercase text-ink-3">Steg 4 av 6</p><h2 className="text-fraga text-ink-1">Hur ska brevet låta?</h2>`. Långa väntor: `FlowProgress { progress, estimatedTimeRemaining?, stages, onCancel? }`.

**Fel** `FlowError { message, title?, onRetry?, retryLabel?, secondaryAction? }`. Ingen rörelse, ingen röd yta bakom rubriken.

**Bekräftelse** `Confirmation { title, description?, action?, secondaryAction?, illustration?, children? }`. Titeln säger vad som skapades: "Ditt brev till Klarna är klart", inte "Klart!". Komponenten sköter animeringen (`.confirm-panel`, `.confirm-draw`, `.confirm-rise`). Lägg inte till egen.

**Betalvägg** `PaywallCard { variant, isPremium?, findingsTotal?, hiddenCount?, quota?, onCopy?, onDismiss?, onSecondary?, planOrder? }`. Aldrig en egen betalvägg i en sida. Kvotrad ovanför listor: `StatusRow tone="neutral" action={<Link>Se Premium</Link>}`.

**Ark och dialog** `Sheet { open, onClose, title?, description?, footer?, size?, bare? }`, `ConfirmDialog`. Inga egna modaler.

## 3. Mekaniska regler (grep)

Kör i repo-roten efter varje sida. Förväntat: inga träffar i dina filer.

```bash
grep -rnE "bg-orange-|bg-amber-|from-orange|to-orange|bg-gradient|shadow-(sm|md|lg|xl|2xl)|drop-shadow|rounded-(2xl|3xl)|font-(bold|extrabold|black)|framer-motion|Sparkles|text-orange-[0-9]|border-orange|ring-orange|bg-white\b|bg-gray-|text-gray-|border-gray-|text-slate|bg-slate|border-slate|animate-pulse|animate-spin|—" src/app/dashboard src/components/tests src/components/interests src/components/jobbcoachen src/components/kontakt --include=*.tsx
```

Undantag som får finnas: `bg-white` i brevmallars och CV-mallars förhandsvisning (dokumentet är papper), `animate-spin` inuti en knapp i busy-läge. Skriv upp varje undantag i rapporten.

Orange-räkning: räkna synliga orange element per skärm på 375 px (tråd, prick i StatusRow warm, accent-ink-text, platta räknas som ett). Max 3. Om fler: ta bort accent från det minst viktiga.

## 4. Checklista per sidtyp

Alla sidor: PageHeader som enda h1, ingen egen bakgrund, panel-hierarki, tokens enligt avsnitt 1, grep i avsnitt 3 rent, `npx tsc --noEmit` rent, primär handling inom viewport på 375x800 utan scroll, 44 px touch, text minst 12 px.

- **Dashboard** (`/dashboard`): tillstånd A (ny användare) = EmptyState bare med IlluArketLyfter, rubrik "Börja med ditt CV, <namn>", uppladdning som insunken streckad yta, sekundära länkar som textknappar. Tillstånd C = StatusRow warm (trial) överst, panel "Ditt jobbsök i <månad>" med fyra stora tal och primärknapp, "Nästa handling" som panel med MarginPlate (enda plattan), "Pågår nu" som lista, kvotrad, "Senaste aktivitet". LCP under 1,0 s.
- **Flödessteg** (skapa-brev, skapa-cv, analysera-cv, linkedin, tester): FlowShell, steg-etikett plus fråga, ChoiceCard/Segment/fält, Fortsätt i foten. Laddning `writing` eller FlowProgress. Fel via FlowError. Sista steg via Confirmation. LCP under 2,0 s.
- **Lista** (mina-brev, mina-cv, ansökningar): PageHeader med action, ev. StatusRow kvot, lista i panel, EmptyState vid tom. Kort utan skugga, `border-kant`. LCP under 1,5 s.
- **Hubb** (tester, verktyg): lista i panel med naken ikon 24 ink-2 per rad, en MarginPlate på den viktigaste raden. Resultat som stort tal. LCP under 1,5 s.
- **Profil/inställningar**: sektioner som en lista i en panel, fält enligt avsnitt 2, hjälptext under varje viktigt fält om var uppgiften används, integritetsblocket som panel med IkonSkold i ink-2. LCP under 1,0 s.
- **Resultat/poäng** (CV-analys, LinkedIn, tester): poängen som text-tal i panel, fynd som lista, betalvägg via PaywallCard, aldrig egen.
- **Betalvägg/prenumeration**: PaywallCard och prenumerationssidan med ink-knapp; orange bara i StatusRow warm för trial dag 5.

## 5. Aldrig ändra

Flödeslogik i hooks (`src/hooks/use-letters.ts`: isSubmitting, goToStep i useEffect, generation_in_progress), `src/lib/quota/**`, `src/lib/privacy/**` och all PII-maskning, edge-anrop, Supabase-frågor, testernas nivåer, frågebanker och rättning, `src/components/tests/shared/TestFlowShell.tsx` och `TestMeterRow.tsx` (klara), skalet i `src/components/dashboard/**` och `src/components/shell/**` (klara; behöver du en prop som saknas: skriv upp det i rapporten och lös det lokalt i sidan). Inga nya klientanrop, inga nya typsnitt, inga nya beroenden.

## 6. Rapportformat

Lista migrerade filer, undantag från grep med skäl, orange-räkning per skärm, saknade props i shell, tsc-status. Avsluta med "byggt och typkontrollerat, inte klicktestat".
