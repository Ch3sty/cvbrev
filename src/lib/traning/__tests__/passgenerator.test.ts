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
import { ATERANVAND_EFTER_DAGAR, BANK_RACKER_30_DAGAR, BANK_RACKER_MINST_PER_NIVA } from '../flaggor'
import { VALBARA_AVANCERAD, VALBARA_EXPERT, VALBARA_GRUND } from '@/lib/logicTestV7/selectQuestions.v7'
import { chansRatt, passUppdatering } from '../niva'
import { hashString, mulberry32 } from '@/lib/logicTestV7/blanda'

const IDAG = '2026-10-10'

/**
 * En syntetisk bank med familjer, 120 frågor jämnt över p 0,2 till 0,9. Sex
 * familjer och nio primitiver, så att taken (högst två per familj och per
 * primitiv) inte styr urvalet; varje fråga har eget recept.
 */
function synt(n = 120): BankFragaInfo[] {
  const fam = ['Rotation', 'Latinsk kvadrat', 'Spegling', 'Antal', 'Överlagring', 'Vandring']
  return Array.from({ length: n }, (_, i) => ({
    id: `q${i}`,
    p: 0.2 + (0.7 * i) / (n - 1),
    prior: 3,
    family: fam[i % fam.length],
    kalla: i < n / 3 ? 'expert' : i < (2 * n) / 3 ? 'avancerad' : 'grund',
    recept: `r${i}`,
    primitiv: `p${i % 9}`,
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
  it('14.6: flaggan sätts när varje nivå har minst 80 ej pensionerade, fönstret blir 30 dagar', () => {
    const minst = Math.min(VALBARA_GRUND.length, VALBARA_AVANCERAD.length, VALBARA_EXPERT.length)
    expect(BANK_RACKER_30_DAGAR).toBe(minst >= BANK_RACKER_MINST_PER_NIVA)
    expect(BANK_RACKER_30_DAGAR).toBe(true)
    expect(ATERANVAND_EFTER_DAGAR).toBe(30)
  })

  it('friskhet: aldrig sedd, efter fönstret, inte förra veckan, minst två dagar, aldrig i går eller i dag', () => {
    expect(friskhet(undefined, IDAG)).toBe(0)
    expect(friskhet(laggTill(IDAG, -ATERANVAND_EFTER_DAGAR), IDAG)).toBe(1)
    expect(friskhet(laggTill(IDAG, -14), IDAG)).toBe(2)
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
      ...bank.slice(0, 6).map((q) => ({ id: q.id, dag: laggTill(IDAG, -(ATERANVAND_EFTER_DAGAR + 5)) })),
      ...bank.slice(6, 12).map((q) => ({ id: q.id, dag: laggTill(IDAG, -3) })),
    ]
    const u = valjPass({ bank, niva: 5, sedda, idag: IDAG, seed: 's5' })
    expect(u.fragor).toHaveLength(9)
    expect(u.ateranvanda).toBe(9)
    // Alla sex som är äldst kom med.
    for (const q of bank.slice(0, 6)) expect(u.fragor).toContain(q.id)
    // Upprepade är bara de som sågs inom återanvändningsfönstret (friskhet 2 och 3), inte de äldre.
    const nyligen = new Set(bank.slice(6, 12).map((q) => q.id))
    expect(u.upprepade).toHaveLength(3)
    expect(u.upprepade.every((id) => nyligen.has(id))).toBe(true)
  })

  it('upprepade: riktat pass, generalrepetition och mätningens pooler fyller fältet', () => {
    const bank = synt(60)
    const sedda: Sedd[] = bank.map((q) => ({ id: q.id, dag: laggTill(IDAG, -5) }))
    expect(valjRiktat({ bank, family: 'Rotation', niva: 5, sedda, idag: IDAG, seed: 'r' }).upprepade).toHaveLength(9)
    const g = valjGeneral({ bank, antal: 18, sedda, idag: IDAG, seed: 'g' })
    expect(g.upprepade).toEqual(expect.arrayContaining(g.fragor))
    expect(g.upprepade).toHaveLength(18)
    const m = valjPooler({ bank, sedda, idag: IDAG, seed: 'm' })
    const iPoolerna = [...m.pooler.latt, ...m.pooler.mellan, ...m.pooler.svar]
    expect(m.upprepade.sort()).toEqual(iPoolerna.sort())
    expect(valjPooler({ bank, sedda: [], idag: IDAG, seed: 'm' }).upprepade).toEqual([])
  })

  it('fjorton grundpass med upprepningar från dag 4: den som memorerar driver inte nivån', () => {
    // 28 grundfrågor kring nivå 5, som grundbanken före 3c. Användaren har
    // sann nivå 5,0 och kan svaret på varje fråga hon sett (memorerar). Utan
    // filtret drev hon från 5,0 till 6,9 (simuleringen i 14 underlag).
    // Tjugo seedade körningar: snittet ska ligga inom 0,3 från start, och
    // utan filtret ska samma användare driva uppåt (kontrollen att
    // simuleringen faktiskt memorerar).
    const bank: BankFragaInfo[] = Array.from({ length: 28 }, (_, i) => ({
      id: `g${i}`,
      p: 0.35 + (0.5 * i) / 27,
      prior: 3,
      family: null,
      kalla: 'grund',
    }))
    const kor = (seed: string, filtrera: boolean) => {
      const rng = mulberry32(hashString(seed))
      const sett = new Set<string>()
      const sedda: Sedd[] = []
      let niva = 5
      let upprepningar = 0
      for (let d = 0; d < 14; d++) {
        const dag = laggTill(IDAG, d)
        const u = valjPass({ bank, niva, sedda, idag: dag, seed: `p${d}`, endastGrund: true })
        if (d >= 3) upprepningar += u.upprepade.length
        const raknas = filtrera ? u.fragor.filter((id) => !u.upprepade.includes(id)) : u.fragor
        const svar = raknas.map((id) => {
          const p = bank.find((q) => q.id === id)!.p
          return { p, correct: sett.has(id) || rng() < chansRatt(5, p) }
        })
        niva = passUppdatering(niva, svar).niva
        for (const id of u.fragor) {
          sett.add(id)
          sedda.push({ id, dag })
        }
      }
      return { niva, upprepningar }
    }
    const seeds = Array.from({ length: 20 }, (_, i) => `memorera${i}`)
    const med = seeds.map((s) => kor(s, true))
    const utan = seeds.map((s) => kor(s, false))
    const snitt = (xs: { niva: number }[]) => xs.reduce((a, x) => a + x.niva, 0) / xs.length
    expect(med.every((r) => r.upprepningar > 0)).toBe(true)
    expect(Math.abs(snitt(med) - 5)).toBeLessThanOrEqual(0.3)
    expect(snitt(utan)).toBeGreaterThan(6)
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
  const { pooler } = valjPooler({ bank: synt(), sedda: [], idag: IDAG, seed: 'm' })

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
    const { fragor: ids, upprepade } = valjGeneral({ bank: synt(), antal: 18, sedda: [], idag: IDAG, seed: 'g' })
    expect(upprepade).toEqual([])
    const p =new Map(synt().map((q) => [q.id, q.p]))
    expect(ids).toHaveLength(18)
    const band = ids.map((id) => bandForP(p.get(id)!))
    expect(band.filter((b) => b === 'latt')).toHaveLength(6)
    expect(band.filter((b) => b === 'svar')).toHaveLength(6)
  })

  it('Matrigma klassisk (35) går med hela banken, alla tre nivåerna', () => {
    const { fragor: ids } = valjGeneral({ bank: bankInfo(), antal: 35, sedda: [], idag: IDAG, seed: 'g' })
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
