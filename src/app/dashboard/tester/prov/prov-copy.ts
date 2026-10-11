/**
 * Strängarna på logiktestprovets resultatsida och dess 404
 * (docs/qa/qa-slutflode-2026-09-24.md, K1). Löftet i registreringen är
 * "Skapa konto och se alla svar med förklaring"; sidan håller det.
 */

import { paketKort } from '@/lib/plans/plans'

export const PROVSIDA = {
  eyebrow: 'Rekryteringstester',
  titel: 'Ditt logiktestprov, alla svar',
  beskrivning:
    'Fem frågor ur logiktestet på grundnivå. Här ser du vilka du fick rätt och regeln bakom varje mönster.',
  resultatEtikett: 'Ditt resultat',
  av: (totalt: number) => `rätt av ${totalt}`,
  meta: (datum: string) => `Provet utan konto, fem frågor · ${datum}`,
  omdome: (ratt: number, totalt: number): string => {
    if (ratt === totalt) return 'Alla rätt. Grundnivån har femton frågor av samma sort, och efter den väntar avancerad nivå.'
    if (ratt >= totalt - 1) return 'Nästan alla rätt. Läs regeln för den du missade, så känner du igen mönstret nästa gång.'
    if (ratt >= Math.ceil(totalt / 2)) return 'Mer än hälften rätt. Läs reglerna nedan: mönstren kommer tillbaka i det skarpa testet.'
    return 'Mönstren blir lättare när du sett dem en gång. Läs regeln under varje fråga och gör sedan grundnivån.'
  },
  genomgang: 'Tryck på en fråga för att visa eller dölja regeln och rätt svar.',
  knapp: 'Gör grundnivån',
  traning: 'Se vad som ingår',
  traningText: `Alla nivåer, tidsatt provläge och förklaring till varje fråga ingår i ${paketKort()}.`,
  hubb: 'Till rekryteringstesterna',
} as const

/**
 * Provradens text i testhubben (copy-premium-2026-10-11 avsnitt 5,
 * testansvarigs villkor). Talen läses ur provets konfiguration. "Samma
 * format som" står bara när provets antal och minuter är leverantörens.
 */
export const PROVRAD = {
  titelLast: 'Provläge mot klockan',
  titelOppen: 'Prov: mät var du står',
  format: (namn: string) => `Samma format som ${namn}.`,
  matt: (uppgifter: number, minuter: number) => `${uppgifter} uppgifter, ${minuter} minuter.`,
  ingar: `Ingår i ${paketKort()}.`,
  /** Rad 2 som en mening: "Samma format som Matrigma. 35 uppgifter, 40 minuter. Ingår i Premium." */
  rad2: (formatNamn: string | null, uppgifter: number, minuter: number, last: boolean) =>
    [formatNamn ? `Samma format som ${formatNamn}.` : null, `${uppgifter} uppgifter, ${minuter} minuter.`, last ? `Ingår i ${paketKort()}.` : null]
      .filter(Boolean)
      .join(' '),
  /** "Provläge mot klockan. Samma format som Matrigma, 35 uppgifter, 40 minuter. Låst, ingår i Premium." */
  aria: (formatNamn: string | null, uppgifter: number, minuter: number) =>
    `Provläge mot klockan. ${formatNamn ? `Samma format som ${formatNamn}, ${uppgifter}` : `${uppgifter}`} uppgifter, ${minuter} minuter. Låst, ingår i ${paketKort()}.`,
} as const

export const PROV_SAKNAS = {
  eyebrow: 'Rekryteringstester',
  titel: 'Det här provet finns inte',
  text: 'Länken leder till ett prov som har tagits bort, gått ut eller hör till ett annat konto.',
  lankHubb: 'Till rekryteringstesterna',
  /** Det lyfta kortets titel: knappens mål (spec 16.3.2, sista raden). */
  kortTitel: 'Rekryteringstesterna',
  lankHem: 'Till hemskärmen',
} as const
