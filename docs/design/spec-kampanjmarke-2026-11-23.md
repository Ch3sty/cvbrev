# Spec: kampanjmärket och kampanjens ytor (2026-11-23)

Art director till byggaren. Ska vara live före kl. 07 i dag, då kampanjmejlet skickar 454 personer hit.

Ägarens krav i en mening: där kampanjpriset visas ska det framgå att det är Black Week, att det är tidsbegränsat och när det slutar, helst med nedräkning, i appens nya form (plattor med klack, runda former, tydliga färgfält), och samma del ska kunna bära nästa kampanj.

## 0. Var allt ligger

| Vad | Var |
|---|---|
| Färdig CSS för märket, Premium-ön, prislappen, sidokortet, raderna och sidomenyn | `docs/design/kampanjmarke-2026-11-23/kampanj.css` |
| Färdig CSS för köpsteget | `docs/design/kampanjmarke-2026-11-23/kopsteg.css` |
| Klockan (ES5, körd i skissen) | `docs/design/kampanjmarke-2026-11-23/klocka.js` |
| Skissen (HTML som går att öppna) | `C:\Users\chris\AppData\Local\Temp\claude\dceaf5763afec129\2f505274-a60e-456c-8335-21ea685ee053\scratchpad\kampanj-skiss\` (`premium.html`, `priser.html`, `kopsteg.html`, `smatt.html`, `marke.html`; `?k=bw|cm|ord`, `&nu=ISO`) |
| Renderade bilder, 1440 och 412 | samma mapp, `bilder\` |

Skissens sidor länkar de riktiga `v3.css`, `ram.css`, `priser.css` och `reklam.css` ur arbetskopian och lägger `kampanj.css` ovanpå. Det du ser i bilderna är alltså de CSS-filer du lyfter in, på sajtens riktiga markup. `skiss.js` i skissmappen är facit för märkets markup (funktionerna `kampanjPris`, `ur`, `kampanjLiten`, `kampanjOrd`, `radPublik`).

Bilder att ha framför dig när du bygger:

- `premium-bw-topp-1440.png`, `premium-bw-412.png`, `premium-cm-1440.png`: Premium-ön
- `priser-bw-1440.png`, `priser-bw-412.png`, `priser-cm-1440.png`: prissidans topp
- `kopsteg-ord-1440.png`, `kopsteg-bw-1440.png`, `kopsteg-bw-412.png`, `kopsteg-bw-hel-412.png`, `kopsteg-bw-kryssad-412.png`, `kopsteg-cm-1440.png`: köpsteget
- `smatt-bw-1440.png`, `smatt-bw-412.png`, `smatt-cm-1440.png`: raderna, sidomenyn, sidokortet, löptext, betalvägg
- `marke-1440.png`: märkets tre storlekar och nedräkningens alla lägen
- `premium-bw-sista-dygnet-*.png`, `premium-bw-sista-timmen-*.png`, `premium-bw-reserv-*.png`: lägena på plats

## 1. Besluten

1. **Kampanjen får en egen ton, "natt", och den är ett medvetet undantag från "inget svart".** Black Week står på `#0B0D1F`, sajtens mörkaste indigo dragen nästan till svart, med koppar som enda accent och kopparklack. Skälet i en mening: exklusiviteten ska komma ur djup färg och koppar i appens egen form, och en kampanjyta som ser ut som vardagsblocket läses inte som en kampanj. Cyber Monday är samma form i elektrisk indigo (`#1E2578`) med ljus indigo som accent. Köpknappen är koppar i båda.
2. **Märket är tre saker som alltid följs åt: plattan med kampanjens namn, nedräkningen på brickor med klack och slutdatumet i klartext.** Plattan är sajtens signum (lutad platta med klack, som "förberedd." i Facebook-grafiken). Brickorna är appens brickor.
3. **Nedräkningen är ett tillägg ovanpå klartexten, aldrig tvärtom.** Server-HTML:en visar "Gäller till och med söndag 29 november 23.59". Klockan byter det mot brickor i samma ruta när den har räknat. Räknar den inte står ytan färdig ändå.
4. **Premium-ön byter innehåll i kampanjläge, inte bara tal.** Det du får (rubrik, text, lista) står till vänster, och köpdelen blir en biljett till höger med platta, pris, struket pris, "Du sparar 50 kr", nedräkning, knapp och villkor.
5. **Prissidans h1 rörs inte, kampanjen ramar in den.** Raden ovanför h1 säger "Första månaden 99 kr. Sedan ordinarie pris:" och h1 fortsätter meningen: "Jobbcoach Premium, 149 kr i månaden". Två priser som förklarar varandra i stället för att säga emot varandra.
6. **Köpsteget ritas om i rummens form:** vägg med namn och pris, två lyfta kort (vad som ingår, villkoren), och samtycket flyttar ned i foten, direkt intill knappen.

## 2. Inställningarna (`src/lib/kampanj/kampanj.ts`)

**Inga nya fält behövs i `Kampanj`.** Märket ritas ur `namn`, `tema`, `pris`, `rabattKr`, `slut` och `giltigTill`. En ny kampanj är en ny rad i `KAMPANJER` (och en kupong i Stripe). Ett nytt tema är ett block i `kampanj.css` (kopiera `.km-tema-svart`) och ett nytt värde i typen `tema`.

Ändringar:

- `KampanjVisning` finns redan med `slutMs`, `namn`, `tema`, `pris`, `rabattKr`, `giltigTill`. Räcker.
- `etikett` används inte längre av märket (plattan skriver `namn` och CSS gör versaler). Låt fältet stå.
- Lägg märkets fasta ord på ett ställe, så att de inte sprids:

```ts
/** Märkets fasta ord. Lägesorden står också i KLOCKA_KOD (klocka.ts): ändra på båda ställena. */
export const KAMPANJ_ORD = {
  forsta: 'Första månaden',
  ordinarie: 'Ordinarie pris',
  sparar: (k: Pick<Kampanj, 'rabattKr'>) => `Du sparar ${k.rabattKr} kr`,
  sedan: (ord: number, uppsagning = true) => `Sedan ${ord} kr i månaden.${uppsagning ? ' Säg upp när du vill.' : ''}`,
  galler: (k: Pick<Kampanj, 'giltigTill'>) => `Gäller ${k.giltigTill}`,
  /** Stor bokstav först: "Till och med söndag 29 november 23.59". */
  till: (k: Pick<Kampanj, 'giltigTill'>) => k.giltigTill.charAt(0).toUpperCase() + k.giltigTill.slice(1),
  radKort: (k: Pick<Kampanj, 'pris'>) => `Första månaden ${k.pris} kr`,
  radInloggad: (k: Pick<Kampanj, 'pris'>) => `Första månaden Premium för ${k.pris} kr.`,
  overH1: (k: Pick<Kampanj, 'pris'>) => `Första månaden ${k.pris} kr. Sedan ordinarie pris:`,
  slutarOm: 'Slutar om',
  kvar: 'kvar',
} as const
```

- `kampanjSkript()` byggs om enligt avsnitt 4 (väljaren blir en funktion, temat följer med, klockan läggs till).

## 3. Kampanjmärket

### 3.1 Markup

Ny fil `src/components/kampanj/KampanjMarke.tsx`. **Ingen `'use client'`, inga hooks**: ren markup som går att använda i både server- och klientkomponenter. Klockan (avsnitt 4) hittar märkena själv på `data-kn`.

Varje element som klockan skriver i bär `suppressHydrationWarning`, annars klagar React när klockan hunnit före hydreringen. Det gäller roten (`.km`), `[data-kn-lage]`, `[data-kn-t]`, `[data-kn-e]` och `[data-kn-text]`. Texten i dem är fast i React (platshållare), så React rör dem aldrig igen efter första renderingen.

```tsx
import { PLAN_BY_KEY, SALD_PLAN } from '@/lib/plans/plans'
import { KAMPANJ_ORD, type Kampanj, type KampanjVisning } from '@/lib/kampanj/kampanj'

/** Det märket behöver. Både Kampanj (publikt) och KampanjVisning (inloggat) passar. */
type K = Pick<Kampanj, 'namn' | 'tema' | 'pris' | 'rabattKr' | 'giltigTill'> & { slut?: string; slutMs?: number }
const slutMs = (k: K) => k.slutMs ?? Date.parse(k.slut as string)

/** Rutan med nedräkningen och, under den, slutdatumet i klartext (reservläget). */
function Ur({ k }: { k: K }) {
  return (
    <span className="km-ur">
      <span className="km-ur-rad" aria-hidden="true">
        <span className="km-lage" data-kn-lage="" suppressHydrationWarning>{KAMPANJ_ORD.slutarOm}</span>
        <span className="km-brickor">
          {(['dagar', 'timmar', 'minuter'] as const).map((enhet, i) => (
            <span className="km-bricka" key={enhet}>
              <b data-kn-t="" suppressHydrationWarning>{i === 0 ? '0' : '00'}</b>
              <i data-kn-e="" suppressHydrationWarning>{enhet}</i>
            </span>
          ))}
        </span>
      </span>
      <span className="km-reserv">{KAMPANJ_ORD.galler(k)}</span>
    </span>
  )
}

/**
 * STOR och MELLAN med pris: plattan, priset, det strukna, vad man sparar, vad
 * det kostar sedan och nedräkningen. Bara span-element, så att det får stå i <p>.
 */
export function KampanjPris({ k, storlek = 'stor', utanUppsagning }: { k: K; storlek?: 'stor' | 'mellan'; utanUppsagning?: boolean }) {
  const ord = PLAN_BY_KEY[SALD_PLAN].amount
  return (
    <span className={`km km-${storlek} km-tema-${k.tema}`} data-kn={slutMs(k)} suppressHydrationWarning>
      <span className="km-huvud">
        <span className={`km-platta${storlek === 'mellan' ? ' km-platta-liten' : ''}`}>{k.namn}</span>
        <span className="km-forsta">{KAMPANJ_ORD.forsta}</span>
      </span>
      <span className="km-prisrad">
        <span className="km-belopp">{k.pris} kr</span>
        <span className="km-bredvid">
          <s><span className="sr-only">{KAMPANJ_ORD.ordinarie} </span>{ord} kr</s>
          <span className="km-spar">{KAMPANJ_ORD.sparar(k)}</span>
        </span>
      </span>
      <span className="km-sedan">{KAMPANJ_ORD.sedan(ord, !utanUppsagning)}</span>
      <Ur k={k} />
    </span>
  )
}

/** STOR eller MELLAN utan pris: bara nedräkningen (köpstegets vägg ritar priset själv). */
export function KampanjUr({ k, storlek = 'stor' }: { k: K; storlek?: 'stor' | 'mellan' }) {
  return (
    <span className={`km km-${storlek} km-tema-${k.tema}`} data-kn={slutMs(k)} suppressHydrationWarning>
      <Ur k={k} />
    </span>
  )
}

/**
 * LITEN: plattan och tiden som text på en rad.
 *   enheter  2 = "6 d 16 tim", 3 = "6 d 16 tim 54 min"
 *   paPapper bläck i stället för ljus text (inloggat, kort)
 *   utanPlatta när plattan redan står bredvid (raderna)
 *   medNamn  namnet i fet text i stället för plattan (sidomenyn)
 *   utanLage inget "Slutar om" före, "kvar" efter (sidomenyn, där det är trångt)
 */
export function KampanjLiten({ k, enheter = 2, paPapper, utanPlatta, medNamn, utanLage }: {
  k: K; enheter?: 2 | 3; paPapper?: boolean; utanPlatta?: boolean; medNamn?: boolean; utanLage?: boolean
}) {
  return (
    <span className={`km km-liten km-tema-${k.tema}${paPapper ? ' km-pa-papper' : ''}`} data-kn={slutMs(k)} suppressHydrationWarning>
      {utanPlatta ? null : <span className="km-platta km-platta-liten">{k.namn}</span>}
      {medNamn ? <span className="km-meny-namn">{k.namn}</span> : null}
      <span className="km-nu">
        <span className="km-nu-rad" aria-hidden="true">
          {utanLage ? null : <><span data-kn-lage="" suppressHydrationWarning>{KAMPANJ_ORD.slutarOm}</span>{' '}</>}
          <b data-kn-text={enheter} suppressHydrationWarning>0 d 00 tim</b>
          {utanLage ? <span className="km-kvar"> {KAMPANJ_ORD.kvar}</span> : null}
        </span>
        <span className="km-reserv">{KAMPANJ_ORD.till(k)}</span>
      </span>
    </span>
  )
}

/** ORDET: kampanjens namn före ett pris i löptext. Ingen nedräkning. */
export function KampanjOrd({ k }: { k: Pick<Kampanj, 'namn' | 'tema'> }) {
  return <span className={`km-ord km-tema-${k.tema}`}>{k.namn}</span>
}
```

`sr-only` är Tailwinds klass och finns på alla sidor.

### 3.2 Storlekarna

| Storlek | Var | Mått |
|---|---|---|
| **Stor** (`km-stor`) | Premium-ön, prislappen, köpstegets vägg | Platta 36 px hög, 16 px Schibsted 800 versaler, lutad 2°. Pris 68 px (88 från 900 px). Brickor 76 px höga (84 från 900), siffra 36/40 px, enhet 12,5 px. |
| **Mellan** (`km-mellan`) | Artiklarnas sidokort, kort i inloggat | Liten platta (24 px). Pris 44 px. Brickor 56 px, siffra 24 px, enhet 11 px. |
| **Liten** (`km-liten`) | Raden överst, sidomenyn, betalväggar | Liten platta och en textrad 13 px: "Slutar om **6 d 16 tim**". Minst 28 px hög. |
| **Ordet** (`km-ord`) | Prisrader i löptext | 22 px hög bricka på nattbotten med namnet i accentens ljusa ton, före priset. |

Alla färger kommer ur temat (`.km-tema-svart`, `.km-tema-indigo`), se `kampanj.css` överst.

### 3.3 Nedräkningens regler

Räknas i webbläsaren från `data-kn` (kampanjens `slut` i millisekunder). Tre brickor, alltid tre, så att bredden aldrig ändras.

| Läge | När | Ordet ovanför | Brickorna | Textformen (liten) |
|---|---|---|---|---|
| 0 | minst ett dygn kvar | Slutar om | dagar, timmar, minuter | `6 d 16 tim` (med tre enheter: `6 d 16 tim 54 min`) |
| 1 | under ett dygn | Sista dygnet | timmar, minuter, sekunder | `14 tim 32 min` |
| 2 | under en timme | Sista timmen | timmar (00), minuter, sekunder. Brickorna fylls med kampanjens färg | `43 min 06 sek` |
| 3 | tiden är ute | Erbjudandet har gått ut | 00 00 00, dämpade | tom |

- Enheterna böjs: "1 dag", "1 timme", "1 minut", "1 sekund". Kortformen är `d`, `tim`, `min`, `sek`.
- Timmar, minuter och sekunder har alltid två siffror på brickorna. Dagar skrivs utan nolla.
- Uppdateras en gång i sekunden. I läge 0 ändras bara minuten, så ytan står still nästan hela tiden.
- **Sista dygnet och sista timmen är sanna per definition** (under 24 timmar, under 60 minuter kvar), vilken sluttid en framtida kampanj än har.
- **Minskad rörelse** (`prefers-reduced-motion: reduce`): aldrig sekunder. Brickorna visar dagar, timmar, minuter i alla lägen, textformen stannar vid minuter. Inget pulserar eller blinkar i något läge, för någon.
- **När tiden är ute** står läge 3 i två sekunder. Sedan väljer sidan om (avsnitt 4.3): publikt byter varianten av sig själv (Black Week blir Cyber Monday vid midnatt mot måndag, Cyber Monday blir ordinarie), inloggat hämtar servern om.
- **Skärmläsare:** allt som tickar är `aria-hidden="true"`. Det som läses upp är plattans namn och den fasta raden `km-reserv` ("Gäller till och med söndag 29 november 23.59"), som ligger kvar för skärmläsare också när brickorna visas. Ingen `aria-live`, ingen `role="timer"`.
- **Ingen layoutförskjutning:** brickorna och klartexten ligger i samma rutnätscell (`.km-ur > * { grid-area: 1 / 1 }`), så cellen har alltid den högstas höjd. Brickorna är osynliga (`visibility: hidden`) tills klockan satt `data-kn-klar` på märket.

### 3.4 Reservläget

Om klockan inte kan räkna (skriptet blockerat, ett fel, ett ogiltigt `data-kn`) händer ingenting: `data-kn-klar` sätts aldrig och `km-reserv` visas, i samma ruta. Stor och mellan: "Gäller till och med söndag 29 november 23.59" i rubriksnitt. Liten: "Till och med söndag 29 november 23.59". Se `premium-bw-reserv-*.png` och `marke-1440.png`.

Klartexten väntar 1,2 sekunder innan den syns (`animation: km-reserv 0s linear 1.2s both`), så att den inte blinkar förbi på de sidor där klockan går. Under den dryga sekunden står rutan tom med rätt höjd.

## 4. Klockan

### 4.1 Koden

Ny fil `src/lib/kampanj/klocka.ts` som exporterar `KLOCKA_KOD`: innehållet i `docs/design/kampanjmarke-2026-11-23/klocka.js` som sträng (kopiera filen ordagrant, den är körd i skissen). Den är ES5, saknar beroenden och gör detta:

- `window.__kampanjTick()` går igenom alla `[data-kn]`, räknar och skriver brickor, textform, lägesord, `data-kn-steg` (0 till 3) och `data-kn-klar`. Den skriver bara när texten ändrats. Varje märke ligger i egen `try`.
- Körs vid `DOMContentLoaded` (eller direkt om sidan redan är läst), sedan en gång i sekunden, inte när fliken är dold, och direkt när fliken blir synlig igen.
- `localStorage.kampanj_nu` (ISO) flyttar klockan för klicktest, som i dag. Nytt: klockan går vidare från den tidpunkten i stället för att stå still.
- När ett märke når noll: efter två sekunder anropas `window.__kampanjValj()` om den finns, och händelsen `kampanj-slut` skickas på `window`.

### 4.2 Var den läggs

`KampanjHuvud` (`src/components/kampanj/Kampanj.tsx`) ligger redan i rotlayouten och ger skript i `<head>` på alla sidor, också inloggat. Lägg klockan i samma `<script>`, efter väljaren:

```tsx
<script dangerouslySetInnerHTML={{ __html: kampanjSkript(new Date()) + KLOCKA_KOD }} />
```

Inga skript inne i märkena. Sidor som byts utan omladdning (Next-navigering) fylls av nästa sekundslag. Vill du ha det direkt: anropa `window.__kampanjTick?.()` i en effekt på sökvägen i `KampanjMatning.tsx` (publikt) och i `DashboardShell.tsx` (inloggat). En rad var.

### 4.3 Väljaren blir en funktion och bär temat

`kampanjSkript()` i `kampanj.ts`. Listan får temat som fjärde värde, och valet går att göra om:

```ts
export function kampanjSkript(nu: Date = new Date()): string {
  const kvar = kampanjerKvar(nu)
  if (kvar.length === 0) return ''
  const lista = JSON.stringify(kvar.map((k) => [k.nyckel, ms(k.start), ms(k.slut), k.tema]))
  return (
    `try{window.__kampanjValj=function(){var K=${lista},d=document.documentElement,n=window.__kampanjNu?window.__kampanjNu():Date.now(),v=null;` +
    `if(!window.__kampanjNu){try{var o=localStorage.getItem('kampanj_nu');if(o){var p=Date.parse(o);if(p)n=p}}catch(e){}}` +
    `if(document.cookie.indexOf('${KAMPANJ_EJ_COOKIE}=1')<0){for(var i=0;i<K.length;i++){if(n>=K[i][1]&&n<K[i][2]){v=K[i];break}}}` +
    `if(v){d.setAttribute('data-kampanj',v[0]);d.setAttribute('data-kampanj-tema',v[3])}else{d.removeAttribute('data-kampanj');d.removeAttribute('data-kampanj-tema')}};` +
    `window.__kampanjValj()}catch(e){}`
  )
}
```

Första anropet sker i `<head>` före första målningen, precis som i dag (då finns `__kampanjNu` inte än, och `kampanj_nu` läses direkt). När ett märke når noll anropar klockan funktionen igen och `<html>` byter `data-kampanj`, så CSS:en i `KampanjHuvud` visar nästa variant utan omladdning.

`data-kampanj-tema` är nytt och styr färgen på ytor som delas av varianterna (Premium-ön, prislappen, sidokortet). Uppdatera testet `src/lib/kampanj/__tests__/kampanj.test.ts` för den nya strängen.

**Inloggat** när tiden går ut: lyssna på `kampanj-slut` i `DashboardShell.tsx` och kör `router.refresh()`. Servern svarar då med nästa kampanj eller ingen. `KampanjRadInloggad` har redan sin egen timer som tar bort raden; låt den stå.

## 5. Publika ytor

### 5.1 `Kampanj.tsx`

- Importera CSS:en: lägg `kampanj.css` som `src/components/kampanj/kampanj.css` och `import './kampanj.css'` överst i `Kampanj.tsx`. Filen laddas då med rotlayouten och gäller publikt och inloggat.
- Ta bort de gamla `.kampanj-rad`-reglerna och `.pub-pris s`/`.ib-pris-l s` ur den inline-CSS som `KampanjHuvud` skriver, om inget annat använder dem (sök först). `[data-kv]{display:none}` och visa-regeln står kvar som de är.
- `KampanjVarianter` får `som?: 'span' | 'div'` (förval `span`) för block-innehåll, och `ord` blir valfri: utan `ord` ritas inget `data-kv="ord"`-element alls (annars står ett tomt element kvar i ordinarie läge och får marginal).
- Den gamla `KampanjPris` i `Kampanj.tsx` tas bort. Exportera den nya ur `KampanjMarke.tsx` med samma namn, så att importerna i `Premium.tsx`, `ArtikelReklam.tsx` och `publikt/PremiumBlock.tsx` bara byter sökväg.
- `MedKampanjPris`: kampanjvarianten får ordet före priset.

```tsx
<KampanjVarianter ord={pris} kampanj={(k) => <><KampanjOrd k={k} />{kampanjPrisPeriod(k)}</>} />
```

- `KampanjRadPublik`:

```tsx
{kvar.map((k) => (
  <div key={k.nyckel} data-kv={k.nyckel}>
    <a href="/priser" className={`km-rad km-tema-${k.tema}`} data-kampanj-lank={k.nyckel}>
      <span className="km-rad-in">
        <span className="km-platta km-platta-liten">{k.namn}</span>
        <span className="km-rad-text">
          <span className="km-rad-lang">{k.copy.bannerText}</span>
          <span className="km-rad-kort">{KAMPANJ_ORD.radKort(k)}</span>
        </span>
        <KampanjLiten k={k} utanPlatta enheter={2} />
        <u>{k.copy.bannerLank}</u>
      </span>
    </a>
  </div>
))}
```

Raden står på kampanjens nattbotten med 3 px klack i accentens mörka ton, inte längre i koppar-mjuk. Fast höjd: 66 px i telefon (två rader: platta och "Första månaden 99 kr", under den "Slutar om 6 d 16 tim"), 52 px från 900 px (en rad, nedräkningen i en pille, "Se erbjudandet" understruket). Hela raden är länken. Ta bort `.kampanj-rad.p3-kampanj`-reglerna i `src/components/publikt/v3/ram.css` (rad 127 till 131). Se `smatt-bw-1440.png` och `premium-bw-topp-412.png`.

### 5.2 Premium-ön (`src/components/publikt/v3/Premium.tsx`)

Det ordinarie läget ska se ut exakt som i dag. Två ändringar i markupen:

1. Roten får `km-yta` när `pris` är sant: `className={`p3-premium ${pris ? 'km-yta' : ''} ${className}`}`. En Premium-ö utan pris får aldrig kampanjens klädsel.
2. Priset, knappen och noten läggs i en egen ram, `p3-premium-kop`, som blir biljetten i kampanjläge:

```tsx
<div className="p3-premium-text">
  {etikett ? <p className="p3-ey">{etikett}</p> : null}
  <Rubrik className="p3-h2">{rubrik}</Rubrik>
  {text ? <p style={{ fontSize: 17 }}>{text}</p> : null}
  {pris || knappEl || not ? (
    <div className="p3-premium-kop">
      {pris ? <PrisRad uppsagning={uppsagning} /> : null}
      {knappEl ? <div className="p3-knapprad">{knappEl}</div> : null}
      {pris ? <KampanjVarianter som="div" kampanj={(k) => <p className="p3-liten">{k.copy.prisFotnot}</p>} /> : null}
      {not ? <p className="p3-liten">{not}</p> : null}
    </div>
  ) : null}
  {children}
</div>
```

`kampanj.css` ger ramen samma avstånd som förut i ordinarie läge (`.p3-premium-text > .p3-premium-kop { margin-top: 22px }` och reglerna under). Jämför en skärmdump av startsidans ö i ordinarie läge före och efter: den ska vara pixellik. `PrisRad` är oförändrad i kod; den får den nya `KampanjPris` av sig själv.

I kampanjläge (allt i `kampanj.css`, avsnittet PREMIUM-ÖN, gäller bara under `html[data-kampanj]`):

- Ön står på `--km-botten` med klack i `--km-accent-klack`, två runda former i `--km-form` (nere till vänster, uppe till höger).
- Från 1000 px: två kolumner. Vänster: etikett, rubrik, text och bocklistan. Höger (470 px): biljetten. Det görs med `display: contents` på `.p3-premium-text` och rutnätsplacering, ingen ny markup.
- Biljetten: `--km-botten-2`, 2 px kant, 7 px mörk klack, radie 26/30 px. Inuti: plattan och "FÖRSTA MÅNADEN", priset 88 px med struket 149 kr och pillen "Du sparar 50 kr", "Sedan 149 kr i månaden. Säg upp när du vill.", prickad linje, "SLUTAR OM" och tre brickor, köpknappen i full bredd, noten.
- I telefon: en kolumn i ordningen etikett, rubrik, text, biljett, lista. Knappen 15 px text under 480 px så att "Köp Premium, 99 kr första månaden" står på en rad i 412.

Kampanjens villkorsrad (`prisFotnot`) står som egen liten rad över sidans not ("Kortbetalning via Stripe. Kvitto på mejl."), 4 px isär. I skissen är de en och samma rad; det är samma text.

Knappens text och href ändras inte: sidorna skickar redan `KampanjVarianter` med `k.copy.prisKnapp`.

Den äldre `src/components/publikt/PremiumBlock.tsx` (sidor som inte byggts om): byt bara importen av `KampanjPris` och skicka `storlek="mellan"`. Ingen biljett där. Kontrollera en sådan sida i 412.

### 5.3 Prissidan (`src/app/(public)/priser/page.tsx`)

- `<div className="pr-lapp">` blir `<div className="pr-lapp km-yta">`.
- Lappens `PrisRad` ska ge sedan-raden utan uppsägningen (den står redan i lappens topp). Lägg en prop på `PrisRad`: `utanUppsagningIKampanj?: boolean` som skickas vidare som `utanUppsagning` till `KampanjPris`. Sätt den här.
- Etiketten ovanför h1:

```tsx
etikett={
  <KampanjVarianter
    ord={HERO.eyebrow}
    kampanj={(k) => (
      <span className={`km-over km-tema-${k.tema}`}>
        <span className="km-platta">{k.namn}</span>
        <span>{KAMPANJ_ORD.overH1(k)}</span>
      </span>
    )}
  />
}
```

- h1, värdemeningen, delarna och ankarlänkarna rörs inte. Noten under knappen är redan `k.copy.prisFotnot`.
- Lappen i kampanjläge (`kampanj.css`, avsnittet PRISSIDANS LAPP): nattbotten i stället för papper, toppen i `--km-botten-2`, klack i accentens mörka ton, listan i ljus text med bockar i accentfärgen. Samma `KampanjPris` i stor storlek som i Premium-ön. Se `priser-bw-1440.png` och `priser-cm-1440.png`.
- Premium-ön längre ned på sidan följer 5.2 av sig själv.

SEO-grinden: h1 är orörd, inga länkar läggs till eller tas bort, inga rubriker dupliceras (varianterna innehåller bara span-element och text).

### 5.4 Artiklarnas sidokort (`src/components/artiklar/reklam/ArtikelReklam.tsx`, rad 457 och framåt)

- `<section className="ar-sido" ...>` blir `ar-sido km-yta` (bara Premium-kortet med pris, inte `ar-sido-gratis` och inte jobbkortet).
- `kampanj={(k) => <KampanjPris k={k} storlek="mellan" />}`.
- Resten av kortet rörs inte. Se `smatt-bw-1440.png`, punkt 4. Kortet blir cirka 690 px högt på dator: kontrollera att det ryms under menyn och raden i 900 px höjd om det är klistrat.
- Slutkortet och de andra ställena i filen som använder `MedKampanjPris` får ordet före priset av sig själva (5.1).

### 5.5 Övriga publika ställen

Alla sidor som i dag har `PremiumO` med pris, `PrisRad` eller `MedKampanjPris` följer med utan egen ändring: startsidan, `/funktioner`, verktygssidorna, `/cv-mallar` med stilsidorna, `/for-rekryterare`, registreringen (`RegisterKontoSteg.tsx`, löptext). Gå igenom dem i 412 efter bygget. Där `PrisRad` står ensam på en vägg eller ett kort (utan `PremiumO`) ritas märket i stor storlek på den ytans botten; plattan, brickorna och texten har egna färger ur temat och håller på alla mörka väggar. Står en `PrisRad paPapper` på vitt papper utanför prislappen: ge dess förälder `km-yta` och en regel som i prislappens avsnitt, eller säg till, så ritar jag den.

## 6. Inloggat

### 6.1 Raden överst (`src/components/kampanj/KampanjRadInloggad.tsx`)

Logiken (cookien, mätningen, timern) står kvar. Bara markupen byts, och `TEMA`-objektet med hexkoder tas bort:

```tsx
<div className={`km-rad-inloggad km-tema-${kampanj.tema}`}>
  <div className="km-rad-in">
    <Link href={kopstegHref(SALD_PLAN, 'kampanjrad')} prefetch={false} onClick={...}>
      <span className="km-platta km-platta-liten">{kampanj.namn}</span>
      <span className="km-rad-lang">{KAMPANJ_ORD.radInloggad(kampanj)}</span>
      <KampanjLiten k={kampanj} utanPlatta enheter={2} />
      <span className="km-rad-kop">{kampanj.copy.kortKnapp}</span>
    </Link>
    <button type="button" onClick={stang}>{kampanj.copy.kortStang}</button>
  </div>
</div>
```

Höjden ändras från 44 px till **60 px i telefon** (platta och "Köp Premium, 99 kr" på första raden, "Slutar om 6 d 16 tim" på andra) och **52 px från 1024 px**. Servern avgör redan om raden finns, så inget flyttar sig. Kontrollera de ställen som räknar med 44 px (sök `h-11` och `44` kring `kampanjRad` i `DashboardShell.tsx` och i väggarnas toppmått).

### 6.2 Sidomenyn (`src/components/rum/Sidomeny.tsx`)

På gratisnivån under en kampanj kontot kan få (`useKampanjPris()` ger en kampanj) byts chipet "149 kr/mån" mot kampanjens pris, och en andra rad säger varför:

```tsx
<Link href="/dashboard/prenumeration" className={`km-meny km-tema-${k.tema}`}>
  <span>Prenumeration</span>
  <span className="km-meny-pris">{k.pris} kr</span>
  <KampanjLiten k={k} utanPlatta medNamn utanLage paPapper enheter={2} />
</Link>
```

Rad 1: "Prenumeration" och brickan "99 kr" i kampanjens färg med klack. Rad 2 (11,5 px): **Black Week** 6 d 16 tim kvar. Raden blir 60 px hög i stället för 44. Använd menyradens befintliga href, aktiva markering och fokusstil; `km-meny` ger bara rutnätet och brickan. Utan kampanj, eller för den som har eller haft Premium: som i dag. Se `kopsteg-bw-1440.png` (sidomenyn till vänster) och `smatt-cm-1440.png`, punkt 3.

### 6.3 Betalväggarnas prisrad

`PremiumPrisradText` i `KampanjPrisKontext.tsx` får märket på egen rad före texten när en kampanj gäller:

```tsx
export function PremiumPrisradText() {
  const k = useKampanjPris()
  return (
    <>
      {k ? <><KampanjLiten k={k} paPapper enheter={2} /><br /></> : null}
      {premiumPrisrad(k)}
    </>
  )
}
```

Gör samma sak i `PaywallCard.tsx` där prisraden skrivs. På mörk botten (en vägg): utan `paPapper`. De ställen som bygger prisraden som ren sträng (`src/lib/tester/steg2/copy.ts`, `src/lib/tester/v4/gratis.ts`, `src/components/paywall/paywall-copy.ts`) lämnas i natt: där står priset fortfarande som text utan märke. Se `smatt-bw-1440.png`, punkt 6.

### 6.4 Köpsteget (`/dashboard/valj-spar`)

Se `kopsteg-ord-1440.png`, `kopsteg-bw-1440.png`, `kopsteg-bw-412.png`, `kopsteg-bw-hel-412.png` (hela sidan utrullad), `kopsteg-bw-kryssad-412.png`.

**Formen.** FlowShell står kvar (toppraden "Kom igång", kopparlinjen, krysset). Innehållet får rummens form:

1. **Väggen** bär namnet och priset. Ordinarie: Premiums mörkaste indigo (`--vagg-3`) med kopparklack, rubriken "Jobbcoach Premium", "149 kr" i 60/76 px, "i månaden, säg upp när du vill.", "Allt öppnas direkt efter betalningen.", och till höger de fyra delarna som plattor i sina färger (det som öppnas). Kampanj: kampanjens nattbotten, plattan och "FÖRSTA MÅNADEN" över rubriken, "99 kr", struket "149 kr", pillen "Du sparar 50 kr", "första månaden, sedan 149 kr i månaden. Säg upp när du vill.", och till höger nedräkningen i en egen ruta. I telefon går väggen kant till kant med runda nedre hörn (28 px), på dator är den en ö med alla hörn runda (32 px).
2. **Två lyfta kort** som går 30 px upp i väggen. Vänster: "DET HÄR INGÅR I PREMIUM" och listan. Höger: Förnyas, Uppsägning, Ångerrätt som tre rader (etikett i versaler, värdet under), och rutan "Första steget: ladda upp CV:t". Under korten länken "Börja gratis i stället".
3. **Foten** bär samtycket och knappen, intill varandra. Samtycket står i en egen ruta med 26 px kryssruta; ikryssad blir rutan grön (`--positiv`, `--positiv-mjuk`). Knappen "Till betalning, 99 kr" är 56 px med klack. Raden under knappen säger "Kryssa i rutan för att fortsätta." tills rutan är kryssad, sedan "Kortbetalning via Stripe. Kvitto på mejl.". Samma rad, samma höjd, så knappen flyttar sig aldrig när man kryssar. Dator: samtycket till vänster, knappen (320 px) till höger. Telefon: staplat.

Varför samtycket flyttar: i dag ligger rutan längst ned i en lång lista medan knappen står spärrad i foten. Nu syns pris, slutdatum, samtycke och knapp utan att rulla i 412 × 915.

**Juridiken är orörd i ord:** samtyckets text (`samtyckeVidKop`), och värdena för Förnyas, Uppsägning och Ångerrätt (`KOPSTEG.villkor`, `KOPSTEG.fornyasVarde`) skrivs ut exakt som i dag. Kryssrutan är fortfarande en riktig `<input type="checkbox">` som spärrar knappen, och `consent` skickas som förut.

**FlowShell (`src/components/shell/FlowShell.tsx`): en ny valfri prop.**

```tsx
/** Egen fot i stället för knappraden. Skalet behåller ramen (papper, kant, safe-area) och mätningen av --flow-footer-h. */
footer?: ReactNode
```

- `const showFooter = Boolean(footer) || Boolean(primaryLabel && onPrimary)`
- I `<footer>`: `{footer ?? (<div className={...}> ...dagens innehåll... </div>)}`
- Lägg `footer` i beroendelistan till effekten som mäter foten. Inget annat flöde påverkas.

**`ValjSparClient.tsx`, steget `kop`.** Importera `./kopsteg.css` (lägg filen bredvid). Skelett:

```tsx
<div data-rum="tran" className="contents">
  <FlowShell
    title={KOPSTEG.topp}
    step={1}
    totalSteps={1}
    utanRaknare
    bred
    onExit={() => router.push('/dashboard')}
    banner={felBanner ? <div className="px-4 pt-4">{felBanner}</div> : undefined}
    footer={
      <div className="kop-fot">
        <label ref={villkorRef} className="kop-samtycke">
          <input type="checkbox" checked={samtycke} onChange={(e) => bockaSamtycke(e.target.checked)} aria-describedby="kop-hjalp" />
          <span>{samtyckeVidKop(plan, new Date(), kampanj)}</span>
        </label>
        <div className="kop-betala">
          <button type="button" className="kop-knapp" onClick={tillKassan} disabled={!samtycke || busy}>
            {busy ? KOPSTEG.busy : KOPSTEG.primar(plan, kampanj)}
          </button>
          <p id="kop-hjalp" className="kop-hjalp" aria-live="polite">
            {samtycke ? KOPSTEG.fotnot : KOPSTEG.samtyckeSparr}
          </p>
        </div>
      </div>
    }
  >
    <div className={`kop${kampanj ? ` km-tema-${kampanj.tema}` : ''}`}>
      <section className="kop-vagg" aria-label={KOPSTEG.rubrik(plan)}>
        <div className="kop-vagg-in">
          <div>
            {kampanj ? (
              <p className="kop-huvud">
                <span className="km-platta">{kampanj.namn}</span>
                <span className="kop-forsta">{KAMPANJ_ORD.forsta}</span>
              </p>
            ) : null}
            <h2 className="kop-rubrik">{KOPSTEG.rubrik(plan)}</h2>
            {kampanj ? (
              <>
                <p className="kop-pris">
                  <b>{kampanj.pris} kr</b>
                  <span className="kop-bredvid">
                    <s><span className="sr-only">{KAMPANJ_ORD.ordinarie} </span>{PLAN_BY_KEY[plan].amount} kr</s>
                    <span className="km-spar">{KAMPANJ_ORD.sparar(kampanj)}</span>
                  </span>
                </p>
                <p className="kop-prisrad">{KOPSTEG.prisradKampanjUtanBelopp()}</p>
              </>
            ) : (
              <>
                <p className="kop-pris"><b>{PLAN_BY_KEY[plan].amount} kr</b></p>
                <p className="kop-prisrad">{KOPSTEG.prisradUtanBelopp(plan)}</p>
              </>
            )}
            <p className="kop-under">{KOPSTEG.under}</p>
          </div>
          {kampanj ? (
            <div className="kop-tid"><KampanjUr k={kampanj} storlek="stor" /></div>
          ) : (
            <ul className="kop-delar" aria-label="Alla fyra delarna ingår">
              {(['tran', 'cv', 'brev', 'jobb'] as const).map((del) => (
                <li key={del} data-del={del}><i aria-hidden="true">{/* rummets ikon, samma som i sidomenyn */}</i>{RUM_NAMN[del]}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="kop-golv">
        <section className="kop-kort" aria-label={KOPSTEG.farEtikett}>
          <p className="kop-ey">{KOPSTEG.farEtikett}</p>
          <ul className="kop-lista">
            {PAKET_KORT.allt.ingar.map((rad) => (
              <li key={rad}>
                <span className="kop-bock" aria-hidden="true"><Check strokeWidth={3} /></span>
                <span>{rad}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="kop-kort" aria-label="Villkor">
          <dl className="kop-villkor">
            <div><dt>{engangs ? KOPSTEG.villkor.galler : KOPSTEG.villkor.fornyas}</dt><dd>{KOPSTEG.fornyasVarde(plan, datum)}</dd></div>
            <div><dt>{KOPSTEG.villkor.uppsagning}</dt><dd>{KOPSTEG.villkor.uppsagningVarde}</dd></div>
            <div><dt>{KOPSTEG.villkor.angerratt}</dt><dd>{KOPSTEG.villkor.angerrattVarde}</dd></div>
          </dl>
          <div className="kop-forsta-steg">
            <IlluScenCv className="kop-scen" />
            <div><b>{KOPSTEG.forstaSteg.rubrik}</b><span>{KOPSTEG.forstaSteg.text}</span></div>
          </div>
        </section>
        <p className="kop-gratis">
          <button type="button" onClick={borjaGratis} disabled={busy}>{SPARVAL.sekundar}</button>
        </p>
      </div>
    </div>
  </FlowShell>
</div>
```

Anmärkningar:

- `data-rum="tran"` på en omslutande `div` med `display: contents` ger steget indigons golv, ton och kanter utan att sidomenyn byter rum. `kopsteg.css` använder bara rummens tokens (`--vagg-3`, `--papper`, `--kant`, `--ton`, `--ink-*`, `--positiv*`, `--koppar*`), så mörkt läge följer med. Kontrollera mörkt läge en gång.
- Två nya hjälpare i `KOPSTEG` (`src/components/pricing/paket-copy.ts`), samma ord som dagens prisrader utan beloppet först:
  - `prisradUtanBelopp: (plan) => `${PLAN_BY_KEY[saljbarPlan(plan)].suffix}, säg upp när du vill.`` ger "i månaden, säg upp när du vill."
  - `prisradKampanjUtanBelopp: () => `första månaden, sedan ${PLAN_BY_KEY[SALD_PLAN].amount} kr i månaden. Säg upp när du vill.``
- `KOPSTEG.samtyckeSparr` ändras från "Kryssa i rutan ovanför för att fortsätta." till **"Kryssa i rutan för att fortsätta."** (på dator står rutan till vänster om knappen, inte ovanför). Används strängen i andra flöden med rutan ovanför är den lika sann där.
- `KOPSTEG.kampanjRad` (den svarta remsan över rubriken) används inte längre i steget.
- Det sekundära i foten (`footerSecondary`) försvinner: "Börja gratis i stället" står under korten, fotnoten under knappen.
- Steget `gratisval` rörs inte.
- `useFriSikt(villkorRef, ...)` står kvar på samtyckets `label`. Kontrollera på Pixel 7 att kakrutan inte täcker samtycket eller knappen.
- Händelserna (`purchase_step_viewed`, `consent_checked`, `paywall_cta_clicked`, `checkout_started`) och anropet till `create-plan-session` är oförändrade.

**När kampanjen byts medan steget är öppet.** `page.tsx` ger klienten en nyckel, så att den startar om med nytt pris och okryssad ruta när servern svarar med en annan kampanj efter `router.refresh()` (avsnitt 4.3):

```tsx
<ValjSparClient key={kampanjVisning?.nyckel ?? 'ordinarie'} ... kampanj={kampanjVisning} />
```

Kassans 409 `prisAndrat` står kvar som skyddsnät, oförändrad.

## 7. Nya och ändrade textrader, ordagrant

| Var | Text |
|---|---|
| Märket, över priset | Första månaden |
| Märket, pille | Du sparar 50 kr (Cyber Monday: Du sparar 100 kr) |
| Märket, under priset | Sedan 149 kr i månaden. Säg upp när du vill. |
| Prislappen, under priset | Sedan 149 kr i månaden. |
| Märket, före det strukna priset (bara skärmläsare) | Ordinarie pris |
| Nedräkningen, läge 0 | Slutar om |
| Nedräkningen, läge 1 | Sista dygnet |
| Nedräkningen, läge 2 | Sista timmen |
| Nedräkningen, läge 3 | Erbjudandet har gått ut |
| Brickornas enheter | dag, dagar, timme, timmar, minut, minuter, sekund, sekunder |
| Textformens enheter | d, tim, min, sek |
| Reservläget, stor och mellan | Gäller till och med söndag 29 november 23.59 (Cyber Monday: Gäller bara måndag 30 november till 23.59) |
| Reservläget, liten | Till och med söndag 29 november 23.59 (Cyber Monday: Bara måndag 30 november till 23.59) |
| Publika raden, telefon | Första månaden 99 kr (Cyber Monday: Första månaden 49 kr) |
| Inloggade raden, dator | Första månaden Premium för 99 kr. |
| Prissidan, över h1 | Första månaden 99 kr. Sedan ordinarie pris: |
| Sidomenyn, efter tiden | kvar |
| Köpsteget, under knappen (ändrad) | Kryssa i rutan för att fortsätta. |
| Köpsteget, aria-label på villkorskortet | Villkor |
| Köpsteget, aria-label på delarna | Alla fyra delarna ingår |

Allt annat är dagens texter ur `kampanj.ts`, `paket-copy.ts` och `plans.ts`. Inga påhittade tal och ingen brådska utöver klockan: "Sista dygnet" och "Sista timmen" räknas ur `slut`.

## 8. Fil för fil

| Fil | Ändring |
|---|---|
| `src/lib/kampanj/kampanj.ts` | `KAMPANJ_ORD`. `kampanjSkript` enligt 4.3 (funktion, tema). Den gamla `KampanjPris`-kommentaren kan stå. |
| `src/lib/kampanj/klocka.ts` (ny) | `KLOCKA_KOD`, ur `klocka.js`. |
| `src/lib/kampanj/__tests__/kampanj.test.ts` | Skriptets nya sträng, temat i listan. |
| `src/components/kampanj/kampanj.css` (ny) | Ur `docs/design/kampanjmarke-2026-11-23/kampanj.css`, oförändrad. |
| `src/components/kampanj/KampanjMarke.tsx` (ny) | `KampanjPris`, `KampanjUr`, `KampanjLiten`, `KampanjOrd` (3.1). |
| `src/components/kampanj/Kampanj.tsx` | Importera CSS:en. `KampanjHuvud`: klockan i skriptet, gamla radregler bort. `KampanjVarianter` får `som`. Gamla `KampanjPris` bort (exportera den nya härifrån). `MedKampanjPris` med ordet. `KampanjRadPublik` ny markup. |
| `src/components/kampanj/KampanjMatning.tsx` | En effekt på sökvägen som anropar `window.__kampanjTick?.()`. |
| `src/components/kampanj/KampanjRadInloggad.tsx` | Ny markup (6.1), `TEMA` bort. |
| `src/components/kampanj/KampanjPrisKontext.tsx` | `PremiumPrisradText` med märket (6.3). |
| `src/components/publikt/v3/Premium.tsx` | `km-yta`, ramen `p3-premium-kop`, kampanjens fotnot, `utanUppsagningIKampanj` på `PrisRad` (5.2, 5.3). |
| `src/components/publikt/v3/ram.css` | `.kampanj-rad.p3-kampanj`-reglerna bort. |
| `src/components/publikt/PremiumBlock.tsx` | Import, `storlek="mellan"`. |
| `src/app/(public)/priser/page.tsx` | `km-yta` på lappen, etiketten över h1, `utanUppsagningIKampanj`. |
| `src/components/artiklar/reklam/ArtikelReklam.tsx` | `km-yta` på Premium-sidokortet, `storlek="mellan"`. |
| `src/components/rum/Sidomeny.tsx` | Prenumerationsraden under kampanj (6.2). |
| `src/app/dashboard/DashboardShell.tsx` | Lyssna på `kampanj-slut` och kör `router.refresh()`. Anropa `__kampanjTick` vid byte av sökväg. Radens nya höjd om något räknar med 44 px. |
| `src/components/paywall/PaywallCard.tsx` | Märket över prisraden (6.3). |
| `src/components/shell/FlowShell.tsx` | Propen `footer` (6.4). |
| `src/app/dashboard/valj-spar/kopsteg.css` (ny) | Ur `docs/design/kampanjmarke-2026-11-23/kopsteg.css`, oförändrad. |
| `src/app/dashboard/valj-spar/ValjSparClient.tsx` | Steget `kop` enligt 6.4. |
| `src/app/dashboard/valj-spar/page.tsx` | `key` på klienten. |
| `src/components/pricing/paket-copy.ts` | Två hjälpare, `samtyckeSparr` ändrad. |
| Tester som läser gammal markup | `src/app/(public)/verktyg/rekryteringstester/__tests__/premium-pris-kampanj.test.tsx`, `src/app/dashboard/valj-spar/__tests__/`, `scripts/qa-kampanj.mjs`: uppdatera till ny markup och ny sträng. |

## 9. Kontroll före push

1. **Ordinarie läge orört:** startsidans Premium-ö och prislappen med `localStorage.kampanj_nu = '2026-12-02T10:00:00+01:00'` ser ut som före bygget.
2. **Black Week och Cyber Monday** i 1440 och 412 mot bilderna: startsidan, `/priser`, en verktygssida, en artikel med sidokort, köpsteget, hemskärmen med raden och sidomenyn. `kampanj_nu = '2026-11-30T07:00:00+01:00'` ger Cyber Monday publikt; inloggat styrs av `KAMPANJ_NU` på servern.
3. **Lägena:** `kampanj_nu = '2026-11-29T09:27:00+01:00'` (sista dygnet, sekunder), `'2026-11-29T23:16:00+01:00'` (sista timmen, fyllda brickor), `'2026-11-29T23:59:50+01:00'` (vänta: "Erbjudandet har gått ut", sedan byter sidan till Cyber Monday av sig själv).
4. **Reservläget:** blockera skript i DevTools och ladda om. Slutdatumet står i klartext på varje yta, ingenting är tomt.
5. **Minskad rörelse** (emulera i DevTools): inga sekunder någonstans.
6. **Ingen sidledsrullning i 412**, CLS 0 på startsidan och `/priser` i kampanjläge (ytorna är mätta i skissen utan överskjutande bredd).
7. **Hydrering:** inga fel i konsolen på startsidan, `/priser` och köpsteget. Om React ändå klagar på ett märke saknas `suppressHydrationWarning` på ett av de fem elementen i 3.1.
8. **Köpet:** kryssa, "Till betalning, 99 kr", kassan öppnas med rätt belopp. Samtyckets text i Stripe-metadatan är densamma som före.
9. SEO-diffen: h1 och rubrikträdet oförändrade på alla sidor, inga nya eller borttagna länkar.

## 10. Det som är osäkert

- **Klockan mot hydreringen** är provad i skissen som ren HTML, inte i Next. Principen (fast platshållartext i React, `suppressHydrationWarning` på elementen klockan skriver i) är beprövad, men prova startsidan och köpsteget med konsolen öppen först av allt. Går det fel på en yta: ta bort `data-kn` där, så står reservläget (slutdatumet) och ytan är ändå färdig.
- **`display: contents` på `.p3-premium-text`** flyttar listan till vänster kolumn på dator. Har någon sida egna `children` i `PremiumO` hamnar de i vänster kolumn efter texten. Titta på varje sida med Premium-ö i 1440.
- **Sidokortets höjd** (cirka 690 px) i artiklar på låga skärmar.
- **Inloggade radens höjd** (60/52 i stället för 44 px) kan påverka mått som räknar med raden.
- **Den äldre `PremiumBlock.tsx`** och ensamma `PrisRad` på papper utanför prislappen är inte ritade yta för yta. Regeln i 5.5 gäller.
- **Prisrader som är rena strängar** i testrummets copy-filer får inget märke i natt (6.3).
