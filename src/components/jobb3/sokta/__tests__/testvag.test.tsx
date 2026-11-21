/**
 * Arket Logga sökt tjänst på testvägen och kvittensen (Jobbsöket omgång 2,
 * byggspec 9.16 och 9.19, med samordnarens två beslut: kryssrutan som UX
 * specade den, och Datum sökt tomt och obligatoriskt på testvägen).
 * fetch är mockad: inga anrop mot nätet.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

vi.mock('@/components/rum/Topprad', () => ({ default: () => null }))

import LoggaArk, { TESTVAG_TEXT, type LoggaForifyllt } from '../LoggaArk'
import { TestvagKvittens, TILLBAKA_TILL_TESTERNA, testvagKvittensText } from '../SoktaVy'

const FOT_SOKT = 'Brickan hamnar under Sökt. Vi säger till om det är tyst efter tolv dagar.'

type Anrop = { url: string; body: Record<string, unknown> | null }
let anrop: Anrop[] = []

beforeEach(() => {
  anrop = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      anrop.push({ url, body: init?.body ? JSON.parse(String(init.body)) : null })
      if (url === '/api/cv/list') return new Response(JSON.stringify({ cvs: [] }), { status: 200 })
      return new Response(JSON.stringify({ success: true, data: { id: 'app1', job_title: 'Ekonomiassistent', company: 'Norrmejerier', application_channel: 'ad', current_status: 'test_invited' } }), { status: 200 })
    })
  )
})
afterEach(() => vi.unstubAllGlobals())

function ark(forifyllt: LoggaForifyllt | null, onKlar = vi.fn()) {
  const { unmount } = render(<LoggaArk open onClose={() => {}} onKlar={onKlar} forifyllt={forifyllt} />)
  return { onKlar, unmount }
}

const testHem = (fran: string): LoggaForifyllt => ({ lage: 'sokt', job_title: 'Ekonomiassistent', company: 'Norrmejerier', fran })
const datumFalt = () => screen.getByLabelText(/Datum sökt/) as HTMLInputElement
const kryss = () => screen.getByLabelText(TESTVAG_TEXT.kryss) as HTMLInputElement
const posten = () => anrop.find((a) => a.url === '/api/applications')

describe('arket på testvägen', () => {
  it('Datum sökt är tomt med hjälpraden, och kryssrutan står under', () => {
    ark(testHem('test-hem-plan'))
    expect(datumFalt().value).toBe('')
    expect(screen.getByText('Dagen du skickade ansökan. Datumet står i din månadsrapport.')).toBeTruthy()
    expect(kryss()).toBeTruthy()
    expect(datumFalt().compareDocumentPosition(kryss()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('kryssrutans förval: ikryssad med test-hem-plan, tom med test-hem', () => {
    const forsta = ark(testHem('test-hem-plan'))
    expect(kryss().checked).toBe(true)
    forsta.unmount()
    ark(testHem('test-hem'))
    expect(kryss().checked).toBe(false)
  })

  it('raden under knappen följer rutan', () => {
    ark(testHem('test-hem-plan'))
    expect(screen.getByText('Tjänsten står som kallad till test. Lägg till intervjun eller beskedet när det kommer.')).toBeTruthy()
    fireEvent.click(kryss())
    expect(screen.getByText(FOT_SOKT)).toBeTruthy()
  })

  it('tomt Datum sökt: felraden, inget anrop', async () => {
    ark(testHem('test-hem-plan'))
    fireEvent.click(screen.getByRole('button', { name: 'Logga sökt tjänst' }))
    expect(screen.getByText('Välj dagen du sökte, så blir månadsrapporten rätt.')).toBeTruthy()
    expect(datumFalt().getAttribute('aria-invalid')).toBe('true')
    await new Promise((r) => setTimeout(r, 0))
    expect(posten()).toBeUndefined()
  })

  it('kryssad: fran och kallad_till_test skickas', async () => {
    const { onKlar } = ark(testHem('test-hem-plan'))
    fireEvent.change(datumFalt(), { target: { value: '2026-11-18' } })
    fireEvent.click(screen.getByRole('button', { name: 'Logga sökt tjänst' }))
    await waitFor(() => expect(onKlar).toHaveBeenCalled())
    expect(posten()!.body).toMatchObject({ applied_at: '2026-11-18', fran: 'test-hem-plan', kallad_till_test: true })
  })

  it('inte kryssad: fran skickas men inte kallad_till_test', async () => {
    const { onKlar } = ark(testHem('test-hem'))
    fireEvent.change(datumFalt(), { target: { value: '2026-11-18' } })
    fireEvent.click(screen.getByRole('button', { name: 'Logga sökt tjänst' }))
    await waitFor(() => expect(onKlar).toHaveBeenCalled())
    expect(posten()!.body!.fran).toBe('test-hem')
    expect(posten()!.body).not.toHaveProperty('kallad_till_test')
  })

  it('utanför testvägen: dagens datum, ingen kryssruta, dagens rad, inget fran', async () => {
    const { onKlar } = ark({ lage: 'sokt', job_title: 'Ekonomiassistent', company: 'Norrmejerier', fran: 'komigang' })
    expect(datumFalt().value).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(screen.queryByLabelText(TESTVAG_TEXT.kryss)).toBeNull()
    expect(screen.getByText(FOT_SOKT)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Logga sökt tjänst' }))
    await waitFor(() => expect(onKlar).toHaveBeenCalled())
    expect(posten()!.body).not.toHaveProperty('fran')
    expect(posten()!.body).not.toHaveProperty('kallad_till_test')
  })

  it('Jag ska söka på testvägen: ingen kryssruta', () => {
    ark(testHem('test-hem-plan'))
    fireEvent.click(screen.getByRole('button', { name: /Jag ska söka/ }))
    expect(screen.queryByLabelText(TESTVAG_TEXT.kryss)).toBeNull()
  })
})

describe('kvittensen', () => {
  it('kallad till test, ordagrant', () => {
    render(<TestvagKvittens k={{ id: 'app1', company: 'Norrmejerier', kallad: true }} />)
    const k = screen.getByRole('status')
    expect(k.textContent).toContain('Norrmejerier står nu som kallad till test')
    expect(k.textContent).toContain('Arbetsgivaren har hört av sig, så vi föreslår ingen uppföljning. Lägg till intervjun eller beskedet när det kommer. Datumet du sökte står i din månadsrapport.')
    expect(screen.getByRole('link', { name: 'Tillbaka till testerna' }).getAttribute('href')).toBe('/dashboard/tester?fran=sokta-loggad')
    expect(screen.getByRole('link', { name: 'Öppna tjänsten' }).getAttribute('href')).toBe('/dashboard/sokta-tjanster/app1')
  })

  it('inte kallad, ordagrant', () => {
    render(<TestvagKvittens k={{ id: 'app1', company: 'Norrmejerier', kallad: false }} />)
    const k = screen.getByRole('status')
    expect(k.textContent).toContain('Norrmejerier ligger nu under Sökt')
    expect(k.textContent).toContain('Vi säger till om det är tyst efter tolv dagar. Datumet du sökte står i din månadsrapport.')
    expect(screen.getByRole('link', { name: 'Tillbaka till testerna' })).toBeTruthy()
  })

  it('texterna och vägen tillbaka', () => {
    expect(testvagKvittensText({ company: 'X', kallad: true }).rubrik).toBe('X står nu som kallad till test')
    expect(TILLBAKA_TILL_TESTERNA).toBe('/dashboard/tester?fran=sokta-loggad')
  })
})
