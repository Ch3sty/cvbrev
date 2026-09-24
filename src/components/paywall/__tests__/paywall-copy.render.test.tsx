import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PaywallCard from '@/components/paywall/PaywallCard'
import { getPaywallCopy, GRATISRADER, planForPaywall } from '@/components/paywall/paywall-copy'

/**
 * Betalväggarnas copy, PW1 till PW7 ur docs/plan-paket-och-onboarding.md
 * Fas 2B avsnitt 4, med namnen ur beslut-paketnamn 2026-09-24. Varje variant
 * ska föreslå rätt paket, bära pris i knappen och nämna Hela paketet en gång.
 */

describe('betalväggarnas copy per spärr', () => {
  it('PW1, mall: pekar på mallen och säljer CV-paketet', () => {
    render(<PaywallCard variant="mall" />)
    expect(screen.getByText('Mallen ingår i CV-paketet, 79 kr i veckan')).toBeTruthy()
    expect(screen.getByText(/Du ser hela mallen som den blir/)).toBeTruthy()
    expect(screen.getByText('79 kr i veckan, säg upp när du vill.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Köp CV-paketet, 79 kr i veckan' })).toBeTruthy()
  })

  it('PW2, testnivå: namnger nivån och säljer Träningspaketet', () => {
    render(<PaywallCard variant="testniva" />)
    expect(screen.getByText('Avancerad nivå ingår i Träningspaketet, 79 kr i veckan')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Köp Träningspaketet, 79 kr i veckan' })).toBeTruthy()
  })

  it('PW3, analys: kvitterar poängen och det tyngsta fyndet före priset', () => {
    render(<PaywallCard variant="analys" />)
    expect(screen.getByText('Åtgärderna ligger i CV-paketet, 79 kr i veckan')).toBeTruthy()
    expect(
      screen.getByText(/Du har sett det tyngsta fyndet och din läsbarhetspoäng/)
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Se alla åtgärder, 79 kr i veckan' })).toBeTruthy()
    // Ingen ATS-förekomst i den rekommenderade texten.
    expect(document.body.textContent).not.toMatch(/ATS/)
  })

  it('PW4, brevnedladdning: värdet först, spärren sedan', () => {
    render(<PaywallCard variant="nedladdning" />)
    expect(screen.getByText('Ditt personliga brev är klart')).toBeTruthy()
    expect(screen.getByText(/Läs och kopiera det fritt/)).toBeTruthy()
    expect(screen.getByText('Kopiera texten i stället')).toBeTruthy()
    expect(document.body.textContent).not.toMatch(/Lås upp/)
  })

  it('PW5, cv-export: erkänner vad användaren gjort innan den säljer', () => {
    render(<PaywallCard variant="cv-export" />)
    expect(screen.getByText('Din gratis nedladdning är använd')).toBeTruthy()
    expect(screen.getByText(/Du har laddat ner ett CV/)).toBeTruthy()
    expect(document.body.textContent).not.toMatch(/42 mallar/)
  })

  it('PW6, jobbträffar: Hela paketet en gång, inget mindre paket föreslås', () => {
    render(<PaywallCard variant="jobbtraffar" hiddenCount={22} />)
    expect(screen.getByText('Se varför du passar för alla 25')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Köp Hela paketet, 99 kr i veckan' })).toBeTruthy()
  })

  it('PW7, chatten: gränsen är per konto, aldrig "dagens"', () => {
    render(<PaywallCard variant="chatt" />)
    expect(screen.getByText('Dina tio meddelanden är använda')).toBeTruthy()
    expect(document.body.textContent).not.toMatch(/[Dd]agens meddelanden/)
  })

  it('ingen variant innehåller talstreck', () => {
    const varianter = [
      'mall',
      'testniva',
      'analys',
      'analys-omkorning',
      'nedladdning',
      'cv-export',
      'jobbtraffar',
      'chatt',
      'kvot',
      'test-tak',
      'nedgraderad',
      'cv-antal',
      'af-rapport',
    ] as const

    for (const variant of varianter) {
      const copy = getPaywallCopy(variant)
      const text = [copy.title, copy.body, copy.primary, copy.secondary].join(' ')
      expect(text, `${variant} har talstreck`).not.toMatch(/—/)
      // Rubrik och knapp bär pris och period sedan 2026-09-24 (R1), därav längre tak.
      expect(copy.title.length, `${variant}: rubrik över 56`).toBeLessThanOrEqual(56)
      expect(copy.primary.length, `${variant}: primär över 40`).toBeLessThanOrEqual(40)
      expect(copy.secondary.length, `${variant}: sekundär över 24`).toBeLessThanOrEqual(24)
    }
  })
})

describe('vilket paket betalväggen föreslår', () => {
  it('CV-funktioner föreslår CV-paketet, testfunktioner Träningspaketet', () => {
    expect(planForPaywall('mall')).toBe('cv_week')
    expect(planForPaywall('cv-export')).toBe('cv_week')
    expect(planForPaywall('nedladdning')).toBe('cv_week')
    expect(planForPaywall('analys')).toBe('cv_week')
    expect(planForPaywall('testniva')).toBe('test_week')
  })

  it('funktioner som bara Hela paketet ger föreslår Hela paketet', () => {
    expect(planForPaywall('chatt')).toBe('all_week')
    expect(planForPaywall('jobbtraffar')).toBe('all_week')
  })

  it('har hon valt Hela paketet föreslås aldrig ett smalare paket', () => {
    expect(planForPaywall('mall', { track: 'allt' })).toBe('all_week')
    expect(planForPaywall('testniva', { track: 'allt' })).toBe('all_week')
  })
})

describe('gratisnivåns rader, GR1 till GR7', () => {
  it('följer formeln och håller sig under 50 tecken', () => {
    for (const [nyckel, rad] of Object.entries(GRATISRADER)) {
      expect(rad.length, `${nyckel} över 50 tecken`).toBeLessThanOrEqual(50)
      expect(rad, `${nyckel} slutar med utropstecken`).not.toMatch(/!$/)
      expect(rad, `${nyckel} innehåller ordet bara`).not.toMatch(/\bbara\b/)
      expect(rad, `${nyckel} lovar gratis för alltid`).not.toMatch(/gratis för alltid/)
    }
  })

  it('mallraden säger tre, samma siffra som spärrtexten', () => {
    expect(GRATISRADER.mallar).toBe('3 mallar ingår i gratisnivån')
  })

  it('chattraden säger per konto, eftersom det är den ändrade gränsen', () => {
    expect(GRATISRADER.chatt).toMatch(/per konto/)
  })
})

describe('paketen', () => {
  it('sex paket, med namnen i bestämd form och priserna ur ägarens beslut', async () => {
    const { PLANS } = await import('@/lib/plans/plans')
    expect(PLANS.map((p) => [p.key, p.name, p.amount])).toEqual([
      ['cv_week', 'CV-paketet', 79],
      ['test_week', 'Träningspaketet', 79],
      ['all_day', 'Dagspasset', 49],
      ['all_week', 'Hela paketet', 99],
      ['all_month', 'Hela paketet', 149],
      ['all_quarter', 'Hela paketet', 299],
    ])
  })

  it('bara Dagspasset är ett engångsköp, och den ger ett dygn', async () => {
    const { PLANS, PLAN_BY_KEY } = await import('@/lib/plans/plans')
    expect(PLANS.filter((p) => p.mode === 'payment').map((p) => p.key)).toEqual(['all_day'])
    expect(PLAN_BY_KEY.all_day.grantDays).toBe(1)
    // Prenumerationerna ger inga dagar: de löper tills kunden säger upp.
    for (const plan of PLANS.filter((p) => p.mode === 'subscription')) {
      expect(plan.grantDays).toBeUndefined()
    }
  })

  it('spåren låser upp sitt eget spår, Allt låser upp båda', async () => {
    const { PLAN_BY_KEY } = await import('@/lib/plans/plans')
    expect(PLAN_BY_KEY.cv_week.scope).toBe('cv')
    expect(PLAN_BY_KEY.test_week.scope).toBe('tester')
    for (const key of ['all_day', 'all_week', 'all_month', 'all_quarter'] as const) {
      expect(PLAN_BY_KEY[key].scope).toBe('allt')
    }
  })

  it('varje paket har en rad som säger vem det passar', async () => {
    const { PLANS } = await import('@/lib/plans/plans')
    for (const plan of PLANS) {
      expect(plan.audience.length).toBeGreaterThan(0)
      expect(plan.highlights.length).toBeGreaterThan(0)
    }
  })
})
