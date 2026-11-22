/**
 * Mejlmallarna efter beslut-agarpunkter punkt 3 (2026-11-22): mejlen säger
 * samma sak som de publika sidorna. Mallarna renderas i minnet, inget skickas.
 */
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import type { LifecycleContext } from '../types'
import { quotaWall } from '../templates/conversion'
import { cancelImmediate } from '../templates/transactional'
import { HELA_PAKETET_RADER } from '@/lib/plans/plans'
import { generatePasswordResetEmailHTML, generatePasswordResetEmailText } from '@/lib/email/password-reset-email-generator'
import { generateConfirmationEmailHTML } from '@/lib/email/confirmation-email-generator'
import { generateRecruiterInterestEmail } from '@/lib/email/recruiter-interest'

const ctx = {
  admin: {} as LifecycleContext['admin'],
  userId: 'u1',
  profile: {
    id: 'u1',
    email: 'sara@exempel.se',
    full_name: 'Sara Lindström',
    subscription_tier: 'free',
    subscription_status: null,
    current_period_end: null,
    premium_until: null,
    premium_source: null,
    quota_emails_opt_out: false,
    weekly_digest_opt_out: false,
    last_active: null,
    created_at: null,
  },
  metadata: {},
} satisfies LifecycleContext

async function rendera(mall: { render: (c: LifecycleContext) => unknown }) {
  return (await mall.render(ctx)) as { subject: string; preheader: string; html: string }
}

describe('kvotväggsmejlet (M1 till M3)', () => {
  it('listar alla sex rader i Premiumlistan', async () => {
    const { html } = await rendera(quotaWall)
    for (const rad of HELA_PAKETET_RADER) expect(html).toContain(rad)
  })

  it('säger inte "utan tak" eller "taket på allt"', async () => {
    const { preheader, html } = await rendera(quotaWall)
    expect(preheader).toMatch(/, utan bindningstid\.$/)
    expect(preheader).not.toMatch(/utan tak/)
    expect(html).not.toMatch(/taket på allt/)
    expect(html).toContain('skriver du personliga brev, frågar Jobbcoachen och tränar alla testnivåer utan att räkna, och du säger upp när du vill.')
  })
})

describe('uppsägningsmejlet (M9)', () => {
  it('beskriver gratisnivån med listans ord', async () => {
    const { html } = await rendera(cancelImmediate)
    expect(html).toContain('ett personligt brev var sjunde dag och grundnivån i alla åtta testtyperna, ett test om dagen.')
    expect(html).not.toMatch(/i veckan och grundnivån i varje testtyp/)
  })
})

describe('Kom igång-mejlen (M10 till M16)', () => {
  const kalla = fs.readFileSync(path.join(__dirname, '../templates/komigang.ts'), 'utf8')

  it('säger inget om fynd, nyckelord eller tider som inte går att belägga', () => {
    expect(kalla).not.toMatch(/fynd/i)
    expect(kalla).not.toMatch(/nyckelord/i)
    expect(kalla).not.toMatch(/halvtimme|25 till 40 minuter|Cirka 20 minuter|Två minuter/)
    expect(kalla).not.toMatch(/förklaringen efter varje fråga/)
  })

  it('har beslutets nya lydelser', () => {
    expect(kalla).toContain('Ditt CV fick ${fakta.poang} av 100. Så hittar du poängen som fattas.')
    expect(kalla).toContain("subject: 'Se din läsbarhetspoäng, del för del.'")
    expect(kalla).toContain("subject: 'Nivåkollen: din nivå i matrislogik på cirka åtta minuter.'")
    expect(kalla).toContain("preheader: 'Samma format och tid som provet, lämnas in när tiden är ute.'")
    expect(kalla).toContain('Jobbcoachen känner till din målroll, ort och bransch från profilen')
  })
})

describe('mejlet för nytt lösenord (M24 till M26)', () => {
  const data = { userEmail: 'sara@exempel.se', userName: 'Sara', resetUrl: 'https://www.jobbcoach.ai/x' }

  it('säger 24 timmar och länkar till /kontakt', () => {
    const html = generatePasswordResetEmailHTML(data)
    const text = generatePasswordResetEmailText(data)
    expect(html).toContain('<li>Länken gäller i 24 timmar</li>')
    expect(text).toContain('Länken gäller i 24 timmar.')
    for (const s of [html, text]) {
      expect(s).not.toMatch(/60 minuter/)
      expect(s).not.toMatch(/jobbcoach\.ai\/support/)
      expect(s).toContain('https://www.jobbcoach.ai/kontakt')
    }
  })

  it('har inte låset och varningstriangeln (M25)', () => {
    const html = generatePasswordResetEmailHTML(data)
    expect(html).not.toMatch(/🔒|⚠/u)
    expect(html).toContain('Viktigt att veta:')
  })
})

describe('bekräftelsemejlet (M27)', () => {
  it('har giltigheten utan år och mittpunkt', () => {
    const html = generateConfirmationEmailHTML({ userEmail: 'a@b.se', userName: 'Sara', confirmationUrl: 'u' })
    expect(html).toContain('Jobbcoach.ai. Länken gäller i 24 timmar.')
    expect(html).not.toMatch(/© 2024/)
  })
})

describe('mejlet om en rekryterares intresse (M22, M23)', () => {
  it('säger vad som delas i båda lägena', () => {
    const { html } = generateRecruiterInterestEmail('u1', 'Testbolaget')
    expect(html).toContain('Din e-postadress delas först om du tackar ja. Har du valt Anonym först gäller det också ditt namn.')
    expect(html).toContain('Accepterar du delas ditt namn, din e-postadress och arbetsgivarna i din erfarenhet, så att ni kan ta kontakt.')
    expect(html).not.toMatch(/fortfarande anonym/)
  })
})
