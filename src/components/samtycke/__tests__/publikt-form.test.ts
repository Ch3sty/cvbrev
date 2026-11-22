/**
 * Cookieraden på publika sidor i grundens form (ägaren 2026-11-22: inget
 * svart publikt). Läser globals.css: publika regler finns, ingen svart yta,
 * Avvisa och Acceptera lika stora, höjderna oförändrade.
 */
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const css = fs.readFileSync(path.resolve(__dirname, '../../../app/globals.css'), 'utf8')
const PUBLIKT = ':root:has([data-p3-sida], [data-p3-sokvag], .rg-skal, [data-prov-start])'

function regel(selektor: string): string {
  const i = css.indexOf(`${PUBLIKT} ${selektor} {`)
  expect(i, selektor).toBeGreaterThan(-1)
  return css.slice(i, css.indexOf('}', i))
}

describe('cookieraden publikt', () => {
  it('Acceptera i koppar med klack, Avvisa vit med kant och klack, ingen svart yta', () => {
    const ja = regel('#rcc-confirm-button')
    const nej = regel('#rcc-decline-button')
    expect(ja).toMatch(/linear-gradient\(180deg, #EC8B41, #E07A2F\)/)
    expect(ja).toMatch(/box-shadow: 0 4px 0 #A8491A/)
    expect(nej).toMatch(/background: #FFFFFF/)
    expect(nej).toMatch(/box-shadow: 0 4px 0/)
    for (const r of [ja, nej, regel('.cookie-banner-container')]) {
      expect(r).not.toMatch(/background:\s*(#1A1A1F|#000|black|var\(--ink-1\))/i)
    }
  })

  it('samma ram på båda knapparna, så att de är lika stora', () => {
    expect(regel('#rcc-confirm-button')).toMatch(/border: 2px solid/)
    expect(regel('#rcc-decline-button')).toMatch(/border: 2px solid/)
  })

  it('höjd och plats ändras inte publikt (raden täcker inget nytt)', () => {
    const behallare = regel('.cookie-banner-container')
    const knappar = regel('.cookie-banner-buttons button')
    for (const r of [behallare, knappar]) {
      expect(r).not.toMatch(/\b(height|bottom|padding|min-height)\s*:/)
    }
  })
})
