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
    kompetenser: {
      tekniska: [
        'Medicinsk delegering (insulin, PEG, subkutana injektioner)',
        'Vårdplanering enligt VIPS-modell',
        'Journalsystem (Cosmic, TakeCare, Pascal, NPÖ)',
        'Akut omhändertagande och triage',
        'Patientsäkerhet och kvalitetsregister',
        'A-HLR och D-HLR',
        'Sårbehandling och PVK-skötsel',
        'Smärtskattning och smärtbehandling',
      ],
      personliga: [
        'Empatiskt patientbemötande',
        'Stresstålig i akuta situationer',
        'Strukturerad och prioritetsskicklig',
        'Tvärprofessionellt samarbete',
        'Pedagogisk i patient- och anhörigkommunikation',
      ],
    },
    profilExempel: 'Legitimerad sjuksköterska med 6 års klinisk erfarenhet inom internmedicin och akutsjukvård. Hanterar 8-10 patienter per pass med fokus på multisjuka och kardiella tillstånd. Specialistutbildning inom akutsjukvård 2024 och handledare för 4 sjuksköterskestudenter per termin.',
    profilTips: 'Skriv legitimationsstatus, år av erfarenhet och primärt verksamhetsområde i öppningsraden. Andra meningen kvantifierar vårdtyngd (patienter/pass). Tredje meningen lyfter specialiseringar, handledning eller utvecklingsuppdrag.',
    rekryterarTipsen: [
      {
        rubrik: 'Vårdtyngd och patientvolymer',
        text: 'Hur många patienter ansvarade du för per pass? På IVA är det 1-2, på vårdavdelning 6-8. Ange det. Vårdtyngd är en hårdvaluta som chefer förstår direkt.',
      },
      {
        rubrik: 'Specialistutbildning är CV-avgörande',
        text: 'Anestesi, akutsjukvård, intensivvård, distrikt, psykiatri. Specialistsjuksköterskor får upp till 30% högre lön och prioriteras vid rekrytering. Specifik specialitet öppnar specifika tjänster.',
      },
      {
        rubrik: 'Dokumentationssystem och fackliga uppdrag',
        text: 'Cosmic, TakeCare, Melior, NCS Cross. Nämn dokumentationssystem du använt. Eventuella fackliga uppdrag (skyddsombud, Vårdförbundet-aktiv) är meriterande för seniora roller.',
      },
    ],
    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'Legitimationsstatus, år av erfarenhet, primärt vårdområde. Eventuella specialistutbildningar.' },
      { sektion: 'Erfarenhet', tips: 'Klinik och avdelning + tidsperiod + vårdtyngd (patienter/pass). Vidareutbildningar som påverkat din tjänstgöring.' },
      { sektion: 'Utbildning', tips: 'Sjuksköterskeexamen + lärosäte + år. Specialistutbildningar som egna rader. Vidareutbildningar (CMP, ALS, A-HLR) som certifikat.' },
      { sektion: 'Kompetenser', tips: 'Dokumentationssystem, kliniska metoder, behandlingar du behärskar. Var konkret: "PVK-sättning, EKG-tolkning" istället för "kliniska färdigheter".' },
    ],
    checklista: [
      'Sjuksköterskeexamen och legitimation från Socialstyrelsen',
      'Specialistutbildning (om någon) med år',
      'Vidareutbildningar (CMP, ALS, A-HLR, ATLS) med utgångsdatum',
      'Erfarenhet av specifika dokumentationssystem',
      'Klinisk erfarenhet med specifika patientgrupper',
      'Forskningsmeriter eller utvecklingsprojekt',
      'Eventuell handledarutbildning',
    ],
    atsInfo: 'Ja, både Norrsken (gratis) och Vården-mallen (premium) är ATS-säkra. Region- och kommunala arbetsgivare använder oftast Heroma eller Visma Recruit. Båda läser "Arbetslivserfarenhet" och "Utbildning" korrekt. Lista vidareutbildningar med utgångsdatum så filtersystem kan flagga aktiva certifieringar.',
    faqItems: [
      {
        q: 'Hur skiljer sig CV för sjuksköterska från undersköterska?',
        a: 'Sjuksköterska har akademisk grundutbildning och legitimation som måste anges precist (datum, registreringsnummer). Specialistutbildningar och vetenskapliga uppdrag är CV-relevanta. För undersköterska är medicinska delegeringar centrala — för sjuksköterska är det egen ordinationsrätt och självständigt arbete.',
      },
      {
        q: 'Ska jag nämna nattjour och övertid?',
        a: 'Ja om du är beredd till det. Många avdelningar prioriterar sökande som tar både dag, kväll, natt och helg. Skriv tydligt: "Tillgänglig för rotationsschema inkl natt och helg".',
      },
      {
        q: 'Hur långt ska ett sjuksköterske-CV vara?',
        a: 'Grundutbildade 1-1.5 sidor. Specialistsjuksköterskor med flera års erfarenhet 2 sidor. Forskande eller disputerade sjuksköterskor 2-3 sidor. Vården accepterar längre CV än andra branscher.',
      },
    ],
  },

  'underskoterska': {
    kompetenser: {
      tekniska: [
        'ADL-stöd och personcentrerad omvårdnad',
        'Medicinsk delegering (insulin, PEG, subkutana)',
        'Demensvård och BPSD-hantering',
        'Dokumentation i Cosmic och Procapita',
        'Akta Ryggen-certifierad förflyttningsteknik',
        'Basala hygienrutiner',
        'Sårvård och inkontinensvård',
        'Palliativ omvårdnad',
      ],
      personliga: [
        'Empati och relationsskapande',
        'Stresstålig i akuta situationer',
        'Tvärprofessionellt samarbete',
        'Lyhördhet och kommunikation',
        'Initiativförmåga och problemlösning',
      ],
    },
    profilExempel: 'Erfaren undersköterska med 5+ års erfarenhet av personcentrerad vård inom geriatrik och hemtjänst. Gedigen kompetens i ADL-stöd, demensvård och medicinsk delegering (insulin, PEG, subkutana). Stresstålig lagspelare som skapar trygghet för patienter genom empati, kommunikation och evidensbaserad omvårdnad.',
    profilTips: 'Antal år, primärt verksamhetsområde och din kärnkompetens i öppningen. Andra meningen specificerar dina delegeringar och specialiseringar. Tredje meningen lyfter värderingar och arbetssätt.',
    rekryterarTipsen: [
      {
        rubrik: 'Medicinsk delegering är CV-kritiskt',
        text: 'Vilka delegeringar har du genomgått? Insulin, PEG-sondmatning, subkutana injektioner, blodtrycksmätning. Lista varje delegering eftersom det avgör vilka tjänster du kan söka.',
      },
      {
        rubrik: 'Specialiseringar gör skillnad',
        text: 'Demensvård (BPSD), palliativ vård, geriatrik, hemtjänst, akutvård. Varje specialisering öppnar olika tjänster. Lyft den du har mest erfarenhet av i din titel och sammanfattning.',
      },
      {
        rubrik: 'System du behärskar',
        text: 'Cosmic, Procapita, Pascal, NPÖ. Nämn de dokumentationssystem du arbetat med. Det är ATS-keywords som rekryterare filtrerar på.',
      },
    ],
    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'År av erfarenhet, primärt vårdområde, dina delegeringar och certifikat.' },
      { sektion: 'Erfarenhet', tips: 'Arbetsplats + tidsperiod + patientantal/dag. Konkreta åtgärder och resultat. Använd siffror där det går (15% minskade fall, 20+ patienter).' },
      { sektion: 'Utbildning', tips: 'Vård- och omsorgsprogrammet eller motsvarande vuxenutbildning. Aktuella delegeringar med datum.' },
      { sektion: 'Kompetenser', tips: 'Dokumentationssystem, behandlingar, certifikat. Var specifik om vilka delegeringar du har aktiva.' },
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
    atsInfo: 'Ja, både Norrsken och Vården-mallen är ATS-säkra. Kommunala arbetsgivare använder oftast Visma Recruit och Heroma. Skriv utbildning och delegeringar som listor med tydliga radbrytningar så systemet kan parsa varje punkt.',
    faqItems: [
      {
        q: 'Vad är viktigast på ett undersköterska-CV?',
        a: 'Tre saker. Utbildning från vård- och omsorgsprogrammet (eller motsvarande vuxenutbildning). Aktiva medicinska delegeringar. Konkret klinisk erfarenhet med arbetsplatser. Allt det visar Vården-mallen tydligt.',
      },
      {
        q: 'Ska jag ha med foto på undersköterska-CV?',
        a: 'Inte obligatoriskt men vanligt i Sverige. Vården-mallen har stöd för foto i sidopanelen. Använd ett professionellt bröstbild om du har en. ATS läser ditt CV ändå eftersom mallen är ATS-säker.',
      },
      {
        q: 'Hur lyfter jag mina språkkunskaper på CV:t?',
        a: 'Språk är värdefullt i vården eftersom du möter patienter med olika bakgrund. Lista dem i sidopanelen med nivå (modersmål, flytande, konversation). Arabiska, persiska, somaliska och tigrinja är efterfrågade i många regioner.',
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
    kompetenser: {
      tekniska: [
        'Lärarlegitimation åk 1-9 (specifika ämnen)',
        'Lgr22 och kunskapskrav',
        'Bedömningsstöd och formativ bedömning',
        'Klassrumsledning enligt Hattie/Marzano',
        'IKT-pedagogik (Google Classroom, Teams)',
        'Specialpedagogiska metoder (NPF-anpassning)',
        'Föräldrakommunikation via Schoolsoft/Vklass',
      ],
      personliga: [
        'Tydlig och strukturerad i klassrummet',
        'Empatisk och relationsskapande',
        'Pedagogisk i kollegial samverkan',
        'Tålmodig med olikheter',
        'Drivkraft för elevutveckling',
      ],
    },
    profilExempel: 'Behörig grundskollärare åk 4-6 med 7 års erfarenhet från kommunal grundskola. Ämnesbehörighet i svenska, matematik och NO. 95% av eleverna nådde målen i åk 6 svenska under läsåret 2024 efter implementering av strukturerad läsförståelseundervisning enligt Bornholmsmodellen.',
    profilTips: 'Behörighet (åldersgrupp + ämnen), år av erfarenhet, kommunal eller fristående huvudman. Konkret elevresultat eller utvecklingsprojekt som differentierar dig.',
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
    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'Behörighet (åldersgrupp + ämnen), år av erfarenhet, primär huvudman, dina resultat eller specialiseringar.' },
      { sektion: 'Erfarenhet', tips: 'Skola + huvudman + tidsperiod + årskurs. Konkreta uppdrag (mentorskap, ämneslagsledare, IT-pedagog).' },
      { sektion: 'Utbildning', tips: 'Lärarexamen + lärosäte + ämneskombination. VFU-skolor om relevanta. Vidareutbildningar (NPF-kurs, lågaffektivt bemötande).' },
      { sektion: 'Kompetenser', tips: 'Pedagogiska metoder, IKT-verktyg, specialpedagogiska anpassningar du behärskar.' },
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
    atsInfo: 'Ja, både Norrsken (gratis) och Pedagog-mallen (premium) är ATS-säkra. Kommuner använder oftast Visma Recruit för lärartjänster. Behörigheter ska skrivas precis som de står på din lärarlegitimation, inklusive åldersgrupper och ämnen — det är exakta sökord rekryterare filtrerar på.',
    faqItems: [
      {
        q: 'Hur skiljer sig CV för lärare från andra yrken?',
        a: 'Behörigheter är centrala och måste vara absolut korrekta. Ange åldersgrupp + ämne enligt din legitimation. Klassrumsstorlek och elevprofil är CV-stoff som inte finns i andra yrken. Pedagogiska metoder du behärskar väger tyngre än generiska "kommunikationsförmåga".',
      },
      {
        q: 'Ska jag nämna kommunala upphandlingsavtal?',
        a: 'Bara om du sökt en specifik kommun där det är avgörande. Generellt fokus på din pedagogiska identitet, dina metoder, dina resultat med elever. Det är vad rektorer värderar mest.',
      },
      {
        q: 'Hur lyfter jag erfarenhet av elever med särskilt stöd?',
        a: 'Skriv konkret om typ av stöd (NPF, dyslexi, språkstöd) och hur du arbetat. "Anpassade undervisning för 4 elever med autism, 100% nådde kunskapskraven i åk 6" säger mer än "har erfarenhet av elever med särskilt stöd".',
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
    kompetenser: {
      tekniska: [
        'TypeScript/JavaScript (Node.js, React, Next.js)',
        'Backend (REST, GraphQL, gRPC)',
        'Databaser (PostgreSQL, MongoDB, Redis)',
        'Cloud (AWS, GCP, Azure)',
        'CI/CD (GitHub Actions, GitLab CI, Jenkins)',
        'Containerization (Docker, Kubernetes)',
        'Testning (Jest, Vitest, Playwright, Cypress)',
        'Versionhantering (Git, GitHub Flow, GitFlow)',
      ],
      personliga: [
        'Problemlösningsfokuserad',
        'Strukturerad i kodorganisation',
        'Kollaborativ i kodgranskning',
        'Driven av kvalitet',
        'Lärande och kunskapsdelande',
      ],
    },
    profilExempel: 'Senior fullstack-utvecklare med 8 års erfarenhet av TypeScript, React och Node.js. Byggt och underhållit produktionsmiljö för fintech-applikation med 50K+ aktiva användare och 99.95% uptime. Arbetar enligt trunk-based development i AWS-baserad CI/CD-miljö med automatiserad e2e-testning.',
    profilTips: 'Senioritet, primär stack, år av erfarenhet, branschen du arbetat i. Konkret resultat (uptime, användarvolym, prestanda) eller arbetssätt som differentierar dig.',
    rekryterarTipsen: [
      {
        rubrik: 'Stack-specifika sökord avgör matchning',
        text: 'CV-screeners (oftast tekniska rekryterare på konsultbolag) söker exakta termer. "TypeScript", "React", "Next.js" — inte "JavaScript-utveckling". Lista de specifika frameworks och versioner du arbetat med.',
      },
      {
        rubrik: 'Bygg- vs underhåll-erfarenhet',
        text: 'Har du byggt nya system från grunden eller underhållit existerande? Båda värderas men olika. Senior arkitektur-roller söker bygg-från-grunden, mid-level söker stabil underhållsförmåga. Var tydlig.',
      },
      {
        rubrik: 'Mätbara prestandaresultat',
        text: 'Refaktoreringsresultat (50% snabbare), uptime-siffror (99.95%), eller användarvolym (50K samtidiga sessioner). Konkreta siffror gör utvecklare till seniora kandidater i CTO-ögon.',
      },
    ],
    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'Senioritet, primär stack, år av erfarenhet, bransch. Specialitet (frontend-arkitektur, backend-skalning, devops).' },
      { sektion: 'Erfarenhet', tips: 'Bolag + roll + tidsperiod + tech-stack + dina bidrag (architecture decisions, refaktorering, prestanda-vinster).' },
      { sektion: 'Utbildning', tips: 'Examen + lärosäte. Kortare bootcamps eller online-cert räknas (AWS Certified, Kubernetes CKA).' },
      { sektion: 'Kompetenser', tips: 'Strukturera i grupper: Languages, Frameworks, Tools, Cloud. Lista versioner där relevant.' },
    ],
    checklista: [
      'Primär programmeringsstack och senioritet',
      'Cloud-erfarenhet (AWS, GCP, Azure)',
      'CI/CD-pipeline-erfarenhet',
      'Specifika databaser du behärskar',
      'Testningsmetoder (unit, integration, e2e)',
      'Open source-bidrag eller GitHub-portfolio',
      'Eventuella certifieringar (AWS, K8s, Terraform)',
    ],
    atsInfo: 'Ja, Stack-developer-mallen är ATS-säker och optimerad för tekniska screeners. Konsultbolag som CGI, Sopra Steria och Knowit använder oftast Workday eller Teamtailor. Specifika tech-keywords (TypeScript, React, AWS) är CV-kritiska — skriv ut dem som listpunkter, inte i löpande text.',
    faqItems: [
      {
        q: 'Ska jag inkludera personliga sidoprojekt på CV:t?',
        a: 'Ja om de är relevanta. GitHub-repos med 50+ stjärnor, open source-bidrag, eller en portfolio-app som visar din arkitekturtänkande är CV-värt. Hobby-projekt utan commit-historia eller produktion sänker mer än lyfter.',
      },
      {
        q: 'Hur långt ska ett utvecklar-CV vara?',
        a: 'Junior 0-3 år: 1 sida. Mid-level: 1.5 sidor. Senior eller staff: 2 sidor max. Cv-screeners hinner inte läsa längre. Lyft de senaste 5-7 åren tydligast och kondensera tidigare.',
      },
      {
        q: 'Behöver jag formell examen för utvecklar-jobb?',
        a: 'Inte alltid. Många bolag (särskilt scale-ups och konsultbolag) värderar portfolio och GitHub över examen. Men för seniora roller på regulatoriskt tunga branscher (fintech, healthcare) är teknisk högskoleexamen ofta krav.',
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

