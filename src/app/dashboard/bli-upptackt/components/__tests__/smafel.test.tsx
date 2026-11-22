/**
 * Småfelen i kandidatens flöde (klicktestet 2026-11-22): testens namn i
 * löptext, skärmläsarens rubrik och namnet ur CV:t.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { gorTesterna } from '../ProfileStrengthCard'
import SectionCard, { StegKontext } from '../SectionCard'
import { normalizeFullName } from '@/lib/profile/backfillContact'

describe('testens namn i löptext', () => {
  it('är korrekt svenska för ett, två och tre test', () => {
    expect(gorTesterna(['matrislogik'])).toBe('Gör testet i matrislogik')
    expect(gorTesterna(['verbal'])).toBe('Gör testet i verbalt resonemang')
    expect(gorTesterna(['verbal', 'numerisk'])).toBe('Gör testerna i verbalt och numeriskt resonemang')
    expect(gorTesterna(['matrislogik', 'verbal'])).toBe('Gör testerna i matrislogik och verbalt resonemang')
    expect(gorTesterna(['matrislogik', 'verbal', 'numerisk'])).toBe(
      'Gör testerna i matrislogik, verbalt och numeriskt resonemang'
    )
  })
})

describe('stegets rubrik för skärmläsaren', () => {
  it('ett namn, "Synlighetsläge, klart", utan ett ensamt ", klart"', () => {
    render(
      <StegKontext.Provider value={{ nr: 2, klar: true }}>
        <SectionCard title="Synlighetsläge">innehåll</SectionCard>
      </StegKontext.Provider>
    )
    expect(screen.getByRole('heading', { name: 'Synlighetsläge, klart' })).toBeTruthy()
    expect(document.body.textContent).not.toContain(', klart')
  })
})

describe('namnet ur CV:t', () => {
  it('godtar för- och efternamn, stoppar maskningsmarkörer och skräp', () => {
    expect(normalizeFullName('  Saga   Testqvist ')).toBe('Saga Testqvist')
    expect(normalizeFullName('[NAMN]')).toBeNull()
    expect(normalizeFullName('Saga')).toBeNull()
    expect(normalizeFullName('Granitvägen 12')).toBeNull()
    expect(normalizeFullName('saga@exempel.se')).toBeNull()
  })
})
