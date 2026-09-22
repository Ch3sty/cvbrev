# PostHog: Paket och onboarding

Skapat 2026-09-22 av D3 via PostHogs API (projekt 148688, EU). Speglar
sidan `/admin/flode`, men ligger i PostHog för att kunna borras i: klicka
på ett steg i tratten för att se personerna, byt fönster, lägg till filter.

## Dashboard

**Paket och onboarding**
https://eu.posthog.com/project/148688/dashboard/968012 (id 968012, fäst)

## Insikter

| Insikt | Typ | Uppdelning | Länk |
|---|---|---|---|
| Köpflödet per paket | Tratt, 6 steg, 14 dagars fönster per person, 30 dagar | `plan` | https://eu.posthog.com/project/148688/insights/EQOizUsF (id 6081856) |
| Var det tar stopp: feature_blocked per funktion | Trend, unika per dag, staplar, 30 dagar | `feature` | https://eu.posthog.com/project/148688/insights/N3zXg8qT (id 6081857) |
| Kom igång: onboarding_step_completed per steg | Trend, unika per dag, staplar, 30 dagar | `step` | https://eu.posthog.com/project/148688/insights/iDMWcF2u (id 6081859) |
| Förnyelser: renewal_succeeded per plan | Trend, antal per vecka, 90 dagar | `plan` | https://eu.posthog.com/project/148688/insights/VRAMvuCw (id 6081860) |

Trattens steg, i ordning: `$pageview`, `signup_completed`, `track_selected`,
`purchase_step_viewed`, `checkout_started`, `subscription_paid`. Besök och
registrering bär ingen plan, så PostHog räknar dem i varje gren av
uppdelningen; andelarna från `track_selected` och framåt är de som gäller
per paket.

## Händelserna och var de skjuts

| Händelse | Egenskaper | Var |
|---|---|---|
| `track_selected` | track, surface, intent | klient, ValjSparClient när spåret sparas |
| `purchase_step_viewed` | plan, surface | klient, ValjSparClient när skärm 1.2 visas |
| `consent_checked` | plan | klient, ValjSparClient första gången rutan kryssas |
| `checkout_started` | plan, length | klient, ValjSparClient precis före hoppet till Stripe |
| `subscription_paid` | plan, scope, amount_sek | server, Stripe-webhooken vid första fakturan och engångsköp |
| `renewal_succeeded` | plan, cycle, amount_sek | server, Stripe-webhooken vid `subscription_cycle` |
| `welcome_viewed` | paket, has_cv | klient, /dashboard/vecka/start |
| `komigang_opened` | paket, provade, totalt, surface | klient, KomIgangContext.oppna (rad, valkomst) |
| `onboarding_step_completed` | paket, step, index, hours_since_purchase | server, komigang-server.ts vid varje ny kvittering |
| `onboarding_completed` | paket, hours_since_purchase | server, komigang-server.ts när listan är full |
| `feature_blocked` | feature, scope, surface | klient, PaywallCard och FelSpar |
| `gray_option_tapped` | feature, scope, surface | klient, GraValSheet |

Serverhändelserna har `$lib = jobbcoach-server` och användar-id som
`distinct_id`, alltså samma person som klientens `identify`.

## Om det behöver göras om

Skriptet som skapade allt ligger inte i repot (det var en engångskörning
mot API:t med `POSTHOG_PERSONAL_API_KEY`). Manuellt i PostHog:

1. **Insights, New insight, Funnel.** Lägg till de sex händelserna ovan i
   ordning. Under "Breakdown by" välj event property `plan`. Conversion
   window 14 dagar. Spara som "Köpflödet per paket".
2. **New insight, Trends.** Händelse `feature_blocked`, math "Unique users",
   breakdown `feature`, chart type Bar. Spara.
3. Samma för `onboarding_step_completed` med breakdown `step`, och
   `renewal_succeeded` med breakdown `plan` (math Total, intervall vecka).
4. **Dashboards, New dashboard** "Paket och onboarding", lägg till de fyra
   insikterna via "Add insight".
