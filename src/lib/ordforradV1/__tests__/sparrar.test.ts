// @vitest-environment node
/**
 * Ordförråd (brief-tester-steg2-2026-11-09.md avsnitt 4): banken klarar OF1
 * till OF8 (scripts/validate-ordforrad.mjs, utan nätverk), fixturer som fäller
 * spärrarna, urvalet och serverns API. Antalet mot gränsen 40 per nivå och typ
 * styrs av ordforradRedo(), inte av testet: en bank under gränsen är giltig
 * men visas inte.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
// @ts-ignore ren JavaScript
import { valideraOrd, ORD_BANKER } from '../../../../scripts/validate-ordforrad.mjs'
import { valjOrd, valjTyp, BLOCK, poolFor } from '../select'
import { ordInnehall, hittaOrd, bedomOrdSvar, rattaOrdSvar } from '../fragor.server'
import { ordforradAntal, ordforradRedo } from '../status'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any
const bank = (n: string): Q[] => JSON.parse(readFileSync(`src/lib/ordforradV1/bank${n}.json`, 'utf8'))
const kopia = (q: Q): Q => JSON.parse(JSON.stringify(q))

/** Kör validatorn på en ändrad kopia av grundbanken. */
function felMed(andra: (b: Q[]) => void) {
  const dir = mkdtempSync(path.join(tmpdir(), 'ord-'))
  const b = kopia(bank('Grund'))
  andra(b)
  const f = path.join(dir, 'bankGrund.json')
  writeFileSync(f, JSON.stringify(b))
  return (valideraOrd([f], { minst: 0 }) as string[]).join('\n')
}

describe('ordförrådsbanken', () => {
  it('klarar OF1 till OF8', () => {
    expect(valideraOrd(ORD_BANKER, { minst: 0 })).toEqual([])
  })
  it('varje facit har belägg i SO eller SAOL, eller i två oberoende källor', () => {
    for (const n of ['Grund', 'Avancerad', 'Expert'])
      for (const q of bank(n)) {
        expect(q.kalla.belagg.length, q.id).toBeGreaterThan(0)
        expect(q.kalla.verifierad_mot, q.id).toMatch(/^(SO|SAOL|Wiktionary och synonymer\.se)/)
      }
  })
  it('ordforradRedo följer gränsen 40 per nivå och typ', () => {
    const a = ordforradAntal()
    const redo = (['grund', 'avancerad', 'expert'] as const).every((n) => a[n].synonym >= 40 && a[n].antonym >= 40)
    expect(ordforradRedo()).toBe(redo)
  })
})

describe('spärrfixturer', () => {
  it('OF1 fäller en uppgift utan belägg', () => {
    expect(felMed((b) => (b[0].kalla = { verifierad_mot: '', belagg: [] }))).toMatch(/OF1/)
  })
  it('OF4 fäller ett alternativ som är mycket längre än facit', () => {
    expect(felMed((b) => {
      const d = b[0].correctAnswer === 0 ? 1 : 0
      b[0].options[d] = 'abcdefghijklmnop'
    })).toMatch(/OF4/)
  })
  it('OF5 fäller en sammansättning med uppslagsordet', () => {
    expect(felMed((b) => {
      const d = b[0].correctAnswer === 0 ? 1 : 0
      b[0].options[d] = b[0].ord + 'het'
    })).toMatch(/OF5/)
  })
  it('OF7 fäller samma uppslagsord två gånger', () => {
    expect(felMed((b) => (b[1].ord = b[0].ord))).toMatch(/OF7/)
  })
  it('OF8 fäller motsatsen som distraktor på grund', () => {
    expect(felMed((b) => {
      const d = b[0].correctAnswer === 0 ? 1 : 0
      b[0].typer[d] = 'antonym'
    })).toMatch(/OF8/)
  })
})

describe('urvalet och API:t', () => {
  it('tio av varje typ i block om fem när banken räcker, annars så många som finns', () => {
    for (const niva of ['grund', 'avancerad', 'expert'] as const) {
      const u = valjOrd(niva, 'sess-1')
      const s = poolFor(niva).filter((q) => q.typ === 'synonym').length
      const a = poolFor(niva).filter((q) => q.typ === 'antonym').length
      expect(u.length).toBe(Math.min(10, s) + Math.min(10, a))
      if (s >= 10 && a >= 10) for (let i = 0; i < 20; i += BLOCK) expect(new Set(u.slice(i, i + BLOCK).map((q) => q.typ)).size).toBe(1)
    }
    expect(valjTyp('grund', 'synonym', 'x', 5).map((q) => q.id)).toEqual(valjTyp('grund', 'synonym', 'x', 5).map((q) => q.id))
  })
  it('klienten får aldrig facit under testet, och svaren rättas på originalindex', () => {
    const s = { id: 'sess-2', test_type: 'ordforrad-grund', meta: { alternativ_blandade: true, ord_version: 1 }, completed_at: null }
    const inn = ordInnehall(s)
    expect(inn.genomgang).toBeNull()
    expect(JSON.stringify(inn.fragor)).not.toMatch(/correctAnswer|misstag|kalla|facit/)
    const q = hittaOrd(inn.fragor[0].id)!
    const g = ordInnehall({ ...s, completed_at: 'nu' }).genomgang![0]
    const svar = bedomOrdSvar(q, s.id, true, g.rattVisat)!
    expect(svar.correct).toBe(true)
    expect(rattaOrdSvar([{ q_id: q.id, selected: svar.selected }])).toBe(1)
  })
})
