# Faktagranskning: content/artiklar/matrislogik-test-guide.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, men flera: Matrigmas tidsformat framställs fel (40-minutersversionen är den ovanliga), en källa är felaktigt tillskriven Arbetsförmedlingen, och artikeln lovar gratis avancerad nivå som är Premium.

## Fynd att åtgärda

| Rad | Citat ur texten | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 20, 47, 178, 237 | "träna på matrislogik gratis, både på grundnivå och avancerad nivå" | fel (produkt) | Avancerad och expertnivå är Premium (feature tests_above_base). Gratis: Nivåkollen med genomgång och ett första träningspass, plus fem matrisfrågor utan konto. Ersätt med "träna gratis med Nivåkollen och ett första pass; avancerad och expertnivå ingår i Premium". | src/lib/access/features.ts; src/app/(public)/priser/page.tsx |
| 25, 154 | "det vanligaste testet, Matrigma, ger dig runt 40 minuter på 35 uppgifter" | fel | Assessio: standardversionen är adaptiv, "Matrigma is 12 minutes long", 1 minut per fråga; 40-minutersversionen "is not used as often". 35 uppgifter / 40 min stämmer bara för den klassiska versionen (Technical Manual 2017). Skriv "den adaptiva Matrigma som används mest tar 12 minuter med högst en minut per fråga; den äldre versionen har 35 uppgifter på 40 minuter". | https://assessio.com/candidates-students/ ; https://helpcenter2.assessio.com/matrigma ; https://helpcenter2.assessio.com/hubfs/Matrigma_TechManual-2017-1.pdf |
| 43 | "12 minuter där du svarar på så många du hinner, vanligen runt 20 till 25 stycken" | obelagt | Assessio anger "1 minute time limit for each question, and a 12 minute time limit total", inget antal. Stryk "vanligen runt 20 till 25". | https://helpcenter2.assessio.com/matrigma |
| 16, 160, 229 | "Arbetsförmedlingen påminner om att resultatet ofta vägs samman av ... antal rätta svar, antal genomförda uppgifter, prioriteringar och effektivitet" | fel (tillskrivning) | Länken (arbetsformedlingen.se/play/webbinarium/...) leder i dag till en allmän sida om CV och intervju och säger inget om detta. Uppgiften finns hos Akavia: färdighetstester bedömer bland annat rätta svar, genomförda uppgifter, prioritering och effektivitet under tidspress. Byt till Akavia som källa. | https://www.akavia.se/rad-och-stod/soka-jobb/anstallningsintervju/jobbtest/ |
| 59 | "Matrigma talar till exempel om progression, rotation, frekvens, rörelse och konstruktion" | obelagt | Varken Assessios sidor eller tekniska manual nämner de regeltyperna; de finns bara hos övningssajter. Stryk tillskrivningen till Matrigma. | https://helpcenter2.assessio.com/hubfs/Matrigma_TechManual-2017-1.pdf |
| 12, 27, 41, 221 | "det vanligaste logiska testet vid svensk rekrytering" / "Det vanligaste matristestet på den svenska arbetsmarknaden heter Matrigma" | obelagt | Ingen förstahandskälla. Assessio skriver bara "popular and well-known aptitude test not only in the Nordic countries but also globally". Skriv "ett av de vanligaste" eller "ett av de mest kända". | https://assessio.com/aptitude/ |
| 18, 233 | "Akavia beskriver att logiska tester påminner om IQ-tester eftersom båda mäter abstrakt problemlösning oberoende av språk och förkunskaper" | obelagt (utvidgat citat) | Akavia skriver bara: "Logiska tester påminner om IQ-tester och bedömer kandidatens förmåga att se mönster och dra slutsatser utifrån symboler eller figurer." Förklaringen "eftersom ..." är vår. Skriv den utan Akavia som avsändare. | https://www.akavia.se/rad-och-stod/soka-jobb/anstallningsintervju/jobbtest/ |
| 192 | "Manpower lyfter att logiska tester särskilt används vid rekrytering inom ekonomi, teknik, IT och ledarskap samt till traineeprogram" | obelagt (formulering) | Manpower: "särskilt värdefullt vid tjänster där analytisk förmåga och problemlösning är viktiga – till exempel inom ekonomi, teknik, IT och ledarskap", samt "traineeprogram eller vid internrekrytering". Byt "särskilt används" mot "är särskilt värdefulla". | https://www.manpower.se/sv/blogg/arbetsgivare/vanliga-logiska-tester-vid-rekrytering |
| 172 | "Stress är ofta en avsiktlig del av testet, för att simulera verkliga arbetsförhållanden" | obelagt | Ingen källa. Akavia säger bara att stress är normal och att alla har samma villkor. Stryk "avsiktlig ... simulera". | Akavia, URL ovan |

## Belagda påståenden
- Akavia: "Logiska tester påminner om IQ-tester och bedömer kandidatens förmåga att se mönster och dra slutsatser utifrån symboler eller figurer" (rad 12, 33, 37); öva för att bli förtrogen med formatet (rad 14, 170); välj tid, sitt ostört, stäng av notiser (rad 176): https://www.akavia.se/rad-och-stod/soka-jobb/anstallningsintervju/jobbtest/
- Matrigma: 3x3 med åtta bilder och sex svarsalternativ, adaptiv variant 12 minuter (rad 43): https://helpcenter2.assessio.com/assessio.bloom.nl/adaptive-matrigma-0 ; https://assessio.com/candidates-students/
- Klassisk Matrigma 35 uppgifter (30 poängsatta), maxtid 40 minuter (rad 43): Matrigma Technical Manual 2017, https://helpcenter2.assessio.com/hubfs/Matrigma_TechManual-2017-1.pdf
- Manpower: logiska tester används ofta i början eller mitten av processen (rad 192, i sak): https://www.manpower.se/sv/blogg/arbetsgivare/vanliga-logiska-tester-vid-rekrytering
- Exemplen med cirklar och pilar (rad 124–146) är märkta som egna övningsexempel. OK.

## Rättning (omgång 1, 2026-11-15)
- Rad 20, 47, 178, 237 produkt: rättat. Gratis är fem matrisfrågor utan konto samt Nivåkollen och ett första träningspass med gratis konto; avancerad nivå och expertnivå ingår i Premium. FAQ i frontmatter och brödtext lika.
- Rad 25, 154 Matrigma 40 min / 35 uppgifter som standard: rättat till att den adaptiva standardversionen (12 minuter, högst en minut per fråga) används mest och att den äldre versionen har 35 uppgifter på 40 minuter. "byggt/medvetet konstruerad så att de flesta inte hinner med alla" struket i samband med det. FAQ "Hur lång tid har man på sig?" (frontmatter och brödtext) kompletterad med samma tider och omskriven utan "designade så att de flesta inte hinner".
- Rad 43 "vanligen runt 20 till 25 stycken": struket; stycket omskrivet med den adaptiva versionen först och "enligt Assessio används den mer sällan" om den klassiska.
- Rad 16, 160, 229 Arbetsförmedlingen: tillskrivningen bytt till Akavia ("färdighetstester bedömer bland annat antal rätta svar, antal genomförda uppgifter, prioritering och effektivitet under tidspress"). Arbetsförmedlingens länk borttagen ur källraden.
- Rad 59 Matrigmas regeltyper: tillskrivningen struken ("Leverantörer och övningsmaterial kallar dem lite olika saker").
- Rad 12, 27, 41, 221 "det vanligaste": omskrivet till "ett av de vanligaste" (FAQ lika). Samma obelagda påstående stod i description, som därför ändrats:
  - före: "Matrislogik är det vanligaste logiska testet vid rekrytering. Lär dig regeltyperna, se exempel lösta steg för steg och öva gratis inför ditt skarpa test." (163 tecken)
  - efter: "Matrislogik är ett av de vanligaste logiska testen vid rekrytering. Lär dig regeltyperna, se lösta exempel steg för steg och öva gratis inför testet." (151 tecken)
- Rad 18, 233 Akavia-förklaringen: omskrivet så att bara "påminner om IQ-tester" tillskrivs Akavia och resten är vår egen mening.
- Rad 192 Manpower: rättat till "är särskilt värdefulla vid tjänster där analytisk förmåga och problemlösning är viktiga ... och nämner även traineeprogram".
- Rad 172 "avsiktlig del ... simulera": struket, omskrivet till att tidspressen är en del av testet och att Akavia påminner om att stress är normal och att alla har samma villkor.
- Källraden: Arbetsförmedlingen ersatt av Assessio (kandidatsida, hjälpcenter Matrigma, Technical Manual 2017).
- updated: "2026-11-15" tillagt. Ingen H2/H3, FAQ-fråga, title eller seoTitle ändrad. Bilden berördes inte (underlagets tre råd oförändrade). Inga interna länkar borttagna.

## Andra granskningen (2026-11-15)
GODKÄND. Kontrollerat: Akavia "Vanligtvis bedöms flera aspekter i resultatet så som antal rätta svar, antal genomförda uppgifter, prioriteringar och effektivitet" och "arbeta effektivt under tidspress", stress "naturligt" och "alla kandidater har fått samma förutsättningar", IQ-meningen (akavia.se/.../jobbtest/); Matrigma adaptiv 12 minuter, 1 minut per fråga, 40-minutersversionen används mer sällan (Assessio); Manpower-formuleringen. Produktuppgifterna (fem frågor utan konto, Nivåkollen och första pass gratis, avancerad och expert i Premium) lika på alla fyra ställena. Description 151 tecken. FAQ i frontmatter och FAQ-block lika. Inga talstreck i ändrade rader.

## Svar till samordnaren
matrislogik-test-guide, GODKÄND, inga brister.
