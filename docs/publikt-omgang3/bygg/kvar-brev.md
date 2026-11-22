# Kvar i brevflödets filer (P5a, 2026-11-22)

P5a rörde inte brevflödets filer, eftersom en annan agent bygger om dem samtidigt. Det här är det som ska föras in där. Lydelserna står ordagrant ur `seo-slutbesked.md`. Radnumren gäller arbetskopian när P5a läste den, så sök efter texten.

Filerna: `src/app/(public)/verktyg/personligt-brev/**`, `src/app/(public)/personligt-brev-exempel/**`, `src/components/publikt/innehall/exempel/**`, `src/components/publikt/brevvisare/**`, `src/app/(public)/skapa-brev/**`, `src/lib/letters/**`, `src/app/api/public/letter-draft/**`, `src/components/brev3/**`.

## SEO:s slutbesked

### /verktyg/personligt-brev (`page.tsx`)

1. **Punkt 49, regel 1.** Regelns text står ordagrant (rad 70, "Står det "stakeholder management" i annonsen ..."), och efterexemplet "Ledde intressentdialogen i tre projekt" står (rad 73). Lägg en rad över Före och Efter. Lydelse: `I annonsen: intressentdialog`
2. **Punkt 50 och 51, tonblockets ingress** (rad 402, i dag "Så kan Saras första mening låta i var och en av dem. Du väljer ton innan brevet skrivs och byter när du vill."). Byt hela ingressen. Lydelse: `Exempel på hur Saras första mening kan låta i var och en av dem. I kontot väljer du ton innan brevet skrivs. Byter du efteråt skriver vi om brevet i den nya tonen.`
3. **Punkt 53, kortet Personligt brev-exempel** (rad 96, i dag "Brev som fungerat, yrke för yrke. Skriv ditt eget från ett av dem."). Lydelse: `Brev att utgå från, yrke för yrke. Skriv ditt eget från ett av dem.`
4. **Avsnitt 3, P3, gratislistans andra underrad** (rad 364, i dag "Utan kortuppgift. Allt du skrivit ligger kvar."). Lydelse: `Utan kortuppgift. Allt du skrivit ligger kvar, och de två senaste breven går att ändra.`
5. **Avsnitt 5, regeln för tal i exempel.** Beskedet säger att "42 miljoner" redan är borta ur koden, men det står kvar på två ställen:
   - rad 126: kravpanelens citat `citat: 'inom budget på 42 miljoner'`
   - rad 150: `<mark>inom budget på 42 miljoner</mark> och två veckor före plan.`

   Saras brev ska läsas ur grundens `Brevpar.tsx` (`SARA_STYCKEN`): "där jag ledde en ombyggnad <mark>inom budget och två veckor före plan</mark>". Citatet i kravpanelen blir då `inom budget och två veckor före plan`. Kontrollistan punkt 17 söker efter "42 miljoner" i hela HTML:en.
6. **Punkt 63.** Annonslappen är "Projektledare, Nordhaga Bygg" (grundens `Brevpar` har redan det). Kontrollera att ingen lapp på sidan säger Sweco.
7. **Lokal nödlösning som kan tas bort.** `personligt-brev.css` rad 194 och 195 (`.pb-resultat .p3-kort .p3-h3` och `.pb-resultat .p3-kort p`). Grunden är rättad (P5a): text på kort, lyft och `.p3-papper` är alltid bläck, också på en ö och på Premium, eftersom pappersreglerna i `v3.css` nu står efter öns och Premiums regler.

### /personligt-brev-exempel och kategorisidorna

8. **Punkt 59.** Länktexten "Tillbaka till hubben" till `/exempel` blir `Alla exempel och mallar` (länkmålet står):
   - `personligt-brev-exempel/page.tsx` rad 371
   - `personligt-brev-exempel/kategori/[kategori]/page.tsx` rad 190

   Meningen "Bläddra hela biblioteket eller välj en annan bransch på hub-sidan." blir `Bläddra i hela biblioteket eller välj en annan bransch bland alla exempel.`:
   - `personligt-brev-exempel/kategori/[kategori]/page.tsx` rad 194

   P5a har gjort samma byte på CV-sidorna (`CvExempelKategori.tsx`, `CvExempelNav.tsx`) och i `exempel/components/GalleriPageContent.tsx`, så att alla sidor säger samma sak.
9. **Avsnitt 3, P3, "Tio branscher".** Talet ska räknas ur datan (antalet branscher) med stor bokstav, inte skrivas för hand:
   - `src/components/publikt/innehall/exempel/BrevNav.tsx` rad 39: `rubrik = 'Tio branscher. Hitta den som är din.'`
   - `personligt-brev-exempel/kategori/[kategori]/page.tsx` rad 153: `rubrik="Tio branscher. Byt till en annan."`

   Talet som ord finns i `storForst(talOrd(n))` i `src/components/publikt/talord.ts` (till och med tio, siffran över tio).

### /personligt-brev-exempel/[yrke] (`BrevExempelMall.tsx`)

10. **Punkt 55.** Delarna i bilden "Brevets tre delar" (rad 369, 375 och 381) heter `Öppningen`, `Mitten` och `Avslutet` i stället för Inledningen, Huvuddelen och Avslutningen. Raderna under dem står. På navet står chipen "1 Inledningen", "2 Kopplingen till annonsens krav", "3 Avslutningen" kvar, eftersom de följer navets egen guidetext ordagrant.

### Kvar från textbygget

11. **BRV-1, twitter-beskrivningen** (`verktyg/personligt-brev/layout.tsx:25`) är överhoppad sedan push 2: lydelsen i `textforslag.md` har 169 tecken, över 158. Den gamla står kvar. Behöver en kortare lydelse från SEO; P5a skriver ingen egen.

## Grunden som brevsidorna nu kan använda (P5a)

12. **Sökfältet och situationsraden.** Grunden har `SokFalt` och `Situationsrad` (`src/components/publikt/v3/Val.tsx`) och klasserna `.p3-sok`, `.p3-sok-falt`, `.p3-situation` i `v3.css`. De är byggda efter `.bx-sok` och `.bx-situation` i `brev-exempel.css`. Byt brevnavets kopior mot grundens (CV-navet gör det redan: `CvSok.tsx` har grundens klasser, `CvExempelNav.tsx` använder `Situationsrad`). `HubbSok` (i `exempel/components/`) är ett klientfilter; ge dess formulär klasserna `p3-sok` och `p3-sok-falt` så att `.bx-sok`-reglerna kan strykas.
13. **Filterchips** finns som `Filterchips` i grunden om brevsidorna behöver dem.
14. **`MallMiniatyr`** skriver nu alt "CV-mallen X" eller "Brevmallen X" (förut "Mallen X"), tar `alt=""` för dekor och `chip="gratis"` för chip bara på gratismallarna. Brevsidorna som visar miniatyren som dekor kan skicka `alt=""`.

## Städning som väntar på brevflödet

15. **`src/components/publikt/innehall/exempel/ExempelMall.tsx` används inte av någon sida** (P2 och P3: CV-exemplen ritas av `cv-exempel/[yrke]/CvExempelMall.tsx`, breven av `BrevExempelMall.tsx`). Ta bort filen. Den är den sista som importerar `src/components/publikt/telefon/skarmar/SkarmCvAnalys.tsx`; ta bort den skärmen i samma byte (P5a har tagit bort alla andra gamla telefonskärmar). Kontrollera först med sökning att inget annat importerar dem.
16. **`src/app/(public)/skapa-brev/start/StartFlowIllustrations.tsx`** används inte längre av sidan (P3:s logg). Ta bort efter sökning.

## Det som inte är P5a:s att avgöra

- Väljaren med alla 40 mallar i startflödet och att mallen följer med in i kontot (byggbriefens beslut 6, P3:s logg): kräver ändring i `claim/route.ts` och brevmotorn. Det är brevagentens uppdrag.
