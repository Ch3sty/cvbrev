/**
 * Enstaka omdirigeringar utanför klustersvepen: permanenta (308), ett hopp,
 * och målet är inte självt en källa.
 */
import { describe, expect, it } from 'vitest'
import nextConfig from '../../../../next.config'

describe('enstaka omdirigeringar', () => {
  const FORVANTADE: [string, string][] = [['/rekryteringstester', '/verktyg/rekryteringstester']]

  it('finns, permanenta, ett hopp', async () => {
    const lista = (await nextConfig.redirects!()) as { source: string; destination: string; permanent?: boolean; has?: unknown }[]
    const utanVard = lista.filter((r) => !r.has)
    for (const [fran, till] of FORVANTADE) {
      const traffar = utanVard.filter((r) => r.source === fran)
      expect(traffar, fran).toHaveLength(1)
      expect(traffar[0].destination).toBe(till)
      expect(traffar[0].permanent).toBe(true)
      expect(utanVard.some((r) => r.source === till), till).toBe(false)
    }
  })
})
