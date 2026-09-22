// scripts/qa-paket-d1.mjs
// Klicktest i riktig webbläsare av prissidan, spårvalet, köpsteget och
// kontosidan (D1, docs/design/spec-prissida-2026-09-22.html).
//
//   node scripts/qa-paket-d1-konton.mjs skapa
//   node scripts/qa-paket-d1.mjs
//   node scripts/qa-paket-d1-konton.mjs radera
//
// Kräver en server på 3108 som kör .next-d1. Skärmdumpar till
// docs/qa/qa-paket-d1/, resultat i resultat.json.

import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const BAS = process.env.QA_BAS || 'http://localhost:3108'
const UT = 'docs/qa/qa-paket-d1'
const CHROME =
  process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const KONTON = JSON.parse(
  fs.readFileSync(process.env.QA_KONTON_FIL || 'scripts/.qa-d1-konton.json', 'utf8')
)

fs.mkdirSync(UT, { recursive: true })
for (const f of fs.readdirSync(UT)) if (f.endsWith('.png')) fs.unlinkSync(path.join(UT, f))

const PIXEL7 = { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const DESKTOP = { width: 1280, height: 900, deviceScaleFactor: 1 }

const resultat = []
let bildNr = 0
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))

function logg(namn, ok, not = '') {
  resultat.push({ namn, ok: !!ok, not })
  console.log(`${ok ? 'OK ' : 'FEL'}  ${namn}${not ? '  ' + not : ''}`)
}

async function skott(page, namn, fullPage = false) {
  bildNr += 1
  const fil = path.join(UT, `${String(bildNr).padStart(2, '0')}-${namn}.png`)
  await page.screenshot({ path: fil, fullPage })
  console.log('     bild:', fil)
  return fil
}

async function text(page) {
  return page.evaluate(() => document.body.innerText)
}

async function synlig(page, selector) {
  return page.evaluate((s) => {
    const el = document.querySelector(s)
    if (!el) return false
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'
  }, selector)
}

async function klickaText(page, tag, innehall) {
  const ok = await page.evaluate(
    (t, s) => {
      const el = Array.from(document.querySelectorAll(t)).find((e) =>
        (e.innerText || '').trim().startsWith(s)
      )
      if (!el) return false
      el.scrollIntoView({ block: 'center' })
      el.click()
      return true
    },
    tag,
    innehall
  )
  return ok
}

async function loggaIn(context, konto, viewport) {
  const page = await context.newPage()
  page.setDefaultNavigationTimeout(90000)
  await page.setViewport(viewport)
  await page.goto(`${BAS}/login`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('input[type="email"]', { timeout: 30000 })
  await page.type('input[type="email"]', konto.email)
  await page.type('input[type="password"]', konto.password)
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ])
  await vanta(2000)
  await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).find((e) => e.innerText.trim() === 'Acceptera'); b?.click() })
  await vanta(500)
  return page
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--lang=sv-SE'],
})

try {
  /* ------------------------------------------------ 1. /priser utloggad */
  {
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(90000)
    await page.setViewport(DESKTOP)
    await page.goto(`${BAS}/priser`, { waitUntil: 'networkidle2' })
    await vanta(1200)
    await skott(page, 'priser-desktop-hero')
    await skott(page, 'priser-desktop-hela', true)

    const t = await text(page)
    logg('desktop: H1 ur specen', t.includes('En vecka som bär hela jobbsöket.'))
    logg('desktop: tre löften', /7 dagar/.test(t) && /79 kr/.test(t) && /1 klick/.test(t))
    logg(
      'desktop: tre knappar Börja',
      t.includes('Börja CV-veckan') && t.includes('Börja Testveckan') && t.includes('Börja med allt')
    )
    logg('desktop: "Paket 1 av 3" dold', !/paket 1 av 3/i.test(t))
    logg('desktop: värdemening desktop', t.includes('Få CV:t genom rekryteringssystemet och skriv'))
    logg('desktop: fem raderna på Testveckan', t.includes('Se att du blir bättre'))
    logg('desktop: längdval 49/99/149/299', /\b49\b[\s\S]*\b99\b[\s\S]*\b149\b[\s\S]*\b299\b/.test(t))
    logg('desktop: tabellen med ord', t.includes('Alla 41') && t.includes('Hela rapporten') && t.includes('Ingår inte'))
    logg('desktop: fem funktionskort', ['CV-analysen', 'Personliga brev', 'Rekryteringstester', 'Matchade jobb', 'Jobbcoachen'].every((r) => t.includes(r)))
    logg('desktop: hjälpredan per paket', t.includes('Så här guidar vi dig igenom det'))
    logg('desktop: förtroende med kr', t.includes('Priser i kronor, moms ingår'))
    logg('desktop: FAQ fyra frågor', t.includes('Varför säljer ni veckor och inte månader?') && t.includes('Hur säger jag upp?'))
    logg('desktop: inga talstreck', !/—/.test(t))
    const fontDisplay = await page.evaluate(() => getComputedStyle(document.querySelector('h1')).fontFamily)
    logg('desktop: H1 i Schibsted Grotesk', /Schibsted/i.test(fontDisplay), fontDisplay)
    const alltBg = await page.evaluate(() => {
      const s = document.querySelector('section[aria-label="Allt"]')
      return s ? getComputedStyle(s).backgroundColor : ''
    })
    logg('desktop: Allt-kortet i ink-1', alltBg === 'rgb(28, 25, 23)', alltBg)

    // Utloggad knapp går till registreringen med paketet.
    await klickaText(page, 'button', 'Börja CV-veckan')
    await vanta(2500)
    logg('utloggad: Börja CV-veckan går till /registrera?paket=cv_week', page.url().includes('/registrera?paket=cv_week'), page.url())
    await skott(page, 'registrera-med-paket-desktop')

    // Mobil
    await page.setViewport(PIXEL7)
    await page.goto(`${BAS}/priser`, { waitUntil: 'networkidle2' })
    await vanta(1200)
    await skott(page, 'priser-mobil-topp')
    await skott(page, 'priser-mobil-hela', true)
    const tm = await text(page)
    logg('mobil: numrerade paket', /paket 1 av 3/i.test(tm) && /paket 3 av 3/i.test(tm))
    logg('mobil: kortare värdemening', tm.includes('För dig som vill få CV:t genom rekryteringssystemet'))
    logg('mobil: bara tre rader på CV-kortet', !tm.includes('Bli hittad på LinkedIn'))
    logg('mobil: löftena dolda', !/7 dagar\s*\n?allt öppet/.test(tm))
    logg('mobil: ankarraden', tm.includes('Gratisnivån ↓'))
    const bodyScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
    logg('mobil: ingen horisontell body-scroll', bodyScroll)
    await page.close()
  }

  /* --------------------------------------------- 2. gratis: köpvägen */
  {
    const ctx = await browser.createBrowserContext()
    const m = await loggaIn(ctx, KONTON.gratis, PIXEL7)
    logg('gratis: inloggad', !m.url().includes('/login'), m.url())

    await m.goto(`${BAS}/priser`, { waitUntil: 'networkidle2' })
    await vanta(1500)
    await klickaText(m, 'button', 'Börja CV-veckan')
    await vanta(3000)
    logg('gratis: Börja CV-veckan går till valj-spar?paket=cv_week', m.url().includes('/dashboard/valj-spar?paket=cv_week'), m.url())
    await vanta(800)
    await skott(m, 'sparval-1-1-cv-vald')
    let t = await text(m)
    logg('1.1: frågan', t.includes('Vad ska du göra den här veckan?'))
    logg('1.1: tre kort', t.includes('Få CV:t genom och skriv personliga brev') && t.includes('Var förberedd på testdagen') && t.includes('Allt ur båda, plus jobb som hittar dig'))
    logg('1.1: primär Fortsätt med CV-veckan', t.includes('Fortsätt med CV-veckan'))
    logg('1.1: sekundär Börja gratis i stället', t.includes('Börja gratis i stället'))
    const valdCv = await m.evaluate(() => Array.from(document.querySelectorAll('[role="radio"]')).map((r) => r.getAttribute('aria-checked')))
    logg('1.1: CV förvalt', valdCv[0] === 'true', valdCv.join(','))

    // Välj Allt, primären följer med.
    await m.evaluate(() => { const r = document.querySelectorAll('[role="radiogroup"] [role="radio"]'); r[r.length - 1].click() })
    await vanta(400)
    t = await text(m)
    logg('1.1: Allt valt ger Fortsätt med Allt', t.includes('Fortsätt med Allt'))
    await skott(m, 'sparval-1-1-allt-vald')

    // Tillbaka till CV, vidare till köpsteget.
    await m.evaluate(() => { document.querySelectorAll('[role="radiogroup"] [role="radio"]')[0].click() })
    await vanta(300)
    await klickaText(m, 'footer button', 'Fortsätt med CV-veckan')
    await vanta(2500)
    t = await text(m)
    logg('1.2: rubrik CV-veckan, från i kväll', t.includes('CV-veckan, från i kväll'))
    logg('1.2: fyra rader', t.includes('Hela CV-analysen') && t.includes('41 CV-mallar') && t.includes('LinkedIn-profilen'))
    logg('1.2: villkorsraderna', t.includes('Förnyas') && t.includes('Uppsägning') && t.includes('Ångerrätt'))
    logg('1.2: första steget CV', t.includes('Första steget: ladda upp CV:t'))
    logg('1.2: Vill du ha allt i stället', /vill du ha allt i stället?/i.test(t))
    logg('1.2: Till betalning, 79 kr', t.includes('Till betalning, 79 kr'))
    let knapp = await m.evaluate(() => {
      const b = Array.from(document.querySelectorAll('footer button')).find((e) => e.innerText.startsWith('Till betalning'))
      return b ? b.disabled : null
    })
    logg('1.2: knappen spärrad utan samtycke', knapp === true)
    await skott(m, 'kopsteg-1-2-cv')
    await skott(m, 'kopsteg-1-2-cv-hela', true)

    await m.evaluate(() => document.querySelector('input[type="checkbox"]')?.click())
    await vanta(300)
    knapp = await m.evaluate(() => {
      const b = Array.from(document.querySelectorAll('footer button')).find((e) => e.innerText.startsWith('Till betalning'))
      return b ? b.disabled : null
    })
    logg('1.2: knappen öppen efter samtycke', knapp === false)
    await skott(m, 'kopsteg-1-2-cv-samtyckt')

    // Byt till Allt-månaden i köpsteget.
    await m.evaluate(() => {
      const b = Array.from(document.querySelectorAll('[role="radiogroup"] [role="radio"]')).find((e) => /149/.test(e.innerText))
      b?.click()
    })
    await vanta(500)
    t = await text(m)
    logg('1.2: Allt-månaden ger rubrik Allt, från i kväll', t.includes('Allt, från i kväll'))
    logg('1.2: Till betalning, 149 kr', t.includes('Till betalning, 149 kr'))
    await skott(m, 'kopsteg-1-2-allt-manad')

    // Testveckan via ?paket.
    await m.goto(`${BAS}/dashboard/valj-spar?paket=test_week`, { waitUntil: 'networkidle2' })
    await vanta(1200)
    t = await text(m)
    logg('1.1 test: Fortsätt med Testveckan förvalt', t.includes('Fortsätt med Testveckan'))
    await klickaText(m, 'footer button', 'Fortsätt med Testveckan')
    await vanta(2500)
    t = await text(m)
    logg('1.2 test: Testveckan, från i kväll', t.includes('Testveckan, från i kväll'))
    logg('1.2 test: Första steget matrislogik', t.includes('Första steget: matrislogik, grundnivå'))
    await skott(m, 'kopsteg-1-2-test')

    // Kontosidan gratis, mobil.
    await m.goto(`${BAS}/dashboard/profil/prenumeration`, { waitUntil: 'networkidle2' })
    await vanta(1500)
    t = await text(m)
    logg('konto gratis: statusrad', t.includes('Du är på gratisnivån'))
    logg('konto gratis: tre Börja-knappar', t.includes('Börja CV-veckan') && t.includes('Börja Testveckan') && t.includes('Börja med allt'))
    await skott(m, 'konto-gratis-mobil')
    await skott(m, 'konto-gratis-mobil-hela', true)

    // Desktop: sidomenyn och profilmenyn.
    const d = await ctx.newPage()
    d.setDefaultNavigationTimeout(90000)
    await d.setViewport(DESKTOP)
    await d.goto(`${BAS}/dashboard/profil/prenumeration`, { waitUntil: 'networkidle2' })
    await vanta(1500)
    t = await text(d)
    logg('sidomeny: Profil och prenumeration', t.includes('Profil och prenumeration'))
    await skott(d, 'konto-gratis-desktop')
    await d.click('button[aria-label="Konto och inställningar"]').catch(() => {})
    await vanta(500)
    t = await text(d)
    logg('profilmeny: Köp eller byt paket', t.includes('Köp eller byt paket'))
    await skott(d, 'profilmeny-desktop')

    await d.goto(`${BAS}/dashboard/valj-spar?paket=cv_week`, { waitUntil: 'networkidle2' })
    await vanta(1200)
    await skott(d, 'sparval-1-1-desktop')
    await klickaText(d, 'footer button', 'Fortsätt med CV-veckan')
    await vanta(2500)
    await skott(d, 'kopsteg-1-2-desktop')
    await ctx.close()
  }

  /* --------------------------------------------- 3. CV-veckan: kontosidan */
  {
    const ctx = await browser.createBrowserContext()
    const m = await loggaIn(ctx, KONTON.cv, PIXEL7)
    await m.goto(`${BAS}/dashboard/profil/prenumeration`, { waitUntil: 'networkidle2' })
    await vanta(1500)
    const t = await text(m)
    logg('konto cv: statusrad CV-veckan', t.includes('CV-veckan, förnyas'))
    logg('konto cv: Du har det här paketet', t.includes('Du har det här paketet'))
    logg('konto cv: Allt med +20 kr', t.includes('+20 kr'))
    logg('konto cv: Byt till Allt', t.includes('Byt till Allt'))
    logg('konto cv: Byt till Testveckan', t.includes('Byt till Testveckan'))
    logg('konto cv: Säg upp', t.includes('Säg upp'))
    await skott(m, 'konto-cv-mobil')
    await skott(m, 'konto-cv-mobil-hela', true)

    const d = await ctx.newPage()
    d.setDefaultNavigationTimeout(90000)
    await d.setViewport(DESKTOP)
    await d.goto(`${BAS}/dashboard/profil/prenumeration`, { waitUntil: 'networkidle2' })
    await vanta(1500)
    await skott(d, 'konto-cv-desktop')

    // Köpsteget med löpande prenumeration: dagen spärrad.
    await m.goto(`${BAS}/dashboard/valj-spar?paket=all_day`, { waitUntil: 'networkidle2' })
    await vanta(1200)
    await klickaText(m, 'footer button', 'Fortsätt med Allt')
    await vanta(2500)
    const dag = await m.evaluate(() => {
      const b = Array.from(document.querySelectorAll('[role="radiogroup"] [role="radio"]')).find((e) => /^49/.test(e.innerText.trim()))
      return b ? b.disabled : null
    })
    logg('köpsteg löpande: dagläget spärrat', dag === true)
    const tk = await text(m)
    logg('köpsteg löpande: förklaring till spärren', tk.includes('går inte att kombinera'))
    await skott(m, 'kopsteg-lopande-dag-sparrad')
    await ctx.close()
  }

  /* --------------------------------------------- 4. Allt: kontosidan */
  {
    const ctx = await browser.createBrowserContext()
    const m = await loggaIn(ctx, KONTON.allt, PIXEL7)
    await m.goto(`${BAS}/dashboard/profil/prenumeration`, { waitUntil: 'networkidle2' })
    await vanta(1500)
    let t = await text(m)
    logg('konto allt: statusrad Allt-veckan', t.includes('Allt-veckan, förnyas'))
    logg('konto allt: Ingår i Allt på spåren', (t.match(/Ingår i Allt/g) || []).length === 2)
    logg('konto allt: Det här har du i dag', t.includes('Det här har du i dag'))
    const dag = await m.evaluate(() => {
      const b = Array.from(document.querySelectorAll('[role="radiogroup"] [role="radio"]')).find((e) => /^49/.test(e.innerText.trim()))
      return b ? b.disabled : null
    })
    logg('konto allt: dagläget inaktivt', dag === true)
    await skott(m, 'konto-allt-mobil')
    await skott(m, 'konto-allt-mobil-hela', true)

    await m.evaluate(() => {
      const b = Array.from(document.querySelectorAll('[role="radiogroup"] [role="radio"]')).find((e) => /149/.test(e.innerText))
      b?.scrollIntoView({ block: 'center' })
      b?.click()
    })
    await vanta(500)
    t = await text(m)
    logg('konto allt: månad ger Byt till Allt-månaden', t.includes('Byt till Allt-månaden'))
    logg('konto allt: besparingen räknad', t.includes('Sparar 247 kr mot fyra veckor i rad'))
    logg('konto allt: Säg upp', t.includes('Säg upp'))
    await skott(m, 'konto-allt-mobil-manad')

    const d = await ctx.newPage()
    d.setDefaultNavigationTimeout(90000)
    await d.setViewport(DESKTOP)
    await d.goto(`${BAS}/dashboard/profil/prenumeration`, { waitUntil: 'networkidle2' })
    await vanta(1500)
    await skott(d, 'konto-allt-desktop')
    await ctx.close()
  }
} finally {
  await browser.close()
  fs.writeFileSync(path.join(UT, 'resultat.json'), JSON.stringify(resultat, null, 2))
  const fel = resultat.filter((r) => !r.ok)
  console.log(`\n${resultat.length - fel.length} OK, ${fel.length} FEL`)
}
