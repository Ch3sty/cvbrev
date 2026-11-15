# Faktagranskning: content/artiklar/rotation-test-guide.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning, en felaktig källhänvisning (Neurobics), en överdriven Akavia-tolkning och obelagda superlativ om tränbarhet; resten håller.

## Fynd att åtgärda

| Rad | Citat | Klass | Rätt uppgift / förslag | Källa |
|---|---|---|---|---|
| 270 | "Neurobics lyfter samma grupp och lägger till kirurger, skulptörer och idrottare" | fel | Neurobics nämner inte kirurger, skulptörer eller idrottare (inte heller arkitekter eller ingenjörer). Sidans yrkeslista är polis, mönstring, pilot, lokförare, flygledare och kabinpersonal. Ersätt med "Neurobics nämner polis, piloter, lokförare, flygledare och kabinpersonal, yrken där spatial förmåga prövas i urvalet." Kirurger finns hos psykologi.se (redan citerat på rad 44). | https://www.neurobics.se/tester/spatial-formaga/ |
| 250 | "Akavia är tydlig: ... stress är ofta en avsiktlig del av testet" | obelagt | Akavia säger det bara om simuleringsövningar: "I simuleringsövningar kan en viss nivå av stress behövas för att ge en realistisk bild." Stryk stressledet eller skriv "Akavia påpekar att stress ibland är en avsiktlig del av övningen, i simuleringar". Samma fel finns i numeriskt-test-guide.mdx. | https://www.akavia.se/rad-och-stod/soka-jobb/anstallningsintervju/jobbtest/ |
| 31, 167, 246, 276; FAQ 16/307, 20/315 | "Spatial förmåga är ovanligt tränbar", "testtypen där träning ger mest mätbar effekt", "3D-rotation är en av de mest tränbara spatiala färdigheterna", "Av alla testtyper är det här en av dem där flitig övning ger mest mätbar skillnad" | obelagt | Ingen källa för superlativen, och numeriskt-test-guide.mdx påstår samma sak om numeriska test ("den mest tränbara av alla testtyper"). Ersätt med den belagda uppgiften: "En metaanalys av 217 studier (Uttal m.fl. 2013) visade att spatial förmåga går att träna upp, och att effekten består över tid och delvis förs över till andra uppgifter." | Uttal m.fl., Psychological Bulletin 139(2), 352–402, https://doi.org/10.1037/a0028446 |
| 171 | "I deltest 2 viker du ihop, och i deltest 6 viker du upp ett ark som klippts" | obelagt (detalj) | Ordningen deltest 2 = pappersvikning och deltest 6 = pappersvikning med klipp stöds bara av sekundärkällor (provsajter); Pliktverkets egen sida anger bara "två frågor inom sex olika kategorier". Vikriktningen per deltest gick inte att bekräfta i förstahandskälla. Behåll numren om de kontrolleras mot Pliktverkets övningsprov, annars skriv "I I-provet finns både pappersvikning och pappersvikning med klipp". | https://www.pliktverket.se/gemensam/testa-i-provet |

## Belagda påståenden
- Spatial förmåga delas i visuell perception, mental rotation, spatial visualisering och spatial orientering; arkitekter, kirurger och piloter nämns: psykologi.se, https://psykologi.se/psykologilexikon/spatial-formaga/
- Shepard och Metzler 1971, svarstiden ökar linjärt med rotationsvinkeln: Shepard & Metzler, Science 171 (1971) 701–703.
- Vandenberg och Kuse: referensfigur och fyra alternativ, två rätt: Vandenberg & Kuse, Perceptual and Motor Skills 47 (1978).
- I-provet: sex delprov, tre spatiala (pappersvikning, tärningar, pappersvikning med klipp): Pliktverket (sex kategorier), detaljerna via sekundärkällor (Neurobics, logiktester.se); Pliktverket kallar förmågan rumsuppfattning (citerat av Neurobics).
- Polisen använder I-prov 2025 från 5 maj 2025: Polistidningen, https://polistidningen.se/2025/04/nytt-intelligenstest-i-polisprovningen/
- Urvalstest med spatial förmåga för piloter och lokförare: Neurobics (yrkeslistan).
- Akavia: öva för att vara mentalt förberedd; praktiska råd (ostört, notiser av, rätt tid på dygnet): Akavia jobbtest-sidan.
- Motstående sidor på en tärning summerar till 7: standard.
- Produkt: Spatial förmåga i tre nivåer med 15 uppgifter vardera, grundnivån fri med konto, övriga kräver tests_above_base: src/app/dashboard/tester/testConfig.ts rad 317–330; /verktyg/rekryteringstester/prova finns.

## Rättning (omgång 1, 2026-11-15)
- Rad 270 (Neurobics): rättat. Neurobics anges nu nämna polis, piloter, lokförare, flygledare och kabinpersonal; kirurger tillskrivs psykologilexikonet, som redan är källa.
- Rad 250 (Akavia och stress): stressledet struket från Akavia-attributionen. Kvar: Akavias råd om att bli bekant med upplägget och mentalt förberedd, plus vår egen konstaterande mening att tidspressen hör till testet.
- Superlativen om tränbarhet (rad 27 snabbsvar, 31, 167, 246, 256, 276, 284, FAQ 16/307 och 20/315): alla ersatta. "Ovanligt tränbar", "mest mätbar effekt", "en av de mest tränbara" är borta. I stället den belagda uppgiften: metaanalys av 217 studier (Uttal m.fl. 2013), träning ger effekt som består över tid och delvis förs över till andra uppgifter. Rad 167 omskriven till "mental rotation blir snabbare och säkrare med övning". FAQ i frontmatter och FAQ-blocket i brödtexten säger samma sak.
- Rad 171 (deltest 2 och 6): numren strukna. Nu: "I I-provet finns både pappersvikning och pappersvikning med klipp, där du viker upp ett ark som klippts medan det var vikt."
- Källraden: Uttal m.fl. (2013), doi 10.1037/a0028446, tillagd. Arbetsförmedlingens webbinarielänk borttagen (kategorisida utan stöd för något i artikeln, se granskningen av numeriskt-test-guide).
- updated: "2026-11-15" tillagt.
- Inga rubriker, FAQ-frågor, title, seoTitle eller description ändrade. Bilden berörs inte (underlagets rader är oförändrade), ej omgjord. Inga interna länkar försvann.

## Andra granskningen (2026-11-15)
GODKÄND. Kontrollerat mot källorna: Neurobics yrkeslista (polis, mönstring, pilot, lokförare, flygledare, kabinpersonal) stämmer med rad 271; Uttal m.fl. 2013 (217 studier, effekten varaktig och överförbar) bär rad 17, 32, 247, 277 och FAQ; Akavia ("förstå hur testerna är uppbyggda", "förbered mentalt", avsätt tid, ostört, notiser av, tidpunkt då du är som mest fokuserad) bär rad 251, 255 och FAQ. Superlativen om tränbarhet är borta, deltestnumren strukna, FAQ i frontmatter och FAQ-block identiska, inga talstreck i ändrade rader. Notering utan krav: Akavia skriver faktiskt om stress generellt ("det är ofta en del av poängen"), så strykningen var försiktigare än nödvändigt.
