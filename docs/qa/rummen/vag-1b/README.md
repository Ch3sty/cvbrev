# Rummen, våg 1b: skalet, byggstenarna och vyerna

Datum 2026-10-10/11. Branch `design/rummen-1b` från `design/rummen`, där
`design/rummen-1a` är inmergad (`8de4ff46`). Ingen push, ingen merge till
`main`. Spec: `docs/design/spec-rummen-2026-10-10.md` (avsnitt 0, 6 våg 1b,
7, 9, 12, 13 med 13.1 och 13.9). Facit för utseendet:
`docs/design/koncept-testvy-2026-10-10.html`.

**Status:** byggt, typkontrollerat (`tsc` rent), `vitest` 954 av 955 (det
enda felet är `prov-rad.test.ts`, som fanns före och enligt 13.9 inte rörs),
`next build` med `NEXT_DIST_DIR=.next-r1b` grönt. Prestanda: CLS 0 på alla
39 routes (inget värde över mätbruset 0,002). Klicktest i riktig Chrome,
Pixel 7 och desktop 1280, ljust och mörkt, tre konton. Grep-grinden och
kontrastskriptet går igenom.

## Vad som är byggt

| Del | Var |
|---|---|
| `data-rum` per route | `src/lib/rum/rum.ts` (`rumForPath` i spec 5:s ordning, `VAGG_FARG`, `DORRAR`, `aktivUndersida`), test i `src/lib/rum/__tests__/rum.test.ts`. `src/proxy.ts` lägger `x-pathname` på begäran så att servern vet rummet redan i första HTML. |
| Statusfältet | `generateViewport()` i `src/app/dashboard/layout.tsx` ger `themeColor` i rummets vägg; `DashboardShell` byter `meta[name=theme-color]` vid rumsbyte. |
| Skalet | `DashboardShell.tsx` omskrivet: `data-rum`, golvet, `Sidomeny` från lg, `Dorrnav` under lg. Gamla `header.tsx`, `MobileBottomNav.tsx`, `Sidebar.tsx` och `sidebar/*` borttagna, Skapa-knappen borta. |
| Byggstenar | `src/components/rum/`: `Vagg`, `Golv`, `Rubrik`, `Topprad`, `RumHuvud`, `LyftKort`, `Kort`, `Rader`/`Rad`, `Chip`, `SektRubrik`, `Dagsrad`, `Dagsring`, `Veckorad`, `Dorrnav`, `Sidomeny`, `VaggLaddar`, `RumKontext`. |
| Knappar | `src/components/shell/knappar.ts`: `KNAPP_PRIMAR` i koppar, `KNAPP_SEKUNDAR`, `KNAPP_GLAS`, smala varianter, `LANK`, `LANK_VAGG`, `KNAPPRAD`. Cirka 82 bläckknappar och 22 kantknappar i inloggat bytta. |
| Symboler | `src/components/illustrations/RumSymboler.tsx` med konceptets koordinater: dörrarna, ikonerna (X, chevron, pil, lås, kalender, bock, info, tillbaka, penna), testsymbolerna, märkena och gradienterna. |
| Flöden och ark | `FlowShell` (3 px kopparlinje, golv, kopparknapp i foten, `lg:left-[248px]`), `Sheet`, `ConfirmDialog`, `StatusRow`, `LoadingSkeleton` (variant `vagg`), `PaywallCard`, `UpgradeSheet`, `FelSpar`. |
| Vyerna | Alla sidor under `/dashboard` har väggen med topprad och rubrik och golvet under: Träningen (hubben, testsidorna, resultat, personlighet, provläget, intervjuprovet), CV (Mina CV, analys, mallar, LinkedIn), Personliga brev (lista, visa, redigera), Jobbsöket (hem, sökta tjänster, ansökan, matchningar, Jobbcoachen, Bli upptäckt, arbetsstil, meddelanden) och Konto (profil, prenumeration, kontakt, felrapport). |
| Utseende | `src/app/dashboard/profil/components/UtseendeSection.tsx`: Följer systemet, Ljust, Mörkt (`localStorage.tema`, `data-theme`, händelsen `tema_bytt`). Länkad från sidomenyn (`/dashboard/profil#utseende`). |
| Fokusringen | `--fokus` (13.2): koppar-ink på golv, papper och ton, koppar-ljus på väggen. |
| Mörkt läge | `text-gray-*`, `bg-white`, `bg-gray-*` och `border-gray-*` är noll i allt som renderas i inloggat, utom dokumentytorna (brevet och mallminiatyren, klassen `.dokument`). |
| Övergångsregeln | Smalnad: står kvar bara för `PaketKort`, `SparKort` och `Intervjuprov`, som delas med publika sidor. |
| linkedin CLS | `CvSelectorList` tar listan som prop från serverns data i stället för att visa skelett tills storen fyllts. 0,292 före, 0 efter. |
| Mätning | `rum_oppnat`, `sokta_tjanster_oppnad`, `tema_bytt` i `src/lib/analytics/events.ts`. |

Under klicktestet hittade och rättade jag dessutom tre skiften och en sen
LCP: chattfältet i Jobbcoachen (`field-sizing: content`, CLS 0,007 till 0),
frågehuvudet i testpasset (platshållaren är nu skarpa lägets markup, 8 px
skifte borta), Ta bort i brevvyn (fick sekundärknappens mått) och
e-postbannern, som målades under testpassets helskärmsläge och blev vyns
LCP-element.

## Prestanda före och efter

Före = våg 1a-bygget (`.next-r1`, port 5240), efter = det här bygget
(`.next-r1b`, port 5232), samma maskin, samma konto, `scripts/perf-inloggat.ts`,
tre körningar per route, Pixel 7 med 3x CPU-strypning och LTE.
Hela tabellen: `perf-jamforelse.md`. Rådata: `perf-fore.*`, `perf-efter.*`,
`perf-efter-omkorning-*` (omkörning av routes som låg över budget).

- **CLS:** efter är varje route 0 eller 0,001 (under bruset 0,002). Före
  låg `tester prov` på 0,068 och `skapa-cv` på 0,011.
- **LCP:** 39 av 39 inom budget efter omkörningen. I huvudkörningen låg
  `kontakt` (1540) och `tester prov` (2332) över; omkörda efter
  bannerfixen gav de 816 och 1356. `dashboard` 1512 före, 888 efter.
- Maskinen svängde mycket under kvällen (samma bygge gav `dashboard` 2304
  i en körning och 888 i nästa), så enskilda tal ska läsas med det i
  minnet.

## Grep och kontrast

- `node scripts/grep-rummen.mjs --vag 1b --noll` går igenom: 0 grå klasser i
  396 filer som renderas i inloggat (`scripts/rummen-omfang.mjs`), 0 filer
  med lucide i `components/dashboard`, `shell` och `rum` (9 i våg 1a).
  Lista: `grep-1b.txt`. Övriga mönster i hela `src/components` (räknas men
  stoppar inte): em-dash 44 (45), bg-white 260 (280), rounded-3xl 22 (26),
  font-bold utan display 303 (305); resten ligger på publika sidor.
- `node scripts/kontrast-rummen.mjs`: inga avvikelser. Nya rader i
  `docs/designsystem.md` avsnitt 2: `fokus` på golv 4,9, papper 5,8, ton
  4,4 till 4,7 i ljust; `koppar-ljus` på vägg 7,6 till 8,9 och vägg-2 5,4
  till 6,9. Allt över 3:1 för grafik. Ren koppar mot golvet (2,5) står kvar
  som "aldrig text" och förklarar varför ringen är koppar-ink. Ändringslogg
  för 1b i avsnitt 14.

## Klicktestet

`scripts/qa-rummen-1b.mjs`, resultat i `resultat-*.json`.

| Del | Utfall | Skärmdumpar |
|---|---|---|
| Vyer, kontot med mycket data | 29 routes, Pixel 7 och desktop, ljust och mörkt: 116 av 116 utan anmärkning (topprad, dörrnav, h1, rätt `data-rum` och `theme-color`, ingen sidled, body rullar aldrig, inga konsolfel, inga 4xx/5xx, inga vita ytor i mörkt) | `vyer/mycket-*.png` |
| Vyer, gratis och Hela paketet (via `premium_grants`) | 12 routes per konto, samma fyra lägen: 96 av 96 utan anmärkning. Gratiskontot ser lås på Provläget och LinkedIn-profilen, Hela paketet inga | `vyer/gratis-*.png`, `vyer/hela-*.png` |
| SSR utan JavaScript | rätt `data-rum` och `theme-color` i serverns HTML för alla fem rum | `resultat-ssr-sidomeny.json` |
| Dörrnavet | 72 px, rätt aktiv dörr i alla rum, alla etiketter på en rad även på 360 px, rumsbyte tonar väggen på 0,24 s och byter statusfältet | `dorrar/` |
| Sidomenyn | rätt grupp och undersida per rum, kopparlinjen, kontoraden, låst rad öppnar arket | `sidomeny/` |
| Fokusringen | koppar-ljus på väggen, koppar-ink (ljust) och den ljusa koppar-ink (mörkt) på golv, papper och ton, 2 px med 2 px offset | `fokus/` |
| Utseende | Mörkt, Ljust och Följer systemet sätter och tar bort `data-theme` och `localStorage.tema` | `tema/` |
| Flöden | brevflödet steg 1 till 4: kopparknappen i foten och Stäng i toppen på varje steg, i båda lägena. CV-kontot hade ett påbörjat utkast, så CV-flödet visade återkomstvalet (kopparknapp i kortet, Stäng finns) | `floden/` |
| Nätverksfel | profilens autospara och brevflödets POST avbrutna: UI:t säger aldrig sparat, felraden syns | `natfel/` |

Skriptets mått "i bild med adressfält" i flödesdelen räknar fel (foten är
`fixed` i en `inset-0`-kolumn och följer den synliga ytan); skärmdumparna
visar knappen i bild.

## Frågor till art-director

1. **Undersidan för `/dashboard/tester`** heter "Alla tester" i 1b. Konceptet
   har "Dagens pass", som kommer med Formkurvan i våg 2. Rätt till dess?
2. **Provläget** visas med lås för konton utan `test_exam_mode`. Ska raden
   synas alls för dem, eller bara när paketet har provläget?
3. **"N nya" på Matchade jobb** saknar data i 1b (ingen räknare för nya
   träffar). Raden står utan chip. Bygga räknaren i våg 2?
4. **Dagsringen för uppvärmning** (tre punkter) finns inte i konceptet. Jag
   valde tre små punkter i ringen. Rita?
5. **Dörrarnas ikoner** fylls med `currentColor` som i konceptets `defs`,
   inte med en kopparyta. Rätt läst?
6. **Väggens handling på korta väggar:** där en vy har en enda handling står
   den som kopparknapp på väggen, annars som glasknapp (till exempel "Nytt
   prov", "Redigera" i ansökan). Stämmer regeln?
7. **Golvet utan LyftKort** får 16 px överluft. Konceptet visar bara vyer
   med lyftkort. OK?
8. **Scenerna** (illustrationerna i Tråden v2.1) är borttagna från väggarna.
   Ska de tillbaka i våg 2 eller är de slut?
9. **Klockan och meddelanden** i toppraden syns bara när något är oläst.
   Länken "Bli hittad av rekryterare" och statustexten som låg i gamla
   headern försvann med det. Godkänt?
10. **Bli upptäckt** heter "Låt jobben hitta dig" innan samtycke och "Bli
    upptäckt" när profilen är aktiv. Rätt rubriker?
11. **Statusraden** har radie 12 som i konceptet, specen säger 2xl (16).
12. **E-postbannern** ligger på `vagg-2` direkt under väggen. Rätt yta?
13. **PaketKort, SparKort och Intervjuprov** delas med publika sidor och står
    kvar under övergångsregeln. Vänta till våg 4?
14. **Jobbsökets hem:** väggen har "Logga sökt jobb" och översikten har
    kvar länken "Logga ansökan". Dubbelt; ta bort länken?
15. **Personlighetstestets sidor** har fortfarande den äldre paletten inne i
    resultatkorten (mappad till tokens, men formen är gammal). Våg 2?
16. **Jobbcoachens panel** har fast höjd mot väggen (räknad mot topprad och
    rubrik på en rad). En rubrik på två rader på smal skärm ger 36 px för
    lite. Godtagbart?
17. **Sekundärknapparna** blev 48 px (förr 44) för att matcha konceptet. Det
    gör vissa rader högre, till exempel brevvyns fyra knappar.
18. **Personlighetsresultatets text** hade ett tankstreck i rubriken; det
    blev kolon ("Grundnivå: ditt resultat").

Copy: alla nya strängar ligger i `src/lib/rum/copy.ts`. Ordet "Testträning"
på dörren är konceptets och är inte provat av copywritern än (beslut 4);
lista i `copy.md`.

## Commits

```
0fac66d6 perf(rummen): e-postbannern målas inte under testpassets helskärmsläge
cc9f12d6 fix(cls): chattfältet och provets frågehuvud flyttar inget vid hydrering
b9652acc fix(rummen): Ta bort i brevvyn får sekundärknappens mått
59b05061 chore(rummen): grindar för våg 1b, fokusringens kontrastrader och klicktestet
89fa7c5b feat(rummen): sekundärknapparna i rummens material, mallminiatyren som dokumentyta
ad1e6a66 feat(rummen): sista knapparna och övergångsregelns omfång efter 1b
1fcda9b7 feat(rummen): Jobbsöket och kontot får väggen på alla sidor
d4e46990 feat(rummen): brevrummet får väggen, brevet förblir vitt papper
c3721d7d feat(rummen): CV-rummet får väggen, linkedin-listan utan layoutskifte
cabb38c2 feat(rummen): Träningen får väggen på alla sidor
efe24e78 feat(rummen): FlowShell, ark, statusrad och betalväggar i rummens utseende
40c89071 feat(rummen): skalet med data-rum per route, dörrnav, sidomeny och topprad
87edaf0e feat(rummen): knappar.ts och byggstenarna på vägg och golv
5b66d269 feat(rummen): symbolbiblioteket RumSymboler med konceptets koordinater
8de4ff46 merge: Rummen våg 1a in i design/rummen
```

## Testkonton

`qa-rummen-1b-{gratis,hela,mycket}-1791662893584@jobbcoach-qa.test`, skapade
med id och raderade med id efter testet (`--radera`). Antal räknat före
varje delete, bara på kontots eget `user_id`:

| Konto | Raderat |
|---|---|
| gratis `3f1c4b8e-…` | user_activities 131, profiles 1, auth-användaren |
| hela `508778a8-…` | premium_grants 1, user_activities 104, profiles 1, auth-användaren |
| mycket `7062059f-…` | job_applications 6, letters 5, cv_texts 4, logic_test_v4_sessions 9, premium_grants 1, user_activities 726, profiles 1, auth-användaren |

Prestandamätningen loggar in med det befintliga kontot med mest data
(som i våg 1a) och skriver ingenting.
