import { describe, expect, it } from 'vitest'
import { valjByte } from '../paketByte'
import { PAKETBYTE } from '@/components/pricing/paket-copy'

describe('valjByte: vad create-upgrade-session gör med en löpande prenumeration', () => {
  it('uppgraderar från ett spår till Hela paketet, alla längder', () => {
    for (const till of ['all_week', 'all_month', 'all_quarter'] as const) {
      expect(valjByte('cv_week', till)).toEqual({ typ: 'uppgradering' })
      expect(valjByte('test_week', till)).toEqual({ typ: 'uppgradering' })
    }
  })

  it('byter sidledes mellan CV-paketet och Träningspaketet, åt båda hållen', () => {
    expect(valjByte('test_week', 'cv_week')).toEqual({ typ: 'sidbyte' })
    expect(valjByte('cv_week', 'test_week')).toEqual({ typ: 'sidbyte' })
  })

  it('nedgraderar aldrig direkt från Hela paketet', () => {
    for (const fran of ['all_week', 'all_month', 'all_quarter'] as const) {
      expect(valjByte(fran, 'cv_week')).toEqual({ typ: 'vidFornyelse', skal: 'nedgradering' })
      expect(valjByte(fran, 'test_week')).toEqual({ typ: 'vidFornyelse', skal: 'nedgradering' })
    }
  })

  it('byter längd på Hela paketet först vid förnyelsen', () => {
    expect(valjByte('all_week', 'all_month')).toEqual({ typ: 'vidFornyelse', skal: 'langd' })
    expect(valjByte('all_quarter', 'all_week')).toEqual({ typ: 'vidFornyelse', skal: 'langd' })
  })

  it('blockerar samma paket, okänt pris och Dagspasset som dubblett', () => {
    expect(valjByte('cv_week', 'cv_week')).toEqual({ typ: 'dubblett' })
    expect(valjByte('all_month', 'all_month')).toEqual({ typ: 'dubblett' })
    expect(valjByte(null, 'all_week')).toEqual({ typ: 'dubblett' })
    expect(valjByte('cv_week', null)).toEqual({ typ: 'dubblett' })
    expect(valjByte('cv_week', 'all_day')).toEqual({ typ: 'dubblett' })
  })
})

describe('PAKETBYTE, beskeden', () => {
  it('säger att nedgraderingen sker vid nästa förnyelse och pekar på kundportalen', () => {
    expect(PAKETBYTE.vidFornyelse('nedgradering')).toMatch(/^Nedgradering sker vid nästa förnyelse\./)
    expect(PAKETBYTE.vidFornyelse('nedgradering')).toContain('Hela paketet')
    expect(PAKETBYTE.vidFornyelse('langd')).toMatch(/^Byte av längd sker vid nästa förnyelse\./)
    expect(PAKETBYTE.portalHref).toBe('/api/stripe/create-portal-session')
    expect(PAKETBYTE.klart('test_week')).toBe('Du har nu Träningspaketet')
    expect(PAKETBYTE.klart('cv_week')).toBe('Du har nu CV-paketet')
  })

  it('har inga talstreck', () => {
    const alla = [
      PAKETBYTE.vidFornyelse('nedgradering'),
      PAKETBYTE.vidFornyelse('langd'),
      PAKETBYTE.sidbyteNot,
      PAKETBYTE.tillPortalen,
    ]
    for (const t of alla) expect(t).not.toMatch(/[—–]/)
  })
})
