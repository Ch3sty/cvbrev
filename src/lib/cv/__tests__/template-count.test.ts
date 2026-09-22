import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import path from 'path'
import {
  SIMPLE_TEMPLATES,
  TEMPLATE_COUNT,
  FREE_TEMPLATE_COUNT,
  PREMIUM_TEMPLATE_COUNT,
  FREE_TEMPLATE_IDS,
  isTemplateFree,
} from '../simple-templates'

const SRC = path.resolve(__dirname, '../../..')

/**
 * Salj- och produktcopy namner mallantalet pa manga stallen. Registret ar
 * sanningen. De filer som kan importera konstanterna gor det; dar det inte
 * gar maste siffran stamma, och det bevakas av grep-testet nedan.
 */
describe('mallantalet i copy speglar registret', () => {
  it('registret har unika id:n och konstanterna raknar ratt', () => {
    const ids = SIMPLE_TEMPLATES.map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(TEMPLATE_COUNT).toBe(SIMPLE_TEMPLATES.length)
    expect(FREE_TEMPLATE_COUNT).toBe(SIMPLE_TEMPLATES.filter(t => t.tier === 'free').length)
    expect(PREMIUM_TEMPLATE_COUNT).toBe(SIMPLE_TEMPLATES.filter(t => t.tier === 'premium').length)
    expect(FREE_TEMPLATE_COUNT + PREMIUM_TEMPLATE_COUNT).toBe(TEMPLATE_COUNT)
  })

  it('antalen ar de vi tror: 41 totalt, 3 gratis, 38 premium', () => {
    // Failar nar registret andras, sa att copyn nedan gas igenom samtidigt.
    // Tre fria ar agarens beslut 6 (docs/plan-paket-och-onboarding.md).
    expect(TEMPLATE_COUNT).toBe(41)
    expect(FREE_TEMPLATE_COUNT).toBe(3)
    expect(PREMIUM_TEMPLATE_COUNT).toBe(38)
  })

  it('de tre fria mallarna ar de som listan pekar ut', () => {
    const fria = SIMPLE_TEMPLATES.filter(t => t.tier === 'free').map(t => t.id)
    expect(fria.sort()).toEqual([...FREE_TEMPLATE_IDS].sort())
    for (const id of FREE_TEMPLATE_IDS) expect(isTemplateFree(id)).toBe(true)
    expect(isTemplateFree('aurora')).toBe(false)
    expect(isTemplateFree('finns-inte')).toBe(false)
  })

  it('ingen fil i src pastar ett foraldrat mallantal', () => {
    const files = walk(SRC).filter(f => /\.(ts|tsx|mdx)$/.test(f) && !f.includes('__tests__'))

    const real = [TEMPLATE_COUNT, FREE_TEMPLATE_COUNT, PREMIUM_TEMPLATE_COUNT]
    // Siffror som en gang stod i copyn och som inte langre stammer.
    const stale = [42, 16, 12, 11, 8].filter(n => !real.includes(n))

    const offenders: string[] = []
    for (const file of files) {
      const text = readFileSync(file, 'utf8')
      for (const n of stale) {
        // "42 mallar", "alla 42 CV-mallar", "12 gratis CV-mallar" osv.
        const re = new RegExp(
          String.raw`\b` + n + String.raw`\b[^0-9\n]{0,25}(gratis[- ]?)?(cv-?)?mallar?\b`,
          'i',
        )
        const m = text.match(re)
        // "8+ mallar" ar medvetet oppet formulerat och alltid sant.
        if (m && !/\d\s*\+/.test(m[0])) {
          offenders.push(`${path.relative(SRC, file)}: "${m[0].trim()}"`)
        }
      }
    }

    expect(
      offenders,
      `Mallregistret har ${TEMPLATE_COUNT} mallar (${FREE_TEMPLATE_COUNT} gratis, ` +
        `${PREMIUM_TEMPLATE_COUNT} premium). Dessa stallen sager nagot annat:\n` +
        offenders.join('\n'),
    ).toEqual([])
  })
})

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next') continue
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, acc)
    else acc.push(full)
  }
  return acc
}
