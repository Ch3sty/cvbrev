/**
 * Perioder skrivna med "till", "t.o.m.", "to" och tankstreck (efterrättning
 * B 2026-11-21). "2017 till 2019" visades förut som pågående på arket och i
 * analysen, eftersom perioder bara delades på bindestreck.
 */
import { describe, expect, it } from 'vitest'
import { delaPeriod, medDeladPeriod, startOchSlut, tolkaPeriod } from '../matt'
import { kanonisktCv } from '../kanon'
import { raknaPoang } from '../modell'
import { normalizeStructuredData } from '@/lib/cv/normalize-structured-data'
import { periodErfarenhet } from '@/lib/cv/mallar/innehall'

describe('delaPeriod', () => {
  const fall: Array<[string, string, string]> = [
    ['2017 till 2019', '2017', '2019'],
    ['2019 till 2024', '2019', '2024'],
    ['mars 2017 till juni 2019', 'mars 2017', 'juni 2019'],
    ['2019 till nu', '2019', 'nu'],
    ['2019 till pågående', '2019', 'pågående'],
    ['2017 till och med 2019', '2017', '2019'],
    ['2017 t.o.m. 2019', '2017', '2019'],
    ['jan 2017 t.o.m. dec 2019', 'jan 2017', 'dec 2019'],
    ['2017 to 2019', '2017', '2019'],
    ['March 2017 to June 2019', 'March 2017', 'June 2019'],
    ['2017–2019', '2017', '2019'],
    ['2017 – 2019', '2017', '2019'],
    ['2017—2019', '2017', '2019'],
    ['2017 - 2019', '2017', '2019'],
    ['2017-2019', '2017', '2019'],
    ['2014 - pågående', '2014', 'pågående'],
    ['2014-pågående', '2014', 'pågående'],
    ['mars 2017 – juni 2019', 'mars 2017', 'juni 2019'],
  ]
  it.each(fall)('%s', (period, start, slut) => {
    expect(delaPeriod(period)).toEqual({ start, slut })
  })

  it('år och månad med bindestreck delas inte', () => {
    expect(delaPeriod('2019-03')).toEqual({ start: '2019-03', slut: '' })
  })

  it('"till" inne i ett ord delar inte', () => {
    expect(delaPeriod('Tillträde 2019')).toEqual({ start: 'Tillträde 2019', slut: '' })
  })
})

describe('startOchSlut och medDeladPeriod', () => {
  it('hela perioden i startdatumet delas', () => {
    expect(startOchSlut('2017 till 2019', undefined)).toEqual({ start: '2017', slut: '2019' })
    expect(startOchSlut('mars 2017 till juni 2019', '')).toEqual({ start: 'mars 2017', slut: 'juni 2019' })
  })

  it('pågående blir inget slut', () => {
    expect(startOchSlut('2019 till nu', undefined)).toEqual({ start: '2019', slut: '' })
    expect(startOchSlut('2019 till pågående', undefined)).toEqual({ start: '2019', slut: '' })
  })

  it('ett slut som redan står för sig ändras inte', () => {
    expect(startOchSlut('2017', '2019')).toBeNull()
    expect(startOchSlut('2017', undefined)).toBeNull()
    expect(startOchSlut('2019-03', undefined)).toBeNull()
  })

  it('posten får slutet, pågående tar bort det', () => {
    expect(medDeladPeriod({ position: 'A', startDate: '2017 till 2019' })).toEqual({ position: 'A', startDate: '2017', endDate: '2019' })
    expect(medDeladPeriod({ position: 'A', startDate: '2019 till nu' })).toEqual({ position: 'A', startDate: '2019' })
  })
})

describe('ett avslutat jobb visas aldrig som pågående', () => {
  const rollformat = {
    name: 'Test',
    profile: 'Lagerarbetare med vana av truck och plock.',
    roles: [
      { title: 'Lagerarbetare', company: 'Lager AB', period: '2019 till 2024', responsibilities: ['Plockade order i lagret'] },
      { title: 'Butiksbiträde', company: 'Butik AB', period: '2017 till 2019', responsibilities: ['Hjälpte kunder i butiken'] },
    ],
    education: [{ degree: 'Gymnasieexamen', institution: 'Skolan', period: '2014 till 2017' }],
  }

  it('arket (normalizeStructuredData och mallarnas period)', () => {
    const cv = normalizeStructuredData(rollformat)!
    expect(cv.experience[0]).toMatchObject({ startDate: '2019', endDate: '2024' })
    expect(cv.experience[1]).toMatchObject({ startDate: '2017', endDate: '2019' })
    expect(periodErfarenhet(cv.experience[1])).toBe('2017 – 2019')
    expect(cv.education[0]).toMatchObject({ startDate: '2014', endDate: '2017' })
  })

  it('CVMetadata med hela perioden i startdatumet', () => {
    const cv = normalizeStructuredData({
      personalInfo: { fullName: 'Test', email: '' },
      experience: [{ position: 'Lagerarbetare', company: 'Lager AB', startDate: '2017 till 2019', description: [] }],
    })!
    expect(cv.experience[0].endDate).toBe('2019')
    expect(periodErfarenhet(cv.experience[0])).toBe('2017 – 2019')
  })

  it('poängmodellen läser samma period', () => {
    const cv = kanonisktCv(rollformat)!
    expect(cv.experience[1]).toMatchObject({ startDate: '2017', endDate: '2019' })
    const p = tolkaPeriod(cv.experience[1].startDate, cv.experience[1].endDate)
    expect(p).toMatchObject({ tolkbar: true, startAr: 2017, slutAr: 2019, pagar: false })
  })

  it('kanonisktCv är fortfarande idempotent', () => {
    const en = kanonisktCv(rollformat)!
    expect(kanonisktCv(en)).toEqual(en)
    expect(raknaPoang(kanonisktCv(en)!).total).toBe(raknaPoang(en).total)
  })
})
