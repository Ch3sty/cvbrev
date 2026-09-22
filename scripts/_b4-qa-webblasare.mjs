// Tillfälligt QA-skript för B4. Klicktestar prissidan och prenumerationsvyn
// i riktig Chrome, Pixel 7 och desktop 1280, och mäter LCP och CLS.
// Tas bort när QA är klart.

import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BAS = 'http://localhost:3104'
const UT = 'docs/qa/qa-paket-b4'
const LOSEN = 'B4qaTest!2026'

const PIXEL7 = { width: 412, height: 915, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true }
const DESKTOP = { width: 1280, height: 900, deviceScaleFactor: 1 }

fs.mkdirSync(UT, { recursive: true })

const resultat = []
const logg = (rad) => {
  console.log(rad)
  resultat.push(rad)
}

/** LCP och CLS via PerformanceObserver, mätt över sidans liv. */
const MAT = `
  window.__lcp = 0; window.__cls = 0;
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__lcp = Math.max(window.__lcp, e.startTime);
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
  }).observe({ type: 'layout-shift', buffered: true });
`

async function nySida(browser, viewport) {
  const page = await browser.newPage()
  await page.setViewport(viewport)
  await page.evaluateOnNewDocument(MAT)
  return page
}

async function matning(page) {
  // Ge LCP-observatören en tick att rapportera sista kandidaten.
  await new Promise((r) => setTimeout(r, 600))
  return page.evaluate(() => ({
    lcp: Math.round(window.__lcp || 0),
    cls: Number((window.__cls || 0).toFixed(4)),
  }))
}

async function skarmdump(page, namn) {
  await page.screenshot({ path: path.join(UT, `${namn}.png`), fullPage: true })
}

/** Räknar orange: accent-ink-text, accentytor och marginalplattor. */
async function orange(page) {
  return page.evaluate(() => {
    const ac = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    const ai = getComputedStyle(document.documentElement).getPropertyValue('--accent-ink').trim()
    const mjuk = getComputedStyle(document.documentElement).getPropertyValue('--accent-mjuk').trim()
    const tillRgb = (h) => {
      const d = document.createElement('div')
      d.style.color = h
      document.body.appendChild(d)
      const v = getComputedStyle(d).color
      d.remove()
      return v
    }
    const traffar = [tillRgb(ac), tillRgb(ai), tillRgb(mjuk)]
    let n = 0
    const detaljer = []
    for (const el of document.querySelectorAll('body *')) {
      const s = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      const egenText = [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())
      if (egenText && traffar.includes(s.color)) {
        n++
        detaljer.push('text:' + el.textContent.trim().slice(0, 28))
      }
      if (traffar.includes(s.backgroundColor)) {
        n++
        detaljer.push('yta:' + (el.className || el.tagName).toString().slice(0, 28))
      }
    }
    return { n, detaljer }
  })
}

async function loggaIn(page, epost) {
  await page.goto(`${BAS}/login`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('input[type=email]', { timeout: 30000 })
  await page.type('input[type=email]', epost)
  await page.type('input[type=password]', LOSEN)
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {}),
    page.click('button[type=submit]'),
  ])
  await new Promise((r) => setTimeout(r, 2500))
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

try {
  /* ---------------------------------------------- publika prissidan */
  for (const [namn, vp] of [
    ['pixel7', PIXEL7],
    ['desktop', DESKTOP],
  ]) {
    const page = await nySida(browser, vp)
    await page.goto(`${BAS}/priser`, { waitUntil: 'networkidle2', timeout: 90000 })
    const m = await matning(page)
    await skarmdump(page, `01-priser-utloggad-${namn}`)

    const o = await orange(page)
    const kort = await page.$$eval('section[aria-label]', (n) => n.map((e) => e.getAttribute('aria-label')))
    const bodyScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
    const knapphojd = await page.$$eval('button, a[href]', (n) =>
      n.filter((e) => e.getBoundingClientRect().height > 0).map((e) => Math.round(e.getBoundingClientRect().height))
    )
    const forLaga = knapphojd.filter((h) => h < 44 && h > 0)

    logg(`[priser ${namn}] LCP ${m.lcp} ms, CLS ${m.cls}, orange ${o.n}, kort: ${kort.join(' | ')}`)
    logg(`[priser ${namn}] body-sidoscroll: ${bodyScroll}, klickytor under 44px: ${forLaga.length}`)

    // Spårväljaren: klicka Tester och se att kortet markeras, och att de
    // andra två står kvar.
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('[role=radio]')].find((e) => e.textContent.trim() === 'Tester')
      b?.click()
    })
    await new Promise((r) => setTimeout(r, 900))
    const markerad = await page.evaluate(() => {
      const el = document.getElementById('paket-tester')
      return {
        markerad: el?.className.includes('border-ink-1') ?? false,
        allaKortKvar: ['paket-cv', 'paket-tester', 'paket-allt'].every((i) => !!document.getElementById(i)),
      }
    })
    logg(`[priser ${namn}] spårval Tester: markerad ${markerad.markerad}, alla tre kort kvar ${markerad.allaKortKvar}`)
    await skarmdump(page, `02-priser-sparval-tester-${namn}`)

    // Allt-kortets längdval: byt till Månad och se att pris, rad och
    // knapptext följer med, och att inget annat ändras.
    const fore = await page.$eval('#paket-allt', (e) => e.innerText)
    await page.evaluate(() => {
      const allt = document.getElementById('paket-allt')
      const b = [...allt.querySelectorAll('[role=radio]')].find((e) => e.textContent.trim() === 'Månad')
      b?.click()
    })
    await new Promise((r) => setTimeout(r, 600))
    const efter = await page.$eval('#paket-allt', (e) => e.innerText)
    logg(
      `[priser ${namn}] längdval Månad: 149 kr ${efter.includes('149 kr')}, "i månaden" ${efter.includes('i månaden')}, knapp "Ta Allt-månaden" ${efter.includes('Ta Allt-månaden')}, ändrades ${fore !== efter}`
    )
    await skarmdump(page, `03-priser-allt-manad-${namn}`)

    // Dagläget: sluttidsrad, aldrig en förnyelserad.
    await page.evaluate(() => {
      const allt = document.getElementById('paket-allt')
      const b = [...allt.querySelectorAll('[role=radio]')].find((e) => e.textContent.trim() === 'Dag')
      b?.click()
    })
    await new Promise((r) => setTimeout(r, 600))
    const dag = await page.$eval('#paket-allt', (e) => e.innerText)
    logg(
      `[priser ${namn}] dagläget: "förnyas inte" ${dag.includes('förnyas inte')}, 49 kr ${dag.includes('49 kr')}`
    )
    await skarmdump(page, `04-priser-allt-dag-${namn}`)

    // Tabellen scrollar i egen behållare, inte i body.
    const tabell = await page.evaluate(() => {
      const t = document.querySelector('table')
      const box = t?.closest('div')
      return box ? { scrollar: box.scrollWidth > box.clientWidth, overflow: getComputedStyle(box).overflowX } : null
    })
    logg(`[priser ${namn}] tabellbehållare: ${JSON.stringify(tabell)}`)

    // FAQ öppnas.
    await page.evaluate(() => document.querySelector('details summary')?.click())
    await new Promise((r) => setTimeout(r, 400))
    const faqOppen = await page.$eval('details', (e) => e.open)
    logg(`[priser ${namn}] FAQ öppnas: ${faqOppen}`)
    await skarmdump(page, `05-priser-faq-${namn}`)

    await page.close()
  }

  /* ------------------------------------------- utan JavaScript */
  {
    const page = await nySida(browser, PIXEL7)
    await page.setJavaScriptEnabled(false)
    await page.goto(`${BAS}/priser`, { waitUntil: 'domcontentloaded', timeout: 90000 })
    const t = await page.evaluate(() => document.body.innerText).catch(() => '')
    const html = await page.content()
    const har = (s) => html.includes(s)
    logg(
      `[priser utan JS] tre kort ${har('CV-veckan') && har('Testveckan') && har('Allt')}, Allt visar veckoläget ${har('99 kr')}, fem FAQ ${(html.match(/<details/g) || []).length}, tabell ${har('<table')}, förtroenderad ${har('Kortbetalning via Stripe')}`
    )
    await skarmdump(page, `06-priser-utan-js-pixel7`)
    await page.close()
  }

  /* --------------------------------------- inloggade prenumerationsvyn */
  const KONTON = [
    ['gratis', 'b4-qa-gratis@jobbcoach-qa.test'],
    ['spar-cv', 'b4-qa-cv@jobbcoach-qa.test'],
    ['allt', 'b4-qa-allt@jobbcoach-qa.test'],
  ]

  for (const [lage, epost] of KONTON) {
    for (const [namn, vp] of [
      ['pixel7', PIXEL7],
      ['desktop', DESKTOP],
    ]) {
      const page = await nySida(browser, vp)
      await loggaIn(page, epost)

      await page.evaluateOnNewDocument(MAT)
      await page.goto(`${BAS}/dashboard/profil/prenumeration`, {
        waitUntil: 'networkidle2',
        timeout: 90000,
      })
      const m = await matning(page)
      await skarmdump(page, `07-prenumeration-${lage}-${namn}`)

      const o = await orange(page)
      const text = await page.evaluate(() => document.body.innerText)
      const plattor = await page.$$eval('.bg-accent-mjuk', (n) => n.length)
      const stoppRader = await page.evaluate(() => {
        const h = [...document.querySelectorAll('h2')].find((e) =>
          e.textContent.includes('Det här har tagit stopp')
        )
        return h ? h.parentElement.querySelectorAll('li').length : 0
      })

      logg(`[prenumeration ${lage} ${namn}] LCP ${m.lcp} ms, CLS ${m.cls}, orange ${o.n}, plattor ${plattor}`)
      logg(
        `[prenumeration ${lage} ${namn}] stopprader ${stoppRader}, "Säg upp" synlig ${text.includes('Säg upp')}, statusrad "${(text.split('\n').find((r) => r.includes('gratisnivån') || r.includes('förnyas')) || '').slice(0, 60)}"`
      )

      if (lage === 'allt') {
        const dagInaktiv = await page.evaluate(() => {
          const b = [...document.querySelectorAll('[role=radio]')].find((e) => e.textContent.trim() === 'Dag')
          return b ? b.disabled : null
        })
        const primarInaktiv = await page.evaluate(() => {
          const b = [...document.querySelectorAll('button')].find((e) => e.textContent.startsWith('Byt till'))
          return b ? b.disabled : null
        })
        logg(`[prenumeration allt ${namn}] dagläget inaktivt ${dagInaktiv}, primär inaktiv vid oförändrad längd ${primarInaktiv}`)

        await page.evaluate(() => {
          const b = [...document.querySelectorAll('[role=radio]')].find((e) => e.textContent.trim() === 'Månad')
          b?.click()
        })
        await new Promise((r) => setTimeout(r, 500))
        const efterByte = await page.evaluate(() => {
          const b = [...document.querySelectorAll('button')].find((e) => e.textContent.startsWith('Byt till'))
          return { text: b?.textContent, disabled: b?.disabled, sida: document.body.innerText }
        })
        logg(
          `[prenumeration allt ${namn}] efter val Månad: knapp "${efterByte.text}", inaktiv ${efterByte.disabled}, besparingsrad ${/Sparar \d+ kr mot fyra veckor/.test(efterByte.sida)}`
        )
        await skarmdump(page, `08-prenumeration-allt-langdval-${namn}`)
      }

      if (lage === 'gratis') {
        await page.evaluate(() => {
          const b = [...document.querySelectorAll('button')].find((e) => e.textContent.trim() === 'Se alla paket')
          b?.click()
        })
        await new Promise((r) => setTimeout(r, 600))
        const oppnad = await page.evaluate(() => document.body.innerText.includes('Alla paket'))
        logg(`[prenumeration gratis ${namn}] "Se alla paket" öppnar kortraden: ${oppnad}`)
        await skarmdump(page, `09-prenumeration-gratis-alla-paket-${namn}`)
      }

      await page.close()
    }
  }

  fs.writeFileSync(path.join(UT, 'resultat.txt'), resultat.join('\n') + '\n')
} finally {
  await browser.close()
}
