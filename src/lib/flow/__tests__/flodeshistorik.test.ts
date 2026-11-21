import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  avslutaFlodet,
  flodetsUrsprung,
  lamnaFlodet,
  lamnarButik,
  lasDjup,
  minnsRum,
  stampla,
  taVantande,
} from '../flodeshistorik'

function router() {
  return { replace: vi.fn() }
}

describe('flodeshistorik', () => {
  let go: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    window.history.replaceState(null, '', '/dashboard/skapa-brev?steg=1')
    go = vi.spyOn(window.history, 'go').mockImplementation(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: {} }))
    })
    lamnarButik.slapp()
    taVantande()
  })

  afterEach(() => {
    go.mockRestore()
  })

  it('stämplar djupet på posten utan att röra adressen', () => {
    stampla(3, '/dashboard/brev')
    expect(lasDjup()).toBe(3)
    expect(window.location.search).toBe('?steg=1')
  })

  it('klart flöde går tillbaka till första posten och ersätter den med målet', () => {
    stampla(5)
    const r = router()
    avslutaFlodet(r, '/dashboard/mina-brev/abc?klart=1')
    expect(go).toHaveBeenCalledWith(-5)
    expect(r.replace).toHaveBeenCalledWith('/dashboard/mina-brev/abc?klart=1', { scroll: false })
    // Posten som blir kvar är flödets första.
    expect(taVantande()).toBe(0)
  })

  it('på första posten ersätts den direkt, utan att gå i historiken', () => {
    stampla(0)
    const r = router()
    avslutaFlodet(r, '/dashboard/mina-brev')
    expect(go).not.toHaveBeenCalled()
    expect(r.replace).toHaveBeenCalledWith('/dashboard/mina-brev', { scroll: false })
  })

  it('laddaOm kör router.refresh efter bytet, annars inte', () => {
    stampla(3)
    const r = { replace: vi.fn(), refresh: vi.fn() }
    avslutaFlodet(r, '/dashboard/intervju/abc', { laddaOm: true })
    expect(r.replace).toHaveBeenCalledWith('/dashboard/intervju/abc', { scroll: false })
    expect(r.refresh).toHaveBeenCalledTimes(1)
    expect(r.replace.mock.invocationCallOrder[0]).toBeLessThan(r.refresh.mock.invocationCallOrder[0])

    stampla(0)
    const r0 = { replace: vi.fn(), refresh: vi.fn() }
    avslutaFlodet(r0, '/dashboard/intervju/abc', { laddaOm: true })
    expect(r0.refresh).toHaveBeenCalledTimes(1)

    const utan = { replace: vi.fn(), refresh: vi.fn() }
    avslutaFlodet(utan, '/dashboard/mina-brev')
    expect(utan.refresh).not.toHaveBeenCalled()
  })

  it('krysset går till rummets egen post när flödet startades därifrån', () => {
    minnsRum('/dashboard/brev')
    stampla(2, '/dashboard/brev')
    const r = router()
    lamnaFlodet(r)
    expect(go).toHaveBeenCalledWith(-3)
    expect(r.replace).not.toHaveBeenCalled()
  })

  it('krysset ersätter med rummet när posten under inte är rummet', () => {
    minnsRum('/dashboard/cv')
    stampla(2)
    const r = router()
    lamnaFlodet(r)
    expect(go).toHaveBeenCalledWith(-2)
    expect(r.replace).toHaveBeenCalledWith('/dashboard/cv', { scroll: false })
  })

  it('ursprunget faller tillbaka på det senaste rummet', () => {
    minnsRum('/dashboard/brev')
    expect(flodetsUrsprung()).toBe('/dashboard/brev')
  })
})
