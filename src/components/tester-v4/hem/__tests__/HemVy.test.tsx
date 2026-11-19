import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

vi.mock('@/lib/analytics/events', () => ({ capture: vi.fn() }))
vi.mock('@/components/rum/Topprad', () => ({ default: () => <div data-topprad /> }))

import HemVy from '../HemVy'
import { hintHref, hintEtikett } from '../NastaSteg'
import { typerAttVisa } from '../SaLiggerDuTill'
import { fortsattMeta } from '../FortsattDarDuSlutade'
import { fixturTester } from '@/lib/tester/v4/fixturer'
import type { Hint } from '@/lib/tester/v4/typer'

beforeEach(() => {
  try {
    window.localStorage.clear()
  } catch {
    /* jsdom */
  }
})

const text = (c: Element) => c.textContent ?? ''

describe('HemVy (tester v4, planen 3.3)', () => {
  it('utan plan: Hem på väggen, plankortet, mätta typer i Så ligger du till', () => {
    const { container } = render(<HemVy data={fixturTester('a', 'premium')} />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Hem')
    expect(container.querySelector('[data-plankort]')).not.toBeNull()
    expect(container.querySelector('[data-bana]')).toBeNull()
    expect(container.querySelector('[data-dagsmal]')).toBeNull()
    const rader = container.querySelectorAll('[data-sa-ligger] [data-typ]')
    expect(rader.length).toBeGreaterThan(0)
    expect(text(container)).not.toMatch(/\bpass\b/i)
  })

  it('Alva Logic: nedräkning, banan, dagsmålet och etiketten Ingår i Alva Logic', () => {
    const { container } = render(<HemVy data={fixturTester('b', 'premium')} />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Alva Logic')
    expect(text(container.querySelector('[data-status]')!)).toMatch(/7 dagar kvar till provet 25 nov/)
    expect(container.querySelector('[data-bana]')).not.toBeNull()
    expect(text(container.querySelector('[data-dagsmal]')!)).toMatch(/Dagsmål1 av 2 · 4 dagar i rad|Dagsmål 1 av 2 · 4 dagar i rad/)
    expect(text(container.querySelector('[data-sa-ligger]')!)).toContain('Ingår i Alva Logic')
    expect(container.querySelector('[data-plankort]')).toBeNull()
    expect(text(container)).not.toMatch(/\bpass\b/i)
  })

  it('I-provet: Nästa steg är Nivåkollen i spatial förmåga och tre delar i Så ligger du till', () => {
    const { container } = render(<HemVy data={fixturTester('c', 'premium')} />)
    const lyft = screen.getByRole('region', { name: 'Nästa steg' })
    expect(text(lyft)).toContain('Gör Nivåkollen i spatial förmåga')
    expect(container.querySelectorAll('[data-sa-ligger] [data-typ]').length).toBe(3)
    expect(container.querySelector('[data-fler-steg]')).not.toBeNull()
  })

  it('artikelingången: Lägg till provdatum, öppet slut och ett första steg som går att stänga', () => {
    const { container } = render(<HemVy data={fixturTester('b', 'gratis', { artikel: true })} />)
    expect(container.querySelector('[data-lagg-till-datum]')?.getAttribute('href')).toBe('/dashboard/tester/installningar?steg=3')
    expect(text(container.querySelector('[data-bana]')!)).toContain('tills det sitter')
    const lyft = screen.getByRole('region', { name: 'Nästa steg' })
    expect(text(lyft)).toContain('Inför Alva Logic: börja med Nivåkollen i figurer och mönster')
    fireEvent.click(screen.getByRole('button', { name: 'Stäng första steget' }))
    expect(screen.queryByRole('region', { name: 'Nästa steg' })).toBeNull()
  })

  it('gratis med dagens grundnivå gjord: raden med priset ur paketet, ordagrant', () => {
    const data = fixturTester('b', 'gratis', { kvotAnvand: true })
    const { container } = render(<HemVy data={data} />)
    const rad = container.querySelector('[data-gratisrad]')!
    expect(text(rad)).toContain(`Proven ligger på avancerad nivå. Öva där, så ofta du vill, med Premium, ${data.gratis.pris.prisrad}.`)
    expect(text(container.querySelector('[data-gratis]')!)).toContain('Det här var grundnivån')
  })

  it('gratis med grundnivån kvar och Premium: ingen gratisrad', () => {
    expect(render(<HemVy data={fixturTester('b', 'gratis')} />).container.querySelector('[data-gratis]')).toBeNull()
    expect(render(<HemVy data={fixturTester('b', 'premium')} />).container.querySelector('[data-gratis]')).toBeNull()
  })

  it('exakt en kopparknapp i vyn', () => {
    const { container } = render(<HemVy data={fixturTester('c', 'gratis', { kvotAnvand: true })} />)
    expect(container.querySelectorAll('.knapp-primar').length).toBe(1)
  })
})

describe('hintHref och hintEtikett', () => {
  const bas: Hint = {
    id: 'x',
    typ: 'svagt_monster',
    eyebrow: '',
    rubrik: '',
    skal: '',
    tips: '',
    testtyp: 'talserie',
    knapp: { slag: 'trana', etikett: 'Träna', href: '/dashboard/tester/pass?typ=steg2pass&kind=talserie', las: null },
    stangbar: false,
  }
  it('öppnar typens meny i Tester', () => {
    expect(hintHref(bas)).toBe('/dashboard/tester/alla?typ=talserie')
  })
  it('Nivåkollen i en omätt typ startar direkt', () => {
    const h: Hint = { ...bas, typ: 'nivakoll_saknas', knapp: { slag: 'nivakoll', etikett: 'Mät din nivå', href: '/dashboard/tester/pass?typ=nivakoll&kind=deduktiv', las: null } }
    expect(hintHref(h)).toBe('/dashboard/tester/pass?typ=nivakoll&kind=deduktiv')
  })
  it('låst knapp öppnar menyn och säger Ingår i Premium', () => {
    const h: Hint = { ...bas, typ: 'nivakoll_igen', knapp: { slag: 'nivakoll', etikett: 'Mät din nivå', href: '/x', las: { skal: 'premium', chip: 'Ingår i Premium' } } }
    expect(hintHref(h)).toBe('/dashboard/tester/alla?typ=talserie')
    expect(hintEtikett(h)).toBe('Ingår i Premium')
  })
})

describe('Så ligger du till och Fortsätt', () => {
  it('med plan bara planens typer, utan plan bara mätta', () => {
    const b = fixturTester('b', 'premium')
    expect(typerAttVisa(b.typer, b.plan).map((t) => t.id)).toEqual(['matris'])
    const a = fixturTester('a', 'premium')
    expect(typerAttVisa(a.typer, null).every((t) => t.niva.status !== 'omatt')).toBe(true)
  })
  it('Fortsätt: rätt av antal och när', () => {
    const a = fixturTester('a', 'premium')
    if (a.fortsatt) expect(fortsattMeta(a.fortsatt, a.idag)).toMatch(/rätt, (i dag|i går|\d+ \w+)$/)
  })
})
