/**
 * Renderar Stripe-produktbilderna i public/stripe från SVG till PNG (1024×1024).
 *
 * Kör: npx tsx scripts/render-stripe-images.ts
 *
 * Vägen är: läs SVG-buffer → loadImage → rita på canvas med off-white botten.
 * Verifierar sedan varje PNG genom att läsa in den igen med loadImage.
 */

import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import { readFile, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'

const SIZE = 1024
const BG = '#FFFCF9'
const DIR = path.join(process.cwd(), 'public', 'stripe')

// Ordmärket sätts med Segoe UI Semibold (Windows) och faller tillbaka på Arial.
const FONT_PATH = 'C:\Windows\Fonts\seguisb.ttf'
let FONT_FAMILY = 'Arial'
try {
  if (GlobalFonts.registerFromPath(FONT_PATH, 'SegoeSemibold')) FONT_FAMILY = 'SegoeSemibold'
} catch {}

const NAMES = [
  'premium-dagspass',
  'premium-vecka',
  'premium-manad',
  'premium-kvartal',
  'cv-veckan',
  'testveckan',
  'allt-veckan',
] as const

async function render(name: string) {
  const svgPath = path.join(DIR, `${name}.svg`)
  const pngPath = path.join(DIR, `${name}.png`)

  const svg = await readFile(svgPath)
  const img = await loadImage(svg)

  const canvas = createCanvas(SIZE, SIZE)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, SIZE, SIZE)
  ctx.drawImage(img, 0, 0, SIZE, SIZE)

  // Ordmärke, centrerat på samma baslinje som tidigare (y 966).
  ctx.font = `600 44px ${FONT_FAMILY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = 'rgba(27, 25, 21, 0.6)'
  ctx.fillText('jobbcoach.ai', SIZE / 2, 966)

  const png = canvas.toBuffer('image/png')
  await writeFile(pngPath, png)

  // Verifiera: läs in PNG:en igen.
  const check = await loadImage(await readFile(pngPath))
  const svgSize = (await stat(svgPath)).size
  const pngSize = (await stat(pngPath)).size

  console.log(
    `${name.padEnd(18)} svg ${String(svgSize).padStart(7)} B  ` +
      `png ${String(pngSize).padStart(7)} B  ` +
      `verifierad ${check.width}×${check.height}`
  )
}

async function main() {
  for (const name of NAMES) {
    await render(name)
  }
  console.log('\nKlart. 4 PNG skrivna till public/stripe.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
