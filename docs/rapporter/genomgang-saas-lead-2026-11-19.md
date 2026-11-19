# Genomgång efter 19 november: påståenden som inte stämmer, och vad som tjänar pengar

saas-lead, 2026-11-19. Underlag: docs/lage-2026-11-19.md, grep i src/ och content/, produktfacit (minnet project_faktagranskning_2026_11), Supabase (nya projektet i Irland) och PostHog. Inget är ändrat.

## Vad som gick live och när (avläsningen räknas härifrån)

| Live | Vad | Mätfönster öppnar |
|---|---|---|
| 19 nov 02:56 (6e6b9b1e) | Testupplevelse v4 på webben, ny gratisregel: **ett grundnivåtest om dagen, valfri testtyp** (förut ett per testtyp och dygn), Nivåkollen en gång per typ, Träna bara med Premium | 3 dec |
| 19 nov under dagen | 1 651 nya uppgifter i 18 omgångar (netto cirka 1 630 efter pensioneringar), nya uppgiftstyper | ingen konverteringsavläsning för sig |
| 19 nov kväll (d128f250) | Nya Hem: navigeringen, ingångskorten, minigrafen | 3 dec, men Black Week 23 till 30 nov stör: läs Hem-effekten på konvertering först 14 dec |
| 19 nov 16:55 | Supabase i Irland, funktioner i dub1, TTFB minus 250 ms | p75 i PostHog 3 dec |

Läget i siffror (utan admin och testkonton): 521 konton, 9 med Premium, 40 som gjort test senaste 30 dagarna, 16 senaste 7, 2 sedan v4 gick live, 40 nya konton på 7 dagar, 488 som inte avregistrerat sig från erbjudanden. PostHog sedan v4: 12 sidvisningar under /dashboard/tester, 6 hint_visad, 1 hint_klickad. Volymen räcker för att se riktning, inte för att avgöra små skillnader.

## 1. Fel och inaktuella påståenden

### A. Antalet testtyper (ägarens fynd, och fler ställen än Hem)

Beslutet (src/lib/tester/antal-testtyper.ts, docs/design/saljytor-2026-11-15/beslut.md): texten säger "åtta testtyperna och personlighetstestet", bilden (TestBredd) får visa nio glyfer, och vi räknar aldrig "tester". ANTAL_TESTTYPER är 8.

| Fil och rad | Står i dag | Problem |
|---|---|---|
| src/components/tester-v4/hem/hemData.ts:27-29 | `antalTesttyper` = synliga typer + 1 | Ger 9. Roten till Hem-felet |
| src/components/tester-v4/hem/copy.ts:61-64 | "9 testtyper, X mätta, alla öppna", "9 testtyper, ett grundnivåtest gratis i dag", "9 testtyper" | Ska vara 8 |
| src/components/tester-v4/hem/copy.ts:97-98 | "Nio tester, alla öppna", "Nio tester, grundnivån gratis" | Räknar tester, och "grundnivån gratis" utan dagsgränsen |
| src/components/tester-v4/hem/__tests__/HemVy.test.tsx:56, 91, 184-190 | Testerna låser fast "Nio" och "9" | Måste ändras samtidigt |
| src/app/(public)/priser/page.tsx:171 | Synlig text "Grundnivån i alla nio" | Säger nio på prissidan, åtta i tabellen under |
| src/components/artiklar/reklam/reklam-copy.ts:260 | `nioCaption: 'Grundnivån gratis i alla nio'` (synlig i ArtikelReklam.tsx:265) | Samma |
| src/app/register/page.tsx:44 och :47 | Rad 44 "åtta testtyperna", rad 47 aria "Nio testtyper" | Samma sida säger båda |
| ArtikelReklam.tsx:218, 265, 400; TypProvKort.tsx:170, 192; PaywallCard.tsx:350 | aria-label "Nio testtyper", "En av nio testtyper" | Skärmläsaren säger nio. Lägre allvar men samma regel |
| src/lib/onboarding/program.ts:80 | "Alla 19 tester, grundnivå till expert" | Räknar tester, och fel tal (B räknade 21). Gäller Träningspaketet, som inte säljs längre, men syns på kontosidan för de som har det |

### B. Gratisnivån för tester har ändrats, men texterna säger det gamla

Sedan 19 nov 02:56 (quotaService.ts:21 och 146, tester/v4/gratis.ts): **ett grundnivåtest om dagen över alla typer**, Nivåkollen en gång per typ, **Träna aldrig gratis på webben** (gratisniva.ts: `tranaGratis: false`, "Webben erbjuder aldrig Träna gratis").

1. **"Grundnivån i alla åtta testtyperna" utan dagsgränsen.** Den enda källan är src/lib/plans/gratis-copy.ts (GRUNDNIVAN_ALLA, GRATIS_TESTRAD, GRATIS_MENING_LANG, GRATIS_FAQ, GRATIS_TESTRAD_PROV, GRUNDNIVAN_RAD). Den läses av /priser, registreringen, startsidans FAQ (Startsidan.tsx:127, 233), /verktyg/rekryteringstester (hero rad 397, steg rad 50, "8 testtyper gratis på grundnivå med konto" rad 401, FAQ-schemat "Är testerna gratis?" i rekryteringstester-faq-data.ts:103), GratisKortet och gratisnivåmejlet. Påståendet är inte direkt osant, men den som läser "alla åtta" och sedan stoppas efter ett test känner sig lurad. En ändring i gratis-copy.ts rättar alla ytorna på en gång.
2. **"Nivåkollen och ett första träningspass (samma dag) gratis med konto"** står i 14 artiklar. Det är fel på webben sedan v4, eftersom Träna är Premium. Rätt i dag är Nivåkollen en gång per typ och ett grundnivåtest om dagen.
   - alva-labs-logiktest.mdx:21, 300
   - aon-cut-e-test.mdx:344, 382
   - arbetspsykologiska-tester.mdx:368
   - cubiks-logiks-test.mdx:20, 126, 158
   - deduktivt-induktivt-test.mdx:21, 209, 250
   - din-digitala-jobbcoach.mdx:175
   - jobbcoach-online.mdx:368
   - logiktest-exempel-med-losningar.mdx:704
   - logiska-tester.mdx:204
   - matrigma-test.mdx:19, 243, 333
   - matrislogik-test-guide.mdx:21
   - tester-hos-myndigheter.mdx:196
   - vad-ar-en-jobbcoach.mdx:23, 663, 883
   - verifierade-testresultat-vs-cv.mdx:23, 58, 101

   FAQ-svaren ligger också i FAQPage-schemat, så felet syns i Googles utdrag.
3. **Inloggat:** src/lib/onboarding/paket-rader.ts:155 säger "Nivåkollen och träning på grundnivå samma dag" för gratis (profilmenyn och kontosidan). Det motsäger Hems egen rad "Ett grundnivåtest om dagen ingår gratis" (tester/v4/copy.ts:134).
4. **Premium undersäljs:** priser-data.ts:79 "Ingår, plus ett pass om dagen på din nivå" och TypProvKort.tsx (paketrad, talserie och spatial) "ett träningspass om dagen". Träna med Premium har inget tak (tillgang.ts:10, "obegränsat"). Raderna använder också ordet "pass", som v4 tog bort ur webbens texter.
5. **Kampanjmejlen som går ut 23 och 30 nov:** src/lib/email/campaign-kampanj.ts:37 "lägger vi upp ett pass om dagen fram till ditt provdatum" och :53 "få ett pass om dagen". Med v4 föreslår planen men låser inget, dagsmålet är valfritt (1 till 3) och Premium tränar utan tak. Ingen lögn, men det beskriver den gamla produkten i ett mejl till 488 personer om fyra dagar.
6. **Butikstexten för Testklar** (mobilapp/butik/butikstexter.md:17, 22-23, 34, 71): "ett pass om dagen", "Nivåkollen och dagens grundpass är gratis". Appen är synkad med v4: dag 0-grundpasset räknas in i dagskvoten. Ägaren ändrar texten i Play Console.

### C. Beskrivningar av uppgiftstyper (inte fel, men säljer en mindre produkt än den vi har)

- **Spatial förmåga:** "vridna figurer, pappersvikning och tärningar" står på /verktyg/rekryteringstester (page.tsx:130, 233 och schemat :314), i TypProvKort.tsx:72, rotation-test-guide.mdx:6, 21, 247, 257, 285, 316 och aon-cut-e-test.mdx:380. Nytt sedan i dag: spegling i två linjer, kroppar sedda från en pil, snitt och två vikningar på expert. Familjenamnen i produkten heter nu "Vriden och speglad figur" och "Tärningar och kroppar".
- **Deduktiv slutledning:** "Villkor i text och en fråga om vad som måste gälla" (page.tsx:112). Familjen "Det som inte kan stämma" frågar tvärtom. Nytt också: om–så, alla/några/ingen, sanningssägare och lögnare samt tabellpussel. Artiklarna beskriver syllogismer och ordningsuppgifter som branschens format, vilket är rätt och kan stå kvar.
- **Figurserier:** klockan är ny (page.tsx:103 nämner den inte). **Matris:** grupper, streckfigurer och klockor (page.tsx:76 "abstrakta former" stämmer fortfarande).
- **Talserier:** "en eller två luckor" stämmer. Familjen "Gånger och delat" och tredje ordningen på expert nämns inte.

### D. Frågebankens storlek
Inga publika tal om bankens storlek finns (grep efter "hundratals", "över N uppgifter", "frågebank" träffar bara kodkommentarer och leverantörer i artiklar). Det finns alltså inget fel att rätta, men heller inget påstående som säljer.

### E. Hastighet
Inga publika påståenden om laddtid. Inget att rätta. 250 ms är ingen säljpoäng för besökare; det syns i retention via kortare väntan.

### F. Datalagring: bara rapport, inga textförslag (minnet feedback_datalagring_och_juridik)
- Integritetspolicyn (integritetspolicy/page.tsx:93, 148) säger att databas och fillagring ligger i EU. Startsidans FAQ (Startsidan.tsx:123) säger "all data lagras i EU", och om-oss/layout.tsx:7 säger "Data i EU".
- Enligt loggen angav Management API **us-east-2 (Ohio)** för det gamla projektet dbvbnbkvadvlhjhomibg. Från flytten 19 nov 16:55 ligger databasen i Irland. Före det stämde texterna alltså inte för databasen och lagringen. Ägaren behöver bedöma om det kräver något.
- **Det gamla projektet finns kvar** med en full kopia av konton, CV-filer och testresultat i Ohio (cronen är avstängd där). Så länge det finns ligger personuppgifter utanför EU. Ägarens beslut: när det ska raderas eller pausas, efter en karenstid för återgång.
- Vercels serverfunktioner gick i iad1 (USA) fram till adfab992 (19 nov 16:44) och går nu i dub1. Policyn säger inget om region för Vercel.
- Ej verifierat: vilken region Resend skickar från (e-postbytet går via Resend sedan 375b2215 och den nya adressen passerar dem), och var Gemini behandlar. Policyn påstår inget om EU för de två, så texten är inte fel, men "all data lagras i EU" på startsidan är bredare än policyn.

## 2. Bedömning ur intäktsperspektiv (konvertering, sedan användare, sedan besökare)

**Konvertering.** Gratisregeln stramades åt i dag. Det är bra för köpen, men bara om stoppet känns ärligt. Den gratisanvändare som får "alla åtta gratis" på prissidan och sedan "Dagens grundnivåtest är gjort" efter ett test ser ett brutet löfte i samma ögonblick som vi visar priset. Därför är gratis-copy.ts den viktigaste raden i hela listan: en källa, alla säljytor, och spärren blir den väntade gränsen i stället för en överraskning. Därnäst Premium-raderna som undersäljer ("ett pass om dagen" när det är obegränsat).

**Säljargument om de nya uppgifterna:**
- "1 600 nya uppgifter" säljer inte till besökare: den som aldrig varit här har inget "gammalt" att jämföra med, och talet åldras. Använd det inte publikt.
- Det som säljer till besökaren är att **bredden syns i typbeskrivningarna**, alltså det som avsnitt C listar. Den som har en kallelse till SHL eller polisens I-prov letar efter sitt format: sanningssägare, kroppar och snitt, klockor. Rätt ord i korten och i TypProvKort ger fler starter av rätt prov.
- Ett påstående om bankens storlek kan vara värt det på betalväggen ("Över N uppgifter i åtta testtyper"), men bara om N räknas ur koden med ett test som vaktar talet, som ANTAL_TESTTYPER. Det svarar på köparens tvivel: "tar uppgifterna slut efter en vecka?". Karensen (uppgifter sedda den senaste veckan väljs inte igen) är ett andra kandidatlöfte, men det måste verifieras i koden innan det skrivs.
- "Ny uppgiftstyp" som märke passar inloggat, på typkortet i Tester, inte publikt.

**Ändringslogg:** nej. Med 16 testare i veckan läser ingen en publik logg, och den skapar ännu en yta som kan ljuga. Ett märke "Nya uppgifter" på typkorten i Tester till 19 dec (samma mönster som menyns "Nyhet") räcker för de befintliga användarna.

**Mejl till befintliga användare:** inget eget nyhetsmejl. Kampanjmejlet 23 nov går redan till gratiskonton som inte avregistrerat sig. Låt copywritern skriva om stycke 2 så att det säger det nya (nya uppgiftstyper och träning utan tak med Premium) i stället för "ett pass om dagen". Ett mejl i stället för två, och det nya blir ett skäl att köpa just den veckan. Både mejltexten och utskicket är ägarens beslut. Testare med aktiv plan får veckomejlen som vanligt.

**Användare (retention):** nya Hem ska ge fler som kommer tillbaka dag 2 och längre veckor. Det kan bara bedömas om navigeringen och ingångskorten mäts, och det gör de inte i dag.

### PostHog för Hem: händelser saknas, lägg till dem nu (S)
Navigering.tsx, TesterIngang.tsx, UtvecklingIngang.tsx och MiniGraf.tsx skickar inga händelser. I hela tester-v4 finns bara hint_visad, hint_klickad, kvot_slut_visad och paywall_cta_clicked. Beslut:
- `tester_nav_klickad` med `fran`, `till` (hem, tester, utveckling), `premium`, `har_plan` och `plattform: 'webb'`.
- `hem_ingang_klickad` med `kort` (tester, utveckling), `mal` (typkort, alla, knapp, minigraf, typlank), `typ`, `las` (null, kvot, premium, nivakoll_gjord) och `premium`.
- `hem_visad` en gång per dag och session med `lage` (fritt, plan, artikel), `premium`, `grund_kvar` och `matta`. Den ger nämnaren, eftersom $pageview i SPA-navigering inte skiljer Hem från omdirigeringen.
- Händelserna skickas med `capture` utan await (reference_auth_lock_hang). Ingen PII, inga nya cookies.
- Annotering i PostHog 19 nov "Tester v4 + Hem A" och 19 nov 16:55 "Supabase Irland".
Måste vara live senast 21 nov, annars blir fönstret före Black Week för kort.

### Vad uppföljningen av nya Hem ska mäta (läses 3 dec för beteende, 14 dec för köp)
1. Andel gratiskonton med `kvot_slut_visad` som klickar `paywall_cta_clicked` (plats kvot) och går vidare till checkout_started. Det är huvudtalet för den nya gratisregeln. Black Week höjer det 23 till 30 nov, så jämför veckan 16 till 22 nov med 7 till 13 dec.
2. Återkomst dag 2 och vecka 2 bland konton som gjort ett test, mot målet 45 procent och mot kohorten 1 till 18 nov.
3. Hems klickfördelning: Nästa steg (hint_klickad/hint_visad), ingångskorten och navigeringen. Om under 10 procent av besöken på Hem leder vidare någonstans är Hem en återvändsgränd.
4. Andel planer med dagsmål (test_planer.dagsmal) och med provdatum, ur Supabase.
5. Andel nya konton som gör Nivåkollen inom ett dygn.
6. LCP p75 för /dashboard/tester efter flytten (budget 1,0 s; i labbet 944 ms median, 1 212 ms p75).

## 3. Prioritering

### Rätta nu (fel påståenden)
1. **gratis-copy.ts: dagsgränsen in i testraden** (S, copywriter tar orden, Opus bygger, gratis-copy.test.ts vaktar). En ändring rättar prissidan, registreringen, startsidans FAQ, rekryteringstester-sidan inklusive schemat, GratisKortet och gratisnivåmejlet. Effekt: spärren efter första testet blir väntad, färre besvikna gratisanvändare i betalväggens ögonblick.
2. **Antalet testtyper på Hem, prissidan, artikelreklamen och registreringen** (S): hemData `antalTesttyper` utan +1 (eller ANTAL_TESTTYPER), copy.ts rad 61-64 och 97-98 i "åtta testtyper och personlighetstestet"-form från copywritern, `nioCaption` och priser/page.tsx:171, aria-etiketterna, HemVy-testerna. Ett test till: grep-vakt mot "Nio testtyper" och "nio" i synliga strängar.
3. **"Nivåkollen och ett första träningspass" i 14 artiklar** (M, artiklarna 22 till 30 rader, ett mönster; SEO-diff som grind, ingen ändring i rubriker). Den sanna meningen tas fram en gång av copywritern och används överallt. Påverkar FAQ-schemat i sex av artiklarna.
4. **paket-rader.ts:155** gratisraden i profilmenyn och på kontosidan (S).

### Bör göras (före Black Week eller inom två veckor)
5. **PostHog-händelserna för Hem** (S, senast 21 nov), enligt avsnitt 2.
6. **Kampanjmejlets stycke 2 för båda mejlen** (S, copywriter, senast 22 nov; ägarens beslut eftersom det är ett utskick).
7. **Premium-raderna som undersäljer** (S): priser-data.ts:79, TypProvKort paketrad, PaywallCard-raderna om träning: "träning utan tak" i stället för "ett pass om dagen".
8. **Typbeskrivningarna** på /verktyg/rekryteringstester (kort och schema), TypProvKort.tsx:72 och rotation-test-guide (M, copywriter plus testansvarig som verifierar mot FORM_NAMN och familjerna). Rotation-guiden är en toppartikel: ändra bara uppräkningarna, inte strukturen.
9. **Märket "Nya uppgifter" på typkorten i Tester** till 19 dec (S, art-director bestämmer var det sitter).
10. **program.ts:80 "Alla 19 tester"** till typer (S).
11. **Tidslinjen i saas-lead-agenten** med v4, Hem A och Irland (S, mitt eget ansvar när ägaren säger ja till ändringar).

### Kan vänta
12. Bankstorlek som påstående på betalväggen, räknat ur koden med test (M). Gör det efter att punkt 1 har mätts, så att två ändringar på samma yta inte blandas ihop.
13. Butikstexten för Testklar (S, ägaren i Play Console, inför nästa AAB).
14. Spatial och deduktiv i övriga artiklar (aon-cut-e-test:380 med flera) i nästa ordinarie SEO-omgång.
15. Publik ändringslogg: nej, prövas igen när det finns över 100 testare i veckan.

## Behöver ägarens beslut
- **Datalagring** (avsnitt F): om tiden i Ohio fram till 19 nov kräver någon åtgärd, när det gamla Supabase-projektet raderas, och om startsidans "all data lagras i EU" ska stå kvar när Resend och Gemini inte är verifierade som EU. Jag föreslår ingen text.
- **Kampanjmejlets nya stycke** och att det också bär nyheten, i stället för ett separat nyhetsmejl.
- Inget i listan rör priser, Stripe eller kvotmodellen. Gratisregeln är redan ägarens beslut (omgång 7); texterna ska bara säga den.
