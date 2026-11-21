import { describe, expect, it } from 'vitest'
import JSZip from 'jszip'
import { MALLAR } from '@/lib/cv/mallar/register'
import { MALL_KATALOG } from '@/lib/cv/mallar/katalog'
import { renderBrevHtml, byggBrevDocx, brevOrd, brevMallKatalog, uppskattatSteg, brevMallDef } from '..'
import { exempelBrev, EXEMPEL_KRAV } from '../exempel'
import { formateraDatum, halsningsRad, hittaCitat, hittaMarkeringar, brevSomText } from '../text'
import type { BrevData } from '../typer'

const brev = exempelBrev('normal')

describe('renderBrevHtml', () => {
  it('ritar alla 40 mallar utan fel, med huvud, stycken och avslut', () => {
    expect(MALLAR.length).toBe(40)
    for (const def of MALLAR) {
      const html = renderBrevHtml(def.id, brev)
      expect(html, def.id).toContain('<!DOCTYPE html>')
      expect(html, def.id).toContain(`data-mall="${def.id}"`)
      expect(html, def.id).toContain('Erik Lindberg')
      expect(html, def.id).toContain('Ansökan: IT-projektledare till kundplattformen')
      expect(html, def.id).toContain('Med vänlig hälsning')
      expect((html.match(/data-stycke="/g) ?? []).length, def.id).toBe(brev.stycken.length)
      // Brev har inget foto.
      expect(html, def.id).not.toMatch(/class="foto/)
      // Kontakten står någonstans: i huvudet, i spalten eller i sockeln.
      expect(html, def.id).toContain('070-123 45 67')
    }
  })

  it('okänt mall-id ger Linne, gamla id löses med alias', () => {
    expect(renderBrevHtml('finns-inte', brev)).toContain('data-mall="linne"')
    expect(brevMallDef(null).id).toBe('linne')
  })

  it('escapar texten', () => {
    const html = renderBrevHtml('linne', { ...brev, stycken: ['<script>alert(1)</script> & mer'] })
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt; &amp; mer')
    expect(html).not.toContain('<script>alert(1)')
  })

  it('märker citaten med data-krav i rätt stycke och hoppar över krav utan citat', () => {
    const html = renderBrevHtml('linne', brev, {}, { markeringar: EXEMPEL_KRAV })
    expect((html.match(/<mark data-krav="/g) ?? []).length).toBe(6)
    expect(html).toContain('<mark data-krav="1">På Nordea ledde jag införandet av en ny mobilbanksplattform för 1,2 miljoner kunder</mark>')
    expect(html).toContain('<mark data-krav="4">Jag har infört agilt arbetssätt</mark>')
    expect(html).not.toContain('data-krav="7"')
    // Krav 6 står i tredje stycket.
    const tredje = html.split('data-stycke="2"')[1].split('</p>')[0]
    expect(tredje).toContain('data-krav="6"')
  })

  it('aktivt stycke och skrivläget', () => {
    expect(renderBrevHtml('linne', brev, {}, { aktivtStycke: 1 })).toContain('data-stycke="1" data-aktivt=""')
    const skriver = renderBrevHtml('koppar', brev, {}, { skriverTill: 2 })
    expect((skriver.match(/data-stycke="/g) ?? []).length).toBe(2)
    expect(skriver).toContain('class="brev-markor"')
    expect(skriver).not.toContain('Med vänlig hälsning')
  })

  it('engelska rader och datum', () => {
    const en: BrevData = { ...brev, sprak: 'en', halsning: null }
    const html = renderBrevHtml('kalksten', en)
    expect(html).toContain('<html lang="en"')
    expect(html).toContain('Application: IT-projektledare till kundplattformen')
    expect(html).toContain('Kind regards')
    expect(html).toContain('Stockholm, 21 November 2026')
    expect(html).toContain('Dear Maria Ekström,')
    expect(html).toContain('>Contact<')
  })

  it('valt typsnitt ersätter brödtextens, en tvingad krympning sätts', () => {
    const html = renderBrevHtml('linne', brev, { typsnitt: 'georgia' }, { steg: 2 })
    expect(html).toMatch(/--typsnitt:Georgia/)
    expect(html).toContain('data-steg="2"')
    expect(html).toContain('data-last=""')
  })

  it('accenten väljs bland mallens fyra', () => {
    const def = brevMallDef('koppar')
    const html = renderBrevHtml('koppar', brev, { accent: def.accenter[1] })
    expect(html).toContain(`--accent:${def.accenter[1]}`)
  })
})

describe('texten', () => {
  it('räknar brödtextens ord', () => {
    expect(brevOrd(brev)).toBe(150)
    expect(brevOrd({ ...brev, stycken: ['Tre ord här.', '', '1,2 miljoner'] })).toBe(5)
  })
  it('formaterar datum efter språk', () => {
    expect(formateraDatum('2026-11-21', 'sv')).toBe('21 november 2026')
    expect(formateraDatum('2026-01-05', 'en')).toBe('5 January 2026')
    expect(formateraDatum('nonsens', 'sv')).toBe('')
  })
  it('hälsningens förval', () => {
    expect(halsningsRad({ ...brev, halsning: null })).toBe('Hej Maria,')
    expect(halsningsRad({ ...brev, halsning: null, mottagare: { foretag: 'X' } })).toBe('Hej,')
    expect(halsningsRad({ ...brev, sprak: 'en', halsning: null, mottagare: { foretag: 'X' } })).toBe('Dear Hiring Manager,')
  })
  it('hittar citat med andra blanksteg och skiftläge, och överlapp hoppas över', () => {
    expect(hittaCitat('Ett  långt\nstycke här', 'långt stycke')).toEqual({ fran: 5, till: 17 })
    expect(hittaCitat('Ett långt stycke', 'LÅNGT')).not.toBeNull()
    const t = hittaMarkeringar(['abc def ghi'], [
      { krav: 'a', citat: 'abc def' },
      { krav: 'b', citat: 'def ghi' },
    ])
    expect(t).toHaveLength(1)
    expect(t[0].nr).toBe(1)
  })
  it('ren text för Kopiera text', () => {
    const text = brevSomText(brev)
    expect(text.startsWith('Hej Maria,\n\nNär ni skriver')).toBe(true)
    expect(text.endsWith('Med vänlig hälsning\nErik Lindberg')).toBe(true)
  })
  it('långt brev krymper i uppskattningen, kort gör det inte', () => {
    expect(uppskattatSteg(brevMallDef('linne'), exempelBrev('kort'))).toBe(0)
    expect(uppskattatSteg(brevMallDef('kalksten'), exempelBrev('lang'))).toBeGreaterThan(0)
  })
})

describe('katalogen', () => {
  it('samma ordning som CV-katalogen, gratismallarna först, inga fotokort', () => {
    const k = brevMallKatalog()
    expect(k.map((m) => m.id)).toEqual(MALL_KATALOG.map((m) => m.id))
    expect(k.slice(0, 2).map((m) => m.niva)).toEqual(['gratis', 'gratis'])
    expect(k.find((m) => m.id === 'koppar')!.kort).toBe('Färgat huvud')
  })
})

describe('byggBrevDocx', () => {
  const wordMallar = MALLAR.filter((m) => m.word)

  it('bygger ett dokument för alla Word-mallar', async () => {
    expect(wordMallar.length).toBeGreaterThan(20)
    for (const def of wordMallar) {
      const buf = await byggBrevDocx(def.id, brev)
      const zip = await JSZip.loadAsync(buf)
      const xml = await zip.file('word/document.xml')!.async('string')
      expect(xml, def.id).toContain('Erik Lindberg')
      expect(xml, def.id).toContain('Ansökan: IT-projektledare till kundplattformen')
      expect(xml, def.id).toContain('Jag berättar gärna mer')
      expect(xml, def.id).toContain('Med vänlig hälsning')
      expect(xml, def.id).toContain('erik.lindberg@exempel.se')
    }
  }, 60_000)

  it('engelska och kastar för mallar utan Word', async () => {
    const zip = await JSZip.loadAsync(await byggBrevDocx('linne', { ...brev, sprak: 'en', halsning: null }))
    const xml = await zip.file('word/document.xml')!.async('string')
    expect(xml).toContain('Kind regards')
    expect(xml).toContain('Application:')
    await expect(byggBrevDocx('morkrum', brev)).rejects.toThrow(/Word/)
  })
})

describe('scopaBrevHtml', () => {
  it('lägger alla regler under behållaren, också i @media, och tar bort skript och @page', async () => {
    const { scopaBrevHtml, scopaCss } = await import('../scopa')
    const { css, kropp } = scopaBrevHtml(renderBrevHtml('koppar', brev), 'brevark-x')
    expect(kropp).not.toContain('<script')
    expect(kropp).toContain('class="cv brev')
    expect(css).not.toMatch(/@page/)
    expect(css).toContain('.brevark-x .huvud-band')
    expect(css).not.toMatch(/(^|\})\s*\.huvud\{/)
    expect(scopaCss(':root{--a:1}html,body{margin:0}@media screen{.x{color:red}}@media print{.y{color:blue}}@font-face{font-family:A}', '.s')).toBe(
      '.s{--a:1}\n.s,.s{margin:0}\n@media screen{.s .x{color:red}}\n@font-face{font-family:A}'
    )
  })
})
