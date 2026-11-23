# Byggnoter: kampanjmärket och köpsteget (2026-11-23)

Byggt natten mot måndag 23 november efter `docs/design/spec-kampanjmarke-2026-11-23.md` och saas-leads villkor. Gren `design/publikt-omgang3`, från `7db1b1a9`.

## Tre commits

1. **Märket** (`57a5dbbd`): klockan, `KampanjMarke.tsx`, `kampanj.css`, publika ytor, raderna, sidomenyn, art directorns filer.
2. **Köpsteget** (`0039a451`): FlowShell-propen `footer`, `kopsteg.css`, steget `kop` i rummens form. Kan lyftas ur ensamt.
3. **Betalväggarnas prisrad** (`20ca2986`, spec 6.3): `PremiumPrisradText` och `PaywallCard` får märket på egen rad före prisraden.

## Avvikelser från specen, med skäl

- **Text minst 12 px** (saas-lead 3): brickornas enhet i mellanstorleken och sidomenyns andra rad är 12 px i `src/components/kampanj/kampanj.css`. Art directorns fil under `docs/design/` står orörd.
- **"kvar" i sidomenyn** döljs när kampanjens namn är längre än tio tecken (`km-meny-utan-kvar`). "Cyber Monday 23 tim 54 min kvar" sköt över 2 px i 248 px; "Black Week 6 d 22 tim kvar" ryms.
- **Två etiketter till följer kampanjpriset** (saas-lead 4): `/verktyg/jobbmatchning` och `/verktyg/personligt-brev` hade "Jobbcoach Premium, 149 kr i månaden" över ön, som i kampanjläge visar 99 kr. De går nu genom `MedKampanjPris`, som `/verktyg/rekryteringstester` redan gjorde. Övriga Premium-öar med pris har knappar utan belopp eller kampanjens knapptext.
- **`MedKampanjPris`** har ett mellanslag för skärmläsare mellan namnet och priset (`sr-only`), så att textutdraget blir "Black Week 99 kr ..." och inte "Black Week99 kr".
- **Den gamla `PremiumBlock.tsx`** ritas inte med pris på någon sida i dag; bara bytet till `storlek="mellan"` är gjort.
- **`.pub-pris s` och `.ib-pris-l s`** står kvar i `KampanjHuvud`: `pub-pris` används fortfarande av `PremiumBlock.tsx`.
- **Inloggat vid noll**: `router.refresh()` högst en gång i minuten, så att en klient vars klocka går före serverns inte hämtar om varannan sekund.
- **Kassans tester** (`create-plan-session/__tests__/consent.test.ts`, `retur.test.ts`) föll sedan midnatt, eftersom kampanjen pågår på riktigt och mockarna saknar profilen som `kampanjForKop` läser. De har nu fast klocka (`KAMPANJ_NU` före kampanjen). Rutten är inte ändrad.

## Kontrollerat i riktig webbläsare

Lokalt `next start` mot produktionens databas, Chrome headless, 412 (Pixel 7) och 1440. Bilderna ligger i sessionens scratchpad (`kampanj-bygge/bilder`).

- Köpsteget från kampanjmejlets adress, inloggad och utloggad (inloggningen skickar tillbaka till steget), 412, 1440 och 360 × 640: pris, nedräkning, samtycke och knapp syns utan rullning. Knappen står still när rutan kryssas.
- Kassan: 99,00 kr, "Black Week −50,00 kr", "Därefter 149,00 kr". Kroppen till `create-plan-session` är byte för byte densamma som live före ändringen, och samtyckestexten i sessionens metadata är oförändrad. Kassorna stängdes och testkunden raderades i Stripe.
- Lägena: sista dygnet (sekunder), sista timmen (fyllda brickor), 23.59.50 (Black Week byter själv till Cyber Monday), Cyber Monday, ordinarie, reservläget (klockan avstängd) och minskad rörelse (inga sekunder).
- Ordinarie läge: startsidans ö, prislappen och `/funktioner`s ö är pixellika med live i 1440 och 412.
- Ingen sidledsrullning i 412, inga konsolfel om hydrering, CLS 0 på `/priser` och högst 0,003 på startsidan i 1440 (samma i ordinarie läge, alltså inte märket).
- Artiklarnas sidokort i 1366 × 768: knappen syns i det klistrade kortet. Klistringen är kvar.
- Konto som haft Premium: ingen rad, ingen kampanj publikt (cookien), köpsteget i ordinarie form med 149 kr.

## Grindarna

- `tsc --noEmit`: inga fel. Hela vitest: 422 filer gröna, 3 hoppade (pglite), 5 313 tester.
- `next build --webpack`: grönt (två gånger: efter märket och köpsteget, och efter sidomenyns "kvar" och betalväggarna).
- SEO-grinden mot det sista bygget, jämfört med `docs/qa/seo-diff/publikt-omgang3-efter-live-7.json`: 502 sidor, alla 200, **Fel: 0**. Inga nya undantag. Avtrycket ligger i `docs/qa/seo-diff/kampanjmarke-2026-11-23-efter.json`. Ordantalet i `main` ökar några procent på sidor med varianter (märkets text), vilket grinden godtar.

## Kvar

- Prisrader som är rena strängar (`src/lib/tester/steg2/copy.ts`, `src/lib/tester/v4/gratis.ts`, `src/components/paywall/paywall-copy.ts`) har inget märke (spec 6.3).
- I-provets och provsidans inline-prisrader (`MatrisTrana`, `NivakollKop`) får märket före texten mitt i meningen; ser det fel ut i rummen tas det bort där.
