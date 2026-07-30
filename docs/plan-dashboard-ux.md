# Rapport: Dashboard-omgörning för aktivering och orientering

*Framtagen 2026-07-30 med tre parallella agenter: kodkartläggning, mobile-first UX-audit och designgranskning med SVG-program. Designväktarens fullständiga visuella rapport: https://claude.ai/code/artifact/800e3794-2952-4cf6-8af3-d2031ef2f4c8. Inget är implementerat ännu.*

Syfte: alla användare ska direkt förstå var de är, vad de kan göra och vad nästa steg är. Mobile-first, utmärkt på desktop, i husets stil med custom SVG:er.

## Kärndiagnosen i en mening

Dashboarden har FYRA konkurrerande rekommendationssystem (OnboardingDag2 "Tre verktyg", DiscoverByRecruitersCard, Snabbåtgärder och sidebarens FeatureSpotlight) som körs oberoende med egna dismiss-tillstånd, samtidigt som den mest handlingsbara sektionen (Snabbåtgärder) ligger under vecket och den största visuella ytan (streak-bannern, ~260px gradient) visar svag data som "1 dag i rad, 0 XP".

## Nulägesfynd (verifierade i kod)

- **Renderingsordning** (`src/app/dashboard/page.tsx:285-320`): OnboardingHero → OnboardingDag2 → DiscoverByRecruitersCard → StreakHero → CvStatusCard → Snabbåtgärder → Senaste aktivitet. Kort 2+3 kan visas samtidigt: tre säljblock före första åtgärdsknappen.
- **"Tre verktyg" är statiskt och dödsdömt**: hårdkodad array, gated på `rewardClaimed`, försvinner för alltid vid dismiss (`localStorage`). Samtidigt finns en färdig personaliseringsmotor (`useUnusedFeatures.ts`, prioritetsordnad, aktivitetsbaserad) som bara sidebaren använder.
- **Hälsningen är dold på mobil** (`header.tsx:109`, `hidden lg:flex`): mobilanvändaren ser aldrig sitt namn.
- **5 snabbåtgärdskort i 4-kolumnsgrid**: ensamt kort på rad 2 vid två brytpunkter.
- **"Aktivt CV" lovar mer än det håller**: `activeCvName`-prop finns men skickas aldrig in; visar alltid "{n} sparade CV".
- **Senaste aktivitet**: ingen dedup/gruppering; varje tabell hämtar 5 rader och toppen kapas till 5, så en enda typ kan fylla listan; länkarna är generiska routes, inte deep links; saknar aktivitetstyper för Sökta tjänster/Bli upptäckt; svagaste tomläget i produkten.
- **Tablet-spannet 640-1023px renderas som minsta mobil** i StreakHero, OnboardingDag2, DiscoverByRecruitersCard och Bli upptäckt-sidan (hoppar 1 kolumn → `lg:`).
- **Nya funktionerna saknar status-närvaro**: Sökta tjänster syns bara som snabbåtgärdskort (ingen "12 sökta · 3 väntar svar", ingen uppföljningsnudge, ingen AF-rapportpåminnelse runt den 1:a). Bli upptäckt-kortet försvinner permanent efter aktivering utan att ersättas av "din profil är synlig, 2 intresserade".
- **Teknisk skuld**: CV-count hämtas 3 gånger oberoende, streak 2 gånger; blockerande helsidesspinner väntar på långsammaste av 7 anrop (trots färdig `loading.tsx`-skeleton); `OnboardingReward` gör `window.location.reload()`; STEPS-arrayen duplicerad mellan `OnboardingHero` och `kom-igang/page.tsx`; ~15 debug-`console.log` i `OnboardingContext`; död kod (`CvStatusCard` variant A + 7 oanvända komponenter: `MonthlyActivityCard`, `FeatureSection`, `CompactPremiumCard`, `PremiumCard`, `FloatingParticles`, `SparkleEffect`, `LoadingSkeleton`).

## Prioriterad åtgärdslista

### P0: Snabba vinster (levereras på en dag)
1. **Fixa snabbåtgärds-gridet**: byt till `grid-cols-3` på desktop och lägg till **Bli upptäckt som sjätte kort** → 3+3 jämnt, och den nya funktionen får permanent plats. (Liten)
2. **"Aktivt CV"**: koppla in senast använda CV:ts namn, eller döp om till "Dina CV". (Liten)
3. **Hälsning på mobil**: kompakt "Hej, {förnamn}" i mobilheadern. (Liten)
4. **`md:`-brytpunkter** i de fyra komponenter som hoppar 1 kolumn → `lg:`. (Liten x4)

### P1: Ett "Nästa steg"-system (kärnan i omgörningen)
Ersätt OnboardingDag2, DiscoverByRecruitersCard och FeatureSpotlight med EN modul, `NastaSteg`, driven av en ny hook `useNextBestAction()` som samlar signalerna från `useOnboarding()`, `useCandidateInterests()` och `useUnusedFeatures()`. Visar högst ETT kort, rankat:
1. Onboarding pågår → stegindikator (som i dag)
2. CV saknas → CV-uppmaning
3. Oprövad nyckelfunktion → ETT personaliserat kort (inte tre statiska)
4. Loggade ansökningar utan svar 14+ dagar → uppföljningsnudge
5. Profil ej synlig + komplett CV → Bli upptäckt
6. Etablerad aktiv användare → modulen döljs helt, ytan går till Snabbåtgärder

Sidebaren slutar duplicera rekommendationen. (Stor insats, men P2/P3 blir enklare ovanpå detta.)

### P2: Trappa ner streaken, lyft Snabbåtgärder
- **Snabbåtgärder får förstaplatsen** med asymmetrisk vikt: ett större "rekommenderat nu"-kort + normalstora kort (samma mönster som OnboardingHero redan använder).
- **StreakHero → kompakt remsa** (flamma, streak-tal, level-chip, veckans momentum-remsa) vid låga värden; den stora firande gradientvarianten sparas till milstolpar (dag 7/30).
- **Kvoter/premium bryts ut** till en egen liten "Din status"-widget (faktainfo, inte gamification).
- **Gradientregeln**: den fulla 3-stegsgradienten (F97316→DC2626→BE185D) reserveras för EN primär handling per vy (i dag används den identisk på 8+ ytor samtidigt). Inför CSS-variabler `--jc-gradient-hero`/`--jc-gradient-soft` (gradienten är i dag hårdkodad i 10+ filer med driftande stopp). (Mellan-stor)

### P3: Statusnärvaro för nya funktionerna + hygien
- **Sökta tjänster-widget** (vid 3+ loggade): "12 sökta · 3 väntar svar" + nudge "3 ansökningar utan svar i över 2 veckor, följ upp?" + AF-rapportpåminnelse den 25:e till 14:e ("Sammanställ juli på 30 sek"). Data finns redan i stats-RPC:n.
- **Bli upptäckt-widget** (efter aktivering): "Din profil är synlig · 2 rekryterare har visat intresse" (data från `useCandidateInterests` som i dag bara driver meddelandeikonen). Båda widgetarna rankas in i NastaSteg-systemet, inte som nya fristående block.
- **Senaste aktivitet**: gruppera upprepningar ("CV nedladdat 3 gånger"), deep links till resursen, nya aktivitetstyper (`application_logged` m.fl. finns redan), "Visa alla"-länk, nytt tomläge (SVG 4 nedan), mall-swatch (SVG 6).
- **Städning**: död kod bort, en CV-count-källa, sektionsvis laddning i stället för blockerande spinner, ersätt `window.location.reload()` med state-invalidering, konsolidera STEPS-arrayen, rensa console.logs.
- **Indigo-regeln skrivs ner**: indigo (#4F46E5) används uteslutande för rekryterarytan (Bli upptäckt, meddelanden), aldrig annars.
- **MobileBottomNav**: ingen ny flik nu; mät användning av Sökta tjänster först, ev. badge på Hem-fliken när ny statuswidget väntar.

## SVG-illustrationsprogrammet (7 st, beställs styckvis)

Stilregler (gäller alla): endast husets tre gradienter (warm F97316→DC2626, deep DC2626→BE185D, soft FFEDD5→FED7AA); djup i lager, aldrig drop-shadow-filter; inga emoji, ALDRIG Sparkles (husets fyrspetsiga stjärna från OnboardingIcons används för "AI"); platt geometrisk vektor; eget Defs-prefix per fil; viewBox-skalan 24/32/48/96/120-200 enligt befintlig konvention.

| # | Illustration | Placering | Prio |
|---|---|---|---|
| 1 | **Streak-flamma, milstolpe-variant**: bygg på befintliga `IconEld` (3 flamlager) + glödring och gnistor vid dag 7/30. Ersätter uppskalade Lucide `Flame` som bakgrund i StreakHero (produktens enda handritade eld syns i dag bara vid 14px!) | StreakHero bakgrund + milstolpe-toast | Hög |
| 2 | **Veckans momentum-remsa**: 7 rundade dagrutor, warm-fyllda för genomförda dagar | Under streak-talet i nya kompakta remsan | Medel |
| 3 | **Level-crest**: sköldmärke med ädelsten, ersätter Lucide `TrendingUp` i level-pillen | StreakHero-eyebrow | Medel |
| 4 | **Tomläge "Här dyker din aktivitet upp"**: solfjäder av tomma aktivitetskort + pulsprick, samma ribba som EmptyLetterIllustration | DashboardSenasteAktivitet EmptyState | Hög |
| 5 | **Premium-mikrobadge**: krona/timer i IconKvotorPremiums språk, 20-24px | Header-chippen "1 dag" | Medel |
| 6 | **Mall-swatch**: 14x14 färgruta per CV-mall bredvid nedladdningsikonen | Aktivitetsraderna | Låg |
| 7 | **Radar-chip**: mikroformat av RecruiterRadar (indigo, enligt indigo-regeln) | Bli upptäckt-statuswidgeten | Medel |

## Tre premium-detaljer (billiga, stor känsloeffekt)

1. **Kvittera state-förändringar**: när streak-siffran ökar, Framer Motion key-remount med scale 1→1.15→1 + kort varm glöd. Siffror som bara byts känns som data; siffror som firar känns som produkt.
2. **Två nivåer av tomrum**: 32-40px runt hero-ytor, 12-16px mellan listrader, i stället för en enda rytm.
3. **Samma hover-kontrakt överallt**: `hover:-translate-y-0.5` + skuggfördjupning, 150-200 ms, på varje klickbar kortyta (inte bara knappen inuti).

## Förslag på etappindelning

- **Etapp A** (P0): grid, Aktivt CV, mobilhälsning, md-brytpunkter. Ingen arkitektur, direkt synlig förbättring.
- **Etapp B** (P1 + SVG 1+4): NastaSteg-systemet + de två Hög-prioriterade illustrationerna.
- **Etapp C** (P2): streak-nedtrappning, Snabbåtgärder först, gradientregeln, SVG 2+3+5.
- **Etapp D** (P3): statuswidgetarna, aktivitetslistan, städning, SVG 6+7.

Mätpunkter före/efter: andel användare som klickar en snabbåtgärd inom 30 sek från landning, aktiveringsgrad för jobbmatchning/Sökta tjänster/Bli upptäckt, samt scroll-djup på mobil.
