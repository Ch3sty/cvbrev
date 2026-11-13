# Utkast: Play-formuläret Datasäkerhet (Data safety), Testklar

Skrivet 2026-11-13 ur koden på grenen feat/android-app. Ägaren går igenom det före inskickning; ändras koden (nya tjänster, ny mätning) ska formuläret uppdateras samma dag. Play räknar data som "insamlad" när den lämnar telefonen, även om den bara går till våra egna tjänsteleverantörer (Supabase, Vercel, PostHog, RevenueCat, Google). Överföring till tjänsteleverantörer som behandlar data för vår räkning räknas inte som "delning".

## Grundfrågor

| Fråga | Svar | Varför |
|---|---|---|
| Samlar appen in eller delar någon av de obligatoriska datatyperna? | Ja | Konto, testresultat, köp, analys, push-token |
| Krypteras all insamlad data under överföring? | Ja | Allt går över HTTPS (webbvyn laddar https://www.jobbcoach.ai, cleartext bara i debugbygget mot lokal server) |
| Kan användaren begära att data raderas? | Ja | Konto > Radera konto i appen (src/components/mobilapp/KontoHandlingar.tsx, DELETE /api/app/konto) och samma på webben. Webbadress för radering: https://www.jobbcoach.ai/radera-konto (webbens radering via DELETE /api/konto/radera) |
| Delas data med tredje part? | Nej | Inget säljs eller lämnas vidare för andras ändamål. Supabase, Vercel, PostHog, RevenueCat, Google (FCM, inloggning) och Resend är tjänsteleverantörer |

## Datatyper

| Play-kategori | Datatyp | Insamlad | Delad | Obligatorisk eller valfri | Ändamål | Var i koden |
|---|---|---|---|---|---|---|
| Personuppgifter | E-postadress | Ja | Nej | Obligatorisk för konto (Nivåkollen går utan konto) | Appens funktioner, Kontohantering, Kommunikation från utvecklaren (bekräftelse och påminnelser via Resend, med eget mejlval för erbjudanden) | Supabase auth, /api/auth/send-confirmation, inloggningsvyn |
| Personuppgifter | Namn | Ja | Nej | Valfri (från Googles profil eller egen uppgift) | Appens funktioner, Kontohantering | profiles, Google-inloggning |
| Personuppgifter | Användar-id | Ja | Nej | Obligatorisk (även Nivåkollen utan konto får ett anonymt Supabase-id, som flyttas till kontot när det skapas) | Appens funktioner, Kontohantering, Analys | Supabase user id (anonym session i onboardingen, /api/app/anonym/overfor), RevenueCat app user id, PostHog identify |
| Finansiell information | Köphistorik | Ja | Nej | Obligatorisk vid köp | Appens funktioner (Premium), Kontohantering | RevenueCat-webhook /api/app/revenuecat skriver premium_grants. Kortuppgifter hanteras av Google Play och når aldrig oss |
| Appaktivitet | Interaktioner i appen | Ja | Nej | Obligatorisk (resultaten är appens kärna); analysdelen kräver samtycke | Appens funktioner (svar, nivå, kurva, serie), Analys | api/traning/*, PostHog autocapture och händelser i src/lib/analytics/events.ts |
| Appaktivitet | Annat användargenererat innehåll | Nej | | | | Appen har ingen fritext som sparas (CV och brev finns inte i appen) |
| Appinformation och prestanda | Kraschloggar | Ja (med analyssamtycke) | Nej | Valfri | Analys | PostHog capture_exceptions: ofångade fel i webbvyn |
| Appinformation och prestanda | Diagnostik | Ja (med analyssamtycke) | Nej | Valfri | Analys | PostHog, sidvisningar och laddtider |
| Enhets-id eller andra id | Enhets-id | Ja | Nej | Valfri (bara om notiser tillåts) | Appens funktioner (påminnelsen om dagens pass) | FCM-token i app_enheter via /api/app/enheter |
| Plats | Ungefärlig plats | Kontrollera | Nej | | Analys | PostHog härleder land och stad ur IP-adressen om GeoIP är påslaget i projektet. Stäng av GeoIP i PostHog (projekt 148688) och svara Nej, eller svara Ja med ändamål Analys |
| Plats | Exakt plats | Nej | | | | |
| Kontakter, foton, filer, ljud, kalender, hälsa, sms, webbhistorik | | Nej | | | | Appen begär inga sådana behörigheter (AndroidManifest: INTERNET, notiser) |

## Säkerhetsrutor

- Data krypteras under överföring: Ja.
- Användaren kan begära radering: Ja.
- Följer Play-policyn för familjer: Ej tillämpligt (målgrupp 18+).
- Oberoende säkerhetsgranskning: Nej.

## Att kontrollera före inskickning

1. PostHog GeoIP (ungefärlig plats), se tabellen.
2. Att samtyckesfrågan för analys finns i appens onboarding innan PostHog startar med lagring (agent A:s spår). Utan samtycke kör PostHog med persistence memory, men händelser skickas ändå; därför står analys som insamlad.
3. Om Google-inloggningen hämtar profilbild: lägg till "Foton" bara om bilden lagras hos oss (i dag inte).
4. Webbadressen för kontoradering (krav sedan 2024).
