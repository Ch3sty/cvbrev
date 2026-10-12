import { afterEach, describe, expect, it, vi } from 'vitest'
import { TEMA_HANDELSE, lasTema, sparaTema } from '../tema'

describe('tema', () => {
  afterEach(() => {
    window.localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  it('läser Följer systemet när inget är sparat eller värdet är okänt', () => {
    expect(lasTema()).toBe('system')
    window.localStorage.setItem('tema', 'lila')
    expect(lasTema()).toBe('system')
  })

  it('sparar valet, sätter data-theme och säger till lyssnarna', () => {
    const lyssnare = vi.fn()
    window.addEventListener(TEMA_HANDELSE, lyssnare)

    sparaTema('morkt')
    expect(window.localStorage.getItem('tema')).toBe('morkt')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(lasTema()).toBe('morkt')

    sparaTema('ljust')
    expect(document.documentElement.dataset.theme).toBe('light')

    sparaTema('system')
    expect(window.localStorage.getItem('tema')).toBeNull()
    expect(document.documentElement.dataset.theme).toBeUndefined()

    expect(lyssnare).toHaveBeenCalledTimes(3)
    window.removeEventListener(TEMA_HANDELSE, lyssnare)
  })
})
