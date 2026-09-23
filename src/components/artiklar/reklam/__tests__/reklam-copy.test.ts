/**
 * Vakttester för reklamkortens texter i artiklarna och artikellistan
 * (copywriterns slutgranskning 2026-09-23, docs/bygg-noter-paket.md,
 * "Efterarbete: avgjort").
 *
 * Priserna ska läsas ur PLANS, mallantalet ur TEMPLATE_COUNT och
 * gratisgränserna ur kvottjänsten. Ett prisbyte eller ett ändrat brevfönster
 * ska bryta här, inte ljuga tyst i fjorton kort.
 */
import { describe, expect, it } from 'vitest'

import { PLAN_BY_KEY } from '@/lib/plans/plans'
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { LETTER_WINDOW_DAYS } from '@/lib/quota/quotaService'
import {
  GRATIS_KORT,
  INLINE,
  INLINE_RAKNARE,
  LANKRAD,
  LISTA_SLUT,
  SIDO,
  SLUT,
} from '../reklam-copy'

const ALLA = { GRATIS_KORT, INLINE, INLINE_RAKNARE, LANKRAD, LISTA_SLUT, SIDO, SLUT }

/** Alla strängar i ett objekt, rekursivt. */
function strangar(v: unknown): string[] {
  if (typeof v === 'string') return [v]
  if (Array.isArray(v)) return v.flatMap(strangar)
  if (v && typeof v === 'object') return Object.values(v).flatMap(strangar)
  return []
}

const TEXTER = strangar(ALLA)

describe('reklamkortens texter', () => {
  it('har inga talstreck, inget "Lås upp", ingen trial och inga AI-fraser', () => {
    for (const t of TEXTER) {
      expect(t, t).not.toMatch(/[–—]/)
      expect(t, t).not.toMatch(/lås upp/i)
      expect(t, t).not.toMatch(/obegränsat|obegransat/i)
      expect(t, t).not.toMatch(/trial|provperiod|7 dagar gratis|sju dagar gratis/i)
      expect(t, t).not.toMatch(/AI-driven|AI:n /)
    }
  })

  it('den strukna rubriken är borta (ägarens justering 2026-09-23)', () => {
    expect(TEXTER).not.toContain('Gör provet innan rekryteraren gör det')
    expect(INLINE.test.rubrik).toBe('Öva på frågorna innan de räknas')
  })

  it('priserna kommer ur PLANS', () => {
    expect(SIDO.cv.belopp).toBe(`${PLAN_BY_KEY.cv_week.amount} kr`)
    expect(SIDO.test.belopp).toBe(`${PLAN_BY_KEY.test_week.amount} kr`)
    expect(SIDO.allt.belopp).toBe(`${PLAN_BY_KEY.all_week.amount} kr`)
    expect(SIDO.allt.under).toContain(`${PLAN_BY_KEY.all_month.amount} kr`)
    expect(SLUT.cv.prisrad).toContain(`${PLAN_BY_KEY.cv_week.amount} kr`)
    expect(SLUT.test.prisrad).toContain(`${PLAN_BY_KEY.test_week.amount} kr`)
    expect(SLUT.allt.prisrad).toContain(`${PLAN_BY_KEY.all_week.amount} kr`)
    expect(SLUT.allt.prisrad).toContain(`${PLAN_BY_KEY.all_month.amount} kr`)
    expect(LISTA_SLUT.paket.map((p) => p.pris)).toEqual([
      `${PLAN_BY_KEY.cv_week.amount} kr`,
      `${PLAN_BY_KEY.test_week.amount} kr`,
      `${PLAN_BY_KEY.all_week.amount} kr`,
    ])
    // Inga andra belopp än paketens får stå i texterna.
    const tillatna = new Set(
      [PLAN_BY_KEY.cv_week, PLAN_BY_KEY.test_week, PLAN_BY_KEY.all_week, PLAN_BY_KEY.all_month].map((p) =>
        String(p.amount)
      )
    )
    for (const t of TEXTER) {
      for (const m of t.matchAll(/(\d+) kr/g)) expect(tillatna.has(m[1]), t).toBe(true)
    }
  })

  it('rätt paket per kluster: test till Träningspaketet, CV och brev till CV-paketet, intervju och lön till Hela paketet', () => {
    expect(SLUT.test.href).toContain('paket=test_week')
    expect(SLUT.cv.href).toContain('paket=cv_week')
    expect(SLUT.allt.href).toContain('paket=all_week')
    expect(SIDO.test.etikett).toBe(PLAN_BY_KEY.test_week.name)
    expect(SIDO.cv.etikett).toBe(PLAN_BY_KEY.cv_week.name)
    expect(INLINE.test.paketrad).toContain(PLAN_BY_KEY.test_week.name)
    expect(INLINE.mallar.paketrad).toContain(PLAN_BY_KEY.cv_week.name)
    expect(INLINE.analys.paketrad).toContain(PLAN_BY_KEY.cv_week.name)
    expect(INLINE.brev.paketrad).toContain(PLAN_BY_KEY.cv_week.name)
    expect(INLINE.coach.paketrad).toContain(PLAN_BY_KEY.all_week.name)
    // Perioden står i varje paketrad (R1), aldrig bara "79 kr".
    for (const v of Object.values(INLINE)) expect(v.paketrad).toMatch(/kr i veckan/)
  })

  it('mallantalen kommer ur konstanterna', () => {
    expect(INLINE.mallar.paketrad).toContain(`Alla ${TEMPLATE_COUNT} mallar`)
    // Sidokortets text är förklaringsraden ur PLANS (R2).
    expect(SIDO.cv.text).toBe(PLAN_BY_KEY.cv_week.beskrivning)
    expect(SLUT.cv.rader.join(' ')).toContain(`${TEMPLATE_COUNT}`)
    expect(FREE_TEMPLATE_COUNT).toBe(3)
    expect(INLINE.mallar.text.startsWith('Tre mallar')).toBe(true)
  })

  it('gratisbrevet är ett per brevfönster, aldrig ett om dagen', () => {
    expect(LETTER_WINDOW_DAYS).toBe(7)
    for (const t of [INLINE.brev.text, SIDO.cv.gratisrad ?? '', ...GRATIS_KORT.rader]) {
      expect(t, t).not.toMatch(/om dagen/)
    }
    expect(INLINE.brev.text).toContain('var sjunde dag')
    expect(SIDO.cv.gratisrad).toContain('var sjunde dag')
  })
})
