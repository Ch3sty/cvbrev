# Byggspec: Rummen

Datum 2026-10-10. Författare: art-director (Fable). Mottagare: Opus 5.5-byggagenter, testansvarig (godkänner specen före bygge), svensk-ux-copywriter (strängarna i avsnitt 9), saas-lead (vågordning och mätning). Status: **godkänd av testansvarig 2026-10-10 för våg 1a och 1b** (avsnitt 12), med krav på våg 2, 3a och blandningsfixen. **Våg 1a byggd och granskad 2026-10-10 sent; art-directors beslut efter granskningen står i avsnitt 13 och är inarbetade i avsnitt 1, 2, 3 och 6.**

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
