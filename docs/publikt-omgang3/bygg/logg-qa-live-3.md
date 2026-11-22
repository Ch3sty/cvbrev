# Klicktest på live av de sju rättningarna (2026-11-22)

Kört mot https://www.jobbcoach.ai (main `6310c7a7`) cirka 13:05 till 13:35 svensk tid. Ingen kod ändrad, inget bygge, ingen push. Filen är ocommittad.

## Så gjordes det

- `arbetsyta.mjs` före start: 4,1 GB ledigt, inga servrar, en arbetskopia.
- En headless Chrome (port 9333, ny tom profil i scratchpad), en flik, ett skript i taget. Förfrågningar med `Next-Router-Prefetch` avbröts (303 stoppade), liksom PostHog och Google Analytics, och anrop till `parse-cv-for-matching` och `match-jobs` (loggen över stoppade är tom).
- `pageerror`, konsolfel, svar med status 400 eller högre från jobbcoach.ai och alla svar med status 500 eller högre loggades under hela passet.
- 49 dokumentsvar mot live (sidladdningar, omdirigeringar inräknade). Ett AI-anrop: brevutkastet.
- Skärmbilder: `C:\Users\chris\AppData\Local\Temp\claude\dceaf5763afec129\2f505274-a60e-456c-8335-21ea685ee053\scratchpad\qa-live-3\bilder\` (nedan `bilder\`).

## Utfallet i korthet

| Punkt | Utfall |
|---|---|
| 1 Profilmenyn | Godkänt. Notisklockan godkänd med en oläst notis. Meddelandeknappen och klockans tomma läge inte kontrollerade (skäl nedan) |
| 2 Brev utan annons | Godkänt, två anmärkningar om allmänna meningar |
| 3 Mallväljaren | Godkänt i 412 och 1440 |
| 4 Brödsmulan | Godkänt på två artiklar i 375 |
| 5 Cookieraden mot sidospalten | Godkänt (ingen överlappning), knappen nås först när spalten rullas |
| 6 Omdirigeringen för inloggade | Godkänt, 11 adresser i 1440, fyra i 412 |
| 7 Sidfel | Godkänt: 0 `pageerror`, 0 svar över 500, 0 konsolfel, 0 svar över 400 från jobbcoach.ai |

## 1. Profilmenyn

Konto med ett brev. Menyn öppnad med ett musklick på "QA", sedan `elementFromPoint` i mitten av varje rad och i fem punkter av rutan.

| Sida | Bredd | Menyn | Rader träffbara | "Logga ut" | Escape stänger |
|---|---|---|---|---|---|
| `/dashboard/mina-brev` (panelen finns) | 1440 | i body, `fixed`, z 40, 1067 till 1355 × 124 till 575 | 9 av 9 | y 548 | ja |
| `/dashboard/profil/cv` | 1440 | samma | 9 av 9 | y 548 | ja |
| `/dashboard/sokta-tjanster` (Jobbsöket) | 1440 | samma, x 1082 | 9 av 9 | y 548 | ja |
| `/dashboard/tester` | 1440 | samma | 9 av 9 | y 548 | ja |
| `/dashboard/mina-brev` | 412 | 108 till 396 × 116 till 567 | 9 av 9 | y 540 | ja |
| `/dashboard/profil/cv` | 412 | samma | 9 av 9 | y 540 | ja |
| `/dashboard/sokta-tjanster` | 412 | 108 till 396 × 104 till 555 | 9 av 9 | y 528 | ja |
| `/dashboard/tester` | 412 | samma som Dina brev | 9 av 9 | y 540 | ja |

- Jobbsökets hem `/dashboard` leder ett konto utan CV till `/dashboard/profil/cv` (menyn kontrollerad där också, 1440), så Sökta tjänster fick stå för Jobbsöket.
- "Logga ut" med riktigt musklick sist i passet, Dina brev 1440: träffen på raden sann (1211, 548), klicket ledde till `/`, menyn visar "Logga in" och "Skapa konto". Kvar av kakorna: `jc_recruiter`, `cvBrevCookieConsent` och PostHogs kaka. `bilder\1-logga-ut-fore-klick-1440.png`, `1-efter-logga-ut-1440.png`.
- Bilder: `bilder\1-meny-<sida>-1440.png`, `-412.png`.

**Notisklockan.** Klockan ritas bara när något är oläst, så jag lade in en egen notis för testkontot (`notifications`, id `f7a536b4-…`, ingen trigger på tabellen, raderad i städningen). På alla fyra sidor i båda bredderna: listan i body, `fixed`, z 40, rutans fem provpunkter överst, "Markera alla lästa" och notisraden träffbara, klick utanför stängde listan. 1440: 991 till 1311 × 124 till 257; 412: 32 till 352 × 116 till 249. `bilder\1-klocka-<sida>-1440.png`, `-412.png`.

**Inte kontrollerat:**
- Klockans tomma läge: klockan ritas inte alls när inget är oläst (`unread === 0 && !open`), så en tom lista går inte att öppna.
- Meddelandeknappen och dess popover: de ritas bara när kontot är synligt i Bli upptäckt. Att göra ett testkonto synligt för riktiga rekryterare på live gjorde jag inte. Knappen fanns inte på någon av sidorna.

## 2. Brev utan annons

Brevet ur startflödet (Projektledare, Nordhaga Bygg AB, Björk), ingen annons.

- Dina brev 1440: "Brevet bygger på det du fyllde i om tjänsten. Läs igenom det en gång, sedan är det klart att skicka." Vägen börjar med "tjänsten". Ingen mening "skrivet mot annonsen" någonstans. `bilder\2-dina-brev-1440.png`.
- Dina brev 412: ingressen "Läs igenom det en gång, sedan är brevet klart." nämner varken annons eller tjänst. Skärmläsarens text för vägen: "tjänsten är ifylld och brevet är skrivet". `bilder\2-dina-brev-412.png`.
- Brevets sida (flikarna Kraven, Texten, Ton och språk, Typsnitt, Titel och företag, samt Byt mall): Kraven säger "Brevet skrevs utan annons, så det finns inga krav att mäta det mot. Klistra in annonsen när du skriver nästa brev, så visar vi var brevet svarar på kraven." Raden vid Markera som sökt: "Brevet och datumet hamnar i Sökta tjänster." Samma i 412. `bilder\2-flik-kraven-1440.png`, `-412.png`, `2-brevet-1440.png`.
- Flikarna heter på live Kraven, Texten, Ton och språk, Typsnitt och Titel och företag; Mallar nås via "Byt mall". Det finns ingen flik som heter Brevet.

Varje mening om annonsen, utöver Kraven-fliken:

| Var | Mening | Bedömning |
|---|---|---|
| Dina brev, rutan Skriv nytt brev (1440 och 412) | "Klistra in annonsen, så skriver vi brevet mot ditt CV." | Om nästa brev, påstår inget om detta |
| Dina brev, raden Sökta tjänster (bara dator) | "Brevet, annonsen och datumet, och när det är dags att följa upp." | Allmän beskrivning av Sökta tjänster, men står i rummet för ett brev utan annons. Anmärkning, inte ett påstående om brevet |
| Brevet, Titel och företag | "Namn på den du skriver till, om det står i annonsen" | Fälthjälp, villkorad med "om" |

Målgången och Skriv om-felet är inte sedda: det första kräver Markera som sökt, det andra ett AI-anrop.

## 3. Mallväljaren i startflödet

`/skapa-brev/start?yrke=projektledare`, före konto.

| Bredd | Före | Väljaren öppen | Tryck på Björk | Efter |
|---|---|---|---|---|
| 412 (tryck med pekskärm) | "MALL Linne", bild `linne.webp` | 40 kort, Linne "Vald", ingen knappfot, raden "Tryck på en mall så byter brevet till den." | träffen på kortet sann | väljaren stängd, "MALLEN DU VALDE Björk" |
| 1440 (musklick) | "MALL Linne", bild `/mallar/brev/linne.webp` | samma | träffen sann | väljaren stängd, "MALLEN DU VALDE Björk", bilden bytt till `/mallar/brev/bjork.webp` |

Brevet skrevs sedan i Björk från samma sida. `bilder\3-fore-412.png`, `3-valjare-oppen-412.png`, `3-efter-tryck-412.png`, samma i 1440.

## 4. Brödsmulan i 375

| Artikel | Rad 1 (y 82) | Rad 2 (y 126) | Sidled |
|---|---|---|---|
| `/artiklar/soka-jobb-via-mail` | "Hem / Artiklar /" (snedstrecket efter Artiklar, länkarna 44 × 44) | "Söka jobb via mejl: så skriver du mejlet som öppnas, …" utan snedstreck, 343 px, kortad med tre punkter | 375/375 |
| `/artiklar/ai-jobbmatchning` | samma | "AI-jobbmatchning: så fungerar det när jobben hitta…" utan snedstreck, 343 px, kortad | 375/375 |

Ingen rad börjar med snedstreck. `bilder\4-smula-soka-jobb-via-mail-375.png`, `4-smula-ai-jobbmatchning-375.png`.

## 5. Cookieraden mot sidospalten

1440 × 900, ny profil utan samtycke, rullad till mitten.

| Artikel | Spalten | Raden | Täckt | "Skapa konto gratis" i kortet |
|---|---|---|---|---|
| `/artiklar/ai-jobbmatchning` | 84 till 828, max 744 px, innehåll 776 px | 844 till 900 | 0 px | 782 till 838, nedre delen dold, hel först när spalten rullats (750 till 806) |
| `/artiklar/soka-jobb-via-mail` | 84 till 828, innehåll 908 px | 844 till 900 | 0 px | 914 till 970, helt dold, hel först när spalten rullats |
| `/artiklar/soka-jobb-via-mail` efter Acceptera | 84 till 884, max 800 px (`data-samtycke="svarat"`) | borta | 0 px | fortfarande 914 till 970, dold tills spalten rullas |

- Spalten får full höjd efter godkännandet (744 till 800 px). På artikeln med lång innehållsförteckning ryms kortet ändå inte, så knappen nås bara genom att rulla spalten även utan cookierad. Det är inget överlapp och inget fel i rättningen, men knappen syns inte utan rullning.
- `bilder\5-ai-jobbmatchning-rad-synlig-1440.png`, `5-ai-jobbmatchning-spalt-rullad-1440.png`, `5-soka-jobb-via-mail-rad-synlig-1440.png`, `5-soka-jobb-via-mail-efter-godkant-1440.png`.

## 6. Omdirigeringen för inloggade

En sidladdning per adress, 1440:

| Adress | Landade på | h1 | Fel |
|---|---|---|---|
| `/verktyg/bli-upptackt` | `/dashboard/bli-upptackt` | Bli upptäckt | inga |
| `/verktyg/sokta-tjanster` | `/dashboard/sokta-tjanster` | Inga sökta tjänster än | inga |
| `/verktyg/jobbcoachen` | `/dashboard/jobbcoachen` | Jobbcoachen | inga |
| `/verktyg/linkedin-optimering` | `/dashboard/linkedin-optimizer` | LinkedIn-profilen | inga |
| `/verktyg/personligt-brev` | `/dashboard/profil/cv?reason=cv-required` | Två sätt att börja (kontot saknar CV) | inga |
| `/verktyg/skapa-cv` | `/dashboard/skapa-cv` | Bygg ditt CV | inga |
| `/verktyg/personlighetstest` | `/dashboard/tester/personlighet-grund` | Personlighetstest, grundnivå | inga |
| `/verktyg/cv-analys` | `/dashboard/profil/cv?reason=cv-required` | Två sätt att börja (kontot saknar CV) | inga |
| `/verktyg/jobbmatchning` | `/dashboard/jobbmatchning` | Först behöver vi ditt CV | inga |
| `/verktyg/rekryteringstester` | `/dashboard/tester` | Mät din nivå på åtta minuter | inga |
| `/cv-mallar` | `/dashboard/cv-mallar?mall=linne` | Linne | inga |
| `/priser` | stannar på `/priser` | Jobbcoach Premium, 149 kr i månaden | inga; menyn visar "Till kontot", inte "Logga in" |
| `/artiklar/soka-jobb-via-mail` | stannar | artikelns h1 | inga; "Till kontot", inte "Logga in" |

412: `/verktyg/bli-upptackt` till `/dashboard/bli-upptackt`, `/cv-mallar` till `/dashboard/cv-mallar?mall=linne`, `/priser` och artikeln stannar med "Till kontot" och utan "Logga in". Övriga åtta verktygssidor i 412 inte laddade för att hålla nere lasten (samma omdirigering, ingen breddberoende kod). `bilder\6-<adress>-1440.png`, `-412.png`.

## 7. Sidfel

Under hela passet: 0 `pageerror`, 0 svar med status 500 eller högre (alla värdar), 0 konsolfel utöver brus från analys, 0 svar 400 eller högre från jobbcoach.ai. Inget anrop till `parse-cv-for-matching` eller `match-jobs`.

## Testkontot och AI-anropet

| Konto | Id | Användes för |
|---|---|---|
| 1 | `18f67f3a-f8c0-4b8e-8944-6a7e89b2d84d` (`qa-live3-k1-…@jobbcoach-qa.test`) | Brevets startflöde med Björk, brevet utan annons, menyn och klockan, omdirigeringarna, utloggningen |

Ett AI-anrop: brevutkastet (`POST /api/public/letter-draft`, 200, token `71ceeeb9…`), som blev kontots enda brev (`7f6a3ce6-…`). Brevet markerades inte som sökt. Inga köp.

## Städningen

Räknat först (torrkörning), sedan raderat per id, adress och utkastets token (`scratchpad\qa-live-3\stada.mjs`):

| Vad | Räknat | Raderat |
|---|---|---|
| `user_activities` | 58 | 58 |
| `email_schedule` | 2 | 2 |
| `email_confirmations` | 1 | 1 |
| `letters` | 1 | 1 |
| `notifications` (notisen jag lade in) | 1 | 1 |
| `public_letter_drafts` (token `71ceeeb9…`) | 1 | 1 |
| Filer i lagringen | 0 | 0 |
| `profiles` | 1 | 1 |
| Användare i auth | 1 | 1 |

Kontrollen efteråt: 0 profiler, 0 användare, 0 filer, 0 schemalagda mejl, 0 utkast, notisen borta; en ny torrkörning gav 0 rader. IP-gränsens rader inte rörda. Ett bekräftelsemejl gick till `@jobbcoach-qa.test`, som inte finns. Testets Chrome är stängd (port 9333 stängd, 0 Chrome-processer med testprofilen kvar).
