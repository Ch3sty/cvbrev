// @vitest-environment node
/**
 * Varje WebP som en publik sida delar som og:image har sin JPG-syster i
 * 1200 × 630 (src/lib/delningsbild.ts). En ny artikel utan delningsbild fäller
 * här: kör node node_modules/tsx/dist/cli.mjs scripts/artikelbild/delningsbild.ts.
 */
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import sharp from 'sharp'
import { AUTHORS } from '@/lib/authors'
import { delningsbildSrc, RAKNA_UT_DELNINGSBILD } from '../delningsbild'

const ROT = path.resolve(__dirname, '../../..')
const KOR = 'kör node node_modules/tsx/dist/cli.mjs scripts/artikelbild/delningsbild.ts'

function bilder(mapp: string): Array<{ namn: string; image: string }> {
  const dir = path.join(ROT, mapp)
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => ({ namn: `${mapp}/${f}`, image: matter(fs.readFileSync(path.join(dir, f), 'utf8')).data.image as string }))
}

async function kontrollera(webp: string) {
  const jpg = path.join(ROT, 'public', delningsbildSrc(webp))
  expect(fs.existsSync(jpg), `${delningsbildSrc(webp)} saknas: ${KOR}`).toBe(true)
  const m = await sharp(jpg).metadata()
  expect(`${m.format} ${m.width}×${m.height}`, `${delningsbildSrc(webp)}: ${KOR}`).toBe('jpeg 1200×630')
}

describe('delningsbilderna', () => {
  const artiklar = bilder('content/artiklar')

  it('det finns artiklar att pröva', () => {
    expect(artiklar.length).toBeGreaterThan(100)
  })

  for (const a of artiklar) {
    it(`${a.namn} har sin delnings-JPG i 1200 × 630`, async () => {
      expect(a.image, `${a.namn} saknar image i frontmattern`).toMatch(/^\/images\/artiklar\/.+\.webp$/)
      await kontrollera(a.image)
    })
  }

  for (const i of bilder('content/rekryterare').filter((x) => x.image?.endsWith('.webp'))) {
    it(`${i.namn} har sin delnings-JPG i 1200 × 630`, () => kontrollera(i.image))
  }

  for (const f of AUTHORS) {
    it(`författaren ${f.id} har sin delnings-JPG i 1200 × 630`, () => kontrollera(f.image))
  }

  it('Räkna ut har sin delnings-JPG i 1200 × 630', () => kontrollera(new URL(RAKNA_UT_DELNINGSBILD.url).pathname.replace(/-og\.jpg$/, '.webp')))
})
