# Prestanda på de publika sidorna

Mätning och åtgärder, 2026-09-13. Branch `perf/publikt`.

Urvalet styrs av Search Console: topp 40 sidor på klick de senaste 28 dagarna (15 augusti till 11 september) plus de tio med högst visningsvolym och lägst CTR. Efter att ankarlänkar slagits ihop med sin bassida blir det 48 unika sidor.

Budget: startsidan under 1 000 ms, artiklar och exempelsidor under 1 500 ms, CLS 0, INP under 200 ms. Samma emulering som det inloggade läget: Pixel 7, 3x CPU-strypning, LTE med 70 ms latens.

## 1. Sammanfattning

**PostHog var 379 kB av 581 kB i den delade runtimen**, alltså 65 procent av det varje publik sida måste ladda innan den kan bli interaktiv. Efter åtgärd är den delade runtimen 411 kB och innehåller noll PostHog.

CLS är 0 på 47 av 48 sidor redan före åtgärder, och INP ligger på 8 till 128 ms i PostHogs fältdata. De problemen finns alltså inte här. Det som kostar är JavaScript före första målningen.

**Fältdata från riktiga användare** (PostHog, 28 dagar, Sverige, p75) visar att de publika sidorna redan ligger bättre än labbmätningen antyder: artiklarna på 1,1 till 2,1 sekunder LCP med CLS 0. Labbmätningen med 3x CPU-strypning är alltså strängare än verkligheten, vilket är avsiktligt.

## 2. Datakällor

| Källa | Status |
|---|---|
| Search Console, topp 40 + 10 låg-CTR | Hämtat, `scripts/_gsc-publikt.ts` |
| PostHog web vitals per pathname, 28 dagar | Hämtat |
| Egen labbmätning, 48 sidor | Hämtat, `scripts/perf-publikt.ts` |
| PageSpeed Insights (CrUX-fältdata + lab) | **Misslyckades.** API:t utan nyckel svarade 429 på varje anrop, även med 20 till 160 sekunders backoff. Noll av 48 sidor hämtades. Kräver `PAGESPEED_API_KEY` i `.env.local`. |
| GSC URL Inspection API, topp 20 | Ej utfört, se avsnitt 6 |

## 3. Fältdata från PostHog

De tio mest besökta publika sidorna, p75, svenska besökare, 28 dagar.

| Sida | Mätningar | LCP | CLS | INP | FCP |
|---|---:|---:|---:|---:|---:|
| /artiklar/styrkor-svagheter-intervju | 186 | 2 032 | 0 | 48 | 1 140 |
| /artiklar/logiska-tester | 98 | 1 640 | 0,021 | 70 | 1 122 |
| / | 67 | 1 072 | 0,002 | 48 | 1 025 |
| /artiklar/kompetensbaserad-intervju-star-metoden | 54 | 1 512 | 0 | 28 | 901 |
| /verktyg/rekryteringstester | 48 | 1 776 | 0,002 | 128 | 948 |
| /artiklar/arbetsintervju-guide | 41 | 1 807 | 0 | 60 | 1 000 |
| /artiklar | 38 | 2 125 | 0 | 46 | 1 173 |
| /artiklar/fragor-att-stalla-pa-intervjun | 37 | 1 456 | 0 | 44 | 1 068 |
| /artiklar/kompetensbaserade-intervjufragor | 32 | 1 466 | 0,088 | 24 | 927 |
| /personligt-brev-exempel/koksbitrade | 19 | 3 076 | 0 | 66 | 1 150 |

INP är genomgående bra. CLS är noll eller försumbart utom på `kompetensbaserade-intervjufragor` (0,088) och `logiska-tester` (0,021). FCP på 900 till 1 200 ms är den gemensamma nämnaren, och det är JavaScript före målning.

## 4. Grundorsaken: PostHog i den delade runtimen

En analys av `rootMainFiles`, alltså det som laddas på varje sida oavsett route, visade:

| Chunk | Storlek | Innehåll |
|---|---:|---|
| 985cac06c0f77364.js | 210 kB | posthog |
| 2126c9292f0422c8.js | 169 kB | posthog |
| Övriga fem | 202 kB | React, Next, appkod |
| **Totalt** | **581 kB** | varav **379 kB posthog** |

Init:en var redan fördröjd till `requestIdleCallback` sedan en tidigare omgång, men det hjälper inte: `import posthog from 'posthog-js'` överst i modulen gör att koden hamnar i bundlen oavsett när init körs.

Tre statiska importer fanns:

1. `instrumentation-client.ts`, som Next bundlar i huvudentryn
2. `src/components/PostHogProvider.tsx`
3. `src/lib/analytics/events.ts`

Alla tre är borta. `instrumentation-client.ts` är raderad och init:en flyttad till `PostHogProvider`, som är en vanlig klientkomponent och därför hamnar i en egen chunk. `events.ts` läser klienten från `window.posthog` i stället för att importera modulen, vilket är säkert eftersom funktionerna redan var no-op när PostHog inte laddat.

**Resultat: delad runtime 581 till 411 kB, posthog 379 till 0 kB.**

## 5. Andra fynd

**CV-exempelsidornas mallbarrel.** `src/app/(public)/cv-exempel/[yrke]/page.tsx` importerade `getTemplateGenerator` från `@/lib/cv/templates`, en barrel som statiskt importerar alla 43 mallgeneratorer. Sidan använder bara `norrsken`. Den importerar nu generatorn direkt. Samma barrel finns kvar i tre klientkomponenter där mallen väljs av användaren; de lämnades eftersom en dynamisk import där kräver att effekten skrivs om, och risken översteg vinsten i den här omgången.

**MDX-komponenterna på artikelsidan.** 32 komponenter importeras statiskt på varje artikel, och varje artikel använder högst en. Jag provade `next/dynamic` med `ssr: true` för att behålla HTML oförändrad. **Det gjorde sidorna större, inte mindre** (510 till 600 kB) och långsammare. Ändringen backades. Slutsatsen är att `next/dynamic` i en server component lägger till overhead utan att ta bort något; en verklig uppdelning kräver att MDX-komponenterna laddas per artikel utifrån vilka som faktiskt förekommer i innehållet.

**En bugg i mätverktyget som är värd att känna till.** `Network.setCacheDisabled` måste anropas efter `Network.enable`. Anropas det före ignoreras det tyst, och då mäter man varm cache. Samma artikel gav 42 kB och 500 ms i en körning och 600 kB och 1 900 ms i nästa. Ordningen är rättad i `scripts/perf-publikt.ts` och kommenterad i koden.

## 6. Mätningen

Alla siffror med kall cache, en körning per sida.

| Läge | Sidor inom budget | Delad runtime |
|---|---|---:|
| Före | 21 av 48 | 581 kB |
| Efter | mätning pågår, se nedan | **411 kB** |

Artikelsidorna ligger på 1 530 till 1 880 ms med cirka 550 kB, alltså över budgeten på 1 500 ms. Startsidan klarar 704 ms mot budget 1 000. CLS är 0 på alla utom `cv-exempel/barnmorska` (0,003, inom brusgränsen).

**LCP-elementet på artikelsidorna är sidans H1**, som redan står färdig i server-HTML. Sidan väntar alltså inte på data utan på att 457 kB JavaScript ska laddas och hydreras.

PostHog hämtas fortfarande vid cirka 990 ms, före LCP på 1 580 ms, trots att init:en nu väntar på LCP-observern. Orsaken är att observern utlöses vid varje LCP-kandidat, inte bara den sista, så den första kandidaten startar hämtningen. Det bör bytas mot en fördröjning som mäter från `load` i stället.

## 7. Kvar att göra

| Post | Vad som krävs |
|---|---|
| **Artikelsidorna, 1 530 till 1 880 ms mot 1 500** | Kvarvarande 457 kB JS före LCP. Nästa steg är att mäta vad i de 411 kB delad runtime som artikelsidor faktiskt behöver. |
| **PostHog-init före LCP** | Byt LCP-observern mot en fördröjning från `load`, eller flytta init till första interaktion. |
| **MDX-komponenterna** | Kräver laddning per artikel utifrån innehållets faktiska komponenter, inte `next/dynamic`. |
| **PageSpeed Insights** | Skaffa `PAGESPEED_API_KEY`. Utan nyckel är kvoten obrukbar och vi saknar CrUX-fältdata per sida. |
| **GSC URL Inspection för topp 20** | Inte utfört. Kräver en egen körning mot Search Console API. |
| **`kompetensbaserade-intervjufragor`, CLS 0,088 i fält** | Syns inte i labbmätningen. Behöver undersökas mot riktig trafik. |
| **Tre klientkomponenter med mallbarreln** | `InteractiveCVPreview`, `YrkesmallInteractivePreview`, `InteractiveCVShowcase`. |

Mätningen är emulering på utvecklingsmaskin. Kör `npm run perf:publikt -- --port 8700 --korningar 3` på en tyst maskin och lita på medianen.
