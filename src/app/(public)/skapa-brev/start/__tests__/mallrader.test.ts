/**
 * F2 i klicktestet på live 2026-11-22: startflödet sade "Gratis, även som
 * Word" om Björk på samma skärm som "Nedladdning som PDF och Word ingår i
 * Premium". Raderna här säger en sak: mallen är gratis att använda,
 * nedladdningen ingår i Premium.
 */
import { describe, it, expect } from 'vitest'
import { startMallRad, startValjareRad } from '../mallrader'
import { mallarKatalog } from '@/components/brev3/mallar/filter'
import { BREV_GRATIS_NAMN, BREV_PREMIUM_ANTAL } from '@/components/publikt/brevmallar'
import { paketKort } from '@/lib/plans/plans'

const PREMIUM = paketKort()

describe('startflödets mallrader', () => {
  it('gratismallarna är gratis att skriva i, och nedladdningen ingår i Premium', () => {
    expect(startMallRad(true, true, PREMIUM)).toBe(`Gratis att skriva och spara brevet i. Nedladdning som PDF och Word ingår i ${PREMIUM}.`)
    expect(startMallRad(true, false, PREMIUM)).toBe(`Gratis att skriva och spara brevet i. Nedladdning ingår i ${PREMIUM}.`)
  })

  it('ingen rad i katalogen säger att en nedladdning är gratis', () => {
    for (const k of mallarKatalog()) {
      const rad = startMallRad(k.niva === 'gratis', k.word, PREMIUM)
      expect(rad).not.toMatch(/gratis, även som Word/i)
      expect(rad).not.toMatch(/Den är gratis/)
      if (k.niva === 'gratis') expect(rad).toContain(`ingår i ${PREMIUM}`)
      else expect(rad.startsWith('Ingår i')).toBe(true)
    }
  })

  it('väljarens rad säger att nedladdningen ingår i Premium i alla mallar', () => {
    const rad = startValjareRad(BREV_GRATIS_NAMN, BREV_PREMIUM_ANTAL, PREMIUM)
    expect(rad).toBe(
      `${BREV_GRATIS_NAMN} är gratis att skriva och spara brev i. De övriga ${BREV_PREMIUM_ANTAL} ingår i ${PREMIUM}, och du provar dem med ditt eget brev. Nedladdningen ingår i ${PREMIUM} i alla mallar.`
    )
  })
})
