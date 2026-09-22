// scripts/qa-paket-d2.mjs
// Klicktest i riktig webbläsare av onboardingen (D2,
// docs/design/spec-onboarding-2026-09-22.html): välkomstskärmen, hjälpredan
// Kom igång, de gråade vyerna och menyn.
//
//   node scripts/qa-paket-d2-konton.mjs skapa
//   node scripts/qa-paket-d2.mjs
//   node scripts/qa-paket-d2-konton.mjs radera
//
// Kräver en server på 3109 som kör .next-d2. Skärmdumpar till
// docs/qa/qa-paket-d2/, resultat i resultat.json.

import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const BAS = process.env.QA_BAS || 'http://localhost:3109'
const UT = 'docs/qa/qa-paket-d2'
const CHROME =
  process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const KONTON = JSON.parse(
  fs.readFileSync(process.env.QA_KONTON_FIL || 'scripts/.qa-d2-konton.json', 'utf8')
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

async function klickaText(page, tag, innehall) {
  return page.evaluate(
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
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((e) => e.innerText.trim() === 'Acceptera')
    b?.click()
  })
  await vanta(500)
  return page
}

async function ga(page, url) {
  await page.goto(`${BAS}${url}`, { waitUntil: 'networkidle2' })
  await vanta(1500)
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--lang=sv-SE'],
})

try {
  /* ---------------------------------------------- 1. CV-veckan, Pixel 7 */
  {
    const ctx = await browser.createBrowserContext()
    const m = await loggaIn(ctx, KONTON.cv, PIXEL7)
    logg('cv: inloggad', !m.url().includes('/login'), m.url())

    // Välkomstskärmen: kontot har redan ett CV, alltså varianten med analysen.
    await ga(m, '/dashboard/vecka/start?premium_activated=true&plan=cv_week')
    let t = await text(m)
    logg('välkommen cv: topp CV-veckan', t.includes('CV-veckan'))
    logg('välkommen cv: rubrik Och ett CV redan', t.includes('Du har CV-veckan. Och ett CV redan.'))
    logg('välkommen cv: Anna_CV.pdf', t.includes('Anna_CV.pdf'))
    logg('välkommen cv: primär Kör hela CV-analysen', t.includes('Kör hela CV-analysen'))
    logg('välkommen cv: sekundär Ladda upp ett annat CV', t.includes('Ladda upp ett annat CV'))
    const navDold = await m.evaluate(() => !document.querySelector('nav[aria-label="Huvudnavigation"]') || getComputedStyle(document.querySelector('nav[aria-label="Huvudnavigation"]')).display === 'none')
    logg('välkommen cv: bottennavet dolt', navDold)
    await skott(m, 'valkommen-cv-med-cv')

    // Hemskärmen med raden.
    await ga(m, '/dashboard')
    t = await text(m)
    logg('hem cv: Kom igång med CV-veckan', t.includes('Kom igång med CV-veckan'))
    logg('hem cv: n av 8 provade', /\d av 8 provade/.test(t))
    logg('hem cv: Nästa:', /Nästa: /.test(t))
    const radPos = await m.evaluate(() => {
      const r = document.querySelector('[data-komigang-rad="flytande"]')
      const n = document.querySelector('nav[aria-label="Huvudnavigation"]')
      if (!r || !n) return null
      return { radBotten: r.getBoundingClientRect().bottom, navTopp: n.getBoundingClientRect().top }
    })
    logg('hem cv: raden ligger ovanför bottennavet', radPos && radPos.radBotten <= radPos.navTopp + 1, JSON.stringify(radPos))
    logg('hem cv: ingen veckopanel kvar', !/Dag \d av 7/.test(t))
    await skott(m, 'hem-cv-med-rad')

    // Arket.
    await m.click('[data-komigang-rad="flytande"]')
    await vanta(700)
    t = await text(m)
    logg('ark cv: rubrik och n av 8', /Kom igång med CV-veckan[\s\S]*\d av 8/.test(t))
    logg('ark cv: åtta brickor i ordning', ['Profilen ifylld', 'CV uppladdat', 'CV-analysen körd', 'Uppdatera CV:t efter fynden', 'Välj mall och ladda ned', 'Personligt brev på en annons', 'LinkedIn-profilen', 'Matrislogik, grundnivå'].every((r) => t.includes(r)))
    logg('ark cv: Föreslaget nästa', /Föreslaget nästa/i.test(t))
    logg('ark cv: matrislogik Ingår gratis', t.includes('Ingår gratis, en gång per dygn'))
    logg('ark cv: Dölj hjälpredan', t.includes('Dölj hjälpredan'))
    const klara = await m.evaluate(() => Array.from(document.querySelectorAll('[role="dialog"] a[aria-label]')).filter((a) => a.getAttribute('aria-label').endsWith(', provad')).length)
    logg('ark cv: profil och CV klara', klara >= 2, `klara=${klara}`)
    await skott(m, 'ark-cv')
    await m.keyboard.press('Escape')
    await vanta(400)

    // Testsidan gråad.
    await ga(m, '/dashboard/tester')
    t = await text(m)
    logg('tester cv: Du har CV-veckan', t.includes('Du har CV-veckan'))
    logg('tester cv: Grundnivån ingår. Resten finns i Testveckan.', t.includes('Grundnivån ingår. Resten finns i Testveckan.'))
    logg('tester cv: gråa rader Testveckan 79 kr, eller Allt', (t.match(/Testveckan 79 kr, eller Allt/g) || []).length >= 6)
    logg('tester cv: 1 kvar i dag', t.includes('1 kvar i dag'))
    logg('tester cv: Lägg till Testveckan, 79 kr', t.includes('Lägg till Testveckan, 79 kr'))
    logg('tester cv: Eller Allt för 20 kr till i veckan', t.includes('Eller Allt för 20 kr till i veckan'))
    logg('tester cv: inga Premium-etiketter', !/· Premium/.test(t))
    await skott(m, 'tester-cv-graad')
    await skott(m, 'tester-cv-graad-hela', true)

    // Grått val öppnar FelSpar med mellanskillnaden.
    await m.evaluate(() => Array.from(document.querySelectorAll('button[aria-label]')).find((b) => /avancerad\. Ingår inte/.test(b.getAttribute('aria-label')))?.click())
    await vanta(700)
    t = await text(m)
    logg('tester cv: grått val öppnar fel spår-kortet', t.includes('Byt till Allt-veckan') && t.includes('Mellanskillnad, 20 kr'))
    await skott(m, 'tester-cv-felspar')
    await m.keyboard.press('Escape')
    await vanta(400)

    // Menyn (mobil).
    await ga(m, '/dashboard')
    await m.click('button[aria-label="Öppna meny"]')
    await vanta(600)
    t = await text(m)
    logg('meny cv: Du har CV-veckan', t.includes('Du har CV-veckan'))
    logg('meny cv: Förnyas <datum>, 79 kr', /Förnyas \d+ \w+, 79 kr/.test(t))
    logg('meny cv: Vad ingår?', t.includes('Vad ingår?'))
    logg('meny cv: Alla 41 mallar', t.includes('Alla 41 mallar'))
    logg('meny cv: Grundnivån, en gång per typ och dygn', t.includes('Grundnivån, en gång per typ och dygn'))
    logg('meny cv: Bli upptäckt Ingår inte. Finns i Allt.', t.includes('Ingår inte. Finns i Allt.'))
    logg('meny cv: Tre träffar per natt', t.includes('Tre träffar per natt'))
    logg('meny cv: meddelanden', /\d+ meddelanden/.test(t))
    logg('meny cv: Vill du ha testerna också?', t.includes('Vill du ha testerna också?'))
    await skott(m, 'meny-cv-mobil')
    await ctx.close()
  }

  /* ---------------------------------------------- 2. Testveckan */
  {
    const ctx = await browser.createBrowserContext()
    const m = await loggaIn(ctx, KONTON.tester, PIXEL7)

    await ga(m, '/dashboard/vecka/start?premium_activated=true&plan=test_week')
    let t = await text(m)
    logg('välkommen test: rubrik', t.includes('Du har Testveckan. Alla nivåer är öppna.'))
    logg('välkommen test: Så här går det till', /så här går det till/i.test(t))
    logg('välkommen test: tre steg', t.includes('Matrislogik, grundnivå. Cirka 20 minuter') && t.includes('provläge mot klockan, och personlighetstestet'))
    logg('välkommen test: primär Börja med matrislogik', t.includes('Börja med matrislogik'))
    logg('välkommen test: sekundär Visa allt som ingår', t.includes('Visa allt som ingår'))
    await skott(m, 'valkommen-test')

    // Sekundären öppnar arket.
    await klickaText(m, 'button', 'Visa allt som ingår')
    await vanta(700)
    t = await text(m)
    logg('välkommen test: arket öppnas', t.includes('Kom igång med Testveckan'))
    logg('ark test: åtta brickor', ['Profilen ifylld', 'Matrislogik, grundnivå', 'Matrislogik, avancerad nivå', 'Verbalt och numeriskt, grundnivå', 'Provläge mot klockan', 'Personlighetstestet, och vad det säger', 'Din kurva', 'Ladda upp CV:t'].every((r) => t.includes(r)))
    await skott(m, 'ark-test')
    await m.keyboard.press('Escape')
    await vanta(400)

    // Mallsidan gråad.
    await ga(m, '/dashboard/cv-mallar')
    t = await text(m)
    logg('mallar test: Du har Testveckan', t.includes('Du har Testveckan'))
    logg('mallar test: 3 mallar ingår. Alla 41 finns i CV-veckan.', t.includes('3 mallar ingår. Alla 41 finns i CV-veckan.'))
    logg('mallar test: förhandsvisa-noten', t.includes('Gråa mallar går att förhandsvisa i full storlek, inte ladda ned.'))
    logg('mallar test: Lägg till CV-veckan, 79 kr', t.includes('Lägg till CV-veckan, 79 kr'))
    logg('mallar test: Eller Allt för 20 kr till i veckan', t.includes('Eller Allt för 20 kr till i veckan'))
    await skott(m, 'mallar-test-graad')
    // Galleriet: gråa mallar med lås.
    await m.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).find((e) => e.innerHTML.includes('Galleri')); b?.scrollIntoView({ block: 'center' }); b?.click() })
    await vanta(800)
    const las = await m.evaluate(() => document.querySelectorAll('li button .bg-ink-1\\/60').length)
    logg('mallar test: mall 4 till 41 med lås i galleriet', las >= 30, `lås=${las}`)
    await skott(m, 'mallar-test-galleri')

    // Desktop: sidomenyn med huvud, underrader, gråa val och Kom igång.
    const d = await ctx.newPage()
    d.setDefaultNavigationTimeout(90000)
    await d.setViewport(DESKTOP)
    await ga(d, '/dashboard')
    t = await text(d)
    logg('desktop test: Du har Testveckan', t.includes('Du har Testveckan'))
    logg('desktop test: Alla typer, alla nivåer, provläge mot klockan', t.includes('Alla typer, alla nivåer, provläge mot klockan'))
    logg('desktop test: 3 mallar, en nedladdning', t.includes('3 mallar, en nedladdning'))
    logg('desktop test: Ett brev i veckan att läsa', t.includes('Ett brev i veckan att läsa'))
    logg('desktop test: LinkedIn Ingår inte', t.includes('Ingår inte. Finns i CV-veckan och Allt.'))
    logg('desktop test: Kom igång i sidomenyn', /Kom igång/.test(t) && /\d av 8 provade/.test(t))
    logg('desktop test: Vill du ha CV-delen också?', t.includes('Vill du ha CV-delen också?'))
    await skott(d, 'desktop-testveckan-hem')
    // Grått val i menyn öppnar fel spår-kortet.
    await d.evaluate(() => Array.from(document.querySelectorAll('nav[aria-label="Sidomeny"] button[aria-label]')).find((b) => b.getAttribute('aria-label').startsWith('LinkedIn'))?.click())
    await vanta(700)
    t = await text(d)
    logg('desktop test: grått LinkedIn öppnar fel spår', t.includes('Byt till Allt-veckan'))
    await skott(d, 'desktop-testveckan-graval')
    await d.keyboard.press('Escape')
    await vanta(300)
    await d.click('button[aria-label="Konto och inställningar"]').catch(() => {})
    await vanta(500)
    t = await text(d)
    logg('profilmeny test: huvudet', t.includes('Vad ingår?'))
    await skott(d, 'desktop-testveckan-profilmeny')
    await ctx.close()
  }

  /* ---------------------------------------------- 3. Allt */
  {
    const ctx = await browser.createBrowserContext()
    const m = await loggaIn(ctx, KONTON.allt, PIXEL7)
    await ga(m, '/dashboard/vecka/start?premium_activated=true&plan=all_week')
    let t = await text(m)
    logg('välkommen allt: Och ett CV redan', t.includes('Du har Allt. Och ett CV redan.'))
    await skott(m, 'valkommen-allt-med-cv')

    await ga(m, '/dashboard')
    await m.click('[data-komigang-rad="flytande"]').catch(() => {})
    await vanta(700)
    t = await text(m)
    logg('ark allt: elva brickor', /\d+ av 11/.test(t) && t.includes('Kör jobbmatchningen') && t.includes('Bli upptäckt') && t.includes('Fråga jobbcoachen'))
    await skott(m, 'ark-allt')
    await m.keyboard.press('Escape')
    await vanta(300)
    await ga(m, '/dashboard/tester')
    t = await text(m)
    logg('tester allt: inget grått', !/Testveckan 79 kr/.test(t))
    await ctx.close()
  }

  /* ---------------------------------------------- 4. Gratis */
  {
    const ctx = await browser.createBrowserContext()
    const m = await loggaIn(ctx, KONTON.gratis, PIXEL7)
    await ga(m, '/dashboard')
    let t = await text(m)
    logg('hem gratis: Kom igång, n av 5', /Kom igång[\s\S]*\d av 5 provade/.test(t))
    await skott(m, 'hem-gratis-med-rad')

    const d = await ctx.newPage()
    d.setDefaultNavigationTimeout(90000)
    await d.setViewport(DESKTOP)
    await ga(d, '/dashboard/tester')
    t = await text(d)
    logg('desktop gratis: Du är på gratisnivån', t.includes('Du är på gratisnivån'))
    logg('desktop gratis: ingressen', t.includes('Grundnivån i alla fyra typer ingår gratis, en gång per typ och dygn.'))
    logg('desktop gratis: Testveckan 79 kr utan eller Allt', /Testveckan 79 kr(?!, eller)/.test(t))
    logg('desktop gratis: Resultatet utan tolkning', t.includes('Resultatet utan tolkning'))
    logg('desktop gratis: Grundnivån, en gång per typ och dygn i menyn', t.includes('Grundnivån, en gång per typ och dygn'))
    logg('desktop gratis: 10 meddelanden', t.includes('10 meddelanden'))
    logg('desktop gratis: Kom igång n av 5', /\d av 5 provade/.test(t))
    await skott(d, 'desktop-gratis-tester')
    // Grått val öppnar betalväggen (inte fel spår).
    await d.evaluate(() => Array.from(document.querySelectorAll('button[aria-label]')).find((b) => /avancerad\. Ingår inte/.test(b.getAttribute('aria-label')))?.click())
    await vanta(700)
    t = await text(d)
    logg('desktop gratis: betalvägg för Testveckan', /Testveckan/.test(t) && !t.includes('Byt till Allt-veckan'))
    await skott(d, 'desktop-gratis-betalvagg')
    await ctx.close()
  }
} finally {
  await browser.close()
  fs.writeFileSync(path.join(UT, 'resultat.json'), JSON.stringify(resultat, null, 2))
  const fel = resultat.filter((r) => !r.ok)
  console.log(`\n${resultat.length - fel.length} OK, ${fel.length} FEL`)
}
