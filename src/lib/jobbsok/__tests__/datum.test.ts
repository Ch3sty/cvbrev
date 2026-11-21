import { describe, expect, it } from 'vitest'
import { dagFor, franStockholm, idagSv, klockslag, langDagMedAr, sedanDuTittade, sedanText, tidpunkt } from '../datum'
import { sistaAnsokningsdag } from '../matchning'

// Lördag 21 november 2026.
const IDAG = '2026-11-21'

describe('sedanText', () => {
  it('samma dag och dagen före', () => {
    expect(sedanText('2026-11-21', IDAG)).toBe('i dag')
    expect(sedanText('2026-11-20', IDAG)).toBe('i går')
  })

  it('två till sex dagar sedan: veckodagen bakåt', () => {
    expect(sedanText('2026-11-19', IDAG)).toBe('i torsdags')
    expect(sedanText('2026-11-18', IDAG)).toBe('i onsdags')
    expect(sedanText('2026-11-17', IDAG)).toBe('i tisdags')
    expect(sedanText('2026-11-16', IDAG)).toBe('i måndags')
    expect(sedanText('2026-11-15', IDAG)).toBe('i söndags')
    expect(sedanText('2026-11-27', '2026-12-02')).toBe('i fredags')
    expect(sedanText('2026-11-28', '2026-11-30')).toBe('i lördags')
  })

  it('sju dagar eller mer: datumet', () => {
    expect(sedanText('2026-11-14', IDAG)).toBe('den 14 november')
    expect(sedanText('2026-11-12', IDAG)).toBe('den 12 november')
    expect(sedanText('2025-12-31', IDAG)).toBe('den 31 december')
  })

  it('en dag framåt läses som i dag', () => {
    expect(sedanText('2026-11-22', IDAG)).toBe('i dag')
  })
})

describe('langDagMedAr', () => {
  it('dag, månad och år', () => {
    expect(langDagMedAr('2026-11-06')).toBe('6 november 2026')
    expect(langDagMedAr('2025-12-31')).toBe('31 december 2025')
  })

  it('dagens datum i svensk tid, också strax efter midnatt', () => {
    // 23.30 UTC den 20 november är 00.30 den 21 november i Stockholm.
    expect(langDagMedAr(idagSv(new Date('2026-11-20T23:30:00Z')))).toBe('21 november 2026')
  })
})

describe('sedanDuTittade', () => {
  it('räknar dagen i svensk tid', () => {
    // 23.30 UTC den 16 november är 00.30 den 17 november i Stockholm (tisdag).
    expect(sedanDuTittade('2026-11-16T23:30:00Z', IDAG)).toBe('Sedan du tittade i tisdags')
    expect(sedanDuTittade('2026-11-16T22:30:00Z', IDAG)).toBe('Sedan du tittade i måndags')
  })

  it('i dag, i går och datum', () => {
    expect(sedanDuTittade('2026-11-21T08:00:00Z', IDAG)).toBe('Sedan du tittade i dag')
    expect(sedanDuTittade('2026-11-20T08:00:00Z', IDAG)).toBe('Sedan du tittade i går')
    expect(sedanDuTittade('2026-11-12T08:00:00Z', IDAG)).toBe('Sedan du tittade den 12 november')
  })

  it('ingen eller trasig tidpunkt ger ingen rad', () => {
    expect(sedanDuTittade(null, IDAG)).toBeNull()
    expect(sedanDuTittade(undefined, IDAG)).toBeNull()
    expect(sedanDuTittade('inte ett datum', IDAG)).toBeNull()
  })
})

// Klicktestet 2026-11-21: annonsens sista ansökningsdag kommer utan tidszon
// ("2026-11-30T23:59:59") och är svensk lokal tid. Servern (UTC) skrev 1 dec.
describe('dagFor och tidpunkt: tid utan zon är svensk tid', () => {
  const zoner = ['UTC', 'Europe/Stockholm', 'America/Los_Angeles', 'Asia/Tokyo']
  const forra = process.env.TZ

  for (const zon of zoner) {
    it(`samma dag oavsett maskinens zon (${zon})`, () => {
      process.env.TZ = zon
      try {
        expect(dagFor('2026-11-30T23:59:59')).toBe('2026-11-30')
        expect(dagFor('2026-11-30T23:59:59Z')).toBe('2026-12-01')
        expect(dagFor('2026-11-30')).toBe('2026-11-30')
        expect(dagFor('2026-06-30T23:30:00')).toBe('2026-06-30')
        expect(dagFor('2026-11-30T23:59:59+01:00')).toBe('2026-11-30')
        expect(dagFor('2026-11-30 08:00')).toBe('2026-11-30')
        expect(tidpunkt('2026-11-30T23:59:59')).toBe(Date.parse('2026-11-30T22:59:59Z'))
        expect(tidpunkt('2026-06-30T23:30:00')).toBe(Date.parse('2026-06-30T21:30:00Z'))
        expect(tidpunkt('2026-11-30T23:59:59Z')).toBe(Date.parse('2026-11-30T23:59:59Z'))
        expect(tidpunkt('2026-11-30')).toBe(Date.parse('2026-11-29T23:00:00Z'))
      } finally {
        if (forra === undefined) delete process.env.TZ
        else process.env.TZ = forra
      }
    })
  }

  it('sista ansökningsdag ur annonsen', () => {
    const nu = new Date('2026-11-21T14:00:00Z')
    const s = sistaAnsokningsdag({ application_deadline: '2026-11-30T23:59:59' }, nu)
    expect(s?.dag).toBe('2026-11-30')
    expect(s?.dagarKvar).toBe(9)
  })

  it('det som inte går att läsa ger null', () => {
    expect(dagFor('2026-02-30T10:00:00')).toBeNull()
    expect(tidpunkt('i morgon')).toBeNull()
    expect(tidpunkt(null)).toBeNull()
  })

  it('andra datum flyttas inte: date-kolumner, timestamptz och intervjutiden', () => {
    // applied_at, occurred_at, sent_at (date)
    expect(dagFor('2026-11-21')).toBe('2026-11-21')
    // created_at, status_updated_at (timestamptz med förskjutning)
    expect(dagFor('2026-11-20T23:30:00+00:00')).toBe('2026-11-21')
    expect(dagFor('2026-11-20T22:30:00.123456+00:00')).toBe('2026-11-20')
    // interview_at: 26 nov 13.30 svensk tid sparas som 12.30Z
    expect(dagFor('2026-11-26T12:30:00+00:00')).toBe('2026-11-26')
    expect(klockslag('2026-11-26T12:30:00+00:00')).toBe('13.30')
    expect(franStockholm('2026-11-26', '13:30')).toBe('2026-11-26T12:30:00.000Z')
    expect(franStockholm('2026-06-30', '23:30')).toBe('2026-06-30T21:30:00.000Z')
  })
})
