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

