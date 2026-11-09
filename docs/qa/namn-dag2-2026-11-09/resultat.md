# Namnfältet och dag 2-mejlet, 9 november

Punkt 21 och 17 i `docs/plan-efter-analys-2026-11-08.md`, godkända av ägaren 2026-11-09. Klicktest med `scripts/qa-namn-dag2-2026-11-09.mjs` i riktig Chrome (puppeteer-core) på Pixel 7 (412 x 915) och desktop (1280 x 800) mot ett produktionsbygge. Skärmdumparna ligger utanför git.

## Klicktestet

| Körning | Resultat | Not |
|---|---|---|
| `resultat-lokal.json` | 44 av 46 | Hela vägen. De två felen var testets CV (fel form på `description`), inte koden: exporten gav 500 på testdatat. |
| `resultat-lokal-cv.json` | 28 av 28 | /register och CV-exporten igen med rättat test-CV. |
| `resultat-lokal-slut.json` | 28 av 28 | Efter rättningen av namnrutans fält på mobil (fältet föll ihop till 22 px i kolumnlayouten). |

Det som kontrolleras:

- /register och kontosteget efter provet har två fält, e-post och lösenord, utan sidledsscroll, och Skapa konto syns utan att rulla.
- Kontot skapas utan namn, bekräftelsemejlet går (200, inget fullName) och profilen har full_name null.
- Landningen och hemvyn visar ingen platshållare.
- CV-exporten utan namn svarar 422 name_required, rutan "Vi behöver ditt namn först" rullas in i bild, och efter namnet kommer PDF:en (200, application/pdf).
- Brevet utan namn stoppas med 422 före modellanropet. Rutan "Vilket namn ska stå under brevet?" visas, och efter namnet skrivs brevet med namnet i huvud och underskrift, utan "Namn saknas" eller "Ditt namn".

## Dag 2-mejlet

- Ett riktigt mejl gick genom morgonslottens väg (email_schedule, shouldSend, render, Resend, email_log) till en egen QA-adress i Resends testsänka. email_events fick `delivered`. Kontot och raderna raderades per id efter räkning.
- Torrtest (`npx tsx scripts/torrtest-dag2.ts [dag]`) räknar vilka som skulle få mejlet, utan att skicka.

## Testdata

10 QA-konton (`qa-namn-*@jobbcoach-qa.example.com`), 10 CV, 2 anonyma prov och 2 brev raderades per id efter räkning, se `stadning-kord.json`. Dag 2-testets konto (delivered+qa-dag2-*@resend.dev) raderades per id i samma körning som utskicket.
