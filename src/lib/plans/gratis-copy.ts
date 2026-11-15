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

/** "åtta" */
export const TESTTYPER_ORD = ord(ANTAL_TESTTYPER)

/** "grundnivån i alla åtta testtyperna" */
export const GRUNDNIVAN_ALLA = `grundnivån i alla ${TESTTYPER_ORD} testtyperna`

/** Listans första rad, tester. */
export const GRATIS_TESTRAD = `Grundnivån i alla ${TESTTYPER_ORD} testtyperna och personlighetstestet, med förklaring efter varje fråga`

/** Listan, fem rader, samma ordning överallt: tester, mallar, analys, brev, jobb och Jobbcoachen. */
export const GRATIS_LISTA = [
  GRATIS_TESTRAD,
  `${Ord(FREE_TEMPLATE_COUNT)} CV-mallar och en nedladdning`,
  'En CV-analys med poängen och det tyngsta fyndet',
  `Ett personligt brev ${GRATIS_BREVFONSTER}, att läsa på skärmen`,
  `${Ord(FREE_TIER_JOB_LIMIT)} matchade jobb och ${ord(GRATIS_CHATTFRAGOR)} meddelanden till Jobbcoachen`,
] as const

/** Index i GRATIS_LISTA för mallraden, som länkar till /verktyg/cv-mallar. */
export const GRATIS_MALLRAD = 1

/** Meningen, lång form (prissidan, FAQ). */
export const GRATIS_MENING_LANG =
  `Utan att betala gör du ${GRUNDNIVAN_ALLA} och personlighetstestet med ${GRATIS_PASTAENDEN} påståenden, ` +
  `får ${ord(FREE_TEMPLATE_COUNT)} CV-mallar och en nedladdning, en CV-analys med poängen och det tyngsta fyndet, ` +
  `ett personligt brev ${GRATIS_BREVFONSTER} att läsa på skärmen, ${ord(FREE_TIER_JOB_LIMIT)} matchade jobb och ` +
  `${ord(GRATIS_CHATTFRAGOR)} meddelanden till Jobbcoachen. Inget kort behövs.`

/**
 * Den långa meningen i delar, för /priser där vissa ord står i fetstil
 * (copywriterns A5). Delarna fogade ihop är exakt GRATIS_MENING_LANG.
 */
export const GRATIS_MENING_LANG_DELAR: readonly { text: string; fet?: boolean }[] = [
  { text: 'Utan att betala gör du ' },
  { text: GRUNDNIVAN_ALLA, fet: true },
  { text: ' och ' },
  { text: 'personlighetstestet', fet: true },
  { text: ` med ${GRATIS_PASTAENDEN} påståenden, får ` },
  { text: `${ord(FREE_TEMPLATE_COUNT)} CV-mallar`, fet: true },
  { text: ' och en nedladdning, ' },
  { text: 'en CV-analys', fet: true },
  { text: ' med poängen och det tyngsta fyndet, ' },
  { text: 'ett personligt brev', fet: true },
  { text: ` ${GRATIS_BREVFONSTER} att läsa på skärmen, ` },
  { text: `${ord(FREE_TIER_JOB_LIMIT)} matchade jobb`, fet: true },
  { text: ' och ' },
  { text: `${ord(GRATIS_CHATTFRAGOR)} meddelanden`, fet: true },
  { text: ' till Jobbcoachen. Inget kort behövs.' },
]

/** Meningen, kort form (fotnoter, en rad). */
export const GRATIS_MENING_KORT =
  `Grundnivån i alla tester, ${ord(FREE_TEMPLATE_COUNT)} CV-mallar, en CV-analys, ett personligt brev ${GRATIS_BREVFONSTER}, ` +
  `${ord(FREE_TIER_JOB_LIMIT)} matchade jobb och ${ord(GRATIS_CHATTFRAGOR)} meddelanden till Jobbcoachen ingår utan att betala.`

/** Testraden: provkort, testsidan, sidokolumnen. */
export const GRATIS_TESTRAD_PROV = `Fem frågor gratis här. Grundnivån i alla ${TESTTYPER_ORD} testtyperna gratis med konto.`

/**
 * Startsidans FAQ-svar om gratisnivån (S11): siffror som i dag, tester först.
 * "3 CV-mallar" och "10 meddelanden" står som siffror i FAQ-svaret.
 */
export const GRATIS_FAQ =
  `Gratisnivån kräver inget kort: ${GRUNDNIVAN_ALLA} och personlighetstestet, ${FREE_TEMPLATE_COUNT} CV-mallar och en nedladdning, ` +
  `en CV-analys med poängen och det tyngsta fyndet, ett personligt brev ${GRATIS_BREVFONSTER}, ${FREE_TIER_JOB_LIMIT} matchade jobb ` +
  `och ${GRATIS_CHATTFRAGOR} meddelanden till Jobbcoachen.`

/** "Grundnivån i alla åtta testtyperna", som egen rad i en lista. */
export const GRUNDNIVAN_RAD = `Grundnivån i alla ${TESTTYPER_ORD} testtyperna`
