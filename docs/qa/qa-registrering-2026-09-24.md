# QA: registreringstratten och profilen, 2026-09-24

Spec: `docs/design/profil-registrering-spec-2026-09-24.md` (version 3), design `docs/design/profil-registrering-2026-09-24.html`, saas-leads villkor `docs/rapporter/beslut-registrering-2026-09-24.md`.

Körning: produktionsbygge (`NEXT_DIST_DIR=.next-reg`, `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1`) på port 3119, riktig Chrome via puppeteer-core, Pixel 7 (412 × 915, touch, mobil user agent) och desktop 1280 × 800, ny inkognitokontext per genomgång. Skript: `scripts/qa-registrering.mjs` (våg 1) med `scripts/qa-registrering-vag2.mjs`, `-vag3.mjs`, `-vag4.mjs`. Skärmdumpar i `docs/qa/registrering/` (prefix `v1-` till `v4-`), resultat per våg i `resultat-vag-N.json`.

Google OAuth går inte att klicktesta headless. Vägen genom Googles redirect är simulerad i `src/components/registrering/__tests__/intent.test.ts`: cookien skrivs som i webbläsaren, läses som i `/auth/callback`, callbackens mål och valkommen-sidans landning väljs ur samma cookie, och callbacken inväntar `signup_completed` före redirecten (1,5 s tak).

## Utfall per våg

| Våg | Kontroller | Utfall |
|---|---|---|
| 1, mätningen och skalet | 35 | 35 OK |
| 2, tratten, ingångarna, bredden | 60 | 60 OK |
| 3, menyn och prenumerationen | 10 | 10 OK |
| 4, profilsidan | 23 | 22 OK, 1 inom brusgränsen (se nedan) |

### Våg 1
- /register (bar, `?borja=tester`, `?intervju=`, `?paket=all_month`, `?test=`) och /login i det publika skalet, Pixel 7 och desktop. Inga "Fem dagar Premium", 12 487, 94 %, 8 AI-verktyg eller CV:n skapade. Ingen footer. CLS 0 (cookie-bannern står ovanför foten redan i serverns HTML).
- Lösenord från `?paket=all_month` landar på `/dashboard/valj-spar?paket=all_month&steg=kop`.
- Befintlig adress ger felraden "Det finns redan ett konto med den adressen" och Logga in till `/login?borja=cv`.
- Testprovet utan konto (`?test=`, token skapad via `/api/public/test-session`) och sedan konto: valkommen-sidans hämtkedja landar på `/dashboard/tester`.
- Skärmdumpar: `v1-01` till `v1-14`.

### Våg 2
- Steg 1 på Pixel 7: fyra kort och Fortsätt ovanför foten utan scroll, Fortsätt spärrad med orsaken utskriven, piltangenter flyttar och väljer, Tabb går till Hoppa över, tillbaka från steg 2 behåller valet.
- `?borja=tester`: steg 2 direkt med "Du börjar med rekryteringstesterna", Ändra ger steg 1 med testerna förvalda.
- Testsidans fyra "Starta gratis test" går till `/register?borja=tester`.
- Ett nytt konto per val från headern: CV (Börja gratis till `/dashboard/skapa-cv`), personliga brev (`/dashboard/skapa-brev`), tester (Köp till köpsteget med Träningspaketet och samtycket), intervju (`/dashboard/intervju`), jobb (krysset gör som Börja gratis, `/dashboard/jobbmatchning`). Hoppa över landar på spårvalet utan förvalt kort.
- Databasen: `onboarding_intent` och `onboarding_track` stämmer för alla sex konton (cv/cv, brev/cv, tester/tester, intervju/tester, jobb/allt, null/null).
- Hemskärmen, gratiskonto med testvalet: "Du valde testerna, så vi börjar med träningen.", "Gör ditt första rekryteringstest" och "Vill du börja med CV:t i stället?". Kom igång: sex brickor i ordning, "Det du valde" och "Gratis i de andra delarna", ingen uppladdningsbricka.
- CV-kontot efter första CV:t: "Prova också" föreslår "Klarar du logiktestet?".
- Sidomenyn är identisk för CV- och jobbkontot (dessutom enhetstest för cv, tester och jobb).
- Skärmdumpar: `v2-01` till `v2-35`.

### Våg 3
- Sidomenyn: Profil och Prenumeration under Konto, ingen text trunkeras vid 256 px. På profilen är Profil aktiv, på prenumerationen Prenumeration, på Mina CV bara Mina CV. Toppraden "Konto · Profil" och "Konto · Prenumeration". Profilmenyn: Kom igång, Profil, Prenumeration, Logga ut. Paketkortens knappar klipps inte på desktop (56, 76 och 56 px höga).
- Skärmdumpar: `v3-01` till `v3-06`.

### Våg 4
- Pixel 7: fotoramen slutar vid 602 px och knappen vid 569 px (krav under 900), Överst i ditt CV slutar vid 1 383 px (krav under 1 400). Statusraden "Ort saknas i ditt CV" utan ordet foto, och den försvinner när orten fylls i. Sektionsordningen cv, personliga-brev, jobbsok, konto. Brevhuvudets växlar bara i Personliga brev. CLS 0.
- Hoppa till och `/dashboard/profil#personliga-brev` landar med rubriken under toppraden. Självsäker sparas och står kvar efter omladdning.
- Ett 5,2 MB-foto (4032 × 3024) laddas upp och sparas under 2 MB i lagringen. En PDF ger felraden "Filen går inte att läsa / Välj en bild i JPG, PNG eller WebP." under ramen, ingen toast. Ta bort sparas.
- Konto: Mejl från oss öppnar arket med två växlar.
- Desktop: CV-huvudets förhandsvisning till höger (232 px) fylls i. Smart val på gratisnivån öppnar luckan med paketnamn och pris.
- Den enda kontrollen som inte gav exakt 0: desktop-CLS 0,002, från toppradens högra del (`header.tsx`, knappen Bli hittad av rekryterare som kommer efter första målningen). Den finns på alla sidor under /dashboard och är inte ny; `scripts/perf-inloggat.ts` räknar 0,002 som mätbrus.
- Skärmdumpar: `v4-01` till `v4-09`.

## Prestanda

| Sida | LCP | Budget | CLS |
|---|---|---|---|
| /register (Pixel 7, 4G) | 468 ms | 1 500 | 0 |
| /register?borja=tester | 440 ms | 1 500 | 0 |
| /login | 440 ms | 1 500 | 0 |
| /dashboard (hemskärmen) | 912 ms | 1 000 | 0,001 |
| /dashboard/profil | 908 ms | 1 000 | 0,001 |
| /dashboard/profil/prenumeration | 664 ms | 1 500 | 0,001 |

## SEO

`scripts/seo-diff-artiklar.ts` mot ett bygge utan länkändringarna: /priser, /verktyg/rekryteringstester, /verktyg/cv-mallar, /verktyg/skapa-cv, /verktyg/personligt-brev, /verktyg/jobbmatchning, /verktyg/personlighetstest, /verktyg/cv-analys och startsidan är oförändrade (0 fel, `docs/qa/registrering/seo-diff.md`). Skriptet jämför länkar utan frågesträng, så `?borja=` syns inte där; de faktiska ändringarna står i `docs/qa/registrering/seo-register-lankar.txt` och är bara `/register` till `/register?borja=...`. /register och /login har samma robots-läge som i dag (ingen robots-meta, se rapporten).

## Städning

Alla konton skrevs med id till `scratchpad/qa-konton.json` när de skapades och raderades per id med `scripts/qa-registrering-stada.mjs --kor` (loggen i `docs/qa/registrering/stadning-kord.json`, torrkörningen i `stadning-torrkorning.json`):

- 18 QA-konton (`qa-reg-20260924-N-...@jobbcoach.ai`)
- cv_texts 2, email_confirmations 18, email_schedule 36, user_activities 175, profiles 18 rader, alla per `user_id in (...)` respektive `id in (...)`
- anon_test_sessions 2 rader per token
- 18 auth-användare raderade via auth admin, sist
- Kontroll efteråt: 0 profilrader och 0 auth-användare kvar för id:na. 0 foton kvar i lagringen.
