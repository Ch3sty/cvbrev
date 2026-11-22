/**
 * Visaren i artiklarna som server-HTML (byggspecen våg 2, avsnitt 1 och 4):
 * första vyn (Linne) står i HTML, inga rubriker, "Läs brevet som text" är
 * öppen i HTML och slutar som arket, och noscript-stilen finns.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { BrevForhandsvisning, BrevMallVisning } from '../BrevVisareArtikel'
import { ARTIKEL_BREV } from '@/components/mdx/personligt-brev-preview-data'

describe('visaren i artiklarna', () => {
  it('mallvisningen: motorns exempelbrev i Linne, länken och fotraden, inga rubriker', () => {
    const html = renderToStaticMarkup(<BrevMallVisning />)
    expect(html).toContain('src="/api/public/exempel/brev?mall=linne"')
    expect(html).toContain('loading="lazy"')
    expect(html).toContain('title="Personligt brev i mallen Linne"')
    expect(html).toContain('Samma brev i fem mallar')
    expect(html).toMatch(/<b>Linne\.<\/b> <span>Gratis, även som Word\.<\/span>/)
    // Linne (första vyn) ger samma adress som förut; knappen heter "Använd som mall" (beslut 6).
    expect(html).toContain('href="/skapa-brev/start"')
    expect(html).not.toContain('/skapa-brev/start?mall=')
    expect(html).toContain('Använd som mall')
    expect(html).toContain('Det här är fem av 40 mallar. Med ett konto provar du alla med ditt eget brev.')
    expect(html).not.toMatch(/<h[1-6][\s>]/)
    expect(html).not.toContain('Läs brevet som text')
    expect(html).toContain('<noscript>')
    expect(html).toContain('role="group" aria-label="Välj mall"')
    expect((html.match(/aria-pressed="true"/g) ?? []).length).toBe(1)
    expect(html).toContain('aria-label="Mallen Terrakotta"')
    // Första läget: bara nästa mall kikar fram.
    expect(html).not.toContain('mv-kik-v')
    expect(html).toContain('mv-kik-h')
  })

  it('förhandsvisningen: artikelns brev, texten öppen i HTML med samma avslut som arket', () => {
    const html = renderToStaticMarkup(<BrevForhandsvisning yrke="underskoterska" />)
    expect(html).toContain('src="/api/public/exempel/brev?mall=linne&amp;nyckel=underskoterska"')
    expect(html).toContain('title="Personligt brev för undersköterska i mallen Linne"')
    expect(html).toMatch(/<details class="mv-text" open="">\s*<summary>Läs brevet som text/)
    expect(html).toContain('<b>Lisa Andersson</b> till Karolinska Universitetssjukhuset<br/>Ansökan: Undersköterska inom geriatrik')
    expect(html).toContain('<p>Med vänlig hälsning<br/>Lisa Andersson</p>')
    expect(html).not.toContain('Varma hälsningar')
    const b = ARTIKEL_BREV.underskoterska
    const forsta = b.brevText.split('\n\n')[1]
    expect(html).toContain(forsta.slice(0, 60))
    expect(html).not.toMatch(/<h[1-6][\s>]/)
  })

  it('okänt yrke faller tillbaka på studentbrevet', () => {
    const html = renderToStaticMarkup(<BrevForhandsvisning yrke="finns-inte" />)
    expect(html).toContain('nyckel=student')
  })
})
