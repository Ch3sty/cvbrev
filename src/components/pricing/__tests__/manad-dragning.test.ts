/**
 * Månaden dras samma datum varje kalendermånad, kvartalet var tredje månad
 * (Stripes regel), aldrig "var trettionde dag" (köptestet 2026-09-24, bugg 8).
 */
import { describe, expect, it } from 'vitest'
import { foregaendeDragning, nastaDragningEfter } from '@/lib/plans/plans'
import {
  ALLT_LANGDER,
  INTERVALL_RAD,
  KOPSTEG,
  PAKET_PUNKTER,
  alltPrisSub,
  nastaDragningText,
  samtyckeVidKop,
} from '../paket-copy'
import { PAKET } from '@/lib/onboarding/program'
import { kvittoMejl } from '@/lib/email/lifecycle/templates/vecka'

const iso = (d: Date) => d.toISOString().slice(0, 10)

describe('nastaDragningEfter, som Stripe räknar', () => {
  it('månaden landar på samma datum nästa månad, inte +30 dagar', () => {
    expect(iso(nastaDragningEfter('all_month', new Date('2026-09-24T10:00:00Z')))).toBe('2026-10-24')
    // Oktober har 31 dagar: +30 dagar hade gett 30 november.
    expect(iso(nastaDragningEfter('all_month', new Date('2026-10-31T10:00:00Z')))).toBe('2026-11-30')
    expect(iso(nastaDragningEfter('all_month', new Date('2027-01-31T10:00:00Z')))).toBe('2027-02-28')
    expect(iso(nastaDragningEfter('all_month', new Date('2026-12-15T10:00:00Z')))).toBe('2027-01-15')
  })

  it('kvartalet landar tre kalendermånader senare, veckan sju dagar', () => {
    expect(iso(nastaDragningEfter('all_quarter', new Date('2026-09-24T10:00:00Z')))).toBe('2026-12-24')
    expect(iso(nastaDragningEfter('all_quarter', new Date('2026-11-30T10:00:00Z')))).toBe('2027-02-28')
    expect(iso(nastaDragningEfter('cv_week', new Date('2026-09-24T10:00:00Z')))).toBe('2026-10-01')
  })

  it('behåller klockslaget, som Stripes period', () => {
    const fran = new Date('2026-09-24T07:20:23Z')
    expect(nastaDragningEfter('all_month', fran).toISOString()).toBe('2026-10-24T07:20:23.000Z')
  })

  it('föregående dragning är samma regel baklänges', () => {
    expect(iso(foregaendeDragning('all_month', new Date('2026-10-24T10:00:00Z')))).toBe('2026-09-24')
    expect(iso(foregaendeDragning('all_quarter', new Date('2026-12-24T10:00:00Z')))).toBe('2026-09-24')
    expect(iso(foregaendeDragning('test_week', new Date('2026-10-01T10:00:00Z')))).toBe('2026-09-24')
  })
})

describe('texterna om förnyelsen', () => {
  const allaTexter = (): string[] => {
    const ut: string[] = []
    for (const { plan } of ALLT_LANGDER) {
      ut.push(alltPrisSub(plan), KOPSTEG.fornyasVarde(plan, '24 oktober'), samtyckeVidKop(plan))
      ut.push(INTERVALL_RAD[plan], ...PAKET_PUNKTER[plan])
    }
    for (const p of Object.values(PAKET)) ut.push(p.intervall, ...p.ingar)
    return ut
  }

  it('säger aldrig var trettionde eller nittionde dag, och har inga talstreck', () => {
    for (const t of allaTexter()) {
      expect(t).not.toMatch(/trettio|nittio/i)
      expect(t).not.toMatch(/[—–]/)
    }
  })

  it('månaden och kvartalet säger samma datum', () => {
    expect(alltPrisSub('all_month')).toBe('i månaden\ndras varje månad på samma datum')
    expect(KOPSTEG.fornyasVarde('all_month', '24 oktober')).toBe('varje månad på samma datum, nästa 24 oktober')
    expect(KOPSTEG.fornyasVarde('all_quarter', '24 december')).toBe('var tredje månad på samma datum, nästa 24 december')
    expect(PAKET.all_month.intervall).toBe('Dras varje månad på samma datum tills du säger upp')
    expect(PAKET.all_quarter.intervall).toBe('Dras var tredje månad på samma datum tills du säger upp')
  })
})

describe('samtyckestexten på köpsteget', () => {
  const nu = new Date('2026-10-31T09:00:00Z')

  it('månaden: beloppet ur paketet och datumet som Stripe sätter', () => {
    expect(nastaDragningText('all_month', nu)).toBe('30 november')
    expect(samtyckeVidKop('all_month', nu)).toBe(
      'Jag vill att innehållet startar direkt och förstår att ångerrätten därmed inte gäller. 149 kr dras varje månad på samma datum, nästa gång 30 november, tills jag säger upp prenumerationen.'
    )
  })

  it('kvartalet och veckan', () => {
    expect(samtyckeVidKop('all_quarter', new Date('2026-09-24T09:00:00Z'))).toContain(
      '299 kr dras var tredje månad på samma datum, nästa gång 24 december,'
    )
    expect(samtyckeVidKop('cv_week', new Date('2026-09-24T09:00:00Z'))).toContain(
      '79 kr dras var sjunde dag, nästa gång 1 oktober,'
    )
  })

  it('Dagspasset har inget datum och inget som dras igen', () => {
    expect(samtyckeVidKop('all_day', nu)).toBe(
      'Jag vill att innehållet startar direkt och förstår att ångerrätten därmed inte gäller. Det är ett engångsköp på 49 kr, inget dras igen.'
    )
  })
})

describe('kvittot', () => {
  const rendera = (planKey: string, amount: number, periodStart: string, periodEnd: string) =>
    kvittoMejl.render({
      userId: 'u',
      metadata: { planKey, amount, periodStart, periodEnd },
    } as never) as { html: string; subject: string }

  it('månaden: dras varje månad på samma datum, nästa dragning är periodens slut', () => {
    const { html } = rendera('all_month', 149, '2026-09-24T07:20:23Z', '2026-10-24T07:20:23Z')
    expect(html).toContain('dras sedan varje månad på samma datum med samma belopp')
    expect(html).toContain('Nästa dragning: 24 oktober')
    expect(html).not.toMatch(/trettio/)
  })

  it('kvartalet: var tredje månad på samma datum', () => {
    const { html } = rendera('all_quarter', 299, '2026-09-24T07:20:23Z', '2026-12-24T07:20:23Z')
    expect(html).toContain('dras sedan var tredje månad på samma datum')
    expect(html).toContain('Nästa dragning: 24 december')
  })
})
