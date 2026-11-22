# Beslut på ägarpunkterna: /integrationer, datalagring och mejlen

Saas-lead, 2026-11-22. Ägarens besked samma dag: "/integrationer har kort för funktioner som inte finns. Ta bort dem då." "Alla lösenord är väl krypterade? Men rätta texten i samråd med saaslead." "Premiumlistan i plans.ts läses av en mejlmall. Fixa."

Kontrollerat i `C:\Users\chris\cvbrev-publikt3` på `a6f98154`, mot produktionsdatabasen (läsfrågor, inget skrivet) och mot Supabase Management API (bara GET av projekt och Auth-konfiguration).

Så läser byggaren filen:
- Varje ändring har fil och rad, texten i dag, den slutliga lydelsen och belägget. Lydelsen förs in ordagrant. Tal i `${...}` läses ur konstanten som namnges, de skrivs aldrig in för hand.
- **Schema:** raden säger vilken rad i `scripts/seo-baslinje/publikt-omgang3-undantag.json` som behövs. Finns redan en rad för sidan och schematypen utökas dess `skal` med postens id; annars läggs en ny rad med datum 2026-11-22.
- Integritetspolicyn, användarvillkoren och samtyckestexterna ändras inte av den här filen.
- Ordningen står sist.

---

## Först: ett säkerhetsfel som måste rättas före allt annat

**S-1. Alla inloggade kan läsa, skriva över och radera alla andras CV-filer.** Hinken `cvs` (privat, 354 filer från 183 konton, alla under `users/<id>/`) har två policyer på `storage.objects` som släpper in vem som helst med en inloggning:

| Policy | Kommando | Villkor |
|---|---|---|
| `Allow storage access to all authenticated users` | ALL | `bucket_id = 'cvs' AND auth.role() = 'authenticated'` |
| `Authenticated users can access cvs bucket` | ALL | samma, också som `with_check` |

Policyer ORas, så de här två vinner över ägarpolicyerna. Ägarpolicyerna (`Allow users to view/update/delete/upload own files`) jämför dessutom `storage.foldername(name)[1]` med användarens id, medan filerna ligger under `users/<id>/`, där första mappen är `users`. De träffar alltså aldrig. Registreringen är öppen och `mailer_autoconfirm` är på, så i praktiken når vem som helst som skapar ett konto alla uppladdade CV-filer och bilagor till Jobbcoachen genom lagringens list och download med sin egen nyckel. Rutterna som läser och skriver hinken använder användarens klient (`createServerClient` i `src/app/api/cv/upload/route.ts:104`, `src/app/api/cv/route.ts:11`, `src/app/api/cv/delete/route.ts:9`, `src/app/api/jobbcoachen/upload/route.ts:15`), så policyerna är det enda skyddet.

Det här är ägarens: det kräver DROP i produktion, och om någon har läst andras filer kan det vara en personuppgiftsincident som ska anmälas till IMY inom 72 timmar från att vi fick kännedom om den. Förslag till ägaren, i den här ordningen:

1. Kör i SQL-editorn (eller via Management API med ditt ja):
   ```sql
   drop policy "Allow storage access to all authenticated users" on storage.objects;
   drop policy "Authenticated users can access cvs bucket" on storage.objects;
   drop policy "Allow users to view own files" on storage.objects;
   drop policy "Allow users to update own files" on storage.objects;
   drop policy "Allow users to delete own files" on storage.objects;
   drop policy "Allow users to upload own files" on storage.objects;
   create policy "cvs: egen mapp, läsa" on storage.objects for select to authenticated
     using (bucket_id = 'cvs' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text);
   create policy "cvs: egen mapp, ladda upp" on storage.objects for insert to authenticated
     with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text);
   create policy "cvs: egen mapp, ändra" on storage.objects for update to authenticated
     using (bucket_id = 'cvs' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text);
   create policy "cvs: egen mapp, radera" on storage.objects for delete to authenticated
     using (bucket_id = 'cvs' and (storage.foldername(name))[1] = 'users' and (storage.foldername(name))[2] = auth.uid()::text);
   ```
2. Byggaren klicktestar direkt efter: ladda upp ett CV, öppna det, ladda ner originalet, bifoga ett dokument till Jobbcoachen, radera CV:t, och med ett andra testkonto: försök lista `users/` och hämta det första kontots fil (ska ge tomt respektive fel). `src/store/cv-store.ts:130-134` laddar upp i hinkens rot (`${user.id}-${Date.now()}`); den vägen slutar fungera med de nya policyerna. Byggaren tar reda på om den används; används den läggs filen under `users/<id>/`.
3. Be Supabase om lagringsloggarna (eller läs dem i loggutforskaren så långt bakåt de finns) och se om något konto har listat eller hämtat filer under en annans mapp. Hittas något är det en incident som anmäls.

Säljtexterna nedan säger inget om att andra inte når dina filer förrän S-1 är rättat och testat. De fyra FAQ-svaren i punkt 2 förs in först när S-1 är klart.

Närliggande, inte lika allvarligt: hinken `profile-photos` är **publik**. Den som har en fils adress kan öppna profilfotot utan inloggning. Adressen innehåller kontots id, så den går inte att gissa, men fotot visas för rekryterare och i dokument. Policyn säger att fotot ligger "i vår lagring" och inget om att det är publikt. Står under "Kräver ändring i policyn".

---

## Kräver ändring i policyn

Tas av ägaren med en jurist. Inget av det här ändras av byggaren. Där en kodändring gör policyn sann i stället står det.

1. **PostHog får e-postadressen, policyn säger "anonymt id".** `src/components/PostHogProvider.tsx:70-73` kör `posthog.identify(user.id, { email: user.email, ... })` för inloggade. Policyn avsnitt 5 säger "PostHog sparar ett anonymt id". Antingen tas `email` bort ur `identify` (kodändring, och befintliga personer i PostHog behöver rensas på egenskapen, ägarens beslut), eller så skriver policyn att inloggade kopplas till konto och e-postadress i mätningen. Min rekommendation: ta bort `email` ur `identify`; adminens filter på testkonton fungerar med `is_internal`, som redan sätts.
2. **Det som blir kvar efter en radering är mer än policyn säger.** Policyn avsnitt 7 säger att mejlloggen tas bort och att bara kvitton hos Stripe och säkerhetsloggar utan e-post blir kvar. I koden (`src/lib/konto/raderaKonto.server.ts:113-135`) blir detta kvar:
   - `email_events`: alla 2 341 rader har mottagarens adress och ämnesraden i `payload.to` och `payload.subject`, och tabellen har ingen koppling till kontot. Raderas inte. Kodändring som gör policyn sann: radera kontots rader i `email_events` på `payload->>'to'` (eller `payload->'to'` som lista) i `rensaLosaRader`, med kontots e-postadress lästs före raderingen.
   - PostHog: personen och händelserna (med e-postadressen, se punkt 1) raderas inte. Kodändring: anropa PostHogs API för att radera personen vid kontoradering, eller skriv det i policyn.
   - Stripe: kunden ligger kvar med e-postadress och namn, inte bara kvitton. Policyn bör säga "kunduppgifter och kvitton hos Stripe".
   - Resend: varje skickat mejl ligger kvar i Resends logg med adress och innehåll så länge Resend sparar det. Policyn säger inget om hur länge.
   - Supabase Auth: plattformens egna inloggningsloggar (utanför vår databas; tabellen `auth.audit_log_entries` är tom) innehåller e-post och IP-adress under Supabases lagringstid. Policyn säger att säkerhetsloggarna saknar e-post och IP.
3. **Avsnitt 7 säger emot sig självt.** Första stycket: kontoinformationen sparas "så länge ditt konto är aktivt hos oss, och en rimlig tid därefter". Tredje stycket: allt tas bort när kontot raderas. Ett av dem måste bort eller preciseras.
4. **Var Google, Stripe och Resend behandlar uppgifterna står inte.** Policyn säger var Supabase (EU), Vercel (Irland) och PostHog (EU) lagrar, men inte var Google (Gemini API, `generativelanguage.googleapis.com` i `supabase/functions/_shared/gemini.ts` och `src/lib/gemini/`), Stripe eller Resend gör det, och inget om överföring till land utanför EU eller vilken skyddsmekanism som gäller (GDPR artikel 13.1 f). Det är skälet till att "all data lagras i EU" stryks i säljtexten.
5. **Personuppgiftsansvarig och rättslig grund saknas.** Policyn namnger inget bolag eller organisationsnummer, bara `support@jobbcoach.ai`, och anger ingen rättslig grund per ändamål (artikel 13.1 a och c).
6. **Uppföljningsmejlet står inte bland AI-anropen.** Utkastet skickar tjänst, arbetsgivare, datum, sökväg, upp till tre kompetenser och annonsens krav till Gemini (`src/lib/jobbsok/uppfoljning.ts:5-7, 77-100`). Policyn räknar upp brev, CV-inläsning, CV-analysen, förslagen i CV-byggaren, LinkedIn, jobbmatchningen och bilagor till Jobbcoachen, inte uppföljningsmejlet och inte intervjuprovets bedömning (fritexten nämns, men inte att den bedöms av Gemini).
7. **Profilfotot ligger i en publik hink** (se S-1). Policyn bör säga det, eller hinken göras privat med signerade adresser (kodändring).
8. **"Privat lagringshink som inte går att nå utan inloggning"** (avsnitt 6) är sant mot utloggade men säger inget om andra inloggade, vilket var fallet fram till S-1. Efter S-1 stämmer meningen; lägg gärna till "och bara av dig".

### Samtyckestexter som inte stämmer (ändras inte här)

`src/app/dashboard/bli-upptackt/components/delas.ts`, samtyckets listor:
- `HIDDEN_ITEMS` rad 17, **"Nuvarande arbetsgivare"** står bland det som aldrig visas. I läget Öppen profil, och efter ett ja i Anonym först, visas arbetsgivarnamnen i historiken (`src/lib/recruiter/candidateData.ts:7-11, 885-887`). Raden är sann bara för Anonym först före ett ja.
- `SHOWN_ITEMS` rad 10, **"Verifierade testresultat med percentiler"**, är sann: rekryteraren ser "topp X %" ur percentilen (`src/app/rekryterare/components/PercentileDots.tsx:18-25`, `src/lib/recruiter/candidateData.ts:348`), plus nivån. Ingen ändring behövs där.
- Samtycket nämner inte att Öppen profil visar namnet direkt. Det står i lägesväljaren (`VisibilityModeCard.tsx:52`, "Namn syns direkt"), inte i samtycket.

## Mejlregler, ägarens

Ändras inte av byggaren. Mitt råd står efter varje.

1. **Förnyelsemejlet hoppas över för den som stängt av påminnelser** (`src/lib/email/lifecycle/runner.ts:428`), fast mallen är markerad som transaktionell (`templates/komigang.ts`, `transactional: true` i `paketFornyasMejl`). Råd: låt `paket_fornyas` gå före avregistreringen som kvittot gör. Tills dess står raden "Dagen före förnyelsen mejlar vi..." inte på /priser (saaslead-konvertering K6).
2. **Påminnelser om kvoter som aldrig kommer tillbaka.** `/api/quota/remind` tar emot vilken `feature` som helst (`src/app/api/quota/remind/route.ts:13-35`), och `quota-back.ts` har mejl för `cv_analysis` ("Kvoten har nollställts") och `chat_message` ("Du kan skriva till jobbcoachen igen"). CV-analysen har ingen kvot längre och Jobbcoachens tio meddelanden räknas per konto och kommer aldrig tillbaka. I `quota_reminders` finns sju skickade `cv_analysis`, inga väntande. Råd: rutten vägrar features utan dagsrytm (allt utom `letter_generation` och `test:*`), och de två posterna tas bort ur `FEATURE_COPY` (punkt 3, M20 och M21).
3. **Kampanjen "Vi ändrar gratisnivån"** (`campaign-gratisniva.ts`) har aldrig skickats (ingen rad i `email_log`) och beskriver en ändring som redan är gjord. Admin-routen `/api/admin/email/campaign-gratisniva` kan fortfarande schemalägga den. Råd: pensionera den som Sökta tjänster-kampanjen (rutten svarar 410). Texten rättas ändå (M4 till M8), så att den är sann om någon skickar den.
4. **Kvotpåminnelsen hoppar över premium på `subscription_tier === 'premium'`** (`src/app/api/cron/pricing-sync/route.ts:309`), inte på behörigheten. Ett Dagspass eller en admintilldelning räknas inte. Råd: samma kontroll som i mallarna (`hasPremiumNow`).
5. **Black Week-mejlen** (`campaign-kampanj.ts`, 23 och 30 november) är lästa mot produkten. Inget i dem är fel, inget ändras.
6. **Det nya mejlet om Jobbsöket** (beslut 6 i `docs/beslut-jobbsoket-2026-11-21.md`) finns inte i koden. Utskicksdagen är din.

---

## Punkt 1. /integrationer

### Kort för kort

| Kort i dag | Sant? | Belägg | Beslut |
|---|---|---|---|
| LinkedIn, "Importera profil och optimera för jobbsökning", "Planerad Q2 2026" | Ja, men det finns redan och datumet har passerat | CV-byggaren tar en LinkedIn-PDF (`src/app/dashboard/skapa-cv/texter.ts:30-31`, `src/components/cv/rum3/texter.ts:66`). LinkedIn-optimeringen skriver profiltexterna ur CV:t; du klistrar in själv (`linkedin-optimizer/components/PasteHelper.tsx`). Optimeringen är Premium. | Står, med ny text |
| Arbetsförmedlingen, "Sök jobb direkt från plattformen", "Under utveckling" | Ja, det finns redan | Matchade jobb hämtar annonserna ur Arbetsförmedlingens öppna API (`supabase/functions/match-jobs/index.ts:275`, `sync-global-jobs`). Månadsrapporten i Sökta tjänster är underlag till aktivitetsrapporten; vi skickar inget dit (`sokta-tjanster/page.tsx:639`). | Står, med ny text |
| Gmail och Outlook, "Skicka personliga brev direkt från din e-post", "Planerad Q3 2026" | Nej | Ingen koppling till någon e-posttjänst. Det som finns: uppföljningsmejlet öppnas i ditt e-postprogram med `mailto:` med ämne och text, eller kopieras (`src/lib/jobbsok/uppfoljning.ts:311-315`, `src/components/jobb3/sokta/Uppfoljning.tsx:429-445`). "Vi skickar aldrig mejl själva." | Stryks. Ersätts av ett kort för det som finns: Din e-post |
| ATS-system, "Integration med Applicant Tracking Systems", "Enterprise-funktion" | Nej | Ingen koppling till något rekryteringssystem finns och ingen Enterprise-nivå. | Stryks. Ersätts av ett kort för Google-inloggningen (`src/components/auth/GoogleSignInButton.tsx:68`, `external_google_enabled = true`) |

Sidan blir hel med fyra sanna kort, så adressen står kvar som egen sida. Den länkas fortfarande inte från menyn och ligger inte i sajtkartan (ingen ändring där).

### Slutligt innehåll, `src/app/(public)/integrationer/page.tsx`

**Ny import (rad 10):** `import { Briefcase, Linkedin, LogIn, Mail } from 'lucide-react'` (`Users` ut, `LogIn` in).

**Konstanten byter namn** från `FUTURE_INTEGRATIONS` till `INTEGRATIONER` (också i `Kopplingar` och i kartan över korten). Raderna 23-28 blir:

| Ikon | `name` (h3) | `description` | `status` (chip) | `farg` |
|---|---|---|---|---|
| `Linkedin` | `LinkedIn` | `Spara din LinkedIn-profil som PDF och ladda upp den, så fyller vi i avsnitten i ditt CV. LinkedIn-optimeringen skriver om rubriken och om mig-texten utifrån ditt CV, och du klistrar in dem själv. Vi loggar aldrig in på LinkedIn.` | `PDF gratis, optimeringen i Premium` | `cv` |
| `Briefcase` | `Arbetsförmedlingen` | `Matchade jobb hämtar annonserna ur Arbetsförmedlingens öppna API och visar dem som passar ditt CV. Månadsrapporten i Sökta tjänster är underlag till din aktivitetsrapport, som du lämnar in själv.` | `I Matchade jobb och Sökta tjänster` | `jobb` |
| `Mail` | `Din e-post` | `Uppföljningsmejlet till en sökt tjänst öppnas i ditt e-postprogram med ämne och text ifyllda, eller så kopierar du det. Du skickar det själv, från din egen adress.` | `I Sökta tjänster` | `brev` |
| `LogIn` | `Google` | `Skapa kontot och logga in med ditt Google-konto. Vi får ditt namn och din e-postadress från Google, aldrig ditt lösenord.` | `Vid inloggningen` | `tran` |

Belägg för LinkedIn-kortets Premium: LinkedIn-optimeringen är bara Premium i koden (`linkedin` i behörigheterna, 402 i rutten; OVERLAMNING "LinkedIn-sidans exempel är statiskt"). Belägg för "Vi loggar aldrig in på LinkedIn": GEM-5:s lydelse på `/verktyg/linkedin-optimering`, och optimeringen tar bara inklistrad text.

**Hjälten (rad 59):** `h1` står: `Integrationer`. `varde` blir:
`LinkedIn, Arbetsförmedlingen, din e-post och ditt Google-konto. Så hänger de ihop med Jobbcoach.ai.`

**Läget (rad 62-65):**
- `h2`: `Kopplingar som finns i dag`
- `p`: `Fyra kopplingar som finns i kontot nu. Vi läser aldrig din inkorg, loggar aldrig in åt dig och skickar inga ansökningar i ditt namn.`

Belägg: ingen kod läser e-post, inget inlogg mot tredje part, inga utskick till arbetsgivare (`uppfoljning.ts:311`, "Vi skickar aldrig mejl själva"; FAQ-svaret "Vi skickar aldrig något till en arbetsgivare" på `/verktyg/sokta-tjanster`).

**Vinsterna (rad 30-34).** Rubrikerna står, texterna blir konkreta:

| `rubrik` (h3) | `text` |
|---|---|
| `Snabbare arbetsflöde` | `Din LinkedIn-PDF fyller i CV:t, och från en träff i Matchade jobb följer annonsen med in i det personliga brevet.` |
| `Bättre matchning` | `Det personliga brevet skrivs mot annonsens krav, och träffarna i Matchade jobb visar varför de passar ditt CV.` |
| `Mät resultat` | `Sökta tjänster visar var varje ansökan står, från sökt till erbjudande, och statistiken för hela sökandet.` |

Belägg: `handleWriteLetter` lägger annons, tjänst och arbetsgivare i brevets förifyllning (`src/components/jobb3/jobb/MatchadeJobb.tsx:635-652`); skälen per träff och statistiken "från sökt till erbjudande" (nytt-innehall, Sökta tjänster).

**Förslagsön (rad 98-121):** rubriken står (`Vill du föreslå en integration?`), knappen står (`Föreslå integration`, `/kontakt`). `varde` blir:
`Berätta vilket verktyg du använder och vad kopplingen skulle göra åt dig.`
(Det gamla "så prioriterar vi utvecklingen" är ett löfte vi inte kan belägga.)

**Kommentaren överst (rad 1-9)** skrivs om: sidan har fyra kopplingar som finns i produkten, de två som inte fanns är strukna enligt ägarens besked 2026-11-22.

**Metadata (ny, sidan har ingen i dag och ärver rotens titel och beskrivning, utan canonical).** Läggs som `export const metadata` i `page.tsx` eller i en ny `layout.tsx` som `om-oss/layout.tsx`:
- `title`: `Integrationer med LinkedIn och Arbetsförmedlingen` (49 tecken)
- `description`: `Så hänger Jobbcoach.ai ihop med LinkedIn, Arbetsförmedlingen, din e-post och ditt Google-konto: fyra kopplingar som finns i kontot i dag.` (138 tecken)
- `alternates.canonical`: `https://www.jobbcoach.ai/integrationer`
- `robots`: `{ index: true, follow: true }`
- `openGraph` och `twitter`: samma titel och beskrivning, `url` som canonical, `siteName: 'Jobbcoach.ai'`, `locale: 'sv_SE'`.

Sidan har ingen FAQ och inget schema; inget läggs till.

### Grinden för /integrationer

- `META_BYTT`: `/integrationer`, `title` och `description` (sidan ärvde rotens), skäl "ägarens besked 2026-11-22, beslut-agarpunkter punkt 1".
- `RUBRIK_BYTT`: `h2 Integrationer under utveckling` till `h2 Kopplingar som finns i dag`; `h3 Gmail & Outlook` till `h3 Din e-post`; `h3 ATS-system` till `h3 Google`. Övriga rubriker står.
- Canonical från tom till adressen: skriv det i samma skäl.
- Ordantalet går upp (från 106).

---

## Punkt 2. Datalagring och säkerhet

### Vad som gäller, enligt koden och konfigurationen

**Lösenorden.** Inloggning, registrering och nytt lösenord går genom Supabase Auth: `supabase.auth.signUp` (`src/components/registrering/RegisterKontoSteg.tsx:227`, `src/components/cv/Dokument/KontoArk.tsx:77`), `signInWithPassword` (`src/components/registrering/LoginFlode.tsx:90`), återställningslänken med `auth.admin.generateLink({ type: 'recovery' })` (`src/app/api/auth/forgot-password/route.ts:52`). Vi har ingen egen lösenordskolumn. I `auth.users` är alla 379 lösenord bcrypt-hashar med kostnad 10 (`$2a$10$`); 161 konton har inget lösenord alls, de loggar in med Google. Svaret på ägarens fråga: lösenorden är inte krypterade utan **hashade**, vilket är bättre. En hash går inte att vända tillbaka, så varken vi eller någon som kommer åt databasen kan läsa ett lösenord. Det vi kan stå för: "lösenordet sparas aldrig i klartext", "hashat". Inte "100 % krypterat" och inte "AES-256", som gäller diskkryptering och inte lösenorden.

Två saker i Auth-inställningarna (ägarens, ändras inte här): `password_min_length` är 6, medan alla våra formulär kräver 8 (`RegisterKontoSteg.tsx:74`, `NyttLosenFormular.tsx:99`); den som går direkt mot API:t kan välja sex tecken. Och läckta lösenord kontrolleras inte (`password_hibp_enabled = false`). Råd: höj till 8 och slå på kontrollen.

**Var uppgifterna lagras.** Supabase-projektet `mnlrpfidyzuaxxlftruf` ligger i `eu-west-1` (Irland), läst ur Management API. Vercels serverfunktioner kör i `dub1` (Dublin, `vercel.json`). PostHog körs mot EU-värden (`NEXT_PUBLIC_POSTHOG_HOST`, policyn avsnitt 4). Minnesfilen och policyn stämmer: databas och fillagring i EU, Irland.

**Underleverantörerna.**
- Google, Gemini API (`generativelanguage.googleapis.com`): CV-text med namn, e-post, telefon, personnummer, födelsedatum, gatuadress, postnummer och länkar utbytta (`src/lib/privacy/pii.ts`, `supabase/functions/_shared/pii.ts`), annonstext, bilagor till Jobbcoachen maskade (`src/lib/jobbcoachen/bilagor.ts`), Jobbcoachen får målroll, ort och bransch och samtalets senaste 20 meddelanden (`src/app/api/jobbcoachen/chat/route.ts:173-243`), uppföljningsmejlet tjänst och arbetsgivare (`uppfoljning.ts:77-100`). Fritext går som den skrevs. Var Google behandlar står inte i policyn.
- Stripe: kund med e-post (`stripe.customers.create` i `src/app/api/stripe/create-plan-session/route.ts:110`), prenumeration, kvitton.
- Resend: alla mejl, med adress och innehåll.
- PostHog: händelser, och för inloggade kontots id och e-postadress (se policylistan punkt 1).
- Vercel: driften.

**När ett konto raderas** (`src/lib/konto/raderaKonto.server.ts`): Stripe-prenumerationer avslutas, filerna under `users/<id>/` i `cvs` och `profile-photos` tas bort, lösa rader i `email_log`, `public_letter_drafts`, de anonyma proven och `guest_invitations` raderas, `audit_logs` tvättas på IP, webbläsare och värden, och auth-användaren tas bort, vilket kaskaderar till profil, CV, brev, sökta tjänster, Jobbcoachens samtal (`ai_messages`, `ai_conversations`), testresultat och resten. Kvar blir: kvitton och kunden hos Stripe, `email_events` med adress och ämne, PostHog-personen, Resends logg och Supabase-plattformens inloggningsloggar (policylistan punkt 2).

**"24 h" på Glömt lösenordet** är länkens giltighetstid, och den stämmer: `mailer_otp_exp = 86400` sekunder i Auth-konfigurationen, och återställningslänken bär en sådan token (`forgot-password/route.ts:67-76`). Mejlet med länken säger däremot "60 minuter" (punkt 3, M24).

### Ändringarna

Förutsättning för alla fyra FAQ-svar och cv-analys-svaret: S-1 är rättat och testat.

**D-1. Startsidan.** `src/components/publikt/start/Startsidan.tsx:144`. Frågan står: `Är mina uppgifter säkra?`
- I dag: "Ja. Vi följer GDPR, all data lagras i EU, vi säljer aldrig dina uppgifter vidare och tränar inga egna modeller på ditt CV. Du raderar kontot själv under Inställningar, och då tas allt ditt bort. Det enda som blir kvar är kvitton hos Stripe, som bokföringslagen kräver."
- Ny: `Ja. Vi säljer inte dina uppgifter och tränar inga egna AI-modeller på ditt CV. Ditt konto, dina CV, brev och testresultat lagras i EU, i Irland, och text ur ditt CV går till Googles AI-tjänst utan namn, e-postadress och telefonnummer. Raderar du kontot under Inställningar tar vi bort det du har sparat hos oss. Kvitton finns kvar hos Stripe i sju år, som bokföringslagen kräver.`
- Belägg: policyn avsnitt 3 och 4 (säljer inte, tränar inga egna modeller, maskningen), Supabase `eu-west-1`, `raderaKonto.server.ts`, policyn avsnitt 7 (sju år).
- **Schema:** FAQPage på `/`. Utöka raden `LD_UNDANTAG /` (Organization+WebSite+FAQPage).

**D-2. /funktioner.** `src/app/(public)/funktioner/FunktionerSida.tsx:283`. Frågan står: `Är det säkert att lämna mitt CV till er?`
- I dag: "Ja. Vi följer GDPR, all data lagras i EU, vi säljer aldrig dina uppgifter vidare och tränar inga egna modeller på ditt CV. Du raderar kontot själv under Inställningar, och då tas allt ditt bort: profil, CV, brev, testresultat och uppladdade filer. Det enda som blir kvar är kvitton hos Stripe, som bokföringslagen kräver."
- Ny: `Ja. Vi säljer inte dina uppgifter och tränar inga egna AI-modeller på ditt CV. Ditt konto och dina dokument lagras i EU, i Irland, och text ur ditt CV går till Googles AI-tjänst utan namn, e-postadress och telefonnummer. Du raderar kontot själv under Inställningar, och då tar vi bort profilen, CV:n, breven, testresultaten och uppladdade filer. Kvitton finns kvar hos Stripe i sju år, som bokföringslagen kräver.`
- **Schema:** FAQPage på `/funktioner`. Utöka raden `LD_UNDANTAG /funktioner`.

**D-3. /verktyg/cv-analys.** `src/app/(public)/verktyg/cv-analys/components/cv-analys-faq-data.ts:46`. Frågan står: `Är mitt CV säkert hos er?`
- I dag: "Ja. Vi följer GDPR, all data lagras i EU, vi säljer aldrig dina uppgifter vidare och tränar inga egna modeller på ditt CV. CV-filerna ligger i en privat lagring som bara du kommer åt. Du raderar kontot själv under Inställningar, och då tas allt ditt bort. Det enda som blir kvar är kvitton hos Stripe, som bokföringslagen kräver."
- Ny: `Ja. Vi säljer inte dina uppgifter och tränar inga egna AI-modeller på ditt CV. CV-filen och texten lagras i EU, i Irland, i en lagring som bara ditt konto når. Innan text ur CV:t går till Googles AI-tjänst byter vi ut namn, e-postadress och telefonnummer. Du raderar kontot själv under Inställningar, och då tar vi bort allt du har sparat hos oss, också filerna. Kvitton finns kvar hos Stripe i sju år, som bokföringslagen kräver.`
- Belägg för "bara ditt konto når": de nya policyerna i S-1. **Förs inte in förrän S-1 är testat.** Om S-1 dröjer förs svaret in utan den bisatsen: `CV-filen och texten lagras i EU, i Irland.`
- **Schema:** FAQPage på `/verktyg/cv-analys`. Utöka raden `LD_UNDANTAG /verktyg/cv-analys`.

**D-4. /verktyg/personligt-brev.** `src/app/(public)/verktyg/personligt-brev/components/brev-faq-data.ts:27`. Frågan står: `Är det säkert att lämna mitt CV och era brev?`
- I dag: "Ja. Vi följer GDPR, all data lagras i EU, vi säljer aldrig dina uppgifter vidare och tränar inga egna modeller på ditt CV eller dina brev. Du raderar kontot själv under Inställningar, och då tas allt ditt bort. Det enda som blir kvar är kvitton hos Stripe, som bokföringslagen kräver."
- Ny: `Ja. Vi säljer inte dina uppgifter och tränar inga egna AI-modeller på ditt CV eller dina brev. CV:n och brev lagras i EU, i Irland. Innan text ur ditt CV går till Googles AI-tjänst byter vi ut namn, e-postadress och telefonnummer, och sätter tillbaka dem i brevet hos oss. Du raderar kontot själv under Inställningar, och då tar vi bort profilen, CV:n och breven. Kvitton finns kvar hos Stripe i sju år, som bokföringslagen kräver.`
- Belägg: policyn avsnitt 3, "Där det färdiga dokumentet behöver uppgifterna sätter vi tillbaka dem hos oss efteråt."
- **Schema:** FAQPage på `/verktyg/personligt-brev`. Utöka raden `LD_UNDANTAG /verktyg/personligt-brev`.

**D-5. /for-rekryterare.** `src/app/(public)/for-rekryterare/components/rekryterare-faq-data.ts:16`. Frågan står: `Hur funkar det med GDPR?` Samma påstående som de fyra.
- I dag: "... All data lagras i EU och vi säljer aldrig uppgifter vidare, och kandidaten kan radera sitt konto själv när som helst."
- Ny, hela svaret: `Varje kandidat i poolen har själv valt att synas, med ett uttryckligt samtycke som kan dras tillbaka när som helst. Vi visar bara strukturerade uppgifter som kandidaten godkänt, aldrig råa dokument. Kandidatprofilerna lagras i EU, i Irland, vi säljer aldrig uppgifter vidare, och kandidaten kan radera sitt konto själv när som helst.`
- **Schema:** FAQPage på `/for-rekryterare`. Ny rad `LD_UNDANTAG /for-rekryterare` (FAQPage).

**D-6. Exempelsidornas band.** `src/app/(public)/exempel/components/ExempelCTABand.tsx:77`.
- I dag: `Data i EU.`
- Ny: `Lagring i EU.`
- Belägg: vår lagring är Supabase och Vercel i Irland; bearbetningen hos Google sägs inte här. Inget schema.

**D-7. /om-oss, beskrivningen.** `src/app/(public)/om-oss/layout.tsx:7`.
- I dag: "... Data i EU, och vi loggar aldrig in åt dig." (154 tecken)
- Ny: `Vi bygger jobbverktyg för svensk arbetsmarknad sedan 2023. Källor från Arbetsförmedlingen, SCB och fackförbund. Lagring i EU, och vi loggar aldrig in åt dig.` (157 tecken)
- **Grind:** `META_BYTT /om-oss description`.

**D-8. Glömt lösenordet.** `src/app/auth/forgot-password/page.tsx:11-22`. Sidan ligger utanför SEO-grindens lista; inget schema.
- Citaten, rad 11-15. Rad 12 och 13 står (`Vi har alla glömt något. Det här är inte ditt jobb.` och `Vi fixar detta. Du fokuserar på nästa intervju.`). Rad 14 ("En länk är allt som står mellan dig och inkorgen.") blir: `Länken kommer till din inkorg. Titta i skräpposten om den dröjer.`
- Talen, rad 17-22, blir:
  ```ts
  const FORGOT_STATS = [
    { value: '24 h', label: 'gäller länken' },
    { value: 'Hashat', label: 'aldrig i klartext' },
    { value: '8+', label: 'tecken i nya lösenordet' },
    { value: 'HTTPS', label: 'hela vägen' },
  ]
  ```
- Ut: "< 1 min tills du är inne" (beror på mejlets leverans, går inte att belägga), "100% krypterat" (fel ord och ingen mätning bakom), "Säkert via e-post" (säger ingenting).
- Belägg: `mailer_otp_exp = 86400`; bcrypt i `auth.users`; formuläret kräver 8 (`NyttLosenFormular.tsx:99-100`); policyn avsnitt 6, "All trafik ... går över HTTPS (TLS)".
- Kommentaren överst (rad 1-6) skrivs om: talen är avgjorda 2026-11-22.

**D-9. Nytt lösenord** (samma slags påstående, upptäckt på vägen). `src/app/auth/reset-password/page.tsx:19-24`.
- I dag: `Kryptering / AES-256`, `Aldrig / lagrat i klartext`, `8+ / tecken min`, `Säkert / via Supabase`.
- Ny:
  ```ts
  const RESET_STATS = [
    { value: 'Hashat', label: 'aldrig i klartext' },
    { value: '8+', label: 'tecken minst' },
    { value: 'HTTPS', label: 'hela vägen' },
    { value: 'Supabase', label: 'sköter inloggningen' },
  ]
  ```
- "AES-256" gäller lagringens diskkryptering hos leverantören, inte lösenordet, och står inte i vår kod eller policy. Citaten (rad 12-16) står.

**D-10. Bli upptäckt: "percentiler" mot "nivå och placering".** Båda är sanna. Rekryteraren ser nivån och placeringen som "topp X %", räknad ur percentilen mot alla som gjort samma test (`PercentileDots.tsx:18-25, 57`, `candidateData.ts:348`), och sidan förklarar placeringen i kortet om kunskapstesterna (`bli-upptackt/page.tsx:47`, "bland de 10 procent som presterade bäst"). "Nivå och placering" står kvar på sidan. Samtycket ändras inte.

Det som däremot inte stämmer på sidan är att namn och arbetsgivare alltid är dolda till ett ja. I läget Öppen profil syns namnet och arbetsgivarnamnen direkt; e-postadressen kräver alltid ett ja (`candidateData.ts:7-14`, `VisibilityModeCard.tsx:46-53`). Anonym först är förvalt (`BliUpptacktClient.tsx:117-118`). Fyra rättelser:

- `src/app/(public)/verktyg/bli-upptackt/page.tsx:52`, kortet "Du är anonym tills du säger ja". Rubriken står. Text i dag: "... Aldrig ditt CV som fil, och aldrig namn eller kontaktuppgifter förrän du tackat ja till en förfrågan." Ny text: `Rekryteraren ser din roll, dina kompetenser, dina villkor (tillträde, arbetsplats, omfattning och län), dina verifierade testresultat med nivå och placering, och om du valt det dina två främsta styrkor i ord. Aldrig ditt CV som fil, och aldrig dina kontaktuppgifter förrän du tackat ja till en förfrågan. I läget Anonym först, som är förvalt, gäller samma sak för ditt namn.`
- `page.tsx:53`, kortet "Din nuvarande chef kan inte hitta dig". Rubriken står. Ny text: `I läget Anonym först döljer vi vilka företag du har jobbat på, också det du jobbar på i dag, så din arbetsgivare kan inte känna igen dig i kandidatpoolen.`
- `page.tsx:264`, `varde` under "Du har full kontroll hela vägen". Ny: `Du bestämmer vem som får se vem du är, och när. Ditt CV som fil visas aldrig, och dina kontaktuppgifter först när du tackat ja. I läget Anonym först, som är förvalt, gäller det också ditt namn och dina arbetsgivare.`
- `components/bli-upptackt-faq-data.ts:10`, frågan `Kan min nuvarande chef se att jag är synlig?` står. Nytt svar: `Nej, inte i läget Anonym först, som är förvalt. Där döljer vi vilka företag du har jobbat på, så din arbetsgivare kan inte hitta eller känna igen din profil även om de letar i kandidatpoolen. Väljer du Öppen profil syns ditt namn och dina arbetsgivare direkt.`
- **Schema:** FAQPage på `/verktyg/bli-upptackt`. Utöka raden `LD_UNDANTAG /verktyg/bli-upptackt`. Rubrikerna står, så ingen `RUBRIK_BYTT`.
- BU-1 (`bli-upptackt-faq-data.ts:30`) står som den är.

Samma fel, utanför ägarpunkterna men samma sak: `src/app/(public)/for-rekryterare/components/rekryterare-faq-data.ts:12` säger "Namn, foto och kontaktuppgifter är dolda tills kandidaten tackat ja". Ny lydelse av den meningen: `Namn och arbetsgivare är dolda tills kandidaten tackat ja, om hen inte själv har valt Öppen profil, och kontaktuppgifterna visas alltid först efter ett ja.` Byggaren kontrollerar i `candidateData.ts` om fotot följer namnet; gör det det läggs `, foto` till efter `Namn`. Ligger i FAQPage, samma rad som D-5.

**D-11. "Vem kan se mina sökta tjänster?"** Ny nionde fråga på `/verktyg/sokta-tjanster`, sist i `FRAGOR` i `src/app/(public)/verktyg/sokta-tjanster/sokta-tjanster-data.ts` (efter rad 88), synlig och i FAQPage ordagrant lika.
- Fråga: `Vem kan se mina sökta tjänster?`
- Svar: `Ingen annan användare, ingen rekryterare och ingen arbetsgivare. De ligger i ditt konto och visas aldrig i Bli upptäckt. Skapar du en delningslänk ser den som har länken det du har valt att visa, i ${APPLICATION_SHARE_TTL_DAYS} dagar. När vi skriver ett utkast till ett uppföljningsmejl går tjänst och arbetsgivare till Googles AI-tjänst, aldrig ditt namn eller dina kontaktuppgifter. Vi skickar ingenting till Arbetsförmedlingen.`
- Belägg: RLS på `job_applications` ger bara ägaren läsrätt (och admin för support, därför står inte "bara du"); rekryterarkoden läser aldrig `job_applications` (inga träffar i `src/lib/recruiter`, `src/app/api/recruiter`, `src/app/rekryterare`); delningslänken visar det som flaggorna i `ShareLinkFlags` medger och gäller `APPLICATION_SHARE_TTL_DAYS = 30` (`src/lib/applications/shareLinks.ts:16, 27-32`); underlaget till modellen (`uppfoljning.ts:5-7`).
- Talet: `APPLICATION_SHARE_TTL_DAYS` ligger i `shareLinks.ts`, som drar in `crypto` och adminklienten. Byggaren flyttar konstanten till en ren modul (till exempel `src/lib/applications/shareTtl.ts`) och importerar den därifrån på båda ställen, eller skriver `30` med ett test som vaktar mot konstanten, som `gratis-copy.ts` gör.
- **Schema:** sidan har ingen baslinje ännu, ingen rad behövs. Ta med frågan när första baslinjen tas efter deploy.
- På samma sida, `page.tsx:639`: raden "ingen där ser ditt konto" som SEO höll tillbaka är sann (ingen koppling till Arbetsförmedlingen finns). Stycket blir: `<b>Du lämnar in rapporten själv.</b> Vi skickar ingenting till Arbetsförmedlingen, och ingen där ser ditt konto.` Inget schema (stycket ligger utanför FAQ:n).

**D-12. "Vad vet Jobbcoachen om mig?"** Ny fråga på `/verktyg/jobbcoachen`, i `src/app/(public)/verktyg/jobbcoachen/components/jobbcoachen-faq-data.ts` efter frågan "Kan jag dela mitt CV med Jobbcoachen?" (rad 45-47), synlig och i FAQPage.
- Fråga: `Vad vet Jobbcoachen om mig?`
- Svar: `Det du har skrivit i profilen om målroll, ort och bransch, och det du skriver eller bifogar i samtalet. Jobbcoachen läser inte ditt CV, dina sökta tjänster eller dina testresultat på egen hand. Bifogar du ett CV eller ett brev byter vi ut namn, e-postadress och telefonnummer innan texten går till Googles AI-tjänst, men det du själv skriver går som du skrev det. Förslagen på frågor bygger på läget i dina sökta tjänster, och du väljer själv om du skickar dem. Samtalen sparas i ditt konto och tas bort när du raderar kontot.`
- Belägg: profilfälten `location, goal_role, industry` och de senaste 20 meddelandena (`chat/route.ts:173-181, 196-243`); maskningen av bilagor (`maskeraBilagor`, `chat/route.ts:65, 251`); förslagen räknas ur sökta tjänster i `src/lib/jobbsok/coach.ts:30-50` och blir en vanlig fråga först när användaren skickar den; `ai_messages` och `ai_conversations` kaskaderar med kontot; policyn avsnitt 3, fritext "skickas som du skrev det".
- SEO sa nej till frågan som ägarens; nu är den avgjord. Den nya frågan lägger till ett svar, ingen fråga byts.
- **Schema:** FAQPage på `/verktyg/jobbcoachen`. Utöka raden `LD_UNDANTAG /verktyg/jobbcoachen`.

**D-13. Förifyllningen i adressen (kod, inte text).** Uppgift till byggaren.
- Läget: Matchade jobb skapar inte längre adresser med tjänst och arbetsgivare; "Markera som sökt" går direkt mot rutten (`src/components/jobb3/jobb/AnnonsVy.tsx:159`, `MatchadeJobb.tsx:668-704`), och knapparna länkar bara `?logga=1` (`MatchadeJobb.tsx:108`). Men adressen tas fortfarande emot: `soktaHref` sätter `tjanst` och `arbetsgivare` om de skickas (`src/lib/jobbsok/adress.ts:71-73`), och sidan läser `tjanst`, `arbetsgivare`, `ort`, `lank`, `sista`, `af` och `matchning` ur adressen (`src/app/dashboard/sokta-tjanster/page.tsx:26-44`). En gammal länk, ett bokmärke eller en framtida knapp skickar därmed tjänst och arbetsgivare till PostHog med sidvisningen.
- Gör så här:
  1. Ta bort `tjanst` och `arbetsgivare` ur `soktaHref` (`adress.ts:66-75`) och ur dess typ.
  2. Ta bort `forifylltUr` ur `sokta-tjanster/page.tsx:26-44` och läsningen av parametrarna. Kvar: `?logga=1` och `?logga=ska-soka`, som öppnar arket.
  3. Behövs förifyllning från en träff igen bärs den i webbläsarens lagring på samma sätt som det publika flödet: en nyckel som `jc_sokt_prova` med 24 timmars livslängd och läsning och skrivning i try/catch (`src/lib/jobbsok/provaSokt.ts:1-60`), läst i `SoktaVy` (`src/components/jobb3/sokta/SoktaVy.tsx:58-75`). Ingen ny servertabell.
  4. Kommentarerna i `LoggaArk.tsx:16-18` och `:146` skrivs om.
  5. Testerna i `src/components/jobb3/sokta/__tests__/testvag-uppdatering.test.tsx:97-125` som öppnar `?logga=1&tjanst=...&arbetsgivare=...` skrivs om till utkastet i lagringen.
  6. Kontrollera i webbläsaren att en sidvisning på `/dashboard/sokta-tjanster?logga=1` inte bär något annat i `$current_url`.

---

## Punkt 3. Mejlmallarna

Mejlen säger efter detta samma sak som de publika sidorna. 25 ställen i mejlen, plus två rader i Kom igång som bara syns i kontot men står i samma funktion (M18, M19). Ämnesrader för skickade kampanjer rörs inte; ingen av ändringarna nedan gäller en sådan.

### Premiumlistan och kvotväggsmejlet

**M1. GEM-4 förs in, och mejlet följer med.** `src/lib/plans/plans.ts:93-99` (`HELA_PAKETET_RADER`), läst av /priser (Product-schemat), startsidan, /funktioner, artiklarnas listslutkort (`reklam-copy.ts:298`) och kvotväggsmejlet (`templates/conversion.ts:10`). Listan delas inte i två: mejlet ska säga det sidorna säger. Sex rader:
```ts
export const HELA_PAKETET_RADER = [
  'Alla nivåer i de åtta testtyperna, övningsprov mot klockan och det fördjupade personlighetstestet',
  'Alla CV-mallar, CV-analysens alla förslag, personliga brev och LinkedIn',
  `Jobbmatchning, de ${JOB_MATCHES_PER_RUN} bästa träffarna med skälen`,
  'Uppföljningsmejl till dina sökta tjänster och rapporten till Arbetsförmedlingen, att skriva ut eller kopiera',
  'Jobbcoachen, fråga så mycket du vill',
  'Intervjuprovet utan dagsgräns och hela din testhistorik',
] as const
```
Rad 2 och 4 är textforslag GEM-4 och GEM-5. Rad 1 skiljer sig från textforslag: "i tre nivåer" stämmer inte, talserier har två (OVERLAMNING, "Sakfel i skisserna rättade mot koden"). Kommentaren över listan (rad 87-92) får en mening om att kvotväggsmejlet läser den. Test i `src/lib/plans/__tests__/` som vaktar sex rader och att "tre nivåer", "hela CV-analysen" och "fynd" inte står.
- **Schema:** Product på `/priser`. Utöka raden `LD_UNDANTAG /priser` (Product, FAQPage) med GEM-4.

**M2.** `src/lib/email/lifecycle/templates/conversion.ts:27`, preheadern.
- I dag: `${paketMedPris(SALD_PLAN)}, utan tak och utan bindningstid.`
- Ny: `` `${paketMedPris(SALD_PLAN)}, utan bindningstid.` ``
- Skäl: "utan tak" om Premium som helhet stämmer inte (30 uppföljningsmejl och 30 förslag i CV-byggaren per dygn, B-13).

**M3.** `conversion.ts:39`, andra stycket.
- I dag: "... Med ' + paketKort() + ' tar vi bort taket på allt, och du säger upp när du vill."
- Ny: `` 'Det är inte ett problem, det betyder att du söker på allvar. Men då arbetar du emot en gräns som är byggd för den som skickar en ansökan i veckan. Med ' + paketKort() + ' skriver du personliga brev, frågar Jobbcoachen och tränar alla testnivåer utan att räkna, och du säger upp när du vill.' ``
- Belägg: `chat_unlimited` (`quotaService.ts:271`), personliga brev utan tak och intervjuprovet utan tak (textbeslut Del 4 punkt 6).

### Gratisnivåns kampanj

**M4.** `templates/campaign-gratisniva.ts:43`.
- I dag: "... Kort sagt: du kan fortfarande prova varje verktyg, men uttaget, alltså den färdiga filen och djupet, ingår i ${paketKort()}."
- Ny: `` `${when.charAt(0).toUpperCase()}${when.slice(1)} ändrar vi vad som ingår gratis. Kort sagt: du kan fortfarande prova varje verktyg. Det personliga brevet som fil, alla mallar och de högre testnivåerna ingår i ${paketKort()}.` ``
- Skäl: en CV-nedladdning är gratis (`FREE_CV_EXPORTS = 1`, B-28), så "den färdiga filen" stämmer inte för CV:t.

**M5.** `campaign-gratisniva.ts:48`.
- I dag: `CV-mallar: ${talSomOrd(FREE_TEMPLATE_COUNT)} fria mallar, resten förhandsvisas i full storlek`
- Ny: `` `CV-mallar: ${talSomOrd(FREE_TEMPLATE_COUNT)} fria mallar och en nedladdning, resten förhandsvisas i full storlek` ``

**M6.** `campaign-gratisniva.ts:49`.
- I dag: "CV-analys: en analys per konto, med poängen, antalet fynd och det tyngsta fyndet i klartext"
- Ny: `'CV-analys: läsbarhetspoängen och genomgången i sju delar, för varje CV'`
- Belägg: `GRATIS_LISTA[2]` och textbeslut B-1 (`analysData.ts:300-311`).

**M7.** `campaign-gratisniva.ts:50`.
- I dag: `Personliga brev: ett personligt brev per konto, sedan ett i veckan. Nedladdningen ingår i ${paketKort()}`
- Ny: `` `Personliga brev: ett personligt brev ${GRATIS_BREVFONSTER}, och de två senaste går att ändra. Nedladdningen ingår i ${paketKort()}` `` med `GRATIS_BREVFONSTER` importerad ur `gratis-copy.ts`.
- Belägg: L5 i textforslag, `GRATIS_LISTA[3]`.

**M8. B4, `GRATIS_TESTRAD`.** `src/lib/plans/gratis-copy.ts:49-54`. Mejlet var skälet att strängen stod kvar med "fråga". Nu följer mejlet listan.
- Ny:
  ```ts
  /** Testraden i gratisnivåmejlet (campaign-gratisniva.ts): samma rad som listans första. */
  export const GRATIS_TESTRAD = GRATIS_LISTA[0]
  ```
  flyttad under `GRATIS_LISTA`. Mejlraden på `campaign-gratisniva.ts:51` står som i dag och säger då "... och förklaring efter varje uppgift". `gratis-copy.test.ts` får en vakt att `GRATIS_TESTRAD === GRATIS_LISTA[0]`.

### Uppsägningsmejlet

**M9.** `templates/transactional.ts:63`.
- I dag: `Dina personliga brev, CV:n och testresultat ligger kvar och går att läsa och kopiera. Kontot fungerar på gratisnivån: ${talSomOrd(FREE_TEMPLATE_COUNT)} CV-mallar, ett personligt brev i veckan och grundnivån i varje testtyp.`
- Ny: `` `Dina personliga brev, CV:n och testresultat ligger kvar och går att läsa och kopiera. Kontot fungerar på gratisnivån: ${talSomOrd(FREE_TEMPLATE_COUNT)} CV-mallar, ett personligt brev ${GRATIS_BREVFONSTER} och ${GRUNDNIVAN_ALLA_DAG}.` `` med `GRATIS_BREVFONSTER` och `GRUNDNIVAN_ALLA_DAG` ur `gratis-copy.ts`.
- Mejlet går (`cancel_immediate`, fyra de senaste 60 dagarna).

### Kom igång-mejlen (går varje morgon, 250 de senaste 60 dagarna)

Alla i `src/lib/email/lifecycle/templates/komigang.ts`, funktionen `brickmejl`.

**M10. `uppdatera_cv`, rad 134-140.** I dag påstår mejlet att analysen hittat två fynd, "resultaten saknar siffror" och "nyckelorden ... finns inte med", oavsett vad CV:t innehåller, och ber om omkörning.
```ts
subject:
  typeof fakta.poang === 'number'
    ? `Ditt CV fick ${fakta.poang} av 100. Så hittar du poängen som fattas.`
    : 'Se var ditt CV tappar poäng.',
preheader: 'Ändra där det tappar och spara. Poängen räknas om direkt.',
body: `${hej} Genomgången visar ditt CV i sju delar och var varje tappad poäng sitter. Börja med den del som tappar mest, ändra och spara, så ser du poängen stiga.`,
cta: 'Öppna genomgången',
```
Belägg: poängmodellen av 100 i sju delar (textbeslut CVA-1), poängen räknas om när CV:t sparas (CVA-6), "ingen omkörning" (kommentaren i `src/lib/onboarding/komigang.ts:250`).

**M11. `analys` och `analys_gratis`, rad 159-162.**
```ts
subject: 'Se din läsbarhetspoäng, del för del.',
preheader: 'Sju delar, och var varje tappad poäng sitter.',
body: `${hej} Ditt CV ligger uppe. Analysen ger det en läsbarhetspoäng av 100 och går igenom det i sju delar, så att du ser var varje tappad poäng sitter och vad du ändrar för att få tillbaka den.`,
cta: 'Se poängen',
```
Ut: "fynd", "fynden i tyngdordning", "nyckelord" och "Två minuter".

**M12. `coach`, rad 206.**
- I dag: `${hej} Jobbcoachen känner ditt CV och din målroll. Fråga om löneanspråk, ...`
- Ny: `` `${hej} Jobbcoachen känner till din målroll, ort och bransch från profilen, och läser ditt CV när du delar det i samtalet. Fråga om löneanspråk, om vad du ska säga på intervjun eller om ett avtal du fått.` ``
- Ämnet och preheadern ("Utan tak i ..." gäller Jobbcoachen, som saknar tak i Premium) står. Belägg: L4, `chat/route.ts:196-243`.

**M13. `matris_grund`, rad 211-214.** Brickan leder till Nivåkollen (`src/lib/onboarding/komigang.ts:320-339`, rubriken i mejlet är "Nivåkollen"), men mejlet beskriver det gamla grundtestet på 20 minuter.
```ts
subject: 'Nivåkollen: din nivå i matrislogik på cirka åtta minuter.',
preheader: 'Sedan tränar du på din nivå.',
body: `${hej} Matrislogik är det moment nästan alla urvalstest börjar med. Nivåkollen visar var du ligger på cirka åtta minuter. Sedan tränar du på den nivån, och när du är klar förklarar vi varje svar.`,
cta: 'Kolla min nivå',
```
Belägg: brickans text "cirka åtta minuter, sedan träning på din nivå" och knappen "Kolla min nivå" (`komigang.ts:326-337`), träningsmejlets "Vi förklarar varje svar när du är klar" (`templates/traning.ts:169-170`).

**M14. `matris_avancerad`, rad 220.** "fråga" blir "uppgift":
`` `${hej} Avancerad nivå har samma mönstertyper som grundnivån men fler steg i varje, och förklaringen efter varje uppgift visar var resonemanget brister.` ``

**M15. `verbalt_numeriskt_grund`, rad 227.** "tar en halvtimme tillsammans" går inte att belägga:
`` `${hej} Urvalstesten blandar typerna. Verbalt mäter hur du läser, numeriskt hur du räknar under tidspress. Börja med grundnivån i båda.` ``

**M16. `provlage`, rad 233.** "25 till 40 minuter" går inte att belägga; tiden följer provets format.
- Ny preheader: `'Samma format och tid som provet, lämnas in när tiden är ute.'` (brickans egen text, `komigang.ts:363`).

**M17. Brickan `uppdatera_cv` i Kom igång**, `src/lib/onboarding/komigang.ts:246-256`. `titel` blir rubriken i mejlet och står i listan i mall-mejlets ämne.
- `titel`: `Uppdatera CV:t efter genomgången`
- `text`: `Ändra där poängen tappar och spara`
- `knapp`: `Öppna genomgången`
- `klarText`, `kort` och `href` står. Följer GEM-13:s ordval ("CV:t uppdaterat efter genomgången").

**M18. Brickan `analys`** (bara i kontot, löser B6:s överhoppade rad), `komigang.ts:224-235`.
- `text`: `Läsbarhetspoängen i sju delar` (textbeslut Del 2 avsnitt 18)
- `klarText`: `` typeof fakta.poang === 'number' ? `Poäng ${fakta.poang}` : undefined `` (fynden ut)

**M19. Brickan `analys_gratis` i `brickaText`** (bara i kontot), `komigang.ts:240`.
- `text`: `Poängen och vad som saknas, del för del` (samma som gratistexten på rad 418 och B6)

### Kvotpåminnelsen

**M20.** `src/lib/email/quota-back.ts:31-37`, `cv_analysis`. Analysen har ingen kvot, mejlet säger "Kvoten har nollställts. Kör en ny analys". Posten tas bort ur `FEATURE_COPY`. Samtidigt mejlregel 2 (rutten tar inte emot featuren). Ingen ny text: det finns ingen kvot att säga något sant om.

**M21.** `quota-back.ts:39-45`, `chat_message`. Tio meddelanden per konto kommer aldrig tillbaka, mejlet säger "Du kan ställa frågor till jobbcoachen igen". Posten tas bort, samma skäl. Kommentaren på rad 75-79 säger redan detta; den får en mening om att posterna är borta.

### Mejlet till kandidaten om en rekryterares intresse

**M22.** `src/lib/email/recruiter-interest.ts:70`.
- I dag: "... Din profil är fortfarande anonym, ditt namn och din e-postadress delas först om du väljer att acceptera."
- Ny meningen: `Din e-postadress delas först om du tackar ja. Har du valt Anonym först gäller det också ditt namn.`
- Belägg: `candidateData.ts:7-14`.

**M23.** `recruiter-interest.ts:92`.
- I dag: "Accepterar du delas ditt namn och din e-postadress så att ni kan ta kontakt."
- Ny meningen: `Accepterar du delas ditt namn, din e-postadress och arbetsgivarna i din erfarenhet, så att ni kan ta kontakt.`

### Mejlet för nytt lösenord

**M24.** `src/lib/email/password-reset-email-generator.ts:102` och `:199`.
- I dag: "Länken är giltig i 60 minuter"
- Ny: `Länken gäller i 24 timmar` (rad 102, inom `<li>`) och `Länken gäller i 24 timmar.` (rad 199). Samma ordalydelse som `epostbyte.ts:34`.
- Belägg: `mailer_otp_exp = 86400`.

**M25.** Samma fil, rad 69 (🔒) och rad 99 (⚠️). Emojierna tas bort; rad 99 blir `Viktigt att veta:`. Spannet på rad 69 tas bort helt om det bara bär ikonen.

**M26.** Samma fil, rad 156 och 207: `https://www.jobbcoach.ai/support` svarar 404 (kontrollerat mot live). Byts mot `https://www.jobbcoach.ai/kontakt`.

**M27.** `src/lib/email/confirmation-email-generator.ts:132`: "© 2024 Jobbcoach.ai • Denna länk är giltig i 24 timmar" blir `Jobbcoach.ai. Länken gäller i 24 timmar.` (giltigheten stämmer, `send-confirmation/route.ts:71-72`; året och mittpunkten ut). Byggaren kontrollerar först om mallen fortfarande används (`mailer_autoconfirm` är på); används den inte, lämnas den.

### Lästa och utan fel

`templates/winback.ts`, `vecka.ts` (uppsagt och kvitto), `weekly-digest.ts`, `traning.ts` och `traningsmejl-tema.ts`, `campaign-kampanj.ts` (Black Week), `epostbyte.ts`, `interest-message.ts`, `interest-response.ts`, `saved-search-alert.ts`, `paketFornyasMejl` och övriga brickor i `komigang.ts`. `campaign-sokta-tjanster.ts` är pensionerad (rutten svarar 410) och rörs inte.

### Grind och tester för punkt 3

- Mejlmallar ligger utanför SEO-grinden. Bara M1 rör schema (Product på `/priser`, se ovan).
- Kör de berörda testerna: `src/lib/plans/__tests__/`, `src/lib/email/lifecycle/__tests__/`, `src/lib/onboarding/__tests__/` och `src/components/pricing/__tests__/paket-copy.test.ts` (GEM-13 vaktar Kom igång-listan). Tester som låser de gamla mejlsträngarna skrivs om till de nya.
- Sök efter push i `src/lib/email/**` efter `fynd`, `tyngsta`, `per konto`, `utan tak`, `ATS`, `varje fråga`, `nyckelord`, `60 minuter` och `/support`. Varje träff som inte står här rapporteras, den rättas inte på egen hand.
- Förhandsvisa M10, M11, M13 och kvotväggsmejlet med en riktig profil i admin-vyns mejlförhandsvisning. Inget mejl skickas.

---

## Ordningen

1. **S-1, i dag, ägaren.** Policyerna på hinken `cvs`, klicktestet, genomgången av loggarna.
2. **Push A, mejlen och Premiumlistan:** M1 till M27 och D-13. Inga publika säkerhetstexter. Grinden: `/priser` (Product).
3. **Push B, säkerhetstexterna, efter att S-1 är testat:** D-1 till D-12 och punkt 1 (/integrationer). Grinden: `/`, `/funktioner`, `/verktyg/cv-analys`, `/verktyg/personligt-brev`, `/for-rekryterare`, `/verktyg/bli-upptackt`, `/verktyg/jobbcoachen`, `/om-oss`, `/exempel`, `/integrationer`. Revalidera de rörda adresserna efter deploy; `/verktyg/sokta-tjanster` får sin första baslinje med den nionde frågan.
4. **Ägaren, med jurist:** listan "Kräver ändring i policyn". Kodändringarna som gör policyn sann (PostHog utan e-post, `email_events` vid radering) beställs när ägaren valt väg.
5. **Ägaren, Auth:** `password_min_length` till 8 och kontroll av läckta lösenord.
