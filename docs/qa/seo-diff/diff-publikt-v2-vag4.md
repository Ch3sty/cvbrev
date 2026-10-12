# SEO-diff

Före: docs/qa/seo-diff/publikt-v2-fore.json  
Efter: docs/qa/seo-diff/publikt-v2-vag4.json  
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
- ok: nya rubriker: ["h2 Alla verktyg, samlade"]
- ok: nya FAQ-frågor: ["ld: Hur skiljer sig era verktyg från ChatGPT?","ld: Är det säkert att lämna mitt CV till er?","ld: Hur ofta uppdateras jobbmatchningen?","ld: Vad händer om jag säger upp prenumerationen?","ld: Hur kommer jag igång gratis?"]
- ok: ord i main 847 → 970 (+14.5 %)
- ok: nya interna länkar i innehållet: ["/rakna-ut","/verktyg/cv-mallar","/verktyg/personlighetstest"]
- ok: nya JSON-LD-block (2026-10-12): FAQPage

### /verktyg/rekryteringstester
- tillåten JSON-LD-skillnad 2026-10-12: Ägarbeslut 1 i del A avsnitt 10: FAQ-svaren om verbalt och numeriskt läser testConfigs tal för träningspassen och nämner övningsprovet separat. Frågetexterna är oförändrade.
- ok: ord i main 1923 → 2012 (+4.6 %)
- ok: ramen (header och footer, omritad enligt analysen): borta [], nya ["/verktyg/rekryteringstester/prova"]
- ok: JSON-LD ändrad i tillåten typ (2026-10-12): FAQPage, HowTo, WebApplication

### /verktyg/personligt-brev
- ok: nya rubriker: ["h2 Skriv ett brev utan konto","h2 Läs mer om personliga brev","h3 Personligt brev-exempel","h3 Hur skriver man ett personligt brev?","h3 Bra personligt brev","h3 Inleda ett personligt brev","h3 Hur långt ska ett personligt brev vara?","h3 Avslutningen"]
- ok: ord i main 910 → 1082 (+18.9 %)
- ok: nya interna länkar i innehållet: ["/artiklar/bra-personligt-brev","/artiklar/hur-langt-ska-personligt-brev-vara","/artiklar/hur-skriver-man-ett-personligt-brev","/artiklar/inleda-personligt-brev","/artiklar/personligt-brev-avslutning-exempel","/personligt-brev-exempel","/priser","/skapa-brev/start"]

### /verktyg/jobbmatchning
- tillåten JSON-LD-skillnad 2026-10-12: Publikt v2 våg 4 (del A 5.5): FAQ-svaren läser FREE_TIER_JOB_LIMIT och JOB_MATCHES_PER_RUN, och "feed" blir "lista". Frågorna oförändrade.
- ok: nya rubriker: ["h2 Tre träffar gratis, med skälen","h2 Från träff till ansökan"]
- ok: ord i main 828 → 987 (+19.2 %)
- ok: nya interna länkar i innehållet: ["/artiklar/ai-jobbmatchning","/artiklar/byta-karriar-jobbsokande-guide","/verktyg/bli-upptackt","/verktyg/jobbcoachen","/verktyg/personligt-brev"]
- ok: JSON-LD ändrad i tillåten typ (2026-10-12): FAQPage

### /verktyg/cv-analys
- ok: ord i main 848 → 848 (+0.0 %)

### /verktyg/skapa-cv
- ok: ord i main 830 → 830 (+0.0 %)

### /verktyg/cv-mallar
- ok: ord i main 1331 → 1331 (+0.0 %)

### /verktyg/linkedin-optimering
- baslinjen omtagen 2026-09-23: Ägarbeslut: LinkedIn-optimeringen ingår i CV-veckan och Allt, gratisnivån har ingen optimering. WebApplication-schemats offer, HowTo-schemats estimatedCost och FAQPage-svaret om kostnaden sa "en gratis optimering i veckan". Omtagen igen 2026-09-23 (Räkna ut-omgången, del 1): WebApplication- och HowTo-schemat hade det gamla produktnamnet "Karriärguidens AI" och anglicismerna Split-view, branschkeywords, score-rapport och copy-paste, och FAQ-frågan hette "Vad är ATS-keywords på LinkedIn?". Bytt till Jobbcoach.ai och svenska facktermer (rekryteringssystem (ATS), nyckelord, delad vy). h1, title, description och canonical oförändrade.
- ok: ord i main 1154 → 1154 (+0.0 %)

### /verktyg/bli-upptackt
- baslinjen omtagen 2026-09-23: Ägarbeslut: synligheten för rekryterare ingår i Allt, och texten ska säga det. Service-schemat (price 0, "Gratis att synas") och FAQPage-schemat fick en fråga om vad det kostar. h1, title, description och canonical oförändrade.
- ok: ord i main 1045 → 1045 (+0.0 %)

### /verktyg/jobbcoachen
- ok: ord i main 938 → 938 (+0.0 %)

### /verktyg/personlighetstest
- ok: ord i main 594 → 594 (+0.0 %)
