import { describe, expect, it } from 'vitest'
import { valjByte } from '../paketByte'
import { PAKETBYTE } from '@/components/pricing/paket-copy'

describe('valjByte: vad create-upgrade-session gör med en löpande prenumeration', () => {
  it('uppgraderar från ett spår till Premium, alla längder (bara all_month säljs, rutten avvisar resten före valjByte)', () => {
    for (const till of ['all_week', 'all_month', 'all_quarter'] as const) {
      expect(valjByte('cv_week', till)).toEqual({ typ: 'uppgradering' })
      expect(valjByte('test_week', till)).toEqual({ typ: 'uppgradering' })
    }
  })

  it('byter sidledes mellan CV-paketet och Träningspaketet, åt båda hållen', () => {
    expect(valjByte('test_week', 'cv_week')).toEqual({ typ: 'sidbyte' })
    expect(valjByte('cv_week', 'test_week')).toEqual({ typ: 'sidbyte' })
  })

  it('nedgraderar aldrig direkt från Premium', () => {
    for (const fran of ['all_week', 'all_month', 'all_quarter'] as const) {
      expect(valjByte(fran, 'cv_week')).toEqual({ typ: 'vidFornyelse', skal: 'nedgradering' })
      expect(valjByte(fran, 'test_week')).toEqual({ typ: 'vidFornyelse', skal: 'nedgradering' })
    }
  })

  it('byter längd på Premium först vid förnyelsen', () => {
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
  it('säger att längdbyte och nedgradering sker vid nästa förnyelse och pekar på kundportalen', () => {
    expect(PAKETBYTE.vidFornyelse('nedgradering')).toMatch(/^Nedgradering sker vid nästa förnyelse./)
    expect(PAKETBYTE.vidFornyelse('nedgradering')).toContain('Jobbcoach Premium')
    // 23.7 (c): inget byte sker av sig självt, så meningen lovar ingen automatik.
    expect(PAKETBYTE.vidFornyelse('langd')).toMatch(/^Längden byts inte mitt i en period\. Säg upp Jobbcoach Premium i kundportalen/)
    expect(PAKETBYTE.vidFornyelse('langd')).toContain('köp sedan Premium, 149 kr i månaden')
    expect(PAKETBYTE.portalHref).toBe('/api/stripe/create-portal-session')
  })

  it('ett lyckat byte namnger Premium, ett andra köp säger att kunden har det', () => {
    expect(PAKETBYTE.klart('all_month')).toBe('Du har nu Jobbcoach Premium')
    expect(PAKETBYTE.redanPaket).toBe('Du har redan Jobbcoach Premium.')
    expect(PAKETBYTE.saljsInte).toContain('Jobbcoach Premium, 149 kr i månaden')
  })

  it('har inget sidbyte kvar och inga förbjudna ord', () => {
    expect(PAKETBYTE).not.toHaveProperty('sidbyteNot')
    const alla = [
      PAKETBYTE.vidFornyelse('nedgradering'),
      PAKETBYTE.vidFornyelse('langd'),
      PAKETBYTE.arbetar,
      PAKETBYTE.redanPaket,
      PAKETBYTE.fel,
      PAKETBYTE.saljsInte,
      PAKETBYTE.tillPortalen,
    ]
    for (const t of alla) {
      expect(t).not.toMatch(/[—–]/)
      expect(t).not.toMatch(/Byt paket|paketen|ett paket|Hela paketet/)
    }
  })
})
