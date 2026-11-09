/**
 * Från artikeln till kontot (saas-leads beslut 6, 2026-11-10): kakan
 * jc_provkalla läses tåligt, källan blir 'smakprov:<slug>' eller
 * 'artikel:<slug>', och valet följer artikeln eller länkens ?mitt_test=.
 */

import { describe, expect, it } from 'vitest'
import {
  ARTIKEL_MITT_TEST,
  acquisitionFalt,
  fragaProvdatumEfterKonto,
  kallaText,
  lasKontokalla,
  lasProvkalla,
  mittTestForArtikel,
} from '../provkalla'

describe('lasProvkalla', () => {
  it('läser enkel- och dubbelkodad JSON', () => {
    const v = { slug: 'alva-labs-logiktest', mitt_test: 'alva', via: 'smakprov' }
    const enkel = encodeURIComponent(JSON.stringify(v))
    expect(lasProvkalla(enkel)).toEqual(v)
    expect(lasProvkalla(encodeURIComponent(enkel))).toEqual(v)
  })

  it('släpper ogiltiga fält och tål skräp', () => {
    expect(lasProvkalla(JSON.stringify({ slug: '../etc', mitt_test: 'okant', via: 'x' }))).toBeNull()
    expect(lasProvkalla(JSON.stringify({ slug: 'i-prov', mitt_test: 'okant' }))).toEqual({ slug: 'i-prov', via: 'artikel' })
    expect(lasProvkalla('inte json')).toBeNull()
    expect(lasProvkalla(null)).toBeNull()
    expect(lasProvkalla(encodeURIComponent('[1]'))).toBeNull()
  })
})

describe('kallaText och acquisitionFalt', () => {
  it('smakprov:<slug> via provet, artikel:<slug> via en länk, hubb utan artikel', () => {
    expect(kallaText({ slug: 'matrigma-test', via: 'smakprov' })).toBe('smakprov:matrigma-test')
    expect(kallaText({ slug: 'matrigma-test', via: 'artikel' })).toBe('artikel:matrigma-test')
    expect(kallaText({ mitt_test: 'iprov', via: 'hubb' })).toBe('hubb')
    expect(kallaText(null)).toBeNull()
  })

  it('acquisition_source får kalla, artikel och mitt_test', () => {
    expect(acquisitionFalt({ slug: 'i-prov', mitt_test: 'iprov', via: 'smakprov' })).toEqual({
      kalla: 'smakprov:i-prov',
      artikel: 'i-prov',
      mitt_test: 'iprov',
    })
    expect(acquisitionFalt(null)).toEqual({})
  })
})

describe('mittTestForArtikel', () => {
  it('länkens val går före artikelns', () => {
    expect(mittTestForArtikel('aon-cut-e-test', 'lokforare')).toBe('lokforare')
    expect(mittTestForArtikel('aon-cut-e-test', null)).toBe('aon')
    expect(mittTestForArtikel('rotation-test-guide', null)).toBeUndefined()
    expect(mittTestForArtikel('rotation-test-guide', 'hackat')).toBeUndefined()
  })

  it('artiklarna i säljgranskningen har sina val', () => {
    expect(ARTIKEL_MITT_TEST['i-prov']).toBe('iprov')
    expect(ARTIKEL_MITT_TEST['matrigma-test']).toBe('matrigma')
    expect(ARTIKEL_MITT_TEST['alva-labs-logiktest']).toBe('alva')
    expect(ARTIKEL_MITT_TEST['deduktivt-induktivt-test']).toBe('shl')
  })
})

describe('fragaProvdatumEfterKonto', () => {
  it('bara I-prov och lokförare', () => {
    expect(fragaProvdatumEfterKonto('iprov')).toBe(true)
    expect(fragaProvdatumEfterKonto('lokforare')).toBe(true)
    expect(fragaProvdatumEfterKonto('matrigma')).toBe(false)
    expect(fragaProvdatumEfterKonto(null)).toBe(false)
  })
})

describe('lasKontokalla', () => {
  it('läser källa och val, släpper okända källor', () => {
    expect(lasKontokalla(encodeURIComponent(JSON.stringify({ kalla: 'smakprov:i-prov', mitt_test: 'iprov' })))).toEqual({
      kalla: 'smakprov:i-prov',
      mitt_test: 'iprov',
    })
    expect(lasKontokalla(JSON.stringify({ kalla: '<script>' }))).toBeNull()
  })
})
