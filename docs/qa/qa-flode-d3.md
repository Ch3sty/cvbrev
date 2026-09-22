# QA: Flöde (D3) och den omgjorda Funnel-sidan

Kört 2026-09-22 på grenen `matning/flode`. Produktionsbygge med
`NEXT_DIST_DIR=.next-d3 NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1`,
`next start` på port 5230, ett engångskonto med `super_admin` i
`admin_users` (skapat och raderat av skriptet). Skriptet ligger i
`scripts/qa-flode-d3.ts` och går att köra om:

```
NEXT_DIST_DIR=.next-d3 NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npx next build
NEXT_DIST_DIR=.next-d3 npx next start -p 5230
npx tsx scripts/qa-flode-d3.ts --port 5230
```

Skärmdumparna ligger i `docs/qa/qa-flode-d3/` som `<vy>-desktop.png`
(1280) och `<vy>-pixel7.png` (412, 2x). Samma metod som
`docs/qa/qa-admin-2026-09-15.md`: viewporthöjden sätts till den inre
scrollytans höjd, och dumpen väntar på `.recharts-surface`.

Före körningen backfylldes `admin_flode_daily` tio dagar
(`npx tsx scripts/admin-backfill.ts 10 --bara-flode`) och Stripe-,
PostHog- och Supabase-kolumnerna två dagar (`admin-backfill.ts 2 --hoppa-gsc`),
så att sidan inte var tom. Händelserna är nya i dag, så tratten från
spårvalet och framåt har bara dagens siffror.

## Resultat

LCP är median av tre körningar på desktop 1280. Budget 1,5 s och CLS 0.

| Vy | LCP (ms) | CLS | Konsolfel | HTTP 4xx/5xx | Recharts-ytor | Skärmdump |
|---|---|---|---|---|---|---|
| Flöde 30 dagar | 1024 | 0 | 0 | 0 | 4 | `flode-30-*` |
| Flöde 7 dagar | 932 | 0 | 0 | 0 | 4 | `flode-7-*` |
| Flöde 90 dagar | 884 | 0 | 0 | 0 | 4 | `flode-90-*` |
| Funnel | 1152 | 0 | 0 | 0 | 5 | `funnel-*` |

Redirect utan super_admin: `/admin` går till `/dashboard`. Ingen
horisontell scroll på Pixel 7. Sidfot syns inte.

Recharts-ytorna är fyra av fem möjliga: tratten är serverrenderade divar
och räknas inte, förnyelsekurvan visar "Inga veckoprenumerationer ännu"
eftersom inga veckopaket finns i Stripe än, och Kom igång visar sin
tomtext eftersom `paket_started_at` skrivs först från och med nu.

## Observationer

- **Cookie-bannern syns i adminen** på alla fyra vyer, för ett konto som
  aldrig svarat på den. Det är den vanliga bannern från rotlayouten, inte
  något i D3, och den fanns före grenen. Skriptet flaggar den; adminen
  borde nog hoppa över den, men det ligger utanför uppdraget.
- **Intäkt per paket** har bara två punkter (21 och 22 september) med
  paketkolumner, så den staplade ytan är en smal remsa längst till höger
  tills cronen fyllt fler dagar. Noten under diagrammet säger det.
- **Tratten** visar "−100 % bortfall" mellan "Valde spår" och "Såg
  köpsteget" i dag: `purchase_step_viewed` gick live under dagen och
  de två spårvalen skedde innan. Rättar sig från i morgon.
- **PostHog-händelserna** verifieras inte i emuleringen (PostHog ignorerar
  Puppeteer). Serverhändelserna täcks av `src/lib/analytics/__tests__/server.test.ts`,
  klientens `feature_blocked` av `FelSpar.test.tsx`; de nya
  klienthändelserna går via samma `capture` och syns i PostHogs
  live-vy efter driftsättning.
