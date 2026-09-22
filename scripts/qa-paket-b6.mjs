// scripts/qa-paket-b6.mjs
// Klicktest av ångerrättssamtycket i kassan (B6), Pixel 7, riktig Chrome.
//
//   node scripts/qa-paket-b6.mjs
//
// Kräver en server på 3106 och ett konto i /tmp/qa-b6.json.
//
// Testet klickar på köpknappen. Det anropar aldrig API:t själv: lärdomen från
// B5 är att ett klicktest som kringgår knappen testar API:t och inte flödet.
// Det som ska bevisas per paket:
//
//   1. Knappen är spärrad innan kryssrutan är ikryssad.
//   2. Cookie-bannern täcker inte knappen på Pixel 7.
//   3. Ett riktigt klick navigerar webbläsaren till checkout.stripe.com.
//   4. Sessionen bakom den adressen bär angerratt_samtycke_at och texten.
//
// Ingenting betalas. Vi läser sessionen med STRIPE_SECRET_KEY och vänder.

import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const BAS = process.env.QA_BAS || 'http://localhost:3106'
const UT = 'docs/qa/qa-paket-b6'
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((r) => r.includes('=') && !r.trim().startsWith('#'))
    .map((r) => {
      const i = r.indexOf('=')
      return [r.slice(0, i).trim(), r.slice(i + 1).trim()]
    })
)
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY

const konto = JSON.parse(fs.readFileSync('/tmp/qa-b6.json', 'utf8'))
fs.mkdirSync(UT, { recursive: true })

const PIXEL7 = { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true }

// Samma text som kryssrutan renderar (PAKETSKARM.samtycke i program.ts).
const SAMTYCKESTEXT =
  'Starta direkt. Jag förstår att ångerrätten på fjorton dagar inte gäller när innehållet påbörjats.'

const PAKET = [
  { nyckel: 'cv_week', namn: 'CV-veckan' },
  { nyckel: 'all_day', namn: 'Allt-dagen' },
  { nyckel: 'all_month', namn: 'Allt-månaden' },
]

const resultat = []
function logg(namn, ok, not = '') {
  resultat.push({ namn, ok, not })
  console.log(`${ok ? 'OK ' : 'FEL'}  ${namn}${not ? '  ' + not : ''}`)
}

async function skott(page, namn) {
  const fil = path.join(UT, `${namn}.png`)
  await page.screenshot({ path: fil, fullPage: false })
  console.log('     bild:', fil)
  return fil
}

async function loggaIn(page) {
  await page.goto(`${BAS}/login`, { waitUntil: 'networkidle2' })
  await page.waitForSelector('input[type="email"]', { timeout: 20000 })
  await page.type('input[type="email"]', konto.email)
  await page.type('input[type="password"]', konto.password)
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ])
  await new Promise((r) => setTimeout(r, 2500))
}

/**
 * Hittar köpknappen i FlowShell-foten. Primärknappen ligger i foten, och på
 * köpsteget bär den betalningstexten. Vi letar i foten först och faller
 * tillbaka på texten, så att "Börja gratis" aldrig kan råka bli träffen.
 */
async function hittaKopknapp(page) {
  return page.evaluateHandle(() => {
    const knappar = [...document.querySelectorAll('button')].filter((b) => {
      const r = b.getBoundingClientRect()
      return r.width > 0 && r.height > 0
    })
    const köp = knappar.filter((b) => /betala|köp|starta veckan|till betalning|starta/i.test(b.textContent || ''))
    if (köp.length) return köp[0]
    // Fotens primär är den nedersta breda knappen som inte är gratisvägen.
    const breda = knappar
      .filter((b) => b.getBoundingClientRect().width > 200)
      .filter((b) => !/gratis|avvisa|acceptera|läs mer/i.test(b.textContent || ''))
    return breda[breda.length - 1] ?? null
  })
}

/** Cookie-bannern måste bort ur vägen som en riktig besökare gör: klicka. */
async function svaraCookies(page) {
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) =>
      /acceptera/i.test(x.textContent || '')
    )
    b?.click()
  })
  await new Promise((r) => setTimeout(r, 600))
}

/**
 * Täcker något köpknappen? Vi frågar webbläsaren vad som faktiskt ligger
 * överst i knappens mittpunkt. Det är sanningen, inte z-index i en fil.
 */
async function taecksAv(page, handle) {
  return page.evaluate((btn) => {
    if (!btn) return { fel: 'ingen knapp' }
    const r = btn.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const topp = document.elementFromPoint(x, y)
    if (!topp) return { fel: 'inget element i punkten' }
    const egen = btn.contains(topp) || topp.contains(btn)
    let cookie = null
    let el = topp
    while (el) {
      if (el.classList?.contains('cookie-banner-container')) {
        cookie = true
        break
      }
      el = el.parentElement
    }
    return {
      egen,
      cookie: Boolean(cookie),
      toppTagg: topp.tagName,
      toppKlass: (topp.className || '').toString().slice(0, 120),
      knappRect: { top: Math.round(r.top), height: Math.round(r.height) },
    }
  }, handle)
}

async function hamtaSession(sessionId) {
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${STRIPE_KEY}` },
  })
  if (!res.ok) throw new Error(`Stripe ${res.status}: ${await res.text()}`)
  return res.json()
}

async function testaPaket(page, paket, cookieRuta, forstaGangen) {
  // Föregående paket lämnade webbläsaren på checkout.stripe.com. Stripes sida
  // håller uppkopplingar öppna, så networkidle2 slår aldrig till om vi går
  // därifrån direkt. Vi vänder hem via about:blank först.
  if (page.url().includes('checkout.stripe.com')) {
    await page.goto('about:blank', { waitUntil: 'load' })
  }

  // Skärm 1.2 nås med ?paket=, som förväljer spår och längd.
  await page.goto(`${BAS}/dashboard/valj-spar?paket=${paket.nyckel}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await new Promise((r) => setTimeout(r, 1200))
  await new Promise((r) => setTimeout(r, 1500))

  // Cookie-bannern mäts i första omgången, alltså i den nya sessionen där
  // den faktiskt visas. Det är den situation saas-leads prio 1 handlar om.
  if (forstaGangen) {
    const bannerFinns = await page.evaluate(() =>
      Boolean(document.querySelector('.cookie-banner-container'))
    )
    const knapp11 = await hittaKopknapp(page)
    const t11 = await taecksAv(page, knapp11)
    logg(
      'Pixel 7 skärm 1.1: cookie-bannern täcker inte primärknappen',
      t11.egen === true && t11.cookie === false,
      JSON.stringify({ bannerFinns, ...t11 })
    )
    cookieRuta.push({ skarm: '1.1', bannerFinns, ...t11 })
    await skott(page, 'cookie-1-skarm-1.1-med-banner')
  }

  // Skärm 1.1 är spårvalet. Köpsteget nås genom att klicka primärknappen.
  const påKopsteg = async () =>
    page.evaluate((t) => document.body.innerText.includes(t), SAMTYCKESTEXT)

  if (!(await påKopsteg())) {
    const primar = await hittaKopknapp(page)
    await page.evaluate((b) => b?.click(), primar)
    await new Promise((r) => setTimeout(r, 1800))
  }

  const kopsteg = await påKopsteg()
  logg(`${paket.namn}: skärm 1.2 med samtyckesrutan`, kopsteg)
  await skott(page, `${paket.nyckel}-1-kopsteg`)

  if (!kopsteg) return

  // 1. Knappen ska vara spärrad innan rutan är ikryssad.
  const spärrad = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) =>
      /betala|köp|starta/i.test(x.textContent || '')
    )
    return b ? b.disabled || b.getAttribute('aria-disabled') === 'true' : null
  })
  logg(`${paket.namn}: köpknappen spärrad utan samtycke`, spärrad === true, `disabled=${spärrad}`)

  // 2. Cookie-bannern får inte ligga över knappen.
  let knapp = await hittaKopknapp(page)
  const täckning = await taecksAv(page, knapp)
  const fri = täckning.egen === true && täckning.cookie === false
  logg(
    `${paket.namn}: cookie-bannern täcker inte köpknappen`,
    fri,
    JSON.stringify(täckning)
  )
  cookieRuta.push({ skarm: '1.2', paket: paket.namn, ...täckning })
  if (forstaGangen) await skott(page, 'cookie-2-skarm-1.2-med-banner')

  // Kryssa i samtycket.
  await page.evaluate(() => {
    const ruta = document.querySelector('input[type="checkbox"]')
    ruta?.click()
  })
  await new Promise((r) => setTimeout(r, 500))
  await skott(page, `${paket.nyckel}-2-samtycke-ikryssat`)

  // 3. KLICKA knappen. Ingen fetch härifrån.
  knapp = await hittaKopknapp(page)
  await page.evaluate((b) => b.click(), knapp)

  let url = ''
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1000))
    url = page.url()
    if (url.includes('checkout.stripe.com')) break
  }
  const påStripe = url.includes('checkout.stripe.com')
  logg(`${paket.namn}: klicket navigerar till checkout.stripe.com`, påStripe, url.slice(0, 120))

  if (påStripe) {
    await new Promise((r) => setTimeout(r, 3000))
    await skott(page, `${paket.nyckel}-3-stripe`)

    // 4. Sessionens metadata. Id:t står i adressen efter /c/pay/.
    const m = url.match(/\/c\/pay\/(cs_[^#?/]+)/) || url.match(/(cs_[A-Za-z0-9_]+)/)
    const sessionId = m ? m[1] : null
    if (!sessionId) {
      logg(`${paket.namn}: session-id ur adressen`, false, url.slice(0, 160))
    } else {
      try {
        const s = await hamtaSession(sessionId)
        const vid = s.metadata?.angerratt_samtycke_at
        const text = s.metadata?.angerratt_samtycke_text
        logg(
          `${paket.namn}: sessionens metadata bär angerratt_samtycke_at`,
          Boolean(vid) && !Number.isNaN(Date.parse(vid || '')),
          String(vid)
        )
        logg(
          `${paket.namn}: metadatatexten är kryssrutans exakta text`,
          text === SAMTYCKESTEXT,
          String(text).slice(0, 90)
        )
        resultat.push({
          namn: `${paket.namn}: session`,
          ok: true,
          not: JSON.stringify({ id: s.id, mode: s.mode, status: s.status, vid, text }),
        })
      } catch (e) {
        logg(`${paket.namn}: kunde läsa sessionen i Stripe`, false, String(e.message).slice(0, 160))
      }
    }
  }
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

const cookieRuta = []
try {
  // En inloggning för alla tre paketen. Sidan återanvänds, och mellan varje
  // paket går vi tillbaka in i flödet via ?paket=.
  const page = await browser.newPage()
  await page.setViewport(PIXEL7)
  await page.setUserAgent(
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
  )
  await loggaIn(page)

  let forst = true
  for (const paket of PAKET) {
    console.log(`\n=== ${paket.namn} ===`)
    try {
      await testaPaket(page, paket, cookieRuta, forst)
    } catch (e) {
      logg(`${paket.namn}: körningen gick igenom utan undantag`, false, String(e.message).slice(0, 160))
    }
    // Cookie-bannern svaras efter första mätningen, annars mäter vi samma
    // sak tre gånger och testar aldrig flödet med bannern borta.
    if (forst) await svaraCookies(page)
    forst = false
  }
} finally {
  await browser.close()
}

const gröna = resultat.filter((r) => r.ok).length
console.log(`\n${gröna} av ${resultat.length} kontroller gröna`)
fs.writeFileSync(
  path.join(UT, 'resultat.json'),
  JSON.stringify({ resultat, cookieRuta }, null, 2)
)
