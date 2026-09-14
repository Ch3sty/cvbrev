# Plan: Jobbcoach på hemskärmen (PWA-installation)

Beslutat 2026-09-14. Ägarens ord: frågan om hemskärmen visas efter första skapade brevet, alternativt första utförda logiktestet, första jobbmatchningen eller första nedladdade CV-mallen. All grafik godkänns av ägaren i en artefakt innan något slutförs.

## 1. Vad användaren får

En ikon på hemskärmen som öppnar Jobbcoach utan adressfält, som en app. Ingen appbutik, inget att ladda ner. På Android en fråga direkt i tjänsten; på iPhone en kort instruktion (dela, Lägg till på hemskärmen). Ingen offline-funktion, inget cachat inloggat innehåll: service workern finns bara för att webbläsaren ska erbjuda installation.

## 2. Varför

Ikonen är den billigaste återkomstkanalen vi kan få, och den öppnar för push-notiser på Android senare ("3 nya matchningar" utan mejl, se docs/plan-jobbmatchning.md våg 2).

## 3. När frågan visas

Första gången ett av dessa inträffar, direkt efter bekräftelsen, aldrig mitt i ett flöde:
- brevet sparat (skapa-brev steg 6, efter "Ditt brev till X är klart")
- logiktest slutfört (resultatsidan för logiska testet, alla nivåer)
- första jobbmatchningen körd (match_search_run, listan visad)
- CV-mall nedladdad (cv-mallar, PDF klar)

Regler: visas inte på första besöket oavsett trigger (kräver minst en tidigare session), visas aldrig när appen redan är installerad (display-mode standalone), avfärdad fråga väntar 30 dagar, accepterad eller installerad fråga visas aldrig igen. Tillståndet ligger i localStorage per enhet (installation är per enhet), plus händelserna i PostHog. Desktop: ingen egen fråga, webbläsarens ikon i adressfältet räcker.

## 4. Utseende

Följer docs/designsystem.md. Frågan är en rad i skalet ovanför bottennavet (samma form som e-postraden: 44 px hög, panel, kant), text "Lägg Jobbcoach på hemskärmen", textknapp "Lägg till" och X. På iPhone byter "Lägg till" till ett ark med tre steg och dela-ikonen ritad i vårt ikonspråk. Ingen modal, ingen orange yta.

## 5. Grafik som ska godkännas

- **Appikon** 512 och 192 px, plus maskable-variant (motivet inom den säkra cirkeln på 80 procent) och apple-touch-icon 180 px. Motiv: arket som lyfter ur mappen (samma hand som IlluArketLyfter, stroke i ink på benvit mark #EDE8DF, en accentfylld form #D9480F). Ingen text i ikonen.
- **Startfärger**: theme_color #EDE8DF, background_color #EDE8DF. Splash på Android genereras av manifesten (ikon på bakgrundsfärg).
- **Dela-ikonen** för iOS-arket i 24 px, samma ikonspråk som Ikoner.tsx.
- Förhandsvisning av raden och iOS-arket på 375 px.

Källorna är SVG i public/pwa/ och renderas till PNG med samma puppeteer-metod som Stripe-bilderna (scripts/render-stripe-images.ts).

## 6. Teknik

- `src/app/manifest.ts` (Next.js Metadata API): name "Jobbcoach", short_name "Jobbcoach", start_url "/dashboard?source=pwa", display "standalone", lang "sv", ikoner enligt ovan, `id` "/dashboard".
- `public/sw.js`: minimal, ingen cache av HTML eller API. Registreras i client-layout efter load, bara på appytor.
- `<meta name="apple-mobile-web-app-capable">`, apple-touch-icon och status-bar-style i rot-layouten.
- `src/components/shell/InstallPrompt.tsx`: lyssnar på beforeinstallprompt (Android), känner av iOS via user agent plus standalone-läge, exponerar `requestInstallPrompt(trigger)` via en liten store som de fyra ställena anropar.
- Händelser i src/lib/analytics/events.ts: pwa_prompt_shown (trigger, platform), pwa_prompt_accepted, pwa_prompt_dismissed, pwa_installed (appinstalled), pwa_launch (start_url med source=pwa vid första sidvisning).
- Prestanda: inget nytt i den kritiska vägen; komponenten laddas lazy efter idle. CLS 0: raden har reserverad höjd bara när den visas, och den visas efter en användarhandling, aldrig vid inladdning.

## 7. Verifiering

Puppeteer med Pixel 7: simulera beforeinstallprompt, kontrollera att raden visas efter trigger och inte utan tidigare session, att avfärdande sparas, att standalone döljer allt. Manifest validerad med Chrome DevTools Application-fliken (Lighthouse PWA-installerbar). iOS-arket renderat. Ägaren testar på riktig Android och iPhone efter deploy.

## 8. Ägarens beslut

Grafiken i artefakten. Push-notiser är ett eget beslut senare.
