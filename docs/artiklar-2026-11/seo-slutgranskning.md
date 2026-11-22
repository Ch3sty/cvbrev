# SEO:s slutgranskning av de tre artiklarna

Gjord 2026-11-22 av SEO, efter copywriterns texter. Jag har läst de tre filerna mot brieferna, inklusive saas-leads avsnitt 10 och mitt eget avsnitt 11. Källsidorna har jag läst om i dag. Där det behövdes för sökningen har jag rättat direkt i MDX-filerna. Stil och ton är copywriterns, och dem har jag lämnat.

Filerna:

- `content/artiklar/rotation-test-guide.mdx` (omskriven)
- `content/artiklar/aktivitetsrapport-arbetsformedlingen.mdx` (ny)
- `content/artiklar/cv-och-personligt-brev-samma-mall.mdx` (ny)

## Mekaniska kontroller (alla gröna efter mina rättningar)

| Kontroll | spatial | aktivitetsrapport | samma mall |
|---|---|---|---|
| seoTitle högst 60 tecken | 52 | 55 | 51 |
| description 110 till 158 tecken | 144 | 140 | 136 |
| FAQ i frontmatter lika med `<FAQItem>` (fråga och svar ordagrant) | 7 = 7 | 6 = 6 | 6 = 6 |
| howto lika med de synliga stegen | ingen howto | 5 = 5, ordagrant | 5 = 5, ordagrant |
| Tankstreck (em-dash) | 0 | 0 | 0 |
| Pipe-tabeller | 0 | 0 | 0 |
| Snabbsvaret först, under artikelbilden | ja, definitionen | ja | ja, sedan visaren |
| H1 (title) enligt briefen | ja | ja | ja |

**Rubrikträdet i `rotation-test-guide`:** alla H2 från i dag står kvar med samma text, i samma ordning. Tillkommit har snabbsvarets nya h2, H2 "Vad innebär hög spatial förmåga?" och H3 "Övningar för spatial förmåga i vardagen", alla tre med rader i undantagsfilen. Taggarna är orörda.

**Det som rankar i dag står kvar ordagrant:**
- "Hög spatial förmåga märks i yrken där man arbetar med ritningar, modeller och rum."
- "De övningar för spatial förmåga som lönar sig bäst ..."
- "Rotationstest är den vanligaste formen av spatialt test"
- H2 "Vad är spatial förmåga?" och H2 "Vad rotationstest mäter"
- alla sex gamla FAQ-frågor
- listraden "[Prova ett rekryteringstest utan konto](/verktyg/rekryteringstester/prova)", som bär länkmålet när hjälteknappen byter adress

**Läst som en sökare:** i alla tre får den som söker på huvudordet sitt svar i den första skärmen. "spatial förmåga" får definitionen i snabbsvaret. "aktivitetsrapport" får vad som ska med och datumen 1:a till 14:e. "cv och personligt brev mall" får ett ja, vad som ska vara lika och direkt därefter visaren.

---

## Beslut per punkt

### Spatial förmåga

**1. Längden, cirka 875 ord mer än i dag, och en ingress på 231 ord: godtas.** Inget av det nya är utfyllnad. Allt svarar på en sökfråga: definitionen, "spatial betyder", visuospatial, hög spatial förmåga och övningarna. De gamla styckena måste stå kvar för grindens och rankingens skull. Ingressen är lång men börjar med definitionen i första meningen, så den skadar inte. Jag kortar ingenting.

**2. Stycket om visuospatial förmåga står kvar. Källan om demensutredning stryks.**
- Meningen svarar på "visuospatial förmåga test" (5 visningar, position 7,6).
- Bilaga A (kognitiva förmågor) är ett nationellt kunskapsstöd för vårdpersonal. Den är rätt källa för att ordet används i vården, och den beskriver visuospatiala funktioner. Den länken får stå.
- Bilaga D (neuropsykologisk utredning vid misstänkt demens) bar bara bisatsen "bland annat i neuropsykologiska utredningar". Det är den länken som får en artikel om rekryteringstest att se ut att handla om demens.
- Jag strök därför bisatsen och bilaga D ur källraden. Stycket säger nu bara det som bilaga A bär.

**3. "Sex uppgifter med lösning" godtas.** Artikeln har sex lösta uppgifter utöver de två övningarna: rotationen i matrisform, L-formen, två pappersvikningar, tärningen och kropparna.

Att träningsformerna ur Uttal 2013 är strukna är rätt, eftersom sammanfattningen inte nämner dem. Psykologilexikonets "pussel, schack eller använda 3D-modelleringsprogram" har jag kontrollerat mot sidan i dag. Det står där.

Lydelsen som gäller överallt är **"direkt"**: "och du ser direkt vilka du fick rätt på". Det är saas-leads lydelse, och den står redan i FAQ 5 och i produktstycket. Jag ändrade meningen under den nya H2:n.

**4. Ankarlänken till "Vilka yrken kräver spatial förmåga?" är inlagd.**
- Id:t är `vilka-yrken-kraver-spatial-formaga`. Jag har kontrollerat det mot live-avtrycket (`publikt-omgang3-efter-live-3.json`), där rubriken har just det id:t. Innehållsförteckningen länkar redan dit.
- Ankartext: "yrkena där det väger tyngst".
- Grinden påverkas inte: ankarlänken finns redan bland sidans länkar i dag.

**5. `/verktyg/rekryteringstester/prova?typ=spatial` i löptexten: rätt.** Länken stämmer med mitt besked i brieferna 11.2.
- Den är ett nytt länkmål, och nya mål fäller inte grinden.
- Den enkla adressen står kvar i listan "Mer om rekryteringstester", så inget länkmål försvinner, också när hjälteknappen byter till `?typ=spatial`.
- Den listraden får inte ändras i den här omgången.

### Aktivitetsrapporten

**6. Källa B:** briefens faktatabell är uppdaterad. Rad 9 till 11 pekar på C, och B står som en adress som svarar med 301 till C. Artikelns källrad hade redan rätt (A och C).

**7. H3:n är inte längre sann, och den är ändrad.** Den hette "Intervjuer, arbete, studier och praktik" och heter nu **"Intervjuer, rekryteringsträffar, arbete och studier"**. Det är exakt Arbetsförmedlingens lista (källa A, läst i dag).
- Stycket under rubriken förklarar redan att praktik och arbetsträning står under vem som ska rapportera, och det får stå.
- HowTo-steg 4 ("intervjuer och andra aktiviteter") och FAQ 1 nämner inte praktik och är sanna som de står.
- Artikeln är ny, så rubrikbytet behöver ingen undantagsrad.

**8. Fyra fakta som saknades.** Jag läste C och A i dag. Alla fyra står där, och alla fyra ska in. De är nu rad 30 till 35 i faktatabellen, och jag har skrivit in dem i artikeln:
- **"I normalfallet" och utan handlingsplan.** Ny lydelse: "Du ska i normalfallet söka minst 6 lämpliga jobb per månad, om det inte står något annat antal i din handlingsplan. Handlingsplanen hittar du på Mina sidor. Har du ännu ingen handlingsplan, eller saknar den sökintervall, behöver du ändå söka jobb aktivt." FAQ 3 har fått "i normalfallet" i både frontmatter och `<FAQItem>`.
- **Lämpliga jobb.** Tillagt efter meningen om realistisk möjlighet: "Jobb som kräver en viss utbildning, utbildningsnivå, legitimation eller behörighet som du saknar räknas inte som lämpliga."
- **Deltid.** Nytt stycke: "Jobbar du deltid, eller är du av andra skäl inte arbetslös på heltid, kan det göra att du inte behöver söka lika många jobb." FAQ 3 har fått "Jobbar du deltid kan du behöva söka färre." i båda.
- **Heltid och brev om saknad rapport.** Tillagt i "Vad är en aktivitetsrapport ...": "Får du ändå ett brev om att din aktivitetsrapport saknas betyder det, enligt Arbetsförmedlingen, att du fortfarande är registrerad som arbetslös. Kontakta dem så ändrar de uppgifterna, eller skriv ut dig själv på Mina sidor."
- Kontrollerat samtidigt: "Handlingsplanen hittar du på Mina sidor", "också spontanansökningarna" och länken "Om du blir sjuk" står alla så på källsidorna.

**9. Ordantalet, 2 252 ord med tabellen och nu några ord till: godtas.** Målet var en bedömning. Orden över målet är källbelagda regler, ingen utfyllnad. Att två avsnitt ligger några ord under sina spann är ingen sökfråga.

**10. Arbetsgivarnamnen godtas.** Under tabellen står redan "Arbetsgivarna är påhittade". Namn som "Hasselgläntans Redovisning" är rimliga och lyfter inget varumärke. Jag kan inte utesluta att något av namnen finns i Bolagsverkets register. Byggaren söker därför de fem namnen i ett företagsregister innan artikelbilden ritas. Finns ett, byts det i tabellen, i bilden och i filnamnsexemplet "2026-10-06-Tallmons-Akeri-ansokan.pdf".

**11. `#manadsrapporten` finns.** `/verktyg/sokta-tjanster` har `<Sektion id="manadsrapporten">`, och `Sektion` skriver ut id:t på `<section>` (`src/components/publikt/v3/Sektion.tsx` rad 45). Tre länkar i löptexten till Sökta tjänster är bra, eftersom arkets och skalets länkar inte räknas som länkmål.

### CV och brev i samma mall

**12. Sidospalten.** Briefens 3.5 och 3.8 är rättade efter brevbilderna. I Kalksten, Granit, Sand och Ek följer spalten med till brevet med bara kontaktuppgifterna. Stål blir en ren spalt. Artikeln säger redan rätt, och visarens texter följer briefen.

**13. Målet gäller utan FAQ.** 1 988 ord löptext ligger inom 1 600 till 2 000, och det godtas.

**14. "26" i FAQ 6 godtas.** Regeln var inga mallantal i seoTitle, description eller FAQ-frågor, och talet står i ett svar. Det är talets enda förekomst. Vid mallomgången i december ska det uppdateras på två ställen i samma fil, frontmatter och `<FAQItem>`. Det står i byggarens lista.

**15. Citatet från "Skriva cv" och rådet om grundfil godtas.** Citatet "Välj den cv-mallen som bäst passar ihop med hur ditt personliga brev ser ut." står ordagrant på sidan i dag. Grundfil i stället för egen stil är ett bättre råd för den som inte arbetar med formatmallar.

**16. PDF men inte Word för de konstnärliga mallarna: behålls och mjukas upp.** Det stämmer mot katalogen i dag. Jag lade till "i dag": "De här mallarna finns i dag som PDF men inte som Word." Påståendet ska kontrolleras vid mallomgången i december.

---

## Mina ändringar, före och efter

| Fil | Före | Efter |
|---|---|---|
| rotation-test-guide | "Fem uppgifter nedan, utan konto och utan tidtagning, och när du är klar ser du vilka du fick rätt på." | "... och du ser direkt vilka du fick rätt på." |
| rotation-test-guide | "... och yrkena där det väger tyngst går vi igenom längre ned." | "... och [yrkena där det väger tyngst](#vilka-yrken-kraver-spatial-formaga) går vi igenom längre ned." |
| rotation-test-guide | "Visuospatial förmåga är ett närliggande ord som används i vården, bland annat i neuropsykologiska utredningar." | "Visuospatial förmåga är ett närliggande ord som används i vården." |
| rotation-test-guide | källraden med bilaga D (Neuropsykologisk utredning) | bilaga D struken |
| aktivitetsrapport | H3 "Intervjuer, arbete, studier och praktik" | H3 "Intervjuer, rekryteringsträffar, arbete och studier" |
| aktivitetsrapport | "Jobbar du redan heltid ska du berätta det för dem." | samma, plus meningarna om brev om saknad rapport (punkt 8) |
| aktivitetsrapport | "Du ska söka minst 6 lämpliga jobb per månad ... Handlingsplanen hittar du på Mina sidor." | "Du ska i normalfallet söka minst 6 ...", plus meningen om handlingsplan som saknas |
| aktivitetsrapport | "... realistisk möjlighet att få." | samma, plus meningen om lämpliga jobb och stycket om deltid |
| aktivitetsrapport, FAQ 3 (frontmatter och `<FAQItem>`) | "... söka minst 6 ..." och "Deltar du i ett program ..." | "... i normalfallet söka minst 6 ..." och "Jobbar du deltid kan du behöva söka färre. Deltar du i ett program ..." |
| cv-och-personligt-brev-samma-mall | "De här mallarna finns som PDF men inte som Word." | "De här mallarna finns i dag som PDF men inte som Word." |

Brieferna som har uppdaterats:
- `brief-aktivitetsrapport.md`: 3.5, källa B och rad 9 till 11, nya rad 30 till 35, och listan över det som inte får stå.
- `brief-cv-och-brev-samma-mall.md`: 3.5 och 3.8 om sidospalten.

---

## Det saas-lead särskilt bör titta på

1. **De nya meningarna om deltid och "i normalfallet" i aktivitetsrapporten.** De gör regeln mjukare än förut. Det är sant och rättvist mot läsaren, men saas-lead bör läsa att tonen fortfarande leder till Sökta tjänster utan att låta som en ursäkt.
2. **Källan om kognitiva förmågor (bilaga A) står kvar.** Om saas-lead ser en risk för förtroendet i att en sida om rekryteringstest länkar till ett vårddokument är alternativet att stryka stycket och källan helt. Då tappar vi en mening för en fråga med 5 visningar. Jag väljer att behålla; saas-lead får säga emot.
3. **Hjälteknappen i alla 16 testartiklar** (brieferna 11.2). Saas-lead bör se grindens resultat för de fem artiklar där den enkla adressen kan försvinna innan ändringen går ut till fler än `rotation-test-guide`.
4. **FAQ 5 och 6 i artikeln om samma mall** säger rakt att nedladdning av brevet ingår i Premium. Det ska stämma ordagrant med visarens fotrad.
5. **Arbetsgivarnamnen** (punkt 10) innan bilden ritas.

---

## Byggarens lista för sökningen

### A. Länkar in

Bara löptext. Rubriker, FAQ-frågor och taggar rörs inte. Varje rörd artikel tas med i avtrycket före och efter och behöver en `LD_UNDANTAG`-rad (se B).

**Till `rotation-test-guide`:** inga nya. `i-prov` ("[spatial förmåga]") och `logiska-tester` ("[rotationstest och spatial förmåga]") har redan ankare med huvudordet. Ankaret i `arbetspsykologiska-tester` ändras inte i den här omgången, så att vi slipper en grindrad för tre ord.

**Till `aktivitetsrapport-arbetsformedlingen`:**

| Sida | Var | Exakt ny mening |
|---|---|---|
| `/verktyg/sokta-tjanster` | sektionen `#manadsrapporten`, H2 "Underlag till din aktivitetsrapport", sist i löptexten före FAQ-delen (i `page.tsx`) | "Vad som ska med och hur du för listan går vi igenom i artikeln om [vad som ska med i aktivitetsrapporten](/artiklar/aktivitetsrapport-arbetsformedlingen)." |
| `/artiklar/soka-jobb-via-mail` | stycket som börjar "Inget svar betyder oftast ingenting alls", direkt före meningen "Efter en till två veckor är en kort påminnelse helt rimlig:" | "Samma logg är underlaget när du ska skriva [listan till aktivitetsrapporten](/artiklar/aktivitetsrapport-arbetsformedlingen)." |
| `/artiklar/saga-upp-sig` | sist i H2 "A-kassa när du säger upp dig själv", efter stycket "Den praktiska slutsatsen är enkel ..." | "Blir du arbetslös och inskriven hos Arbetsförmedlingen ska du också lämna [aktivitetsrapporten till Arbetsförmedlingen](/artiklar/aktivitetsrapport-arbetsformedlingen) varje månad." |

**Till `cv-och-personligt-brev-samma-mall`:**

| Sida | Var | Exakt ny mening |
|---|---|---|
| `/artiklar/cv-och-personligt-brev` | H2 "Testa våra mallar för CV och personligt brev", sist i stycket "Här kan du testa våra professionella mallar ..." | "Vill du att CV:t och brevet ser likadana ut går vi igenom hur i artikeln om [CV och personligt brev i samma mall](/artiklar/cv-och-personligt-brev-samma-mall)." |
| `/artiklar/skillnad-cv-personligt-brev` | H2 "Testa våra mallar för CV och personligt brev", sist i stycket "Här kan du testa våra professionella mallar ..." | "Hur du ger dem samma huvud, typsnitt och färg står i artikeln om [hur du får CV och brev att matcha](/artiklar/cv-och-personligt-brev-samma-mall)." |
| `/artiklar/personligt-brev-mall-gratis` | H2 "Word, PDF eller online?", sist i första stycket ("Svaret är PDF när du skickar ...") | "Ska brevet se ut som ditt CV väljer du [en mall för både CV och personligt brev](/artiklar/cv-och-personligt-brev-samma-mall)." |
| `/artiklar/personligt-brev-layout` | H3 "1. Typsnitt", efter stycket "Ditt typsnitt ska vara läsbart ..." | "Använd [samma typsnitt i CV och brev](/artiklar/cv-och-personligt-brev-samma-mall), så hör dokumenten ihop." |
| `/artiklar/soka-jobb-via-mail` | H2 "Bilagorna: PDF, filnamn och ordning", sist i stycket "**Professionella filnamn.** ..." | "Ger du dem också samma huvud och typografi hänger paret ihop, se [CV och brev i samma mall](/artiklar/cv-och-personligt-brev-samma-mall)." |

### B. Undantagsfilerna

1. **`scripts/seo-baslinje/spatial-formaga-2026-11-22-undantag.json`.** Exakt som i `brief-spatial-formaga.md` 8.3: META_BYTT för title och description, H1_BYTT, RUBRIK_NY med fyra rader (gamla och nya snabbsvarsrubriken, den nya H2:n och den nya H3:n) och LD_UNDANTAG för BlogPosting, BreadcrumbList och FAQPage. Ankarlänken till `#vilka-yrken-kraver-spatial-formaga` behöver ingen rad.
2. **`scripts/seo-baslinje/hjalteknapp-provtyp-2026-11-22-undantag.json`.** En LANK_BORTA-rad för `/verktyg/rekryteringstester/prova` per testartikel där grinden visar att den enkla adressen är borta. Det väntas gälla `cubiks-logiks-test`, `ordforstaelse-test` och `talserier`, och kanske `i-prov` och `stanine-testresultat`. Mallen för raden står i `brief-spatial-formaga.md` 11.2. Matrisartiklarna ska inte få någon rad, eftersom deras adress inte ändras.
3. **`scripts/seo-baslinje/artiklar-2026-11-lankar-in-undantag.json`.** En LD_UNDANTAG-rad per artikel i A: `soka-jobb-via-mail`, `saga-upp-sig`, `cv-och-personligt-brev`, `skillnad-cv-personligt-brev`, `personligt-brev-mall-gratis` och `personligt-brev-layout`. Varje rad har `"andrade": ["BlogPosting"]`, `"datum": "2026-11-22"` och skälet "Ny länk i löptexten till aktivitetsrapport-arbetsformedlingen eller cv-och-personligt-brev-samma-mall (SEO-slutgranskningen 2026-11-22); wordCount ändras. Rubriker, FAQ och taggar orörda." `/verktyg/sokta-tjanster` behöver ingen rad, eftersom en ny länk och fler ord inte fäller grinden. Lägg till `LANK_BORTA` bara om grinden visar att Läs vidare-korten trängt undan en artikel, med skälet att korten väljs automatiskt.
4. **De två nya artiklarna** finns inte i baslinjen. Ta deras första avtryck mot live dagen efter push.

### C. Komponenternas märkning

Detta är sammanfattningen av brieferna 11. Ingen komponent får ha h1 till h6 inuti, och ingen får vara `aria-hidden` som helhet.

- **`<CvOchBrevPar />`:** ytterst en `figure` eller en `div role="group"` med `aria-label="CV och personligt brev i samma mall"`. Arkens alt-text är "CV i mallen {namn}" och "Personligt brev i mallen {namn}". Miniatyrerna har `alt=""`, och knapparna har `aria-label`. Ingen bild med `priority`, bilderna laddas lazy och ingen bild får ligga före artikelbilden. Bara Linne står i HTML:en, så bara `/skapa-brev/start?mall=linne` och `/cv-mallar/prova?mall=linne` syns där. Reserverad höjd, ingen iframe.
- **`<ManadsbladArtikel />`:** `role="group"` med `aria-label="Exempel: månadsrapporten för oktober"`. Avsnittsrubrikerna skrivs som `p` eller `strong`. Bara de grå strecken är `aria-hidden`. Inga länkar, knappar, bilder eller priser. Serverkomponent. Antalen ska vara 4 annonserade jobb, 1 spontanansökan och 1 intervju, räknade ur tabellen.
- **`<LoggaSoktJobb />`:** en `aside` med `aria-label="Logga sökt tjänst"`. Textfälten har inga `name`-attribut. Formuläret får `action` till `SOKT_KONTO_HREF`, så att det utan JavaScript inte laddar om artikeln med `?lage=sokt`. Fälten är tomma från början, och inga id får krocka med andra på sidan.
- **Skalet:** sluggen `aktivitetsrapport-arbetsformedlingen` läggs i `JOBB_KORT_SLUGAR` och får korten för Sökta tjänster. Skippa-regeln för inline-kortet gäller bara artiklar som har `<CvOchBrevPar />`. Kör `scripts/audit-cta-clusters.ts`. Ändring ska synas bara för de två nya sluggarna och, för hjälteknappen, för testartiklarna.

### D. Bilderna

- **`aktivitetsrapport-arbetsformedlingen-v2.webp`:** kör `scripts/artikelbild/` efter punkt 10 (kontrollen av arbetsgivarnamnen). Raderna i bilden ska stå ordagrant i tabellen, till exempel "2 okt", "Ekonomiassistent", "Hasselgläntans Redovisning", "Annons". Inga myndighetsnamn. Etikett "Sökta jobb i oktober". `imageAlt` och `CustomImage`-alt är redan lika.
- **`cv-och-personligt-brev-samma-mall-v2.webp`:** huvudet ordagrant ur CVExample-rutan: "Erik Lindberg", "Projektledare inom IT", "erik.lindberg@email.se · 073-456 78 90 · Stockholm". Ritas först när brevbilderna har fått samma kontaktuppgifter (saas-lead 10.2).
- **`rotation-test-guide`:** ingen ny bild.
- Ingen av de två nya artiklarna får gå ut förrän deras bildfil finns.

### E. Avläsning i Search Console

Räkna från pushdagen (P). Exemplen nedan räknar med push 24 november.

| När | Sida | Frågor och mått | Gräns för beslut |
|---|---|---|---|
| P + 7 (1 dec) | de två nya | URL-inspektion: indexerad, Googles kanoniska adress lika med vår | Inte indexerad: begär indexering och kontrollera sajtkartan |
| P + 14 (8 dec) | rotation-test-guide | visningar per dag på sidan; "spatial förmåga", "vad är spatial förmåga", "hög spatial förmåga" | Under 5 visningar om dagen: läs med saas-lead |
| P + 28 (22 dec) | rotation-test-guide | samma frågor plus "spatial förmåga test", "spatial förmåga övningar" och "rotationstest"; klickfrekvens och position | Jämför med 23 okt till 9 nov (13 till 42 visningar om dagen på sidan). Mål: klickfrekvens över 1 procent på "spatial förmåga", och "rotationstest" kvar under position 3 |
| P + 28 (22 dec) | aktivitetsrapport | alla frågor med "aktivitetsrapport", "sökta jobb", "hur många jobb" och "arbetsförmedlingen" | Inga visningar alls efter 28 dagar: kontrollera indexering och länkarna in |
| P + 28 (22 dec) | cv-och-personligt-brev-samma-mall | de tio varianterna med "cv", "brev" och "mall" (93 visningar på 90 dagar i dag) | Kannibalisering: om `cv-och-personligt-brev` och den nya delar samma fråga, och om "personligt brev mall" har flyttat från `personligt-brev-mall-gratis` |
| 12 jan | alla tre | samma frågor, 90 dagar, tillsammans med avläsningen av CV-klustret | Beslut om visaren ska in i `cv-och-personligt-brev` (saas-lead 10.8) och om hjälteknappen ska behållas |

### F. Att göra vid mallomgången i december

Uppdatera "26" i FAQ 6 (frontmatter och `<FAQItem>`), "40" i 3.7 och "i dag som PDF men inte som Word" i 3.8 i `cv-och-personligt-brev-samma-mall.mdx` om katalogen ändras.

---

## Saas-leads slutläsning och byggorder (2026-11-22)

Läst: de tre MDX-filerna som de står efter SEO:s rättningar, mot koden på main (2ca18b61, samma som live). Jag har läst för konvertering och för att det som sägs om produkten är sant. Sökningen är SEO:s, och där har jag inga invändningar.

### 1. Sanningen mot koden: inga rättningar behövdes

Jag har inte ändrat något i MDX-filerna. Varje påstående om produkten håller:

| Artikel | Påstående | Belagt i |
|---|---|---|
| spatial | provet: fem uppgifter, inget konto, ingen tidtagning | `src/lib/tests/prov-typer.ts` (spatial.ingress) |
| spatial | "ser direkt vilka du fick rätt på" | `ArtikelProv.tsx`: rätt och fel per uppgift efter provet, före kontot |
| spatial | ett grundnivåtest om dagen i valfri testtyp | `GRUND_TEST_TYPER` och `checkGrundnivaQuota` i `quotaService.ts` |
| spatial | avancerad och expert ingår i Premium | featuren `tests_above_base` |
| aktivitetsrapport | logga gratis med konto, välja datum själv | `LoggaArkPublik.tsx` (datumfältet, högst i dag), produktfacit |
| aktivitetsrapport | bladet i tre avsnitt, dagar kvar till sista inlämningsdag | `Rapport.tsx` rad 71 och 343 till 347 |
| aktivitetsrapport | en genomförd intervju hamnar i tredje avsnittet | `afRapportData.ts`: händelserna `interview_completed` och `trial_work_completed` |
| aktivitetsrapport | gratis: antalen och delningslänken med antalen; Premium: raderna, utskriften, kopieringen och listan i länken | `Rapport.tsx` (`SparrRam`), `api/applications/share/route.ts` rad 80 |
| aktivitetsrapport | Ska sökas räknas aldrig, vi skickar ingenting | produktfacit, `sokta-tjanster-data.ts` |
| samma mall | brev i samma 40 mallar som CV:t, med samma namn | `brevmall/katalog.ts` bygger på `MALL_KATALOG` |
| samma mall | brevet börjar i CV:ts mall bara om CV:t är byggt i CV-byggaren och mallen är tillåten, annars i Linne | `startmallForBrev` och `cvMallUrStrukturerad` i `brevRegler.ts`, `BREV_FORVALD_MALL = 'linne'` |
| samma mall | samma typsnitt i CV och brev från start | `brevmall/render.ts` rad 8: huvud, typsnitt, färger och linjer blir CV-mallens |
| samma mall | första brevet gratis, sedan ett per rullande sju dygn | `FREE_LETTERS_PER_ACCOUNT = 1`, `LETTER_WINDOW_DAYS = 7` |
| samma mall | nedladdning av brevet, PDF eller Word, ingår i Premium | `letter_download`, 402 i `api/letters/download/route.ts` |
| samma mall | familjerna: en spalt störst (17), sidospalt (5), marginal (4), konstnärliga (14); Mörkrum och Kvadrat utan Word | `MALL_KATALOG` |

### 2. Placeringen: som beslutat

- **Spatial.** Inget kort och ingen knapp står före definitionen. `<ArtikelProv>` står efter "Vad innebär hög spatial förmåga?", med hänvisningen i löptext. `<TypProvKort>` står direkt efter stycket om de tre nivåerna, före den nya H3:n om vardagsövningar. Det är inte exakt "sist i Så tränar du" som jag skrev, men kortet står intill stycket som beskriver det kortet säljer, och det står inte före något svar. Godkänt.
- **Aktivitetsrapport.** Premium nämns bara i "Underlaget från Sökta tjänster". `<LoggaSoktJobb />` står under "Kalkylark, anteckningar eller ett verktyg", efter rådet och exempeltabellen. `<ManadsbladArtikel />` står i produktavsnittet. Godkänt.
- **Samma mall.** `<CvOchBrevPar />` står direkt efter snabbsvaret. Länken i 3.3 och de två vägarna i "Så får du CV och brev i samma mall hos oss" är sanna. Godkänt.

### 3. SEO:s fem punkter

1. **Deltid och "i normalfallet": godkänt utan ändring.** Meningarna gör regeln sann, inte mjuk. Avsnittet slutar fortfarande i "Sex är alltså ett golv ... Ditt eget antal står i handlingsplanen", och vägen till Sökta tjänster ligger i avsnittet om listan, där den hör hemma. En artikel som överdriver kraven säljer inte bättre. Den förlorar förtroendet hos den som vet bättre.
2. **Bilaga A står kvar: enig med SEO.** Meningen är neutral, bär ingen produktuppgift och står i definitionsavsnittet, långt från provet. Jag ser ingen förtroenderisk som väger mer än frågan den svarar på.
3. **Hjälteknappen i testartiklarna: kör.** Rätt prov i hjälteknappen väger tyngre för konverteringen än en extra länk till matrisprovet. LANK_BORTA-raderna godtas för de fem artiklarna. Mitt villkor: varje artikel som tappar den enkla adressen ska fortfarande länka till `/verktyg/rekryteringstester` någonstans i texten. Byggaren kontrollerar det i efter-avtrycket. Saknas länken går artikeln ur ändringen i den här omgången.
4. **Visarens fotrad: ordagrant ur FAQ 5 och 6.** Fotraden är de två meningarna "Hos oss är mallarna Linne och Björk gratis för båda dokumenten." och "Att ladda ner brevet ingår i Premium, oavsett om du väljer PDF eller Word." Inga nya ord, så att fotraden och FAQ inte kan glida isär. Ändras FAQ ändras fotraden samtidigt.
5. **Arbetsgivarnamnen: enig med SEO:s ordning.** Klart när de fem namnen är sökta ordagrant hos Bolagsverket eller på allabolag.se utan träff. Ett namn med träff byts i tabellen, bilden, filnamnsexemplet och `ManadsbladArtikel` samtidigt.

### 4. Byggorder, fortsättning på A till F

Ordning: G först (den styr bilderna), sedan H till L i valfri ordning. De två nya artiklarna går ut tillsammans med sina komponenter, aldrig före.

Regler för hela bygget:
- Grunden i `docs/publikt-omgang3/bygg/grunden.md`: fyra rumsfärger, koppar som enda accent och exakt en kopparknapp per skärmyta, knappar med klack, inget beige, svart eller grafit, inga hex, inga hårdkodade tal, inga inloggade komponenter importerade.
- Minst 12 px text, 44 px på allt som trycks, CLS 0, inga h1 till h6 i komponenterna.
- Testning enligt ägarens regel: under arbetet bara tsc och berörda vitest. En gång före push: bygge, full vitest, seo-diff, `scripts/perf-publikt.ts` på de tre artiklarna och klicktest i Chrome på 1440 px och Pixel 7.
- Ingen testlast mot produktionsdatabasen.

**G. Samma kontaktuppgifter i exempel-CV och exempelbrev, och 40 nya brevbilder (S).**
- Vad: `EXEMPEL_AVSANDARE` i `src/lib/letters/brevmall/exempel.ts` får telefon `073-456 78 90` och e-post `erik.lindberg@email.se`, samma som `SHOWCASE_CV.kontakt` i `src/lib/cv/showcase-exempel.ts`. Läs helst värdena därifrån i stället för att skriva dem två gånger. Rita om de 40 bilderna i `public/mallar/brev/` med `scripts/brevmallar-miniatyrer.ts`. CV-bilderna rörs inte.
- Händelser: inga.
- Klart när: brevbilden och CV-bilden för samma mall visar samma namn, titel, telefon, e-post och ort i huvudet (titta på Linne, Kalksten, Kolumn och Mörkrum), brevruttens och brevmallarnas tester är gröna, och inga andra exempeltexter har ändrats. Artikelbilden för samma mall (D) ritas först därefter.

**H. `<CvOchBrevPar />`, CV och brev bredvid varandra i samma mall (M).**
- Filer: ny `src/components/artiklar/CvOchBrevPar.tsx` (serverdel som läser katalogen) och en liten klientö för valet. Den registreras som MDX-komponent i `src/app/(public)/artiklar/[slug]/page.tsx`.
- Bygger på: `MallMiniatyr` i `src/components/publikt/v3/MallMiniatyr.tsx` för bilderna (CV med `storlek="stor"`, 300 × 424; brev med `typ="brev"`, 480 × 679), `formatMarke` och `Chip` för nivå och format, och `Kort` och `Knapp` ur grunden. Inga iframes.
- Utseendet hämtas från två befintliga visare. **`BrevVisare`** (`src/components/publikt/brevvisare/`) ger miniatyrraden, svepet, laddningen (det gamla arket ligger kvar nedtonat tills det nya har laddat och tonas in) och första vyn i HTML med `noscript` som gömmer reglagen. **`MallVisningCv`** (`src/components/artiklar/MallVisningCv.tsx` via `MallVisningar.tsx`) ger artikelramen, raden ovanför arken och fotraderna under.
- Mallarna, i den här ordningen: Linne, Björk, Kalksten, Granit, Kolumn, Årsring, Mörkrum, Kvadrat. Det är artikelns fyra familjer två och två, och namnen som avsnittet "Vilka mallar fungerar för både CV och brev?" nämner. Id och namn läses ur `MALL_KATALOG`, aldrig hårdkodade namn.
- Uppbyggnad i dator (behållaren 700 px eller bredare):
  - Ett `Kort` i sidans färg (brev, plommon, som artikeln).
  - Överst en liten rad: mallens namn i fet stil, `Chip` Gratis eller Premium och formatmärket ("PDF · Word" eller "PDF").
  - Därunder de två arken bredvid varandra med 16 px mellanrum, CV:t till vänster och brevet till höger, lika höga (CV-arket skalat till brevarkets höjd). Ovanför vart och ett en etikett i 12 till 13 px: "CV" och "Personligt brev". Arken har grundens klack.
  - Under arken miniatyrraden: de åtta mallarna som CV-miniatyrer (`storlek="liten"`, namn under, inget chip) på en rad.
  - Därunder knappen och textlänken på samma rad, sist fotraden och länken "Se alla mallar" till `/cv-mallar`.
- Uppbyggnad i telefon (smalare än 700 px):
  - Samma ordning. Arken står fortfarande bredvid varandra, vart och ett halva bredden minus 6 px, så att huvudena syns sida vid sida. Texten i arken behöver inte gå att läsa.
  - Miniatyrraden blir en vågrät rad som rullar i sig själv med scroll-snap, 64 px breda miniatyrer, aldrig vågrät rullning av sidan.
  - Svep åt vänster eller höger på arken byter mall som i `BrevVisare` och stannar i ändarna.
  - Knappen tar hela bredden (`Knapp bred`), och textlänken står under. Kontrollera på 360 px.
- Valt läge i miniatyrraden: tjockare kant i `--kant-stark`, namnet i `--ink-1` och `aria-pressed="true"`. Ingen koppar på valet, kopparn är knappens.
- Knappen: `Knapp variant="koppar" pil` med texten "Skriv brevet i {mallens namn}" till `/skapa-brev/start?mall={id}`. Textlänken: "Bygg CV:t i {mallens namn}" till `/cv-mallar/prova?mall={id}`. Båda följer valet. Inget pris i komponenten.
- Rad för fotomallar: har den valda mallen foto i CV:t (`foto` i katalogen, till exempel Björk och Granit) står meningen "Våra brevmallar har ingen fotoplats, inte ens när CV-mallen har en." under arken. Meningen står redan i artikeln.
- Fotraden: "Hos oss är mallarna Linne och Björk gratis för båda dokumenten. Att ladda ner brevet ingår i Premium, oavsett om du väljer PDF eller Word." (punkt 3.4 ovan). Gratismallarnas namn ur `BREV_GRATIS_NAMN`.
- Märkning enligt C. Alt-texterna är "CV i mallen {namn}" och "Personligt brev i mallen {namn}". Bilderna laddas lazy, så att artikelbilden förblir LCP.
- Händelser (inga personuppgifter, bara mall och sida):
  - `mallvisning_visad` `{ slug, template: 'linne', typ: 'par' }` när komponenten kommer i bild.
  - `mallvisning_mall_bytt` `{ slug, template, typ: 'par', hur: 'miniatyr' | 'svep' | 'kant' }`.
  - `mallvisning_klick` `{ slug, template, typ: 'par', mal: 'brev' | 'cv' }` på knappen och textlänken.
  - `typ` i `src/lib/analytics/events.ts` utökas med `'par'`, och `mallvisning_klick` får fältet `mal`.
  - Efter klicket mäter startflödet som i dag (`sample_started` med `template`, `draft_claimed` med `template`).
- Klart när:
  - Utan JavaScript syns Linne i båda arken, och båda länkarna har `mall=linne`.
  - Alla åtta mallar byter båda arken och båda adresserna samtidigt.
  - Inget vågrätt rullande på 360 px, och CLS är 0.
  - Artikelns LCP är oförändrad mot före.
  - Ett vitest renderar komponenten och hittar båda alt-texterna och båda adresserna med `mall=linne`.
  - I klicktestet på 1440 px och Pixel 7 öppnar knappen för Kalksten `/skapa-brev/start?mall=kalksten` med Kalksten vald.

**I. Skalets reklam i de två nya artiklarna (S, krav före publicering).**
- `aktivitetsrapport-arbetsformedlingen`: taggarna ger klustret `generic`. Utan ändring får artikeln hjälteknappen "Välj en mall" till `/cv-mallar`, ett injicerat CV-mallkort efter andra stycket, gratiskortet sist och den klistrade mobilknappen "Välj en mall". Kraven:
  - sluggen läggs i `JOBB_KORT_SLUGAR` (`'sokta'`),
  - hjälteknappen och mobilknappen blir `JOBB_KORT.sokta` ("Håll koll på sökta jobb", `/verktyg/sokta-tjanster`),
  - inget inline-kort injiceras,
  - gratiskortet visas inte, eftersom Jobbsökets kort är slutkortet.
  - Färgen är redan skog (`generic` ger `jobb`).
- `cv-och-personligt-brev-samma-mall`: klustret `letter` injicerar kortet "Skriv det personliga brevet på annonsen, inte på mallen" efter andra stycket, alltså direkt efter visaren. Krav: `injectClusterCta` hoppar över artiklar som innehåller `<CvOchBrevPar` eller `<LoggaSoktJobb`. Det senare täcker aktivitetsrapporten, så skippregeln i C gäller båda artiklarna. Hjälteknappen och slutkortet står kvar som i andra brevartiklar.
- Händelser: oförändrade (`article_cta_shown` och `article_cta_clicked` från korten).
- Klart när:
  - `scripts/audit-cta-clusters.ts` visar ändring bara för de två sluggarna.
  - I den renderade HTML:en för aktivitetsrapporten finns ingen `/cv-mallar` i hjältebilden, mobilknappen eller korten.
  - I artikeln om samma mall finns bara ett produktblock före första H2, och det är visaren.

**J. `<LoggaSoktJobb />`, arket i aktivitetsrapporten (S).**
- Vad: `LoggaArkPublik` ur `src/app/(public)/verktyg/sokta-tjanster/LoggaArkPublik.tsx` som det är, i en `aside` med märkningen i C. Arkets CSS ur `sokta-tjanster.css` laddas med komponenten. Arkets fält och text ändras inte. Formulärets `action` och fältens id enligt C.
- Händelser: `sample_completed` `{ kind: 'sokt', surface: 'artikel' | 'verktyg', slug }` när arket skickas, utan tjänst, arbetsgivare eller datum. `kind` i `events.ts` utökas med `'sokt'`. Samma händelse på verktygssidan med `surface: 'verktyg'`.
- Klart när:
  - Arket fungerar utan JavaScript (formuläret leder till `SOKT_KONTO_HREF`).
  - Med JavaScript sparas utkastet, och efter registrering med ett testkonto finns det sökta jobbet i kontot via välkomstsidan (klicktest på Pixel 7, testkontot raderas per id efteråt).
  - PostHog-händelsen har inga fältvärden.

**K. `<ManadsbladArtikel />`, månadsrapporten som ett gratiskonto ser den (S).**
- Vad: serverkomponent utan JavaScript.
  - Överst "Oktober 2026" och raden "5 sökta jobb och 1 intervju under perioden", räknad ur tabellen.
  - Sedan de tre avsnitten med produktens rubriker ("1. Sökta annonserade jobb", "2. Intresseanmälningar och spontanansökningar", "3. Intervjuer och provjobb") och antalen 4, 1 och 1 ur artikelns tabell.
  - Under varje avsnitt lika många grå streck som antalet (`aria-hidden`), och en rad "Raderna ingår i Premium".
  - Sist de tre uttagen som text med märkning: "Skriv ut eller spara som PDF" Premium, "Kopiera som text till AF-rapporten" Premium och "Dela med en länk" med antalen gratis.
- Bygger på: bladet och uttagslistan i sektionen `#manadsrapporten` på `/verktyg/sokta-tjanster` (klasserna `st-blad` och `st-uttag`, `Chip` gratis och premium) och mönstret med grå streck för låsta rader i `src/components/jobb3/sokta/Rapport.tsx`. `Rapport.tsx` är inloggad kod och importeras inte (grunden 6); mönstret ritas om i CSS. Verktygssidan rörs inte. Inga länkar, knappar, bilder eller priser.
- Händelser: inga.
- Klart när: antalen stämmer mot tabellen, texten går att markera och läses av skärmläsare, det finns inga rubrikelement, och 360 px har ingen vågrät rullning.

**L. Hjälteknappen öppnar artikelns prov (S).**
- Vad: `hjalteKnapp` i `src/components/publikt/innehall/artikel-kluster.ts` får artikelns provtyp, läst ur första `<ArtikelProv typ="...">` i MDX, och länkar till `/verktyg/rekryteringstester/prova?typ={typ}`. Matrisartiklarna behåller adressen utan parameter.
- Texten "Prova fem uppgifter gratis" är sann för alla typer utom I-provet, som har sex uppgifter. Där blir texten "Prova sex uppgifter gratis"; copywritern bekräftar ordet.
- Händelser: `article_cta_clicked` som i dag, med `position: 'hjalte'` och den nya adressen som `target`.
- Klart när:
  - De tio artiklarna med en annan provtyp än matris får rätt adress, och matrisartiklarna är oförändrade.
  - seo-diff visar bara de LANK_BORTA-rader som B.2 väntar.
  - Varje sådan artikel länkar fortfarande till `/verktyg/rekryteringstester` (punkt 3.3).

### 5. Uppföljning, bredvid SEO:s avläsning i E

PostHog räknar publika besök först vid interaktion sedan 23 september, så andelar läses mot `article_viewed`, inte mot GA. Volymerna är små. Inget beslut fattas på färre än 100 artikelvisningar; då väntar avläsningen till nästa datum.

| När | Artikel | Tal (PostHog om inget annat står) | Gräns för beslut |
|---|---|---|---|
| P + 14 (8 dec) | alla tre | att händelserna kommer in: `mallvisning_visad` med `typ: 'par'`, `sample_completed` med `kind: 'sokt'`, `article_cta_clicked` från hjälteknappen med `?typ=spatial` | Saknas en händelse: rätta mätningen, inget annat |
| P + 28 (22 dec) | rotation-test-guide | andelen visningar som startar provet (`sample_started` från sidan), spärr till konto (`signup_gate_shown` till `signup_completed` med källsidan), klick på hjälteknappen och på provkortet. Utgångsläge 30 dagar före push: 29 visningar, 11 klick, 2 provstarter, 1 påbörjad registrering | Färre provstarter per visning än före: läses med SEO om placeringen |
| P + 28 (22 dec) | aktivitetsrapport | andelen visningar som skickar arket, registreringar med källsidan, och i Supabase andelen av de kontona som har ett sökt jobb dag 1 och som öppnar månadsrapporten | Under 3 procent som skickar arket efter 100 visningar: pröva arket högre upp i avsnittet |
| P + 28 (22 dec) | samma mall | andelen som byter mall i visaren, klick på "Skriv brevet" och "Bygg CV:t", `draft_claimed` med mall från artikeln, och för de kontona `paywall_shown` vid nedladdning av brevet och betalning inom 14 dagar (Stripe, `subscription_paid`) | Under 5 procent klick per visning efter 100 visningar: art-director tittar på visaren |
| 12 jan | alla tre | samma tal över hela perioden, och intäkten från konton med någon av de tre som landningssida (`profiles.acquisition_source.landing_path`) | Här tas beslutet om visaren ska in i `cv-och-personligt-brev` (brieferna 10.8), tillsammans med SEO |

### 6. Oenighet

Ingen. Alla mina punkter rör produkten och konverteringen, och SEO:s besked om sökningen står.

---

## SEO:s besked före push (2026-11-22)

**Beskedet är JA.** Det finns inget som måste rättas före push. Tre saker ska göras i samband med push (punkt 6), och några ändringar tar vi efter push (punkt 7).

Underlag: byggnoterna (`bygg-noter.md`), grindens rapport `docs/qa/seo-diff/artiklar-2026-11-diff.md` (Fel 2), avtrycken `artiklar-2026-11-efter.json` och `artiklar-2026-11-nya.json`, och undantagsfilerna `artiklar-2026-11-lankar-in-undantag.json`, `spatial-formaga-2026-11-22-undantag.json` och `hjalteknapp-provtyp-2026-11-22-undantag.json`. Läsvidare-urvalet har jag räknat om ur koden (`relateradeArtiklar` i `src/app/(public)/artiklar/[slug]/page.tsx`). Search Console för de undanträngda sidorna hämtade jag i dag (28 dagar, 2026-10-24 till 2026-11-20).

### 1. De 136 LANK_BORTA och 4 RUBRIK_BORTA: den vanliga följden, godkänt

**Varför det blir så:** "Läs vidare" tar först artiklar med flest gemensamma taggar. Är de färre än tre fylls listan på med de nyaste artiklarna. De två nya artiklarna är nu de nyaste. Enligt min omräkning hamnar aktivitetsrapporten i Läs vidare på 70 sidor, men bara 6 av dem genom en gemensam tagg; de andra 64 är påfyllnad. Artikeln om samma mall hamnar på 51 sidor, varav 1 genom tagg. Platserna de tar hade de förra nyaste artiklarna från 14 november. Det har hänt vid varje publicering, och grinden har haft samma slags rader förut (till exempel när talserier, ordforstaelse-test och i-prov trängde undan kort på rotation-test-guide den 10 november). Artikellistans fyra RUBRIK_BORTA är kort som flyttar till nästa sida.

**Vilka länkmål som försvann och vad det kostar:**

| Länkmål | Försvunna länkar | Länkas kvar från | 28 dagar (klick, visningar, position) | Bedömning |
|---|---|---|---|---|
| `/artiklar/intervjufragor-sjukskoterska` | 50 | 7 sidor: `/artiklar`, `intervjufragor-underskoterska`, `kompetensbaserade-intervjufragor`, `strukturerad-intervju`, `kompetensbaserad-intervju-star-metoden`, `/authors/helena`, `/personligt-brev-exempel/sjukskoterska` | 8, 147, 4,8 | Inga förlorade länkar som spelar roll |
| `/artiklar/intervjufragor-underskoterska` | 26 | 7 sidor, samma mönster, plus `/personligt-brev-exempel/underskoterska` | 13, 246, 4,7 | Inga förlorade länkar som spelar roll |
| `/artiklar/cubiks-logiks-test` | 38 | 31 sidor, bland dem `logiktest-tips` och `tester-hos-myndigheter` | 2, 71, 5,0 | Inga förlorade länkar som spelar roll |
| `/artiklar/angest-jobbet-dags-att-byta` | 2 | 8 sidor i ångest- och karriärbytesklustret | 1, 250, 38,4 | Inga förlorade länkar som spelar roll |
| `/artiklar/personligt-brev-innehall-checklista` | 2 | 16 brevartiklar | 0, 139, 4,9 | Inga förlorade länkar som spelar roll |
| övriga 17 mål (taggsidor, `?page=17`, enstaka artiklar) | 1 eller 2 var | | | Följer av att listan rullar vidare |

De två artiklarna med intervjufrågor är de enda med klick som tappar många länkar. Ändå blir ingen artikel med klick sämre länkad på ett sätt som spelar roll:

- De länkar som försvann satt i Läs vidare på artiklar om CV, tester och LinkedIn, alltså utanför ämnet.
- Alla länkar som hör till ämnet står kvar: intervjuklustrets två hubbar, STAR-artikeln, varandra och brevexemplet för samma yrke.
- Båda artiklarna är indexerade och rankar redan på position 4,7 till 4,8.

**Urvalet för de nya artiklarna är svagt, men det är inte nytt och stoppar inte push.** Aktivitetsrapporten visas i Läs vidare på `ats-vanligt-cv`, `nyckelord-i-cv` och testartiklarna, där den inte hör hemma. Det har varit samma för varje ny artikel, och för sökningen är det snarast till hjälp den första tiden: länkarna gör att de nya sidorna hittas och genomsöks snabbare. Rättningen gör vi efter push (punkt 7.1) och inte genom att ändra taggar, eftersom taggarna är länkar till taggsidor och väljer författare.

### 2. Hjälteknappen i de fem testartiklarna: stämmer med mitt besked

`hjalteknapp-provtyp-2026-11-22-undantag.json` har exakt de fem rader jag väntade: `cubiks-logiks-test`, `ordforstaelse-test`, `talserier`, `i-prov` och `stanine-testresultat`, alla för `/verktyg/rekryteringstester/prova`. Matrisartiklarna har ingen rad och samma adress som förut. Alla fem länkar fortfarande till `/verktyg/rekryteringstester` (saas-leads villkor, enligt byggnoterna), och den nya adressen med `?typ=` är ett nytt länkmål. I `rotation-test-guide` står den enkla adressen kvar i listan längst ned, och artikeln behöver ingen rad.

### 3. De två kvarvarande felen (ogImage): godtas, avgörs av avtrycket mot live

Felen gäller `/verktyg/bli-upptackt` och `/verktyg/personlighetstest`. Sidorna är orörda i bygget. Felet är att live saknar og:image och det lokala bygget har en, och samma två rader föll i förra omgångens lokala bygge innan live gav Fel 0. Det rör inte rankingen. Två villkor:

- I avtrycket mot live dagen efter push får de två raderna vara antingen oförändrat tomma eller fyllda med verktygens bild. Allt annat på de två sidorna ska vara oförändrat.
- **Att live saknar og:image på två verktygssidor är ett fel i sig** (delningar i sociala medier får ingen bild). Det läggs som ett eget ärende efter push (punkt 7.2). Det stoppar inte den här pushen.

### 4. Byggarens avvikelser: ingen påverkar sökningen

- **`action="/register"` med redirect i ett dolt fält.** Det är bättre än min lydelse. Utan JavaScript landar formuläret på `/register`, inte på en ny variant av artikelns adress, och grinden räknar inte `/register` som länkmål. Tjänst och arbetsgivare kommer aldrig in i adressen (textfälten saknar `name`). Att datumfältet är förifyllt med dagens datum är också i sin ordning.
- **Länkmeningen sist i stycket i saga-upp-sig och personligt-brev-layout.** Det är samma ankare och samma avsnitt. Ingen skillnad för sökningen.
- **Artikelbilden till samma mall utan kontaktraden.** Alt-texten och `imageAlt` är oförändrade, och raderna som syns står ordagrant i artikeln. Ingen skillnad för sökningen.

### 5. De två nya sidorna: jag har läst avtrycket själv, och det räcker

Jag har läst `artiklar-2026-11-nya.json` för båda sidorna:

- status 200, `index, follow`, canonical till den egna adressen
- title och description ordagrant som i brieferna
- en h1
- rubrikträdet i briefernas ordning, med den rättade H3:n "Intervjuer, rekryteringsträffar, arbete och studier"
- sex FAQ-frågor, synliga och i FAQPage
- typerna BlogPosting, BreadcrumbList, FAQPage och HowTo

Första bilden är författarporträttet, sedan artikelbilden. Det är samma ordning som i alla befintliga artiklar (i live-avtrycket har till exempel `rotation-test-guide` och `talserier` Lindas porträtt först), så det stämmer med skalet. I samma mall kommer visarens bild (`/mallar/v2/linne-stor.webp`) efter artikelbilden. I HTML:en står bara `?mall=linne`.

I `rotation-test-guide` visar rapporten:

- H1, title och description bytta
- de fyra rubrikraderna
- den sjunde FAQ-frågan
- ordantalet 5 515 → 6 397
- nya länkar bara till `#vad-innebar-hog-spatial-formaga` och `?typ=spatial`
- artikelbilden med `imageAlt`

Inget länkmål har försvunnit.

### 6. I samband med push (krav)

1. **Datumen.** Sker pushen inte 2026-11-22 ändras `date` och `updated` i de två nya artiklarna och `updated` i `rotation-test-guide` till pushdagen. Undantagsfilernas `datum` får stå.
2. **Dagen efter push:** revalidera de rörda adresserna. Det är de tre artiklarna, de sju sidorna med nya länkar in, de fem testartiklarna, `/artiklar`, `/artiklar?page=2` och `/verktyg/sokta-tjanster`. Ta sedan ett avtryck mot live med samma sidlista plus de två nya adresserna. Godkänt är Fel 0, eller bara de två ogImage-raderna i punkt 3. Det avtrycket blir nästa baslinje, och de två nya sidorna kommer därmed med i den.
3. **Indexering.** Skicka IndexNow för de två nya adresserna och `rotation-test-guide`. Ge ägaren de två nya adresserna så att han kan begära indexering i Search Console.

### 7. Efter push (inga hinder, men gör dem)

1. **Läs vidare.** Fyll på med artiklar ur samma kluster (`getCtaVariantForTags`) innan de nyaste tas, och de nyaste bara om klustret har färre än tre. Då hamnar en ny artikel inte på sidor där den inte hör hemma, och påfyllnaden byts inte ut vid varje publicering. Det ändringen gör är just att byta Läs vidare-länkar på många sidor, så den ska ha en egen grindkörning med egna LANK_BORTA-rader.
2. **og:image på `/verktyg/bli-upptackt` och `/verktyg/personlighetstest`** i live. Ta reda på varför Vercel-bygget inte ger dem bilden när det lokala bygget gör det.
3. **En svaghet i grinden.** META_BYTT kontrollerar bara sökväg och fält, inte texten före och efter. I rapporten godkändes bytet av rotation-test-guides title och description av en rad från 2026-11-08, inte av raderna från i dag. Då kan en gammal rad släppa igenom ett senare, oavsiktligt byte. Låt META_BYTT kräva `efter` (och gärna `fore`), som H1_BYTT redan gör. Dagens rader finns och är korrekta, så detta stoppar inte pushen.
4. Avläsningarna enligt avsnitt E i byggarens lista och saas-leads avsnitt 5, räknade från pushdagen.
