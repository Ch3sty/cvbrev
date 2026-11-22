/**
 * Mejlen efter klicktestet på live 2026-11-22 (F3 till F5 och Övrigt).
 * Mallarna renderas i minnet, inget skickas.
 */
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import type { LifecycleContext } from '../types'
import { quotaWall } from '../templates/conversion'
import { mejlRubrik } from '../templates/komigang'
import { generatePasswordResetEmailHTML } from '@/lib/email/password-reset-email-generator'
import { generateConfirmationEmailHTML, generateConfirmationEmailText } from '@/lib/email/confirmation-email-generator'

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

const losen = () => generatePasswordResetEmailHTML({ userEmail: 'a@b.se', userName: 'Sara', resetUrl: 'https://www.jobbcoach.ai/x' })
const bekr = () => generateConfirmationEmailHTML({ userEmail: 'a@b.se', userName: 'Sara', confirmationUrl: 'https://www.jobbcoach.ai/y' })

/** Emoji och bildsymboler (inte typografiska pilar, punkter och mittpunkter). */
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u

describe('lösenordsmejlet (F3, F5)', () => {
  it('har ingen tom rund ikonplatta kvar', () => {
    expect(losen()).not.toMatch(/border-radius:\s*50%/)
  })

  it('ryms i 600 px: huvudtabellen är flytande med max 600', () => {
    const html = losen()
    expect(html).not.toMatch(/<table width="600"/)
    expect(html).toMatch(/<table width="100%"[^>]*max-width: 600px/)
  })
})

describe('bekräftelsemejlet (F4, F5)', () => {
  it('har ingen kuvertemoji och ingen ikonplatta', () => {
    const html = bekr()
    expect(html).not.toMatch(/✉/u)
    expect(html).not.toMatch(/border-radius:\s*50%/)
  })

  it('ryms i 600 px', () => {
    expect(bekr()).not.toMatch(/<table width="600"/)
  })

  it('textversionen har inget gammalt år', () => {
    expect(generateConfirmationEmailText({ userEmail: 'a@b.se', confirmationUrl: 'u' })).not.toMatch(/2024/)
  })
})

describe('inga emoji som bild i mallarna till användare', () => {
  const rot = path.join(__dirname, '..', '..')
  const filer: string[] = []
  const gaIgenom = (dir: string) => {
    for (const namn of fs.readdirSync(dir)) {
      const p = path.join(dir, namn)
      if (fs.statSync(p).isDirectory()) {
        if (namn !== '__tests__') gaIgenom(p)
      } else if (/\.tsx?$/.test(namn)) filer.push(p)
    }
  }
  gaIgenom(rot)

  it.each(filer.map((f) => [path.relative(rot, f), f]))('%s', (_namn, fil) => {
    expect(fs.readFileSync(fil, 'utf8')).not.toMatch(EMOJI)
  })
})

describe('kvotväggsmejlet', () => {
  it('ämnet och texten säger samma tid som koden räknar: sju dagar', async () => {
    const { subject, html } = await rendera(quotaWall)
    expect(subject).toBe('Du har slagit i taket tre gånger på sju dagar')
    expect(html).toContain('du har slagit i taket tre gånger de senaste sju dagarna.')
    expect(html).not.toMatch(/den här veckan|de senaste dagarna/)
  })
})

describe('Kom igång-mejlets rubrik', () => {
  it('ber henne göra det, i stället för att säga att det redan är gjort', () => {
    expect(mejlRubrik('profil', 'cv')).toBe('Fyll i profilen')
    expect(mejlRubrik('analys', 'cv')).toBe('Kör CV-analysen')
    expect(mejlRubrik('cv_upp', 'allt')).toBe('Ladda upp CV:t')
    expect(mejlRubrik('mall', 'cv')).toBe('Välj mall och ladda ner')
  })
})
