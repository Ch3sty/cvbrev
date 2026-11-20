// Omgång 2 steg B2: talseriernas bågar och hennes steg, spatialens vridning,
// spegling och hålmarkering, ordförrådets ordboksartikel och
// personlighetstestets skala.

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/analytics/events', () => ({ capture: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }), usePathname: () => '/x' }))
vi.mock('@/components/traning/FragaRapport', () => ({ default: () => null }))

const { hennesSteg, stegText, bagarTiming, TALRAD_BAGAR } = await import('../Talrad')
const { Steg2Uppgift, steg2Facit, steg2Ritare, tillSteg2U, kvartsVarv, arSpegelvand, halAvvikelse, ordBetydelse } = await import('../typer/Steg2')
const { forklaringInnehall } = await import('../typ')
const { default: LikertScale } = await import('@/components/personalityTest/LikertScale')

const talserie = {
  id: 'ts-1',
  difficulty: 1,
  visade: [76, 69, 62, 55, 48, 41],
  luckor: 1 as const,
  options: [[32], [33], [34], [35], [36]],
}
const talGenomgang = {
  ...talserie,
  family: 'aritmetisk',
  regel: 'Varje tal är 7 mindre än det förra.',
  bagar: [0, 1, 2, 3, 4, 5].map((i) => ({ fran: [i], till: i + 1, text: '−7' })),
  rattVisat: 2,
  misstag: ['', 'Du tog steget −8.', '', '', ''],
}

describe('talserier: bågarna och hennes steg', () => {
  it('steget räknas ur talen: differens, kvot i multiplikativa serier, summa', () => {
    expect(stegText(41, 33, false)).toBe('−8')
    expect(stegText(27, 81, true)).toBe('×3')
    expect(stegText(16, 8, true)).toBe('÷2')
    expect(stegText(16, 9, true)).toBe('−7')
    expect(hennesSteg(talGenomgang.bagar, talserie.visade, { tal: [33], ratt: [34] })).toEqual([{ j: 6, src: 5, text: '−8' }])
    // Varvad: källan är regelns, två rutor bakåt; hennes första tal räknas som källa för det andra.
    const varv = [
      { fran: [4], till: 6, text: '−11', serie: 0 as const },
      { fran: [5], till: 7, text: '+8', serie: 1 as const },
    ]
    expect(hennesSteg(varv, [108, -5, 97, 3, 86, 11], { tal: [75, 30], ratt: [75, 19] })).toEqual([{ j: 7, src: 5, text: '+19' }])
    const summa = [{ fran: [4, 5], till: 6, text: 'summa' }]
    expect(hennesSteg(summa, [20, 24, 44, 68, 112, 180], { tal: [296], ratt: [292] })[0].text).toBe('summa +4')
    expect(hennesSteg(talGenomgang.bagar, talserie.visade, { tal: [34], ratt: [34] })).toEqual([])
  })

  it('platsen över och under raden är reserverad från start, bågarna och felsteget kommer bara efter facit', () => {
    const u = tillSteg2U('talserie', talserie)
    const props = { u, nr: 1, antal: 6, vald: null, facit: null, last: false }
    const { container, rerender } = render(<Steg2Uppgift {...props} />)
    expect(screen.getByRole('heading', { name: 'Vilket tal kommer härnäst?' })).toBeTruthy()
    expect(container.querySelector('[data-talrad-overlay]')).toBeNull()
    const yta = container.querySelector('[data-talrad]')!.parentElement as HTMLElement
    const fore = `${yta.style.paddingTop}|${yta.style.paddingBottom}`
    expect(fore).toContain(String(TALRAD_BAGAR.ovan))
    rerender(<Steg2Uppgift {...props} vald={1} facit={2} last facitData={talGenomgang} />)
    expect(`${yta.style.paddingTop}|${yta.style.paddingBottom}`).toBe(fore)
    expect(container.querySelectorAll('[data-talrad-overlay] path.talrad-bage')).toHaveLength(6)
    expect(container.querySelector('[data-hennes-steg]')?.textContent).toContain('ditt svar: −8')
    const lucka = container.querySelector('[data-lucka="fylld"]') as HTMLElement
    expect(lucka.style.animationDelay).toBe(`${bagarTiming(6).lucka}ms`)
  })

  it('rätt svar: bågarna utan rött steg', () => {
    const u = tillSteg2U('talserie', talserie)
    const { container } = render(<Steg2Uppgift u={u} nr={1} antal={6} vald={2} facit={2} last facitData={talGenomgang} />)
    expect(container.querySelector('[data-hennes-steg]')).toBeNull()
    expect(container.querySelectorAll('[data-bage]')).toHaveLength(6)
  })
})

describe('spatial: vridning, spegling och hål', () => {
  const ref = { kind: 'brick' as const, n: 3 as const, cells: [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2]] as [number, number][], mark: [0, 2] as [number, number] }
  // Ett kvarts varv medurs.
  const vriden = { kind: 'brick' as const, n: 3 as const, cells: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]] as [number, number][], mark: [2, 2] as [number, number] }
  const speglad = { kind: 'brick' as const, n: 3 as const, cells: [[0, 2], [1, 2], [2, 2], [0, 1], [0, 0]] as [number, number][], mark: [0, 0] as [number, number] }

  it('kvarts varv och spegling ur rutorna', () => {
    expect(kvartsVarv(ref, ref)).toBe(0)
    expect(kvartsVarv(ref, vriden)).toBe(1)
    expect(kvartsVarv(vriden, ref)).toBe(3)
    expect(arSpegelvand(ref, speglad)).toBe(true)
    expect(arSpegelvand(ref, vriden)).toBe(false)
  })

  it('facit vrider referensen med gradetiketten och sätter spegellinjen på hennes spegelvända val', () => {
    const v = { id: 'sp-1', form: 'A' as const, difficulty: 1, fraga: 'Vilken figur är samma figur, bara vriden?', referens: ref, options: [vriden, speglad, ref, ref] }
    const u = tillSteg2U('spatial', v)
    const g = { ...v, rattVisat: 0, misstag: ['', 'Spegelvänd.', '', ''], forklaring: 'Vrid figuren 90° medurs.' }
    const { container } = render(<Steg2Uppgift u={u} nr={1} antal={6} vald={1} facit={0} last facitData={g} />)
    expect(container.querySelector('[data-vrid="90"]')).toBeTruthy()
    expect(container.querySelector('[data-vrid-etikett]')?.textContent).toBe('90° medurs')
    expect(container.querySelectorAll('[data-spegellinje]')).toHaveLength(1)
  })

  it('vikningens steg ersätter frågans ark och hennes extra hål markeras', () => {
    const ut = (hal: [number, number][]) => ({ kind: 'ark-ut' as const, n: 4 as const, hal, klipp: [] })
    expect(halAvvikelse(ut([[0, 0], [0, 3], [3, 3]]), ut([[0, 0], [0, 3]]))?.text).toBe('ett hål för mycket')
    expect(halAvvikelse(ut([[0, 0]]), ut([[0, 0], [0, 3]]))?.text).toBe('ett hål för lite')
    expect(halAvvikelse(ut([[0, 0]]), ut([[0, 0]]))).toBeNull()
    const stans = { kind: 'ark-stans' as const, n: 4 as const, poly: [[0, 0], [2, 0], [2, 4], [0, 4]] as [number, number][], hal: [[0, 0]] as [number, number][] }
    const vik = { kind: 'ark-vik' as const, n: 4 as const, poly: [[0, 0], [4, 0], [4, 4], [0, 4]] as [number, number][], rorlig: [[2, 0], [4, 0], [4, 4], [2, 4]] as [number, number][], linje: [[2, 0], [2, 4]] as [[number, number], [number, number]], pil: [[3, 2], [1, 2]] as [[number, number], [number, number]] }
    const v = { id: 'sp-2', form: 'B' as const, difficulty: 1, fraga: 'Hur ser arket ut uppvikt?', sekvens: [vik, stans], options: [ut([[0, 0], [0, 3]]), ut([[0, 0], [0, 3], [3, 3]]), ut([[0, 0]]), ut([[3, 3]])] }
    const u = tillSteg2U('spatial', v)
    const g = { ...v, rattVisat: 0, misstag: ['', 'Ett hål för mycket.', '', ''], forklaring: 'Hålen speglas över viklinjen.', uppvikning: [ut([[0, 0], [0, 3]])] }
    const { container } = render(<Steg2Uppgift u={u} nr={1} antal={6} vald={1} facit={0} last facitData={g} />)
    const steg = container.querySelectorAll('[data-vik-steg]')
    expect(steg).toHaveLength(3)
    expect(steg[1].getAttribute('data-vik-steg')).toBe('ratt')
    expect(steg[2].textContent).toBe('Ditt svar: ett hål för mycket')
    expect(container.querySelectorAll('[data-hal-marke] circle')).toHaveLength(1)
    // Frågans ark står kvar osynligt och håller kortets höjd.
    expect(container.querySelector('[data-spatial-sekvens]')?.parentElement?.className).toContain('opacity-0')
  })
})

describe('ordförråd: ordkortet och ordboksartikeln', () => {
  const v = { id: 'of-1', typ: 'synonym' as const, ord: 'bestämma', options: ['betala', 'tänka', 'besluta', 'fråga', 'föreslå'] }
  const g = {
    ...v,
    rattVisat: 2,
    misstag: ['Betala betyder bland annat ge pengar.', 'Tänka betyder bland annat överväga, låta tankarna arbeta med något.', '', 'x', 'y'],
    facit_betyder: 'fatta beslut i, avgöra',
    exempel: 'Vi måste besluta oss före fredag.',
    arMotsats: [false, false, false, false, false],
  }

  it('betydelsen ur misstagstexten', () => {
    expect(ordBetydelse('tänka', g.misstag[1])).toBe('överväga, låta tankarna arbeta med något.')
    expect(ordBetydelse('stark', 'Något helt annat.')).toBe('Något helt annat.')
  })

  it('ordkortet med glyfen och artikeln med hennes ord', () => {
    const u = tillSteg2U('ordforrad', v)
    const { container } = render(<Steg2Uppgift u={u} nr={1} antal={6} vald={null} facit={null} last={false} />)
    expect(container.querySelector('[data-ord-glyf]')).toBeTruthy()
    expect(screen.getByRole('heading').textContent).toBe('bestämma')
    const facit = steg2Facit('ordforrad', g, 1)
    const { container: c2 } = render(<>{forklaringInnehall(steg2Ritare('ordforrad'), u, facit, 1, 'svar')}</>)
    expect(c2.querySelector('[data-uppslag]')?.textContent).toContain('besluta')
    expect(c2.textContent).toContain('synonym till bestämma')
    expect(c2.textContent).toContain('fatta beslut i, avgöra.')
    expect(c2.textContent).toContain('”Vi måste besluta oss före fredag.”')
    expect(c2.querySelector('[data-hennes-ord]')?.textContent).toContain('inte en synonym')
    expect(c2.textContent).toContain('överväga, låta tankarna arbeta med något.')
  })
})

describe('personlighetstestet: Likertkorten', () => {
  it('fem kort i rad, ett tryck väljer', () => {
    const onChange = vi.fn()
    const { container } = render(<LikertScale value={4} onChange={onChange} />)
    expect(container.querySelector('[data-likert]')?.className).toContain('grid-cols-5')
    const kort = container.querySelectorAll('[role="radio"]')
    expect(kort).toHaveLength(5)
    expect(kort[0].className).toContain('h-[104px]')
    expect(kort[0].className).toContain('lg:h-[112px]')
    expect(kort[3].getAttribute('aria-checked')).toBe('true')
    fireEvent.click(kort[1])
    expect(onChange).toHaveBeenCalledWith(2)
  })
})
