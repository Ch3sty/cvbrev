/**
 * Rutten som ritar brevet i mallvisaren (byggspecen våg 2, avsnitt 2): valet
 * av mall och brev, aliasen för de gamla mall-id:na, 404 för okänt, det
 * låsta täthetssteget, och alla 89 exempelbrev i de fem mallarna.
 *
 * Att varje brev ryms på en sida mäts i webbläsaren (QA-skriptet för de 445
 * ritningarna); här kontrolleras att varje ritning har låst steg och att
 * hela brevet står i HTML.
 *
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'
import { exampleData } from '@/app/(public)/personligt-brev-exempel/[yrke]/exempel-data'
import { ARTIKEL_BREV, ARTIKEL_BREV_NYCKLAR } from '@/components/mdx/personligt-brev-preview-data'
import { VISARE_MALL_IDS, brevDataFranFalt } from '@/components/publikt/brevvisare/visare-data'
import { avslutsRad } from '@/lib/letters/brevmall/text'
import { GAMLA_MALL_IDS, lastSteg, ritaArk, svaraBrev, valdMall, valtBrev } from '../rita'
import { GET } from '../route'

const DATUM = '2026-11-21'
const q = (s: string) => new URLSearchParams(s)

describe('valet av mall', () => {
  it('de fem mallarna, ingen parameter ger Linne', () => {
    for (const id of VISARE_MALL_IDS) expect(valdMall(id)).toBe(id)
    expect(valdMall(null)).toBe('linne')
    expect(valdMall('')).toBe('linne')
  })

  it('de sex gamla mall-id:na, Kalksten och Granit svarar med Linne, inte 404', () => {
    expect([...GAMLA_MALL_IDS]).toEqual(['classic', 'sidebar', 'minimal', 'compact', 'centered', 'twocolumn', 'kalksten', 'granit'])
    expect(valdMall('ritning')).toBe('ritning')
    expect(valdMall('terrakotta')).toBe('terrakotta')
    for (const id of GAMLA_MALL_IDS) expect(valdMall(id)).toBe('linne')
    for (const id of GAMLA_MALL_IDS) expect(svaraBrev(q(`mall=${id}&typsnitt=calibri`), DATUM).status).toBe(200)
  })

  it('okänd mall ger null och 404, också katalogens övriga mallar', () => {
    expect(valdMall('okand')).toBeNull()
    expect(valdMall('fasad')).toBeNull()
    expect(svaraBrev(q('mall=okand'), DATUM)).toEqual({ status: 404, fel: 'Okänd mall' })
  })
})

describe('valet av brev', () => {
  it('slug ger exempelsidans brev för yrket', () => {
    const d = valtBrev(q('slug=projektledare'), DATUM)!
    expect(d.avsandare.namn).toBe(exampleData.projektledare.exempelBrev.namn)
    expect(d.mottagare.foretag).toBe('TechFlow Sweden AB')
    expect(d.avsandare.ort).toBe('Stockholm')
  })

  it('nyckel ger artikelns eget brev, inte exempelsidans', () => {
    const d = valtBrev(q('nyckel=underskoterska'), DATUM)!
    expect(d.avsandare.namn).toBe('Lisa Andersson')
    expect(d.tjanst).toBe('Undersköterska inom geriatrik')
    expect(d).toEqual(brevDataFranFalt(ARTIKEL_BREV.underskoterska, DATUM))
    // Säljarens brev skiljer sig från exempelsidans: det är artikelns brev som ritas.
    expect(valtBrev(q('nyckel=saljare'), DATUM)!.stycken).not.toEqual(valtBrev(q('slug=saljare'), DATUM)!.stycken)
  })

  it('ingen parameter ger motorns exempelbrev (Erik Lindberg)', () => {
    expect(valtBrev(q(''), DATUM)!.avsandare.namn).toBe('Erik Lindberg')
    expect(valtBrev(q('mall=koppar'), DATUM)!.mottagare.foretag).toBe('Nordanvind Energi')
  })

  it('okänd slug eller nyckel ger 404', () => {
    expect(svaraBrev(q('slug=finns-inte'), DATUM)).toEqual({ status: 404, fel: 'Okänt brev' })
    expect(svaraBrev(q('slug=constructor'), DATUM).status).toBe(404)
    expect(svaraBrev(q('slug=__proto__'), DATUM).status).toBe(404)
    expect(svaraBrev(q('nyckel=lakare'), DATUM)).toEqual({ status: 404, fel: 'Okänt brev' })
  })
})

describe('arket', () => {
  it('låst steg (data-last) med uppskattat steg, och skalskriptet sist', () => {
    const d = valtBrev(q('slug=projektledare'), DATUM)!
    for (const mall of VISARE_MALL_IDS) {
      const html = ritaArk(mall, d)
      expect(html).toContain(`data-mall="${mall}"`)
      expect(html).toContain(`data-steg="${lastSteg(mall, d)}"`)
      expect(html).toContain('data-last=""')
      expect(html).toMatch(/zoom=String\(z\)[^]*<\/script><\/body>/)
      // Utan JavaScript: trappan av mediafrågor i head skalar arket.
      expect(html).toContain('<noscript><style>@media (min-width:160px){html{zoom:0.2015}}')
      expect(html).toContain('@media (min-width:272px){html{zoom:0.3426}}')
      expect(html).toMatch(/<\/style><\/noscript><\/head>/)
    }
  })

  it('arket har motorns avslut, samma som "Läs brevet som text"', () => {
    const html = ritaArk('linne', valtBrev(q('nyckel=saljare'), DATUM)!)
    expect(html).toContain(`<div class="brev-avslut"><p>${avslutsRad('sv')}</p>`)
    expect(html).not.toContain('Varma hälsningar')
  })

  it('alla 89 exempelbrev och artiklarnas sex i de fem mallarna: 200, låst steg, första och sista stycket i HTML', () => {
    const slugs = Object.keys(exampleData)
    expect(slugs).toHaveLength(89)
    let ritningar = 0
    const kollen = (param: string) => {
      const d = valtBrev(q(param), DATUM)!
      expect(d, param).not.toBeNull()
      const forsta = d.stycken[0].slice(0, 40).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      const sista = d.stycken[d.stycken.length - 1].slice(-30).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      for (const mall of VISARE_MALL_IDS) {
        const svar = svaraBrev(q(`mall=${mall}&${param}`), DATUM)
        expect(svar.status, `${param} ${mall}`).toBe(200)
        if (svar.status !== 200) continue
        expect(svar.html).toContain('data-last=""')
        expect(svar.html.replace(/&#39;/g, "'").replace(/&quot;/g, '"')).toContain(forsta.replace(/&#39;/g, "'"))
        expect(svar.html.replace(/&#39;/g, "'").replace(/&quot;/g, '"')).toContain(sista.replace(/&#39;/g, "'"))
        ritningar++
      }
    }
    for (const s of slugs) kollen(`slug=${s}`)
    for (const n of ARTIKEL_BREV_NYCKLAR) kollen(`nyckel=${n}`)
    expect(ritningar).toBe(89 * 5 + 6 * 5)
  })
})

describe('svaret', () => {
  it('noindex och CDN-cachen står kvar, 404 också noindex', async () => {
    const ok = await GET(new Request('http://localhost/api/public/exempel/brev?mall=koppar&slug=projektledare'))
    expect(ok.status).toBe(200)
    expect(ok.headers.get('X-Robots-Tag')).toBe('noindex')
    expect(ok.headers.get('Cache-Control')).toContain('s-maxage=86400')
    expect(ok.headers.get('Content-Type')).toContain('text/html')
    const gammal = await GET(new Request('http://localhost/api/public/exempel/brev?mall=classic&typsnitt=calibri'))
    expect(gammal.status).toBe(200)
    expect(await gammal.text()).toContain('data-mall="linne"')
    const fel = await GET(new Request('http://localhost/api/public/exempel/brev?slug=finns-inte'))
    expect(fel.status).toBe(404)
    expect(fel.headers.get('X-Robots-Tag')).toBe('noindex')
  })
})
