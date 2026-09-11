# Plan: Konverteringsomgången

> Beslutad 2026-09-11. Bygger på konverteringsrevisionen samma dag (fyra
> specialistgranskningar mot verklig kod, Supabase prod och GSC). Ersätter
> de delar av `docs/retention-plan.md` som ännu inte genomförts (Fas 1.1
> e-postväggen, 1.2 aha-momentet, 1.3 onboarding).

## Utgångsläge

304 konton, 3 riktiga betalande, cirka 450 kr MRR. Senaste 90 dagarna: 76 nya
konton, 43 verifierade, 36 med CV, 16 med brev, 4 trials, 1 betalar idag.
Organisk trafik växer (3 till 20 klick per dag juni till september) men 85
procent landar på artiklar och exempel, inte på produktsidor.

Fyra strukturfel som förstärker varandra:

1. Den färdiga leveransen är gratis. Brevnedladdning saknar premiumkontroll
   helt, CV-export spärrar bara mallar, analysen visas i sin helhet. Prissidan
   säger själv att ingen behöver uppgradera.
2. Enda vägen till Premium är en kortkrävande trial i tre steg. 5 procent tar
   den. Under trial-knappen på startsidan står "Inget kreditkort krävs".
3. Aktiveringsläckan från juni finns kvar: e-postvägg, ingen Google-login,
   dashboarden är en meny, testsegmentet (40 procent av nya konton) möter
   aldrig CV, brev eller pris.
4. Noll livscykelmail har någonsin skickats. Spårningen som skulle avslöja det
   är trasig (`first_*`-kolumner sätts aldrig, inga PostHog-events).

## Fattade beslut

Principen byts från "gratis att göra allt, betala för mer" till **gratis att
skapa, betalt att ta ut**. Skärmen är gratis, filen kostar.

| Område | Beslut |
|---|---|
| Brevnedladdning (PDF/Word) | Kräver Premium. Visning och kopiera till urklipp gratis. |
| Brevkvot gratis | 1 per dag (från 2). All copy säger "ett brev om dagen". |
| CV-export | En gratis nedladdning per konto, sedan Premium. Befintliga konton får en var. |
| CV-analys | Poäng, sammanfattning och de tre viktigaste fynden gratis. Resten låst, serverside. |
| Tester | Oförändrad kvot (1 per dag och nivå). Premium-krok efter tredje sessionen samma dag. |
| Reverse trial | Alla nya konton får 5 dagar full Premium vid registrering, utan kort. Nedgradering dag 6. `premium_source = 'signup_trial'` (Google: `'oauth_signup_trial'`). |
| Kortkrävande trial | `/trial-signup` finns kvar för varma leads, länkas från FAQ på prissidan. Inte som eget kort. |
| Prisstege | Dagspass 49 kr (24 h, engångs), Jobbsökarveckan 99 kr (7 dagar, engångs), Månad 149 kr, Kvartal 299 kr (99 kr/mån). |
| Registrering | Confirm email av i Supabase. Google-login. Tre fält. Turnstile mot bottar. |
| Dashboard | Görs om till tre tillstånd med en primär handling per vy. Kom-igång-sidan tas bort. |
| Onboarding-belöning | Ett steg (CV uppladdat), auto-claim, belöning i XP (inte premium-dagar). |
| Design | Linear/Vercel-uttryck: border i stället för skugga, `rounded-xl` max, `font-semibold` max, en orange yta per skärm. Egen SVG-familj ersätter lucide-i-gradientruta. `Sparkles` rensas i eget svep. |
| Hero | Primär CTA "Skapa konto och få 5 dagar Premium" till `/register`. Ingen sekundär knapp. Trust-rad "Inget kreditkort · Avsluta när du vill". |

## Vad ägaren gör utanför koden

**Stripe.** Skapa produkter med priser. Lägg metadata `grant_days` på engångsköpen.

| Produkt | Belopp | Typ | Intervall | Env-variabel |
|---|---|---|---|---|
| Jobbcoach Premium Dagspass | 49 SEK | one_time, metadata grant_days=1 | | `STRIPE_PRICE_DAYPASS` |
| Jobbcoach Premium Jobbsökarveckan | 99 SEK | one_time, metadata grant_days=7 | | `STRIPE_PRICE_WEEK` |
| Jobbcoach Premium Månad | 149 SEK | recurring | month | `NEXT_PUBLIC_STRIPE_PRICE_ID` (finns) |
| Jobbcoach Premium Kvartal | 299 SEK | recurring | every 3 months | `STRIPE_PRICE_QUARTER` och `NEXT_PUBLIC_STRIPE_PRICE_QUARTER` |
| Kupong `retention_49_2m` | 100 kr rabatt (amount_off 10000 SEK) | repeating, 2 månader | | används i cancel-flow |

Webhook-events som måste vara aktiverade i Stripe: `checkout.session.completed`,
`customer.subscription.created/updated/deleted`, `customer.subscription.trial_will_end`,
`invoice.payment_failed`.

**Supabase Auth.** Slå av "Confirm email". Aktivera Google-provider (client id/secret
från Google Cloud, redirect `https://<projekt>.supabase.co/auth/v1/callback`).
Kontrollera att "automatic linking" av samma e-post är på. Verifiera att triggern
som skapar `profiles`-raden på `auth.users` läser både `full_name`, `name` och
`avatar_url` ur `raw_user_meta_data`.

**Resend.** Sätt `RESEND_WEBHOOK_SECRET` i Vercel, slå på open- och click-tracking
för domänen, kontrollera SPF/DKIM/DMARC.

**Cloudflare Turnstile.** Skapa site key för registreringsformuläret.

## Designsystem (gäller alla spår)

Fullständig spec i `docs/designsystem.md` (skapas i spår E). Kortversionen:

- **Spacing** endast 4/8/12/16/24/32/48 (Tailwind 1/2/3/4/6/8/12). `space-y-6` på dashboard, `space-y-12` publikt.
- **Radier** `rounded-lg` knappar och inputs, `rounded-xl` kort. `rounded-2xl` och `rounded-3xl` utgår i dashboard och paywall.
- **Border, inte skugga** på kort. Skugga bara på svävande element (dropdown, modal, sticky CTA).
- **Orange är accent, inte yta.** Max en fylld orange yta per skärm: den primära knappen. Orange bakgrunder, orange ramar på alla kort och gradient-strips i korttoppar utgår. Neutralt är `neutral-200` ramar, `neutral-600` sekundärtext.
- **Typografi**: sidrubrik `text-2xl font-semibold tracking-tight`, sektion `text-lg font-semibold`, kort `text-base font-semibold`, brödtext `text-sm text-neutral-600`, siffror alltid `tabular-nums`. `font-black` utgår.
- **Knappar** `h-11`. Primär `bg-orange-600 text-white rounded-lg`. Sekundär vit med `border-neutral-200`. Tertiär textlänk. Gradient bara på prissidans primärknappar och dashboardens enda primära handling.
- **Rörelse**: entré opacity 0 till 1, y 8 till 0, 200 ms. Hover på kort ändrar bara `border-color`. `whileHover scale` och `-translate-y` utgår från kort.
- **Mobil först** vid 375 px. Träffytor 44 px. Ingen horisontell body-scroll.
- `tailwind.config.js` får orange-skalan som namngivna färger så hex i `style={{}}` kan fasas ut.

### SVG-illustrationssystem

Repot har cirka 340 SVG-komponenter i 30 `illustrations/`-mappar med kopierade
`Defs`-block. Uppgiften är att lyfta ut primitiverna och rita de som saknas, inte
att rita om allt.

- `src/components/illustrations/primitives.tsx`: `IlluDefs`, `useIlluId` (unika gradient-id via `useId()`, dagens hårdkodade id kolliderar vid dubbel rendering), `IlluProps { className, size }`.
- **Fyra färgroller**, inga fria hex: `--illu-line` = `currentColor`, `--illu-fill` (#FFFFFF / #1D1B18 dark), `--illu-accent` (#F97316 / #FB8A3C), `--illu-soft` (#FFEDD5 / #2A1D12). Definieras i `globals.css` på `:root` och under `prefers-color-scheme: dark`.
- Röd-till-rosa-gradienten (`-deep`) pensioneras i produkt-UI. Får leva kvar i artikelbilder 1200×630.
- **Linjetjocklek per viewBox**: 24 → 1.5, 48 → 2, 96 → 3, 240 → 6. `stroke-linecap/linejoin: round`.
- **Hörnradie** 8 procent av viewBox (2 / 4 / 8 / 20).
- **Max en gradient** per illustration, bara på accentelementet. Aldrig på kontur, aldrig som bakgrundscirkel. Gradientcirkeln bakom motivet utgår helt.
- Aldrig `fill="white"` hårdkodat. `aria-hidden`, `focusable="false"`, inga animationer i SVG (Framer på wrappern).
- Konsolidering av `Defs` sker en mapp i taget, bara i filer som ändå rörs.

## Spår A: Monetisering

### A1. Serverside-gate på brevnedladdning
- `src/app/api/letters/download/route.ts`: efter auth, `userHasPremiumAccess` (`src/lib/supabase/premiumAccess.ts`). Ej premium → `402 { error: 'premium_required', feature: 'letter_download' }`.
- Ny `src/components/letters/LetterDownloadGate.tsx`, bygger på `PaywallCard variant="nedladdning"` (spår E). Renderas **under** det fullt synliga brevet. "Kopiera text" förblir öppen. Fånga `res.status === 402` i fetch-hanteraren och rendera gaten inline.
- Acceptans: gratis får 402 oavsett format, premium/admin/`premium_until` i framtiden får filen, brevtexten syns i sin helhet.

### A2. CV-export: en gratis per konto
- Migration: `alter table profiles add column free_cv_exports_used integer not null default 0`.
- `src/app/api/cv/generate-formatted/route.ts` efter malltier-kontrollen (rad ~2282): premium → tillåt utan räkning. Annars `>= 1` → 402 `feature: 'cv_export'`. Annars generera och öka räknaren **efter** lyckad generering, atomiskt (`update ... where free_cv_exports_used = 0`). Räkna aldrig upp vid fel.
- `src/components/cv/CVExportOptions.tsx`: rad "Din första nedladdning är gratis." vid 0, annars `PaywallCard variant="cv-export"`.
- Acceptans: nytt gratiskonto exporterar exakt ett CV. Admin rör aldrig räknaren (premiumkontroll först).

### A3. Kvotsänkning
- `src/lib/quota/quotaService.ts` rad 26: `DAILY_LIMIT_LETTERS = 1`.
- All copy: "1 personligt brev per dag" i `priser-data.ts` (FREE_HIGHLIGHTS, COMPARISON), kvotvyer, mail.
- Kvotvyerna byts till `PaywallCard variant="kvot"` (uppgradering primär, "Påminn mig imorgon" som textlänk, `POST /api/quota/remind`-logiken behålls).

### A4. Reverse trial
- Ny `src/app/api/auth/grant-signup-trial/route.ts` (service role). Anropas från `register-form.tsx` direkt efter lyckad `signUp` och från Google-callbacken (B2) vid nyskapat konto. Aldrig från `src/app/invite/[code]/page.tsx` (gäster har egen premium).
- Validering: användaren är den nyss skapade (session eller konto yngre än 60 s). Idempotent: avbryt om `premium_source` redan satt, `subscription_status in ('active','trialing')` eller `premium_until` i framtiden.
- Sätter `subscription_tier='premium'`, `premium_until = midnatt svensk tid + 5 dygn + 7 h` (så mail dag 4 och nedgradering ligger i rätt ordning), `premium_source='signup_trial'` / `'oauth_signup_trial'`, `subscription_status=null`.
- Nedgradering: befintligt premium-expiration-block i `pricing-sync` täcker raden (status null passerar skyddsfiltret). Ingen kodändring, men verifiera. Nedgradering sker vid nästa cron-körning (00:00 eller 06:00 UTC).
- In-app: `TrialStatusRow` (spår E) dag 1-5, `PaywallCard variant="nedgraderad"` en gång vid första inloggning efter dag 6, avfärdbar.
- Kör `grep -rn "isPremium" src/components/` och gå igenom varje `if (isPremium) return null` innan lansering. Känt fall: `email-verification-banner.tsx` rad 20 döljer sig för premium, vilket skulle dölja den för alla nya.
- **Får inte gå live före A1 och A2.**

### A5. Engångsköp (dagspass, vecka)
- Ny `src/app/api/stripe/create-onetime-session/route.ts`: `mode: 'payment'`, allowlist `{ daypass: STRIPE_PRICE_DAYPASS, week: STRIPE_PRICE_WEEK }`, aldrig fritt priceId från klienten. Metadata `supabaseUUID`, `grantDays`, `productKind: 'onetime'` på session och payment_intent.
- Ny `src/lib/stripe/grantPremiumDays.ts`: idempotent via tabell `premium_grants (id, user_id, stripe_event_id unique, days, source, granted_at, premium_until_after)` med RLS (ägare läser). Bas = `max(now, premium_until)`, ny `premium_until = bas + days`. Sätt tier premium och `premium_source = 'onetime_Nd'`. Rör aldrig `subscription_status`, och skriv inte `premium_source` om prenumeration är aktiv (webhooken rad 59-73 nollar annars `premium_until`).
- `src/app/api/stripe/webhooks/route.ts` `checkout.session.completed`: ny gren före befintliga för `mode === 'payment' && payment_status === 'paid'`.
- Acceptans: betalning flyttar `premium_until` rätt antal dygn, omsänt event ger ingen dubbel förlängning, köp under reverse trial förlänger.

### A6. Kvartal
- `src/app/api/stripe/create-upgrade-session/route.ts`: allowlist månad + kvartal. Webhookens prenumerationslogik hanterar intervallet utan ändring.

### A7. Prissidan
- `priser-data.ts`: ny `PLANS: Plan[]` (`key, name, amount, suffix, perMonth, badge, body, ctaLabel, ctaHref, highlights`). Behåll `PREMIUM_PRICE`-exporten.
- Layout enligt spår E: fyra jämnbreda kort på desktop, Månad "Mest vald" (orange 1 px ram + `ring-4 ring-orange-50`), Kvartal "Bäst värde" med 99 kr/mån utskrivet. Mobil: Månad expanderad först, tre kollapsade rader under.
- Gratisnivån flyttas ur kortraden till en textrad. Trial-länk i FAQ.
- Jämförelsetabell: kolumner Gratis | Premium, inledningsrad "Alla fyra alternativen ger samma funktioner. Skillnaden är hur länge." Rader ändras: "Brev per dag" 1, ny rad "Ladda ner brev som PDF och Word" Nej/Ja, "Export PDF + Word" → "Ett CV, sedan Premium", ny rad "CV-analys, alla förbättringsförslag" De tre största/Alla.
- `DetailedPricingSection.tsx` på startsidan speglar samma fyra produkter.
- Copy ordagrant:
  - Hero H1: "Betala för veckan du söker. Inte för året." Ingress: "De flesta söker jobb intensivt i några veckor och slutar sedan. Därför säljer vi både korta pass och månadsplan. Välj det som matchar din situation."
  - Dagspass: "24 timmar med allt upplåst. För dig som ska skicka in en ansökan ikväll."
  - Jobbsökarveckan: "Sju dagar med allt. Ingen prenumeration, ingen uppsägning. För dig som söker flera jobb den här veckan."
  - Månad: "149 kr i månaden. Ett jobb du missar kostar mer. Avsluta när du vill."
  - Kvartal: "299 kr för tre månader, alltså 99 kr i månaden. För dig som vet att sökandet tar tid."
  - Gratisraden: "Du kan använda Jobbcoach gratis med ett brev om dagen, en CV-analys var tredje dag, alla tester och 12 CV-mallar. Nedladdning och full CV-analys ingår i Premium."
  - FAQ "Vad räcker gratisversionen till?": "Gratisnivån räcker för att testa verktygen och skicka en ansökan om dagen. Du kan bygga och spara CV, se din ATS-poäng och träna på testerna. Söker du flera jobb i veckan tar kvoterna slut, och då är Premium det som gör skillnad."
  - Ny FAQ: "Vad är skillnaden mellan dagspass och prenumeration?" / "Dagspass och jobbsökarveckan är engångsköp. Du betalar en gång, får full tillgång i 24 timmar respektive sju dagar, och sedan går kontot tillbaka till gratisnivån av sig självt. Inget dras automatiskt. Månads- och kvartalsplanen förnyas tills du säger upp dem."
  - Ny FAQ: "Får jag testa Premium innan jag betalar?" / "Ja. Alla nya konton får fem dagar med Premium direkt vid registreringen, utan kort. Efter fem dagar går kontot över till gratisnivån automatiskt. Vill du hellre prova med kort i sju dagar finns det här." (länk `/trial-signup`)
  - Stryk: "Räcker för aktiv jobbsökning", "Många hittar jobb utan att någonsin behöva uppgradera", "0 kr / för alltid", "Mindre än en arbetslunch", "Inga frågor" i `PrenumerationFAQ.tsx`.

### A8. Prenumerationssidan
- `src/app/dashboard/profil/prenumeration/`: tre tillstånd. Aktiv prenumeration (produkt, nästa debitering, cancel-flow D7). Tidsbegränsad premium (`premium_until` i framtiden utan prenumeration: "Premium till och med [datum], N dagar kvar", CTA "Förläng" med produktval, historik från `premium_grants`, ingen uppsägningsknapp). Gratis (kvotöversikt + produktkort).

### A9. Analysresultat delvis låst
- Analys-API:t filtrerar serverside för gratis: tre högst prioriterade fynd i klartext (sortera severity fallande, sedan kategori ATS-formatering, nyckelord, struktur, språk), resten som `{ id, category, severity, locked: true }` utan text. Deterministiskt.
- Ny `src/components/cv/AnalysisLockedFindings.tsx`: låsta rader suddade i samma lista med kategori synlig, följt av `PaywallCard variant="analys"` med dynamisk siffra. Blurra aldrig riktig text med CSS.
- Under reverse trial visas allt.

### Risker spår A
- Befintliga betalande (3 + 1 trialing): `grantPremiumDays` och signup-trial rör aldrig konton med aktiv status. Verifiera manuellt efter deploy.
- Admin: `userHasPremiumAccess` släpper igenom, räknare kollas efter premiumkontroll.
- Gäst/referral: har `premium_source` vid skapande, idempotenskontrollen skyddar. Anropa aldrig trial-routen från invite-flödet.
- Retroaktiv vägg för 300 befintliga gratiskonton: `free_cv_exports_used` default 0 ger alla en gratis export. Skicka ett informationsmail till aktiva gratiskonton dagen före deploy (spår D).
- Refund/chargeback drar inte tillbaka dagar. Senare.

## Spår B: Aktivering och dashboard

### B1. Confirm email av, mjuk verifiering
- Supabase Auth: Confirm email av.
- `src/components/auth/register-form.tsx` rad 130-141: ta bort grenen mot `/auth/verify-email`, alltid `router.push(redirectTo)`. Bekräftelsemailet skickas fire-and-forget.
- `src/app/auth/verify-email/page.tsx`: behålls som landning för mejllänken, pollar `getUser()` och redirectar när verifierad.
- `src/components/dashboard/email-verification-banner.tsx`: ta bort `subscriptionTier === 'premium'` ur döljvillkoret. Copy: "Bekräfta din e-post. Vi sparar dina dokument permanent när adressen är bekräftad." Dismiss i localStorage 24 h. Ersätt `IconVarning` med `IlluEmailBekrafta`.
- `POST /api/auth/send-confirmation`: rate-limit 3 per userId och timme.
- Verifierad e-post krävs fortfarande för **export och permanent lagring**, inte för skapande. Detta måste implementeras i exportvägarna, annars är bannercopyn ett tomt löfte.
- Turnstile på registreringsformuläret.
- Acceptans: ny användare landar på `/dashboard` utan att öppna e-post.

### B2. Google-login
- Ny `src/app/auth/callback/route.ts`: `exchangeCodeForSession`, läs `next` (validera relativ path), skapa profil om trigger saknas, anropa `grant-signup-trial` med `source='oauth_signup_trial'` om kontot är nytt, läs attribution-cookie och skriv `acquisition_source`, redirect.
- Ny `src/components/auth/GoogleSignInButton.tsx` med `signInWithOAuth({ provider: 'google', options: { redirectTo: origin + '/auth/callback?next=...' } })`. Överst i både register och login, avdelare "eller med e-post".
- Attribution-cookie måste vara `SameSite=Lax` för att överleva Googles redirect.
- Kantfall: saknat `full_name` → e-postens lokaldel.

### B3. Registreringsformuläret
- Tre fält: namn, e-post, lösenord (8 tecken, konsekvent med hint). Ta bort `phone`, `location` ur state, UI och `options.data`. Räkna om `AtsScoreMeter` till 34/33/33. Uppdatera `RegisterCvPreview`-props och `FormState` i `src/app/register/page.tsx`.
- Telefon och ort samlas in i brevflödet (`LetterFlowSummary` före generering, "Kontaktuppgifter till brevhuvudet", förifyllt från profil eller parsat CV, valfritt).

### B4. Dashboard i tre tillstånd
Ny `src/components/dashboard/DashboardHero.tsx` ersätter `OnboardingHero`. Tillstånd härleds ur `cvCount` och `totalLetters`.

**A: inget CV.** `TrialStatusRow` överst. Hero med rubrik "Börja med ditt CV", underrad "Vi läser det och visar vad en rekryterare ser. Tar 30 sekunder.", `InlineCVUpload` inbäddad (`showCancel={false}`, byt till `onComplete(cv)`-callback som `profil/cv/page.tsx` rad 114-119 använder), länk "Har du inget CV? Bygg ett här", illustration `IlluLaddaUppCv` 240 px till höger på desktop. Efter uppladdning byter samma yta till `QuickScoreReveal` inline med primär CTA "Skapa ditt första brev". Under heron bara två textlänksrader: "Träna på tester", "Logga sökta tjänster". Inget annat renderas (inga sex kort, ingen streak, ingen tom aktivitetslista, ingen gradient-blob).

**B: CV men inget brev.** `TrialStatusRow`. Hero: CV-poäng med bar och "Tre saker att fixa", primär CTA "Skapa ditt första brev", illustration 96 px. Under: tre kompakta kort (matchande jobb, träna tester, logga sökta).

**C: aktiv.** `TrialStatusRow` eller prenumerationsrad. `DashboardStatusRow` (ny, en rad: Brev N · Ansökningar N · Svar N · Streak N d + primärknapp "Skapa nytt brev"; på mobil två rader). Sedan senaste aktivitet (döljs vid 0 rader) och fyra kompakta snabbåtgärder. `StreakOchStatus` firande-helskärmsvariant utgår, streak blir en siffra i raden.

**Tas bort:** `src/app/dashboard/kom-igang/` (hela), länken i `Sidebar.tsx` rad 203, "Se alla steg" i heron, `radial-gradient`-blobben i `dashboard/page.tsx`. Kontrollera `grep -rn "kom-igang" src/`.

**`TrialStatusRow`** (`src/components/dashboard/TrialStatusRow.tsx`): en rad `h-10 rounded-lg border`, ingen skugga. Dag 1-3 neutral: "● Premium aktivt · 4 dagar kvar" + textlänk "Vad ingår". Dag 4-5 `bg-orange-50 border-orange-200`: "● 2 dagar kvar av din Premium-period" + "Behåll Premium". Sista dygnet: "Premium slutar ikväll 23:59." Ingen progress-bar, ingen tickande timer. Läser `premium_source`, `premium_until`, `subscription_tier` från `useProfile()`.

**Nedgraderad:** `PaywallCard variant="nedgraderad"` visas en gång, avfärdbar (localStorage), visas inte igen efter 14 dagar.

- Kantfall: uppladdningsfel visas i heron utan tillståndsbyte. `QuickScoreReveal` returnerar null vid fel → fallback "Ditt CV är inläst" + brev-CTA. Raderat enda CV → tillstånd A.
- Acceptans: ny användare ser en enda handling. Tre interaktioner från inloggning till synlig poäng.

### B5. Onboarding till ett steg
- Bryt ut `REQUIRED_STEPS` till `src/lib/onboarding/steps.ts` (finns idag på tre ställen i `OnboardingContext.tsx` plus claim-reward-routen). Värde `['upload_cv']`.
- Auto-claim i `OnboardingContext` när completed blir true (ref mot dubbelanrop). Routen är redan idempotent (400 vid dubbel).
- Belöning: XP + toast "Din belöning är upplåst" (fungerar även för befintliga konton som plötsligt blir klara). Inte premium-dagar.
- Auto-claim bara för konton skapade efter utrullningsdatum, annars delas belöning ut till 100+ gamla konton på en gång.

### B6. TestResultBridge
- Ny `src/components/tests/TestResultBridge.tsx`, renderas under `PercentileCard` i alla nio `src/app/dashboard/tester/*/test/[sessionId]/results/page.tsx`. Verifiera med `grep -rln "PercentileCard"`.
- Props `{ sessionsToday, hasCv, isPremium, testSlug }`. Illustration `IlluTestTillCv` 96 px.
- Variant 1 (session 1-2, inget CV): "Du klarar testet. Nu gäller det att komma till testet." / "Testerna kommer sent i processen. Först ska ditt CV ta dig förbi granskningen. Ladda upp det så visar vi på 30 sekunder vad en rekryterare ser." CTA "Ladda upp mitt CV" → `/dashboard/profil/cv`.
- Variant 2 (session 3+, inget CV, premium eller trial): "Tre test idag. Imponerande uthållighet." / "Du är uppenbarligen seriös med jobbsökandet. Då är det värt att lägga tio minuter på CV:t också, det är det som avgör om du ens blir kallad till testet." CTA "Ladda upp mitt CV", sekundär "Fler testnivåer".
- Variant 2b (session 3+, gratis): `PaywallCard variant="test-tak"` i stället.
- Variant 3 (har CV): "Nästa steg: brevet." / "Ditt CV ligger inne. Klistra in en annons så skriver vi brevet utifrån det." CTA "Skapa personligt brev".
- Under trial: rad "Alla testnivåer är upplåsta till [datum]." Ingen prissida-CTA i bryggan.
- Bryggan får aldrig blockera resultatet; saknas `sessionsToday`, visa variant 1.

### B7. Instrumentering (körs först)
| Vad | Var | Anm |
|---|---|---|
| `profiles.first_cv_uploaded_at` | `src/app/api/cv/upload/route.ts` vid complete | coalesce, service role |
| `profiles.first_letter_created_at` | brev-skapande-routen | samma |
| `profiles.first_cv_analyzed_at` | `quick-score` och full analys | först vinner |
| `user_activities: quick_score_shown` | `QuickScoreReveal` | `{ cvId, score }` |
| `user_activities: cv_analysis_completed` | där jobbet sätts completed | loggas idag 1 av 20 |
| `user_activities: test_completed` | results-page mount | `{ slug, sessionsToday }` |
| `user_activities: bridge_clicked` | `TestResultBridge` | `{ variant, target }` |
| `user_activities: signup_method` | register-form, callback | password/google |
| `user_activities: activation_state` | dashboard | A/B/C |

## Spår C: Trafik till produkt

### C1. Analytics och attribution (körs först)
- Ny `src/lib/analytics/events.ts`: typad `capture()` som wrappar `posthog.capture`, no-op när `!posthog.__loaded`. Events: `article_viewed`, `article_cta_shown`, `article_cta_clicked` (position inline/final/sticky), `example_viewed`, `example_cta_clicked`, `sample_started`, `sample_completed`, `signup_gate_shown`, `signup_started`, `signup_completed`, `draft_claimed`, `activation_first_doc`, `pricing_viewed` (trigger quota_lock/nav/cta), `trial_started`, `subscription_paid`. Alla med `cluster` där relevant.
- Ny `src/lib/analytics/attribution.ts`: cookie `jc_attr`, 90 dagar, `SameSite=Lax`, `Secure`, inte httpOnly. Fält `{ landing_path, landing_cluster, referrer, utm_*, first_seen }`. Sätts i middleware vid första request, skrivs aldrig över (first touch). Ingen rå-IP, ingen e-post.
- Migration: `profiles.acquisition_source jsonb` + index på `landing_path`. Skrivs i `register-form.tsx` och Google-callbacken.
- Capture-punkter: artikelsidan, CTA-komponenterna (IntersectionObserver för shown), sticky CTA, exempelsidor, `StartFlow`, register-form, claim-route (server), Stripe-webhook, prissidan.

### C2. Sluta länka utloggade till /dashboard
| Fil | Från | Till |
|---|---|---|
| `ArticleToolBanner.tsx` 20/25/30/35 | `/dashboard/cv-mallar`, `cv-analys`, `skapa-brev`, `jobbmatchning` | `/verktyg/cv-mallar`, `/verktyg/cv-analys`, `/skapa-brev/start`, `/verktyg/jobbmatchning` |
| `ArticleSidebar.tsx` 213 | `/dashboard/*` | `/verktyg/*` |
| `cv-mallar/[yrke]/YrkesmallContent.tsx` 196/225/617 | `/dashboard/cv-mallar` | `/verktyg/cv-mallar?mall={slug}` |
| `verktyg/cv-analys/components/*` (Hero 65, CTABand 46, HurFunkar 110, ResultatBevis 141) | `/dashboard/cv-analys` | `#mini-analys` (C8), tills dess `/register` |
| `PersonligtBrevExempelPage.tsx` 109/301 | `/dashboard/skapa-brev` | `/skapa-brev/start?yrke={slug}` |
| `CVExempelPage.tsx` 104/221 | `/dashboard/skapa-cv` | `/cv-mallar/start?yrke={slug}` |
- ESLint `no-restricted-syntax` mot `^/dashboard` under `src/app/(public)` och `src/components/artiklar`.
- Verktygssidor redirectar inloggade till motsvarande dashboard-sida.

### C3. Hero
- `LandingHero.tsx` rad 50-86: primär "Skapa konto och få 5 dagar Premium" → `/register`, `data-cta="hero-primary"`. Sekundär knapp tas bort. Trust-rad: "Inget kreditkort · Avsluta när du vill · Bekräftat av SVT, SR, DN". Rubrik och brödtext oförändrade.
- `RichFinalCTA.tsx` och `DetailedPricingSection.tsx` samma hierarki.

### C4. Klustermappning och CTA-varianter
- Ny `src/lib/cta/clusters.ts` med `getCtaVariantForTags(tags)`: normalisera (lowercase, trim, bindestreck → mellanslag), substrängsmatchning i prioritetsordning: `test` (test, matrigma, begåvning) → `interview` (intervju, star metoden/modellen/teknik, beteendefrågor, styrkor och svagheter, varför ska vi anställa dig, personliga egenskaper) → `letter` (personligt brev, ansökningsbrev, motivationsbrev, cover letter, följebrev) → `cv` (cv, resume, meritförteckning, ats) → `career` (karriär, byta jobb, uppsägning, arbetsgivarintyg, tjänstgöringsbetyg, lön, studera, omskolning, ångest) → `generic`.
- `scripts/audit-cta-clusters.ts` skriver slug → kluster för alla artiklar. Manuell genomläsning före merge. Mål: 0 generic bland topp 20.
- Ny `src/components/artiklar/ArticleClusterCTA.tsx` (ersätter `ArticleToolBanner`, `Sparkle` bort) med varianter, ikoner `IlluKluster*` 24 px:
  - Intervju: "Träna svaret innan du sitter i rummet" / "Du kan bolla dina svar med vår jobbcoach och få följdfrågor som en riktig rekryterare hade ställt. Gratis, direkt i webbläsaren." Knapp "Träna intervjufrågor" → `/verktyg/jobbcoachen`.
  - Test: "Gör testet innan arbetsgivaren gör det" / "Öva på matrislogik, verbalt och numeriskt resonemang med facit och förklaringar. Ett test per dag är gratis." Knapp "Gör ett övningstest" → `/verktyg/rekryteringstester`.
  - Brev: "Skriv ditt brev på fem minuter" / "Fyll i tjänsten du söker, så får du ett färdigt utkast du kan redigera. Fem dagar Premium ingår när du skapar konto." Knapp "Skapa mitt brev" → `/skapa-brev/start`.
  - CV: "Bygg CV:t på en av våra mallar" / "Tolv mallar gratis, alla granskade mot svenska rekryteringssystem. Du fyller i, vi formaterar." Knapp "Välj en mall" → `/verktyg/cv-mallar`.
  - Karriär: ingen produkt-CTA, ingen sticky. Länkrad till kalkylator eller relaterad artikel.
- `artiklar/[slug]/page.tsx`: `injectClusterCta` ersätter `injectBannerIntoContent` (rad 230), hoppar över career. `injectCVTemplateShowcase` bara när cluster = cv. `ArticleFinalCTA` (rad 461) → `ClusterFinalCTA`. Behåll MDX-aliasen `BroadConversionBanner`, `CVTemplateShowcase`.
- Enhetstester för: logiska-tester → test, kompetensbaserad-intervju-star-metoden → interview, styrkor-svagheter-intervju → interview, personligt-brev-butik → letter, cv-exempel-student-nyexaminerad → cv, hur-ofta-byta-jobb → career, angest-infor-nytt-jobb → career.

### C5. StickyMobileCTA
- Ny `src/components/shared/StickyMobileCTA.tsx`: `lg:hidden fixed bottom-0`, 64 px, primärknapp + X. Visas efter `scrollY > max(600, 25 % av sidhöjd)` vid nedåtscroll, döljs vid 80 px uppåtscroll. `transform`, inte `height` (CLS 0). `env(safe-area-inset-bottom)`. Dismiss i sessionStorage. Ingen slide-in vid reduced motion. Label per kluster, ingen för career.
- Monteras i `ArticleClientWrapper.tsx` (~rad 140) och båda exempelsidorna. "Tillbaka till toppen"-knappen tas bort på mobil. `MobileBottomNav` döljs på publika sidor.

### C6. Exempelsidor: `/skapa-brev/start`
- Förkrav (eget commit): bryt ut `exampleData` (89 yrken) ur `personligt-brev-exempel/[yrke]/page.tsx` till `exempel-data.ts`.
- Ny publik route `src/app/(public)/skapa-brev/start/page.tsx` + `StartFlow.tsx`. `?yrke=` slås upp, okänd ger tomt rollfält. Tre fält (tjänst förifylld, arbetsgivare, erfarenhet min 200 tecken) + valfri annons. Stegikoner `StepIndicatorIcons`.
- Ny `src/app/api/public/letter-draft/route.ts`: rate-limit (ny `src/lib/rate-limit/ip.ts`, tabell `public_rate_limits` med `ip_hash = sha256(ip + PEPPER)`, 3 per IP per 24 h), globalt dygnstak i `public_generation_budget` (**start 100/dygn**, 503 med registreringslänk), anropar delad `src/lib/letters/public-draft.ts` (lyft ur `generate-preview`), skriver `public_letter_drafts` (token, yrke_slug, role, employer, letter_text, preview_paragraph, ip_hash, claimed_by, expires_at 7 dagar, RLS utan policies).
- Svar: `{ draftToken, previewParagraph, blurredLineCount, expiresAt }`. Resten skickas aldrig till klienten före claim.
- Gate-kort (`PaywallCard`-layout, `IlluBlurGate`): "Ditt brev är klart" / "Skapa ett gratiskonto så låser vi upp hela brevet, sparar det åt dig och du kan ladda ner det. Fem dagar Premium ingår." Knapp "Lås upp mitt brev". Token i sessionStorage och i `/register?draft={token}`.
- Ny `/api/public/letter-draft/claim`: verifiera oclaimad och giltig, skapa `letters`-rad för nya `user.id`, sätt `claimed_by`, redirect till `/dashboard/skapa-brev/{id}`. Idempotent.
- Metadata `robots: noindex, follow`, canonical till exempelsidan, `Disallow: /skapa-brev/start` i robots. Raderingsjobb för utgångna drafts i `pricing-sync`-cronen. Nämn tillfällig lagring i integritetspolicyn.
- `exempel-shared/FinalCTA.tsx` rad 17: "Skapa mitt brev som {yrke}".
- Mät `signup_gate_shown → signup_completed`. Under 15 procent betyder att förhandsstycket är för tunt.

### C7. `/cv-mallar/start` (Använd som mall)
- Ny publik route, ingen AI, ingen rate-limit. Mallväljare med rätt mall förvald och yrkesrubriker från cv-exempel-data. "Fortsätt" → sessionStorage + `/register?cv_start={yrke}:{mall}`. Efter registrering skapas CV-utkast. `FinalCTA.tsx` rad 18: "Använd denna mall som {yrke}". noindex + canonical.

### C8. Mini CV-analys utan konto (våg 3)
- Ersätter scriptade `CVAnalysLiveDemo.tsx` med riktig uppladdning: kör `quick-score` anonymt, visa poäng + en av tre förbättringar, resten låst. Rate-limit via `ip.ts`, ingen lagring utan samtycke. Ankare `#mini-analys`.

### C9. Tester utan konto (våg 3)
- Ny `/verktyg/rekryteringstester/prova`: fem slumpade matrislogikfrågor, anonym session i `anon_test_sessions` (token, questions, answers, score, ip_hash, expires_at). Resultat: antal rätt + grov percentil. Låst bakom registrering: vilka som var fel, förklaringar, normjämförelse. "Du fick 4 av 5 rätt. Skapa ett gratiskonto för att se vilka du missade, läsa förklaringarna och göra fler tester." 3 sessioner per IP och dygn. Byt ut `RekryteringstesterLiveDemo`.

## Spår D: Livscykel

### D1. Migrationer
- `email_schedule (id, user_id, email_type, send_after, sent_at, canceled_at, cancel_reason, attempts, last_error, metadata, created_at)`, unique `(user_id, email_type)`, partial index på due, RLS utan policies.
- `cancel_intents (id, user_id, reason, free_text, offer_shown, offer_accepted, completed_cancel, created_at)`, RLS.
- Appliceras via `mcp__supabase__apply_migration` mot Jobbcoach-projektet, filen sparas i `supabase/migrations/`.

### D2. `src/lib/email/lifecycle/`
- `types.ts` (`LifecycleEmail { type, subject, preheader, html, shouldSend, tags }`), `registry.ts`, `schedule.ts` (`scheduleEmail` upsert ignoreDuplicates, `cancelScheduled`, `withUtm(url, type)`), `runner.ts`, `templates/*.ts`.
- Runner: hämta max 150 due (attempts < 3), per rad: opt-out/ingen e-post → cancel, `shouldSend` falskt → cancel, skicka via Resend med tags `type` och `seq=lifecycle`, vid success `sent_at` **först** sedan `email_log`, vid fel `attempts += 1`. Chunkar om 10, avbryt efter 40 s.
- Hakas in som sektion 6 i `pricing-sync` morgonslot med try/catch. Dag 0-mail skickas inline från signup, aldrig via schedule.
- `send_after` = midnatt svensk tid + n dygn + 7 h (inte `created_at + n·24h`).

### D3. Triggers
| Trigger | Var | Skapar |
|---|---|---|
| Konto skapat | register-form (via ny server-route), Google-callback | `rt_day0` direkt + schedule `rt_day1, rt_day3, rt_day4, rt_day6, rt_day10` |
| Trial med kort | webhook `subscription.created` trialing | cancel `rt_*`, schedule `trial_day3`, `trial_day7` |
| Nedgradering | premium-expiration-blocket | `rt_day6` blir sändbar |
| Kvotstopp nr 3 på 7 dagar | `quotaService.ts` | `quota_wall` nu |
| Inaktivitet 14/30 d | runner-sidojobb | `winback_14`, `winback_30` |
| Uppsägning | webhook `subscription.deleted` | `cancel_immediate` direkt, `cancel_followup` +3 d |
| Engångsköp gått ut | premium-expiration | `onetime_expired` (kort, "vill du förlänga") |

### D4. Mailsekvens reverse trial (ämne / preheader / CTA / avbryt)
Avsändare "Jobbcoach.ai <hej@jobbcoach.ai>". Unsubscribe i alla. Header som PNG.
- **rt_day0** "Du har premium i fem dagar. Börja här." / "Alla 42 mallar och obegränsad analys, från och med nu." / "Ladda upp mitt CV" → profil/cv. Alltid.
- **rt_day1** "Vad ser rekryteraren i ditt CV?" / "Analysen tar två minuter och är öppen hela veckan." Testanvändare får "Så tolkar rekryteraren ditt testresultat". CTA "Analysera mitt CV". Avbryt om `cv_analysis_started`.
- **rt_day3** "Ett personligt brev på fyra minuter" / "Klistra in annonsen, vi skriver utkastet." CTA "Skriv mitt brev". Avbryt om `letter_created`.
- **rt_day4** "Två dagar kvar med allt upplåst" / "Efter [veckodag] går du ner till gratisnivån." Lista: 42 mallar blir 12, obegränsad analys blir en per 72 timmar, obegränsade brev blir ett per dag, nedladdning kräver Premium. CTA "Behåll Premium" → prenumeration. Avbryt om köpt.
- **rt_day6** "Du är nu på gratisnivån" / "Allt du skapat finns kvar. Så här ser gränserna ut." Ingen press, uppgradering en gång i slutet, nämn jobbsökarveckan 99 kr. CTA "Till min översikt". Avbryt om köpt.
- **rt_day10** "Hur går ansökandet?" / "Tre saker som brukar fastna efter första veckan." Länkar till STAR-metoden, styrkor och svagheter, hur ofta byta jobb med utm. Avbryt om premium.
- **winback_14** "Ditt CV ligger kvar där du lämnade det" / "Ett klick så är du tillbaka i det." Namnge senaste dokumentet. Avbryt om inloggad senaste 14 d.
- **winback_30** "Fick du jobbet?" / "Svara med ett klick, så anpassar vi vad vi skickar." Två knappar → ny `/(public)/feedback/fick-jobbet?a=ja|nej` (ja: grattis, be om omdöme, opt-out). Avbryt om inloggad 30 d eller premium.
- **quota_wall** "Du har slagit i taket tre gånger den här veckan" / "Jobbsökarveckan kostar 99 kr och tar bort taket i sju dagar."
- **trial_day3** "Halva veckan kvar. Har du kört analysen?" **trial_day5** (via `trial_will_end`) "Det här händer på [dag]" ärlig förvarning om debitering. **trial_day7** "Din period går ut idag" med avsluta-länk.
- **payment_failed** "Betalningen gick inte igenom" / "Uppdatera kortet så fortsätter allt som vanligt." Transaktionell, ignorerar opt-out.
- **cancel_immediate** "Din prenumeration är avslutad" med pauserbjudande. **cancel_followup** +3 d "Om det var priset" med 49 kr i två månader.
- **Före deploy av A1-A3:** engångsmail till aktiva gratiskonton: "Vi ändrar gratisnivån den [datum]" med vad som ändras och jobbsökarveckan som erbjudande.

### D5. Webhook-cases
- `customer.subscription.trial_will_end` → skicka `trial_day5`. `invoice.payment_failed` → `payment_failed`. `customer.subscription.deleted` → `cancel_immediate` + schedule `cancel_followup`.
- `send-trial-welcome-moz` loggas i `email_log` och får tags.

### D6. Cancel-flow
- `ManageSubscriptionCard.tsx` rad 79-85: portallänken ersätts av knapp som öppnar ny `CancelFlowModal.tsx`.
- Steg 1 enkät (ett val): Jag fick jobb / För dyrt / Jag använder det inte / Saknar en funktion (fritext 300 tecken). Ikoner `IlluCancel*` 24 px.
- Steg 2 erbjudande: fick jobb → paus 3 mån (`pause_collection { behavior: 'void', resumes_at }`), "Grattis. Vi pausar i tre månader så finns allt kvar om du behöver oss igen." För dyrt → kupong `retention_49_2m` (en gång per användare, kontrollera `cancel_intents`). Använder inte → länk till guide. Saknar funktion → tack, vidare.
- Steg 3 "Avsluta ändå" → portal som idag.
- Ny `POST/PATCH /api/subscription/cancel-intent` (user_id från session, aldrig body).

### D7. Mätning
- Resend-tags på alla utskick, `email_log`-rad per sändning, utm på alla CTA-länkar.
- `email-stats/route.ts` grupperar per `email_type`: skickade, levererade, öppnade, klickade, konvertering = premium inom 7 dagar efter `sent_at` (SQL mot profiles).

### Risker spår D
- GDPR: berättigat intresse för egna kunder, opt-out i varje mail, transaktionella undantag snävt definierade. `on delete cascade`.
- Spam: volym tiodubblas. Sekvensen bara på nya konton, win-back max 50 per dag bakåt, bounce under 2 procent.
- Dubbla utskick: unique-index + `sent_at` före log. Logga `attempts > 0`.
- Statistik: `premium_source='signup_trial'` får inte räknas som betalande i admin-vyer eller i skyddsfiltret.

## Spår E: Design och illustrationer

### E1. Grund
- `tailwind.config.js`: orange-skala, neutral-alias. `globals.css`: `--illu-*` variabler ljust/mörkt.
- `src/components/illustrations/primitives.tsx` + `index.ts`.
- `docs/designsystem.md` med principerna ovan i full form.
- **Sparkles-svep**: ta bort `Sparkle`/`Sparkles` från alla 20+ filer (`grep -rln "Sparkle" src/`), ersätt med relevant `Illu*` eller inget.

### E2. PaywallCard-familjen
- Ny `src/components/paywall/PaywallCard.tsx` + `paywall-copy.ts`. Ersätter och tar bort `QuotaLockCard`, `QuotaExceededBanner`, `CvLimitBanner`, `PremiumRequiredCard`.
- Layout: `bg-white rounded-xl border border-neutral-200`, ingen skugga, ingen gradient-strip, illustration 48 px vänster, rubrik `text-base font-semibold`, brödtext max två rader, primärknapp `bg-orange-600 h-11`, sekundärt alltid textlänk.
- Tillstånd: idle, loading (spinner i knapp, bredd behålls), reminder-saved (länken byts till "Vi mailar dig imorgon" med bock), error (rad under knapp, `text-red-700`), premium (returnerar null).
- Varianter och copy:
  - `nedladdning`: "Ditt brev är klart" / "Du kan läsa och kopiera texten som den är. För att ladda ner som PDF eller Word behöver du Premium." Primär "Lås upp nedladdning" (öppnar produktval med dagspass 49 kr först). Sekundär "Kopiera texten istället".
  - `cv-export`: "Din gratis nedladdning är använd" / "Du har laddat ner ett CV. Fler nedladdningar, alla 42 mallar och obegränsade analyser ingår i Premium." Primär "Lås upp nedladdning".
  - `kvot`: "Du har skrivit dagens brev" / "Gratisnivån ger ett brev per dag. Med Premium skriver du så många du orkar." Primär "Fortsätt skriva med Premium". Sekundär "Påminn mig imorgon".
  - `analys`: "Vi hittade {N} saker att fixa i ditt CV" / "Du ser poängen och de tre viktigaste. Resten, inklusive ATS-genomgången och formuleringsförslagen, ingår i Premium." Primär "Se hela analysen". Sekundär "Vad ingår i Premium?".
  - `test-tak`: "Tre omgångar idag, det räcker för att bli varm" / "Med Premium tränar du obegränsat och får alla svårighetsnivåer." Primär "Träna obegränsat". Sekundär "Kom tillbaka imorgon".
  - `nedgraderad`: "Din Premium-period är slut" / "Du hade obegränsat i fem dagar. Nu gäller gratisnivån: ett brev om dagen, och nedladdning kräver Premium." Primär "Se vad Premium kostar". Sekundär "Fortsätt gratis".
- Produktvalet som primärknappen öppnar: en liten sheet/modal med de fyra produkterna, dagspass först i betalväggar, månad först på prissidan.

### E3. Illustrationsregister

| Namn | Storlek | Var | Motiv | Ersätter |
|---|---|---|---|---|
| `IlluBrevKlart` | 48 | PaywallCard nedladdning | Brevark med textrader, vikt hörn med nedladdningspil | Lock i gradientruta |
| `IlluDagensBrev` | 48 | PaywallCard kvot | Två ark staplade, tredje streckat | Clock i gradientruta |
| `IlluAnalysDelvis` | 48 | PaywallCard analys | Checklista sex rader, tre med bock, tre streckade | |
| `IlluTestTak` | 48 | PaywallCard test-tak | 2×2-rutnät, tre fyllda, fjärde streckad | Lock (PremiumRequiredCard) |
| `IlluNedgraderad` | 48 | PaywallCard nedgraderad | Stapel hög till låg med streckad gammal höjd | |
| `IlluCvStack` | 48 | PaywallCard cv-export | Två CV-ark, tredje streckat | QuotaFullIllustration |
| `IlluLaddaUppCv` | 240 | DashboardHero A | CV-ark svävar över öppen mapp, uppåtpil | OnboardingHeroIllustration (trappa/flagga/stjärna) |
| `IlluCvPoang` | 96 | QuickScoreReveal, hero B | Cirkulär mätarbåge ca 70 procent, litet ark i mitten | CSS-ring |
| `IlluIngaBrev` | 96 | Tom brevlista | Tomt ark, penna diagonalt | |
| `IlluIngenAktivitet` | 96 | Tom aktivitetslista | Tre tomma tidslinjeprickar | |
| `IlluPercentil` | 48 | PercentileCard | Fem staplar stigande, fjärde accent | Users i gradientruta |
| `IlluTestTillCv` | 96 | TestResultBridge | Testrutnät, pil, CV-ark | |
| `IlluBrevForYrke` | 48 | Exempelsidans CTA | Brevark med yrkesbricka i hörnet | Wand2 |
| `IlluKlusterIntervju` | 24 | ArticleClusterCTA | Två överlappande pratbubblor | Sparkle |
| `IlluKlusterTest` | 24 | ArticleClusterCTA | 2×2-rutnät med rotationspil | Sparkle |
| `IlluKlusterBrev` | 24 | ArticleClusterCTA | Kuvert med arkkant | BrevIcon (justeras) |
| `IlluKlusterCv` | 24 | ArticleClusterCTA | Ark med kolumnlayout | CvMallarIcon (justeras) |
| `IlluBlurGate` | 96 | StartFlow gate | Hänglås över dokument, varm ton | |
| `IlluUtkastKlart` | 160×120 | StartFlow steg 3 | Färdigt brev med bock | |
| `StepIndicatorIcons` ×3 | 24 | StartFlow | Tjänst, arbetsgivare, erfarenhet | |
| `IlluTestResultat` | 160×100 | /prova gate | Percentilkurva med markerad position | |
| `IlluDagspass` | 96 | Prissidan | Cirkel med 24-timmarssegment | |
| `IlluVecka` | 96 | Prissidan | Sju smala staplar, alla fyllda | |
| `IlluManad` | 96 | Prissidan | Kalenderark med upprepningsmärke | PremiumCrown |
| `IlluKvartal` | 96 | Prissidan | Tre kalenderark i förskjuten stapel | |
| `IlluTrialAktiv` | 24 | TrialStatusRow dag 1-3 | Cirkulär båge nästan hel | |
| `IlluTrialSlutar` | 24 | TrialStatusRow dag 4-5 | Samma båge halvöppen, accentkant | |
| `IlluEmailBekrafta` | 36 | Verifieringsbanner | Kuvert med bock, lugn ton | IconVarning |
| `IlluTidKvar` | 120 | Prenumerationssidan | Mätare för återstående dagar på engångsköp | |
| `IlluCancel*` ×4 | 24 | CancelFlowModal | Fick jobb, för dyrt, använder inte, saknar funktion | |
| `IlluPaus` | 48 | CancelFlowModal | Pausknapp över kalender | |
| `GoogleMark` | 20 | GoogleSignInButton | Officiell G, färgversion | |
| `email-header-jobbcoach.png` | 600×120 (1200×240) | Alla mail | Ordmärke på varm gradient, PNG, max 40 kB | |

Mailgrafik utöver headern (rt_day4 nedräkning, rt_day6 jämförelse) renderas som PNG från SVG, aldrig inline SVG.

## Leveransordning

Kritisk regel: **A4 (reverse trial) får inte gå live före A1, A2 och A3.**
**B7 och C1 (instrumentering) går först**, annars kan inget mätas.

### Våg 1 (vecka 1): grund, spärrar, copy
1. B7 + C1 instrumentering och attribution.
2. E1 designgrund (tailwind, globals, primitives, Sparkles-svep).
3. E2 PaywallCard med varianterna kvot, cv-export, nedladdning.
4. A3 kvotsänkning, A1 brevgate, A2 CV-exportgate.
5. A7-copy (prissidans stryk-lista) och C3 hero, redan innan produkterna finns.
6. C2 länkfixar, C5 sticky mobil-CTA (generisk label tills C4 är klar).
7. B1 Confirm email av + banner + Turnstile.
8. D4 informationsmail till aktiva gratiskonton före deploy av punkt 4.

### Våg 2 (vecka 2-4): produkter, trial, dashboard, mail
9. Stripe-produkter skapade (ägaren). A5 engångsköp, A6 kvartal, webhook.
10. A7 prissidan fyra produkter + E3 prissideillustrationer, A8 prenumerationssidan.
11. D1-D3, D5: migrationer, runner, triggers, webhook-cases.
12. A4 reverse trial + B4 TrialStatusRow + D4 rt-sekvensen. Går live tillsammans.
13. B2 Google-login, B3 formuläret.
14. B5 onboarding ett steg, B4 dashboard tre tillstånd + dashboard-illustrationer.
15. B6 TestResultBridge, E2 varianterna analys, test-tak, nedgraderad, A9 analys delvis låst.
16. C4 klustermappning + ArticleClusterCTA + klusterikoner.
17. D6 cancel-flow, D7 mätning.

### Våg 3 (egna sprintar)
18. C6 `/skapa-brev/start` med blur-gate (förkrav: exempel-data-utbrytning, rate-limit-lib).
19. C7 `/cv-mallar/start`.
20. C9 tester utan konto.
21. C8 mini CV-analys utan konto.
22. Win-back-sekvensen (D4 winback_14/30) och `fick-jobbet`-sidan.

## Mätning

| Mätpunkt | Idag | Mål efter våg 1 + 2 |
|---|---|---|
| Registrering till session | 57 % | 90 % |
| CV uppladdat/byggt första besöket | 47 % | 65 % |
| Återkommer dag 2+ | 29 % | 45 % |
| Exponerade för Premium | 5 % | 100 % |
| Nya betalande per månad | 0,3 | 3 till 5 |
| Uppsägningar med känd orsak | 0 av 13 | alla |
| `signup_gate_shown → signup_completed` (C6) | | > 15 % |

Följ upp GSC-positioner för topp 20-artiklar i fyra veckor efter C4 (ändra inte ordmängd eller rubrikstruktur, bara CTA-komponenter).

## Öppna beslut för ägaren

1. Gratisradens nya formulering på prissidan (föreslagen ovan) godkänns.
2. Kortkrävande trial: bara i FAQ, inte som kort. Bekräfta.
3. Onboarding-belöningen blir XP, inte premium-dagar. Bekräfta.
4. Informationsmail till befintliga gratiskonton före spärrarna: ja eller nej.
5. Anonymt genereringstak 100 brev per dygn (cirka 20 kr per dag i värsta fall). Bekräfta.
