/**
 * E-postraden överst (beslutet om första dagen som Premiumkund, 2026-11-23):
 * spärren gäller bara obetalda obekräftade konton, så den betalande får
 * ingen mening om att spara permanent.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EmailVerificationBanner, { epostradText } from '../email-verification-banner'

describe('e-postraden', () => {
  it('betalande: "Bekräfta din e-post"; gratis oförändrat', () => {
    expect(epostradText(true)).toBe('Bekräfta din e-post')
    expect(epostradText(false)).toBe('Bekräfta din e-post för att spara dokument permanent.')
  })

  it('utan summering (gratis) står gratistexten kvar', () => {
    render(<EmailVerificationBanner userId="u" email="a@b.se" fullName="" />)
    expect(screen.getByText('Bekräfta din e-post för att spara dokument permanent.')).toBeTruthy()
  })
})
