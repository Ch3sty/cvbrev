import { describe, expect, it } from 'vitest'
import { harTal } from '../matt'

describe('harTal och ordet procent', () => {
  it('en platshållare följd av procent är inget tal', () => {
    expect(harTal('Ökade försäljningen med [antal] procent')).toBe(false)
  })

  it('ett ifyllt tal räknas, med siffror eller ord', () => {
    expect(harTal('Ökade försäljningen med 12 procent')).toBe(true)
    expect(harTal('Ökade försäljningen med tio procent')).toBe(true)
    expect(harTal('Ökade försäljningen med 12 %')).toBe(true)
  })
})
