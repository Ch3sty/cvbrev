# Not: /verktyg/personligt-brev (skiss `personligt-brev`)

Källa: `sidor/personligt-brev.html`. Bilder: `bilder/personligt-brev-375-*.png`, `-412-*`, `-1440-*`.
Kod i dag: `src/app/(public)/verktyg/personligt-brev/` (page.tsx, layout.tsx, components/brev-faq-data.ts).

## Vad som ändras mot i dag, sektion för sektion

1. **Hjälten.** Telefonen med brevskärmen är borta. I stället det riktiga arket (Saras brev till Sweco) med kraven utmärkta med siffror i texten, annonsens kravlista bredvid och ett stort tal: "6 av 7 krav har fått svar". Det är samma idé som panelen Kraven i brevrummet. Tre talbrickor som i dag (1 brev, 4 min, 40 mallar).
2. **Skriv ett brev utan konto** är lyftkortet som går in över väggen, och sidans första handling. Hjältens knapp heter nu "Skriv ett brev nu" och går till `/skapa-brev/start` (i dag "Skapa ditt brev gratis" till `/register?borja=brev`). Kortet har ett annonsfält och till höger de tre punkterna som i dag, med en underrad var.
3. **Så fungerar det.** De fyra HowTo-stegen är en väg med en bild per steg: kortet "Brevet bygger på" med CV:t, annonsen med utlästa krav, tre riktiga mallminiatyrer och knapparna Kopiera text, Word, Ladda ner PDF. Telefonskärmen (SkarmAnnons) är borta. Under stegen ett nytt block om de fem tonerna: fem kort med tonens namn, brevrummets underrad ("Saklig men varm" och så vidare) och Saras första mening i den tonen, språkvalet Svenska och English, och raden "Vi väljer ton åt dig" med Premiummärke.
4. **40 mallar för personliga brev.** Sju mallkort med de riktiga brevminiatyrerna och ett länkkort till /cv-mallar, som i dag, men korten har klack, miniatyren står på ton och nivån är ett märke (Gratis grönt, Premium koppar). Till höger om rubriken Saras CV och brev bredvid varandra med samma huvud ("Ditt CV", "Ditt brev"), som i brevrummets Mallar. Två kort i bredd på telefon, fyra på dator.
5. **Fem regler som höjer svarsfrekvensen.** Brevet är bilden: ett plommonblock med brevets tre stycken (Öppningen, Mitten, Avslutet) med en exempelrad var ur Saras brev, och en skala som visar 250 till 350 ord. De fem reglerna är numrerade kort, två av dem med före och efter.
6. **När brevet svarar mot kraven har rekryteraren en anledning att ringa.** Ett stort plommonblock med brevrummets kravpanel i full storlek: sex krav med citatet ur brevet som svarar på vart och ett, och det sjunde kravet (saknas) med fältet "En mening med ett exempel ur ditt CV räcker" och "Lägg till i brevet". Under panelen de tre korten som i dag (Ett brev gratis, PDF och Word, 149 kr i månaden) och knappen "Skriv ditt första brev gratis".
7. **Läs mer om personliga brev.** Exempelnavet är ett stort kort med talet 89 och tre riktiga brevark, de fem artiklarna är länkbrickor bredvid.
8. **Premium.** Bläckön ur grunden med priset som stort tal och tre bockar.
9. **Frågorna.** Samma åtta frågor, samma svar.

## Oförändrat för SEO

- Title, description, canonical, keywords och Open Graph rörs inte.
- H1 "Skräddarsy ditt brev till varje annons".
- H2 i samma ordning: Skriv ett brev utan konto, Så fungerar det, 40 mallar för personliga brev, Fem regler som höjer svarsfrekvensen, När brevet svarar mot kraven har rekryteraren en anledning att ringa, Läs mer om personliga brev, Ditt nästa brev tar tre minuter, inte tre timmar., Det du undrar om brevverktyget. **Det är åtta H2, inte nio**: så står det i `_rubriktrad.txt` och i page.tsx. Alla åtta är kvar.
- Alla 25 H3 är kvar med samma lydelse (fyra steg, sju mallar, fem regler, tre resultatkort, sex länkar).
- HowTo-stegens fyra texter står ordagrant. FAQ: åtta frågor och svar ordagrant (svaret om säkerhet står kvar som i dag, skissen visar bara en platshållare).
- Schemat WebApplication, HowTo och FAQPage behålls utan ändring.
- Interna länkar kvar: /skapa-brev/start, /personligt-brev-exempel (tre ställen), /cv-mallar, de fem artiklarna, /priser, /register?borja=brev, mailto support.

## Rubriker och påståenden som bytts

Inga rubriker är bytta. Tre små saker i löptext:

- Hjältens ingress: "plockar ut nyckelorden som betyder något" är ritad som "plockar ut kraven som betyder något". Produkten läser ut krav, och hela sidan visar krav. Inte osant i dag, men ordet bör vara samma som i produkten. Textspåret avgör.
- Talbrickan "40 mallar / samma som till ditt CV" är ritad som "40 / mallar, samma som till ditt CV" för att få plats på 375. Samma ord.
- FAQ-svaret om ChatGPT säger "optimerar för ATS-systemen". Det är orört, men textspåret bör titta på det: brevet läses inte av ett ATS på samma sätt som CV:t.

## Nytt som inte finns i dag (SEO tar ställning)

- **Tonblocket** under stegen. Rubriken "Fem toner. Samma erfarenhet, olika röst." är ritad som ett stycke med rubrikstil, inte som H2 eller H3, så rubrikträdet är orört. Vill SEO ha en H3 där är det ett eget beslut. De fem exempelmeningarna är skrivna av mig för skissen. Före bygge ska de bytas mot meningar som brevmotorn faktiskt har skrivit i varje ton, annars lovar vi en röst som produkten inte har.
- **Underrader** i lyftkortets tre punkter ("Första stycket står på arket direkt.", "Utan kortuppgift. Allt du skrivit ligger kvar.", "Att läsa och kopiera texten är gratis."). Alla tre följer facit.
- **Ingress i resultatsektionen**: "Varje krav i annonsen får en siffra, och du ser i brevet var det besvaras. Saknas ett krav lägger du till en mening om det när brevet är klart." Andra meningen finns i dag på telefonskärmen i Så fungerar det.
- **Före och efter** i regel 1 ("Van att hantera intressenter" mot "Stakeholder management i tre projekt"). Regel 2 använder exemplet som redan står i texten.
- **Tre bockar i Premium-ön**: "Personliga brev utan tak, med tonen vald åt dig", "Alla 40 mallar, PDF i alla och Word i 26", "Rekryteringstester, CV-analysens alla förslag och jobbmatchning".

## Det som kräver beslut

1. **Annonsfältet i lyftkortet.** Skissen visar ett fält där man klistrar in annonsen redan på säljsidan. Det kräver att startflödet tar emot annonsen (se noten `skapa-brev-start`). Säger ägaren nej blir fältet en bild och knappen en vanlig länk till startflödet. Sidan fungerar i båda fallen.
2. **Hjältens knapp.** Jag har gjort "Skriv ett brev nu" (utan konto) till hjältens enda knapp, eftersom uppdraget säger att det är sidans första handling. "Skapa ditt brev gratis" (registrering) finns kvar i Premium-ön och sist på sidan. Vill sälj ha registreringen i hjälten byter de två plats.
3. **Tonernas exempelmeningar** (se ovan).
4. **Exemplet.** Sara söker hos Sweco, som i `delar/brevpar.html` och `delar/traffar.html`. Den nuvarande telefonskärmen nämner också NCC och Lindholmen Science Park. Jag har tagit bort dem och skriver "en ombyggnad", så att vi inte lägger påhittade projekt på riktiga bolag. Sweco som arbetsgivare i exemplet är ett beslut för alla skisser, inte bara den här.

## Filer bygget rör

- `src/app/(public)/verktyg/personligt-brev/page.tsx` (hela sidans uppställning).
- Nya eller ombyggda publika komponenter: hjältens kravbild, kravpanelen, tonblocket, mallkortet, regelblocket. Kravpanelen och tonkorten bör dela utseende med `src/components/brev3/`.
- `src/components/publikt/telefon/skarmar/SkarmBrev.tsx` och `SkarmAnnons.tsx` används inte längre på sidan (används SkarmBrev i artikelreklamen, se den skissen).
- `brev-faq-data.ts`, `layout.tsx` och schemat i page.tsx: orörda.
- `src/components/publikt/brevmallar.ts`: orörd, talen och de sju mallarna läses därifrån som i dag.

## Förslag till grunden

- `img { height: auto; }` i kit.css. Utan den sträcks varje bild som har width och height i HTML (och det ska de ha, för CLS). Jag har lagt `main img { height: auto; }` i mina sidor.
- `.vagsteg li { align-content: start; }`. När ett steg har en bild och grannen har längre text sprids rubrik och text ut över hela kortets höjd på 1440.
- `.annons li` förutsätter fyra korta krav. Med sju rader behövs `white-space: nowrap` och en bredare lapp på telefon. Jag har löst det i sidan.
- Ett `q`-element får webbläsarens egna citattecken. Skriver man också tecknen i texten blir de dubbla. `q { quotes: none; }` i grunden vore rimligt.
