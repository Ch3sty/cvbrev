/**
 * Bankbredden (docs/design/bankbredd-2026-11-19.md avsnitt 3): åtta staplar
 * i Nio-radens ordning, höjden linjär från noll, markeringen som
 * data-attribut (kopparn sätts i CSS), hela talen i figurens aria-label och
 * i varje stapels title. Komponenten får inte vara en klientkomponent och
 * får aldrig importera bankerna.
 */
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import Bankbredd, { bankbreddLabel } from '../Bankbredd'
import { BANK_MAX, BANK_PER_TYP, BANK_TYPER, type BankTyp } from '@/lib/tester/bankbredd'

const html = (el: React.ReactElement) => {
  const div = document.createElement('div')
  div.innerHTML = renderToStaticMarkup(el)
  return div
}
const staplar = (d: HTMLElement) => Array.from(d.querySelectorAll<HTMLLIElement>('.bb-staplar li'))
const v = (li: HTMLLIElement) => Number(li.style.getPropertyValue('--v'))

describe('Bankbredd', () => {
  it('ritar talet och åtta staplar i Nio-radens ordning', () => {
    const d = html(<Bankbredd form="rad" />)
    const fig = d.querySelector('figure')!
    expect(fig.className).toBe('bb bb-rad bb-ljus')
    expect(fig.getAttribute('role')).toBe('img')
    expect(d.querySelector('.bb-tal')!.textContent).toBe('över3 500uppgifter')
    const li = staplar(d)
    expect(li).toHaveLength(8)
    expect(li.map((l) => l.dataset.typ)).toEqual([...BANK_TYPER])
    expect(li.some((l) => l.dataset.typ === 'personlighet')).toBe(false)
    for (const l of li) {
      expect(l.querySelector('i')).not.toBeNull()
      expect(l.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true')
    }
    expect(d.querySelector('[data-nagon-markerad]')).toBeNull()
    expect(d.querySelector('[data-markerad]')).toBeNull()
    expect(d.querySelector('figcaption')).toBeNull()
  })

  it('höjderna är linjära från noll: antal / största antal', () => {
    const li = staplar(html(<Bankbredd form="platta" />))
    const varden = li.map(v)
    expect(Math.max(...varden)).toBe(1)
    for (const l of li) {
      const n = BANK_PER_TYP[l.dataset.typ as BankTyp]
      expect(v(l)).toBeCloseTo(n / BANK_MAX, 3)
      expect(l.title).toMatch(new RegExp(`, ${n} uppgifter$`))
    }
    // Förhållandet mellan två staplar är förhållandet mellan talen (ingen förskjuten bas).
    const per = Object.fromEntries(li.map((l) => [l.dataset.typ, v(l)]))
    expect(per.spatial).toBe(1)
    expect(per.numeriskt / per.spatial).toBeCloseTo(BANK_PER_TYP.numeriskt / BANK_PER_TYP.spatial, 2)
    expect(per.matris / per.numeriskt).toBeCloseTo(BANK_PER_TYP.matris / BANK_PER_TYP.numeriskt, 2)
    expect(li.find((l) => l.dataset.typ === 'spatial')!.title).toBe('Spatial förmåga, 576 uppgifter')
  })

  it('den markerade typen får kopparn, de andra dämpas', () => {
    const d = html(<Bankbredd form="rad" yta="vagg" markerad="deduktiv" text="Följerad" />)
    expect(d.querySelector('figure')!.className).toBe('bb bb-rad bb-vagg')
    expect(d.querySelector('ol')!.hasAttribute('data-nagon-markerad')).toBe(true)
    expect(Array.from(d.querySelectorAll<HTMLElement>('li[data-markerad]')).map((l) => l.dataset.typ)).toEqual(['deduktiv'])
    expect(d.querySelector('figcaption')!.textContent).toBe('Följerad')

    const css = fs.readFileSync(path.join(process.cwd(), 'src/app/globals.css'), 'utf8')
    expect(css).toMatch(/\.bb-staplar li\[data-markerad\] i::before \{ background: var\(--bb-mark\); \}/)
    expect(css).toMatch(/\.bb \{[^}]*--bb-mark: var\(--koppar\);/)
    expect(css).toMatch(/\.bb-vagg \{[^}]*--bb-mark: var\(--koppar-ljus\);/)
    expect(css).toMatch(/height: calc\(var\(--v\) \* 100%\)/)
  })

  it('aria-label bär hela talen, och "låst" när något är markerat', () => {
    const lista =
      'matrislogik 499, figurserier 386, deduktiv slutledning 354, talserier 505, spatial förmåga 576, ordförråd 557, verbalt resonemang 368, numeriskt resonemang 288'
    const utan = html(<Bankbredd form="rad" />).querySelector('figure')!.getAttribute('aria-label')
    expect(utan).toBe(`Över 3 500 uppgifter i åtta testtyper: ${lista}.`)
    expect(bankbreddLabel('deduktiv')).toBe(`Över 3 500 uppgifter i åtta testtyper: ${lista}, deduktiv slutledning låst.`)
    const med = html(<Bankbredd form="rad" markerad="deduktiv" />).querySelector('figure')!.getAttribute('aria-label')
    expect(med).toBe(bankbreddLabel('deduktiv'))
    expect(html(<Bankbredd form="rad" label="Egen" />).querySelector('figure')!.getAttribute('aria-label')).toBe('Egen')
  })

  it('är en serverkomponent som bara läser den rena filen', () => {
    const src = fs.readFileSync(path.join(process.cwd(), 'src/components/publikt/Bankbredd.tsx'), 'utf8')
    expect(src).not.toMatch(/^['"]use client['"]/m)
    expect(src).not.toMatch(/server|selectQuestions|select'|pass-bank|bank\.server/)
    const ren = fs.readFileSync(path.join(process.cwd(), 'src/lib/tester/bankbredd.ts'), 'utf8')
    expect(ren.match(/^import .*$/gm)).toEqual([`import type { TestTyp } from '@/components/illustrations/TestGlyfer'`])
  })
})
