/**
 * Provet utan konto per typ (spec-prov-fler-typer-2026-11-09): urvalet ger
 * fem uppgifter (I-provet sex, en per deltest), klienten får dem utan facit,
 * rättningen dömer med samma motorer och genomgången öppnar facit först efter.
 */
import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { artikelUppgift, felPositioner, genomgaProv, publikUppgift, rattaSvar, underlagFor, valjProv } from '../prov-typer.server'
import { PROV_TYPER, provAntal, type NyProvTyp } from '../prov-typer'

const NYA = PROV_TYPER.filter((t) => t !== 'matris') as NyProvTyp[]
const FACIT = /correctAnswer|correctAnswerId|"rattVisat"|"regel"|"rule"|"explanation"|"forklaring"|"losning"|"misstag"/

describe.each(NYA)('provet %s', (typ) => {
  const refs = valjProv(typ, 'token-1', 'token-1')

  it('har rätt antal uppgifter, alla olika och ritbara', () => {
    expect(refs).toHaveLength(provAntal(typ))
    expect(new Set(refs.map((r) => r.n)).size).toBe(refs.length)
    for (const r of refs) expect(publikUppgift(r)).not.toBeNull()
  })

  it('samma token ger samma prov, annan token ett annat', () => {
    expect(valjProv(typ, 'token-1', 'token-1')).toEqual(refs)
    expect(valjProv(typ, 'token-2', 'token-2').map((r) => r.n)).not.toEqual(refs.map((r) => r.n))
  })

  it('klienten får inget facit', () => {
    const ut = JSON.stringify({ u: refs.map(publikUppgift), underlag: underlagFor(refs) })
    expect(ut).not.toMatch(FACIT)
  })

  it('rättningen och genomgången: rätt svar ger rätt, genomgången har facit', () => {
    const genomgang = genomgaProv(refs, refs.map(() => ({ svar: null, selected: -1, correct: false })))
    expect(genomgang).toHaveLength(refs.length)
    const svar = refs.map((r, i) => {
      const g = genomgang[i]
      const ratt = 'valt' in g ? String((g.genomgang as { rattVisat: number }).rattVisat) : g.genomgang.ratt
      return rattaSvar(r, ratt)
    })
    expect(svar.every((s) => s.correct)).toBe(true)
    expect(felPositioner(svar, refs.length)).toEqual([])
    expect(rattaSvar(refs[0], null).correct).toBe(false)
  })

  it('uppgift 1 i artikeln är provets första uppgift med artikelns frö', () => {
    const a = artikelUppgift(typ, 'en-artikel')
    expect(a).not.toBeNull()
    const prov = valjProv(typ, 'artikel:' + typ + ':en-artikel', 'token-9', 'artikel:' + typ + ':en-artikel')
    expect(prov[0].n).toBe(a!.uppgift.nyckel)
    expect(JSON.stringify(a)).not.toMatch(FACIT)
  })
})

it('I-provet: en uppgift per deltest i provets ordning', () => {
  expect(valjProv('iprov', 't', 't').map((r) => r.d)).toEqual([1, 2, 3, 4, 5, 6])
})
