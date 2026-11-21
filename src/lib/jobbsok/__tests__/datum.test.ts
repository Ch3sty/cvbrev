import { describe, expect, it } from 'vitest'
import { idagSv, langDagMedAr, sedanDuTittade, sedanText } from '../datum'

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
