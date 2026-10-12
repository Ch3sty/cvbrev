/**
 * Text- och sifferpassen (beställning omgång 2, B2 och B3): nivå, urval,
 * karensen på 30 dagar över alla källor, riktade pass och "Var du tappade".
 */
import { describe, expect, it } from 'vitest'
import { laggTill } from '@/lib/traning/datum'
import { arOsett, passNiva, riktadeFamiljer, tappadeFamiljer, valjUnderlag } from '../pass-urval'
import { seddaUrRader, underlagForSession } from '../sedda.server'
import { familjerPerUppgift, harFamilj, klientform, passPool, ratta } from '../pass-bank.server'
import { bastaGrundProcent } from '../pass.server'
import { featureForTestType } from '@/lib/tests/sessionGate'
import { selectPassagesForSession as verbalGrund } from '@/lib/verbalTestV1/selectPassages.v1'
import { VN_FAMILJER, VN_KARENS_DAGAR } from '../pass-typer'

const IDAG = '2026-10-12'

describe('nivån', () => {
  it('grund tills bästa klassiska grundresultat är minst 85 procent', () => {
    expect(passNiva(null)).toBe('grund')
    expect(passNiva(84)).toBe('grund')
    expect(passNiva(85)).toBe('avancerad')
  })
  it('läser bästa grundresultat ur sessionerna mot sessionens antal', () => {
    const rad = (score: number, antal: number) => ({ id: 'x', test_type: 'verbal-resonemang', meta: { antal }, answers: [], score, created_at: '2026-10-01T10:00:00Z', completed_at: '2026-10-01T10:20:00Z' })
    expect(bastaGrundProcent('verbal', [rad(30, 40), rad(36, 40)])).toBe(90)
    expect(bastaGrundProcent('numerisk', [rad(30, 40)])).toBeNull()
  })
})

describe('urvalet och karensen', () => {
  const pool = passPool('verbal', 'grund')

  it('pools i version 3: 36 texter grund, 40 avancerad, 36 underlag per nivå i numeriskt', () => {
    expect(pool.length).toBe(36)
    expect(passPool('verbal', 'avancerad').length).toBe(40)
    expect(passPool('numerisk', 'grund').length).toBe(36)
    expect(passPool('numerisk', 'avancerad').length).toBe(36)
  })

  it('väljer ett osett underlag, annars det äldst sedda och markerar upprepat', () => {
    const sedda = new Map(pool.slice(0, -1).map((p) => [p.id, IDAG]))
    expect(valjUnderlag({ pool, sedda, idag: IDAG, seed: 's' })).toEqual({ id: pool[pool.length - 1].id, upprepad: false })
    const alla = new Map(pool.map((p, i) => [p.id, laggTill(IDAG, -(i % 5))]))
    const v = valjUnderlag({ pool, sedda: alla, idag: IDAG, seed: 's' })!
    expect(v.upprepad).toBe(true)
    expect(alla.get(v.id)).toBe(laggTill(IDAG, -4))
  })

  it('aldrig samma text eller underlag två gånger på 30 dagar, ett pass om dagen', () => {
    for (const [kind, niva] of [['verbal', 'grund'], ['verbal', 'avancerad'], ['numerisk', 'grund'], ['numerisk', 'avancerad']] as const) {
      const p = passPool(kind, niva)
      const rader: { id: string; test_type: string; meta: unknown; created_at: string }[] = []
      const sett: { id: string; dag: string }[] = []
      for (let d = 0; d < 60; d++) {
        const dag = laggTill('2026-10-01', d)
        const sedda = seddaUrRader(kind, rader)
        const v = valjUnderlag({ pool: p, sedda, idag: dag, seed: `${kind}:${d}` })!
        const forra = sett.filter((s) => s.id === v.id).pop()
        if (forra) expect(laggTill(forra.dag, VN_KARENS_DAGAR) < dag || v.upprepad).toBe(true)
        if (d < 30) expect(v.upprepad).toBe(false)
        sett.push({ id: v.id, dag })
        rader.push({ id: `p${d}`, test_type: `${kind}-pass`, meta: { underlag_id: v.id }, created_at: `${dag}T08:00:00Z` })
      }
    }
  })

  it('räknar klassiska test, övningsprovet och passen som sedda', () => {
    const sid = '3f1c2a90-0000-4000-8000-000000000001'
    const klassisk = { id: sid, test_type: 'verbal-resonemang', meta: { underlag_version: 3 }, created_at: `${IDAG}T08:00:00Z` }
    expect(underlagForSession('verbal', klassisk)).toEqual(verbalGrund(sid, undefined, 3).map((p) => p.id))
    const s = seddaUrRader('verbal', [
      klassisk,
      { id: 'g', test_type: 'verbal-general', meta: { delar: ['va-01-hemtjanstens-schema'] }, created_at: `${IDAG}T09:00:00Z` },
      { id: 'p', test_type: 'verbal-pass', meta: { underlag_id: 'vg-01-x' }, created_at: '2026-09-01T09:00:00Z' },
    ])
    expect(s.get('va-01-hemtjanstens-schema')).toBe(IDAG)
    expect(arOsett('vg-01-x', s, IDAG)).toBe(true)
    expect(arOsett('va-01-hemtjanstens-schema', s, IDAG)).toBe(false)
  })
})

describe('riktade pass', () => {
  it('numeriskt kräver två frågor med typen i underlaget', () => {
    const id = passPool('numerisk', 'avancerad').find((p) => p.id === 'na-09-bemanning-skift')!.id
    const fam = familjerPerUppgift('numerisk', id)
    for (const f of VN_FAMILJER.numerisk) expect(harFamilj('numerisk', id, f)).toBe(fam.filter((x) => x.includes(f)).length >= 2)
  })
  it('verbalt räcker ett påstående av typen, och det typade står först i passet', () => {
    const id = 'va-01-hemtjanstens-schema'
    expect(harFamilj('verbal', id, 'kvantor')).toBe(true)
    expect(harFamilj('verbal', 'v1-p02-remote-work', 'kvantor')).toBe(false)
    const f = klientform('verbal', id, 'sess', 'kvantor')!
    const kvantorIndex = familjerPerUppgift('verbal', id).findIndex((x) => x.includes('kvantor'))
    expect(f.punkter[0].nyckel).toBe(`${id}:${kvantorIndex}`)
    expect(new Set(f.punkter.map((p) => p.nyckel)).size).toBe(4)
  })
  it('familjen döljs med färre än tre osedda underlag', () => {
    const pool = passPool('verbal', 'avancerad')
    const har = (id: string, f: string) => harFamilj('verbal', id, f)
    const med = pool.filter((p) => har(p.id, 'kvantor'))
    expect(riktadeFamiljer({ familjer: ['kvantor'], pool, harFamilj: har, sedda: new Map(), idag: IDAG })).toEqual([{ familj: 'kvantor', osedda: med.length }])
    const nastanAlla = new Map(med.slice(2).map((p) => [p.id, IDAG]))
    expect(riktadeFamiljer({ familjer: ['kvantor'], pool, harFamilj: har, sedda: nastanAlla, idag: IDAG })).toEqual([])
  })
})

describe('rättning, klientform och behörighet', () => {
  it('klientformen har inget facit', () => {
    const f = klientform('numerisk', 'na-01-kommunbudget', 'sess')!
    expect(JSON.stringify(f)).not.toMatch(/isCorrect|correctAnswer|misstag|explanation/)
    const v = klientform('verbal', 'va-01-hemtjanstens-schema', 'sess')!
    expect(JSON.stringify(v)).not.toMatch(/correctAnswer|explanation/)
  })
  it('rättar mot banken och ger originalindex', () => {
    const r = ratta('verbal', 'va-07-foreningsstod', 'va-07-foreningsstod:2', 'false', 's')!
    expect(r.correct).toBe(true)
    expect(r.selected).toBe(1)
    expect(ratta('verbal', 'va-07-foreningsstod', 'va-01-hemtjanstens-schema:0', 'true', 's')).toBeNull()
    expect(ratta('verbal', 'va-07-foreningsstod', 'va-07-foreningsstod:2', 'kanske', 's')).toBeNull()
  })
  it('passen kräver test_daily_pass', () => {
    for (const t of ['verbal-pass', 'verbal-riktat', 'numerisk-pass', 'numerisk-riktat']) expect(featureForTestType(t)).toBe('test_daily_pass')
  })
})

describe('Var du tappade', () => {
  it('bara familjer med missar, svagast först', () => {
    const t = tappadeFamiljer([
      { familj: 'kvantor', correct: false },
      { familj: 'kvantor', correct: true },
      { familj: 'direkt', correct: true },
      { familj: 'utanfor', correct: false },
    ])
    expect(t.map((x) => x.familj)).toEqual(['utanfor', 'kvantor'])
  })
})
