/**
 * Kvotpåminnelsen (beslut-agarpunkter M20 och M21, 2026-11-22): CV-analysen
 * har ingen kvot och Jobbcoachens meddelanden kommer aldrig tillbaka, så
 * mejlet har inga egna texter för dem längre.
 */
import { describe, expect, it } from 'vitest'

import { generateQuotaBackEmail } from '../quota-back'

describe('generateQuotaBackEmail', () => {
  it('har ingen egen text för CV-analysen', () => {
    const { subject, html } = generateQuotaBackEmail('u1', 'cv_analysis')
    expect(subject).not.toBe('Din CV-analys är tillgänglig igen')
    expect(html).not.toMatch(/Kör en ny analys/)
  })

  it('har ingen egen text för Jobbcoachen', () => {
    const { subject, html } = generateQuotaBackEmail('u1', 'chat_message')
    expect(subject).not.toBe('Jobbcoachen är redo för nya frågor')
    expect(html).not.toMatch(/till jobbcoachen igen/)
  })

  it('brevet och testerna har kvar sina texter', () => {
    expect(generateQuotaBackEmail('u1', 'letter_generation').subject).toBe('Veckans personliga brev väntar på dig')
    expect(generateQuotaBackEmail('u1', 'test:matrislogik').subject).toBe('Dagens rekryteringstester väntar på dig')
  })
})
