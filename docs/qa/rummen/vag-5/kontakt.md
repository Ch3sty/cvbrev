# Kontaktformuläret i inloggat läge, våg 5

2026-10-11, branch design/rummen-klar. Inget riktigt meddelande har skickats.

## Vad som fanns

Varken det inloggade formuläret (`src/components/kontakt/KontaktForm.tsx`, /dashboard/kontakt) eller det publika (`src/components/kontakt/KontaktFormPublik.tsx`, /kontakt) hade någon backend. Båda väntade 1,5 sekunder i en simulerad submit och visade sedan "Tack för ditt meddelande. Vi svarar inom 24 timmar." Det fanns ingen `/api/contact`, ingen tabell och inget mejl; anropet stod bortkommenterat i båda filerna. Alla meddelanden som skrivits i formulären har alltså försvunnit.

Det enda befintliga sättet att skicka text från en användare till supporten är `/api/bugg-feedback`: inloggad användare, Resend till support@jobbcoach.ai, svar till användaren. Den nya routen följer det mönstret.

## Vad som byggts

- `src/app/api/contact/route.ts`: POST. Kräver inloggning (401 annars), validerar fälten (400), läser behörigheten med `userHasAccess(..., 'any')` och skickar ett mejl via Resend till support@jobbcoach.ai med `replyTo` satt till adressen i formuläret. Har kontot Premium står `[PREMIUM]` i ämnet, så att "Har du Premium får du svar först" går att följa i inkorgen. Saknad nyckel, fel från Resend eller ett undantag ger 500. Ingen tabell skrivs.
- `src/app/api/contact/kontakt.ts`: validering (alla fält, e-postformat, längdtak 120/254/200/5000 tecken), mejlet med HTML-escaping av allt användaren skrivit och ämnet utan radbrytningar (ingen rubrikinjektion). `KONTAKT_MOTTAGARE` får styra om mottagaren, men bara till en adress på `@resend.dev`; alla andra värden ignoreras.
- `KontaktForm.tsx`: `fetch('/api/contact')`. Tack visas bara på 2xx. Ett svar utan 2xx visar routens mening i felrutan ("Det gick inte att skicka"), ett nätverksfel visar "Vi nådde inte fram. Fälten står kvar, tryck Skicka igen, eller maila support@jobbcoach.ai." Fälten töms bara efter Tack, så Skicka-knappen är försöket igen.
- Texterna enligt copy-premium: platshållaren "En fråga om din prenumeration" (inloggat och publikt), "Inloggning, betalning eller din prenumeration. Har du Premium får du svar först." i KontaktInfo och KontaktInfoPublik, och "Har du Premium får du svar först" i stället för "Har du ett paket hanteras ditt ärende först".

Det publika formuläret är inte kopplat. Routen kräver inloggning, och ett öppet formulär utan inloggning behöver skydd mot skräppost (hastighetsgräns, honungsfält) som är ett eget beslut. Det publika formuläret visar alltså fortfarande Tack utan att skicka något; se frågan i våg 5-rapporten.

## Hur det verifierats

- `src/components/kontakt/__tests__/KontaktForm.test.tsx` (fetch mockad): 200 ger Tack och rätt kropp till /api/contact; 500 ger felrutan, aldrig Tack, fälten står kvar och ett nytt klick med 200 ger Tack; nätverksfel (TypeError) ger standardtexten och aldrig webbläsarens; 401 utan läsbar kropp ger standardtexten.
- `src/app/api/contact/__tests__/route.test.ts` (Resend, Supabase och behörigheten mockade): 200 med mottagare, replyTo, ämne och escapad HTML; `[PREMIUM]` i ämnet; 500 när Resend svarar med fel (ogiltig nyckel), när nyckeln saknas (Resend anropas inte) och när Resend kastar; 401 utan inloggning; 400 vid tomma fält, fel e-post och trasig JSON; att `KONTAKT_MOTTAGARE` bara accepterar resend.dev.
- `npx vitest run src/components/kontakt src/app/api/contact`: 15 av 15 gröna.

## Hur det verifieras skarpt utan att nå ägarens inkorg

Ingen databas rörs, så det finns inga rader att städa. Kör lokalt på en annan port än 3000, inloggad med ett eget QA-konto (unik adress, `qa-vag5-kontakt-<tid>@jobbcoach-qa.test`, raderas per id efteråt enligt feedback_testdata_stadning).

1. **Felvägen, ogiltig nyckel.** Starta servern med `RESEND_API_KEY=re_ogiltig`. Skicka formuläret. Väntat: Resend svarar 401, routen 500, formuläret visar "Det gick inte att skicka" med routens mening, fälten står kvar, inget Tack. Inget mejl kan gå iväg med en ogiltig nyckel.
2. **Felvägen, nätverket.** Med DevTools i offlineläge: formuläret visar "Vi nådde inte fram", aldrig Tack.
3. **Lyckad väg utan ägarens inkorg.** Starta servern med den riktiga nyckeln och `KONTAKT_MOTTAGARE=delivered@resend.dev`. Skicka. Väntat: 200, Tack, och mejlet syns i Resends logg som levererat till delivered@resend.dev, med ämnet `[KONTAKT] ...` och replyTo satt till formulärets adress. support@jobbcoach.ai får ingenting. Sätt aldrig variabeln i Vercel; i produktion ska den saknas.
4. **Efteråt:** radera QA-kontot per id, räkna med `select count(*)` före.
