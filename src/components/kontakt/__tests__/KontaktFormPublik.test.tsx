/**
 * Kontaktformuläret på publika /kontakt (spec-rummen 23.1). Förut väntade
 * det 1,5 sekunder och visade Tack utan att skicka något. Nu: riktig fetch
 * till /api/contact, Tack bara på 2xx, fel med fälten kvar annars, och ett
 * honungsfält som följer med i kroppen. fetch är mockad; inget meddelande
 * lämnar testet.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import KontaktFormPublik from '../KontaktFormPublik'

const TACK = 'Tack. Vi läser allt och svarar från support@jobbcoach.ai.'
const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => {
  vi.unstubAllGlobals()
})

function fyllOchSkicka() {
  fireEvent.change(screen.getByLabelText(/Ditt namn/), { target: { value: 'Anna Test' } })
  fireEvent.change(screen.getByLabelText(/Din e-post/), { target: { value: 'anna@exempel.se' } })
  fireEvent.change(screen.getByLabelText(/Vad gäller ditt ärende/), { target: { value: 'Fråga före köp' } })
  fireEvent.change(screen.getByLabelText(/Ditt meddelande/), { target: { value: 'Ingår LinkedIn i Premium?' } })
  fireEvent.click(screen.getByRole('button', { name: /Skicka/ }))
}

const svar = (status: number, body: unknown) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body }) as Response

describe('KontaktFormPublik', () => {
  it('200 ger Tack och skickar fälten med tomt honungsfält till /api/contact', async () => {
    fetchMock.mockResolvedValue(svar(200, { ok: true }))
    render(<KontaktFormPublik variant="public" />)
    fyllOchSkicka()

    expect(await screen.findByText(TACK)).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/contact')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({
      name: 'Anna Test',
      email: 'anna@exempel.se',
      subject: 'Fråga före köp',
      message: 'Ingår LinkedIn i Premium?',
      webbplats: '',
    })
  })

  it('Tack lovar ingen svarstid', async () => {
    fetchMock.mockResolvedValue(svar(200, { ok: true }))
    render(<KontaktFormPublik variant="public" />)
    fyllOchSkicka()
    await screen.findByText(TACK)
    expect(screen.queryByText(/24 timmar/)).toBeNull()
  })

  it('429 visar routens text, aldrig Tack, och fälten står kvar', async () => {
    const text = 'Du har skickat flera meddelanden i dag. Maila support@jobbcoach.ai direkt.'
    fetchMock.mockResolvedValue(svar(429, { ok: false, message: text }))
    render(<KontaktFormPublik variant="public" />)
    fyllOchSkicka()

    const fel = await screen.findByRole('alert')
    expect(fel).toHaveTextContent(text)
    expect(screen.queryByText(TACK)).toBeNull()
    expect(screen.getByLabelText(/Ditt meddelande/)).toHaveValue('Ingår LinkedIn i Premium?')
  })

  it('nätverksfel ger samma standardtext som inloggat, aldrig Tack', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    render(<KontaktFormPublik variant="public" />)
    fyllOchSkicka()

    const fel = await screen.findByRole('alert')
    expect(fel).toHaveTextContent('Vi nådde inte fram. Fälten står kvar, tryck Skicka igen, eller maila support@jobbcoach.ai.')
    expect(fel).not.toHaveTextContent('Failed to fetch')
    expect(screen.queryByText(TACK)).toBeNull()
  })

  it('5xx utan läsbar kropp ger standardtexten', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error('ingen json') } } as unknown as Response)
    render(<KontaktFormPublik variant="public" />)
    fyllOchSkicka()
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Vi nådde inte fram'))
  })

  it('honungsfältet är dolt för skärmläsare, utan tabbstopp och utan autofyll', () => {
    const { container } = render(<KontaktFormPublik variant="public" />)
    const falt = container.querySelector('input[name="webbplats"]') as HTMLInputElement
    expect(falt).not.toBeNull()
    expect(falt.tabIndex).toBe(-1)
    expect(falt.getAttribute('autocomplete')).toBe('off')
    expect(falt.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('platshållaren är kundens egen formulering', () => {
    render(<KontaktFormPublik variant="public" />)
    expect(screen.getByPlaceholderText('Fråga om min prenumeration')).toBeInTheDocument()
  })
})
