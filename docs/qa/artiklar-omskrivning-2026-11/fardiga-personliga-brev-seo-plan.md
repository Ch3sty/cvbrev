# SEO-underlag: /artiklar/fardiga-personliga-brev (omskrivning från grunden, 2026-11-15)

SEO-strateg (opus). Slug behålls. Underlaget är copywriterns enda källa: allt som står som fakta nedan är kontrollerat i källtexten eller i koden. Det som är min bedömning står som bedömning.

Bakgrund: gamla artikeln hade påhittade siffror (92 %, 2,6 gånger), fel dataskyddslöfte och obelagda procentsatser, se docs/qa/faktagranskning-2026-11/fardiga-personliga-brev.md. Ingenting av den gamla texten ska återanvändas som fakta. Bilden `/images/artiklar/fardiga-personliga-brev-v2.webp` och dess imageAlt (ekonomiassistent) kan behållas om ekonomiassistent är ett av exemplen nedan.

---

## 1. Search Console

Egendom sc-domain:jobbcoach.ai. Perioder: 90 dagar = 2026-08-16 till 2026-11-13, 12 månader = 2025-11-14 till 2026-11-13.

### 1a. Sidans egna frågor

| Period | Visningar | Klick | Position | CTR |
|---|---|---|---|---|
| 90 dagar | 0 (inga rader) | 0 | – | – |
| 12 månader | 22 (alla i maj 2026) | 0 | 59,4 | 0 % |

Frågorna under 12 månader, alla AI-frågor, ingen enda på "färdiga":

| Fråga | Visn. | Pos. |
|---|---|---|
| ai personligt brev | 4 | 72 |
| ai personligt brev gratis | 4 | 92 |
| personligt brev ai | 2 | 63,5 |
| ai skriva personligt brev | 1 | 87 |
| skriva personligt brev ai | 1 | 96 |
| skriva personligt brev med ai | 1 | 97 |

**Fynd 1: sidan är i praktiken osynlig i Google.** 22 visningar på ett år, inga sedan maj. Den gamla AI-vinkeln ("snabbare väg till drömjobbet med AI") gjorde att Google läste den som en AI-sida och lät den tappa mot /artiklar/skriva-personligt-brev-med-ai. Det finns ingen trafik att förlora på en omskrivning.

**Fynd 2: sidan är föräldralös.** Ingen annan fil i content/ eller src/ länkar till /artiklar/fardiga-personliga-brev (grep). Det är troligen en stor del av förklaringen till att den inte rankar. Se avsnitt 3h om inlänkar.

(Obs: i en amerikansk WebSearch på "färdiga personliga brev" låg den gamla artikeln först. Det säger inget om google.se, där GSC visar att den inte syns.)

### 1b. Vem på sajten som syns för frågorna i stället

**"färdiga personliga brev" (exakt fråga), 12 månader: 208 visningar, 1 klick, snittposition 22,5.** 90 dagar: 36 visningar, 1 klick, pos 17,3.

| Sida | Visn. 12 mån | Pos. | Visn. 90 d | Pos. |
|---|---|---|---|---|
| /artiklar/personligt-brev-exempel-generella | 140 | 22,3 | 9 | 24,1 |
| /personligt-brev-exempel (hubben) | 41 (1 klick) | 17,6 | 11 (1 klick) | 15,9 |
| /artiklar/skriva-personligt-brev-guide | 14 + 5 | 57,6 / 19,0 | 5 | 19,0 |
| /artiklar/rubrik-for-personligt-brev | 5 | 37,6 | 5 | 37,6 |
| /artiklar/personligt-brev-mall-gratis | 5 | 68,6 | 1 | 52 |
| /artiklar/personligt-brev-exempel-situationer | 4 | 7,0 | 4 | 7,0 |
| /artiklar/personligt-brev-layout | 3 | 8,3 | 3 | 8,3 |
| /personligt-brev-exempel/student | 3 | 19,3 | 3 | 19,3 |

Närliggande frågor (12 mån, alla sidor): "andras personliga brev" 10 visn. pos 42; "personligt brev gratis" 41 visn. pos 38; "gratis personligt brev" (till flera sidor) ~1 100 visn. pos 38–68.

AI-frågorna (12 mån): "personligt brev ai" 458 visn., "ai personligt brev" 184, "skriva personligt brev med ai" 143. De går till startsidan (/), /artiklar/skriva-personligt-brev-med-ai (pos 50–56) och /artiklar/personligt-brev-exempel-generella. **Den nya artikeln ska inte jaga AI-frågorna**, de tillhör skriva-personligt-brev-med-ai och verktygssidan.

/verktyg/personligt-brev (12 mån 591 visn., 3 klick, pos 39,5) får "gratis personligt brev", "personligt brev mall gratis", "mall för personligt brev", "hjälp med personligt brev", "personligt brev ai". Ingen "färdiga"-fråga.

Kluster, 12 månader, totalt: /artiklar/personligt-brev-exempel-generella 4 069 visn. pos 54,9; /artiklar/personligt-brev-mall-gratis 2 022 pos 56,0; /artiklar/skriva-personligt-brev-guide 1 727 pos 38,5; /personligt-brev-exempel 1 617 pos 31,3.

### 1c. Kannibalisering och bedömning

- **Största risken är /artiklar/personligt-brev-exempel-generella** (seoTitle "Så använder du exempel på personligt brev utan att kopiera"). Den tar idag 140 av 208 visningar på "färdiga personliga brev" och har en nära vinkel (låna vs kopiera, från svagt till starkt). Ändra inte den sidan, men gör vår artikel tydligt annorlunda: *färdiga brev att utgå från, fullständiga, med markering stycke för stycke av vad som kan stå kvar och vad som måste skrivas om, plus grundbrevsmetoden för den som söker många jobb.* exempel-generella handlar om att läsa och lära av exempel; vi handlar om att ta ett färdigt brev och bli klar.
- /artiklar/personligt-brev-mall-gratis äger "mall gratis" och strukturen i fyra delar. Upprepa inte fyra-delar-genomgången; länka dit.
- /personligt-brev-exempel (hubben, 89 brev) är den sida som faktiskt får klicket. Artikeln ska leda dit, högt upp, inte konkurrera med den. Huvudtermen "färdiga personliga brev" kan delas: hubben svarar "ge mig brev", artikeln svarar "hur gör jag ett färdigt brev till mitt". Om artikeln efter 8–10 veckor fortfarande ligger under hubben är det acceptabelt.
- /artiklar/skriva-personligt-brev-med-ai äger AI-frågorna. AI nämns bara som en av tre vägar till ett färdigt brev, med länk dit.

### 1d. Sökavsikt

"färdiga personliga brev" är en blandad avsikt, mest transaktionell: personen vill ha ett brev som är klart eller nästan klart, nu. SERP:en domineras av mallsajter och exempelsamlingar. Det som hjälper på riktigt:
1. Fullständiga brev att utgå från, direkt i artikeln (inte bara länkar).
2. Exakt vad man ska ändra, så att man blir klar fort.
3. En ärlig varning: samma brev ligger hos tusentals andra sökande.
4. En snabbare väg om man söker många jobb (grundbrev + utbytbara stycken, eller verktyget).

---

## 2. SERP-benchmark

WebSearch "färdiga personliga brev" och "färdigt personligt brev exempel att kopiera" (2026-11-15). Topp: personligtbrev.se (mallar), cv-proffset.se, personligt-brev.net/fardiga-personliga-brev, cvkungen.se, cv-mallen.se, Unionen (mallar), karriarguiden.se, cowrite.com.

| Sida | Ord (ca) | H2:or | Fullständiga brev i texten | Tar upp kopiering |
|---|---|---|---|---|
| [personligt-brev.net/fardiga-personliga-brev](https://personligt-brev.net/fardiga-personliga-brev/) (exakt matchande URL) | 200–250 | Våra färdiga personliga brev; Populära brev; Bra länkar | 0 (5 länkade: administratör, butikssäljare, chefsassistent, lärare, ungdom) | Bara en mening: "du har kommit fel om du söker ett helt färdigt personligt brev där du bara kan byta namn och skicka in" |
| [cv-proffset.se/personligt-brev-exempel](https://cv-proffset.se/personligt-brev-exempel/) | 2 500–3 000 (mest listor) | Personligt brev - färdiga exempel som inspiration; Vård och omsorg; Skola och utbildning; Försäljning och service; Teknik och hantverk; Kommunikation; Brev på olika språk; Kombinera ditt personliga brev med en CV-mall; Varför ska man använda exempel …; Så här använder du våra exempel …; Vanliga frågor | 0 (miniatyrer per yrke) | "kopiera aldrig rakt av", "Rekryterare märker snabbt om ett brev känns generiskt" |
| [personligtbrev.se/personligt-brev-mallar](https://www.personligtbrev.se/personligt-brev-mallar/) | 800–900 | Hitta en personligt brev mall; Lediga jobb!; Vad är viktigt i ett personligt brev?; Vad ska finnas med i ett personligt brev? | 0 (28 yrken i kategorier, nedklickbara) | Nej |

**Vad alla missar:**
- Ingen visar ett fullständigt brev direkt på sidan. Vi gör det (tre brev).
- Ingen visar stycke för stycke vad som kan stå kvar och vad som måste bytas.
- Ingen förklarar varför en kopia syns: samma text ligger öppet för alla som söker samma jobb (TNG: "identiska motivationstexter").
- Ingen har en metod för den som söker tio jobb i veckan (grundbrev med utbytbara stycken; Kommunal säger uttryckligen att delar kan återanvändas).
- Ingen svarar på om det är ok att använda samma brev flera gånger, med källor (Akavia, ST, Saco, Kommunal säger alla nej).

**Mål-längd: 2 000–2 400 ord synlig text**, varav de tre breven tar ca 600. Det överträffar cv-proffset i faktiskt innehåll (deras volym är listor) utan utfyllnad. Kortare än 1 800 gör vi inte, eftersom breven själva äter stor del av längden.

---

## 3. SEO-plan

### 3a. Sökord
- **Huvudsökord:** färdiga personliga brev
- **Sekundära:** färdigt personligt brev, personligt brev exempel (att kopiera/anpassa), personligt brev mall gratis, andras personliga brev, samma personliga brev till flera jobb, anpassa personligt brev
- **Inte:** personligt brev ai / skriva personligt brev med ai (tillhör annan artikel), personligt brev mall word (eget spår, Word-mallar rörs inte)

### 3b. Metadata (längder kontrollerade med skript)
- **title (H1, OG, schema):** "Färdiga personliga brev: tre exempel och hur du gör dem till dina" (65 tecken, får vara lång)
- **seoTitle:** "Färdiga personliga brev: 3 exempel att anpassa 2026" (51 tecken, utan varumärkessuffix; med " | jobbcoach.ai" blir den 66 och för lång)
  - Alternativ: "Färdiga personliga brev: 3 exempel och vad du ändrar" (52)
- **description:** "Färdiga personliga brev att utgå från, för tre vanliga yrken. Se vilka stycken du kan behålla, vilka du måste skriva om och varför kopior syns." (143 tecken)
  - Alternativ (149): "Färdiga personliga brev för tre yrken, med markering av vad du behåller och vad du skriver om. Plus var du hittar fler gratis och varför kopior syns."
- `updated: "2026-11-xx"` (publiceringsdagen), `date` behålls "2025-04-02". author oförändrad.

### 3c. Struktur (H2, frågeformade där det passar)

Ingress (3–4 meningar): du vill ha ett brev som är klart. Det finns, men samma brev ligger hos alla andra som söker jobbet. Här är tre färdiga brev och exakt vad du ändrar.

**Snabbsvar-block (GEO)**, direkt efter ingressen, rubrik "Snabbsvar: var hittar jag färdiga personliga brev?":
> Färdiga personliga brev finns gratis i vårt galleri med 89 brev per yrke (/personligt-brev-exempel), hos fackförbund som Unionen och Vision och på mallsajter som CVkungen. Använd dem som stomme: hälsning, upplägg och avslutning kan stå kvar, men inledningen, motivationen och exemplen som svarar på annonsens krav måste du skriva själv. Arbetsförmedlingen, Akavia och Saco ger samma råd: anpassa brevet till varje tjänst och håll det inom en A4-sida.

(Antalet 89 läses ur BREV_GALLERI, se avsnitt 5. Skriv hellre "nästan 90" om copywritern vill slippa uppdatera.)

H2-förslag:
1. **Var hittar du färdiga personliga brev gratis?** Kort, sakligt: vårt galleri (89 brev, 10 kategorier), Unionen (två Word-mallar, formell och informell), Vision (gratis mall), Academic Work (mall), CVkungen ("över 100 exempel"), Personligtbrev.se (28 yrken). Ingen värdering av konkurrenterna utöver det de själva säger. CTA-länk till hubben högt upp.
2. **Tre färdiga personliga brev att utgå från** (H3 per brev: Ekonomiassistent, Undersköterska, Butikssäljare). Varje brev ca 200–230 ord, tydligt märkt som exempel med påhittad sökande (inga påstådda verkliga personer eller fall). Under varje brev: en rad "Det här byter du ut" med de 2–3 ställen som är personliga. Koppla varje brev till motsvarande yrkessida (/personligt-brev-exempel/ekonomiassistent, /underskoterska, /butikssaljare) och nämn att CV-exemplet med samma persona finns på /cv-exempel/<yrke> (paritetsregeln: sidorna finns i par). Copywritern ska INTE kopiera breven från exempelsidorna ordagrant (duplicerat innehåll), utan skriva nya, kortare.
3. **Vad kan stå kvar och vad måste du skriva om?** Kärnan och vår unika vinkel. En tabell (JSX `<table>`, aldrig markdown-pipe) med brevets delar: rubrik/hälsning, inledning, varför jobbet, varför du (bevis), avslutning, signatur. Kolumner: "Kan stå kvar", "Skriv om varje gång", "Varför". Belägg med Kommunals "Även om vissa delar kan återanvändas, måste läsaren känna att brevet är skräddarsytt för den specifika tjänsten" och Akavias "Undvik därför att använda samma brev till flera ansökningar".
4. **Varför märks ett kopierat brev?** Mekanismen: exempel på nätet läses av alla som söker samma jobb; rekryteraren läser ansökningarna i en hög och ser samma mening tre gånger. Belägg: TNG-rekryteraren Åsa Pettersson ("Vi ser ofta identiska motivationstexter, skrivna i ett generiskt språk"), Saco ("Skriv inte generella brev. De blir väldigt ointressanta och rensas snabbt bort"). Plus Jobbland/Kantar Sifo om AI (44 % sämre bild) som en mening, inte en sektion.
5. **Kan man använda samma personliga brev till flera jobb?** Svar: nej, men du kan ha ett grundbrev. ST: "Därför bör du inte återanvända samma brev för alla jobb du söker." Arbetsförmedlingen: "Anpassa brevet till varje tjänst och visa tydligt varför just du passar för rollen."
6. **Så bygger du ditt eget färdiga grundbrev** (för den som söker många jobb): ett grundbrev med fasta delar + ett bibliotek av 4–6 bevisstycken (ett per kompetens med siffra/resultat) som du väljer bland mot annonsens kravprofil. Konkret, steg för steg. Detta är `howto`-kandidaten (se 3e).
7. **Hur långt ska brevet vara?** Kort sektion eller ruta: högst en A4 (Arbetsförmedlingen, Akavia, Vision), Akavia 2 000–3 000 tecken, Vision 3–4 stycken à cirka 7 rader. Länka /artiklar/hur-langt-ska-personligt-brev-vara.
8. **Snabbare: ett färdigt brev skrivet utifrån ditt CV och annonsen** Produktsektionen, saklig, bara fakta från avsnitt 5. Länk /verktyg/personligt-brev. En mening om att AI-utkast också måste läsas igenom, länk till /artiklar/skriva-personligt-brev-med-ai.
9. **Checklista innan du skickar** (kort, 6–8 punkter: platshållare borta, rätt företagsnamn, rätt kontaktperson, annonsens nyckelord, en siffra per påstående, A4, filformat annonsen ber om). Länka /artiklar/vanliga-misstag-personligt-brev.
10. **Vanliga frågor** (FAQItem, se 3d)

Källrad sist i artikeln med alla externa källor (krav från faktagranskningen).

### 3d. FAQ (6 st, i frontmatter OCH som `<FAQItem>`, identiska)
1. **Var hittar jag färdiga personliga brev gratis?** Galleriet (89 brev per yrke), Unionen, Vision, Academic Work, CVkungen. Alltid anpassa.
2. **Är det fusk att utgå från ett färdigt personligt brev?** Nej, exempel och mallar finns för att användas (Unionen, Vision m.fl. erbjuder dem själva). Problemet är inte fusk utan att brevet blir likt andras. Inga juridiska påståenden om upphovsrätt.
3. **Kan jag skicka samma personliga brev till flera jobb?** Nej (ST, Akavia, Kommunal), men grundbrev + utbytbara stycken.
4. **Märker rekryteraren att brevet är en mall eller skrivet med AI?** Ofta, ett generiskt brev syns (TNG-citat). Jobbland/Kantar Sifo: 44 % av arbetsgivarna får en sämre bild om de vet att AI använts. Lösningen är egna exempel, inte att gömma verktyget.
5. **Hur långt ska ett färdigt personligt brev vara?** Högst en A4, 2 000–3 000 tecken (Akavia).
6. **Kan jag få ett färdigt brev skrivet utifrån mitt CV gratis?** Ja, första brevet är gratis utan kortuppgift, sedan ett nytt per sju dygn. Du läser, redigerar och kopierar texten gratis; nedladdning som PDF och Word ingår i Jobbcoach Premium, 149 kr i månaden. (Exakt enligt avsnitt 5.)

Ta inte med den gamla FAQ:n om dataskydd i ny form om den inte behövs; vill copywritern ha den, använd ordalydelsen från faktagranskningens rättning (Supabase, radering via kontot, säljer aldrig, Gemini efter platshållare, Stripe, länk /integritetspolicy) och inget mer, och inget om kryptering.

### 3e. Övrig frontmatter
- **tags** (6): `["färdiga personliga brev", "färdigt personligt brev", "personligt brev exempel", "personligt brev mall", "anpassa personligt brev", "jobbansökan"]`
  - Kört genom `getCtaVariantForTags` (kopia av src/lib/cta/clusters.ts): **kluster `letter`**, `paketForKluster` = `cv` (CV- och brevvinkeln i reklamkorten), `inlineVerktygForKluster` = `brev` (inline-kortet pekar på brevverktyget). Rätt för avsikten.
  - VARNING: taggen "färdiga personliga brev" ensam ger `generic` (matchningen är substräng på "personligt brev", och "personliga brev" matchar inte). Minst en tagg måste innehålla "personligt brev". Inga taggar med "test", "intervju" eller "personliga egenskaper" (test/interview har högre prioritet och skulle kapa klustret).
- **howto:** behåll, men med stegen för grundbrevsmetoden/anpassningen (äkta sekvens mot ett resultat: ett anpassat brev). 5 steg: välj ett färdigt brev för ditt yrke; markera annonsens 3–5 krav; skriv om inledningen mot företaget; byt varje påstående mot ett eget exempel med siffra; korrekturläs, ta bort platshållare, håll inom en A4. Citera med dubbelfnuttar, inga tankstreck.
- **image/imageAlt:** behåll om ekonomiassistentbrevet är med, annars ny bild enligt "På bordet" (scripts/artikelbild/).
- Inga canonical, inga ld+json-block.

### 3f. CTA-placering
Konverteringen leder: länk till /personligt-brev-exempel redan i snabbsvaret och i första H2; produkt-CTA (/verktyg/personligt-brev) efter tabellen i H2 3 och i H2 8. Klustret `letter` ger automatiskt brevkortet; lägg inte till egen CTA-komponent utöver det som artikelramen redan ger, om inte copywritern vill ha en InteractiveCVShowcase-motsvarighet för brev (kontrollera i så fall vad som finns).

### 3g. Interna länkar (alla verifierade att filen/rutten finns)
Utlänkar från artikeln:
- /personligt-brev-exempel (hubb, `src/app/(public)/personligt-brev-exempel/page.tsx`)
- /personligt-brev-exempel/ekonomiassistent, /underskoterska, /butikssaljare (i sitemap.ts PERSONLIGT_BREV_EXEMPEL och BREV_PUBLICERAD); ev. /saljare, /lagerarbetare, /student, /sommarjobb
- /personligt-brev-exempel/kategori/vard, /ekonomi, /service (KATEGORIER i exempel-data.ts: vard, tech, industri, ekonomi, service, logistik, utbildning, offentlig-sektor, hantverk, student)
- /cv-exempel/ekonomiassistent, /underskoterska, /butikssaljare (parsidorna)
- /verktyg/personligt-brev (konverteringsmålet)
- /artiklar/personligt-brev-exempel-generella (fördjupning: lära av exempel)
- /artiklar/personligt-brev-mall-gratis (strukturen i fyra delar)
- /artiklar/skriva-personligt-brev-med-ai (AI-vägen)
- /artiklar/inleda-personligt-brev (inledningen, den del som alltid skrivs om)
- /artiklar/personligt-brev-avslutning-exempel (avslutningar att kopiera, passar "kan stå kvar")
- /artiklar/personligt-brev-kompetenser-egenskaper (bevisstyckena)
- /artiklar/hur-langt-ska-personligt-brev-vara
- /artiklar/vanliga-misstag-personligt-brev
- /artiklar/personligt-brev-utan-erfarenhet (för den som saknar exempel ur arbetslivet)
- Länka INTE /skapa-brev/start (noindex) eller /kompetensutveckling. Länka inte /artiklar/personligt-brev-mall-word (Word-spåret).

### 3h. Inlänkar (förslag, separat uppgift, rör inte nu)
Sidan har 0 inlänkar. Efter publicering: lägg en kontextuell länk med ankartext "färdiga personliga brev" från /artiklar/personligt-brev-exempel-generella, /artiklar/personligt-brev-mall-gratis och /artiklar/tips-pa-personligt-brev, gärna också från hubben /personligt-brev-exempel om dess mall har en artikellista.

### 3i. Mätning
GSC-avläsning 4 och 8 veckor efter publicering: visningar och position för "färdiga personliga brev" på artikeln, och att exempel-generella inte tappar (pos ~22) mer än artikeln vinner.

---

## 4. Research (verifierat i källtexten 2026-11-15, inga snippets)

| # | Källa | URL | Exakt citat/siffra |
|---|---|---|---|
| R1 | Akavia, "Så skriver du ett personligt brev" | https://www.akavia.se/rad-och-stod/soka-jobb/jobbansokan/sa-skriver-du-personligt-brev/ | "Ett personligt brev bör inte vara längre än en A4-sida." · "Längden bör hållas till ett cirka A4, en bra måtstock att hålla sig till är runt 2000-3000 tecken." · "Undvik därför att använda samma brev till flera ansökningar." · "Anpassa ditt brev så att det matchar de krav och önskemål som nämns i annonsen." · "Inledningen ska väcka intresse och ge en tydlig bild av varför du söker jobbet." Akavia har en guide, ingen mall. |
| R2 | Arbetsförmedlingen, "11 tips för att vässa ditt jobbsökande" (2026-04-15) | https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2026-04-15-11-tips-for-att-vassa-ditt-jobbsokande | "Anpassa brevet till varje tjänst och visa tydligt varför just du passar för rollen" · "Många väljer att skicka jobbansökningar utan personligt brev" · "Justera rubriker, nyckelord och exempel så att de matchar kravprofilen i annonsen" (om CV:t) |
| R3 | Arbetsförmedlingen, "Writing a personal letter" (engelska) | https://arbetsformedlingen.se/other-languages/english-engelska/cv-application-and-interview/writing-a-personal-letter | "A good length for a personal letter is a maximum of one A4 page." · "Customize your letter for the specific job you are applying to." Sidan är på engelska; återge på svenska som "Arbetsförmedlingen rekommenderar högst en A4-sida", inte som svenskt citat. |
| R4 | Kommunal, "Tips på hur du skriver ditt personliga brev" (2024-04-16) | https://www.kommunal.se/nyhet/sa-har-skriver-du-ditt-personliga-brev | "För varje jobb du söker behöver du skriva ett unikt personligt brev." · "Även om vissa delar kan återanvändas, måste läsaren känna att brevet är skräddarsytt för den specifika tjänsten." · "Anpassa sedan ditt brev efter detta, och försök att skapa en tydlig matchning mellan dina egenskaper och tjänstens krav." **Bästa källan för grundbrevsvinkeln.** |
| R5 | Saco, "CV och personligt brev" | https://www.saco.se/yrkesliv/jobb/jag-ska-soka-jobb/cv-och-personligt-brev/ | "Brevet ska alltid vara anpassat för just det jobb som ansökan gäller." · "Skriv inte generella brev. De blir väldigt ointressanta och rensas snabbt bort." · "Det finns ingen mall för det perfekta brevet, men det finns ett antal saker man kan tänka på." |
| R6 | Fackförbundet ST, "Så skriver du ett bra personligt brev" | https://www.st.org/rad-och-stod/sa-skriver-du-ett-bra-personligt-brev | "Därför bör du inte återanvända samma brev för alla jobb du söker." · "En luftig A4 räcker" |
| R7 | Vision, "Personligt brev" | https://vision.se/lon-utveckling/soka-jobb/personligt-brev | "Skriv därför ett personligt brev som är anpassat för just det jobbet du söker." · "Ett personligt brev bör inte vara längre än 3–4 stycken på cirka 7 rader var. Brevet ska rymmas på en A4-sida." · Tonen: "samma tonalitet som i platsannonsen för jobbet och på organisationens webbplats". Vision har en gratis mall: https://vision.se/lon-utveckling/soka-jobb/personligt-brev/mall |
| R8 | Unionen, "Mallar: Personligt brev" | https://www.unionen.se/filer/ovrigt/mallar-personligt-brev | Två Word-mallar: "Formellt personligt brev - mall" och "Informellt personligt brev - mall". Brevet ska svara på tre frågor: "Varför vill jag jobba just här?", "Varför vill jag ha jobbet?", "Varför passar jag för jobbet?" |
| R9 | TNG, "AI i jobbansökan: dos and don'ts från rekryteraren" (24 nov 2025, red. 10 juli 2026) | https://www.tng.se/soka-jobb/ai-i-jobbansokan-dos-and-donts-fran-rekryteraren/ | Åsa Pettersson, rekryteringskonsult och konsultansvarig på TNG: "Vi ser ofta identiska motivationstexter, skrivna i ett generiskt språk." · "Resultatet blir texter utan personligt avtryck och den unika kompetensen försvinner." |
| R10 | Jobbland, pressmeddelande (14 maj 2025), Kantar Sifo för Jobbland och Keeparo, 315 svarande inom rekrytering/employer branding/ledning, fält hösten 2024 | https://jobbland.se/arbetsliv/pressmeddelande-arbetsgivare-skeptiska-till-ai-assisterade-ansokningar | 44 % av arbetsgivarna får en sämre bild av kandidaten om AI använts i ansökan (14 % mycket sämre, 30 % något sämre), 9 % bättre. Handel mest skeptisk: "eight of ten" (åtta av tio) rekryterare. 15 % av jobbsökarna hade använt AI. Ange alltid "Kantar Sifo för Jobbland, hösten 2024". |
| R11 | Tidningen Näringsliv (6 aug 2025) | https://www.tn.se/arbetsmarknad/43981/expert-arbetsgivare-borjar-se-igenom-ai-genererade-brev/ | Edvard Danielsson, karriärvägledare på Manpower Matchning: "Arbetsgivare börjar se igenom. Det syns att man inte lägger så mycket ansträngning i det." Valfri, R9 räcker. |
| R12 | CVkungen | https://www.cvkungen.se/exempel-personliga-brev | "Över 100 exempel" (sidans egen uppgift, verifierad i faktagranskningen). |
| R13 | personligt-brev.net | https://personligt-brev.net/fardiga-personliga-brev/ | "du har kommit fel om du söker ett helt färdigt personligt brev där du bara kan byta namn och skicka in" (bra att citera: även mallsajterna säger det). |

Används INTE (overifierat eller fel avsändare): Remote-undersökningen om "82 % falska AI-CV" (handlar om CV, inte brev); påståenden om att Malmö stad och Academic Work slopat det personliga brevet (bara sett i sökmotorsammanfattning, inte i källtext); Arbetsförmedlingens 2020-artikel om ton (404); "profillöst"-citatet (gick inte att hitta i källtext).

Skrivregler från research: citera exakt eller återge utan citattecken; inga egna procentsatser om svar/intervjuer; inga påhittade rekryterarcitat eller fallstudier. Exempelbreven är exempel, inte "brev som gav jobb".

---

## 5. Produktfakta (kontrollerat i koden, gren fix/svep-texter-artiklar)

| Påstående som får stå i artikeln | Fil |
|---|---|
| Brevet skrivs utifrån ditt CV och jobbannonsen du klistrar in; båda krävs i inloggat läge (`cv_id` och `job_description`, annars fel) | src/app/api/letters/generate/route.ts rad 124–128 |
| Utan konto: beskriv yrke, arbetsgivare och erfarenhet i fritext (annons valfri); du ser första stycket direkt, hela brevet när du skapat ett gratiskonto (`PREVIEW_PARAGRAPHS = 1`) | src/lib/letters/public-draft.ts, src/lib/letters/public-draft-tal.ts, src/app/(public)/verktyg/personligt-brev/page.tsx rad 218 |
| Gratis: första brevet, sedan ett nytt per rullande sju dygn (`FREE_LETTERS_PER_ACCOUNT = 1`, `LETTER_WINDOW_DAYS = 7`, en per fönster). Ingen kortuppgift. | src/lib/quota/quotaService.ts rad 38–45, 260–360 |
| Allt du skrivit ligger kvar att läsa, redigera och kopiera även gratis (knappen "Kopiera text") | src/app/dashboard/mina-brev/[id]/edit/EditLetterClient.tsx rad 161, 339; brev-faq-data.ts rad 18 |
| Nedladdning som PDF och Word (.docx) kräver Premium: `userHasAccess(..., 'letter_download')`, annars 402 | src/app/api/letters/download/route.ts rad 255–268, 358–375 (riktig docx via src/lib/letters/docx-templates) |
| Fem tonlägen att välja själv: Professionell, Entusiastisk, Kreativ, Självsäker, Balanserad. I Premium kan vi välja tonen åt dig (läser annonsens krav och branschens ton) | src/app/dashboard/skapa-brev/components/steps/TonalityLanguageStep.tsx rad 35–136 |
| Språk: svenska eller engelska | samma fil rad 92–94 |
| Sju brevmallar, tre gratis (classic, minimalist, compact), fyra i Premium (modern, executive, creative, traditional) | src/lib/letters/letter-templates.ts (`tier`), page.tsx `GRATISMALLAR` |
| Pris: Jobbcoach Premium 149 kr i månaden, det enda paketet som säljs (`SALD_PLAN = 'all_month'`); Dagspasset säljs inte (`saljs: false`). Skrivregel: fulla namnet "Jobbcoach Premium" första gången, sedan "Premium" | src/lib/plans/plans.ts rad 78, 140–160, 231 |
| Galleriet: 89 personliga brev-exempel i 10 kategorier (läst ur `BREV_GALLERI.length` och `KATEGORIER`) | src/app/(public)/exempel/components/galleri-data.ts, exempel-data.ts |
| Integritet (om det nämns): CV- och annonstext skickas till Google (Gemini API); före brev byts namn, e-post, telefon, personnummer, gatuadress och postnummer mot platshållare | src/app/(public)/integritetspolicy/page.tsx rad 127, 154; src/lib/privacy/guard.ts |

**Får INTE stå:** "60 sekunder"/"80–90 % färdigt"/svarsfrekvenser (ingen mätning); "sex toner" (koden har fem plus automatiskt val i Premium); "krypterat"; "delar aldrig med tredje part"; att PDF/Word ingår gratis; Word-mallar som ämne; CV-export i Word (finns inte).

**Sidofynd (utanför uppdraget, till saas-lead):**
- /verktyg/personligt-brev säger "sex tonaliteter"/"6 toner" (layout.tsx rad 7, 14, 24; page.tsx rad 100, 110, 145). Koden har fem valbara toner plus automatiskt tonval i Premium. Antingen "fem toner, och i Premium väljer vi åt dig" eller definiera auto som den sjätte, men facit säger 5.
- Exempelsidorna (ExempelMall.tsx rad 94) säger "Sex mallar"; brevmallarna är sju.
- brev-faq-data.ts rad 6 säger "Från start till färdig PDF tar det två till fyra minuter" utan att nämna att PDF kräver Premium.
