/**
 * Reklamkortens texter i artiklarna och artikellistan
 * (docs/design/analys-artiklar-2026-09-23.html, avsnitt 6, "Texterna, kort
 * för kort"), med ägarens justering 2026-09-23: "Gör provet innan
 * rekryteraren gör det" utgår och ersätts. Slutgranskade av copywritern
 * 2026-09-23: brevet är ett per rullande sju dagar, aldrig "ett om dagen".
 *
 * Gratisnivån i testerna (spec-rummen 23.3): fem frågor i artikeln utan
 * konto, mätningen och första passet med konto, resten i Premium. Testerna
 * beskrivs aldrig med en daglig gratisgräns.
 *
 * Vi-form, verbet först, gratis före pris, priset som tal, aldrig
 * "obegränsat" (vi säger "utan tak"), aldrig "AI-driven". Knapptexten säger
 * vad som händer. Belopp ur PLANS, mallantal ur TEMPLATE_COUNT, gratisgränser
 * ur kvottjänsten. Inga talstreck, inga ogaranterade siffror.
 *
 * Bara Jobbcoach Premium säljs (spec-rummen 17.3, copy-premium 2026-10-11).
 * Klustret styr fortfarande vinkeln (tester, CV och brev, intervju och lön),
 * men varje kort säljer samma sak. Fulla namnet står en gång per kort, i
 * etiketten; resten säger Premium. Knappen läser kopKnapp().
 */

import { PLAN_BY_KEY, SALD_PLAN, kopKnapp, paketKort, paketNamn, prisPeriod } from '@/lib/plans/plans'
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { FREE_TIER_JOB_LIMIT, JOB_MATCHES_PER_RUN } from '@/lib/jobmatching/freeLimit'
import { NO_RESPONSE_NUDGE_DAYS } from '@/lib/applications/status'
import { UPPFOLJNING_GRATIS_UTKAST } from '@/lib/jobbsok/typer'
import { FREE_CHAT_MESSAGES_PER_ACCOUNT, LETTER_WINDOW_DAYS } from '@/lib/quota/quotaService'
import type { InlineVerktyg } from '@/lib/cta/clusters'
import { GRATIS_LISTA, GRATIS_MALLRAD, GRATIS_TESTRAD_PROV, GRUNDNIVAN_ALLA_DAG } from '@/lib/plans/gratis-copy'

const PLAN = PLAN_BY_KEY[SALD_PLAN]
/** "Jobbcoach Premium" */
const NAMN = paketNamn(SALD_PLAN)
/** "Premium" */
const KORT = paketKort()
/** "149 kr i månaden" */
const PRIS = prisPeriod(SALD_PLAN)
/** "Premium, 149 kr i månaden" */
const KORT_PRIS = `${KORT}, ${PRIS}`
/** Prisraden när fulla namnet redan står på kortet (copy-premium avsnitt 3). */
const PRISRAD = `${PRIS}, säg upp när du vill.`
const KOP_HREF = `/register?paket=${SALD_PLAN}`

/** Talord för små tal i löptext: "tre matchade jobb". */
const ORD = ['noll', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv']
const ord = (n: number) => ORD[n] ?? String(n)
const Ord = (n: number) => {
  const s = ord(n)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Brevfönstret i ord: "var sjunde dag". Faller tillbaka på "var N:e dag". */
const ORDNING: Record<number, string> = { 7: 'sjunde', 14: 'fjortonde', 30: 'trettionde' }
const BREVFONSTER = ORDNING[LETTER_WINDOW_DAYS]
  ? `var ${ORDNING[LETTER_WINDOW_DAYS]} dag`
  : `var ${LETTER_WINDOW_DAYS}:e dag`

export interface InlineCopy {
  /** Delens namn över rubriken (publikt omgång 3, skissen artikelreklam). */
  etikett: string
  rubrik: string
  /** Brödtexten utan gratisraden. */
  brod: string
  /** Vad som är gratis, i egen ruta med bock. Saknas där texten inte går att dela. */
  gratis?: string
  /** Hela texten, brod och gratis i följd (som förut). */
  text: string
  knapp: string
  href: string
  /** Raden under knappen: vad Premium lägger till. */
  paketrad: string
}

/** Inline-kortet efter andra stycket: verktyget, gratis först. */
/**
 * Testklustret och intervjuklustret får ProvKort (INLINE_PROVA), inte ett
 * verktygskort; INLINE.test är borttaget (S2, beslut 2026-11-15).
 */
export const INLINE: Record<Exclude<InlineVerktyg, 'raknare' | 'lankrad' | 'test'>, InlineCopy> = {
  mallar: {
    etikett: 'CV-mallar',
    rubrik: 'Bygg CV:t på en mall som rekryteringssystem läser',
    brod: `${Ord(FREE_TEMPLATE_COUNT)} mallar och en nedladdning utan att betala, byggda så att rekryteringssystem läser dem rätt. Du fyller i, vi formaterar.`,
    text: `${Ord(FREE_TEMPLATE_COUNT)} mallar och en nedladdning utan att betala, byggda så att rekryteringssystem läser dem rätt. Du fyller i, vi formaterar.`,
    knapp: 'Välj en mall',
    href: '/cv-mallar',
    paketrad: `Alla ${TEMPLATE_COUNT} mallar och CV-analysens alla förslag ingår i ${KORT_PRIS}.`,
  },
  analys: {
    etikett: 'CV-analys',
    rubrik: 'Se varför CV:t fastnar innan du skickar det',
    brod: 'Ladda upp CV:t, så läser vi det som en rekryterare gör i första urvalet.',
    gratis: 'Läsbarhetspoängen och genomgången i sju delar är gratis, för varje CV.',
    text: 'Ladda upp CV:t, så läser vi det som en rekryterare gör i första urvalet. Läsbarhetspoängen och genomgången i sju delar är gratis, för varje CV.',
    knapp: 'Analysera mitt CV',
    // K8 (saas-lead, SEO JA): rakt till uppladdningen. /verktyg/cv-analys står kvar i varje artikel genom Läs vidare.
    href: '/verktyg/cv-analys#mini-analys',
    paketrad: `Alla förslag från Jobbcoachen, och nya efter varje ändring, ingår i ${KORT_PRIS}.`,
  },
  brev: {
    etikett: 'Personliga brev',
    rubrik: 'Skriv det personliga brevet på annonsen, inte på mallen',
    brod: 'Klistra in annonsen, välj ton, vi skriver utkastet utifrån ditt CV.',
    gratis: `Ett personligt brev ${BREVFONSTER} är gratis, och de två senaste går att ändra.`,
    text: `Klistra in annonsen, välj ton, vi skriver utkastet utifrån ditt CV. Ett personligt brev ${BREVFONSTER} är gratis, och de två senaste går att ändra.`,
    knapp: 'Skriv mitt personliga brev',
    href: '/skapa-brev/start',
    paketrad: `Personliga brev utan tak, som PDF eller Word, ingår i ${KORT_PRIS}.`,
  },
  coach: {
    etikett: 'Jobbcoachen',
    rubrik: 'Träna svaret innan du sitter i rummet',
    brod: 'Bolla dina svar med Jobbcoachen och få följdfrågorna en rekryterare hade ställt.',
    gratis: `${Ord(FREE_CHAT_MESSAGES_PER_ACCOUNT)} meddelanden utan att betala.`,
    text: `Bolla dina svar med Jobbcoachen och få följdfrågorna en rekryterare hade ställt. ${Ord(FREE_CHAT_MESSAGES_PER_ACCOUNT)} meddelanden utan att betala.`,
    knapp: 'Träna intervjufrågor',
    href: '/verktyg/jobbcoachen',
    paketrad: `Jobbcoachen, så mycket du vill, ingår i ${KORT_PRIS}.`,
  },
}

/**
 * Provkortet i testklustret (spec-publikt-v2 del B 3.1, rad 2b): expertfrågan
 * i bild och fem frågor utan konto. Rubriken är frågan själv, aldrig h2/h3.
 */
export const INLINE_PROVA = {
  /** Delens namn (skissen artikelreklam). Uppgift, aldrig fråga, i testerna. */
  etikett: 'Rekryteringstester',
  rubrik: 'Vilken figur hör hemma i den tomma rutan?',
  brod: 'Det här är en av våra expertuppgifter: tre regler samtidigt, form, tecken och fyllning.',
  gratis: `Fem uppgifter gratis här, rätt och fel direkt. Facit och ${GRUNDNIVAN_ALLA_DAG}, gratis med konto.`,
  text: `Det här är en av våra expertuppgifter: tre regler samtidigt, form, tecken och fyllning. Fem uppgifter gratis här, rätt och fel direkt. Facit och ${GRUNDNIVAN_ALLA_DAG}, gratis med konto.`,
  knapp: 'Prova fem uppgifter',
  href: '/verktyg/rekryteringstester/prova',
  /** Paketraden (S2): leverantörsnamnen, alltid "i samma format som". */
  paketrad: `Avancerad och expertnivå, övningsprov mot klockan i samma format som Matrigma, Alva, SHL och Aon, och det fördjupade personlighetstestet ingår i ${KORT_PRIS}.`,
  /**
   * Länken till testsidan bredvid provknappen (analysen 2026-11-08, punkt 9):
   * testsidan gav 41 konton i P1 och 5 i P2 när korten bara pekade på provet.
   */
  sekundar: { text: 'Se alla tester och nivåer', href: '/verktyg/rekryteringstester' },
} as const

/**
 * Testkortet i artiklar utanför testklustret (punkt 10): samma kort som
 * provkortet, med en rubrik och text som passar intervjuartiklarna. Används
 * som <TestKort /> i MDX, till exempel i styrkor-svagheter-intervju.
 */
export const TESTKORT_INTERVJU = {
  etikett: 'Inför intervjun',
  rubrik: 'Intervjun kommer sällan ensam',
  text: 'Logiktest och personlighetstest ingår ofta i samma process, före eller efter intervjun. Prova fem matrisuppgifter gratis, rätt och fel direkt, eller se alla tester och nivåer.',
} as const

/** Karriär med lön, uppsägning eller jobbyte: räknarna först, coachen sedan. */
export const INLINE_RAKNARE = {
  etikett: 'Räkna ut',
  rubrik: 'Räkna på det själv, fråga sedan',
  text: 'Uppsägningstid och lön efter skatt räknar du ut gratis här. Löneförhandlingen förbereder du med Jobbcoachen, som svarar med källor du kan kolla själv och läser ditt CV när du delar det i samtalet.',
  lankar: [
    { text: 'Räkna ut lönen efter skatt', href: '/rakna-ut/lon-efter-skatt' },
    { text: 'Räkna ut uppsägningstiden', href: '/rakna-ut/uppsagningstid' },
    { text: 'Fråga Jobbcoachen', href: '/verktyg/jobbcoachen' },
  ],
} as const

/** Övriga karriärartiklar: bara länkraden, som förut. */
export const LANKRAD = {
  etikett: 'Räkna ut',
  text: 'Räkna på det själv:',
  lankar: [
    { text: 'Räkna ut din uppsägningstid', href: '/rakna-ut/uppsagningstid' },
    { text: 'Räkna ut lönen efter skatt', href: '/rakna-ut/lon-efter-skatt' },
  ],
} as const

export interface SidoCopy {
  etikett: string
  rubrik: string
  text: string
  belopp: string
  under: string
  gratisrad?: string
}

/** Sidokolumnens kort, desktop. Samma produkt, klustrets vinkel i rubriken. */
export const SIDO: Record<'cv' | 'test' | 'allt', SidoCopy> = {
  test: {
    etikett: NAMN,
    rubrik: 'Träna med klockan på innan kallelsen kommer',
    text: PLAN.beskrivning,
    belopp: `${PLAN.amount} kr`,
    under: `${PLAN.suffix}, ingen bindningstid`,
    gratisrad: `${GRATIS_TESTRAD_PROV} Resten ingår i ${KORT}.`,
  },
  cv: {
    etikett: NAMN,
    rubrik: 'Ett CV som går igenom första urvalet',
    text: PLAN.beskrivning,
    belopp: `${PLAN.amount} kr`,
    under: `${PLAN.suffix}, ingen bindningstid`,
    gratisrad: `${Ord(FREE_TEMPLATE_COUNT)} mallar och ett personligt brev ${BREVFONSTER} är gratis.`,
  },
  allt: {
    etikett: NAMN,
    rubrik: 'Förberedd in i intervjun och löneförhandlingen',
    text: PLAN.beskrivning,
    belopp: `${PLAN.amount} kr`,
    under: `${PLAN.suffix}, ingen bindningstid`,
  },
}

export interface SlutCopy {
  etikett: string
  rubrik: string
  rader: readonly string[]
  prisrad: string
  knapp: string
  href: string
  sekundar: { text: string; href: string }
}

/** Raderna som säger att resten också ingår (copy-premium avsnitt 3). */
const CV_RAD = 'Alla CV-mallar, CV-analysens alla förslag, personliga brev och LinkedIn'
const TEST_RAD = 'Alla rekryteringstester, övningsprov och personlighetstestet'
const SEKUNDAR = { text: 'Se vad som ingår', href: '/priser' }

/** Slutkortet i bläck, efter brödtexten. */
export const SLUT: Record<'cv' | 'test' | 'allt', SlutCopy> = {
  test: {
    etikett: NAMN,
    rubrik: 'Alla nivåer. Klockan på.',
    rader: [
      'Alla åtta testtyperna i grund, avancerad och expert, med förklaring till varje svar',
      'Övningsprov mot klockan i samma format som Matrigma, Alva, SHL, Aon och I-provet, med automatisk inlämning när tiden är ute',
      'Det fördjupade personlighetstestet, 120 påståenden',
      'Dessutom CV-analysen, alla mallar, personliga brev, jobbmatchning och Jobbcoachen',
    ],
    prisrad: PRISRAD,
    knapp: kopKnapp(),
    href: KOP_HREF,
    sekundar: SEKUNDAR,
  },
  cv: {
    etikett: NAMN,
    rubrik: 'Ett CV som går igenom. Personliga brev som svarar på annonsen.',
    rader: [
      'CV-analysens alla förslag, och nya efter varje ändring',
      `Alla ${TEMPLATE_COUNT} mallar, nedladdning utan tak`,
      'Personliga brev utan tak, som PDF eller Word',
      'LinkedIn-profilen omskriven',
      'Dessutom alla rekryteringstester, jobbmatchning och Jobbcoachen',
    ],
    prisrad: PRISRAD,
    knapp: kopKnapp(),
    href: KOP_HREF,
    sekundar: SEKUNDAR,
  },
  allt: {
    etikett: NAMN,
    rubrik: 'Allt ingår. Från första annonsen till löneförhandlingen.',
    rader: [
      'Jobbmatchning, de bästa träffarna med skälen utskrivna',
      'Uppföljningsmejl till dina sökta tjänster och rapporten till Arbetsförmedlingen',
      'Jobbcoachen, så mycket du vill',
      'Intervjuprov utan dagsgräns och historik',
      CV_RAD,
      TEST_RAD,
    ],
    prisrad: PRISRAD,
    knapp: kopKnapp(),
    href: KOP_HREF,
    sekundar: SEKUNDAR,
  },
}

/** Gratiskortet: plats 7 i listan och generic-artiklarnas slutkort. */
export const GRATIS_KORT = {
  etikett: 'Utan att betala',
  rubrik: 'Vill du prova innan du läser vidare?',
  /** Den kanoniska listan ur gratis-copy.ts: tester, mallar, analys, brev, jobb. */
  rader: GRATIS_LISTA,
  /** Raden som länkar till /cv-mallar (SEO-spärrlistan punkt 4). */
  mallrad: GRATIS_MALLRAD,
  /** Captionen under Nio-raden i sidokolumnen (S7, copy 2026-11-15). */
  breddCaption: 'Åtta testtyper och personlighetstestet',
  knapp: 'Skapa konto gratis',
  href: '/register',
  sekundar: { text: 'Se vad som ingår i Premium', href: '/priser' },
} as const

/** Listans slutkort i bläck: Premium och det som ingår. */
export const LISTA_SLUT = {
  etikett: NAMN,
  rubrik: 'Läs klart. Gör sedan.',
  text: `Allt i en prenumeration, ${PRIS}. Ingen bindningstid, säg upp när du vill.`,
  rader: PLAN.highlights.filter((r) => r !== 'Säg upp när du vill'),
  knapp: 'Se vad som ingår',
  href: '/priser',
} as const

/**
 * Jobbsökets kort (publikt omgång 3, skissen artikelreklam och SEO-beskedet
 * avsnitt 20): två varianter i samma form. Träffen i artiklarna om
 * matchning, Sökta tjänster i artiklarna om uppföljning. Kortet läggs till
 * efter texten och ersätter inget annat kort, så att inget länkmål
 * försvinner ur artikeln. Talen ur konstanterna, aldrig lön.
 */
export interface JobbKortCopy {
  etikett: string
  /** Rutans aria-label (nytt-innehall.md, artikelreklam). */
  ariaLabel: string
  rubrik: string
  brod: string
  gratis: string
  knapp: string
  href: string
  paketrad: string
}

export const JOBB_KORT: Record<'matchning' | 'sokta', JobbKortCopy> = {
  matchning: {
    etikett: 'Jobbsöket',
    ariaLabel: 'Jobbsöket',
    rubrik: 'Se vilka annonser som passar ditt CV',
    brod: 'Vi läser ditt CV och söker bland annonserna i Platsbanken. Varje träff visar varför du passar.',
    gratis: `${Ord(FREE_TIER_JOB_LIMIT)} träffar är gratis, med skälen utskrivna.`,
    knapp: 'Hitta jobb gratis',
    href: '/verktyg/jobbmatchning',
    paketrad: `De ${JOB_MATCHES_PER_RUN} bästa träffarna ingår i ${KORT_PRIS}.`,
  },
  // Lydelserna ur nytt-innehall.md (artikelreklam), etikett och knapp enligt seo-slutbesked.md punkt 68.
  sokta: {
    etikett: 'Jobbsöket',
    ariaLabel: 'Sökta tjänster',
    rubrik: 'Håll koll på varje jobb du har sökt',
    brod: `Logga jobbet du har sökt, så räknar vi dagarna. Efter ${ord(NO_RESPONSE_NUDGE_DAYS)} tysta dagar föreslår vi ett uppföljningsmejl och skriver utkastet.`,
    gratis: `Att logga och se statistiken är gratis för alla med konto. ${UPPFOLJNING_GRATIS_UTKAST === 1 ? 'Det första utkastet' : `De ${ord(UPPFOLJNING_GRATIS_UTKAST)} första utkasten`} också.`,
    knapp: 'Håll koll på sökta jobb',
    href: '/verktyg/sokta-tjanster',
    paketrad: `Uppföljningsmejl till varje sökt tjänst och månadsrapporten med alla rader ingår i ${KORT_PRIS}.`,
  },
}

/** Artiklarna som får Jobbsökets kort efter texten (SEO-beskedet avsnitt 20). */
export const JOBB_KORT_SLUGAR: Readonly<Record<string, keyof typeof JOBB_KORT>> = {
  'ai-jobbmatchning': 'matchning',
  'soka-jobb-via-mail': 'sokta',
  'uppfoljning-efter-intervju': 'sokta',
  'personligt-brev-jobbansokan': 'sokta',
  'aktivitetsrapport-arbetsformedlingen': 'sokta',
}

/**
 * Artiklar där Jobbsökets kort tar hela skalets reklam (saas-lead 2026-11-22,
 * docs/artiklar-2026-11/brief-aktivitetsrapport.md 10.4): hjälteknappen,
 * mobilens klistrade knapp och sidokortet leder dit, inget inline-kort
 * injiceras och gratiskortet visas inte, eftersom Jobbsökets kort är
 * slutkortet. De övriga artiklarna i JOBB_KORT_SLUGAR behåller klustrets
 * reklam och får kortet som tillägg, som förut.
 */
export const JOBB_SKAL_SLUGAR: ReadonlySet<string> = new Set(['aktivitetsrapport-arbetsformedlingen'])
