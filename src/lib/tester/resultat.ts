/**
 * Resultatsidans räkning (tester-lyftet, skiss Provbladet avsnitt 3).
 *
 * Ren logik utan React och utan frågebank, så att den går att testa i vitest
 * och köras på servern. Varje testtyp gör om sina svar till en lista
 * ResultatFraga i den ordning hon såg frågorna; resten räknas lika för alla:
 *
 * - missarna (fel och obesvarade), som genomgången visar som små provblad
 * - "Var du tappade": grupper (familj, svarstyp, uppgiftstyp) med minst två
 *   frågor i sessionen, svagast först
 * - tempot mot provets tid, när svaren har tid per fråga. Hänger flera
 *   påståenden eller frågor på samma underlag (verbalt grund och avancerad,
 *   numeriskt, verbala provet) räknas tempot per underlag: lästiden hör till
 *   texten, inte till första påståendet (testansvarig 2026-10-11, punkt 2)
 *
 * Gamla sessioner (answers som objekt, före blandningen, utan meta, ur en
 * äldre frågebank) ger en tom lista. Sidan visar då poängen och tiden, och
 * säger att genomgången saknas, i stället för att krascha eller gissa.
 */

import { visningstitel } from './titel'

export type Utfall = 'ratt' | 'fel' | 'obesvarad'

export interface ResultatFraga {
  /** Ettbaserat nummer i visad ordning. */
  nr: number
  id: string
  utfall: Utfall
  /** Sekunder på frågan, null när sessionen inte mätte det. */
  tid: number | null
  /** Familj, svarstyp eller uppgiftstyp. null när den inte går att avgöra. */
  grupp: string | null
  /** Verbalt och numeriskt: påståendet eller frågan, för miniatyren. */
  text?: string | null
  /** Underlagets ämne, till exempel "Försäljningsanalys". */
  kalla?: string | null
  /** Underlagets id (texten eller tabellen) när frågan hänger på ett. */
  underlagId?: string | null
}

/** En stapel i tempot: en fråga, eller ett underlag med alla sina frågor. */
export interface TempoStapel {
  /** Ettbaserat ordningstal (frågans eller underlagets). */
  nr: number
  /** Sekunder, summan för ett underlag. null när inget mättes. */
  tid: number | null
  /** Rätt bara när alla frågor i underlaget är rätt. */
  utfall: Utfall
  /** Provets tid för stapeln: tid per fråga gånger antal frågor. */
  budget: number
  /** Antal frågor eller påståenden i stapeln. */
  antal: number
  /** Antal rätt av dem. */
  ratt: number
}

export interface Grupp {
  namn: string
  ratt: number
  totalt: number
}

export interface Tempo {
  /** Vad staplarna är: frågor (matris, verbalt expert) eller underlag. */
  enhet: 'fraga' | 'underlag'
  /** Provets tid per fråga, eller per underlag av vanlig storlek, i sekunder. */
  budget: number
  /** Antal enheter med mätt tid över sin budget. */
  over: number
  /** Antal enheter med mätt tid. */
  matta: number
  /** Snittid per mätt enhet, hela sekunder. */
  snitt: number
  /** Den långsammaste enheten som blev rätt och gick över budgeten. */
  langsammastRatt: { nr: number; tid: number; antal: number } | null
  /** Staplarna i visad ordning. */
  staplar: TempoStapel[]
}

export interface ResultatAnalys {
  fragor: ResultatFraga[]
  /** Numren på fel och obesvarade frågor, i ordning. */
  missar: number[]
  /** Grupper med minst två frågor, svagast först. */
  grupper: Grupp[]
  /** Svagaste gruppen när den inte är full pott. */
  svagast: Grupp | null
  tempo: Tempo | null
}

/** Minsta antal frågor i en grupp för att den ska räknas (skissen: minst två). */
export const MINSTA_GRUPP = 2

/** Provets tid per fråga: provtiden om den finns, annars testets minuter. */
export function budgetPerFraga(minuter: number, antal: number): number {
  if (!antal || !minuter) return 0
  return Math.round((minuter * 60) / antal)
}

/**
 * "Sitter" (testansvarig 2026-10-11, punkt 3): 85 procent, högst två missar
 * på de korta testen. Samma tal i Din utveckling (Nivåerna) och i
 * resultatsidans statusrad.
 */
export const SITTER_PROCENT = 85

/** Medianen av de upp till tre senaste värdena, null utan värden. */
export function medianSenaste(varden: readonly number[], antal = 3): number | null {
  const v = varden.slice(-antal).slice().sort((a, b) => a - b)
  if (v.length === 0) return null
  const m = Math.floor(v.length / 2)
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2
}

/**
 * Slår ihop frågor på samma underlag till en stapel. Tiden är summan av
 * de mätta tiderna (null om ingen mättes), utfallet rätt bara när alla är
 * rätt. Frågor utan underlag blir en stapel var.
 */
export function perUnderlag(fragor: readonly ResultatFraga[], budgetPerFraga: number): TempoStapel[] {
  const ut: (TempoStapel & { nyckel: string })[] = []
  for (const f of fragor) {
    const nyckel = f.underlagId ?? `fraga:${f.id}`
    let st = ut.find((x) => x.nyckel === nyckel)
    if (!st) {
      st = { nyckel, nr: ut.length + 1, tid: null, utfall: 'ratt', budget: 0, antal: 0, ratt: 0 }
      ut.push(st)
    }
    st.antal += 1
    st.budget = budgetPerFraga * st.antal
    if (f.utfall === 'ratt') st.ratt += 1
    else st.utfall = 'fel'
    if (typeof f.tid === 'number' && f.tid > 0) st.tid = (st.tid ?? 0) + f.tid
  }
  return ut.map(({ nyckel: _n, ...st }) => st)
}

export function analysera(fragor: ResultatFraga[], budget: number): ResultatAnalys {
  const missar = fragor.filter((f) => f.utfall !== 'ratt').map((f) => f.nr)

  const perGrupp = new Map<string, Grupp>()
  for (const f of fragor) {
    if (!f.grupp) continue
    const g = perGrupp.get(f.grupp) ?? { namn: f.grupp, ratt: 0, totalt: 0 }
    g.totalt += 1
    if (f.utfall === 'ratt') g.ratt += 1
    perGrupp.set(f.grupp, g)
  }
  const grupper = [...perGrupp.values()]
    .filter((g) => g.totalt >= MINSTA_GRUPP)
    // Svagast först, sedan flest frågor, sedan namnet, så ordningen är stabil.
    .sort((a, b) => a.ratt / a.totalt - b.ratt / b.totalt || b.totalt - a.totalt || a.namn.localeCompare(b.namn, 'sv'))
  const svagast = grupper.length > 0 && grupper[0].ratt < grupper[0].totalt ? grupper[0] : null

  // Per underlag när minst ett underlag bär flera frågor, annars per fråga.
  const underlag = perUnderlag(fragor, budget)
  const enhet: Tempo['enhet'] = underlag.length < fragor.length ? 'underlag' : 'fraga'
  const staplar: TempoStapel[] =
    enhet === 'underlag'
      ? underlag
      : fragor.map((f) => ({
          nr: f.nr,
          tid: typeof f.tid === 'number' && f.tid > 0 ? f.tid : null,
          utfall: f.utfall,
          budget,
          antal: 1,
          ratt: f.utfall === 'ratt' ? 1 : 0,
        }))
  const matta = staplar.filter((st) => typeof st.tid === 'number' && st.tid > 0)
  let tempo: Tempo | null = null
  if (budget > 0 && matta.length > 0 && matta.length >= Math.ceil(staplar.length / 2)) {
    const over = matta.filter((st) => (st.tid as number) > st.budget)
    const langsamRatt = over
      .filter((st) => st.utfall === 'ratt')
      .sort((a, b) => (b.tid as number) - (a.tid as number))[0]
    // Rubrikens budget: underlagets vanligaste storlek.
    const storlekar = staplar.map((st) => st.antal)
    const vanligast = storlekar.sort((a, b) => storlekar.filter((x) => x === b).length - storlekar.filter((x) => x === a).length)[0] ?? 1
    tempo = {
      enhet,
      budget: budget * vanligast,
      over: over.length,
      matta: matta.length,
      snitt: Math.round(matta.reduce((s, st) => s + (st.tid as number), 0) / matta.length),
      langsammastRatt: langsamRatt ? { nr: langsamRatt.nr, tid: langsamRatt.tid as number, antal: langsamRatt.antal } : null,
      staplar,
    }
  }

  return { fragor, missar, grupper, svagast, tempo }
}

/* ------------------------------ Adaptrarna ------------------------------ */

type Svar = Record<string, unknown>

function sekunder(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.round(v) : null
}

/** answers kan vara ett objekt i gamla sessioner. Bara objekt i en lista räknas. */
export function svarslista(answers: unknown): Svar[] {
  return Array.isArray(answers) ? answers.filter((a): a is Svar => !!a && typeof a === 'object') : []
}

/** Matrislogik: genomgångens frågor i visad ordning, svaren på q_id. */
export function fragorMatris(
  genomgang: { id: string; family?: string | null }[],
  answers: unknown,
  familjNamn: (id: string | null | undefined) => string | null
): ResultatFraga[] {
  const svar = svarslista(answers)
  if (genomgang.length === 0) return []
  // Svar ur en äldre frågebank matchar inte dagens urval: ingen genomgång.
  if (svar.length > 0 && !svar.some((a) => genomgang.some((q) => q.id === a.q_id))) return []
  if (svar.length === 0) return []
  return genomgang.map((q, i) => {
    const a = svar.find((s) => s.q_id === q.id)
    return {
      nr: i + 1,
      id: q.id,
      utfall: !a ? 'obesvarad' : a.correct === true ? 'ratt' : 'fel',
      tid: a ? sekunder(a.time_spent) : null,
      grupp: familjNamn(q.family ?? null),
    }
  })
}

const SVARSTYP: Record<string, string> = {
  true: 'Sant',
  false: 'Falskt',
  cannot_say: 'Går inte att avgöra',
}

const UPPGIFTSTYP: Record<string, string> = {
  table: 'Tabeller',
  graph: 'Diagram',
  word_problem: 'Textuppgifter',
  series: 'Talserier',
  conversion: 'Omvandlingar',
}

interface PassageLik {
  id: string
  topic?: string
  title?: string
  type?: string
  statements?: { text: string; correctAnswer: string }[]
  questions?: { id: string; questionText: string }[]
}

/**
 * Verbalt och numeriskt: underlagen i visad ordning. Verbalt grund,
 * avancerad och prov har påståenden (svar på passageId + statementIndex,
 * grupperade på rätt svarstyp). Numeriskt och verbalt expert har frågor
 * (svar på questionId, grupperade på uppgiftstyp när den säger något).
 */
export function fragorUnderlag(passages: PassageLik[], answers: unknown, gruppera: 'svarstyp' | 'uppgiftstyp' | 'ingen'): ResultatFraga[] {
  const svar = svarslista(answers)
  if (svar.length === 0 || passages.length === 0) return []
  const ut: ResultatFraga[] = []
  for (const p of passages) {
    if (Array.isArray(p.statements)) {
      p.statements.forEach((st, j) => {
        const a = svar.find((s) => s.passageId === p.id && s.statementIndex === j)
        const besvarad = !!a && a.answer !== null && a.answer !== undefined
        ut.push({
          nr: ut.length + 1,
          id: `${p.id}:${j}`,
          utfall: !besvarad ? 'obesvarad' : a!.isCorrect === true ? 'ratt' : 'fel',
          tid: a ? sekunder(a.timeSpent) : null,
          grupp: gruppera === 'svarstyp' ? SVARSTYP[st.correctAnswer] ?? null : null,
          text: st.text,
          kalla: p.topic ?? (p.title ? visningstitel(p.title) : null),
          underlagId: p.id,
        })
      })
    } else if (Array.isArray(p.questions)) {
      for (const q of p.questions) {
        const a = svar.find((s) => s.questionId === q.id)
        const besvarad = !!a && typeof a.selectedAnswerId === 'string' && a.selectedAnswerId !== ''
        ut.push({
          nr: ut.length + 1,
          id: q.id,
          utfall: !besvarad ? 'obesvarad' : a!.isCorrect === true ? 'ratt' : 'fel',
          tid: a ? sekunder(a.timeSpent) : null,
          grupp: gruppera === 'uppgiftstyp' ? UPPGIFTSTYP[p.type ?? ''] ?? null : null,
          text: q.questionText,
          kalla: p.topic ?? (p.title ? visningstitel(p.title) : null),
          underlagId: p.id,
        })
      }
    }
  }
  // Inget svar hör till de här underlagen: sessionen är ur en äldre bank.
  if (!ut.some((f) => f.utfall !== 'obesvarad')) return []
  return ut
}

/* -------------------------------- Texten -------------------------------- */

const ORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv', 'tretton', 'fjorton', 'femton', 'sexton', 'sjutton', 'arton', 'nitton', 'tjugo']

/** Talet i ord upp till tjugo, annars siffror. `ett` för neutrum. */
export function ordTal(n: number, neutrum = false): string {
  if (n === 1 && neutrum) return 'ett'
  return n >= 0 && n < ORD.length ? ORD[n] : String(n)
}

export function versal(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Minuter och sekunder, 17:35. */
export function minSek(sek: number): string {
  const s = Math.max(0, Math.round(sek))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
