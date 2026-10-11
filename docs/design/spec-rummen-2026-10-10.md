# Byggspec: Rummen

Datum 2026-10-10. Författare: art-director (Fable). Mottagare: Opus 5.5-byggagenter, testansvarig (godkänner specen före bygge), svensk-ux-copywriter (strängarna i avsnitt 9), saas-lead (vågordning och mätning). Status: **godkänd av testansvarig 2026-10-10 för våg 1a och 1b** (avsnitt 12), med krav på våg 2, 3a och blandningsfixen. **Våg 1a byggd och granskad 2026-10-10 sent; art-directors beslut efter granskningen står i avsnitt 13 och är inarbetade i avsnitt 1, 2, 3 och 6.** **Våg 1b byggd och granskad 2026-10-11; art-directors beslut och ändringslistan före merge står i avsnitt 16 (rättelserna i 2.1, 4.2 och 4.4 görs av 1b-agenten i samma PR).** **Våg 2 och 3b byggda och granskade 2026-10-11 kväll; art-directors beslut, ändringslistorna (a)/(b) och merge-ordningen står i avsnitt 20.**

Underlag: konceptet `docs/design/koncept-testvy-2026-10-10.html` (runda 2, rättat 2026-10-10 kväll, ramarna refereras med sina koder: E1, 1a, P2, W3 och så vidare), testansvarigs granskningar `granskning-formkurvan-2026-10-10.md` och `granskning-rummen-2026-10-10.md`, briefen `brief-testvy-2026-10-10.md` (funktionskraven och avsnitt 8), designsystemet `docs/designsystem.md` (Tråden v2.1, som den här specen ersätter för inloggat), och koden som den såg ut 2026-10-10 kväll (kartlagd i avsnitt 2).

Ägarens delegering 2026-10-10: art-director tar designbesluten så länge testansvarig stöder dem, Opus 5.5 bygger. Pris, utskick, push och merge, auth och tabelldrops är fortfarande ägarens.

---

## 0. Besluten

Sex beslut, alla med testansvarigs stöd (granskning av runda 2, avsnitt 6). Villkoren är bindande.

| # | Beslut | Motivering | Villkor och avgränsning |
|---|---|---|---|
| 1 | **Koppar `#E07A2F` är den enda accenten i inloggat.** Knapp, kurva, märken, fokusring, "här är du". Logotypen står kvar. | Varmare än orange på mörk vägg och den enda linjen som går genom alla rum. Att byta accent helt hade kostat identitet utan att ge något. | Kopparfärgad **text på väggen är alltid koppar-ljus `#F4B98A`** (6,6:1 mot vagg-2, 8,9:1 mot vagg i indigo; lägst 5,4:1 mot vagg-2 i petrol). Ren koppar är bara linje, punkt och knapp (5,1:1 mot vagg i indigo, 4,4:1 i petrol, 3,8:1 mot vagg-2, för lågt för text). Publika sidor och mejl ingår **inte** i det här bygget: det är saas-leads och ägarens beslut i en egen omgång med SEO-diff som grind. |
| 2 | **Fyra kulörer: indigo (Träningen), petrol (CV), plommon (Personliga brev), skog (Jobbsöket). Grafit för profil och konto.** | Dagens blå och brun skiljer sig för lite i mörkt läge, och brun bredvid koppar blir grumligt. Fyra tydligt skilda väggar gör att man ser vilket rum man står i innan man läst ett ord. | Adminens `--diagram-cv` och `--diagram-test` byter till petrol och indigo (bara tokenvärdet, i våg 1a) och verifieras med skärmdump på adminsidorna. `--diagram-allt` står kvar som ink-1: adminens regel att orange bara markerar ett enskilt värde gäller tills admin får sin egen Opus-omgång. Koppar som etikett för Hela paketet gäller i produkten, inte i adminens diagram. |
| 3 | **Mörk vägg högst upp även i ljust läge, i hela inloggat.** Ingen ljus variant. | Väggen är det som ger djupet (toning, ljuskant, yta under kurvan, lyster på dagens punkt) och det som gör ljust och mörkt läge till samma produkt. En ljus variant tar bort just det som gör runda 2 bättre än runda 1. | Sagt högt: "papper på ett bord" är borta som grundidé för hela inloggat, inte bara Träningen. **Mörkt läge finns inte i koden i dag** (inga tokens, ingen växel, ingen `darkMode` i Tailwind) och byggs i våg 1a. Mörkt läge byter golv och papper, aldrig väggen. |
| 4 | **Navet: fyra dörrar, Testträning, CV, Personliga brev, Jobbsöket. Profilen som avatar i toppraden, på dator längst ner i sidomenyn. "Skapa" försvinner som egen plats, "Ansökningar" blir Jobbsökets första modul.** | "Träningen" förutsätter att man vet vad man tränar; "Testträning" säger vad det är och ryms. Fyra dörrar med rummets ton bakom den aktiva gör läget synligt på varje skärm. | svensk-ux-copywriter provar ordet Testträning under bygget på någon som aldrig gjort ett rekryteringstest; faller det, är reserven "Tester" med rubriken Träningen inne i rummet. "Personliga brev" på 360 px får gå på två rader (N2) och kontrolleras i riktig webbläsare i våg 1b; aldrig "Brev". Öppningar av Sökta tjänster mäts före och efter navbytet. |
| 5 | **Primärknappen är koppar med mörk text `#1A1206` i alla rum i inloggat.** 48 px, radie 12, exakt en per vy. | Svart på indigo syns inte, och två primärknappar i ett system (vit på vägg, svart på golv) är sämre än en. Kontrast 6,3:1. | Publika sidor och mejl byter inte knapp här. När saas-lead och ägaren tar det beslutet ska bytet mätas (registreringar före och efter), eftersom den är en konverteringsknapp. |
| 6 | **Gratisnivån, rekommendation: ett grundpass om dagen gratis varje dag, mätningen gratis en gång, resultat och genomgång alltid öppna. Passet på din nivå, riktade pass, ommätning, kurvans historik, provläget och generalrepetitionen ingår i Hela paketet. Dagspasset säljs dagen före provet.** | Måttet vi mest behöver flytta är dag 2-återkomsten (2 av 37). En rytm som låses dag 2 är en provperiod, inte en rytm. Grundnivån kostar oss inget och kvoten finns redan (`DAILY_LIMIT_TEST_SESSIONS = 1`). Betalväggen blir ärligare: grundpass under din nivå flyttar nivån lite, vilket är sant mätmässigt. | **Vad som är gratis är en produkt- och prisfråga som ägaren beslutat om förut. Ägaren bekräftar före release av våg 3.** Bygget gör därför gratisnivån till en konfiguration (`src/lib/traning/gratisniva.ts`, avsnitt 6.3) så att dag 2 kan låsas utan omritning; då ritas bara 1f och W3 om med kopparknappen "Köp Hela paketet, 149 kr i månaden" i det lyfta kortet. |

Beslut som följer av de sex och som jag också tar här: Inför intervjun bor i Jobbsöket (J2:s sidomeny), inte i Träningen. Notiser och meddelanden ligger som ikonknappar i toppraden till vänster om avataren, bara när de har något att visa (avsnitt 4.2). Formuleringen i E1 "det som oftast ingår" i stället för "det vanligaste" (belägget är artikeltrafik, inte mätning), copywritern har sista ordet.

---

## 1. Ramar som gäller varje våg

1. **Branch `design/rummen`**, underbranch `design/rummen-<våg>` (`design/rummen-1a`, `design/rummen-1b`, `design/rummen-2` och så vidare), en PR per våg mot `main`, aldrig push till `main`, aldrig merge: det är ägarens. Undantag: **våg 1a och 1b går till `main` i en gemensam PR** (avsnitt 13, beslut 1). Våg 3a (migreringar) körs på en Supabase-branch först; `apply_migration` mot prod bara efter ägarens ja.
2. **Modell:** byggagenter körs som `claude-opus-5-5`. Fable (art-director, copywriter, mobile-ux-designer) bara för granskning av skärmdumpar, slutcopy och spec-frågor. Vid tolkningsbehov: fråga art-director, gissa inte.
3. **Prestandabudget** (`feedback_prestandabudget_inloggat`): LCP under 1,0 s på Träningens hemvy och Jobbsökets hemvy, under 1,5 s på listor (Alla tester, Mina CV, Mina brev, Sökta tjänster), under 2,0 s på flöden (passet, ingången). CLS 0. Pixel 7-emulering, 3x CPU, LTE, median av tre. Mäts med `scripts/perf-inloggat.ts` (`npm run perf:inloggat`, exit 1 vid mer än 20 procent över budget) före varje PR. Mönstret: layout och sida som server components, initial data via delade `get*`-funktioner, inga klientkontexter som returnerar null tills de hydrerat, inga realtidskanaler eller count-frågor i kritisk väg, lazy för allt under första vyn, reserverade höjder (skelett med samma höjd, L1).
4. **Klicktest i riktig webbläsare** (`feedback_riktig_webblasartest`) före "klart": puppeteer med systemets Chrome, Pixel 7 (412 px, med emulerat adressfält via `scrollTo` på body) och desktop 1280, som ny användare, skärmdump per steg. Tre konton per runda: gratis, Hela paketet via `premium_grants`, och ett konto med mycket data (flera CV, brev, ansökningar, många testsessioner). Hård omladdning per vy. Kontroll: primär handling inom viewport utan scroll, header och nav synliga, inga konsolfel, inga 4xx/5xx, simulerat nätverksfel på POST (UI får aldrig säga "sparat" på fel), varje flöde har en utgång på alla steg. Rapport i `docs/qa/rummen/vag-<n>/README.md` med skärmdumparna bredvid. Om det inte är gjort heter det "byggt och typkontrollerat, inte klicktestat".
5. **SEO-diff** om en publik sida påverkas (bara våg 5: `/priser`, och eventuellt `/verktyg/*` där paketnamn nämns): title, description, h1, canonical, schema före och efter, inga förändringar utan seo-agentens ja.
6. **Inga prisändringar.** Inga nya Stripe-priser, inga ändrade belopp. Våg 5 slutar sälja paket, den ändrar inga priser.
7. **Grep-listan** ger noll träffar i `src/app/dashboard`, `src/components` (utanför `src/components/ui` och mallförhandsvisningar): em-dash (tecknet U+2014), ikonen `Sparkles`, `lucide-react` i nav och rum (tillåts bara i FlowShell/PassShell för X och ChevronLeft tills symbolbiblioteket ersatt dem i våg 1b, därefter noll), `bg-gradient`, `linear-gradient` i `.tsx` (toningar bor bara i `globals.css` under `.vagg`, `.knapp-primar`, `.kurva-yta` och märkenas `<defs>`), `animate-pulse`, `shadow-(sm|md|lg|xl)`, `text-gray-`, `bg-white` (utom mall-förhandsvisningar), `rounded-3xl`, `font-(bold|extrabold|black)` utan `font-display`. Engelska gränssnittsord: noll.
8. **Tillgänglighet:** kontrast AA (tabellen i avsnitt 3.5), träffytor 44 px, minsta text 12 px (11 px bara i SVG-axlar med `aria-label` som läser ut talen), synlig fokusring (`outline: 2px solid var(--fokus); outline-offset: 2px`; `--fokus` är koppar-ink på golv och papper och koppar-ljus på väggen, avsnitt 3.2 och 13.2, aldrig ren koppar på golvet: 2,5:1), `prefers-reduced-motion` ger sluttillstånd direkt.
9. **Språk:** svenska, vi-form, svenska facktermer (`feedback_svenska_facktermer`). Paketnamn ur `PLANS.name`, pris efter namnet, verbet Köp. "Samma format som", aldrig "samma test". Inga leverantörslogotyper.
10. **Designsystemet uppdateras först** i varje våg som rör det (`docs/designsystem.md` blir v3 "Rummen" i våg 1a), sedan komponenterna. Ändringsloggen (avsnitt 14 i dokumentet) får en rad per våg.

---

## 2. Vad som finns i dag och vad det byts mot

Kartlagt 2026-10-10 kväll. Absoluta sökvägar under `C:\Users\chris\cvbrev\`.

### 2.1 Skalet

| Fil i dag | Gör i dag | Blir |
|---|---|---|
| `src/app/dashboard/layout.tsx` | Server: `hamtaVerifieradAnvandare()`, `getDashboardSummary`, renderar `DashboardShell`. Inga route-grupplayouter. | Läser `x-pathname` (sätts i `src/proxy.ts`), räknar `rum = rumForPath(pathname)` (avsnitt 5), hämtar `getDashboardSummary` **och** `getTraningSummary` (från våg 2) parallellt, renderar `<DashboardShell rum initialSummary initialTraning>`. |
| `src/app/dashboard/DashboardShell.tsx` | Klient. `min-h-dvh bg-mark`, flex kolumn/rad, sidomeny (`hidden lg:block`), mobil sidomeny som overlay, header, banner, `main.overflow-y-auto … bg-mark`, `MobileBottomNavWrapper`, `KomIgangRad`, `InstallPrompt`, scroll-lås på html/body. `FLOW_ROUTES` döljer header och banner. | Samma skelett (h-dvh, låst body, bara `main` scrollar, det är lärdomen från 2026-09-14), men: yttersta diven får `data-rum={rum}` (klientsidan följer `usePathname` efter första renderingen) och `bg-golv`. Headern (`DashboardHeader`) tas bort som egen rad: toppraden ligger inne på väggen i varje vy (`Topprad`, avsnitt 4.2). Mobil-overlay-sidomenyn tas bort (navet är dörrarna; rummets undersidor nås från golvet). `main` får `p-0`; vägg och golv sätter sina egna marginaler (16 px mobil, 40 px dator). Max-bredd 1120 px på dator i stället för 960. |
| `src/components/dashboard/header.tsx` | `sticky top-0 h-14 bg-panel`, Menu-knapp (lucide), platsrubrik ur `PLATSER`, `MessagesHeaderButton`, `NotificationBell`, `ProfileMenu`. | Tas bort. `ProfileMenu`, `NotificationBell`, `MessagesHeaderButton` återanvänds inne i `Topprad` med väggens färger (`text-vagg-ink`, glas-bakgrund). `data-dashboard-header` och CSS-regeln i globals.css för `html[data-flow-active]` flyttar till `Topprad`. |
| `src/components/dashboard/MobileBottomNav.tsx` | `fixed bottom-0 z-40 bg-panel`, fyra platser: Hem, Ansökningar, Skapa (öppnar `CreateSheet`), Profil. Aktiv = `text-ink-1`. | Ersätts av `Dorrnav` (avsnitt 4.3): Testträning `/dashboard/tester`, CV `/dashboard/profil/cv`, Personliga brev `/dashboard/mina-brev`, Jobbsöket `/dashboard`. Aktiv dörr: rummets ton bakom dörrikonen (`bg-ton text-ton-ink`), etikett `text-ink-1` 600. Höjd 72 px + safe area. `--bottom-nav-h` uppdateras till `calc(72px + env(safe-area-inset-bottom))`. |
| `src/components/dashboard/CreateSheet.tsx` | Mobilt ark "Skapa nytt" med tre rader. | Tas bort i våg 4 (när rummen har sina egna "Nytt CV", "Nytt brev", "Logga sökt tjänst"). I våg 1b står den kvar men nås inte från navet; `Logga sökt jobb` får en knapp på Jobbsökets hemvy redan i våg 1b så inget tappas. |
| `src/components/dashboard/Sidebar.tsx` + `sidebar/*` | `w-64 bg-panel`, logotyp, pakethuvud `menyHuvud(paket)`, fyra tunga rader, tre grupper, Konto, `KomIgangRad`, `SidebarFooter`. Låsta rader öppnar `GraValSheet`. Realtidskanaler för räknare. | Ersätts av `Sidomeny` (avsnitt 4.3): logotyp, fyra tunga rumsrader (dörrikon i `rumfarg` på vit när aktiv), grupp "I <rummet>" med rummets undersidor (kopparlinje `box-shadow: inset 3px 0 0 var(--koppar)` på aktiv), Konto längst ner med avatar och paketnamn. Räknare ur `summary.sidomeny` som i dag, **inga realtidskanaler i kritisk väg** (de flyttas till `requestIdleCallback` som skalet redan gör för sina anrop). Pakethuvudet försvinner; paketet står vid kontot. `KomIgangRad variant="sidomeny"` står kvar under gruppen. |
| `src/components/shell/FlowShell.tsx` | `fixed inset-0 z-50 bg-mark lg:left-64`, h-14-huvud, 2 px progress i `bg-accent`, fot med `h-11 bg-ink-1`-knapp, publicerar `--flow-footer-h`, sätter `data-flow-active`. | Behålls som bas. Ändringar i våg 1b: knappen `h-12` koppar (`KNAPP_PRIMAR`), progress 3 px, bakgrund `bg-golv`, rubrik i `font-display` 15/600, lucide-ikoner byts mot `IkonX` och `IkonTillbaka`. `lg:left-64` blir `lg:left-[248px]`. Ny variant `PassShell` (våg 3b) lägger till tidsraden under huvudet. |
| `src/components/shell/InkPanel.tsx` (`INK_KNAPP`, `INK_LANK`) | Den enda fyllda ink-1-ytan per vy med scen till höger. | Tas bort ur rummen. Rollen "vyns viktigaste handling" tas av `LyftKort` (det lyfta kortet med kopparknappen). Scenerna (`PriserScener`, `TradenScener`) används inte i inloggat efter våg 4; instrumenten är bilden. InkPanel får ligga kvar i koden för publika sidor tills deras omgång. |
| `src/components/shell/PageHeader.tsx` | h1 `.text-h1`, beskrivning, scen 240 px på dator. | Ersätts i inloggat av `Vagg` + `Rubrik` (avsnitt 4.2). Kvar för publika sidor. |
| `src/components/shell/StatusRow.tsx` | Rad med punkt, ton neutral/warm/positive. | Behålls, restylad: `bg-papper border-kant rounded-2xl`, punkt `bg-ink-3`, `tone="warm"` ger `bg-koppar`. På vägg: `bg-white/5 border-vagg-kant text-vagg-ink`. |
| `src/components/shell/Fordelning.tsx` | Stort tal + segmentstapel + legend. | Behålls för Jobbsöket (våg 4) på golvet. Segmentton `accent` renderar koppar. |
| `src/components/shell/LoadingSkeleton.tsx` | Skelett-varianter på papper. | Får varianten `vagg` (vit 8 procent, L1). `.loading-thread` behålls. |
| `src/components/shell/Sheet.tsx` | Bottenark mobil, centrerat dator, `z-50`. | Behålls. Radie 24 upptill, bakgrund `bg-papper`, handtag `bg-kant-stark`, dimma `rgba(10,12,30,.55)`. |
| `src/components/paywall/GraValSheet.tsx`, `PaywallCard.tsx`, `paywall-copy.ts`, `UpgradeSheet`, `FelSpar`, `PaketBytesRad` | Betalväggens ark och kort, text ur `paywall-copy.ts`, priser ur `PLANS`. Händelser `gray_option_tapped`, `paywall_shown`, `feature_blocked`, `paywall_cta_clicked`. | Våg 1b: bara utseende (papper, kopparknapp, kopparkant på rekommenderat paket, sekundär som textlänk). Våg 5: nytt innehåll enligt A1/A2 och paketbytet. `FelSpar` och `PaketBytesRad` (byte mellan spår) försvinner i våg 5 eftersom spåren försvinner. |
| `src/components/illustrations/primitives.tsx` | `ILLU` (stroke 1,75/2/3/6, radius per storlek 24/48/96/240), `useIlluId`, `IlluSvg`, `IlluAccentGradient`. `--illu-*`-tokens. | Behålls. Tillägg: storlek 120 (`stroke: 3, radius: 10`) för märkena. `ILLU.accent` pekar på `--illu-accent` som blir koppar. Nya symboler i `RumSymboler.tsx` byggs på `IlluSvg` (avsnitt 4.5). |
| `src/components/illustrations/Ikoner.tsx` | Egna 24 px-ikoner (IkonHem, IkonAnsokningar, IkonSkapa, IkonProfil …). | Behålls för rader. Dörrarna är nya (`DorrTran`, `DorrCv`, `DorrBrev`, `DorrJobb`) eftersom de har en kopparyta; `IkonHem`, `IkonAnsokningar`, `IkonSkapa` används inte längre i navet. |
| `src/app/globals.css`, `tailwind.config.js` | Tokens på `:root` (ljust enbart), Tailwind v3 med `var(--x)`-mappning, inga `darkMode`. | Avsnitt 3. |
| `src/app/layout.tsx` | `Inter` på body, `Schibsted_Grotesk` som `--font-display`, `themeColor #EDE8DF`, body `bg-white text-gray-900`. | Body behåller sina klasser (den delas med publika sidor); `:root:has([data-rum]) body` ger `bg-golv text-ink-1` i inloggat (våg 1a). `themeColor` i dashboard-layouten: våg 1a satte indigo `#1B2246`/`#0E1120` statiskt; **våg 1b byter till `generateViewport` som läser `x-pathname`, räknar `rumForPath` och returnerar rummets `--vagg` som enda värde, utan media-villkor** (väggen är densamma i ljust och mörkt läge, så statusfältet ska stå i väggens färg i båda; avsnitt 13, beslut 6). Inline-skript i `<head>` före hydrering: läser `localStorage.tema` (`'ljust'|'morkt'|'system'`) och sätter `document.documentElement.dataset.theme` (`light`/`dark`) eller tar bort attributet. |

### 2.2 Träningen (testerna)

| Fil i dag | Gör i dag | Blir |
|---|---|---|
| `src/app/dashboard/tester/page.tsx` + `TesterHubClient.tsx` + `getHubData.ts` + `components/*` | Hubben: flikar tester/utveckling, `InkPanel` med rekommendation, `TestKategori` per typ, `DevelopmentView` med sparkline, `GraValSheet`, `dagRad` med "N kvar i dag". | Blir **Träningens hemvy** (1a till 1p, W1 till W4). Server: `getTraningSummary` (avsnitt 6.2). Klient bara för arket och knappar. Det gamla katalogläget flyttar till `/dashboard/tester/alla` ("Alla tester") med `TestKategori` restylad som rader på golvet. `DevelopmentView` och `Sparkline` tas bort i våg 3b (kurvan ersätter). `loading.tsx` ritar L1. |
| `src/app/dashboard/tester/[slug]/page.tsx` (`TestHubPage`) | Startsida per test med tidigare resultat, POST `session` (429 kvot, 402/403 betalvägg). | Våg 2: restylad som rum (vägg med testtypens symbol och senaste resultat, golv med starta-kort). Våg 3b: grund/avancerad/expert-startsidorna går via Dagens pass; `[slug]` finns kvar för Alla tester. |
| `…/test/[sessionId]` (`TestRunner`, `MatrixTestSession`, `TestFlowShell`, `TestMeterRow`, `QuestionGridV7`, `AnswerOptionsV7`, `QuestionNavigation`) | Testkörningen: räknande klocka, ledtrådsläge, sparar svar med retry. | Våg 2: `TestFlowShell` får PassShell-utseendet (toppraden, tidsraden som lugn rad utan nedräkning, inga färgbyten). Våg 3b: `PassShell` + `PassFraga` ersätter för pass, mätning och ommätning; provläget (`MatrisProvSession`) behåller sin nedräkning eftersom provet har total tid, men i rummets utseende. |
| `…/results` (`TestResultsPage`, `TestResultsShell`, `PercentileCard`, `TestNextLevelRow`, `TestLevelBadge`, `MatrixQuestionReview`) | Poäng, percentil (minst 25 sessioner), nästa nivå, genomgång. | Våg 2: `Resultatvy` (avsnitt 4.4) på vägg + golv med befintliga tal (rätt av antal, tid), genomgången på golvet med regeln ur `rule`. `TestNextLevelRow` ("nästa nivå") tas bort: det är beteendet vi vill bort från. Percentil visas bara i Alla tester (regeln 25 kvar). Våg 3b: P4/S1/M1/O1. |
| `src/components/tests/shared/reviews/MatrixQuestionReview.tsx` | `categoryFor(slug,id)` via regex på id; avancerad-listan har 7 av 15 id kvar, expert matchar inget ("Övrigt"). | Våg 3a: kategori ur bankens nya fält `family`, inte regex. Regexen får stå som fallback för V5-sessioner. |
| `src/lib/logicTestV7/*.json` (28+28+28), `selectQuestions.v7.ts`, `selectProv.v7.ts` | Banker utan `family`, utan misstagstext, `difficulty` satt för hand. **Rätt svar är alternativ A i 82 av 84 frågor och inget blandar alternativen** (se avsnitt 10, punkt 1). | Våg 3a: `family`, `misstag[]`, deterministisk blandning per session. Våg 3c (testansvarig): fler frågor. |
| `src/lib/tests/sessionGate.ts`, `src/lib/quota/quotaService.ts`, `src/lib/access/features.ts` | Feature per testtyp, dagskvot 1 slutförd session per testtyp och dygn (svensk midnatt), features per scope. | Våg 3a: nya testtyper (`matrislogik-matning`, `-pass`, `-riktat`, `-general`) i `featureForTestType`; kvoten läser `GRATISNIVA` (avsnitt 6.3). Våg 5: scopes `cv` och `tester` finns kvar för befintliga prenumeranter till deras slut, `suggestPlan` ger alltid `all_month`. |
| `src/app/api/logicTestV4/*`, `logicTestV6/*`, `logicTestProv/*` | Session, answer, complete, percentile. `complete` hårdkodar `totalQuestions: 15`, `breakdown` är stubb. | Våg 3a: `complete` räknar nivå (avsnitt 6.3), skriver nivåpunkt och frågestatistik, returnerar `niva_fore`, `niva_efter`, `over_tid`, `familjer`. `totalQuestions` ur sessionens `meta`. |
| `src/lib/onboarding/komigang.ts`, `komigang-server.ts` | Kom igång-brickor (`matris_grund`, `kurva` …). | Brickorna byter namn och text i våg 2 (`matning`, `provdatum`, `pass`, `kurva`); `markeraTestBricka` mappar nya testtyper. |
| `src/components/registrering/intent.ts` | `tester → {track:'tester', plan:'test_week', landning:'/dashboard/tester'}` | Våg 5: `plan: 'all_month'`. Landningen är redan Träningen. |

### 2.3 De andra rummen (våg 4) och betalningen (våg 5)

| Fil i dag | Blir |
|---|---|
| `src/app/dashboard/(oversikt)/DashboardHem.tsx`, `HemHuvud`, `NastaHandling` (InkPanel), `JobbsokOversikt` (Fordelning + egen ink-knapp), `PagarNu`, `ProfilKomplettering`, `DashboardHero`, `SnabbAtgarder`, `ProvaOcksa` | Jobbsökets hemvy (J1/J2): vägg med hälsning och spåret (`Spar`, avsnitt 4.4), `LyftKort` "Nästa handling", sökta tjänster som rader, korsreferensraden till Träningen (nivå och datum, eller "Har du ett rekryteringstest på gång? Mät din nivå, 8 minuter."), "Mer i Jobbsöket" som rader. Tillstånd A/B (inget CV, inget brev) bor nu i CV- och brevrummet; Jobbsöket säger det i en rad, inte med en hero. `JobbsokOversikt`s andra ink-knapp ("Logga ansökan") blir en textlänk: en primär per vy. |
| `src/app/dashboard/sokta-tjanster/*` | Jobbsökets lista, rum-jobb, `PageHeader` byts mot vägg + rubrik. Öppningar mäts (`sokta_tjanster_oppnad`). |
| `src/app/dashboard/profil/cv/*`, `cv-analys/*` (`CvAnalysisResults`), `cv-mallar/*`, `skapa-cv/*`, `linkedin-optimizer/*` | CV-rummet (C1): vägg med poängringen och vad som drar ner, "Åtgärda först" som LyftKort, fynden som rader med analysens faktiska poängeffekt per fynd (aldrig uppskattning), dokumentets väg (utkast, analyserat, åtgärdat, nedladdat) som veckorad. Mina CV som rader. |
| `src/app/dashboard/mina-brev/*`, `skapa-brev/*` | Brevrummet (B1): bekräftelsen i fyra steg på väggen med träffarna mot annonsen som veckorad, brevet som dokument på golvet, "Spara som sökt tjänst" som rad. |
| `src/app/dashboard/intervju/*`, `jobbcoachen/*`, `jobbmatchning/*`, `bli-upptackt/*` | rum-jobb. Vägg med rubrik och en rad, golv som i dag. Ingen ny funktion. |
| `src/app/dashboard/profil/*`, `valj-spar/*`, `kontakt`, `bugg-feedback`, `valkommen/*` | rum-neutral (grafit). Profil får "Utseende: Följer systemet, Ljust, Mörkt" (`Segment`) i våg 1b. `valj-spar` görs om i våg 5 (två paket, inga spår). |
| `src/lib/plans/plans.ts`, `harPaket.ts`, `src/lib/stripe/planPrices.ts`, `src/components/pricing/paket-copy.ts`, `src/app/(public)/priser/*`, `src/app/dashboard/profil/prenumeration/*`, `src/app/api/stripe/create-plan-session`, `webhooks/route.ts` | Våg 5, avsnitt 6.8. |

---

## 3. Tokens

### 3.1 Namn

Konceptets namn i CSS är `--tavla` för väggen och `--vagg` för golvet; det är förvirrande i kod. **I bygget heter väggen `--vagg` och golvet `--golv`.** Mappning: koncept `--tavla` → `--vagg`, `--tavla-2` → `--vagg-2`, `--tavla-3` → `--vagg-3`, `--tavla-ink` → `--vagg-ink`, `--tavla-mjuk` → `--vagg-mjuk`, `--tavla-svag` → `--vagg-svag`, `--tavla-kant` → `--vagg-kant`, koncept `--vagg` → `--golv`, `--rumfarg` → `--rum`.

### 3.2 `src/app/globals.css`, exakt

Ersätter dagens `:root`-block **för inloggat**. Som byggt i våg 1a och fastslaget i avsnitt 13: blocket står under `:root:has([data-rum])`, inte på `:root`, så att publika sidor, kassan och adminen (som läser samma `--mark`, `--accent`, `--ink-1`) står kvar i Tråden tills deras egen omgång. `:has` på roten gör att ark i portaler (`Sheet`, `UpgradeSheet`) också står i rummet. Aliasen skrivs på både roten och varje `[data-rum]` (`var()` löses där egenskapen står). Gamla namn behålls som alias under en övergångsrad så omigrerade sidor inte går sönder; aliasen tas bort i våg 4 när grep ger noll.

```css
:root:has([data-rum]){
  color-scheme:light;
  /* koppar, samma i alla rum och lägen */
  --koppar:#E07A2F; --koppar-ink:#A8491A; --koppar-djup:#C4621F; --koppar-ljus:#F4B98A; --koppar-text:#1A1206; --koppar-mjuk:#FBE3D0;
  /* text */
  --ink-1:#1A1A1F; --ink-2:#4A4A55; --ink-3:#65656E; --ink-hover:#2E2E36;
  /* papper och kanter (rummet får skriva över i mörkt läge) */
  --papper:#FFFFFF; --papper-2:#F4F3F0; --kant:#E3E1DC; --kant-stark:#C9C6BF;
  /* semantik, alltid med ord, aldrig på en missad fråga */
  --positiv:#2F7D5B; --positiv-mjuk:#DCEFE5; --varning:#985A08; --varning-mjuk:#F7E8CF; --fel:#B3382E; --fel-mjuk:#F8E1DE; --fel-kant:#F0C7C2; --fel-morker:#7A2219;
  /* fokus: koppar-ink på golv och papper (4,9:1 mot golv, 4,4:1 mot ton), koppar-ljus på väggen (sätts av .vagg) */
  --fokus:var(--koppar-ink);
  /* djup */
  --lyft:0 1px 2px rgba(20,20,40,.05),0 10px 24px -14px rgba(20,20,40,.18);
  --dimma:rgba(10,12,30,.55);
  /* rummet, standard = Jobbsöket (skog); varje [data-rum] skriver över */
  --golv:#E8EEE7; --vagg:#1B3324; --vagg-2:#2A4C37; --vagg-3:#112219; --vagg-ink:#F2F8F2; --vagg-mjuk:#A9C9B1; --vagg-svag:#6A9676; --vagg-kant:rgba(255,255,255,.12); --ljus:#8FD3A0; --ton:#DCEBDD; --ton-ink:#245C37; --rum:#245C37;
  /* illustrationer */
  --illu-fill:var(--papper); --illu-accent:var(--koppar); --illu-soft:var(--koppar-mjuk); --illu-muted:var(--kant-stark); --illu-on-accent:#FFFFFF; --ia:none;
  /* admin: bara värdena byter, reglerna i AdminChart står kvar */
  --diagram-cv:#1E5F5F; --diagram-test:#3B4790;
  /* layout */
  --bottom-nav-h:calc(72px + env(safe-area-inset-bottom,0px));
  --sidomeny-b:248px;
  /* alias för omigrerade sidor, tas bort i våg 4 */
  --mark:var(--golv); --panel:var(--papper); --insunken:var(--papper-2); --insunken-topp:var(--kant-stark);
  --accent:var(--koppar); --accent-ink:var(--koppar-ink); --accent-mjuk:var(--koppar-mjuk);
  --ink-1-mjuk:var(--vagg-mjuk); --ink-1-kant:var(--vagg-kant); --ink-1-accent:var(--koppar-ljus);
  --cv:#1E5F5F; --cv-mjuk:#D7ECEA; --test:#3B4790; --test-mjuk:#DFE3F6;
}
[data-rum="tran"]{--golv:#EBEDF6;--vagg:#1B2246;--vagg-2:#2B3470;--vagg-3:#121737;--vagg-ink:#F5F6FC;--vagg-mjuk:#AEB4DA;--vagg-svag:#6F78B0;--ljus:#93A0EC;--ton:#DFE3F6;--ton-ink:#3B4790;--rum:#3B4790}
[data-rum="cv"]{--golv:#E6EFEF;--vagg:#113538;--vagg-2:#1D4D51;--vagg-3:#0B2628;--vagg-ink:#F1F8F7;--vagg-mjuk:#A3C9C8;--vagg-svag:#5C918F;--ljus:#7FCFCA;--ton:#D7ECEA;--ton-ink:#1E5F5F;--rum:#1E5F5F}
[data-rum="brev"]{--golv:#F2EAEE;--vagg:#3A1930;--vagg-2:#56284A;--vagg-3:#280F22;--vagg-ink:#FBF3F8;--vagg-mjuk:#D6AFC8;--vagg-svag:#9C6A8C;--ljus:#E29DCB;--ton:#F0DCE8;--ton-ink:#6E2B59;--rum:#6E2B59}
[data-rum="jobb"]{--golv:#E8EEE7;--vagg:#1B3324;--vagg-2:#2A4C37;--vagg-3:#112219;--vagg-ink:#F2F8F2;--vagg-mjuk:#A9C9B1;--vagg-svag:#6A9676;--ljus:#8FD3A0;--ton:#DCEBDD;--ton-ink:#245C37;--rum:#245C37}
[data-rum="neutral"]{--golv:#ECEBE9;--vagg:#26262C;--vagg-2:#36363E;--vagg-3:#1A1A1F;--vagg-ink:#F5F4F7;--vagg-mjuk:#B9B8C2;--vagg-svag:#7C7B88;--ljus:#C9C8D2;--ton:#E2E1E6;--ton-ink:#3C3C46;--rum:#3C3C46}
```

Mörkt läge: båda formerna, väggen byter aldrig. Media-formen står på (avsnitt 13, beslut 1: den går till `main` först tillsammans med våg 1b, som tar `text-gray-*` och `bg-white` till noll i inloggat).

```css
@media (prefers-color-scheme: dark){
  :root:has([data-rum]):not([data-theme="light"]){ /* MÖRKT-BLOCKET */ }
}
:root:has([data-rum])[data-theme="dark"]{ /* MÖRKT-BLOCKET, samma innehåll */ }
```

MÖRKT-BLOCKET (skrivs två gånger, ett makro eller en kopia, aldrig bara den ena formen):

```css
color-scheme:dark;
--ink-1:#F3F2F7; --ink-2:#C7C6D0; --ink-3:#9391A1; --ink-hover:#E4E3EC;
--papper:#1A1C27; --papper-2:#20232F; --kant:#2B2F40; --kant-stark:#3E4357;
--koppar-ink:#F2A368; --koppar-mjuk:rgba(224,122,47,.18);
--positiv:#6CC79A; --positiv-mjuk:#1C3A2D; --varning:#E3A85A; --varning-mjuk:#3A2B14; --fel:#E57F74; --fel-mjuk:#3F1F1C; --fel-kant:#5A2D29; --fel-morker:#F3B3AB;
--lyft:0 1px 2px rgba(0,0,0,.3),0 12px 28px -14px rgba(0,0,0,.6);
--golv:#0B140E; --ton:#1C3A27; --ton-ink:#B4DEBF;
```

och per rum i mörkt läge (inuti båda formerna):

```css
[data-rum="tran"]{--golv:#0E1120;--papper:#171B2E;--papper-2:#1D2238;--kant:#293050;--kant-stark:#3B4470;--ton:#232B55;--ton-ink:#B9C2F2}
[data-rum="cv"]{--golv:#0B1516;--papper:#13201F;--papper-2:#182827;--kant:#223634;--kant-stark:#2F4A48;--ton:#163A3A;--ton-ink:#A9DAD6}
[data-rum="brev"]{--golv:#160B13;--papper:#22141E;--papper-2:#2A1925;--kant:#3A2434;--kant-stark:#50334A;--ton:#3E1F35;--ton-ink:#E8B8D8}
[data-rum="jobb"]{--golv:#0B140E;--papper:#141E17;--papper-2:#19261D;--kant:#223A2A;--kant-stark:#2F4E3A;--ton:#1C3A27;--ton-ink:#B4DEBF}
[data-rum="neutral"]{--golv:#121318;--papper:#1B1C23;--papper-2:#22232B;--kant:#33343F;--kant-stark:#454654;--ton:#2A2A33;--ton-ink:#C9C8D2}
```

Observera CSS-specificiteten: `[data-rum]`-reglerna i mörkt läge måste stå **inuti** `:root:not([data-theme="light"])`-blocket som `:root:not([data-theme="light"]) [data-rum="tran"]{…}` och `:root[data-theme="dark"] [data-rum="tran"]{…}`, annars vinner ljusa rumsvärdena.

Klasser i globals.css (de enda ställen där toning får finnas):

```css
.vagg{position:relative;color:var(--vagg-ink);background:linear-gradient(168deg,var(--vagg-2) 0%,var(--vagg) 48%,var(--vagg-3) 100%);border-radius:0 0 28px 28px;box-shadow:inset 0 -1px 0 rgba(255,255,255,.06)}
.vagg::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(120% 60% at 85% -10%,rgba(255,255,255,.08),transparent 60%)}
.vagg>*{position:relative;z-index:1}
.knapp-primar{background:linear-gradient(180deg,#E8863B,var(--koppar) 60%,var(--koppar-djup));color:var(--koppar-text);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 1px 2px rgba(120,60,10,.25)}
.kurva-yta{fill:url(#g-yta)} /* defs ritas av Kurva-komponenten med useIlluId */
.skelett-vagg{background:rgba(255,255,255,.08);border-radius:8px}
:root:has([data-rum]) :focus-visible{outline:2px solid var(--fokus);outline-offset:2px}
.vagg{--fokus:var(--koppar-ljus)} /* 7,6 till 8,9:1 mot vagg; koppar-ink ger bara 2,3 till 2,7:1 där */
[data-rum]{transition:background-color 240ms ease}
@media (prefers-reduced-motion: reduce){[data-rum]{transition:none}}
```

Rörelseklasser (`.motion`-varianten i konceptet, rad 176 till 191) flyttas in oförändrade: `rita` 700 ms, `tona` 500 ms, `tand` 240 ms, `fyll` 500 ms, `upp` 260 ms med steg 120/420/720/1020 ms, `marke` 600 ms, allt avstängt under `prefers-reduced-motion`. Klassen sätts bara när `nyPunkt` är sant (serverberäknat: senaste nivåpunkt nyare än `profiles.traning_sedd_at`).

Övergångsregel i mörkt läge (våg 1a, avsnitt 13 beslut 5): Trådens bläckytor med vit text (`bg-ink-1 text-white`: InkPanel, `INK_KNAPP`, pakethuvudet i sidomenyn) får `--vagg` som bakgrund och `--vagg-2` vid hover i mörkt läge, så att knappar inte försvinner när ink-1 vänds. Regeln är tillfällig: våg 1b tar bort den för allt 1b restylar (`INK_KNAPP` ersätts av `KNAPP_PRIMAR`, pakethuvudet försvinner med `Sidomeny`), våg 4 tar bort resten (InkPanel ur inloggat) och regeln själv.

Tas bort ur globals.css: `.animate-shimmer`, `.card-hover-effect`, `.animate-pulse-pink`, `.animate-glow`, body-regeln med `--foreground-rgb`/`--background-rgb`. `@keyframes pulse` står kvar (samma namn som Tailwinds, publika sidor använder `animate-pulse`). Behålls: `.loading-thread`, `.confirm-*`, `.writing-lines`, `sheetUp`, `fadeInPlace`, `html[data-flow-active]`-reglerna (uppdaterade till `[data-topprad]` och `nav[aria-label="Rummen"]`).

### 3.3 Typografi (utilities i `@layer utilities`)

| Klass | Mobil | Dator (lg) | Vikt | Användning |
|---|---|---|---|---|
| `.text-h1` | 34/36 | 44/46 | 800, -0.025em | Rubriken på väggen, en per vy |
| `.text-h1-liten` | 28/31 | 32/35 | 800 | Rubrik i resultat, kvitto, CV-rummet |
| `.text-tal-stor` | 64/64 | 72/72 | 800, -0.035em, tabular | Provdagens datum, mätningens nivå |
| `.text-tal-rad` | 22/24 | 22/24 | 700, tabular | Dagsradens tre tal |
| `.text-tal-tre` | 28/30 | 28/30 | 700, tabular | Resultatets tre tal |
| `.text-kort-t` | 22/27 | 22/27 | 700, -0.02em | Kortets titel (LyftKort) |
| `.text-ey` | 12/16 | 12/16 | 600, .08em, versaler | Eyebrow (`.rub` i konceptet) |
| `.text-meta` | 13/18 | 13/18 | 400 | Metadata |
| `.text-ax` | 11/16 | 11/16 | 500 | Bara i SVG-axlar och `.axel` |

Alla med `font-display` (Schibsted Grotesk) utom `.text-ey`, `.text-meta`, `.text-ax` (Inter). Brödtext 14/21 på kort, 15/22 på vägg. `.text-h1` 34/36 gäller inne i `[data-rum]`; artikelramen och adminen behåller 32/35 (våg 1a, avsnitt 13).

### 3.4 `tailwind.config.js`

```js
colors: {
  golv:'var(--golv)', papper:{DEFAULT:'var(--papper)',2:'var(--papper-2)'},
  vagg:{DEFAULT:'var(--vagg)',2:'var(--vagg-2)',3:'var(--vagg-3)',ink:'var(--vagg-ink)',mjuk:'var(--vagg-mjuk)',svag:'var(--vagg-svag)',kant:'var(--vagg-kant)'},
  ljus:'var(--ljus)', ton:{DEFAULT:'var(--ton)',ink:'var(--ton-ink)'}, rum:'var(--rum)',
  koppar:{DEFAULT:'var(--koppar)',ink:'var(--koppar-ink)',djup:'var(--koppar-djup)',ljus:'var(--koppar-ljus)',text:'var(--koppar-text)',mjuk:'var(--koppar-mjuk)'},
  kant:{DEFAULT:'var(--kant)',stark:'var(--kant-stark)'},
  ink:{1:'var(--ink-1)',2:'var(--ink-2)',3:'var(--ink-3)',hover:'var(--ink-hover)'},
  positiv:{…}, varning:{…}, fel:{…},            // som i dag
  diagram:{cv:'var(--diagram-cv)',test:'var(--diagram-test)',allt:'var(--ink-1)'},
  // alias tills våg 4: mark, panel, insunken, accent, cv, test
}
borderRadius: { lg:'8px', xl:'12px', '2xl':'16px', vagg:'28px', ark:'24px' }
boxShadow: { lyft:'var(--lyft)' }   // insunken, val, svav tas bort i våg 4
fontSize: { 'tal-rad':['22px',{lineHeight:'24px',fontWeight:'700'}], 'tal-tre':['28px',{lineHeight:'30px',fontWeight:'700'}], 'kort-t':['22px',{lineHeight:'27px',fontWeight:'700'}], ey:['12px',{lineHeight:'16px',letterSpacing:'.08em',fontWeight:'600'}], meta:['13px','18px'], ax:['11px','16px'] }
```

Inget `darkMode`-nyckelord i Tailwind: mörkt läge sker helt via variabler. `dark:`-klasser får inte användas (grep).

### 3.5 Kontrast, kontrollräknad (WCAG, mot ljust läge där inget annat anges)

Talen rättade 2026-10-10 efter våg 1a: källan är `scripts/kontrast-rummen.mjs` (WCAG 2.x relativ luminans), inte konceptets handräkning. Kravet är oförändrat.

| Par | Kontrast | Krav |
|---|---|---|
| vagg-ink `#F5F6FC` på vagg `#1B2246` | 14,3:1 | AA |
| vagg-mjuk `#AEB4DA` på vagg | 7,6:1 | AA, ner till 11 px |
| vagg-mjuk på vagg-2 `#2B3470` | 5,7:1 | AA |
| vagg-svag `#6F78B0` på vagg | 3,7:1 | bara streck och ihåliga märken, aldrig text |
| koppar `#E07A2F` på vagg | 5,1:1 (petrol 4,4, skog 4,5) | linje, punkt, knapp (krav 3:1) |
| koppar på vagg-2 | 3,8:1 | **därför aldrig text på väggen** |
| koppar-ljus `#F4B98A` på vagg-2 | 6,6:1 (petrol 5,4, skog 5,6) | AA, all kopparfärgad text på väggen |
| koppar-ljus på vagg | 8,9:1 (petrol 7,6) | AA |
| koppar-text `#1A1206` på koppar | 6,2:1 | AA, knappen |
| koppar-text på koppar-djup `#C4621F` | 4,5:1 | AA, knappens mörka ände; toningen får inte gå mörkare |
| koppar-ink `#A8491A` på papper | 5,8:1 | AA |
| koppar-ink på golv (alla rum) | 4,9:1 | AA, fokusringen på golvet (krav 3:1) |
| koppar-ink på ton | 4,4 till 4,7:1 | fokusringen på ton (krav 3:1) |
| koppar-ink mörkt `#F2A368` på papper mörkt `#1A1C27` | 8,2:1 | AA |
| ink-3 `#65656E` på golv indigo `#EBEDF6` | 4,9:1 | AA |
| ton-ink `#3B4790` på ton `#DFE3F6` | 6,6:1 | AA |
| ljus `#93A0EC` på vagg | 6,2:1 | AA (siktets etikett) |
| varning `#985A08` på varning-mjuk `#F7E8CF` | 4,6:1 | AA (`#9A5B08` gav 4,49 och byttes) |

Motsvarande för petrol, plommon, skog och grafit är kontrollerade i våg 1a (240 textpar, inget under 4,5:1) och står i `docs/designsystem.md` avsnitt 2; skriptet körs igen i varje våg som rör tokens.

---

## 4. Komponenter

Alla nya komponenter i `src/components/rum/` om inget annat sägs. Server components där inga hooks behövs (vägg, golv, kurva, skala, rader), klient bara för interaktion. Props som TypeScript. Klassnamn i Tailwind med tokens ur avsnitt 3; inga inline-stilar utom SVG-koordinater.

### 4.1 Rummet

```ts
// src/lib/rum/rum.ts
export type Rum = 'tran'|'cv'|'brev'|'jobb'|'neutral';
export function rumForPath(pathname: string): Rum;        // tabellen i avsnitt 5
export const RUM_NAMN: Record<Rum,string>;                  // 'Träningen','CV','Personliga brev','Jobbsöket','Konto'
export const DORRAR: {rum: Rum; etikett: string; href: string; Ikon: ComponentType<IkonProps>}[]; // fyra, i ordning
```

`DashboardShell` sätter `data-rum` på yttersta diven ur props (server) och uppdaterar via `usePathname` (klient). Ingen flash: servervärdet är rätt från första HTML.

### 4.2 Väggen och golvet

```ts
// Vagg.tsx (server)
interface VaggProps { children: ReactNode; className?: string; tat?: boolean /* padding-bottom 24 i stället för 44 */ }
// Golv.tsx (server): <div class="px-4 pb-[calc(var(--bottom-nav-h)+24px)] lg:px-10 lg:pb-10 flex flex-col gap-4 flex-1">
// Topprad.tsx (klient, för menyerna)
interface ToppradProps { brand: string /* rummets namn */; kontext?: ReactNode /* textlänk, t.ex. "Matrigma, 24 okt" */; stang?: {href?: string; onClick?: () => void; etikett: string} /* ersätter brand+kontext i flöden */ }
```

`Topprad` är 60 px (72 på dator), `brand` i `font-display` 15/700 `text-vagg-ink` (ordet "Träningen" står med `text-vagg-mjuk` fram till rummets namn i fet enligt konceptets `.brand b`), höger: `MessagesHeaderButton` (bara när olästa > 0), `NotificationBell` (bara när olästa > 0), `ProfileMenu` som 34 px avatar med initialer på `bg-vagg-kant`. Alla knappar 44 px träffyta, `text-vagg-ink`. På golvet (flöden) samma komponent med `text-ink-1`. `data-topprad` sätts för `html[data-flow-active]`-regeln.

```ts
// Rubrik.tsx (server): h1 på väggen
interface RubrikProps { titel: ReactNode; rad?: ReactNode /* small-raden, text-vagg-mjuk 14/21 */; liten?: boolean /* .text-h1-liten */; as?: 'h1'|'p' }
```

### 4.3 Navet

```ts
// Dorrnav.tsx (klient, usePathname): ersätter MobileBottomNav
// <nav aria-label="Rummen" class="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 h-[var(--bottom-nav-h)] pb-[env(safe-area-inset-bottom)] bg-papper border-t border-kant px-1.5 pt-1.5 lg:hidden">
// varje <a>: flex-col, items-center, justify-start, gap-0.75, min-h-12, rounded-xl, text-[11px] leading-[13px] font-medium text-ink-3 text-center text-balance px-0.5
// dörren: 56×30, rounded-full, aktiv: bg-ton text-ton-ink; etikett aktiv: text-ink-1 font-semibold; aria-current="page"
// Aktiv rum = rumForPath(pathname); Jobbsöket är aktiv på /dashboard och alla rum-jobb-routes.
// Sidomeny.tsx (klient för aktiv rad): ersätter Sidebar
interface SidomenyProps { rum: Rum; undersidor: {href: string; etikett: string; chip?: ReactNode; last?: boolean; exact?: boolean}[]; konto: {namn: string; initialer: string; paket: string; href: '/dashboard/profil'} }
```

Sidomenyn: `w-[248px] bg-papper border-r border-kant p-3 flex flex-col gap-1 overflow-y-auto`. Logotyp 18/800 (`SidebarLogo` återanvänds). Fyra rumsrader 48 px, 15/600, dörrikon 32×32 `rounded-[10px] bg-papper-2 text-ink-3`, aktiv rad `bg-ton text-ton-ink`, aktiv dörr `bg-rum text-white`. Grupprubrik "I Träningen" / "I CV" / "I Personliga brev" / "I Jobbsöket" i `.text-ey text-ink-3`. Undersidor 40 px, 14/400 `text-ink-2`, aktiv `text-ink-1 font-medium` med `shadow-[inset_3px_0_0_var(--koppar)] rounded-r-[10px]`. Låst undersida: `chip` med `IkonLas` 12 px, klick öppnar `GraValSheet surface="sidomeny"`. Konto längst ner (`mt-auto`): avatar 28 px, "Anna Andersson · Hela paketet" 13/400 `text-ink-2`, länk till profilen. Under kontot `SidebarFooter` (Admin, Hjälp och kontakt, Rapportera ett fel) som i dag, 13 px.

Undersidor per rum (våg 1b, befintliga routes; våg 3b lägger till Träningens):

| Rum | Undersidor |
|---|---|
| tran | Dagens pass `/dashboard/tester` (exact), Kurvan `/dashboard/tester/kurvan` (våg 3b), Alla tester `/dashboard/tester/alla` (chip: antal typer), Provläget `/dashboard/tester/matrislogik-prov` (lås utan `test_exam_mode`), Test och datum `/dashboard/tester/installningar` (våg 2) |
| cv | Mina CV `/dashboard/profil/cv` (chip: antal), Analysera CV `/dashboard/cv-analys`, CV-mallar `/dashboard/cv-mallar`, LinkedIn-profilen `/dashboard/linkedin-optimizer` |
| brev | Mina brev `/dashboard/mina-brev` (chip: antal), Skriv nytt brev `/dashboard/skapa-brev` |
| jobb | Översikt `/dashboard` (exact), Sökta tjänster `/dashboard/sokta-tjanster` (chip), Inför intervjun `/dashboard/intervju` ("Nyhet"-chip till 2026-10-22 som i dag), Matchade jobb `/dashboard/jobbmatchning` (chip "N nya"), Jobbcoachen `/dashboard/jobbcoachen`, Bli upptäckt `/dashboard/bli-upptackt` |
| neutral | Profil `/dashboard/profil` (exact), Prenumeration `/dashboard/profil/prenumeration`, Utseende (ankare på profilen) |

### 4.4 Byggstenar på vägg och golv

```ts
// Knappar: src/components/shell/knappar.ts (ersätter INK_KNAPP/INK_LANK)
export const KNAPP_PRIMAR   = 'knapp-primar inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-[18px] text-[15px] font-semibold tracking-[-.005em] disabled:opacity-50';
export const KNAPP_SEKUNDAR = 'inline-flex h-12 w-full items-center justify-center rounded-xl border border-kant-stark bg-papper px-[18px] text-[15px] font-semibold text-ink-1';
export const KNAPP_GLAS     = 'inline-flex h-12 w-full items-center justify-center rounded-xl border border-vagg-kant bg-white/[.08] px-[18px] text-[15px] font-semibold text-vagg-ink';
export const LANK           = 'text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark';
export const LANK_VAGG      = 'text-sm font-medium text-vagg-ink underline underline-offset-4 decoration-vagg-svag';
export const KNAPPRAD       = 'mt-3.5 flex flex-col items-stretch gap-2.5 [&>a.lank]:min-h-9 [&>a.lank]:inline-flex [&>a.lank]:items-center [&>a.lank]:justify-center';
// Regel: exakt ett element med KNAPP_PRIMAR per vy. Det sekundära i en betalvägg är alltid LANK.

// LyftKort.tsx (server): det lyfta kortet, överlappar väggen 30 px
interface LyftKortProps { eyebrow?: string; eyebrowTon?: 'koppar'|'neutral'; titel: ReactNode; text?: ReactNode; handling?: ReactNode /* KNAPP_PRIMAR */; sekundar?: ReactNode /* LANK */; fot?: ReactNode /* meta-rad under linje */; children?: ReactNode; label: string /* aria-label */ }
// class: bg-papper border border-transparent rounded-2xl p-4 shadow-lyft -mt-[30px] relative z-[2]; i mörkt läge border-kant

// Kort.tsx (server): vanligt kort. Rader.tsx (server): lista i kort, rader 56 px, 12 px gap, border-t border-kant mellan
interface RadProps { symbol?: ReactNode /* 40 px, text-ton-ink; svag: text-ink-3 */; titel: ReactNode; meta?: ReactNode; stapel?: {andel: number; ton: 'ton'|'koppar'}; hoger?: ReactNode /* länk, chip eller IkonChev */ ; href?: string }
// SektRubrik.tsx: "Var du tappar  [Alla familjer]" 13/600 text-ink-3 med valfri länk
// Chip.tsx: höjd 28, radie 8, bg-papper-2 border-kant 12/500; ton: bg-ton text-ton-ink; las: med IkonLas 14 px
// StatusRow: befintlig, restylad (avsnitt 2.1)

// Dagsrad.tsx (server)
interface DagsradProps { ring: ReactNode; tal: [{varde: string; etikett: string}, {varde: string; etikett: string}, {varde: string; etikett: string}] }
// Dagsring.tsx (server, SVG 56): status 'kvar' (streckad kopparring + liten ring i mitten), 'gjord' (fylld ring + bock), 'general' (kvadrat i mitten), 'uppvarmning' (tre prickar). Prop fyllAnimering sätter klassen .fyll.
// Veckorad.tsx (server): 7 celler (eller n via prop), cell 22 px, status 'gjord'|'nu'|'vila'|'tom'|'kvar'|'om'; etiketter mån..sön; även för CV-rummets dokumentväg och brevets träffar (prop celler: {etikett; status}[])
// Formord.tsx: "form: stigande|stabil|vilar" med kopparpunkt
```

Instrumenten (server-renderade SVG, inga bitmappar, text i SVG bara 11 px axlar med `aria-label` som läser ut allt):

```ts
// Kurva.tsx
type Nivapunkt = { dag: string /* YYYY-MM-DD */; niva: number; typ: 'matning'|'pass'|'ommatning'|'general' };
type PlanDag   = { dag: string; typ: 'pass'|'vila'|'ommatning'|'general'|'prov'; status: 'gjord'|'idag'|'kvar'|'last' };
interface KurvaProps { punkter: Nivapunkt[]; plan: PlanDag[]; idag: string; start: string /* mätningens dag */; prov?: string; sikte?: number; bredd: 'mobil'|'dator'; nyPunkt?: boolean; hojd?: 'hem'|'full' /* 150 el. 200 mobil */; ariaLabel: string; utanPlan?: boolean }
```
Regler: viewBox 380×150 (mobil) eller 840×170 (dator), aldrig skalad text (två viewBoxar, W1-kravet). x = 30 + (dagindex × (336 / (antal dagar − 1))) mobil, 40 + … × (776 / …) dator. y-axeln visar tre heltal: golvet är `floor(min(nivå))`, taket golv + 2, men minst `ceil(sikte)`; 22 px per nivå mobil, 25 dator. Siktebandet börjar vid `start` (dagen siktet sattes), 6 px högt i `--ljus` med opacitet 0,10, streckad linje ovanpå. Ytan under linjen `#g-yta` (koppar 0,38 till 0). Dagens punkt r 4,5 med lyster (`#g-lyster`, r 14) bara på senaste punkten; mätning och ommätning r 5,5 med `stroke: koppar-ljus 2,5`; pass r 3,5; generalrepetition som kvadrat 8×8. Dagens ihåliga ring (`punkt nu`) när passet inte är gjort. Vilodagar ritas inte som punkt på kurvan, bara som lucka i planraden. Planraden längst ner (y 132): gjorda fyllda r 3, kommande ihåliga r 3 i `vagg-svag`, ommätning r 4,5 i `vagg-mjuk` 2 px, generalrepetition som ihålig kvadrat, låsta (gratis) som fyllda `vagg-kant`-cirklar r 5 (`kvar gra`). Provlinjen lodrät i `vagg-mjuk` 1,5 med "Prov" ovanför; passerat prov i koppar med fylld kvadrat. Axeln under SVG:n i HTML (`.axel`, 11 px): start, "i dag" i koppar-ljus, en mittpunkt, slutet. Linjen bryts vid vilodagar (separata `<path>`), som i 1c. Utan datum: ingen provlinje, texten "Siktet sätts med datumet" uppe till höger, planraden fortsätter sju dagar framåt med ommätningar var sjunde dag (1h). Inga nivåer över 7,5 i exempel; produktionskurvan ritar vad datan säger men y-axeln toppar vid 10.

```ts
// Nivaskala.tsx
interface NivaskalaProps { nu: number; fran?: number /* mätningens nivå, ihålig ring */; sikte?: number; etikettNu: string /* "Du 6,4" | "Nu 5,6" | "Du" */; etikettFran?: string /* axeltext under ringen: "5 · mätningen" | "från 5,4" */; bredd: 'mobil'|'dator'; siktLank?: boolean /* "Sikte 6,5, ändra" */ }
```
viewBox 380×56 / 840×56; x = 16 + (nivå − 1) × 38,667 (mobil) eller × 89,78 (dator). Spår `vagg-kant` 6 px, fylld del `#g-koppar-h` 6 px, tio ticks (1, 5, 10 större), `du` r 7 koppar med `stroke: vagg` 3, `fran` r 5 ihålig `vagg-mjuk`, siktet som triangel i `--ljus` ovanför. Etikett "Nu 5,6" i koppar-ljus, "Sikte 6,5" i `--ljus`. Axeltext: 1, `etikettFran` (ersätter "5" när den finns), 10.

```ts
// Poangring.tsx (CV-rummet): 112 px, 0 till 100, koppar på vagg-kant, tal 30/800 i mitten, "av 100" 11 px
// Spar.tsx (Jobbsöket): rader per sökt tjänst, fyra stationer (Sökt, Svar, Intervju, Erbjudande), kopparlinje till aktuell station, aktuell punkt r 6,5 med lyster, tyst tjänst som ihålig kopparring, etikett under; mobil viewBox 380×(40+40n), dator 420×…
// Staplar.tsx (tempo per fråga): 9 staplar, höjd 72, streckad linje = provets tid, .over koppar, .fel opacitet 0,35, axel "fråga 1 … fråga 9"
// Plan.tsx (M1): rader 28 px punkt + text + chip; punkt gjord koppar, ommätning ring 2,5 px, prov fylld kvadrat; låst rad text-ink-3 med LasChip
// Marke.tsx: {typ: 'matning'|'vecka'|'niva'|'general'|'prov'; storlek: 48|72|132}, SVG ur RumSymboler
```

Flödet (våg 2 för utseendet, 3b för passet):

```ts
// PassShell.tsx (klient): FlowShell-variant
interface PassShellProps extends Omit<FlowShellProps,'step'|'totalSteps'> { fraga: number; antal: number; tema: string; undertitel: string /* "Dagens pass · nivå 5" */; tid: {sekunder: number; budget: number}; avslutaHref: string }
// tidsraden: 4 px, bg-papper-2, fyllning koppar bredd min(sekunder/budget,1), radie 0 2 2 0; under: "0:38" vänster, "provets tid 1:08" höger, 11 px tabular; räknar inte ner, byter aldrig färg
// PassFraga.tsx: matrisen i .matris (papper, radie 16, lyft), frågetext centrerad meta, sex alternativ i 3-kolumners grid aspect-ratio 1, bokstav uppe till vänster 11/600; tillstånd vald (border ink-1 + inset 1 px), ratt (border koppar + kopparpunkt uppe till höger), dim (opacitet .38)
// Regelpanel.tsx: bg-ton radie 14, rad "Inte den här · 52 s" / "Rätt · 29 s" i .text-ey text-ton-ink, regel 18/700 text-ink-1 (mörkt: text-ton-ink), misstagstext 14/20 text-ink-2; role="status" aria-live="polite"
// Resultatvy.tsx (server): vägg med Topprad(stang), fyra steg (.steg s1..s4) ring+rubrik, Nivaskala, tre tal, mening; golv med Staplar-kort, genomgången som Rader, StatusRow, fot med KNAPP_PRIMAR + LANK
// Kvitto.tsx: helskärm på väggen (ingen radie), märke 132, eyebrow, h1, mening, KNAPP_GLAS "Tillbaka till Träningen"
// Ingang.tsx (klient, tre steg på golvet, E1 till E3 och E3-P): valgrid 2 kolumner (val 118 px, symbol 44, titel 15/600, rad 12), bred rad för "Vet inte"; chips 40 px; datumfält 48 px; plan-kortet med SymPlan 56
```

Betalväggen (våg 1b utseende, våg 5 innehåll): `GraValSheet` → `Sheet bare` → `PaywallCard` ritar A1: eyebrow "Hela vägen till provdagen" i koppar-ink, rubrik 24/700, meta, två `Paket`-kort (namn 18/700, pris 18/700 tabular höger, `small` period 12/500, "ingår"-rad 13/19, rekommenderad med kopparkant + eyebrow "Rekommenderas med 14 dagar kvar"), `KNAPP_PRIMAR` "Köp Hela paketet, 149 kr i månaden", `LANK` "Köp Dagspasset, 49 kr", meta "Ett grundpass om dagen är gratis även utan paket."

### 4.5 Symbolbiblioteket (`src/components/illustrations/RumSymboler.tsx`)

Byggs på `IlluSvg` ur `primitives.tsx`, konturer i `currentColor`, exakt en kopparyta per symbol (`fill: ILLU.accent`), unika gradient-id via `useIlluId`. Koordinaterna tas ordagrant ur konceptets `<defs>` (rad 437 till 515 i HTML-filen). Ingen symbol får en bakgrundscirkel.

| Export | Storlek | Ur konceptet | Används |
|---|---|---|---|
| `SymMatris`, `SymSiffror`, `SymOrd`, `SymPerson`, `SymVetInte` | 48 (stroke 2) | `#s-matris` … `#s-vetinte` | Ingången, Fler tester, passets topp, kurvans små multiplar, korsreferensen |
| `DorrTran`, `DorrCv`, `DorrBrev`, `DorrJobb`, `DorrProfil` | 24 (stroke 1,75) | `#i-tran` … `#i-profil` | Dörrnav, sidomeny |
| `IkonX`, `IkonChev`, `IkonPil`, `IkonLas`, `IkonKalender`, `IkonCheck`, `IkonInfo`, `IkonTillbaka`, `IkonPenna` | 24 | `#i-x` … `#i-penna` | Ersätter lucide i skalet |
| `MarkeMatning`, `MarkeVecka`, `MarkeNiva`, `MarkeGeneral`, `MarkeProv` | 120 (bas `MarkeBas` med `#g-marke`, `#g-marke-kant`) | `#m-matning` … `#m-prov` | Kvitto 132, O1 48, kurvans legend 24 |
| `SymPlan` | 96 | `#s-plan` | Tomt tillstånd (T1, E3) |
| `Gradienter` | defs | `#g-koppar-h`, `#g-yta`, `#g-lyster` | Renderas av `Kurva` och `Nivaskala` med egna id |

`primitives.tsx`: `ILLU.stroke[120] = 3`, `ILLU.radius[120] = 10`, `IlluBox` får `120`. `--illu-accent` är koppar; `--ia` (MarginPlate) tas bort i våg 4 när MarginPlate försvinner.

---

## 5. Rumsklass per route

`rumForPath` i `src/lib/rum/rum.ts`, i den här ordningen (första träff vinner):

| Mönster | Rum |
|---|---|
| `/dashboard/tester` och allt under | `tran` |
| `/dashboard/profil/cv`, `/dashboard/skapa-cv`, `/dashboard/cv-analys`, `/dashboard/cv-mallar`, `/dashboard/linkedin-optimizer` och allt under | `cv` |
| `/dashboard/mina-brev`, `/dashboard/skapa-brev` och allt under | `brev` |
| `/dashboard/profil`, `/dashboard/valj-spar`, `/dashboard/kontakt`, `/dashboard/bugg-feedback`, `/dashboard/valkommen`, `/dashboard/vecka` | `neutral` |
| `/dashboard`, `/dashboard/sokta-tjanster`, `/dashboard/intervju`, `/dashboard/jobbcoachen`, `/dashboard/jobbmatchning`, `/dashboard/bli-upptackt` och allt annat under `/dashboard` | `jobb` |

`src/proxy.ts` lägger `x-pathname` på svaret (requestHeaders) för alla `/dashboard`-anrop så layouten kan läsa den; verifiera att den befintliga 404-omskrivningen för prov-token inte påverkas. Landning på `/dashboard` i det senast besökta rummet (`profiles.senaste_rum`) byggs i våg 4; tills dess är `/dashboard` Jobbsökets hemvy.

---

## 6. Vågorna

Varje våg: PR mot `main` från `design/rummen` (en underbranch per våg, `design/rummen-1a`, `design/rummen-1b` och så vidare, som mergas in i `design/rummen` efter testansvarigs och art-directors granskning av skärmdumparna). Våg 1a och 1b går till `main` i en gemensam PR (avsnitt 13). Ingen våg startar innan föregående vågs klicktest är rapporterat i `docs/qa/rummen/`. Våg 3c (innehåll) löper parallellt från dag ett.

### Våg 1a: tokens, mörkt läge, designsystemet (Opus, en agent, cirka en dag)

Omfattning: avsnitt 3 helt. `globals.css`, `tailwind.config.js`, `layout.tsx` (body, themeColor, tema-skriptet), `docs/designsystem.md` v3 "Rummen" (ny inledning, avsnitt 2 tokens med kontrasttabellen för alla fem rum, avsnitt 4 djup med vägg/papper/ton, avsnitt 6 komponenter enligt avsnitt 4 här, avsnitt 7 symboler, avsnitt 8 rörelse med tiderna, avsnitt 10 grep-listan ur avsnitt 1.7 här, avsnitt 11 mörkt läge "byggt", avsnitt 12 "publika sidor: Tråden tills vidare", avsnitt 14 ändringslogg). `primitives.tsx` storlek 120. Inga komponenter rör sig; befintliga sidor renderar med aliasen och ska se ut som i dag förutom att orange blivit koppar och beige blivit skog-golv.

Acceptans:
1. `npm run build` och `tsc` gröna. Alla befintliga vitest gröna.
2. Mörkt läge: `data-theme="dark"` på `<html>` ger mörkt golv och papper på `/dashboard`, `/dashboard/tester`, `/dashboard/profil`; `prefers-color-scheme: dark` utan attribut ger samma; `data-theme="light"` under mörkt systemläge ger ljust. Skärmdump × 3 vyer × 3 lägen.
3. Kontrasttabellen i designsystemet är komplett för fem rum och inget textpar under 4,5:1.
4. Admin: `/admin` diagramsidor renderar med petrol och indigo som spårfärger; direktetiketterna läsbara; skärmdump före och efter i `docs/qa/rummen/vag-1a/admin/`.
5. `npm run perf:inloggat` inom budget (ingen regression mot senaste rapporten).
6. Grep-listan (avsnitt 1.7) körd; träffarna listade som "finns kvar, tas i våg Nb" i PR-texten (den här vågen tar inte bort dem).

Utfall 2026-10-10: byggt, typkontrollerat och klicktestat på `design/rummen-1a` (`docs/qa/rummen/vag-1a/README.md`), 60 av 60 vyer, kontrast utan avvikelser, perf inom bruset. Art-directors granskning och beslut i avsnitt 13. **Går inte till `main` ensam.**

### Våg 1b: skalet, nav, knappar, symboler (Opus, en agent för skal och nav, en för symbolbiblioteket, två till tre dagar)

Tillkommer efter våg 1a (avsnitt 13): (a) `text-gray-*`, `bg-white`, `bg-gray-*` och `border-gray-*` tas till noll i `src/app/dashboard` och i de komponenter som renderas där (utom mallförhandsvisningar) enligt mappningen i 13.1, så att mörkt läge kan följa systemet; (b) `rumForPath` ersätter det konstanta `data-rum="jobb"`; (c) `--bottom-nav-h` sätts till `calc(72px + env(safe-area-inset-bottom,0px))` i samma commit som `Dorrnav`; (d) `themeColor` per rum via `generateViewport` (avsnitt 2.1); (e) övergångsregeln för bläckytor tas bort för allt 1b restylar; (f) `linkedin-optimizer` steg 1 får reserverad höjd för CV-listan (CLS 0,292 på `main`, hittat i 1a:s perf-körning) eftersom sidan ändå får en vägg; (g) klicktestet körs i mörkt läge på alla routes i `scripts/perf-inloggat.ts`, inte bara de fem vyerna.

Omfattning: avsnitt 2.1 och 4.1 till 4.5 (utom PassShell, Kurva, Nivaskala, Spar, Poangring, Plan, Marke, Ingang, Resultatvy, Kvitto som kommer i våg 2 och 3b). `DashboardShell` med `data-rum`, `Vagg`, `Golv`, `Topprad`, `Rubrik`, `Dorrnav`, `Sidomeny`, `knappar.ts`, `LyftKort`, `Kort`, `Rader`, `Chip`, `Dagsrad`, `Dagsring`, `Veckorad`, `StatusRow` restylad, `Sheet` restylad, `FlowShell` restylad, `GraValSheet`/`PaywallCard` restylade (samma text), `RumSymboler.tsx`, profilen får Utseende-väljaren (`localStorage.tema` + attributet, utan serverlagring). Varje befintlig dashboardsida får en minimal vägg: `Topprad` + `Rubrik` med sidans nuvarande h1 och beskrivning, resten av sidan på golvet som i dag. **Ingen funktionsändring**: samma routes, samma data, samma betalväggar, samma kvoter. "Logga sökt jobb" får en sekundär knapp på Jobbsökets hemvy så att CreateSheet kan sluta nås från navet.

Acceptans:
1. Dörrnavet på Pixel 7 i alla fyra rum och mörkt läge (N1), och på 360 px (N2): "Personliga brev" på en eller två rader, aldrig klippt, nav 72 px + safe area. Skärmdump i riktig Chrome på Pixel 7 och på en 360-emulering med adressfält.
2. Sidomenyn på 1280: fyra rumsrader, rätt grupp per rum, kopparlinjen på aktiv undersida, konto längst ner, lås öppnar `GraValSheet`.
3. Byte av rum: väggfärgen tonar 240 ms, inget sidledsglid, ingen flash av fel rum vid hård omladdning i något rum (servervärdet stämmer).
4. Exakt en `KNAPP_PRIMAR` per vy på alla dashboardsidor (grep + okulär kontroll i skärmdumparna). `INK_KNAPP` används inte längre i `src/app/dashboard`.
5. FlowShell: fot med kopparknapp inom viewport utan scroll på Pixel 7 med adressfält, i brevflödet och CV-flödet; utgång finns på varje steg.
6. Lucide: noll importer i `src/components/dashboard`, `src/components/shell`, `src/components/rum`.
7. Perf: alla routes inom budget. CLS 0 (väggens höjd är fast per tillstånd).
8. Klicktest tre konton (gratis, Hela paketet, mycket data), hård omladdning per vy, nätverksfel på POST i brevflödet.
9. Copywritern har svarat på ordet Testträning (avsnitt 9) innan PR:en öppnas; svaret ligger i `docs/qa/rummen/vag-1b/copy.md`.
10. Grep `text-gray-|bg-white|bg-gray-|border-gray-` i `src/app/dashboard` och i komponenter som renderas där (utom `src/components/ui` och mallförhandsvisningar): noll. Mörkt läge via systeminställningen klicktestat på alla routes i perf-listan, tre konton, utan vit yta eller osynlig text; statusfältet står i rummets väggfärg i alla fem rum; fokusringen fotograferad på golv, papper, ton och vägg i ljust och mörkt läge.

### Våg 2: Testträningens ingång, provdatum, hemvyn och resultatet på befintlig data (Opus, en agent, tre dagar)

Omfattning:
- Migrering `test_planer`: `user_id uuid pk references auth.users`, `testtyper text[] not null default '{}'` (värden `matris|numerisk|verbal|personlighet`), `leverantor text null` (`matrigma|alva|shl|aon|annat`), `variant text null` (`klassisk|adaptiv`), `provdatum date null`, `sikte numeric(3,1) null`, `utfall text null` (`vidare|vet_inte|inte_vidare`), `utfall_svarat_at timestamptz null`, `utfall_fraga_igen_at date null`, `skapad_at`, `uppdaterad_at`. RLS: ägaren läser och skriver sin rad. `profiles.traning_sedd_at timestamptz` (för `nyPunkt`). Körs på Supabase-branch, ägaren godkänner före prod.
- `src/lib/traning/getTraningSummary.ts`: en funktion, en rundtur (RPC `traning_summering(user_id)` som returnerar planen, slutförda sessioner per dag senaste 30 dagarna per testtyp, senaste resultat per testtyp, personlighetsprofilens datum). Returtyp `TraningSummary` (plan, tillstånd, dagarKvar, rubrik enligt rubriktabellen, passGjorda, serie, veckorad, flerTester[], jobbsokRad). Serverrenderad i `tester/page.tsx`; `DashboardDataContext` får `traning` som initial data.
- `src/lib/traning/rubrik.ts`: rubriktabellen (med leverantör / typ känd / utan både / utan datum / personlighet) ur konceptets notis "Rubrikerna när något saknas", plus provraden och tempobudgeten per format (68/120/90/15/83 s).
- `Ingang` (E1, E2, E3, E3-P) på `/dashboard/tester/installningar` och som första vy när `test_planer` saknas och användaren valde tester eller intervju vid registreringen (`profiles.onboarding_intent`), annars hemvyn i tillstånd Tomt (T1). "Hoppa över" på steg 2 och 3. Datumchips "Om en vecka / Om två veckor / Om en månad". Varumärkesraden. Matrigma-varianten.
- Hemvyn i tillstånden 1a (Ny med datum), T1 (Tomt), 1h (utan datum, med befintliga sessioner som "pass gjorda"), 1i (utan leverantör), 1p (bara personlighet), 1d (provdagen: uppvärmningen länkar till grundtestet med tre frågor via befintligt `anon`-urval, sparas inte), 1e (efter provet: frågan, svaret till `test_planer.utfall`), L1, X1. Tillstånden 1b/1c/1f/1g med nivå och kurva väntar på våg 3 och visas tills dess som 1h-varianten utan kurva: dagsraden med "pass gjorda", "dagar i rad" (räknat ur slutförda sessioner per dag, svensk tid, frizon söndag), tredje talet "dagar till provet"; i kurvans plats står planraden ensam (planen till datumet, som i 1a) med meningen "Din första punkt på kurvan kommer efter mätningen." (aldrig en text om bygget), och Dagens pass-kortet startar det befintliga grundtestet ("Dagens pass · grundnivå", 15 uppgifter, dagskvoten som i dag).
- Alla tester på `/dashboard/tester/alla` med `TestKategori`-innehållet som `Rader` på golvet, percentil kvar där.
- Resultatvyn (`Resultatvy`) för befintliga tester: vägg med ring (gjord), rubrik "12 av 15 rätt", tre tal (rätt, tid, över provets tid räknat mot formatets budget), golv med genomgången (`MatrixQuestionReview` restylad som Rader med regeln ur `rule`), StatusRow "I morgon: nästa grundpass" (eller veckodagen). `TestNextLevelRow` bort. `requestInstallPrompt` kvar.
- Kom igång-brickorna byter namn (`matning` i stället för `matris_grund` visas som "Mät din nivå" men pekar på grundtestet tills våg 3).

Acceptans:
1. Ingången: tre tryck från hemvyn för att sätta, ändra och ta bort datum och leverantör; Hoppa över synligt i steg 2 och 3; "Vet inte" på typ ger matris; bara Personlighet ger E3-P och 1p (ingen nedräkning, ingen ring).
2. Rubrikerna följer tabellen i alla kombinationer (åtta skärmdumpar: med/utan leverantör × med/utan datum × typ känd/okänd, plus personlighet).
3. Hemvyn renderas med riktiga tal i första HTML; LCP under 1,0 s; CLS 0; L1 har samma höjd som 1a.
4. Tre konton: nytt (T1 → ingång → 1a), konto med gamla sessioner (1h med pass gjorda och serie), Hela paketet. Hård omladdning. Nätverksfel på `PUT /api/traning/plan` visar fel, inte "sparat".
5. Inga streck, inga "0 %", ingen tom graf i något tillstånd.
6. `efter_provet`-frågan visas en gång dagen efter datumet, igen efter sju dagar vid "vet inte än", aldrig efter svar; raderbar från installningar.
7. Händelserna i avsnitt 7 för våg 2 syns i PostHog med `is_internal` uteslutet.

### Våg 3a: testmotorn, datamodellen (Opus + supabase-project-guardian, en agent, fyra till fem dagar)

Omfattning, enligt briefen avsnitt 8:
- **Blandning av alternativen** (avsnitt 10 punkt 1): `selectQuestions*.ts` returnerar frågor med alternativen blandade deterministiskt per `sessionId + q_id` (mulberry32 som redan används), och `answers[].selected` sparas som **originalindex**; `answer`-routen översätter. Gäller alla V7-banker, prov och det anonyma smakprovet. Egen PR, kan mergas före resten.
- Bankfält: `family: string` (taxonomi från testansvarig, samma i alla tre nivåer), `misstag: string[]` (ett per alternativ, tomt för det rätta, genereras av `gen-advanced-pool.mjs`/`gen-expert-pool.mjs` ur near-miss-dimensionen), `svarighet_prior: 1..4` (dagens `difficulty`). Validering i `validate-v7-questions.mjs`: `family` ur tillåten lista, `misstag.length === options.length`, ingen tom `misstag` för distraktorer.
- Tabell `fraga_statistik(fraga_id text pk, test_kind text, antal int, ratt int, tid_summa int, uppdaterad_at)`, uppdateras i `complete` via RPC `uppdatera_fraga_statistik(p_svar jsonb)`. `p = ratt/antal` när `antal >= 30`, annars prior ur `svarighet_prior` (1: 0,85, 2: 0,7, 3: 0,55, 4: 0,4). Ägarens och testkontona uteslutna via `admin_undantagna_konton()`.
- Tabell `test_nivapunkter(user_id, test_kind text, dag date, typ text check in ('matning','pass','ommatning','general'), niva numeric(3,1), session_id uuid, skapad_at, pk (user_id, test_kind, dag, typ))`. Tabell `test_milstolpar(user_id, nyckel text, nadd_at, visad_at null, pk(user_id,nyckel))`.
- `logic_test_v4_sessions.meta jsonb null` (tema, family, sammansättning, format, `niva_fore`, `niva_efter`, `budget_s`). Nya `test_type`-värden: `matrislogik-matning` (12 frågor, tre svårighetsband efter p, nästa band efter rätt svar, inga förklaringar under tiden), `matrislogik-pass` (9: 60 procent nära nivån, 20 under, 20 över; tema = familj), `matrislogik-riktat` (9 ur en familj, kräver `tests_above_base`), `matrislogik-general` (leverantörsformatet: antal och tid per format, adaptiv Matrigma simuleras som tre band, kräver `test_exam_mode`), `matrislogik-uppvarmning` (3, sparas inte). Numeriskt och verbalt får `-pass` (en passage, fyra frågor) när passformen finns (våg 3c).
- `src/lib/traning/niva.ts`: `beraknaNiva(svar: {p: number; correct: boolean}[]): number` ger en nivå 1 till 10 som svårighetsviktad andel rätt, monotont mappad (testansvarig äger formeln och levererar den som en ren funktion med tester; specen kräver: stabil, förklarbar, 12 frågor ger en punkt med vikt 1, ett pass uppdaterar som glidande medel med tak ±0,5, visad med en decimal, tak 7,5 tills flaggan `BANK_KALIBRERAD_OVER_7_5` är sann). `tempo.ts`: "antal över provets tid" på frågor nära nivån (|p − p_nivå| ≤ 0,15), snitt som undertext, "långsam" = över budget eller över 1,5 × medianen för frågans svårighet när budget saknas. `familjer.ts`: andel rätt per `family` ackumulerat, de två lägsta, plus "rätt men långsamma". `serie.ts`: dagar i följd med slutfört pass (svensk midnatt), en frizon per vecka (söndag), paus två dagar före prov och på provdagen, "Serien börjar om i dag" vid brott. `milstolpar.ts`: Första mätningen, Första veckan (sju dagar sedan mätningen, alla planerade pass gjorda), Nivån upp (första hela nivån över mätningens), Generalrepetitionen, Provdagen; en rad i `test_milstolpar` när den nås, `visad_at` när kvittot visats. `form.ts`: "stigande" (senaste 7 dagar +0,3 eller mer), "stabil", "vilar" (inget pass tre dagar), "sjunkande" visas aldrig som ord, det blir "stabil" med meningen om varför i resultatet. `plan.ts`: planen från mätningens dag till provet: pass varje dag, vila söndag, ommätning var sjunde dag från mätningen, generalrepetition två dagar och en dag före, vila på provdagen; utan datum rullande sju dagar.
- `gratisniva.ts` (beslut 6): `export const GRATISNIVA = { grundpassPerDag: 1, matningGratis: true, ommatningGratis: false, genomgangGratis: true, kurvaHistorikGratis: false, provlageGratis: false, riktadePassGratis: false } as const;` Läses av `sessionGate`, `quotaService`, `getTraningSummary` och `PaywallCard`. Ändra ett värde, inget annat.
- API: `GET/PUT/DELETE /api/traning/plan`, `POST /api/traning/pass/session {typ, family?}` (gate + kvot + sammansättning), `POST /api/traning/efter-provet {utfall}`, `POST /api/traning/sikte {niva}`. `complete` returnerar `{niva_fore, niva_efter, ratt, antal, over_tid, snitt_s, budget_s, familjer, imorgon: {typ, text}, milstolpe?: nyckel}`.
- Händelser serverside (`captureServer`): `nivamatning_klar`, `pass_klart`, `ommatning_klar`, `milstolpe_nadd` läggs till i `ServerEventName`.

Acceptans:
1. Vitest för `niva.ts` (monotoni, tak 0,5, 12 frågor ger vikt 1, inga värden över 7,5 under flaggan), `serie.ts` (frizon, paus runt prov, midnatt svensk tid, 2026-10-10-exemplet ger "3 pass gjorda, fyra dagar i rad"), `milstolpar.ts` (K1-exemplet: sju dagar, fem pass, en ommätning), `plan.ts` (14-dagarsplanen ger åtta pass, två vilodagar, en ommätning, två generalrepetitioner), `tempo.ts` (68/83/120/90/15), blandningen (samma session ger samma ordning, olika sessioner olika, originalindex sparas).
2. Migreringarna körda på Supabase-branch med advisors utan nya varningar; RLS-test att ett konto inte läser ett annat.
3. `complete` för en matning skriver nivåpunkt, frågestatistik och eventuell milstolpe atomärt (en RPC), och gamla sessioner (V5, 15-frågorsgrund) fortsätter fungera.
4. Mätningen tar under tio minuter för medianen i ett internt test med fem personer (testansvarig), passet under tolv.
5. Ingen prisändring, inga nya features i `features.ts` utöver de som gates behöver.

### Våg 3b: passet, mätningen, kurvan, kvittot i gränssnittet (Opus, två agenter: en för flödet P1 till P4/S1/M1/O1/K1, en för hemvyn 1b/1c/1f/1g och F1/W1/W3, fyra dagar)

Omfattning: `PassShell`, `PassFraga`, `Regelpanel`, `Resultatvy` (P4, S1, M1, O1), `Kvitto` (K1), `Kurva` och `Nivaskala` (avsnitt 4.4), `Plan`, `Staplar`, `Marke`, hemvyn i alla tillstånd (1a till 1p, W1 till W4), `/dashboard/tester/kurvan` (F1), ommätningen som veckans ritual (O1 med före och efter), "I morgon"-regeln, "Vet inte, visa regeln" (bara i pass), rörelsen (klassen `motion` när `nyPunkt`), `profiles.traning_sedd_at` uppdateras när hemvyn renderats med ny punkt.

Acceptans:
1. Alla 31 ramar i konceptet som rör Träningen (E1 till E3-P, 1a till 1p, T1, L1, X1, W1 till W4, P1 till P4, S1, M1, K1, O1, F1, A1, A2) byggda och skärmdumpade på Pixel 7 och 1280, ljust och mörkt, med riktiga data ur testkonton som satts upp så att talen i konceptet (5,0 → 5,4 → 5,6 → 5,8 → 6,3 → 6,4) återskapas.
2. Axeltexten renderar 11 till 12 px på 343 px och på datorns kurva (mätt i DOM, `getComputedStyle`), aldrig skalad.
3. Kopparfärgad text på väggen är koppar-ljus överallt (grep `text-koppar` innanför `.vagg` ska ge noll; bara `text-koppar-ljus`).
4. Passet: tidsraden räknar inte ner och byter aldrig färg; alla sex alternativ står kvar efter svaret med `dim` på fyra; aldrig en röd nyans på en missad fråga (`--fel` används inte i passet, grep).
5. Resultatet avslöjas i fyra steg om 300 ms; `prefers-reduced-motion` ger allt direkt. Kurvan på hemvyn ritar sig bara när `nyPunkt`, annars står den stilla (två inladdningar i rad ger en rörelse).
6. "I morgon" byts mot veckodag före vila och ommätning (lördagsexemplet i P4).
7. Nivån kan sjunka och visas utan rött (S1), med ordet om varför.
8. Primär handling inom viewport utan scroll på Pixel 7 med adressfält i P1 till P4, M1, K1, O1, hemvyn 1a till 1g.
9. Perf: hemvyn under 1,0 s, passet under 2,0 s, kurvan under 1,5 s. CLS 0 (skelettet L1 har hemvyns höjd).
10. Tre konton + hård omladdning + nätverksfel på `answer` (banner, aldrig "sparat").
11. Personlighetstestet: ingen nivå, ingen kurva, ingen serie, "Inga rätta svar" i varje rad som nämner det.

### Våg 3c: innehållet, testansvarig levererar (parallellt från dag ett, flaskhalsen)

Vad testansvarig själv levererar, och var det blir flaskhals:

| Leverans | Behövs till | Flaskhals |
|---|---|---|
| Familjetaxonomin (`family`-listan, svenska namn som "Rotation med fyllningsbyte", "Antal i rad och kolumn", "Speglingar") | 3a, dag 1 | Liten, en dag. |
| `misstag` per alternativ i alla tre V7-banker, ur generatorerna | 3a, före `complete`-arbetet | Måttlig: generatorerna vet dimensionen, men de 7 kurerade avancerad-frågorna och expertfrågorna skrivs för hand. Tills fältet finns renderar Regelpanel bara regeln, aldrig en påhittad mening. |
| Nivåformeln `beraknaNiva` som ren funktion med tester | 3a, dag 2 | Liten, men den avgör allt: utan den kan 3b inte visa en nivå. |
| Kalibrerade p-värden | 3a, löpande | **Stor.** `antal >= 30` per fråga kräver veckor med 3 till 4 nya konton per dag. Priorn ur `difficulty` gäller tills dess; nivån är då grov men ärlig. Ingen ska lova decimalprecision i copyn förrän banken är kalibrerad. |
| Minst 250 kalibrerade matrisfrågor (banken har 84) | 3b release | **Störst.** Nio dagars pass tömmer dagens bank. Beslut: våg 3b släpps med "ett pass om dagen" och ommätning var sjunde dag, och passets urval får återanvända frågor efter 14 dagar (aldrig samma fråga två dagar i rad, aldrig i samma pass som förra veckan). Flaggan `BANK_RACKER_30_DAGAR` sätts när banken passerar 250 validerade frågor. |
| Passform för numeriskt och verbalt (en passage, fyra frågor, tio minuter) | efter 3b | Numeriska testets fel (1 av 9 slutför) utreds på `fix/kontaktepost-numeriskt` först. |
| Leverantörsformat verifierade (Matrigma 35 på 40 min är tredjepartsuppgift; Alva 20 på 2 min/uppgift; SHL 24 på 36; Aon scales ix 20 på 5 min) | 3a `tempo.ts` | Liten; till dess står formaten med "cirka" och Matrigma-raden flaggad i koden. |
| Distraktorfält, frågekvalitet: V7-reglerna (kopplade mönster, ingen parallellitet, synlig referensram, inga glyfer, varierade alternativ) körs i `validate-v7-questions.mjs` på varje ny bank | 3c löpande | Liten. |

### Våg 4: CV, Personliga brev och Jobbsöket i rummen (Opus, tre agenter, en per rum, tre dagar)

Omfattning: avsnitt 2.3 (C1, B1, J1, J2), `Poangring`, `Spar`, korsreferensraderna (nivå och datum i Jobbsöket; "Har du ett rekryteringstest på gång? Mät din nivå, 8 minuter." för den som aldrig mätt; intervjun i Träningen; "Spara som sökt tjänst" i brevet), `profiles.senaste_rum` och landningen på `/dashboard` (första värde ur `onboarding_intent`: tester/intervju → tran, cv → cv, brev → brev, jobb → jobb; satt provdatum → tran; djuplänkar påverkas inte), CreateSheet bort, "Nytt CV"/"Nytt brev"/"Logga sökt tjänst" i respektive rum, aliasen i globals.css bort, `InkPanel`/`PageHeader`/`MarginPlate` ur inloggat, grep-listan noll.

Acceptans:
1. Växlingen mellan rum under 100 ms (båda hemvyerna hämtas i samma summering: `getDashboardSummary` och `getTraningSummary` i en rundtur via RPC).
2. CV-rummets "+9, +7, +5" är analysens faktiska utfall per fynd (ur `CvAnalysisResults`-datan), aldrig uppskattningar; Träningen har noll förekomster av ordet "poäng".
3. Sökta tjänster: öppningar mäts före (från våg 1b) och efter; inga uppgifter tappas (logga, följ upp, svar).
4. Tillstånd A/B (inget CV/inget brev) finns kvar som rader och LyftKort i respektive rum; `InlineCVUpload` fungerar i CV-rummet.
5. Perf och klicktest som i avsnitt 1, tre konton.

### Våg 5: betalväggarna, prissidan och paketbytet (Opus + saas-lead för text, en agent, tre dagar, SEO-diff på `/priser`)

Ägarens paketbeslut (2026-10-10): Träningspaketet och CV-paketet tas bort; kvar är Hela paketet, 149 kr i månaden (`all_month`) och Dagspasset, 49 kr (`all_day`). Veckovarianten och kvartalsvarianten av Hela paketet (`all_week` 99, `all_quarter` 299) säljs inte heller (avsnitt 10 punkt 3 ber ägaren bekräfta just den tolkningen innan vågen startar).

Omfattning:
- `plans.ts`: `Plan` får `saljs: boolean`; `cv_week`, `test_week`, `all_week`, `all_quarter` får `saljs: false` men står kvar i `PLAN_BY_KEY` (webhooken, `priceIdToPlanKey`, `harPaket`, admin och mejl måste fortsätta känna igen befintliga prenumerationer till deras slut). `SUBSCRIPTION_PLAN_KEYS` oförändrad. `paketNamn` oförändrad.
- `features.ts`: `suggestPlan` returnerar alltid `all_month`. Scopes `cv`/`tester` kvar för befintliga.
- `paket-copy.ts`: `PAKET_PLAN = {allt:'all_month'}`, `planForLangd` default `all_month`, `ALLT_LANGDER` = dag och månad, `mellanskillnad` bort, `PAKET_KORT` två kort.
- `/priser`: två paket, FAQ och jämförelse omskrivna (saas-lead + copywriter), schema `AggregateOffer` med två offers. SEO-diff före PR.
- `valj-spar`: inget spårval; köpsteget direkt med två paket. `registrering/intent.ts`: `plan: 'all_month'` för alla. `PrenumerationClient`: visar befintligt paket även om det inte säljs ("Träningspaketet, 79 kr i veckan, förnyas 17 okt") och byte till Hela paketet.
- Betalväggarna i Träningen på de fem platserna (M1, 1f, riktade pass/provläget, kurvan, A2) med texterna ur konceptet och datumet i texten när det finns; aldrig på resultat, genomgång, datum eller växling.
- `TesterHubClient`-copyn "Alla nivåer ingår i Träningsveckan" och andra förekomster av veckopaketen i inloggat (listan i avsnitt 2.3 ovan plus `prov/prov-copy.ts`, `intervju/infor-intervjun-copy.ts`, `cv-mallar`, `mina-brev`, `skapa-brev`, `skapa-cv`, `cv-analys`) byts. Publika sidor utanför `/priser` (`verktyg/*`, `LandingNavbar`, artikelreklam) och mejlmallarna (`lib/email/lifecycle`) listas i PR:en för saas-lead; de rörs inte här.
- Stripe: inga nya priser, inga ändrade belopp. `create-plan-session` avvisar `saljs: false`-planer med 400.

Acceptans:
1. Köptest i Stripe testläge (`reference_stripe_testlage`) för `all_month` och `all_day` från M1, 1f, A2 och `/priser`; webhooken ger rätt scope och `grantDays`.
2. Ett konto med aktiv `test_week` i testläge: inloggat visar paketet, inga gråa val försvinner, uppsägning och byte fungerar, inga 400 i loggen.
3. Grep `test_week|cv_week|all_week|all_quarter` i `src/app/dashboard` och `src/components` (utom plans, stripe, admin, email): noll.
4. SEO-diff på `/priser` godkänd av seo-agenten.
5. Priser i gränssnittet kommer bara ur `PLANS`; grep på `149|49 kr|79 kr|99 kr|299` i tsx ger noll utanför `plans.ts`.

---

## 7. Mätpunkter i PostHog per våg

Registreras i `src/lib/analytics/events.ts` (klient) och `server.ts` (`ServerEventName`), snake_case, `surface` där det finns, ägaren och testkontona uteslutna via `is_internal` och `hogqlUteslutning`. Avläsning fyra veckor efter respektive släpp, med antal och inte bara procent (volymerna är 3 till 4 nya konton per dag).

| Våg | Händelse | Egenskaper | Vad vi läser av |
|---|---|---|---|
| 1b | `rum_oppnat` | `rum`, `surface: 'dorr'|'sidomeny'|'djuplank'|'landning'` | Andel sessioner som besöker två eller fler rum; Sökta tjänster-öppningar före och efter (jämför `sokta_tjanster_oppnad` nedan med samma period före) |
| 1b | `sokta_tjanster_oppnad` | `surface` | Baslinje tas i våg 1b innan navbytet går live: mät två veckor med gamla navet först (händelsen läggs in i en egen liten PR mot `main` före våg 1b om ägaren godkänner) |
| 1b | `tema_bytt` | `tema: 'ljust'|'morkt'|'system'` | Andel som väljer mörkt |
| 2 | `ingang_steg` | `steg: 1|2|3`, `val` | Avhopp per steg |
| 2 | `provdatum_satt` | `dagar_kvar`, `leverantor`, `typer`, `surface` | Andel nya testregistrerade som sätter datum (mål 50 procent) |
| 2 | `provdatum_hoppat_over` | `steg` | |
| 2 | `traning_hem_visad` | `tillstand: 'ny'|'tomt'|'utan_datum'|'mitt_i'|'infor'|'provdag'|'efter'` | Fördelning av tillstånd |
| 2 | `efter_provet_svar` | `svar` | Mål 50 procent svarar |
| 3 | `nivamatning_startad`, `nivamatning_klar` (server) | `niva`, `over_tid`, `familjer`, `tid_s` | Slutförandegrad (mål 80 procent) |
| 3 | `pass_startat`, `pass_klart` (server) | `typ`, `niva_fore`, `niva_efter`, `ratt`, `antal`, `over_tid`, `tid_s` | Pass per vecka per betalande (mål minst 4); aktivitet dag 2 (mål 40 procent av dem med datum) |
| 3 | `vet_inte_tryckt` | `fraga_index` | Hur ofta regeln begärs |
| 3 | `ommatning_klar` (server) | `niva`, `delta` | |
| 3 | `milstolpe_nadd` (server), `milstolpe_kvitto_visat` | `nyckel` | Serie 7 dagar (mål 30 procent av betalande) |
| 3 | `generalrepetition_klar` | `format` | Mål 60 procent av dem med datum |
| 3 | `kurva_visad` | `surface: 'hem'|'full'` | |
| 3 | `serie_bruten` | `langd` | |
| 4 | `rum_bytt` | `fran`, `till`, `surface` | Växlingar per konto och vecka |
| 4 | `korsreferens_klick` | `fran`, `till`, `variant: 'niva'|'aldrig_matt'|'intervju'|'spara_sokt'` | Vägen in i testerna från CV-spåret |
| 5 | `betalvagg_visad` | `plats: 'matning'|'dag2'|'riktat'|'provlage'|'kurva'|'infor_prov'|'sidomeny'`, `dagar_kvar` | Andel som når väggen efter mätningen (mål 60 procent), andel som köper (mål 10 procent) |
| 5 | `paywall_cta_clicked` (befintlig) | + `plan`, `plats` | |
| 5 | `subscription_paid` (befintlig, server) | + `plats` via metadata | Uppsägning inom ett dygn (mål under 1 av 4) |

---

## 8. Hård regel om strängar

Alla användartexter i rummen bor i `src/lib/traning/copy.ts`, `src/lib/rum/copy.ts` och befintliga `*-copy.ts`, aldrig i JSX. Regeltexter i passet kommer ur banken. Paketnamn och priser ur `PLANS`. Datum formateras med `Intl.DateTimeFormat('sv-SE')` (veckodag gemen: "lördag 24 oktober", kort "24 okt").

---

## 9. Vad som kräver copywritern (svensk-ux-copywriter, Fable)

Konceptets texter är art-directors utkast och gäller tills copywritern ersatt dem. Samlat per våg, så copywritern kan leverera innan respektive bygge börjar. Regler: svenska facktermer, vi-form, aldrig em-dash, aldrig "guider", "samma format som", pris efter paketnamnet, verbet Köp, Personlighetstestet alltid med "Inga rätta svar".

**Våg 1b (prov med en som aldrig gjort ett test):** dörrarna "Testträning", "CV", "Personliga brev", "Jobbsöket"; grupprubrikerna "I Träningen" och så vidare; "Utseende: Följer systemet / Ljust / Mörkt"; toppradens brand "Träningen" / "Jobbsöket".

**Våg 2:** E1 ("Vad ska du testas på?", de fem valen med sina rader, "det som oftast ingår"), E2 (frågan, ledtråden, chips, Matrigma-varianten, "Det täcker båda formaten.", varumärkesraden), E3 ("När är provet?", ledtråden, "14 dagar. Mätning i dag, åtta pass, två vilodagar, en ommätning, generalrepetition två dagar före och vila på provdagen.", "Hoppa över, jag vet inte än", "Visa min plan"), E3-P, rubriktabellen (alla kombinationer), 1a ("Vi börjar med att mäta var du står…", "Mät din nivå. Cirka 8 minuter.", "Tolv figuruppgifter…", "Gratis. Smakprovets fem frågor räknas in.", "Din första punkt på kurvan kommer efter mätningen. Ihåliga märken är planerade dagar, luckorna är söndagar."), 1h ("Sätt ett datum så räknar vi bakåt: ommätningar, generalrepetition och vila."), 1i ("Vårt provläge: 18 uppgifter, 25 minuter. Vet du leverantören så byter vi format."), 1d (uppvärmningen, de tre råden, "Inga pass i dag. Serien pausar, inget bryts."), 1e ("Hur gick Matrigma?", de tre svaren, "Svaret är frivilligt och går att ta bort…", nästa steg-texterna), 1p, T1, X1 ("Passet gick inte att hämta.", "Försök igen. Din nivå och dina pass är sparade, ingenting försvann."), Fler tester-raderna, Jobbsök-raden ("3 sökta tjänster, 1 intervju, 2 personliga brev." och tomma varianten).

**Våg 3b:** 1b/1g (rubrikens rad "Nivå 5. Fyra dagar i rad. Dagens pass är kvar.", dagsradens etiketter, "form: stigande/stabil/vilar", Dagens pass-kortet, tempo-kortet och "Tempot mäts på frågor nära din nivå. De säkra räknas inte.", Var du tappar-raderna och "Riktat pass"/"Tempopass", Provdagen-raden, "Söndag är vilodag. Måndag: samma familj en nivå upp.", "Ett pass till, frivilligt"), 1c (generalrepetitionen, "Repetera svagheten", "Dagen före: generalrepetition. Provdagen: tre uppvärmningsfrågor, inget mer."), 1f ("Dagens pass · grundnivå", "Ett grundpass om dagen är gratis, varje dag.", "Passet på din nivå, 5, riktat mot…, ingår i Hela paketet, 149 kr i månaden. Grundpassen flyttar sällan nivån när du redan är över 4.", "Grå platser: ommätningarna och generalrepetitionen ingår i Hela paketet."), P1 till P3 ("Vilken figur passar i den tomma rutan?", "Vet inte, visa regeln", "Inte den här · 52 s", "Rätt · 29 s", "Nästa fråga", "Visa resultatet"), P4/S1 ("Passet klart", "7 av 9 rätt. Nivån steg till 5,6.", "5 av 9 rätt. Nivån 5,1, ner en tiondel.", tre talens etiketter, meningen om mätningen, tempo-kortet, genomgångsraderna, "Gå igenom de två missarna", "Visa kurvan", "Tre svåra i rad, det händer…"), M1 ("Din nivå", "av 10", nivåmeningen per band 1 till 10 i provets termer, "Siktet är vårt förslag… ditt mål, inte arbetsgivarens krav", planens rader, "18 dagar kvar. Månaden täcker hela vägen.", "Fortsätt med grundpassen gratis"), K1 (fem märkens namn och kvittomeningar), O1 ("Veckans ommätning", "5,8. Passen hade räknat dig till 5,7.", "Nästa ommätning tisdag 20 oktober."), F1 (legendens fyra rader, "Pass flyttar nivån lite i taget, ommätningar mer.", "Personlighetstestet har ingen kurva."), "Serien börjar om i dag", "I morgon: ommätning, 8 minuter."

**Våg 4:** J1/J2 (hälsningen, "Nästa handling", "Följ upp", korsreferenserna i båda riktningarna), C1 ("Tre saker drar ner. Alla går att åtgärda i kväll.", "Åtgärda först", "Vad som drar ner, i ordning", dokumentvägen), B1 ("Ditt brev till Klarna är klart", träffraden, "Lägg till betalflöden", "Spara som sökt tjänst", "Ett personligt brev om dagen ingår gratis. Nästa i morgon.").

**Våg 5 (med saas-lead):** A1 (eyebrow, rubrik med dagar kvar, ingår-raderna, "Rekommenderas med 14 dagar kvar", "Ett grundpass om dagen är gratis även utan paket."), A2 ("Provet är i morgon? Dagspasset räcker.", "Dagspasset ger allt i 24 timmar…", "Resultat och genomgång är alltid dina, med eller utan paket."), lås-chipen "Ingår i Hela paketet", `/priser` i sin helhet, prenumerationssidan, felet vid plan som inte säljs.

---

## 10. Öppna punkter och flaskhalsar

1. **Rätt svar är alternativ A i 82 av 84 V7-frågor och inget blandar alternativen** (kartläggningen 2026-10-10). "Alltid A" ger nära 100 procent, även i det anonyma smakprovet. Det är ett fel i den produkt som är live i dag och det gör dagens poäng och p-värden otillförlitliga. Rekommendation: blandningen i våg 3a bryts ut till en egen liten PR mot `main` så snart testansvarig bekräftat; ägaren beslutar om merge. Frågestatistik räknas bara på sessioner efter den fixen.
2. **Gratisnivån** (beslut 6): ägaren bekräftar före release av våg 3b. Konfigurationen gör att svaret kan komma sent.
3. **Paketbytet i våg 5:** ägaren bekräftar att även `all_week` (Hela paketet 99 kr i veckan) och `all_quarter` (299 kr i kvartalet) slutar säljas, så att bara `all_month` och `all_day` återstår. Befintliga prenumerationer löper ut som vanligt.
4. **Innehållsbudgeten** (våg 3c): 250 kalibrerade frågor är veckor av generatorarbete och validering; p-värden kräver 30 svar per fråga. Våg 3b släpps med återanvändning efter 14 dagar och prior ur `difficulty`. Testansvarig säger till när `BANK_RACKER_30_DAGAR` och `BANK_KALIBRERAD_OVER_7_5` kan sättas.
5. **Leverantörsformaten** står med "cirka" tills testansvarig verifierat dem mot leverantörernas sidor; Matrigma 35 på 40 min är tredjepartsuppgift.
6. **Admin** (`AdminChart`, tomma tillstånd, spårfärger i tratt och intäkter) är en egen Opus-omgång efter våg 1a; våg 1a byter bara tokenvärden och verifierar att inget går sönder.
7. **Publika sidor och mejl** (koppar, vägg, knapp, paketnamn i `verktyg/*`, `LandingNavbar`, artikelreklam, `lifecycle`-mallar) är saas-leads och ägarens omgång. Mejlmallar som nämner Träningspaketet eller CV-paketet får inte skickas efter våg 5: saas-lead får listan i våg 5:s PR.
8. **Baslinjen för Sökta tjänster** kräver att `sokta_tjanster_oppnad` mäts med gamla navet i två veckor före våg 1b; det kräver en liten PR mot `main` som ägaren godkänner. Annars jämförs mot PostHog-sidvisningar av `/dashboard/sokta-tjanster`, som är grövre.
9. **Notiser och meddelanden** i toppraden: beslutet ovan (visas bara när de har något) ska stämmas av med saas-lead eftersom meddelandena hör till Bli upptäckt.
10. **PWA-färgen** per rum: avgjort i avsnitt 13, beslut 6. `themeColor` följer rummets vägg via `generateViewport` i dashboard-layouten från våg 1b (samma `x-pathname` och `rumForPath` som `data-rum`), ett värde utan media-villkor eftersom väggen är densamma i båda lägena.
11. **Sessionsgränsen för Fable:** om art-director eller copywritern stoppas mitt i en granskning startas den om på Opus med skärmdumparna och den här specen; design- och copybeslut väntar dock på Fable.

---

## 11. Bilagor

**Exempeltalen (används i testkontona för skärmdumpar):** mätning tisdag 6 oktober 2026 5,0; pass 7, 8, 9 oktober 5,2, 5,1, 5,4; 10 oktober (lördag) före passet "3 pass gjorda, fyra dagar i rad", efter passet 5,6 och fem dagar i rad; 11 oktober vila; 12 oktober 5,7; ommätning tisdag 13 oktober 5,8 (Första veckan); 18 oktober vila; ommätning 20 oktober 6,3; 22 och 23 oktober generalrepetition; prov lördag 24 oktober, nivå 6,4. Sikte 6,5. Tempobudget 68 s (klassisk Matrigma). Passet 10 oktober: fråga 3 fel på 52 s (rotation med fyllningsbyte, valde den som bara roterar), fråga 8 fel på 58 s (antal i rad och kolumn), fråga 4 och 7 rätt men över tiden; 7 av 9 rätt, +0,2, 2 av 9 över provets tid, snitt 44 s. Gratisexemplet A2: 5,3 efter fjorton grundpass. Inga nivåer över 7,5.

**Rubriktabellen** (ur konceptet, byggs i `rubrik.ts`):

| Tillstånd | Med leverantör | Utan leverantör, typ känd | Utan både |
|---|---|---|---|
| Mitt i träningen | 14 dagar till Matrigma | 14 dagar till logiktestet | 14 dagar till provet |
| Inför provdagen | I övermorgon: Matrigma / I morgon: Matrigma | I övermorgon: logiktestet | I övermorgon: provet |
| Provdagen | I dag: Matrigma | I dag: logiktestet | I dag: provet |
| Efter provet | Hur gick Matrigma? | Hur gick logiktestet? | Hur gick provet? |
| Provdagen-raden | Samma format som Matrigma: 35 uppgifter, 40 minuter | Vårt provläge: 18 uppgifter, 25 minuter. Vet du leverantören så byter vi format. | samma |
| Utan datum | Träningen, raden "Sätt ett datum så räknar vi bakåt" | samma | samma |
| Bara personlighet | Personlighetstest den 24 oktober. Inga rätta svar, men det hjälper att veta hur det tolkas. | samma | samma |

Typerna i rubrik: logiktestet, siffertestet, texttestet.

**Milstolparna:** Första mätningen (mätningen sparad), Första veckan (sju dagar sedan mätningen med alla planerade pass gjorda, vilodagen ingår, mätning och ommätning räknas inte som pass), Nivån upp (första hela nivån över mätningens: 5,0 ger märket vid 6,0, 6,3 vid 7,0), Generalrepetitionen (första slutförd), Provdagen (passerad med satt datum). Ett kvitto per märke, visas en gång (`visad_at`), aldrig i Jobbsöket, Bli upptäckt eller mot rekryterare.

---

## 12. Testansvarigs godkännande

Datum 2026-10-10, sen kväll. Granskat: hela specen, konceptet runda 2 mot mina sju punkter i `granskning-rummen-2026-10-10.md` avsnitt 3.1 och punkterna i 3.2 till 3.7, och bankerna i `src/lib/logicTestV7/` på nytt.

### 12.1 Konceptet: mina punkter är rättade

Kontrollerat i `koncept-testvy-2026-10-10.html`: (1) P1 har sex olika alternativ, F är rotation 270 utan fyllning. (2) P2:s regel lyder "fyllningen slår om varje steg". (3) P3:s regel lyder "Varje rad och kolumn har ett, två och tre prickar en gång; triangeln vänder varannan rad". (4) P1 och P2 är fråga 3 av 9 och P4:s genomgång säger "Fråga 3, fel, 52 s", staplarna följer. (5) P4 säger "mot en av tre i mätningen". (6) P4 säger "Söndag är vilodag. Måndag: samma familj en nivå upp." (7) "Vet inte, visa regeln" är definierad som fel med sparad tid, bara i pass. Dessutom: P2 visar alla sex alternativ med fyra nedtonade, milstolpen heter Nivån upp, K1 säger "Sju dagar sedan mätningen, fem pass och en ommätning", E3 säger åtta pass och en ommätning, 1d säger två generalrepetitioner, 1f:s tredje tal är "17 dagar till provet", A2 säger 5,3, "från 5,4" står under ringen i P4, E2 säger "Det täcker båda formaten". Inget kvar från granskningen.

### 12.2 Utlåtande

**Specen är godkänd för våg 1a och 1b utan ändringar.** Besluten 1 till 6 i avsnitt 0 har mitt stöd med de villkor som står där. Avsnitt 6 (3a, 3c) och bilagorna stämmer med briefen och granskningen. Nedan står de krav som gäller före våg 2 och 3a; inget av dem hindrar 1a.

### 12.3 Blandningen av alternativen: jag stöder fixen, med dessa krav

Kontrollräknat 2026-10-10: `questionBankGrund.v7.json` 28 av 28 och `questionBankExpert.v7.json` 28 av 28 har `correctAnswer: 0`; `questionBank.v7.json` 25 av 28. Varken `selectQuestions.v7.ts`, `selectProv.v7.ts` eller `anon-session.ts` blandar alternativen. Det är ett fel i den produkt som är live, det förklarar troligen (gissning, inte mätt) varför en köpare fick 14 av 15 på expert på sju minuter, och det ska rättas i en egen PR mot `main` före allt annat i Träningen. Krav på fixen (branch `fix/matris-blanda-alternativ`):

1. **En permutation per session och fråga**, deterministisk ur `sessionId + q.id` (mulberry32 som urvalet), Fisher-Yates över alla alternativ. En enda funktion, till exempel `blandaAlternativ(seed, q)` i `src/lib/logicTestV7/`, som returnerar `{options, permutation}` där `permutation[visatIndex] = originalIndex`. Alla ställen anropar samma funktion: testvyn (`MatrixTestSession`/`TestRunner`), `answer`-rutterna i `logicTestV4`, `logicTestV6` och `logicTestProv`, resultatsidan (`MatrixQuestionReview`), det anonyma smakprovet (`anon-session.ts`, seedat på token) och provläget (`selectProv.v7.ts`). Samma ordning på test- och resultatsidan är ett absolut krav: bokstaven och rutan hon ser i genomgången ska vara dem hon såg i testet.
2. **Lagring.** `answers[].selected` sparas som originalindex (som specen säger) **och** `answers[].visat` som visat index, så genomgången kan ritas utan att räkna om permutationen. Sessionen får `meta.alternativ_blandade: true` (eller motsvarande kolumn) satt vid skapandet. Sessioner utan flaggan tolkas som identitetspermutation, så gamla resultatsidor fortsätter stämma.
3. **Domaren är servern.** `answer`-rutten översätter visat index till originalindex och jämför mot `correctAnswer`. Klienten får aldrig `correctAnswer` i svaret på frågan; om bankens `correctAnswer` i dag följer med i klientbundeln via importen i `MatrixTestSession` ska det lösas i samma PR eller skrivas som egen punkt i PR-texten, annars står mönstret kvar för den som öppnar källkoden.
4. **Distraktordoktrinen** (`reference_matrix_test_system.md`) påverkas inte av blandningen i sig: alternativen är oberoende celler, och V7-reglerna om varierade alternativ och near-miss gäller originalindex i banken. Kravet är att allt som indexerar alternativ per fråga följer originalindex, inte positionen: `misstag[]` (våg 3a), `fraga_statistik`, genomgångens text. `validate-v7-questions.mjs` får en kontroll att inget alternativ är identiskt med ett annat (fallet jag hittade i P1 får inte finnas i banken) och ett test att rätt svar över 1 000 slumpade sessioner hamnar på varje position i ungefär en sjättedel.
5. **Vitest:** samma session ger samma ordning vid två anrop, två sessioner ger olika, `selected` är originalindex, resultatsidan visar samma bokstav som testvyn, smakprovet och provläget går genom samma funktion.
6. **Våg 2 släpps inte före den här PR:en är mergad.** Den nya hemvyn skickar in folk i grundtestet, och det ska vara ett riktigt test den dagen.

### 12.4 Vad det gör med all historisk poängdata

All poäng ur V7-bankerna fram till fixen är ett **tak**, inte ett mått. Vi vet inte hur många som såg mönstret; medianen 13 av 15 på grund och 14 av 15 på avancerad och expert (briefen, tabellen i avsnitt 1) går ihop både med skickliga användare och med "alltid A", och med 125, 29 och 20 sessioner kan vi inte skilja dem åt. Konsekvenser:

- **Rapporterna.** `docs/rapporter/analys-utveckling-2026-10-10` och tidigare veckorapporter får en rad om att snitt, medianer och "svåraste frågan" (v7e-b3, 55 procent) är mätta utan blandning och inte ska jämföras med siffror efter fixen. Slutförandegrad, tider och tratt påverkas inte och står kvar.
- **Nivåmedianerna i briefen** används inte som kalibrering. Priorn ur `svarighet_prior` i våg 3a gäller tills `fraga_statistik` har 30 svar per fråga, räknat enbart på sessioner med `alternativ_blandade`. Det står redan i avsnitt 6 och punkt 10.1; jag bekräftar det.
- **Percentilerna** ska inte nollställas genom radering (`feedback_testdata_stadning`: inga svep i prod-databasen). De ska räknas bara på sessioner med flaggan: `percentile/route.ts` filtrerar på `meta.alternativ_blandade = true` i både täljare och nämnare, och regeln om minst 25 sessioner står kvar. Percentilen försvinner då i några veckor (3 till 4 nya konton per dag), vilket är rätt. Filtrera på flaggan, inte på tidsstämpel: en session som öppnades före och slutfördes efter deployen är fortfarande oblandad. Användarens egna gamla resultat visas fortfarande som resultat, aldrig som jämförelse.
- **Köparna.** Den som köpte och fick 14 av 15 på expert har inte fått ett mått på sin nivå. Om saas-lead och ägaren vill nå dem igen är mätningen i våg 3 det ärliga erbjudandet; det är inte min fråga att besluta.

### 12.5 Krav som läggs på våg 2 och 3a utöver avsnitt 6

- Våg 2: percentilfiltret enligt 12.4 följer med när percentilen flyttar till Alla tester.
- Våg 3a: `complete` skriver `fraga_statistik` bara när `meta.alternativ_blandade` är sant; nivåpunkter räknas aldrig på oblandade sessioner; `misstag[]` indexeras på originalindex.
- Våg 3c (mitt): familjetaxonomin levereras dag 1, `beraknaNiva` dag 2, och jag säger till när `BANK_RACKER_30_DAGAR` och `BANK_KALIBRERAD_OVER_7_5` kan sättas. Inget i copyn lovar decimalprecision före det.

---

## 13. Beslut efter våg 1a

Datum 2026-10-10, sent. Art-director efter granskning av `docs/qa/rummen/vag-1a/README.md` och skärmdumparna i `fore/`, `efter/` och `admin/` (bland annat `efter/mycket-pixel7-morkt-tester.png`, `efter/mycket-desktop-morkt-cv.png`, `efter/hela-desktop-morkt-dashboard.png`, `efter/gratis-pixel7-ljust-dashboard.png`, `admin/efter-admin-ljust-oversikt.png`). Ingen av punkterna rör testupplevelsen, så testansvarig har inte tillfrågats. Besluten är inarbetade i avsnitt 1.1, 1.8, 2.1, 3.2, 3.3, 3.5, 6 och 10.10. Ingen kod är ändrad av mig; allt nedan är bygguppdrag för våg 1b.

Helhetsomdömet: våg 1a är rätt byggd. Det jag ser i skärmdumparna är precis det specen bad om, inte mer: beige blev skoggolv, orange blev koppar, rubriken 34 px, mörkt läge som byter golv och papper. Adminen står orörd i Tråden med petrol och indigo som spårfärger. De åtta tolkningarna där specen hade luckor är alla riktiga och fastslås här.

### 13.1 Beslut 1: 1a går inte till `main` ensam

Våg 1a mergas bara in i `design/rummen`. Till `main` går 1a och 1b i en gemensam PR. Skälet är inte bara de 561 `text-gray-*` och 280 `bg-white`: med 1a ensam får den som har mörkt system en vit header och ett grått nav ovanpå mörkt golv, ett indigo statusfält över en vit header och bläckknappar i väggens grön. Det är en halv produkt, och halva produkter är det första en ny användare ser.

Media-formen stängs **inte** av. Ett "Följer systemet" som inte följer systemet är en lögn i gränssnittet, och ett mörkt läge som bara går att nå via en inställning hittar ingen. I stället tar våg 1b de hårdkodade färgerna till noll i inloggat, mekaniskt, med den här mappningen (en sed-nivå ändring, inte ett omtag per sida):

| I dag | Blir | Kommentar |
|---|---|---|
| `text-gray-900`, `text-gray-800`, `text-black` | `text-ink-1` | |
| `text-gray-700`, `text-gray-600` | `text-ink-2` | |
| `text-gray-500`, `text-gray-400` | `text-ink-3` | 12 px-text i `text-gray-400` blir `text-ink-3`, aldrig ljusare |
| `text-gray-300`, `text-gray-200` (dekorativ) | `text-kant-stark` | bara ikoner och streck; text får aldrig stå i kantfärg |
| `bg-white` | `bg-papper` | utom mallförhandsvisningar (`cv-mallar`, brevmallar), som är dokument och ska vara vita |
| `bg-gray-50`, `bg-gray-100` | `bg-papper-2` | |
| `bg-gray-200` | `bg-kant` | |
| `border-gray-100`, `border-gray-200` | `border-kant` | |
| `border-gray-300` | `border-kant-stark` | |
| `hover:bg-gray-50`, `hover:bg-gray-100` | `hover:bg-papper-2` | |
| `placeholder-gray-*`, `placeholder:text-gray-*` | `placeholder:text-ink-3` | |
| `divide-gray-*` | `divide-kant` | |
| `ring-gray-*` | tas bort; fokus sköts av `:focus-visible`-regeln | |

Omfattning: `src/app/dashboard` och varje komponent som renderas där (`src/components/dashboard`, `shell`, `cv`, `letters`, `tests`, `paywall`, `onboarding`, `profil` med flera), utom `src/components/ui` och mallförhandsvisningarna. Publika sidor rörs inte. Där en yta efter mappningen ser fel ut i mörkt läge (en vit illustration, en inline-färg, en bild) rättas den för hand och listas i 1b-rapporten. Grepen i acceptans 1b.10 ska ge noll. Mörkt läge klicktestas på alla routes i `scripts/perf-inloggat.ts`, tre konton, i båda formerna.

Om ägaren vill ha något till `main` före 1b är det inte 1a utan den lilla mätpunkts-PR:en för `sokta_tjanster_oppnad` (avsnitt 10.8).

### 13.2 Beslut 2: fokusringen byter färg efter underlag

Ren koppar mot golvet är 2,5 till 2,6:1 i alla fem rum, under 3:1 för fokusindikatorer. Ringen får en egen token, `--fokus`:

- På golv, papper och ton: `--fokus: var(--koppar-ink)`. Ljust läge `#A8491A`: 4,9:1 mot golv i alla rum, 4,4 till 4,7:1 mot ton, 5,8:1 mot papper. Mörkt läge löser samma variabel till `#F2A368`: 9:1 mot golv, 8,2:1 mot papper.
- På väggen: `.vagg{--fokus:var(--koppar-ljus)}`. 7,6 till 8,9:1 mot vagg, 5,4 till 6,9:1 mot vagg-2. Koppar-ink hade gett 2,3 till 2,7:1 där och går inte.
- Regeln: `:root:has([data-rum]) :focus-visible{outline:2px solid var(--fokus);outline-offset:2px}`. Offseten 2 px gör att ringen alltid mäts mot underlaget, inte mot knappen den omger (koppar-ink mot kopparknappen är 1,9:1, men det är gapet som skiljer dem).

Ingen dubbel ring, ingen vit kant. En ring, två färger, styrd av var den står. Våg 1b bygger den och fotograferar ringen på golv, papper, ton och vägg i båda lägena (acceptans 1b.10).

### 13.3 Beslut 3: `--varning #985A08` godkänd

Samma kulör, 4,6:1 mot varning-mjuk i stället för 4,49. Ingen ser skillnaden, och regeln "inget textpar under 4,5" står kvar utan undantag. Specen i 3.2 och 3.5 är rättad. Varning-mjuk ändras inte.

### 13.4 Beslut 4: specens kontrasttal rättade

Tabellen i 3.5 har nu skriptets tal (14,3 i stället för 15,1 och så vidare), med petrol- och skogvärdena där de är lägst, och tre nya rader: koppar-text på koppar-djup 4,5:1 (knappens mörka ände; toningen i `.knapp-primar` får inte gå mörkare än `--koppar-djup`), koppar-ink på golv och på ton (fokusringen), varning på varning-mjuk. Beslut 1 i avsnitt 0 har också fått de rättade talen. `scripts/kontrast-rummen.mjs` är källan från och med nu; konceptfilens handräkning gäller inte.

### 13.5 Beslut 5: övergångsregeln för bläckytor godkänd som tillfällig

Att ge `bg-ink-1 text-white`-ytorna väggens färg i mörkt läge är rätt val: det är den yta som redan finns i rummet, och aliasen `ink-1-mjuk/-kant/-accent` pekar dit. I `efter/mycket-pixel7-morkt-tester.png` syns "Starta testet" sämre än i ljust läge, och det får den göra i en våg som inte går till `main` ensam. Villkor: våg 1b tar bort regeln för allt 1b restylar (`INK_KNAPP` ersätts av `KNAPP_PRIMAR`, pakethuvudet försvinner med `Sidomeny`), våg 4 tar bort resten (InkPanel ur inloggat) och regeln själv. Regeln är inskriven i 3.2.

### 13.6 Beslut 6: statusfältet följer rummets vägg från våg 1b

Indigo i hela inloggat är okej i 1a eftersom 1a inte går till `main` ensam. I 1b byts den statiska `viewport` i dashboard-layouten mot `generateViewport`, som läser `x-pathname`, räknar `rumForPath` och returnerar rummets `--vagg` som ett enda värde, utan media-villkor: väggen är densamma i ljust och mörkt läge, så statusfältet ska vara det också. Specens tidigare `#0E1120` för mörkt läge var golvets färg och var fel tanke; statusfältet står över väggen, inte över golvet. Avsnitt 2.1 och 10.10 är rättade.

### 13.7 Beslut 7: branchnamn

`design/rummen-1a` står. Mönstret är `design/rummen-<våg>`: `design/rummen-1b`, `design/rummen-2`, `design/rummen-3a` och så vidare. Avsnitt 1.1 och 6 är rättade; ingen branch döps om.

### 13.8 Byggagentens tolkningar: alla fastslagna

| Tolkning i 1a | Beslut |
|---|---|
| Tokens under `:root:has([data-rum])`, inte `:root` | Godkänd och inskriven i 3.2. Det är bättre än specen: publika sidor, kassan och adminen rör sig inte förrän deras omgång, och portalerade ark står i rummet. Mörkt-blocken skrivs med samma prefix. |
| `data-rum="jobb"` konstant i 1a | Godkänd. 1b ersätter med `rumForPath` på servern och `usePathname` på klienten; inget annat värde än ur `rumForPath` får förekomma efter 1b. |
| `:root:has([data-rum]) body` i stället för klasser på body | Godkänd och inskriven i 2.1. |
| `.text-h1` 34/36 bara inne i `[data-rum]` | Godkänd och inskriven i 3.3. Artikelramen och adminen har kvar 32/35. |
| `--bottom-nav-h` 56 tills dörrnavet | Godkänd. 1b sätter 72 + safe area i samma commit som `Dorrnav`, aldrig före. |
| Alias på både roten och varje rum | Godkänd. Tas bort i våg 4 med resten av aliasen. |
| `@keyframes pulse` kvar | Godkänd och inskriven i 3.2. |
| Övergångsregeln för bläckytor | Beslut 5 ovan. |

### 13.9 Det 1b-agenten måste veta utöver avsnitt 6

1. 1b:s PR öppnas mot `main` med 1a:s commits i sig (1a mergas först in i `design/rummen`, 1b:s branch utgår därifrån); PR-texten redovisar båda vågornas acceptans.
2. `linkedin-optimizer` steg 1 (`CvSelectorList`) har CLS 0,292 redan på `main`. Eftersom varje sida får en vägg i 1b rättas det där: reservera listans höjd eller skicka CV-listan från servern. Acceptans 1b.7 kräver CLS 0 och får inget undantag.
3. `prov-rad.test.ts` faller på `main` oberoende av Rummen. Det är ägarens och testansvarigs sak, inte 1b:s; nämn det i PR-texten, rätta det inte i designbranchen.
4. Kontrastskriptet körs igen efter 1b och tabellen i `docs/designsystem.md` avsnitt 2 får raderna för `--fokus`.

---

## 14. Testansvarigs beslut om testmotorn (våg 3a)

Datum 2026-10-10, natt. Granskat: `src/lib/traning/` på `design/rummen-3a` (niva, svarighet, tempo, serie, plan, milstolpar, form, imorgon, passgenerator, gratisniva, tillgang, testplan, historik, motor.server) och rutterna under `src/app/api/traning/`, mot briefen (avsnitt 3, 5, 7, 8), granskningarna och avsnitt 6 här. Jag har inte ändrat någon kod. Varje beslut nedan säger exakt vad som ska ändras; det som inte nämns står kvar som byggt.

**Underlag, simulering.** Jag körde modellen mot sig själv (sanningen är modellen, 2 000 mätningar per nivå, seedad slump): tolv adaptiva frågor i tre band ger standardfel cirka 0,6 nivåer för sann nivå 3 till 7 (3,0 ± 0,69; 5,0 ± 0,57; 7,0 ± 0,55), och det blir **inte** bättre med en spridd bank (p 0,2 till 0,9, 250 frågor: 5,0 ± 0,61). Det är antalet frågor som begränsar, inte priorerna; tolv frågor kan inte ge mer. En brantare lutning (2 i stället för 1) halverar standardfelet i visade enheter men är bara en omskalning och stämmer sämre med avbildningen p till nivå. Passen: en ärlig användare med nivå 5,5 som gör fjorton grundpass stannar på 5,5 ± 0,23; en som memorerar grundbankens 28 frågor från dag 4 (banken cyklar på tre dagar) driver från 5,0 till 6,9 på fjorton dagar. Brus per pass på egen nivå: ± 0,13. Exemplet 7 av 9 kring 5,4 ger +0,25. Slutsatserna styr 14.1.

### 14.1 Nivåformeln (fråga 1): godkänd i struktur, med sex ändringar

Formeln står: frågans nivå `b = 1 + 9 × (1 − p)`, chansen `1 / (1 + e^−(θ − b))`, mätningen som nivån där väntat antal rätt är lika med faktiskt, stödet ett halvt rätt svar vid 5,5 med vikt 1, passet `0,1 × (utfall − väntat)` per fråga med tak ± 0,5, tak 7,5 under flaggan. Lutningen 1 står (se underlaget). Grovheten är sann och accepteras; copyn får aldrig lova decimalprecision (12.5 står), och M1 visar heltalet stort med decimalen bara på kurvan (3b).

Ändringar:

1. **Ommätningen och generalrepetitionen väger hälften, inte 1.** Med standardfel 0,6 på tolv frågor och ± 0,2 i passens vandring blir en ommätning med vikt 1 den brusigaste punkten på kurvan, inte ankaret. `niva.ts`: ny konstant `export const OMMATNING_VIKT = 0.5;`. `matningsNiva(svar, fore)`: `const vikt = fore == null ? 1 : OMMATNING_VIKT * Math.min(1, svar.length / MATNING_ANTAL);`. Första mätningen (fore null) tar fortfarande hela värdet. `motor.server.ts` `slutforTraning`: `general` räknas med `matningsNiva(nivaSvar, fore)` (inte `passUppdatering`), punkttyp `general` som nu. Kommentaren i niva.ts rad 24 till 25 skrivs om. Tester: `niva.test.ts` "tolv frågor ger en punkt med vikt 1" byts till "ommätningen väger hälften: `matningsNiva(s, 3).niva === avrunda(3 + 0.5 × (beraknaNiva(s) − 3))`", "sex frågor väger hälften" blir en fjärdedel. F1-legenden "Pass flyttar nivån lite i taget, ommätningar mer" är fortfarande sann.
2. **Riktade pass flyttar inte nivån.** Frågorna är valda ur en familj hon är svag i, så utfallet är systematiskt sämre än p säger. `slutforTraning`: `niva_efter = null` när `meta.typ === 'riktat'`, ingen nivåpunkt. Riktade pass räknas som förut i familjestatistiken, serien, planen (`gjord`) och `dagensPassGjort`. Resultatvyn (3b) säger "Riktade pass räknas i familjen, inte i nivån" i stället för nivåraden.
3. **Upprepade frågor räknas inte.** En fråga som kontot sett inom `ATERANVAND_EFTER_DAGAR` (14) dagar före sessionens dag räknas inte mot nivån, tempot, familjerna eller `fraga_statistik`; den räknas i "rätt av antal" och visas i genomgången. Det gör raden "Grundpassen flyttar sällan nivån när du redan är över 4" sann även när banken cyklar, och det håller p-värdena rena. `passgenerator.ts`: `Urval` får `upprepade: string[]` (frågorna med friskhet 2 eller 3, alltså sedda för 2 till 13 dagar sedan); `valjPass`, `valjRiktat` fyller det; `valjGeneral` returnerar `{ fragor: string[]; upprepade: string[] }` i stället för `string[]`; `valjPooler` returnerar `{ pooler: Pooler; upprepade: string[] }`. `historik.ts` `TraningsMeta` får `upprepade: string[]`, satt i `skapaTraningssession` i alla fyra grenar. `slutforTraning`: `const raknas = new Set(svar.map(s => s.q_id).filter(id => !(meta.upprepade ?? []).includes(id)))`; `nivaSvar` byggs bara av `raknas`; `statistik` filtreras på `raknas`; `dennaFamiljer` likaså; `ratt`, `antal`, `tid_s` och `imorgon` oförändrade. Om inga svar räknas: mätning ger ingen punkt (kan bara ske om banken är slut), pass ger `niva_efter = fore` och punkten skrivs (kurvan ska visa dagen). Vitest: ett pass där alla nio frågor står i `upprepade` ger `delta 0`; en seedad simulering av fjorton grundpass med upprepningar från dag 4 ger slutnivå inom 0,3 från start.
4. **`p_prior` som frivilligt bankfält.** Priorklasserna 1 till 4 ger bara fyra nivåer (2,35, 3,7, 5,05, 6,4). `svarighet.ts` `pForFraga(prior, stat, pPrior?: number | null)`: när `pPrior` är ett tal i [0,05, 0,95] och statistiken inte räcker returneras `pPrior`. `bank.server.ts` `bankInfo` läser `q.p_prior`. `validate-v7-questions.mjs` godkänner fältet i intervallet. Banden (`bandForP`) räknas på samma p. Våg 3c får sätta fältet när generatorerna kan gradera; tills dess gäller klasserna.
5. **Startnivån utan mätning som konstant.** `niva.ts`: `export const STARTNIVA_UTAN_MATNING = 4;` ersätter `?? 4` på två ställen i `motor.server.ts` (pass och riktat). Motorn får fortsätta tillåta pass före mätning (1h-kompatibilitet), men 3b:s hemvy erbjuder aldrig Dagens pass före mätningen: primär handling är "Mät din nivå" tills den är gjord.
6. **Mätpunkter.** `pass_klart` får `ateranvanda` (ur meta) och `raknade` (antal svar som räknades mot nivån). `nivamatning_klar` får `smakprov` (antal frågor ur smakprovet, 14.5). Det är så vi ser när banken är för liten.

### 14.2 Frizon (fråga 2): söndag

Söndag, som byggt och som specen säger. Jag skrev "en vilodag i veckan" i briefen, men planen, kurvans luckor, E3 och P4-raden ("Söndag är vilodag") är alla ritade och godkända med söndag, och en valbar vilodag kräver en kolumn, en inställning och en omritning utan att vi vet att någon behöver den. Söndag med pass räknas (serie.ts gör redan det). Ingen kodändring. Uppföljning: händelsen `serie_bruten` (3b) får egenskapen `veckodag`; visar avläsningen att brotten klumpar sig på en vardag tar vi `test_planer.vilodag` då. Briefens avsnitt 5 är överspelat på den punkten.

### 14.3 Första veckan (fråga 3): inte avsett, ändra

Märket får inte sitta bakom betalväggen; det är dag 2 till 7 vi vill flytta. `milstolpar.ts` `forstaVeckanNadd`: på en dag av typ `ommatning` eller `general` räcker **vilken slutförd session som helst** den dagen (`ommatning`, `general`, `pass` eller `riktat`); bara `vila` och `prov` kräver inget. Exakt: `case 'ommatning': case 'general': if (!gjort || gjort.size === 0) return false; break;` (där `gjort` bara innehåller träningstyper; `matning` kan inte ligga där eftersom dag 0 är utanför fönstret). Ny ren funktion i samma fil: `forstaVeckanSammanfattning(matningsdag: Dag, sessioner: readonly SlutfordSession[]): { pass: number; ommatningar: number; generalrepetitioner: number }` över dagarna 1 till 7 (`pass` + `riktat` som pass). `Traningsstatus` får `forstaVeckan: ReturnType<typeof forstaVeckanSammanfattning> | null` (satt när märket finns), så kvittot kan säga "Sju dagar sedan mätningen, fem pass och en ommätning, ingen missad dag" för betalande och "Sju dagar sedan mätningen, sex pass, ingen missad dag" för gratis. Texterna i `copy.ts` som två varianter; copywritern har sista ordet. Vitest: K1-exemplet står; nytt fall: gratis, mätning dag 0, grundpass dag 1 till 7 utom söndag, ommätningen låst, märket nås dag 7.

### 14.4 Formaten (fråga 4): "cirka" godtas, med tre rättelser

1. **Adaptiv Matrigma:** `budget_s: 60` (12 minuter på 12 uppgifter), inte 68. Vi visar "cirka 12 uppgifter, 12 minuter"; då ska tidsraden säga 1:00, annars motsäger vi oss själva. Antalet är fortfarande en simulering och står med "cirka" tills jag verifierat (3c).
2. **SHL Verify G+ är inte bara matriser** (siffror, slutledning, figurer). Vi får inte säga "samma format som SHL Verify: 24 uppgifter, 36 minuter" om ett matrisprov. `PROVFORMAT.shl`: `antal: 18, minuter: 25, budget_s: 90, adaptiv: false, cirka: true`, plus nytt fält `anmarkning: string | null` på `Provformat` (null för övriga). Texterna bor i `copy.ts` under `TRANING_COPY.format.anmarkning` (nyckel per format), inte i tempo.ts: shl: "SHL Verify G+ blandar siffror, slutledning och figurer. Provläget övar figurdelen." aon: "scales ix har en annan uppgiftstyp, att hitta regeln bland rutnät. Provläget övar tempot med matriser." Provdagen-raden (1b/1c) visar anmärkningen under formatet när den finns. Rubriken säger fortfarande "14 dagar till SHL Verify".
3. **Tid per uppgift eller total.** `Provformat` får `tidsform: 'total' | 'per_uppgift'`; alva får `'per_uppgift'` (120 s per uppgift, `minuter: 40` står kvar som övre gräns för `tidsgrans_s`), alla andra `'total'`. `formatText` ger "cirka 20 uppgifter, 2 minuter per uppgift" för per_uppgift. `svaraTraning` tar `tidenUte?: boolean`, tillåtet bara i `general`-sessioner vars format är per_uppgift: sparas som `{ selected: -1, visat: null, correct: false, tiden_ute: true, time_spent }` och räknas som fel; `pass/svar` skickar fältet vidare. 3b:s PassShell går vidare automatiskt vid 2:00 i det formatet (tidsraden räknar fortfarande inte ner).

Verifieringen av siffrorna mot leverantörernas sidor är min (3c); "cirka" står tills dess och Matrigma-raden förblir flaggad i koden.

### 14.5 Smakprovet och pass utan mätning (fråga 5): byggs

"Smakprovets fem frågor räknas in" står i det godkända konceptet (1a) och kortar den första mätningen för de flesta nya testkonton. Bygg det så här, bara för den första mätningen (`beslut.typ === 'matning'`):

- `skapaTraningssession` läser `anon_test_sessions` där `claimed_by = userId`, `answers` inte null, `meta.alternativ_blandade` sant och `created_at` inom 30 dagar, senaste raden. Frågorna ur `questionsForToken(token)`; svar med originalindex −1 hoppas över; frågor som saknas i `TRANINGSBANK` hoppas över. Färre än tre giltiga svar: ignorera smakprovet.
- `TraningsMeta` får `smakprov?: { token: string; dag: Dag; svar: { q_id: string; correct: boolean }[] }`. Smakprovets frågor läggs till `sedda` (dag = smakprovets dag) innan `valjPooler`, och i `historik.ts` `seddaFragor` räknas `meta.smakprov.svar` som sedda med sessionens dag.
- `sessionensFragor` spelar upp `[...smakprov.svar, ...svar]` i `nastaAdaptivaFraga` med `antal = MATNING_FRAGOR` (12). Hon svarar alltså på `12 − n` nya frågor. `Sessionsvy` får `smakprov: number` (antal inräknade) så PassShell kan säga "fråga 1 av 7, fem räknas från smakprovet".
- `slutforTraning`: smakprovets svar ingår i `nivaSvar` med bankens p, `tid_s: 0`, och räknas i `ratt` och `antal` ("9 av 12 rätt"). De räknas **inte** i tempot (filtrera `tid_s > 0` i `raknaTempo`-anropet) och inte i `fraga_statistik` (de kommer från en anonym session). `nivamatning_klar` får `smakprov: n`.
- Kurvan får ingen egen punkt för smakprovet; första punkten är mätningen (det är så "räknas in" ska läsas). 1a:s mening visas bara när ett smakprov finns att räkna in (3b).

Vitest: fem giltiga smakprovssvar ger sju nya frågor och `antal 12`; ett smakprov utan `alternativ_blandade` ignoreras; smakprovets frågor dyker inte upp i poolerna.

### 14.6 Återanvändning (fråga 6): okej som preferens

Trappan (aldrig sedd, sedan efter 14 dagar, sedan inte förra veckan, sist minst två dagar sedan) är rätt, och aldrig samma pass eller två dagar i rad är hårt. Med 14.1 punkt 3 blir återanvändning dessutom ofarlig för nivån. Mätpunkten i 14.1 punkt 6 visar hur ofta trappan går ner. Bankens storlek är min sak (avsnitt 15); `BANK_RACKER_30_DAGAR` sätts när varje nivå har minst 80 frågor som inte är pensionerade.

### 14.7 Samma familj en nivå upp och siktet (fråga 7)

- Tröskeln två tredjedelar står (6 av 9). På egen nivå är väntat utfall cirka 4,5 av 9, så det är en sträckbelöning, inte en vana.
- **Steget är en halv nivå, inte en hel.** En hel nivå upp ger väntat 3 av 9 dagen efter en bra dag; en halv ger cirka 4 av 9. `niva.ts`: `export const STEG_UPP = 0.5;`, `motor.server.ts`: `niva: upp ? bas_niva + STEG_UPP : bas_niva`. Copyn byter betydelse: `TRANING_COPY.imorgon.familjUpp = 'samma familj, ett steg svårare'` (copywritern har sista ordet, men "en nivå" får inte stå när steget är 0,5). Konceptets P4-rad uppdateras i 3b.
- Siktet godkänns (0,1 per dag kvar, 0,5 till 1,5, 1,0 utan datum) med en rättelse: avrunda till närmaste halva nivå, aldrig under nivå + 0,5, aldrig över taket. `foreslaSikte`: `const rå = niva + tillagg; const halv = Math.round(rå * 2) / 2; return avrunda(begransa(Math.max(niva + 0.5, halv)));`. Exemplen står: 5,0 och 18 dagar ger 6,5; 5,0 utan datum 6,0; 5,0 och 2 dagar 5,5; 7,2 och 30 dagar 7,5; nytt: 5,4 och 12 dagar ger 6,5. Siktet är hennes mål, inte ett löfte; meningen i M1 står.

### 14.8 "Hur gick det?" (fråga 8): servern avgör, UI:t håller inte reda på något

Regeln i `testplan.ts` `fragaEfterProvet` står: från dagen efter provet tills svar, igen sju dagar efter "vet inte än", aldrig efter de andra två svaren. **Ingen "visas en gång"-logik i UI:t**, ingen lagring i webbläsaren: frågan är en rad på väggen i tillståndet Efter provet (1e), aldrig ett ark eller en ruta som kan stängas, och de tre svaren är enda sättet att få bort den ("vet inte än" skjuter upp sju dagar). Det är vad briefens "en gång" betyder: en lugn fråga, inte en som tjatar i varje vy. Ändring: `Traningsstatus` får `fragaEfterProvet: boolean` (samma funktion som `plan GET` redan använder) så hemvyn inte behöver två anrop. PUT plan som nollställer utfallet vid nytt datum är rätt byggt. Svaret används bara för nästa rad och för `efter_provet_svar`, aldrig i Bli upptäckt (10.4 i briefen).

### 14.9 Flaggorna i gratisniva.ts (fråga 9): behåll en, ta bort en

`grundpassVarjeDag` behålls: det är exakt det alternativ ägaren kan välja (beslut 6, "dag 2 kan låsas utan omritning"). `passPaNivanGratis` tas bort: ingen har bett om det, och varje flagga är en kombination som måste ritas och testas. `gratisniva.ts`: nyckeln och kommentaren bort; `tillgang.ts` rad 104: `variant: 'grund'`; `tillgang-plan-api.test.ts` justeras. Kommentaren i gratisniva.ts om att det är en rekommendation och inte ett beslut står kvar tills ägaren bekräftat (10.2).

### 14.10 Tester som ändras och acceptans

`niva.test.ts` (14.1 punkt 1, 3, 5; 14.7), `passgenerator.test.ts` (`upprepade`, `valjGeneral`/`valjPooler` returformer), `sessionsvy.test.ts` (`smakprov`), `milstolpar-form.test.ts` (14.3), `tempo.test.ts` (60 s, shl 18/25/90, `tidsform`, `anmarkning`), `tillgang-plan-api.test.ts` (14.9), `integration.pglite.test.ts` (riktat pass ger ingen punkt, general ger punkt med halv vikt). Avsnitt 6 våg 3a:s acceptans 1 läses med dessa ändringar; punkt 4 (fem personer, under tio minuter) är fortfarande min före 3b-release.

---

## 15. Testansvarigs beslut om frågebanken (våg 3c)

Datum 2026-10-10, natt. Granskat: `docs/qa/rummen/vag-3c/README.md`, `docs/tester/matris-familjer.md`, `src/lib/logicTestV7/familjer.json`, de sex bankerna (dumpade med regel, familj, misstag och rutnät), facitkontrollens 35 upplysningar, och renderingarna i `granskning/` för de fem frysta frågorna under manuell granskning, b1, q6, vand-02 och byte-02. Taxonomin med elva familjer är godkänd; den följer generatorernas regler och namnen går att säga i gränssnittet. 270 frågor med noll avvikelser i valideringskedjan är en riktig leverans. Besluten:

**Mekanismen först (frågorna 1, 3, 4 och 9 hänger på den).** En fryst fråga får aldrig tas bort ur sin fil: urvalet för gamla sessioner räknas ur sessionId och poolens storlek, så en borttagning ger gamla resultatsidor fel frågor. Därför införs två saker:

- Fältet `pensionerad: true` i bankerna. En pensionerad fråga ligger kvar i filen, visas i gamla sessioners genomgång, men väljs aldrig till något nytt: `bank.server.ts` `TRANINGSBANK` filtrerar bort den, `selectProv.v7.ts` och det anonyma smakprovet likaså. `validate-v7-questions.mjs` hoppar över pensionerade frågor i kontrollerna av dubbletter, tankstreck och parallellitet, och `v7-facit-check.mjs` räknar dem inte som upplysningar.
- **Bankversion (fråga 9: ja).** Nya klassiska sessioner (grund, avancerad, expert, provet, smakprovet) får `meta.bank_version: 2` när de skapas (`logicTestV4`, `logicTestV6`, `logicTestProv`, `anon_test_sessions`). `selectQuestions.v7.ts`: `selectFromPool(pool, sessionId, count)` får `version` ur sessionens meta; version 2 drar ur `ALLA_<nivå>` utan pensionerade, med samma seedade Fisher-Yates; sessioner utan fältet drar som i dag ur de 28. Test- och resultatsida läser samma version ur samma meta (samma krav som blandningen, 12.3 punkt 1). Percentilen (12.4) räknas per `bank_version` och börjar om vid 25 sessioner på version 2, eftersom ett 15-frågorstest ur 90 frågor inte är jämförbart med ett ur 28. `bank3c.test.ts` "de klassiska testerna drar bara ur de 28" byts till "sessioner utan bank_version drar ur de 28, version 2 ur alla ej pensionerade".

### 15.1 "Raden bestämmer X, kolumnen Y" (fråga 1): pensionera

`v7g-q2-ring-count-fill` och `v7-q12-triple-stack` får `pensionerad: true`. Regel 1 är hårt vunnen: mönstret går att läsa av utan att integrera matrisen. Att q12 har ett plus på diagonalen räddar den inte; raden och kolumnen avgör ändå formen och fyllningen. Familjetexten i `matris-familjer.md` ("hit räknas också de två frusna frågorna …") stryks.

### 15.2 v7g-q25 (fråga 2): rätta regeln, behåll frågan

Rutnätet är 0, 30, 60, 90, 0, 30, 60, 90 och svaret 0 (A). Regeln lovar "och så vidare", vilket pekar på 120 grader. Ny regel: "Den svarta femhörningen vrider sig 30 grader medurs för varje ruta och börjar om efter fyra lägen: 0, 30, 60, 90, 0, 30 och så vidare. Läs rutorna som en lång rad, uppifrån och ner. Antalet sidor är detsamma hela vägen." Rutnät, alternativ och facit rörs inte. Alternativ C (60 grader): "Fel läge i vridningen. Efter 90 grader börjar den om på 0." D (90 grader) är samma som rutan till vänster, inte "inte ändrats sista steget": "Samma som rutan till vänster. Vridningen har inte tagit sista steget." `misstagGranskas` tas bort när texten är skriven.

### 15.3 Dubbletter (fråga 3): pensionera kopian på den högre nivån

Samma rutnät på två nivåer är exakt det som gör att nivåerna inte skiljer sig åt. Pensionera de tretton: `v7-q4-vector-rotation`, `v7-a-vector-cw45`, `v7-a-tally-latin`, `v7-a-poly-fill`, `v7-a-poly-latin2`, `v7-a-vector-90`, `v7-a-ring-latin`, `v7-a-stack-symbol`, `v7-a-poly-latin3`, `v7e-t2`, `v7e-t3`, `v7e-t5`, `v7e-t9`. Grundversionerna står kvar. Motorn ska inte filtrera på rutnät i körning; i stället blir identiskt rutnät över alla sex banker ett **fel** i `v7-facit-check.mjs` (inte en upplysning) för frågor som inte är pensionerade, så det inte kan hända igen.

### 15.4 Balanslinjen i expert (fråga 4): pensionera tre, behåll tre

`v7e-b3`, `v7e-b4`, `v7e-b5` har två former i samma fack (ritade ovanpå varandra, regel 6, läsbarhet): pensionera. `v7e-b1`, `v7e-b2`, `v7e-b6` behålls: b1 i rendering är läsbar, två rörelser med nytt startläge per rad är riktigt expertstoff, och "samma sidsekvens i alla rader" gäller en deldimension medan lägena skiljer sig; parallellkontrollen godkänner dem. Generatorn för `tva-rorelser` får ett filter: aldrig två former i samma fack, och facitkontrollen gör det till ett fel för ej pensionerade frågor.

### 15.5 Tankstreck (fråga 5): rätta q8, q12 pensioneras

`v7-q8-stack-latin`: titel "Grundform och symbol i rad och kolumn", regel "Varje rad och varje kolumn innehåller exakt en cirkel, en kvadrat och en triangel som grundform, och exakt ett plus, en ring och en prick som symbol." q12 pensioneras (15.1). Därefter blir tankstreck i `rule`, `title` eller `misstag` ett fel i valideringen för alla banker, inte en upplysning.

### 15.6 De frysta frågornas prior (fråga 6): sätt inte om för hand

En handsatt omsättning av 61 frågor (84 minus 23 pensionerade) är gissning ovanpå gissning. Priorn ersätts av uppmätt p efter 30 blandade svar (avsnitt 6, 3a), och 3c-frågorna ger spridningen i banken. Det enda som ändras: när generatorerna kan gradera ett rutnät (samma bedömning som gav 3c-frågornas difficulty) skrivs `p_prior` (14.1 punkt 4) på alla ej pensionerade frågor i samma körning, frysta och nya, så skalan är densamma; `difficulty` rörs inte.

### 15.7 Tonen i misstag (fråga 7): ingen inledning, texterna står

Texterna är fristående meningar ("Mönstret har vridit sig åt fel håll.") och fungerar så. Regelpanelen (3b) visar raden "Inte den här · 52 s", regeln, och sedan misstaget som egen mening; ingen "Du valde alternativet som …", ingen omskrivning. Skrivregel för fältet: presens, beskriv vad alternativet gör eller saknar, aldrig "du", aldrig tankstreck, en eller två meningar.

Sex generiska texter: "En svart ruta för mycket.", "En svart ruta saknas.", "En svart sektor för mycket.", "En svart sektor saknas.", "Ett streck för mycket.", "Ett streck saknas." De är sanna men säger inte var. För 2×2 (`lattice`) och 3×3 (`tile`) ska `scripts/lib/matris/misstag.mjs` namnge rutan: 2×2 med "uppe till vänster", "uppe till höger", "nere till vänster", "nere till höger"; 3×3 med "uppe till vänster", "uppe i mitten", "uppe till höger", "till vänster i mitten", "i mitten", "till höger i mitten", "nere till vänster", "nere i mitten", "nere till höger". Form: "Rutan nere till höger saknas." / "Rutan uppe i mitten är fylld fast den inte ska vara det." Skiljer sig två eller fler rutor: "Två rutor för mycket: uppe till vänster och i mitten." Sektorer och streck står kvar som de är (antalet är dimensionen där). Bankerna regenereras med `berika`-skriptet; id och rutnät rörs inte.

### 15.8 Orbital i grund (fråga 8): formatet får finnas, med två villkor

Det som skrotades var lösa prickar utan ram. Den streckade cirkeln är en synlig ram, och i renderingen (q6, vand-02 i stil, byte-04) läses prickens läge mot cirkeln. Villkor, in i generatorn och valideringen: lägena är bara de åtta kompasspunkterna (multipler av 45 grader, aldrig 30), och ramen är alltid den streckade cirkeln med fylld eller ofylld mittpunkt. Minnesregeln står kvar: prickar utan ram är förbjudna.

### 15.9 "Svårighet N av 3" (fråga 10): tas bort, familjen visas i stället

Svårigheten är en prior, inte ett faktum, och ska inte stå som ett tal i genomgången. `MatrixQuestionReview.tsx` rad 186 till 187: ersätt "svårighet N av 3" med familjens namn ur `familjNamn(q.family)` ("Rotation med byte"); saknas familjen (V5) visas bara tiden. Gäller både den klassiska resultatsidan och 3b:s genomgång.

### 15.10 Ringrenderingen: en bugg som måste rättas före 3b

I `v7-q11-ring-xor` är ruta 1 `[svart, ingen, svart]` och ruta 3 `[svart, svart, svart]`, och båda renderas som samma solida skiva: det finns ingen vit skiljelinje mellan två svarta ringar, så en ofylld mellanring intill svarta grannar syns inte. Det bryter regel 6 och gör varje ringfråga där två intilliggande ringar är svarta oläslig, i alla banker. Rätta renderaren (`renderers.v7.tsx`, `ring`): rita alltid en vit linje (2 px i Pixel 7-storlek) mellan ringarna, så att `[svart, svart, svart]` blir en skiva med två tunna vita cirklar och `[svart, ingen, svart]` en svart ytterring, en vit mellanring och en svart mittpunkt. Rendera om alla ringfrågor i `granskning/` efteråt och lägg dem i rapporten; jag granskar dem okulärt innan 3b släpps. Tills renderingen är rättad väljs ringfrågor inte till pass eller mätning (tillfälligt filter i `bankInfo`, kommenterat med den här punkten). Frågorna själva pensioneras inte; datan är rätt.

### 15.11 De åtta alternativen under manuell granskning

Rutnät och facit är kontrollerade mot datan. Texter att skriva in, på originalindex, varefter `misstagGranskas` tas bort:

| Fråga | Alternativ | Text |
|---|---|---|
| v7g-q25 | C (60 grader) | Fel läge i vridningen. Efter 90 grader börjar den om på 0. |
| v7-q5 | D (uppe vänster + uppe höger) | Rutan uppe till höger finns i båda och ska bort. Rutan nere till höger finns bara i den första och ska vara kvar. |
| v7-q11 | C (alla ofyllda) | Tar bort allt. Mellanringen och den innersta finns bara i en av rutorna och ska vara kvar. |
| v7-q13 | E (mittraden) | Mittraden finns inte i någon spegling av rutan till vänster. Spegla den upp och ner. |
| v7-q13 | F (= översta rutan i kolumnen) | Kopierar den översta rutan i kolumnen. |
| v7-q15 | B (uppe höger, mitten höger, nere vänster) | Uppe till vänster och nere till höger saknas. Rutan till höger i mitten finns inte i någon av de två rutorna. |
| v7-q15 | E (alla fyllda) | Alla rutor fyllda. Mitten finns i båda rutorna och ska bort. |
| v7-q15 | F (ingen fylld) | Ingen ruta alls. De fyra hörnen finns i var sin ruta och ska vara med. |

Rättelsen i 15.2 för D i v7g-q25 ingår. v7-q11 behåller texten även om frågan filtreras bort tills renderingen är rättad (15.10).

### 15.12 Vad 3c levererar därefter, i ordning

1. Pensioneringsfältet, bankversionen och valideringens nya fel (mekanismen överst i avsnitt 15, samt 15.3, 15.4, 15.5), så att inget av det ovan kan återuppstå.
2. Ringrenderingen (15.10) och omrenderingen.
3. Texterna i 15.2, 15.5, 15.7 och 15.11 via `berika`-skriptet; `misstagGranskas` försvinner ur bankerna.
4. `p_prior` när graderingen finns (15.6, 14.1 punkt 4).
5. Verifiering av leverantörsformaten mot leverantörernas egna sidor (14.4), varefter "cirka" tas bort där siffrorna håller.

Efter 1 till 3: grund 90 − 1 = 89, avancerad 90 − 10 = 80, expert 90 − 7 = 83 valbara frågor. Det räcker för `BANK_RACKER_30_DAGAR` enligt 14.6 (minst 80 per nivå), och flaggan sätts i samma PR som punkt 3.

---

## 16. Beslut efter våg 1b

Datum 2026-10-11. Art-director efter granskning av `docs/qa/rummen/vag-1b/README.md`, `copy.md`, `perf-jamforelse.md` och skärmdumparna på branchen `design/rummen-1b` (worktree `.claude/worktrees/agent-aef686cc032e30f2a`). Granskat på Pixel 7 och 1280, ljust och mörkt: `vyer/mycket-*` för tester, dashboard, profil-cv, mina-brev, mina-brev-id, profil, tester-slug, tester-provlaget, tester-resultat, tester-personlighet, tester-prov, sokta-tjanster, jobbcoachen, jobbmatchning, intervju, bli-upptackt, kontakt, cv-mallar, cv-analys, `vyer/gratis-*` för tester och prenumeration, `dorrar/N-smal-ljust-brev.png`, `dorrar/N-pixel7-morkt-jobb.png`, `sidomeny/*`, `fokus/*`, `tema/utseende-mörkt.png`, `floden/brev-ljust-steg1.png`, `floden/cv-morkt-steg1.png`. Jämfört mot konceptet (ramarna C1, B1, J1, J2, N1, N2, 1a, 1d, A1) och avsnitt 0, 6 och 13 här. Ingen kod är ändrad av mig. Två beslut rör testupplevelsen och är markerade **[testansvarig]**; de gäller när testansvarig gett sitt stöd.

### 16.1 Helhetsomdömet

Skalet är rätt. Väggen har konceptets toning, ljuskant och rundade nedre hörn i alla fem rum, golvet och papperet byter i mörkt läge utan att väggen gör det, kopparknappen har sin toning och mörka text, dörrnavet och sidomenyn är ritade som i N1, N2 och J2 ner till kopparlinjen och kontoraden, fokusringen byter färg efter underlag, flödena har kopparlinjen i toppen och kopparknappen i foten, och "Personliga brev" står på en rad på 360 px. Dörrarnas symboler och testsymbolerna med en kopparyta är konceptets. Det är ett premiumskal.

Det som blivit platt är golvets början. Konceptets kännetecken är att **det första kortet lyfts ur väggen** och bär den primära handlingen, medan väggen säger var du är. I 1b står kopparknappen på väggen i de flesta vyer (`mycket-pixel7-ljust-profil-cv.png`, `mycket-pixel7-ljust-mina-brev.png`, `mycket-pixel7-ljust-tester-slug.png`, `mycket-pixel7-ljust-tester-provlaget.png`, `mycket-pixel7-ljust-tester-resultat.png`, `mycket-pixel7-ljust-tester-personlighet.png`, `mycket-pixel7-ljust-sokta-tjanster.png`, `mycket-pixel7-morkt-mina-brev-id.png`), och golvet börjar 16 px under väggen med en platt statusrad. Då blir väggen en hero med knapp, alltså InkPanel i ny färg, och lyftet försvinner. Bara Jobbsökets hem och Inför intervjun har lyftet (`mycket-pixel7-ljust-dashboard.png`, `mycket-pixel7-ljust-intervju.png`), och där känns rummet som konceptet. Det rättas med en regel (16.3.1) och mekaniskt per vy (16.3.2) före merge.

Tre mindre saker som också drar ner och ska tas före merge: väggens kategori-eyebrow som upprepar rumsnamnet ("KONTO" under "Konto", "REKRYTERINGSTESTER" under "Träningen", "TRÄNA" i Jobbsöket), Kom igång-raden som fortfarande är det gamla systemet (svart ring, kant-stark, svävande över listan på Jobbsökets hem, `mycket-pixel7-ljust-dashboard.png` längst ner), och rubriker som inte heter som undersidan i sidomenyn ("Ansökningar" under "Sökta tjänster", "Dina matchningar" under "Matchade jobb").

Prestanda och klicktest är godkända: CLS 0 på 39 routes, LCP inom budget efter omkörningen, `linkedin` från 0,292 till 0. Omkörningens svängningar är maskinens, inte byggets.

### 16.2 De 18 frågorna

| # | Fråga | Beslut |
|---|---|---|
| 1 | "Alla tester" för `/dashboard/tester` | Ja, tills våg 2 lägger katalogen på `/dashboard/tester/alla` och hemvyn heter Dagens pass. Ingen ändring. |
| 2 | Provläget med lås för konton utan `test_exam_mode` | **Raden syns för alla, med lås.** En dold funktion går inte att köpa, och låset öppnar arket (i våg 5 A1 med datumet i texten). Samma regel som LinkedIn-profilen. **[testansvarig]** |
| 3 | "N nya" på Matchade jobb | Byggs i **våg 4** (Jobbsökets våg), inte våg 2. Definition: träffar skapade efter `profiles.matchningar_sedda_at` (kolumnen läggs i våg 4, sätts när `/dashboard/jobbmatchning` renderats). Chipet visas bara när N > 0. Till dess ingen chip. |
| 4 | Dagsringen för uppvärmning (tre punkter) | **Tas bort.** Konceptets provdag (1d) har ingen dagsring alls: väggen har datumet och nivåskalan, uppvärmningen är det lyfta kortet och statusraden säger "Inga pass i dag. Serien pausar, inget bryts." Tre uppfunna prickar blir en symbol ingen lärt sig. `DagsringStatus` blir `'kvar' \| 'gjord' \| 'general'`; avsnitt 4.4 rättas. **[testansvarig]** |
| 5 | Dörrarnas ikoner i `currentColor` | Rätt läst. Regeln "exakt en kopparyta per symbol" gäller 48-symbolerna och märkena, inte 24-ikonerna; en kopparyta i 22 px blir brus. Avsnitt 2.1 (raden om `Ikoner.tsx`) rättas: dörrarna är nya för att de är nya former, inte för att de har koppar. |
| 6 | Kopparknapp på väggen när vyn har en enda handling | **Nej. Väggen bär aldrig `KNAPP_PRIMAR`.** Regeln i 16.3.1. Sekundära handlingar på väggen är `LANK_VAGG` eller `KNAPP_GLAS` i automatisk bredd, aldrig full bredd (`mycket-pixel7-ljust-dashboard.png`: glasknappen på hela bredden ovanpå kortets kopparknapp ger två staplade band). |
| 7 | Golv utan lyft kort får 16 px överluft | Ja: `pt-4 lg:pt-6`. Efter 16.3.2 gäller det bara flöden och Jobbcoachen. |
| 8 | Scenerna borta från väggarna | **Slut i inloggat.** Instrumenten är bilden. De illustrationer som står kvar på golvet (tomma tillstånd i intervju, provläget, Bli upptäckt, Matchade jobb) får stå till våg 4, som byter dem mot 96-symboler i `text-ton-ink` utan bakgrund enligt `.tomt`. |
| 9 | Klocka och meddelanden bara vid olästa; headerns länk "Bli hittad av rekryterare" och statustexten borta | Godkänt. Bli upptäckt har sin rad i sidomenyn och får sin rad i "Mer i Jobbsöket" i våg 4. |
| 10 | "Låt jobben hitta dig" före samtycke | Nej. **Rubriken är alltid "Bli upptäckt"**, samma som undersidan. Före samtycke är raden "Låt jobben hitta dig. Rekryterare som söker din bakgrund kan hitta dig i kandidatpoolen. Du är anonym tills du själv godkänner en kontakt." Efter: "Profilen är anonym och visas för rekryterare." plus antalet som tittat när det finns. |
| 11 | Statusraden radie 12 | 12, som konceptet. Avsnitt 2.1 rättas: `rounded-xl`. |
| 12 | E-postbannern på `vagg-2` | Godkänd där den står (ovanför väggen, innanför skalet): väggens toning börjar i `vagg-2`, så bannern läses som väggens övre kant. Höjden är reserverad, det räcker. Villkor: texten i `text-vagg-mjuk` 13 px, länken i `text-vagg-ink`. |
| 13 | `PaketKort`, `SparKort`, `Intervjuprov` under övergångsregeln | Vänta. `PaketKort` tas i våg 5 (nya paket), `SparKort` försvinner med spåren i våg 5, `Intervjuprov` i våg 4. Kravet nu är bara att de inte har vit yta i mörkt läge, vilket skärmdumparna visar. |
| 14 | "Logga ansökan" i översiktskortet när väggen har "Logga sökt jobb" | Ta bort länken i kortet. En handling, en plats. |
| 15 | Personlighetsresultatets äldre palett | Våg 2, tillsammans med `Resultatvy`. Personlighetens regel i 3b (ingen nivå, ingen kurva) gäller då. |
| 16 | Jobbcoachens panel med fast höjd räknad mot väggen | Inte godtagbart som räkning, men inte blockerande (rubriken är ett ord). Våg 4: panelen blir `flex-1 min-h-0` i golvets kolumn (skalet låser redan body och låter bara `main` rulla), så höjden följer utan att väggen mäts. |
| 17 | Sekundärknapparna 48 px | 48 när knappen står ensam, som konceptets `.btn.sek`. **I en rad eller ett rutnät med två eller fler sekundära används `KNAPP_SEKUNDAR_SMAL` med `h-10 text-sm`** (lägg till `KNAPP_SEKUNDAR_LAG` i `knappar.ts` = `KNAPP_SEKUNDAR_SMAL` med `h-12` utbytt mot `h-10` och `text-[15px]` mot `text-sm`). Brevvyns fyra knappar försvinner ändå i 16.3.2. |
| 18 | Tankstreck i personlighetsresultatets rubrik | Varken tankstreck eller kolon. Rubriken är "Ditt resultat", raden "Logiktest, grundnivå. Genomfört 26 september 2026." (mönstret för alla resultatsidor tills `Resultatvy` i våg 2). Gäller även `TestResultsShell`. |

**Testansvarig** (2026-10-11): Stöder fråga 2 och fråga 4. Två villkor som följer av briefen (avsnitt 4, modul 5 och tillståndet Provdagen) och konceptets 1d.

- **Fråga 2.** Den låsta raden bär alltid formatet i klartext, så att värdet syns före köpet: "Samma format som Matrigma. 35 uppgifter, 40 minuter, fast ordning." Utan leverantör: "Vårt provläge. 18 uppgifter, 25 minuter." Aldrig "samma test", aldrig bara "Provläget" med ett lås. Låset öppnar arket; på provdagen (1d) visas raden inte för någon, betalande eller gratis, eftersom provdagen har en enda handling.
- **Fråga 4.** `uppvarmning` tas bort, men ingen ersättning med `kvar`: på provdagen renderas `Dagsrad` och `Dagsring` inte alls (väggen har datumet, nivåskalan och meningen om gjorda pass). En ring i läget `kvar` skulle säga att ett pass väntar, och det bryter regeln "inget räknar, inget blinkar". `general` gäller bara de två dagarna före provet. Uppvärmningen är det lyfta kortet, utan tid, utan nivå och utan sparning (`matrislogik-uppvarmning`), som acceptansen för våg 2 redan säger.

### 16.3 (a) Ska göras före merge till `main`

Allt i (a) är utseende och strängar: ingen funktion, kvot, betalvägg eller route ändras. Samma grindar som 1b (tsc, vitest, grep, kontrast, perf på berörda routes, skärmdump per ändrad vy i `docs/qa/rummen/vag-1b/efter-granskning/`, Pixel 7 och 1280, ljust och mörkt).

#### 16.3.1 Regeln: väggen säger var du är, det lyfta kortet vad du gör

1. `RumHuvud` byter prop: `action` blir `handling` och renderar bara `LANK_VAGG` eller `KNAPP_GLAS`. `KNAPP_PRIMAR` får inte förekomma innanför `Vagg` (grep `KNAPP_PRIMAR` i filer som renderar `RumHuvud`/`Vagg`: varje träff ska ligga i ett `LyftKort`, `Kort` eller flödesfot). Lägg kontrollen i `scripts/grep-rummen.mjs` som ett mönster som stoppar: `KNAPP_PRIMAR` på samma rad som `handling=` eller `action=`.
2. `KNAPP_GLAS` tappar `w-full` och får `w-auto self-start`. Full bredd på glas finns bara i `Kvitto` (våg 3b) och i ark. `RumHuvud`s handlingsrad: `mt-5 flex flex-wrap items-center gap-x-4 gap-y-2.5` utan `sm:[&>a]:w-auto`-tricket.
3. Varje vy som i 1b hade kopparknappen på väggen får ett `LyftKort` som första barn i `Golv` (`Golv lyft`, `RumHuvud tat={false}` så att väggen behåller 44 px i botten och kortet överlappar 30 px). Kortet: `eyebrow` i `eyebrowTon="neutral"` (eller ingen), `titel` som nominalfras om det kortet leder till, `text` med den gamla väggbeskrivningen, `handling` med samma knapptext och samma handler som förut. Väggens rad blir då kort: en rad status eller ingenting. Exakt per vy i 16.3.2.
4. Ordningen på golvet är alltid: `LyftKort`, sedan statusrad eller flikar, sedan listor. Där en vy har flikar (Sökta tjänster) står `LyftKort` före flikarna.

#### 16.3.2 Per vy

| Route och fil | Vägg efter ändringen | LyftKort (första på golvet) | Övrigt |
|---|---|---|---|
| `/dashboard/profil/cv`, `MinaCvClient.tsx` | h1 "Mina CV". Rad: statusradens text ("4 sparade CV. Paketet har inga gränser." respektive gratisnivåns text), med statusradens eventuella länk som `LANK_VAGG` efter texten. | eyebrow neutral "Nytt CV", titel "Ladda upp ett CV", text "PDF eller Word. Vi använder det i brev, analys och mallar.", handling "Ladda upp CV" (samma handler). | Statusraden under väggen tas bort (texten står nu i raden). `Golv lyft`. |
| `/dashboard/mina-brev`, `MinaBrevClient.tsx` | h1 "Mina brev" (var "Dina personliga brev"). Rad: "5 brev, 2 den här månaden." (statusradens text). | eyebrow neutral "Nytt brev", titel "Skriv ett brev mot en annons", text "Klistra in annonsen, så skriver vi utifrån ditt CV.", handling "Skapa nytt brev" (länk `/dashboard/skapa-brev`). | Statusraden tas bort. Sök och vyväxlaren står under kortet. |
| `/dashboard/mina-brev/[id]`, `ViewLetterClient.tsx` | h1 oförändrad ("Projektledare, Klarna"), rad "Klarna · Projektledare · Klassisk", handling `LANK_VAGG` "Alla dina brev". | Kortet **är** brevet (B1): `.dokument`-ytan inuti `LyftKort` (`children`), under den `KNAPPRAD` med `KNAPP_PRIMAR` "Redigera" och en rad med tre `LANK`: "Kopiera text", "Ladda ner PDF", "Ladda ner Word" (`flex flex-wrap justify-center gap-x-5`, varje länk `min-h-11 inline-flex items-center`). | Rutnätet med fyra 48-knappar tas bort. "Ta bort" blir `LANK` i `text-fel decoration-fel/40` till höger om metaraden "Skapad 22 september 2026" (`flex items-center justify-between`). `ConfirmDialog` som förut. |
| `/dashboard/sokta-tjanster`, `SoktaTjansterClient.tsx` | h1 "Sökta tjänster" (var "Ansökningar"), raden oförändrad. | eyebrow neutral "Nytt", titel "Logga ett sökt jobb", text "Företag, tjänst och datum räcker. Vi påminner när det är dags att följa upp.", handling `JOBBSOK.loggaSoktJobb` ("Logga sökt jobb"; knappen hette "Logga ansökan"). | Flikarna Ansökningar/Statistik/Rapport, statusraden, sök och filter står under kortet i den ordning de har. Övriga strängar med "ansökan" rörs inte förrän våg 4. |
| `/dashboard/tester/[slug]`, `TestHubPage.tsx` | h1 och rad oförändrade. Ingen handling på väggen. | eyebrow neutral nivånamnet ("Grund"), titel "{antal} frågor, cirka {minuter} minuter", text "Du kan pausa. Svaren sparas medan du gör testet.", handling "Starta testet" eller "Gör om testet" som i dag. | Metaraden under väggen (symbol, nivå, antal, tid) tas bort: kortet bär den. Statusraden "Ditt bästa …" med länken "Alla tester" står kvar under kortet. |
| `/dashboard/tester/matrislogik-prov`, samma komponent | Som ovan. | eyebrow neutral "Prov", titel "18 frågor, cirka 25 minuter, mot klockan", text "Ingen förklaring under tiden. Genomgången kommer efter provet.", handling som i dag. | Som ovan. Låst för gratis: kortets handling öppnar `GraValSheet` precis som knappen gör i dag. |
| `/dashboard/tester/personlighet`, `PersonalityHubPage.tsx` | Som ovan. | eyebrow neutral "Grund", titel "50 påståenden, cirka 10 minuter", text "Inga rätta svar. Du får en profil, inte ett betyg.", handling "Starta testet". | Som ovan. |
| `…/results`, `TestResultsPage.tsx` och `TestResultsShell.tsx` | h1 "Ditt resultat", rad "{Testnamn}, {nivå}. Genomfört {datum}." Ingen handling på väggen. | Kortet **är** talkortet (8 av 15, 53 procent, Tid, Per fråga) med `KNAPPRAD` och `KNAPP_PRIMAR` "Gör om testet" längst ner. | Metaraden (symbol + nivå) tas bort. Percentilkortet och "Nästa steg"-kortet står kvar under. Våg 2 ersätter allt med `Resultatvy`. |
| `/dashboard` mobil, `DashboardHem.tsx` | "Logga sökt jobb" som `KNAPP_GLAS` i automatisk bredd (som på dator). | Oförändrat ("Nästa handling"). | Länken "Logga ansökan" i `JobbsokOversikt` tas bort (fråga 14). På dator byter de två lyfta korten plats: "Nästa handling" först (vänster), talkortet efter, som J2. |
| `/dashboard/intervju`, `page.tsx` | "Nytt intervjuprov" som `KNAPP_GLAS` i automatisk bredd. Eyebrow "Träna" bort. | Oförändrat. | |
| `/dashboard/bli-upptackt`, `BliUpptacktClient.tsx` | h1 "Bli upptäckt", raden enligt fråga 10. | Oförändrat (kortet har redan kopparknappen). | |
| `/dashboard/jobbmatchning` | h1 "Matchade jobb" (var "Dina matchningar"), raden oförändrad. | Inget nytt kort; vyn har redan sin kopparknapp i "Annonser vi läst". | Våg 4 gör om vyn. |
| `/dashboard/cv-analys`, `CVAnalysisIntro.tsx` | h1 "Analysera CV" (var "Analysera ditt CV"). | Kortet "En komplett bild av ditt CV" blir `LyftKort` (det är redan första kortet med kopparknappen): `Golv lyft`, `tat={false}`. | |
| `/dashboard/cv-mallar`, `CvMallarHero.tsx` | h1 "CV-mallar", rad "Välj ett CV, välj en av 41 mallar, ladda ner som PDF. Alla klarar rekryteringssystemens läsning." Eyebrow bort. | Inget (steg-flödet står på golvet). | Rubriken "Samma innehåll, en mall rekryteraren läser." försvinner från väggen; den tillhör den publika sidan. |
| `/dashboard/linkedin-optimizer` | h1 "LinkedIn-profilen". | Oförändrat. | |
| `/dashboard/profil`, `ProfilClient.tsx` | h1 "Profil" (var "Din profil"), eyebrow "Konto" bort, raden oförändrad. | Inget. | |
| `/dashboard/profil/prenumeration` | Eyebrow "Konto" bort. | Inget. | |
| `/dashboard/arbetsstil`, `ArbetsstilClient.tsx`; `tester/prov/[token]`, `intervju/[token]`, `intervju/profil/[token]`, `SaknasVy`, `ProvSaknasVy`, `MessageHub`, `ApplicationDetailClient` | Kategori-eyebrow bort. Finns `KNAPP_PRIMAR` i `action`: flytta enligt 16.3.1 punkt 3 med sidans beskrivning som text och knappens objekt som titel. Finns bara en sekundär handling ("Redigera" i ansökan): `KNAPP_GLAS` automatisk bredd. | | |

Regeln för rubriken på undersidor: **h1 är undersidans namn i sidomenyn** (`UNDERSIDA` i `copy.ts`). Undantag: Jobbsökets hem (hälsningen), Träningens hem (våg 2 sätter datumrubriken), detaljsidor (brev, ansökan, test, resultat). Strängarna läggs i `copy.ts` under `RUBRIK` och tas därifrån, så att copywritern kan byta dem på ett ställe.

#### 16.3.3 Eyebrow på väggen

`RumHuvud`s `eyebrow` är bara för data, aldrig kategori: Jobbsökets datumrad ("Lördag 10 oktober") och, från våg 2, "Dagens pass · nivå 5". Tas bort: "Rekryteringstester" (`TesterHubClient`), "Konto" (`ProfilClient`, `PrenumerationClient`), "CV-mallar" (`CvMallarHero`), "Träna" (`intervju/page.tsx`), "Din arbetsstil" (`ArbetsstilClient`) och eyebrow-värdena i `SaknasVy`, `ProvSaknasVy`, `intervju/[token]`, `intervju/profil/[token]`, `tester/prov/[token]`. Färgen på den som finns kvar är `text-vagg-mjuk` (konceptets `.ey` på väggen i 1d), inte `--ljus`. `LyftKort`s eyebrow ("Nästa handling", "Börja här") rörs inte.

#### 16.3.4 Kom igång-raden i rummens material

`KomIgangRad.tsx`, båda varianterna: `rounded-2xl border border-kant bg-papper px-4 py-3`, flytande med `shadow-lyft` (inte `shadow-svav`), rubrik 15/600 `text-ink-1`, raden 13 `text-ink-3`. Ringen är ingen kant utan en framstegsring: SVG 40×40, spår `stroke: var(--kant)` 3 px, fyllning `stroke: var(--koppar)` 3 px med `stroke-dasharray` efter andelen (omkrets 2π·17 = 106,8), `stroke-linecap: round`, roterad −90°, talet "4/12" 11/600 tabular `text-ink-1` i mitten. Inget `border-2 border-ink-1`. Den flytande varianten täcker i dag listans sista rader (`mycket-pixel7-ljust-dashboard.png`, "Sökt i dag" under kortet): när den visas sätts `--komigang-h: 76px` på `[data-rum]` via `data-komigang-rad="flytande"` (CSS: `:root:has([data-komigang-rad="flytande"]) .dashboard-main-content{padding-bottom:calc(var(--bottom-nav-h) + var(--komigang-h) + 24px)}`), annars som nu. Mäts i skärmdump: sista raden i "Pågår nu" synlig vid scrollbotten.

#### 16.3.5 Småsaker

1. Sidomenyns kontorad bryts på två rader i stället för att klippas ("Anna Andersson · Hela p…" i `mycket-desktop-ljust-dashboard.png`): rad 1 namnet 13/500 `text-ink-1`, rad 2 paketet 12 `text-ink-3`. `kontoRad()` i `copy.ts` ersätts av två fält.
2. `Dagsring`: statusen `uppvarmning` tas bort (fråga 4).
3. `StatusRow`: `rounded-xl` är rätt; specen (avsnitt 2.1) rättas, inte koden.
4. `knappar.ts`: `KNAPP_GLAS` utan `w-full` (16.3.1 punkt 2), `KNAPP_SEKUNDAR_LAG` (fråga 17).
5. E-postbannern: text `text-sm text-vagg-mjuk`, länken `text-vagg-ink` (fråga 12).
6. Designsystemet: avsnitt 6 får regeln "väggen bär aldrig primärknappen" och tabellen över vad som står på vägg (topprad, rubrik, instrument, glas eller länk) respektive golv (lyft kort, kort, rader, statusrad). Ändringsloggen får raden "1b, granskning: lyftet tillbaka i alla vyer".
7. `spec-rummen` rättas i avsnitt 2.1 (dörrarna, StatusRow-radien), 4.2 (`RumHuvud handling`), 4.4 (`DagsringStatus`, `KNAPP_GLAS`, `KNAPP_SEKUNDAR_LAG`) av 1b-agenten i samma PR.

Efter (a) kan 1a + 1b gå till `main` i den gemensamma PR:en (avsnitt 13.1). Jag granskar skärmdumparna i `efter-granskning/` innan PR:en öppnas; det tar en timme, inte en dag.

### 16.4 (b) Kan tas i våg 2 eller 4

**Våg 2 (Träningen):**
1. Hubben (`TesterHubClient`): segmentväxlaren "Tester / Din utveckling" med 2 px bläckkant och nivårutorna med bläckkant för "har resultat" (`mycket-pixel7-ljust-tester.png`) försvinner med hemvyn 1a/T1. Till dess står de; "Nästa test"-kortet lyfts inte eftersom växlaren ligger emellan.
2. `TestFlowShell` (`mycket-pixel7-ljust-tester-prov.png`: klocka, "SVÅRIGHET ●●●", växeln "Förklarande text av", grå frågetecken-ruta) blir `PassShell`-utseendet enligt avsnitt 2.2.
3. `Resultatvy` ersätter talkortet, percentilkortet och "Nästa steg"-kortet (ikonen på persikofärgad ruta i `mycket-pixel7-ljust-tester-resultat.png` är precis det "ikoner i färgade rutor" som systemet inte ska ha).
4. Personlighetsresultatets palett (fråga 15).
5. Provläget på egen undersida (`/dashboard/tester/matrislogik-prov`) får rummets utseende fullt ut när 3b bygger `MatrisProvSession`.

**Våg 4 (CV, Personliga brev, Jobbsöket):**
1. Lucide och de gamla ikonerna i `src/components/cv`, `letters`, `jobb*`, `interests` (papperskorg, öga, nedladdning, klocka, byggnad, förstoringsglas, sköld, kamera i `mycket-pixel7-ljust-profil-cv.png`, `-sokta-tjanster.png`, `-jobbcoachen.png`, `-profil.png`) byts mot `RumSymboler`/`Ikoner`. Grep-listan noll (avsnitt 1.7).
2. Ikoner på persikofärgad ruta (`bg-accent-soft`/motsvarande bakom dokumentikonen i `cv-analys`, "Ditt CV" i `jobbmatchning`, "Nästa steg" i resultatet): ikonen 40 px i `text-ton-ink` utan bakgrund, enligt `Rad`s symbolregel.
3. Tomma tillstånd (`intervju` "Inga prov än", provläget "Inga resultat än", `bli-upptackt`, `jobbmatchning` "Vi har inte letat än"): 96-symbol i `text-ton-ink` enligt `.tomt`, inga tecknade scener med orange ytor.
4. Segmentväxlare och filterchips som navigation (Sökta tjänsters flikar och "Alla", brevlistans vyväxlare): aktiv = `bg-ton text-ton-ink border-transparent`. Bläckkanten (`border-ink-1` + inset 1 px) är konceptets markering för **val i formulär** (`.chip-v.on`, `.val.vald`, `.alt.vald`) och Utseende-väljaren, inte för flikar.
5. Profilens kort med orange vänsterkant ("Överst i ditt CV"): kanten bort; koppar är linje, punkt och knapp, inte dekor.
6. Jobbcoachens panelhöjd som `flex-1 min-h-0` (fråga 16).
7. `Intervjuprov` ur övergångsregeln; `PaketKort` och `SparKort` i våg 5 (fråga 13).
8. "N nya" på Matchade jobb (fråga 3) och "Mer i Jobbsöket"-raderna (J1).
9. Brevvyn får B1 fullt ut (bekräftelsen i fyra steg, träffarna som veckorad, "Spara som sökt tjänst"); 16.3.2 ger den bara rätt skelett.
10. Mina CV-korten (två 48-knappar per kort, papperskorg) blir `Rader` med chevron enligt C1:s "Mina CV".
11. Ordet "ansökan/ansökningar" i Sökta tjänster (flik, chip "Sökt", statusrad) ses över med copywritern när modulen får J1:s rader; "Sökta tjänster" är namnet.

## 17. Ägarens beslut 2026-10-11 (efter saas-leads rekommendation)

Underlag: saas-leads bedömning på siffrorna i docs/rapporter/analys-utveckling-2026-10-10.md (inga nyare data). Besluten ersätter motsvarande delar av avsnitt 0, 6, 14 och 16.

1. **Namnet.** Mobilens dörr heter **Tester**. Sidomenyn på dator, rummets rubrik och övriga omnämnanden heter **Rekryteringstester**. Rummets första rad: "Träna inför ditt rekryteringstest". Skäl: alla tre köpen gick via ordet rekryteringstest (artiklar, /verktyg/rekryteringstester); "testträning" förekommer inte publikt. Rummet heter fortfarande `tran` i koden. Mät: dörröppningar per onboarding_intent, andel som lämnar rummet inom tio sekunder, andel som når betalväggen från rummet.
2. **Gratisnivån i Rekryteringstester: mycket begränsad.** Gratis är smakprovet (anonymt, fem frågor), nivåmätningen en gång per konto med full genomgång och ett grundpass samma dag (dag 0). Sedan betalvägg på allt: dagens pass, riktade pass, ommätning, kurvans historik, provläget och generalrepetitionen. I `src/lib/traning/gratisniva.ts`: `grundpassVarjeDag: false`, `grundpassPerDag: 1` gäller bara dag 0. Bekräftad av ägaren, ersätter rekommendationen i beslut 6 och 14.9. Ritas om: 1f och W3. CV och brev: kvoterna rörs inte. Mät: spärr till konto (20 % nu, golv 15 %), mätning till vägg (40 % nu, mål 70 %).
3. **Paketen: bara Hela paketet 149 kr i månaden säljs.** Dagspasset, Hela paketet vecka och kvartal samt Träningspaketet och CV-paketet slutar säljas (`saljs: false` i PLANS och Stripe, inget raderas, befintliga prenumeranter löper vidare, webhooken känner fortfarande igen dem). Prissidan, betalväggarna, "Från"-badgen, AggregateOffer och registreringsförslaget visar bara månaden. Den med prov i morgon får månaden med provläget och generalrepetitionen öppna direkt; uppsägning med ett klick i portalen.
   **Återinförande av Dagspasset:** avläs vägg till köp efter 40 exponeringar eller sex veckor efter våg 5, vad som kommer först. Under 10 % återinförs Dagspasset 49 kr, men bara i betalväggen när provdatum ligger inom två dagar. Brytpunkt: vid 79 kr och 20 % gav varje exponering 15,8 kr; vid 149 kr krävs 10,6 %.
4. **Paketnamnet.** "Hela paketet" byter namn till **Jobbcoach Premium**, eftersom det inte finns några andra paket kvar att skilja det från (ägaren 2026-10-11). Nyckeln all_month och priset 149 kr i månaden är oförändrade. PLANS.name i src/lib/plans/plans.ts är enda källan (paketNamn()); alla strängar som skriver "Hela paketet" i klartext, betalväggar, prissida, mejl, kvitton, AggregateOffer och produktnamnet i Stripe följer med i våg 5. Skrivreglerna från 2026-09-24 gäller i övrigt: namnet följs av pris eller period i knappar och säljrader ("Köp Jobbcoach Premium, 149 kr i månaden"), verbet Köp. svensk-ux-copywriter stresstestar namnet och skriver en kort regel för hur det skrivs (versaler, bestämd form, "Premium" ensamt) innan våg 5 startar. Låsta rader i appen säger "Ingår i Premium" eller copywriterns val.


## 18. Slutgranskning 1b

Datum 2026-10-11. Art-director efter skärmdumparna i `docs/qa/rummen/vag-1b/efter-granskning/` på branchen `design/rummen-1b` (commit f5dc9c39). Granskat på Pixel 7 och 1280, ljust och mörkt: `vyer/mycket-*` för dashboard, profil-cv, mina-brev, mina-brev-id, mina-brev-id-edit, sokta-tjanster, sokta-tjanster-id, tester, tester-slug, tester-provlaget, tester-personlighet, tester-resultat, cv-analys, cv-mallar, profil, prenumeration, intervju, jobbmatchning, jobbcoachen, bli-upptackt, arbetsstil, meddelanden, `vyer/gratis-*` för dashboard och profil-cv, `dorrar/`, `sidomeny/` och `komigang/`. Ingen kod är ändrad av mig.

### 18.1 Omdömet

Lyftet sitter. Mina CV, Mina brev, brevvyn, Sökta tjänster, testhubben, provläget, personligheten, resultatet och CV-analysen börjar nu med kortet som överlappar väggen, väggen bär bara glas eller länk, eyebrowen är borta överallt utom datumraden, Kom igång-raden är rummets material med kopparringen och sista raden i listan syns vid scrollbotten, kontoraden bryts på två rader, "Tester" står på dörren och "Rekryteringstester" i sidomenyn och toppraden. Det här är konceptet.

### 18.2 Byggagentens egna beslut

| Beslut | Omdöme |
|---|---|
| Lyftkort i 404-vyerna (`SaknasVy`, `ProvSaknasVy`) | Godkänt. Ett rum med en enda väg ut ska lyfta den. |
| Lyftkort i hemmet B (CV men inget brev) | Godkänt i princip, men ingen skärmdump finns: alla tre konton stod i A eller C. Se 18.3 punkt 4. |
| Lyftkort i brevredigeringen med Spara överst | **Rättas.** Ett formulär sparar i foten, inte i ett kort ovanför fälten. Se 18.3 punkt 1. |
| "Ta bort" som röd länk vid "Skapad …" | Godkänt. Regel: `text-fel` får bära en destruktiv länk som bekräftas i dialog, aldrig en knappfyllnad. Samma mönster ersätter den röda "Ta bort"-knappen i ansökan i våg 4. |
| `KNAPP_SEKUNDAR_LAG` som `replace` på `KNAPP_SEKUNDAR_SMAL` | Godkänt. |
| 24 px överluft på golv utan lyftkort på dator (`pt-4 lg:pt-6`) | Godkänt, det är fråga 7. |

### 18.3 Ska rättas före merge till `main`

Godkänt för main: **nej**, tills de fyra punkterna är gjorda. Alla är utseende och strängar; samma grindar som 16.3 (a), skärmdump per ändrad vy i `efter-granskning/`.

1. **Brevredigeringen** (`EditLetterClient.tsx`). Inget `LyftKort`, `Golv` utan `lyft`. Ordningen på golvet: kortet Brevinfo, raden "Redigera texten" och "Kopiera text", brevet (eller textarean), sedan `KNAPPRAD` sist med `KNAPP_PRIMAR` "Spara" och `LANK` "Avbryt" (till brevet). Väggen oförändrad (h1 "Redigera brevet", `LANK_VAGG` "Tillbaka till brevet"). Meningen "Tryck Spara överst för att spara brevet." tas bort; "Texten läggs tillbaka i mallen." räcker.
2. **Hemmet A** (`DashboardHem.tsx`, inget CV, `gratis-pixel7-ljust-dashboard.png`). Det är det enda rumshemmet utan lyft, och det är vyn varje ny användare ser först. `forstaLyft` gäller även A, `tat={false}`, `Golv lyft`. Uppladdningskortet blir `LyftKort`: eyebrow "Börja här" (samma ton som "Nästa handling"), titel "Ladda upp ditt CV", text "PDF, Word eller text. Namn, telefon och adress maskas innan texten går vidare till någon AI.", `children` = `InlineCVUpload` och länken "Har du inget CV? Bygg ett här". Scenen `IlluArketLyfter` tas bort (fråga 8: scenerna är slut i inloggat, och ett lyft kort börjar med eyebrowen, inte med en bild). Länkarna "Träna på tester" och "Följ dina ansökningar" står kvar under kortet. Väggen oförändrad: h1 "Börja med ditt CV, Anna", raden, glasknappen "Logga sökt tjänst".
3. **Mina CV utan CV** (`MinaCvClient.tsx`, `gratis-pixel7-ljust-profil-cv.png`). Tre ingångar till samma handling står staplade: lyftkortets kopparknapp, `EmptyState` "Inget CV än" med en sekundär "Ladda upp CV", och uppladdningskortet. `EmptyState` tas bort när lyftkortet står (en handling, en plats, fråga 14). Uppladdningskortet står kvar, det är målet för kortets handling.
4. **Hemmet B, skärmdump.** Ladda upp ett CV på ett konto utan brev och ta `vyer/<konto>-{pixel7,desktop}-ljust-dashboard.png` i B. Kontroll: lyftkortet är brevet, väggen har h1 "Nästa steg: brevet", glasknappen och länken "Se hela CV-analysen" i automatisk bredd på en rad.

Efter punkt 1 till 4 går 1a + 1b till `main` utan ny granskning från mig; byggagenten bifogar skärmdumparna i PR:en.

### 18.4 Kan vänta, läggs till 16.4

**Våg 4 (Jobbsöket):**
1. `arbetsstil`: h1 är undersidans namn ("Din arbetsstil"), inte "Din rapport i ord, byggd på dig"; kortet "Gör dagens test" lyfts (det är vyns enda handling); knapptexten ses över av testansvarig mot gratisnivån i avsnitt 17.
2. `meddelanden`: h1 "Meddelanden", det tomma tillståndet ("Inga meddelanden än", de tre stegen, kopparknappen) står på golvet som lyft kort, inte som h1 på väggen.
3. `sokta-tjanster/[id]`: ikonerna i glasknappen "Redigera" och länken "Sökta tjänster" bort, "Ta bort" blir länk i `text-fel` vid metaraden som i brevvyn, "Lägg till händelse" utan plustecken, kortet lyfts.
4. `cv-analys`: pilen i kopparknappen bort (ingen annan kopparknapp har ikon).

**Våg 5 (paketen):** Kom igång-radens "med Hela paketet", sidomenyns "Från 49 kr", hubbens rad "Träningspaketet och Hela paketet", `GraValSheet`-texten och PaketKorten följer `paketNamn()` och avsnitt 17; inget av det rörs i 1b.

---

## 19. Testansvarig om våg 3b och våg 2

Datum 2026-10-11. Granskat utan kodändring: `docs/qa/rummen/vag-3b/README.md` och skärmdumparna (P1 till P4, S1, M0, M1, M1-betalande, O1, K1, uppvärmningen, klickflödena, Pixel 7 och 1280, ljust och mörkt) på `design/rummen-3b`, `src/lib/traning/pass-copy.ts` och `resultat.ts`, `Regelpanel.tsx`, `klient.ts`, `passgenerator.ts`, `familjer.json`; `docs/qa/rummen/vag-2/README.md` med `hem/`, `ingang/`, `natfel/` på `design/rummen-2`, `hem-copy.ts` och `hemvy.ts`. Mot briefen (3.3 till 3.6, 5), avsnitt 14, 15 och 17 och konceptets ramar. Ägaren är borta; besluten nedan är mina inom det ägaren beslutat i 17. Allt är byggärenden för 3b:s och 2:s rättningsomgång; strängar står exakt, kod står som ändringar i namngivna filer.

### 19.1 Omdömet

Passet är det jag bad om: regeln ur banken efter varje svar, misstaget som egen mening, det valda i bläck och det rätta i koppar, alla sex alternativ kvar, tidsraden som inte räknar ner, "Vet inte" bara i pass, mätningen utan regel under tiden. Resultaten avslöjas lugnt, nivån sjunker utan rött, kvittot står stilla. M1 med heltalet stort, familjerna och planen med låsen enligt 17.2 är rätt läst. Våg 2:s hemvy följer rubriktabellen och gratisnivån, kurvan har axeltext i rätt storlek och ingången har Hoppa över synligt. Det som ska rättas nedan är innehåll och några tal som inte stämmer med varandra, inte struktur.

### 19.2 Byggagentens nio frågor om 3b

**1. Raden efter rätt svar: ja, motorn levererar bandet, texten bor i pass-copy.** Konceptets rad ("Det här var sträckuppgiften över din nivå. Du tog den under provets tid.") är den enda belöningen i passet som har med förmågan att göra, och den gör sträckuppgifterna begripliga också när de går fel. Ändringar:
- `passgenerator.ts`: `Urval` får `band: Record<string, 'under' | 'nara' | 'over'>` (q_id till fack, ur `fack(k)` i `valjPass`; `valjRiktat` sätter `nara` på alla). `historik.ts` `TraningsMeta` får `band: Record<string, 'under' | 'nara' | 'over'> | null` (null i mätning, ommätning, general). `motor.server.ts` `aterkopplingFor` sätter `Aterkoppling.band: 'under' | 'nara' | 'over' | null` ur meta.
- `pass-copy.ts` `PASS_COPY.regel` får fyra rader: `strackRatt: 'Sträckuppgift över din nivå, klarad inom provets tid.'`, `strackRattOverTid: 'Sträckuppgift över din nivå. Rätt, men över provets tid.'`, `rattOverTid: 'Rätt, men över provets tid. Tempot räknas i resultatet.'`, `strackFel: 'Sträckuppgift över din nivå.'`.
- `Regelpanel` får prop `rad2?: string | null`, renderad som en egen `p` i `text-ink-2` efter misstaget (eller i dess ställe). `PassFlode` väljer: rätt och `band === 'over'` ger `strackRatt` om `tid_s <= budget_s`, annars `strackRattOverTid`; rätt, annat band och `tid_s > budget_s` ger `rattOverTid`; rätt i övrigt ger ingen rad (regeln räcker); fel eller Vet inte med `band === 'over'` ger `strackFel` efter misstaget; annars ingen. Bara i pass och riktat pass, aldrig i uppvärmningen.
- Vitest: en rätt sträckuppgift på 40 s mot budget 60 ger `strackRatt`; rätt nära nivån på 70 s ger `rattOverTid`; fel på en sträckuppgift ger misstaget följt av `strackFel`.

**2. Heltalet avrundat nedåt: bekräftat, med decimalen under pricken.** 5,9 visas som "5 av 10". Nivån är ett band, inte ett mått (14.1: standardfel 0,6), och märket Nivån upp räknas som `floor(mätningen) + 1`, så heltalet ska bytas först när bandet byts. Rättelse: axeltexten under pricken på M1:s skala visar `nivaText(niva)` ("5,9"), inte heltalet, så att precisionen står på instrumentet som 14.1 säger. Samma regel i hemvyns rubrikrad (19.3 fråga 5).

**3. Nivåmeningarna: omskrivna.** Utkasten blandar ihop vad hon klarar med tempot (nivån räknas på rätt och fel, tempot är ett eget tal) och gör 8, 9 och 10 identiska. Nya `NIVAMENING` i `pass-copy.ts`, kalibrerade mot priorerna (klass 1 till 4 ger nivå 2,35, 3,7, 5,05 och 6,4 där chansen är hälften):

| Nivå | Mening |
|---|---|
| 1 | Du står längst ner på skalan. Uppgifter med en regel i taget är inom räckhåll, och det är där passen börjar. |
| 2 | Du klarar en del av de enklaste uppgifterna, de med en regel i taget. Passen börjar där. |
| 3 | Du klarar de flesta uppgifter med en regel i taget. Två regler samtidigt går oftast fel än. |
| 4 | Du klarar uppgifter med en regel i taget. Två regler samtidigt, som rotation med byte, går oftast fel än. |
| 5 | Du klarar de flesta uppgifter på grundnivå. Två regler samtidigt, som rotation med byte, går ungefär varannan gång. |
| 6 | Du klarar grundnivån, och oftare rätt än fel när två regler ska följas samtidigt. De svåraste uppgifterna går ungefär varannan gång. |
| 7 | Du klarar de flesta uppgifter, också de med två regler samtidigt. De svåraste, med tre saker att följa, går oftare rätt än fel. |
| 8 | Du klarar nästan allt, också de svåraste uppgifterna. Det som skiljer nu är tempot. |
| 9 | Du klarar nästan alla uppgifter, också de svåraste. Det som finns kvar att träna är tempot under provets tid. |
| 10 | Du klarar hela skalan. Det som finns kvar att träna är tempot under provets tid. |

Raden efter meningen byts: `familjerFel: (n) => n === 1 ? 'En familj drar ner mest, den står under Var du tappar.' : 'Två familjer drar ner mest, de står under Var du tappar.'` ("väljer du oftare fel svar" är bara sant under hälften rätt, och svagaste är de två lägsta oavsett andel). 8 till 10 nås inte före `BANK_KALIBRERAD_OVER_7_5` men ska finnas.

**4. Jämförelsen i P4: ja, men med förra gången i familjen, inte bara mätningen.** Mätningen har tolv frågor över elva familjer, så "mot en av tre i mätningen" finns sällan. Det som finns oftare är förra passet i samma familj (riktade pass och "samma familj, ett steg svårare" ger det). `Avslut.familjer` får `forra: (Familjestatistik & { typ: 'matning' | 'pass' | 'riktat' | 'ommatning' | 'general' }) | null`: temafamiljens utfall i den senaste tidigare slutförda sessionen där familjen hade minst två frågor (ur samma underlag som `familjeunderlag`, per session). `resultat.ts` `passResultat`: meningen blir `${Familj}: ${talord(ratt)} av ${talord(antal)} rätt i dag` + (forra ? `, mot ${talord(forra.ratt)} av ${talord(forra.antal)} ${forra.typ === 'matning' ? 'i mätningen' : 'förra gången'}` : '') + `. ` + andra meningen. `familjIdag` i pass-copy skrivs om till den formen; "Fem av sex i rotation med byte rätt i dag" (skärmdumpen) är inte svenska och försvinner.

**5. S1:s "Vad som hände": familjens beskrivning får stå, men meningen efter och fallet utan dominerande familj rättas.** Beskrivningen säger vad familjen är, vilket är rätt lärdom när tre missar ligger där. Text: `${info.namn}: ${kort med gemen}` följt av `' Familjen går att öva med riktade pass.'` ("Den går att öva bort" har inget subjekt). När ingen familj har minst två av missarna: titel `${Versal(talord(fel, 'en'))} missar, ingen familj sticker ut` (en miss: `En miss`), text `'Gå igenom dem, regeln och misstaget står på varje.'`; aldrig tempomeningen där (det är dagens fel i `resultat.ts` rad 265). Meningen på väggen (`R.sjonk`) blir villkorad på bandet från fråga 1: n missar med `band === 'over'`, n ≥ 2: `${Versal(talord(n))} av missarna var sträckuppgifter över din nivå. De räknas lätt mot dig och tungt för dig, och nivån rör sig högst 0,5 per pass.`; n = 1: `En av missarna var en sträckuppgift över din nivå. Den räknas lätt mot dig och tungt för dig, och nivån rör sig högst 0,5 per pass.`; n = 0: `En dag säger lite. Nivån rör sig högst 0,5 per pass, och genomgången säger mer än talet.`

**6. "Gör dagens grundpass gratis": okej, med ett tillstånd till.** Stämmer med 17.2 (ett grundpass dag 0). När grundpasset redan är gjort (`status.dagensPassGjort`) blir länken `PASS_COPY.knapp.tillbaka` och planraden "I dag: ett grundpass" får chippen `Klart` (ton) i stället för `Gratis`.

**7. Tempokortet och talet: nej, de ska räkna samma frågor.** Hon läser staplarna och genomgången; ett tal som räknar något annat än det hon ser, med en förklaringsmening efter, är precis den sortens gränssnitt vi tar bort. Beslut: på alla resultatskärmar betyder "över provets tid" alla besvarade frågor med `tid_s > budget_s` (tiden ute räknas, smakprovets svar med tid 0 räknas inte). `Avslut` får `over_budget: number` ur `slutforTraning`; `passResultat`, `matningResultat` och `ommatningResultat` visar `over_budget` i tredje talet, och `R.tempo.naraNivan` tas bort ur kortet (strängen kan stå kvar oanvänd tills copywritern städar). Motorns `tempo.over_tid` (nära nivån) står kvar som mått för kurvans form och mäts inte på skärmen. Hemvyns tempokort "över provets tid i går" (våg 2, `hem-copy.ts` `tempo.over`) läser samma `over_budget` ur `senastePass`, så P4 och hemvyn säger samma siffra; `tempo.meta` i hem-copy tas bort och `metaEget` kortas till `'Tiden per uppgift följer vårt provläge tills du anger leverantör.'`

**8. Generalrepetitionen i P4:s layout: ja, med tre rader som skiljer den.** Eyebrow `Generalrepetitionen klar` och topprad `Generalrepetition · sparad` står. Rubriken får vara nivåformen (punkten är riktig, 14.1 punkt 1). Meningen under talen blir `${f.namn ? `Samma format som ${f.namn}` : 'Vårt provläge'}, ${formatText(format)}. Punkten väger som en ommätning på kurvan.` i stället för familjemeningen. Primär handling som P4 (genomgången). "Vet inte" finns inte där, så genomgångens rader är bara `fel` och `tiden tog slut`.

**9. "Vet inte · N s": godkänd. Uppvärmningens avslut: omskriven.** Raden är rätt ("Vet inte" är ett utfall, tiden är tiden fram till trycket). `uppvarmning.klarText` blir `'Inget sparades, och inget mer behövs i dag. Stäng det här och öppna länken från rekryteraren när du är redo.'` ("Stäng mejlen och mobilen" sägs till någon som står med mobilen i handen och ska öppna ett mejl).

### 19.3 Våg 2:s fem frågor

**1. "Senast gjort 8 okt." för verbalt och numeriskt: rätt.** De har ingen nivå förrän passformen finns (3c, efter 3b), och ett tal som inte är jämförbart med matrisnivån ska inte stå i samma rad. Strängarna står; "Ej mätt" är reserverat för figurer och mönster och används aldrig för de andra två.

**2. Bara siffror eller bara text valt: hemvyn erbjuder det valda testet, aldrig matrismätningen som primär handling.** Nytt tillstånd `1t` i `hemvy.ts` när `testtyper` saknar `matris` (och inte är bara personlighet): väggen med rubriken ur rubriktabellen ("14 dagar till siffertestet"), raden `'Nivå, kurva och dagliga pass finns i dag för figurer och mönster. Siffror och text får pass senare.'`, ingen kurva och ingen plan. Lyft kort: eyebrow `Första passet`, titel `Gör siffertestet` eller `Gör texttestet`, text `'Resultat och genomgång direkt. Vi säger till när passen finns.'`, knapp `Starta siffertestet` eller `Starta texttestet` till befintligt test (dagskvoten som i dag). Båda valda: siffror först. Fler tester: figurer och mönster som rad `Ej mätt. Mät din nivå, 8 minuter.` med länk till mätningen, som i dag. Numeriska testets slutförandefel (1 av 9, `fix/kontaktepost-numeriskt`) rättas före 1t släpps; till dess står texttestet först även om båda är valda.

**3. Smakprovsraden: ja, motorn exponerar den.** `Traningsstatus.smakprov: { dag: Dag; antal: number } | null`, ur samma `lasSmakprov` som 14.5, bara när ingen mätning är gjord. 1a (och T1 med smakprov) visar under lyftkortets text raden `${Versal(talord(n))} frågor från smakprovet räknas in, så du svarar på ${talord(12 - n)} nya.`, och knappen `Mät min nivå, ${m} min` med `m = max(3, round((12 − n) × 40 / 60))`; titeln `Mät din nivå. Cirka ${m} minuter.` Utan smakprov som i dag.

**4. Råden på provdagen: generiska räcker, och Matrigma-raden tas bort.** "Klassisk Matrigma får inte pausas" är ett påstående om leverantörens produkt som vi inte har belägg för (14.4 verifierar formaten senare). `tystRumMatrigma` tas bort; alla format får `tystRumMeta`. `lattForstMeta` och `lattForstPerUppgift` står (de följer `tidsform`, som redan står med "cirka"). Formatspecifika råd skrivs först när 14.4 punkt 5 är gjord.

**5. "Nivå 5." med heltal avrundat nedåt: rätt**, samma regel som M1 (19.2 fråga 2). Dagsraden och kurvan har decimalen.

### 19.4 Annat jag såg

1. Betalväggskortet i M1: `betalvagg.text` tar formatnamnet: `..., hela kurvan och generalrepetitionen i samma format som ${namn}. Plus ...` när `status.format.namn` finns, annars `... i vårt provläge. Plus ...` (konceptet säger "i Matrigmas format"; regeln är "samma format som").
2. Dagsraden i 1b och 1g renderar "5 , 4" och "0 , 9" med luft runt kommatecknet (tabular-nums på kommat). Art-directors sak, men det ska bort före merge: kommat får inte vara tabulärt.
3. Hemvyns "Riktat pass"- och "Tempopass"-länkar syns i `1b` på det betalande kontot; på gratis ska de vara grå val med lås (17.2), kontrolleras i 1f/W3-skärmdumpen vid rättningen.
4. 15.9 gäller 3b:s genomgång: familjens namn, aldrig "svårighet N av 3". Inte kontrollerat i genomgångsvyn (`GenomgangVy`), tas med i rättningens skärmdump.
5. Mätpunkter: `pass_klart` får `band_ratt: {under, nara, over}` (antal rätt per band) så vi ser om 60/20/20 ger väntat 4 till 5 av 9 på egen nivå.

Efter 19.2 till 19.4 går 3b och 2 till `design/rummen` utan ny granskning från mig; skärmdump per ändrad vy i `docs/qa/rummen/vag-3b/efter-granskning/` och `vag-2/efter-granskning/`. Punkt 4 i 3a:s acceptans (fem personer under tio minuter) kvarstår som min innan `main`.

## 20. Art-director om våg 3b och våg 2

Datum 2026-10-11, kväll. Art-director efter `docs/qa/rummen/vag-3b/README.md` och skärmdumparna på `design/rummen-3b` (worktree `.claude/worktrees/rummen-vag3b`: P1 till P4, S1, M0, M1, M1 betalande, O1, K1, uppvärmningen, klickserierna) och `docs/qa/rummen/vag-2/README.md` med `hem/`, `ingang/` och `natfel/` på `design/rummen-2` (worktree `.claude/worktrees/rummen-vag2`). Pixel 7 och 1280, ljust och mörkt. Jämfört mot konceptets ramar och avsnitt 6, 13, 16, 17 och 18. Ingen kod är ändrad av mig. Ägaren har lämnat designbesluten till mig; det som rör testupplevelsen följer besluten i avsnitt 12, 14 och 15 och ändrar inget av testansvarigs villkor.

### 20.1 Helhetsomdömet

**Våg 3b håller konceptets premiumkänsla.** Passet är lugnt: toppraden med tema och "Dagens pass · nivå 5", tidsraden som fylls utan att räkna ner, matrisen på papper med lyft, sex alternativ med bokstav, det valda i bläck, det rätta i koppar med punkt, de fyra andra nedtonade och aldrig rött. Resultaten har väggens toning, ringen, rubriken i display, nivåskalan med "Nu 5,6", "från 5,4" och siktet, de tre talen, meningen, tempokortet lyft ur väggen, genomgången som rader, statusraden och foten. M1 har det stora heltalet, planen med punkter och chips, och paketkortet med kopparkant. K1 är exakt konceptet: märket på 132, eyebrow, h1, mening, glasknappen. Mörkt läge byter papper och golv, figurerna inverteras, kortet får sin kant. Det här är ritat av någon som läst konceptet.

Fyra saker drar ner och tas före merge: (1) betalväggen på M1 ligger i en fast fot ovanpå resultatet i stället för i paketkortet; (2) passets kolumn på 1280 är så bred att matrisen trycker alternativen under vecket; (3) regeln efter svaret hamnar bakom foten utan att rullas fram; (4) felstaplarna i tempokortet blir bruna i mörkt läge. Resten är småsaker.

**Våg 2 håller också.** 1b är konceptets 1b: datumrubriken, dagsraden i glas, veckoraden, kurvan med lyster, sikteband, planrad och axel, det lyfta Dagens pass-kortet, tempokortet, Var du tappar, Provdagen, Fler tester, Jobbsök-raden. 1c, 1d, 1e, 1g, 1p, T1, X1, L1 och F1 följer sina ramar, W1 är konceptets W1 med tre lyfta kort i första raden, ingången E1 till E3-P har valrutorna, chipsen med bläckkant, datumfältet och Hoppa över. Gratisnivån enligt 17.2 är inritad i 1a, 1f och W3 utan att något blev en tom graf. Två saker tas före merge: väggens h1 utan datum upprepar toppradens "Rekryteringstester", och kopparknappen i W3 bryts på två rader.

### 20.2 Byggagentens åtta frågor (våg 3b)

| # | Fråga | Beslut |
|---|---|---|
| 1 | Köpknappen på M1 (gratis) i den fasta foten | **Nej. Knappen bor i paketkortet, M1 har ingen fot för gratis.** Regel: **en betalvägg bär alltid sin egen knapp, och en fast fot ligger aldrig ovanpå en betalvägg.** M1 är ögonblicket båda köparna köpte i, och det fungerar för att hela resultatet läses före priset; en kopparknapp "Köp …" som står på skärmen från första bildrutan gör att "Din nivå 5" läses som en betalvägg, och med 17.2 blir det viktigare, inte mindre, att resultatet upplevs som en gåva innan priset kommer. Acceptans 3b.8 läses för M1 som "primär handling sist på sidan, inom en rullning". Paketkortet får `KNAPPRAD` med `KNAPP_PRIMAR` "Köp {paketNamn}, 149 kr i månaden" och `LANK` "Gör dagens grundpass gratis" (17.2:s text, copywritern har sista ordet). M1 betalande behåller foten ("Starta dagens pass" + länken), som P4 och O1. |
| 2 | Dator: passet 560 px, resultaten 640 px | **Resultaten 640: ja. Passet: nej, 400 px.** Med 560 blir matrisen 528 px hög och på 1280 × 900 syns bara A till C (`ram-P1-desktop-ljust.png`); mobilens krav "uppgiften i bild utan rullning" ska gälla datorn också. Kolumnen för matris, fråga och alternativ är `max-w-[400px]` på `lg` (matrisen cirka 400 inklusive 14 px padding, alternativen tre kolumner om cirka 120 px, det räcker för 3×3-brickor), toppraden, tidsraden och foten behåller 560 så X, räknare och knapp inte flyttar mellan fråga och resultat. Regelpanelen följer 400-kolumnen. |
| 3 | Nivåskalans etiketter som HTML över SVG:n | **Ja, och det är regeln för alla instrument:** SVG:n håller geometri, all text är HTML positionerad i procent (W1-kravet "aldrig skalad text"). Det löser också `KurvaTillfallig`s y-axel på 8 px; den byts ändå mot våg 2:s `Kurva` (README punkt 3). |
| 4 | Mörkt läge: figurerna inverteras | **Ja.** Konceptets `.mcell{stroke:var(--ink-2)}` och `.mfill{fill:var(--ink-1)}` säger samma sak: figurerna är bläck på papper, och bläcket följer läget. Vitt papper i ett mörkt rum vore ett ljusbord. **Och ja, det rättas överallt i inloggat före merge** (20.3 punkt 6): det gamla flödet med svarta figurer på mörkt papper är oläsligt, och 1b:s acceptans ("ingen osynlig text i mörkt läge") gick till `main` med det. |
| 5 | Regeln under alternativen, rullas in | **Ja, aldrig krympa matrisen.** En matris som krymper när svaret kommer är en layoutförskjutning mitt i förklaringen, och matrisen med det rätta svaret ifyllt är en del av regeln. Men rullningen ska vara ritad, inte bara finnas: när regelpanelen renderas rullas `main` så att panelens nederkant står 12 px ovanför foten (så mycket av alternativen som möjligt står kvar ovanför), 300 ms ease-out, `prefers-reduced-motion` hoppar. Flödeskroppen får `padding-bottom` lika med fotens höjd (`--flow-footer-h`) så att hela panelen går att rulla fram; i `ram-P2-pixel7-ljust.png` ligger regeln bakom foten. |
| 6 | Tabellsiffror av för de tre talen | **Ja, för de tre talen.** De står på egna rader och ska inte linjera lodrätt; glappet i "+0,2" väger tyngre. `tabular-nums` står kvar där siffror byter plats under läsning: tidsraden "0:38", räknaren "3 / 9", talen i dagsraden och planens datum. |
| 7 | "Tillbaka till Rekryteringstester" på K1 | **Behålls.** Rummet heter så (17.1), och "Tillbaka till testerna" vore ett tredje namn. 15 px i 600 ryms på en rad ned till 360 px. Samma sträng i O1:s fot och som länk i M1 betalande. |
| 8 | O1 utan milstolpe: statusraden blir lyftkortet | **Nej. En statusrad lyfts aldrig.** Utan milstolpe är det lyfta kortet "Var du tappar" ur ommätningen (samma komponent som i M1, eyebrow "Var du tappar nu", raderna med "mot 6 okt" där familjen fanns i mätningen), och statusraden står kvar som rad. En ommätning ger samma data som en mätning; det är det som ska lyftas. |

**Byggagentens egna val som fastslås:** uppvärmningen utan tidsrad och med raden "Ingen tid, ingen nivå, inget sparas"; M0:s underrad "Fem räknas från smakprovet" och räknaren "1 / 7"; "Vet inte · 0 s" i fixturen (i drift är det tiden fram till trycket, 12.1); P4:s "Måndag: samma familj, ett steg svårare" (14.7); S1:s mening; sidomenyn synlig i passet på dator (FlowShell-regeln från 1b); "Dagens pass · sparat" som topprad i resultaten.

### 20.3 (a) Våg 3b före merge

Allt är utseende, strängar och en CSS-klass; ingen funktion, kvot eller route ändras. Grindar som 1b: `tsc`, `vitest`, `grep-rummen --vag 3b`, kontrast, perf på P1/P4/M1/O1 (O1 ligger på 1 960 ms och får inte gå över 2 000 när kurvan byts), skärmdump per ändrad vy i `docs/qa/rummen/vag-3b/efter-granskning/`, Pixel 7 och 1280, ljust och mörkt.

1. **M1 gratis** (`MatningResultatVy.tsx`): ingen fot. Paketkortet får `KNAPPRAD` med `KNAPP_PRIMAR` "Köp {paketNamn()}, 149 kr i månaden" och `LANK` "Gör dagens grundpass gratis". Kortet är sista elementet på golvet. M1 betalande oförändrad.
2. **Passets kolumn på dator** (`PassShell.tsx`, `PassFraga.tsx`): innehållskolumnen (matris, frågetext, alternativ, regelpanel) `lg:max-w-[400px]`; topprad, tidsrad och fot kvar på 560. Kontroll: på 1280 × 900 står alla sex alternativ och "Vet inte, visa regeln" i bild utan rullning i P1 och M0.
3. **Regeln rullas fram** (`PassFlode.tsx`): när `Regelpanel` monteras, rulla `main` så att panelens nederkant står 12 px ovanför foten, `behavior: 'smooth'`, `prefers-reduced-motion` ger `auto`. Flödeskroppen får `pb-[var(--flow-footer-h)]`. Kontroll: `klick-pass-*-02` visar hela regeln och misstagsraden ovanför knappen.
4. **Staplar** (`Staplar.tsx`): fel svar ritas **ihåligt** (1,5 px kant i stapelns färg, ingen fyllning), inte med opacitet. Över tiden = fylld koppar, fel och över tiden = ihålig med kopparkant, rätt inom tiden = fylld `ton-ink` 0,75. Axeltexten "ljusa staplar: fel svar" blir "ihåliga staplar: fel svar" (S1); "streckad linje: provets tid" står kvar (P4). Skälet: koppar på 0,35 är persika i ljust och brunt i mörkt läge (`ram-S1-desktop-morkt.png`), och "ljusa" är fel ord i mörkt läge. Ihåligt är redan kurvans språk för "inte gjord".
5. **Tabellsiffror** (`ResultatSkal.tsx`, de tre talen): `tabular-nums` bort från talen, kvar på räknaren, tidsraden och planens datum.
6. **`.matrisyta` överallt i inloggat**: klassen sätts på matrisytan i `MatrixTestSession`/`QuestionGridV7`/`AnswerOptionsV7`, `MatrixQuestionReview`, provläget och resultatsidorna för grund/avancerad/expert, så att figurerna följer bläck och papper i mörkt läge. Smakprovet på publika sidor rörs inte (Tråden, inget mörkt läge). Skärmdump av `tester/[slug]/test`, `results` och provläget i mörkt läge.
7. **O1 utan milstolpe** (`OmmatningResultatVy.tsx`): lyftkortet är "Var du tappar" (komponenten ur M1) när `milstolpe` saknas; statusraden lyfts aldrig. Fixturen får en O1-variant utan milstolpe och skärmdumpas.
8. **Etiketter på instrumenten**: `Nivaskala` får regeln för krock: när |nu − sikte| < 1,2 nivåer skrivs siktet in i nu-etiketten ("Du 6,4 · sikte 6,5") och sikttexten ovanför tas bort, triangeln står kvar. Gäller 1d i våg 2 (`hem/1d-pixel7-ljust.png`: "Du 6,4▾ Sikte 6,5" går ihop).
9. **Genomgångens räknare**: efter "Gå igenom de två missarna" visar `GenomgangVy` "1 / 7" (`klick-pass-ljust-08`). Räknaren ska vara "1 / 2" över missarna och därefter "Fortsätt med de sju rätta" som sekundär länk, eller så heter knappen "Gå igenom passet" och räknaren "1 / 9". Byggagenten väljer, men knapp och räknare ska säga samma sak.
10. **`KurvaTillfallig` byts mot våg 2:s `Kurva`** i O1 (README punkt 3), i samma PR; merge-ordningen i 20.6 gör det möjligt.

### 20.4 (b) Våg 3b senare

1. Provläget (`MatrisProvSession`) i rummets utseende med nedräkning (16.4 våg 2 punkt 5) när provläget byggs om.
2. Misstagsraden under regeln (15.7) visas så snart `misstag` finns i banken; Regelpanel är redan byggd för det.
3. `pass_klart` och `vet_inte_tryckt` avläses fyra veckor efter släppet (avsnitt 7); om "Vet inte" trycks på över 30 procent av frågorna flyttar länken från foten till under alternativen med mindre vikt.
4. Paketnamnet "Hela paketet" i M1, 1f, W3 och låschipen följer `paketNamn()` i våg 5 (17.4); inget rörs här.

### 20.5 Våg 2: de fyra frågorna, två krockar och ändringslistan

| # | Fråga | Beslut |
|---|---|---|
| 1 | Siktets etikett flyttar under linjen vid krock med senaste punktens tal; "i dag" utelämnas på axeln nära slutdatumet | **Etiketten: ja.** Punktens tal vinner, siktet lägger sig under den streckade linjen, högerställt (`hem/1c-pixel7-ljust.png` är rätt). **Axeln: nej, "i dag" vinner alltid.** Det är axelns enda ord i koppar-ljus och kurvans ankare; datumet finns redan i toppraden och i h1. Prioritet när etiketter krockar: i dag, start, slut, mittpunkt. I 1c faller "24 okt" bort, inte "i dag". (Konceptets 1c hade samma krock inritad; det är konceptet som var fel.) |
| 2 | Dator: tempokortet och Var du tappar lyfts bredvid det lyfta kortet, rubriken flyttar in i kortet | **Ja, det är W1** (konceptrad 1497 till 1506). Regel för alla hemvyns tillstånd på dator: **första raden på golvet består bara av lyfta kort, en till tre, och sektionsrubriken blir kortets eyebrow (`eyebrowTon="neutral"`). Statusrader lyfts aldrig; de står i andra raden.** Ett kort vars knapptext inte ryms på en rad spänner två kolumner (konceptets 1a på dator, rad 1565). Rättas i 1c (Repetera svagheten och Fler tester lyfts med eyebrow, statusraden ned), T1 (statusraden "Inget datum än" ned under kortet) och F1 (Fler kurvor lyfts med eyebrow). |
| 3 | Väggens h1 utan datum = "Rekryteringstester" | **Nej.** I 1h, T1 och X1 står ordet två gånger på 60 px (toppradens brand och h1), samma fel som eyebrowen i 16.3.3. **Regel: h1 upprepar aldrig toppradens brand.** Utan datum: T1 h1 "Träna inför ditt rekryteringstest" (ägarens rad i 17.1, ordagrant) med raden "Börja med att mäta var du står. Sätt ett datum när du vet det, så räknar vi bakåt."; 1h h1 "Ett pass om dagen" med raden "Nivå 5. Fyra dagar i rad. Dagens pass är kvar."; X1 h1 "Träna inför ditt rekryteringstest" utan rad. 1i och 1p oförändrade (rubriktabellen). Strängarna i `rubrik.ts`; copywritern har sista ordet på orden, inte på regeln. |
| 4 | 1a gratis: grå passdagar med meningen "Grå platser ingår i paketet…" | **Rätt lösning.** Det är sanningen enligt 17.2 och det ägaren vill mäta (mätning till vägg). Två rättelser: meningen får inte säga "Ihåliga märken är planerade dagar" när märkena är grå och fyllda; för gratis lyder den "Din första punkt på kurvan kommer efter mätningen. Grå platser ingår i {paketNamn()}: passen från dag två, ommätningen och generalrepetitionen." och för betalande konceptets mening. Paketnamnet kommer ur `paketNamn()` redan nu, så "Jobbcoach Premium" följer med i våg 5 utan omritning. |

**Krockarna.** `Nivaskala.tsx`: **3b:s fil gäller** (3b äger den), med krockregeln i 20.3 punkt 8; 1d skärmdumpas om efter merge och ska se ut som nu. `Dagsring.tsx` (ring-klassen döpt till `dagsring` i båda): **våg 2:s fil gäller**, eftersom ringen är fotograferad i 1b, 1c, 1g och 1h och stämmer med 16.2 fråga 4; 3b:s `PassResultatVy` använder den som den är. Skiljer sig filerna bara i klassnamnet spelar valet ingen roll, men det är 2:s som mergas.

**(a) Våg 2 före merge**, samma grindar som 1b, skärmdumpar i `docs/qa/rummen/vag-2/efter-granskning/`:

1. **h1 utan datum** enligt fråga 3 (`rubrik.ts`, `hem-copy.ts`). Skärmdump T1, 1h, X1.
2. **W3 på dator** (`Hemvy.tsx`): kopparknappen "Köp Hela paketet, 149 kr i månaden" bryts på två rader i tredjedelskolumnen (`hem/W3-desktop-ljust.png`). Kortet spänner två kolumner (`lg:col-span-2`), Var du tappar i tredje, Provdagen-raden i andra raden. Regel i `knappar.ts`: `KNAPP_PRIMAR` får `whitespace-nowrap`; ryms inte texten är det layouten som ändras, aldrig knappen som bryts. Okulär kontroll i W1 till W4.
3. **Första raden på dator** enligt fråga 2 i 1c, T1 och F1 (`Hemvy.tsx`, `Helkurva.tsx`).
4. **Axelns prioritet** enligt fråga 1 i `Kurva.tsx` ("i dag" står alltid). Skärmdump 1c och 1e på båda bredderna.
5. **1a-meningen** enligt fråga 4 i `hem-copy.ts`, med `paketNamn()`.
6. **Nivåskalans krock** (20.3 punkt 8) verifieras i 1d efter merge av 3b:s fil.

**(b) Våg 2 senare:** tempokortets etiketter på mobil ("över provets tid i går" bryts på två rader i 1b) ses över av copywritern till kortare ord ("över tiden i går"); "Grå platser"-meningarna och låschipen byter paketnamn i våg 5 genom `paketNamn()`; `Resultatvy` för de klassiska testerna (16.4 våg 2 punkt 3) ligger kvar som egen omgång eftersom den inte ingick i uppdraget.

### 20.6 Merge-ordning

`design/rummen-2` mergas in i `design/rummen` först (3b:s adresser i `rutter.ts` är 2:s), därefter `design/rummen-3b` ovanpå med 2:s `Dagsring.tsx` och 3b:s `Nivaskala.tsx`, och `KurvaTillfallig` bort i samma commit. En gemensam PR mot `main` för 2 + 3b efter att ägaren kört migreringarna `20261011100000_test_planer.sql` och `20261011101000_testmotorn.sql` och E2E-skripten (`qa-rummen-vag2-prod.mjs`, `qa-rummen-vag3b-prod.mjs`) gått mot riktig data. Jag granskar `efter-granskning/` för båda vågorna i en omgång; det tar en timme.
