// Omgång 2 steg A, grunden i ramen: klockan som kapsel (alltid m:ss),
// rätt/fel-systemet på svarskorten, Förklaringen som kort, Uppgiftslistan
// (utfällning, filter, låst läge, mätningen), genomgångens händelser och
// talraden som krymper med sin behållare.

import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const capture = vi.fn()
vi.mock('@/lib/analytics/events', () => ({ capture: (...a: unknown[]) => capture(...a) }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }), usePathname: () => '/x' }))
vi.mock('@/components/traning/FragaRapport', () => ({ default: () => null }))

const { default: Klocka, klockText } = await import('../Klocka')
const { SvarRad, TreFasta } = await import('../Svarskort')
const { default: Forklaringen } = await import('../Forklaringen')
const { default: Uppgiftslistan } = await import('../Uppgiftslistan')
const { default: Genomgang } = await import('../lagen/Genomgang')
const { default: Talrad, talStorlek } = await import('../Talrad')
const { SESSION } = await import('../copy')
import type { GenomgangPost, RamUppgift, TypRitare, UppgiftProps } from '../typ'

globalThis.ResizeObserver = class {
  observe() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

beforeEach(() => capture.mockClear())
const anrop = (namn: string) => capture.mock.calls.filter((c) => c[0] === namn).map((c) => c[1])

interface TU extends RamUppgift {
  text: string
}
function TestUppgift({ u, vald, facit }: UppgiftProps<TU>) {
  return (
    <div data-test-uppgift={u.nyckel}>
      <h2 data-uppgift-rubrik>{u.text}</h2>
      {['a', 'b', 'c'].map((t, i) => (
        <SvarRad key={t} i={i} tillstand={facit == null ? (vald === i ? 'vald' : 'neutral') : i === facit ? 'ratt' : i === vald ? 'fel' : 'dampad'} ditt={facit != null && vald === i}>
          {t}
        </SvarRad>
      ))}
    </div>
  )
}
const RITARE: TypRitare<TU> = { kind: 'talserie', namn: 'Talserier', form: 'smal', antalAlternativ: () => 3, Uppgift: TestUppgift }
const post = (n: number, valt: number | null, ratt: number): GenomgangPost<TU> => ({
  u: { nyckel: `u${n}`, text: `Uppgift ${n}` },
  valt,
  facit: { ratt, correct: valt === ratt, regel: `Regel ${n}`, misstag: valt !== ratt && valt != null ? 'Fel håll' : null },
  tid_s: 10 + n,
})
// Uppgift 1 rätt, 2 fel, 3 obesvarad, 4 rätt.
const POSTER = [post(1, 0, 0), post(2, 1, 2), post(3, null, 1), post(4, 2, 2)]

describe('klockan som kapsel', () => {
  it('alltid m:ss, koppar de sista två minuterna, +m:ss över i mjuk gräns', () => {
    expect(klockText(25 * 60)).toEqual({ text: '25:00', ton: 'lugn' })
    expect(klockText(19 * 60 + 42)).toEqual({ text: '19:42', ton: 'lugn' })
    expect(klockText(118)).toEqual({ text: '1:58', ton: 'sista' })
    expect(klockText(0)).toEqual({ text: '0:00', ton: 'sista' })
    expect(klockText(-83, true)).toEqual({ text: '+1:23', ton: 'over' })
    // Hård gräns står på 0:00.
    expect(klockText(-83, false)).toEqual({ text: '0:00', ton: 'sista' })
  })
  it('referensen i Träna visar sekunderna, aldrig koppar', () => {
    const { container } = render(<Klocka lage="referens" sekunder={29} budget={80} />)
    const k = container.querySelector('[data-klocka]')!
    expect(k.getAttribute('data-klocka')).toBe('referens')
    expect(k.textContent).toBe('0:29')
    expect(k.className).not.toContain('koppar')
  })
})

describe('rätt/fel-systemet', () => {
  it('klossen behåller tangentbrickan och etiketten säger vems svaret är (omgång 3)', () => {
    const { container } = render(
      <>
        <SvarRad i={0} tillstand="fel">x</SvarRad>
        <SvarRad i={1} tillstand="ratt">y</SvarRad>
        <SvarRad i={2} tillstand="ratt" ditt>
          z
        </SvarRad>
      </>
    )
    expect(container.querySelectorAll('.sess-kloss[data-tillstand="fel"] .sess-tangent[data-tangent="fel"]').length).toBe(1)
    expect(container.querySelectorAll('.sess-kloss[data-tillstand="ratt"] .sess-tangent[data-tangent="ratt"]').length).toBe(2)
    expect(screen.getByText(SESSION.svar.ditt)).toBeTruthy()
    expect(screen.getByText(SESSION.svar.ratt)).toBeTruthy()
    expect(screen.getByText(SESSION.svar.rattDitt)).toBeTruthy()
  })
  it('de tre fasta får märket före texten men ingen pill', () => {
    const { container } = render(<TreFasta etiketter={['Sant', 'Falskt', 'Går inte att avgöra']} vald={0} facit={2} />)
    expect(container.querySelector('[data-marke="fel"]')).toBeTruthy()
    expect(container.querySelector('[data-marke="ratt"]')).toBeTruthy()
    expect(container.querySelector('[data-pill]')).toBeNull()
  })
})

describe('Förklaringen som kort', () => {
  it('rubrikraden, kroppen med typens innehåll och tiden mäts när kortet går', () => {
    const bas = { test_kind: 'talserie', lage: 'trana' as const, niva: 'grund', format: null }
    const { unmount, container } = render(
      <Forklaringen utfall="fel" tid={{ sekunder: 31, budget: 60 }} regel="Varje tal är 7 mindre." misstag="Du tog −8." innehall={<p data-typens>lösningsgången</p>} matning={{ bas, sessionId: 's', index: 2, plats: 'svar' }} />
    )
    expect(screen.getByText('Inte den här')).toBeTruthy()
    expect(screen.getByText('31 sekunder')).toBeTruthy()
    expect(container.querySelector('[data-forklaring-innehall] [data-typens]')).toBeTruthy()
    expect(screen.getByText('Ditt misstag')).toBeTruthy()
    unmount()
    const t = anrop('forklaring_tid')
    expect(t).toHaveLength(1)
    expect(t[0]).toMatchObject({ test_kind: 'talserie', lage: 'trana', session_id: 's', index: 2, utfall: 'fel', plats: 'svar' })
    expect(typeof t[0].tid_ms).toBe('number')
  })
})

describe('Uppgiftslistan', () => {
  it('testläge: rubriken, räkningen, bara första missen utfälld, filtret och raden fälls ut med mätning', () => {
    const oppna = vi.fn()
    const { container } = render(<Uppgiftslistan ritare={RITARE} lage="nivatest" poster={POSTER} sessionId="s1" onOppna={oppna} onGaIgenom={() => {}} />)
    expect(screen.getByText('Fyra uppgifter, ett fel och en obesvarad')).toBeTruthy()
    expect(screen.getByText('2 av 4 fel')).toBeTruthy()
    const rader = container.querySelectorAll('[data-lista-rad]')
    expect([...rader].map((r) => r.getAttribute('data-lista-rad'))).toEqual(['ratt', 'fel', 'obesvarad', 'ratt'])
    expect(container.querySelectorAll('[data-oppen]').length).toBe(1)
    expect(rader[1].hasAttribute('data-oppen')).toBe(true)
    // Radens svar: "B, rätt C" och "Obesvarad, rätt B".
    expect(rader[1].textContent).toContain('B, rätt C')
    expect(rader[2].textContent).toContain('Obesvarad, rätt B')
    // Den utfällda raden har uppgiften, Förklaringen och länken.
    expect(within(rader[1] as HTMLElement).getByText('Regel 2')).toBeTruthy()
    fireEvent.click(within(rader[1] as HTMLElement).getByText(SESSION.lista.oppna))
    expect(oppna).toHaveBeenCalledWith(1)
    // Fäll ut uppgift 4: mätningen skjuts en gång.
    fireEvent.click(rader[3].querySelector('[data-lista-knapp]')!)
    expect(anrop('genomgang_rad_utfalld')).toEqual([{ test_kind: 'talserie', lage: 'nivatest', niva: null, format: null, session_id: 's1', index: 3, antal: 4, utfall: 'ratt' }])
    // Bara fel.
    fireEvent.click(screen.getByText('Bara fel'))
    expect(container.querySelectorAll('[data-lista-rad]').length).toBe(2)
    expect(container.querySelector('[data-ga-igenom]')).toBeTruthy()
  })
  it('Träna: alla fel och obesvarade utfällda från början, Vet inte i raden', () => {
    const { container } = render(<Uppgiftslistan ritare={RITARE} lage="trana" poster={POSTER} sessionId="s1" />)
    expect(container.querySelectorAll('[data-oppen]').length).toBe(2)
    expect(container.querySelectorAll('[data-lista-rad]')[2].textContent).toContain('Vet inte, rätt B')
    expect(anrop('genomgang_rad_utfalld')).toHaveLength(0)
  })
  it('låst (publikt): inget facit, ingen utfällning, låset och obesvarad räknas som fel', () => {
    const { container } = render(<Uppgiftslistan ritare={RITARE} lage="publikt" poster={POSTER} last />)
    expect(screen.getByText('Fyra uppgifter, två fel')).toBeTruthy()
    expect(container.querySelectorAll('[data-lista-knapp]').length).toBe(0)
    expect(container.querySelectorAll('[data-lista-las]').length).toBe(4)
    expect(container.querySelector('[data-forklaringen]')).toBeNull()
    expect(container.textContent).not.toContain('Regel')
    expect([...container.querySelectorAll('[data-lista-rad]')].map((r) => r.getAttribute('data-lista-rad'))).toEqual(['ratt', 'fel', 'fel', 'ratt'])
  })
})

describe('genomgångens mätning', () => {
  it('öppnad, steg med tiden och klar när sista knappen trycks', () => {
    const stang = vi.fn()
    render(<Genomgang ritare={RITARE} lage="nivatest" titel="Talserier" poster={POSTER} start={1} sessionId="s1" onStang={stang} kalla="rad" />)
    expect(anrop('genomgang_oppnad')).toEqual([{ test_kind: 'talserie', lage: 'nivatest', niva: null, format: null, session_id: 's1', antal: 4, fel: 2, start_index: 1, kalla: 'rad' }])
    fireEvent.click(document.querySelector('[data-primar="genomgang-nasta"]')!)
    fireEvent.click(document.querySelector('[data-primar="genomgang-nasta"]')!)
    const steg = anrop('genomgang_steg')
    expect(steg.map((s) => [s.index, s.riktning])).toEqual([
      [2, 'fram'],
      [3, 'fram'],
    ])
    expect(anrop('forklaring_tid').map((t) => t.plats)).toEqual(['genomgang', 'genomgang'])
    fireEvent.click(document.querySelector('[data-primar="genomgang-nasta"]')!)
    expect(stang).toHaveBeenCalled()
    expect(anrop('genomgang_klar')[0]).toMatchObject({ session_id: 's1', antal: 4, sett: 3 })
  })
})

describe('talraden', () => {
  it('krymper med behållaren: varje mått är min(px, cqw) och talet minskar med tecknen', () => {
    const { container } = render(<Talrad rutor={[{ text: '76' }, { text: '69' }, { text: '−1024' }, { text: null, lucka: true }]} />)
    const rutor = container.querySelectorAll('[data-talrad] > span')
    expect(rutor).toHaveLength(4)
    const stil = (rutor[0] as HTMLElement).style
    expect(stil.width).toMatch(/^min\(56px, [\d.]+cqw\)$/)
    expect(rutor[3].getAttribute('data-lucka')).toBe('tom')
    expect(rutor[3].textContent).toBe('?')
    expect(talStorlek(2, 7)).toBe(26)
    expect(talStorlek(2, 8)).toBe(22)
    expect(talStorlek(5, 7)).toBeLessThan(18)
  })
})
