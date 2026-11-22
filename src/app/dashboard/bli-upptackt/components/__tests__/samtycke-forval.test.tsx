/**
 * Personlighetssamtycket i Bli upptäckt är tomt från början: kandidaten
 * kryssar själv (ägarbeslut 2026-11-22). Lämnas rutan tom blir profilen
 * synlig utan personlighetsdelen.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConsentModal from '../ConsentModal'

// Sheet låser sidans rullning, och jsdom saknar window.scrollTo.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo

function rutor() {
  return screen.getAllByRole('checkbox')
}

describe('samtyckets förval', () => {
  it('ingen ruta är förkryssad när dialogen öppnas', () => {
    render(<ConsentModal open saving={false} hasAdvancedTest onConfirm={vi.fn()} onCancel={vi.fn()} />)
    const alla = rutor()
    expect(alla.length).toBeGreaterThanOrEqual(3)
    for (const ruta of alla) expect(ruta.getAttribute('aria-checked')).toBe('false')
  })

  it('tom personlighetsruta: synlig utan personlighetsdelen', () => {
    const onConfirm = vi.fn()
    render(<ConsentModal open saving={false} hasAdvancedTest={false} onConfirm={onConfirm} onCancel={vi.fn()} />)
    fireEvent.click(rutor()[0])
    fireEvent.click(screen.getByRole('button', { name: 'Aktivera synlighet' }))
    expect(onConfirm).toHaveBeenCalledWith(false, false)
  })

  it('kryssad personlighetsruta: styrkorna följer med', () => {
    const onConfirm = vi.fn()
    render(<ConsentModal open saving={false} hasAdvancedTest={false} onConfirm={onConfirm} onCancel={vi.fn()} />)
    fireEvent.click(rutor()[0])
    fireEvent.click(rutor()[1])
    fireEvent.click(screen.getByRole('button', { name: 'Aktivera synlighet' }))
    expect(onConfirm).toHaveBeenCalledWith(true, false)
  })
})
