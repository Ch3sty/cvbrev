// Tillfällig diagnos för B4: vad spränger bredden på 412 px, och vad flyttar
// sig på desktop.
import puppeteer from 'puppeteer-core'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })

const page = await browser.newPage()
await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true })
await page.evaluateOnNewDocument(`
  window.__shifts = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) if (!e.hadRecentInput) {
      window.__shifts.push({ v: e.value, kallor: (e.sources||[]).map(s => (s.node && (s.node.tagName + '.' + (s.node.className||'').toString().slice(0,40))) || '?') });
    }
  }).observe({ type: 'layout-shift', buffered: true });
`)
await page.goto('http://localhost:3104/priser', { waitUntil: 'networkidle2', timeout: 90000 })

const bred = await page.evaluate(() => {
  const docW = document.documentElement.clientWidth
  const ut = []
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect()
    if (r.width === 0) continue
    if (r.right > docW + 1 || r.left < -1) {
      ut.push({
        tag: el.tagName,
        cls: (el.className || '').toString().slice(0, 70),
        left: Math.round(r.left),
        right: Math.round(r.right),
        w: Math.round(r.width),
      })
    }
  }
  return { docW, scrollW: document.documentElement.scrollWidth, bodyScrollW: document.body.scrollWidth, ut: ut.slice(0, 15) }
})
console.log('MOBIL BREDD', JSON.stringify(bred, null, 1))

await page.close()

// Desktop: vad flyttar sig
const d = await browser.newPage()
await d.setViewport({ width: 1280, height: 900 })
await d.evaluateOnNewDocument(`
  window.__shifts = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) if (!e.hadRecentInput) {
      window.__shifts.push({ v: Number(e.value.toFixed(4)), kallor: (e.sources||[]).map(s => (s.node && (s.node.tagName + '.' + (s.node.className||'').toString().slice(0,50))) || '?') });
    }
  }).observe({ type: 'layout-shift', buffered: true });
`)
await d.goto('http://localhost:3104/dashboard/profil/prenumeration', { waitUntil: 'networkidle2', timeout: 90000 })
await new Promise((r) => setTimeout(r, 1500))
console.log('DESKTOP SHIFTS', JSON.stringify(await d.evaluate(() => window.__shifts), null, 1))

await browser.close()
