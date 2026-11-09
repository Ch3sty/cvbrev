// @vitest-environment node
/**
 * Nivåkollen för figurserier, deduktivt, verbalt och numeriskt (testplanen
 * steg 1, 2026-11-09): urvalet, räkningen på skalan, kalibreringen mot
 * bankernas svårighet och passets nivå.
 */
import { describe, expect, it } from 'vitest'
import { valjNivakoll, raknaNivakoll, NIVAKOLL_URVAL } from '../motor.server'
import { gransForAvancerad, passNivaUrNiva, vantadAndel, type NivakollKind } from '../niva'
import { pGrund, pNiva, priorFor } from '../las.server'
import { nivaMening } from '../copy'
import type { NivakollUppgift } from '../typer'

const KINDS: NivakollKind[] = ['figurserie', 'deduktiv', 'verbal', 'numerisk']
const IDAG = '2026-11-09'

describe('urvalet', () => {
  it('figurserier 3 + 3 + 3 och deduktivt 2 + 2 + 2, lättast först', () => {
    for (const kind of ['figurserie', 'deduktiv'] as const) {
      const v = valjNivakoll(kind, new Map(), IDAG, 'seed')
      const u = NIVAKOLL_URVAL[kind]
      expect(v.fragor).toHaveLength(u.grund + u.avancerad + u.expert)
      expect(v.fragor.map((f) => v.nivaer[f])).toEqual([
        ...Array(u.grund).fill('grund'),
        ...Array(u.avancerad).fill('avancerad'),
        ...Array(u.expert).fill('expert'),
      ])
      expect(v.upprepade).toEqual([])
    }
  })

  it('verbalt och numeriskt: ett underlag ur grund och ett ur avancerad, fyra uppgifter var', () => {
    for (const kind of ['verbal', 'numerisk'] as const) {
      const v = valjNivakoll(kind, new Map(), IDAG, 'seed')
      expect(v.delar).toHaveLength(2)
      expect(v.fragor).toHaveLength(8)
      expect(v.fragor.filter((f) => v.nivaer[f] === 'grund')).toHaveLength(4)
    }
  })

  it('varje uppgift har en andel rätt i registret (samma id som frågestatistiken)', () => {
    for (const kind of KINDS) {
      const v = valjNivakoll(kind, new Map(), IDAG, `seed-${kind}`)
      for (const f of v.fragor) expect(priorFor(kind, f), `${kind} ${f}`).not.toBeNull()
    }
  })

  it('det hon haft inom 30 dagar väljs sist och markeras upprepat', () => {
    const forst = valjNivakoll('deduktiv', new Map(), IDAG, 'seed')
    const sedda = new Map(forst.fragor.map((f) => [f, IDAG]))
    const igen = valjNivakoll('deduktiv', sedda, IDAG, 'seed')
    expect(igen.fragor.some((f) => forst.fragor.includes(f))).toBe(false)
  })
})

describe('kalibreringen mot bankerna', () => {
  it('bankernas nivåer ligger i ordning på skalan för varje typ', () => {
    for (const kind of KINDS) {
      const snitt = (n: 'grund' | 'avancerad' | 'expert') => {
        const p = pNiva(kind, n)
        return p.reduce((s, x) => s + x, 0) / p.length
      }
      expect(snitt('grund'), kind).toBeGreaterThan(snitt('avancerad'))
    }
  })

  it('väntad andel rätt växer med nivån, och passet blir avancerat först när grunden sitter (85)', () => {
    for (const kind of KINDS) {
      const p = pGrund(kind)
      expect(vantadAndel(3, p)).toBeLessThan(vantadAndel(6, p))
      const grans = gransForAvancerad(p)
      expect(passNivaUrNiva(grans - 0.1, p)).toBe('grund')
      expect(passNivaUrNiva(grans, p)).toBe('avancerad')
      expect(vantadAndel(grans, p)).toBeGreaterThanOrEqual(0.85)
      // Gränsen ska ligga inom skalans tak (7,5) så att passen kan flytta upp.
      expect(grans, kind).toBeLessThanOrEqual(7.5)
      expect(grans, kind).toBeGreaterThan(4)
    }
  })
})

describe('räkningen', () => {
  const uppgifter = (n: number): NivakollUppgift[] =>
    Array.from({ length: n }, (_, i) => ({ kind: 'deduktiv', nyckel: `q${i}`, niva: i < 2 ? 'grund' : i < 4 ? 'avancerad' : 'expert', intro: null, villkor: [], fraga: '', options: [], premisser: false }))
  const p = (n: string) => [0.75, 0.75, 0.55, 0.55, 0.4, 0.4][Number(n.slice(1))]
  const pBank = { grund: pNiva('deduktiv', 'grund'), avancerad: pNiva('deduktiv', 'avancerad'), expert: pNiva('deduktiv', 'expert') }
  const svar = (ratt: number) => Array.from({ length: 6 }, (_, i) => ({ q_id: `q${i}`, svar: '0', selected: 0, correct: i < ratt, time_spent: 60 }))

  it('fler rätt ger högre nivå, alla fel eller alla rätt ger en ändlig nivå inom skalan', () => {
    const nivaer = [0, 2, 4, 6].map((r) => raknaNivakoll({ kind: 'deduktiv', uppgifter: uppgifter(6), svar: svar(r), fore: null, budget_s: 75, p, pBank, pGrund: pBank.grund }).niva)
    expect(nivaer[0]).toBeGreaterThanOrEqual(1)
    expect(nivaer[3]).toBeLessThanOrEqual(7.5)
    for (let i = 1; i < nivaer.length; i++) expect(nivaer[i]).toBeGreaterThan(nivaer[i - 1])
  })

  it('en ny nivåkoll väger hälften mot den förra, som matrisens', () => {
    const forsta = raknaNivakoll({ kind: 'deduktiv', uppgifter: uppgifter(6), svar: svar(6), fore: null, budget_s: 75, p, pBank, pGrund: pBank.grund })
    const igen = raknaNivakoll({ kind: 'deduktiv', uppgifter: uppgifter(6), svar: svar(6), fore: 3, budget_s: 75, p, pBank, pGrund: pBank.grund })
    expect(igen.niva).toBeLessThan(forsta.niva)
    expect(igen.niva).toBeGreaterThan(3)
    expect(igen.perNiva).toEqual([
      { niva: 'grund', antal: 2, ratt: 2 },
      { niva: 'avancerad', antal: 2, ratt: 2 },
      { niva: 'expert', antal: 2, ratt: 2 },
    ])
  })
})

describe('meningen', () => {
  it('säger vad modellen väntar sig på bankens nivåer, utan procent och utan jämförelse med andra', () => {
    const m = nivaMening('deduktiv', { grund: 0.9, avancerad: 0.5, expert: 0.3 })
    expect(m).toBe('Grundnivån sitter. På avancerad nivå, fem villkor, blir det rätt ungefär varannan gång.')
    expect(nivaMening('figurserie', { grund: 0.5, avancerad: 0.2, expert: 0.1 })).toBe('På grundnivå, en regel, blir det rätt ungefär varannan gång.')
    expect(nivaMening('verbal', { grund: 0.95, avancerad: 0.9, expert: null })).toBe('Grundnivån sitter. Avancerad nivå sitter också. Det som är kvar att träna är tempot.')
    for (const t of [m]) expect(t).not.toMatch(/%|procent|andra|genomsnitt|—|·/)
  })
})
