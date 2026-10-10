# QA: E-post i CV och brev + numeriska testet (2026-10-10)

Branch `fix/kontaktepost-numeriskt`. Lokalt produktionsbygge (`NEXT_DIST_DIR=.next-x`), riktig Chrome via puppeteer-core, Pixel 7 (412×915) och desktop (1280×800). Skript: `scripts/qa-kontaktepost.mjs`, konton: `scripts/qa-kontaktepost-konton.mjs`. Rålogg: `docs/qa/kontaktepost/resultat.jsonl`.

## E-post i CV och brev (båda vyerna gröna)

| Steg | Pixel 7 | Desktop |
|---|---|---|
| Profil: ny adress sparas (fält + databas) | OK | OK |
| Brev steg 5: raden "E-post i brevet" visar nya adressen, Skapa mitt brev i bild | OK | OK |
| Genererat brev har nya adressen | OK | OK |
| Brevets PDF har nya adressen | OK | OK |
| CV-mall: raden och PDF:en har nya adressen | OK | OK |
| Profil: tömt fält visar kontoadressen igen, databasen null | OK | OK |
| CV-mall: PDF:en har kontoadressen igen | OK | OK |
| Mina brev: sparat brev laddas ner med kontoadressen (adressbytet i sparad HTML) | OK | OK |
| Ogiltig adress stoppas på klienten och servern (400) | OK | OK |
| Konsolfel / 4xx–5xx | inga (utom den avsiktliga 400:an) | inga (utom den avsiktliga 400:an) |

PostHog: `document_email_changed` kom fram från servern (`$lib: jobbcoach-server`), utan adressen.

## Numeriska testet

Före fixen (`kontaktepost/fore-fix/`): tabellen klippte kolumnerna längst till höger på Pixel 7 utan tecken på att den gick att svepa, och 4 av 32 svar försvann i en körning (överlappande sparningar).

Efter fixen: hubben säger 32 frågor, ca 30 min. Alla 32 svar sparade, sessionen slutförd, resultatet "av 32" på både Pixel 7 och desktop. Inga konsolfel eller nätverksfel.

## Städning

Två konton (`qa-epost-allt/gratis-2026-10-10@jobbcoach-qa.test`), raderade per user_id efter räkning: letters 8, cv_texts 2, logic_test_v4_sessions 5, formatted_cv_downloads 8, user_activities 173, profiler 2, auth-användare 2. Kontrollfråga efteråt: 0 kvar.
