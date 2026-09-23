// scripts/qa-linje.mjs
// Riktig webbläsartest av den visuella linjen (docs/bygg-noter-paket.md,
// "Visuell linje: avgjort"). Systemets Chrome, Pixel 7 (412 × 915) och
// desktop 1280, skärmdump per vy till docs/qa/qa-linje/, LCP och CLS per vy
// (Pixel 7 med 3x CPU-strypning), konsolfel, svar 4xx/5xx, horisontell
// scroll och om vyns primära handling ligger inom första skärmhöjden.
//
//   node scripts/qa-linje.mjs http://localhost:8300 <konton.json>
//
// konton.json: { "gratis": {email,password}, "allt": {email,password} }

import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const [, , BAS = 'http://localhost:8300', KONTOFIL] = process.argv
const UT = 'docs/qa/qa-linje'
fs.mkdirSync(UT, { recursive: true })
const konton = KONTOFIL ? JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) : {}

const PIXEL7 = {
  viewport: { width: 412, height: 915, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  userAgent:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
}

const PUBLIKA = [
  { namn: 'start', vag: '/', primar: 'a[data-cta="hero-primary"]' },
  { namn: 'priser', vag: '/priser' },
  { namn: 'artiklar', vag: '/artiklar' },
  { namn: 'artikel-logiska-tester', vag: '/artiklar/logiska-tester' },
  { namn: 'verktyg-cv-analys', vag: '/verktyg/cv-analys' },
  { namn: 'verktyg-rekryteringstester', vag: '/verktyg/rekryteringstester' },
  { namn: 'funktioner', vag: '/funktioner' },
  { namn: 'om-oss', vag: '/om-oss' },
]
const INLOGGADE = [
  { namn: 'hemskarm', vag: '/dashboard' },
  { namn: 'testhubb', vag: '/dashboard/tester' },
  { namn: 'cv-mallar', vag: '/dashboard/cv-mallar' },
]

const resultat = []
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))

async function ny(browser, vy) {
  const p = await browser.newPage()
  p.setDefaultNavigationTimeout(120000)
  if (vy === 'pixel7') await p.emulate(PIXEL7)
  else await p.setViewport({ width: 1280, height: 900 })
  const fel = []
  p.on('pageerror', (e) => fel.push('sidfel: ' + String(e).slice(0, 160)))
  p.on('console', (m) => {
    if (m.type() === 'error' && !/posthog|gtm|googletag|Failed to load resource: net::ERR_BLOCKED/i.test(m.text())) fel.push('konsol: ' + m.text().slice(0, 160))
  })
  p.on('response', (r) => {
    const u = r.url()
    if (r.status() >= 400 && u.startsWith(BAS) && !u.includes('/_next/static')) fel.push(`${r.status()} ${u.replace(BAS, '')}`)
  })
  await p.evaluateOnNewDocument(() => {
    window.__lcp = 0
    window.__cls = 0
    new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__lcp = e.startTime))).observe({ type: 'largest-contentful-paint', buffered: true })
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value })).observe({ type: 'layout-shift', buffered: true })
  })
  return { p, fel }
}

async function matLcp(browser, url, vy) {
  const { p } = await ny(browser, vy)
  const cdp = await p.createCDPSession()
  await cdp.send('Network.enable')
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
  if (vy === 'pixel7') {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 3 })
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 70, downloadThroughput: (12 * 1024 * 1024) / 8, uploadThroughput: (3 * 1024 * 1024) / 8 })
  }
  await p.goto(url, { waitUntil: 'networkidle2' })
  await vanta(1500)
  const m = await p.evaluate(() => ({ lcp: Math.round(window.__lcp), cls: Number(window.__cls.toFixed(3)) }))
  await p.close()
  return m
}

async function vy(browser, { namn, vag, primar, klick }, vyTyp, cookies) {
  const { p, fel } = await ny(browser, vyTyp)
  if (cookies) await p.setCookie(...cookies)
  await p.goto(BAS + vag, { waitUntil: 'networkidle2' })
  await vanta(1200)
  await p.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((e) => e.innerText.trim() === 'Acceptera')
    b?.click()
  })
  await vanta(300)
  if (klick) {
    await p.click(klick).catch((e) => fel.push('klick: ' + e.message))
    await vanta(700)
  }
  const kontroll = await p.evaluate((sel) => {
    const bredd = document.documentElement.scrollWidth
    const h1 = document.querySelectorAll('h1').length
    let primarSynlig = null
    if (sel) {
      const el = document.querySelector(sel)
      if (el) {
        const r = el.getBoundingClientRect()
        primarSynlig = r.top >= 0 && r.bottom <= window.innerHeight
      } else primarSynlig = false
    }
    return { bredd, h1, primarSynlig, vw: window.innerWidth }
  }, primar)
  const fil = `${UT}/${namn}-${vyTyp}.png`
  await p.screenshot({ path: fil, fullPage: !klick })
  await p.close()
  return { fil, fel, ...kontroll }
}

async function loggaIn(browser, konto) {
  const { p } = await ny(browser, 'desktop')
  await p.goto(BAS + '/login', { waitUntil: 'domcontentloaded' })
  await p.waitForSelector('input[type="email"]')
  await p.type('input[type="email"]', konto.email)
  await p.type('input[type="password"]', konto.password)
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), p.click('button[type="submit"]')])
  await vanta(2500)
  const c = await p.cookies()
  await p.close()
  return c
}

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--lang=sv-SE'] })
try {
  for (const s of PUBLIKA) {
    for (const t of ['pixel7', 'desktop']) {
      const r = await vy(browser, s, t)
      const lcp = t === 'pixel7' ? await matLcp(browser, BAS + s.vag, t) : null
      resultat.push({ vy: s.namn, typ: t, ...r, ...(lcp ?? {}) })
      console.log(s.namn, t, JSON.stringify({ lcp, fel: r.fel.length, bredd: r.bredd, h1: r.h1, primar: r.primarSynlig }))
    }
  }
  // Header, megameny, mobilmeny och footer.
  resultat.push({ vy: 'megameny', typ: 'desktop', ...(await vy(browser, { namn: 'megameny', vag: '/priser', klick: 'button[aria-controls="megameny"]' }, 'desktop')) })
  resultat.push({ vy: 'mobilmeny', typ: 'pixel7', ...(await vy(browser, { namn: 'mobilmeny', vag: '/priser', klick: 'button[aria-controls="mobilmeny"]' }, 'pixel7')) })

  for (const [kontoNamn, konto] of Object.entries(konton)) {
    const c = await loggaIn(browser, konto)
    for (const s of INLOGGADE) {
      for (const t of ['pixel7', 'desktop']) {
        const r = await vy(browser, { ...s, namn: `${s.namn}-${kontoNamn}` }, t, c)
        resultat.push({ vy: `${s.namn}-${kontoNamn}`, typ: t, ...r })
        console.log(s.namn, kontoNamn, t, JSON.stringify({ fel: r.fel, bredd: r.bredd, h1: r.h1 }))
      }
    }
    const r = await vy(browser, { namn: `mobilnav-${kontoNamn}`, vag: '/dashboard', klick: 'button[aria-label="Öppna meny"]' }, 'pixel7', c)
    resultat.push({ vy: `mobilnav-${kontoNamn}`, typ: 'pixel7', ...r })
  }
} finally {
  await browser.close()
}
fs.writeFileSync(`${UT}/qa-resultat.json`, JSON.stringify(resultat, null, 2))
console.log('Klart:', resultat.length, 'vyer')
