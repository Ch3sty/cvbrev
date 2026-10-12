// @vitest-environment node
/**
 * Kalibreringsflaggorna (beställningen omgång 3, B4): fixturdata för
 * statusen och kontrollen att kalibrering-rapport.mjs har samma trösklar.
 */
import { describe, expect, it } from 'vitest'
import {
  BAND_GRANSER,
  MIN_KONTON,
  MIN_SVAR,
  PRIOR_AVVIKELSE,
  avvikelseTitel,
  inomBand,
  kalibreringStatus,
  sorteraKalibrering,
} from '../flaggor'
// @ts-ignore ren JavaScript
import * as R from '../../../../scripts/kalibrering-rapport.mjs'

const kal = { svar: 40, konton: 25 }

describe('kalibreringsflaggorna', () => {
  it('prior 0,40 och uppmätt 0,70 flaggas; 0,60 flaggas inte', () => {
    expect(kalibreringStatus({ ...kal, p: 0.7, p_prior: 0.4, band: 'avancerad' })).toBe('prior_fel')
    expect(kalibreringStatus({ ...kal, p: 0.6, p_prior: 0.4, band: 'avancerad' })).toBe('kalibrerad')
  })

  it('under 30 svar eller under 20 konton är okalibrerad, också med stor avvikelse', () => {
    expect(kalibreringStatus({ svar: 29, konton: 29, p: 0.95, p_prior: 0.4, band: 'expert' })).toBe('okalibrerad')
    expect(kalibreringStatus({ svar: 100, konton: 19, p: 0.95, p_prior: 0.4, band: 'expert' })).toBe('okalibrerad')
    expect(kalibreringStatus({ svar: 0, konton: 0, p: null, p_prior: 0.4, band: 'expert' })).toBe('okalibrerad')
  })

  it('fel nivå: inom priorn men utanför bandet', () => {
    expect(kalibreringStatus({ ...kal, p: 0.5, p_prior: 0.6, band: 'grund' })).toBe('fel_niva')
    expect(kalibreringStatus({ ...kal, p: 0.56, p_prior: 0.6, band: 'grund' })).toBe('kalibrerad')
    expect(inomBand('plus', 0.36)).toBe(false)
  })

  it('flaggade först, sedan okalibrerade med flest svar', () => {
    const rader = [
      { id: 'a', status: 'kalibrerad' as const, svar: 90 },
      { id: 'b', status: 'okalibrerad' as const, svar: 3 },
      { id: 'c', status: 'okalibrerad' as const, svar: 12 },
      { id: 'd', status: 'fel_niva' as const, svar: 31 },
      { id: 'e', status: 'prior_fel' as const, svar: 40 },
    ]
    expect(sorteraKalibrering(rader).map((r) => r.id)).toEqual(['e', 'd', 'c', 'b', 'a'])
  })

  it('stapelns title', () => {
    expect(avvikelseTitel(0.55, 0.71)).toBe('Antagen 0,55, uppmätt 0,71. Skillnad 0,16.')
    expect(avvikelseTitel(0.4, null)).toBe('Antagen 0,40, inga svar än.')
  })

  it('kalibrering-rapport.mjs har samma trösklar och band', () => {
    expect(R.MIN_SVAR).toBe(MIN_SVAR)
    expect(R.MIN_KONTON).toBe(MIN_KONTON)
    expect(R.PRIOR_AVVIKELSE).toBe(PRIOR_AVVIKELSE)
    for (const [band, g] of Object.entries(BAND_GRANSER)) {
      for (const p of [g.min - 0.01, g.min, (g.min + g.max) / 2, g.max, g.max + 0.01]) {
        if (p < 0 || p > 1) continue
        expect((R.BAND as Record<string, (p: number) => boolean>)[band](p), `${band} ${p}`).toBe(inomBand(band as keyof typeof BAND_GRANSER, p))
      }
    }
  })
})
