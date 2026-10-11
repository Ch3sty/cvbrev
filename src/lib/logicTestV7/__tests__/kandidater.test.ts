import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

// Kandidatfilerna (matris, verbalt, numeriskt) granskas av testansvarig och
// får aldrig nå appen: ingenting under src/ importerar från en katalog som
// heter kandidater. Gäller även dynamiska importer och require.
function allaFiler(dir: string, ut: string[] = []): string[] {
  for (const namn of readdirSync(dir)) {
    const p = path.join(dir, namn)
    if (statSync(p).isDirectory()) allaFiler(p, ut)
    else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(namn)) ut.push(p)
  }
  return ut
}

const IMPORT = /(?:import\s[^'"]*?from\s*|import\s*\(\s*|require\s*\(\s*|export\s[^'"]*?from\s*)['"]([^'"]+)['"]/g

describe('kandidatkatalogerna', () => {
  it('ingen fil under src/ importerar från kandidater/', () => {
    const traffar: string[] = []
    for (const fil of allaFiler('src').filter((f) => !f.endsWith('kandidater.test.ts'))) {
      const text = readFileSync(fil, 'utf8')
      for (const m of text.matchAll(IMPORT)) {
        if (/(^|\/)kandidater(\/|$)/.test(m[1])) traffar.push(`${fil}: ${m[1]}`)
      }
    }
    expect(traffar).toEqual([])
  })

  it('kontrollen hittar en sådan import', () => {
    const prov = "import x from '../kandidater/parti-01.json'\nconst y = await import(\"@/lib/verbalTestV2/kandidater/parti-01.json\")"
    const traffar = [...prov.matchAll(IMPORT)].map((m) => m[1]).filter((s) => /(^|\/)kandidater(\/|$)/.test(s))
    expect(traffar).toHaveLength(2)
  })

  it('kandidatkatalogerna finns och innehåller bara JSON', () => {
    for (const dir of ['src/lib/logicTestV7/kandidater', 'src/lib/verbalTestV2/kandidater', 'src/lib/numericalTestV2/kandidater']) {
      for (const f of readdirSync(dir)) expect(f).toMatch(/\.json$/)
    }
  })
})
