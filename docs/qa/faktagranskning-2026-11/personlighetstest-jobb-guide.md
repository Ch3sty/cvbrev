# Faktagranskning: content/artiklar/personlighetstest-jobb-guide.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Leverantörsråden (Alva, Assessio) och Akavia-citaten håller, men en produktuppgift är fel, 16PF är felklassat, Aon-kundlistan saknar belägg och validitetssiffrorna saknar källa och är inaktuella.

## Fynd att åtgärda

1. **Rad 255.** "personlighetstest du kan göra gratis, på både grund- och avancerad nivå". **Fel (produkt).** Bara grundtestet (50 påståenden) är gratis. Det fördjupade testet (120 påståenden) ingår i Premium: src/lib/plans/plans.ts rad 93 och 137 ("Fördjupade personlighetstestet, 120 påståenden (grundtestet är gratis)") och priser/page.tsx rad 200. Förslag: "med ett personlighetstest där grundtestet med 50 påståenden är gratis med konto. Det fördjupade testet ingår i Premium."

2. **Rad 153.** "I Sverige används Aon av bland annat Skatteverket och Arbetsförmedlingen, och internationellt av företag som Siemens och Lufthansa." **Obelagt**, och för Arbetsförmedlingen troligen **fel**. Ingen förstahandskälla (myndighet eller Aon) hittad för någon av de fyra. JobTestPrep (sekundärkälla) skriver att Arbetsförmedlingen "nyligen bytte testföretag" från Aon till Fairsight: https://www.jobtestprep.se/jobba-hos-arbetsfoermedlingen. Förslag: stryk meningen, eller ersätt med "Aon säljer över 40 tester i Sverige, och arbetsgivaren väljer vilka moduler du får" (https://www.aonassessment.com/aons-testutbud/logiktest).

3. **Rad 155.** "16PF och NEO är två klassiska femfaktorbaserade test". **Fel** för 16PF. 16PF bygger på Cattells 16 primärfaktorer; en version av Big Five finns bara som globala faktorer på andra nivån (https://en.wikipedia.org/wiki/16PF_Questionnaire). Förslag: "NEO är ett klassiskt femfaktortest, och 16PF mäter 16 primärfaktorer som går att räkna om till fem globala faktorer. Båda dyker ofta upp i mer fördjupade urval, exempelvis vid chefsrekrytering."

4. **Rad 51 och 237.** "prediktiv validitet kring 0,20 till 0,23" (samvetsgrannhet), "ungefär 0,08 till 0,12 för emotionell stabilitet och extraversion". **Obelagt.** Ingen källa i texten eller källraden. Siffrorna liknar Barrick och Mount 1991 men anges som "sammanställd forskning". Den senaste omräkningen, Sackett m.fl. 2022 (Journal of Applied Psychology), ger samvetsgrannhet 0,19. Förslag: "Den senaste stora omräkningen av forskningen, Sackett och kollegor 2022, ger samvetsgrannhet en validitet kring 0,19" och stryk siffrorna för övriga dimensioner om ingen källa läggs till. Källa: https://gwern.net/doc/statistics/meta-analysis/2021-sackett.pdf

5. **Rad 239.** "En strukturerad intervju har en prediktiv validitet på runt 0,44 till 0,62 i metaanalyser, klart högre än den ostrukturerade intervjun som landar kring 0,31 till 0,33." **Obelagt** (ingen källa) och inaktuellt. Sackett m.fl. 2022: strukturerad intervju 0,42, ostrukturerad 0,19 (samma källa som ovan; Tema HR återger samma tal: https://temahr.se/rekrytering/kognitiv-formaga-som-urvalsmetod-allt-en-rekryterare-behover-veta/). Förslag: "En strukturerad intervju har en validitet på runt 0,42 enligt Sackett och kollegor 2022, mer än dubbelt så hög som den ostrukturerade intervjuns 0,19."

6. **Rad 269 och FAQ rad 22/308.** "Akavia noterar till och med att personlighetstesters validitet ofta är bättre än intervjuns". **Obelagt i den formen.** Akavia skriver att femfaktortester ger bättre validitet än *traditionella* intervjuer (https://www.akavia.se/rad-och-stod/soka-jobb/anstallningsintervju/personlighetstest/). Artikeln säger samtidigt på rad 239 att den strukturerade intervjun ligger klart högre, så meningen motsäger texten. Förslag: "Akavia noterar att femfaktortestens validitet ofta är bättre än den traditionella, ostrukturerade intervjuns".

7. **Rad 265, FAQ rad 22/308.** "Akavia är tydlig: personlighetstest ska användas som komplement till intervju och arbetsprov, inte som ensamt beslutsunderlag" / "ska enbart användas som komplement ... aldrig som ensamt beslutsunderlag". **Obelagt (starkare än källan).** Akavia skriver: "Man kan kombinera olika tester och sedan använda dem som en grund för ett samtal. Tar man även in arbetsprover så lär resultatet bli ännu bättre." Förslag: "Akavia rekommenderar att testerna används som grund för ett samtal, och skriver att resultatet blir ännu bättre om man också tar in arbetsprov." Källa som ovan.

8. **Rad 151.** "MAP från Assessio är ett av de mest spridda i Sverige". **Obelagt**, låg allvarlighet. Ingen källa för spridning. Förslag: "MAP från Assessio är ett femfaktorbaserat test som ofta kommer i par med logiktestet Matrigma" (Assessio rekommenderar kombinationen: https://assessio.com/aptitude/).

## Belagda påståenden

- Big Five som det mest seriösa/vetenskapligt grundade sättet, de fem dimensionerna: Akavia, personlighetstest-sidan.
- Magnus Lindwall-citatet ("Om ett test resulterar i att du blir en typ ... inte särskilt mycket med vetenskap att göra") och "illusion": Akavia, samma sida.
- DNV-certifiering, 14 certifierade test som alla bygger på femfaktormodellen: Akavia, samma sida.
- Inbyggd indikator för inkonsekventa eller överdrivet enhetliga svar: Akavia, jobbtest-sidan ("De flesta tester har en indikator ...").
- Hungrig/koffein, öva på nätet: Akavia, personlighetstest-sidan. Fråga hur resultatet används och om återkoppling: Akavia, jobbtest-sidan.
- Master: "starkast belagd och mest etablerad", uppföljningar över 45 år: master.se, Om Big 5-teorin.
- Alva: första instinkten, mittenresultat varierar med sammanhang, höga värden inte bättre, antal frågor beror på konsekvens, 12 till 15 minuter: Alvas kandidatsida och hjälpartiklar (granskade 2026-11-14, docs/qa/seo-tester-omgang2/personlighetstest-jobb-guide-test.md).
- Assessio: arbetssammanhang, ostört och stabil uppkoppling, beteenden som fungerar i rollen: assessio.com/candidates-students.
- Produkt: provet utan konto har 20 påståenden, hela testet med 50 påståenden gratis i kontot (personlighetsprov-copy.ts rad 10, 43, 50).
- Tabellen: fem av tio exempel är omvända, "hälften" stämmer.

## Rättning (omgång 1, 2026-11-15)
1. Rättat (produkt): "gratis, på både grund- och avancerad nivå" ersatt med att grundtestet med 50 påståenden är gratis med konto och att det fördjupade testet med 120 påståenden ingår i Premium.
2. Struket: meningen om Skatteverket, Arbetsförmedlingen, Siemens och Lufthansa. Ersatt med "Aon säljer över 40 tester i Sverige, och det är arbetsgivaren som väljer vilka moduler du får." Aon: Logiktest tillagd i källraden.
3. Rättat: 16PF beskrivs nu som 16 primärfaktorer som går att räkna om till fem globala faktorer; NEO som femfaktortest. Wikipedia: 16PF Questionnaire tillagd i källraden.
4. Rättat: samvetsgrannhet 0,20 till 0,23 ersatt med 0,19 enligt Sackett och kollegor 2022 (rad 52 och 238). Siffrorna för emotionell stabilitet, extraversion och öppenhet strukna, omskrivet till "övriga dimensioner ger svagare samband med prestation än så". Sackett m.fl. 2022 (doi.org/10.1037/apl0000994) tillagd i källraden.
5. Rättat: strukturerad intervju 0,42 och ostrukturerad 0,19 enligt Sackett och kollegor 2022. Tema HR tillagd i källraden.
6. Rättat i brödtext (avsnittet "Testet är en pusselbit") och i FAQ "Är personlighetstest rättvist?" (frontmatter och FAQ-blocket): Akavia jämför med den traditionella, ostrukturerade intervjun.
7. Rättat i "Vanliga missuppfattningar" och samma FAQ (båda ställena): Akavia rekommenderar testerna som grund för ett samtal och skriver att resultatet blir ännu bättre med arbetsprov.
8. Rättat: "ett av de mest spridda i Sverige" struket; i stället att Assessio själva rekommenderar kombinationen med Matrigma. Assessio: Aptitude tillagd i källraden. Länken till MAP-guiden kvar.
- updated: "2026-11-15" tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden berördes inte.

## Andra granskningen (2026-11-15)
UNDERKÄND.

1. **Rad 23 (FAQ i frontmatter), rad 270 och rad 309 (FAQ-blocket).** "Akavia noterar att femfaktortestens validitet ofta är bättre än den traditionella, ostrukturerade intervjuns". **Säger mer än källan.** Akavias personlighetstest-sida skriver bara: "valideringen i personlighetstest är ofta bättre än i intervjuer". Varken "femfaktortest", "traditionella" eller "ostrukturerade" står i den meningen (orden "traditionella urvalsmetoder, så som intervjuer" finns bara på Akavias jobbtest-sida, i ett annat sammanhang). Rättningen tillskriver Akavia en precisering som Akavia inte gör. **Dessutom motsägelse i artikeln:** rad 52 och 238 anger samvetsgrannhet 0,19 och rad 240 den ostrukturerade intervjun 0,19 (Sackett m.fl. 2022), alltså lika, inte "bättre". Krav: återge Akavia ordagrant ("Akavia skriver att valideringen i personlighetstest ofta är bättre än i intervjuer") och lägg vid behov till en egen, otillskriven nyansering i linje med rad 240, till exempel "Enligt Sackett och kollegor 2022 ligger det bästa personlighetsmåttet i nivå med den ostrukturerade intervjun men klart under den strukturerade." Ändra på alla tre ställena så att frontmatter och FAQ-block förblir identiska. Källa: https://www.akavia.se/rad-och-stod/soka-jobb/anstallningsintervju/personlighetstest/ och https://doi.org/10.1037/apl0000994

Kontrollerat och godtaget: rättning 1 (produkt, 50/120 påståenden), 2 (Aon "över 40+ test", kunderna skräddarsyr testpaketet: aonassessment.com/aons-testutbud/logiktest, Aons svenska sajt), 3 (16PF: 16 primärfaktorer, fem globala faktorer i fjärde och femte utgåvan som motsvarar Big Five, Wikipedia), 4 och 5 (Sackett m.fl. 2022: samvetsgrannhet 0,19, strukturerad intervju 0,42, ostrukturerad 0,19; 0,42/0,19 = 2,2, så "mer än dubbelt" håller), 7 (Akavia: "Man kan kombinera olika tester och sedan använda dem som en grund för ett samtal. Tar man även in arbetsprover så lär resultatet ... bli ännu bättre"), 8 (Assessio: "Matrigma together with the MAP personality test provides a very good overall picture"). Anmärkning till omgång 1, punkt 7: Akavia har mellanrubriken "Personlighetstest bör enbart användas som komplement" (Magnus Lindwall), så den ursprungliga formuleringen var delvis belagd; den nya är också belagd och kan stå. Anmärkning, inget krav: Tema HR återger inte 0,19 för ostrukturerad intervju, det talet bärs av Sackett-artikeln i källraden. Inga talstreck i ändrade rader, källraden komplett.

## Svar till samordnaren
personlighetstest-jobb-guide, UNDERKÄND, Akavia-meningen (rad 23, 270, 309) tillskriver Akavia "femfaktortest" och "traditionella, ostrukturerade intervjuer" som källan inte säger, och den motsäger artikelns egna 0,19 mot 0,19.

## Rättning omgång 2 (samordnaren, 2026-11-15)
Akavia-meningen (FAQ x2 och rad 270) återger nu Akavias formulering: valideringen i personlighetstest ofta bättre än i intervjuer; rad 270 kompletterad så att den inte motsäger Sackett-talen.

## Tredje kontrollen (2026-11-15)
GODKÄND. Rad 23, 270 och 309 återger Akavia som "valideringen i personlighetstest ofta är bättre än i intervjuer", utan femfaktortest eller ostrukturerade intervjuer. Rad 270 lägger till att varje metod för sig förutsäger måttligt, vilket stämmer med artikelns egna Sackett-tal (0,19 till 0,42) och inte längre motsäger dem. Frontmatter och FAQ-block lika. Gratis personlighetstest att öva på (rad 250) stämmer med facit (grundtestet gratis). Inga talstreck.
