# Säljsvar till byggspecen för CV-klustret, 2026-11-17

Säljansvarig (konvertering gratis till Premium), 2026-11-17. Svar på S1 till S6 i `docs/plan-seo-cv-kluster-2026-11-17.md` samt granskning av specens säljcopy. Allt kontrollerat mot koden på main bc1eaca1: 40 mallar, 2 gratis (Linne, Björk), 26 med Word, 15 med fotoplats (10 av dem med Word, Björk gratis), 17 i en spalt, `FREE_CV_BYGG_AI_PER_ACCOUNT = 3`, `PAID_CV_BYGG_AI_PER_DAY = 30`, Premium 149 kr i månaden, Black Week 23 till 29 nov 99 kr och Cyber Monday 30 nov 49 kr via `kampanj.ts`. SEO-strategens villkor i avsnitt 4 rörs inte; inga priser ändras.

## Svar på S1 till S6

**S1. Sekundär knapp på /verktyg/skapa-cv.** Beslut: förslaget, "Ladda upp ditt CV" till /cv-mallar#ladda-upp. Uppladdningen visar resultatet innan kontot, och vägen slutar ändå i konto (gratisfilen) eller köp (premiummall), så vi förlorar ingen registrering utan flyttar den dit avsikten är högre. "Se alla mallar" finns kvar som länk i mallblocket, så ingen väg försvinner.

**S2. Premium på stilsidorna.** Beslut: så, en rad under galleriet, inget priskort högre upp. Sidans jobb är att få besökarens CV in i en mall; betalväggen med pris sitter redan i prova-flödet (`KNAPP.premiumPris`), och ett priskort ovanför galleriet skulle konkurrera med det. Raden skrivs ur konstanterna och svepas i `MedKampanjPris` (se S6), en rad per sida:

- /cv-mallar/word: "Linne och Björk är gratis, en nedladdning per konto som PDF eller Word. Word i alla ${WORD_TEMPLATE_COUNT} Word-mallar, alla ${TEMPLATE_COUNT} mallar och nedladdning utan tak ingår i ${paketMedPris(SALD_PLAN)}. Säg upp när du vill."
- /cv-mallar/foto: "Björk är gratis, en nedladdning per konto som PDF eller Word. Alla ${antalFoto} mallar med fotoplats, alla ${TEMPLATE_COUNT} mallar och nedladdning utan tak ingår i ${paketMedPris(SALD_PLAN)}. Säg upp när du vill."
- /cv-mallar/enkla: "Linne och Björk är gratis, en nedladdning per konto som PDF eller Word. Alla ${antalEnSpalt} mallar i en spalt, alla ${TEMPLATE_COUNT} mallar och nedladdning utan tak ingår i ${paketMedPris(SALD_PLAN)}. Säg upp när du vill."

**S3. Knapptext på mallkorten.** Beslut: förvalet, "Fyll i gratis" på Linne och Björk och "Prova med ditt CV" på premiummallarna. Gratiskorten ska säga vad som händer utan kort, och premiumkorten ska bjuda in utan att lova gratis nedladdning; "Prova" är sant eftersom man ser sitt CV i mallen innan köpet. Nivåraden under kortet behålls ur `ARTIKEL.mallrad` ("Gratis, även som Word" / "Ingår i Premium, även som Word"), knappen är handlingen och raden villkoret.

**S4. "Tre förslag gratis" på publika sidor.** Beslut: ja, med talet ur konstanten och alltid "per konto" i samma mening. Tre konkreta förslag säljer bättre än ett vagt "skrivstöd", och steget till 30 per dygn i Premium blir den naturliga merförsäljningen; "per konto" hindrar att någon läser det som tre om dagen.

**S5. CTA-ordning i pilotens mallblock.** Beslut: förvalet, mallarna först, sedan "Se alla ${TEMPLATE_COUNT} CV-mallar", sist uppladdningen. Den som läser ett CV-exempel letar efter hur man skriver, inte efter var man lägger in en färdig fil, så mallkorten möter avsikten och uppladdningen fångar den som redan har ett CV. Länktexten för uppladdningen blir "Har du redan ett CV? Ladda upp det och se det i mallarna" (länk på hela meningen till /cv-mallar#ladda-upp).

**S6. Black Week på stilsidorna.** Beslut: ja, med befintliga komponenter, inget nytt. `MedKampanjPris` (src/components/kampanj/Kampanj.tsx) byter "149 kr i månaden" mot "99 kr första månaden, sedan 149 kr i månaden" i Premium-raden, och prova-knappen får redan kampanjpriset via `prisInfo()` i `ProvaProvider` på mallsidorna; stilsidorna använder samma provider. Går det inte före frysen visas ordinarie pris, aldrig ett handskrivet kampanjpris. Samma svep på eyebrow-raden i slutrutan på /verktyg/skapa-cv (`paketMedPris(SALD_PLAN)`) om `VerktygsMall` tar ReactNode där; annars låt den stå med ordinarie pris som i dag.

## Granskning av specens säljcopy

Allt nedan stämmer med produkten och behövs inte ändras: A1 (en nedladdning som PDF eller Word), A2 (tre förslag per konto, 30 per dygn), B4 punkt 1, B5-beskrivningarna, B6-descriptionen "2 gratis som PDF eller Word". Fyra ställen vill jag justera, inget av dem rör titlar, längder eller sökord:

1. **B1, FUNKTIONER "Jobbcoachen skriver punkterna", sista meningen.** Byt "Tre förslag ingår gratis, Premium ger 30 per dygn." mot "Tre förslag ingår gratis på ditt konto. I Premium får du 30 per dygn." Skäl: "per konto" enligt S4.

2. **B1, slutrutan.** Byt "Alla ${TEMPLATE_COUNT} mallar, full CV-analys och nedladdning av allt du skriver ingår i ${paketKort()}." mot "Alla ${TEMPLATE_COUNT} mallar, Word i alla ${WORD_TEMPLATE_COUNT} Word-mallar, hela CV-analysen och nedladdning utan tak ingår i ${paketKort()}." Skäl: Word är vår tydligaste fördel (avsnitt 6 rad 3) och "nedladdning utan tak" är redan den kanoniska raden i reklamkorten.

3. **B3, mallblocket.** Nivåraden under miniatyrerna ska vara exakt `ARTIKEL.mallrad(gratis, word)`, inte "Gratis, PDF och Word" / "Premium" som specen skriver; ingressen får "Välj rubrikerna för din bransch, fyll i direkt och ladda ner gratis i Linne eller Björk, som PDF eller Word." Skäl: samma rad som artiklarna och yrkessidorna, vaktad av befintliga tester, och Word-fördelen syns utan extra ord.

4. **B5 /cv-mallar/word, innehållsraden "samma utseende som PDF:en".** Skriv "samma mall, samma rubriker och samma ordning som i PDF:en". Undantaget i bc1eaca1 betyder att ett långt CV i sidospaltsmallarna kan bryta raderna något annorlunda i Word, så "samma utseende" går inte att lova (P4 är saas-leads, men copyn får inte lova mer än testet). FAQ-svaret "Ser Word-filen likadan ut som PDF:en?" skrivs: "Samma mall, typsnitt, rubriker och ordning, och sidantalet är detsamma. I ett långt CV i mallar med sidospalt kan raderna hamna något annorlunda på sidan än i PDF:en." FAQ-svaret "Är CV-mallarna i Word gratis?" skrivs: "Ja, i Linne och Björk. Du laddar ner Word-filen en gång per konto utan kort, precis som PDF:en. Word i de övriga ${talSomOrd(antalWordPremium)} Word-mallarna ingår i ${paketMedPris(SALD_PLAN)}, tillsammans med alla ${TEMPLATE_COUNT} mallar och nedladdning utan tak." (svepas i `MedKampanjPris`).

**Till saas-lead och SEO-strategen, inte ett eget beslut:** FAQ-svaret "Är det gratis att skapa CV online hos er?" på /verktyg/skapa-cv säger "laddar ner det som PDF en gång", men gratisfilen får vara Word i Linne och Björk sedan 2026-11-16. Rätt rad är "laddar ner det en gång, som PDF eller Word, utan att lämna kortuppgifter". Specen listar FAQ_BYTT för /verktyg/skapa-cv som "två svar" men ändrar redan tre; om SEO-strategen sätter undantaget till fyra svar tar byggaren med raden, annars väntar den till nästa omgång.

**Specen räknar 9 fotomallar med Word; katalogen har 10.** Spelar ingen roll eftersom talet ska läsas ur katalogen, men byggaren ska inte skriva 9 någonstans.

Inga övriga invändningar. Mätning enligt B10 räcker för avläsningen 8 december: `data-cta-klick` på S1-knappen, mallkorten och Premium-raden, så att vi kan se andelen som går uppladdning mot registrering per sida.
