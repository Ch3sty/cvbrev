# Rummen: överlämning till ägaren

2026-10-11. Branch `design/rummen-klar` (159 commits före `origin/main`, ingenting pushat). Allt nedan är byggt, typkontrollerat, testat och klicktestat i riktig Chrome mot ett lokalt produktionsbygge. Testrummet är klicktestat mot förhandsvisningar med fixturdata, inte mot riktig data, eftersom tre migreringar inte är körda i prod (punkt 2 i checklistan).

## Vad som är byggt

**Våg 1a, tokens och mörkt läge.** Koppar är den enda accenten i inloggat. Fyra rumsfärger (indigo för Rekryteringstester, petrol för CV, plommon för Personliga brev, skog för Jobbsöket) och grafit för profilen. Mörkt läge finns för första gången, via systeminställningen eller Utseende i profilen. Designsystemet heter nu v3 "Rummen".

**Våg 1b, skalet.** Mörk vägg högst upp i varje rum, papper och golv under. Fyra dörrar i bottennavet på mobil och en sidomeny på dator med profilen längst ner. En kopparknapp per vy, egna symboler i stället för lucide och skelett med samma höjd som innehållet.

**Våg 2, ingången och hemvyn i Rekryteringstester.** Hon väljer testtyp, test och provdatum. Hemvyn visar dagar kvar, planen och dagens pass, i 20 tillstånd från första besöket till dagen efter provet. Gratisnivån följer ditt beslut 17.2: mätningen en gång och ett första pass samma dag, sedan betalvägg.

**Våg 3, testmotorn och banken.** Nivåmätning, dagliga pass, riktade pass, ommätning och generalrepetition. Servern räknar nivå, tempo och milstolpar. Matrisbanken är rensad enligt testansvarigs beslut: sex banker, 270 frågor, facit kontrollerat maskinellt.

**Våg 3b, passet och resultaten.** Frågevyn med tumtryck, uppvärmningen, mätningens resultat (M1), passets kvitto (P1 till P4, S1), ommätningen (O1) och kurvan (K1).

**Våg 4, CV, Personliga brev och Jobbsöket.** Samma byggstenar som testrummet. CV-rummet har poängringen och fynden, brevrummet träffarna mot annonsen och brevet som dokument, Jobbsöket har spåret med fyra stationer. /dashboard landar i det rum hon senast använde.

**Våg 5, Jobbcoach Premium.** Bara Premium, 149 kr i månaden, säljs. Prissidan har ett kort, alla betalväggar har samma anatomi och prenumerationssidan har tre lägen (gratis, Premium, kvarvarande spårkund). Publika sidor och FAQ-schema säger Premium. Kundcitaten utan källa är borta. Integritetspolicyn och villkoren säger Google (Gemini API) i stället för OpenAI. /kontakt skickar på riktigt, med honungsfält och IP-gräns. cancel_followup schemaläggs inte längre.

**Sista omgången (i dag):** generalrepetitionen kvitterar provlägets bricka i Kom igång. En spårkund som försöker köpa Premium skickas till prenumerationssidan med raden "Du har {paketet}. Byt till Premium på prenumerationssidan." i stället för att få höra att hon redan har Premium. Intervjuprovets kvotspärr räknas som betalvägg (plats `intervjuprov`). "Ladda ned" blev "Ladda ner" i alla användartexter. Köpstegets kort tappade sin kopparkant.

## Siffror

| Grind | Resultat |
|---|---|
| tsc | 0 fel |
| vitest | 115 filer, 1 333 tester, alla gröna |
| next build | grönt |
| grep-rummen våg 1b, 2, 3b, 4, 5 med --noll | alla noll |
| kontrast-rummen | 240 textpar, inga avvikelser, lägsta 4,5:1 |
| Banken: validate-v7 och v7-parallel per bank, v7-facit | 6 av 6, 6 av 6, facit utan fel |
| testmotorn-pglite | alla kontroller gröna |
| perf-inloggat, 48 routes med förhandsvisningarna | 48 av 48 inom LCP-budget efter omätning (tre körningar på avvikarna). CLS 0 utom skapa-cv steg 7, se riskerna |
| perf-publikt | /priser 0,56 s, /verktyg/rekryteringstester 0,49 s, /cv-mallar/sjukskoterska 0,58 s, /kontakt 1,56 s (budget 1,5 s, inom toleransen). CLS 0 utom /cv-mallar/[yrke], se riskerna |
| Klicktest | 467 skärmdumpar, fem konton, Pixel 7, 360 och 1280, ljust och mörkt: de fem rummen (90 vyer), förhandsvisningarna (132), Alla tester (12), /priser (6), betalväggarna (70), prenumerationssidan i tre lägen (18), registreringen (10), båda kontaktformulären (10), spårkundens köpsteg (3), köpsteget till Stripe Checkout i testläge (2), knappar på 360 px (54 routes, 0 för breda). Inga fel för användaren; 15 loggade fel är kända brus, se `docs/qa/rummen/final/README.md`. Alla testrader raderade, 0 kvar |
| SEO-diff | `docs/qa/rummen/vag-5/seo-diff-slutlig.md`. Canonical oförändrad på 50 sidor. Title ändras bara på /priser, h1 på /priser och /cv-mallar |

## CHECKLISTAN, i den här ordningen

### 1. cancel_followup (bråttom)

Ett mejl som lovar "49 kr i månaden i två månader" ligger i kön och skickas **14 oktober kl. 07.00** svensk tid. Två har redan gått (läst skrivskyddat i prod i dag). Erbjudandet finns inte i koden efter uppsägning.

Kontrollera först:

```sql
select count(*) from email_schedule
where email_type = 'cancel_followup' and sent_at is null and canceled_at is null;
-- väntat: 1

select user_id, sent_at from email_log
where email_type = 'cancel_followup' order by sent_at desc;
-- väntat: 2 rader, de som redan fått löftet
```

Avbryt sedan:

```sql
update email_schedule
set canceled_at = now(), cancel_reason = 'erbjudandet finns inte i koden'
where email_type = 'cancel_followup' and sent_at is null and canceled_at is null;
```

Beslut: skriv om mejlet utan erbjudande, som frågan "Vad saknades?" (saas-leads rekommendation), eller bygg erbjudandet. Och om de två som fått mejlet ska få ett rättelsemejl från dig. Kontrollera också att kupongen `retention_49_2m` finns i Stripe, eftersom uppsägningsflödet erbjuder den till Premium-kunder.

### 2. Migreringar, i ordning

Läst skrivskyddat i prod i dag: säkerhetsmigreringarna från `main` (20261010181000 till 20261010220000) är redan körda. Tre från Rummen saknas, och utan dem står testrummet i felet "Passet gick inte att hämta" och landningen i senaste rum sparas inte:

1. `supabase/migrations/20261011100000_test_planer.sql` (tabellen test_planer)
2. `supabase/migrations/20261011101000_testmotorn.sql` (test_nivapunkter, test_milstolpar, fraga_statistik, slutfor_traningssession och två funktioner till)
3. `supabase/migrations/20261011140000_rummen_vag4.sql` (profiles.senaste_rum, profiles.matchningar_sedda_at, matchningar_nya())

Inga nya migreringar har tillkommit i den här omgången. Kör dem i den ordningen, före pushen, med Supabase CLI eller SQL-editorn i Jobbcoach-projektet. Kontroll efteråt:

```sql
select
  (select count(*) from information_schema.tables where table_schema = 'public'
     and table_name in ('test_planer','test_nivapunkter','test_milstolpar','fraga_statistik')) as tabeller,  -- 4
  (select count(*) from information_schema.columns where table_name = 'profiles'
     and column_name in ('senaste_rum','matchningar_sedda_at')) as kolumner,                                  -- 2
  (select count(*) from pg_proc where proname in ('slutfor_traningssession','registrera_milstolpar','uppdatera_fraga_statistik','matchningar_nya')) as funktioner;  -- 4
```

### 3. Push

```bash
git push origin design/rummen-klar
gh pr create --base main --head design/rummen-klar --title "Rummen: våg 1a till 5"
```

Merga när PR:en är grön. Vercel deployar main.

### 4. Stripe

```bash
node scripts/stripe-premium-byte.mjs            # torrkörning, visar vad som byts
node scripts/stripe-premium-byte.mjs --skarpt   # byter produktnamnet till Jobbcoach Premium
```

Skriptet ändrar bara produktens namn och beskrivning, inga priser. Ändra sedan kontoutdragets text till **JOBBCOACH PREMIUM** i Stripe under Inställningar, Offentliga uppgifter.

### 5. Efter deploy: E2E mot prod

```bash
node scripts/qa-rummen-vag2-prod.mjs --bas https://www.jobbcoach.ai
node scripts/qa-rummen-vag3b-prod.mjs --bas https://www.jobbcoach.ai
```

Båda skapar egna konton (`qa-rummen-*-prod-*@jobbcoach-qa.test`) och raderar dem per id efteråt. Skärmdumparna hamnar i `docs/qa/rummen/vag-2/prod/` och `vag-3b/prod/`.

### 6. Dina beslut

- **Maskeringen i fyra flöden.** Namn, e-post, telefon och adress byts ut mot platshållare före personliga brev, CV-analysen och CV-tolkningen. Det görs inte i omskrivet CV, jobbmatchningen, LinkedIn-optimeringen och Jobbcoachens bifogade dokument (och en inskannad PDF läses av Gemini före maskeringen). Policyn säger nu exakt det. Ska de fyra flödena maskas också?
- **PostHog-samtycket.** PostHog startar i dag utan att läsa cookie-samtycket (`src/components/PostHogProvider.tsx`). Policyn nämner PostHog (EU) för användningsstatistik. Ska PostHog vänta på samtycke, eller räcker policyn?
- **Gratisnivån i de klassiska testerna.** 17.2 gäller Träningen. De klassiska testerna (numeriskt, verbalt, logik) har fortfarande en grundsession om dagen. Säger du ja till att 17.2 gäller alla testtyper ändras en rad i `quotaService`. Säger du nej kan meta description och rubriker återfå "Grundnivån är gratis" och "Tre tester gratis"; i dag lovar de bara det som är sant i båda fallen.
- **Gemini-nivån.** Bekräfta att Gemini API körs på betald nivå med fakturering i Google AI Studio. På gratisnivån får Google använda indata för att förbättra modeller, och då stämmer inte policyn.
- **Juridisk översyn av villkoren.** Särskilt ångerrätten för en löpande tjänst, "tidigare köp" för veckokunderna och att leverantörer utanför EU (Google, Vercel, Resend, Stripe) behöver rättslig grund för överföringen.

## Kända risker och vad som inte kunnat testas mot riktig data

- **Testrummet mot riktig data.** Hemvyn, ingången, passen och resultaten är klicktestade mot förhandsvisningarna (20 tillstånd, 10 ramar) och testade med PGlite, inte mot prod. Punkt 5 i checklistan är det första riktiga testet.
- **Köp och byte i Stripe.** Köpsteget är kört fram till Stripe Checkout i testläge. Ingen betalning är genomförd i den här omgången, och spårkundens byte till Premium (409 till prenumerationssidan) är testat med ett simulerat svar, eftersom en spårprenumeration bara finns i Stripe.
- **Registreringen.** Steg 1 och 2 är klicktestade med kontoskapandet stoppat i webbläsaren, för att inga bekräftelsemejl skulle gå ut. Steg 3 är testat med ett konto skapat med service-nyckeln.
- **Startsidan tappade länken till /verktyg/personlighetstest** när Träningspaketets rad försvann. Låt seo-agenten avgöra om den ska tillbaka.
- **Befintliga fel som inte kommer från Rummen:** /cv-mallar/[yrke] har CLS 0,23 på mobil (samma i prod), og:image saknas på /verktyg/bli-upptackt och /verktyg/personlighetstest (samma i prod), och cookiebannern ändrar höjd ibland så att skapa-cv steg 7 får CLS 0,07 i två av fem mätningar.
- **Brus i konsolen:** /dashboard loggar "Failed to fetch" när sidan skickar vidare till senaste rum och en hämtning avbryts, och brevets nedladdning loggar 402 innan betalväggen visas. Ingen av dem syns för användaren.
- **Mätningen.** Datakvalitetsnoten i `src/app/admin/tratt/funnel-data.ts` säger att platsen `kvot` mäts "från deployen av våg 5". Det datumet blir deploydagen; skriv in det i noten när du vet det. Platsen `intervjuprov` mäts från samma dag.
- **Mina CV säger "4 av 2 CV använda"** för konton som har fler CV än gratisgränsen från före gränsen. Bör skrivas om.
- **Stripes testläge heter fortfarande Hela paketet** i kassan. Live byts i punkt 4.
- **GraValSheets `planKey`** läses inte längre men står kvar i tre klienter och fyra sidor. Ofarligt, kan tas bort i nästa omgång.
