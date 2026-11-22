// Intervallen i avslutsstatistiken (beslut-mejl-och-radering 2b och 2c punkt 9):
// varje gräns, kvartalet i svensk tid och anledningarna.
import { describe, expect, it } from 'vitest'

import {
  ANLEDNINGAR,
  aktivitetIntervall,
  alderIntervall,
  antalIntervall,
  kvartalFor,
  lasAnledning,
  testIntervall,
} from '../avslut'

describe('alderIntervall, dagar som hela dygn', () => {
  it.each([
    [0, 'under_1_dag'],
    [1, '1_7_dagar'],
    [7, '1_7_dagar'],
    [8, '8_30_dagar'],
    [30, '8_30_dagar'],
    [31, '31_90_dagar'],
    [90, '31_90_dagar'],
    [91, '91_365_dagar'],
    [365, '91_365_dagar'],
    [366, 'over_1_ar'],
  ])('%i dagar ger %s', (dagar, vantat) => {
    expect(alderIntervall(dagar)).toBe(vantat)
  })
})

describe('antalIntervall', () => {
  it.each([
    [0, '0'],
    [1, '1'],
    [2, '2_5'],
    [5, '2_5'],
    [6, '6_plus'],
  ])('%i ger %s', (n, vantat) => {
    expect(antalIntervall(n)).toBe(vantat)
  })
})

describe('testIntervall', () => {
  it.each([
    [0, '0'],
    [1, '1_5'],
    [5, '1_5'],
    [6, '6_20'],
    [20, '6_20'],
    [21, '21_plus'],
  ])('%i ger %s', (n, vantat) => {
    expect(testIntervall(n)).toBe(vantat)
  })
})

describe('aktivitetIntervall', () => {
  const NU = new Date('2026-11-22T12:00:00Z')
  const fore = (dagar: number, extraMs = 0) => new Date(NU.getTime() - dagar * 86_400_000 - extraMs).toISOString()

  it('saknad eller trasig last_active är okant', () => {
    expect(aktivitetIntervall(null, NU)).toBe('okant')
    expect(aktivitetIntervall('inte ett datum', NU)).toBe('okant')
  })

  it.each([
    [0, 'under_1'],
    [1, '1_7'],
    [7, '1_7'],
    [8, '8_30'],
    [30, '8_30'],
    [31, '31_90'],
    [90, '31_90'],
    [91, 'over_90'],
  ])('%i hela dygn ger %s', (dagar, vantat) => {
    expect(aktivitetIntervall(fore(dagar), NU)).toBe(vantat)
  })

  it('23 timmar och 59 minuter är fortfarande under ett dygn', () => {
    expect(aktivitetIntervall(fore(0, 86_340_000), NU)).toBe('under_1')
  })
})

describe('kvartalFor i svensk tid', () => {
  it('31 december 23.30 UTC är 1 januari i Sverige: nytt år och första kvartalet', () => {
    expect(kvartalFor(new Date('2026-12-31T23:30:00Z'))).toBe('2027-01-01')
  })
  it('31 december 22.30 UTC är fortfarande fjärde kvartalet', () => {
    expect(kvartalFor(new Date('2026-12-31T22:30:00Z'))).toBe('2026-10-01')
  })
  it('kvartalens första dagar', () => {
    expect(kvartalFor(new Date('2026-02-15T12:00:00Z'))).toBe('2026-01-01')
    expect(kvartalFor(new Date('2026-04-01T08:00:00Z'))).toBe('2026-04-01')
    expect(kvartalFor(new Date('2026-09-30T12:00:00Z'))).toBe('2026-07-01')
    expect(kvartalFor(new Date('2026-11-22T12:00:00Z'))).toBe('2026-10-01')
  })
  it('30 juni 22.30 UTC är 1 juli i Sverige (sommartid)', () => {
    expect(kvartalFor(new Date('2026-06-30T22:30:00Z'))).toBe('2026-07-01')
  })
})

describe('anledningarna', () => {
  it('sex nycklar i beslutad ordning, med etiketterna R8', () => {
    expect(ANLEDNINGAR.map((a) => `${a.nyckel} ${a.etikett}`)).toEqual([
      'fick_jobb Har fått jobb',
      'soker_inte Söker inte jobb längre',
      'for_dyrt För dyrt',
      'annan_tjanst Använder en annan tjänst',
      'fungerade_inte Gjorde inte det jag behövde',
      'integritet Vill ta bort mina uppgifter',
    ])
  })

  it('lasAnledning släpper bara de sex nycklarna', () => {
    for (const a of ANLEDNINGAR) expect(lasAnledning(a.nyckel)).toBe(a.nyckel)
    for (const v of [null, undefined, '', 'annat', 'Fick_jobb', 'fick_jobb ', 3, {}, ['fick_jobb']]) {
      expect(lasAnledning(v)).toBeNull()
    }
  })
})
