import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true })
await page.goto('http://localhost:3104/priser', { waitUntil: 'domcontentloaded', timeout: 90000 }); await new Promise(r=>setTimeout(r,3000))
const r = await page.evaluate(() => {
  const main = document.querySelector('main')
  const ut = []
  for (const el of document.querySelectorAll('button, a[href], summary, [role=radio]')) {
    const b = el.getBoundingClientRect()
    if (b.height === 0 || b.height >= 44) continue
    ut.push({ tag: el.tagName, h: Math.round(b.height), imain: main ? main.contains(el) : false, txt: (el.textContent||'').trim().slice(0,30), cls: (el.className||'').toString().slice(0,50) })
  }
  return ut
})
console.log('TOTALT', r.length, 'I MAIN', r.filter(x=>x.imain).length)
console.log(JSON.stringify(r.filter(x=>x.imain), null, 1))
await browser.close()
