# Byggnoter: mejlreglerna och raderingen av ett konto

Byggorder: `docs/beslut-mejl-och-radering-2026-11-22.md`. Arbetskopia `C:\Users\chris\cvbrev-publikt3`, gren `design/publikt-omgang3`. Byggt 2026-11-22. Inget pushat, ingen migrering körd, inget mejl skickat, inget konto skapat eller raderat, inga skrivningar mot produktionens databas. Läsfrågor mot produktionen, PostHog (HogQL) och auth.users (listUsers) har gjorts för kontroller och torrkörningar.

Avsnittet "Till ägaren för godkännande" (policyns nya lydelse) är inte infört. Integritetspolicyn, villkoren och samtyckestexterna är orörda.

## Commits

| Punkt | Commit | Vad |
|---|---|---|
| Beslutet | `f8e3f088` | Beslutsdokumentet committat |
| 1a | `82e5c2a0` | Förnyelsebeskedet går också till den som stängt av påminnelser |
| 1b | `8f15193d` | `/api/quota/remind` tar bara emot veckans brev och dagens test |
| 1c | `cf653cce` | Kampanjen "Vi ändrar gratisnivån" pensionerad |
| 1d | `08e3b2c2` | Kvotpåminnelsen frågar behörigheten |
| 1e | `ff6585f9` | Mejlet om Jobbsöket, byggt och avstängt (`dag: null`) |
| 2c.1 | `bf76fe21` | Migreringen `20261123090000_konto_avslut.sql`, ej körd |
| 2c.2 till 2c.5 | `004ef052` | Raderingen: fler tabeller, avslutsraden, PostHog med kö, rutterna |
| 2c.6 | `4e839822` | Webbens raderingsark |
| 2c.7 | `4018e214` | Appens raderingsark |
| 2c.8 | `9b050f49` | Adminens sektion Raderade konton |
| 2d | `452a8983` | Skripten för rester, torrkörning som förval |
| Logg | (denna fil) | |

## Vad som byggdes, per punkt

**1a.** `runner.ts`: avregistreringen kontrolleras efter förnyelseblocket, med kommentaren ur beslutet. Test `komigang-urval.test.ts` (fyra fall ur beslutet).

**1b.** `arAterkommandeKvot` och `kvotensFeature` överst i `quota-back.ts`, ordagrant. Rutten svarar 400 `feature_utan_aterkomst`. `copyFor` utan `includes('prov')`, `DEFAULT_COPY` står kvar. Tester i `quota-back.test.ts` och `api/quota/remind/__tests__/route.test.ts`. Alla testnycklar i koden (`test:matrislogik-prov`, `test:numerical-reasoning-v2` med flera) passar mönstret.

**1c.** Mallen raderad, registret utan posten och exporten, filhuvudet med beslutets mening. `GRATIS_TESTRAD` och dess vakt borttagna, liksom blocken i `agarpunkter-mejl.test.ts` och `qa-live-mejl.test.ts`. `format.ts` orörd. `registry.test.ts`: `campaign_gratisniva_andras` ger `null`.

**1d.** Loopen utbruten till `src/lib/email/kvotPaminnelse.ts` (rekommendationen i beslutet). Behörigheten läses med `userHasAccess` och `kvotensFeature`. Test `kvotPaminnelse.test.ts` mot den riktiga `userHasAccess`: gratiskonto får mejlet, Dagspasset i `premium_grants` och admin får inget, `cv_analysis` markeras utan mejl, avregistrerad får inget.

**1e.** Mallen `campaign-jobbsoket.ts` med J1 till J10 ordagrant, `jobbsoketUtskick.ts` (urvalet med sju villkor, utskicket i omgångar om 100 med 700 ms paus, `arUtskicksdag`), steg 0b i morgonslotten, admin-rutten `api/admin/email/jobbsoket` (status, förhandsvisning, test, reservutskick bara på dagen), kortet "Mejlet om Jobbsöket" under Köpmejl med `JobbsoketKort.tsx`. `talOrdTill20` flyttad till `src/components/publikt/talord.ts`, exporten i `sokta-tjanster-data.ts` står kvar. Test `jobbsoket.test.ts` (21 fall: lydelserna, varje spärr för sig, `harBrev`, kanten för 90 dagar, utskicksdagen i svensk tid, admin-rutten med 409 och förhandsvisning utan utskick). Mejlet ritat i 600 och 375 px och jämfört med kvotväggsmejlet: samma skal, samma typsnitt, samma knapp och fot.

**2c.1.** Migreringen exakt enligt beslutet. Inte körd.

**2c.2 till 2c.5.** `raderaKonto.server.ts`: sex nya rader i `LOSA_RADER`, `admin_actions` får `metadata` och `description` nollade (båda kolumnerna tillåter null, kontrollerat), `kontotsAdresser` läser också `contact_email` och varje `email_log.recipient` före raderingen av loggen. `raderaKonto(admin, userId, opts?)`: avslutet läses före Stripe, skrivs efter `deleteUser`, PostHog efter det; inget av dem kan ge `ok: false`. `avslut.ts` (rena intervall och `ANLEDNINGAR`) och `avslut.server.ts` (`lasAvslut`). `posthogRadering.server.ts` (`raderaIPosthog`, `korPosthogRaderingar`). Midnattsslotten i `pricing-sync` tömmer kön (steg 2d), ingen ny cron. Adminens två raderingsvägar anropar PostHog efter `deleteUser` men skriver ingen avslutsrad. Rutterna läser anledningen med `lasAnledning`.

PostHogs ändpunkt kontrollerad mot källkoden (`posthog/api/person.py` på GitHub, 2026-11-22; dokumentationssidan gick inte att läsa): `POST /api/projects/{id}/persons/bulk_delete/`, fälten `distinct_ids` och `delete_events`, behörigheten `person:write`, högst 1 000 id per anrop, svar 202.

**2c.6.** Lydelserna R1 till R11 i `src/lib/konto/radera-copy.ts`. Arket i `KontoSection.tsx`: R2, R3, R4 bara med Stripe, R4b bara med Play, R5 med länken, frågan R6/R7 med sex chips (fieldset, `aria-pressed`, minst 44 px, `rounded-xl`, kant i stället för skugga, valt läge `border-ink-1`). Den osanna raden om att paketet inte sägs upp är borta. `useKontoHandlingar` skickar `{ anledning }` och visar R9a eller R9b; aktivitetsraden före raderingen är borta. R1 i `profil-copy.ts`. Test `radera-ark.test.tsx` (13 fall, inklusive grep efter tankstreck och emoji i R1 till R11).

**2c.7.** Appens ark: R11, R10, R10b med länk på ordet "integritetspolicyn", frågan med chips i en ny klass `.tk-val` i `testklar.css`, anledningen i kroppen, aktivitetsraden borta. Test `radera-app.test.tsx`.

**2c.8.** `MATSTART.avslut`, `src/app/admin/anvandare/avslut.ts` (`hamtaAvslut`, ren `sammanstall`) och `RaderadeKonton.tsx`. Inga rader: nollan med sedan-datum. Under fem: kortet och förklaringen. Från fem: kvartal och fem tabeller med antal och andel. Läsfel eller saknad tabell ger tomt läge. Test `avslut.test.tsx`.

**2d.** `scripts/radera-mejlhandelser-rester.ts` och `scripts/radera-posthog-rester.ts`. Båda räknar och visar utan flagga, raderar bara med `--kor`. Test `scripts/__tests__/radera-rester.test.ts`.

## Avvikelser från byggordern, med skäl

1. **Sektionen i adminen ligger i en egen fil** (`RaderadeKonton.tsx`) i stället för direkt i `page.tsx`. En sidfil i Next får inte exportera andra namn, och komponenten behövde gå att testa.
2. **`MATSTART.avslut` är satt till `2026-11-23T09:00:00Z`**, inte till en deploytid, eftersom ingen deploy har gjorts. Sätts om till deploytiden vid push.
3. **Mejlhändelserna raderas på radernas id** i skriptet, i stället för med SQL:ens `delete ... where`. Samma villkor, kontrollerat mot SQL:en (båda ger 209), men raderingen går aldrig bredare än de rader som räknades.
4. **PostHog-skriptet använder nyckelpaginering** i stället för OFFSET: PostHog vägrar OFFSET med en personlig nyckel.
5. **PostHog-skriptet har en flagga `--alla`** som stryker villkoret om e-post. Skälet står under torrkörningen nedan. Förvalet följer beslutet.
6. **Admin-rutten för Jobbsöket svarar `senasteTest` ur `email_log.sent_at`** (tabellen har ingen `created_at`).
7. **Utskicksdagens kort visar "Kunde inte läsas"** om urvalet faller, i stället för att sidan kastar. Beslutet säger inget om felet; adminens regel är tomma tillstånd, aldrig streck.
8. **Loggraden vid paketutgången i pricing-sync** skriver id i stället för adress (2a, Vercels loggar). Inga andra loggrader i de rörda filerna skriver adresser.
9. **Kön larmar en gång per rad**, när den når exakt fem försök, så att Drift inte får samma larm varje natt.

## Torrkörningen 2026-11-22

| Var | Beslutets antal | Antal i dag | Kommentar |
|---|---|---|---|
| `email_events` | 239 rader, 228 adresser | **209 rader till 198 adresser** (190 testadresser, 8 övriga) | Samma tal med beslutets SQL (läsfråga). Färre än i beslutet, troligen för att testkonton raderats eller fått nya adresser sedan dess. |
| PostHog, personer med e-post utan konto (beslutets urval) | 413 personer, 4 918 händelser | **14 personer, 3 489 händelser** | Se nedan |
| PostHog, personer utan konto oavsett e-post (`--alla`) | | **415 personer, 5 073 händelser** | |

PostHog har 803 personer, varav 344 med egenskapen `email`. 330 av dem hör till befintliga konton, 14 inte. Beslutets 413 och 4 918 stämmer nästan exakt med urvalet utan villkoret om e-post (415 och 5 073), så beslutets tal räknades troligen utan det villkoret. De 401 personerna utan e-post har kontots id (ett uuid som inte längre leder till något konto) och deras händelser kvar. Ägaren väljer: `--kor` raderar de 14, `--kor --alla` raderar alla 415. Saas-leads avsikt ("allt som går att knyta till dig") talar för `--alla`.

## Grindarna

- `npx tsc --noEmit`: grön, inga fel.
- Hela vitest: 408 testfiler gröna, 3 överhoppade; 5 021 tester gröna, 13 överhoppade.
- `next build --webpack` med `NODE_OPTIONS=--max-old-space-size=6144`, en körning: kompileringen gick igenom ("Compiled successfully in 110s"), TypeScript-steget och insamlingen av siddata gick igenom, och 154 artikelparametrar genererades. Bygget föll sedan i den statiska genereringen på `/artiklar/cv-och-personligt-brev-samma-mall`: "Expected component `CvOchBrevPar` to be defined". Artikeln är en ocommittad fil från en annan agent (`content/artiklar/cv-och-personligt-brev-samma-mall.mdx`) som jag inte får röra, och felet har inget med den här omgången att göra. Ingen sida som den här omgången rör föll. Bygget behöver köras om när artikelns komponent finns, eller i en kopia utan den filen, innan push.

## Det som inte gick att kontrollera utan konto

Raderingen i en riktig webbläsare, anledningsfrågan i arket, statistikraden i databasen, PostHog-raderingen och adminens sektion med riktiga rader. Allt detta är enhetstestat med dubbler. Inget konto skapades eftersom den lokala servern talar med produktionens databas och en annan agent klicktestade där.

## Klicktestplan för live, efter att migreringen körts

Förutsättning: migreringen är körd och kontrollerad (se nedan), koden är deployad, `POSTHOG_RADERA_NYCKEL` ligger i Vercel. Ett testkonto `qa-radera-<datum>@...` skriver ingen avslutsrad i produktionen (undantaget gäller alltid där). Raden kontrolleras därför på en preview-deploy med `AVSLUT_TESTA_UNDANTAG=1` satt för Preview, som använder samma databas; i produktionen kontrolleras i stället att ingen rad skrivs.

1. Räkna före (läsfråga): `select count(*) from konto_avslut;` och `select count(*) from posthog_raderingar;`.
2. **Webben, 1440 px, med anledning.** Skapa testkontot, ladda upp ett CV, skriv ett brev, logga en sökt tjänst. Öppna Inställningar, Konto. Kontrollera R1 under "Radera mitt konto". Öppna arket: R2, R3, R5 med länken (öppnar `/integritetspolicy#datalagring`), ingen R4 eller R4b, frågan R6 och R7, sex chips utan förval. Tryck "För dyrt", tryck "För dyrt" igen (avmarkeras), tryck "Har fått jobb". Skriv "radera mitt konto", tryck "Radera permanent". Bekräftelsen är R9a. Skärmdump per steg.
3. Kontrollera (läsfrågor): kontot finns inte i `auth.users` eller `profiles`; inga rader på kontots id i `cv_texts`, `letters`, `job_applications`, `email_log`; inga filer under `users/<id>/` i `cvs`. På preview med `AVSLUT_TESTA_UNDANTAG=1`: `konto_avslut` har en rad till med `kalla = 'webb'`, `anledning = 'fick_jobb'`, `antal_cv = '1'`, `antal_brev = '1'`, `antal_sokta = '1'`, och raden saknar id, e-post och tid. I produktionen: ingen ny rad.
4. **PostHog.** HogQL: `select count() from person_distinct_ids where distinct_id = '<id>'` ger 0 (personen borta; händelserna rensas av PostHog inom en vecka), eller så står id:t i `posthog_raderingar` om PostHog inte svarade.
5. **Pixel 7, utan anledning.** Nytt testkonto, samma flöde utan att välja chip. Raden (på preview) har `anledning` null.
6. **Med prenumeration på webben** (Stripe testläge, preview): köp Premium med testkort, öppna arket, R4 syns, R4b inte. Radera: bekräftelsen är R9b, prenumerationen är avslutad i Stripe, kunden finns kvar.
7. **Appen Testklar** (Pixel 7): Konto, raden har R11. Arket: R10, R10b med länken, frågan och chipsen, skriv RADERA, radera med en vald anledning. På preview: en rad med `kalla = 'app'`.
8. **Adminens radering** av ett testkonto under /admin/anvandare: ingen ny rad i `konto_avslut`, personen borta ur PostHog.
9. **Adminens sektion** /admin/anvandare, längst ned "Raderade konton": utan rader "0 raderade konton sedan ...", med en till fyra rader kortet och förklaringen, från fem kvartal och fem tabeller. Aldrig en enskild rad.
10. **Kön.** Ta bort `POSTHOG_RADERA_NYCKEL` på preview, radera ett testkonto: id:t står i `posthog_raderingar`. Lägg tillbaka nyckeln, anropa cronen i midnattsslotten (eller vänta till 00.00 UTC): raden är borta.
11. Efteråt: radera de rader i `konto_avslut` som klicktestet skrev på preview, på sitt id, efter att ha räknat (testdataregeln). Räkna efter.

## Det ägaren måste göra innan allt fungerar på live

1. **Migreringen** `supabase/migrations/20261123090000_konto_avslut.sql`: ge ja, så körs den. Kontroll efteråt (läsfrågor): `select relname, relrowsecurity from pg_class where relname in ('konto_avslut','posthog_raderingar')` ger två `true`; `select grantee, privilege_type from information_schema.role_table_grants where table_name in ('konto_avslut','posthog_raderingar')` visar inga rader för `anon` eller `authenticated`. Före migreringen raderas konton som vanligt, avslutsraden hoppas över och felet loggas, kön finns inte (PostHog-raderingar som faller loggas och går förlorade), och adminens sektion visar tomt läge.
2. **PostHog-nyckeln:** skapa en personlig API-nyckel i PostHog (EU) med bara `person:write` för projekt 148688, lägg den i Vercel som `POSTHOG_RADERA_NYCKEL` (Production). Utan den köas varje radering (efter migreringen) och midnattskörningen försöker igen; efter fem nätter syns det under Drift.
3. **Resterna i 2d:** ja till antalen. `npx tsx scripts/radera-mejlhandelser-rester.ts --kor` (209 rader). För PostHog: `--kor` (14 personer) eller `--kor --alla` (415 personer), med nyckeln ovan.
4. **Utskicksdagen för Jobbsöket:** `JOBBSOKET_UTSKICK.dag` i `src/lib/email/jobbsoketUtskick.ts` är `null`. Läs förhandsvisningen och skicka ett test från kortet i Mejl, säg ja till dagen, sätt `'2026-12-02'`, committa och pusha senast 1 december.
5. **Policyns lydelse** (avsnittet till ägaren i beslutet): förs in tidigast samma dag som raderingen är ute.
6. **`MATSTART.avslut`** sätts om till deploytiden vid push.
7. **`AVSLUT_TESTA_UNDANTAG=1`** läggs bara i Vercels Preview, aldrig i Production, och bara under klicktestet.
