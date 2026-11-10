// src/lib/tests/prov-typer.server.ts
// =============================================================================
// Urval, visning, rättning och genomgång för provet utan konto i typerna
// utöver matrisen (spec-prov-fler-typer-2026-11-09 avsnitt 5, saas-leads
// slutliga beslut 2026-11-10). Allt återanvänder motorerna som de inloggade
// testerna kör:
//
//   figurserie, deduktiv, verbal, numerisk   Nivåkollens uppgiftFor och bedom
//   spatial, talserie, ordforrad             steg 2:s motorer (visa, bedom, genomga)
//   iprov                                    en uppgift per deltest, ur samma
//                                            pooler som I-provets övningsprov
//
// Uppgifterna lagras i anon_test_sessions.questions som referenser
// ({ k, n, s, v, u, d }): motor, nyckel, frö för alternativens ordning, nivå,
// underlag och deltest. Raden beskriver alltså sig själv; genomgången efter
// kontot läser samma referenser. Svaren lagras som { svar, selected, correct }.
//
// Facit, regel, förklaring och lösning lämnar aldrig servern före kontot:
// publikUppgift ger bara det klienten behöver för att rita uppgiften.
// =============================================================================

import 'server-only'
import { blandaSeedat, valjFigurer } from '@/lib/tester/pass-figur'
import { harnastPool } from '@/lib/figurserierV1/select'
import { DEDUKTIV_VERSION, poolFor as deduktivPool } from '@/lib/deduktivV1/select'
import { klientform, nycklarFor, passPool } from '@/lib/tester/pass-bank.server'
import { bedom as bedomNivakoll, uppgiftFor } from '@/lib/nivakoll/motor.server'
import { steg2Motor, type Niva } from '@/lib/tester/steg2/motor.server'
import { IPROV_DELAR } from '@/lib/tester/steg2/iprov'
import type { NivakollKind } from '@/lib/nivakoll/niva'
import type { BankNiva } from '@/lib/nivakoll/typer'
import type { VnUnderlag } from '@/lib/tester/pass-typer'
import {
  arNivakollUppgift,
  provAntal,
  type GenomgangUppgift,
  type NyProvTyp,
  type PublikUppgift,
  type Steg2ProvKind,
  type UppgiftKind,
} from './prov-typer'

/** En uppgift i provet, som den lagras i questions. */
export interface ProvRef {
  /** Motorn. */
  k: UppgiftKind
  /** Uppgiftens nyckel (samma id som frågestatistiken). */
  n: string
  /** Fröet för alternativens ordning: token, eller artikelns fasta frö för uppgift 1. */
  s: string
  /** Bankens nivå. */
  v: BankNiva
  /** Verbalt och numeriskt: underlagets id. */
  u?: string
  /** I-provet: deltestets nummer (1 till 6). */
  d?: number
}

export interface ProvSvar {
  /** Visat index som text, eller alternativets id (verbalt, numeriskt). Null: obesvarad. */
  svar: string | null
  /** Originalindex, -1 för obesvarad. */
  selected: number
  correct: boolean
}

const TOM_SEDDA = new Map() as Parameters<typeof valjFigurer>[2]
const IDAG = '2000-01-01'

function arRef(v: unknown): v is ProvRef {
  const r = v as ProvRef | null
  return !!r && typeof r === 'object' && typeof r.k === 'string' && typeof r.n === 'string' && typeof r.s === 'string'
}

export function lasRefs(questions: unknown): ProvRef[] | null {
  if (!Array.isArray(questions) || questions.length === 0 || !questions.every(arRef)) return null
  return questions as ProvRef[]
}

export function lasSvar(answers: unknown): ProvSvar[] {
  if (!Array.isArray(answers)) return []
  return answers.map((a) => {
    const s = a as Partial<ProvSvar> | null
    return {
      svar: typeof s?.svar === 'string' ? s.svar : null,
      selected: typeof s?.selected === 'number' ? s.selected : -1,
      correct: s?.correct === true,
    }
  })
}

/* ----------------------------------------------------------------- Urvalet */

function figurUrval(kind: 'figurserie' | 'deduktiv', seed: string): ProvRef[] {
  const antal: [BankNiva, number][] = [
    ['grund', 2],
    ['avancerad', 2],
    ['expert', 1],
  ]
  const ut: ProvRef[] = []
  const tagna = new Set<string>()
  for (const [niva, n] of antal) {
    const pool = kind === 'figurserie' ? harnastPool(niva) : deduktivPool(niva, DEDUKTIV_VERSION)
    const val = valjFigurer(pool, n, TOM_SEDDA, IDAG, `${seed}:${niva}`, tagna)
    for (const id of val.ids) {
      tagna.add(id)
      ut.push({ k: kind, n: id, s: seed, v: niva })
    }
  }
  return ut
}

/** Specen: ett underlag med fyra uppgifter ur grund och en femte ur ett andra underlag ur avancerad. */
function vnUrval(kind: 'verbal' | 'numerisk', seed: string): ProvRef[] {
  const ut: ProvRef[] = []
  for (const [niva, n] of [
    ['grund', 4],
    ['avancerad', 1],
  ] as const) {
    const u = blandaSeedat(passPool(kind, niva), `${seed}:${niva}`)[0]
    if (!u) continue
    for (const nyckel of nycklarFor(kind, u.id).slice(0, n)) ut.push({ k: kind, n: nyckel, s: seed, v: niva, u: u.id })
  }
  return ut
}

function steg2Ur(kind: Steg2ProvKind, niva: Niva, grupp: string | null, seed: string, utom: ReadonlySet<string>): string | null {
  const m = steg2Motor(kind)
  if (!m) return null
  const pool = m.pool(niva).filter((q) => !utom.has(q.id) && (grupp === null || m.gruppNyckel(q.id) === grupp))
  return blandaSeedat(pool, seed)[0]?.id ?? null
}

function steg2Urval(kind: Steg2ProvKind, seed: string): ProvRef[] {
  // Spatial: formerna blandade A, D, C, D, B (D är pappersvikning ihopvikt, I-provets
  // riktning). Talserier: tre grund, två avancerad.
  // Ordförråd: synonymer och motsatsord om vartannat, grundnivån.
  const plan: [Niva, string | null][] =
    kind === 'spatial'
      ? [
          ['grund', 'A'],
          ['grund', 'D'],
          ['grund', 'C'],
          ['avancerad', 'D'],
          ['avancerad', 'B'],
        ]
      : kind === 'talserie'
        ? [
            ['grund', null],
            ['grund', null],
            ['grund', null],
            ['avancerad', null],
            ['avancerad', null],
          ]
        : [
            ['grund', 'synonym'],
            ['grund', 'antonym'],
            ['grund', 'synonym'],
            ['grund', 'antonym'],
            ['grund', 'synonym'],
          ]
  const tagna = new Set<string>()
  const ut: ProvRef[] = []
  plan.forEach(([niva, grupp], i) => {
    const id = steg2Ur(kind, niva, grupp, `${seed}:${i}`, tagna)
    if (!id) return
    tagna.add(id)
    ut.push({ k: kind, n: id, s: seed, v: niva })
  })
  return ut
}

/** I-provet: en uppgift per deltest i provets ordning, ur samma pooler som övningsprovet, lättaste nivån först. */
function iprovUrval(seed: string): ProvRef[] {
  const ut: ProvRef[] = []
  const tagna = new Set<string>()
  for (const d of IPROV_DELAR) {
    const [niva, grupp]: [Niva, string | null] =
      d.kind === 'ordforrad'
        ? ['grund', d.form]
        : d.kind === 'talserie'
          ? ['avancerad', null]
          : d.form === 'Bklipp'
            ? ['expert', 'B']
            : ['grund', d.form]
    const id = steg2Ur(d.kind, niva, grupp, `${seed}:${d.nr}`, tagna)
    if (!id) continue
    tagna.add(id)
    ut.push({ k: d.kind, n: id, s: seed, v: niva, d: d.nr })
  }
  return ut
}

/**
 * Provets uppgifter, seedade. `urvalSeed` är token, eller artikelns fasta frö
 * när uppgift 1 visades i artikeln (då får alla besökare av artikeln samma
 * prov, och uppgift 1 är den som stod i HTML). `visaSeed` ger alternativens
 * ordning; uppgift 1 i en artikel behåller artikelns frö.
 */
export function valjProv(typ: NyProvTyp, urvalSeed: string, visaSeed: string, forstaSeed: string | null = null): ProvRef[] {
  const refs =
    typ === 'figurserie' || typ === 'deduktiv'
      ? figurUrval(typ, urvalSeed)
      : typ === 'verbal' || typ === 'numerisk'
        ? vnUrval(typ, urvalSeed)
        : typ === 'iprov'
          ? iprovUrval(urvalSeed)
          : steg2Urval(typ, urvalSeed)
  return refs.slice(0, provAntal(typ)).map((r, i) => ({ ...r, s: i === 0 && forstaSeed ? forstaSeed : visaSeed }))
}

/* ----------------------------------------------------------------- Visning */

const DELTEST_NAMN = new Map(IPROV_DELAR.map((d) => [d.nr, d.namn]))

/** Uppgiften som klienten ser. Null när banken inte längre har den. */
export function publikUppgift(r: ProvRef): PublikUppgift | null {
  const deltest = r.d ? DELTEST_NAMN.get(r.d) : undefined
  if (arNivakollUppgift(r.k)) {
    const data = uppgiftFor(r.k, r.n, r.v, r.s, r.u ? [r.u] : [])
    return data ? { kind: r.k, nyckel: r.n, data, ...(deltest ? { deltest } : {}) } : null
  }
  const m = steg2Motor(r.k)
  const data = m?.visa(r.n, r.s) ?? null
  return data ? { kind: r.k, nyckel: r.n, data, ...(deltest ? { deltest } : {}) } : null
}

/** Underlagen (verbalt och numeriskt) per id, i klientform. */
export function underlagFor(refs: readonly ProvRef[]): Record<string, VnUnderlag> {
  const ut: Record<string, VnUnderlag> = {}
  for (const r of refs) {
    if (!r.u || ut[r.u] || (r.k !== 'verbal' && r.k !== 'numerisk')) continue
    const f = klientform(r.k, r.u, r.s)
    if (f) ut[r.u] = f.underlag
  }
  return ut
}

/* ---------------------------------------------------------------- Rättning */

/** Rättar ett svar. Null-svar (obesvarad) är fel. Ogiltigt svar räknas som obesvarat. */
export function rattaSvar(r: ProvRef, svar: unknown): ProvSvar {
  const s = typeof svar === 'string' && svar.length <= 80 ? svar : typeof svar === 'number' && Number.isInteger(svar) ? String(svar) : null
  if (s === null) return { svar: null, selected: -1, correct: false }
  if (arNivakollUppgift(r.k)) {
    const u = uppgiftFor(r.k, r.n, r.v, r.s, r.u ? [r.u] : [])
    const b = u ? bedomNivakoll(r.k, u, s, r.s) : null
    return b ? { svar: s, selected: b.selected, correct: b.correct } : { svar: null, selected: -1, correct: false }
  }
  const m = steg2Motor(r.k)
  const b = m?.bedom(r.n, r.s, true, Number(s)) ?? null
  return b ? { svar: s, selected: b.selected, correct: b.correct } : { svar: null, selected: -1, correct: false }
}

/* --------------------------------------------------------------- Genomgång */

/** Genomgången efter kontot: uppgiften, rätt svar, förklaringen och hennes svar. */
export function genomgaProv(refs: readonly ProvRef[], svar: readonly ProvSvar[]): GenomgangUppgift[] {
  const ut: GenomgangUppgift[] = []
  refs.forEach((r, i) => {
    const s = svar[i] ?? { svar: null, selected: -1, correct: false }
    const deltest = r.d ? DELTEST_NAMN.get(r.d) : undefined
    if (arNivakollUppgift(r.k)) {
      const data = uppgiftFor(r.k, r.n, r.v, r.s, r.u ? [r.u] : [])
      const b = data ? bedomNivakoll(r.k, data, s.svar, r.s) : null
      if (!data || !b) return
      ut.push({ kind: r.k, nyckel: r.n, data, genomgang: { ...b.genomgang, valt: s.svar, correct: s.correct }, seed: r.s, ...(deltest ? { deltest } : {}) })
      return
    }
    const m = steg2Motor(r.k)
    const data = m?.visa(r.n, r.s) ?? null
    if (!m || !data) return
    const valt = s.svar === null ? null : Number(s.svar)
    ut.push({ kind: r.k, nyckel: r.n, data, genomgang: m.genomga(r.n, r.s), valt, correct: s.correct, seed: r.s, ...(deltest ? { deltest } : {}) })
  })
  return ut
}

/** Positionerna som blev fel eller lämnades obesvarade. */
export function felPositioner(svar: readonly ProvSvar[], antal: number): number[] {
  const fel: number[] = []
  for (let i = 0; i < antal; i++) if (!svar[i]?.correct) fel.push(i)
  return fel
}

/* ------------------------------------------------------- Uppgift 1 i artikeln */

/** Artikelns fasta frö: samma uppgift 1 för alla besökare, samma HTML i cachen. */
export function artikelSeed(typ: NyProvTyp, slug: string): string {
  return `artikel:${typ}:${slug}`
}

/** Uppgift 1 för en artikel, utan facit, med underlaget när typen har ett. */
export function artikelUppgift(typ: NyProvTyp, slug: string): { uppgift: PublikUppgift; underlag: Record<string, VnUnderlag> } | null {
  const seed = artikelSeed(typ, slug)
  const refs = valjProv(typ, seed, seed, seed)
  const forsta = refs[0]
  if (!forsta) return null
  const uppgift = publikUppgift(forsta)
  return uppgift ? { uppgift, underlag: underlagFor([forsta]) } : null
}

/** Nivåkollens typ för en provtyp, eller null (steg 2:s typer och I-provet saknar Nivåkoll). */
export function nivakollKindFor(typ: NyProvTyp): NivakollKind | null {
  return typ === 'figurserie' || typ === 'deduktiv' || typ === 'verbal' || typ === 'numerisk' ? typ : null
}

