// scripts/qa-paket-b7.mjs
// Klicktest i riktig webbläsare av rensningen (B7): gästinbjudningarna och
// den kortkrävande provperioden är borta, och deras adresser ska peka om
// till prissidan i stället för att ge 404.
//
//   node scripts/qa-paket-b7.mjs
//
// Kräver en server på 3107 som kör .next-b7.

import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const BAS = process.env.QA_BAS || 'http://localhost:3107'
const UT = 'docs/qa/qa-paket-b7'
const CHROME =
  process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

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

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

try {
  // --- Redirects, desktop -------------------------------------------------
  const page = await browser.newPage()
  page.setDefaultNavigationTimeout(90000)
  await page.setViewport(DESKTOP)

  const REDIRECTS = [
    ['/invite/x', 'invite-kod'],
    ['/trial-signup', 'trial-signup'],
    ['/dashboard/gastinbjudningar', 'gastinbjudningar'],
    ['/dashboard/invite-friends', 'invite-friends'],
  ]

  for (const [fran, namn] of REDIRECTS) {
    const svar = await page.goto(`${BAS}${fran}`, { waitUntil: 'networkidle2', timeout: 90000 })
    const slut = page.url()
    const status = svar?.status()
    const kedja = svar?.request().redirectChain() ?? []
    const forstaStatus = kedja[0]?.response()?.status()
    // 304 är lika giltigt som 200: prissidan ligger i webbläsarens cache när
    // den redan hämtats i samma körning. Det som ska stämma är hoppet (308)
    // och att vi landar på /priser.
    logg(
      `${fran} pekar om till /priser`,
      slut.includes('/priser') && (status === 200 || status === 304) && forstaStatus === 308,
      `slutade på ${slut}, status ${status}, första hopp ${forstaStatus ?? 'inget'}`
    )
    if (namn === 'invite-kod' || namn === 'gastinbjudningar') {
      await skott(page, `redirect-${namn}-priser`)
    }
  }

  // Ingen text om inbjudningar på prissidan
  const prisText = await page.evaluate(() => document.body.innerText.toLowerCase())
  logg(
    'prissidan nämner inte inbjudningar eller provperiod',
    !/inbjud|bjud in|gästinbjud|provperiod/.test(prisText),
    ''
  )

  // --- Hemskärm och sidomeny, inloggad ------------------------------------
  const konto = JSON.parse(fs.readFileSync('/tmp/qa-b7.json', 'utf8'))

  const mobil = await browser.newPage()
  mobil.setDefaultNavigationTimeout(90000)
  await mobil.setViewport(PIXEL7)
  await mobil.goto(`${BAS}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await mobil.waitForSelector('input[type="email"]', { timeout: 20000 })
  await mobil.type('input[type="email"]', konto.email)
  await mobil.type('input[type="password"]', konto.password)
  await Promise.all([
    mobil.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
    mobil.click('button[type="submit"]'),
  ])
  await new Promise((r) => setTimeout(r, 2500))
  await mobil.goto(`${BAS}/dashboard`, { waitUntil: 'networkidle2', timeout: 90000 })
  await new Promise((r) => setTimeout(r, 1500))

  logg('inloggad på hemskärmen', mobil.url().includes('/dashboard'), mobil.url())

  const hem = await mobil.evaluate(() => ({
    text: document.body.innerText,
    lankar: Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href')),
  }))
  logg(
    'hemskärmen nämner inte inbjudningar eller provperiod',
    !/inbjud|bjud in|gästinbjud|provperiod|bjud en vän/i.test(hem.text),
    ''
  )
  logg(
    'hemskärmen länkar inte till invite/trial-signup',
    !hem.lankar.some((h) => /invite|trial-signup|gastinbjud/.test(h || '')),
    `${hem.lankar.length} länkar`
  )
  await skott(mobil, 'hemskarm-mobil-utan-inbjudningar')

  // Sidomenyn: desktop visar den permanent, mobil bakom en knapp.
  const meny = await browser.newPage()
  meny.setDefaultNavigationTimeout(90000)
  await meny.setViewport(DESKTOP)
  const cookies = await mobil.cookies()
  await meny.setCookie(...cookies)
  await meny.goto(`${BAS}/dashboard`, { waitUntil: 'networkidle2', timeout: 90000 })
  await new Promise((r) => setTimeout(r, 1500))

  const nav = await meny.evaluate(() => {
    const el = document.querySelector('aside, nav[aria-label], [data-sidebar]')
    return {
      text: el ? el.innerText : document.body.innerText,
      lankar: Array.from((el || document).querySelectorAll('a[href]')).map((a) =>
        a.getAttribute('href')
      ),
    }
  })
  logg(
    'sidomenyn nämner inte inbjudningar',
    !/inbjud|bjud in|gästinbjud|bjud en vän/i.test(nav.text),
    ''
  )
  logg(
    'sidomenyn länkar inte till invite/gastinbjudningar',
    !nav.lankar.some((h) => /invite|trial-signup|gastinbjud/.test(h || '')),
    `${nav.lankar.length} länkar`
  )
  await skott(meny, 'sidomeny-desktop-utan-inbjudningar')
} finally {
  await browser.close()
  fs.writeFileSync(path.join(UT, 'resultat.json'), JSON.stringify(resultat, null, 2))
  const fel = resultat.filter((r) => !r.ok)
  console.log(`\n${resultat.length - fel.length}/${resultat.length} gröna`)
  if (fel.length) console.log('FEL:', fel.map((f) => f.namn).join(', '))
}
