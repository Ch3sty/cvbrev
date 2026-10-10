# QA: kontaktuppgifter i CV och brev + svarssparningen i testerna (2026-10-10)

Branch `fix/kontaktepost-numeriskt`. Lokalt produktionsbygge (`NEXT_DIST_DIR=.next-y`, port 3483), riktig Chrome via puppeteer-core, Pixel 7 (412×915) och desktop (1280×800). Skript: `scripts/qa-kontaktuppgifter.mjs`, konton: `scripts/qa-kontaktuppgifter-konton.mjs`. Rålogg: `docs/qa/kontaktuppgifter/resultat.jsonl`. Skärmdumpar, PDF:er och Word-filer i `docs/qa/kontaktuppgifter/`.

Konton: `qa-kontakt-pixel7-2026-10-10@jobbcoach-qa.test` och `qa-kontakt-desktop-2026-10-10@jobbcoach-qa.test`. Hela paketet via en rad i `premium_grants`, inga premium- eller Stripe-kolumner i profilen.

## Kontaktuppgifter (`kontakt-*`)

| Steg | Pixel 7 | Desktop |
|---|---|---|
| CV-mall: raden visar CV:ts namn, telefon, e-post, ort | OK | OK |
| CV-mall: Ändra namn, telefon och e-post i raden, raden visar nya värden | OK | OK |
| CV-mall: förhandsvisningen hämtas om med nya värden | OK | OK |
| CV-mall: PDF:en har nya namn, telefon och e-post, inte det gamla namnet | OK | OK |
| CV-mall: profil och CV:ts structured_data sparade | OK | OK |
| CV-mall: hård omladdning, värdena ligger kvar | OK | OK |
| Brev steg 5: Ändra i raden, raden visar nya värden | OK | OK |
| Brev steg 6: brevet skrevs med värdena från steg 5 | OK | OK |
| Brev steg 6: Ändra i raden, förhandsvisningen byts direkt (ingen nedladdning), inga gamla värden kvar i huvud eller avslutning | OK | OK |
| Brev: PDF har värdena från steg 6 | OK | OK |
| Brev: Word har värdena från steg 6 | OK | OK |
| Mina brev: visning och PDF följer profilen | OK | OK |
| LinkedIn-import utan namn och e-post: sparas utan platshållare | OK | OK |
| LinkedIn-import, raden och PDF:en har profilens uppgifter | OK | OK |
| LinkedIn-import från äldre klient (Ditt namn, din@email.com, Professionell titel): rensas vid källan | OK | OK |
| LinkedIn-CV importerat före fixen: raden och PDF:en har profilens uppgifter, inga platshållare | OK | OK |
| Nätverksfel 4xx/5xx | inga | inga |
| Konsolfel | React #185 i steg 2 (se nedan) | React #185 i steg 2 (se nedan) |

## Profilsidan (`profil-*`)

| Steg | Pixel 7 | Desktop |
|---|---|---|
| Namn och telefon sparas via servern, brevhuvudets toggel orörd | OK (andra körningen) | OK |
| CV med profilens gamla värden följer med, CV med eget namn orört | OK (andra körningen) | OK |
| CV med eget namn visar sitt eget namn i raden vid CV-mallen | OK | OK |

Första Pixel 7-körningen loggade FEL: trippelklicket tömde inte fältet med pekskärmsemulering, så skriptet skrev det nya numret framför det gamla. Fel i skriptet, inte i appen (servern sparade och flyttade exakt det som stod i fältet). Rättat till `select()` och körts om.

## Testerna (`tester-*`)

| Steg | Pixel 7 | Desktop |
|---|---|---|
| Matrislogik grund, snabba klick: 15 klick, 15 sparade, 15 unika, poängen = antal rätt i svaren | OK | OK |
| Skurtest mot `/api/logicTestV4/answer`: 20 samtidiga anrop (15 frågor + 5 omval) ger 15 svar | OK | OK |
| Verbalt grund, alla fyra påståenden per passage i samma tick: 60 klick, 60 sparade, 60 unika | OK | OK |
| Hubben: matris 15 frågor, verbalt 60 frågor | OK | OK |
| Konsol- och nätverksfel | inga | inga |

## Avvikelse: React-fel #185 i brevflödet (fanns före ändringarna)

`Minified React error #185` (maximalt uppdateringsdjup) i `/dashboard/skapa-brev?steg=2`. Återskapas så här: logga in, öppna `/dashboard/cv-mallar`, gå sedan till `/dashboard/skapa-brev`, välj CV, Fortsätt, skriv i annonsfältet. Utan besöket på CV-mallar kommer felet inte. Samma recept ger samma fel i det äldre bygget `.next-x` (före ändringarna i den här omgången), så felet är inte nytt. Flödet går vidare och brevet skrivs. Troligen samma fel som bugg 6 i `qa-kop-testlage-2026-09-24.md`. Inte åtgärdat här.

## Städning

Fyra konton (två per körning, kontona skapades om en gång efter en rättning av testdatan), raderade per user_id efter räkning:

- Första omgången: letters 1, cv_texts 4, logic_test_v4_sessions 3, user_activities 30, premium_grants 2, profiler 2, auth-användare 2.
- Andra omgången: letters 2, cv_texts 10, logic_test_v4_sessions 6, formatted_cv_downloads 12, user_activities 122, premium_grants 2, profiler 2, auth-användare 2.
- Under körningen raderades dessutom fyra egna CV:n via id efter räkning (LinkedIn-importens CV-gräns).

Kontrollfråga efteråt mot alla fyra user_id: 0 rader i auth.users, profiles, cv_texts, letters, logic_test_v4_sessions, premium_grants och user_activities.
