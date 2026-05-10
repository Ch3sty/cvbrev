/**
 * Detaljerad yrkes-content for /cv-mallar/[yrke]-sidorna.
 *
 * Innehaller per yrke:
 *  - kompetenser (tekniska + personliga)
 *  - profil-exempel + tips
 *  - rekryterar-tips (3 unika punkter per yrke)
 *  - sektion-tips (vad som ska sta i varje del av CV:t)
 *  - checklista
 *  - faq
 *  - ats-info
 *
 * Strukturen ar uppdelad i kategorier for lasbarhet. Vissa yrken har
 * RIKA detaljer (lakare, sjukskoterska, saljare), andra anvander
 * branschdefaults (kategori-templates langre ner).
 */

export interface YrkesContent {
  /** Hero-ingress (60-80 ord) for sidans h1-paragraf - unik per yrke. Optional under utbyggnad. */
  heroIngress?: string

  /** SEO-intro: 185-220 ord under hero (4 stycken: hook, lOsning, specificitet, CTA) */
  seoIntro?: string

  /** 6 punkter "Viktigt att tanka pa" - icon + title + description (2-3 meningar) */
  viktigtAttTankaPa?: {
    icon: 'FileText' | 'Target' | 'Award' | 'TrendingUp' | 'CheckCircle' | 'AlertCircle' | 'Briefcase' | 'GraduationCap'
    title: string
    description: string
  }[]

  /** 6 punkter "Varfor var mall passar yrket" - hur den ar designad, vad vi tankt pa */
  varforVarMallPassar?: { title: string; description: string }[]

  /** Vanliga arbetsuppgifter for yrket - 5 grupper med 3-4 underpunkter */
  arbetsuppgifter?: { rubrik: string; punkter: string[] }[]

  /** Branschterminologi - 4-6 grupper med termer + fOrklaringar (rendreras som accordion) */
  branschtermer?: { kategori: string; termer: { term: string; forklaring: string }[] }[]

  /** Typiska arbetsgivare - 3-5 grupper */
  typiskaArbetsgivare?: { kategori: string; exempel: string[] }[]

  /** Utbildningsvagar - vilka examen/kurser leder till yrket */
  utbildningsvagar?: { rubrik: string; beskrivning: string }[]

  /** Branschspecifika kompetenser */
  kompetenser: { tekniska: string[]; personliga: string[] }
  /** Konkret 3-radig profil-exempel-text (matchar GSC: "cv profil exempel") */
  profilExempel: string
  /** Tips for hur man skriver bra profil for yrket */
  profilTips: string
  /** Rekryterar-tips per yrke (3 idag, ska utOkas till 6) */
  rekryterarTipsen: { rubrik: string; text: string }[]
  /** Vad som ska sta i varje CV-sektion */
  sektionTips: { sektion: string; tips: string }[]
  /** Yrkesspecifik checklista (utOkas till 8-10 punkter) */
  checklista: string[]
  /** ATS-info specifik for yrket */
  atsInfo: string
  /** Yrkes-specifika FAQ (3 idag, ska utOkas till 10) */
  faqItems: { q: string; a: string }[]
}

/**
 * Dedikerad rik content for de viktigaste yrkena.
 * For yrken som inte har egen entry anvands kategori-defaults.
 */
export const YRKES_CONTENT: Record<string, YrkesContent> = {
  // ============================================================================
  // VÅRD
  // ============================================================================
  'lakare': {
    seoIntro:
      'Som läkare i Sverige söker du tjänster där varje merit har sitt eget värde. Legitimation från Socialstyrelsen, AT- och ST-tjänstgöringar, specialistbevis och publikationer bedöms separat av verksamhetschefer som ofta skannar 30 ansökningar på en eftermiddag. Ett generiskt CV-format döljer dina starkaste meriter mitt i en löpande text.\n\nVår mall för läkare är byggd för att lyfta legitimationsstatus och specialistutbildning som första visuella element. Klinisk tjänstgöring lägger vi i kronologisk ordning med diagnosspektra, volymer och dokumentationssystem (Cosmic, TakeCare, Melior, NCS Cross) i klartext. Publikationer får eget block med tidskrift, år och författarordning, vilket gör dem läsbara både för rekryteraren och för Heroma och Visma Recruits ATS-system.\n\nKonkret innehåll vi rekommenderar i ett läkar-CV: legitimationsdatum från Socialstyrelsen, AT-block med klinik och längd, ST-tjänstgöringar uppdelade per delspecialitet, specialistbevis och eventuella subspecialiseringar, publikationer i Vancouver-format, konferensbidrag och forskningsbidrag. Lägg till CME-poäng, handledarutbildningar och tjänsteresor om du söker överläkar- eller verksamhetschefroller.\n\nNedan hittar du två CV-mallar designade för läkar-rollen, ett färdigt CV-exempel för internmedicin du kan utgå från, och konkreta tips på vad rekryterare på sjukhus och privata kliniker faktiskt letar efter. Ladda ner mallen gratis och anpassa den efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'Award',
        title: 'Legitimation och specialistbevis först',
        description: 'Verksamhetschefer kollar först om du är legitimerad och inom vilken specialitet. Ange Socialstyrelsens registreringsdatum och eventuella subspecialiseringar i sidopanelen så de syns inom de första fem sekunderna.',
      },
      {
        icon: 'TrendingUp',
        title: 'Kvantifiera kliniska volymer',
        description: 'Antal patienter per vecka, jourdygn per månad, utredningar du genomfört. Konkreta siffror gör skillnad mellan ett anonymt CV och ett som chefer minns. "Ansvarade för 30-40 inneliggande patienter på medicinavdelning" säger mer än "klinisk erfarenhet".',
      },
      {
        icon: 'FileText',
        title: 'Publikationer i Vancouver-format',
        description: 'Forskningsmeriter listas kronologiskt fallande med tidskrift, år, författarordning. Markera ditt namn fetstil. Begränsa till 5-10 senaste och mest relevanta för tjänsten du söker. Inkludera DOI eller PubMed-länk där det går.',
      },
      {
        icon: 'CheckCircle',
        title: 'Diagnosspektra du behärskar',
        description: 'Olika sjukhus har olika behov. Vid akutkliniken vill de se akutmedicin och triage. På geriatrik vill de se demens och multisjuklighet. Var konkret om vilka tillstånd du hanterat och i vilken volym.',
      },
      {
        icon: 'Briefcase',
        title: 'Dokumentationssystem i klartext',
        description: 'Cosmic, TakeCare, Melior, Pascal, NCS Cross. Skriv ut systemnamnen så ATS-system kan filtrera fram dig. Olika regioner använder olika system och rekryteraren letar specifikt efter det system kliniken har.',
      },
      {
        icon: 'Target',
        title: 'Handledning och utvecklingsuppdrag',
        description: 'Att handleda ST-läkare, AT-läkare eller medicinstudenter är en stark merit för senior- och överläkar-roller. Ange antal handledningstimmar per termin och eventuella utbildningsuppdrag.',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'Legitimation lyfts överst i sidopanelen',
        description: 'Verksamhetschefer skannar först efter Socialstyrelsens registrering. Vi har gjort det till första visuella elementet i sidopanelen så det syns på fem sekunder utan att du behöver scrolla.',
      },
      {
        title: 'AT, ST och specialiseringar har egen sektion',
        description: 'Tre olika typer av tjänstgöring som chefer värderar olika. Mallen separerar dem så ingen merit drunknar i en generisk arbetslivshistorik. ST-tjänstgöringar grupperas dessutom efter delspecialitet.',
      },
      {
        title: 'Tabellär layout för publikationer',
        description: 'Forskande läkare har ofta 10-30 publikationer. Vår tabellära struktur ger plats utan att ta över första sidan. Författarordning syns visuellt med din position fetad.',
      },
      {
        title: 'Diagnosspektra som taggrad',
        description: 'Olika sjukhus letar efter olika kompetensprofiler. Vi har en taggrad där du listar diagnosspektra och utredningstyper du behärskar i klartext, vilket både rekryterare och ATS kan parsa.',
      },
      {
        title: 'Premium-mallen lägger CME-block',
        description: 'För specialist- och överläkarroller väger vidareutbildning tungt. Premium-varianten har ett dedikerat block för CME-poäng, kongressbidrag och fortbildning som inte tar plats från klinisk tjänstgöring.',
      },
      {
        title: 'Sober färgsättning för tradition',
        description: 'Vården värderar tradition och saklighet. Vi använder dämpad serif på rubriker och svartvit grund med subtila accenter. Inget som distraherar från meritbilden eller signalerar oprofessionell.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Klinisk diagnostik och behandling',
        punkter: [
          'Anamnes, status, differentialdiagnos och behandlingsplan för varierande patientgrupper',
          'Bedömning av akut sjukdom och initial behandling vid akutmottagning eller jour',
          'Uppföljning av kroniska tillstånd och justering av medicinering över tid',
          'Konsultation till andra avdelningar och tvärprofessionella team',
        ],
      },
      {
        rubrik: 'Dokumentation och förskrivning',
        punkter: [
          'Journalföring enligt patientdatalagen i Cosmic, TakeCare, Melior eller motsvarande',
          'Förskrivning av läkemedel via receptmodul med kontroll mot Socialstyrelsens regelverk',
          'Skriva intyg, remisser och epikriser med juridisk korrekthet',
          'Dokumentera avvikelser och delta i Lex Maria-processer vid behov',
        ],
      },
      {
        rubrik: 'Multidisciplinärt teamarbete',
        punkter: [
          'Ronder med sjuksköterskor, undersköterskor och paramedicinsk personal',
          'Vårdplaneringsmöten med patient, anhöriga och utskrivningsteam',
          'Konsultation med specialister från andra kliniker och regioner',
          'Samverkan med kommunal hälso- och sjukvård vid utskrivning',
        ],
      },
      {
        rubrik: 'Handledning och utbildning',
        punkter: [
          'Handleda AT- och ST-läkare under tjänstgöring',
          'Handleda medicinstudenter under VFU-perioder',
          'Kollegial fortbildning på avdelningen och delta i journal club',
          'Bidra till verksamhetens utvecklingsarbete och kvalitetsregister',
        ],
      },
      {
        rubrik: 'Forskning och utvecklingsarbete',
        punkter: [
          'Klinisk forskning inom eget specialistområde med peer-reviewed publikationer',
          'Bidra till kvalitetsregister och avvikelseanalys på kliniken',
          'Konferensbidrag, posters och föreläsningar',
          'Handledning av doktorander eller examensarbeten på medicinprogrammet',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Lagstiftning och regelverk',
        termer: [
          { term: 'PDL', forklaring: 'Patientdatalagen, reglerar all journaldokumentation och hantering av patientuppgifter.' },
          { term: 'HSL', forklaring: 'Hälso- och sjukvårdslagen, ramen för all hälso- och sjukvård i Sverige.' },
          { term: 'OSL', forklaring: 'Offentlighets- och sekretesslagen, gäller när du arbetar inom region eller kommun.' },
          { term: 'PSL', forklaring: 'Patientsäkerhetslagen, reglerar vårdgivarens och din skyldighet att rapportera avvikelser.' },
          { term: 'Lex Maria', forklaring: 'Anmälningsskyldighet vid vårdskador eller risk för sådana.' },
          { term: 'Lex Sarah', forklaring: 'Anmälningsskyldighet vid missförhållanden inom socialtjänst och LSS.' },
        ],
      },
      {
        kategori: 'Tjänstgöring och specialiteter',
        termer: [
          { term: 'AT-läkare', forklaring: 'Allmäntjänstgöring, 18-21 månader efter läkarexamen innan legitimation.' },
          { term: 'ST-läkare', forklaring: 'Specialiseringstjänstgöring, minst 5 år för att bli specialist inom valt område.' },
          { term: 'BT-läkare', forklaring: 'Bastjänstgöring, ny modell som ersätter AT från 2027 (12 månader).' },
          { term: 'Specialistläkare', forklaring: 'Läkare med specialistbevis från Socialstyrelsen inom någon av över 50 specialiteter.' },
          { term: 'Överläkare', forklaring: 'Senior specialistläkare med medicinskt eller administrativt ledarskapsansvar.' },
          { term: 'Verksamhetschef', forklaring: 'Övergripande chef för en klinik eller verksamhet, ofta överläkare med MBA eller motsvarande.' },
        ],
      },
      {
        kategori: 'Journalsystem och IT',
        termer: [
          { term: 'Cosmic', forklaring: 'Vanligaste journalsystemet i offentlig vård, används i bland annat Region Stockholm och Skåne.' },
          { term: 'TakeCare', forklaring: 'Journalsystem som används i flera regioner, främst i mellersta och norra Sverige.' },
          { term: 'Melior', forklaring: 'Äldre journalsystem som fortfarande är i bruk på vissa kliniker, oftast slutenvård.' },
          { term: 'Pascal', forklaring: 'Förskrivningsmodul för läkemedel kopplad till SoS register.' },
          { term: 'NCS Cross', forklaring: 'Journalsystem för primärvård i flera regioner.' },
          { term: 'NPÖ', forklaring: 'Nationell patientöversikt, gemensam patientinformation över region- och vårdgränser.' },
        ],
      },
      {
        kategori: 'Forskning och meritering',
        termer: [
          { term: 'Vancouver-format', forklaring: 'Standard för referenser i medicinsk litteratur, används för publikationer på CV.' },
          { term: 'Impact factor', forklaring: 'Ett mått på en tidskrifts genomslag, ofta efterfrågat på meriterande CV.' },
          { term: 'CME-poäng', forklaring: 'Continuing Medical Education, dokumenterad fortbildning för specialistläkare.' },
          { term: 'Klinisk forskarutbildning', forklaring: 'Disputation med kliniskt fokus, ofta meriterande för tjänster på universitetssjukhus.' },
          { term: 'Förstaförfattare', forklaring: 'Position i publikation som indikerar att du gjort huvuddelen av arbetet.' },
          { term: 'Sistaförfattare', forklaring: 'Senior position som indikerar handledarroll eller forskningsledarskap.' },
        ],
      },
      {
        kategori: 'Roll- och verksamhetstermer',
        termer: [
          { term: 'Slutenvård', forklaring: 'Vård där patienten är inneliggande på sjukhus, ofta längre vårdtider och tyngre patienter.' },
          { term: 'Öppenvård', forklaring: 'Mottagningsverksamhet utan inneliggande, vanligast inom primärvård och specialistmottagningar.' },
          { term: 'Akutsjukvård', forklaring: 'Akutmottagning och akut omhändertagande av patienter med varierande problembild.' },
          { term: 'Primärvård', forklaring: 'Första linjens sjukvård, ofta vårdcentral. Här jobbar oftast specialister i allmänmedicin.' },
          { term: 'Subspecialitet', forklaring: 'Fördjupning inom en grundspecialitet, t.ex. kardiologi inom internmedicin.' },
          { term: 'Konsultläkare', forklaring: 'Specialistläkare anlitad för enstaka uppdrag eller jourkonsultationer.' },
        ],
      },
    ],

    typiskaArbetsgivare: [
      {
        kategori: 'Universitetssjukhus',
        exempel: [
          'Karolinska Universitetssjukhuset, Stockholm',
          'Sahlgrenska Universitetssjukhuset, Göteborg',
          'Skånes Universitetssjukhus, Lund och Malmö',
          'Akademiska Sjukhuset, Uppsala',
        ],
      },
      {
        kategori: 'Region- och länssjukhus',
        exempel: [
          'Södersjukhuset och Danderyds sjukhus, Stockholm',
          'NÄL och Östra sjukhuset, Västra Götaland',
          'Universitetssjukhuset Örebro',
          'Norrlands universitetssjukhus, Umeå',
        ],
      },
      {
        kategori: 'Primärvård och specialistmottagningar',
        exempel: [
          'Vårdcentraler i regional regi',
          'Privata primärvårdsbolag (Capio, Praktikertjänst)',
          'Specialistmottagningar inom hud, ögon, gyn',
          'Företagshälsa (Avonova, Feelgood, Previa)',
        ],
      },
      {
        kategori: 'Privata och utländska arbetsgivare',
        exempel: [
          'Privata sjukhus och kliniker (Sophiahemmet, GHP)',
          'Bemanningsbolag (Dedicare, Nightingale, Empleo)',
          'Hyrläkaruppdrag i Norge eller Danmark',
          'Forskningsinstitut och bioteknikbolag',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Läkarprogrammet (5,5 år)',
        beskrivning: 'Grundutbildning vid Karolinska Institutet, Lunds universitet, Göteborgs universitet, Uppsala universitet, Umeå universitet, Linköpings universitet eller Örebro universitet. Examen ger rätt att söka AT-tjänst.',
      },
      {
        rubrik: 'AT- eller BT-tjänstgöring (1,5-2,5 år)',
        beskrivning: 'Allmäntjänstgöring eller bastjänstgöring efter examen. Kombination av medicin, kirurgi, psykiatri och primärvård. Avslutas med AT-prov för läkarlegitimation från Socialstyrelsen.',
      },
      {
        rubrik: 'ST-tjänstgöring (5-7 år)',
        beskrivning: 'Specialiseringstjänstgöring inom någon av över 50 svenska medicinska specialiteter. Kombineras ofta med kurser, sidotjänstgöring och eventuell forskarutbildning. Avslutas med specialistexamen.',
      },
      {
        rubrik: 'Subspecialisering eller doktorsexamen',
        beskrivning: 'För senior- och överläkarroller är subspecialisering eller disputation ofta meriterande. Kliniska forskarutbildningar tar 4-5 år parallellt med tjänstgöring.',
      },
    ],

    kompetenser: {
      tekniska: [
        'Klinisk diagnostik och differentialdiagnos',
        'Journalsystem (Cosmic, TakeCare, Melior, Pascal, NCS Cross)',
        'Akutmedicin och initial bedömning',
        'Förskrivning och receptmodul enligt Socialstyrelsens regelverk',
        'Medicinsk dokumentation enligt patientdatalagen',
        'Vetenskaplig metodik och kritisk granskning',
        'Multidisciplinärt teamarbete och rondledning',
        'Patientsäkerhetsarbete och avvikelseanalys',
        'A-HLR och avancerat omhändertagande',
        'Konsultation och remisshantering',
        'Handledning av AT-, ST- och studentläkare',
        'Kvalitetsregister och kliniskt utvecklingsarbete',
      ],
      personliga: [
        'Empatiskt och professionellt patientbemötande',
        'Stresstålighet i akuta situationer',
        'Tydlig kommunikation med patient, anhöriga och team',
        'Pedagogisk i mötet med oroliga patienter',
        'Etiskt förhållningssätt vid svåra avvägningar',
        'Strukturerad i prioritering och beslutsfattande',
        'Lagspelare i tvärprofessionellt arbete',
      ],
    },

    profilExempel:
      'Specialistläkare i internmedicin med 8 års klinisk erfarenhet av akutsjukvård och slutenvård. Genomför 1500+ patientmöten per år med fokus på multisjuka patienter och komplex differentialdiagnostik. Handledare för ST-läkare och delaktig i klinisk forskning kring sepsis och antibiotikaresistens.',

    profilTips:
      'Ange specialitet och år av erfarenhet i första meningen. Andra meningen kvantifierar din volym (patienter per år, antal jourdygn). Tredje meningen lyfter forskning, handledning eller subspecialisering som differentierar dig från andra med samma titel.',

    rekryterarTipsen: [
      {
        rubrik: 'Specialistbevis och legitimation tydligt placerade',
        text: 'Verksamhetschefer skannar först efter legitimationsstatus och specialistbevis. Ange utfärdande myndighet (Socialstyrelsen), datum och eventuella subspecialiseringar i en egen sidopanel.',
      },
      {
        rubrik: 'Publikationer i Vancouver-format',
        text: 'För specialist- och forskningsläkare väger publikationer tungt. Lista i kronologiskt fallande ordning med tidskrift, år, författarordning. Markera ditt namn fetstil och begränsa till 5-10 senaste och mest relevanta.',
      },
      {
        rubrik: 'Kvantifiera kliniska volymer',
        text: 'Skriv antal patienter du ansvarat för per vecka, antal jourdygn per månad, vilka diagnosspektra du behärskar. Konkreta siffror ger rekryteraren snabbt en bild av din kapacitet och var du kan plockas in.',
      },
      {
        rubrik: 'Diagnosspektra och utredningstyper',
        text: 'Olika sjukhus har olika behov. Akutkliniken vill se akutmedicin och triage, geriatriken vill se demens och multisjuklighet. Var explicit om vilka tillstånd du hanterat så rekryteraren kan matcha dig direkt.',
      },
      {
        rubrik: 'Dokumentationssystem och rondledning',
        text: 'Cosmic, TakeCare, Melior, Pascal, NCS Cross. Skriv ut systemnamnen i kompetens-listan så ATS-system kan filtrera fram dig. Inkludera rondledar-erfarenhet om du söker senior-roller.',
      },
      {
        rubrik: 'Handledning och utvecklingsuppdrag',
        text: 'Att handleda ST-läkare, AT-läkare eller medicinstudenter är stark merit för senior- och överläkar-roller. Ange antal handledningstimmar per termin och eventuella utvecklingsuppdrag på kliniken.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'Specialitet, år av erfarenhet, primärt verksamhetsområde. 3-4 rader. Inga floskler om "engagerad och driven" utan konkreta meriter.' },
      { sektion: 'Erfarenhet', tips: 'AT, ST och specialisttjänstgöringar i kronologisk ordning. Klinik, ort, tidsperiod. Bullets med diagnosspektra, vårdtyngd och nyckelvolymer.' },
      { sektion: 'Utbildning', tips: 'Läkarexamen från lärosäte med år. AT-/BT-block med klinik och längd. Specialistutbildning som egen rad med kursprogram och delspecialitet.' },
      { sektion: 'Publikationer', tips: 'Kronologiskt fallande i Vancouver-format. Författarordning markeras med fetstil på ditt namn. Inkludera DOI eller PubMed-länk där möjligt.' },
      { sektion: 'Vidareutbildning', tips: 'CME-poäng, kongressbidrag, kurser och certifieringar (A-HLR, ATLS, ALS). Ange utgångsdatum för certifikat som löper ut.' },
      { sektion: 'Forskningsmeriter', tips: 'Anslag, stipendier, posters, konferensbidrag. Lägg till handledning av doktorander om relevant.' },
    ],

    checklista: [
      'Legitimationsbevis från Socialstyrelsen med datum',
      'Specialistbevis och eventuella subspecialiseringar',
      'AT- eller BT-tjänstgöring med klinik och tidsperiod',
      'ST-tjänstgöringar uppdelade per delspecialitet',
      'Vetenskapliga publikationer i Vancouver-format',
      'Forskningsbidrag, anslag och stipendier',
      'Konferensbidrag och poster-presentationer',
      'CME-poäng och vidareutbildningar med datum',
      'Handledarutbildning och pedagogisk meritering',
      'Dokumentationssystem och kliniska metoder',
    ],

    atsInfo:
      'Både vår mall Tidlös och premium-varianten Klinik är ATS-säkra. Region- och privata sjukhus använder oftast Heroma, Visma Recruit eller eRecruiter, alla läser standardrubriker som "Arbetslivserfarenhet" och "Utbildning" korrekt. Använd vanlig listformatering för publikationer så systemet kan parsa författare, titel och år. Skriv ut systemnamnen (Cosmic, TakeCare, Melior) i klartext eftersom rekryterare ofta filtrerar exakta termer från jobbannonsen.',

    faqItems: [
      {
        q: 'Vad ska finnas med i ett läkar-CV?',
        a: 'Legitimation från Socialstyrelsen med datum, AT- eller BT-tjänstgöring, ST-tjänstgöringar uppdelat per delspecialitet, specialistbevis och subspecialiseringar. Lägg till publikationer i Vancouver-format, forskningsbidrag, CME-poäng och handledarmeritering om du söker senior-roller. Konkreta volymer (patienter per vecka, jourdygn per månad) gör att din kapacitet syns direkt.',
      },
      {
        q: 'Hur skriver jag ett läkar-CV utan färdig specialistexamen?',
        a: 'Som AT- eller ST-läkare lyfter du istället klinisk bredd och delspecialiteter du tjänstgjort inom. Ange varje sidotjänstgöring med klinik, längd och vilka tillstånd du hanterat. Forskningsuppsatser, valfria kurser och eventuell vetenskaplig produktion under läkarprogrammet är meriterande. Lägg också in språkkunskaper och eventuell utlandserfarenhet som kan vara värdefull för specifika tjänster.',
      },
      {
        q: 'Hur lång ska ett läkar-CV vara?',
        a: 'AT- och ST-läkare 1-2 sidor är lagom. Specialistläkare och överläkare med längre meritlistor brukar ha 2-3 sidor och det är acceptabelt i sjukvården eftersom meritprofiler är centrala. Forskningsläkare med disputation kan ha 3-4 sidor med dedikerad publikationslista. Det viktiga är att första sidan innehåller det starkaste innehållet.',
      },
      {
        q: 'Ska jag inkludera publikationer på ett läkar-CV?',
        a: 'Ja om du söker tjänster där forskningsmeriter värderas: universitetssjukhus, specialistmottagningar, akademiska kliniker. Lista i Vancouver-format, kronologiskt fallande, med din författarordning markerad. Begränsa till 5-10 senaste och mest relevanta för tjänsten. För renodlade kliniska roller på mindre sjukhus räcker en kortfattad rad med antal publikationer plus de tre viktigaste.',
      },
      {
        q: 'Vilka nyckelord behöver CV:t passera ATS?',
        a: 'Specifika diagnosspektra (sepsis, KOL, hjärtsvikt, diabetes typ 2), dokumentationssystem (Cosmic, TakeCare, Melior, Pascal), och kliniska metoder du behärskar. Nämn legitimation, specialistbevis och subspecialiseringar i klartext. Heroma och Visma Recruit söker exakt på dessa termer. Kopiera språkbruket från jobbannonsen där du faktiskt har erfarenheten.',
      },
      {
        q: 'Behöver jag personligt brev till läkar-tjänster?',
        a: 'Ja, för de flesta tjänster i Sverige förväntas ett personligt brev. Använd brevet för att förklara varför du söker just den klinik och inte upprepa CV-meriter. Beskriv en specifik utveckling du varit med om, vilken patientgrupp du brinner för, och vad som drar dig till verksamheten. Håll till en sida på 300-400 ord. Ett välskrivet brev kan vara avgörande när två kandidater har liknande CV.',
      },
      {
        q: 'Ska jag ange önskad lön eller löneförväntningar?',
        a: 'Nej, inte i CV eller personligt brev. Inom offentlig sjukvård sker löneförhandling enligt Sveriges Läkarförbunds tariffer plus individuella påslag, och hanteras vid intervju eller kontraktsskrivning. Inom privat vård är det förhandlingsbart men nämns vid första djupare kontakt. Att förstora upp lönefrågan tidigt signalerar fel prioritering.',
      },
      {
        q: 'Hur visar jag forskningskompetens om jag inte är disputerad?',
        a: 'Bidragsförfattarskap, posters, konferensföreläsningar, kvalitetsregisterarbete och egen kvalitetsutveckling är alla forskningsmeriter. Lägg in en sektion "Vetenskapligt arbete" eller "Utvecklingsuppdrag" där du listar dem. Studentprojekt under läkarprogrammet, examensarbeten på masternivå och eventuellt arbete med kliniska studier räknas också. Fokusera på vad du faktiskt bidragit med, inte titeln.',
      },
      {
        q: 'Vilka IT-system förväntas en läkare kunna 2026?',
        a: 'Cosmic dominerar Region Stockholm och Skåne, TakeCare används i fler regioner, Melior finns på vissa kliniker. Pascal är förskrivningsmodul och NPÖ är gemensam patientöversikt. Lägg också till Office-paketet, Teams för digitala möten, och eventuell vana med kvalitetsregister (Riksstroke, SwedeHeart, etc). Att vara öppen för digitala vårdmöten och AI-baserat beslutsstöd är meriterande för 2026.',
      },
      {
        q: 'Vad ska jag inte ha med på mitt läkar-CV?',
        a: 'Personnummer (bara födelseår), foto i offentlig sektor (riskerar diskriminering), löneförväntningar, irrelevanta arbetslivserfarenheter äldre än 15 år, generiska påståenden utan stöd ("god empatisk förmåga"), patientuppgifter eller sekretessbelagda detaljer, och hobbies som inte är relevanta. Stavfel och inkonsekvent formatering diskvalificerar dig direkt eftersom dokumentationsförmåga är central i rollen.',
      },
    ],
  },

  'sjukskoterska': {
    seoIntro:
      'Som sjuksköterska tillhör du Sveriges mest efterfrågade yrkesgrupp. Region- och kommunala arbetsgivare har nästan alltid öppna tjänster och konkurrensen sker inte om jobben i sig, utan om vilken klinik och vilket schema du får. Ett bra CV avgör om du blir kallad till första intervju på din drömavdelning eller hamnar i en avdelnings-bemanningspool.\n\nVår mall för sjuksköterskor lyfter legitimation från Socialstyrelsen, eventuella specialistutbildningar och vårdtyngd som första visuella element. Kliniska metoder, dokumentationssystem och delegeringar (PVK, EKG-tolkning, A-HLR, ATLS) får eget block i klartext. Det betyder att Heroma och Visma Recruit kan filtrera in dig på exakta termer från jobbannonsen.\n\nKonkret innehåll vi rekommenderar: legitimationsdatum, sjuksköterskeprogrammet med lärosäte och år, eventuella specialistutbildningar (anestesi, akutsjukvård, IVA, distrikt, psykiatri), klinisk erfarenhet uppdelad per avdelning med vårdtyngd (1-2 patienter på IVA, 6-8 på vårdavdelning), kompetenser i dokumentationssystem (Cosmic, TakeCare, Melior, NPÖ), och vidareutbildningar med utgångsdatum.\n\nNedan hittar du två CV-mallar designade för sjuksköterske-rollen, ett färdigt exempel-CV att utgå från, och konkreta tips på vad rekryterare på sjukhus, vårdcentraler och kommunal hemsjukvård letar efter. Ladda ner mallen gratis och anpassa efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'Award',
        title: 'Legitimation och specialistutbildning först',
        description: 'Ange Socialstyrelsens registreringsdatum och eventuell specialistutbildning högst upp. Specialistsjuksköterskor får upp till 30% högre lön och prioriteras i rekrytering, så det är värt att lyfta synligt.',
      },
      {
        icon: 'TrendingUp',
        title: 'Vårdtyngd och patientvolymer i klartext',
        description: 'Skriv hur många patienter du ansvarade för per pass. På IVA är det 1-2, på vårdavdelning 6-8, i hemsjukvården 8-12 besök per dag. Vårdtyngd är hårdvaluta som chefer förstår direkt.',
      },
      {
        icon: 'CheckCircle',
        title: 'Dokumentationssystem du behärskar',
        description: 'Cosmic dominerar i Region Stockholm och Skåne, TakeCare i flera regioner, Melior på vissa kliniker. Skriv ut systemnamnen så ATS kan filtrera fram dig och rekryteraren ser att du kan starta utan introduktion.',
      },
      {
        icon: 'FileText',
        title: 'Kliniska metoder och behandlingar',
        description: 'PVK-sättning, EKG-tolkning, sårvård, smärtskattning enligt VAS, triage enligt RETTS. Var konkret om vilka metoder du behärskar i stället för att skriva "kliniska färdigheter" som inte säger något.',
      },
      {
        icon: 'Briefcase',
        title: 'Vidareutbildningar med utgångsdatum',
        description: 'A-HLR, ATLS, CMP, ALS-certifikat har utgångsdatum. Lista dem så rekryteraren direkt ser om du behöver förnya. Att vara aktiv i Vårdförbundet eller skyddsombud är meriterande för seniora roller.',
      },
      {
        icon: 'Target',
        title: 'Tillgänglighet för rotationsschema',
        description: 'Många avdelningar prioriterar sökande som tar dag, kväll, natt och helg. Skriv tydligt om du är öppen för rotationsschema inklusive natt och helg, eller om du söker fasta dagtider.',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'Legitimation överst i sidopanelen',
        description: 'Vi har gjort Socialstyrelsens registrering till första visuella element så vårdchefer kan bekräfta status på fem sekunder. Specialistutbildningar lyfts i samma block, inte gömda i en utbildningssektion.',
      },
      {
        title: 'Klinisk tjänstgöring per avdelning',
        description: 'Mallen separerar avdelningar (akut, vårdavdelning, IVA, mottagning) så vårdtyngd och patientgrupper syns. Du kan visa bredd utan att olika erfarenheter konkurrerar om samma yta.',
      },
      {
        title: 'Eget block för delegeringar och certifikat',
        description: 'A-HLR, ATLS, CMP, sterilteknik och förskrivningsrätt har egen sektion. Vi har sett att vårdchefer letar specifikt efter aktuella certifikat innan de tittar på erfarenhet.',
      },
      {
        title: 'Premium-mallen lägger till foto',
        description: 'För distrikt, hemsjukvård och primärvård där relationer värderas, lägger premium-varianten till foto och LinkedIn. Det skapar ett mer personligt intryck utan att kompromissa med ATS-läsbarhet.',
      },
      {
        title: 'Sober färgsättning för vårdsektorn',
        description: 'Vården värderar saklighet. Vi har valt dämpade emerald- och navy-toner som signalerar trygghet utan att bli sterila. Inget i mallen drar fokus från meritbilden.',
      },
      {
        title: 'Plats för fackliga och utvecklingsuppdrag',
        description: 'Skyddsombud, Vårdförbundet-aktiv, kvalitetsregister, utvecklingsuppdrag har egen rad. Det visar att du tar ansvar bortom det dagliga vårdarbetet, vilket meriterar för senior- och chefroller.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Klinisk omvårdnad och behandling',
        punkter: [
          'Bedöma patienters tillstånd, prioritera och planera omvårdnadsåtgärder',
          'Genomföra ordinationer från läkare och dokumentera utförande',
          'Sätta PVK, ta EKG, hantera infusioner och smärtbehandling',
          'Akut omhändertagande och triage enligt RETTS eller motsvarande',
        ],
      },
      {
        rubrik: 'Dokumentation och vårdplanering',
        punkter: [
          'Journalföring i Cosmic, TakeCare, Melior eller motsvarande system',
          'Vårdplanering enligt VIPS-modellen eller standardvårdplaner',
          'Skriva remisser, rapporter och avvikelser enligt patientsäkerhetslagen',
          'Delta i utskrivningsplanering med kommun och primärvård',
        ],
      },
      {
        rubrik: 'Patientmöten och anhörigkontakt',
        punkter: [
          'Pedagogiska samtal vid diagnos, behandling och egenvård',
          'Stötta anhöriga vid svår sjukdom och palliativa situationer',
          'Hantera oro, smärta och konflikter med lugn och professionalism',
          'Anpassa kommunikation efter patientens språk och kognitiva förmåga',
        ],
      },
      {
        rubrik: 'Tvärprofessionellt teamarbete',
        punkter: [
          'Rapportera till och samverka med läkare, undersköterskor och paramedicinsk personal',
          'Delta i ronder och vårdteammöten där behandlingsbeslut tas',
          'Handleda undersköterskor och delegera medicinska uppgifter',
          'Samverka med biståndsbedömare och kommunal hälso- och sjukvård',
        ],
      },
      {
        rubrik: 'Utvecklings- och kvalitetsarbete',
        punkter: [
          'Bidra till kvalitetsregister och avvikelseanalys på avdelningen',
          'Mentor för nya kollegor och studenter under VFU',
          'Delta i förbättringsprojekt och kollegial fortbildning',
          'Utveckla rutiner och vårdprogram baserat på evidens',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Lagstiftning och regelverk',
        termer: [
          { term: 'PDL', forklaring: 'Patientdatalagen, reglerar journalföring och hantering av patientuppgifter.' },
          { term: 'HSL', forklaring: 'Hälso- och sjukvårdslagen, ramverk för all sjukvård i Sverige.' },
          { term: 'PSL', forklaring: 'Patientsäkerhetslagen, reglerar anmälningsskyldighet och kvalitetsarbete.' },
          { term: 'SOSFS 2014:5', forklaring: 'Socialstyrelsens föreskrifter om dokumentation i social- och hälsovård.' },
          { term: 'Lex Maria', forklaring: 'Anmälningsskyldighet vid vårdskada eller risk för sådan.' },
          { term: 'Förskrivningsrätt', forklaring: 'Specialistsjuksköterskor inom vissa områden har egen förskrivningsrätt på utvalda läkemedel.' },
        ],
      },
      {
        kategori: 'Specialistutbildningar',
        termer: [
          { term: 'Anestesisjuksköterska', forklaring: 'Specialistutbildning för arbete på operation och postop.' },
          { term: 'IVA-sjuksköterska', forklaring: 'Specialistutbildning för intensivvård, hög vårdtyngd och teknisk utrustning.' },
          { term: 'Akutsjuksköterska', forklaring: 'Specialistutbildning för akutmottagning och primärbedömning.' },
          { term: 'Distriktssköterska', forklaring: 'Specialistutbildning för primärvård, ofta med förskrivningsrätt.' },
          { term: 'Psykiatrisjuksköterska', forklaring: 'Specialistutbildning för psykiatrisk vård och bedömning.' },
          { term: 'Onkologisjuksköterska', forklaring: 'Specialistutbildning för cancervård och cytostatikabehandling.' },
        ],
      },
      {
        kategori: 'Kliniska metoder och certifikat',
        termer: [
          { term: 'A-HLR', forklaring: 'Avancerad hjärt-lungräddning, förnyas vart annat år.' },
          { term: 'D-HLR', forklaring: 'HLR med defibrillator, grundkompetens på flera avdelningar.' },
          { term: 'ATLS', forklaring: 'Advanced Trauma Life Support, certifikat för traumahantering.' },
          { term: 'CMP', forklaring: 'Course in Medical Primary care, vidareutbildning i primärvård.' },
          { term: 'PEWS', forklaring: 'Pediatric Early Warning Score, bedömningsskala för barn.' },
          { term: 'NEWS2', forklaring: 'National Early Warning Score, vuxenbedömning vid försämring.' },
        ],
      },
      {
        kategori: 'Journalsystem och IT',
        termer: [
          { term: 'Cosmic', forklaring: 'Vanligaste journalsystemet i offentlig vård i flera regioner.' },
          { term: 'TakeCare', forklaring: 'Journalsystem som används i bland annat Region Stockholm.' },
          { term: 'Melior', forklaring: 'Äldre journalsystem fortfarande i bruk på vissa kliniker.' },
          { term: 'NCS Cross', forklaring: 'Journalsystem för primärvård i flera regioner.' },
          { term: 'NPÖ', forklaring: 'Nationell patientöversikt över region- och vårdgränser.' },
          { term: 'Procapita', forklaring: 'Verksamhetssystem för kommunal hemsjukvård och äldreomsorg.' },
        ],
      },
    ],

    typiskaArbetsgivare: [
      {
        kategori: 'Region och universitetssjukhus',
        exempel: [
          'Karolinska, Sahlgrenska, Skånes Universitetssjukhus, Akademiska',
          'Region- och länssjukhus i alla 21 regioner',
          'Specialistmottagningar och dagvård',
          'Akutmottagningar och prehospital vård (ambulans)',
        ],
      },
      {
        kategori: 'Primärvård',
        exempel: [
          'Vårdcentraler i regional regi',
          'Privata vårdcentraler (Capio, Praktikertjänst, Doktor.se)',
          'Företagshälsa (Avonova, Feelgood, Previa)',
          'Specialistmottagningar inom kvinnohälsa, hud, ögon',
        ],
      },
      {
        kategori: 'Kommunal vård och omsorg',
        exempel: [
          'Hemsjukvård i 290 kommuner',
          'Särskilda boenden och vård- och omsorgsboenden',
          'LSS-boenden där sjuksköterska behövs',
          'Kommunal akutsjukvård och hospice',
        ],
      },
      {
        kategori: 'Privata och bemanning',
        exempel: [
          'Privata sjukhus (Sophiahemmet, GHP, Capio S:t Görans)',
          'Bemanningsbolag (Dedicare, Nightingale, Empleo)',
          'Hyrtjänster i Norge eller Danmark',
          'Företagshälsovård och försäkringsbolag',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Sjuksköterskeprogrammet (3 år)',
        beskrivning: 'Grundutbildning vid 24 lärosäten i Sverige, kandidatexamen i omvårdnad. Innehåller VFU på sjukhus och primärvård. Examen ger rätt att söka legitimation från Socialstyrelsen.',
      },
      {
        rubrik: 'Specialistutbildning (1-1,5 år)',
        beskrivning: 'Magisterexamen inom specifikt område: anestesi, IVA, akutsjukvård, distrikt, psykiatri, operation, onkologi eller barn. Krav på minst 1 års klinisk erfarenhet före antagning.',
      },
      {
        rubrik: 'Vidareutbildningar och certifikat',
        beskrivning: 'A-HLR, ATLS, CMP, sterilteknik, sårvård, palliativ vård. Förskrivningsrätt för distriktssköterskor inom vissa läkemedelsgrupper. Förnyas vart andra till tredje år.',
      },
      {
        rubrik: 'Forskarutbildning (4-5 år)',
        beskrivning: 'Doktorsexamen i omvårdnad parallellt med klinisk tjänst. Disputerade sjuksköterskor söker ofta universitetstjänster, FoU-roller eller specialistmottagningar med forskningsfokus.',
      },
    ],

    kompetenser: {
      tekniska: [
        'Klinisk bedömning enligt VIPS-modellen',
        'Medicinsk delegering (insulin, PEG, subkutana injektioner)',
        'PVK-sättning, EKG-tolkning och blodprovstagning',
        'Journalsystem (Cosmic, TakeCare, Melior, NCS Cross, NPÖ)',
        'Akut omhändertagande och triage enligt RETTS',
        'Patientsäkerhet och kvalitetsregisterarbete',
        'A-HLR, D-HLR och avancerat omhändertagande',
        'Sårbehandling och PVK-skötsel',
        'Smärtskattning enligt VAS och NRS',
        'Vårdplanering och utskrivningsplanering',
        'Vårdpedagogik mot patient och anhöriga',
        'Mentorskap och delegering till undersköterskor',
      ],
      personliga: [
        'Empatiskt patientbemötande',
        'Stresstålig i akuta situationer',
        'Strukturerad och prioritetsskicklig',
        'Tvärprofessionellt samarbete',
        'Pedagogisk i patient- och anhörigkommunikation',
        'Lyhörd för kulturella och språkliga skillnader',
        'Initiativrik i utvecklingsarbete',
      ],
    },
    profilExempel:
      'Legitimerad sjuksköterska med 6 års klinisk erfarenhet inom internmedicin och akutsjukvård. Hanterar 8-10 patienter per pass med fokus på multisjuka och kardiella tillstånd. Specialistutbildning inom akutsjukvård 2024 och handledare för 4 sjuksköterskestudenter per termin.',

    profilTips:
      'Skriv legitimationsstatus, år av erfarenhet och primärt verksamhetsområde i öppningsraden. Andra meningen kvantifierar vårdtyngd (patienter per pass). Tredje meningen lyfter specialiseringar, handledning eller utvecklingsuppdrag som differentierar dig.',

    rekryterarTipsen: [
      {
        rubrik: 'Vårdtyngd och patientvolymer',
        text: 'Hur många patienter ansvarade du för per pass? På IVA är det 1-2, på vårdavdelning 6-8, i hemsjukvården 8-12 besök per dag. Vårdtyngd är hårdvaluta som chefer förstår direkt.',
      },
      {
        rubrik: 'Specialistutbildning är CV-avgörande',
        text: 'Anestesi, akutsjukvård, intensivvård, distrikt, psykiatri. Specialistsjuksköterskor får upp till 30% högre lön och prioriteras vid rekrytering. Specifik specialitet öppnar specifika tjänster.',
      },
      {
        rubrik: 'Dokumentationssystem och fackliga uppdrag',
        text: 'Cosmic, TakeCare, Melior, NCS Cross. Nämn dokumentationssystem du använt. Fackliga uppdrag (skyddsombud, Vårdförbundet-aktiv) är meriterande för seniora roller.',
      },
      {
        rubrik: 'Aktuella certifikat och utgångsdatum',
        text: 'A-HLR, ATLS, CMP och förskrivningsrätt har utgångsdatum. Lista varje certifikat med datum så rekryteraren ser vad som är aktuellt och du undviker frågor om förnyelse.',
      },
      {
        rubrik: 'Kvalitetsarbete och utvecklingsuppdrag',
        text: 'Avvikelseregister, kvalitetsregister (Riksstroke, SwedeHeart), förbättringsprojekt och vårdprogram-utveckling. För senior- och teamledar-roller väger detta tyngre än bara klinisk erfarenhet.',
      },
      {
        rubrik: 'Pedagogisk meritering',
        text: 'Handledning av studenter och nya kollegor, mentor för introduktion av nyanställda, utbildning på avdelningen. Många chefer söker aktivt sjuksköterskor som kan stötta upp introduktionen av nya kollegor.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'Legitimationsstatus, år av erfarenhet, primärt vårdområde. Eventuella specialistutbildningar och din kärnkompetens på 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Klinik och avdelning, tidsperiod, vårdtyngd per pass. Vidareutbildningar som påverkat din tjänstgöring och eventuella utvecklingsuppdrag.' },
      { sektion: 'Utbildning', tips: 'Sjuksköterskeexamen, lärosäte, år. Specialistutbildningar som egna rader. Vidareutbildningar (CMP, ALS, A-HLR) som certifikat med datum.' },
      { sektion: 'Kompetenser', tips: 'Dokumentationssystem, kliniska metoder och behandlingar i klartext. PVK-sättning, EKG-tolkning, smärtskattning enligt VAS, triage enligt RETTS.' },
      { sektion: 'Vidareutbildning', tips: 'Lista certifikat med utgångsdatum. Inkludera handledarutbildningar och eventuell utbildning till kvalitetsutvecklare eller ledarskap.' },
      { sektion: 'Övrigt', tips: 'Tillgänglighet för rotationsschema (dag, kväll, natt, helg), körkort om relevant, språkkunskaper utöver svenska och engelska.' },
    ],

    checklista: [
      'Sjuksköterskeexamen och legitimation från Socialstyrelsen',
      'Specialistutbildning med år och lärosäte',
      'Klinisk erfarenhet uppdelad per avdelning med vårdtyngd',
      'Dokumentationssystem du behärskar i klartext',
      'A-HLR, ATLS, CMP eller motsvarande certifikat med utgångsdatum',
      'Kliniska metoder du behärskar (PVK, EKG, smärtskattning)',
      'Forskningsmeriter eller utvecklingsuppdrag',
      'Handledarutbildning och pedagogisk meritering',
      'Tillgänglighet för olika scheman (dag, kväll, natt, helg)',
      'Språkkunskaper utöver svenska och engelska',
    ],

    atsInfo:
      'Både vår mall Norrsken och premium-varianten Vården är ATS-säkra. Region- och kommunala arbetsgivare använder oftast Heroma eller Visma Recruit, båda läser standardrubriker som "Arbetslivserfarenhet" och "Utbildning" korrekt. Lista vidareutbildningar med utgångsdatum så filtersystem kan flagga aktiva certifieringar. Skriv ut systemnamnen (Cosmic, TakeCare, Melior) i klartext eftersom rekryterare filtrerar exakta termer.',

    faqItems: [
      {
        q: 'Vad ska finnas med i ett sjuksköterske-CV?',
        a: 'Legitimation från Socialstyrelsen med datum, sjuksköterskeexamen med lärosäte, klinisk erfarenhet uppdelad per avdelning med vårdtyngd, dokumentationssystem (Cosmic, TakeCare, Melior), kliniska metoder (PVK, EKG, smärtskattning), aktuella certifikat (A-HLR, ATLS, CMP) med utgångsdatum, eventuell specialistutbildning, och språkkunskaper. Lägg till handledarmeritering och utvecklingsuppdrag om du söker senior-roller.',
      },
      {
        q: 'Hur skiljer sig CV för sjuksköterska från undersköterska?',
        a: 'Sjuksköterska har akademisk grundutbildning och legitimation som måste anges precist (datum, registreringsnummer). Specialistutbildningar och vetenskapliga uppdrag är CV-relevanta. För undersköterska är medicinska delegeringar centrala. För sjuksköterska är det egen ordinationsrätt, ledarskap i teamet, och självständigt arbete inom evidensbaserad omvårdnad som lyfts.',
      },
      {
        q: 'Ska jag nämna nattjour och övertid?',
        a: 'Ja om du är beredd till det. Många avdelningar prioriterar sökande som tar dag, kväll, natt och helg. Skriv tydligt: "Tillgänglig för rotationsschema inklusive natt och helg" eller "Söker dagtid med möjlighet till sporadisk kvällstjänst". Att vara explicit minskar antalet ansökningar du bedöms olämplig för.',
      },
      {
        q: 'Hur lång ska ett sjuksköterske-CV vara?',
        a: 'Grundutbildade 1-1,5 sidor. Specialistsjuksköterskor med flera års erfarenhet 2 sidor. Forskande eller disputerade sjuksköterskor 2-3 sidor. Vården accepterar längre CV än andra branscher eftersom meritprofiler är centrala. Det viktiga är att första sidan rymmer det starkaste innehållet.',
      },
      {
        q: 'Vilka nyckelord behöver CV:t passera ATS?',
        a: 'Specifika system (Cosmic, TakeCare, Melior, NCS Cross), kliniska metoder (PVK-sättning, EKG-tolkning, sårvård, A-HLR), patientgrupper (multisjuka, palliativ, akut, geriatrik) och certifikat. Nämn legitimation och eventuell specialistutbildning i klartext. Heroma och Visma Recruit söker exakt på dessa termer i jobbannonsens språk.',
      },
      {
        q: 'Hur skriver jag CV som nyutbildad sjuksköterska utan erfarenhet?',
        a: 'Lyft VFU-perioder med klinik, antal veckor och vad du fick göra. Inkludera examensarbete med titel och tidskrift om publicerat. Praktiska kurser (A-HLR, sterilteknik), eventuella tidigare yrken som vårdbiträde eller undersköterska, och språkkunskaper väger tungt. Skriv ut din vilja och förmåga att lära dig snabbt, många kliniker har strukturerade introduktionsprogram för nyexade.',
      },
      {
        q: 'Vilka specialistutbildningar är mest värdefulla för CV:t?',
        a: 'Det beror på vilken bransch du söker. IVA, anestesi och akutsjukvård för slutenvård. Distrikt och förskrivningsrätt för primärvård. Psykiatri för psykiatrisk vård. Onkologi för cancervård. Operation för operationsavdelningar. Specialistutbildningar tar 1-1,5 år och kräver minst 1 års klinisk erfarenhet före antagning. För kommunal hemsjukvård är distriktsutbildning eller äldrevård starkast.',
      },
      {
        q: 'Behöver jag skriva personligt brev till sjuksköterske-tjänster?',
        a: 'För de flesta tjänster ja. Använd brevet för att förklara varför just den klinik och vad du ger till deras team. Beskriv en specifik patientsituation där du visat din kliniska bedömning, eller en kollegial situation där du tagit ansvar utöver det vanliga. Håll till en sida på 300-400 ord. Ett välskrivet brev kan vara avgörande när två kandidater har liknande CV.',
      },
      {
        q: 'Ska jag inkludera referenser direkt på CV:t?',
        a: 'Nej, skriv "Referenser lämnas på begäran". Referenser tar plats du behöver för meriter, och nuvarande arbetsgivare kanske inte vet att du söker. Förbered dig istället på att kunna ge två-tre referenser snabbt vid förfrågan: tidigare chef, klinikens utbildningsansvarig, och en senior kollega.',
      },
      {
        q: 'Vad ska jag inte ha med på mitt sjuksköterske-CV?',
        a: 'Personnummer (bara födelseår), foto i offentlig sektor (riskerar diskriminering), löneförväntningar, irrelevanta arbetslivserfarenheter äldre än 10-15 år, generiska påståenden som "god empatisk förmåga" utan stöd, patientuppgifter eller sekretessbelagda detaljer, och hobbies som inte är relevanta. Stavfel och inkonsekvent formatering diskvalificerar direkt eftersom dokumentationsförmåga är central i rollen.',
      },
    ],
  },

  'underskoterska': {
    seoIntro:
      'Som undersköterska är du ryggraden i svensk vård. Region- och kommunala arbetsgivare har tusentals öppna tjänster varje månad, och konkurrensen sker inte om jobben utan om vilken arbetsplats och vilket schema du får. Ett välskrivet CV avgör om du blir kallad till intervju på den avdelning du vill jobba på, eller hamnar i en bemanningspool för långtidsvikariat.\n\nVår mall för undersköterskor lyfter aktiva medicinska delegeringar, specialiseringar och dokumentationssystem som första visuella element. Vi har strukturerat erfarenhetssektionen så att arbetsplats, tidsperiod och patientvolym syns direkt. Det betyder att enhetschefer i hemtjänsten eller på äldreboendet kan bedöma din kapacitet på fem sekunder.\n\nKonkret innehåll vi rekommenderar: vård- och omsorgsprogrammet eller motsvarande vuxenutbildning, aktiva delegeringar (insulin, PEG, subkutana injektioner, blodtrycksmätning) med datum, klinisk erfarenhet uppdelad per arbetsplats, dokumentationssystem (Cosmic, Procapita, Pascal, NPÖ), specialiseringar (demens-BPSD, palliativ, geriatrik), och certifikat (HLR, Akta Ryggen, basala hygienrutiner) med utgångsdatum.\n\nNedan hittar du två CV-mallar designade för undersköterskerollen, ett färdigt CV-exempel att utgå från, och konkreta tips på vad enhetschefer i kommunal hemtjänst, äldreomsorg och slutenvård faktiskt letar efter. Ladda ner mallen gratis och anpassa den efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'Award',
        title: 'Aktiva delegeringar i klartext',
        description: 'Insulin, PEG-sondmatning, subkutana injektioner, blodtrycksmätning, sårvård. Varje delegering öppnar specifika tjänster. Lista vilka du har aktiva och när de senast förnyades så enhetschefen kan matcha dig direkt.',
      },
      {
        icon: 'TrendingUp',
        title: 'Patientvolymer och arbetsplatser',
        description: 'Skriv hur många brukare du ansvarat för per pass. I hemtjänst kan det vara 8-12 besök per dag, på äldreboende 8-15 boende, på sjukhusavdelning 6-8. Volymerna visar din erfarenhet bättre än antal år ensamt.',
      },
      {
        icon: 'CheckCircle',
        title: 'Specialiseringar lyfter ditt värde',
        description: 'Demensvård och BPSD-hantering, palliativ vård, geriatrik, psykiatri, eller arbete med personer med funktionsvariationer. Varje specialisering öppnar olika tjänster och påverkar lönen direkt.',
      },
      {
        icon: 'FileText',
        title: 'Dokumentationssystem du behärskar',
        description: 'Cosmic används i regional slutenvård. Procapita dominerar i kommunal äldreomsorg. Pascal är förskrivningsmodul. NPÖ är gemensam patientöversikt. Skriv ut systemnamnen så Heroma och Visma Recruit kan filtrera fram dig.',
      },
      {
        icon: 'Target',
        title: 'Certifikat med utgångsdatum',
        description: 'HLR förnyas vart annat år. Akta Ryggen och basala hygienrutiner förnyas regelbundet. Lista varje certifikat med utfärdande datum så enhetschefen direkt ser vad som är aktuellt.',
      },
      {
        icon: 'Briefcase',
        title: 'Tillgänglighet för olika scheman',
        description: 'Hemtjänst kräver ofta körkort och bil. Äldreboenden har rotationsschema med kvällar och helger. Sjukvård kräver oftast nattjour. Var explicit om vilket schema du söker så minskar antalet ansökningar du bedöms olämplig för.',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'Delegeringar lyfts överst i sidopanelen',
        description: 'Vi har gjort medicinska delegeringar till första visuella element så enhetschefer kan bekräfta dem direkt. Insulin, PEG och subkutana är de tyngsta och de syns utan att man behöver scrolla.',
      },
      {
        title: 'Klinisk erfarenhet per arbetsplats',
        description: 'Mallen separerar arbetsplatser (hemtjänst, äldreboende, sjukhus, LSS) så patientgrupper och vårdtyngd syns. Du kan visa bredd utan att olika erfarenheter konkurrerar om samma yta.',
      },
      {
        title: 'Eget block för certifikat',
        description: 'HLR, Akta Ryggen, basala hygienrutiner, BPSD och nutrition har egen sektion med utgångsdatum. Vi har sett att enhetschefer letar specifikt efter aktuella certifikat innan de tittar på erfarenhet.',
      },
      {
        title: 'Premium-mallen lägger till foto',
        description: 'För hemtjänst och kundnära roller där relationer värderas, lägger premium-varianten till foto och språkkunskaper i sidopanelen. Det skapar ett mer personligt intryck utan att kompromissa med ATS-läsbarhet.',
      },
      {
        title: 'Sober färgsättning för vårdsektorn',
        description: 'Vården värderar saklighet. Vi har valt dämpade emerald- och navy-toner som signalerar trygghet. Inget i mallen drar fokus från meritbilden eller signalerar oprofessionellt.',
      },
      {
        title: 'Plats för språkkunskaper i sidopanelen',
        description: 'I Sverige möter du patienter med olika språkbakgrund. Mallen har dedikerat språkblock i sidopanelen där arabiska, persiska, somaliska, tigrinja och andra efterfrågade språk syns direkt för rekryterare.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Personcentrerad omvårdnad och ADL',
        punkter: [
          'Hjälp med daglig livsföring: hygien, måltider, påklädning, förflyttning',
          'Stötta patienter och brukare i att bibehålla självständighet och värdighet',
          'Identifiera förändrade behov och rapportera till sjuksköterska eller chef',
          'Anpassa omvårdnadsåtgärder efter individens kognitiva förmåga och kultur',
        ],
      },
      {
        rubrik: 'Medicinska delegeringar och behandling',
        punkter: [
          'Ge insulin, ögondroppar och subkutana injektioner enligt delegering',
          'Hantera PEG-sondmatning, sårvård, kompressionsbehandling och katetervård',
          'Mäta blodtryck, blodsocker, puls och temperatur enligt ordination',
          'Rapportera avvikelser och delta i avvikelsehantering enligt Lex Sarah',
        ],
      },
      {
        rubrik: 'Dokumentation och rapportering',
        punkter: [
          'Dokumentera omvårdnadsåtgärder i Cosmic, Procapita eller motsvarande',
          'Skriva genomförandeplaner med fokus på personcentrerade mål',
          'Rapportera muntligt och skriftligt vid skiftbyten',
          'Hantera sekretess och integritetsfrågor enligt OSL och patientdatalagen',
        ],
      },
      {
        rubrik: 'Demens- och BPSD-hantering',
        punkter: [
          'Tillämpa personcentrerat förhållningssätt vid demenssjukdom',
          'Hantera BPSD-symtom (oro, vandring, aggressivitet) med icke-farmakologiska metoder',
          'Använda bemötandeplaner och struktur i vardagen för trygghet',
          'Stödja anhöriga med information och stöttning vid svåra situationer',
        ],
      },
      {
        rubrik: 'Palliativ och slutskedesvård',
        punkter: [
          'Genomföra palliativ omvårdnad enligt nationella riktlinjer',
          'Stötta patient och anhöriga vid livets slutskede med närvaro och respekt',
          'Hantera smärtskattning, munvård och hudvård i livets slut',
          'Delta i brytpunktssamtal och vårdplaneringsmöten',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Lagstiftning och regelverk',
        termer: [
          { term: 'HSL', forklaring: 'Hälso- och sjukvårdslagen, ramverk för all sjukvård i Sverige.' },
          { term: 'SoL', forklaring: 'Socialtjänstlagen, gäller kommunal omsorg och hemtjänst.' },
          { term: 'PDL', forklaring: 'Patientdatalagen, reglerar journalföring och dokumentation.' },
          { term: 'OSL', forklaring: 'Offentlighets- och sekretesslagen, gäller all offentlig vård.' },
          { term: 'Lex Sarah', forklaring: 'Anmälningsskyldighet vid missförhållanden i socialtjänst eller LSS.' },
          { term: 'Lex Maria', forklaring: 'Anmälningsskyldighet vid vårdskador inom hälso- och sjukvård.' },
        ],
      },
      {
        kategori: 'Delegeringar och certifikat',
        termer: [
          { term: 'Insulindelegering', forklaring: 'Rätt att administrera insulin enligt sjuksköterskas ordination.' },
          { term: 'PEG-delegering', forklaring: 'Rätt att hantera PEG-sondmatning och vätsketillförsel.' },
          { term: 'Subkutan delegering', forklaring: 'Rätt att ge subkutana injektioner (smärtlindring, blodförtunnande).' },
          { term: 'Akta Ryggen', forklaring: 'Certifierad förflyttningsteknik för att skydda din rygg och brukarens säkerhet.' },
          { term: 'HLR-certifikat', forklaring: 'Hjärt-lungräddning, förnyas vart annat år och krävs på de flesta arbetsplatser.' },
          { term: 'Basala hygienrutiner', forklaring: 'Grundkrav på alla vårdarbetsplatser, certifikat förnyas regelbundet.' },
        ],
      },
      {
        kategori: 'Specialiseringar och vårdmetoder',
        termer: [
          { term: 'BPSD', forklaring: 'Beteendemässiga och Psykiska Symtom vid Demens, eget metodområde.' },
          { term: 'Personcentrerad vård', forklaring: 'Brukaren i centrum med fokus på individens behov och självbestämmande.' },
          { term: 'IBIC', forklaring: 'Individens Behov i Centrum, behovsbedömningsmodell i kommunal vård.' },
          { term: 'Palliativ vård', forklaring: 'Lindrande vård i livets slutskede med fokus på livskvalitet.' },
          { term: 'Sårvård', forklaring: 'Bedömning, omläggning och uppföljning av sår enligt evidensbaserade metoder.' },
          { term: 'Geriatrik', forklaring: 'Specialitet inom äldre och åldrandets sjukdomar.' },
        ],
      },
      {
        kategori: 'Dokumentation och IT',
        termer: [
          { term: 'Cosmic', forklaring: 'Vanligaste journalsystemet i regional slutenvård.' },
          { term: 'Procapita', forklaring: 'Verksamhetssystem som dominerar kommunal äldreomsorg och hemtjänst.' },
          { term: 'Lifecare', forklaring: 'Verksamhetssystem för omsorgsplanering i flera kommuner.' },
          { term: 'Pascal', forklaring: 'Förskrivningsmodul för läkemedel kopplad till Socialstyrelsens register.' },
          { term: 'NPÖ', forklaring: 'Nationell patientöversikt över region- och vårdgränser.' },
          { term: 'Genomförandeplan', forklaring: 'Dokument som beskriver hur en brukares behov ska tillgodoses.' },
        ],
      },
    ],

    typiskaArbetsgivare: [
      {
        kategori: 'Kommunal vård och omsorg',
        exempel: [
          'Hemtjänst i 290 kommuner runt om i Sverige',
          'Vård- och omsorgsboenden för äldre',
          'LSS-boenden för personer med funktionsvariationer',
          'Korttidsboenden och dagverksamhet',
        ],
      },
      {
        kategori: 'Region och slutenvård',
        exempel: [
          'Sjukhus och vårdavdelningar',
          'Akutmottagningar och prehospital vård',
          'Specialistmottagningar och dagvård',
          'Geriatriska kliniker och rehabilitering',
        ],
      },
      {
        kategori: 'Privat vård och bemanning',
        exempel: [
          'Privata äldreboenden (Attendo, Vardaga, Humana)',
          'Privata vårdcentraler och hemtjänstutförare',
          'Bemanningsbolag (Dedicare, Empleo)',
          'Personlig assistans (Frösunda, Nytida)',
        ],
      },
      {
        kategori: 'Övriga arbetsgivare',
        exempel: [
          'Företagshälsa och försäkringsbolag',
          'Skolor och förskolor med särskilda behov',
          'Habilitering och rehabilitering',
          'Hospice och palliativa enheter',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Vård- och omsorgsprogrammet (3 år)',
        beskrivning: 'Gymnasieutbildning med inriktning omvårdnad, akutsjukvård, hälso- och sjukvård eller funktionsnedsättning. Innehåller praktikperioder hos olika arbetsgivare. Examen ger skyddad yrkestitel undersköterska från 1 juli 2023.',
      },
      {
        rubrik: 'Vuxenutbildning Komvux (1-2 år)',
        beskrivning: 'Komvux erbjuder vård- och omsorgsutbildning med samma kurser som gymnasieprogrammet, anpassad för vuxna. Vanlig väg för yrkesväxlare och nyanlända med utländsk vårdutbildning.',
      },
      {
        rubrik: 'Yrkeshögskola (1-2 år)',
        beskrivning: 'YH-utbildningar som specialistundersköterska inom demens, psykiatri, palliativ vård eller akutsjukvård. Ger fördjupning utöver grundutbildningen och högre lön.',
      },
      {
        rubrik: 'Validering av utländsk utbildning',
        beskrivning: 'Har du utländsk vårdutbildning kan du validera den genom Socialstyrelsen och eventuellt komplettera med svenska och fackspråk. Många kommuner erbjuder anpassade introduktionsprogram för validerade kandidater.',
      },
    ],

    kompetenser: {
      tekniska: [
        'ADL-stöd och personcentrerad omvårdnad',
        'Medicinsk delegering: insulin, PEG, subkutana injektioner',
        'Demensvård och BPSD-hantering enligt nationella riktlinjer',
        'Dokumentation i Cosmic, Procapita, Lifecare och Pascal',
        'Akta Ryggen-certifierad förflyttningsteknik',
        'Basala hygienrutiner och vårdhygien',
        'Sårvård, kompressionsbehandling och katetervård',
        'Palliativ omvårdnad och munvård i livets slut',
        'Smärtskattning enligt VAS och Abbey Pain Scale',
        'Genomförandeplaner enligt IBIC',
        'A-HLR och D-HLR med aktuellt certifikat',
        'Nutritionsbedömning och kosthållning',
      ],
      personliga: [
        'Empati och relationsskapande',
        'Stresstålig i akuta situationer',
        'Tvärprofessionellt samarbete',
        'Lyhördhet och kulturell kompetens',
        'Initiativförmåga och problemlösning',
        'Pedagogisk i mötet med oroliga anhöriga',
        'Etisk medvetenhet vid svåra avvägningar',
      ],
    },

    profilExempel:
      'Erfaren undersköterska med 5+ års erfarenhet av personcentrerad vård inom geriatrik och hemtjänst. Gedigen kompetens i ADL-stöd, demensvård och medicinsk delegering (insulin, PEG, subkutana). Stresstålig lagspelare som skapar trygghet för patienter genom empati, kommunikation och evidensbaserad omvårdnad.',

    profilTips:
      'Antal år, primärt verksamhetsområde och din kärnkompetens i öppningsraden. Andra meningen specificerar dina aktiva delegeringar och specialiseringar. Tredje meningen lyfter värderingar och arbetssätt som differentierar dig.',

    rekryterarTipsen: [
      {
        rubrik: 'Aktiva medicinska delegeringar är avgörande',
        text: 'Insulin, PEG-sondmatning, subkutana injektioner, blodtrycksmätning, sårvård. Lista varje aktiv delegering eftersom det avgör vilka tjänster du kan söka och vilken lön du kan förhandla.',
      },
      {
        rubrik: 'Specialiseringar gör skillnad',
        text: 'Demensvård (BPSD), palliativ vård, geriatrik, hemtjänst, psykiatri. Varje specialisering öppnar olika tjänster. Lyft den du har mest erfarenhet av i din titel och sammanfattning.',
      },
      {
        rubrik: 'Dokumentationssystem du behärskar',
        text: 'Cosmic, Procapita, Lifecare, Pascal, NPÖ. Nämn de system du arbetat med så Heroma och Visma Recruit kan filtrera fram dig. Olika kommuner använder olika system.',
      },
      {
        rubrik: 'Kvantifiera din arbetsbelastning',
        text: 'Antal brukare per pass, antal hembesök per dag, vilka diagnosgrupper du jobbat med. Konkreta siffror skiljer ett starkt CV från ett genomsnittligt och visar enhetschefen din kapacitet.',
      },
      {
        rubrik: 'Språkkunskaper är värdefulla',
        text: 'Arabiska, persiska, somaliska, tigrinja, finska, polska. Språkkunskap öppnar tjänster där brukargruppen inte talar svenska som modersmål. Lägg dem synligt i sidopanelen.',
      },
      {
        rubrik: 'Vidareutbildning visar engagemang',
        text: 'BPSD-utbildning, sårvårdskurs, palliativ vård, validerad nutritionsbedömning. Kontinuerlig fortbildning signalerar att du tar ansvar för din yrkesutveckling och är meriterande för specialist-tjänster.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'År av erfarenhet, primärt vårdområde, dina aktiva delegeringar och specialiseringar på 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Arbetsplats med tidsperiod och patientantal per dag. Konkreta åtgärder och resultat. Använd siffror där det går (15% minskade fall, 20+ brukare).' },
      { sektion: 'Utbildning', tips: 'Vård- och omsorgsprogrammet eller motsvarande vuxenutbildning med år. Eventuella YH-utbildningar och valideringar.' },
      { sektion: 'Kompetenser', tips: 'Dokumentationssystem, behandlingar, certifikat. Var specifik om vilka delegeringar du har aktiva och när de senast förnyades.' },
      { sektion: 'Vidareutbildning', tips: 'BPSD, sårvård, palliativ vård, nutrition. Aktuella kurser med datum och eventuella certifieringar.' },
      { sektion: 'Övrigt', tips: 'Körkort B (ofta krav i hemtjänst), tillgänglighet för rotationsschema, språkkunskaper utöver svenska.' },
    ],

    checklista: [
      'Vård- och omsorgsutbildning från gymnasium eller vuxenutbildning',
      'Aktiva medicinska delegeringar (specifika: insulin, PEG, etc)',
      'HLR-certifiering med utgångsdatum',
      'Akta Ryggen eller motsvarande förflyttningsteknik',
      'Basala hygienrutiner',
      'Erfarenhet av specifika dokumentationssystem',
      'Specialiseringar: demens, palliativ, geriatrik, hemtjänst',
      'Patientvolymer per arbetsplats i klartext',
      'Språkkunskaper utöver svenska',
      'Körkort B om du söker hemtjänst',
    ],

    atsInfo:
      'Både vår mall Norrsken och premium-varianten Vården är ATS-säkra. Kommunala arbetsgivare använder oftast Visma Recruit och Heroma. Skriv utbildning och delegeringar som listor med tydliga radbrytningar så systemet kan parsa varje punkt. Inkludera systemnamnen (Cosmic, Procapita) i klartext eftersom rekryterare filtrerar exakta termer.',

    faqItems: [
      {
        q: 'Vad ska finnas med i ett undersköterska-CV?',
        a: 'Vård- och omsorgsutbildning eller motsvarande, aktiva medicinska delegeringar (insulin, PEG, subkutana), klinisk erfarenhet med arbetsplats och patientvolymer, dokumentationssystem (Cosmic, Procapita), certifikat (HLR, Akta Ryggen, basala hygienrutiner) med utgångsdatum, specialiseringar (demens, palliativ, geriatrik), och språkkunskaper. Lägg till körkort B om du söker hemtjänst.',
      },
      {
        q: 'Hur skriver jag CV som undersköterska utan tidigare erfarenhet?',
        a: 'Lyft praktikperioder från vård- och omsorgsprogrammet med arbetsplats, antal veckor och vad du fick göra. Om du har tidigare arbete inom service, omsorg eller stöd, koppla det till vårdrollen genom mjuka kompetenser. Praktiska kurser (HLR, hygien, BPSD) väger tungt. Skriv ut din vilja och förmåga att lära dig och vara öppen för rotation.',
      },
      {
        q: 'Vilka delegeringar är viktigast att lyfta på CV:t?',
        a: 'Insulin är den vanligaste och mest efterfrågade. PEG-sondmatning öppnar tjänster på äldreboenden och hemtjänst för komplicerade brukare. Subkutana injektioner krävs för smärtbehandling i palliativ vård. Lista alla aktiva delegeringar med datum eftersom enhetschefer matchar varje tjänst mot specifika krav.',
      },
      {
        q: 'Hur lång ska ett undersköterska-CV vara?',
        a: 'En sida räcker för de flesta. Om du har 10+ års erfarenhet, flera specialiseringar och vidareutbildningar kan det bli 1,5 sidor. Det viktigaste är att din utbildning, dina delegeringar och din senaste arbetsplats syns på första sidan utan att man behöver scrolla.',
      },
      {
        q: 'Ska jag ha med foto på undersköterska-CV?',
        a: 'Inte obligatoriskt men vanligt i Sverige inom vården. Vår premium-mall Vården har stöd för foto i sidopanelen. Använd ett professionellt bröstbild om du har en. ATS-system läser ditt CV ändå eftersom mallen är ATS-säker.',
      },
      {
        q: 'Hur lyfter jag mina språkkunskaper på CV:t?',
        a: 'Språk är värdefullt i vården eftersom du möter patienter med olika bakgrund. Lista dem i sidopanelen med nivå (modersmål, flytande, konversation). Arabiska, persiska, somaliska, tigrinja, finska och polska är efterfrågade i många regioner och kommuner.',
      },
      {
        q: 'Vilka nyckelord ska CV:t ha för att passera ATS?',
        a: 'Specifika delegeringar (insulin, PEG, subkutan), system (Cosmic, Procapita, Lifecare, Pascal), specialiseringar (BPSD, palliativ, geriatrik) och certifikat (HLR, Akta Ryggen). Skriv ut termerna i klartext eftersom Heroma och Visma Recruit söker på exakta matchningar mot jobbannonsens språk.',
      },
      {
        q: 'Behöver jag personligt brev till undersköterska-tjänster?',
        a: 'Ja, för de flesta tjänster i Sverige. Använd brevet för att förklara varför just den arbetsplats och beskriv en specifik situation där du visat din omvårdnadskompetens eller din relation till en brukare. Håll till en sida på 300-400 ord. Ett välskrivet brev kan vara avgörande när två kandidater har liknande CV.',
      },
      {
        q: 'Vilka certifikat och vidareutbildningar är värda att skaffa?',
        a: 'BPSD-utbildning för demensvård är högt värderad. Sårvårdskurs öppnar tjänster där sårvård är central. Palliativ vård-kurs efterfrågas i hospice och äldreboenden. Validering till specialistundersköterska genom YH-utbildning ger högre lön och fler valmöjligheter. HLR och Akta Ryggen är grundkrav på de flesta arbetsplatser.',
      },
      {
        q: 'Vad ska jag inte ha med på mitt undersköterska-CV?',
        a: 'Personnummer (bara födelseår), löneförväntningar, irrelevanta arbetslivserfarenheter äldre än 10-15 år, generiska påståenden ("god empatisk förmåga") utan stöd, brukar-uppgifter eller sekretessbelagda detaljer, och hobbies som inte är relevanta. Stavfel diskvalificerar direkt eftersom dokumentationsförmåga är central i rollen.',
      },
    ],
  },

  // ============================================================================
  // SERVICE - säljare/butik (samlad mall för flera yrken med samma DNA)
  // ============================================================================
  'saljare': {
    kompetenser: {
      tekniska: [
        'CRM-system (Salesforce, HubSpot, Pipedrive, Lime)',
        'Säljmetodiker (MEDDIC, BANT, SPIN, Challenger)',
        'Pipeline-hantering och forecasting',
        'Affärsstrategi och kundsegmentering',
        'Avtals- och förhandlingsteknik',
        'Säljanalys och rapportering',
        'Account-baserad försäljning (ABM)',
        'Säljstack (Apollo, Outreach, Gong, ZoomInfo)',
      ],
      personliga: [
        'Resultatdriven och målmedveten',
        'Övertygande och relationsskapande',
        'Lyhörd för kundbehov',
        'Strukturerad i pipeline-arbete',
        'Driven utan att vara påflugen',
      ],
    },
    profilExempel: 'Senior B2B-säljare med 8 års erfarenhet inom SaaS och teknisk försäljning. Ökade ARR från 8M till 9.9M (+24%) under 18 månader genom strategisk upselling till 12 nyckelkunder. Arbetar metodiskt enligt MEDDIC och stänger affärer med snittstorlek 450K SEK.',
    profilTips: 'Säljroll och år. Specifik bransch (SaaS, fintech, industri). Konkret resultat med procent eller absoluta tal. Säljmetodik du arbetar efter.',
    rekryterarTipsen: [
      {
        rubrik: 'Säljsiffror är allt — kvantifiera allt',
        text: 'Skriv inte "ansvarig för försäljning till storkunder". Skriv "ökade ARR 24% (från 8M till 9.9M) under 18 mån genom upselling till 12 nyckelkunder". Säljchefer slänger CV:n utan siffror.',
      },
      {
        rubrik: 'Säljmetoder du behärskar',
        text: 'MEDDIC, BANT, Challenger Sale, SPIN. Nämn metoder du arbetat efter. Det är ATS-keywords som SaaS- och B2B-företag filtrerar på.',
      },
      {
        rubrik: 'CRM-system och säljstack',
        text: 'Salesforce, HubSpot, Pipedrive, Lime. Vilka system har du jobbat i? Säljstacken (Apollo, Outreach, Gong, ZoomInfo) är meriterande för moderna B2B-roller.',
      },
    ],
    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'År av erfarenhet, primärt segment (B2B/B2C, bransch), kärnresultat och metodik.' },
      { sektion: 'Erfarenhet', tips: 'Företag + roll + tidsperiod + budgetomfattning + måluppfyllelse. Skriv "130% av mål 2 år i rad" istället för "uppfyllde säljmål".' },
      { sektion: 'Utbildning', tips: 'Akademisk bakgrund + säljutbildningar + certifieringar (SwedSec, MEDDIC-cert).' },
      { sektion: 'Kompetenser', tips: 'CRM-system, säljmetoder, vertikaler du sålt till. Var specifik om dealsstorlekar och cykler.' },
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
    atsInfo: 'Ja, både Norrsken och Aurora-mallen är ATS-säkra. Aurora har en "Nyckelresultat"-panel där dina kvantifierade siffror lyfts visuellt. Säljbolag använder ofta moderna ATS som Teamtailor, Workday eller Manatal — alla läser Aurora korrekt.',
    faqItems: [
      {
        q: 'Vilka siffror är viktigast på ett säljar-CV?',
        a: 'Tre kärnsiffror. Total budget du ansvarat för. Måluppfyllelse i procent. Tillväxt i absoluta tal (ARR, omsättning, antal kunder). En säljare som visar "ökade ARR med 24%" får intervju över en som skriver "drev tillväxt".',
      },
      {
        q: 'Ska jag nämna provisioner eller bonusar?',
        a: 'Inte själva provisionsbeloppet, men gärna måluppfyllelse i procent som triggade bonus ("130% av mål 2 år i rad"). Det visar att du levererar konsekvent.',
      },
      {
        q: 'Hur långt CV ska en säljare ha?',
        a: 'Junior säljare 0-5 år: 1 sida. Erfaren B2B/key account: 1.5-2 sidor. Säljchef eller CSO: 2 sidor. Säljchefer skannar fort så håll varje rad relevant.',
      },
    ],
  },

  'butiksbitrade': {
    kompetenser: {
      tekniska: [
        'Kassasystem (Sitoo, Iiko, NCR, Bizpoint)',
        'Varuplockning och påfyllning',
        'Inventering och cykelräkning',
        'Returhantering och kvittogivning',
        'Visuell merchandising',
        'Försäljningsstatistik och KPI:er',
      ],
      personliga: [
        'Servicemedveten och kundorienterad',
        'Snabbtänkt under press',
        'Ärlig och pålitlig kring kontanthantering',
        'Lagspelare i butiksmiljö',
        'Flexibel kring kvällar och helger',
      ],
    },
    profilExempel: 'Erfaren butiksmedarbetare med 3 års erfarenhet från klädbutik och dagligvaruhandel. Hanterar kassa-, retur- och inventeringsprocesser i Sitoo och NCR med hög precision. Topp-3-säljare på avdelningen 2024 med 8% högre snittnota än kollegor genom aktivt merförsäljningsarbete.',
    profilTips: 'År av erfarenhet och bransch. Vilka system du behärskar. Konkret resultat eller säljprestation som differentierar dig.',
    rekryterarTipsen: [
      {
        rubrik: 'Kassaerfarenhet är CV-kritiskt',
        text: 'Vilka kassasystem har du arbetat med? Sitoo, Iiko, NCR, Bizpoint. Nämn dem konkret. Många butiker använder samma system och söker efter exakt erfarenhet.',
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
    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'År av erfarenhet, branscher du arbetat i, primära system och din särprägel.' },
      { sektion: 'Erfarenhet', tips: 'Butik + bransch + tidsperiod + kärnuppgifter. Konkretisera med kassasystem och försäljningsresultat.' },
      { sektion: 'Utbildning', tips: 'Gymnasium + eventuella säljutbildningar (interna kedjeutbildningar räknas).' },
      { sektion: 'Kompetenser', tips: 'Kassasystem, varugrupper du har erfarenhet av, språk för internationell kundkrets.' },
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
    atsInfo: 'Ja, Sidopanel-mallen är ATS-säker. Större kedjor som ICA, Coop, Hemköp använder Teamtailor eller egna ATS. Kassasystem som "Sitoo" eller "NCR" är typiska sökord rekryterare filtrerar på, så använd exakta produktnamn istället för "kassasystem".',
    faqItems: [
      {
        q: 'Behövs erfarenhet för butiksbiträde-jobb?',
        a: 'Inte alltid. Många butiker rekryterar utan erfarenhet om du visar serviceanda och flexibilitet. Däremot väger relevant erfarenhet (även café, restaurang, kundtjänst) tungt eftersom det visar att du kan hantera kundkontakt.',
      },
      {
        q: 'Vad ska sammanfattningen på CV:t handla om?',
        a: 'Tre saker. Hur länge du jobbat i service, vilka system du behärskar, och vad som driver dig (kundbemötande, säljmål, lagarbete). Håll det till 3-4 meningar — rekryterare läser det först.',
      },
      {
        q: 'Hur viktigt är språk för butiksjobb?',
        a: 'Mycket viktigt om butiken ligger i centralt läge eller turistområde. Engelska är standard, men arabiska, persiska, polska eller spanska kan vara avgörande beroende på kundkrets.',
      },
    ],
  },

  // ============================================================================
  // SERVICE - lager/logistik
  // ============================================================================
  'lagerarbetare': {
    kompetenser: {
      tekniska: [
        'Truckkort A1-A4 och B1-B5',
        'WMS-system (SAP WMS, Manhattan, Pyramid, Astro)',
        'Plock med pick-by-voice eller pick-by-light',
        'Cykelräkning och inventering',
        'ADR-bevis (för farligt gods)',
        'Pallhantering och paketering',
        'Säkerhetsutbildning enligt TYA',
      ],
      personliga: [
        'Fysiskt uthållig',
        'Strukturerad i höga tempon',
        'Säkerhetsmedveten',
        'Lagspelare på golvet',
        'Flexibel kring skift',
      ],
    },
    profilExempel: 'Erfaren lagerarbetare med 4 års erfarenhet från lager och terminal med truckkort A1-A4 och B1-B3. Plockhastighet 180 rader/timme i SAP WMS med 99.7% korrekt plock. ADR-bevis för farligt gods och utbildad i Akta Ryggen för säker hantering.',
    profilTips: 'Antal år, branscher (e-handel, industri, terminal), specifika behörigheter och plockhastighet eller felfri-procent som differentierar dig.',
    rekryterarTipsen: [
      {
        rubrik: 'Truck-behörigheter avgör vilka jobb du kan söka',
        text: 'Lista exakt vilka truckar du har behörighet på (A1, A2, A3, B1, B2, B3, B4, C, D, E). Många annonser kräver specifika behörigheter — utan rätt papper sorteras du bort omedelbart.',
      },
      {
        rubrik: 'WMS-system och plockerfarenhet',
        text: 'Vilka lagersystem har du arbetat i? SAP WMS, Pyramid, Manhattan, Astro. Plockhastighet (rader/timme) och feltal är CV-relevanta för lager med pick-by-voice eller pick-by-light.',
      },
      {
        rubrik: 'ADR-bevis och säkerhetsutbildning',
        text: 'För lager som hanterar farligt gods (kemikalier, batterier, tryckkärl) är ADR ett krav. Brand- och säkerhetsutbildningar är meriterande för chefroller eller större lagerterminalsanläggningar.',
      },
    ],
    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'År av erfarenhet, brancher du arbetat i, dina behörigheter och prestationssiffror.' },
      { sektion: 'Erfarenhet', tips: 'Företag + lager + tidsperiod. Kärnuppgifter med WMS-system, plockmetod och volym (rader/timme).' },
      { sektion: 'Utbildning', tips: 'Gymnasium + truckutbildning (TYA, Lager- och Terminal). Datum för truckkort.' },
      { sektion: 'Kompetenser', tips: 'Truckkort med utgångsdatum, WMS-system, säkerhetsbevis. Skiftarbete-tillgänglighet.' },
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
    atsInfo: 'Ja, både Hantverkare (gratis) och Konsulten-mallen (premium) är ATS-säkra. Logistikföretag som DB Schenker, PostNord och DHL använder oftast SAP SuccessFactors eller Workday. Truckbehörigheter ska skrivas exakt som "A1, A2, A3, B1" — det är typiska sökord rekryterare filtrerar på.',
    faqItems: [
      {
        q: 'Vilka truck-behörigheter ska jag nämna på CV:t?',
        a: 'Alla aktiva. Skriv typ (A1-A4, B1-B5, C, D, E) och utgångsdatum. För nybörjare lista även vilken utbildning du gått (TYA, Lager- och Terminal, Industrirådets utbildning). Lagerchefer söker ofta efter specifika typer.',
      },
      {
        q: 'Hur viktigt är arbetstider på lager-CV?',
        a: 'Mycket. Många lager kör 3-skift, kvällar eller helger. Ange tydligt: "Tillgänglig för 2-skift och helgarbete". Det sorterar dig in i en kortare urvalslista.',
      },
      {
        q: 'Räcker erfarenhet eller behövs utbildning?',
        a: 'Truck och ADR kräver formell utbildning — inget alternativ. Men för plock, pack och inventering vinner erfarenhet över utbildning. Specifika WMS-system och plockmetoder är mer värda än "lagerlogistik 50 hp".',
      },
    ],
  },

  // ============================================================================
  // UTBILDNING
  // ============================================================================
  'larare': {
    seoIntro:
      'Som lärare bedöms du på lärarlegitimation, ämnesbehörigheter och din pedagogiska skicklighet i klassrummet. Sveriges 290 kommuner och tusentals fristående skolor söker hela tiden behöriga lärare, och konkurrensen sker oftast om vilken skola och vilka kollegor du får. Ett välskrivet CV avgör om du blir kallad till intervju på din drömskola eller hamnar långt ner i högen.\n\nVår mall för lärare lyfter lärarlegitimation från Skolverket, ämnesbehörigheter och åldersgrupper som första visuella element. Vi har strukturerat erfarenhetssektionen så att skola, huvudman och årskurs syns direkt med konkreta uppdrag som mentorskap eller ämneslagsledare. Det betyder att rektorer kan bedöma din behörighetsmatchning på fem sekunder.\n\nKonkret innehåll vi rekommenderar: lärarexamen med lärosäte och ämnesinriktning, lärarlegitimation från Skolverket med exakta behörigheter (åldersgrupp + ämnen), klinisk erfarenhet uppdelad per skola och årskurs, klassrumsledning och elevresultat med konkreta siffror, pedagogiska metoder du behärskar (Bornholm, Singapore-matematik, formativ bedömning), IKT-verktyg (Google Classroom, Teams, Schoolsoft), och specialiseringar för elever med särskilda behov.\n\nNedan hittar du två CV-mallar designade för lärarrollen, ett färdigt exempel-CV att utgå från, och konkreta tips på vad rektorer i kommunal och fristående grundskola, gymnasium och vuxenutbildning faktiskt letar efter. Ladda ner mallen gratis och anpassa efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'Award',
        title: 'Lärarlegitimation och exakta behörigheter',
        description: 'Skriv åldersgrupp och ämnen exakt som de står på din legitimation. "Behörig åk 4-6 i svenska, matematik och NO" är tydligare än bara "Lärarlegitimation". Behörighetsmatchningen avgör om du ens kan söka tjänsten.',
      },
      {
        icon: 'TrendingUp',
        title: 'Klassrumsledning med konkreta resultat',
        description: 'Rektorer värderar lärare som klarar svåra klassrum. Nämn klasstorlek, antal elever med extra anpassningar, måluppfyllelse i specifika ämnen. "95% nådde målen i åk 6 svenska" säger mer än "god pedagogisk förmåga".',
      },
      {
        icon: 'CheckCircle',
        title: 'Pedagogiska metoder och program',
        description: 'Bornholmsmodellen, Singapore-matematik, formativ bedömning enligt Hattie, lågaffektivt bemötande. Var konkret om vilka metoder du behärskar i stället för att skriva "varierad undervisning". Specifika program signalerar ämnesdjup.',
      },
      {
        icon: 'FileText',
        title: 'Bedömningsstöd och dokumentation',
        description: 'Skolverkets bedömningsstöd, IUP, Schoolsoft, Vklass, Unikum. Skriv ut systemnamnen så Visma Recruit kan filtrera fram dig. Olika kommuner använder olika system för att dokumentera elevernas utveckling.',
      },
      {
        icon: 'Briefcase',
        title: 'Kollegiala uppdrag och utveckling',
        description: 'Mentorskap, ämneslagsledare, IT-pedagog, förstelärare, IKT-coach. Sådana uppdrag visar att du tar ansvar bortom undervisningen och är meriterande för senior- och utvecklingsroller.',
      },
      {
        icon: 'Target',
        title: 'NPF-anpassning och särskilt stöd',
        description: 'Erfarenhet av elever med autism, ADHD, dyslexi eller språkstöd är efterfrågad. Skriv konkret hur du anpassat undervisning, vilka stödinsatser du jobbat med, och resultat. Specialpedagogisk samverkan väger tungt.',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'Behörigheter lyfts överst',
        description: 'Vi har gjort lärarlegitimationen och dina exakta behörigheter (åldersgrupp + ämnen) till första visuella element. Rektorer skannar först efter behörighetsmatchning och vår mall ger den synlig på fem sekunder.',
      },
      {
        title: 'Pedagogisk erfarenhet per skola',
        description: 'Mallen separerar arbetsplatser (kommunal grundskola, fristående gymnasium, vuxenutbildning) så huvudman och årskurs syns. Du kan visa bredd över olika skolformer utan att meriter konkurrerar om samma yta.',
      },
      {
        title: 'Eget block för pedagogiska metoder',
        description: 'Bornholm, Singapore-matte, IKT-verktyg och specialpedagogiska metoder har egen sektion. Vi har sett att rektorer letar specifikt efter metoder de redan använder på skolan.',
      },
      {
        title: 'Premium-mallen lägger till foto',
        description: 'I lärarrollen där relationer värderas, lägger premium-varianten till foto och språkkunskaper. Skapar ett mer personligt intryck inför rektorer som väljer mellan flera kvalificerade kandidater.',
      },
      {
        title: 'Salviegrön ton för pedagogisk identitet',
        description: 'Vi har valt dämpade salviegröna och navy-toner som signalerar lugn, struktur och pedagogisk medvetenhet. Dragna från Skolverkets visuella språk men anpassade för individuell ansökan.',
      },
      {
        title: 'Plats för utvecklingsprojekt',
        description: 'Mentorskap, ämneslagsledare, läsutvecklingsprojekt har egen rad. Det visar att du tar ansvar bortom det dagliga klassrumsarbetet, vilket meriterar för förstelärar- och chefroller.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Undervisning och lärande',
        punkter: [
          'Planera, genomföra och utvärdera lektioner enligt läroplanen',
          'Anpassa undervisning för olika elevbehov och lärstilar',
          'Använda formativ bedömning och feedback för elevernas utveckling',
          'Implementera ämnesspecifika metoder (Bornholm, Singapore-matte, NTA)',
        ],
      },
      {
        rubrik: 'Bedömning och dokumentation',
        punkter: [
          'Bedöma elevernas kunskap mot kunskapskraven i Lgr22 eller Gy22',
          'Skriva omdömen och betyg enligt Skolverkets riktlinjer',
          'Dokumentera elevernas utveckling i Schoolsoft, Vklass eller Unikum',
          'Genomföra och rätta nationella prov enligt Skolverkets anvisningar',
        ],
      },
      {
        rubrik: 'Klassrumsledning och elevhälsa',
        punkter: [
          'Skapa trygg och studiero i klassrummet med tydliga rutiner',
          'Hantera konflikter, mobbning och kränkningar enligt Skollagen',
          'Samverka med elevhälsoteam, specialpedagog och kurator',
          'Implementera anpassningar för elever med NPF eller särskilt stöd',
        ],
      },
      {
        rubrik: 'Kontakt med vårdnadshavare',
        punkter: [
          'Genomföra utvecklingssamtal med elev och vårdnadshavare 1-2 gånger per termin',
          'Kommunicera via Schoolsoft, Unikum eller motsvarande plattform',
          'Hantera oro, klagomål och åtgärdsprogram med juridisk korrekthet',
          'Bjuda in till föräldramöten och samråd om skolans utveckling',
        ],
      },
      {
        rubrik: 'Kollegial samverkan',
        punkter: [
          'Delta i ämneslag, arbetslag och kollegialt lärande',
          'Mentor för nya kollegor och VFU-studenter',
          'Bidra till skolans systematiska kvalitetsarbete (SKA)',
          'Delta i förbättringsprojekt och utvecklingsuppdrag',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Lagstiftning och styrdokument',
        termer: [
          { term: 'Skollagen', forklaring: 'Reglerar all skolverksamhet i Sverige inklusive elevrätter och skolans ansvar.' },
          { term: 'Lgr22', forklaring: 'Läroplan för grundskolan från 2022, ersatte Lgr11.' },
          { term: 'Gy22', forklaring: 'Reviderad läroplan för gymnasieskolan från 2022.' },
          { term: 'Lpfö 18', forklaring: 'Läroplan för förskolan från 2018.' },
          { term: 'IUP', forklaring: 'Individuell utvecklingsplan, dokumenteras 1-2 gånger per termin.' },
          { term: 'Åtgärdsprogram', forklaring: 'Plan för elever som riskerar att inte nå kunskapskraven.' },
        ],
      },
      {
        kategori: 'Pedagogiska metoder',
        termer: [
          { term: 'Bornholmsmodellen', forklaring: 'Strukturerad metod för läs- och skrivinlärning i åk 1-3.' },
          { term: 'Singapore-matematik', forklaring: 'Visuellt baserad matematikmetod med betoning på begreppsförståelse.' },
          { term: 'Formativ bedömning', forklaring: 'Bedömning för lärande, fokus på återkoppling under processen.' },
          { term: 'Hattie/Marzano', forklaring: 'Meta-analyser av vad som faktiskt fungerar i klassrummet.' },
          { term: 'NTA', forklaring: 'Naturvetenskap och Teknik för Alla, experimentbaserad NO-undervisning.' },
          { term: 'Lågaffektivt bemötande', forklaring: 'Metod för att hantera utåtagerande beteende lugnt och professionellt.' },
        ],
      },
      {
        kategori: 'Behörigheter och utbildning',
        termer: [
          { term: 'Lärarlegitimation', forklaring: 'Utfärdas av Skolverket och anger exakta behörigheter (åldersgrupp + ämnen).' },
          { term: 'F-3-behörighet', forklaring: 'Förskoleklass och årskurs 1-3, vanligast för lågstadielärare.' },
          { term: '4-6-behörighet', forklaring: 'Mellanstadielärare, ofta med specifika ämnen som svenska, matte, NO/SO.' },
          { term: '7-9-behörighet', forklaring: 'Högstadielärare med ämnesfördjupning i två-tre ämnen.' },
          { term: 'Gymnasielärare', forklaring: 'Behörig åk 7-gy med fördjupning, oftast två ämnen.' },
          { term: 'Förstelärare', forklaring: 'Senior pedagogisk roll med utvecklingsuppdrag och högre lön.' },
        ],
      },
      {
        kategori: 'Digitala verktyg och system',
        termer: [
          { term: 'Schoolsoft', forklaring: 'Skoladministrativt system för dokumentation, omdömen och kommunikation.' },
          { term: 'Vklass', forklaring: 'Lärplattform för uppgifter, dokumentation och föräldrakontakt.' },
          { term: 'Unikum', forklaring: 'Plattform för IUP, omdömen och elevdokumentation.' },
          { term: 'Google Classroom', forklaring: 'Lärplattform från Google, vanlig i många skolor.' },
          { term: 'Microsoft Teams', forklaring: 'Lärplattform från Microsoft för digital undervisning och samverkan.' },
          { term: 'Skolverkets bedömningsstöd', forklaring: 'Diagnostiska prov för läs-, skriv- och matematikförmåga.' },
        ],
      },
    ],

    typiskaArbetsgivare: [
      {
        kategori: 'Kommunal grundskola',
        exempel: [
          'Stockholms stad, Göteborgs stad, Malmö stad',
          'Mindre och medelstora kommuner runt om i Sverige',
          'Resursskolor och anpassade grundskolor',
          'Sameskolor och teckenspråkiga skolor',
        ],
      },
      {
        kategori: 'Fristående skolor och koncerner',
        exempel: [
          'Internationella Engelska Skolan (IES)',
          'Kunskapsskolan, Academedia, Pysslingen',
          'Waldorfskolor och Montessoriskolor',
          'Religiösa friskolor och idéburna huvudmän',
        ],
      },
      {
        kategori: 'Gymnasium och vuxenutbildning',
        exempel: [
          'Kommunala gymnasier och fristående gymnasier',
          'Komvux och vuxenutbildning',
          'Yrkesgymnasier och lärlingsutbildning',
          'Folkhögskolor och studieförbund',
        ],
      },
      {
        kategori: 'Övriga arbetsgivare',
        exempel: [
          'SFI och studievägledning',
          'Specialpedagogiska skolmyndigheten (SPSM)',
          'Privata utbildningsföretag',
          'Bemanningsbolag (Lärarjobb, Vikariat.se)',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Lärarprogrammet (3,5-5 år)',
        beskrivning: 'Ämneslärare 7-gy: 5 år, kandidatexamen i ämnen plus pedagogik. Grundlärare F-3 eller 4-6: 4 år. Förskollärare: 3,5 år. VFU-perioder integrerade. Examen ger rätt att söka lärarlegitimation från Skolverket.',
      },
      {
        rubrik: 'KPU - kompletterande pedagogisk utbildning (1,5 år)',
        beskrivning: 'För dig som redan har akademisk examen i ämnen och vill bli ämneslärare. Innehåller pedagogik, didaktik och VFU. Vanlig väg för yrkesväxlare från andra branscher.',
      },
      {
        rubrik: 'Förstelärarutbildning (deltid)',
        beskrivning: 'Vidareutbildning till förstelärare med pedagogiskt utvecklingsuppdrag och högre lön. Kräver lärarlegitimation och flera års erfarenhet, ges i kommunal regi eller via lärosäten.',
      },
      {
        rubrik: 'Specialpedagog eller speciallärare (3 år deltid)',
        beskrivning: 'Vidareutbildning för lärare som vill arbeta med särskilt stöd, åtgärdsprogram och elevhälsa. Magisterexamen krävs. Stark efterfrågan i alla skolformer.',
      },
    ],

    kompetenser: {
      tekniska: [
        'Lärarlegitimation från Skolverket med exakta behörigheter',
        'Lgr22, Gy22 eller Lpfö 18 och kunskapskrav',
        'Bedömningsstöd och formativ bedömning',
        'Klassrumsledning enligt Hattie och Marzano',
        'IKT-pedagogik (Google Classroom, Teams, iPad)',
        'Specialpedagogiska metoder och NPF-anpassning',
        'Föräldrakommunikation via Schoolsoft, Vklass, Unikum',
        'Bornholmsmodellen, Singapore-matematik och NTA',
        'Lågaffektivt bemötande och konflikthantering',
        'Nationella prov och diagnostiska prov',
        'IUP, åtgärdsprogram och anpassningar',
        'Mentorskap för VFU-studenter och nya kollegor',
      ],
      personliga: [
        'Tydlig och strukturerad i klassrummet',
        'Empatisk och relationsskapande med elever',
        'Pedagogisk i kollegial samverkan',
        'Tålmodig med olikheter och lärsvårigheter',
        'Drivkraft för elevernas utveckling',
        'Lyhörd för kulturella och språkliga skillnader',
        'Etisk medvetenhet i bedömningar',
      ],
    },

    profilExempel:
      'Behörig grundskollärare åk 4-6 med 7 års erfarenhet från kommunal grundskola. Ämnesbehörighet i svenska, matematik och NO. 95% av eleverna nådde målen i åk 6 svenska under läsåret 2024 efter implementering av strukturerad läsförståelseundervisning enligt Bornholmsmodellen.',

    profilTips:
      'Behörighet (åldersgrupp + ämnen), år av erfarenhet, kommunal eller fristående huvudman. Andra meningen lyfter konkret elevresultat eller utvecklingsprojekt. Tredje meningen visar specialiseringar eller kollegiala uppdrag som differentierar dig.',

    rekryterarTipsen: [
      {
        rubrik: 'Lärarlegitimation och exakta behörigheter',
        text: 'Skriv åldersgrupp och ämnen exakt som de står på din legitimation. "Behörig åk 4-6 i svenska, matematik och NO" är tydligare än bara "Lärarlegitimation". Det avgör om du över huvud taget kan söka tjänsten.',
      },
      {
        rubrik: 'Klassrumsledning över ämneskompetens',
        text: 'Rektorer söker lärare som klarar klassrumsmiljö. Nämn klasstorlek, antal elever med extra anpassningar, hur du hanterat svåra grupper. Ämneskompetens är förmodat, klassrumsledning skiljer ut dig.',
      },
      {
        rubrik: 'Kollegial samverkan och utvecklingsprojekt',
        text: 'Har du varit med i ämneslag, drivit kollegialt lärande, eller arbetat med läs- och skrivutveckling? Skriv konkret om resultat: "ledde implementering av Bornholmsmodellen i åk 1, 95% nådde målet".',
      },
      {
        rubrik: 'Konkret elevresultat',
        text: 'Måluppfyllelse i specifika ämnen, framsteg på nationella prov, minskat avhopp. Konkreta siffror skiljer ett starkt CV från ett genomsnittligt och ger rektorn en bild av din effektivitet.',
      },
      {
        rubrik: 'NPF och särskilt stöd',
        text: 'Erfarenhet av elever med autism, ADHD, dyslexi eller språkstöd är efterfrågad. Beskriv typ av stöd, anpassningar och resultat. "100% av eleverna med autism nådde kunskapskraven" är konkret.',
      },
      {
        rubrik: 'Digital pedagogik och IKT',
        text: 'Google Classroom, Teams, iPad-användning i undervisning, programmeringsundervisning, AI-verktyg. Digital kompetens är allt viktigare 2026 och visar att du kan möta elevernas verklighet.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'Behörighet (åldersgrupp + ämnen), år av erfarenhet, primär huvudman. Konkreta resultat eller specialiseringar på 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Skola, huvudman, tidsperiod, årskurs. Konkreta uppdrag (mentorskap, ämneslagsledare, IT-pedagog) och elevresultat.' },
      { sektion: 'Utbildning', tips: 'Lärarexamen, lärosäte, ämneskombination med år. VFU-skolor om relevanta. Vidareutbildningar (NPF-kurs, lågaffektivt bemötande, förstelärare).' },
      { sektion: 'Kompetenser', tips: 'Pedagogiska metoder, IKT-verktyg, specialpedagogiska anpassningar. Skriv ut systemnamn (Schoolsoft, Vklass) i klartext.' },
      { sektion: 'Vidareutbildning', tips: 'NPF-kurs, läsutvecklingscertifikat, förstelärare-uppdrag. Ange utbildare och år. Visa kontinuerlig kompetensutveckling.' },
      { sektion: 'Övrigt', tips: 'Språkkunskaper utöver svenska, eventuell handledarutbildning, tillgänglighet för olika tjänster (heltid, deltid, vikariat).' },
    ],

    checklista: [
      'Lärarexamen med specifika åldersgrupper och ämnen',
      'Lärarlegitimation från Skolverket med exakta behörigheter',
      'Behörighet i specifika ämnen (svenska, matematik, NO, etc)',
      'VFU-skolor och eventuella handledningsuppdrag',
      'Pedagogiska metoder du behärskar (Bornholm, formativ bedömning)',
      'Kollegialt lärande och eventuella utvecklingsuppdrag',
      'Specialiseringar (NPF, läs- och skrivutveckling, programmering)',
      'IKT-verktyg och digitala system du arbetat i',
      'Konkreta elevresultat och måluppfyllelse',
      'Mentor- eller förstelärarmeritering',
    ],

    atsInfo:
      'Både vår mall Norrsken och premium-varianten Pedagog är ATS-säkra. Kommunala skolor använder oftast Visma Recruit, fristående koncerner använder Workday eller Teamtailor. Behörigheter ska skrivas precis som de står på din lärarlegitimation, inklusive åldersgrupper och ämnen, eftersom det är exakta sökord rekryterare filtrerar på. Skriv ut systemnamn (Schoolsoft, Vklass, Unikum) så ATS kan parsa dem.',

    faqItems: [
      {
        q: 'Vad ska finnas med i ett lärar-CV?',
        a: 'Lärarexamen med lärosäte, lärarlegitimation från Skolverket med exakta behörigheter (åldersgrupp + ämnen), klinisk erfarenhet uppdelad per skola och årskurs, klassrumsledning med konkreta resultat, pedagogiska metoder du behärskar, IKT-verktyg, eventuella specialiseringar (NPF, läs- och skrivutveckling), och kollegiala uppdrag. Lägg till språkkunskaper och handledarmeritering om du söker senior-roller.',
      },
      {
        q: 'Hur skriver jag CV som nyutexaminerad lärare?',
        a: 'Lyft VFU-perioder med skola, antal veckor och vad du fick göra. Inkludera examensarbete med titel och eventuell publicering. Praktiska kurser, programmering eller specialpedagogik från utbildningen, tidigare erfarenhet av barn (ledarskap, fritids, idrott), och språkkunskaper väger tungt. Skriv ut din vilja att lära och vara öppen för olika skolformer. Många kommuner har strukturerade introduktionsprogram för nyexade.',
      },
      {
        q: 'Hur skiljer sig CV för lärare från andra yrken?',
        a: 'Behörigheter är centrala och måste vara absolut korrekta. Ange åldersgrupp och ämne exakt enligt din legitimation. Klasstorlek, elevprofil och måluppfyllelse är CV-stoff som inte finns i andra yrken. Pedagogiska metoder du behärskar väger tyngre än generiska "kommunikationsförmåga". Och kollegial samverkan är meriterande för senior-roller.',
      },
      {
        q: 'Hur lyfter jag erfarenhet av elever med särskilt stöd?',
        a: 'Skriv konkret om typ av stöd (NPF, dyslexi, språkstöd, AKK) och hur du arbetat. "Anpassade undervisning för 4 elever med autism, 100% nådde kunskapskraven i åk 6" säger mer än "har erfarenhet av elever med särskilt stöd". Inkludera samverkan med specialpedagog, kurator och elevhälsoteam. Konkreta åtgärder och resultat differentierar dig från andra kandidater.',
      },
      {
        q: 'Vilka pedagogiska metoder är värda att lyfta på CV:t?',
        a: 'Bornholmsmodellen för läsinlärning, Singapore-matematik för matematikförståelse, NTA för NO, formativ bedömning enligt Hattie, lågaffektivt bemötande för konflikthantering. Programmering och digital pedagogik blir allt viktigare. Var konkret om vilka metoder du faktiskt använt och vilka resultat du sett, inte bara vilka kurser du gått.',
      },
      {
        q: 'Hur lång ska ett lärar-CV vara?',
        a: 'En sida räcker för nyutexaminerade. Med 5-10 års erfarenhet är 1,5-2 sidor lagom. Förstelärare och specialpedagoger kan ha upp till 2,5 sidor. Det viktiga är att lärarlegitimation, behörigheter och senaste tjänsten syns på första sidan utan att man behöver scrolla.',
      },
      {
        q: 'Vilka nyckelord ska CV:t ha för att passera ATS?',
        a: 'Specifika behörigheter (åk 4-6, åk 7-9, gymnasielärare i svenska, matematik), läroplanen (Lgr22, Gy22, Lpfö 18), pedagogiska metoder (Bornholm, formativ bedömning), system (Schoolsoft, Vklass, Unikum) och eventuella specialiseringar (NPF, dyslexi, programmering). Heroma och Visma Recruit söker exakt på dessa termer i jobbannonsens språk.',
      },
      {
        q: 'Behöver jag personligt brev till lärartjänster?',
        a: 'Ja, för de flesta tjänster i Sverige förväntas ett personligt brev. Använd brevet för att förklara varför just den skola och beskriv en specifik situation där du visat din pedagogiska förmåga. Beskriv en elev du hjälpt, ett utvecklingsprojekt du drivit, eller hur du jobbat med en svår grupp. Håll till en sida på 300-400 ord. Ett välskrivet brev kan vara avgörande när två kandidater har liknande CV.',
      },
      {
        q: 'Ska jag inkludera elever som referenser?',
        a: 'Nej, aldrig. Använd istället tidigare rektor, biträdande rektor, ämneslagsledare eller VFU-handledare som referenser. Skriv "Referenser lämnas på begäran" på CV:t och förbered en lista med 2-3 personer du frågat om tillstånd. Vårdnadshavare som referenser fungerar inte heller, det är professionella referenser som väger.',
      },
      {
        q: 'Vad ska jag inte ha med på mitt lärar-CV?',
        a: 'Personnummer (bara födelseår), foto i offentlig sektor (riskerar diskriminering), löneförväntningar, irrelevanta arbetslivserfarenheter äldre än 10-15 år, generiska påståenden ("god kommunikationsförmåga") utan stöd, namn på enskilda elever, sekretessbelagda detaljer från åtgärdsprogram, och hobbies som inte är pedagogiskt relevanta. Stavfel diskvalificerar direkt eftersom skriftlig kommunikation är central i lärarrollen.',
      },
    ],
  },

  // ============================================================================
  // EKONOMI
  // ============================================================================
  'redovisningsekonom': {
    kompetenser: {
      tekniska: [
        'Bokslut enligt K2 och K3-regelverket',
        'Visma Administration, Fortnox, BL Administration',
        'Skatteberäkning (inkomstskatt, moms, arbetsgivaravgift)',
        'Avstämningar och periodiseringar',
        'Inkomstdeklaration (INK2, INK3, INK4)',
        'Lönehantering (Hogia, Fortnox Lön, Visma Lön)',
        'Excel (PivotTable, VLOOKUP, makron)',
      ],
      personliga: [
        'Noggrann och strukturerad',
        'Analytisk i sifferarbete',
        'Sekretessmedveten',
        'Lugn vid bokslut och deadline',
        'Pedagogisk i kontakt med kunder',
      ],
    },
    profilExempel: 'Auktoriserad redovisningskonsult (FAR) med 6 års erfarenhet från redovisningsbyrå och industribolag. Hanterar ~25 kunders löpande bokföring och bokslut enligt K2/K3 i Visma och Fortnox. Specialiserad på branschen tjänsteföretag och e-handel med erfarenhet av valutahantering och periodisering.',
    profilTips: 'Auktorisation eller examen, år av erfarenhet, branscher du arbetat i, dina specialiseringar (K2/K3, moms, lön, fonder).',
    rekryterarTipsen: [
      {
        rubrik: 'System och certifieringar avgör tjänsten',
        text: 'Vilka redovisningssystem behärskar du? Visma, Fortnox, BL Administration, SAP, Hogia. Auktoriserad redovisningskonsult (FAR) eller revisor (FAR/Revisorsinspektionen) är CV-kritiska titlar. Skriv ut dem exakt.',
      },
      {
        rubrik: 'Branschvana är värt mer än titel',
        text: 'En redovisningsekonom som arbetat med tjänsteföretag är inte samma som en som arbetat med industri eller bygg. Lyft branschen i din titel. K3-bolag, fastighetsbolag, koncernredovisning — alla är specialiseringar.',
      },
      {
        rubrik: 'Bokslutskompetens är hård valuta',
        text: 'Hur många bokslut har du gjort? K2 vs K3? Egen-skriven årsredovisning eller grundbokföring för revisor? Konkret omfattning gör skillnad: "30 bokslut/år för småföretag (K2)" är tydligt.',
      },
    ],
    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'Auktorisation, år av erfarenhet, primära branscher och system. Specialiseringar.' },
      { sektion: 'Erfarenhet', tips: 'Bolag + tidsperiod + dina ansvarsområden. Konkretisera kund- eller bolagsantal, omsättning, regelverk (K2/K3).' },
      { sektion: 'Utbildning', tips: 'Ekonomi/redovisningsutbildning + lärosäte. FAR-cert, vidareutbildningar (Skatterätt, IFRS-kurs).' },
      { sektion: 'Kompetenser', tips: 'System, regelverk, specialområden (moms, lön, koncern, IFRS). Excel-färdigheter på rätt nivå.' },
    ],
    checklista: [
      'Ekonomiutbildning från högskola eller yrkeshögskola',
      'FAR-cert eller liknande auktorisation',
      'Erfarenhet av specifika redovisningssystem',
      'Bokslutsvana (volym + K2/K3)',
      'Skatte- och momskunskap',
      'Lönehantering (om relevant)',
      'Excel- och rapporteringsfärdigheter',
    ],
    atsInfo: 'Ja, både Tidlös (gratis) och Konsulten-mallen (premium) är ATS-säkra. Stora redovisningsbyråer som EY, PwC, KPMG och Grant Thornton använder Workday eller egna ATS. Använd exakta system-namn som "Fortnox" och "Visma" istället för "redovisningssystem" — de filtreras på.',
    faqItems: [
      {
        q: 'Behöver jag FAR-auktorisation för att jobba som redovisningsekonom?',
        a: 'Inte för junior- och mid-level-tjänster. Men för senior-roller och rådgivande tjänster är auktoriserad redovisningskonsult (FAR) eller revisor närmast krav. Auktorisationen ger högre lön och kvalificerar dig för fler tjänster.',
      },
      {
        q: 'Vilka redovisningssystem är viktigast att behärska?',
        a: 'För småföretag och byråer: Fortnox, Visma Administration, BL Administration. För industri och större bolag: SAP, Microsoft Dynamics, Hogia. För koncerner: Aaro eller IBM Cognos. Lista de du faktiskt behärskar.',
      },
      {
        q: 'Hur visar jag att jag är noggrann på CV:t?',
        a: 'Skriv inte "noggrann". Visa det. "0% felaktigheter i 30 K2-bokslut 2024", "Hanterade 25 kundavstämningar varje månad utan revisorsanmärkning". Konkreta resultat snarare än adjektiv.',
      },
    ],
  },

  // ============================================================================
  // TEKNIK
  // ============================================================================
  'systemutvecklare': {
    seoIntro:
      'Som systemutvecklare i Sverige bedöms du på din tech-stack, dina projekt och hur du bidragit i kodbaser. Konsultbolag, scale-ups och tech-bolag har konstant öppna roller, men konkurrensen är hård bland senior- och staff-positioner. Ett välskrivet CV avgör om du fastnar i ett bemanningsbolags pool eller blir kallad till de bolag du faktiskt vill jobba på.\n\nVår mall för systemutvecklare lyfter primär tech-stack, senioritet och konkreta projektresultat som första visuella element. Vi har strukturerat erfarenhetssektionen så att bolag, roll, period och teknik-stack syns direkt med dina arkitekturbeslut, refaktoreringar och prestandavinster. Det betyder att tekniska rekryterare och CTO:er kan bedöma din kapacitet på fem sekunder.\n\nKonkret innehåll vi rekommenderar: programmeringsspråk och frameworks (TypeScript, React, Node.js, Python, Go), cloud-erfarenhet (AWS, GCP, Azure med specifika tjänster), CI/CD-pipelines (GitHub Actions, GitLab CI), containerization (Docker, Kubernetes), databaser (PostgreSQL, MongoDB, Redis), testningsmetoder (Jest, Playwright), versionshantering (Git med GitFlow eller trunk-based), och eventuella certifieringar (AWS Certified, CKA).\n\nNedan hittar du två CV-mallar designade för utvecklarrollen, ett färdigt CV-exempel att utgå från, och konkreta tips på vad tekniska rekryterare och CTO:er på konsultbolag, produktbolag och startups faktiskt letar efter. Ladda ner mallen gratis och anpassa efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'Briefcase',
        title: 'Stack-specifika sökord avgör matchning',
        description: 'CV-screeners söker exakta termer. "TypeScript", "React 18", "Next.js 14" är tydligare än "JavaScript-utveckling". Lista exakta frameworks, versioner och bibliotek så Workday och Teamtailor kan filtrera fram dig.',
      },
      {
        icon: 'TrendingUp',
        title: 'Mätbara prestandaresultat',
        description: 'Refaktoreringsresultat (50% snabbare), uptime-siffror (99.95%), användarvolym (50K samtidiga sessioner), kostnadsminskning på cloud-infra. Konkreta siffror gör utvecklare till senior-kandidater i CTO-ögon.',
      },
      {
        icon: 'CheckCircle',
        title: 'Bygg-från-grunden vs underhåll',
        description: 'Har du byggt nya system från grunden eller underhållit existerande? Båda värderas men olika. Senior arkitekt-roller söker bygg-från-grunden, mid-level söker stabil underhållsförmåga. Var tydlig om vad du gjort.',
      },
      {
        icon: 'FileText',
        title: 'Cloud-tjänster i klartext',
        description: 'AWS Lambda, S3, RDS, ECS. GCP Cloud Run, BigQuery, Pub/Sub. Azure Functions, Service Bus. Specifika tjänster är CV-kritiska eftersom rekryterare letar efter exakta matchningar mot vad bolaget redan kör.',
      },
      {
        icon: 'Award',
        title: 'Certifikat och senior-meritering',
        description: 'AWS Certified Solutions Architect, Kubernetes CKA, HashiCorp Certified, Google Cloud Professional. Certifikat visar djup och prioriteras i konsultsegmentet där kunder betalar för certifierad kompetens.',
      },
      {
        icon: 'Target',
        title: 'Ledarskap och teknisk roll',
        description: 'Tech lead, staff engineer, principal, eller arkitekt? Ange tydligt vad du gjort i tidigare roller: arkitekturbeslut, kod-granskning, mentorskap, hiring-loops. Det skiljer junior från senior i många bolags interna kalibrering.',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'Tech-stack lyfts överst',
        description: 'Vi har gjort din primära stack till första visuella element så CTO:er och tekniska rekryterare kan bekräfta matchning på fem sekunder. Frontend, backend, cloud och databaser har egna grupper för snabbare scanning.',
      },
      {
        title: 'Projekterfarenhet med arkitekturresultat',
        description: 'Mallen separerar bolag och tekniska bidrag (architecture decisions, refaktoreringar, prestandavinster). Du kan visa både stack-bredd och djup utan att meriter konkurrerar om samma yta.',
      },
      {
        title: 'Eget block för open source och certifikat',
        description: 'GitHub-länk, AWS Certified, CKA, talks och konferensbidrag har egen sektion. Vi har sett att tech-rekryterare värderar bevisad kompetens (commits, certifikat) över titlar.',
      },
      {
        title: 'Stack-developer-mallen för tech-DNA',
        description: 'Vår premium-mall Stack-developer har monospace-kod-stil, gradient-accent och tabellär layout som signalerar tech utan att bli för avantgardistisk för konsultsegmentet.',
      },
      {
        title: 'Kompakt typografi för senior-roller',
        description: 'Seniora utvecklare har ofta 7-12 års erfarenhet att rymma. Vi använder 12.5px body-text för att få plats med fler projekt utan att verka cramped, vilket är vanligt vid senior-CV.',
      },
      {
        title: 'Plats för tekniska bidrag bortom kod',
        description: 'Hiring-loops, tech-talks, konferensbidrag, mentorskap har egen rad. Det visar att du är en del av tech-communityt och tar ansvar bortom egen produktion, vilket meriterar för staff- och principal-roller.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Utveckling och kodning',
        punkter: [
          'Designa, bygga och underhålla applikationer i frontend, backend eller fullstack',
          'Skriva ren och testbar kod enligt teamets standarder och stilguider',
          'Implementera nya funktioner enligt produktrelaterade krav och användarfeedback',
          'Refaktorera existerande kod för bättre prestanda, läsbarhet och underhållbarhet',
        ],
      },
      {
        rubrik: 'Arkitektur och tekniska beslut',
        punkter: [
          'Föreslå och dokumentera arkitekturbeslut via ADR (Architecture Decision Records)',
          'Välja teknik-stack och bibliotek baserat på krav, prestanda och underhållskostnad',
          'Designa API:er enligt REST, GraphQL eller gRPC med tydlig versionhantering',
          'Optimera prestanda genom caching, queueing, och databasindexering',
        ],
      },
      {
        rubrik: 'CI/CD och drift',
        punkter: [
          'Underhålla pipelines i GitHub Actions, GitLab CI eller Jenkins',
          'Implementera automatiserad testning på unit, integration och e2e-nivå',
          'Hantera deployment till staging och produktion via GitOps eller manuella releases',
          'Övervaka system med Datadog, New Relic eller Grafana och svara på incidenter',
        ],
      },
      {
        rubrik: 'Code review och team',
        punkter: [
          'Granska kollegors kod via Pull Request med fokus på kvalitet, säkerhet och stil',
          'Mentor för junior- och mid-level-utvecklare i kodning och tekniska beslut',
          'Delta i sprint planning, standups och retros enligt Scrum eller Kanban',
          'Bidra till hiring-loops genom tekniska intervjuer och kodgranskningar',
        ],
      },
      {
        rubrik: 'Kunskapsdelning och utveckling',
        punkter: [
          'Skriva teknisk dokumentation, README, ADR och runbooks',
          'Hålla tech-talks internt eller på konferenser om verktyg och metoder',
          'Bidra till open source-projekt och bygga upp personlig portfolio',
          'Hålla sig uppdaterad om nya frameworks, säkerhetsproblem och best practices',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Frontend',
        termer: [
          { term: 'React', forklaring: 'Vanligaste frontend-frameworket i Sverige, används av majoriteten av tech-bolag.' },
          { term: 'Next.js', forklaring: 'React-framework för server-side rendering och full-stack-utveckling.' },
          { term: 'Vue.js', forklaring: 'Alternativ till React, populärt på vissa scale-ups och i mindre team.' },
          { term: 'Angular', forklaring: 'Enterprise-framework från Google, vanligare på större företag och konsultbolag.' },
          { term: 'TypeScript', forklaring: 'Typad superset av JavaScript, standard på de flesta seriösa kodbaser.' },
          { term: 'Svelte', forklaring: 'Modern, kompilerad framework med växande popularitet bland startup-utvecklare.' },
        ],
      },
      {
        kategori: 'Backend och språk',
        termer: [
          { term: 'Node.js', forklaring: 'JavaScript-runtime för server-side-utveckling, dominerar JS-bolag.' },
          { term: 'Python', forklaring: 'Vanligt i datascience, ML och backend (Django, FastAPI, Flask).' },
          { term: 'Go', forklaring: 'Statiskt typat språk från Google för high-performance services och cloud-tooling.' },
          { term: '.NET / C#', forklaring: 'Microsoft-stacken, dominerar enterprise och statlig sektor i Sverige.' },
          { term: 'Java', forklaring: 'Etablerat på storbolag, banksektorn och konsultbolag som CGI och Sopra Steria.' },
          { term: 'Rust', forklaring: 'Modernt systemspråk med växande användning för prestanda-kritiska tjänster.' },
        ],
      },
      {
        kategori: 'Cloud och infrastruktur',
        termer: [
          { term: 'AWS', forklaring: 'Marknadsledande cloud-plattform, används av majoriteten av svenska tech-bolag.' },
          { term: 'GCP', forklaring: 'Google Cloud Platform, växande popularitet inom data och ML.' },
          { term: 'Azure', forklaring: 'Microsofts cloud, dominerar i .NET-segmentet och statlig sektor.' },
          { term: 'Kubernetes', forklaring: 'Containerorchestration som standard för modern microservice-arkitektur.' },
          { term: 'Terraform', forklaring: 'Infrastructure as Code-verktyg från HashiCorp för cloud-hantering.' },
          { term: 'Docker', forklaring: 'Container-runtime, grundläggande kompetens för moderna utvecklare.' },
        ],
      },
      {
        kategori: 'Verktyg och processer',
        termer: [
          { term: 'GitHub Actions', forklaring: 'CI/CD-plattform integrerad med GitHub, vanligast för moderna kodbaser.' },
          { term: 'GitLab CI', forklaring: 'CI/CD i GitLab, vanligt på större företag som självhostar Git.' },
          { term: 'Jenkins', forklaring: 'Etablerat CI-verktyg, fortfarande i bruk på enterprise och konsultbolag.' },
          { term: 'Trunk-based development', forklaring: 'Utvecklingsmetod med korta feature-grenar och frekventa releases.' },
          { term: 'GitFlow', forklaring: 'Branch-modell med separata grenar för development, release och hotfix.' },
          { term: 'TDD/BDD', forklaring: 'Test-Driven respektive Behavior-Driven Development, metoder för testdriven kodning.' },
        ],
      },
    ],

    typiskaArbetsgivare: [
      {
        kategori: 'Konsultbolag',
        exempel: [
          'CGI, Sopra Steria, Capgemini, Knowit',
          'Cybercom, HiQ, Acando, Avanade',
          'Tieto Evry, Accenture, Tietoevry',
          'Mindre nischade konsultbolag och frilans',
        ],
      },
      {
        kategori: 'Produkt- och scale-ups',
        exempel: [
          'Klarna, Spotify, Tink, iZettle, Bolt',
          'Truecaller, Northvolt, Voi, Mathem',
          'Storytel, Kry, MAG Interactive, King',
          'Startup-bolag i Stockholm, Göteborg, Malmö',
        ],
      },
      {
        kategori: 'Storbolag och bank',
        exempel: [
          'SEB, Handelsbanken, Swedbank, Nordea',
          'IKEA, Volvo, Ericsson, ABB, Scania',
          'H&M, Telia, Tele2, ICA',
          'Statligt ägda bolag (SJ, Vattenfall, PostNord)',
        ],
      },
      {
        kategori: 'Övriga arbetsgivare',
        exempel: [
          'Statliga myndigheter (Skatteverket, Försäkringskassan)',
          'Forskningsinstitut och universitet',
          'Utländska tech-bolag med Sverige-kontor (Google, Meta, Amazon)',
          'Bemanningsbolag och frilans-plattformar',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Civilingenjörsexamen i datateknik (5 år)',
        beskrivning: 'Master-examen från KTH, Chalmers, LTH, Linköping eller Uppsala. Vanlig väg för senior-roller på storbolag och i regulatoriskt tunga branscher som bank och fintech.',
      },
      {
        rubrik: 'Kandidat eller högskoleingenjör (3 år)',
        beskrivning: 'Kortare teknisk utbildning från högskolor och tekniska program. Räcker för de flesta utvecklarroller, vanlig väg in i tech utan master-djup.',
      },
      {
        rubrik: 'Yrkeshögskola och bootcamps (3-12 månader)',
        beskrivning: 'YH-utbildningar från till exempel Nackademin, KYH eller Webbutvecklarens. Bootcamps från Hyper Island, Nuiteq. Kortare väg in i tech, ofta lika värderad som högskola hos scale-ups.',
      },
      {
        rubrik: 'Självlärd med portfolio',
        beskrivning: 'Många bolag (särskilt scale-ups) värderar GitHub-portfolio, open source-bidrag och egenstudier över formell examen. Ger snabbaste vägen in men kan vara svårare för senior-roller på storbolag.',
      },
    ],

    kompetenser: {
      tekniska: [
        'TypeScript och JavaScript (Node.js, React, Next.js)',
        'Backend-utveckling (REST, GraphQL, gRPC)',
        'Databaser (PostgreSQL, MongoDB, Redis, MySQL)',
        'Cloud-plattformar (AWS, GCP, Azure)',
        'CI/CD (GitHub Actions, GitLab CI, Jenkins)',
        'Containerization (Docker, Kubernetes)',
        'Testning (Jest, Vitest, Playwright, Cypress)',
        'Versionshantering (Git, GitHub Flow, GitFlow)',
        'Infrastructure as Code (Terraform, Pulumi)',
        'Monitoring och observability (Datadog, Grafana, New Relic)',
        'Säkerhet (OWASP Top 10, SAST, DAST)',
        'Agile-metoder (Scrum, Kanban, SAFe)',
      ],
      personliga: [
        'Problemlösningsfokuserad',
        'Strukturerad i kodorganisation',
        'Kollaborativ i kodgranskning',
        'Driven av kvalitet och underhållbarhet',
        'Lärande och kunskapsdelande',
        'Kommunikativ med icke-tekniska intressenter',
        'Pragmatisk i avvägning mellan ideal och deadline',
      ],
    },

    profilExempel:
      'Senior fullstack-utvecklare med 8 års erfarenhet av TypeScript, React och Node.js. Byggt och underhållit produktionsmiljö för fintech-applikation med 50K+ aktiva användare och 99.95% uptime. Arbetar enligt trunk-based development i AWS-baserad CI/CD-miljö med automatiserad e2e-testning.',

    profilTips:
      'Senioritet, primär stack, år av erfarenhet, branschen du arbetat i. Andra meningen lyfter konkret resultat (uptime, användarvolym, prestanda). Tredje meningen visar arbetssätt, ledarskap eller specialisering som differentierar dig.',

    rekryterarTipsen: [
      {
        rubrik: 'Stack-specifika sökord avgör matchning',
        text: 'CV-screeners söker exakta termer. "TypeScript", "React 18", "Next.js" är tydligare än bara "JavaScript-utveckling". Lista de specifika frameworks, versioner och bibliotek du arbetat med för att passera ATS.',
      },
      {
        rubrik: 'Bygg- vs underhåll-erfarenhet',
        text: 'Har du byggt nya system från grunden eller underhållit existerande? Båda värderas men olika. Senior arkitektroller söker bygg-från-grunden, mid-level söker stabil underhållsförmåga. Var tydlig om vad du gjort.',
      },
      {
        rubrik: 'Mätbara prestandaresultat',
        text: 'Refaktoreringsresultat (50% snabbare), uptime-siffror (99.95%), användarvolym (50K samtidiga sessioner). Konkreta siffror gör utvecklare till senior-kandidater i CTO-ögon och differentierar från generiska CV:n.',
      },
      {
        rubrik: 'Cloud-tjänster i klartext',
        text: 'AWS Lambda, S3, RDS, ECS. GCP Cloud Run, BigQuery. Azure Functions. Specifika tjänster är CV-kritiska eftersom rekryterare letar efter exakta matchningar mot vad bolaget redan kör i sin infra.',
      },
      {
        rubrik: 'Open source och GitHub',
        text: 'GitHub-länk på CV:t med synlig commit-historik, repos med stjärnor, eller open source-bidrag är ett av de starkaste signalerna för tech-rekryterare. Konsulter och produktbolag granskar din profil innan intervju.',
      },
      {
        rubrik: 'Tech-talks och community',
        text: 'Konferensbidrag, meetup-presentationer, blog-posts om tekniska problem. Sådana meriter signalerar att du är aktiv i communityt och tar ansvar bortom egen produktion. Viktigt för staff- och principal-roller.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'Senioritet, primär stack, år av erfarenhet, bransch. Specialitet (frontend-arkitektur, backend-skalning, devops) på 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Bolag, roll, tidsperiod, tech-stack. Dina bidrag (architecture decisions, refaktoreringar, prestanda-vinster) med konkreta siffror.' },
      { sektion: 'Utbildning', tips: 'Examen, lärosäte, år. Kortare bootcamps eller online-cert räknas (AWS Certified, Kubernetes CKA, HashiCorp Certified).' },
      { sektion: 'Kompetenser', tips: 'Strukturera i grupper: Languages, Frameworks, Tools, Cloud, Databases. Lista versioner där relevant.' },
      { sektion: 'Open source', tips: 'GitHub-länk, repos med 50+ stjärnor, open source-bidrag, npm-paket du publicerat. Hobby-projekt utan commits eller produktion sänker mer än lyfter.' },
      { sektion: 'Övrigt', tips: 'Tech-talks och konferensbidrag, blog, eventuell hiring-loop-erfarenhet, mentorskap för junior-utvecklare.' },
    ],

    checklista: [
      'Primär programmeringsstack med versioner och senioritet',
      'Cloud-erfarenhet (AWS, GCP, Azure med specifika tjänster)',
      'CI/CD-pipeline-erfarenhet och verktyg',
      'Specifika databaser du behärskar (relationella och NoSQL)',
      'Testningsmetoder (unit, integration, e2e)',
      'Open source-bidrag eller GitHub-portfolio',
      'Eventuella certifieringar (AWS, K8s, Terraform)',
      'Mätbara prestandaresultat eller arkitekturbidrag',
      'Hiring-loops, mentorskap eller tech-leadership',
      'Tech-talks, blog-posts eller community-bidrag',
    ],

    atsInfo:
      'Vår mall Stack-developer är ATS-säker och optimerad för tekniska screeners. Konsultbolag som CGI, Sopra Steria och Knowit använder oftast Workday eller Teamtailor. Specifika tech-keywords (TypeScript, React, AWS Lambda, PostgreSQL) är CV-kritiska. Skriv ut dem som listpunkter i kompetens-sektionen, inte i löpande text. ATS-system filtrerar exakta matchningar mot jobbannonsens språk.',

    faqItems: [
      {
        q: 'Vad ska finnas med i ett utvecklar-CV?',
        a: 'Primär tech-stack med versioner, klinisk erfarenhet uppdelad per bolag och roll, mätbara prestandaresultat, cloud-erfarenhet (AWS/GCP/Azure med specifika tjänster), CI/CD-pipelines, databaser, testningsmetoder, eventuella certifieringar (AWS Certified, CKA), GitHub-länk, och open source-bidrag. Lägg till tech-talks och mentorskap om du söker senior-roller.',
      },
      {
        q: 'Hur skriver jag CV som junior-utvecklare utan kommersiell erfarenhet?',
        a: 'Lyft GitHub-portfolio med 3-5 projekt som visar olika delar av stacken. Inkludera examensarbete med teknisk fördjupning, eventuella bootcamps eller YH-utbildningar, och open source-bidrag (även små Pull Requests räknas). Praktikperioder, tävlingar (hackathons, Advent of Code), och tekniska blog-posts visar engagemang. Skriv ut din vilja att lära och vara öppen för olika stack.',
      },
      {
        q: 'Hur lång ska ett utvecklar-CV vara?',
        a: 'Junior 0-3 år: 1 sida. Mid-level: 1,5 sidor. Senior eller staff: 2 sidor max. CV-screeners hinner inte läsa längre. Lyft de senaste 5-7 åren tydligast och kondensera tidigare. För konsultbolag som har långa CV-mallar (5-10 sidor) skriver du ett separat konsult-CV utöver ditt eget.',
      },
      {
        q: 'Behöver jag formell examen för utvecklar-jobb?',
        a: 'Inte alltid. Många bolag (särskilt scale-ups och konsultbolag) värderar portfolio och GitHub över examen. För seniora roller på regulatoriskt tunga branscher (fintech, healthcare, statlig sektor) är teknisk högskoleexamen ofta krav. För FAANG-bolag i Stockholm är masterexamen ofta förväntat. Bootcamps och YH-utbildningar fungerar bra som ingångsväg.',
      },
      {
        q: 'Ska jag inkludera personliga sidoprojekt på CV:t?',
        a: 'Ja om de är relevanta och dokumenterade. GitHub-repos med 50+ stjärnor, open source-bidrag, eller en portfolio-app som visar din arkitekturtänkande är CV-värt. Hobby-projekt utan commit-historia eller utan produktion sänker mer än lyfter. Bättre att lista 2-3 starka projekt än 10 halvfärdiga.',
      },
      {
        q: 'Vilka nyckelord ska CV:t ha för att passera ATS?',
        a: 'Specifika språk och frameworks (TypeScript, React, Next.js), cloud-tjänster (AWS Lambda, S3, RDS), databaser (PostgreSQL, MongoDB), CI/CD-verktyg (GitHub Actions, GitLab CI), containerization (Docker, Kubernetes), och testverktyg (Jest, Playwright). Workday och Teamtailor söker exakta matchningar mot jobbannonsens språk. Kopiera språkbruket där du faktiskt har erfarenheten.',
      },
      {
        q: 'Hur visar jag arkitekturkompetens utan staff-titel?',
        a: 'Beskriv konkreta arkitekturbeslut du varit del av: ADR du skrivit, system-design-dokument, prestandaanalyser, refaktoreringar du lett. Skriv "Föreslog och drev migrering från monolith till mikroservices" eller "Designade caching-lager som minskade DB-belastning med 60%". Konkreta bidrag visar arkitekturmognad utan att titeln behöver vara staff.',
      },
      {
        q: 'Behöver jag personligt brev till tech-jobb?',
        a: 'Beror på bolaget. Konsultbolag och svenska traditional-bolag förväntar sig brev. Scale-ups och tech-bolag accepterar ofta bara CV. När brev förväntas, fokusera på varför just det bolaget och vad du tar med dig. Beskriv ett konkret problem du löst eller en arkitektur-utmaning du tagit dig an. Håll till en sida på 300-400 ord.',
      },
      {
        q: 'Vilka certifieringar är värda för utvecklare 2026?',
        a: 'AWS Certified Solutions Architect (Associate eller Professional) är mest efterfrågad i konsultsegmentet. Kubernetes CKA för devops-roller. HashiCorp Certified för Terraform-tunga uppdrag. Google Cloud Professional Cloud Architect växer i Sverige. För säkerhet: OSCP eller CompTIA Security+. Certifieringar väger tyngst i konsultbolag där kunder betalar för bevisad kompetens.',
      },
      {
        q: 'Vad ska jag inte ha med på mitt utvecklar-CV?',
        a: 'Personnummer (bara födelseår), löneförväntningar, foto (inte standard i tech-segmentet), irrelevanta arbetslivserfarenheter äldre än 10-15 år, generiska påståenden ("driven och ansvarstagande") utan stöd, kursbevis utan praktisk tillämpning, och hobby-projekt utan dokumentation. Stavfel i tech-termer (skriva "Java" när du menar "JavaScript") diskvalificerar omedelbart.',
      },
    ],
  },

  // ============================================================================
  // OFFENTLIG SEKTOR
  // ============================================================================
  'handlaggare': {
    kompetenser: {
      tekniska: [
        'Förvaltningsrätt och offentlighetsprincipen (OSL)',
        'Ärendehanteringssystem (Treserva, Procapita, ProCapita)',
        'Utredningsmetodik och rapportskrivning',
        'Diariehantering och GDPR-arbete',
        'Beslutsmotiverande prosa enligt FL',
        'Lagstiftning per ärendetyp (LSS, SoL, BBIC, IBIC)',
        'Statistikanalys och uppföljning',
      ],
      personliga: [
        'Saklig och neutralt språkbruk',
        'Strukturerad i ärendehantering',
        'Empatisk i klientmöten',
        'Sekretessmedveten',
        'Stresstålig vid hög ärendebelastning',
      ],
    },
    profilExempel: 'Erfaren handläggare med 6 års erfarenhet från kommunal myndighet inom socialtjänst och äldreomsorg. Hanterar 35-40 aktiva ärenden parallellt enligt SoL och LSS i Treserva med fokus på korrekta beslut, motivering och uppföljning. Handledare för 3 nya kollegor och delaktig i kommunens utvecklingsprojekt kring digital ärendehantering.',
    profilTips: 'År av erfarenhet, lagstiftningsområde (SoL, LSS, BBIC), system du arbetat i. Konkret ärendevolym eller uppdrag som differentierar dig.',
    rekryterarTipsen: [
      {
        rubrik: 'Lagstiftningsområde är CV-avgörande',
        text: 'Vilken lagstiftning har du arbetat efter? SoL, LSS, OSL, BBIC, IBIC, VAB. Var specifik. Olika kommuner och förvaltningar söker handläggare med exakt erfarenhet av specifik lagstiftning.',
      },
      {
        rubrik: 'Ärendevolym och komplexitet',
        text: 'Hur många ärenden hanterar du parallellt? Är de standardiserade eller komplexa? Skriv "35-40 LSS-ärenden parallellt" istället för "ansvarat för ärendehandläggning". Volym + komplexitet ger arbetsledaren bild av din kapacitet.',
      },
      {
        rubrik: 'System och digitalisering',
        text: 'Treserva, Procapita, ProCapita Vård och Omsorg. Vilket har du jobbat i? Hur länge? Eventuell erfarenhet av digitala utvecklingsprojekt eller GDPR-arbete är meriterande för seniora handläggare.',
      },
    ],
    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'År av erfarenhet, lagstiftningsområden, system, ärendetyper. Eventuella specialiseringar.' },
      { sektion: 'Erfarenhet', tips: 'Förvaltning + tidsperiod + ärendetyp + ärendevolym. Konkretisera komplexitet (BBIC-utredningar, omprövningar, överklaganden).' },
      { sektion: 'Utbildning', tips: 'Socionom/jurist/förvaltning + lärosäte. Vidareutbildningar (BBIC-cert, IBIC-utbildning, MI-kurs).' },
      { sektion: 'Kompetenser', tips: 'Lagstiftning, system, utredningsmetodik. Var konkret om vilka delar av FL eller SoL du arbetat efter.' },
    ],
    checklista: [
      'Examen (socionom, jurist, förvaltning, eller liknande)',
      'Specifik lagstiftning du arbetat efter',
      'Ärendehanteringssystem (Treserva, Procapita)',
      'Utredningsmetodik (BBIC, IBIC, MI)',
      'Volym och komplexitet på ärendetyper',
      'Eventuella specialuppdrag (omprövningar, överklaganden)',
      'Vidareutbildningar och certifikat',
    ],
    atsInfo: 'Ja, både Tidlös (gratis) och Aspekt-mallen (premium) är ATS-säkra. Kommunala arbetsgivare använder Visma Recruit eller egna system. Lagrum (LSS, SoL, BBIC) och systemnamn är typiska sökord — skriv ut dem exakt.',
    faqItems: [
      {
        q: 'Vilken examen krävs för handläggare?',
        a: 'Beror på förvaltning. Socionomexamen för socialtjänst-handläggare. Juridisk examen eller offentlig rätt-utbildning för juridiska handläggare. Förvaltningsutbildning eller annan akademisk examen för administrativa handläggare.',
      },
      {
        q: 'Hur viktigt är specifik lagstiftningserfarenhet?',
        a: 'Kritiskt. Många handläggartjänster kräver exakt erfarenhet av specifik lagstiftning. En LSS-handläggare kan inte direkt gå in som BBIC-handläggare utan utbildning. Lyft alltid din lagstiftningsbakgrund i sammanfattningen.',
      },
      {
        q: 'Ska jag nämna ärendevolym?',
        a: 'Ja om du har bra siffror. "35-40 LSS-ärenden parallellt" eller "150 utredningar/år" ger arbetsledaren snabbt en bild av din kapacitet och stresstålighet.',
      },
    ],
  },
}

/**
 * Default-content per kategori. Anvands fOr yrken som inte har egen entry i YRKES_CONTENT.
 * Ger en respektabel basnivá utan att kraeva manuell skrivning fOr 75 yrken.
 */
export const KATEGORI_DEFAULT_CONTENT: Record<string, Partial<YrkesContent>> = {
  vard: {
    kompetenser: {
      tekniska: [
        'Vårddokumentation enligt PDL',
        'Patientsäkerhet och avvikelseanalys',
        'Dokumentationssystem (Cosmic, Procapita, Pascal)',
        'Hygienrutiner enligt Vårdhandboken',
        'Tvärprofessionell samverkan',
        'Patientcentrerad omvårdnad',
      ],
      personliga: [
        'Empatiskt patientbemötande',
        'Stresstålighet i akuta lägen',
        'Strukturerad arbetsmetodik',
        'Sekretessmedveten',
        'Kommunikativ förmåga',
      ],
    },
    atsInfo: 'Båda mallarna är ATS-säkra. Region- och kommunala arbetsgivare använder oftast Heroma och Visma Recruit. Mallarnas standardrubriker läses korrekt och kvalifikationer som legitimation och delegeringar parsas som listpunkter.',
  },
  utbildning: {
    kompetenser: {
      tekniska: [
        'Pedagogisk planering enligt Lgr22',
        'Bedömningsstöd och formativ bedömning',
        'IKT-pedagogik (Google Classroom, Teams)',
        'Specialpedagogiska anpassningar',
        'Föräldrakommunikation',
        'Klassrumsledning',
      ],
      personliga: [
        'Strukturerad och tydlig',
        'Empatisk i mötet med elever',
        'Pedagogiskt nyfiken',
        'Tålmodig vid olikheter',
        'Lagspelare i kollegium',
      ],
    },
    atsInfo: 'Båda mallarna är ATS-säkra. Kommunala arbetsgivare för skola använder oftast Visma Recruit. Behörigheter ska skrivas exakt som de står på din lärarlegitimation.',
  },
  service: {
    kompetenser: {
      tekniska: [
        'Kassasystem och kontanthantering',
        'Servicebemötande',
        'Inventering och varuhantering',
        'Kvalitetsuppföljning',
      ],
      personliga: [
        'Servicemedveten',
        'Snabbtänkt under press',
        'Lagspelare',
        'Flexibel kring tider',
        'Lyhörd för kundbehov',
      ],
    },
    atsInfo: 'Båda mallarna är ATS-säkra. Stora detaljhandelskedjor använder Teamtailor eller egna ATS. Specifika system och varugrupper ska skrivas ut exakt eftersom de är typiska filtreringssökord.',
  },
  teknik: {
    kompetenser: {
      tekniska: [
        'Tekniska system och verktyg',
        'Problemlösning och analys',
        'Dokumentation av tekniska lösningar',
        'Kvalitetsarbete och uppföljning',
      ],
      personliga: [
        'Strukturerad och analytisk',
        'Drivande i utvecklingsarbete',
        'Kollaborativ i team',
        'Lärande och nyfiken',
      ],
    },
    atsInfo: 'Båda mallarna är ATS-säkra. Tekniska konsultbolag använder Workday eller Teamtailor. Specifika tekniska sökord (system, programmeringsspråk, certifieringar) ska skrivas ut exakt.',
  },
  ekonomi: {
    kompetenser: {
      tekniska: [
        'Bokföring och avstämningar',
        'Excel (PivotTable, formler)',
        'Affärssystem (SAP, Visma, Fortnox)',
        'Periodiseringar och rapportering',
      ],
      personliga: [
        'Noggrann och strukturerad',
        'Analytisk i sifferarbete',
        'Sekretessmedveten',
        'Pedagogisk i kontakt med icke-ekonomer',
      ],
    },
    atsInfo: 'Båda mallarna är ATS-säkra. Större bolag och redovisningsbyråer använder Workday, SAP SuccessFactors eller egna ATS. Systemnamn (Visma, Fortnox, SAP) är typiska sökord.',
  },
  'offentlig-sektor': {
    kompetenser: {
      tekniska: [
        'Förvaltningsrätt och offentlighetsprincipen',
        'Ärendehantering och diarieföring',
        'Sekretess och GDPR',
        'Utredning och rapportskrivning',
      ],
      personliga: [
        'Sakligt språkbruk',
        'Strukturerad i ärendehantering',
        'Sekretessmedveten',
        'Empatisk i klientmöten',
      ],
    },
    atsInfo: 'Båda mallarna är ATS-säkra. Kommunala arbetsgivare använder oftast Visma Recruit. Lagrum och system-namn är typiska sökord rekryterare filtrerar på.',
  },
}

// ============================================================================
// HERO_INGRESS — unik 60-80-ords ingress per yrke fOr h1-sidan
// Uppdateras lOpande baserat pa GSC-data och prestation per yrke
// ============================================================================

export const HERO_INGRESS: Record<string, string> = {
  // ===================== VÅRD (14) =====================
  'lakare':
    'Som läkare konkurrerar du om begränsade ST-tjänster där varje formulering räknas. Här hittar du två CV-mallar designade för läkarrollen: Tidlös ger en formell akademisk baseline med plats för publikationer och tjänstgöring, Klinik lyfter specialistkompetens och meritlista i en högerpanel. Båda klarar Heroma och Visma Recruit, och stödjer den struktur svenska sjukhus förväntar sig.',
  'specialistsjukskoterska':
    'Specialistsjuksköterskor söker tjänster där rekryteraren letar efter specifik kompetens inom IVA, anestesi, onkologi eller psykiatri. Tidlös ger dig en sober formell mall för CV där behörigheter och utbildning väger tyngst, medan Klinik lyfter klinisk tjänstgöring och fortbildning i en överskådlig sidopanel. Mallarna passerar regionernas rekryteringssystem och håller den struktur kliniska chefer värderar.',
  'barnmorska':
    'Som barnmorska söker du tjänster där förlossningskompetens, evidensbaserad vård och teamarbete bedöms snabbt. Tidlös ger dig en seriös, ren CV-mall som signalerar yrkeserfarenhet utan distraktioner. Klinik lyfter dina specialistkurser, instrumentbehörigheter och kliniska rotationer i en sidopanel som rekryterare på förlossnings- och kvinnokliniker skannar först.',
  'fysioterapeut':
    'Fysioterapeuter söker ofta tjänster där bedömningskompetens, behandlingsmetoder och patientgrupper avgör matchningen. Tidlös är en lugn, formell CV-mall som funkar i både offentlig och privat sektor. Klinik passar dig som vill lyfta specialistkurser (OMT, idrottsmedicin, McKenzie) och kliniska timmar i en strukturerad sidopanel där fortbildning blir tydlig.',
  'sjukskoterska':
    'Sjuksköterskor är Sveriges mest efterfrågade yrkesgrupp och konkurrensen sker ofta på vilka kliniska kompetenser och journalsystem du behärskar. Norrsken är en ren ATS-säker CV-mall som passar både slutenvård och primärvård. Vården-mallen lyfter omvårdnadskompetens, delegeringar och förflyttningsteknik visuellt så rekryterare i Heroma och TakeCare ser dem direkt.',
  'underskoterska':
    'Som undersköterska bedöms du på delegeringar, journalsystem och om du klarar geriatrik, demens eller palliativ vård. Norrsken ger dig en ren, ATS-säker CV-mall där meriter står i klartext för Heroma och Procapita. Vården-varianten lyfter omvårdnadsperspektivet och din arbetsplatshistorik i en sidopanel som visar att du orkar svensk vårds tunga vardag.',
  'vardbitrade':
    'Vårdbiträden söker tjänster inom hemtjänst, gruppboenden och äldreomsorg där pålitlighet och flexibilitet väger tungt. Norrsken ger en enkel, ATS-säker CV-mall som matchar Heroma och Visma Recruit, medan Vården-mallen lyfter daglig livsföringsstöd, ADL och språkkunskaper visuellt så rekryterare snabbt ser att du klarar arbetet utan formell legitimation.',
  'hemtjanst':
    'Inom hemtjänsten är körkort, språkkunskap och flexibel arbetstid lika viktigt som omvårdnadskompetens. Norrsken är en ren CV-mall som funkar i alla kommuners ATS, medan Vården-varianten ger plats åt körkort, B-behörighet, ADL och kommunikationsförmåga i en sidopanel som matchar exakt det som chefer i hemtjänsten letar efter.',
  'hemtjanstpersonal':
    'Hemtjänstpersonal söker arbetsgivare som värderar pålitlighet, lyhördhet och flexibel schemaläggning. Norrsken ger en strukturerad gratis-CV-mall där erfarenhet och språk syns klart för rekryterare i kommunala system. Vården-mallen lyfter brukar-perspektivet, ADL-stöd och egen körkortsbehörighet i en design som signalerar yrkesstolthet utan att bli pretentiös.',
  'personlig-assistent':
    'Personlig assistent är ett yrke där brukarens behov, kontinuitet och ditt personliga engagemang avgör hur länge ni samarbetar. Norrsken ger en ren CV-mall som passar både privat och kommunal anordnare. Vården-varianten lyfter erfarenhet med olika funktionsvariationer och språkkunskap i en sidopanel där tidigare brukar-relationer och kontinuitet blir tydliga.',
  'psykolog':
    'Som psykolog söker du tjänster där terapeutisk metod, klientgrupp och evidensbaserad praxis avgör matchning. Tidlös ger en lugn, akademiskt formell CV-mall som funkar för PTP-tjänster och leg-roller. Klinik passar dig som vill lyfta KBT, neuropsykiatriska utredningar eller specialistutbildningar i en sidopanel där handledning och certifieringar syns tydligt.',
  'kurator':
    'Kuratorer arbetar i skolan, vården eller socialtjänsten där samtalsmetoder och tvärprofessionellt samarbete väger tungt. Norrsken är en lugn ATS-säker CV-mall som funkar i alla anställningsformer. Pedagog-varianten lyfter samtalsmetodik, krisstöd och klientgrupper visuellt så rekryterare i skolan eller hälso- och sjukvården snabbt ser din psykosociala kompetens.',
  'boendestod':
    'Boendestöd kräver lyhördhet, struktur och förmåga att stötta personer med psykisk ohälsa eller funktionsvariationer i deras vardag. Norrsken ger en ren CV-mall som funkar i alla kommunala system. Vården-mallen lyfter ADL-stöd, motiverande samtal och daglig livsföring i en sidopanel där erfarenhet med olika brukargrupper blir tydlig för rekryterare.',
  'vardadministrator':
    'Som vårdadministratör är journalsystem, medicinsk terminologi och din strukturerade förmåga avgörande. Konto är en ren tabular CV-mall som signalerar precision och stödjer mono-font på datum. Konto Plus lyfter dina system (Cosmic, Melior, Pascal), volymsstatistik och certifikat i en tre-kolumns header där rekryterare på regioner direkt ser din tekniska bredd.',

  // ===================== UTBILDNING (9) =====================
  'forskollarare':
    'Förskollärare söker tjänster där pedagogiskt förhållningssätt, läroplanstolkning (Lpfö 18) och samarbete med vårdnadshavare bedöms snabbt. Norrsken är en lugn ATS-säker CV-mall som passar både kommunala och fristående förskolor. Pedagog-varianten lyfter behörigheter, legitimation och pedagogisk inriktning i en salviegrön sidopanel som signalerar yrkesstolthet och stabilitet.',
  'larare':
    'Som lärare avgörs din ansökan av legitimation, ämnesbehörigheter och pedagogiskt ledarskap. Norrsken är en strukturerad gratis-CV-mall som funkar i Visma Recruit och Skolverkets system. Pedagog-mallen lyfter behörigheter, klassrumsledning och bedömningsmetoder i en sidopanel där dina ämnen och stadier blir överskådliga för rektorer som skannar 50 ansökningar.',
  'grundskollarare':
    'Grundskollärare söker tjänster där behörighet i 1-3, 4-6 eller 7-9 är avgörande, och rektorer letar efter både pedagogisk skicklighet och lugn närvaro. Norrsken är en ren CV-mall som funkar i alla kommunala ATS. Pedagog-varianten lyfter ämnesbehörigheter, mentorskap och förmåga att skapa trygga klassrum i en sidopanel som matchar Skolverkets terminologi.',
  'specialpedagog':
    'Specialpedagoger söker tjänster där handledning, åtgärdsprogram och samarbete med EHT bedöms tungt. Norrsken är en strukturerad gratis-CV-mall som signalerar saklighet. Pedagog-varianten lyfter specialpedagogisk examen, NPF-kompetens och anpassningar i en sidopanel där dina certifieringar och handledningstimmar blir tydliga för rektorer och elevhälsa.',
  'barnskotare':
    'Barnskötare arbetar nära förskollärare och behöver visa både omsorgskompetens och förståelse för läroplanen. Norrsken är en enkel ATS-säker CV-mall som passar både kommunala och fristående förskolor. Pedagog-mallen lyfter erfarenhet med olika åldersgrupper, värdegrundsarbete och språkutveckling i en lugn pedagogisk design.',
  'elevassistent':
    'Som elevassistent stöttar du elever med särskilda behov och bedöms på erfarenhet, lyhördhet och din förmåga att samarbeta med lärare och elevhälsa. Norrsken är en ren CV-mall som matchar skolornas ATS. Pedagog-varianten lyfter NPF-kunskap, anpassningar och tidigare elev-möten i en sidopanel där din handlingskraft i klassrummet blir tydlig.',
  'fritidspedagog':
    'Fritidspedagoger jobbar i skolans helhet och behöver visa både pedagogisk grund och förmåga att leda utomhuspedagogik och rastaktiviteter. Norrsken är en strukturerad gratis-mall som funkar i kommunala system. Pedagog-mallen lyfter fritidshemspedagogik, samarbete med lärare och planering av temaveckor i en lugn sidopanel som matchar skolans kultur.',
  'fritidsledare':
    'Fritidsledare arbetar med ungdomar i fritidsgårdar, fältarbete och förebyggande verksamhet där relationsbyggande väger tyngst. Norrsken ger en ren CV-mall som funkar i kommunala ATS. Pedagog-varianten lyfter erfarenhet med olika ungdomsgrupper, gruppdynamik och samarbete med skola och socialtjänst i en sidopanel som visar din pedagogiska bredd.',
  'student':
    'Som student söker du sommarjobb, traineeplats eller första anställningen där rekryterare ofta saknar konkret erfarenhet att gå på. Student är en optimerad CV-mall där utbildning ligger först, projekt och engagemang får plats. Student Plus lyfter drömjobbet i en eyebrow, ger plats för LinkedIn och har en serif-design som ger statement utan att verka för formellt.',

  // ===================== SERVICE — butik/frontline (8+1) =====================
  'butiksbitrade':
    'Butiksbiträden söker tjänster där servicekänsla, kassasystem-vana och förmåga att jobba i tempo värderas högst. Disk är en energisk ATS-säker CV-mall som lyfter försäljningsresultat och kassasystem som Sitoo, Iiko och NCR. Disk Plus ger dig en magazine-känsla med foto-banner och customer-voice-blockquote som signalerar att du investerar i din ansökan.',
  'butikssaljare':
    'Som butikssäljare bedöms du på säljsiffror, kundbemötande och din förmåga att stänga affärer i butiksmiljö. Disk lyfter konkreta resultat (omsättning, snittnota, mersälj) i en banner överst på CV:t. Disk Plus passar dig som söker chefsroller eller flagship-butiker där visuell signal är värd något — foto-banner och customer-voice-block ger en helt annan tyngd.',
  'butikschef':
    'Butikschefer söker roller där P&L-ansvar, personalledning och varumärkesvärden bedöms tillsammans. Disk ger en stark gratis-baseline för butiksprofilen. Disk Plus är gjord för dig som vill signalera ledarskap visuellt: foto-banner, magazine-rubriker och en sidopanel för customer-voice-citat ger en design som matchar premium-retail där förstaintrycket räknas.',
  'kassorska':
    'Som kassörska söker du tjänster där snabbhet, noggrannhet och kundbemötande är de tre stora bedömningspunkterna. Disk är en kompakt ATS-säker CV-mall där kassasystem-vana och servicekänsla lyfts överst. Disk Plus ger plats för foto och customer-voice som passar specialty-butiker, hotellreception eller premium-retail där personlig touch värderas mer än anonymitet.',
  'kundtjanstmedarbetare':
    'Kundtjänstmedarbetare bedöms på språk, ärendehanteringssystem (Zendesk, Salesforce) och förmågan att lösa problem i samtal eller chatt. Disk lyfter konkreta volymer (samtal per dag, NPS, lösningsgrad) i en kompakt ATS-säker design. Disk Plus passar dig som söker mer kvalificerade kundtjänstroller där foto och personlig touch ger förtroende.',
  'kundtjanst':
    'Som kundtjänstmedarbetare avgörs din ansökan av språk, system och hur du hanterar arga kunder lugnt. Disk är en kompakt CV-mall där system och resultat lyfts i en banner överst. Disk Plus signalerar mer professionalism med foto-banner och customer-voice — passar dig som söker B2B-kundtjänst eller account-management-roller där relationsbyggande väger tungt.',
  'hotellvard':
    'Hotellvärdar bedöms på språk, multitasking och hur du hanterar både check-in-rusning och svåra gäster utan att tappa charmen. Disk är en lugn gratis-CV-mall där PMS-system, språk och servicekänsla lyfts. Disk Plus är ofta starkare för hotellbranschen där foto är norm — magazine-känslan i designen matchar premium-hotell-segmentet och boutique-kedjor.',
  'receptionist':
    'Receptionister är ofta ansiktet utåt och bedöms på språk, system-vana och hur du hanterar både telefon, besökare och back-office samtidigt. Disk lyfter PBX-system, språk och multitasking i en kompakt CV-design. Disk Plus passar receptionsroller på advokat-, läkar- och tech-bolag där foto är förväntat och visuell signal blir en del av varumärket.',
  'kundradgivare':
    'Som kundrådgivare på bank eller finansinstitut bedöms du på licenser (SwedSec), produktkunskap och din förmåga att bygga långa kundrelationer. Norrsken är en lugn formell CV-mall som matchar branschens stil. Norrsken Plus lyfter LinkedIn, en personlig profil-blockquote och foto-banner med gradient-ring som signalerar att du investerar i ditt personliga varumärke.',

  // ===================== SERVICE — lager/logistik (9) =====================
  'lagerarbetare':
    'Lagerarbetare bedöms först på truck-behörigheter, körkort och vilka WMS-system du behärskar. Logistik är en industriell ATS-säker CV-mall där behörigheter och körkort ligger i ett block direkt efter rubriken. Logistik Plus ger dig ett mörkt grafit-band överst, cyan-ringat foto och tabellär arbetslivshistorik som passar dig som söker arbetsledar- eller chefroller på logistikcenter.',
  'truckforare':
    'Som truckförare avgör behörigheter (A, B, C, D), TLP, ADR och dina år med olika trucktyper hela ansökan. Logistik lyfter alla certifikat i ett tydligt block där rekryterare ser dem på 5 sekunder. Logistik Plus ger en mer professionell layout med foto och dark header som signalerar att du söker en mer kvalificerad roll än standard-pickfunktion.',
  'logistiker':
    'Logistiker söker tjänster där SAP/Manhattan/Pyramid-vana, supply-chain-förståelse och förmåga att läsa data avgör. Logistik är en industriell CV-mall där system och processkunskap lyfts. Logistik Plus passar dig som söker senior-logistiker- eller logistikchef-roller där visuell tyngd och plats för LinkedIn ger en del av förtroendet.',
  'lagerchef':
    'Lagerchefer söker roller där P&L, personal, säkerhetsarbete och processoptimering bedöms tillsammans. Logistik är en stark gratis-baseline med plats för KPI:er. Logistik Plus är designad för chefroller: dark header, cyan foto-ram och tabellär layout signalerar erfarenhet och ger samma respekt som ekonomi- och konto-mallar i CFO-segmentet.',
  'terminalarbetare':
    'Terminalarbetare bedöms på fysisk uthållighet, skiftarbete och förmåga att hantera press i högsäsong. Logistik är en kompakt CV-mall där behörigheter och skift-erfarenhet lyfts överst. Logistik Plus ger plats för LinkedIn och en mer professionell first impression om du söker arbetsledare- eller koordinator-roller på terminaler.',
  'logistikassistent':
    'Som logistikassistent bedöms du på förmåga att stötta logistiker eller chef i operativa uppgifter, datainmatning och kommunikation. Logistik är en lugn ATS-säker CV-mall som matchar branschen. Logistik Plus signalerar att du söker en utvecklingsroll mot logistiker eller koordinator där system-kunskap och proaktivitet värderas mer än volymplockning.',
  'fastighetsskotare':
    'Fastighetsskötare bedöms på allroundkunskap (VVS, el-grunder, snickeri), körkort och förmåga att lösa akuta problem hos hyresgäster. Hantverkare-mallen lyfter behörigheter, körkort och projektportfölj i en design med orange-grafit-accent. Hantverkare Plus ger plats för foto och passar dig som söker arbetsledar-roller hos bostadsbolag eller fastighetsförvaltare.',
  'servicemedarbetare':
    'Servicemedarbetare arbetar inom flera branscher där flexibilitet och servicekänsla väger tungt. Logistik är en lugn ATS-säker gratis-CV-mall som funkar för städ-, vakt- och allmänna service-roller. Logistik Plus ger en mer kvalificerad layout med foto och dark header som passar service-koordinator- eller arbetsledar-roller.',
  'lokalvardare':
    'Lokalvårdare bedöms på erfarenhet med olika lokaltyper (kontor, vård, skola), kemikaliekunskap och om du klarar storstädning eller specialarbete. Logistik är en kompakt ATS-säker CV-mall som funkar i alla städbolags ATS. Logistik Plus ger plats för LinkedIn och passar dig som söker arbetsledare-roll eller specialiserad lokalvård i vården.',

  // ===================== SERVICE — gastro (6) =====================
  'kock':
    'Kockar bedöms på kök-erfarenhet, certifikat (HACCP, livsmedelshygien) och förmåga att klara tempo i serviceläge. Stack-developer ger en oväntat ren ATS-säker CV-mall där meritlistor lyfts strukturerat. Servering är en visuellt rikare premium-mall som passar dig som söker chefroller på fine-dining-restauranger där creativ profil och meriter behöver kommuniceras tydligt.',
  'bartender':
    'Bartenders bedöms på drink-portfölj, gästkontakt och förmåga att hålla huvudet kallt i fredagsrush. Stack-developer ger en strukturerad gratis-CV-mall som funkar i alla restaurangbolags ATS. Servering är en premium-variant där foto, drink-portfölj och tidigare arbetsplatser blir visuellt tunga — passar dig som söker chefroller på cocktail-barer eller hotellbarer.',
  'konditor':
    'Konditorer söker tjänster där bakteknik, dekoration och tidsplanering i produktion bedöms. Stack-developer ger en lugn ATS-säker CV-mall där utbildning och erfarenhet lyfts. Servering passar dig som söker roller på premium-bagerier eller hotell-konditorier där portfölj och visuell estetik är en del av meritbilden.',
  'barista':
    'Baristas söker tjänster där espresso-kunskap, latte-art och mjölkrutiner avgör. Stack-developer är en kompakt gratis-CV-mall som funkar i specialty-coffee-segmentet. Servering är en premium-variant med foto och plats för portfölj — passar dig som söker chefroller på third-wave-coffee-shops eller hotellrestauranger där baristan är synlig.',
  'servitris-restaurangbitrade':
    'Servitriser och restaurangbiträden bedöms på språk, kassasystem och om du klarar tempo i en hektisk service. Stack-developer ger en ren CV-mall där erfarenhet lyfts. Servering är en premium-mall med foto och visuell tyngd som passar dig som söker positioner på finare restauranger där förstaintrycket räknas mer än bara CV-strukturen.',
  'koksbitrade':
    'Som köksbiträde stöttar du kockar i förberedelser, diskning och städning där pålitlighet och hygienarbete väger tungt. Stack-developer är en kompakt gratis-CV-mall som funkar i alla restaurangkedjors ATS. Servering ger en mer ambitiös first impression om du söker tjänster i finare restauranger eller har siktet inställt på att utvecklas till kock.',

  // ===================== SERVICE — säljare/account (3) =====================
  'saljare':
    'Som säljare bedöms du framför allt på kvantifierade resultat (omsättning, marginal, pipeline). Norrsken är en ren ATS-säker baseline där siffror får plats utan distraktion. Aurora är en premium CV-mall där en "Nyckelresultat"-panel överst lyfter dina kvantifierade siffror och en emerald-orange gradient signalerar tillväxt — passar dig som söker B2B-, key-account- eller nya marknad-roller.',
  'account-manager':
    'Account managers bedöms på portfolio, kund-renewal och förmåga att utveckla befintliga konton. Norrsken är en lugn gratis-CV-mall där kund-resultat lyfts klart. Aurora är en premium-variant med "Nyckelresultat"-panel och foto-stöd som signalerar att du investerar i ditt personliga varumärke — viktigt i roller där relationsbyggande är hela jobbet.',
  'sommarjobb':
    'Söker du ditt första sommarjobb behöver CV:t visa engagemang, lärande och pålitlighet — inte 10 års erfarenhet. Student-startup ger en ren CV-mall där utbildning, projekt och engagemang får plats. Student Plus lyfter drömjobbet i en eyebrow-pill, har plats för foto och en serif-design som ger ungdomlig statement utan att bli barnslig.',

  // ===================== TEKNIK — dev (3) =====================
  'systemutvecklare':
    'Som systemutvecklare bedöms du på stack, kommitt-historik och förmåga att leverera i team. Stack-developer är en optimerad CV-mall där tech-stack lyfts visuellt med pill-grid och cyan-accent. Stack Plus ger en cyan-ringat fyrkantigt foto, "Stack //"-banner med teknik-tags i monospace och en sidopanel för "Verktyg & övrigt" — passar senior-utvecklarroller där tech-DNA är synligt.',
  'devops-engineer':
    'DevOps-engineers söker roller där CI/CD, IaC, observability och cloud-vana avgör. Stack-developer är en ren gratis-CV-mall som lyfter teknik-stack tydligt. Stack Plus signalerar senior-status med foto, "Stack //"-pill-banner med Kubernetes, Terraform, Datadog och en sidopanel där on-call-erfarenhet och certifikat (AWS, GCP) blir visuellt tunga.',
  'it-konsult':
    'IT-konsulter bedöms på leveransbredd, kund-portfölj och hur snabbt du producerar värde i nya uppdrag. Stack-developer är en strukturerad gratis-CV-mall där projekt och stack lyfts. Stack Plus är en premium-variant där foto, LinkedIn och en kompakt sidopanel med "Verktyg & övrigt" gör en starkare first impression i konsultsegmentet där förtroende ska byggas snabbt.',

  // ===================== TEKNIK — produkt/strategi (3) =====================
  'projektledare-it':
    'IT-projektledare bedöms på metodik (Scrum, SAFe, PRINCE2), leveransbredd och förmåga att hålla scope. Linje är en strukturerad CV-mall där projekt och resultat lyfts klart. Aspekt är en bredare premium-mall med "Fokusområden"-pills där dina kärnkompetenser blir visuellt tunga och slate-blå accent signalerar trygghet — passar senior-PM-roller där tradition möter modernitet.',
  'scrum-master':
    'Scrum masters söker roller där teamfacilitering, hinder-borttagning och agile coaching bedöms. Linje är en ren gratis-CV-mall som funkar i alla tech-bolags ATS. Aspekt är en bredare premium-variant där "Fokusområden"-pills lyfter dina coaching-områden och slate-blå accent ger lugn auktoritet — passar senior-Scrum master- eller agile coach-roller.',
  'produktchef':
    'Som produktchef bedöms du på discovery, prioritering och hur du leder en roadmap mot tillväxt. Linje är en lugn ATS-säker CV-mall där kvantifierade resultat lyfts. Magasin är en premium-variant där editorial-känslan, asymmetrisk grid och plats för "tankeledare-citat" ger en visuell tyngd som passar senior-PM-roller på SaaS- och fintech-bolag.',

  // ===================== TEKNIK — industri (3) =====================
  'ingenjor':
    'Som ingenjör bedöms du på CAD-vana (SolidWorks, Catia), standarder (ISO 9001, CE, ATEX) och projektrefenser. Verkstad är en industriell ATS-säker CV-mall med grafit-accent där standarder och system lyfts. Verkstad Plus ger en blueprint-grid header, rektangulärt foto med offset-skugga och två-kolumn med "Verktygs-stack"-sidopanel som passar konsult- och senior-positioner.',
  'automationsingenior':
    'Automationsingenjörer bedöms på PLC-programmering (Siemens TIA, Beckhoff), SCADA, robotcell-integration och industristandarder. Verkstad är en lugn gratis-CV-mall där system och certifikat lyfts. Verkstad Plus signalerar en mer ambitiös ansökan med blueprint-header, foto och en strukturerad sidopanel där dina specifika system och projekt blir visuellt tydliga.',
  'konstruktor':
    'Konstruktörer söker tjänster där CAD-vana, ritningsläsning och materialkunskap avgör. Verkstad är en kompakt ATS-säker CV-mall med plats för standarder (CE, EN, ISO). Verkstad Plus är en premium-variant med blueprint-grid-bakgrund i header, rektangulärt foto och en sidopanel för verktygsstack — designvalen signalerar konstruktions-DNA utan att bli prålig.',

  // ===================== EKONOMI (6) =====================
  'ekonomiassistent':
    'Som ekonomiassistent bedöms du på system (Visma, Fortnox, SAP), avstämningar och din förmåga att stötta redovisare i bokslut. Konto är en strukturerad ATS-säker CV-mall med tabular-nums och dubbel-divider. Konto Plus ger en tre-kolumns header med snabbfakta-rad och navy-emerald gradient som signalerar att du söker en utvecklingsroll mot redovisare eller controller.',
  'administrativ-assistent':
    'Administrativa assistenter söker tjänster där system-bredd, struktur och förmåga att stötta chefer eller team avgör. Konto är en ren gratis-CV-mall där system och certifikat lyfts tabulärt. Konto Plus passar dig som söker mer kvalificerade administrativa roller (executive assistant, kontorschef) där snabbfakta-raden och visuell tyngd hjälper dig sticka ut.',
  'redovisningsekonom':
    'Redovisningsekonomer bedöms på K2/K3, momshantering, bokslut och vana med Visma/Fortnox/SAP. Konto är en mörkblå ATS-säker CV-mall där system, certifieringar (auktoriserad redovisningskonsult) och bokslutserfarenhet lyfts tabulärt. Konto Plus ger en premium first impression med tre-kolumns header och nyckeltal — passar dig som söker chef-roller på redovisningsbyråer.',
  'controller':
    'Controllers söker roller där analyskompetens, BI-vana (Power BI, Tableau, Cognos) och förmåga att översätta siffror till beslut bedöms. Konto är en mörkblå CV-mall som signalerar finans-DNA. Konto Plus ger en tre-kolumns header med nyckeltal-snabbfakta och navy-emerald gradient som passar senior-controller- eller business-controller-roller där visuell tyngd ger förtroende.',
  'ekonom':
    'Ekonomer söker tjänster där förståelse för helheten — bokföring, prognos, analys — väger tyngst. Konto är en strukturerad gratis-CV-mall med tabular-nums och mono-font på datum. Konto Plus är en premium-variant där snabbfakta lyfts överst och en navy-emerald gradient ger growth-DNA — passar dig som söker tillväxtfas-roller på SaaS- eller fintech-bolag.',
  'hr-specialist':
    'HR-specialister bedöms på arbetsrätt, kollektivavtal och vana med HRIS-system (Heroma, Visma Lön, Workday). Konto ger en ren ATS-säker CV-mall där system och utbildning lyfts. Konto Plus passar dig som söker senior-HR- eller HR-chef-roller där snabbfakta (HR-volym, organisation) blir visuellt tunga och first impression bär hela ansökan.',

  // ===================== OFFENTLIG SEKTOR (7) =====================
  'administrator':
    'Administratörer i offentlig sektor bedöms på diarieföring, ärendehantering och förvaltningsrätt. Myndighet är en konservativ navy-svartvit ATS-säker CV-mall där lagstiftning och metoder (LSS, SoL, OSL) lyfts. Myndighet Plus ger en centrerad Source Serif Pro-header med guld-accent som signalerar prestige — passar senior-administratör-roller på myndigheter.',
  'handlaggare':
    'Handläggare bedöms på ärendetyper, lagrum och förmåga att fatta korrekta beslut enligt förvaltningsrätt. Myndighet är en lugn gratis-CV-mall där §-symboler i bullets påminner om förvaltningsrätten. Myndighet Plus lyfter volymsstatistik (antal ärenden, beslut) i en blockquote och har guld-accent som matchar prestige-känslan rekryterare på myndigheter förväntar sig.',
  'lss-handlaggare':
    'LSS-handläggare arbetar med människor som har funktionsvariationer där rättssäkerhet och empati ska samexistera. Myndighet är en strukturerad gratis-CV-mall där LSS, SoL och IBIC lyfts. Myndighet Plus ger en formell prestige-känsla med Source Serif Pro-header och guld-accent — passar dig som söker mer kvalificerade ärendetyper eller chefroller inom socialförvaltning.',
  'socialsekreterare':
    'Socialsekreterare bedöms på utredning, BBIC, IBIC och förmåga att hantera komplexa familjeärenden under press. Myndighet är en konservativ ATS-säker CV-mall där lagstiftning och metoder lyfts klart. Myndighet Plus signalerar mer erfarenhet med formell serif-header, guld-accent och plats för volymsstatistik — passar dig som söker enhetschef- eller specialist-roller.',
  'kontorsassistent':
    'Kontorsassistenter söker tjänster där struktur, system-bredd och förmåga att stötta hela kontoret bedöms. Myndighet är en ren gratis-CV-mall där system och rutiner lyfts klart. Myndighet Plus passar dig som söker executive-assistant- eller kontorschef-roller där visuell tyngd, plats för LinkedIn och formell serif-header ger en starkare first impression.',
  'chef':
    'Som chef bedöms du på personalledning, P&L-ansvar och din förmåga att leda förändring. Tidlös är en formell ATS-säker CV-mall som signalerar tradition. Tidlös Plus ger en Garamond serif body, foto med burgundy-ram och "— § —"-ornament som signalerar prestige utan att bli prålig — passar senior-chef- eller styrelse-roller där förstaintrycket räknas mer än layout-trender.',
  'enhetschef':
    'Enhetschefer söker roller där personalledning, budget och kvalitetsarbete bedöms tillsammans. Tidlös är en lugn formell CV-mall som matchar offentlig sektors förväntningar. Tidlös Plus ger Garamond serif, burgundy-foto-ram och dubbel-linje under header som signalerar att du söker mer kvalificerade enhetschef- eller verksamhetschef-roller där prestige väger tungt.',
  'projektledare':
    'Projektledare bedöms på metodik, leveransbredd och förmåga att hålla scope och budget. Norrsken är en ren ATS-säker CV-mall där projekt och resultat lyfts klart. Norrsken Plus ger en gradient-ring runt foto, gradient-text-clip på namnet och en personlig profil-blockquote i orange tint — passar senior-PM-roller där visuell tyngd kompletterar substansen.',
  'teamledare':
    'Teamledare söker roller där personalledning, coachning och operativ leverans bedöms. Norrsken är en lugn gratis-CV-mall där erfarenhet och resultat lyfts. Norrsken Plus signalerar mer erfarenhet med gradient-text-clip på namnet, foto med orange-magenta gradient-ring och en personlig profil-blockquote som ger karaktär utan att bli oseriöst.',
}

