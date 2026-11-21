# Byggspec: Jobbsöket omgång 2, delarna utan skiss

2026-11-21. Skriven av UX (mobile-ux-designer) efter kodläsning på grenen `feat/jobbsoket-omgang2` (samma som main, `ac17d254`). Ingen kod är ändrad. Läsaren är en byggagent som inte har läst besluten.

Underlag: `docs/beslut-jobbsoket-2026-11-21.md` (beslut 9, 14, 21, 22 och raden "Byggs inte i dag, utan i Jobbsöket omgång 2"), `docs/qa/jobbsoket-slutkontroll-2026-11-21.md` ("Kvar efter pass 5") och `docs/bygg-noter-jobbsoket.md` (Motorn, Egna beslut 5, 6, 9, 10, 11 och Rättningar efter slutkontrollen).

## 0. Läs det här först

### 0.1 Varför omgången finns

Jobbsöket är byggt men oanvänt. Ett riktigt konto har loggat en sökt tjänst någonsin, av 109 nya konton på 28 dagar. Omgång 2 bygger vägar in och rättar intervjulägena. Den bygger inga nya funktioner.

Stoppregeln: har färre än 5 konton en första rad den 19 december byggs inget mer i Jobbsöket utöver rättningar. Målet är 10. Varje ny väg in ska därför gå att följa i mätningen (avsnitt 6).

### 0.2 Det som inte får röras

- Inget i `src/app/(public)/**`, `src/components/publikt/**` eller `content/**`.
- Inga priser, ingen kampanjlogik, inga texter om samtycke, datalagring eller villkor.
- Inga migreringar i del 1 till 5 och i 9 A. Ingen ny tabell, kolumn, funktion eller ändring av `dashboard_summering()`. Enda undantaget är 9 B, som har en egen migrering (9.11) och pushas först när ägaren har sagt ja och den är körd.
- Premiumlistan i Kom igång (`KOM_IGANG_LISTA.cv`, `.tester`, `.allt`) och Kom igång-mejlen rörs inte. Enda undantaget är ett fall utan text i mejlfilen, se 1.6.
- Aldrig rött i Jobbsöket. Aldrig Sparkles-ikonen. Lön och testpoäng skrivs aldrig ut. Inga talstreck i någon text.
- Lägg inte till nya PostHog-händelser. En ny egenskap på en befintlig händelse är tillåten där specen säger det. Enda nya händelsen i omgången är `tjanstfraga_val` (9.7).

### 0.3 Delarna och vem som bygger vad

| Del | Innehåll | Byggare |
|---|---|---|
| 1 | Brickan "Logga en tjänst du har sökt" i Kom igång, gratislistorna | A |
| 2 | Intervjulägena: motor, server, utkast, notis, veckobrev | B |
| 2 | Intervjulägena: vyerna | C |
| 3 | Knapparna i annonsens fot på telefon | A |
| 4 | Hubben i Inför intervjun efter högsta betyg | A |
| 5 | Raden i CV-rummet efter nedladdning | ingen, specas bara |
| 9 A | "När är intervjun?" i hubben Inför intervjun (ändring A, utan migrering) | D |
| 9 B | Kortet "Vilken tjänst gäller provet?" på testernas Hem och händelsen kallad till test (ändring A, med migrering) | D |

Tre byggare kan arbeta samtidigt. Ingen fil ägs av två. Byggare D börjar när B och C är klara och får då röra deras och A:s filer. Vilka står i 9.20.

**Byggare A äger:**
`src/lib/onboarding/komigang.ts`, `src/lib/onboarding/komigang-server.ts`, `src/lib/onboarding/__tests__/komigang.test.ts`, `src/components/registrering/__tests__/villkor.test.tsx`, `src/components/dashboard/KomIgangArk.tsx`, `src/components/illustrations/OnboardingScener.tsx`, `src/lib/dashboard/getSummary.ts`, `src/lib/applications/skapa.ts`, `src/app/api/jobbsok/ska-sokas/route.ts`, `src/app/api/applications/backfill/route.ts`, `src/lib/email/lifecycle/templates/komigang.ts` (ett fall, se 1.6), `src/components/jobb3/sokta/SoktaVy.tsx`, `src/components/jobb3/jobb/AnnonsVy.tsx`, `src/components/jobb3/jobb/MatchadeJobb.tsx`, `src/components/jobb3/jobb/__tests__/*`, `src/components/jobb3/kit/JobbVagg.tsx`, `src/components/jobb3/kit/delar.tsx`, `src/components/jobb3/kit/index.ts`, `src/app/jobb3.css`, `src/app/jobb3-kit/page.tsx`, `src/components/jobb3/intervju/IntervjuHubb.tsx`, `src/components/jobb3/intervju/text.ts`, `src/lib/intervju/nasta.ts`, `src/lib/intervju/__tests__/nasta.test.ts`, `src/app/dashboard/intervju/infor-intervjun-copy.ts`, `src/app/dashboard/intervju/__tests__/infor-intervjun-copy.test.ts`.

**Byggare B äger:**
`src/lib/jobbsok/typer.ts`, `lage.ts`, `utkastTyp.ts` (ny), `index.ts`, `uppfoljning.ts`, `uppfoljningServer.ts`, `attGora.ts`, `lista.ts`, `intervju.ts`, `bana.ts`, `tystnad.ts`, `server.ts`, `src/lib/jobbsok/__tests__/*`, `src/lib/openai/uppfoljningsmejl.ts`, `src/app/api/jobbsok/uppfoljning/[id]/route.ts`, `src/app/api/jobbsok/uppfoljning/[id]/skickad/route.ts`, `src/lib/analytics/events.ts`, `src/lib/notifications/followUp.ts`, `src/lib/notifications/__tests__/followUp.test.ts`, `src/lib/email/lifecycle/templates/weekly-digest.ts`, `src/lib/email/lifecycle/__tests__/weekly-digest.test.ts`.

**Byggare C äger:**
`src/components/jobb3/sokta/TjanstVy.tsx`, `Uppfoljning.tsx`, `Lista.tsx`, `src/components/jobb3/oversikt/oversikt.ts`, `src/components/jobb3/oversikt/__tests__/oversikt.test.ts`, `src/components/paywall/paywall-copy.ts`, `src/components/paywall/__tests__/paywall-copy.render.test.tsx`.

**Filer som två delar behöver:**
- `src/components/jobb3/intervju/IntervjuHubb.tsx` ägs av A (del 4). Del 2 behöver en enda ändring där: knappens text "Sätt tid" blir "Sätt tiden" i `intervjuKnapp`. A gör den.
- `src/app/jobb3-kit/page.tsx` (visningssidan) ägs av A. C lägger inget där.
- `src/lib/jobbsok/adress.ts` ändras av ingen. `soktaHref` har redan fältet `fran`.
- C bygger mot B:s kontrakt i 2.2. B gör kontraktet först (typerna och de rena funktionerna i 2.2, med tester), säger till, och går sedan vidare till servern. C läser vyerna och förbereder under tiden och typkontrollerar när kontraktet finns.

### 0.4 Arbetssätt och test

- Arbetskopian är `C:\Users\chris\cvbrev-jobbsok2`, grenen `feat/jobbsoket-omgang2`. Ingen push utan samordnaren.
- Under arbetet körs bara `npx tsc --noEmit` och de vitest-filer delen rör. Bygge, hela testsviten, klicktest i riktig webbläsare (1440 px och Pixel 7, 412 x 915) och prestandamätningen körs en gång, på allt, före push. Det gör samordnaren, inte byggarna.
- En agent åt gången mot produktionsdatabasen. Testrader skapas på QA-kontona och antecknas med id. Radera bara egna rader per id, räkna före radering.
- Varje byggare skriver ett avsnitt i `docs/bygg-noter-jobbsoket-omgang2.md` (ny fil): vad som byggdes, egna beslut, vad som inte är prövat.
- Ändring A (frågan "Vilken tjänst gäller provet?" i testerna och "När är intervjun?") står i avsnitt 9, skrivet den 22 november efter skissen `docs/design/skiss-jobbsoket-testvag-2026-11-21.html` och granskningen av den. Båda vägarna skapar raden genom `skapaSoktTjanst`, så kvitteringen i del 1 och mätningen i avsnitt 6 gäller också dem.

---

## 1. Brickan i Kom igång (beslut 21)

### 1.1 Vad som byggs

En ny bricka, "Logga en tjänst du har sökt", i alla sex gratislistor. Den kvitteras på servern när en rad skapas i `job_applications` eller `job_saved_ads`. Trycket öppnar arket för att logga en sökt tjänst. Arket har redan växeln "Jag har sökt" och "Jag ska söka", så den som inte har sökt något än kan spara en annons och få brickan kvitterad den vägen.

Betalandes listor och Kom igång-mejlen rörs inte: brickan läggs bara i `KOM_IGANG_LISTA.gratis` och i de fem listorna i `KOM_IGANG_LISTA_GRATIS`. Mejlet till betalande om brickan kräver ägarens ja och byggs inte.

### 1.2 Nyckeln

`sokt_tjanst`. Läggs till i typen `BrickaKey` i `src/lib/onboarding/komigang.ts`. Nyckeln sparas i `profiles.onboarding_steps` av den befintliga funktionen `komigang_markera` (den tar vilken nyckel som helst, ingen migrering).

### 1.3 Plats i varje gratislista

`KOM_IGANG_LISTA.gratis` (konton utan val i registreringen, 93 av de 109 nya):

```ts
gratis: ['profil', 'sokt_tjanst', 'cv_upp', 'analys_gratis', 'mall', 'matris_grund'],
```

Direkt efter profilen. Skäl: raden visar bara nästa steg, loggningen kräver ingen fil och tar en minut på telefon, och Översikt säger redan "Börja med ditt CV" i väggen. Raden får peka på den andra vägen in.

`KOM_IGANG_LISTA_GRATIS` (konton med val):

```ts
tester:   ['matris_grund', 'personlighet', 'intervjuprov', 'sokt_tjanst', 'analys_gratis', 'brev', 'jobbmatchning'],
intervju: ['intervjuprov', 'personlighet', 'matris_grund', 'sokt_tjanst', 'analys_gratis', 'brev', 'jobbmatchning'],
cv:       ['analys_gratis', 'mall', 'brev', 'sokt_tjanst', 'jobbmatchning', 'matris_grund', 'intervjuprov'],
brev:     ['brev', 'analys_gratis', 'mall', 'sokt_tjanst', 'jobbmatchning', 'matris_grund', 'intervjuprov'],
jobb:     ['jobbmatchning', 'sokt_tjanst', 'analys_gratis', 'brev', 'mall', 'matris_grund', 'intervjuprov'],
```

Regeln: brickan står först i gruppen "Gratis i de andra delarna", alltså på plats fyra, direkt efter det hon valde. För valet jobb står den i "Det du valde", direkt efter jobbmatchningen. Varje lista får sju brickor.

`OMRADE_FOR_BRICKA` får `sokt_tjanst: 'jobb'`. Arket grupperar efter område, så placeringen i arket följer av det.

Antalet sex står i dag i testet `villkor.test.tsx` ("varje lista har sex brickor"), inte i koden. Det rättas till sju (1.10).

### 1.4 Texterna

Nytt fall i `brickaText` (samma fil):

| Fält | Text |
|---|---|
| `titel` | Logga en tjänst du har sökt |
| `text` | Företag, tjänst och datum. En minut. |
| `klarText` | Finns under Sökta tjänster |
| `kort` | logga en sökt tjänst |
| `knapp` | Logga tjänsten |
| `href` | `soktaHref({ logga: 'sokt', fran: 'komigang' })`, alltså `/dashboard/sokta-tjanster?logga=1&fran=komigang` |

`soktaHref` importeras från `@/lib/jobbsok/adress` (ren och klientsäker).

Ny rad i `GRATIS_TEXT` (listorna per val, där arket redan säger "Allt här ingår gratis."):

```ts
sokt_tjanst: { titel: 'Logga en tjänst du har sökt', text: 'Vi säger till när det är dags att följa upp' },
```

Det ger de här raderna utan mer kod:
- Raden för ett konto utan val, när profilen är ifylld: "1 av 6 provade. Nästa: logga en sökt tjänst."
- Raden för ett konto med val: "0 av 7 provade, allt ingår gratis".
- Skärmläsaren på brickan: "Logga en tjänst du har sökt, Företag, tjänst och datum. En minut., inte provad än".

### 1.5 Ikonen

`BRICKA_IKON` i `src/components/dashboard/KomIgangArk.tsx` kräver en ikon per nyckel. Ny ikon `IlluBrickaSokt` i `src/components/illustrations/OnboardingScener.tsx`, bland brickikonerna (240 x 200, samma streck som grannarna): en lista med tre rader där den översta är avbockad.

```tsx
/** Lista med tre rader, den översta avbockad. */
export function IlluBrickaSokt({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="36" y="26" width="168" height="148" rx="14" fill={ILLU.fill} />
        <path d="M96 66h84M96 102h84M96 138h52" />
        <circle cx="68" cy="102" r="10" />
        <circle cx="68" cy="138" r="10" />
      </g>
      <g stroke={ILLU.accent} strokeWidth={6}>
        <path d="M58 66l8 8 14-16" />
      </g>
    </Scen>
  )
}
```

`BRICKA_IKON.sokt_tjanst = IlluBrickaSokt`.

### 1.6 Kvitteringen

**Härledning ur tabellerna** (`src/lib/onboarding/komigang-server.ts`):
- `ProvadeUnderlag` får två valfria fält: `applicationCount?: number` och `savedAdCount?: number`.
- `harledProvade`: `if ((u.applicationCount ?? 0) > 0 || (u.savedAdCount ?? 0) > 0) provade.add('sokt_tjanst')`. Lägg nyckeln i listan `KEYS`.
- `hamtaProvadeUnderlag` ändras inte. Den används bara av mejlen till betalande, och deras listor saknar brickan. Inga nya frågor i mejlkörningen.

**Summeringen** (`src/lib/dashboard/getSummary.ts`): anropet till `harledProvade` får `applicationCount: apps.length`. Raderna i `job_applications` läses redan, så ingen ny fråga och ingen ändring av `dashboard_summering()`.

**Kvitteringen när raden skapas** (`markeraBricka(userId, 'sokt_tjanst')`, som redan mäter `onboarding_step_completed` första gången):
- `src/lib/applications/skapa.ts`, `skapaSoktTjanst`: `void markeraBricka(userId, 'sokt_tjanst')` efter en lyckad insert (inte i grenen `alreadyExists`). Täcker `POST /api/applications` (arket i `LoggaArk.tsx`, Matchade jobb, och brevet i `src/components/brev3/arbete/BrevetVy.tsx`) och `POST /api/jobbsok/ska-sokas/[id]/sokt`.
- `src/app/api/jobbsok/ska-sokas/route.ts`, POST: `await markeraBricka(s.user.id, 'sokt_tjanst')` efter en lyckad insert, och även i de två grenarna som svarar `alreadyExists`. Här är det `await`, eftersom den sparade nyckeln är enda källan för en sparad annons (summeringen räknar inte `job_saved_ads`). `markeraBricka` kastar aldrig.
- `src/app/api/applications/backfill/route.ts`, POST: `void markeraBricka(user.id, 'sokt_tjanst')` när `createdCount > 0`.

**Kom igång-mejlets fil** (`src/lib/email/lifecycle/templates/komigang.ts`): `brickmejl` har en `switch` över alla `BrickaKey`, så typkontrollen kräver ett fall. Lägg till exakt det här och inget annat i filen:

```ts
case 'sokt_tjanst':
  // Brickan finns bara i gratislistorna (Jobbsöket omgång 2). Mejlet går bara
  // till betalande, vars listor saknar den. Texten skrivs först när ägaren har
  // godkänt ett mejl om brickan.
  throw new Error('[komigang] sokt_tjanst har inget mejl');
```

Fallet nås aldrig: `scheduleKomIgangMejl` skickar alltid scope `cv`, `tester` eller `allt`, och `shouldSend` kräver ett betalande konto. Skulle det ändå nås fångar `runner.ts` felet per rad och inget mejl går ut. Ett vitest-fall låser att betalandes listor saknar brickan (1.9).

**Raden och arket uppdateras direkt.** Summeringen ligger i klientens `DashboardDataContext` och läses inte om av `router.refresh()`. Anropa `refresh()` från `useDashboardData()`:
- i `src/components/jobb3/sokta/SoktaVy.tsx`, funktionen `loggad`, efter `router.refresh()`,
- i `src/components/jobb3/jobb/MatchadeJobb.tsx`, efter ett lyckat svar i `handleSpara` och i `handleMarkApplied`.

### 1.7 Konton som redan har rader

- Ett konto med minst en rad i `job_applications` får brickan avbockad direkt, härledd ur summeringen. Inget skrivs. Första gången kontot loggar en tjänst till skrivs nyckeln och `onboarding_step_completed` mäts.
- Ett konto som bara har rader under Ska sökas från före bygget får brickan avbockad nästa gång det sparar en annons (också en redan sparad) eller loggar en tjänst. Den 21 november fanns inga sådana riktiga konton. Ingen efterhandskörning mot databasen. Att räkna `job_saved_ads` i summeringen kräver en ändring av `dashboard_summering()`, alltså en migrering, och görs inte.

### 1.8 Publika ytor

Bygget ändrar inga publika ytor, och inget behöver undvikas aktivt:
- Hjälpredan på `/priser` läser sin egen lista, `GUIDE.listor.allt` i `src/components/pricing/paket-copy.ts` (Premium, elva steg). Den importerar inte `komigang.ts`.
- Registreringens förslag (`src/app/dashboard/valkommen/ForslagSteg.tsx`) läser `STEG3` i `src/components/registrering/registrering-copy.ts`. Det importerar inte heller listorna.
- Ingen fil under `src/app/(public)` eller `src/components/publikt` importerar `@/lib/onboarding/komigang`.

Rör alltså inte `paket-copy.ts` eller `registrering-copy.ts`. Att de publika listorna ska nämna Sökta tjänster hör till den publika omgången (kartläggningens 2.2, 2.14, 2.8 och 2.16).

Inloggat syns listan på tre ställen: raden i sidomenyn på dator, den flytande raden på telefon (bara på `/dashboard`) och arket. Adminens tratt (`src/app/admin/tratt/berakning.ts`) läser bara betalandes listor och påverkas inte.

### 1.9 Klart när

- Ett nytt gratiskonto utan val och med ifylld profil ser raden "1 av 6 provade. Nästa: logga en sökt tjänst." på `/dashboard` i 412 px, och "Kom igång, 1 av 6 provade" längst ned i sidomenyn i 1440 px.
- Arket visar brickan på plats två för konto utan val, och först under "Gratis i de andra delarna" för konto med valet tester. Brickan är minst 64 px hög, hela raden går att trycka på, titel och underrad klipps inte i 360 px.
- Trycket öppnar `/dashboard/sokta-tjanster?logga=1&fran=komigang` med arket öppet på "Jag har sökt".
- Efter sparad tjänst är brickan avbockad med "Finns under Sökta tjänster" utan omladdning, i båda bredderna. Samma efter "Jag ska söka".
- Ett Premiumkonto ser samma lista som förut (12 brickor).
- `npx tsc --noEmit` går igenom.

### 1.10 Vitest

I `src/lib/onboarding/__tests__/komigang.test.ts`:
- antalen: CV 8, Test 9, Allt 12, gratis 6 (rätta det befintliga fallet).
- `KOM_IGANG_LISTA.gratis[1]` är `sokt_tjanst`.
- ingen av `KOM_IGANG_LISTA.cv`, `.tester`, `.allt` innehåller `sokt_tjanst`.
- `brickaText('sokt_tjanst', null)` ger titeln, texten, `kort` och adressen `/dashboard/sokta-tjanster?logga=1&fran=komigang`.
- `harledProvade({ ...TOMT, applicationCount: 1 })` och `({ ...TOMT, savedAdCount: 1 })` innehåller `sokt_tjanst`, `harledProvade(TOMT)` gör det inte, och `({ ...TOMT, sparade: ['sokt_tjanst'] })` gör det.
- `komIgangRadText(komIgangLage(null, ['profil']))` är "1 av 6 provade. Nästa: logga en sökt tjänst."

I `src/components/registrering/__tests__/villkor.test.tsx` (befintliga fall rättas):
- listorna per val enligt 1.3, sju brickor var, inga dubbletter, aldrig `cv_upp` eller `profil`.
- `listaFor(null, null)` enligt 1.3.
- titlarna för valet tester: Nivåkollen, Personlighetstestet, Intervjuprovet, Logga en tjänst du har sökt, Analysera ditt CV, Skriv ett personligt brev, Se tre matchade jobb. Raden: "0 av 7 provade, allt ingår gratis".
- `utanforIntent('sokt_tjanst', 'tester')` är sant, `utanforIntent('sokt_tjanst', 'jobb')` är falskt.

---

## 2. Intervjulägena (beslut 9 och 14)

### 2.1 Besluten

I dag gäller en spärr: en tjänst i intervjusteget blir aldrig tyst (`kanBliTyst` i `src/lib/jobbsok/lage.ts`). Omgång 2 ersätter spärren med riktiga lägen.

1. **Genomförd intervju, väntar besked.** Påminnelse efter sju dagar utan besked, räknat från intervjudagen eller från den senaste uppföljningen. Egna texter och ett eget utkast som tackar för intervjun och frågar om besked.
2. **Genomfört provjobb.** Samma läge och samma sju dagar som genomförd intervju, med egna ord ("provjobbet" i stället för "intervjun"). Skäl: efter båda ligger bollen hos arbetsgivaren och kandidatens enda drag är detsamma, tacka och fråga om besked. Ett eget läge skulle dubbla varje gren i vyerna för en status nästan ingen har.
3. **Kallelse utan tid.** Aldrig ett uppföljningsmejl, aldrig "tyst", aldrig under Följ upp. Handlingen är "Sätt tiden". Läget tas upp i Att göra nu två dagar efter kallelsens datum. Skäl: en dag är för tidigt när arbetsgivaren ska återkomma med tid, och en vecka är för sent, då har intervjun ofta redan varit. Texten säger därför också vad man gör om intervjun redan har varit.
4. **Utkastets sort.** Det finns tre sorters uppföljningsmejl: efter ansökan, efter intervju, efter provjobb. Tjänstens läge avgör vilken sort som gäller. Ett oskickat utkast av fel sort visas aldrig (2.4).
5. **Gratis och Premium.** Spärren är som i dag: det första utkastet per konto är gratis. Ett intervjuutkast räknas som kontots gratisutkast. Ett gratiskonto får alltså ett utkast totalt, oavsett sort. Har kontot använt sitt utkast på en ansökan möter det betalväggen när det vill fråga om besked efter intervjun. "Jag har redan skickat det" står kvar bredvid väggen.
6. **Notisen och veckobrevet.** Läget genomförd intervju eller provjobb kommer med, med egna meningar. Kallelse utan tid kommer inte med i något av dem: vi vet inte om intervjun redan har varit, och ingen text ska gå ut av sig själv om det läget. Texterna är beslutade av saas-lead och UX tillsammans den 22 november och går med i pushen (2.7).
7. **Inga migreringar.** Fältet "Sa de när du får besked?" väntar. Sju dagar är därför fast. Utkastets sort går inte att lagra utan en ny kolumn: sorten läses ur ämnesraden, som alltid är mallens (2.2). En kolumn `kind` på `job_application_followups` föreslås till nästa migrering.

### 2.2 Kontraktet (byggare B gör det först, byggare C bygger mot det)

**`src/lib/jobbsok/typer.ts`**

```ts
/** Vilken sorts uppföljningsmejl som passar tjänsten just nu. */
export type UppfoljningsTyp = 'ansokan' | 'intervju' | 'provjobb'

/** Dagar utan besked efter en genomförd intervju eller ett provjobb innan vi påminner. */
export const INTERVJU_BESKED_DAGAR = 7
/** Dagar efter kallelsens datum innan "Sätt tiden" tas upp i Att göra nu. */
export const KALLELSE_UTAN_TID_DAGAR = 2
```

`IntervjuInfo` får ett fält:

```ts
/** Dagen kallelsen kom: occurred_at på senaste "Kallad till intervju". */
kalladDag: Dag | null
```

`TjanstLage` får två fält, och tre befintliga får ny innebörd:

```ts
/** Sorten uppföljning som passar nu. Null: kallad (med eller utan tid, eller tiden passerad), erbjudande, avslutad. */
foljUppTyp: UppfoljningsTyp | null
/** Gränsen i dagar för tystnad: 12 för 'ansokan', 7 för 'intervju' och 'provjobb'. 12 när foljUppTyp är null. */
tystGrans: number
/** Tyst: foljUppTyp finns och dagarTyst >= tystGrans. */
tyst: boolean
/** Senaste aktivitet plus tystGrans. */
tystSedan: Dag
/** Har tjänsten ett oskickat utkast av rätt sort (utkastGaller)? */
harUtkast: boolean
```

`AttGoraTyp` får `'satt_intervjutid'`.

**`src/lib/jobbsok/utkastTyp.ts`** (ny, ren, exporteras från `index.ts`)

```ts
import type { Uppfoljning, UppfoljningsTyp } from './typer'

/** Ämnesradens början per sort och språk. Ämnesraden skrivs alltid av servern (mallAmne). */
export const AMNE_START = {
  intervju: { sv: 'Tack för intervjun', en: 'Thank you for the interview' },
  provjobb: { sv: 'Tack för provjobbet', en: 'Thank you for the trial day' },
} as const

/** Utkastets sort, läst ur ämnesraden. Allt som inte börjar som ett intervju- eller provjobbsmejl är 'ansokan'. */
export function utkastTyp(subject: string | null | undefined): UppfoljningsTyp

/** Gäller utkastet för tjänstens läge? Oskickat, har text, och sorten är tjänstens foljUppTyp. */
export function utkastGaller(u: Pick<Uppfoljning, 'subject' | 'body' | 'sent_at'> | null | undefined, typ: UppfoljningsTyp | null): boolean
```

**`src/lib/jobbsok/lage.ts`**

```ts
/** Sorten uppföljning för en status. */
export function foljUppTyp(status: ApplicationEventType | null, intervju: IntervjuInfo | null): UppfoljningsTyp | null
//  avslag, tackat nej, erbjudande, tackat ja             -> null
//  kallad, genomförd intervju, genomfört provjobb:
//     intervju?.lage === 'vantar_besked'                  -> 'provjobb' om status är trial_work_completed, annars 'intervju'
//     annars (bokad, utan_tid, hur_gick)                  -> null
//  allt annat (ingen status, sökt, inget svar)            -> 'ansokan'

export function tystGransFor(typ: UppfoljningsTyp | null): number      // 'ansokan' och null 12, övriga INTERVJU_BESKED_DAGAR
export function kanBliTyst(status, intervju): boolean                   // står kvar: foljUppTyp(status, intervju) !== null
export function nastaPaminnelse(skickad: Dag, typ: UppfoljningsTyp | null = 'ansokan'): Dag   // skickad + tystGransFor(typ)
/** Ska "Sätt tiden" tas upp? Läget utan_tid och kalladDag + KALLELSE_UTAN_TID_DAGAR <= idag. */
export function skaSattaTiden(i: IntervjuInfo | null, idag: Dag): boolean
```

`intervjuInfo` sätter `kalladDag: kallelse?.occurred_at ?? null` i alla lägen. `tjanstLage` räknar `foljUppTyp`, `tystGrans`, `tyst`, `tystSedan` och `harUtkast` enligt ovan. Kommentaren om spärren över `kanBliTyst` skrivs om: spärren är ersatt av lägena.

`brickTon` ändras inte: en tjänst i intervjusteget har tonen `intervju` också när den är tyst.

**`src/lib/jobbsok/intervju.ts`**

```ts
/** Raden för en tyst tjänst efter intervju eller provjobb: "Intervjun var den 20 november. Fråga när du kan vänta besked." */
export function beskedText(t: TjanstLage): string
```

`intervjuText` får två ändringar och är i övrigt orörd. Den beror inte på `tyst`, så Inför intervjun (som läser utan uppföljningar) säger aldrig fel:
- `utan_tid` när `skaSattaTiden(i, idag)`: "Kallad till intervju den 12 november. Sätt tiden, så påminner vi före intervjun." Annars som i dag: "Kallad till intervju. Sätt tiden när du vet den."
- `vantar_besked` när statusen är genomfört provjobb: "Provjobb genomfört 20 november. Väntar på besked." (utan dag: "Provjobb genomfört. Väntar på besked."). Genomförd intervju som i dag.

**`src/lib/jobbsok/lista.ts`**

```ts
/** Underraden i gruppen Följ upp, efter vilka sorter som står där. */
export function foljUppText(rader: readonly TjanstLage[]): string
```

**`src/lib/jobbsok/tystnad.ts`**: `Tystnad` får `typ: UppfoljningsTyp | null` (tjänstens `foljUppTyp`) och `momentDag: Dag | null` (`lage.intervju?.dag ?? null`).

**`src/lib/jobbsok/server.ts`**: `UppfoljningLage` får `typ: UppfoljningsTyp | null` och `grans: number`. `utkast` är bara ett utkast som gäller (`utkastGaller`), annars null.

**`src/lib/jobbsok/uppfoljning.ts`**: `UppfoljningUnderlag` får `typ: UppfoljningsTyp` och `momentDag: Dag | null`. `uppfoljningSparr` får `typ?: UppfoljningsTyp` (förval `'ansokan'`) och läser `subject` på kontots utkast (2.5).

### 2.3 Texterna i rummet

I tabellerna: `M` är "Intervjun" eller "Provjobbet", `m` är "intervjun" eller "provjobbet", `D` är `langDag(t.intervju.dag)` ("20 november"), `N` är `t.dagarTyst`, `K` är `langDag(i.kalladDag)`. Saknas dagen (ska inte kunna hända för en genomförd intervju) används `t.senasteAktivitet`. Texterna för en obesvarad ansökan (`foljUppTyp === 'ansokan'`) ändras inte.

#### Läge 1: genomförd intervju eller provjobb, inget besked på sju dagar

Gäller när `t.tyst` och `t.foljUppTyp` är `'intervju'` eller `'provjobb'`. `N` är alltid minst 7, så bara plural behövs.

**Att göra nu** (`attGoraKandidater` i `src/lib/jobbsok/attGora.ts`, typen är fortfarande `folj_upp`, nyckeln `folj_upp:<id>:<tystSedan>`, ikonen `kuvert`, B):

| Fält | Text |
|---|---|
| `overrad` | INGET BESKED PÅ `N` DAGAR |
| `rubrik` | Fråga `företaget` om besked |
| `text`, utan utkast | `Tjänsten`. `M` var den `D`. Fråga när du kan vänta besked. |
| `text`, med utkast | `Tjänsten`. `M` var den `D`. Utkastet till mejlet är skrivet. |
| `knapp`, utan utkast | Fråga om besked |
| `knapp`, med utkast | Öppna utkastet |
| mål | `tjanstHref(t.id, 'folj-upp')` |

**Väggen på Översikt** när handlingen står först (`vaggForHandling`, grenen `folj_upp`, B): rubriken som ovan, knappen som ovan, texten "`M` för tjänsten som `tjänsten i löptext` var den `D`, och du har inte fått besked. Ett kort mejl som frågar när du kan vänta det räcker." (`titelILopText`).

**Kortet på telefon** (`goraMobil` i `src/components/jobb3/oversikt/oversikt.ts`, grenen `folj_upp`, C): med utkast "Utkastet till mejlet är skrivet.", annars "`M` var den `D`."

**Raden under Sökta tjänster på Översikt** (`tjanstRad` i samma fil, C). Grenen för intervjusteget står före `t.tyst` i dag. Lägg en gren före den vanliga `vantar_besked`: när `t.tyst` i intervjusteget är `text` = `beskedText(t)`, `textMobil` = "`Tjänsten`. `M` var den `D`.", `steg` = `{ steg: 3, tyst: true }`, `status` = `{ status: 'folj-upp' }`. Länken går redan till `folj-upp` när `t.tyst`.

**Listan under Sökta tjänster** (`src/components/jobb3/sokta/Lista.tsx`, gruppen `folj_upp`, C):

| Del | Text |
|---|---|
| radens text | `beskedText(t)`: "`M` var den `D`. Fråga när du kan vänta besked." |
| statusbrickan, dator | Tyst i `N` dagar (som i dag) |
| statusbrickan, telefon | Tyst `N` dagar (som i dag) |
| knappen, dator | Fråga om besked |
| knappen, telefon | Fråga om besked med ett kort mejl |
| gruppens underrad | `foljUppText(g.folj_upp)` |

`foljUppText` (B) ger:
- bara obesvarade ansökningar: "Tyst i minst tolv dagar. Ett kort mejl brukar ge besked." (dagens text)
- bara intervju eller provjobb: "Minst sju dagar utan besked. Ett kort mejl som frågar brukar räcka."
- blandat: "Tyst länge nog för att fråga. Ett kort mejl brukar ge besked."

**Banan** (`bana` i `src/lib/jobbsok/bana.ts`, B): en tyst bricka vid stationen Intervju får etiketten `tyst N dagar`, som vid Sökt. I `ListaVagg` (C) ritas facket Intervju som facket Sökt: tonen `tyst` och taggen utan ordet "tyst " när `b.tyst`, annars som i dag.

**Väggens rad under Sökta tjänster** (`soktaVagg` i `lista.ts`, B): är den tjänst som varit tyst längst en intervju eller ett provjobb skrivs "`Företaget` har inte gett besked på `N` dagar." i stället för "`Företaget` har varit tyst i `N` dagar."

**Tjänstens sida** (`src/components/jobb3/sokta/TjanstVy.tsx`, C):

| Del | Text |
|---|---|
| ögonbrynet | Tyst i `N` dagar (som i dag) |
| väggens ingress, dator | `M` var `veckodag` `D` och du har inte fått besked. Efter en vecka är det helt i sin ordning att fråga. |
| panelens rubrik | Fråga `företaget` om besked |
| panelens underrad | Ett kort mejl som tackar för `m` och frågar när du kan vänta besked. Ändra det du vill direkt i texten. |
| väntande rad i Händelser, rubrik | Följde upp (som i dag) |
| väntande rad i Händelser, text | Inget besked på `N` dagar. Tystnaden loggar du aldrig själv, den räknar vi ut. |

**Uppföljningsblocket** (`src/components/jobb3/sokta/Uppfoljning.tsx`, C). Blocket får sorten och gränsen ur `start.typ` och `start.grans`:

| Del | Ansökan (som i dag) | Intervju | Provjobb |
|---|---|---|---|
| raden medan utkastet skrivs | Vi skriver utkastet utifrån din ansökan | Vi skriver ett tack för intervjun och en fråga om besked | Vi skriver ett tack för provjobbet och en fråga om besked |
| raden "Till" | Mottagarens adress, står oftast under Kontakt i annonsen | Mottagarens adress, den som kallade dig till intervjun | Mottagarens adress, den du hade kontakt med om provjobbet |
| Vad som händer sedan, rad 2 | Tjänsten lämnar Följ upp. Ingen ny påminnelse på tolv dagar. | Tjänsten lämnar Följ upp. Ingen ny påminnelse på sju dagar. | samma som intervju |
| Vad som händer sedan, rad 3, datum | i dag plus 12 dagar | i dag plus 7 dagar | i dag plus 7 dagar |
| Vad som händer sedan, rad 3, text | Är det fortfarande tyst säger vi till, och då får du välja om du vill fråga en gång till. | Har du fortfarande inte fått besked säger vi till, och då får du välja om du vill fråga en gång till. | samma som intervju |

Dagarna räknas med `start.grans`, inte med talet 12 i koden. Övriga texter i blocket ("Skickade du mejlet?", "Följde upp i dag", "Jag har redan skickat det", felmeddelandena) ändras inte.

**Före sju dagar** (`vantar_besked`, inte tyst): väggens ingress på tjänstens sida, dator: "`M` var `veckodag` `D`. Har du inte fått besked den `langDag(t.tystSedan)` säger vi till." Inget block i panelen, som i dag. Listan och Översikt som i dag ("Intervju genomförd 20 november. Väntar på besked.").

#### Läge 2: kallelse utan tid

Tjänsten är aldrig tyst och står aldrig under Följ upp. Knappar och länkar som öppnar arket när ingen tid är satt heter "Sätt tiden" överallt (i dag "Sätt tid"): listans knapp och `tidLank` i `TjanstVy` (C) och `intervjuKnapp` i `IntervjuHubb.tsx` (A). Arkets rubrik "Sätt tid för intervjun" står kvar.

**Från att kallelsen loggas** (som i dag, utom knappens namn och det nya blocket):
- Listan: "Kallad till intervju. Sätt tiden när du vet den.", brickan "Tid saknas", knappen "Sätt tiden" till `tjanstHref(t.id, 'andra-tid')`.
- Översikt-raden: som i dag.

**Två dagar efter kallelsens datum** (`skaSattaTiden`):

Att göra nu, ny kandidat i `attGoraKandidater` (B):

| Fält | Värde |
|---|---|
| `typ` | `satt_intervjutid` |
| `nyckel` | `satt_intervjutid:<id>` |
| `datum` | `plusDagar(i.kalladDag, KALLELSE_UTAN_TID_DAGAR)`, `passerad` när datumet är före i dag |
| `ikon` | `kalender` |
| `overrad` | KALLAD `kortDag(i.kalladDag)`, till exempel "KALLAD 12 NOV" |
| `rubrik` | Sätt tiden för intervjun på `företaget` |
| `text` | `Tjänsten`. Med tiden satt påminner vi före intervjun och frågar hur det gick. |
| `knapp` | Sätt tiden, till `tjanstHref(t.id, 'andra-tid')` |

Sorteringen: `PRIORITET` får `satt_intervjutid` mellan `forbered_intervju` och `folj_upp` (de efterföljande flyttas ett steg). `sorteringsgrupp` ger 2, "allt övrigt", alltså efter "Hur gick intervjun?" och kommande intervjuer, sorterad på datum med det som passerat först.

Väggen när handlingen står först (`vaggForHandling`, nytt fall, B): rubrik och knapp som kortet, texten "`Tjänsten`. Du blev kallad den `K`. Med tiden satt påminner vi före intervjun och frågar hur det gick."

Kortet på telefon (`goraMobil`, C): rubrik "Sätt tiden för intervjun", text "`Företaget`. Kallad `kortDag(i.kalladDag)`."

Listan (`intervjuText`, B): "Kallad till intervju den `K`. Sätt tiden, så påminner vi före intervjun."

**Tjänstens sida, nytt block** (`TjanstVy.tsx`, C). I dag finns ingen väg att sätta tiden på telefon på tjänstens sida: ingressen och länken i väggen är dolda under 1280 px. Lägg ett block överst i panelen "Nästa steg", före Förbered intervjun, i läget `utan_tid`:
- Under 1280 px visas blocket alltid i läget. Från 1280 px visas det bara när `skaSattaTiden` (väggen har redan ingressen och länken).
- Byggs av det som redan finns i kitet, samma mönster som "Skickade du mejlet?" i `Uppfoljning.tsx`: `TonYta` med en rubrik (`j3-h3`), en textrad (`j3-text`) och en rad med två knappar (`LitenKnapp storlek={48}`, den andra `variant="streckad"`), `flex flex-wrap gap-2`.

| Del | Före två dagar | Efter två dagar |
|---|---|---|
| rubrik | Ingen tid satt för intervjun | Sätt tiden för intervjun |
| text | Sätt tiden när du vet den, så påminner vi före intervjun och frågar hur det gick. | Du blev kallad den `K`. Med tiden satt påminner vi före intervjun. Har den redan varit loggar du det här. |
| knapp 1 | Sätt tiden (ikon kalender), öppnar `IntervjuTidArk` (`setTidArk('andra')`) | samma |
| knapp 2 | Intervjun har redan varit, öppnar `HandelseArk` med typen `interview_completed` (`setHandelse({ open: true, typ: 'interview_completed' })`) | samma |

Väggens ingress på dator i läget, efter två dagar: "Du blev kallad till intervju den `K`. Sätt tiden, så påminner vi före intervjun och frågar hur det gick." Före två dagar som i dag.

### 2.4 Blocket Följ upp på tjänstens sida, och det gamla utkastet

I dag visar `TjanstVy` blocket när `tyst || u.utkast || uppfoljdIdag`, och när adressen har `?steg=folj-upp` på en tjänst som inte är avslutad. En tjänst i intervjusteget med ett gammalt oskickat utkast för en obesvarad ansökan visar därför blocket med fel utkast.

Nya regler (C, i `TjanstVy.tsx`):
- `grund` blir `folj-upp` bara när `t.foljUppTyp !== null && (tyst || u.utkast || uppfoljdIdag)`.
- `onskat` blir `folj-upp` bara när `fokus === 'folj-upp' && !t.avslutad && t.foljUppTyp !== null`. En gammal länk ur en notis eller ett veckobrev till en tjänst som sedan dess har fått en kallelse visar alltså tjänstens vanliga block, inte Följ upp.
- `u.utkast` är redan rensat av servern: bara ett utkast av rätt sort kommer med.

**Vad som händer med ett utkast av fel sort:**
- Det visas aldrig och går aldrig att skicka. Det räknas inte i `harUtkast`, så Att göra nu säger inte "Öppna utkastet".
- Det raderas inte. Raden ligger kvar orörd i databasen.
- Faller tjänsten tillbaka till ett läge där sorten stämmer (till exempel när en felaktig händelse tas bort) gäller utkastet igen.
- Behövs ett utkast av en annan sort för samma tjänst skriver servern över den gamla raden på plats: nytt ämne, ny text, `rewrites` 0 (2.5). Det sker bara för Premium, eftersom ett gratiskonto som redan har ett utkast möter betalväggen.
- "Jag har redan skickat det" markerar aldrig ett utkast av fel sort som skickat. Då skapas en rad utan text, som när inget utkast finns.

En känd lucka som inte tas om hand: ett oskickat intervjuutkast från en tidigare intervjuomgång hos samma arbetsgivare är av rätt sort och visas, med den förra intervjuns datum i texten. Texten går att ändra. Inget riktigt konto har två omgångar.

### 2.5 Servern (byggare B)

**`POST /api/jobbsok/uppfoljning/[id]`** (`src/app/api/jobbsok/uppfoljning/[id]/route.ts`), ny ordning:
1. Session och ägd tjänst som i dag.
2. Läs tjänstens uppföljningar och händelser parallellt (`job_application_events` för tjänsten, som `skickad/route.ts` redan gör).
3. `info = intervjuInfo(tjanst.current_status, handelser)`, `typ = foljUppTyp(tjanst.current_status, info)`.
4. `typ === null`: svara 409 med koden `inget_att_folja_upp` och texten "Tjänsten har inget att följa upp just nu". Inget skrivs, ingen händelse mäts.
5. `befintligt = oskickat(rader)`. Gäller det (`utkastGaller(befintligt, typ)`): svara med det, `kalla: 'sparat'`, som i dag.
6. Spärren med sorten (se nedan). `premium_required` ger 402 och `dygnstak` 429 som i dag.
7. `ateranvand` (gratis, samma tjänst, samma sort): som i dag, men förra raden väljs bland rader med text av samma sort.
8. `ny`: `lasUnderlag` med `typ` och `momentDag: info?.dag ?? null`, sedan `skrivUtkast`. Finns en oskickad rad (tom, eller med text av fel sort) uppdateras den på plats med `subject`, `body` och `rewrites: 0`. Annars insert som i dag.

`GET` på samma rutt: `utkast` bara när det gäller, och svaret får `typ` och `grans`. `nastaPaminnelse` räknas med `typ`. `PUT` och `/kortare` ändras inte: klienten ser aldrig ett utkast av fel sort.

**`POST .../skickad`**: räkna `typ` som ovan (händelserna läses redan). Det oskickade utkastet markeras bara när det gäller, annars skapas en rad utan text. Svarets `nastaPaminnelse` är `nastaPaminnelse(indata.datum, typ)`. `DELETE` ändras inte.

**`hamtaSoktTjanst`** (`src/lib/jobbsok/server.ts`): `utkast` bara när det gäller, frågan efter kontots utkast läser också `subject`, spärren får `typ`, `nastaPaminnelse` får `typ`, och `uppfoljning` får `typ` och `grans`. Inga nya frågor. `hamtaIntervjuerPaGang` ändras inte och läser fortfarande inga uppföljningar.

**Spärren** (`uppfoljningSparr` i `src/lib/jobbsok/uppfoljning.ts`). `utkast` är kontots rader med text, nu med `subject`:
- Premium: som i dag, högst 30 nya utkast per dygn.
- Gratis, inga rader: `ny`.
- Gratis, en rad på samma tjänst av samma sort (`utkastTyp(subject) === typ`): `ateranvand`.
- Gratis, annars: `premium_required`. Det gäller också när kontots enda utkast hör till samma tjänst men är av en annan sort.

Utan `typ` och utan `subject` beter sig funktionen som i dag, så de befintliga testerna står kvar.

**Betalväggens text** (`src/components/paywall/paywall-copy.ts`, varianten `uppfoljning`, C). Texten säger i dag "Ditt gratis utkast är använt på en annan tjänst", vilket inte längre alltid är sant. Ny brödtext, rubriken och knapparna står kvar:

> Ditt gratis utkast är använt. Med Premium skriver vi ett utkast varje gång du vill följa upp, efter en ansökan eller en intervju. Du kan också skriva mejlet själv och logga det här.

("Premium" skrivs med konstanten `PREMIUM` som i dag.) Pris, kampanjrad och köpknapp rörs inte.

### 2.6 Utkastet efter intervju eller provjobb (byggare B)

**Underlaget till AI:n** (`underlagForModellen`). För sorterna intervju och provjobb går bara det här till modellen:

```ts
{ tjanst, arbetsgivare, moment: 'intervju' | 'provjobb', datum: langDag(momentDag) | null, kompetenser /* högst 3 */, krav /* högst 8 */, sprak }
```

Samma rensning som i dag (inga radbrytningar, högst 200 tecken per fält, 60 för kompetenser och krav). Aldrig namn, telefon, e-post eller adress. Aldrig intervjuns plats eller anteckningar: de kan innehålla namn och adresser. Namnet sätts in av servern efteråt (`sattIhop`), som i dag.

**Instruktionen** (`src/lib/openai/uppfoljningsmejl.ts`, ny funktion bredvid `system`, väljs i `skrivUppfoljningsmejl` efter `u.typ`). Samma modell, schema, temperatur, tidsgräns (8 sekunder) och validering (`valideraAiMejl`: två till fyra stycken, högst 90 ord, inga hakparenteser, adresser eller länkar) som i dag. Talet 70 skrivs som `UPPFOLJNING_MAX_ORD - 20`.

Svenska, intervju:

```
Du skriver ett kort mejl från en arbetssökande till en arbetsgivare efter en genomförd intervju, som en människa skriver det, aldrig säljigt.
Regler: en ämnesrad och exakt tre korta stycken, högst 70 ord sammanlagt. Svenska med svenska facktermer, arbetsgivaren tilltalas "ni".
1. Ett tack för intervjun, med dagen och tjänsten.
2. Att hon fortfarande vill ha tjänsten, kopplat till högst två av kompetenserna eller kraven.
3. En fråga om när hon kan vänta besked, och att hon gärna svarar på fler frågor.
Skriv sakligt och vardagligt. Undvik fraser som "ser fram emot", "bidra till ert team", "mycket intresserad" och "rekryteringsprocessen"; säg "rekryteringen". Påstå inget om vad som sades på intervjun eller hur den gick. Saknas datum i underlaget nämner du ingen dag. Nämn kompetenserna med namn om de finns.
Ingen hälsning, inget avslut, inget namn, inga platshållare som [NAMN]. Hitta inte på något. Inga tankstreck. Svara bara med JSON: {"amne":"...","stycken":["...","...","..."]}
```

Svenska, provjobb: samma text med tre byten. "efter en genomförd intervju" blir "efter ett genomfört provjobb", "Ett tack för intervjun" blir "Ett tack för provjobbet", och "vad som sades på intervjun eller hur den gick" blir "vad som hände under provjobbet eller hur det gick".

Engelska, intervju:

```
You write a short email from a job seeker to an employer after a completed interview, the way a person writes it, never salesy.
Rules: a subject line and exactly three short paragraphs, at most 70 words in total.
1. A thank you for the interview, with the day and the role.
2. That she still wants the role, tied to at most two of the given skills or requirements.
3. A question about when she can expect a decision, and that she is happy to answer further questions.
Write plainly. Avoid phrases like "look forward to", "contribute to your team", "very interested" and "recruitment process"; say "the recruitment". Claim nothing about what was said in the interview or how it went. If the input has no date, mention no day.
No greeting, no sign-off, no name, no placeholders like [NAME]. Do not invent facts. No dashes. Reply only with JSON: {"amne":"...","stycken":["...","...","..."]}
```

Engelska, provjobb: "after a completed interview" blir "after a completed trial day", "for the interview" blir "for the trial day", och "what was said in the interview" blir "what happened during the trial day".

**Ämnesraden** (`mallAmne`, alltid mallens, aldrig AI:ns, som i dag). `titel` är `titelILopText(jobTitle)`. Raderna byggs med `AMNE_START`, så att `utkastTyp` och `mallAmne` aldrig kan glida isär:

| Sort | Svenska | Engelska |
|---|---|---|
| intervju | Tack för intervjun, tjänsten som `titel` | Thank you for the interview, `jobTitle` |
| provjobb | Tack för provjobbet, tjänsten som `titel` | Thank you for the trial day, `jobTitle` |

Hur man sökte (annons, spontant, kontakt) påverkar inte ämnesraden för de här sorterna. Raderna för en ansökan är oförändrade.

**Reservmallen** (`uppfoljningsmall`, används när AI:n inte svarar i tid eller svaret inte håller). Högst två kompetenser i de här sorterna (`slice(0, 2)`). `lista` är den befintliga hjälpfunktionen ("bokföring och löpande redovisning"). Hälsning, avslut och namn sätts runt styckena av `sattIhop`, som i dag.

Svenska:

| Stycke | Intervju | Provjobb |
|---|---|---|
| 1, med dag | Tack för intervjun den `D` om tjänsten som `titel`. | Tack för provjobbet den `D`, för tjänsten som `titel`. |
| 1, utan dag | Tack för intervjun om tjänsten som `titel`. | Tack för provjobbet, för tjänsten som `titel`. |
| 2, med kompetenser | Jag är fortfarande intresserad. Det jag gör i dag, `lista(komp, 'och')`, ligger nära det ni söker. | samma |
| 2, utan kompetenser | Jag är fortfarande intresserad av tjänsten och av att jobba hos er. | samma |
| 3 | Vet ni när ni räknar med att lämna besked? Hör gärna av er om ni vill fråga något mer. Jag svarar på det här mejlet eller i telefon. | samma |

Engelska (`enDatum` ger "20 November"):

| Stycke | Intervju | Provjobb |
|---|---|---|
| 1, med dag | Thank you for the interview on `enDatum(dag)` for the `jobTitle` position. | Thank you for the trial day on `enDatum(dag)` for the `jobTitle` position. |
| 1, utan dag | Thank you for the interview for the `jobTitle` position. | Thank you for the trial day for the `jobTitle` position. |
| 2, med kompetenser | I am still interested. My experience with `lista(komp, 'and')` is close to what you are looking for. | samma |
| 2, utan kompetenser | I am still interested in the role and in working with you. | samma |
| 3 | Do you know when you expect to make a decision? Please let me know if you have further questions. I am happy to answer by email or phone. | samma |

Språket väljs som i dag: engelska när det kopplade brevet är på engelska, annars svenska.

"Skriv om kortare" ändras inte. Den kortar brödtexten och behåller ämnesraden, och förbuden mot fraser gäller redan där.

**Mätningen**: `uppfoljning_utkast_oppnat`, `uppfoljning_sparr` och `uppfoljning_loggad` får den valfria egenskapen `typ: 'ansokan' | 'intervju' | 'provjobb'` (`src/lib/analytics/events.ts`). Kostnaden loggas som i dag under `uppfoljning_utkast`.

### 2.7 Notisen och veckobrevet

**Överens med saas-lead 2026-11-22.** Ägaren har lagt beslutet hos saas-lead och UX (`docs/beslut-jobbsoket-2026-11-21.md`, "Beslut i omgång 2", beslut 1). Texterna nedan går med i pushen och kräver inget eget ja. De går ut av sig själva till användare, så ordalydelsen ändras inte av en byggare.

"Har inte hört av sig" står aldrig om en tjänst i intervjusteget. En kallelse till intervju, med eller utan tid, ger aldrig en notis och nämns aldrig i veckobrevets ruta. Detsamma gäller en tjänst som står som kallad till test (9 B): aldrig en notis, aldrig en rad i rutan.

**Notisen** (`src/lib/notifications/followUp.ts`):
- Frågan mot `job_applications` läser också statusarna `interview_completed` och `trial_work_completed`, och datumgränsen räknas på `INTERVJU_BESKED_DAGAR` (den kortaste gränsen). Urvalet görs som förut i koden.
- `followUpCandidates`: en rad med historik hoppas inte längre över för att den har fått svar. Motorn avgör (`tystnadFor`). Avslutade och erbjudanden hoppas över som förut. Kandidaten får `typ` och `momentDag`. Reservläget utan historik är oförändrat och tar bara tjänster utan svar.
- Obesvarad ansökan, oförändrat: titeln "`Företaget` har inte hört av sig", texten "Din ansökan som `tjänsten` har varit tyst i `N` dagar. Ett kort mejl som frågar hur processen ligger till räcker."
- Genomförd intervju, nytt: titeln "Dags att fråga `företaget` om besked", texten "Intervjun för tjänsten som `tjänsten i löptext` var den `D`. Ett kort mejl som frågar när du kan vänta besked räcker."
- Genomfört provjobb, nytt: samma titel, texten "Provjobbet för tjänsten som `tjänsten i löptext` var den `D`. Ett kort mejl som frågar när du kan vänta besked räcker."
- `action_url` är `tjanstHref(app.id, 'folj-upp')` i alla tre. `metadata` får `efter: 'ansokan' | 'intervju' | 'provjobb'` bredvid `applicationId` och `silentDays`.
- Spärren mot upprepning (`redanNotifierad`, 30 dagar, högst 3 per användare och körning) gäller som förut.

**Veckobrevet** (`src/lib/email/lifecycle/templates/weekly-digest.ts`):
- `WeeklyDigestData` får `besked: Array<{ id?: string; title: string; company: string; dag: string; moment: 'intervju' | 'provjobb' }>`: tjänster med historik där motorn säger tyst och sorten är intervju eller provjobb, längst väntan först, högst 2.
- **Högst tre rader i rutan totalt.** Beskedsraderna går först, högst två. Tysta ansökningar (`followUps`) fyller upp till tre rader: två när `besked` är tom eller har en rad, en när `besked` har två.
- Rutan (`followUpNote`) får ett stycke före det befintliga när `besked` har rader:
  - inledning: "Här väntar du på besked:"
  - rad, intervju: "`tjänsten` hos `företaget`, intervjun var den `D`" (tjänsten länkad till `tjanstHref(id, 'folj-upp')` med samma utm som i dag)
  - rad, provjobb: "`tjänsten` hos `företaget`, provjobbet var den `D`"
  - avslutning när bara beskedsstycket visas: "Fråga när du kan vänta besked. Ett kort mejl räcker."
  - avslutning när stycket om tysta ansökningar också visas: "Fråga när du kan vänta besked." Meningen om mejlet står då bara en gång, i nästa styckes avslutning.
- Det befintliga stycket om tysta ansökningar står kvar ordagrant efteråt, med sin egen avslutning. Inledningen följer antalet rader som faktiskt visas ("Den här har det varit tyst om ett tag:" vid en rad).
- Preheadern: har `besked` rader blir den "Dags att fråga om besked." Annars som i dag.
- `shouldSend`, ämnesraden, sifferraden och veckans mening ändras inte. Ett konto som bara har en tjänst som väntar besked får alltså inte brevet av det skälet. Det omprövas den 19 december.

**Tillägg för byggare B, som redan har byggt 2.7 efter den första lydelsen.** Två ändringar i `weekly-digest.ts`, inget i `followUp.ts`:
1. `summarize`: ny konstant `MAX_RADER = 3`. `data.besked` räknas först (`slice(0, MAX_BESKED)`, som nu). Sedan `data.followUps = candidates.slice(0, Math.min(MAX_FOLLOW_UPS, MAX_RADER - data.besked.length))`.
2. `beskedNote` får en andra parameter, `medTysta: boolean`. Avslutningen är "Fråga när du kan vänta besked." när `medTysta` är sant, annars "Fråga när du kan vänta besked. Ett kort mejl räcker." `followUpNote` anropar med `data.followUps.length > 0`.

Testerna i `weekly-digest.test.ts`:
- fallet "besked fylls för genomförd intervju och provjobb, längst väntan först, högst 2" kompletteras: två besked och tre tysta ansökningar ger `followUps.length === 1`, ett besked och tre tysta ger 2, inget besked och tre tysta ger 2.
- fallet "rutans rader och avslutning, före det oförändrade stycket om tysta ansökningar": beskedsstycket innehåller "Fråga när du kan vänta besked." men inte "Ett kort mejl räcker.", och hela rutan innehåller "Ett kort mejl som frågar hur processen ligger till räcker." exakt en gång.
- fallet "bara besked: bara besked-stycket": stycket slutar med "Fråga när du kan vänta besked. Ett kort mejl räcker."
- nytt fall: med fem kandidater av varje sort är `besked.length + followUps.length` högst 3.

Testet att en tjänst som står som kallad till test aldrig ger en notis eller en rad skrivs i 9 B, när händelsetypen finns (9.19). Byggare B skriver det inte nu.

### 2.8 Regler och gränsfall

- Efter en loggad uppföljning i intervjuläget kommer nästa påminnelse sju dagar efter `sent_at`.
- Loggas "Intervju genomförd" mer än sju dagar efter intervjudagen är tjänsten tyst direkt.
- En ny kallelse efter en genomförd intervju (andra omgången) gör tjänsten till kallad igen: inte tyst, inget uppföljningsblock, och ett oskickat intervjuutkast göms.
- Sätts en tid som redan har passerat blir läget "Hur gick intervjun?", som i dag.
- Erbjudande, avslag och tackat nej: aldrig tyst, inget uppföljningsblock, som i dag.
- Tas en händelse bort räknas läget om från de händelser som är kvar.
- Utan kopplat brev eller CV skrivs mallen utan kompetenser.
- Inget av lägena får en röd färg. Tyst är koppar, som i dag.
- De gamla räkningarna i `src/lib/dashboard/getSummary.ts` (`followUpCount`, `hem.tysta`) och `src/hooks/useNextBestAction.ts` ritas inte i Jobbsökets vyer och rörs inte.

### 2.9 Klart när

Testrader på QA-kontona, skapade med datum bakåt så att lägena går att se i dag: (a) sökt 1 november, kallad 5 november med tid 10 november, genomförd 10 november, (b) sökt 1 november, kallad 12 november utan tid, (c) som (a) men provjobb genomfört, (d) sökt 1 november, ett oskickat utkast för ansökan, sedan kallad utan tid.

Ses i 1440 px och 412 x 915, Premium:
- (a) står under Följ upp på Sökta tjänster med raden "Intervjun var den 10 november. Fråga när du kan vänta besked." och knappen "Fråga om besked". Översikt har kortet "Fråga `företaget` om besked". Tjänstens sida visar panelen med ett utkast vars ämne börjar "Tack för intervjun", som nämner den 10 november och inte innehåller "har inte hört". "Vad som händer sedan" säger sju dagar.
- Efter "Ja, det är skickat" lämnar (a) Följ upp, och raden säger att vi säger till igen om sju dagar.
- (b) står under Intervju på gång, aldrig under Följ upp. Översikt har kortet "Sätt tiden för intervjun på `företaget`". Trycket öppnar arket för intervjutid. På telefon har tjänstens sida blocket med knapparna "Sätt tiden" och "Intervjun har redan varit", båda minst 48 px höga och ingen text klippt i 360 px.
- (c) som (a) med ordet provjobbet, ämnet "Tack för provjobbet".
- (d) visar inget Följ upp-block på tjänstens sida, med och utan `?steg=folj-upp`. Att göra nu säger inte "Öppna utkastet".
- Gratiskontot med sitt utkast använt på en ansökan: (a) visar betalväggen med den nya texten, och "Jag har redan skickat det" syns och går att trycka på.
- En obesvarad ansökan (tolv dagar) ser ut och låter exakt som före bygget.
- Ingenstans står "har inte hört något" eller "har inte hört av sig" om en tjänst i intervjusteget.

### 2.10 Vitest

Byggare B, i `src/lib/jobbsok/__tests__/motor.test.ts` (eller en ny fil `intervjulagen.test.ts` i samma mapp):
- `foljUppTyp`: sökt ger ansokan, kallad med tid null, kallad utan tid null, tid passerad null, genomförd intervju ger intervju, provjobb ger provjobb, erbjudande och avslag null.
- genomförd intervju för 6 dagar sedan är inte tyst, för 7 dagar sedan är den tyst, och `tystSedan` är intervjudagen plus 7.
- genomförd intervju för 20 dagar sedan med en uppföljning skickad för 3 dagar sedan är inte tyst, med en uppföljning för 8 dagar sedan är den tyst.
- kallelse utan tid för 20 dagar sedan är aldrig tyst (det befintliga fallet står kvar), och `skaSattaTiden` är falskt dag 1 och sant dag 2.
- en obesvarad ansökan blir tyst dag 12 som förut.
- `utkastTyp` och `mallAmne` hör ihop: för varje sort och språk ger `utkastTyp(mallAmne(...))` sorten tillbaka, och ämnesraderna för annons, spontanansökan och engelsk ansökan ger ansokan.
- `utkastGaller`: rätt sort ja, fel sort nej, skickat nej, utan text nej, `typ` null nej.
- `harUtkast` är falskt för en tjänst i intervjusteget med ett oskickat ansökningsutkast.
- Att göra nu: genomförd intervju för 9 dagar sedan ger överraden "INGET BESKED PÅ 9 DAGAR", rubriken, båda texterna (med och utan utkast) och knapparna enligt 2.3. Kallelse utan tid för 3 dagar sedan ger `satt_intervjutid` med texterna enligt 2.3, och för 1 dag sedan ger den ingenting.
- Ordningen: "Hur gick intervjun?" före `satt_intervjutid`, och `satt_intervjutid` sorteras bland övrigt på datum.
- Väggens text för båda handlingarna.
- `gruppFor`: tyst genomförd intervju hamnar i `folj_upp`, kallelse utan tid i `intervju`.
- `foljUppText`: de tre strängarna. `beskedText`: intervju och provjobb. `intervjuText`: de två nya grenarna, och att texten för `vantar_besked` är densamma oavsett `tyst`.
- `soktaVagg`: "har inte gett besked på 9 dagar" för en intervju.
- `uppfoljningSparr`: gratis utan rader ny, samma tjänst samma sort ateranvand, samma tjänst annan sort premium_required, annan tjänst premium_required, och anrop utan `typ` och `subject` som i dag.
- `uppfoljningsmall`: alla celler i tabellerna i 2.6 ordagrant, på båda språken, med och utan dag och kompetenser, högst två kompetenser, och högst 90 ord.
- `underlagForModellen` för intervju: har `moment` och `datum`, saknar `sokt_datum` och `hur`, och innehåller inget namn.
- instruktionen: de fyra förbjudna fraserna står i både den svenska och den engelska texten för intervju och provjobb (exportera texterna eller testa genom en liten exporterad funktion).
- `nastaPaminnelse('2026-11-20', 'intervju')` är 27 november, utan sort 2 december.

Byggare B, för notisen och veckobrevet (2.7, med tillägget där):
- `followUp.test.ts`: genomförd intervju för 9 dagar sedan ger en kandidat med `typ` intervju, och notisens titel och text enligt 2.7. Kallad, med eller utan tid, ger aldrig en kandidat. Ingen notis för en intervjustatus innehåller "har inte hört av sig". Reservläget utan historik tar inte med en genomförd intervju. Det befintliga fallet "avslutade och besvarade bort" rättas.
- `weekly-digest.test.ts`: `besked` fylls för genomförd intervju och provjobb, högst 2. Högst tre rader totalt. Rutans rader och de två avslutningarna enligt 2.7. Preheadern. En kallelse står aldrig i rutan. `shouldSend` är oförändrad.

Byggare C:
- `src/components/jobb3/oversikt/__tests__/oversikt.test.ts`: `tjanstRad` för tyst genomförd intervju (texten, `steg` med `tyst`, status `folj-upp`, länken till `folj-upp`), `goraMobil` för `folj_upp` efter intervju med och utan utkast, och för `satt_intervjutid`.
- `src/components/paywall/__tests__/paywall-copy.render.test.tsx`: den nya brödtexten för `uppfoljning`, och att den inte innehåller "på en annan tjänst".

---

## 3. Knapparna i annonsens fot på telefon (beslut 22)

### 3.1 Vad som byggs

`AnnonsFotMobil` i `src/components/jobb3/jobb/AnnonsVy.tsx` har i dag primärknappen "Skriv brev" och två ikonknappar utan text (56 x 56) för Spara till Ska sökas och Markera som sökt. Foten får två rader, och varje handling får text. Gäller under 1280 px. Annonsen på dator (`AnnonsPanel`) ändras inte.

### 3.2 Uppställningen

Rad 1: "Skriv brev" med pil, primärknappen (`StorKnapp`, 56 px hög, full bredd), som i dag.

Rad 2: två vita knappar bredvid varandra (`LitenKnapp storlek={48}`, 48 px höga, 8 px emellan), var och en med ikon och text. De fyller raden efter sin text (`flex: 1 1 auto`), så att den längre texten får mer plats.

Ordningen i koden och på skärmen: Skriv brev, Spara, Markera som sökt. Samma ordning som på dator.

```
360 px (innehållet är 328 px brett)

+----------------------------------------+
|              Skriv brev  ->            |   56 px
+----------------------------------------+
+-------------+ +------------------------+
| [] Spara    | | v Markera som sökt     |   48 px
+-------------+ +------------------------+
```

I 412 px är uppställningen densamma, knapparna i rad 2 blir bredare.

Fotens höjd blir ungefär 140 px (10 px luft, 56, 12 mellan raderna, 48, 14 luft) i stället för ungefär 85. Det är priset för att handlingarna ska gå att läsa. Foten står kvar ovanför dörrnavet (`bottom: var(--bottom-nav-h)`), och sist på sidan ligger den i flödet, så ingen annonstext hamnar bakom den.

### 3.3 Texterna och lägena

| Läge | Vänster knapp | Höger knapp |
|---|---|---|
| inget gjort | ikon bokmärke, "Spara", `aria-label` "Spara till Ska sökas" | ikon bock, "Markera som sökt" |
| sparar | "Sparar", avstängd | oförändrad |
| sparad | ikon bock, "Sparad", en länk till `soktaHref({ filter: 'ska-sokas', fran: 'annons-fot' })`, `aria-label` "Sparad i Ska sökas. Visa listan" | "Markera som sökt" |
| kunde inte spara | "Försök igen", `aria-label` "Försök spara igen" | oförändrad |
| markerar som sökt | oförändrad | "Sparar", avstängd |
| kunde inte markera | oförändrad | "Försök igen" |
| sökt (också när annonsen redan var sökt när sidan laddades) | rad 2 är en enda knapp i full bredd: ikon bock, "Loggad som sökt. Visa listan", en länk till `soktaHref({ fran: 'annons-fot' })` | |

I läget sökt finns inget kvar att spara, så rad 2 blir vägen in i Sökta tjänster. "Skriv brev" står kvar i alla lägen.

På dator står "Spara till Ska sökas" kvar. På telefon räcker bredden inte till den texten bredvid "Markera som sökt" i 360 px, därför "Spara" med hela meningen i `aria-label`.

### 3.4 Filer och klasser

- `AnnonsVy.tsx`: `AnnonsFotMobil` byggs om enligt 3.2 och 3.3 med `StorKnapp` och `LitenKnapp` (med `ikon` och `href` där raden säger länk). `sparText` och `soktText` behålls för datorn. Telefonens texter får egna små funktioner i samma fil, exporterade för testet.
- `src/components/jobb3/kit/JobbVagg.tsx`: `FastFot` får en valfri egenskap `rader` som lägger klassen `rader` på `.j3-fot`. `MatchadeJobb.tsx` skickar `rader` där `AnnonsFotMobil` ritas (i telefonens annonsvy). Foten med en enda knapp (visningssidans "Logga sökt tjänst") är oförändrad.
- `src/app/jobb3.css`, avsnittet "Fast fot på telefon". De befintliga reglerna för `.j3-fot` står kvar. Nya regler:

```css
.j3-fot.rader { flex-wrap: wrap; row-gap: 12px; }
.j3-fot.rader > .j3-stor { flex: 1 0 100%; }
.j3-fot.rader > .j3-liten { flex: 1 1 auto; min-width: 0; padding: 0 12px; }
```

  `row-gap` är 12 px eftersom primärknappen har 5 px skugga under sig.
- `IkonKnapp` (`kit/delar.tsx`, exporten i `kit/index.ts`) och regeln `.j3-liten.ikon` används inte längre av foten. I dag används `IkonKnapp` bara i `AnnonsVy.tsx` och i ett exempel på visningssidan. Byt exemplet mot den nya foten och ta sedan bort komponenten, exporten och CSS-regeln. Sök i `src` först, och låt dem stå om något annat har börjat använda dem.
- `src/app/jobb3-kit/page.tsx`: visa foten i fem lägen (inget gjort, sparad, sökt, kunde inte spara, sparar) så att den går att se i 360 och 412 px utan data. `AnnonsFotMobil` har inga hooks och tar lägena som egenskaper.
- `docs/bygg-noter-jobbsoket-kit.md`: raden om ikonknapparna i annonsens fot rättas.

### 3.5 Klart när

Ses på visningssidan och i en riktig annons i Matchade jobb, i 360, 412 och 768 px, ljust och mörkt läge:
- Alla tre handlingarna har synlig text i alla lägen. Ingen text klipps eller bryts i 360 px, inte heller "Försök igen" bredvid "Markera som sökt".
- Varje knapp är minst 48 px hög. Fokusramen syns på alla.
- "Spara" ger "Sparad" med bock, och trycket på "Sparad" öppnar Sökta tjänster med filtret Ska sökas och `fran=annons-fot` i adressen.
- "Markera som sökt" ger en enda knapp "Loggad som sökt. Visa listan", och trycket öppnar Sökta tjänster med tjänsten i listan.
- Sista stycket i annonsen och länken "Ansök hos ..." går att läsa ovanför foten när sidan är rullad till botten.
- I 1440 px syns ingen fot, och annonsens knappar är som förut.
- Kom igång-brickan i del 1 är avbockad efter Spara eller Markera som sökt, utan omladdning.

### 3.6 Vitest

Ny fil `src/components/jobb3/jobb/__tests__/annonsFot.test.tsx` (rendera med `@testing-library/react`, som `villkor.test.tsx`):
- inget gjort: tre knappar i ordningen Skriv brev, Spara, Markera som sökt. "Spara" har `aria-label` "Spara till Ska sökas".
- sparad: "Sparad" är en länk till `/dashboard/sokta-tjanster?filter=ska-sokas&fran=annons-fot`, och "Markera som sökt" finns kvar.
- sökt: "Skriv brev" och en länk "Loggad som sökt. Visa listan" till `/dashboard/sokta-tjanster?fran=annons-fot`, inga andra knappar.
- sparar: "Sparar" är avstängd. Fel: "Försök igen" går att trycka på och anropar `onSpara`.
- trycken anropar `onSkrivBrev`, `onSpara` och `onSokt`.

---

## 4. Hubben i Inför intervjun efter högsta betyg

### 4.1 Vad som är fel

På gratisnivån, när dagens prov är gjort, väljer hubben handlingen `lasIgen` med det senaste provet. Rubriken är då alltid "Skriv om svaret om ..." (`NASTA.omskrivning.rubrik`), också när provet fick 5 av 5. Texten under är redan rättad ("Du fick 5 av 5 i dag, med alla fyra delarna på plats. Nästa prov öppnar i morgon."), men rubriken, ögonbrynet och frågebanan säger fortfarande "gör om".

Läget finns bara på gratisnivån. Premium har inget tak och hamnar aldrig i `lasIgen`.

### 4.2 Vad som byggs

Ett eget läge i hubbens texter: `lasIgen` där inget saknades (`saknadesI(h.prov) === null`, alltså 5 av 5). Rangordningen i `valjHubbHandling` ändras inte, och händelsen `next_action_shown` skickar samma `kind` som i dag.

**`src/lib/intervju/nasta.ts`**, två rena funktioner:

```ts
/** Dagens prov fick högsta betyg och kvoten är slut: inget att skriva om. */
export function arHogstaBetyg(h: HubbHandling): boolean        // h.kind === 'lasIgen' && saknadesI(h.prov) === null

/** Frågan hubben föreslår när nästa prov öppnar, eller null när den föreslår något annat. */
export function imorgonFraga(u: HubbUnderlag): FragaId | null   // valjHubbHandling({ ...u, kvotKvar: true }), fraga när kind är 'nyFraga', annars null
```

**`src/app/dashboard/intervju/infor-intervjun-copy.ts`**, `NASTA.lasIgen` får:

```ts
ogonHogst: 'Klart för i dag',
rubrikHogst: (fraga: FragaId) => `Högsta betyg på frågan om ${FRAGOR[fraga].bestamd}`,
imorgon: (fraga: FragaId) => `Då föreslår vi frågan om ${FRAGOR[fraga].bestamd}.`,
```

**`src/components/jobb3/intervju/text.ts`**, `HUBB` får `dagensDelar: 'Dagens svar, del för del'`.

**`src/components/jobb3/intervju/IntervjuHubb.tsx`**, i läget `arHogstaBetyg(data.handling)`:

| Del | Värde |
|---|---|
| panelens ögonbryn | Klart för i dag |
| panelens rubrik | Högsta betyg på frågan om `frågan` |
| panelens text | den befintliga meningen plus "Nästa prov öppnar i morgon.", och sist `NASTA.lasIgen.imorgon(fraga)` när `imorgonFraga` ger en annan fråga än dagens |
| knappen i väggen och i panelen | Läs återkopplingen igen (som i dag), till `provHref(h.prov.token)` |
| raden bredvid väggens knapp | frågans namn (som i dag) |
| frågebanan | ingen fråga är markerad som nästa. Dagens fråga ritas som klar med sitt betyg och länkar till provet. |
| rutan till höger i panelen | står kvar med dagens prov, del för del, under rubriken "Dagens svar, del för del" i stället för "Förra svaret, del för del" |

`imorgonFraga` får `{ prov: data.prov, kvotKvar: data.kvotKvar, harSmakprov: Boolean(data.smakprov), harProfil: Boolean(data.profil) }`.

Rubrikerna för de sju frågorna blir:
- Högsta betyg på frågan om dig själv
- Högsta betyg på frågan om styrkor och svagheter
- Högsta betyg på frågan om varför vi ska anställa dig
- Högsta betyg på frågan om varför du söker jobbet
- Högsta betyg på frågan om ett problem du löste
- Högsta betyg på frågan om en konflikt med en kollega
- Högsta betyg på frågan om ett misstag du gjort

Exempel på hela texten: "Du fick 5 av 5 i dag, med alla fyra delarna på plats. Nästa prov öppnar i morgon. Då föreslår vi frågan om en konflikt med en kollega."

I koden: `nastaFraga` används i dag både för frågebanans markering och för rutan med förra svaret. I det här läget ska banan inte markera någon fråga, medan rutan visar `data.handling.prov`. Dela de två användningarna.

Samma ändring i `IntervjuHubb.tsx` som del 2 behöver: i `intervjuKnapp` blir texten "Sätt tid" "Sätt tiden".

`lasIgen` med 4 av 5 (något saknades, kvoten slut) ändras inte: rubriken "Skriv om svaret om ..." stämmer med texten under.

### 4.3 Klart när

Gratiskontot efter dagens prov med 5 av 5 på "Ett problem du löste", i 412 x 915 och 1440 px:
- Panelen har ögonbrynet "Klart för i dag" och rubriken "Högsta betyg på frågan om ett problem du löste". Ordet "Skriv om" står ingenstans på sidan.
- Texten slutar med vilken fråga som föreslås i morgon.
- Frågebanan har ingen kopparring. De fyra brickorna säger "Fanns med".
- Väggens knapp "Läs återkopplingen igen" öppnar det bedömda svaret.
- Ett prov med 3 av 5 och kvoten slut ser ut som före bygget.

### 4.4 Vitest

- `src/lib/intervju/__tests__/nasta.test.ts`: `arHogstaBetyg` är sant för `lasIgen` med 5 av 5 (också med `missingKind` kvar på raden), falskt för `lasIgen` med 3 och 4, och falskt för `omskrivning`. `imorgonFraga` ger första ogjorda frågan, null när nästa handling är `helaTestet`, och lägst bästa nivå när alla är gjorda.
- `src/app/dashboard/intervju/__tests__/infor-intervjun-copy.test.ts`: `rubrikHogst` för `star` och `beratta` ordagrant, `imorgon` för `konflikt`, och att ingen av dem innehåller "Skriv om".

---

## 5. Raden i CV-rummet efter nedladdning (beslut 22): BYGGS INTE I DEN HÄR OMGÅNGEN

En annan session ändrar just nu i CV-rummets filer. Raden specas här så att den kan byggas när CV-rummets släpp är klart. Ingen byggare rör `src/app/dashboard/profil/cv/DittCvClient.tsx` eller `src/components/cv/rum3/texter.ts` i omgång 2.

- **Plats:** väggens "Nästa steg" i CV-rummet i läget efter nedladdning. Det är `default`-grenen i `DittCvClient.tsx` (ögonbrynet "Använd CV:t", rubriken "Skriv ett personligt brev", knappen "Skriv brev"). Raden står under sidoraden ("CV:t är nedladdat och klart att skicka."), i alla bredder, som en textlänk med minst 44 px tryckyta. Den ersätter ingenting och är aldrig primärknapp.
- **Text:** "Har du redan skickat CV:t? Logga tjänsten du sökte"
- **Mål:** `soktaHref({ logga: 'sokt', fran: 'cv-nedladdat' })`
- **Textens plats i koden:** `NASTA.brev.loggaLank` i `src/components/cv/rum3/texter.ts`.
- **Villkor:** visas alltid i läget, också när CV:t har poäng kvar till 100. CV-rummet läser inte de sökta tjänsterna, och raden ska inte kosta en fråga.
- **Klart när:** raden syns i 412 och 1440 px utan att knappen "Skriv brev" flyttas eller klipps, och trycket öppnar arket för att logga en sökt tjänst med `fran=cv-nedladdat` i adressen.
- **Vitest:** att länkens adress är `/dashboard/sokta-tjanster?logga=1&fran=cv-nedladdat`.

---

## 6. Mätningen

Varje ny väg in följs så här:

| Väg in | Det som mäter den |
|---|---|
| Brickan i Kom igång | `kom_igang_tile_clicked` med `bricka: 'sokt_tjanst'` (trycket), sidvisningen med `fran=komigang`, `komigang_opened` (arket) |
| Första raden, alla vägar | `onboarding_step_completed` med `step: 'sokt_tjanst'`. Den mäts på servern första gången ett konto skapar en rad i `job_applications` eller `job_saved_ads`, för gratis och Premium. Det är stoppregelns tal som en händelse. |
| Spara i annonsens fot | `ska_sokas_sparad` (servern, `kalla: 'match'`) |
| Markera som sökt i annonsens fot | `match_applied` (klienten) |
| Från annonsen in i Sökta tjänster | sidvisningen med `fran=annons-fot` |
| Fråga om besked efter intervju | `uppfoljning_utkast_oppnat`, `uppfoljning_sparr` och `uppfoljning_loggad` med den nya egenskapen `typ`, samt `paywall_shown` och `paywall_cta_clicked` med platsen `uppfoljning` |
| Sätt tiden | `intervjutid_satt` med `kalla: 'andra_tid'` |
| CV-rummet (senare) | sidvisningen med `fran=cv-nedladdat` |
| "När är intervjun?" i hubben (9 A) | `interview_hub_viewed` med den nya egenskapen `intervjufraga`, `tjanstfraga_val` med `plats: 'intervju-hubb'`, `intervjutid_satt` med `kalla: 'intervju-hubb'`, sidvisningen på tjänsten med `fran=intervju-hubb` |
| Kortet på testernas Hem (9 B) | `hem_visad` med den nya egenskapen `tjanstfraga`, `tjanstfraga_val` med `plats: 'test-hem'`, sidvisningen i Sökta tjänster med `fran=test-hem` eller `fran=test-hem-plan`, aktiviteten `application_logged` med `fran`, och tillbaka med `fran=sokta-loggad` |

Omgångens enda nya händelse är `tjanstfraga_val` (9.7 och 9.17). Allt annat är egenskaper på händelser som finns.

Värden på `fran` som finns efter omgången: `oversikt-ny` och `oversikt-forsta` (redan live), `komigang`, `annons-fot`, `intervju-hubb`, `test-hem`, `test-hem-plan`, `sokta-loggad`, och senare `cv-nedladdat`.

Skärmbredden skiljer telefon från dator i PostHog. Ingen egenskap för det läggs till.

---

## 7. Det som kräver ägarens ja, och det som inte går utan migrering

**Kräver ägarens ja:**
1. Migreringen i 9.11 mot produktionsdatabasen (händelsetypen `test_invited`). Utan ja byggs och pushas allt utom 9 B.

**Beslutat av saas-lead och UX tillsammans den 22 november, går med i pushen utan eget ja:** notisens två nya texter och veckobrevets nya stycke, rader, avslutningar och preheader (2.7). De går ut av sig själva till användare.

Allt annat i specen visas bara i appen eller skickas av användaren själv.

**Väntar på ägaren och byggs inte:** brickan i betalandes lista och Kom igång-mejlet om den.

**Går inte utan migrering, och byggs därför inte eller löses på annat sätt:**
1. Fältet "Sa de när du får besked?". Sju dagar är fast.
2. Utkastets sort som kolumn. Sorten läses ur ämnesraden. Följden är luckan i 2.4 (ett oskickat intervjuutkast från en tidigare omgång).
3. Sparade annonser i summeringen. `dashboard_summering()` räknar inte `job_saved_ads`, så ett konto som bara har sparade annonser från före bygget får brickan avbockad först nästa gång det sparar eller loggar (1.7).
4. Hoppa över per konto i stället för per enhet (9.3 och 9.14). Valet ligger i webbläsaren.
5. Genomfört test, påminnelse och utkast efter testet, och kopplingen mellan planens provdatum och tjänsten. De väntar på avläsningen 19 december.

---

## 8. Sett under läsningen, ingår inte

Lämnas till samordnaren. Inget av det byggs i den här omgången.

- På telefon står "Logga sökt tjänst" sist på sidan i Sökta tjänster (`SoktaVy.tsx`, beslut efter etapp 1), inte i en fast fot. Den som har en lång lista måste rulla till botten för att logga nästa tjänst. Värt att pröva en fast knapp när listan har fler än några rader.
- "Markera som sökt" behövs mest när användaren kommer tillbaka från arbetsgivarens ansökningssida. Länken "Ansök hos ..." ligger sist i annonsen. En fråga "Sökte du tjänsten?" när fliken får fokus igen vore nästa steg, och kräver skiss.
- Den engelska reservmallen för en obesvarad ansökan säger "I am still very interested", en fras som instruktionen till AI:n förbjuder. Inte rörd.
- `lasIgen` med 4 av 5 säger "Skriv om svaret", men nästa dag föreslår rangordningen en ny fråga. Rangordningen är den tidigare specens och är inte rörd.
- En bricka som är avbockad öppnar loggningsarket igen vid tryck. Det är samma beteende som övriga brickor (trycket går till handlingen).

---

## 9. Ändring A: vägen in från Inför intervjun och från testerna (beslut 20, och beslut 2 och 3 i omgång 2)

Skriven 2026-11-22. Underlag: skissen `docs/design/skiss-jobbsoket-testvag-2026-11-21.html`, saas-leads beslut ("Beslut i omgång 2" i `docs/beslut-jobbsoket-2026-11-21.md`), art directors och testansvarigs granskning. Skissen ritas inte om. Där specen och skissen skiljer sig gäller specen, och skillnaderna står i 9.0.

Två delar som byggs och pushas var för sig, båda av byggare D:
- **9 A**, "När är intervjun?" i hubben Inför intervjun. Ingen migrering. Byggs nu och går med i omgångens push.
- **9 B**, kortet "Vilken tjänst gäller provet?" på testernas Hem, tillsammans med händelsen kallad till test. Kräver migreringen i 9.11. Ligger i egna commits och pushas först när ägaren har sagt ja och migreringen är körd.

### 9.0 Där specen gäller över skissen

| Skissen | Specen |
|---|---|
| "Vi räknar ner hit" i arkets fot (2.2, 2.4, 2.7) och i raden (2.5) | "Vi räknar ner till intervjun och frågar hur det gick dagen efter." och "Lägg in den, så räknar vi ner till intervjun." |
| Arket i 2.4 börjar med valet av tjänst | Samma ordning som 2.2: Dag, Tid, Plats, sedan "Vilken tjänst gäller intervjun?" |
| Datum sökt i intervjuarket är förifyllt, med hjälpraden "Ändra om du sökte en annan dag" | Tomt och obligatoriskt, med ny hjälptext och felrad (9.4) |
| Hoppa över i hubben läses ur `localStorage` efter att sidan ritats | Läses före första ritningen, så att inget flyttar sig (9.3) |
| Kortets knapp heter "Lägg till tjänsten" | "Lägg in tjänsten" |
| Kortets skäl: "så säger vi till om arbetsgivaren blir tyst" | Nytt skäl (9.15). Tjänsten står som kallad till test och blir aldrig tyst. |
| Utfällt läge har raden `t3-fraga-not` och brödtexten "Två fält räcker. Du ser allt innan något sparas." | Raden stryks. Brödtexten: "Fyll i två fält. Du sparar i nästa steg, i Sökta tjänster." |
| `.t3-fraga-ik` har gröna hexvärden | `var(--ton)` och `var(--ton-ink)`. Grönt betyder rätt svar i testrummet. |
| Grinden är `!dagens.forstaSteget` | Minst en slutförd Nivåkoll i `test_nivapunkter` (9.14) |
| "Hon fyllde i men sparade inte: frågan står kvar" | Fortsätt utan sparad rad räknas som Hoppa över för den planen (9.14) |
| Två nya händelser, `tjanstfraga_visad` och `tjanstfraga_val` med fyra val | En ny händelse, `tjanstfraga_val` med valen `oppnad` och `hoppad`. Visningen är en egenskap på `hem_visad` och `interview_hub_viewed`. |
| `LoggaArk.tsx` rörs inte, arket är oförändrat | Arket får en hjälprad, en kryssruta och en egen rad under knappen på testvägen (9.16) |
| Kvittensen: "ligger nu under Sökt. Vi säger till om det är tyst efter tolv dagar." Knappen "Tillbaka till Tester" | Ny text (9.16). Knappen: "Tillbaka till testerna" |
| Ingen migrering | 9 B har en migrering: händelsetypen `test_invited` |

---

## 9 A. "När är intervjun?" i hubben

### 9.1 Vad som byggs

Sektionen "Intervjuer på gång" i hubben ritas i dag bara när det finns intervjuer (`intervjuer.length > 0` i `src/components/jobb3/intervju/IntervjuHubb.tsx`). Den ritas nu alltid. När listan är tom bär den frågan "När är intervjun?" i rummets streckade kort för tomma lägen (`TomtLage`). Knappen öppnar ett ark med dag, tid och plats och tjänsten det gäller. Spara skapar tjänsten (om den är ny) och händelsen Kallad till intervju med tiden, med två anrop som redan finns.

"Öva på nästa fråga" är fortfarande vyns enda kopparknapp. Kortets knapp är vit (`LitenKnapp`).

Frågan visas när hon inte har någon intervju på gång, oavsett läge. Har hon minst en (bokad, utan tid, tiden passerad eller väntar besked) står listan där som i dag och frågan visas inte.

### 9.2 Kortet och raden

Ny klientö `src/components/jobb3/intervju/IntervjuFraga.tsx`. `IntervjuHubb` ritar den alltid i sektionen, direkt under `SektionsHuvud`, med `tom={intervjuer.length === 0}` och `valbara` (9.6). Ön ligger kvar på samma plats i trädet när listan fylls, så att kvittensen i 9.5 överlever `router.refresh()`.

Sektionens huvud: rubriken "Intervjuer på gång" som i dag. Underraden (`HUBB.pagangUnder`) visas bara när listan har rader.

Öppet kort (`TomtLage` med ikonen `IkonKalender`):

| Del | Text |
|---|---|
| rubrik | När är intervjun? |
| text | Lägg in dag och tid, så räknar vi ner och visar vad du hinner öva på. Tjänsten hamnar under Sökta tjänster. |
| knapp (`LitenKnapp`) | Lägg in intervjun |
| länk (`TextLank`, 44 px tryckyta) | Ingen intervju bokad än |

Raden efter "Ingen intervju bokad än" (`Kort` med en rad, minst 68 px hög, ikonen i `j3-sido-ik`):

| Del | Text |
|---|---|
| rubrik | Har du fått en intervjutid? |
| text | Lägg in den, så räknar vi ner till intervjun. |
| knapp (`LitenKnapp`) | Lägg in |

Raden står kvar tills hon lägger in en intervju. Den tjatar inte och försvinner inte. Båda knapparna öppnar samma ark.

Texterna läggs under `HUBB` i `src/components/jobb3/intervju/text.ts`.

Layoutklasserna finns i skissens CSS, avsnitt 5: `.j3-tomt-handling.tva`, `.ny-ihop`, `.ny-ihop-text` och `.ny-tva`. Lägg dem i `src/app/jobb3-c.css` med prefixet `j3c-` (`.j3c-tomt-tva`, `.j3c-ihop`, `.j3c-ihop-text`, `.j3c-tva`), med samma värden. Inga nya färger.

### 9.3 Hoppa över utan att något flyttar sig

Valet "Ingen intervju bokad än" sparas i webbläsaren, `localStorage`-nyckeln `intervjufraga_ihop` med värdet `1`. Det gäller per enhet. Servern kan inte läsa det, och prestandabudgeten kräver CLS 0. Därför ritas båda lägena i HTML:en och ett litet skript väljer läge före första ritningen, på samma sätt som temat väljs i `src/app/layout.tsx`.

- `IntervjuHubb` (serverkomponent) lägger, bara när listan är tom, det här direkt före sektionen:

```tsx
<script dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('intervjufraga_ihop')==='1')document.documentElement.setAttribute('data-intervjufraga','ihop')}catch(e){}" }} />
```

- `IntervjuFraga` ritar alltid båda: det öppna kortet i en `div` med klassen `j3c-fraga-oppen` och raden i en `div` med klassen `j3c-fraga-ihop`.
- `src/app/jobb3-c.css`:

```css
.j3c-fraga-ihop { display: none; }
:root[data-intervjufraga='ihop'] .j3c-fraga-oppen { display: none; }
:root[data-intervjufraga='ihop'] .j3c-fraga-ihop { display: block; }
```

- Vid montering läser ön nyckeln (inom `try`/`catch`) och sätter eller tar bort attributet. Det behövs vid klientnavigering, där skriptet inte körs.
- Trycket på "Ingen intervju bokad än": spara nyckeln, sätt attributet, flytta fokus till knappen "Lägg in" i raden och skicka `tjanstfraga_val` (9.7). Saknas lagringen gäller valet tills sidan laddas om.
- När en intervju har sparats: ta bort nyckeln och attributet. Nästa gång listan är tom visas det öppna kortet igen.

Det dolda läget har `display: none` och läses inte av skärmläsare.

### 9.4 Arket

Byggs i `IntervjuFraga.tsx` av kitets `Ark` (`bredd={520}`), `Falt`, `GruppEtikett`, `ValRad`, `ValKnapp` och `StorKnapp`. Inget tangentbord fälls upp förrän hon trycker i ett fält (kitets ark sköter det).

Arkets rubrik: "När är intervjun?"

Raden under rubriken:
- utan valbara tjänster: "Vi lägger in tjänsten under Sökta tjänster som kallad till intervju."
- med valbara tjänster: "Vi lägger kallelsen och tiden på tjänsten du väljer."

Fälten, i den här ordningen i båda fallen:

| Fält | Regler |
|---|---|
| Dag | datum, obligatoriskt. Inget förval. Får ligga bakåt i tiden (då blir läget "Hur gick intervjun?"). Dag och Tid står i bredd (`j3c-tva`). |
| Tid | klockslag, tillägget "valfritt" |
| Plats | text, tillägget "valfritt", högst 200 tecken, platshållaren "Till exempel på plats, video eller telefon" |
| Vilken tjänst gäller intervjun? | gruppetikett. Med valbara tjänster: en `ValKnapp form="rad"` per tjänst med texten "`Företaget`, `tjänsten`", och sist "En annan tjänst". Inget är förvalt. Fler än fem valbara: de fem senast sökta visas, och länken "Visa alla" fäller ut resten. |
| Tjänst | text, högst 200 tecken, platshållaren "Till exempel ekonomiassistent". Visas utan valbara tjänster, eller när "En annan tjänst" är vald. |
| Arbetsgivare | text, högst 200 tecken, platshållaren "Till exempel Volvo Cars". Visas som Tjänst. |
| Datum sökt | datum, tomt och obligatoriskt, aldrig förifyllt, senast i dag. Visas som Tjänst. Hjälptext: "Dagen du skickade ansökan. Datumet står i din månadsrapport." |

Knappen: "Spara intervjun", "Sparar" medan anropen går. Raden under knappen: "Vi räknar ner till intervjun och frågar hur det gick dagen efter."

Knappen är aldrig avstängd utan förklaring. Trycker hon med något ofyllt stannar arket, fältet markeras i koppar (`fel` på `Falt`, aldrig rött) och raden under fältet säger vad som saknas:

| Det som saknas | Felrad |
|---|---|
| Dag | Välj dagen för intervjun. |
| inget val bland tjänsterna | Välj vilken tjänst intervjun gäller. |
| Tjänst | Skriv tjänsten också, så hittar du den igen. |
| Arbetsgivare | Skriv arbetsgivaren också, så hittar du tjänsten igen. |
| Datum sökt | Välj dagen du sökte, så blir månadsrapporten rätt. |
| Datum sökt ligger efter intervjuns dag | Dagen du sökte kan inte ligga efter intervjun. |

Fokus flyttas till det första fältet med fel.

### 9.5 Spara

Ny tjänst, två anrop i följd:
1. `POST /api/applications` med `{ job_title, company, applied_at, application_channel: 'ad' }`. Svaret ger tjänstens id. Arket frågar inte hur hon sökte. Kanalen blir annons och går att ändra under Redigera på tjänsten.
2. `POST /api/applications/<id>/events` med `{ event_type: 'interview_invited', intervju: { datum, tid, plats }, fran: 'intervju-hubb' }`. Dagen hon blev kallad sätts till i dag av rutten, som i dag.

Vald befintlig tjänst: bara anrop 2, på den tjänstens id.

Faller anrop 2 efter att anrop 1 lyckats står arket kvar med raden "Tjänsten är sparad, men intervjun gick inte att lägga in. Försök igen." Nästa tryck gör bara anrop 2 igen. Tjänsten skapas aldrig två gånger: id:t hålls i öns läge tills arket stängs. Faller anrop 1: "Det gick inte att spara just nu. Försök igen." (texten `anropa` redan ger).

När båda lyckats:
- arket stängs, `router.refresh()` och `refresh()` från `useDashboardData()` (Kom igång-brickan i del 1),
- nyckeln och attributet i 9.3 tas bort,
- för en ny tjänst loggas aktiviteten med `logActivity('application_logged', ...)` ur `@/lib/activity-logger`, med `{ applicationId, channel: 'ad', fran: 'intervju-hubb' }`, utan toast,
- ön visar en kvittens under sektionens rubrik (`<p className="j3-under" role="status">`): "Intervjun är inlagd. Tjänsten ligger också under Sökta tjänster." följd av länken "Öppna tjänsten" till tjänstens sida med blocket Förbered och `fran=intervju-hubb`. Kvittensen står tills sidan lämnas.

Hubben ritar sedan väggen med nedräkningen och raden med "Förbered intervjun", som den redan gör när en intervju har tid.

### 9.6 Data och filer

- `src/lib/jobbsok/intervju.ts`: ny ren funktion `valbaraForIntervju(tjanster: readonly TjanstLage[]): { id: string; company: string; jobTitle: string; bokstaver: string; appliedAt: Dag }[]`. Öppna tjänster vid stationen Sökt (`!t.avslutad && t.station === 'sokt'`), senast sökt först.
- `src/lib/jobbsok/server.ts`: ny laddare `hamtaIntervjuHubb(userId, { nu? })` som ger `{ intervjuer: IntervjuPaGang[]; valbara: ReturnType<typeof valbaraForIntervju> }` ur samma läsning som `hamtaIntervjuerPaGang` gör i dag (en fråga, `lasAnsokningar`). `hamtaIntervjuerPaGang` står kvar för andra anropare.
- `src/app/dashboard/intervju/page.tsx`: anropar `hamtaIntervjuHubb` i samma `Promise.all` som i dag och skickar `valbara` till `IntervjuHubb`. Ingen ny fråga mot databasen.
- `src/app/api/applications/[id]/events/route.ts`: läser det valfria fältet `fran` i kroppen. Är det `'intervju-hubb'` skickas det som källa till `matIntervjutid` i stället för `'kallelse'`.
- `src/lib/jobbsok/intervjuServer.ts`: `IntervjuKalla` får `'intervju-hubb'`.
- `src/lib/jobbsok/adress.ts`: `tjanstHref(id, fokus, fran?)` får ett valfritt tredje argument som sätts som parametern `fran`. `tolkaTjanstAdress` läser den inte.
- `src/lib/analytics/events.ts`: se 9.7.

### 9.7 Mätning

- `interview_hub_viewed` får den valfria egenskapen `intervjufraga: boolean`: sann när sektionen bär frågan (listan är tom), oavsett om kortet är öppet eller en rad. `InforIntervjunClient` får värdet som egenskap från sidan.
- Ny händelse, den enda i omgången: `tjanstfraga_val: { plats: 'test-hem' | 'intervju-hubb'; val: 'oppnad' | 'hoppad' }`. I hubben: `oppnad` när arket öppnas (från kortet eller raden), `hoppad` vid "Ingen intervju bokad än". Inga tjänstetitlar eller arbetsgivarnamn.
- `intervjutid_satt` får källan `'intervju-hubb'` i typen för `kalla`.
- Första raden mäts som i del 1: `onboarding_step_completed` med `step: 'sokt_tjanst'`.
- Länken i kvittensen bär `fran=intervju-hubb`.

### 9.8 Klart när

Ses i 412 x 915 och 1440 px, i ljust och mörkt läge, med ett konto utan intervju på gång:
- Sektionen "Intervjuer på gång" står ovanför "Dina intervjuprov" med kortet "När är intervjun?". Vyn har fortfarande en enda kopparknapp.
- "Ingen intervju bokad än" ger raden. Efter omladdning står raden där direkt, utan att kortet syns först och utan att något under flyttar sig (CLS 0 i `scripts/perf-inloggat.ts`, också med nyckeln satt).
- Arket: Dag, Tid, Plats först. Utan sökta tjänster står Tjänst, Arbetsgivare och Datum sökt under. Datum sökt är tomt. Med sökta tjänster står valen där, och "En annan tjänst" fäller ut de tre fälten.
- Spara med tomt Datum sökt ger felraden i koppar och ingen sparning.
- Efter Spara: väggen räknar ner till intervjun, tjänsten står i listan med "Förbered intervjun", kvittensen står under rubriken, och tjänsten finns under Sökta tjänster som kallad till intervju med rätt sökdatum.
- Med en vald befintlig tjänst skapas ingen ny rad i `job_applications`.
- Ingen text klipps i 360 px. Alla tryckytor är minst 44 px. Arket går att stänga med Esc och med krysset, och fokus går tillbaka till knappen som öppnade det.
- Kom igång-brickan "Logga en tjänst du har sökt" är avbockad efteråt, utan omladdning.

### 9.9 Vitest

- `src/lib/jobbsok/__tests__/intervjulagen.test.ts`: `valbaraForIntervju` tar med sökta och obesvarade, inte kallade, genomförda, erbjudanden eller avslutade, och sorterar senast sökt först.
- Ny fil `src/components/jobb3/intervju/__tests__/IntervjuFraga.test.tsx` (rendera med `@testing-library/react`, mocka `fetch`):
  - tom lista: både det öppna kortet och raden finns i dokumentet, med texterna i 9.2.
  - "Ingen intervju bokad än" sätter `localStorage.intervjufraga_ihop` till `1` och attributet på `<html>`.
  - arket utan valbara: fälten i ordningen Dag, Tid, Plats, Tjänst, Arbetsgivare, Datum sökt. Datum sökt är tomt.
  - arket med valbara: fälten i ordningen Dag, Tid, Plats, sedan valen. "En annan tjänst" visar de tre fälten.
  - varje felrad i 9.4, ordagrant, och att inget anrop görs när något saknas.
  - ny tjänst: två anrop i ordning, det andra med `fran: 'intervju-hubb'`. Vald tjänst: ett anrop.
  - anrop 2 faller: raden om att tjänsten är sparad visas, och nästa tryck gör bara anrop 2.
  - arkets fot är "Vi räknar ner till intervjun och frågar hur det gick dagen efter." och orden "räknar ner hit" finns ingenstans.
- `src/lib/jobbsok/__tests__/motor.test.ts`: `tjanstHref('x', 'forbered', 'intervju-hubb')` ger `/dashboard/sokta-tjanster/x?steg=forbered&fran=intervju-hubb`.

---

## 9 B. Kortet på testernas Hem och händelsen kallad till test

### 9.10 Vad som byggs, och i vilken ordning

Den som övar inför ett rekryteringstest har ofta en rekrytering på gång. Ett frivilligt kort på Hem i Rekryteringstester frågar vilken tjänst det gäller och leder till arket Logga sökt tjänst med fälten ifyllda. Tjänsten som skapas den vägen kan stå som **kallad till test**, en ny händelsetyp. Den tjänsten blir aldrig tyst, får aldrig ett uppföljningsutkast och nämns aldrig i en notis eller i veckobrevet.

Commits, i den här ordningen:
1. Migreringsfilen (9.11). Körs av samordnaren med ägarens ja, i manuellt läge.
2. Händelsetypen i koden och texterna för den (9.12 och 9.13).
3. Kortet, arket på testvägen och kvittensen (9.14 till 9.16), med mätningen (9.17).

Commit 2 och 3 pushas först när migreringen är körd. Kod som skriver `test_invited` mot en databas utan migreringen får fel från databasen. När en rad med `test_invited` väl finns går koden inte att backa till en version utan etiketten. Backning sker framåt.

Byggs inte: genomfört test som händelse, påminnelse och utkast efter testet, kopplingen mellan planens provdatum och tjänsten, och frågan på Hem för den som redan har en sökt tjänst. De väntar på avläsningen 19 december.

### 9.11 Migreringen

Ny fil `supabase/migrations/20261122120000_kallad_till_test.sql`. Villkorens namn är kontrollerade i produktionsdatabasen den 22 november: `job_application_events_event_type_check` och `job_applications_current_status_check`. Filen går att köra flera gånger.

```sql
-- Jobbsöket omgång 2, 9 B: händelsetypen test_invited (kallad till test).
-- Bara tillägg: de två villkoren som listar tillåtna värden får ett tionde.
-- Ingen kolumn, ingen funktion och ingen rad ändras. Går att köra flera gånger.
--
-- Rollback (först när ingen rad har test_invited och koden som skriver den är backad):
--   alter table public.job_application_events
--     drop constraint if exists job_application_events_event_type_check;
--   alter table public.job_application_events
--     add constraint job_application_events_event_type_check
--     check (event_type = any (array[
--       'applied','no_response','rejected','interview_invited','interview_completed',
--       'trial_work_completed','offer_received','accepted','declined'
--     ]));
--   alter table public.job_applications
--     drop constraint if exists job_applications_current_status_check;
--   alter table public.job_applications
--     add constraint job_applications_current_status_check
--     check (current_status is null or current_status = any (array[
--       'applied','no_response','rejected','interview_invited','interview_completed',
--       'trial_work_completed','offer_received','accepted','declined'
--     ]));

begin;

alter table public.job_application_events
  drop constraint if exists job_application_events_event_type_check;
alter table public.job_application_events
  add constraint job_application_events_event_type_check
  check (event_type = any (array[
    'applied','no_response','rejected','test_invited','interview_invited','interview_completed',
    'trial_work_completed','offer_received','accepted','declined'
  ]));

alter table public.job_applications
  drop constraint if exists job_applications_current_status_check;
alter table public.job_applications
  add constraint job_applications_current_status_check
  check (current_status is null or current_status = any (array[
    'applied','no_response','rejected','test_invited','interview_invited','interview_completed',
    'trial_work_completed','offer_received','accepted','declined'
  ]));

commit;
```

Inget annat i databasen behöver ändras:
- Utlösaren `sync_job_application_current_status` skriver den senaste händelsens typ i `current_status`, vilken typ det än är. Med de två villkoren ändrade sätter den `test_invited` rätt.
- Villkoret `job_application_events_round_only_on_interview` kräver att `interview_round` är tom för andra typer än intervjuerna. Koden skickar ingen omgång för `test_invited`.
- `get_job_application_stats` räknar allt utom sökt och inget svar som svar, och bara intervjutyperna som intervju. En tjänst som är kallad till test räknas alltså som svar, med utfallet väntar. Funktionen ändras inte.
- `dashboard_summering` nämner inga händelsetyper och läser inte status.
- Inga policyer, index eller publiceringar berörs.

Utlösaren väljer senaste händelsen efter `occurred_at` och sedan `created_at`. När tjänsten söks och kallelsen till test loggas samma dag avgör `created_at`. De två händelserna måste därför skrivas i två skilda insert, `applied` först (9.16).

### 9.12 Händelsetypen i koden: varje ställe som räknar upp typerna

| Ställe | Vad som görs |
|---|---|
| `src/lib/applications/status.ts`, `ApplicationEventType` | Får `'test_invited'`, mellan `rejected` och `interview_invited`. |
| samma fil, `STATUS_META` | Ny rad: `label: 'Kallad till test'`, `timelineLabel: 'Kallad till test'`, samma `pillClass` och `dotClass` som `interview_invited`. |
| samma fil, `LOGGABLE_EVENT_TYPES` | Får `'test_invited'` först. Den går att logga för hand. |
| samma fil, `INTERVIEW_STAGE`, `OFFER_STAGE`, `statusIsClosed` | Ändras inte. Kallad till test är varken intervju, erbjudande eller avslutad. |
| samma fil, `statusHasResponse`, `statusProgressStep` | Ändras inte. De ger redan "har fått svar" och steg 1 (Svar) för allt som inte är sökt eller inget svar. |
| `src/app/api/applications/[id]/events/route.ts`, `VALID_EVENT_TYPES` | Får `'test_invited'`. Ingen omgång, ingen intervjutid. Kontrollen att dagen inte ligger före sökdagen gäller som för andra typer. |
| `src/components/jobb3/sokta/SmaArk.tsx`, `VAL` | Ny rad först: `{ typ: 'test_invited', ikon: <IkonRutnat /> }`. `handelseNamn` ger "Kallad till test" ur `STATUS_META`. Datumfältets etikett "Dagen du blev kallad" gäller också `test_invited`. |
| `src/components/jobb3/sokta/TjanstVy.tsx`, snabbvalen | Vid stationen Sökt: "Kallad till test", "Kallad till intervju", "Fick avslag". Står tjänsten redan som kallad till test visas inte "Kallad till test" igen. |
| `src/lib/jobbsok/bana.ts`, `SVAR_TYPER` | Får `'test_invited'`. Tjänstens bana står då på steget Svar med kallelsens datum. `INTERVJU_TYPER` och `ERBJUDANDE_TYPER` ändras inte. |
| `src/lib/jobbsok/lage.ts`, `foljUppTyp` | Ger null för `test_invited`, före raden som ger `'ansokan'`. Tjänsten blir aldrig tyst, `harUtkast` är falskt och blocket Följ upp visas aldrig. |
| samma fil, `stationFor`, `INTERVJU_STATUS`, `arAvslutad`, `harFattSvar` | Ändras inte. Tjänsten står kvar vid stationen Sökt och räknas som att den har fått svar. |
| samma fil, `tjanstLage` | `TjanstLage` får `kalladTillTest: Dag \| null`: dagen (`occurred_at`) för den senaste händelsen `test_invited` när statusen är `test_invited`, annars null. |
| `src/lib/jobbsok/lista.ts`, `gruppFor` | Ändras inte. Tjänsten står i gruppen Väntar svar. Texterna i 9.13. |
| `src/lib/jobbsok/attGora.ts` | Ny kandidat `uppdatera_test` (9.13). Annars ingenting: aldrig `folj_upp`. |
| `src/lib/jobbsok/statistik.ts`, tratten | Ändras inte. Tjänsten räknas under "Fått svar" (`harFattSvar`), inte som kallelse till intervju och inte som avslag. |
| `src/lib/jobbsok/handelser.ts` | Ändras inte. Raden får rubriken ur `STATUS_META`. |
| `src/lib/jobbsok/coach.ts`, `src/lib/jobbsok/tystnad.ts` | Ändras inte. De läser läget ur motorn. |
| `src/lib/jobbsok/intervju.ts`, `valbaraForIntervju` (9.6) | Ändras inte. En tjänst som är kallad till test står vid stationen Sökt och går att välja i arket "När är intervjun?". |
| Rapporten till Arbetsförmedlingen (`src/lib/applications/afRapportData.ts`, `src/components/jobb3/sokta/Rapport.tsx`) | Ändras inte. Tjänsten står bland sökta jobb med sitt sökdatum. Kallad till test är ingen aktivitet i rapporten: bara genomförd intervju och provjobb listas där. |
| Delningssidan (`src/app/dela/sokta-tjanster/[token]/page.tsx`, `radLage`) | Nytt fall: `case 'test_invited': return { ton: 'standard', steg: { steg: 2 }, pill: 'vantar' }`. Brickans text blir "Kallad till test" ur `STATUS_META`. Tratten räknas av samma funktion som i rummet. |
| Notisen (`src/lib/notifications/followUp.ts`) | Koden ändras inte. Frågan mot databasen läser inte statusen, motorn ger aldrig tyst, och reservläget hoppar över allt som har fått svar. Eget test (9.19). |
| Veckobrevet (`weekly-digest.ts`) | Koden ändras inte. Tjänsten har fått svar och står varken bland tysta ansökningar eller under besked. Den räknas i veckans svar om kallelsen kom den veckan, vilket stämmer. Eget test (9.19). |
| `src/lib/dashboard/getSummary.ts` | `silent` blir falskt för `test_invited`, så att de äldre räkningarna (`followUpCount`, `hem.tysta`) aldrig kallar tjänsten tyst. `INTERVIEW_STATUSES` ändras inte. |
| `src/hooks/useApplicationsSummary.ts`, `src/lib/rum/jobbsok.ts` | Används inte av någon vy i dag. Ändras inte. |
| `dashboard_summering`, `get_job_application_stats` | Ändras inte, se 9.11. |

### 9.13 Texterna för en tjänst som är kallad till test

`D` är `langDag(t.kalladTillTest)`, `d` är `kortDag(t.kalladTillTest)`.

**Listan under Sökta tjänster** (`Lista.tsx`, gruppen Väntar svar):

| Del | Text |
|---|---|
| radens text | Kallad till test `d`. Lägg till intervjun eller beskedet när det kommer. |
| radens text, telefon | Kallad till test `d` |
| statusbrickan | Kallad till test (status `vantar`) |
| stegen | steg 2 (Svar), inte avslutad |
| knappen | Uppdatera (som i dag), till tjänstens sida |
| gruppens underrad när alla rader i gruppen är kallade till test | Kallad till test. Lägg till intervjun eller beskedet när det kommer. |
| gruppens underrad annars | som i dag |

Radens text och gruppens underrad kommer ur två nya rena funktioner i `src/lib/jobbsok/lista.ts`: `testRadText(t)` och `vantarSvarText(rader)`. `fyrsteg` i `src/components/jobb3/sokta/text.ts` ger steg 2 för statusen.

**Översikt** (`tjanstRad` i `oversikt.ts`): `text` som listan, `textMobil` "`Tjänsten`. Kallad till test `d`.", `steg` `{ steg: 2 }`, `status` `{ status: 'vantar', text: 'Kallad till test' }`.

**Väggen på Översikt när inget finns att göra** (`vaggUtanHandling` i `attGora.ts`). När alla öppna tjänster vid stationen Sökt är kallade till test:
- en tjänst: rubriken "Kallad till test hos `företaget`"
- flera: rubriken "`Ordtal` tjänster med test på gång"
- texten: "Inget att göra just nu. Lägg till intervjun eller beskedet på tjänsten när det kommer."

Blandat med vanliga ansökningar gäller dagens text.

**Tjänstens sida** (`TjanstVy.tsx`):

| Del | Text |
|---|---|
| ögonbrynet | Kallad till test |
| väggens ingress, dator | Du blev kallad till test `veckodag` `D`. Arbetsgivaren har hört av sig, så vi föreslår ingen uppföljning. Lägg till intervjun eller beskedet här när det kommer. |
| händelsen i listan | Kallad till test, med dagen |
| den väntande raden sist i Händelser | Besked efter testet (i stället för "Svar") |
| blocket Följ upp | visas aldrig, inte heller med `?steg=folj-upp` |

**Vad som händer med en tjänst som står kvar som kallad till test i veckor.** Den blir aldrig tyst, och det är rätt: arbetsgivaren har hört av sig, och vi vet inte när testet görs. Men listan ska inte ruttna. Fjorton dagar efter kallelsen frågar Att göra nu en gång vad som hände, på samma sätt som "Hur gick intervjun?". Det är en fråga till henne om hennes lista, aldrig ett förslag att skriva till arbetsgivaren. Ingen notis, inget i veckobrevet.

Ny konstant `TEST_UPPDATERA_DAGAR = 14` i `typer.ts`, ny `AttGoraTyp` `uppdatera_test`, ny kandidat i `attGoraKandidater`:

| Fält | Värde |
|---|---|
| villkor | statusen är `test_invited` och `plusDagar(t.kalladTillTest, TEST_UPPDATERA_DAGAR) <= idag` |
| `nyckel` | `uppdatera_test:<id>` |
| `datum` | kallelsens dag plus 14, `passerad` när datumet är före i dag |
| `ikon` | `fraga` |
| `overrad` | KALLAD TILL TEST `d`, till exempel "KALLAD TILL TEST 21 NOV" |
| `rubrik` | Vad hände efter testet hos `företaget`? |
| `text` | `Tjänsten`. Lägg till intervjun eller beskedet, så stämmer listan. |
| `knapp` | Uppdatera tjänsten, till `tjanstHref(t.id)` |

`PRIORITET` får `uppdatera_test` efter `satt_intervjutid`. `sorteringsgrupp` ger 2, allt övrigt. Väggen när handlingen står först: rubriken och knappen som kortet, texten "`Tjänsten`. Du blev kallad till test den `D`. Lägg till intervjun eller beskedet, så stämmer listan." Kortet på telefon (`goraMobil`): rubriken "Vad hände efter testet?", texten "`Företaget`. Kallad till test `d`." Kortet försvinner när hon lägger till en händelse eller tar bort tjänsten.

### 9.14 Kortet på Hem: när det visas

**Platsen** (saas-lead, med testansvarigs stöd): under "Vägen till provet" i `src/components/tester-v4/omgang3/HemGolv.tsx`, efter `<Vagen>` och före `<GratisRad>`. Aldrig i grenen `ny` ("Så här går det till").

**Grinden avgörs på servern.** Ny ren fil `src/lib/tester/v4/tjanstfraga.ts`:

```ts
export interface Tjanstfraga {
  variant: 'plan' | 'plan_passerad' | 'utan_plan'
  fran: 'test-hem-plan' | 'test-hem'
  /** Nyckeln för Hoppa över: 'ingen' utan plan, annars `${mittTest}|${provdatum ?? ''}`. */
  nyckel: string
}
/** Kortet på Hem, eller null när det inte ska visas. */
export function tjanstfraga(data: Pick<TesterV4Data, 'plan' | 'dagens' | 'gratis' | 'tjanstfraga'>, iAppen: boolean): Tjanstfraga | null
export function tjanstfragaNyckel(plan: Pick<PlanV4, 'mittTest' | 'provdatum'> | null): string
/** Är frågan hoppad för den här planen? */
export function arHoppad(sparad: string | null, nyckel: string): boolean
```

`tjanstfraga` ger null om något av det här gäller, annars kortet:
1. `iAppen` är sant. Kortet ritas aldrig i appen Testklar.
2. `data.tjanstfraga` saknas, eller `data.tjanstfraga.harNivakoll` är falskt. Kravet är minst en slutförd Nivåkoll, alltså minst en rad i `test_nivapunkter` med `typ` `matning` eller `ommatning`. En påbörjad Nivåkoll utan nivå räcker inte, och ett nivåtest eller en träning räcker inte.
3. `data.tjanstfraga.harSoktTjanst` är sant. Hon har redan minst en rad i `job_applications`.
4. `data.dagens.forstaSteget` är sant.
5. `data.dagens.knapp.las` är inte null. Väggens knapp är då en köpknapp ("Ingår i Premium" och liknande). Det gäller oavsett om Gratisraden ritas.
6. Gratisraden ritas: `!data.gratis.premium && data.gratis.grundKvarIdag <= 0`.

Varianten: `utan_plan` när `data.plan` är null (`fran` `test-hem`), `plan_passerad` när planen har ett provdatum som har passerat (`dagarKvar < 0`), annars `plan` (båda med `fran` `test-hem-plan`).

**Underlaget** (`src/lib/tester/v4/hamta.server.ts`, `hamtaUnderlagV4`): `ModellIn` och `TesterV4Data` får det valfria fältet `tjanstfraga?: { harNivakoll: boolean; harSoktTjanst: boolean }`, som `byggTesterV4` för vidare orört.
- `harNivakoll`: `nivapunkter.some((n) => n.typ === 'matning' || n.typ === 'ommatning')`. Raderna läses redan (`lasNivapunkter`).
- `harSoktTjanst`: `(summering?.sidomeny?.ansokningar ?? 1) > 0`. Summeringen läses redan i samma `Promise.all` och bär antalet rader i `job_applications`. Det uppfyller testansvarigs villkor (ingen egen läsning) utan någon ny fråga alls. Saknas summeringen räknas det som att hon har en sökt tjänst, och kortet visas inte.

**Appen.** `src/app/app/tester/page.tsx` exporterar i dag samma sida som webben. Bryt ut sidans innehåll till `src/app/dashboard/tester/HemSida.tsx` (`TesterHemSida({ searchParams, iAppen })`, samma kod som `TraningHem` har i dag). `src/app/dashboard/tester/page.tsx` ritar `<TesterHemSida searchParams={searchParams} />`, och `src/app/app/tester/page.tsx` ritar `<TesterHemSida searchParams={searchParams} iAppen />`. `HemVy` och `HemGolv` får `iAppen` som egenskap. En sidas förvalda export får inte ta egna egenskaper i Next, därför den egna filen.

**Hoppa över ligger i webbläsaren**, `localStorage`-nyckeln `tjanstfraga_test`, med kortets `nyckel` som värde. Det gäller per enhet. Per konto kräver en kolumn och väntar.
- `arHoppad(sparad, nyckel)` är sann när `sparad === nyckel`.
- Den är också sann när den sparade nyckeln saknar datum och den nya är samma prov med ett datum (`sparad` slutar med `|` och `nyckel` börjar med `sparad`). Ett datum som läggs in för första gången räknas inte som en ny rekrytering. Det gäller planen från en artikel, och varje annan plan utan datum. Ön skriver då om det sparade värdet till den nya nyckeln.
- Byter hon prov, eller ändrar ett datum som redan fanns, är nyckeln ny och frågan ställs en gång till.
- Hoppa över skriver nyckeln. Fortsätt skriver också nyckeln, innan navigeringen: sparar hon ingen rad i arket räknas det som Hoppa över för den planen. Sparar hon är kortet borta för gott, eftersom hon då har en sökt tjänst.
- Saknas lagringen (privat fönster) gäller valet tills sidan laddas om.

**Inget flyttar sig.** `HemGolv` ritar klientön `<TjanstFraga fraga={...} />` bara när serverns grind ger ett kort. Ön ritar ingenting på servern och ingenting i första klientritningen. Kortet visas först när `localStorage` är läst. Under Vägen till provet ska kortet ligga nedanför första skärmen i 412 x 915 och i 1440 x 900, så att det som står under inte flyttas i bild. Det är inte mätt, bara läst ur skissen, och kontrolleras med mätningen i 9.18. Visar mätningen ett skifte används samma lösning som i hubben (9.3): kortet ritas i serverns HTML och ett skript döljer det före första ritningen när nyckeln stämmer.

**Flytten upp, som inte byggs nu.** Saas-leads regel: har färre än 10 konton sett kortet den 5 december flyttas det upp under "Så ligger du till" i en egen push. Då ligger kortet i första skärmen, och en ö som fylls i efter laddningen skulle flytta det som står under. Flytten kräver därför att servern känner till Hoppa över, så att kortet ritas rätt i serverns HTML: antingen en kaka som sätts vid Hoppa över och Fortsätt och läses i `TesterHemSida`, eller en kolumn på profilen (en migrering). En ny kaka kan kräva en rad i kaktexterna, som bara ägaren ändrar. Flytten behöver alltså ägarens besked om kakan, en ändring av `TjanstFraga` från ö till serverritat kort, och en ny mätning av CLS.

### 9.15 Kortet: texter, lägen och utseende

Ny klientö `src/components/tester-v4/hem/TjanstFraga.tsx`. Klasserna står i skissens CSS, avsnitt 4 (`.t3-fraga`, `.t3-fraga-ik`, `.t3-fraga-text`, `.t3-fraga-val`, `.t3-fraga-hoppa`, `.t3-liten-mork`, `.t3-fraga-falt`, `.t3-falt`, `.t3-falt-fel`). De läggs i `src/app/globals.css` bland testernas klasser, med två ändringar: `.t3-fraga-ik` får `background: var(--ton); color: var(--ton-ink);`, och reglerna för `.t3-fraga-not` tas inte med.

Hopfällt läge:

| Del | Text |
|---|---|
| ögonbryn | Valfritt |
| rubrik, med plan | Vilken tjänst gäller provet? |
| rubrik, provdatumet har passerat | Vilken tjänst gällde provet? |
| rubrik, utan plan | Vilken tjänst övar du inför? |
| skäl, med plan (också passerat) | Lägg in den i Sökta tjänster, så har du ansökan, provet och beskedet på ett ställe. |
| skäl, utan plan | Lägg in den i Sökta tjänster, så har du ansökan, testet och beskedet på ett ställe. |
| knapp (`t3-liten`) | Lägg in tjänsten |
| länk (`t3-fraga-hoppa`) | Hoppa över |

Skälet är sant: tjänsten får sin plats under Sökta tjänster, sökdatumet kommer med i månadsrapporten, och blir det intervju förbereder hon sig från samma tjänst. Vi lovar inte att säga till om tystnad.

Utfällt läge (efter "Lägg in tjänsten"), i samma kort:

| Del | Text |
|---|---|
| brödtext, i stället för skälet | Fyll i två fält. Du sparar i nästa steg, i Sökta tjänster. |
| fält 1 | Tjänst, platshållaren "Till exempel ekonomiassistent" |
| fält 2 | Arbetsgivare, platshållaren "Till exempel Volvo Cars" |
| knapp (`t3-liten t3-liten-mork`) | Fortsätt |
| länk | Avbryt |
| fel, tom tjänst | Skriv tjänsten också, så hittar du den igen. |
| fel, tom arbetsgivare | Skriv arbetsgivaren också, så hittar du tjänsten igen. |

Regler:
- Fortsätt är mörk, aldrig koppar. Sidans enda kopparknapp står kvar i väggen.
- När kortet fälls ut flyttas fokus till kortets rubrik (`tabIndex={-1}`), inte till ett fält. Inget tangentbord fälls upp förrän hon trycker i ett fält.
- Fortsätt med ett tomt fält: hon stannar kvar, fältet får `aria-invalid` och kopparkant, felraden står under fältet. Aldrig rött, aldrig en avstängd knapp.
- Fortsätt med båda fälten ifyllda: skriv nyckeln för Hoppa över (9.14) och gå till `soktaHref({ logga: 'sokt', tjanst, arbetsgivare, fran })`. Fälten kortas till 200 tecken.
- Avbryt fäller ihop kortet utan att spara något.
- Hoppa över tar bort kortet direkt. Fokus går till nästa element på sidan.
- Alla tryckytor är minst 44 px. Fälten är 52 px höga med 16 px text.

`src/lib/jobbsok/adress.ts`: `soktaHref` får de valfria fälten `tjanst` och `arbetsgivare`, som sätts som parametrarna med samma namn, efter `logga` och före `fran`. Sidan Sökta tjänster läser dem redan (`forifylltUr`).

Ingen nivå, inget resultat och ingen testtyp följer med i adressen, i aktiviteten eller till Sökta tjänster. Bara `tjanst`, `arbetsgivare` och `fran`.

### 9.16 Arket på testvägen, servern och kvittensen

**Sidan och vyn.**
- `src/app/dashboard/sokta-tjanster/page.tsx`, `forifylltUr`: `LoggaForifyllt` får `fran?: string`, läst ur parametern `fran` (högst 40 tecken).
- `src/components/jobb3/sokta/SoktaVy.tsx`: läser `fran` ur adressen en gång vid montering och håller värdet i sitt läge. Arket rensar adressen när det stängs, så värdet måste sparas före det.

**Arket** (`src/components/jobb3/sokta/LoggaArk.tsx`). Testvägen gäller när `forifyllt.fran` är `test-hem` eller `test-hem-plan`, arket inte redigerar och inte kommer från en sparad annons. Då, i läget "Jag har sökt":

| Del | Text och regel |
|---|---|
| Datum sökt | Förifyllt med dagens datum som i dag. Hjälprad: "Ändra till dagen du skickade ansökan. Datumet står i din månadsrapport." |
| kryssruta (`Kryss`), under Datum sökt | Arbetsgivaren har kallat mig till test |
| kryssrutans förval | ikryssad med `fran=test-hem-plan`, tom med `fran=test-hem` |
| raden under knappen, kryssad | Tjänsten står som kallad till test. Lägg till intervjun eller beskedet när det kommer. |
| raden under knappen, inte kryssad | dagens rad: "Brickan hamnar under Sökt. Vi säger till om det är tyst efter tolv dagar." |

Kryssrutan finns för att raden ska vara sann. Den som har valt ett prov med plan har i regel fått en kallelse. Den som övar brett har ofta inte det, och för henne är en vanlig sökt tjänst med påminnelse efter tolv dagar det riktiga. Det här är UX:s tillägg till saas-leads beslut 3, som sa att fältet alltid skickas från testvägen. Säger saas-lead nej stryks kryssrutan, fältet skickas alltid, och raden för kryssad gäller alltid.

Anropet: `POST /api/applications` får, på testvägen, `fran` och, när rutan är kryssad, `kallad_till_test: true`.

**Servern** (`src/lib/applications/skapa.ts`, `skapaSoktTjanst`):
- `kallad_till_test` gäller bara när det är `true` och `body.fran` är `test-hem` eller `test-hem-plan`. Annars ignoreras det.
- Efter att händelsen `applied` är skriven skrivs, i en egen insert, `{ application_id, event_type: 'test_invited', occurred_at: <dagens datum i svensk tid> }`. Två skilda insert, i den ordningen, se 9.11.
- Faller den andra skrivningen görs ett försök till. Faller det också loggas felet, och tjänsten lämnas som sökt. Svaret bär då `current_status: 'applied'`, och kvittensen följer det.
- Lyckas den bär svaret `current_status: 'test_invited'`.

**Kvittensen** (i stället för toasten "Sparad i Sökta tjänster.", bara när vyn monterades med ett `fran` som börjar med `test-hem` och en tjänst sparades i samma besök). `SoktaVy.loggad` håller den i sitt läge och skickar den till `ListaGolv`, som ritar den överst i panelen, före växeln Lista, Statistik, Rapport. Den byggs av kitets `Notis` (`ton="ton"`, ikonen bock). `Notis` i `src/components/jobb3/kit/Data.tsx` får en valfri egenskap `handling` som ritas under texten, eftersom knappar inte får ligga i ett stycke. Den har `role="status"` och försvinner när sidan laddas om.

| Del | Kallad till test | Inte kallad |
|---|---|---|
| rubrik | `Företaget` står nu som kallad till test | `Företaget` ligger nu under Sökt |
| text | Arbetsgivaren har hört av sig, så vi föreslår ingen uppföljning. Lägg till intervjun eller beskedet när det kommer. Datumet du sökte står i din månadsrapport. | Vi säger till om det är tyst efter tolv dagar. Datumet du sökte står i din månadsrapport. |
| knapp (`LitenKnapp`) | Tillbaka till testerna, till `/dashboard/tester?fran=sokta-loggad` | samma |
| länk (`TextLank`) | Öppna tjänsten, till `tjanstHref(id)` | samma |

Aktiviteten loggas med `logActivity('application_logged', ...)` och `{ applicationId, channel, fran }`. Utanför testvägen är toasten och aktiviteten som i dag, med `fran` tillagd i aktivitetens uppgifter när adressen bar en.

Växlar hon till "Jag ska söka" i arket sparas en annons under Ska sökas som vanligt, utan kryssruta, utan händelse och utan kvittens.

### 9.17 Mätning

- `hem_visad` får den valfria egenskapen `tjanstfraga: boolean`. `HemVisad` i `src/components/tester-v4/hem/HemMatning.tsx` får kortets nyckel (eller null när serverns grind säger nej) och räknar värdet i sin effekt: sann när nyckeln finns och `arHoppad` är falsk. Händelsen skickas som i dag en gång per besök.
- `tjanstfraga_visad` finns inte. Saas-leads regel för den 5 december ("färre än 10 konton har sett kortet") läses som antalet konton med `hem_visad` där `tjanstfraga` är sann. Talet säger att kortet ritades på sidan, inte att det rullades in i bild. Om någon har nått kortet syns i `tjanstfraga_val`.
- `tjanstfraga_val` (definierad i 9.7) med `plats: 'test-hem'`: `oppnad` vid "Lägg in tjänsten", `hoppad` vid "Hoppa över". Fortsätt och Avbryt skickar ingenting.
- Sidvisningen i Sökta tjänster bär `fran=test-hem` eller `fran=test-hem-plan`, som skiljer den som övar brett från den som har ett valt prov.
- Aktiviteten `application_logged` bär `fran`. Första raden mäts som i del 1 (`onboarding_step_completed` med `step: 'sokt_tjanst'`).
- Vägen tillbaka: sidvisningen på `/dashboard/tester` med `fran=sokta-loggad`.
- Inga tjänstetitlar, arbetsgivarnamn, nivåer, resultat eller testtyper i någon händelse.

### 9.18 Klart när

Migreringen är körd. Ses i 412 x 915 och 1440 px. Mörkt läge ska ses i hopfällt, utfällt och felläge i 412.

Kortet:
- Ett gratiskonto med en slutförd Nivåkoll, dagens grundnivåtest kvar och ingen sökt tjänst ser kortet under Vägen till provet. Väggens knapp "Starta dagens test" är sidans enda kopparknapp.
- Kortets ikon har rummets ton (indigo i ljust läge), inte grönt.
- Kortet visas inte: före första Nivåkollen, med en påbörjad Nivåkoll utan nivå, när Gratisraden står på sidan, när väggens knapp har lås, när kontot har en sökt tjänst, efter Hoppa över, och aldrig på `/app/tester`.
- "Lägg in tjänsten" fäller ut två fält utan att tangentbordet fälls upp. Fortsätt med tom tjänst ger felraden i koppar.
- Hem mäts med `scripts/perf-inloggat.ts` med kortet synligt: CLS 0 och LCP inom budgeten.
- Utan plan är rubriken "Vilken tjänst övar du inför?", med passerat provdatum "Vilken tjänst gällde provet?".
- Byter hon prov i planen kommer frågan tillbaka. Lägger hon in ett första datum på samma prov kommer den inte tillbaka.

Vägen:
- Fortsätt öppnar Sökta tjänster med arket och fälten ifyllda. Adressen är `/dashboard/sokta-tjanster?logga=1&tjanst=Ekonomiassistent&arbetsgivare=Norrmejerier&fran=test-hem-plan` och bär inget annat.
- Med plan är kryssrutan ikryssad. Efter Logga sökt tjänst står kvittensen "`Företaget` står nu som kallad till test" överst, och tjänsten står under Väntar svar med brickan "Kallad till test". Den står inte under Följ upp, heller inte med ett sökdatum som är 30 dagar gammalt.
- "Tillbaka till testerna" går till Hem i Rekryteringstester, där kortet är borta.
- Tjänstens sida har ögonbrynet "Kallad till test", banan står på Svar, och inget Följ upp-block visas, inte heller med `?steg=folj-upp`.
- "Kallad till test" går att lägga till för hand på en tjänst som redan finns, från snabbvalen och från Annat.
- Delningssidan visar tjänsten med "Kallad till test". Rapporten listar den bland sökta jobb.

### 9.19 Vitest

`src/lib/tester/v4/__tests__/tjanstfraga.test.ts` (ny):
- `tjanstfraga` ger ett kort i grundfallet, och null för vart och ett av de sex skälen i 9.14, ett fall per skäl. Köpknappen i väggen ger null också när Gratisraden inte ritas (dagens grundnivå kvar, `dagens.knapp.las` satt).
- `iAppen` ger alltid null.
- varianterna: utan plan `utan_plan` och `test-hem`, med plan `plan` och `test-hem-plan`, passerat datum `plan_passerad`.
- `arHoppad`: samma nyckel ja, annat prov nej, ändrat datum nej, första datumet på samma prov ja, `'ingen'` mot en plan nej, null nej.

`src/components/tester-v4/hem/__tests__/HemVy.test.tsx`:
- kortet ritas efter montering under Vägen till provet, före Nederst, med texterna i 9.15.
- med `localStorage.tjanstfraga_test` satt till kortets nyckel ritas inget kort.
- med `iAppen` ritas inget kort.
- väggens knapp med lås: inget kort.
- Hoppa över tar bort kortet, skriver nyckeln och skickar `tjanstfraga_val` med `hoppad`.
- Fortsätt med tom tjänst visar felraden. Med båda fälten skrivs nyckeln och navigeringen går till `/dashboard/sokta-tjanster?logga=1&tjanst=...&arbetsgivare=...&fran=test-hem-plan`, utan fler parametrar.
- `hem_visad` skickas med `tjanstfraga: true` när kortet visas och `false` annars.

Ny fil `src/app/app/tester/__tests__/page.test.tsx`: mocka `@/app/dashboard/tester/HemSida` och visa att `/app/tester` ritar `TesterHemSida` med `iAppen` satt.

`src/lib/jobbsok/__tests__/intervjulagen.test.ts` och `motor.test.ts`:
- `foljUppTyp('test_invited', null)` är null.
- sökt för 30 dagar sedan och kallad till test i dag: inte tyst, gruppen `vantar_svar`, stationen `sokt`. Samma tjänst 40 dagar efter kallelsen: inte tyst.
- `tjanstensSteg` står på Svar med kallelsens datum.
- `kalladTillTest` är kallelsens dag, och null när statusen är en annan.
- Att göra nu: ingen kandidat dag 13 efter kallelsen, `uppdatera_test` dag 14 med texterna i 9.13, och aldrig `folj_upp`.
- `vaggUtanHandling` med en och med två tjänster som alla är kallade till test.
- `testRadText` och `vantarSvarText`, ordagrant.
- ett sparat oskickat utkast på en tjänst som sedan blir kallad till test räknas inte i `harUtkast`.
- `soktaHref({ logga: 'sokt', tjanst: 'Ekonomiassistent', arbetsgivare: 'Norrmejerier', fran: 'test-hem-plan' })` ger adressen i 9.18.

`src/lib/notifications/__tests__/followUp.test.ts`: en tjänst med statusen `test_invited`, sökt för 30 dagar sedan, ger ingen kandidat, med historik och i reservläget utan historik.

`src/lib/email/lifecycle/__tests__/weekly-digest.test.ts`: samma tjänst står varken i `followUps` eller i `besked`, och rutan nämner den inte.

`src/components/jobb3/oversikt/__tests__/oversikt.test.ts`: `tjanstRad` för kallad till test (texten, steg 2, statusens text), och `goraMobil` för `uppdatera_test`.

Ny fil `src/lib/applications/__tests__/skapa.test.ts` (mockad klient): `kallad_till_test` med `fran=test-hem-plan` skriver `applied` och sedan `test_invited` i två insert, och svaret har `current_status: 'test_invited'`. Utan `fran`, eller med ett annat `fran`, skrivs bara `applied`.

Arket och kvittensen, ny fil `src/components/jobb3/sokta/__tests__/testvag.test.tsx`: hjälpraden under Datum sökt, kryssrutans förval för de två `fran`-värdena, de två raderna under knappen, att `kallad_till_test` bara skickas när rutan är kryssad, och kvittensens båda varianter ordagrant med knappen "Tillbaka till testerna".

### 9.20 Filägande för byggare D

D börjar när B och C är klara. A är redan klar.

**9 A.**
- Nya filer: `src/components/jobb3/intervju/IntervjuFraga.tsx`, `src/components/jobb3/intervju/__tests__/IntervjuFraga.test.tsx`.
- A:s filer som D får röra: `src/components/jobb3/intervju/IntervjuHubb.tsx`, `src/components/jobb3/intervju/text.ts`.
- B:s filer som D får röra: `src/lib/jobbsok/intervju.ts`, `src/lib/jobbsok/server.ts`, `src/lib/analytics/events.ts`, `src/lib/jobbsok/__tests__/intervjulagen.test.ts`, `src/lib/jobbsok/__tests__/motor.test.ts`.
- Filer utan tidigare ägare: `src/app/dashboard/intervju/page.tsx`, `src/app/dashboard/intervju/InforIntervjunClient.tsx`, `src/app/api/applications/[id]/events/route.ts`, `src/lib/jobbsok/intervjuServer.ts`, `src/lib/jobbsok/adress.ts`, `src/app/jobb3-c.css`.

**9 B.**
- Nya filer: `supabase/migrations/20261122120000_kallad_till_test.sql`, `src/lib/tester/v4/tjanstfraga.ts` med test, `src/components/tester-v4/hem/TjanstFraga.tsx`, `src/app/dashboard/tester/HemSida.tsx`, `src/app/app/tester/__tests__/page.test.tsx`, `src/lib/applications/__tests__/skapa.test.ts`, `src/components/jobb3/sokta/__tests__/testvag.test.tsx`.
- A:s filer som D får röra: `src/lib/applications/skapa.ts`, `src/lib/dashboard/getSummary.ts`, `src/components/jobb3/sokta/SoktaVy.tsx`.
- B:s filer som D får röra: `src/lib/jobbsok/typer.ts`, `lage.ts`, `bana.ts`, `attGora.ts`, `lista.ts`, `src/lib/analytics/events.ts`, testerna i `src/lib/jobbsok/__tests__/`, `src/lib/notifications/__tests__/followUp.test.ts` och `src/lib/email/lifecycle/__tests__/weekly-digest.test.ts` (bara testerna, koden i notisen och veckobrevet ändras inte).
- C:s filer som D får röra: `src/components/jobb3/sokta/TjanstVy.tsx`, `src/components/jobb3/sokta/Lista.tsx`, `src/components/jobb3/oversikt/oversikt.ts` med test.
- Filer utan tidigare ägare: `src/lib/applications/status.ts`, `src/app/api/applications/[id]/events/route.ts`, `src/components/jobb3/sokta/LoggaArk.tsx`, `src/components/jobb3/sokta/SmaArk.tsx`, `src/components/jobb3/sokta/text.ts`, `src/components/jobb3/kit/Data.tsx`, `src/app/dashboard/sokta-tjanster/page.tsx`, `src/app/dela/sokta-tjanster/[token]/page.tsx`, `src/lib/jobbsok/adress.ts`, `src/lib/tester/v4/hamta.server.ts`, `src/lib/tester/v4/typer.ts`, `src/lib/tester/v4/modell.ts`, `src/lib/tester/v4/fixturer.ts`, `src/components/tester-v4/hem/HemVy.tsx`, `src/components/tester-v4/hem/HemMatning.tsx`, `src/components/tester-v4/hem/__tests__/HemVy.test.tsx`, `src/components/tester-v4/omgang3/HemGolv.tsx`, `src/app/dashboard/tester/page.tsx`, `src/app/app/tester/page.tsx`, `src/app/globals.css` (bara klasserna i 9.15).

D rör inte: sessionsramen, Nivåkollen, resultatskärmen, betalväggarna, Plan inför provet, `GratisRad.tsx`, koden i `followUp.ts` och `weekly-digest.ts`, och ingenting under `src/app/(public)`, `src/components/publikt` eller `content`.
