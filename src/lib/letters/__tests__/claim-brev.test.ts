/**
 * Claim av det publika brevutkastet, reglerna (publikt omgång 3, beslut 6):
 * mallen följer med, en Premiummall provas på gratisnivån, tonen och
 * annonsen följer med, och brevet skrivs i brevrummets format.
 */
import { describe, expect, it } from 'vitest'
import { brevKvot } from '../brevKvot'
import { claimKvot, claimMall, claimRad, claimRedirect, FRIA_INHAMTADE_UTKAST, lasClaimVal, publikTon, PUBLIK_FORVALD_TON } from '../claim-brev'

describe('claimKvot: brevet från startflödet och veckans gratisbrev (ägarens beslut 2026-11-22)', () => {
  const NU_K = new Date('2026-11-22T12:00:00Z')
  const NYTT_KONTO = { weekly_letter_count: 0, weekly_letter_first_used_at: null }
  const SKRIVET = { weekly_letter_count: 1, weekly_letter_first_used_at: '2026-11-20T10:00:00Z' }

  it('ett konto får hämta in ett utkast utan att det räknas', () => {
    expect(FRIA_INHAMTADE_UTKAST).toBe(1)
  })

  it('utan inhämtat brev: veckans gratisbrev är kvar', () => {
    expect(brevKvot(NYTT_KONTO, false, NU_K)).toMatchObject({ anvant: 0, kvar: 1, nastaGratisbrev: null })
  })

  it('med inhämtat brev: det räknas inte, veckans gratisbrev är kvar direkt efter att kontot skapats', () => {
    expect(claimKvot(0, false, NYTT_KONTO, NU_K).beslut).toBe('fritt')
    // Rutten rör inte räknaren när beslutet är fritt: profilen är som förut och texterna säger "kvar".
    expect(brevKvot(NYTT_KONTO, false, NU_K)).toMatchObject({ anvant: 0, kvar: 1 })
  })

  it('det första inhämtade utkastet är fritt också när veckans gratisbrev redan är skrivet', () => {
    expect(claimKvot(0, false, SKRIVET, NU_K).beslut).toBe('fritt')
  })

  it('försök att hämta in två: det andra räknas som veckans gratisbrev', () => {
    const k = claimKvot(1, false, NYTT_KONTO, NU_K)
    expect(k.beslut).toBe('raknas')
    expect(k.lage).toMatchObject({ effectiveCount: 0, windowIsStale: true })
    expect(k.lage.nextResetDate.toISOString()).toBe('2026-11-29T12:00:00.000Z')
    // Efter räkningen (raknaBrevMotKvot sätter ett från nu): veckans gratisbrev är använt.
    const efter = { weekly_letter_count: 1, weekly_letter_first_used_at: NU_K.toISOString() }
    expect(brevKvot(efter, false, NU_K)).toMatchObject({ anvant: 1, kvar: 0, nastaGratisbrev: '2026-11-29T12:00:00.000Z' })
  })

  it('försök att hämta in två när veckans gratisbrev är skrivet: nekas', () => {
    const k = claimKvot(1, false, SKRIVET, NU_K)
    expect(k.beslut).toBe('slut')
    expect(k.lage.nextResetDate.toISOString()).toBe('2026-11-27T10:00:00.000Z')
  })

  it('ett utgånget fönster räknas som tomt: ett senare utkast räknas, nekas inte', () => {
    expect(claimKvot(3, false, { weekly_letter_count: 1, weekly_letter_first_used_at: '2026-11-01T10:00:00Z' }, NU_K).beslut).toBe('raknas')
  })

  it('betalt konto: aldrig räknat', () => {
    expect(claimKvot(5, true, SKRIVET, NU_K).beslut).toBe('fritt')
  })
})

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
