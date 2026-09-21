# Vercel-förbrukningen, 21 september 2026

Hobby-kvoten sprack på en månad. Planen är nu Pro, så varje enhet kostar.
Trafiken är cirka 465 sessioner i veckan. Det går inte att förklara siffrorna
med besökare, och det behöver det inte heller: allt nedan är egna mönster.

| Mätvärde | Förbrukat | Kvot |
| --- | --- | --- |
| ISR Reads | 1,5 M | 1 M |
| Fast Origin Transfer | 13,5 GB | 10 GB |
| Deployment Storage | 34 GB | 10 GB |
| Functions Storage | 10,9 GB | 10 GB |
| Edge Middleware Invocations | 463 K | — |

## Sammanfattning

Tre fel, och de förstärker varandra. Proxyn satte en cookie på varje svar,
vilket gjorde varje svar privat och omöjligt att dela i CDN:et. Ingen publik
sida hade `revalidate`, så varje träff gick till origin. Och artiklarna väger
670 kB styck. Samma besök betalades alltså tre gånger: en Edge-invokering, en
ISR-läsning och en full origin-överföring.

Lagringsposterna har en egen orsak som inte har med trafik att göra:
189 MB källkartor följde med in i varje deploy.

## Mätning mot produktion

Tio URL:er, `curl -D -` mot www.jobbcoach.ai. Det som betyder något:

| URL | x-vercel-cache | Age | Storlek | Set-Cookie |
| --- | --- | --- | --- | --- |
| `/` | HIT | 1820 | 178 kB | jc_attr |
| `/artiklar/hur-skriver-man-cv` | PRERENDER | **0** | **684 kB** | jc_attr |
| `/artiklar/cv-mall-gratis-guide` | PRERENDER | **0** | **670 kB** | jc_attr |
| `/artiklar/vad-ar-ett-cv` | PRERENDER | **0** | **656 kB** | jc_attr |
| `/priser` | PRERENDER | 0 | 125 kB | jc_attr |
| `/artiklar` | MISS | 0 | — | jc_attr |
| `/sitemap.xml` | HIT | 1476 | 86 kB | jc_attr |
| `/robots.txt` | HIT | 707 | 125 B | jc_attr |
| `/opengraph-image` | PRERENDER | 0 | 272 kB | jc_attr |
| `/dashboard` | 307 | — | — | jc_attr |

Två saker syns direkt.

`Age: 0` på varenda artikel. Svaret återanvändes aldrig, trots att innehållet
är statisk MDX som bara ändras när vi deployar. `Cache-Control` sade
`public, max-age=0, must-revalidate` överallt, vilket är vad Next sätter när
ingen `revalidate` finns.

`Set-Cookie: jc_attr` på allt. Även på `/sitemap.xml`, `/robots.txt` och
`/opengraph-image`, som inte har någon användare att attribuera. Ett Set-Cookie
gör svaret personligt, och då slutar CDN:et dela det mellan besökare.
`/artiklar` svarade rentav `private, no-cache, no-store`.

## Grundorsaker, rangordnade

### 1. Cookien på varje svar, plus ingen revalidate

Driver ISR Reads (1,5 M) och Fast Origin Transfer (13,5 GB).

`src/proxy.ts` satte `jc_attr` på varje sidvisning där cookien saknades. Varje
ny besökare, och varje bot utan cookiehantering, fick alltså ett svar som
CDN:et inte kunde återanvända. Sökmotorer och förhandsgranskare bär aldrig
cookies mellan anrop, så för dem var varje enskild hämtning en ny origin-träff.

Samtidigt saknades `export const revalidate` i hela `src/app/(public)`.
Grep gav noll träffar. De enda `revalidate`-värdena i kodbasen låg i
adminvyerna och i `unstable_cache`-anrop, aldrig på en publik sida.

Räkneexemplet håller. 13,5 GB delat med 670 kB är ungefär 20 000
artikelhämtningar. Med 465 sessioner i veckan, alltså cirka 2 000 i månaden,
går det inte ihop med mänsklig trafik. Det är crawlers plus varje intern
navigering som gick till origin i stället för till cachen.

### 2. Källkartor i deployen

Driver Deployment Storage (34 GB) och Functions Storage (10,9 GB).

Ett produktionsbygge mättes lokalt:

```
.next/server            263 MB
  varav .map-filer      189,5 MB   (1 548 filer, 72 procent)
  varav kod             62,2 MB
.next/static             12 MB
totalt                  276 MB
```

`server/chunks/ssr` ensamt innehöll 102,6 MB källkartor. Den största enskilda
filen var `node_modules_77ac20c3._.js.map` på 45 MB, bredvid en kodfil på 11 MB.

Turbopack slår på serverkällkartor som standard och `next.config.ts` stängde
aldrig av dem. Kartorna följer med in i varje lambda-bundle, vilket förklarar
varför Functions Storage ligger nära Deployment Storage: samma filer räknas i
båda.

20 produktionsdeployer ligger kvar, den äldsta 98 dagar gammal. 276 MB gånger
20 är ungefär 5,5 GB, och med Vercels egna kopior av bygg-cache och lambda-lager
landar det i rätt storleksordning för 34 GB.

### 3. Proxyns matcher

Driver Edge Middleware Invocations (463 K).

Den gamla matchern undantog bara `_next/static`, `_next/image`, `favicon.ico`
och en lista mediefiländelser. Allt annat gick genom proxyn, alltså:

- `sitemap.xml`, `robots.txt`, `manifest.webmanifest`
- alla `opengraph-image`-rutter, 19 filer i trädet
- `/api/cron/pricing-sync`, som körs två gånger per dygn och autentiserar med
  egen hemlighet
- RSC-hämtningar och prefetch under `_next/` som inte var `static` eller `image`

Varje sådan invokering körde dessutom `updateSession`, som gör ett
`supabase.auth.getUser()`. En sessionsläsning för att servera robots.txt.

## Vad som ändrades

Rena kodändringar, ingen produktrisk.

**`src/proxy.ts`**

Attributionscookien sätts nu bara när tre villkor gäller samtidigt: svaret är
ett HTML-dokument (`sec-fetch-dest: document`), besökaren kommer utifrån eller
bär en kampanjparameter, och cookien saknas. En intern klickning bär redan
cookien, och en direktträff utan referrer har ingen källa att spara. Resten av
sajten kan därmed ligga kvar i CDN:et.

Matchern undantar nu hela `_next/`, `api/cron/`, sitemap, robots, manifest,
llms.txt, alla `opengraph-image` och `twitter-image`, samt fler filändelser.

**`revalidate` på de publika sidorna**

- `src/app/(public)/layout.tsx`: 86400 som default för hela det publika trädet.
  Ett värde i stället för fyrtio, och en enskild sida kan sätta kortare.
- `src/app/(public)/artiklar/[slug]/page.tsx`: 86400, ett dygn.
- `src/app/(public)/artiklar/page.tsx`: 86400. Sidan läser `searchParams` och
  står kvar som `ƒ` i bygget, det går inte att komma runt utan att bygga om
  filtreringen. Värdet gör ändå nytta: svaret är inte längre `no-store`. Sidan
  är en av många och väger lite mot artiklarna på 670 kB, så en ombyggnad av
  tag- och sidfiltreringen till egna statiska rutter får vänta.
- `src/app/sitemap.ts`: 86400.
- `src/app/robots.ts`: `false`, alltså aldrig. Filen är 125 byte statisk text.

**`next.config.ts`**

`productionBrowserSourceMaps: false`, `experimental.serverSourceMaps: false`
och `experimental.turbopackSourceMaps: false`.

Den sista är den som faktiskt gör jobbet. `serverSourceMaps` styr
webpack-vägen, och vi bygger med Turbopack. Ett bygge med bara de två första
gav oförändrade 276 MB och 1 548 kartfiler. Först med `turbopackSourceMaps`
försvann de.

## Förväntad effekt

| Post | Före | Väntat efter |
| --- | --- | --- |
| ISR Reads | 1,5 M | under 100 K |
| Fast Origin Transfer | 13,5 GB | 1–2 GB |
| Deploy-storlek | 276 MB | cirka 85 MB |
| Deployment Storage | 34 GB | 10–12 GB, faller när gamla deployer städas |
| Functions Storage | 10,9 GB | 3–4 GB |
| Edge-invokeringar | 463 K | 150–200 K |

ISR- och transfersiffrorna hänger ihop: när cookien inte längre gör svaren
privata börjar CDN:et dela dem, och då faller båda samtidigt. Lagringen faller
vid nästa deploy för Functions Storage, men Deployment Storage sjunker först
när de gamla deployerna är borta.

## Verifiering

- `npx tsc --noEmit` utan fel.
- `npx vitest run`, 335 tester i 27 filer, alla gröna.
- `npx next build` går igenom, avslutningskod 0.
- Källkartorna är borta ur bygget: noll `.map`-filer i `server/` mot 1 548
  tidigare. Byggkatalogen gick från 276 MB till 82 MB, alltså 70 procent bort.
- Ruttabellen visar `Revalidate 1d, Expire 1y` på hela det publika trädet.
  Räknat på rutter utanför `/api`: 78 statiska, 9 prerenderade med
  `generateStaticParams`, 61 dynamiska. De dynamiska som är kvar ska vara det:
  admin, dashboard, auth, delningslänkar med token, `/profile/cv/[id]` och
  start-flödena. Artiklarna ligger som `●` med 135 slugs prerenderade.

En not om lokala bygg: `next build` misslyckas här med
`Failed to fetch Inter from Google Fonts` om man inte sätter
`NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1`. Felet finns i alla fyra
bygg jag kört, även i det orörda utgångsläget, så det är en lokal TLS-sak och
ingen regression. Turbopacks hämtare bryr sig inte om
`NODE_TLS_REJECT_UNAUTHORIZED`. Vercels byggmiljö påverkas inte.

Attributionen behöver kontrolleras i skarpt läge efter deploy, eftersom
`sec-fetch-dest` inte går att återskapa troget mot en lokal server. Kontrollen
är enkel: surfa in på en artikel från en Google-träff och läs `jc_attr` i
webbläsarens cookielista. `landing_path` ska peka på artikeln. Klickar man
vidare internt ska cookien inte skrivas om, och det är hela poängen med
first touch.

## Vad ägaren bör göra i Vercels gränssnitt

Det här går inte att lösa i koden.

1. **Radera gamla preview-deployer.** Fem previews ligger kvar, 97 till 98
   dagar gamla, plus elva produktionsdeployer äldre än 57 dagar. Behåll de tre
   senaste produktionsdeployerna för rollback och ta bort resten. Det är den
   enskilt största posten mot Deployment Storage. Jag har inte rört dem.
   Settings, Deployments, eller `vercel remove` per deploy.
2. **Slå på deployment retention.** Project Settings, Advanced, Deployment
   Retention. Sätt previews till 7 dagar och produktion till 30. Då slipper vi
   göra den här städningen manuellt igen.
3. **Stäng av automatiska deployer för branches som inte behöver preview.**
   Varje push blir annars en deploy på 85 MB. Git, Ignored Build Step.
4. **Kontrollera Observability efter ett dygn.** Titta på ISR Reads och Fast
   Origin Transfer. Ligger de kvar högt är nästa misstänkte artiklarnas
   storlek: 670 kB HTML per sida är mycket, och en del av det är sannolikt
   inline-data som kunde ligga i en separat cachad resurs. Det är ett större
   ingrepp och ligger utanför den här omgången.
