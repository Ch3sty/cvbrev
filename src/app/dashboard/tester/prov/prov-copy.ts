/**
 * Strängarna på logiktestprovets resultatsida och dess 404
 * (docs/qa/qa-slutflode-2026-09-24.md, K1). Löftet i registreringen är
 * "Skapa konto och se alla svar med förklaring"; sidan håller det.
 */

import { paketKort } from '@/lib/plans/plans'
import { provrad, provradLabel, type Provrad } from '@/lib/traning/rubrik'
import { PROVFORMAT, type FormatNyckel } from '@/lib/traning/tempo'

export const PROVSIDA = {
  eyebrow: 'Rekryteringstester',
  titel: 'Ditt logiktestprov, alla svar',
  beskrivning:
    'Fem frågor ur logiktestet på grundnivå. Här ser du vilka du fick rätt och regeln bakom varje mönster.',
  resultatEtikett: 'Ditt resultat',
  av: (totalt: number) => `rätt av ${totalt}`,
  meta: (datum: string) => `Provet utan konto, fem frågor, ${datum}`,
  omdome: (ratt: number, totalt: number): string => {
    if (ratt === totalt) return 'Alla rätt. Grundnivån har femton frågor av samma sort, och efter den väntar avancerad nivå.'
    if (ratt >= totalt - 1) return 'Nästan alla rätt. Läs regeln för den du missade, så känner du igen mönstret nästa gång.'
    if (ratt >= Math.ceil(totalt / 2)) return 'Mer än hälften rätt. Läs reglerna nedan: mönstren kommer tillbaka i det skarpa testet.'
    return 'Mönstren blir lättare när du sett dem en gång. Läs regeln under varje fråga och gör sedan grundnivån.'
  },
  genomgang: 'Tryck på en fråga för att visa eller dölja regeln och rätt svar.',
  knapp: 'Gör grundnivån',
  traning: 'Se vad som ingår',
  traningText: `Alla nivåer, övningsprov mot klockan och förklaring till varje fråga ingår i ${paketKort()}.`,
  hubb: 'Till rekryteringstesterna',
} as const

const TITEL_LAST = 'Övningsprov mot klockan'

/**
 * Provradens text i testhubben (copy-premium-2026-10-11 avsnitt 5 och
 * spec-rummen 19.6). Logikgruppens rad är övningsprovet i planens
 * format och byggs av provrad(format) i src/lib/traning/rubrik.ts, samma
 * hjälpare som hemvyns Provdagen-rad. Leverantörsnamnet kommer bara ur
 * planens leverantör, aldrig ur en siffermatchning. Verbal- och
 * numeriskprovens rader har inget leverantörsformat; talen läses ur provets
 * konfiguration. "Ingår i Premium" står bara när raden är låst.
 */
export const PROVRAD = {
  titelLast: TITEL_LAST,
  titelOppen: 'Övningsprov mot klockan',
  ingar: `Ingår i ${paketKort()}.`,
  /** Verbal och numerisk: "18 uppgifter på 25 minuter. Ingår i Premium." */
  rad2: (uppgifter: number, minuter: number, last: boolean) =>
    [`${uppgifter} uppgifter på ${minuter} minuter.`, last ? `Ingår i ${paketKort()}.` : null]
      .filter(Boolean)
      .join(' '),
  /**
   * Övningsprovet: "Samma format som Matrigma. Cirka 35 uppgifter på 40
   * minuter. Ingår i Premium." Anmärkningen (SHL, Aon) står i 1c-kortet och
   * i hjälpen, inte i raden (copy-plan 4.10).
   */
  rad2Format: (r: Provrad, last: boolean) =>
    [`${r.titel}. ${r.format}`, last ? `Ingår i ${paketKort()}.` : null]
      .filter(Boolean)
      .join(' '),
  /** "Övningsprov mot klockan. Samma format som Matrigma. Cirka 35 uppgifter på 40 minuter. Låst, ingår i Premium." */
  ariaFormat: (r: Provrad) => `${TITEL_LAST}. ${provradLabel(r, `Låst, ingår i ${paketKort()}.`)}`,
  /** Verbal och numerisk: "Övningsprov mot klockan. 18 uppgifter på 25 minuter. Låst, ingår i Premium." */
  aria: (uppgifter: number, minuter: number) =>
    `${TITEL_LAST}. ${uppgifter} uppgifter på ${minuter} minuter. Låst, ingår i ${paketKort()}.`,
} as const

/**
 * Rad 2 och aria för en provrad. Övningsprovet (general) läser planens
 * format, de andra provets antal och minuter.
 */
export function provradTexter(
  prov: { general?: true; totalQuestions: number; minutes: number },
  provformat: FormatNyckel,
  last: boolean
): { rad2: string; aria: string } {
  if (prov.general) {
    const r = provrad(PROVFORMAT[provformat] ?? PROVFORMAT.eget)
    return { rad2: PROVRAD.rad2Format(r, last), aria: PROVRAD.ariaFormat(r) }
  }
  return {
    rad2: PROVRAD.rad2(prov.totalQuestions, prov.minutes, last),
    aria: PROVRAD.aria(prov.totalQuestions, prov.minutes),
  }
}

export const PROV_SAKNAS = {
  eyebrow: 'Rekryteringstester',
  titel: 'Det här provet finns inte',
  text: 'Länken leder till ett prov som har tagits bort, gått ut eller hör till ett annat konto.',
  lankHubb: 'Till rekryteringstesterna',
  /** Det lyfta kortets titel: knappens mål (spec 16.3.2, sista raden). */
  kortTitel: 'Rekryteringstesterna',
  lankHem: 'Till hemskärmen',
} as const
