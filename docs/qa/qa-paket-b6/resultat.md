# QA B6: ångerrättssamtycket i kassan

Klicktest i riktig Chrome (puppeteer-core, systemets Chrome), Pixel 7
(412x915, deviceScaleFactor 2, touch), produktionsbygge i `.next-b6` på port
3106. Kört 2026-09-22. Skript: `scripts/qa-paket-b6.mjs`.

**22 av 22 kontroller gröna.**

Köpknappen klickas. Testet anropar aldrig `/api/stripe/create-plan-session`
själv, vilket var precis felet i B5:s omgång: ett klicktest som kringgår
knappen testar API:t och inte flödet.

Inget betalades. `STRIPE_SECRET_KEY` är live, så testet stannar på Stripes
betalsida, läser sessionen via API:t med id:t ur adressen, och vänder.

## Per paket

| Kontroll | CV-veckan | Allt-dagen | Allt-månaden |
|---|---|---|---|
| Skärm 1.2 visar samtyckesrutan | OK | OK | OK |
| Köpknappen spärrad utan kryss | OK | OK | OK |
| Cookie-bannern täcker inte knappen | OK | OK | OK |
| Klicket navigerar till checkout.stripe.com | OK | OK | OK |
| Sessionen bär `angerratt_samtycke_at` | OK | OK | OK |
| Metadatatexten är kryssrutans exakta text | OK | OK | OK |

Skärmdumpar: `<paket>-1-kopsteg.png`, `<paket>-2-samtycke-ikryssat.png` och
`<paket>-3-stripe.png` per paket, alltså Stripes egen sida i bild för alla
tre. Rådata i `resultat.json`.

## Vad Stripe faktiskt fick

Sessionerna lästes tillbaka ur Stripe efter klicket. Alla tre bär både
tidsstämpeln och texten, och texten är teckenlikadan med `PAKETSKARM.samtycke`
i `src/lib/onboarding/program.ts`, alltså konstanten kryssrutan renderar.

| Paket | mode | `angerratt_samtycke_at` |
|---|---|---|
| CV-veckan | subscription | 2026-09-22T08:46:08.220Z |
| Allt-dagen | payment | 2026-09-22T08:46:19.990Z |
| Allt-månaden | subscription | 2026-09-22T08:46:31.569Z |

`subscription_data.metadata` och `payment_intent_data.metadata` går inte att
läsa på en obetald session: prenumerationen och betalningsavsikten skapas
först när kunden betalar, och testet betalar inte. Att rutten skickar med
samma metadata på båda är i stället låst av enhetstestet
`src/app/api/stripe/create-plan-session/__tests__/consent.test.ts`, som läser
anropets argument.

## Cookie-bannern på Pixel 7, saas-leads prio 1

**Ingen ändring behövdes.** Bannern ligger inte över köpknappen.

Mätningen gjordes i en ny session, alltså med bannern synlig, och frågade
webbläsaren vad som faktiskt ligger överst i knappens mittpunkt
(`document.elementFromPoint`) i stället för att läsa z-index i en fil. Svaret
var köpknappen själv på både skärm 1.1 och 1.2, aldrig
`.cookie-banner-container`.

Skälet finns redan i koden: `FlowShell` publicerar fotens verkliga höjd som
`--flow-footer-h`, och `globals.css` lyfter bannern med
`html[data-flow-active='true'] .cookie-banner-container { bottom:
var(--flow-footer-h) }`. Under ett flöde står bannern alltså ovanför foten i
stället för över den, och samtycket går fortfarande att lämna. Bild:
`cookie-1-skarm-1.1-med-banner.png` och `cookie-2-skarm-1.2-med-banner.png`.

## QA-kontot

Ett konto, skapat och raderat i samma omgång med
`scripts/qa-paket-b6-konton.mjs`. Raderat efter körningen.
