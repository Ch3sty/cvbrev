import { describe, expect, it } from 'vitest'
import {
  fordelning,
  friskhet,
  nastaAdaptivaFraga,
  valjGeneral,
  valjPass,
  valjPooler,
  valjRiktat,
  valjTema,
  valjUppvarmning,
  type BankFragaInfo,
  type Sedd,
} from '../passgenerator'
import { bankInfo } from '../bank.server'
import { bandForP, pForNiva, NARA_NIVAN_P } from '../svarighet'
import { laggTill } from '../datum'
import { ATERANVAND_EFTER_DAGAR, BANK_RACKER_30_DAGAR } from '../flaggor'

const IDAG = '2026-10-10'

/** En syntetisk bank med familjer, 120 frågor jämnt över p 0,2 till 0,9. */
function synt(n = 120): BankFragaInfo[] {
  const fam = ['Rotation', 'Latinsk kvadrat', 'Spegling', 'Antal']
  return Array.from({ length: n }, (_, i) => ({
    id: `q${i}`,
    p: 0.2 + (0.7 * i) / (n - 1),
    prior: 3,
    family: fam[i % fam.length],
    kalla: i < n / 3 ? 'expert' : i < (2 * n) / 3 ? 'avancerad' : 'grund',
  }))
}

describe('sammansättningen', () => {
  it('9 frågor blir 5 nära, 2 under, 2 över (60/20/20)', () => {
    expect(fordelning(9)).toEqual({ nara: 5, under: 2, over: 2 })
    expect(fordelning(10)).toEqual({ nara: 6, under: 2, over: 2 })
  })

  it('passet väljer 60/20/20 runt nivån, lätt till svårt, utan dubbletter', () => {
    const u = valjPass({ bank: synt(), niva: 5, sedda: [], idag: IDAG, seed: 's1' })
    expect(u.fragor).toHaveLength(9)
    expect(new Set(u.fragor).size).toBe(9)
    expect(u.sammansattning).toEqual({ nara: 5, under: 2, over: 2 })
    const p = new Map(synt().map((q) => [q.id, q.p]))
    const ps = u.fragor.map((id) => p.get(id)!)
    expect([...ps].sort((a, b) => b - a)).toEqual(ps)
    const pN = pForNiva(5)
    expect(ps.filter((x) => Math.abs(x - pN) <= NARA_NIVAN_P + 1e-9)).toHaveLength(5)
  })

  it('samma seed ger samma pass, annan seed oftast ett annat', () => {
    const a = valjPass({ bank: synt(), niva: 5, sedda: [], idag: IDAG, seed: 's1' })
    expect(valjPass({ bank: synt(), niva: 5, sedda: [], idag: IDAG, seed: 's1' })).toEqual(a)
    const andra = new Set(
      Array.from({ length: 10 }, (_, i) => valjPass({ bank: synt(), niva: 5, sedda: [], idag: IDAG, seed: `x${i}` }).fragor.join())
    )
    expect(andra.size).toBeGreaterThan(5)
  })

  it('med tema föredras temats frågor bland de nära', () => {
    const u = valjPass({ bank: synt(), niva: 5, sedda: [], idag: IDAG, seed: 's2', tema: 'Spegling' })
    const fam = new Map(synt().map((q) => [q.id, q.family]))
    expect(u.tema).toBe('Spegling')
    expect(u.fragor.filter((id) => fam.get(id) === 'Spegling').length).toBeGreaterThanOrEqual(5)
  })

  it('grundpasset tar bara frågor ur grundbanken', () => {
    const u = valjPass({ bank: synt(), niva: 6, sedda: [], idag: IDAG, seed: 's3', endastGrund: true })
    const kalla = new Map(synt().map((q) => [q.id, q.kalla]))
    expect(u.fragor.every((id) => kalla.get(id) === 'grund')).toBe(true)
    expect(u.fragor).toHaveLength(9)
  })
})

describe('återanvändningen', () => {
  it('flaggan: banken räcker inte i dag, fönstret är 14 dagar', () => {
    expect(BANK_RACKER_30_DAGAR).toBe(false)
    expect(ATERANVAND_EFTER_DAGAR).toBe(14)
  })

  it('friskhet: aldrig sedd, efter 14 dagar, inte förra veckan, minst två dagar, aldrig i går eller i dag', () => {
    expect(friskhet(undefined, IDAG)).toBe(0)
    expect(friskhet(laggTill(IDAG, -14), IDAG)).toBe(1)
    expect(friskhet(laggTill(IDAG, -8), IDAG)).toBe(2)
    expect(friskhet(laggTill(IDAG, -7), IDAG)).toBe(3)
    expect(friskhet(laggTill(IDAG, -2), IDAG)).toBe(3)
    expect(friskhet(laggTill(IDAG, -1), IDAG)).toBeNull()
    expect(friskhet(IDAG, IDAG)).toBeNull()
  })

  it('aldrig samma fråga två dagar i rad, och osedda före sedda', () => {
    const bank = synt(40)
    const igar: Sedd[] = bank.slice(0, 20).map((q) => ({ id: q.id, dag: laggTill(IDAG, -1) }))
    const u = valjPass({ bank, niva: 5, sedda: igar, idag: IDAG, seed: 's4' })
    const igarIds = new Set(igar.map((s) => s.id))
    expect(u.fragor.some((id) => igarIds.has(id))).toBe(false)
    expect(u.ateranvanda).toBe(0)
  })

  it('när banken tar slut återanvänds frågor äldst först, och urvalet säger hur många', () => {
    const bank = synt(12)
    const sedda: Sedd[] = [
      ...bank.slice(0, 6).map((q) => ({ id: q.id, dag: laggTill(IDAG, -20) })),
      ...bank.slice(6, 12).map((q) => ({ id: q.id, dag: laggTill(IDAG, -3) })),
    ]
    const u = valjPass({ bank, niva: 5, sedda, idag: IDAG, seed: 's5' })
    expect(u.fragor).toHaveLength(9)
    expect(u.ateranvanda).toBe(9)
    // Alla sex som är äldst kom med.
    for (const q of bank.slice(0, 6)) expect(u.fragor).toContain(q.id)
  })

  it('en bank där allt visades i går ger ett tomt pass, aldrig en upprepning', () => {
    const bank = synt(9)
    const u = valjPass({ bank, niva: 5, sedda: bank.map((q) => ({ id: q.id, dag: laggTill(IDAG, -1) })), idag: IDAG, seed: 's6' })
    expect(u.fragor).toEqual([])
  })
})

describe('riktat pass och tema', () => {
  it('nio frågor ur en familj, närmast nivån', () => {
    const u = valjRiktat({ bank: synt(), family: 'Rotation', niva: 5, sedda: [], idag: IDAG, seed: 'r' })
    const fam = new Map(synt().map((q) => [q.id, q.family]))
    expect(u.fragor).toHaveLength(9)
    expect(u.fragor.every((id) => fam.get(id) === 'Rotation')).toBe(true)
  })

  it('familj som saknas eller har för få frågor ger tomt urval', () => {
    expect(valjRiktat({ bank: synt(), family: 'Finns inte', niva: 5, sedda: [], idag: IDAG, seed: 'r' }).fragor).toEqual([])
    expect(valjRiktat({ bank: synt(8), family: 'Rotation', niva: 5, sedda: [], idag: IDAG, seed: 'r' }).fragor).toEqual([])
  })

  it('temat: samma familj efter ett bra pass, annars den svagaste, null utan familjer', () => {
    const bank = synt()
    expect(valjTema({ bank, sedda: [], idag: IDAG, forra: { tema: 'Antal', nasta: 'familj_upp' }, svagaste: ['Spegling'] })).toBe('Antal')
    expect(valjTema({ bank, sedda: [], idag: IDAG, forra: { tema: 'Antal', nasta: 'ny_familj' }, svagaste: ['Antal', 'Spegling'] })).toBe('Spegling')
    const utan = bank.map((q) => ({ ...q, family: null }))
    expect(valjTema({ bank: utan, sedda: [], idag: IDAG, forra: null, svagaste: [] })).toBeNull()
  })
})

describe('mätningen, adaptivt i tre band', () => {
  const pooler = valjPooler({ bank: synt(), sedda: [], idag: IDAG, seed: 'm' })

  it('poolerna ligger i rätt band', () => {
    const p = new Map(synt().map((q) => [q.id, q.p]))
    expect(pooler.latt.every((id) => bandForP(p.get(id)!) === 'latt')).toBe(true)
    expect(pooler.svar.every((id) => bandForP(p.get(id)!) === 'svar')).toBe(true)
    expect(pooler.mellan.length).toBe(12)
  })

  it('börjar i mellanbandet, rätt flyttar upp, fel ned, tolv frågor sedan klart', () => {
    const f1 = nastaAdaptivaFraga(pooler, [], 12)!
    expect(f1.band).toBe('mellan')
    const f2 = nastaAdaptivaFraga(pooler, [{ q_id: f1.id, correct: true }], 12)!
    expect(f2.band).toBe('svar')
    const f3 = nastaAdaptivaFraga(pooler, [{ q_id: f1.id, correct: true }, { q_id: f2.id, correct: false }], 12)!
    expect(f3.band).toBe('mellan')
    const f4 = nastaAdaptivaFraga(pooler, [{ q_id: f1.id, correct: false }], 12)!
    expect(f4.band).toBe('latt')

    const svar: { q_id: string; correct: boolean }[] = []
    for (let i = 0; i < 12; i++) {
      const f = nastaAdaptivaFraga(pooler, svar, 12)!
      expect(f.index).toBe(i)
      expect(svar.some((s) => s.q_id === f.id)).toBe(false)
      svar.push({ q_id: f.id, correct: true })
    }
    expect(nastaAdaptivaFraga(pooler, svar, 12)).toBeNull()
  })

  it('ett tomt band lånar från närmaste band', () => {
    const f = nastaAdaptivaFraga({ latt: ['a'], mellan: [], svar: ['c'] }, [], 3)
    expect(f?.id).toBe('a')
  })
})

describe('generalrepetitionen och uppvärmningen', () => {
  it('fast generalrepetition: antal frågor jämnt över banden, lätt till svår', () => {
    const ids = valjGeneral({ bank: synt(), antal: 18, sedda: [], idag: IDAG, seed: 'g' })
    const p = new Map(synt().map((q) => [q.id, q.p]))
    expect(ids).toHaveLength(18)
    const band = ids.map((id) => bandForP(p.get(id)!))
    expect(band.filter((b) => b === 'latt')).toHaveLength(6)
    expect(band.filter((b) => b === 'svar')).toHaveLength(6)
  })

  it('Matrigma klassisk (35) med dagens bank på 84 frågor går, med alla tre bankerna', () => {
    const ids = valjGeneral({ bank: bankInfo(), antal: 35, sedda: [], idag: IDAG, seed: 'g' })
    expect(ids).toHaveLength(35)
    expect(new Set(ids).size).toBe(35)
  })

  it('uppvärmningen: tre lätta grundfrågor, samma dag samma tre', () => {
    const a = valjUppvarmning(bankInfo(), 'uppvarmning:u:2026-10-24')
    expect(a).toHaveLength(3)
    expect(valjUppvarmning(bankInfo(), 'uppvarmning:u:2026-10-24')).toEqual(a)
    const kalla = new Map(bankInfo().map((q) => [q.id, q.kalla]))
    expect(a.every((id) => kalla.get(id) === 'grund')).toBe(true)
  })
})
