import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import Nivaband, { nivabandEtikett, talText } from '../Nivaband'
import type { NivaLage } from '@/lib/tester/v4/typer'

const omatt: NivaLage = { status: 'omatt', niva: null, osakerhet: 0.6, tak: 7.5 }
const paborjad: NivaLage = { status: 'paborjad', niva: null, osakerhet: 0.6, tak: 7.5, svar: { besvarade: 8, antal: 12 } }
const matt: NivaLage = { status: 'matt', niva: 5.3, osakerhet: 0.6, tak: 7.5 }

describe('Nivaband', () => {
  it('omätt: streckad skala med typens start, ingen knopp', () => {
    const { container } = render(<Nivaband namn="Spatial förmåga" typ="spatial" lage={omatt} storlek="liten" ton="koppar" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('aria-label')).toBe('Spatial förmåga: inte mätt än')
    // Spatial förmåga har Nivåkollen sedan etapp 6: typens egen tid, aldrig matrisens "8 min".
    expect(svg.textContent).toContain('Nivåkoll, 6 min')
    expect(svg.textContent).not.toContain('Nivåtest')
    expect(container.querySelectorAll('line[stroke-dasharray]').length).toBe(3)
    expect(container.querySelector('circle')).toBeNull()
  })

  it('omätt med Nivåkoll: typens egen tid', () => {
    const fig = render(<Nivaband namn="Figurserier" typ="figurserie" lage={omatt} storlek="liten" ton="koppar" />)
    expect(fig.container.querySelector('svg')!.textContent).toContain('Nivåkoll, 7 min')
    fig.unmount()
    const mat = render(<Nivaband namn="Figurer och mönster" typ="matris" lage={omatt} storlek="liten" ton="koppar" />)
    expect(mat.container.querySelector('svg')!.textContent).toContain('Nivåkoll, 8 min')
  })

  it('påbörjad: "8 av 12 svar" utan tal', () => {
    const { container } = render(<Nivaband namn="Ordförråd" lage={paborjad} storlek="mellan" ton="koppar" />)
    const svg = container.querySelector('svg')!
    expect(svg.textContent).toContain('8 av 12 svar')
    expect(svg.getAttribute('aria-label')).toBe('Ordförråd: nivåkoll påbörjad, 8 av 12 svar')
    expect(container.querySelector('circle')).toBeNull()
    expect(container.querySelector('[data-niva]')).toBeNull()
  })

  it('mätt 5,3: knopp med talet, osäkerhet ±0,6 och zonen i ord', () => {
    const { container } = render(<Nivaband namn="Deduktiv slutledning" lage={matt} storlek="mellan" ton="koppar" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('aria-label')).toBe('Deduktiv slutledning: nivå 5,3 av 10, avancerad zon')
    expect(container.querySelector('[data-niva]')?.getAttribute('data-niva')).toBe('5,3')
    expect(container.querySelector('circle')).not.toBeNull()
    const band = container.querySelector('[data-osakerhet]')!
    // 4,7 till 5,9 på skalan: bredden är 1,2 nivåer av nio.
    const bredd = Number(band.getAttribute('width'))
    expect(bredd).toBeCloseTo((1.2 / 9) * 320, 1)
    // Zonernas namn står i mellan och stor, inte i liten.
    expect(svg.textContent).toContain('Avancerad')
  })

  it('liten: inga zonnamn, inget tak', () => {
    const { container } = render(<Nivaband namn="Talserier" lage={matt} storlek="liten" ton="koppar" />)
    expect(container.textContent).not.toContain('Grund')
    expect(container.querySelector('[data-tak]')).toBeNull()
  })

  it('stor: taket 7,5 markeras', () => {
    const { container } = render(<Nivaband namn="Figurer och mönster" lage={matt} storlek="stor" ton="koppar" />)
    expect(container.querySelector('[data-tak]')).not.toBeNull()
    expect(container.textContent).toContain('tak i dag 7,5')
  })

  it('ton: koppar för planens delar, grått för övriga', () => {
    const k = render(<Nivaband namn="A" lage={matt} storlek="liten" ton="koppar" />)
    expect(k.container.querySelector('circle')!.getAttribute('style')).toContain('var(--koppar)')
    k.unmount()
    const n = render(<Nivaband namn="A" lage={matt} storlek="liten" ton="neutral" />)
    expect(n.container.querySelector('circle')!.getAttribute('style')).toContain('var(--ink-3)')
    expect(n.container.querySelector('svg')!.getAttribute('data-ton')).toBe('neutral')
  })

  it('klampar nivån till skalan och skriver decimalkomma', () => {
    expect(talText(6.25)).toBe('6,3')
    expect(nivabandEtikett({ namn: 'X', lage: { ...matt, niva: 8.1 } })).toContain('expert zon')
    expect(nivabandEtikett({ namn: 'X', lage: { ...matt, niva: 2 } })).toContain('grund zon')
  })
})
