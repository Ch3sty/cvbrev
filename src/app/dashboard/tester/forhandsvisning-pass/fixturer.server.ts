// Fixturerna för förhandsvisningen av våg 3b (bara utvecklare, se page.tsx).
// Bara server: läser bankerna med facit. Importeras bara av page.tsx (och
// testerna); klientdelen tar bara typerna.
//
// Riktiga V7-frågor ur banken, blandade med samma funktion som i passet
// (permutationForSession) och vända till klientens form med motorns egen
// sessionsvy(), så att det som ritas är exakt det passet ritar. Talen är
// spec-rummens exempeltal (bilaga, avsnitt 11): mätning tisdag 6 oktober
// 5,0; pass 7, 8, 9 oktober 5,2, 5,1, 5,4; lördag 10 oktober 7 av 9 och
// 5,6; ommätning tisdag 13 oktober 5,8 (Första veckan); prov lördag 24
// oktober, sikte 6,5, Matrigma klassisk (68 s per uppgift).

import { permutationForSession, tillVisat } from '@/lib/logicTestV7/blanda'
import { visaFraga } from '@/lib/logicTestV7/visning'
import type { VisadFraga } from '@/lib/logicTestV7/layered.v7'
import { familjFor, hittaTraningsfraga, misstagFor } from '@/lib/traning/bank.server'
import type { Dag } from '@/lib/traning/datum'
import type { Familjestatistik } from '@/lib/traning/familjer'
import type { Fixtur, FixturFacit } from '@/lib/traning/fixturApi'
import type { SparatSvar, TraningsMeta } from '@/lib/traning/historik'
import { imorgonRad } from '@/lib/traning/imorgon'
import type { Avslut, Sessionsvy, Traningsstatus } from '@/lib/traning/klient'
import { forstaVeckanSammanfattning, type MilstolpeNyckel, type Nivapunkt, type SlutfordSession } from '@/lib/traning/milstolpar'
import { sessionsvy } from '@/lib/traning/motor.server'
import { byggPlan } from '@/lib/traning/plan'
import { raknaSerie } from '@/lib/traning/serie'
import { PROVFORMAT } from '@/lib/traning/tempo'
import { kvitto, type Kvitto } from '@/lib/traning/resultat'

export type Ram = 'P1' | 'P2' | 'P3' | 'P4' | 'S1' | 'M0' | 'M1' | 'O1' | 'K1' | 'uppvarmning'
export const RAMAR: readonly Ram[] = ['P1', 'P2', 'P3', 'P4', 'S1', 'M0', 'M1', 'O1', 'K1', 'uppvarmning']

const PROV: Dag = '2026-10-24'
const START: Dag = '2026-10-06'
const SIKTE = 6.5
const FORMAT = PROVFORMAT.matrigma_klassisk

/* ----------------------------------------------------------------- frågor */

/** Passet lördag 10 oktober: tema rotation med byte (P1 till P4). */
const PASS_FRAGOR: { id: string; ratt: boolean; tid: number }[] = [
  { id: 'v7g-3c-byte-01', ratt: true, tid: 31 },
  { id: 'v7g-3c-lant-01', ratt: true, tid: 26 },
  { id: 'v7g-3c-byte-02', ratt: false, tid: 52 },
  { id: 'v7g-3c-byte-03', ratt: true, tid: 75 },
  { id: 'v7g-3c-speg-01', ratt: true, tid: 37 },
  { id: 'v7g-3c-byte-04', ratt: true, tid: 33 },
  { id: 'v7g-3c-byte-05', ratt: true, tid: 71 },
  { id: 'v7g-3c-lant-02', ratt: false, tid: 58 },
  { id: 'v7g-q28-vector-len-walk', ratt: true, tid: 29 },
]

/** Passet torsdag 8 oktober där nivån sjönk (S1): fyra missar, tre i speglingar. */
const S1_FRAGOR: { id: string; ratt: boolean; tid: number }[] = [
  { id: 'v7g-3c-lant-03', ratt: true, tid: 30 },
  { id: 'v7g-3c-speg-02', ratt: false, tid: 45 },
  { id: 'v7g-3c-byte-01', ratt: true, tid: 35 },
  { id: 'v7g-3c-speg-03', ratt: false, tid: 80 },
  { id: 'v7g-3c-over-01', ratt: true, tid: 40 },
  { id: 'v7g-3c-speg-04', ratt: false, tid: 75 },
  { id: 'v7g-3c-antal-01', ratt: true, tid: 30 },
  { id: 'v7g-3c-lant-01', ratt: false, tid: 50 },
  { id: 'v7g-3c-byte-02', ratt: true, tid: 70 },
]

/** Mätningen: sju nya frågor, fem räknas från smakprovet. */
const MATNING_FRAGOR = ['v7g-3c-lant-03', 'v7g-3c-byte-01', 'v7g-3c-speg-02', 'v7g-3c-over-02', 'v7g-3c-byte-03', 'v7g-3c-tva-01', 'v7g-3c-lant-02']
const SMAKPROV = ['v7g-q3-vector-rotation', 'v7g-q5-tally-latin', 'v7g-q6-orbital-walk', 'v7g-q10-poly-fill-latin', 'v7g-q14-stack-base-latin']

const UPPVARMNING = ['v7g-3c-lant-01', 'v7g-3c-antal-01', 'v7g-3c-over-01']

function fraga(id: string) {
  const q = hittaTraningsfraga(id)
  if (!q) throw new Error(`fixturfrågan ${id} finns inte i banken`)
  return q
}

/** Var rätt svar står och misstaget per visat alternativ, för sessionens blandning. */
function facitFor(sessionId: string, id: string): FixturFacit {
  const q = fraga(id)
  const perm = permutationForSession(sessionId, q, true)
  return {
    rattVisat: tillVisat(perm, q.correctAnswer),
    regel: q.rule,
    misstag: perm.map((orig) => (orig === q.correctAnswer ? null : misstagFor(q, orig))),
    family: familjFor(q),
  }
}

/** Det visade alternativ hon "valde": rätt, eller det första fel med ett misstag. */
function valtVisat(sessionId: string, id: string, ratt: boolean): number {
  const f = facitFor(sessionId, id)
  if (ratt) return f.rattVisat
  const medText = f.misstag.findIndex((m, v) => v !== f.rattVisat && m)
  return medText >= 0 ? medText : (f.rattVisat + 1) % f.misstag.length
}

function sparat(sessionId: string, id: string, ratt: boolean, tid: number): SparatSvar {
  const q = fraga(id)
  const perm = permutationForSession(sessionId, q, true)
  const visat = valtVisat(sessionId, id, ratt)
  const selected = perm[visat]
  return { q_id: id, selected, visat, correct: selected === q.correctAnswer, time_spent: tid }
}

function bygg(args: {
  id: string
  typ: TraningsMeta['typ']
  dag: Dag
  ids: string[]
  svar: { id: string; ratt: boolean; tid: number }[]
  avslutad: boolean
  niva_fore: number | null
  tema?: string | null
  antal?: number
  smakprov?: string[]
}): { vy: Sessionsvy; facit: Record<string, FixturFacit> } {
  const meta: TraningsMeta = {
    alternativ_blandade: true,
    traning: 1,
    typ: args.typ,
    test_kind: 'matris',
    variant: 'niva',
    dag: args.dag,
    antal: args.antal ?? args.ids.length,
    adaptiv: false,
    fragor: args.ids,
    tema: args.tema ?? null,
    family: null,
    sammansattning: null,
    format: FORMAT.nyckel,
    budget_s: FORMAT.budget_s,
    tidsgrans_s: null,
    niva_fore: args.niva_fore,
    malniva: null,
    ateranvanda: 0,
    upprepade: [],
    ...(args.smakprov
      ? { smakprov: { token: 'fixtur', dag: START, svar: args.smakprov.map((q_id, i) => ({ q_id, correct: i !== 2 })) } }
      : {}),
  }
  const answers = args.svar.map((s) => sparat(args.id, s.id, s.ratt, s.tid))
  const rad = {
    id: args.id,
    test_type: 'matrislogik-pass',
    meta,
    answers,
    created_at: `${args.dag}T07:00:00Z`,
    started_at: `${args.dag}T07:00:00Z`,
    completed_at: args.avslutad ? `${args.dag}T07:10:00Z` : null,
  }
  const vy = sessionsvy(rad)
  if (!vy) throw new Error('fixturens meta gick inte att läsa')
  return { vy, facit: Object.fromEntries(args.ids.map((id) => [id, facitFor(args.id, id)])) }
}

/* ----------------------------------------------------------------- läget */

function stat(family: string, ratt: number, antal: number, langsamma = 0): Familjestatistik {
  return { family, ratt, antal, andel: antal ? ratt / antal : 0, ratt_men_langsamma: langsamma }
}

function status(args: {
  idag: Dag
  punkter: Nivapunkt[]
  sessioner: SlutfordSession[]
  betalande: boolean
  milstolpar?: { nyckel: MilstolpeNyckel; dag: Dag }[]
}): Traningsstatus {
  const aktiva = [...new Set(args.sessioner.map((s) => s.dag))].sort()
  const milstolpar = (args.milstolpar ?? []).map((m) => ({ nyckel: m.nyckel, nadd_at: `${m.dag}T08:00:00Z`, visad_at: null }))
  const punkter = args.betalande ? args.punkter : args.punkter.slice(-1)
  return {
    idag: args.idag,
    plan: {
      user_id: 'fixtur',
      testtyper: ['matris'],
      leverantor: 'matrigma',
      variant: 'klassisk',
      provdatum: PROV,
      sikte: SIKTE,
      utfall: null,
      utfall_svarat_at: null,
      utfall_fraga_igen_at: null,
    },
    format: {
      nyckel: FORMAT.nyckel,
      namn: FORMAT.namn,
      antal: FORMAT.antal,
      minuter: FORMAT.minuter,
      budget_s: FORMAT.budget_s,
      adaptiv: FORMAT.adaptiv,
      cirka: FORMAT.cirka,
      tidsform: FORMAT.tidsform,
      anmarkning: FORMAT.anmarkning,
    },
    niva: args.punkter[args.punkter.length - 1]?.niva ?? null,
    punkter,
    historikLast: !args.betalande,
    nyPunkt: true,
    plandagar: byggPlan({ start: START, prov: PROV, idag: args.idag, aktivaDagar: aktiva, betalande: args.betalande }),
    serie: raknaSerie({ aktivaDagar: aktiva, idag: args.idag, provdatum: PROV }),
    form: null,
    aktivitet: { pass: 0, ommatningar: 0, generalrepetitioner: 0, matningar: 1 },
    varDuTappar: { svagaste: [], langsamma: [] },
    milstolpar,
    ovisade: milstolpar.map((m) => m.nyckel),
    dagensPassGjort: false,
    dagarKvar: Math.round((Date.UTC(2026, 9, 24) - Date.parse(`${args.idag}T00:00:00Z`)) / 86_400_000),
    forstaVeckan: milstolpar.some((m) => m.nyckel === 'forsta_veckan') ? forstaVeckanSammanfattning(START, args.sessioner) : null,
    fragaEfterProvet: false,
  }
}

const PUNKTER: Nivapunkt[] = [
  { dag: '2026-10-06', typ: 'matning', niva: 5.0 },
  { dag: '2026-10-07', typ: 'pass', niva: 5.2 },
  { dag: '2026-10-08', typ: 'pass', niva: 5.1 },
  { dag: '2026-10-09', typ: 'pass', niva: 5.4 },
  { dag: '2026-10-10', typ: 'pass', niva: 5.6 },
  { dag: '2026-10-12', typ: 'pass', niva: 5.7 },
  { dag: '2026-10-13', typ: 'ommatning', niva: 5.8 },
]

function sessionerTill(dag: Dag): SlutfordSession[] {
  return PUNKTER.filter((p) => p.dag <= dag).map((p) => ({ dag: p.dag, typ: p.typ === 'matning' ? 'matning' : p.typ === 'ommatning' ? 'ommatning' : 'pass' }))
}

function avslut(a: Partial<Avslut> & Pick<Avslut, 'typ' | 'ratt' | 'antal'>): Avslut {
  return {
    niva_fore: null,
    niva_efter: null,
    over_tid: 0,
    snitt_s: null,
    budget_s: FORMAT.budget_s,
    tempo: { over_tid: a.over_tid ?? 0, antal_nara: a.antal, snitt_s: a.snitt_s ?? null, langsamma: [], budget_s: FORMAT.budget_s },
    familjer: { passet: [], svagaste: [], langsamma: [] },
    imorgon: { typ: 'pass', text: 'I morgon: nästa pass', dag: '2026-10-11' },
    milstolpar: [],
    sikte: SIKTE,
    tid_s: 0,
    ...a,
  }
}

/* ------------------------------------------------------------------ ramar */

export type Forhandsdata =
  | { ram: 'P1' | 'P2' | 'P3' | 'M0'; fixtur: Fixtur; initial: { idx: number; fas?: 'aterkoppling'; vald?: number | null; klar?: boolean }; fastTid: number | null; betalande: boolean }
  | { ram: 'P4' | 'S1' | 'M1' | 'O1'; fixtur: Fixtur; resultat: { avslut: Avslut; vy: Sessionsvy; status: Traningsstatus }; betalande: boolean }
  | { ram: 'K1'; kvitto: Kvitto }
  | { ram: 'uppvarmning'; fragor: VisadFraga[]; facit: Record<string, { rattVisat: number; regel: string }> }

const PASS_ID = '0f3b0c7e-1a2b-4c3d-8e9f-0a1b2c3d4e10'
const S1_ID = '0f3b0c7e-1a2b-4c3d-8e9f-0a1b2c3d4e08'
const M_ID = '0f3b0c7e-1a2b-4c3d-8e9f-0a1b2c3d4e06'
const O_ID = '0f3b0c7e-1a2b-4c3d-8e9f-0a1b2c3d4e13'

export function byggForhandsdata(ram: Ram, opt: { betalande?: boolean } = {}): Forhandsdata {
  const P4_AVSLUT = avslut({
    typ: 'pass',
    niva_fore: 5.4,
    niva_efter: 5.6,
    ratt: 7,
    antal: 9,
    over_tid: 2,
    snitt_s: 44,
    familjer: {
      passet: [stat('rotation-med-byte', 5, 6, 2), stat('latin-antal', 1, 2), stat('spegling', 1, 1)],
      svagaste: [stat('rotation-med-byte', 8, 12), stat('latin-antal', 4, 7)],
      langsamma: [stat('spegling', 4, 5, 3)],
    },
    imorgon: (() => {
      const i = imorgonRad({ idag: '2026-10-10', start: START, prov: PROV, ratt: 7, antal: 9 })
      return { typ: i.typ, text: i.text, dag: i.dag }
    })(),
    tid_s: PASS_FRAGOR.reduce((s, f) => s + f.tid, 0),
  })
  const passStatus = status({ idag: '2026-10-10', punkter: PUNKTER.slice(0, 5), sessioner: sessionerTill('2026-10-10'), betalande: true, milstolpar: [{ nyckel: 'forsta_matningen', dag: START }] })

  switch (ram) {
    case 'P1':
    case 'P2':
    case 'P3': {
      const n = ram === 'P1' ? 2 : ram === 'P2' ? 3 : 9
      const { vy, facit } = bygg({
        id: PASS_ID,
        typ: 'pass',
        dag: '2026-10-10',
        ids: PASS_FRAGOR.map((f) => f.id),
        svar: PASS_FRAGOR.slice(0, n),
        avslutad: false,
        niva_fore: 5.4,
        tema: 'rotation-med-byte',
      })
      const fixtur: Fixtur = { vy, facit, avslut: P4_AVSLUT, status: passStatus }
      if (ram === 'P1') return { ram, fixtur, initial: { idx: 2 }, fastTid: 38, betalande: true }
      const idx = n - 1
      const id = PASS_FRAGOR[idx].id
      return {
        ram,
        fixtur,
        initial: { idx, fas: 'aterkoppling', vald: valtVisat(PASS_ID, id, PASS_FRAGOR[idx].ratt), klar: ram === 'P3' },
        fastTid: PASS_FRAGOR[idx].tid,
        betalande: true,
      }
    }
    case 'P4': {
      const { vy, facit } = bygg({ id: PASS_ID, typ: 'pass', dag: '2026-10-10', ids: PASS_FRAGOR.map((f) => f.id), svar: PASS_FRAGOR, avslutad: true, niva_fore: 5.4, tema: 'rotation-med-byte' })
      return { ram, fixtur: { vy, facit, avslut: P4_AVSLUT, status: passStatus }, resultat: { avslut: P4_AVSLUT, vy, status: passStatus }, betalande: true }
    }
    case 'S1': {
      const { vy, facit } = bygg({ id: S1_ID, typ: 'pass', dag: '2026-10-08', ids: S1_FRAGOR.map((f) => f.id), svar: S1_FRAGOR, avslutad: true, niva_fore: 5.2, tema: 'spegling' })
      const st = status({ idag: '2026-10-08', punkter: PUNKTER.slice(0, 3), sessioner: sessionerTill('2026-10-08'), betalande: true, milstolpar: [{ nyckel: 'forsta_matningen', dag: START }] })
      const i = imorgonRad({ idag: '2026-10-08', start: START, prov: PROV, ratt: 5, antal: 9 })
      const a = avslut({
        typ: 'pass',
        niva_fore: 5.2,
        niva_efter: 5.1,
        ratt: 5,
        antal: 9,
        over_tid: 3,
        snitt_s: 51,
        familjer: { passet: [stat('spegling', 0, 3), stat('latin-antal', 1, 2), stat('rotation-med-byte', 2, 2)], svagaste: [stat('spegling', 1, 4)], langsamma: [] },
        imorgon: { typ: i.typ, text: i.text, dag: i.dag },
        tid_s: S1_FRAGOR.reduce((s, f) => s + f.tid, 0),
      })
      return { ram, fixtur: { vy, facit, avslut: a, status: st }, resultat: { avslut: a, vy, status: st }, betalande: true }
    }
    case 'M0':
    case 'M1': {
      const betalande = opt.betalande === true
      const svar = MATNING_FRAGOR.map((id, i) => ({ id, ratt: i !== 2 && i !== 6, tid: [48, 41, 77, 56, 70, 44, 81][i] }))
      const { vy, facit } = bygg({
        id: M_ID,
        typ: 'matning',
        dag: START,
        ids: MATNING_FRAGOR,
        svar: ram === 'M1' ? svar : [],
        avslutad: ram === 'M1',
        niva_fore: null,
        antal: 12,
        smakprov: SMAKPROV,
      })
      const st = status({ idag: START, punkter: PUNKTER.slice(0, 1), sessioner: sessionerTill(START), betalande, milstolpar: [{ nyckel: 'forsta_matningen', dag: START }] })
      const a = avslut({
        typ: 'matning',
        niva_efter: 5.0,
        ratt: 9,
        antal: 12,
        over_tid: 3,
        snitt_s: 52,
        familjer: { passet: [], svagaste: [stat('rotation-med-byte', 1, 3), stat('latin-antal', 2, 4)], langsamma: [stat('spegling', 4, 4, 3)] },
        imorgon: (() => {
          const i = imorgonRad({ idag: START, start: START, prov: PROV, ratt: 9, antal: 12, grundpass: !betalande })
          return { typ: i.typ, text: i.text, dag: i.dag }
        })(),
        milstolpe: 'forsta_matningen',
        milstolpar: ['forsta_matningen'],
        tid_s: 417,
      })
      const fixtur: Fixtur = { vy, facit, avslut: a, status: st }
      if (ram === 'M0') return { ram, fixtur, initial: { idx: 0 }, fastTid: 21, betalande }
      return { ram, fixtur, resultat: { avslut: a, vy, status: st }, betalande }
    }
    case 'O1':
    case 'K1': {
      const st = status({
        idag: '2026-10-13',
        punkter: PUNKTER,
        sessioner: sessionerTill('2026-10-13'),
        betalande: true,
        milstolpar: [
          { nyckel: 'forsta_matningen', dag: START },
          { nyckel: 'forsta_veckan', dag: '2026-10-13' },
        ],
      })
      if (ram === 'K1') return { ram, kvitto: kvitto('forsta_veckan', st, { betalande: true }) }
      const svar = MATNING_FRAGOR.concat(['v7g-3c-byte-04', 'v7g-3c-lant-01', 'v7g-3c-speg-01', 'v7g-3c-antal-01', 'v7g-3c-over-01']).map((id, i) => ({
        id,
        ratt: i !== 3 && i !== 9,
        tid: [40, 38, 52, 71, 45, 42, 50, 39, 44, 47, 36, 41][i],
      }))
      const { vy, facit } = bygg({ id: O_ID, typ: 'ommatning', dag: '2026-10-13', ids: svar.map((s) => s.id), svar, avslutad: true, niva_fore: 5.7, antal: 12 })
      const i = imorgonRad({ idag: '2026-10-13', start: START, prov: PROV, ratt: 10, antal: 12 })
      const a = avslut({
        typ: 'ommatning',
        niva_fore: 5.7,
        niva_efter: 5.8,
        ratt: 10,
        antal: 12,
        over_tid: 1,
        snitt_s: 45,
        imorgon: { typ: i.typ, text: i.text, dag: i.dag },
        milstolpe: 'forsta_veckan',
        milstolpar: ['forsta_veckan'],
        tid_s: 545,
      })
      return { ram: 'O1', fixtur: { vy, facit, avslut: a, status: st }, resultat: { avslut: a, vy, status: st }, betalande: true }
    }
    case 'uppvarmning': {
      const seed = 'uppvarmning:fixtur:2026-10-24'
      const fragor = UPPVARMNING.map((id) => visaFraga(fraga(id), seed, true))
      const facit = Object.fromEntries(
        UPPVARMNING.map((id) => {
          const f = facitFor(seed, id)
          return [id, { rattVisat: f.rattVisat, regel: f.regel }]
        })
      )
      return { ram, fragor, facit }
    }
  }
}
