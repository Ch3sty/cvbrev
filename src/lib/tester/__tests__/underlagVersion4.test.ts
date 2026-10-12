/**
 * Underlagsversion 4 (beställning omgång 3, B2): verbalt parti 04 med två
 * påståenden av samma typ per text. Version 1 till 3 väljer exakt som före
 * bytet (urval-baslinje.json för 1 och 2, urval-baslinje-v3.json för 3,
 * lästa på 99976b96 före ändringen), version 4 når parti 04, rättningen
 * hittar texterna och det riktade textpasset föredrar texter med två av typen.
 */
import { describe, expect, it } from 'vitest'
import baslinje from './urval-baslinje.json'
import baslinje3 from './urval-baslinje-v3.json'
import parti04Grund from '@/lib/verbalTestV1/underlagParti04.json'
import parti04Av from '@/lib/verbalTestV2/underlagParti04.json'
import { UNDERLAG_VERSION, underlagsVersion } from '../underlagVersion'
import { valjUnderlag } from '../pass-urval'
import { selectPassagesForSession as vg, POOL_V3 as VG3, POOL_V4 as VG4 } from '@/lib/verbalTestV1/selectPassages.v1'
import { selectPassagesForSession as va, POOL_V3 as VA3, POOL_V4 as VA4 } from '@/lib/verbalTestV2/selectPassages.v2'
import { selectPassagesForSession as ve } from '@/lib/verbalTestExpert/selectPassages'
import { selectPassagesForSession as ng } from '@/lib/numericalTest/selectPassages'
import { selectPassagesForSession as na } from '@/lib/numericalTestV2/selectPassages'
import { selectProvPassagesForSession as vp, poolFor as vPool, PROV_MERGED_BANK as VP_ALLA } from '@/lib/verbalTestProv/selectProv'
import { selectProvPassagesForSession as np } from '@/lib/numericalTestProv/selectProv'
import { valjDelar } from '@/lib/ovningsprov/motor.server'
import { validateAnswer as vgRatta } from '@/lib/verbalTestV1/validator.v1'
import { validateAnswer as vaRatta } from '@/lib/verbalTestV2/validator.v2'

type Lista = { id: string; questions?: { id: string; options: { id: string }[] }[] }[]
const ids = (l: unknown) => (l as Lista).map((p) => p.id + (p.questions ? ':' + p.questions.map((q) => q.options.map((o) => o.id).join('')).join(',') : ''))
const B = baslinje as Record<string, string[]>
const B3 = baslinje3 as Record<string, string[]>
const S = [...new Set(Object.keys(B).map((k) => k.split(':').slice(2).join(':')))]
type Text = { id: string; statements: { typ: string; correctAnswer: string }[] }
const P04 = [...(parti04Grund as Text[]), ...(parti04Av as Text[])]
const typer = (t: Text) => t.statements.map((s) => s.typ)
const antal = (t: Text, typ: string) => typer(t).filter((x) => x === typ).length

describe('underlagsversion 4', () => {
  it('nya sessioner får 4, och 4 läses ur meta', () => {
    expect(UNDERLAG_VERSION).toBe(4)
    expect(underlagsVersion({ underlag_version: 4 })).toBe(4)
  })

  it('version 1, 2 och 3 väljer exakt som före bytet, på fem fasta sessions-id', () => {
    expect(S).toHaveLength(5)
    for (const s of S) {
      for (const v of [1, 2] as const) {
        expect(ids(vg(s, undefined, v))).toEqual(B[`vg:${v}:${s}`])
        expect(ids(va(s, undefined, v))).toEqual(B[`va:${v}:${s}`])
        expect(ids(ng(s, undefined, v))).toEqual(B[`ng:${v}:${s}`])
        expect(ids(na(s, undefined, v))).toEqual(B[`na:${v}:${s}`])
      }
      expect(ids(vg(s, undefined, 3))).toEqual(B3[`vg:3:${s}`])
      expect(ids(va(s, undefined, 3))).toEqual(B3[`va:3:${s}`])
      expect(ids(ng(s, undefined, 3))).toEqual(B3[`ng:3:${s}`])
      expect(ids(na(s, undefined, 3))).toEqual(B3[`na:3:${s}`])
      expect(ids(ve(s, undefined, 3))).toEqual(B3[`ve:3:${s}`])
      expect(ids(vp(s, 3))).toEqual(B3[`vp:3:${s}`])
      expect(ids(np(s, 3))).toEqual(B3[`np:3:${s}`])
      expect(valjDelar('verbal', s, new Set(), 3)).toEqual(B3[`ov-verbal:3:${s}`])
      expect(valjDelar('numerisk', s, new Set(), 3)).toEqual(B3[`ov-numerisk:3:${s}`])
    }
  })

  it('numeriskt och verbalt expert är som version 3 i version 4', () => {
    for (const s of S) {
      expect(ids(ng(s, undefined, 4))).toEqual(B3[`ng:3:${s}`])
      expect(ids(na(s, undefined, 4))).toEqual(B3[`na:3:${s}`])
      expect(ids(ve(s, undefined, 4))).toEqual(B3[`ve:3:${s}`])
      expect(ids(np(s, 4))).toEqual(B3[`np:3:${s}`])
    }
  })

  it('parti 04: åtta texter per nivå, två påståenden av måltypen och ett vardera av två andra, två texter per måltyp', () => {
    expect([VG4.length - VG3.length, VA4.length - VA3.length]).toEqual([8, 8])
    for (const parti of [parti04Grund as Text[], parti04Av as Text[]]) {
      expect(parti).toHaveLength(8)
      const mal: Record<string, number> = {}
      for (const t of parti) {
        const dubbel = ['direkt', 'slutledning', 'kvantor', 'utanfor'].filter((typ) => antal(t, typ) === 2)
        expect(dubbel, t.id).toHaveLength(1)
        expect(new Set(typer(t)).size, t.id).toBe(3)
        mal[dubbel[0]] = (mal[dubbel[0]] ?? 0) + 1
      }
      expect(mal).toEqual({ direkt: 2, slutledning: 2, kvantor: 2, utanfor: 2 })
    }
  })

  it('version 4 når parti 04 i klassiska test, prov och övningsprov', () => {
    const nya = new Set(P04.map((t) => t.id))
    expect(S.flatMap((s) => [...vg(s, undefined, 4), ...va(s, undefined, 4)]).some((p) => nya.has(p.id))).toBe(true)
    expect(vPool('grund', 4).length).toBe(VG4.length)
    expect(VP_ALLA.some((p) => p.id === 'va-17-fyradagarsvecka')).toBe(true)
    const delar = S.flatMap((s) => valjDelar('verbal', `${s}:y`, new Set(), 4))
    expect(delar.some((id) => nya.has(id))).toBe(true)
  })

  it('rättningen hittar parti 04', () => {
    expect(vgRatta('vg-14-semester', 0, 'false').isCorrect).toBe(true)
    expect(vaRatta('va-21-lonekartlaggning', 0, 'false').isCorrect).toBe(true)
  })

  it('riktat textpass på kvantor: en text med två kvantorpåståenden före en med ett', () => {
    const per = new Map(VA4.map((t) => [t.id, t as unknown as Text]))
    const pool = VA4.filter((t) => antal(t as unknown as Text, 'kvantor') >= 1).map((t) => ({ id: t.id }))
    const tva = new Set((parti04Av as Text[]).filter((t) => antal(t, 'kvantor') === 2).map((t) => t.id))
    expect(tva.size).toBe(2)
    const foredra = (id: string) => antal(per.get(id)!, 'kvantor') >= 2
    for (let i = 0; i < 20; i++) {
      const val = valjUnderlag({ pool, sedda: new Map(), idag: '2026-10-12', seed: `kvantor:${i}`, foredra })
      expect(tva.has(val!.id)).toBe(true)
    }
    // När båda är sedda inom karensen dras en text med ett kvantorpåstående.
    const sedda = new Map([...tva].map((id) => [id, '2026-10-10'] as const))
    const val = valjUnderlag({ pool, sedda, idag: '2026-10-12', seed: 'x', foredra })
    expect(tva.has(val!.id)).toBe(false)
    expect(val!.upprepad).toBe(false)
  })
})
