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
    seoIntro:
      'Som säljare bedöms du på en sak framför andra: dina siffror. Säljchefer på SaaS-bolag, traditionell B2B och konsumentvarubranschen läser CV:n med ögonen på pipeline-storlek, måluppfyllelse och tillväxt. Ett välskrivet CV avgör om du blir kallad till intervju på ett bolag där du kan dubbla din lön, eller fastnar i samma mid-market-segment du försökt lämna i flera år.\n\nVår mall för säljare lyfter kvantifierade resultat (ARR-tillväxt, måluppfyllelse, snitt-affärsstorlek) som första visuella element. Vi har strukturerat erfarenhetssektionen så att bolag, segment och din specifika ansvarsbudget syns direkt med konkreta procentsiffror. Det betyder att säljchefer kan bedöma din kapacitet utan att behöva läsa hela CV:t.\n\nKonkret innehåll vi rekommenderar: säljroll och senioritet (BDR, AE, KAM, Sales Manager), branscher du sålt till (SaaS, fintech, industri, healthtech), CRM-system (Salesforce, HubSpot, Pipedrive, Lime), säljmetodiker (MEDDIC, BANT, Challenger, SPIN), måluppfyllelse i procent per år, snitt-affärsstorlek och säljcykellängd, samt eventuella säljstack-verktyg (Apollo, Outreach, Gong, ZoomInfo).\n\nNedan hittar du två CV-mallar designade för säljarrollen, ett färdigt CV-exempel att utgå från, och konkreta tips på vad säljchefer på SaaS-bolag, traditionella B2B-bolag och account-management-tunga organisationer faktiskt letar efter. Ladda ner mallen gratis och anpassa efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'TrendingUp',
        title: 'Kvantifiera allt med siffror',
        description: 'Säljchefer slänger CV:n utan siffror. Skriv "ökade ARR 24% från 8M till 9,9M genom upselling till 12 nyckelkunder" istället för "ansvarig för storkundsförsäljning". Konkreta procent och absoluta tal är hela poängen.',
      },
      {
        icon: 'Target',
        title: 'Måluppfyllelse per år',
        description: '"130% av mål 2 år i rad" säger mer än "uppfyllde säljmål". Lista varje år med procent. Säljchefer letar efter konsekvent prestation, inte enstaka topprestationer som kan vara tur.',
      },
      {
        icon: 'CheckCircle',
        title: 'Säljmetoder du behärskar',
        description: 'MEDDIC, BANT, Challenger Sale, SPIN, Solution Selling. Nämn metoder du faktiskt arbetar efter. ATS-system på SaaS-bolag som Teamtailor och Manatal filtrerar exakta termer från jobbannonsen.',
      },
      {
        icon: 'Briefcase',
        title: 'CRM-system och säljstack',
        description: 'Salesforce dominerar på enterprise-bolag. HubSpot vanligast på scale-ups. Pipedrive och Lime på mindre B2B. Skriv ut systemnamnen plus säljstack-verktyg (Apollo, Outreach, Gong) som ATS-keywords.',
      },
      {
        icon: 'FileText',
        title: 'Affärsstorlek och säljcykel',
        description: 'Snittstorlek på dina stängda affärer (50K transaktion, 450K SaaS-årsavtal, 5M enterprise) och cykellängd (3 veckor, 6 månader, 18 månader). Säljchefer matchar din erfarenhet mot deras pipeline-profil.',
      },
      {
        icon: 'Award',
        title: 'Branschspecialisering',
        description: 'Att ha sålt till specifika vertikaler (fintech, healthtech, retail) är meriterande eftersom säljcyklar och beslutsprocesser skiljer sig. Lyft de 2-3 vertikaler där du har djupast erfarenhet och kontaktnät.',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'Nyckelresultat överst i sidopanelen',
        description: 'Vår premium-mall Aurora har en dedikerad "Nyckelresultat"-panel där tre kvantifierade siffror lyfts visuellt. Säljchefer kan bedöma din kapacitet på fem sekunder utan att läsa hela CV:t.',
      },
      {
        title: 'Erfarenhet med procent-fokus',
        description: 'Mallen separerar bolag, roll och måluppfyllelse så procentsiffror syns direkt. Du kan visa flera års konsekvent prestation utan att meriter konkurrerar om samma yta.',
      },
      {
        title: 'Eget block för CRM och säljstack',
        description: 'Salesforce, HubSpot, Lime, Apollo, Outreach. Säljstack-block separerar systemen från generiska kompetenser. Säljchefer letar specifikt efter system de redan kör i sin organisation.',
      },
      {
        title: 'Emerald-orange gradient signalerar tillväxt',
        description: 'Vi har valt en gradient som visuellt kopplar till säljbranschen utan att bli aggressiv. Subtila accenter på siffror och resultat-block utan att kompromissa med ATS-läsbarhet.',
      },
      {
        title: 'Plats för säljmetodik och certifieringar',
        description: 'MEDDIC-certifiering, Challenger Academy, Salesforce Trailhead. Eget block för metoder och certifikat så bevisad kompetens syns direkt utan att blanda med generisk utbildning.',
      },
      {
        title: 'Kompakt typografi för senior-roller',
        description: 'Seniora säljare har ofta 8-15 års erfarenhet att rymma. Vi använder kompakt typografi för att få plats med fler bolag och resultat utan att verka cramped.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Prospektering och nykundsbearbetning',
        punkter: [
          'Identifiera och kvalificera prospekt enligt ICP (Ideal Customer Profile)',
          'Genomföra cold outreach via mail, LinkedIn och telefon',
          'Använda säljstack-verktyg (Apollo, Outreach, ZoomInfo) för leadgenerering',
          'Kvalificera leads enligt BANT, MEDDIC eller motsvarande ramverk',
        ],
      },
      {
        rubrik: 'Pipeline och affärshantering',
        punkter: [
          'Bygga och underhålla pipeline i Salesforce, HubSpot eller Pipedrive',
          'Forecasta affärsutfall per månad och kvartal till säljledning',
          'Driva affärer genom upptäckt, demonstration, förhandling och stängning',
          'Hantera flera parallella affärer med olika säljcykler och beslutsprocesser',
        ],
      },
      {
        rubrik: 'Demo, presentation och förhandling',
        punkter: [
          'Genomföra produktdemos och pitcha värdeerbjudande till olika roller',
          'Förhandla pris, villkor och avtalstid med inköpare och beslutsfattare',
          'Hantera invändningar och konkurrentjämförelser med faktiska argument',
          'Skriva tjänsteavtal och hantera juridiska detaljer i samverkan med legal',
        ],
      },
      {
        rubrik: 'Account management och upselling',
        punkter: [
          'Bygga långsiktiga relationer med befintliga kunder för retention',
          'Identifiera upselling- och cross-selling-möjligheter inom kontot',
          'Genomföra QBR (Quarterly Business Review) med strategiska kunder',
          'Samverka med Customer Success för att säkra renewals och tillväxt',
        ],
      },
      {
        rubrik: 'Säljanalys och rapportering',
        punkter: [
          'Analysera säljdata och identifiera trender i konvertering och cykellängd',
          'Rapportera till säljledning om pipeline, prognoser och risker',
          'Bidra till säljstrategi genom insikt om kundbehov och konkurrensläge',
          'Mentor för junior-säljare och bidra till säljmetodik-utveckling',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Säljroller och nivåer',
        termer: [
          { term: 'BDR/SDR', forklaring: 'Business/Sales Development Representative, prospektering och kvalificering av leads.' },
          { term: 'AE', forklaring: 'Account Executive, ansvarar för affärscykel från demo till stängning.' },
          { term: 'KAM', forklaring: 'Key Account Manager, ansvarar för strategiska befintliga kunder.' },
          { term: 'Sales Manager', forklaring: 'Säljchef med eget team av AEs eller KAMs och budgetansvar.' },
          { term: 'Head of Sales', forklaring: 'Senior säljchef med ansvar för hela säljorganisationen, ofta i ledningsgrupp.' },
          { term: 'CRO', forklaring: 'Chief Revenue Officer, högsta säljansvariga med både sales, marketing och customer success.' },
        ],
      },
      {
        kategori: 'Säljmetodiker',
        termer: [
          { term: 'MEDDIC', forklaring: 'Metrics, Economic buyer, Decision criteria, Decision process, Identify pain, Champion. B2B-kvalificering.' },
          { term: 'BANT', forklaring: 'Budget, Authority, Need, Timeline. Klassisk leadkvalificeringsmetod.' },
          { term: 'Challenger Sale', forklaring: 'Säljmetod där du utmanar kundens nuvarande tänkesätt med insikter.' },
          { term: 'SPIN Selling', forklaring: 'Situation, Problem, Implication, Need-payoff. Frågedriven säljmetod.' },
          { term: 'Solution Selling', forklaring: 'Säljmetod fokuserad på att lösa kundens specifika problem snarare än att pitcha produkter.' },
          { term: 'ABM', forklaring: 'Account-Based Marketing, fokuserad bearbetning av specifika strategiska konton.' },
        ],
      },
      {
        kategori: 'CRM och säljstack',
        termer: [
          { term: 'Salesforce', forklaring: 'Marknadsledande CRM, dominerar enterprise och stora SaaS-bolag.' },
          { term: 'HubSpot', forklaring: 'CRM och marketing automation, populärt på scale-ups och mid-market.' },
          { term: 'Pipedrive', forklaring: 'Svenskt CRM, vanligt på mindre B2B-bolag och konsultverksamheter.' },
          { term: 'Lime CRM', forklaring: 'Svenskt CRM med stark närvaro på den nordiska marknaden.' },
          { term: 'Apollo', forklaring: 'Säljstack-verktyg för prospektering med inbyggd databas av kontakter.' },
          { term: 'Outreach', forklaring: 'Säljengagemang-plattform för att automatisera och spåra outreach.' },
          { term: 'Gong', forklaring: 'Conversation intelligence, analyserar säljsamtal för att förbättra prestanda.' },
        ],
      },
      {
        kategori: 'KPI:er och säljstatistik',
        termer: [
          { term: 'ARR', forklaring: 'Annual Recurring Revenue, årligt återkommande intäkter från SaaS- eller prenumerationsavtal.' },
          { term: 'MRR', forklaring: 'Monthly Recurring Revenue, månadsversion av ARR.' },
          { term: 'ACV', forklaring: 'Annual Contract Value, värdet av ett enskilt avtal på årsbasis.' },
          { term: 'Win rate', forklaring: 'Andel av kvalificerade affärer som faktiskt stängs, normalt 20-30% i B2B.' },
          { term: 'Sales cycle', forklaring: 'Tid från första kontakt till stängd affär, varierar från veckor till år.' },
          { term: 'Pipeline coverage', forklaring: 'Förhållande mellan pipeline och kvartalsmål, oftast 3-5x för säkerhet.' },
        ],
      },
    ],

    typiskaArbetsgivare: [
      {
        kategori: 'SaaS- och tech-bolag',
        exempel: [
          'Klarna, Spotify, Tink, Storytel',
          'iZettle, Truecaller, Voi, Kry',
          'Internationella SaaS-bolag med Sverige-team',
          'Startup-bolag i Stockholm, Göteborg, Malmö',
        ],
      },
      {
        kategori: 'Traditionell B2B och industri',
        exempel: [
          'Volvo, Scania, Atlas Copco, Sandvik',
          'Telia, Tele2, Ericsson, ABB',
          'Tetra Pak, IKEA Industry, ASSA ABLOY',
          'Mindre nischade industribolag',
        ],
      },
      {
        kategori: 'Bank, finans och försäkring',
        exempel: [
          'SEB, Handelsbanken, Swedbank, Nordea',
          'Försäkringsbolag (Folksam, Trygg-Hansa, If)',
          'Investmentbolag och kapitalförvaltning',
          'Fintech-bolag (Klarna, Tink, Lendify)',
        ],
      },
      {
        kategori: 'Konsumentvaror och retail',
        exempel: [
          'H&M, IKEA, Coop, ICA, Axfood',
          'Konsumentvaru-bolag (Procter & Gamble, Unilever)',
          'E-handelsbolag och D2C-varumärken',
          'B2B-distributörer och partner-säljare',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Akademisk utbildning (3-5 år)',
        beskrivning: 'Civilekonomprogrammet, ekonomi-kandidat, marknadsföring eller business administration från Handelshögskolan, Lund, Uppsala eller motsvarande. Vanlig grund för senior B2B-roller och account management.',
      },
      {
        rubrik: 'Yrkeshögskola eller säljutbildning (1-2 år)',
        beskrivning: 'YH-utbildningar inom B2B-säljare, key account management eller digital försäljning. Snabbare väg in i yrket och ofta lika värderad som högskola av scale-ups och tech-bolag.',
      },
      {
        rubrik: 'Säljmetodik-certifieringar',
        beskrivning: 'MEDDIC Academy, Challenger Sale, Sandler Sales, Salesforce Trailhead. Certifieringar visar djup i metodik och prioriteras av SaaS-bolag som arbetar strukturerat.',
      },
      {
        rubrik: 'Internutbildning och on-the-job',
        beskrivning: 'Många säljare utvecklas via internutbildning på sin första arbetsgivare. Klarna, Storytel och andra scale-ups har strukturerade BDR-program som leder till AE-roller på 12-18 månader.',
      },
    ],

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
        'Demo- och presentationsteknik',
        'LinkedIn Sales Navigator och social selling',
        'Quarterly Business Review (QBR)',
        'Customer success och renewal-arbete',
      ],
      personliga: [
        'Resultatdriven och målmedveten',
        'Övertygande och relationsskapande',
        'Lyhörd för kundbehov',
        'Strukturerad i pipeline-arbete',
        'Driven utan att vara påflugen',
        'Kompetitiv men kollegial',
        'Uthållig vid långa säljcykler',
      ],
    },

    profilExempel:
      'Senior B2B-säljare med 8 års erfarenhet inom SaaS och teknisk försäljning. Ökade ARR från 8M till 9,9M (+24%) under 18 månader genom strategisk upselling till 12 nyckelkunder. Arbetar metodiskt enligt MEDDIC och stänger affärer med snittstorlek 450K SEK.',

    profilTips:
      'Säljroll och år av erfarenhet i öppningsraden. Andra meningen lyfter konkret resultat med procent eller absoluta tal. Tredje meningen visar säljmetodik och affärsstorlek som differentierar dig från generiska säljar-CV:n.',

    rekryterarTipsen: [
      {
        rubrik: 'Säljsiffror är allt — kvantifiera allt',
        text: 'Skriv inte "ansvarig för försäljning till storkunder". Skriv "ökade ARR 24% från 8M till 9,9M under 18 månader genom upselling till 12 nyckelkunder". Säljchefer slänger CV:n utan siffror.',
      },
      {
        rubrik: 'Måluppfyllelse per år',
        text: '"130% av mål 2 år i rad" säger mer än "uppfyllde säljmål". Lista varje år med procent. Säljchefer letar efter konsekvent prestation, inte enstaka topprestationer som kan vara tur.',
      },
      {
        rubrik: 'Säljmetoder du behärskar',
        text: 'MEDDIC, BANT, Challenger Sale, SPIN. Nämn metoder du faktiskt arbetar efter. Det är ATS-keywords som SaaS- och B2B-företag filtrerar på i jobbannonsens språk.',
      },
      {
        rubrik: 'CRM-system och säljstack',
        text: 'Salesforce, HubSpot, Pipedrive, Lime. Vilka system har du jobbat i? Säljstacken (Apollo, Outreach, Gong, ZoomInfo) är meriterande för moderna B2B-roller.',
      },
      {
        rubrik: 'Affärsstorlek och säljcykel',
        text: 'Snittstorlek på dina stängda affärer (50K transaktion, 450K SaaS-årsavtal, 5M enterprise) och cykellängd (3 veckor, 6 månader, 18 månader). Säljchefer matchar din erfarenhet mot deras pipeline-profil.',
      },
      {
        rubrik: 'Branschspecialisering',
        text: 'Att ha sålt till specifika vertikaler (fintech, healthtech, retail, industri) är meriterande eftersom säljcyklar och beslutsprocesser skiljer sig. Lyft de 2-3 vertikaler där du har djupast erfarenhet och kontaktnät.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'År av erfarenhet, primärt segment (B2B/B2C, bransch), kärnresultat och metodik på 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Företag, roll, tidsperiod, budgetomfattning och måluppfyllelse. "130% av mål 2 år i rad" istället för "uppfyllde säljmål".' },
      { sektion: 'Utbildning', tips: 'Akademisk bakgrund, säljutbildningar och certifieringar (SwedSec, MEDDIC-cert, Challenger Academy).' },
      { sektion: 'Kompetenser', tips: 'CRM-system, säljmetoder, vertikaler du sålt till. Var specifik om dealsstorlekar och cykler.' },
      { sektion: 'Vidareutbildning', tips: 'Säljmetodik-certifieringar, ledarskapsutbildningar, eventuell MBA. Kontinuerlig utveckling visar engagemang.' },
      { sektion: 'Övrigt', tips: 'Eventuell föreningserfarenhet, mentor-roller, talanger på industri-konferenser. Säljnätverk är värdefullt och kan lyftas i sidopanelen.' },
    ],

    checklista: [
      'Total försäljningsbudget du ansvarat för',
      'Konkret måluppfyllelse i procent per år',
      'Säljmetod du arbetar efter (MEDDIC, BANT, etc)',
      'CRM-system och säljstack du behärskar',
      'Antal kunder eller leads du hanterat parallellt',
      'Snittstorlek på affärer du stängt',
      'Säljcykellängd i din nuvarande roll',
      'Branschvertikaler där du har djupast erfarenhet',
      'Eventuella säljutbildningar och certifieringar',
      'Mentorskap, ledarskap eller talangs-bidrag',
    ],

    atsInfo:
      'Både vår mall Norrsken och premium-varianten Aurora är ATS-säkra. Aurora har en "Nyckelresultat"-panel där dina kvantifierade siffror lyfts visuellt. Säljbolag använder ofta moderna ATS som Teamtailor, Workday eller Manatal, alla läser Aurora korrekt. Skriv ut systemnamn (Salesforce, HubSpot) och säljmetoder (MEDDIC) i klartext eftersom rekryterare filtrerar exakta termer.',

    faqItems: [
      {
        q: 'Vad ska finnas med i ett säljar-CV?',
        a: 'Säljroll och senioritet (BDR, AE, KAM, Sales Manager), bransch och segment, konkret måluppfyllelse i procent per år, total budget du ansvarat för, snittstorlek på affärer, säljcykellängd, CRM-system (Salesforce, HubSpot, Pipedrive), säljmetodik (MEDDIC, BANT, Challenger), och eventuella certifieringar. Lägg till mentorskap och ledarroller om du söker senior-tjänster.',
      },
      {
        q: 'Hur skriver jag CV som junior-säljare utan referenssiffror?',
        a: 'Lyft akademiska prestationer (snittbetyg, examensarbete, eventuell SaSS-praktik), tävlingar och case-studies där du kvantifierade resultat, eventuell extra- eller säsongsarbete med kundkontakt, och språkkunskaper. Skriv ut dina personliga driv-egenskaper med konkreta exempel. Många bolag har strukturerade BDR-program för junior-säljare.',
      },
      {
        q: 'Vilka siffror är viktigast på ett säljar-CV?',
        a: 'Tre kärnsiffror. Total budget du ansvarat för (i SEK eller absoluta tal). Måluppfyllelse i procent per år. Tillväxt i absoluta tal (ARR, omsättning, antal kunder). En säljare som visar "ökade ARR med 24%" får intervju över en som skriver "drev tillväxt".',
      },
      {
        q: 'Ska jag nämna provisioner eller bonusar?',
        a: 'Inte själva provisionsbeloppet, men gärna måluppfyllelse i procent som triggade bonus ("130% av mål 2 år i rad"). Det visar att du levererar konsekvent. För enterprise-roller där du jobbat med stora affärer kan du nämna att du varit President\'s Club eller motsvarande topp-säljarprogram.',
      },
      {
        q: 'Hur lång ska ett säljar-CV vara?',
        a: 'Junior säljare 0-5 år: 1 sida. Erfaren B2B eller key account: 1,5-2 sidor. Säljchef eller CSO: 2 sidor max. Säljchefer skannar fort så håll varje rad relevant. Skriv siffror utan att bädda in dem i löpande text och prioritera senaste 5-7 åren.',
      },
      {
        q: 'Vilka nyckelord ska CV:t ha för att passera ATS?',
        a: 'Specifika säljroller (Account Executive, Key Account Manager, Sales Manager), CRM-system (Salesforce, HubSpot, Pipedrive, Lime), säljmetoder (MEDDIC, BANT, Challenger, SPIN), branschvertikaler du sålt till, och säljstack-verktyg (Apollo, Outreach, Gong). Teamtailor och Workday söker exakta matchningar mot jobbannonsens språk.',
      },
      {
        q: 'Hur visar jag säljkompetens utan SaaS-bakgrund?',
        a: 'Lyft kvantifierade resultat oavsett bransch. En säljare i industri som ökat orderingång med 30% har samma värde för en säljchef som en SaaS-säljare som ökat ARR. Beskriv säljmetodik du använt, kundtyp du jobbat med, och avtalsstrukturer. Tydlig branschöverföring kommer från konkreta resultat och inte titel.',
      },
      {
        q: 'Behöver jag personligt brev till säljroller?',
        a: 'Ja, för de flesta tjänster. Använd brevet för att visa att du läst om bolaget och förstår deras säljutmaning. Beskriv en specifik affär du stängt eller en säljcykel du drivit som matchar deras profil. Säljchefer värderar kandidater som visar säljförmåga redan i sin egen ansökan. Håll till en sida på 300-400 ord.',
      },
      {
        q: 'Vilka säljcertifieringar är värda 2026?',
        a: 'MEDDIC Academy är gold standard på enterprise SaaS. Challenger Sale är efterfrågad på scale-ups med komplexa säljcyklar. Salesforce Trailhead-certifieringar visar systemkunskap. SwedSec-licens krävs för bank- och försäkringsförsäljning. AI-baserade säljverktyg (Gong, Clari) blir allt viktigare och eventuellt egen certifiering ger fördel.',
      },
      {
        q: 'Vad ska jag inte ha med på mitt säljar-CV?',
        a: 'Personnummer (bara födelseår), exakta lönesiffror eller bonusbelopp, irrelevanta arbetslivserfarenheter äldre än 10-15 år, generiska påståenden ("driven och resultatorienterad") utan stöd, säljkampanjer du inte vunnit, och hobbies som inte är säljrelevanta. Säljchefer förväntar sig stark skriftlig kommunikation, så stavfel diskvalificerar direkt.',
      },
    ],
  },

  'butiksbitrade': {
    seoIntro:
      'Som butiksbiträde söker du tjänster i en bransch där konkurrensen om jobben är stor men personalomsättningen ännu större. ICA, Coop, H&M, Lindex, Stadium och tusentals mindre butiker rekryterar konstant, men butikschefer slänger CV:n som inte visar konkret kassasystem-erfarenhet eller serviceanda. Ett välskrivet CV avgör om du blir kallad till intervju på den butik du faktiskt vill jobba på.\n\nVår mall för butiksbiträden lyfter kassasystem, försäljningsresultat och flexibilitet kring schema som första visuella element. Vi har strukturerat erfarenhetssektionen så att butikskedja, varugrupp och tidsperiod syns direkt med eventuella säljprestationer. Det betyder att butikschefer kan bedöma din matchning på fem sekunder.\n\nKonkret innehåll vi rekommenderar: erfarenhet av specifika kassasystem (Sitoo, Iiko, NCR, Bizpoint), butikskedjor och varugrupper du sålt, eventuella säljresultat (snittnota, mersälj, kundnöjdhet), kassansvar och kontanthantering, varuplockning och inventering, returhantering, visuell merchandising, samt språkkunskaper för internationell kundkrets.\n\nNedan hittar du två CV-mallar designade för butiksrollen, ett färdigt CV-exempel att utgå från, och konkreta tips på vad butikschefer på dagligvaruhandel, mode- och elektronikbutiker faktiskt letar efter. Ladda ner mallen gratis och anpassa efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'Briefcase',
        title: 'Kassasystem i klartext',
        description: 'Sitoo dominerar i kläd- och specialbutiker. NCR används i större kedjor som ICA. Iiko vanligast i restaurang och café. Skriv ut exakta produktnamn så ATS-system kan filtrera fram dig. "Erfarenhet av kassasystem" är för generiskt.',
      },
      {
        icon: 'TrendingUp',
        title: 'Säljresultat och mersälj',
        description: '"Ökade snittnotan med 8% genom aktiv merförsäljning" säger mer än "ansvarade för försäljning". Konkreta siffror skiljer ut dig bland 30+ ansökningar och visar att du tänker affärsmässigt på din yta.',
      },
      {
        icon: 'CheckCircle',
        title: 'Schema-flexibilitet är hård valuta',
        description: 'Detaljhandeln behöver medarbetare som kan kvällar, helger, högtider. Skriv ut din tillgänglighet konkret. "Flexibel för rotationsschema inkl helger" sätter dig framför kandidater som bara vill jobba dagtid.',
      },
      {
        icon: 'FileText',
        title: 'Varugrupp och produktkunskap',
        description: 'Kläder, dagligvaror, elektronik, sport, skönhet. Olika butikschefer letar efter olika produktkunskap. En sportbutik värderar erfarenhet från Stadium högre än från klädbutik. Var specifik om varugrupp.',
      },
      {
        icon: 'Award',
        title: 'Kontanthantering och ansvar',
        description: 'Kassansvar, dagsavstämning, inventering. Att ha haft förtroende för stora summor är meriterande för senior-roller (avdelningschef, supervisor). Skriv ut om du varit huvudkassör eller ansvarig för stängning.',
      },
      {
        icon: 'Target',
        title: 'Språk för internationell kundkrets',
        description: 'Stockholm Central, Arlanda, NK, Mall of Scandinavia. Många butiker har internationella kunder. Engelska är förmodat. Tyska, spanska, kinesiska eller arabiska är meriterande för centrum-butiker och premium-segment.',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'Kassasystem och resultat överst',
        description: 'Vår mall Disk har en "Försäljningsresultat"-banner överst där siffror och kassasystem-erfarenhet lyfts visuellt. Butikschefer ser dina meriter på fem sekunder utan att behöva scrolla.',
      },
      {
        title: 'Erfarenhet per butikskedja',
        description: 'Mallen separerar butiker, varugrupp och tidsperiod så bredd och djup syns. Du kan visa erfarenhet från flera kedjor utan att meriter konkurrerar om samma yta.',
      },
      {
        title: 'Eget block för kompetens och certifikat',
        description: 'Säljutbildningar (intern eller extern), kassansvar-certifikat och kundbemötande-utbildningar har egen rad. Visar att du har strukturerad utveckling utöver bara "tid i butik".',
      },
      {
        title: 'Premium-mallen Disk Plus med foto',
        description: 'För senior-roller (butikschef, avdelningschef, flagship-butiker) lägger Disk Plus till foto och customer-voice-blockquote. Skapar magazine-känsla utan att kompromissa med ATS-läsbarhet.',
      },
      {
        title: 'Energisk emerald-accent för handel',
        description: 'Vi har valt en emerald-accent som signalerar handel utan att bli aggressiv. Dragna från ICA, Coop och dagligvaruhandelns visuella språk men anpassade för individuell ansökan.',
      },
      {
        title: 'Kompakt layout för flexibilitet',
        description: 'Butiksbiträden har ofta varierande arbetstid (heltid, deltid, säsong). Mallen är kompakt nog för att rymma flera samtidiga anställningar utan att verka rörig.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Kundservice och säljarbete',
        punkter: [
          'Möta kunder vid entrén och i butiken med servicekänsla',
          'Aktivt sälja produkter genom rådgivning och produktdemonstrationer',
          'Genomföra mersälj och kompletterande försäljning vid kassan',
          'Hantera kundklagomål och returer med lugn och professionalism',
        ],
      },
      {
        rubrik: 'Kassa och betalning',
        punkter: [
          'Köra kassa i Sitoo, NCR, Iiko eller motsvarande system',
          'Hantera kontant, kort, mobilbetalning och presentkort korrekt',
          'Genomföra dagsavstämning och rapportera till butikschef',
          'Hantera kassaöppning, kassastängning och växelkassan',
        ],
      },
      {
        rubrik: 'Varuplockning och påfyllning',
        punkter: [
          'Plocka ur varor från lager och fylla på i butiken enligt planogram',
          'Märka varor med rätt prislapp och kampanjmaterial',
          'Genomföra cykelräkning och inventering vid skiftbyten',
          'Hantera leveranser och kontrollera mot följesedel',
        ],
      },
      {
        rubrik: 'Visuell merchandising',
        punkter: [
          'Bygga skyltning enligt centrala riktlinjer från huvudkontor',
          'Anpassa visuellt uttryck efter säsong, kampanj eller högtider',
          'Hålla butiken ren, snygg och säljvänlig under hela skiftet',
          'Föreslå förbättringar av exponering baserat på säljdata',
        ],
      },
      {
        rubrik: 'Returer och reklamationer',
        punkter: [
          'Hantera returer enligt butikens policy och konsumentlagstiftningen',
          'Bedöma reklamationer och eskalera till butikschef vid behov',
          'Dokumentera returer i kassasystemet och hantera återbetalning',
          'Förebygga svinn genom uppmärksamhet på säljytan',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Kassasystem och betalning',
        termer: [
          { term: 'Sitoo', forklaring: 'Molnbaserat kassasystem som dominerar kläd- och specialbutiker.' },
          { term: 'NCR', forklaring: 'Globalt kassasystem som används i större kedjor som ICA, Coop, Hemköp.' },
          { term: 'Iiko', forklaring: 'Kassasystem populärt i restaurang, café och småbutiker.' },
          { term: 'Bizpoint', forklaring: 'Svenskt kassasystem för små och medelstora butiker.' },
          { term: 'Kassansvar', forklaring: 'Ansvar för dagskassan, dagsavstämning och deponering.' },
          { term: 'Z-rapport', forklaring: 'Daglig avslutsrapport som summerar alla transaktioner i kassan.' },
        ],
      },
      {
        kategori: 'Detaljhandelsroller',
        termer: [
          { term: 'Butiksbiträde', forklaring: 'Allmän roll med kassa, kundservice och varuplockning.' },
          { term: 'Butikssäljare', forklaring: 'Säljfokuserad roll, ofta provisionsbaserad i mode och elektronik.' },
          { term: 'Avdelningschef', forklaring: 'Ansvarig för en specifik avdelning och dess säljmål.' },
          { term: 'Butikschef', forklaring: 'Övergripande chef med personalansvar, resultatmål och budget.' },
          { term: 'Visual merchandiser', forklaring: 'Specialist på butiksskyltning och produktexponering.' },
          { term: 'Stockwoman/man', forklaring: 'Lager- och påfyllningsroll, ofta nattskift för att förbereda butiken.' },
        ],
      },
      {
        kategori: 'KPI:er och nyckeltal',
        termer: [
          { term: 'Snittnota', forklaring: 'Genomsnittligt belopp per transaktion, central KPI för säljare.' },
          { term: 'Konvertering', forklaring: 'Andel besökare som blir köpare, mäts via räknare vid entrén.' },
          { term: 'UPT', forklaring: 'Units Per Transaction, antal artiklar per kvitto.' },
          { term: 'Säljytseffektivitet', forklaring: 'Omsättning per kvadratmeter, viktigt för butiksbedömning.' },
          { term: 'Svinn', forklaring: 'Förlorad varuvärde genom stöld, skador eller felinventering.' },
          { term: 'NPS', forklaring: 'Net Promoter Score, mäter kundnöjdhet och rekommendationsvilja.' },
        ],
      },
      {
        kategori: 'Branscher och varugrupper',
        termer: [
          { term: 'Dagligvaruhandel', forklaring: 'Mat, drycker, hushållsprodukter (ICA, Coop, Willys, Hemköp, Lidl).' },
          { term: 'Mode och kläder', forklaring: 'Kläder, skor, accessoarer (H&M, Lindex, Zara, MQ, Stadium).' },
          { term: 'Heminredning', forklaring: 'Möbler, textil, dekoration (IKEA, Mio, Hemtex, Ellos).' },
          { term: 'Elektronik', forklaring: 'Hemelektronik, vitvaror (Elgiganten, NetOnNet, Media Markt).' },
          { term: 'Sport och fritid', forklaring: 'Sportkläder och utrustning (Stadium, XXL, Intersport, Naturkompaniet).' },
          { term: 'Skönhet och hälsa', forklaring: 'Kosmetika, parfym, hudvård (KICKS, Lyko, Sephora, Apoteket).' },
        ],
      },
    ],

    typiskaArbetsgivare: [
      {
        kategori: 'Dagligvaruhandel',
        exempel: [
          'ICA-handlare i Stockholm, Göteborg, Malmö och övriga landet',
          'Coop, Hemköp, Willys, Lidl, City Gross',
          'Mindre lokala livsmedelsbutiker och specialbutiker',
          'Apoteket och Apotek Hjärtat',
        ],
      },
      {
        kategori: 'Mode och kläder',
        exempel: [
          'H&M, Lindex, KappAhl, MQ, Bik Bok',
          'Zara, Mango, Cubus, Gina Tricot',
          'Lyxbutiker (NK, Acne Studios, Filippa K)',
          'Sportbutiker (Stadium, XXL, Intersport)',
        ],
      },
      {
        kategori: 'Heminredning och elektronik',
        exempel: [
          'IKEA, Mio, JYSK, Hemtex',
          'Elgiganten, NetOnNet, Media Markt',
          'Specialbutiker för design och inredning',
          'E-handelsbolag med fysiska showrooms',
        ],
      },
      {
        kategori: 'Skönhet, sport och övrigt',
        exempel: [
          'KICKS, Lyko, Sephora, The Body Shop',
          'Sportkedjor och utomhusbutiker',
          'Bensinmackar och servicebutiker',
          'Köpcentrum och flagship-butiker (Mall of Scandinavia, Emporia, NK)',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Handels- och administrationsprogrammet (3 år)',
        beskrivning: 'Gymnasieutbildning med inriktning handel eller administration. Innehåller praktikperioder hos butiker. Vanlig grund för butiksbiträden och säljkonsulenter.',
      },
      {
        rubrik: 'Yrkeshögskola butikssäljare (1-2 år)',
        beskrivning: 'YH-utbildningar som butikssäljare, e-handel eller retail manager. Kortare väg in i yrket och meriterande för chefroller.',
      },
      {
        rubrik: 'Internutbildningar från kedjor',
        beskrivning: 'IKEA Academy, H&M Way, ICA-skolan. Större kedjor har strukturerade interna utbildningsprogram som ofta leder till avdelnings- och butikschefroller.',
      },
      {
        rubrik: 'Direkt anställning utan formell utbildning',
        beskrivning: 'Många butiker rekryterar utan formell utbildning om du visar serviceanda och flexibilitet. Vanlig väg in för deltidsarbete och säsongsarbete.',
      },
    ],

    kompetenser: {
      tekniska: [
        'Kassasystem (Sitoo, Iiko, NCR, Bizpoint)',
        'Varuplockning och påfyllning enligt planogram',
        'Inventering, cykelräkning och svinnhantering',
        'Returhantering och kvittogivning',
        'Visuell merchandising och skyltning',
        'Försäljningsstatistik och KPI:er (UPT, snittnota, konvertering)',
        'Kontanthantering och dagsavstämning',
        'Mersälj och kompletterande försäljning',
        'Produkt- och varukännedom',
        'Kundbemötande och konflikthantering',
        'Skyltning enligt kampanjmaterial och centrala riktlinjer',
        'Reklamationer och konsumentlagstiftning',
      ],
      personliga: [
        'Servicemedveten och kundorienterad',
        'Snabbtänkt under press',
        'Ärlig och pålitlig kring kontanthantering',
        'Lagspelare i butiksmiljö',
        'Flexibel kring kvällar och helger',
        'Energisk och utåtriktad',
        'Pedagogisk i produktrådgivning',
      ],
    },

    profilExempel:
      'Erfaren butiksmedarbetare med 3 års erfarenhet från klädbutik och dagligvaruhandel. Hanterar kassa-, retur- och inventeringsprocesser i Sitoo och NCR med hög precision. Topp-3-säljare på avdelningen 2024 med 8% högre snittnota än kollegor genom aktivt merförsäljningsarbete.',

    profilTips:
      'År av erfarenhet och bransch i öppningsraden. Andra meningen lyfter vilka system du behärskar. Tredje meningen visar konkret resultat eller säljprestation som differentierar dig från generiska CV:n.',

    rekryterarTipsen: [
      {
        rubrik: 'Kassasystem är CV-kritiskt',
        text: 'Vilka kassasystem har du arbetat med? Sitoo, Iiko, NCR, Bizpoint. Nämn dem konkret. Många butiker använder samma system och söker efter exakt erfarenhet i jobbannonsens språk.',
      },
      {
        rubrik: 'Försäljningsresultat över passiv listning',
        text: 'Skriv inte "ansvarade för försäljning". Skriv "ökade kategori-omsättningen 12% under sommarsäsongen". Konkreta siffror gör att du sticker ut bland 30+ ansökningar.',
      },
      {
        rubrik: 'Schema-flexibilitet är hård valuta',
        text: 'Detaljhandeln behöver flexibla medarbetare. Nämn att du kan jobba kvällar, helger, högtider. Det sätter dig framför sökande som bara vill jobba dagtid.',
      },
      {
        rubrik: 'Varugrupp och produktkunskap',
        text: 'Olika butikschefer letar efter olika produktkunskap. En sportbutik värderar erfarenhet från Stadium högre än från klädbutik. Var specifik om varugrupp och eventuell produktcertifiering.',
      },
      {
        rubrik: 'Kassansvar och kontanthantering',
        text: 'Att ha haft förtroende för stora summor är meriterande för senior-roller. Skriv ut om du varit huvudkassör, ansvarig för stängning eller hanterat dagsavstämning.',
      },
      {
        rubrik: 'Språk och kulturell kompetens',
        text: 'Centrumbutiker, flagship-butiker och premium-segment har internationella kunder. Engelska är förmodat. Andra språk (tyska, kinesiska, spanska, arabiska) är starkt meriterande och bör ligga synligt.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'År av erfarenhet, branscher du arbetat i, primära kassasystem och din särprägel på 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Butik, bransch, tidsperiod och kärnuppgifter. Konkretisera med kassasystem och försäljningsresultat (snittnota, mersälj).' },
      { sektion: 'Utbildning', tips: 'Gymnasium, YH-utbildning eller motsvarande. Eventuella säljutbildningar (interna kedjeutbildningar som IKEA Academy räknas).' },
      { sektion: 'Kompetenser', tips: 'Kassasystem i klartext, varugrupper du har erfarenhet av, språk för internationell kundkrets.' },
      { sektion: 'Kassansvar', tips: 'Eget block om du haft kassansvar eller varit huvudkassör. Stort plus för senior-roller och chefspositioner.' },
      { sektion: 'Övrigt', tips: 'Tillgänglighet (heltid, deltid, kvällar, helger, säsong), körkort om du söker storbutik med varuintag.' },
    ],

    checklista: [
      'Erfarenhet av specifika kassasystem (Sitoo, NCR, Iiko)',
      'Kundbemötande och servicekompetens',
      'Varuplockning och påfyllning enligt planogram',
      'Inventering, cykelräkning och svinnhantering',
      'Eventuell säljutbildning (intern eller extern)',
      'Schema-flexibilitet (kvällar, helger, säsong)',
      'Språk utöver svenska och engelska',
      'Konkret säljresultat eller mersäljs-prestation',
      'Eventuellt kassansvar och dagsavstämning',
      'Produktkunskap och varugruppserfarenhet',
    ],

    atsInfo:
      'Både vår mall Disk och premium-varianten Disk Plus är ATS-säkra. Större kedjor som ICA, Coop, H&M använder Teamtailor eller egna ATS. Kassasystem som "Sitoo" eller "NCR" är typiska sökord rekryterare filtrerar på, så använd exakta produktnamn istället för "kassasystem". Skriv också ut varugrupper och butikskedjor i klartext.',

    faqItems: [
      {
        q: 'Vad ska finnas med i ett butiksbiträde-CV?',
        a: 'Erfarenhet av specifika kassasystem (Sitoo, NCR, Iiko), butikskedjor och varugrupper du arbetat med, eventuella säljresultat (snittnota, mersälj, kampanjresultat), kassansvar och kontanthantering, varuplockning och inventering, schema-flexibilitet, samt språkkunskaper. Lägg till säljutbildningar och eventuella chefroller om du söker senior-tjänster.',
      },
      {
        q: 'Behövs erfarenhet för butiksbiträde-jobb?',
        a: 'Inte alltid. Många butiker rekryterar utan erfarenhet om du visar serviceanda och flexibilitet. Däremot väger relevant erfarenhet (även café, restaurang, kundtjänst) tungt eftersom det visar att du kan hantera kundkontakt. För säsongsarbete sommar och jul tar man oftast in nya utan krav.',
      },
      {
        q: 'Vad ska sammanfattningen på CV:t handla om?',
        a: 'Tre saker. Hur länge du jobbat i service, vilka system och varugrupper du behärskar, och vad som driver dig (kundbemötande, säljmål, lagarbete). Håll det till 3-4 meningar, rekryterare läser det först. Konkreta resultat (snittnota, kampanjvinster) är ett plus.',
      },
      {
        q: 'Hur lyfter jag säljresultat utan att ha haft uttalat säljmål?',
        a: 'De flesta butiker mäter snittnota, UPT och konvertering även om medarbetarna inte ser direkt provision. Fråga din chef om du var topp-3 på avdelningen, om kampanjer du varit del av drev mest omsättning, eller om kunder gett positiv NPS-feedback. Indirekta resultat går också att lyfta.',
      },
      {
        q: 'Hur lång ska ett butiksbiträde-CV vara?',
        a: 'En sida räcker för de flesta. Om du har 5+ års erfarenhet med flera kedjor och säljresultat kan det bli 1,5 sidor. Det viktiga är att din tillgänglighet, dina kassasystem och senaste arbetsplats syns på första sidan utan att man behöver scrolla.',
      },
      {
        q: 'Vilka nyckelord ska CV:t ha för att passera ATS?',
        a: 'Specifika kassasystem (Sitoo, NCR, Iiko, Bizpoint), butikskedjor (ICA, Coop, H&M, Stadium), varugrupper (kläder, dagligvaror, sport, elektronik), KPI:er (snittnota, UPT, konvertering) och språk. Teamtailor och Workday söker exakta matchningar mot jobbannonsens språk.',
      },
      {
        q: 'Ska jag ha med foto på butiksbiträde-CV?',
        a: 'Inte obligatoriskt men vanligt i Sverige inom detaljhandel. Vår premium-mall Disk Plus har stöd för foto. Använd ett professionellt bröstbild om du har en. ATS-system läser ditt CV ändå eftersom mallen är ATS-säker. För flagship-butiker och premium-segment är foto ett plus.',
      },
      {
        q: 'Behöver jag personligt brev till butiks-tjänster?',
        a: 'Beror på butiken. Kedjor som ICA och Coop förväntar sig oftast brev medan mindre butiker kan acceptera bara CV. När brev förväntas, fokusera på varför just den butik och beskriv en kundsituation där du visat din serviceanda. Håll till en sida på 250-350 ord.',
      },
      {
        q: 'Hur visar jag mersäljs-förmåga på CV:t?',
        a: 'Konkreta exempel av kampanjer du drivit, produkter du varit topp-säljare på, eller tillfällen du adderat värde i kassan. "Adderade snitt 80 SEK per kvitto via aktiv mersälj av tilbehör under julkampanj" är konkret. Indirekta exempel som "alltid topp-3 på avdelningen" funkar också.',
      },
      {
        q: 'Vad ska jag inte ha med på mitt butiksbiträde-CV?',
        a: 'Personnummer (bara födelseår), löneförväntningar, irrelevanta arbetslivserfarenheter äldre än 10-15 år, generiska påståenden ("driven och målmedveten") utan stöd, hobbies som inte är butiksrelevanta, och grumliga formuleringar om varför du lämnat tidigare jobb. Stavfel diskvalificerar omedelbart.',
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
    seoIntro:
      'Som lagerarbetare jobbar du i en bransch där behörigheter och plockhastighet avgör mer än personlig profil. DB Schenker, PostNord, DHL, Klarna Logistics, Mathem och tusentals tredjepartslogistiker har tusentals öppna roller varje månad, men lagerchefer slänger CV:n som inte tydligt visar truckbehörigheter och WMS-erfarenhet. Ett välskrivet CV avgör om du blir kallad till intervju på det lager du faktiskt vill jobba på.\n\nVår mall för lagerarbetare lyfter truckbehörigheter och WMS-system som första visuella element. Vi har strukturerat erfarenhetssektionen så att lager, branschtyp och tidsperiod syns direkt med plockhastighet, felfri-procent och specifika system. Det betyder att lagerchefer kan bedöma din matchning på fem sekunder.\n\nKonkret innehåll vi rekommenderar: alla aktiva truckbehörigheter (A1-A4, B1-B5, C, D, E) med utgångsdatum, WMS-system du arbetat i (SAP WMS, Manhattan, Pyramid, Astro), plockhastighet i rader per timme och felfri-procent, eventuella ADR-bevis för farligt gods, säkerhetsutbildningar (Akta Ryggen, brandskydd, fallskydd), körkort B (ofta krav), och tillgänglighet för 2- eller 3-skift och helger.\n\nNedan hittar du två CV-mallar designade för lagerrollen, ett färdigt CV-exempel att utgå från, och konkreta tips på vad lagerchefer på e-handelsterminal, industrilager, transport och tredjepartslogistik faktiskt letar efter. Ladda ner mallen gratis och anpassa efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'Award',
        title: 'Truckbehörigheter med utgångsdatum',
        description: 'Lista exakt vilka truckar du har behörighet på (A1, A2, A3, A4, B1, B2, B3, B4, B5, C, D, E) med utgångsdatum. Lagerchefer matchar varje tjänst mot specifika krav, och utan rätt behörighet sorteras du bort omedelbart.',
      },
      {
        icon: 'TrendingUp',
        title: 'Plockhastighet i rader per timme',
        description: '"Plockhastighet 180 rader per timme i SAP WMS med 99,7% korrekt plock" säger allt en lagerchef vill veta. Konkreta siffror skiljer dig från ansökningar som bara skriver "lagerarbete och plockning".',
      },
      {
        icon: 'CheckCircle',
        title: 'WMS-system i klartext',
        description: 'SAP WMS dominerar storbolag. Manhattan vanligast på e-handel. Pyramid på mindre lager. Astro på terminal. Skriv ut systemnamnen så ATS kan filtrera fram dig och rekryteraren ser att du kan starta utan introduktion.',
      },
      {
        icon: 'FileText',
        title: 'ADR-bevis för farligt gods',
        description: 'För lager som hanterar farligt gods (kemikalier, batterier, tryckkärl) är ADR ett krav, inte ett plus. Lager utan farligt gods värderar det också som senior-meritering. Lägg utgångsdatum eftersom det förnyas vart femte år.',
      },
      {
        icon: 'Briefcase',
        title: 'Körkort B är ofta krav',
        description: 'Större terminaler kräver körkort B för att kunna hämta material från olika delar av området. Hemleverans-bolag som Mathem och Foodora kräver det alltid. Skriv ut B om du har det.',
      },
      {
        icon: 'Target',
        title: 'Schemaflexibilitet',
        description: 'Lager kör ofta 2- eller 3-skift, och högsäsong (jul, sommar) kräver helgarbete. Tillgänglighet för rotation är hård valuta. Skriv ut konkret: "Tillgänglig för 2-skift inkl helger" eller "Söker dagtid med möjlighet till sporadiska kvällar".',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'Behörigheter och körkort överst',
        description: 'Vår mall Logistik har "Behörigheter och körkort" som första block direkt efter rubriken. Lagerchefer ser dina truckkort, ADR och B-körkort på fem sekunder utan att behöva scrolla.',
      },
      {
        title: 'WMS-system som eget block',
        description: 'SAP WMS, Manhattan, Pyramid, Astro. Mallen separerar systemen från generiska kompetenser så lagerchefer letar specifikt efter system de redan kör i sin organisation.',
      },
      {
        title: 'Industriell typografi för branschen',
        description: 'Vi har valt Roboto Condensed med cyan-accent och kondenserad layout som signalerar industri och produktion. Ingen klick-baitig design som drar fokus från meriterna.',
      },
      {
        title: 'Premium-mallen Logistik Plus med foto',
        description: 'För senior-roller (lagerchef, terminalansvarig) lägger Logistik Plus till foto, mörkt grafit-band och tabellär arbetslivshistorik. Skapar en mer professionell first impression utan att kompromissa med ATS.',
      },
      {
        title: 'Plats för plockstatistik',
        description: 'Mallen har dedikerade rader för rader per timme, felfri-procent och plocktyper (pick-by-voice, pick-by-light, RF-scanner). Så dina prestationssiffror syns synligt utan att blandas in i löpande text.',
      },
      {
        title: 'Skiftarbete-tillgänglighet i sidopanelen',
        description: 'Lagerchefer behöver veta om du kan rotation, helger, högsäsong. Mallen har ett synligt block i sidopanelen för tillgänglighet, vilket sätter dig i rätt urvalslista.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Plock och packning',
        punkter: [
          'Plocka order enligt pick-by-voice, pick-by-light eller RF-scanner-system',
          'Packa varor i kartong eller container enligt orderspecifikation',
          'Märka kollin med rätt fraktsedel och destinationsuppgifter',
          'Kvalitetskontrollera plockad order innan avsändning',
        ],
      },
      {
        rubrik: 'Truckkörning och materialhantering',
        punkter: [
          'Köra plocktruck (A2, A3) i smala gångar och höglager',
          'Hantera motviktstruck (B1-B5) för pallhantering och lastning',
          'Lasta och lossa lastbilar med truckar eller manuell pallhantering',
          'Förflytta material mellan lagerzoner och packningsområden',
        ],
      },
      {
        rubrik: 'Inventering och kvalitet',
        punkter: [
          'Genomföra cykelräkning och fullinventering enligt schema',
          'Justera lagersaldo i WMS efter avvikelser och rapportera diff',
          'Kontrollera inkommande gods mot följesedel och PO',
          'Hantera reklamationer och returer enligt rutin',
        ],
      },
      {
        rubrik: 'Säkerhet och hygien',
        punkter: [
          'Följa lagrets säkerhetsrutiner och bära PPE (skyddsskor, hjälm, väst)',
          'Hantera farligt gods enligt ADR vid behov',
          'Genomföra dagliga säkerhetsronder och rapportera incidenter',
          'Hålla arbetsplatsen ren enligt 5S eller motsvarande standard',
        ],
      },
      {
        rubrik: 'Skiftarbete och samverkan',
        punkter: [
          'Genomföra skiftöverlämning till nästa skift med statusrapport',
          'Samverka med produktion, transport och inköp',
          'Stötta nya kollegor under introduktion',
          'Bidra till förbättringsförslag enligt Lean eller Kaizen',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Truckar och behörigheter',
        termer: [
          { term: 'A1', forklaring: 'Plocktruck med plockare i förhöjt läge, vanlig i höglager.' },
          { term: 'A2', forklaring: 'Stå-på-truck för plock i smala gångar, mycket vanlig på e-handelslager.' },
          { term: 'A3', forklaring: 'Sittande plocktruck för höga plockhöjder.' },
          { term: 'A4', forklaring: 'Skjutstativtruck för smala gångar och höglager.' },
          { term: 'B1-B5', forklaring: 'Motviktstruckar i olika storleksklasser för pallhantering och lastning.' },
          { term: 'C', forklaring: 'Sidlastare för långgodshantering.' },
          { term: 'TYA', forklaring: 'Transportfackens Yrkes- och Arbetsmiljönämnd, utfärdar truckutbildning.' },
        ],
      },
      {
        kategori: 'WMS och lagersystem',
        termer: [
          { term: 'SAP WMS', forklaring: 'Marknadsledande WMS, dominerar storbolag och industrilager.' },
          { term: 'Manhattan', forklaring: 'WMS från Manhattan Associates, populärt på e-handelsterminaler.' },
          { term: 'Pyramid', forklaring: 'Svenskt WMS för mindre och medelstora lager.' },
          { term: 'Astro', forklaring: 'WMS för terminal och 3PL-bolag som DB Schenker.' },
          { term: 'Pick-by-voice', forklaring: 'Plocksystem där order kommuniceras via headset, vanlig på e-handel.' },
          { term: 'Pick-by-light', forklaring: 'Plocksystem med ljussignaler vid varje plockplats för snabbhet.' },
          { term: 'RF-scanner', forklaring: 'Handhållen scanner för plockorder, vanligaste plockmetoden.' },
        ],
      },
      {
        kategori: 'Lagertyper och bransch',
        termer: [
          { term: 'E-handelsterminal', forklaring: 'Stora lager för B2C med snabb plock (Klarna Logistics, Amazon).' },
          { term: 'Industrilager', forklaring: 'Lager för tillverkningsbolag (Volvo, Scania, IKEA Industry).' },
          { term: '3PL', forklaring: 'Tredjepartslogistik, lager som driftas på uppdrag av flera kunder.' },
          { term: 'Crossdock', forklaring: 'Genomflöde utan långtidslagring, vanligt på terminaler.' },
          { term: 'Höglager', forklaring: 'Automatiserat lager med pallar i 10-30 meter höjd.' },
          { term: 'Plocklager', forklaring: 'Manuellt lager där plockare hämtar enskilda varor till order.' },
        ],
      },
      {
        kategori: 'Säkerhet och certifikat',
        termer: [
          { term: 'ADR', forklaring: 'Behörighet för transport av farligt gods, förnyas vart femte år.' },
          { term: 'Akta Ryggen', forklaring: 'Certifierad ergonomisk lyfteknik, vanligt krav på lager.' },
          { term: 'BAM', forklaring: 'Bättre arbetsmiljö, grundläggande utbildning för arbetsledare.' },
          { term: 'Heta arbeten', forklaring: 'Certifikat för svetsning eller kapning på arbetsplats.' },
          { term: 'Fallskydd', forklaring: 'Utbildning för arbete på höjd, krävs på höglager.' },
          { term: 'Brandskydd', forklaring: 'Grundläggande brandskyddsutbildning, krav på de flesta lager.' },
        ],
      },
    ],

    typiskaArbetsgivare: [
      {
        kategori: 'Logistik och transport',
        exempel: [
          'PostNord, DB Schenker, DHL, DSV',
          'Bring, Best Transport, Schenker Logistics',
          'Mindre svenska transport- och åkeribolag',
          'Åkerier kopplade till specifika kunder',
        ],
      },
      {
        kategori: 'E-handel och 3PL',
        exempel: [
          'Klarna Logistics, Mathem, Foodora',
          'Boozt, Apotea, NetOnNet, Adlibris',
          'Tredjepartslogistiker (XPO, Geodis, Itella)',
          'Egna e-handelsterminaler för stora kedjor',
        ],
      },
      {
        kategori: 'Industri och tillverkning',
        exempel: [
          'Volvo, Scania, ABB, IKEA Industry',
          'Sandvik, Atlas Copco, Tetra Pak',
          'Tillverkningsbolag i Mälardalen och Småland',
          'Mindre tillverkningsbolag och underleverantörer',
        ],
      },
      {
        kategori: 'Detaljhandel och dagligvaror',
        exempel: [
          'ICA Logistik, Coop, Axfood, Lidl',
          'IKEA, H&M, Stadium centrallager',
          'Apoteket centrallager och distribution',
          'Säsongsarbete på julpaketterminaler',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Truckutbildning enligt TYA (1-5 dagar)',
        beskrivning: 'TYA (Transportfackens Yrkes- och Arbetsmiljönämnd) utfärdar truckutbildning. Längden beror på vilka behörigheter du tar. Krav i de flesta lager och förnyas vart femte år.',
      },
      {
        rubrik: 'Yrkeshögskola lager och logistik (1-2 år)',
        beskrivning: 'YH-utbildningar inom lager, logistik och transport. Kortare väg till arbetsledar- och chefroller. Innehåller WMS-praktik och affärsmässig logistik.',
      },
      {
        rubrik: 'Direkt anställning utan formell utbildning',
        beskrivning: 'Många lager rekryterar utan formell utbildning för plock- och packroller. Truckutbildning betalas ofta av arbetsgivaren efter provanställning. Vanlig väg in.',
      },
      {
        rubrik: 'ADR och säkerhetscertifikat (1-3 dagar)',
        beskrivning: 'ADR-utbildning för farligt gods, fallskydd, brandskydd och Akta Ryggen. Korta certifikatkurser som ger meriterande kompetens utöver grundutbildning.',
      },
    ],

    kompetenser: {
      tekniska: [
        'Truckkort A1-A4 och B1-B5 enligt TYA',
        'WMS-system (SAP WMS, Manhattan, Pyramid, Astro)',
        'Plock med pick-by-voice eller pick-by-light',
        'RF-scanner och handburna terminaler',
        'Cykelräkning och inventering enligt schema',
        'ADR-bevis för farligt gods',
        'Pallhantering, paketering och fraktdokument',
        'Säkerhetsutbildning enligt TYA och Akta Ryggen',
        'Lastsäkring och kontroll av leveranser',
        '5S och Lean-metodik på lagergolv',
        'Skiftöverlämning och rapportering',
        'Produktkunskap inom specifika varugrupper',
      ],
      personliga: [
        'Fysiskt uthållig och stresstålig',
        'Strukturerad i höga tempon',
        'Säkerhetsmedveten',
        'Lagspelare på golvet',
        'Flexibel kring skift och helger',
        'Noggrann i kvalitetskontroll',
        'Pålitlig och punktlig',
      ],
    },

    profilExempel:
      'Erfaren lagerarbetare med 4 års erfarenhet från e-handelsterminal och industrilager. Truckkort A1-A4 och B1-B3 med plockhastighet 180 rader per timme i SAP WMS och 99,7% korrekt plock. ADR-bevis för farligt gods, utbildad i Akta Ryggen och tillgänglig för 2-skift inklusive helger.',

    profilTips:
      'Antal år och branschen (e-handel, industri, terminal) i öppningsraden. Andra meningen lyfter dina specifika behörigheter och plockhastighet. Tredje meningen visar säkerhetscertifikat och tillgänglighet som differentierar dig.',

    rekryterarTipsen: [
      {
        rubrik: 'Truckbehörigheter avgör vilka jobb du kan söka',
        text: 'Lista exakt vilka truckar du har behörighet på (A1, A2, A3, A4, B1, B2, B3, B4, C, D, E). Många annonser kräver specifika behörigheter. Utan rätt papper sorteras du bort omedelbart.',
      },
      {
        rubrik: 'WMS-system och plockerfarenhet',
        text: 'Vilka lagersystem har du arbetat i? SAP WMS, Pyramid, Manhattan, Astro. Plockhastighet (rader per timme) och feltal är CV-relevanta för lager med pick-by-voice eller pick-by-light.',
      },
      {
        rubrik: 'ADR-bevis och säkerhetsutbildning',
        text: 'För lager som hanterar farligt gods (kemikalier, batterier, tryckkärl) är ADR ett krav. Brand- och säkerhetsutbildningar är meriterande för chefroller eller större lagerterminalsanläggningar.',
      },
      {
        rubrik: 'Schemaflexibilitet',
        text: 'Lager kör ofta 2- eller 3-skift, och högsäsong kräver helgarbete. Skriv ut konkret: "Tillgänglig för 2-skift inkl helger" eller "Söker dagtid med möjlighet till sporadiska kvällar". Det sätter dig i rätt urvalslista.',
      },
      {
        rubrik: 'Körkort B är ofta krav',
        text: 'Större terminaler kräver körkort B för att hämta material från olika delar av området. Hemleverans-bolag som Mathem och Foodora kräver det alltid. Skriv ut B om du har det.',
      },
      {
        rubrik: 'Bransch-specialisering',
        text: 'E-handelsterminal kräver snabb plock. Industrilager kräver pallhantering. 3PL kräver flexibilitet med flera kunder. Lyft den bransch där du har djupast erfarenhet i sammanfattningen.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'År av erfarenhet, branscher du arbetat i, dina behörigheter och plockhastighet på 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Företag, lager, tidsperiod. Kärnuppgifter med WMS-system, plockmetod och volym (rader per timme, felfri-procent).' },
      { sektion: 'Utbildning', tips: 'Gymnasium plus truckutbildning (TYA, Lager- och Terminal). Datum för truckkort och eventuella YH-utbildningar.' },
      { sektion: 'Behörigheter', tips: 'Eget block med truckkort (A1-B5), körkort B, ADR och säkerhetscertifikat. Skriv utgångsdatum för varje.' },
      { sektion: 'Kompetenser', tips: 'WMS-system i klartext, plocktyper (pick-by-voice, RF-scanner), produktkunskap. Skiftarbete-tillgänglighet.' },
      { sektion: 'Övrigt', tips: 'Tillgänglighet för 2- eller 3-skift, helger, högsäsong. Eventuella språkkunskaper för internationella terminaler.' },
    ],

    checklista: [
      'Truckutbildning med specifika behörigheter (A1-A4, B1-B5)',
      'Körkort B (ofta krav)',
      'ADR-bevis för farligt gods',
      'Erfarenhet av specifika WMS-system',
      'Plockhastighet (rader per timme) och felfri-procent',
      'Inventering och cykelräkning',
      'Akta Ryggen eller motsvarande säkerhetsutbildning',
      'Tillgänglighet för 2- eller 3-skift, helger',
      'Eventuell brand- eller fallskyddsutbildning',
      'Branschvana (e-handel, industri, terminal, 3PL)',
    ],

    atsInfo:
      'Både vår mall Logistik och premium-varianten Logistik Plus är ATS-säkra. Logistikföretag som DB Schenker, PostNord och DHL använder oftast SAP SuccessFactors eller Workday. Truckbehörigheter ska skrivas exakt som "A1, A2, A3, B1" eftersom det är typiska sökord rekryterare filtrerar på. Skriv också ut WMS-systemnamn (SAP WMS, Manhattan) i klartext.',

    faqItems: [
      {
        q: 'Vad ska finnas med i ett lagerarbetare-CV?',
        a: 'Alla aktiva truckbehörigheter (A1-A4, B1-B5) med utgångsdatum, WMS-system du arbetat i (SAP WMS, Manhattan, Pyramid, Astro), plockhastighet i rader per timme och felfri-procent, eventuella ADR-bevis för farligt gods, säkerhetsutbildningar (Akta Ryggen, brandskydd), körkort B, och tillgänglighet för rotationsschema. Lägg till YH-utbildning om du söker arbetsledar-tjänster.',
      },
      {
        q: 'Hur skriver jag CV som lagerarbetare utan tidigare erfarenhet?',
        a: 'Lyft eventuell tidigare erfarenhet av fysiskt arbete (bygg, jordbruk, produktion), tillgänglighet för rotationsschema, körkort B om du har det, och vilken truckutbildning du gått (TYA-grundkurs är vanlig). Skriv ut din vilja att lära och vara fysiskt aktiv. Många lager tar in nya utan erfarenhet under högsäsong och betalar truckutbildning efter provanställning.',
      },
      {
        q: 'Vilka truckbehörigheter ska jag nämna på CV:t?',
        a: 'Alla aktiva. Skriv typ (A1-A4, B1-B5, C, D, E) och utgångsdatum. För nybörjare lista även vilken utbildning du gått (TYA, Lager- och Terminal, Industrirådets utbildning). Lagerchefer söker ofta efter specifika typer beroende på vilken sorts lager de driver.',
      },
      {
        q: 'Hur viktigt är arbetstider på lager-CV?',
        a: 'Mycket. Många lager kör 2- eller 3-skift, kvällar eller helger. Ange tydligt: "Tillgänglig för 2-skift och helgarbete" eller "Söker dagtid endast". Det sorterar dig direkt in i rätt urvalslista och rekryteraren slipper ringa för att ta reda på det.',
      },
      {
        q: 'Räcker erfarenhet eller behövs utbildning?',
        a: 'Truck och ADR kräver formell utbildning, det är inget alternativ. Men för plock, pack och inventering vinner erfarenhet över utbildning. Specifika WMS-system och plockmetoder är mer värda än generisk "lagerlogistik 50 hp" om du inte söker arbetsledar-roll.',
      },
      {
        q: 'Hur lång ska ett lagerarbetare-CV vara?',
        a: 'En sida räcker för de flesta. Om du har 5+ års erfarenhet med flera bolag och flera behörigheter kan det bli 1,5 sidor. Det viktigaste är att truckbehörigheter, WMS-erfarenhet och senaste arbetsplats syns på första sidan utan att man behöver scrolla.',
      },
      {
        q: 'Vilka nyckelord ska CV:t ha för att passera ATS?',
        a: 'Specifika truckar (A1, A2, A3, B1, B2), WMS-system (SAP WMS, Manhattan, Pyramid, Astro), plocktyper (pick-by-voice, pick-by-light, RF-scanner), säkerhetscertifikat (ADR, Akta Ryggen, fallskydd) och bransch (e-handel, industri, 3PL). SAP SuccessFactors och Workday söker exakta matchningar mot jobbannonsens språk.',
      },
      {
        q: 'Behöver jag personligt brev till lager-tjänster?',
        a: 'Beror på arbetsgivaren. Större bolag som PostNord och DB Schenker förväntar sig oftast brev medan mindre lager och bemanningsbolag kan acceptera bara CV. När brev förväntas, fokusera på tillgänglighet, fysisk uthållighet och varför just det lagret. Håll till en sida på 250-350 ord.',
      },
      {
        q: 'Hur lyfter jag plockhastighet utan formell mätning?',
        a: 'De flesta WMS-system mäter plockhastighet automatiskt. Fråga din chef om dina siffror för senaste kvartalet eller året. Om du inte kan få ut exakt data, använd ungefärliga siffror med försiktighet ("ca 150 rader per timme") eller lyft kvalitativa resultat ("alltid topp-3 på avdelningen").',
      },
      {
        q: 'Vad ska jag inte ha med på mitt lagerarbetare-CV?',
        a: 'Personnummer (bara födelseår), löneförväntningar, irrelevanta arbetslivserfarenheter äldre än 10-15 år, generiska påståenden ("hårt arbetande och ansvarstagande") utan stöd, hobbies som inte är lagerrelevanta, och utgångna truckkort eller certifikat. Stavfel och inkonsekvent formatering signalerar slarv, vilket är negativt i en bransch där noggrannhet räknas.',
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

  'forskollarare': {
    seoIntro:
      'Som förskollärare i Sverige bedöms du på lärarlegitimation, pedagogisk skicklighet och förmåga att tolka Lpfö 18 i praktiken. Sveriges 290 kommuner och tusentals fristående förskolor har konstant brist på behöriga förskollärare, men rektorer slänger CV:n som inte tydligt visar legitimation och pedagogisk identitet. Ett välskrivet CV avgör om du blir kallad till intervju på den förskola du faktiskt vill jobba på.\n\nVår mall för förskollärare lyfter lärarlegitimation från Skolverket, Lpfö 18-kompetens och pedagogiska metoder som första visuella element. Vi har strukturerat erfarenhetssektionen så att förskola, huvudman och åldersgrupp syns direkt med konkreta uppdrag som mentorskap eller utvecklingsuppdrag. Det betyder att rektorer kan bedöma din matchning på fem sekunder.\n\nKonkret innehåll vi rekommenderar: förskollärarexamen med lärosäte och år, lärarlegitimation från Skolverket, pedagogisk inriktning (Reggio Emilia, Montessori, Waldorf, traditionell), åldersgrupper du arbetat med (1-3 år, 3-5 år), erfarenhet av barn med särskilda behov (NPF, språkstöd, integration), digital pedagogik (lärplattor, dokumentation), samverkan med vårdnadshavare, samt eventuella språkkunskaper för flerspråkiga förskolor.\n\nNedan hittar du två CV-mallar designade för förskollärarrollen, ett färdigt CV-exempel att utgå från, och konkreta tips på vad rektorer i kommunal och fristående förskola faktiskt letar efter. Ladda ner mallen gratis och anpassa efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'Award',
        title: 'Lärarlegitimation och behörighet först',
        description: 'Skriv ut Skolverkets registrering med datum. Förskollärarlegitimation är krav i kommunala förskolor och allt vanligare i fristående. Lyft den i sidopanelen så rektorer kan bekräfta status på fem sekunder.',
      },
      {
        icon: 'Target',
        title: 'Pedagogisk inriktning är differentiator',
        description: 'Reggio Emilia, Montessori, Waldorf, traditionell pedagogik. Olika förskolor söker olika inriktningar. Lyft den du har djupast erfarenhet av i sammanfattningen så rektor direkt ser om ni matchar.',
      },
      {
        icon: 'CheckCircle',
        title: 'Åldersgrupp och barngruppsstorlek',
        description: '"4 år på avdelning för 3-5-åringar med 18 barn" säger mer än "arbetade i förskolan". Konkreta åldrar och gruppsstorlek visar din kapacitet och vad du klarar i en svensk förskolas vardag.',
      },
      {
        icon: 'FileText',
        title: 'Lpfö 18 och systematiskt kvalitetsarbete',
        description: 'Förskolans läroplan från 2018 är grunden. Beskriv hur du tolkat och tillämpat Lpfö 18, hur du dokumenterar barns lärande och bidragit till SKA (systematiskt kvalitetsarbete). Visa pedagogisk struktur.',
      },
      {
        icon: 'Briefcase',
        title: 'Digital pedagogik och dokumentation',
        description: 'Lärplattor, Tyra, Snitch, Pluttra eller Vklass. Beskriv vilka digitala verktyg du använt för pedagogisk dokumentation och föräldrakommunikation. Allt viktigare 2026.',
      },
      {
        icon: 'TrendingUp',
        title: 'Specialpedagogik och flerspråkighet',
        description: 'NPF-kompetens, språkstöd, TAKK (tecken som stöd), bildstöd. Många förskolor har barn med särskilda behov eller flerspråkig bakgrund. Specifika metoder är meriterande.',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'Legitimation och behörighet överst',
        description: 'Vi har gjort Skolverkets legitimation till första visuella element så rektorer kan bekräfta status på fem sekunder. Inriktning och åldersgrupp lyfts i samma block utan att gömmas i en utbildningssektion.',
      },
      {
        title: 'Pedagogisk erfarenhet per förskola',
        description: 'Mallen separerar förskolor, huvudman (kommunal eller fristående) och åldersgrupp. Du kan visa bredd över olika pedagogiska inriktningar utan att meriter konkurrerar om samma yta.',
      },
      {
        title: 'Eget block för pedagogiska metoder',
        description: 'Reggio Emilia, Montessori, NPF-kompetens, språkstöd, TAKK. Mallen lyfter metoder som eget block så rektorer letar specifikt efter pedagogik som matchar deras förskola.',
      },
      {
        title: 'Premium-mallen lägger till foto',
        description: 'I förskollärarrollen där relationer värderas, lägger premium-varianten till foto och språkkunskaper. Skapar ett mer personligt intryck som passar pedagogiskt yrke utan att kompromissa med ATS.',
      },
      {
        title: 'Salviegrön ton för pedagogisk identitet',
        description: 'Vi har valt dämpade salviegröna och navy-toner som signalerar lugn och pedagogisk medvetenhet. Dragna från Skolverkets visuella språk men anpassade för individuell ansökan.',
      },
      {
        title: 'Plats för utvecklingsprojekt',
        description: 'Mentorskap för nya förskollärare, ansvarsområden (utomhuspedagogik, naturkunskap, språkutveckling) har egen rad. Visar att du tar ansvar bortom vardagsarbete och meriterar för förstelärarroller.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Pedagogisk planering och genomförande',
        punkter: [
          'Planera, genomföra och utvärdera pedagogiska aktiviteter enligt Lpfö 18',
          'Anpassa undervisning för olika åldrar och utvecklingsnivåer',
          'Använda lekens potential för lärande och språkutveckling',
          'Implementera pedagogiska metoder (Reggio Emilia, Montessori, naturpedagogik)',
        ],
      },
      {
        rubrik: 'Barns utveckling och lärande',
        punkter: [
          'Observera och dokumentera enskilda barns utveckling över tid',
          'Bedöma barns behov av stöd och anpassningar',
          'Stötta språkutveckling med TAKK, bildstöd eller flerspråkig pedagogik',
          'Identifiera tidiga signaler på utvecklingsavvikelser och samverka med specialpedagog',
        ],
      },
      {
        rubrik: 'Vårdnadshavarsamverkan',
        punkter: [
          'Genomföra introduktions-, utvecklings- och avslutningssamtal',
          'Kommunicera daglig hämtning och lämning med trygghet',
          'Använda digital plattform (Tyra, Snitch, Pluttra) för dokumentation',
          'Hantera konflikter och svåra samtal med lugn och respekt',
        ],
      },
      {
        rubrik: 'Trygghet och omsorg',
        punkter: [
          'Säkerställa barnens fysiska och emotionella säkerhet under hela dagen',
          'Stötta måltidssituationer, vila och toalettrutiner',
          'Hantera kränkande särbehandling enligt likabehandlingsplanen',
          'Bygga trygga anknytningar med varje barn i gruppen',
        ],
      },
      {
        rubrik: 'Kollegial samverkan och utveckling',
        punkter: [
          'Delta i arbetslag och pedagogiska planeringsmöten',
          'Bidra till systematiskt kvalitetsarbete (SKA) och årshjul',
          'Mentor för barnskötare och nya kollegor under introduktion',
          'Delta i kompetensutveckling och förbättringsprojekt',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Lagstiftning och styrdokument',
        termer: [
          { term: 'Lpfö 18', forklaring: 'Läroplan för förskolan från 2018, grunden för all pedagogisk planering.' },
          { term: 'Skollagen', forklaring: 'Reglerar förskolans verksamhet, barnens rätt till stöd och rektors ansvar.' },
          { term: 'Barnkonventionen', forklaring: 'Sedan 2020 svensk lag, vägleder hela förskolans förhållningssätt.' },
          { term: 'Likabehandlingsplan', forklaring: 'Krav enligt diskrimineringslagen, ska finnas på varje förskola.' },
          { term: 'SKA', forklaring: 'Systematiskt kvalitetsarbete, krav enligt Skollagen för förskolor.' },
          { term: 'Anmälningsplikt', forklaring: 'Skyldighet att anmäla oro för barn till socialtjänsten enligt SoL 14:1.' },
        ],
      },
      {
        kategori: 'Pedagogiska inriktningar',
        termer: [
          { term: 'Reggio Emilia', forklaring: 'Italiensk pedagogik med fokus på barns kompetens och miljöns roll.' },
          { term: 'Montessori', forklaring: 'Pedagogik baserad på självständigt lärande med specialdesignat material.' },
          { term: 'Waldorf', forklaring: 'Pedagogik från Steiners filosofi med fokus på rytm och kreativitet.' },
          { term: 'Utomhuspedagogik', forklaring: 'Lärande genom natur och friluftsliv, vanligt i I Ur och Skur-förskolor.' },
          { term: 'Språkstöd', forklaring: 'Pedagogiska metoder för flerspråkiga barn och språkutveckling.' },
          { term: 'TAKK', forklaring: 'Tecken som Alternativ och Kompletterande Kommunikation, för barn med kommunikationssvårigheter.' },
        ],
      },
      {
        kategori: 'Behörigheter och utbildning',
        termer: [
          { term: 'Förskollärarexamen', forklaring: 'Akademisk examen från lärarprogrammet med inriktning förskola, 3,5 år.' },
          { term: 'Lärarlegitimation', forklaring: 'Utfärdas av Skolverket, krävs i kommunal förskola och allt fler fristående.' },
          { term: 'KPU förskollärare', forklaring: 'Kompletterande pedagogisk utbildning för dig med annan akademisk examen.' },
          { term: 'Barnskötare', forklaring: 'Yrkesutbildad personal som kompletterar förskolläraren i barngruppen.' },
          { term: 'Förstelärare', forklaring: 'Senior pedagogisk roll med utvecklingsuppdrag och högre lön.' },
          { term: 'Specialpedagog förskola', forklaring: 'Vidareutbildning för arbete med barn i behov av särskilt stöd.' },
        ],
      },
      {
        kategori: 'Digitala verktyg och dokumentation',
        termer: [
          { term: 'Tyra', forklaring: 'Vanligaste plattformen för pedagogisk dokumentation och föräldrakontakt.' },
          { term: 'Snitch', forklaring: 'Plattform för dokumentation, schema och kommunikation med vårdnadshavare.' },
          { term: 'Pluttra', forklaring: 'Digital plattform för förskolans dokumentation och föräldrakommunikation.' },
          { term: 'Skola24', forklaring: 'System för schemaläggning, frånvaro och administrativ hantering.' },
          { term: 'Lärlogg', forklaring: 'Pedagogisk dokumentation av barns lärande och utveckling.' },
          { term: 'Pedagogisk dokumentation', forklaring: 'Process för att synliggöra barns lärprocesser enligt Reggio Emilia.' },
        ],
      },
    ],

    typiskaArbetsgivare: [
      {
        kategori: 'Kommunal förskola',
        exempel: [
          'Stockholms stad, Göteborgs stad, Malmö stad',
          'Mindre och medelstora kommuner runt om i Sverige',
          'Förskolor med särskild inriktning (utomhus, kultur, idrott)',
          'Familjedaghem och pedagogisk omsorg',
        ],
      },
      {
        kategori: 'Fristående förskolekoncerner',
        exempel: [
          'Pysslingen, Inspira, Norlandia, Tellusbarn',
          'AcadeMedia, Atvexa, Vittra, Engelska Förskolan',
          'Kooperativ och föräldradrivna förskolor',
          'Religiösa friskolor och idéburna huvudmän',
        ],
      },
      {
        kategori: 'Pedagogiska inriktningar',
        exempel: [
          'Reggio Emilia-inspirerade förskolor',
          'Montessoriförskolor',
          'Waldorfförskolor (Steiner)',
          'I Ur och Skur (utomhuspedagogik)',
        ],
      },
      {
        kategori: 'Specialiserade verksamheter',
        exempel: [
          'Förskolor med språkprofil',
          'Habilitering och resursförskolor',
          'Internationella förskolor (engelska, spanska, franska)',
          'Bemanningsbolag (Lärarjobb, Vikariat.se)',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Förskollärarprogrammet (3,5 år)',
        beskrivning: 'Akademisk examen från lärarprogrammet med inriktning förskola, kandidat-nivå. Ges vid 24 lärosäten i Sverige. Innehåller VFU på olika förskolor. Examen ger rätt att söka legitimation från Skolverket.',
      },
      {
        rubrik: 'KPU förskollärare (1,5 år)',
        beskrivning: 'Kompletterande pedagogisk utbildning för dig med annan akademisk examen. Vanlig väg för yrkesväxlare från andra branscher. Innehåller pedagogik, didaktik och VFU.',
      },
      {
        rubrik: 'Validering av utländsk utbildning',
        beskrivning: 'Har du utländsk lärarutbildning kan du validera den genom Universitets- och högskolerådet. Komplettering med svenska och pedagogiska kurser kan krävas innan legitimation.',
      },
      {
        rubrik: 'Specialpedagog förskola (3 år deltid)',
        beskrivning: 'Vidareutbildning till specialpedagog med fokus på barn i behov av särskilt stöd. Magisterexamen krävs. Stark efterfrågan i alla huvudmän.',
      },
    ],

    kompetenser: {
      tekniska: [
        'Lpfö 18 och systematiskt kvalitetsarbete (SKA)',
        'Pedagogisk dokumentation enligt Reggio Emilia',
        'Lärarlegitimation från Skolverket',
        'Pedagogiska inriktningar (Reggio, Montessori, Waldorf)',
        'NPF-kompetens (autism, ADHD, språkstörning)',
        'TAKK och bildstöd för kommunikation',
        'Digital pedagogik (Tyra, Snitch, Pluttra)',
        'Likabehandlingsarbete och anmälningsplikt',
        'Språkstöd och flerspråkig pedagogik',
        'Naturpedagogik och utomhusvistelse',
        'Skapande verksamhet (bild, musik, drama)',
        'Hjärt-lungräddning och första hjälpen',
      ],
      personliga: [
        'Tålmodig och lyhörd för barns behov',
        'Strukturerad i pedagogisk planering',
        'Empatisk och relationsskapande',
        'Pedagogisk i mötet med vårdnadshavare',
        'Kollegial och samverkansorienterad',
        'Lugn vid konflikter och kriser',
        'Reflekterande över egen praktik',
      ],
    },

    profilExempel:
      'Legitimerad förskollärare med 6 års erfarenhet från kommunal och fristående Reggio Emilia-inspirerad förskola. Specialiserad på språkutveckling för flerspråkiga barn 3-5 år med TAKK och bildstöd. Mentor för 4 nya kollegor och delaktig i förskolans systematiska kvalitetsarbete enligt Lpfö 18.',

    profilTips:
      'Lärarlegitimation, år av erfarenhet och pedagogisk inriktning i öppningsraden. Andra meningen lyfter åldersgrupp och eventuell specialisering (språkstöd, NPF, naturpedagogik). Tredje meningen visar utvecklingsuppdrag eller kollegiala uppdrag som differentierar dig.',

    rekryterarTipsen: [
      {
        rubrik: 'Lärarlegitimation och behörighet',
        text: 'Skriv ut Skolverkets registrering med datum. Förskollärarlegitimation är krav i kommunala förskolor och allt vanligare i fristående. Rektorer letar specifikt efter behörighet och kan inte erbjuda fast tjänst utan legitimation.',
      },
      {
        rubrik: 'Pedagogisk inriktning är differentiator',
        text: 'Reggio Emilia, Montessori, Waldorf, traditionell pedagogik, utomhuspedagogik. Olika förskolor söker olika inriktningar. Lyft den du har djupast erfarenhet av i sammanfattningen så rektor direkt ser om ni matchar.',
      },
      {
        rubrik: 'Åldersgrupp och barngruppsstorlek',
        text: '"4 år på avdelning för 3-5-åringar med 18 barn" säger mer än "arbetade i förskolan". Konkreta åldrar och gruppsstorlek visar din kapacitet i en svensk förskolas vardag.',
      },
      {
        rubrik: 'Lpfö 18 och kvalitetsarbete',
        text: 'Beskriv hur du tolkat och tillämpat Lpfö 18, hur du dokumenterar barns lärande och bidragit till SKA. Visar pedagogisk struktur som rektorer i kommunal sektor specifikt letar efter.',
      },
      {
        rubrik: 'Specialkompetens och stöd',
        text: 'NPF-kompetens, språkstöd, TAKK, bildstöd, samverkan med specialpedagog. Många förskolor har barn med särskilda behov. Specialkompetens öppnar specifika tjänster och påverkar lönen.',
      },
      {
        rubrik: 'Digital pedagogik och dokumentation',
        text: 'Tyra, Snitch, Pluttra, lärplattor i barngrupp. Beskriv vilka digitala verktyg du använt för pedagogisk dokumentation och föräldrakommunikation. Allt viktigare 2026 och meriterande för utvecklingsuppdrag.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'Lärarlegitimation, år av erfarenhet, pedagogisk inriktning och primär huvudman. Eventuella specialiseringar på 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Förskola, huvudman, tidsperiod och åldersgrupp. Konkreta uppdrag (mentorskap, ansvarsområden) och pedagogisk inriktning.' },
      { sektion: 'Utbildning', tips: 'Förskollärarexamen med lärosäte och år. VFU-förskolor om relevanta. Vidareutbildningar (Reggio, NPF, TAKK, specialpedagog).' },
      { sektion: 'Kompetenser', tips: 'Pedagogiska metoder, digitala verktyg, specialpedagogiska anpassningar. Skriv ut systemnamn (Tyra, Snitch) i klartext.' },
      { sektion: 'Vidareutbildning', tips: 'Reggio Emilia-fördjupning, NPF-kurs, TAKK-utbildning, specialpedagog. Kontinuerlig kompetensutveckling visar engagemang.' },
      { sektion: 'Övrigt', tips: 'Språkkunskaper utöver svenska (värdefulla i flerspråkiga förskolor), eventuell handledarutbildning, körkort om relevant.' },
    ],

    checklista: [
      'Förskollärarexamen från svenskt eller validerat lärosäte',
      'Lärarlegitimation från Skolverket med datum',
      'Pedagogisk inriktning du arbetat efter',
      'Åldersgrupper och barngruppsstorlek per förskola',
      'Erfarenhet av Lpfö 18 och systematiskt kvalitetsarbete',
      'Specialkompetens (NPF, språkstöd, TAKK)',
      'Digitala verktyg du använder (Tyra, Snitch, Pluttra)',
      'Samverkan med vårdnadshavare och specialpedagog',
      'Eventuella mentor- eller utvecklingsuppdrag',
      'Språkkunskaper utöver svenska',
    ],

    atsInfo:
      'Både vår mall Norrsken och premium-varianten Pedagog är ATS-säkra. Kommunala förskolor använder oftast Visma Recruit, fristående koncerner använder Workday eller Teamtailor. Skriv ut "förskollärarlegitimation" och "Lpfö 18" i klartext eftersom rekryterare filtrerar exakta termer. Pedagogisk inriktning (Reggio Emilia, Montessori) ska också skrivas ut.',

    faqItems: [
      {
        q: 'Vad ska finnas med i ett förskollärar-CV?',
        a: 'Förskollärarexamen med lärosäte, lärarlegitimation från Skolverket med datum, pedagogisk inriktning, klinisk erfarenhet uppdelad per förskola och åldersgrupp, barngruppsstorlek, pedagogiska metoder du behärskar, digitala verktyg (Tyra, Snitch), specialkompetens (NPF, språkstöd, TAKK), samverkan med vårdnadshavare, samt språkkunskaper. Lägg till mentorskap om du söker senior-roller.',
      },
      {
        q: 'Hur skriver jag CV som nyutbildad förskollärare?',
        a: 'Lyft VFU-perioder med förskola, antal veckor och vad du fick göra. Inkludera examensarbete med titel och eventuell publicering. Praktiska kurser (TAKK, NPF), tidigare erfarenhet av barn (vikarie, idrottsledare, fritids), och språkkunskaper väger tungt. Skriv ut din vilja och förmåga att lära. Många kommuner har strukturerade introduktionsprogram för nyexade förskollärare.',
      },
      {
        q: 'Behöver jag lärarlegitimation för att jobba i förskola?',
        a: 'För kommunal förskola krävs förskollärarlegitimation för att få fast tjänst. Vikariat går utan men begränsade till 6 månader åt gången. Många fristående huvudmän kräver också legitimation. Utan legitimation kan du jobba som barnskötare, men inte som ansvarig förskollärare för barngrupp.',
      },
      {
        q: 'Hur viktig är pedagogisk inriktning?',
        a: 'Mycket. Reggio Emilia-förskolor söker förskollärare med Reggio-erfarenhet eller -intresse. Montessoriförskolor kräver ofta Montessori-utbildning. Traditionella kommunala förskolor är mer flexibla. Lyft din inriktning i sammanfattningen så rektorer direkt kan bedöma matchning.',
      },
      {
        q: 'Vilka digitala verktyg ska jag kunna 2026?',
        a: 'Tyra, Snitch och Pluttra är de tre vanligaste plattformarna för pedagogisk dokumentation och föräldrakontakt. Lärplattor (iPad) i barngrupp för digital läsning, fotodokumentation och pedagogiska appar. Skola24 för schema och frånvaro. Att vara öppen för AI-baserade verktyg blir allt viktigare.',
      },
      {
        q: 'Hur visar jag erfarenhet av barn med särskilda behov?',
        a: 'Beskriv konkret typ av stöd (NPF, autism, ADHD, språkstörning, motorik) och hur du arbetat. "Anpassade verksamhet för 3 barn med autism med bildstöd och struktur, samverkan med specialpedagog veckovis" säger mer än "har erfarenhet av barn med särskilda behov". Inkludera samverkan med specialpedagog och elevhälsoteam.',
      },
      {
        q: 'Vilka nyckelord ska CV:t ha för att passera ATS?',
        a: 'Specifika behörigheter (förskollärarlegitimation), läroplan (Lpfö 18), pedagogiska metoder (Reggio Emilia, Montessori, utomhuspedagogik, TAKK), digitala system (Tyra, Snitch, Pluttra) och eventuella specialiseringar (NPF, språkstöd, specialpedagog). Visma Recruit och Workday söker exakta matchningar.',
      },
      {
        q: 'Hur lång ska ett förskollärar-CV vara?',
        a: 'En sida räcker för nyutexaminerade. Med 5-10 års erfarenhet är 1,5 sidor lagom. Förstelärare och specialpedagoger kan ha upp till 2 sidor. Det viktiga är att lärarlegitimation och senaste tjänsten syns på första sidan utan att man behöver scrolla.',
      },
      {
        q: 'Behöver jag personligt brev till förskollärartjänster?',
        a: 'Ja, för de flesta tjänster i Sverige förväntas ett personligt brev. Använd brevet för att förklara varför just den förskola och beskriv en specifik situation där du visat din pedagogiska förmåga. Beskriv ett barn du hjälpt utvecklas eller hur du arbetat med en svår grupp. Håll till en sida på 300-400 ord.',
      },
      {
        q: 'Vad ska jag inte ha med på mitt förskollärar-CV?',
        a: 'Personnummer (bara födelseår), foto i offentlig sektor (riskerar diskriminering), löneförväntningar, irrelevanta arbetslivserfarenheter äldre än 10-15 år, generiska påståenden ("god kommunikationsförmåga") utan stöd, namn på enskilda barn, sekretessbelagda detaljer från arbetsplaner, och hobbies som inte är pedagogiskt relevanta. Stavfel diskvalificerar direkt.',
      },
    ],
  },

  'personlig-assistent': {
    seoIntro:
      'Som personlig assistent jobbar du nära en brukare med funktionsvariation där kontinuitet, lyhördhet och personkemi avgör mer än formella meriter. Frösunda, Humana, Nytida och Olivia är de stora privata assistansanordnarna i Sverige. Tillsammans med kommunerna och brukarkooperativen finns tusentals öppna tjänster. Ett välskrivet CV avgör om du blir kallad till första intervju med brukare och anhöriga.\n\nVår mall för personliga assistenter lyfter erfarenhet med olika funktionsvariationer, schemaflexibilitet och språkkunskaper som första visuella element. Vi har strukturerat erfarenhetssektionen så att brukargrupper, arbetsplats och tidsperiod syns direkt med eventuella specialkompetenser. Det betyder att assistenter, anhöriga och anordnare snabbt kan bedöma om ni matchar.\n\nKonkret innehåll vi rekommenderar: erfarenhet av specifika funktionsvariationer (autism, NPF, fysiska funktionsnedsättningar, förvärvad hjärnskada), hjälpmedel och tekniker (lyft, kommunikationshjälpmedel, AKK), körkort B (ofta krav), eventuella språkkunskaper (för brukare med flerspråkig bakgrund), schemaflexibilitet (jour, helger, nätter), och eventuella delegeringar (insulin, sondmat, medicin).\n\nNedan hittar du två CV-mallar designade för rollen som personlig assistent, ett färdigt CV-exempel att utgå från, och konkreta tips på vad assistansanordnare och brukare faktiskt letar efter. Ladda ner mallen gratis och anpassa efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'CheckCircle',
        title: 'Erfarenhet av specifika funktionsvariationer',
        description: 'Autism, ADHD, intellektuell funktionsnedsättning, CP-skada, ALS, MS, förvärvad hjärnskada. Olika brukare kräver olika kompetens. Skriv konkret om vilka funktionsvariationer du arbetat med och hur länge.',
      },
      {
        icon: 'Briefcase',
        title: 'Körkort B är ofta krav',
        description: 'Många brukare behöver assistans vid resor, sjukvårdsbesök eller fritidsaktiviteter. Körkort B är vanligtvis krav, ibland även BE för anpassade fordon. Skriv ut det tydligt i CV:t och eventuell körrutin.',
      },
      {
        icon: 'Award',
        title: 'Hjälpmedel och tekniska lösningar',
        description: 'Personlift, taklyft, andningshjälpmedel, AKK (alternativ kommunikation), bildstöd, ögonstyrning. Erfarenhet av specifika hjälpmedel är värdefullt och gör introduktionstiden kortare för anordnaren.',
      },
      {
        icon: 'TrendingUp',
        title: 'Schemaflexibilitet och kontinuitet',
        description: 'Brukare värderar långa anställningar mer än bredd. Skriv ut hur länge du jobbat med varje brukare och din tillgänglighet (jour, helg, natt). Nattjour och beredskap kräver särskild hantering enligt arbetstidslagen.',
      },
      {
        icon: 'Target',
        title: 'Språkkunskaper är värdefullt',
        description: 'Brukare med utländsk bakgrund eller anhöriga som inte talar svenska kräver assistenter med rätt språk. Arabiska, persiska, somaliska, finska, polska. Lägg språk synligt i sidopanelen.',
      },
      {
        icon: 'FileText',
        title: 'Delegeringar och sjukvårdsuppgifter',
        description: 'Insulin, sondmatning, medicin via PEG, andningsövervakning. Vissa brukare behöver assistenter med sjukvårdsdelegering från sjuksköterska. Lyft eventuella delegeringar med datum.',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'Brukargrupper och funktionsvariationer överst',
        description: 'Vår mall lyfter dina erfarenheter med specifika funktionsvariationer i sidopanelen. Anordnare ser direkt om du matchar brukarens behov utan att behöva scrolla genom hela CV:t.',
      },
      {
        title: 'Plats för långa relationer',
        description: 'Mallen separerar brukare och tidsperiod så kontinuitet syns visuellt. "Personlig assistent åt samma brukare 4 år" är hård valuta inom assistansbranschen och vi lyfter det medvetet.',
      },
      {
        title: 'Eget block för körkort och hjälpmedel',
        description: 'Körkort B, anpassade fordon, lyfthjälpmedel och AKK har egen rad. Många brukare behöver specifika kompetenser och vår mall låter dem syns utan att blanda in i generisk text.',
      },
      {
        title: 'Premium-mallen lägger till foto',
        description: 'I assistansrollen där relationer värderas mest, lägger premium-varianten till foto och språkkunskaper i sidopanelen. Skapar ett mer personligt intryck för brukare och anhöriga som väljer kandidater.',
      },
      {
        title: 'Sober färgsättning för omsorgssektorn',
        description: 'Omsorgssektorn värderar saklighet och respekt. Vi har valt dämpade emerald- och navy-toner som signalerar trygghet utan att bli sterila. Inget i mallen drar fokus från meritbilden.',
      },
      {
        title: 'Plats för språk och kulturell kompetens',
        description: 'Brukare med utländsk bakgrund söker assistenter med rätt språk och kulturella förståelse. Mallen har dedikerat block för språkkunskaper utöver svenska och engelska.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Personlig omsorg och hygien',
        punkter: [
          'Hjälp med daglig livsföring: hygien, måltider, påklädning, toalettbesök',
          'Assistans vid förflyttning med eller utan hjälpmedel',
          'Stöd vid medicinering, sondmatning eller andningsövervakning vid behov',
          'Anpassa stödet efter brukarens egna önskemål och självbestämmande',
        ],
      },
      {
        rubrik: 'Aktivering och delaktighet',
        punkter: [
          'Stötta brukaren i fritidsaktiviteter och sociala sammanhang',
          'Bistå vid resor, sjukvårdsbesök och myndighetskontakt',
          'Hjälpa till med matlagning, hushållsarbete och inköp',
          'Möjliggöra arbete, studier eller frivilligengagemang',
        ],
      },
      {
        rubrik: 'Kommunikation och anpassning',
        punkter: [
          'Använda AKK (alternativ och kompletterande kommunikation), bildstöd, TAKK',
          'Tolka och respektera brukarens önskemål även vid kommunikationssvårigheter',
          'Stötta vid kontakt med anhöriga, arbetsgivare och myndigheter',
          'Anpassa stödet efter brukarens kognitiva förmåga och dagsform',
        ],
      },
      {
        rubrik: 'Säkerhet och hälsa',
        punkter: [
          'Hantera medicinska delegeringar enligt sjuksköterskas instruktion',
          'Förebygga trycksår, fall och andra hälsorisker',
          'Larma 112 eller jour vid akuta situationer',
          'Dokumentera avvikelser och anmäla enligt Lex Sarah vid behov',
        ],
      },
      {
        rubrik: 'Samverkan och dokumentation',
        punkter: [
          'Samverka med anhöriga, gode män och andra assistenter',
          'Delta i assistansmöten och planeringssamtal med arbetsledaren',
          'Dokumentera arbetspass och avvikelser i anordnarens system',
          'Stötta brukarens egen ledarroll i sin assistans',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Lagstiftning och regelverk',
        termer: [
          { term: 'LSS', forklaring: 'Lagen om stöd och service, ger rätt till personlig assistans vid stora behov.' },
          { term: 'LASS', forklaring: 'Lagen om assistansersättning, reglerar Försäkringskassans betalning.' },
          { term: 'SoL', forklaring: 'Socialtjänstlagen, kan ge rätt till assistans när LSS inte räcker.' },
          { term: 'Lex Sarah', forklaring: 'Anmälningsskyldighet vid missförhållanden i socialtjänst och LSS.' },
          { term: 'OSL', forklaring: 'Offentlighets- och sekretesslagen, gäller när du har info om brukaren.' },
          { term: 'Anhöriganställning', forklaring: 'Vissa LSS-insatser kan utföras av anhörig som anställs.' },
        ],
      },
      {
        kategori: 'Funktionsvariationer',
        termer: [
          { term: 'NPF', forklaring: 'Neuropsykiatriska funktionsnedsättningar (autism, ADHD, Tourettes).' },
          { term: 'CP', forklaring: 'Cerebral pares, motorisk funktionsnedsättning från hjärnskada vid födsel.' },
          { term: 'ALS', forklaring: 'Amyotrofisk lateralskleros, progredierande sjukdom som ger ökat assistansbehov.' },
          { term: 'MS', forklaring: 'Multipel skleros, neurologisk sjukdom som varierar i intensitet.' },
          { term: 'Förvärvad hjärnskada', forklaring: 'Skada efter olycka eller stroke som ger varaktig funktionsnedsättning.' },
          { term: 'Intellektuell funktionsnedsättning', forklaring: 'Tidigare kallat utvecklingsstörning, varierar från lätt till grav.' },
        ],
      },
      {
        kategori: 'Hjälpmedel och tekniker',
        termer: [
          { term: 'Personlift', forklaring: 'Mobilt lyfthjälpmedel för förflyttning från säng eller stol.' },
          { term: 'Taklyft', forklaring: 'Fast monterad lyft i tak för säkra förflyttningar.' },
          { term: 'AKK', forklaring: 'Alternativ och Kompletterande Kommunikation för brukare som inte talar.' },
          { term: 'Bildstöd', forklaring: 'Bildkommunikation enligt PCS, Pictogram eller liknande.' },
          { term: 'Ögonstyrning', forklaring: 'Tobii eller motsvarande system där brukaren styr dator med ögonen.' },
          { term: 'Andningshjälpmedel', forklaring: 'CPAP, BiPAP, hemventilator eller hostmaskin för andningsstöd.' },
        ],
      },
      {
        kategori: 'Anordnare och organisation',
        termer: [
          { term: 'Anordnare', forklaring: 'Företag eller kommun som driver assistansen och är arbetsgivare.' },
          { term: 'Brukarkooperativ', forklaring: 'Kooperativ ägd av brukarna själva (JAG, Frösunda Bryggan).' },
          { term: 'Assistansersättning', forklaring: 'Pengar från Försäkringskassan som finansierar assistansen.' },
          { term: 'Assistansbeslut', forklaring: 'LSS-handläggarens beslut om antal timmar per vecka.' },
          { term: 'Beredskapstjänst', forklaring: 'Tillgänglig på distans, ofta nattetid med utryckning vid behov.' },
          { term: 'Jourtjänst', forklaring: 'Sömntid hos brukaren med möjlighet att rycka in vid behov.' },
        ],
      },
    ],

    typiskaArbetsgivare: [
      {
        kategori: 'Stora privata anordnare',
        exempel: [
          'Frösunda Personlig Assistans',
          'Humana Assistans',
          'Nytida (tidigare Olivia)',
          'Attendo, Vardaga, Olivia',
        ],
      },
      {
        kategori: 'Brukarkooperativ',
        exempel: [
          'JAG (Jämlikhet, Assistans, Gemenskap)',
          'Bryggan (tidigare Frösunda Bryggan)',
          'IfA (Intressegruppen för Assistansberättigade)',
          'Lokala kooperativ i kommunerna',
        ],
      },
      {
        kategori: 'Mindre privata anordnare',
        exempel: [
          'Veteranpoolen Assistans',
          'Assistansia, Capere Assistans',
          'KFO-anslutna och idéburna anordnare',
          'Lokala anordnare i kommuner',
        ],
      },
      {
        kategori: 'Kommunal regi och anhöriganställning',
        exempel: [
          'Kommunala assistansenheter',
          'Anhöriganställning hos brukarens egen anordnare',
          'Egen arbetsgivare där brukaren är arbetsledare',
          'Ideella föreningar och stiftelser',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Direkt anställning utan formell utbildning',
        beskrivning: 'Många anordnare rekryterar utan formell vårdutbildning om du visar lyhördhet, körkort B och rätt schemaflexibilitet. Anordnaren ger introduktion på 1-2 veckor parallellt med brukaren.',
      },
      {
        rubrik: 'Vård- och omsorgsutbildning (1-3 år)',
        beskrivning: 'Vård- och omsorgsprogrammet på gymnasium eller komvux ger fördel för komplexa brukare med medicinska behov. Vanlig grund för anhöriganställda och senior-roller.',
      },
      {
        rubrik: 'Yrkeshögskola personlig assistent (1-2 år)',
        beskrivning: 'YH-utbildningar med inriktning personlig assistans, funktionsstöd eller assistans för specifika diagnoser. Ger fördjupning och kvalificerar för arbetsledar-roller.',
      },
      {
        rubrik: 'Internutbildningar från anordnare',
        beskrivning: 'Frösunda, Humana och andra större anordnare har strukturerade internutbildningar med fokus på specifika brukargrupper, hjälpmedel och bemötande. Värdefullt för assistenter som vill specialisera sig.',
      },
    ],

    kompetenser: {
      tekniska: [
        'Personlig omvårdnad och ADL-stöd',
        'Förflyttningsteknik och Akta Ryggen-certifikat',
        'Personlift, taklyft och anpassade fordon',
        'AKK, bildstöd och TAKK för kommunikation',
        'Andningshjälpmedel (CPAP, BiPAP, hemventilator)',
        'Sondmatning, insulin och medicindelegering',
        'Bemötande av personer med autism och NPF',
        'Lex Sarah-anmälan och avvikelsehantering',
        'Schemaläggning och beredskapstjänst',
        'Hjärt-lungräddning och första hjälpen',
        'Dokumentation enligt anordnarens system',
        'Smärtskattning för icke-kommunikativa brukare',
      ],
      personliga: [
        'Lyhörd och respektfull mot brukarens självbestämmande',
        'Pålitlig och punktlig',
        'Stresstålig vid akuta situationer',
        'Empatisk och relationsskapande',
        'Diskret och sekretessmedveten',
        'Flexibel kring scheman och rutiner',
        'Pedagogisk i mötet med anhöriga',
      ],
    },

    profilExempel:
      'Erfaren personlig assistent med 5 års erfarenhet av assistans åt brukare med autism och förvärvad hjärnskada. Behärskar AKK, bildstöd och personlift, samt har körkort B med rutin för anpassade fordon. Sjuksköterskedelegering för insulin och sondmatning. Tillgänglig för rotationsschema inklusive jour och helger.',

    profilTips:
      'År av erfarenhet och vilka funktionsvariationer du arbetat med i öppningsraden. Andra meningen lyfter hjälpmedel, körkort och eventuella delegeringar. Tredje meningen visar tillgänglighet och språkkunskaper som differentierar dig.',

    rekryterarTipsen: [
      {
        rubrik: 'Funktionsvariationer i klartext',
        text: 'Olika brukare kräver olika kompetens. Skriv konkret om vilka funktionsvariationer du arbetat med och hur länge: "Personlig assistent åt brukare med autism 4 år, brukare med ALS 2 år". Anordnare matchar mot specifika brukares behov.',
      },
      {
        rubrik: 'Körkort B är ofta krav',
        text: 'Många brukare behöver assistans vid resor, sjukvårdsbesök och fritidsaktiviteter. Körkort B är vanligtvis krav, ibland även BE eller B96 för anpassade fordon. Skriv ut det tydligt i CV:t och eventuell körrutin.',
      },
      {
        rubrik: 'Hjälpmedel och tekniska lösningar',
        text: 'Personlift, taklyft, andningshjälpmedel, AKK, bildstöd. Erfarenhet av specifika hjälpmedel gör introduktionstiden kortare för anordnaren och brukaren och är värdefullt på CV:t.',
      },
      {
        rubrik: 'Schemaflexibilitet och kontinuitet',
        text: 'Brukare värderar långa anställningar mer än bredd. Skriv ut hur länge du jobbat med varje brukare och din tillgänglighet (jour, helg, natt). Kontinuitet är hård valuta i assistansbranschen.',
      },
      {
        rubrik: 'Språkkunskaper är värdefullt',
        text: 'Brukare med utländsk bakgrund eller anhöriga som inte talar svenska kräver assistenter med rätt språk. Arabiska, persiska, somaliska, finska, polska. Lägg språk synligt i sidopanelen.',
      },
      {
        rubrik: 'Sjukvårdsdelegeringar',
        text: 'Insulin, sondmatning, medicin via PEG, andningsövervakning. Vissa brukare behöver assistenter med sjukvårdsdelegering från sjuksköterska. Lyft eventuella delegeringar med datum och vilken sjuksköterska som delegerat.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'År av erfarenhet, vilka funktionsvariationer du arbetat med, körkort och tillgänglighet på 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Anordnare eller brukarens namn (med medgivande), tidsperiod, brukarens funktionsvariation och vilka uppgifter du haft. Konkretisera hjälpmedel och rutiner.' },
      { sektion: 'Utbildning', tips: 'Vård- och omsorgsutbildning eller annan relevant utbildning. Internutbildningar från anordnaren räknas (Frösunda Academy, Humana Skola).' },
      { sektion: 'Kompetenser', tips: 'Hjälpmedel, kommunikationstekniker, delegeringar och språk. Var konkret om vilken AKK eller specifika hjälpmedel du behärskar.' },
      { sektion: 'Körkort', tips: 'Eget block med körkort B (eller BE, B96), eventuell rutin på anpassade fordon. Skriv utgångsdatum för körkortet.' },
      { sektion: 'Övrigt', tips: 'Schemaflexibilitet (jour, beredskap, helger), språk utöver svenska, eventuella personliga referenser från anhöriga med medgivande.' },
    ],

    checklista: [
      'Erfarenhet av specifika funktionsvariationer',
      'Körkort B med eventuell rutin på anpassade fordon',
      'Erfarenhet av hjälpmedel (lift, AKK, andningshjälpmedel)',
      'Eventuella sjukvårdsdelegeringar från sjuksköterska',
      'Schemaflexibilitet (dag, kväll, natt, helger, jour)',
      'Språkkunskaper utöver svenska',
      'Akta Ryggen eller motsvarande förflyttningsutbildning',
      'HLR-certifikat med utgångsdatum',
      'Vana med dokumentationssystem hos anordnare',
      'Eventuell anhöriganställning eller arbetsledar-erfarenhet',
    ],

    atsInfo:
      'Både vår mall Norrsken och premium-varianten Vården är ATS-säkra. Anordnare som Frösunda, Humana och Nytida använder oftast Visma Recruit eller Workday. Skriv ut funktionsvariationer (autism, ALS, CP, NPF), hjälpmedel (personlift, AKK) och delegeringar i klartext eftersom rekryterare filtrerar exakta termer från jobbannonsen.',

    faqItems: [
      {
        q: 'Vad ska finnas med i ett CV som personlig assistent?',
        a: 'Erfarenhet av specifika funktionsvariationer (autism, NPF, CP, ALS, MS), körkort B, hjälpmedel du behärskar (personlift, AKK, andningshjälpmedel), eventuella sjukvårdsdelegeringar, schemaflexibilitet (dag, kväll, natt, helger, jour), språkkunskaper, samt eventuella vidareutbildningar (HLR, Akta Ryggen, BPSD). Lägg till anhöriganställning eller arbetsledar-erfarenhet om relevant.',
      },
      {
        q: 'Behöver jag formell utbildning för att jobba som personlig assistent?',
        a: 'Inte alltid. Många anordnare rekryterar utan formell vårdutbildning om du visar lyhördhet, körkort B och rätt schemaflexibilitet. Anordnaren ger introduktion parallellt med brukaren. Däremot väger vård- och omsorgsutbildning tungt för komplexa brukare med medicinska behov.',
      },
      {
        q: 'Hur skriver jag CV utan tidigare assistanserfarenhet?',
        a: 'Lyft eventuell tidigare erfarenhet av barnomsorg, äldreomsorg, vård eller stöd. Frivilligarbete med personer med funktionsnedsättning räknas. Idrottsledarroller, scout, fritids eller liknande visar lyhördhet. Skriv ut körkort B, schemaflexibilitet och eventuella språk. Anordnaren värderar personlighet lika mycket som meriter.',
      },
      {
        q: 'Hur viktigt är körkort?',
        a: 'Mycket viktigt för de flesta tjänster. Många brukare behöver assistans vid resor, sjukvårdsbesök, fritidsaktiviteter och inköp. Körkort B är vanligtvis krav. Vissa brukare har anpassade fordon som kräver BE eller B96. Skriv ut det tydligt och hur länge du haft körkortet.',
      },
      {
        q: 'Vilka hjälpmedel ska jag kunna nämna?',
        a: 'Personlift, taklyft, hygienhjälpmedel, anpassade fordon, AKK (alternativ kommunikation), bildstöd, ögonstyrning (Tobii), andningshjälpmedel (CPAP, BiPAP, hemventilator). Olika brukare har olika behov och anordnare matchar specifik kompetens. Konkreta hjälpmedel är meriterande.',
      },
      {
        q: 'Hur visar jag erfarenhet av specifika funktionsvariationer?',
        a: 'Var konkret om diagnos och hur du arbetat. "Personlig assistent åt brukare med autism och utvecklingsstörning 4 år, använt bildstöd och TAKK för kommunikation" säger mer än "har erfarenhet av funktionsvariationer". Inkludera bemötande och eventuella anpassningar du gjort.',
      },
      {
        q: 'Vilka nyckelord ska CV:t ha för att passera ATS?',
        a: 'Specifika funktionsvariationer (autism, NPF, ALS, CP, MS, förvärvad hjärnskada), hjälpmedel (personlift, taklyft, AKK, bildstöd), körkort (B, BE, B96), delegeringar (insulin, sondmatning) och schemaflexibilitet (jour, beredskap). Visma Recruit och Workday söker exakta matchningar mot jobbannonsens språk.',
      },
      {
        q: 'Hur lång ska ett CV som personlig assistent vara?',
        a: 'En sida räcker för de flesta. Om du har 10+ års erfarenhet med flera brukare och vidareutbildningar kan det bli 1,5 sidor. Det viktiga är att körkort, funktionsvariationer du arbetat med och senaste anställningen syns på första sidan.',
      },
      {
        q: 'Behöver jag personligt brev till assistanstjänster?',
        a: 'Ja för de flesta tjänster. Använd brevet för att förklara varför just den brukaren eller anordnaren och beskriv en specifik situation där du visat lyhördhet eller hanterat svår kommunikation. Anhöriga och brukaren själv läser ofta brevet, så fokusera på personlighet snarare än meriter.',
      },
      {
        q: 'Vad ska jag inte ha med på mitt CV?',
        a: 'Personnummer (bara födelseår), foto i offentlig sektor, brukarens namn utan medgivande, sekretessbelagda detaljer om brukares hälsa eller hem, generiska påståenden ("empatisk och social") utan konkreta exempel, hobbies som inte är assistans-relevanta, och löneförväntningar. Stavfel och slarvig formatering signalerar otillförlitlighet i en bransch där noggrannhet räknas.',
      },
    ],
  },

  'kock': {
    seoIntro:
      'Som kock i Sverige bedöms du på matlagningskunnande, kökens hierarki och förmåga att leverera under press. Restaurangbranschen från Michelin-stjärnigt till lunchrestaurang har konstant öppna roller, men kökschefer slänger CV:n som inte tydligt visar specialisering och ansvar. Ett välskrivet CV avgör om du blir kallad till provlagning på den restaurang du faktiskt vill jobba på.\n\nVår mall för kockar lyfter restaurangtyper, kökspositioner och eventuella specialiseringar som första visuella element. Vi har strukturerat erfarenhetssektionen så att restaurang, ägare eller köksmästare och tidsperiod syns direkt med konkreta ansvarsområden. Det betyder att kökschefer kan bedöma din matchning på fem sekunder.\n\nKonkret innehåll vi rekommenderar: kockutbildning (gymnasium eller YH), restauranger du arbetat på med stjärnstatus eller kategori, kökspositioner (köksbiträde, kallskänka, kock, sous chef, köksmästare), specialiseringar (kallskänka, varmkök, bakery, garde manger, sushi), HACCP-utbildning och livsmedelshygien, eventuella tävlingar eller utmärkelser, samt språk för internationellt kök.\n\nNedan hittar du två CV-mallar designade för kockrollen, ett färdigt CV-exempel att utgå från, och konkreta tips på vad köksmästare och restaurangägare faktiskt letar efter. Ladda ner mallen gratis och anpassa efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'Award',
        title: 'Restaurangtyp och stjärnstatus',
        description: 'Michelin-stjärnig, Bib Gourmand, lunchrestaurang, kvarterskrog, hotellrestaurang. Olika restauranger värderar olika erfarenhet. Lyft typen i restaurang-namnet eller med en kort beskrivning så köksmästare ser direkt om du matchar.',
      },
      {
        icon: 'Briefcase',
        title: 'Position och hierarki',
        description: 'Köksbiträde, kallskänka, partiekök (varmkök), sous chef, köksmästare. Den franska kökshierarkin är fortfarande standard i Sverige. Skriv ut din position eftersom det avgör vilken tjänst du kvalificerar för.',
      },
      {
        icon: 'CheckCircle',
        title: 'Specialiseringar i klartext',
        description: 'Garde manger, varmkök, bakery, pastry, charkuteri, fisk, kött, sushi, vegetarisk. Specialiseringar öppnar specifika tjänster och differentierar dig. En kallskänka och en varmkock har olika CV även med samma år.',
      },
      {
        icon: 'TrendingUp',
        title: 'Volym och tempo',
        description: '"40 covers per service" eller "lunch för 200 gäster dagligen" säger mer än "ansvarig för matlagning". Konkreta volymer visar din förmåga att klara tempo och press, vilket är hård valuta i restaurangbranschen.',
      },
      {
        icon: 'FileText',
        title: 'HACCP och livsmedelshygien',
        description: 'HACCP-utbildning, livsmedelshygien, allergenhantering. Krav på alla restauranger sedan 2006. Skriv ut certifikat med datum eftersom det är grundkrav som måste finnas.',
      },
      {
        icon: 'Target',
        title: 'Tävlingar och utmärkelser',
        description: 'Sveriges kockmästare, Bocuse d\'Or, Kock-VM, lokala tävlingar. Tävlingar är meriterande och visar driv. Lyft eventuella vinster eller deltagande på CV:t även om du inte vunnit.',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'Restauranger och positioner överst',
        description: 'Vår mall lyfter restauranger, kökspositioner och eventuella stjärnstatus i sidopanelen. Köksmästare ser direkt vilka kök du arbetat i utan att behöva läsa hela CV:t.',
      },
      {
        title: 'Plats för signature dishes och stilar',
        description: 'Mallen separerar restauranger och dina specialiseringar (garde manger, varmkök, bakery) så bredd och djup syns. Du kan visa olika stilar utan att meriter konkurrerar om samma yta.',
      },
      {
        title: 'Eget block för certifikat och utmärkelser',
        description: 'HACCP, livsmedelshygien, eventuella tävlingsdeltaganden eller utmärkelser har egen rad. Mallen lyfter formell kompetens utan att blanda in i generisk text.',
      },
      {
        title: 'Premium-mallen Servering med foto',
        description: 'För senior-roller (sous chef, köksmästare, executive chef) lägger Servering till foto och magazine-känsla. Skapar en professionell first impression som passar premium-restauranger.',
      },
      {
        title: 'Plats för stilar och referenser',
        description: 'Klassisk fransk, nordisk, italiensk, asiatisk fusion, vegan. Mallen har dedikerat block för dina kulinariska stilar och eventuella mentorer eller referenser från branschen.',
      },
      {
        title: 'Kompakt typografi för flera år',
        description: 'Kockar har ofta varierande anställningar (sommarsäsong, vinterstation, fasta tjänster). Mallen är kompakt nog för att rymma 6-8 anställningar utan att verka rörig.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Mise en place och förberedelser',
        punkter: [
          'Förbereda ingredienser, såser och garnityr inför service',
          'Stationera kallskänk eller varmkök och hålla mise en place uppdaterad',
          'Hantera leveranser, kontrollera kvalitet och rotera lager (FIFO)',
          'Anpassa förberedelser efter dagens menyt och förväntad volym',
        ],
      },
      {
        rubrik: 'Service och tillagning',
        punkter: [
          'Tillaga rätter enligt restaurangens recept och presentationsstandard',
          'Hantera flera tickets parallellt under intensiv service',
          'Säkerställa korrekt tillagningstemperatur och allergenhantering',
          'Plate up med precision enligt köksmästarens specifikation',
        ],
      },
      {
        rubrik: 'Hygien och säkerhet',
        punkter: [
          'Följa HACCP och egenkontrollprogrammet',
          'Hantera allergener enligt EU-förordning 1169/2011',
          'Hålla arbetsplatsen ren och säker enligt branschstandard',
          'Genomföra dagliga säkerhets- och hygienkontroller',
        ],
      },
      {
        rubrik: 'Kollegial samverkan',
        punkter: [
          'Samverka med kallskänk, varmkök, bakery och servisstab',
          'Stötta nya kockar och köksbiträden under introduktion',
          'Delta i menyplanering och säsongsanpassning',
          'Bidra till förbättringsförslag för köksflöde och effektivitet',
        ],
      },
      {
        rubrik: 'Menyplanering och kreativitet',
        punkter: [
          'Föreslå nya rätter baserat på säsong, leverantörer och trender',
          'Beräkna kostnader, marginal och food cost för menyalternativ',
          'Anpassa rätter efter kundsegment, allergier och dietkrav',
          'Bidra till specialevent, vinmiddagar och tasting-meny',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Kökspositioner (Brigade de cuisine)',
        termer: [
          { term: 'Köksmästare', forklaring: 'Chef över hela köket, ansvar för meny, personal och budget. Executive chef.' },
          { term: 'Sous chef', forklaring: 'Köksmästarens högra hand, ansvarig för dagligt köksarbete och personal.' },
          { term: 'Chef de partie', forklaring: 'Stationchef för specifik del av köket (kallskänk, varmkök, etc).' },
          { term: 'Garde manger', forklaring: 'Kallskänk, ansvarig för förrätter, sallader och kalla tillbehör.' },
          { term: 'Saucier', forklaring: 'Specialist på såser och varma rätter, traditionellt högstatuspoäng.' },
          { term: 'Pâtissier', forklaring: 'Konditor med ansvar för efterrätter, bröd och bakverk.' },
        ],
      },
      {
        kategori: 'Restaurangtyper och kategorier',
        termer: [
          { term: 'Michelin-stjärna', forklaring: 'Internationell utmärkelse för exceptionell matlagning, mycket hög status.' },
          { term: 'Bib Gourmand', forklaring: 'Michelin-utmärkelse för "rejäl mat till bra pris", populär bland kockar.' },
          { term: 'Fine dining', forklaring: 'Lyxrestaurang med fokus på matupplevelse, ofta tasting-meny.' },
          { term: 'Bistro', forklaring: 'Mindre restaurang med klassisk fransk stil till rimliga priser.' },
          { term: 'Brasseri', forklaring: 'Större restaurang med längre öppettider och bred meny.' },
          { term: 'Lunchrestaurang', forklaring: 'Fokus på lunch, dagens rätt och snabb service.' },
        ],
      },
      {
        kategori: 'Kulinariska stilar och tekniker',
        termer: [
          { term: 'Klassisk fransk', forklaring: 'Grunden för västerländsk fine dining, fokus på såser och teknik.' },
          { term: 'Nordisk kök', forklaring: 'New Nordic Cuisine med fokus på lokala råvaror och säsong.' },
          { term: 'Sous vide', forklaring: 'Vakuumkokning vid låg temperatur för precision i tillagning.' },
          { term: 'Fermentering', forklaring: 'Bevarings- och smaktekniker (kombucha, kimchi, miso, surdeg).' },
          { term: 'Mise en place', forklaring: 'Förberedelser inför service, "allt på plats" enligt klassisk metod.' },
          { term: 'Plating', forklaring: 'Presentationsteknik för att placera mat snyggt på tallriken.' },
        ],
      },
      {
        kategori: 'Hygien och regelverk',
        termer: [
          { term: 'HACCP', forklaring: 'Hazard Analysis and Critical Control Points, krav i alla restaurangkök.' },
          { term: 'Egenkontroll', forklaring: 'Restaurangens system för att säkerställa livsmedelssäkerhet enligt Livsmedelsverket.' },
          { term: 'Allergenhantering', forklaring: 'EU-förordning 1169/2011 kring 14 allergener på menyn.' },
          { term: 'Livsmedelshygien', forklaring: 'Grundutbildning i mathantering, krav i alla professionella kök.' },
          { term: 'Temperaturkedja', forklaring: 'Rutiner för att hålla mat säker temperatur från leverans till servering.' },
          { term: 'FIFO', forklaring: 'First In, First Out, lagerhanteringsprincip för att undvika svinn.' },
        ],
      },
    ],

    typiskaArbetsgivare: [
      {
        kategori: 'Premium-restauranger',
        exempel: [
          'Michelin-stjärniga restauranger (Frantzén, Aira, Etoile)',
          'Bib Gourmand-restauranger',
          'Fine dining och tasting-restauranger',
          'Hotellrestauranger med ambition (Operakällaren, Mathias Dahlgren)',
        ],
      },
      {
        kategori: 'Bistro och mellansegment',
        exempel: [
          'Mellanrestauranger i Stockholm, Göteborg, Malmö',
          'Trendiga restauranger och brasserier',
          'Hotellrestauranger med varierande nivå',
          'Specialrestauranger (italiensk, asiatisk, vegansk)',
        ],
      },
      {
        kategori: 'Storkök och catering',
        exempel: [
          'Skola och förskola (kommunal storkök)',
          'Sjukhus och äldreboenden',
          'Företagsrestauranger (Sodexo, ISS, Compass Group)',
          'Catering-bolag och eventbolag',
        ],
      },
      {
        kategori: 'Bemanning och säsong',
        exempel: [
          'Bemanningsbolag (Inhouse, Manpower Restaurang)',
          'Sommarrestauranger på västkusten och i skärgården',
          'Vinterstationer i Åre, Sälen, Riksgränsen',
          'Festivaler och eventuell egen verksamhet',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Restaurang- och livsmedelsprogrammet (3 år)',
        beskrivning: 'Gymnasieutbildning med inriktning kock. Vanlig grund för svenska kockar med APL-perioder på olika restauranger. Examen ger grundkompetens men många kockar lär sig framförallt på jobb.',
      },
      {
        rubrik: 'Yrkeshögskola kock (1-2 år)',
        beskrivning: 'YH-utbildningar med specifik inriktning (gourmetkök, vegetariskt, sushi, bakery). Snabbare väg in i premium-segmentet och meriterande för senior-roller.',
      },
      {
        rubrik: 'Internationella kockskolor',
        beskrivning: 'Le Cordon Bleu (Paris, London), Culinary Institute of America, Hattori Nutrition College (Tokyo). Internationell utbildning är meriterande för Michelin-segmentet och premium-restauranger.',
      },
      {
        rubrik: 'Lärlingsplatser och on-the-job',
        beskrivning: 'Många kockar utvecklas via lärlingsplatser i specifika kök. Att ha jobbat under en namnkunnig köksmästare är meriterande och öppnar dörrar till andra premium-restauranger.',
      },
    ],

    kompetenser: {
      tekniska: [
        'Klassisk fransk teknik och Brigade de cuisine',
        'Sous vide och precisionstekniker',
        'Kallskänk (förrätter, sallader, charkuteri)',
        'Varmkök (såser, kött, fisk, vegetariskt)',
        'Bakery och pastry',
        'Fermentering och konservering',
        'Allergenhantering enligt EU 1169/2011',
        'HACCP och egenkontrollprogram',
        'Menyplanering och food cost-beräkning',
        'Mise en place och stationhantering',
        'Plating och presentationsteknik',
        'Säsongsanpassning och lokala råvaror',
      ],
      personliga: [
        'Stresstålig vid intensiv service',
        'Strukturerad i mise en place',
        'Kreativ i menyplanering',
        'Fysiskt uthållig',
        'Snabbtänkt vid problem',
        'Lagspelare i köksbrigad',
        'Detaljorienterad i presentation',
      ],
    },

    profilExempel:
      'Erfaren chef de partie med 8 års erfarenhet från Michelin-stjärnig och fine dining-segment. Specialist på saucier-station med fokus på klassiska franska tekniker och nordiska råvaror. Arbetat under två stjärnköksmästare och deltagit i Sveriges kockmästare 2023.',

    profilTips:
      'Aktuell position och år av erfarenhet i öppningsraden. Andra meningen lyfter specialisering och kulinarisk stil. Tredje meningen visar mentorskap, tävlingar eller utmärkelser som differentierar dig från generiska kock-CV.',

    rekryterarTipsen: [
      {
        rubrik: 'Restaurangtyp och stjärnstatus',
        text: 'Michelin-stjärnig, Bib Gourmand, fine dining, bistro, hotellrestaurang. Olika restauranger värderar olika erfarenhet. Lyft typen i restaurang-namnet eller med en kort beskrivning så köksmästare ser direkt om du matchar.',
      },
      {
        rubrik: 'Position och hierarki',
        text: 'Köksbiträde, kallskänka, chef de partie, sous chef, köksmästare. Skriv ut din position eftersom det avgör vilken tjänst du kvalificerar för. Den franska kökshierarkin är fortfarande standard.',
      },
      {
        rubrik: 'Specialiseringar i klartext',
        text: 'Garde manger, varmkök, bakery, pastry, charkuteri, fisk, kött, sushi, vegetarisk. Specialiseringar öppnar specifika tjänster och differentierar dig. En kallskänka och en varmkock har olika CV.',
      },
      {
        rubrik: 'Volym och tempo',
        text: '"40 covers per service" eller "lunch för 200 gäster dagligen" säger mer än "ansvarig för matlagning". Konkreta volymer visar din förmåga att klara tempo och press.',
      },
      {
        rubrik: 'HACCP och hygiencertifikat',
        text: 'HACCP, livsmedelshygien, allergenhantering. Skriv ut certifikat med datum eftersom det är grundkrav på alla restauranger. Vissa kommuner kräver också intyg om Salmonella-test.',
      },
      {
        rubrik: 'Tävlingar och utmärkelser',
        text: 'Sveriges kockmästare, Bocuse d\'Or, Kock-VM, lokala tävlingar. Tävlingar är meriterande och visar driv. Lyft eventuella vinster eller deltagande även om du inte vunnit.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'Position, år av erfarenhet, primär kulinarisk stil och eventuell stjärnstatus på 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Restaurang, köksmästare och tidsperiod. Konkretisera position, specialisering och eventuella signature dishes.' },
      { sektion: 'Utbildning', tips: 'Restaurang- och livsmedelsprogrammet, YH eller internationell kockskola. Internutbildningar från premium-restauranger räknas också.' },
      { sektion: 'Kompetenser', tips: 'Tekniker (sous vide, klassisk fransk), specialiseringar (garde manger, bakery), allergener och HACCP.' },
      { sektion: 'Hygien och certifikat', tips: 'HACCP, livsmedelshygien, allergenhantering med utgångsdatum. Eventuella körkort eller specialcertifikat (truck för storkök).' },
      { sektion: 'Övrigt', tips: 'Tävlingsdeltaganden, utmärkelser, mentorer från branschen. Språk om du söker internationella restauranger.' },
    ],

    checklista: [
      'Kockutbildning (gymnasium, YH eller internationell skola)',
      'Position i kökshierarkin (chef de partie, sous chef, etc)',
      'Specialiseringar (garde manger, varmkök, bakery)',
      'Kulinariska stilar (klassisk fransk, nordisk, italiensk)',
      'HACCP och livsmedelshygien med utgångsdatum',
      'Allergenhantering enligt EU 1169/2011',
      'Volym per service och restaurangtyp',
      'Eventuella tävlingsdeltaganden och utmärkelser',
      'Mentorer och referenser från branschen',
      'Språkkunskaper för internationella kök',
    ],

    atsInfo:
      'Både vår mall Stack-developer och premium-varianten Servering är ATS-säkra. Restauranger använder oftast Teamtailor, Workday eller egna ATS. Skriv ut köksposition (chef de partie, sous chef), specialisering (garde manger, saucier) och hygien-certifikat (HACCP) i klartext eftersom rekryterare filtrerar exakta termer från jobbannonsen.',

    faqItems: [
      {
        q: 'Vad ska finnas med i ett kock-CV?',
        a: 'Kockutbildning, restauranger du arbetat på med kategori (Michelin, Bib Gourmand, fine dining, bistro), position i kökshierarkin (chef de partie, sous chef), specialiseringar (garde manger, varmkök, bakery), kulinariska stilar, HACCP och hygiencertifikat, eventuella tävlingar och utmärkelser, samt språkkunskaper. Lägg till mentorer eller referenser om relevant.',
      },
      {
        q: 'Hur skriver jag CV som ung kock utan premium-restauranger?',
        a: 'Lyft restauranger du arbetat på med konkreta uppgifter, även om de inte är stjärnrestauranger. Praktiska kurser från utbildningen, eventuella tävlingsdeltaganden i lokala kockmästerskap, säsongsarbete på sommarrestauranger, och vilka specialiseringar du provat på. Skriv ut din vilja att utvecklas och lära dig av seniora kockar. Många premium-restauranger tar in junior-kockar för att forma dem.',
      },
      {
        q: 'Hur viktig är restaurangtyp på CV:t?',
        a: 'Mycket. En kock från Michelin-stjärnig restaurang söker andra tjänster än en från lunchrestaurang. Ange typ av restaurang och eventuell stjärnstatus eller annan utmärkelse. Hotellrestaurang, fine dining-segment, kvarterskrog och storkök är olika världar med olika förväntningar.',
      },
      {
        q: 'Vad räknas som meriterande för senior-kockroller?',
        a: 'Erfarenhet från premium-segment (Michelin, Bib Gourmand), arbete under namnkunniga köksmästare, internationell erfarenhet, tävlingsdeltaganden, sous chef- eller köksmästar-roller, och egen menyutveckling. För executive chef-roller är även personalledning, food cost-kontroll och ekonomi viktigt.',
      },
      {
        q: 'Hur lyfter jag kreativitet på CV:t?',
        a: 'Konkreta signature dishes du utvecklat, deltagande i menyutveckling, säsongsanpassning du drivit, tävlingsdeltaganden eller utmärkelser. Skriv "Utvecklade fyra rätter för säsongsmeny som ökade vinmarginal med 12%" istället för "kreativ kock". Konkret kreativitet med affärsresultat differentierar dig.',
      },
      {
        q: 'Behövs HACCP-utbildning?',
        a: 'Ja, det är grundkrav på alla restauranger sedan 2006. Skriv ut HACCP-utbildning med datum. Allergenhantering enligt EU 1169/2011 är också krav. Salmonella-test kan krävas i vissa kommuner. Lägg dem synligt så restaurangägaren ser att du klarar livsmedelsverkets krav.',
      },
      {
        q: 'Hur lång ska ett kock-CV vara?',
        a: 'Junior 0-5 år: 1 sida. Erfaren chef de partie eller sous chef: 1,5 sidor. Köksmästare eller executive chef: 2 sidor. Det viktiga är att restaurangtyp, position och senaste anställning syns på första sidan. Restaurangbranschen värderar konkret erfarenhet över akademisk längd.',
      },
      {
        q: 'Vilka nyckelord ska CV:t ha för att passera ATS?',
        a: 'Kökspositioner (chef de partie, sous chef, saucier, garde manger), restaurangtyper (fine dining, Michelin, Bib Gourmand), tekniker (sous vide, fermentering), specialiseringar (kallskänk, varmkök, bakery, pastry), HACCP och hygiencertifikat, samt språk för internationella kök. Teamtailor och Workday söker exakta matchningar.',
      },
      {
        q: 'Behöver jag personligt brev till kock-tjänster?',
        a: 'Beror på restaurangtyp. Premium-restauranger förväntar sig oftast personligt brev plus provlagning. Mindre restauranger kan acceptera bara CV. När brev förväntas, fokusera på kulinarisk filosofi och varför just den restaurang. Beskriv en signature dish eller en menyutmaning du löst. Håll till en sida på 250-350 ord.',
      },
      {
        q: 'Vad ska jag inte ha med på mitt kock-CV?',
        a: 'Personnummer (bara födelseår), löneförväntningar, irrelevanta arbetslivserfarenheter äldre än 10-15 år, generiska påståenden ("passion för matlagning") utan konkreta exempel, hobbies som inte är kulinariskt relevanta, och slarvigt skrivna restaurangnamn. Stavfel av kulinariska termer (skriva "soux chef" istället för "sous chef") signalerar oseriös bakgrund.',
      },
    ],
  },

  'truckforare': {
    seoIntro:
      'Som truckförare bedöms du framför allt på dina behörigheter och din rutin med olika trucktyper. Logistik- och industribolag som DB Schenker, PostNord, DHL, IKEA och Volvo har konstant öppna roller, men lagerchefer slänger CV:n som inte tydligt visar exakta truckkort med utgångsdatum. Ett välskrivet CV avgör om du blir kallad till intervju på det lager du faktiskt vill jobba på.\n\nVår mall för truckförare lyfter alla aktiva truckbehörigheter, körkort och eventuella ADR-bevis som första visuella element. Vi har strukturerat erfarenhetssektionen så att lager, branschtyp och truck-typ syns direkt med eventuella prestandasiffror. Det betyder att lagerchefer kan bedöma din matchning på fem sekunder.\n\nKonkret innehåll vi rekommenderar: alla aktiva truckbehörigheter (A1-A4, B1-B5, C, D, E) med utgångsdatum, körkort B (oftast krav), eventuella tunga körkort (BE, C, CE, D), ADR-bevis för farligt gods, säkerhetsutbildningar (Akta Ryggen, fallskydd, brandskydd), erfarenhet av specifika trucktyper (skjutstativtruck, sidlastare, motviktstruck), branschvana (e-handel, industri, terminal), och tillgänglighet för 2- eller 3-skift.\n\nNedan hittar du två CV-mallar designade för truckförarrollen, ett färdigt CV-exempel att utgå från, och konkreta tips på vad lagerchefer på e-handelsterminal, industrilager och transport faktiskt letar efter. Ladda ner mallen gratis och anpassa efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'Award',
        title: 'Alla truckbehörigheter med datum',
        description: 'A1, A2, A3, A4 (plocktruckar), B1, B2, B3, B4, B5 (motviktstruckar), C (sidlastare), D, E. Utgångsdatum krävs för varje. Lagerchefer matchar varje tjänst mot specifika krav, så listan måste vara komplett och uppdaterad.',
      },
      {
        icon: 'Briefcase',
        title: 'Körkort B är ofta krav',
        description: 'Större terminaler kräver körkort B för att hämta material från olika delar av området. Tunga körkort (BE, C, CE, D) öppnar fler tjänster och påverkar lönen. Skriv ut samtliga körkort med utgångsdatum.',
      },
      {
        icon: 'CheckCircle',
        title: 'ADR-bevis för farligt gods',
        description: 'För terminal och industri som hanterar farligt gods (kemikalier, batterier, tryckkärl) är ADR krav. Lager utan farligt gods värderar det också som senior-meritering. Bevis förnyas vart femte år.',
      },
      {
        icon: 'TrendingUp',
        title: 'Trucktyp och rutin',
        description: 'Skjutstativtruck för smala gångar, sidlastare för långgods, motviktstruck för pallar. Olika lager kräver olika trucker. Skriv ut hur länge du kört varje typ och vilka höjder du arbetat på.',
      },
      {
        icon: 'FileText',
        title: 'Branschvana är värdefullt',
        description: 'E-handelsterminal, industrilager, livsmedelslager, frys- och kyllager, byggvaruhus. Olika branscher har olika krav. En truckförare från livsmedel kan ofta inte direkt gå till industri utan introduktion.',
      },
      {
        icon: 'Target',
        title: 'Schemaflexibilitet och skift',
        description: 'Lager kör ofta 2- eller 3-skift, högsäsong kräver helgarbete. Tillgänglighet för rotation är hård valuta. Skriv ut konkret: "Tillgänglig för 2-skift inkl helger" eller "Söker dagtid endast".',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'Behörigheter och körkort överst',
        description: 'Vår mall Logistik har "Behörigheter och körkort"-block direkt efter rubriken. Lagerchefer ser dina truckkort, ADR och körkort på fem sekunder utan att behöva scrolla.',
      },
      {
        title: 'Plats för trucktyp och bransch',
        description: 'Mallen separerar truckar och lagertyp så branschvana syns. Du kan visa erfarenhet från flera lager utan att meriter konkurrerar om samma yta.',
      },
      {
        title: 'Eget block för säkerhetsutbildningar',
        description: 'ADR, Akta Ryggen, fallskydd, brandskydd, BAM. Mallen lyfter säkerhetsutbildningar som eget block så lagerchefer ser komplett certifieringsbild.',
      },
      {
        title: 'Industriell typografi för branschen',
        description: 'Vi har valt Roboto Condensed med cyan-accent som signalerar logistik och industri. Ingen klick-baitig design som drar fokus från behörigheter och meriter.',
      },
      {
        title: 'Premium-mallen Logistik Plus med foto',
        description: 'För senior-roller (truckchef, lagerförman) lägger Logistik Plus till foto och dark header. Skapar en mer professionell first impression utan att kompromissa med ATS-läsbarhet.',
      },
      {
        title: 'Tillgänglighet i sidopanelen',
        description: 'Mallen har dedikerat block för schemaflexibilitet (dag, kväll, natt, helger). Lagerchefer behöver veta rotationsmöjligheter och vår mall sätter dig i rätt urvalslista direkt.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Lastning och lossning',
        punkter: [
          'Lossa lastbilar och containers med motviktstruck eller skjutstativtruck',
          'Kontrollera leverans mot följesedel och rapportera avvikelser',
          'Lasta utgående trafik enligt fraktbrev och destination',
          'Säkra last med spännband och korrekta lastsäkringsmetoder',
        ],
      },
      {
        rubrik: 'Materialhantering i lager',
        punkter: [
          'Förflytta pallar mellan inkommande, lagring och plockzoner',
          'Plocka och placera material på rätt position enligt WMS',
          'Hantera farligt gods enligt ADR vid behov',
          'Köra plocktruck (A1, A2, A3) i smala gångar och höglager',
        ],
      },
      {
        rubrik: 'Inventering och kvalitet',
        punkter: [
          'Genomföra cykelräkning och fullinventering enligt schema',
          'Justera lagersaldo i WMS efter avvikelser',
          'Kontrollera produktkvalitet och rapportera skador',
          'Hantera reklamationer och returer enligt rutin',
        ],
      },
      {
        rubrik: 'Säkerhet och underhåll',
        punkter: [
          'Genomföra dagliga säkerhets- och förkörskontroller på trucken',
          'Rapportera tekniska fel och underhållsbehov till verkstad',
          'Följa lagrets säkerhetsrutiner och bära PPE',
          'Genomföra brandskyddsrundor och säkerhetskontroller',
        ],
      },
      {
        rubrik: 'Skiftarbete och samverkan',
        punkter: [
          'Genomföra skiftöverlämning till nästa skift med statusrapport',
          'Samverka med plockare, packare och transportkoordinator',
          'Stötta nya kollegor under introduktion',
          'Bidra till förbättringsförslag enligt Lean eller 5S',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Truckar och behörigheter',
        termer: [
          { term: 'A1', forklaring: 'Plocktruck med plockare i förhöjt läge, vanlig i höglager.' },
          { term: 'A2', forklaring: 'Stå-på-truck för plock i smala gångar, mycket vanlig på e-handelslager.' },
          { term: 'A3', forklaring: 'Sittande plocktruck för höga plockhöjder.' },
          { term: 'A4', forklaring: 'Skjutstativtruck för smala gångar och höglager med pallar.' },
          { term: 'B1-B5', forklaring: 'Motviktstruckar i olika storleksklasser för pallhantering och lastning.' },
          { term: 'C', forklaring: 'Sidlastare för långgodshantering (rör, balkar, virke).' },
          { term: 'D', forklaring: 'Större motviktstruckar över 10 ton.' },
        ],
      },
      {
        kategori: 'Körkort och behörigheter',
        termer: [
          { term: 'B', forklaring: 'Personbil, ofta krav även för truckförare på större terminaler.' },
          { term: 'BE', forklaring: 'Personbil med tung släpvagn, krävs för vissa transportuppdrag.' },
          { term: 'C', forklaring: 'Lastbil över 3,5 ton, krävs för tunga transporter inom industri.' },
          { term: 'CE', forklaring: 'Lastbil med släp, krävs för dragbilar och längre transporter.' },
          { term: 'D', forklaring: 'Buss, krävs för persontrafik (mindre relevant för truckförare).' },
          { term: 'YKB', forklaring: 'Yrkeskompetensbevis, krävs för yrkesmässig persontrafik och vissa godstransporter.' },
        ],
      },
      {
        kategori: 'Säkerhet och certifikat',
        termer: [
          { term: 'TYA', forklaring: 'Transportfackens Yrkes- och Arbetsmiljönämnd, utfärdar truckutbildning.' },
          { term: 'ADR', forklaring: 'Behörighet för transport av farligt gods, förnyas vart femte år.' },
          { term: 'Akta Ryggen', forklaring: 'Certifierad ergonomisk lyfteknik, vanligt krav på lager.' },
          { term: 'Fallskydd', forklaring: 'Utbildning för arbete på höjd, krävs på höglager.' },
          { term: 'Brandskydd', forklaring: 'Grundläggande brandskyddsutbildning, krav på de flesta lager.' },
          { term: 'BAM', forklaring: 'Bättre arbetsmiljö, grundläggande utbildning för arbetsledare.' },
        ],
      },
      {
        kategori: 'Lagertyper och bransch',
        termer: [
          { term: 'E-handelsterminal', forklaring: 'Stora lager för B2C med snabb plock och packning.' },
          { term: 'Industrilager', forklaring: 'Lager för tillverkningsbolag (Volvo, IKEA Industry, Sandvik).' },
          { term: 'Livsmedelslager', forklaring: 'Lager för dagligvaruhandel (ICA, Coop, Axfood) med strikta hygienkrav.' },
          { term: 'Fryslager', forklaring: 'Lager med temperatur under -18°C, kräver kompletterande klädsel.' },
          { term: '3PL', forklaring: 'Tredjepartslogistik, lager som driftas på uppdrag av flera kunder.' },
          { term: 'Crossdock', forklaring: 'Genomflöde utan långtidslagring, vanligt på terminaler.' },
        ],
      },
    ],

    typiskaArbetsgivare: [
      {
        kategori: 'Logistik och transport',
        exempel: [
          'PostNord, DB Schenker, DHL, DSV',
          'Bring, Best Transport, Schenker Logistics',
          'Mindre svenska transport- och åkeribolag',
          'Bemanningsbolag (Manpower, Adecco)',
        ],
      },
      {
        kategori: 'E-handel och 3PL',
        exempel: [
          'Klarna Logistics, Mathem, Foodora',
          'Boozt, Apotea, NetOnNet, Adlibris',
          'Tredjepartslogistiker (XPO, Geodis)',
          'Egna e-handelsterminaler för stora kedjor',
        ],
      },
      {
        kategori: 'Industri och tillverkning',
        exempel: [
          'Volvo, Scania, ABB, IKEA Industry',
          'Sandvik, Atlas Copco, Tetra Pak',
          'Tillverkningsbolag i Mälardalen och Småland',
          'Bygg- och anläggningsföretag',
        ],
      },
      {
        kategori: 'Detaljhandel och dagligvaror',
        exempel: [
          'ICA Logistik, Coop, Axfood, Lidl',
          'IKEA, H&M, Stadium centrallager',
          'Apoteket centrallager och distribution',
          'Säsongsarbete på julpaketterminaler',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Truckutbildning enligt TYA (1-5 dagar)',
        beskrivning: 'TYA utfärdar truckutbildning. Längden beror på antal behörigheter du tar. Krav i de flesta lager och förnyas vart femte år. Kostnaden betalas ofta av arbetsgivaren efter provanställning.',
      },
      {
        rubrik: 'Yrkeshögskola lager och logistik (1-2 år)',
        beskrivning: 'YH-utbildningar inom lager, logistik och transport. Kortare väg till arbetsledar- och chefroller. Innehåller WMS-praktik, säkerhetsutbildningar och affärsmässig logistik.',
      },
      {
        rubrik: 'Direkt anställning utan formell utbildning',
        beskrivning: 'Många lager rekryterar utan formell utbildning för truckförar-roller. Truckutbildning betalas ofta av arbetsgivaren efter provanställning. Vanlig väg in.',
      },
      {
        rubrik: 'ADR och säkerhetscertifikat (1-3 dagar)',
        beskrivning: 'ADR-utbildning för farligt gods, fallskydd, brandskydd och Akta Ryggen. Korta certifikatkurser som ger meriterande kompetens utöver grundutbildning.',
      },
    ],

    kompetenser: {
      tekniska: [
        'Truckkort A1-A4 och B1-B5 enligt TYA',
        'Skjutstativtruck och sidlastare',
        'Motviktstruck upp till 10 ton',
        'Höglager och plock i smala gångar',
        'WMS-system (SAP WMS, Manhattan, Pyramid)',
        'RF-scanner och handburna terminaler',
        'ADR-bevis för farligt gods',
        'Lastsäkring och fraktbrev',
        'Akta Ryggen och ergonomisk lyfteknik',
        'Brandskydd och fallskydd',
        '5S och Lean-metodik på lagergolv',
        'Trucksäkerhet och förkörskontroll',
      ],
      personliga: [
        'Säkerhetsmedveten och ansvarstagande',
        'Strukturerad i höga tempon',
        'Fysiskt uthållig och stresstålig',
        'Lagspelare på lagergolv',
        'Flexibel kring skift och helger',
        'Noggrann i materialhantering',
        'Pålitlig och punktlig',
      ],
    },

    profilExempel:
      'Erfaren truckförare med 5 års erfarenhet från e-handelsterminal och industrilager. Truckkort A1-A4 och B1-B3 med rutin på skjutstativtruck och sidlastare i höglager upp till 12 meter. Körkort B och ADR-bevis för farligt gods. Tillgänglig för 2-skift inklusive helger.',

    profilTips:
      'Antal år och branscher i öppningsraden. Andra meningen lyfter dina specifika behörigheter, trucktyper och eventuell höjd. Tredje meningen visar körkort, ADR och tillgänglighet som differentierar dig.',

    rekryterarTipsen: [
      {
        rubrik: 'Alla truckbehörigheter med datum',
        text: 'Lista exakt vilka truckar du har behörighet på (A1, A2, A3, A4, B1, B2, B3, B4, B5, C) och utgångsdatum. Lagerchefer matchar varje tjänst mot specifika krav. Utan rätt papper sorteras du bort omedelbart.',
      },
      {
        rubrik: 'Körkort och tunga behörigheter',
        text: 'Körkort B är ofta krav. Tunga körkort (BE, C, CE) öppnar fler tjänster och påverkar lönen. Skriv ut samtliga körkort med utgångsdatum så lagerchefen ser komplett bild av dina körrättigheter.',
      },
      {
        rubrik: 'ADR-bevis för farligt gods',
        text: 'För terminal och industri som hanterar farligt gods är ADR krav. Lager utan farligt gods värderar det också som senior-meritering. Bevis förnyas vart femte år. Lyft det med datum.',
      },
      {
        rubrik: 'Trucktyp och rutin',
        text: 'Skjutstativtruck för smala gångar, sidlastare för långgods, motviktstruck för pallar. Olika lager kräver olika trucker. Skriv ut hur länge du kört varje typ och vilka höjder du arbetat på.',
      },
      {
        rubrik: 'Branschvana är värdefullt',
        text: 'E-handelsterminal, industrilager, livsmedelslager, frys- och kyllager. Olika branscher har olika krav. En truckförare från livsmedel kan ofta inte direkt gå till industri utan introduktion.',
      },
      {
        rubrik: 'Schemaflexibilitet',
        text: 'Lager kör ofta 2- eller 3-skift, högsäsong kräver helgarbete. Skriv ut konkret: "Tillgänglig för 2-skift inkl helger" eller "Söker dagtid endast". Det sätter dig direkt i rätt urvalslista.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'Antal år, branscher du arbetat i, dina behörigheter och tillgänglighet på 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Företag, lager, tidsperiod. Konkretisera trucktyp, lagertyp och eventuell höjd. Branschvana lyfts.' },
      { sektion: 'Behörigheter', tips: 'Eget block med truckkort (A1-B5), körkort (B, BE, C), ADR och säkerhetscertifikat. Skriv utgångsdatum för varje.' },
      { sektion: 'Utbildning', tips: 'Gymnasium plus truckutbildning (TYA). Datum för truckkort och eventuella YH-utbildningar.' },
      { sektion: 'Säkerhet', tips: 'Akta Ryggen, fallskydd, brandskydd, BAM. Lyft alla aktuella säkerhetsutbildningar.' },
      { sektion: 'Övrigt', tips: 'Tillgänglighet för 2- eller 3-skift, helger, högsäsong. Eventuella språkkunskaper för internationella terminaler.' },
    ],

    checklista: [
      'Truckutbildning med specifika behörigheter (A1-A4, B1-B5)',
      'Körkort B (ofta krav)',
      'Tunga körkort (BE, C, CE) om relevant',
      'ADR-bevis för farligt gods',
      'Erfarenhet av specifika trucktyper',
      'Akta Ryggen eller motsvarande säkerhetsutbildning',
      'Tillgänglighet för 2- eller 3-skift, helger',
      'Eventuell brand- eller fallskyddsutbildning',
      'Branschvana (e-handel, industri, terminal, 3PL)',
      'WMS-system du arbetat i',
    ],

    atsInfo:
      'Både vår mall Logistik och premium-varianten Logistik Plus är ATS-säkra. Logistikföretag som DB Schenker, PostNord och DHL använder oftast SAP SuccessFactors eller Workday. Truckbehörigheter ska skrivas exakt som "A1, A2, A3, B1, B2" eftersom det är typiska sökord rekryterare filtrerar på. Skriv också ut körkort (B, BE, C) och ADR i klartext.',

    faqItems: [
      {
        q: 'Vad ska finnas med i ett truckförar-CV?',
        a: 'Alla aktiva truckbehörigheter (A1-A4, B1-B5, C, D) med utgångsdatum, körkort (B, eventuellt BE, C, CE), ADR-bevis för farligt gods, säkerhetsutbildningar (Akta Ryggen, fallskydd, brandskydd), erfarenhet av specifika trucktyper, branschvana (e-handel, industri, terminal), WMS-system och tillgänglighet för rotationsschema. Lägg till YH-utbildning om du söker arbetsledar-tjänster.',
      },
      {
        q: 'Hur skriver jag CV som truckförare utan tidigare erfarenhet?',
        a: 'Lyft eventuell tidigare erfarenhet av fysiskt arbete (bygg, jordbruk, produktion), tillgänglighet för rotationsschema, körkort B om du har det, och vilken truckutbildning du gått (TYA-grundkurs är vanlig). Skriv ut din vilja att lära och vara fysiskt aktiv. Många lager tar in nya utan erfarenhet under högsäsong och betalar truckutbildning efter provanställning.',
      },
      {
        q: 'Vilka truckbehörigheter är värdefullast?',
        a: 'B1-B3 motviktstruck är grundbehörigheterna och krav på de flesta lager. A2 stå-på-truck för smala gångar är värdefull på e-handelsterminaler. A4 skjutstativtruck öppnar tjänster på höglager. C sidlastare är specialiserad och meriterande för bygg- och industribolag.',
      },
      {
        q: 'Hur viktigt är ADR-bevis?',
        a: 'Mycket viktigt för specifika tjänster. Terminaler som hanterar farligt gods (kemikalier, batterier, tryckkärl) kräver ADR. Lager utan farligt gods värderar också ADR som senior-meritering. Bevis förnyas vart femte år, så håll det aktuellt. Kostnaden är låg jämfört med löneskillnaden.',
      },
      {
        q: 'Hur viktigt är arbetstider på CV:t?',
        a: 'Mycket. Många lager kör 2- eller 3-skift, kvällar eller helger. Ange tydligt: "Tillgänglig för 2-skift och helgarbete" eller "Söker dagtid endast". Det sorterar dig direkt in i rätt urvalslista och rekryteraren slipper ringa för att ta reda på det.',
      },
      {
        q: 'Vad är skillnaden mellan truckförare och lagerarbetare på CV:t?',
        a: 'Truckförare fokuserar främst på trucktyper, körkort och behörigheter. Lagerarbetare har bredare profil med plock, packning och inventering. Båda yrken överlappar i praktiken. Om du söker som truckförare, lyft truckkort och rutin överst. Om du söker som lagerarbetare, lyft även plockhastighet och WMS-erfarenhet.',
      },
      {
        q: 'Vilka nyckelord ska CV:t ha för att passera ATS?',
        a: 'Specifika truckar (A1, A2, A3, B1, B2), körkort (B, BE, C, CE), ADR-bevis, säkerhetscertifikat (Akta Ryggen, fallskydd), trucktyper (skjutstativtruck, sidlastare, motviktstruck), och bransch (e-handel, industri, 3PL, livsmedel). SAP SuccessFactors och Workday söker exakta matchningar mot jobbannonsens språk.',
      },
      {
        q: 'Hur lång ska ett truckförar-CV vara?',
        a: 'En sida räcker för de flesta. Om du har 5+ års erfarenhet med flera lager och flera behörigheter kan det bli 1,5 sidor. Det viktigaste är att truckbehörigheter, körkort och senaste arbetsplats syns på första sidan utan att man behöver scrolla.',
      },
      {
        q: 'Behöver jag personligt brev till truckförar-tjänster?',
        a: 'Beror på arbetsgivaren. Större bolag som PostNord och DB Schenker förväntar sig oftast brev medan mindre lager och bemanningsbolag kan acceptera bara CV. När brev förväntas, fokusera på tillgänglighet, fysisk uthållighet och varför just det lagret. Håll till en sida på 250-350 ord.',
      },
      {
        q: 'Vad ska jag inte ha med på mitt truckförar-CV?',
        a: 'Personnummer (bara födelseår), löneförväntningar, irrelevanta arbetslivserfarenheter äldre än 10-15 år, generiska påståenden ("hårt arbetande och ansvarstagande") utan stöd, hobbies som inte är lagerrelevanta, och utgångna truckkort eller certifikat. Stavfel och inkonsekvent formatering signalerar slarv, vilket är negativt i en bransch där noggrannhet räknas.',
      },
    ],
  },

  'ekonomiassistent': {
    seoIntro:
      'Som ekonomiassistent är du ofta första kontakten med ekonomi-yrket. Bolag inom alla branscher rekryterar ekonomiassistenter konstant, och det är oftast en ingång till mer seniora roller (controller, redovisningsekonom, ekonomichef). Ett välskrivet CV avgör om du blir kallad till intervju på den byrå eller det bolag du faktiskt vill jobba på.\n\nVår mall för ekonomiassistenter lyfter system (Visma, Fortnox, SAP), Excel-färdigheter och eventuella delar av redovisningsprocessen som första visuella element. Vi har strukturerat erfarenhetssektionen så att bolag, ansvarsområden och systemvana syns direkt. Det betyder att ekonomichefer kan bedöma din matchning på fem sekunder.\n\nKonkret innehåll vi rekommenderar: ekonomi- eller redovisningsutbildning från gymnasium eller YH, redovisningssystem du behärskar (Visma, Fortnox, SAP, Hogia, BL Administration), Excel-färdigheter (PivotTable, VLOOKUP, makron), löpande bokföringserfarenhet (kund- och leverantörsreskontra, avstämningar, periodiseringar), eventuell lönehantering, vana med kvitto- och utläggshantering, samt eventuell fakturering eller inkasso-erfarenhet.\n\nNedan hittar du två CV-mallar designade för ekonomiassistent-rollen, ett färdigt CV-exempel att utgå från, och konkreta tips på vad ekonomichefer på byråer, industribolag och tjänsteföretag faktiskt letar efter. Ladda ner mallen gratis och anpassa efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'Briefcase',
        title: 'Redovisningssystem i klartext',
        description: 'Visma Administration dominerar småbolag och byråer. Fortnox vanligast på e-handel och scale-ups. SAP på industri. Hogia på lön. Skriv ut systemnamnen så ATS-system kan filtrera fram dig.',
      },
      {
        icon: 'TrendingUp',
        title: 'Vilka delar av processen du behärskar',
        description: '"Hanterar 200 leverantörsfakturor per månad och avstämmer kund-/leverantörsreskontra varje vecka" säger mer än "ansvarade för bokföring". Konkretisera vilka delar av redovisningen du faktiskt jobbat med.',
      },
      {
        icon: 'CheckCircle',
        title: 'Excel-färdigheter på rätt nivå',
        description: 'PivotTable, VLOOKUP, INDEX/MATCH, makron, Power Query. Avancerad Excel är förmodat på ekonomijobb. Skriv ut vilka funktioner du behärskar i stället för "god datavana", som inte säger något.',
      },
      {
        icon: 'FileText',
        title: 'Eventuell bokslutsvana',
        description: 'Junior-roller fokuserar på löpande bokföring. Mid-level-roller stödjer i bokslut och årsredovisning. Skriv ut om du varit del av bokslutsteam eller bara löpande arbete. Det avgör vilka tjänster du kvalificerar för.',
      },
      {
        icon: 'Award',
        title: 'Bransch-erfarenhet',
        description: 'En ekonomiassistent från byrå har annan erfarenhet än en från industri eller e-handel. Lyft branschen i sammanfattningen så ekonomichefer ser om matchningen finns för deras typ av verksamhet.',
      },
      {
        icon: 'Target',
        title: 'Lönehantering är specialisering',
        description: 'Lön är ofta egen specialisering med Hogia, Visma Lön eller Fortnox Lön. Om du har lönehanteringsvana ska det lyftas tydligt eftersom det öppnar specifika tjänster och påverkar lönen.',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'System och certifieringar överst',
        description: 'Vår mall Konto har dedikerad sidopanel för redovisningssystem och eventuella certifieringar. Ekonomichefer ser systemvana på fem sekunder utan att behöva scrolla.',
      },
      {
        title: 'Tabellär layout med tabular-nums',
        description: 'Vi använder tabular-nums för att siffror och datum stämmer exakt. Volymsiffror (antal fakturor, kontering, avstämningar) lyfts visuellt utan att rymma i löpande prosa.',
      },
      {
        title: 'Eget block för Excel-färdigheter',
        description: 'PivotTable, VLOOKUP, makron, Power Query. Mallen separerar Excel-funktioner från generiska kompetenser så ekonomichefer ser specifik nivå direkt.',
      },
      {
        title: 'Mörkblå navy signalerar finans',
        description: 'Vi har valt #1e3a8a som signalerar bank, finans och seriositet. Ingen distraherande design som drar fokus från siffrorna och systemen.',
      },
      {
        title: 'Premium-mallen Konto Plus med snabbfakta',
        description: 'För senior-roller (senior ekonomiassistent, redovisningsassistent) lägger Konto Plus till tre-kolumns header med snabbfakta och navy-emerald gradient. Skapar en mer professionell first impression.',
      },
      {
        title: 'Plats för bransch och processdjup',
        description: 'Mallen har dedikerade rader för branschvana och vilka delar av redovisningsprocessen du behärskar. Visar djup utan att blanda med generisk kompetens.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Löpande bokföring',
        punkter: [
          'Kontera leverantörsfakturor och kundfakturor enligt kontoplanen',
          'Bokföra bankhändelser, kvitton och utlägg',
          'Hantera reskontra för kund och leverantör',
          'Skapa månads- och kvartalsavstämningar',
        ],
      },
      {
        rubrik: 'Fakturahantering',
        punkter: [
          'Skapa kundfakturor enligt order eller avtalsbasis',
          'Skicka, följa upp och hantera obetalda fakturor',
          'Hantera kreditfakturor och returer',
          'Eventuell inkassohantering vid obetalda fordringar',
        ],
      },
      {
        rubrik: 'Avstämningar och periodiseringar',
        punkter: [
          'Avstämma bank, kassa, kund- och leverantörsreskontra',
          'Genomföra periodiseringar för kostnader och intäkter',
          'Förbereda underlag för bokslut och årsredovisning',
          'Stötta redovisningsekonom eller controller med utredningar',
        ],
      },
      {
        rubrik: 'Skatt och moms',
        punkter: [
          'Förbereda underlag för momsdeklaration månadsvis eller kvartalsvis',
          'Hantera arbetsgivardeklaration och AGI',
          'Stötta vid skattekontoavstämning och deklarationer',
          'Hantera EU-moms och periodisk sammanställning vid behov',
        ],
      },
      {
        rubrik: 'Lön och utlägg',
        punkter: [
          'Förbereda löneunderlag (timrapporter, frånvaro, förmåner) vid behov',
          'Köra lön i Hogia, Visma Lön eller Fortnox Lön',
          'Hantera utlägg, traktamenten och milersättning',
          'Stötta HR med arbetsgivarintyg och anställningsavtal',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Redovisningssystem',
        termer: [
          { term: 'Visma Administration', forklaring: 'Marknadsledande affärssystem för småföretag och redovisningsbyråer.' },
          { term: 'Fortnox', forklaring: 'Molnbaserat affärssystem populärt på e-handel och scale-ups.' },
          { term: 'BL Administration', forklaring: 'Affärssystem från Björn Lundén för småföretag.' },
          { term: 'SAP', forklaring: 'Enterprise-system som dominerar industri och stora bolag.' },
          { term: 'Hogia Lön', forklaring: 'Lönesystem som dominerar svensk lönehantering.' },
          { term: 'Microsoft Dynamics', forklaring: 'Affärssystem från Microsoft, vanligt på medelstora bolag.' },
        ],
      },
      {
        kategori: 'Redovisningstermer',
        termer: [
          { term: 'Kontering', forklaring: 'Att tilldela en bokföringspost rätt konto och kostnadsställe.' },
          { term: 'Reskontra', forklaring: 'Detaljerad uppföljning av kund- och leverantörsfordringar.' },
          { term: 'Periodisering', forklaring: 'Fördelning av kostnader och intäkter över rätt period.' },
          { term: 'Avstämning', forklaring: 'Kontroll av att bokföringen stämmer mot underlag (bank, leverantörer).' },
          { term: 'Bokföringsorder', forklaring: 'Manuell bokföringspost för att korrigera eller komplettera transaktioner.' },
          { term: 'Verifikation', forklaring: 'Underlag för en bokföringspost (faktura, kvitto, kontrakt).' },
        ],
      },
      {
        kategori: 'Skatt och moms',
        termer: [
          { term: 'Moms', forklaring: 'Mervärdesskatt, deklareras månads-, kvartals- eller årsvis.' },
          { term: 'AGI', forklaring: 'Arbetsgivardeklaration på individnivå, månadsvis till Skatteverket.' },
          { term: 'Skattekonto', forklaring: 'Företagets konto hos Skatteverket för moms, arbetsgivaravgift och skatt.' },
          { term: 'EU-moms', forklaring: 'Moms vid handel inom EU, kräver periodisk sammanställning och VIES-koll.' },
          { term: 'Omvänd skattskyldighet', forklaring: 'Moms-regel där köparen redovisar moms istället för säljaren.' },
          { term: 'Skattedeklaration', forklaring: 'Företagets skattedeklaration som lämnas till Skatteverket månadsvis.' },
        ],
      },
      {
        kategori: 'Roller och titlar',
        termer: [
          { term: 'Ekonomiassistent', forklaring: 'Junior-roll med löpande bokföring, fakturering och avstämningar.' },
          { term: 'Redovisningsassistent', forklaring: 'Mid-level-roll som stödjer i bokslut och rapportering.' },
          { term: 'Redovisningsekonom', forklaring: 'Senior-roll med ansvar för bokslut och årsredovisning.' },
          { term: 'Lönespecialist', forklaring: 'Specialist på löpande lönehantering och kollektivavtal.' },
          { term: 'Controller', forklaring: 'Internekonom med fokus på rapportering, prognos och styrning.' },
          { term: 'Auktoriserad redovisningskonsult', forklaring: 'FAR-auktoriserad redovisningskonsult med högsta meritering.' },
        ],
      },
    ],

    typiskaArbetsgivare: [
      {
        kategori: 'Redovisningsbyråer',
        exempel: [
          'PwC, EY, KPMG, Grant Thornton, BDO',
          'Mindre och medelstora redovisningsbyråer',
          'Lokala byråer i Stockholm, Göteborg, Malmö',
          'Bokföringsbyråer för småföretagare',
        ],
      },
      {
        kategori: 'Industri och tillverkning',
        exempel: [
          'Volvo, Scania, ABB, IKEA Industry',
          'Ericsson, Sandvik, Atlas Copco',
          'Mindre tillverkningsbolag och underleverantörer',
          'Bygg- och anläggningsföretag',
        ],
      },
      {
        kategori: 'E-handel och tjänsteföretag',
        exempel: [
          'Klarna, Spotify, Storytel, Tink',
          'Boozt, NA-KD, Apotea, NetOnNet',
          'Konsultbolag och advokatbyråer',
          'Mindre tjänsteföretag och scale-ups',
        ],
      },
      {
        kategori: 'Offentlig sektor och bemanning',
        exempel: [
          'Statliga bolag (PostNord, SJ, Vattenfall)',
          'Kommuner och regioner',
          'Bemanningsbolag (Manpower, Adecco, Inhouse)',
          'Bostadsrättsföreningar och fastighetsbolag',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Ekonomi- eller handelsprogrammet (3 år)',
        beskrivning: 'Gymnasieutbildning med inriktning ekonomi eller handel ger grundkunskap. Vanlig ingång till ekonomiassistent-roller utan vidare studier.',
      },
      {
        rubrik: 'Yrkeshögskola redovisningsekonom (1-2 år)',
        beskrivning: 'YH-utbildningar med specifik inriktning (redovisningsekonom, ekonomiassistent, lönespecialist). Kvalificerar för senior-roller och ger fördel mot bara gymnasium.',
      },
      {
        rubrik: 'Civilekonom eller ekonomi-kandidat (3-5 år)',
        beskrivning: 'Akademisk examen från Handelshögskolan, Lund, Uppsala eller motsvarande. Vanlig grund för controller- och senior-roller. För ekonomiassistent något över-kvalificerat.',
      },
      {
        rubrik: 'Direkt anställning utan formell utbildning',
        beskrivning: 'Mindre bolag och byråer rekryterar ibland utan formell ekonomiutbildning om du har systemvana och Excel-kunskaper. Vanligt vid familjeföretag eller mindre redovisningsbyråer.',
      },
    ],

    kompetenser: {
      tekniska: [
        'Löpande bokföring enligt BAS-kontoplanen',
        'Visma Administration och Visma eEkonomi',
        'Fortnox och Fortnox Lön',
        'BL Administration och SAP',
        'Excel (PivotTable, VLOOKUP, makron, Power Query)',
        'Avstämningar och periodiseringar',
        'Kund- och leverantörsreskontra',
        'Momshantering och AGI',
        'Lönehantering i Hogia, Visma Lön eller Fortnox Lön',
        'Fakturering, inkasso och kreditbedömning',
        'Kvitto- och utläggshantering',
        'Digital bokföring och e-fakturahantering',
      ],
      personliga: [
        'Noggrann och strukturerad',
        'Sifferorienterad och analytisk',
        'Sekretessmedveten',
        'Pedagogisk i kontakt med kollegor',
        'Lugn vid deadlines och bokslut',
        'Lyhörd för förändrade rutiner',
        'Lagspelare i ekonomiteamet',
      ],
    },

    profilExempel:
      'Ekonomiassistent med 4 års erfarenhet från redovisningsbyrå och e-handelsbolag. Hanterar löpande bokföring för 15 kunder i Visma och Fortnox med fokus på leverantörsreskontra, avstämningar och momshantering. Avancerad Excel-användare med vana av PivotTable, makron och Power Query. Söker mer kvalificerade redovisningsuppdrag mot redovisningsekonom-roll.',

    profilTips:
      'År av erfarenhet och bransch i öppningsraden. Andra meningen lyfter konkreta system och vilka delar av redovisningen du behärskar. Tredje meningen visar Excel-färdigheter och eventuell utvecklingsambition som differentierar dig.',

    rekryterarTipsen: [
      {
        rubrik: 'Redovisningssystem i klartext',
        text: 'Visma, Fortnox, SAP, Hogia, BL Administration. Skriv ut systemnamnen så ATS-system kan filtrera fram dig och rekryteraren ser att du kan starta utan introduktion. Olika bolag använder olika system.',
      },
      {
        rubrik: 'Vilka delar av processen du behärskar',
        text: '"Hanterar 200 leverantörsfakturor per månad och avstämmer kund- och leverantörsreskontra varje vecka" säger mer än "ansvarade för bokföring". Konkretisera vilka delar av redovisningen du faktiskt jobbat med.',
      },
      {
        rubrik: 'Excel-färdigheter på rätt nivå',
        text: 'PivotTable, VLOOKUP, INDEX/MATCH, makron, Power Query. Avancerad Excel är förmodat på ekonomijobb. Skriv ut vilka funktioner du behärskar i stället för "god datavana".',
      },
      {
        rubrik: 'Eventuell bokslutsvana',
        text: 'Junior-roller fokuserar på löpande bokföring. Mid-level-roller stödjer i bokslut. Skriv ut om du varit del av bokslutsteam eller bara löpande arbete. Det avgör vilka tjänster du kvalificerar för.',
      },
      {
        rubrik: 'Bransch-erfarenhet',
        text: 'Byrå, industri, e-handel, tjänsteföretag. En ekonomiassistent från byrå har annan erfarenhet än en från industri. Lyft branschen i sammanfattningen så ekonomichefer ser matchningen.',
      },
      {
        rubrik: 'Lönehantering är specialisering',
        text: 'Lön är ofta egen specialisering med Hogia, Visma Lön eller Fortnox Lön. Om du har lönehanteringsvana ska det lyftas tydligt eftersom det öppnar specifika tjänster och påverkar lönen.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'År av erfarenhet, bransch, primära system och Excel-nivå på 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Bolag, tidsperiod, ansvarsområden. Konkretisera systemvana, kund- eller bolagsantal, volymer (fakturor per månad).' },
      { sektion: 'Utbildning', tips: 'Ekonomi- eller handelsprogrammet, YH-utbildning eller civilekonom. Eventuella vidareutbildningar (Excel-kurser, lönehantering).' },
      { sektion: 'Kompetenser', tips: 'System, processdelar (löpande, bokslut, lön), Excel-funktioner. Var konkret i stället för generiska påståenden.' },
      { sektion: 'Vidareutbildning', tips: 'Eventuella Excel-certifikat, kurser i specifik lagstiftning, utbildningar i nya system. Visar engagemang för utveckling.' },
      { sektion: 'Övrigt', tips: 'Branschvana, eventuell mentor- eller projekterfarenhet, ambition mot redovisningsekonom-roll om relevant.' },
    ],

    checklista: [
      'Ekonomi- eller handelsutbildning (gymnasium, YH eller universitet)',
      'Erfarenhet av specifika redovisningssystem',
      'Excel-färdigheter (PivotTable, VLOOKUP, makron)',
      'Löpande bokföringserfarenhet',
      'Kund- och leverantörsreskontra',
      'Avstämningar och periodiseringar',
      'Momshantering och AGI',
      'Eventuell bokslutsvana',
      'Lönehantering om relevant',
      'Bransch-erfarenhet (byrå, industri, e-handel)',
    ],

    atsInfo:
      'Både vår mall Konto och premium-varianten Konto Plus är ATS-säkra. Ekonomi- och redovisningsbolag använder oftast Workday eller egna ATS. Skriv ut system-namn (Fortnox, Visma, SAP, Hogia) i klartext eftersom rekryterare filtrerar exakta termer. Excel-funktioner (PivotTable, VLOOKUP) ska också skrivas ut.',

    faqItems: [
      {
        q: 'Vad ska finnas med i ett ekonomiassistent-CV?',
        a: 'Ekonomi- eller handelsutbildning, erfarenhet av specifika redovisningssystem (Visma, Fortnox, SAP, Hogia), Excel-färdigheter (PivotTable, VLOOKUP, makron), vilka delar av redovisningsprocessen du behärskar (löpande bokföring, avstämningar, fakturering, lön), bransch-erfarenhet, eventuell bokslutsvana, samt språkkunskaper. Lägg till ambition mot mer kvalificerade roller om relevant.',
      },
      {
        q: 'Hur skriver jag CV som ekonomiassistent utan tidigare erfarenhet?',
        a: 'Lyft examensarbete med ekonomi-inriktning, eventuell praktik på byrå, kurser i specifika system (Fortnox-certifikat, Visma-utbildning), och Excel-färdigheter med konkreta exempel. Skriv ut din vilja att utvecklas och söka redovisningsekonom-roll efter några år. Många byråer har strukturerade introduktionsprogram för nyexade.',
      },
      {
        q: 'Vilka redovisningssystem är viktigast?',
        a: 'Visma Administration dominerar småbolag och byråer. Fortnox vanligast på e-handel och scale-ups. SAP på industri. Hogia på lön. BL Administration på mindre bolag. Lista de du faktiskt behärskar med ungefärlig erfarenhet (år eller månader).',
      },
      {
        q: 'Hur visar jag Excel-kunskaper på rätt nivå?',
        a: 'Skriv ut konkreta funktioner: PivotTable, VLOOKUP, INDEX/MATCH, SUMIF/SUMIFS, makron, Power Query, dashboards. Generiska "god datavana" säger inget. Beskriv eventuella verktyg du byggt: "Skapade Excel-mall för leverantörsavstämning som minskade tid med 30%".',
      },
      {
        q: 'Är ekonomiassistent en bra karriärstart?',
        a: 'Ja. Ekonomiassistent är klassisk ingång till mer seniora ekonomiroller (redovisningsekonom, controller, ekonomichef). Många auktoriserade redovisningskonsulter började som ekonomiassistent på byrå. Det ger praktisk vana som senior-utbildningar inte alltid täcker.',
      },
      {
        q: 'Hur länge ska jag vara ekonomiassistent innan jag söker mer kvalificerade roller?',
        a: 'Beror på bolag och utbildning. Med YH-utbildning eller civilekonom kan du oftast söka redovisningsekonom-roll efter 2-3 år. Med bara gymnasieutbildning är det vanligtvis 4-5 år. På större bolag och byråer finns ofta interna karriärvägar med formella steg.',
      },
      {
        q: 'Vilka nyckelord ska CV:t ha för att passera ATS?',
        a: 'Specifika system (Fortnox, Visma, SAP, Hogia, BL Administration), processer (kontering, reskontra, avstämning, momshantering, AGI), Excel-funktioner (PivotTable, VLOOKUP, makron) och bransch-erfarenhet. Workday och egna ATS söker exakta matchningar mot jobbannonsens språk.',
      },
      {
        q: 'Hur lång ska ett ekonomiassistent-CV vara?',
        a: 'En sida räcker för junior-roller. Med 5+ års erfarenhet kan det bli 1,5 sidor. Det viktiga är att utbildning, system och senaste erfarenhet syns på första sidan. Branschen värderar precision även i CV-format.',
      },
      {
        q: 'Behöver jag personligt brev till ekonomiassistent-tjänster?',
        a: 'Ja, för de flesta tjänster i Sverige. Använd brevet för att förklara varför just den byrå eller bolag och beskriv en specifik situation där du visat noggrannhet eller löst ett ekonomiproblem. Beskriv ett system du implementerat eller en effektivisering du föreslagit. Håll till en sida på 250-350 ord.',
      },
      {
        q: 'Vad ska jag inte ha med på mitt CV?',
        a: 'Personnummer (bara födelseår), exakta lönesiffror, irrelevanta arbetslivserfarenheter äldre än 10-15 år, generiska påståenden ("noggrann och driven") utan stöd, kund- eller bolagsspecifika sekretessbelagda detaljer, och hobbies som inte är ekonomi-relevanta. Stavfel signalerar slarv, vilket är kritiskt i en bransch där precision räknas.',
      },
    ],
  },

  'vardbitrade': {
    seoIntro:
      'Som vårdbiträde är du grunden i svensk äldreomsorg och hemtjänst. Sveriges 290 kommuner har ständig brist på vårdbiträden, både för fast tjänst och vikariat, men enhetschefer slänger CV:n som inte tydligt visar erfarenhet av specifika brukargrupper, körkort och språkkunskaper. Ett välskrivet CV avgör om du blir kallad till intervju på det boende eller den hemtjänstgrupp du faktiskt vill jobba på.\n\nVår mall för vårdbiträden lyfter erfarenhet, körkort och språkkunskaper som första visuella element. Vi har strukturerat erfarenhetssektionen så att arbetsplats, brukargrupp och tidsperiod syns direkt med eventuella specialiseringar. Det betyder att enhetschefer kan bedöma din matchning på fem sekunder.\n\nKonkret innehåll vi rekommenderar: erfarenhet inom äldreomsorg, hemtjänst eller LSS-boende, eventuell vårdutbildning (vård- och omsorgsprogrammet, integrationsutbildning), körkort B (krav i hemtjänst), HLR-certifikat med utgångsdatum, basala hygienrutiner, eventuell delegeringsbehörighet, språkkunskaper (arabiska, persiska, somaliska, finska är efterfrågade), och tillgänglighet för rotationsschema.\n\nNedan hittar du två CV-mallar designade för vårdbiträdesrollen, ett färdigt CV-exempel att utgå från, och konkreta tips på vad enhetschefer i kommunal äldreomsorg och privata utförare faktiskt letar efter. Ladda ner mallen gratis och anpassa efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'CheckCircle',
        title: 'Brukargrupp i klartext',
        description: 'Äldreomsorg, demensvård, hemtjänst, LSS-boende, korttidsboende. Olika verksamheter kräver olika kompetens. Skriv konkret vilka brukargrupper du arbetat med och hur länge så enhetschefen ser direkt om matchningen finns.',
      },
      {
        icon: 'Briefcase',
        title: 'Körkort B är krav i hemtjänst',
        description: 'Hemtjänst kräver körkort B för att kunna besöka brukare. Äldreboenden och gruppboenden kräver det inte alltid. Skriv ut körkort, eventuell rutin och om du har egen bil. Det öppnar fler tjänster.',
      },
      {
        icon: 'Award',
        title: 'Vårdutbildning eller integrationsutbildning',
        description: 'Vård- och omsorgsprogrammet (gymnasium eller komvux) är meriterande men inte alltid krav. Validerad utländsk utbildning kompletterad med integrationsutbildning eller SAS funkar också. Skriv ut allt med datum.',
      },
      {
        icon: 'TrendingUp',
        title: 'Språkkunskaper är hård valuta',
        description: 'Brukare med utländsk bakgrund söker vårdbiträden med rätt språk. Arabiska, persiska, somaliska, finska, polska, tigrinja är efterfrågade i många kommuner. Lägg språk synligt med nivå (modersmål, flytande, konversation).',
      },
      {
        icon: 'FileText',
        title: 'HLR och hygienrutiner',
        description: 'HLR-certifikat och basala hygienrutiner är krav på de flesta arbetsplatser. Skriv ut utgångsdatum för HLR (förnyas vart annat år) så enhetschefen direkt ser om du behöver förnya.',
      },
      {
        icon: 'Target',
        title: 'Tillgänglighet och schema',
        description: 'Hemtjänst kör ofta delade turer (morgon/kväll). Äldreboenden har rotationsschema med natt och helger. Var explicit: "Tillgänglig för rotationsschema inkl helger" eller "Söker dagtid med möjlighet till sporadiska kvällar".',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'Brukargrupp och språk överst',
        description: 'Vår mall lyfter erfarenhet av specifika brukargrupper och språkkunskaper i sidopanelen. Enhetschefer ser matchningen på fem sekunder utan att behöva scrolla genom hela CV:t.',
      },
      {
        title: 'Erfarenhet per arbetsplats',
        description: 'Mallen separerar arbetsplatser (hemtjänst, äldreboende, LSS-boende, korttid) så bredd och djup syns. Du kan visa olika typer av omsorg utan att meriter konkurrerar om samma yta.',
      },
      {
        title: 'Eget block för certifikat',
        description: 'HLR, basala hygienrutiner, Akta Ryggen, BPSD-utbildning, eventuella delegeringar. Mallen lyfter formell kompetens som eget block med utgångsdatum.',
      },
      {
        title: 'Premium-mallen Vården med foto',
        description: 'I omsorgssektorn där relationer värderas, lägger premium-varianten Vården till foto och språkblock i sidopanelen. Skapar ett mer personligt intryck för enhetschefer som väljer mellan kandidater.',
      },
      {
        title: 'Sober färgsättning för omsorgssektorn',
        description: 'Vården värderar saklighet och respekt. Vi har valt dämpade emerald- och navy-toner som signalerar trygghet utan att bli sterila. Inget i mallen drar fokus från meriterna.',
      },
      {
        title: 'Plats för delegeringar',
        description: 'Insulin, sondmatning eller medicindelegering har egen rad. Det visar att du tar ansvar bortom standarduppgifter och meriterar för senior- och samordnar-roller.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Personlig omvårdnad',
        punkter: [
          'Hjälp med daglig hygien, måltider, toalettbesök och påklädning',
          'Stödja brukaren i att bibehålla självständighet och värdighet',
          'Använda förflyttningshjälpmedel (lift, glidlakan, rullator) säkert',
          'Anpassa stödet efter brukarens dagsform och kognitiva förmåga',
        ],
      },
      {
        rubrik: 'Hushållsarbete och praktiskt stöd',
        punkter: [
          'Städning, tvätt och inköp för brukare i hemtjänst',
          'Tillaga måltider eller värma färdigmat enligt önskemål',
          'Sköta växter och lättare hushållsuppgifter i hemmet',
          'Följa med på sjukvårdsbesök och myndighetskontakt',
        ],
      },
      {
        rubrik: 'Social aktivering',
        punkter: [
          'Delta i aktiviteter, utflykter och sociala sammanhang',
          'Stötta vid telefon- och digital kommunikation med anhöriga',
          'Bygga trygga relationer som motverkar ensamhet',
          'Identifiera tidiga tecken på psykisk eller fysisk ohälsa',
        ],
      },
      {
        rubrik: 'Dokumentation och rapportering',
        punkter: [
          'Dokumentera omvårdnadsåtgärder i Procapita, Lifecare eller motsvarande',
          'Följa genomförandeplaner och rapportera avvikelser',
          'Hantera sekretess och integritetsfrågor enligt OSL',
          'Lex Sarah-anmäla vid misstanke om missförhållanden',
        ],
      },
      {
        rubrik: 'Samverkan och utveckling',
        punkter: [
          'Samverka med sjuksköterska, biståndshandläggare och anhöriga',
          'Delta i arbetslagsmöten och brukarkonferenser',
          'Stötta nya kollegor under introduktion',
          'Bidra till förbättringsarbete och kvalitetsarbete på enheten',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Lagstiftning och regelverk',
        termer: [
          { term: 'SoL', forklaring: 'Socialtjänstlagen, gäller kommunal äldreomsorg och hemtjänst.' },
          { term: 'LSS', forklaring: 'Lagen om stöd och service till vissa funktionshindrade, gäller LSS-boenden.' },
          { term: 'OSL', forklaring: 'Offentlighets- och sekretesslagen, gäller offentlig vård.' },
          { term: 'PDL', forklaring: 'Patientdatalagen, gäller hälso- och sjukvård och dokumentation.' },
          { term: 'Lex Sarah', forklaring: 'Anmälningsskyldighet vid missförhållanden i socialtjänst.' },
          { term: 'Lex Maria', forklaring: 'Anmälningsskyldighet vid vårdskada inom hälso- och sjukvård.' },
        ],
      },
      {
        kategori: 'Verksamheter och brukargrupper',
        termer: [
          { term: 'Äldreboende', forklaring: 'Vård- och omsorgsboende för äldre med stora omsorgsbehov.' },
          { term: 'Demensboende', forklaring: 'Specialiserat boende för personer med demenssjukdom (BPSD-vård).' },
          { term: 'Hemtjänst', forklaring: 'Stöd i brukarens eget hem, ofta delade turer morgon och kväll.' },
          { term: 'LSS-boende', forklaring: 'Bostad med särskild service enligt LSS § 9:9.' },
          { term: 'Korttidsboende', forklaring: 'Tillfällig vistelse vid avlastning eller efter sjukhusvård.' },
          { term: 'Trygghetsboende', forklaring: 'Mellanting mellan eget hem och äldreboende, mindre stöd.' },
        ],
      },
      {
        kategori: 'Arbetsmetoder och kompetens',
        termer: [
          { term: 'BPSD-vård', forklaring: 'Beteendemässiga och Psykiska Symtom vid Demens, eget metodområde.' },
          { term: 'Personcentrerad vård', forklaring: 'Brukaren i centrum med fokus på individens behov och självbestämmande.' },
          { term: 'IBIC', forklaring: 'Individens Behov i Centrum, behovsbedömningsmodell i kommunal vård.' },
          { term: 'Genomförandeplan', forklaring: 'Dokument som beskriver hur en brukares behov ska tillgodoses.' },
          { term: 'Akta Ryggen', forklaring: 'Certifierad förflyttningsteknik för säker hantering av brukare.' },
          { term: 'Basala hygienrutiner', forklaring: 'Grundläggande hygienkrav på alla vårdarbetsplatser.' },
        ],
      },
      {
        kategori: 'System och dokumentation',
        termer: [
          { term: 'Procapita', forklaring: 'Verksamhetssystem som dominerar kommunal äldreomsorg.' },
          { term: 'Lifecare', forklaring: 'Omsorgsplaneringssystem i flera kommuner.' },
          { term: 'Combine', forklaring: 'Verksamhetssystem för socialtjänsten i några kommuner.' },
          { term: 'NPÖ', forklaring: 'Nationell patientöversikt över region- och vårdgränser.' },
          { term: 'Pascal', forklaring: 'Förskrivningsmodul för läkemedel kopplad till Socialstyrelsens register.' },
          { term: 'Trygghetslarm', forklaring: 'Larmsystem för brukare i hemtjänst, ofta kopplat till bemanning.' },
        ],
      },
    ],

    typiskaArbetsgivare: [
      {
        kategori: 'Kommunal äldreomsorg',
        exempel: [
          'Stockholms stad, Göteborgs stad, Malmö stad',
          'Mindre och medelstora kommuner runt om i Sverige',
          'Hemtjänst i kommunal regi',
          'Korttidsboenden och dagverksamhet',
        ],
      },
      {
        kategori: 'Privata utförare',
        exempel: [
          'Attendo, Vardaga, Humana, Ambea',
          'Norlandia, Tellusbarn, Frösunda',
          'Privata hemtjänstföretag',
          'LSS-utförare och funktionsstöd',
        ],
      },
      {
        kategori: 'Bemanning och vikariat',
        exempel: [
          'Bemanningsbolag (Dedicare, Veteranpoolen)',
          'Adecco Care, Manpower Vård',
          'Lokala bemanningsföretag i kommuner',
          'Säsongsvikariat och timanställningar',
        ],
      },
      {
        kategori: 'Specialiserade verksamheter',
        exempel: [
          'Demens- och BPSD-boenden',
          'Hospice och palliativa enheter',
          'Korttidsboenden för avlastning',
          'Daglig verksamhet enligt LSS',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Direkt anställning utan formell utbildning',
        beskrivning: 'Många kommuner och utförare rekryterar utan formell vårdutbildning om du visar lyhördhet och tillgänglighet. Arbetsgivaren ger introduktion på 1-2 veckor och betalar HLR-utbildning efter provanställning.',
      },
      {
        rubrik: 'Vård- och omsorgsprogrammet (3 år)',
        beskrivning: 'Gymnasieutbildning med inriktning omvårdnad. Vanlig grund för fast tjänst på äldreboende eller LSS-boende. Examen ger skyddad yrkestitel undersköterska från 1 juli 2023.',
      },
      {
        rubrik: 'Integrationsutbildning Komvux (1 år)',
        beskrivning: 'Vård- och omsorg-utbildning anpassad för nyanlända med utländsk vårdutbildning. Innehåller svenska, fackspråk och praktik. Vanlig väg in i svenska vårdyrket.',
      },
      {
        rubrik: 'Vidareutbildningar och kurser',
        beskrivning: 'BPSD-utbildning, HLR-certifikat, Akta Ryggen, basala hygienrutiner, demensvård. Kontinuerlig kompetensutveckling är meriterande och påverkar lön och tjänsteansvar.',
      },
    ],

    kompetenser: {
      tekniska: [
        'Personcentrerad omvårdnad och ADL-stöd',
        'Förflyttningsteknik enligt Akta Ryggen',
        'Demensvård och BPSD-hantering',
        'Hygien och basala hygienrutiner',
        'HLR och första hjälpen',
        'Eventuella medicindelegeringar (insulin, sondmatning)',
        'Dokumentation i Procapita, Lifecare eller Combine',
        'Genomförandeplaner enligt IBIC',
        'Trygghetslarm och larmhantering',
        'Måltidsförberedelser och kost för äldre',
        'Hjälpmedel (lift, glidlakan, rullator)',
        'Lex Sarah-anmälan och avvikelsehantering',
      ],
      personliga: [
        'Empati och relationsskapande',
        'Tålamod och lyhördhet',
        'Pålitlig och punktlig',
        'Stresstålig vid akuta situationer',
        'Kulturell kompetens',
        'Diskret och sekretessmedveten',
        'Lagspelare i arbetsgrupp',
      ],
    },

    profilExempel:
      'Erfaret vårdbiträde med 5 års erfarenhet inom kommunal äldreomsorg och hemtjänst. Specialiserad på demensvård och BPSD-hantering med utbildning från Demenscentrum 2023. Körkort B, HLR-certifikat och flerspråkig (svenska, arabiska, engelska). Tillgänglig för rotationsschema inklusive helger.',

    profilTips:
      'År av erfarenhet och primär brukargrupp i öppningsraden. Andra meningen lyfter eventuella specialiseringar (demens, palliativ, LSS) och certifikat. Tredje meningen visar körkort, språk och tillgänglighet som differentierar dig.',

    rekryterarTipsen: [
      {
        rubrik: 'Brukargrupp i klartext',
        text: 'Äldreomsorg, demensvård, hemtjänst, LSS-boende. Olika verksamheter kräver olika kompetens. Skriv konkret vilka brukargrupper du arbetat med och hur länge så enhetschefen ser direkt om matchningen finns.',
      },
      {
        rubrik: 'Körkort B är krav i hemtjänst',
        text: 'Hemtjänst kräver körkort B för att besöka brukare. Äldreboenden och gruppboenden kräver det inte alltid. Skriv ut körkort, eventuell rutin och om du har egen bil. Det öppnar fler tjänster.',
      },
      {
        rubrik: 'Vårdutbildning eller integrationsutbildning',
        text: 'Vård- och omsorgsprogrammet är meriterande men inte alltid krav. Validerad utländsk utbildning kompletterad med integrationsutbildning eller SAS funkar också. Skriv ut allt med datum.',
      },
      {
        rubrik: 'Språkkunskaper är hård valuta',
        text: 'Brukare med utländsk bakgrund söker vårdbiträden med rätt språk. Arabiska, persiska, somaliska, finska, polska, tigrinja är efterfrågade. Lägg språk synligt med nivå.',
      },
      {
        rubrik: 'HLR och hygienrutiner',
        text: 'HLR-certifikat och basala hygienrutiner är krav på de flesta arbetsplatser. Skriv ut utgångsdatum så enhetschefen direkt ser om du behöver förnya.',
      },
      {
        rubrik: 'Tillgänglighet och schema',
        text: 'Hemtjänst kör ofta delade turer. Äldreboenden har rotationsschema. Var explicit om vilket schema du söker så minskar antalet ansökningar du bedöms olämplig för.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'År av erfarenhet, primär brukargrupp, körkort och språk på 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Arbetsplats, brukargrupp, tidsperiod. Konkretisera arbetsuppgifter och eventuella specialiseringar (demens, palliativ).' },
      { sektion: 'Utbildning', tips: 'Vård- och omsorgsprogrammet, integrationsutbildning eller motsvarande. Eventuella vidareutbildningar (BPSD, demens).' },
      { sektion: 'Kompetenser', tips: 'Specifika kompetenser och certifikat. Var konkret om vilka delegeringar du har eller vilka hjälpmedel du behärskar.' },
      { sektion: 'Certifikat', tips: 'Eget block med HLR, basala hygienrutiner, Akta Ryggen, BPSD. Skriv utgångsdatum för varje.' },
      { sektion: 'Övrigt', tips: 'Körkort B, språk utöver svenska, tillgänglighet för rotationsschema.' },
    ],

    checklista: [
      'Erfarenhet av specifika brukargrupper',
      'Körkort B (krav i hemtjänst)',
      'HLR-certifikat med utgångsdatum',
      'Basala hygienrutiner',
      'Akta Ryggen eller motsvarande förflyttningsteknik',
      'Eventuella medicindelegeringar',
      'Vårdutbildning eller integrationsutbildning',
      'Språkkunskaper utöver svenska',
      'Tillgänglighet för rotationsschema',
      'Dokumentationssystem (Procapita, Lifecare)',
    ],

    atsInfo:
      'Både vår mall Norrsken och premium-varianten Vården är ATS-säkra. Kommunala arbetsgivare använder oftast Visma Recruit och Heroma. Privata utförare som Attendo och Humana använder Workday eller Teamtailor. Skriv ut systemnamn (Procapita, Lifecare), brukargrupper (demens, LSS) och certifikat (HLR, BPSD) i klartext.',

    faqItems: [
      {
        q: 'Vad är skillnaden mellan vårdbiträde och undersköterska?',
        a: 'Vårdbiträde är allmän personal utan formell vårdutbildning. Undersköterska har genomgått vård- och omsorgsprogrammet (3 år gymnasium eller komvux) och har sedan 1 juli 2023 skyddad yrkestitel. Undersköterskor får högre lön och kan ha medicindelegeringar. Vårdbiträden gör mest praktiskt stöd utan medicinska uppgifter.',
      },
      {
        q: 'Vad ska finnas med i ett vårdbiträde-CV?',
        a: 'Erfarenhet av specifika brukargrupper (äldre, demens, LSS), körkort B (krav i hemtjänst), HLR-certifikat med utgångsdatum, basala hygienrutiner, eventuella medicindelegeringar, språkkunskaper, samt tillgänglighet för rotationsschema. Lägg till vidareutbildningar (BPSD, demens) om du har dem.',
      },
      {
        q: 'Behövs vårdutbildning för att jobba som vårdbiträde?',
        a: 'Inte alltid. Många kommuner och utförare rekryterar utan formell vårdutbildning om du visar lyhördhet och tillgänglighet. Arbetsgivaren ger introduktion på 1-2 veckor och betalar HLR-utbildning efter provanställning. Däremot är vård- och omsorgsprogrammet meriterande och öppnar fler tjänster.',
      },
      {
        q: 'Hur lyfter jag språkkunskaper på CV:t?',
        a: 'Lista språk i sidopanelen med nivå (modersmål, flytande, konversation). Arabiska, persiska, somaliska, finska, polska, tigrinja är särskilt efterfrågade i många kommuner med flerspråkiga brukare. Eventuell tolkutbildning eller validering är meriterande.',
      },
      {
        q: 'Hur viktigt är körkort?',
        a: 'Körkort B är krav på de flesta hemtjänstorganisationer eftersom du måste kunna besöka brukare på olika adresser. På äldreboenden och gruppboenden är det inte alltid krav, men meriterande. Skriv ut körkortet och om du har egen bil, det påverkar vilka tjänster du kvalificerar för.',
      },
      {
        q: 'Vilka nyckelord ska CV:t ha för att passera ATS?',
        a: 'Specifika brukargrupper (äldre, demens, BPSD, LSS), arbetsplatstyper (äldreboende, hemtjänst, korttidsboende), certifikat (HLR, basala hygienrutiner, Akta Ryggen), system (Procapita, Lifecare), och språk. Visma Recruit och Workday söker exakta matchningar mot jobbannonsens språk.',
      },
      {
        q: 'Hur lång ska ett vårdbiträde-CV vara?',
        a: 'En sida räcker för de flesta. Med 5+ års erfarenhet kan det bli 1,5 sidor. Det viktigaste är att körkort, språk och senaste arbetsplats syns på första sidan. Vården värderar tydlighet över längd.',
      },
      {
        q: 'Behöver jag personligt brev till vårdbiträde-tjänster?',
        a: 'Ja, för de flesta tjänster i Sverige förväntas ett personligt brev. Använd brevet för att förklara varför just det boende eller den hemtjänstgrupp och beskriv en specifik situation där du visat omsorg eller löst en utmaning. Håll till en sida på 250-350 ord.',
      },
      {
        q: 'Vad är BPSD och varför är det meriterande?',
        a: 'BPSD står för Beteendemässiga och Psykiska Symtom vid Demens. Det är ett eget metodområde med utbildning genom Svenskt Demenscentrum och BPSD-registret. Vårdbiträden med BPSD-utbildning kvalificerar för specialiserade demensboenden och får ofta högre lön. Utbildningen tar 1-3 dagar.',
      },
      {
        q: 'Vad ska jag inte ha med på mitt vårdbiträde-CV?',
        a: 'Personnummer (bara födelseår), foto i offentlig sektor (riskerar diskriminering), brukares namn eller sekretessbelagda detaljer, generiska påståenden ("empatisk och social") utan konkreta exempel, irrelevanta arbetslivserfarenheter äldre än 10-15 år, och hobbies som inte är vård-relevanta. Stavfel signalerar slarv i en bransch där dokumentation räknas.',
      },
    ],
  },

  'hemtjanst': {
    seoIntro:
      'Som personal i hemtjänsten möter du varje dag äldre och funktionsnedsatta personer som vill bo kvar hemma. Sveriges 290 kommuner har konstant brist på hemtjänstpersonal, både i kommunal regi och hos privata utförare som Attendo, Vardaga och Humana. Ett välskrivet CV avgör om du blir kallad till intervju på den hemtjänstgrupp eller geografiska område du faktiskt vill jobba på.\n\nVår mall för hemtjänstpersonal lyfter körkort B, språk och tillgänglighet som första visuella element. Vi har strukturerat erfarenhetssektionen så att hemtjänstgrupp, brukartyp och tidsperiod syns direkt med eventuella delegeringar. Det betyder att enhetschefer kan bedöma din matchning på fem sekunder.\n\nKonkret innehåll vi rekommenderar: körkort B (absolut krav), erfarenhet av äldre, demens eller funktionsstöd, HLR-certifikat med utgångsdatum, basala hygienrutiner, eventuella medicindelegeringar (insulin, ögondroppar, kompressionsstrumpor), språkkunskaper för flerspråkiga brukare, mobil dokumentation (Tunstall Mobiltjänster, Phoniro Care, Lifecare Mobil), samt tillgänglighet för delade turer morgon och kväll.\n\nNedan hittar du två CV-mallar designade för hemtjänstrollen, ett färdigt CV-exempel att utgå från, och konkreta tips på vad enhetschefer i kommunal hemtjänst och privata utförare faktiskt letar efter. Ladda ner mallen gratis och anpassa efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'Briefcase',
        title: 'Körkort B är absolut krav',
        description: 'Hemtjänsten kräver körkort B för att kunna besöka 8-15 brukare per dag på olika adresser. Skriv ut körkort, hur länge du haft det och eventuell rutin med servicebil eller egen bil i tjänst.',
      },
      {
        icon: 'CheckCircle',
        title: 'Geografisk kunskap',
        description: 'Lokal kännedom om gator, kollektivtrafik och brukares områden är meriterande. Skriv ut vilka kommuner eller stadsdelar du arbetat i. Stockholm, Göteborg och Malmö delar oftast in hemtjänsten i geografiska zoner.',
      },
      {
        icon: 'Award',
        title: 'Erfarenhet av delade turer',
        description: 'Hemtjänsten kör ofta delade turer (morgon 7-11, kväll 16-21). Skriv ut din tillgänglighet konkret. "Tillgänglig för delade turer inkl helger" sätter dig i rätt urvalslista.',
      },
      {
        icon: 'TrendingUp',
        title: 'Brukartyper och specialiseringar',
        description: 'Äldre med fysisk funktionsnedsättning, demens, palliativ vård, neurologi (MS, Parkinson). Olika hemtjänstgrupper har olika brukarprofiler. Lyft din erfarenhet av specifika grupper.',
      },
      {
        icon: 'FileText',
        title: 'Mobil dokumentation',
        description: 'Tunstall Mobiltjänster, Phoniro Care, Lifecare Mobil dominerar svensk hemtjänst. Skriv ut systemnamnen så ATS-system kan filtrera fram dig och enhetschefen ser att du kan starta utan introduktion.',
      },
      {
        icon: 'Target',
        title: 'Språk för flerspråkiga brukare',
        description: 'Många äldre i större kommuner har utländsk bakgrund och vill ha personal som talar deras modersmål. Arabiska, finska, persiska, polska, somaliska är efterfrågade. Lägg språk synligt.',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'Körkort och språk överst',
        description: 'Vår mall Vården lyfter körkort B och språkkunskaper i sidopanelen så enhetschefer ser baskraven på fem sekunder. Båda är hård valuta i hemtjänstbranschen.',
      },
      {
        title: 'Erfarenhet per hemtjänstgrupp',
        description: 'Mallen separerar hemtjänstgrupper, geografiska områden och brukartyper. Du kan visa lokal kännedom utan att meriter konkurrerar om samma yta.',
      },
      {
        title: 'Plats för delegeringar och certifikat',
        description: 'HLR, basala hygienrutiner, Akta Ryggen, eventuella medicindelegeringar har egen rad med utgångsdatum. Mallen lyfter formell kompetens utan att blanda med löpande text.',
      },
      {
        title: 'Premium-mallen Vården med foto',
        description: 'I hemtjänsten där relationer värderas, lägger premium-varianten Vården till foto. Många brukare vill se vem som ska besöka deras hem och foto ger trygghet.',
      },
      {
        title: 'Schema-block i sidopanelen',
        description: 'Mallen har dedikerat block för tillgänglighet (delade turer, helger, jour). Enhetschefer behöver veta direkt vilka pass du kan ta.',
      },
      {
        title: 'Sober färgsättning för hemvistelse',
        description: 'Hemtjänsten värderar trygghet och respekt. Vi har valt dämpade emerald- och navy-toner som signalerar professionell omsorg utan att bli sterila.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Personlig omvårdnad i hemmet',
        punkter: [
          'Hjälp med daglig hygien, toalettbesök, påklädning och måltider',
          'Stödja brukaren att bibehålla självständighet i sitt eget hem',
          'Använda hjälpmedel (lift, glidlakan, duschpall) säkert',
          'Anpassa stödet efter brukarens önskemål och rutiner',
        ],
      },
      {
        rubrik: 'Hushållsarbete och inköp',
        punkter: [
          'Städning, tvätt och sänglinneskifte enligt genomförandeplan',
          'Inköp av matvaror, hygienartiklar och receptbelagda läkemedel',
          'Tillaga måltider eller värma färdigmat enligt brukarens önskemål',
          'Sköta växter, post och praktiska sysslor i hemmet',
        ],
      },
      {
        rubrik: 'Medicinsk hantering vid delegering',
        punkter: [
          'Ge insulin, ögondroppar eller kompressionsstrumpor enligt delegering',
          'Påminna om eller dela ut läkemedel ur dosett',
          'Mäta blodtryck och blodsocker vid behov',
          'Rapportera förändringar i brukarens hälsa till sjuksköterska',
        ],
      },
      {
        rubrik: 'Trygghet och social kontakt',
        punkter: [
          'Bygga trygga relationer med brukare och anhöriga',
          'Hantera trygghetslarm och akuta situationer',
          'Identifiera tecken på psykisk eller fysisk ohälsa',
          'Stötta brukaren i kontakt med vården och anhöriga',
        ],
      },
      {
        rubrik: 'Dokumentation och samverkan',
        punkter: [
          'Dokumentera besök i mobil enhet (Tunstall, Phoniro, Lifecare)',
          'Följa genomförandeplaner och rapportera avvikelser',
          'Samverka med biståndshandläggare och sjuksköterska',
          'Lex Sarah-anmäla vid misstanke om missförhållanden',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Lagstiftning och regelverk',
        termer: [
          { term: 'SoL', forklaring: 'Socialtjänstlagen, ramverk för hemtjänst.' },
          { term: 'LSS', forklaring: 'Lagen om stöd och service vid funktionsnedsättning.' },
          { term: 'OSL', forklaring: 'Offentlighets- och sekretesslagen vid hemtjänst i kommunal regi.' },
          { term: 'HSL', forklaring: 'Hälso- och sjukvårdslagen vid medicinska delegeringar.' },
          { term: 'Lex Sarah', forklaring: 'Anmälningsskyldighet vid missförhållanden i hemtjänsten.' },
          { term: 'Genomförandeplan', forklaring: 'Dokument som beskriver hur brukarens behov ska tillgodoses.' },
        ],
      },
      {
        kategori: 'Mobila system och dokumentation',
        termer: [
          { term: 'Tunstall Mobiltjänster', forklaring: 'Vanligaste mobilappen för hemtjänstpersonal i Sverige.' },
          { term: 'Phoniro Care', forklaring: 'Mobil dokumentation och dörrhantering med digital nyckel.' },
          { term: 'Lifecare Mobil', forklaring: 'Mobil version av Lifecare-systemet för dokumentation i hemmet.' },
          { term: 'Procapita Mobil', forklaring: 'Mobilversion av Procapita för dokumentation under besök.' },
          { term: 'Trygghetslarm', forklaring: 'Larmsystem som brukare bär hemma, kopplat till bemanning.' },
          { term: 'Digital nyckel', forklaring: 'Elektronisk nyckelhantering via mobilapp för säker hemleverans.' },
        ],
      },
      {
        kategori: 'Brukargrupper och insatser',
        termer: [
          { term: 'Äldre med ADL-behov', forklaring: 'Personer som behöver stöd med daglig livsföring.' },
          { term: 'Demens i hemmet', forklaring: 'Personer med demens som bor kvar hemma med stöd.' },
          { term: 'Hemsjukvård', forklaring: 'Sjukvård som ges i hemmet av sjuksköterska, ofta i kombination med hemtjänst.' },
          { term: 'Palliativ hemvård', forklaring: 'Lindrande vård i livets slutskede i brukarens eget hem.' },
          { term: 'Anhörigstöd', forklaring: 'Stöd och avlastning för anhöriga som vårdar närstående.' },
          { term: 'Korttidsboende', forklaring: 'Tillfällig vistelse vid avlastning, ofta växelvis med hemtjänst.' },
        ],
      },
      {
        kategori: 'Schema och anställning',
        termer: [
          { term: 'Delade turer', forklaring: 'Två arbetspass per dag (morgon + kväll) med ledig tid emellan.' },
          { term: 'Heltidsmått', forklaring: 'Fullt heltidsmått inom Kommunals avtal är 38,25 timmar per vecka.' },
          { term: 'Vikariat', forklaring: 'Tillfälliga anställningar som ofta används vid sjukvikariat.' },
          { term: 'Timanställning', forklaring: 'Anställning per timme utan fast schema, vanligt vid kortare uppdrag.' },
          { term: 'Beredskap', forklaring: 'Tillgänglighet hemma med utryckning vid behov, ofta nattetid.' },
          { term: 'LOV', forklaring: 'Lagen om valfrihetssystem, brukaren väljer själv utförare.' },
        ],
      },
    ],

    typiskaArbetsgivare: [
      {
        kategori: 'Kommunal hemtjänst',
        exempel: [
          'Stockholms stad, Göteborgs stad, Malmö stad',
          'Mindre och medelstora kommuner runt om i Sverige',
          'Hemtjänst i kommunal regi inom alla 290 kommuner',
          'Specialteam för demens, palliativ vård eller LSS',
        ],
      },
      {
        kategori: 'Privata utförare via LOV',
        exempel: [
          'Attendo, Vardaga, Humana, Ambea',
          'Norlandia, Frösunda Hemtjänst',
          'Mindre privata hemtjänstföretag',
          'Brukarvalda utförare i större kommuner',
        ],
      },
      {
        kategori: 'Bemanning och vikariat',
        exempel: [
          'Bemanningsbolag (Dedicare, Veteranpoolen)',
          'Adecco Care, Manpower Vård',
          'Lokala bemanningsföretag',
          'Säsongsvikariat och timanställningar',
        ],
      },
      {
        kategori: 'Specialiserade verksamheter',
        exempel: [
          'Demens-specialiserad hemtjänst',
          'Hemsjukvård (oftast region men i kombination)',
          'Palliativ hemvård och hospice',
          'Daglig verksamhet enligt LSS',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Direkt anställning utan formell utbildning',
        beskrivning: 'Vanligaste vägen in. Många kommuner och utförare rekryterar utan formell vårdutbildning om du har körkort B och tillgänglighet. Arbetsgivaren ger introduktion på 1-2 veckor och betalar HLR-utbildning.',
      },
      {
        rubrik: 'Vård- och omsorgsprogrammet (3 år)',
        beskrivning: 'Gymnasieutbildning ger fast tjänst och högre lön. Examen ger skyddad yrkestitel undersköterska från 1 juli 2023. Vanlig grund för demens- eller palliativa team.',
      },
      {
        rubrik: 'Integrationsutbildning Komvux (1 år)',
        beskrivning: 'Vård- och omsorg-utbildning anpassad för nyanlända med utländsk vårdbakgrund. Innehåller svenska, fackspråk och praktik. Vanlig väg in för utlandsutbildade.',
      },
      {
        rubrik: 'Vidareutbildningar och delegeringskurser',
        beskrivning: 'BPSD-utbildning, demensvård, insulindelegering, palliativ vård. Korta kurser som ger meriterande kompetens och påverkar lön och möjligheter.',
      },
    ],

    kompetenser: {
      tekniska: [
        'Personcentrerad omvårdnad i hemmiljö',
        'Förflyttningsteknik enligt Akta Ryggen',
        'Demensvård och BPSD-hantering',
        'Mobil dokumentation (Tunstall, Phoniro, Lifecare Mobil)',
        'HLR och första hjälpen',
        'Eventuella medicindelegeringar (insulin, ögondroppar, kompressionsstrumpor)',
        'Trygghetslarm och larmhantering',
        'Hjälpmedel för rörelseförmåga (lift, rullator, duschpall)',
        'Måltidsförberedelser och kost för äldre',
        'Hygien och basala hygienrutiner',
        'Digital nyckelhantering',
        'Lex Sarah-anmälan',
      ],
      personliga: [
        'Empati och relationsskapande',
        'Pålitlig och punktlig',
        'Stresstålig vid akuta hembesök',
        'Diskret och respektfull i brukarens hem',
        'Lyhörd för brukarens önskemål',
        'Kulturell kompetens',
        'Självständig i mobilt arbete',
      ],
    },

    profilExempel:
      'Erfaren hemtjänstpersonal med 6 års erfarenhet inom kommunal och privat hemtjänst i Stockholm. Hanterar 10-12 brukarbesök per dag med fokus på äldre med demens och fysisk funktionsnedsättning. Insulindelegering, körkort B, HLR-certifikat och flerspråkig (svenska, arabiska, engelska). Tillgänglig för delade turer inklusive helger.',

    profilTips:
      'År av erfarenhet, geografiskt område och brukartyp i öppningsraden. Andra meningen lyfter besöksvolym, eventuella delegeringar och körkort. Tredje meningen visar språk och tillgänglighet som differentierar dig.',

    rekryterarTipsen: [
      {
        rubrik: 'Körkort B är absolut krav',
        text: 'Hemtjänsten kräver körkort B för att kunna besöka 8-15 brukare per dag på olika adresser. Skriv ut körkort, hur länge du haft det och eventuell rutin med servicebil.',
      },
      {
        rubrik: 'Geografisk kunskap',
        text: 'Lokal kännedom om gator, kollektivtrafik och brukares områden är meriterande. Skriv ut vilka kommuner eller stadsdelar du arbetat i.',
      },
      {
        rubrik: 'Erfarenhet av delade turer',
        text: 'Hemtjänsten kör ofta delade turer (morgon 7-11, kväll 16-21). Skriv ut din tillgänglighet konkret. "Tillgänglig för delade turer inkl helger" sätter dig i rätt urvalslista.',
      },
      {
        rubrik: 'Brukartyper och specialiseringar',
        text: 'Äldre med fysisk funktionsnedsättning, demens, palliativ vård, neurologi. Olika hemtjänstgrupper har olika brukarprofiler. Lyft din erfarenhet av specifika grupper.',
      },
      {
        rubrik: 'Mobil dokumentation',
        text: 'Tunstall Mobiltjänster, Phoniro Care, Lifecare Mobil. Skriv ut systemnamnen så ATS-system kan filtrera fram dig och enhetschefen ser att du kan starta utan introduktion.',
      },
      {
        rubrik: 'Språk för flerspråkiga brukare',
        text: 'Många äldre i större kommuner har utländsk bakgrund. Arabiska, finska, persiska, polska, somaliska är efterfrågade. Lägg språk synligt med nivå.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'År av erfarenhet, område, brukartyp, körkort och språk på 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Hemtjänstgrupp, geografiskt område, tidsperiod, brukartyper. Konkretisera besöksvolym och eventuella specialiseringar.' },
      { sektion: 'Utbildning', tips: 'Vård- och omsorgsutbildning eller integrationsutbildning. Eventuella vidareutbildningar (BPSD, demens, palliativ).' },
      { sektion: 'Kompetenser', tips: 'Mobila system, hjälpmedel, delegeringar och certifikat. Var konkret om vilka system du arbetat i.' },
      { sektion: 'Certifikat', tips: 'Eget block med HLR, basala hygienrutiner, Akta Ryggen, eventuella delegeringar med utgångsdatum.' },
      { sektion: 'Övrigt', tips: 'Körkort B med datum, språk utöver svenska, tillgänglighet för delade turer och helger.' },
    ],

    checklista: [
      'Körkort B (absolut krav)',
      'Erfarenhet av brukargrupper',
      'HLR-certifikat med utgångsdatum',
      'Basala hygienrutiner',
      'Akta Ryggen eller motsvarande',
      'Eventuella medicindelegeringar',
      'Mobila system (Tunstall, Phoniro, Lifecare Mobil)',
      'Språkkunskaper utöver svenska',
      'Tillgänglighet för delade turer',
      'Geografisk kännedom',
    ],

    atsInfo:
      'Både vår mall Norrsken och premium-varianten Vården är ATS-säkra. Kommunala arbetsgivare använder oftast Visma Recruit. Privata utförare som Attendo, Vardaga och Humana använder Workday eller Teamtailor. Skriv ut körkort B, system (Tunstall, Phoniro), brukargrupper (demens, palliativ) och certifikat (HLR) i klartext.',

    faqItems: [
      {
        q: 'Vad ska finnas med i ett hemtjänst-CV?',
        a: 'Körkort B (krav), erfarenhet av brukargrupper, HLR-certifikat med utgångsdatum, basala hygienrutiner, eventuella medicindelegeringar, mobila system du arbetat i (Tunstall, Phoniro, Lifecare Mobil), språkkunskaper, samt tillgänglighet för delade turer. Lägg till vidareutbildningar och geografisk kännedom om relevant.',
      },
      {
        q: 'Behöver jag formell utbildning för hemtjänst?',
        a: 'Inte alltid. Många kommuner och utförare rekryterar utan formell vårdutbildning om du har körkort B och tillgänglighet. Arbetsgivaren ger introduktion på 1-2 veckor och betalar HLR-utbildning efter provanställning. Vård- och omsorgsprogrammet är meriterande och öppnar fler tjänster med högre lön.',
      },
      {
        q: 'Hur viktigt är körkort B?',
        a: 'Absolut krav i de flesta hemtjänstorganisationer eftersom du måste kunna besöka 8-15 brukare per dag på olika adresser. Vissa stadskärnor i Stockholm och Göteborg har gångdistrikt där körkort inte krävs, men det är undantag. Utan körkort begränsas dina möjligheter kraftigt.',
      },
      {
        q: 'Vad är skillnaden mellan kommunal och privat hemtjänst?',
        a: 'Kommunal hemtjänst drivs av kommunen själv. Privata utförare (Attendo, Humana, Vardaga) driver hemtjänst på uppdrag enligt LOV (Lagen om valfrihet). Brukaren väljer själv. Kollektivavtal (Kommunal eller KFO/KFS) reglerar villkor. Privata utförare har ofta fler vikariat och högre flexibilitet, kommunal har ofta mer schema-stabilitet.',
      },
      {
        q: 'Hur lyfter jag mobil dokumentation på CV:t?',
        a: 'Skriv ut konkreta system: Tunstall Mobiltjänster, Phoniro Care, Lifecare Mobil, Procapita Mobil. Olika kommuner använder olika system. Att kunna det system kommunen redan har minskar din introduktionstid och är värdefullt på CV:t.',
      },
      {
        q: 'Vilka delegeringar är mest värdefulla?',
        a: 'Insulin är vanligaste och mest efterfrågade. Ögondroppar och kompressionsstrumpor är också vanliga. Sondmatning och PEG-hantering kvalificerar för komplexa brukare. Skriv ut alla aktiva delegeringar med datum och från vilken sjuksköterska du fick delegeringen.',
      },
      {
        q: 'Vilka nyckelord ska CV:t ha för att passera ATS?',
        a: 'Körkort B, brukargrupper (äldre, demens, BPSD, LSS), system (Tunstall, Phoniro, Lifecare Mobil, Procapita), certifikat (HLR, basala hygienrutiner, Akta Ryggen, BPSD), och språk. Visma Recruit, Workday och Teamtailor söker exakta matchningar.',
      },
      {
        q: 'Hur lång ska ett hemtjänst-CV vara?',
        a: 'En sida räcker för de flesta. Med 5+ års erfarenhet och flera arbetsplatser kan det bli 1,5 sidor. Det viktigaste är att körkort B, språk och senaste arbetsplats syns på första sidan utan att man behöver scrolla.',
      },
      {
        q: 'Behöver jag personligt brev till hemtjänst-tjänster?',
        a: 'Ja, för de flesta tjänster. Använd brevet för att förklara varför just den hemtjänstgrupp eller utförare och beskriv en specifik situation där du visat omsorg eller löst en utmaning hemma hos brukare. Håll till en sida på 250-350 ord.',
      },
      {
        q: 'Vad ska jag inte ha med på mitt hemtjänst-CV?',
        a: 'Personnummer (bara födelseår), foto i offentlig sektor, brukares namn eller adresser, sekretessbelagda detaljer om besök, generiska påståenden ("empatisk och pålitlig") utan konkreta exempel, och hobbies som inte är vård-relevanta. Stavfel och slarv signalerar oseriös attityd, vilket är negativt i ett yrke där noggrannhet räknas.',
      },
    ],
  },

  'fysioterapeut': {
    seoIntro:
      'Som fysioterapeut bedöms du på legitimation, specialiseringar och din förmåga att leverera evidensbaserad rehabilitering. Region- och kommunala arbetsgivare har konstant öppna tjänster, både inom slutenvård, primärvård och kommunal hemrehabilitering. Privata kliniker som Curera, Aleris, Capio och mindre praktiker konkurrerar om samma kandidater. Ett välskrivet CV avgör om du blir kallad till intervju på den klinik eller mottagning du faktiskt vill jobba på.\n\nVår mall för fysioterapeuter lyfter legitimation från Socialstyrelsen, behandlingsmetoder och specialistutbildningar som första visuella element. Vi har strukturerat erfarenhetssektionen så att klinik, patientgrupp och tidsperiod syns direkt med eventuella forskningsmeriter eller vidareutbildningar. Det betyder att verksamhetschefer kan bedöma din matchning på fem sekunder.\n\nKonkret innehåll vi rekommenderar: fysioterapeutexamen med lärosäte och år, legitimation från Socialstyrelsen med datum, eventuell specialistutbildning (OMT, ortopedisk medicin, idrottsmedicin, neurologi), behandlingsmetoder du behärskar (McKenzie, akupunktur, manuell terapi, MTT), patientgrupper (ortopedi, neurologi, geriatrik, idrott), journalsystem (TakeCare, Cosmic, Medicus), forskningsmeriter, samt eventuell egen praktik eller mottagning.\n\nNedan hittar du två CV-mallar designade för fysioterapeutrollen, ett färdigt CV-exempel att utgå från, och konkreta tips på vad verksamhetschefer på sjukhus, primärvård och privata kliniker faktiskt letar efter. Ladda ner mallen gratis och anpassa efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'Award',
        title: 'Legitimation och specialistbevis först',
        description: 'Skriv ut Socialstyrelsens registrering med datum. Eventuell specialistutbildning (OMT, ortopedisk medicin, idrottsmedicin, neurologi) lyfts i samma block. Verksamhetschefer skannar först efter behörighet.',
      },
      {
        icon: 'CheckCircle',
        title: 'Behandlingsmetoder du behärskar',
        description: 'McKenzie-metoden för rygg, ortopedisk manuell terapi (OMT), Mulligan, Maitland, akupunktur, MTT (Medicinsk Tränings Terapi), basal kroppskännedom. Var konkret om vilka metoder du behärskar i stället för "manuella tekniker".',
      },
      {
        icon: 'TrendingUp',
        title: 'Patientgrupper och volymer',
        description: '"30 patienter per dag på ortopedmottagning" eller "12 hemrehab-besök dagligen" säger mer än "klinisk fysioterapi". Konkreta volymer visar din förmåga att leverera i svensk vårdvardag.',
      },
      {
        icon: 'FileText',
        title: 'Journalsystem och dokumentation',
        description: 'TakeCare, Cosmic, Medicus, Carejourney. Olika regioner och privata kliniker använder olika system. Skriv ut systemnamnen så Heroma och Visma Recruit kan filtrera fram dig.',
      },
      {
        icon: 'Briefcase',
        title: 'Specialistområde och vidareutbildning',
        description: 'OMT, ortopedisk medicin, idrottsmedicin, neurologi, geriatrik, andning, lymfödembehandling. Specialistinriktning öppnar specifika tjänster och påverkar lönen direkt. Lyft din spetskompetens i sammanfattningen.',
      },
      {
        icon: 'Target',
        title: 'Forskning och utvecklingsarbete',
        description: 'Eventuell licentiat eller doktorsexamen, publikationer, forskningsbidrag, kliniska studier. Forskningsmeriter är centrala för universitetstjänster och seniora roller på regionalanknutna kliniker.',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'Legitimation och specialistbevis överst',
        description: 'Vår mall Klinik har sidopanel för Socialstyrelsens legitimation och eventuell specialistutbildning. Verksamhetschefer ser dina meriter på fem sekunder utan att behöva scrolla.',
      },
      {
        title: 'Klinisk erfarenhet uppdelad per område',
        description: 'Mallen separerar slutenvård, primärvård, hemrehab och privatpraktik så patientgrupper syns. Du kan visa bredd över olika vårdformer utan att meriter konkurrerar om samma yta.',
      },
      {
        title: 'Eget block för behandlingsmetoder',
        description: 'McKenzie, OMT, Mulligan, akupunktur, MTT. Mallen lyfter behandlingsmetoder som eget block så verksamhetschefer letar specifikt efter metoder de redan använder på kliniken.',
      },
      {
        title: 'Plats för forskningsmeriter',
        description: 'Mallen har dedikerat block för publikationer, forskningsbidrag och eventuell licentiat eller disputation. Centralt för universitetssjukhus och regionalanknutna specialistkliniker.',
      },
      {
        title: 'Tidlös serif för formell prestige',
        description: 'Vi har valt formell serif-typografi som signalerar akademisk grund och evidensbaserad praxis. Vården och Region Sverige värderar formell uttryckssätt på CV:t.',
      },
      {
        title: 'Premium-mallen Klinik med foto',
        description: 'För senior-roller och privatpraktik lägger Klinik-mallen till foto och LinkedIn. Skapar en mer personlig first impression utan att kompromissa med ATS-läsbarhet.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Bedömning och behandling',
        punkter: [
          'Genomföra fysioterapeutiska undersökningar och funktionsbedömningar',
          'Sätta diagnos och behandlingsplan utifrån evidensbaserad praxis',
          'Behandla patienter med manuell terapi, träning och pedagogiska råd',
          'Anpassa behandling efter patientens individuella mål och resurser',
        ],
      },
      {
        rubrik: 'Rehabilitering och träning',
        punkter: [
          'Utforma individuella rehab-program efter ortopediska skador eller operationer',
          'Genomföra gruppträning för specifika diagnoser (rygg, knä, höft, axel)',
          'Använda MTT (Medicinsk Tränings Terapi) eller motsvarande träningsmetoder',
          'Stötta patienter med långvarig smärta enligt biopsykosocial modell',
        ],
      },
      {
        rubrik: 'Specialiserade behandlingsmetoder',
        punkter: [
          'Tillämpa OMT, McKenzie, Mulligan eller Maitland enligt specialistutbildning',
          'Genomföra akupunkturbehandling vid smärta eller spänningstillstånd',
          'Behandla lymfödem med manuell lymfdränage och kompressionsbehandling',
          'Arbeta med basal kroppskännedom eller psykosomatik vid behov',
        ],
      },
      {
        rubrik: 'Dokumentation och uppföljning',
        punkter: [
          'Journalföring i TakeCare, Cosmic eller motsvarande enligt PDL',
          'Skriva remisser, intyg och status till andra vårdgivare',
          'Sätta mätbara mål och utvärdera behandlingsresultat enligt skattningsskalor',
          'Hantera försäkringsärenden och rehabintyg vid behov',
        ],
      },
      {
        rubrik: 'Tvärprofessionellt teamarbete',
        punkter: [
          'Samverka med läkare, sjuksköterskor, arbetsterapeuter och kuratorer',
          'Delta i ronder, vårdplaneringar och rehabiliteringsmöten',
          'Handleda fysioterapeutstudenter och nya kollegor',
          'Bidra till klinikens utvecklingsarbete och kvalitetsregister',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Lagstiftning och regelverk',
        termer: [
          { term: 'PDL', forklaring: 'Patientdatalagen, reglerar journalföring inom hälso- och sjukvård.' },
          { term: 'HSL', forklaring: 'Hälso- och sjukvårdslagen, ramverk för all sjukvård i Sverige.' },
          { term: 'PSL', forklaring: 'Patientsäkerhetslagen, reglerar avvikelsehantering och anmälningsplikt.' },
          { term: 'Lex Maria', forklaring: 'Anmälningsskyldighet vid vårdskada eller risk för sådan.' },
          { term: 'OSL', forklaring: 'Offentlighets- och sekretesslagen, gäller offentlig sjukvård.' },
          { term: 'Förskrivningsrätt', forklaring: 'Fysioterapeuter har inte förskrivningsrätt på läkemedel men kan rekommendera hjälpmedel.' },
        ],
      },
      {
        kategori: 'Behandlingsmetoder',
        termer: [
          { term: 'OMT', forklaring: 'Ortopedisk Manuell Terapi, evidensbaserad metod för leder och muskler.' },
          { term: 'McKenzie', forklaring: 'Mekanisk diagnostik och behandling för ryggbesvär (MDT).' },
          { term: 'Mulligan', forklaring: 'Manuell behandlingsmetod med rörelse under kompression eller drag.' },
          { term: 'Maitland', forklaring: 'Klassisk OMT-metod för perifera leder och rygg.' },
          { term: 'MTT', forklaring: 'Medicinsk Tränings Terapi, strukturerad träningsmodell för rehabilitering.' },
          { term: 'Bassängträning', forklaring: 'Hydroterapi för rehabilitering vid bland annat ortopediska besvär.' },
        ],
      },
      {
        kategori: 'Specialistutbildningar',
        termer: [
          { term: 'Specialist OMT', forklaring: 'Specialistutbildning inom ortopedisk manuell terapi, magisterexamen.' },
          { term: 'Specialist Idrottsmedicin', forklaring: 'Specialistutbildning för fysioterapeuter inom idrottsskador och prestation.' },
          { term: 'Specialist Neurologi', forklaring: 'Specialistutbildning för rehabilitering vid neurologisk sjukdom.' },
          { term: 'Specialist Geriatrik', forklaring: 'Specialistutbildning för rehabilitering av äldre.' },
          { term: 'Specialist Andning', forklaring: 'Specialistutbildning för respiratorisk fysioterapi och andningsrehab.' },
          { term: 'Specialist Onkologi', forklaring: 'Specialistutbildning för rehabilitering vid och efter cancersjukdom.' },
        ],
      },
      {
        kategori: 'Journalsystem och verktyg',
        termer: [
          { term: 'TakeCare', forklaring: 'Journalsystem som används i bland annat Region Stockholm.' },
          { term: 'Cosmic', forklaring: 'Vanligaste journalsystemet i offentlig vård i flera regioner.' },
          { term: 'Medicus', forklaring: 'Journalsystem för privat sjukvård och mindre kliniker.' },
          { term: 'Carejourney', forklaring: 'Privat journalsystem populärt på fysioterapikliniker.' },
          { term: 'NPÖ', forklaring: 'Nationell patientöversikt över region- och vårdgränser.' },
          { term: 'Försäkringskassan SASSAM', forklaring: 'System för rehabintyg och ersättningsärenden.' },
        ],
      },
    ],

    typiskaArbetsgivare: [
      {
        kategori: 'Region och universitetssjukhus',
        exempel: [
          'Karolinska, Sahlgrenska, Skånes Universitetssjukhus, Akademiska',
          'Region- och länssjukhus i alla 21 regioner',
          'Specialistmottagningar och rehabkliniker',
          'Akutmottagningar med fysioterapeut i jour',
        ],
      },
      {
        kategori: 'Primärvård',
        exempel: [
          'Vårdcentraler i regional regi',
          'Privata vårdcentraler (Capio, Praktikertjänst)',
          'Företagshälsa (Avonova, Feelgood, Previa)',
          'Specialistmottagningar inom rygg, axel, idrottsmedicin',
        ],
      },
      {
        kategori: 'Privata fysioterapikliniker',
        exempel: [
          'Curera, Aleris Rehab, Capio Rehab',
          'Unisport och idrottsklinker',
          'Mindre privata praktiker och solopraktiker',
          'Hälsohem och behandlingscenter',
        ],
      },
      {
        kategori: 'Kommunal rehabilitering',
        exempel: [
          'Kommunal hemrehabilitering i 290 kommuner',
          'Korttidsboenden med rehabavdelning',
          'Demensvård med fysioterapeutisk del',
          'Habilitering för barn och vuxna med funktionsnedsättning',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Fysioterapeutprogrammet (3 år)',
        beskrivning: 'Kandidatexamen från Karolinska Institutet, Lunds universitet, Göteborgs universitet, Uppsala, Umeå, Linköping, Mälardalens högskola eller Luleå tekniska universitet. Examen ger rätt att söka legitimation från Socialstyrelsen.',
      },
      {
        rubrik: 'Magister- eller masterutbildning (1-2 år)',
        beskrivning: 'Specialistutbildning inom OMT, idrottsmedicin, neurologi, geriatrik, andning eller onkologi. Magisterexamen krävs för titeln "specialistfysioterapeut" som påverkar lön och tjänsteansvar.',
      },
      {
        rubrik: 'Vidareutbildningar och certifieringar',
        beskrivning: 'McKenzie-certifiering (MDT), Mulligan-cert, akupunkturutbildning, basal kroppskännedom. Korta certifikatkurser som ger meriterande spetskompetens.',
      },
      {
        rubrik: 'Forskarutbildning (4-5 år)',
        beskrivning: 'Doktorsexamen i fysioterapi parallellt med klinisk tjänst. Disputerade fysioterapeuter söker oftast universitetssjukhus, FoU-roller eller privatkliniker med forskningsfokus.',
      },
    ],

    kompetenser: {
      tekniska: [
        'Klinisk bedömning och funktionsanalys',
        'Manuell terapi och OMT',
        'McKenzie-metoden för ryggbehandling',
        'MTT (Medicinsk Tränings Terapi)',
        'Akupunktur enligt traditionell eller dry needling',
        'Lymfödembehandling och kompressionsbehandling',
        'Bassängträning och hydroterapi',
        'Journalsystem (TakeCare, Cosmic, Medicus)',
        'Skattningsskalor (NPRS, ROM, MMT, FBE)',
        'Försäkringsmedicin och rehabintyg',
        'Träning för specifika diagnoser (rygg, knä, höft, axel)',
        'Bedömning av äldres balans och fallrisk',
      ],
      personliga: [
        'Pedagogisk i patientutbildning',
        'Empatisk och relationsskapande',
        'Strukturerad i bedömning och behandling',
        'Tålmodig vid långsam progress',
        'Evidensbaserad i behandlingsval',
        'Tvärprofessionell samarbetsförmåga',
        'Lyhörd för patientens egna mål',
      ],
    },

    profilExempel:
      'Legitimerad fysioterapeut med 7 års erfarenhet inom ortopedisk slutenvård och primärvård. Specialistutbildning inom OMT 2023 med klinisk inriktning på rygg- och axelbesvär. Behandlar 30-35 patienter per vecka med fokus på evidensbaserad rehabilitering, McKenzie-metoden och MTT. Handledare för 4 fysioterapeutstudenter per termin.',

    profilTips:
      'Legitimation, år av erfarenhet och primärt verksamhetsområde i öppningsraden. Andra meningen lyfter specialistutbildning och behandlingsmetoder. Tredje meningen visar volym, forskning eller handledning som differentierar dig.',

    rekryterarTipsen: [
      {
        rubrik: 'Legitimation och specialistbevis',
        text: 'Skriv ut Socialstyrelsens registrering med datum. Specialistutbildning (OMT, idrottsmedicin, neurologi) lyfts i samma block. Verksamhetschefer skannar först efter behörighet.',
      },
      {
        rubrik: 'Behandlingsmetoder du behärskar',
        text: 'McKenzie-metoden, OMT, Mulligan, Maitland, akupunktur, MTT, basal kroppskännedom. Var konkret om vilka metoder du behärskar i stället för "manuella tekniker".',
      },
      {
        rubrik: 'Patientgrupper och volymer',
        text: '"30 patienter per dag på ortopedmottagning" säger mer än "klinisk fysioterapi". Konkreta volymer och patientgrupper visar din förmåga att leverera i svensk vårdvardag.',
      },
      {
        rubrik: 'Journalsystem och dokumentation',
        text: 'TakeCare, Cosmic, Medicus, Carejourney. Olika regioner och privata kliniker använder olika system. Skriv ut systemnamnen i klartext.',
      },
      {
        rubrik: 'Specialistområde och vidareutbildning',
        text: 'OMT, ortopedisk medicin, idrottsmedicin, neurologi, geriatrik. Specialistinriktning öppnar specifika tjänster och påverkar lönen. Lyft spetskompetens i sammanfattningen.',
      },
      {
        rubrik: 'Forskning och utvecklingsarbete',
        text: 'Eventuell licentiat eller doktorsexamen, publikationer, forskningsbidrag. Forskningsmeriter är centrala för universitetstjänster och seniora roller på regionalanknutna kliniker.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'Legitimation, år av erfarenhet, primärt verksamhetsområde och eventuell specialistutbildning på 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Klinik, ort, tidsperiod, patientgrupp. Konkretisera volym och eventuella specialiseringar (rygg, idrott, neuro).' },
      { sektion: 'Utbildning', tips: 'Fysioterapeutexamen, lärosäte, år. Specialistutbildningar som egen rad. Vidareutbildningar (McKenzie-cert, akupunktur).' },
      { sektion: 'Kompetenser', tips: 'Behandlingsmetoder, journalsystem, skattningsskalor. Var konkret om vilka metoder du behärskar.' },
      { sektion: 'Forskningsmeriter', tips: 'Publikationer i Vancouver-format, forskningsbidrag, eventuell disputation. Lyft i kronologisk ordning.' },
      { sektion: 'Övrigt', tips: 'Handledning, ledarskap, klinisk utveckling, eventuell egen praktik eller mottagning.' },
    ],

    checklista: [
      'Fysioterapeutexamen och legitimation från Socialstyrelsen',
      'Specialistutbildning eller magisterexamen om relevant',
      'Behandlingsmetoder (OMT, McKenzie, Mulligan, MTT)',
      'Patientgrupper du arbetat med',
      'Journalsystem du behärskar',
      'Skattningsskalor och bedömningsinstrument',
      'Eventuella vidareutbildningar med datum',
      'Handledarutbildning eller pedagogiska meriter',
      'Forskningsmeriter och publikationer',
      'Försäkringsmedicinsk erfarenhet',
    ],

    atsInfo:
      'Både vår mall Tidlös och premium-varianten Klinik är ATS-säkra. Region- och privata sjukhus använder oftast Heroma, Visma Recruit eller eRecruiter. Skriv ut behandlingsmetoder (OMT, McKenzie, Mulligan), specialistutbildningar och journalsystem (TakeCare, Cosmic) i klartext eftersom rekryterare filtrerar exakta termer från jobbannonsen.',

    faqItems: [
      {
        q: 'Vad ska finnas med i ett fysioterapeut-CV?',
        a: 'Legitimation från Socialstyrelsen med datum, fysioterapeutexamen med lärosäte, eventuell specialistutbildning, behandlingsmetoder du behärskar (OMT, McKenzie, Mulligan, MTT), patientgrupper, journalsystem (TakeCare, Cosmic), skattningsskalor, forskningsmeriter, samt eventuell handledarutbildning. Lägg till privatpraktik eller egen mottagning om relevant.',
      },
      {
        q: 'Hur skriver jag CV som nyutbildad fysioterapeut?',
        a: 'Lyft VFU-perioder med klinik, antal veckor och vilka patientgrupper du fick arbeta med. Examensarbete med titel och eventuell publicering. Praktiska kurser från utbildningen, skattningsskalor du använt, och behandlingsmetoder du tränat på. Många regioner har strukturerade introduktionsprogram för nyexade fysioterapeuter.',
      },
      {
        q: 'Hur viktigt är specialistutbildning?',
        a: 'Mycket. Specialistfysioterapeut är skyddad titel som kräver magisterexamen och kvalificerar för specialistmottagningar och seniora roller. OMT, idrottsmedicin och neurologi är de vanligaste specialiseringarna. Lön påverkas direkt av specialistgrad. Universitetssjukhus och regionalanknutna kliniker föredrar specialister.',
      },
      {
        q: 'Vilka behandlingsmetoder är värda att lyfta på CV:t?',
        a: 'McKenzie-metoden för ryggbehandling, OMT för leder och muskler, Mulligan, akupunktur (traditionell eller dry needling), MTT, basal kroppskännedom. Lyft de metoder du faktiskt använder dagligen och eventuella certifieringar. Olika kliniker söker olika metoder, så branschmatchning räknas.',
      },
      {
        q: 'Hur skiljer sig CV för offentlig och privat fysioterapi?',
        a: 'Offentlig sektor (region) värderar formell utbildning, specialistgrad, evidensbaserad praxis och eventuell forskning. Privat sektor värderar kommunikation, kundbemötande och förmåga att arbeta självständigt. Privatpraktik kräver också affärsmässig förmåga (fakturering, försäkringskontakter). Anpassa CV:t efter målgrupp.',
      },
      {
        q: 'Vilka journalsystem ska jag kunna 2026?',
        a: 'TakeCare dominerar Region Stockholm. Cosmic används i flera regioner. Medicus och Carejourney är vanliga på privata kliniker. NPÖ är gemensam patientöversikt. Skriv ut systemnamnen så Heroma och Visma Recruit kan filtrera fram dig.',
      },
      {
        q: 'Vilka nyckelord ska CV:t ha för att passera ATS?',
        a: 'Specifika behandlingsmetoder (OMT, McKenzie, Mulligan, MTT), patientgrupper (ortopedi, neurologi, geriatrik, idrott), journalsystem (TakeCare, Cosmic, Medicus), specialistutbildningar och eventuell forskningsmeritering. Heroma och Visma Recruit söker exakta matchningar.',
      },
      {
        q: 'Hur lång ska ett fysioterapeut-CV vara?',
        a: 'Junior 0-3 år: 1-1,5 sidor. Specialistfysioterapeut: 1,5-2 sidor. Disputerad fysioterapeut: 2-3 sidor. Vården accepterar längre CV än andra branscher eftersom meritprofiler är centrala. Det viktigaste är att första sidan rymmer det starkaste innehållet.',
      },
      {
        q: 'Behöver jag personligt brev till fysioterapeut-tjänster?',
        a: 'Ja, för de flesta tjänster i Sverige. Använd brevet för att förklara varför just den klinik och beskriv en specifik patient eller behandlingsutmaning du löst. Beskriv din kliniska filosofi och vad du tar med dig. Håll till en sida på 300-400 ord.',
      },
      {
        q: 'Vad ska jag inte ha med på mitt fysioterapeut-CV?',
        a: 'Personnummer (bara födelseår), foto i offentlig sektor (riskerar diskriminering), patientuppgifter eller sekretessbelagda detaljer, generiska påståenden ("empatisk fysioterapeut") utan stöd, irrelevanta arbetslivserfarenheter äldre än 10-15 år, och hobbies som inte är vård-relevanta. Stavfel diskvalificerar direkt eftersom dokumentation är central i rollen.',
      },
    ],
  },

  'barnskotare': {
    seoIntro:
      'Som barnskötare arbetar du nära förskollärare i Sveriges 290 kommuner och tusentals fristående förskolor. Yrket har ständig efterfrågan, både för fast tjänst och vikariat, men rektorer slänger CV:n som inte tydligt visar erfarenhet, eventuell utbildning och tillgänglighet. Ett välskrivet CV avgör om du blir kallad till intervju på den förskola du faktiskt vill jobba på.\n\nVår mall för barnskötare lyfter eventuell barnskötarutbildning, åldersgrupper du arbetat med och språkkunskaper som första visuella element. Vi har strukturerat erfarenhetssektionen så att förskola, huvudman och åldersgrupp syns direkt med eventuella ansvarsområden. Det betyder att rektorer kan bedöma din matchning på fem sekunder.\n\nKonkret innehåll vi rekommenderar: barnskötarutbildning från gymnasium eller komvux, åldersgrupper du arbetat med (1-3 år, 3-5 år), erfarenhet av barn med särskilda behov (NPF, språkstöd), digital pedagogik (Tyra, Snitch, Pluttra), pedagogisk inriktning (Reggio Emilia, Montessori, traditionell), HLR-certifikat med utgångsdatum, basala hygienrutiner, samt språkkunskaper för flerspråkiga förskolor.\n\nNedan hittar du två CV-mallar designade för barnskötarrollen, ett färdigt CV-exempel att utgå från, och konkreta tips på vad rektorer i kommunal och fristående förskola faktiskt letar efter. Ladda ner mallen gratis och anpassa efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'Award',
        title: 'Barnskötarutbildning eller validering',
        description: 'Barn- och fritidsprogrammet eller motsvarande komvux-utbildning är meriterande men inte alltid krav. Validerad utländsk utbildning eller integrationsutbildning räknas också. Lyft formell utbildning med datum.',
      },
      {
        icon: 'CheckCircle',
        title: 'Åldersgrupper du arbetat med',
        description: '1-3 år (småbarn) kräver mycket fysisk omsorg. 3-5 år är mer pedagogiskt fokuserade. Specifik åldersgrupp visar din erfarenhet och rektorer matchar mot avdelningens behov.',
      },
      {
        icon: 'TrendingUp',
        title: 'Erfarenhet av särskilda behov',
        description: 'NPF (autism, ADHD), språkstöd för flerspråkiga barn, motorisk träning, TAKK eller bildstöd. Många förskolor har barn med särskilda behov och specifik kompetens är meriterande.',
      },
      {
        icon: 'FileText',
        title: 'Digital pedagogik',
        description: 'Tyra, Snitch, Pluttra. Digital dokumentation är standard i svensk förskola. Lärplattor i barngrupp blir vanligare. Skriv ut vilka system du använt så ATS kan filtrera fram dig.',
      },
      {
        icon: 'Briefcase',
        title: 'Pedagogisk inriktning',
        description: 'Reggio Emilia, Montessori, Waldorf, utomhuspedagogik (I Ur och Skur). Olika förskolor söker olika inriktningar. Lyft den du har djupast erfarenhet av.',
      },
      {
        icon: 'Target',
        title: 'Språkkunskaper är värdefullt',
        description: 'Många förskolor har flerspråkiga barn och vill ha personal som talar deras modersmål. Arabiska, persiska, somaliska, finska, polska är efterfrågade i många kommuner.',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'Erfarenhet och språk överst',
        description: 'Vår mall lyfter åldersgrupper, pedagogisk inriktning och språk i sidopanelen. Rektorer ser matchningen på fem sekunder utan att behöva scrolla genom hela CV:t.',
      },
      {
        title: 'Eget block för certifikat',
        description: 'HLR, basala hygienrutiner, eventuell AKK- eller TAKK-utbildning har egen rad med utgångsdatum. Visar formell kompetens utan att blanda med generisk text.',
      },
      {
        title: 'Pedagogisk erfarenhet per förskola',
        description: 'Mallen separerar förskolor, huvudman (kommunal eller fristående) och åldersgrupp. Du kan visa bredd över olika pedagogiska inriktningar utan att meriter konkurrerar.',
      },
      {
        title: 'Premium-mallen Pedagog med foto',
        description: 'I förskolan där relationer värderas, lägger Pedagog-mallen till foto och språkkunskaper. Skapar ett mer personligt intryck för rektorer som väljer mellan kvalificerade kandidater.',
      },
      {
        title: 'Salviegrön ton för pedagogisk identitet',
        description: 'Vi har valt dämpade salviegröna och navy-toner som signalerar lugn och pedagogisk medvetenhet. Dragna från Skolverkets visuella språk men anpassade för individuell ansökan.',
      },
      {
        title: 'Plats för utvecklingsuppdrag',
        description: 'Eventuella ansvarsområden (utomhuspedagogik, naturkunskap, språkutveckling, mentor) har egen rad. Visar att du tar ansvar bortom vardagsarbete.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Daglig omsorg och trygghet',
        punkter: [
          'Skapa trygg och utvecklande miljö för barn 1-5 år',
          'Stötta måltidssituationer, vila och toalettrutiner',
          'Hantera blöjbyten, påklädning och hygienrutiner',
          'Bygga trygga anknytningar med varje barn',
        ],
      },
      {
        rubrik: 'Pedagogisk verksamhet',
        punkter: [
          'Genomföra pedagogiska aktiviteter enligt Lpfö 18 i samverkan med förskollärare',
          'Använda lekens potential för lärande och språkutveckling',
          'Anpassa aktiviteter för olika åldrar och utvecklingsnivåer',
          'Implementera pedagogiska metoder (Reggio Emilia, naturpedagogik, skapande verksamhet)',
        ],
      },
      {
        rubrik: 'Kommunikation och dokumentation',
        punkter: [
          'Använda Tyra, Snitch eller Pluttra för pedagogisk dokumentation',
          'Genomföra hämtning och lämning med trygg kommunikation till vårdnadshavare',
          'Stötta barn med särskilda behov (NPF, språkstöd, AKK, bildstöd)',
          'Dokumentera barnens utveckling i samverkan med förskollärare',
        ],
      },
      {
        rubrik: 'Hälsa och säkerhet',
        punkter: [
          'Följa basala hygienrutiner och förebygga smitta',
          'Hantera akuta situationer enligt HLR och första hjälpen',
          'Identifiera tecken på sjukdom eller utvecklingsavvikelser',
          'Anmäla oro till socialtjänsten enligt anmälningsplikten (SoL 14:1)',
        ],
      },
      {
        rubrik: 'Kollegial samverkan',
        punkter: [
          'Delta i arbetslagsmöten och pedagogiska planeringar',
          'Stötta nya kollegor och vikarier under introduktion',
          'Bidra till systematiskt kvalitetsarbete (SKA)',
          'Delta i kompetensutveckling och förbättringsprojekt',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Lagstiftning och styrdokument',
        termer: [
          { term: 'Lpfö 18', forklaring: 'Läroplan för förskolan från 2018, grunden för all pedagogisk planering.' },
          { term: 'Skollagen', forklaring: 'Reglerar förskolans verksamhet, barnens rätt till stöd och rektors ansvar.' },
          { term: 'Barnkonventionen', forklaring: 'Sedan 2020 svensk lag, vägleder hela förskolans förhållningssätt.' },
          { term: 'Anmälningsplikt', forklaring: 'Skyldighet att anmäla oro för barn till socialtjänsten enligt SoL 14:1.' },
          { term: 'SKA', forklaring: 'Systematiskt kvalitetsarbete, krav enligt Skollagen för förskolor.' },
          { term: 'Likabehandlingsplan', forklaring: 'Krav enligt diskrimineringslagen, ska finnas på varje förskola.' },
        ],
      },
      {
        kategori: 'Pedagogiska metoder',
        termer: [
          { term: 'Reggio Emilia', forklaring: 'Italiensk pedagogik med fokus på barns kompetens och miljöns roll.' },
          { term: 'Montessori', forklaring: 'Pedagogik baserad på självständigt lärande med specialdesignat material.' },
          { term: 'Waldorf', forklaring: 'Pedagogik från Steiners filosofi med fokus på rytm och kreativitet.' },
          { term: 'Utomhuspedagogik', forklaring: 'Lärande genom natur och friluftsliv, vanligt i I Ur och Skur-förskolor.' },
          { term: 'TAKK', forklaring: 'Tecken som Alternativ och Kompletterande Kommunikation.' },
          { term: 'Bildstöd', forklaring: 'Visuella stödbilder för barn med språkstörning eller NPF.' },
        ],
      },
      {
        kategori: 'Roller och utbildning',
        termer: [
          { term: 'Barnskötare', forklaring: 'Yrkesutbildad personal som kompletterar förskollärare i barngruppen.' },
          { term: 'Förskollärare', forklaring: 'Akademiskt utbildad lärare med lärarlegitimation från Skolverket.' },
          { term: 'Specialpedagog', forklaring: 'Senior pedagogisk roll för arbete med barn i behov av särskilt stöd.' },
          { term: 'Förstelärare', forklaring: 'Senior pedagogisk roll med utvecklingsuppdrag och högre lön.' },
          { term: 'Barn- och fritidsprogrammet', forklaring: 'Gymnasieutbildning för barnskötare, fritidspedagog och stödassistenter.' },
          { term: 'Komvux barnskötare', forklaring: 'Vuxenutbildning med samma kursplan som gymnasieprogrammet.' },
        ],
      },
      {
        kategori: 'Digitala verktyg',
        termer: [
          { term: 'Tyra', forklaring: 'Vanligaste plattformen för pedagogisk dokumentation och föräldrakontakt.' },
          { term: 'Snitch', forklaring: 'Plattform för dokumentation, schema och kommunikation med vårdnadshavare.' },
          { term: 'Pluttra', forklaring: 'Digital plattform för förskolans dokumentation och föräldrakommunikation.' },
          { term: 'Skola24', forklaring: 'System för schemaläggning, frånvaro och administrativ hantering.' },
          { term: 'Lärlogg', forklaring: 'Pedagogisk dokumentation av barns lärande och utveckling.' },
          { term: 'Pedagogisk dokumentation', forklaring: 'Process för att synliggöra barns lärprocesser enligt Reggio Emilia.' },
        ],
      },
    ],

    typiskaArbetsgivare: [
      {
        kategori: 'Kommunal förskola',
        exempel: [
          'Stockholms stad, Göteborgs stad, Malmö stad',
          'Mindre och medelstora kommuner runt om i Sverige',
          'Förskolor med särskild inriktning (utomhus, kultur, idrott)',
          'Familjedaghem och pedagogisk omsorg',
        ],
      },
      {
        kategori: 'Fristående förskolekoncerner',
        exempel: [
          'Pysslingen, Inspira, Norlandia, Tellusbarn',
          'AcadeMedia, Atvexa, Vittra',
          'Kooperativ och föräldradrivna förskolor',
          'Religiösa friskolor och idéburna huvudmän',
        ],
      },
      {
        kategori: 'Pedagogiska inriktningar',
        exempel: [
          'Reggio Emilia-inspirerade förskolor',
          'Montessoriförskolor',
          'Waldorfförskolor (Steiner)',
          'I Ur och Skur (utomhuspedagogik)',
        ],
      },
      {
        kategori: 'Bemanning och vikariat',
        exempel: [
          'Bemanningsbolag (Lärarjobb, Vikariat.se)',
          'Adecco Education',
          'Lokala bemanningsföretag i kommuner',
          'Säsongsvikariat och timanställningar',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Direkt anställning utan formell utbildning',
        beskrivning: 'Många förskolor rekryterar utan formell barnskötarutbildning om du visar lyhördhet och tillgänglighet. Arbetsgivaren ger introduktion på 1-2 veckor och betalar HLR-utbildning efter provanställning.',
      },
      {
        rubrik: 'Barn- och fritidsprogrammet (3 år)',
        beskrivning: 'Gymnasieutbildning med inriktning pedagogiskt arbete. Innehåller praktikperioder på förskolor. Ger fast tjänst och högre lön än utan utbildning.',
      },
      {
        rubrik: 'Komvux barnskötare (1-2 år)',
        beskrivning: 'Vuxenutbildning med samma kursplan som gymnasieprogrammet. Vanlig väg för yrkesväxlare och nyanlända med utländsk pedagogisk bakgrund.',
      },
      {
        rubrik: 'Vidareutbildningar och kurser',
        beskrivning: 'TAKK-utbildning, NPF-kurs, motorisk träning, naturpedagogik. Korta kurser som ger meriterande spetskompetens utöver grundutbildning.',
      },
    ],

    kompetenser: {
      tekniska: [
        'Pedagogisk verksamhet enligt Lpfö 18',
        'Daglig omsorg av barn 1-5 år',
        'Hygien och basala hygienrutiner',
        'HLR och första hjälpen för barn',
        'Pedagogisk dokumentation (Tyra, Snitch, Pluttra)',
        'TAKK och bildstöd för kommunikation',
        'Skapande verksamhet (bild, musik, drama)',
        'Naturpedagogik och utomhusvistelse',
        'NPF-anpassning (autism, ADHD, språkstörning)',
        'Måltidsförberedelser och kost för barn',
        'Likabehandlingsarbete och anmälningsplikt',
        'Föräldrakommunikation via digital plattform',
      ],
      personliga: [
        'Tålmodig och lyhörd för barns behov',
        'Empatisk och relationsskapande',
        'Strukturerad i daglig rutin',
        'Lugn vid konflikter och kriser',
        'Pedagogisk i mötet med vårdnadshavare',
        'Kollegial och samverkansorienterad',
        'Kulturell kompetens',
      ],
    },

    profilExempel:
      'Erfaren barnskötare med 5 års erfarenhet från kommunal Reggio Emilia-inspirerad förskola. Arbetar med åldersgruppen 3-5 år med fokus på språkutveckling och utomhuspedagogik. Komvux barnskötare 2020, TAKK-utbildning och flerspråkig (svenska, arabiska, engelska). Tillgänglig för heltid inklusive eventuella vikariat.',

    profilTips:
      'År av erfarenhet, åldersgrupp och pedagogisk inriktning i öppningsraden. Andra meningen lyfter formell utbildning och eventuella specialiseringar (TAKK, NPF, språkstöd). Tredje meningen visar språk och tillgänglighet.',

    rekryterarTipsen: [
      {
        rubrik: 'Barnskötarutbildning eller validering',
        text: 'Barn- och fritidsprogrammet eller motsvarande komvux är meriterande men inte alltid krav. Validerad utländsk utbildning räknas också. Lyft formell utbildning med datum.',
      },
      {
        rubrik: 'Åldersgrupper du arbetat med',
        text: '1-3 år kräver mycket fysisk omsorg. 3-5 år är mer pedagogiskt fokuserade. Specifik åldersgrupp visar din erfarenhet och rektorer matchar mot avdelningens behov.',
      },
      {
        rubrik: 'Erfarenhet av särskilda behov',
        text: 'NPF, språkstöd, TAKK eller bildstöd. Många förskolor har barn med särskilda behov och specifik kompetens är meriterande och påverkar lönen.',
      },
      {
        rubrik: 'Digital pedagogik',
        text: 'Tyra, Snitch, Pluttra. Digital dokumentation är standard. Skriv ut vilka system du använt så ATS kan filtrera fram dig och rektor ser att du kan starta utan introduktion.',
      },
      {
        rubrik: 'Pedagogisk inriktning',
        text: 'Reggio Emilia, Montessori, Waldorf, utomhuspedagogik. Olika förskolor söker olika inriktningar. Lyft den du har djupast erfarenhet av i sammanfattningen.',
      },
      {
        rubrik: 'Språkkunskaper är värdefullt',
        text: 'Många förskolor har flerspråkiga barn. Arabiska, persiska, somaliska, finska, polska är efterfrågade. Lägg språk synligt med nivå.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'År av erfarenhet, åldersgrupp, pedagogisk inriktning och språk på 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Förskola, huvudman, tidsperiod, åldersgrupp. Konkretisera ansvarsområden och pedagogisk inriktning.' },
      { sektion: 'Utbildning', tips: 'Barn- och fritidsprogrammet, komvux, eller integrationsutbildning. Vidareutbildningar (TAKK, NPF, naturpedagogik).' },
      { sektion: 'Kompetenser', tips: 'Pedagogiska metoder, digitala verktyg, specialpedagogiska anpassningar. Skriv ut systemnamn (Tyra, Snitch).' },
      { sektion: 'Certifikat', tips: 'HLR, basala hygienrutiner, TAKK-utbildning, NPF-kurs. Skriv utgångsdatum för varje.' },
      { sektion: 'Övrigt', tips: 'Språkkunskaper utöver svenska, tillgänglighet, eventuell handledarutbildning eller mentorroller.' },
    ],

    checklista: [
      'Eventuell barnskötarutbildning eller validering',
      'Erfarenhet av specifika åldersgrupper',
      'HLR-certifikat med utgångsdatum',
      'Basala hygienrutiner',
      'Pedagogisk inriktning du arbetat efter',
      'Erfarenhet av barn med särskilda behov',
      'Digitala verktyg (Tyra, Snitch, Pluttra)',
      'Språkkunskaper utöver svenska',
      'Tillgänglighet för heltid eller vikariat',
      'Eventuella vidareutbildningar (TAKK, NPF)',
    ],

    atsInfo:
      'Både vår mall Norrsken och premium-varianten Pedagog är ATS-säkra. Kommunala förskolor använder oftast Visma Recruit, fristående koncerner använder Workday eller Teamtailor. Skriv ut "barnskötarutbildning" och "Lpfö 18" i klartext eftersom rekryterare filtrerar exakta termer. Pedagogisk inriktning (Reggio Emilia, Montessori) ska också skrivas ut.',

    faqItems: [
      {
        q: 'Vad är skillnaden mellan barnskötare och förskollärare?',
        a: 'Förskollärare har akademisk examen (3,5 år) och lärarlegitimation från Skolverket. Är ansvarig för pedagogisk planering och dokumentation. Barnskötare har gymnasieutbildning eller komvux och kompletterar förskolläraren i barngruppen. Ingen lärarlegitimation krävs men barnskötarutbildning är meriterande.',
      },
      {
        q: 'Vad ska finnas med i ett barnskötar-CV?',
        a: 'Eventuell barnskötarutbildning, åldersgrupper du arbetat med, pedagogisk inriktning, erfarenhet av barn med särskilda behov, digitala system du använt, HLR-certifikat med utgångsdatum, basala hygienrutiner, samt språkkunskaper. Lägg till vidareutbildningar (TAKK, NPF) om du har dem.',
      },
      {
        q: 'Behöver jag formell utbildning för att jobba som barnskötare?',
        a: 'Inte alltid. Många förskolor rekryterar utan formell barnskötarutbildning om du visar lyhördhet och tillgänglighet. Arbetsgivaren ger introduktion på 1-2 veckor. Däremot är barn- och fritidsprogrammet eller komvux meriterande och öppnar fler tjänster med högre lön och fast anställning.',
      },
      {
        q: 'Hur viktigt är pedagogisk inriktning?',
        a: 'Mycket. Reggio Emilia-förskolor söker barnskötare med Reggio-erfarenhet eller -intresse. Montessoriförskolor kräver ofta Montessori-utbildning. Traditionella kommunala förskolor är mer flexibla. Lyft din inriktning i sammanfattningen så rektorer direkt kan bedöma matchning.',
      },
      {
        q: 'Vilka digitala verktyg ska jag kunna 2026?',
        a: 'Tyra, Snitch och Pluttra är de tre vanligaste plattformarna för pedagogisk dokumentation och föräldrakontakt. Lärplattor (iPad) i barngrupp för digital läsning, fotodokumentation och pedagogiska appar. Skola24 för schema och frånvaro.',
      },
      {
        q: 'Hur visar jag erfarenhet av barn med särskilda behov?',
        a: 'Beskriv konkret typ av stöd (NPF, autism, ADHD, språkstörning, motorik) och hur du arbetat. "Anpassade verksamhet för 3 barn med autism med bildstöd och struktur" säger mer än "har erfarenhet av barn med särskilda behov". Inkludera samverkan med specialpedagog.',
      },
      {
        q: 'Vilka nyckelord ska CV:t ha för att passera ATS?',
        a: 'Specifika åldersgrupper (1-3 år, 3-5 år), pedagogiska metoder (Reggio Emilia, Montessori, utomhuspedagogik, TAKK), digitala system (Tyra, Snitch, Pluttra), eventuella specialiseringar (NPF, språkstöd) och språk. Visma Recruit och Workday söker exakta matchningar.',
      },
      {
        q: 'Hur lång ska ett barnskötar-CV vara?',
        a: 'En sida räcker för de flesta. Med 5+ års erfarenhet kan det bli 1,5 sidor. Det viktigaste är att utbildning, åldersgrupp och senaste tjänsten syns på första sidan utan att man behöver scrolla.',
      },
      {
        q: 'Behöver jag personligt brev till barnskötar-tjänster?',
        a: 'Ja, för de flesta tjänster i Sverige förväntas ett personligt brev. Använd brevet för att förklara varför just den förskola och beskriv en specifik situation där du visat din pedagogiska förmåga. Beskriv ett barn du hjälpt utvecklas eller hur du arbetat med en svår grupp. Håll till en sida på 250-350 ord.',
      },
      {
        q: 'Vad ska jag inte ha med på mitt barnskötar-CV?',
        a: 'Personnummer (bara födelseår), foto i offentlig sektor (riskerar diskriminering), namn på enskilda barn, sekretessbelagda detaljer, generiska påståenden ("snäll och tålmodig") utan stöd, irrelevanta arbetslivserfarenheter äldre än 10-15 år, och hobbies som inte är pedagogiskt relevanta. Stavfel signalerar slarv.',
      },
    ],
  },

  'elevassistent': {
    seoIntro:
      'Som elevassistent stöttar du elever med särskilda behov i grundskola, gymnasium eller särskola. Yrket har stor efterfrågan i Sveriges 290 kommuner och fristående skolor, men rektorer slänger CV:n som inte tydligt visar erfarenhet av specifika diagnoser eller pedagogiska metoder. Ett välskrivet CV avgör om du blir kallad till intervju på den skola du faktiskt vill jobba på.\n\nVår mall för elevassistenter lyfter erfarenhet av specifika diagnoser, pedagogiska metoder och tillgänglighet som första visuella element. Vi har strukturerat erfarenhetssektionen så att skola, åldersgrupp och elevprofil syns direkt med eventuella anpassningar du varit del av. Det betyder att rektorer och specialpedagoger kan bedöma din matchning på fem sekunder.\n\nKonkret innehåll vi rekommenderar: erfarenhet av specifika diagnoser (autism, ADHD, ADD, dyslexi, intellektuell funktionsnedsättning, språkstörning), pedagogiska metoder (lågaffektivt bemötande, TEACCH, bildstöd, AKK), åldersgrupper (lågstadium, mellanstadium, högstadium, gymnasium, särskola), eventuell utbildning (Barn- och fritidsprogrammet, integrationsutbildning, validering), HLR-certifikat, samt språkkunskaper för flerspråkiga elever.\n\nNedan hittar du två CV-mallar designade för elevassistentrollen, ett färdigt CV-exempel att utgå från, och konkreta tips på vad rektorer och specialpedagoger faktiskt letar efter. Ladda ner mallen gratis och anpassa efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'CheckCircle',
        title: 'Diagnoser du arbetat med',
        description: 'Autism, ADHD, ADD, dyslexi, intellektuell funktionsnedsättning, språkstörning, selektiv mutism, Tourettes syndrom. Var konkret om vilka diagnoser du arbetat med så rektor och specialpedagog ser om matchningen finns.',
      },
      {
        icon: 'Award',
        title: 'Pedagogiska metoder',
        description: 'Lågaffektivt bemötande, TEACCH, bildstöd, sociala berättelser, AKK, TAKK. Specifika metoder är meriterande och visar att du har strukturerad approach i stället för generell omsorg.',
      },
      {
        icon: 'TrendingUp',
        title: 'Åldersgrupp och stadium',
        description: 'Lågstadium kräver mycket struktur och rutiner. Högstadium och gymnasium kräver mer självständigt arbete. Särskola är specialiserad. Lyft åldersgrupp så rektor matchar mot tjänsten.',
      },
      {
        icon: 'FileText',
        title: 'Samverkan med specialpedagog',
        description: 'Elevassistenter arbetar nära specialpedagog och elevhälsoteam. Erfarenhet av åtgärdsprogram, IUP-anpassningar och uppföljningssamtal är meriterande för senior-tjänster.',
      },
      {
        icon: 'Briefcase',
        title: 'Utbildning eller validering',
        description: 'Barn- och fritidsprogrammet, komvux barn- och fritid, eller integrationsutbildning. Validerad utländsk utbildning räknas också. Lyft formell utbildning med datum och eventuell specialinriktning.',
      },
      {
        icon: 'Target',
        title: 'Språkkunskaper',
        description: 'Många elever har flerspråkig bakgrund. Arabiska, persiska, somaliska, polska, tigrinja är särskilt efterfrågade. Språk öppnar specifika tjänster och kan vara avgörande för specifika elever.',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'Diagnoser och metoder överst',
        description: 'Vår mall lyfter erfarenhet av specifika diagnoser och pedagogiska metoder i sidopanelen. Rektorer och specialpedagoger ser matchningen på fem sekunder utan att behöva scrolla.',
      },
      {
        title: 'Erfarenhet per skola och elevprofil',
        description: 'Mallen separerar skolor, åldersgrupp och elevprofil. Du kan visa bredd över olika diagnoser och stadium utan att meriter konkurrerar om samma yta.',
      },
      {
        title: 'Eget block för pedagogiska metoder',
        description: 'Lågaffektivt bemötande, TEACCH, bildstöd, AKK. Mallen lyfter metoder som eget block så rektorer letar specifikt efter metoder de redan använder på skolan.',
      },
      {
        title: 'Plats för samverkan med EHT',
        description: 'Mallen har dedikerade rader för samverkan med specialpedagog, kurator och elevhälsoteam. Visar att du tar ansvar bortom enskild eleven och kan arbeta strukturerat.',
      },
      {
        title: 'Premium-mallen Pedagog med foto',
        description: 'I skolan där relationer värderas, lägger Pedagog-mallen till foto och språkkunskaper. Skapar ett personligt intryck för rektorer som väljer mellan kvalificerade kandidater.',
      },
      {
        title: 'Salviegrön ton för pedagogisk identitet',
        description: 'Vi har valt dämpade salviegröna och navy-toner som signalerar lugn och pedagogisk medvetenhet. Inget i mallen drar fokus från meritbilden.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Stöd i undervisning',
        punkter: [
          'Stötta elev under lektioner enligt åtgärdsprogram eller IUP',
          'Anpassa material och uppgifter efter elevens kognitiva förmåga',
          'Använda bildstöd, AKK eller pedagogiska appar vid behov',
          'Förklara instruktioner och uppgifter på elevens nivå',
        ],
      },
      {
        rubrik: 'Beteendestöd och struktur',
        punkter: [
          'Tillämpa lågaffektivt bemötande vid utåtagerande beteende',
          'Skapa rutiner och struktur för elever med NPF',
          'Hantera kriser, utbrott och konflikter lugnt och professionellt',
          'Förebygga svåra situationer genom uppmärksamhet på tidiga signaler',
        ],
      },
      {
        rubrik: 'Kommunikation och anpassning',
        punkter: [
          'Använda TEACCH eller motsvarande visuell struktur',
          'Stötta elever med språkstörning eller selektiv mutism',
          'Tillämpa sociala berättelser och bildstöd vid förändringar',
          'Anpassa kommunikation efter elevens kognitiva och språkliga förmåga',
        ],
      },
      {
        rubrik: 'Praktiskt stöd och omsorg',
        punkter: [
          'Stötta vid måltider, raster och praktiska situationer',
          'Hjälpa till med toalettbesök eller hygien för yngre elever vid behov',
          'Säkerställa att eleven kommer i tid till lektioner och aktiviteter',
          'Följa med på utflykter och studiebesök',
        ],
      },
      {
        rubrik: 'Samverkan och dokumentation',
        punkter: [
          'Samverka med lärare, specialpedagog och kurator',
          'Delta i elevhälsomöten och åtgärdsprogramsuppföljningar',
          'Dokumentera elevens utveckling i Schoolsoft, Vklass eller Unikum',
          'Hantera kontakt med vårdnadshavare i samråd med klassföreståndare',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Diagnoser och funktionsvariationer',
        termer: [
          { term: 'Autism', forklaring: 'Autismspektrumtillstånd, brett spektrum med varierande behov.' },
          { term: 'ADHD/ADD', forklaring: 'Attention Deficit Hyperactivity Disorder, med eller utan hyperaktivitet.' },
          { term: 'Dyslexi', forklaring: 'Specifika läs- och skrivsvårigheter trots normal intelligens.' },
          { term: 'Språkstörning', forklaring: 'DLD - Developmental Language Disorder, försenad eller avvikande språkutveckling.' },
          { term: 'Intellektuell funktionsnedsättning', forklaring: 'Tidigare kallat utvecklingsstörning, varierar från lätt till grav.' },
          { term: 'Tourettes syndrom', forklaring: 'Neurologisk störning med tics och ofrivilliga rörelser eller ljud.' },
        ],
      },
      {
        kategori: 'Pedagogiska metoder',
        termer: [
          { term: 'Lågaffektivt bemötande', forklaring: 'Metod för att hantera utåtagerande beteende lugnt och professionellt.' },
          { term: 'TEACCH', forklaring: 'Strukturerad pedagogik för elever med autism, baserad på visuellt stöd.' },
          { term: 'Sociala berättelser', forklaring: 'Korta berättelser som förklarar sociala situationer för elever med autism.' },
          { term: 'AKK', forklaring: 'Alternativ och Kompletterande Kommunikation för elever som inte talar.' },
          { term: 'TAKK', forklaring: 'Tecken som Alternativ och Kompletterande Kommunikation.' },
          { term: 'Bildstöd', forklaring: 'Visuella stödbilder enligt PCS, Pictogram eller Widgit.' },
        ],
      },
      {
        kategori: 'Stöd och regelverk',
        termer: [
          { term: 'Åtgärdsprogram', forklaring: 'Plan för elever som riskerar att inte nå kunskapskraven.' },
          { term: 'IUP', forklaring: 'Individuell utvecklingsplan, dokumenteras 1-2 gånger per termin.' },
          { term: 'EHT', forklaring: 'Elevhälsoteam, samverkan mellan rektor, specialpedagog, kurator, skolsköterska.' },
          { term: 'Anpassningar', forklaring: 'Förändringar i undervisning för att stötta elev (extra tid, lugn miljö).' },
          { term: 'Särskilt stöd', forklaring: 'Mer omfattande stöd som kräver formellt åtgärdsprogram.' },
          { term: 'Kränkande särbehandling', forklaring: 'Krav på handlingsplan enligt diskrimineringslagen och Skollagen.' },
        ],
      },
      {
        kategori: 'Skolformer och digitala verktyg',
        termer: [
          { term: 'Grundskola', forklaring: 'Åk 1-9, krav på behörighet för lärare men inte för elevassistenter.' },
          { term: 'Gymnasium', forklaring: 'Frivilligt skolform efter grundskola, ofta med tillgång till elevassistent.' },
          { term: 'Anpassad grundskola', forklaring: 'Tidigare grundsärskolan, för elever med intellektuell funktionsnedsättning.' },
          { term: 'Schoolsoft', forklaring: 'Skoladministrativt system för dokumentation och föräldrakontakt.' },
          { term: 'Vklass', forklaring: 'Lärplattform för uppgifter, dokumentation och kommunikation.' },
          { term: 'Unikum', forklaring: 'Plattform för IUP, omdömen och elevdokumentation.' },
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
        kategori: 'Fristående skolor',
        exempel: [
          'Internationella Engelska Skolan (IES)',
          'Kunskapsskolan, Academedia, Pysslingen',
          'Waldorfskolor och Montessoriskolor',
          'Religiösa friskolor och idéburna huvudmän',
        ],
      },
      {
        kategori: 'Anpassad grundskola och gymnasium',
        exempel: [
          'Anpassad grundskola (tidigare grundsärskolan)',
          'Anpassat gymnasium',
          'Specialpedagogiska skolmyndigheten (SPSM)',
          'Behandlingshem och resursskolor',
        ],
      },
      {
        kategori: 'Bemanning och vikariat',
        exempel: [
          'Lärarjobb, Vikariat.se',
          'Adecco Education',
          'Lokala bemanningsföretag i kommuner',
          'Vikariat och timanställningar',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Direkt anställning utan formell utbildning',
        beskrivning: 'Många skolor rekryterar utan formell utbildning om du visar lyhördhet och tillgänglighet. Arbetsgivaren ger introduktion. Vanlig väg in för vikariat och säsongsuppdrag.',
      },
      {
        rubrik: 'Barn- och fritidsprogrammet (3 år)',
        beskrivning: 'Gymnasieutbildning med inriktning pedagogiskt arbete. Innehåller praktikperioder. Meriterande för fast tjänst och påverkar lönen.',
      },
      {
        rubrik: 'Komvux barn- och fritid (1-2 år)',
        beskrivning: 'Vuxenutbildning med samma kursplan som gymnasieprogrammet. Vanlig väg för yrkesväxlare och nyanlända.',
      },
      {
        rubrik: 'Vidareutbildningar',
        beskrivning: 'Lågaffektivt bemötande (LABU), TEACCH-utbildning, NPF-kurser, AKK-utbildning. Korta certifikatkurser som ger meriterande spetskompetens.',
      },
    ],

    kompetenser: {
      tekniska: [
        'Stöd vid undervisning enligt åtgärdsprogram',
        'Lågaffektivt bemötande och konflikthantering',
        'TEACCH och visuell struktur',
        'AKK, TAKK och bildstöd',
        'Sociala berättelser och pedagogiska anpassningar',
        'Samverkan med EHT och specialpedagog',
        'HLR och första hjälpen',
        'Dokumentation i Schoolsoft, Vklass eller Unikum',
        'Specifika diagnoser (autism, ADHD, dyslexi, språkstörning)',
        'Krishantering och förebyggande arbete',
        'Anpassning av material och uppgifter',
        'Stöd i sociala situationer',
      ],
      personliga: [
        'Tålmodig och lyhörd',
        'Lugn vid utbrott och kriser',
        'Strukturerad i daglig rutin',
        'Empatisk och relationsskapande',
        'Pedagogisk i anpassning',
        'Diskret och respektfull',
        'Lagspelare i EHT',
      ],
    },

    profilExempel:
      'Erfaren elevassistent med 4 års erfarenhet från resursskola och anpassad grundskola. Specialiserad på elever med autism och språkstörning på lågstadium med fokus på lågaffektivt bemötande, TEACCH och bildstöd. Komvux barn- och fritid 2021, LABU-utbildning och flerspråkig (svenska, arabiska). Tillgänglig för heltid inklusive eventuella vikariat.',

    profilTips:
      'År av erfarenhet, åldersgrupp och primär elevprofil i öppningsraden. Andra meningen lyfter pedagogiska metoder och eventuella specialiseringar. Tredje meningen visar utbildning, språk och tillgänglighet.',

    rekryterarTipsen: [
      {
        rubrik: 'Diagnoser du arbetat med',
        text: 'Autism, ADHD, dyslexi, språkstörning, intellektuell funktionsnedsättning. Var konkret om vilka diagnoser du arbetat med så rektor och specialpedagog ser om matchningen finns.',
      },
      {
        rubrik: 'Pedagogiska metoder',
        text: 'Lågaffektivt bemötande, TEACCH, bildstöd, sociala berättelser, AKK, TAKK. Specifika metoder är meriterande och visar att du har strukturerad approach.',
      },
      {
        rubrik: 'Åldersgrupp och stadium',
        text: 'Lågstadium kräver struktur. Högstadium och gymnasium kräver mer självständigt arbete. Anpassad grundskola är specialiserad. Lyft åldersgrupp så rektor matchar.',
      },
      {
        rubrik: 'Samverkan med specialpedagog',
        text: 'Erfarenhet av åtgärdsprogram, IUP-anpassningar och elevhälsomöten är meriterande för senior-tjänster. Visar att du arbetar strukturerat och inte bara reaktivt.',
      },
      {
        rubrik: 'Utbildning eller validering',
        text: 'Barn- och fritidsprogrammet, komvux eller integrationsutbildning. Validerad utländsk utbildning räknas också. Lyft formell utbildning med datum.',
      },
      {
        rubrik: 'Språkkunskaper',
        text: 'Många elever har flerspråkig bakgrund. Arabiska, persiska, somaliska, polska är efterfrågade. Språk kan vara avgörande för specifika elever.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'År av erfarenhet, åldersgrupp, elevprofil och pedagogiska metoder på 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Skola, åldersgrupp, elevprofil. Konkretisera diagnoser och pedagogiska metoder du använt.' },
      { sektion: 'Utbildning', tips: 'Barn- och fritidsprogrammet eller komvux. Vidareutbildningar (LABU, TEACCH, NPF, AKK).' },
      { sektion: 'Kompetenser', tips: 'Diagnoser, metoder, system. Var konkret om vilka anpassningar du behärskar.' },
      { sektion: 'Certifikat', tips: 'HLR, lågaffektivt bemötande, TEACCH-utbildning. Skriv utgångsdatum för varje.' },
      { sektion: 'Övrigt', tips: 'Språkkunskaper, tillgänglighet, eventuell handledarutbildning eller mentorroller.' },
    ],

    checklista: [
      'Eventuell utbildning (barn- och fritid, komvux)',
      'Erfarenhet av specifika diagnoser',
      'Pedagogiska metoder (LABU, TEACCH, AKK)',
      'Åldersgrupp och stadium',
      'Samverkan med specialpedagog och EHT',
      'HLR-certifikat med utgångsdatum',
      'Digitala system (Schoolsoft, Vklass, Unikum)',
      'Språkkunskaper utöver svenska',
      'Tillgänglighet för heltid eller vikariat',
      'Eventuella vidareutbildningar',
    ],

    atsInfo:
      'Både vår mall Norrsken och premium-varianten Pedagog är ATS-säkra. Kommunala skolor använder oftast Visma Recruit, fristående koncerner använder Workday eller Teamtailor. Skriv ut diagnoser (autism, ADHD), pedagogiska metoder (lågaffektivt bemötande, TEACCH) och digitala system (Schoolsoft) i klartext eftersom rekryterare filtrerar exakta termer.',

    faqItems: [
      {
        q: 'Vad ska finnas med i ett elevassistent-CV?',
        a: 'Erfarenhet av specifika diagnoser (autism, ADHD, språkstörning), pedagogiska metoder (LABU, TEACCH, bildstöd), åldersgrupper du arbetat med, eventuell utbildning (Barn- och fritid, komvux), HLR-certifikat, samverkan med specialpedagog och EHT, samt språkkunskaper. Lägg till vidareutbildningar om du har dem.',
      },
      {
        q: 'Behöver jag formell utbildning för att jobba som elevassistent?',
        a: 'Inte alltid. Många skolor rekryterar utan formell utbildning om du visar lyhördhet och tillgänglighet. Arbetsgivaren ger introduktion. Däremot är Barn- och fritidsprogrammet eller komvux meriterande och öppnar fler tjänster med högre lön.',
      },
      {
        q: 'Hur viktigt är erfarenhet av specifika diagnoser?',
        a: 'Mycket. Skolor söker oftast elevassistenter som har erfarenhet av specifik diagnos eftersom strategier och bemötande skiljer sig. Autism kräver TEACCH och visuell struktur. ADHD kräver pauser och kortare uppgifter. Lyft din erfarenhet av specifika diagnoser i sammanfattningen.',
      },
      {
        q: 'Vad är lågaffektivt bemötande?',
        a: 'LABU är en metod för att hantera utåtagerande beteende lugnt och professionellt. Utvecklad av Bo Hejlskov Elvén. Bygger på principen att ditt eget lugn är förebild för eleven. Standardmetod på resursskolor och anpassade verksamheter. Egen utbildning som kvalificerar för specifika tjänster.',
      },
      {
        q: 'Hur lyfter jag erfarenhet utan formell utbildning?',
        a: 'Beskriv konkreta situationer där du visat strukturerad approach: "Anpassade undervisning för 2 elever med autism med bildstöd och TEACCH, samverkan med specialpedagog veckovis". Konkreta åtgärder och resultat differentierar dig från andra kandidater.',
      },
      {
        q: 'Vilka digitala verktyg ska jag kunna 2026?',
        a: 'Schoolsoft, Vklass och Unikum är de tre vanligaste systemen. Pedagogiska appar (Skoldigistöd, Polyglutt, Widgit). Bildstödsapp (Pictogrammen). Skola24 för schema. Att vara öppen för AI-baserade verktyg blir allt viktigare.',
      },
      {
        q: 'Vilka nyckelord ska CV:t ha för att passera ATS?',
        a: 'Specifika diagnoser (autism, ADHD, dyslexi, språkstörning), pedagogiska metoder (LABU, TEACCH, AKK, bildstöd), åldersgrupper, system (Schoolsoft, Vklass, Unikum) och språk. Visma Recruit och Workday söker exakta matchningar.',
      },
      {
        q: 'Hur lång ska ett elevassistent-CV vara?',
        a: 'En sida räcker för de flesta. Med 5+ års erfarenhet och flera diagnoser kan det bli 1,5 sidor. Det viktiga är att utbildning, diagnoser du arbetat med och senaste tjänsten syns på första sidan utan att man behöver scrolla.',
      },
      {
        q: 'Behöver jag personligt brev till elevassistent-tjänster?',
        a: 'Ja, för de flesta tjänster i Sverige. Använd brevet för att förklara varför just den skola och beskriv en specifik elev eller situation där du visat din pedagogiska förmåga. Beskriv hur du hanterade en svår situation eller hjälpte en elev utvecklas. Håll till en sida på 250-350 ord.',
      },
      {
        q: 'Vad ska jag inte ha med på mitt CV?',
        a: 'Personnummer (bara födelseår), foto i offentlig sektor (riskerar diskriminering), namn på enskilda elever, sekretessbelagda detaljer från åtgärdsprogram, generiska påståenden ("snäll och tålmodig") utan konkreta exempel, irrelevanta arbetslivserfarenheter, och hobbies som inte är pedagogiskt relevanta.',
      },
    ],
  },

  // ============================================================================
  // EKONOMI
  // ============================================================================
  'redovisningsekonom': {
    seoIntro:
      'Som redovisningsekonom bedöms du på en kombination av regelverkskunskap, systemvana och bransch-erfarenhet. Redovisningsbyråer som PwC, EY, KPMG och Grant Thornton tillsammans med tusentals mindre byråer och industribolag har konstant öppna roller, men ekonomichefer slänger CV:n som inte tydligt visar K2/K3-vana och systemerfarenhet. Ett välskrivet CV avgör om du blir kallad till intervju på den byrå eller det bolag du faktiskt vill jobba på.\n\nVår mall för redovisningsekonomer lyfter regelverk (K2/K3, IFRS), redovisningssystem (Visma, Fortnox, SAP, Hogia) och eventuell auktorisation som första visuella element. Vi har strukturerat erfarenhetssektionen så att byrå eller bolag, kundvolym och bokslutsvana syns direkt. Det betyder att ekonomichefer kan bedöma din matchning på fem sekunder.\n\nKonkret innehåll vi rekommenderar: ekonomiexamen från högskola eller YH, eventuell auktorisation (auktoriserad redovisningskonsult via FAR, revisor via Revisorsinspektionen), redovisningssystem du behärskar (Visma Administration, Fortnox, BL Administration, SAP, Hogia), regelverk (K2, K3, IFRS), bokslutsvana med volym, skatte- och momskunskap, lönehantering, samt Excel-färdigheter på rätt nivå.\n\nNedan hittar du två CV-mallar designade för redovisningsekonom-rollen, ett färdigt CV-exempel att utgå från, och konkreta tips på vad ekonomichefer på redovisningsbyråer, industribolag och e-handel faktiskt letar efter. Ladda ner mallen gratis och anpassa efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'Award',
        title: 'Auktorisation och utbildning först',
        description: 'Auktoriserad redovisningskonsult (FAR), godkänd revisor eller magister i redovisning. Skriv ut titeln exakt eftersom det är högsta meriteringen i branschen. Auktorisationen ger högre lön och kvalificerar för fler tjänster.',
      },
      {
        icon: 'TrendingUp',
        title: 'Bokslutsvolym i klartext',
        description: '"Hanterar 25 kunders bokslut enligt K2/K3 årligen" säger mer än "ansvarig för bokslut". Kvantifiera antal kunder eller bolag, omsättningsnivå och regelverk. Konkreta volymer skiljer ut dig bland generiska CV.',
      },
      {
        icon: 'CheckCircle',
        title: 'Redovisningssystem i klartext',
        description: 'Visma Administration dominerar småföretag och byråer. Fortnox vanligast på e-handel och scale-ups. SAP på industri. Hogia på lön. Skriv ut systemnamnen så ATS kan filtrera fram dig.',
      },
      {
        icon: 'FileText',
        title: 'Regelverk och specialiseringar',
        description: 'K2 för småföretag, K3 för medelstora, IFRS för noterade. Moms (inkl EU-moms), arbetsgivaravgifter, koncernredovisning. Specialisering inom branscher (e-handel, fastighetsbolag, tjänsteföretag) väger tungt.',
      },
      {
        icon: 'Briefcase',
        title: 'Bransch-erfarenhet är hård valuta',
        description: 'En redovisningsekonom som arbetat med tjänsteföretag är inte samma som en som arbetat med industri eller bygg. Lyft branschen i din titel eller sammanfattning. K3-bolag, fastighet, koncernredovisning är specialiseringar.',
      },
      {
        icon: 'Target',
        title: 'Excel och digital kompetens',
        description: 'Avancerad Excel (PivotTable, VLOOKUP, makron, Power Query) är förmodat. Power BI eller Tableau för rapportering är meriterande. Vana med digitala lösningar (Klippan, Bokio, Visma eEkonomi) blir allt viktigare 2026.',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'Auktorisation och regelverk överst',
        description: 'Vår mall Konto har dedikerad sidopanel för auktorisation, regelverk och systemvana. Ekonomichefer ser dina meriter på fem sekunder utan att behöva scrolla genom löpande text.',
      },
      {
        title: 'Tabellär layout med tabular-nums',
        description: 'Vi använder tabular-nums för att siffror och datum stämmer exakt. Bokslutsvolym, omsättning och kundantal lyfts visuellt utan att rymma i löpande prosa.',
      },
      {
        title: 'Eget block för system och certifieringar',
        description: 'Visma, Fortnox, SAP, Hogia. Mallen separerar systemen från generiska kompetenser så ekonomichefer letar specifikt efter system de redan kör i sin organisation.',
      },
      {
        title: 'Mörkblå navy signalerar finans',
        description: 'Vi har valt #1e3a8a som signalerar bank, finans och seriositet. Ingen distraherande design som drar fokus från siffrorna och regelverken.',
      },
      {
        title: 'Premium-mallen Konto Plus med snabbfakta',
        description: 'För senior-roller (controller, redovisningschef) lägger Konto Plus till tre-kolumns header med snabbfakta-rad och navy-emerald gradient. Skapar en mer professionell first impression.',
      },
      {
        title: 'Plats för bransch-specialisering',
        description: 'Mallen har dedikerade rader för branschvana (e-handel, industri, fastighet, tjänsteföretag) och regelverk-fördjupning (K3, IFRS). Visar djup utan att blanda med generisk kompetens.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Löpande bokföring och avstämning',
        punkter: [
          'Kontera leverantörsfakturor, kundfakturor och bankhändelser',
          'Genomföra månads-, kvartal- och årsavstämningar enligt schema',
          'Hantera utlägg, representation och milersättning',
          'Avstämma bank, kassa, kund- och leverantörsreskontra',
        ],
      },
      {
        rubrik: 'Bokslut och årsredovisning',
        punkter: [
          'Genomföra delårs- och årsbokslut enligt K2 eller K3',
          'Skriva årsredovisning inklusive förvaltningsberättelse och noter',
          'Hantera periodiseringar, avskrivningar och nedskrivningar',
          'Samverka med revisor inför granskning och årsredovisning',
        ],
      },
      {
        rubrik: 'Skatt, moms och deklarationer',
        punkter: [
          'Beräkna och deklarera moms månadsvis eller kvartalsvis',
          'Hantera arbetsgivardeklarationer och skattekontoavstämning',
          'Upprätta inkomstdeklaration (INK2, INK3, INK4) för bolag',
          'Hantera EU-moms, omvänd skattskyldighet och periodisk sammanställning',
        ],
      },
      {
        rubrik: 'Lön och personalrelaterat',
        punkter: [
          'Köra lön enligt kollektivavtal eller tjänstemannaregler',
          'Beräkna semester, sjuklön, förmåner och arbetsgivaravgifter',
          'Lämna AGI och kontrolluppgifter till Skatteverket',
          'Hantera utlägg, traktamenten och milersättning enligt regelverk',
        ],
      },
      {
        rubrik: 'Rådgivning och rapportering',
        punkter: [
          'Ta fram månadsrapporter, prognoser och budgetuppföljning',
          'Rådgiva företagsledning kring skatter, periodiseringar och risker',
          'Stötta inför ägarskifte, fusion eller verksamhetsförsäljning',
          'Bidra till digitalisering och processförbättring i redovisning',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Regelverk och redovisningsstandarder',
        termer: [
          { term: 'K2', forklaring: 'Förenklat regelverk för mindre aktiebolag, max 3 av 4 gränsvärden överskrids ej.' },
          { term: 'K3', forklaring: 'Huvudregelverk för medelstora och större aktiebolag, mer detaljerade noter.' },
          { term: 'IFRS', forklaring: 'Internationell redovisningsstandard för börsnoterade och vissa större bolag.' },
          { term: 'BFL', forklaring: 'Bokföringslagen, grundlag för all bokföring och arkivering.' },
          { term: 'ÅRL', forklaring: 'Årsredovisningslagen, reglerar årsredovisningens innehåll och form.' },
          { term: 'BFN', forklaring: 'Bokföringsnämnden, utfärdar K2, K3 och övriga föreskrifter.' },
        ],
      },
      {
        kategori: 'Skatter och deklarationer',
        termer: [
          { term: 'Moms', forklaring: 'Mervärdesskatt, deklareras månads-, kvartals- eller årsvis beroende på omsättning.' },
          { term: 'INK2', forklaring: 'Inkomstdeklaration för aktiebolag och ekonomiska föreningar.' },
          { term: 'INK3', forklaring: 'Inkomstdeklaration för stiftelser, ideella föreningar.' },
          { term: 'INK4', forklaring: 'Inkomstdeklaration för handelsbolag och kommanditbolag.' },
          { term: 'AGI', forklaring: 'Arbetsgivardeklaration på individnivå, månadsvis till Skatteverket.' },
          { term: 'EU-moms', forklaring: 'Moms vid handel inom EU, kräver periodisk sammanställning och VIES-koll.' },
        ],
      },
      {
        kategori: 'Redovisningssystem',
        termer: [
          { term: 'Visma Administration', forklaring: 'Marknadsledande affärssystem för småföretag och byråer.' },
          { term: 'Fortnox', forklaring: 'Molnbaserat affärssystem populärt på e-handel och scale-ups.' },
          { term: 'BL Administration', forklaring: 'Affärssystem från Björn Lundén för småföretag och redovisningsbyråer.' },
          { term: 'SAP S/4HANA', forklaring: 'Enterprise-system som dominerar industri och stora bolag.' },
          { term: 'Hogia Lön', forklaring: 'Lönesystem som dominerar svensk lönehantering.' },
          { term: 'Aaro', forklaring: 'Konsolidieringssystem för koncernredovisning enligt IFRS.' },
        ],
      },
      {
        kategori: 'Roller och titlar',
        termer: [
          { term: 'Redovisningsekonom', forklaring: 'Allmän roll med löpande bokföring, bokslut och deklarationer.' },
          { term: 'Auktoriserad redovisningskonsult', forklaring: 'FAR-auktoriserad redovisningskonsult med högsta meritering inom redovisning.' },
          { term: 'Godkänd revisor', forklaring: 'Statligt auktoriserad revisor via Revisorsinspektionen.' },
          { term: 'Auktoriserad revisor', forklaring: 'Senior revisor med behörighet att granska börsbolag.' },
          { term: 'Controller', forklaring: 'Internekonom som fokuserar på rapportering, prognos och styrning.' },
          { term: 'Redovisningschef', forklaring: 'Senior chef över redovisningsfunktionen, ofta i ledningsgrupp.' },
        ],
      },
    ],

    typiskaArbetsgivare: [
      {
        kategori: 'Stora redovisningsbyråer',
        exempel: [
          'PwC, EY, KPMG, Deloitte, Grant Thornton',
          'BDO, Mazars, RSM, Forvis Mazars',
          'Tholin & Larsson, Fyrklöverns Redovisningsbyrå',
          'Mindre lokala byråer i Stockholm, Göteborg, Malmö',
        ],
      },
      {
        kategori: 'Industri och tillverkning',
        exempel: [
          'Volvo, Scania, ABB, Atlas Copco, Sandvik',
          'IKEA, Tetra Pak, Electrolux, AssaAbloy',
          'Ericsson och teleoperatörer (Telia, Tele2)',
          'Mindre tillverkningsbolag och underleverantörer',
        ],
      },
      {
        kategori: 'E-handel, scale-ups och tech',
        exempel: [
          'Klarna, Spotify, Storytel, Tink, Voi',
          'Boozt, NA-KD, Apotea, NetOnNet',
          'Kry, Mathem, Foodora, Truecaller',
          'Mindre tech-bolag och startups',
        ],
      },
      {
        kategori: 'Offentlig sektor och fastighet',
        exempel: [
          'Statliga bolag (PostNord, SJ, Vattenfall)',
          'Kommuner och regioner',
          'Fastighetsbolag (Vasakronan, Akelius, Rikshem)',
          'Bostadsrättsföreningar och stiftelser',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Civilekonom eller ekonomi-kandidat (3-5 år)',
        beskrivning: 'Civilekonomprogrammet, ekonomi-kandidat eller magister i redovisning från Handelshögskolan, Lund, Uppsala, Linköping eller motsvarande. Vanlig grund för senior-roller och revisor-vägen.',
      },
      {
        rubrik: 'Yrkeshögskola redovisning (1-2 år)',
        beskrivning: 'YH-utbildningar som redovisningsekonom, lönespecialist eller controller. Snabbare väg in i yrket och vanlig på byråer och mindre bolag som värderar praktisk vana.',
      },
      {
        rubrik: 'Auktoriserad redovisningskonsult (FAR)',
        beskrivning: 'Vidareutbildning till auktoriserad redovisningskonsult via FAR. Kräver minst tre års praktisk erfarenhet och flera kurser. Ger högre lön och kvalificerar för rådgivningsuppdrag.',
      },
      {
        rubrik: 'Revisorexamen (5-7 år total)',
        beskrivning: 'Civilekonom plus tre års praktik plus revisorexamen via Revisorsinspektionen. Ger godkänd eller auktoriserad revisor och möjlighet att granska aktiebolag.',
      },
    ],

    kompetenser: {
      tekniska: [
        'Bokslut enligt K2 och K3-regelverket',
        'Visma Administration, Fortnox, BL Administration',
        'SAP S/4HANA och Microsoft Dynamics',
        'Skatteberäkning (inkomstskatt, moms, arbetsgivaravgift)',
        'Avstämningar, periodiseringar och avskrivningar',
        'Inkomstdeklaration (INK2, INK3, INK4)',
        'Lönehantering (Hogia, Fortnox Lön, Visma Lön)',
        'EU-moms och omvänd skattskyldighet',
        'Excel (PivotTable, VLOOKUP, makron, Power Query)',
        'Power BI eller Tableau för rapportering',
        'Koncernredovisning och konsolidering',
        'IFRS för noterade bolag',
      ],
      personliga: [
        'Noggrann och strukturerad',
        'Analytisk i sifferarbete',
        'Sekretessmedveten',
        'Lugn vid bokslut och deadline',
        'Pedagogisk i kontakt med kunder',
        'Etisk medvetenhet vid revisionsfrågor',
        'Lyhörd för bransch-specifika behov',
      ],
    },

    profilExempel:
      'Auktoriserad redovisningskonsult (FAR) med 6 års erfarenhet från redovisningsbyrå och industribolag. Hanterar 25 kunders löpande bokföring och bokslut enligt K2 och K3 i Visma och Fortnox. Specialiserad på tjänsteföretag och e-handel med erfarenhet av valutahantering och periodisering.',

    profilTips:
      'Auktorisation eller examen, år av erfarenhet, primära branscher i öppningsraden. Andra meningen lyfter konkret kund- eller bokslutsvolym samt regelverk. Tredje meningen visar specialiseringar (K2, K3, IFRS, koncern, lön) som differentierar dig.',

    rekryterarTipsen: [
      {
        rubrik: 'Auktorisation och certifieringar avgör tjänsten',
        text: 'Vilka redovisningssystem behärskar du? Visma, Fortnox, BL Administration, SAP, Hogia. Auktoriserad redovisningskonsult (FAR) eller revisor via Revisorsinspektionen är CV-kritiska titlar. Skriv ut dem exakt.',
      },
      {
        rubrik: 'Bransch-erfarenhet är värt mer än titel',
        text: 'En redovisningsekonom som arbetat med tjänsteföretag är inte samma som en som arbetat med industri eller bygg. Lyft branschen i din titel. K3-bolag, fastighetsbolag, koncernredovisning är specialiseringar.',
      },
      {
        rubrik: 'Bokslutskompetens är hård valuta',
        text: 'Hur många bokslut har du gjort? K2 vs K3? Egen-skriven årsredovisning eller grundbokföring för revisor? Konkret omfattning gör skillnad: "30 bokslut per år för småföretag enligt K2" är tydligt.',
      },
      {
        rubrik: 'Specialisering inom skatt eller lön',
        text: 'Moms (särskilt EU-moms), koncernredovisning, lönehantering enligt kollektivavtal. Specialiseringar öppnar specifika tjänster och differentierar dig från generiska redovisningsekonomer.',
      },
      {
        rubrik: 'Excel- och digitalkompetens',
        text: 'Avancerad Excel (PivotTable, VLOOKUP, makron, Power Query) är förmodat. Power BI eller Tableau för rapportering är meriterande. Vana med digitala redovisningsverktyg blir allt viktigare 2026.',
      },
      {
        rubrik: 'Kundvolym och relationer',
        text: 'På byråer värderas kundvolym: "25 kunder med snittomsättning 5 MSEK". På bolag värderas bredd: "ansvar för 3 dotterbolag inom koncernen". Anpassa måtten efter målgruppen för din ansökan.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'Auktorisation, år av erfarenhet, primära branscher och system. Specialiseringar på 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Bolag, tidsperiod, ansvarsområden. Konkretisera kund- eller bolagsantal, omsättning, regelverk (K2/K3).' },
      { sektion: 'Utbildning', tips: 'Ekonomi- eller redovisningsutbildning med lärosäte. FAR-cert, vidareutbildningar (skatterätt, IFRS-kurs, lönerådgivning).' },
      { sektion: 'Kompetenser', tips: 'System, regelverk, specialområden (moms, lön, koncern, IFRS). Excel-färdigheter på rätt nivå.' },
      { sektion: 'Auktorisation', tips: 'Eget block om du är auktoriserad redovisningskonsult eller revisor. Datum för auktorisation och eventuell specialisering.' },
      { sektion: 'Övrigt', tips: 'Branschvana och eventuella ledarskapsuppdrag. Kompetensutveckling visar engagemang och uppdaterad kunskap.' },
    ],

    checklista: [
      'Ekonomi- eller redovisningsutbildning från högskola eller YH',
      'FAR-cert eller liknande auktorisation',
      'Erfarenhet av specifika redovisningssystem',
      'Bokslutsvana med volym och regelverk (K2/K3)',
      'Skatte- och momskunskap',
      'Lönehantering om relevant',
      'Excel- och rapporteringsfärdigheter',
      'Bransch-erfarenhet (tjänsteföretag, industri, e-handel)',
      'Eventuell IFRS- eller koncernerfarenhet',
      'Digital kompetens (Power BI, e-bokföring, automation)',
    ],

    atsInfo:
      'Både vår mall Konto och premium-varianten Konto Plus är ATS-säkra. Stora redovisningsbyråer som EY, PwC, KPMG och Grant Thornton använder Workday eller egna ATS. Använd exakta system-namn som "Fortnox", "Visma" och "SAP" istället för "redovisningssystem" eftersom de filtreras på. Auktorisation (FAR) ska skrivas i klartext.',

    faqItems: [
      {
        q: 'Vad ska finnas med i ett redovisningsekonom-CV?',
        a: 'Ekonomi- eller redovisningsutbildning, eventuell auktorisation (FAR eller revisor), redovisningssystem du behärskar (Visma, Fortnox, SAP, Hogia), regelverk (K2, K3, IFRS), bokslutsvolym och kundantal, skatte- och momskunskap, lönehantering om relevant, samt Excel- och digital kompetens. Lägg till bransch-erfarenhet och eventuella ledarroller om du söker senior-tjänster.',
      },
      {
        q: 'Behöver jag FAR-auktorisation för att jobba som redovisningsekonom?',
        a: 'Inte för junior- och mid-level-tjänster. Men för senior-roller och rådgivande tjänster är auktoriserad redovisningskonsult (FAR) eller revisor närmast krav. Auktorisationen ger högre lön (10-20% påslag), kvalificerar dig för fler tjänster och är ett krav för att kunna ha eget byråansvar.',
      },
      {
        q: 'Hur skriver jag CV som junior-redovisningsekonom utan praktisk erfarenhet?',
        a: 'Lyft examensarbete med specifik inriktning, eventuell praktik eller VFU på byrå, kurser i specifika system (Fortnox-certifikat, Visma-utbildning), och Excel-färdigheter med konkreta exempel. Många byråer har strukturerade introduktionsprogram för nyexade. Skriv ut din vilja att utvecklas och söka FAR-auktorisation efter tre års praktik.',
      },
      {
        q: 'Vilka redovisningssystem är viktigast att behärska?',
        a: 'För småföretag och byråer: Fortnox, Visma Administration, BL Administration. För industri och större bolag: SAP, Microsoft Dynamics, Hogia. För koncerner: Aaro eller IBM Cognos för konsolidering. Lista de du faktiskt behärskar med ungefärlig erfarenhet (år eller månader) och eventuella certifieringar.',
      },
      {
        q: 'Hur visar jag att jag är noggrann på CV:t?',
        a: 'Skriv inte "noggrann". Visa det. "0% felaktigheter i 30 K2-bokslut 2024", "Hanterade 25 kundavstämningar varje månad utan revisorsanmärkning", "Byggde Excel-mall som minskade avstämningstid med 40%". Konkreta resultat snarare än adjektiv differentierar ditt CV.',
      },
      {
        q: 'Hur lång ska ett redovisningsekonom-CV vara?',
        a: 'Junior 0-3 år: 1 sida. Mid-level: 1,5 sidor. Senior med auktorisation eller chef-roll: 2 sidor. Det viktiga är att utbildning, auktorisation och senaste erfarenhet syns på första sidan. Branschen värderar precision även i CV-format.',
      },
      {
        q: 'Vilka nyckelord ska CV:t ha för att passera ATS?',
        a: 'Specifika system (Fortnox, Visma, SAP, Hogia), regelverk (K2, K3, IFRS), processer (bokslut, deklaration, avstämning, periodisering), auktorisation (FAR, godkänd revisor), och bransch-erfarenhet. Workday och egna ATS söker exakta matchningar mot jobbannonsens språk.',
      },
      {
        q: 'Behöver jag personligt brev till redovisningstjänster?',
        a: 'Ja, för de flesta tjänster i Sverige. Använd brevet för att förklara varför just den byrå eller bolag och beskriv en specifik bokslutssituation eller utmaning du löst. Beskriv en kund du hjälpt eller ett system du implementerat. Håll till en sida på 300-400 ord. Branschen värderar tydlig kommunikation.',
      },
      {
        q: 'Hur visar jag bransch-erfarenhet utan att ha jobbat på byrå?',
        a: 'Lyft de bolag du arbetat på och deras bransch (industri, e-handel, fastighet). Beskriv specifika utmaningar: "K3-bokslut med 5 dotterbolag", "EU-moms för e-handel med 12 marknader", "Koncernredovisning enligt IFRS för noterat moderbolag". Konkreta erfarenheter från intern redovisning är ofta mer värdefulla än byråvana för bolag som söker kompetens internt.',
      },
      {
        q: 'Vad ska jag inte ha med på mitt redovisningsekonom-CV?',
        a: 'Personnummer (bara födelseår), exakta lönesiffror, irrelevanta arbetslivserfarenheter äldre än 10-15 år, generiska påståenden ("noggrann och driven") utan stöd, kund- eller bolagsspecifika sekretessbelagda detaljer, och hobbies som inte är ekonomi-relevanta. Stavfel och inkonsekvent formatering signalerar slarv, vilket är kritiskt i en bransch där precision räknas.',
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
    seoIntro:
      'Som handläggare i offentlig sektor jobbar du i en bransch där rättssäkerhet, lagstiftningskunskap och systemvana avgör mer än din personliga profil. Sveriges 290 kommuner, 21 regioner och statliga myndigheter har konstant öppna handläggartjänster, men enhetschefer slänger CV:n som inte tydligt visar lagstiftningsområde och systemerfarenhet. Ett välskrivet CV avgör om du blir kallad till intervju på den förvaltning du faktiskt vill jobba på.\n\nVår mall för handläggare lyfter examen, lagstiftningsområde (LSS, SoL, OSL, BBIC, IBIC) och ärendehanteringssystem som första visuella element. Vi har strukturerat erfarenhetssektionen så att förvaltning, ärendetyp och volym syns direkt med konkreta utredningsuppdrag. Det betyder att enhetschefer kan bedöma din matchning på fem sekunder.\n\nKonkret innehåll vi rekommenderar: examen (socionom, jurist, förvaltningsekonom, eller motsvarande), lagstiftning du arbetat efter (SoL, LSS, OSL, BBIC, IBIC, VAB, Förvaltningslagen), ärendehanteringssystem (Treserva, Procapita, Lifecare), utredningsmetodik (BBIC, IBIC, MI), ärendevolym och komplexitet, eventuella specialuppdrag (omprövningar, överklaganden, juridiska beslut), samt vidareutbildningar och certifikat.\n\nNedan hittar du två CV-mallar designade för handläggarrollen, ett färdigt CV-exempel att utgå från, och konkreta tips på vad enhetschefer i kommunal socialtjänst, statliga myndigheter och regional förvaltning faktiskt letar efter. Ladda ner mallen gratis och anpassa efter den tjänst du söker.',

    viktigtAttTankaPa: [
      {
        icon: 'Award',
        title: 'Examen och lagstiftningsområde först',
        description: 'Socionom för socialtjänst, jurist för rätts- och förvaltningstjänster, förvaltningsekonom för administrativa tjänster. Skriv ut examen och primärt lagstiftningsområde i rubriken. Det avgör om du ens kvalificerar för tjänsten.',
      },
      {
        icon: 'TrendingUp',
        title: 'Ärendevolym i klartext',
        description: '"35-40 LSS-ärenden parallellt" eller "150 utredningar per år" ger enhetschefen snabbt en bild av din kapacitet. Volym plus komplexitet differentierar dig från generiska handläggar-CV.',
      },
      {
        icon: 'CheckCircle',
        title: 'Lagstiftning du behärskar',
        description: 'SoL, LSS, OSL, BBIC, IBIC, Förvaltningslagen, Patientdatalagen. Var specifik om vilka paragrafer du arbetat efter. Olika kommuner och förvaltningar söker handläggare med exakt erfarenhet av specifik lagstiftning.',
      },
      {
        icon: 'FileText',
        title: 'Ärendehanteringssystem',
        description: 'Treserva dominerar i social- och äldreomsorg. Procapita används i flera kommuner. Lifecare används i vård- och omsorgsboenden. Skriv ut systemnamnen så ATS kan filtrera fram dig.',
      },
      {
        icon: 'Briefcase',
        title: 'Utredningsmetodik och process',
        description: 'BBIC för barnutredningar, IBIC för biståndsbedömning, MI för motiverande samtal. Beskriv vilka metoder du arbetar efter. Strukturerade utredningar enligt SOSFS-föreskrifterna är meriterande.',
      },
      {
        icon: 'Target',
        title: 'Specialuppdrag och rättssäkerhet',
        description: 'Omprövningar, överklaganden, samverkansmöten med andra myndigheter, juridiska beslut. Specialuppdrag visar djup och förmåga att hantera komplexa ärenden bortom standardflöde.',
      },
    ],

    varforVarMallPassar: [
      {
        title: 'Lagstiftning lyfts överst',
        description: 'Vår mall Myndighet har dedikerad sidopanel för lagstiftningsområde och utredningsmetodik. Enhetschefer ser dina behörigheter på fem sekunder utan att behöva scrolla.',
      },
      {
        title: 'Konservativ navy och svartvit',
        description: 'Offentlig sektor värderar saklighet. Vi har valt navy + svartvit grundpalett som signalerar formell prestige. Inga distraherande färger som drar fokus från ärendevolym och rättskunskap.',
      },
      {
        title: '§-symboler i bullets',
        description: 'Vi använder §-symboler i listpunkter för att påminna om förvaltningsrätten. Subtil designdetalj som signalerar att du förstår branschens visuella språk.',
      },
      {
        title: 'Premium-mallen Myndighet Plus med guld-accent',
        description: 'För senior-roller (enhetschef, förvaltningschef) lägger Myndighet Plus till centrerad serif-header och guld-accent-band. Skapar prestige-känsla utan att kompromissa med ATS-läsbarhet.',
      },
      {
        title: 'Plats för volymsstatistik',
        description: 'Mallen har dedikerade rader för ärendevolym, utredningar per år och eventuella beslutsantal. Konkreta siffror lyfts visuellt utan att blandas med löpande text.',
      },
      {
        title: 'Plats för specialuppdrag',
        description: 'Omprövningar, överklaganden, samverkansuppdrag har egen rad. Det visar att du tar ansvar bortom standardärenden, vilket meriterar för senior- och enhetschef-roller.',
      },
    ],

    arbetsuppgifter: [
      {
        rubrik: 'Utredning och bedömning',
        punkter: [
          'Genomföra utredningar enligt SoL, LSS, OSL eller motsvarande lagstiftning',
          'Bedöma rätt till insatser baserat på individuella behov och rättspraxis',
          'Skriva juridiskt korrekta utredningar enligt SOSFS 2014:5 eller motsvarande',
          'Hantera komplexa ärenden med samsjuklighet eller multipel problematik',
        ],
      },
      {
        rubrik: 'Beslutsfattande och dokumentation',
        punkter: [
          'Fatta myndighetsbeslut enligt Förvaltningslagen med korrekt motivering',
          'Dokumentera utredningar och beslut i Treserva, Procapita eller Lifecare',
          'Hantera diariehantering och GDPR-arbete enligt OSL och Patientdatalagen',
          'Kvalitetssäkra beslut för rättssäkerhet och uppföljningsbarhet',
        ],
      },
      {
        rubrik: 'Klientsamtal och möten',
        punkter: [
          'Genomföra utredningssamtal med brukare och anhöriga',
          'Leda vårdplaneringsmöten och samordnad individuell plan (SIP)',
          'Säkerställa brukarmedverkan och självbestämmanderätt',
          'Hantera klagomål och svåra samtalssituationer professionellt',
        ],
      },
      {
        rubrik: 'Samverkan och nätverk',
        punkter: [
          'Samverka med andra myndigheter (Försäkringskassan, Arbetsförmedlingen, Region)',
          'Kontakt med utförare, leverantörer och utredande verksamheter',
          'Delta i tvärprofessionella team och multidisciplinära möten',
          'Bidra till samordnad individuell plan vid flera huvudmän',
        ],
      },
      {
        rubrik: 'Juridisk handläggning',
        punkter: [
          'Hantera överklaganden och förbereda inför förvaltningsdomstol',
          'Genomföra omprövningar av tidigare beslut vid förändrade förutsättningar',
          'Tillämpa aktuell rättspraxis och förarbeten i komplexa ärenden',
          'Dokumentera avvikelser och anmäla enligt Lex Sarah eller Lex Maria',
        ],
      },
    ],

    branschtermer: [
      {
        kategori: 'Lagstiftning och regelverk',
        termer: [
          { term: 'SoL', forklaring: 'Socialtjänstlagen, ramverk för all kommunal socialtjänst.' },
          { term: 'LSS', forklaring: 'Lagen om stöd och service till vissa funktionshindrade.' },
          { term: 'OSL', forklaring: 'Offentlighets- och sekretesslagen, gäller all offentlig verksamhet.' },
          { term: 'FL', forklaring: 'Förvaltningslagen, reglerar myndighetsutövning och beslutsfattande.' },
          { term: 'PDL', forklaring: 'Patientdatalagen, gäller hälso- och sjukvård.' },
          { term: 'SOSFS 2014:5', forklaring: 'Socialstyrelsens föreskrifter om dokumentation i socialtjänst.' },
        ],
      },
      {
        kategori: 'Utredningsmetodik',
        termer: [
          { term: 'BBIC', forklaring: 'Barns Behov i Centrum, utredningsmodell för barn och unga.' },
          { term: 'IBIC', forklaring: 'Individens Behov i Centrum, behovsbedömning för vuxna och äldre.' },
          { term: 'MI', forklaring: 'Motiverande samtal, samtalsmetodik för förändringsarbete.' },
          { term: 'ASI', forklaring: 'Addiction Severity Index, bedömningsinstrument för missbruksvård.' },
          { term: 'FREDA', forklaring: 'Bedömningsinstrument för våld i nära relationer.' },
          { term: 'SAVRY', forklaring: 'Bedömning av risk för upprepat våld hos ungdomar.' },
        ],
      },
      {
        kategori: 'Ärendehanteringssystem',
        termer: [
          { term: 'Treserva', forklaring: 'Mest använda verksamhetssystem i kommunal social- och äldreomsorg.' },
          { term: 'Procapita', forklaring: 'Integrerat system för LSS, SoL och äldreomsorg.' },
          { term: 'Lifecare', forklaring: 'Omsorgsplaneringssystem i flera kommuner.' },
          { term: 'CombineLite', forklaring: 'Verksamhetssystem för socialtjänsten i några kommuner.' },
          { term: 'eArkiv', forklaring: 'Digitalt arkiv enligt arkivlagen.' },
          { term: 'eBlanketter', forklaring: 'Digitala formulär för ärendeinrapportering.' },
        ],
      },
      {
        kategori: 'Roller och insatser',
        termer: [
          { term: 'LSS-handläggare', forklaring: 'Bedömer rätt till LSS-insatser enligt §§ 9-10.' },
          { term: 'Biståndshandläggare', forklaring: 'Bedömer bistånd enligt SoL för vuxna och äldre.' },
          { term: 'Socialsekreterare', forklaring: 'Bredare roll inom socialtjänsten med utredning och beslut.' },
          { term: 'Familjehemssekreterare', forklaring: 'Specialiserad på familjehem och placeringar.' },
          { term: 'Försörjningsstöd-handläggare', forklaring: 'Hanterar ekonomiskt bistånd enligt SoL kapitel 4.' },
          { term: 'Lex Sarah-anmälan', forklaring: 'Anmälningsskyldighet vid missförhållanden i socialtjänst.' },
        ],
      },
    ],

    typiskaArbetsgivare: [
      {
        kategori: 'Kommunala förvaltningar',
        exempel: [
          'Socialförvaltningar i Sveriges 290 kommuner',
          'Stadsdelsförvaltningar i Stockholm, Göteborg, Malmö',
          'Äldre- och vård- och omsorgsförvaltningar',
          'Kommunala biståndsenheter och vuxenenheter',
        ],
      },
      {
        kategori: 'Specialiserade kommunala enheter',
        exempel: [
          'LSS-enheter och funktionsstöd-team',
          'Barn- och ungdomsenheter (BUE)',
          'Familjehem och socialjour',
          'Vuxenpsykiatri och missbruksvård',
        ],
      },
      {
        kategori: 'Statliga myndigheter',
        exempel: [
          'Försäkringskassan (assistansersättning, sjukpenning)',
          'Arbetsförmedlingen (matchningshandläggare)',
          'Migrationsverket (asyl- och uppehållsärenden)',
          'Inspektionen för vård och omsorg (IVO)',
        ],
      },
      {
        kategori: 'Regional förvaltning',
        exempel: [
          'Regionernas habilitering och hälsoval',
          'Skattekontorens beslutshandläggare',
          'Länsstyrelser och regional planering',
          'Domstolsverket och förvaltningsdomstolar',
        ],
      },
    ],

    utbildningsvagar: [
      {
        rubrik: 'Socionomprogrammet (3,5 år)',
        beskrivning: 'Vanligaste vägen till socialtjänst-handläggare. Innehåller juridik, samhällsvetenskap och praktik. Examen ger direkt behörighet till handläggartjänster inom kommunal socialtjänst.',
      },
      {
        rubrik: 'Juristexamen eller offentlig rätt (5 år)',
        beskrivning: 'Juristprogrammet eller magister i offentlig rätt från svenska lärosäten. Vanlig grund för handläggar-tjänster på myndigheter (Försäkringskassan, Skatteverket) och för juridiska beslutsroller.',
      },
      {
        rubrik: 'Beteendevetenskap eller socialt arbete (3 år)',
        beskrivning: 'Kandidatexamen i beteendevetenskap, sociologi eller socialt arbete. Alternativ väg in i handläggar-yrket, ofta med kompletterande kurser i juridik.',
      },
      {
        rubrik: 'Vidareutbildningar och certifieringar',
        beskrivning: 'BBIC-utbildning för barnärenden, IBIC för biståndsbedömning, MI-cert för samtal, fördjupningskurser i LSS eller förvaltningsrätt. Kontinuerlig fortbildning är meriterande för senior-roller.',
      },
    ],

    kompetenser: {
      tekniska: [
        'Förvaltningsrätt och offentlighetsprincipen (OSL)',
        'Lagstiftning per ärendetyp (LSS, SoL, BBIC, IBIC)',
        'Ärendehanteringssystem (Treserva, Procapita, Lifecare)',
        'Utredningsmetodik enligt SOSFS-föreskrifterna',
        'Beslutsmotiverande prosa enligt Förvaltningslagen',
        'Diariehantering och GDPR-arbete',
        'MI (Motiverande samtal) och ASI-bedömning',
        'BBIC-cert för barnärenden',
        'IBIC-utbildning för biståndsbedömning',
        'Statistikanalys och uppföljning av insatser',
        'Samordnad individuell plan (SIP)',
        'Avvikelsehantering enligt Lex Sarah',
      ],
      personliga: [
        'Saklig och neutralt språkbruk',
        'Strukturerad i ärendehantering',
        'Empatisk i klientmöten',
        'Sekretessmedveten',
        'Stresstålig vid hög ärendebelastning',
        'Etisk medvetenhet vid svåra avvägningar',
        'Pedagogisk i mötet med olika brukargrupper',
      ],
    },

    profilExempel:
      'Erfaren handläggare med 6 års erfarenhet från kommunal myndighet inom socialtjänst och äldreomsorg. Hanterar 35-40 aktiva ärenden parallellt enligt SoL och LSS i Treserva med fokus på korrekta beslut, motivering och uppföljning. Handledare för 3 nya kollegor och delaktig i kommunens utvecklingsprojekt kring digital ärendehantering.',

    profilTips:
      'År av erfarenhet, primärt lagstiftningsområde (SoL, LSS, BBIC) och förvaltning i öppningsraden. Andra meningen lyfter konkret ärendevolym och system. Tredje meningen visar specialuppdrag eller utvecklingsuppdrag som differentierar dig.',

    rekryterarTipsen: [
      {
        rubrik: 'Lagstiftningsområde är CV-avgörande',
        text: 'Vilken lagstiftning har du arbetat efter? SoL, LSS, OSL, BBIC, IBIC, VAB. Var specifik. Olika kommuner och förvaltningar söker handläggare med exakt erfarenhet av specifik lagstiftning.',
      },
      {
        rubrik: 'Ärendevolym och komplexitet',
        text: 'Hur många ärenden hanterar du parallellt? Är de standardiserade eller komplexa? Skriv "35-40 LSS-ärenden parallellt" istället för "ansvarat för ärendehandläggning". Volym plus komplexitet ger enhetschefen bild av din kapacitet.',
      },
      {
        rubrik: 'System och digitalisering',
        text: 'Treserva, Procapita, Lifecare. Vilket har du jobbat i? Hur länge? Eventuell erfarenhet av digitala utvecklingsprojekt eller GDPR-arbete är meriterande för seniora handläggare och chefroller.',
      },
      {
        rubrik: 'Utredningsmetodik som specialisering',
        text: 'BBIC för barnärenden, IBIC för biståndsbedömning, MI för motiverande samtal. Specialistutbildningar inom utredningsmetodik öppnar specifika tjänster och differentierar dig från generiska handläggare.',
      },
      {
        rubrik: 'Specialuppdrag och rättssäkerhet',
        text: 'Omprövningar, överklaganden, samverkansmöten, juridiska beslut. Specialuppdrag visar djup och förmåga att hantera komplexa ärenden bortom standardflöde. Lyft dem i sammanfattningen.',
      },
      {
        rubrik: 'Vidareutbildning och fortbildning',
        text: 'Förvaltningsrätt, fördjupningskurs LSS, NPF-utbildning, traumamedveten omsorg. Kontinuerlig fortbildning visar engagemang och uppdaterad kunskap, viktigt för senior-roller.',
      },
    ],

    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'År av erfarenhet, lagstiftningsområden, system och ärendetyper. Eventuella specialiseringar på 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Förvaltning, tidsperiod, ärendetyp och ärendevolym. Konkretisera komplexitet (BBIC-utredningar, omprövningar, överklaganden).' },
      { sektion: 'Utbildning', tips: 'Socionom, jurist eller förvaltningsexamen med lärosäte. Vidareutbildningar (BBIC-cert, IBIC, MI-kurs).' },
      { sektion: 'Kompetenser', tips: 'Lagstiftning, system, utredningsmetodik. Var konkret om vilka delar av FL, SoL eller LSS du arbetat efter.' },
      { sektion: 'Specialuppdrag', tips: 'Eget block för omprövningar, överklaganden, samverkansuppdrag, lex Sarah-utredningar. Visar djup bortom standardärenden.' },
      { sektion: 'Övrigt', tips: 'Språkkunskaper utöver svenska, eventuell handledarutbildning, tillgänglighet för olika kommuner eller verksamheter.' },
    ],

    checklista: [
      'Examen (socionom, jurist, förvaltning eller motsvarande)',
      'Specifik lagstiftning du arbetat efter (SoL, LSS, BBIC)',
      'Ärendehanteringssystem (Treserva, Procapita, Lifecare)',
      'Utredningsmetodik (BBIC, IBIC, MI, ASI)',
      'Volym och komplexitet på ärendetyper',
      'Eventuella specialuppdrag (omprövningar, överklaganden)',
      'Vidareutbildningar och certifikat',
      'Förvaltningsrätt och GDPR-arbete',
      'Ledar- eller handledaruppdrag',
      'Språkkunskaper utöver svenska',
    ],

    atsInfo:
      'Både vår mall Myndighet och premium-varianten Myndighet Plus är ATS-säkra. Kommunala arbetsgivare använder Visma Recruit eller egna system. Statliga myndigheter använder ofta Workday eller egna ATS. Lagrum (LSS, SoL, BBIC, IBIC) och systemnamn (Treserva, Procapita) är typiska sökord. Skriv ut dem exakt eftersom rekryterare filtrerar mot jobbannonsens språk.',

    faqItems: [
      {
        q: 'Vad ska finnas med i ett handläggar-CV?',
        a: 'Examen (socionom, jurist, förvaltning), lagstiftningsområde du arbetat efter (SoL, LSS, BBIC, IBIC), ärendehanteringssystem (Treserva, Procapita), utredningsmetodik (BBIC-cert, IBIC-utbildning, MI), ärendevolym och komplexitet, eventuella specialuppdrag (omprövningar, överklaganden), och vidareutbildningar. Lägg till handledar- eller ledarroller om du söker senior-tjänster.',
      },
      {
        q: 'Vilken examen krävs för handläggare?',
        a: 'Beror på förvaltning. Socionomexamen för socialtjänst-handläggare. Juridisk examen eller offentlig rätt-utbildning för juridiska handläggare. Förvaltningsutbildning eller annan akademisk examen för administrativa handläggare. Vissa myndigheter (Försäkringskassan, Migrationsverket) accepterar andra akademiska examina med kompletterande utbildning.',
      },
      {
        q: 'Hur skriver jag CV som junior-handläggare utan praktisk erfarenhet?',
        a: 'Lyft examensarbete med specifik inriktning, eventuell praktik eller volontärarbete inom socialtjänst, kurser i specifik lagstiftning, MI- eller BBIC-utbildning, och språkkunskaper. Praktiska kurser från utbildningen, tidigare arbete inom omsorg eller stöd, och ideella engagemang räknas. Många kommuner har strukturerade introduktionsprogram för nya handläggare.',
      },
      {
        q: 'Hur viktigt är specifik lagstiftningserfarenhet?',
        a: 'Kritiskt. Många handläggartjänster kräver exakt erfarenhet av specifik lagstiftning. En LSS-handläggare kan inte direkt gå in som BBIC-handläggare utan utbildning. Lyft alltid din lagstiftningsbakgrund i sammanfattningen. Kommuner och myndigheter söker oftast handläggare med matchande lagstiftningsdjup.',
      },
      {
        q: 'Ska jag nämna ärendevolym?',
        a: 'Ja om du har bra siffror. "35-40 LSS-ärenden parallellt" eller "150 utredningar per år" ger enhetschefen snabbt en bild av din kapacitet och stresstålighet. Konkreta volymer differentierar ditt CV från generiska påståenden.',
      },
      {
        q: 'Hur lång ska ett handläggar-CV vara?',
        a: 'Junior 0-3 år: 1 sida. Mid-level: 1,5 sidor. Senior eller specialist: 2 sidor max. Det viktiga är att examen, lagstiftningsområde och senaste erfarenhet syns på första sidan utan att man behöver scrolla.',
      },
      {
        q: 'Vilka nyckelord ska CV:t ha för att passera ATS?',
        a: 'Specifika lagar (SoL, LSS, OSL, BBIC, IBIC, FL, PDL), system (Treserva, Procapita, Lifecare), utredningsmetodik (BBIC-utbildning, IBIC-cert, MI), ärendetyper (biståndsbedömning, försörjningsstöd, LSS-insatser) och förvaltning (socialförvaltning, äldreförvaltning). Visma Recruit och Workday söker exakta matchningar mot jobbannonsens språk.',
      },
      {
        q: 'Behöver jag personligt brev till handläggar-tjänster?',
        a: 'Ja, för de flesta tjänster i Sverige. Använd brevet för att förklara varför just den förvaltning och beskriv en specifik utredningssituation eller komplex ärende du löst. Beskriv en brukare du hjälpt eller ett samverkansprojekt du varit del av. Håll till en sida på 300-400 ord. Branschen värderar tydlig skriftlig kommunikation.',
      },
      {
        q: 'Hur visar jag rättssäkerhetskunskap på CV:t?',
        a: 'Beskriv konkreta arbetsuppgifter där du tillämpat lagstiftning korrekt: "Hanterade 12 omprövningar enligt FL § 26 utan revisorsanmärkning", "Skrev beslutsmotivering enligt SOSFS 2014:5 i 200+ LSS-ärenden". Specifika paragrafer och föreskrifter signalerar djup och rättskunskap.',
      },
      {
        q: 'Vad ska jag inte ha med på mitt handläggar-CV?',
        a: 'Personnummer (bara födelseår), foto i offentlig sektor (kan leda till diskriminering), brukar- eller ärendespecifika sekretessbelagda detaljer, generiska påståenden ("driven och ansvarstagande") utan stöd, irrelevanta arbetslivserfarenheter äldre än 10-15 år, och hobbies som inte är relevanta. Stavfel diskvalificerar direkt eftersom skriftlig korrekthet är central i rollen.',
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

