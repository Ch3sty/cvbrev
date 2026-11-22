# SEO:s slutbesked, publikt omgång 3

Skrivet 2026-11-22 av SEO, chef för innehållet. Det här är det sista beskedet på allt som var öppet i texten. Slutagenten för in det ordagrant, rad för rad. Underlag: `seo-besked-skisser.md`, `seo-krav.md`, `nytt-innehall.md` (listan Stämmer inte och sektionen `sokta-tjanster`), `saaslead-konvertering.md`, `textbeslut.md`, `BYGGBRIEF.md`, loggarna `bygg/logg-p0.md`, `logg-p1.md`, `logg-p3.md` (P2 och P4 har ingen logg), koden i arbetskopian och grinden `scripts/seo-diff-artiklar.ts`.

## Så läser slutagenten beskedet

- **står**: det som redan står i `nytt-innehall.md` eller i koden gäller. Gör inget.
- **JA**: för in förslaget som det är skrivet i underlaget.
- **NEJ**: för inte in det. Dagens text står.
- **JA MED ÄNDRING**: för in min lydelse, ordagrant. Lydelsen står efter "Lydelse:".
- **Ägarens**: priser, gränser, juridik, samtycken och mejl. Jag avgör dem inte. Det som står kvar tills ägaren har svarat är angivet.
- Tal skrivs alltid ur konstanten eller datan, också där jag skriver ut talet här.
- Detta besked går före `nytt-innehall.md`, `saaslead-konvertering.md` och loggarna där de säger olika. `seo-besked-skisser.md` gäller i övrigt.

Tre saker i grinden som styr flera beslut nedan (kontrollerat i `scripts/seo-diff-artiklar.ts`):

1. Länkar till `/login` och `/register` räknas inte som länkmål (`normHref`, rad 619). Att byta deras mål eller frågesträng kostar ingenting i grinden och ingenting i Google.
2. Nya rubriker på sidor utanför artiklarna fäller inte grinden, de redovisas bara (rad 919). Bara borttagna eller bytta rubriker fäller.
3. Varje artikel har `/verktyg/cv-analys` i Läs vidare (`ArtikelRam.tsx`, `VERKTYG`). En länk med `#mini-analys` får därför ersätta kortets länk utan att något länkmål försvinner.

---

## 1. Listan Stämmer inte, alla 71 punkter

### sokta-tjanster

1. Står. `seo-besked-skisser.md` gäller (56 tecken, elva H2).
2. Står. Etiketten är "Sökta tjänster".
3. Står. Mina tre H2.
4. Står. "föreslår vi ett uppföljningsmejl och skriver utkastet", också i kedjan på jobbmatchningen.
5. Står. Åtta frågor. Den nionde och raden "ingen där ser ditt konto" är ägarens och byggs inte.
6. JA MED ÄNDRING. Sidan får vara cirka 1 450 ord. Det enda som går bort är upprepningen i regelrutan, se punkt 7 och avsnitt 4.
7. JA MED ÄNDRING. Regelrutan kortas så att den inte säger samma fyra fakta som FAQ-svar 4. Lydelse: Enligt Arbetsförmedlingen lämnar du aktivitetsrapporten mellan den 1:a och den 14:e varje månad, för månaden innan, och alla jobb du har sökt ska med, annonserade eller inte. Källa: [Aktivitetsrapportera, arbetsformedlingen.se](https://arbetsformedlingen.se/for-arbetssokande/arbetslos---vad-hander-nu/aktivitetsrapportera), läst 22 november 2026.
8. Står. Alla fyra strykningarna gäller.
9. Står. "Annons", som i kontot.
10. Löst. `INTERVJU_BESKED_DAGAR` (`src/lib/jobbsok/typer.ts:25`) och "Kallad till test" (`src/lib/applications/status.ts:86`) finns nu i arbetskopian. Läs talet ur konstanten överallt där "sju" står utskrivet, också i kortet Inför intervjun i `paket-copy.ts` (P1:s beslut).

### start

11. Står. Länken "Så hjälper vi dig komma förbi" till `/priser` står kvar under medierna.
12. Står. Textbeslut STA-5, STA-6 och JC-3.
13. Står. Dagens text med personlighetstestet och Jobbkartans andra mening.
14. Står, som H3. Nya rubriker fäller inte grinden på `/`. Stycke-reservplanen i P1:s logg behövs inte och används inte.

### funktioner

15. Står. Textbeslut FUN-3.
16. JA till skissens lydelse, som mitt besked redan sa. GEM-9 viker på just det här steget, eftersom steget annars låter som att nedladdningen är gratis. Lydelse i `paket-copy.ts:223` (brevkortets sista steg, syns på /funktioner och /priser): Redigera, välj mall och skicka. Nedladdning ingår i Premium. På /priser byts stegets rubrik i brevets station (`priser/page.tsx:440`) till: Redigera, välj mall och skicka. Stegets text under står. Löptexten i `paket-copy.ts:218` står, eftersom raden Gratis bredvid säger "Nedladdning ingår inte". Uppdatera förväntningen i `paket-copy.test.ts` i samma byte.
17. Står. Textbeslut FUN-5, GEM-7, FUN-7, FUN-8, FUN-11.
18. Står. GEM-12 ordagrant.
19. Står. Rutan utgår eftersom uppgiften inte kommer ur banken.
20. Står. Inför intervjun är inget länkkort.

### priser

21. Står. Dagens radetiketter, bara de nya raderna är nya.
22. Står. GEM-13, tolv stopp, etiketten ur listans längd.
23. Står. Kortet Inför intervjun och länken "Så fungerar Sökta tjänster" finns.
24. JA. "Gratis för alla med konto" som etikett på kortet. Märket Nyhet i menyn tas bort 2027-01-12.
25. JA. "Du väljer, eller så väljer vi efter annonsen".

### meny

26. JA MED ÄNDRING, alla tre ändras nu. Underraderna i `LandingNavbarMega.tsx` (`UNDER`): `/verktyg/linkedin-optimering` blir: Rubrik och sammanfattning som hittas. `/verktyg/jobbcoachen` blir: Intervju, avtal och avslag. Märket Nyhet ska stå utanför länkens text: rita `<em className="p3-nyhet">` som syskon efter `<a>`, eller som `::after` på länken, så att ankartexten är exakt "Sökta tjänster". Foten: "CV-mallar per yrke" pekar på `/cv-mallar#yrken`. Sätt `id="yrken"` på `<Sektion>` med rubriken "CV-mallar för ditt yrke" i `CvMallarPageContent.tsx` (rad 296). Länken "CV-mallar" till `/cv-mallar` står kvar.
27. Står. GEM-6 i Premiumraden, Jobbcoachen under Jobbsöket i foten.
28. JA. Underraderna i `UNDER`: `/verktyg/sokta-tjanster` blir: Håll koll på dina sökta jobb. `/verktyg/personligt-brev` blir: Skrivet mot annonsens krav.

### registrering, inloggning, om-oss

29. Står. REG-1. Skärm 3 och köpsteget är inloggade och byggs inte i den här omgången (P1:s beslut 5 står).
30. Ägarens. Citatet enligt AUTH-1 står. "100% krypterat" och "24 h" står kvar tills ägaren har svarat.
31. JA. `aria-hidden` bort från de fyra textblocken i inloggningens panel.
32. Står. INF-4, INF-2 och min mening om källorna.

### rekryteringstester

33. Står. Befintlig text står, bara det nya läggs till.
34. JA. "Upp till 20 %".
35. JA. "går till på samma sätt".
36. Står.
37. Står. Provets egen text i `prov-copy.ts`.
38. Står. Bytet "fråga" till "uppgift" bara på de listade ställena.

### cv-analys, skapa-cv, cv-mallar, linkedin, personlighetstest

39. JA. "Det viktigaste att ändra först".
40. JA. "Släpp din CV-fil här" står bara om släppytan finns och fungerar.
41. Står. B-8 och GEM-6.
42. Står. Hela Premiumtexten och de tre knapptexterna.
43. JA. "2021 till nu" överallt.
44. Står.
45. Står, alla fyra delarna, också kortningen till "Fem steg".
46. JA. "Inget krav i den här profilen", sjätte profilen "Lager, produktion och drift".
47. Står. "Fem faktorer, 1 till 5" är provets egen resultattitel (`personlighetsprov-copy.ts:35`) och sann. Profilens rader visar bandord, och det är dem mitt villkor gällde.
48. Ägarens. Fotnoten om sju dagar står ordagrant.

### personligt-brev och brevsidorna

49. JA MED ÄNDRING. Regelns text står ordagrant och efterexemplet står. För att exemplet ska visa regeln läggs en rad över Före och Efter. Lydelse: I annonsen: intressentdialog
50. JA. "Byter du efteråt skriver vi om brevet i den nya tonen."
51. JA MED ÄNDRING (saas-leads lydelse). Tonblockets ingress blir: Exempel på hur Saras första mening kan låta i var och en av dem. I kontot väljer du ton innan brevet skrivs. Byter du efteråt skriver vi om brevet i den nya tonen.
52. Står. Märket utanför `h3`.
53. JA. I `verktyg/personligt-brev/page.tsx:96`, kortet Personligt brev-exempel. Lydelse: Brev att utgå från, yrke för yrke. Skriv ditt eget från ett av dem.
54. Står. "Se alla 40 brevmallar" till `/verktyg/personligt-brev`.
55. Står, och gäller nu också P3:s bild. På de 89 exempelsidorna (`BrevExempelMall.tsx:369-381`) heter delarna: Öppningen, Mitten, Avslutet. Raderna under dem står. På navet står chipen "1 Inledningen", "2 Kopplingen till annonsens krav", "3 Avslutningen", eftersom de följer navets egen guidetext ordagrant.
56. Står.
57. Står. Talet ur datan.
58. Står.
59. JA MED ÄNDRING. Länktexten "Tillbaka till hubben" till `/exempel` (`CvExempelKategori.tsx:95`, `CvExempelNav.tsx:221`, `GalleriPageContent.tsx:214`) blir: Alla exempel och mallar. Meningen "Bläddra hela biblioteket eller välj en annan bransch på hub-sidan." (`CvExempelKategori.tsx:89`, `KategoriPageContent.tsx:232`) blir: Bläddra i hela biblioteket eller välj en annan bransch bland alla exempel. Länkmålen står.

### jobbmatchning, jobbcoachen, bli-upptackt

60. Står. "Hela Sverige, alla branscher".
61. Står. "Håll koll på dina sökta jobb".
62. Står. Koden gäller.
63. JA MED ÄNDRING. Riktiga arbetsgivare står bara där sidans befintliga text har dem i dag (grenarna på /verktyg/jobbmatchning). All ny exempeltext och alla nya bilder använder grundens påhittade arbetsgivare (`Traff.tsx`, `Brevpar.tsx`). I reklamkortet för träffen blir "Sweco, Göteborg" Nordhaga Bygg, Göteborg och "Trafikverket, Mölndal" Västlänken Konsult, Mölndal. Annonslappen "Projektledare, Sweco" på /verktyg/personligt-brev är Projektledare, Nordhaga Bygg (redan så i `Brevpar.tsx`). Mitt tidigare JA till "Sara hos Sweco" upphävs.
64. Står.
65. JA MED ÄNDRING, rad för rad:
    - Hjältens etikett (`jobbcoachen/page.tsx:220`). Lydelse: Jobbcoachen, för svensk arbetsmarknad
    - Bricka 2: JA, "**Källor** du kan kolla själv".
    - Bricka 3. Lydelse: **6** källor i kunskapsbasen
    - Lyftets rubrikrad. Lydelse: Här ser du var svaret kommer ifrån
    - "Källa till varje svar" och "Sekunder till första svaret" står inte kvar någonstans.
66. Står. Byggs inte.
67. Står. Arbetsgivaren efter ett ja och "percentiler" är ägarens.

### artikelreklam och nya funktioner

68. JA. Etiketten "Jobbsöket" och knappen "Håll koll på sökta jobb" till `/verktyg/sokta-tjanster`. Byt i `reklam-copy.ts`.
69. JA MED ÄNDRING enligt regeln i avsnitt 5. Brevkortets bild citerar grundens brev. Lydelse för andra meningen: Ni skriver att rollen kräver vana vid offentlig upphandling enligt LOU. Jag har drivit fyra sådana. "inom budget på 42 miljoner" står inte.
70. Står. 53 och 56 ord är godkända.
71. JA. "Din gratis nedladdning kan vara en Word-fil."

---

## 2. Saas-leads förslag

Vägningen: /funktioner, /priser, /verktyg/sokta-tjanster och /register har nästan ingen sökvolym, där vinner konverteringen. Startsidan och artiklarna har trafik, där får texten bara växa och inga rubriker eller länkmål försvinna.

### K1 till K8

| Förslag | Besked | Lydelse och villkor |
|---|---|---|
| K1, kontoknapparna på Sökta tjänster till `/register?redirect=%2Fdashboard%2Fsokta-tjanster%3Flogga%3D1` | JA | Gäller hjältens knapp, arkets knapp, Premiumytans "Börja gratis", slutblockets knapp och telefonens fasta rad. Länktexterna står. Grinden räknar inte `/register`. |
| K2, Google i raden om kortet | JA | Lydelse: Inget kort behövs. Du skapar kontot med Google eller med din e-postadress. |
| K3, hjältens knapp koppar, arkets vit på datorn | JA | Gäller bara när båda syns på samma skärmyta. Ingen SEO-verkan. |
| K4, brevblocket på startsidan säger vilka mallar som är gratis | JA MED ÄNDRING | Lydelse: Brevet får samma mall som ditt CV, så att ansökan hänger ihop. Du väljer bland 40 mallar, där Linne och Björk är gratis, och fem toner. Namnen ur `BREV_GRATIS_NAMN`, talet ur `BREV_MALL_ANTAL`. "där ... är" gör att meningen går att läsa i ett svep. |
| K5, gratisraden för matchningen | JA | Lydelse: Tre träffar, med skälen utskrivna. Talet ur `FREE_TIER_JOB_LIMIT`. |
| K6, förnyelsemejlet vid köpknappen | Ägarens | Det är ett löfte om ett mejl, och enligt saas-leads egen Del 3 punkt 3 är det osant för den som har stängt av påminnelser. Raden under köpknappen står som i dag: Kortbetalning via Stripe. Kvitto på mejl. |
| K7, köpknapp i Premiumytan på /funktioner | JA | Köpknappen ur `kopKnapp()` med samma beteende som `PriserKopKnapp.tsx`. "Se vad som ingår" står kvar som textlänk till `/priser`, med samma ankartext. |
| K8, CV-analyskortet i artiklarna till `/verktyg/cv-analys#mini-analys` | JA | Google räknar ankaret som samma adress, och `/verktyg/cv-analys` står kvar i varje artikel genom Läs vidare. Ingen rad i undantagsfilen behövs. Grinden redovisar `#mini-analys` som ny länk, det är rätt. |

### Saas-leads ståndpunkter på listan

| Punkt | Besked |
|---|---|
| 68 | JA (punkt 68 ovan). |
| 16 | JA (punkt 16 ovan, med lydelsen för båda sidorna). |
| 60 | JA, dagens bricka står. |
| UX-punkten, två kopparknappar | JA (K3). |
| 2, 11, 24, 25, 39, 40, 50, 53, 61, 71 | JA, som i listan ovan. |
| 51 | JA MED ÄNDRING, lydelsen i punkt 51 ovan. |
| 65 | JA MED ÄNDRING, lydelserna i punkt 65 ovan. |
| 69 | JA MED ÄNDRING, regeln i avsnitt 5 gäller båda ställena. |
| 13, 20, 22, 29, 37, 42, 44 | Står. |

### De tre saknade

1. **Arket på Sökta tjänster går att fylla i**: JA MED ÄNDRING. Villkor för SEO: fälten "Tjänst" och "Arbetsgivare" är riktiga fält med synlig `<label>`, inga h-taggar i arket, och knappen är en vanlig `<a href>` med K1:s adress som fungerar utan JavaScript. Fälten är tomma från början med platshållarna Till exempel projektledare och Arbetsgivarens namn, så att inga exempelvärden skickas vidare. Arkets `aria-label` blir Logga sökt tjänst (inte längre "Exempel"). Villkor för datan: tjänst och arbetsgivare får inte hamna i mätningen. Den som bygger kontrollerar att sidvisningen på `/register` och `/dashboard/sokta-tjanster` inte skickar frågesträngen till PostHog. Gör den det byggs bara K1 utan förifyllning, och frågan går till ägaren (datalagring).
2. **Egna mätvarianter för de två nya reklamkorten**: JA. `data-cta-variant` `jobb-matchning` och `jobb-sokta`, `data-cta-klick` på knappen. Attribut, ingen SEO-verkan.
3. **Förnyelsemejlet till alla betalande**: Ägarens (mejlregel). Den befintliga meningen i Kom igång (`paket-copy.ts:296`, live i dag) står kvar tills ägaren har svarat. Den nya meningen i Premiumytan på /priser (`priser/page.tsx:592`, `nytt-innehall.md` rad 1972) förs inte in. Lydelse tills dess: Ingen bindningstid.

---

## 3. Byggarnas nya text utan godkännande

### P0, grunden

| Text | Besked |
|---|---|
| Menyns testkolumn "Grundnivån är gratis i alla åtta." (talet ur `ANTAL_TESTTYPER`) | JA |
| Menyns brevkolumn "Första brevet är gratis." | JA |
| Telefonmenyns "Skapa konto gratis", "Logga in", "Stäng" | JA |
| Beslut 5, underraderna enligt NAV-1 | Ersätts av punkt 26 och 28. |
| Beslut 6, märket Nyhet | Står till 2027-01-12, utanför länkens text (punkt 26). |
| Beslut 9, "CV-mallar per yrke" | Ersätts av punkt 26. |
| Beslut 10, påhittade arbetsgivare och brevets belopp struket | JA. Det är regeln i avsnitt 5. |

### P1, hela sajten

| Text | Besked |
|---|---|
| "Nästan inne. Välj något du faktiskt kommer ihåg." (Välj nytt lösenord) | JA |
| "Nytt mejl skickat, kolla din inkorg" (Bekräfta e-post) | JA |
| "sju dagar" skrivet som ord i Inför intervjun | Läs ur `INTERVJU_BESKED_DAGAR` (punkt 10). |
| "fem toner" skrivet som ord | JA, det finns ingen publik konstant. |
| Brevkortets sista steg enligt GEM-9 | Ersätts av punkt 16. |
| Ny H3 "Håll koll på var varje ansökan står" på `/` | Står som H3 (punkt 14). |

### P3, personliga brev

| Text | Besked |
|---|---|
| /verktyg/personligt-brev: etiketterna "Från annons till ansökan", "Prova utan konto", "Så mycket är gratis", "Tonen" | JA |
| Gratislistans underrader | JA MED ÄNDRING. Punkt 2 ska ha hela BRV-1-lydelsen. Lydelse: Utan kortuppgift. Allt du skrivit ligger kvar, och de två senaste breven går att ändra. |
| "Har du ingen annons? Börja med tjänsten och arbetsgivaren." | JA |
| Tonblocket: rubrikraden, fem exempelmeningar, "Vi väljer ton åt dig" med raden | JA. Exempelmeningarna som de står i koden i dag (utan belopp). Ingressen enligt punkt 51. |
| Resultatets ingress, kravpanelens texter, chipet "utan kortuppgift", "Se alla yrken", Premiums tre bockar, "Ditt CV", "Ditt brev" | JA |
| Brevnavet: "Alla exempel", "Välj bransch", "Hela listan står här nedanför", "Tillbaka till hela listan", "yrken, ett färdigt brev var", bilden "Mall och exempel" | JA |
| Brevnavet: "Tio branscher. Hitta den som är din." och "Tio branscher. Byt till en annan." | JA MED ÄNDRING. Talet räknas ur datan (antalet branscher), med stor bokstav, inte skrivet för hand. |
| Gratis- och Premiumraderna i guidens fjärde svar | JA. De är sanna och bär "gratis", "mall" och "ladda ner". |
| Chipen "1 Inledningen" och så vidare på navet | JA (punkt 55). |
| Exempelsidornas "Brevets tre delar" med Inledningen, Huvuddelen, Avslutningen | JA MED ÄNDRING. Öppningen, Mitten, Avslutet (punkt 55). |
| /skapa-brev/start, alla nya texter i loggens lista | JA. Sidan har `noindex`; alla raderna är sanna mot beslut 6 (mallen sparas inte, och ingen text påstår det). |

---

## 4. Den nya sidan /verktyg/sokta-tjanster

**Godkänd**, med ändringarna nedan. Allt annat i sektionen `sokta-tjanster` i `nytt-innehall.md` står ordagrant.

### Ordmängden

Sidan blir cirka 1 450 ord löptext med frågor, i stället för min bedömning 900 till 1 100. Det godkänner jag. Skälen: bedömningen gällde att matcha mallen, inte ett mätt behov; längden kommer ur min egen disposition med elva H2 och åtta frågor; varje H2 svarar på en egen sökning (uppföljningsmejl, aktivitetsrapport, statistik, intervjun); sidan har ingen baslinje att tappa mot; och /verktyg/linkedin-optimering har 1 154 ord och /cv-exempel 2 308. Det som går bort är det enda som säger samma sak två gånger: regelrutan, som upprepade FAQ-svar 4 nästan ord för ord. Exemplen i bilderna står också, de är `aria-hidden` eller `role="img"` och tynger inte löptexten.

### Ändringarna

1. **Regelrutan** kortas enligt punkt 7 ovan.
2. **Raden under gratislistan** enligt K2: Inget kort behövs. Du skapar kontot med Google eller med din e-postadress.
3. **Kontoknapparna** enligt K1. **Arket** enligt Del 3 punkt 1 med mina villkor.
4. **Talen** sju och "Kallad till test" ur konstanterna (punkt 10).

### Påståendena om aktivitetsrapporten, kontrollerade mot seo-krav.md

| Påstående på sidan | Var | Belagt i seo-krav.md |
|---|---|---|
| Lämnas mellan den 1:a och den 14:e varje månad | Regelrutan, FAQ 4 | Ja |
| Gäller månaden innan | Regelrutan, FAQ 4 | Ja |
| Alla sökta jobb ska med, annonserade eller inte | Regelrutan, FAQ 4 | Ja |
| Intervjuer ska med | FAQ 4 | Ja |
| Lämnas på Mina sidor, med blankett eller per telefon | FAQ 4 | Ja ("blankett per post eller på servicekontor, eller muntligt per telefon") |
| Spara underlag som visar att du har sökt jobben i minst tre månader | FAQ 4 | Ja |
| Du lämnar in den själv, vi skickar ingenting dit | Rapportavsnittet, FAQ 3 | Ja (beslut 4, produkten skickar inget) |
| "Vår månadsrapport har tjänst, arbetsgivare och datum" | FAQ 4 | Säger vad vår lista har, inte vad Arbetsförmedlingen kräver. Rätt form. |

Ingen mening säger att rapporten godkänns, har rätt format eller skickas av oss. Källan står med namn, länk och läsdatum i regelrutan och i FAQ-svar 4. Läsdatumet står kvar som 22 november 2026 och byts bara om sidan hos Arbetsförmedlingen läses om; nästa kontroll är årsrevisionen i januari.

---

## 5. Regeln för tal i exempel (gäller alla publika sidor, artiklarnas reklam och alla bilder)

1. **Tal om produkten, användarna eller utfall** (antal mallar, gratisgränser, dagar, antal konton, svarstider, hur många som får jobb) läses ur konstanten eller datan. Finns ingen källa stryks talet. Ett sådant tal hittas aldrig på, inte ens i en bild märkt Exempel.
2. **Exempelresultat i produktens egen form** (matchgrad, läsbarhetspoäng, "3 av 4 krav", "topp 15 %", veckans mål, betyg, datum) får stå i ett block märkt Exempel, med synligt ord eller med en `aria-label` som börjar "Exempel:". Formen ska finnas i produkten. Inga sådana tal i löptext.
3. **Exempelpersonens meriter** (Saras brev, CV, LinkedIn-profil och mejl) får ha antal och tid: tre år, tre projekt, fyra upphandlingar, två veckor före plan. **Belopp i kronor** (budget, omsättning, lön) och **procent som utfall** står aldrig i ny exempeltext.
4. **En källa per person.** Saras brev läses ur grundens `Brevpar.tsx` (och `SARA_KRAV`). Andra ställen citerar det ordagrant eller kortar det, men lägger aldrig till nya meriter. Samma merit har samma tal överallt.
5. **Arbetsgivare i ny exempeltext är grundens påhittade** (Nordhaga Bygg, Västlänken Konsult, Kustbyggarna, Dalvik Anläggning, Isberg Logistik, Polhem Ombyggnad, Nordanvind Energi). Riktiga namn står bara där sidans befintliga text har dem i dag.
6. **Befintlig text och befintliga exempeldata rörs inte av regeln**: de 89 breven, CV-exemplen, mallminiatyrerna och sidornas löptext, till exempel regel 2:s "Drev försäljningen från 2 till 12 mkr på två år" på /verktyg/personligt-brev.

Det här betyder regeln i koden i dag:

| Ställe | Besked |
|---|---|
| /verktyg/personligt-brev, hjältens brev, tonkorten, reglernas exempelrader, kravpanelen | "42 miljoner" är redan borta ur koden och står inte. "Jag har drivit fyra sådana" och "Fyra upphandlingar, en ombyggnad, två veckor till godo" står. Raderna 1729, 1768, 1770, 1792 och 1811 till 1814 i `nytt-innehall.md` gäller med koden som facit. |
| Brevkortet i artiklarna | Punkt 69. |
| `linkedin-optimering/page.tsx:256`, rubriken i bilden | Lydelse: Projektchef energi \| Offentlig upphandling enligt LOU \| Ombyggnader i tid och inom budget |
| `LinkedinOptimeringLiveDemo.tsx:143` | Lydelse för meningen: De senaste tre åren har jag drivit fyra upphandlingar enligt LOU och hållit ihop tidplan, budget och underentreprenörer i varje projekt. |
| `FunktionerSida.tsx:664`, LinkedIn-kortet | Lydelse: Projektledare bygg, offentlig upphandling enligt LOU, budgetansvar |
| Reklamkortet för träffen | Punkt 63. |
| Bli upptäckt, "Matrislogik, topp 15 %" och "Numeriskt, topp 30 %" | Står (regel 2, formen finns live i dag). |
| De gamla telefonskärmarna (`SkarmBrev.tsx`, `SkarmSkapaCv.tsx`, `SkarmLinkedin.tsx`) | P5 tar bort dem. Ritas någon av dem fortfarande på en publik sida stryks beloppet där på samma sätt. |

---

## 6. Undantagsfilen

`scripts/seo-baslinje/publikt-omgang3-undantag.json` är genomgången mot besluten ovan.

- **Borttaget:** inget. Inget av mina NEJ och inget ägarens gäller ett byte som har en rad.
- **Tillagt:** inga nya rader behövs. Ingen rubrik, FAQ-fråga, schemablock eller länkmål byts av besluten här: punkt 16, 26, 28, 49, 51, 53, 59 och 65 ändrar löptext, etiketter, underrader och länktexter; K1 rör bara `/register`, som grinden inte räknar; K8 behåller `/verktyg/cv-analys` i varje artikel genom Läs vidare; nya rubriker utanför artiklarna fäller inte.
- **Ändrat:** `_om` hänvisar nu till det här beskedet.
- Filen är kontrollerad som giltig JSON efter ändringen.

Fäller grinden ändå på något som står som JA här: lägg till raden med datum och skäl ur det här beskedet. Fäller den på något som inte står här är det ett fel i bygget och rättas i koden.

---

## 7. Kontrollistan för slutgranskningen

I den här ordningen, sidorna med mest trafik först. Allt mot ett produktionsbygge, en process i taget, aldrig mot produktionen.

1. **Artiklarna (152 st, 2 152 klick på 90 dagar):** rubrikträdet med samma id och ordning som i baslinjen, författarens h3 kvar, reklamkortens rubriker är stycken.
2. **Artiklarna:** första bilden är artikelbilden med samma `src` och alt; inget instrument eller mallminiatyr före den i HTML:en.
3. **Artiklarna:** alla länkmål från baslinjen finns kvar, också `/skapa-brev/start` genom reklamen och `/verktyg/cv-analys` genom Läs vidare; BlogPosting ändrad bara där undantagsfilen har en rad.
4. **`soka-jobb-via-mail`, `uppfoljning-efter-intervju`, `personligt-brev-jobbansokan`, `ai-jobbmatchning`:** de nya Jobbsöket-korten ersätter ett kort bara där det gamla kortets länkmål står kvar i artikeln; länken till `/verktyg/sokta-tjanster` finns.
5. **Ramen:** menyn, megamenyn, telefonmenyn och foten bär `data-site-chrome`, alla länkar står i serverns HTML också när menyn är stängd, ankartexterna enligt seo-krav, Priser som egen länk.
6. **Brevexemplen per yrke (89 sidor):** H1, H2 "Komplett exempel på 60 sek", brevets text serverrenderad ord för ord, `/skapa-brev/start?yrke=<yrke>` kvar i hjälten och kommentarskortet, "Se alla 40 brevmallar" till `/verktyg/personligt-brev`.
7. **CV-exemplen per yrke och mallsidorna under /cv-mallar:** alla h2 och h3 med samma text och nivå, FAQ kvar, ordantalet högst 2 procent lägre.
8. **/verktyg/rekryteringstester:** bara det listade rubrikbytet, HowTo-stegen lika med de synliga, provsidan kvar med `noindex`.
9. **/verktyg/jobbmatchning:** H1, titel, description, sju H2 och alla H3 utom steg 1 oförändrade, åtta frågor, R7-meningen ordagrant, länken "Håll koll på dina sökta jobb".
10. **/personligt-brev-exempel med kategorisidorna:** alla 89 kort och tio branschlänkar i serverns HTML, nio frågor, schemat oförändrat utom de listade raderna.
11. **/cv-mallar:** alla 74 yrkens H3 och länkar och alla 40 mallkort i serverns HTML (dolda med CSS eller `details`, aldrig `aria-hidden`), `id="yrken"` på avsnittet och fotens länk dit.
12. **/exempel, /jobbkartan, /for-rekryterare med insikterna:** samma rubriker, FAQ och ordantal (hård regel sedan i dag).
13. **Startsidan:** titel och description orörda, H1 och alla H2 och H3 kvar, fem frågor, länken till `/verktyg/sokta-tjanster` och "Så hjälper vi dig komma förbi" kvar, ordantalet inte lägre.
14. **/verktyg/personligt-brev och /verktyg/cv-analys:** åtta H2 och 25 H3, HowTo och åtta frågor ordagrant; cv-analysens h1-text exakt med kolon i DOM:en.
15. **/funktioner, /priser, /om-oss och övriga verktygssidor:** inga rubriker eller frågor borta, schemat bara enligt undantagsfilen, /om-oss inte under 6 ords tapp.
16. **/verktyg/sokta-tjanster:** status 200, index, canonical, title och description ordagrant, en h1, elva H2 i beskedets ordning, åtta frågor lika synligt och i FAQPage, HowTo lika med H3, BreadcrumbList, med i `/sitemap.xml`, inkommande länkar från ramen, `/`, `/funktioner`, `/priser`, jobbmatchningen, Jobbcoachen och de två artiklarna.
17. **Hela sajten, sök i HTML:en:** inga tankstreck, inget "42 miljoner" eller "40 miljoner", inget "Källa till varje svar", inga kampanjord i title, H1, description, FAQ eller schema.
18. **`noindex` kvar** på `/verktyg/rekryteringstester/prova`, `/skapa-brev/start`, `/artiklar?tag=cv` och `/artiklar?page=2`.
19. **Prestanda på de fem mest besökta mallarna** (artikel, brevexempel, CV-exempel, mallsida, startsidan): LCP-elementet är text eller bild med fasta mått, CLS 0.
20. **Grinden:** jämförelsen slutar på `Fel: 0`. Efter push: revalidera de rörda adresserna och ta nästa baslinje mot live dagen efter.
