/**
 * Appens raderingsark (beslut-mejl-och-radering 2c punkt 7): frågan om
 * anledning med samma beteende som på webben, R10, R10b och R11, och valet
 * i DELETE-kroppen. Inget raderas: fetch och Supabase är utbytta.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('@/lib/supabase/client-manager', () => ({
  getSupabaseClient: () => ({ auth: { signOut: vi.fn(async () => ({})) } }),
}))
vi.mock('@/lib/activity-logger', () => ({ logUserActivity: vi.fn(async () => undefined) }))
vi.mock('@/lib/lagring/kontoLagring', () => ({ vidUtloggning: vi.fn() }))
vi.mock('../skal', () => ({ haptik: vi.fn() }))

import KontoHandlingar from '../KontoHandlingar'
import { RADERA_TEXT } from '@/lib/konto/radera-copy'
import { ANLEDNINGAR } from '@/lib/konto/avslut'
import { logUserActivity } from '@/lib/activity-logger'

function oppnaArket() {
  render(<KontoHandlingar userId="u1" epost="anna@exempel.se" />)
  expect(screen.getByText(RADERA_TEXT.R11)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: /Radera kontot/ }))
}

const chip = (etikett: string) => screen.getByRole('button', { name: etikett })

describe('appens raderingsark', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('visar R10 och R10b med länk till datalagringen', () => {
    oppnaArket()
    expect(screen.getByText(RADERA_TEXT.R10)).toBeTruthy()
    const lank = screen.getByRole('link', { name: 'integritetspolicyn' })
    expect(lank.getAttribute('href')).toBe('/integritetspolicy#datalagring')
    expect(lank.parentElement?.textContent).toBe(RADERA_TEXT.R10b)
  })

  it('sex chips utan förval, andra trycket avmarkerar', () => {
    oppnaArket()
    expect(screen.getByText(RADERA_TEXT.R6)).toBeTruthy()
    expect(screen.getByText(RADERA_TEXT.R7)).toBeTruthy()
    for (const a of ANLEDNINGAR) expect(chip(a.etikett).getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(chip('Söker inte jobb längre'))
    expect(chip('Söker inte jobb längre').getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(chip('Söker inte jobb längre'))
    expect(chip('Söker inte jobb längre').getAttribute('aria-pressed')).toBe('false')
  })

  it('valet skickas i DELETE-kroppen och ingen aktivitetsrad skrivs', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
    oppnaArket()
    fireEvent.click(chip('Använder en annan tjänst'))
    fireEvent.change(screen.getByLabelText('Skriv RADERA för att bekräfta'), { target: { value: 'RADERA' } })
    const knappar = screen.getAllByRole('button', { name: 'Radera kontot' })
    fireEvent.click(knappar[knappar.length - 1])
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled())
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/app/konto')
    expect(init.method).toBe('DELETE')
    expect(JSON.parse(String(init.body))).toEqual({ anledning: 'annan_tjanst' })
    expect(logUserActivity).not.toHaveBeenCalledWith('u1', 'registered', expect.anything(), expect.anything())
  })
})
