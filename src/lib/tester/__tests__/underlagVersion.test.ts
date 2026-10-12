/**
 * Underlagsversionen för verbalt och numeriskt: version 1 drar ur de frysta
 * bankerna (gamla sessioner får samma texter som förut), version 2 ur
 * bankerna plus parti 02, och rättningen hittar alla underlag.
 */
import { describe, expect, it } from 'vitest'
import { underlagsVersion } from '../underlagVersion'
import { selectPassagesForSession as verbalGrund, POOL as VG, POOL_V2 as VG2 } from '@/lib/verbalTestV1/selectPassages.v1'
import { selectPassagesForSession as verbalAv, POOL as VA, POOL_V2 as VA2 } from '@/lib/verbalTestV2/selectPassages.v2'
import { selectPassagesForSession as numGrund } from '@/lib/numericalTest/selectPassages'
import { selectPassagesForSession as numAv } from '@/lib/numericalTestV2/selectPassages'
import { getAllPassages as numGrundAlla, getPassageById as numGrundId } from '@/lib/numericalTest/validator'
import { getAllPassages as numAvAlla, getPassageById as numAvId } from '@/lib/numericalTestV2/validator'

const S = Array.from({ length: 20 }, (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`)

describe('underlagsversionen', () => {
  it('läser versionen ur meta, saknas den är det version 1', () => {
    expect(underlagsVersion(null)).toBe(1)
    expect(underlagsVersion({ antal: 40 })).toBe(1)
    expect(underlagsVersion({ underlag_version: 2 })).toBe(2)
  })
  it('version 2 har parti 02: 12 och 8 texter, 8 och 8 underlag', () => {
    expect([VG2.length - VG.length, VA2.length - VA.length]).toEqual([12, 8])
    expect([numGrundAlla(2).length - numGrundAlla(1).length, numAvAlla(2).length - numAvAlla(1).length]).toEqual([8, 8])
  })
  it('version 1 drar bara frysta texter, version 2 når parti 02', () => {
    const frysta = new Set(VG.map((p) => p.id))
    for (const s of S) expect(verbalGrund(s).every((p) => frysta.has(p.id))).toBe(true)
    const nya = S.flatMap((s) => verbalGrund(s, undefined, 2)).filter((p) => !frysta.has(p.id))
    expect(nya.length).toBeGreaterThan(0)
    expect(S.flatMap((s) => verbalAv(s, undefined, 2)).some((p) => /^va-/.test(p.id))).toBe(true)
    expect(S.flatMap((s) => numGrund(s, undefined, 2)).some((p) => /^ng-/.test(p.id))).toBe(true)
    expect(S.flatMap((s) => numAv(s, undefined, 2)).some((p) => /^na-/.test(p.id))).toBe(true)
  })
  it('rättningen hittar underlagen i parti 02', () => {
    expect(numGrundId('ng-01-kafeets-forsaljning')?.id).toBe('ng-01-kafeets-forsaljning')
    expect(numAvId('na-09-bemanning-skift')?.id).toBe('na-09-bemanning-skift')
  })
})
