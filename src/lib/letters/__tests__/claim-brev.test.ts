/**
 * Claim av det publika brevutkastet, reglerna (publikt omgång 3, beslut 6):
 * mallen följer med, en Premiummall provas på gratisnivån, tonen och
 * annonsen följer med, och brevet skrivs i brevrummets format.
 */
import { describe, expect, it } from 'vitest'
import { claimMall, claimRad, claimRedirect, lasClaimVal, publikTon, PUBLIK_FORVALD_TON } from '../claim-brev'

describe('lasClaimVal', () => {
  it('mall, ton och annons ur kroppen', () => {
    expect(lasClaimVal({ token: 't', mall: 'koppar', ton: 'confident', annons: '  Vi söker en projektledare.  ' })).toEqual({
      mall: 'koppar',
      ton: 'confident',
      annons: 'Vi söker en projektledare.',
    })
  })

  it('okänd mall, okänd ton och auto blir förval', () => {
    expect(lasClaimVal({ mall: 'finns-inte', ton: 'auto' })).toEqual({ mall: null, ton: PUBLIK_FORVALD_TON, annons: null })
    expect(lasClaimVal({ mall: 42, ton: null, annons: '   ' })).toEqual({ mall: null, ton: PUBLIK_FORVALD_TON, annons: null })
    expect(lasClaimVal(null)).toEqual({ mall: null, ton: PUBLIK_FORVALD_TON, annons: null })
  })

  it('gammalt mall-id löses som i brevrummet', () => {
    // Samma alias som brevMallId i kontot: ett id som inte finns ger null, ett känt id står kvar.
    expect(lasClaimVal({ mall: 'linne' }).mall).toBe('linne')
  })

  it('annonsen kapas vid samma tak som utkastrutten', () => {
    expect(lasClaimVal({ annons: 'x'.repeat(9000) }).annons).toHaveLength(8000)
  })
})

describe('publikTon', () => {
  it('bara de fem tonerna', () => {
    for (const t of ['professional', 'enthusiastic', 'creative', 'confident', 'balanced']) expect(publikTon(t)).toBe(t)
    expect(publikTon('auto')).toBeNull()
    expect(publikTon('')).toBeNull()
    expect(publikTon(undefined)).toBeNull()
  })
})

describe('claimMall och claimRedirect', () => {
  it('ingen mall: Linne, till brevet', () => {
    const m = claimMall(null, false)
    expect(m).toEqual({ sparad: 'linne', provas: null })
    expect(claimRedirect('b1', m)).toBe('/dashboard/mina-brev/b1')
  })

  it('gratismall sparas på gratisnivån', () => {
    const m = claimMall('bjork', false)
    expect(m).toEqual({ sparad: 'bjork', provas: null })
    expect(claimRedirect('b1', m)).toBe('/dashboard/mina-brev/b1')
  })

  it('Premiummall på gratisnivån: sparas i Linne och provas i Mallar', () => {
    const m = claimMall('koppar', false)
    expect(m).toEqual({ sparad: 'linne', provas: 'koppar' })
    expect(claimRedirect('b1', m)).toBe('/dashboard/mina-brev/mallar?brev=b1&mall=koppar')
  })

  it('Premiummall med betald behörighet sparas', () => {
    const m = claimMall('koppar', true)
    expect(m).toEqual({ sparad: 'koppar', provas: null })
    expect(claimRedirect('b1', m)).toBe('/dashboard/mina-brev/b1')
  })
})

describe('claimRad', () => {
  const UTKAST = {
    role: 'Projektledare',
    employer: 'Nordhaga Bygg',
    letter_text: 'Första stycket om annonsen.\n\nAndra stycket om erfarenheten.\n\nTredje stycket.',
  }
  const NU = new Date('2026-11-22T10:00:00Z')

  it('brevrummets format: stycken, mall, ton och annons', () => {
    const rad = claimRad(UTKAST, 'u1', { mall: 'koppar', ton: 'balanced', annons: 'Annonsen' }, { sparad: 'linne', provas: 'koppar' }, NU)
    expect(rad).toMatchObject({
      user_id: 'u1',
      title: 'Projektledare',
      company: 'Nordhaga Bygg',
      job_title: 'Projektledare',
      tonality: 'balanced',
      language: 'sv',
      job_description: 'Annonsen',
      is_saved: true,
      mall_id: 'linne',
      body_stycken: ['Första stycket om annonsen.', 'Andra stycket om erfarenheten.', 'Tredje stycket.'],
      halsning: null,
      created_at: NU.toISOString(),
    })
  })

  it('utan stycken skrivs brevet som förut, utan mall', () => {
    const rad = claimRad({ ...UTKAST, letter_text: '   ' }, 'u1', { mall: null, ton: 'professional', annons: null }, { sparad: 'linne', provas: null }, NU)
    expect(rad.mall_id).toBeNull()
    expect(rad.body_stycken).toBeNull()
  })
})
