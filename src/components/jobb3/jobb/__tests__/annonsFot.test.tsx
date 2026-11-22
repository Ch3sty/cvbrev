/**
 * Annonsens fot på telefon (Jobbsöket omgång 2, byggspecen 3.3 och 3.6):
 * varje handling har text, ordningen är Skriv brev, Spara, Markera som sökt,
 * och i läget sökt blir andra raden en enda länk in i Sökta tjänster.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

vi.mock('@/components/paywall/PaywallCard', () => ({ default: () => null }))

import { AnnonsFotMobil, soktTextMobil, sparTextMobil, type AnnonsHandlingar, type SoktLage, type SparLage } from '../AnnonsVy'

afterEach(cleanup)

function rita(spara: SparLage = 'idle', sokt: SoktLage = 'idle') {
  const h: AnnonsHandlingar = { onSkrivBrev: vi.fn(), onSpara: vi.fn(), onSokt: vi.fn(), spara, sokt }
  const r = render(<AnnonsFotMobil job={{}} handlingar={h} />)
  return { h, ...r }
}

/** Knappar och länkar i den ordning de står. */
function handlingar(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('a, button'))
}

describe('annonsens fot på telefon', () => {
  it('inget gjort: Skriv brev, Spara, Markera som sökt, i den ordningen', () => {
    const { container } = rita()
    const alla = handlingar(container)
    expect(alla.map((e) => e.textContent?.trim())).toEqual(['Skriv brev', 'Spara', 'Markera som sökt'])
    expect(alla[1].getAttribute('aria-label')).toBe('Spara till Ska sökas')
  })

  it('sparad: "Sparad" är en länk till Ska sökas med fran=annons-fot, Markera som sökt står kvar', () => {
    rita('sparad')
    const lank = screen.getByRole('link', { name: 'Sparad i Ska sökas. Visa listan' })
    expect(lank.textContent?.trim()).toBe('Sparad')
    expect(lank.getAttribute('href')).toBe('/dashboard/sokta-tjanster?filter=ska-sokas&fran=annons-fot')
    expect(screen.getByRole('button', { name: 'Markera som sökt' })).toBeTruthy()
  })

  it('sökt: Skriv brev och en enda länk in i Sökta tjänster, inga andra knappar', () => {
    const { container } = rita('idle', 'sokt')
    const alla = handlingar(container)
    expect(alla).toHaveLength(2)
    expect(alla[0].textContent?.trim()).toBe('Skriv brev')
    const lank = screen.getByRole('link', { name: 'Loggad som sökt. Visa listan' })
    expect(lank.getAttribute('href')).toBe('/dashboard/sokta-tjanster?fran=annons-fot')
  })

  it('sökt vinner också när annonsen är sparad', () => {
    const { container } = rita('sparad', 'sokt')
    expect(handlingar(container)).toHaveLength(2)
  })

  it('sparar: "Sparar" är avstängd', () => {
    rita('sparar')
    const knapp = screen.getByRole('button', { name: 'Sparar' }) as HTMLButtonElement
    expect(knapp.disabled).toBe(true)
  })

  it('fel: "Försök igen" går att trycka på och sparar igen', () => {
    const { h } = rita('fel')
    const knapp = screen.getByRole('button', { name: 'Försök spara igen' }) as HTMLButtonElement
    expect(knapp.textContent?.trim()).toBe('Försök igen')
    expect(knapp.disabled).toBe(false)
    fireEvent.click(knapp)
    expect(h.onSpara).toHaveBeenCalledTimes(1)
  })

  it('markerar som sökt: högra knappen säger Sparar och är avstängd', () => {
    rita('idle', 'sparar')
    const knapp = screen.getByRole('button', { name: 'Sparar' }) as HTMLButtonElement
    expect(knapp.disabled).toBe(true)
  })

  it('trycken anropar Skriv brev, Spara och Markera som sökt', () => {
    const { h } = rita()
    fireEvent.click(screen.getByRole('button', { name: /Skriv brev/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Spara till Ska sökas' }))
    fireEvent.click(screen.getByRole('button', { name: 'Markera som sökt' }))
    expect(h.onSkrivBrev).toHaveBeenCalledTimes(1)
    expect(h.onSpara).toHaveBeenCalledTimes(1)
    expect(h.onSokt).toHaveBeenCalledTimes(1)
  })

  it('texterna är specens och har inga talstreck', () => {
    const lagen: SparLage[] = ['idle', 'sparar', 'sparad', 'fel']
    expect(lagen.map((l) => sparTextMobil(l).text)).toEqual(['Spara', 'Sparar', 'Sparad', 'Försök igen'])
    const sokt: SoktLage[] = ['idle', 'sparar', 'sokt', 'fel']
    expect(sokt.map(soktTextMobil)).toEqual(['Markera som sökt', 'Sparar', 'Loggad som sökt. Visa listan', 'Försök igen'])
    for (const l of lagen) expect(JSON.stringify(sparTextMobil(l))).not.toMatch(/[—–]/)
  })
})
