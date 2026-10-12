# SEO-diff

Före: docs/qa/seo-diff/publikt-v2-fore.json  
Efter: docs/qa/seo-diff/publikt-v2-b1-dela.json  
Sidor: 13  
Fel: 0

### /
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg 2: startsidan får Organization, WebSite och FAQPage (del A 5.1). Live saknar JSON-LD.
- ok: canonical tillagd (2026-10-12): "https://www.jobbcoach.ai"
- ok: nya rubriker: ["h2 Jobbcoachen svarar hela vägen"]
- ok: nya FAQ-frågor: ["ld: Vad är ATS, och varför ska mitt CV vara anpassat?","ld: Hur mycket av jobbet gör ni åt mig?","ld: Hur snabbt kan jag skapa ett personligt brev?","ld: Är mina uppgifter säkra?","ld: Vad kostar det, och vad får jag utan att betala?"]
- ok: ord i main 618 → 928 (+50.2 %)
- ok: ankarlänkar inom sidan borta: ["#funktioner","#gratis","#guide","#sa-jobbar-vi"]
- ok: nya interna länkar i innehållet: ["#tre-verktyg","/funktioner#sokta-tjanster"]
- ok: nya JSON-LD-block (2026-10-12): Organization+WebSite+FAQPage

### /priser
- tillåten JSON-LD-skillnad 2026-10-12: SEO-granskningen våg 1–3, punkt 3: Nivåkollen skrivs som produktnamn i FAQ-svaret om att börja gratis. Frågorna oförändrade.
- ok: nya rubriker: ["h2 Vill du se först?"]
- ok: ord i main 1001 → 1061 (+6.0 %)
- ok: JSON-LD ändrad i tillåten typ (2026-10-12): FAQPage

### /funktioner
- tillåten JSON-LD-skillnad 2026-10-12: Ägarbeslut 8 i del A avsnitt 10: /funktioner får FAQPage ur samma fem frågor som syns på sidan.
- ok: description bytt (2026-10-12): "Åtta verktyg på en plattform: personligt brev, CV-analys, CV-mallar, jobbmatchning, jobbcoachen och rekryteringstester. Byggt för svensk arbetsmarknad." → "Alla verktyg för jobbsöket: rekryteringstester, CV-analys, CV-mallar, personliga brev, jobbmatchning och Jobbcoachen. Byggt för svensk arbetsmarknad.". Ägarkrav korrekta termer (SEO-granskningen av del A): "Åtta verktyg" stämde inte, nu "Alla verktyg för jobbsöket:" med rekryteringstester först.
- ok: nya rubriker: ["h2 Alla verktyg, samlade"]
- ok: nya FAQ-frågor: ["ld: Hur skiljer sig era verktyg från ChatGPT?","ld: Är det säkert att lämna mitt CV till er?","ld: Hur ofta uppdateras jobbmatchningen?","ld: Vad händer om jag säger upp prenumerationen?","ld: Hur kommer jag igång gratis?"]
- ok: ord i main 847 → 970 (+14.5 %)
- ok: länk bytt (2026-10-12): /dashboard/cv-mallar → /verktyg/cv-mallar. SEO-granskningen av del A: "Välj en mall" pekade in i det inloggade läget.
- ok: nya interna länkar i innehållet: ["/rakna-ut","/verktyg/cv-mallar","/verktyg/personlighetstest"]
- ok: nya JSON-LD-block (2026-10-12): FAQPage

### /verktyg/rekryteringstester
- tillåten JSON-LD-skillnad 2026-10-12: Ägarbeslut 1 i del A avsnitt 10: FAQ-svaren om verbalt och numeriskt läser testConfigs tal för träningspassen och nämner övningsprovet separat. Frågetexterna är oförändrade.
- ok: ord i main 1923 → 2012 (+4.6 %)
- ok: ramen (header och footer, omritad enligt analysen): borta [], nya ["/verktyg/rekryteringstester/prova"]
- ok: JSON-LD ändrad i tillåten typ (2026-10-12): FAQPage, HowTo, WebApplication

### /verktyg/personligt-brev
- tillåten JSON-LD-skillnad 2026-10-12: ägarkrav korrekta termer: Steget "Välj mall och ton": "Sju mallar och sex tonlägen, från professionellt till entusiastiskt."
- ok: rubrik bytt (2026-10-12): "h2 7 mallar, en för varje bransch" → "h2 7 mallar för personliga brev". Ägarbeslut 2026-10-12, sakfel: mallarna är inte en per bransch. Ordet mallar står kvar och rubriken bär sökordet.
- ok: nya rubriker: ["h2 Skriv ett brev utan konto","h2 7 mallar för personliga brev","h2 Läs mer om personliga brev","h3 Personligt brev-exempel","h3 Hur skriver man ett personligt brev?","h3 Bra personligt brev","h3 Inleda ett personligt brev","h3 Hur långt ska ett personligt brev vara?","h3 Avslutningen"]
- ok: ord i main 910 → 1078 (+18.5 %)
- ok: nya interna länkar i innehållet: ["/artiklar/bra-personligt-brev","/artiklar/hur-langt-ska-personligt-brev-vara","/artiklar/hur-skriver-man-ett-personligt-brev","/artiklar/inleda-personligt-brev","/artiklar/personligt-brev-avslutning-exempel","/personligt-brev-exempel","/priser","/skapa-brev/start"]
- ok: JSON-LD ändrad i tillåten typ (2026-10-12): HowTo

### /verktyg/jobbmatchning
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg 4 (del A 5.5): FAQ-svaren läser FREE_TIER_JOB_LIMIT och JOB_MATCHES_PER_RUN, och "feed" blir "lista". Frågorna oförändrade. ägarkrav korrekta termer: "matchnings-procent" blir "matchning i procent".
- ok: nya rubriker: ["h2 Tre träffar gratis, med skälen","h2 Från träff till ansökan"]
- ok: ord i main 828 → 1008 (+21.7 %)
- ok: nya interna länkar i innehållet: ["/artiklar/ai-jobbmatchning","/artiklar/byta-karriar-jobbsokande-guide","/verktyg/bli-upptackt","/verktyg/jobbcoachen","/verktyg/personligt-brev"]
- ok: JSON-LD ändrad i tillåten typ (2026-10-12): FAQPage, HowTo, WebApplication

### /verktyg/cv-analys
- tillåten JSON-LD-skillnad 2026-10-12: ägarkrav korrekta termer: "before/after" blir "före och efter".
- ok: ord i main 848 → 850 (+0.2 %)
- ok: ramen (header och footer, omritad enligt analysen): borta [], nya ["#mini-analys"]
- ok: JSON-LD ändrad i tillåten typ (2026-10-12): HowTo, WebApplication

### /verktyg/skapa-cv
- tillåten JSON-LD-skillnad 2026-10-12: ägarkrav korrekta termer: "live-preview" blir "förhandsvisning", "auto-save" och "mobile-friendly" blir svenska.
- ok: ord i main 830 → 830 (+0.0 %)
- ok: JSON-LD ändrad i tillåten typ (2026-10-12): FAQPage, HowTo, WebApplication

### /verktyg/cv-mallar
- tillåten JSON-LD-skillnad 2026-10-12: ägarkrav korrekta termer: HowTo läses ur samma data som de synliga stegen; FAQ-frågan "mobile-friendly" blir "mobilanpassade".
- ok: FAQ-fråga bytt (2026-10-12, ägarkrav korrekta termer): "Är mallarna mobile-friendly när jag bygger CV:t?" → "Är mallarna mobilanpassade när jag bygger CV:t?"
- ok: FAQ-fråga bytt (2026-10-12, ägarkrav korrekta termer): "ld: Är mallarna mobile-friendly när jag bygger CV:t?" → "Är mallarna mobilanpassade när jag bygger CV:t?"
- ok: nya FAQ-frågor: ["Är mallarna mobilanpassade när jag bygger CV:t?","ld: Är mallarna mobilanpassade när jag bygger CV:t?"]
- ok: ord i main 1331 → 1331 (+0.0 %)
- ok: ramen (header och footer, omritad enligt analysen): borta [], nya ["/cv-mallar/start?mall=norrsken&typsnitt=calibri"]
- ok: JSON-LD ändrad i tillåten typ (2026-10-12): FAQPage, HowTo

### /verktyg/linkedin-optimering
- baslinjen omtagen 2026-09-23: Ägarbeslut: LinkedIn-optimeringen ingår i CV-veckan och Allt, gratisnivån har ingen optimering. WebApplication-schemats offer, HowTo-schemats estimatedCost och FAQPage-svaret om kostnaden sa "en gratis optimering i veckan". Omtagen igen 2026-09-23 (Räkna ut-omgången, del 1): WebApplication- och HowTo-schemat hade det gamla produktnamnet "Karriärguidens AI" och anglicismerna Split-view, branschkeywords, score-rapport och copy-paste, och FAQ-frågan hette "Vad är ATS-keywords på LinkedIn?". Bytt till Jobbcoach.ai och svenska facktermer (rekryteringssystem (ATS), nyckelord, delad vy). h1, title, description och canonical oförändrade.
- ok: ord i main 1154 → 1154 (+0.0 %)

### /verktyg/bli-upptackt
- baslinjen omtagen 2026-09-23: Ägarbeslut: synligheten för rekryterare ingår i Allt, och texten ska säga det. Service-schemat (price 0, "Gratis att synas") och FAQPage-schemat fick en fråga om vad det kostar. h1, title, description och canonical oförändrade.
- ok: ord i main 1045 → 1045 (+0.0 %)

### /verktyg/jobbcoachen
- tillåten JSON-LD-skillnad 2026-10-12: ägarkrav korrekta termer: "Karriärguiden" blir "Jobbcoachen" i namn, steg och FAQ, och "(Källa N) inline" blir "direkt i texten".
- ok: FAQ-fråga bytt (2026-10-12, ägarkrav korrekta termer): "Hur fungerar Karriärguiden?" → "Hur fungerar Jobbcoachen?"
- ok: FAQ-fråga bytt (2026-10-12, ägarkrav korrekta termer): "Vilka källor använder Karriärguiden?" → "Vilka källor använder Jobbcoachen?"
- ok: FAQ-fråga bytt (2026-10-12, ägarkrav korrekta termer): "Är det gratis att använda Karriärguiden?" → "Är det gratis att använda Jobbcoachen?"
- ok: FAQ-fråga bytt (2026-10-12, ägarkrav korrekta termer): "Kan jag dela mitt CV med Karriärguiden?" → "Kan jag dela mitt CV med Jobbcoachen?"
- ok: FAQ-fråga bytt (2026-10-12, ägarkrav korrekta termer): "ld: Hur fungerar Karriärguiden?" → "Hur fungerar Jobbcoachen?"
- ok: FAQ-fråga bytt (2026-10-12, ägarkrav korrekta termer): "ld: Vilka källor använder Karriärguiden?" → "Vilka källor använder Jobbcoachen?"
- ok: FAQ-fråga bytt (2026-10-12, ägarkrav korrekta termer): "ld: Är det gratis att använda Karriärguiden?" → "Är det gratis att använda Jobbcoachen?"
- ok: FAQ-fråga bytt (2026-10-12, ägarkrav korrekta termer): "ld: Kan jag dela mitt CV med Karriärguiden?" → "Kan jag dela mitt CV med Jobbcoachen?"
- ok: nya FAQ-frågor: ["Hur fungerar Jobbcoachen?","Vilka källor använder Jobbcoachen?","Är det gratis att använda Jobbcoachen?","Kan jag dela mitt CV med Jobbcoachen?","ld: Hur fungerar Jobbcoachen?","ld: Vilka källor använder Jobbcoachen?","ld: Är det gratis att använda Jobbcoachen?","ld: Kan jag dela mitt CV med Jobbcoachen?"]
- ok: ord i main 938 → 944 (+0.6 %)
- ok: JSON-LD ändrad i tillåten typ (2026-10-12): FAQPage, HowTo, WebApplication

### /verktyg/personlighetstest
- ok: ord i main 594 → 594 (+0.0 %)
- ok: ramen (header och footer, omritad enligt analysen): borta [], nya ["#provet"]
