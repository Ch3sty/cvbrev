// Kön i testlägen: ett svar som är på väg skickas inte två gånger när kön
// töms (409-bruset i Nivåkollen), ett nyare svar ersätter det gamla, och ett
// svar som inte gick fram efter omförsöken räknas som osparat.

import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useSessionSparning } from '../useSessionSparning'

describe('useSessionSparning', () => {
  it('tömningen väntar in svaret som är på väg i stället för att skicka igen', async () => {
    let slapp: (v: boolean) => void = () => {}
    const skicka = vi.fn(() => new Promise<boolean>((r) => (slapp = r)))
    const { result } = renderHook(() => useSessionSparning<number>(skicka))
    act(() => result.current.spara('u1', 3))
    let tom: Promise<boolean> | null = null
    act(() => {
      tom = result.current.tom()
    })
    expect(skicka).toHaveBeenCalledTimes(1)
    await act(async () => {
      slapp(true)
      expect(await tom!).toBe(true)
    })
    expect(skicka).toHaveBeenCalledTimes(1)
  })

  it('ett svar som inte går fram räknas som osparat, och Försök igen skickar det', async () => {
    vi.useFakeTimers()
    let svar = false
    const skicka = vi.fn(async () => svar)
    const { result } = renderHook(() => useSessionSparning<number>(skicka))
    act(() => result.current.spara('u1', 1))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500)
    })
    expect(result.current.osparade).toBe(1)
    expect(skicka).toHaveBeenCalledTimes(3)
    svar = true
    await act(async () => {
      await result.current.forsokIgen()
    })
    expect(result.current.osparade).toBe(0)
    vi.useRealTimers()
  })

  it('ett nyare svar på samma uppgift tar över', async () => {
    const skickat: number[] = []
    const skicka = vi.fn(async (_: string, d: number) => {
      skickat.push(d)
      return true
    })
    const { result } = renderHook(() => useSessionSparning<number>(skicka))
    act(() => {
      result.current.spara('u1', 1)
      result.current.spara('u1', 2)
    })
    await waitFor(() => expect(result.current.iKo()).toBe(0))
    expect(skickat).toContain(2)
  })
})
