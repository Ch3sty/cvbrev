// scripts/qa-paket-b3.mjs
// Klicktest i riktig webbläsare av paket- och onboardingflödena (B3).
// Pixel 7 (412x915) och desktop (1280). Skärmdump per skärm.
//
// Kör: node scripts/qa-paket-b3.mjs
// Kräver en inloggningsbar QA-användare i /tmp/qa-b3.json och en server på 3103.

import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const BAS = process.env.QA_BAS || 'http://localhost:3103'
const UT = 'docs/qa/qa-paket-b3'
const CHROME =
  process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const konto = JSON.parse(fs.readFileSync('/tmp/qa-b3.json', 'utf8'))

fs.mkdirSync(UT, { recursive: true })

const PIXEL7 = { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const DESKTOP = { width: 1280, height: 900, deviceScaleFactor: 1 }

const resultat = []

function logg(namn, ok, not = '') {
  resultat.push({ namn, ok, not })
  console.log(`${ok ? 'OK ' : 'FEL'}  ${namn}${not ? '  ' + not : ''}`)
}

async function skott(page, namn) {
  const fil = path.join(UT, `${namn}.png`)
  await page.screenshot({ path: fil, fullPage: false })
  console.log('     bild:', fil)
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

/** Räknar synliga orange element: accentlinjer, accentprickar och accent-ink-text. */
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

async function kor() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })

  try {
    /* ------------------------------------------------ Pixel 7 */
    const page = await browser.newPage()
    await page.setViewport(PIXEL7)
    await loggaIn(page)

    // Flöde 1 körs bara i steg 1, som ett gratiskonto. I steg 2 är kontot
    // betalande och då är skärm 1.1 inte längre den som möter användaren.
    if (process.env.QA_STEG !== '2') {
    // --- Flöde 1, skärm 1.1
    await page.goto(`${BAS}/dashboard/valj-spar`, { waitUntil: 'networkidle2' })
    await new Promise((r) => setTimeout(r, 1800))
    await skott(page, '01-mobil-sparval-1-1')

    const text11 = await page.evaluate(() => document.body.innerText)
    logg('1.1 frågan syns (T1)', text11.includes('Vad ska du få gjort den här veckan?'))
    logg('1.1 tre valkort', (await page.$$('[role="radio"]')).length === 3)
    logg('1.1 Rekommenderas på Allt', text11.includes('REKOMMENDERAS') || text11.includes('Rekommenderas'))
    logg('1.1 Börja gratis i foten', text11.includes('Börja gratis'))
    logg('1.1 hoppa över (T12)', text11.includes('Jag vet inte än'))

    const primarSpard = await page.evaluate(() => {
      const b = [...document.querySelectorAll('footer button')].find((x) =>
        x.textContent.includes('Se vad det kostar')
      )
      return b ? b.disabled : null
    })
    logg('1.1 primär spärrad innan val', primarSpard === true)

    const gratisTryckbar = await page.evaluate(() => {
      const b = [...document.querySelectorAll('footer button')].find((x) =>
        x.textContent.includes('Börja gratis')
      )
      return b ? !b.disabled : null
    })
    logg('1.1 Börja gratis tryckbar utan val', gratisTryckbar === true)

    const orange11 = await raknaOrange(page)
    logg('1.1 orange högst tre', orange11 <= 3, `räknade ${orange11}`)

    // Välj Allt och gå vidare
    await page.evaluate(() => {
      const kort = [...document.querySelectorAll('[role="radio"]')]
      kort[2].click()
    })
    await new Promise((r) => setTimeout(r, 400))
    const valtRing = await page.evaluate(() => {
      const kort = [...document.querySelectorAll('[role="radio"]')]
      return kort[2].getAttribute('aria-checked')
    })
    logg('1.1 valt kort markeras', valtRing === 'true')
    await skott(page, '02-mobil-sparval-1-1-valt')

    await page.evaluate(() => {
      const b = [...document.querySelectorAll('footer button')].find((x) =>
        x.textContent.includes('Se vad det kostar')
      )
      b.click()
    })
    await new Promise((r) => setTimeout(r, 2500))

    // --- Flöde 1, skärm 1.2
    await skott(page, '03-mobil-paket-1-2')
    const text12 = await page.evaluate(() => document.body.innerText)
    logg('1.2 paketskärmen (T14)', text12.includes('Så här ser veckan ut'))
    logg('1.2 längdval på Allt', text12.includes('dagen') && text12.includes('veckan') && text12.includes('månaden'))
    logg('1.2 samtyckesrad (T23)', text12.includes('ångerrätten på fjorton dagar'))
    logg('1.2 förnyelserad (T22)', /Nästa dragning|Dygnet tar slut/.test(text12))
    logg('1.2 kvittorad (T26)', text12.includes('Kvittot skickas till din e-post'))

    const kopSpard = await page.evaluate(() => {
      const b = [...document.querySelectorAll('footer button')].find((x) => /Betala \d+ kr/.test(x.textContent))
      return b ? b.disabled : null
    })
    logg('1.2 köpknapp spärrad utan kryss', kopSpard === true)

    const orange12 = await raknaOrange(page)
    logg('1.2 orange högst ett', orange12 <= 1, `räknade ${orange12}`)

    // Kryssa i, knappen ska bli tryckbar
    await page.evaluate(() => document.querySelector('input[type="checkbox"]').click())
    await new Promise((r) => setTimeout(r, 400))
    const kopOppen = await page.evaluate(() => {
      const b = [...document.querySelectorAll('footer button')].find((x) => /Betala \d+ kr/.test(x.textContent))
      return b ? !b.disabled : null
    })
    logg('1.2 köpknapp öppnas av krysset', kopOppen === true)
    await skott(page, '04-mobil-paket-1-2-kryssad')

    // Byt längd: panelen ska skriva om sig
    await page.evaluate(() => {
      const seg = [...document.querySelectorAll('[role="radiogroup"] [role="radio"]')]
      const m = seg.find((x) => x.textContent.trim() === 'månaden')
      if (m) m.click()
    })
    await new Promise((r) => setTimeout(r, 500))
    const textManad = await page.evaluate(() => document.body.innerText)
    logg('1.2 längdbytet skriver om panelen', textManad.includes('Allt-månaden') && textManad.includes('149 kr'))
    await skott(page, '05-mobil-paket-1-2-manaden')

    // --- Skärm 1.1b via Börja gratis utan val.
    // Spåret nollas först: med ett sparat spår sparar Börja gratis direkt och
    // går till hemskärmen, vilket är rätt beteende men inte den här skärmen.
    await page.goto(`${BAS}/dashboard/valj-spar`, { waitUntil: 'networkidle2' })
    await new Promise((r) => setTimeout(r, 1500))
    await page.evaluate(() =>
      fetch('/api/onboarding/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track: null }),
      })
    )
    await page.reload({ waitUntil: 'networkidle2' })
    await new Promise((r) => setTimeout(r, 1800))
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('footer button')].find((x) =>
        x.textContent.includes('Börja gratis')
      )
      b.click()
    })
    await new Promise((r) => setTimeout(r, 900))
    await skott(page, '06-mobil-sparval-1-1b-gratis')
    const text11b = await page.evaluate(() => document.body.innerText)
    logg('1.1b gratisfrågan visas', text11b.includes('Vad vill du börja med?'))
    logg('1.1b inga priser', !/\d+ kr/.test(text11b))
    logg('1.1b tre val inkl. vet inte än', text11b.includes('Jag vet inte än'))
    const orange11b = await raknaOrange(page)
    logg('1.1b orange högst ett', orange11b <= 1, `räknade ${orange11b}`)

    // Välj CV och gå till hemskärmen: spårraden ska stå där
    await page.evaluate(() => document.querySelectorAll('[role="radio"]')[0].click())
    await new Promise((r) => setTimeout(r, 300))
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('footer button')].find((x) =>
        x.textContent.includes('Till hemskärmen')
      )
      b.click()
    })
    await new Promise((r) => setTimeout(r, 4000))
    await skott(page, '07-mobil-hemskarm-sparrad')
    const textHem = await page.evaluate(() => document.body.innerText)
    logg('1.3 spårraden på hemskärmen (T28)', textHem.includes('Du valde CV och brev'))
    logg('1.3 länk till paketet (T29)', textHem.includes('Se CV-veckan'))

    /* ------------------------------------------------ flöde 2 och 3: betalande */
    // Sätt premium_scope 'cv' manuellt, precis som uppdraget beskriver.
    }

    console.log('\n>>> Sätt premium_scope nu (görs av anroparen), tryck vidare\n')
    if (process.env.QA_STEG === '1') {
      await browser.close()
      fs.writeFileSync(path.join(UT, 'resultat-steg1.json'), JSON.stringify(resultat, null, 2))
      return
    }

    // --- Flöde 2, skärm 2.1
    await page.goto(`${BAS}/dashboard/vecka/start?plan=cv_week`, { waitUntil: 'networkidle2' })
    await new Promise((r) => setTimeout(r, 2500))
    await skott(page, '08-mobil-vecka-start-2-1')
    const text21 = await page.evaluate(() => document.body.innerText)
    logg('2.1 rubriken säger vad och hur länge (T30)', /Du har CV-veckan till söndag/.test(text21))
    logg('2.1 DAG 1 AV 7 syns', /DAG 1 AV 7/i.test(text21))
    logg('2.1 primär går in i dag 1 (T34 eller T42)', /Börja med dag 1|Läs mitt CV/.test(text21))
    logg('2.1 kvittolänken finns (T36)', text21.includes('Kvitto och uppsägning'))
    logg('2.1 aldrig Till översikten', !text21.includes('Till översikten'))
    const orange21 = await raknaOrange(page)
    logg('2.1 orange högst tre', orange21 <= 3, `räknade ${orange21}`)

    // Skärm 2.2: köparen utan CV möts av uppladdningen, inte en tom analyssida
    logg('2.2 köparen utan CV pekas mot uppladdning', text21.includes('Läs mitt CV') || text21.includes('Ladda upp'))

    // --- Flöde 3, veckopanelen
    await page.goto(`${BAS}/dashboard`, { waitUntil: 'networkidle2' })
    await new Promise((r) => setTimeout(r, 4000))
    await skott(page, '09-mobil-hemskarm-veckopanel')
    const text3 = await page.evaluate(() => document.body.innerText)
    logg('3.1 veckopanelen visas för betalande', /CV-VECKAN · DAG \d AV 7/i.test(text3))
    logg('3.1 dagens sak och knapp', text3.includes('CV in, analys ut'))
    logg('3.1 hoppa-länk (T49)', text3.includes('Hoppa till en annan dag'))
    logg('3.1 hela veckan-länk (T50)', text3.includes('Hela veckan'))

    const noder = await page.evaluate(
      () => document.querySelectorAll('[aria-label^="Dag "][role="listitem"]').length
    )
    logg('3.1 sju noder på en rad', noder === 7, `räknade ${noder}`)

    const ariaCurrent = await page.evaluate(
      () => document.querySelectorAll('[role="listitem"][aria-current="step"]').length
    )
    logg('3.1 aktuell nod har aria-current step', ariaCurrent === 1)

    const horisontell = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1
    )
    logg('3.1 ingen horisontell scroll', horisontell)

    const orange3 = await raknaOrange(page)
    logg('3.1 orange på hemskärmen högst tre', orange3 <= 3, `räknade ${orange3}`)

    // NastaHandling får inte stå samtidigt som en oavklarad dag
    logg('3.1 NastaHandling döljs under veckan', !text3.includes('NÄSTA HANDLING'))

    // Hoppa-arket
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) =>
        x.textContent.includes('Hoppa till en annan dag')
      )
      b.click()
    })
    await new Promise((r) => setTimeout(r, 700))
    await skott(page, '10-mobil-hoppa-arket-3-4')
    const textArk = await page.evaluate(() => document.body.innerText)
    logg('3.4 arkets rubrik (T64)', textArk.includes('Veckans sju dagar'))
    logg('3.4 arkets text (T65)', textArk.includes('Ordningen är ett förslag'))

    await page.keyboard.press('Escape')
    await new Promise((r) => setTimeout(r, 600))
    const arkStangt = await page.evaluate(
      () => !document.body.innerText.includes('Ordningen är ett förslag')
    )
    logg('3.4 Escape stänger arket', arkStangt)

    // Kvittering: markera dagen klar
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find((x) =>
        x.textContent.includes('Markera dagen klar')
      )
      if (b) b.click()
    })
    await new Promise((r) => setTimeout(r, 1500))
    await skott(page, '11-mobil-kvittering-3-2')
    const textKvitt = await page.evaluate(() => document.body.innerText)
    logg('3.2 kvitteringsläget visar vad som blev gjort', textKvitt.includes('CV:t är uppe och analyserat'))
    logg('3.2 vidare till nästa dag (T53)', textKvitt.includes('Vidare till dag 2'))
    logg('3.2 klart för i dag (T54)', textKvitt.includes('Klart för i dag'))

    /* ------------------------------------------------ desktop 1280 */
    const dPage = await browser.newPage()
    await dPage.setViewport(DESKTOP)
    await loggaIn(dPage)

    await dPage.goto(`${BAS}/dashboard/valj-spar`, { waitUntil: 'networkidle2' })
    await new Promise((r) => setTimeout(r, 2000))
    await skott(dPage, '12-desktop-sparval-1-1')
    const staplade = await dPage.evaluate(() => {
      const kort = [...document.querySelectorAll('[role="radio"]')]
      if (kort.length < 3) return false
      const top = kort.map((k) => Math.round(k.getBoundingClientRect().top))
      return top[0] < top[1] && top[1] < top[2]
    })
    logg('desktop korten staplade, inte tre kolumner', staplade)

    await dPage.goto(`${BAS}/dashboard`, { waitUntil: 'networkidle2' })
    await new Promise((r) => setTimeout(r, 4000))
    await skott(dPage, '13-desktop-hemskarm-veckopanel')

    await dPage.goto(`${BAS}/dashboard/vecka/start?plan=cv_week`, { waitUntil: 'networkidle2' })
    await new Promise((r) => setTimeout(r, 2500))
    await skott(dPage, '14-desktop-vecka-start')
  } finally {
    await browser.close()
  }

  fs.writeFileSync(path.join(UT, 'resultat.json'), JSON.stringify(resultat, null, 2))
  const fel = resultat.filter((r) => !r.ok)
  console.log(`\n${resultat.length - fel.length} av ${resultat.length} klara.`)
  if (fel.length) {
    console.log('Fel:')
    for (const f of fel) console.log(' -', f.namn, f.not)
  }
}

kor().catch((e) => {
  console.error(e)
  process.exit(1)
})
