# Beslut om säljytorna, saas-lead, 2026-11-15

Underlag: granskning-testansvarig.md, granskning-copy.md, granskning-art-director.md och granskning-saas-lead.md i samma mapp. Det här är avgörandet enligt ägarregeln: agenterna löser oenigheter, saas-lead avgör, ägaren får ett före/efter att godkänna. Ingen kod är ändrad. Priser och kampanjdatum är ägarens och rörs inte.

Det som ska in i ägarens artefakt är markerat **Artefakt: ja**. Art-director bygger artefakten ur det här dokumentet. Allt annat byggs utan skiss: rena felrättningar och Black Week-luckan behöver inget godkännande, bara QA.

## 0. Avgöranden där granskningarna skiljer sig

| Fråga | Avgörande | Skäl |
|---|---|---|
| GratisKortets testrad: "Grundnivån i åtta rekryteringstester, med facit och förklaring" (testansvarig) eller "Grundnivån i alla åtta testtyperna och personlighetstestet, med förklaring efter varje fråga" (copy) | **Copywriterns rad.** Den flyttas först, som båda vill. | Testansvarigs egen regel är att räkna typer, inte tester; "åtta rekryteringstester" kan läsas som åtta tester när vi har 29. Personlighetstestet ska med där raden får plats, också enligt testansvarig. "Förklaring efter varje fråga" är begripligare än "facit och förklaring". |
| "Nivåtest" eller "grundnivån" publikt | **"Grundnivån" är substantivet för det som är gratis. "Nivåtestet" bara som handling på TypProvKort ("Gör nivåtestet i deduktivt") och i startsidans mening "Ett nivåtest visar var du står".** Nivåkollen försvinner ur all publik reklam utom tre ställen där namnet introduceras med förklaring i samma mening: STEG3_TESTER.under, KONTO_PANEL rad 3 och ingressen på /verktyg/rekryteringstester. Inloggat behåller namnet. | Testansvarig och copywriter är i sak eniga; det här är bara den gemensamma regeln utskriven. Grundnivån täcker alla åtta typer, Nivåkollen finns bara för fem. |
| Åtta eller nio i text och bild | **Texten säger "åtta testtyperna och personlighetstestet", bilden visar nio glyfer.** | Så lyder både testansvarig och copywriter, och art-directors rutnät är 3×3 med personligheten i hörnet. Orden och bilden stämmer med varandra. |
| Art-directors testelement "Nio": var det används | **Ja på ytorna som bär trafiken eller köpen: ProvKort (rad, matris markerad), KONTO_PANEL på /prova (rad, saas-leads tillägg), KONTO_GRATIS på /register (rad på vägg), PaywallCard testniva och test-tak (rad, låst typ markerad), GratisKort (rutnät), /priser gratiskortet (rutnät i plattan), TypProvKort (rad, typen markerad; iprov rutnät med tre markerade).** Ja med låg prioritet på SidoPaketKort gratis (rad). Nej på SlutKort (telefonerna är bilden) och på /verktyg/rekryteringstester (sidan är bilden), som art-director själv säger. | Ägarens fynd är att bredden inte syns. Art-director har rätt i att det är ett bildproblem lika mycket som ett copyproblem: testerna är den enda delen av erbjudandet som aldrig fått bild. Raden kostar 3 kB per instans, ingen JS, CLS noll. |
| Captionen under rutnätet i GratisKortet | **Ingen caption i GratisKortet.** Listans första rad står intill rutnätet på dator och direkt under på mobil, och den säger redan bredden. Caption bara på SidoPaketKort gratis och /priser-plattan, där ingen listrad finns intill. | Två rader med samma innehåll bredvid varandra är klotter. |
| Premium-raden på testytor: "Alla nivåer" (testansvarig) eller "Avancerad och expertnivå" (copy) | **Intill en gratisrad som nämner grundnivån: "avancerad och expertnivå". Fristående Premium-rader (SlutKort, HELA_PAKETET_RADER): "alla åtta testtyperna i grund, avancerad och expert".** | Copywriterns poäng om dubblering gäller bara när grundnivån står strax ovanför. |
| Leverantörsnamn i paketraderna | **Ja på testytorna (ProvKort, SlutKort test, /priser, /verktyg/rekryteringstester), som testansvarig vill. Nej på generiska ytor.** | Sju av nio köp landade på artiklar om Alva, Matrigma eller verbalt test. Namnen är det läsaren sökte på. Alltid "i samma format som", aldrig "samma test", inga logotyper. |
| "25 till 40 minuter" i Premium-rader | **Bort överallt**, enligt testansvarig. Ersätts med "i samma format som ditt test" eller "med automatisk inlämning när tiden är ute". | Täcker bara tre av provformaten. |
| "Förklaring till varje fråga" som Premium-argument (testniva-väggen) | **Bort**, enligt testansvarig. | Genomgången är gratis. Vi säljer inte det som ingår. |
| ExempelCTABand: skriva om (testansvarig, copy) eller bygga om som PremiumBlock (copy, designfråga) | **Bara felrättning av texten nu. Ombyggnad skjuts.** | /exempel hade 2 sidvisningar på 28 dagar. |
| Kampanjkortet (kortText renderas aldrig) | **Inget nytt kort. kortText raderas i städsteget.** Betalväggarna får kampanjpriset i prisrad och knapp, inte en tredje mening. | Ett kort till på de publika sidorna konkurrerar med ProvKort som fungerar. Betalväggen har redan brödtext; en tredje mening blir klotter. |
| Intervjuklustret (35 procent av trafiken, 1 konto, 0 köp) | **Inline-kortet i intervjuartiklar byter från coach-kortet till ProvKort med TESTKORT_INTERVJU-texten (variant testkort). Sticky på mobil byter till "Prova fem frågor gratis" mot /prova. Hjälteknappen och sidokortet lämnas.** Mäts fyra veckor mot coach-kortets 4 procent klick. | Copy och testansvarig har redan godkänt TESTKORT_INTERVJU ordagrant. Ingen ny copy behövs. En ändring i taget så att mätningen går att läsa. |
| Omfattning | **Fjorton ytor ändras (S1 till S14), varav tolv i artefakten. Felrättningar enligt F-listan. Black Week-luckan K1 till K6 först, med deadline. D3 separat.** Copywriterns förslag om en kanonisk modul `gratis-copy.ts` och konstanten `ANTAL_TESTTYPER` antas och byggs först av allt i copyomgången, så att gratisnivån aldrig mer beskrivs på sex sätt. | |

## 1. Ytor som ändras

Ordningen är prioritet efter trafik gånger avstånd till köpet. FÖRE är ordagrant ur koden på main be2c78a1. EFTER är slutcopy, hämtad från copywriterns granskning om inget annat anges; "saas-lead-justering" betyder att jag ändrat copywriterns rad och copywritern godkänner ordvalet i bygget. Luckorna som stod som "copywritern fyller i" är ifyllda 2026-11-15 och markerade (copy).

### S1. Kontopanelen efter provet på /verktyg/rekryteringstester/prova (och ArtikelProv i 16 artiklar)

Fil: `src/components/registrering/registrering-copy.ts` (`KONTO_PANEL`, rad 313 till 344). Samma källa läses av ArtikelProv. Trafik: 321 spärrar och 189 vidareklick på 28 dagar, största konverteringsytan på sajten.

| | FÖRE | EFTER |
|---|---|---|
| Rad 3 | Nivåkollen, {n} minuter, räknar in de här svaren | Nivåkollen, {n} minuter: visar var du står och räknar in de här svaren |
| Premiumrad | , 149 kr i månaden, när du sedan vill träna på din nivå varje dag. Först Nivåkollen, gratis. | , 149 kr i månaden, när du sedan vill träna på din nivå varje dag. Först grundnivån i alla åtta testtyperna, gratis. (saas-lead-justering av copywriterns "Först grundnivån, gratis.": bredden måste stå på den här ytan, det är hela ägarens poäng) |
| Rad 1 och 2, kick, rubriker | behålls | behålls |

Form: TestBredd `form="rad" markerad="matris"` under de tre raderna, ovanför premiumraden (saas-leads tillägg, art-director placerar och får flytta den om panelen blir för hög på 375 px). Kampanj: priset i premiumraden ska följa kampanjen, se K2.
Artefakt: **ja**.

### S2. ProvKort i testartiklarna

Fil: `src/components/artiklar/reklam/reklam-copy.ts` (`INLINE_PROVA` rad 108 till 120, `INLINE.test.paketrad` rad 72). Trafik: 327 visningar, 25 procent klick, matar S1.

| | FÖRE | EFTER |
|---|---|---|
| Text | Det här är en av våra expertfrågor: tre regler samtidigt, form, tecken och fyllning. Fem frågor gratis här, rätt och fel direkt. Nivåkollen och första passet gratis med konto. | Det här är en av våra expertfrågor: tre regler samtidigt, form, tecken och fyllning. Fem frågor gratis här, rätt och fel direkt. Facit och grundnivån i alla åtta testtyperna gratis med konto. |
| Paketrad | Alla nivåer, övningsprov mot klockan och fördjupade personlighetstestet ingår i Premium, 149 kr i månaden. | Avancerad och expertnivå, övningsprov mot klockan i samma format som Matrigma, Alva, SHL och Aon, och det fördjupade personlighetstestet ingår i Premium, 149 kr i månaden. (copy: kortad från saas-leads rad; I-provet struket här eftersom ProvKort är matriskortet och I-provet har eget TypProvKort. 158 tecken, fyra rader i 46ch även med kampanjpriset "99 kr första månaden, sedan 149 kr i månaden" blir det fem, vilket vi accepterar under kampanjveckan) |
| Eyebrow, rubrik, knapp "Prova fem frågor", länk "Se alla tester och nivåer" | behålls | behålls |

Paketraden flyttas från `INLINE.test` till `INLINE_PROVA` och `INLINE.test` raderas (den syns aldrig och räknar tre typer). Form: TestBredd `form="rad" markerad="matris"` direkt under texten, 14 px marginal, utan caption. Priset följer redan kampanjen via MedKampanjPris.
Artefakt: **ja**.

### S3. KONTO_GRATIS på bar /register

Fil: `registrering-copy.ts` rad 347 till 356. Trafik: 309 sidvisningar, 263 personer.

| | FÖRE | EFTER |
|---|---|---|
| Rad 1 namn | Nivåkollen | Rekryteringstesterna |
| Rad 1 text | Var du står i rekryteringstesterna, med genomgång av varje fråga. | Grundnivån i alla åtta typerna, med genomgång av varje fråga. |
| Rad 2, 3 | behålls | behålls |
| Premiumrad | , 149 kr i månaden, när du vill ha allt utan tak. Säg upp när du vill. | behålls i ord; priset följer kampanjen, se K3 |

Form (art-director): första radens 64-pixelsikon byts mot TestBredd `form="rad" yta="vagg"`, så raden blir glyfrad, namn, text. Övriga rader orörda.
Artefakt: **ja**.

### S4. PaywallCard testniva

Fil: `src/components/paywall/paywall-copy.ts` rad 269 (body), rubriker rad 185 till 195. Trafik: 27 visningar, 33 procent klick, 1 köp. Den betalvägg som konverterar.

| | FÖRE | EFTER |
|---|---|---|
| Body | Premium ger alla 19 tester, alla nivåer, övningsprov mot klockan, det fördjupade personlighetstestet och förklaring till varje fråga. | Premium ger alla åtta testtyperna på alla nivåer, pass varje dag, övningsprov mot klockan och det fördjupade personlighetstestet. (testansvarigs rad: 19 är fel, förklaringen är gratis och ska inte säljas) |
| Rubrik "Hela kurvan ingår i Premium" | Hela kurvan ingår i Premium | Hela din utveckling ingår i Premium |
| Övriga rubriker, sekundär "Kör grundnivån igen" | behålls | behålls |

Form: TestBredd `form="rad" markerad={låst typ}` mellan brödtext och prisrad. Kampanj: prisrad och knapp enligt K1.
Artefakt: **ja**, med Black Week-varianten bredvid ordinarie.

### S5. PaywallCard test-tak

Fil: `paywall-copy.ts` rad 361. Trafik: 43 visningar, 0 klick, den vägg flest gratisanvändare möter.

| | FÖRE | EFTER |
|---|---|---|
| Body | Premium ger alla nivåer, övningsprov och obegränsat antal försök. | Premium ger alla nivåer, övningsprov mot klockan och pass utan tak, varje dag. (testansvarigs rad, sann mot checkDailyTestQuota; "obegränsat" är förbjudet. Copy: "utan dagstak" bytt till husets "utan tak", samma innebörd) |
| Rubrik "Dagens omgång är gjord", "Kom tillbaka i morgon" | behålls | behålls |

Form och kampanj som S4.
Artefakt: **ja**.

### S6. Intervjuklustrets inline-kort och sticky

Filer: `src/components/artiklar/reklam/ArtikelReklam.tsx` (InlineKort), `src/lib/cta/clusters.ts` (`inlineVerktygForKluster`, interview), `src/components/shared/StickyMobileCTA.tsx`. Trafik: 694 artikelvisningar, inline coach 323 visningar och 4 procent klick, sticky 215 visningar och 0 klick, 1 konto, 0 köp.

| | FÖRE | EFTER |
|---|---|---|
| Inline-kort | Eyebrow "Verktyget". "Träna svaret innan du sitter i rummet" / "Bolla dina svar med Jobbcoachen och få följdfrågorna en rekryterare hade ställt. Tio frågor utan att betala." / knapp "Träna intervjufrågor" / "Jobbcoachen, så mycket du vill, ingår i Premium, 149 kr i månaden." | ProvKort med TESTKORT_INTERVJU: eyebrow "Inför intervjun" / "Intervjun kommer sällan ensam" / "Logiktest och personlighetstest ingår ofta i samma process, före eller efter intervjun. Prova fem matrisfrågor gratis, rätt och fel direkt, eller se alla tester och nivåer." / knapp "Prova fem frågor" / länk "Se alla tester och nivåer" / paketrad som S2. Variant `testkort`. |
| Sticky mobil | Träna intervjufrågor (/verktyg/jobbcoachen) | Prova fem frågor gratis (/verktyg/rekryteringstester/prova) |
| Hjälteknapp, sidokort allt | behålls | behålls |

Copyn är redan godkänd av testansvarig och copywriter. `INLINE.coach` behålls i koden för räknarartiklarna. Mätning: article_cta_clicked variant testkort i cluster interview mot coach-baslinjen, avläsning fyra veckor efter deploy.
Artefakt: **ja**.

### S7. GratisKort (ägarens kort)

Fil: `reklam-copy.ts` rad 253 till 266, `ArtikelReklam.tsx` rad 356 till 403. Trafik: 23 visningar, 0 klick. Ändras för principens skull och för att det är kortet ägaren pekade på; effekten kommer från S1 till S6.

| | FÖRE | EFTER |
|---|---|---|
| Eyebrow | Utan att betala | behålls |
| Rubrik | Vill du prova innan du läser vidare? | behålls |
| Rad 1 | Tre CV-mallar och en nedladdning | Grundnivån i alla åtta testtyperna och personlighetstestet, med förklaring efter varje fråga |
| Rad 2 | En CV-analys med poäng och tyngsta fyndet | Tre CV-mallar och en nedladdning (länken till /verktyg/cv-mallar följer med raden; koden länkar i dag rad med index 0, ska länka mallraden oavsett plats, SEO-spärrlistan punkt 4) |
| Rad 3 | Ett personligt brev var sjunde dag, att läsa på skärmen | En CV-analys med poängen och det tyngsta fyndet |
| Rad 4 | Tre matchade jobb och tio frågor till Jobbcoachen | Ett personligt brev var sjunde dag, att läsa på skärmen |
| Rad 5 | Nivåkollen i testerna med genomgång, och ett första träningspass | Tre matchade jobb och tio frågor till Jobbcoachen |
| Knapp, länk | Skapa konto gratis / Se vad som ingår i Premium | behålls |

Form (art-director): TestBredd `form="rutnat" yta="ljus"` i vänsterspalten under rubriken, före knappen, utan caption. Mobilordningen rättas: eyebrow, rubrik, rutnät, bocklista, knapp, länk. Sidokolumnvarianten (tre första raderna) får testraden först och TestBredd `form="rad"` med caption under raderna. Caption (copy): **"Grundnivån gratis i alla nio"** (28 tecken). "Nio" utan substantiv, så att captionen räknar det bilden visar utan att krocka med textregeln "åtta testtyperna och personlighetstestet".
Artefakt: **ja**, det är kortet ägaren frågade om.

### S8. /verktyg/rekryteringstester

Fil: `src/app/(public)/verktyg/rekryteringstester/page.tsx`. Trafik: 71 sidvisningar nu, 41 konton i P1; sekundärlänken i S2 och S6 pekar hit.

| | FÖRE | EFTER |
|---|---|---|
| Hjälte fet (rad 393) | Fem frågor gratis här och Nivåkollen gratis med konto. Ingen kortuppgift, och du ser rätt och fel direkt efter varje pass. | Fem frågor gratis här, grundnivån i alla åtta testtyperna gratis med konto. Ingen kortuppgift, och du ser rätt och fel direkt efter varje test. |
| Hjälte ingress (rad 392) | Matrislogik, verbalt och numeriskt resonemang i samma format som SHL, Cut-e och Assessio använder, och talserier, spatial förmåga och ordförråd inför I-provet. | Matrislogik, figurserier, deduktiv slutledning, verbalt och numeriskt resonemang i samma format som SHL, Aon och Assessio använder, och talserier, spatial förmåga och ordförråd inför I-provet. |
| Talrad 1 (rad 397) | { tal: 'Nivåkollen', text: 'och första passet gratis med konto' } | { tal: '8 testtyper', text: 'gratis på grundnivå med konto' } |
| ProvaKort punkt 2 (rad 419) | Samma frågebank som i det skarpa testet | Samma typ av frågor som i de skarpa testen |
| Steg 1 "Välj test" (rad 49, även HowTo-schemat) | Plocka matrislogik, verbalt eller numeriskt. Med ett gratiskonto gör du Nivåkollen med genomgång och ett första träningspass. | Välj bland åtta testtyper, från matrislogik till talserier. Grundnivån i varje typ är gratis med konto, med genomgång efteråt. |
| Ingress testtyper (rad 486) | Med ett gratiskonto gör du grundnivån i varje testtyp, Nivåkollen med full genomgång och ett första träningspass samma dag, och resultatet är ditt. | Med ett gratiskonto gör du grundnivån i varje testtyp, med full genomgång efteråt, och resultatet är ditt. Börja gärna med Nivåkollen: tolv uppgifter som anpassar sig efter dina svar och på cirka åtta minuter visar var du står. Att träna vidare, med avancerad nivå, expertnivå och övningsprov mot klockan, ingår i Premium, 149 kr i månaden. Säg upp när du vill. (copy: andra meningen är den enda publika introduktionen av namnet på sidan; tal ur hem-copy.ts:70 och :68) |
| PremiumBlock (rad 730) | Fem frågor gratis här. Nivåkollen och första passet gratis med konto. Alla nivåer, övningsprov och din historik ingår i Premium. | Fem frågor gratis här. Grundnivån i alla åtta testtyperna gratis med konto. Avancerad och expertnivå, övningsprov mot klockan och din utveckling över tid ingår i Premium. |
| Schema offers (rad 310) | Fem frågor utan konto, Nivåkollen och ett första träningspass med gratiskonto, utan kortuppgift | Fem frågor utan konto, grundnivån i alla testtyper med gratiskonto, utan kortuppgift |
| Schema featureList (rad 313) | ... obegränsat antal försök med Jobbcoach Premium | ... träning utan tak med Jobbcoach Premium |
| FAQ (faq-data rad 102) | Med ett gratiskonto gör du Nivåkollen med full genomgång och ett första träningspass | Med ett gratiskonto gör du grundnivån i alla åtta testtyperna med full genomgång |
| H2 "Åtta testtyper, alla gratis att börja", typkorten | behålls | behålls |

Form: ingen (art-director: sidan är redan bilden). SEO: H1, H2 och ordmängd oförändrade; seo-diff mot före-avtryck.
Artefakt: **ja** (hjälten och ProvaKortet).

### S9. Registreringens val och förslag (STEG1, STEG3, STEG3_TESTER)

Fil: `registrering-copy.ts`.

| | FÖRE | EFTER |
|---|---|---|
| STEG1 tester (rad 47) | Matrislogik, verbalt, numeriskt och personlighet, med förklaring efter varje fråga. | Åtta testtyper och personlighetstestet, med förklaring efter varje fråga. |
| STEG3 tester under (rad 232) | Nivåkollen och ett grundpass samma dag är gratis med kontot. Passen på din nivå varje dag ingår i Premium. | Grundnivån i alla testtyper är gratis med kontot. Träningspass på din nivå varje dag ingår i Premium. |
| STEG3 tester rad 1 (rad 235) | Alla nivåer i matrislogik, verbalt och numeriskt. | Alla nivåer i alla åtta testtyperna. |
| STEG3 tester rad 2 (rad 236) | Övningsprov mot klockan, 25 till 40 minuter. | Övningsprov mot klockan i samma format som ditt test. |
| STEG3 tester gratis (rad 240) | Nivåkollen med genomgång av varje fråga / Ett grundpass samma dag som Nivåkollen / Personlighetstestet med 50 påståenden | Grundnivån i alla åtta testtyperna / Genomgång av varje fråga / Personlighetstestet med 50 påståenden |
| STEG3 intervju kortRubrik (rad 245) | Var förberedd på testdagen | Var förberedd på intervjun |
| STEG3_TESTER under (rad 283) | Du väljer test och provdatum, sedan gör du Nivåkollen. Den tar cirka 8 minuter och visar din nivå, med genomgång av varje fråga. | Du väljer test och provdatum, sedan gör du Nivåkollen: ett kort test på cirka 8 minuter som visar din nivå, med genomgång av varje fråga. |

Form: ingen.
Artefakt: **ja** (STEG1-kortet tester och STEG3-kortet tester).

### S10. /priser

Filer: `src/components/pricing/paket-copy.ts`, `src/app/(public)/priser/page.tsx`, `src/app/(public)/priser/components/priser-data.ts`. Trafik: 23 sidvisningar men 2 av 7 köp med känd plats.

| | FÖRE | EFTER |
|---|---|---|
| Gratiskortets text (paket-copy GRATIS.delar och page.tsx 156 till 160, två kopior) | Utan att betala får du **Nivåkollen i testerna** med full genomgång och ett första träningspass samma dag, **personlighetstestet** med 50 påståenden, **3 CV-mallar** ... | Kanoniska meningen, lång form, ur gratis-copy.ts: "Utan att betala gör du grundnivån i alla åtta testtyperna och personlighetstestet med 50 påståenden, får tre CV-mallar och en nedladdning, en CV-analys med poängen och det tyngsta fyndet, ett personligt brev var sjunde dag att läsa på skärmen, tre matchade jobb och tio frågor till Jobbcoachen. Inget kort behövs." Fetningar enligt copywriterns A5. En källa. |
| Talrad platta 1 (page.tsx 68) | { tal: 1, text: 'Nivåkollen' } | Plattan får TestBredd `form="rutnat"` i stället för tal, spänner två kolumner på dator, etiketten under i 12 px. Etikett (copy): **"Grundnivån i alla nio"** (21 tecken; plattan sitter i gratiskortet, så "gratis" står redan i rubriken ovanför). |
| Tester gratisRad (page.tsx 200) | Ingår i Premium. Gratis: Nivåkollen med genomgång, ett första träningspass och personlighetstestet med 50 påståenden. | Ingår i Premium. Gratis: grundnivån i alla åtta testtyperna med genomgång, och personlighetstestet med 50 påståenden. |
| Tester sub (paket-copy 256) | Ingår i Premium. Gratis: Nivåkollen med genomgång och ett första träningspass. | Ingår i Premium. Gratis: grundnivån i alla åtta testtyperna, med genomgång. |
| Tester text (paket-copy 257, utdrag) | ... samma fyra typer som de stora urvalstesten använder: matrislogik, verbalt resonemang, numeriskt och personlighet, i tre nivåer från grund till expert. I övningsprovet går klockan på riktigt, 25 till 40 minuter ... och kurvan visar när du är redo. | ... de typer de stora urvalstesten använder: matrislogik, figurserier, deduktiv slutledning, verbalt och numeriskt resonemang, talserier, spatial förmåga och ordförråd, i tre nivåer från grund till expert, plus personlighetstestet. I övningsprovet går klockan på riktigt i samma format som Matrigma, Alva, SHL, Aon och I-provet, och provet lämnas in automatiskt när tiden är ute ... och din utveckling dag för dag visar när du är redo. (sammanfogning av copywriterns och testansvarigs rader) |
| Tester steg 1 (paket-copy 259, page.tsx 209) | Nivåkollen på grundnivå visar var du står per typ. | Grundnivån visar var du står i varje typ. |
| Tester steg 4 (paket-copy 262) | Följ kurvan, session för session. | Följ din utveckling, pass för pass. |
| Tabell rad 1 (priser-data 82 till 85) | label "Nivåkollen och första passet", sub "matrislogik, verbalt, numeriskt", free "En gång, med genomgång", premium "Pass varje dag, utan tak" | label "Grundnivån", sub "alla åtta testtyperna och personlighetstestet", free "Ingår, med genomgång", premium "Ingår, plus ett pass om dagen på din nivå" |
| Tabell "Din utveckling" sub (110 till 113) | alla sessioner i en kurva | alla pass i en kurva |
| FAQ borja-gratis (priser-data 210) | ... de personliga breven och Nivåkollen i testerna fungerar, ... | ... de personliga breven och grundnivån i testerna fungerar, ... |
| GRATIS_RAD (priser-data 41) | 3 mallar, en CV-analys, ett personligt brev och Nivåkollen i testerna ingår utan att betala. | Kanoniska meningen, kort form: "Grundnivån i alla tester, tre CV-mallar, en CV-analys, ett personligt brev var sjunde dag, tre matchade jobb och tio frågor till Jobbcoachen ingår utan att betala." |
| FREE_HIGHLIGHTS (priser-data 31 till 38) | sex rader, sista "Nivåkollen i testerna med genomgång, och ett första träningspass" | Kanoniska listan, fem rader, samma ordning som S7 |
| SPARVAL fotnot (paket-copy 350) | Gratis: 3 mallar, en analys, ett personligt brev, Nivåkollen i testerna | Gratis: 3 mallar, en analys, ett personligt brev, grundnivån i testerna |

Artefakt: **ja** (gratiskortet med rutnätsplattan).

### S11. Startsidan

Fil: `src/components/publikt/Startsidan.tsx`. Trafik: 108 sidvisningar, 3 konton, 1 köp.

| | FÖRE | EFTER |
|---|---|---|
| Station Tester knappNot (rad 232) | Nivåkollen, första passet och personlighetstestet gratis | Grundnivån i alla åtta testtyperna och personlighetstestet gratis |
| Station Tester text (rad 230, hela) | Samma format som de stora testleverantörerna använder. Nivåkollen visar var du står, dagens pass tränar det du tappar, och övningsprovet går mot klockan som det skarpa testet. Personlighetstestet ger din profil, hur den läses mot vanliga kravprofiler och frågorna du lär få på intervjun, med förslag på svar. Fem frågor provar du utan konto. | Åtta testtyper i tre nivåer, från matrislogik till talserier, i samma format som de stora testleverantörerna använder. Ett nivåtest visar var du står, ett kort pass om dagen tränar det du tappar, och övningsprovet går mot klockan som det skarpa testet. Personlighetstestet ger din profil, hur den läses mot vanliga kravprofiler och frågorna du lär få på intervjun, med förslag på svar. Fem frågor provar du utan konto. (copy: första meningen ny och ersätter "Samma format som de stora testleverantörerna använder.", resten enligt granskningen) |
| Station Brev (rad 43) | Första brevet gratis, sedan ett i veckan | Första personliga brevet gratis, sedan ett var sjunde dag |
| FAQ (rad 126) | Gratisnivån kräver inget kort: grundnivån i varje testtyp och personlighetstestet, 3 CV-mallar och en nedladdning, en CV-analys med poäng och tyngsta fyndet, första personliga brevet och sedan ett i veckan, 3 matchade jobb och 10 frågor till Jobbcoachen. | Gratisnivån kräver inget kort: grundnivån i alla åtta testtyperna och personlighetstestet, 3 CV-mallar och en nedladdning, en CV-analys med poängen och det tyngsta fyndet, ett personligt brev var sjunde dag, 3 matchade jobb och 10 frågor till Jobbcoachen. (läses ur gratis-copy.ts) |
| PremiumBlock, övriga stationer | behålls | behålls |

Form: ingen.
Artefakt: **ja** (stationen Tester).

### S12. TypProvKort i fem testartiklar

Fil: `src/components/artiklar/reklam/TypProvKort.tsx` rad 41 till 87. Trafik: 69 visningar, 5 klick till /register.

| | FÖRE | EFTER |
|---|---|---|
| deduktiv text (rad 45) | Börja med Nivåkollen i deduktivt. Den är gratis med konto, visar var du ligger och går igenom varje uppgift efteråt. | Börja med nivåtestet i deduktivt. Det är gratis med konto, visar var du ligger och går igenom varje uppgift efteråt. |
| deduktiv knapp (rad 46) | Gör Nivåkollen i deduktivt | Gör nivåtestet i deduktivt |
| deduktiv paketrad (rad 49) | Pass varje dag, avancerad och expert och övningsprovet mot klockan ingår i Premium, 149 kr i månaden. | Avancerad och expertnivå, ett träningspass om dagen och övningsprovet mot klockan ingår i Premium, 149 kr i månaden. |
| talserie, spatial, ordforrad paketrad (rad 58, 67, 76) | Avancerad och expert, pass varje dag och I-provets övningsprov ingår i Premium, 149 kr i månaden. | Avancerad och expertnivå, ett träningspass om dagen och I-provets övningsprov ingår i Premium, 149 kr i månaden. |
| iprov paketrad (rad 85) | Halva och hela I-provets övningsprov, alla nivåer och pass varje dag ingår i Premium, 149 kr i månaden. | Halva och hela I-provets övningsprov, avancerad och expertnivå och ett träningspass om dagen ingår i Premium, 149 kr i månaden. |
| Texterna talserie, spatial, ordforrad, iprov | behålls | behålls |

Form (art-director): TestBredd `form="rad" markerad={typ}` under texten på alla fem (det är testansvarigs "ett av åtta"). iprov: bilden (numrerad lista) byts mot TestBredd `form="rutnat" markerade={['ordforrad','spatial','talserier']}` med caption. Caption (copy): **"Sex deltester, tre testtyper"** (28 tecken). Sant mot provet: ordförråd täcker synonymer och motsatsord, spatial förmåga täcker pappersvikning, tärningar och vikning med klipp, talserier det sjätte. deduktiv: bilden görs om till det deduktiva motivet (två villkorsrader som streck, remsa med fyra platser, svaret i koppar), enda textrad "Vad måste gälla?".
Artefakt: **ja** (iprov och deduktiv som exempel, de andra tre följer samma mönster).

### S13. SidoPaketKort test och gratis (desktop-sidokolumn)

Fil: `reklam-copy.ts` rad 170 (SIDO.test.gratisrad), `ArtikelReklam.tsx` rad 228 till 253. Trafik: 474 visningar, 1 klick. Låg prioritet, byggs sist i copyomgången.

| | FÖRE | EFTER |
|---|---|---|
| SIDO.test gratisrad | Fem frågor gratis här. Nivåkollen och första passet gratis med konto. Resten ingår i Premium. | Fem frågor gratis här. Grundnivån i alla åtta testtyperna gratis med konto. Resten ingår i Premium. |
| Gratisvarianten | tre första raderna ur GRATIS_KORT | tre första raderna ur den nya listan (tester, mallar, analys) plus TestBredd rad med caption, se S7 |

Artefakt: nej.

### S14. TesterHubClient, gratisraden inloggat

Fil: `src/app/dashboard/tester/TesterHubClient.tsx` rad 105.

| | FÖRE | EFTER |
|---|---|---|
| GRATIS_RAD | Gratis att prova: nivåkollen en gång med genomgång och ett första träningspass samma dag. Resten ingår i Jobbcoach Premium, 149 kr i månaden. | Gratis: grundnivån i alla testtyper med genomgång, och Nivåkollen som visar var du står. Resten ingår i Jobbcoach Premium, 149 kr i månaden. (copywriterns rad; priset följer kampanjen, K4) |

Artefakt: nej.

## 2. Rena felrättningar (listas kort i artefakten, skissas inte)

Sanningskravet går före stil. Byggs i ett svep efter Black Week-luckan.

| Id | Fil | FÖRE | EFTER |
|---|---|---|---|
| F1 | reklam-copy.ts:271 och ArtikelReklam.tsx:413 | "Läs klart, gör sedan." som `.replace(', ', '. ')` gör till "Läs klart. gör sedan." | Rubriken "Läs klart. Gör sedan." i copyn, replace-anropet bort |
| F2 | reklam-copy.ts:210 (SLUT.test rad 1) | Logik, verbalt och numeriskt i grund, avancerad och expert, med förklaring till varje svar | Alla åtta testtyperna i grund, avancerad och expert, med förklaring till varje svar |
| F3 | reklam-copy.ts:211 (SLUT.test rad 2) | Övningsprov på 25 till 40 minuter och automatisk inlämning, samma tidspress som hos rekryteraren | Övningsprov mot klockan i samma format som Matrigma, Alva, SHL, Aon och I-provet, med automatisk inlämning när tiden är ute |
| F4 | reklam-copy.ts:212 | Fördjupade personlighetstestet, 120 påståenden | Det fördjupade personlighetstestet, 120 påståenden |
| F5 | plans.ts:93 (HELA_PAKETET_RADER rad 1, läses av startsidan, ListaSlutKort, SlutKort allt, köpsteget) | Alla rekryteringstester, övningsprov och det fördjupade personlighetstestet | Åtta testtyper i tre nivåer, övningsprov mot klockan och det fördjupade personlighetstestet (saas-lead-justering av testansvarigs rad: typer, inte tester) |
| F6 | plans.ts beskrivning (SIDO-text) | CV, personliga brev, tester, jobbmatchning och Jobbcoachen | Tester, CV, personliga brev, jobbmatchning och Jobbcoachen |
| F7 | ExempelCTABand.tsx:40-42 | Ett brev om dagen och en CV-analys var tredje dag, helt gratis. | Tre CV-mallar, en CV-analys och ett personligt brev var sjunde dag, utan att betala. |
| F8 | ExempelCTABand.tsx:66, 70-76 | Skapa brev gratis / Ingen kortuppgift · Ingen bindningstid · GDPR, data i EU | Skapa personligt brev gratis / Ingen kortuppgift. Ingen bindningstid. Data i EU. |
| F9 | Tio API-rutter session/route.ts (deduktiv, logicTestV4, verbalTestV2, figurserier, numericalTestV2, verbalTestV1, logicTestV6, numericalTestExpert, numericalTest, verbalTestExpert, steg2/[kind]) | ... eller köp Premium för obegränsat. | ... eller köp Premium och träna utan tak. Flyttas till en konstant. |
| F10 | plans.ts:116, 135; dashboard/introduktion/page.tsx:47; verktyg/opengraph-image.tsx:19 | obegränsat antal omkörningar / obegränsat antal försök / obegränsat antal CV / Träna obegränsat | omkörningar utan tak / försök utan tak / CV utan tak / Träna utan tak |
| F11 | intervjuprov-copy.ts:82, personlighetsprov-copy.ts:45, StartMallval.tsx:116, StartFlow.tsx:317 | Inget kreditkort · Avsluta när du vill | Inget kreditkort. Avsluta när du vill. |
| F12 | KalkylatorSida.tsx:102, rakna-ut/page.tsx:272, useUnusedFeatures.ts:65, komigang.ts:303, email komigang.ts:210 | Fråga jobbcoachen | Fråga Jobbcoachen |
| F13 | KalkylatorSida.tsx:96-98 | ... Jobbcoachen, så mycket du vill, ingår i Premium, 149 kr i månaden. | ... Jobbcoachen, så mycket du vill, ingår i Premium. (priset står redan i eyebrow) |
| F14 | StickyMobileCTA letter; exempelsidornas sticky | Skapa mitt brev / Skapa mitt brev som {yrke} | Skriv mitt personliga brev / Skriv personligt brev som {yrke} |
| F15 | personligt-brev/page.tsx:107, 221 | Första brevet gratis, sedan ett nytt i veckan (och schemat) | Första personliga brevet gratis, sedan ett var sjunde dag |
| F16 | personligt-brev/layout.tsx:7, 14, 24 | Första brevet gratis | Första personliga brevet gratis, bara om description håller 110 till 158 tecken efteråt |
| F17 | paket-copy.ts:564 (test_week, osålt) | Fyra testtyper, grundnivå till expert | Alla testtyper, grundnivå till expert |
| F18 | hem-copy.ts:52 | Börja med Nivåkollen. Vet du när provet är, så lägger vi upp planen fram till dagen. | Börja med Nivåkollen, åtta minuter som visar var du står. Vet du när provet är, så lägger vi upp planen fram till dagen. |
| F19 | pass-copy.ts:338, 421, 423 | Månaden täcker hela vägen / Månaden täcker ... | Premium täcker hela vägen / Premium täcker ... |
| F20 | email/lifecycle/templates/campaign-gratisniva.ts:49 | Rekryteringstester: en nivåkoll med genomgång och ett första träningspass | Kanoniska testraden ur gratis-copy.ts |
| F21 | reklam-copy.ts:258 (GratisKort rad) | En CV-analys med poäng och tyngsta fyndet | En CV-analys med poängen och det tyngsta fyndet (ingår i S7) |
| F22 | reklam-copy.test.ts | fångar "obegränsat" i reklamkorten | utökas med "Nivåkollen" i publika copykällor (reklam-copy, paket-copy, priser-data, Startsidan, KONTO_GRATIS), "·" och "19 tester", så att regeln håller |

Formhygien från art-director, utan skiss, byggs i steg 6: StickyMobileCTA (IkonX i stället för lucide X, klassen pub-knapp i stället för inline-toning, --lyft i stället för inline boxShadow), `.pub-solfjader` 650 till 540 px under 900 px, ImorgonKort rubrik till klassen `text-kort-t`.

## 3. Black Week och Cyber Monday: kampanjpriset där köpen sker

Kampanjen är live i kod sedan 2026-11-13 på banner, PremiumBlock, SidoPaketKort, ProvKort, /priser, köpsteget och ForslagSteg. Den saknas på ytorna som fyra av sju mätta köp kom från. Deadline: live och klicktestat senast fredag 20 november, kampanjen börjar måndag 23 november 00.00.

| Id | Yta | FÖRE under kampanj | EFTER under kampanj |
|---|---|---|---|
| K1 | PaywallCard, alla varianter (paywall-copy.ts, PaywallCard.tsx) | Prisrad "Jobbcoach Premium, 149 kr i månaden. Säg upp när du vill." Knapp "Köp Premium, 149 kr i månaden". Ett klick senare säger köpsteget 99 kr. | Prisrad "Jobbcoach Premium, 99 kr första månaden, sedan 149 kr i månaden. Säg upp när du vill." (`kampanjPrisPeriod`). Knapp "Köp Premium, 99 kr första månaden" (`copy.prisKnapp`). Cyber Monday samma mönster med 49. Dashboard-layouten läser redan aktiv kampanj på servern och känner till `harBetalat`; den skickas ner till PaywallCard, som aldrig visar kampanjpris till ett konto som haft Premium. Ingen tredje mening. |
| K2 | KONTO_PANEL premiumrad på /prova och i ArtikelProv (registrering-copy.ts:342) | , 149 kr i månaden, när du sedan vill ... | , 99 kr första månaden, sedan 149 kr i månaden, när du sedan vill ... Publika sidor CDN-cachas ett dygn, så båda varianterna renderas och `KampanjVarianter` väljer, samma mönster som ProvKort. |
| K3 | KONTO_GRATIS premiumrad på /register (registrering-copy.ts:355) | , 149 kr i månaden, när du vill ha allt utan tak. | , 99 kr första månaden, sedan 149 kr i månaden, när du vill ha allt utan tak. Samma mekanik som K2. |
| K4 | Testrummet: ImorgonKort betalvägg, planens betalvägg (pass-copy.ts), TesterHubClient GRATIS_RAD | 149 kr i månaden | kampanjPrisPeriod via serverläst kampanj som K1 |
| K5 | kampanj.ts copy.kortText | Renderas aldrig | Raderas i D3-steget. Inget kampanjkort byggs. |
| K6 | Mätning | paywall_shown och paywall_cta_clicked utan kampanjinformation | Egenskapen `kampanj: nyckel eller null` på båda händelserna, så att Black Week-veckan kan läsas för sig. Avläsning 1 december: köp per betalvägg under kampanjen mot de fyra veckorna före. |

Mejlen `campaign-kampanj.ts` och `campaign-gratisniva.ts` (D5) läses av copywritern senast 19 november med samma krav som ytorna: bredd, inte Nivåkollen, inga talstreck, "utan tak". Skickas av morgonkörningen 23 respektive 30 november; ändringar efter det går inte att ta tillbaka.

## 4. Städsteget D3 (separat commit, efter omgången)

Radera, verifierat oimporterade: CrossLinkCTA, exempel-shared/FinalCTA, NumericalStartCTA, VerbalStartCTA, rewards/ActivationModal, pricing/JamforelseTabell, PremiumNavbar och dess backup, FeatureMorphingCard, LiveAIDemo, PersonalizedUserJourney, StaticFeatureCard, InteractiveFunctionExplorer, CVGenerationModal. **CompleteApplicationPackage stryks ur listan**: den importeras av AnsokanPar.tsx som används av ExempelMall.tsx.

Oanvända copynycklar som går samma väg: paywall-copy GRATISRADER, kampanj.ts kortText, INLINE.test (ersatt i S2), oanvända nycklar i paket-copy och priser-data enligt inventeringens D4.

Grind: tsc, hela vitest-sviten, seo-diff noll fel på de publika sidorna, grep efter varje borttaget namn i src och tests. Egen commit med listan i meddelandet så att den går att backa. Skälet: komponenterna bär gammal copy (trial, "7 dagar gratis", gamla kvoter) som dyker upp i varje framtida grep och sanningskontroll.

## 5. Byggordning

Allt mekaniskt på Opus enligt ägarens modellregel. Varje steg: tsc och berörda vitest per fix; full build, perf och klickmatris en gång på allt ändrat före push. Riktig webbläsare (Pixel 7 och desktop, skärmdump per steg) innan något kallas klart.

1. **Black Week-luckan K1 till K4 och K6.** Deadline live 20 november. Behöver inget godkännande i artefakt. Klicktest i Stripes testläge med `KAMPANJ_NU` satt till 23 november, mot en betalvägg, kontopanelen på /prova och /register. Verifiera att ett konto med `harBetalat` aldrig ser 99 kr på någon av ytorna.
2. **Kanonisk källa.** `src/lib/plans/gratis-copy.ts` med listan och tre meningar enligt copywriterns avsnitt 2, läst av GRATIS_KORT, FREE_HIGHLIGHTS, GRATIS.delar, STEG3-gratislistorna, KONTO_GRATIS och startsidans FAQ. Konstanten `ANTAL_TESTTYPER` ur testkonfigurationen (antal kognitiva typer), skriven med `Ord()` som mallarna. Testutökningen F22.
3. **Felrättningarna F1 till F21.** Sanningskravet före stil. Kan pushas tillsammans med steg 1 om tiden räcker.
4. **Ägarens godkännande av artefakten** (före/efter för S1 till S12, felrättningarna som kort lista, Black Week-raderna som en rad). Art-director bygger artefakten ur det här dokumentet; captionerna och de två "fyller i"-meningarna (S8 ingress, S11 inledning) är ifyllda av copywritern 2026-11-15, markerade (copy) i S2, S5, S7, S8, S10, S11 och S12.
5. **Copyytorna S1 till S14 i text**, i nummerordning, efter godkännandet. Alla publika ändringar med seo-diff mot före-avtryck; H1, H2 och ordmängd i artiklarna orörda (korten är p, aldrig rubriker).
6. **Testelementet Nio.** `TestGlyfer.tsx` (nio glyfer, tre nya: SymTalserie, SymSpatial, SymVerbal enligt art-directors koordinater), `primitives-bas.tsx` utan hooks, `TestBredd.tsx` och CSS i publikt.css. Sedan placering på S1, S2, S3, S4, S5, S7, S10, S12, S13 och formhygienen i avsnitt 2. Perf publikt en gång efter: inget kort får lägga JS på sidan.
7. **QA i riktig webbläsare**: /prova med spärr, /register, en testartikel, en intervjuartikel, GratisKort i en generic-artikel, /priser, startsidan, testrummet med testniva- och test-tak-väggen. CLS 0 på alla. Skärmdumpar i docs/qa, aldrig i git.
8. **D3-städningen** som egen commit efter att allt ovan är mergat.
9. **Avläsning.** Black Week 1 december (K6). Intervjuklustret och korten fyra veckor efter deploy, tidigast 20 december, i samma rapport som kampanjen, med kampanjveckan som egen period. Mätpunkter: article_cta_clicked per variant och kluster, signup_started från /prova, signup_completed, paywall_cta_clicked per variant, köp per plats.

## 6. Sammanfattning

Testvägen är hela försäljningen och Nivåkollen är dess sämsta säljord. Grundnivån i alla åtta testtyperna, med bilden av nio, tar över på de fjorton ytor som bär trafiken och köpen, med kontopanelen på /prova först. Intervjuklustret får testvinkeln. Betalväggarna lär sig Black Week före den 20:e. Allt osant eller regelvidrigt rättas utan skiss, de tretton döda komponenterna raderas separat. Ägaren godkänner före och efter på tolv ytor, inget annat.


## Tillägg efter ägarens granskning 2026-11-15

- PaywallCard: prisraden bryts i två rader, "Jobbcoach Premium, 149 kr i månaden." och "Säg upp när du vill." på egen rad (gäller alla varianter, även kampanjpriset).
- Nio-raden skalar till spaltens bredd (högst 280 px, nio lika kolumner, glyf högst 24 px) så att ingen symbol klipps i smala textspalter.
- Gratispanelen på /register: radstilen gäller bara panelens egna rader (direkta barn), aldrig glyferna i Nio-raden.
