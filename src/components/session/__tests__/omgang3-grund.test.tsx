// Omgång 3 steg 1, grunden i formspråket: stapelns bitar, domen i tre toner,
// klossarnas lägen, huvudets kapslar (nivå och rätt i rad) och uppgiftens
// nivå ur motorns svar.

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/analytics/events', () => ({ capture: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }), usePathname: () => '/x' }))
vi.mock('@/components/traning/FragaRapport', () => ({ default: () => null }))

const { default: SessionsRam, Bitar, bitarFranArk, bitarFranFramsteg, nivaText } = await import('../SessionsRam')
const { SvarRad, SvarRuta, SvarTal, TreFasta } = await import('../Svarskort')
const { default: Forklaringen } = await import('../Forklaringen')
const { tranaBitar, nivaRiktning, lasRamNiva } = await import('../lagen/Trana')
const { personlighetsBitar } = await import('@/components/personalityTest/TestSessionView')
const { default: LikertScale } = await import('@/components/personalityTest/LikertScale')
const { uppgiftsNivaFalt, nivaUrP } = await import('@/lib/tester/v4/uppgiftsniva')
const { SESSION } = await import('../copy')

globalThis.ResizeObserver = class {
  observe() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

const bitLagen = (c: HTMLElement) => Array.from(c.querySelectorAll('.sess-bit')).map((b) => b.getAttribute('data-bit'))

describe('stapelns bitar', () => {
  it('en bit per uppgift med sitt läge', () => {
    const { container } = render(<Bitar bitar={['ratt', 'fel', 'vet', 'aktuell', 'tom', 'besvarad']} />)
    expect(bitLagen(container)).toEqual(['ratt', 'fel', 'vet', 'aktuell', 'tom', 'besvarad'])
  })
  it('Träna: rätt, fel, vet och aktuell; rätt i rad nollas vid fel och vet', () => {
    const utfall: Record<string, 'ratt' | 'fel' | 'vet'> = { a: 'ratt', b: 'fel', c: 'ratt', d: 'ratt', e: 'ratt' }
    const r = tranaBitar(['a', 'b', 'c', 'd', 'e', 'f'], (n) => utfall[n] ?? null, 5, true)
    expect(r.bitar).toEqual(['ratt', 'fel', 'ratt', 'ratt', 'ratt', 'aktuell'])
    expect(r.iRad).toBe(3)
    const vet = tranaBitar(['a', 'b'], (n) => (n === 'a' ? 'ratt' : 'vet'), 2, true)
    expect(vet.iRad).toBe(0)
  })
  it('Träna utan förklaring efter svaret: bara besvarad, aldrig rätt i rad', () => {
    const r = tranaBitar(['a', 'b', 'c'], (n) => (n === 'c' ? null : 'ratt'), 2, false)
    expect(r.bitar).toEqual(['besvarad', 'besvarad', 'aktuell'])
    expect(r.iRad).toBe(0)
  })
  it('nivåtest och prov: besvarad eller inte, ur arket eller framsteget', () => {
    expect(bitarFranArk(['besvarad', 'hoppad', 'aktuell', 'kvar'])).toEqual(['besvarad', 'tom', 'tom', 'tom'])
    expect(bitarFranFramsteg(4, 0.5)).toEqual(['besvarad', 'besvarad', 'tom', 'tom'])
  })
  it('personlighetstestet: tio bitar om fem påståenden', () => {
    const svar: (number | null)[] = Array(50).fill(null)
    for (let i = 0; i < 7; i++) svar[i] = 3
    const b = personlighetsBitar(svar)
    expect(b).toHaveLength(10)
    expect(b.slice(0, 2)).toEqual(['besvarad', 'tom'])
  })
})

describe('huvudet', () => {
  const ram = (extra: Record<string, unknown>) =>
    render(
      <SessionsRam lage="trana" titel="Figurer och mönster" undertitel="Träna" form="smal" raknare={{ nr: 5, antal: 6 }} framsteg={0.6} bekraftaAvbryt onAvbryt={() => {}} fot={null} {...extra}>
        <p>uppgiften</p>
      </SessionsRam>
    )
  it('namnet och läget med uppgiftens nummer, bitarna ur propen', () => {
    const { container } = ram({ bitar: ['ratt', 'fel', 'ratt', 'ratt', 'aktuell', 'tom'] })
    expect(screen.getByText('Figurer och mönster')).toBeTruthy()
    expect(container.querySelector('[data-ram-undertitel]')!.parentElement!.textContent).toBe('Träna, uppgift 5 av 6')
    expect(bitLagen(container)).toEqual(['ratt', 'fel', 'ratt', 'ratt', 'aktuell', 'tom'])
  })
  it('nivåkapseln bara med nivå, med pil och komma', () => {
    const utan = ram({})
    expect(utan.container.querySelector('[data-niva]')).toBeNull()
    utan.unmount()
    const { container } = ram({ niva: { varde: 3.4, riktning: 'upp' } })
    const k = container.querySelector('[data-niva]')!
    expect(k.getAttribute('data-niva')).toBe('upp')
    expect(k.getAttribute('aria-label')).toBe('Uppgiftens nivå 3,4, svårare än den förra')
    expect(k.textContent).toContain('3,4')
    expect(nivaText(2)).toBe('2,0')
  })
  it('rätt i rad från tre', () => {
    const tva = ram({ iRad: 2 })
    expect(tva.container.querySelector('[data-kapsel="rad3"]')).toBeNull()
    tva.unmount()
    const { container } = ram({ iRad: 3 })
    expect(container.querySelector('[data-kapsel="rad3"]')!.textContent).toBe(SESSION.huvud.iRad(3))
  })
  it('domen står i fotens ställe', () => {
    const { container } = ram({
      fot: { primar: { text: 'Nästa', onClick: () => {}, data: 'nasta' } },
      dom: <Forklaringen utfall="ratt" regel="r" panel nasta={{ text: 'Nästa', onClick: () => {}, data: 'nasta' }} />,
    })
    expect(container.querySelector('footer')).toBeNull()
    expect(container.querySelectorAll('[data-primar="nasta"]')).toHaveLength(1)
    expect(container.querySelector('[data-dom="ratt"][data-panel]')).toBeTruthy()
  })
})

describe('domen i tre toner', () => {
  it('rätt: grön ton, "Rätt!" och sekunderna', () => {
    const { container } = render(<Forklaringen utfall="ratt" tid={{ sekunder: 24, budget: 60 }} regel="Formen flyttar ett steg per rad." />)
    expect(container.querySelector('.sess-dom')!.getAttribute('data-dom')).toBe('ratt')
    expect(screen.getByText('Rätt!')).toBeTruthy()
    expect(screen.getByText('24 sekunder')).toBeTruthy()
  })
  it('fel: röd ton och "Inte den här"', () => {
    const { container } = render(<Forklaringen utfall="fel" regel={null} text="Texten säger inget om vinst." />)
    expect(container.querySelector('.sess-dom')!.getAttribute('data-dom')).toBe('fel')
    expect(screen.getByText('Inte den här')).toBeTruthy()
  })
  it('vet inte: indigo ton, "Förklaringen" och "Du valde Vet inte"', () => {
    const { container } = render(<Forklaringen utfall="vet_inte" tid={{ sekunder: 27, budget: 60 }} regel="Nordkraft har näst störst andel." />)
    expect(container.querySelector('.sess-dom')!.getAttribute('data-dom')).toBe('vet_inte')
    expect(screen.getByText('Förklaringen')).toBeTruthy()
    expect(screen.getByText(SESSION.forklaring.duValdeVetInte)).toBeTruthy()
    expect(screen.queryByText('27 sekunder')).toBeNull()
  })
  it('foten: raden om nästa uppgift och Nästa, inga rubrikelement', () => {
    const klick = vi.fn()
    const { container } = render(<Forklaringen utfall="ratt" regel="r" nasta={{ text: 'Nästa', onClick: klick, data: 'nasta' }} nastaRiktning="svarare" />)
    expect(screen.getByText('Nästa blir lite svårare.')).toBeTruthy()
    fireEvent.click(container.querySelector('[data-primar="nasta"]')!)
    expect(klick).toHaveBeenCalledTimes(1)
    expect(container.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull()
  })
  it('utan riktning ingen rad, utan nasta ingen knapp', () => {
    const { container } = render(<Forklaringen utfall="fel" regel="r" />)
    expect(container.querySelector('[data-nasta-rad]')).toBeNull()
    expect(container.querySelector('[data-primar]')).toBeNull()
  })
})

describe('klossarnas lägen', () => {
  it('raden: vald, rätt, fel och dämpad, tangentbrickan följer', () => {
    const { container } = render(
      <>
        {(['neutral', 'vald', 'ratt', 'fel', 'dampad'] as const).map((t, i) => (
          <SvarRad key={t} i={i} tillstand={t}>
            {t}
          </SvarRad>
        ))}
      </>
    )
    const klossar = Array.from(container.querySelectorAll('.sess-kloss'))
    expect(klossar.map((k) => k.getAttribute('data-tillstand'))).toEqual(['neutral', 'vald', 'ratt', 'fel', 'dampad'])
    expect(klossar.map((k) => k.querySelector('.sess-tangent')!.getAttribute('data-tangent'))).toEqual(['neutral', 'vald', 'ratt', 'fel', 'neutral'])
    expect(klossar.map((k) => k.querySelector('.sess-tangent')!.textContent)).toEqual(['A', 'B', 'C', 'D', 'E'])
  })
  it('figurrutan: märket efter facit, etiketten i aria-label', () => {
    const { container } = render(
      <>
        <SvarRuta i={0} tillstand="ratt" ditt>
          <svg />
        </SvarRuta>
        <SvarRuta i={1} tillstand="dampad">
          <svg />
        </SvarRuta>
      </>
    )
    expect(container.querySelectorAll('[data-ruta-marke]')).toHaveLength(1)
    expect(screen.getByRole('radio', { name: 'Svarsalternativ A, rätt svar, ditt svar' })).toBeTruthy()
  })
  it('sifferklossen: etiketten i översta raden', () => {
    render(
      <SvarTal i={1} tillstand="ratt">
        Nordkraft
      </SvarTal>
    )
    expect(screen.getByText(SESSION.svar.ratt)).toBeTruthy()
    expect(screen.getByText(SESSION.svar.ratt).closest('.sess-topp')).toBeTruthy()
  })
  it('de tre fasta och Likert är klossar', () => {
    const tre = render(<TreFasta etiketter={['Sant', 'Falskt', 'Går inte att avgöra']} vald={1} facit={2} />)
    expect(Array.from(tre.container.querySelectorAll('.sess-kloss')).map((k) => k.getAttribute('data-tillstand'))).toEqual(['dampad', 'fel', 'ratt'])
    tre.unmount()
    const { container } = render(<LikertScale value={4} onChange={() => {}} />)
    expect(container.querySelectorAll('.sess-kloss')).toHaveLength(5)
    expect(container.querySelector('.sess-kloss[data-tillstand="vald"] .sess-tangent')!.textContent).toBe('4')
  })
})

describe('uppgiftens nivå', () => {
  it('motorns fält läses, null och fel typ ignoreras', () => {
    expect(lasRamNiva({ uppgift_niva: 3.4, nasta_niva: 4 })).toEqual({ uppgift: 3.4, nasta: 4 })
    expect(lasRamNiva({ uppgift_niva: null, nasta_niva: null })).toBeUndefined()
    expect(lasRamNiva({ klar: true })).toBeUndefined()
  })
  it('riktningen: en tredjedels steg räknas som samma', () => {
    expect(nivaRiktning(3, 3.6)).toBe('upp')
    expect(nivaRiktning(3, 2.5)).toBe('ner')
    expect(nivaRiktning(3, 3.2)).toBe('samma')
    expect(nivaRiktning(null, 3)).toBeNull()
  })
  it('servern: nivån ur p, nästa i listans ordning', () => {
    const p: Record<string, number> = { a: 0.85, b: 0.4, c: 0.55 }
    expect(uppgiftsNivaFalt(['a', 'b', 'c'], 'a', (id) => p[id])).toEqual({ uppgift_niva: 2.4, nasta_niva: 6.4 })
    expect(uppgiftsNivaFalt(['a', 'b', 'c'], 'c', (id) => p[id])).toEqual({ uppgift_niva: 5.1, nasta_niva: null })
    expect(nivaUrP(undefined)).toBeNull()
  })
})
