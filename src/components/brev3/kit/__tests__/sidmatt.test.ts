import { describe, expect, it } from 'vitest'
import { matBrevAndel, synligtArk, visaTvaSidor } from '../sidmatt'

const MM = 96 / 25.4

/** Ett ritat ark: arkets ruta, dess egen bredd (offsetWidth) och var .brev-slut står. */
function ark({ top = 100, bredd = 400, egenBredd = 793.7, slutTop, grans }: { top?: number; bredd?: number; egenBredd?: number; slutTop?: number; grans?: string }) {
  const el = document.createElement('div')
  el.className = 'cv brev'
  if (grans !== undefined) el.setAttribute('data-grans', grans)
  el.getBoundingClientRect = () => ({ top, left: 0, width: bredd, height: bredd * 1.414, right: bredd, bottom: top + bredd * 1.414, x: 0, y: top, toJSON: () => ({}) })
  Object.defineProperty(el, 'offsetWidth', { value: egenBredd })
  if (slutTop !== undefined) {
    const slut = document.createElement('span')
    slut.className = 'brev-slut'
    slut.getBoundingClientRect = () => ({ top: slutTop, left: 0, width: 0, height: 0, right: 0, bottom: slutTop, x: 0, y: slutTop, toJSON: () => ({}) })
    el.appendChild(slut)
  }
  return el
}

describe('mätningen på det ritade arket', () => {
  it('räknar andelen mot data-grans i arkets skala', () => {
    const skala = 400 / 793.7
    const gransPx = 260 * MM * skala
    expect(matBrevAndel(ark({ grans: '260', slutTop: 100 + gransPx / 2 }))).toBeCloseTo(0.5, 5)
    expect(matBrevAndel(ark({ grans: '260', slutTop: 100 + gransPx * 1.1 }))).toBeCloseTo(1.1, 5)
  })

  it('utan data-grans gäller 279 mm, som Brevet', () => {
    const gransPx = 279 * MM * (400 / 793.7)
    expect(matBrevAndel(ark({ slutTop: 100 + gransPx }))).toBeCloseTo(1, 5)
  })

  it('skalan spelar ingen roll: samma brev i full storlek ger samma andel', () => {
    const fullt = 260 * MM
    expect(matBrevAndel(ark({ grans: '260', bredd: 793.7, slutTop: 100 + fullt * 0.8 }))).toBeCloseTo(0.8, 5)
  })

  it('utan .brev-slut finns inget att mäta', () => {
    expect(matBrevAndel(ark({ grans: '260' }))).toBeNull()
  })

  it('synligtArk tar första arket med bredd', () => {
    const rot = document.createElement('div')
    const dolt = ark({ bredd: 0 })
    const synligt = ark({})
    rot.append(dolt, synligt)
    expect(synligtArk(rot)).toBe(synligt)
    expect(synligtArk(document.createElement('div'))).toBeNull()
  })
})

describe('när raden om två sidor visas i Mallar', () => {
  const html = '<div>Björk, Lora</div>'

  it('eget brev som går över sidan i arket som visas: raden syns', () => {
    expect(visaTvaSidor({ egetBrev: true, html, matt: { html, andel: 1.02 } })).toBe(true)
  })

  it('ryms på en sida, eller precis på gränsen: ingen rad', () => {
    expect(visaTvaSidor({ egetBrev: true, html, matt: { html, andel: 0.95 } })).toBe(false)
    expect(visaTvaSidor({ egetBrev: true, html, matt: { html, andel: 1 } })).toBe(false)
  })

  it('aldrig på exempelbrevet', () => {
    expect(visaTvaSidor({ egetBrev: false, html, matt: { html, andel: 1.4 } })).toBe(false)
  })

  it('mallen eller typsnittet bytt: det gamla värdet visas inte medan nytt ark laddas eller mäts', () => {
    const gammal = { html: '<div>Linne</div>', andel: 1.3 }
    expect(visaTvaSidor({ egetBrev: true, html: null, matt: gammal })).toBe(false)
    expect(visaTvaSidor({ egetBrev: true, html, matt: gammal })).toBe(false)
    expect(visaTvaSidor({ egetBrev: true, html, matt: null })).toBe(false)
  })
})
