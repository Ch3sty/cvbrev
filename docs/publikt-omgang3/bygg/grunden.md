# Grunden (P0): bruksanvisning

Allt ligger i `src/components/publikt/v3/` och importeras från ett ställe. Alla komponenter är serverkomponenter (importera dem inte i en klientkomponent: barrel-filen drar med sig allt). Klasserna heter `p3-*` och krockar inte med `publikt.css` (`pub-*`) eller inloggat. Se allt i drift på `/forhandsvisning-publikt/v3` (lokalt, eller med `PUBLIKT_FORHANDSVISNING=1`).

```tsx
import {
  Sida, Hjalte, Lyft, Sektion, SektionHuvud, Kort, KortBild, Rutnat, Chip, Nr, Talbrickor,
  VagSteg, Faq, LankBricka, O, PremiumO, PrisRad, Bocklista,
  Knapp, Knapprad, TextLank, GratisRad, Ikon, Dorr,
  CvArk, Svav, Testram, Stig, Traff, TraffRad, MatchadeJobb, Matchgrad, Brevpar, Samtal, MallMiniatyr,
} from '@/components/publikt/v3'
```

## 1. Färgen: så väljer en sida sin färg

Fem färger: `tran` (Rekryteringstester, indigo), `cv` (petrol), `brev` (plommon), `jobb` (skog), `neutral` (grafit).

```tsx
export default function Page() {
  return (
    <Sida farg="cv">
      <Hjalte ... />
      ...
    </Sida>
  )
}
```

- `<Sida farg>` sätter `data-p3-sida` på sidans yttersta element. `globals.css` (blocket PUBLIKT OMGÅNG 3) lyfter färgen till roten, så att **menyn, kampanjraden och foten** står i samma färg. En sida har exakt ett `Sida`.
- En yta i en annan färg (en ö, ett kort, en sektion) får `farg` på sig själv: `<O farg="jobb">`, `<Sektion farg="brev">`, `<Kort farg="cv">`. Det gäller bara lokalt och lyfts aldrig.
- Sidor som ännu inte har `Sida` får en färg ur adressen (`fargForSokvag` i `farg.ts`, menyn sätter `data-p3-sokvag`). Startsidan, `/funktioner`, `/priser`, `/om-oss` och testsidorna är `tran`, CV-sidorna `cv`, brevsidorna `brev`, Jobbsökets sidor och `/jobbkartan` `jobb`, allt annat `neutral`. **Sidan vinner alltid över adressen.** Artiklar sätter klustrets färg med `<Sida farg>` (beslut 8).
- Tokens att använda i egen CSS: `--vagg`, `--vagg-2`, `--vagg-3` (mörkast, Premium), `--vagg-ink`, `--vagg-mjuk`, `--golv`, `--ton`, `--ton-ink`, `--ljus`, `--kant`, `--kant-stark`, `--papper`, `--papper-2`, `--ink-1/2/3`, `--koppar`, `--koppar-ink`, `--koppar-ljus`, `--koppar-mjuk`, `--koppar-klack`, `--disp` (rubriksnittet).
- Gamla Tråd-namn (`--mark`, `--panel`, `--insunken`, `--premium`, `bg-mark`, `bg-ink-1`) pekar nu på de nya färgerna på publika sidor. Det är därför gamla sidor står hela medan ni bygger. Använd dem inte i ny kod.
- Publika sidor är bara ljusa. Mörkt läge finns inte publikt längre.

## 2. Skalet och sektionerna

**`Sida`** `{ farg, id?, className?, children }`

**`Hjalte`** (väggen överst)
| prop | |
|---|---|
| `brodsmulor?: {name, href}[]` | synliga brödsmulor + BreadcrumbList-JSON-LD. `brodsmulorSchema={false}` om sidan redan skriver schemat |
| `chip?` | t.ex. `<Chip typ="vagg">Gratis för varje CV</Chip>` |
| `etikett?` | egen rad ovanför h1 |
| `h1` | rubriken, ordagrant sidans |
| `h1Etikett?` | etikett INUTI h1 (beslut 4). `<h1><span class="p3-over">CV-analys med läsbarhetspoäng</span> Se var ...</h1>` |
| `h1Mindre?` | 36/54 px för långa rubriker |
| `varde?` | värdemeningen, fet text med `<b>` |
| `children?` | mer text: `<p className="p3-text">` |
| `knappar?` | `<><Knapp href pil>..</Knapp><TextLank href>..</TextLank></>` |
| `brickor?: {tal, text, ord?}[]` | talbrickorna. Talen ur konstanter. `ord: true` för ord som "Anonym" |
| `bild?` | `CvArk`, `Testram`, `Brevpar`, egna kort |
| `lyft?` | sätt när ett `<Lyft>` följer direkt (annars lägre nederkant) |
| `farg?` | sällan: annan färg än sidans |

```tsx
<Hjalte
  brodsmulor={[{ name: 'Hem', href: '/' }, { name: 'Verktyg', href: '/verktyg' }, { name: 'CV-analys', href: '/verktyg/cv-analys' }]}
  chip={<Chip typ="vagg">Gratis för varje CV</Chip>}
  h1Etikett="CV-analys med läsbarhetspoäng"
  h1="Se var ditt CV tappar, del för del"
  varde={<>Vi går igenom ... <b>Poängen och genomgången är gratis för varje CV.</b></>}
  knappar={<><Knapp href="#analys" pil>Analysera mitt CV</Knapp><TextLank href="#poangen">Så räknas poängen</TextLank></>}
  brickor={[{ tal: '7', text: 'delar i genomgången' }, { tal: '100', text: 'poäng att nå' }, { tal: '0 kr', text: 'för poängen, varje CV' }]}
  bild={<CvArk poang={{ tal: 93, text: 'av 100 i dag' }} kvar="7 poäng kvar till 100" fynd={{ rubrik: 'Erfarenhet', poang: '30 av 35', andel: 86, text: '...' }} />}
  lyft
/>
<Lyft><p className="p3-ey">Prova utan konto</p><h2 className="p3-h2">Analysera ditt CV direkt</h2>...</Lyft>
```

**`Lyft`** `{ id?, etikett? (aria-label), className?, children }`: det stora pappret som går in över hjältens nederkant. Direkt efter `<Hjalte lyft>`.

**`Sektion`** `{ id?, botten?: 'golv'|'ton'|'papper'|'vagg', farg?, luft?: 'normal'|'utan-topp'|'tat', utanBredd?, className?, aria-label? }`. Lägger innehållet i `.p3-bredd` (max 1240, 16/40 px kant). Grannar ska helst inte dela botten.

**`SektionHuvud`** `{ etikett?, rubrik, rubrikNiva?: 'h1'|'h2'|'h3' (h2), rubrikId?, varde?, mitt?, children? }`. Det som följer får rätt luft automatiskt.

Typografi för egen markup: `p3-h1`, `p3-h2`, `p3-h3`, `p3-varde`, `p3-text`, `p3-ey` (etikett), `p3-liten`. På vägg och ö blir de ljusa av sig själva, på papper bläck.

## 3. Byggstenar

- **`Kort`** `{ ton?, farg?, som?, id?, className?, style? }`. Papper med klack. Text i kortet är alltid bläck, också på en vägg eller ö. **`KortBild`** är bildytan i ett kort.
- **`Rutnat`** `{ kolumner?: 2|3|4 (3), som?, className? }`. En kolumn i telefonen, två från 700 px.
- **`Chip`** `{ typ?: 'ton'|'gratis'|'premium'|'vagg'|'koppar' }`. `vagg` på mörk botten.
- **`Nr`** `{ typ?: 'ton'|'koppar'|'vagg' }`. Numrerad bricka, `aria-hidden`.
- **`Talbrickor`** `{ brickor, paPapper? }`. Fyra brickor bryter två och två i telefonen.
- **`VagSteg`** `{ steg: {rubrik, text?, bild?, koppar?}[], rubrikNiva? }`. Stegen som väg. 3 eller 4 på en rad, 5 blir 3 + 2, 6 till 8 blir tre per rad. HowTo: bygg JSON-LD ur samma lista.
- **`Faq`** `{ id?, etikett?, rubrik?, rubrikNiva?, ingress?, fragor: FaqFraga[], forstaOppen? (true), schema? (false), efter? }`. Samma `FaqFraga` och `faqSchema` som gamla `publikt/Faq`, så frågorna flyttas utan ändring. `schema` bara om page.tsx inte redan skriver FAQPage.
- **`LankBricka`** `{ href, rubrik, text?, farg?, ikon? }`. Dörr i delens färg. Ankartexten är rubriken.
- **`O`** (ön) `{ farg?, vand?, ikon?, etikett?, rubrik?, rubrikNiva?: 'h2'|'h3' (h3), varde?, children?, knappar?, bild?, som? ('article'), id? }`. Stort färgblock, text och bild. Utan bild: bara text.
  ```tsx
  <O farg="tran" etikett="Inför urvalstestet" rubrik="Rekryteringstester"
     varde={<><b>Känn igen uppgiften innan provdagen.</b> Logik, verbalt ...</>}
     knappar={<><Knapp href="/verktyg/rekryteringstester" variant="vit">Så fungerar det</Knapp><GratisRad chip={<Chip typ="vagg">Gratis</Chip>}>Grundnivån i alla åtta testtyperna</GratisRad></>}
     bild={<Testram />}>
    <p>Åtta testtyper i tre nivåer ...</p>
  </O>
  ```
- **`PremiumO`** `{ etikett? ("Jobbcoach Premium" ur plans.ts), rubrik, rubrikNiva?, text?, pris? (true), uppsagning?, knapp?: {text, href, dataCta?} | ReactNode, not?, punkter?, children? }`. Sidans mörkaste ton med kopparklack.
- **`PrisRad`** `{ uppsagning?, paPapper? }`. "149 kr i månaden" ur plans.ts, kampanjpriset följer med av sig självt.
- **`Bocklista`** `{ punkter, paPapper? }`.
- **`Knapp`** `{ href, variant?: 'koppar'|'vit'|'glas', liten?, bred?, pil?, som?: 'lank'|'knapp'|'bild' }` + övriga attribut (`data-cta`, `data-primar`, `aria-*`) skickas vidare. Exakt en koppar per skärmyta. `som="bild"` för en knapp i en ritad skärm (ingen handling). `som="knapp"` ger `<button type="button">`.
- **`TextLank`** `{ href }`, **`Knapprad`**, **`GratisRad`** `{ chip?, children }` ("Gratis  Tre träffar" bredvid knappen).
- **`Ikon`** `{ namn }` och **`Dorr`** `{ ikon }`. Namn: `tran`, `cv`, `brev`, `jobb`, `neutral`, `pil`, `ner`, `meny`, `upp`, `las`, `bock`, `x`, `tillbaka`. Aldrig gnistikonen.
- Hjälpklass **`p3-papper`**: egen pappersyta på vägg eller ö får bläck i rubriker, stycken, etikett och liten text (fällan i alla noter).

## 4. Bilderna ur produkten

Rita aldrig egna varianter. Allt innehåll är props, Sara Lindström är förval. Alla har `aria-label` som börjar med "Exempel".

- **`CvArk`** `{ namn?, kontakt?, delar?: {rubrik, rader?: {text, tid?}[], linjer?: ('hel'|'m'|'k'|'s')[]}[], vald? (3), nalar? (true), poang?: {tal, text}, kvar?, fynd?: {rubrik, poang, andel, text}, liten?, luta? (true) }`. Namnet är del 1, `delar` följer som 2, 3 ... Utan `poang/kvar/fynd` blir det bara arket.
- **`Svav`** `{ stor?, under?, mindre?, statisk?, gungar?, sen?, className?, style?, children? }`. Svävande bricka, absolut placerad (sätt `style`), `statisk` i flödet.
- **`Testram`** `{ test?, niva?, uppgift? (9), av? (15), tid? ('4:12', null = ingen), bitar?, brade? (matrisen, null = inget bräde), bradeKolumner?, stycke?, fraga?, svar?: {figur?|text?, tillstand?: 'vald'|'ratt'|'fel'}[], svarKolumner?, knapp? ('Nästa', null = ingen fot), dom?: {ratt, rubrik, etikett?, regel, text?} }`. En ram för alla tester: kryss, namn och nivå, räknaren och klockan som egna brickor, framsteg i bitar, bokstavsbrickor på svaren. Figurer: `t c k` (triangel, cirkel, kvadrat) och `tp cp kp` (med prick), `tx cx kx` (med kors), `pil`, `l`. Förvalet är en kontrollräknad matrisuppgift (svar C). **Byt bara mot uppgifter ur bankerna eller sådana sidan redan visar.** Ord: uppgift, Nästa, Svara, Lämna in, Visa resultatet.
- **`Stig`** `{ skaSokas?, sokt?, intervju?, erbjudande?: {namn, under?}, tyst? (null = ingen), brickor?: {skaSokas?, sokt?: string[], intervju?}, paPapper? }`. Står på mörk botten; `paPapper` lägger en egen mörk platta. Rättad för 375 px. Ordet "spår" skrivs aldrig.
- **`Traff`** `{ titel?, arbetsgivare?, ort?, matchgrad? (null = ingen ring), sistaDag?, skal?: {rubrik, text?, kompetenser?}[], kompetenser?, handlingar? }`, **`TraffRad`** `{ titel, arbetsgivare, ort, matchgrad, sistaDag? }`, **`Matchgrad`** `{ varde, liten? }`, **`MatchadeJobb`** `{ topp?, senast?, traff?, fler? }` (vyn som helhet, på mörk botten). Påhittade arbetsgivare, aldrig riktiga företag, aldrig lön.
- **`Brevpar`** `{ annonsTitel?, krav?: {text, uppfyllt}[], namn?, kontakt?, rubrik?, stycken?: ReactNode[] (märk med <mark>), bricka? }`. "3 av 4 krav har fått svar" räknas ur `krav`.
- **`Samtal`** `{ meddelanden?: {fran: 'du'|'coach', text, under?}[], forslag?, yta? }`. Ingen källhänvisning till namngivna regler, inga belopp.
- **`MallMiniatyr`** `{ id, typ?: 'cv'|'brev', storlek?: 'liten'|'stor', namn? (true), chip? (true), format?, href?, prioritet? }`. Den riktiga bilden ur `public/mallar`, fasta mått, chip Gratis/Premium ur katalogen. Brevminiatyrer finns bara för linne, bjork, koppar, kalksten, granit, fasad, terrakotta och ritning (`public/mallar/brev`); CV-miniatyrer för alla 40.

## 5. Menyn, foten och kampanjraden

Gemensamma, byggda i P0. Ni rör dem inte.
- `src/components/landing/LandingNavbar.tsx` (klient), innehållet i `LandingNavbarMega.tsx` (server), datan i `nav-data.ts`. Fyra delar som i skissen `meny`, Sökta tjänster pekar på `/verktyg/sokta-tjanster` (`SOKTA_TJANSTER_HREF`).
- `src/components/Footer.tsx`: fyra kolumner i samma ordning, alla dagens länkar.
- Kampanjraden (`KampanjRadPublik`) har grundens form, logiken är oförändrad.
- Menyn är 64 px hög i telefonen och 76 px på dator. Ankare i `Sida` får `scroll-margin-top: 92px` av sig själva.

## 6. Gör inte så här

- Sätt inte `data-rum` på en publik sida. Det slår på inloggats regler och färgerna lyfts fel. Använd `farg`.
- Lägg inte ett andra `<Sida>` på en sida, och lägg inte `data-p3-sida` på en sektion: det lyfts till roten och menyn byter färg. En sektion får `farg`.
- Importera inte inloggade komponenter (`src/components/rum`, `session`, `brev3`, `jobb3`) och rita inte egna testramar, CV-ark, spår, träffar eller brev. Saknas något i en bild: skriv det i `onskemal.md`.
- Skriv inte hex i sidorna. Använd tokens. Inget beige, inget svart, inget `bg-white` som sidbotten.
- Hårdkoda inga tal (`TEMPLATE_COUNT`, `ANTAL_TESTTYPER`, `PLANS`, `BREV_MALL_ANTAL`, `TESTTAL` ...).
- Använd inte `loading="lazy"` på hjältens bild (LCP). `MallMiniatyr prioritet` för den som är LCP.
- Använd inte klasserna `p3-*` med andra betydelser i egen CSS. Egna klasser får eget prefix per sida.
- Ingen ny klientkod för det som går i CSS. Grunden har ingen.
- Animationer bara via `gungar` (av under `prefers-reduced-motion`).

## 7. Önskemål

Skriv i `docs/publikt-omgang3/bygg/onskemal.md` (lägg till en rad, skriv inte över). Det som fler än en sida behöver läggs in i grunden.
