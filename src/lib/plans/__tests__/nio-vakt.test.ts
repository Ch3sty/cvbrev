/**
 * Räkneregeln (textdäcket 2026-11-19, konsensus 2): texten säger "åtta
 * testtyper och personlighetstestet", aldrig "nio testtyper". Bilden får visa
 * nio glyfer. Vakten grep:ar .ts och .tsx under src utanför __tests__.
 * Räknesidorna (src/components/rakna) har nio kalkylatorer, inte testtyper,
 * och räknas inte.
 */
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROT = path.resolve(__dirname, '../../../..')
const MONSTER = /Nio testtyper|nio testtyper|En av nio|alla nio/
const UNDANTAG = [path.join('src', 'components', 'rakna')]

function filer(dir: string): string[] {
  const ut: string[] = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === '__tests__' || e.name === 'node_modules') continue
      ut.push(...filer(p))
    } else if (/\.tsx?$/.test(e.name)) {
      ut.push(p)
    }
  }
  return ut
}

describe('räkneregeln: aldrig nio testtyper i texten', () => {
  it('noll träffar i src utanför __tests__', () => {
    const traffar = filer(path.join(ROT, 'src'))
      .filter((f) => !UNDANTAG.some((u) => path.relative(ROT, f).startsWith(u)))
      .flatMap((f) =>
        fs
          .readFileSync(f, 'utf8')
          .split('\n')
          .map((rad, i) => (MONSTER.test(rad) ? `${path.relative(ROT, f)}:${i + 1}: ${rad.trim()}` : null))
          .filter((x): x is string => x !== null)
      )
    expect(traffar).toEqual([])
  })
})
