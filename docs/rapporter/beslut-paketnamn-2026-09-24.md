# Beslut: paketnamnen byts till innehållsnamn med perioden bredvid

Datum: 2026-09-24. Roll: saas-lead. Underlag: `src/lib/plans/plans.ts`, `src/components/artiklar/reklam/reklam-copy.ts`, `src/components/pricing/paket-copy.ts`, `src/components/paywall/paywall-copy.ts`, `src/lib/onboarding/paket-rader.ts`, `src/lib/onboarding/program.ts`, `src/app/dashboard/valj-spar/ValjSparClient.tsx`, samt de fem landningarna hämtade live från www.jobbcoach.ai den 24 september (artiklarna logiska-tester och styrkor-svagheter-intervju, /priser, /verktyg/rekryteringstester och /verktyg/rekryteringstester/prova). Priserna rörs inte. Ingen kod är ändrad.

## Beslutet

| Nyckel | Nytt namn | Perioden som alltid står bredvid | Stripe-läge |
|---|---|---|---|
| `cv_week` | CV-paketet | 79 kr i veckan | löpande |
| `test_week` | Testpaketet | 79 kr i veckan | löpande |
| `all_day` | Dagspasset | 49 kr, ett dygn, engångs | engångs |
| `all_week` | Hela paketet | 99 kr i veckan | löpande |
| `all_month` | Hela paketet | 149 kr i månaden | löpande |
| `all_quarter` | Hela paketet | 299 kr per kvartal | löpande |

Tre paket för besökaren, ett engångspass, och perioden är ett eget ord som aldrig sitter i namnet. Toppnivån har ett namn och tre längder, i stället för tre namn. Dagspasset får eget namn därför att det är den enda produkten utan förnyelse: kvittot, sidomenyn ("Du har Dagspasset, gäller till 21:40") och samtyckesraden måste kunna skilja det från prenumerationerna, och ägaren har redan valt ordet.

Motivering, i ordning:

1. Perioden i namnet var grundfelet, inte ordvalet. "Testveckan" läses som en prova-på-vecka därför att "vecka" i svensk handel betyder en period man testar. Samma ord får också "Du har Testveckan, förnyas 29 september" att motsäga sig självt: en vecka som förnyas. Byter vi till "Testpaketet, 79 kr i veckan" försvinner båda felen, och "förnyas var sjunde dag" blir en beskrivning av perioden i stället för en motsägelse av namnet.
2. "Allt" fungerar inte som namn i löptext. Det står som namn på 47 ställen i src ("Coachen utan tak ingår i Allt, 99 kr i veckan", "Finns i CV-veckan och Allt", "Byt till Allt") och läses av den som inte sett prissidan som det vanliga ordet "allt". Versalen är enda signalen, och den försvinner i tal, i mejlämnen och i skärmläsare. "Hela paketet" är idiomatisk svenska ("vill du ha hela paketet?"), läses rätt även när den läses som vanligt uttryck, och delar ordstam med de två spåren så att systemet syns: CV-paketet, Testpaketet, Hela paketet. Den som ser ett av namnen förstår att det finns fler. Det var ägarens invändning mot rena innehållsnamn ("Köp CV & brev" signalerar inget paket), och ordet paket i alla tre löser den.
3. "Komplett" (förslaget) avvisas av två skäl: det bryter ordfamiljen så att kopplingen till de två spåren måste förklaras varje gång, och det är ett adjektiv som i kvitto och sidomeny behöver ett substantiv ("Du har Komplett" fungerar, "Komplett, en månad, 149 kr" fungerar, men "Vill du ha Komplett i stället?" gör det inte utan omskrivning). "Hela paketet" bär alla sju ytorna nedan utan omskrivning.
4. Testpaketet-risken tas medvetet. "Testpaket" betyder provpaket i e-handel när det står ihop med en vara ("testpaket kaffe"). Här står det på en sajt om rekryteringstester, alltid med "79 kr i veckan" bredvid (ingen säljer ett provpaket som veckoprenumeration) och med förklaringsraden "Alla rekryteringstester, alla nivåer, provläge mot klockan" under sig första gången det syns. På den yta där risken är störst, testsidan med "Starta gratis test" bredvid, läser "Testpaketet" som paketet med testerna, vilket är exakt rätt. Rekryteringstestpaketet (23 tecken) och Testträningspaketet (19) klarar inte 24-teckenstaket i sidomenyn, mallkortens meta och mejlämnen, och löser ett problem som förklaringsraden redan löser. Träningspaketet avvisas därför att megamenyns grupp "Träna" också rymmer jobbcoachen, som ligger i Hela paketet, så namnet skulle lova mer än nyckeln ger. Skulle avläsningen efter fyra veckor visa att Testpaketet förväxlas (fråga i supporten, låg klick från testkortet jämfört med CV-kortet) byter vi det ordet ensamt, resten av systemet står.
5. Bestämd form behålls (ägarens beslut 6 i `docs/plan-paket-och-onboarding.md`). Böjs aldrig: skriv "i CV-paketet", aldrig "CV-paketets".

Ägarens tre invändningar är därmed besvarade: Allt-veckan finns inte längre, Testveckan finns inte längre, CV-veckan finns inte längre, och Dagspasset står kvar med hans ord.

## De tre viktigaste bristerna Google-besökaren möter i dag

Alla citat är ur den copy som ligger live 24 september.

1. **Namnet står utan pris och period på den yta där flest möter det första gången.** I artikeln logiska-tester lyder inline-kortets rad "Alla nivåer och provläge mot klockan ingår i Testveckan, 79 kr." (`reklam-copy.ts`, INLINE.test.paketrad). Inget "i veckan", och ovanför står "Grundnivån är gratis". Besökaren läser en gratis grundnivå och en "testvecka för 79 kr", alltså en prova-på-period som kostar. I appen är det värre: betalväggen `PaywallCard` visar inget belopp alls. En som registrerat sig från artikeln möter "Den här mallen ingår i CV-veckan" med knappen "Ta CV-veckan" (`paywall-copy.ts`, PW1) utan att någonsin ha sett ett pris; beloppet dyker upp först i `UpgradeSheet` eller på spårvalet. Sidomenyns "Från 49 kr" gäller Dagspasset, inte det paket knappen föreslår.
2. **Toppnivån definieras genom två andra okända.** Slutkortet i styrkor-svagheter-intervju lyder "Allt. Från första annonsen till löneförhandlingen." med första raden "Allt i CV-veckan och allt i Testveckan" (`reklam-copy.ts`, SLUT.allt). Den som landat på en intervjuartikel har aldrig sett de två spåren, så första punkten säger ingenting, och de tre punkter som faktiskt skiljer paketet (matchning, coach, Bli upptäckt) kommer efter. Samma mönster i prissidans Allt-kort ("Allt i CV-veckan. Allt i Testveckan. Och tre saker till som ingen av dem har.") och i program.ts ("Allt i Allt-veckan, i trettio dagar"). Toppnivån har dessutom två namn beroende på yta: "Allt" på prissida, meny och reklamkort, "Allt-veckan" i betalväggar, mejl och kontosida (`paketNamn()` i paket-rader.ts returnerar "Allt" för tre nycklar och "Allt-dagen" för den fjärde).
3. **Internt språk läcker ut och namnen är utspridda i 93 filer.** Ordet "spår" står på prissidan ("Båda spåren" som Allt-kortets etikett, FAQ "Kan jag byta spår mitt i veckan?") och i betalväggarna ("Vill du ha CV-spåret med finns Allt-veckan") utan att besökaren någonsin fått veta att paketen kallas spår. Och namnen är hårdkodade som strängar i stället för att läsas ur `PLANS.name`: 148 förekomster av CV-veckan i 56 filer, 99 av Testveckan i 46, 52 av Allt-veckan i 18, plus en andra paketlista i `src/lib/onboarding/program.ts` med egna namn, egna belopp (79 som tal) och "Alla 41 CV-mallar" som fast text. Ett namnbyte som görs med sök och ersätt lämnar garanterat kvar rester, och nästa byte blir lika dyrt.

Vad som fungerar och ska behållas: sidokortet i artiklarna ("79 kr / i veckan, ingen bindningstid / Grundnivån är gratis, en gång per dygn") är den enda ytan som redan följer regeln namn, innehåll, pris, period, gratisrad. Prissidan förklarar väl när alla tre kort står bredvid varandra, och spårvalets kort (handling som rubrik, namn i metaraden, fyra du-får-rader, pris med period) är rätt modell. Smakprovets spärr på /prova nämner inget paket, och det är rätt: spärren säljer kontot, inte paketet.

## Hur namn, innehåll och period presenteras per yta

Regel R1, kontrollerbar: **ett paketnamn står aldrig i en knapp, en säljrad eller en rubrik utan att pris eller period står i samma element eller på raden direkt under.** Tillåtna följeord: "79 kr i veckan", "99 kr i veckan", "149 kr i månaden", "299 kr per kvartal", "49 kr, ett dygn", "i veckan", "till 21:40", "förnyas 29 september, 79 kr". Undantag, där namnet får stå ensamt: sidomenyns huvudrad (perioden står på raden under), kvotrader ("Ingår i CV-paketet") och statusrader i flöden.

Regel R2: **första gången ett namn syns på en yta står förklaringsraden under det.** Arbetsutkast (copywritern slutför i bygget, högst 60 tecken):

| Paket | Förklaringsrad |
|---|---|
| CV-paketet | Alla CV-mallar, hela CV-analysen, brev som PDF |
| Testpaketet | Alla rekryteringstester, alla nivåer, provläge mot klockan |
| Hela paketet | CV-paketet och Testpaketet, plus matchning, coach, Bli upptäckt |
| Dagspasset | Hela paketet i 24 timmar, engångsköp |

Regel R3: **samma ordning överallt: CV-paketet, Testpaketet, Hela paketet.** I listor, tabeller, kassan, mejl och admin. Hela paketets innehåll skrivs alltid som de tre egna raderna först (matchning, coach, Bli upptäckt) och referensen till de två spåren sist, aldrig tvärtom.

Regel R4: **ordet "spår" används inte publikt.** Publikt heter det paket; "spår" är en intern term för `premium_scope`.

| Yta | Namnet | Vad som står bredvid |
|---|---|---|
| Reklamkort inline, raden under knappen | "ingår i Testpaketet, 79 kr i veckan." | Innehållet före namnet (som i dag), pris och period efter. Aldrig "79 kr" utan period. |
| Reklamkort sidokolumn | Etikett: Testpaketet | Rubrik som handling, förklaringsraden, "79 kr / i veckan, ingen bindningstid", gratisraden. Behålls som i dag med nya namn. |
| Reklamkort slut | Etikett: Hela paketet | Rader i R3-ordning, prisrad "99 kr i veckan eller 149 kr i månaden", knapp "Börja med Hela paketet, 99 kr i veckan". |
| Megamenyns paketpanel | "Hela paketet, 99 kr i veckan" | Ersätter "Allt i en vecka, 99 kr". Raden under: förklaringsraden. Länk "Se alla tre paketen". |
| Prissidans kort | Rubrik: CV-paketet / Testpaketet / Hela paketet | Etiketten över namnet ("CV och personliga brev", "Rekryteringstester") byts till förklaringsraden. Hela paketets kort visar längdvalet dag, vecka, månad, kvartal under ett namn; dagen visar "Dagspasset, 49 kr, ett dygn". H2 "Tre paket. Välj det som matchar var du är." står kvar. |
| Verktygssidor | "Testpaketet tar bort taket" | Raden under: "Alla nivåer, tidsatt provläge och historik, 79 kr i veckan." Personlighetsstycket "I Testveckan: 120 frågor" skrivs om till "Med Testpaketet: 120 frågor", så det inte läses som en tidsperiod. |
| Spårvalet, steg 1 | Handling som rubrik, namn i metaraden | "Fortsätt med CV-paketet, 79 kr i veckan". Hela paketets kort: "99 kr i veckan, eller Dagspasset 49 kr, månad 149, kvartal 299". |
| Köpsteget, kvittot | "CV-paketet, från i kväll" | Belopp med enhet: "79 kr i veckan", "149 kr i månaden", "49 kr engångs". Samtyckesraden oförändrad i sak. |
| Betalvägg i appen | "Den här mallen ingår i CV-paketet" | Ny fast prisrad under brödtexten: "79 kr i veckan, säg upp när du vill." Knapp "Ta CV-paketet, 79 kr". Sekundär "Jämför paketen". |
| Sidomeny, huvud | "Du har Testpaketet" | Raden under: "Förnyas 29 september, 79 kr". Dagen: "Du har Dagspasset" och "Gäller till 21:40". Gratis: "Du är på gratisnivån" och "Tre paket, från 49 kr". |
| Grå menyrad | "Ingår inte. Finns i CV-paketet och Hela paketet." | Inget pris i raden, priset kommer i betalväggen. |
| Kvotrad | "Ingår i CV-paketet" | Namnet ensamt är tillåtet. |
| Kvitto och mejlämne | "Hela paketet, en månad, 149 kr" | Namn, längd, belopp, i den ordningen, sökbart i inkorgen. "Dagspasset, 49 kr". |
| Stripe-produkter | Samma namn | Ägaren döper om de sex produkterna; price-id behålls. Rekommenderat: Hela paketet som en produkt med tre priser, men det är ägarens val och kan vänta. |

## Vad som ska byggas utöver namnbytet

Insats totalt M. Ordning:

1. **En sanning för namnen (S).** `PLANS.name` blir enda källan. Ny `paketNamn(planKey)` i `src/lib/plans/` som returnerar "Hela paketet" för all_week, all_month och all_quarter och plans-namnet för resten, ersätter `paketNamn()` i paket-rader.ts och `namnForPlan()` i paket-copy.ts. `program.ts` PAKET-listan slopar egna `namn` och `belopp` och läser ur PLANS och TEMPLATE_COUNT. Ett test som grep-ar src efter de sex gamla namnen och de nya namnen som fasta strängar utanför plans.ts och faller på träff. Utan det här steget lämnar bytet rester i 93 filer.
2. **Förklaringsraden som fält (S).** Nytt fält `beskrivning` på `Plan` (R2-raden), läst av reklamkortens etikett, prissidans kort, megamenyn, spårvalet och betalväggen. Copywritern skriver de fyra raderna slutgiltigt.
3. **Pris i betalväggen (S).** `PaywallCard` får en prisrad ur `planForPaywall` och PLANS, och primärknappen bär beloppet. Händelsen `paywall_shown` får egenskapen `price_shown: true` från deploy så vi kan skilja före och efter i avläsningen.
4. **Reklamkortens rader (S).** INLINE.*.paketrad får period ("79 kr i veckan"), SLUT.allt och PAKET_KORT.allt skriver egna rader först (R3), LISTA_SLUT och SIDO byter etiketter. Copywritern slutgranskar, som 23 september.
5. **"Spår" bort publikt (S).** Prissidans etikett "Båda spåren", FAQ-frågan om att byta spår, betalväggarnas "CV-spåret" och mallkortens meta "· CV-spåret" (T78) skrivs om till paketnamn.
6. **Mejl och admin (S).** Livscykelmallarna conversion, campaign-gratisniva, transactional, komigang och vecka läser namnet ur helpern; `planName` i metadata lagras redan, så gamla schemalagda mejl skriver nytt namn vid utskick. Adminens köpliggare och Tratt-etiketter ur samma helper. Migration behövs inte: `premium_scope` och `plan_key` är oförändrade.
7. **Publik copy (S).** `content/artiklar/vad-ar-en-jobbcoach.mdx` (åtta ställen), FAQ-data på nio verktygssidor, Funktioner-sidan. SEO-diff mot före-avtrycket som grind, som i linjen 23 september.
8. **Ägaren:** döper om de sex produkterna i Stripe (namnen syns på Stripes kvitton och i portalen), i samma ordning som R3, före deploy. Inga price-id byts.

Klicktest i riktig webbläsare som ny användare på alla sju ytorna i tabellen innan det kallas klart, Pixel 7 och desktop. Avläsning: klick på paketkort per artikelkluster och `paywall_cta_clicked` per variant, fyra veckor efter deploy, jämfört mot de fyra veckorna före (med förbehållet att paketklick före 24 september 00:30 är underrapporterade på grund av 404-felet på /registrera).

## Behöver ägarens beslut

1. Godkänna namnsystemet ovan. Ett nej på "Testpaketet" ensamt ändrar bara det ordet; alternativet i så fall är Rekryteringstestpaketet med taket på 24 tecken slopat i sidomenyn.
2. Döpa om produkterna i Stripe före deploy.
3. Om Hela paketet ska bli en Stripe-produkt med tre priser (rekommenderas, men kan vänta till en lugn vecka eftersom det rör webhook och `premium_grants.scope`).

## Ägarens beslut 2026-09-24, efter copywriterns stresstest

- Namnen: **CV-paketet, Träningspaketet, Hela paketet, Dagspasset.** Träningspaketet i stället för Testpaketet, eftersom "Testpaketet" bredvid "Starta gratis test" läses som ett betalt provpaket (copywriterns stresstest).
- Ordval i all copy: "Jobbcoachen", aldrig "coachen utan tak". "Personliga brev", aldrig bara "brev". Hela paketets rad ska säga att allt ingår, inklusive jobbmatchning, Jobbcoachen och Bli upptäckt.
- Personlighetstestet lyfts fram i paketen där det ingår (grundtestet gratis, fördjupade testet i Träningspaketet och Hela paketet).
- Betalväggens verb: "Köp", inte "Ta" (ägaren 2026-09-24 förmiddag; "Skaffa" som copywritern föreslog är utbytt).
- Opus 5.5 byter namn i kod och i Stripe (produktnamn och prisnicknames, prisid oförändrade). Ägaren godkände att agenten gör Stripe-bytet.
- Bygget av personlighetsprovet och Inför intervjun körs på Opus 5.5 direkt efter namnbytet, allt pushas till main när det är klart.
