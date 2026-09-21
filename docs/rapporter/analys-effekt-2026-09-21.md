# Effektanalys: en vecka med Tråden, 14 till 21 september 2026

Kort sammanfattning. Full rapport med tabeller och diagram: `analys-effekt-2026-09-21.pdf`, källa `analys-effekt-2026-09-21.html`.

Mätfönster: **14 till 21 september (8 dagar)** mot **31 augusti till 13 september (14 dagar)**.

## Läs det här först

Med 20 nya konton efter och 28 före är nästan ingenting statistiskt säkerställt. En enda persons beteende flyttar varje andel med tre till fem procentenheter. Procenttalen nedan är riktning, inte signifikans.

Det som däremot är säkert oavsett urvalsstorlek är de tekniska konstaterandena: en tom tabell, en funktion som inte returnerar ett fält, och en Stripe-logg utan sessioner.

| Live (svensk tid) | Vad | Ålder | Går att bedöma? |
|---|---|---|---|
| 14 sep 02:30 | Designsystem v2 "Tråden", hela inloggade vyn | 8 dagar | Riktning på engagemang, inte konvertering |
| 14 sep 15:00 | Jobbmatchning våg 1 | 7 dagar | Nej, för ung |
| 14 sep 23:30 | PWA-installation | 7 dagar | Delvis, 10 visningar och 2 installationer |
| 15 sep 12:00 | paywall_shown / paywall_cta_clicked, analytics-kö | 6 dagar | Ja, men fönstret är 6 dagar |
| 15 sep 18:40 | Auth-låset, CV-analysen slutade hänga | 6 dagar | Ja, mycket tydligt utfall |
| 16 sep 00:30 | Ny admin, nio sidor | 5 dagar | Ja, som verktyg |

## Fem slutsatser

1. **Produkten blev mätbart bättre, men bara för dem som redan var inne.** CV-analysen gick från 1 slutförd av 9 startade till 20 av 20. Sidor per session 1,83 till 3,01. Reverse trial träffar nu 19 av 20 nya konton mot 2 av 28.
2. **Ingen konverterar därför att nästan ingen ser ett pris.** `paywall_shown` har utlösts 3 gånger av 1 person sedan 15 september. `paywall_cta_clicked` noll. Stripe har inte haft en checkout-session sedan 9 september.
3. **Reverse trial brinner utan att någon är där.** 19 konton fick fem dagar Premium, 16 har noll aktivitet efter dag 1. Sex trialperioder har löpt ut utan köp. Ett enda `trial_day5`-mejl har någonsin skickats.
4. **Tester och mallnedladdningar syns inte därför att Funnel-sidan aldrig hämtar dem.** `sannaFunktioner`, `tester` och `mallar` är deklarerade i typen `FunnelData` men returneras aldrig av `hamtaFunnelData`.
5. **Trafiken går bäst, och Tråden rörde den inte.** Position 22,7 till 11,5, CTR 0,86 till 2,24 procent. Tråden träffade bara inloggat läge, publika sidor är orörda. Adminen visar det inte: `admin_gsc_daily` har inte fyllts sedan 12 september.

## Aktivering, andel av nya konton

Mätt mot varje funktions egen sanningskälla, inte mot `user_activities`.

| Handling | Källa | Före (28 kt) | Efter (20 kt) |
|---|---|---:|---:|
| Laddat upp eller byggt CV | cv_texts | 46 % | 50 % |
| Skapat brev | letters | 25 % | 15 % |
| CV-analys som blev klar | cv_analysis_jobs | 4 % | **20 %** |
| Slutfört logiktest | logic_test_v4_sessions | 43 % | 35 % |
| Laddat ned CV-mall | formatted_cv_downloads | 7 % | **20 %** |
| Kört jobbmatchning | job_matchings_cache | 0 % | 10 % |
| Loggat en ansökan | job_applications | 0 % | 0 % |
| Fick reverse trial | profiles.premium_source | 7 % | **95 %** |

## Konverteringstratten i siffror, 14 till 21 september

| Steg | Antal |
|---|---:|
| Sessioner | 465 |
| Registreringsgrind visad | 32 |
| Registrering påbörjad | 22 |
| Nya konton | 20 |
| Varav fick reverse trial | 19 |
| **Nådde en betalvägg** | **3** (1 person, 1 sida) |
| **Klickade på betalväggen** | **0** |
| **Nådde kassan (Stripe)** | **0** |
| **Betalade** | **0** |

MRR 596 till 447 kr (en uppsägning 16 sep). Prisstegen har sålt noll enheter sedan den gick live 11 september: `premium_grants` är helt tom. Två avbrott 13 september, båda med orsak "för dyrt", båda på månad 149 kr.

**Var det faller:** mellan trial och betalvägg, inte vid kassan. En användare med aktiv Premium möter aldrig en betalvägg. Vi ger bort fem dagar och eliminerar därmed precis den yta som ska sälja, och när trialen tar slut dag sex är personen redan borta.

## Engagemang

| Mätpunkt | Före | Efter |
|---|---:|---:|
| Sidvisningar per dag | 119 | 175 |
| Sidor per session | 1,83 | 3,01 (se varning) |
| Aktiva konton per dag | 4,2 | 5,7 |
| Återkom dag 2 | 11 % | 10 % |
| Återkom dag 7 | 4 av 28 | strukturellt omätbart |

Två varningar. **Sidor per session** blandar äkta beteende med att analytics-kön (live 15 sep 12:00) gjorde att vi började räkna händelser som tidigare föll bort. **Dag 7** kan inte finnas för en kohort som är högst sju dagar gammal. Dag 2 är den enda återkomstsiffran som jämför lika mot lika, och den står stilla på cirka tio procent mot målet 45 procent.

## Varför adminen inte visar tester och mallnedladdningar

1. **Funnel deklarerar fyra fält den aldrig fyller.** `src/app/admin/funnel/data.ts` rad 144 definierar `sannaFunktioner`, `tester` och `mallar`. Returblocket rad 285 returnerar dem inte. Ingen kod i filen läser `logic_test_v4_sessions`, `personality_test_sessions` eller `formatted_cv_downloads`.
2. **`test_completed` i user_activities är opålitlig.** Den loggas bara när resultatsidan visas. Sanningen står i `logic_test_v4_sessions.completed_at`.
3. **Översikt läser inte funktionsanvändning alls.** `src/app/api/admin/oversikt/data.ts` läser bara `admin_error_log`, `user_activities` och `admin_user_rows`.
4. **Två aggregattabeller har slutat fyllas.** `admin_gsc_daily` sedan 12 sep, `admin_funnel_weekly` sedan 14 sep. Ingen skrivare finns i repot. Funnel visar därför 56 sidvisningar för veckan 14 sep när det verkliga talet är cirka 1 400.

**Förslag:** en sektion "Funktioner, sanningskällor" i Funnel (S, typen finns redan), en rad med gårdagens fem funktioner på Översikt (S), döp om user_activities-tabellen till "Spårningskontroll", och lös påfyllningen genom direkträkning med `unstable_cache` i stället för förberäknad tabell (M, behöver beslut).

## Fem åtgärder, två veckor

| Pri | Åtgärd | Insats | Förväntad effekt |
|---:|---|---|---|
| 1 | **Visa priset under trialen.** En stående rad med dagar kvar och vad det kostar att behålla, klickbar till prisstegen. | M | 3 till 15-20 betalväggsvisningar i veckan |
| 2 | **Laga trial-mejlen.** Ett `trial_day5` har någonsin skickats medan rt_day0 till rt_day6 fungerar. | S | Återför en del av de 16 inaktiva, rt-serien öppnas av 40 till 57 % |
| 3 | **Fyll Funnel-sidans sanningskällor.** | S | Du ser tester och mallnedladdningar |
| 4 | **Ge mallnedladdningen mer plats** på hemskärmen i Mitt jobbsök. Snabbast växande funktionen. | S | Fler aktiverade, naturlig betalvägg vid uttag |
| 5 | **Attributionen skriver ingenting.** `acquisition_source` null för alla 48 konton trots att kolumnen finns sedan 11 sep. | M | Nästa rapport kan säga vilket innehåll som ger betalande |

Åtgärd 1 och 2 är de enda som kan flytta intäkt inom två veckor. Trafiken rörs inte: den växer av sig själv och är det enda som inte är trasigt.

## Behöver ägarens beslut

- **Åtgärd 1 rör reverse trial.** Att visa priset under trialen ändrar inte villkoren men ändrar känslan från "fem gratis dagar" till "fem dagar, sedan kostar det".
- **Påfyllningen av aggregattabellerna.** Två Vercel-croner är upptagna. Jag föreslår direkträkning med cache framför att prioritera om crontaket.
- **Prisstegen har sålt noll på tio dagar.** Rör inte priserna förrän åtgärd 1 gett betalväggen en publik. Att sänka ett pris som ingen sett är att kasta bort informationen.

## Datakvalitet

| Vad vi inte ser | Varför | Vad som krävs |
|---|---|---|
| Om Tråden förbättrade konvertering | Åtta dagar gammalt, konvertering kräver två veckor | Läs om efter 28 september |
| Om jobbmatchningen fungerar | Sju dagar, tre personer har öppnat sidan | Volym, tidigast 28 september |
| Sanna sidor per session | Analytics-kön live 15 sep 12:00 blandar räkning med beteende | Mät 15 till 29 sep mot 29 sep till 13 okt |
| Dag 7-retention efter | Kohorten är högst sju dagar | 28 september |
| Registreringar i PostHog | `signup_completed` 8 mot `profiles` 20, Google-login utlöser sannolikt inte händelsen | Åtgärd 5 |
| Attribution till kluster | `acquisition_source` null för alla 48 konton | Åtgärd 5, kolumnen är trasig och inte tom av åldersskäl |
| Trafik och tratt i adminen | Ingen skrivare finns i repot | Avsnitt 7 punkt 4. Rapportens siffror är hämtade direkt från API:t |
| Testdata 13 september | 31 sessioner av en användare, noll slutförda, ser ut som egen testning | Uteslutet ur avsnitt 3 |

Tabellnamnen är kontrollerade mot `information_schema` 21 september. `test_results` finns inte, och inga nyare testtabeller (V6/V7, numeriska, verbala) har tillkommit: logiktesten ligger i `logic_test_v4_sessions` grupperat på `test_type`.
