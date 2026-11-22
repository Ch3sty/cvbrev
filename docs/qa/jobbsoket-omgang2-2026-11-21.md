# Klicktest: Jobbsöket omgång 2 (lätt pass), 2026-11-21

Gren `feat/jobbsoket-omgang2`, lokal produktionsserver (`next start -p 5232`) mot produktionens databas, befintligt bygge. Körd 23.44 till 23.56 svensk tid. En webbläsare (headless Chrome), en flik, ett konto i taget.

## Ramar

- **Sidladdningar: 22 av 40.** Varje `goto`, omladdning och klick som bytte adress räknades i en räknare som stoppade vid 40. Minst fyra sekunder mellan laddningar.
- Ingen laddning tog över 8 sekunder, inget svar var 502, 503 eller 504, och serverloggen har ingen "upstream request timeout". Passet avbröts aldrig.
- Förhämtning av länkar var avstängd (anrop med `next-router-prefetch: 1` avbröts i webbläsaren, 357 stycken totalt).
- Inga provflöden startades. Ingen Nivåkoll, inget intervjuprov, ingen personlighetstest.
- AI-anrop: två uppföljningsutkast (se fel 4), en "Skriv om kortare", en ny sökning i Matchade jobb (två anrop till `match-jobs`: sökningen och påfyllningen ur cachen).
- Server och webbläsare är stängda, `.next` i `cvbrev-jobbsok2` är borttagen. `arbetsyta.mjs` visar efteråt ingen server från det här passet. Den visar en annan sessions server (`next start` på port 3472 i `cvbrev-brevkvar`) och två puppeteer-webbläsare med tillfälliga profiler som inte är mina; de startades medan passet pågick.

Bilderna ligger i `C:\Users\chris\AppData\Local\Temp\claude\dceaf5763afec129\365ea630-4cba-4310-afae-8f4be3ab8403\scratchpad\jobbsok-qa\bilder\` med prefixet `o3-`, utanför git.

## Mätning

| Sida | Läge | CLS | LCP | responseEnd | Svarstid (DOMContentLoaded) |
|---|---|---|---|---|---|
| `/dashboard/tester` (noll-utan-cv, 412) | kortet synligt, första laddningen | 0 | 1 228 ms | 1 039 ms | 1 143 ms |
| `/dashboard/tester` (noll-utan-cv, 412) | utan kortet | 0 | 336 ms | 278 ms | 304 ms |
| `/dashboard/intervju` (noll-utan-cv, 412) | kortet "När är intervjun?" | 0 | 448 ms | 393 ms | 420 ms |
| `/dashboard/intervju` (noll-utan-cv, 412) | omladdad med raden | 0 | 384 ms | 327 ms | 366 ms |

CLS lästes fem sekunder efter laddningen ur en `PerformanceObserver` för `layout-shift` (utan `hadRecentInput`). Inga skift registrerades på någon av de fyra.

Svarstider för alla 20 serverladdningar: snabbast 258 ms (tjänsten G), långsammast 1 168 ms (`/dashboard/sokta-tjanster?logga=1`, Premium, första sidan efter kontobytet). Två klicknavigeringar på klientsidan: 58 ms och 235 ms.

## Steg 1: kontot utan CV, 412 x 915

| Del | Resultat | Vad jag såg | Bild |
|---|---|---|---|
| Kortet på testernas Hem | **fungerar** | Ögonbrynet "VALFRITT", rubriken "Vilken tjänst övar du inför?", texten och knapparna "Lägg in tjänsten" och "Hoppa över". Kortet ligger efter avsnittet "Vägen framåt" (sidans rubrik heter så, inte "Vägen till provet") och före blocket "Senaste Nivåkollen, i dag", alltså inte allra sist på sidan. CLS 0. | `o3-1-hem-kort-noll-412.png` |
| Fortsätt till Sökta tjänster | **fungerar** | Adressen ordagrant: `/dashboard/sokta-tjanster?logga=1&tjanst=Ekonomiassistent&arbetsgivare=QA+Testbolag+T&fran=test-hem`. Bara de fyra parametrarna, ingen nivå, inget resultat. | |
| Arket på testvägen | **fungerar** | Tjänst och Arbetsgivare ifyllda, Datum sökt tomt och obligatoriskt med hjälptexten "Dagen du skickade ansökan. Datumet står i din månadsrapport." Kryssrutan "Arbetsgivaren har kallat mig till test" tom (rätt för `fran=test-hem`). Raden under knappen byter från "Brickan hamnar under Sökt. Vi säger till om det är tyst efter tolv dagar." till "Tjänsten står som kallad till test. Lägg till intervjun eller beskedet när det kommer." när rutan kryssas. | `o3-1-testark-noll-412.png`, `o3-1-testark-ifyllt-noll-412.png` |
| Spara utan datum | **fungerar, med en avvikelse** | Felraden "Välj dagen du sökte, så blir månadsrapporten rätt." står under fältet, inget anrop gick iväg. Hjälptexten försvinner när felraden visas (felraden ersätter den). Uppdraget väntade sig båda. | `o3-1-testark-fel-noll-412.png` |
| Spara med datum (2026-10-31) och kryss | **fungerar** | Ett POST till `/api/applications` med `fran: "test-hem"` och `kallad_till_test: true`, svaret har `current_status: "test_invited"`. | |
| Kvittensen | **fungerar** | "QA Testbolag T står nu som kallad till test", texten ordagrant enligt 9.16, knappen "Tillbaka till testerna" (`/dashboard/tester?fran=sokta-loggad`) och länken "Öppna tjänsten". | `o3-1-kvittens-noll-412.png` |
| Listan direkt efter sparningen | **fungerar inte** | Se fel 1. Under kvittensen står "Inga sökta tjänster än" och alla räknare 0, också en minut senare, fast sidomenyn redan visar "Sökta tjänster 1" och "Kom igång 2 av 6". | `o3-1-kvittens-noll-412.png`, `o3-1-lista-noll-412.png` |
| Listan efter omladdning | **fungerar** | Gruppen "Väntar svar 1": Ekonomiassistent, QA Testbolag T, "Kallad till test 21 nov" och brickan "Kallad till test". Ingen grupp Följ upp. | `o3-1-lista-omladdad-noll-412.png` |
| Tjänstens sida | **fungerar** | Ögonbrynet "KALLAD TILL TEST", banan Sökt 31 okt, Svar 21 nov. Händelsen "Kallad till test 21 nov" med raden "Besked efter testet". Inget Följ upp-block. Snabbvalen: "Kallad till intervju", "Fick avslag", "Annat" ("Kallad till test" dold eftersom tjänsten redan står så). | `o3-1-tjanst-kallad-test-noll-412.png` |
| Översikt, Att göra nu | **fungerar** | Bara veckans mål ("Sök tre tjänster till"). Inget uppföljningsförslag. Raden under Sökta tjänster: "Ekonomiassistent. Kallad till test 21 nov." | `o3-1-oversikt-noll-412.png` |
| Kom igång-arket | **fungerar** | "2 av 6". Brickan "Logga en tjänst du har sökt" med "Finns under Sökta tjänster" och `aria-label` "..., provad". | `o3-1-komigang-noll-412.png` |
| Testernas Hem igen | **fungerar** | Kortet finns inte, rubriken finns inte i DOM. CLS 0. | |
| `/app/tester` | **inte prövat** | Adressen omdirigeras till `/dashboard/tester` i en vanlig webbläsare (proxyn skickar bara appen dit), så appens variant gick inte att se. Kortets klass och rubrik fanns inte i HTML:en, men kortet hade inte visats ändå eftersom kontot nu har en sökt tjänst. | |
| Inför intervjun, kortet | **fungerar** | Sektionen "Intervjuer på gång" med "När är intervjun?", texten, "Lägg in intervjun" och "Ingen intervju bokad än". CLS 0, LCP 448 ms. | `o3-1-hubb-kort-noll-412.png` |
| "Ingen intervju bokad än" | **fungerar** | Raden "Har du fått en intervjutid? Lägg in den, så räknar vi ner till intervjun." med "Lägg in", fokus på "Lägg in", `localStorage.intervjufraga_ihop = 1` och `data-intervjufraga="ihop"`. Kortet (326 px) blir raden (158 px), så "Dina intervjuprov" flyttar upp 168 px i samma ögonblick som trycket. Det är trycket som flyttar, inget skifte räknas. | `o3-1-hubb-rad-noll-412.png` |
| Omladdning med raden | **fungerar** | Raden står direkt vid DOMContentLoaded, kortet blinkar inte fram. Rubriken på y 640 och "Dina intervjuprov" på y 798 både direkt och efter fem sekunder. CLS 0. | |
| Arket "När är intervjun?" | **fungerar, med en avvikelse** | Rubriken, raden "Vi lägger kallelsen och tiden på tjänsten du väljer.", Dag och Tid i bredd, Plats, "Vilken tjänst gäller intervjun?", valen och "Spara intervjun" med raden under. Se fel 2: valet för tjänsten klipps. Ingen sidledsrullning i 360. | `o3-1-hubb-ark-noll-412.png`, `o3-1-hubb-ark-noll-360.png` |
| Spara intervjun på den sökta tjänsten | **fungerar** | Dag 2026-11-26, 10.00, Storgatan 1, valet "QA Testbolag T, Ekonomiassistent". **Ett** POST (`/api/applications/<id>/events`, `interview_invited`, `fran: "intervju-hubb"`), ingen ny tjänst. Arket stängs, kvittensen "Intervjun är inlagd. Tjänsten ligger också under Sökta tjänster. Öppna tjänsten", väggen "INTERVJU OM 5 DAGAR", "Intervju på QA Testbolag T på torsdag", raden "Torsdag 26 november 10.00, om 5 dagar", "0 av 7 övade" och "Förbered intervjun". | `o3-1-hubb-efter-spara-noll-412.png` |
| Mörkt läge | **fungerar** | Raden, kvittensen och provlistan läsbara, inga ljusa ytor kvar. | `o3-1-hubb-morkt-noll-412.png` |

## Steg 2: Premiumkontot, 1440 x 900

| Del | Resultat | Vad jag såg | Bild |
|---|---|---|---|
| Logga "QA-test besked K" | **fungerar** | Sökdatum 2026-10-21, ett POST. | |
| Kallelse och "Den är genomförd" | **fungerar** | Kallad 2026-11-09, intervju 2026-11-12 10.00. Efter sparningen visas "Hur gick intervjun? Intervjun var torsdag 12 november." direkt utan omladdning. "Den är genomförd" gav `interview_completed` via `/api/jobbsok/intervju/<id>/utfall`, och utkastet skrevs genast (POST mot uppföljningsrutten, ämnet "Tack för intervjun ..."). | |
| Panelen efter omladdning | **fungerar** | Ögonbrynet "TYST I 9 DAGAR", ingressen "Intervjun var torsdag 12 november och du har inte fått besked. Efter en vecka är det helt i sin ordning att fråga.", panelen "Fråga QA Testbolag K om besked" med underraden ur 2.3, "Vad som händer sedan" säger sju dagar och 28 november, väntande raden "Inget besked på 9 dagar. Tystnaden loggar du aldrig själv, den räknar vi ut." Ingen text "har inte hört". | `o3-2-panel-besked-premium-1440.png` |
| Utkastet | **fungerar, med en anmärkning** | Ämnet och texten nedan. Tackar, nämner 12 november, frågar om besked, påstår inget om hur intervjun gick. Tjänsten heter "QA-test besked K" men texten säger "tjänsten som QA-testare" (modellen har skrivit om titeln). | |
| Skriv om kortare | **fungerar** | Ett POST mot `/kortare` (1,3 s). Båda numren kvar ordagrant, hälsningen, avslutet och raden under namnet orörda. Meningen "Ring gärna på 070-123 45 67." skrevs om till "Vid frågor, ring 070-123 45 67." 58 ord blev 38. | `o3-2-efter-kortare-premium-1440.png` |
| Kopiera mejlet och ja | **fungerar** | Frågan "Skickade du mejlet?" med "Ja, det är skickat" och "Inte än". Efter ja: "Följde upp i dag", "Tjänsten lämnar Följ upp. Är det fortfarande tyst 28 november säger vi till igen.", "Ångra" och händelsen "Följde upp 21 nov". Efter ja bara ett POST mot `.../skickad`, inget nytt POST mot `/api/jobbsok/uppfoljning/<id>`. | `o3-2-efter-ja-premium-1440.png` |
| Listan, tjänsten G | **fungerar** | Under "Intervju på gång": "Kallad till intervju den 15 november. Sätt tiden, så påminner vi före intervjun.", brickan "Tid saknas" och knappen "Sätt tiden". Ingen "Följ upp". K står nu under Intervju på gång som "Väntar besked". | `o3-2-lista-G-premium-1440.png` |
| Översikt, Att göra nu | **inte bekräftat** | Tre kort, alla "Förbered intervjun" (Umeå Energi 24 nov, QA Testbolag F 25 nov, QA Testbolag A 27 nov). "Sätt tiden för intervjun" syns inte. Enligt 2.3 sorteras `satt_intervjutid` efter kommande intervjuer, och kontot har tre sådana, så kortet får ingen plats. Raden under Sökta tjänster säger "Kallad till intervju. Sätt tiden när du vet den." | `o3-2-oversikt-premium-1440.png` |
| Tjänsten G i 360 x 800 | **fungerar** | Överst i panelen "Sätt tiden för intervjun" och "Du blev kallad den 15 november. Med tiden satt påminner vi före intervjun. Har den redan varit loggar du det här." Knapparna "Sätt tiden" (134 x 48) och "Intervjun har redan varit" (200 x 48), ingen text klippt, ingen sidledsrullning. | `o3-2-tjanst-G-premium-360.png` |

### Utkastet före kortningen

Ämne: **Tack för intervjun, tjänsten som QA-test besked K**

```
Hej,

Tack för intervjun den 12 november gällande tjänsten som QA-testare.

Jag vill fortfarande ha tjänsten då min erfarenhet av leverantörsreskontra och kundreskontra passar bra för rollen.

När kan jag förvänta mig besked i rekryteringen? Säg till om ni behöver svar på fler frågor.

Vänliga hälsningar
QA Omg2 premium
```

### Med numren inskrivna (före trycket)

```
Hej,

Tack för intervjun den 12 november gällande tjänsten som QA-testare.

Jag vill fortfarande ha tjänsten då min erfarenhet av leverantörsreskontra och kundreskontra passar bra för rollen.

När kan jag förvänta mig besked i rekryteringen? Säg till om ni behöver svar på fler frågor. Ring gärna på 070-123 45 67.

Vänliga hälsningar
QA Omg2 premium
070-123 45 67
```

Texten sparades (PUT 200) före trycket.

### Efter "Skriv om kortare"

```
Hej,

Tack för intervjun 12 november. Min erfarenhet av leverantörs- och kundreskontra passar väl för rollen.

När kan jag förvänta mig besked i rekryteringen? Vid frågor, ring 070-123 45 67.

Vänliga hälsningar
QA Omg2 premium
070-123 45 67
```

## Steg 3: gratiskontot, 412 x 915

| Del | Resultat | Vad jag såg | Bild |
|---|---|---|---|
| Logga "QA-test besked L", kallelse, genomförd | **fungerar** | Sökt 2026-10-21, kallad 2026-11-09, intervju 2026-11-12 10.00, "Den är genomförd". | |
| Följ upp efter omladdning | **fungerar** | "TYST I 9 DAGAR", panelen "Fråga QA Testbolag L om besked". | `o3-2-panel-besked-gratis-412.png` |
| Betalväggen | **fungerar** | Visas direkt i panelen utan tryck: uppföljningsrutten svarar 402 `premium_required` när sidan monteras, och någon knapp för att öppna utkastet finns inte. Texten nedan stämmer ordagrant med 2.5. | `o3-3-betalvagg-gratis-412.png`, `o3-2-panel-besked-hel-gratis-412.png` |
| "Jag har redan skickat det" | **fungerar** | Syns i panelen som en kryssruta med etikett (44 px hög, pekare), går att trycka på. Inte tryckt. | `o3-2-panel-besked-hel-gratis-412.png` |

Betalväggens text, ordagrant:

> **Fler uppföljningsmejl ingår i Premium**
> Ditt gratis utkast är använt. Med Premium skriver vi ett utkast varje gång du vill följa upp, efter en ansökan eller en intervju. Du kan också skriva mejlet själv och logga det här.
> Jobbcoach Premium, 149 kr i månaden.
> Säg upp när du vill.
> [Köp Premium, 149 kr i månaden] [Se vad som ingår]

## Steg 4: Premiumkontot, telefon och sökningen

| Del | Resultat | Vad jag såg | Bild |
|---|---|---|---|
| Annonsen i 412 | **fungerar** | Annonsen "Ekonom (vikariat), För- och grundskoleförvaltningen" öppnas på `/dashboard/jobbmatchning?annons=31734444`. Foten `.j3-fot.rader`: "Skriv brev" 380 x 56, under den "Spara" 146 x 48 (`aria-label` "Spara till Ska sökas") och "Markera som sökt" 226 x 48, med text. | `o3-4-annons-fot-synlig-premium-412.png` |
| Annonsen i 360 | **fungerar** | "Skriv brev" 328 x 56, "Spara" 120 x 48, "Markera som sökt" 200 x 48, ingen text klippt, ingen sidledsrullning. Rullad till botten står "Ansök hos Umeå kommun" ovanför foten och alla tre knapparna går att träffa ovanför bottenmenyn. | `o3-4-annons-botten-premium-360.png` |
| Foten medan man läser | **avvikelse att bedöma** | Se fel 3. Foten följer inte med när annonsen rullas; den syns först vid annonsens slut. | `o3-4-annons-mitt-premium-360.png` |
| Spara | **fungerar** | Ett POST till `/api/jobbsok/ska-sokas`. Knappen blir "Sparad" med bock, en länk till `/dashboard/sokta-tjanster?filter=ska-sokas&fran=annons-fot` (`aria-label` "Sparad i Ska sökas. Visa listan"). Länken trycktes inte. | `o3-4-annons-fot-sparad-premium-412.png` |
| Ny sökning, 1440 | **fungerar** | Före: "2 jobb passar dig", "Senast sökt för 4 timmar sedan". `match-jobs` svarade efter 18,3 s (50 jobb, `hasMore: true`), påfyllningen efter 2,2 s till (250 jobb ur cachen). N direkt efter första svaret: 2. N efter påfyllningen (cirka 23 s efter trycket): 7. Raden "Senast sökt ..." försvann ur listan efter sökningen och kom tillbaka först efter omladdning ("Senast sökt nyss"). | `o3-4-efter-sok-premium-1440.png` |
| Omladdning | **fungerar** | "7 jobb passar dig", samma tre första träffar: 72 Ekonom (vikariat), Umeå kommun; 69 Studerande inom ekonomi sökes till internationellt bolag i Umeå, Clockwork; 46 Vi söker en ekonomiassistent till vårt huvudkontor i Umeå, Nya Umeå City Hotell. | `o3-4-omladdad-premium-1440.png` |

## Fel och avvikelser

1. **Listan i Sökta tjänster uppdateras inte efter loggning på testvägen.** Efter "Logga sökt tjänst" från testernas Hem (`fran=test-hem`) står kvittensen "QA Testbolag T står nu som kallad till test" överst i panelen, men under den står fortfarande "Inga sökta tjänster än", väggen säger "Inga sökta tjänster än" och räknarna Ska sökas, Sökt, Intervju och Erbjudande är 0. Läget stod kvar en minut senare. Sidomenyn hade uppdaterats ("Sökta tjänster 1", "Kom igång 2 av 6"), så `refresh()` ur kontexten gick, men vyns egen lista hämtades inte om. Efter omladdning är listan rätt. Kvittensen och listan säger alltså emot varandra tills sidan laddas om. Förhämtning var avstängd i testet, men bara anrop med `next-router-prefetch: 1` stoppades, inte `router.refresh()`.
2. **Valet av tjänst i arket "När är intervjun?" klipps.** Valen ligger i två kolumner bredvid "En annan tjänst", och texten "QA Testbolag T, Ekonomiassistent" blir "QA Testbola..." i 412 och "QA Testb..." i 360. Tjänstens titel syns inte alls, så den som har flera tjänster hos samma arbetsgivare kan inte skilja dem åt. 9.4 anger `ValKnapp form="rad"`, en rad per tjänst.
3. **Annonsens fot på telefon ligger inte fast.** `.j3-fot` har `position: sticky; bottom: 72px`, men den ligger ensam i en `div.mt-6` som är exakt lika hög som foten, så den har inget utrymme att fastna i. Mitt i annonsen ligger foten 3 500 px längre ned, utanför skärmen, och den syns först när man rullat till slutet. Där är den hel och träffbar. Jag har inte kunnat avgöra om det var så före omgången.
4. **Två AI-utkast i stället för ett på Premiumkontot.** Tjänsten K loggades med sökdatum en månad bakåt och var därmed en tyst obesvarad ansökan när dess sida öppnades första gången. Uppföljningsblocket skrev då genast ett ansökningsutkast (POST vid monteringen) innan kallelsen hann loggas. När "Den är genomförd" sparats skrevs intervjuutkastet. Serverloggen har två `uppfoljning_utkast` och en `uppfoljning_kortare`. Det följer produktens regler; det är testets ordning som gav ett AI-anrop för mycket.
5. **Hjälptexten försvinner i felläget** i arket på testvägen: felraden ersätter "Dagen du skickade ansökan. ..." i stället för att stå tillsammans med den. Uppdraget väntade sig båda. 9.4 säger bara att raden under fältet säger vad som saknas.
6. **Utkastet döper om tjänsten.** "tjänsten som QA-testare" i stället för "QA-test besked K". Ämnesraden (mallen) har rätt titel.
7. Mindre: kortet på testernas Hem ligger under en rubrik som heter "Vägen framåt", och efter kortet kommer blocket "Senaste Nivåkollen", så det står inte sist på sidan. Det stämmer med 9.18 ("före Nederst") om det blocket är Nederst.

## Konsolen

Inga React-fel (#418, #423, #425) och inga `pageerror` på någon sida. Det enda som inte är brus är tre "Failed to load resource: the server responded with a status of 402 (Payment Required)" på gratiskontots tjänstsida, från uppföljningsrutten (väntat). Övrigt är avbrutna förhämtningar som testet själv stoppade.

## Rader i produktionen

Alla står också i `testdata-o2.json` (scratchpad, `pass: "o3"`). Inget raderat.

| Konto | Tabell | Id | Vad |
|---|---|---|---|
| noll-utan-cv | `job_applications` | 103b0ca9-0aa0-4916-8d10-9405862e269a | Ekonomiassistent, QA Testbolag T, sökt 2026-10-31, kallad till test (händelserna `applied` och `test_invited` skapades av servern, id inte fångade) |
| noll-utan-cv | `job_application_events` | e8e43546-7607-4d7c-9d13-6445b3c3feb0 | Kallad till intervju 2026-11-26 10.00, Storgatan 1, från hubben |
| premium | `job_applications` | 26d9aad9-ea69-4808-ab5b-d34e5ef3bf2a | QA-test besked K, QA Testbolag K, sökt 2026-10-21 (händelsen `applied` id inte fångat) |
| premium | `job_application_events` | f687fa70-29aa-498c-a51e-aa894d80deda | Kallad 2026-11-09, intervju 2026-11-12 10.00 |
| premium | `job_application_events` | 457b187a-7182-4c35-abc0-56cd1b16e120 | Intervju genomförd |
| premium | `job_application_followups` | c519b5eb-1efc-481c-bfa8-ee4503e3033e | Intervjuutkastet, kortat, markerat skickat (kopierat). Ansökningsutkastet från första visningen (fel 4) fick inget fångat id; enligt byggnoterna skrivs ett oskickat utkast av fel sort över på plats, så det kan vara samma rad. Om `skickad` också skrev en händelse "Följde upp" fångades inte dess id. |
| premium | `job_applications` (Ska sökas) | 3187ca8e-95b2-4a50-aaea-b5e4dad792fd | Sparad annons: Ekonom (vikariat), Umeå kommun |
| premium | `job_matchings_cache` / `job_matching_summaries` | inget id | En ny sökning 2026-11-21 23.54 |
| gratis | `job_applications` | 13cf507a-5eb6-4cfb-be21-80d0de679245 | QA-test besked L, QA Testbolag L, sökt 2026-10-21 |
| gratis | `job_application_events` | 1bcdb5d0-443c-4055-812e-fb3e65abfdec | Kallad 2026-11-09, intervju 2026-11-12 10.00 |
| gratis | `job_application_events` | a0225861-9197-42df-841d-39a85afdad6f | Intervju genomförd |

Därtill aktivitetsrader från `logActivity` vid loggningarna och en AI-kostnadsrad per AI-anrop, och i noll-utan-cv:s webbläsarprofil nyckeln `intervjufraga_ihop`.

## Inte prövat

- `/app/tester` i appen (omdirigeras i en vanlig webbläsare).
- "Sätt tiden för intervjun" i Att göra nu (kortet fick ingen plats, se steg 2).
- Trycket på "Sparad" och på "Tillbaka till testerna" (inga extra laddningar togs).
- Mörkt läge utöver hubben.

# Omprov efter rättningarna

## Första försöket (2026-11-22, cirka 00.05 till 00.25)

Webbläsarprovet gjordes inte av den som rättade: `scripts/arbetsyta.mjs` visade fem gånger en annan sessions server (port 3472) och under 3 GB ledigt minne. Samordnaren gjorde sedan provet med ägarens ja mot en dev-server på port 5232 (`next dev --webpack`) och fann att fel 1 och fel 3 stod kvar och att fel 2 inte gick att se (bilder `o4-1-*`, `o4-3-*`).

## Andra försöket (natten till 2026-11-22)

Mot samordnarens dev-server på port 5232 (inte stängd, ingen egen startad), headless Chrome med kontots profil, en flik, förhämtning avstängd (förfrågningar med `next-router-prefetch` och `purpose: prefetch` avbröts), minst fem sekunder mellan laddningar.

**Sidladdningar: 8 av 12** (räknaren `o4-raknare.json`). Fyra på kontot utan CV, två på Premium, en på kitsidan, och en som aldrig gick iväg (Git Bash gjorde om `/jobb3-kit` till en filsökväg och Chrome vägrade adressen; den räknades ändå). Därtill ett `curl` mot `/jobb3-kit` för att kompilera sidan. Inget svar var 502, 503 eller 504, ingen laddning tog över 6 sekunder. Inga provflöden, inga AI-anrop, ingen sökning. Bilderna ligger i scratchpadens `jobbsok-qa\bilder\` med prefixet `o4-5-`.

### Fel 1

| Försök | Arbetsgivare | Kod | Resultat |
|---|---|---|---|
| 1 | QA Testbolag V | rättningen i `11ee21c6` | Inte i listan efter 8 s. Omläsningen (`/dashboard/sokta-tjanster?_rsc=…`) svarade 200 och svaret innehöll tjänsten, men ingen omritning följde. |
| 2 | QA Testbolag W | samma, med loggning av historik och RSC-anrop | Samma. Ordningen: `rensaAdress` gör `replaceState`, sedan en omläsning av den rena adressen, sedan Next:s egen historikskrivning för restore. Efter omläsningens svar kom ingen ny skrivning: svaret lades aldrig in. |
| 3 | QA Testbolag X | ny rättning (`router.replace`) | I listan 1,1 s efter POST-svaret, under Väntar svar som "Kallad till test 22 nov". Räknarna "Sökt 4", "Alla 5", "Väntar svar 4", väggen "Fem är på väg". Kvittensen "QA Testbolag X står nu som kallad till test" kvar överst. Adressen `/dashboard/sokta-tjanster`. |
| Utan `fran` | QA Testbolag Y | ny rättning | I listan 0,6 s efter POST-svaret ("Sökt 5", "Alla 6", väggen "Sex är på väg"). Ingen kvittens (rätt utan testvägen). |

Bilder: `o4-5-fel1-testvag-noll-412.png` (försök 3; försöken 1 och 2 skrev över samma namn) och `o4-5-fel1-utan-fran-noll-412.png`.

### Fel 3

Premiumkontot, annonsen "Ekonom (vikariat)" (`?annons=31734444`). `main.dashboard-main-content` rullar (fönstrets `scrollY` är 0); provet rullade den. main:s bottenpadding är 0 medan foten finns, 40 px i 1440.

| Bredd | Läge | Foten (topp till botten, höjd) | Navet (topp, höjd) | Glipa | "Ansök hos Umeå kommun" |
|---|---|---|---|---|---|
| 360 x 800 | överst | 586 till 728, 142 | 728, 72 | 0 | långt ned |
| 360 x 800 | en bit ned | 586 till 728 | 728 | 0 | långt ned |
| 360 x 800 | längst ned | 586 till 728 | 728 | 0 | 542 till 559, ovanför foten |
| 412 x 915 | överst | 701 till 843, 142 | 843, 72 | 0 | långt ned |
| 412 x 915 | en bit ned | 701 till 843 | 843 | 0 | långt ned |
| 412 x 915 | längst ned | 701 till 843 | 843 | 0 | 657 till 674, ovanför foten |

Kvar för annonsen i 360 x 800: 586 px ovanför foten. Kontot visar dessutom en banderoll "Bekräfta din e-post" på 44 px överst, så den läsbara ytan blir 542 px; utan banderollen 586. I 412 x 915: 701 px (657 med banderollen). Ingen sidledsrullning. I 1440 är foten dold. Bilder: `o4-5-fel3-{overst,mitten,botten}-premium-{360,412}.png`.

### Fel 2

Kitsidan `/jobb3-kit`, avsnittet "När är intervjun? Valet av tjänst (9.4)", arket öppnat med "Lägg in intervjun". Fyra rader i full bredd (380 px i 412, 328 px i 360), höjd 68 px för en kort titel, 102 px för den långa och 56 px för "En annan tjänst". Titeln står som huvudtext och arbetsgivaren under. Den långa titeln och det långa företagsnamnet bryts på två rader och klipps först där. Vald rad: ljus bakgrund och mörkgrön kant, inget rött. Ingen sidledsrullning. Bilder: `o4-5-fel2-ark-val-412.png`, `o4-5-fel2-ark-val-vald-412.png`, `o4-5-fel2-ark-val-360.png` (360 efter `setViewport`, utan omladdning).

### Rader i produktionen

Alla på kontot utan CV, i `testdata-o2.json` med `pass: "o4"` (V utan id):

| Tabell | Id | Vad |
|---|---|---|
| `job_applications` | 8f084ae1-50c0-46d4-b972-b7ee34cfa7a3 | Redovisningsassistent, QA Testbolag U, samordnarens prov |
| `job_applications` | inte fångat | Redovisningsassistent, QA Testbolag V, sökt 2026-11-01, kallad till test (POST-svaret kom efter skriptets väntetid; raden finns, listan visade den efter försök 3) |
| `job_applications` | 500a6ae7-b323-4f0f-8e62-7a888dcaf750 | Redovisningsassistent, QA Testbolag W, sökt 2026-11-01, kallad till test |
| `job_applications` | a230a2e3-824c-4a0c-bae1-ff7cd701c150 | Redovisningsassistent, QA Testbolag X, sökt 2026-11-01, kallad till test |
| `job_applications` | 003bce4c-a869-4046-bf43-0d93959a2f9f | Redovisningsassistent, QA Testbolag Y, sökt 2026-11-01, utan testvägen |

Därtill servern skapade händelser (`applied`, `test_invited`) och aktivitetsrader. Inget raderat.

### Konsolen

En varning om hydrering ("A tree hydrated but some attributes …") på varje sida i dev-läge, också på sidor som inte ändrats. Inga `pageerror`.

Testwebbläsaren är stängd. Dev-servern på port 5232 står kvar.
