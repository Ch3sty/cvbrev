/**
 * Underlagsversion 3 (beställning omgång 2, B1 och C2): version 1 och 2
 * väljer exakt som före bytet (baslinjen urval-baslinje.json lästes på
 * 03ee4aaa, före ändringen), provet och övningsprovet läser
 * underlagsversionen, och rättningen hittar allt.
 */
import { describe, expect, it } from 'vitest'
import baslinje from './urval-baslinje.json'
import { UNDERLAG_VERSION, underlagsVersion } from '../underlagVersion'
import { selectPassagesForSession as vg, POOL_V3 as VG3, POOL_V2 as VG2 } from '@/lib/verbalTestV1/selectPassages.v1'
import { selectPassagesForSession as va, POOL_V3 as VA3 } from '@/lib/verbalTestV2/selectPassages.v2'
import { selectPassagesForSession as ve } from '@/lib/verbalTestExpert/selectPassages'
import { selectPassagesForSession as ng } from '@/lib/numericalTest/selectPassages'
import { selectPassagesForSession as na } from '@/lib/numericalTestV2/selectPassages'
import { selectPassagesForSession as ne } from '@/lib/numericalTestExpert/selectPassages'
import { selectProvPassagesForSession as vp, PROV_MERGED_BANK as VP_ALLA, poolFor as vPool } from '@/lib/verbalTestProv/selectProv'
import { selectProvPassagesForSession as np, PROV_MERGED_BANK as NP_ALLA, poolFor as nPool } from '@/lib/numericalTestProv/selectProv'
import { getAllPassages as ngAlla } from '@/lib/numericalTest/validator'
import { getAllPassages as naAlla, getPassageById as naId } from '@/lib/numericalTestV2/validator'
import { getAllPassages as veAlla } from '@/lib/verbalTestExpert/validator'
import { validateAnswer as vaRatta } from '@/lib/verbalTestV2/validator.v2'
import { validateAnswer as vpRatta } from '@/lib/verbalTestProv/validator.prov'
import { valjDelar, punkterFor } from '@/lib/ovningsprov/motor.server'

type Lista = { id: string; questions?: { id: string; options: { id: string }[] }[] }[]
const ids = (l: unknown) => (l as Lista).map((p) => p.id + (p.questions ? ':' + p.questions.map((q) => q.options.map((o) => o.id).join('')).join(',') : ''))
const B = baslinje as Record<string, string[]>
const S = [...new Set(Object.keys(B).map((k) => k.split(':').slice(2).join(':')))]

describe('underlagsversion 3', () => {
  it('läser 1, 2 och 3 ur meta, nya sessioner får 3', () => {
    expect(UNDERLAG_VERSION).toBe(3)
    expect(underlagsVersion({ underlag_version: 3 })).toBe(3)
    expect(underlagsVersion({ underlag_version: 2 })).toBe(2)
    expect(underlagsVersion({ underlag_version: 4 })).toBe(1)
    expect(underlagsVersion(null)).toBe(1)
  })

  it('version 1 och 2 väljer exakt som före bytet, på fem fasta sessions-id', () => {
    expect(S).toHaveLength(5)
    for (const s of S) {
      for (const v of [1, 2] as const) {
        expect(ids(vg(s, undefined, v))).toEqual(B[`vg:${v}:${s}`])
        expect(ids(va(s, undefined, v))).toEqual(B[`va:${v}:${s}`])
        expect(ids(ng(s, undefined, v))).toEqual(B[`ng:${v}:${s}`])
        expect(ids(na(s, undefined, v))).toEqual(B[`na:${v}:${s}`])
      }
      expect(ids(ve(s))).toEqual(B[`ve:1:${s}`])
      expect(ids(ne(s))).toEqual(B[`ne:1:${s}`])
    }
  })

  it('de arkiverade provsidorna och övningsprovet ändrar inte urval för befintliga sessioner', () => {
    for (const s of S) {
      expect(ids(vp(s))).toEqual(B[`vp:1:${s}`])
      expect(ids(np(s))).toEqual(B[`np:1:${s}`])
      expect(valjDelar('verbal', s)).toEqual(B[`ov-verbal:1:${s}`])
      expect(valjDelar('numerisk', s)).toEqual(B[`ov-numerisk:1:${s}`])
    }
  })

  it('version 3 har parti 01 och 03: verbalt 36 / 40 / 20, numeriskt 36 / 36', () => {
    expect(VA3.length).toBe(40)
    expect(naAlla(3).length).toBe(36)
    expect(VG3.length).toBe(VG2.length)
    expect(ngAlla(3).length).toBe(36)
    expect(VG3.length).toBe(36)
    expect(veAlla(3).length).toBe(20)
    expect(veAlla(1).length).toBe(12)
    expect(VA3.some((p) => p.id === 'va-07-foreningsstod')).toBe(true)
    expect(naId('na-04-elforbrukning')?.id).toBe('na-04-elforbrukning')
  })

  it('provet och övningsprovet läser version 3', () => {
    expect(vPool('avancerad', 3).length).toBe(40)
    expect(nPool('avancerad', 3).length).toBe(36)
    expect(nPool('grund', 3).length).toBe(36)
    expect(vPool('avancerad', 1).length).toBe(24)
    const nyaVp = S.flatMap((s) => vp(s, 3)).filter((p) => /^va-0[1-8]-/.test(p.id))
    const nyaNp = S.flatMap((s) => np(s, 3)).filter((p) => /^na-0[1-8]-/.test(p.id))
    expect(nyaVp.length + nyaNp.length).toBeGreaterThan(0)
    const delar = S.flatMap((s) => valjDelar('verbal', `${s}:x`, new Set(), 3))
    expect(delar.some((id) => /^v[ag]-/.test(id))).toBe(true)
    expect(punkterFor('verbal', delar).length).toBe(delar.length * 4)
  })

  it('rättningen hittar parti 01 i bank, prov och sammanslagna banker', () => {
    expect(vaRatta('va-07-foreningsstod', 2, 'false').isCorrect).toBe(true)
    expect(vpRatta('va-07-foreningsstod', 2, 'false').isCorrect).toBe(true)
    expect(VP_ALLA.some((p) => p.id === 'va-01-hemtjanstens-schema')).toBe(true)
    expect(NP_ALLA.some((p) => p.id === 'na-04-elforbrukning')).toBe(true)
  })
})
