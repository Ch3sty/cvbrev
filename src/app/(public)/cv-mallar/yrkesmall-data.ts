/**
 * Data fOr yrkesmall-sidorna pa /cv-mallar/[yrke].
 *
 * Strukturen ar uppdelad i tva delar:
 * 1. RAW_YRKEN - lattare mappning (slug -> yrke + free-mall + premium-mall + nyckelord)
 * 2. YRKESMALL_LIST - utokad fran RAW med rik content per yrke (auto-genererad eller manuellt overskriven)
 *
 * For att undvika 7000+ rader manuell content per yrke, anvander vi:
 * - Branschspecifika templates fOr "Vad rekryterare letar efter", checklista, etc
 * - Mall-namn-baserade defaults dar yrket ingenting saerskilt har
 * - Manuella overskrivingar dar vi har specifik insikt (lakare, sjukskoterska, etc)
 */

export interface Yrkesmall {
  slug: string
  namn: string
  /** Visningsnamn i bestamd form for naturligt sprak ("CV-mall fOr lakare") */
  namnBestamd: string
  /** Kategori (vard, utbildning, service, teknik, ekonomi, offentlig-sektor) */
  kategori:
    | 'vard'
    | 'utbildning'
    | 'service'
    | 'teknik'
    | 'industri'
    | 'ekonomi'
    | 'logistik'
    | 'offentlig-sektor'
    | 'hantverk'
    | 'student'
  intro: string
  /** Hero-ingress (60-80 ord) for sidans h1-paragraf - unik per yrke */
  heroIngress?: string
  /** SEO-intro: 185-220 ord under hero (rik content for SEO) */
  seoIntro?: string
  /** ID for gratis-mallen (utan foto/LinkedIn) */
  freeMallId: string
  freeMallNamn: string
  /** ID for premium-mallen (med foto/LinkedIn) */
  premiumMallId: string
  premiumMallNamn: string
  /** "Varfor mallen ar bra" - 4-5 punkter, kan dela med andra yrken som har samma mall-pair */
  varforDennaMall: string[]
  /** "Vad rekryterare letar efter" - 3-6 unika tips per yrke */
  rekryterarTipsen: { rubrik: string; text: string }[]
  /** "Personlig profil" - kort exempel-text + tips */
  profilExempel: string
  profilTips: string
  /** "Kompetenser" - yrkesspecifika tekniska + personliga kompetenser */
  kompetenser: { tekniska: string[]; personliga: string[] }
  /** Yrkesspecifik checklista */
  checklista: string[]
  /** "Tips per sektion" - vad som ska sta under varje del av CV:t */
  sektionTips: { sektion: string; tips: string }[]
  /** ATS-info specifik for yrket */
  atsInfo: string
  /** Yrkes-specifika FAQ (3 idag, kan vara upp till 10) */
  faqItems: { q: string; a: string }[]

  // === NYA fOr djup SEO-content (Fas 1: 10 yrken har dessa, resten ar undefined) ===

  /** 6 punkter "Viktigt att tanka pa" - ikon + titel + 2-3 meningars rad */
  viktigtAttTankaPa?: {
    icon: 'FileText' | 'Target' | 'Award' | 'TrendingUp' | 'CheckCircle' | 'AlertCircle' | 'Briefcase' | 'GraduationCap'
    title: string
    description: string
  }[]
  /** 6 punkter "Varfor var mall passar yrket" - designresonemang per punkt */
  varforVarMallPassar?: { title: string; description: string }[]
  /** Vanliga arbetsuppgifter - 5 grupper med 3-4 underpunkter */
  arbetsuppgifter?: { rubrik: string; punkter: string[] }[]
  /** Branschterminologi - 4-6 grupper med termer + fOrklaringar (accordion) */
  branschtermer?: { kategori: string; termer: { term: string; forklaring: string }[] }[]
  /** Typiska arbetsgivare - 3-5 grupper */
  typiskaArbetsgivare?: { kategori: string; exempel: string[] }[]
  /** Utbildningsvagar - vilka examen/kurser leder till yrket */
  utbildningsvagar?: { rubrik: string; beskrivning: string }[]
}

/**
 * Mappning yrke -> { free, premium }-mallar.
 * En "primary source of truth" for vilka mallar varje yrke far.
 */
export const YRKE_TILL_MALLAR: Record<string, { free: string; premium: string }> = {
  // Vård (14)
  'lakare':                   { free: 'tidlos-formell', premium: 'klinik' },
  'specialistsjukskoterska':  { free: 'tidlos-formell', premium: 'klinik' },
  'barnmorska':               { free: 'tidlos-formell', premium: 'klinik' },
  'fysioterapeut':            { free: 'tidlos-formell', premium: 'klinik' },
  'sjukskoterska':            { free: 'norrsken',       premium: 'varden-omsorg' },
  'underskoterska':           { free: 'norrsken',       premium: 'varden-omsorg' },
  'vardbitrade':              { free: 'norrsken',       premium: 'varden-omsorg' },
  'hemtjanst':                { free: 'norrsken',       premium: 'varden-omsorg' },
  'hemtjanstpersonal':        { free: 'norrsken',       premium: 'varden-omsorg' },
  'personlig-assistent':      { free: 'norrsken',       premium: 'varden-omsorg' },
  'psykolog':                 { free: 'tidlos-formell', premium: 'klinik' },
  'kurator':                  { free: 'norrsken',       premium: 'pedagog' },
  'boendestod':               { free: 'norrsken',       premium: 'varden-omsorg' },
  'vardadministrator':        { free: 'konto',          premium: 'konto-plus' },

  // Utbildning (9)
  'forskollarare':            { free: 'norrsken',       premium: 'pedagog' },
  'larare':                   { free: 'norrsken',       premium: 'pedagog' },
  'grundskollarare':          { free: 'norrsken',       premium: 'pedagog' },
  'specialpedagog':           { free: 'norrsken',       premium: 'pedagog' },
  'barnskotare':              { free: 'norrsken',       premium: 'pedagog' },
  'elevassistent':            { free: 'norrsken',       premium: 'pedagog' },
  'fritidspedagog':           { free: 'norrsken',       premium: 'pedagog' },
  'fritidsledare':            { free: 'norrsken',       premium: 'pedagog' },
  'student':                  { free: 'student-startup', premium: 'student-plus' },

  // Service - butik/frontline (8) - Disk + Disk Plus
  'butiksbitrade':            { free: 'disk',           premium: 'disk-plus' },
  'butikssaljare':            { free: 'disk',           premium: 'disk-plus' },
  'butikschef':               { free: 'disk',           premium: 'disk-plus' },
  'kassorska':                { free: 'disk',           premium: 'disk-plus' },
  'kundtjanstmedarbetare':    { free: 'disk',           premium: 'disk-plus' },
  'kundtjanst':               { free: 'disk',           premium: 'disk-plus' },
  'hotellvard':               { free: 'disk',           premium: 'disk-plus' },
  'receptionist':             { free: 'disk',           premium: 'disk-plus' },
  'kundradgivare':            { free: 'norrsken',       premium: 'norrsken-plus' },

  // Service - lager/logistik (9) - Logistik + Logistik Plus
  'lagerarbetare':            { free: 'logistik',       premium: 'logistik-plus' },
  'truckforare':              { free: 'logistik',       premium: 'logistik-plus' },
  'logistiker':               { free: 'logistik',       premium: 'logistik-plus' },
  'lagerchef':                { free: 'logistik',       premium: 'logistik-plus' },
  'terminalarbetare':         { free: 'logistik',       premium: 'logistik-plus' },
  'logistikassistent':        { free: 'logistik',       premium: 'logistik-plus' },
  'fastighetsskotare':        { free: 'bygg',           premium: 'hantverkare-plus' },
  'servicemedarbetare':       { free: 'logistik',       premium: 'logistik-plus' },
  'lokalvardare':             { free: 'logistik',       premium: 'logistik-plus' },

  // Service - gastro (6)
  'kock':                     { free: 'stack-developer', premium: 'servering' },
  'bartender':                { free: 'stack-developer', premium: 'servering' },
  'konditor':                 { free: 'stack-developer', premium: 'servering' },
  'barista':                  { free: 'stack-developer', premium: 'servering' },
  'servitris-restaurangbitrade': { free: 'stack-developer', premium: 'servering' },
  'koksbitrade':              { free: 'stack-developer', premium: 'servering' },

  // Service - säljare/account (3)
  'saljare':                  { free: 'norrsken',       premium: 'aurora' },
  'account-manager':          { free: 'norrsken',       premium: 'aurora' },
  'sommarjobb':               { free: 'student-startup', premium: 'student-plus' },

  // Teknik - dev (3) - Stack + Stack Plus
  'systemutvecklare':         { free: 'stack-developer', premium: 'stack-plus' },
  'devops-engineer':          { free: 'stack-developer', premium: 'stack-plus' },
  'it-konsult':               { free: 'stack-developer', premium: 'stack-plus' },

  // Teknik - produkt/strategi (3)
  'projektledare-it':         { free: 'linje',          premium: 'aspekt' },
  'scrum-master':             { free: 'linje',          premium: 'aspekt' },
  'produktchef':              { free: 'linje',          premium: 'magasin' },

  // Teknik - industri (3) - Verkstad + Verkstad Plus
  'ingenjor':                 { free: 'verkstad',       premium: 'verkstad-plus' },
  'automationsingenior':      { free: 'verkstad',       premium: 'verkstad-plus' },
  'konstruktor':              { free: 'verkstad',       premium: 'verkstad-plus' },

  // Ekonomi (7) - Konto + Konto Plus
  'ekonomiassistent':         { free: 'konto',          premium: 'konto-plus' },
  'administrativ-assistent':  { free: 'konto',          premium: 'konto-plus' },
  'redovisningsekonom':       { free: 'konto',          premium: 'konto-plus' },
  'controller':               { free: 'konto',          premium: 'konto-plus' },
  'ekonom':                   { free: 'konto',          premium: 'konto-plus' },
  'hr-specialist':            { free: 'konto',          premium: 'konto-plus' },

  // Offentlig sektor (7) - Myndighet + Myndighet Plus
  'administrator':            { free: 'myndighet',      premium: 'myndighet-plus' },
  'handlaggare':              { free: 'myndighet',      premium: 'myndighet-plus' },
  'lss-handlaggare':          { free: 'myndighet',      premium: 'myndighet-plus' },
  'socialsekreterare':        { free: 'myndighet',      premium: 'myndighet-plus' },
  'kontorsassistent':         { free: 'myndighet',      premium: 'myndighet-plus' },
  'chef':                     { free: 'tidlos-formell', premium: 'tidlos-plus' },
  'enhetschef':               { free: 'tidlos-formell', premium: 'tidlos-plus' },
  'projektledare':            { free: 'norrsken',       premium: 'norrsken-plus' },
  'teamledare':               { free: 'norrsken',       premium: 'norrsken-plus' },
}

/** Lista over alla yrkesmall-slugs (anvands av sitemap, generateStaticParams etc) */
export const YRKESMALL_SLUGS = Object.keys(YRKE_TILL_MALLAR)

// ============================================================================
// Builder: kombinera mappning + content + GalleriYrke till komplett Yrkesmall
// ============================================================================

import { CV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'
import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'
import { YRKES_CONTENT, KATEGORI_DEFAULT_CONTENT, HERO_INGRESS, type YrkesContent } from './yrkesmall-content'

/** Bestamd-form-mappning fOr yrkesnamn (for naturligt sprak: "CV-mall fOr lakare") */
const NAMNBESTAMD_OVERRIDES: Record<string, string> = {
  'lakare': 'läkare',
  'specialistsjukskoterska': 'specialistsjuksköterska',
  'sjukskoterska': 'sjuksköterska',
  'underskoterska': 'undersköterska',
  'vardbitrade': 'vårdbiträde',
  'vardadministrator': 'vårdadministratör',
  'forskollarare': 'förskollärare',
  'larare': 'lärare',
  'grundskollarare': 'grundskollärare',
  'specialpedagog': 'specialpedagog',
  'barnskotare': 'barnskötare',
  'butiksbitrade': 'butiksbiträde',
  'butikssaljare': 'butikssäljare',
  'kundtjanstmedarbetare': 'kundtjänstmedarbetare',
  'lagerarbetare': 'lagerarbetare',
  'truckforare': 'truckförare',
  'lagerchef': 'lagerchef',
  'fastighetsskotare': 'fastighetsskötare',
  'lokalvardare': 'lokalvårdare',
  'saljare': 'säljare',
  'systemutvecklare': 'systemutvecklare',
  'ingenjor': 'ingenjör',
  'automationsingenior': 'automationsingenjör',
  'konstruktor': 'konstruktör',
  'redovisningsekonom': 'redovisningsekonom',
  'controller': 'controller',
  'ekonom': 'ekonom',
  'handlaggare': 'handläggare',
  'lss-handlaggare': 'LSS-handläggare',
  'socialsekreterare': 'socialsekreterare',
}

function getNamnBestamd(slug: string, namn: string): string {
  return NAMNBESTAMD_OVERRIDES[slug] || namn.toLowerCase()
}

function getMallNamn(mallId: string): string {
  const tpl = SIMPLE_TEMPLATES.find(t => t.id === mallId)
  return tpl?.name || mallId
}

function getDefaultRekryterarTips(namn: string, kategori: string): { rubrik: string; text: string }[] {
  return [
    {
      rubrik: 'Branschspecifika nyckelord avgör matchning',
      text: `Rekryterare i ${kategori === 'vard' ? 'vården' : kategori === 'utbildning' ? 'skolan' : kategori === 'teknik' ? 'tech-branschen' : 'din bransch'} söker exakta termer för verktyg, system och metoder. Skriv ut dem i klartext i kompetens-listan.`,
    },
    {
      rubrik: 'Konkreta resultat över passiva beskrivningar',
      text: `Skriv inte "ansvarade för..." utan "ledde 15-personers team som ökade kundnöjdheten från 78% till 91%". Konkreta siffror gör att din profil för ${namn.toLowerCase()} sticker ut i en bunt på 50 ansökningar.`,
    },
    {
      rubrik: 'Visa branschvana och specialisering',
      text: `Generella ${namn.toLowerCase()}-meriter är inte tillräckligt. Lyft din specialisering, branschen du arbetat i, och vad som differentierar dig från andra med samma titel.`,
    },
  ]
}

function buildYrkesContent(slug: string, namn: string, kategori: string): YrkesContent {
  const heroIngress = HERO_INGRESS[slug]
  const explicit = YRKES_CONTENT[slug]
  if (explicit) return { ...explicit, heroIngress: explicit.heroIngress || heroIngress }

  const kategoriDefault = KATEGORI_DEFAULT_CONTENT[kategori] || {}

  return {
    heroIngress,
    kompetenser: kategoriDefault.kompetenser || {
      tekniska: ['System och verktyg du behärskar', 'Branschspecifika metoder', 'Kvalitetsarbete'],
      personliga: ['Strukturerad', 'Lagspelare', 'Lyhörd för kundbehov'],
    },
    profilExempel: `Erfaren ${namn.toLowerCase()} med flera års erfarenhet inom branschen. Arbetar strukturerat och resultatinriktat med fokus på kvalitet och kundnöjdhet. Söker nya utmaningar i en organisation som värderar utveckling och kollegialt samarbete.`,
    profilTips: `Ange år av erfarenhet, primärt verksamhetsområde och din kärnkompetens i öppningsraden. Andra meningen ska innehålla en konkret resultat eller specialisering. Tredje meningen lyfter värderingar eller arbetssätt.`,
    rekryterarTipsen: getDefaultRekryterarTips(namn, kategori),
    sektionTips: [
      { sektion: 'Sammanfattning', tips: 'År av erfarenhet, bransch, kärnkompetens. 3-4 rader.' },
      { sektion: 'Erfarenhet', tips: 'Företag + roll + tidsperiod + dina kärnuppgifter. Konkreta resultat med siffror där möjligt.' },
      { sektion: 'Utbildning', tips: 'Examen + lärosäte. Vidareutbildningar och certifikat som är relevanta för rollen.' },
      { sektion: 'Kompetenser', tips: 'System, verktyg, metoder du behärskar. Skilj på tekniska och personliga.' },
    ],
    checklista: [
      'Examen eller relevant utbildning',
      'År av branscherfarenhet',
      'System och verktyg du behärskar',
      'Specialiseringar eller certifikat',
      'Konkreta resultat och prestationer',
      'Språkkunskaper',
    ],
    atsInfo: kategoriDefault.atsInfo || 'Båda mallarna är ATS-säkra och fungerar i de flesta rekryteringssystem som svenska arbetsgivare använder.',
    faqItems: [
      {
        q: `Hur långt ska ett ${namn.toLowerCase()}-CV vara?`,
        a: 'Mellan 1 och 2 sidor är standard. Junior-roller (0-3 års erfarenhet) ska hålla sig till 1 sida. Senior-roller med många meriter kan ha 2 sidor men inte mer. Rekryterare skannar fort, så håll varje rad relevant.',
      },
      {
        q: 'Behövs foto på CV:t?',
        a: 'Inte obligatoriskt i Sverige men vanligt. Premium-mallen har stöd för foto medan gratis-versionen är ren. Båda är ATS-säkra. Välj utifrån branschen — vissa branscher förväntar sig foto, andra ser det som onödigt.',
      },
      {
        q: 'Vilken är bäst av gratis och premium?',
        a: `Beror på dig. Gratis-mallen är ren, ATS-vänlig och funkar i de flesta rekryteringssituationer. Premium-mallen har plats för foto, LinkedIn och har visuellt rikare design som signalerar att du investerat i din ansökan. För roller där personlig branding är viktigt (sälj, kundkontakt, ledning) lutar premium mer.`,
      },
    ],
  }
}

function buildYrkesmallList(): Yrkesmall[] {
  return Object.entries(YRKE_TILL_MALLAR)
    .map(([slug, mallar]) => {
      const galleri = CV_GALLERI.find(y => y.slug === slug)
      if (!galleri) return null

      const content = buildYrkesContent(slug, galleri.namn, galleri.kategori)
      const freeMallNamn = getMallNamn(mallar.free)
      const premiumMallNamn = getMallNamn(mallar.premium)

      return {
        slug,
        namn: galleri.namn,
        namnBestamd: getNamnBestamd(slug, galleri.namn),
        kategori: galleri.kategori as Yrkesmall['kategori'],
        intro: galleri.intro,
        heroIngress: content.heroIngress,
        seoIntro: content.seoIntro,
        freeMallId: mallar.free,
        freeMallNamn,
        premiumMallId: mallar.premium,
        premiumMallNamn,
        viktigtAttTankaPa: content.viktigtAttTankaPa,
        varforVarMallPassar: content.varforVarMallPassar,
        arbetsuppgifter: content.arbetsuppgifter,
        branschtermer: content.branschtermer,
        typiskaArbetsgivare: content.typiskaArbetsgivare,
        utbildningsvagar: content.utbildningsvagar,
        varforDennaMall: [
          `${freeMallNamn}-mallen ger en ATS-säker baseline för ${galleri.namn.toLowerCase()} med tydlig struktur och rätt sektionsordning.`,
          `${premiumMallNamn}-varianten har plats för foto och LinkedIn, vilket lyfter personlig touch i ansökningar där det värderas.`,
          `Båda mallarna är optimerade för svenska arbetsgivare och passerar de vanligaste rekryteringssystemen som ${galleri.kategori === 'offentlig-sektor' ? 'Visma Recruit' : galleri.kategori === 'vard' ? 'Heroma och Visma Recruit' : 'Workday och Teamtailor'} använder.`,
          `Vi har anpassat sektionsordning och rubriker så att de matchar vad rekryterare i ${galleri.kategori === 'vard' ? 'vården' : galleri.kategori === 'utbildning' ? 'skolan' : galleri.kategori === 'teknik' ? 'tech-branschen' : galleri.kategori === 'ekonomi' ? 'ekonomi-branschen' : galleri.kategori === 'offentlig-sektor' ? 'offentlig sektor' : 'din bransch'} faktiskt letar efter.`,
        ],
        rekryterarTipsen: content.rekryterarTipsen,
        profilExempel: content.profilExempel,
        profilTips: content.profilTips,
        kompetenser: content.kompetenser,
        checklista: content.checklista,
        sektionTips: content.sektionTips,
        atsInfo: content.atsInfo,
        faqItems: content.faqItems,
      } as Yrkesmall
    })
    .filter((y): y is Yrkesmall => y !== null)
}

/** Komplett lista med alla 75 yrkesmallar (genererad från mappning + content) */
export const YRKESMALL_LIST: Yrkesmall[] = buildYrkesmallList()
