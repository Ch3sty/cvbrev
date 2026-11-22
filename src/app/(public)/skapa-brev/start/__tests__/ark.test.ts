/**
 * Arket i startflödet (publikt omgång 3): brevmotorn ritar besökarens brev i
 * den valda mallen, med platshållare, fälten och tomma streck i stället för
 * text. Och spärrens rad om mallen.
 */
import { describe, expect, it } from 'vitest'
import { arkMall, ritaStartArk, startArkData } from '../ark'
import { sparrMallRad } from '../StartFlow'

const DATUM = '2026-11-22'

describe('ritaStartArk', () => {
  it('startläget: mallen, tjänsten och arbetsgivaren, tre stycken streck och inga markörer', () => {
    const { mall, html } = ritaStartArk({ mall: 'koppar', tjanst: 'Projektledare', foretag: 'Nordhaga Bygg', datum: DATUM })
    expect(mall).toBe('koppar')
    expect(html).toContain('Ansökan: Projektledare')
    expect(html).toContain('Nordhaga Bygg')
    expect(html).toContain('Ditt namn')
    expect((html.match(/class="sb-streck"/g) ?? []).length).toBe(3)
    expect(html).not.toContain('SBSTRECKMARKOR')
  })

  it('efter utkastet: första stycket, sedan två stycken streck', () => {
    const { html } = ritaStartArk({ mall: 'linne', tjanst: 'Projektledare', foretag: 'Nordhaga Bygg', stycke: 'När ni söker en projektledare <b>känner</b> jag igen mig.', datum: DATUM })
    expect(html).toContain('När ni söker en projektledare')
    // Texten escapas av motorn, ingen HTML från besökaren.
    expect(html).not.toContain('<b>känner</b>')
    expect((html.match(/class="sb-streck"/g) ?? []).length).toBe(2)
  })

  it('okänd mall och tomma fält: Linne och platshållarna', () => {
    expect(arkMall('finns-inte')).toBe('linne')
    expect(arkMall(undefined)).toBe('linne')
    const d = startArkData({ datum: DATUM })
    expect(d.mottagare.foretag).toBe('Arbetsgivaren')
    expect(d.tjanst).toBe('tjänsten du söker')
  })

  it('fälten kapas', () => {
    const d = startArkData({ tjanst: 'x'.repeat(500), datum: DATUM })
    expect(d.tjanst).toHaveLength(160)
  })
})

describe('sparrMallRad', () => {
  it('Premiummall öppnas, gratismall sparas', () => {
    expect(sparrMallRad({ namn: 'Koppar', gratis: false }, true)).toBe('Brevet öppnas i Koppar, mallen du valde')
    expect(sparrMallRad({ namn: 'Björk', gratis: true }, true)).toBe('Brevet sparas i Björk, mallen du valde')
    expect(sparrMallRad({ namn: 'Linne', gratis: true }, false)).toBe('Brevet sparas i Linne')
  })
})
