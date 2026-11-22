/**
 * De tre artiklarna 2026-11 (docs/artiklar-2026-11/seo-slutgranskning.md,
 * byggordern H, J och K): visaren CV och brev i samma mall, arket Logga sökt
 * tjänst och månadsbladet, som server-HTML och mot artiklarnas egen text.
 */
import fs from 'fs'
import path from 'path'
import { renderToStaticMarkup } from 'react-dom/server'
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const capture = vi.fn()
vi.mock('@/lib/analytics/events', () => ({ capture: (...a: unknown[]) => capture(...a) }))
const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

import CvOchBrevPar, { PAR_MALL_IDS, parFot } from '../CvOchBrevPar'
import ManadsbladArtikel, { MANADSBLAD_OKTOBER } from '../ManadsbladArtikel'
import LoggaSoktJobb from '../LoggaSoktJobb'
import { getMallKort } from '@/lib/cv/mallar/katalog'
import { SOKT_KONTO_HREF } from '@/lib/jobbsok/provaSokt'

const mdx = (slug: string) => fs.readFileSync(path.join(process.cwd(), 'content/artiklar', `${slug}.mdx`), 'utf8').replace(/\r\n/g, '\n')

beforeEach(() => {
  capture.mockReset()
  push.mockReset()
})

describe('CvOchBrevPar', () => {
  it('första vyn i HTML: Linne i båda arken, båda adresserna med mall=linne och inga andra mall-adresser', () => {
    const html = renderToStaticMarkup(<CvOchBrevPar slug="cv-och-personligt-brev-samma-mall" />)
    expect(html).toContain('alt="CV i mallen Linne"')
    expect(html).toContain('alt="Personligt brev i mallen Linne"')
    expect(html).toContain('href="/skapa-brev/start?mall=linne"')
    expect(html).toContain('href="/cv-mallar/prova?mall=linne"')
    expect((html.match(/href="[^"]*\?mall=/g) ?? []).length).toBe(2)
    expect((html.match(/mall=[a-z]+/g) ?? []).every((m) => m === 'mall=linne')).toBe(true)
    expect(html).toContain('role="group" aria-label="CV och personligt brev i samma mall"')
    expect(html).not.toMatch(/<h[1-6][\s>]/)
    expect(html).not.toContain('aria-hidden="true" class="cbp')
    expect(html).not.toContain('<iframe')
    expect(html).not.toMatch(/fetchpriority|loading="eager"/)
    // Alla bilder lazy, så att artikelbilden förblir LCP.
    const bilder = html.match(/<img [^>]*>/g) ?? []
    expect(bilder.length).toBeGreaterThan(0)
    for (const b of bilder) expect(b).toContain('loading="lazy"')
    // Miniatyrerna: alt="" och knapparna "Visa {namn}", Linne vald.
    expect((html.match(/aria-pressed="true"/g) ?? []).length).toBe(1)
    expect(html).toContain('aria-label="Visa Kalksten"')
    expect(html).toContain('Skriv brevet i Linne')
    expect(html).toContain('Bygg CV:t i Linne')
    expect(html).toContain('href="/cv-mallar"')
    expect(html).toContain('<noscript>')
    expect(html).not.toMatch(/\d+\s?kr\b/)
  })

  it('mallarna i artikelns ordning ur katalogen, två ur varje familj', () => {
    expect(PAR_MALL_IDS).toEqual(['linne', 'bjork', 'kalksten', 'granit', 'kolumn', 'arsring', 'morkrum', 'kvadrat'])
    const familjer = PAR_MALL_IDS.map((id) => getMallKort(id)?.familj)
    expect(familjer).toEqual(['en-spalt', 'en-spalt', 'sidospalt', 'sidospalt', 'marginal', 'marginal', 'konstnarlig', 'konstnarlig'])
  })

  it('fotraden står ordagrant i FAQ 5 och 6, i frontmatter och i FAQItem', () => {
    const text = mdx('cv-och-personligt-brev-samma-mall')
    const [a, b] = parFot().split(/(?<=\.) /)
    expect(a).toBe('Hos oss är mallarna Linne och Björk gratis för båda dokumenten.')
    expect(b).toBe('Att ladda ner brevet ingår i Premium, oavsett om du väljer PDF eller Word.')
    expect(text.split(a).length - 1).toBe(2)
    expect(text.split(b).length - 1).toBe(2)
  })

  it('ett byte byter båda arken, båda adresserna och skickar händelserna utan personuppgifter', () => {
    const { container, getByLabelText, getByText } = render(<CvOchBrevPar slug="cv-och-personligt-brev-samma-mall" />)
    fireEvent.click(getByLabelText('Visa Kalksten'))
    expect(container.querySelector('img[alt="CV i mallen Kalksten"]')).not.toBeNull()
    expect(container.querySelector('img[alt="Personligt brev i mallen Kalksten"]')).not.toBeNull()
    expect(getByText('Skriv brevet i Kalksten').closest('a')?.getAttribute('href')).toBe('/skapa-brev/start?mall=kalksten')
    expect(getByText('Bygg CV:t i Kalksten').closest('a')?.getAttribute('href')).toBe('/cv-mallar/prova?mall=kalksten')
    // Kalksten har foto i CV:t: raden om fotoplatsen står under arken.
    expect(container.textContent).toContain('Våra brevmallar har ingen fotoplats, inte ens när CV-mallen har en.')
    expect(capture).toHaveBeenCalledWith('mallvisning_mall_bytt', { slug: 'cv-och-personligt-brev-samma-mall', template: 'kalksten', typ: 'par', hur: 'miniatyr' })
    fireEvent.click(getByText('Skriv brevet i Kalksten'))
    expect(capture).toHaveBeenCalledWith('mallvisning_klick', { slug: 'cv-och-personligt-brev-samma-mall', template: 'kalksten', typ: 'par', mal: 'brev' })
  })
})

describe('ManadsbladArtikel', () => {
  it('antalen ur artikelns exempeltabell: Annons, Spontant och intervjuer under Händelse', () => {
    const text = mdx('aktivitetsrapport-arbetsformedlingen')
    const tabell = text.slice(text.indexOf('**Exempel: listan för oktober.**'))
    const rader = (tabell.slice(0, tabell.indexOf('</table>')).match(/<tr>[\s\S]*?<\/tr>|<tr className="bg-slate-50">[\s\S]*?<\/tr>/g) ?? []).filter((r) => r.includes('<td'))
    const celler = rader.map((r) => [...r.matchAll(/<td[^>]*>([^<]*)<\/td>/g)].map((m) => m[1]))
    expect(celler).toHaveLength(5)
    for (const c of celler) expect(c[0]).toMatch(/ okt$/)
    expect(celler.filter((c) => c[3] === 'Annons')).toHaveLength(MANADSBLAD_OKTOBER.annonserade)
    expect(celler.filter((c) => c[3] === 'Spontant')).toHaveLength(MANADSBLAD_OKTOBER.spontana)
    expect(celler.filter((c) => /intervju/i.test(c[4]))).toHaveLength(MANADSBLAD_OKTOBER.intervjuer)
    expect(MANADSBLAD_OKTOBER).toEqual({ annonserade: 4, spontana: 1, intervjuer: 1 })
  })

  it('bladet som gratiskontot ser det: text, grå streck, märkningen, inga rubriker, länkar, knappar, bilder eller priser', () => {
    const html = renderToStaticMarkup(<ManadsbladArtikel />)
    expect(html).toContain('role="group" aria-label="Exempel: månadsrapporten för oktober"')
    expect(html).toContain('Oktober 2026')
    expect(html).toContain('5 sökta jobb och 1 intervju under perioden')
    expect(html).toContain('<strong>1. Sökta annonserade jobb</strong> <span>4</span>')
    expect(html).toContain('<strong>2. Intresseanmälningar och spontanansökningar</strong> <span>1</span>')
    expect(html).toContain('<strong>3. Intervjuer och provjobb</strong> <span>1</span>')
    expect((html.match(/class="mba-rad"/g) ?? []).length).toBe(6)
    expect((html.match(/class="mba-streck" aria-hidden="true"/g) ?? []).length).toBe(3)
    expect((html.match(/Raderna ingår i Premium/g) ?? []).length).toBe(3)
    expect(html).toContain('Skriv ut eller spara som PDF <span class="p3-chip p3-chip-premium">Premium</span>')
    expect(html).toContain('Kopiera som text till AF-rapporten <span class="p3-chip p3-chip-premium">Premium</span>')
    expect(html).toContain('Dela med en länk <span class="p3-chip p3-chip-gratis">Antalen gratis</span>')
    expect(html).not.toMatch(/<h[1-6][\s>]|<a[\s>]|<button|<img|\bkr\b/)
    expect(html.startsWith('<div class="mba not-prose" role="group"')).toBe(true)
  })
})

describe('LoggaSoktJobb', () => {
  it('aside med aria-label, formulär till kontovägen utan JavaScript, tomma fält utan name', () => {
    const html = renderToStaticMarkup(<LoggaSoktJobb slug="aktivitetsrapport-arbetsformedlingen" />)
    expect(html.startsWith('<aside class="lsj not-prose" aria-label="Logga sökt tjänst">')).toBe(true)
    expect(html).toContain('action="/register" method="get"')
    // Det dolda fältet ger samma adress som SOKT_KONTO_HREF när formuläret skickas med GET.
    const redirect = html.match(/name="redirect" value="([^"]+)"/)?.[1]
    expect(`/register?redirect=${encodeURIComponent(redirect ?? '')}`).toBe(SOKT_KONTO_HREF)
    expect(html).not.toMatch(/<h[1-6][\s>]/)
    for (const id of ['st-tjanst', 'st-arbetsgivare']) {
      const falt = html.match(new RegExp(`<input[^>]*id="${id}"[^>]*>`))?.[0] ?? ''
      expect(falt).not.toContain('name=')
      expect(falt).toContain('value=""')
    }
  })

  it('skickat ark: sample_completed med kind sokt, surface och slug, aldrig fältens innehåll', () => {
    const { getByLabelText, getByText } = render(<LoggaSoktJobb slug="aktivitetsrapport-arbetsformedlingen" />)
    fireEvent.change(getByLabelText('Tjänst'), { target: { value: 'Ekonomiassistent' } })
    fireEvent.change(getByLabelText('Arbetsgivare'), { target: { value: 'Hasselgläntans Redovisning' } })
    fireEvent.click(getByText('Logga sökt tjänst', { selector: 'a' }))
    expect(capture).toHaveBeenCalledTimes(1)
    expect(capture).toHaveBeenCalledWith('sample_completed', { kind: 'sokt', surface: 'artikel', slug: 'aktivitetsrapport-arbetsformedlingen' })
    expect(JSON.stringify(capture.mock.calls)).not.toMatch(/Ekonomiassistent|Hasselgläntans|\d{4}-\d{2}-\d{2}/)
    expect(push).toHaveBeenCalledWith(SOKT_KONTO_HREF)
  })
})
