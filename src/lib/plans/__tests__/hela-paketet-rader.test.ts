/**
 * Premiumlistan (beslut-agarpunkter M1, 2026-11-22). Listan läses av /priser
 * (Product-schemat), startsidan, /funktioner, artiklarnas listslutkort och
 * kvotväggsmejlet. Den ska vara sex rader och inte säga det som inte stämmer.
 */
import { describe, expect, it } from 'vitest'

import { HELA_PAKETET_RADER } from '../plans'
import { JOB_MATCHES_PER_RUN } from '@/lib/jobmatching/freeLimit'

describe('HELA_PAKETET_RADER', () => {
  it('är sex rader i beslutets ordning', () => {
    expect(HELA_PAKETET_RADER).toEqual([
      'Alla nivåer i de åtta testtyperna, övningsprov mot klockan och det fördjupade personlighetstestet',
      'Alla CV-mallar, CV-analysens alla förslag, personliga brev och LinkedIn',
      `Jobbmatchning, de ${JOB_MATCHES_PER_RUN} bästa träffarna med skälen`,
      'Uppföljningsmejl till dina sökta tjänster och rapporten till Arbetsförmedlingen, att skriva ut eller kopiera',
      'Jobbcoachen, fråga så mycket du vill',
      'Intervjuprovet utan dagsgräns och hela din testhistorik',
    ])
  })

  it('säger inte tre nivåer, hela CV-analysen eller fynd', () => {
    const allt = HELA_PAKETET_RADER.join(' ')
    expect(allt).not.toMatch(/tre nivåer/)
    expect(allt).not.toMatch(/hela CV-analysen/)
    expect(allt).not.toMatch(/fynd/)
  })
})
