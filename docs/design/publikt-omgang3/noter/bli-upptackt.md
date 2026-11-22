# Not: /verktyg/bli-upptackt

Skiss: `sidor/bli-upptackt.html`, rum `jobb`. Bilder: `bilder/bli-upptackt-375|412|1440-NN.png`.

## Vad som ändras mot i dag, sektion för sektion

1. **Hjälten.** Telefonen `SkarmBliUpptackt` ("Kandidat 4 812", tre styrkor, "Dolt för rekryteraren") är borta. I stället: reglaget Synlig för rekryterare, kandidatkortet som rekryteraren ser det (roll, län, Anonym, erfarenhet, test som placering, två styrkor i ord, kompetenser, villkor) och en kontaktförfrågan med Tacka ja och Nej tack. Bilden visar löftet: anonym tills du själv tackar ja.
2. **Så fungerar det.** Fyra steg som väg, varje steg med sin bild: det som lästs ur CV:t, ett testresultat märkt Frivilligt, reglaget och de två svaren.
3. **Rätt synlighet, inte mer synlighet.** Fyra textrader blir fyra kort med var sitt föremål: rekryterarens sökfält, reglaget, två testresultat och ett spektrum ur arbetsstilen.
4. **Visa hur du jobbar, inte bara vad du kan.** Ett block i testernas färg (indigo), eftersom personlighetstestet hör till Rekryteringstester. De tre "Så ..."-rubrikerna står som rapporten i ord på ett papper, och kunskapstesterna får en egen rad med tre resultat som placering.
5. **Du har full kontroll hela vägen.** En väg i fyra led överst (anonym profil, kontaktförfrågan, du väljer, först efter ditt ja), sedan de fyra trygghetspunkterna som kort med lås.
6. **Rekryteraren hittar dig för att du passar.** Tabellen blir ett möte: din profil till vänster, rekryterarens sökning till höger och en bock mellan varje par. Svaret står som en skylt under. Ett andra exempel visar en sökning som inte hittar profilen. De fyra sökningarna går att välja som i dag.
7. **Det här ser en rekryterare av din profil.** Det riktiga kandidatkortet i full storlek på rummets färg, byggt efter `RecruiterPreviewCard.tsx`: huvud med rollens initial, erfarenhetsraden, kandidatens egna ord, test och styrkor, arbetsstilen som två spektra med en rad under, kompetenser och villkor. Bredvid två listor: Syns på kortet och Syns inte.
8. **Redo att bli hittad i stället för att leta?** Ett lyft papper med reglaget på och av.
9. **Frågorna.** Samma sju.

## Oförändrat för SEO

- H1 och alla åtta H2 ordagrant, i samma ordning. Alla sexton H3 ordagrant.
- All löptext i stegen, värdena, arbetsstilen, tryggheten och slutblocket står ordagrant. Texterna om vad som visas och döljs ligger nära samtycket och är inte rörda. Två små undantag: i exempelprofilen står meningen om vad rekryteraren inte ser som listan Syns inte (samma sex saker), och i matchningen är ordet "nedan" struket.
- De sju FAQ-frågorna och svaren ordagrant.
- Schema: Service och FAQPage. Title, description, canonical och slug rörs inte. Brödsmulan är Hem, Bli upptäckt som i dag (utan Verktyg).

## Bytt för att det var osant

Ingen rubrik och inget påstående i löptexten är bytt. Det som ändras är bilderna:

| Var | I dag | I skissen |
|---|---|---|
| Telefonen i hjälten | "Kandidat 4 812" som namn på profilen, tre styrkor | Rollen som rubrik och initial, som i kontots förhandsvisning. Två styrkor, som texten säger ("dina två främsta styrkor i ord") |
| Exempelprofilen | Redovisningsekonom i Stockholm | Sara Lindström som projektledare i Västra Götaland, samma person som på de andra sidorna. Ingen text i sektionen nämner yrket |
| Matchningsdemon | Redovisningsekonom, "Ekonomi, Stockholm" | Projektledare, "Bygg, Västra Götaland". Samma fem rader och samma fyra sökningar |

Testresultaten visas som placering ("topp 15 %"), aldrig som andel rätt, och styrkorna i ord (beslut 1). Lönespannet står bara i listan Syns inte.

## Kräver beslut

1. **Två ställen på sidan säger olika om arbetsgivaren.** Ingressen till Du har full kontroll: "din arbetsgivare visas aldrig förrän du själv tackat ja". Kortet under och FAQ-svaret: "Vi döljer vilket företag du jobbar på i dag". Skissen säger "Syns inte" utan att ta ställning till vad som händer efter ett ja. Texten är samtyckesnära: ägaren avgör.
2. **FAQ-svaret om lön** säger "Din profil visar bara din roll, region, kompetenser och testresultat". Kortet visar också erfarenhet, egna ord, arbetsstil och villkor. Svaret är inte ändrat, men det stämmer inte med kortet.
3. **Samtycket säger "Verifierade testresultat med percentiler"**, sidan säger "nivå och placering". Skissen följer sidan.
4. **"Tidig åtkomst"** står kvar över H1. Med tre synliga profiler är det ärligt. Säljer det sämre än det upplyser?
5. **Kandidatens egna ord på kortet** ("Projektledare som håller ihop upphandling och tidplan ...") är påhittade för exemplet, liksom arbetsstilens rad. Raden "Söker mig till" finns i kontot men är inte ritad, eftersom jag inte vet vilka etiketter som går att välja.
6. **Interaktionen i matchningen** (välja sökning) behöver klient-JS som i dag. Skissen visar första sökningen och en sammanfattning av den andra.

## Filer bygget rör

- `src/app/(public)/verktyg/bli-upptackt/page.tsx` (egen uppställning i stället för `VerktygsMall`, eftersom blocken har olika form).
- `src/app/(public)/verktyg/bli-upptackt/components/BliUpptacktExempel.tsx` (kandidatkortet) och `BliUpptacktMatchning.tsx` (mötet, exemplet byts till projektledare).
- `src/components/publikt/telefon/skarmar/SkarmBliUpptackt.tsx`: utgår från sidan. Används den på fler ställen ska den ritas om efter kandidatkortet.
- `bli-upptackt-faq-data.ts` och `layout.tsx` rörs inte.

## Förslag till grunden

- **Kandidatkortet (`.kkort`), spektrumet (`.spektrum`) och reglaget (`.reglage`)** bör ligga i `kit.css`: startsidan och `/funktioner` nämner Bli upptäckt och kan visa samma kort.
- **Brickor med ord i stället för tal** ("Anonym") ryms inte i brickans bredd under 600 px med rubriksnittets storlek. Jag sänkte storleken på sidan. En variant i grunden för ord vore bättre.
- **Rubriker på papper på en ö i ett annat rum** (`.ordkort` på indigo) ärver öns ljusa rubrikfärg. Jag satte färgen själv.
