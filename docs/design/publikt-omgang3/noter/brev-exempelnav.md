# Not: /personligt-brev-exempel (skiss `brev-exempelnav`)

Källa: `sidor/brev-exempelnav.html` och `delar/brev-exempelnav-yrken.html` (de 89 korten, skapade ur `underlag/text-live-2026-11-22/personligt-brev-exempel.txt`, alla med sin text). Bilder: `bilder/brev-exempelnav-375-*.png`, `-412-*`, `-1440-*`.
Kod i dag: `src/app/(public)/personligt-brev-exempel/page.tsx`, som ritar `src/app/(public)/exempel/components/GalleriPageContent.tsx` (delad med /cv-exempel), `MallarGuideSection.tsx`, `HubbSok.tsx`, `galleri-data.ts`, `galleri-faq.ts` och `src/components/publikt/innehall/exempel/YrkesKort.tsx`.

## Vad som ändras mot i dag, sektion för sektion

1. **Hjälten.** De tre arken med grå streck är utbytta mot tre riktiga brev (Björk, Linne, Koppar), tre yrkeslappar och talet 89 som svävande bricka. Sökfältet är hjältens handling, stort och med kopparknappen "Hitta exemplet". Situationsraden (Student, Utan erfarenhet, Karriärbyte, Chef) står som fyra tryckytor under.
2. **Branscherna** har flyttat ur hjältens filterrad till ett lyftkort: tio brickor med antalet yrken som stort tal och en stapel som visar branschens storlek, största först. "Alla yrken 89" är den mörka brickan överst. Varje bricka är samma länk till kategorisidan som i dag.
3. **89 yrken.** Samma 89 kort i samma ordning, med branschen, yrket som H3 och raden. Minipapperet med streck är utbytt mot en riktig brevminiatyr. Tre i bredd på dator, ett på telefon.
4. **Behöver du även CV?** En liten ö i CV:ts petrol med vit knapp, i stället för en textrad.
5. **Guiden.** Till vänster en bild av skillnaden mellan mall och exempel: en tom struktur (Inledning, Huvuddel, Avslutning) bredvid ett ifyllt brev. Till höger de fyra frågorna som kort med hela texten. Kortet om yrkesval har de tre delarna som märken, kortet om gratis har tre rader som visar vad som är gratis och vad som är Premium.
6. **Frågorna.** Samma nio.
7. **Slutet.** Plommonö med brevet som bild, samma rubrik, text och två länkar.

## Oförändrat för SEO

- Title, description, canonical, keywords.
- H1 "Personligt brev-exempel för 89 yrken. Börja med ditt."
- H2 i samma ordning: 89 yrken, Behöver du även CV?, Så använder du ett exempel på personligt brev som mall, Det du undrar om brev-exemplen, Klar att skriva ditt eget brev?
- Alla 89 H3 med yrkesnamn och varje korts text, i dagens ordning. Guidens fyra H3 med samma lydelse.
- Ingressen i hjälten och ingressen under "89 yrken" står ordagrant.
- FAQ: nio frågor, samma lydelse, de tre länkarna i svaren kvar.
- Schemat ItemList, BreadcrumbList och FAQPage behålls.
- Interna länkar kvar: fyra situationslänkar, tio kategorisidor, 89 yrkessidor, /cv-exempel, artikeln Personligt brev mall gratis, brevverktyget, /exempel, /skapa-brev/start.

## Rubriker och påståenden som bytts för att de var osanna

- **Guidens fjärde svar (H3 "Är mallar för personligt brev gratis? Kan jag ladda ner dem?").** I dag: "Alla våra mallar för personligt brev är helt gratis att använda ... bygg ditt eget personligt brev med vårt brevverktyg och ladda ner det som färdig PDF. Det är gratis att börja". Det läses som att nedladdningen är gratis. Nedladdning kräver Premium. Ritat: "Alla 89 exempel är gratis att läsa och låna upplägget från ... Första brevet är gratis, sedan ett var sjunde dag, och texten kopierar du fritt. Nedladdning som PDF eller Word ingår i Premium." Rubriken är orörd. Rådet om Word, Garamond och Calibri står kvar.
- **FAQ "Kan jag använda samma personliga brev för flera jobb?"** Sista meningen "Det tar bara några minuter extra och dubblar dina chanser." är ritad utan "och dubblar dina chanser". Det är en siffra vi inte har belägg för. Svaret ligger också i FAQPage-schemat, så bytet syns där.

Båda är förslag. Textspåret bestämmer lydelsen.

## Kategorisidorna under /personligt-brev-exempel/kategori

Det finns tio (`kategori/[kategori]/page.tsx`, en per bransch: vard, tech, industri, ekonomi, service, logistik, utbildning, offentlig-sektor, hantverk, student), och tio till under /cv-exempel/kategori. De ritas av `KategoriPageContent.tsx`, som är kvar i den gamla formen från före publikt v2: vit bakgrund, orange och röd toning, framer-motion, klientkomponent. De har title, description, canonical, CollectionPage, BreadcrumbList och ItemList, H1 "Personligt brev-exempel för {bransch}", H2 "{n} yrken inom {bransch}", H2 "Behöver du även CV?" och H2 "Hittade du inte ditt yrke?". Korten har bara yrkesnamnet, inte raden.

**De ska följa navets skiss.** Förslag: samma sida med branschen vald.
- Hjälten i plommon med branschens namn i H1 och branschens ingress (`introIngress`), utan sökfält.
- Lyftkortet med de tio brickorna, där den egna branschen är den mörka.
- Yrkeskorten ur navet (med raden), bara branschens yrken.
- CV-ön länkar till samma bransch under /cv-exempel/kategori.
- "Hittade du inte ditt yrke?" blir slutön med länk till navet och /exempel.
Rubrikerna och schemat behålls som de är. Ingen egen skiss behövs om ägaren godtar det här. Två saker bör SEO se över när sidorna ändå byggs om: ingressen för vården säger "20+ yrken" medan brevnavet har 17, och sidorna är klientkomponenter utan skäl.

/cv-exempel delar komponent med den här sidan. Byggs navet om i `GalleriPageContent.tsx` följer CV-navet med, i petrol. Den som ritar CV-sidorna bör veta det.

## Det som kräver beslut

1. **Miniatyren på korten.** Skissen använder samma Linne-miniatyr på alla 89 kort. Alternativet är en miniatyr per yrke, ritad av brevmotorn ur yrkets exempelbrev (89 små bilder, lata). Det är finare och sannare, men 89 bilder till på sidan. Mitt förslag: en per yrke, 116 px breda, `loading="lazy"`.
2. **Branschbrickornas ordning.** Skissen sorterar störst först. I dag står de i katalogens ordning (vård först). Det är en smaksak, länkarna är desamma.
3. **Miniatyrerna visar Erik Lindberg**, inte Sara. De är ritade av brevmotorn ur motorns exempelbrev och finns redan live på säljsidan. Ska alla publika miniatyrer visa Sara krävs nya bilder (`scripts/brevmallar-miniatyrer.ts`).
4. De två textbytena ovan.

## Filer bygget rör

- `src/app/(public)/exempel/components/GalleriPageContent.tsx` (delas med CV-navet), `MallarGuideSection.tsx`, `HubbSok.tsx`.
- `src/components/publikt/innehall/exempel/YrkesKort.tsx` och `exempel.css`.
- `src/app/(public)/exempel/components/KategoriPageContent.tsx` om kategorisidorna tas i samma bygge.
- `galleri-faq.ts` om FAQ-svaret ändras. `page.tsx` (metadata och schema) är orörd.

## Förslag till grunden

- Ett sökfält på väggen (vitt fält med klack plus kopparknapp) och en rad med tryckytor på väggen (44 px höga länkar i glas) behövs säkert på CV-navet, artikellistan och Jobbkartan också. I dag ligger de i min sida som `.sok` och `.situation`.
- Yrkeskortet `.yk` bör bli en del av grunden om CV-navet ritas av någon annan, så att de två naven blir lika.
