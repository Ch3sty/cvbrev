import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useBrevAutospar } from '@/hooks/use-letters'

function svar(status: number, body: unknown) {
  return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))
}

describe('useBrevAutospar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('samlar ändringar och skickar en gång efter en sekund', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => svar(200, { data: { id: 'b1' } }) as any)
    const { result } = renderHook(() => useBrevAutospar('b1'))

    act(() => {
      result.current.spara({ halsning: 'Hej Maria,' })
      result.current.spara({ stycken: ['Ett.'] })
    })
    expect(result.current.status).toBe('vantar')
    expect(fetchMock).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/letters/b1')
    expect(init.method).toBe('PUT')
    expect(JSON.parse(init.body as string)).toEqual({ halsning: 'Hej Maria,', stycken: ['Ett.'] })
    expect(result.current.status).toBe('sparat')
  })

  it('ett fel visas som fel, aldrig som sparat, med koden', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => svar(403, { error: 'letter_locked', code: 'letter_locked' }) as any
    )
    const { result } = renderHook(() => useBrevAutospar('b1'))
    act(() => {
      result.current.spara({ stycken: ['Ett.'] })
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(result.current.status).toBe('fel')
    expect(result.current.fel?.code).toBe('letter_locked')
    expect(result.current.fel?.status).toBe(403)
  })
})
