# Flytt av Supabase till Irland: körplan för bytet

Gamla projektet: `dbvbnbkvadvlhjhomibg` (us-east-2, PG 15.8).
Nya projektet: `mnlrpfidyzuaxxlftruf` (eu-west-1, PG 17.12).

Provflytten gjordes 2026-11-19. Allt nedan bygger på den. Skripten ligger i `docs/flytt-eu/` och läser anslutningar från `.env.local` och token från `SUPABASE_TOKEN_JOBBCOACH`. Inga lösenord eller nycklar finns i filerna.

## Läget efter provflytten

Klart i NYA:

- Tillägg: pg_cron, pg_net (extensions), http och vector (public, som i GAMLA), pgcrypto, uuid-ossp, pg_stat_statements, supabase_vault. pgsodium och pgjwt är inte påslagna. Inget i public, i cron-jobben eller i policys använder dem, så de behövs inte.
- Schema public och supabase_migrations, all data i public, auth.users (525) och auth.identities (529). Sessioner, refresh-tokens, engångstokens och auditloggen är inte med. Alla loggas ut vid bytet.
- Rättigheter per tabell, vy, sekvens och funktion är exakt som i GAMLA. Det krävde ett eget steg (`gen_acl.sql`), eftersom NYA annars ger anon och authenticated full åtkomst via standardrättigheterna. Det gäller bland annat admin-vyerna och de RPC:er som stängdes 2026-10-10.
- Triggern `on_auth_user_created` på auth.users, 17 storage-policys och realtime-publikationen för fyra tabeller.
- Tre buckets med samma inställningar och alla 352 filer med samma sökväg, ägare, tidsstämplar och metadata.
- Två profilbilder hade GAMLAS adress sparad i `profiles.profile_photo_url`. De pekar nu på NYA.
- Vault: `project_url` (NYA:s adress), `anon_key` (NYA:s nyckel), `cron_secret_sync_global_jobs` (samma värde som i GAMLA).
- Tre cron-jobb, alla avstängda. pg_net-kön är tom.
- Elva edge-funktioner med exakt den kod som körs i GAMLA idag (hämtad från GAMLA, inte från repot) och samma verify_jwt. sync-global-jobs har verify_jwt av, övriga på. Supabase har ingen avstängningsknapp för en enskild funktion. Kompetensutveckling är driftsatt men kan inte köra, eftersom den läser OPENAI_API_KEY som inte finns i något av projekten. Låt den hemligheten vara osatt.
- Sex av funktionerna skiljer från repots version (analyze-cv-background, match-jobs, sync-global-jobs, aggregate-metrics, pre-enrich-occupations, _shared). Det som körs i GAMLA gäller. Fem funktioner fanns bara som eszip och packades upp med `unpack.mjs`.
- Funktionshemligheter: CRON_SECRET, GOOGLE_AI_API_KEY och RESEND_API_KEY är satta. SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY och SUPABASE_DB_URL sätts av Supabase.
- Auth: site_url, omdirigeringslistan, autobekräftelse, OTP-inställningar och MFA-inställningen är kopierade.

Hela flytten tar 5,5 minuter med `kor-flytt.sh`, uppmätt vid provet: dump 80 s, schema 86 s, data 31 s, rättigheter och policys 100 s, filer 22 s, kontroll 5 s.

## Det här saknas och måste göras av ägaren

1. **SMTP behövs inte (ägarens beslut 2026-11-19).** Webben skickar all e-post via Resend, även glömt lösenord (generateLink plus Resend), och kontot bekräftas automatiskt (`mailer_autoconfirm`). Det enda som skickas via Supabases SMTP är bekräftelsen vid e-postbyte i appen (`updateUser({ email })` i `src/components/mobilapp/inloggning/konto.ts`). Den flyttas till Resend, se Att göra före klart. Mallarna i `auth-mejl.json` behövs då inte.
2. **Google-inloggning: klar 2026-11-19.** NYA använder en egen OAuth-klient, "Jobbcoach Supabase EU" (750584671017-271khiun62lmqr58o02f58ia43fniu0h), med NYA:s callback. Den gamla klienten (750584671017-oqt5…) används av GAMLA och rörs inte förrän flytten är klar. Varumärkesprofilen Jobbcoach.ai med Testklar-ikonen är verifierad och appen är publicerad (In production).
3. **Planen för organisationen**. Organisationen CVBREV står som free. Kontrollera att NYA får samma plan som GAMLA har i praktiken (säkerhetskopior, ingen paus vid inaktivitet, gränser för edge-funktioner).

## Checklista för bytet

Räkna med 30 minuters skrivpaus och boka 45. Välj en tid med lite trafik, till exempel 06.00 en vardag (cron-jobben går 02, 05, 09, 13 och 21 UTC och ska inte hamna mitt i pausen).

### Dagen innan

- [ ] Punkterna 2 och 3 ovan är gjorda (Google och planen).
- [ ] Kör `bash docs/flytt-eu/kor-flytt.sh` en gång till som generalrepetition och läs avvikelserna i slutet. Rader som skiljer med några få är levande trafik i GAMLA, inget annat ska skilja.
- [ ] Kolla `supabase/migrations/` mot GAMLA. Har nya migreringar körts i GAMLA följer de med i dumpen, men nya cron-jobb, vault-värden och funktionshemligheter gör det inte. Den väntande migreringen `20261120110100_app_paminnelse_cron.sql` har GAMLAS adress hårdkodad och kräver hemligheten `CRON_SECRET_APP_PAMINNELSE`. Skriv om den mot NYA innan den körs där.
- [ ] Har en edge-funktion driftsatts i GAMLA efter 2026-11-19, driftsätt samma version i NYA (`supabase functions deploy <namn> --project-ref mnlrpfidyzuaxxlftruf --use-api`, med `--no-verify-jwt` för sync-global-jobs). Funktionen app-paminnelse finns i repot men inte i GAMLA.
- [ ] Förbered Vercel-värdena för NYA (se nedan) så att bytet bara är att klistra in.

### Skrivpaus (start)

- [ ] Slå på underhållsläge eller stäng skrivning i appen. Enklast är att stänga av cron-jobben i GAMLA (`select cron.alter_job(jobid, active := false) from cron.job;`) och lägga en underhållssida i Vercel. Det här är den enda skrivningen mot GAMLA i hela flytten och görs bara vid det skarpa bytet.
- [ ] Vänta en minut så att pågående anrop hinner klart. Kontrollera i GAMLA att inga nya rader kommer in (`select max(created_at) from public.anon_test_sessions` och `public_rate_limits`).

### Sista dumpen

- [ ] `bash docs/flytt-eu/kor-flytt.sh` från repots rot, med PostgreSQL 17-klienten först i PATH. Skriptet tömmer NYA på egna objekt och auth-användare, dumpar hela GAMLA på nytt (den är liten), läser in, sätter rättigheter, policys, trigger och realtime, kopierar alla filer och jämför. Vault och cron i NYA rörs inte.
- [ ] Slutraden ska säga **Inga avvikelser**. Funktionskropparna jämförs inte i den raden. Åtta funktioner skiljer bara på radslut (CR), eftersom psql på Windows tar bort dem. Det påverkar inte vad funktionerna gör.

### Vercel

- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://mnlrpfidyzuaxxlftruf.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon-nyckeln för NYA (legacy JWT, hämtas från `/v1/projects/mnlrpfidyzuaxxlftruf/api-keys`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = service_role-nyckeln för NYA
- [ ] Inga andra variabler i koden pekar på projekt-id. Koden läser bara de tre ovan (`process.env.NEXT_PUBLIC_SUPABASE_URL`, `..._ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). Kontrollera ändå listan i Vercel efter variabler med `supabase` i namnet eller värdet.
- [ ] Lägg till `"regions": ["dub1"]` i `vercel.json` på toppnivå så att serverfunktionerna kör i Dublin nära databasen. Gör det i samma deploy som variablerna, inte före, annars blir allt långsammare mot Ohio.
- [ ] Driftsätt om produktionen så att de nya värdena byggs in (NEXT_PUBLIC-variabler bakas in vid bygget).
- [ ] De publika sidorna CDN-cacheas ett dygn. Rensa Vercels cache vid deployen, annars kan gamla sidor ladda klienten mot GAMLA.

### Auth, e-post och OAuth

- [ ] Google i NYA är på (punkt 2 ovan). SMTP sätts inte, se punkt 1.
- [ ] Site URL `https://www.jobbcoach.ai` och omdirigeringar `https://www.jobbcoach.ai/auth/callback` och `https://*.vercel.app/auth/callback` finns redan i NYA.
- [ ] Alla användare är utloggade eftersom JWT-hemligheten är ny. Inget att göra, men nämn det i ett driftmeddelande om det behövs.

### Webhooks

- [ ] Stripe skickar till `https://www.jobbcoach.ai/api/stripe/webhooks` (kontrollerat i Stripe 2026-11-19). Ingen ändring.
- [ ] RevenueCat är inte uppsatt än, ingen åtgärd.
- [ ] Inga databas-webhooks finns i GAMLA (schemat supabase_functions saknas).

### Cron på

- [ ] I NYA: `select cron.alter_job(jobid, active := true) from cron.job where jobname in ('send-verification-reminders-daily', 'sync-global-jobs-refresh');`
- [ ] `aggregate-daily-metrics` har misslyckats varje natt i GAMLA eftersom anropet `http_post` med fyra argument inte finns. I NYA är jobbet omskrivet till `net.http_post` med vault-värden, så det kommer att fungera om det slås på. Ägaren bestämmer om det ska på.
- [ ] Kör `select * from cron.job_run_details order by start_time desc limit 5` efter första körningen.

### MCP och agenter

- [ ] `.mcp.json`: `project_ref=mnlrpfidyzuaxxlftruf`
- [ ] `.vscode/mcp.json`: `--project-ref=mnlrpfidyzuaxxlftruf`
- [ ] `.claude/agents/saas-lead.md`: projekt-id i avsnittet om Supabase
- [ ] `scripts/backfill-paket-started-at.ts`: konstanten `PROJEKT`
- [ ] Minnesfilerna som nämner projekt-id. `SUPABASE_TOKEN_JOBBCOACH` gäller båda projekten och behöver inte bytas.
- [ ] `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Ta bort `OLD_DB_URL` och `NEW_DB_URL` när flytten är avslutad.
- [ ] QA-skripten i `scripts/qa-*.mjs` har GAMLAS adress. Byt när de används nästa gång.

### Röktest (direkt efter deploy)

- [ ] Startsidan, en artikel, `/cv-exempel/<yrke>` och `/rakna-ut` laddar.
- [ ] Logga in med e-post och lösenord på ett testkonto. Logga in med Google.
- [ ] Registrera ett nytt testkonto. Bekräftelsemejlet ska komma från support@jobbcoach.ai med svensk mall. Triggern ska skapa raden i profiles.
- [ ] Ladda upp ett CV och en profilbild. Öppna ett befintligt CV och en befintlig profilbild.
- [ ] Gör ett test i Testklar, både webben och appen.
- [ ] Skapa ett personligt brev (Gemini via Vercel) och kör en CV-analys (edge-funktionen analyze-cv-background).
- [ ] Testköp i Stripe testläge enligt `reference_stripe_testlage`.
- [ ] Admin: Tråden visar siffror.
- [ ] Ta bort testkontona med id, aldrig med tidsfönster.

### SEO-kontroll

- [ ] Publika sidor svarar 200 med samma titel och metadata som innan (`docs/qa/seo-diff`-skriptet).
- [ ] `sitemap.xml` och `robots.txt` svarar.
- [ ] Inga sidor pekar på `dbvbnbkvadvlhjhomibg.supabase.co` i HTML:en.
- [ ] Search Console: titta efter serverfel de närmaste dagarna.

### Skrivpaus (slut)

- [ ] Ta bort underhållssidan.
- [ ] Låt GAMLA stå orörd och pausad i minst två veckor. Radera ingenting där.

## Backa

Om något stort går fel inom pausen eller den första timmen:

1. Sätt tillbaka de tre Vercel-variablerna till GAMLA, ta bort `regions` ur `vercel.json` och driftsätt om. Rensa cachen.
2. Slå på cron-jobben i GAMLA igen och stäng av dem i NYA.
3. GAMLA har inte ändrats, så den är komplett fram till pausen.

Om backningen sker efter att användare har skrivit i NYA: dumpa data ur NYA för de tabeller som har nya rader (`created_at` efter bytet) och läs in dem i GAMLA för hand. Ju senare backningen, desto mer handarbete. Bestäm därför inom en timme om vi stannar.

## Skript i docs/flytt-eu

- `kor-flytt.sh`: hela flytten, från dump till jämförelse.
- `gen_acl.sql`: bygger rättigheterna från GAMLA.
- `cron.sql`: skapar de tre cron-jobben avstängda (redan kört i NYA).
- `counts.sql`: jämförelsen (rader, filer, funktioner, triggers, policys, RLS, rättigheter, sekvenser).
- `kopiera-storage.mjs`: buckets och filer via storage-API:t.
- `unpack.mjs`: packar upp edge-funktioner som bara finns som eszip i GAMLA.
- `auth-mejl.json`: mallar, ämnesrader och SMTP-inställningar utan lösenord.

## Att göra före klart

Flytten räknas inte som klar förrän de här punkterna är gjorda.

- [ ] **E-postbyte i appen via Resend.** Ersätt `supabase.auth.updateUser({ email })` i appens konto (`src/components/mobilapp/inloggning/konto.ts`) med en egen rutt som skapar bekräftelselänken med `auth.admin.generateLink({ type: 'email_change_new' })` och skickar den med Resend, på samma sätt som `/api/auth/forgot-password`. Då används Supabases SMTP inte alls och behöver inte sättas i NYA.
- [ ] **RevenueCat:** inget konto finns än, ingen åtgärd vid flytten. Webhooken pekar på `/api/app/revenuecat` hos Vercel när den sätts upp.
- [ ] **aggregate-daily-metrics:** slå på i NYA vid bytet (rättat anrop, skriver bara till `admin_daily_metrics` som admin-sidan Drift läser).
- [ ] **Byt databaslösenorden** i båda projekten efter flytten och ta bort `OLD_DB_URL` och `NEW_DB_URL` ur `.env.local`.
- [ ] **Ta bort den gamla OAuth-klienten** "Jobbcoach Supabase" i Google Cloud när Google-inloggning fungerar i NYA och vi inte ska backa. Radera också client_secret-filerna i Hämtade filer.
