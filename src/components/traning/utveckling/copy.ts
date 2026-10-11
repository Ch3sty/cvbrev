/**
 * Texterna i Din utveckling (skiss Provbladet, avsnitt 2). Regeln från
 * ägaren: inga tal i löptext. Talen står som display-tal, i staplar och
 * prickar, eller som korta etiketter intill en visualisering.
 * Vi-form, inga tankstreck.
 */

import { ordTal } from '@/lib/tester/resultat'

export const UTV = {
  rubrik: 'Din utveckling',
  rad: 'Passen flyttar punkten lite, ommätningen mycket.',
  radUtanKurva: 'Resultaten från de klassiska testerna, nivå för nivå.',
  kurvaHjalp: 'Vad är nivån?',
  stat: { idag: 'nivå i dag', matning: 'mätningen', sikte: 'mål' },
  nivanUpp: 'Nivån upp',
  legend: { pass: 'pass', matning: 'mätning och ommätning', general: 'generalrepetition', sikte: 'mål', marke: 'märke' },
  utanKurva: {
    titel: 'Nivåkurvan börjar med mätningen.',
    text: 'Tolv uppgifter i logiktestet som anpassar sig efter dina svar. Sedan en punkt per pass.',
    knapp: 'Mät din nivå',
  },
  tomt: {
    titel: 'Här ritas din kurva',
    text: 'Gör ditt första test så ser du var du står, hur nivåerna ligger mot varandra och var tiden tar slut.',
    knapp: 'Mät din nivå i logik',
    lank: 'Alla tester',
  },

  star: {
    rubrik: 'Var du står',
    hjalp: 'Hur räknas jämförelsen?',
    battreAn: 'Bättre än',
    pa: (namn: string) => `på ${namn.toLowerCase()}`,
    underlag: 'slutförda test',
    text: 'Ditt bästa försök mot alla slutförda test på samma nivå med blandade svarsalternativ. En jämförelse, inte ett betyg.',
    vantar: 'Jämförelsen kommer när underlaget räcker',
    vantarText: 'Vi jämför först när tillräckligt många gjort nivån. Vi gissar aldrig.',
    raknareMeta: (antal: number, mal: number) => `${antal} av ${mal}`,
    raknareAria: (namn: string, antal: number, mal: number) => `${namn}: ${antal} av ${mal} slutförda test, jämförelsen visas vid ${mal}`,
    utanEget: 'Gör nivån en gång till så kommer du med',
    du: 'Du',
    axel: { noll: '0', halften: 'hälften rätt', hundra: '100 %' },
    fordelningAria: (namn: string, p: number) => `Fördelningen av resultat på ${namn.toLowerCase()}. Din linje vid ${p} procent.`,
    ovriga: 'Övriga nivåer',
  },

  nivaer: {
    rubrik: 'Nivåerna',
    sitter: (niva: string) => `${versal(niva)} sitter.`,
    satter: (niva: string) => `${versal(niva)} håller på att sätta sig.`,
    borjan: 'Formatet håller på att sätta sig.',
    forsok: (n: number) => `${n} ${n === 1 ? 'försök' : 'försök'}`,
    inteGjord: 'inte gjord',
    minuter: (n: number) => `${n} min`,
    aria: (namn: string, p: number, n: number) => `${namn}, bäst ${p} procent, ${n} försök`,
    ariaInte: (namn: string) => `${namn}, inte gjord`,
    utanHistorik: 'Utan historik ser du bara senaste försöket per nivå.',
  },

  tappar: {
    rubrik: 'Var du tappar',
    bara: 'Gäller logiktestet. För text och siffror räknar vi inte mönster än.',
    tomt: 'Mönstren räknas när du gjort mätningen eller ett pass i logiktestet.',
    tomtTitel: 'Inga mönster än',
    inget: 'Inget tapp än',
    ingetText: 'Alla mönster med minst två frågor har gått rätt hittills.',
    rattAv: (r: number, a: number) => `${r} av ${a}`,
    langsam: 'rätt men långsamt',
    riktat: (namn: string) => `Riktat pass: ${namn}`,
    legend: { ratt: 'rätt i tid', langsam: 'rätt men långsamt', svag: 'svagast' },
    aria: (namn: string, r: number, a: number, l: number) =>
      `${namn}: ${r} rätt av ${a}${l ? `, varav ${l} rätt men långsamt` : ''}`,
  },

  tempo: {
    rubrik: 'Tempo mot provets tid',
    tomt: 'Tempot räknas när du gjort ett pass i logiktestet.',
    tomtTitel: 'Inget pass än',
    /** Rubriken (art-director 2026-10-11, avvikelse 5): ett tal, i ord upp till tjugo. */
    titel: (over: number, antal: number) =>
      over === 0 ? 'Allt inom provets tid' : `${versal(ordTal(over))} av ${ordTal(antal)} över provets tid`,
    snittText: (s: number) => `Snitt ${s} s per fråga.`,
    budgetEtikett: (s: number) => `provets tid, ${s} s`,
    fast: 'Fel och långsam samtidigt betyder att du satt fast. På provet är det bättre att gissa och gå vidare.',
    senaste: (datum: string) => `Senaste passet, ${datum}`,
    fraga: (n: number) => `fråga ${n}`,
    stapelTitel: (n: number, s: number, ratt: boolean) => `Fråga ${n}: ${s} s, ${ratt ? 'rätt' : 'fel'}`,
    legend: { ratt: 'rätt', fel: 'fel', over: 'över provets tid' },
    perPass: 'Snitt per pass',
    perPassMeta: 'Frågorna nära din nivå, de senaste passen. Strecket är provets tid.',
    passTitel: (datum: string, s: number | null) => (s == null ? `${datum}: inget sparat snitt` : `${datum}: ${s} s per fråga`),
    sek: (s: number) => `${s} s`,
    aria: (over: number, antal: number, snitt: number, budget: number) =>
      `${over} av ${antal} frågor över provets tid. Snitt ${snitt} sekunder per fråga mot provets ${budget}.`,
  },

  multi: {
    rubrik: 'De klassiska testerna',
    text: 'Varje prick är ett försök, i procent rätt. Samma skala för alla tre.',
    legend: { grund: 'grund', avancerad: 'avancerad', expert: 'expert' },
    tomt: 'Inte gjort än',
    aria: (typ: string, n: number) => `${typ}: ${n} försök i procent rätt över tid`,
    prick: (niva: string, p: number, datum: string) => `${versal(niva)}, ${datum}: ${p} %`,
  },
} as const

function versal(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** "6,1" */
export function decimal(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1).replace('.', ',')
}
