// Den adaptiva Nivåkollen i ramen (matrisen, etapp 3): Nästa är inaktiv
// tills ett svar är valt, väntar på serverns nästa uppgift med spinnern i
// knappen (ingen frusen skärm, ingen kö), räknaren räknar mot sessionens
// antal och inte mot listan, och sista svaret avslutar till resultatet.

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }), usePathname: () => '/x' }))
vi.mock('@/components/traning/FragaRapport', () => ({ default: () => null }))

const { default: Nivakoll } = await import('../lagen/Nivakoll')
import type { NivakollSession } from '../lagen/Nivakoll'
import type { RamUppgift, TypRitare, UppgiftProps } from '../typ'

globalThis.ResizeObserver = class {
  observe() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

interface TextU extends RamUppgift {
  text: string
}

function TextUppgift({ u, vald, onValj, last }: UppgiftProps<TextU>) {
  return (
    <div>
      <h2 data-uppgift-rubrik>{u.text}</h2>
      {[0, 1, 2].map((i) => (
        <button key={i} type="button" disabled={last} aria-pressed={vald === i} onClick={() => onValj?.(i)} data-alt={i}>
          {`alt ${i}`}
        </button>
      ))}
    </div>
  )
}

const RITARE: TypRitare<TextU> = { kind: 'matris', namn: 'Figurer och mönster', form: 'smal', antalAlternativ: () => 3, Uppgift: TextUppgift }

interface Vy {
  id: string
  fragor: TextU[]
  svar: Record<string, number>
  klar: boolean
}

function las(v: Vy): NivakollSession<TextU> {
  const besvarade: NivakollSession<TextU>['besvarade'] = {}
  for (const [k, s] of Object.entries(v.svar)) besvarade[k] = { valt: s, tid_s: 3 }
  return { id: v.id, uppgifter: v.fragor, besvarade, facit: null, avslutad: v.klar, harResultat: v.klar, budgetPerUppgift: 40, antal: 3 }
}

describe('adaptiv Nivåkoll', () => {
  it('Nästa väntar på servern och nästa uppgift kommer ur svaret', async () => {
    let slapp: (() => void) | null = null
    const skickat: { nyckel: string; valt: number }[] = []
    const vy0: Vy = { id: 'k1', fragor: [{ nyckel: 'q1', text: 'Uppgift ett' }], svar: {}, klar: false }
    let n = 1
    const api = {
      skapa: vi.fn(async () => ({ ok: true as const, vy: vy0 })),
      svara: vi.fn(async () => false),
      async svaraAdaptivt(inp: { sessionId: string; nyckel: string; valt: number; tid: number }) {
        skickat.push({ nyckel: inp.nyckel, valt: inp.valt })
        await new Promise<void>((r) => (slapp = r))
        n += 1
        const fragor = n <= 3 ? [...Array.from({ length: n }, (_, i) => ({ nyckel: `q${i + 1}`, text: `Uppgift ${i + 1}` }))] : []
        const svar = Object.fromEntries(skickat.map((s) => [s.nyckel, s.valt]))
        return { ok: true as const, vy: { id: 'k1', fragor: fragor.length ? fragor : [{ nyckel: 'q1', text: 'x' }], svar, klar: false }, klar: n > 3 }
      },
      slutfor: vi.fn(async () => ({ ok: true as const, vy: { id: 'k1', fragor: [{ nyckel: 'q1', text: 'x' }], svar: {}, klar: true } })),
    }
    render(
      <Nivakoll<TextU, Vy>
        ritare={RITARE}
        bas={{ test_kind: 'matris', lage: 'nivakoll', niva: null, format: null }}
        undertitel="Nivåkollen"
        vy={vy0}
        las={las}
        api={api}
        tillbakaHref="/x"
        resultat={() => <p data-testid="resultat">Resultatet</p>}
      />
    )
    expect(screen.getByText('1 / 3')).toBeTruthy()
    const nasta = () => document.querySelector('[data-primar]') as HTMLButtonElement
    expect(nasta().disabled).toBe(true)
    fireEvent.click(document.querySelector('[data-alt="1"]')!)
    expect(nasta().disabled).toBe(false)
    fireEvent.click(nasta())
    // Väntar på servern: spinnern i knappen, svaren låsta, ingen ny uppgift än.
    await waitFor(() => expect(nasta().getAttribute('aria-busy')).toBe('true'))
    expect((document.querySelector('[data-alt="0"]') as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByText('Uppgift ett')).toBeTruthy()
    expect(skickat).toEqual([{ nyckel: 'q1', valt: 1 }])
    await act(async () => slapp!())
    await waitFor(() => expect(screen.getByText('Uppgift 2')).toBeTruthy())
    expect(screen.getByText('2 / 3')).toBeTruthy()
    expect(nasta().disabled).toBe(true)
    // Andra och tredje svaret; det tredje avslutar.
    fireEvent.click(document.querySelector('[data-alt="2"]')!)
    fireEvent.click(nasta())
    await waitFor(() => expect(skickat.length).toBe(2))
    await act(async () => slapp!())
    await waitFor(() => expect(screen.getByText('3 / 3')).toBeTruthy())
    expect(nasta().textContent).toContain('Visa resultatet')
    fireEvent.click(document.querySelector('[data-alt="0"]')!)
    fireEvent.click(nasta())
    await waitFor(() => expect(skickat.length).toBe(3))
    await act(async () => slapp!())
    await waitFor(() => expect(screen.getByTestId('resultat')).toBeTruthy())
    expect(api.slutfor).toHaveBeenCalledWith('k1')
    expect(api.svara).not.toHaveBeenCalled()
  })
})
