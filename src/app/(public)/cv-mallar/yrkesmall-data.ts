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
  'lakare':                   { free: 'linne',   premium: 'kalksten' },
  'specialistsjukskoterska':  { free: 'linne',   premium: 'kalksten' },
  'barnmorska':               { free: 'linne',   premium: 'kalksten' },
  'fysioterapeut':            { free: 'linne',   premium: 'kalksten' },
  'sjukskoterska':            { free: 'linne',   premium: 'kalksten' },
  'underskoterska':           { free: 'linne',   premium: 'kalksten' },
  'vardbitrade':              { free: 'linne',   premium: 'kalksten' },
  'hemtjanst':                { free: 'linne',   premium: 'kalksten' },
  'hemtjanstpersonal':        { free: 'linne',   premium: 'kalksten' },
  'personlig-assistent':      { free: 'linne',   premium: 'kalksten' },
  'psykolog':                 { free: 'linne',   premium: 'kalksten' },
  'kurator':                  { free: 'linne',   premium: 'kalksten' },
  'boendestod':               { free: 'linne',   premium: 'kalksten' },
  'vardadministrator':        { free: 'linne',   premium: 'arsring' },

  // Utbildning (9)
  'forskollarare':            { free: 'linne',   premium: 'kalksten' },
  'larare':                   { free: 'linne',   premium: 'kalksten' },
  'grundskollarare':          { free: 'linne',   premium: 'kalksten' },
  'specialpedagog':           { free: 'linne',   premium: 'kalksten' },
  'barnskotare':              { free: 'linne',   premium: 'kalksten' },
  'elevassistent':            { free: 'linne',   premium: 'kalksten' },
  'fritidspedagog':           { free: 'linne',   premium: 'kalksten' },
  'fritidsledare':            { free: 'linne',   premium: 'kalksten' },
  'student':                  { free: 'bjork',   premium: 'koppar' },

  // Service - butik/frontline (8)
  'butiksbitrade':            { free: 'linne',   premium: 'raster' },
  'butikssaljare':            { free: 'linne',   premium: 'raster' },
  'butikschef':               { free: 'linne',   premium: 'raster' },
  'kassorska':                { free: 'linne',   premium: 'raster' },
  'kundtjanstmedarbetare':    { free: 'linne',   premium: 'raster' },
  'kundtjanst':               { free: 'linne',   premium: 'raster' },
  'hotellvard':               { free: 'linne',   premium: 'raster' },
  'receptionist':             { free: 'linne',   premium: 'raster' },
  'kundradgivare':            { free: 'linne',   premium: 'koppar' },

  // Service - lager/logistik (9)
  'lagerarbetare':            { free: 'linne',   premium: 'granit' },
  'truckforare':              { free: 'linne',   premium: 'granit' },
  'logistiker':               { free: 'linne',   premium: 'granit' },
  'lagerchef':                { free: 'linne',   premium: 'granit' },
  'terminalarbetare':         { free: 'linne',   premium: 'granit' },
  'logistikassistent':        { free: 'linne',   premium: 'granit' },
  'fastighetsskotare':        { free: 'linne',   premium: 'fasad' },
  'servicemedarbetare':       { free: 'linne',   premium: 'granit' },
  'lokalvardare':             { free: 'linne',   premium: 'granit' },

  // Service - gastro (6)
  'kock':                     { free: 'linne',   premium: 'terrakotta' },
  'bartender':                { free: 'linne',   premium: 'terrakotta' },
  'konditor':                 { free: 'linne',   premium: 'terrakotta' },
  'barista':                  { free: 'linne',   premium: 'terrakotta' },
  'servitris-restaurangbitrade': { free: 'linne',   premium: 'terrakotta' },
  'koksbitrade':              { free: 'linne',   premium: 'terrakotta' },

  // Service - säljare/account (3)
  'saljare':                  { free: 'linne',   premium: 'koppar' },
  'account-manager':          { free: 'linne',   premium: 'koppar' },
  'sommarjobb':               { free: 'bjork',   premium: 'koppar' },

  // Teknik - dev (3)
  'systemutvecklare':         { free: 'linne',   premium: 'stal' },
  'devops-engineer':          { free: 'linne',   premium: 'stal' },
  'it-konsult':               { free: 'linne',   premium: 'stal' },

  // Teknik - produkt/strategi (3)
  'projektledare-it':         { free: 'linne',   premium: 'raster' },
  'scrum-master':             { free: 'linne',   premium: 'raster' },
  'produktchef':              { free: 'linne',   premium: 'tidning' },

  // Teknik - industri (3)
  'ingenjor':                 { free: 'linne',   premium: 'fasad' },
  'automationsingenior':      { free: 'linne',   premium: 'fasad' },
  'konstruktor':              { free: 'linne',   premium: 'fasad' },

  // Ekonomi (7)
  'ekonomiassistent':         { free: 'linne',   premium: 'arsring' },
  'administrativ-assistent':  { free: 'linne',   premium: 'arsring' },
  'redovisningsekonom':       { free: 'linne',   premium: 'arsring' },
  'controller':               { free: 'linne',   premium: 'arsring' },
  'ekonom':                   { free: 'linne',   premium: 'arsring' },
  'hr-specialist':            { free: 'linne',   premium: 'arsring' },

  // Offentlig sektor (7)
  'administrator':            { free: 'linne',   premium: 'antikva' },
  'handlaggare':              { free: 'linne',   premium: 'antikva' },
  'lss-handlaggare':          { free: 'linne',   premium: 'antikva' },
  'socialsekreterare':        { free: 'linne',   premium: 'antikva' },
  'kontorsassistent':         { free: 'linne',   premium: 'antikva' },
  'chef':                     { free: 'linne',   premium: 'antikva' },
  'enhetschef':               { free: 'linne',   premium: 'antikva' },
  'projektledare':            { free: 'linne',   premium: 'koppar' },
  'teamledare':               { free: 'linne',   premium: 'koppar' },
}

/** Lista over alla yrkesmall-slugs (anvands av sitemap, generateStaticParams etc) */
export const YRKESMALL_SLUGS = Object.keys(YRKE_TILL_MALLAR)

// ============================================================================
// Builder: kombinera mappning + content + GalleriYrke till komplett Yrkesmall
// ============================================================================

import { CV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'
import { FORVALD_MALL_ID, MALL_KATALOG, getMallKort } from '@/lib/cv/mallar/katalog'
import { talSomOrd } from '@/lib/cv/template-antal'

/** Mallarna med fotoplats, ur katalogen: talet och gratismallarna bland dem. */
const FOTO_MALLAR = MALL_KATALOG.filter((m) => m.foto)
const FOTO_GRATIS = FOTO_MALLAR.filter((m) => m.niva === 'gratis').map((m) => m.namn)
import { losMallId } from '@/lib/cv/mallar/alias'
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
  return getMallKort(mallId)?.namn || mallId
}

/**
 * Yrkets mallar i det nya utbudet (plan-mallar 3.3). YRKE_TILL_MALLAR har
 * katalogens id sedan 2026-11-16; aliasen finns kvar som skydd. Gratismallen är alltid en gratismall
 * (fältet free rättat), premiummallen alltid en premiummall när en finns.
 */
function losYrkesMallar(m: { free: string; premium: string }): { free: string; premium: string } {
  const fri = losMallId(m.free)
  const free = fri && getMallKort(fri)?.niva === 'gratis' ? fri : FORVALD_MALL_ID
  const pre = losMallId(m.premium)
  const premium =
    pre && getMallKort(pre)?.niva === 'premium'
      ? pre
      : (MALL_KATALOG.find((k) => k.niva === 'premium')?.id ?? pre ?? free)
  return { free, premium }
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
        a: `Inte obligatoriskt i Sverige men vanligt. ${talSomOrd(FOTO_MALLAR.length).replace(/^./, (c) => c.toUpperCase())} av våra mallar har plats för foto${FOTO_GRATIS.length ? `, bland dem gratismallen ${FOTO_GRATIS.join(' och ')}` : ''}, och fotot slår du av eller på. Alla är ATS-säkra. Välj utifrån branschen: vissa branscher förväntar sig foto, andra ser det som onödigt.`,
      },
      {
        q: 'Vilken är bäst, gratismallen eller mallen i Premium?',
        a: `Beror på dig. Gratismallen är ren, ATS-vänlig och funkar i de flesta rekryteringssituationer. Mallarna i Jobbcoach Premium har fler former, som sidospalt, färgat huvud och fotoplats, och en rikare design som signalerar att du investerat i din ansökan. För roller där personlig branding är viktigt (sälj, kundkontakt, ledning) lutar mallen i Premium mer.`,
      },
    ],
  }
}

function buildYrkesmallList(): Yrkesmall[] {
  return Object.entries(YRKE_TILL_MALLAR)
    .map(([slug, gamla]) => {
      const mallar = losYrkesMallar(gamla)
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
          `Gratismallen ${freeMallNamn} ger en ATS-säker grund för ${galleri.namn.toLowerCase()} med tydlig struktur och rätt sektionsordning.`,
          getMallKort(mallar.premium)?.foto
            ? `${premiumMallNamn}, som ingår i Premium, har plats för foto, vilket lyfter det personliga intrycket i ansökningar där det värderas.`
            : `${premiumMallNamn}, som ingår i Premium, ger CV:t en egen form (${(getMallKort(mallar.premium)?.kort ?? '').toLowerCase()}) utan att ta fokus från meriterna.`,
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
