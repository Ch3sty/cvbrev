# Faktagranskning: content/artiklar/i-prov.mdx (2026-11-15)
Granskare: opus, omgång 1. Bedömning: punkträttning. Myndighetsuppgifterna (datum, spärr- och giltighetstider, krav, Riksrevisionens siffror, årsredovisningen) stämmer; tre detaljer behöver rättas eller nyanseras.

## Fynd att åtgärda

1. **Rad 118.** "Vi går igenom dem en i taget, med tolv lösta uppgifter, i vår guide till talserier." **Fel (intern).** Talserieguiden har tjugo lösta uppgifter (content/artiklar/talserier.mdx, titel och rad 29; arbetspsykologiska-tester säger också "tjugo lösta talserier"). Förslag: "med tjugo lösta uppgifter".

2. **Rad 246.** "I-prov 2025, som Plikt- och prövningsverket tagit fram tillsammans med forskare från Försvarshögskolan i ett arbete som pågått sedan 2018." **Obelagt** för "sedan 2018". Varken Pliktverkets sida Nytt I-prov, årsredovisningen 2025, Polistidningen, Kvalitetsmagasinet eller taktisk.se anger 2018. Pliktverket skriver bara att arbetet pågått under flera år (https://www.pliktverket.se/om-myndigheten/nytt-i-prov). Förslag: "i ett arbete som pågått i flera år".

3. **Rad 253.** "Kortare och inte längre adaptivt. Enligt taktisk.se ... alla gör provet i samma ordning i stället för att svårigheten anpassas efter svaren." **Obelagt (motstridiga källor).** Taktisk.se, som refererar Försvarshögskolans manual, säger att I-prov 2000 var adaptivt och att I-prov 2025 är linjärt med parallella versioner (https://www.taktisk.se/2026/07/17/i-prov-2025-det-linjara-provet/). Men Kvalitetsmagasinet, som står i samma källrad, citerar Anders Henckel om att det nya provet är "totally adaptive" med varierande frågekombinationer (https://kvalitetsmagasinet.se/nytt-begavningsprov-kvalitetssakrar-antagningen-till-polisen/). Taktisk.se är närmare förstahandskällan (manualen), så påståendet kan stå kvar, men det bör inte se ut som ett känt faktum. Förslag: "Enligt taktisk.se, som refererar Försvarshögskolans manual, är det nya provet linjärt med flera parallella versioner, medan det gamla mönstringsprovet anpassade svårigheten efter svaren. Kvalitetsmagasinet beskriver det i stället som adaptivt, så uppgifterna går isär." Alternativt stryk "och inte längre adaptivt" ur rubriken och behåll bara tidsuppgiften.

## Belagda påståenden

- Lanserat 5 maj 2025, "ett nytt test för att mäta generell problemlösningsförmåga", framtaget med Försvarshögskolan, uppdaterad normeringsgrupp: Pliktverket, Nytt I-prov, och årsredovisningen 2025 s. 47 ("ersätter det tidigare testet från 2000", "används sedan maj 2025 vid mönstring ... och prövningar till myndighetens urvalsuppdrag").
- UNIQ 2.0 "drygt 20 år", ersatt 5 maj 2025, minst en fyra för polis, 3 värnplikt, 6 officer: Polistidningen april 2025. (Tullverkets 4 är struket, enligt granskningen 2026-11-14.)
- Sex deltester i ordningen synonymer, pappersvikning, talserier, motsatsord, tärningar, pappersvikning med klipp; cirka 70 minuter mot tidigare 80; tio deltester till sex: taktisk.se med hänvisning till Försvarshögskolans manual 2025. (Nyheter24 är betalvägg, men taktisk.se bär "tio till sex".)
- UNIQ cirka 90 minuter: Kvalitetsmagasinet.
- Värnplikt: spärrtid 18 månader, giltigt 36 månader: Pliktverket, Så här går prövningen till.
- Polis: spärrtid 12 och giltighet 24 månader: polisen.se (granskat 2026-11-14).
- Riksrevisionen 2025:13: 78 % av kvinnorna och 82 % av männen klarade begåvningstestet 2020 till 2024; "verbala, spatiala och logiska förmåga".
- Mönstringsunderlaget: cirka 40 frågor, fem avsnitt med de angivna namnen: Pliktguiden. Mönstringsdagens ordning och att I-provets resultat ligger till grund för andra prov: Pliktguiden, Testerna på mönstringen.
- Återkoppling till polissökande: vilket moment, ingen djupare information; innehållet ska inte bli allmänt känt: Pliktverket, Medicinsk och psykologisk prövning.
- Två övningsuppgifter i sex kategorier: Pliktverket, Testa I-provet.
- Produkt: halva provet 36 uppgifter på 29 minuter, hela 72 på 58 (src/lib/tester/steg2/iprov.ts rad 30 till 42), resultat som antal rätt per deltest, aldrig stanine; grundnivån gratis med konto.

## Rättning (omgång 1, 2026-11-15)
1. Rättat: "tolv lösta uppgifter" ändrat till "tjugo lösta uppgifter" (stämmer med talserier.mdx).
2. Rättat (obelagt): "sedan 2018" ersatt med "i ett arbete som pågått i flera år".
3. Omskrivet: kontrollerat själv 2026-11-15. Taktisk.se: "Provet är inte längre adaptivt" och I-prov 2000 var adaptivt; Kvalitetsmagasinet citerar Anders Henckel: "Det nya I-provet är också totaltadaptivt". Punktens fetstilta inledning ändrad, före "Kortare och inte längre adaptivt.", efter "Kortare, och kanske inte längre adaptivt." (punktlista, inte H2/H3). Texten redovisar nu båda källorna och att uppgifterna går isär. Följdmeningen "när provet inte är adaptivt" omskriven till "oavsett hur svårigheten styrs". Båda källorna fanns redan i källraden.
- updated: "2026-11-15" tillagt. Inga rubriker, FAQ-frågor eller description ändrade. Bilden berördes inte.

## Andra granskningen (2026-11-15)
GODKÄND. Kontrollerat: "tjugo lösta uppgifter" stämmer med talserier.mdx; Pliktverket skriver "flera års utvecklingsarbete", vilket bär "ett arbete som pågått i flera år"; taktisk.se (Försvarshögskolans manual 2025 i referenserna): "Provet är inte längre adaptivt", I-prov 2000 "anpassade sig" efter prestationen per provdel, tre eller fyra parallella deltest, 70 i stället för 80 minuter; Kvalitetsmagasinet: Anders Henckel, "Det nya I-provet är också totaltadaptivt", UNIQ "ca 90 minuter". Ändrade rader har inga talstreck. Anmärkning, inget krav: "Enligt Nyheter24 gick provet från tio deltester till sex" kan inte läsas bakom betalväggen; taktisk.se bär uppgiften, så att byta tillskrivning till taktisk.se vore säkrare.

## Svar till samordnaren
i-prov, GODKÄND, inga brister.
