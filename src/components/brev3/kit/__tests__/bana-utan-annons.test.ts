import { describe, expect, it } from 'vitest'
import { banaEtikett } from '../BrevBana'

// Klicktestet live 2026-11-22: ett brev ur startflödet utan inklistrad
// annons ska inte kallas "skrivet mot annonsen", inte heller i vägen.
describe('Brevets väg utan annons', () => {
  it('med annons: annonsen är inläst', () => {
    expect(banaEtikett('las-igenom', ['annonsen', 'brevet'])).toBe(
      'Brevets väg: annonsen är inläst och brevet är skrivet. Nästa steg är att läsa igenom, sedan skicka.'
    )
  })

  it('utan annons: tjänsten är ifylld, ingen annons nämns', () => {
    const t = banaEtikett('las-igenom', ['annonsen', 'brevet'], true)
    expect(t).toBe('Brevets väg: tjänsten är ifylld och brevet är skrivet. Nästa steg är att läsa igenom, sedan skicka.')
    expect(t).not.toMatch(/annons/)
  })
})
