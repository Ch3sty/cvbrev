# SEO-utlåtande: tre omskrivna artiklar (svep 2026-11-15)

SEO-strategen, 2026-11-15. Granskat i worktree publikt-v2 mot SEO-planerna i docs/qa/artiklar-omskrivning-2026-11/, livesidornas texter (docs/qa/seo-diff/svep-artiklar-fore-live.json; filen svep-texter-fore-live.json finns inte, det här är den som finns), src/lib/cta/clusters.ts och artikelsidans injektion i src/app/(public)/artiklar/[slug]/page.tsx.

## Mekaniska kontroller (gray-matter, alla tre)

| Artikel | seoTitle | description | taggar | faq = FAQItem | em-dash | howto |
|---|---|---|---|---|---|---|
| din-digitala-jobbcoach | 48 | 154 | 7 | 6 = 6 | 0 | 6 steg, äkta sekvens |
| fardiga-personliga-brev | 51 | 143 | 6 | 6 = 6 | 0 | 5 steg, äkta sekvens |
| online-cv-byggare-gratis | 50 | 151 | 7 | 6 = 6 | 0 | 6 steg, äkta sekvens |

Alla interna länkar finns: varje /artiklar/<slug> har en mdx-fil, alla /verktyg/* har en route, /priser och /register finns, /personligt-brev-exempel/{ekonomiassistent,underskoterska,butikssaljare} och /cv-exempel/{samma} finns i sitemap.ts, kategorierna vard/ekonomi/service finns i exempel-data.ts. Personerna i exempelbreven (Anna Bergström, Lisa Andersson, Emma Karlsson) är samma som på yrkessidorna, så CV- och brevparet stämmer. Breven är omskrivna och inte kopierade ordagrant, så det blir inget duplicerat innehåll. Inga canonical- eller ld+json-block. Snabbsvaret står direkt efter ingressen i alla tre.

Risken att tappa rankade frågor är i praktiken noll för alla tre. Gamla versionerna hade 0 till 22 visningar på ett år och inga frågor med klick, och online-cv-byggare-gratis är enligt URL-inspektionen okänd för Google.

**Rättelse om CTA-klustret (gäller din-digitala-jobbcoach):** intervjuklustret ger inte längre Jobbcoachen som inline-kort. Sedan S6 (2026-11-15) returnerar `inlineVerktygForKluster('interview')` värdet `'test'`, alltså provkortet med fem matrisfrågor. Hjälteknappen pekar fortfarande på Jobbcoachen (artikel-kluster.ts), sidokortet blir "Förberedd in i intervjun och löneförhandlingen" och hjältens etikett blir "Jobbintervju". Klustret är ändå det minst dåliga valet, se artikeln nedan.

---

## 1. din-digitala-jobbcoach

Sökavsikten stämmer med planen. Artikeln går på "söka jobb med AI" och "ai jobbansökan" och lämnar definitionen åt vad-ar-en-jobbcoach och jämförelsen åt jobbcoach-online. Den gamla H2:an "Vad gör en jobbcoach, egentligen?", som krockade med vad-ar-en-jobbcoach, är borta. Det enda den hänvisar till är en mening med länk, och ankartexterna är rätt valda. Djupet ligger långt över SERP:en: frågetabellen, forskningen och rekryterarsiffran. Alla citat som jag kontrollerade stämmer, Kollega-citatet med Edvard Danielsson inräknat.

**Måste ändras**
1. **Huvudsökordet saknas i description och i brödtexten.** "söka jobb med AI" står bara i seoTitle och i taggarna. H1 säger "söker du jobb med AI", men ingen H2 och inget stycke har frasen.
   - description (141 tecken): `Söka jobb med AI utan att låta som alla andra: så använder du AI som jobbcoach för annonsen, CV:t, brevet och intervjun, och var gränsen går.`
   - Snabbsvarets rubrik: `Snabbsvar: hur söker man jobb med AI?` (första meningen kan stå kvar)
   - Ingressens sista meningar: `Frågan är alltså inte om du ska söka jobb med AI. Frågan är hur du gör det så att ansökan blir bättre, och inte bara snabbare.`
2. **Bild och alt hänger inte ihop.** Underlaget (docs/qa/artikelbilder/underlag/din-digitala-jobbcoach.json) har ny alt för en STAR-bild, men webp-filen är inte omgenererad och frontmatterns imageAlt och CustomImage-alt beskriver fortfarande den gamla säljbrevsbilden. Generera om bilden och sätt sedan både `imageAlt` och `alt` i `<CustomImage>` till: `Intervjufråga till en digital jobbcoach med svarets fyra delar enligt STAR och resultatet markerat`.
3. **Inlänkar (vid publicering, separat ändring):** sidan har noll inlänkar. Lägg till en kontextuell länk med ankartext kring "söka jobb med AI" från vad-ar-en-jobbcoach, jobbcoach-online och skriva-personligt-brev-med-ai. Annars rankar den inte, hur bra texten än är.

**Kan förbättras**
- seoTitle har plats över: `Söka jobb med AI 2026: så använder du en AI-jobbcoach` (53).
- "ChatGPT" förekommer inte alls, trots att det är det läsaren faktiskt har provat. Lägg in ordet en gång i ingressen ("Klistrat in en annons i ChatGPT eller en annan AI-chatt ...").
- Språkfel: "Vår [Jobbcoachen] är byggd för en sak." Skriv `[Jobbcoachen](/verktyg/jobbcoachen) är byggd för en sak.`
- CTA-klustret: behåll taggen "intervjuförberedelse". Alternativen är sämre. Utan den vinner "CV och personligt brev med AI" letter-klustret (brevkort). Med karriär- eller lönetaggar blir det räknarkortet. Interview ger nu provkortet inline. Det är acceptabelt, eftersom artikeln nämner rekryteringstesterna, men det är inte idealiskt för en coachartikel. Vill ni ha Jobbcoachen inline här krävs ett eget coachkluster eller ett undantag i inlineVerktygForKluster, och det är ett beslut för saas-lead, inte en artikeländring.

**Omdöme: godkänd efter ändringar** (punkt 1 och 2; punkt 3 vid publicering)

---

## 2. fardiga-personliga-brev

Den starkaste av de tre. Huvudsökordet står först i seoTitle, description, H1 och snabbsvaret, och H3:orna har "Färdigt personligt brev för <yrke>". Vinkeln är tydligt skild från personligt-brev-exempel-generella (den lär ut hur man läser exempel, den här ger färdiga brev och visar vad du byter) och från personligt-brev-mall-gratis (fyra-delar-genomgången upprepas inte, den länkas). AI-frågorna lämnas åt skriva-personligt-brev-med-ai. Hubben /personligt-brev-exempel länkas i snabbsvaret och i första H2:an, så konverteringen leder. Taggarna ger klustret letter, brevkortet inline och etiketten "Personligt brev", vilket är rätt. "89" stämmer med BREV_GALLERI (89 poster, ett per yrke).

**Måste ändras**
1. **Bild och alt, om bilden genereras om:** underlaget har ny alt. Sätt i så fall både `imageAlt` och `alt` i `<CustomImage>` till: `Färdigt personligt brev för en ekonomiassistent där inledningen som ska skrivas om är inringad`. Står den gamla bilden kvar stämmer den nuvarande alt-texten.
2. **Inlänkar (vid publicering, separat ändring):** noll inlänkar i dag. Lägg till en länk med ankartexten "färdiga personliga brev" från personligt-brev-exempel-generella (som i dag tar 140 av 208 visningar på frågan, så länken talar om för Google vilken sida som äger den), personligt-brev-mall-gratis och tips-pa-personligt-brev.

**Kan förbättras**
- H2 "Snabbare: ett färdigt brev skrivet utifrån ditt CV och annonsen" kan göras frågeformad och matcha FAQ 6: `Kan du få ett färdigt brev skrivet utifrån ditt CV?`
- description kan använda mer bredd (151): `Färdiga personliga brev för tre yrken att utgå från. Se vilka stycken du kan behålla, vilka du måste skriva om och varför kopior syns hos rekryteraren.`
- "laddar du upp ditt CV" i produktavsnittet och i FAQ 6: inloggat utgår brevet från ett sparat CV (cv_id). "utgår från ditt sparade CV" är exaktare. Det är produktfakta, inte SEO.
- GSC-avläsning 4 och 8 veckor efter publicering: att exempel-generella inte tappar mer på "färdiga personliga brev" än den här artikeln vinner.

**Omdöme: godkänd efter ändringar** (bara alt-texten om bilden byts; inlänkarna vid publicering)

---

## 3. online-cv-byggare-gratis

Rätt avgränsning: utvärderingsavsikten ("gratis cv-byggare", "vad är gratis på riktigt") i stället för transaktionen som /verktyg/skapa-cv äger. Länkarna till cv-mall-gratis-guide, word- och pdf-mallen, skapa-cv-med-ai och ladda-upp-cv-linkedin håller isär klustret. Ärlighetsvinkeln med Konsumentverket som ryggrad saknas helt i SERP:en. Jag har kontrollerat tre påståenden som inte fanns i planens research, och alla står i källan: Arbetsförmedlingens "Fel filformat eller saknade uppgifter kan leda till automatisk bortsortering" och "Algoritmer har svårt för vaga formuleringar ...", och Konsumentverkets "Uppsägningstiden ska inte överstiga 30 dagar (MD 2015:3)". De inlänkar som redan finns (cv-mall-gratis-guide rad 198, cv-pa-engelska-resume rad 535, skriva-cv-guide rad 150) passar fortfarande med den nya texten.

**Måste ändras**
1. **Felaktigt produktpåstående som motsäger artikelns eget ATS-råd.** Avsnittet "Så fungerar vår CV-byggare" säger att "alla är byggda i en kolumn med svenska standardrubriker så att rekryteringssystemen läser dem rätt". I src/lib/cv/simple-templates.ts har 17 av 41 mallar `columns: 2` och 11 har `atsSafe: false`, och en av de tre gratismallarna har två kolumner. Föreslagen text: `Alla 41 mallar går att förhandsvisa med ditt innehåll, och tre av dem är gratis att ladda ner. Ska CV:t gå genom ett rekryteringssystem, välj en mall i en kolumn med vanliga rubriker.`
2. **Taggen "ats-vänligt cv" byter inline-kortet till CV-analysen.** `inlineVerktygForKluster('cv')` ger `'analys'` så fort någon tagg innehåller "ats". För en artikel om att bygga CV är mallkortet ("Bygg CV:t på en mall som rekryteringssystem läser", /verktyg/cv-mallar) rätt mål, och det var det den gamla versionen fick. Byt taggen `"ats-vänligt cv"` mot `"cv-mallar"`. Klustret blir fortfarande cv och inline-kortet mallar.
3. **Bild och alt:** underlaget har ny alt (butikssäljare) men webp-filen är inte omgenererad. Generera om bilden och sätt `imageAlt` och CustomImage-alt till: `CV i en online CV-byggare med en resultatrad för en butikssäljare och tre kontroller`.
4. **Indexering (ägaren, efter deploy):** URL:en är okänd för Google. Begär indexering i Search Console. Lägg dessutom till en länk med ankaret "gratis CV-byggare" från skapa-cv-med-ai (den bäst placerade CV-artikeln, position 13,5).

**Kan förbättras**
- Snabbsvaret är cirka 140 ord, i överkant mot kvalitetsribban (110 till 130). Stryk upprepningen av de fem modellerna, som står i tabellen strax nedanför, och behåll treregeln och vår gratisnivå.
- Källraden står före FAQ, medan de två andra artiklarna har den efter. Flytta den efter `</FAQContainer>` så att alla artiklar ser likadana ut.
- Sidan får tre CTA:er: inline-kortet, CVTemplateShowcase som injiceras automatiskt vid 60 procent i cv-klustret, och den manuella `<InteractiveCVShowcase />`. Kontrollera i webbläsaren att två av dem inte hamnar intill varandra kring "Så fungerar vår CV-byggare".
- seoTitle kan ta med "online" utan att jaga transaktionsfrågorna: `Gratis CV-byggare online 2026: så undviker du betalväggen` (57).

**Omdöme: godkänd efter ändringar** (punkt 1 till 3; punkt 4 vid publicering)

---

**Runda 2 (2026-11-15):** Alla ändringar kontrollerade i filerna. Mekaniskt: seoTitle 53/51/50, description 141/143/151, faq 6 = FAQItem 6 i alla tre, 0 em-dash. CTA mot koden över alla 155 artiklar: din-digitala-jobbcoach interview → coach (enda artikeln som får coachkortet), fardiga-personliga-brev letter → brev, online-cv-byggare-gratis cv → mallar. Kolumnpåståendet stämmer nu mot simple-templates.ts (Norrsken och Student en kolumn, Sidopanel två). Bilderna är omgenererade och alt-texterna synkade i frontmatter och CustomImage. Inlänkar finns på plats till alla tre. Inga blockerare kvar. Ägaren begär indexering av /artiklar/online-cv-byggare-gratis i Search Console efter deploy. **Omdöme: alla tre godkända.**
