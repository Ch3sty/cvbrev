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

import { PLAN_BY_KEY, SALD_PLAN, paketNamn, prisPeriod } from '@/lib/plans/plans'
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

  it('priserna kommer ur PLANS, och bara det sålda priset står', () => {
    const plan = PLAN_BY_KEY[SALD_PLAN]
    for (const k of ['cv', 'test', 'allt'] as const) {
      expect(SIDO[k].belopp).toBe(`${plan.amount} kr`)
      expect(SIDO[k].under).toContain(plan.suffix)
      expect(SLUT[k].prisrad).toBe(`${prisPeriod(SALD_PLAN)}, säg upp när du vill.`)
    }
    expect(LISTA_SLUT.text).toContain(prisPeriod(SALD_PLAN))
    // Inga andra belopp än det sålda får stå i texterna.
    for (const t of TEXTER) {
      for (const m of t.matchAll(/(d+) kr/g)) expect(m[1], t).toBe(String(plan.amount))
    }
  })

  it('varje kort säljer Jobbcoach Premium (spec-rummen 17.3)', () => {
    for (const k of ['cv', 'test', 'allt'] as const) {
      expect(SIDO[k].etikett).toBe(paketNamn(SALD_PLAN))
      expect(SLUT[k].etikett).toBe(paketNamn(SALD_PLAN))
      expect(SLUT[k].href).toBe(`/register?paket=${SALD_PLAN}`)
      expect(SLUT[k].knapp).toBe('Köp Premium, 149 kr i månaden')
      expect(SLUT[k].sekundar.text).toBe('Se vad som ingår')
    }
    expect(LISTA_SLUT.etikett).toBe(paketNamn(SALD_PLAN))
    for (const v of Object.values(INLINE)) expect(v.paketrad).toContain(`Premium, ${prisPeriod(SALD_PLAN)}`)
    // Jobbcoachen-raden har kortformen, aldrig "Jobbcoach" två gånger (copy-premium krock 3).
    expect(INLINE.coach.paketrad).not.toContain('Jobbcoach Premium')
  })

  it('inga osålda paket och inga förbjudna ord (copy-premium avsnitt 2 och 7)', () => {
    for (const t of TEXTER) {
      expect(t, t).not.toMatch(/CV-paketet|Träningspaketet|Dagspasset|Hela paketet|hela paketet/)
      expect(t, t).not.toMatch(/paketen|alla tre|Byt paket|ett paket|Uppgradera|Skaffa/)
      expect(t, t).not.toMatch(/Premium-|Premiumpaket|Jobbcoachen Premium|premium[ .]/)
      expect(t, t).not.toMatch(/i veckan|kr\/mån|per månad/)
    }
  })

  it('mallantalen kommer ur konstanterna', () => {
    expect(INLINE.mallar.paketrad).toContain(`Alla ${TEMPLATE_COUNT} mallar`)
    // Sidokortets text är förklaringsraden ur PLANS (R2).
    expect(SIDO.cv.text).toBe(PLAN_BY_KEY[SALD_PLAN].beskrivning)
    expect(SLUT.cv.rader.join(' ')).toContain(`${TEMPLATE_COUNT}`)
    expect(FREE_TEMPLATE_COUNT).toBe(3)
    expect(INLINE.mallar.text.startsWith('Tre mallar')).toBe(true)
  })

  it('listraderna och gratiskortets länk enligt copy-vag5 avsnitt 1', () => {
    expect(GRATIS_KORT.sekundar.text).toBe('Se vad som ingår i Premium')
    expect(SLUT.test.rader.some((r) => r.startsWith('Dessutom'))).toBe(true)
    expect(SLUT.cv.rader.some((r) => r.startsWith('Dessutom'))).toBe(true)
    expect(SLUT.cv.rader).toContain('LinkedIn-profilen omskriven')
    expect(SLUT.test.rader[3]).toBe('Dessutom CV-analysen, alla mallar, personliga brev, jobbmatchning och Jobbcoachen')
    expect(SLUT.cv.rader).toHaveLength(5)
    // Ingen listrad börjar med "Och".
    for (const k of ['cv', 'test', 'allt'] as const) {
      for (const r of SLUT[k].rader) expect(r, r).not.toMatch(/^Och /)
    }
  })

  it('testernas gratisnivå nämner aldrig dygn eller varje dag (spec-rummen 23.3)', () => {
    for (const t of TEXTER) {
      expect(t, t).not.toMatch(/dygn|varje dag gratis|alltid gratis|Grundnivån är gratis/)
    }
    expect(SIDO.test.gratisrad).toBe('Fem frågor gratis här. Nivåkollen och första passet gratis med konto. Resten ingår i Premium.')
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
