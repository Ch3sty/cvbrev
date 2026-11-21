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

describe('högsta betyg och kvoten slut (Jobbsöket omgång 2, byggspecen 4.4)', () => {
  it('rubriken och morgondagens fråga ordagrant', () => {
    expect(NASTA.lasIgen.ogonHogst).toBe('Klart för i dag')
    expect(NASTA.lasIgen.rubrikHogst('star')).toBe('Högsta betyg på frågan om ett problem du löste')
    expect(NASTA.lasIgen.rubrikHogst('beratta')).toBe('Högsta betyg på frågan om dig själv')
    expect(NASTA.lasIgen.imorgon('konflikt')).toBe('Då föreslår vi frågan om en konflikt med en kollega.')
  })

  it('ingen av texterna säger "Skriv om", och inga talstreck', () => {
    const texter = [NASTA.lasIgen.ogonHogst, NASTA.lasIgen.rubrikHogst('star'), NASTA.lasIgen.rubrikHogst('beratta'), NASTA.lasIgen.imorgon('konflikt')]
    for (const t of texter) {
      expect(t).not.toMatch(/Skriv om/i)
      expect(t).not.toMatch(/[—–]/)
    }
  })
})
