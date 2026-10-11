/**
 * Kontaktformuläret i inloggat läge (våg 5, docs/qa/rummen/vag-5/kontakt.md).
 * Förut visade det Tack utan att skicka något. Nu: Tack bara när
 * /api/contact svarar 2xx, annars ett fel med fälten kvar så att man kan
 * försöka igen. fetch är mockad; inget meddelande lämnar testet.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import KontaktForm from '../KontaktForm'

const TACK = /Tack. Vi läser allt och svarar från support@jobbcoach.ai./
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
  fireEvent.change(screen.getByLabelText(/Vad gäller ditt ärende/), { target: { value: 'Fråga om prenumerationen' } })
  fireEvent.change(screen.getByLabelText(/Ditt meddelande/), { target: { value: 'Hej, när dras nästa betalning?' } })
  fireEvent.click(screen.getByRole('button', { name: 'Skicka' }))
}

const svar = (status: number, body: unknown) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body }) as Response

describe('KontaktForm', () => {
  it('200 ger Tack och skickar fälten till /api/contact', async () => {
    fetchMock.mockResolvedValue(svar(200, { ok: true }))
    render(<KontaktForm variant="dashboard" />)
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
      subject: 'Fråga om prenumerationen',
      message: 'Hej, när dras nästa betalning?',
    })
  })

  it('500 ger fel, aldrig Tack, och fälten står kvar för ett nytt försök', async () => {
    fetchMock.mockResolvedValue(svar(500, { ok: false, message: 'Meddelandet gick inte iväg.' }))
    render(<KontaktForm variant="dashboard" />)
    fyllOchSkicka()

    const fel = await screen.findByRole('alert')
    expect(fel).toHaveTextContent('Det gick inte att skicka')
    expect(fel).toHaveTextContent('Meddelandet gick inte iväg.')
    expect(screen.queryByText(TACK)).toBeNull()
    expect(screen.getByLabelText(/Ditt meddelande/)).toHaveValue('Hej, när dras nästa betalning?')

    // Försök igen: samma knapp, nu med 200.
    fetchMock.mockResolvedValue(svar(200, { ok: true }))
    fireEvent.click(screen.getByRole('button', { name: 'Skicka' }))
    expect(await screen.findByText(TACK)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('nätverksfel ger fel med standardtexten, aldrig Tack', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    render(<KontaktForm variant="dashboard" />)
    fyllOchSkicka()

    const fel = await screen.findByRole('alert')
    expect(fel).toHaveTextContent('Vi nådde inte fram')
    expect(fel).not.toHaveTextContent('Failed to fetch')
    expect(screen.queryByText(TACK)).toBeNull()
  })

  it('4xx utan läsbar kropp ger standardtexten', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401, json: async () => { throw new Error('ingen json') } } as unknown as Response)
    render(<KontaktForm variant="dashboard" />)
    fyllOchSkicka()

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Vi nådde inte fram'))
    expect(screen.queryByText(TACK)).toBeNull()
  })

  it('platshållaren säger prenumeration, inte paket', () => {
    render(<KontaktForm variant="dashboard" />)
    expect(screen.getByPlaceholderText('Fråga om min prenumeration')).toBeInTheDocument()
  })

  it('Tack lovar ingen svarstid', async () => {
    fetchMock.mockResolvedValue(svar(200, { ok: true }))
    render(<KontaktForm variant="dashboard" />)
    fyllOchSkicka()
    expect(await screen.findByText(TACK)).toBeInTheDocument()
    expect(screen.queryByText(/24 timmar/)).toBeNull()
  })
})
