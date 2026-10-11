import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PaywallCard from '@/components/paywall/PaywallCard'
import { getPaywallCopy, GRATISRADER, planForPaywall } from '@/components/paywall/paywall-copy'

/**
 * Betalväggarnas copy, PW1 till PW7 ur docs/plan-paket-och-onboarding.md
 * Fas 2B avsnitt 4, med skrivregeln ur docs/design/copy-premium-2026-10-11.md.
 * Bara Jobbcoach Premium säljs: rubriken säger Premium, prisraden fulla
 * namnet med pris, knappen "Köp Premium, 149 kr i månaden".
 */

const KNAPP = 'Köp Premium, 149 kr i månaden'
const PRISRAD = 'Jobbcoach Premium, 149 kr i månaden. Säg upp när du vill.'

describe('betalväggarnas copy per spärr', () => {
  it('PW1, mall: pekar på mallen och säljer Premium', () => {
    render(<PaywallCard variant="mall" />)
    expect(screen.getByText('Mallen ingår i Premium')).toBeTruthy()
    expect(screen.getByText(/Du ser hela mallen som den blir/)).toBeTruthy()
    expect(screen.getByText(PRISRAD)).toBeTruthy()
    expect(screen.getByRole('button', { name: KNAPP })).toBeTruthy()
  })

  it('PW2, testnivå: namnger nivån och säljer Premium', () => {
    render(<PaywallCard variant="testniva" />)
    expect(screen.getByText('Avancerad nivå ingår i Premium')).toBeTruthy()
    expect(screen.getByRole('button', { name: KNAPP })).toBeTruthy()
  })

  it('arket från testrummets låsta rader namnger det låsta, sekundären är Se vad som ingår (24.3 punkt 5)', () => {
    expect(getPaywallCopy('testniva', { plats: 'riktat' }).title).toBe('Riktade pass ingår i Premium')
    expect(getPaywallCopy('testniva', { plats: 'generalrepetition' }).title).toBe('Generalrepetitionen ingår i Premium')
    expect(getPaywallCopy('testniva', { plats: 'ommatning' }).title).toBe('Ommätningen ingår i Premium')
    for (const plats of ['riktat', 'generalrepetition', 'ommatning', 'kurva'] as const) {
      const c = getPaywallCopy('testniva', { plats })
      expect(c.secondary).toBe('Se vad som ingår')
      expect(c.title).not.toMatch(/Avancerad nivå/)
    }
    // Testhubbens egna väggar behåller variantens rubrik.
    expect(getPaywallCopy('testniva', { plats: 'testniva' }).title).toBe('Avancerad nivå ingår i Premium')

    render(<PaywallCard variant="testniva" plats="riktat" onSecondary={() => {}} />)
    expect(screen.getByText('Riktade pass ingår i Premium')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Se vad som ingår' })).toBeTruthy()
    expect(screen.queryByText('Kör grundnivån igen')).toBeNull()
  })

  it('en spårkund får samma vägg, och knappen går till prenumerationssidan (17.5)', () => {
    const ursprung = window.location
    Object.defineProperty(window, 'location', { configurable: true, writable: true, value: { href: '' } })
    try {
      render(<PaywallCard variant="mall" scope="tester" />)
      expect(screen.getByText('Mallen ingår i Premium')).toBeTruthy()
      expect(screen.getByText(PRISRAD)).toBeTruthy()
      fireEvent.click(screen.getByRole('button', { name: KNAPP }))
      expect(window.location.href).toBe('/dashboard/profil/prenumeration')
    } finally {
      Object.defineProperty(window, 'location', { configurable: true, writable: true, value: ursprung })
    }
  })

  it('LinkedIn: fulla namnet i rubriken och kort prisrad (krock 2)', () => {
    render(<PaywallCard variant="linkedin" />)
    expect(screen.getByText('LinkedIn-optimeringen ingår i Jobbcoach Premium')).toBeTruthy()
    expect(screen.getByText('149 kr i månaden, säg upp när du vill.')).toBeTruthy()
  })

  it('PW3, analys: kvitterar poängen och det tyngsta fyndet före priset', () => {
    render(<PaywallCard variant="analys" />)
    expect(screen.getByText('Åtgärderna ingår i Premium')).toBeTruthy()
    expect(screen.getByText(/Du har sett det tyngsta fyndet och din läsbarhetspoäng/)).toBeTruthy()
    expect(screen.getByRole('button', { name: KNAPP })).toBeTruthy()
    // Ingen ATS-förekomst i den rekommenderade texten.
    expect(document.body.textContent).not.toMatch(/ATS/)
  })

  it('PW4, brevnedladdning: värdet först, spärren sedan', () => {
    render(<PaywallCard variant="nedladdning" />)
    // copy-premium 9.1: har kunden fått något på ytan står det i rubriken.
    expect(screen.getByText('Ditt personliga brev är klart')).toBeTruthy()
    expect(screen.getByText(/Läs och kopiera det fritt. Nedladdning som PDF och Word ingår i Premium/)).toBeTruthy()
    expect(screen.getByText('Kopiera texten i stället')).toBeTruthy()
    expect(document.body.textContent).not.toMatch(/Lås upp/)
  })

  it('PW5, cv-export: erkänner vad användaren gjort innan den säljer', () => {
    render(<PaywallCard variant="cv-export" />)
    expect(screen.getByText('Din gratis nedladdning är använd')).toBeTruthy()
    expect(screen.getByText(/Du har laddat ner ett CV/)).toBeTruthy()
    expect(document.body.textContent).not.toMatch(/42 mallar/)
  })

  it('PW6, jobbträffar: fulla namnet en gång, i prisraden', () => {
    render(<PaywallCard variant="jobbtraffar" hiddenCount={22} />)
    expect(screen.getByText('Se varför du passar för alla 25')).toBeTruthy()
    expect(screen.getByRole('button', { name: KNAPP })).toBeTruthy()
    expect((document.body.textContent ?? '').split('Jobbcoach Premium').length).toBe(2)
  })

  it('PW7, chatten: gränsen är per konto, aldrig "dagens"', () => {
    render(<PaywallCard variant="chatt" />)
    expect(screen.getByText('Dina tio meddelanden är använda')).toBeTruthy()
    expect(document.body.textContent).not.toMatch(/[Dd]agens meddelanden/)
  })

  it('ingen variant innehåller talstreck, gamla paket eller för lång knapp', () => {
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
      'linkedin',
      'bli-upptackt',
      'historik',
    ] as const

    for (const variant of varianter) {
      const copy = getPaywallCopy(variant)
      const text = [copy.title, copy.body, copy.primary, copy.secondary, copy.prisrad ?? ''].join(' ')
      expect(text, `${variant} har talstreck`).not.toMatch(/—/)
      expect(text, `${variant} säger ett gammalt paket`).not.toMatch(
        /Hela paketet|paketen|CV-paketet|Träningspaketet|Dagspasset|Uppgradera/
      )
      expect(copy.title.length, `${variant}: rubrik över 56`).toBeLessThanOrEqual(56)
      // Knappen ryms på 360 px: högst 30 tecken (copy-premium avsnitt 8).
      expect(copy.primary.length, `${variant}: primär över 30`).toBeLessThanOrEqual(30)
      expect(copy.secondary.length, `${variant}: sekundär över 24`).toBeLessThanOrEqual(24)
    }
  })
})

describe('vilket paket betalväggen föreslår', () => {
  it('alltid Jobbcoach Premium, 149 kr i månaden (17.3)', () => {
    for (const v of ['mall', 'cv-export', 'nedladdning', 'analys', 'testniva', 'chatt', 'jobbtraffar'] as const) {
      expect(planForPaywall(v), v).toBe('all_month')
      for (const track of ['cv', 'tester', 'allt'] as const) {
        expect(planForPaywall(v, { track }), `${v}/${track}`).toBe('all_month')
      }
    }
  })

  it('också den nedgraderade, och ett osålt paket i opts blir Premium', () => {
    expect(getPaywallCopy('nedgraderad').plan).toBe('all_month')
    expect(getPaywallCopy('nedgraderad').primary).toBe(KNAPP)
    expect(getPaywallCopy('mall', { plan: 'cv_week' }).plan).toBe('all_month')
    expect(getPaywallCopy('mall', { plan: 'all_day' }).primary).toBe(KNAPP)
  })
})

describe('gratisnivåns rader, GR1 till GR7', () => {
  it('följer formeln och håller sig under 50 tecken', () => {
    for (const [nyckel, rad] of Object.entries(GRATISRADER)) {
      expect(rad.length, `${nyckel} över 50 tecken`).toBeLessThanOrEqual(50)
      expect(rad, `${nyckel} slutar med utropstecken`).not.toMatch(/!$/)
      expect(rad, `${nyckel} innehåller ordet bara`).not.toMatch(/\bbara\b/)
      expect(rad, `${nyckel} lovar gratis för alltid`).not.toMatch(/gratis för alltid/)
      // Spec-rummen 23.3: gratisnivån beskrivs utan dygn tills gaterna är ett.
      expect(rad, `${nyckel} nämner dygn`).not.toMatch(/dygn/)
    }
  })

  it('mallraden säger tre, samma siffra som spärrtexten', () => {
    expect(GRATISRADER.mallar).toBe('3 mallar ingår i gratisnivån')
  })

  it('chattraden säger per konto, eftersom det är den ändrade gränsen', () => {
    expect(GRATISRADER.chatt).toMatch(/per konto/)
  })
})

describe('nycklarna', () => {
  it('sex nycklar, namnen i bestämd form och priserna ur ägarens beslut', async () => {
    const { PLANS } = await import('@/lib/plans/plans')
    expect(PLANS.map((p) => [p.key, p.name, p.amount])).toEqual([
      ['cv_week', 'CV-paketet', 79],
      ['test_week', 'Träningspaketet', 79],
      ['all_day', 'Dagspasset', 49],
      ['all_week', 'Jobbcoach Premium', 99],
      ['all_month', 'Jobbcoach Premium', 149],
      ['all_quarter', 'Jobbcoach Premium', 299],
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

  it('spåren låser upp sitt eget spår, Premium låser upp båda', async () => {
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
