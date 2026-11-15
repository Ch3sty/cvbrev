/**
 * Testelementet Nio (beslut om säljytorna 2026-11-15). Nio glyfer i
 * rutnätets ordning, markeringen som data-attribut (färgen sätts i CSS),
 * figuren bär etiketten och glyferna är dolda för skärmläsare. Komponenten
 * och glyferna får inte vara klientkomponenter: de ska inte lägga någon
 * JavaScript på de publika sidorna.
 */
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import TestBredd from '../TestBredd'
import { TEST_TYPER, testTypForKind } from '@/components/illustrations/TestGlyfer'

const html = (el: React.ReactElement) => {
  const div = document.createElement('div')
  div.innerHTML = renderToStaticMarkup(el)
  return div
}

describe('TestBredd', () => {
  it('ritar nio glyfer i ordningen, med etiketten på figuren', () => {
    const d = html(<TestBredd form="rad" label="Nio testtyper" />)
    const fig = d.querySelector('figure')!
    expect(fig.getAttribute('role')).toBe('img')
    expect(fig.getAttribute('aria-label')).toBe('Nio testtyper')
    expect(fig.className).toBe('tb tb-rad tb-ljus')
    const li = Array.from(d.querySelectorAll('li'))
    expect(li.map((l) => l.dataset.typ)).toEqual([...TEST_TYPER])
    for (const l of li) expect(l.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true')
    expect(d.querySelector('[data-nagon-markerad]')).toBeNull()
    expect(d.querySelector('figcaption')).toBeNull()
  })

  it('markerar en typ, eller flera för I-provet, och skriver caption', () => {
    const en = html(<TestBredd form="rad" markerad="deduktiv" label="x" />)
    expect(Array.from(en.querySelectorAll('li[data-markerad]')).map((l) => (l as HTMLElement).dataset.typ)).toEqual(['deduktiv'])
    expect(en.querySelector('ol')!.hasAttribute('data-nagon-markerad')).toBe(true)
    const tre = html(<TestBredd form="rutnat" yta="vagg" markerade={['ordforrad', 'spatial', 'talserier']} text="Sex deltester, tre testtyper" label="x" />)
    expect(tre.querySelector('figure')!.className).toBe('tb tb-rutnat tb-vagg')
    expect(tre.querySelectorAll('li[data-markerad]')).toHaveLength(3)
    expect(tre.querySelector('figcaption')!.textContent).toBe('Sex deltester, tre testtyper')
  })

  it('kind ur testkonfigurationen och provet blir rätt typ', () => {
    expect(testTypForKind('figurserie')).toBe('figurer')
    expect(testTypForKind('numerisk')).toBe('numeriskt')
    expect(testTypForKind('talserie')).toBe('talserier')
    expect(testTypForKind('iprov')).toBeUndefined()
  })

  it('är serverkomponenter och raden skalar till spalten (högst 280 px, glyf högst 24 px)', () => {
    const las = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
    for (const p of ['src/components/publikt/TestBredd.tsx', 'src/components/illustrations/TestGlyfer.tsx', 'src/components/illustrations/primitives-bas.tsx']) {
      expect(las(p), p).not.toMatch(/^['"]use client['"]/m)
    }
    const css = las('src/app/globals.css')
    expect(css).toMatch(/\.tb-rad \{ width: 100%; max-width: 280px; \}/)
    expect(css).toMatch(/grid-template-columns: repeat\(9, minmax\(0, 1fr\)\)/)
    expect(css).toMatch(/\.tb-rad \.tb-glyfer svg \{ width: 100%; max-width: 24px;/)
  })
})
