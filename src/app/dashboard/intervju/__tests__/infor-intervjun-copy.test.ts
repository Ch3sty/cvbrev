import { describe, expect, it } from 'vitest'
import { NASTA, TOM } from '../infor-intervjun-copy'

describe('kvottext på Inför intervjun', () => {
  it('med tak och dagens prov kvar: kvotmeningen i Börja här och i den tomma listan', () => {
    expect(NASTA.forstaGangText(true, false)).toBe(`${NASTA.forstaGang.text} ${NASTA.forstaGang.kvot}`)
    expect(TOM.textFor(false)).toBe('Skriv ett svar så säger vi vad rekryteraren hör. Ett prov om dagen ingår gratis.')
  })

  it('med tak och dagens prov gjort: ingen kvotmening i Börja här', () => {
    expect(NASTA.forstaGangText(false, false)).toBe(NASTA.forstaGang.text)
  })

  it('utan tak (betalande): ingen kvotmening någonstans', () => {
    expect(NASTA.forstaGangText(true, true)).toBe(NASTA.forstaGang.text)
    expect(NASTA.forstaGangText(false, true)).toBe(NASTA.forstaGang.text)
    expect(TOM.textFor(true)).toBe('Skriv ett svar så säger vi vad rekryteraren hör.')
    expect(NASTA.forstaGangText(true, true)).not.toMatch(/prov om dagen/)
    expect(TOM.textFor(true)).not.toMatch(/prov om dagen|gratis/)
  })
})
