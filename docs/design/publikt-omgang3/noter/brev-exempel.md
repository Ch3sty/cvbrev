# Not: /personligt-brev-exempel/[yrke] (skiss `brev-exempel`, projektledare med Sara Lindström)

Källa: `sidor/brev-exempel.html`. Delar: `delar/brev-exempel-visare-stil.html` (visarens CSS, delas med `brev-artikel` och `skapa-brev-start`), `delar/brev-exempel-a4.html` (Saras brev på arket i Linne), `delar/brev-exempel-minirad.html` (de fem miniatyrerna). Bilder: `bilder/brev-exempel-375-*.png`, `-412-*`, `-1440-*`.
Kod i dag: `src/components/publikt/innehall/exempel/` (ExempelMall.tsx, ExempelHjalte.tsx, Papper.tsx, MallValjare.tsx, TipsKort.tsx, VarforLista.tsx, AnsokanPar.tsx, YrkesKort.tsx, exempel.css) och `src/components/publikt/brevvisare/`. Sidtypen har 89 sidor. ExempelMall delas med /cv-exempel/[yrke].

## Var lägena står i skissen

- **Stängt läge**: sidan som den laddas, sektionen "Komplett exempel på 60 sek". Bild `-1440-01` och `-02`, `-375-01` och `-02`.
- **Öppet läge** (visaren öppen): under skissbladet "Öppet läge", direkt efter det stängda. Bild `-1440-02` och `-03`, `-375-03`.
- **Cookieraden på 375 × 667**: under skissbladet "Cookieraden på liten telefon", en ram i exakt den storleken. Bild `-1440-03`, `-375-04`.
Skissbladen (streckad kopparram) hör till skissen och finns inte på sidan.

## Vad som ändras mot i dag, sektion för sektion

1. **Hjälten.** Utdraget ur papperet är utbytt mot hela brevet på ett A4-ark i Linne, med Koppar och Ritning som kikar fram bakom och två av rekryterarens kommentarer som lappar. Bilden visas bara i brett läge. På telefon är hjälten kort, så att brevet kommer direkt.
2. **Papperet (stängt läge).** Brevet ligger på en plommonyta, samma som visarens, i stället för på det ljusa golvet. Det är satt som mallen Linne (namnet i serif, kontaktraden, linjen), i läsbar storlek och serverrenderat som i dag. Kommentarerna har siffror, och samma siffror står vid styckena de gäller (i marginalen i brett läge, först i stycket på telefon). "Byt mall" är en vit knapp med de fem riktiga miniatyrerna i, och raden Exempelbrev, En A4, Cirka 330 ord står som märken bredvid.
3. **Öppet läge.** Visaren står i papperets ställe, på samma plommonyta, så att bytet känns som att papperet krymper till ett ark. "Visa exemplet igen" överst. **På telefon står miniatyrraden över arket**, i brett läge är den en lodrät remsa till höger om arket som i dag. Sockeln: namnraden, knappen och fotraden. Efter fotraden en länk, "Se alla 40 mallar".
4. **Det här gör brevet starkt.** Fyra numrerade kort, två i bredd, med samma siffror som kommentarerna och papperet.
5. **Tips för projektledare.** Fem numrerade kort. Exempelmeningen i varje tips står i en egen ruta, så att den syns som det man ska skriva av. All text är kvar.
6. **Skrivguiden.** Texten till vänster, en liten bild av brevets tre delar till höger.
7. **Jobbkartan** (YrkesKarta) står kvar där den står i dag. Inte ritad här.
8. **Frågorna.** Samma sex.
9. **Skapa hela ansökan.** Två kort med riktiga miniatyrer: brevet (Du är här) och CV-exemplet för samma person.
10. **Fler personliga brev-exempel.** Samma kort som i navet.
11. **Slutet.** Plommonö med annonsen och brevet (`delar/brevpar.html`), som visar vad verktyget gör med besökarens egen annons.

## Visaren: det som gäller i skissen

- Inga rubriker (h1 till h6), inga kronor, ingen spärr. Namnraden är ett stycke.
- Första vyn (Linne) står i HTML: arket, namnraden "Linne. Gratis, även som Word." och fotraden.
- Fem miniatyrer i samma ordning: Linne, Björk, Koppar, Ritning, Terrakotta.
- Fotraden står ordagrant: "Det här är fem av 40 mallar. Med ett konto provar du alla med ditt eget brev."

## Hur de tre kända svagheterna är lösta

1. **Mallen följer med.** Visarens knapp heter "Använd som mall", samma som i hjälten och kommentarskortet, och går till `/skapa-brev/start?yrke=projektledare&mall=<vald mall>`. Det förutsätter att startflödet tar emot mallen (noten `skapa-brev-start`). Byggs inte det heter knappen "Skriv ditt eget brev" som i dag.
2. **Cookieraden på 375 × 667.** Miniatyrraden ligger över arket på telefon. När visaren öppnas rullar sidan till dess överkant som i dag, och då syns "Visa exemplet igen", alla fem miniatyrerna och arkets huvud ovanför cookieraden. Raden täcker bara brevets nedre del. Cookieraden och dess text är orörda. Ingen ny kod för att flytta eller krympa den.
3. **Fem av 40.** Länken "Se alla 40 mallar" efter fotraden går till /cv-mallar, där alla 40 finns i dag. I startflödet går alla 40 att välja. Att rita exempelbrevet i alla 40 i visaren avstår jag från: UX mätte 2026-11-21 att tolv exempelbrev inte ryms på en sida i Kalksten och Granit.

## Oförändrat för SEO

- Title, description, canonical, Open Graph. Schemat Article (med brevets text i articleBody), FAQPage, HowTo och BreadcrumbList.
- H1 "Projektledare" (yrket).
- H2 i samma ordning: Komplett exempel på 60 sek, Det här gör brevet starkt, Tips för projektledare, Så skriver du ett personligt brev som projektledare, (Jobbkartans H2 där den finns), personligt brev för projektledare, Skapa hela ansökan, Fler personliga brev-exempel, Imponerad? Skapa ditt nu.
- H3: de fyra punkterna under Det här gör brevet starkt, de fem tipsen, Personligt brev och CV-exempel i Skapa hela ansökan, de fyra relaterade yrkena.
- **Brevets text står serverrenderad på papperet, ord för ord som i dag**, med samma fält: namn, adress, telefon, e-post, datum, arbetsgivare, roll, hälsning, fem stycken, "Varma hälsningar," och namnet. Bara sättningen är ny.
- De fyra punkternas text, de fem tipsens text, skrivguidens tre stycken och FAQ:ns sex frågor och svar står ordagrant.
- Interna länkar kvar: /skapa-brev/start?yrke=projektledare (hjälten, kommentarskortet, visaren, slutet), /exempel, /personligt-brev-exempel (smulan och löptexten), /cv-exempel/projektledare, /dashboard/skapa-cv, /dashboard/skapa-brev, fyra relaterade yrken. Ny länk: /cv-mallar från visarens fotrad.

## Rubriker och påståenden som bytts, och sådant textspåret bör se

- **Slutet**: "så är det klart på en minut" är ritat som "så är det klart på några minuter". Säljsidan säger två till fyra minuter. Gäller alla 89 sidor (texten står i ExempelMall.tsx).
- **H2 "Komplett exempel på 60 sek"** är orörd men oklar: det är inte sagt vad som tar 60 sekunder. Gäller alla 89 sidor. SEO och text avgör.
- **Meta description** för projektledare slutar "Skriv ditt brev på 2 minuter". Orörd, men samma fråga.
- **H2 "personligt brev för projektledare"** står med liten bokstav i HTML i dag. Skissen visar stor bokstav med CSS och rör inte texten.
- Tipsens och punkternas text har "12%", "2-8 MSEK" och "OCH" i versaler. Orört. Det är exempeldatan, inte formen.
- Sara bor i Stockholm i exempeldatan. Briefen säger Göteborg. Jag har följt datan, eftersom brevets text inte får ändras här.

## Det som kräver beslut

1. **Siffrorna vid styckena.** Skissen sätter kommentar 1 och 2 vid andra stycket och 3 och 4 vid tredje. Koden kan redan det (ankare i exempeldatan), men projektledare och många andra yrken saknar ankare, och då visas tomma ringar som i dag. Antingen läggs ankare in för de 89 breven (ett datajobb, fyra rader per yrke), eller så ritas kommentarerna utan siffror där ankare saknas. Skissen fungerar i båda fallen.
2. **Exempelmeningen i tipsen** lyfts ut med en regel: första meningen inom citattecken efter ett kolon. Tipsen är skrivna olika, så regeln måste provas mot alla 89 yrken. Passar den inte står texten som löpande stycken, som i dag.
3. **Knappens namn i visaren** hänger på startflödet (se ovan).
4. **Hjältens bild på telefon.** Jag visar ingen. Vill ägaren ha bilden även där kostar det ungefär en skärm innan brevet.
5. **Miniatyrerna visar Erik Lindberg**, arket visar Sara. Det är så i dag också. En miniatyr per yrke är möjlig men blir 89 gånger fem bilder.

## Filer bygget rör

- `src/components/publikt/innehall/exempel/ExempelMall.tsx`, `ExempelHjalte.tsx`, `Papper.tsx` (BrevPapper och BrevUtdrag), `MallValjare.tsx`, `VarforLista.tsx`, `TipsKort.tsx`, `AnsokanPar.tsx`, `YrkesKort.tsx`, `exempel.css`.
- `src/components/publikt/brevvisare/BrevVisare.tsx` och `brevvisare.css` (miniatyrraden först på telefon, sockeln, länken i fotraden), `texter.ts` (knapptexten), `visare-data.ts` (fotradens länk).
- ExempelMall delas med CV-exemplen. Den som ritar /cv-exempel/[yrke] bör utgå från samma uppställning i petrol.
- `exempel-data.ts` bara om ankare läggs in. `page.tsx` (metadata och schema) orörd.

## Förslag till grunden

- Visarens CSS (`.mv` och `.a4`) ligger i min delfil. Den bör in i grunden om fler skisser visar brev på ark, och CV-sidornas mallväljare bör få samma form.
- `.skissnot` (streckad kopparram för sådant som hör till skissen och inte till sidan) saknas i grunden. Flera sidor behöver visa två lägen.
- En ram för "så ser det ut på 375 × 667" (`.ram375`) vore bra att dela.
