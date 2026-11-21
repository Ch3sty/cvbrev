# Jobbsöket, klicktest i produktion 2026-11-21

Mot `https://www.jobbcoach.ai`, en headless Chrome, en flik, två QA-konton (gratiskontot och Premiumkontot), 1440×900 och Pixel 7 (412×915, mobil-UA, pekskärm). Klockan cirka 15.05 till 15.45 svensk tid. Inga köp, inga mejl skickade. Skärmbilder och sparad nätverkstrafik ligger i arbetsmappen `scratchpad\jobbsok-qa\` (`bilder\`, `natet\`), utanför git.

Viktigt om läget under testet: produktionen var långsam. Matchade jobb för gratiskontot tog 8 till 33 sekunder för dokumentet och gav en gång 504 FUNCTION_INVOCATION_TIMEOUT, Premiumkontots Matchade jobb tog en gång 40,6 s (annars 1,8 s). Postgres-loggen visar statement timeout på läsningen av hela körningen i `job_matchings_cache` vid flera av gratiskontots laddningar. Andra sessioner anropade också `match-jobs` under testet, och en ny deploy gick ut under testet (deploy-id byttes från `dpl_A14Q...` till `dpl_BqS7...` omkring 15.40).

## 1. Gratisnivån i Matchade jobb

| Steg | Utfall | Vad jag såg | Konto, bredd | Bild |
|---|---|---|---|---|
| Första laddning | fungerar inte | Sidan visade "Vi har inte letat än" fast kontot hade en körning från 12.32 (rad i `job_matchings_cache`). Loggen visar fem GET mot `job_matchings_cache?select=jobs,...` med status 500 (statement timeout) i samma minut. | gratis, 1440 | 1-laddning-gratis-1440.png |
| Ny sökning (testets enda) | fungerar delvis | "Hitta jobb som passar", 35 s. `match-jobs` gav 50 annonser med full text och `hasMore`, sedan en påfyllning. Rubriken "2 jobb passar dig, två är öppna", 600 annonser lästa. Men körningen sparades aldrig: edge-funktionen loggade "Cached matching for 1 hour" medan PostgREST svarade 500 på upserten (14.10.03 och 14.10.39 UTC). Cacheraden står kvar från 11.32 UTC. | gratis, 1440 | 1-sokning-pagar-gratis-1440.png, 1-efter-sokning-gratis-1440.png |
| Omladdning efter sökningen | fungerar inte helt | Listan byttes: efter sökningen Clockwork 69 och Nya Umeå City Hotell 46, efter omladdning Umeå kommun 72 och Clockwork 69. Servern räknade ur den gamla körningen (11.32), medan "Senast sökt nyss" kom ur sessionStorage. Sidan visar alltså nyare tid än datan den visar. React #418 i konsolen. | gratis, 1440 | 1-omladdning-gratis-1440.png |
| HTML:en, två träffar | fungerar | Dokumentet hade två annons-id (31734444, 31716065), inga andra arbetsgivare ur poolen. Inga dolda rader (kontot hade bara två träffar inom 100 km). | gratis, 1440 | natet/p1c-omladdning-gratis-1440/002-document.txt |
| Översikt `?oversikt=1` | fungerar, med fel datum | Samma två träffar i samma ordning. Men sista ansökningsdag visas en dag för sent, se fel 1. | gratis, 1440 | 1-oversikt-gratis-1440.png |
| Ändra sökprofil (Stockholm till) | fungerar | Arket sparade (PATCH profiles 204) och hämtade `/api/jobbmatchning/pool`. Efter omladdning ny sammanfattning: "11 jobb passar dig, tre är öppna", fem dolda rader. Sammanfattningens `updated_at` 14.12.31 UTC, men `korning_at` 11.32.44 UTC (den gamla körningen, inte sökningen jag gjorde). | gratis, 1440 | 1-sokprofil-stockholm-gratis-1440.png, 1-efter-sokprofil-gratis-1440.png |
| HTML:en med 11 träffar | fungerar | Exakt tre annons-id (31734444, 31716065, 31660132). De fem dolda raderna bär bara `placeholderId` (dold-0 till dold-4) och `relevance` (40, 40, 40, 39, 32), `hiddenCount` 8. Ingen av de dolda annonsernas id eller arbetsgivare (Umeå Universitet, Allakando, Experis, Bilbolaget Nord m.fl.) finns i dokumentet. | gratis, 1440 | natet/p1c-omladdning2-gratis-1440/028-document.txt |
| Tidsstämplar | anteckning | Före: "600 annonser lästa · senast i dag", "Senast sökt nyss" (sessionStorage). Efter ändrad sökprofil: samma rubrikrad, "Senast sökt för en minut sedan" till "för 7 minuter sedan". Ingen av texterna visar körningens verkliga tid (11.32 UTC). | gratis | |
| Poolen och match-jobs | anteckning (känt, avsnitt 5 punkt 2) | `match-jobs`: 50 annonser med full text (512 kB). `/api/jobbmatchning/pool`: 120 annonser (1,2 MB). | gratis | natet/p1b-sok-gratis/006-fetch.txt, natet/p1e-sokprofil-gratis/003-fetch.txt |
| `/api/jobbmatchning/annons?id=` | fungerar | Öppen annons 31734444 gav 200. Dold annons 31760528 (en av de åtta) gav 404 "Annonsen finns inte i dina träffar". Annons 31761084 ur poolen gav 404. | gratis | |
| Dold rad vald, betalväggen | fungerar | `?annons=dold-0`: "Dold träff, Matchar ditt CV till 40 procent", rubrik "Se varför du passar för alla 11", "Jobbcoach Premium, 149 kr i månaden. Säg upp när du vill.", knapp "Köp Premium, 149 kr i månaden", länk "Se vad som ingår" till /priser. 149 kr stämmer med `plans.ts`. | gratis, 1440 och 412 | 1-dold-vald-gratis-1440.png, 1-dold-vald-gratis-412.png |
| Köpknappen ett steg | fungerar | `/dashboard/valj-spar?paket=all_month&steg=kop&plats=jobbtraffar`. Stannade där. | gratis, 1440 | 1-kopsteg-gratis-1440.png |
| Telefon | fungerar | Lista med 11, tre öppna, "Umeå och Stockholm". | gratis, 412 | 1-lista-gratis-412.png |
| Sökprofilen återställd | fungerar, långsamt | Båda orterna borttagna, "Från ditt CV: Umeå" igen (som före testet). Första försöket gav "Application error: a client-side exception" med "Connection closed." Andra försöket: dokumentet tog 32,7 s, en resurs gav 504. | gratis, 1440 | fel-p1k-1440.png, 1-sokprofil-aterstalld-gratis-1440.png |
| Premium som jämförelse | fungerar | 1,8 s. "11 jobb passar dig", åtta rader och "Visa 3 till", annonsen bredvid listan (rubriken vid x 828), sista ansökningsdag på varje rad, kompetenserna en och en (Visma, Excel, Bokslut, Svenska). På telefon: listan och en annons som egen vy, bakåt fungerar. Telefonladdningen tog 40,6 s och gav React #418. | Premium, 1440 och 412 | 1-premium-1440.png, 1-premium-lista-412.png, 1-premium-annons-412.png |

**Fel under punkt 1**

1. **Sista ansökningsdag en dag fel på servern, och hydreringsfelet #418.** `/dashboard?oversikt=1` och serverns HTML för `/dashboard/jobbmatchning` visar "Sista dag tis 1 dec, 10 dagar kvar" för annonsen med `application_deadline` "2026-11-30T23:59:59". Webbläsaren visar "Sista dag 30 nov, 9 dagar kvar". Väntat: 30 nov överallt. Orsak: `dagFor()` i `src/lib/jobbsok/datum.ts` gör `new Date(v)` på en tid utan zon, som tolkas i serverns UTC och blir 00.59 den 1 december i Stockholm. Skillnaden mellan serverns och klientens text är också sannolikt det sporadiska "Minified React error #418 (args text)" på Matchade jobb (fem gånger i testet). Översikt ritas bara på servern och visar därför fel dag utan varning.
2. **En ny sökning sparas inte, och sidan visar ändå "Senast sökt nyss".** `match-jobs` säger "Cached" men upserten till `job_matchings_cache` får 500 (statement timeout). Efter omladdning, eller efter en ändrad sökprofil, räknas listan ur den gamla körningen. Väntat: den nya sökningen. Det känns igen från avsnitt 4 punkt 5, men här syns följden för användaren.
3. **Läsningen av hela körningen fäller sidan.** Gratiskontots Matchade jobb: tom sida "Vi har inte letat än" trots körning, 504 FUNCTION_INVOCATION_TIMEOUT en gång, 17 och 33 s andra gånger, "Connection closed." en gång. Loggen: GET `job_matchings_cache?select=jobs,total_jobs_found` 500 fem gånger 14.08 UTC, statement timeout också 14.18 och 14.19. Varje sådan läsning belastar produktionsdatabasen.

## 2. Sökta tjänster, listan

| Steg | Utfall | Vad jag såg | Konto, bredd | Bild |
|---|---|---|---|---|
| Listan öppnas | fungerar | "Sex är på väg", bana med fyra stationer, filter med antal, grupperna Följ upp, Intervju på gång, Ska sökas, Väntar svar, Avslutade. | Premium, 1440 och 412 | 2-lista-premium-1440.png, 2-lista-premium-412.png |
| Gratis | fungerar | Listan, banan och veckans mål visas för gratiskontot utan spärr. | gratis, 1440 och 412 | 2-lista-gratis-sida-gratis-1440.png, 2-lista-gratis-412.png |
| "Jag har sökt" via arket | fungerar | POST `/api/applications` 200, raden under Väntar svar, "Sökt 21 nov". | Premium, 1440 | 2-logga-sokt-ark-premium-1440.png |
| "Jag ska söka" via arket | fungerar | POST `/api/jobbsok/ska-sokas` 200, raden under Ska sökas med "Sista dag tis 1 dec, 10 dagar kvar". | Premium, 1440 | 2-logga-skasoka-efter-premium-1440.png |
| Arket förifyllt via adressen | fungerar | `?logga=1&tjanst=…&arbetsgivare=…&ort=Luleå&lank=…`: alla fält ifyllda, Fler detaljer öppet, datum i dag. Esc stänger och tar bort `logga` ur adressen. | Premium, 1440 och 412 | 2-forifyllt-premium-1440.png, 2-ark-premium-412.png |
| "Markera som sökt" på en Ska sökas-rad | fungerar | Arket "Markera som sökt" med tjänst och arbetsgivare ifyllda. Raden blev en sökt tjänst. Knappen stod på "Sparar" i mer än 3,5 s. | Premium, 1440 | 2-markera-sokt-efter-premium-1440.png |
| Rad med passerad sista dag | fungerar | "Sista dag har passerat" med "Ta bort" och "Sökt ändå". Arkets datumfält har `min` i dag men tog emot gårdagen. | Premium, 1440 | 2-lista-passerade-premium-1440.png |
| "Sökt ändå" | fungerar | Arket "Markera som sökt", POST `/ska-sokas/<id>/sokt` 200, raden under Väntar svar ("Sökt 19 nov"). | Premium, 1440 | 2-sokt-anda-efter-premium-1440.png |
| "Ta bort" | fungerar | Frågan "Ta bort raden?", DELETE 200, raden borta. | Premium, 1440 | 2-ta-bort-premium-1440.png, 2-ta-bort-efter-premium-1440.png |
| Lista, Statistik, Rapport | fungerar | `?vy=statistik` (tratt, aktivitet per vecka, hur du sökte, svar per CV), `?vy=rapport` (Aktivitetsöversikt), Lista utan parameter. | Premium, 1440, statistik även 412 | 2-statistik-premium-1440.png, 2-rapport-premium-1440.png, 2-statistik-premium-412.png |
| Filter och bakåt | fungerar | Intervju ger `?filter=intervju`. Bakåt till listan, bakåt igen till `?vy=rapport`, framåt till listan. | Premium, 1440 | 2-filter-intervju-premium-1440.png |
| Sök i listan | fungerar | "Testbolag" gav de tre egna raderna; "zzqq" gav "Inga sökta tjänster matchar sökningen." med "Visa alla". | Premium, 1440 | 2-sok-premium-1440.png, 2-sok-ingen-premium-1440.png |

**Iakttagelser under punkt 2**

- Väggens Ska sökas-station räknar inte rader med passerad sista dag (3), filtret Ska sökas gör det (5). Väggens Sökt 5 mot filtret Väntar svar 5 men gruppen Väntar svar 4 (en ligger under Följ upp). Kanske avsett, men talen skiljer sig på samma sida.
- När en sökt tjänst som kom från Ska sökas togs bort kom raden tillbaka under Ska sökas (byggbeslut 14). Den raden går inte att ta bort i gränssnittet förrän sista dagen passerat, eftersom aktiva rader bara har "Markera som sökt" och "Skriv brev".
- Ett ark på gratiskontot stod på "Sparar" i mer än tio sekunder; raden sparades ändå senare och blev en dubblett när jag loggade om (se testdatan).

## 3. En sökt tjänst

| Steg | Utfall | Vad jag såg | Konto, bredd | Bild |
|---|---|---|---|---|
| Kallad till intervju med dag, tid, plats | fungerar, med en brist | Arket: Dagen du blev kallad, Intervjuns dag, Tid, Plats, Anteckning. Sparat 20 nov, 26 nov 13.30, plats. Svaret hade `interview_at` 2026-11-26T12:30Z. Se fel 1 nedan. | Premium, 1440 | 3-kallad-ark-premium-1440.png, 3-kallad-premium-1440.png |
| Kallelseraden och raden Intervju | fungerar | Efter Redigera: "Kallad till intervju 20 nov" (dagen kallelsen kom) och "Intervju tors 26 nov 13.30", väggen "Intervju torsdag 26 november, 13.30, Om 5 dagar". | Premium, 1440 | 3-redigerad-premium-1440.png |
| Ändra tid | fungerar | Arket förifyllt (26 nov, 13.30, plats). Ändrat till 27 nov 09.15, PUT `/api/jobbsok/intervju/<id>` 200. Raden: "fre 27 nov 09.15. Om 6 dagar. Den 28 november frågar vi hur det gick". | Premium, 1440 | 3-andrad-tid-premium-1440.png |
| Rätta en händelse | fungerar | Växlar till redigeringsläge med "Ta bort" per händelse och "Klar". Ingen händelse togs bort. | Premium, 1440 | 3-ratta-ark-premium-1440.png |
| Redigera | fungerar | Arket "Redigera sökt tjänst" förifyllt. Datum sökt 17 nov och ny titel sparades (PUT 200), sidan uppdaterades. | Premium, 1440 | 3-redigera-ark-premium-1440.png, 3-redigerad-premium-1440.png |
| Ta bort tjänsten | fungerar | Frågan med texten om historik, DELETE 200, tillbaka till listan. Tjänsten var min egen ("QA-test ska söka B"). | Premium, 1440 | 3-ta-bort-ark-premium-1440.png, 3-ta-bort-efter-premium-1440.png |
| Telefon | fungerar | Tjänsten och Förbered intervjun ritas. | Premium, 412 | 3-tjanst-premium-412.png, 3-forbered-premium-412.png |
| Linjen i det mörka frågekortet | syns inte | Fyra bilder av "Berätta om dig själv": dsf 1 och 2, helsida och fönster. Ingen tunn linje i någon. Pixelanalys av kortets nedre del visar bara den avsedda mörkare kanten (5 px). Sidan rullar i en inre behållare, så "helsida" blev samma som fönstret; därför tog jag också två bilder med fönstret uppsträckt till hela sidans höjd (1631 och 1731 px). Ingen linje där heller. | Premium, 1440 | 3-fragekort-helsida-dsf1/dsf2, 3-fragekort-fonster-dsf1/dsf2, 3-fragekort-hogt-fonster-dsf1/dsf2, zoom-*.png |

**Fel under punkt 3**

1. **En kallelse daterad före sökdatumet syns inte som kallelse.** Tjänsten var loggad som sökt 21 nov (förvalet i arket). Kallelsen sparades med dagen 20 nov och intervju 26 nov. Väntat: läget Kallad till intervju och raden Intervju 26 nov 13.30. Det som hände: sidan stod kvar på "Väntar svar", ingen intervjurad, och banan visade "Intervju 20 nov". Först när sökdatumet ändrades till 17 nov visades allt rätt. Det kan hända på riktigt när någon loggar en gammal ansökan i dag och sedan kallelsen. Adress: `/dashboard/sokta-tjanster/f3e97f79-…`.

## 4. Hur gick intervjun?

| Steg | Utfall | Vad jag såg | Konto, bredd | Bild |
|---|---|---|---|---|
| Tre tjänster med intervju i går | fungerar | Sökt 10 nov, kallad 15 nov, intervju 20 nov 10.00. | Premium | |
| Först i Att göra nu | fungerar | Väggen "Hur gick intervjun på QA Testbolag G?" och Att göra nu med tre "Hur gick intervjun"-rader, "Intervjun var fredag 20 nov". | Premium, 1440 och 412 | 4-oversikt-premium-1440.png, 4-oversikt-premium-412.png |
| I listan | fungerar | Under Intervju på gång: "Intervjun var fredag 20 november. Hur gick den?" med knappen "Hur gick intervjun?". | Premium, 1440 | 4-lista-premium-1440.png |
| På tjänstens sida | fungerar | "Intervjun har varit", NÄSTA STEG "Hur gick intervjun?" med tre knappar. | Premium, 1440 | 4-tjanst-E-sida-premium-1440.png |
| "Den är genomförd" | fungerar | POST `/utfall` 200, händelsen "Genomförde intervju 20 nov" (intervjudagen). Blocket "Hur gick intervjun?" stod kvar tills sidan laddades om. | Premium, 1440 | 4-genomford-premium-1440.png, 4-genomford-omladdad-premium-1440.png |
| "Den blev flyttad" | fungerar | Arket "Ny tid för intervjun". 25 nov 14.00 sparat, sidan visar "Intervju onsdag 25 november, 14.00" och Förbered intervjun. | Premium, 1440 | 4-flyttad-ark-premium-1440.png, 4-flyttad-premium-1440.png |
| "Den blev inställd" | fungerar | Ingen fråga, tiden togs bort, läget "Kallad till intervju" med "Sätt tid". | Premium, 1440 | 4-installd-premium-1440.png |

Iakttagelse: efter "Den är genomförd" står frågeblocket kvar på sidan tills den laddas om, fast rubriken redan bytt till "Intervju genomförd".

## 5. Uppföljningsmejlet, Premium

Tjänsten Norrmejerier (tyst 15 dagar, utkast från bygget).

| Steg | Utfall | Vad jag såg | Konto, bredd | Bild |
|---|---|---|---|---|
| Öppna utkastet | fungerar | Utkastet kom med sidan (inget nytt anrop). 40 ord, "Skriv om kortare", "Öppna i e-post", "Kopiera mejlet", "Vad som händer sedan" med 3/12. | Premium, 1440 och 412 | 5-utkast-premium-1440.png, 5-foljupp-premium-412.png |
| Ändra texten, ladda om | fungerar, långsamt | Sparas vid blur. Första försöket syntes inte efter en omladdning 3 s senare; i andra försöket visade omladdningen första försökets text, och servern hade andra försökets text (`updated_at` 14.34.41). Sparningen tar alltså mer än 3 s, och en snabb omladdning visar en äldre version. | Premium, 1440 | 5-andrad-fore-premium-1440.png, 5-andrad-omladdad-premium-1440.png |
| "Skriv om kortare" (en gång) | fungerar | 8,1 s, 200, `rewrites` 2, omskrivningar kvar 1, 36 ord. Min tillagda rad "PS. QA-test, ändrad text." försvann i omskrivningen. | Premium, 1440 | 5-kortare-premium-1440.png |
| "Kopiera mejlet" | fungerar | Urklippet hade hela brödtexten, knappen bytte till "Kopierat", frågan "Skickade du mejlet?" visades. | Premium, 1440 | 5-kopierat-premium-1440.png |
| Ja på "Skickade du mejlet?" | fungerar inte | POST `/skickad` 200 (`sent_via` kopierat) och "Följde upp 21 nov, Uppföljningsmejlet kopierat och skickat." bland händelserna. Men i stället för "Följde upp i dag" och Ångra skrev sidan genast ett **nytt AI-utkast** (ämne "Min ansökan till tjänsten som ekonomiassistent", 70 ord, skapat 14.35.44, 3 s efter skickad). Se fel 1. | Premium, 1440 | 5-skickat-premium-1440.png, 5-skickat-vantat-premium-1440.png |
| Lämnar filtret Följ upp | fungerar | `?filter=folj-upp`: "Följ upp 0", "Inga sökta tjänster med det här filtret just nu." | Premium, 1440 | 5-filter-foljupp-premium-1440.png |
| Ångra | fungerar inte | Ingen Ångra-länk finns på sidan, varken med eller utan `?steg=folj-upp`, eftersom vyn visar det nya utkastet. Rutten svarar dessutom 409 `utkast_finns` när ett oskickat utkast finns. | Premium, 1440 | 5-angra-saknas-premium-1440.png |

`mailto` (läst före skickat, avkodat): mottagare tom, ämne **"Uppföljning: Ekonomiassistent"**, text:

> Hej,
>
> Jag sökte tjänsten som ekonomiassistent den 6 november och undrar hur ni ligger till i rekryteringsprocessen.
>
> Jag är fortsatt mycket intresserad av rollen och svarar gärna på eventuella frågor eller kompletterar med mer information.
>
> Vänliga hälsningar
> QA Omg2 premium

Det utkastet skrevs före rättningen av ämnesraden (byggbeslut 11) och innehåller "mycket intresserad", som prompten förbjuder; omskrivningen behöll "fortsatt mycket intresserad". Det nya utkastet har mallens ämnesrad.

**Fel under punkt 5**

1. **"Ja, det är skickat" skapar ett nytt utkast och tar bort Ångra.** Adress `/dashboard/sokta-tjanster/0d576ab5-ad94-4814-9127-01819c1241ce?steg=folj-upp`. Väntat: "Följde upp i dag" med Ångra. Det som hände: `onAndrat` gör `router.refresh()`, blocket `folj-upp` ritas om (adressen bär `?steg=folj-upp`), `Uppfoljning` startar om utan utkast och kör `hamta()`, alltså POST som för Premium skriver ett nytt AI-utkast. Ett AI-anrop per uppföljning går till spillo, tjänsten står med ett oskickat utkast fast den lämnat Följ upp, och Ångra går inte att nå. Ingen konsoltext. På gratiskontot syntes inte felet, eftersom POST där ger 402 och vyn ritar betalväggen igen (se punkt 6).

## 6. Uppföljningsmejlet, gratis

| Steg | Utfall | Vad jag såg | Konto, bredd | Bild |
|---|---|---|---|---|
| Ta bort tjänsten med det gamla utkastet | fungerar | Dagab (testdata från bygget) bar utkastet. "Ta bort tjänsten", DELETE 200. | gratis, 1440 | 6-ta-bort-dagab-gratis-1440.png |
| Två egna tjänster, sökta 8 nov | fungerar, långsamt | "QA-test tyst H" och "QA-test tyst I". Arket för I stod på "Sparar" i mer än tio sekunder och sparades senare, så I finns två gånger. | gratis, 1440 | fel-nytjanst-1440.png |
| Första utkastet (H) | fungerar | POST 200, AI-utkast, ämne "Min ansökan till tjänsten som QA-test tyst H", 64 ord. Texten skriver "tjänsten som QA-test" (titeln kapad). | gratis, 1440 | 6-forsta-utkast-gratis-1440.png |
| Betalväggen (I) | fungerar | POST 402 `premium_required`. Rubrik "Fler uppföljningsmejl ingår i Premium", text "Ditt gratis utkast är använt på en annan tjänst. Med Premium skriver vi ett utkast till varje tjänst du vill följa upp. Du kan också skriva mejlet själv och logga det här.", "Jobbcoach Premium, 149 kr i månaden. Säg upp när du vill.", knapp "Köp Premium, 149 kr i månaden", "Se vad som ingår", och "Jag har redan skickat det" bredvid. | gratis, 1440 | 6-betalvagg-gratis-1440.png |
| Köpknappen ett steg | fungerar | `/dashboard/valj-spar?paket=all_month&steg=kop&plats=uppfoljning`. Stannade där. | gratis, 1440 | 6-kopsteg-gratis-1440.png |
| "Jag har redan skickat det" | fungerar | POST `/skickad` 200 (`sent_via` eget, utan text), "Följde upp i dag ... 3 december", Ångra synlig. Händelselistan sa fortfarande "Följde upp, läggs till när du har skickat" tills sidan laddas om. 402-anropet före tog 28 s. | gratis, 1440 | 6-redan-skickat-gratis-1440.png |
| Telefon | inte prövat | Bytet till telefonstorlek på gratiskontot fick tidsgräns (30 s) när sidan laddades om; jag avbröt där. Gratiskontots Sökta tjänster och Matchade jobb i 412 finns från tidigare steg. | gratis, 412 | |

## Rader jag skapade

Hela listan med tider står i `scratchpad\jobbsok-qa\testdata.json`.

Premiumkontot:
- `job_applications` f3e97f79-712e-41f4-a048-be1ca7601c39 "QA-test sökt A (redigerad)", med kallelsen a4f1243a-e89b-4074-8362-1f3f264732d8 (intervju 27 nov 09.15). **Finns kvar.**
- `job_saved_ads` 481b6347-9e37-467f-9c3c-351fe905f9ff "QA-test ska söka B". Blev sökt tjänst 79df0f65-eb33-433d-8ee6-4dcb5279f133, som jag tog bort i punkt 3; raden kom då tillbaka under Ska sökas. **Raden finns kvar**, tjänsten är borttagen.
- `job_saved_ads` 578ae881-9978-4e8a-82cf-327dc4782711 "QA-test passerad C", blev sökt tjänst 5ca90628-5af6-47ae-9df3-2285c080e934 genom "Sökt ändå". **Båda finns kvar** (raden dold).
- `job_saved_ads` fa994a7d-bae6-4ae2-b7eb-2cd3f0be82a2 "QA-test passerad D". **Borttagen** genom "Ta bort".
- `job_applications` b23536fd-b58b-4c29-902b-1640bd50abf0 "QA-test intervju E" med kallelsen 4d80dc77-db94-4137-a73d-da78cd20e4dc och genomförd 6dc81a94-65a6-40bf-8c64-b84264ef3a45. **Finns kvar.**
- `job_applications` d16d998a-155c-41f7-8e4f-b4aec3799be3 "QA-test intervju F" med kallelsen bc7f3b35-75c3-405b-936e-786c8996ffc2 (flyttad till 25 nov 14.00). **Finns kvar.**
- `job_applications` 59743ca6-c04a-4891-a771-f4d152d4cf13 "QA-test intervju G" med kallelsen 8a2e0db5-6676-4352-b87e-a3f99841e239 (inställd, utan tid). **Finns kvar.**
- `job_application_followups` 19e3a202-1c2a-451a-aaeb-124f7610b50c, det oavsiktliga nya AI-utkastet på Norrmejerier. **Finns kvar.** Byggets utkast bd933119 på samma tjänst står nu som skickat (kopierat, 21 nov), med min ändring och en omskrivning.

Gratiskontot:
- Tog bort byggets tjänst Dagab c79b8f40-acd2-4df5-8d0e-cd99a7709057 med dess utkast (enligt uppdraget).
- `job_applications` fc7e51c5-c1eb-4a7b-a573-b24b1fc0a53a "QA-test tyst H" med utkastet ebe14a0c-917a-4c0b-abc3-a9af92369ae0 (kontots gratisutkast). **Finns kvar.**
- `job_applications` 6d36873c-a713-45cb-9a37-de648ddd2e2f "QA-test tyst I" med "redan skickat" 62adbdd9-e5df-4fe1-afad-61736c33ed9f. **Finns kvar.**
- `job_applications` b12641af-dd39-4bb4-a524-6f73390bf222 "QA-test tyst I", dubbletten. **Finns kvar.**
- Sökprofilen ändrades (Stockholm till) och återställdes till inga orter. `job_matching_summaries` skrevs om av sidan.

Inget är raderat utöver D och de två tjänster uppdraget nämnde.

## Konsolfel per sida

| Sida | Text | Antal |
|---|---|---|
| `/dashboard/jobbmatchning` | Minified React error #418 (args text), se fel 1 under punkt 1 | 5 |
| `/dashboard/jobbmatchning` | Failed to load resource: 504 | 2 |
| `/dashboard/jobbmatchning` | Connection closed. (sidan blev "Application error: a client-side exception") | 1 |
| `/dashboard/sokta-tjanster` | Failed to load resource: 504 | 1 |
| `/dashboard/sokta-tjanster` | Connection closed. | 1 |
| `/dashboard/sokta-tjanster/<id>?steg=folj-upp` (gratis) | Failed to load resource: 402 (förväntat, spärren) | 2 |
| `/dashboard/valj-spar` | Failed to load resource: 404 (okänd resurs) | 2 |
| Flera | WebSocket till Supabase realtime stängd innan anslutning; CSS-preload oanvänd | flera |

Ingen hydreringsvarning på Sökta tjänster, en tjänst, Översikt eller valj-spar i det här testet.

Webbläsaren är stängd, inga Chrome-processer från testet ligger kvar.


# Pass 2, punkt 7 till 13

Mot `https://www.jobbcoach.ai`, samma headless Chrome och samma två QA-konton (egen `userDataDir` per konto), en flik, minst tre sekunder mellan sidladdningar. Klockan cirka 15.50 till 16.15 svensk tid. Datorflödet i 1440×900 först, sedan en egen webbläsarstart per konto för Pixel 7 (412×915, mobil-UA, pekskärm). Inga köp, inga mejl. Bilderna ligger i `scratchpad\jobbsok-qa\bilder\` med prefixet `p2-`, raderna jag skapade i `scratchpad\jobbsok-qa\testdata-p2.json`.

Produktionen svarade för det mesta snabbt (0,4 till 3 s per dokument), med undantag: `/dashboard/mina-brev` för Premiumkontot gav **504 FUNCTION_INVOCATION_TIMEOUT efter 34,7 s**, Inför intervjun tog en gång 12,4 s, Jobbcoachen 7,6 s, Skriv brev från en träff låg som skelett i mellan 15 och 25 s, och en `user_activities`-POST tog 22 s och fick 500. Postgres-loggen visar statement timeout 14.40 till 14.44 UTC (före passet), och andra sessioner var aktiva under passet. Ett omförsök av Dina brev på Premiumkontot och ett andra intervjuprov på gratiskontot nekades av behörighetssystemet; jag gick inte runt det.

## 7. Rapporten

| Steg | Utfall | Vad jag såg | Konto, bredd | Bild |
|---|---|---|---|---|
| Rapporten öppnas | fungerar | "Rapporten för november", 23 dagar kvar till 14 dec, månaderna NOV (10 sökta jobb, 2 intervjuer) och OKT (2 sökta jobb), rapportbladet med tre avsnitt och siffrorna 12, 7, 6, 0. | Premium, 1440 och 412 | p2-7-rapport-premium-1440.png, p2-7-rapport-premium-412.png |
| Byt månad | fungerar | Oktober: två rader (Bostaden, Länsförsäkringar Västerbotten), 0 spontana, 0 intervjuer. Adressen ändras inte vid månadsbyte. | Premium, 1440 | p2-7-rapport-oktober-premium-1440.png |
| Kopiera som text | fungerar | Knappen heter "Kopiera som text till AF-rapporten" och byter till "Kopierad". Urklippet för november: "Aktivitetsrapport november 2026", nio annonserade, en spontan, två intervjuer, "Totalt: 10 sökta jobb (9 annonserade, 1 spontana), 2 intervjuer." Oktober gav motsvarande text. | Premium, 1440 | p2-7-rapport-kopierad-premium-1440.png |
| Skriv ut eller spara som PDF | fungerar (finns) | Knappen finns och är aktiv. Inte klickad. | Premium, 1440 | |
| Delningslänk utan lista | fungerar | POST 200 (`show_company_names` false), länken visas och ligger i urklippet. Publika sidan utloggad: 200, "Jobbsökningsöversikt", kontots namn, 12 sökta, 6 intervjuprocesser, 0 erbjudanden, "Processen i siffror" och "Flödesdiagram" (gamla stilen, känt). Ingen lista. | Premium, 1440 och 412 | p2-7-lank-utan-premium-1440.png, p2-7-dela-utan-premium-utloggad-1440.png, -412.png |
| Återkalla, utan lista | fungerar | "Återkalla länken", DELETE 200 (`revoked` 1). Samma adress utloggad: "Länken har upphört" (HTTP 200). | Premium, 1440 och 412 | p2-7-aterkallad-utan-premium-1440.png, p2-7-dela-utan-aterkallad-premium-utloggad-1440.png, -412.png |
| Delningslänk med lista | fungerar | POST 200 (`show_company_names` true). Publika sidan har tabellen Datum, Tjänst, Arbetsgivare, Sätt, Status med alla tolv. I 412 rullar tabellen i sidled inne i kortet; kolumnerna Sätt och Status syns inte utan att rulla. | Premium, 1440 och 412 | p2-7-dela-med-premium-utloggad-1440.png, -412.png |
| Återkalla, med lista | fungerar | DELETE 200, "Länken har upphört". | Premium, 1440 och 412 | p2-7-dela-med-aterkallad-premium-utloggad-1440.png, -412.png |
| Gratis: radlistorna låsta | fungerar | Bladets rader är grå platshållare (fem rader under avsnitt 1). Låset: rubrik "Din rapport är sammanställd", text "Vi har räknat ihop månaden i Arbetsförmedlingens format. Att logga dina sökta tjänster ingår i gratisnivån. Att hämta ut den färdiga rapporten ingår i Premium.", "Jobbcoach Premium, 149 kr i månaden. Säg upp när du vill.", knapp "Köp Premium, 149 kr i månaden", länk "Se priset" till /priser. Skriv ut och Kopiera finns inte. | gratis, 1440 och 412 | p2-7-rapport-gratis-1440.png, p2-7-rapport-gratis-412.png |
| Gratis: köpknappen ett steg | fungerar | `/dashboard/valj-spar?paket=all_month&steg=kop&plats=af_rapport`. Stannade där. | gratis, 1440 | p2-7-kopsteg-gratis-1440.png |
| Gratis: delningslänk med lista | fungerar (känt avsteg) | Kryssrutan "Visa lista med företag och tjänster" finns på gratiskontot. Länken skapades (knappen stod på "Skapar" i mer än 4 s), och den publika sidan visade hela listan med fem rader. Återkallad, "Länken har upphört". | gratis, 1440 och 412 | p2-7-lank-med-gratis-1440.png, p2-7-dela-med-gratis-utloggad-1440.png, -412.png |

**Fel och iakttagelser under punkt 7**
- Urklippstexten skriver "1 spontana" (väntat "1 spontan"). Liten textsak.
- Den publika sidan visar kontots fullständiga namn överst. Antagligen avsett, men värt att veta inför delning.
- Den återkallade länken svarar HTTP 200 med texten "Länken har upphört", inte 404 eller 410.
- Gratiskontot kan dela listan, som väntat i produktion (beslut 17 är rättat på grenen).

## 8. Inför intervjun

| Steg | Utfall | Vad jag såg | Konto, bredd | Bild |
|---|---|---|---|---|
| Hubben | fungerar | "Intervju på Umeå Energi på tisdag", två av sju övade, Nästa fråga "Skriv om svaret om dig själv". "Intervjuer på gång" med sex rader: tre med tid (24, 25, 27 nov, "Förbered intervjun"), QA Testbolag G "Sätt tid", Länsförsäkringar och QA Testbolag E "Väntar på besked" med "Uppdatera". | Premium, 1440 och 412 | p2-8-hubb-premium-1440.png, p2-8-hubb-premium-412.png |
| Nästa fråga till svaret | fungerar | "Öva på nästa fråga" gick till `/dashboard/intervju/ny?fraga=beratta`, "Fråga 1 av 7 · Inför Umeå Energi på tisdag", svarsfältet med minst 200 tecken. | Premium, 1440 | p2-8-nasta-fraga-premium-1440.png |
| Kort svar och Bedöm mitt svar | fungerar | På "Ett problem du löste" (`?fraga=star`, tidigare prov 3 av 5, resultatet saknades): fyra meningar, 400 tecken. POST `/api/public/intervjuprov` 200 efter 17 s, sidan bytte till det bedömda svaret efter 22 s. Väggen: brickan **"upp från 3 av 5"**, "Övertygande, 5 av 5", alla fyra STAR-brickor "Fanns med", omskrivet svar med en hakparentes att fylla i. | Premium, 1440 | p2-8-svar-skrivet-premium-1440.png, p2-8-bedomt-premium-1440.png |
| Tillbaka till hubben | fungerar, med gammal data | Länken "Inför intervjun" gick till hubben, men hubben visade fortfarande bara det gamla provet ("Godkänt, i dag. Resultatet saknades.") och fråga 5 utan status. Efter en omladdning stod det nya provet överst ("Övertygande, i dag"). | Premium, 1440 | p2-8-hubb-efter-premium-1440.png, p2-8-hubb-omladdad-premium-1440.png |
| Uppdatera på en tjänst som väntar besked | fungerar | Gick till `/dashboard/sokta-tjanster/d8212fe0-…` (Länsförsäkringar Västerbotten, "Intervju genomförd"). | Premium, 1440 | p2-8-uppdatera-premium-1440.png |
| STAR-brickorna, linjen i T | syns inte | Se nedan. | Premium, 1440 | p2-8-star-*.png |
| Gratis: hubben före prov | fungerar | "Sju frågor som nästan alltid kommer", alla "Inte gjord än", "Inga prov än", rutan "Så ser det ut på gratisnivån: Ett prov per dygn ingår. Dagens är kvar." med "Se vad som ingår" till /priser. Ingen "Intervjuer på gång" (kontot har inga). | gratis, 1440 | p2-8-hubb-gratis-1440.png |
| Gratis: dagens prov | fungerar | Samma svar på "Ett problem du löste": 200 efter 18,6 s, "Övertygande, 5 av 5", alla fyra brickor "Fanns med". | gratis, 1440 | p2-8-bedomt-gratis-1440.png |
| Gratis: nästa prov påbörjas | inte prövat | `/dashboard/intervju/ny?fraga=beratta` öppnas som vanligt utan betalvägg; spärren kommer först när "Bedöm mitt svar" trycks (servern svarar då med kvotfelet före AI-anropet enligt koden). Att trycka nekades av behörighetssystemet, så betalväggens rubrik, text, pris och `plats` är inte sedda. Hubben säger efter provet "Nästa prov öppnar i morgon". | gratis, 1440 och 412 | p2-8-nasta-gratis-gratis-1440.png, p2-8-hubb-gratis-412.png |

**STAR-brickorna (deviceScaleFactor 1 och 2, helsida och fönster, plus uppsträckt fönster 1440×1399).** Linjen i brickan T syns **inte i någon** av de fem bilderna: `p2-8-star-helsida-dsf1`, `-fonster-dsf1`, `-helsida-dsf2`, `-fonster-dsf2`, `-hogt-fonster-dsf1` (utsnitt `*-T.png` och `*-rad.png`). Pixelraderna i brickans nedre del är jämna (244) fram till den avsedda nedre kanten. Två saker att veta: helsidesbilden blir 1425 px bred (rullningslisten dras av), så layouten flyttar sig cirka 15 px mot fönsterbilden och ett utsnitt på fönstrets koordinater hamnar fel; och bakom brickraden syns i alla bilder en svag kant av en något mörkare rektangel som spänner över alla fyra brickor. Den kanten är densamma i alla varianter och ligger under brickorna, inte i T. Slutsats: linjen var troligen ett fel i bildtagningen, inte i sidan.

**Fel under punkt 8**
1. **Hubben säger att resultatet saknades i ett svar som fick 5 av 5.** Gratiskontot, `/dashboard/intervju` (sedd i 412): Nästa fråga "Skriv om svaret om ett problem du löste. Du fick 5 av 5 i dag, och det var resultatet som saknades. Skriv om med resultatet, så ser du om nivån lyfter." och brickan R "Saknades" under "Förra svaret, del för del", medan själva bedömningen (`/dashboard/intervju/92cbb2c6-…`) visar alla fyra delar "Fanns med". Väntat: ingen saknad del vid 5 av 5, och en annan nästa fråga. Trolig orsak: hubben läser bedömningens `missing_kind` ("resultatet") via `saknadDel()` utan att ta hänsyn till betyget, medan vyn för det bedömda svaret gör det. Ingen konsoltext.
2. **Hubben visar gammal data efter tillbakalänken från ett bedömt svar.** `/dashboard/intervju` via länken "Inför intervjun" direkt efter en bedömning: det nya provet saknas tills sidan laddas om. Väntat: det nya provet överst. Troligen Next-routerns klientcache. Ingen konsoltext.

## 9. Jobbcoachen

| Steg | Utfall | Vad jag såg | Konto, bredd | Bild |
|---|---|---|---|---|
| Förslagen ur läget | fungerar | "Frågor utifrån ditt läge, hämtade ur dina sökta tjänster": UE "Hur svarar jag på lönefrågan hos Umeå Energi?", UE "Vad frågar jag arbetsgivaren på intervjun?", QT "Hur länge är det rimligt att vänta på besked?", BO "Hur ber jag Bostaden om återkoppling efter avslaget?". Stämmer med läget (intervju hos Umeå Energi, väntar besked, avslag hos Bostaden). | Premium, 1440 och 412 | p2-9-jobbcoachen-premium-1440.png, p2-9-jobbcoachen-premium-412.png |
| Tryck på ett förslag | fungerar | Texten "Hur länge är det rimligt att vänta på besked?" lades i fältet. Ingen POST skickades. | Premium, 1440 | p2-9-forslag-i-faltet-premium-1440.png |
| Skicka, läs svaret | fungerar | POST `/api/jobbcoachen/chat` 200 efter 1,7 s, klart efter cirka 12 s. Svaret var en kort replik och en motfråga ("Har du fått någon tidsram från rekryteraren ..."). **Ingen källrad**, eftersom svaret inte citerade någon källa. | Premium, 1440 | p2-9-svar-premium-1440.png |
| Nytt samtal | fungerar | Samtalet tömdes direkt, utan fråga, tillbaka till "Fråga vad du vill" med samma förslag. | Premium, 1440 | p2-9-nytt-samtal-premium-1440.png |
| Gratis: kvoten | fungerar | Ett förslag ("Vad skriver jag i ett uppföljningsmejl?"). Rutan "Så ser det ut på gratisnivån": tio gröna prickar och "10 gratis meddelanden kvar på kontot". | gratis, 1440 och 412 | p2-9-jobbcoachen-gratis-1440.png, p2-9-jobbcoachen-gratis-412.png |
| Gratis: ett meddelande, källraden | fungerar | Frågan om uppsägningstid enligt LAS efter tre år. Svar: två månader med fotnot 1, och en motfråga om kollektivavtal. Under svaret "KÄLLOR: Karriärexpert, LAS - Lagen om anställningsskydd (grunderna för alla arbetstagare)". Kvoten efteråt: "9 gratis meddelanden kvar på kontot", Översiktens kvotrad "Chatt 1/10". Kontot är alltså nio meddelanden från spärren. | gratis, 1440 | p2-9-svar-gratis-1440.png |

**Iakttagelser under punkt 9**
- Förslaget om väntetid skickas som ren text utan tjänstens läge, så Jobbcoachen svarade med en motfråga om tidsram fast läget (intervju genomförd 18 och 20 nov) redan finns i rummet.
- Källraden på gratiskontot anger källan "Karriärexpert", medan raden över fältet lovar "källor från Arbetsförmedlingen, SCB och fackförbund".
- Källraden på Premium gick inte att se: svaret saknade citat, och fler meddelanden än ett per konto ingick inte i uppdraget.

## 10. Bli upptäckt, Meddelanden, Arbetsstil

| Steg | Utfall | Vad jag såg | Konto, bredd | Bild |
|---|---|---|---|---|
| Bli upptäckt med samtycke | fungerar | "Inte sökbar", "Ett av fem steg klara", fem steg med "Dölj", förhandsvisningen "Ej synlig" med testpercentiler (Matrislogik topp 91 %, Verbalt topp 71 %, Numeriskt topp 96 %) och styrkor. Tillbakalänk "Jobbsöket", ingen flik markerad i väggen. | Premium, 1440 och 412 | p2-10-bli-upptackt-premium-1440.png, -412.png |
| Fäll ihop, ladda om, fäll ut, ladda om | fungerar | "Din pitch": `aria-expanded` true, false efter tryck, false efter omladdning, true efter nytt tryck, true efter omladdning. Inga React-fel i konsolen. | Premium, 1440 | p2-10-ihopfalld-premium-1440.png, p2-10-ihopfalld-omladdad-premium-1440.png |
| Visningar av profilen | anteckning | Inget står om visningar. Koden visar dem bara när profilen är synlig, och synligheten är avslagen. | Premium, 1440 | |
| Bli upptäckt utan samtycke | fungerar | Tre steg (Du väljer vad som visas, Rekryterare hittar profilen, Du godkänner varje kontakt), rutan "Innan du säger ja: Bli synlig för rekryterare" med "Det här visas" (bland annat "Verifierade testresultat med percentiler") och "Det här visas aldrig", knappen "Kom igång". Inget samtycke givet. | gratis, 1440 och 412 | p2-10-bli-upptackt-gratis-1440.png, -412.png |
| Meddelanden, tomt läge | fungerar | "Inga meddelanden än. Gör dig synlig i Bli upptäckt. När en rekryterare hör av sig chattar ni direkt här." med "Gå till Bli upptäckt". Tillbakalänk "Bli upptäckt". Samma på båda kontona. | båda, 1440 och 412 | p2-10-meddelanden-premium-1440.png, p2-10-meddelanden-gratis-1440.png, -412.png |
| Meddelanden med en riktig förfrågan | inte prövat | Kräver ett rekryterarkonto som skickar en förfrågan. | | |
| Arbetsstil | fungerar | "Din arbetsstil", "Din rapport är nästan klar", sex låsta avsnitt, "Gör det fördjupade testet, 120 frågor". Tillbakalänk "Jobbsöket" i stället för flik. | Premium, 1440 och 412 | p2-10-arbetsstil-premium-1440.png, -412.png |
| `/dashboard/introduktion` | fungerar, men inte som HTTP-omdirigering | Inloggad: **HTTP 200**, inte 307 eller 308. Sidan omdirigerar i strömmen: `NEXT_REDIRECT;replace;/dashboard;308;` och `<meta http-equiv="refresh" content="0;url=/dashboard">`. Slutadress `/dashboard`. Utloggad: 307 till `/login`. Kontrollerat med en hämtning med kontots kakor, för att inte ladda Översikt en extra gång. | Premium | |

**Iakttagelser under punkt 10**
- Steget "Vilket CV vill du visa för rekryterare?" har radioknappen tom fast CV:t "Sara Testsson" står där, och "Nästa steg: Välj vilket CV som ska driva profilen". Det är läget på kontot, inte ett fel.
- Omdirigeringen från introduktion är en `redirect()` i en serverkomponent, inte en regel i `next.config` eller proxyn. Webbläsaren landar rätt, men den som letar efter 308 i nätverkstrafiken hittar 200.

## 11. Dina brev

| Steg | Utfall | Vad jag såg | Konto, bredd | Bild |
|---|---|---|---|---|
| Dina brev, Premium | fungerar inte | `/dashboard/mina-brev`: **504 FUNCTION_INVOCATION_TIMEOUT efter 34,7 s**. Ett omförsök nekades av behörighetssystemet. | Premium, 1440 | p2-11-dina-brev-premium-1440.png |
| Skriv brev utan annons, Premium | fungerar | `/dashboard/skapa-brev` laddades på 2,5 s med tom annons. Listan "Börja med ett jobb" finns inte här (den ligger i Dina brev). Ingen konsoltext. | Premium, 1440 | p2-11-skapa-brev-premium-1440.png |
| Listan "Börja med ett jobb som passar ditt CV", gratis | fungerar | "Ur dina matchningar. Annonsen följer med in i brevet." Tre jobb: Ekonom (vikariat), Umeå kommun, Umeå (sista dag 1 dec); Studerande inom ekonomi, Clockwork, Umeå (sista dag 11 dec); Kundservicemedarbetare på Allente, Concentrix (ingen ort, sista dag 28 nov). Länken "Alla matchningar" (inte öppnad). | gratis, 1440 och 412 | p2-11-dina-brev-gratis-1440.png, -412.png |
| Rätt ort (Umeå för Premiumkontot) | inte prövat för Premium | Premiumkontots Dina brev gav 504. Gratiskontot (CV i Umeå) fick Umeå-jobb. | | |
| Tryck på ett jobb | fungerar, långsamt | "Skriv brev" gick till `/dashboard/skapa-brev?cv=a4a254fc-…`. Sidan låg som tomt skelett i minst 15 s och var ifylld efter högst 25 s: "Annonsen kom från jobbmatchningen: Ekonom (vikariat) ... hos Umeå kommun", annonsfältet med titel, arbetsgivare och ort, förhandsvisningen med "Umeå kommun" och ämnesraden. Inget brev skrevs, och ingen rad skapades i `letters`. Under laddningen tog en POST till `user_activities` 22 s och fick 500. | gratis, 1440 | p2-11-skriv-brev-ifyllt-gratis-1440.png (skelettet), p2-11-skriv-brev-efter20s-gratis-1440.png |
| Konsolen på Skriv brev | fungerar | Inga hydreringsvarningar (#418, #423, #425) på Skriv brev i något av försöken, varken med eller utan annons. | båda, 1440 | |

**Fel under punkt 11**
1. **Dina brev ger 504 för Premiumkontot.** `https://www.jobbcoach.ai/dashboard/mina-brev`, cirka 15.00 UTC. Väntat: sidan med listan. Det som hände: Vercels tidsgräns efter 34,7 s, konsol "Failed to load resource: the server responded with a status of 504 ()". Supabase-loggen visar att sidans egna läsningar (`letters`, `job_applications`, `profiles`) svarade 200 i samma sekund, så tiden gick troligen åt någon annanstans i sidans serverdel. Samma sida laddade på 3,0 s och 6,8 s för gratiskontot.
2. **Sista ansökningsdag en dag för sent** i listan: "Sista dag 1 dec" för Umeå kommun (samma fel som fel 1 under punkt 1 i pass 1, fortfarande live).
3. **Skriv brev från en träff tar 15 till 25 s innan annonsen syns.** Under tiden visas bara ett skelett.

## 12. Översikt

| Steg | Utfall | Vad jag såg | Konto, bredd | Bild |
|---|---|---|---|---|
| Väggen, Premium | fungerar | "Intervju på Umeå Energi på tisdag", "Förbered intervjun", "En kvart räcker.", banan Ska sökas 3 (närmast tors 26 nov), Sökt 5 väntar svar, Intervju "3 bokade, 3 väntar besked" (i 412 "6 på gång"). | Premium, 1440 och 412 | p2-12-oversikt-premium-1440.png, p2-12-oversikt-premium-412.png |
| Att göra nu, Premium | fungerar | Tre: Förbered intervjun på Umeå Energi (tis 24 nov 10.00), QA Testbolag F (ons 25 nov 14.00), QA Testbolag A (fre 27 nov 09.15). Alla tre har texten "Börja med Berätta om dig själv, där du fick 3 av 5". | Premium, 1440 och 412 | |
| Veckans mål, Premium | fungerar | "Veckans mål klart: 4 av 4" med "Ändra" (412: "Målet klart: 4 av 4"). | Premium | |
| Raden Bli upptäckt, Premium | fungerar | Under "Mer i Jobbsöket": "Bli upptäckt. Rekryterare kan hitta dig, anonymt. Du godkänner varje kontakt." Inga tal (känt, avsnitt 4 punkt 7). | Premium, 1440 | p2-12-oversikt-hel-premium-1440.png |
| Väggen, gratis | fungerar | "Följ upp QA Testbolag I. Du sökte QA-test tyst I den 8 november och har inte hört något på 13 dagar." med "Skriv uppföljningen". Banan: Ska sökas 1, Sökt 5 (två "tyst 13 dagar"), Intervju "Ingen just nu". | gratis, 1440 och 412 | p2-12-oversikt-gratis-1440.png, p2-12-oversikt-gratis-412.png |
| Att göra nu, gratis | fungerar | Tre: Följ upp QA Testbolag I (tyst 13 dagar), Följ upp QA Testbolag H ("utkastet är skrivet", "Öppna utkastet"), Sök Ica Lager senast onsdag 25 nov. | gratis | |
| Veckans mål, gratis | fungerar | "Veckans mål: 1 av 3 sökta" med "Ändra". | gratis | |
| Raden Bli upptäckt, gratis | fungerar | Samma text som Premium. Därtill kvotraden Brev 0/1, Analys 0/1, Chatt 1/10, Tester 0, Sparade brev 0/2. | gratis, 1440 | p2-12-oversikt-hel-gratis-1440.png |
| "Logga sökt tjänst" | fungerar | 1440: knappen uppe till höger i väggen på båda kontona. 412: inte i väggen; en bred knapp långt ner på sidan (y 2602 på gratis, 2671 på Premium, i den inre rullytan), inte synlig utan att rulla. | båda, 1440 och 412 | |
| Översikt utan CV | inte prövat | Kontona har CV. | | |
| Översikt med CV men utan sökta tjänster | inte prövat | Kontona har sökta tjänster. | | |

**Iakttagelser under punkt 12**
- 412 skriver "Ska sökas, 1 sparade" på gratiskontot (1440: "1 sparad"). Väntat "1 sparad".
- Matchningsrutan på gratiskontot säger nu "22 jobb som passar dig" (pass 1: 11), med samma tre öppna.
- Sista dag "tis 1 dec" för Umeå kommun, samma datumfel som ovan.
- Rutan "Två uppgifter saknas i brevhuvudet" (Telefon, Ort) står längst ner på båda kontona.

## 13. Tomma lägen och mörkt läge

| Steg | Utfall | Vad jag såg | Konto, bredd | Bild |
|---|---|---|---|---|
| Sökning utan träff | fungerar | "zzqq finns inte": "Inga sökta tjänster matchar sökningen." med "Visa alla". | Premium, 1440 | p2-13-sok-tomt-premium-1440.png |
| Filter utan rader | fungerar | "Erbjudande 0" gav `?filter=erbjudande` och "Inga sökta tjänster med det här filtret just nu." med "Visa alla". | Premium, 1440 | p2-13-filter-tomt-premium-1440.png |
| Rapporten för en månad utan sökta tjänster | inte prövat | Månadslistan går bara från första sökta månaden till i dag (Premium: nov, okt; gratis: nov), och alla har rader. Tomtexten finns i koden ("Inga sökta tjänster är loggade för ...") men går inte att nå med de här kontona. | | |
| Statistiken, gratis | fungerar | Inte låst. Tratt 5 sökta, 0 fått svar, 0 intervju, 0 erbjudande; aktivitet per vecka (v. 45 till 47, mål 3, "Två till den här veckan så når du målet"); Hur du sökte 5/0/0; "Svar per CV" med förklaringen att det krävs två CV. | gratis, 1440 | p2-13-statistik-gratis-1440.png, p2-13-statistik-hel-gratis-1440.png |
| Mörkt läge, `prefers-color-scheme: dark` | fungerar | En bild per sida i 1440: Översikt, Sökta tjänster, en tjänst (Umeå Energi), Inför intervjun, Jobbcoachen, Bli upptäckt. I 412: Översikt och Sökta tjänster, båda kontona. Allt läsbart, inget rött (sökt på röd text och bakgrund i `main`: inga träffar). De enda ljusa ytorna är den valda fliken i väggen (ljusgrön, avsiktlig markering) och vita sekundärknappar i väggen ("Förbered intervjun", "Skriv uppföljningen"). Ingen yta står kvar ljus av misstag. | båda, 1440 och 412 | p2-13-morkt-oversikt-premium-1440.png, -412.png, p2-13-morkt-sokta-premium-1440.png, -412.png, p2-13-morkt-tjanst-premium-1440.png, p2-13-morkt-intervju-premium-1440.png, p2-13-morkt-jobbcoachen-premium-1440.png, p2-13-morkt-bli-upptackt-premium-1440.png, p2-13-morkt-oversikt-gratis-1440.png, -412.png, p2-13-morkt-sokta-gratis-412.png |
| Temaväxeln i profilmenyn | fungerar | Avatarmenyn har "Utseende: Följer systemet" med tre knappar (system, ljust, mörkt). "Mörkt" satte `data-theme="dark"` och `localStorage.tema = morkt`, sidan blev mörk direkt. Återställd till "Följer systemet" efteråt. | Premium, 1440 | p2-13-temavaxel-morkt-premium-1440.png |

## Rader jag skapade i pass 2

Hela listan med tider står i `scratchpad\jobbsok-qa\testdata-p2.json`.

Premiumkontot:
- Delningslänk utan lista (token som börjar på BBf2QD). **Återkallad** i gränssnittet; raden finns kvar som återkallad.
- Delningslänk med lista (token j9vwml...). **Återkallad**; raden finns kvar som återkallad.
- Intervjuprov 57008e07-8e24-4697-ab1c-1870a9be3f7e, "Ett problem du löste", 5 av 5. **Finns kvar.**
- Ett samtal med Jobbcoachen (en fråga, ett svar), avslutat med "Nytt samtal". **Finns kvar** i den mån samtal sparas.
- Aktivitetsrader i `user_activities` från delningslänkarna och sidvisningarna (skrivs av appen själv).

Gratiskontot:
- Delningslänk med lista (token Jv9ahG...). **Återkallad**; raden finns kvar som återkallad.
- Intervjuprov 92cbb2c6-2ccd-4e23-9cf6-891c02c6b7f9, "Ett problem du löste", 5 av 5, dagens gratisprov. **Finns kvar.**
- Ett meddelande till Jobbcoachen (kvoten 10 till 9). **Finns kvar.**
- Inget brev: kontrollerat att ingen ny rad finns i `letters` efter Skriv brev.

Inget är raderat. Temat återställdes till "Följer systemet" på Premiumkontot.

## Konsolfel per sida (pass 2)

| Sida | Text | Antal |
|---|---|---|
| `/dashboard/mina-brev` (Premium) | Failed to load resource: the server responded with a status of 504 () | 1 |
| Flera (Inför intervjun, Jobbcoachen, Meddelanden, Översikt, Statistik) | WebSocket till Supabase realtime stängd innan anslutning | flera |
| `/dashboard/sokta-tjanster?vy=rapport` (gratis) | CSS-preload oanvänd | 6 |

Inga React-fel och inga hydreringsvarningar (#418, #423, #425) på någon sida i pass 2: Rapporten, Inför intervjun, ett bedömt svar, Jobbcoachen, Bli upptäckt (två omladdningar), Meddelanden, Arbetsstil, Skriv brev (med och utan annons), Dina brev (gratis), Översikt, Sökta tjänster, en tjänst, Statistik. Den publika delningssidan gav inga konsolfel. Matchade jobb öppnades inte.

Webbläsaren är stängd, porten 9333 är ledig och inga Chrome-processer från testet ligger kvar.


# Pass 3, lokal slutkörning på grenen

Grenen `fix/jobbsoket-slutkontroll` (senaste commit 10ea39d2) i arbetskopian `cvbrev-jobbsok`, en lokal produktionsserver på port 5231 mot produktionsdatabasen, en headless Chrome, en flik, egen `userDataDir` per konto, minst tre sekunder mellan sidladdningar. Klockan cirka 16.30 till 17.25 svensk tid. Servern kördes i tre klockor efter varandra: Black Week (`KAMPANJ_NU=2026-11-25T12:00:00+01:00`), Cyber Monday (`2026-11-30T12:00:00+01:00`) och utan variabel. Datorn 1440×900, telefonen Pixel 7 412×915 (mobil-UA, pekskärm) som egen webbläsarstart, och 360×800 där det krävdes. Bilderna ligger i `scratchpad\jobbsok-qa\bilder\` med prefixet `p3-`, raderna jag skapade i `scratchpad\jobbsok-qa\testdata-p3.json`. Inga köp, inga mejl, inget samtycke i Bli upptäckt.

Under passet körde en annan session mot produktionsdatabasen (ett annat konto i Pixel 7, syns i API-loggen 15.47 UTC). Två laddningar av Översikt för Premiumkontot tog 32,0 och 22,5 s i början av passet; alla senare laddningar av samma sida tog 0,3 till 0,8 s. Rapporten för gratiskontot tog en gång 14,1 s, annars under 3 s.

Kampanjens villkor i koden: `kampanjForVisning` (`src/lib/kampanj/kampanj.server.ts`) visar priset när en kampanj pågår och `harBetalat(profil)` är falskt, alltså utan `subscription_id`, `subscription_status`, `paket_started_at` och utan `premium_source` som börjar på `onetime`. Gratiskontot har inget av dem och uppfyller villkoret. Premiumkontot har `premium_source` "manual" och inget av de andra, och uppfyller därför också villkoret (se fel 2).

## Testsviten och bygget

- `npx vitest run`, en gång: **337 filer (334 gröna, 3 överhoppade), 4 283 test (4 270 gröna, 13 överhoppade), 0 röda.** 98 s.
- `npm run build` föll direkt: Turbopack "Symlink node_modules is invalid, it points out of the filesystem root" (länken till rotmappens `node_modules`).
- `npx next build --webpack`: **gick igenom** på 4 min 27 s ("Compiled successfully in 116s", 800 statiska sidor på 55 s). Inga varningar som rör `src/components/jobb3`, `src/lib/jobbsok`, `src/lib/jobmatching` eller `src/app/dela`. Övriga varningar: `baseline-browser-mapping` är gammal, `NODE_TLS_REJECT_UNAUTHORIZED=0`, "Using edge runtime on a page currently disables static generation".

## Del A, det som rättades efter klicktestet i produktion

| Steg | Utfall | Vad jag såg | Konto, bredd | Bild |
|---|---|---|---|---|
| Sista ansökningsdag, Översikt mot Matchade jobb | **fungerar** | Annonsen hos Umeå kommun (sista dag 30 nov) står som "Sista dag mån 30 nov, 9 dagar kvar" på Översikt och "Sista dag 30 nov, 9 dagar kvar" på Matchade jobb, båda kontona, båda laddningarna. Ingen sida visar 1 dec för den. | gratis och Premium, 1440 | p3-a-oversikt-gratis-1440.png, p3-a-matchade-gratis-1440.png, p3-a-oversikt-premium-1440.png |
| React #418, #423, #425 | **fungerar** | Ingen hydreringsvarning på Matchade jobb, Översikt, Skriv brev (`/dashboard/skapa-brev`) eller Inför intervjun, två laddningar var. | gratis och Premium, 1440 | |
| Matchade jobb, gratis, svarstid och HTML | **fungerar** | Dokumentet 530 ms och 474 ms. "22 jobb passar dig, tre är öppna". HTML:en bär exakt tre annons-id (31734444, 31716065, 31754202). Dold annons 31760528 i `/api/jobbmatchning/annons` ger 404 "Annonsen finns inte i dina träffar". | gratis, 1440 | p3-a-matchade-gratis-1440.png |
| Matchade jobb, Premium, svarstid | **fungerar** | 2,8 s och 2,1 s, 11 träffar. API-loggen har ingen läsning av `job_matchings_cache?select=jobs` under passet, bara `select=expires_at,total_jobs_found` och sammanfattningen. | Premium, 1440 | p3-a-matchade-premium-1440.png |
| Ny sökning (testets enda), omladdning direkt | **fungerar** | "Sök igen" 16.50.32. `match-jobs` 200 efter 42 s (50 annonser, `hasMore` sann, inget fält `sparad`: produktionens edge-funktion är inte grenens), sammanfattningen POST 200 två sekunder senare. Listan bytte från 11 till "2 jobb passar dig" (Clockwork 69, Nya Umeå City Hotell 46). Omladdning direkt: samma två rader, "Senast sökt nyss". Ingen påfyllning (`/pool`) gick, varken före eller efter omladdningen. | Premium, 1440 | p3-a-sokning-klar-premium-1440.png, p3-a-sokning-omladdad-premium-1440.png |
| Sökprofilen, en ort till | **fungerar delvis** | Stockholm tillagd: PATCH profiles 204 och GET `/api/jobbmatchning/pool` 200, men listan stod kvar på "2 jobb passar dig". Troligen för att den nya körningen bara har annonser runt Umeå, så omräkningen gav samma resultat; att listan räknades om syns alltså inte. Återställd till bara Umeå (PATCH 204). | Premium, 1440 | p3-a-sokprofil-stockholm-premium-1440.png, p3-a-sokprofil-aterstalld-premium-1440.png |
| Uppföljningen: Kopiera mejlet, Ja | **fungerar** | Norrmejerier. POST `/skickad` 200 och sedan inget mer: **inget nytt POST till `/api/jobbsok/uppfoljning/<id>`**. "Följde upp i dag" med Ångra, och raden "Följde upp 21 nov, Uppföljningsmejlet kopierat och skickat." bland händelserna direkt (två sådana rader, den andra är pass 1:s uppföljning samma dag). | Premium, 1440 | p3-a-foljde-upp-premium-1440.png |
| Omladdning med och utan `?steg=folj-upp` | **fungerar** | Samma läge båda gångerna, "Följde upp i dag" och Ångra, inga anrop till uppföljningsrutten. | Premium, 1440 | |
| Ångra | **fungerar** | DELETE `/skickad?uppfoljning=19e3a202…` 200 och GET 200. Utkastet kom tillbaka (det kortade, 46 ord), raden "Följde upp" från i dag försvann, pass 1:s rad står kvar. | Premium, 1440 | p3-a-angra-premium-1440.png |
| Skriv om kortare med telefonnummer | **fungerar inte** | Se fel 1. Numret "070-123 45 67" (på en rad under namnet) finns inte i den kortade texten, och inget meddelande visades. | Premium, 1440 | p3-a-kortare-premium-1440.png |
| Uppföljningen, gratis, "QA-test tyst I" | **fungerar** | "Följde upp i dag ... 3 december säger vi till igen." med Ångra och raden "Följde upp 21 nov, Du följde upp på egen hand." Med och utan `?steg=folj-upp`: inget anrop till uppföljningsrutten, ingen 402. | gratis, 1440 | p3-a-tyst-i-gratis-1440.png |
| Händelse före sökdatumet | **fungerar** | Ny tjänst "QA-test pass3 J" sökt 15 nov. Kallelse dagen 14 nov: arket säger "Dagen kan inte ligga före dagen du sökte tjänsten, 15 november. Ändra sökdatumet först om det är fel." (fältets `min` 2026-11-15, inget anrop gick). | Premium, 1440 | p3-a-handelse-fore-sokdag-premium-1440.png |
| Sökdatum efter en händelse | **fungerar** | Kallelse 18 nov sparad. Redigera, sökdatum 19 nov: "Du har en händelse den 18 november. Sökdatumet kan inte ligga efter den." (fältets `max` 2026-11-18, inget PUT gick). | Premium, 1440 | p3-a-sokdatum-efter-handelse-premium-1440.png |
| Hur gick intervjun?, Den är genomförd | **fungerar** | Intervju 20 nov 10.00. "Den är genomförd": POST `/utfall` 200, och 2,5 s senare finns varken "Hur gick intervjun?" eller knapparna kvar, utan omladdning. | Premium, 1440 | p3-a-genomford-premium-1440.png |
| Ska sökas, aktiv rad, 1440 | **fungerar, med en avvikelse** | "Markera som sökt" 121×44, "Skriv brev" 105×48, "Ta bort" 48×**32**. Ta bort under 44 px i 1440 (CSS-regeln ger 44 px bara under 1280 px, enligt byggnoterna avsiktligt). Allt synligt, inget täckt. | Premium, 1440 | p3-a-ska-sokas-premium-1440.png |
| Ska sökas, 412 | **fungerar** | 121×44, 105×48, 48×44, ingen vågrät rullning. "Markera som sökt" öppnar arket "Markera som sökt" med tjänst och arbetsgivare; Esc stänger. | Premium, 412 | p3-a-ska-sokas-premium-412.png, p3-a-markera-ark-premium-412.png |
| Ska sökas, 360, Ta bort | **fungerar** | 121×44, 105×48, 48×44, ingen vågrät rullning. "Ta bort" på "QA-test ska söka B": frågan "Ta bort raden? Annonsen försvinner från Ska sökas. Den har aldrig räknats i din statistik.", DELETE 200, raden borta. | Premium, 360 | p3-a-ska-sokas-premium-360.png, p3-a-ta-bort-fraga-premium-360.png |
| Inför intervjun, gratis | **fungerar** | Provet med 5 av 5 är fortfarande från i dag. "Du fick 5 av 5 i dag, med alla fyra delarna på plats. Nästa prov öppnar i morgon." Alla fyra brickor "Fanns med", ordet "Saknades" finns inte på sidan. | gratis, 1440 och 412 | p3-a-hubb-gratis-1440.png, p3-a-hubb-gratis-412.png |
| Räkneord på Översikt | **fungerar** | Gratis 412: "1 sparad". Premium 412: "3 sparade". | gratis och Premium, 412 | p3-a-oversikt-gratis-412.png |
| Räkneord i Kopiera som text | **fungerar** | "Totalt: 11 sökta jobb (10 annonserade, 1 spontan), 3 intervjuer." | Premium, 1440 | |

## Del B, besluten

| Steg | Utfall | Vad jag såg | Konto, bredd | Bild |
|---|---|---|---|---|
| `/Skärmbild 2025-09-26 220531.jpg` | **fungerar** | 404. | utloggad | |
| Profilvisningar | **fungerar** | Varken Bli upptäckt eller raden på Översikt har ett antal; båda kontona är inte synliga, så inga visningar visas. Inget "rekryterare har sett". | båda, 1440 och 412 | p3-b-bli-upptackt-gratis-1440.png |
| Rutan Dela med en länk, Premium | **fungerar** | Texten och kryssrutan ordagrant enligt beslut 4. Länk med lista: POST 200, `showCompanyNames` sann. | Premium, 1440 | p3-b-dela-ruta-premium-1440.png |
| Rutan, gratis | **fungerar** | Ingen kryssruta; i stället "Listan med företag, tjänst och datum ingår i Premium. Länken visar antalen." Länken skapades med `show_company_names: false`. | gratis, 1440 | p3-b-dela-ruta-gratis-1440.png |
| Direkt POST med listan, gratis | **fungerar** | `{"show_company_names":true}` från gratiskontots session: 200, `showCompanyNames` falskt, och den publika sidan saknar lista. | gratis | p3-b-dela-utan-lista-gratis-direktpost-1440-ljust.png |
| Delningssidan med lista | **fungerar, en sak att bedöma** | "QA Omg2 premium", "Läget den 21 november 2026." under namnet, tratten 13/8/7/0, tretton rader med år ("Sökt 20 november 2026, svar på annons"). 412: raderna som kort, ingen vågrät rullning. Mörkt läge följer systemet. `noindex, nofollow`. Erbjudande-rutan har orange kant och orange flagga, och förklaringen "Tyst i över tolv dagar" har en orangebrun ruta; i övrigt ingen orange eller röd toning. Jämförd med Statistik bara i minnet, inte sida vid sida. | utloggad, 1440 och 412, ljust och mörkt | p3-b-dela-med-lista-premium-1440-ljust/-morkt.png, p3-b-dela-med-lista-premium-412-ljust/-morkt.png |
| Delningssidan utan lista | **fungerar** | Samma vägg och tratt (5 sökta, 0, 0, 0), ingen lista. `noindex`, ingen vågrät rullning. | utloggad, 1440 och 412, ljust och mörkt | p3-b-dela-utan-lista-gratis-direktpost-*.png |
| Återkallad och påhittad token | **fungerar** | "Länken har upphört" i alla fyra varianterna (HTTP 200), `noindex`. | utloggad | p3-b-dela-aterkallad-*.png, p3-b-dela-pahittad-*.png |
| Länkarna återkallade | **fungerar** | "Återkalla länken" på båda kontona, DELETE 200 `revoked` 1. Rutan hämtar länken på klienten och visar den först efter några sekunder; mitt första försök hittade inte knappen efter 6 s. | båda, 1440 | |
| Spärren för intervjusteget | **fungerar** | Översikt: inga Följ upp-rader. Filtret Följ upp: 0, "Inga sökta tjänster med det här filtret just nu." "QA-test intervju G": läget Kallad till intervju, "Sätt tid", blocket Förbered, inget Följ upp-block. E och J (genomförda): inget Följ upp-block. | Premium, 1440 | p3-b-filter-foljupp-premium-1440.png, p3-b-tjanst-G-premium-1440.png |
| Nolläget utan CV, 1440 | **fungerar** | Nytt konto. "Har du redan sökt en tjänst? Logga den" under "Har du inget CV? Bygg ett här" inne i väggen, 260×44, träffas av sin egen mittpunkt, väggens överflöd synligt, inget klippt. Trycket gick till `/dashboard/sokta-tjanster?logga=1&fran=oversikt-ny` med arket "Logga sökt tjänst" öppet; Esc tog bort `logga` och `fran`. | noll-utan-cv, 1440 | p3-b-nollage-noll-utan-cv-1440.png, p3-b-nollage-ark-noll-utan-cv-1440.png |
| Nolläget utan CV, 412 | **fungerar** | Samma, 260×44, ingen vågrät rullning, inget täckt. | noll-utan-cv, 412 | p3-b-nollage-noll-utan-cv-412.png, p3-b-nollage-ark-noll-utan-cv-412.png |
| Nolläget med CV utan sökta tjänster | **inte prövat** | Det finns ingen färdig test-CV-fil bland QA-skripten (ingen pdf eller docx under `scripts`). | | |
| Kampanjmejlet utan adminsession | **fungerar** | POST `/api/admin/email/campaign` utan session: 401 "Ej inloggad". | utloggad | |
| Kampanjmejlet 410 | **inte prövat** | Kräver adminsession. | | |

## Del C, betalväggarna i kampanjläge

Köpknappen följdes ett steg på varje vägg; adressen saknar kampanjparameter i alla fall, köpsteget själv visar kampanjen ("Black Week, gäller till och med söndag 29 november 23.59" respektive "Cyber Monday, gäller bara måndag 30 november till 23.59", "149 kr" överstruket och "99 kr första månaden" respektive "49 kr första månaden, sedan 149 kr i månaden").

| Vägg | Klocka | Rubrik | Prisrad | Knapp | Ett steg | Bredd | Bild |
|---|---|---|---|---|---|---|---|
| Uppföljningsmejlet (dubbletten "QA-test tyst I") | Black Week | Fler uppföljningsmejl ingår i Premium | Jobbcoach Premium, 99 kr första månaden, sedan 149 kr i månaden. Säg upp när du vill. | Köp Premium, 99 kr första månaden | `/dashboard/valj-spar?paket=all_month&steg=kop&plats=uppfoljning` | 1440, 412 | p3-c-uppf-bw-gratis-1440.png, p3-c-uppf-bw-gratis-412.png |
| Matchade jobb (`?annons=dold-0`) | Black Week | Se varför du passar för alla 22 | samma som ovan | Köp Premium, 99 kr första månaden | `...&plats=jobbtraffar` | 1440, 412 | p3-c-match-bw-gratis-*.png |
| Rapporten | Black Week | Din rapport är sammanställd | samma som ovan | Köp Premium, 99 kr första månaden | `...&plats=af_rapport` | 1440, 412 | p3-c-rapport-bw-gratis-*.png |
| Uppföljningsmejlet | Cyber Monday | Fler uppföljningsmejl ingår i Premium | Jobbcoach Premium, 49 kr första månaden, sedan 149 kr i månaden. Säg upp när du vill. | Köp Premium, 49 kr första månaden | `...&plats=uppfoljning` | 1440, 412 | p3-c-uppf-cm-gratis-*.png |
| Matchade jobb | Cyber Monday | Se varför du passar för alla 22 | samma 49 kr-rad | Köp Premium, 49 kr första månaden | `...&plats=jobbtraffar` | 1440, 412 | p3-c-match-cm-gratis-*.png |
| Rapporten | Cyber Monday | Din rapport är sammanställd | samma 49 kr-rad | Köp Premium, 49 kr första månaden | `...&plats=af_rapport` | 1440, 412 | p3-c-rapport-cm-gratis-*.png |
| Matchade jobb | utan kampanj | Se varför du passar för alla 22 | Jobbcoach Premium, 149 kr i månaden. Säg upp när du vill. | Köp Premium, 149 kr i månaden | inte följd | 1440 | p3-c-match-ord-gratis-1440.png |

| Steg | Utfall | Vad jag såg | Konto, bredd | Bild |
|---|---|---|---|---|
| "Jag har redan skickat det" i 412 | **fungerar** | Står under väggen (201×44), väggens mittpunkt-test träffar etiketten i båda klockorna. Tryckt en gång (Cyber Monday): POST `/skickad` 200, "Följde upp i dag" med Ångra. Omladdad: samma läge, inget anrop, ingen 402. | gratis, 412 | p3-c-redan-skickat-gratis-412.png |
| Premiumkontot ser inget kampanjpris | **fungerar inte** | Se fel 2. Raden "BLACK WEEK första månaden Premium för 99 kr. Köp Premium, 99 kr" står överst på Översikt och alla andra sidor. | Premium, 1440 och 412 | p3-a-oversikt-premium-1440.png, p3-a-ska-sokas-premium-360.png |

## Prestanda

`scripts/perf-inloggat.ts --port 5231 --epost <Premiumkontot> --filter =<rutt>`, en körning av skriptet per rutt (skriptets filter tar en rutt åt gången), tre mätningar per rutt, Pixel 7 med 3x CPU-strypning och LTE, servern utan kampanjvariabel. Alla sju rutterna finns i skriptet.

| Rutt | Budget | LCP | FCP | CLS | Utfall |
|---|---|---|---|---|---|
| Översikt `/dashboard` | 1 000 ms (skriptets kritiska) | 824 ms | 512 ms | 0 | håller |
| Sökta tjänster | 1 500 ms | 712 ms | 396 ms | 0 | håller |
| En sökt tjänst | 1 500 ms | 1 156 ms | 808 ms | 0 | håller |
| Inför intervjun | 1 500 ms | 728 ms | 600 ms | 0 | håller |
| Jobbcoachen | 2 000 ms | 680 ms | 680 ms | 0 | håller |
| Bli upptäckt | 1 500 ms | 820 ms | 488 ms | 0 | håller |
| Matchade jobb | 2 000 ms | 1 000 ms | 708 ms | 0 | håller |

Alla håller budgeten, CLS 0 överallt.

## Felen

1. **"Skriv om kortare" tar bort det som står under namnet i avslutningen, utan meddelande.** Adress `/dashboard/sokta-tjanster/0d576ab5-ad94-4814-9127-01819c1241ce?steg=folj-upp`. Jag skrev "Nå mig gärna på 070-123 45 67." på en egen rad sist i utkastet, under "Vänliga hälsningar / QA Omg2 premium" (sparat med PUT 200), och tryckte "Skriv om kortare" (POST `/kortare` 200). Väntat: numret ordagrant kvar, eller texten orörd med "Det gick inte att skriva om just nu. Din text är kvar." Det som hände: den kortade texten saknar numret helt och inget meddelande visades. Den kortade texten:

   > Hej,
   >
   > Jag sökte tjänsten som ekonomiassistent den 6 november och undrar hur rekryteringsprocessen fortskrider.
   >
   > Jag är fortsatt mycket intresserad av rollen och min erfarenhet av reskontra och bokföring matchar era krav väl.
   >
   > Hör gärna av er om ni behöver kompletterande information.
   >
   > Vänliga hälsningar
   > QA Omg2 premium

   Orsak: `styckenUrMejl` i `src/lib/jobbsok/uppfoljning.ts` rad 105 till 107 tar bort hela sista stycket när det börjar med "Vänliga hälsningar", och raden under namnet hör till samma stycke (bara enkel radbrytning). Numret gick alltså aldrig till AI:n och kontrollen av märkena slog aldrig till; `sattIhop` skriver sedan bara hälsningen och namnet. Ingen konsoltext. Därtill: den kortade texten har "mycket intresserad", som pass 1 noterade att prompten förbjuder. Att numret står kvar när det står inne i brödtexten är inte prövat (bara en omskrivning ingick).
2. **Premiumkontot får Black Week-raden.** Översikt och alla inloggade sidor, 1440 och 412: "BLACK WEEK första månaden Premium för 99 kr. Köp Premium, 99 kr" och "Nej tack". Väntat: inget kampanjpris för ett konto som har Premium. Orsak: `kampanjForVisning` (`src/lib/kampanj/kampanj.server.ts` rad 42 till 47) avgör bara med `harBetalat`, och `src/app/dashboard/layout.tsx` rad 115 och 117 visar raden och väggarnas pris när `behorig` är sann, utan att fråga om kontot har Premium just nu. Premiumkontots Premium är manuellt (`premium_source` "manual", `premium_until` 27 nov, ingen prenumeration), så det räknas som aldrig betalat. Samma gäller alla konton med manuellt givet Premium eller annan Premium utan prenumerationsfält. Felet kommer från kampanjkoden på main, inte från grenen. Ingen konsoltext.
3. **"Ta bort" på en aktiv Ska sökas-rad är 32 px hög i 1440.** `/dashboard/sokta-tjanster?filter=ska-sokas`, 48×32 px. Uppdraget kräver 44 px i alla bredder; byggnoterna säger att `.j3-spar-bort` får 44 px bara under 1280 px (`src/app/jobb3.css`), så det är som byggt men under kravet. 412 och 360: 44 px.

Iakttagelser utan felmärkning: köpsteget (`/dashboard/valj-spar`) visar i sidomenyn "Prenumeration 149 kr/mån" medan kortet visar kampanjpriset; sökprofilens omräkning gick inte att se (tabellen ovan); delningssidans Erbjudande-ruta och förklaringen "Tyst i över tolv dagar" är orangetonade; gratiskontots delningssida skriver "0 av 0" mellan Fått svar och Intervju.

## Rader jag skapade i pass 3

Hela listan med tider står i `scratchpad\jobbsok-qa\testdata-p3.json`.

Nytt konto: ett gratiskonto utan CV, `profiles.id` 33825074-7c79-48b3-85db-9455e5118009, e-posten innehåller `jobbcoach-qa`, i kontofilen `scripts\.qa-jobbsoket-konton.json` som `typ` "noll-utan-cv". **Ska ligga kvar.**

Premiumkontot:
- `job_applications` d89b27a2-cb72-409c-b203-0d76f3a557bb "QA-test pass3 J" (sökt 15 nov) med kallelsen c3791c61-2cb6-4d74-bd41-ade8044618fe (18 nov, intervju 20 nov 10.00) och genomförd b2338f1d-4ca4-4dbe-bcc7-539080ea052e. **Finns kvar.**
- Uppföljningsutkastet 19e3a202 på Norrmejerier: omskrivet kortare (rewrites +1), markerat skickat och sedan ångrat. **Står kvar som oskickat utkast** med den kortade texten.
- En ny matchningskörning 16.50 (skrev om kontots cache och sammanfattning; listan har nu två träffar i stället för elva). Sökprofilen fick Stockholm och återställdes till Umeå.
- Delningslänk med lista (token Al--5O…): **återkallad**.
- `job_saved_ads` 481b6347 "QA-test ska söka B" (från pass 1): **borttagen** genom "Ta bort" i 360, som uppdraget tillät.

Gratiskontot:
- Delningslänk (token d8THpF…, utan lista), återkallad av nästa; delningslänk från direkt POST (token sKhr1m…, utan lista trots begäran): **återkallad**.
- "Jag har redan skickat det" på dubbletten "QA-test tyst I" b12641af: **en uppföljning (eget) finns kvar**, tjänsten har lämnat Följ upp.

Inget annat raderat.

## Konsolfel per sida (pass 3)

| Sida | Text | Antal |
|---|---|---|
| `/dashboard/sokta-tjanster/<dubbletten>?steg=folj-upp` (gratis) | Failed to load resource: 402 (förväntat, spärren) | 4 |
| `/dashboard/jobbmatchning` (gratis) | Failed to load resource: 404 (mitt eget anrop av en dold annons) | 1 |
| Flera (en tjänst, rapporten, Översikt) | CSS-preload oanvänd (`dc7d2bc4…css`, `9cac0e34…css`) | flera |

Inga React-fel och inga hydreringsvarningar (#418, #423, #425) på någon sida i pass 3. Delningssidan gav inga konsolfel.

Servern och webbläsaren är stängda, portarna 5231 och 9333 är lediga, inga Chrome-processer från testet ligger kvar och `.next` i arbetskopian är borttagen. `arbetsyta.mjs` efteråt: 5,7 GB ledigt, inga föräldralösa servrar, arbetskopian utan ocommittade filer före den här texten.

# Pass 4, omprov av Skriv om kortare

Fel 1 efter rättningen (`delaUppMejl`, `sattTillbaka`, `forberedKortning`), lokal `next dev --webpack` på port 5231, Premium 1440, Norrmejerier (utkast 19e3a202, redan kortat två gånger, 46 ord), "Ring gärna på 070-123 45 67." sist i brödtexten och "070-123 45 67" på egen rad under namnet (PUT 200), "Skriv om kortare" en gång: **fungerar (det godtagna andra utfallet)**: POST `/kortare` 502 `ai_fel` efter ett AI-svar som inte klarade valideringen, texten orörd tecken för tecken (båda numren kvar, avslutet oförändrat) och meddelandet "Det gick inte att skriva om just nu. Din text är kvar." syntes; samma text körd offline genom `forberedKortning` visar att hela avslutet hölls utanför AI:n och att numret i brödtexten gick som `[TELEFON 1]`; den lyckade kortningen med nummer är prövad i vitest (`uppfoljningKortare.test.ts`), inte i webbläsaren. Bilder p4-fore-kortare-premium-1440.png och p4-kortare-premium-1440.png.

## Tillägg till pass 4: varför AI:ns svar underkändes, och omprov utan server

Samordnaren, 2026-11-21 kväll. Omprovet i webbläsaren gav orört utkast, och ett prov med en ny text på 96 ord gav samma sak. AI:ns råa svar visade orsaken: instruktionen nämnde "[TELEFON 1] eller [E-POST 1]" som exempel, och modellen lade till `[E-POST 1]` i svaret fast texten inte hade någon e-post. Valideringen stoppar okända märken, så varje kortning av en text med en egen uppgift i brödtexten slutade i "Det gick inte att skriva om just nu. Din text är kvar."

Rättat i `src/lib/openai/uppfoljningsmejl.ts`: instruktionen räknar nu upp exakt de märken som finns i texten och säger att inga andra får användas.

Omprov: samma funktioner i samma ordning som rutten (`forberedKortning`, `skrivKortare`, `sattTillbaka`), körda tre gånger mot modellen utan server och utan databas, med en påhittad text på 96 ord med "Hej Anna,", ett telefonnummer i brödtexten och ett telefonnummer och en länk under namnet. Alla tre gav en godkänd kortning (52 till 66 ord). Hälsningsraden, numret i brödtexten och hela avslutet stod kvar ordagrant i alla tre. Inte prövat i webbläsaren efter den här ändringen: knappen och rutten är desamma som i pass 3 och 4.

# Pass 5, kontroll i produktion efter push

2026-11-21 kväll, `https://www.jobbcoach.ai` efter `bce37384` och den nya `match-jobs`. Fristående headless Chrome, en flik, profil per konto, inloggningen satt kvar från tidigare pass (ingen ny inloggning behövdes). 13 sidladdningar sammanlagt, minst tre sekunder mellan dem. Ett AI-anrop: "Sök igen" en gång på Premium. Inget annat tryckt, ingen rad raderad. Svarstid är tiden tills dokumentet var inläst (`domcontentloaded`). Bilderna ligger i qa-mappen `bilder\p5-*.png` i sessionens scratchpad.

| Punkt | Resultat | Vad jag såg | Svarstid |
|---|---|---|---|
| 1. Matchade jobb, Premium, 1440 | **fungerar** | "2 jobb passar dig", träffarna ritas. Sista dag stämmer med annonsen: `application_deadline` 2026-11-30T23:59:59 visas som "Sista dag 30 nov, 9 dagar kvar" (Ekonom, Umeå kommun), 2026-12-10T23:59:59 som "10 dec, 19 dagar kvar". Ingen #418, #423 eller #425. | 3635 ms (första laddningen), 676 och 1010 ms därefter |
| 1. Matchade jobb, Premium, 412 (egen start) | **fungerar** | Samma två träffar, "30 nov, 9 dagar kvar" och "10 dec, 19 dagar kvar". Inga React-fel. | 549 ms |
| 2. Ny sökning, Premium | **fungerar**, med en avvikelse | "Sök igen" tryckt 19.40.32. Första `match-jobs`: 200 efter 22,7 s, `sparad: true`, 50 annonser i `jobs`, `hasMore: true`, 513 kB. Påfyllningen direkt efter: 200 efter 4,0 s, 250 annonser (`cached`), 2,6 MB. Efter sökningen sa sidan "7 jobb passar dig" med Ekonom (Umeå kommun) överst. Omladdad: överst samma nya annons (före sökningen var Clockwork överst), "Senast sökt nyss" (stämmer). **Avvikelse:** efter omladdningen står "2 jobb passar dig" och "2 bästa träffarna", inte 7. Samma 2 på telefonen några minuter senare. | 22,7 s (sökningen), 1010 ms (omladdningen) |
| 3. Matchade jobb, gratis | **fungerar** | "22 jobb passar dig, tre är öppna": tre öppna träffar (30 nov, 10 dec, 27 nov), fem dolda rader med bara matchgrad (61, 61, 46, 46, 40) och "14 träffar till är dolda". Dokumentets HTML (113 kB) bär exakt de tre öppna annons-id:na; de dolda länkarna heter `annons=dold-0` till `dold-4`. | 2726 ms |
| 4. Översikt, Premium | **fungerar** | Väggen "Intervju på Umeå Energi på tisdag". Att göra nu: "Tre saker som för jobbsöket framåt", tre kort "Förbered intervjun" (Umeå Energi tis 24 nov 10.00, QA Testbolag F ons 25 nov 14.00, QA Testbolag A fre 27 nov 09.15). Bli upptäckt: "Rekryterare kan hitta dig, anonymt. Du godkänner varje kontakt." Inget antal rekryterare. | 713 ms |
| 4. Översikt, gratis | **fungerar** | Väggen "Följ upp QA Testbolag H". Att göra nu: "Tyst i 13 dagar, Följ upp QA Testbolag H", "Sista dag onsdag 25 nov, Sök Ica Lager senast onsdag", "Veckans mål 1 av 3, Sök två tjänster till". Bli upptäckt: samma rad som Premium, inget antal. | 1398 ms |
| 5. Sökta tjänster, Premium, 1440 | **fungerar** | Två aktiva rader under Ska sökas (Ålö AB, Volvo Lastvagnar), var och en med "Markera som sökt" 121×44, "Skriv brev" 105×48, "Ta bort" 48×32 under foten. | 524 ms |
| 5. Sökta tjänster, Premium, 412 (egen start) | **fungerar** | Samma två rader och tre knappar; "Ta bort" 48×44. | 2644 ms |
| 6a. Uppföljningen, Premium, inget POST vid laddning | **fungerar** | Norrmejerier (`0d576ab5`): inga anrop alls till `/api/jobbsok/uppfoljning/...` vid laddningen. | 981 ms |
| 6b. Uppföljningen, Premium, "Följde upp" med Ångra | **inte prövat** | Norrmejerier visar utkastet (55 ord, "Skriv om kortare", "Kopiera mejlet") eftersom pass 3 tryckte Ångra. Ingen annan Premiumtjänst är uppföljd i dag enligt pass 3 och 4, och uppdraget sa att inget skulle tryckas. | |
| 7. Rapporten, gratis | **fungerar** | "Dela med en länk": "Listan med företag, tjänst och datum ingår i Premium. Länken visar antalen." Ingen kryssruta. Ingen länk skapad. | 500 ms |
| 8. Dina brev, Premium | **fungerar** | 200, sidan ritas ("Ditt första brev, Klistra in annonsen, så skriver vi brevet"). | 782 ms |
| 9. Inför intervjun, gratis | **fungerar** | "Du fick 5 av 5 i dag, med alla fyra delarna på plats. Nästa prov öppnar i morgon." Alla fyra STAR-brickor "Fanns med". Inget om att något saknades. Rubriken säger fortfarande "Skriv om svaret om ett problem du löste" (känt, står i byggnoterna). | 509 ms |

## Avvikelse att utreda

Efter den nya sökningen visade Matchade jobb (Premium) "7 jobb passar dig" i webbläsaren, men efter omladdning och på telefonen några minuter senare "2 jobb passar dig". Den översta annonsen var densamma och är ny för sökningen, så sammanfattningen kommer från den nya sökningen, men antalet träffar på servern stämmer inte med det klienten räknade fram. `/dashboard/jobbmatchning`.

## Konsolfel per sida (pass 5)

| Sida | Fel | Antal |
|---|---|---|
| `/dashboard/jobbmatchning` (Premium 1440, under sökningen) | Varning: WebSocket till Supabase realtime stängdes innan anslutningen var klar (vid sidbytet) | 1 |
| `/dashboard?oversikt=1` (Premium 1440) | Samma WebSocket-varning | 1 |
| Övriga sidor, båda kontona, 1440 och 412 | inga | 0 |

Inga React-fel (#418, #423, #425) på någon sida.

## Rader jag påverkade i pass 5

- Premium: en ny sökning 19.40 skrev om kontots `job_matchings_cache` och `job_matching_summaries`. Inga andra skrivningar.

## Kvar efter pass 5 (samordnaren, 2026-11-21 sen kväll)

Live: main `bce37384`, edge-funktionen `match-jobs` driftsatt, cachetabellen tömd på 31 utgångna körningar (74 MB till 6,8 MB) och två dubbla index borttagna, allt med ägarens ja.

Inte rättat, går till Jobbsöket omgång 2:
- **Antalet träffar skiljer mellan sökningen och omladdningen.** Direkt efter en ny sökning skrev sidan "7 jobb passar dig", efter omladdning "2 jobb passar dig" (Premiumkontot, Umeå). Webbläsarens räkning efter sökningen och serverns räkning ur sammanfattningen ger alltså olika antal för samma körning. Samma sak syntes i pass 1. Orsaken är inte utredd.
- En sökt tjänst i intervjusteget med ett oskickat utkast visar fortfarande Följ upp-blocket på tjänstens sida.
- Hubben i Inför intervjun har rubriken "Skriv om svaret om ..." också efter högsta betyg.
- `/dashboard/introduktion` svarar 200 och skickar vidare i sidan, inte med en riktig 308.
- Kampanjraden visas för ett konto med manuellt tilldelad Premium (kampanjkoden frågar bara om kontot har betalat). Inget riktigt konto har manuell Premium. Kampanjlogiken ändras bara med ägaren.

Inte prövat någonstans: "Följde upp" med Ångra i produktion efter pushen (prövat lokalt i pass 3), Översikt med CV men utan sökta tjänster, gratisgränsen vid andra intervjuprovet, en riktig förfrågan i Meddelanden, kampanjruttens 410-svar.
