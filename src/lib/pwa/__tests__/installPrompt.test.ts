import { describe, expect, it } from 'vitest'
import {
  AVFARDAD_DAGAR,
  farVisas,
  hittaHinder,
  type Omstandigheter,
} from '../installPrompt'

/**
 * Reglerna för när frågan om hemskärmen får visas (docs/plan-pwa.md,
 * avsnitt 3). Motorn är en ren funktion utan DOM och utan klocka, så
 * varje fall kan skrivas som exakt de omständigheter det handlar om.
 */

const DYGN = 24 * 60 * 60 * 1000
const NU = Date.UTC(2026, 8, 14, 12, 0, 0)

/** Grundfallet: allt som ska säga ja säger ja. */
function omstandigheter(over: Partial<Omstandigheter> = {}): Omstandigheter {
  return {
    standalone: false,
    redanKlar: false,
    // En tidigare session, en vecka gammal.
    forstaSessionVid: NU - 7 * DYGN,
    avfardadVid: null,
    nu: NU,
    // Sidan laddades för en minut sedan, alltså långt efter stämpeln.
    sidladdningVid: NU - 60 * 1000,
    visasRedan: false,
    cookiebannerUppe: false,
    ...over,
  }
}

describe('regelmotorn för frågan om hemskärmen', () => {
  it('säger ja när enheten har en tidigare session och inget avfärdande', () => {
    expect(hittaHinder(omstandigheter())).toBeNull()
    expect(farVisas(omstandigheter())).toBe(true)
  })

  describe('första besöket', () => {
    it('säger nej när enheten aldrig setts förut', () => {
      expect(hittaHinder(omstandigheter({ forstaSessionVid: null }))).toBe(
        'forsta_besoket'
      )
    })

    it('säger nej när stämpeln sattes under den här sidladdningen', () => {
      // PwaRegister stämplar sessionen vid mount. Utan den här regeln hade
      // stämpeln vi just satt godkänt frågan redan vid första besöket.
      expect(
        hittaHinder(
          omstandigheter({
            sidladdningVid: NU - 60 * 1000,
            forstaSessionVid: NU - 59 * 1000,
          })
        )
      ).toBe('forsta_besoket')
    })

    it('säger nej även när användaren suttit länge på sidan', () => {
      // Ett brev tar en minut att skriva. Stämpeln ser då gammal ut mätt mot
      // nu, men den sattes fortfarande under den här sidladdningen.
      expect(
        hittaHinder(
          omstandigheter({
            nu: NU,
            sidladdningVid: NU - 10 * 60 * 1000,
            forstaSessionVid: NU - 10 * 60 * 1000 + 50,
          })
        )
      ).toBe('forsta_besoket')
    })

    it('säger ja när stämpeln är äldre än sidladdningen', () => {
      expect(
        hittaHinder(
          omstandigheter({
            sidladdningVid: NU - 60 * 1000,
            forstaSessionVid: NU - 61 * 1000,
          })
        )
      ).toBeNull()
    })
  })

  describe(`avfärdad fråga vilar ${AVFARDAD_DAGAR} dagar`, () => {
    it('säger nej dagen efter ett avfärdande', () => {
      expect(hittaHinder(omstandigheter({ avfardadVid: NU - 1 * DYGN }))).toBe(
        'nyligen_avfardad'
      )
    })

    it('säger nej dagen innan de 30 dagarna gått ut', () => {
      expect(hittaHinder(omstandigheter({ avfardadVid: NU - 29 * DYGN }))).toBe(
        'nyligen_avfardad'
      )
    })

    it('säger ja när 30 dagar har gått', () => {
      // Exakt 30 dygn räknas som passerat: gränsen är "mindre än", inte
      // "högst".
      expect(
        hittaHinder(omstandigheter({ avfardadVid: NU - AVFARDAD_DAGAR * DYGN }))
      ).toBeNull()
    })

    it('säger ja långt efteråt', () => {
      expect(hittaHinder(omstandigheter({ avfardadVid: NU - 400 * DYGN }))).toBeNull()
    })
  })

  describe('standalone', () => {
    it('säger nej när appen redan körs installerad', () => {
      expect(hittaHinder(omstandigheter({ standalone: true }))).toBe('standalone')
    })

    it('väger tyngre än ett gammalt avfärdande', () => {
      // En installerad app som en gång avfärdade frågan ska rapporteras som
      // installerad, inte som avfärdad.
      expect(
        hittaHinder(
          omstandigheter({ standalone: true, avfardadVid: NU - 1 * DYGN })
        )
      ).toBe('standalone')
    })

    it('säger nej även på det allra första besöket', () => {
      expect(
        hittaHinder(omstandigheter({ standalone: true, forstaSessionVid: null }))
      ).toBe('standalone')
    })
  })

  describe('accepterad fråga', () => {
    it('säger nej för alltid', () => {
      expect(hittaHinder(omstandigheter({ redanKlar: true }))).toBe('redan_klar')
    })

    it('säger nej även efter att 30 dagar gått', () => {
      expect(
        hittaHinder(
          omstandigheter({ redanKlar: true, avfardadVid: NU - 400 * DYGN })
        )
      ).toBe('redan_klar')
    })
  })

  describe('cookie-bannern', () => {
    it('säger nej så länge samtycket inte är lämnat', () => {
      // Bannern ligger på z-index 999 över hela nederkanten. Vår rad hade
      // hamnat under den och aldrig gått att trycka på.
      expect(hittaHinder(omstandigheter({ cookiebannerUppe: true }))).toBe('cookiebanner')
    })

    it('väger lättare än ett avfärdande', () => {
      // Hindret ska rapporteras som det varaktiga, inte som det tillfälliga.
      expect(
        hittaHinder(
          omstandigheter({ cookiebannerUppe: true, avfardadVid: NU - 1 * DYGN })
        )
      ).toBe('nyligen_avfardad')
    })
  })

  it('säger nej när raden redan står på skärmen', () => {
    // Två triggers i samma session ska inte kunna öppna raden två gånger,
    // och inte heller skicka pwa_prompt_shown två gånger.
    expect(hittaHinder(omstandigheter({ visasRedan: true }))).toBe('visas_redan')
  })
})
