// scripts/qa-figurserier.mjs
//
// Klicktest för figurserier (feat/figurserier) i riktig Chrome, en
// skärmdump per steg i docs/qa/figurserier/klicktest/.
//
//   SCRATCH=<tmp> BAS=http://localhost:5210 node scripts/qa-figurserier.mjs <konto> <niva> <bredd> <tema>
//     konto  gratis | premium      (scripts/qa-figurserier-konton.mjs skapa)
//     niva   grund | avancerad | expert
//     bredd  360 | 1280
//     tema   ljust | morkt
//
// Flödet: Alla tester → figurseriekortet → nivåns testsida → Starta → 15
// uppgifter (tio rätt, fem fel, räknat ur sessionId med appens urval och
// blandning) → Lämna in → resultatet (10 av 15) → genomgången. Gratis på
// avancerad: segmentet är låst och session-POST svarar 402. Mäter CLS på
// frågesidan och kontrollerar att raden är en .serie med sex rutor.

import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
import { alternativSeed, blandadPermutation, hashString, mulberry32 } from './lib/blanda-alternativ.mjs'

const BAS = process.env.BAS || 'http://localhost:5210'
const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
const UT = 'docs/qa/figurserier/klicktest'
fs.mkdirSync(UT, { recursive: true })
const RESULTAT = `${UT}/resultat.jsonl`
const KONTON = JSON.parse(fs.readFileSync(`${SCRATCH}/qa-figurserier-konton.json`, 'utf8'))
const [kontoNamn, niva, bredd, tema] = process.argv.slice(2)
const konto = KONTON[kontoNamn]
if (!konto) throw new Error(`okänt konto ${kontoNamn}`)
const BANK = JSON.parse(fs.readFileSync(`src/lib/figurserierV1/bank${niva[0].toUpperCase() + niva.slice(1)}.json`, 'utf8'))
const prefix = `${kontoNamn}-${niva}-${bredd}-${tema}`
let nr = 0
const fel = []

const vanta = (ms) => new Promise((r) => setTimeout(r, ms))

function logg(steg, ok, data = {}) {
  fs.appendFileSync(RESULTAT, JSON.stringify({ tid: new Date().toISOString(), floede: prefix, steg, ok, ...data }) + '\n')
  console.log(`${ok === null ? 'INFO' : ok ? 'OK  ' : 'FEL '} ${steg} ${JSON.stringify(data).slice(0, 400)}`)
  if (ok === false) fel.push(steg)
}
async function bild(p, namn, hel = false) {
  nr += 1
  await p.screenshot({ path: path.join(UT, `${prefix}-${String(nr).padStart(2, '0')}-${namn}.png`), fullPage: hel }).catch(() => {})
}
async function ga(p, u) {
  await p.goto(BAS + u, { waitUntil: 'networkidle2', timeout: 180000 })
  await vanta(600)
}
async function klickaText(p, re, sel = 'button, a, [role="button"]') {
  const ok = await p.evaluate(
    (src, flags, sel) => {
      const r = new RegExp(src, flags)
      const el = [...document.querySelectorAll(sel)].find((e) => r.test((e.innerText || e.getAttribute('aria-label') || '').trim()) && e.offsetParent !== null && !e.disabled)
      if (!el) return false
      el.scrollIntoView({ block: 'center' })
      el.click()
      return true
    },
    re.source,
    re.flags,
    sel
  )
  if (!ok) throw new Error(`hittade inte ${re}`)
  await vanta(500)
}
async function vantaText(p, re, timeout = 90000) {
  await p.waitForFunction((src, flags) => new RegExp(src, flags).test(document.body.innerText), { timeout }, re.source, re.flags)
}

function urval(pool, sessionId, n = 15) {
  const s = [...pool]
  const rng = mulberry32(hashString(sessionId))
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[s[i], s[j]] = [s[j], s[i]]
  }
  return s.slice(0, n)
}
const rattVisat = (sessionId, q) => blandadPermutation(alternativSeed(sessionId, q.id), q.options.length).indexOf(q.correctAnswer)

let SIDA = null
async function main() {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  const p = await browser.newPage()
  SIDA = p
  const mobil = bredd === '360'
  await p.setViewport(mobil ? { width: 360, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { width: 1280, height: 860, deviceScaleFactor: 1 })
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: tema === 'morkt' ? 'dark' : 'light' }])
  p.on('pageerror', (e) => logg('sidfel', false, { fel: String(e).slice(0, 300) }))

  // Inloggning
  await ga(p, '/login')
  await p.waitForSelector('input[type="email"]')
  await p.type('input[type="email"]', konto.email)
  await p.type('input[type="password"]', konto.password)
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {}), p.click('button[type="submit"]')])
  await p.waitForFunction(() => location.pathname.startsWith('/dashboard'), { timeout: 90000 })
  await vanta(1200)

  // Kakbannern täcker alternativen på 360: avvisa den först.
  await klickaText(p, /^Avvisa$/).catch(() => {})

  // Alla tester → kortet
  await ga(p, '/dashboard/tester/alla')
  const kort = await p.$('[data-testkort="figurer"]')
  logg('kortet finns i Alla tester', !!kort)
  if (kort) {
    await kort.evaluate((e) => e.scrollIntoView({ block: 'start' }))
    await vanta(400)
    await kort.screenshot({ path: path.join(UT, `${prefix}-${String(++nr).padStart(2, '0')}-kortet.png`) })
    const info = await kort.evaluate((e) => ({
      text: e.innerText,
      provrad: e.querySelector('[data-provrad]')?.getAttribute('data-provrad'),
      ordning: [...document.querySelectorAll('[data-testkort]')].map((x) => x.getAttribute('data-testkort')),
    }))
    logg('provraden är tyst, utan lås och pil', info.provrad === 'tyst', { provrad: info.provrad })
    logg('kortet står mellan logik och verbalt', info.ordning.indexOf('figurer') === info.ordning.indexOf('logik') + 1, { ordning: info.ordning })
    logg('provradens text', /Inte än för figurserier/.test(info.text), {})
  }

  if (kontoNamn === 'gratis' && niva !== 'grund') {
    const svar = await p.evaluate(async (n) => {
      const r = await fetch('/api/figurserier/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ test_type: `figurserier-${n}` }) })
      return r.status
    }, niva)
    logg(`gratis på ${niva}: session-POST spärras`, svar === 402 || svar === 403, { status: svar })
    await ga(p, `/dashboard/tester/figurserier-${niva}`)
    await bild(p, 'last-testsida')
    await browser.close()
    return
  }

  // Testsidan
  await ga(p, `/dashboard/tester/figurserier-${niva}`)
  await bild(p, 'testsida')
  await klickaText(p, /^(Starta testet|Gör om testet)$/)
  await p.waitForFunction(() => /\/test\/[0-9a-f-]{36}$/.test(location.pathname), { timeout: 90000 })
  const sid = await p.evaluate(() => location.pathname.split('/').pop())
  await p.waitForSelector('[data-serie]', { timeout: 90000 })
  await vanta(800)
  const markup = await p.evaluate(() => {
    const s = document.querySelector('[data-serie]')
    const rutor = s.querySelectorAll(':scope > .ruta')
    const r = [...rutor].map((x) => x.getBoundingClientRect())
    const cols = new Set(r.map((x) => Math.round(x.top))).size
    return { rutor: rutor.length, rader: cols, luckaSist: rutor[5]?.classList.contains('lucka'), rutbredd: Math.round(r[0].width), kolumn: Math.round(document.querySelector('[data-figurserie]').getBoundingClientRect().width) }
  })
  logg('raden: sex rutor, luckan sist', markup.rutor === 6 && markup.luckaSist, markup)
  logg(`raden: ${mobil ? 'två remsor' : 'en remsa'}`, markup.rader === (mobil ? 2 : 1), markup)
  await bild(p, 'uppgift-1')

  const fragor = urval(BANK, sid)
  for (let i = 0; i < 15; i++) {
    await p.waitForFunction((n) => document.body.innerText.includes(`Uppgift ${n}`), { timeout: 30000 }, i + 1)
    const ratt = rattVisat(sid, fragor[i])
    const val = i < 10 ? ratt : (ratt + 1) % 6
    await p.waitForFunction(() => [...document.querySelectorAll('[data-serie-alt] [role="radio"]')].every((b) => !b.disabled), { timeout: 30000 })
    await p.evaluate((i) => document.querySelectorAll('[data-serie-alt] [role="radio"]')[i].click(), val)
    await vanta(450)
    if (i === 0) await bild(p, 'uppgift-1-svarad')
  }
  await bild(p, 'sista')
  await klickaText(p, /^Lämna in$/)
  await vantaText(p, /Avsluta testet\?/)
  await bild(p, 'bekrafta')
  await klickaText(p, /^Avsluta och se resultat$/)
  await p.waitForFunction(() => location.pathname.endsWith('/results'), { timeout: 120000 })
  await vanta(2500)
  const res = await p.evaluate(() => document.body.innerText)
  logg('resultatet visar 10 av 15', /10 av 15 rätt/.test(res), {})
  await bild(p, 'resultat', true)
  const tappade = /Var du tappade/i.test(res)
  logg('Var du tappade per familj', tappade, {})

  // Genomgången
  await klickaText(p, /^Gå igenom/)
  await p.waitForSelector('[data-serie-genomgang]', { timeout: 60000 })
  await vanta(1200)
  const g = await p.evaluate(() => {
    const oppen = document.querySelector('[data-serie-genomgang] [aria-expanded="true"]')?.closest('li')
    return {
      fylld: !!oppen?.querySelector('[data-lucka="fylld"]'),
      regel: oppen?.querySelector('[data-regel]')?.textContent ?? '',
      misstag: oppen?.querySelector('[data-misstag]')?.textContent ?? '',
      rapport: !!oppen?.querySelector('[data-fraga-rapport]'),
    }
  })
  logg('genomgången: facit i luckan, regel, misstag och rapportlänk', g.fylld && !!g.regel && !!g.misstag && g.rapport, g)
  await p.evaluate(() => document.querySelector('[data-serie-genomgang] [aria-expanded="true"]')?.closest('li')?.scrollIntoView({ block: 'start' }))
  await vanta(500)
  await bild(p, 'genomgang')

  await browser.close()
}

main()
  .then(() => {
    logg('klart', fel.length === 0, { fel })
    process.exit(fel.length ? 1 : 0)
  })
  .catch(async (e) => {
    if (SIDA) await bild(SIDA, 'avbrutet', true)
    logg('avbrutet', false, { fel: String(e).slice(0, 500) })
    process.exit(1)
  })
