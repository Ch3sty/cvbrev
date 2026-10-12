# Byggspec: publika sidorna v2 (del A och de godkända sidorna)

Datum 2026-10-12. Underlag: skissen publikt-v2 (artefakten, godkänd av ägaren för startsidan, /priser, /verktyg/rekryteringstester och mönstret) och del A (/verktyg/personligt-brev, /verktyg/jobbmatchning, /funktioner), färdigställd och kontrollerad i dag. Skissfilerna ligger i sessionens scratchpad under `publikt-v2/` (parts/, build.js, build-a.js, preview-a.html). Kopiera `parts/` till `docs/design/publikt-v2/` innan scratchpaden städas, så att den här specen har sin förlaga i repot.

Läs först: `docs/design/brief-publikt-2026-10-12.md`, `docs/design/koncept-publikt-2026-10-12.html`, `docs/designsystem.md`, minnesreglerna om prestandabudget, riktig webbläsartest och SEO-spärren.

**Bygg mot origin/main, inte mot den lokala main.** Den lokala `main` (e158144f) ligger efter `origin/main` (e2099fa8), och det är först på origin/main som plans.ts har "Jobbcoach Premium, 149 kr i månaden" som enda säljbara paket (`SALD_PLAN = 'all_month'`, plans.ts:226). Alla radhänvisningar nedan gäller origin/main.

---

## 1. Grundregler för bygget

1. Serverkomponenter överallt. Klient-JS bara för `FastKnapprad` (IntersectionObserver) och, om det behövs, köpknappen som redan är klient (`PriserKopKnapp`). FAQ är inbyggda `<details>`/`<summary>`, ingen JS.
2. Inga bilder. Telefoner, objekt och vågor är inline-SVG och CSS med fasta mått. CLS 0.
3. Inget tal hårdkodas i JSX. Alla tal och priser importeras (avsnitt 6). Står ett tal i FAQ-data som också finns i en konstant, skrivs FAQ-svaret som mall-sträng mot konstanten.
4. H1, title, description, canonical och schema rörs inte (avsnitt 8 listar vad som måste finnas kvar). Rubrikerna i baslinjen (bilaga A) står kvar ordagrant, som riktiga `h1`/`h2`/`h3`.
5. Husregler i all copy: inga talstreck, inga mittpunkter mellan fakta, inga "3,0"-decimaler, ingen Sparkles-ikon, svenska facktermer, vi-form, orden "generalrepetition", "mätning" och "familjer" används inte. Där verktyg räknas upp står rekryteringstesterna först och får störst yta. Matrisexemplet är alltid expertfrågan (v7e-plus-p2-17, facit C).
6. Typsnitten finns redan lokalt (next/font/local i src/app/layout.tsx: Inter och Schibsted Grotesk). Skissen laddar dem från Google Fonts bara för förhandsvisningen; i bygget läggs ingen extern font eller extern skript till.

---

## 2. Tokens

globals.css har redan (origin/main): `--mark`, `--panel`, `--insunken`, `--kant`, `--kant-stark`, `--ink-1/2/3`, `--koppar`, `--koppar-ink`, `--koppar-mjuk`, `--koppar-ljus`, `--positiv(-mjuk)`, `--varning`, `--fel`, `--fokus`, `--lyft`, och rummen via `[data-rum="tran|cv|brev|jobb|neutral"]` med `--vagg`, `--vagg-2`, `--vagg-ink`, `--vagg-mjuk`, `--ljus`, `--ton`, `--ton-ink`, `--rum` (rad 232 till 246, mörkt läge rad 251 och framåt). Skissens rumsfärger har exakt samma värden.

Två fällor:

- `[data-rum]` lyfter tokens till roten med `:root:has([data-rum])` (rad 137, 209). En publik sida har fem rum i följd, och då vinner den sista regeln i kaskaden över hela sidan. **Använd inte `data-rum` på publika sidor.** Lägg i stället till klasserna nedan som bara sätter variabler lokalt.
- `--koppar-djup` och `--koppar-text` finns bara inuti `:root:has([data-rum])` (rad 140 till 145). Lyft dem till `:root`.

Lägg till i globals.css (ljust värde, mörkt värde inom samma två mörka block som resten):

| Token | Ljust | Mörkt | Används till |
|---|---|---|---|
| `--koppar-djup` | #C4621F | samma | knappens gradient |
| `--koppar-text` | #1A1206 | samma | text på kopparknapp |
| `--premium` | #0F0E12 | #09090C | Bläck-ytan (Premium, FAQ-ram på priser) |
| `--premium-2` | #1A191F | #121116 | stegsiffror på Bläck |
| `--premium-kant` | rgba(255,255,255,.12) | samma | kanter på Bläck |
| `--golv-skarm` | #F3F1EC | #17171B | telefonens golv |
| `--papper-skarm` | #FFFFFF | #232227 | kort i telefonen |
| `--kant-skarm` | #E3E1DC | #34333A | kanter i telefonen |
| `--lyft-stor` | 0 2px 4px rgba(20,16,10,.08), 0 40px 80px -30px rgba(20,16,10,.45) | 0 2px 4px rgba(0,0,0,.4), 0 40px 80px -30px rgba(0,0,0,.8) | telefonens skugga |
| `--r-stor` | 24px | samma | kort |

Rumsklasser för publika sidor (nya, i globals.css under en rubrik "Publika rum"):

```css
.pub-rum-tran { --rum-vagg:#1B2246; --rum-vagg-2:#2B3470; --rum-ljus:#93A0EC; --rum-ton:#DFE3F6; --rum-ink:#3B4790; }
.pub-rum-cv   { --rum-vagg:#113538; --rum-vagg-2:#1D4D51; --rum-ljus:#7FCFCA; --rum-ton:#D7ECEA; --rum-ink:#1E5F5F; }
.pub-rum-brev { --rum-vagg:#3A1930; --rum-vagg-2:#56284A; --rum-ljus:#E29DCB; --rum-ton:#F0DCE8; --rum-ink:#6E2B59; }
.pub-rum-jobb { --rum-vagg:#1B3324; --rum-vagg-2:#2A4C37; --rum-ljus:#8FD3A0; --rum-ton:#DCEBDD; --rum-ink:#245C37; }
.pub-rum-neu  { --rum-vagg:#26262C; --rum-vagg-2:#36363E; --rum-ljus:#C9C8D2; --rum-ton:#E2E1E6; --rum-ink:#3C3C46; }
/* mörkt: bara ton och ton-ink byts, väggen behålls */
/* tran #161B36/#AEB4DA, cv #0E2A2C/#A3C9C8, brev #2A1224/#D6AFC8, jobb #14261B/#A9C9B1, neu #222127/#B9B8C2 */
```

Text på vägg: `--vagg-ink` (#F5F6FC) och `rgba(255,255,255,.74)` för brödtext. Gradientordet "Premium": `linear-gradient(92deg,#F4B98A,#FFD9B0 45%,#F2A368)` med `background-clip:text`, bara på Bläck.

Typografi (skissens skala, Schibsted Grotesk 800 för rubriker): H1 `clamp(38px, 9.6vw, 64px)` radhöjd 0,98; H2 `clamp(30px, 6.4vw, 46px)`; H3 som rubrik `clamp(22px, 4.4vw, 28px)`; H3 i steg och kort 17 till 18 px; ingress `clamp(17px, 2vw, 20px)`; kicker 12 px versal med spärr 0,1em. Sektionsluft `clamp(56px, 8vw, 112px)`, stora block `clamp(72px, 10vw, 144px)`, täta block `clamp(40px, 5vw, 72px)`. Innehållsbredd `min(1120px, 100% - 32px)`.

---

## 3. Delade komponenter (src/components/publikt/)

Alla är serverkomponenter om inget annat sägs. Sökvägar under `src/components/publikt/`.

| Komponent | Fil | Props | Anmärkning |
|---|---|---|---|
| `Telefon` | `telefon/Telefon.tsx` | `rum: 'tran'|'cv'|'brev'|'jobb'|'neu'`, `children`, `glid?: boolean`, `className?` | 272 × 590 px, radie 42, ram #1B1A1F, ö 76 × 22. Statusrad "14:05" ingår. `aria-hidden`. Allt telefonen visar ska också stå i löptext. |
| `SkarmVagg`, `SkarmGolv`, `SkarmFot` | `telefon/delar.tsx` | `kick`, `rubrik`, `sub?` / `children` / `knapp: string` | Skärmens tre zoner. Knappen i skärmen är en `div`, aldrig en länk. |
| Skärmar | `telefon/skarmar/*.tsx` | inga, eller `variant` | Se listan nedan. Varje skärm läser text ur produktens källor där sådana finns. |
| `Rum` | `Rum.tsx` | `rum`, `yta: 'vagg'|'ton'|'mark'|'panel'|'premium'`, `storlek?: 'tat'|'normal'|'stor'`, `id?`, `vag?: 'mark'|'panel'`, `children` | Sätter `pub-rum-*` och ytan. Ersätter skissens `.sek`, `.yta-*`, `.vagg`. Vågkant valfri. |
| `Station` | `Station.tsx` | `rum`, `objekt: ReactNode`, `kick`, `rubrik`, `rubrikNiva: 'h2'|'h3'`, `gratisRad?`, `text`, `steg?: string[]`, `knapp: {text, href}`, `lank?: {text, href}`, `telefon: ReactNode`, `omvand?: boolean` | Vägg-blocket med text till vänster och telefon (eller par) till höger. Rubriknivån styrs av sidan så att baslinjens H-nivåer behålls. |
| `Vag` | `Vag.tsx` | `till: 'mark'|'panel'`, `form?: 1|2` | SVG 1440 × 72, `preserveAspectRatio="none"`, höjd `clamp(28px,6vw,72px)`, absolut i botten. Högst en per sida plus hjältens. |
| `SvavandeObjekt` | `SvavandeObjekt.tsx` | `objekt: 'cv'|'match'|'matris'|'brev'|'chat'|'bock'|'plats'`, `rot`, `plats: {top?,left?,right?,bottom?}`, `bredd`, `doljPaMobil?` | Byggs med `IlluSvg`/`useIlluId` ur `src/components/illustrations/primitives.tsx`. Max tre synliga under 640 px. Matrisbrickan är expertfrågan i miniatyr. |
| `Objekt` | `Objekt.tsx` | `typ` (cv, brev, match, matris, chat, linkedin, mallar, upptackt, exempel, sokta, person, klocka, yrke, kompetens, utbildning, plats, sprak, erfarenhet), `storlek?: 34|52|64` | 64 × 64 currentColor-kontur med en kopparyta. |
| `PremiumBlock` | `PremiumBlock.tsx` | `kick?`, `rubrik`, `rubrikNiva`, `text`, `knapp`, `lank?`, `children?` | Bläck-ytan med gradientordet. Pris och namn ur plans.ts (`paketNamn(SALD_PLAN)`, `prisPeriod(SALD_PLAN)`). |
| `PrisTabell` | `PrisTabell.tsx` | `rader: {funktion, gratis, premium}[]` | Riktig `<table>` med `<th scope>`. Data ur `priser-data.ts`. |
| `Faq` | `Faq.tsx` | `id?`, `rubrik`, `rubrikNiva?`, `ingress?`, `fragor: readonly {q, a}[]`, `forstaOppen?: boolean`, `schema?: boolean` | `<details>`/`<summary>`. Med `schema` skrivs FAQPage-JSON-LD från samma lista. På sidor där schemat redan byggs i page.tsx (verktygssidorna, priser) är `schema` av, så att det inte blir dubbelt. |
| `ProvaKort` | `ProvaKort.tsx` | `rum`, `rubrik` (h2), `text`, `punkter: string[]`, `knapp`, `lank?` | Kortet direkt under hjälten, först i mobilordningen. Vänsterkant 6 px i rummets färg. |
| `Steg` | `Steg.tsx` | `rader: {rubrik?, text}[]`, `rubrikNiva?: 'h3'|'h4'`, `pa: 'ljus'|'vagg'|'premium'`, `kolumner?: 1|2` | Numrerad lista, siffran i 40 × 40 ruta med rummets ton. Utan rubrik blir det meningsraden på /funktioner. |
| `TalRad` | `TalRad.tsx` | `tal: {tal: string, text: string}[]` | Hjältens tre tal. Talen byggs av konstanter (avsnitt 6). Från 900 px på en rad (`flex-wrap:nowrap`, tal 24 till 30 px), under det får de bryta. |
| `LankLista` | `LankLista.tsx` | `lankar: {href, rubrik, text, objekt?, rum?, rubrikNiva?: 'h3'|'b'}[]` | Två kolumner från 760 px. Varje rad är en `<a>`. `rubrikNiva='h3'` där baslinjen har H3 (guiderna på testsidan); annars `b`. |
| `FastKnapprad` | `FastKnapprad.tsx` (`'use client'`) | `text`, `href`, `observera: string` (id på hjälten) | Fast i botten under 1024 px när hjälten scrollats förbi. En knapp, 56 px, `padding-bottom: env(safe-area-inset-bottom)`. `transform` för in och ut, aldrig höjd. Ersätter `StickyMobileCTA` på de här sidorna (artiklarna behåller sin). |
| `Hjalte` | `Hjalte.tsx` | `rum?`, `yta`, `brodsmulor?`, `kick`, `h1`, `ingress`, `fet?`, `primar`, `sekundar?`, `tal?`, `bild: ReactNode` | Knappen får `data-primar` för mätskriptet. Brödsmulan via befintliga `src/components/Breadcrumb.tsx` (den skriver BreadcrumbList). |

Skärmarna (`telefon/skarmar/`), en fil var, samma innehåll som skissen:

| Skärm | Används på | Källa för texten |
|---|---|---|
| `SkarmBana` | startsidan | stationerna ur hjältens berättelse |
| `SkarmCvAnalys` (poängring 74) | start, funktioner, priser, cv-analys | områdena ur CV-analysens resultat |
| `SkarmBrev` | start, funktioner, priser, brev | personan projektledare Sweco |
| `SkarmAnnons` (steg 2 av 4) | brev | samma persona |
| `SkarmMatchning` (25 nya i natt) | start, funktioner, priser, matchning | talet 25 ur ny konstant (avsnitt 6) |
| `SkarmAktivera` (sex datapunkter) | matchning | datapunkternas namn ur sidans H3 |
| `SkarmMatris` (expertfrågan, fråga 9 av 15) | start, funktioner, priser, tester | `totalQuestions` för `matrislogik-expert` i testConfig.ts |
| `SkarmPersonlighet` | start, funktioner, priser, tester | `src/lib/personlighet/smakprov-tolkning.ts` (profilMening, kravUtfall, bandFor) |
| `SkarmIntervjufragor` | start, priser, tester | `smakprov-tolkning.ts` (LASNING, INTERVJU) och `src/lib/recruiter/workStyle.ts` (STAR_INTERVIEW_BANK) |
| `SkarmCoach` | start, funktioner, priser | fast exempel, ingen lön utan källa i löptext |

Komponenter som ersätts (origin/main):

- `src/components/landing/start/StartSida.tsx` (StartHero, StartMatchning, StartMedia, StartVerktyg, StartLista, StartFaq) ersätts av sektionerna i avsnitt 5.1. Texterna flyttas, inte skrivs om.
- `src/app/(public)/priser/components/` PriserHero, PriserPaket, PriserGratis, PriserFunktioner, PriserGuide, PriserFortroende, PriserJamforelse, PriserFAQ ritas om med de nya komponenterna. `priser-data.ts`, `priser-schema.ts`, `PriserKopKnapp.tsx` och `PriserMatning.tsx` behålls.
- `src/components/verktyg/VerktygsSida.tsx` ersätts av `src/components/publikt/VerktygsMall.tsx` (avsnitt 5.7). Behåll den gamla tills sista verktygssidan flyttat, ta bort den i sista vågen.
- `src/app/(public)/funktioner/FunktionerSida.tsx` ritas om. `FUNKTIONER` i `src/components/pricing/paket-copy.ts` är fortsatt textkällan.
- `src/components/shell/InkPanel.tsx` används inte längre på publika sidor (PremiumBlock tar över). Den finns kvar för inloggat.
- `PriserScener` (IlluScenBrev, IlluScenMatris med flera) i verktygssidornas hero ersätts av telefoner.
- `src/components/landing/LandingNavbar.tsx` och `src/components/Footer.tsx` behåller alla länkar och etiketter. Sidfotens länkar i skissen (build.js) är fel: `/hjalp`, `/cv-mallar-per-yrke`, `/exempel-och-mallar`, `/insikter`. Live och kod har `/hjalpcenter`, `/cv-mallar`, `/exempel`, `/for-rekryterare/insikter`. Koden vinner.
- Knappen är koppar med mörk text (`--koppar` till `--koppar-djup`, text `--koppar-text`) på alla publika sidor. Den svarta knappen (`INK_KNAPP`) fasas ut på publika sidor.

---

## 4. Rörelse, CLS och mobilmått

Tre rörelser, inga fler, alla avstängda vid `prefers-reduced-motion: reduce`:

1. **Svävande objekt** i hjälten: `translateY(0 → -12px)` och tillbaka, 12 s, `ease-in-out`, oändlig, förskjutna starttider (-3, -6, -9 s). Ren CSS.
2. **Telefon glider in**: får inte kräva JS (sidorna CDN-cacheas och ska synas utan skript). Bygg som progressiv förbättring: `@supports (animation-timeline: view())` med `opacity .0→1` och `translateY(36px)→0` över `animation-range: entry 0% cover 30%`. Utan stöd står telefonen still och syns. Skissens `.glid { opacity:0 }` som väntar på JS får inte komma med.
3. **Poängen 74 räknar upp och ringen fylls**: `@property --p` (number) och `--n` (integer) med CSS-animation 1,6 s vid laddning, siffran via `counter()`. Talet 74 står i HTML från start för den som saknar stöd. Ringen: `stroke-dasharray:263; stroke-dashoffset: calc(263 - 263 * var(--p))`.

Ingen loop under 8 s. Animationer rör bara `transform` och `opacity`.

CLS 0: telefoner 272 × 590, objekt med `width`/`height`, vågor med fast höjd, typsnitten via next/font med reservsnitt som redan är metrikmatchade. Den fasta knappraden ligger utanför flödet.

Mobilmått (360 px):

- Hjälten: rubrik, ingress och knapp slutar inom 640 px. Uppmätt i del A: knappens nederkant 499 px (brev), 524 px (matchning), 471 px (funktioner). scrollWidth 360 på alla tre, ljust och mörkt; 1280 på desktop.
- Primär knapp 52 px hög, 100 % bredd under 640 px. En fylld knapp per sektion, sekundärt är textlänk.
- Telefonpar staplas under 640 px. På /funktioner visar testblocket bara personlighetstelefonen under 640 px, eftersom hjälten just visat matrisen.
- Rubriker får högst tre rader på 360 px.
- `.botten`/FastKnapprad: 56 px knapp, döljs från 1024 px.

Prestanda: `scripts/perf-publikt.ts` med budgeten där (startsidan LCP under 1 000 ms, övriga under 1 500 ms, CLS 0). LCP är H1.

---

## 5. Per sida

För alla sidor: metadata (`title`, `description`, `openGraph`, `alternates.canonical`) i page.tsx eller layout.tsx rörs inte. Schemablocken i page.tsx står kvar och läser samma FAQ-data som den synliga listan. `RedirectLoggedIn`/`AuthRedirect` står kvar.

### 5.1 Startsidan `/`

Filer: `src/app/(public)/page.tsx`, nya sektioner i `src/components/publikt/start/`. `antalKonton()` behålls om ägaren vill ha talet i hjälten, annars bort (skissen visar det inte).

| # | Sektion | Yta | Rubrik | Innehåll och källa | CTA |
|---|---|---|---|---|---|
| 1 | Hjälte | mark, SvavandeObjekt + SkarmBana | H1 "Därför får du inte svar på dina ansökningar" | ingressen ur StartHero (ATS, rekryteringssystem, CV, personligt brev i första stycket); TalRad | `/register` (data-primar), länk till `#tre-verktyg` |
| 2 | Mediebevis | panel, tät | ingen rubrik här | logotyprad | ingen |
| 3 | Tre verktyg, intro | ton tran | H2 "Tre verktyg som gör ansökan starkare" | ingress ur StartVerktyg | ingen |
| 4 | Station Rekryteringstester (störst) | vägg tran, stor | H3 "Rekryteringstester" | text ur StartVerktyg; SkarmMatris + SkarmPersonlighet | `/verktyg/rekryteringstester` |
| 5 | Station CV-analys | vägg cv | H3 "CV-analys" | SkarmCvAnalys | `/verktyg/cv-analys` |
| 6 | Station Jobbmatchning | vägg jobb | H3 "Jobbmatchning" | SkarmMatchning | `/verktyg/jobbmatchning` |
| 7 | Brevet | vägg brev | H2 "Vi matchar din erfarenhet mot tjänstens krav" | text ur StartMatchning; SkarmBrev | `/skapa-brev/start` |
| 8 | Jobbcoachen (ny H2) | vägg neu | H2 "Jobbcoachen svarar hela vägen" | SkarmCoach | `/verktyg/jobbcoachen` |
| 9 | Medierna | panel | H2 "Robotarna har redan läst ditt CV." | alla fyra citat (Kollega, SVT, SR, DN) i DOM | ingen |
| 10 | Resten | mark | H2 "Och resten av jobbsöket" | LankLista: personligt-brev, cv-mallar, jobbcoachen, linkedin-optimering, bli-upptackt, /cv-exempel, /personligt-brev-exempel, Sökta tjänster sist | ingen knapp |
| 11 | Premium | Bläck | H2 "Allt i Premium" | punktlistan ur plans.ts (`HELA_PAKETET_RADER`, rad 87; exportera den och flytta testraden först), tre telefoner | `/priser` |
| 12 | FAQ | mark | H2 "Svaren på det du undrar" | fem frågor, `schema` på | ingen |

Schema: Organization, WebSite och FAQPage (nytt, startsidan saknar JSON-LD i dag). Rätta skissens gratisrad "Ett brev om dagen utan att betala" till brevregeln i avsnitt 7. FastKnapprad: "Skapa konto gratis" till `/register`.

### 5.2 `/priser`

Filer: `src/app/(public)/priser/page.tsx` och komponenterna där.

| # | Sektion | Yta | Rubrik | Innehåll | CTA |
|---|---|---|---|---|---|
| 1 | Premium-hjälten | Bläck | H1 "Jobbcoach Premium, 149 kr i månaden" (byggs av `paketNamn(SALD_PLAN)` och `prisPeriod(SALD_PLAN)`), underrad "CV, personliga brev, tester, jobbmatchning och Jobbcoachen" | ankarmening, "säg upp när du vill", Stripe; H2 "Allt i Premium" med fem punkter; tre telefoner | `PriserKopKnapp` (inloggad till kassan via `kopstegHref`, annars `/register?paket=all_month`). Skissens `/kassan` finns inte; rutten heter `/kassa`. |
| 2 | Gratis som jämförelse | mark, dämpad | H2 "Vill du se först?" | exakta gratiskvoter ur konstanterna (avsnitt 6), sex avslagna objekt | `/register` som textlänk eller knapp, en fylld per sektion |
| 3 | Funktion för funktion, intro | panel tät | H2 "Vad du faktiskt får, funktion för funktion" | | |
| 4 till 8 | Fem stationer | väggar tran, cv, brev, jobb, neu | H3 Rekryteringstester (störst), CV-analysen, Personliga brev, Matchade jobb, Jobbcoachen | texterna ur `FUNKTIONER` i paket-copy.ts; ordningen ändras så att testerna står först, H3-texterna oförändrade | sista stationen: köpknappen |
| 9 | Kom igång | ton tran | H2 "Hjälpredan Kom igång tar dig igenom allt i rätt ordning" | de elva stegen som öppen `<ol>` | ingen |
| 10 | Rad för rad | panel | H2 "Vad som ingår, rad för rad" | PrisTabell | ingen |
| 11 | FAQ | mark | H2 "Fler frågor om priset?" | fyra frågor | köpknappen |

Schema: Product (149 SEK) och FAQPage ur `priser-schema.ts`, oförändrade. Länk till `/verktyg/personlighetstest` och `/register` ska finnas. `PriserMatning` behålls.

### 5.3 `/verktyg/rekryteringstester`

Filer: `page.tsx`, `components/RekryteringstesterProvaKort.tsx` (ersätts av ProvaKort), `components/rekryteringstester-faq-data.ts` (oförändrad tills ägaren svarat, avsnitt 10).

Sektionsordning enligt skissen (30-tester): hjälte vägg tran (H1 oförändrad, SkarmMatris + matrisbricka, CTA `/verktyg/rekryteringstester/prova`), ProvaKort H2 "Gör ett prov direkt, utan konto", H2 "Så fungerar det" med fyra H3 (HowTo), resultatvyn, H2 "Sex färdigheter som avgör testet" (sex H3), H2 "Tre testtyper, alla gratis att börja" (H3 Matrislogik, Verbalt resonemang, Numeriskt resonemang; tal ur testConfig), H2 "Ta reda på vad rekryteraren ser i dig" på vägg brev med fem H3 och länk `/verktyg/personlighetstest`, H2 "Träning som syns på resultatet" (tre H3), H2 "Så förbereder du dig inför ett rekryteringstest" (sex H3, TRR- och Ingenjören-siffrorna), H2 "Guider per testtyp" (nio H3-länkar, synliga utan klick), Bläck H2 "Träna nu. Kom förberedd sen.", H2 "Vanliga frågor om rekryteringstester" (13).

Schema WebApplication, HowTo, FAQPage står kvar i page.tsx. Testtypskortens antal frågor och minuter importeras ur `src/app/dashboard/tester/testConfig.ts` (`TEST_CONFIGS`, `totalQuestions`, `minutes`, `examMinutes`), så att gamla tal inte kan komma tillbaka. Notera att origin/main också har figurserier och deduktiv; sidan säger "tre testtyper" och H2 står kvar, men nämn de nya i brödtexten om testansvarig vill.

### 5.4 `/verktyg/personligt-brev`

Filer: `page.tsx`, `components/brev-faq-data.ts`, `components/BrevLiveDemo.tsx` (används inte längre i hjälten; behåll filen om den används någon annanstans, annars bort i sista vågen).

| # | Sektion | Yta | Rubrik | Innehåll och källa | CTA |
|---|---|---|---|---|---|
| 1 | Hjälte | vägg brev, Vag till mark | H1 "Skräddarsy ditt brev till varje annons" | kick "Personligt brev, skrivet mot annonsen"; befintlig ingress och fet mening; TalRad: `1 brev` gratis (FREE_LETTERS_PER_ACCOUNT), `4 min`, `${Object.keys(LETTER_TEMPLATES).length} mallar` PDF och Word; SkarmBrev med brev- och matchobjekt | `/register?borja=brev` (data-primar), länk `#sa-fungerar-det` |
| 2 | Prova utan konto | mark, tät | H2 "Skriv ett brev utan konto" (ny, tillägg) | `public-draft.ts` visar ett stycke före registrering (PREVIEW_PARAGRAPHS = 1); punkterna om gratisregeln (avsnitt 7) och nedladdning i Premium | `/skapa-brev/start`, länk `/personligt-brev-exempel` |
| 3 | Så fungerar det | panel | H2 "Så fungerar det", fyra H3 | befintliga stegtexter (HowTo); SkarmAnnons | `/register?borja=brev` |
| 4 | Mallarna | ton brev | H2 "7 mallar, en för varje bransch", sju H3 | mallnamn och tier ur `LETTER_TEMPLATES` (tier free ger "Gratis", annars "Ingår i Premium"); miniatyrerna som SVG per mall-id; åttonde rutan är en länk till `/personligt-brev-exempel` (fyller rastret på både 2 och 4 kolumner) | ingen knapp |
| 5 | Skrivtips | mark | H2 "Fem regler som höjer svarsfrekvensen", fem H3 | befintliga texter; kortet "brevet i tre stycken" bredvid | ingen |
| 6 | Resultat | panel | H2 "När brevet svarar mot kraven har rekryteraren en anledning att ringa", H3 "Ett brev gratis", "PDF och Word", H3 med `prisPeriod(SALD_PLAN)` | tre kort, det tredje på Bläck | `/register?borja=brev` |
| 7 | Fördjupning | mark | H2 "Läs mer om personliga brev", sex H3-länkar | `/personligt-brev-exempel`, `/artiklar/hur-skriver-man-ett-personligt-brev`, `/artiklar/bra-personligt-brev`, `/artiklar/inleda-personligt-brev`, `/artiklar/hur-langt-ska-personligt-brev-vara`, `/artiklar/personligt-brev-avslutning-exempel` | ingen |
| 8 | Premium-avslut | Bläck | H2 "Ditt nästa brev tar tre minuter, inte tre timmar." | gratisregeln och vad Premium ger | `/register?borja=brev`, länk `/priser` |
| 9 | FAQ | mark | H2 "Det du undrar om brevverktyget" | åtta frågor ur brev-faq-data.ts, mejllänk support | ingen |

FastKnapprad "Skapa ditt brev gratis" till `/register?borja=brev`. Schema WebApplication, HowTo, FAQPage i page.tsx oförändrat utom att FAQ-svaren om pris läser plans.ts (de säger i dag "CV-paketet för 79 kr i veckan" på origin/main i brev-faq-data.ts rad 16 och 32; live säger redan Premium 149 kr, så datan ska följa plans.ts).

### 5.5 `/verktyg/jobbmatchning`

Filer: `page.tsx`, `components/jobbmatchning-faq-data.ts`, `components/JobbmatchningLiveDemo.tsx` (som brevets demo).

| # | Sektion | Yta | Rubrik | Innehåll | CTA |
|---|---|---|---|---|---|
| 1 | Hjälte | vägg jobb | H1 "Hitta jobb som matchar ditt CV automatiskt" | kick "Jobbmatchning, fler dörrar än din titel"; befintlig ingress och fet mening; TalRad `${FREE_TIER_JOB_LIMIT} träffar` gratis med skälen, `Dagligen`, `Hela Sverige`; SkarmMatchning, CV-, match- och platsobjekt | `/register?borja=jobb`, länk `#sa-fungerar-det` |
| 2 | Tre träffar gratis | mark, tät | H2 "Tre träffar gratis, med skälen" (ny, tillägg; talet via `talOrd(FREE_TIER_JOB_LIMIT)`) | punkter; 25 ur ny konstant | `/register?borja=jobb`, länk `/cv-exempel` |
| 3 | Så fungerar det | panel | H2 + fyra H3 (HowTo) | SkarmAktivera | `/register?borja=jobb` |
| 4 | Datapunkter | ton jobb | H2 "Sex datapunkter ur ditt CV", sex H3 | befintliga texter, ett objekt per kort | ingen |
| 5 | Sex skäl | mark | H2 "Sex skäl att låta oss söka åt dig", sex H3 | befintliga texter; grenkortet (undersköterska till tre roller) bredvid | ingen |
| 6 | Från träff till ansökan | panel | H2 "Från träff till ansökan" (ny) | LankLista: `/verktyg/personligt-brev`, `/verktyg/bli-upptackt`, `/cv-exempel`, `/artiklar/ai-jobbmatchning`, `/artiklar/byta-karriar-jobbsokande-guide`, `/verktyg/jobbcoachen` | ingen |
| 7 | Premium-avslut | Bläck | H2 "Hitta ditt nästa jobb automatiskt." | | `/register?borja=jobb`, länk `/cv-exempel` |
| 8 | FAQ | mark | H2 "Vanliga frågor om att söka jobb" | åtta frågor | ingen |

Ordet "feed" i FAQ-svaret om uppdatering byts mot "lista" (engelskt gränssnittsord). FAQ-svaret om pris läser plans.ts och `FREE_TIER_JOB_LIMIT`.

### 5.6 `/funktioner`

Filer: `src/app/(public)/funktioner/FunktionerSida.tsx`, `page.tsx`.

| # | Sektion | Yta | Rubrik | Innehåll | CTA |
|---|---|---|---|---|---|
| 1 | Hjälte | mark | H1 "Allt du behöver för att landa nästa jobb" | ingressen med rekryteringstester först; ankarrad med testerna först och fylld; telefonsolfjäder CV, matris (mitten, störst), matchning; under 900 px bara matrisen | `/register`, länk `/priser` |
| 2 | Rekryteringstester (störst) | vägg tran, stor | H2 "Rekryteringstester" | gratisraden, brödtexten, fyra meningssteg; SkarmMatris + SkarmPersonlighet (under 640 px bara personligheten) | `/verktyg/rekryteringstester`, länk `/verktyg/personlighetstest` |
| 3 | Personliga brev | vägg brev | H2 "Personliga brev" | gratisraden enligt avsnitt 7; SkarmBrev | `/verktyg/personligt-brev`, länk `/personligt-brev-exempel` |
| 4 | CV-analysen | vägg cv | H2 "CV-analysen" | SkarmCvAnalys | `/verktyg/cv-analys`, länk `/cv-exempel` |
| 5 | Skapa CV och mallar | ton cv | H2 "Ett CV som både systemet och rekryteraren läser", fyra H3, H3 "41 mallar, 3 gratis" byggs av `TEMPLATE_COUNT` och `FREE_TEMPLATE_COUNT` | tre mallar i solfjäder | `/verktyg/skapa-cv`, länk `/dashboard/cv-mallar` (finns på live, behålls) |
| 6 | Bara i Premium | Bläck, Vag till panel | H2 "Jobben hittar dig, och du går förberedd in i intervjun." med H2 "Matchade jobb" och H2 "Jobbcoachen" under var sin telefon (H2 i baslinjen, renderas i H3-storlek) | ingressen med testerna först | `/priser`, länk `/verktyg/bli-upptackt` |
| 7 | LinkedIn | panel | H2 "Bli hittad på LinkedIn" | före och efter-kortet | `/verktyg/linkedin-optimering` |
| 8 | Alla verktyg | mark | H2 "Alla verktyg, samlade" (ny) | LankLista med elva rader, testerna först, `/rakna-ut` sist | ingen |
| 9 | FAQ | panel | H2 "Vanliga frågor" | fem frågor | ingen |

/funktioner har inget JSON-LD i dag. Lägg inte till något i den här omgången (det ändrar inte rankningen nämnvärt och håller SEO-diffen ren); ta upp FAQPage separat.

### 5.7 Verktygsmallen: cv-analys, skapa-cv, cv-mallar, linkedin-optimering, bli-upptackt, jobbcoachen, personlighetstest

Ny komponent `src/components/publikt/VerktygsMall.tsx` med samma datamodell som dagens `VerktygsSida` (props `brodsmulor`, `eyebrow`, `h1`, `ingress`, `fet`, `primar`, `sekundar`, `loften`, `steg`, `kontroll`, `extra`, `fritt`, `citat`, `slut`, `faq`) plus `rum` och `telefon: ReactNode` i stället för `scen`. Då flyttar varje page.tsx genom att byta import och lägga till två props; texterna står kvar där de står.

Sektionsordning: Hjälte på vägg i verktygets rum (brödsmula, H1 oförändrad, ingress, en knapp, TalRad, telefon), ProvaKort om verktyget har en direkt handling (befintlig `handling` blir kortets innehåll), "Så fungerar det" på panel med telefon (H2 + H3, HowTo), `kontroll` på ton, `extra` växelvis mark och panel, citat på panel, `slut` som PremiumBlock, FAQ på mark.

| Sida | Rum | Telefon | Primär CTA (oförändrad mot page.tsx) |
|---|---|---|---|
| cv-analys | cv | SkarmCvAnalys | befintlig (`#mini-analys`-handlingen blir ProvaKort) |
| skapa-cv | cv | ny SkarmSkapaCv (stegen) eller SkarmCvAnalys | befintlig |
| cv-mallar | cv | ny SkarmMallar (tre mallar ur registret) | befintlig |
| linkedin-optimering | cv | ny SkarmLinkedin (före och efter, samma som /funktioner) | befintlig |
| bli-upptackt | jobb | ny SkarmBliUpptackt (anonym profil, styrkor, aldrig råpoäng eller lönespann) | `/register` |
| jobbcoachen | neu | SkarmCoach | befintlig |
| personlighetstest | brev | SkarmPersonlighet | befintlig, slutet `/register?borja=tester` |

Skissens mönstersida (40-monster) visar en hjälte för cv-analys med H1 "CV-analys: därför kommer ditt CV inte förbi ATS" och CTA `/verktyg/cv-analys/start`. Båda är fel mot spärren: H1 är och förblir "Få konkret feedback på ditt CV på 60 sekunder", och rutten `/verktyg/cv-analys/start` finns inte.

---

## 6. Datakällor för tal (importera, hårdkoda aldrig)

| Tal | Källa (origin/main) |
|---|---|
| Pris, namn, kortnamn, köpknapp | `src/lib/plans/plans.ts`: `SALD_PLAN` (rad 226), `paketNamn`, `paketKort`, `prisPeriod`, `kopKnapp`, `PLAN_BY_KEY` |
| CV-mallar 41, varav 3 gratis | `src/lib/cv/template-antal.ts`: `TEMPLATE_COUNT`, `FREE_TEMPLATE_COUNT` |
| Brevmallar 7, varav 3 gratis | `src/lib/letters/letter-templates.ts`: `LETTER_TEMPLATES`, `tier: 'free'` på classic, minimalist, compact |
| Sex toner | `src/lib/openai/api.ts` rad 6, `tonalityDescriptions` (exportera en lista eller ett antal) |
| Brev gratis | `src/lib/quota/quotaService.ts`: `FREE_LETTERS_PER_ACCOUNT` (rad 39), `LETTER_WINDOW_DAYS` (rad 40) |
| Jobbcoachen gratis 10 | `quotaService.ts` rad 48, `FREE_CHAT_MESSAGES_PER_ACCOUNT` |
| CV-analys gratis 1 | `quotaService.ts` rad 59, `CV_ANALYSIS_LIMIT` |
| Tester gratis, ett pass per testtyp och dygn på grundnivån | `quotaService.ts`, `DAILY_LIMIT_TEST_SESSIONS` |
| Matchning gratis 3 | `src/lib/jobmatching/freeLimit.ts`, `FREE_TIER_JOB_LIMIT` |
| Matchning 25 per natt | finns bara som fast text (paket-copy.ts, priser-data.ts, program.ts). Lägg `JOB_MATCHES_PER_RUN = 25` i freeLimit.ts och läs den överallt |
| CV-nedladdning gratis 1 | finns bara som `used >= 1` i `src/app/api/cv/generate-formatted/route.ts`. Lägg `FREE_CV_EXPORTS = 1` i `src/lib/cv/template-antal.ts` eller en ny `cv-kvot.ts` och använd i rutten och på sidorna |
| Frågor och minuter per test | `src/app/dashboard/tester/testConfig.ts`: `totalQuestions`, `minutes`, `examMinutes` (prov 25, 40, 40 min) |
| Personlighet 20, 50, 120 påståenden | `src/lib/personlighet/smakprov-pastaenden.ts` `ANTAL_PASTAENDEN`; testConfig `personlighet-grund` (50) och `personlighet-avancerad` (120) |
| Brev före registrering, ett stycke | `src/lib/letters/public-draft.ts`, `PREVIEW_PARAGRAPHS` (exportera) |

Talet skrivs som ord i löpande text där husreglerna kräver det (`talOrd`/`storForst` finns i `src/lib/onboarding/paket-rader.ts`).

---

## 7. Gratisbrevet: vad koden gör

Koden säger: **det första brevet är gratis, därefter ett nytt per rullande sju dygn.** Tekniskt är det samma regel som "ett brev per sju dygn räknat från första användningen": räknaren nollställs när fönstret är äldre än sju dygn.

- Gränserna: `FREE_LETTERS_PER_ACCOUNT = 1`, `LETTER_WINDOW_DAYS = 7`, `DAILY_LIMIT_LETTERS = 1` (namnet är historiskt) i `src/lib/quota/quotaService.ts:39,40,45`. Kommentaren rad 18: "Brev 1 per konto, därefter 1 per rullande sju dygn".
- Fönstret: `resolveWeeklyLetterCounter` (rad 267), och `resolveDailyLetterCounter = resolveWeeklyLetterCounter` (rad 288).
- Spärren: `src/app/api/letters/generate/route.ts:95` och `:103` anropar den och nekar vid `effectiveCount >= DAILY_LIMIT_LETTERS`. Samma i `generate-preview/route.ts`.
- Nedladdning som PDF och Word kräver featuren `letter_download` (scope cv eller allt, `src/lib/access/features.ts:43`). Gratis brev går att läsa och kopiera.

Därför gäller i all copy: **"Första brevet gratis, sedan ett nytt i veckan. Nedladdning ingår i Premium."** Det gör att tre utkast är fel:

- "Ett brev om dagen" (skissens startsida rad 114 och prissidans gratisrad rad 51, och ux-kravens prisavsnitt) är fel.
- "1, sedan 1 i veckan" (prissidans tabell) stämmer.
- "Ett personligt brev på en annons" (startsidans FAQ) är inte fel men ofullständigt; skriv "första brevet gratis, sedan ett i veckan".

Koden går själv isär med regeln på tre ställen, som bör rättas i samma våg som brevsidan (inte design, men copy som användaren ser):

- `generate/route.ts:100` sätter `resetAt = nextMidnightStockholm(now)` och `:116` säger "Du har använt dagens två brev. Ny kvot i morgon". Ska vara sju dygn efter fönstrets start (`nextLetterResetAt`) och "Nästa brev kan du skriva {datum}".
- `src/hooks/use-profile.ts:437` och `:565` räknar brevfönstret som "startat idag" och `:444`/`:572` visar återställning vid midnatt. Ska använda `resolveWeeklyLetterCounter` och `nextLetterResetAt`.

---

## 8. SEO-grind

### 8.1 Vad som måste finnas kvar

Bilaga A listar per sida alla H1, H2 och H3 och alla FAQ-frågor som live har i dag (hämtat 2026-10-12). Regeln: varje rad finns kvar med samma text och samma nivå. Ordningen får ändras, nya rubriker får läggas till. Inga interna länkar i innehållet får försvinna. Title, description, canonical och JSON-LD-typerna är oförändrade, utom FAQPage-svar där ett pris eller tal byts mot konstanten.

Del A är kontrollerad mot live i skissen: alla rubriker, alla FAQ-frågor (8, 8 och 5) och alla interna länkar finns kvar, en H1 per sida. Ordagrann brödtext: 65 av 75 meningar på brevsidan, 63 av 68 på matchningen och 51 av 68 på /funktioner. Resten är stegsiffror som numera står i CSS, menyrader, kickers med mittpunkt som skrivits om och exempelbrevet i livesidans demo.

### 8.2 Så körs diffen före push

Det finns redan `scripts/seo-diff-artiklar.ts` med lägena `ta`, `jamfor` och `baslinje`, och listan över publika ytor (rad 99 till 113). Gör så här:

1. Lägg till `/verktyg/personlighetstest` i listan (saknas).
2. Ge `ta` en flagga `--bas <url>` så att avtrycket kan tas mot `https://www.jobbcoach.ai` och inte bara localhost.
3. Lägg till FAQ-frågorna som eget fält i avtrycket (`<summary>`-texter och `FAQPage.mainEntity[].name`) så att en fråga som byter plats men finns kvar inte fäller, och en som försvinner gör det.
4. Före första vågen: `npx tsx scripts/seo-diff-artiklar.ts ta --bas https://www.jobbcoach.ai --ut docs/qa/seo-diff/publikt-v2-fore.json`.
5. Efter varje våg, mot lokal produktionsbygge (`npm run build && npm start -- -p 8300`): `ta --port 8300 --ut docs/qa/seo-diff/publikt-v2-vagN.json`, sedan `jamfor --fore ...-fore.json --efter ...-vagN.json`. Exit 1 fäller pushen.
6. Tillåtna skillnader (skrivs i `BASLINJE_OMTAGEN` med datum och skäl): nya H2 (startsidans "Jobbcoachen svarar hela vägen", brevsidans "Skriv ett brev utan konto", matchningens "Tre träffar gratis, med skälen" och "Från träff till ansökan", /funktioners "Alla verktyg, samlade"), nya länkar, startsidans nya JSON-LD, FAQ-svar där talet nu kommer ur en konstant.

---

## 9. Byggordning i vågor

Varje våg: tsc, berörda vitest och en skärmdump per ändrad sida under arbetet. En gång per våg före push: `npm run build`, SEO-diffen, `npm run perf:publikt -- --sidor <vågens sidor>` (mobil och `--desktop`), och klicktest i riktig webbläsare (Chrome via puppeteer-core eller Claude in Chrome) på Pixel 7 (412 × 915, DPR 2,625) och desktop 1280 × 800, ljust och mörkt, en skärmdump per steg i `docs/qa/publikt-v2/vagN/`. Kontrollera i varje skärmdump: scrollWidth lika med bredden, knappens nederkant i hjälten under 640 px på 360, inga telefoner som klipps, ingen text under 12 px utanför telefonerna.

| Våg | Innehåll | Klicktest |
|---|---|---|
| 1 | Tokens i globals.css, `src/components/publikt/` (Telefon, delar, alla skärmar, Rum, Vag, SvavandeObjekt, Objekt, Steg, TalRad, LankLista, Faq, ProvaKort, PremiumBlock, FastKnapprad, Hjalte), nya konstanter (`JOB_MATCHES_PER_RUN`, `FREE_CV_EXPORTS`, exporterade `PREVIEW_PARAGRAPHS` och tonerna). Ingen sida byter utseende än. En intern förhandsvisningssida bakom admin eller i `docs/qa` som visar alla skärmar. | Förhandsvisningen: alla skärmar på 360 och 1280, ljust och mörkt, reduced motion av och på. |
| 2 | /verktyg/rekryteringstester och startsidan. | Start: hjältens knapp till /register, varje station till sin sida, brevknappen till /skapa-brev/start, FAQ öppnas och stängs, fasta knappraden syns först efter hjälten och döljs från 1024 px. Tester: prova-kortet till /prova och ett pass startar utan konto, guiderna öppnar artiklarna, länken till personlighetstestet. |
| 3 | /priser. | Utloggad: köpknappen till /register?paket=all_month. Inloggad testkonto utan paket: köpknappen till kassan (stanna före betalning). Tabellen läsbar på 360 utan sidledsscroll. Kom igång-listan komplett. |
| 4 | /verktyg/personligt-brev, /verktyg/jobbmatchning, /funktioner. Rätta brevkopian i generate/route.ts och use-profile.ts (avsnitt 7). | Brev: Skriv ett brev nu till /skapa-brev/start, skriv ett utkast utan konto och se ett stycke, registrera ett testkonto och se hela brevet, skriv ett andra brev och få spärren med rätt datum (sju dygn). Matchning: Hitta jobb gratis till /register?borja=jobb, efter aktivering tre fulla träffar. Funktioner: varje ankare hoppar rätt, varje "Så fungerar det" till rätt sida. Radera testkontona med deras id efteråt, aldrig tidsfönster. |
| 5 | Verktygsmallen och de sju verktygssidorna, en commit per sida. Ta bort `VerktygsSida`, `InkPanel` på publika ytor och oanvända LiveDemo-komponenter. | Varje sida: primär CTA, ProvaKort-handlingen där den finns (cv-analysens mini-analys, personlighetstestets 20 påståenden utan konto), FAQ, brödsmula. |

---

## 10. Öppna frågor till ägaren

1. **FAQ-svaren om verbalt och numeriskt.** `rekryteringstester-faq-data.ts` rad 25 säger "12 textpassager med fyra påståenden per passage, totalt 48 bedömningar" och rad 29 "24 frågor per pass". testConfig har 40 på verbalt grund och avancerad (32 på expert, 48 bara på provet) och 20 på numeriskt grund till expert (36 på provet). Ska svaren bli 40 och 20 för träningspassen, läsas ur testConfig och nämna provet separat? FAQ-svaren ligger i FAQPage-schemat, därför ägarens ja.
2. **Gratisbrevet.** Koden: första brevet, sedan ett per rullande sju dygn (avsnitt 7). Skissens startsida och prisrad säger "ett brev om dagen". Vi skriver efter koden om inget annat sägs. Vill ägaren i stället ha ett brev om dagen är det en kvotändring, inte copy.
3. **Spärrmeddelandet för brev** säger "dagens två brev, ny kvot i morgon" och klienten visar midnatt. Rättas i våg 4 om ägaren inte invänder.
4. **Avståndet i jobbmatchningen.** Livetexten (H3 "Avstånd du väljer själv", datapunkten Plats) lovar en radie "från 5 km till hela Sverige". Koden har en fast växel för jobb längre bort än 100 km (`JobbmatchningClient.tsx:941` och `:1254`). Rubriken måste stå kvar för SEO. Ska radien byggas, eller ska brödtexten säga "nära dig, eller hela Sverige med ett klick"?
5. **25 träffar per natt** finns bara som fast text. Bekräfta talet innan det blir en konstant.
6. **"Åtta verktyg, en plattform"** på /funktioner: sidan länkar tio verktyg plus Räkna ut. Byta till "Tio verktyg" eller "Alla verktyg, en plattform"?
7. **Testtyperna.** /funktioner och testsidan säger "fyra typer" och "tre testtyper". origin/main har också figurserier och deduktiv. Ska texten följa med nu, eller när testansvarig lanserar dem publikt?
8. **FAQPage på /funktioner**: lägga till i en separat omgång?
9. **Antal konton i startsidans hjälte** (`antalKonton()` finns i page.tsx): visa eller ta bort?

---

## Bilaga A. Baslinje från live 2026-10-12

Indrag visar nivån. Allt här ska finnas kvar med samma text och nivå.

#### /

Title: Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester. Schema i live: inget.

- H1 Därför får du inte svar på dina ansökningar
  - H2 Vi matchar din erfarenhet mot tjänstens krav
  - H2 Robotarna har redan läst ditt CV.
  - H2 Tre verktyg som gör ansökan starkare
    - H3 CV-analys
    - H3 Jobbmatchning
    - H3 Rekryteringstester
  - H2 Och resten av jobbsöket
  - H2 Allt i Premium
  - H2 Svaren på det du undrar

FAQ (5): Vad är ATS, och varför ska mitt CV vara anpassat? / Hur mycket av jobbet gör ni åt mig? / Hur snabbt kan jag skapa ett personligt brev? / Är mina uppgifter säkra? / Vad kostar det, och vad får jag utan att betala?

#### /priser

Title: Priser: Jobbcoach Premium, 149 kr i månaden | Jobbcoach.ai. Schema: Product, FAQPage.

- H1 Jobbcoach Premium, 149 kr i månaden
  - H2 Allt i Premium
  - H2 Vad du faktiskt får, funktion för funktion
    - H3 CV-analysen
    - H3 Personliga brev
    - H3 Rekryteringstester
    - H3 Matchade jobb
    - H3 Jobbcoachen
  - H2 Hjälpredan Kom igång tar dig igenom allt i rätt ordning
  - H2 Vad som ingår, rad för rad
  - H2 Fler frågor om priset?

FAQ (4): Vad ingår i Jobbcoach Premium? / Vad händer när månaden är slut? / Kan jag börja gratis? / Hur säger jag upp?

#### /verktyg/rekryteringstester

Title: Rekryteringstester: träna inför urvalet | Jobbcoach.ai. Schema: WebApplication, HowTo, FAQPage.

- H1 Träna på rekryteringstester innan arbetsgivaren testar dig
  - H2 Gör ett prov direkt, utan konto
  - H2 Så fungerar det
    - H3 Välj test / Lös frågorna i din takt / Se resultat och tid direkt / Se vad du missade
  - H2 Sex färdigheter som avgör testet
    - H3 Mönsterigenkänning / Logiskt tänkande / Läsförståelse / Kritiskt tänkande / Snabbräkning / Tabelltolkning
  - H2 Tre testtyper, alla gratis att börja
    - H3 Matrislogik / Verbalt resonemang / Numeriskt resonemang
  - H2 Ta reda på vad rekryteraren ser i dig
    - H3 Öppenhet / Noggrannhet / Extraversion / Vänlighet / Känslostabilitet
  - H2 Träning som syns på resultatet
    - H3 Gratis att prova / Rapport efter varje pass / Premium tar bort taket
  - H2 Så förbereder du dig inför ett rekryteringstest
    - H3 Öva på rätt testtyp / Träna under tidspress / Välj tillfälle och miljö / Svara ärligt på personlighetsdelen / Reda ut frågorna i förväg / Räkna med att det känns svårt
  - H2 Guider per testtyp
    - H3 Logiska tester / Matrislogik / Numeriska test / Verbala test / Rotationstest / Personlighetstest / Deduktiva och induktiva test / Alva Labs logiktest / MAP från Assessio
  - H2 Träna nu. Kom förberedd sen.
  - H2 Vanliga frågor om rekryteringstester

FAQ (13): Vad är rekryteringstester och varför används de? / Hur fungerar ett matrislogik-test? / Vad är verbalt resonemang och hur tränar man på det? / Vad är numeriskt resonemang? / Hur tränar jag bäst inför ett rekryteringstest? / Är det fusk att träna inför ett rekryteringstest? / Är rekryteringstester rättvisa? / Vad betyder mitt resultat, och vilka rättigheter har jag? / Hur lång tid tar varje test? / Är testerna gratis? / Vad är ett personlighetstest i rekrytering? / Vad är Big Five-modellen? / Går det att manipulera ett personlighetstest?

(Snedstrecken ovan skiljer rubriker i listan; i sidan är varje rubrik ett eget element.)

#### /verktyg/personligt-brev

Title: Personligt brev som matchar annonsen | Jobbcoach.ai. Schema: WebApplication, HowTo, FAQPage.

- H1 Skräddarsy ditt brev till varje annons
  - H2 Så fungerar det
    - H3 Välj ditt CV / Klistra in jobbannonsen / Välj mall och ton / Ladda ner som PDF eller Word
  - H2 7 mallar, en för varje bransch
    - H3 Klassisk / Minimalist / Kompakt / Modern / Executive / Kreativ / Traditionell
  - H2 Fem regler som höjer svarsfrekvensen
    - H3 Använd annonsens egna ord / Visa siffror, inte adjektiv / Håll brevet under en sida / Matcha företagets ton / Skriv tre stycken
  - H2 När brevet svarar mot kraven har rekryteraren en anledning att ringa
    - H3 Ett brev gratis / PDF och Word / 149 kr i månaden
  - H2 Ditt nästa brev tar tre minuter, inte tre timmar.
  - H2 Det du undrar om brevverktyget

FAQ (8): Hur lång tid tar det att skapa ett brev? / Vad är skillnaden mot att skriva själv eller använda ChatGPT? / Kan jag ladda ner brevet som Word-dokument? / Hur många brev kan jag skapa gratis? / Kommer brevet att kännas som något vi alla skickat in? / Är det säkert att lämna mitt CV och era brev? / Vilken mall ska jag välja? / Fungerar brevet för alla branscher?

#### /verktyg/jobbmatchning

Title: Jobbmatchning: lediga jobb som passar ditt CV | Jobbcoach.ai. Schema: WebApplication, HowTo, FAQPage.

- H1 Hitta jobb som matchar ditt CV automatiskt
  - H2 Så fungerar det
    - H3 Aktivera ditt CV / Vi extraherar yrkesdata / Vi söker tusentals annonser / Du får jobben sorterade
  - H2 Sex datapunkter ur ditt CV
    - H3 Yrkesroller / Kompetenser / Utbildning / Plats / Språk / Erfarenhetsnivå
  - H2 Sex skäl att låta oss söka åt dig
    - H3 Roller du inte tänkt på själv / Matchning i procent per annons / Tusentals lediga jobb / Avstånd du väljer själv / Uppdaterat varje dag / Bäst träff överst
  - H2 Hitta ditt nästa jobb automatiskt.
  - H2 Vanliga frågor om att söka jobb

FAQ (8): Hur hittar jag jobb som passar mig? / Var hittar jag lediga jobb i Sverige? / Hur matchar man CV mot lediga jobb? / Var kommer jobben ifrån? / Hur ofta uppdateras jobbannonserna? / Är det gratis att söka jobb online hos er? / Funkar jobbmatchning för alla yrken? / Behöver jag ladda upp ett CV?

#### /funktioner

Title: Funktioner: alla verktyg för jobbsöket | Jobbcoach.ai. Schema: inget.

- H1 Allt du behöver för att landa nästa jobb
  - H2 Personliga brev
  - H2 CV-analysen
  - H2 Ett CV som både systemet och rekryteraren läser
    - H3 Bygg CV:t steg för steg / 41 mallar, 3 gratis / Foto och LinkedIn där mallen stöder det / Ladda ner som PDF
  - H2 Rekryteringstester
  - H2 Jobben hittar dig, och du går förberedd in i intervjun.
  - H2 Matchade jobb
  - H2 Jobbcoachen
  - H2 Bli hittad på LinkedIn
  - H2 Vanliga frågor

FAQ (5): Hur skiljer sig era verktyg från ChatGPT? / Är det säkert att lämna mitt CV till er? / Hur ofta uppdateras jobbmatchningen? / Vad händer om jag säger upp prenumerationen? / Hur kommer jag igång gratis?

#### /verktyg/cv-analys

Title: CV-analys: poäng och konkreta förslag | Jobbcoach.ai. Schema: WebApplication, HowTo, FAQPage.

- H1 Få konkret feedback på ditt CV på 60 sekunder
  - H2 Analysera ditt CV direkt
  - H2 Så fungerar det
    - H3 Ladda upp ditt CV / Vi analyserar i bakgrunden / Få ATS-poäng och förslag / Spara den förbättrade versionen
  - H2 Sex saker rekryteraren och systemet ser först
    - H3 Läsbarhet för rekryteringssystem / Struktur / Språk och grammatik / Nyckelord / Kvantifiering / Profil och styrkor
  - H2 Fem saker som lyfter vilket CV som helst
    - H3 Kvantifiera dina resultat / Börja varje punkt med ett verb / Använd annonsens egna ord / En sida räcker ofta / Hoppa över bilden
  - H2 Hela analysen, varje fynd med åtgärd.
  - H2 Frågor om CV-analysen

FAQ (8): Hur lång tid tar en CV-analys? / Vad betyder ATS-poängen? / Vilka förbättringsförslag får jag? / Behöver jag ha CV:t på svenska? / Hur många analyser får jag göra gratis? / Kan jag jämföra olika versioner av mitt CV? / Är mitt CV säkert hos er? / Vad händer efter analysen?

#### /verktyg/skapa-cv

Title: Skapa CV gratis online | Jobbcoach.ai. Schema: WebApplication, HowTo, FAQPage.

- H1 Skapa ditt CV gratis på minuter
  - H2 Så fungerar det
    - H3 Välj en mall / Fyll i sju enkla steg / Vi sätter ihop CV:t / Ladda ner som PDF eller Word
  - H2 Sex saker som gör CV-byggandet enkelt
    - H3 Mallar som rekryteringssystemen kan läsa / Förhandsvisning medan du skriver / Sparas automatiskt / Ladda ner som PDF eller Word / Hämta uppgifterna från LinkedIn / Fungerar lika bra i mobilen
  - H2 Mallar som passar din bransch
    - H3 Norrsken / Aurora / Atlas
  - H2 Tio minuters arbete som gör skillnad i månader
    - H3 10 minuter till färdigt CV / Gratis att börja / Läsbart för systemen i alla mallar
  - H2 Skapa ditt CV gratis på minuter.
  - H2 Vanliga frågor om att skapa CV

FAQ (8): Hur skapar jag ett professionellt CV? / Är det gratis att skapa CV online hos er? / Hur lång tid tar det att skapa ett CV? / Behöver jag ladda upp ett befintligt CV? / Kan jag importera mina uppgifter från LinkedIn? / Hur sparas mitt CV medan jag bygger det? / Vilka format kan jag ladda ner CV:t i? / Funkar CV-byggaren på mobilen?

#### /verktyg/cv-mallar

Title: CV-mallar: välj, fyll i och ladda ner | Jobbcoach.ai. Schema: ItemList, HowTo, FAQPage.

- H1 Professionella CV-mallar för svenska arbetsgivare
  - H2 Så fungerar det
    - H3 Välj en mall / Fyll i dina uppgifter / Vi flyttar in innehållet / Ladda ner som PDF eller Word
  - H2 Mer än en snygg layout
    - H3 Byggda för rekryteringssystem / PDF och Word / Profilbild där det passar / LinkedIn synligt i sidhuvudet / Redigera när du vill / Fungerar i mobilen
  - H2 Alla våra mallar. På ett ställe.
  - H2 Välj din mall och bygg ditt CV.
  - H2 Det du undrar om CV-mallarna

FAQ (8): Är CV-mallarna ATS-säkra? / Kan jag ladda ner mitt CV som PDF eller Word? / Vilken mall passar bäst för mitt yrke? / Vad är skillnaden på gratis och premium-mallarna? / Kan jag redigera CV:t senare? / Stödjer mallarna profilbild? / Kan jag använda mallen för internationella ansökningar? / Är mallarna mobile-friendly när jag bygger CV:t?

#### /verktyg/linkedin-optimering

Title: LinkedIn-optimering för rekryterarsök | Jobbcoach.ai. Schema: WebApplication, HowTo, FAQPage.

- H1 Hamna i rekryterarnas sökresultat på LinkedIn
  - H2 Så fungerar det
    - H3 Hämta din profiltext från LinkedIn / Klistra in i fem fält / Vi optimerar fem sektioner samtidigt / Jämför före och efter / Kopiera tillbaka till LinkedIn
  - H2 Fem sektioner i ett pass
    - H3 Rubrik, högst 220 tecken / Om mig, 250 till 350 ord / Erfarenhet i STAR-format / Utbildning, valfritt / Kompetenser i 3 till 4 grupper
  - H2 Varför du inte syns i dag
    - H3 Rekryterare söker på sökord / Rubriken avgör om du visas / Algoritmen belönar fullständighet
  - H2 Bred eller skarp inriktning
    - H3 Stå ut i mängden / Sikta på en specifik roll
  - H2 Sluta vara osynlig. Börja synas i dag.
  - H2 Vanliga frågor om LinkedIn-optimering

FAQ (8): Varför syns jag inte på LinkedIn idag? / Hur skriver man en bra LinkedIn-rubrik? / Vilka nyckelord letar rekryteringssystemen (ATS) efter på LinkedIn? / Loggar ni in på min LinkedIn? / Hur lång tid tar optimeringen? / Behöver jag ladda upp mitt CV? / Vad är skillnaden mellan "Stå ut i mängden" och "Sikta på en specifik roll"? / Vad kostar LinkedIn-optimeringen?

#### /verktyg/bli-upptackt

Title: Bli upptäckt, låt rekryterare hitta dig | Jobbcoach.ai. Schema: Service, FAQPage.

- H1 Bli hittad av rekryterare, utan att jaga jobb själv.
  - H2 Så fungerar det
    - H3 Skapa din profil / Gör testerna, om du vill / Slå på synlighet / En rekryterare hör av sig, du väljer
  - H2 Rätt synlighet, inte mer synlighet
    - H3 Rätt rekryterare, inte alla / Du bestämmer när du syns / Bevis, inte påståenden / Så du passar teamet
  - H2 Visa hur du jobbar, inte bara vad du kan
    - H3 Så arbetar du / Så samarbetar du / Så drivs du / Bevisa vad du kan med kunskapstester
  - H2 Du har full kontroll hela vägen
    - H3 Du är anonym tills du säger ja / Din nuvarande chef kan inte hitta dig / Bara riktiga företag får söka / Ditt lönespann stannar hos dig
  - H2 Rekryteraren hittar dig för att du passar
  - H2 Det här ser en rekryterare av din profil
  - H2 Redo att bli hittad i stället för att leta?
  - H2 Frågor om Bli upptäckt

FAQ (7): Kan min nuvarande chef se att jag är synlig? / Kommer jag bli nerspammad av rekryterare? / Hur vet jag att rekryterarna är seriösa? / Måste jag göra personlighetstestet och kunskapstesterna? / Vad kostar det att synas för rekryterare? / Syns min lön eller mitt löneanspråk för rekryterare? / Kan jag ångra mig och sluta synas?

#### /verktyg/jobbcoachen

Title: Jobbcoachen: karriärsvar med källor | Jobbcoach.ai. Schema: WebApplication, HowTo, FAQPage.

- H1 Karriärrådgivning från någon som faktiskt kan svensk arbetsmarknad
  - H2 Så fungerar det
    - H3 Ställ frågan / Vi söker bland verifierade källor / Du får svar med källhänvisning / Följ upp tills det är klart
  - H2 Sex områden vi hjälper dig med
    - H3 CV och personligt brev / Marknadslön och löneförhandling / Intervjuförberedelse / Arbetsrätt och LAS / Karriärbyte och utveckling / A-kassa, sjukdom och CSN
  - H2 Verifierad svensk arbetsmarknadsdata
    - H3 Arbetsförmedlingen / SCB / Fackförbund / Försäkringskassan / CSN / Skatteverket
  - H2 Sluta googla. Fråga någon som vet.
  - H2 Vanliga frågor om karriärrådgivning

FAQ (8): Hur fungerar Karriärguiden? / Var hittar jag tillförlitlig löneinformation i Sverige? / Kan jag få juridisk rådgivning här? / Vilka källor använder Karriärguiden? / Hur ofta uppdateras informationen? / Är det gratis att använda Karriärguiden? / Kan jag dela mitt CV med Karriärguiden? / Vad händer när mina tio meddelanden är slut?

#### /verktyg/personlighetstest

Title: Personlighetstest gratis: vad rekryteraren läser ut av dig. Schema: WebApplication, FAQPage.

- H1 Personlighetstest, gratis och utan konto
  - H2 Så fungerar det
    - H3 Svara på tjugo påståenden / Se profilen direkt / Spara den med ett gratiskonto / Gör hela testet
  - H2 De fem faktorerna och vad rekryteraren ser i dem
    - H3 Samvetsgrannhet / Utåtriktning / Stabilitet / Vänlighet / Öppenhet
  - H2 Femtio påståenden, gratis i kontot
  - H2 Vanliga frågor om personlighetstestet

FAQ (6): Är personlighetstestet gratis? / Vilken modell bygger testet på? / Räcker tjugo påståenden för en profil? / Vad är omvända påståenden? / Kan jag öva inför ett skarpt personlighetstest? / Vad ingår om jag betalar?
