# SEO-underlag: din-digitala-jobbcoach (omskrivning från grunden)

Datum: 2026-11-15. SEO-strateg (Opus 5.5). Slug behålls: `/artiklar/din-digitala-jobbcoach`.
Bakgrund: faktagranskningen (docs/qa/faktagranskning-2026-11/din-digitala-jobbcoach.md) fann påhittade användarsiffror (2,6 gånger, 92 %), en funktion som inte finns (kompetensgap) och fel tonlägen. Artikeln skrivs om som en ny artikel. Inget från den gamla texten återanvänds utan att stämmas av mot avsnitt 5 nedan.

---

## 1. Search Console

Egendom `sc-domain:jobbcoach.ai`, data till 2026-11-13. Skript: scratch-kopior av scripts/gsc-test.ts-mönstret (googleapis, webmasters.readonly).

### 1.1 Sidan själv

| Period | Klick | Visningar | CTR | Position |
|---|---|---|---|---|
| 3 mån (2026-08-16 till 2026-11-13) | 0 | 3 | 0 % | 9,7 |
| 12 mån (2025-11-14 till 2026-11-13) | 0 | 18 | 0 % | 7,3 |

Frågor: **0 rader** i båda perioderna (alla visningar är anonymiserade lågvolymfrågor). Per månad: 14 visningar maj 2026, därefter 0 till 2. Inga interna länkar pekar till sidan (grep i content/ och src/: noll träffar utanför artikeln själv). Sidan är i praktiken osynlig och föräldralös. Vi har alltså ingen ranking att skydda, och vi kan välja sökavsikt fritt.

### 1.2 Vem äger coach-frågorna i dag (12 mån, regex jobbcoach/karriärcoach/ai coach/digital coach)

| Sida | Visningar | Snittposition | Frågor |
|---|---|---|---|
| `/` (startsidan) | 118 + 19 | 52 / 32 | jobbcoach (99 visn, pos 55), ai coach sverige, ai jobbansökan, digital jobbcoach (3, pos 48) |
| `/verktyg/jobbcoachen` | 122 | 88 | karriärcoaching (66, pos 97), karriärcoach (34, pos 93), lön jobbcoach |
| `/artiklar/vad-ar-en-jobbcoach` | 93 | 29 | jobbcoach (63, pos 36), vad gör en jobbcoach (14, pos 5,4), jobbcoach lön (10, pos 14), digital jobbcoach (1, pos 67) |
| `/artiklar/jobbcoach-online` | 18 | 21 | karriärcoaching online (18, pos 21) |

Sidtotaler 12 mån: `/verktyg/jobbcoachen` 15 klick, 404 visningar, pos 32; `/artiklar/jobbcoach-online` 2 klick, 298 visningar, pos 10,5; `/artiklar/vad-ar-en-jobbcoach` 0 klick, 149 visningar, pos 21.

### 1.3 AI-frågor på sajten (12 mån) som ingen sida egentligen svarar på

| Fråga | Visningar | Position | Rankande sida |
|---|---|---|---|
| ai jobbansökan | 105 (51 senaste 3 mån) | 26 | `/` |
| ai coach sverige | 4 | 21 | `/` |
| ai jobcoaching | 3 | 65 | `/` |
| job coach ai | 2 (1 klick) | 1,0 | `/` |
| ai coachen | 2 | 22,5 | `/` |

Övriga AI-frågor ägs redan av spokes som ska ligga kvar: "personligt brev ai" (458), "ai personligt brev" (184), "skriva personligt brev med ai" (143) → skriva-personligt-brev-med-ai; "skriva cv med ai" (72), "skapa cv med ai" (62) → skapa-cv-med-ai; "jobbmatch ai" (1315) → ai-jobbmatchning; "ai rekrytering" (869) → ai-rekrytering-sverige.

### 1.4 Kannibalisering och slutsats om sökavsikt

- **"jobbcoach" / "vad gör en jobbcoach" / "jobbcoach lön"** = definitionsavsikt. Ägs av `vad-ar-en-jobbcoach` (7 300 ord, redan med AF, fack, TRR, pris). Rör inte.
- **"jobbcoach online" / "karriärcoaching online" / "digital jobbcoach"** = jämförelseavsikt online mot människa. Ägs av `jobbcoach-online` (8 200 ord, rankar 2:a i webbsökningen på "digital jobbcoach AI söka jobb"). Om den här artikeln också går på "digital jobbcoach" som huvudsökord tävlar vi mot oss själva med en tredje nästan likadan text. Det var precis den gamla artikelns problem.
- **Ledig avsikt:** praktisk **"söka jobb med AI"**-avsikt: hur använder jag AI som jobbcoach genom hela ansökan, vad ska jag fråga, vad tycker rekryterare, var går gränsen. "ai jobbansökan" har 105 visningar utan en matchande sida (startsidan på pos 26), och SERP:en för "söka jobb med AI" består av Arbetsförmedlingen, Kollega, TNG, Publikt, fackförbund, alla med korta tipslistor (se avsnitt 2). Sluggen "din-digitala-jobbcoach" passar fortfarande, eftersom artikeln handlar om att använda AI som sin jobbcoach.
- **Roll i klustret:** hubb för AI i jobbsökningen. Länkar ned till CV-, brev-, matchnings- och rekryteringsspokes, och lämnar definitionen och prisjämförelsen människa/online åt vad-ar-en-jobbcoach respektive jobbcoach-online (en mening + länk, inte ett eget avsnitt med samma innehåll).

Sökavsikt: informativ med praktisk handling ("hur gör jag"), läsaren är mitt i jobbsökningen och har ofta redan testat ChatGPT. Kommersiell nyans: vill veta om en tjänst gör det bättre än en allmän chattbot.

---

## 2. SERP-benchmark

WebSearch "söka jobb med AI tips" och "digital jobbcoach AI söka jobb" (2026-11-15). Svenska topposter: Arbetsförmedlingen, Kollega, TNG, Globalportalen, Jobbsafari, Sveriges Arkitekter, EnRival, Publikt; på "digital jobbcoach AI söka jobb" ligger jobbcoach.ai/jobbcoach-online 2:a och ai-jobbmatchning med. "AI jobbcoach" utan "söka jobb" ger bara engelska verktygssidor (tripleten, prentus, himalayas), alltså ingen svensk konkurrens alls.

| Sida | Ord (ca) | H2/H3 | Saknar |
|---|---|---|---|
| Arbetsförmedlingen, "Så kan AI hjälpa dig i ditt jobbsökande" (2024-05-14) https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2024-05-14-sa-kan-ai-hjalpa-dig-i-ditt-jobbsokande | 1 100 | Analysera jobbannonsen · Vässa ditt cv · Förbättra personliga brevet · Öva på jobbintervjun · Använd AI som yrkesvägledare · Få förslag på kompetensutveckling · Ta reda på mer om arbetsgivaren · Så kan du instruera AI för att få hjälp med ditt jobbsökande · Tänk på det här när du använder AI | Hur rekryterare ser på AI-text, forskning, exempel på bra/dåliga frågor, när en människa behövs, lön/arbetsrätt |
| Kollega (Elisabeth Brising, 2025-02-05) https://kollega.se/arbetsmarknad/sa-later-du-ai-soka-jobb-dig-tips-fran-proffs | 1 200 | 1. Välj ett AI-verktyg du gillar · 2. Låt AI putsa ditt cv · 3. Matcha ditt personliga brev med jobbannonsen · 4. Fall inte i klysch-fällan · 5. Prompta som ett proffs · 6. Tänk kritiskt, AI kan göra fel | Intervjuövning, siffror, integritet, rekryterarsyn |
| TNG "5 sätt att använda AI när du söker jobb" (uppd. 2026-08-11) https://www.tng.se/soka-jobb/chatgpt-tips/ | 1 200 | Snabbversion · Läser en AI ditt CV? · Så använder du AI när du söker jobb · 1. Skriva CV och personligt brev · 2. Träna inför intervjun · 3. Ta reda på mer om arbetsgivaren · 4. Formulera mejl du annars skjuter upp · 5. Nätverka utan att låsa sig | Ingen statistik med källa, ingen forskning, inga konkreta frågeexempel per steg |

**Slutsats:** SERP:en är kort (1 100 till 1 200 ord) och tipslistig. Ingen har forskning (fältexperimentet nedan), ingen har rekryterarundersökningen med siffror, ingen skiljer på allmän chattbot och en tjänst byggd för svensk arbetsmarknad, ingen har lön/arbetsrätt/a-kassa som coachfrågor. Vi slår dem på djup och konkretion, inte på längd för längdens skull.

**Mål-längd: 1 900 till 2 300 ord synlig text** (ungefär dubbla SERP-snittet; hubbriktmärket 2 200+ från arbetssättet). Inte 7 000 som syskonartiklarna, då blir det en fjärde kopia av samma sak.

---

## 3. SEO-plan

### 3.1 Sökord

- **Huvudsökord:** söka jobb med AI
- **Sekundära:** AI-jobbcoach / AI som jobbcoach, ai jobbansökan, digital jobbcoach (sekundärt, nämns i H1 och ingress, inte i seoTitle), använda AI i jobbansökan, AI intervjuträning, ChatGPT jobbansökan
- **Long tail i FAQ/H2:** ser rekryterare om ansökan är skriven med AI, vad ska man fråga AI när man söker jobb, är det fusk att använda AI i jobbansökan, kan AI ersätta en jobbcoach

### 3.2 Metadata (uppmätta längder)

- **seoTitle (48 tecken):** `Söka jobb med AI: så använder du en AI-jobbcoach`
  Alternativ med varumärke (55): `Söka jobb med AI: din digitala jobbcoach | jobbcoach.ai`
- **description (154 tecken):** `Så använder du AI som jobbcoach i hela jobbsökningen: annonsen, CV:t, brevet och intervjun. Med frågorna som ger bra svar och det rekryterare reagerar på.`
  Alternativ (140): `Söka jobb med AI utan att låta som alla andra: så använder du en AI-jobbcoach för annonsen, CV:t, brevet och intervjun, och var gränsen går.`
- **title / H1 (76, får vara lång):** `Din digitala jobbcoach: så söker du jobb med AI utan att låta som alla andra`
- **imageAlt:** krävs; ny bild enligt "På bordet" (scripts/artikelbild/) när texten är klar. Den gamla bildens alt ("Utkast från en digital jobbcoach till en säljroll ...") hör till den gamla artikeln.
- **date:** behåll 2025-04-18, sätt `updated` till publiceringsdagen.

### 3.3 H2-struktur

Ingress (3 till 4 meningar): de flesta som söker jobb i dag har redan provat en AI-tjänst (SCB: 58 procent av 25 till 34-åringarna). Frågan är inte om, utan hur, utan att brevet låter som alla andras.

**Snabbsvar-block (GEO), H2 "Snabbsvar: hur använder man AI som jobbcoach?"** (60 till 80 ord): Använd AI för att tolka annonsens kravprofil, hitta luckor mellan CV:t och kraven, få ett första utkast att skriva om med egna exempel, och öva intervjusvar. Skicka aldrig AI-texten rakt av, hitta aldrig på meriter, och klistra inte in personnummer eller känsliga uppgifter. Kontrollera fakta om lön och regler mot källan.

1. **H2 Vad kan en AI-jobbcoach hjälpa dig med?** Sex uppgifter, en kort rad var: tolka annonsen och kravprofilen; anpassa CV:t; första utkast till personligt brev; intervjuövning (fråga, svar, återkoppling); frågor om lön, uppsägningstid, a-kassa; hitta jobb du inte sökt på. Länka respektive spoke.
2. **H2 Hur ser rekryterare på ansökningar skrivna med AI?** Jobbland/Kantar Sifo 44 procent försämrad bild, handeln åtta av tio. Åsa Pettersson (TNG): "Använd AI som bollplank, inte som avsändare." Motvikt: fältexperimentet där skrivhjälp gav 8 procent fler anställningar utan att arbetsgivarna blev mindre nöjda. Poängen: det är den oredigerade, generiska texten som straffas, inte hjälpen.
3. **H2 Så använder du en AI-jobbcoach, steg för steg** (äkta sekventiell guide mot ett resultat: en färdig ansökan till en tjänst; howto-frontmatter ok). Steg: 1 Klistra in annonsen och be om kravprofilen i punktform. 2 Lägg CV:t bredvid och be om luckorna. 3 Skriv om CV-raderna själv med siffror. 4 Be om ett brevutkast, stryk allt som inte är sant eller som du inte kan exemplifiera. 5 Öva tre intervjufrågor ur kravprofilen. 6 Läs allt högt och kontrollera fakta innan du skickar.
4. **H2 Vilka frågor ger bra svar?** 6 till 8 konkreta frågeexempel i rutor/lista, skrivna som en rekryterare tänker (kravprofil, meriterande, STAR-svar, lönespann). Kontrast dålig fråga / bra fråga. Detta är det SERP:en saknar mest.
5. **H2 Var går gränsen för vad AI ska göra?** Hallucinationer och fel siffror; integritet (Arbetsförmedlingens varning, citat i avsnitt 4); påhittade meriter (TNG "Fabricera inte erfarenheter eller resultat"); klyschor ("driven lagspelare"); AI öppnar inga dörrar via nätverk.
6. **H2 Vad skiljer en allmän AI-chatt från en jobbcoach byggd för svensk arbetsmarknad?** Ärlig produkttext enligt avsnitt 5: kunskapsbas om svensk arbetsmarknad med källhänvisning i svaret, ditt sparade CV eller brev kan bifogas i samtalet, profilens målroll/stad/bransch ger sammanhang, ger inte juridisk rådgivning utan hänvisar. Plus verktygen runt: CV-analys, brev, jobbmatchning, rekryteringstester. Inga effektsiffror, inga användarfall.
7. **H2 När behöver du en människa i stället?** Kort (150 till 200 ord): lång arbetslöshet (Rusta och matcha, handledare var fjortonde dag), uppsagd tjänsteman (TRR), fackets karriärcoachning (Unionen 1 350 kr/tim för medlemmar). Länk till vad-ar-en-jobbcoach för hela genomgången och till jobbcoach-online för jämförelsen. Inte en ny jämförelsetabell.
8. **H2 Vad kostar det att använda Jobbcoachen?** 3 till 4 meningar: tio meddelanden gratis per konto utan kort, därefter Jobbcoach Premium 149 kr i månaden utan bindningstid. Gratisnivån i övrigt (avsnitt 5).
9. **FAQ** (FAQItem, samma antal som frontmatter).

### 3.4 FAQ (6 st, frontmatter + synliga FAQItem)

1. Är det fusk att använda AI när man söker jobb? (Nej, men allt du skickar ska vara sant och ditt; rekryterarsiffran.)
2. Märker rekryterare om personliga brevet är skrivet med AI? (Generiska formuleringar avslöjar; 44 procent får sämre bild om de vet; skriv om med egna exempel.)
3. Vad ska jag inte klistra in i en AI-tjänst? (Personnummer, hälsouppgifter, andras namn; AF: "kan bli synlig för andra".)
4. Kan en AI-jobbcoach ersätta en mänsklig jobbcoach? (Tar skrivande och övning; nätverk, motivation i lång arbetslöshet och personligt stöd är människans; Rusta och matcha/TRR/facket.)
5. Kan jag öva intervju med AI? (Ja: be om frågor ur kravprofilen, svara, be om återkoppling enligt STAR; länk kompetensbaserad-intervju-star-metoden.)
6. Är Jobbcoachen gratis? (Tio meddelanden per konto; Premium 149 kr i månaden utan bindningstid, Jobbcoachen utan tak.)

### 3.5 Taggar och CTA-kluster

Föreslagna taggar (kontrollerade med `getCtaVariantForTags` i src/lib/cta/clusters.ts, körd mot koden):

`["AI-jobbcoach", "digital jobbcoach", "söka jobb med AI", "jobbsökning", "intervjuförberedelse", "AI i jobbansökan", "CV och personligt brev med AI"]`

→ kluster **interview** → paket **allt** (Jobbcoach Premium) → inline-verktyg **coach** (Jobbcoachen). Det stämmer med sökavsikten: läsaren vill ha en coach genom hela sökningen.

Varning: **dagens taggar** (`"personligt brev hjälp"`, `"CV hjälp"` m.fl.) ger kluster **letter** → brev-CTA, fel för avsikten. Lägg inte till taggar som innehåller "test" (t.ex. "rekryteringstester"), då vinner test-klustret. "karriärcoaching" ensam utan intervju-tagg ger career → ingen produkt-CTA. Intervju-taggen måste stå kvar.

### 3.6 Interna länkar (alla kontrollerade att filen/rutten finns)

Verktyg (src/app/(public)/verktyg/*/page.tsx finns): `/verktyg/jobbcoachen` (primär CTA), `/verktyg/cv-analys`, `/verktyg/personligt-brev`, `/verktyg/jobbmatchning`, `/verktyg/rekryteringstester`, `/verktyg/linkedin-optimering`. Även `/priser`, `/register`.

Artiklar (content/artiklar/<slug>.mdx finns):
- `/artiklar/skriva-personligt-brev-med-ai` (avsnitt 1 och 3, brevsteget)
- `/artiklar/skapa-cv-med-ai` (CV-steget)
- `/artiklar/ai-jobbmatchning` (hitta jobb)
- `/artiklar/ai-rekrytering-sverige` (hur arbetsgivare använder AI, avsnitt 2)
- `/artiklar/nyckelord-i-cv` och `/artiklar/ats-vanligt-cv` (kravprofil/nyckelord)
- `/artiklar/kompetensbaserad-intervju-star-metoden` och `/artiklar/vanliga-intervjufragor-svar` (intervjuövning)
- `/artiklar/loneforhandling` (lönefrågor)
- `/artiklar/vad-ar-en-jobbcoach` och `/artiklar/jobbcoach-online` (avsnitt 7, ankartext "vad en jobbcoach gör" respektive "jobbcoach online jämfört med en coach per timme", inte "digital jobbcoach")

Länkar som inte finns (använd inte): ats-system, cv-ats, vanliga-intervjufragor, rekryteringstester-guide, anpassa-cv-efter-jobbannons. Aldrig `/kompetensutveckling`.

**Inlänkar (separat ändring, inte i den här omgången):** sidan har noll inlänkar. Efter publicering bör vad-ar-en-jobbcoach, jobbcoach-online, skapa-cv-med-ai, skriva-personligt-brev-med-ai och ai-jobbmatchning länka hit med ankartext kring "söka jobb med AI".

---

## 4. Research (verifierat i källtexten 2026-11-15)

Varje citat nedan är läst på källsidan, inte i en sökmotorsnutt.

1. **SCB, "Generativa AI-verktyg tar plats i svensk vardag" (2025-10-17)**
   https://www.scb.se/hitta-statistik/statistik-efter-amne/forskning-och-det-digitala-samhallet/det-digitala-samhallet/befolkningens-it-anvandning/pong/statistiknyhet/befolkningens-it-anvandning-2025/
   - "37 procent av Sveriges befolkning över 16 år - motsvarande 3,2 miljoner personer - har använt generativa AI-verktyg under de senaste tre månaderna."
   - "Även bland unga vuxna, 25–34 år, har användningen av generativa AI-verktyg ökat kraftigt – från 40 till 58 procent."
   - "Under 2025 uppger 67 procent av personer i åldern 16–24 år att de har använt sådana verktyg, jämfört med 55 procent året innan."
   - "Bland 45–54 åringar har andelen nästan fördubblats, från 23 till 43 procent, och bland 55–64 från 11 till 23 procent."

2. **Arbetsförmedlingen, "Så kan AI hjälpa dig i ditt jobbsökande" (2024-05-14)**, länk i avsnitt 2.
   - "Kopiera texten i annonsen och ladda upp den i ett AI-verktyg"
   - "Du kan be ett AI-verktyg att ställa de frågor till dig som arbetsgivaren kan tänkas fråga"
   - "All information som du laddar upp i AI-tjänsten kan bli synlig för andra"
   - "Kom ihåg att även information från ett AI-verktyg kan innehålla felaktigheter"
   - "Som alltid gäller det att vara källkritisk"

3. **Jobbland, pressmeddelande "Arbetsgivare skeptiska till AI-assisterade ansökningar" (2025-05-14)**
   https://jobbland.se/arbetsliv/pressmeddelande-arbetsgivare-skeptiska-till-ai-assisterade-ansokningar
   - "Enligt en ny undersökning från Jobbland uppger 44 procent av arbetsgivarna att de får en mycket (14%) eller lite (30%) försämrad bild av en kandidat om de får vetskap om att hen använt AI för att skapa eller förbättra sin ansökan."
   - "Samtidigt uppger endast nio procent att de får en lite (7%) eller mycket (2%) bättre bild av kandidaten i fråga."
   - "Den bransch där arbetsgivarna är som mest negativa är inom handeln där åtta av tio rekryterare uppger att de får en försämrad bild om de vet att kandidaten tagit hjälp av AI."
   - "Undersökningen utfördes av Kantar Sifo på uppdrag av Jobbland och Keeparo."
   - Urvalet (315 personer inom rekrytering/HR, hösten 2024) står i pressmeddelandet men fick jag bara som sammanfattning, inte ordagrant. Skriv "en Kantar Sifo-undersökning bland arbetsgivare" utan antalet, eller kontrollera antalet själv före publicering.
   - Obs: rubriken säger "varannan", siffran är 44 procent. Skriv 44 procent.

4. **TNG, "AI i jobbansökan: dos and don'ts från rekryteraren" (2025-11-24, uppd. 2026-07-10)**
   https://www.tng.se/soka-jobb/ai-i-jobbansokan-dos-and-donts-fran-rekryteraren/
   Åsa Pettersson, rekryteringskonsult och konsultansvarig på TNG:
   - "Använd AI som bollplank, inte som avsändare"
   - "Granska allt. Varje gång."
   - "Fabricera inte erfarenheter eller resultat"
   - "Skicka inte massansökningar"
   - Siffrorna i samma artikel (58 % Capterra 2024, 45 % TNG AI-Insights 2025) är andrahandsuppgifter som jag inte kontrollerat i originalrapporterna. Använd inte.

5. **Wiles, Munyikwa & Horton, "Algorithmic Writing Assistance on Jobseekers' Resumes Increases Hires", NBER Working Paper 30886 (jan 2023, rev. okt 2023)**
   https://www.nber.org/papers/w30886
   - "in a field experiment in an online labor market with nearly half a million jobseekers, treated jobseekers received algorithmic writing assistance on their resumes. Treated jobseekers were hired 8% more often."
   - "Contrary to concerns that the assistance takes away a valuable signal, we find no evidence that employers were less satisfied."
   - Förbehåll i texten: internationell frilansplattform, nya på arbetsmarknaden, skrivhjälp på CV (språkrättning), inte AI-skrivna brev. Skriv det så.

6. **Arbetsförmedlingen, Rusta och matcha**
   https://arbetsformedlingen.se/for-arbetssokande/extra-stod/stod-a-o/rusta-och-matcha
   - "Var fjortonde dag har du ett individuellt möte med din handledare och minst var fjärde vecka har du ett fysiskt möte hos leverantören"
   - "Du deltar i Rusta och matcha i sex månader, sedan utvärderar vi hur det har gått."
   - Gäller den "som har varit inskriven på Arbetsförmedlingen under en längre tid" (Arbetsförmedlingen avgör). Ordet är **handledare**, inte coach.

7. **Unionen, "PT för din karriär"**
   https://www.unionen.se/medlemskapet/medlemsformaner/pt-din-karriar
   - "Som medlem i Unionen får du 25 % rabatt på personlig karriärcoachning"; "1 350 kr/timme (ordinarie pris: 1 800 kr/timme)". Tjänster bl.a. "CV - & Jobbcoaching" och "intervjuträning".

8. **TRR** https://www.trr.se/
   - "TRR ger tjänstemän i privat sektor möjlighet att utvecklas genom hela arbetslivet"; vid uppsägning "ekonomisk ersättning, personlig rådgivning och tillgång till en mängd aktiviteter".

9. **Kollega (Edvard Danielsson, karriärcoach på Manpower Matchning)**, länk i avsnitt 2:
   - "Var extremt tydlig med vad du vill ha hjälp med och exakt hur du vill ha det"
   - "Läs alltid igenom vad en AI föreslår. Tänk kritiskt. AI kan göra fel"

Inte verifierat och därför inte användbart: Svenskarna och internet 2026 (sidan gav motsägelsefulla siffror i hämtningen), Remote-undersökningen "82 procent ... falsk information", TNG:s 45 procent, privata coachers timpriser utöver Unionens sida.

---

## 5. Produktfakta (kontrollerat i koden 2026-11-15)

### Jobbcoachen
- **Tio meddelanden gratis per konto, inte per dygn; gränsen öppnar inte igen.** `src/lib/quota/quotaService.ts` (`FREE_CHAT_MESSAGES_PER_ACCOUNT = 10`), räknas i `src/app/api/jobbcoachen/chat/route.ts` (`checkChatQuota`, svar 402 med texten "Du har använt dina tio meddelanden ...").
- **Konto krävs**, anonyma konton nekas. `chat/route.ts` (`user.is_anonymous` → 403).
- **Svarar utifrån en kunskapsbas om svensk arbetsmarknad och anger källa i svaret som (Källa N).** `chat/route.ts`: RPC `search_ai_chunks_hybrid` med `match_count: 6`, systemprompten kräver citering och förbjuder påhittade citat.
  - Vad kunskapsbasen innehåller (läst i databasen, `ai_documents` publika): ca 50 dokument om cv-tips, lön, intervju, arbetsrätt, a-kassa, aktivitetsrapportering, omställningsstudiestöd, nyanlända, branscher. **Senast uppdaterade 2025-11-17, inga käll-URL:er lagrade.** Skriv alltså inte "uppdateras löpande", "hämtar SCB:s lönestatistik direkt" eller "senaste siffrorna". (Landningssidans FAQ och sektionstexter påstår det, se avvikelser nedan.)
- **Använder din profil som sammanhang** (målroll, stad, bransch). `chat/route.ts` (`userContext`).
- **Du kan bifoga ett sparat CV eller personligt brev från kontot till en fråga.** `src/components/jobbcoachen/ChatInput.tsx` (läser `cv_texts` och sparade `letters`), `chat/route.ts` (bilagorna läggs i prompten). Ingen Premium-spärr på bilagor i koden. Skriv inte "ladda upp fil i chatten": `/api/jobbcoachen/upload` finns men anropas inte av gränssnittet.
- **Ger inte juridisk rådgivning, frågar aldrig efter personnummer, håller sig till karriärfrågor.** Systemprompten i `chat/route.ts`.
- **Samtalet ligger kvar när meddelandena är slut.** `src/app/(public)/verktyg/jobbcoachen/components/jobbcoachen-faq-data.ts`; i Premium utan tak (`HELA_PAKETET_RADER` i `src/lib/plans/plans.ts`: "Jobbcoachen, fråga så mycket du vill").

### Relaterade verktyg (gratisnivå enligt kod)
- **CV-analys:** läser bara CV:t, inte annonsen. En analys per konto gratis, visar poängen och det tyngsta fyndet. `src/lib/quota/quotaService.ts` (`CV_ANALYSIS_LIMIT = 1`), `src/lib/cv/gateAnalysisResult.ts` (`FREE_VISIBLE_FINDINGS = 1`), `src/components/pricing/paket-copy.ts` (poäng 1 till 10 på tydlighet och struktur, innehåll, resultat och nyckelord).
- **Personligt brev:** du klistrar in annonsen, brevet skrivs utifrån CV:t och annonsen. Första brevet gratis, sedan ett per rullande sju dygn; gratis att läsa, nedladdning ingår i Premium. `quotaService.ts` (`FREE_LETTERS_PER_ACCOUNT = 1`, `LETTER_WINDOW_DAYS = 7`), `paket-copy.ts` ("ett personligt brev att läsa, nedladdning ingår inte").
  Fem tonlägen gratis: Professionell, Entusiastisk, Kreativ, Självsäker, Balanserad; bara automatiskt tonval kräver Premium. `src/app/dashboard/skapa-brev/components/steps/TonalityLanguageStep.tsx`.
- **Jobbmatchning:** matchar kompetenser, erfarenheter och utbildning mot annonser i Platsbanken (JobTech-data, `supabase/functions/match-jobs/`). Gratis tre träffar, Premium 25 bästa med skälen. `src/lib/jobmatching/freeLimit.ts` (`FREE_TIER_JOB_LIMIT = 3`, `JOB_MATCHES_PER_RUN = 25`). Skriv inte "varje natt" (facit säger körs när sidan öppnas, annonser synkas tre gånger per dygn).
- **Rekryteringstester:** gratis Nivåkollen med genomgång och ett första träningspass, resten i Premium. `src/lib/traning/gratisniva.ts`, `paket-copy.ts`.
- **CV-mallar:** 41 mallar, 3 gratis. `src/lib/cv/template-antal.ts`.

### Pris
- **Jobbcoach Premium, 149 kr i månaden**, enda plan som säljs (`saljs: true` bara för `all_month`). `src/lib/plans/plans.ts`. Dagspasset, vecko- och kvartalsplaner har `saljs: false`: nämn dem inte.
- Innehåll i Premium enligt `HELA_PAKETET_RADER` (plans.ts): alla rekryteringstester, övningsprov och fördjupade personlighetstestet; alla CV-mallar, CV-analysen, personliga brev och LinkedIn; jobbmatchning med alla träffar och skälen; Jobbcoachen utan tak; Bli upptäckt. (Undvik "varje natt" och Bli upptäckt-spärren i artikeln; båda är öppna frågor i produktsvepet.)
- "Utan bindningstid": stod i den granskade artikeln och godkändes i faktagranskningen; uppsägning när som helst.

### Får inte stå i artikeln
- Effektsiffror om användare (intervjufrekvens, svarstid, "X gånger fler"), påhittade användare eller fall som verkliga.
- Kompetensgap-analys, kursförslag, `/kompetensutveckling`.
- "Analyserar ditt CV mot annonsen" om CV-analysen (den läser bara CV:t). Brevet tar annonsen.
- Word-export eller nedladdningsformat.
- "Tränad på lyckade ansökningar", "mönster från lyckade ansökningar".
- Live-data eller löpande uppdaterad kunskapsbas.

### Avvikelser i produkttexten (till samordnaren, utanför uppdraget)
- `src/app/(public)/verktyg/jobbcoachen/components/jobbcoachen-faq-data.ts`: "bifoga ditt CV ingår utan tak i Premium" (bilagor är inte spärrade i koden); "Vår kunskapsbas uppdateras löpande" och "svarsdatum för varje konversation" (kunskapsbasen senast ändrad 2025-11-17); "hämtar lönedata direkt från SCB:s ... och fackförbundens publicerade kollektivavtal" (inga käll-URL:er i basen, kan inte beläggas).
- `src/app/(public)/verktyg/jobbcoachen/page.tsx` rad 16: "Vi hämtar SCB:s officiella lönestatistik per yrke, region och erfarenhet", samma problem.
- `src/components/pricing/paket-copy.ts` och `plans.ts`: "varje natt" om jobbmatchningen, mot facit.

---

## 6. Checklista för copywritern
- seoTitle ≤ 60, description 110 till 158 (värdena ovan är uppmätta).
- 6 `faq` i frontmatter = 6 `<FAQItem>`.
- `howto:` bara för steg-för-steg-avsnittet (6 steg, mot en färdig ansökan).
- Snabbsvar-block direkt efter ingressen.
- Taggar exakt enligt 3.5, inget med "test".
- Noll em-dash, inga slop-fraser, svenska facktermer (kravprofil, meriterande, urval, ansökningshandlingar, handledare).
- Varje siffra med länk till källan i avsnitt 4. Varje produktpåstående mot avsnitt 5.
- imageAlt och ny bild "På bordet".
