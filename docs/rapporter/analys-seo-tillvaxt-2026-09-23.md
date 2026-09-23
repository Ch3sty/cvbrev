# Analys: SEO-tillväxt och konton, 12 juni till 21 september 2026

Kort sammanfattning. Full rapport med tabeller och diagram: `analys-seo-tillvaxt-2026-09-23.pdf` (14 sidor), källa `analys-seo-tillvaxt-2026-09-23.html`. Uppföljning av `analys-gsc-posthog-2026-09-12`.

## Läs det här först

Search Console har data till 21 september. Tre releaser efter det kan inte bedömas ännu: veckopaketen och ny prissida (22 sep 10:51), visuella linjen med serverrenderade artiklar och nya reklamkort per kluster (23 sep), räkna ut-hubben ombyggd (23 sep 12:21). CTA- och trattsiffrorna nedan gäller versionen 11 till 22 september.

| Live | Vad | Läses av |
|---|---|---|
| 11 sep 22:08 | PostHog-händelser article_*, sample_*, signup_* | nu, tolv dagar |
| 13 sep / 23 sep | PostHog startar efter laddning / först vid interaktion | PostHog-trender inte jämförbara över datumen |
| 21 sep 21:54 | Attribution (acquisition_source) fungerar | kring 20 okt |
| 22 sep 10:51 | Paketen, prissida, trial bort | vecka 45 |
| 23 sep | Linjen, nya reklamkort | positioner 30 sep och 14 okt, CTA 7 okt |
| 23 sep 12:21 | Räkna ut ombyggd | mitten av oktober |

## Läget i siffror

| Fönster | Klick | Klick/dag | Visn/dag | CTR | Position | Nya konton |
|---|---:|---:|---:|---:|---:|---:|
| 12 juni till 31 juli | 217 | 4,3 | 792 | 0,55 % | 29,4 | |
| Augusti | 344 | 11,1 | 1 134 | 0,98 % | 24,2 | 30 |
| 1 till 21 september | 406 | 19,3 | 1 228 | 1,57 % | 18,4 | 51 (till 23 sep) |
| 25 aug till 7 sep | 194 | 13,9 | 1 187 | 1,17 % | 23,7 | 23 |
| 8 till 21 sep | 296 | 21,1 | 1 207 | 1,75 % | 15,7 | 32 |

Konton ur Supabase med ägarens och testkontona borttagna.

## Fem slutsatser

1. **Klicken ökade 52 procent på två veckor utan fler visningar.** Hela ökningen är position (23,7 till 15,7). Ingen av förra rapportens SEO-åtgärder är gjord; tillväxten kom av sig själv.
2. **Logiska-tester bär hälften av ökningen.** 9 till 59 klick på två veckor. Testklustret gav 24 procent av septembers klick.
3. **Testsidor ger konton, artiklar ger läsare.** 3,8 konton per 100 sessioner från testsidor mot 0,4 från artiklar. 72 procent klickade på CTA:n i testklustret, 5 procent i intervjuklustret, 0 av 50 på styrkor-svagheter-intervju.
4. **Innehållet står still.** Ingen ny artikel sedan 23 juli, visningarna platta i sju veckor. Räkna ut tappade 90 procent av visningarna kring 22 augusti (Google har inte hämtat sidorna sedan 27 juli). 18 sidor i sajtkartan är inte indexerade och /verktyg i sajtkartan svarar 404.
5. **Cover-letter-sverige läcker fortfarande.** 2 436 visningar i månaden, position 7,5, fyra klick. Definitionsfrågorna ("vad är cover letter") ger aldrig klick; omskrivningen ska rikta sig mot "cover letter svenska" som mall.

## Åtgärder, fyra veckor

| # | Vecka | Åtgärd | Insats | Effekt |
|---|---|---|---|---|
| 1 | 39 | Rätta mätningen: example_viewed/example_cta_clicked anropas aldrig; signup_completed saknas för Google-inloggning | S | tratten läsbar 7 okt |
| 2 | 39 | cover-letter-sverige mot mallavsikten, ny seoTitle, description, H1, exempelbrev först | S | 15 till 30 klick/mån |
| 3 | 39 | Länka ihop testklustret, rätta sajtkartan (+skapa-cv, +bli-upptackt, -/verktyg, -stadare), slå ihop rekryteringstester-guide | S | 10 till 20 klick/mån |
| 4 | 39 | Ägaren: indexeringsbegäran i Search Console, Bing Webmaster Tools, IndexNow | S | räkna ut tillbaka, Bing mätbart |
| 5 | 40 | Listblock på styrkor-svagheter-intervju (svagheter lista, dåliga egenskaper, utvecklingsbara sidor) | M | 30 till 50 klick/mån |
| 6 | 40 | Snippetpass sex sidor, slå ihop hur-avslutar-man-personligt-brev med personligt-brev-avslutning-exempel | M | 25 till 45 klick/mån |
| 7 | 41 | Tre testsidor: alva-labs-logiktest, map-test-personlighetstest, deduktivt-induktivt-test | M | 30 till 60 klick/mån, 1 till 3 konton |
| 8 | 41 | Intervjuprovet, smakprov med spärr som testprovet (beslut) | M | 4 till 8 konton/mån |
| 9 | 42 | Ny artikel bakgrundskontroll-vid-anstallning för kandidater | M | 15 till 30 klick/mån |
| 10 | 42 | Avläsning av linjen, reklamkorten, räkna ut och mätfixarna | S | beslutsunderlag |

Sammantaget 125 till 235 extra klick i månaden (20 till 37 procent) och 5 till 13 extra konton i månaden med intervjuprovet, 3 till 5 utan.

## Förra rapportens åtgärder

Gjorda: LCP/CLS inloggat (12 till 13 sep), kontrollpunkt trial (21 sep), cancel-flowet fångar (två rader). Inte gjorda: cover-letter-sverige, interna länkar, snippetgenomgång, styrkor-svagheter, testklustret. Frysfönstret till 26 sep bröts av paketreleasen 22 sep.

## Behöver ägarens beslut

- Innehållstakten: sex till tio nya sidor i månaden, testklustret först.
- Intervjuprovet (åtgärd 8), design i artefakt före bygge.
- Indexeringsbegäran och Bing Webmaster Tools kräver ägarkontot.
- Ingen ny mallomläggning på publika sidor före 7 oktober, så linjens effekt går att läsa av.

## Vad vi inte ser

86 procent av klicken per sökfråga (dolda frågor), Bing och partners (ungefär lika många svenska sessioner som Google), exempelsidornas tratt, registreringar via Google i PostHog, landningssida per konto före 21 sep, PostHog-trender över 13 och 23 sep, effekten av releaserna 22 och 23 sep, orsaken till augustitappet, konkurrenternas läge.

Insamlingsskript: `scripts/analys-seo-tillvaxt.ts` (Search Console) och `scripts/posthog-query.ts`.
