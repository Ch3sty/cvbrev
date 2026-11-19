import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import Graf from '../Graf'
import { byggGraf } from '../geometri'
import { DELTYP_NAMN } from '@/lib/traning/mittTest'
import { data } from './testdata'

const NAMN = DELTYP_NAMN as Parameters<typeof Graf>[0]['namn']

function rita(valdId: string | null = null, onValj = vi.fn()) {
  const d = data()
  const modell = byggGraf({ idag: d.idag, plan: null, provdag: null, punkter: d.punkter, historikLast: false, typVal: 'alla', period: 'allt', bredd: 'dator' })
  const r = render(<Graf modell={modell} namn={NAMN} valdId={valdId} onValj={onValj} idPrefix="t" detaljId="d" />)
  const knappar = () => Array.from(r.container.querySelectorAll<SVGGElement>('[role="button"]'))
  return { ...r, modell, knappar, onValj }
}

describe('Graf, tangentbordet', () => {
  it('en punkt i taget i tabbordningen, den senaste först', () => {
    const { knappar, modell } = rita()
    const tabbbara = knappar().filter((k) => k.getAttribute('tabindex') === '0')
    expect(tabbbara.length).toBe(1)
    expect(tabbbara[0].getAttribute('data-punkt')).toBe(modell.valbara[modell.valbara.length - 1].punkt.id)
  })

  it('pilarna flyttar fokus i tidsordning, Enter väljer', () => {
    const { knappar, modell, onValj } = rita()
    const sista = knappar().find((k) => k.getAttribute('tabindex') === '0')!
    sista.focus()
    fireEvent.keyDown(sista, { key: 'ArrowLeft' })
    const nasta = modell.valbara[modell.valbara.length - 2].punkt.id
    expect(document.activeElement?.getAttribute('data-punkt')).toBe(nasta)
    fireEvent.keyDown(document.activeElement as Element, { key: 'Enter' })
    expect(onValj).toHaveBeenCalledWith(nasta)
    fireEvent.keyDown(document.activeElement as Element, { key: 'Home' })
    expect(document.activeElement?.getAttribute('data-punkt')).toBe(modell.valbara[0].punkt.id)
  })

  it('fokus syns som ring, varje punkt har namn och 44 px träffyta', () => {
    const { knappar, container } = rita()
    const k = knappar()[0]
    fireEvent.focus(k)
    expect(container.querySelector('[data-fokusring]')).not.toBeNull()
    expect(k.getAttribute('aria-label')).toMatch(/Figurer och mönster, nivåkoll, 11 okt, nivå 5,0/)
    expect(k.querySelector('circle')?.getAttribute('r')).toBe('22')
  })

  it('den valda punkten är tryckt', () => {
    const d = data()
    const { container } = rita(d.punkter[0].id)
    expect(container.querySelector(`[data-punkt="${d.punkter[0].id}"]`)?.getAttribute('aria-pressed')).toBe('true')
  })
})
