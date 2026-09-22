import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true })
await page.goto('http://localhost:3104/priser', { waitUntil: 'networkidle2', timeout: 90000 })
const r = await page.evaluate(() => {
  window.scrollTo(2000, 0)
  const x1 = window.scrollX
  const box = document.querySelector('table')?.closest('div')
  const fore = box.scrollLeft
  box.scrollLeft = 2000
  return { sidanPannbar: x1, tabellScrollFore: fore, tabellScrollEfter: box.scrollLeft, tabellMax: box.scrollWidth - box.clientWidth }
})
console.log(JSON.stringify(r))
await browser.close()
