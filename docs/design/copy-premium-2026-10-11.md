# Skrivregel: Jobbcoach Premium

Ägarens beslut 2026-10-11 (spec-rummen avsnitt 17.3 och 17.4). Det enda som säljs är **Jobbcoach Premium**, 149 kr i månaden, löpande, uppsägning när som helst. Nyckeln all_month och priset är oförändrade. Reglerna från 2026-09-24 gäller där de inte ersätts här. Ingen kod är ändrad i det här dokumentet; det är facit för Opus-agenten i våg 5.

## 1. Fullt namn eller kortform

Två former finns, inga fler.

| Form | Skrivs | Används |
|---|---|---|
| Fullt namn | `Jobbcoach Premium` | Där namnet står utan jobbcoach.ai runt sig, eller där pengar byter ägare: knappar med verbet Köp, prissidans rubrik och kort, Stripe (produktnamn, kassan), kvitto (ämne, rubrik, rad), förnyelse- och uppsägningsmejl, köpbekräftelsen ("Tack. Du har Jobbcoach Premium."), prenumerationssidans kort och statusrad, SEO-title och description, AggregateOffer, användarvillkor, admin (med längd: "Jobbcoach Premium, en månad"). |
| Kortform | `Premium` | Inne i appen och på publika sidor där sidan själv är Jobbcoach: låsta rader, chips, brickor på mall och typsnitt, sidomenyns underrad och badge, betalväggens rubrik, brödtext efter att fulla namnet stått en gång på ytan, eyebrows, FAQ-svar. |

Regel per yta: fulla namnet står **en gång** per yta, i knappen eller i rubriken. Allt annat på samma yta säger Premium. På en betalvägg betyder det: rubriken säger Premium, knappen säger Jobbcoach Premium. Ett mejl eller ett kvitto är en egen yta: där står fulla namnet i ämne och rubrik, Premium får stå i brödtexten därefter.

Två undantag där kortformen är förbjuden, se avsnitt 4: rader som nämner LinkedIn, och Stripe/kvitto/mejl.

## 2. Böjning och form

- **Versaler:** `Jobbcoach Premium` med stort J och stort P, också mitt i en mening. `Premium` alltid med stort P när det är produkten. Gement `premium` är ett vanligt adjektiv och får bara stå i branschtexterna (yrkesmall-content: "Premium-restauranger", "premium cocktail-bar"), aldrig om vår produkt.
- **Oböjt:** namnet böjs aldrig. Aldrig "Premiumet", aldrig "Premiums" (skriv "priset på Premium"), aldrig plural.
- **Ingen efterled:** aldrig "Premium-paketet", "Premiumpaketet", "Premium-prenumerationen", "Premium-kontot", "Premium-funktioner", "Premium-mallar". Skriv "Premium", "mallar som ingår i Premium", "den som har Premium".
- **Aldrig ihop med Jobbcoachen:** chatten heter Jobbcoachen, produkten Jobbcoach Premium. Aldrig "Jobbcoachen Premium", aldrig "Jobbcoach" ensamt om produkten, aldrig "Jobbcoach.ai Premium".
- **Prepositioner:**
  - `ingår i Premium` när något finns i produkten (låsta rader, brickor, FAQ).
  - `i Premium` för det som finns där ("Allt i Premium", "I Premium frågar du Jobbcoachen så mycket du vill").
  - `med Premium` när läsaren gör något ("Med Premium laddar du ner CV:t som PDF").
  - `har Premium` för kundens tillstånd ("Du har Premium", "Den som har Premium").
  - Aldrig "på Premium", aldrig "till Premium" (därmed inget "Uppgradera till Premium"), aldrig "för Premium" utom i kvittots "kvittot på 149 kr för Jobbcoach Premium".
- **Verbet:** `Köp`. Aldrig Skaffa, Ta, Välj, Uppgradera, Prova, Gå över till.
- **Pris och period:** i knappar och säljrader följs namnet alltid av `149 kr i månaden`. Perioden är aldrig en del av namnet. Aldrig "149 kr/mån", "149:-", "per månad" i användartext (admin och Stripe får sina egna format).
- **Ordet paket:** med ett enda paket är pluralen osann. "paketen", "alla tre paketen", "de andra paketen", "Jämför paketen", "Byt paket" stryks överallt (ersättningar i avsnitt 3). Singularen "ett paket" ersätts med Premium eller prenumeration. "Hela paketet" skrivs aldrig mer, inte heller med gement h i annan betydelse.

## 3. Exakta formuleringar

Datum och antal i exemplen är platshållare; de läses ur prenumerationen eller PLANS, aldrig som fasta tal.

| Plats | Sträng |
|---|---|
| Knapp, betalvägg, prissida, köpsteg, nedgraderad | `Köp Jobbcoach Premium, 149 kr i månaden` |
| Knapp när fulla namnet redan står som rubrik på samma kort (bara prissidans kort och köpsteget) | `Köp Premium, 149 kr i månaden` |
| Betalväggens rubrik | `{Det låsta} ingår i Premium`. Exempel: `Mallen ingår i Premium`, `Avancerad nivå ingår i Premium`, `Provläget ingår i Premium`, `Åtgärderna ingår i Premium`, `Bli upptäckt ingår i Premium`, `Nedladdningen ingår i Premium`. LinkedIn: `LinkedIn-optimeringen ingår i Jobbcoach Premium` (avsnitt 4). |
| Betalväggens prisrad under brödtexten | `149 kr i månaden, säg upp när du vill.` |
| Sekundärknapp i betalvägg (ersätter "Jämför paketen" och "Se vad paketen kostar") | `Se vad som ingår` (länk /priser) |
| Låst rad, sidomenyns underrad, gråad nivå i testhubben, Kom igång-bricka | `Ingår i Premium` |
| Låst rad med tak | `Ingår i Premium, utan tak` |
| Låst CV-plats (ersätter "Låst. Ingår när du har ett paket.") | `Låst. Ingår i Premium.` |
| Bricka på mall och typsnitt | `Premium` |
| Sidomenyns badge, gratiskonto (ersätter "Från 49 kr") | `149 kr i månaden` |
| Sidomenyns badge, betalande | `Premium` |
| Statusrad när kunden har Premium (ersätter "Ett paket är aktivt") | `Du har Premium` |
| Analysen utan tak (ersätter "Du har ett paket. Analysera så ofta du vill.") | `Du har Premium. Analysera så ofta du vill.` |
| Prissidans H1 | `Jobbcoach Premium, 149 kr i månaden` |
| Prissidans förklaringsrad under H1 (58 tecken) | `CV, personliga brev, tester, jobbmatchning och Jobbcoachen` |
| Prissidans ingress | `Allt är öppet från första minuten. Ingen bindningstid, du säger upp med ett klick.` |
| PLANS.beskrivning för all_month (58 tecken, samma rad som ovan) | `CV, personliga brev, tester, jobbmatchning och Jobbcoachen` |
| PLANS.body för all_month | `149 kr i månaden. Allt ingår. Dras varje månad tills du säger upp.` |
| PLANS.ctaLabel för all_month | `Köp Jobbcoach Premium, 149 kr i månaden` |
| SEO-title /priser (58 tecken) | `Priser: Jobbcoach Premium, 149 kr i månaden \| Jobbcoach.ai` |
| Meta description /priser (148 tecken) | `Jobbcoach Premium kostar 149 kr i månaden. CV-analys, personliga brev, rekryteringstester, jobbmatchning och Jobbcoachen ingår. Säg upp när du vill.` |
| Köpbekräftelsens rubrik | `Tack. Du har Jobbcoach Premium.` |
| Köpbekräftelsens underrad | `Nästa dragning 11 november, 149 kr. Säg upp när du vill i ditt konto.` |
| Prenumerationssidan, aktiv | `Jobbcoach Premium, 149 kr i månaden. Nästa dragning 11 november.` |
| Prenumerationssidan, uppsagd | `Jobbcoach Premium, uppsagt. Gäller till 11 november, förnyas inte.` |
| Prenumerationssidans rubrik (ersätter "Köp eller byt paket") | `Prenumeration` |
| Kvittomejl, ämne | `Kvitto: Jobbcoach Premium, 149 kr` |
| Kvittomejl, rubrik | `Kvitto för Jobbcoach Premium` |
| Kvittomejl, brödtext | `Här är kvittot på 149 kr för Jobbcoach Premium. Perioden gäller 11 oktober till 11 november och dras sedan varje månad på samma datum, tills du säger upp. Det gör du i ditt konto under Prenumeration.` |
| Kvittomejl, rader | `Belopp: 149 kr inklusive moms` / `Prenumeration: Jobbcoach Premium, en månad` / `Period: 11 oktober till 11 november` / `Nästa dragning: 11 november` |
| Kvittomejl, ångerrättsrad (ny, sist bland raderna) | `Du valde att starta direkt, så ångerrätten på fjorton dagar gäller inte. Säg upp när du vill, då dras inget mer.` |
| Kassans ångerrättsruta (lagkrav, oförändrad) | `Starta direkt. Jag förstår att ångerrätten på fjorton dagar inte gäller när innehållet påbörjats.` |
| Uppsägningskvitto, ämne (ersätter "Uppsagt. Veckan gäller till söndag.") | `Uppsagt. Jobbcoach Premium gäller till 11 november.` |
| Uppsägningskvitto, rubrik | `Uppsagt, och perioden gäller ut` |
| Förnyelsemejl, ämne (befintligt mönster) | `Jobbcoach Premium förnyas i morgon, 149 kr. Så här gick månaden.` |
| Belöning | `Du har fått Jobbcoach Premium i 3 dagar.` |
| Stripe product.name | `Jobbcoach Premium` |
| Stripe price.nickname (oförändrat) | `månad` (vecka, kvartal, dag ligger kvar på de osålda priserna) |
| Kontoutdrag (statement descriptor, ägaren ändrar i Stripe) | `JOBBCOACH PREMIUM` (17 tecken, under gränsen 22) |
| Användarvillkor, rubrik 7 | `Prenumeration och betalning`; "våra paket" blir `Jobbcoach Premium` |
| Dagspasset (osålt, kvar i PLANS) | beskrivning `Jobbcoach Premium i 24 timmar. Engångsköp, förnyas inte.`, body `24 timmar med Jobbcoach Premium. Ett engångsköp, inget dras igen.` |

Ersättningar för orden om flera paket:

| Står i dag | Skrivs |
|---|---|
| Jämför paketen / Jämför alla tre paketen / Se alla tre paketen / Se paketen | `Se vad som ingår` |
| Se vad paketen kostar | `Se priset` |
| Byt paket / Köp eller byt paket | `Prenumeration` |
| Ingår när du har ett paket | `Ingår i Premium` |
| Ingår inte i ditt paket | `Ingår i Premium` |
| Ingår i alla tre paketen / ingår i alla tre paketen | `Ingår i Premium` |
| Med ett paket: obegränsat antal CV | `Med Premium: obegränsat antal CV` |
| Utan tak i ditt paket | `Utan tak i Premium` |
| allt i de andra paketen / allt i de andra två paketen | `alla CV-mallar, CV-analysen, personliga brev och alla rekryteringstester` |
| Fler frågor om paketen? | `Fler frågor om priset?` |
| Har du ett paket får du svar först / Har du ett paket hanteras ditt ärende först | `Har du Premium får du svar först` |
| En fråga om ditt paket | `En fråga om din prenumeration` |
| Du har redan ett paket. Byt paket i stället för att teckna ett till. | `Du har redan Jobbcoach Premium.` |
| köpte ett paket (aktivitetslogg) | `köpte Jobbcoach Premium` |
| Allt i CV-paketet och Träningspaketet (highlight-rad) | två rader: `Alla CV-mallar, CV-analysen, personliga brev och LinkedIn` och `Alla rekryteringstester, provläget och personlighetstestet` |

## 4. Krockar

1. **Testet som förbjuder ordet.** `src/lib/plans/__tests__/paketnamn.test.ts`, describe "ordet Premium", faller på varje användarsträng med Premium, och `scripts/qa-slutflode-sist.mjs` rad 105 och 164 kräver `!/Premium/`. Båda måste vändas, inte bara tas bort. Nytt test: förbjud `Hela paketet` i alla former, `Premium-paketet`, `Premiumpaketet`, `Premium-` följt av substantiv om produkten, `Jobbcoachen Premium`, `Uppgradera till`, ordet `paketen`, och gement `premium` i användarsträng utanför yrkesmall-content och `tier === 'premium'`. Tillåt exakt `Jobbcoach Premium` och `Premium` med stort P. MARKOR-mekanismen får ligga kvar.
2. **LinkedIn Premium finns.** "LinkedIn-profilen ingår i Premium" läses som LinkedIns egen produkt. I alla rader där ordet LinkedIn står inom samma mening eller samma kort skrivs fulla namnet: `LinkedIn-optimeringen ingår i Jobbcoach Premium`. Gäller linkedin-optimering/layout.tsx, page.tsx, paywall-variant linkedin, Sidebar-underraden för LinkedIn, FunktionerSida rad 293, introduktion/page.tsx rad 90.
3. **Jobbcoachen (chatten) mot Jobbcoach Premium.** I rader om Jobbcoachen används kortformen så att "Jobbcoach" inte står två gånger: `Jobbcoachen utan tak ingår i Premium`, `I Premium frågar du Jobbcoachen så mycket du vill`. Aldrig "Jobbcoachen ingår i Jobbcoach Premium". Gäller api/jobbcoachen/chat/route.ts rad 130, jobbcoachen-faq-data.ts rad 35 och 43, paywall-variant chatt och kvot chat_message, rakna-ut/page.tsx och KalkylatorSida.tsx.
4. **df2212b0 (24 sep).** Ordet togs bort för att produkten då hette paket och "Premium" syftade på en gammal gratisperiod ("fem dagar Premium"). Den gratisperioden finns inte längre, så ordet kommer tillbaka med en enda betydelse och säger inget fel för någon som såg flödet efter 24 sep: de såg "Ingår när du har ett paket", som nu blir "Ingår i Premium". Men två gamla strängar slank igenom testet för att de var gemena och säger fortfarande "Uppgradera till premium": `src/hooks/use-profile.ts` rad 820 och 897, `src/app/api/cv/upload/route.ts` rad 362. De skrivs om till `Köp Jobbcoach Premium, 149 kr i månaden` respektive `Fler CV ingår i Premium.` Även `src/lib/ai/analytics/recommendation-engine.ts` rad 215 och 227 ("Välj ett paket", "Uppgradera nu").
5. **Numeriska testet.** `src/lib/numericalTest/questionBank.json` rad 475 till 530 använder "Premium" som prisnivå i en räkneuppgift. Lämnas: det är en uppgift om en påhittad produkt, och att byta ordet skulle ändra testinnehåll. Branschtexterna i yrkesmall-content lämnas också.
6. **"gratis och premium" om mallarna.** `CvMallarPageContent.tsx` rad 128 och `cv-mallar/opengraph-image.tsx` rad 15 blandar adjektiv och produktnamn. Skrivs `gratis eller i Premium`.
7. **Gamla namn i mejlmetadata.** `GAMLA_NAMN` i plans.ts saknar "Hela paketet". Ett schemalagt mejl från före bytet med planName men utan planKey skulle skriva "Hela paketet" rått (paketNamnUrMetadata faller tillbaka på namn). Lägg till `'Hela paketet': 'all_month'` i GAMLA_NAMN.
8. **Befintliga vecko- och kvartalskunder** får fortsatt kvitton via paketMedLangd: "Jobbcoach Premium, en vecka" och "Jobbcoach Premium, ett kvartal". Det är rätt och kräver ingen egen text.
9. **Spotify Premium och LinkedIn Premium** är förebilderna för formen varumärke plus Premium, så "ingår i Premium" är redan ett inlärt mönster hos svenska användare. Det är argumentet för att kortformen håller ensam i appen.

## 5. Provlägets låsta rad

Testansvarigs villkor: "Samma format som Matrigma. 35 uppgifter, 40 minuter". Siffrorna läses ur provets konfiguration (totalQuestions, minutes), inte som fasta tal.

Låst (gratisnivån), `ProvCard.tsx`:

- Rad 1 (font-medium): `Provläge mot klockan`
- Rad 2 (meta): `Samma format som Matrigma. 35 uppgifter, 40 minuter. Ingår i Premium.`
- aria-label: `Provläge mot klockan. Samma format som Matrigma, 35 uppgifter, 40 minuter. Låst, ingår i Premium.`

Öppet (kunden har Premium): samma rad 2 utan sista meningen, `Samma format som Matrigma. 35 uppgifter, 40 minuter.` Rad 1 får stå kvar som i dag, "Prov: mät var du står". "Ingår i Premium" står aldrig på en rad kunden redan har.

Nuvarande aria-mönster "Ingår inte. {locked}" ersätts: "Ingår inte" följt av "Ingår i Premium" låter som en motsägelse i skärmläsaren. Samma byte i TestCard.tsx rad 123, TestKategori.tsx rad 80 och 87, PersonalityTestCard.tsx rad 65: `{titel}. Låst, ingår i Premium.`

## 6. Var bytet sker, per fil

Bara användarsynliga strängar och det som styr dem. Kommentarer byts i samma svep men listas inte. Admin behåller fulla namnet med längd via paketMedLangd och behöver ingen egen text.

**Källan**
- `src/lib/plans/plans.ts`: HELA_PAKETET blir `'Jobbcoach Premium'`; ny konstant `PREMIUM_KORT = 'Premium'` med helper (förslag `paketKort()`), så brickor och låsta rader aldrig hårdkodar ordet; all_month beskrivning, body, ctaLabel (Köp, inte Välj); all_day beskrivning och body; HELA_PAKETET_RADER sista raden; GAMLA_NAMN; ctaLabel på all_week och all_quarter (Köp). Filhuvudets kommentar.
- `scripts/stripe-byt-paketnamn.ts`: körs om med `--dry-run` och sedan skarpt, läser PLANS. Produktnamnet blir Jobbcoach Premium, nicknames oförändrade. Ägaren godkänner körningen.

**Betalväggar och köp**
- `src/components/paywall/paywall-copy.ts`: alla rubriker med paketMedPris (mall, testniva, analys, linkedin, bli-upptackt), brödtexter med `${hela}` och "de andra paketen", secondary "Jämför paketen" och "Se vad paketen kostar", kvotCopy chat_message, nedgraderad (primary och body), hela PAKETRADER (ingar, bricka, lastCv, paketAktivt, analysUtanTak, aktivitetKop, uppladdning, cvFullt, cvFulltKort, cvGrans, cvFler, linkedinKvot, belonning, belonningEnDag, mallarRubrik, mallarGratisOchPaket, mallarIPaketet, exportGratis, tackTitel).
- `src/components/paywall/PaywallCard.tsx` rad 255.
- `src/components/paywall/UpgradeSheet.tsx`: längdvalet och "veckan är förvald" försvinner (design), texterna följer.
- `src/components/pricing/paket-copy.ts`: rad 203 till 233 (kortet), 240, 294 till 311 (rubrik, ingress), 371 till 426 (sub-rader), 443, 643, 644, 655 (oförändrad), 671, 724, 726, 754 till 757, 773, 896, 904, 940, 955, 960.
- `src/components/pricing/JamforelseTabell.tsx` rad 83 och 100 (två kolumner: gratis och Premium).
- `src/components/pricing/PaketKort.tsx`, `SparKort.tsx`, `LangdVal.tsx`: struktur för ett kort, design avgör.
- `src/app/dashboard/valj-spar/ValjSparClient.tsx`: köpsteget utan spårval och längdval.
- `src/app/api/stripe/create-plan-session/route.ts` rad 107.
- `src/lib/onboarding/program.ts` rad 175.

**Prissidan och publika sidor**
- `src/app/(public)/priser/layout.tsx`: title, description, openGraph, twitter.
- `src/app/(public)/priser/page.tsx`: AggregateOffer bara på säljbara planer (offerCount 1, lowPrice = highPrice = 149).
- `src/app/(public)/priser/components/priser-data.ts` rad 190 och 200 (FAQ om vecka och byte stryks eller skrivs om).
- `src/app/(public)/priser/components/PriserPaket.tsx`.
- `src/app/(public)/funktioner/FunktionerSida.tsx` rad 58, 62, 66, 155, 217, 254, 259, 293.
- `src/app/(public)/rakna-ut/page.tsx` rad 210, 216; `src/components/rakna/KalkylatorSida.tsx` rad 76, 81, 88.
- `src/app/(public)/verktyg/bli-upptackt/layout.tsx` rad 6; `page.tsx` rad 64.
- `src/app/(public)/verktyg/linkedin-optimering/layout.tsx` rad 26, 37; `page.tsx` rad 65 (fullt namn, krock 2).
- `src/app/(public)/verktyg/jobbcoachen/components/jobbcoachen-faq-data.ts` rad 35, 43 (kortform, krock 3).
- `src/app/(public)/verktyg/jobbmatchning/components/jobbmatchning-faq-data.ts` rad 34.
- `src/app/(public)/verktyg/cv-mallar/page.tsx` rad 213; `components/CVMallarLiveDemo.tsx` rad 41; `src/app/(public)/verktyg/personligt-brev/page.tsx` rad 191.
- `src/app/(public)/cv-mallar/start/StartMallval.tsx` rad 92; `components/cv-mallar-faq.ts` rad 13; `components/CvMallarPageContent.tsx` rad 128; `opengraph-image.tsx` rad 15.
- `src/components/landing/start/StartSida.tsx` rad 303, 330; `src/components/landing/LandingNavbar.tsx` rad 203; `src/components/CrossLinkCTA.tsx` rad 56.
- `src/components/artiklar/reklam/reklam-copy.ts` rad 207, 224, 250, 255.
- `src/components/registrering/registrering-copy.ts` rad 199.
- `src/app/(public)/anvandarvillkor/page.tsx` rad 111 till 131; `integritetspolicy/page.tsx` rad 47, 105.

**Inloggat**
- `src/app/dashboard/tester/TesterHubClient.tsx` rad 155; `components/ProvCard.tsx`; `TestCard.tsx` rad 123; `TestKategori.tsx` rad 80, 87; `PersonalityTestCard.tsx` rad 65; etiketten via `src/lib/onboarding/paket-rader.ts` rad 130 till 133 och 202 till 211 (graEtikettTest, ellerAlltKnapp, laggTillKnapp).
- `src/lib/onboarding/komigang.ts` rad 459 och Dagspasset-grenarna rad 132, 406, 475.
- `src/app/dashboard/introduktion/page.tsx` rad 45, 90.
- `src/app/dashboard/profil/profil-copy.ts` rad 78, 118, 119, 127.
- `src/app/dashboard/profil/prenumeration/PrenumerationClient.tsx` och `blockeringar.ts` (D28-texten).
- `src/app/dashboard/skapa-brev/components/steps/TonalityLanguageStep.tsx` rad 137; `components/FontSelector.tsx` (brickan).
- `src/app/dashboard/(oversikt)/PurchaseConfirmation.tsx` (via PAKETRADER.tackTitel och tackOkant).
- `src/components/dashboard/Sidebar.tsx` rad 118 (badgen) och underraderna; `sidebar/SidebarLink.tsx` rad 79.
- `src/components/kontakt/KontaktForm.tsx` rad 167; `KontaktInfo.tsx` rad 50, 121, 135.
- `src/components/rewards/ActivationModal.tsx` rad 176; `SavedDiscounts.tsx` rad 253, 254; `SavedDiscountsAccordion.tsx` rad 213.
- `src/components/subscription/WeeklyLimitReached.tsx` rad 283, `SubscribeButton.tsx`, `EmbeddedSubscribeButton.tsx`: inga importer hittades i src utanför mappen; verifiera och ta bort om döda.
- `src/hooks/use-profile.ts` rad 820, 897; `src/app/api/cv/upload/route.ts` rad 362; `src/app/api/cv/analyze/route.ts` rad 165; `src/app/api/jobbcoachen/chat/route.ts` rad 130.
- `src/lib/ai/analytics/recommendation-engine.ts` rad 215, 227, 228.

**Mejl**
- `src/lib/email/lifecycle/templates/vecka.ts`: kvittot (ämne, rubrik, brödtext, raden "Paket:" blir "Prenumeration:", ny ångerrättsrad) och uppsägningskvittot (ämne och rubrik utan "veckan" och "söndag").
- `src/lib/email/lifecycle/templates/komigang.ts` rad 188 och 350.

**Admin**
- `src/app/api/admin/oversikt/sedanIgar.ts` rad 171 (SPAR_NAMN allt); `src/app/admin/tratt/VeckorVy.tsx` rad 316. Övrigt följer paketMedLangd.

**Tester och QA-skript som faller eller måste vändas**
- `src/lib/plans/__tests__/paketnamn.test.ts` (vänds, krock 1), `kop.test.ts` rad 60 till 71, `harPaket.test.ts`, `regel-r1.test.ts`.
- `src/components/verktyg/__tests__/allt-texter.test.ts`, `src/lib/access/__tests__/features.test.ts`, `src/lib/email/lifecycle/__tests__/kvitto.test.ts`, `src/components/pricing/__tests__/paket-copy.test.ts`, `src/components/artiklar/reklam/__tests__/reklam-copy.test.ts`, `src/lib/onboarding/__tests__/komigang.test.ts`, `program.test.ts`, `kop-fix.test.ts`, `src/lib/stripe/__tests__/paketByte.test.ts`, `src/app/dashboard/profil/prenumeration/__tests__/blockeringar.test.ts`, `src/components/paywall/__tests__/paywall-copy.render.test.tsx`, `kopvag.test.tsx`, `FelSpar.test.tsx`, `src/app/api/admin/oversikt/__tests__/sedanIgar.test.ts`, `src/app/admin/tratt/__tests__/tratt.test.ts`, `src/app/admin/intakter/__tests__/kopFormat.test.ts`, `src/app/admin/anvandare/__tests__/filter.test.ts`.
- `scripts/qa-slutflode-sist.mjs` rad 105, 164, 165.

## 7. Kontroll efter bytet

Dessa grep ska ge noll träffar i användarsträngar i src (kommentarer, tester och yrkesmall-content undantagna):

- `Hela paketet` och `hela paketet`
- `Premium-paketet`, `Premiumpaketet`, `Premium-` följt av bokstav
- `Jobbcoachen Premium`, `Jobbcoach.ai Premium`
- `Uppgradera`, `Skaffa`, `Prova Premium`
- `paketen`, `alla tre`, `de andra paketen`, `Byt paket`, `ett paket`
- gement `premium` följt av mellanslag eller punkt

Och dessa ska finnas: `Köp Jobbcoach Premium, 149 kr i månaden` i betalväggens knapp, `Ingår i Premium` på låsta rader, `Kvitto: Jobbcoach Premium, 149 kr` i kvittots ämne.
