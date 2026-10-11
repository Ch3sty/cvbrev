/**
 * Exempeldata för förhandsvisningen av Din utveckling
 * (/dashboard/tester/forhandsvisning/utveckling). Samma exempel som skissen:
 * logik grund 14 av 15 på 20 försök, avancerad 12 av 15 på 12, expert inte
 * gjord, verbalt och numeriskt grund, matrisnivån 5,2 den 6 oktober till
 * 6,1 i dag med sikte 6,5 till provet 24 oktober. Ingen databas.
 */

import type { TestSlug } from '@/hooks/use-all-test-stats'
import { EMPTY_STATS, type PerTestStats } from '@/app/dashboard/tester/getHubData'
import { byggPlan } from '@/lib/traning/plan'
import type { Nivapunkt } from '@/lib/traning/milstolpar'
import { byggFordelning } from './fordelning'
import { KLASSISKA, klassiskt } from './katalog'
import type { DinUtvecklingData, VarDuStarNiva } from './typer'

export const LAGEN = ['full', 'under25', 'klassiska', 'gratis', 'tomt'] as const
export type Lage = (typeof LAGEN)[number]

export const LAGE_NAMN: Record<Lage, string> = {
  full: 'Allt, jämförelse visas',
  under25: 'Under 25, räknarna',
  klassiska: 'Utan nivåkoll, bara klassiska',
  gratis: 'Gratisnivån, utan historik',
  tomt: 'Tomt läge',
}

const IDAG = '2026-10-11'

function serie(slug: TestSlug, procent: number[], startDag: number): PerTestStats {
  const max = klassiskt(slug).maxPoang
  const history = procent.map((p, i) => ({
    score: Math.round((p / 100) * max),
    percentage: p,
    timeSpent: 600 + i * 7,
    completedAt: new Date(Date.UTC(2026, 8, startDag + i * 2, 17, 0)).toISOString(),
  }))
  const bast = Math.max(...history.map((h) => h.score))
  return {
    attempts: history.length,
    bestScore: bast,
    bestPercentage: Math.round((bast / max) * 100),
    totalTimeSeconds: history.reduce((s, h) => s + h.timeSpent, 0),
    lastAttempt: history[history.length - 1].completedAt,
    history,
  }
}

function tomPerTest(): Record<TestSlug, PerTestStats> {
  return Object.fromEntries(KLASSISKA.map((t) => [t.slug, EMPTY_STATS])) as Record<TestSlug, PerTestStats>
}

function perTestFull(): Record<TestSlug, PerTestStats> {
  return {
    ...tomPerTest(),
    'matrislogik-grund': serie('matrislogik-grund', [53, 60, 47, 67, 73, 60, 73, 80, 67, 73, 87, 80, 87, 87, 80, 87, 93, 80, 87, 87], 1),
    'matrislogik-avancerad': serie('matrislogik-avancerad', [47, 53, 60, 53, 67, 60, 67, 73, 67, 73, 80, 80], 6),
    'verbal-resonemang': serie('verbal-resonemang', [58, 62, 63, 62, 67, 65, 70, 72, 68, 73, 75, 73], 3),
    'verbal-resonemang-v2': serie('verbal-resonemang-v2', [43, 47, 45, 50, 53, 52, 55, 53, 57, 58, 57, 60, 62], 4),
    'numeriskt-test': serie('numeriskt-test', [44, 50, 47, 53, 56, 59, 56, 63, 66, 63, 66, 63], 2),
  }
}

/** Utan historik (gratis): bara senaste försöket, som getHubData trimmar. */
function utanHistorik(p: Record<TestSlug, PerTestStats>): Record<TestSlug, PerTestStats> {
  return Object.fromEntries(
    Object.entries(p).map(([slug, s]) => [slug, s.history.length ? { ...s, history: s.history.slice(-1) } : s])
  ) as Record<TestSlug, PerTestStats>
}

const PUNKTER: Nivapunkt[] = [
  { dag: '2026-10-06', typ: 'matning', niva: 5.2 },
  { dag: '2026-10-07', typ: 'pass', niva: 5.4 },
  { dag: '2026-10-08', typ: 'pass', niva: 5.6 },
  { dag: '2026-10-09', typ: 'pass', niva: 5.5 },
  { dag: '2026-10-10', typ: 'pass', niva: 5.9 },
  { dag: '2026-10-11', typ: 'pass', niva: 6.1 },
]

function kurva(historikLast: boolean): DinUtvecklingData['kurva'] {
  const plan = byggPlan({ start: '2026-10-06', prov: '2026-10-24', idag: IDAG, aktivaDagar: PUNKTER.map((p) => p.dag), betalande: !historikLast })
  return {
    punkter: historikLast ? PUNKTER.slice(-1) : PUNKTER,
    plan,
    start: { dag: '2026-10-06', niva: 5.2 },
    prov: '2026-10-24',
    sikte: 6.5,
    nivanUpp: '2026-10-11',
    historikLast,
    passKvar: false,
  }
}

/** Logik grund: 212 slutförda med blandade alternativ, toppen kring 10 till 11 rätt. */
const GRUND_PER_POANG = [1, 1, 2, 3, 4, 6, 9, 13, 17, 22, 26, 27, 25, 22, 19, 15]

function fordelningGrund() {
  const poang = GRUND_PER_POANG.flatMap((n, p) => Array.from({ length: n }, () => p))
  return byggFordelning(poang, 15)
}

function liten(antal: number, max: number) {
  return byggFordelning(Array.from({ length: antal }, (_, i) => Math.round(((i % 7) / 7) * max)), max)
}

function varDuStar(full: boolean): VarDuStarNiva[] {
  return [
    { slug: 'matrislogik-grund', fordelning: full ? fordelningGrund() : liten(19, 15), egenPoang: 14, egnaForsok: 20 },
    { slug: 'matrislogik-avancerad', fordelning: liten(14, 15), egenPoang: 12, egnaForsok: 12 },
    { slug: 'verbal-resonemang', fordelning: liten(9, 60), egenPoang: 45, egnaForsok: 12 },
    { slug: 'verbal-resonemang-v2', fordelning: liten(full ? 31 : 6, 60), egenPoang: null, egnaForsok: 13 },
    { slug: 'numeriskt-test', fordelning: liten(full ? 27 : 11, 32), egenPoang: full ? 21 : 21, egnaForsok: 12 },
  ]
}

const FAMILJER: DinUtvecklingData['familjer'] = [
  { family: 'rotation-med-byte', ratt: 3, antal: 7, andel: 3 / 7, ratt_men_langsamma: 1 },
  { family: 'tva-rorelser', ratt: 2, antal: 4, andel: 0.5, ratt_men_langsamma: 0 },
  { family: 'spegling', ratt: 3, antal: 4, andel: 0.75, ratt_men_langsamma: 3 },
  { family: 'latin-antal', ratt: 6, antal: 8, andel: 0.75, ratt_men_langsamma: 1 },
  { family: 'overlagring', ratt: 7, antal: 9, andel: 7 / 9, ratt_men_langsamma: 0 },
  { family: 'vridning', ratt: 9, antal: 10, andel: 0.9, ratt_men_langsamma: 2 },
  { family: 'vandring', ratt: 1, antal: 1, andel: 1, ratt_men_langsamma: 0 },
]

const TEMPO: DinUtvecklingData['tempo'] = {
  senaste: {
    dag: IDAG,
    budget_s: 83,
    fragor: [
      { tid_s: 31, ratt: true },
      { tid_s: 42, ratt: true },
      { tid_s: 92, ratt: false },
      { tid_s: 47, ratt: true },
      { tid_s: 29, ratt: true },
      { tid_s: 104, ratt: true },
      { tid_s: 55, ratt: false },
      { tid_s: 38, ratt: true },
      { tid_s: 86, ratt: true },
    ],
  },
  snittPerPass: [
    { dag: '2026-10-07', snitt_s: 74, budget_s: 83 },
    { dag: '2026-10-08', snitt_s: 69, budget_s: 83 },
    { dag: '2026-10-09', snitt_s: null, budget_s: 83 },
    { dag: '2026-10-10', snitt_s: 63, budget_s: 83 },
    { dag: '2026-10-11', snitt_s: 58, budget_s: 83 },
  ],
}

export function utvecklingFixtur(lage: Lage): DinUtvecklingData {
  switch (lage) {
    case 'tomt':
      return { idag: IDAG, kurva: null, perTest: tomPerTest(), hasHistory: true, varDuStar: [], familjer: null, tempo: null }
    case 'klassiska':
      return {
        idag: IDAG,
        kurva: null,
        perTest: perTestFull(),
        hasHistory: true,
        varDuStar: varDuStar(true),
        familjer: null,
        tempo: null,
      }
    case 'gratis':
      return {
        idag: IDAG,
        kurva: kurva(true),
        perTest: utanHistorik(perTestFull()),
        hasHistory: false,
        varDuStar: varDuStar(false),
        familjer: FAMILJER,
        tempo: { senaste: TEMPO!.senaste, snittPerPass: TEMPO!.snittPerPass.slice(-1) },
      }
    case 'under25':
      return { idag: IDAG, kurva: kurva(false), perTest: perTestFull(), hasHistory: true, varDuStar: varDuStar(false), familjer: FAMILJER, tempo: TEMPO }
    default:
      return { idag: IDAG, kurva: kurva(false), perTest: perTestFull(), hasHistory: true, varDuStar: varDuStar(true), familjer: FAMILJER, tempo: TEMPO }
  }
}
