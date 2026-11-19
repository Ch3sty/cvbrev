// Hem i Rekryteringstester v4 (docs/plan-tester-v4-bygg.md 3.3, utkast v4
// avsnitt 2, skiss.html webbens Hem). Texterna ordagrant ur skissen. Inga
// talstreck, inget "pass" utåt, svenska facktermer.

import { kortDatum, veckodagVersal } from '@/lib/traning/rubrik'
import type { Dag } from '@/lib/traning/datum'

export const HEM_V4 = {
  /** Väggen utan plan. */
  rubrik: 'Hem',
  rad: 'Var du står och vad som är rimligt härnäst.',
  matta: (n: number, av: number) => `${n} av ${av}`,
  mattaSvans: ' testtyper mätta.',
  /** Väggen med plan. */
  planEyebrow: 'Plan inför provet',
  provIdag: 'Provet är i dag',
  andra: 'Ändra',
  laggTillDatum: 'Lägg till provdatum',
  /** Banan. */
  bana: {
    idag: 'i dag',
    nivakollForslag: 'nivåkoll, förslag',
    ovningsprovForslag: 'övningsprov, förslag',
    provet: (dag: Dag) => `provet ${kortDatum(dag)}`,
    oppetSlut: 'tills det sitter',
    gjorda: (n: number) => (n === 1 ? '1 dag' : `${n} dagar`),
    aria: (gjorda: number, kvar: number | null) =>
      kvar == null
        ? `Banan utan provdatum: ${gjorda} dagar med träning hittills.`
        : `Banan till provdagen: ${gjorda} dagar med träning, ${kvar} dagar kvar.`,
  },
  /** Nästa steg. */
  nastaSteg: 'Nästa steg',
  stangEtikett: 'Stäng första steget',
  tips: 'Tips:',
  las: 'Ingår i Premium',
  /** Fler steg. */
  flerSteg: 'Fler steg',
  flerStegRad: 'ur dina resultat',
  /** Fortsätt där du slutade. */
  fortsatt: 'Fortsätt där du slutade',
  /** Plankortet utan plan. */
  plankort: {
    eyebrow: 'Plan inför provet',
    titel: 'Vet du vilket test du ska göra?',
    text: 'Välj, så framhäver vi det och föreslår vad du övar fram till provdagen.',
    ja: 'Ja, jag vet',
    inteAn: 'Inte än, träna brett',
    hopfalldTitel: 'Plan inför provet',
    hopfalldText: 'Vet du vilket test? Välj, så framhäver vi det.',
    valj: 'Välj',
  },
  /** Navigeringen under Nästa steg (skissen Hem A, tre kort). */
  nav: {
    etikett: 'Rekryteringstester',
    hem: 'Hem',
    tester: 'Tester',
    utveckling: 'Din utveckling',
    duArHar: 'Du är här',
    hemRad: (etikett: string) => `Nästa steg: ${etikett}`,
    hemRadUtan: 'Var du står',
    hemKort: 'Nästa steg',
    testerRad: (antal: number, matta: number) => `${antal} testtyper, ${matta} mätta, alla öppna`,
    testerRadGratis: (antal: number, kvar: boolean) =>
      `${antal} testtyper, ${kvar ? 'ett grundnivåtest gratis i dag' : 'dagens grundnivåtest gjort'}`,
    testerKort: (antal: number) => `${antal} testtyper`,
    utvecklingRad: (niva: string, andring: string | null) => `Nivå ${niva}${andring ? `, ${andring}` : ''}`,
    upp: (v: string) => `upp ${v} på fyra veckor`,
    ned: (v: string) => `ned ${v} på fyra veckor`,
    oforandrad: 'oförändrad på fyra veckor',
    uppKort: (v: string) => `upp ${v}`,
    nedKort: (v: string) => `ned ${v}`,
    utanMatning: 'Kurvan börjar med Nivåkollen',
    utanMatningKort: 'Ingen mätning än',
  },
  /** Väggens nedräkning. */
  nedrakning: {
    dagar: (n: number) => (n === 1 ? 'dag kvar' : 'dagar kvar'),
    provet: (veckodag: string, datum: string) => `provet ${veckodag} ${datum}`,
    aria: (n: number, veckodag: string, datum: string) => `${n} ${n === 1 ? 'dag' : 'dagar'} kvar till provet ${veckodag} ${datum}`,
    andraPlanen: 'Ändra planen',
  },
  /** Nivåbandet i Nästa steg. */
  nastaBand: {
    matt: (dag: string) => `Nivån från Nivåkollen ${dag}. Det ljusa bandet är mätningens osäkerhet.`,
    nivatest: (dag: string) => `Nivån från nivåtestet ${dag}. Det ljusa bandet är mätningens osäkerhet.`,
    utanDag: 'Det ljusa bandet är mätningens osäkerhet.',
    efterTraning: (dag: string) => `Nivån efter träningen ${dag}. Det ljusa bandet är mätningens osäkerhet.`,
    provetsNiva: ' Provet ligger på avancerad nivå.',
    omatt: 'Inte mätt än. Nivåkollen ger din första nivå på cirka åtta minuter.',
    omattUtanNivakoll: 'Inte mätt än. Ett nivåtest på grundnivån ger en första nivå.',
    paborjad: 'Nivåkollen är påbörjad. Gör klart den, så får du nivån.',
  },
  /** Ingångskortet Tester. */
  ingangTester: {
    eyebrow: 'Tester',
    rubrik: (antal: string) => `${antal} tester, alla öppna`,
    rubrikGratis: (antal: string) => `${antal} tester, grundnivån gratis`,
    medPlan: (delar: string, plan: string) => `${delar} ingår i ${plan}. De andra är bra hjärnträning och förekommer i andra rekryteringstest.`,
    utanPlan: 'Alla testtyper som förekommer i rekryteringstest. Börja där du är osäker, eller där provet du ska göra ligger.',
    alla: 'Alla tester',
    allaKort: 'Alla',
    knapp: 'Öppna Tester',
    fot: 'I varje test: Träna och tre nivåer. Nivåkollen och övningsprov där de finns.',
    ingar: (namn: string) => `Ingår i ${namn}`,
    fotGratisSlut: 'Dagens grundnivåtest är gjort. Ett nytt i morgon.',
    tranatIdag: 'Tränat i dag',
    tranatIgar: 'Tränat i går',
    nivakoll: (dag: string) => `Nivåkoll ${dag}`,
    nivatest: (dag: string) => `Nivåtest ${dag}`,
    personlighet: 'Personlighet',
    personlighetRad: 'Inga rätta svar, ingen nivå',
    personlighetKort: 'Ingen nivå',
    personlighetGor: 'Gör profilen',
    personlighetGjord: 'Se profilen',
  },
  /** Ingångskortet Din utveckling. */
  ingangUtv: {
    eyebrow: 'Din utveckling',
    rubrik: (typ: string) => `Fyra veckor i ${typ}`,
    rubrikUtan: 'Fyra veckor',
    hela: 'Hela grafen',
    helaKort: 'Grafen',
    tom: 'Kurvan börjar med Nivåkollen. Varje mätning blir en punkt här, och träningen ritas in runt den.',
    historikLast: 'Utan Premium visas senaste punkten per testtyp. Hela historiken ingår i Premium.',
    saLigger: 'Så ligger du till',
    provRubrik: (namn: string, dag: string) => `${namn}, ${dag}`,
    provNasta: (dag: string) => `Nästa föreslår vi ${dag}.`,
    provNytt: 'Gör ett nytt',
    provAria: (ratt: number, antal: number) => `Senaste övningsprovet: ${ratt} av ${antal} rätt`,
    knapp: 'Öppna Din utveckling',
    fot: 'Tryck på en punkt och se uppgifterna bakom den.',
    legend: { nivakoll: 'Nivåkoll', trana: 'Träning', provdag: 'Provdagen', utanfor: (plan: string) => `Utanför ${plan}`, andra: 'Andra testtyper' },
    axel: { idag: 'i dag', provet: 'provet', provetDag: (dag: string) => `provet ${dag}`, provetsNiva: 'Avancerad, provets nivå' },
    grafAria: (typ: string, fran: string, till: string, nivaer: string) =>
      `Nivån i ${typ} från ${fran} till ${till}.${nivaer ? ` Nivåkoller: ${nivaer}.` : ' Ingen nivåkoll under perioden.'}`,
  },
  /** Dagar i rad. */
  iRadKort: {
    rubrik: 'Dagar i rad',
    dag: (n: number) => (n === 1 ? 'dag i rad' : 'dagar i rad'),
    dagKort: (n: number) => (n === 1 ? 'dag' : 'dagar'),
    ingetMal: 'Inget dagsmål valt',
    valj: 'Välj dagsmål',
    mal: (gjort: number, mal: number) => `Dagsmål ${Math.min(gjort, mal)} av ${mal} i dag`,
    andra: 'Ändra dagsmål',
    veckaAria: (gjorda: string, idag: string) => `Veckan: ${gjorda ? `tränade ${gjorda}` : 'ingen träning än'}, i dag är ${idag}`,
  },
} as const

/** Tal som ord i rubriker: "Nio tester". */
export function talOrd(n: number): string {
  const ord = ['Noll', 'Ett', 'Två', 'Tre', 'Fyra', 'Fem', 'Sex', 'Sju', 'Åtta', 'Nio', 'Tio']
  return ord[n] ?? String(n)
}

/** "Ons 19 nov": väggens datumrad. */
export function datumRad(dag: Dag): string {
  return `${veckodagVersal(dag).slice(0, 3)} ${kortDatum(dag)}`
}

/** Väljaren Plan inför provet (Ingang): dagsmålet och Avsluta planen (skissens ark). */
export const PLANVAL = {
  /** Datumstegets ledtråd utan ordet pass (utkast v4: planen föreslår, låser inte). */
  datumLedtrad: 'Datumet ger nedräkning och bana. Vi föreslår nivåkoll och ett övningsprov två dagar före, och allt är öppet hela tiden.',
  dagsmal: {
    fraga: 'Vill du ha ett dagsmål?',
    valfritt: 'valfritt',
    val: [
      { mal: 1, titel: 'Ett test om dagen', rad: 'Cirka tio minuter' },
      { mal: 2, titel: 'Två om dagen', rad: 'Träning och nivåkoll eller prov' },
      { mal: null, titel: 'Inget dagsmål', rad: 'Målet är ditt. Vi räknar inte missar.' },
    ] as const,
  },
  avsluta: {
    lank: 'Avsluta planen',
    rubrik: 'Avsluta planen?',
    text: 'Allt du gjort sparas: grafen, nivåerna och resultaten ligger kvar i Din utveckling. Du tränar vidare fritt och kan lägga en ny plan när som helst.',
    ja: 'Avsluta planen',
    nej: 'Behåll planen',
    arbetar: 'Avslutar…',
    fel: 'Det gick inte att avsluta planen. Försök igen om en stund.',
  },
} as const
