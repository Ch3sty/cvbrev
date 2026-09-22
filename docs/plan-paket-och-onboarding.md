# Paket och onboarding

Beslutsunderlag och plan. Ägaren har läst `docs/rapporter/analys-anvandning-trial-tester-2026-09-22.md` och beslutat riktningen: veckoprenumerationer per spår, en allmän månadsprenumeration, stramare gratisnivå, och en onboarding som får folk igång med sin prenumeration.

Fas 1 skriver strukturen och besluten. Ingen kod ändras i fas 1.

---

## Ägarens beslut 2026-09-22

Besluten nedan är fattade och omprövas inte utan ny data. Avsnitt 7 är avgjort och står kvar som protokoll över vad som avgjordes och varför.

| # | Beslut | Innebörd |
|---|---|---|
| 1 | **Paketstruktur B.** | CV-veckan 79 kr, Testveckan 79 kr, Allt-veckan 99 kr, Allt-månaden 149 kr. Alla löpande. |
| 2 | **Gratisnivån enligt avsnitt 4, med hårdare CV-analys.** | En analys per konto, gratis. Den visar läsbarhetspoängen, antalet fynd och det tyngsta fyndet i klartext. Övriga fynd visas som rubriker utan åtgärd, bakom betalvägg PW3. Full analys och omkörning ingår i CV-veckan och Allt. |
| 3 | **Reverse trial bort helt.** | Alternativ (a). Inga nya trials. Befintliga löper ut. |
| 4 | **Dagspass och kvartal behålls som längder på Allt.** | Allt-dagen 49 kr engångs 24 h, Allt-veckan 99 kr, Allt-månaden 149 kr, Allt-kvartalet 299 kr. Spårvalet visar tre val; längden väljs efteråt. Spåren har bara vecka. |
| 5 | **Två släpp, inte fyra vågor.** | Släpp 1 vecka 40 med behörighet, gratisnivå, paket, kassa och spårvalet. Släpp 2 vecka 41 med veckoprogrammet och mejlen. |
| 6 | **Namnen står i bestämd form.** | CV-veckan, Testveckan, Allt-dagen, Allt-veckan, Allt-månaden, Allt-kvartalet. Konsekvent i hela dokumentet, i Stripe, i kvitton och i mejl. |

Beslut 2 är Fables formbeslut inom ägarens ram, fattat samma dag. Skälet: analysen klar 20 av 20 är vårt starkaste aktiveringsögonblick, så poängen och ett fynd ska fortfarande upplevas. Rapporten och omkörningen är uttaget.

---

# Fas 1

## 1. Sammanfattning för ägaren

1. Datan visar två folkgrupper som aldrig möts: 0 av 96 konton har både gjort ett test och laddat ned en CV-mall. Vi säljer i dag ett paket till två målgrupper som vill olika saker.
2. Vi föreslår tre veckopaket som speglar spåren: CV-veckan, Testveckan och Allt-veckan, plus Allt-månaden för den som stannar.
3. Veckan är rätt tidsenhet. Folk ser sig som kortsiktiga användare fram till jobbet, inte som prenumeranter.
4. Vi rekommenderar löpande veckoprenumeration, inte engångsköp. Stripe stöder `interval: 'week'`, och löpande ger oss vecka två och tre utan nytt köpbeslut.
5. Vi rekommenderar prisankare: spårveckorna 79 kr, Allt-veckan 99 kr. Ankaret gör 79 till ett val och inte en slump, och Allt-månaden 149 blir uppenbart billigare än fyra veckor.
6. Dagspasset och kvartalet behålls, men som längder på Allt i stället för som egna produkter: Allt-dagen 49, Allt-veckan 99, Allt-månaden 149, Allt-kvartalet 299. Valet av spår och valet av längd skiljs åt, så kassan visar tre val, inte sex.
7. Gratisnivån måste stramas. Tretton av fjorton testvarianter är gratis i dag, med enda spärren en session per testtyp och dygn. Det är produkten, inte ett smakprov.
8. Vi rekommenderar att reverse trial tas bort och ersätts av ett stramare gratisläge. Sextio av 61 trialhändelser sker på dag noll, så trialen tar bort betalväggen under exakt de timmar användaren är här.
9. Behörigheten måste bli ett spår, inte en flagga. I dag finns en enda sanning, `subscription_tier = 'premium'`. Paket kräver `premium_scope`, och genomslaget är litet: `userHasPremiumAccess` anropas från tio filer.
10. Onboardingen ska välja spår i första steget och driva en sjudagarsvecka som program, så att förnyelsen känns motiverad i stället för överraskande.

---

## 2. Tre exempel på paketstruktur

Gemensamma antaganden för intäktsräkningen nedan: en betalande användare stannar i genomsnitt 1,8 veckor på ett veckopaket (rimligt givet att 18 av 58 konton återkommer alls och att ett jobbsök med brev och test pågår i två till fyra veckor), och 15 procent av veckoköparna väljer månad direkt. Intäkt per betalande användare, ILV, räknas som pris gånger antal veckor. Vi räknar inte moms separat, beloppen är inklusive moms som de visas i kassan.

### Exempel A: ägarens skiss, en prispunkt

| Paket | Innehåll | Pris | Längd | Förnyelse |
|---|---|---|---|---|
| CV-veckan | CV-spåret | 79 kr | 7 dagar | Löpande vecka |
| Testveckan | Testspåret | 79 kr | 7 dagar | Löpande vecka |
| Allt-veckan | Allt | 79 kr | 7 dagar | Löpande vecka |
| Allt-månaden | Allt | 149 kr | 30 dagar | Löpande månad |

Intäkt per betalande: 79 × 1,8 = 142 kr på veckospåret, blandat med månadsandelen 0,15 × 149 landar snittet på cirka 143 kr.

Fördel: enklast möjliga budskap, ett pris att minnas, inget att jämföra fel. Nackdel: när Allt kostar lika mycket som ett spår väljer alla Allt, och då har vi byggt tre paket för att sälja ett, samtidigt som vi tappar den prisskillnad som får spåranvändaren att känna att hen betalar för just sitt behov.

### Exempel B: prisankare på Allt-veckan (rekommenderas)

| Paket | Innehåll | Pris | Längd | Förnyelse |
|---|---|---|---|---|
| CV-veckan | CV-spåret | 79 kr | 7 dagar | Löpande vecka |
| Testveckan | Testspåret | 79 kr | 7 dagar | Löpande vecka |
| Allt-veckan | Allt | 99 kr | 7 dagar | Löpande vecka |
| Allt-månaden | Allt | 149 kr | 30 dagar | Löpande månad |

Antagande om mix: 40 procent CV-veckan, 25 procent Testveckan, 20 procent Allt-veckan, 15 procent Allt-månaden.

Intäkt per betalande: (0,40 + 0,25) × 79 × 1,8 + 0,20 × 99 × 1,8 + 0,15 × 149 = 92 + 36 + 22 = cirka 150 kr.

Fördel: 20 kr skillnad gör spårvalet meningsfullt och Allt-veckan till ett medvetet uppköp, och 149 för en hel månad slår 99 gånger fyra så tydligt att den som tänker stanna ser det själv. Nackdel: tre prispunkter är en rad mer att läsa i kassan, och den som bara ville ha mallar kan tveka inför att hen väljer bort något.

### Exempel C: två spår plus månad, ingen Allt-vecka

| Paket | Innehåll | Pris | Längd | Förnyelse |
|---|---|---|---|---|
| CV-veckan | CV-spåret | 79 kr | 7 dagar | Löpande vecka |
| Testveckan | Testspåret | 79 kr | 7 dagar | Löpande vecka |
| Allt-månaden | Allt | 149 kr | 30 dagar | Löpande månad |

Antagande om mix: 50 procent CV-veckan, 30 procent Testveckan, 20 procent Allt-månaden.

Intäkt per betalande: 0,80 × 79 × 1,8 + 0,20 × 149 = 114 + 30 = cirka 144 kr.

Fördel: tre val, den tydligaste kassan vi kan bygga, och den som vill ha allt måste ta månaden vilket ger oss den längsta intäkten. Nackdel: vi stänger dörren för den som vill ha allt men bara i en vecka, och just den personen är trolig i datan eftersom folk ser sig som kortsiktiga användare.

### Dagspass och kvartal

**Ägarens beslut 2026-09-22: båda behålls, men som längder på Allt i stället för som egna produkter.** Planens ursprungliga rekommendation var att stryka dem, med skälet att prisstegen sålt noll enheter och att sju val är för många. Beslutet löser det andra skälet utan att slänga det första: valen blir inte fler, de flyttar.

| Paket | Innehåll | Pris | Längd | Förnyelse |
|---|---|---|---|---|
| CV-veckan | CV-spåret | 79 kr | 7 dagar | Löpande vecka |
| Testveckan | Testspåret | 79 kr | 7 dagar | Löpande vecka |
| Allt-dagen | Allt | 49 kr | 24 timmar | Engångs, förnyas inte |
| Allt-veckan | Allt | 99 kr | 7 dagar | Löpande vecka |
| Allt-månaden | Allt | 149 kr | 30 dagar | Löpande månad |
| Allt-kvartalet | Allt | 299 kr | 3 månader | Löpande kvartal |

Principen som gör det hanterbart: **spåret väljs först, längden efteråt.** Spårvalet i onboardingen (2A skärm 1.1) visar tre val, alltid: CV-veckan, Testveckan, Allt. Först när användaren valt Allt får hon längdvalet, som ett Segment med fyra lägen. Spåren har bara vecka, alltså inget längdval alls. Prissidan listar Allt med sina fyra längder i en rad, inte som fyra kort.

Det gör att antalet val en användare möter i en given sekund är tre, precis som i det ursprungliga förslaget, samtidigt som "allt i en dag" och "allt i ett kvartal" finns kvar för dem som vill ha dem. Allt-dagen behåller sin form från 11 september: engångsköp, `mode: 'payment'`, premium via `premium_grants`, förnyas inte.

Intäktsräkningen i exempel B ovan ändras marginellt av att Allt-dagen och Allt-kvartalet finns kvar. Antas de ta fem procent var ur Allt-veckans och Allt-månadens andelar landar snittet på cirka 155 kr i stället för 150, alltså något högre, eftersom kvartalet drar upp och dagen ned. Skillnaden är mindre än osäkerheten i antagandena och ändrar inte rekommendationen.

### Rekommendation

**Exempel B.** Skälen, i ordning:

- Prisankaret gör spårvalet till ett val. I exempel A finns ingen anledning att välja ett spår, så vi lär oss aldrig vilket spår användaren faktiskt tillhör.
- Allt-veckan 99 behåller dörren för den som vill ha allt kortsiktigt, vilket exempel C stänger. Datan säger att den personen finns.
- Det ger högst intäkt per betalande av de tre, cirka 150 kr mot 143 och 144, utan att vara dyrare för den som köper ett spår.
- 99 mot 149 gör månaden matematiskt uppenbar, och det är det enda argument vi har för att flytta någon från vecka till månad.

Priset är ägarens beslut. Om 99 känns för högt för Allt-veckan är 89 kr näst bäst, samma logik med mindre ankare.

---

## 3. Vad som ingår i varje paket

### CV-spåret

| Funktion | Ingår | Not |
|---|---|---|
| Alla 41 CV-mallar | Ja | `TEMPLATE_COUNT` i `src/lib/cv/simple-templates.ts`, varav 30 premium |
| CV-export, obegränsad | Ja | I dag en gratis per konto via `profiles.free_cv_exports_used` |
| Full CV-analys | Ja | Alla fynd med åtgärd, genomgång avsnitt för avsnitt. Gratis ger poängen, antalet fynd och det tyngsta fyndet i klartext. |
| CV-analys, omkörning | Ja | Obegränsat antal analyser. Gratis ger en per konto, sedan betalvägg PW3. |
| Personligt brev, generering | Ja | Se motiveringen nedan |
| Personligt brev, nedladdning | Ja | PDF och Word |
| Jobbcoach-chatt | Nej | Allt |
| Logiktest över grundnivå | Nej | Testspåret |
| Jobbmatchning, fler än 3 träffar | Nej | Allt |
| Bli upptäckt | Nej | Allt |

### Testspåret

| Funktion | Ingår | Not |
|---|---|---|
| Alla 19 testvarianter | Ja | `TEST_CONFIGS` i `src/app/dashboard/tester/testConfig.ts` |
| Alla nivåer, grund till expert | Ja | Inklusive `personlighet-avancerad` som i dag är enda `requiresPremium: true` |
| Alla testtyper | Ja | Matris, verbalt, numeriskt, personlighet |
| Tidsatt provläge | Ja | Hård tidsgräns och automatisk inlämning, byggs i släpp 1 |
| Förklaring per fråga | Ja | Vår starkaste sida enligt rapporten |
| Obegränsat antal sessioner | Ja | Ingen dagskvot, `DAILY_LIMIT_TEST_SESSIONS` gäller bara gratis |
| Historik och utveckling över tid | Ja | Alla tidigare sessioner, inte bara senaste |
| Arbetsstilsrapport | Ja | Från det fördjupade personlighetstestet |
| CV-mallar utöver de 11 gratis | Nej | CV-spåret |
| Full CV-analys | Nej | CV-spåret |
| Brevnedladdning | Nej | CV-spåret |

### Allt

Allt i CV-spåret och Testspåret, plus:

| Funktion | Not |
|---|---|
| Jobbmatchning, alla 25 träffar | I dag 3 fulla plus 5 suddade gratis |
| Jobbcoach-chatt, obegränsad | I dag `DAILY_LIMIT_CHAT_MESSAGES` 10 per dag |
| Bli upptäckt, kandidatprofil för rekryterare | |
| AF-rapport från ansökningarna | Löftet "ingår i gratisnivån" gäller, se not |
| LinkedIn-optimering | |

Not om AF-rapporten: copyn säger att den ingår i gratisnivån (`docs/plan-copy-inloggat.md`, beslut 2026-09-15). Det löftet står kvar. AF-rapporten listas här som en av Allt-paketets fördelar bara i den mening att uttaget, alltså nedladdningen, ligger bakom betalvägg som i dag. Ändras det bryter vi ett publicerat löfte.

### Var hör personligt brev hemma?

**Beslut: brevet ligger i CV-spåret, inte i Allt.**

Tre skäl. För det första säger datan att brev hänger ihop med CV, inte med tester: mall och brev överlappar i 21 konton, brev och analys i 23, medan test och mall överlappar i noll. Brevet tillhör bevisligen den folkgrupp som arbetar med sina ansökningshandlingar. För det andra vore ett CV-spår utan brev inte ett spår utan en mallbutik. Den som laddar ned en mall ska kunna skicka in ansökningen samma kväll, och en ansökan är CV plus brev. För det tredje: om brevet ligger i Allt tvingar vi varje mallköpare att uppgradera för halva ansökan, och det läser som en fälla.

Testspåret får inte brev. Den som gör logiktest inför en rekryteringsprocess har oftast redan skickat sin ansökan.

---

## 4. Gratisnivån, stramare

Principen: gratis ska visa värdet och stanna precis före uttaget. Användaren ska se att det fungerar, känna att det är bra, och möta betalväggen i samma sekund som hon vill ta ut något eller gå vidare på djupet.

| Funktion | I dag | Förslag | Skälet i data |
|---|---|---|---|
| CV-mallar | 11 av 41 fria | 3 fria, resten förhandsvisas i full storlek | Mallar är det snabbast växande, från 7 till 20 procent av nya konton. Elva fria mallar räcker för de flesta, så mallen blir aldrig ett köpskäl. |
| CV-export | 1 gratis per konto | 1 gratis per konto, oförändrat | Första exporten är vårt starkaste aktiveringsögonblick. Röra den vore att röra aktiveringen. |
| CV-analys, vad gratis visar | 3 fynd med åtgärd | Läsbarhetspoängen, antalet fynd, och det tyngsta fyndet i klartext med åtgärd. Övriga fynd visas som rubriker utan åtgärd. | Analys klart 20 av 20 efter omgången 21 september, alltså vårt starkaste aktiveringsögonblick. Poängen och ett fynd ska därför fortfarande upplevas på riktigt. Men tre fulla fynd är för nära den färdiga rapporten: den som fått tre åtgärder har fått det hon kom för. |
| CV-analys, kvot | 1 per 72 h | 1 per konto, sedan betalvägg PW3 | Analys har tydligt mättnadsmönster, sex analyser på ett dygn. Omkörningen är uttaget: den som vill se poängen röra sig efter en rättning betalar för det, och det är precis vad CV-veckans dag 2 handlar om. |
| Brev, generering | 1 per dag | 1 per konto, sedan 1 per vecka | Brev konsumeras aldrig mer än ett per konto ens under trial. Dagskvoten skyddar ingenting och gör löftet dyrare än det behöver vara. |
| Brev, nedladdning | Premium | Premium, oförändrat | Rätt placerad betalvägg. |
| Tester, nivåer | 13 av 14 varianter fria | Endast grundnivå fri, per testtyp | 231 sessioner från 75 konton och 82 procent matrislogik. Vi ger bort hela produkten till vår största folkgrupp. Detta är den enskilt största ändringen. |
| Tester, kvot på grundnivån | 1 per test_type och dygn | 1 per test_type och dygn, oförändrat | Rätt avvägning mot SEO-trafiken, grundnivån är landningsytan. |
| Tidsatt provläge | Fritt där det finns | Premium | Provläget är själva produktlöftet "öva under samma tidspress". |
| Förklaring per fråga | Fri | Fri på grundnivå, premium över | Förklaringarna är vår starkaste sida, de ska synas gratis en gång. |
| Testhistorik | Fri | Senaste sessionen fri, historik premium | Utvecklingen över tid är veckoprenumerationens själva argument. |
| Jobbcoach-chatt | 10 meddelanden per dag | 10 per konto, sedan betalvägg | Chatten är dyr per svar och konsumeras av få. Dagskvoten ger bort obegränsat värde över tid. |
| Jobbmatchning | 3 fulla plus 5 suddade | 3 fulla plus 5 suddade, oförändrat | Sänktes redan 14 september, för ung för att röras igen. |
| Anonyma prov, publika | 5 frågor utan konto | 5 frågor utan konto, oförändrat | 32 prov gav högst 2 konton. Ingen konverteringsmotor, men heller ingen kostnad, och den lever i SEO-trafiken. |

### Reverse trial

**Beslutat av ägaren 2026-09-22: (a) ingen trial, bara smakprov i den stramare gratisnivån.** Skälen som låg till grund står kvar nedan.

Skälen, och de ligger alla i dag noll-datan:

- Av 61 händelser från 21 trialkonton ligger 60 på registreringsdagen. Trialen betalar alltså för sig själv under noll timmar, den tar bort betalväggen under exakt de timmar användaren finns här.
- Ett konto av 21 var aktivt efter dag 1, noll efter utgången. Fem dagar premium kostar oss varje betalvägg vi skulle ha visat, och köper oss inga återbesök.
- Rapporten från 21 september fastslog grundorsaken till noll betalningar: reverse trial tar bort betalväggen så ingen ser ett pris. Väg A fanns för att lappa det utan paket. Med paket är lappen onödig.
- Med paket blir en fem dagars allt-trial ekonomiskt identisk med att ge bort Allt-veckan, alltså det dyraste vi säljer, till varje registrering. Det är inte en provperiod, det är vår produkt gratis.

Alternativ (b), 24 timmars trial av valt spår, är näst bäst och det enda alternativ jag skulle acceptera om ägaren vill behålla ett prova på-moment. Den träffar dag noll rätt och kostar bara ett spår, inte allt. Men den lägger till ett tillstånd till i behörighetsmodellen, vilket kostar extra arbete i släpp 1, och den ger oss inget som en stram gratisnivå inte redan ger. Väg A, alltså (c), rekommenderas inte: den bygger vidare på ett trial-läge som paketen gör överflödigt, och den lämnar kvar det som gör trialen dyr, nämligen att vi ger bort Allt.

Vid avveckling: konton med löpande trial får behålla sin period ut. Vi tar aldrig tillbaka något vi gett.

---

## 5. Behörighetsmodell

För Opus att bygga. Fas 1 beslutar formen, inte koden.

### Datamodell

**Rekommendation: en kolumn, inte en tabell.** `profiles.premium_scope` med värdena `'cv' | 'tester' | 'allt'`, nullbar. Null betyder gratis.

Skälen: `userHasPremiumAccess` anropas från tio filer, alla rutter, aldrig i en loop. En kolumn läses i samma `select` som `premium_until` och `subscription_tier`, alltså utan en enda extra rundtur. En entitlements-tabell ger oss en join per behörighetskontroll på varje skyddad route, och vi har en prestandabudget att hålla. Antalet paket kommer inte att växa förbi tre, och gör det ändå det räcker kolumnen till fler strängvärden.

Regler:

- Befintlig premium utan scope läses som `'allt'`. Ingen befintlig kund får mindre än i dag.
- Admin läses alltid som `'allt'`, precis som nu.
- `premium_scope` nollställs samtidigt som `premium_until` och `subscription_tier` i webhookens nedgraderingsgren.
- **Allt-dagen ger `premium_scope = 'allt'` via `premium_grants`, precis som dagspasset gör i dag.** Engångsgrenen i webhooken (A5) behålls alltså, den tas inte bort. `grantPremiumDays` skriver scope tillsammans med dagarna, och eftersom Allt-dagen alltid är `allt` finns ingen tvetydighet. Regeln att förlängning räknas från `max(nu, premium_until)` gäller oförändrad, men den får bara förlänga inom samma scope: köper en CV-veckan-kund Allt-dagen höjs scope till `allt` för dygnet, och sedan måste det falla tillbaka till `cv` när dygnet är slut. Det kräver att `premium_grants` bär sitt eget scope och sin egen sluttid, så att nedtrappningen kan räkna ut vad som ska gälla efteråt. Se noten nedan.

**Not om överlappande köp.** En engångsdag ovanpå en löpande spårprenumeration är det enda fallet där två behörigheter lever samtidigt. Lösningen är att `userHasAccess` läser det högsta scope som är giltigt just nu, alltså `allt` om en `premium_grants`-rad med scope `allt` inte gått ut, annars prenumerationens scope. `profiles.premium_scope` speglar prenumerationen, inte grants, och rörs aldrig av ett engångsköp. Utan den regeln kapar dygnet spårets scope när det löper ut, vilket är exakt den bugg admin hade före `grantPremiumDays`.

### API-form

`userHasPremiumAccess(supabase, userId)` blir `userHasAccess(supabase, userId, feature)`, där `feature` är ett värde ur en ny `FEATURES`-tabell i `src/lib/access/features.ts`. Varje feature mappas till de scope som ger den:

```
'cv_templates_all' -> ['cv', 'allt']
'cv_export'        -> ['cv', 'allt']
'cv_analysis_full' -> ['cv', 'allt']
'letter_download'  -> ['cv', 'allt']
'tests_above_base' -> ['tester', 'allt']
'test_exam_mode'   -> ['tester', 'allt']
'test_history'     -> ['tester', 'allt']
'chat_unlimited'   -> ['allt']
'job_matches_all'  -> ['allt']
'bli_upptackt'     -> ['allt']
```

Gamla `userHasPremiumAccess` behålls som `userHasAccess(..., 'any')` under migreringen så att inget går sönder i ett mellanläge.

### Filer som måste röras

| Fil | Vad |
|---|---|
| `src/lib/access/features.ts` | Ny. Featuretabellen och scope-mappningen. |
| `src/lib/supabase/premiumAccess.ts` | `userHasAccess(feature)`, läser `premium_scope`, null och admin som `allt`. |
| `src/lib/quota/quotaService.ts` | Kvoterna tar feature i stället för `isPremium`, nya gränser enligt avsnitt 4. |
| `src/lib/quota/getQuotaSummary.ts` | Summerar per spår, inte per flagga. |
| `src/lib/quota/__tests__/getQuotaSummary.test.ts` | Ny fixtur per scope. |
| `src/app/api/quota/status/route.ts` | Svarar med scope så klienten kan rita rätt betalvägg. |
| `src/app/api/cv/generate-formatted/route.ts` | `cv_export`, plus 3 fria mallar i stället för 11. |
| `src/app/api/cv/jobs/[jobId]/route.ts` | `cv_analysis_full`, ny kvot 1 per konto. Gratissvaret bär poängen, antalet fynd och det tyngsta fyndet med åtgärd; övriga fynd skickas som rubrik utan åtgärdstext, aldrig som full text som klienten döljer. |
| `src/app/api/letters/download/route.ts` | `letter_download`. |
| `src/app/api/applications/report/route.ts` | Oförändrad behörighet, byter bara anropsform. |
| `src/app/api/jobs/redact/route.ts` | `job_matches_all`. |
| `src/app/dashboard/tester/testConfig.ts` | `requiresPremium: boolean` blir `requiresFeature?: Feature`, grundnivåerna fria. |
| `src/app/dashboard/tester/[slug]/` sessionsrutter | Gate på `tests_above_base` och `test_exam_mode`. |
| `src/lib/cv/simple-templates.ts` | `FREE_TEMPLATE_COUNT` från 11 till 3, tier-fältet på 8 mallar. |
| `src/lib/plans/plans.ts` | Nya `PlanKey`: `cv_week`, `test_week`, `all_day`, `all_week`, `all_month`, `all_quarter`. Sex nycklar, men bara tre val i gränssnittet: spåret först, längden efteråt. Namnen i bestämd form. |
| `src/lib/stripe/planPrices.ts` | Tre nya env-namn för veckopriserna. `STRIPE_PRICE_DAYPASS` och `STRIPE_PRICE_QUARTER` byter bara nyckelnamn, priserna i Stripe är oförändrade. Allowlist utökas med veckoprenumerationerna. |
| `src/app/api/stripe/create-plan-session/route.ts` | Fem av sex är `mode: 'subscription'`, Allt-dagen är kvar som `mode: 'payment'`. Scope i metadata på båda vägarna. |
| `src/app/api/stripe/create-upgrade-session/route.ts` | Uppgradering spår till allt, proration. |
| `src/app/api/stripe/webhooks/route.ts` | Sätter `premium_scope` ur metadata i prenumerationsgrenen, nollar vid nedgradering. A5-grenen för engångsköp behålls och skickar scope `allt` vidare till `grantPremiumDays`. |
| `src/lib/stripe/grantPremiumDays.ts` | Behålls för Allt-dagen och för admin "ge premium". Tar scope som parameter och skriver det på `premium_grants`-raden, så att nedtrappningen vet vad som ska gälla när dygnet gått ut. |
| `src/lib/stripe/guard-existing-subscription.ts` | Får inte blockera uppgradering spår till allt, bara dubbletter av samma scope. |
| `src/app/api/cron/pricing-sync/route.ts` | Nedgradering nollar även `premium_scope`. Trial-grenen tas bort. |
| `src/app/api/auth/post-signup/route.ts` | Ingen trial längre. |
| `src/app/api/trial/auto-activate/route.ts` | Raderas. |
| `src/lib/premium/trial.ts` | Raderas eller reduceras till läsning av befintliga trialkonton under avvecklingen. |
| `src/app/dashboard/(oversikt)/TrialStatusRow.tsx` | Raderas, ersätts av spårrad. |
| `src/components/paywall/TrialRow.tsx`, `TrialRowConnected.tsx` | Raderas. |
| `src/components/paywall/paywall-copy.ts` | Varianterna får scope, så betalväggen säljer rätt paket. Ny variant `fel-spar`. |
| `src/components/paywall/PaywallCard.tsx` | Visar rätt paket för rätt betalvägg. |
| `src/components/paywall/UpgradeSheet.tsx` | Fyra rader i stället för fyra, men nya. |
| `src/components/cv/analysis/TemplateSelector.tsx` | `subscriptionTier` byts mot scope. |
| `src/components/cv/CvAnalysisResults.tsx` | `isPremium` byts mot `hasFullAnalysis`. |
| `src/components/cv/AnalysisLockedFindings.tsx` | Samma. |
| `src/lib/email/lifecycle/registry.ts`, `schedule.ts` | Mailserien `rt_day0..6` ersätts av en veckoserie per spår, se avsnitt 6. |
| `src/lib/admin/collect.ts` | MRR och aktiva per scope, nya kolumner i `admin_daily_metrics`. |
| `src/app/admin/intakter/` | Paketen som egna rader. |
| `src/lib/analytics/events.ts` | Nya händelser enligt avsnitt 6, `PlanKey` byter innehåll. |
| `src/lib/onboarding/steps.ts` | `REQUIRED_STEPS` per spår. |
| `src/contexts/OnboardingContext.tsx` | Spårmedvetet state. |
| `src/components/dashboard/OnboardingNextStep.tsx` | Nästa steg ur spåret. |
| Migration | `profiles.premium_scope`, `premium_grants.scope`, backfyllnad `'allt'` för befintlig premium och för befintliga grants, sex kolumner i `admin_daily_metrics` (en per paket). |

### Insats

| Del | Insats |
|---|---|
| Datamodell och `userHasAccess` med featuretabell, inklusive grants-överlappet | M |
| Gates i rutter och testkonfiguration | M |
| Gratisnivåns nya gränser i kvottjänsten | M |
| Stripe: sex priser, checkout, webhook, uppgradering, längdval på Allt | L |
| Avveckling av trial, inklusive mailserie och komponenter | M |
| Betalväggar och prissida med paketval | M |
| Admin: MRR per paket | S |
| Onboardingens spårval och veckoprogram | L |
| Händelser och mätning | S |
| **Totalt** | **L**, två Opus-släpp |

Två släpp, enligt ägarens beslut 5 och Fas 3 punkt 1 och 2:

1. **Släpp 1, vecka 40.** Behörighetsmodell med scope och grants-överlapp, stramare gratisnivå inklusive den hårdare CV-analysen, hård tidsgräns i provläget, paketen i Stripe och kassan, prissida med längdval på Allt, betalväggar per paket, trial bort för nya konton, admin per paket, och spårvalet (flöde 1).
2. **Släpp 2, vecka 41.** Veckoprogrammet på hemskärmen (flöde 3), köpreturen och tomma tillstånd (flöde 2), fel spår i taket (flöde 4), veckomejlen.

Den ursprungliga planen spred detta över fyra vågor för att kunna skilja gratisnivåns effekt från paketens. Det skälet föll: utgångsläget är noll betalningar, alltså finns ingen effekt att förväxla. Spårvalet ligger i släpp 1 därför att betalväggarna behöver `onboarding_track` för att veta vilket paket de ska föreslå.

---

## 6. Onboardingens ramar

Fas 2 gör designen och texten. Fas 1 sätter måtten.

### Vad "kommit igång" betyder, mätbart

Definitionen är per paket och mäts inom 24 timmar från köp.

| Paket | Kommit igång betyder |
|---|---|
| CV-veckan | Laddat upp eller byggt ett CV, sett den fulla analysen med alla fynd, och laddat ned minst en premiummall som PDF. Tre steg, alla tre krävs. |
| Testveckan | Gjort ett diagnostest på grundnivå, fått en träningsplan för veckan, och slutfört dag 1 i planen. Tre steg, alla tre krävs. |
| Allt-veckan, Allt-månaden och Allt-kvartalet | CV-spårets tre steg eller Testspårets tre steg, plus en handling ur det andra spåret. Vi tvingar aldrig någon genom båda, men vi visar det andra en gång. |
| Allt-dagen | CV-spårets tre steg eller Testspårets tre steg, inom 12 timmar i stället för 24. Dygnet är kortare än mätfönstret, så fönstret följer produkten. Ingen korsning till det andra spåret: ett dygn räcker inte till två spår, och att visa det andra vore att sälja i stället för att hjälpa. |

Talet vi följer: andelen köp som når "kommit igång" inom 24 timmar. Utgångsläge saknas, målet sätts efter fyra veckors mätning.

### Veckan som program

Veckan ska kännas använd, inte gå ut. Varje dag har en sak, och dagen finns både i appen och i ett mail.

**CV-veckan**

| Dag | Vad |
|---|---|
| 1 | CV in, full analys, välj mall, ladda ned. Ansökan klar samma kväll. |
| 2 | Rätta de tre tyngsta fynden ur analysen, kör om, se poängen röra sig. |
| 3 | Skriv brevet till den annons du redan sökt, ladda ned. |
| 4 | En andra mall för en annan typ av roll, samma CV. |
| 5 | Läsbarhet mot rekryteringssystem, kontroll och åtgärd. |
| 6 | LinkedIn-profilen mot samma CV. |
| 7 | Veckans sammanställning: vad du skickat, vad som är kvar. Förnyelsefrågan ställs här, inte tidigare. |

**Testveckan**

| Dag | Vad |
|---|---|
| 1 | Diagnostest på grundnivå, resultat och träningsplan för veckan. |
| 2 | Avancerad nivå i din svagaste typ, med förklaring per fråga. |
| 3 | Verbalt resonemang, tidsatt. |
| 4 | Numeriskt, tidsatt. |
| 5 | Expertnivå i din starkaste typ. |
| 6 | Fullt prov under skarp tidspress, automatisk inlämning. |
| 7 | Utvecklingen över veckan, alla sessioner i en kurva. Förnyelsefrågan här. |

**Allt**

Användaren väljer spår i onboardingen och kör det spårets vecka. Dag 4 byts mot en handling ur det andra spåret, alltså en mallnedladdning för testspåraren och ett diagnostest för CV-spåraren. Det är enda stället där vi korsar de två folkgrupperna, och en gång räcker.

**De andra längderna på Allt.** Allt-dagen kör inget veckoprogram: dygnet visar dag 1 och inget mer, med en rad som säger när dygnet går ut. Allt-månaden och Allt-kvartalet kör samma sjudagarsvecka, och när veckan är slut börjar den om med nästa spårs vecka i stället för att ta slut. Månadsköparen som valde CV-spåret får alltså CV-veckan, sedan Testveckan, och därefter en lugnare rytm utan dagsnummer. Programmet är en startsträcka, inte ett hjul som måste snurra i nittio dagar.

### Tre mätpunkter fas 2 optimerar mot

1. **Spårval till köp.** Andelen som väljer spår i onboardingen och betalar inom samma session.
2. **Köp till kommit igång inom 24 timmar.** Definitionen ovan, per paket.
3. **Förnyelse vecka 1 till vecka 2.** Andelen veckoprenumerationer som lever efter första förnyelsen.

### Händelser

Befintliga i `src/lib/analytics/events.ts` som fortsätter gälla: `signup_started`, `signup_completed`, `paywall_shown`, `paywall_cta_clicked`, `pricing_viewed`, `subscription_paid`, `activation_first_doc`.

Nya som behövs:

| Händelse | Egenskaper |
|---|---|
| `track_selected` | `track: 'cv' \| 'tester' \| 'allt'`, `surface` |
| `track_changed` | `from`, `to`, `surface` |
| `onboarding_step_completed` | `track`, `step`, `index`, `hours_since_purchase` |
| `onboarding_completed` | `track`, `hours_since_purchase` |
| `week_day_opened` | `track`, `day` (1 till 7), `source: 'app' \| 'email'` |
| `week_day_completed` | `track`, `day` |
| `week_summary_viewed` | `track`, `days_completed` |
| `renewal_upcoming_shown` | `plan`, `days_left` |
| `renewal_succeeded` | `plan`, `cycle` (1 för första förnyelsen) |
| `upgrade_shown` | `from_scope`, `to_scope`, `surface` |
| `feature_blocked` | `feature`, `scope`, `surface`. Den här är viktigast: den mäter var fel spår tar i taket, alltså var uppförsäljningen finns. |

Att ta bort med trialen: `trial_started`, `trial_price_shown`.

---

## 7. Beslut, avgjorda 2026-09-22

**Avgjort.** Avsnittet stod som öppna beslut fram till ägarens genomgång 22 september. Det står kvar som protokoll: frågan, rekommendationen, och vad som blev beslutat. Ändras något av dem ska det ändras här.

| # | Fråga | Rekommendationen | Beslut |
|---|---|---|---|
| 1 | Paketstruktur A, B eller C | B, med prisankare på Allt-veckan | **B.** |
| 2 | Priser 79 / 79 / 99 / 149 | Ja, näst bäst 79 / 79 / 89 / 149 | **Ja, 79 / 79 / 99 / 149.** |
| 3 | Löpande eller engångs på veckorna | Löpande. Vi får vecka två utan nytt köpbeslut, uppsägning är ett klick. | **Löpande.** |
| 4 | Dagspass och kvartal | Båda bort. Noll sålda, sju val är för många. | **Båda behålls, som längder på Allt.** Allt-dagen 49 engångs, Allt-kvartalet 299 löpande. Spårvalet visar tre val, längden väljs efteråt, så antalet val i en given sekund är fortfarande tre. |
| 5 | Reverse trial | Bort helt, alternativ (a) | **Bort helt.** |
| 6 | Gratis CV-mallar, 11 till 3 | Ja | **Ja, 3.** |
| 7 | Tester: bara grundnivå gratis | Ja, största intäktshävstången i planen | **Ja.** |
| 8 | Brevet i CV-spåret | Ja | **Ja.** |
| 9 | Uppgradering spår till Allt mitt i veckan | Ja, med proration | **Ja.** |
| 10 | Befintliga premiumkonton | Läses som `allt`, för alltid | **Ja.** |
| 11 | Chatten i Allt | Ja, tio meddelanden per konto gratis | **Ja.** |
| 12 | Tidsgräns i provläget före paketen | Ja | **Ja, i släpp 1.** |
| 13 | CV-analysen gratis: tre fulla fynd eller hårdare | Frågan restes inte i första utkastet | **Hårdare.** En analys per konto. Den visar läsbarhetspoängen, antalet fynd och det tyngsta fyndet i klartext med åtgärd. Övriga fynd visas som rubriker utan åtgärd, bakom PW3. Full analys och omkörning ingår i CV-veckan och Allt. |
| 14 | Namnform | Frågan restes av copyrollen i Fas 2B | **Bestämd form överallt:** CV-veckan, Testveckan, Allt-dagen, Allt-veckan, Allt-månaden, Allt-kvartalet. |
| 15 | Tidslinje | Fyra vågor vecka 40 till 43 | **Två släpp, vecka 40 och 41,** med spårvalet i släpp 1. Se avsnitt 9. |

---

## 8. Vad kassan måste visa

Svensk konsumentlagstiftning för löpande digitala prenumerationer. Detta är krav, inte val.

Före köpet, på samma skärm som knappen:

- Priset inklusive moms, i kronor.
- Att det är en prenumeration som förnyas automatiskt, med intervallet utskrivet: "79 kr i veckan, dras varje vecka tills du säger upp."
- Nästa dragningsdatum.
- Hur man säger upp, och att uppsägning kan göras när som helst utan skäl.
- Vad som ingår, alltså paketets innehåll, och för spårpaketen vad som inte ingår.

Vid köpet:

- Uttryckligt samtycke till att tjänsten påbörjas direkt, med en kryssruta eller en tydlig mening vid knappen: "Jag vill börja använda tjänsten direkt och förstår att ångerrätten då går förlorad."
- Kvitto per e-post med belopp, paket, period och uppsägningslänk.

Löpande:

- Uppsägning ska vara minst lika enkel som köpet, alltså inte via mail eller samtal. Stripe-portalen räcker, men länken måste finnas i appen.
- Påminnelse före förnyelse. Lagkravet är inte absolut för veckointervall, men en veckoprenumeration som tyst drar pengar en fjärde gång är en återbetalning som väntar. Vi skickar påminnelse inför förnyelse tre och framåt.

Ångerrätt: 14 dagar, med undantag när digitalt innehåll påbörjats efter uttryckligt samtycke. Undantaget gäller bara om samtycket är dokumenterat, alltså måste kryssrutan sparas med tidsstämpel.

**Allt-dagen är ett engångsköp och lyder under andra rader.** Den förnyas inte, så det finns inget dragningsdatum och ingen uppsägning att beskriva. I stället måste kassan säga just det, tydligt: att köpet gäller 24 timmar, att ingenting dras igen, och när dygnet tar slut. Ångerrättssamtycket krävs likväl, och av samma skäl: tjänsten påbörjas direkt. Raden som ersätter förnyelseraden blir alltså en sluttidsrad, och den ska vara lika konkret som dragningsdatumet är för de löpande paketen.

---

## 9. Tidslinje

Två släpp, enligt ägarens beslut 5 och Fas 3 punkt 1 och 2.

| Släpp | Innehåll | Mål live | Mäts |
|---|---|---|---|
| 1 | Behörighetsmodell med scope och grants-överlapp. Stramare gratisnivå, inklusive den hårdare CV-analysen. Hård tidsgräns i provläget. Paketen i Stripe och kassan med längdval på Allt. Prissida. Betalväggar per paket. Trial bort för nya konton. Admin per paket. Spårvalet (flöde 1). | Vecka 40 | Spårval till köp, köp per paket, betalväggar visade per konto, `feature_blocked` per feature. |
| 2 | Veckoprogrammet på hemskärmen (flöde 3), köpreturen och tomma tillstånd (flöde 2), fel spår i taket (flöde 4), veckomejlen. | Vecka 41 | Köp till kommit igång inom 24 h, förnyelse vecka 1 till vecka 2. |

Den ursprungliga planen spred arbetet över fyra vågor vecka 40 till 43, för att gratisnivåns effekt skulle gå att skilja från paketens. Det skälet föll vid Fas 3: utgångsläget är noll betalningar, alltså finns ingen effekt att förväxla, och ägaren bad om onboardingen nu. Spårvalet flyttades till släpp 1 därför att betalväggarna behöver `onboarding_track` för att veta vilket paket de ska föreslå, och därför att mätpunkt 1 annars saknar data under just de veckor paketen är nya.

Släppen ska ändå inte gå live samma dag. En veckas mellanrum räcker för att se om något går sönder i behörigheten innan veckoprogrammet läggs ovanpå.

**Ägaren skapar tre nya priser i Stripe innan släpp 1:** `cv_week`, `test_week` och `all_week`, alla med `interval: 'week'`. `all_month` finns redan (149 kr), liksom `all_quarter` (299 kr som `month` × `interval_count` 3) och `all_day` (49 kr engångs). De tre befintliga behåller sina price-id, de byter bara nyckelnamn i koden, så inga kvitton eller befintliga köp påverkas.

**Efter fyra veckor från släpp 2**, alltså tidigast vecka 45, läser vi av:

- Betalande konton totalt, och fördelningen per paket och per längd på Allt.
- Intäkt per betalande användare mot de cirka 155 kr exempel B räknar med när Allt-dagen och Allt-kvartalet finns kvar.
- Förnyelse vecka 1 till vecka 2.
- Andelen Allt-köpare som väljer dag respektive kvartal. Tar de under fem procent var efter fyra veckor tas de bort, och då är beslutet avgjort med data i stället för med gissning.
- Köp till kommit igång inom 24 timmar per paket.
- `feature_blocked` per feature, alltså var fel spår tar i taket. Om ett spår ständigt slår i det andra spårets tak har vi delat produkten på fel ställe, och det är då vi omprövar avsnitt 3.

Om noll betalande efter fyra veckor är problemet inte paketen utan trafiken in i kassan, och nästa analys ska gälla vägen från artikel till konto, inte prissättningen.

---

# Fas 2: onboardingens design och text (fylls av UX och copy)

## Fas 2A: onboardingens design

Skriven 2026-09-22 av UX-rollen. Designen, inte koden. Allt nedan följer `docs/designsystem.md` (Tråden v2) och komponentkartan i `docs/design/overlamning-opus.md`. Platshållare `[T1]`, `[T2]` och så vidare pekar på listan "Textytor för copywritern" sist i avsnittet. Skisserna är ritade för Pixel 7, 412 px bred viewport. Desktop 1280 beskrivs per flöde som avvikelse, inte som egen skiss.

Genomgående regler som gäller alla fyra flöden:

- En primär ink-knapp per skärm. Sekundärt är alltid en textlänk.
- Orange högst tre förekomster per skärm, bara som linje (tråd, framstegslinje, fokusring, punkt i varm statusrad) eller som `text-accent-ink`. Aldrig yta bakom text.
- En marginalplatta per vy, på vyns viktigaste element.
- Inga poäng, ingen procent klar, ingen belöning, ingen maskot. Veckan är en ordning, inte en tävling.
- Alla träffytor minst 44 px. Primärhandlingen ligger inom 412x800 utan scroll.

---

### Flöde 1: spårvalet före köp

#### Placering, och skälet

**Spårvalet ligger som ett eget steg direkt efter registreringen, i FlowShell, och aldrig någon annanstans.** Inte i registreringsformuläret, inte som första kort på hemskärmen.

Tre skäl, i ordning:

1. Registreringsformuläret får inte växa. Varje fält före kontot kostar konton, och spårvalet är inte en uppgift om användaren utan en fråga om vad hon vill göra. Den frågan hör hemma efter att kontot finns, inte före.
2. Ett kort på hemskärmen konkurrerar med allt annat på hemskärmen. Planens mätpunkt 1 är "spårval till köp i samma session", och den mätpunkten dör om valet ligger som ett av sju element i en lista. Ett eget steg har inget att konkurrera med.
3. Spåret är den enda uppgift vi behöver för att kunna rita resten av produkten rätt. Tas den inte här måste varje senare yta hantera "spår okänt", och då har vi byggt två produkter.

Konsekvens för gratisanvändaren som inte köper: **spåret sparas ändå**, i `profiles.onboarding_track`, oberoende av `premium_scope`. Hemskärmen anpassas efter spåret även utan köp. Det betyder att steget aldrig är bortkastat, och att `track_selected` skjuts på alla, inte bara på köparna. Det är också det som gör steget ärligt: vi frågar för att kunna hjälpa, inte för att kunna sälja.

Steget går att hoppa över. Hoppar användaren över det läses spåret som `null` och hemskärmen visar dagens allmänna läge. Vi frågar igen, en gång, efter tre dagars aktivitet. Aldrig mer än så.

#### Skärm 1.1: frågan

```
┌──────────────────────────────────────────┐
│ ✕                              [T-steg]  │  FlowShell topprad, onExit
│▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  2 px framstegslinje (orange 1/3)
├──────────────────────────────────────────┤
│                                          │
│  STEG 1 AV 2                             │  text-steg uppercase ink-3
│  [T1]                                    │  text-fraga ink-1
│  [T2]                                    │  text-sm ink-2, en mening
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ┌────┐                             │  │  ChoiceCard variant="plain"
│  │ │ CV │  [T3]                       │  │  leading = <IkonCV /> naken 24
│  │ └────┘  [T4]                       │  │  title text-kort, description
│  │         [T5]                       │  │  meta text-meta ink-3
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ┌────┐                             │  │  ChoiceCard variant="plain"
│  │ │ ⧉  │  [T6]                       │  │  leading = <IkonAnalys /> 24
│  │ └────┘  [T7]                       │  │
│  │         [T8]                       │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ┌──────┐  REKOMMENDERAS         ◉  │  │  ChoiceCard variant="featured"
│  │ │ ▨▨▨  │  [T9]                     │  │  eyebrow, accent-ink
│  │ │ ▨▨▨  │  [T10]                    │  │  leading = MarginPlate 56
│  │ └──────┘  [T11]                    │  │  + IlluPlattaPremium 48
│  └────────────────────────────────────┘  │  ◉ = fylld bock ink-1 vid valt
│                                          │
│  [T12]                                   │  textlänk, hoppa över
│                                          │
├──────────────────────────────────────────┤
│  ╔══════════════════════════════════╗    │  FlowShell fot, sticky
│  ║            [T13]                 ║    │  primär ink-knapp h-11
│  ╚══════════════════════════════════╝    │  disabled tills val gjorts
└──────────────────────────────────────────┘
```

| Element | Komponent | Not |
|---|---|---|
| Ram, topprad, framstegslinje, fot | `FlowShell { title, step: 1, totalSteps: 2, onExit, primaryLabel, onPrimary, primaryDisabled }` | Steget är ett flöde, inte en sida. Ingen `PageHeader`. |
| Stegetikett och fråga | `<p className="text-steg uppercase text-ink-3">` + `<h2 className="text-fraga text-ink-1">` | Enligt FlowShell-mönstret |
| Tre val | `ChoiceCard` i `role="radiogroup"` | Två `plain`, ett `featured` |
| Ikon på plain-korten | `IkonCV`, `IkonAnalys` ur `Ikoner.tsx`, 24, ink-2 | Naken ikon, ingen ruta |
| Platta på featured-kortet | `MarginPlate` + `IlluPlattaPremium` 48 | Vyns enda platta |
| Hoppa över | textlänk ink-1 understruken | Under korten, inte i foten |
| Fortsätt | primär ink-knapp i FlowShell-foten | En per vy |

Orange-räkning: framstegslinjen (1), eyebrow "REKOMMENDERAS" i accent-ink (2), marginalplattans fyllning (3). Exakt tre. Därför får ingen av `plain`-korten accent, och därför står priserna i ink-3, inte i accent.

Ordningen är medveten. CV först eftersom 40 procent av mixen antas hamna där, Allt sist eftersom det är uppköpet och ett uppköp ska läsas efter alternativen, inte före. "Rekommenderas" sitter på Allt, men det är den enda säljsignalen på skärmen.

Priserna nämns i `meta`-raden på varje kort ([T5], [T8], [T11]), i ink-3, litet. Skälet: utan pris är skärmen en fråga som sedan visar sig kosta pengar, och det är en fälla. Med pris i metaraden är den ett val. Men priset är metadata, inte rubrik, så skärmen läses fortfarande som en fråga och inte som en prislista.

#### Skärm 1.2: paketet och villkoren

Steg 2 av 2. Det är här hela avsnitt 8 i den här planen bor. Skärmen ska inte kännas som en säljsida, och det gör den inte om den behandlas som en kvittovy före köpet: här är vad du valt, här är vad det kostar, här är vad som inte ingår.

```
┌──────────────────────────────────────────┐
│ ←                              [T-steg]  │  FlowShell onBack till steg 1
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  framstegslinje 2/2, full
├──────────────────────────────────────────┤
│                                          │
│  STEG 2 AV 2                             │
│  [T14]                                   │  text-fraga
│                                          │
│  ┌────────────────────────────────────┐  │  panel border-kant p-4
│  │ [T15]                     79 kr    │  │  text-kort ink-1 + text-kort
│  │ [T16]                              │  │  text-meta ink-3, intervall
│  ├────────────────────────────────────┤  │  divide-y divide-kant
│  │ ✓ [T17]                            │  │  lista, Check 20 ink-2
│  │ ✓ [T18]                            │  │
│  │ ✓ [T19]                            │  │
│  │ ✓ [T20]                            │  │
│  ├────────────────────────────────────┤  │
│  │ [T21]                              │  │  text-meta ink-3, ingår inte
│  └────────────────────────────────────┘  │
│                                          │
│  ● [T22]                                 │  StatusRow tone="neutral"
│                                          │  nästa dragning + uppsägning
│  ┌────────────────────────────────────┐  │
│  │ ☐ [T23]                            │  │  kryssruta, ångerrättssamtycke
│  └────────────────────────────────────┘  │  44 px träffyta, sparas med tid
│                                          │
│  [T24]                                   │  textlänk, byt paket
│                                          │
├──────────────────────────────────────────┤
│  ╔══════════════════════════════════╗    │
│  ║            [T25]                 ║    │  primär, disabled tills ☐ kryssad
│  ╚══════════════════════════════════╝    │
│  [T26]                                   │  text-meta ink-3 under knappen
└──────────────────────────────────────────┘
```

| Element | Komponent | Not |
|---|---|---|
| Ram | `FlowShell { step: 2, totalSteps: 2, onBack }` | |
| Paketpanel | `<section className="rounded-xl border border-kant bg-panel p-4">` med `divide-y divide-kant` | Ingen egen komponent |
| Ingår-rader | lista i panel, `Check` 20 ink-2 från lucide | Bocken är ink, aldrig grön här |
| Ingår inte | `text-meta text-ink-3` sist i panelen | Kravet i avsnitt 8. Står under ingår-listan, inte som egen röd ruta. |
| Dragningsdatum och uppsägning | `StatusRow tone="neutral"` | Neutral, inte warm. Det här är fakta, inte varning. |
| Samtycke | kryssruta enligt fältmönstret, `border-kant bg-insunken shadow-insunken` | Måste sparas med tidsstämpel, se avsnitt 8 |
| Köp | primär ink-knapp, `primaryDisabled` tills kryssad | `primaryBlockedReason` säger varför |
| Byt paket | textlänk, går tillbaka till steg 1 | |

Orange-räkning: framstegslinjen (1). Inget mer. Det är avsiktligt: en betalskärm med accent på priset läser som reklam.

**Not, ägarens beslut 4 (2026-09-22): längdval på Allt.** Skisserna ovan ritar spårvalet med tre val, och det är fortfarande rätt. Men Allt har nu fyra längder: Allt-dagen 49 kr för 24 timmar, Allt-veckan 99, Allt-månaden 149, Allt-kvartalet 299. Valde användaren Allt på skärm 1.1 får hon därför ett `Segment` med fyra lägen överst på skärm 1.2, ovanför paketpanelen, och panelen nedanför skriver om sig efter valt läge: pris, ingår-lista, förnyelserad och knapptext. Allt-veckan är förvalt. Spåren, alltså CV-veckan och Testveckan, har bara vecka och får inget Segment alls, deras skärm 1.2 ser ut exakt som skissen. Skissen ritas inte om här, men arbetet är M i stället för S för den skärmen, och två saker måste följa med: Allt-dagen är ett engångsköp, så förnyelseraden byts mot en sluttidsrad enligt avsnitt 8, och Segmentet räknas inte som ett orange element eftersom valt läge markeras i ink, inte i accent.

Hela skärmen ska rymmas på 412x800 utan scroll utom de sista raderna. Kravet är att kryssrutan och köpknappen syns samtidigt, aldrig att kryssrutan ligger ovanför vikningen och knappen under.

Desktop 1280: samma flöde, centrerad kolumn max 560 px. Valkorten ligger kvar staplade, inte i tre kolumner. Skälet: tre kolumner gör det till en prislista, och vi har bestämt att det är en fråga.

#### Skärm 1.3: gratisanvändaren som inte köper

Hoppar användaren av på steg 2 landar hon på hemskärmen med spåret sparat. Det ska synas att vi minns valet, en gång, diskret.

```
┌──────────────────────────────────────────┐
│  Hej Anna                                │  PageHeader h1
│  [T27]                                   │  description, spårmedveten
├──────────────────────────────────────────┤
│  ● [T28]                     [T29] →     │  StatusRow tone="neutral"
├──────────────────────────────────────────┤
│  ... resten av hemskärmen, ordnad        │
│      efter spåret                        │
└──────────────────────────────────────────┘
```

Spåret styr hemskärmens ordning, inte dess innehåll. CV-spåraren får CV-raderna överst i "Pågår nu" och CV-handlingen i "Nästa handling". Testspåraren får testraderna överst. Ingenting göms, ordningen byts. Det är billigt att bygga och det är hela poängen med att spara spåret gratis.

#### Händelser, flöde 1

| När | Händelse | Egenskaper |
|---|---|---|
| Steg 1 renderas | `pricing_viewed` | `surface: 'onboarding_track'` |
| Val gjort, Fortsätt tryckt | `track_selected` | `track`, `surface: 'onboarding'` |
| Byte av val på steg 1 innan Fortsätt | ingen händelse | Bara sista valet räknas |
| Byt paket från steg 2 | `track_changed` | `from`, `to`, `surface: 'onboarding'` |
| Steg 2 renderas | `paywall_shown` | `variant: 'onboarding_paket'`, `surface` |
| Köp tryckt | `paywall_cta_clicked` | `variant`, `cta: 'primary'` |
| Hoppa över | `track_selected` skjuts inte | Spåret är null |
| Stripe-webhook bekräftar | `subscription_paid` | `plan`, `track` |

#### Acceptanskriterier, flöde 1

Pixel 7, 412 px, Chrome, som nytt konto:

1. Efter registrering landar användaren på spårvalet utan mellanlandning på hemskärmen. Ingen blink av dashboarden.
2. Alla tre valkorten syns utan scroll. Fortsätt-knappen syns samtidigt som minst två av korten.
3. Fortsätt är inaktiv tills ett kort är valt, och `primaryBlockedReason` läses upp av VoiceOver.
4. Valt kort har kant i ink-1 och fylld bock. Inget orange på valt kort.
5. Räkna orange element på steg 1: exakt tre. På steg 2: exakt ett.
6. Köpknappen på steg 2 är inaktiv tills kryssrutan är i. Kryssruta och knapp syns samtidigt.
7. Hoppa över leder till hemskärmen, och hemskärmen ser likadan ut som före omgången.
8. Väljer man spår och hoppar av på steg 2 står spårraden på hemskärmen vid nästa laddning.
9. Tangentbord: piltangent flyttar mellan korten i radiogruppen, mellanslag väljer, Tabb går till Fortsätt.

Desktop 1280, Chrome: kolumnen är centrerad max 560 px, korten staplade, inga tre kolumner.

---

### Flöde 2: köp till första handling

Principen: **Stripe-returen landar aldrig på hemskärmen.** Returadressen är `/dashboard/vecka/start?plan=...`, en egen vy, och därifrån går användaren vidare in i dag 1. Hemskärmen ser hon först när hon kommer tillbaka av egen kraft.

Skälet är mätpunkt 2. En tom hemskärm direkt efter köp är den sämsta sekunden i hela produkten: användaren har precis betalat och möts av allt hon ännu inte gjort. Den här vyn vänder de tio sekunderna till en riktning.

#### Skärm 2.1: de första tio sekunderna

```
┌──────────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  Confirmation: tråden går till
├──────────────────────────────────────────┤  100 % och stannar som överkant
│                                          │
│              ┌──────────┐                │  illustration 96
│              │  ▨▨▨▨▨▨  │                │  IlluPlattaAnsokan (CV-spår)
│              │  ▨▨▨▨▨▨  │                │  IlluPlattaTest (testspår)
│              └──────────┘                │
│                                          │
│  [T30]                                   │  Confirmation title
│  [T31]                                   │  description: paket, pris,
│                                          │  nästa dragning
│  ┌────────────────────────────────────┐  │  panel i Confirmation children
│  │ DAG 1 AV 7                         │  │  text-steg uppercase ink-3
│  │ [T32]                              │  │  text-kort ink-1, dagens sak
│  │ [T33]                              │  │  text-meta ink-3, tidsåtgång
│  └────────────────────────────────────┘  │
│                                          │
│  ╔══════════════════════════════════╗    │
│  ║            [T34]                 ║    │  primär ink, till dag 1
│  ╚══════════════════════════════════╝    │
│                                          │
│  [T35]                                   │  textlänk: se hela veckan
│  [T36]                                   │  textlänk: kvitto och uppsägning
└──────────────────────────────────────────┘
```

| Element | Komponent | Not |
|---|---|---|
| Hela vyn | `Confirmation { title, description, illustration, action, secondaryAction, children }` | Ersätter dagens `PurchaseConfirmation`, som i dag ligger på hemskärmen och pekar på "Skriv ett brev" oavsett paket |
| Illustration | 96-scen ur `TradenScener` per spår | En per vy |
| Dag 1-panel | `<section className="rounded-xl border border-kant bg-panel p-4">` i `children` | Ingen platta, illustrationen är redan vyns bild |
| Primär | ink-knapp, går rakt in i dag 1:s flöde | Aldrig "Till översikten" |
| Sekundärt | två textlänkar | Kvittolänken är ett lagkrav, se avsnitt 8 |

Confirmationens animering gör jobbet: panelen kommer på 240 ms, linjen ritas, bocken på 440, rubriken på 560. Det tar cirka 0,8 sekunder och är den enda platsen i produkten där tempot får avvika. Efter det står skärmen stilla. De tio sekunderna är alltså: linjen landar, användaren läser rubriken och "DAG 1 AV 7", och trycker.

Orange-räkning: bekräftelselinjen längst upp (1), illustrationens accentform (2). Två av tre.

**Vad "dag 1 av 7" betyder mekaniskt.** Dag 1 är dagen för köpet, i svensk tid, inte 24 timmar från köptidpunkten. Ett köp klockan 23.40 ger inte en dag 1 som är tjugo minuter lång: köp efter klockan 20 räknar dag 1 som nästa kalenderdag, och det står i [T31]. Skälet är enkelt: en användare som köper på kvällen ska inte vakna till dag 2 utan att ha sett dag 1.

#### Skärm 2.2: tomt tillstånd, köparen utan CV

CV-veckans dag 1 kräver ett CV. Har köparen inget blir första skärmen i dag 1 en uppladdning, inte en tom analyssida.

```
┌──────────────────────────────────────────┐
│ ✕                                        │  FlowShell
│▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
├──────────────────────────────────────────┤
│  DAG 1 AV 7 · STEG 1 AV 3                │  text-steg ink-3
│  [T37]                                   │  text-fraga
│  [T38]                                   │  text-sm ink-2
│                                          │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │  insunken streckad yta
│    ┌──────┐                              │  bg-insunken shadow-insunken
│  │ │  ▨▨  │                           │  │  border-dashed border-kant-stark
│    └──────┘                              │  minst 120 px hög
│  │        [T39]                       │  │  text-kort ink-1
│           [T40]                          │  text-meta ink-3
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                          │
│  [T41]                                   │  textlänk: bygg ett nytt i stället
│                                          │
├──────────────────────────────────────────┤
│  ╔══════════════════════════════════╗    │
│  ║            [T42]                 ║    │  primär, disabled tills fil vald
│  ╚══════════════════════════════════╝    │
└──────────────────────────────────────────┘
```

Samma tomma tillstånd för testspåraren som redan gjort alla gratisnivåer: dag 1 är ett diagnostest, och har hon redan kört grundnivån i alla fyra testtyper hoppar dag 1 över diagnosen och går direkt till träningsplanen, med en rad som säger att vi använde hennes tidigare resultat ([T43], `StatusRow tone="neutral"`). Vi ber aldrig någon göra om ett test hon redan gjort samma vecka.

#### Händelser, flöde 2

| När | Händelse | Egenskaper |
|---|---|---|
| Skärm 2.1 renderas | `week_day_opened` | `track`, `day: 1`, `source: 'app'` |
| Primär tryckt | ingen egen händelse | Första steget är inte klart förrän handlingen är gjord |
| Dag 1:s första delsteg klart (CV uppladdat, eller diagnos klar) | `onboarding_step_completed` | `track`, `step`, `index: 1`, `hours_since_purchase` |
| Dag 1:s tredje delsteg klart | `week_day_completed` | `track`, `day: 1` |
| Alla tre stegen i definitionen av "kommit igång" | `onboarding_completed` | `track`, `hours_since_purchase` |
| Användaren når hemskärmen utan att öppna dag 1 | ingen egen händelse | Mäts som frånvaro av `week_day_opened` |

`hours_since_purchase` räknas från `subscription_paid`, inte från kontots skapande. Det är den enda tidsaxeln som mäter definitionen i avsnitt 6.

#### Acceptanskriterier, flöde 2

Pixel 7, 412 px, som ny betalande:

1. Stripe-returen landar på `/dashboard/vecka/start`, inte på `/dashboard`. Hemskärmen syns inte en enda frame.
2. Rubriken, "DAG 1 AV 7" och primärknappen syns samtidigt utan scroll.
3. Primärknappen leder in i dag 1:s flöde, inte till hemskärmen.
4. Ett köp efter klockan 20 svensk tid visar dag 1 som nästa dag, och [T31] säger det.
5. Köparen utan CV möts av uppladdningsytan, aldrig av en tom analyssida eller ett felmeddelande.
6. Testspåraren som redan gjort alla gratisnivåer får träningsplanen direkt, med statusraden som förklarar varför.
7. Laddas vyn om visas den igen, inte en tom sida. Den försvinner först när dag 1 har öppnats.
8. `prefers-reduced-motion: reduce`: bekräftelsen står i sluttillstånd från första frame.
9. Kvittolänken går till Stripe-portalen och öppnas i ny flik.

Desktop 1280: samma vy, centrerad kolumn max 560 px, illustrationen kvar ovanför texten. Ingen tvåkolumnsvariant.

LCP-budget: under 1,5 s. Vyn är serverrenderad med paket och dag ur sessionen, inget klientanrop för att veta vad som ska stå.

---

### Flöde 3: veckoprogrammet på hemskärmen

#### Formen: en tråd med sju noder, inte sju kort

Tråden betyder position. Sju dagar är sju positioner. Alltså blir veckan en tråd i en panel, där tråden går från nod 1 till den dag användaren står på och slutar där. Det är exakt samma betydelse som tråden bär överallt annars i systemet, och det är därför formen är rätt.

Men: sju expanderade rader äter hela hemskärmen på 412 px. Lösningen är att panelen har två lägen på samma tråd.

- **Sammandragen** (standard på hemskärmen): sju små noder på en rad med tråden emellan, och under dem dagens nod utskriven med sin sak och sin knapp. Cirka 200 px hög.
- **Utfälld** (efter tryck på [T50], eller på egen sida `/dashboard/vecka`): alla sju dagar med titel, som lista.

Panelen ligger som hemskärmens första element under `PageHeader`, ovanför "Nästa handling". Under veckan är veckan nästa handling, så `NastaHandling` visas inte samtidigt som en oavklarad dag finns. Det är viktigt: två konkurrerande "gör det här nu" är värre än noll.

#### Skärm 3.1: dagens sak, sammandragen

```
┌──────────────────────────────────────────┐
│  Hej Anna                                │  PageHeader
│  [T44]                                   │
├──────────────────────────────────────────┤
│  CV-VECKAN · DAG 3 AV 7          [T50]   │  text-steg ink-3 + textlänk
│  ┌────────────────────────────────────┐  │  panel border-kant-stark
│  │                                    │  │  (upphöjd: veckan är vyns viktiga)
│  │  ✓──✓──◉──○──○──○──○               │  │  tråden: orange linje t.o.m. ◉
│  │  1  2  3  4  5  6  7               │  │  text-meta ink-3 under noderna
│  │                                    │  │  ✓ fylld ink-1 med vit bock
│  │  ┌──────┐                          │  │  ◉ ring ink-1, fylld accent-prick
│  │  │ ▨▨▨  │  [T45]                   │  │  ○ ring kant-stark, tom
│  │  │ ▨▨▨  │  [T46]                   │  │  MarginPlate 56 + IlluPlatta* 48
│  │  └──────┘  [T47]                   │  │  title text-kort, text text-sm
│  │                                    │  │  meta text-meta ink-3
│  │  ╔══════════════════════════════╗  │  │
│  │  ║          [T48]               ║  │  │  primär ink-knapp, full bredd
│  │  ╚══════════════════════════════╝  │  │
│  │                                    │  │
│  │  [T49]                             │  │  textlänk: hoppa till en annan dag
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  Pågår nu                                │  resten av hemskärmen oförändrad
│  ...                                     │
└──────────────────────────────────────────┘
```

| Element | Komponent | Not |
|---|---|---|
| Panelen | `<section className="rounded-xl border border-kant-stark bg-panel p-4" aria-label="Veckan">` | Upphöjd nivå 2. Rimligen en ny `VeckoTrad` i `src/components/dashboard/` |
| Nodraden | **saknas i shell**, ny `VeckoNoder { days, current }` | Se "Insats per flöde" |
| Tråden mellan noderna | 2 px `bg-accent` till och med aktuell nod, `bg-kant-stark` efter | Samma betydelse som överallt: här är du |
| Dagens platta | `MarginPlate` + `IlluPlatta*` per dag | Vyns enda platta. Konsekvens: `NastaHandling` får ingen platta under veckan. |
| Dagens knapp | primär ink-knapp | Hemskärmens enda primära under veckan |
| Hoppa till annan dag | textlänk, öppnar `Sheet` med alla sju | Se skärm 3.4 |

Orange-räkning: tråden mellan noderna (1), aktuell nods accent-prick (2), marginalplattan (3). Exakt tre, och hela resten av hemskärmen måste då vara orangefri. Därför tas `QuotaNudgeRow` bort under veckan för betalande, vilket den ändå ska vara: en betalande har inga kvoter i sitt spår.

Noderna är 32 px i diameter med 44 px träffyta. Sju noder plus mellanrum ryms på 412 px med marginal. På 320 px krymper noderna till 28 px och siffran under flyttar in i noden. Tråden är fortfarande avläsbar.

Tillgänglighet på nodraden: `role="list"`, varje nod `role="listitem"` med `aria-label` "Dag 3 av 7, [T46], pågår" eller "avklarad" eller "kommande". Aktuell nod får `aria-current="step"`. Färgen är aldrig ensam bärare: avklarad har bock, aktuell har ring, kommande är tom.

#### Skärm 3.2: avklarad dag, och flera dagar samma kväll

När dag 3 är klar byter panelen till kvitteringsläget i stället för att hoppa vidare direkt. Skälet: att en dag är avklarad är veckans enda belöningsögonblick, och det ska synas i en sekund innan nästa dag erbjuds.

```
┌────────────────────────────────────┐
│  ✓──✓──✓──◉──○──○──○               │  tråden har flyttat till nod 4
│  1  2  3  4  5  6  7               │
│                                    │
│  ✓ [T51]                           │  Check 20 ink-1 + text-kort
│    [T52]                           │  text-meta ink-3: vad som skapades
│                                    │
│  ╔══════════════════════════════╗  │
│  ║          [T53]               ║  │  primär: gå vidare till dag 4
│  ╚══════════════════════════════╝  │
│                                    │
│  [T54]                             │  textlänk: klart för i dag
└────────────────────────────────────┘
```

**Flera dagar samma kväll är tillåtet, och det syns inte som något särskilt.** Trycker användaren [T53] går panelen rakt in i dag 4. Ingen spärr, ingen fråga, ingen "kom tillbaka i morgon". Programmet är en ordning, inte ett lås, och att bromsa en motiverad användare är det dummaste vi kan göra dag 1.

Två konsekvenser som Opus måste bygga rätt:

1. **Dagnumret följer framsteg, inte kalendern.** Gör användaren dag 1 till 3 på måndagskvällen står hon på dag 4 på tisdagen. Vi skjuter aldrig tillbaka henne till dag 2 för att kalendern säger det. Fältet är `week_progress_day`, inte en uträkning ur `purchased_at`.
2. **Mailserien följer kalendern, men hoppar över det som är gjort.** Tisdagens mail till någon som redan gjort dag 4 skickas inte. Mailet för dag *n* skickas bara om `week_progress_day` är mindre än eller lika med *n*. Annars påminner vi om saker användaren redan gjort, och det är det snabbaste sättet att bli avprenumererad.

Ligger användaren efter kalendern, alltså dag 2 på fredagen, säger vi ingenting om det. Ingen "du ligger efter", ingen röd markering. Noderna som passerats utan att göras står kvar som tomma ringar och kan göras när som helst. Veckan tar inte slut, den förnyas.

#### Skärm 3.3: dag 7 med förnyelsefrågan

Dag 7 är sammanställningen. Förnyelsefrågan ställs här och ingen annanstans, enligt avsnitt 6.

```
┌──────────────────────────────────────────┐
│  CV-VECKAN · DAG 7 AV 7                  │
│  ┌────────────────────────────────────┐  │  panel border-kant-stark
│  │  ✓──✓──✓──✓──✓──✓──◉               │  │
│  │  1  2  3  4  5  6  7               │  │
│  │                                    │  │
│  │  [T55]                             │  │  text-kort ink-1
│  │                                    │  │
│  │  ┌──────┬──────┬──────┬──────┐     │  │  fyra stora tal, text-tal
│  │  │  3   │  2   │  41  │  5   │     │  │  tabular-nums ink-1
│  │  │[T56] │[T57] │[T58] │[T59] │     │  │  text-meta ink-3 under
│  │  └──────┴──────┴──────┴──────┘     │  │
│  │                                    │  │
│  │  [T60]                             │  │  text-sm ink-2, vad som är kvar
│  │                                    │  │
│  │  ╔══════════════════════════════╗  │  │
│  │  ║          [T61]               ║  │  │  primär: fortsätt vecka 2
│  │  ╚══════════════════════════════╝  │  │
│  │                                    │  │
│  │  [T62]                             │  │  textlänk: avsluta i stället
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  ● [T63]                                 │  StatusRow tone="warm"
└──────────────────────────────────────────┘  nästa dragning, datum
```

Viktigt om förnyelsefrågan: den är inte ett köpbeslut. Prenumerationen förnyas automatiskt, det står i statusraden, och [T61] betyder "så här ser vecka 2 ut" och inte "betala igen". Att låtsas att användaren väljer när hon inte gör det är det som ger återbetalningar.

[T62] leder till Stripe-portalen, i samma antal klick som köpet tog. Lagkrav, avsnitt 8. Den ska vara en textlänk och ska inte gömmas.

Orange-räkning på dag 7: tråden (1), aktuell nod (2), den varma statusradens punkt (3). Ingen marginalplatta den här dagen, siffrorna är innehållet. Exakt tre.

De fyra stora talen är innehåll, inte poäng. De räknar saker användaren gjort: brev skickade, mallar nedladdade, ansökningar registrerade, dagar avklarade. Inga XP, ingen nivå, ingen procent.

#### Skärm 3.4: hoppa till en annan dag

```
┌──────────────────────────────────────────┐
│  [T64]                               ✕   │  Sheet title, onClose
│  [T65]                                   │  Sheet description
├──────────────────────────────────────────┤
│  ✓  DAG 1  [T66]                         │  lista i panel, divide-y
│  ✓  DAG 2  [T67]                         │  Check 20 ink-1 för klara
│  ◉  DAG 3  [T68]                         │  aktuell: ring, text ink-1
│  ○  DAG 4  [T69]                         │  kommande: ring kant-stark
│  ○  DAG 5  [T70]                         │  ink-3 på titeln
│  ○  DAG 6  [T71]                         │
│  ○  DAG 7  [T72]                         │
└──────────────────────────────────────────┘
```

`Sheet { open, onClose, title, description }` med en lista i panel. Varje rad är tryckbar, 48 px hög, och tar användaren till den dagen. Ingen dag är låst. Trycker man dag 6 på tisdagen får man dag 6. Programmet är en rekommenderad ordning.

#### Händelser, flöde 3

| När | Händelse | Egenskaper |
|---|---|---|
| Veckopanelen renderas på hemskärmen | `week_day_opened` | `track`, `day`, `source: 'app'`. En gång per dag och session, inte per rendering. |
| Dagen öppnad från mail | `week_day_opened` | `source: 'email'` |
| Dagens sak klar | `week_day_completed` | `track`, `day` |
| Dag 7 renderas | `week_summary_viewed` | `track`, `days_completed` |
| Dag 6 eller 7, statusraden med dragning | `renewal_upcoming_shown` | `plan`, `days_left` |
| Webhook bekräftar förnyelse | `renewal_succeeded` | `plan`, `cycle` |
| Hoppa-arket öppnas | ingen egen händelse | Ryms i `week_day_opened` för den dag som väljs |

#### Acceptanskriterier, flöde 3

Pixel 7, 412 px, som betalande på dag 3:

1. Veckopanelen är hemskärmens första element under `PageHeader`, och dagens knapp syns utan scroll.
2. Sju noder ryms på en rad utan horisontell scroll, även på 320 px.
3. Tråden är orange till och med aktuell nod och grå efter. Inget orange längre ner på hemskärmen.
4. Räkna orange på hela hemskärmen: högst tre.
5. `NastaHandling` visas inte samtidigt som en oavklarad dag finns.
6. Gör dag 3 klar: panelen byter till kvitteringsläget, noden blir bock, tråden flyttar till nod 4, allt utan omladdning.
7. Tryck vidare till dag 4 direkt: inget hindrar, ingen dialog, ingen "kom tillbaka i morgon".
8. Logga ut och in nästa dag: användaren står fortfarande på dag 4, inte på dag 2.
9. VoiceOver läser nodraden som en lista med sju objekt och säger avklarad, pågår eller kommande per nod.
10. Dag 7: förnyelsefrågan syns, uppsägningslänken syns på samma skärm, nästa dragningsdatum står utskrivet.
11. Hoppa-arket öppnar och stänger med Escape, fokus går tillbaka till länken som öppnade det.
12. `prefers-reduced-motion`: trådens flytt mellan noder är omedelbar, inte animerad.

LCP-budget: hemskärmen ligger kvar på under 1,0 s. Veckans tillstånd kommer ur `/api/dashboard/summary`, inte ur ett eget anrop. Det är ett hårt krav: en veckopanel som hämtar sig själv efter mount ger CLS och bryter budgeten i `feedback_prestandabudget_inloggat`.

Desktop 1280: panelen ligger i huvudkolumnen, noderna får större mellanrum men samma storlek. Ingen sidoplacering.

---

### Flöde 4: fel spår i taket

Situationen: användaren på Testveckan öppnar CV-mallarna. `userHasAccess(..., 'cv_templates_all')` säger nej. Hon ska inte mötas av samma betalvägg som en gratisanvändare, för hon betalar redan. Skillnaden måste synas.

#### Principen

**Värdet först, spärren efter, uppgraderingen som en rad och inte som ett kort.** Konkret: mallarna visas i full storlek som förhandsvisning, precis som avsnitt 4 säger, och det som saknas är nedladdningen. Uppgraderingen ligger som en `StatusRow` ovanför listan och som en `PaywallCard` först när användaren faktiskt trycker på en låst mall.

Det är skillnaden mot en betalvägg mitt i ansiktet: raden är information ("det här ingår inte i ditt paket, så här kommer du åt det"), kortet är ett erbjudande som kommer när användaren bett om saken.

#### Skärm 4.1: raden ovanför listan

```
┌──────────────────────────────────────────┐
│  CV-mallar                               │  PageHeader
│  [T73]                                   │
├──────────────────────────────────────────┤
│  ● [T74]                     [T75] →     │  StatusRow tone="neutral"
├──────────────────────────────────────────┤  action = textlänk
│  ┌────────┐  ┌────────┐  ┌────────┐      │
│  │ ▨▨▨▨▨▨ │  │ ▨▨▨▨▨▨ │  │ ▨▨▨▨▨▨ │      │  mallar i full förhandsvisning
│  │ ▨▨▨▨▨▨ │  │ ▨▨▨▨▨▨ │  │ ▨▨▨▨▨▨ │      │  (bg-white tillåtet: papper)
│  │ ▨▨▨▨▨▨ │  │ ▨▨▨▨▨▨ │  │ ▨▨▨▨▨▨ │      │
│  └────────┘  └────────┘  └────────┘      │
│   [T76]       [T77]       [T78]          │  text-meta ink-3 under varje
└──────────────────────────────────────────┘
```

Statusraden är `neutral`, inte `warm`. Skälet: `warm` är reserverat för tidspress, och det här är inte bråttom. En betalande som ser en varm rad tror att något är fel med hennes prenumeration.

Mallarna är inte suddade, inte låsta med hänglås, inte gråa. De syns. Det som saknas är knappen under dem, och det är just där skillnaden hör hemma.

#### Skärm 4.2: kortet när hon trycker

```
┌──────────────────────────────────────────┐
│  ┌────────────────────────────────────┐  │  PaywallCard variant="fel-spar"
│  │ ┌──────┐                           │  │  panel border-kant-stark
│  │ │ ▨▨▨  │  [T79]                    │  │  MarginPlate + IlluPlattaNedladdning
│  │ │ ▨▨▨  │  [T80]                    │  │  title text-kort, body text-sm
│  │ └──────┘                           │  │
│  │                                    │  │
│  │  [T81]                    +20 kr   │  │  text-meta ink-3, mellanskillnad
│  │  [T82]                             │  │  text-meta ink-3, proration
│  │                                    │  │
│  │  ╔══════════════════════════════╗  │  │
│  │  ║          [T83]               ║  │  │  primär ink, till uppgradering
│  │  ╚══════════════════════════════╝  │  │
│  │                                    │  │
│  │  [T84]                             │  │  textlänk: stäng, tillbaka
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

| Element | Komponent | Not |
|---|---|---|
| Kortet | `PaywallCard { variant: 'fel-spar' }` | Ny variant i `paywall-copy.ts`, redan listad i avsnitt 5 |
| Platta | `MarginPlate` + `IlluPlattaNedladdning` | |
| Prisraden | `text-meta text-ink-3` | **Mellanskillnaden, inte hela priset.** 99 minus 79 är 20 kr. Visar vi 99 kr för någon som redan betalar 79 läser det som en dubbeldebitering. |
| Proration | `text-meta text-ink-3` | Säger att den påbörjade veckan räknas av, enligt avsnitt 7 punkt 9 |
| Primär | ink-knapp till `create-upgrade-session` | |
| Stäng | textlänk | Aldrig en andra knapp |

Kortet ligger i ett `Sheet` på mobil, inte som en heldragen sida. Skälet: användaren var mitt i mallistan, och att kasta ut henne till en prissida är precis det "betalvägg mitt i ansiktet" som uppdraget ber oss undvika. Arket kommer underifrån på 240 ms, hon stänger och är tillbaka i listan med scrollpositionen kvar.

Orange-räkning: marginalplattan (1). Statusraden är neutral och har grå punkt. Ett av tre.

#### Skärm 4.3: efter uppgraderingen

Kommer användaren tillbaka från Stripe efter en uppgradering mitt i veckan ska hon tillbaka till mallen hon ville ha, inte till hemskärmen och inte till flöde 2:s startvy. Returadressen bär med sig det hon höll på med.

```
┌──────────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  Confirmation, kompakt
│  ✓ [T85]                                 │  title
│    [T86]                                 │  description: ny dragning
│  ╔══════════════════════════════════╗    │
│  ║            [T87]                 ║    │  primär: ladda ned mallen
│  ╚══════════════════════════════════╝    │
└──────────────────────────────────────────┘
```

Veckan fortsätter på samma dag som förut. En uppgradering byter paket, inte program. Dag 4 i Testveckan blir dag 4 i Allt-veckan, som enligt avsnitt 6 är dagen då det andra spåret visas en gång, och det blir en trevlig sammanträffning men får inte byggas som en regel.

#### Händelser, flöde 4

| När | Händelse | Egenskaper |
|---|---|---|
| Sidan renderas för fel scope | `feature_blocked` | `feature: 'cv_templates_all'`, `scope: 'tester'`, `surface: pathname` |
| Statusraden renderas | `upgrade_shown` | `from_scope`, `to_scope: 'allt'`, `surface: 'statusrad'` |
| Låst mall tryckt, arket öppnas | `upgrade_shown` | `surface: 'ark'` |
| Uppgradera tryckt | `paywall_cta_clicked` | `variant: 'fel-spar'`, `cta: 'primary'` |
| Webhook bekräftar | `subscription_paid` | `plan: 'all_week'`, `from_scope` |

`feature_blocked` skjuts en gång per montering, aldrig per omritning, samma refmönster som `PaywallCard` redan använder. Den här händelsen är planens viktigaste enligt avsnitt 6, och dubbelräkning förstör den.

#### Acceptanskriterier, flöde 4

Pixel 7, 412 px, inloggad på Testveckan:

1. Mallsidan visar alla mallar i full förhandsvisning. Inga suddade bilder, inga hänglås, ingen gråskala.
2. Statusraden ovanför listan är neutral, inte varm.
3. Tryck på en premiummall öppnar ett ark underifrån, inte en ny sida.
4. Priset i arket är mellanskillnaden, inte hela paketpriset.
5. Stäng arket: scrollpositionen i listan är kvar.
6. `feature_blocked` skjuts exakt en gång per sidladdning. Kontrolleras i PostHog live view.
7. Escape stänger arket, fokus går tillbaka till mallen som öppnade det.
8. Efter uppgradering landar användaren på mallen hon tryckte på, med nedladdningen tillgänglig.
9. Veckans dagnummer är oförändrat efter uppgraderingen.
10. Räkna orange på mallistan: högst ett.

Desktop 1280: arket blir en centrerad dialog på 480 px i stället för bottenark. Samma innehåll, samma texter.

---

### Textytor för copywritern

Åttiosju strängar med id, varav några är radgrupper med flera strängar var. Copyn skrivs av copywriter-rollen, inte här. Max tecken är hårda gränser för 412 px utan att raden bryts i mer än tre rader.

| Id | Plats | Max | Avsikt |
|---|---|---|---|
| T1 | Spårval, fråga | 42 | Fråga vad användaren vill få gjort, inte vad hon vill köpa |
| T2 | Spårval, underrad | 90 | Säg att valet går att ändra och att det styr vad vi visar |
| T3 | CV-kortet, titel | 24 | Spårets namn som en handling, inte som ett produktnamn |
| T4 | CV-kortet, beskrivning | 80 | Vad man får gjort på en vecka. Konkret, inte funktionslista |
| T5 | CV-kortet, meta | 30 | Pris och intervall, neutralt |
| T6 | Testkortet, titel | 24 | Samma form som T3 |
| T7 | Testkortet, beskrivning | 80 | Samma form som T4 |
| T8 | Testkortet, meta | 30 | Samma form som T5 |
| T9 | Allt-kortet, titel | 24 | Samma form som T3 |
| T10 | Allt-kortet, beskrivning | 80 | Att man slipper välja, inte att man får mest |
| T11 | Allt-kortet, meta | 30 | Samma form som T5 |
| T12 | Spårval, hoppa över | 32 | Ge en väg förbi utan att låta det låta som ett misstag |
| T13 | Spårval, primärknapp | 20 | Säg vad som händer härnäst, inte "Fortsätt" |
| T14 | Paketskärm, fråga | 42 | Bekräfta valet, inte sälj det igen |
| T15 | Paketskärm, paketnamn | 24 | Samma sträng som T3, T6 eller T9 |
| T16 | Paketskärm, intervall | 60 | Lagkrav: att det förnyas automatiskt, med intervall utskrivet |
| T17 till T20 | Paketskärm, ingår-rader | 44 per rad | En konkret sak per rad. Fyra rader, aldrig fler. Tre uppsättningar, en per paket. |
| T21 | Paketskärm, ingår inte | 70 | Lagkrav för spårpaketen. Sakligt, utan att peka mot uppköpet |
| T22 | Paketskärm, statusrad | 90 | Nästa dragningsdatum och att uppsägning går när som helst |
| T23 | Paketskärm, samtycke | 110 | Lagkrav, enligt avsnitt 8. Får inte skrivas om fritt |
| T24 | Paketskärm, byt paket | 24 | Tillbakaväg utan skam |
| T25 | Paketskärm, primärknapp | 22 | Säg att köpet sker nu och vad det kostar |
| T26 | Paketskärm, under knappen | 60 | Var kvittot hamnar |
| T27 | Hemskärm utan köp, underrad | 70 | Bekräfta spåret utan att nämna priset |
| T28 | Hemskärm utan köp, statusrad | 60 | Vad spåret betyder för vad hon ser |
| T29 | Hemskärm utan köp, länk | 20 | Vägen till paketet, en gång |
| T30 | Efter köp, rubrik | 44 | Vad som är aktivt, inte "Tack" |
| T31 | Efter köp, beskrivning | 130 | Paket, nästa dragning, och när dag 1 räknas från |
| T32 | Efter köp, dag 1 | 44 | Dagens sak som en handling |
| T33 | Efter köp, dag 1 meta | 40 | Ungefärlig tidsåtgång |
| T34 | Efter köp, primärknapp | 22 | In i dag 1, aldrig "Till översikten" |
| T35 | Efter köp, länk | 24 | Se hela veckan |
| T36 | Efter köp, länk | 34 | Kvitto och uppsägning, lagkrav |
| T37 | Dag 1 utan CV, fråga | 42 | Be om CV:t som första steg i dagen |
| T38 | Dag 1 utan CV, underrad | 90 | Varför vi ber om det, och vad som händer sedan |
| T39 | Uppladdningsyta, titel | 34 | Handlingen |
| T40 | Uppladdningsyta, meta | 46 | Format och storlek |
| T41 | Dag 1 utan CV, länk | 34 | Bygg ett nytt i stället |
| T42 | Dag 1 utan CV, primärknapp | 22 | |
| T43 | Testspår, statusrad | 90 | Att vi använde tidigare resultat i stället för att be om omtag |
| T44 | Hemskärm betalande, underrad | 70 | Var hon är i veckan, en mening |
| T45 | Veckopanel, dagens titel | 40 | Dagens sak. Sju per spår, alltså fjorton strängar. |
| T46 | Veckopanel, dagens text | 86 | Vad man gör och varför det står här i dag. Sju per spår. |
| T47 | Veckopanel, dagens meta | 34 | Tidsåtgång. Sju per spår. |
| T48 | Veckopanel, primärknapp | 22 | Handlingen, inte "Börja". Sju per spår. |
| T49 | Veckopanel, länk | 34 | Hoppa till en annan dag |
| T50 | Veckopanel, länk i etiketten | 16 | Se hela veckan |
| T51 | Avklarad dag, titel | 40 | Vad som blev gjort |
| T52 | Avklarad dag, meta | 60 | Vad som skapades och var det finns |
| T53 | Avklarad dag, primärknapp | 26 | Nästa dag, med dagens sak nämnd om den ryms |
| T54 | Avklarad dag, länk | 26 | Klart för i dag, utan skuld |
| T55 | Dag 7, rubrik | 44 | Veckan sammanfattad i en mening |
| T56 till T59 | Dag 7, etiketter under talen | 12 per etikett | Ett ord per tal |
| T60 | Dag 7, vad som är kvar | 100 | En konkret sak till nästa vecka, inte en uppmaning |
| T61 | Dag 7, primärknapp | 26 | Vecka 2, och att den redan är betald |
| T62 | Dag 7, länk | 26 | Avsluta, lagkrav, får inte mildras |
| T63 | Dag 7, statusrad | 80 | Nästa dragningsdatum och belopp |
| T64 | Hoppa-ark, titel | 30 | |
| T65 | Hoppa-ark, beskrivning | 80 | Att ordningen är en rekommendation, inte ett krav |
| T66 till T72 | Hoppa-ark, sju dagsrubriker | 40 per rubrik | Kortform av T45, en uppsättning per spår |
| T73 | Mallistan, underrad | 70 | Vad sidan gör |
| T74 | Fel spår, statusrad | 80 | Vad paketet innehåller, inte vad det saknar |
| T75 | Fel spår, länk | 20 | Vägen vidare |
| T76 till T78 | Mallkort, meta | 24 per rad | Mallens namn och om den ingår |
| T79 | Fel spår-kort, rubrik | 44 | Vad hon ville göra, återgett |
| T80 | Fel spår-kort, text | 110 | Att hennes paket är rätt för sitt syfte och vad som öppnar det här |
| T81 | Fel spår-kort, pris | 30 | Mellanskillnaden, aldrig hela priset |
| T82 | Fel spår-kort, proration | 70 | Att påbörjad vecka räknas av |
| T83 | Fel spår-kort, primärknapp | 26 | |
| T84 | Fel spår-kort, länk | 20 | Stäng |
| T85 | Efter uppgradering, rubrik | 40 | Vad som öppnades |
| T86 | Efter uppgradering, beskrivning | 90 | Nytt belopp och ny dragning |
| T87 | Efter uppgradering, primärknapp | 26 | Tillbaka till det hon ville göra |

Dessutom, utanför tabellen men samma omgång: fjorton dagsrubriker och fjorton dagstexter till veckomailserien, en uppsättning per spår. De hör till copywriterns mailomgång.

### Insats per flöde

| Flöde | Insats | Vad som räcker | Vad som saknas |
|---|---|---|---|
| 1. Spårvalet | **M** | `FlowShell`, `ChoiceCard`, `MarginPlate`, `StatusRow`, knappar och fält ur designsystemet. Allt finns. | Kolumnen `profiles.onboarding_track` och en rutt som skriver den. Kryssrutan för ångerrättssamtycke finns inte som mönster i designsystemet: den behöver ett beslut om form (ruta 20 px i `border-kant bg-insunken`, etikett i 14/400, 44 px träffyta) och ska läggas till i designsystemets avsnitt 6 när den byggts. |
| 2. Köp till första handling | **S** | `Confirmation` med `children` räcker rakt av. `FlowShell` för dag 1. Uppladdningsytan är dashboardens befintliga mönster. | Ingen ny komponent. Arbetet är rutten `/dashboard/vecka/start`, Stripes `success_url`, och att `PurchaseConfirmation` flyttas ut ur hemskärmen. |
| 3. Veckoprogrammet | **L** | `MarginPlate`, `Sheet`, `StatusRow`, panel- och listmönstren, stora tal. | **`VeckoNoder` saknas helt**: sju noder med tråd emellan, tre nodtillstånd, `role="list"` och `aria-current="step"`. Den hör hemma i `src/components/shell/` eftersom tråden är ett systemmönster och inte en dashboardsak. Dessutom `VeckoTrad` i `src/components/dashboard/` som håller ihop noder, dagens innehåll och kvitteringsläget. Veckans tillstånd måste in i `/api/dashboard/summary`, annars spricker LCP-budgeten. |
| 4. Fel spår i taket | **S** | `PaywallCard`, `Sheet`, `StatusRow`. Allt finns. | Varianten `fel-spar` i `paywall-copy.ts` och `PaywallCard`, med en ny prop för mellanskillnad (`priceDeltaKr?: number`). `PaywallCard` behöver också kunna renderas inuti ett `Sheet` utan egen panelram, alltså en `bare?`-prop i samma anda som `EmptyState` redan har. |

Summerat: två nya komponenter (`VeckoNoder` i shell, `VeckoTrad` i dashboard), ett nytt fältmönster (kryssrutan) i designsystemet, två nya props på `PaywallCard`, en ny paywall-variant, två kolumner i `profiles` (`onboarding_track`, `week_progress_day`), och en ny rutt. Resten är Tråden som den redan står.

Total insats för fas 2A:s bygge: **L**. Efter ägarens beslut 5 delas den på två släpp enligt avsnitt 9: flöde 1 (spårvalet) i släpp 1, flöde 2 till 4 i släpp 2.

---

## Fas 2B: text för paket, betalvägg, kassa och vecka

Skriven 2026-09-22 av `svensk-ux-copywriter` utifrån avsnitt 2, 3, 4, 6 och 8, och bunden av tonprinciperna i `docs/design/copy-inloggat-strangar.md`. Onboardingskärmarna ingår inte, de kommer i en andra runda när Fas 2A ligger.

Regler som gäller varje sträng nedan: inga talstreck, aldrig "Lås upp", aldrig "gratis för alltid", vi och du som subjekt, svenska facktermer, och förkortningen ATS bara en gång per vy. Alla längder är räknade i tecken inklusive mellanslag. Ingen funktion nämns som inte står i avsnitt 3.

### Not om förkortningen ATS

Termen skrivs `rekryteringssystem (ATS)` vid första förekomsten i en vy och därefter `rekryteringssystemet`. Vyer där den får stå: prissidan (en gång, i jämförelsetabellen) och CV-analysens intro (en gång, ovanför resultatet). Ingen annanstans i det här avsnittet, och aldrig två gånger på samma skärm.

Rättelse 2026-09-22: PW3 stod tidigare med i listan. Efter omskrivningen av PW3 bär den rekommenderade texten ingen ATS-förekomst, och analysvyns enda tillåtna plats är introt.

---

### 1. Paketnamn

Kravet är att namnet säger vad man får och hur länge, och att det bär meningen "Du har [paket] till söndag".

| Id | Paket | Alternativ A (planens) | Alternativ B | I meningen |
|---|---|---|---|---|
| N1 | CV-spåret, vecka | CV-veckan | Ansökningsveckan | "Du har CV-veckan till söndag" |
| N2 | Testspåret, vecka | Testveckan | Testveckan | "Du har Testveckan till söndag" |
| N3 | Allt, vecka | Allt-veckan | Hela veckan | "Du har Allt-veckan till söndag" |
| N4 | Allt, månad | Allt-månaden | Hela månaden | "Du har Allt-månaden till 22 oktober" |
| N5 | Allt, dag | Allt-dagen | Dygnet | "Du har Allt-dagen till 21:40 i kväll" |
| N6 | Allt, kvartal | Allt-kvartalet | Hela kvartalet | "Du har Allt-kvartalet till 22 december" |

N5 och N6 tillkom med ägarens beslut 4. De följer samma mönster och samma alternativ A gäller. Allt-dagen bär klockslag i stället för datum, eftersom dygnet räknas från köpet och inte från midnatt.

**Rekommendation: alternativ A rakt igenom, planens namn håller.**

Skälen, i ordning. CV-veckan säger både innehåll och längd i ett ord, och är det enda av namnen en användare kan säga högt utan att förklara. Ansökningsveckan är sakligt mer korrekt, eftersom spåret rymmer både CV och brev, men ordet bär inte lika tydligt vad man får: "ansökan" är vad användaren gör, "CV" är vad hon får hjälp med. Testveckan är identisk i båda alternativen, det finns inget bättre ord. Hela veckan och Hela månaden läser snyggare i löptext men faller i taket och i kassan. "Du slog i taket för CV-veckan, byt till Hela veckan" är svårare att förstå än "byt till Allt-veckan", och Allt är det ord vi behöver kunna peka på i uppgraderingen. Bindestrecket i Allt-veckan är en sammansättning, inte ett talstreck, och ska stå.

Planens arbetsnamn var "Allt-månad", utan bestämd form, och det bröt mönstret som de andra namnen följer. Rekommendationen var **Allt-månaden**, så att alla får samma form och samma mening bär dem: "Du har Allt-månaden till 22 oktober". Ägaren godkände det 2026-09-22, beslut 6, och hela dokumentet står nu i bestämd form.


Not till Fas 1: **godkänt av ägaren 2026-09-22 (beslut 6).** Bestämd form gäller hela dokumentet, och Fas 1 är omskrivet därefter. Två namn har tillkommit sedan copyrollen skrev det här avsnittet, eftersom dagspasset och kvartalet behålls som längder på Allt: **Allt-dagen** (49 kr, 24 timmar, engångs) och **Allt-kvartalet** (299 kr, tre månader, löpande). Båda följer samma mönster, och samma mening bär dem: "Du har Allt-dagen till 21:40 i kväll", "Du har Allt-kvartalet till 22 december". Strängarna för de två nya längderna saknas i 2B och 2C och skrivs i samma omgång som Stripe-priserna döps, se noten vid prissidan.
Namnen används böjningsfritt i gränssnittet. Skriv aldrig "CV-veckans", skriv "i CV-veckan".

---

### 2. En rad och tre punkter per paket

Plats: prissidans kort, och samma text i spårvalet. Innehåll uteslutande ur avsnitt 3.

| Id | Paket | Alt A, rad (max 70) | Alt B, rad (max 70) |
|---|---|---|---|
| P1 | CV-veckan | `Hela ansökan klar: CV, analys, mallar och brevet.` (48) | `Allt du behöver för att skicka in ansökan i veckan.` (50) |
| P2 | Testveckan | `Alla nivåer, alla testtyper, förklaring till varje fråga.` (56) | `Träna på urvalstesten under samma tidspress som skarpt.` (54) |
| P3 | Allt-veckan | `Båda spåren plus jobbmatchning, jobbcoachen och Bli upptäckt.` (60) | `Hela ansökan och hela testträningen, i samma vecka.` (50) |
| P4 | Allt-månaden | `Samma som Allt-veckan, en månad och billigare per vecka.` (55) | `För dig som vet att söket tar mer än en vecka.` (45) |

**Rekommendation: A för P1, P2 och P3, B för P4.** P1A och P2A säger vad man får, vilket är kortets uppgift, medan B-raderna säger vad man gör och därmed dubblerar rubriken ovanför. P4 är undantaget: innehållet är redan sagt av P3, så månadens rad ska bära skälet att välja månad, och B gör det utan att säga en siffra vi inte kan belägga.

Punkterna, tre per paket, max 45 tecken:

| Id | Paket | Punkt | Tecken |
|---|---|---|---|
| P1a | CV-veckan | `Alla 41 CV-mallar` | 17 |
| P1b | CV-veckan | `Full CV-analys, alla fynd och poängen` | 37 |
| P1c | CV-veckan | `Personligt brev, skrivet och nedladdat` | 38 |
| P2a | Testveckan | `Alla 19 tester, grundnivå till expert` | 37 |
| P2b | Testveckan | `Tidsatt provläge med automatisk inlämning` | 41 |
| P2c | Testveckan | `Förklaring per fråga och din utveckling` | 39 |
| P3a | Allt-veckan | `Allt i CV-veckan och Testveckan` | 31 |
| P3b | Allt-veckan | `Alla 25 jobbträffar med skälen utskrivna` | 40 |
| P3c | Allt-veckan | `Jobbcoachen utan tak och Bli upptäckt` | 37 |
| P4a | Allt-månaden | `Allt i Allt-veckan, i trettio dagar` | 35 |
| P4b | Allt-månaden | `Billigare än fyra veckor i rad` | 30 |
| P4c | Allt-månaden | `Säg upp när som helst, ett klick` | 32 |

Not: 41 mallar, 19 testvarianter och 25 träffar står i avsnitt 3 och i koden (`TEMPLATE_COUNT`, `TEST_CONFIGS`). Ändras något av talen måste punkten följa med, annars stryks siffran och punkten blir `Alla CV-mallar`. Reserv för P1a om mallantalet blir osäkert: `Alla mallar, inte bara de tre fria` (35).

Under spårkorten ska raden om vad som inte ingår stå, eftersom avsnitt 8 kräver det:

| Id | Plats | Text | Tecken |
|---|---|---|---|
| P5 | Under CV-veckans kort | `Testerna över grundnivå ingår inte.` | 35 |
| P6 | Under Testveckans kort | `CV-mallar och brev ingår inte.` | 30 |

---

### 3. Prissidan

Ersätter `PRISER_HERO_TITLE` och `PRISER_HERO_INGRESS` i `src/app/(public)/priser/components/priser-data.ts`.

| Id | Plats | Alt A | Alt B |
|---|---|---|---|
| PR1 | H1 | **Ersatt, se Fas 2E avsnitt 0.** Slutgiltig lydelse: `Välj spåret du söker på. Börja med en vecka.` (44) | Den gamla lydelsen "Betala för veckan" blir osann när Allt-kortet står på Dag eller Kvartal och ska inte föras in. |
| PR2 | Ingress | `De flesta söker jobb intensivt i några veckor. Vissa sitter med CV, mallar och brev. Andra har fått en kallelse till ett urvalstest. Välj ditt spår, börja med en vecka, säg upp när du är klar.` (190) | `Vi säljer inte ett år av något du behöver i tre veckor. Välj CV-spåret eller testspåret, kör din vecka, och säg upp när ansökan är inne.` (135) |

**Rekommendation: PR1 enligt Fas 2E avsnitt 0, PR2 alternativ A.** PR2A är justerad med samma ord som H1: "börja med en vecka" i stället för "betala för veckan", så att ingressen håller även när Allt-kortet står på Dag eller Kvartal.

H1:ns första sats står kvar: den säger att det finns ett val att göra, och det är precis den informationen sidan finns för. Andra satsen är omskriven i Fas 2E avsnitt 0. PR2A vinner därför att den beskriver de två folkgrupperna i konkreta ord, alltså låter användaren känna igen sig själv innan hon läser ett pris. PR2B är kortare men börjar i vad vi inte gör, och en prissida ska börja i vad användaren får.

**Not, ägarens beslut 4 (2026-09-22): fyra längder på Allt.** Prissidan visar tre kort, som här, men Allt-kortet får ett `Segment` med fyra lägen i stället för ett fast pris: Dag 49, Vecka 99, Månad 149, Kvartal 299, med Vecka förvalt. Kortets pris, punktlista och knapptext följer valt läge. Allt är alltså ett kort, inte fyra, och sidan räknar fortfarande tre val. Två följder för texten: P4 och P4a till P4c i tabellerna ovan gäller månadsläget och behöver motsvarigheter för dag- och kvartalsläget, och PR1A:s "Betala för veckan" blir osann om Allt-kortet står på Dag eller Kvartal när användaren läser rubriken. Rubriken behöver därför antingen stå kvar vid veckan som huvudlöfte och låta Segmentet vara undantaget, eller skrivas om. Jag rekommenderar det första: veckan är vad de flesta köper och vad hela argumentet vilar på, och en rubrik som ska rymma fyra längder säger till slut ingenting. Copyrollen skriver de sex nya strängarna (dag- och kvartalsläget: en rad plus tre punkter vardera) i samma omgång som Stripe-priserna döps.

Sektionsrubriker:

| Id | Plats | Alt A | Alt B | Rekommendation |
|---|---|---|---|---|
| PR3 | Över de fyra korten | `Fyra paket` (10) | `Välj ditt paket` (15) | B. Rubriken ska be om en handling, inte räkna. |
| PR4 | Över gratisraden | `Vad du kan göra utan att betala` (31) | `Gratisnivån` (11) | A. Säger vad gratis innebär i handling. |
| PR5 | Över jämförelsetabellen | `Vad som ingår i vilket paket` (28) | `Jämför paketen` (14) | A. Tabellen svarar på "i vilket", inte "vilket är bäst". |
| PR6 | Över FAQ | `Frågor vi får om veckorna` (25) | `Vanliga frågor` (14) | A. Den binder frågorna till veckan, som är det nya och det som skapar dem. |
| PR7 | Uppsägningsrad, under korten | `Säg upp när som helst i ditt konto. Veckan du betalat för gäller ut.` (67) | `Uppsägning tar ett klick. Perioden du redan betalat löper ut som vanligt.` (72) | A. Säger både var och vad som händer, och "gäller ut" är tryggare än "löper ut". |

Jämförelsetabellens ingress, ersätter `COMPARISON_INTRO`:

| Id | Plats | Text | Tecken |
|---|---|---|---|
| PR8 | Ingress över tabellen | `Spårpaketen ger allt i sitt spår. Allt ger båda, plus jobbmatchning, jobbcoachen och Bli upptäckt.` | 100 |

FAQ, fem frågor.

**PR9. Varför säljer ni en vecka och inte en månad?**

`De flesta söker jobb i korta intensiva perioder och slutar när de fått jobbet. En månad är då för mycket betalt för för lite användning. Veckan matchar hur ett sök faktiskt ser ut: du har en annons som ska besvaras, eller ett urvalstest på fredag. Behöver du längre tid finns Allt-månaden, som kostar mindre per vecka än fyra veckor i rad.`

**PR10. Vad händer när veckan är slut?**

`Veckan förnyas automatiskt med samma belopp, och du behåller ditt spår. Vill du inte fortsätta säger du upp i ditt konto, och då gäller veckan du betalat för till sista dagen innan kontot går tillbaka till gratisnivån. Allt du skapat finns kvar att läsa och kopiera, även på gratisnivån.`

**PR11. Kan jag byta spår?**

`Ja. Säg upp det spår du har och köp det andra, så börjar en ny vecka. Vill du ha båda samtidigt byter du till Allt-veckan direkt, och då betalar du bara mellanskillnaden för de dagar som är kvar av veckan du redan köpt.`

**PR12. Vad ingår utan att betala?**

`Tre CV-mallar, en CV-analys med de tre tyngsta fynden, ett personligt brev, en CV-nedladdning och grundnivån i varje testtyp en gång per dygn. Det räcker för att se hur verktygen arbetar och för att skicka en ansökan. Söker du flera jobb i veckan, eller ska du göra ett urvalstest på riktigt, tar gratisnivån slut.`

**PR13. Hur säger jag upp?**

`Under Profil och Prenumeration, ett klick, utan att uppge skäl och utan att kontakta oss. Uppsägningen gäller från nästa förnyelse, och veckan du redan betalat för gäller ut. Vi skickar ett mail dagen innan varje förnyelse från och med den tredje, så att ingen dragning kommer som en överraskning.`

Not till PR12: formuleringen speglar avsnitt 4 exakt. Ändras någon gräns i kvottjänsten måste PR12, GR1 till GR7 och betalväggarna ändras i samma omgång, annars säger sidan en sak och spärren en annan.

Not till PR13: "från och med den tredje" följer avsnitt 8. Väljer ägaren att påminna inför varje förnyelse stryks den bisatsen och meningen blir `Vi skickar ett mail dagen innan varje förnyelse`.

Not om ATS: förkortningen står en gång på prissidan, i jämförelsetabellens rad för läsbarhet, som `Läsbarhet i rekryteringssystem (ATS)`. Den ska inte stå i FAQ, ingress eller korten.

---

### 4. Betalvägg per spärr

Varje betalvägg föreslår rätt spår i den primära knappen och nämner Allt en gång i brödtexten. Rubrik max 40, brödtext max 140, primär knapp max 24, sekundär max 24. Varianterna i `src/components/paywall/paywall-copy.ts`.

#### PW1. Mall utöver de tre fria

| Del | Alt A | Alt B |
|---|---|---|
| Rubrik | `Den här mallen ingår i CV-veckan` (32) | `Tre mallar fria, resten i CV-veckan` (35) |
| Brödtext | `Du ser hela mallen som den blir. CV-veckan ger alla 41, plus brevet och den fulla analysen. Testerna ligger i Allt-veckan.` (123) | `Tre mallar ingår i gratisnivån. CV-veckan öppnar de andra 38 och brevet, Allt-veckan lägger till testerna.` (107) |
| Primär | `Ta CV-veckan` (12) | `Se CV-veckan` (12) |
| Sekundär | `Välj bland de tre fria` (22) | `Jämför paketen` (14) |

**Rekommendation: A.** Rubriken pekar på den mall användaren just tryckt på, vilket är mer konkret än att räkna fria mallar. Bodyn börjar i värdet användaren redan ser, alltså förhandsvisningen i full storlek enligt avsnitt 4, innan den säger priset. Sekundären ger en väg framåt utan att betala, vilket B inte gör.

#### PW2. Testnivå över grundnivån

| Del | Alt A | Alt B |
|---|---|---|
| Rubrik | `Avancerad nivå ingår i Testveckan` (33) | `Du klarade grundnivån` (21) |
| Brödtext | `Testveckan ger alla 19 tester, alla nivåer, tidsatt provläge och förklaring till varje fråga. Vill du ha CV-spåret med finns Allt-veckan.` (136) | `Grundnivån ingår i gratisnivån. Testveckan öppnar alla nivåer och provläget, Allt-veckan hela produkten.` (104) |
| Primär | `Ta Testveckan` (13) | `Se Testveckan` (13) |
| Sekundär | `Kör grundnivån igen` (19) | `Jämför paketen` (14) |

**Rekommendation: A.** Rubriken namnger nivån användaren ville in på, och brödtexten räknar upp det Testveckan faktiskt ger enligt avsnitt 3. B:s "hela produkten" är vagt och säger inte vad Allt är.

#### PW3. Full CV-analys

| Del | Alt A | Alt B |
|---|---|---|
**Not, ägarens beslut 2 (2026-09-22): gränsen har flyttats.** Gratisnivån ger inte längre tre fulla fynd, utan poängen, antalet fynd och det tyngsta fyndet i klartext. Övriga fynd står som rubriker utan åtgärd. Strängarna nedan är därför omskrivna: betalväggen måste säga att rubrikerna hon ser har åtgärder bakom sig, inte att "resten" finns någon annanstans. Den skiljer sig från alla andra betalväggar i planen på en punkt: här ser användaren redan vad som saknas, uppräknat framför sig, och texten ska peka på just det.

| Del | Alt A | Alt B |
|---|---|---|
| Rubrik | `Du ser vad som behöver rättas` (29) | `Åtgärderna ligger i CV-veckan` (29) |
| Brödtext | `Rubrikerna ovan är dina fynd. CV-veckan skriver ut vad du gör åt vart och ett, går igenom CV:t avsnitt för avsnitt och låter dig köra om analysen tills poängen sitter.` (166) | `Du har sett det tyngsta fyndet och din läsbarhetspoäng. CV-veckan öppnar åtgärden bakom varje rubrik och låter dig köra om analysen när du rättat.` (147) |
| Primär | `Se alla åtgärder` (16) | `Se alla åtgärder` (16) |
| Sekundär | `Jämför paketen` (14) | `Jämför paketen` (14) |

**Rekommendation: B.** Den kvitterar vad användaren redan fått, alltså poängen och det tyngsta fyndet, innan den säger vad som kostar. Det är skillnaden mellan en betalvägg som läser som en fortsättning och en som läser som ett avbrott. B namnger också omkörningen, som enligt avsnitt 4 är det egentliga uttaget och det som CV-veckans dag 2 bygger på. A är 166 tecken, alltså över taket på 140 som gäller betalväggarnas brödtext i den här omgången, och dess rubrik beskriver vad användaren gör snarare än vad som ligger bakom spärren.

Ingen ATS-förekomst i den rekommenderade texten. Behövs förkortningen i vyn står den i analysens intro ovanför kortet, en gång, aldrig här.

#### PW4. Brevnedladdning

| Del | Alt A | Alt B |
|---|---|---|
| Rubrik | `Ditt brev är klart` (18) | `Ladda ner brevet med CV-veckan` (30) |
| Brödtext | `Läs och kopiera det fritt. Nedladdning som PDF och Word ingår i CV-veckan, med alla mallar och full analys. Allt-veckan ger testerna med.` (137) | `Läs och kopiera det fritt. Nedladdning som PDF och Word ingår i CV-veckan, tillsammans med alla mallar. Testerna ligger i Allt-veckan.` (133) |
| Primär | `Ta CV-veckan` (12) | `Ta CV-veckan` (12) |
| Sekundär | `Kopiera texten i stället` (24) | `Kopiera texten i stället` (24) |

**Rekommendation: A.** Rubriken står redan i koden, fungerar, och säger att värdet är levererat innan spärren nämns. Att byta den mot en säljrubrik vore att flytta betalväggen före värdet, vilket bryter mönstret i `PaywallCard`. A:s brödtext nämner full analys, som är CV-spårets andra argument.

#### PW5. CV-export nummer två

| Del | Alt A | Alt B |
|---|---|---|
| Rubrik | `Din gratis nedladdning är använd` (32) | `En nedladdning ingår, den är använd` (35) |
| Brödtext | `CV-veckan ger nedladdning utan tak, alla 41 mallar och den fulla analysen. Behöver du testerna ligger de i Allt-veckan.` (119) | `Du har laddat ner ett CV. Fler nedladdningar, alla mallar och full analys ingår i CV-veckan. Allt-veckan lägger till testerna.` (125) |
| Primär | `Ta CV-veckan` (12) | `Ta CV-veckan` (12) |
| Sekundär | `Se vad paketen kostar` (21) | `Se vad paketen kostar` (21) |

**Rekommendation: B.** Första meningen erkänner vad användaren gjort innan den säljer, precis som dagens text i koden gör, och den ordningen är beslutad. A hoppar rakt in i erbjudandet.

#### PW6. Jobbmatchning utöver tre träffar

| Del | Alt A | Alt B |
|---|---|---|
| Rubrik | `Resten av träffarna ingår i Allt` (32) | `Se varför du passar för alla 25` (31) |
| Brödtext | `Du ser de tre bästa med skälen utskrivna. Allt-veckan öppnar resten, med titel, arbetsgivare och ort.` (101) | `Du ser de tre bästa med skälen utskrivna. Allt öppnar resten, med titel, arbetsgivare, ort och varför just du passar.` (117) |
| Primär | `Ta Allt-veckan` (14) | `Ta Allt-veckan` (14) |
| Sekundär | `Jämför paketen` (14) | `Jämför paketen` (14) |

**Rekommendation: B.** Rubriken är dagens, som fungerar, och siffran står i avsnitt 3. "Varför just du passar" är skälet folk öppnar en träff för och får inte strykas. Jobbmatchningen finns bara i Allt, så här nämns Allt en gång och inget spår föreslås, eftersom inget spår löser spärren.

Not: är antalet träffar dynamiskt ska rubriken vara `Se varför du passar för alla {totalt}` som i dag, och talet 25 bara vara reservtexten.

#### PW7. Jobbcoachen efter tio meddelanden

| Del | Alt A | Alt B |
|---|---|---|
| Rubrik | `Dina tio meddelanden är använda` (31) | `Jobbcoachen ingår i Allt` (24) |
| Brödtext | `Tio meddelanden ingår i gratisnivån. Allt-veckan ger chatten utan tak, tillsammans med båda spåren och jobbmatchningen.` (118) | `Allt-veckan ger chatten utan tak, plus båda spåren, alla jobbträffar och Bli upptäckt. Gratisnivån ger tio meddelanden per konto.` (129) |
| Primär | `Ta Allt-veckan` (14) | `Ta Allt-veckan` (14) |
| Sekundär | `Jämför paketen` (14) | `Jämför paketen` (14) |

**Rekommendation: A.** Rubriken säger vad som hänt, bodyn vad som gäller och vad som öppnar. B börjar i erbjudandet och lämnar användaren utan att veta varför hon stoppades.

Not: gränsen är tio per konto enligt avsnitt 4, inte per dag. Rubriken får därför inte säga "dagens meddelanden", vilket dagens sträng gör, och den raden måste ändras i samma omgång.

---

### 5. Fel spår i taket

Visas när Testveckan-köparen öppnar en mall, eller CV-veckan-köparen öppnar en testnivå över grundnivån. Ny variant `fel-spar` enligt avsnitt 5. Brödtexten får vara längre än betalväggarnas 140, eftersom kortet är en uppgradering och inte en spärr, men 160 är taket.

#### FS1. Testveckan-köparen öppnar mallar

| Del | Alt A | Alt B |
|---|---|---|
| Rubrik | `Mallarna ligger i CV-spåret` (27) | `Du har Testveckan, det här är CV` (32) |
| Brödtext | `Du har Testveckan till söndag. Byt till Allt-veckan så öppnas alla 41 mallar, brevet och den fulla analysen direkt, och veckan fortsätter som vanligt.` (150) | `Du har Testveckan till söndag. Byt till Allt-veckan så öppnas mallarna, brevet och analysen på en gång. Du betalar bara mellanskillnaden för dagarna som är kvar.` (159) |
| Primär | `Byt till Allt-veckan` (20) | `Byt till Allt-veckan` (20) |
| Sekundär | `Fortsätt med testerna` (21) | `Fortsätt med testerna` (21) |

**Rekommendation: B.** Mellanskillnaden är hela skälet att byta mitt i en vecka i stället för att vänta till söndag, och A säger den inte. A:s sista sats är dessutom en trygghet som knappen och kassan redan ger.

#### FS2. CV-veckan-köparen öppnar nivå 2

| Del | Alt A | Alt B |
|---|---|---|
| Rubrik | `Testerna ligger i testspåret` (28) | `Du har CV-veckan, det här är test` (33) |
| Brödtext | `Du har CV-veckan till söndag. Byt till Allt-veckan så öppnas alla nivåer, tidsatt provläge och förklaringen till varje fråga. Du betalar bara mellanskillnaden.` (155) | `Du har CV-veckan till söndag. Byt till Allt-veckan så öppnas alla nivåer och provläget. Du betalar bara mellanskillnaden för dagarna som är kvar.` (145) |
| Primär | `Byt till Allt-veckan` (20) | `Byt till Allt-veckan` (20) |
| Sekundär | `Fortsätt med CV:t` (17) | `Fortsätt med CV:t` (17) |

**Rekommendation: A.** Här väger innehållet tyngre än längden: förklaring per fråga är testspårets starkaste sida enligt avsnitt 3, och den får inte strykas i just den betalvägg som ska sälja testspåret.

Not om "mellanskillnaden": ordet är begripligt utan förklaring på svenska och ska inte byggas ut med "proportionellt" eller "pro rata". Visar kassan ett belopp ska raden där säga:

| Id | Plats | Text | Tecken |
|---|---|---|---|
| FS3 | Kassan vid uppgradering | `Du betalar {belopp} kr nu, och 99 kr från nästa dragning.` | 57 vid tvåsiffrigt belopp |

Kan beloppet inte räknas fram före Stripe-sidan står bara "mellanskillnaden" i kortet och beloppet visas i kassan.

---

### 6. Kassan och lagkraven

Alla strängar nedan följer avsnitt 8 och är krav, inte val. Ingen av dem får kortas bort i implementeringen.

#### Samtyckesraden

| Id | Alt A | Alt B |
|---|---|---|
| K1 | `Jag vill börja använda tjänsten direkt och förstår att ångerrätten då går förlorad.` (82) | `Starta direkt. Jag förstår att ångerrätten på fjorton dagar inte gäller när innehållet påbörjats på min begäran.` (112) |

**Rekommendation: B.** A är formuleringen i avsnitt 8 och är juridiskt gångbar, men "går förlorad" låter som ett straff och säger inte vad användaren avstår från. B namnger de fjorton dagarna, vilket gör samtycket informerat, och det är kravet: undantaget gäller bara om samtycket är dokumenterat och begripligt. Kryssrutan sparas med tidsstämpel enligt avsnitt 8.

| Id | Plats | Text | Tecken |
|---|---|---|---|
| K2 | Hjälprad under K1 | `Kryssar du inte i får du tillgång först efter fjorton dagar.` | 60 |

#### Förnyelseraden

| Id | Paket | Text | Tecken |
|---|---|---|---|
| K3 | CV-veckan och Testveckan | `79 kr i veckan. Dras var sjunde dag, nästa gång {datum}, tills du säger upp.` | 76 |
| K4 | Allt-veckan | `99 kr i veckan. Dras var sjunde dag, nästa gång {datum}, tills du säger upp.` | 76 |
| K5 | Allt-månaden | `149 kr i månaden. Dras var trettionde dag, nästa gång {datum}, tills du säger upp.` | 82 |
| K6 | Alternativ till K3, om veckan alltid börjar en måndag | `79 kr i veckan. Dras varje måndag, nästa gång {datum}, tills du säger upp.` | 74 |

**Rekommendation: K3 till K5, alltså "var sjunde dag".** Köpet sker när användaren är på sidan, inte på en måndag, och Stripes `interval: 'week'` räknar sju dagar från köpet. Skriver vi "varje måndag" i kassan men drar på en torsdag är raden felaktig, och det är exakt den sortens fel som blir en återbetalning. K6 får användas först om veckan faktiskt normaliseras till måndag i Stripe.

| Id | Plats | Text | Tecken |
|---|---|---|---|
| K7 | Uppsägningsrad under K3 och K4 | `Säg upp när som helst i ditt konto, utan skäl. Veckan du betalat gäller ut.` | 75 |
| K8 | Samma rad för Allt-månaden | `Säg upp när som helst i ditt konto, utan skäl. Månaden du betalat gäller ut.` | 76 |

Vad som inte ingår, obligatoriskt för spårpaketen enligt avsnitt 8:

| Id | Paket | Text | Tecken |
|---|---|---|---|
| K9 | CV-veckan | `Ingår inte: testnivåer över grundnivån, alla jobbträffar, jobbcoachen utan tak, Bli upptäckt.` | 93 |
| K10 | Testveckan | `Ingår inte: CV-mallar utöver de tre fria, full CV-analys, brevnedladdning, alla jobbträffar, jobbcoachen utan tak, Bli upptäckt.` | 127 |

#### Bekräftelsesidan

| Id | Del | Alt A | Alt B |
|---|---|---|---|
| K11 | Rubrik | `Du har CV-veckan till söndag` (28) | `Betalt. Veckan är igång.` (24) |
| K12 | Ingress | `Nästa dragning sker {datum}, 79 kr, tills du säger upp. Kvittot ligger i din mail. Vi börjar med ditt CV.` (105) | `Kvittot ligger i din mail. Nästa dragning {datum}, 79 kr, tills du säger upp. Dag 1 väntar: CV in, full analys, mall, nedladdning.` (130) |
| K13 | Primär knapp | `Börja med dag 1` (15) | `Sätt igång` (10) |

**Rekommendation: K11 alternativ A, K12 alternativ B, K13 alternativ A.** K11A bär meningen paketnamnen byggdes för och säger både vad och hur länge. K12B ger både lagkravets uppgifter och veckans första dag i konkreta ord, vilket är det som driver "kommit igång inom 24 timmar". K13A namnger det som händer när man trycker.

Samma struktur för de andra paketen:

| Id | Del | Text | Tecken |
|---|---|---|---|
| K14 | Testveckan, rubrik | `Du har Testveckan till söndag` | 29 |
| K15 | Testveckan, ingress | `Kvittot ligger i din mail. Nästa dragning {datum}, 79 kr, tills du säger upp. Dag 1 väntar: ett diagnostest och din träningsplan för veckan.` | 140 |
| K16 | Allt-månaden, rubrik | `Du har Allt-månaden till {datum}` | 30 |
| K17 | Allt-månaden, ingress | `Kvittot ligger i din mail. Nästa dragning {datum}, 149 kr, tills du säger upp. Välj spår så lägger vi upp veckan.` | 112 |

#### Kvittomejlet

| Id | Del | Alt A | Alt B |
|---|---|---|---|
| K18 | Ämne | `Kvitto: CV-veckan, 79 kr` (24) | `Ditt kvitto från Jobbcoach, 79 kr` (34) |
| K19 | Första stycket | `Tack. Du har betalat 79 kr för CV-veckan, som gäller från i dag till och med söndag {datum}. Därefter förnyas den automatiskt med 79 kr var sjunde dag tills du säger upp, vilket du gör i ditt konto under Prenumeration.` | `Här är kvittot på 79 kr för CV-veckan. Perioden gäller {datum} till {datum} och förnyas sedan var sjunde dag med samma belopp tills du säger upp. Uppsägning görs i ditt konto under Prenumeration och tar ett klick.` |

**Rekommendation: K18 alternativ A, K19 alternativ B.** Ämnesraden ska gå att söka fram i inkorgen ett halvår senare, och paketnamnet plus beloppet gör den sökbar. K19B skriver ut både start- och slutdatum, vilket ett kvitto ska göra. A:s "från i dag" är värdelöst i en mail som läses om i november.

Kvittots obligatoriska rader under första stycket, enligt avsnitt 8:

| Id | Rad |
|---|---|
| K20 | `Belopp: 79 kr inklusive moms` |
| K21 | `Paket: CV-veckan` |
| K22 | `Period: {datum} till {datum}` |
| K23 | `Nästa dragning: {datum}` |
| K24 | `Säg upp: {länk}` |

---

### 7. Veckomejlen

Ett mejl per dag och spår, enligt dagsprogrammet i avsnitt 6. Ämnesrad max 45, preheader max 80, första stycket max 60 ord, plus en knapp. Ämnesraderna säger vad dagen innehåller, aldrig "dag 3 av 7": en nedräkning mot slutet är fel signal i en prenumeration som ska förnyas.

Mejlen ersätter `rt_day0` till `rt_day10` i `src/lib/email/lifecycle/registry.ts`. Två serier, `cv_day1` till `cv_day7` och `test_day1` till `test_day7`.

#### CV-veckan

**M1, dag 1**

| Del | Alt A | Alt B |
|---|---|---|
| Ämne | `Ansökan kan vara inne i kväll` (29) | `Börja här: CV in, analys, mall` (30) |
| Preheader | `Ladda upp CV:t, se hela analysen, välj mall och ladda ner.` (58) | `Fyra steg, ungefär tjugo minuter.` (33) |

Rekommendation: ämne A, preheader A. A:s ämne lovar ett resultat samma kväll, vilket är dag 1:s hela poäng enligt avsnitt 6.

Första stycket (46 ord): `Du har CV-veckan till söndag, och dag 1 är den som ger snabbast utdelning. Ladda upp ditt CV, läs hela analysen, välj en mall och ladda ner den. Då har du en färdig ansökan att skicka i kväll, och resten av veckan handlar om att göra den vassare.`

Knapp: `Ladda upp ditt CV`

**M2, dag 2**

| Del | Alt A | Alt B |
|---|---|---|
| Ämne | `Rätta de tre tyngsta fynden` (27) | `Se poängen röra sig` (19) |
| Preheader | `Kör om analysen efteråt, så ser du skillnaden svart på vitt.` (60) | `Ett fynd i taget, det tyngsta först.` (36) |

Rekommendation: ämne A, preheader A. Ämnet ska säga vad man ska göra, preheadern vad man får ut av det.

Första stycket (39 ord): `Analysen från i går rangordnade fynden efter vad som väger tyngst. Ta de tre översta i dag, ett i taget, och kör om analysen när du är klar. Läsbarhetspoängen rör sig direkt, och du ser vilken ändring som gjorde mest.`

Knapp: `Öppna analysen`

**M3, dag 3**

| Del | Alt A | Alt B |
|---|---|---|
| Ämne | `Brevet till annonsen du sökte` (29) | `Dags för det personliga brevet` (30) |
| Preheader | `Klistra in annonsen, vi läser kravprofilen och skriver.` (54) | `Fyra minuter, sedan är ansökan komplett.` (40) |

Rekommendation: ämne A, preheader A. A knyter an till gårdagens handling i stället för att annonsera en uppgift.

Första stycket (41 ord): `Ett CV utan brev är en halv ansökan i de flesta svenska urval. Klistra in annonsen du redan sökt, så läser vi ut kravprofilen och skriver brevet mot den. Läs igenom, ändra det du vill, ladda ner som PDF eller Word.`

Knapp: `Skriv brevet`

**M4, dag 4**

| Del | Alt A | Alt B |
|---|---|---|
| Ämne | `En mall till, för en annan sorts roll` (36) | `Samma CV, ny mall` (17) |
| Preheader | `Samma innehåll, annat uttryck. Tar under fem minuter.` (52) | `En stramare till de stora, en öppnare till de små.` (49) |

Rekommendation: ämne A, preheader A. A:s ämne förklarar varför man ska byta mall, vilket B lämnar öppet.

Första stycket (43 ord): `Söker du brett behöver du sällan skriva om CV:t, men du tjänar på att byta uttryck. En stramare mall till de traditionella arbetsgivarna, en öppnare till de mindre bolagen. Innehållet följer med av sig självt, du väljer bara en ny mall och laddar ner.`

Knapp: `Välj en ny mall`

**M5, dag 5**

| Del | Alt A | Alt B |
|---|---|---|
| Ämne | `Klarar ditt CV rekryteringssystemet?` (36) | `Läsbarhetspoängen, och vad som sänker den` (41) |
| Preheader | `Tabeller, kolumner och grafik är det som oftast går fel.` (56) | `Poängen går från 0 till 100. Så höjer du din.` (45) |

Rekommendation: ämne B, preheader A. B lovar både tal och åtgärd och undviker en fråga i ämnesraden, som sällan öppnas.

Första stycket (46 ord): `Hos de flesta arbetsgivare läses ansökan av ett rekryteringssystem (ATS) innan en människa ser den. Läsbarhetspoängen visar hur väl systemet tolkar ditt CV, från 0 till 100. Vi pekar ut vad som sänker den och vad du ändrar. Oftast är det tabeller, kolumner eller en grafisk rubrik.`

Knapp: `Se din läsbarhetspoäng`

**M6, dag 6**

| Del | Alt A | Alt B |
|---|---|---|
| Ämne | `LinkedIn mot samma CV` (21) | `Rekryterare söker, hittar de dig?` (33) |
| Preheader | `Rubrik, om mig och kompetenser mot det CV du just gjort.` (57) | `Samma ord som står i kravprofilen, på din profil.` (49) |

Rekommendation: ämne A, preheader A. Konkret och utan fråga.

Första stycket (40 ord): `Rekryterare söker i LinkedIn med samma ord som står i kravprofilen. Ditt CV innehåller de orden nu, men din profil gör det sällan. Vi läser båda och föreslår ny rubrik, ny om mig-text och de kompetenser som bör ligga överst.`

Knapp: `Optimera profilen`

**M7, dag 7, förnyelsefrågan**

| Del | Alt A | Alt B |
|---|---|---|
| Ämne | `Din vecka, och om du vill ha en till` (36) | `Veckan är slut. Fortsätter du?` (30) |
| Preheader | `Så här långt kom du. Förnyelsen sker i morgon om du inget gör.` (63) | `Sammanställningen, och hur du säger upp om du är klar.` (54) |

Rekommendation: ämne A, preheader A. A:s ämne ställer frågan utan att låta som ett avsked, och preheadern säger rakt ut vad som händer om användaren inget gör. Det är det ärliga, och det är hela poängen med dag 7.

Första stycket (48 ord): `Här är veckan: vad du laddat ner, vad du skrivit och vad som är kvar. Har du fått intervju är vi glada, och då behöver du inte göra något mer än att säga upp. Söker du vidare förnyas CV-veckan i morgon med 79 kr, och vi fortsätter där du slutade.`

Knapp: `Se veckans sammanställning`. Sekundär länk: `Säg upp CV-veckan` (17)

#### Testveckan

**M8, dag 1**

| Del | Alt A | Alt B |
|---|---|---|
| Ämne | `Ditt diagnostest och veckans plan` (33) | `Börja med att mäta var du står` (30) |
| Preheader | `Tjugo minuter nu ger en plan för resten av veckan.` (50) | `Matrislogik, verbalt och numeriskt, på grundnivå.` (48) |

Rekommendation: ämne A, preheader A. A namnger båda leveranserna, vilket B inte gör.

Första stycket (40 ord): `Vi börjar med ett diagnostest på grundnivå i varje testtyp: matrislogik, verbalt, numeriskt. Resultatet visar var du tappar, och utifrån det lägger vi en träningsplan för veckan. Du behöver inte gissa vad du ska öva på, planen säger det.`

Knapp: `Gör diagnostestet`

**M9, dag 2**

| Del | Alt A | Alt B |
|---|---|---|
| Ämne | `Din svagaste testtyp, en nivå upp` (33) | `I dag tränar vi det som svajade` (31) |
| Preheader | `Avancerad nivå, med förklaring till varje fråga du missar.` (57) | `Mönstret bakom frågan är det du tränar.` (39) |

Rekommendation: ämne A, preheader A. A är precis om vad som väntar.

Första stycket (43 ord): `Diagnostestet pekade ut var du tappade mest. I dag kör vi den typen på avancerad nivå, och du får förklaringen till varje fråga direkt efteråt. Läs förklaringarna även på de frågor du klarade. Mönstret bakom en matrislogikfråga återkommer, och det är mönstret du tränar.`

Knapp: `Kör avancerad nivå`

**M10, dag 3**

| Del | Alt A | Alt B |
|---|---|---|
| Ämne | `Verbalt resonemang, med klockan på` (34) | `Tidsatt verbalt test i dag` (26) |
| Preheader | `Samma tidspress som i ett skarpt urval.` (38) | `Automatisk inlämning när tiden är ute.` (38) |

Rekommendation: ämne A, preheader A.

Första stycket (44 ord): `Verbala test faller sällan på förståelsen, de faller på tiden. I dag kör du med klockan igång och automatisk inlämning när tiden är ute, precis som i ett skarpt urval. Räkna med att det känns stressigt första gången. Det är hela poängen med att öva.`

Knapp: `Starta det tidsatta testet`

**M11, dag 4**

| Del | Alt A | Alt B |
|---|---|---|
| Ämne | `Numeriskt, tidsatt` (18) | `Tabeller, diagram och klockan` (29) |
| Preheader | `Läs frågan före tabellen, så slipper du räkna i onödan.` (55) | `Numeriskt test under tidspress, med förklaring efteråt.` (54) |

Rekommendation: ämne B, preheader A. B säger vad man möter i stället för att bara namnge testtypen, och preheadern ger ett råd man kan använda direkt.

Första stycket (48 ord): `Numeriska test ger dig en tabell eller ett diagram och en fråga du ska svara på under tidspress. Det snabbaste greppet är att läsa frågan först och sedan leta upp bara de tal du behöver. I dag kör vi tidsatt, och förklaringen efteråt visar vilken väg som var kortast.`

Knapp: `Kör det numeriska testet`

**M12, dag 5**

| Del | Alt A | Alt B |
|---|---|---|
| Ämne | `Expertnivå i det du är bäst på` (30) | `Pressa din starkaste testtyp` (28) |
| Preheader | `Marginalen uppåt är det som skiljer i ett tätt urval.` (52) | `I dag går vi uppåt, inte nedåt.` (31) |

Rekommendation: ämne A, preheader A.

Första stycket (45 ord): `I dag går vi uppåt i stället för nedåt. Expertnivå i din starkaste testtyp, eftersom det är där du kan flytta dig från godkänt till särskiljande. I ett tätt urval är det sällan svagheten som avgör, det är om något i din profil sticker ut.`

Knapp: `Kör expertnivån`

**M13, dag 6**

| Del | Alt A | Alt B |
|---|---|---|
| Ämne | `Fullt prov under skarp tidspress` (32) | `Generalrepetitionen` (19) |
| Preheader | `Alla typer i följd, automatisk inlämning, inga pauser.` (53) | `Sätt dig ostört. Det här är det ärligaste beskedet.` (51) |

Rekommendation: ämne A, preheader A. A säger vad som väntar, B kräver att man gissar.

Första stycket (49 ord): `I dag kör du ett fullt prov: alla testtyper i följd, klockan igång, automatisk inlämning när tiden går ut. Inga pauser och ingen möjlighet att backa, precis som när det gäller. Sätt dig ostört och lägg undan telefonen. Resultatet blir det mest ärliga besked du får den här veckan.`

Knapp: `Starta provet`

**M14, dag 7, förnyelsefrågan**

| Del | Alt A | Alt B |
|---|---|---|
| Ämne | `Din kurva, och om du vill ha en vecka till` (42) | `Så mycket flyttade du dig på sju dagar` (38) |
| Preheader | `Alla sessioner i en kurva. Förnyelsen sker i morgon om du inget gör.` (68) | `Sammanställningen, och hur du säger upp om du är klar.` (54) |

Rekommendation: ämne B, preheader A. Här vinner B över CV-seriens motsvarighet, eftersom utvecklingen över tid är testspårets enda mätbara resultat och därmed det starkaste skälet att öppna. Preheadern är fortfarande den ärliga raden om förnyelsen.

Första stycket (48 ord): `Alla dina sessioner ligger nu i en kurva, per testtyp. Du ser var du började, var du landade och vilken typ som flyttade sig mest. Har du testet bakom dig är du klar och säger upp. Väntar det fortfarande förnyas Testveckan i morgon med 79 kr, och kurvan fortsätter.`

Knapp: `Se din utveckling`. Sekundär länk: `Säg upp Testveckan` (18)

#### Två mejl till

**M15, förnyelse i morgon.** Skickas dagen före förnyelse tre och framåt, enligt avsnitt 8.

| Del | Alt A | Alt B |
|---|---|---|
| Ämne | `{Paket} förnyas i morgon, 79 kr` (30 med CV-veckan) | `En påminnelse innan nästa dragning` (34) |
| Preheader | `Vill du inte fortsätta säger du upp i dag, det tar ett klick.` (61) | `79 kr dras {datum}. Säg upp i ditt konto om du är klar.` (56) |

Rekommendation: ämne A, preheader A. Ämnet säger beloppet, vilket är hela skälet till att mejlet finns. Ett påminnelsemejl som döljer summan är sämre än inget påminnelsemejl.

Första stycket (46 ord): `I morgon dras 79 kr för ytterligare en vecka med CV-veckan. Har du fått jobbet, eller är du klar för den här gången, säger du upp i ditt konto under Prenumeration. Det tar ett klick, du behöver inte ange skäl, och veckan du redan betalat gäller ut.`

Knapp: `Fortsätt veckan`. Sekundär länk: `Säg upp` (7)

**M16, uppsagt**

| Del | Alt A | Alt B |
|---|---|---|
| Ämne | `Uppsagt. Veckan gäller till söndag.` (35) | `Vi har tagit emot din uppsägning` (32) |
| Preheader | `Inget mer dras. Allt du skapat finns kvar att läsa och kopiera.` (63) | `Så här ser gratisnivån ut när veckan är slut.` (45) |

Rekommendation: ämne A, preheader A. A:s ämne besvarar båda frågorna användaren har i samma sekund: är det gjort, och vad händer med det jag redan betalat för.

Första stycket (45 ord): `Din uppsägning är registrerad och inget mer kommer att dras. CV-veckan gäller till och med söndag {datum}, så använd dagarna du betalat för. Därefter går kontot till gratisnivån. Allt du skapat finns kvar att läsa och kopiera, och du kan börja igen när du vill.`

Knapp: `Använd dagarna som är kvar`

Not: M16 ska aldrig innehålla ett återköpserbjudande, en rabatt eller en fråga om varför. Uppsägningsmejlet är ett kvitto, inget annat, och ett försök att vinna tillbaka kunden i just det mejlet är det som gör uppsägningar till klagomål.

---

### 8. Gratisnivåns nya gränser i appen

Raderna visas där spärren ligger, som `text-meta text-ink-3`, och säger vad som ingår utan att be om något. Max 50 tecken.

| Id | Plats | Alt A | Alt B | Rekommendation |
|---|---|---|---|---|
| GR1 | Mallgalleriet, över listan | `3 mallar ingår i gratisnivån` (28) | `Tre av 41 mallar är fria` (24) | A. Siffran 3 står i avsnitt 4 och matchar spärrtexten. |
| GR2 | Testhubben, per testtyp | `Grundnivån ingår i gratisnivån` (30) | `Grundnivån är fri, en gång per dygn` (35) | B. Kvoten hör ihop med nivån och ryms. |
| GR3 | CV-analysen, under poängen | `Poängen och det tyngsta fyndet ingår` (36) | `En analys och ett fynd ingår` (28) | A. Den räknar upp båda sakerna användaren faktiskt får och matchar PW3:s "Du har sett det tyngsta fyndet och din läsbarhetspoäng". B är kortare men "en analys" läser som en kvot, och kvoten hör hemma i betalväggen, inte i raden som säger vad som ingår. |
| GR4 | Brevflödet | `Ett brev i veckan ingår` (23) | `Ett brev per konto, sedan ett i veckan` (38) | B. Avsnitt 4 sätter båda gränserna, och A döljer den första. |
| GR5 | CV-export | `En nedladdning ingår i gratisnivån` (34) | `Ett CV kan laddas ner gratis` (28) | A. Samma formel som de andra raderna. |
| GR6 | Jobbcoachen | `Tio meddelanden ingår i gratisnivån` (35) | `Tio meddelanden per konto ingår` (31) | B. "Per konto" är den ändrade gränsen och måste stå. |
| GR7 | Jobbmatchningen | `De tre bästa träffarna ingår` (28) | `Tre av 25 träffar är öppna` (26) | A. Samma formel, och "bästa" är sant enligt rangordningen. |

Not: raderna får inte sluta med utropstecken, inte innehålla ordet "bara", och aldrig säga "gratis för alltid". Formeln är `{vad} ingår i gratisnivån`, och den ska se likadan ut överallt där den går att hålla.

---

### Sammanräkning

| Grupp | Id | Strängar |
|---|---|---|
| Paketnamn | N1 till N4 | 8 |
| Rad och punkter per paket | P1 till P6, P1a till P4c | 22 |
| Prissidan | PR1 till PR13 | 21 |
| Betalväggar | PW1 till PW7 | 56 |
| Fel spår | FS1 till FS3 | 17 |
| Kassan | K1 till K24 | 31 |
| Veckomejlen | M1 till M16 | 68 |
| Gratisnivån | GR1 till GR7 | 14 |
| **Totalt** | | **237** |

Alternativen är inräknade där två finns, eftersom båda måste stå kvar tills ägaren valt.

### Vad som återstår

Onboardingskärmarna, alltså spårvalet, de tre stegen per spår och nästa steg-raden på hemskärmen, skrivs i en andra runda när Fas 2A ligger. De texterna beror på hur många steg som visas åt gången och på om spårvalet ligger före eller efter kassan, så de kan inte skrivas mot mått som ännu inte finns.

## Fas 2C: text för onboardingskärmarna

Skriven 2026-09-22 av `svensk-ux-copywriter` mot Fas 2A:s tabell "Textytor för copywritern", T1 till T87. Samma regler som Fas 2B: inga talstreck, aldrig "Lås upp", aldrig "gratis för alltid", vi och du som subjekt, svenska facktermer, auktoritär och lugn ton. Alla längder räknade i tecken inklusive mellanslag, och satta mot 2A:s maxvärden.

Paketnamnen följer 2B: **CV-veckan, Testveckan, Allt-veckan, Allt-månaden.** Bestämd form är godkänd av ägaren 2026-09-22, beslut 6, och gäller hela dokumentet. Två längder på Allt tillkom med samma genomgång, **Allt-dagen** och **Allt-kvartalet**, och deras strängar saknas i det här avsnittet. De skrivs i samma omgång som Stripe-priserna döps.

Där två alternativ står är rekommendationen fetstil. Alternativ finns bara på rubriker, knappar och de strängar där valet styr ton snarare än fakta. Lagkravsstyrda strängar (T16, T21, T22, T23, T26, T62, T63, T82) har ett alternativ, eftersom innehållet är bundet av avsnitt 8.

---

### Flöde 1, skärm 1.1: spårvalet

| Id | Max | Sträng | Tecken |
|---|---|---|---|
| T1 | 42 | **`Vad ska du få gjort den här veckan?`** | 35 |
| T1 alt | 42 | `Vad är det som brådskar just nu?` | 31 |
| T2 | 90 | **`Valet styr vad vi visar först. Du kan ändra det när du vill i din profil.`** | 73 |
| T2 alt | 90 | `Vi lägger upp veckan efter ditt svar. Ändra det när som helst i profilen.` | 72 |
| T3 | 24 | **`Få ansökan klar`** | 15 |
| T3 alt | 24 | `Skriva CV och brev` | 18 |
| T4 | 80 | **`CV, full analys, mallar och brevet. En ansökan du kan skicka i kväll.`** | 68 |
| T4 alt | 80 | `Vi läser ditt CV, rättar det mot kravprofilen och skriver brevet.` | 64 |
| T5 | 30 | `CV-veckan, 79 kr i veckan` | 25 |
| T6 | 24 | **`Klara urvalstestet`** | 18 |
| T6 alt | 24 | `Träna inför testet` | 18 |
| T7 | 80 | **`Alla nivåer, tidsatt provläge och förklaring till varje fråga du missar.`** | 72 |
| T7 alt | 80 | `Matrislogik, verbalt och numeriskt, under samma tidspress som skarpt.` | 68 |
| T8 | 30 | `Testveckan, 79 kr i veckan` | 26 |
| T9 | 24 | **`Både och`** | 8 |
| T9 alt | 24 | `Allt, hela veckan` | 17 |
| T10 | 80 | **`Du slipper välja. Har du både ansökan och ett test framför dig, ta den här.`** | 74 |
| T10 alt | 80 | `För dig som har ansökan att skicka och ett urvalstest inbokat.` | 61 |
| T11 | 30 | `Allt-veckan, 99 kr i veckan` | 27 |
| T12 | 32 | **`Jag vet inte än`** | 15 |
| T12 alt | 32 | `Hoppa över, jag ser mig omkring` | 31 |
| T13 | 20 | **`Se vad det kostar`** | 17 |
| T13 alt | 20 | `Välj paket` | 10 |

Not till T3, T6 och T9: 2A ber om spårets namn som en handling, inte som produktnamn, och paketnamnet står i metaraden i stället. Det gör att skärmen läses som en fråga och prislistan ligger under. T9 "Både och" är avsiktligt kort och talspråkligt: det är det svar en människa faktiskt ger på frågan i T1, och kortet bär redan eyebrow "REKOMMENDERAS" som säljsignal.

Not till T12: "Jag vet inte än" är sant för många och gör hoppet till ett svar i stället för ett avhopp. Enligt 2A frågar vi igen en gång efter tre dagar, och då är den formuleringen konsekvent.

---

### Flöde 1, skärm 1.2: paketet och villkoren

Strängarna visas per valt paket. T15 och T17 till T21 har en uppsättning per paket.

| Id | Max | Sträng | Tecken |
|---|---|---|---|
| T14 | 42 | **`Så här ser veckan ut`** | 20 |
| T14 alt | 42 | `Det här köper du` | 16 |
| T15 | 24 | `CV-veckan` / `Testveckan` / `Allt-veckan` / `Allt-månaden` | 9 / 10 / 11 / 12 |
| T16, veckopaket | 60 | `Förnyas var sjunde dag tills du säger upp` | 41 |
| T16, Allt-månaden | 60 | `Förnyas var trettionde dag tills du säger upp` | 45 |
| T24 | 24 | **`Byt paket`** | 9 |
| T24 alt | 24 | `Välj ett annat paket` | 20 |
| T25, CV-veckan och Testveckan | 22 | **`Betala 79 kr`** | 12 |
| T25 alt | 22 | `Starta veckan, 79 kr` | 20 |
| T25, Allt-veckan | 22 | `Betala 99 kr` | 12 |
| T25, Allt-månaden | 22 | `Betala 149 kr` | 13 |
| T26 | 60 | `Kvittot skickas till din e-post direkt efter betalningen.` | 57 |

Ingår-raderna, fyra per paket, max 44:

| Id | Paket | Sträng | Tecken |
|---|---|---|---|
| T17 | CV-veckan | `Alla 41 CV-mallar` | 17 |
| T18 | CV-veckan | `Full CV-analys, alla fynd och poängen` | 37 |
| T19 | CV-veckan | `Personligt brev, skrivet och nedladdat` | 38 |
| T20 | CV-veckan | `CV-export utan tak, PDF och Word` | 32 |
| T17 | Testveckan | `Alla 19 tester, grundnivå till expert` | 37 |
| T18 | Testveckan | `Tidsatt provläge, automatisk inlämning` | 38 |
| T19 | Testveckan | `Förklaring till varje fråga` | 27 |
| T20 | Testveckan | `Hela din historik, inte bara senaste` | 36 |
| T17 | Allt-veckan | `Allt i CV-veckan och Testveckan` | 31 |
| T18 | Allt-veckan | `Alla 25 jobbträffar med skälen` | 30 |
| T19 | Allt-veckan | `Jobbcoachen utan tak` | 20 |
| T20 | Allt-veckan | `Bli upptäckt och LinkedIn-optimering` | 36 |
| T17 | Allt-månaden | `Allt i Allt-veckan, i trettio dagar` | 35 |
| T18 | Allt-månaden | `Billigare än fyra veckor i rad` | 30 |
| T19 | Allt-månaden | `Båda spåren, inget val att göra` | 31 |
| T20 | Allt-månaden | `Säg upp när som helst, ett klick` | 32 |

Ingår inte, T21, max 70. Bara spårpaketen har raden. Allt-veckan och Allt-månaden visar den inte alls, eftersom det inte finns något att räkna upp.

| Id | Paket | Sträng | Tecken |
|---|---|---|---|
| T21 | CV-veckan | `Ingår inte: testnivåer över grundnivån, jobbcoachen, Bli upptäckt.` | 66 |
| T21 | Testveckan | `Ingår inte: CV-mallar utöver de tre fria, full analys, brevet.` | 62 |

Statusrad och samtycke:

| Id | Max | Sträng | Tecken |
|---|---|---|---|
| T22 | 90 | `Nästa dragning {datum}. Säg upp när som helst i ditt konto, utan skäl.` | 70 |
| T23 | 110 | `Starta direkt. Jag förstår att ångerrätten på fjorton dagar inte gäller när innehållet påbörjats.` | 98 |

Not till T23: den är kortad mot K1 i Fas 2B, som var 112 tecken och alltså inte ryms här. "På min begäran" är struket, eftersom kryssrutan i sig är begäran och tidsstämpeln dokumenterar den. Innebörden är oförändrad. Blir texten föremål för juridisk granskning ska den granskas mot avsnitt 8, inte skrivas om fritt.

Not till T21: raden säger vad som inte ingår utan att peka mot uppköpet, enligt 2A. Jobbmatchningen är struken ur CV-veckans rad för att hålla 70 tecken, och den står i stället i T74 där en spårköpare faktiskt möter den.

---

### Flöde 1, skärm 1.3: gratisanvändaren utan köp

Tre uppsättningar, en per spår. Hoppade användaren över spårvalet visas ingen av dem.

| Id | Max | Spår | Sträng | Tecken |
|---|---|---|---|---|
| T27 | 70 | CV | **`Vi börjar med ditt CV, så ser du vad en rekryterare ser.`** | 56 |
| T27 alt | 70 | CV | `Du sa att ansökan brådskar. Då lägger vi CV:t överst.` | 53 |
| T27 | 70 | Test | **`Vi lägger testerna överst, så hittar du dem direkt.`** | 51 |
| T27 alt | 70 | Test | `Du sa att testet brådskar. Grundnivån ligger öppen.` | 51 |
| T28 | 60 | CV | `Du valde CV och brev, så det ligger först här` | 45 |
| T28 | 60 | Test | `Du valde urvalstester, så de ligger först här` | 44 |
| T29 | 20 | **`Se CV-veckan`** / `Se Testveckan` | 12 / 13 |
| T29 alt | 20 | `Se paketet` | 10 |

Not: T28 säger vad spåret betyder för vad hon ser, inte vad hon går miste om. Det är hela skälet till att 2A sparar spåret gratis, och raden får inte bli en säljrad.

---

### Flöde 2, skärm 2.1: efter köpet

| Id | Max | Sträng | Tecken |
|---|---|---|---|
| T30 | 44 | **`Du har CV-veckan till söndag`** | 28 |
| T30 alt | 44 | `CV-veckan är igång` | 18 |
| T30 | 44 | `Du har Testveckan till söndag` | 29 |
| T30 | 44 | `Du har Allt-veckan till söndag` | 30 |
| T30, månad | 44 | `Du har Allt-månaden till {datum}` | 32 |
| T31 | 130 | `79 kr dras var sjunde dag, nästa gång {datum}, tills du säger upp. Kvittot ligger i din mail. Dag 1 börjar nu.` | 110 |
| T31, köp efter 20 | 130 | `79 kr dras var sjunde dag, nästa gång {datum}, tills du säger upp. Kvittot ligger i din mail. Dag 1 börjar i morgon.` | 116 |
| T32, CV | 44 | `CV in, full analys, mall, nedladdning` | 37 |
| T32, test | 44 | `Diagnostest och din plan för veckan` | 35 |
| T33 | 40 | `Ungefär tjugo minuter` | 21 |
| T34 | 22 | **`Börja med dag 1`** | 15 |
| T34 alt | 22 | `Sätt igång` | 10 |
| T35 | 24 | **`Se hela veckan`** | 14 |
| T35 alt | 24 | `Se alla sju dagar` | 17 |
| T36 | 34 | `Kvitto och uppsägning` | 21 |

Not till T30: rubriken är den mening paketnamnen byggdes för i Fas 2B, och den säger både vad som är aktivt och hur länge, vilket 2A ber om i stället för "Tack".

Not till T31: 2A kräver att strängen säger när dag 1 räknas från. Den andra varianten visas vid köp efter klockan 20 svensk tid. Byggs den regeln inte ska bara den första varianten användas, aldrig en text som säger "i dag" när dagen är tjugo minuter lång.

---

### Flöde 2, skärm 2.2: tomma tillstånd

| Id | Max | Sträng | Tecken |
|---|---|---|---|
| T37 | 42 | **`Vi börjar med ditt CV`** | 21 |
| T37 alt | 42 | `Ladda upp det CV du har` | 23 |
| T38 | 90 | **`Ladda upp det du har, hur ofärdigt det än är. Vi läser det och visar vad som saknas.`** | 83 |
| T38 alt | 90 | `Vi läser CV:t mot kravprofilen och pekar ut vad en rekryterare fastnar på.` | 73 |
| T39 | 34 | `Välj fil eller dra hit den` | 26 |
| T40 | 46 | `PDF, Word eller text. Högst 10 MB.` | 34 |
| T41 | 34 | **`Jag har inget CV, bygg ett åt mig`** | 33 |
| T41 alt | 34 | `Bygg ett nytt i stället` | 23 |
| T42 | 22 | `Läs mitt CV` | 11 |
| T43 | 90 | `Vi använde dina tidigare testresultat, så du slipper göra om diagnosen.` | 70 |

Not till T40: 10 MB är en siffra jag inte kunnat verifiera mot uppladdningsrutten. Står ett annat tak i koden ska raden följa taket, och kan taket inte slås fast blir raden `PDF, Word eller text.` (21).

Not till T38: "hur ofärdigt det än är" är där för att den vanligaste orsaken att inte ladda upp är att användaren tycker att CV:t inte är redo. Den meningen tar bort skälet.

---

### Flöde 3: veckopanelen på hemskärmen

| Id | Max | Sträng | Tecken |
|---|---|---|---|
| T44, CV | 70 | `Dag 3 i CV-veckan. Brevet står på tur.` | 38 |
| T44, test | 70 | `Dag 3 i Testveckan. Verbalt resonemang står på tur.` | 51 |
| T49 | 34 | **`Hoppa till en annan dag`** | 23 |
| T49 alt | 34 | `Gör en annan dag i stället` | 26 |
| T50 | 16 | `Hela veckan` | 11 |

Not till T44: strängen är mönstret `Dag {n} i {paket}. {dagens sak} står på tur.` och genereras ur T45 per dag. Den ska aldrig säga hur många dagar som är kvar.

#### T45 till T48, CV-veckan

Dagsprogrammet är avsnitt 6:s. Titel max 40, text max 86, meta max 34, knapp max 22.

| Dag | T45, titel | T46, text | T47, meta | T48, knapp |
|---|---|---|---|---|
| 1 | `CV in, analys ut` (16) | `Ladda upp CV:t, läs hela analysen, välj en mall och ladda ner den.` (66) | `Ungefär tjugo minuter` (21) | `Ladda upp CV:t` (14) |
| 2 | `Rätta de tyngsta fynden` (23) | `Ta de tre översta fynden, ett i taget, och kör om analysen efteråt.` (66) | `Ungefär femton minuter` (22) | `Öppna analysen` (14) |
| 3 | `Brevet till annonsen` (20) | `Klistra in annonsen du sökte, så läser vi kravprofilen och skriver.` (67) | `Ungefär tio minuter` (19) | `Skriv brevet` (12) |
| 4 | `En mall till, för en annan roll` (31) | `Samma innehåll, annat uttryck. En stramare mall eller en öppnare.` (65) | `Under fem minuter` (17) | `Välj en ny mall` (15) |
| 5 | `Läsbarheten mot systemen` (24) | `Vi visar vad som sänker poängen. Oftast tabeller, kolumner eller grafik.` (71) | `Ungefär tio minuter` (19) | `Se läsbarhetspoängen` (20) |
| 6 | `LinkedIn mot samma CV` (21) | `Ny rubrik, ny om mig-text och kompetenserna som bör ligga överst.` (64) | `Ungefär femton minuter` (22) | `Optimera profilen` (17) |
| 7 | `Veckan sammanställd` (19) | `Vad du skickat, vad du laddat ner och vad som står kvar till nästa vecka.` (72) | `Under fem minuter` (17) | `Se sammanställningen` (20) |

#### T45 till T48, Testveckan

| Dag | T45, titel | T46, text | T47, meta | T48, knapp |
|---|---|---|---|---|
| 1 | `Diagnos och plan` (16) | `Grundnivå i varje testtyp, sedan lägger vi din träningsplan för veckan.` (70) | `Ungefär tjugo minuter` (21) | `Gör diagnostestet` (17) |
| 2 | `Din svagaste typ, en nivå upp` (29) | `Avancerad nivå där du tappade mest, med förklaring till varje fråga.` (68) | `Ungefär tjugo minuter` (21) | `Kör avancerad nivå` (18) |
| 3 | `Verbalt, med klockan på` (23) | `Samma tidspress som i ett skarpt urval, med automatisk inlämning.` (65) | `Tjugofem minuter, tidsatt` (25) | `Starta testet` (13) |
| 4 | `Numeriskt, tidsatt` (18) | `Tabeller och diagram under tidspress. Läs frågan före tabellen.` (63) | `Tjugofem minuter, tidsatt` (25) | `Starta testet` (13) |
| 5 | `Expertnivå i din starkaste typ` (30) | `Här flyttar du dig från godkänt till särskiljande i ett tätt urval.` (67) | `Ungefär tjugo minuter` (21) | `Kör expertnivån` (15) |
| 6 | `Fullt prov, skarp tidspress` (27) | `Alla testtyper i följd, inga pauser, automatisk inlämning. Sitt ostört.` (71) | `Fyrtio minuter, tidsatt` (23) | `Starta provet` (13) |
| 7 | `Din utveckling över veckan` (26) | `Alla sessioner i en kurva, per testtyp. Var du började och var du landade.` (73) | `Under fem minuter` (17) | `Se din kurva` (12) |

Not till T47: tiderna på dag 3, 4 och 6 i testspåret är de enda ställena där meta anger en exakt siffra i stället för "ungefär", eftersom tidsatta prov har en faktisk tidsgräns. Stämmer inte 25 och 40 minuter mot provlägets inställningar ska siffrorna följa koden, aldrig tvärtom.

#### Avklarad dag, T51 till T54

T51 och T52 har en uppsättning per dag och spår. Mönstret är `{vad som blev gjort}` och `{vad som skapades} finns under {var}`.

| Id | Max | Exempel, CV dag 1 | Exempel, test dag 1 |
|---|---|---|---|
| T51 | 40 | `Dag 1 klar` (10) | `Dag 1 klar` (10) |
| T51 alt | 40 | `CV:t är uppe och analyserat` (27) | `Diagnosen är gjord` (18) |
| T52 | 60 | `Ditt CV och mallen finns under Mina CV.` (39) | `Din träningsplan finns under Tester.` (36) |
| T53 | 26 | **`Vidare till dag 2`** (17) | `Vidare till dag 2` (17) |
| T53 alt | 26 | `Fortsätt med fynden` (19) | `Fortsätt med nivå 2` (19) |
| T54 | 26 | **`Klart för i dag`** (15) | `Klart för i dag` (15) |
| T54 alt | 26 | `Jag fortsätter senare` (21) | `Jag fortsätter senare` (21) |

**Rekommendation för T51: alternativet, alltså den dagsspecifika formuleringen.** "Dag 1 klar" är en position, och positionen står redan i nodraden ovanför. Kvitteringsläget är veckans enda belöningsögonblick enligt 2A, och då ska raden säga vad som blev gjort, inte vad numret var. Det betyder fjorton T51-strängar, en per dag och spår, byggda på mönstret `{det som blev gjort} är {tillstånd}`.

**Rekommendation för T53: alternativet.** 2A ber om nästa dag med dagens sak nämnd om den ryms, och den ryms på 26 tecken för de flesta dagar. Faller en dag utanför används `Vidare till dag {n}` för just den dagen.

#### Dag 7, T55 till T63

| Id | Max | Sträng | Tecken |
|---|---|---|---|
| T55, CV | 44 | **`Så här såg din vecka ut`** | 23 |
| T55 alt, CV | 44 | `Sju dagar, och det här blev gjort` | 33 |
| T55, test | 44 | `Så här flyttade du dig på sju dagar` | 35 |
| T56 | 12 | `brev` | 4 |
| T57 | 12 | `CV` | 2 |
| T58 | 12 | `mallar` | 6 |
| T59 | 12 | `dagar` | 5 |
| T56, test | 12 | `sessioner` | 9 |
| T57, test | 12 | `testtyper` | 9 |
| T58, test | 12 | `prov` | 4 |
| T59, test | 12 | `dagar` | 5 |
| T60, CV | 100 | `Dag 4 och 6 står kvar. Mallen för en annan sorts roll, och LinkedIn mot samma CV.` | 80 |
| T60, test | 100 | `Dag 5 står kvar. Expertnivån i din starkaste typ, där marginalen uppåt finns.` | 76 |
| T61 | 26 | **`Se vecka 2`** | 10 |
| T61 alt | 26 | `Fortsätt med vecka 2` | 20 |
| T62 | 26 | `Avsluta prenumerationen` | 23 |
| T63 | 80 | `79 kr dras {datum}. Säg upp i ditt konto om du är klar.` | 55 |

Not till T61: 2A är tydlig med att förnyelsefrågan inte är ett köpbeslut, eftersom prenumerationen förnyas automatiskt. Därför "Se vecka 2" och inte "Fortsätt", som antyder ett val användaren inte gör. Alternativet "Fortsätt med vecka 2" är sämre av exakt det skälet men står kvar ifall ägaren vill ha det varmare.

Not till T60: mönstret är `{vilka dagar som står kvar}. {vad de innehåller}.` Är alla sju dagar gjorda blir raden i stället `Hela veckan är gjord. Vecka 2 börjar om med ett nytt CV eller en ny annons.` (76) för CV-spåret och `Hela veckan är gjord. Vecka 2 går djupare i den typ du tappar mest på.` (69) för testspåret.

Not till T62: lagkrav enligt avsnitt 8, och 2A säger att den inte får mildras. Därför "Avsluta prenumerationen" och inte "Avsluta" eller "Hantera prenumerationen", som båda döljer vad länken gör.

#### Hoppa-arket, T64 till T72

| Id | Max | Sträng | Tecken |
|---|---|---|---|
| T64 | 30 | **`Veckans sju dagar`** | 17 |
| T64 alt | 30 | `Välj en dag` | 11 |
| T65 | 80 | **`Ordningen är ett förslag. Ta vilken dag du vill, när du vill.`** | 60 |
| T65 alt | 80 | `Ingen dag är låst. Gör dem i den ordning som passar ditt sök.` | 60 |

Dagsrubrikerna, kortform av T45, max 40. En uppsättning per spår.

| Id | Dag | CV-veckan | Testveckan |
|---|---|---|---|
| T66 | 1 | `CV in, analys ut` (16) | `Diagnos och plan` (16) |
| T67 | 2 | `Rätta de tyngsta fynden` (23) | `Svagaste typen, en nivå upp` (27) |
| T68 | 3 | `Brevet till annonsen` (20) | `Verbalt, tidsatt` (16) |
| T69 | 4 | `En mall till` (12) | `Numeriskt, tidsatt` (18) |
| T70 | 5 | `Läsbarheten mot systemen` (24) | `Expertnivå i starkaste typen` (28) |
| T71 | 6 | `LinkedIn mot samma CV` (21) | `Fullt prov, skarp tidspress` (27) |
| T72 | 7 | `Veckan sammanställd` (19) | `Din utveckling över veckan` (26) |

---

### Flöde 4: fel spår i taket

| Id | Max | Sträng | Tecken |
|---|---|---|---|
| T73 | 70 | **`Välj mall, fyll den med ditt CV och ladda ner den som PDF.`** | 58 |
| T73 alt | 70 | `41 mallar, alla läsbara för rekryteringssystem. Välj och ladda ner.` | 67 |
| T74, Testveckan | 80 | **`Du har Testveckan, som ger alla tester och nivåer. Mallarna ligger i CV-spåret.`** | 78 |
| T74 alt, Testveckan | 80 | `Testveckan ger alla nivåer och provläget. Mallar och brev ligger i CV-spåret.` | 76 |
| T74, CV-veckan | 80 | `Du har CV-veckan, som ger mallar, analys och brev. Testerna ligger i testspåret.` | 79 |
| T75 | 20 | **`Så får du dem`** | 13 |
| T75 alt | 20 | `Se Allt-veckan` | 14 |

Not till T74: 2A ber uttryckligen om vad paketet innehåller, inte vad det saknar, och ordningen i meningen gör jobbet. Första satsen bekräftar att hon köpt rätt sak, andra satsen placerar det hon just tryckte på någon annanstans. Ingen av dem är en uppmaning.

Mallkortens meta, T76 till T78, max 24 per rad. Mönstret är `{mallens namn}` följt av `· {tillhörighet}` när mallen inte ingår i användarens paket.

| Id | Läge | Sträng | Tecken |
|---|---|---|---|
| T76 | Ingår i paketet | `{Mallnamn}` | beror på namnet |
| T77 | Ingår i gratisnivån | `{Mallnamn} · ingår` | namn + 8 |
| T78 | Ingår inte | `{Mallnamn} · CV-spåret` | namn + 12 |

Not: mallnamnen får då vara högst 12 tecken för att raden ska hålla 24. Är de längre bryts tillhörigheten ut till en egen rad under namnet, i samma `text-meta text-ink-3`, hellre än att namnet förkortas. Ett avkortat mallnamn är värre än två rader.

Kortet i arket, T79 till T84:

| Id | Max | Sträng | Tecken |
|---|---|---|---|
| T79 | 44 | **`Du ville ladda ner den här mallen`** | 33 |
| T79 alt | 44 | `Mallen ligger i CV-spåret` | 25 |
| T80 | 110 | **`Testveckan är rätt paket för testerna. Byter du till Allt-veckan öppnas mallarna, brevet och analysen.`** | 104 |
| T80 alt | 110 | `Du har testspåret, och det gör sitt jobb. Allt-veckan lägger CV-spåret ovanpå, från och med nu.` | 95 |
| T81 | 30 | `Mellanskillnad, 20 kr` | 21 |
| T82 | 70 | `Dagarna du redan betalat för räknas av. Veckan fortsätter som förut.` | 68 |
| T83 | 26 | **`Byt till Allt-veckan`** | 20 |
| T83 alt | 26 | `Öppna mallarna` | 14 |
| T84 | 20 | `Stäng` | 5 |

Not till T81: 2A är tydlig med att bara mellanskillnaden får stå, aldrig hela priset. Räknas beloppet fram i klienten ska strängen vara `Mellanskillnad, {n} kr`. Går beloppet inte att räkna fram före Stripe-sidan blir raden `Du betalar bara mellanskillnaden` (32), vilket överskrider 30 och då måste bli `Bara mellanskillnaden` (21).

Not till T83: "Byt till Allt-veckan" väljs framför "Öppna mallarna" därför att knappen leder till en betalning, och en knapp som leder till en betalning måste säga det. Öppningen är resultatet, inte handlingen.

Efter uppgraderingen, T85 till T87:

| Id | Max | Sträng | Tecken |
|---|---|---|---|
| T85 | 40 | **`Du har Allt-veckan nu`** | 21 |
| T85 alt | 40 | `Mallarna är öppna` | 17 |
| T86 | 90 | `99 kr dras var sjunde dag från {datum}. Veckan fortsätter på samma dag som förut.` | 80 |
| T87 | 26 | **`Ladda ner mallen`** | 16 |
| T87 alt | 26 | `Tillbaka till mallen` | 20 |

Not till T85: rubriken följer samma form som T30 och Fas 2B:s K11, alltså "Du har {paket}". Det är den enda meningen i produkten som säger vad användaren äger, och den ska se likadan ut överallt.

---

### Sammanräkning, Fas 2C

| Grupp | Id | Strängar |
|---|---|---|
| Spårvalet | T1 till T13 | 27 |
| Paketskärmen | T14 till T26 | 39 |
| Hemskärm utan köp | T27 till T29 | 10 |
| Efter köpet | T30 till T36 | 18 |
| Tomma tillstånd | T37 till T43 | 12 |
| Veckopanelen, ramen | T44, T49, T50 | 7 |
| Dagstexter, två spår | T45 till T48 | 56 |
| Avklarad dag | T51 till T54 | 8 |
| Dag 7 | T55 till T63 | 22 |
| Hoppa-arket | T64 till T72 | 18 |
| Fel spår | T73 till T84 | 19 |
| Efter uppgradering | T85 till T87 | 5 |
| **Totalt** | | **241** |

Alternativen är inräknade där två finns. T51 och T53 räknas som två strängar var i tabellen ovan, men rekommendationen innebär fjorton T51-strängar och upp till fjorton T53-strängar när de skrivs per dag och spår. Det arbetet är mekaniskt och följer mönstren angivna ovan.

### Öppna punkter som kräver kodkontroll före införandet

1. **T40, filstorleken.** 10 MB är inte verifierad mot uppladdningsrutten. Kontrolleras eller stryks.
2. **T47 på testdag 3, 4 och 6.** 25 och 40 minuter måste stämma mot provlägets faktiska tidsgränser, som byggs i släpp 1.
3. **T76 till T78, mallnamnen.** Raden håller 24 tecken bara om mallnamnen är högst 12. Är de längre gäller tvåradsregeln ovan.
4. **T81, mellanskillnaden.** 20 kr följer priserna 79 och 99, fastställda av ägaren 2026-09-22. Punkten är därmed avgjord och strängen står.

Tillkommet med ägarens beslut 2026-09-22, båda kräver nya strängar som inte finns i det här avsnittet:

5. **Allt-dagen och Allt-kvartalet.** Längdvalet på Allt behöver egna strängar i T15, T16, T20, T25 och T30, alltså paketnamn, förnyelserad, ingår-punkter, knapptext och bekräftelserubrik. Allt-dagen bär klockslag i stället för datum och har ingen förnyelse, så dess rad blir en sluttidsrad enligt avsnitt 8.
6. **CV-analysens nya gräns.** T-strängar som beskriver gratisanalysen måste följa PW3 och GR3 i sin nya form: poängen, antalet fynd och det tyngsta fyndet, aldrig "tre fynd".

---

## Fas 2D: prissidan och Börja gratis

Skriven 2026-09-22 av UX-rollen efter ägarens två tillägg samma dag. Bygger på Fas 2A (flöden och skärmar), Fas 2B (strängarna P-, PR- och GR-serien) och ägarens beslut 1 till 6 överst i dokumentet. Fyra delar: spårvalsskärmen med Börja gratis som riktigt val, publika prissidan, inloggade prissidan, och mätningen.

Ägarens ord var "en popup med olika användartyper när de loggat in, där de kan välja paket eller om de vill börja gratis". Det är exakt vad vi bygger. Skillnaden mot ordet popup är teknisk, inte innehållslig, och står i avsnittet nedan.

Regler som förut: mobile first med Pixel 7 412 px som primär och 1280 som sekundär, en primär handling per skärm, högst tre accenter, ingen Sparkles, svenska facktermer, inga talstreck.

---

### 1. Skärm 1.1 justerad: Börja gratis som fullvärdigt val

#### Varför ägarens popup byggs som ett helskärmssteg

Kort, för att ägaren ska känna igen sin idé i det vi bygger.

En modal på mobil är en panel ovanpå en sida användaren inte får röra. Tre saker går sönder med den formen: iOS lägger tangentbordet över fasta element så en knapp i modalens fot kan hamna under tangentbordet, bakgrundssidan scrollar med om overflow inte låses vilket ger den där klibbiga känslan, och en modal har alltid ett kryss uppe i hörnet som säger "det här är valfritt och kan stängas". Det sista är det dyraste. Frågan vi ställer är inte valfri, den är produktens första fråga.

Ett helskärmssteg i `FlowShell` är samma sak för användaren: hon loggar in, hon får en fråga som fyller skärmen, hon svarar, hon kommer vidare. Skillnaden är att steget får full höjd, sticky fot som klarar tangentbordet, en riktig adress som går att länka till och komma tillbaka till, och att den går att mäta som en sida. Den känns som en popup och beter sig som en sida. Det är rätt kombination.

Beslut: steget ligger på `/start`, öppnas direkt efter första inloggningen, och visas en gång. Har användaren svarat en gång ser hon det aldrig igen om hon inte själv byter spår under Profil.

#### Formen på Börja gratis: sekundärknapp i foten, inte ett fjärde kort

Två alternativ övervägdes.

**Alternativ A, ett fjärde lägre kort.** "Börja gratis" som ett fjärde `ChoiceCard` under de tre. Avvisas. Ett fjärde kort i samma radiogrupp gör gratis till ett paket bland fyra, och då tävlar det på paketens villkor: pris, innehåll, punktlista. Det förlorar den tävlingen varje gång, och det ska det inte, för gratis är inte ett sämre paket utan ett annat sätt att börja. Dessutom spränger ett fjärde kort skärmen på 412 px, så den primära knappen hamnar under vecket.

**Alternativ B, sekundär knapp i FlowShell-foten bredvid primären.** Väljs. Foten får två knappar: primär ink till vänster i läsordningen (Fortsätt med valt paket) och en sekundär med kant till höger (Börja gratis). Båda 44 px, båda alltid synliga, båda alltid tryckbara. Ingen är dold bakom en scroll, ingen är en textlänk i grått som läses som ett avslut.

Det viktiga: **Börja gratis kräver inte att man valt ett kort först.** Den fungerar direkt vid inladdning. Väljer användaren ett kort och sedan Börja gratis sparas spåret ändå, och hon får gratisnivån i det spåret. Det är hela poängen med att spara `onboarding_track` oberoende av `premium_scope`.

```
┌──────────────────────────────────────────┐
│ ✕                                        │  FlowShell topprad
│▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  framstegslinje 1/2
├──────────────────────────────────────────┤
│                                          │
│  STEG 1 AV 2                             │
│  [T1]                                    │  text-fraga
│  [T2]                                    │  text-sm ink-2
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ┌────┐  [T3]   CV-veckan           │  │  ChoiceCard plain
│  │ │ CV │  [T4]   P1A-raden           │  │  IkonCV 24 ink-2
│  │ └────┘  [T5]   79 kr i veckan      │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ┌────┐  [T6]   Testveckan          │  │  ChoiceCard plain
│  │ │ ⧉  │  [T7]   P2A-raden           │  │  IkonAnalys 24 ink-2
│  │ └────┘  [T8]   79 kr i veckan      │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ┌──────┐  REKOMMENDERAS         ◉  │  │  ChoiceCard featured
│  │ │ ▨▨▨  │  [T9]   Allt-veckan       │  │  MarginPlate + IlluPlattaPremium
│  │ │ ▨▨▨  │  [T10]  P3A-raden         │  │
│  │ └──────┘  [T11]  från 49 kr        │  │  "från", fyra längder finns
│  └────────────────────────────────────┘  │
│                                          │
├──────────────────────────────────────────┤
│ ╔═══════════════════╗ ┌────────────────┐ │  FlowShell fot, två knappar
│ ║      [T13]        ║ │    [D1]        │ │  primär ink  |  sekundär kant
│ ╚═══════════════════╝ └────────────────┘ │  vardera ca 48 % bredd, gap 12
│  [D2]                                    │  text-meta ink-3, en rad under
└──────────────────────────────────────────┘
```

| Element | Komponent | Not |
|---|---|---|
| Ram och fot | `FlowShell { step: 1, totalSteps: 2, primaryLabel, onPrimary, primaryDisabled, footerSecondary }` | `footerSecondary` finns redan i propsen och tar en ReactNode. Ingen ny prop behövs. |
| Börja gratis | sekundär knapp: `h-11 rounded-lg border border-kant-stark bg-panel text-sm font-medium text-ink-1` | Aldrig textlänk, aldrig disabled |
| [D2] | `text-meta text-ink-3`, en rad under fotknapparna | Säger vad gratis ger, så knappen inte är ett hopp i mörkret |
| Metaraden på Allt-kortet | "från 49 kr" | Ägarens beslut 4: Allt har fyra längder. Kortet får inte säga 99 när Allt-dagen finns. Längden väljs på steg 2. |

Orange-räkning: framstegslinjen (1), "REKOMMENDERAS" i accent-ink (2), marginalplattan (3). Exakt tre. Sekundärknappen är kant-stark och ink, alltså ingen accent.

Fotens två knappar på 412 px: två knappar i 48 procent bredd vardera med 12 px mellanrum ger cirka 186 px per knapp, vilket rymmer både [T13] (max 20 tecken) och [D1] (max 16). Blir någon av texterna längre staplas de i stället, primär överst, och foten växer till 104 px. Det är tillåtet, men texterna ska skrivas så att det inte behövs.

#### Skärm 1.1b: gratisanvändarens spårfråga

Trycker användaren Börja gratis utan att ha valt kort ska hon ändå få frågan om riktning. Men den ska då ställas som vad hon vill göra, inte som vilket paket hon inte köpte. Skärmen byter därför fråga och tappar priserna helt.

```
┌──────────────────────────────────────────┐
│ ←                                        │  FlowShell onBack
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  framstegslinjen full: sista steget
├──────────────────────────────────────────┤
│  SISTA STEGET                            │  text-steg ink-3
│  [D3]                                    │  text-fraga: vad vill du göra
│  [D4]                                    │  text-sm ink-2
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ┌────┐  [D5]                       │  │  ChoiceCard plain, CV
│  │ │ CV │  [D6]                       │  │  ingen pris-meta
│  │ └────┘                             │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ┌────┐  [D7]                       │  │  ChoiceCard plain, tester
│  │ │ ⧉  │  [D8]                       │  │
│  │ └────┘                             │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ┌────┐  [D9]                       │  │  ChoiceCard plain, vet inte än
│  │ │ ◇  │  [D10]                      │  │  IkonHem 24 ink-2
│  │ └────┘                             │  │
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  ╔══════════════════════════════════╗    │
│  ║            [D11]                 ║    │  primär: till hemskärmen
│  ╚══════════════════════════════════╝    │
└──────────────────────────────────────────┘
```

Tre val, inte två. "Vet inte än" finns för att den som verkligen inte vet ska kunna svara sant i stället för att gissa, och ett gissat spår är sämre data än inget spår. `onboarding_track` blir då `null` och hemskärmen står i sitt allmänna läge, precis som i Fas 2A.

Ingen marginalplatta på den här skärmen, inget featured-kort, ingen "Rekommenderas". Vi säljer ingenting här. Orange-räkning: framstegslinjen (1). Ett av tre.

#### Vad spåret gör för gratisanvändaren

Tre konkreta saker, och de måste byggas i släpp 1 tillsammans med `onboarding_track`, annars är frågan tom:

1. **Hemskärmens ordning.** CV-spåraren får CV-raderna överst i Pågår nu och CV-handlingen som Nästa handling. Testspåraren får testerna. Enligt Fas 2A skärm 1.3.
2. **Betalväggarnas förslag.** PW1 till PW7 i Fas 2B föreslår ett paket i den primära knappen. Med spår känt föreslår de rätt paket direkt. Utan spår föreslår de Allt-veckan, vilket är sämre: det är dyrast och känns som en uppförsäljning.
3. **Gratisnivåns första handling.** Den tomma hemskärmen för en ny gratisanvändare pekar på en sak, och vilken sak det är styrs av spåret: ladda upp ett CV, eller gör ett test.

#### Händelser, del 1

| När | Händelse | Egenskaper |
|---|---|---|
| Skärm 1.1 renderas | `pricing_viewed` | `surface: 'onboarding_track'`, `variant: 'tre_kort'` |
| Kort valt och primär tryckt | `track_selected` | `track`, `surface: 'onboarding'`, `intent: 'purchase'` |
| Börja gratis tryckt utan valt kort | ingen händelse än | Spåret är inte känt förrän 1.1b |
| Börja gratis tryckt med valt kort | `track_selected` | `track`, `surface: 'onboarding'`, `intent: 'free'` |
| Val på 1.1b och primär tryckt | `track_selected` | `track` eller `track: null`, `intent: 'free'` |
| Steget avslutat på något sätt | `onboarding_step_completed` | `step: 'track_choice'`, `index: 0` |

`intent` är ny egenskap och är hela poängen med mätningen: den skiljer den som valde spår för att köpa från den som valde spår för att börja gratis. Utan den kan vi inte räkna mätpunkt 1 i avsnitt 6 ärligt.

#### Acceptanskriterier, del 1

Pixel 7, 412 px, nytt konto, riktig webbläsare:

1. Efter första inloggningen öppnas `/start`. Hemskärmen syns inte först.
2. Båda fotknapparna syns utan scroll, samtidigt som minst två valkort.
3. Börja gratis är tryckbar direkt vid inladdning, utan att något kort valts.
4. Väljer man Allt-kortet och trycker primären kommer längdvalet (Segment med fyra lägen) på steg 2, enligt noten vid Fas 2A skärm 1.2.
5. Trycker man Börja gratis utan valt kort kommer skärm 1.1b, och den visar inga priser.
6. "Vet inte än" leder till hemskärmen i allmänt läge, utan spårrad.
7. Väljer man CV på 1.1b står CV-raderna överst på hemskärmen vid nästa laddning.
8. Steget visas inte igen vid andra inloggningen.
9. Tangentbord: piltangent i radiogruppen, Tabb till primär, Tabb till sekundär. Fokusringen är orange och syns på båda.
10. Räkna orange: tre på 1.1, ett på 1.1b.
11. Med iOS-tangentbord uppe (gäller inte här men testas ändå på 1.1b) ligger foten kvar ovanför tangentbordet, inte under.

Desktop 1280: centrerad kolumn max 560 px, korten staplade, fotens två knappar auto-breda och högerställda med primären sist i läsordningen.

---

### 2. Prissidan, publik

Ersätter dagens `/priser` i `src/app/(public)/priser/`. Sex sektioner, i den här ordningen, och ordningen är argumentet: först vad man väljer mellan, sedan vad det kostar, sedan vad gratis ger, sedan detaljerna, sedan frågorna, sist förtroendet.

Publika sidor får vara rikare än inloggat läge (designsystemets avsnitt 12), men rikedomen ska komma ur typografi, vitrymd och illustration, inte ur nya färger. Tokens är Tråden-tokens: `mark` som sidbakgrund, `panel` på korten, `ink-1` på knappar, accent bara som linje. Illustrationerna följer scenreglerna i designsystemets avsnitt 7: högst tre element, ett lutande, en liten fylld accentform.

#### Vad besökaren ska förstå på fem sekunder

Tre saker, i den ordningen, och sidan ritas så att just de tre syns först på 412 px:

1. Det finns ett val att göra, och valet är spår.
2. Man betalar per vecka.
3. Gratis finns.

Därför ligger `[D12]`, en enradig spårväljare, direkt under ingressen och ovanför korten. Den är ett `Segment` med tre lägen: CV, Tester, Allt. Den filtrerar inte bort korten, den scrollar till rätt kort och markerar det. Skälet: en besökare som klickar CV ska se sitt kort direkt, men de andra två ska inte försvinna, för då vet hon inte vad hon väljer bort.

#### Skärm 2.1: publika prissidan, Pixel 7

```
┌──────────────────────────────────────────┐
│  [PR1A]                                  │  h1, text-h1 (publik: 32/36)
│  Välj spåret du söker på. Betala          │
│  för veckan.                             │
│                                          │
│  [PR2A]                                  │  ingress, text-sm ink-2
│                                          │
│  ┌──────────┬──────────┬──────────┐      │  Segment, tre lägen
│  │   CV     │  Tester  │   Allt   │      │  [D12a] [D12b] [D12c]
│  └──────────┴──────────┴──────────┘      │  valt: border-ink-1 shadow-val
├──────────────────────────────────────────┤
│  [PR3B]  Välj ditt paket                 │  text-sm font-medium ink-3
│                                          │
│  ┌────────────────────────────────────┐  │  kort 1: CV-veckan
│  │  ┌────┐                            │  │  panel border-kant p-5
│  │  │ CV │   [N1] CV-veckan           │  │  IkonCV 24 ink-2
│  │  └────┘                            │  │
│  │  79 kr                             │  │  text-tal tabular-nums ink-1
│  │  [D13]  i veckan, förnyas           │  │  text-meta ink-3
│  │                                    │  │
│  │  [P1A]                             │  │  text-sm ink-2, en rad
│  │                                    │  │
│  │  ✓ [P1a]  Alla 41 CV-mallar        │  │  Check 20 ink-2
│  │  ✓ [P1b]  Full CV-analys...        │  │
│  │  ✓ [P1c]  Personligt brev...       │  │
│  │                                    │  │
│  │  ╔══════════════════════════════╗  │  │
│  │  ║          [D14]               ║  │  │  primär ink, full bredd
│  │  ╚══════════════════════════════╝  │  │
│  │                                    │  │
│  │  [P5]  Testerna över grundnivå...  │  │  text-meta ink-3, ingår inte
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │  kort 2: Testveckan
│  │  ... samma form, [N2] [P2A]        │  │  P2a till P2c, [P6] underst
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │  kort 3: Allt
│  │  REKOMMENDERAS                     │  │  text-steg accent-ink
│  │  ┌──────┐                          │  │  MarginPlate + IlluPlattaPremium
│  │  │ ▨▨▨  │  [N3] Allt               │  │  sidans enda platta
│  │  └──────┘                          │  │
│  │  ┌─────┬─────┬─────┬─────┐         │  │  Segment, fyra längder
│  │  │ Dag │Veck.│Mån. │Kvart│         │  │  Vecka förvald
│  │  └─────┴─────┴─────┴─────┘         │  │
│  │  99 kr                             │  │  text-tal, följer valt läge
│  │  [D15]  i veckan, förnyas           │  │  följer valt läge
│  │                                    │  │
│  │  [P3A]                             │  │  rad, följer valt läge
│  │  ✓ [P3a] ✓ [P3b] ✓ [P3c]           │  │  tre punkter, följer läget
│  │                                    │  │
│  │  ╔══════════════════════════════╗  │  │
│  │  ║          [D16]               ║  │  │  primär, texten följer läget
│  │  ╚══════════════════════════════╝  │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ● [PR7A]                                │  uppsägningsrad
├──────────────────────────────────────────┤
│  [PR4A]  Vad du kan göra utan att betala │  text-sm font-medium ink-3
│  ┌────────────────────────────────────┐  │
│  │  ┌──────┐                          │  │  panel, insunken ton
│  │  │ ▨▨   │  [GR-raden ur 2B]        │  │  ikon 24, ingen platta
│  │  └──────┘                          │  │
│  │  [D17]                             │  │  textlänk: skapa konto gratis
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  [PR5A]  Vad som ingår i vilket paket    │
│  [PR8]                                   │  ingress
│  ┌────────────────────────────────────┐  │
│  │ Funktion    │Gratis│ CV │Test│Allt │  │  tabell, overflow-x-auto
│  │─────────────┼──────┼────┼────┼─────│  │  sticky första kolumn
│  │ CV-mallar   │  3   │ 41 │ 3  │ 41  │  │  tal, inte bockar, där tal finns
│  │ CV-analys   │  1   │  ∞ │ 1  │  ∞  │  │
│  │ Läsbarhet   │  ·   │ ✓  │ ·  │ ✓   │  │  Check ink-2 / punkt ink-3
│  │ ...         │      │    │    │     │  │
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  [PR6A]  Frågor vi får om veckorna       │
│  ▸ [PR9]  Varför säljer ni en vecka...   │  accordion, 48 px rader
│  ▸ [PR10] Vad händer när veckan är slut? │  divide-y divide-kant
│  ▸ [PR11] Kan jag byta spår?             │
│  ▸ [PR12] Vad ingår utan att betala?     │
│  ▸ [PR13] Hur säger jag upp?             │
├──────────────────────────────────────────┤
│  ┌────────────────────────────────────┐  │  förtroenderad, panel
│  │  ⊙ [D18]   Uppsägning, ett klick    │  │  tre rader, ikon 24 ink-2
│  │  ⊡ [D19]   Kortbetalning via Stripe │  │  IkonSkold, IkonKrona, IkonHem
│  │  ⊞ [D20]   Priser i kronor, moms    │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

| Sektion | Komponenter | Not |
|---|---|---|
| Hero | egen markup, `text-h1` i publik skala | Ingen gradient, ingen hero-illustration. Rubriken är sidans bild. |
| Spårväljaren | `Segment { value, onChange, options, label }` ur shell | Scrollar till och markerar kortet, filtrerar aldrig bort |
| Tre paketkort | panel `rounded-xl border-kant bg-panel p-5` | Ersätter `PlanCards` för den här sidan. Stort tal ur designsystemet för priset. |
| Allt-kortets längdval | `Segment` med fyra lägen | Ägarens beslut 4. Valt läge i ink, räknas inte som accent. |
| Gratisraden | panel med `bg-insunken` inuti | Ett steg ner i djup: gratis är lägre, inte mindre |
| Jämförelsetabellen | `<table>` i `overflow-x-auto` | JSX-tabell, aldrig markdown. Första kolumnen sticky på mobil. |
| FAQ | accordion, `divide-y divide-kant`, 48 px rader | `details`/`summary` räcker, ingen ny komponent, ingen JS |
| Förtroenderaden | panel med tre rader, ikon 24 ink-2 | Lagkraven i avsnitt 8 i kortform |

Orange-räkning på 412 px, mätt i första skärmhöjden: spårväljarens fokusring räknas bara när den har fokus, alltså noll i vila. "REKOMMENDERAS" i accent-ink (1) och marginalplattan på Allt-kortet (2) ligger under vecket och räknas i sin egen skärmhöjd. Ingen skärmhöjd på sidan kommer över två. Det är medvetet lågt: en prissida med tre accenter per skärm i sex sektioner blir orange, och då slutar accenten betyda något.

**Ordningen på korten är CV, Tester, Allt, och Allt ligger sist.** Samma skäl som på spårvalsskärmen: uppköpet läses efter alternativen. Det bryter mot konventionen att sätta det dyraste i mitten, och det är avsiktligt. Vi säljer inte "mest", vi säljer "rätt".

#### Skärm 2.2: publika prissidan, desktop 1280

```
┌────────────────────────────────────────────────────────────────────┐
│                          [PR1A]                                    │  centrerad, max 720
│                          [PR2A]                                    │
│                   ┌──────┬────────┬──────┐                         │  Segment, centrerad
│                   │  CV  │ Tester │ Allt │                         │
│                   └──────┴────────┴──────┘                         │
├────────────────────────────────────────────────────────────────────┤
│  [PR3B] Välj ditt paket                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │  tre kolumner
│  │ [N1]         │  │ [N2]         │  │ REKOMMENDERAS│              │  gap 24
│  │ 79 kr        │  │ 79 kr        │  │ ▨ [N3]       │              │  lika höjd via
│  │ [P1A]        │  │ [P2A]        │  │ ┌──┬──┬──┬──┐│              │  grid, inte flex
│  │ ✓ ✓ ✓        │  │ ✓ ✓ ✓        │  │ │D │V │M │K ││              │
│  │ ╔══════════╗ │  │ ╔══════════╗ │  │ └──┴──┴──┴──┘│              │
│  │ ║  [D14]   ║ │  │ ║  [D14]   ║ │  │ 99 kr        │              │
│  │ ╚══════════╝ │  │ ╚══════════╝ │  │ ✓ ✓ ✓        │              │
│  │ [P5]         │  │ [P6]         │  │ ╔══════════╗ │              │
│  └──────────────┘  └──────────────┘  │ ║  [D16]   ║ │              │
│                                      │ ╚══════════╝ │              │
│                    ● [PR7A]          └──────────────┘              │
├────────────────────────────────────────────────────────────────────┤
│  [PR4A]                                                            │
│  ┌──────────────────────────────┐  ┌────────────────────────────┐  │  två kolumner
│  │  gratisnivåns innehåll       │  │   96-scen, IlluArketLyfter │  │  scen till höger
│  └──────────────────────────────┘  └────────────────────────────┘  │  (designsystem 7.5)
├────────────────────────────────────────────────────────────────────┤
│  [PR5A] jämförelsetabell, full bredd max 1040, ingen scroll        │
├────────────────────────────────────────────────────────────────────┤
│  [PR6A] FAQ i två kolumner, tre frågor vänster, två höger          │
├────────────────────────────────────────────────────────────────────┤
│  förtroenderaden som tre kolumner                                  │
└────────────────────────────────────────────────────────────────────┘
```

Det enda som skiljer desktop från mobil i substans: korten står i tre kolumner, gratisnivån får en illustration i egen kolumn till höger (designsystemets scenregel 5 säger att scenen står ovanför texten på mobil och i egen kolumn på desktop), och jämförelsetabellen slipper horisontell scroll. Allt annat är samma innehåll i samma ordning.

Tre kolumner är tillåtet här men var det inte på spårvalsskärmen. Skillnaden: på prissidan har besökaren kommit för att jämföra priser, och en tabellartad uppställning hjälper. I onboardingen har användaren kommit för att komma igång, och då är en prislista fel fråga.

#### Prissidan ska fungera utan JavaScript

Den är publik och SEO-bärande. Korten, tabellen, FAQ och förtroenderaden är serverrenderad HTML. Spårväljaren och Allt-kortets längdval är det enda som behöver JS, och utan JS visar Allt-kortet sitt veckoläge, vilket är det förvalda. Ingen besökare ser en tom sida.

FAQ byggs som `details`/`summary`, så de fem svaren står i HTML även när de är hopfällda. Det är nödvändigt för FAQPage-schemat, som ska följa med från dagens sida.

#### Händelser, del 2

| När | Händelse | Egenskaper |
|---|---|---|
| Sidan renderas | `pricing_viewed` | `surface: 'public'`, `logged_in: false`, `track: null` |
| Spårväljaren används | `track_changed` | `from`, `to`, `surface: 'pricing_segment'` |
| Allt-kortets längdval ändras | `plan_length_changed` | `from`, `to`, `surface: 'public'`. Ny händelse, behövs för att veta om de fyra längderna används eller om Allt-veckan bär allt. |
| Knapp på ett kort | `paywall_cta_clicked` | `variant: 'pricing_card'`, `plan`, `surface: 'public'` |
| Jämförelsetabellen syns till hälften | `pricing_comparison_viewed` | `surface: 'public'`. Ny. Mäter om tabellen läses eller om folk köper på korten. |
| En FAQ-fråga öppnas | `pricing_faq_opened` | `question_id`. Ny. Säger vilken invändning som finns kvar. |

De tre nya händelserna är billiga och svarar på tre frågor vi annars gissar: används längderna, läses tabellen, vilken fråga hindrar köpet. Vill man skära ner är `pricing_faq_opened` den som får gå först.

#### Acceptanskriterier, del 2

Pixel 7, 412 px, Chrome, som utloggad besökare:

1. Rubrik, ingress och spårväljaren syns utan scroll. Första kortets pris syns i samma skärmhöjd eller precis under vecket.
2. Tryck CV i spårväljaren: sidan scrollar till CV-kortet och kortet markeras. De två andra korten finns kvar.
3. Allt-kortets längdval byter pris, rad, tre punkter och knapptext. Inget annat på sidan ändras.
4. Allt-dagen visar ingen förnyelserad utan en sluttidsrad, enligt avsnitt 8.
5. Jämförelsetabellen scrollar horisontellt i sin egen behållare. Sidans body scrollar aldrig i sidled.
6. Alla knappar och FAQ-rader är minst 44 px höga.
7. Med JavaScript avstängt: alla tre korten, tabellen, alla fem FAQ-svaren och förtroenderaden finns i HTML. Allt-kortet visar veckoläget.
8. Räkna orange per skärmhöjd genom hela sidan: aldrig fler än två.
9. Kontrast: priset i `text-tal ink-1` mot `bg-panel`, metaraden i ink-3 mot panel, båda över AA. Mät med webbläsarens verktyg, gissa inte.
10. LCP under 2,0 s på simulerad 4G. Sidan är CDN-cachad ett dygn enligt `reference_vercel_env_saknas`.
11. FAQPage- och AggregateOffer-schemat validerar, och priserna i schemat är samma som i korten.

Desktop 1280: tre kolumner lika höga, tabellen utan scroll, FAQ i två kolumner.

---

### 3. Prissidan, inloggad

En vy, tre tillstånd. Ligger på `/dashboard/profil/prenumeration` och ersätter dagens innehåll där. Vi bygger inte en inloggad `/priser`: två adresser för samma sak blir två sidor att hålla synkade, och den inloggade behöver sitt läge mer än hon behöver adressen.

Skillnaden mot publika sidan i en mening: **den publika sidan säljer paket, den inloggade sidan säljer nästa steg från där användaren står.** Därför börjar varje tillstånd med användarens läge och först därefter kommer korten.

#### Skärm 3.1: tillstånd gratis

```
┌──────────────────────────────────────────┐
│  Prenumeration                           │  PageHeader h1
│  [D21]                                   │  description
├──────────────────────────────────────────┤
│  ● [D22]  Du är på gratisnivån           │  StatusRow tone="neutral"
├──────────────────────────────────────────┤
│  [D23]  Det här har tagit stopp          │  text-sm font-medium ink-3
│  ┌────────────────────────────────────┐  │  panel, lista divide-y
│  │  ⊘  [D24]  Fler CV-mallar      3 ggr│  │  feature_blocked senaste 7 dygn
│  │  ⊘  [D25]  Testnivå över grund 2 ggr│  │  ikon 24 ink-3, tal tabular-nums
│  │  ⊘  [D26]  Brevnedladdning     1 gg │  │  max tre rader, mest frekvent först
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │  förslagspanel, kant-stark
│  │  ┌──────┐                          │  │  MarginPlate, vyns enda
│  │  │ ▨▨▨  │  [D27]  Vi föreslår      │  │  förslaget kommer ur spåret
│  │  │ ▨▨▨  │         CV-veckan        │  │  plus blockeringarna ovan
│  │  └──────┘  [D28]                   │  │  text-sm ink-2, skälet
│  │                                    │  │
│  │  ╔══════════════════════════════╗  │  │
│  │  ║          [D29]               ║  │  │  primär: köp föreslaget paket
│  │  ╚══════════════════════════════╝  │  │
│  │                                    │  │
│  │  [D30]                             │  │  textlänk: se alla paket
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  ▸ [D31]  Alla paket                     │  hopfälld, öppnas av [D30]
│     tre kort som på publika sidan         │  samma markup, utan hero
├──────────────────────────────────────────┤
│  [D32]  Vad gratisnivån ger              │  panel, GR-strängarna ur 2B
└──────────────────────────────────────────┘
```

Det bärande draget: **blockeringslistan står före förslaget.** Vi säger inte "köp det här", vi säger "det här tog stopp, och det här löser det". Raderna kommer ur `feature_blocked` de senaste sju dygnen, grupperade per feature, mest frekvent först, högst tre rader.

Har användaren inga blockeringar alls, alltså en ny gratisanvändare som inte slagit i något, faller hela blockeringssektionen bort och förslagspanelen står ensam med spåret som enda grund. Den ska då säga varför den föreslår, i [D28], annars läser den som en gissning.

Förslagslogiken, i ordning:

1. Finns blockeringar i ett spår, föreslå det spåret. Två eller fler blockeringar som spänner båda spåren ger Allt-veckan.
2. Finns inga blockeringar men ett spår i `onboarding_track`, föreslå det spåret.
3. Finns varken eller, föreslå Allt-veckan och säg i [D28] att det är för att vi inte vet än.

Orange-räkning: marginalplattan i förslagspanelen (1). Statusraden är neutral. Ett av tre.

#### Skärm 3.2: tillstånd spår

```
┌──────────────────────────────────────────┐
│  Prenumeration                           │  PageHeader
├──────────────────────────────────────────┤
│  ● [D33]  CV-veckan, förnyas 29 sept     │  StatusRow tone="neutral"
├──────────────────────────────────────────┤
│  ┌────────────────────────────────────┐  │  panel, det du har
│  │  [D34]  Det här ingår              │  │  text-sm font-medium ink-3
│  │  ✓ [P1a]  ✓ [P1b]  ✓ [P1c]         │  │  tre rader
│  │  [P5]  Testerna över grundnivå...  │  │  text-meta ink-3
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  [D35]  Det här har tagit stopp          │  bara om feature_blocked finns
│  ┌────────────────────────────────────┐  │  utanför spåret senaste 7 dygn
│  │  ⊘  [D36]  Testnivå över grund 4 ggr│  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │  uppgraderingspanel, kant-stark
│  │  ┌──────┐                          │  │  MarginPlate, vyns enda
│  │  │ ▨▨▨  │  [D37]  Byt till Allt    │  │
│  │  │ ▨▨▨  │  [D38]                   │  │  text-sm ink-2
│  │  └──────┘                          │  │
│  │                                    │  │
│  │  [T81]  Mellanskillnad    +20 kr   │  │  text-meta ink-3
│  │  [T82]  Påbörjad vecka räknas av   │  │  text-meta ink-3
│  │                                    │  │
│  │  ╔══════════════════════════════╗  │  │
│  │  ║          [T83]               ║  │  │  primär: uppgradera
│  │  ╚══════════════════════════════╝  │  │
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  [D39]  Hantera                          │
│  ┌────────────────────────────────────┐  │  lista i panel
│  │  [D40]  Byt betalkort           →  │  │  Stripe-portalen
│  │  [D41]  Kvitton                 →  │  │
│  │  [D42]  Säg upp                 →  │  │  aldrig dold, aldrig destruktiv färg
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

Mellanskillnaden, inte hela priset. Samma regel som i Fas 2A flöde 4, och av samma skäl: 99 kr för någon som redan betalar 79 läser som en dubbeldebitering.

Har spåranvändaren inga blockeringar utanför sitt spår faller både [D35]-listan och uppgraderingspanelen bort. Då är hon nöjd i sitt paket, och att sälja Allt till henne är att störa. Kvar står bara vad hon har och hur hon hanterar det. Det är en bättre sida.

Uppsägning ligger som en vanlig rad i hanteringslistan, i ink-1 som de andra, inte i rött och inte gömd bakom en accordion. Lagkravet i avsnitt 8 säger minst lika enkelt som köpet, och köpet var två tryck.

Orange-räkning: marginalplattan (1). Ett av tre.

#### Skärm 3.3: tillstånd Allt

```
┌──────────────────────────────────────────┐
│  Prenumeration                           │  PageHeader
├──────────────────────────────────────────┤
│  ● [D43]  Allt-veckan, förnyas 29 sept   │  StatusRow tone="neutral"
├──────────────────────────────────────────┤
│  ┌────────────────────────────────────┐  │  panel: allt ingår
│  │  [D44]  Allt ingår                 │  │
│  │  ✓ [P3a]  ✓ [P3b]  ✓ [P3c]         │  │
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  [D45]  Byt längd                        │  text-sm font-medium ink-3
│  ┌────────────────────────────────────┐  │
│  │  ┌─────┬─────┬─────┬─────┐         │  │  Segment, fyra längder
│  │  │ Dag │Veck.│Mån. │Kvart│         │  │  nuvarande markerad
│  │  └─────┴─────┴─────┴─────┘         │  │
│  │                                    │  │
│  │  [D46]  149 kr i månaden           │  │  text-kort ink-1
│  │  [D47]  Sparar 47 kr mot fyra      │  │  text-meta ink-3, bara när sant
│  │         veckor i rad               │  │
│  │  [D48]  Byter vid nästa förnyelse  │  │  text-meta ink-3
│  │                                    │  │
│  │  ╔══════════════════════════════╗  │  │
│  │  ║          [D49]               ║  │  │  primär, inaktiv tills annan
│  │  ╚══════════════════════════════╝  │  │  längd än nuvarande är vald
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  [D39]  Hantera                          │  samma lista som 3.2
│  ┌────────────────────────────────────┐  │
│  │  [D40] [D41] [D42]                 │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

Ingen marginalplatta i det här tillståndet. Användaren har allt, det finns ingenting att framhäva, och en platta här skulle peka på ett byte hon inte bett om. Orange-räkning: noll. Det är rätt: en nöjd betalande sida ska vara lugn.

[D47] visas bara när besparingen är sann och räknas i koden, aldrig som en fast sträng. Månaden mot fyra veckor: 149 mot 396, alltså 247 kr. Kvartalet mot tretton veckor: 299 mot 1287. Går prisen isär måste raden följa med, annars ljuger den.

Sänkning av längd, alltså vecka till dag, hanteras som vanligt längdbyte vid nästa förnyelse. Vi hindrar det inte och vi frågar inte varför. En spärr där ger en uppsägning i stället.

#### Vad som är gemensamt för de tre tillstånden

En vy, tre tillstånd, och skelettet är samma: `PageHeader`, en `StatusRow` som säger läget, en panel som säger vad användaren har, noll till en panel som föreslår nästa steg, och en hanteringslista. Skillnaden ligger i vad de panelerna innehåller, inte i hur sidan är byggd. Det gör den billig att bygga och omöjlig att glida isär.

Admin-beviljad premium och tidsbegränsad premium (dagens `AdminGrantedCard` och `TidsbegransadPremiumCard`) är varianter av tillstånd 3.3 med annan statusrad och utan längdval. De behöver inga nya skisser.

#### Händelser, del 3

| När | Händelse | Egenskaper |
|---|---|---|
| Sidan renderas | `pricing_viewed` | `surface: 'account'`, `logged_in: true`, `scope`, `track`, `state: 'free' \| 'track' \| 'all'` |
| Blockeringslistan renderas med minst en rad | `upgrade_shown` | `from_scope`, `to_scope`, `surface: 'account_blocked_list'`, `blocked_count` |
| Förslagspanelen renderas | `upgrade_shown` | `from_scope`, `to_scope`, `surface: 'account_suggestion'` |
| Primär i förslags- eller uppgraderingspanelen | `paywall_cta_clicked` | `variant: 'account'`, `plan`, `cta: 'primary'` |
| Längdvalet ändras | `plan_length_changed` | `from`, `to`, `surface: 'account'` |
| Säg upp tryckt | `cancel_started` | `plan`, `days_into_period`. Ny, och nödvändig: utan den vet vi inte om uppsägningar sker dag 1 eller dag 6, och det avgör om priset eller produkten är problemet. |

#### Acceptanskriterier, del 3

Pixel 7, 412 px, tre inloggningar med tre olika konton:

1. Gratiskonto med blockeringar: listan står före förslaget, högst tre rader, mest frekvent först.
2. Gratiskonto utan blockeringar: listan är helt borta, ingen tom panel, inget skelett som ligger kvar.
3. Gratiskonto med spår CV: förslaget är CV-veckan och [D28] säger varför.
4. Spårkonto utan blockeringar utanför spåret: ingen uppgraderingspanel alls.
5. Spårkonto med blockeringar utanför spåret: panelen visar mellanskillnaden, inte 99 kr.
6. Allt-konto: längdvalet visar nuvarande längd markerad, och primären är inaktiv tills en annan väljs.
7. [D47] visas bara när besparingen är sann, och talet stämmer mot priserna i `plans.ts`.
8. Säg upp är synlig utan att öppna något, i ink-1, och tar användaren till Stripe-portalen.
9. Räkna orange: ett i tillstånd gratis, ett i tillstånd spår, noll i tillstånd Allt.
10. LCP under 1,0 s. Läget kommer serverrenderat, blockeringslistan likaså. Ingen panel får hämta sig själv efter mount.
11. Alla tre tillstånden på desktop 1280: huvudkolumn, ingen sidopanel, korten i tre kolumner bara i det hopfällda "Alla paket".

---

### 4. Nya textytor

D-serien, alltså det som tillkommer utöver P-, PR-, GR- och T-serierna som redan står i Fas 2B och 2C. Copyn skrivs av copywriter-rollen.

| Id | Plats | Max | Avsikt |
|---|---|---|---|
| D1 | Spårvalet, sekundärknapp i foten | 16 | Börja gratis, som ett val och inte som ett avhopp |
| D2 | Spårvalet, rad under fotknapparna | 70 | Vad gratisnivån ger, i en mening, så knappen inte är ett hopp i mörkret |
| D3 | Gratisspårets fråga | 42 | Vad vill du göra, utan att nämna pris |
| D4 | Gratisspårets underrad | 90 | Att svaret styr vad vi visar, inte vad det kostar |
| D5 | Gratisspåret, CV-kortet titel | 24 | Handlingen, inte paketnamnet |
| D6 | Gratisspåret, CV-kortet text | 70 | Vad hon kommer att göra först |
| D7 | Gratisspåret, testkortet titel | 24 | Som D5 |
| D8 | Gratisspåret, testkortet text | 70 | Som D6 |
| D9 | Gratisspåret, vet inte än, titel | 24 | Ett ärligt svar, inte ett nederlag |
| D10 | Gratisspåret, vet inte än, text | 70 | Att hon kan välja senare |
| D11 | Gratisspåret, primärknapp | 22 | Till hemskärmen, med riktning |
| D12a till D12c | Prissidan, spårväljarens tre lägen | 10 per läge | Ett ord per läge |
| D13 | Prissidan, spårkortens intervallrad | 40 | Att det förnyas, med intervall utskrivet. Lagkrav. |
| D14 | Prissidan, spårkortens knapp | 24 | Vad som händer vid tryck, per paket |
| D15 | Prissidan, Allt-kortets intervallrad | 40 | Fyra varianter, en per längd. Dagen är en sluttidsrad, inte en förnyelserad. |
| D16 | Prissidan, Allt-kortets knapp | 24 | Fyra varianter, en per längd |
| D17 | Prissidan, gratisnivåns länk | 30 | Skapa konto gratis |
| D18 till D20 | Prissidan, förtroenderadens tre rader | 40 per rad | Uppsägning, betalning, priser i kronor inklusive moms |
| D21 | Prenumeration, sidhuvudets underrad | 70 | Vad sidan gör |
| D22 | Prenumeration gratis, statusrad | 50 | Läget, utan att låta som en brist |
| D23 | Prenumeration gratis, listrubrik | 34 | Det här har tagit stopp |
| D24 till D26 | Blockeringsradernas etiketter | 34 per rad | En per feature. Tio features enligt avsnitt 5, alltså tio strängar. |
| D27 | Förslagspanelens rubrik | 40 | Vi föreslår, plus paketnamnet |
| D28 | Förslagspanelens skäl | 110 | Varför just det paketet, ur blockeringar eller spår. Tre varianter enligt förslagslogiken. |
| D29 | Förslagspanelens knapp | 26 | |
| D30 | Se alla paket, textlänk | 24 | |
| D31 | Alla paket, hopfälld rubrik | 20 | |
| D32 | Gratisnivåns panelrubrik | 34 | Vad gratisnivån ger |
| D33 | Prenumeration spår, statusrad | 60 | Paket och nästa dragningsdatum |
| D34 | Det här ingår, rubrik | 24 | |
| D35 | Spårets blockeringslista, rubrik | 34 | Som D23 men utanför spåret |
| D36 | Spårets blockeringsrader | 34 per rad | Delar strängar med D24 till D26 |
| D37 | Uppgraderingspanelens rubrik | 34 | Byt till Allt |
| D38 | Uppgraderingspanelens text | 110 | Vad Allt öppnar, ur hennes faktiska blockeringar |
| D39 | Hantera, listrubrik | 16 | |
| D40 till D42 | Hanteringsradernas etiketter | 24 per rad | Byt betalkort, kvitton, säg upp |
| D43 | Prenumeration Allt, statusrad | 60 | Paket, längd och nästa dragningsdatum. Fyra varianter, en per längd. |
| D44 | Allt ingår, rubrik | 20 | |
| D45 | Byt längd, rubrik | 20 | |
| D46 | Valt längdläge, prisrad | 40 | Fyra varianter |
| D47 | Besparingsrad | 60 | Bara när sann. Två varianter, månad och kvartal. |
| D48 | Byter vid nästa förnyelse | 40 | Att bytet inte sker nu |
| D49 | Byt längd, primärknapp | 26 | |

Räknat som strängar, alltså med varianter: 49 id ger cirka 95 strängar. De tyngsta posterna är D24 till D26 (tio features), D15, D16, D43 och D46 (fyra längder var) och D28 (tre varianter).

Utöver D-serien behövs de sex strängar Fas 2B redan pekat ut i noten vid prissidan: en rad plus tre punkter för Allt-dagen och detsamma för Allt-kvartalet.

---

### 5. Insats och vad som saknas

| Del | Insats | Vad som räcker | Vad som saknas |
|---|---|---|---|
| Skärm 1.1 med Börja gratis | **S** ovanpå Fas 2A:s M | `FlowShell` har redan `footerSecondary`. `ChoiceCard`, `Segment`, `MarginPlate` finns. | Skärm 1.1b är en ny stegvy men bygger på samma komponenter. Ingen ny komponent. Rutten `/start` och `onboarding_track` var redan med i Fas 2A. |
| Publika prissidan | **L** | Tråden-tokens finns i `globals.css` och gäller redan publika sidor där de används. `Segment` ur shell fungerar på publik sida. Illustrationer finns i `TradenScener` och `Ikoner`. | **Paketkortet saknas som komponent.** Dagens `PlanCards` i `src/components/pricing/` är byggt för den gamla prisstegen och för fyra produkter, inte tre kort med ett inbyggt längdval. Nytt: `PaketKort { plan, lengths?, recommended?, notIncluded?, onSelect }` i `src/components/pricing/`, delad mellan publik och inloggad sida. Dessutom behöver jämförelsetabellen en `JamforelseTabell` som tål fyra kolumner och sticky första kolumn på mobil. Dagens `PriserJamforelse` är byggd för två. |
| Inloggade prissidan | **M** | `PageHeader`, `StatusRow`, panel- och listmönstren, `Segment`, `MarginPlate`. Allt finns. `PaketKort` delas med publika sidan. | En serverfråga som summerar `feature_blocked` per feature de senaste sju dygnen. Den finns inte. Läggs i sidans egen serverkomponent, inte i `/api/dashboard/summary`, eftersom den bara behövs här. Dessutom förslagslogiken som en ren funktion i `src/lib/access/suggestPlan.ts`, testbar utan databas. |
| Händelser | **S** | `capture` finns. | Fyra nya händelsenamn: `plan_length_changed`, `pricing_comparison_viewed`, `pricing_faq_opened`, `cancel_started`. Plus egenskapen `intent` på `track_selected`. |

Summerat nytt i kod: två komponenter (`PaketKort`, `JamforelseTabell`), en ren funktion (`suggestPlan`), en serverfråga (blockeringar per feature), fyra händelsenamn och en ny egenskap. Ingenting i `src/components/shell` behöver ändras, och `Segment` bär både spårväljaren och längdvalet utan tillägg.

**Total insats Fas 2D: L.** Den publika prissidan är merparten. Den ligger i släpp 1 enligt ägarens beslut 5, tillsammans med paketen och kassan, eftersom en kassa utan prissida inte går att sälja från. Den inloggade sidan kan gå i samma släpp men är inte blockerande för köp, så den får falla till släpp 2 om tiden tar slut. Börja gratis-justeringen av skärm 1.1 måste gå i släpp 1, eftersom spårvalet gör det.

---


## Fas 2E: text för prissidan

Skriven 2026-09-22 av `svensk-ux-copywriter` mot Fas 2D:s D-serie, D1 till D49. Här ligger också de sex strängar Fas 2B pekade ut för Allt-dagen och Allt-kvartalet, samt ställningstagandet till prissidans H1.

Samma regler som 2B och 2C: inga talstreck, aldrig "Lås upp", aldrig "gratis för alltid", vi och du som subjekt, svenska facktermer, auktoritär och lugn ton. Bestämd form på alla paketnamn enligt ägarens beslut 6. Längder i tecken inklusive mellanslag, mätta mot 2D:s maxvärden.

---

### 0. Prissidans H1, slutgiltigt

Saas-lead har rätt i invändningen. "Betala för veckan" blir osann i samma sekund som Allt-kortets Segment står på Dag eller Kvartal, och en rubrik som motsägs av ett reglage tjugo pixlar längre ner är värre än en vag rubrik.

Jag delar hans rekommendation men inte dess formulering. Veckan ska stå kvar som huvudlöfte, och längderna ska vara undantag. Men rubriken måste då säga veckan som **utgångspunkt** och inte som villkor, annars är den fortfarande falsk. Skillnaden ligger i ett ord.

| Alternativ | Rubrik | Tecken | Problem |
|---|---|---|---|
| Nuvarande, PR1A | `Välj spåret du söker på. Betala för veckan.` | 43 | Blir osann vid Dag och Kvartal. Saas-leads invändning. |
| Rättad | **`Välj spåret du söker på. Börja med en vecka.`** | 44 | Ingen. Veckan är start, inte tak. |
| Alternativ | `Välj spåret du söker på. Betala per vecka.` | 42 | "Per vecka" läses som prisenhet och blir lika osann vid kvartal. |

**Slutgiltig H1: `Välj spåret du söker på. Börja med en vecka.`** (44 tecken)

Skälet i tre led. "Börja med en vecka" är sant oavsett vilket läge Segmentet står i, eftersom veckan är förvald och är vad de flesta köper. Den bär fortfarande hela argumentet mot årsabonnemang, vilket är sidans enda verkliga säljpoäng mot konkurrenterna. Och den öppnar för längderna i stället för att motsäga dem: "börja med" antyder att det finns mer, och det gör det. Första satsen står oförändrad, eftersom spårvalet är det sidan finns för.

Ingressen PR2A från Fas 2B står kvar oförändrad. Den nämner ingen längd och blir därför inte osann.

Konsekvens: PR1 i Fas 2B är ersatt av raden ovan. Den gamla lydelsen ska inte föras in någonstans.

---

### 1. Spårvalet med Börja gratis

| Id | Max | Sträng | Tecken |
|---|---|---|---|
| D1 | 16 | **`Börja gratis`** | 12 |
| D1 alt | 16 | `Hoppa över` | 10 |
| D2 | 70 | **`Gratisnivån ger tre mallar, en analys, ett brev och grundnivån i testerna.`** | 73, se not |
| D2 alt | 70 | `Tre mallar, en CV-analys, ett brev och grundnivån i testerna ingår.` | 66 |

**Rekommendation: D1 alternativ A, D2 alternativ B.** D1 "Börja gratis" är ägarens egen formulering och den enda som gör gratis till ett val i stället för ett avhopp, vilket är hela skälet till att knappen ligger i foten och inte som en grå länk. "Hoppa över" säger att man missar något.

D2:s huvudalternativ är 73 tecken och faller utanför taket. Alternativet håller 66 och säger samma sak, med ingår-formeln från GR-serien i 2B. Det är därför alternativet som gäller, och raden lyder `Tre mallar, en CV-analys, ett brev och grundnivån i testerna ingår.`

Not: raden måste stämma med gratisnivån i avsnitt 4 och med GR1 till GR7. Ändras CV-analysens gratisnivå, som Fas 3 noterar är hårdare än planen skrev, ska D2 följa med i samma commit.

---

### 2. Skärm 1.1b: gratisanvändarens spårfråga

Inga priser på den här skärmen, enligt 2D. Ingen av strängarna får nämna ett belopp eller ett paketnamn.

| Id | Max | Sträng | Tecken |
|---|---|---|---|
| D3 | 42 | **`Vad vill du börja med?`** | 22 |
| D3 alt | 42 | `Var ska vi börja?` | 17 |
| D4 | 90 | **`Svaret styr vad vi lägger överst. Du kan ändra det när du vill i din profil.`** | 76 |
| D4 alt | 90 | `Vi lägger det du väljer överst på startsidan. Ändra det när som helst.` | 69 |
| D5 | 24 | **`Mitt CV`** | 7 |
| D5 alt | 24 | `CV och ansökningar` | 18 |
| D6 | 70 | **`Vi läser ditt CV och visar vad en rekryterare fastnar på.`** | 56 |
| D6 alt | 70 | `Ladda upp CV:t, så börjar vi med en analys av det.` | 50 |
| D7 | 24 | **`Rekryteringstester`** | 18 |
| D7 alt | 24 | `Träna på tester` | 15 |
| D8 | 70 | **`Grundnivån i matrislogik, verbalt och numeriskt, med förklaringar.`** | 66 |
| D8 alt | 70 | `Börja med grundnivån i den testtyp du har framför dig.` | 53 |
| D9 | 24 | **`Jag vet inte än`** | 15 |
| D9 alt | 24 | `Visa mig allt` | 13 |
| D10 | 70 | **`Titta runt först. Vi frågar igen när du hunnit se dig omkring.`** | 61 |
| D10 alt | 70 | `Du kan välja när som helst i profilen.` | 38 |
| D11 | 22 | **`Till startsidan`** | 15 |
| D11 alt | 22 | `Sätt igång` | 10 |

Not till D3: frågan är avsiktligt en annan än T1 ("Vad ska du få gjort den här veckan?"). Veckan finns inte för den som väljer gratis, och att fråga om en vecka hon inte köpt vore fel. "Vad vill du börja med" har ingen tidsram alls, vilket är riktigt här.

Not till D5 och D7: titlarna är substantiv, inte handlingar som T3 och T6. Skälet: på köpskärmen är titeln ett löfte om vad veckan ger, här är den en etikett på ett område. "Få ansökan klar" vore ett löfte vi inte håller på gratisnivån.

Not till D9: "Jag vet inte än" är samma formulering som T12 och ska vara det. Det är ett ärligt svar, och `onboarding_track` blir `null`, precis som 2D säger. "Visa mig allt" är sämre eftersom det antyder en produktrundtur vi inte bygger.

---

### 3. Publika prissidan

#### Spårväljaren, D12

| Id | Max | Sträng | Tecken |
|---|---|---|---|
| D12a | 10 | `CV` | 2 |
| D12b | 10 | `Tester` | 6 |
| D12c | 10 | `Allt` | 4 |

Ett ord per läge enligt 2D. "Tester" står i plural eftersom det är 19 stycken, och "Rekryteringstester" ryms inte på tio tecken.

#### Spårkorten, D13 och D14

| Id | Max | Paket | Sträng | Tecken |
|---|---|---|---|---|
| D13 | 40 | CV-veckan och Testveckan | **`i veckan, förnyas var sjunde dag`** | 32 |
| D13 alt | 40 | Samma | `i veckan, dras var sjunde dag` | 29 |
| D14 | 24 | CV-veckan | **`Ta CV-veckan`** | 12 |
| D14 alt | 24 | CV-veckan | `Välj CV-veckan` | 14 |
| D14 | 24 | Testveckan | `Ta Testveckan` | 13 |

**Rekommendation: D13 alternativ A, D14 alternativ A.** "Förnyas" är lagkravets ord i avsnitt 8 och säger vad som händer med prenumerationen. "Dras" säger vad som händer med pengarna och hör hemma i kassan, där beloppet står. D14 "Ta" är samma verb som i betalväggarna PW1 till PW7 i Fas 2B, och knapptexten ska vara densamma överallt där samma paket köps.

#### Allt-kortet, D15 och D16, fyra längder var

| Id | Läge | Sträng | Tecken |
|---|---|---|---|
| D15 | Dag | `i 24 timmar, förnyas inte` | 25 |
| D15 | Vecka | `i veckan, förnyas var sjunde dag` | 32 |
| D15 | Månad | `i månaden, förnyas var trettionde dag` | 37 |
| D15 | Kvartal | `i kvartalet, förnyas var tredje månad` | 37 |
| D16 | Dag | `Ta Allt-dagen` | 13 |
| D16 | Vecka | `Ta Allt-veckan` | 14 |
| D16 | Månad | `Ta Allt-månaden` | 15 |
| D16 | Kvartal | `Ta Allt-kvartalet` | 17 |

Not till D15 i dagläget: "förnyas inte" är den viktigaste texten på hela kortet. Allt-dagen är ett engångsköp enligt avsnitt 8, och den som köper ett dygn och sedan ser en dragning har skäl att begära återbetalning. Raden får aldrig kortas bort för att den bryter mönstret mot de tre andra. Det är precis därför den finns.

#### Gratisnivån och förtroenderaden

| Id | Max | Sträng | Tecken |
|---|---|---|---|
| D17 | 30 | **`Skapa konto gratis`** | 18 |
| D17 alt | 30 | `Börja gratis, utan kort` | 24 |
| D18 | 40 | `Säg upp när som helst, ett klick` | 32 |
| D19 | 40 | `Kortbetalning via Stripe` | 24 |
| D20 | 40 | `Priser i kronor, moms ingår` | 27 |

**Rekommendation: D17 alternativ A.** Alternativet nämner kortet, och det är sant att gratisnivån inte kräver kort, men raden ligger under gratisnivåns panel där hela innehållet redan står. "Skapa konto gratis" säger vad knappen gör. Vill ägaren ha kortlöftet hör det hemma i D2 eller i förtroenderaden, inte här.

Not till D19: Stripe nämns vid namn eftersom det är ett förtroendeargument och inte ett tekniskt påstående. Byter vi betalleverantör byts raden.

Not till D20: "moms ingår" är kravet i avsnitt 8, alltså pris inklusive moms i kronor. Raden får inte skrivas om till "inga dolda avgifter", som är ett löfte om något annat.

---

### 4. Allt-dagen och Allt-kvartalet: de sex strängarna ur Fas 2B

Kompletterar P4 och P4a till P4c, som gäller månadsläget. En rad (max 70) och tre punkter (max 45) per längd, i samma form som P-serien.

| Id | Längd | Rad, max 70 | Tecken |
|---|---|---|---|
| P7 | Allt-dagen | **`Allt i ett dygn. Ett engångsköp, ingenting dras igen.`** | 52 |
| P7 alt | Allt-dagen | `För dig som ska ha in en ansökan i kväll.` | 41 |
| P8 | Allt-kvartalet | **`Tre månader, för ett sök som du vet tar tid.`** | 43 |
| P8 alt | Allt-kvartalet | `Samma som Allt-månaden, tre gånger så länge och billigare.` | 57 |

**Rekommendation: P7 alternativ A, P8 alternativ A.** P7A säger både innehåll och den enda sak som skiljer dagen från allt annat på sidan, nämligen att den inte förnyas. Det är inte finstilt, det är kortets viktigaste fakta och hör hemma i raden. P8A säger skälet att välja kvartal, precis som P4B gör för månaden, och undviker att räkna på besparingen i en rad där talet inte står.

| Id | Längd | Punkt, max 45 | Tecken |
|---|---|---|---|
| P7a | Allt-dagen | `Allt i Allt-veckan, i 24 timmar` | 31 |
| P7b | Allt-dagen | `Engångsköp, ingen prenumeration` | 31 |
| P7c | Allt-dagen | `Dygnet räknas från köpet` | 24 |
| P8a | Allt-kvartalet | `Allt i Allt-veckan, i tre månader` | 33 |
| P8b | Allt-kvartalet | `Billigare än tretton veckor i rad` | 33 |
| P8c | Allt-kvartalet | `Säg upp när som helst, ett klick` | 32 |

Not till P7c: "räknas från köpet" är nödvändigt eftersom dygnet inte följer kalenderdygnet. Ett köp klockan 21 gäller till klockan 21 nästa dag, och det måste stå före köpet, inte bara i bekräftelsen.

Not till P8b: tretton veckor mot 299 kr stämmer mot priserna i ägarens beslut 1 och 4. Ändras kvartalspriset måste punkten följa med, annars stryks jämförelsen och punkten blir `Längsta perioden vi säljer` (26).

---

### 5. Inloggade prissidan: tillstånd gratis

| Id | Max | Sträng | Tecken |
|---|---|---|---|
| D21 | 70 | **`Vad du har i dag, och vad som öppnar resten.`** | 44 |
| D21 alt | 70 | `Ditt läge, dina paket och hur du hanterar dem.` | 46 |
| D22 | 50 | **`Du är på gratisnivån`** | 20 |
| D22 alt | 50 | `Gratisnivån, inget kort kopplat` | 31 |
| D23 | 34 | **`Det här har tagit stopp`** | 23 |
| D23 alt | 34 | `Här tog det stopp den här veckan` | 32 |

**Rekommendation: D21 alternativ A, D22 alternativ A, D23 alternativ A.** D22A är 2D:s egen formulering och är rätt: den säger läget utan att låta som en brist, vilket alternativets "inget kort kopplat" gör. D23A är kortare och saknar tidsangivelse, vilket är bättre eftersom listan täcker sju dygn och "den här veckan" kan läsas som kalendervecka.

#### Blockeringsetiketterna, D24 till D26, tio features

En sträng per feature ur featuretabellen i avsnitt 5. Samma strängar används på tillstånd spår, alltså D36. Max 34 tecken. Formen är ett substantiv, aldrig en mening och aldrig en uppmaning: raden följs av ett antal och ska läsas som en post i en lista.

| Feature | Etikett | Tecken |
|---|---|---|
| `cv_templates_all` | `Fler CV-mallar` | 14 |
| `cv_export` | `Fler CV-nedladdningar` | 21 |
| `cv_analysis_full` | `Hela CV-analysen` | 16 |
| `letter_download` | `Brevnedladdning` | 15 |
| `tests_above_base` | `Testnivå över grundnivån` | 24 |
| `test_exam_mode` | `Tidsatt provläge` | 16 |
| `test_history` | `Din testhistorik` | 16 |
| `chat_unlimited` | `Fler meddelanden i chatten` | 26 |
| `job_matches_all` | `Fler jobbträffar` | 16 |
| `bli_upptackt` | `Bli upptäckt` | 12 |

Not: etiketterna säger vad användaren ville göra, inte vad hon nekades. "Fler CV-mallar" och inte "CV-mallar låsta". Listan är redan en lista över stopp, och att upprepa det på varje rad är att gnugga in det.

Not om antalsraden bredvid etiketten: formen är `{n} ggr` för n över 1 och `1 gg` för n lika med 1, enligt 2D:s skiss. Det är korrekt svensk förkortning och ska inte skrivas ut som "gånger", som spräcker raden.

#### Förslagspanelen

| Id | Max | Sträng | Tecken |
|---|---|---|---|
| D27 | 40 | `Vi föreslår CV-veckan` / `Vi föreslår Testveckan` / `Vi föreslår Allt-veckan` | 21 / 22 / 23 |
| D29 | 26 | **`Ta CV-veckan`** (följer föreslaget paket) | 12 |
| D29 alt | 26 | `Se vad den kostar` | 17 |
| D30 | 24 | **`Se alla paket`** | 13 |
| D30 alt | 24 | `Jämför paketen` | 14 |
| D31 | 20 | `Alla paket` | 10 |
| D32 | 34 | **`Vad gratisnivån ger`** | 19 |
| D32 alt | 34 | `Det här ingår utan att betala` | 29 |

**Rekommendation: D29 alternativ A, D30 alternativ A, D32 alternativ A.** D29 ska vara samma knapptext som på prissidan och i betalväggarna, alltså "Ta {paket}". En knapp som säger "Se vad den kostar" när priset redan står i panelen ovanför är ett steg som inte finns.

D28, förslagets skäl, tre varianter enligt förslagslogiken i 2D. Max 110.

| Variant | Sträng | Tecken |
|---|---|---|
| 1, blockeringar i ett spår | `Du har slagit i taket på CV-sidan tre gånger den här veckan. CV-veckan öppnar allt du stoppades av.` | 99 |
| 1b, blockeringar i båda spåren | `Du har stoppats både på CV-sidan och i testerna. Allt-veckan öppnar båda, så du slipper välja.` | 94 |
| 2, inga blockeringar men spår känt | `Du sa att du vill jobba med ditt CV. CV-veckan ger mallarna, hela analysen och brevet.` | 85 |
| 3, varken eller | `Vi vet inte vad du behöver än, så vi visar det som rymmer allt. Välj ett spår i stället om du vet.` | 98 |

Not till variant 1: talet kommer ur blockeringslistan och måste vara samma tal som står där, annars säger panelen en sak och listan en annan. Är talet 1 blir formuleringen `Du har slagit i taket på CV-sidan en gång den här veckan.` Är talet över 9 skrivs det med siffra.

Not till variant 3: raden erkänner öppet att förslaget är en gissning, och erbjuder spårvalet som ett bättre alternativ. Det är det enda ärliga sättet att föreslå det dyraste paketet till någon vi inte vet något om.

---

### 6. Inloggade prissidan: tillstånd spår

| Id | Max | Sträng | Tecken |
|---|---|---|---|
| D33 | 60 | `CV-veckan, förnyas {datum}` | 26 vid tvåsiffrigt datum |
| D34 | 24 | **`Det här ingår`** | 13 |
| D34 alt | 24 | `Det du har` | 10 |
| D35 | 34 | **`Det här har tagit stopp`** | 23 |
| D36 | 34 | Delar strängar med D24 till D26 ovan | |
| D37 | 34 | **`Byt till Allt-veckan`** | 20 |
| D37 alt | 34 | `Öppna det andra spåret också` | 28 |
| D39 | 16 | `Hantera` | 7 |
| D40 | 24 | `Byt betalkort` | 13 |
| D41 | 24 | `Kvitton` | 7 |
| D42 | 24 | `Säg upp` | 7 |

**Rekommendation: D34 alternativ A, D37 alternativ A.** D37 ska namnge paketet, eftersom knappen under leder till en betalning och panelen måste säga vad man köper. "Öppna det andra spåret" beskriver resultatet men döljer att det kostar.

D38, uppgraderingspanelens text, max 110. Skrivs ur användarens faktiska blockeringar.

| Variant | Sträng | Tecken |
|---|---|---|
| Blockeringar finns | `Du har stoppats av testnivåerna fyra gånger. Allt-veckan öppnar dem, och du behåller allt du har i dag.` | 102 |
| Blockeringar saknas, panelen visas ändå | `Allt-veckan lägger testerna ovanpå det du redan har: alla nivåer, tidsatt provläge och förklaringarna.` | 101 |

Not: enligt 2D faller hela panelen bort när spåranvändaren saknar blockeringar utanför sitt spår, och det är rätt. Den andra varianten finns därför bara för det fall att ägaren senare väljer att visa panelen alltid. Jag rekommenderar att den inte används: att sälja Allt till en nöjd spårkund är att störa, precis som 2D skriver.

Not till D42: "Säg upp" och inget annat. Inte "Avsluta prenumerationen", som är rätt på dag 7 där den står ensam, och inte "Hantera prenumerationen", som döljer vad raden gör. I en lista med tre rader där de andra är "Byt betalkort" och "Kvitton" är "Säg upp" den kortaste sanna formen.

---

### 7. Inloggade prissidan: tillstånd Allt

| Id | Max | Längd | Sträng | Tecken |
|---|---|---|---|---|
| D43 | 60 | Dag | `Allt-dagen, gäller till {klockslag} i dag` | 38 |
| D43 | 60 | Vecka | `Allt-veckan, förnyas {datum}` | 28 |
| D43 | 60 | Månad | `Allt-månaden, förnyas {datum}` | 29 |
| D43 | 60 | Kvartal | `Allt-kvartalet, förnyas {datum}` | 31 |
| D44 | 20 | | `Allt ingår` | 10 |
| D45 | 20 | | `Byt längd` | 9 |
| D46 | 40 | Dag | `49 kr för ett dygn` | 18 |
| D46 | 40 | Vecka | `99 kr i veckan` | 14 |
| D46 | 40 | Månad | `149 kr i månaden` | 16 |
| D46 | 40 | Kvartal | `299 kr i kvartalet` | 18 |
| D47 | 60 | Månad | `Sparar {n} kr mot fyra veckor i rad` | 35 |
| D47 | 60 | Kvartal | `Sparar {n} kr mot tretton veckor i rad` | 38 |
| D48 | 40 | | **`Byter vid nästa förnyelse`** | 25 |
| D48 alt | 40 | | `Gäller från nästa dragning` | 26 |
| D49 | 26 | | **`Byt till Allt-månaden`** (följer valt läge) | 21 |
| D49 alt | 26 | | `Byt längd` | 9 |

**Rekommendation: D48 alternativ A, D49 alternativ A.** D48A säger att bytet inte sker nu, vilket 2D ber om, och "förnyelse" är samma ord som i D13, D15 och D33. D49 ska namnge målet: en knapp som säger "Byt längd" i en panel som heter "Byt längd" upprepar rubriken utan att säga vad man byter till.

Not till D49 i dagläget: byter en löpande kund till Allt-dagen slutar prenumerationen och ersätts av ett engångsköp. Den knappen får därför inte lyda `Byt till Allt-dagen` utan att panelen säger vad som händer med prenumerationen. Föreslagen tilläggsrad, visas bara i dagläget:

| Id | Max | Sträng | Tecken |
|---|---|---|---|
| D48b | 40 | `Prenumerationen avslutas då` | 27 |

Den raden står inte i 2D:s tabell, men utan den är bytet till dag en uppsägning i förklädnad. Jag lägger den som en fråga till UX snarare än som ett fullbordat faktum: går bytet över huvud taget att göra i den riktningen, eller ska dagläget vara inaktivt för löpande kunder? Det senare är enklare och ärligare.

Not till D47: talet räknas i koden och visas bara när det är positivt, enligt 2D. Med priserna 99, 149 och 299 blir det 247 kr för månaden och 988 kr för kvartalet. Strängen får aldrig skrivas med ett fast tal.

Not till D46 i dagläget: "för ett dygn" och inte "i dygnet", eftersom det inte upprepas. De tre andra bär prepositionen "i" just för att de är löpande.

---

### Sammanräkning, Fas 2E

| Grupp | Id | Strängar |
|---|---|---|
| Prissidans H1, omskriven | PR1 | 3 |
| Spårvalet med Börja gratis | D1, D2 | 4 |
| Skärm 1.1b | D3 till D11 | 18 |
| Publika prissidan, väljare och kort | D12 till D16 | 16 |
| Publika prissidan, gratis och förtroende | D17 till D20 | 5 |
| Allt-dagen och Allt-kvartalet | P7, P8 med punkter | 10 |
| Inloggad, tillstånd gratis | D21 till D32 | 27 |
| Inloggad, tillstånd spår | D33 till D42 | 15 |
| Inloggad, tillstånd Allt | D43 till D49, D48b | 21 |
| **Totalt** | | **119** |

Alternativen är inräknade. D-serien själv landar på 96 strängar, alltså i linje med 2D:s uppskattning på cirka 95. Tillkommer gör de sex Allt-dagen- och Allt-kvartalet-strängarna plus fyra varianter av dem, de tre H1-raderna, och D48b som jag lagt till.

### Öppna punkter som kräver beslut före införandet

1. **D48b och bytet nedåt till Allt-dagen.** Går ett byte från löpande till engångsköp att göra i Stripe, och ska det gå? Jag rekommenderar att dagläget görs inaktivt i längdvalet för löpande kunder, med raden `Allt-dagen kan inte väljas härifrån` (34) i stället. Då behövs varken D48b eller en förklaring av vad som händer med prenumerationen.
2. **D2 mot CV-analysens gratisnivå.** Fas 3 noterar att gratisnivån för analysen är hårdare än planen skrev och att PW3 och GR3 ändras. D2 räknar upp gratisnivån i en mening och måste ändras i samma commit.
3. **D28 variant 1, talet.** Panelen och listan måste räkna samma sak över samma sju dygn. Räknas listan per feature och panelen per spår blir talen olika, och då säger sidan emot sig själv på två rader.
4. **D46 och D47 mot `plans.ts`.** Alla fyra beloppen och båda besparingarna ska läsas ur koden, aldrig skrivas som fasta strängar. Samma regel som mallantalet, där ett vakttest redan hindrar hårdkodade tal enligt Fas 3 punkt 5.
# Fas 3: slutgranskning (Fable, 2026-09-22)

Planen är läst i sin helhet mot rapporten, designsystemet och koden. Fem punkter, varav två ändrar planen.

**Status efter ägarens genomgång samma dag:** punkt 1 och 2 antagna (ägarens beslut 5), och avsnitt 9 är omskrivet efter dem. Punkt 3, 4 och 5 står kvar oförändrade. Två saker har tillkommit som granskningen inte kände till och som ändrar arbetet i släpp 1: dagspasset och kvartalet behålls som längder på Allt, vilket gör längdvalet på Allt till M i stället för noll, och CV-analysens gratisnivå är hårdare än planen skrev, vilket ändrar PW3 och GR3 och lägger en gate till på analysrutten. Båda är inskrivna på sina ställen.

1. **Tidslinjen är för långsam för ägarens avsikt.** Avsnitt 9 lägger onboardingen i våg 4, vecka 43. Ägaren bad om onboardingen nu. Skälet för att sprida vågorna, att kunna skilja effekten av gratisnivån från paketen, håller inte när utgångsläget är noll betalningar: det finns ingen effekt att förväxla. **Ändring:** två släpp i stället för fyra. Släpp 1 (vecka 40): behörighetsmodell, stramare gratisnivå, tidsgräns i provläget, paketen i Stripe och kassan, prissida, betalväggar per paket, trial bort för nya konton, admin per paket. Släpp 2 (vecka 41): spårvalet, veckoprogrammet, veckomejlen. Mätningen efter fyra veckor i avsnitt 9 gäller oförändrad, räknat från släpp 2.

2. **Spårvalet måste gå live i släpp 1, inte 2.** Utan `onboarding_track` vet betalväggarna inte vilket paket de ska föreslå, och mätpunkt 1 (spårval till köp) saknar data under de veckor paketen är nya. Flöde 1 är M och kan byggas parallellt med behörighetsmodellen. Flöde 2 till 4 följer i släpp 2.

3. **Förnyelseraden ska säga "var sjunde dag".** Copywriterns K3 till K5 gäller. Stripe räknar från köpdatum, och en vecka som normaliseras till måndag kräver `billing_cycle_anchor` och delbetalning första veckan, vilket är mer kod och en förvirrande första faktura. Måndagsvarianten K6 utgår.

4. **Jobbcoachens betalvägg** ("Dagens meddelanden är slut") byts i samma commit som kvoten ändras till tio per konto. Annars ljuger betalväggen. Läggs som acceptanskriterium på kvotändringen i släpp 1.

5. **Mallantalet** är redan löst i koden: alla ytor läser `TEMPLATE_COUNT` (41) sedan 2026-09-20 och ett vakttest hindrar hårdkodade tal. Copywriterns reservformulering behövs inte.

Utanför planen men avgörande: ägaren skapar de tre veckopriserna i Stripe (`cv_week`, `test_week`, `all_week`, `interval: 'week'`) innan Opus börjar på släpp 1. Besluten i avsnitt 7 är besvarade 2026-09-22 och priserna är fastställda: 79 / 79 / 99 / 149, med Allt-dagen 49 och Allt-kvartalet 299 kvar på sina befintliga Stripe-priser.

**Överlämning till Opus:** varje släpp får en egen överlämningsspec i docs/design/ i samma form som overlamning-opus.md (tokentabell, komponentkarta, grep-förbud, checklista per yta), och inget släpp kallas klart utan riktig webbläsartest som ny användare på Pixel 7 och desktop, inklusive köp i Stripes testläge och en förnyelse framspolad med test clocks.
