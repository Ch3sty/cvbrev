import { describe, expect, it } from 'vitest'
import JSZip from 'jszip'
import { MALLAR, getMall } from '@/lib/cv/mallar/register'
import { palett } from '@/lib/cv/mallar/farg'
import { renderBrevHtml, byggBrevDocx, brevDef, uppskattatSteg, brevMallDef } from '..'
import { brevArendeFarg, brevMatt, kontrast, textbreddMm } from '../render'
import { BREV_PUTS, brevPuts, morkTillKontrast, namnIRuta } from '../puts'
import { exempelBrev, EXEMPEL_AVSANDARE } from '../exempel'

const FEM = ['morkrum', 'kvadrat', 'panorama', 'not']

describe('putsningen av brevmallarna (2026-11-21)', () => {
  it('gäller bara de putsade mallarna (Siluett lämnades orörd)', () => {
    expect(Object.keys(BREV_PUTS).sort()).toEqual([...FEM].sort())
    for (const def of MALLAR) {
      if (FEM.includes(def.id)) continue
      expect(brevPuts(def.id), def.id).toBeUndefined()
    }
    // Ett id som råkar heta som en Object-egenskap är ingen putsning.
    expect(brevPuts('constructor')).toBeUndefined()
  })

  it('brevDef muterar aldrig CV-mallens definition', () => {
    for (const def of MALLAR) {
      const fore = JSON.stringify(def)
      const kopia = brevDef(def)
      brevDef(kopia)
      renderBrevHtml(def.id, exempelBrev('lang'))
      expect(JSON.stringify(def), def.id).toBe(fore)
      if (brevPuts(def.id)) expect(kopia).not.toBe(def)
    }
    // De delade underobjekten kopieras innan de ändras.
    const not = getMall('not')!
    expect(brevDef(not).sida).not.toBe(not.sida)
    expect(not.sida.vanster).toBe(16)
    const mk = getMall('morkrum')!
    expect(brevDef(mk).huvud.band).not.toBe(mk.huvud.band)
    expect(mk.huvud.band!.minHojd).toBe(72)
    expect(getMall('kvadrat')!.huvud.block!.storlek).toBe(56)
  })

  it('tabellen är fryst', () => {
    expect(Object.isFrozen(BREV_PUTS)).toBe(true)
    expect(Object.isFrozen(BREV_PUTS.not.sida)).toBe(true)
  })

  it('måtten: Not 40 mm marginaler och 11 pt, Panorama 11 pt, Kvadrat ruta 32 mm, Mörkrum band 40 mm', () => {
    const not = brevMallDef('not')
    expect(textbreddMm(brevDef(not))).toBe(130)
    expect(brevMatt(brevDef(not), 0).grad).toBe(11)
    expect(brevMatt(brevDef(brevMallDef('panorama')), 0).grad).toBe(11)
    expect(brevDef(brevMallDef('kvadrat')).huvud.block!.storlek).toBe(32)
    expect(brevDef(brevMallDef('morkrum')).huvud.band!.minHojd).toBe(40)
  })

  it('steg 3 tar putsningens grad som utgångspunkt (Not, Panorama 11 pt: 9,5 pt i steg 3)', () => {
    expect(brevMatt(brevDef(brevMallDef('not')), 3)).toEqual({ grad: 9.5, rad: 1.3, luft: 2 })
    expect(brevMatt(brevDef(brevMallDef('panorama')), 3).grad).toBe(9.5)
  })

  it('ärenderaden i Mörkrum och Panorama: mallens accent med minst 4,5 i kontrast mot papperet', () => {
    for (const id of ['morkrum', 'panorama']) {
      const def = brevDef(brevMallDef(id))
      for (let i = 0; i < def.accenter.length; i++) {
        const p = palett(def, { farg: i })
        const farg = brevArendeFarg(def, p)
        expect(kontrast(farg, def.farger.sida ?? '#ffffff'), `${id} ${i}`).toBeGreaterThanOrEqual(4.5)
        expect(farg.toLowerCase(), `${id} ${i}`).not.toBe(def.farger.text.toLowerCase())
      }
      const html = renderBrevHtml(id, exempelBrev('kort'))
      const farg = brevArendeFarg(def, palett(def, {}))
      expect(html).toContain(`color:${farg};break-after:avoid`)
    }
    // Panoramas plommon räcker som den är, Mörkrums orange mörkas.
    expect(brevArendeFarg(brevDef(brevMallDef('panorama')), palett(brevMallDef('panorama'), {})).toLowerCase()).toBe('#8c2f39')
    expect(brevArendeFarg(brevDef(brevMallDef('morkrum')), palett(brevMallDef('morkrum'), {})).toLowerCase()).not.toBe('#e8b07a')
  })

  it('morkTillKontrast lämnar en färg som redan räcker', () => {
    expect(morkTillKontrast('#1A4D6E', '#ffffff')).toBe('#1A4D6E')
    expect(kontrast(morkTillKontrast('#E8B07A', '#ffffff'), '#ffffff')).toBeGreaterThanOrEqual(4.5)
  })

  it('Kvadrat: namnet på två rader i rutan, också ett långt namn', () => {
    const block = BREV_PUTS.kvadrat.block!
    expect(namnIRuta('Erik Lindberg', block).rader).toEqual(['Erik', 'Lindberg'])
    expect(namnIRuta('Erik Lindberg', block).pt).toBe(14)
    expect(renderBrevHtml('kvadrat', exempelBrev('kort'))).not.toContain('.huvud-block .titel{font-size')
    const langt = namnIRuta('Anna-Karin Bergströmsson-Lind', block)
    expect(langt.rader).toEqual(['Anna-Karin', 'Bergströmsson-Lind'])
    expect(langt.pt).toBe(block.minNamnPt)
    const html = renderBrevHtml('kvadrat', exempelBrev('kort', { ...EXEMPEL_AVSANDARE, namn: 'Anna-Karin Bergströmsson-Lind' }))
    expect(html).toContain('<h1 class="namn" data-falt="namn"><span class="namnrad">Anna-Karin</span> <span class="namnrad">Bergströmsson-Lind</span></h1>')
    expect(html).toContain('aspect-ratio:1/1')
    // Titeln (13 pt) sänks till namnets grad när namnet blir mindre.
    expect(html).toContain(`.huvud-block .titel{font-size:${block.minNamnPt}pt}`)
  })

  it('Word (Not): marginalerna 40 mm och 11 pt i det korta brevet', async () => {
    const zip = await JSZip.loadAsync(await byggBrevDocx('not', exempelBrev('kort')))
    const xml = await zip.file('word/document.xml')!.async('string')
    expect(xml).toMatch(/<w:pgMar[^>]*w:right="2268"[^>]*w:left="2268"/)
    expect(xml).toContain('<w:sz w:val="22"/>')
    // Uppskattningen väljer samma steg som HTML:en mäter (steg 1 för det långa brevet).
    expect(uppskattatSteg(brevMallDef('not'), exempelBrev('lang'))).toBe(1)
    // Ett bredare typsnitt räknas som förut (0,5 em), aldrig smalare.
    expect(uppskattatSteg(brevMallDef('not'), exempelBrev('lang'), { typsnitt: 'arial' })).toBe(2)
  })
})
