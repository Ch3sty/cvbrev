import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Bana from '../Bana'
import type { BanaDag } from '@/lib/tester/v4/typer'

const dagar = (n: number) => Array.from({ length: n }, (_, i) => `2026-11-${String(10 + i).padStart(2, '0')}`)

function bana(): BanaDag[] {
  return dagar(10).map((dag, i) => {
    const status: BanaDag['status'] = i < 3 ? 'gjord' : i === 3 ? 'idag' : i === 9 ? 'prov' : 'kommande'
    const forslag: BanaDag['forslag'] = i === 6 ? 'nivakoll' : i === 7 ? 'ovningsprov' : undefined
    return forslag ? { dag, status, forslag } : { dag, status }
  })
}

describe('Bana', () => {
  it('gjorda dagar i koppar, i dag som ring, förslagen, provdagen sist och etiketterna', () => {
    const { container } = render(<Bana bana={bana()} provdatum="2026-11-19" dagarKvar={6} />)
    const svg = container.querySelector('svg')!
    // tre gjorda och kärnan i dagens ring
    expect(svg.querySelectorAll('circle[fill="var(--koppar)"]').length).toBe(4)
    expect(svg.textContent).toContain('i dag')
    expect(svg.textContent).toContain('provet 19 nov')
    expect(svg.textContent).toContain('3 dagar')
    // föreslaget övningsprov som streckad fyrkant, föreslagen nivåkoll som streckad ring
    expect(svg.querySelectorAll('rect[stroke-dasharray]').length).toBe(1)
    expect(svg.querySelectorAll('circle[stroke-dasharray]').length).toBe(1)
    expect(container.querySelector('[role="img"]')!.getAttribute('aria-label')).toContain('6 dagar kvar')
  })

  it('utan provdatum: öppet slut, "tills det sitter"', () => {
    const b = bana().map((d): BanaDag => (d.status === 'prov' ? { dag: d.dag, status: 'kommande' } : d))
    const { container } = render(<Bana bana={b} provdatum={null} dagarKvar={null} />)
    expect(container.textContent).toContain('tills det sitter')
    expect(container.textContent).not.toContain('provet')
  })

  it('ritar inget med färre än två dagar', () => {
    expect(render(<Bana bana={[]} provdatum={null} dagarKvar={null} />).container.innerHTML).toBe('')
  })
})
