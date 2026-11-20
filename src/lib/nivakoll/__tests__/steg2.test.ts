// @vitest-environment node
/**
 * Nivåkollen för talserier, spatial förmåga och ordförråd
 * (plan-testflode-2026-11-20 avsnitt 10, etapp 6): urvalet ur steg2-bankerna,
 * att varje uppgift har facit på servern och inget facit i klientens form,
 * nivåberäkningen med samma motor som de andra Nivåkollerna och gratisregeln.
 */
import { describe, expect, it } from 'vitest'
import { bedom, NIVAKOLL_BUDGET_S, NIVAKOLL_URVAL, raknaNivakoll, uppgiftFor, valjNivakoll } from '../motor.server'
import { arNivakollKind, gransForAvancerad, kindForNivakollTestTyp, NIVAKOLL_TEST_TYPE, passNivaUrNiva, vantadAndel } from '../niva'
import { pFor, pGrund, pNiva } from '../las.server'
import { nivaMening } from '../copy'
import { motorFor, SPATIAL_NIVAKOLL_FORMER } from '../steg2.server'
import { beslutaTillgang } from '@/lib/traning/tillgang'
import { NIVAKOLL_FINNS, nivakollHrefV4, omattMeta } from '@/lib/tester/v4/rutter'
import type { NivakollUppgift } from '../typer'

const KINDS = ['talserie', 'spatial', 'ordforrad'] as const
const IDAG = '2026-11-20'
const ANTAL = { talserie: 9, spatial: 9, ordforrad: 12 } as const
const PER_NIVA = { talserie: 3, spatial: 3, ordforrad: 4 } as const

function uppgifter(kind: (typeof KINDS)[number], seed: string) {
  const v = valjNivakoll(kind, new Map(), IDAG, seed)
  const us = v.fragor.map((n) => uppgiftFor(kind, n, v.nivaer[n], 'session-1', []))
  return { v, us: us as NivakollUppgift[] }
}

describe('config', () => {
  it('typerna, test_type och ingången', () => {
    for (const kind of KINDS) {
      expect(arNivakollKind(kind)).toBe(true)
      expect(NIVAKOLL_TEST_TYPE[kind]).toBe(`${kind}-nivakoll`)
      expect(kindForNivakollTestTyp(`${kind}-nivakoll`)).toBe(kind)
      expect(NIVAKOLL_FINNS[kind]).toBe(true)
      expect(nivakollHrefV4(kind)).toBe(`/dashboard/tester/pass?typ=nivakoll&kind=${kind}`)
      expect(omattMeta(kind)).toMatch(/^Nivåkoll, \d+ min$/)
    }
    expect(NIVAKOLL_URVAL.talserie).toEqual({ grund: 3, avancerad: 3, expert: 3 })
    expect(NIVAKOLL_URVAL.spatial).toEqual({ grund: 3, avancerad: 3, expert: 3 })
    expect(NIVAKOLL_URVAL.ordforrad).toEqual({ grund: 4, avancerad: 4, expert: 4 })
    expect(NIVAKOLL_BUDGET_S).toMatchObject({ talserie: 60, spatial: 40, ordforrad: 20 })
  })
})

describe('urvalet', () => {
  it('antal, nivåspridning med det lättaste först och inga dubbletter', () => {
    for (const kind of KINDS) {
      for (const seed of ['a', 'b', 'c', 'd']) {
        const { v } = uppgifter(kind, `${kind}-${seed}`)
        expect(v.fragor, kind).toHaveLength(ANTAL[kind])
        expect(new Set(v.fragor).size, kind).toBe(v.fragor.length)
        const n = PER_NIVA[kind]
        expect(v.fragor.map((f) => v.nivaer[f])).toEqual([...Array(n).fill('grund'), ...Array(n).fill('avancerad'), ...Array(n).fill('expert')])
        expect(v.upprepade).toEqual([])
      }
    }
  })

  it('uppgifterna ligger i rätt banknivå', () => {
    for (const kind of KINDS) {
      const m = motorFor(kind)
      const { v } = uppgifter(kind, 'niva')
      for (const f of v.fragor) expect(m.pool(v.nivaer[f]).some((q) => q.id === f), `${kind} ${f}`).toBe(true)
    }
  })

  it('talserier: olika regelfamiljer inom varje nivå', () => {
    const m = motorFor('talserie')
    const { v } = uppgifter('talserie', 'familj')
    for (const n of ['grund', 'avancerad', 'expert'] as const) {
      const fam = v.fragor.filter((f) => v.nivaer[f] === n).map((f) => m.gruppNyckel(f))
      expect(new Set(fam).size).toBe(fam.length)
    }
  })

  it('spatial: en uppgift per form i planens ordning', () => {
    const m = motorFor('spatial')
    const { v } = uppgifter('spatial', 'form')
    for (const n of ['grund', 'avancerad', 'expert'] as const) {
      expect(v.fragor.filter((f) => v.nivaer[f] === n).map((f) => m.gruppNyckel(f))).toEqual(SPATIAL_NIVAKOLL_FORMER[n])
    }
  })

  it('ordförråd: synonymer och motsatsord om vartannat', () => {
    const m = motorFor('ordforrad')
    const { v } = uppgifter('ordforrad', 'ord')
    const typer = v.fragor.map((f) => m.gruppNyckel(f))
    expect(typer.filter((t) => t === 'synonym').length).toBeGreaterThanOrEqual(6)
    expect(typer.slice(0, 4)).toEqual(['synonym', 'antonym', 'synonym', 'antonym'])
  })

  it('det hon haft inom 30 dagar väljs sist och markeras upprepat', () => {
    for (const kind of KINDS) {
      const forst = valjNivakoll(kind, new Map(), IDAG, 'seed')
      const sedda = new Map(forst.fragor.map((f) => [f, IDAG]))
      const igen = valjNivakoll(kind, sedda, IDAG, 'seed')
      expect(igen.fragor.some((f) => forst.fragor.includes(f)), kind).toBe(false)
    }
  })
})

describe('facit finns på servern, aldrig i klientens form', () => {
  it('varje uppgift i urvalet går att rätta och har ett rätt svar bland alternativen', () => {
    for (const kind of KINDS) {
      for (const seed of ['x', 'y']) {
        const { us } = uppgifter(kind, `${kind}-facit-${seed}`)
        for (const u of us) {
          expect(u, kind).not.toBeNull()
          expect(u.kind).toBe(kind)
          const v = (u as { v: Record<string, unknown> }).v
          // Inget facit, ingen regel, ingen förklaring i det klienten får.
          for (const f of ['correctAnswer', 'rattVisat', 'misstag', 'regel', 'forklaring', 'facit_betyder', 'bagar', 'p_prior']) expect(v, `${kind} ${u.nyckel} ${f}`).not.toHaveProperty(f)
          const options = v.options as unknown[]
          expect(Array.isArray(options) && options.length >= 2).toBe(true)
          const b0 = bedom(kind, u, '0', 'session-1')!
          const ratt = Number(b0.genomgang.ratt)
          expect(ratt).toBeGreaterThanOrEqual(0)
          expect(ratt).toBeLessThan(options.length)
          const rb = bedom(kind, u, String(ratt), 'session-1')!
          expect(rb.correct, `${kind} ${u.nyckel}`).toBe(true)
          expect(rb.genomgang.data).toBeTruthy()
          const fel = bedom(kind, u, String((ratt + 1) % options.length), 'session-1')!
          expect(fel.correct).toBe(false)
          expect(bedom(kind, u, null, 'session-1')!.selected).toBe(-1)
        }
      }
    }
  })
})

describe('nivån räknas med samma motor som de andra Nivåkollerna', () => {
  const svar = (us: NivakollUppgift[], ratt: (i: number) => boolean, tid = 10) =>
    us.map((u, i) => ({ q_id: u.nyckel, svar: '0', selected: 0, correct: ratt(i), time_spent: tid }))

  it('allt rätt ger högre nivå än allt fel, och nivån ligger på skalan', () => {
    for (const kind of KINDS) {
      const { us } = uppgifter(kind, `${kind}-niva`)
      const bas = {
        kind,
        uppgifter: us,
        fore: null,
        budget_s: NIVAKOLL_BUDGET_S[kind],
        p: (n: string) => pFor(kind, n),
        pBank: { grund: pNiva(kind, 'grund'), avancerad: pNiva(kind, 'avancerad'), expert: pNiva(kind, 'expert') },
        pGrund: pGrund(kind),
      }
      const hog = raknaNivakoll({ ...bas, svar: svar(us, () => true) })
      const lag = raknaNivakoll({ ...bas, svar: svar(us, () => false) })
      const halv = raknaNivakoll({ ...bas, svar: svar(us, (i) => i < us.length / 2) })
      expect(hog.niva, kind).toBeGreaterThan(halv.niva)
      expect(halv.niva, kind).toBeGreaterThan(lag.niva)
      for (const r of [hog, lag, halv]) {
        expect(r.niva).toBeGreaterThanOrEqual(1)
        expect(r.niva).toBeLessThanOrEqual(10)
        expect(r.antal).toBe(ANTAL[kind])
      }
      expect(hog.ratt).toBe(ANTAL[kind])
      expect(hog.perNiva.map((x) => x.antal)).toEqual([PER_NIVA[kind], PER_NIVA[kind], PER_NIVA[kind]])
      expect(hog.tappade.length).toBe(0)
      expect(lag.tappade.length).toBeGreaterThan(0)
      expect(nivaMening(kind, halv.vantat)).toMatch(/\S/)
    }
  })

  it('ommätningen väger in nivån före, som i de andra typerna', () => {
    const { us } = uppgifter('talserie', 'om')
    const bas = { kind: 'talserie' as const, uppgifter: us, budget_s: 60, p: (n: string) => pFor('talserie', n), pBank: { grund: [], avancerad: [], expert: [] }, pGrund: pGrund('talserie') }
    const forsta = raknaNivakoll({ ...bas, fore: null, svar: svar(us, () => true) })
    const igen = raknaNivakoll({ ...bas, fore: 3, svar: svar(us, () => true) })
    expect(igen.fore).toBe(3)
    expect(igen.niva).toBeGreaterThan(3)
    expect(igen.niva).toBeLessThanOrEqual(forsta.niva)
  })

  it('spatial: provets tid per uppgift efter formen', () => {
    const { us } = uppgifter('spatial', 'tid')
    const m = motorFor('spatial')
    const budgetar = Object.fromEntries(us.map((u) => [u.nyckel, m.budget(u.nyckel)]))
    const r = raknaNivakoll({
      kind: 'spatial',
      uppgifter: us,
      fore: null,
      budget_s: 40,
      budgetar,
      p: (n) => pFor('spatial', n),
      pBank: { grund: [], avancerad: [], expert: [] },
      pGrund: pGrund('spatial'),
      svar: svar(us, () => true, 35),
    })
    expect(r.budget_s).toBe(Object.values(budgetar).reduce((a, b) => a + b, 0))
    // 35 s är över provets tid bara för vriden figur (30 s).
    expect(r.over_tid).toBe(us.filter((u) => budgetar[u.nyckel] === 30).length)
  })

  it('kalibreringen: p_prior där banken har den, annars nivåns prior; bankens nivåer i ordning', () => {
    for (const kind of KINDS) {
      const snitt = (n: 'grund' | 'avancerad' | 'expert') => {
        const p = pNiva(kind, n)
        return p.reduce((s, x) => s + x, 0) / p.length
      }
      expect(snitt('grund'), kind).toBeGreaterThan(snitt('avancerad'))
      expect(snitt('avancerad'), kind).toBeGreaterThan(snitt('expert'))
    }
    // Ordförrådet saknar p_prior: grundnivåns prior.
    const ord = valjNivakoll('ordforrad', new Map(), IDAG, 'p')
    expect(pFor('ordforrad', ord.fragor[0])).toBeCloseTo(0.7)
    // Uppmätt från 30 svar går före priorn.
    expect(pFor('talserie', ord.fragor[0], { antal: 40, ratt: 10 })).toBeCloseTo(0.25)
  })

  it('Träna efter Nivåkollen: avancerad först när grunden sitter, inom skalans tak', () => {
    for (const kind of KINDS) {
      const p = pGrund(kind)
      const grans = gransForAvancerad(p)
      expect(passNivaUrNiva(grans - 0.1, p)).toBe('grund')
      expect(passNivaUrNiva(grans, p)).toBe('avancerad')
      expect(vantadAndel(grans, p)).toBeGreaterThanOrEqual(0.85)
      expect(grans, kind).toBeLessThanOrEqual(7.5)
      expect(grans, kind).toBeGreaterThan(4)
    }
  })
})

describe('gratisregeln: Nivåkollen en gång per typ, igen med Premium', () => {
  it('samma beslut som de andra typerna (begard matning)', () => {
    const fri = beslutaTillgang({ begard: 'matning', harOvanGrund: false, harProvlage: false, matningarSlutforda: 0, passSlutfordaIdag: 0 })
    expect(fri.tillatet).toBe(true)
    const andra = beslutaTillgang({ begard: 'matning', harOvanGrund: false, harProvlage: false, matningarSlutforda: 1, passSlutfordaIdag: 0 })
    expect(andra).toMatchObject({ tillatet: false, skal: 'betalvagg', feature: 'tests_above_base' })
    const premium = beslutaTillgang({ begard: 'matning', harOvanGrund: true, harProvlage: false, matningarSlutforda: 3, passSlutfordaIdag: 0 })
    expect(premium).toMatchObject({ tillatet: true, typ: 'ommatning' })
  })
})
