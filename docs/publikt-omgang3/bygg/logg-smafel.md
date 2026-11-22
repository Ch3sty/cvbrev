# De sju småfelen efter klicktestet på live (2026-11-22)

Rättat i `C:\Users\chris\cvbrev-publikt3` (gren `design/publikt-omgang3`, från main `69689cda`). Ingen push. Underlaget är `logg-qa-live-2.md` (F1 och Övrigt). Skärmbilderna ligger i `C:\Users\chris\AppData\Local\Temp\claude\dceaf5763afec129\2f505274-a60e-456c-8335-21ea685ee053\scratchpad\smafel\bilder\` (nedan `bilder\`); bilderna från live före rättningen i `scratchpad\qa-live-2\bilder\` (nedan `live\`) och de nya före-bilderna från live i `bilder\` med `fore` i namnet. Punkt 7 (Bli upptäckt för en inloggad) kom till under arbetet.

Commits, en per punkt: 1 `7a5f2a5d`, 2 `759b7e2c`, 3 `83dd4f17`, 4 `5089167c`, 5 `45f0402b` (bara test), 6 `df022d63`, 7 `00019227`. Loggarna i en egen commit.

## 1. Profilmenyn täcks på Dina brev

- **Orsak:** menyn (`ProfileMenu`) var absolut placerad inne i toppraden, och toppraden står inne i rummets vägg. Väggen `.b3-vagg` (brev3.css) är ett eget staplingssammanhang (`position: relative; z-index: 1; overflow: hidden`), och golvet under, `.b3-golv`, har `z-index: 2` och bär panelen `section.b3-panel`, som lyfts 28 px (telefon) och 60 px (dator) upp över väggens nederkant. Menyns `z-50` gällde bara inne i väggen, så golvet med panelen ritades över den, och väggens `overflow: hidden` klippte det som gick nedanför väggen. Med ett tomt Dina brev är väggen 664 px hög, därför syntes felet bara med ett brev (558 px). CV-rummet, Jobbsöket och testerna har samma byggsätt (vägg med eget lager och klippning); där låg bara inget kort så nära.
- **Rättning, i rätt ände:** menyn ritas i body (portal) med `position: fixed` under sin knapp, i navigationens lager (`z-40`, designsystemets lager), så inget rums vägg kan stänga in den. Läget räknas före första ritningen och följer knappen när sidan rullar och fönstret ändras (`src/hooks/useAnkratLage.ts`). Menyn får en högsta höjd i fönstret och rullar själv om den inte ryms. Klick utanför och Escape stänger som förut; Escape lämnar fokus på knappen. Samma rättning för toppradens två andra svävande rutor, notislistan (`NotificationBell`) och meddelandepopovern (`MessagesHeaderButton`), som satt likadant.
- **Kontroll:** konto med ett brev, lokalt bygge. På varje sida öppnades menyn, och för varje rad i menyn träffade `elementFromPoint` i radens mitt raden själv; menyn ligger direkt i body med `z-index` 40.
  - 1440: Dina brev (panelen finns), Ditt CV, CV Mallar, CV Analys (kontot saknar CV, så sidan leder till Ditt CV), Översikt (leder också till Ditt CV), Matchade jobb, Sökta tjänster, Inför intervjun, testernas hem: alla rader träffbara, "Logga ut" på y 548 (`bilder\1-meny-dina-brev-1440.png`, `1-meny-cv-mallar-1440.png`, `1-meny-jobb-matchade-1440.png` med flera, `1-meny-*-1440.png`).
  - 412: Dina brev, Ditt CV, CV Mallar, Matchade jobb, Sökta tjänster, Inför intervjun, testernas hem: alla rader träffbara (`bilder\1-meny-dina-brev-412.png`, `1-meny-*-412.png`). Före: `live\X-profilmeny-tackt-dina-brev-1424.png`, `live\4-13-profilmeny-412.png`.
  - Brevets Mallar och Brevet har ingen topprad med profilen (arbetsläget), så där finns ingen meny att täcka.
  - "Logga ut" klickades med en riktig musklickning på Dina brev i 1440 till sist i passet: menyn öppnad med ett musklick på cirkeln, `elementFromPoint` i "Logga ut" träffade raden, ett musklick på raden loggade ut och ledde till `/` (`bilder-logga-ut-fore-klick-1440.png`). Efter utloggningen stod bara `jc_recruiter` kvar av kontots kakor (se punkt 5).
- **Återstår:** notislistan och meddelandepopovern syns bara med olästa notiser eller en ny synlighet, och kontot hade inga, så de är inte sedda i webbläsaren (samma kod som menyn).

## 2. "Brevet är skrivet mot annonsen" utan annons

- **Orsak:** meningen i nästa steg (`src/lib/letters/lage.ts`) nämnde alltid annonsen. Ett brev ur startflödet utan inklistrad annons tas över av kontot med `job_description` null. Samma sak i resten av rummet: vägens första plats "annonsen" (och skärmläsarens "annonsen är inläst"), Kraven-flikens rubrik "Kraven i annonsen" och texten "Vi kunde inte läsa ut tydliga krav ur den här annonsen", raden vid Markera som sökt och Målgången ("Brevet, annonsen och datumet"), och felet vid Skriv om ("Annonsen finns inte kvar i brevet").
- **Rättning:** `skrivetMot(brev, harCv)` väljer meningen efter brevet: "Brevet är skrivet mot annonsen och ditt CV." (annons och CV), "Brevet är skrivet mot annonsen." (annons, inget CV bakom brevet eller inget CV kvar), "Brevet är skrivet utifrån ditt CV." (CV men ingen annons) och "Brevet bygger på det du fyllde i om tjänsten." (varken eller). CV:t räknas nu efter brevets `cv_id`, inte bara om kontot har ett CV, så ett brev ur startflödet nämner inte CV:t heller sedan kontot laddat upp ett. Utan annons heter vägens första plats "tjänsten" ("tjänsten är ifylld" för skärmläsaren), Kraven-fliken heter "Kraven" och säger "Brevet skrevs utan annons, så det finns inga krav att mäta det mot. Klistra in annonsen när du skriver nästa brev, så visar vi var brevet svarar på kraven.", raden vid Markera som sökt och Målgången säger "Brevet och datumet", och Skriv om säger "Brevet skrevs utan annons, och en omskrivning behöver annonsen. Skriv ett nytt brev med annonsen, eller ändra texten för hand." Brev med annons får samma texter som förut.
- **Kontroll:** test i `src/lib/letters/__tests__/brevrummet-motor.test.ts` (alla fyra meningarna, blanksteg räknas som ingen annons, brevet ur startflödet med och utan CV på kontot) och `src/components/brev3/kit/__tests__/bana-utan-annons.test.ts` (skärmläsarens mening). I webbläsaren, brevet ur startflödet: Dina brev i 1440 säger "Brevet bygger på det du fyllde i om tjänsten. Läs igenom det en gång, sedan är det klart att skicka." och vägen börjar med "tjänsten" (`bilder\2-dina-brev-1440.png`); telefonens kortare ingress nämnde aldrig annonsen (`bilder\2-dina-brev-412.png`); Brevet med Kraven-fliken: rubriken "Kraven" och texten "Brevet skrevs utan annons, så det finns inga krav att mäta det mot. Klistra in annonsen när du skriver nästa brev, så visar vi var brevet svarar på kraven."; raden vid Markera som sökt: "Brevet och datumet hamnar i Sökta tjänster." (`bilder\2-brevet-kraven-1440.png`, `-412.png`). Före: `live\4-10-kom-igang-1440.png`.
- **Återstår:** Målgången och Skriv om-felet är inte sedda i webbläsaren (det första kräver att brevet markeras som sökt, det andra ett anrop som räknas mot brevkvoten); de bär samma villkor som raden vid Markera som sökt.

## 3. Mallväljaren i brevets startflöde

- **Orsak:** ett tryck på ett mallkort satte bara en markering i väljaren; valet gällde först på knappen "Använd Björk" längst ned. Kortet som trycktes var orange medan "Vald" stod kvar på Linne.
- **Rättning:** som brevrummets väljare inloggat (`brev3/mallar/MallValjare`, där ett tryck anropar `onValj`): ett tryck väljer mallen och stänger väljaren, och den valda mallen står på sidan under "Mallen du valde". Det markerade kortet är alltid den valda mallen (`aria-pressed` och "Vald"), knappraden med "Använd …" är borta, raden under filtren säger "Tryck på en mall så byter brevet till den.", och kortens etikett för skärmläsaren är "Använd mallen Björk, gratis".
- **Kontroll:** före på live i 412: Björk markerad, "Vald" på Linne och "Använd Björk" i foten (`bilder\3-fore-tryck-bjork-412.png`, `3-fore-valjare-oppen-412.png`). Efter, lokalt i 412: väljaren stängd efter trycket, "MALLEN DU VALDE Björk." på sidan (`bilder\3-efter-valjare-oppen-412.png`, `3-efter-tryck-bjork-412.png`). I 1440 valdes Björk på samma sätt innan utkastet skrevs, och brevet blev Björk (`bilder\2-01-startflode-ifyllt-1440.png`, Dina brev visar Mallen Björk).
- **Återstår:** inget.

## 4. Brödsmulorna i artiklarna på 375 px

- **Orsak:** smulan (`ib-smula`) är en flexrad som får bryta; snedstrecket sitter före varje steg (`li + li::before`), så när artikelns namn bröt till nästa rad började raden med "/". Namnet kortades också vid 38 tecken, inte vid radens bredd.
- **Rättning:** under 640 px, och bara när smulan har tre steg eller fler, står sidans namn på en egen hel rad utan snedstreck först, snedstrecket står efter steget före ("Hem / Artiklar /"), och namnet kortas med tre punkter i radens bredd. Länkarna behåller 44 × 44 px. Text, länkar och schema är orörda; två steg (arkivet) och dator är oförändrade.
- **Kontroll:** `/artiklar/ai-jobbmatchning` i 375, utloggad. Före (live): "Hem" och "/ Artiklar" på första raden (y 82), "/ AI-jobbmatchning: så fungerar det när jobben hit…" på andra raden (y 130), kortat vid 38 tecken (`bilder\4-fore-smula-375.png`). Efter: "Hem / Artiklar /" på första raden (y 82, länkarna 44 × 44), "AI-jobbmatchning: så fungerar det när jobben hittar di…" på andra raden utan snedstreck (y 126, 343 px, radens bredd), ingen sidledsrullning (375/375) (`bilder\4-efter-smula-375.png`).
- **Återstår:** luften efter "Hem" kommer av att länken har 44 px tryckbredd; den är kvar.

## 5. Kakan `jc_recruiter`

- **Vad den är:** proxyns cache för rollseparationen (`src/lib/supabase/middleware.ts`, `isApprovedRecruiter`). En godkänd rekryterare ska aldrig se kandidatytorna och skickas till `/rekryterare`; för att slippa slå upp `recruiter_profiles` på varje sidladdning sparas svaret i kakan `jc_recruiter` med värdet `<användar-id>:1` (rekryterare) eller `<användar-id>:0` (alla andra), `httpOnly`, `SameSite=Lax`, sökväg `/`, tio minuter. Värdet är bundet till id:t, så en annan användare i samma webbläsare ärver det aldrig.
- **När den sätts:** bara när en inloggad användare öppnar en kandidatyta (`/dashboard`, `/cv-generator`, `/personligt-brev`, `/min-profil`, `/installningar`, `/anvandare`). En besökare utan konto får den aldrig, inte heller en inloggad på en publik sida. I klicktestet på live sattes den för att testkontona var inloggade på `/dashboard`; den stod kvar efter utloggningen eftersom den inte rensas vid utloggning, men den löper ut efter tio minuter och gäller bara det id den sattes för.
- **Avsedd som den är:** ja, inget fel; ingen kodändring. Den är en nödvändig kaka knuten till inloggningen (rollkontroll i sessionen), inte mätning, och omfattas inte av cookiesamtycket; samtycket styr bara analysen. Inga texter om kakor eller samtycke är ändrade.
- **Kontroll:** test `src/lib/supabase/__tests__/rekryterarkakan.test.ts`: ingen kaka utan konto (`/`, en artikel, startflödet, `/dashboard/mina-brev`), ingen för en inloggad på en publik sida, `<id>:0` med `httpOnly` och 600 s för en kandidat, `<id>:1` och omdirigering till `/rekryterare` för en rekryterare.
- **Återstår (förslag, inte gjort):** kakan kan rensas vid utloggning, så att den inte står kvar i upp till tio minuter. Det rör inte samtycket, men det är en ändring i inloggningsflödet och inget fel.

## 6. Cookieraden över sidokortet i artiklar

- **Orsak:** artikelns sidospalt (`.ib-sido`) är sticky från 1024 px, 84 px från toppen, och på `/artiklar/ai-jobbmatchning` 777 px hög (84 till 861). Cookieraden är 56 px i botten (844 till 900 i ett 900 px högt fönster) och täckte spaltens nedersta 17 px.
- **Rättning:** spalten får en högsta höjd i fönstret under toppen med 16 px luft (`calc(100vh - 100px)`), och medan raden visas också radens 56 px. Raden visas så länge `<html>` saknar `data-samtycke="svarat"`, samtyckets egen markering, som läses men inte ändras. Ryms spalten inte rullar den själv (tunn rullist). Raden, texten och samtyckets logik är orörda.
- **Kontroll:** 1440 × 900, rullad till mitten, utan samtyckessvar. Före (live): spalten 84 till 861, raden 844 till 900, 17 px täckt (`bilder\6-fore-sidospalt-rullad-1440.png`, `live\6-banner-artikel-rullad-1440.png`). Efter: spalten 84 till 828, raden 844 till 900, 0 px täckt; spalten rullar själv medan raden visas, och "Skapa konto gratis" nås genom att rulla spalten (`bilder\6-efter-sidospalt-rullad-1440.png`).
- **Återstår:** medan raden visas och fönstret är 900 px högt ryms inte hela spalten på den här artikeln (777 px mot 744), så kortets nederkant och knappen nås genom att rulla spalten, med en tunn rullist. När besökaren svarat har spalten hela höjden igen och rullar inte. Vill vi att hela kortet alltid syns utan rullning behöver spalten bli lägre (till exempel innehållsförteckningen kortare medan raden visas); det är ett designval och inte gjort.

## 7. Bli upptäckt för en inloggad

- **Orsak:** `/verktyg/bli-upptackt` saknade `RedirectLoggedIn`, som alla andra verktygssidor har, så en inloggad såg säljsidan med "Skapa min profil" till `/register`.
- **Rättning:** `<RedirectLoggedIn to="/dashboard/bli-upptackt" />` överst i sidans utdata, som i de andra verktygssidorna. Komponenten ritar ingenting; h1, rubriker, löptext och schema är oförändrade.
- **Kontroll:** inloggad i samma pass, bara sidladdningar:

| Sida | Landade på | Utfall |
|---|---|---|
| `/verktyg/bli-upptackt` | `/dashboard/bli-upptackt` | h1 "Bli upptäckt", ritas utan fel (`bilder-bli-upptackt-inloggad-1440.png`); före rättningen säljsidan |
| `/verktyg/sokta-tjanster` | `/dashboard/sokta-tjanster` | h1 "Inga sökta tjänster än", utan fel |
| `/verktyg/jobbcoachen` | `/dashboard/jobbcoachen` | h1 "Jobbcoachen", utan fel, inget samtal startat |
| `/verktyg/linkedin-optimering` | `/dashboard/linkedin-optimizer` | h1 "LinkedIn-profilen", utan fel |
| `/verktyg/personligt-brev` | `/dashboard/profil/cv?reason=cv-required` | kontot saknar CV, så brevverktyget leder vidare till Ditt CV (h1 "Två sätt att börja"), utan fel |
| `/verktyg/skapa-cv` | `/dashboard/skapa-cv` | h1 "Bygg ditt CV", utan fel |
| `/verktyg/personlighetstest` | `/dashboard/tester/personlighet-grund` | h1 "Personlighetstest, grundnivå", utan fel |

Inga fel i konsolen och inga svar över 400 under de sju laddningarna. Inga AI-anrop.

## Testkontot och AI-anropet

| Konto | Id | Användes för |
|---|---|---|
| 1 | `4f27ce62-7e98-4399-be58-4a75eed75f05` (`qa-smafel-k1-…@jobbcoach-qa.test`) | Brevets startflöde med Björk, brevet utan annons, menyn i rummen, texterna om annonsen, verktygssidorna inloggad, utloggningen |

Ett AI-anrop: brevutkastet (`POST /api/public/letter-draft`, 200, token `64881972…`), som blev kontots enda brev (`e79ed0ad-…`). Anropen till `parse-cv-for-matching` och `match-jobs` stoppades i testwebbläsaren; loggen över stoppade är tom (inget sådant anrop gjordes). 46 sidladdningar mot den lokala servern, ett flöde i taget, och tre mot live för före-bilderna (mallväljaren, smulan och sidospalten).

## Städningen

Räknat först (torrkörning), sedan raderat per id, adress och utkastets token (`scratchpadsmafelstada.mjs`, samma skript som klicktestet på live):

| Vad | Räknat | Raderat |
|---|---|---|
| `user_activities` | 51 | 51 |
| `email_schedule` | 2 | 2 |
| `email_confirmations` | 1 | 1 |
| `letters` | 1 | 1 |
| `public_letter_drafts` (token `64881972…`) | 1 | 1 |
| Filer i lagringen | 0 | 0 |
| `profiles` | 1 | 1 |
| Användare i auth | 1 | 1 |

Kontrollen efteråt: 0 profiler, 0 användare, 0 filer, 0 schemalagda mejl, 0 utkast; en ny torrkörning gav 0 rader. IP-gränsens rad (`::1`) är inte rörd. Ett bekräftelsemejl gick till `@jobbcoach-qa.test`, som inte finns. Servern och testets Chrome är stängda (portarna 3417 och 9333 stängda), `.next` är borttagen, och arbetsyta-skriptet visar inga servrar eller testprocesser kvar.

## Grindarna

Grindarna kördes två gånger: först på punkt 1 till 6, sedan igen på allt när punkt 7 och Kraven-rubriken tillkom. Siffrorna är den andra omgången.

| Grind | Minne ledigt före | Resultat |
|---|---|---|
| `npx tsc --noEmit` | 4,5 GB (första omgången 2,7 GB, under 3 vid två försök, körd ändå) | 0 fel |
| `npx vitest run` | 4,8 GB | 396 filer gröna, 3 överhoppade; 4 878 test gröna, 13 överhoppade, 0 röda |
| `next build --webpack` (6 GB heap) | 4,6 GB | klart, slutkod 0, 240 s, 804 sidor |
| `next start` på 3417, puppeteer-core med Chrome | 6,7 GB | allt ovan i 1440 och 412 (smulan i 375) |
