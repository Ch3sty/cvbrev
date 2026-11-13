# Plan: Testklar, testerna som app för Android och iPhone

Beslutat av ägaren 2026-11-13: egna typsnitt (Bricolage Grotesque + Figtree), tre flikar (Idag, Tester, Utveckling) med konto bakom profilbilden, Nivåkollen före kontot, bara Premium 149 kr/mån utan provperiod.

Namn beslutat av ägaren 2026-11-13: **Testklar**, Play-titel "Testklar: Logiktest & övning" (28 tecken), kort beskrivning "Öva rekryteringstest: figurmatriser, numeriskt, verbalt, spatialt och I-provet". Utvecklare jobbcoach.ai. Paket-id ai.jobbcoach.testklar (låst efter första publicering). Designkoncept: docs/design/app-koncept-2026-11-13.html.

Skriven 2026-11-13. Bygger på utredningen i docs/rapporter/utredning-app-tester-2026-11-13.pdf.

## 0. Ägarens ram

Ägarens ord: webbsidan ska vara kvar exakt som den är, appen ska dela testerna med webben, och vi ska kunna arbeta med appens design separat. CV, brev, jobbmatchning och resten av Mitt jobbsök är inte med i appen.

Tre regler följer av det och gäller hela bygget:

1. **Webben ändras inte synligt.** Allt som rör webbens kod är flyttar, inga designändringar. Skärmbildsdiff före och efter är grind (avsnitt 8).
2. **Testerna finns en gång.** Frågebanker, motorer, API-rutter och passvyerna (PassFlode, NivakollFlode, VnPassFlode, FigurPassFlode, DeduktivPassFlode, Steg2PassFlode, IprovFlode, resultatvyerna) är samma kod i webb och app. Ändras ett test ändras det på båda ställena.
3. **Allt runt testerna i appen är eget.** Startvy, navigering, katalog, utveckling, profil, inloggning, köp och onboarding är egna sidor som bara appen laddar, med egen design som godkänns separat.

## 1. Vad användaren får

En app som heter Testklar (från jobbcoach.ai) i Google Play och senare App Store. Den öppnar direkt i testerna, påminner om dagens pass med en notis, loggar in med Apple, Google eller e-post och säljer Premium med Face ID eller Google Play. Samma konto, samma resultat och samma Premium som på webben: den som köpt på webben har Premium i appen och tvärtom.

## 2. Arkitektur

```
                 ┌──────────── Delat ────────────┐
                 │ lib/traning, lib/nivakoll,     │
                 │ lib/tester, frågebankerna      │
                 │ api/traning/*                  │
                 │ components/traning/* (passen)  │
                 └───────┬───────────────┬────────┘
                         │               │
   Webben (orörd)        │               │   Appen (egen design)
   /dashboard/tester/*  ─┘               └─  /app/*  ← laddas bara av appskalet
   DashboardShell                            AppSkal (flikrad, egna vyer)
```

### 2.1 Appdelen i Next

- Ny route-grupp `src/app/(mobilapp)/app/` med egen `layout.tsx` och eget skal (`src/components/mobilapp/`). Adresserna blir `/app`, `/app/tester`, `/app/pass/[sessionId]` och så vidare.
- Rotlayoutens webbdelar visas inte under `/app`: kakbanner, kampanjbanner, PWA-registrering och installationsrad. Samtycke till analys frågas i appens onboarding i stället.
- Appdelen återanvänder designsystemets byggstenar (tokens, typsnitt, ikoner) men inte DashboardShell eller rummen.

### 2.2 Delningen av testflödet (byggd 2026-11-13, webbens kod orörd)

Ändrat från första versionen av planen: ingen flytt av webbens kod behövs.

- Varje sida under `src/app/dashboard/tester/` har en tvilling under `src/app/app/tester/` som bara återexporterar webbens sida (`export { default } from '@/app/dashboard/tester/...'`). Samma kod, appens layout runt.
- `src/proxy.ts` känner igen appen på user agent (`src/lib/mobilapp/appvag.ts`) och skriver om appens förfrågningar internt: `/dashboard/tester/*` till `/app/tester/*`, `/dashboard` till `/app`, `/login` till `/app/logga-in`, övriga `/dashboard/*` och `/priser` till `/app/webben`. Adressen i appen står kvar på `/dashboard/tester/...`, så testkomponenternas länkar och `router.push` fungerar utan ändring.
- En webbläsare som går till `/app` skickas till `/dashboard/tester`. Utan appens markering beter sig proxyn exakt som förut.
- Ny sida eller testtyp under `dashboard/tester` behöver en tvillingfil under `app/tester` (en rad). Saknas den visar appen 404 där.
- Köpknappar i passen pekar på `/priser`, som i appen landar på `/app/webben` tills köpvyn finns. Köpvyn ersätter då den omskrivningen.

### 2.3 Spärr och synlighet

- Appskalet lägger till `JobbcoachApp/<version> (<ios|android>)` i user agent (Capacitor `appendUserAgent`). `proxy.ts` släpper bara in `/app/*` med den markeringen, alla andra skickas till `/dashboard/tester`.
- `/app` får `noindex` och `Disallow: /app` i robots. SEO-grinden från publikt v2 körs ändå på diffen.

### 2.4 Appskalet (Capacitor)

- Egen mapp `mobilapp/` i repot (som `video/`), med egen `package.json`. `server.url` pekar på `https://www.jobbcoach.ai/dashboard/tester` (proxyn skriver om till `/app`). Paket-id `ai.jobbcoach.testklar`.
- Ett lokalt paketerat felläge när nätet saknas ("Ingen anslutning, försök igen"), eftersom passen kräver nät.
- Inbyggda delar: statusfält och startskärm, haptik vid svar och klart pass, tillbakaknappen på Android, skärmens säkra kanter.
- Eftersom sidorna hämtas från servern släpps designändringar i appdelen utan ny version i butikerna. Ny version behövs bara när skalet eller de inbyggda delarna ändras.

### 2.5 Inloggning

- Samma Supabase-session med cookies som webben (appen laddar samma domän).
- **Google:** inbyggd inloggning (Capacitor-plugin) som ger en id-token, sedan `supabase.auth.signInWithIdToken`. Ingen omdirigering, så Googles spärr mot inbäddade webbvyer slår inte till.
- **Apple:** Inloggning med Apple, samma mönster. Ny leverantör i Supabase. Krävs enligt Apples riktlinje 4.8. Knappen läggs bara i appen; webben ändras inte.
- **E-post:** samma funktioner som webbens LoginFlode, i appens egen inloggningsvy.
- Mejllänkar (bekräftelse, återställning) öppnar appen via Universal Links och App Links: `public/.well-known/apple-app-site-association` och `assetlinks.json`. De gäller bara `/app/*`, så webbens länkar beter sig som i dag.

### 2.6 Köp i appen

- RevenueCat (`@revenuecat/purchases-capacitor`) med Supabase-användarens id som app-användare.
- Produkt: bara Premium 149 kr i månaden (prenumeration), samma som webben säljer (`SALJBARA_PLANER` i src/lib/plans/plans.ts). Ingen provperiod, inget Dagspasset (ägarens beslut 2026-11-13).
- RevenueCats webhook till ny rutt `src/app/api/app/revenuecat/route.ts` skriver och avslutar rader i `premium_grants` med källa `app_store` eller `play`. `premiumAccess.ts`, `features.ts` och gratisnivån ändras inte.
- Webbköp gäller i appen eftersom de redan står i `premium_grants`. Appen visar aldrig Stripe och länkar aldrig ut till köp.
- Uppsägning sker i butiken. Appens kontovy visar var och hur.
- Black Week-kuponger finns bara på webben. Kampanjer i appen planeras separat.

### 2.7 Push

- `@capacitor/push-notifications` med Firebase Cloud Messaging för båda plattformarna (Apples APNs-nyckel läggs i Firebase).
- Ny tabell `app_enheter` (user_id, token, plattform, paminnelse_tid, aktiv, skapad, senast_sedd) med RLS på egen rad.
- Utskicket "Dagens pass väntar" en gång per dag vid vald tid. Vi har max två Vercel-crons, så utskicket körs som Supabase pg_cron varje kvart som anropar en edge-funktion, inte som en tredje Vercel-cron.
- Frågan om notiser visas efter första klara passet, aldrig vid start.

## 3. Appens design (separat spår)

Designas av Fable-agent som art director, godkänns av ägaren i artefakt före bygge, byggs av Opus. Följer designsystemet i tokens och ikonspråk men är en egen produkt.

Vyer som ska designas:

1. Onboarding, tre steg (vad appen gör, välj mål, samtycke till analys)
2. Logga in och skapa konto (Apple, Google, e-post)
3. Idag: dagens pass, streak, nästa steg i Mitt test
4. Tester: katalogen över testtyper och Nivåkollen
5. Utveckling: kurvan och nivåerna
6. Konto: Premium-status, påminnelsetid, radera konto, logga ut
7. Köpvy (butikens köp)
8. Notisfrågan efter första passet
9. Flikraden och övergångarna mellan vyerna
10. Butiksmaterial: ikon (utgår från PWA-ikonen), skärmbilder 6,9 tum och Android, texter

Passvyerna själva designas inte om här. Ändras de ändras de för webben också, och det går genom den vanliga processen för testerna.

## 4. Faser och datum

**Ändrat 2026-11-13, ägarens beslut:** Android byggs nu, Apple väntar. Allt byggs så att iOS går att lägga till (`npx cap add ios`, `ios.appendUserAgent` finns redan i konfigurationen, inloggningsvyn har plats för Apple-knappen).

Läge 2026-11-13 (gren `feat/android-app`, inte driftsatt):
- Klart: proxyns omskrivning, appens ram under `/app` med tvillingsidor för alla testsidor, inloggning i appens ram, sidan "finns på jobbcoach.ai", Capacitor 8-skal i `mobilapp/` med Android-projekt, felvy utan nät, statusfält och safe-area. Debug-APK byggd på Windows och körd i emulatorn (Pixel 8). Verifierat med appens user agent: inloggning, testsidan, Nivåkollen startad och första frågan visad i appens ram; webben med samma konto oförändrad.
- Design: konceptet docs/design/app-koncept-2026-11-13.html godkänt av ägaren.
- Klart 2026-11-13, steg 1 och 2 (ej driftsatt): appens ram med egna typsnitt (Bricolage Grotesque och Figtree via next/font, bara i `src/app/app/layout.tsx`) och egna tokens i `src/app/app/testklar.css`, scopade under `[data-mobilapp]` med prefixet `tk-`. Flikraden Idag, Tester, Utveckling (`src/app/app/(flikar)/`) med aktiv flik, toning 160 ms och haptik, dold i passen, Nivåkollen och övningsproven. Adresser: `/dashboard` är Idag (`/app`), `/dashboard/tester` är Tester (`/app/katalog`), `/dashboard/tester/kurvan` är Utveckling (`/app/utveckling`), `/dashboard/installningar` är kontot (`/app/konto`); alla andra `/dashboard/tester/*` går som förut till tvillingarna (`APP_FLIK` och `appVag` i `src/lib/mobilapp/appvag.ts`). Vyerna är serverrenderade ur webbens läsare (getTraningSummary, byggHemvy, hamtaMotordata) via `src/lib/mobilapp/vyer.ts`, med skelett per flik, tomt läge i Utveckling, felvy och banner utan nät. Knapparna går till webbens adresser i `lib/traning/rutter.ts` och testConfig, så passen körs av den delade koden. Konto: profil, Premium-status, Mitt test, logga ut och radera konto (samma anrop som webbens Inställningar); köp och påminnelse visas men är inte kopplade. Skalet öppnar nu i Idag (`server.url` till `/dashboard`, kräver `npx cap sync`). Android-tillbaka: från Idag läggs flikar i historiken, Tester och Utveckling byter adress, arket för ett test och raderingsarket stängs med tillbaka. Verifierat i Chrome med appens user agent (412 och 360 px) och webbens `/dashboard` och `/dashboard/tester` pixelidentiska före och efter.
- Kvar i appens ram: kakbannern från rotlayouten ligger över flikraden tills samtycket flyttar till onboardingen; statusfältets ikonfärg byts via SystemBars men är inte provad på telefon; arket dras inte ned med gest; haptiken går via navigator.vibrate tills @capacitor/haptics läggs i skalet.
- Nästa: Nivåkollen före kontot och onboarding, Google-inloggning inbyggt, Google Play-köp via RevenueCat, push, butiksmaterial, signerad release och intern testkanal i Play.

Ursprunglig tidplan (iOS-delen skjuten):

| Fas | När | Vem | Innehåll | Klart när |
|---|---|---|---|---|
| 0 | nu till 30 nov | Ägaren | D-U-N-S-nummer, Apple Developer Program och Google Play som organisation, Firebase-projekt, RevenueCat-konto | Konton godkända |
| 1 | 1–5 dec | Opus | Delningen i 2.2, TestVagar, PassInnehall | Skärmbildsdiff av webben identisk, vitest grönt |
| 2 | 1–5 dec | Fable | Design av vyerna i avsnitt 3 i artefakt | Ägaren godkänt |
| 3 | 8–19 dec | Opus | `/app` i Next, spärren, Capacitor-skalet, inloggning, köp och push på Android | Klicktest på riktig Android som ny användare |
| 4 | 15–23 dec | Opus + ägaren | Android: intern testkanal, sedan produktion i Google Play | Live i Play |
| 5 | 15 dec–9 jan | Opus | iOS: molnbygge, Inloggning med Apple, StoreKit-sandlåda, APNs, TestFlight, inskickning | Godkänd av Apple |
| 6 | mitten av jan | Ägaren | iOS live | Live i App Store |

Android går ut först som skarp provkörning av hela kedjan. iOS-delarna designas och byggs för Apples krav från början.

## 5. Arbetsmiljö

| Del | Var |
|---|---|
| Appdelen i Next, delningen, design | Windows, Chrome och egen telefon |
| Android: bygge, emulator, USB, Play Billing, push, uppladdning | Windows, Android Studio |
| iOS: bygge och signering | GitHub Actions macOS-runner med fastlane, certifikat via App Store Connect API, ut till TestFlight |
| iOS: test | Ägarens iPhone via TestFlight |
| iOS: felsökning i webbvyn | Loggning till PostHog och konsolspegling från appen. Hyrd Mac i molnet bara om ett iOS-fel inte går att lösa så |

## 6. Mätning

Nya händelser i `src/lib/analytics/events.ts`, alla med `plattform` (ios, android):

- `app_installed` (första start), `app_open`, `app_onboarding_completed`
- `push_permission_shown`, `push_permission_granted`, `push_sent` (server), `push_opened`
- `iap_viewed`, `iap_started`, `iap_completed` (produkt), `iap_cancelled`

Avläsning fyra veckor efter iOS-lansering: andel som gör ett pass dag 2 till 7, app mot mobilwebb; köp per aktiv användare, app mot mobilwebb. Avbrottsgräns: under 30 installationer eller ingen skillnad i återkomst efter åtta veckor, då står appen i underhållsläge.

## 7. Risker

- **Apple avvisar enligt 4.2.** Motåtgärd: inbyggd inloggning, köp och push, egen appdesign och felläge. Vi skickar in med en förklaring av funktionerna.
- **Delningen ändrar webben av misstag.** Motåtgärd: skärmbildsdiff och PassFlode-testerna som grind, och fas 1 driftsätts ensam före allt annat.
- **Sessionen i webbvyn tappas på iPhone.** WKWebView kan rensa cookies. Motåtgärd: skalet sparar uppdateringstoken i säker lagring och återställer sessionen vid start.
- **Laddtid.** Appdelen omfattas av prestandabudgeten för inloggat (LCP under 1,5 s, CLS 0), mätt i appen på riktig telefon.
- **Butiksvillkoren ändras.** Kontrolleras igen vid inskickning.

## 8. Verifiering

- Fas 1: skärmbilder av alla testvyer på webben (Pixel 7 och desktop) före och efter, pixeldiff, plus `vitest` för `components/traning`. Webben driftsätts inte med fas 3 förrän fas 1 legat i drift utan avvikelse.
- Fas 3–5: klicktest på riktig telefon som ny användare med skärmdump per steg: installera, onboarding, skapa konto med Apple respektive Google respektive e-post, Nivåkoll, ett pass, notisfrågan, köp i sandlåda, Premium syns, radera konto. Testkonton raderas med id efteråt, aldrig med tidsfönster.
- Ett webbkonto med Premium loggar in i appen och har Premium, och ett appköp syns på webben.

## 9. Ägarens beslut

1. Pris i appen: samma som webben (rekommenderas) eller högre.
2. Appens namn i butikerna: "Jobbcoach" eller "Jobbcoach: Rekryteringstester" (det senare hjälper butikssök).
3. Notiser: fråga efter första passet (rekommenderas).
4. Designen i artefakten (fas 2).
5. Fas 0 är bara ägarens: D-U-N-S och konton.
