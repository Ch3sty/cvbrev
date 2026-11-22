// Renderar byggda skisser till bilder i bitar som går att granska.
//   node docs/design/publikt-omgang3/rendera.mjs <namn> [bredd ...]   (förval 412 1440)
// En webbläsare åt gången på hela datorn: ett lås i temp gör att parallella
// körningar väntar på varandra. Under 3 GB ledigt minne väntar skriptet (högst
// tio minuter) och avslutar sedan utan att rendera.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'

const rot = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(rot, '../../../node_modules/'))
const puppeteer = require('puppeteer-core')
// --nu: ägaren har sagt ja till rendering under 3 GB (2026-11-22). Låset gäller ändå.
const NU = process.argv.includes('--nu')
const [namn, ...b] = process.argv.slice(2).filter((a) => a !== '--nu')
const bredder = b.length ? b.map(Number) : [412, 1440]
const fil = path.join(rot, 'ut', `skiss-${namn}.html`)
if (!fs.existsSync(fil)) { console.error('saknas:', fil); process.exit(1) }
const ut = path.join(rot, 'bilder')
fs.mkdirSync(ut, { recursive: true })

const las = path.join(os.tmpdir(), 'publikt-omgang3-rendera.las')
const sov = (ms) => new Promise((r) => setTimeout(r, ms))
const GB = 1024 ** 3
let vantat = 0
for (;;) {
  const ledigt = os.freemem() / GB
  let fritt = true
  try { fs.mkdirSync(las) } catch { fritt = false
    try { if (Date.now() - fs.statSync(las).mtimeMs > 5 * 60000) fs.rmdirSync(las) } catch {} }
  if (fritt && (NU || ledigt >= 3)) break
  if (fritt) fs.rmdirSync(las)
  if (vantat >= 600) { console.error(`AVBRUTET: ${ledigt.toFixed(1)} GB ledigt eller låset upptaget efter tio minuter. Inget renderat.`); process.exit(2) }
  await sov(15000); vantat += 15
}

let browser
try {
  browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--disable-gpu'] })
  const page = await browser.newPage()
  for (const bredd of bredder) {
    const mobil = bredd < 700
    await page.setViewport({ width: bredd, height: mobil ? 915 : 900, deviceScaleFactor: 1, isMobile: mobil, hasTouch: mobil })
    await page.goto(pathToFileURL(fil).href, { waitUntil: 'networkidle0', timeout: 60000 })
    await page.evaluate(() => document.fonts.ready)
    await page.addStyleTag({ content: '*{animation:none!important;transition:none!important}' })
    const hojd = await page.evaluate(() => document.documentElement.scrollHeight)
    const bred = await page.evaluate(() => document.documentElement.scrollWidth)
    if (bred > bredd + 1) console.log(`VARNING ${namn} ${bredd}: sidan är ${bred} px bred, något sticker ut`)
    for (const gammal of fs.readdirSync(ut).filter((f) => f.startsWith(`${namn}-${bredd}-`))) fs.unlinkSync(path.join(ut, gammal))
    const bit = mobil ? 1830 : 1600
    const antal = Math.ceil(hojd / bit)
    for (let n = 0; n < antal; n++) {
      const y = n * bit
      await page.screenshot({ path: path.join(ut, `${namn}-${bredd}-${String(n + 1).padStart(2, '0')}.png`), clip: { x: 0, y, width: bredd, height: Math.min(bit, hojd - y) }, captureBeyondViewport: true })
    }
    // små tryckytor och text som bryts ut ur sin ruta
    const fynd = await page.evaluate(() => {
      const ut = []
      for (const el of document.querySelectorAll('a.knapp, button, .faq summary, .nav-val a')) {
        const r = el.getBoundingClientRect()
        if (r.width && r.height && r.height < 40) ut.push(`låg tryckyta ${Math.round(r.height)} px: ${el.textContent.trim().slice(0, 40)}`)
      }
      for (const el of document.querySelectorAll('h1, h2, h3, p, li, span, a, b')) {
        if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow === 'visible' && el.clientWidth > 0 && getComputedStyle(el).display !== 'inline') ut.push(`text bredare än rutan: ${el.textContent.trim().slice(0, 50)}`)
      }
      return ut.slice(0, 12)
    })
    console.log(`${namn} ${bredd}: höjd ${hojd}, ${antal} bitar` + (fynd.length ? '\n  ' + fynd.join('\n  ') : ''))
  }
} finally {
  if (browser) await browser.close()
  try { fs.rmdirSync(las) } catch {}
}
