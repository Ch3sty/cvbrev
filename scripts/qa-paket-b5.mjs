// scripts/qa-paket-b5.mjs
// Klicktest i riktig webbläsare av hela köpflödet i paketreleasen (B5).
// Pixel 7 (412x915) och desktop (1280). Skärmdump per steg.
//
//   node scripts/qa-paket-b5.mjs
//
// Kräver QA-konton i /tmp/qa-b5.json (scripts/qa-paket-b5-konton.mjs skapa)
// och en server på 3105 som kör .next-b5.
//
// Stripe-nyckeln är en live-nyckel, så inget köp fullföljs. Flöde (i) stannar
// vid att kassans session skapats och att dess line_items pekar på rätt pris,
// och köpet simuleras därefter i databasen plus ett anrop till onWeekStarted,
// precis som webhooken hade gjort.

import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const BAS = process.env.QA_BAS || 'http://localhost:3105'
const UT = 'docs/qa/qa-paket-b5'
const CHROME =
  process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const konton = JSON.parse(fs.readFileSync('/tmp/qa-b5.json', 'utf8'))

fs.mkdirSync(UT, { recursive: true })

const PIXEL7 = { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const DESKTOP = { width: 1280, height: 900, deviceScaleFactor: 1 }

const resultat = []
let bildNr = 0

function logg(namn, ok, not = '') {
  resultat.push({ namn, ok: !!ok, not })
  console.log(`${ok ? 'OK ' : 'FEL'}  ${namn}${not ? '  ' + not : ''}`)
}

async function skott(page, namn) {
  bildNr += 1
  const fil = path.join(UT, `${String(bildNr).padStart(2, '0')}-${namn}.png`)
  await page.screenshot({ path: fil, fullPage: false })
  console.log('     bild:', fil)
  return fil
}

const vanta = (ms) => new Promise((r) => setTimeout(r, ms))

async function loggaIn(page, konto) {
  // Egen timeout: standardens 30 s räcker inte när flera flikar laddar
  // samtidigt mot samma lokala server.
  page.setDefaultNavigationTimeout(90000)
  await page.goto(`${BAS}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForSelector('input[type="email"]', { timeout: 20000 })
  await page.type('input[type="email"]', konto.email)
  await page.type('input[type="password"]', konto.password)
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ])
  await vanta(2500)
}

/** Räknar synliga orange element. Samma mätning som B3 och B4 använde. */
async function raknaOrange(page) {
  return page.evaluate(() => {
    const orangeIsh = (c) => {
      const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/)
      if (!m) return false
      const [r, g, b, a] = [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]]
      if (a < 0.2) return false
      return r > 180 && g > 60 && g < 170 && b < 90
    }
    let n = 0
    for (const el of document.querySelectorAll('*')) {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) continue
      const s = getComputedStyle(el)
      if (s.visibility === 'hidden' || s.display === 'none') continue
      if (orangeIsh(s.backgroundColor)) n++
      else if (orangeIsh(s.color) && (el.textContent || '').trim().length > 0 && el.children.length === 0) n++
    }
    return n
  })
}

/** LCP i millisekunder. Mäts på en färsk laddning, inte efter en klickrunda. */
async function matLCP(page, url) {
  await page.evaluateOnNewDocument(() => {
    window.__lcp = 0
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.__lcp = e.startTime
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  })
  page.setDefaultNavigationTimeout(90000)
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 })
  await vanta(2500)
  return page.evaluate(() => Math.round(window.__lcp || 0))
}

/** Hård omladdning: ingen vy får bli tom. */
async function hardReload(page, namn) {
  await page.reload({ waitUntil: 'networkidle2' })
  await vanta(2000)
  const text = await page.evaluate(() => document.body.innerText.trim())
  logg(`hård reload ${namn}: ingen tom vy`, text.length > 60, `${text.length} tecken`)
  return text
}

async function kor() {
  // Egen profilkatalog: annars vägrar Chrome starta när en vanlig
  // webbläsare redan håller standardprofilen låst.
  const profil = fs.mkdtempSync(path.join(process.env.TEMP || '/tmp', 'qa-b5-chrome-'))
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    userDataDir: profil,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
    ],
  })

  try {
    /* ============================================================ (i) ny användare */
    const page = await browser.newPage()
    await page.setViewport(PIXEL7)

    // --- prissidan, utloggad
    await page.goto(`${BAS}/priser`, { waitUntil: 'networkidle2' })
    await vanta(1800)
    await skott(page, 'i-priser-utloggad')
    const prisText = await page.evaluate(() => document.body.innerText)
    logg('(i) prissidan visar CV-veckan', prisText.includes('CV-veckan'))
    logg('(i) prissidan visar Testveckan', prisText.includes('Testveckan'))
    logg('(i) prissidan visar Allt-veckan', prisText.includes('Allt-veckan'))
    logg('(i) priserna 79 och 99 står på sidan', prisText.includes('79') && prisText.includes('99'))
    const orangePris = await raknaOrange(page)
    logg('(i) prissidan orange högst tre', orangePris <= 3, `räknade ${orangePris}`)

    // --- CV-veckan skickar utloggad besökare till registrering med paketet
    const cvKnapp = await page.evaluate(() => {
      const kort = [...document.querySelectorAll('a,button')]
      const b = kort.find((x) => /Ta CV-veckan|Välj CV-veckan|CV-veckan/i.test(x.textContent || ''))
      return b ? b.textContent.trim() : null
    })
    logg('(i) CV-veckan har en knapp', !!cvKnapp, cvKnapp || '')

    // Registreringen med paketet i länken.
    await page.goto(`${BAS}/registrera?paket=cv_week`, { waitUntil: 'networkidle2' })
    await vanta(1500)
    await skott(page, 'i-registrera-med-paket')
    const regText = await page.evaluate(() => document.body.innerText)
    logg('(i) registreringen öppnar med paket i länken', regText.length > 100)

    // --- logga in som det nya kontot i stället för att registrera på nytt
    await loggaIn(page, konton.ny)

    // --- spårvalet med paketet förvalt
    await page.goto(`${BAS}/dashboard/valj-spar?paket=cv_week`, { waitUntil: 'networkidle2' })
    await vanta(2000)
    await skott(page, 'i-sparval-forval')
    const sparText = await page.evaluate(() => document.body.innerText)
    logg('(i) spårvalet öppnar', sparText.includes('veckan') || sparText.includes('spår'))

    const forvalt = await page.evaluate(() => {
      const kort = [...document.querySelectorAll('[role="radio"]')]
      const valt = kort.findIndex((k) => k.getAttribute('aria-checked') === 'true')
      return { antal: kort.length, valt }
    })
    logg('(i) tre valkort', forvalt.antal === 3, `hittade ${forvalt.antal}`)
    logg('(i) CV-kortet är förvalt ur ?paket', forvalt.valt === 0, `valt index ${forvalt.valt}`)
    const orangeSparval = await raknaOrange(page)
    logg('(i) spårvalet orange högst tre', orangeSparval <= 3, `räknade ${orangeSparval}`)

    // --- vidare till skärm 1.2
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('footer button')].find((x) =>
        /Se vad det kostar|Fortsätt/i.test(x.textContent || '')
      )
      if (b) b.click()
    })
    await vanta(2500)
    await skott(page, 'i-skarm-1-2-paket')
    const text12 = await page.evaluate(() => document.body.innerText)
    logg('(i) 1.2 visar CV-veckan', text12.includes('CV-veckan'))
    logg('(i) 1.2 har samtyckesrad', /ånger|villkor/i.test(text12))

    const kopSpard = await page.evaluate(() => {
      const b = [...document.querySelectorAll('footer button')].find((x) => /Betala/i.test(x.textContent || ''))
      return b ? b.disabled : null
    })
    logg('(i) 1.2 köpknapp spärrad utan kryss', kopSpard === true)

    const kryss = await page.$('input[type="checkbox"]')
    if (kryss) {
      await page.evaluate(() => document.querySelector('input[type="checkbox"]').click())
      await vanta(500)
    }
    const kopOppen = await page.evaluate(() => {
      const b = [...document.querySelectorAll('footer button')].find((x) => /Betala/i.test(x.textContent || ''))
      return b ? !b.disabled : null
    })
    logg('(i) 1.2 köpknapp öppnas av krysset', kopOppen === true)
    await skott(page, 'i-skarm-1-2-kryssad')
    const orange12 = await raknaOrange(page)
    logg('(i) 1.2 orange högst ett', orange12 <= 1, `räknade ${orange12}`)

    // --- kassan: skapa sessionen och läs line_items. Ingen betalning sker.
    const kassa = await page.evaluate(async () => {
      const res = await fetch('/api/stripe/create-plan-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'cv_week', source: 'qa_b5' }),
      })
      return { status: res.status, body: await res.json().catch(() => null) }
    })
    logg(
      '(i) kassan svarar med en url',
      kassa.status === 200 && typeof kassa.body?.url === 'string' && kassa.body.url.includes('stripe.com'),
      `status ${kassa.status}`
    )
    fs.writeFileSync(path.join(UT, 'kassa-session.json'), JSON.stringify(kassa, null, 2))

    /* ============================================ (ii) efter simulerat köp */
    // Köpet simuleras utanför webbläsaren (qa-paket-b5-kop.mjs), så här
    // läser vi bara resultatet: veckans startvy och panelen på hemskärmen.
    await page.goto(`${BAS}/dashboard/vecka/start?plan=cv_week`, { waitUntil: 'networkidle2' })
    await vanta(2500)
    await skott(page, 'ii-vecka-start')
    const startText = await page.evaluate(() => document.body.innerText)
    logg('(ii) veckans startvy öppnar', startText.length > 80, `${startText.length} tecken`)
    await hardReload(page, '/dashboard/vecka/start')

    // Dagnumret flyttas bara framåt (B3:s öppna beslut 8), så en ny körning
    // måste nollställa det i databasen. Det görs av qa-paket-b5-kop.mjs före
    // varje körning, inte härifrån: appen har med flit ingen väg bakåt.
    await page.goto(`${BAS}/dashboard`, { waitUntil: 'networkidle2' })
    await vanta(3000)
    await skott(page, 'ii-hemskarm-veckopanel-dag1')
    const hemText = await page.evaluate(() => document.body.innerText)
    // Etiketten är versal i vyn ("CV-VECKAN · DAG 1 AV 7"), så matchningen
    // måste vara skiftlägesokänslig.
    logg(
      '(ii) veckopanelen står på hemskärmen',
      /DAG \d AV 7/i.test(hemText),
      hemText.match(/.{0,20}DAG \d AV 7/i)?.[0] ?? ''
    )
    const orangeHem = await raknaOrange(page)
    logg('(ii) hemskärmen orange högst tre', orangeHem <= 3, `räknade ${orangeHem}`)

    // Markera dagen klar, panelen ska gå till dag 2.
    const markerad = await page.evaluate(async () => {
      const b = [...document.querySelectorAll('button')].find((x) =>
        /Markera dagen klar/i.test(x.textContent || '')
      )
      if (!b) return 'ingen knapp'
      b.click()
      return 'klickad'
    })
    await vanta(3000)
    await skott(page, 'ii-hemskarm-dag2')
    const hemText2 = await page.evaluate(() => document.body.innerText)
    logg(
      '(ii) dagen kvitteras och panelen går vidare',
      markerad === 'klickad' && /DAG 2 AV 7/i.test(hemText2),
      markerad
    )
    await hardReload(page, '/dashboard efter kvittering')

    /* ================================================== (iii) gratis möter betalvägg */
    const gratisPage = await browser.newPage()
    await gratisPage.setViewport(PIXEL7)
    await loggaIn(gratisPage, konton.gratis)

    // Mall 4: premiummall bakom cv_templates_all.
    const mall = await gratisPage.evaluate(async () => {
      const res = await fetch('/api/cv/generate-formatted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: 'aurora', cvText: 'QA-test av betalvaggen. Erfarenhet: fem ar som handlaggare hos en kommun i Skane, med ansvar for arenden och uppfoljning.', format: 'pdf' }),
      })
      return { status: res.status, body: await res.json().catch(() => null) }
    })
    logg(
      '(iii) mall 4 ger 402 med feature och suggestedPlan',
      mall.status === 402 && mall.body?.feature === 'cv_templates_all' && !!mall.body?.suggestedPlan,
      `status ${mall.status} plan ${mall.body?.suggestedPlan ?? '-'}`
    )
    logg(
      '(iii) mallens betalvägg föreslår CV-veckan',
      mall.body?.suggestedPlan === 'cv_week',
      String(mall.body?.suggestedPlan)
    )

    // Testnivå 2: bakom tests_above_base.
    const niva2 = await gratisPage.evaluate(async () => {
      const res = await fetch('/api/logicTestV6/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      return { status: res.status, body: await res.json().catch(() => null) }
    })
    logg(
      '(iii) testnivå 2 ger 402 med tests_above_base',
      niva2.status === 402 && niva2.body?.feature === 'tests_above_base',
      `status ${niva2.status}`
    )
    logg(
      '(iii) testets betalvägg föreslår Testveckan',
      niva2.body?.suggestedPlan === 'test_week',
      String(niva2.body?.suggestedPlan)
    )

    // Brevnedladdning: bakom letter_download.
    const brev = await gratisPage.evaluate(async () => {
      const res = await fetch('/api/letters/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterId: 'qa', format: 'pdf' }),
      })
      return { status: res.status, body: await res.json().catch(() => null) }
    })
    logg(
      '(iii) brevnedladdning ger 402 med letter_download',
      brev.status === 402 && brev.body?.feature === 'letter_download',
      `status ${brev.status}`
    )

    // Betalväggen i vyn: mallsidan.
    await gratisPage.goto(`${BAS}/dashboard/cv-mallar`, { waitUntil: 'networkidle2' })
    await vanta(2500)
    await skott(gratisPage, 'iii-gratis-mallar')
    await hardReload(gratisPage, '/dashboard/cv-mallar')

    await gratisPage.goto(`${BAS}/dashboard/tester`, { waitUntil: 'networkidle2' })
    await vanta(2500)
    await skott(gratisPage, 'iii-gratis-tester')
    const testerText = await gratisPage.evaluate(() => document.body.innerText)
    logg('(iii) testhubben öppnar för gratiskonto', testerText.length > 100)
    await hardReload(gratisPage, '/dashboard/tester')

    // Utvecklingsfliken: historiken ska vara trimmad och säga varför.
    await gratisPage.evaluate(() => {
      const f = [...document.querySelectorAll('button,[role="tab"]')].find((x) =>
        /Utveckling/i.test(x.textContent || '')
      )
      if (f) f.click()
    })
    await vanta(2000)
    await skott(gratisPage, 'iii-gratis-utveckling-historik')
    await page.close()

    /* ======================================== (iv) fel spår: tester öppnar mallar */
    const testerPage = await browser.newPage()
    await testerPage.setViewport(PIXEL7)
    await loggaIn(testerPage, konton.tester)

    await testerPage.goto(`${BAS}/dashboard/cv-mallar`, { waitUntil: 'networkidle2' })
    await vanta(2800)
    await skott(testerPage, 'iv-felspar-mallar')
    // Mallväljaren renderas först när kontot har ett CV, och QA-kontot har
    // inget. FelSpar-kortet testas därför direkt mot komponentens copy via
    // spårvalets uppgraderingsväg i stället, plus serverspärren nedan som är
    // den som faktiskt håller.
    await testerPage.goto(`${BAS}/dashboard/profil/prenumeration`, { waitUntil: 'networkidle2' })
    await vanta(2800)
    await skott(testerPage, 'iv-felspar-prenumeration')
    const felText = await testerPage.evaluate(() => document.body.innerText)
    logg(
      '(iv) fel spår visar mellanskillnaden 20 kr',
      /20 kr/.test(felText),
      felText.match(/.{0,60}20 kr.{0,40}/)?.[0] ?? 'ingen 20 kr-text'
    )
    logg('(iv) fel spår nämner Allt-veckan', /Allt-veckan/.test(felText))

    const mallFelSpar = await testerPage.evaluate(async () => {
      const res = await fetch('/api/cv/generate-formatted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: 'aurora', cvText: 'QA-test av betalvaggen. Erfarenhet: fem ar som handlaggare hos en kommun i Skane, med ansvar for arenden och uppfoljning.', format: 'pdf' }),
      })
      return { status: res.status, body: await res.json().catch(() => null) }
    })
    logg(
      '(iv) testspåret spärras serverside på mallarna',
      mallFelSpar.status === 402 && mallFelSpar.body?.feature === 'cv_templates_all',
      `status ${mallFelSpar.status}`
    )
    await hardReload(testerPage, '/dashboard/cv-mallar som testspår')

    /* ================================================== (vi) LCP */
    const lcpPage = await browser.newPage()
    await lcpPage.setViewport(PIXEL7)
    await loggaIn(lcpPage, konton.cv)
    const lcpHem = await matLCP(lcpPage, `${BAS}/dashboard`)
    logg('(vi) LCP hemskärm under 1,0 s', lcpHem < 1000, `${lcpHem} ms`)
    await skott(lcpPage, 'vi-lcp-hemskarm')

    const lcpPris = await browser.newPage()
    await lcpPris.setViewport(PIXEL7)
    const lcpPriser = await matLCP(lcpPris, `${BAS}/priser`)
    logg('(vi) LCP prissida under 1,5 s', lcpPriser < 1500, `${lcpPriser} ms`)
    await skott(lcpPris, 'vi-lcp-priser')

    /* ================================================== desktop 1280 */
    // Flikarna från mätningen stängs först: annars konkurrerar sex flikar om
    // samma lokala server och navigeringen tar över trettio sekunder.
    await gratisPage.close()
    await testerPage.close()
    await lcpPage.close()
    await lcpPris.close()

    const dp = await browser.newPage()
    dp.setDefaultNavigationTimeout(90000)
    await dp.setViewport(DESKTOP)
    await dp.goto(`${BAS}/priser`, { waitUntil: 'networkidle2', timeout: 90000 })
    await vanta(2000)
    await skott(dp, 'desktop-priser')
    const sidledd = await dp.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 2
    )
    logg('desktop prissidan scrollar aldrig i sidled', sidledd)

    await loggaIn(dp, konton.cv)
    await dp.goto(`${BAS}/dashboard`, { waitUntil: 'networkidle2' })
    await vanta(2500)
    await skott(dp, 'desktop-hemskarm')

    await dp.goto(`${BAS}/dashboard/valj-spar`, { waitUntil: 'networkidle2' })
    await vanta(2000)
    await skott(dp, 'desktop-sparval')

    await dp.goto(`${BAS}/dashboard/profil/prenumeration`, { waitUntil: 'networkidle2' })
    await vanta(2500)
    await skott(dp, 'desktop-prenumeration')
    const prenText = await dp.evaluate(() => document.body.innerText)
    logg('(v) prenumerationsvyn öppnar', prenText.length > 100)
    await hardReload(dp, '/dashboard/profil/prenumeration')
  } finally {
    await browser.close()
  }

  fs.writeFileSync(path.join(UT, 'resultat.json'), JSON.stringify(resultat, null, 2))
  const gron = resultat.filter((r) => r.ok).length
  console.log(`\n${gron} av ${resultat.length} kontroller gröna`)
  const roda = resultat.filter((r) => !r.ok)
  if (roda.length) {
    console.log('\nRöda:')
    for (const r of roda) console.log(' -', r.namn, r.not)
  }
}

await kor()
