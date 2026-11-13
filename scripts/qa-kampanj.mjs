// scripts/qa-kampanj.mjs
//
// Klicktest för Black Week och Cyber Monday (lib/kampanj) i riktig Chrome,
// en skärmdump per steg i docs/qa/kampanj/ (gitignorerade QA-bilder läggs
// i SCRATCH, se feedback_arbetskopior_och_qa_bilder).
//
//   SCRATCH=<tmp> BAS=http://localhost:3471 node scripts/qa-kampanj.mjs <flöde> <bredd>
//     flöde  publikt | gratis | betalt | registrering | installningar
//     bredd  412 (Pixel 7) | 1280
//
// publikt: /priser och / utan inloggning, med besökarens klocka flyttad via
//   localStorage 'kampanj_nu' till före, Black Week, Cyber Monday och efter.
// gratis/betalt: servern startas med KAMPANJ_NU. Raden i inloggat,
//   köpsteget, samtyckestexten och (gratis) hela vägen till Stripes testkassa.
// registrering: rutan för mejlvalet finns och är oikryssad.
// installningar: växeln för erbjudanden finns och sparar.

import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const BAS = process.env.BAS || 'http://localhost:3471'
const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
const UT = path.join(SCRATCH, 'qa-kampanj')
fs.mkdirSync(UT, { recursive: true })
const RESULTAT = path.join(UT, 'resultat.jsonl')
const KONTON = fs.existsSync(`${SCRATCH}/qa-kampanj-konton.json`) ? JSON.parse(fs.readFileSync(`${SCRATCH}/qa-kampanj-konton.json`, 'utf8')) : {}
const [floede, bredd] = process.argv.slice(2)
const prefix = `${floede}-${bredd}`
let nr = 0
const fel = []
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))

function logg(steg, ok, data = {}) {
  fs.appendFileSync(RESULTAT, JSON.stringify({ tid: new Date().toISOString(), floede: prefix, steg, ok, ...data }) + '\n')
  console.log(`${ok === null ? 'INFO' : ok ? 'OK  ' : 'FEL '} ${steg} ${JSON.stringify(data).slice(0, 300)}`)
  if (ok === false) fel.push(steg)
}
async function bild(p, namn, hel = false) {
  nr += 1
  await p.screenshot({ path: path.join(UT, `${prefix}-${String(nr).padStart(2, '0')}-${namn}.png`), fullPage: hel }).catch(() => {})
}
async function ga(p, u) {
  await p.goto(BAS + u, { waitUntil: 'networkidle2', timeout: 180000 })
  await vanta(700)
}
async function avvisaKakor(p) {
  await p.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((e) => /^Avvisa$/.test(e.innerText.trim()) && e.offsetParent !== null)
    b?.click()
  })
  await vanta(300)
}
/** Synlig text i elementen som matchar selektorn. */
const synligText = (p, sel) =>
  p.evaluate((sel) => [...document.querySelectorAll(sel)].filter((e) => e.offsetParent !== null || getComputedStyle(e).display !== 'none').map((e) => e.innerText.trim()).filter(Boolean), sel)

async function loggaIn(p, konto) {
  await ga(p, '/login')
  await p.waitForSelector('input[type="email"]')
  await p.type('input[type="email"]', konto.email)
  await p.type('input[type="password"]', konto.password)
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {}), p.click('button[type="submit"]')])
  await p.waitForFunction(() => !location.pathname.startsWith('/login'), { timeout: 90000 })
  await vanta(1200)
  await avvisaKakor(p)
}

const LAGEN = {
  fore: '2026-11-22T23:59:00+01:00',
  bw: '2026-11-23T10:00:00+01:00',
  cm: '2026-11-30T10:00:00+01:00',
  efter: '2026-12-01T00:01:00+01:00',
}

async function publikt(browser, mobil) {
  for (const [lage, nu] of Object.entries(LAGEN)) {
    const p = await nySida(browser, mobil)
    await p.evaluateOnNewDocument((nu) => {
      try { localStorage.setItem('kampanj_nu', nu) } catch {}
    }, nu)
    await ga(p, '/priser')
    await avvisaKakor(p)
    const attr = await p.evaluate(() => document.documentElement.getAttribute('data-kampanj'))
    const rad = await p.evaluate(() => [...document.querySelectorAll('.kampanj-rad')].filter((e) => e.offsetParent !== null).map((e) => e.innerText.replace(/\s+/g, ' ').trim()))
    const pris = await p.evaluate(() => document.querySelector('.pub-pris')?.innerText.replace(/\s+/g, ' ').trim())
    const knapp = await p.evaluate(() => document.querySelector('[data-primar]')?.innerText.replace(/\s+/g, ' ').trim())
    const vantat = { fore: [null, 0, '149 kr'], bw: ['black-week-2026', 1, '99 kr'], cm: ['cyber-monday-2026', 1, '49 kr'], efter: [null, 0, '149 kr'] }[lage]
    logg(`${lage}: data-kampanj`, attr === vantat[0], { attr })
    logg(`${lage}: raden`, rad.length === vantat[1], { rad })
    logg(`${lage}: priset`, !!pris && pris.startsWith(vantat[2]), { pris })
    logg(`${lage}: knappen`, !!knapp && (lage === 'bw' ? knapp.includes('99 kr') : lage === 'cm' ? knapp.includes('49 kr') : knapp.includes('149 kr')), { knapp })
    await bild(p, `priser-${lage}`)
    if (lage === 'bw' || lage === 'cm') {
      await ga(p, '/')
      await avvisaKakor(p)
      await bild(p, `start-${lage}`)
    }
    // CLS: raden ska finnas från första målningen, inget skift.
    const cls = await p.evaluate(
      () =>
        new Promise((res) => {
          let v = 0
          new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) v += e.value })).observe({ type: 'layout-shift', buffered: true })
          setTimeout(() => res(v), 800)
        })
    )
    logg(`${lage}: CLS`, cls < 0.01, { cls })
    await p.close()
  }
}

async function inloggat(browser, mobil, kontoNamn) {
  const konto = KONTON[kontoNamn]
  if (!konto) throw new Error(`konto ${kontoNamn} saknas, kör qa-kampanj-konton.mjs skapa`)
  const p = await nySida(browser, mobil)
  await loggaIn(p, konto)
  await ga(p, '/dashboard')
  const rad = await p.evaluate(() => document.body.innerText.includes('Nej tack'))
  logg('raden i inloggat', kontoNamn === 'gratis' ? rad : !rad, { rad })
  await bild(p, 'hemvy')

  await ga(p, '/dashboard/valj-spar?paket=all_month&steg=kop&plats=kampanjrad')
  const text = await p.evaluate(() => document.body.innerText)
  const harKampanj = text.includes('99 kr första månaden') && text.includes('Till betalning, 99 kr')
  logg('köpsteget visar rätt pris', kontoNamn === 'gratis' ? harKampanj : text.includes('Till betalning, 149 kr') && !harKampanj, {})
  const samtycke = await p.evaluate(() => document.querySelector('input[type="checkbox"]')?.closest('label')?.innerText)
  logg('samtycket', kontoNamn === 'gratis' ? /99 kr dras i dag, sedan 149 kr/.test(samtycke ?? '') : /149 kr dras varje månad/.test(samtycke ?? ''), { samtycke })
  await bild(p, 'kopsteg', true)

  if (kontoNamn === 'gratis') {
    // Fel kampanj från klienten ska ge 409 prisAndrat, aldrig en kassa.
    const svar = await p.evaluate(async () => {
      const r = await fetch('/api/stripe/create-plan-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'all_month', consent: true, kampanj: null, source: 'qa' }) })
      return { status: r.status, json: await r.json() }
    })
    logg('fel pris ger 409 prisAndrat', svar.status === 409 && svar.json.prisAndrat === true && svar.json.kampanj?.nyckel === 'black-week-2026', { status: svar.status, fel: svar.json.error })

    await p.click('input[type="checkbox"]')
    await vanta(300)
    await Promise.all([
      p.waitForFunction(() => location.host.includes('stripe.com'), { timeout: 60000 }).catch(() => {}),
      p.evaluate(() => [...document.querySelectorAll('button')].find((b) => /Till betalning/.test(b.innerText))?.click()),
    ])
    await vanta(4000)
    const stripeText = await p.evaluate(() => document.body.innerText)
    logg('Stripes kassa visar 99 kr att betala', /99,00|99 kr|SEK 99|99,00 kr/.test(stripeText) && /Black Week/i.test(stripeText), { url: p.url().slice(0, 60) })
    await bild(p, 'stripe-kassa')
  }
  await p.close()
}

async function registrering(browser, mobil) {
  const p = await nySida(browser, mobil)
  await ga(p, '/register')
  await avvisaKakor(p)
  const ruta = await p.evaluate(() => {
    const l = [...document.querySelectorAll('label')].find((e) => /Mejla mig erbjudanden/.test(e.innerText))
    return l ? { text: l.innerText.trim(), ikryssad: l.querySelector('input')?.checked } : null
  })
  logg('rutan för mejlvalet finns och är oikryssad', !!ruta && ruta.ikryssad === false, ruta ?? {})
  await bild(p, 'registrering', true)
  await p.close()
}

async function installningar(browser, mobil) {
  const p = await nySida(browser, mobil)
  await loggaIn(p, KONTON.gratis)
  await ga(p, '/dashboard/installningar')
  const finns = await p.evaluate(() => document.body.innerText.includes('Erbjudanden och tips på mejl'))
  logg('växeln finns', finns)
  const fore = await p.evaluate(() => document.querySelector('[aria-label="Ta emot erbjudanden och tips"]')?.getAttribute('aria-checked'))
  await p.click('[aria-label="Ta emot erbjudanden och tips"]')
  await vanta(1500)
  const efter = await p.evaluate(() => document.querySelector('[aria-label="Ta emot erbjudanden och tips"]')?.getAttribute('aria-checked'))
  logg('växeln byter läge', fore !== efter, { fore, efter })
  await bild(p, 'installningar')
  await p.close()
}

async function nySida(browser, mobil) {
  const p = await browser.newPage()
  await p.setViewport(mobil ? { width: 412, height: 915, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true } : { width: 1280, height: 860, deviceScaleFactor: 1 })
  p.on('pageerror', (e) => logg('sidfel', false, { fel: String(e).slice(0, 300) }))
  return p
}

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const mobil = bredd === '412'
try {
  if (floede === 'publikt') await publikt(browser, mobil)
  else if (floede === 'gratis' || floede === 'betalt') await inloggat(browser, mobil, floede)
  else if (floede === 'registrering') await registrering(browser, mobil)
  else if (floede === 'installningar') await installningar(browser, mobil)
  else throw new Error('okänt flöde')
} finally {
  await browser.close()
}
console.log(fel.length ? `\n${fel.length} FEL: ${fel.join(', ')}` : '\nAllt OK')
process.exit(fel.length ? 1 : 0)
