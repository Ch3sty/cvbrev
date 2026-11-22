/**
 * Gratisnivån i ord, en enda källa (beslut om säljytorna 2026-11-15, avsnitt
 * 0 och copywriterns avsnitt 2). Listan, de två meningarna och testraden
 * läses av GratisKortet, /priser, registreringen, /register-panelen,
 * startsidans FAQ och gratisnivåmejlet, så att gratisnivån aldrig mer
 * beskrivs på sex sätt.
 *
 * Ordregeln: "grundnivån" är substantivet för det som är gratis i testerna,
 * aldrig "Nivåkollen" publikt. Texten säger "åtta testtyperna och
 * personlighetstestet"; bilden (TestBredd) visar nio. Talen skrivs som ord
 * och läses ur konstanterna. Tre av dem bor i moduler som inte får dras in i
 * klientens JavaScript (kvottjänsten, testkonfigurationen); de står därför som
 * tal här och vaktas av gratis-copy.test.ts.
 *
 * Inga talstreck, inga mittpunkter, aldrig "obegränsat".
 */

import { FREE_TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { FREE_TIER_JOB_LIMIT } from '@/lib/jobmatching/freeLimit'
import { ANTAL_TESTTYPER } from '@/lib/tester/antal-testtyper'

export { ANTAL_TESTTYPER }

const ORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio']
/** Talet som ord i löptext ("åtta", "tre"), siffran över tio. */
export const ord = (n: number): string => ORD[n] ?? String(n)
/** Samma med stor bokstav, först i en rad. */
export const Ord = (n: number): string => {
  const s = ord(n)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Vaktade av gratis-copy.test.ts mot kvottjänsten och testkonfigurationen (personlighet-grund). */
export const GRATIS_CHATTFRAGOR = 10
export const GRATIS_BREVFONSTER = 'var sjunde dag'
export const GRATIS_PASTAENDEN = 50
/** Intervjuprov om dagen på gratisnivån (DAILY_LIMIT_INTERVIEW_SAMPLES i kvottjänsten). */
export const GRATIS_INTERVJUPROV_PER_DAG = 1

/** "åtta" */
export const TESTTYPER_ORD = ord(ANTAL_TESTTYPER)

/** "grundnivån i alla åtta testtyperna" */
export const GRUNDNIVAN_ALLA = `grundnivån i alla ${TESTTYPER_ORD} testtyperna`

/** "grundnivån i alla åtta testtyperna, ett test om dagen": samma fras med dagsgränsen. */
export const GRUNDNIVAN_ALLA_DAG = `grundnivån i alla ${TESTTYPER_ORD} testtyperna, ett test om dagen`

/**
 * Listan, sex rader, samma ordning överallt: tester, mallar, analys, brev,
 * jobb och Jobbcoachen, Sökta tjänster. Den nya raden står sist, så att
 * index 1, 2 och 3 som registreringen läser står kvar.
 */
export const GRATIS_LISTA = [
  `Grundnivån i alla ${TESTTYPER_ORD} testtyperna med ett test om dagen, personlighetstestet och förklaring efter varje uppgift`,
  `${Ord(FREE_TEMPLATE_COUNT)} CV-mallar och en nedladdning`,
  'CV-analysens läsbarhetspoäng och genomgång i sju delar, för varje CV',
  `Ett personligt brev ${GRATIS_BREVFONSTER}, och de två senaste går att ändra`,
  `${Ord(FREE_TIER_JOB_LIMIT)} matchade jobb, ${ord(GRATIS_CHATTFRAGOR)} meddelanden till Jobbcoachen och ett intervjuprov om dagen`,
  'Sökta tjänster med Ska sökas, veckans mål och det första uppföljningsmejlet',
] as const

/** Index i GRATIS_LISTA för mallraden, som länkar till /cv-mallar. */
export const GRATIS_MALLRAD = 1

/** Meningen, lång form (prissidan, FAQ). */
export const GRATIS_MENING_LANG =
  `Utan att betala gör du ${GRUNDNIVAN_ALLA_DAG}, och personlighetstestet med ${GRATIS_PASTAENDEN} påståenden, ` +
  `får ${ord(FREE_TEMPLATE_COUNT)} CV-mallar och en nedladdning, CV-analysens läsbarhetspoäng och genomgång i sju delar för varje CV, ` +
  `ett personligt brev ${GRATIS_BREVFONSTER} där de två senaste går att ändra, ${ord(FREE_TIER_JOB_LIMIT)} matchade jobb, ` +
  `${ord(GRATIS_CHATTFRAGOR)} meddelanden till Jobbcoachen och Sökta tjänster med det första uppföljningsmejlet. Inget kort behövs.`

/**
 * Den långa meningen i delar, för /priser där vissa ord står i fetstil
 * (copywriterns A5). Delarna fogade ihop är exakt GRATIS_MENING_LANG.
 */
export const GRATIS_MENING_LANG_DELAR: readonly { text: string; fet?: boolean }[] = [
  { text: 'Utan att betala gör du ' },
  { text: GRUNDNIVAN_ALLA_DAG, fet: true },
  { text: ', och ' },
  { text: 'personlighetstestet', fet: true },
  { text: ` med ${GRATIS_PASTAENDEN} påståenden, får ` },
  { text: `${ord(FREE_TEMPLATE_COUNT)} CV-mallar`, fet: true },
  { text: ' och en nedladdning, ' },
  { text: 'CV-analysens läsbarhetspoäng', fet: true },
  { text: ' och genomgång i sju delar för varje CV, ' },
  { text: 'ett personligt brev', fet: true },
  { text: ` ${GRATIS_BREVFONSTER} där de två senaste går att ändra, ` },
  { text: `${ord(FREE_TIER_JOB_LIMIT)} matchade jobb`, fet: true },
  { text: ', ' },
  { text: `${ord(GRATIS_CHATTFRAGOR)} meddelanden`, fet: true },
  { text: ' till Jobbcoachen och ' },
  { text: 'Sökta tjänster', fet: true },
  { text: ' med det första uppföljningsmejlet. Inget kort behövs.' },
]

/** Meningen, kort form (fotnoter, en rad). */
export const GRATIS_MENING_KORT =
  `Ett grundnivåtest om dagen, ${ord(FREE_TEMPLATE_COUNT)} CV-mallar, CV-analysens läsbarhetspoäng för varje CV, ett personligt brev ${GRATIS_BREVFONSTER}, ` +
  `${ord(FREE_TIER_JOB_LIMIT)} matchade jobb, ${ord(GRATIS_CHATTFRAGOR)} meddelanden till Jobbcoachen och Sökta tjänster ingår utan att betala.`

/** Testraden: provkort, testsidan, sidokolumnen. */
export const GRATIS_TESTRAD_PROV = `Fem uppgifter gratis här. Grundnivån i alla ${TESTTYPER_ORD} testtyperna gratis med konto, ett test om dagen.`

/**
 * Startsidans FAQ-svar om gratisnivån (S11): siffror som i dag, tester först.
 * Antalet CV-mallar (ur katalogen) och "10 meddelanden" står som siffror i FAQ-svaret.
 */
export const GRATIS_FAQ =
  `Gratisnivån kräver inget kort: ${GRUNDNIVAN_ALLA_DAG}, och personlighetstestet, ${FREE_TEMPLATE_COUNT} CV-mallar och en nedladdning, ` +
  `CV-analysens läsbarhetspoäng och genomgång i sju delar för varje CV, ett personligt brev ${GRATIS_BREVFONSTER}, ${FREE_TIER_JOB_LIMIT} matchade jobb, ` +
  `${GRATIS_CHATTFRAGOR} meddelanden till Jobbcoachen och Sökta tjänster med det första uppföljningsmejlet.`

/** "Grundnivån i alla åtta testtyperna, ett test om dagen", som egen rad i en lista. */
export const GRUNDNIVAN_RAD = `Grundnivån i alla ${TESTTYPER_ORD} testtyperna, ett test om dagen`
