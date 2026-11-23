/**
 * Mallraden på Ditt CV (beslutet om första dagen som Premiumkund,
 * 2026-11-23): den som betalat får raden utan "Du provar fritt och betalar
 * först när du laddar ner.", gratis oförändrat.
 */

import { describe, it, expect } from 'vitest'
import { ANNAN_MALL } from '../texter'

describe('mallraden på Ditt CV', () => {
  it('betalat: befintlig lydelse minus sista meningen', () => {
    expect(ANNAN_MALL.radBetalt('Linne', 3)).toBe('Du har Linne. Så här ser ditt CV ut i tre andra.')
    expect(ANNAN_MALL.radBetalt('Linne', 1)).toBe('Du har Linne. Så här ser ditt CV ut i en annan.')
    expect(ANNAN_MALL.radBetalt('Linne', 3)).not.toMatch(/betalar|provar fritt/)
  })

  it('gratis: oförändrat', () => {
    expect(ANNAN_MALL.rad('Linne', 3)).toBe(
      'Du har Linne. Så här ser ditt CV ut i tre andra. Du provar fritt och betalar först när du laddar ner.'
    )
    expect(ANNAN_MALL.radKort).toBe('Du provar fritt och betalar först när du laddar ner.')
    expect(ANNAN_MALL.rad('Linne', 3).startsWith(ANNAN_MALL.radBetalt('Linne', 3))).toBe(true)
  })
})
