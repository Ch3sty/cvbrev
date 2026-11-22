// scripts/artikelbild/delningsbild.ts
// =============================================================================
// Delningsbilderna: en JPG i 1200 × 630 bredvid varje WebP som en publik sida
// har som og:image (src/lib/delningsbild.ts). Facebook och LinkedIn visar inte
// WebP säkert i förhandsvisningen; startsidans PNG kom fram, artiklarnas WebP
// inte (2026-11-22).
//
// Kör:
//   node node_modules/tsx/dist/cli.mjs scripts/artikelbild/delningsbild.ts           alla
//   node node_modules/tsx/dist/cli.mjs scripts/artikelbild/delningsbild.ts <slug>    en artikel
//   ... --qa <mapp>   kopierar också resultaten dit, för att titta på dem
//
// Idempotent: samma källa ger samma bytes, och en fil skrivs bara när den
// skiljer sig från den som redan ligger där.
//
// Beskärningen per sort (granskad på renderade bilder 2026-11-22):
//   bord      artiklarnas "På bordet" (1536 × 1024, enfärgad botten). 7 % tas
//             bort upptill och nertill, där bara bottnen finns (motivet står
//             mellan 13 och 89 % av höjden i alla 154), bilden skalas till 630
//             i höjd och sidorna förlängs med kantens egen färg. Inget av
//             motivet kapas.
//   hel       insikternas och Räkna ut:s bilder (1536 × 1024, verlopp och text
//             nära kanterna). Hela bilden i 630 i höjd, sidorna fylls med
//             bildens egen kant, förlängd och suddad.
//   portratt  författarnas porträtt (500 × 500, friställda). Hela porträttet i
//             630 × 630 mitt på vit botten.
// =============================================================================

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import sharp from 'sharp'
import { AUTHORS } from '../../src/lib/authors'
import { DELNINGSBILD_BREDD as B, DELNINGSBILD_HOJD as H, delningsbildSrc } from '../../src/lib/delningsbild'

type Sort = 'bord' | 'hel' | 'portratt'
type Jobb = { webp: string; sort: Sort }

const PUBLIC = 'public'
const KVALITET = 82
const MAX_KB = 150

const args = process.argv.slice(2)
const qaIndex = args.indexOf('--qa')
const QA = qaIndex >= 0 ? args[qaIndex + 1] : null
const slugar = args.filter((a, i) => !a.startsWith('--') && (qaIndex < 0 || i !== qaIndex + 1))

function bildIFrontmatter(mapp: string): Array<{ slug: string; image: string }> {
  return fs
    .readdirSync(mapp)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => ({ slug: f.replace(/\.mdx$/, ''), image: matter(fs.readFileSync(path.join(mapp, f), 'utf8')).data.image as string }))
    .filter((a) => typeof a.image === 'string' && a.image.endsWith('.webp'))
}

function allaJobb(): Jobb[] {
  const artiklar = bildIFrontmatter('content/artiklar')
  if (slugar.length) return artiklar.filter((a) => slugar.includes(a.slug)).map((a) => ({ webp: a.image, sort: 'bord' as const }))
  return [
    ...artiklar.map((a) => ({ webp: a.image, sort: 'bord' as const })),
    ...bildIFrontmatter('content/rekryterare').map((a) => ({ webp: a.image, sort: 'hel' as const })),
    { webp: '/images/rakna-ut.webp', sort: 'hel' as const },
    ...AUTHORS.map((a) => ({ webp: a.image, sort: 'portratt' as const })),
  ]
}

async function rita(fil: string, sort: Sort): Promise<Buffer> {
  const kalla = sharp(fil).removeAlpha()
  const m = await kalla.metadata()
  const w0 = m.width!
  const h0 = m.height!
  let bild: Buffer

  if (sort === 'bord') {
    const bort = Math.round(h0 * 0.07)
    const h1 = h0 - 2 * bort
    const w = Math.min(B, Math.round((w0 * H) / h1))
    const vanster = Math.floor((B - w) / 2)
    bild = await sharp(fil)
      .removeAlpha()
      .extract({ left: 0, top: bort, width: w0, height: h1 })
      .resize(w, H, { fit: 'fill' })
      .extend({ left: vanster, right: B - w - vanster, extendWith: 'copy' })
      .toBuffer()
  } else if (sort === 'hel') {
    // Kanten förlängd och sedan suddad, så att förlängningen inte blir randig
    // där en ljus cirkel eller ett verlopp når bildens kant.
    const w = Math.round((w0 * H) / h0)
    const vanster = Math.floor((B - w) / 2)
    const forgrund = await sharp(fil).removeAlpha().resize(w, H).toBuffer()
    const forlangd = await sharp(forgrund).extend({ left: vanster, right: B - w - vanster, extendWith: 'copy' }).toBuffer()
    bild = await sharp(forlangd)
      .blur(24)
      .composite([{ input: forgrund, left: vanster, top: 0 }])
      .toBuffer()
  } else {
    // Porträtten är friställda (genomskinlig botten): lägg dem på vitt.
    const portratt = await sharp(fil).flatten({ background: '#ffffff' }).resize(H, H).toBuffer()
    bild = await sharp({ create: { width: B, height: H, channels: 3, background: { r: 255, g: 255, b: 255 } } })
      .composite([{ input: portratt, left: Math.floor((B - H) / 2), top: 0 }])
      .png()
      .toBuffer()
  }

  return sharp(bild).jpeg({ quality: KVALITET, mozjpeg: true, chromaSubsampling: '4:2:0' }).toBuffer()
}

async function main() {
  const jobb = allaJobb()
  if (!jobb.length) throw new Error('inga bilder att göra')
  let skrivna = 0
  let summa = 0
  const fel: string[] = []
  if (QA) fs.mkdirSync(QA, { recursive: true })

  for (const j of jobb) {
    const kalla = path.join(PUBLIC, j.webp)
    if (!fs.existsSync(kalla)) {
      fel.push(`${j.webp} finns inte`)
      continue
    }
    const ut = path.join(PUBLIC, delningsbildSrc(j.webp))
    const jpg = await rita(kalla, j.sort)
    const meta = await sharp(jpg).metadata()
    if (meta.width !== B || meta.height !== H || meta.format !== 'jpeg') fel.push(`${ut}: ${meta.width} × ${meta.height} ${meta.format}`)
    if (jpg.length > MAX_KB * 1024) fel.push(`${ut}: ${Math.round(jpg.length / 1024)} kB (> ${MAX_KB})`)
    summa += jpg.length
    if (!fs.existsSync(ut) || !fs.readFileSync(ut).equals(jpg)) {
      fs.writeFileSync(ut, jpg)
      skrivna++
    }
    if (QA) fs.writeFileSync(path.join(QA, path.basename(ut)), jpg)
  }

  console.log(`${jobb.length} delningsbilder, ${skrivna} skrivna, ${jobb.length - skrivna} oförändrade, totalt ${Math.round(summa / 1024)} kB (snitt ${Math.round(summa / 1024 / jobb.length)} kB)`)
  if (fel.length) {
    console.error(fel.join('\n'))
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
