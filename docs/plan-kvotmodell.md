# Plan: Ny kvot- och premiummodell (dagsrytm)

> **STATUS 2026-07-05: IMPLEMENTERAD OCH DRIFTSATT** (leverans 1-3 i ett svep).
> Kvottjänsten ligger i `src/lib/quota/quotaService.ts` och räknar befintliga
> tabeller (självrensande fönster, ingen ny räknartabell). Migration
> `quota_daily_model_support` applicerad (quota_reminders, opt-out-kolumner,
> index). Kvarstående kända begränsningar: jobbmatchningens 10-gräns är
> fortfarande klientside (serverflytt kräver ombyggnad av match-jobs edge
> function + RLS på global_job_cache, se avsnitt nedan), mailmallarna är
> medvetna placeholders, och legacy-sidan /dashboard/my-letters har kvar
> gammal spärr-copy.

Beslutad 2026-07-05. Ersätter dagens blandning av rullande 7-dygnsfönster,
kalenderveckor och permanenta väggar med en enhetlig dagsrytm för
gratisanvändare.

## Problemet

Flera kärnfunktioner har kvoten 1 per rullande 7 dygn, där klockan startar vid
första användningen. En ny användare gör det roliga direkt efter registrering,
möter väggen inom minuter och får komma tillbaka om exakt en vecka. Ingenting
påminner dem: ingen re-engagement är schemalagd, och `expire-premiums`-cronen
är inte ens registrerad. Risken att en nöjd ny användare hunnit glömma
webbappen på 7 dagar är mycket hög. Man hinner aldrig bli hooked.

## Principen

En arbetssökande lever i dagsrytm (nya annonser varje dag, ansökningar
löpande). Gratisnivån ska följa samma rytm: "kom tillbaka imorgon" bygger
vana, "kom tillbaka nästa fredag" bygger ingenting. Uppgraderingstrycket
flyttas från frekvens (vänta en vecka) till kapacitet (du vill göra mer än
dagskvoten idag), vilket är rätt tryck för en aktiv användare. Funktioner
utan marginalkostnad (testerna) används maximalt som habit-byggare.

## Gratisnivån

| Funktion | Idag (verklig kod) | Ny modell | Nollställning |
|---|---|---|---|
| Personligt brev, generering | 7 per rullande 7 dygn (prissidan säger 5) | **2 per dag** | Midnatt svensk tid |
| CV-analys | 1 per rullande 7 dygn | **1 per 3 dygn** | Rullande 72h |
| Prov-läge (matrislogik-, verbal-, numeriskt prov) | 1 per typ per rullande 7 dygn | **1 per typ per dag** | Midnatt svensk tid |
| Kognitiva träningstester (matris/verbal/numerisk × grund/avancerad/expert) | Grund obegränsat, avancerad+expert premium-låsta | **Alla nivåer upplåsta, 1 session per dag per typ+nivå** | Midnatt svensk tid |
| Personlighetstest | Grund gratis, avancerad premium | **Oförändrat** (engångsleverabel, ingen träningsloop) | - |
| Jobbcoach-chatt | Obegränsad, ingen spärr finns | **10 meddelanden per dag** | Midnatt svensk tid |
| Jobbmatchning | 10 jobb, trunkeras bara i klienten | **10 jobb serverside** + synlig "X matchningar till väntar i Premium" | Ingen tidskvot |
| LinkedIn-optimering | 1 per rullande 7 dygn (prissidan säger "per månad") | **Oförändrat: 1 per 7 dygn**, rättad copy | Rullande 7 dygn |
| Kompetensanalys (pausad funktion) | 2 per kalendervecka | Oförändrat; flyttas in i kvottjänsten om den återaktiveras | - |
| CV-mallar | 12 gratis av 42, bara klientvalidering | **Oförändrade antal**, exportvalidering serverside | - |
| Brevmallar | 5 gratis av 9 (docx: 5 av 7) | Oförändrat | - |
| Brev-tonaliteter | 5 av 6 (auto-tonen låst) | Oförändrat | - |
| Sparade brev | Hård vägg vid 2, spara blockeras | **2 aktiva, äldre låses** (gråas, "Lås upp med Premium"), raderas aldrig | - |
| Sparade CV | 2 aktiva, äldre låsta men bevarade | Oförändrat (förebilden för brev-mönstret) | - |
| E-postverifiering | Krävs för fler än 1 sparat brev | Oförändrat | - |

Maxdag för en aktiv gratisanvändare: 2 brev, 9 träningstester, 3 prov,
10 chattmeddelanden, plus CV-analys var tredje dag. Gott om anledningar att
återvända varje dag, tydligt tak i varje enskild funktion.

## Premium (149 kr/mån, 7 dagars trial med kort)

| Funktion | Premium idag | Efter planen |
|---|---|---|
| Personligt brev | Obegränsat | Oförändrat |
| CV-analys | Obegränsat | Oförändrat |
| Träningstester + prov | Obegränsat, alla nivåer | Oförändrat (nu mot dagskvot i stället för nivålås) |
| Personlighetstest avancerad | Ingår | Oförändrat |
| Jobbcoach-chatt | Obegränsad (som alla idag) | **Blir en faktisk premiumfördel** när gratis får dagstak |
| Jobbmatchning | Alla matchningar | Oförändrat |
| CV-mallar | Alla 42 | Oförändrat; marknadsförs som "30 exklusiva mallar" i stället för dagens "alla 8" |
| Brevmallar + toner | Alla 9 + auto-tonen | Oförändrat |
| Sparade CV / brev | 50 / obegränsat | Oförändrat |
| LinkedIn-optimering | Obegränsat | Oförändrat |
| Gästinbjudningar | 5 per rullande 7 dygn, gäst får trial | Oförändrat antal; **gäst-trial sätts till 7 dagar** (koden ger idag 2, mailet lovar 7) |
| XP-multiplikator | 1,5x | Oförändrat |

Premium ändras nästan inte. Poängen är att gratisanvändaren nu möter
premiums värde varje dag i stället för en gång i veckan: varje dagstak är en
konkret påminnelse om avståndet till "obegränsat".

## Testernas nya logik i detalj

- Nivålåsen på avancerad/expert (kognitiva tester) ersätts av dagskvot,
  serverside i samma session-routes där premium-gaten sitter idag.
- Premiumvärdet i testerna blir: obegränsade omtag, obegränsade prov (viktigt
  inför riktig testdag), personlighetsrapporten på avancerad nivå.
- Prissidans copy byts från "3 grundnivå-tester / alla 6" till
  "Alla tester, en per dag och nivå" mot "Obegränsat testande".

## System- och infrastrukturändringar

| # | Åtgärd | Typ |
|---|---|---|
| 1 | Registrera `expire-premiums` i `vercel.json` (körs inte alls idag, utgångna trials förblir premium) | Bugg |
| 2 | Schemalägg trial-reminder-mailet (finns som kod, triggas aldrig) | Bugg |
| 3 | "Kvoten är tillbaka"-mail: daglig cron via Resend till användare vars kvot återställts men som inte loggat in sedan dess | Retention |
| 4 | Spärrvyer med exakt återkomsttid + "påminn mig"-knapp | Retention |
| 5 | Gemensam kvottjänst: `checkQuota(userId, feature)` mot en `feature_usage`-tabell; ersätter de fyra olika kvotmekanikerna (rullande 7d med kolumner, kalendervecka, radräkning, permanenta tak) | Refaktor |
| 6 | Enhetlig premium-check: `src/lib/supabase/premiumAccess.ts` överallt (LinkedIn kollar idag `subscription_status`, kvotrouter bara `subscription_tier`) | Refaktor |
| 7 | Gäst-trial: `trial_duration_days` 2 → 7 i `guest/invite`-routen | Beslutat |
| 8 | Prissidans copy: brev "2 per dag", LinkedIn "1 per vecka", mallar "12 gratis / 42 totalt", chatt "10 per dag / obegränsat", tester "alla, 1 per dag och nivå / obegränsat" | Copy |
| 9 | `CVExportOptions.tsx` säger 5 CV där resten säger 2, rättas | Bugg |
| 10 | Serverside-trunkering av jobbmatchning + serverside exportvalidering av mallar | Säkerhet |

## Fattade beslut

- Gäst-trial: **7 dagar** (mailet stämmer redan, koden ändras).
- Dagsgränser nollställs **midnatt svensk tid** (Europe/Stockholm), utom
  CV-analysen som får rullande 72h.
- Ny-användarboost (dubbla kvoter eller kortfri premium första veckan):
  **utgår**. Utvärderas efter att dagsrytmens effekt mätts.
- Personlighetstestet behåller nivålåset, ingen dagskvot.
- Träningstesterna får enhetlig regel inklusive grund (1/dag/nivå), trots att
  grund idag är obegränsad: en regel är lättare att kommunicera och ingen gör
  samma grundtest två gånger samma dag i praktiken.

## Leveransordning

1. **Buggar + retention**: cron-registreringarna (#1, #2), reset-mailet (#3),
   spärrvyer med påminnelse (#4). Ingen produktändring, störst effekt per timme.
2. **Kvottjänsten + nya dagskvoter**: `feature_usage`-tabell + `checkQuota`,
   sedan brev 2/dag, prov 1/dag/typ, chatt 10/dag, CV-analys 72h,
   testnivåernas upplåsning med 1/dag/nivå. Enhetlig premium-check (#6).
3. **Resterande**: lås-mönstret för sparade brev, serverside jobbmatchning
   och mallexport (#10), gäst-trial 7 dagar (#7), all copy (#8, #9).

## Mätning

Före/efter-jämförelse på: andel nya användare som återvänder dag 2-3,
andel som möter ett dagstak (= känner premiumtrycket), konvertering till
trial/premium inom 14 dagar, samt chatt-kostnad per gratisanvändare.
Aktivitetsdata finns enligt `reference_activity_tracking`.
