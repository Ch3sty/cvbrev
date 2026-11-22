/**
 * Menyn och flödesskalen för en inloggad besökare (klicktestet på live
 * 2026-11-22, punkt 3). Serverns HTML är densamma för alla (utloggat läge,
 * ingen länk till kontot), och båda lägena står i samma ruta så att bytet
 * inte flyttar något.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { renderToString } from 'react-dom/server'

let anvandare: { id: string } | null = null
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: anvandare, isLoading: false, isAuthenticated: !!anvandare }) }))
vi.mock('next/navigation', () => ({ usePathname: () => '/cv-mallar/prova' }))

import LandingNavbar from '@/components/landing/LandingNavbar'
import PubliktFlodesskal from '@/components/registrering/PubliktFlodesskal'
import { AuthKortSkal } from '@/app/auth/_delar/AuthKortSkal'

afterEach(() => {
  cleanup()
  anvandare = null
})

const synliga = (el: HTMLElement, sel: string) =>
  Array.from(el.querySelectorAll<HTMLElement>(sel)).filter((n) => !n.closest('[aria-hidden="true"]'))

describe('menyn', () => {
  it('serverns HTML: Logga in och Skapa konto, ingen länk till kontot', () => {
    const html = renderToString(<LandingNavbar />)
    expect(html).toContain('Logga in')
    expect(html).toContain('Skapa konto')
    expect(html).not.toContain('href="/dashboard"')
    // Rutan för kontot finns redan, utan adress, så att bytet inte flyttar något.
    expect(html).toContain('p3-vaxel-in')
  })

  it('utloggad: Logga in och Skapa konto syns, kontorutan är dold', () => {
    const { container } = render(<LandingNavbar />)
    const vaxel = container.querySelector('.p3-vaxel')!
    expect(vaxel.hasAttribute('data-inloggad')).toBe(false)
    expect(synliga(container as HTMLElement, '.p3-vaxel a').map((a) => a.textContent)).toEqual(['Logga in', 'Skapa konto'])
  })

  it('inloggad: Till kontot i samma ruta, Logga in och Skapa konto dolda, också i telefonmenyn', () => {
    anvandare = { id: 'u1' }
    const { container } = render(<LandingNavbar />)
    const vaxel = container.querySelector('.p3-vaxel')!
    expect(vaxel.hasAttribute('data-inloggad')).toBe(true)
    const lankar = synliga(container as HTMLElement, '.p3-vaxel a')
    expect(lankar.map((a) => [a.textContent, a.getAttribute('href')])).toEqual([['Till kontot', '/dashboard']])
    const fot = container.querySelector('.p3-tm-fot')!
    expect(Array.from(fot.querySelectorAll('a')).map((a) => a.textContent)).toEqual(['Till kontot'])
  })

  it('båda lägena står i samma rutnätsruta (CSS), det dolda med visibility', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const css = fs.readFileSync(path.resolve(__dirname, '../inloggad.css'), 'utf8')
    expect(css).toMatch(/grid-area:\s*1\s*\/\s*1/)
    expect(css).toMatch(/\.p3-vaxel > \.p3-vaxel-in \{ visibility: hidden; \}/)
    expect(css).not.toMatch(/display:\s*none/)
  })
})

describe('flödesskalen', () => {
  it('PubliktFlodesskal: inloggad ser Till kontot i stället för Logga in', () => {
    anvandare = { id: 'u1' }
    const { container } = render(
      <PubliktFlodesskal>
        <p>innehåll</p>
      </PubliktFlodesskal>
    )
    expect(synliga(container as HTMLElement, '.rg-topp a.rg-topp-lank').map((a) => a.getAttribute('href'))).toEqual(['/dashboard'])
  })

  it('PubliktFlodesskal utloggad: Logga in som förut', () => {
    const { container } = render(
      <PubliktFlodesskal>
        <p>innehåll</p>
      </PubliktFlodesskal>
    )
    expect(synliga(container as HTMLElement, '.rg-topp a.rg-topp-lank').map((a) => a.textContent)).toEqual(['Logga in'])
  })

  it('auth-sidornas kort: inloggad ser Till kontot', () => {
    anvandare = { id: 'u1' }
    const { container } = render(
      <AuthKortSkal>
        <p>kort</p>
      </AuthKortSkal>
    )
    expect(synliga(container as HTMLElement, '.rg-topp a').map((a) => a.textContent)).toContain('Till kontot')
  })
})
