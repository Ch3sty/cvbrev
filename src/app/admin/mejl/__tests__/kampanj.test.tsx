/**
 * Rutan "Kampanjmejlen" på Mejl-sidan: läget i klartext, brickorna och
 * reservvägen "Skicka till de N som återstår". fetch är en mock: inget anrop
 * lämnar testet och inget mejl skickas.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import KampanjKort from '../KampanjKort'
import {
  bekraftaKnapp,
  kampanjLage,
  kampanjLageText,
  kampanjUtskick,
  resultatText,
  skickaKnapp,
  type KampanjRuta,
} from '../kampanjlage'
import { KAMPANJ_BY_NYCKEL } from '@/lib/kampanj/kampanj'
import { tidKort } from '@/lib/admin/tomt'

const BW = KAMPANJ_BY_NYCKEL['black-week-2026']
const CM = KAMPANJ_BY_NYCKEL['cyber-monday-2026']

/** Måndag 23 november 2026 kl. 09.00 svensk tid: Black Week pågår, Cyber Monday väntar. */
const MITT_I_BW = new Date('2026-11-23T08:00:00Z')

describe('läget', () => {
  it('före start: går ut av sig självt måndag 30 november kl. 07.00', () => {
    expect(kampanjLage(CM, MITT_I_BW)).toBe('fore')
    expect(kampanjLageText(CM, MITT_I_BW)).toBe('Går ut av sig självt måndag 30 november kl. 07.00.')
  })

  it('pågår efter utskicket: när det gick och till när priset gäller', () => {
    expect(kampanjLage(BW, MITT_I_BW)).toBe('pagar')
    expect(kampanjLageText(BW, MITT_I_BW)).toBe(
      'Pågår. Mejlet gick ut med morgonkörningen måndag 23 november kl. 07.00, och priset gäller till och med söndag 29 november 23.59.'
    )
  })

  it('pågår före 07.00 på startdagen: mejlet går ut i dag', () => {
    const tidigt = new Date('2026-11-30T03:00:00Z') // 04.00 svensk tid
    expect(kampanjLage(CM, tidigt)).toBe('pagar')
    expect(kampanjLageText(CM, tidigt)).toBe(
      'Pågår. Mejlet går ut av sig självt i dag kl. 07.00, och priset gäller bara måndag 30 november till 23.59.'
    )
  })

  it('slut: sista minuten och att inget mer skickas', () => {
    const efter = new Date('2026-12-02T10:00:00Z')
    expect(kampanjLage(BW, efter)).toBe('slut')
    expect(kampanjLageText(BW, efter)).toBe('Slutade söndag 29 november kl. 23.59. Inget mer skickas.')
    expect(kampanjLageText(CM, efter)).toBe('Slutade måndag 30 november kl. 23.59. Inget mer skickas.')
  })

  it('utskicksdagen är startdagen kl. 07.00', () => {
    expect(tidKort(kampanjUtskick(BW))).toBe('23 nov kl. 07.00')
    expect(tidKort(kampanjUtskick(CM))).toBe('30 nov kl. 07.00')
  })

  it('knapparna och resultatet i klartext, utan tankstreck', () => {
    expect(skickaKnapp(99)).toBe('Skicka till de 99 som återstår')
    expect(skickaKnapp(1)).toBe('Skicka till den som återstår')
    expect(bekraftaKnapp(99)).toBe('Ja, skicka 99 mejl nu')
    expect(resultatText(97, 2)).toBe('97 mejl skickade, 2 misslyckades.')
    expect(resultatText(99, 0)).toBe('99 mejl skickade, inga misslyckades.')
    for (const t of [kampanjLageText(BW, MITT_I_BW), kampanjLageText(CM, MITT_I_BW)]) {
      expect(t).not.toContain('—')
    }
  })
})

function ruta(over: Partial<KampanjRuta> = {}): KampanjRuta {
  return {
    nyckel: 'black-week-2026',
    namn: 'Black Week',
    lage: 'pagar',
    utskicksdag: '23 nov kl. 07.00',
    lageText: 'Pågår.',
    tal: { kvar: 99, skickade: 900 },
    ...over,
  }
}

function svar(status: number, kropp: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => kropp } as Response
}

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => {
  vi.unstubAllGlobals()
})

/** Anropen med mode send. */
const sandanrop = () =>
  fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST' && JSON.parse(init.body).mode === 'send')

describe('KampanjKort', () => {
  it('före start: brickor och läge, test finns, ingen skickaknapp', () => {
    render(<KampanjKort ruta={ruta({ nyckel: 'cyber-monday-2026', namn: 'Cyber Monday', lage: 'fore', utskicksdag: '30 nov kl. 07.00', lageText: 'Går ut av sig självt måndag 30 november kl. 07.00.', tal: { kvar: 950, skickade: 0 } })} />)
    expect(screen.getByText('Cyber Monday')).toBeInTheDocument()
    expect(screen.getByText('30 nov kl. 07.00')).toBeInTheDocument()
    expect(screen.getByText('950')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('Går ut av sig självt måndag 30 november kl. 07.00.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Skicka test till mig' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /som återstår/ })).toBeNull()
  })

  it('slut: ingen skickaknapp även om någon återstår', () => {
    render(<KampanjKort ruta={ruta({ lage: 'slut', tal: { kvar: 12, skickade: 900 } })} />)
    expect(screen.queryByRole('button', { name: /som återstår/ })).toBeNull()
  })

  it('pågår med kvar 0: ingen skickaknapp', () => {
    render(<KampanjKort ruta={ruta({ tal: { kvar: 0, skickade: 999 } })} />)
    expect(screen.queryByRole('button', { name: /som återstår/ })).toBeNull()
    expect(screen.getByText('999')).toBeInTheDocument()
  })

  it('urvalet gick inte att läsa: text i brickorna, ingen skickaknapp', () => {
    render(<KampanjKort ruta={ruta({ tal: null })} />)
    expect(screen.getAllByText('Kunde inte läsas')).toHaveLength(2)
    expect(screen.queryByRole('button', { name: /som återstår/ })).toBeNull()
  })

  it('pågår med kvar > 0: bekräftelse, ett anrop, resultat och omlästa tal', async () => {
    let slapp!: (r: Response) => void
    fetchMock.mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === 'POST') return new Promise<Response>((r) => (slapp = r))
      return Promise.resolve(
        svar(200, { success: true, data: [{ kampanj: 'black-week-2026', kvar: 2, skickade: 997 }, { kampanj: 'cyber-monday-2026', kvar: 950, skickade: 0 }] })
      )
    })
    render(<KampanjKort ruta={ruta()} />)

    // Första trycket skickar inget, det byter till bekräftelsen.
    fireEvent.click(screen.getByRole('button', { name: 'Skicka till de 99 som återstår' }))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Avbryt' })).toBeInTheDocument()

    // Avbryt går tillbaka utan anrop.
    fireEvent.click(screen.getByRole('button', { name: 'Avbryt' }))
    expect(fetchMock).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Skicka till de 99 som återstår' }))

    // Dubbeltryck på bekräftelsen ger ett anrop.
    const ja = screen.getByRole('button', { name: 'Ja, skicka 99 mejl nu' })
    fireEvent.click(ja)
    fireEvent.click(ja)
    expect(sandanrop()).toHaveLength(1)
    expect(JSON.parse(sandanrop()[0][1].body)).toEqual({ mode: 'send', kampanj: 'black-week-2026', confirm: true })
    expect(screen.getByRole('button', { name: 'Skickar 99 mejl' })).toBeDisabled()

    await act(async () => {
      slapp(svar(200, { success: true, mode: 'send', kampanj: 'black-week-2026', skickade: 97, misslyckade: 2, redan: 0 }))
    })

    await waitFor(() => expect(screen.getByText('97 mejl skickade, 2 misslyckades.')).toBeInTheDocument())
    expect(sandanrop()).toHaveLength(1)
    // Talen är omlästa ur GET.
    expect(fetchMock.mock.calls.some(([u, init]) => u === '/api/admin/email/kampanj' && !init?.method)).toBe(true)
    expect(screen.getByText('997')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Skicka till de 2 som återstår' })).toBeInTheDocument()
  })

  it('felsvar från rutten visas i klartext', async () => {
    fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
      Promise.resolve(
        init?.method === 'POST'
          ? svar(409, { error: 'Kampanjen pågår inte just nu' })
          : svar(200, { success: true, data: [{ kampanj: 'black-week-2026', kvar: 99, skickade: 900 }] })
      )
    )
    render(<KampanjKort ruta={ruta()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Skicka till de 99 som återstår' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ja, skicka 99 mejl nu' }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Utskicket gick inte: Kampanjen pågår inte just nu.')
    )
    expect(sandanrop()).toHaveLength(1)
  })

  it('serverfel utan text och ett anrop som aldrig når fram ger egna meningar', async () => {
    fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
      init?.method === 'POST' ? Promise.reject(new TypeError('Failed to fetch')) : Promise.resolve(svar(500, {}))
    )
    render(<KampanjKort ruta={ruta()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Skicka till de 99 som återstår' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ja, skicka 99 mejl nu' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Svaret kom aldrig fram'))
    expect(screen.getByRole('alert')).toHaveTextContent('Ladda om sidan')
  })

  it('test till mig: mode test, mottagaren i klartext, felet i klartext', async () => {
    fetchMock.mockResolvedValueOnce(svar(200, { success: true, mode: 'test', recipient: 'agaren@exempel.se' }))
    render(<KampanjKort ruta={ruta({ lage: 'fore' })} />)
    fireEvent.click(screen.getByRole('button', { name: 'Skicka test till mig' }))
    await waitFor(() => expect(screen.getByText('Testet skickat till agaren@exempel.se.')).toBeInTheDocument())
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ mode: 'test', kampanj: 'black-week-2026' })

    fetchMock.mockResolvedValueOnce(svar(500, { error: 'Testutskicket misslyckades' }))
    fireEvent.click(screen.getByRole('button', { name: 'Skicka test till mig' }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Testet gick inte: Testutskicket misslyckades.')
    )
  })
})
