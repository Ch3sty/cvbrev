# Säljgranskning, svepet 2026-11-15

Granskat: tre artiklar i arbetskopian publikt-v2 plus det sidan lägger runt texten (hjälteknapp, inline-kort efter första textstycket, sidokort, slutkort, mobilens fasta knapp). Klustren är räknade ur taggarna med `src/lib/cta/clusters.ts` som den ser ut i arbetskopian i dag (intervjuklustret får provkortet sedan S6).

| Artikel | Kluster | Hjälteknapp | Inline-kort | Mobilknapp | Slutkort |
|---|---|---|---|---|---|
| din-digitala-jobbcoach | interview (taggen "intervjuförberedelse") | Träna intervjufrågor, Jobbcoachen | Provkortet "Intervjun kommer sällan ensam", logiktest | Prova fem frågor gratis, testerna | Allt (coach, matchning, intervju) |
| fardiga-personliga-brev | letter | Skriv mitt personliga brev | Brevkortet | Skriv mitt personliga brev | CV och brev |
| online-cv-byggare-gratis | cv, men taggen "ats-vänligt cv" ger `analys` | Analysera mitt CV | CV-analysen | Välj en mall | CV och brev |

Ingen av ändringarna nedan rör title, H1, meta, URL eller taggar. Förslagen på kod (avsnitt 1 och 3) håller taggarna orörda just för att inte röra SEO. Textförslagen är budskap och ordning; copy formulerar slutligt.

---

## 1. din-digitala-jobbcoach

**Omdöme: godkänd efter ändringar**

### Måste ändras

1. **Fel verktyg runt texten.** Artikeln säljer Jobbcoachen, men taggen "intervjuförberedelse" lägger den i intervjuklustret. Då hamnar provkortet om logiktest direkt efter första stycket ("Du har troligen redan provat ... AI-chatt"), och mobilknappen säger "Prova fem frågor gratis". Läsaren som kom för en AI-jobbcoach får ett matrisprov som första erbjudande, och tre olika mål på samma sida (coach, test, test). Förslag i koden, utan att röra taggarna: i `inlineVerktygForKluster`, före switchen, `if (harTagg(tags, ['jobbcoach'])) return 'coach'`, och låt sidan skicka `label`/`href` för Jobbcoachen till `StickyMobileCTA` när verktyget är `coach`. Kontrollera med `scripts/audit-cta-clusters.ts` vilka fler artiklar regeln träffar (vad-ar-en-jobbcoach, jobbcoach-online bör också vilja ha den).
2. **"Vår [Jobbcoachen] är byggd för en sak."** Felaktig svenska. Föreslagen text: "[Jobbcoachen](/verktyg/jobbcoachen) är byggd för en sak."

### Kan förbättras

- **Bryggan kommer för sent.** Fem avsnitt lär läsaren använda vilken AI-chatt som helst; skälet att välja vår (svensk kunskapsbas, källa i svaret, sparat CV bifogat) står först i avsnitt sju. En mening efter frågetabellen räcker: "Frågorna i högra kolumnen fungerar i vilken AI-tjänst som helst. I [Jobbcoachen](/verktyg/jobbcoachen) bifogar du ditt sparade CV i stället för att klistra in det, och svaren om svensk arbetsmarknad visar vilken källa de bygger på."
- **Coachkortets text är skriven för intervjuartiklar** ("Träna svaret innan du sitter i rummet"). Fungerar här men smalnar av. Vill copy ha en egen vinkel för coachartiklarna: rubrik "Fråga om ansökan du sitter med just nu", text "Klistra in annonsen eller bifoga ditt CV och fråga om kravprofilen, brevet eller intervjun. Tio meddelanden utan att betala."
- **"Tio frågor" eller "tio meddelanden".** Artikeln säger meddelanden, coach- och gratiskortet säger frågor. Kvoten räknar meddelanden; korten bör säga samma sak som artikeln (`reklam-copy.ts`, INLINE.coach och GRATIS_KORT).
- "ett femtiotal dokument" i kunskapsbasen: verifiera antalet mot basen före live.

Prissägningen sitter rätt: eget avsnitt sist, gratis först, priset en gång plus FAQ, inga intervjulöften ("Vi lovar inga siffror om fler intervjuer" är bra). Sista länken går till /register, som är målet.

---

## 2. fardiga-personliga-brev

**Omdöme: godkänd efter ändringar**

### Måste ändras

1. **Premium beskrivs bara som nedladdning.** Avsnittet "Snabbare: ett färdigt brev ..." och FAQ:n säger att Premium ger PDF och Word, men inte att breven blir utan tak. Det är just det som grundbrevsläsaren ("Söker du tio i veckan") behöver, och det som verktygssidan och korten säger. Föreslagen text för sista meningen i kostnadsstycket: "Vill du skriva fler brev än ett i veckan, eller ladda ner dem som PDF eller Word i någon av våra brevmallar, ingår det i Jobbcoach Premium för 149 kr i månaden." Samma tillägg i FAQ-svaret "Kan jag få ett färdigt brev skrivet utifrån mitt CV gratis?": "... Fler brev än ett i veckan och nedladdning som PDF eller Word ingår i Jobbcoach Premium för 149 kr i månaden."
2. **"I Jobbcoach Premium kan vi i stället välja tonen åt dig"** hittar jag inte i koden. Verifiera mot brevverktyget; finns funktionen inte, stryk meningen.

### Kan förbättras

- **Knyt grundbrevsmetoden till verktyget.** Efter "Söker du ett jobb i månaden ... Söker du tio i veckan behöver du metoden nedan." kan en mening stå sist i metoden: "Söker du många jobb i veckan gör [brevverktyget](/verktyg/personligt-brev) steg 4 och 5 åt dig: det läser annonsens krav och skriver inledningen mot ditt CV." Det är den läsaren som har störst nytta av brev utan tak.
- **Konkurrentlänkar i källorna.** CVkungen och personligt-brev.net länkas ut. Citatet från personligt-brev.net bär texten och kan behålla länken; CVkungen-länken belägger bara "över 100 exempel" och skickar läsaren till en mallsajt. SEO avgör.
- Sidokortet i CV- och brevklustret har rubriken "Ett CV som går igenom första urvalet". På en brevartikel vore en brevrubrik bättre, men det är en klusterfråga för korten, inte för artikeln.

Inline-kortet ("Skriv det personliga brevet på annonsen, inte på mallen") efter första stycket passar sökavsikten "färdigt brev" bra, och hjälte, kort och mobilknapp pekar på samma mål. Bryggan efter tabellen ("Vill du slippa pussla själv?") är rätt placerad.

---

## 3. online-cv-byggare-gratis

**Omdöme: godkänd efter ändringar**

### Måste ändras

1. **Fel verktyg i hjälten och inline-kortet.** Taggen "ats-vänligt cv" gör att CV-artiklar om ATS får CV-analysen. Här är målet byggaren: läsaren söker "skapa cv online gratis" och får "Analysera mitt CV" som första knapp, medan mobilknappen säger "Välj en mall". Förslag i koden: i `inlineVerktygForKluster`, fallet `cv`, låt taggar med "cv byggare" eller "cv-byggare" ge `mallar` före ATS-regeln. Mallkortet ("Tre mallar och en nedladdning utan att betala") svarar dessutom på artikelns fråga redan efter krokstycket om prisrutan.
2. **"Så är du ute efter att ladda ner tio versioner gratis är vi fel byggare för dig."** Att redovisa exakt var gratisnivån tar slut är en styrka; det är artikelns hela löfte, och tabellraden "Gratis med tak (vår modell)" bär trovärdigheten. Men meningen skickar bort fel person. Den som vill ladda ner tio versioner söker många jobb och anpassar CV:t till varje annons, det vill säga precis den läsare som har nytta av Premium och som artikeln själv argumenterar för ("Fråga dig därför vad det kostar att komma tillbaka"). Behåll öppenheten, byt avvisningen mot ett nästa steg. Föreslagen text för hela stycket:

   > Ska du skicka många ansökningar och ladda ner en anpassad version till varje, räcker gratisnivån inte. Då är det Premium du ska jämföra med veckoabonnemangen i tabellen ovan: 149 kr för en hel månad med nedladdning utan tak och alla 41 mallar. Vill du först bygga ett genomarbetat CV med en mall som systemen läser och ladda ner det en gång, gör du det gratis i [vår CV-byggare](/verktyg/skapa-cv). Du kan [se alla 41 mallar](/verktyg/cv-mallar) innan du bestämmer dig, och vill du veta hur texten håller läser vår [CV-analys](/verktyg/cv-analys) igenom CV:t och pekar ut vad som kan stärkas. En analys ingår gratis per konto.

3. **Vår egen modell måste klara artikelns egen checklista.** Artikeln ber läsaren kräva svar på om abonnemanget förnyas automatiskt och hur man säger upp det. Vårt stycke säger "Ingen bindningstid, ingen provperiod som förnyas i tysthet", men inte att Premium förnyas varje månad. Läsaren som just lärt sig läsa det finstilta märker luckan. Föreslagen text i stället för den meningen: "Premium förnyas varje månad tills du säger upp det, utan bindningstid och utan provperiod, och priset står på [prissidan](/priser) innan du börjar."

### Kan förbättras

- **Två mallvisningar.** Sidan lägger in `CVTemplateShowcase` vid ungefär 60 procent av texten, och artikeln har dessutom `<InteractiveCVShowcase />` i produktavsnittet. Kontrollera den renderade sidan; står de nära varandra, ersätt den ena.
- **Sista raden i tabellen "Sju saker att kolla"** ("hos oss kräver den Premium") kan länka Premium till /priser, eftersom stycket under tabellen är artikelns starkaste argument för att komma tillbaka.
- **Artikeln slutar i innehållsråd utan väg tillbaka till byggaren.** En mening sist i "Byggaren gör layouten, du gör innehållet": "När raderna sitter bygger du CV:t i [vår CV-byggare](/verktyg/skapa-cv); tre mallar och en nedladdning ingår gratis."

Svaret på frågan om öppenheten: den är en styrka och ska stå kvar, med siffrorna. Det som kostar konvertering är inte redovisningen av gratisgränsen utan att texten sätter punkt där, i stället för att visa vägen vidare för den som behöver mer.

---

## Mätning

Hypotes, inte belagt: rätt verktyg i hjälten och inline-kortet höjer klick till målverktyget och kontoskapandet från de två första artiklarna, och den omskrivna meningen höjer Premiumköp från CV-byggarartikeln utan att sänka kontoskapandet. Följs i PostHog per slug med `article_cta_clicked` (position hero, inline, sticky, final) och kontoskapande och köp attribuerade till artikeln, fyra veckor före mot fyra veckor efter deploy. Black Week (23-29 nov) stör köpdatat; läs köpen från och med 1 december och klicken direkt. Under kampanjveckan visar korten kampanjpriset medan artiklarna säger 149 kr; det är avsiktligt och kräver ingen ändring.

## Runda 2

Runda 2 (2026-11-15): alla måste-ändringar kontrollerade i filerna och införda; tonvalet i Premium är verifierat (TonalityLanguageStep). Godkänd för alla tre artiklarna. Inga blockerare. Uppföljning, inte blockerare: mobilknappen i din-digitala-jobbcoach pekar på testerna medan hjälten och inline-kortet pekar på Jobbcoachen; läs av klicken per position efter deploy och ta upp det om sticky-klicken på den sidan inte leder till konton. "Tio frågor" i reklam-copy.ts tas som eget ärende.
