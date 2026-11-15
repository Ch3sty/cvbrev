# Copygranskning: tre omskrivna artiklar, 2026-11-15

Granskare: svensk UX-copywriter (Fable). Jämfört mot tester-hos-myndigheter, logiktest-tips och ai-rekrytering-sverige samt minnesreglerna om copywriting-stil, inga talstreck, bibehållen substans och svenska facktermer.

Helhet: alla tre håller den nya ribban. Vi-form, källor med datum, varierad rytm, konkreta exempel, inga talstreck, inga slop-fraser. Ingresserna är de bästa delarna. Det som drar ner är ett engelskt fackord, två passiva produktmeningar där vi ska säga "vi", ett produktpåstående som inte stämmer, och FAQ-svar som upprepar brödtexten nästan ordagrant.

Radnummer avser filerna i arbetskopian `.claude/worktrees/publikt-v2/content/artiklar/`.

---

## 1. din-digitala-jobbcoach.mdx

**Omdöme: godkänd efter ändringar**

### Måste ändras

| Rad | Nu | Föreslaget |
|---|---|---|
| 157 | "Vår [Jobbcoachen](/verktyg/jobbcoachen) är byggd för en sak." | "[Jobbcoachen](/verktyg/jobbcoachen) är byggd för en sak." Possessiv plus bestämd form ("vår Jobbcoachen") är inte svenska. |
| 145 | "Ett påhittat resultat i brevet blir en fråga på intervjun, och då står du där utan exempel. Referenstagningen kommer efter det." | "Ett påhittat resultat i brevet blir en fråga på intervjun, och då står du där utan exempel. Klarar du ändå intervjun väntar referenstagningen." Sista meningen hänger i luften som den står. |

### Kan förbättras

- Rad 50, H2 "Vad kan en AI-jobbcoach hjälpa dig med?" → "Vad använder du en AI-jobbcoach till?" Skarpare, och slipper "hjälpa dig"-mönstret.
- Rad 52: "och var i vår artikelserie du läser vidare om varje" → "och var du läser vidare om varje". "Artikelserie" är internt språk.
- Rad 169–173 och FAQ rad 39/205 säger samma sak med nästan samma ord. Korta FAQ-svaret till två meningar: "Tio meddelanden är gratis, utan kortuppgift. Vill du fortsätta ingår Jobbcoachen utan tak i Jobbcoach Premium för 149 kr i månaden utan bindningstid."
- FAQ 1 och 2 (rad 29 och 31) bygger båda på samma 44-procentssiffra, som dessutom står i brödtexten rad 68. Tre gånger är en för mycket. Låt FAQ 1 ("Är det fusk") stå utan siffran: "Nej, så länge allt du skickar är sant och ditt. Det rekryterare reagerar på är den oredigerade texten, inte hjälpen. Använd AI för att tolka annonsen, hitta luckor och få ett utkast, men skriv om med dina egna exempel och hitta aldrig på meriter."
- FAQ rad 37 upprepar Arbetsförmedlingscitatet från rad 60. Stryk sista meningen i FAQ-svaret.

### Flagga för källkoll (inte copy)

- Rad 157: "ett femtiotal dokument om CV, lön, intervju, arbetsrätt, a-kassa, aktivitetsrapportering och omställningsstudiestöd" och "varje uppgift ur basen märks med (Källa N) i svaret". Kontrollera mot kunskapsbasen och den faktiska utskriften i Jobbcoachen.
- Rad 173: gratisnivån ("tre CV-mallar, en CV-analys ..., ett personligt brev att läsa och sedan ett i veckan, tre träffar ..., Nivåkollen med ett första träningspass"). Stäm av mot /priser och den justering av gratisnivån som gjordes i 82b7ba0b.
- Rad 68: "Mest negativ var handeln, där åtta av tio rekryterare uppgav att de får en försämrad bild." Kontrollera att siffran står i Jobblands pressmeddelande.
- Ordet "AI-jobbcoach" i H2 och FAQ: acceptabelt här eftersom det är artikelns sökord, inte produktens namn. Produkten heter konsekvent Jobbcoachen i texten, bra.

---

## 2. fardiga-personliga-brev.mdx

**Omdöme: godkänd efter ändringar**

### Måste ändras

| Rad | Nu | Föreslaget |
|---|---|---|
| 205 | "bland 315 personer som arbetar med rekrytering, employer branding eller i ledning" | "bland 315 personer som arbetar med rekrytering, arbetsgivarvarumärke eller företagsledning". Engelskt fackord i löptext, och samma undersökning beskrivs med svenska ord i din-digitala-jobbcoach rad 68. |
| 197 | "I [vårt brevverktyg](/verktyg/personligt-brev) klistrar du in annonsen, så skrivs inledningen och bevisen utifrån ditt CV och just den tjänsten." | "I [vårt brevverktyg](/verktyg/personligt-brev) klistrar du in annonsen, så skriver vi inledningen och bevisen utifrån ditt CV och just den tjänsten." Passiv där vi ska vara avsändare. |
| 241 | "Brevet skrivs utifrån båda: det som står i annonsens kravprofil matchas mot det som faktiskt står i ditt CV, så att inledningen och bevisen gäller just den tjänsten." | "Vi skriver brevet utifrån båda: vi läser annonsens kravprofil mot det som faktiskt står i ditt CV, så att inledningen och bevisen gäller just den tjänsten." |
| 46 (snabbsvar) | "Arbetsförmedlingen, Akavia och Saco ger samma råd: anpassa brevet till varje tjänst och håll det inom en A4-sida." | "Arbetsförmedlingen, Akavia och Fackförbundet ST ger samma råd: anpassa brevet till varje tjänst och håll det inom en A4-sida." Saco citeras i brödtexten (rad 203) bara för "skriv inte generella brev", inte för A4-längden. A4-källorna på rad 235 är Akavia, Vision, ST och Arbetsförmedlingen. Ingen faktaändring, bara rätt avsändare. |

### Kan förbättras

- Rad 115 (brev 3): "Under 2024 nådde jag 125 procent av mitt försäljningsmål det fjärde kvartalet och blev månadens säljare tre gånger." Två tidsangivelser i samma mening. → "Fjärde kvartalet 2024 nådde jag 125 procent av mitt försäljningsmål, och under året blev jag månadens säljare tre gånger."
- Rad 217 (H2 "på tio minuter") mot rad 231 ("tio till femton minuter") och howto-namnet ("anpassar till varje jobb"). Välj ett: "Så bygger du ett grundbrev som du anpassar på en kvart" och behåll "tio till femton minuter" på rad 231.
- Rad 219: "Så här går du till väga." är utfyllnad efter två meningar som redan säger det. Stryk.
- Rad 243: "Brevet kan skrivas på svenska eller engelska." → "Du väljer också om vi skriver på svenska eller engelska."
- Rad 247: "Hur du gör det utan att det märks" låter som att något ska döljas. → "Hur du gör det så att brevet låter som du".
- Rad 205: "Bara 9 procent" medan din-digitala-jobbcoach skriver "Bara nio procent". Välj bokstäver under tolv i löptext i båda.
- Rad 52: "från vård och omsorg och ekonomi till service och student". "Student" är inte en länk som de andra och är ingen bransch. → "... till service och brev för studenter."
- FAQ 4 (rad 33/284) är ett sammandrag av rad 203–205, FAQ 5 (rad 35/288) av rad 235 och FAQ 6 (rad 37/292) av rad 245. Behåll frågorna för schemat men korta svaren till två meningar vardera och ta bort personnamn och procentsatser som redan står i brödtexten.

### Flagga för källkoll (inte copy)

- "89 färdiga brev" (rad 27, 46, 52, 267). Räkna mot galleriet innan push; rad 267 säger "89 yrken", vilket bara stämmer om det är ett brev per yrke.
- Rad 241: "Utan konto kan du i stället beskriva yrke, arbetsgivare och erfarenhet i fritext och se det första stycket direkt." Kontrollera att det utloggade flödet fortfarande fungerar så.
- Citaten från Akavia på rad 235 ("måtstock", "2000-3000") är källans stavning och ska stå kvar ordagrant. Inget att ändra.

---

## 3. online-cv-byggare-gratis.mdx

**Omdöme: godkänd efter ändringar**

Starkast av de tre i ingressen och i ärligheten om vår egen gratisnivå (rad 219 är föredömlig). Men ett produktpåstående stämmer inte och måste bort innan publicering.

### Måste ändras

| Rad | Nu | Föreslaget |
|---|---|---|
| 215 | "och alla är byggda i en kolumn med svenska standardrubriker så att rekryteringssystemen läser dem rätt." | Stämmer inte. Minst två av våra mallar (`sidebar-icons`, `sidopanel-plus`) har sidopanel, alltså två kolumner, vilket artikeln själv varnar för på rad 142. Skriv i stället: "och de flesta är byggda i en kolumn med svenska standardrubriker så att rekryteringssystemen läser dem rätt. Mallarna med sidopanel är märkta i galleriet, välj en enkolumnsmall när du vet att ansökan går via ett rekryteringssystem." Kontrollera märkningen i galleriet innan du lovar den, annars stryk sista meningen. |
| FAQ rad 15/266 | "Det är lagligt så länge villkoren är tydliga" | "Det är tillåtet så länge villkoren är tydliga, enligt Konsumentverkets regler för abonnemang". Vi ska inte avge en juridisk bedömning med ordet "lagligt". |
| Struktur rad 254–286 | FAQ-blocket ligger efter källraden. | Flytta FAQ-blocket före `---` och källraden, som i de två andra artiklarna. |

### Kan förbättras

- Rad 48 (snabbsvar): "Vill du skapa ett CV online gratis, kontrollera tre saker innan du skriver en rad" är ett instoppat sökord som bryter rytmen. → "Kontrollera tre saker innan du skriver en rad". Snabbsvaret är också det längsta av de tre artiklarnas (cirka 120 ord); stryk den sista meningen om Premium, den står på rad 217.
- Rad 121: "Konsumentverket har tydliga regler för företag som kombinerar ett gratiserbjudande med ett abonnemang, i sin vägledning om abonnemang, uppdaterad i december 2025." Bisatsen hänger efter. → "I sin vägledning om abonnemang, uppdaterad i december 2025, ställer Konsumentverket tydliga krav på företag som kombinerar ett gratiserbjudande med ett abonnemang."
- Rad 148, H2 "Sju saker att kolla hos en CV-byggare" → "Sju kontroller innan du väljer CV-byggare". "Kolla" är ledigare än resten av artikeln.
- Rad 219: "ladda ner det en gång och se hur det känns" → "ladda ner det en gång och skicka det". "Känns" är vagt i en annars konkret text.
- Rad 247: "skapar ett CV med AI utan att det märks" → "skapar ett CV med AI som ändå låter som du". Samma invändning som i brevartikeln.
- FAQ 1 (rad 13/262) upprepar snabbsvaret nästan ordagrant. Korta till: "Några, men de flesta tar betalt när PDF:en ska laddas ner. Testa nedladdningen med ett nästan tomt CV innan du fyller i på riktigt, och läs texten vid betalknappen."

### Flagga för källkoll (inte copy)

- Rad 87 och 117: "0 kr i 7 dagar, därefter 69 kr/vecka" och räkneexemplet 900 kr på tre månader. Räkningen stämmer (69 × 13 = 897), men bekräfta att 69 kr/vecka är ett observerat pris hos en av de sex byggarna och inte ett konstruerat exempel. Står det som citat med citattecken måste det vara ordagrant.
- Rad 125: "Konsumentverket skriver också att uppsägningstiden inte ska överstiga 30 dagar." Kontrollera formuleringen mot vägledningen; om det är en rekommendation och inte ett krav ska det framgå.
- Rad 207: LinkedIns Spara som PDF "bara för medlemmar vars profilspråk är inställt på engelska". Källan är listad, men bekräfta att det fortfarande står så på hjälpsidan.
- Rad 209: "Med Premium kan du också klistra in profilens avsnitt i vår LinkedIn-optimering och spara resultatet som ett CV." Kontrollera att funktionen finns och är Premium-låst.

---

## Mönster att ta med till nästa omskrivning

1. FAQ-svaren ska vara självbärande för schemat, men inte kopior av brödtexten. Två meningar räcker; spara personnamn och procent till brödtexten.
2. När vi beskriver vad verktyget gör: aktiv vi-form. "Brevet skrivs" och "så skrivs inledningen" är de enda passiverna om produkten i tre artiklar, men de syns.
3. Produktpåståenden om "alla" (alla mallar, alla brev) ska stämmas av mot koden innan de skrivs. Enkolumnslöftet var det allvarligaste fyndet i svepet.
4. "Utan att det märks" återkommer i två artiklar om AI-skrivande. Vi menar "så att det låter som du", och det är också vad vi bör skriva.

---

## Runda 2 (2026-11-15)

Måste-ändringarna och de flesta kan-förbättringarna är införda och kontrollerade i filerna. De nya meningarna (din-digitala-jobbcoach rad 135 om Jobbcoachen efter frågetabellen; online-cv-byggare-gratis rad 215 om enkolumnsmallar och sidopanel, rad 217 om att Premium förnyas månadsvis, rad 219 om när gratisnivån inte räcker; skapa-cv-med-ai rad 105 länkmening) är vi-form, utan talstreck och i samma ton som resten. "Innan du skapar ett CV online gratis, kontrollera tre saker:" godtas som SEO-kompromiss. FAQ 5 i brevartikeln får stå. Inga blockerare kvar. Alla tre artiklar: **godkänd**. Kvarstående källkollar (89 brev, gratisnivån, Norrsken/Student som gratismallar, 69 kr/vecka, Konsumentverkets 30 dagar, LinkedIn-PDF) är faktagranskarens, inte copyns.
