# Rummen, slutligt klicktest

2026-10-11. Branch `design/rummen-klar` efter småfixarna. Riktig Chrome (puppeteer-core med systemets Chrome) mot ett lokalt produktionsbygge: `NEXT_DIST_DIR=.next-final TRANING_FORHANDSVISNING=1 npx next build`, sedan två servrar ur samma bygge:

- port 5200: `.env.local` plus `KONTAKT_MOTTAGARE=delivered@resend.dev`, så att kontaktformulären bara når Resends testadress
- port 5201: `.env.test.local` i processen (Stripes testnyckel och testlägets prisid), `RESEND_API_KEY=re_ogiltig`, bara för köpsteget

Skript: `node scripts/qa-rummen-final.mjs --port 5200 --kopport 5201 --extraip qa-final-direkt-1`. Varje sida öppnas i ett eget webbläsarkontext, så att inloggning aldrig läcker mellan sidorna. Resultatet per vy står i `resultat.json`, knappkontrollen i `knappar-360.json`, städningen i `stadning.txt`.

Former: Pixel 7 (412 px, adressfältet emulerat med scroll), 360 px och 1280 px, ljust och mörkt via systeminställningen.

## Konton

Fem konton med unika adresser `qa-final-<roll>-<tid>@jobbcoach-qa.test`, skapade med service-nyckeln (inga mejl):

| Roll | Innehåll |
|---|---|
| gratis | ett CV, ett personligt brev, registreringens val tester |
| premium | Premium via `premium_grants` (scope allt, 30 dagar) |
| mycket | gratis, fyra CV, sex brev, sex sökta tjänster, åtta testsessioner |
| spar | spårkund via `premium_grants` (scope cv) |
| ny | tomt konto för registreringens steg 3 |

Alla rader raderades efteråt per kontots id, räknade före varje delete, och en kontrollräkning efteråt gav **0 rader kvar för 5 konton** (auth, profiles och de av 18 användartabeller som finns i prod). Rate-limit-raderna från den publika kontaktvägen raderades på sin hashade nyckel (2 rader, 0 kvar). Dygnsräknaren för `kontakt` i `public_generation_budget` står på 2 efter körningarna; den är gemensam för alla besökare och har inte rörts.

## Resultat

| Del | Vyer | Utfall |
|---|---|---|
| De fem rummen (`rum/`): Rekryteringstester, CV, Personliga brev, Jobbsöket, Profil, tre konton, sex former, hård omladdning på Pixel 7 | 90 | Header eller nav synlig överallt, högst en primärknapp per vy, ingen vit yta i mörkt läge, inga förbjudna ord. Testrummet står i "Passet gick inte att hämta" för riktiga konton, eftersom migreringarna saknas i prod (se nedan) |
| Förhandsvisningarna (`forhandsvisning/`): hemvyns 20 tillstånd, passets 10 ramar | 132 | Inga fel, inga 4xx eller 5xx |
| `/dashboard/tester/alla` med provraden (`tester-alla/`), gratis och Premium | 12 | Provraden syns i alla |
| `/priser` utloggad (`priser/`) | 6 | h1 "Jobbcoach Premium, 149 kr i månaden", offerCount 1, inga betyg i schemat, ordet "dygn" finns inte |
| Betalväggarna (`vaggar/`): mallar, LinkedIn, Bli upptäckt, jobbmatchning, Jobbcoachen, CV-analysen, provläget i Alla tester, 1f, W3, M1, CV-gränsen, de låsta brevkorten, brevets nedladdning, sidomenyns lås, intervjuprovets kvotspärr | 70 | Köpknappen "Köp Premium, 149 kr i månaden" och prisraden där väggen visas. Intervjuprovets spärr länkar till köpsteget med `plats=intervjuprov` (429 simulerat i webbläsaren; själva `betalvagg_visad`-anropet syns inte i klicktestet, eftersom PostHog inte skickar något i headless-körningen) |
| Prenumerationssidan (`prenumeration/`), gratis, Premium och spårkund | 18 | Exakt en primärknapp för gratis och spårkund, ingen för Premium |
| Registreringen (`registrering/`): steg 1 och 2 med nätverksfel, steg 3 (förslaget) för val tester och CV | 10 | Felet "Kontot kunde inte skapas" visas, sidan står kvar, inget konto skapas. Förslaget visar bara Premium |
| Kontaktformulären (`kontakt/`): inloggat och publikt, nätverksfel i fyra former och en lyckad väg var | 10 | Nätverksfel ger felraden, aldrig Tack. Lyckad väg ger 200 och Tack; mejlen gick till delivered@resend.dev. Den publika vägen skrev sin rate-limit-rad, alltså gick den utan inloggning |
| Spårkunden i köpsteget (`spar409/`) | 3 | Raden "Du har CV-paketet. Byt till Premium på prenumerationssidan." och knappen "Till prenumerationssidan", som leder dit. Svaret 409 är simulerat i webbläsaren, eftersom en spårprenumeration bara finns i Stripe |
| Köpsteget till Stripe Checkout i testläge (`kop/`), Pixel 7 och 1280 | 2 | `/priser` till köpsteget till `checkout.stripe.com` med `cs_test_`. Ingen betalning genomförd |
| Knappkontrollen på 360 px | 54 routes | 0 knappar svämmar över |

Skriptet räknar 15 fel och 20 varningar. Ingen av dem är ett fel för användaren:

- **10 fel, Jobbsöket för gratis- och datakontot:** /dashboard skickar vidare till senaste rum (testrummet, efter registreringens val), och en hämtning i `use-profile` avbryts då med "Failed to fetch". Sidan som visas är rätt.
- **5 fel, brevets nedladdning:** servern svarar 402 på nedladdningen för gratiskontot, och Chrome loggar det innan betalväggen ritas. Väggen syns i `vaggar/brev-nedladdning-*-02-vagg.png`.
- **20 varningar:** Bli upptäckt, CV-analysen, Jobbcoachen och jobbmatchningen visar ingen betalvägg vid första besöket för ett gratiskonto. Väggen kommer först när hon gör något (kör analysen, når tio meddelanden, öppnar fler träffar). Inte testat steg för steg här.

## Det som inte gått att testa mot riktig data

- **Testrummet.** `test_planer`, testmotorns tabeller och våg 4:s kolumner finns inte i prod. Rummet är testat mot förhandsvisningarna. E2E mot prod görs med `qa-rummen-vag2-prod.mjs` och `qa-rummen-vag3b-prod.mjs` efter migreringarna (checklistan i `../OVERLAMNING.md`).
- **Stripe testläge visar "Abonnera på Hela paketet"** i kassan, eftersom testlägets produkt inte bytt namn. Live byts med `scripts/stripe-premium-byte.mjs --skarpt` (checklistan punkt 4).
- **Spårkundens byte** till Premium på prenumerationssidan är inte genomfört mot Stripe.

## Iakttagelse

Datakontot (gratis med fyra CV) visar "4 av 2 CV använda" under rubriken i Mina CV. Ett riktigt gratiskonto kan inte komma över två, men konton från före gränsen kan. Raden borde säga något som stämmer även då.
