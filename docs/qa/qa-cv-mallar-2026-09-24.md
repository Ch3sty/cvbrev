# QA: riktiga mallar på /verktyg/cv-mallar och Kom igång-ringen, 2026-09-24

Produktionsbygge (`NEXT_DIST_DIR=.next-mallar`, `next start` på 8340 före och 8341 efter), riktig Chrome
via puppeteer-core, Pixel 7 (412 × 915, 2,625x, mobil-UA) och desktop (1440 × 900). Skärmdumpar i
`docs/qa/cv-mallar/`.

## 1. Mallsidan

### Hur renderingen görs

Streckskissen (fyra knappar och registrets SVG) är ersatt av exempel-CV:t (Erik Lindberg, samma
exempeldata som artiklarnas mallvisning och förhandsvisningen i /dashboard/cv-mallar) renderat av den
riktiga mallmotorn på servern: `/api/public/exempel/cv?mall=…&typsnitt=…`, samma rutt som
dashboardens förhandsvisning redan använder, CDN-cachad ett dygn. Dokumentet visas i en iframe med
A4-proportionen från början, så mallens typsnitt inte tar sidans rubrik och inget flyttar sig när det
kommer. Första vyn (Norrsken i Calibri) står i HTML och syns utan JavaScript.

Panelen: väljare för alla 41 mallar (gratis först, optgrupp "I CV-paketet"), pilar för föregående och
nästa, typsnittsväljaren med byggarens elva typsnitt (`FONTS`), etikett "Gratis" eller "Ingår i
CV-paketet, 79 kr i veckan" (`paketMedPris('cv_week')`), mallens beskrivning och knappen "Använd mallen
{namn}". Listorna skickas som props i sin minsta form från sidan.

Valet följer med: panelens knapp och heroknappen "Bygg ditt CV gratis" går till
`/cv-mallar/start?mall=…&typsnitt=…`, galleriets mallar till `/cv-mallar/start?mall=…`. Hela vägen till
byggaren fungerar nu också: `/dashboard/skapa-cv` läser `?mall=` (validerat mot registret) och
förväljer mallen i granskningen. Förut kom `?mall=` fram men ignorerades. Typsnittet stannar i
/cv-mallar/start, eftersom byggaren (skapa-cv) inte har något typsnittsval.

Följdrättelser: `MallMiniatyr` bruten ut i egen fil, så att galleriet inte drar in mallregistret via
`MallMiniatyrer.tsx`. /cv-mallar/start sa "Ingår i Premium", nu `paketNamn('cv_week')`. Registrets
beskrivningar med tankstreck visas med komma i panelen och galleriet; schemat läser registret orört.

### Klicktest

| Steg | Pixel 7 | Desktop | Skärmdump |
|---|---|---|---|
| Första vyn Norrsken, Calibri | OK | OK | `efter-01-*`, `efter-hero-*` |
| Aurora + Georgia, etikett "Ingår i CV-paketet, 79 kr i veckan" | OK | OK | `efter-02-*` |
| Atlas + Poppins, dokumentets font-family Poppins | OK | OK | `efter-03-*` |
| Nästa-pilen (Atlas till Galleri) | OK | OK | `efter-04-*` |
| Gratismall Sidopanel + Lato, etikett Gratis | OK | OK | `efter-05-*` |
| Heroknappen till `/cv-mallar/start?mall=sidebar-icons&typsnitt=lato`, Sidopanel förvald | OK | OK | `efter-06-*` |
| "Använd mallen Galleri" till start med Galleri förvald, "Ingår i CV-paketet" | OK | OK | `efter-07-*` |
| Galleriets länk till `/cv-mallar/start?mall=aurora` | OK | OK | |
| Registrering via Atlas: hero, start, `/register?cv_start=:atlas`, landar på `/dashboard/skapa-cv?mall=atlas`, granskningen har Atlas vald | | OK | `konto-01`, `konto-02` |

Fynd, inte rättat: Lato, Open Sans, Roboto och Poppins ritas med Arial som reserv i förhandsvisningen
(iframen laddar inga webbtypsnitt, samma i artiklarna och dashboarden). Bör jämföras med PDF:en innan
vi laddar typsnitten i förhandsvisningen. Byggarens mallkarusell säger fortfarande "Premium".

### Prestanda (samma metod som `scripts/perf-publikt.ts`, 5 körningar mobil, 3 desktop)

| | Före | Efter |
|---|---|---|
| LCP Pixel 7 (strypt) | 528 ms | 556 ms |
| LCP desktop | 128 ms | 132 ms |
| CLS | 0 | 0 |
| JS över nätet, mobil | 278 kB / 19 filer | 267 kB / 19 filer |
| Skript i HTML-svaret (gzip) | 207,6 kB / 12 | 196,0 kB / 12 |
| HTML | 186 kB rå, 28,7 kB gzip | 209 kB rå, 32,1 kB gzip |

Inom budget (1500 ms, CLS 0). Mallregistret finns inte längre i någon av sidans skriptfiler; mallmotorn
har aldrig följt med. HTML växer med listorna i RSC-datan.

### SEO-diff (`docs/qa/seo-diff/diff-cv-mallar.md`)

Fel 0. Title, description, canonical, h1, h2/h3 och alla tre JSON-LD-blocken oförändrade på
/verktyg/cv-mallar, /cv-mallar och /cv-mallar/start. Nytt: 42 interna länkar till
`/cv-mallar/start?mall=…` (noindex, canonical /cv-mallar). Inga länkar borta.

## 2. Kom igång-ringen

Ringen var 36 px med 13 px text, "11/12" låg utanför cirkeln. Nu 44 px med 11 px text, tabellsiffror.
Uppmätt i riktig Chrome på QA-kontot med Hela paketet (12 brickor), provade satta per id:

| Tal | Textbredd i 44 px ring | Pixel 7 (flytande raden) | Desktop (sidomenyn) |
|---|---|---|---|
| 0/12 | 25,5 px | OK | OK |
| 9/12 | 25,5 px | OK | OK |
| 11/12 | 32,6 px | OK | OK |
| 12/12 | 32,6 px (ritat i samma element) | raden dold, som avsett | raden dold, som avsett |

Kravet i mätningen: texten minst 4 px innanför ringens ytterkant på båda sidor. Skärmdumpar
`ring-00-*`, `ring-09-*`, `ring-11-*`, `ring-11-hel-*`, `ring-12-ritad-*`. Profilmenyn har ingen ring,
bara raden "Kom igång"; talet finns i sidomenyn på desktop och i den flytande raden på mobilen.

## 3. Verifiering

- `tsc --noEmit`: rent utanför `.next/dev/types`.
- `vitest run`: 73 filer, 881 tester gröna.
- Produktionsbygge: grönt tre gånger (före, efter, efter ringjusteringen).

## 4. Testdata och städning (produktion)

QA-kontot `qa-mallar-2026-09-24@jobbcoach.ai`, id `0c751ea6-7662-496e-ad28-6f188784d42c`, skapat via
registreringen. Profilen fick `subscription_tier` premium, `premium_scope` allt, `premium_until` +7 d och
`onboarding_steps` per körning (per id, Management API). Lösenordet sattes om per id för inloggning i
omkörningen. Räknat före och raderat per `user_id`:

| Tabell | Räknat | Raderat |
|---|---|---|
| user_activities | 139 | 139 |
| monthly_guest_allowances | 1 | 1 |
| email_confirmations | 1 | 1 |
| email_schedule | 2 | 2 |
| auth.users (id och e-post) | 1 | 1 |

Efteråt: 0 i auth.users, profiles och user_activities för id:t. Bekräftelsemejlet gick till QA-adressen.
Byggkatalogen `.next-mallar` och de tillfälliga QA-skripten raderade, `tsconfig.json` återställd.
