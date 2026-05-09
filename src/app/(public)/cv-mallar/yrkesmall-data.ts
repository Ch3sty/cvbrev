/**
 * Data fOr yrkesmall-sidorna pa /cv-mallar/[yrke].
 *
 * Varje yrke har:
 *  - slug, namn (URL + visningsnamn)
 *  - intro (kort hook fOr hub-sidan)
 *  - mallId (vilken existerande CV-mall vi kopplar till)
 *  - varforDennaMall (3-4 punkter om designval - UNIK content per yrke)
 *  - rekryterarTipsen (vad rekryterare letar efter - UNIK content)
 *  - checklista (branschspecifika krav)
 *  - faqItems (3-5 fragor specifika fOr yrket)
 */

export interface Yrkesmall {
  slug: string
  namn: string
  /** Visningsnamn med valbar bestamd form for naturligt sprak ("CV-mall fOr Lakare") */
  namnBestamd: string
  intro: string
  /** ID frán SIMPLE_TEMPLATES — vilken befintlig design vi kopplar yrket till */
  mallId: string
  /** Mall-namn (visning) — ex "Klinik", "Vården" */
  mallNamn: string
  varforDennaMall: string[]
  rekryterarTipsen: { rubrik: string; text: string }[]
  checklista: string[]
  faqItems: { q: string; a: string }[]
}

export const YRKESMALL_LIST: Yrkesmall[] = [
  {
    slug: 'lakare',
    namn: 'Läkare',
    namnBestamd: 'läkare',
    intro: 'Centrerad serif-mall med tydlig plats för specialistbevis, publikationer och kliniska tjänstgöringar.',
    mallId: 'klinik',
    mallNamn: 'Klinik',
    varforDennaMall: [
      'Centrerad serif-header följer akademisk konvention och signalerar prestige',
      'Två-kolumns layout med dedikerad höger-panel för publikationer, stipendier och kompetensområden',
      '"Klinisk tjänstgöring" som rubrik istället för arbetslivserfarenhet — matchar branschspråket',
      'Source Serif Pro + burgundy-accent ger akademisk tyngd utan att kännas stelt',
    ],
    rekryterarTipsen: [
      {
        rubrik: 'Specialistbevis och legitimation tydligt placerade',
        text: 'Rekryterare och HR-chefer i sjukvården skannar först efter legitimationsstatus och specialistbevis. På Klinik-mallen ligger detta i höger panel högst upp — synligt redan på första sidan utan att man behöver scrolla.',
      },
      {
        rubrik: 'Publikationer som meritmarkör',
        text: 'För specialistläkare och forskningsläkare väger vetenskapliga publikationer tungt. Ange tidskrift, år och din roll. Mallens höger-panel har en dedikerad sektion för det.',
      },
      {
        rubrik: 'Kvantifiera kliniska volymer',
        text: 'Skriv antal patienter du ansvarat för per vecka, antal utredningar du gjort, vilka diagnosspektra du behärskar. Konkreta siffror ger rekryteraren snabbt en bild av din kapacitet.',
      },
    ],
    checklista: [
      'Legitimationsbevis från Socialstyrelsen (med datum)',
      'Specialistbevis och eventuella subspecialiseringar',
      'AT- och ST-tjänstgöringar med klinik och tidsperiod',
      'Vetenskapliga publikationer med tidskrift och år',
      'Forskningsbidrag och stipendier',
      'Konferensföreläsningar och poster-presentationer',
      'CME-poäng och vidareutbildningar',
    ],
    faqItems: [
      {
        q: 'Behöver jag en CV-mall som läkare eller räcker det med ett standardformat?',
        a: 'Som läkare har du fler meritkategorier än de flesta yrken — legitimation, specialistbevis, ST-tjänstgöringar, publikationer och forskningsbidrag. En specialiserad mall som Klinik gör att alla dessa syns korrekt utan att din kliniska erfarenhet trycks ner.',
      },
      {
        q: 'Ska jag inkludera publikationer på ett läkar-CV?',
        a: 'Ja, om du söker tjänster där forskningsmeriter värderas (universitetsklinik, specialistmottagning, akademisk klinik). Lista dem i omvänd kronologisk ordning med tidskrift, år och din position. Begränsa till 5-10 senaste och relevanta.',
      },
      {
        q: 'Hur många sidor ska ett läkar-CV vara?',
        a: 'För AT/ST-läkare är 1-2 sidor lagom. Specialistläkare och överläkare med längre meritlistor brukar ha 2-3 sidor — det är acceptabelt i sjukvården eftersom meritprofiler är centrala.',
      },
    ],
  },
  {
    slug: 'underskoterska',
    namn: 'Undersköterska',
    namnBestamd: 'undersköterska',
    intro: 'Vården-mallen med salviegrön sidopanel där legitimationer och kompetensområden lyfts överst.',
    mallId: 'varden-omsorg',
    mallNamn: 'Vården',
    varforDennaMall: [
      'Salviegrön sidopanel signalerar vård utan att vara klyschigt sjukhus-grönt',
      'Legitimationer och certifikat (medicinsk delegering, HLR, Akta Ryggen) ligger i sidopanelen — synligt direkt',
      '"Klinisk erfarenhet" som rubrik matchar språket i tjänsteannonser',
      'Auto-genererad lista över arbetsplatser ger rekryteraren snabb överblick',
    ],
    rekryterarTipsen: [
      {
        rubrik: 'Medicinsk delegering är CV-kritiskt',
        text: 'Vilka delegeringar har du genomgått? Insulin, PEG-sondmatning, subkutana injektioner, blodtrycksmätning? Lista varje delegering eftersom det avgör vilka tjänster du kan söka.',
      },
      {
        rubrik: 'Specialiseringar gör skillnad',
        text: 'Demensvård (BPSD), palliativ vård, geriatrik, hemtjänst, akutvård — varje specialisering öppnar olika tjänster. Lyft den du har mest erfarenhet av i din titel + sammanfattning.',
      },
      {
        rubrik: 'System du behärskar',
        text: 'Cosmic, Procapita, Pascal, NPÖ — nämn de dokumentationssystem du arbetat med. Det är ATS-keywords som rekryterare filtrerar på.',
      },
    ],
    checklista: [
      'Vård- och omsorgsutbildning från gymnasium eller vuxenutbildning',
      'Medicinska delegeringar (specifika: insulin, PEG, etc)',
      'HLR-certifiering med utgångsdatum',
      'Akta Ryggen / förflyttningsteknik',
      'Basala hygienrutiner',
      'Erfarenhet av dokumentationssystem (Cosmic, Procapita)',
      'Specialiseringar: demens, palliativ, geriatrik, hemtjänst',
    ],
    faqItems: [
      {
        q: 'Vad är viktigast på ett undersköterska-CV?',
        a: 'Tre saker: utbildning från vård- och omsorgsprogrammet (eller motsvarande vuxenutbildning), aktiva medicinska delegeringar, och konkret klinisk erfarenhet med arbetsplatser. Allt det visar Vården-mallen tydligt.',
      },
      {
        q: 'Ska jag ha med foto på undersköterska-CV?',
        a: 'Inte obligatoriskt men vanligt i Sverige. Vården-mallen har stöd för foto i sidopanelen — använd ett professionellt bröstbild om du har en. ATS läser ditt CV ändå eftersom mallen är ATS-säker.',
      },
      {
        q: 'Hur lyfter jag mina språkkunskaper på CV:t?',
        a: 'Språk är värdefullt i vården eftersom du möter patienter med olika bakgrund. Lista dem i sidopanelen med nivå (modersmål, flytande, konversation). Arabiska, persiska, somaliska och tigrinja är efterfrågade i många regioner.',
      },
    ],
  },
  {
    slug: 'butiksbitrade',
    namn: 'Butiksbiträde',
    namnBestamd: 'butiksbiträde',
    intro: 'Ren enkolumns-mall med fokus på serviceerfarenhet, kassasystem och kundkontakt.',
    mallId: 'norrsken',
    mallNamn: 'Norrsken',
    varforDennaMall: [
      'Ren enkolumns-layout är lätt för rekryterare att skanna under hektiska butiksdagar',
      'Subtil orange-accent matchar handelsbranschens energi utan att se infantil ut',
      'Strukturerad utbildningssektion lyfter gymnasieexamen och eventuella säljutbildningar',
      'ATS-säker — passerar de flesta rekryteringssystem inom kedjebutiker',
    ],
    rekryterarTipsen: [
      {
        rubrik: 'Kassaerfarenhet är CV-kritiskt',
        text: 'Vilka kassasystem har du arbetat med? Sitoo, Iiko, NCR, Bizpoint? Nämn dem konkret — många butiker använder samma system och söker efter exakt erfarenhet.',
      },
      {
        rubrik: 'Försäljningsresultat över passiv listning',
        text: 'Skriv inte "ansvarade för försäljning". Skriv "ökade kategori-omsättningen 12% under sommarsäsongen". Konkreta siffror gör att du sticker ut bland 30+ ansökningar.',
      },
      {
        rubrik: 'Mertid och sociala kvällar/helger',
        text: 'Detaljhandeln behöver flexibla medarbetare. Nämn att du kan jobba kvällar, helger, högtider. Det sätter dig framför sökande som bara vill jobba dagtid.',
      },
    ],
    checklista: [
      'Erfarenhet av kassasystem (specifikt vilka)',
      'Kundbemötande och servicekompetens',
      'Varuplockning och påfyllning',
      'Inventering och ordermottagning',
      'Eventuell säljutbildning (intern eller extern)',
      'Flexibilitet (kvällar/helger)',
      'Språk utöver svenska',
    ],
    faqItems: [
      {
        q: 'Behövs erfarenhet för butiksbiträde-jobb?',
        a: 'Inte alltid — många butiker rekryterar utan erfarenhet om du visar serviceanda och flexibilitet. Däremot väger relevant erfarenhet (även café, restaurang, kundtjänst) tungt eftersom det visar att du kan hantera kundkontakt.',
      },
      {
        q: 'Vad ska sammanfattningen på CV:t handla om?',
        a: 'Tre saker: hur länge du jobbat i service, vilka system du behärskar, och vad som driver dig (kundbemötande, säljmål, lagarbete). Håll det till 3-4 meningar — rekryterare läser det först.',
      },
      {
        q: 'Hur viktigt är språk för butiksjobb?',
        a: 'Mycket viktigt om butiken ligger i centralt läge eller turistområde. Engelska är standard, men arabiska, persiska, polska eller spanska kan vara avgörande beroende på kundkrets.',
      },
    ],
  },
  {
    slug: 'grundskollarare',
    namn: 'Grundskollärare',
    namnBestamd: 'grundskollärare',
    intro: 'Pedagog-mallen med behörigheter och kompetensområden tydligt placerade i sidopanelen.',
    mallId: 'pedagog',
    mallNamn: 'Pedagog',
    varforDennaMall: [
      'Salviegrön sidopanel ger pedagogisk värme utan att kännas barnslig',
      'Behörigheter (åk + ämnen) ligger överst i sidopanelen — det första rektor ser',
      '"Pedagogisk erfarenhet" som rubrik matchar språket i kommunala tjänster',
      'Auto-genererad skol-lista ger snabb överblick av tjänstgöringshistorik',
    ],
    rekryterarTipsen: [
      {
        rubrik: 'Lärarlegitimation och behörigheter är CV-kritiskt',
        text: 'Skriv exakt vilka åldersgrupper och ämnen du är behörig i. "Lärarlegitimation åk 1-6 i svenska, matematik och NO" är tydligare än bara "Lärarlegitimation". Det avgör om du över huvud taget kan söka tjänsten.',
      },
      {
        rubrik: 'Klassrumsledning över ämneskompetens',
        text: 'Rektorer söker lärare som klarar klassrumsmiljö. Nämn konkret: storlek på klasser du haft, antal elever med extra anpassningar, hur du hanterat svåra grupper. Ämneskompetens är förmodat — klassrumsledning skiljer ut dig.',
      },
      {
        rubrik: 'Kollegial samverkan och utvecklingsprojekt',
        text: 'Har du varit med i ämneslag, drivit kollegialt lärande, eller arbetat med läs-/skrivutveckling? Det är efterfrågat. Skriv konkret om resultat: "ledde implementering av Bornholmsmodellen i åk 1, 95% nådde målet".',
      },
    ],
    checklista: [
      'Lärarexamen med specifika åldersgrupper och ämnen',
      'Lärarlegitimation från Skolverket',
      'Behörighet i specifika ämnen (svenska, matematik, NO, etc)',
      'VFU-skolor och handledningserfarenhet',
      'Pedagogiska program och metoder du behärskar',
      'Kollegialt lärande / ämneslagsarbete',
      'Eventuella specialiseringar (NPF, läs-/skrivutveckling, etc)',
    ],
    faqItems: [
      {
        q: 'Hur skiljer sig CV för lärare från andra yrken?',
        a: 'Behörigheter är centrala och måste vara absolut korrekta — ange åldersgrupp + ämne enligt din legitimation. Klassrumsstorlek och elevprofil är CV-stoff som inte finns i andra yrken. Och pedagogiska metoder du behärskar väger tyngre än generiska "kommunikationsförmåga".',
      },
      {
        q: 'Ska jag nämna kommunala upphandlingsavtal?',
        a: 'Bara om du sökt en specifik kommun där det är avgörande. Generellt — fokus på din pedagogiska identitet, dina metoder, dina resultat med elever. Det är vad rektorer värderar mest.',
      },
      {
        q: 'Hur lyfter jag erfarenhet av elever med särskilt stöd?',
        a: 'Skriv konkret om typ av stöd (NPF, dyslexi, språkstöd) och hur du arbetat. "Anpassade undervisning för 4 elever med autism — 100% nådde kunskapskraven i åk 6" säger mer än "har erfarenhet av elever med särskilt stöd".',
      },
    ],
  },
  {
    slug: 'lagerarbetare',
    namn: 'Lagerarbetare',
    namnBestamd: 'lagerarbetare',
    intro: 'Hantverkare-mallen med fokus på behörigheter (truck, ADR), arbetsplatser och fysisk uthållighet.',
    mallId: 'bygg',
    mallNamn: 'Hantverkare',
    varforDennaMall: [
      'Behörigheter & körkort i framträdande block direkt efter sammanfattning — det första lagerchef letar efter',
      'Auto-genererad arbetsplatser-pill-rad visar var du varit, ger snabb översikt',
      'Robust enkolumns-layout är ATS-säker och kan skrivas ut utan att tappa läsbarhet',
      '"Yrkeserfarenhet" som rubrik passar bättre än formellt "Arbetslivserfarenhet"',
    ],
    rekryterarTipsen: [
      {
        rubrik: 'Truck-behörigheter avgör vilka jobb du kan söka',
        text: 'Lista exakt vilka truckar du har behörighet på (A1, A2, A3, B1, B2, B3, B4, C, D, E). Många annonser kräver specifika behörigheter — utan rätt papper sorteras du bort omedelbart.',
      },
      {
        rubrik: 'WMS-system och plockerfarenhet',
        text: 'Vilka lagersystem har du arbetat i? SAP WMS, Pyramid, Manhattan, Astro? Nämn dem konkret. Plockhastighet (rader/timme) och feltal är också CV-relevanta för lager med pick-by-voice eller pick-by-light.',
      },
      {
        rubrik: 'ADR-bevis och säkerhetsutbildning',
        text: 'För lager som hanterar farligt gods (kemikalier, batterier, tryckkärl) är ADR ett krav. Brand-/säkerhetsutbildningar är meriterande för chefroller eller större lagerterminalsanläggningar.',
      },
    ],
    checklista: [
      'Truckutbildning med specifika behörigheter',
      'Körkort B (ofta krav)',
      'ADR-bevis (för farligt gods)',
      'Erfarenhet av WMS-system (vilka)',
      'Plock- och packerfarenhet (volym/hastighet)',
      'Inventering och cykelräkning',
      'Eventuell skiftarbete (3-skift, helger)',
    ],
    faqItems: [
      {
        q: 'Vilka truck-behörigheter ska jag nämna på CV:t?',
        a: 'Alla aktiva. Skriv typ (A1-A4, B1-B5, C, D, E) och utgångsdatum. För nybörjare: lista även vilken utbildning du gått (TYA, Lager- och Terminal, Industrirådets utbildning). Lagerchefer söker ofta efter specifika typer.',
      },
      {
        q: 'Hur viktigt är arbetstider på lager-CV?',
        a: 'Mycket. Många lager kör 3-skift, kvällar eller helger. Ange tydligt om du är flexibel: "Tillgänglig för 2-skift och helgarbete". Det sorterar dig in i en kortare urvalslista.',
      },
      {
        q: 'Räcker erfarenhet eller behövs utbildning?',
        a: 'Truck och ADR kräver formell utbildning — inget alternativ. Men för plock, pack och inventering vinner erfarenhet över utbildning. Specifika WMS-system och plockmetoder är mer värda än "lagerlogistik 50 hp".',
      },
    ],
  },
  {
    slug: 'saljare',
    namn: 'Säljare',
    namnBestamd: 'säljare',
    intro: 'Aurora-mallen med "Nyckelresultat"-panel som lyfter dina kvantifierade säljsiffror.',
    mallId: 'aurora',
    mallNamn: 'Aurora',
    varforDennaMall: [
      '"Nyckelresultat"-panel i header lyfter kvantifierade siffror först — det säljchefer letar efter',
      'Subtil emerald-orange gradient signalerar tillväxt och energi utan att vara klyschig',
      '65/35 layout med fokus på erfarenhet + KPI:er ger plats åt både berättelse och siffror',
      'Foto + LinkedIn integrerade i header — viktigt för säljare där personlig branding spelar roll',
    ],
    rekryterarTipsen: [
      {
        rubrik: 'Säljsiffror är allt — kvantifiera allt',
        text: 'Skriv inte "ansvarig för försäljning till storkunder". Skriv "ökade ARR 24% (från 8M till 9.9M) under 18 mån genom upselling till 12 nyckelkunder". Säljchefer slänger CV:n utan siffror.',
      },
      {
        rubrik: 'Försäljningsmetoder du behärskar',
        text: 'MEDDIC, BANT, Challenger Sale, SPIN — nämn metoder du arbetat efter. Det är ATS-keywords som SaaS- och B2B-företag filtrerar på.',
      },
      {
        rubrik: 'CRM-system och säljstack',
        text: 'Salesforce, HubSpot, Pipedrive, Lime — vilka system har du jobbat i? Säljstacken (Apollo, Outreach, Gong, ZoomInfo) är meriterande för B2B-roller.',
      },
    ],
    checklista: [
      'Total försäljningsbudget du ansvarat för',
      'Konkret måluppfyllelse (% av budget) per år',
      'Säljmetod du arbetar efter (MEDDIC, BANT, etc)',
      'CRM-system du behärskar',
      'Antal kunder/leads du hanterat parallellt',
      'Snittstorlek på affärer du stängt',
      'Eventuella säljutbildningar och certifieringar',
    ],
    faqItems: [
      {
        q: 'Vilka siffror är viktigast på ett säljar-CV?',
        a: 'Tre kärnsiffror: total budget du ansvarat för, måluppfyllelse i procent, och tillväxt i absoluta tal (ARR, omsättning, antal kunder). En säljare som visar "ökade ARR med 24%" får intervju över en som skriver "drev tillväxt".',
      },
      {
        q: 'Ska jag nämna provisioner eller bonusar?',
        a: 'Inte själva provisionsbeloppet, men gärna måluppfyllelse i procent som triggade bonus ("130% av mål 2 år i rad"). Det visar att du levererar konsekvent.',
      },
      {
        q: 'Hur långt CV ska en säljare ha?',
        a: 'För juniora säljare (0-5 år): 1 sida. För erfarna B2B/key account: 1.5-2 sidor. För säljchefer/CSO: 2 sidor. Säljchefer skannar fort — håll varje rad relevant.',
      },
    ],
  },
  {
    slug: 'barnskotare',
    namn: 'Barnskötare',
    namnBestamd: 'barnskötare',
    intro: 'Pedagog-mallen anpassad för förskolemiljö med tydlig plats för utbildning och certifikat.',
    mallId: 'pedagog',
    mallNamn: 'Pedagog',
    varforDennaMall: [
      'Salviegrön sidopanel signalerar omsorg och pedagogik utan att vara klyschig',
      'Behörigheter (barnskötarutbildning, HLR, allergikompetens) ligger överst i sidopanelen',
      'Strukturen lyfter pedagogiska metoder och åldersgrupper du arbetat med',
      'ATS-säker — passerar kommunala rekryteringssystem (Visma, Heroma)',
    ],
    rekryterarTipsen: [
      {
        rubrik: 'Åldersgrupper och pedagogiska inriktningar',
        text: 'Vilka åldrar har du arbetat med? 1-3 år, 3-5 år? Vilken pedagogisk inriktning hade förskolan? Reggio Emilia, Montessori, Ur och Skur? Förskolechefer söker matchning till sin egen verksamhet.',
      },
      {
        rubrik: 'Allergikompetens och specialkost',
        text: 'Hantering av specialkost, kunskap om allergier, tecken på allergiska reaktioner — det är konkret kompetens som efterfrågas. HLR-certifikat med utgångsdatum är ofta krav.',
      },
      {
        rubrik: 'Föräldrakontakt och utvecklingssamtal',
        text: 'Har du hållit utvecklingssamtal eller deltagit i föräldramöten? Lyft det. Det visar att du klarar förälderkommunikation, vilket är en vanlig orsak till att barnskötare lämnar yrket.',
      },
    ],
    checklista: [
      'Barnskötarutbildning (gymnasium eller vuxenutbildning)',
      'Erfarenhet med specifika åldersgrupper (1-3, 3-5)',
      'Pedagogisk inriktning du jobbat efter',
      'HLR-certifikat med utgångsdatum',
      'Allergikompetens och specialkost-hantering',
      'Erfarenhet av barn med särskilt stöd',
      'Språk utöver svenska (efterfrågat i mångkulturella förskolor)',
    ],
    faqItems: [
      {
        q: 'Behövs barnskötarutbildning eller räcker erfarenhet?',
        a: 'För kommunala anställningar krävs ofta barnskötarutbildning eller pågående utbildning. Privata förskolor kan vara mer flexibla. Erfarenhet av eget barn räknas tyvärr inte som meritgrundande — men nattvak, dagmamma eller au pair är meriterande.',
      },
      {
        q: 'Hur ska jag beskriva pedagogiska metoder utan att verka påläst?',
        a: 'Skriv konkret hur du arbetat med metoden i vardagen: "Använde Reggio Emilia-projekt om vatten under hösten 2023, dokumenterade barnens utforskande i lärloggen". Inte "är intresserad av Reggio Emilia".',
      },
      {
        q: 'Hur lyfter jag erfarenhet av barn med särskilt stöd?',
        a: 'Skriv vilken typ av behov (autism, språkstöd, motoriska svårigheter), hur många barn, och vilka anpassningar du gjorde. "Anpassade rutiner för 2 barn med autism — implementerade visuella scheman" är konkret och värdefullt.',
      },
    ],
  },
  {
    slug: 'sjukskoterska',
    namn: 'Sjuksköterska',
    namnBestamd: 'sjuksköterska',
    intro: 'Vården-mallen med plats för specialistkompetenser, dokumentationssystem och kliniska arbetsplatser.',
    mallId: 'varden-omsorg',
    mallNamn: 'Vården',
    varforDennaMall: [
      'Salviegrön sidopanel signalerar vård utan att förlora professionell precision',
      'Legitimation och specialistutbildning ligger överst i sidopanelen — det HR letar efter',
      '"Klinisk erfarenhet" som rubrik matchar språket i sjukvårdens tjänsteannonser',
      'Auto-genererad arbetsplats-lista ger HR snabb översikt över din kliniska bakgrund',
    ],
    rekryterarTipsen: [
      {
        rubrik: 'Specialistutbildning är CV-avgörande',
        text: 'Har du specialistutbildning? Anestesi, akutsjukvård, intensivvård, distrikt, psykiatri? Specialistsjuksköterskor får upp till 30% högre lön och prioriteras vid rekrytering. Specifik specialitet öppnar specifika tjänster.',
      },
      {
        rubrik: 'Vårdtyngd och patientvolymer',
        text: 'Hur många patienter ansvarade du för per pass? På IVA är det 1-2, på vårdavdelning 6-8. Ange det — vårdtyngd är en hårdvaluta som chefer förstår direkt.',
      },
      {
        rubrik: 'Dokumentationssystem och fackliga uppdrag',
        text: 'Cosmic, Take Care, Melior, NCS Cross — nämn dokumentationssystem. Eventuella fackliga uppdrag (skyddsombud, Vårdförbundet-aktiv) är meriterande för seniora roller.',
      },
    ],
    checklista: [
      'Sjuksköterskeexamen och legitimation från Socialstyrelsen',
      'Specialistutbildning (om någon)',
      'Vidareutbildningar (CMP, ALS, A-HLR, ATLS)',
      'Erfarenhet av specifika dokumentationssystem',
      'Klinisk erfarenhet med specifika patientgrupper',
      'Forskningsmeriter eller utvecklingsprojekt',
      'Eventuell handledarutbildning',
    ],
    faqItems: [
      {
        q: 'Hur skiljer sig CV för sjuksköterska från undersköterska?',
        a: 'Sjuksköterska har akademisk grundutbildning + legitimation som måste anges precist (datum, registreringsnummer). Specialistutbildningar och vetenskapliga uppdrag är CV-relevanta. För undersköterska är medicinska delegeringar centrala — för sjuksköterska är det egen ordinationsrätt och självständigt arbete.',
      },
      {
        q: 'Ska jag nämna nattjour och övertid?',
        a: 'Ja, om du är beredd till det. Många avdelningar prioriterar sökande som tar både dag, kväll, natt och helg. Ange tydligt: "Tillgänglig för rotationsschema inkl natt och helg".',
      },
      {
        q: 'Hur långt ska ett sjuksköterske-CV vara?',
        a: 'För grundutbildade: 1-1.5 sidor. Specialistsjuksköterskor med flera års erfarenhet: 2 sidor. Forskande/disputerade sjuksköterskor: 2-3 sidor. Vården accepterar längre CV än andra branscher.',
      },
    ],
  },
]

export const YRKESMALL_SLUGS = YRKESMALL_LIST.map(y => y.slug)
