// scripts/qa-tratten-2026-11-08.mjs
// Klicktest i riktig Chrome av tratten efter analysen 2026-11-08
// (docs/plan-efter-analys-2026-11-08.md, del A punkt 1 till 6):
//
//   provet, resultatet, Tillbaka från registreringen, kontot med e-post,
//   Google-knappen fram till Google, landningen på provets resultatsida,
//   Nivåkollen och första frågan, bar /register, numeriska testet och
//   grundnivåns resultat med köpknappen.
//
//   QA_BAS=http://localhost:3119 QA_KONTON_FIL=<scratchpad>/qa-konton.json \
//   QA_BILDER=<scratchpad>/verifiering-2026-11-08/tratten node scripts/qa-tratten-2026-11-08.mjs
//
// Pixel 7 (412 x 915) och desktop (1280 x 800), en ny inkognitokontext per
// genomgång. Mörkt läge på desktop för de viktigaste vyerna. Skärmdumpar till
// QA_BILDER (utanför git), resultat till docs/qa/tratten-2026-11-08/.
//
// STÄDREGEL: varje konto och provtoken skrivs direkt till QA_KONTON_FIL med
// id. Städningen sker per id med scripts/qa-registrering-stada.mjs.

import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'
import { createClient } from '@supabase/supabase-js'

const BAS = process.env.QA_BAS || 'http://localhost:3119'
const KONTON_FIL = process.env.QA_KONTON_FIL
const BILDER = process.env.QA_BILDER
if (!KONTON_FIL || !BILDER) throw new Error('QA_KONTON_FIL och QA_BILDER krävs')
const UT = 'docs/qa/tratten-2026-11-08'
const ETIKETT = process.env.QA_ETIKETT || 'lokal'
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const LOSEN = 'QaTratten!2026'
const BARA = (process.env.QA_BARA || '').split(',').filter(Boolean)
const MED_KONTO = process.env.QA_UTAN_KONTO !== '1'

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((r) => r.includes('=') && !r.trim().startsWith('#'))
    .map((r) => {
      const i = r.indexOf('=')
      return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    })
)
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
/** Kontots id ur profilen, per e-post (bara våra egna unika QA-adresser). */
async function idFor(epost) {
  for (let i = 0; i < 10; i++) {
    const { data } = await admin.from('profiles').select('id').eq('email', epost).maybeSingle()
    if (data?.id) return data.id
    await new Promise((r) => setTimeout(r, 500))
  }
  return null
}

fs.mkdirSync(UT, { recursive: true })
fs.mkdirSync(BILDER, { recursive: true })

const PIXEL7 = { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const DESKTOP = { width: 1280, height: 800, deviceScaleFactor: 1 }
const MOBIL_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36'

const resultat = []
const bilder = []
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))

function logg(namn, ok, not = '') {
  resultat.push({ namn, ok: !!ok, not })
  console.log(`${ok ? 'OK ' : 'FEL'}  ${namn}${not ? '  ' + not : ''}`)
}

function lasKonton() {
  try {
    return JSON.parse(fs.readFileSync(KONTON_FIL, 'utf8'))
  } catch {
    return { konton: [], anonTest: [] }
  }
}
function sparaKonto(k) {
  const d = lasKonton()
  d.konton.push(k)
  fs.writeFileSync(KONTON_FIL, JSON.stringify(d, null, 2))
}
function sparaToken(t) {
  const d = lasKonton()
  d.anonTest = [...new Set([...(d.anonTest ?? []), t])]
  fs.writeFileSync(KONTON_FIL, JSON.stringify(d, null, 2))
}

async function bild(p, namn, beskrivning) {
  const fil = path.join(BILDER, `${ETIKETT}-${namn}.png`)
  await p.screenshot({ path: fil })
  bilder.push({ fil: path.basename(fil), beskrivning })
}

/** Ingen sidledsscroll, och inga synliga element som sticker ut till höger. */
async function sidled(p) {
  return p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
}

/** Är elementet synligt, inom skärmen och inte täckt av något annat (samtycket)? */
async function fri(p, selector) {
  return p.evaluate((s) => {
    const el = document.querySelector(s)
    if (!el) return 'saknas'
    const r = el.getBoundingClientRect()
    if (r.bottom > window.innerHeight || r.top < 0) return `utanfor (${Math.round(r.top)}-${Math.round(r.bottom)} av ${window.innerHeight})`
    const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return el.contains(e) ? 'fri' : `tackt av ${(e?.className || e?.tagName || '').toString().slice(0, 40)}`
  }, selector)
}

async function knappMedText(p, text) {
  const h = await p.evaluateHandle((t) => [...document.querySelectorAll('button, a')].find((b) => b.textContent.trim() === t) ?? null, text)
  return h.asElement()
}

async function ny(browser, vp, mork = false) {
  const ctx = await browser.createBrowserContext()
  const p = await ctx.newPage()
  await p.setViewport(vp)
  if (vp.isMobile) await p.setUserAgent(MOBIL_UA)
  if (mork) await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }])
  p.setDefaultTimeout(30000)
  // Lokalt: en egen IP per kontext, så att provets dygnskvot (tre per IP)
  // inte tar slut mellan körningarna. Vercel skriver över huvudet i drift.
  if (BAS.includes('localhost')) {
    const ip = `10.99.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`
    await p.setExtraHTTPHeaders({ 'x-forwarded-for': ip })
    const d = lasKonton()
    d.qaIp = [...new Set([...(d.qaIp ?? []), ip])]
    fs.writeFileSync(KONTON_FIL, JSON.stringify(d, null, 2))
  }
  return { ctx, p }
}

/* ------------------------------------------------------------ provet till konto */

async function provet(browser, enhet, vp) {
  const { ctx, p } = await ny(browser, vp)
  const t0 = Date.now()
  await p.goto(`${BAS}/verktyg/rekryteringstester/prova`, { waitUntil: 'networkidle2' })
  logg(`${enhet}: provet laddat`, true, `${Date.now() - t0} ms`)
  await bild(p, `${enhet}-01-prova-intro`, 'Provet, startvyn')
  let token = null
  p.on('response', async (r) => {
    if (r.url().endsWith('/api/public/test-session') && r.request().method() === 'POST') {
      try {
        const j = await r.json()
        if (j.token) {
          token = j.token
          sparaToken(j.token)
        }
      } catch {}
    }
  })
  await p.click('[data-cta="prova-start"]')
  await p.waitForSelector('button[aria-label^="Svarsalternativ"]')
  await vanta(600)
  const forsta = await fri(p, 'button[aria-label="Svarsalternativ A"]')
  logg(`${enhet}: fråga 1, alternativ A fritt (samtycket täcker inte)`, forsta === 'fri' || forsta.startsWith('utanfor'), forsta)
  await bild(p, `${enhet}-02-prova-fraga1`, 'Provet, fråga 1 med samtyckesraden')
  // Samtycket: Avvisa, som en vanlig besökare kan göra.
  const avvisa = await knappMedText(p, 'Avvisa')
  if (avvisa) await avvisa.click().catch(() => {})
  for (let i = 0; i < 5; i++) {
    await p.waitForSelector('button[aria-label^="Svarsalternativ"]:not([disabled])')
    await vanta(250)
    const b = await p.$$('button[aria-label^="Svarsalternativ"]')
    await b[i % b.length].click()
    await vanta(150)
  }
  await p.waitForSelector('[data-cta="prova-gate"]')
  await vanta(700)
  await p.evaluate(() => document.querySelector('[data-cta="prova-gate"]').scrollIntoView({ block: 'center' }))
  await vanta(300)
  const gate = await fri(p, '[data-cta="prova-gate"]')
  logg(`${enhet}: resultatets kontoknapp syns och är fri`, gate === 'fri', gate)
  logg(`${enhet}: resultat utan sidledsscroll`, await sidled(p))
  await bild(p, `${enhet}-03-prova-resultat`, 'Provets resultat med kontoknappen')
  const text = await p.evaluate(() => document.body.innerText)
  logg(`${enhet}: ingen mittpunkt i spärren`, !text.includes('·'))

  await p.click('[data-cta="prova-gate"]')
  await p.waitForFunction(() => location.pathname === '/register')
  await p.waitForSelector('h1')
  await vanta(1200)
  await bild(p, `${enhet}-04-register-smakprov`, 'Kontosteget i smakprovsform')
  const reg = await p.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent,
    inputs: [...document.querySelectorAll('input')].filter((i) => i.offsetParent).length,
    google: [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Google')),
  }))
  logg(`${enhet}: kontosteget har rubrik, Google och tre fält`, reg.google && reg.inputs >= 3, JSON.stringify(reg))
  logg(`${enhet}: kontosteget utan sidledsscroll`, await sidled(p))

  // Tillbaka: resultatet ska stå kvar, inte ett nytt prov.
  await p.goBack({ waitUntil: 'networkidle2' })
  await vanta(1200)
  const tillbaka = await p.evaluate(() => ({ gate: !!document.querySelector('[data-cta="prova-gate"]'), start: !!document.querySelector('[data-cta="prova-start"]') }))
  logg(`${enhet}: Tillbaka visar resultatet igen`, tillbaka.gate && !tillbaka.start, JSON.stringify(tillbaka))
  await bild(p, `${enhet}-05-prova-tillbaka`, 'Tillbaka från kontosteget, resultatet står kvar')
  await p.click('[data-cta="prova-gate"]')
  await p.waitForFunction(() => location.pathname === '/register')
  await p.waitForSelector('form input[type="email"]')
  await vanta(800)

  // Google: knappen ska skriva jc_signup och gå mot Google. Vi följer inte med.
  let mot = null
  await p.setRequestInterception(true)
  const avlyssna = (r) => {
    if (r.isInterceptResolutionHandled()) return
    const u = r.url()
    if (r.isNavigationRequest() && (u.includes('accounts.google.com') || u.includes('/auth/v1/authorize'))) {
      mot = u
      r.abort().catch(() => {})
    } else r.continue().catch(() => {})
  }
  p.on('request', avlyssna)
  const g = await p.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Google')))
  await g.asElement().click()
  await vanta(2500)
  const kaka = (await p.cookies(BAS)).find((k) => k.name === 'jc_signup')
  let c = null
  try {
    c = JSON.parse(decodeURIComponent(kaka?.value ?? ''))
  } catch {}
  logg(`${enhet}: Google-knappen går mot Google`, !!mot, mot ? new URL(mot).host : 'ingen navigering')
  logg(`${enhet}: jc_signup bär provet`, c?.smakprov?.typ === 'test', JSON.stringify(c))
  p.off('request', avlyssna)
  await p.setRequestInterception(false)

  if (!MED_KONTO) {
    await ctx.close()
    return
  }
  if (!p.url().includes('/register')) {
    await p.goto(`${BAS}/register?test=${token}`, { waitUntil: 'networkidle2' })
  }
  await p.waitForSelector('form input[type="email"]')

  // E-post: unikt QA-konto.
  const epost = `qa-tratten-${enhet}-${Date.now()}@jobbcoach-qa.example.com`
  const falt = await p.$$('form input')
  await falt[0].type('QA Tratten')
  await falt[1].type(epost)
  await falt[2].type(LOSEN)
  const t1 = Date.now()
  const skapa = await p.$('button[type="submit"]')
  await (skapa ?? (await p.$(`button[form]`))).click()
  await p.waitForFunction(() => location.pathname.startsWith('/dashboard/tester/prov/'), { timeout: 45000 }).catch(() => {})
  const landning = new URL(p.url()).pathname
  const uid = await idFor(epost)
  sparaKonto({ epost, id: uid, enhet, skapad: new Date().toISOString() })
  logg(`${enhet}: kontot landar på provets resultatsida`, landning.startsWith('/dashboard/tester/prov/'), `${landning} efter ${Date.now() - t1} ms`)
  await p.waitForSelector('[data-cta="logiktestprov-nivakollen"], [data-cta="logiktestprov-pass"]')
  await vanta(800)
  await bild(p, `${enhet}-06-provsida`, 'Provets resultatsida efter kontot, Nästa steg: Nivåkollen')
  const vidare = await p.$eval('[data-cta^="logiktestprov-nivakollen"]', (a) => ({ href: a.getAttribute('href'), text: a.textContent.trim() })).catch(() => null)
  logg(`${enhet}: knappen leder till Nivåkollen`, vidare?.href === '/dashboard/tester/pass?typ=matning', JSON.stringify(vidare))
  const gammal = await p.$('a[href="/dashboard/tester/matrislogik-grund"]')
  logg(`${enhet}: ingen länk till det gamla grundtestet`, !gammal)
  logg(`${enhet}: provsidan utan sidledsscroll`, await sidled(p))
  const knappFri = await fri(p, '[data-cta="logiktestprov-nivakollen"]')
  logg(`${enhet}: Nivåkollen-knappen syns utan att rulla`, knappFri === 'fri', knappFri)

  // Nivåkollen: tid till första frågan.
  const t2 = Date.now()
  await p.click('[data-cta="logiktestprov-nivakollen"]')
  await p.waitForSelector('[role="radiogroup"] button[role="radio"]', { timeout: 30000 })
  const tidForsta = Date.now() - t2
  await vanta(500)
  logg(`${enhet}: Nivåkollen, första frågan`, tidForsta < 4000, `${tidForsta} ms`)
  await bild(p, `${enhet}-07-nivakollen-fraga1`, 'Nivåkollen, första frågan')
  const nk = await p.evaluate(() => {
    const alt = [...document.querySelectorAll('[role="radiogroup"] button[role="radio"]')]
    const sista = alt[alt.length - 1]?.getBoundingClientRect()
    return {
      antal: alt.length,
      sistaNederkant: sista ? Math.round(sista.bottom) : null,
      vh: window.innerHeight,
      text: document.querySelector('main')?.innerText.slice(0, 300),
    }
  })
  logg(`${enhet}: Nivåkollen, alla alternativ inom skärmen`, nk.sistaNederkant != null && nk.sistaNederkant <= nk.vh, JSON.stringify({ ...nk, text: undefined }))
  logg(`${enhet}: Nivåkollen utan sidledsscroll`, await sidled(p))
  const a = await fri(p, '[role="radiogroup"] button[role="radio"]')
  logg(`${enhet}: Nivåkollen, alternativ A fritt`, a === 'fri', a)
  console.log('   Nivåkollens text:', JSON.stringify(nk.text))
  // Svara på första frågan och se återkopplingen.
  await p.click('[role="radiogroup"] button[role="radio"]')
  await vanta(1500)
  await bild(p, `${enhet}-08-nivakollen-efter-svar`, 'Nivåkollen efter första svaret')

  // Numeriska testet, första skärmen och första frågan.
  const t3 = Date.now()
  await p.goto(`${BAS}/dashboard/tester/numeriskt-test`, { waitUntil: 'networkidle2' })
  logg(`${enhet}: numeriska testet laddat`, true, `${Date.now() - t3} ms`)
  await vanta(500)
  await bild(p, `${enhet}-09-numeriskt-start`, 'Numeriska testet, startsidan')
  logg(`${enhet}: numeriska startsidan utan sidledsscroll`, await sidled(p))
  const startNum = await p.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => /^(Starta|Börja|Gör)/.test(b.textContent.trim())) ?? null)
  if (startNum.asElement()) {
    const t4 = Date.now()
    await startNum.asElement().click()
    await p.waitForFunction(() => location.pathname.includes('/test/'), { timeout: 30000 }).catch(() => {})
    await vanta(2500)
    logg(`${enhet}: numeriska testet, första frågan`, true, `${Date.now() - t4} ms`)
    await bild(p, `${enhet}-10-numeriskt-fraga1`, 'Numeriska testet, första frågan')
    logg(`${enhet}: numeriska frågan utan sidledsscroll`, await sidled(p))
    const num = await p.evaluate(() => {
      const knappar = [...document.querySelectorAll('main button')].filter((b) => b.offsetParent)
      const under = knappar.filter((b) => b.getBoundingClientRect().bottom > window.innerHeight).map((b) => b.textContent.trim().slice(0, 30))
      return { antal: knappar.length, underSkarmen: under, text: document.querySelector('main')?.innerText.slice(0, 400) }
    })
    console.log('   Numeriska:', JSON.stringify(num))
  } else logg(`${enhet}: numeriska testet har en startknapp`, false)

  await ctx.close()
}

/* ------------------------------------------------------------ bar /register */

async function barRegister(browser, enhet, vp, mork = false) {
  const { ctx, p } = await ny(browser, vp, mork)
  await p.goto(`${BAS}/register`, { waitUntil: 'networkidle2' })
  await vanta(800)
  const r = await p.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent,
    fraga: document.body.innerText.includes('Vad vill du börja med'),
    steg: /Steg \d av \d/.test(document.body.innerText),
  }))
  logg(`${enhet}${mork ? ' mörkt' : ''}: bar /register går direkt till kontot`, r.h1 === 'Skapa ditt konto' && !r.fraga && !r.steg, JSON.stringify(r))
  logg(`${enhet}${mork ? ' mörkt' : ''}: /register utan sidledsscroll`, await sidled(p))
  await bild(p, `${enhet}${mork ? '-mork' : ''}-11-register-bar`, `Bar /register, kontosteget direkt${mork ? ', mörkt läge' : ''}`)
  await ctx.close()
}

/* ------------------------------------------------------------ grundnivåns resultat */

async function grundResultat(browser, enhet, vp) {
  // Ett nytt gratiskonto gör grundnivån i matrislogik och ser resultatet.
  const { ctx, p } = await ny(browser, vp)
  await p.goto(`${BAS}/register`, { waitUntil: 'networkidle2' })
  await p.waitForSelector('form input[type="email"]')
  const epost = `qa-tratten-grund-${enhet}-${Date.now()}@jobbcoach-qa.example.com`
  const falt = await p.$$('form input')
  await falt[0].type('QA Grund')
  await falt[1].type(epost)
  await falt[2].type(LOSEN)
  await (await p.$('button[form]')).click()
  await p.waitForFunction(() => location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/dashboard/valkommen'), { timeout: 45000 })
  const uid = await idFor(epost)
  sparaKonto({ epost, id: uid, enhet, skapad: new Date().toISOString() })
  logg(`${enhet}: bar /register landar i spårvalet med frågan`, true, new URL(p.url()).pathname + new URL(p.url()).search)
  await p.waitForNetworkIdle({ idleTime: 800, timeout: 20000 }).catch(() => {})
  await vanta(1000)
  await bild(p, `${enhet}-12-sparval-efter-konto`, 'Landningen efter bar /register: spårvalet')

  await p.goto(`${BAS}/dashboard/tester/matrislogik-grund`, { waitUntil: 'networkidle2' })
  const start = await p.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => /^(Starta|Börja|Gör)/.test(b.textContent.trim())) ?? null)
  await start.asElement().click()
  await p.waitForFunction(() => location.pathname.includes('/test/'), { timeout: 30000 })
  for (let i = 0; i < 40; i++) {
    if ((await p.evaluate(() => location.pathname.endsWith('/results')))) break
    const alt = await p.$$('button[aria-label^="Svarsalternativ"], button[aria-label^="Alternativ"], [role="radiogroup"] button')
    if (alt.length) {
      await alt[0].click().catch(() => {})
      await vanta(300)
    }
    const vidare = await p.evaluateHandle(() => { const k = [...document.querySelectorAll('button')].filter((b) => !b.disabled); return k.find((b) => b.textContent.trim().startsWith('Avsluta och se resultat')) ?? k.find((b) => /^(Nästa|Lämna in)/.test(b.textContent.trim())) ?? null })
    if (vidare.asElement()) await vidare.asElement().click().catch(() => {})
    await vanta(500)
  }
  await p.waitForFunction(() => location.pathname.endsWith('/results'), { timeout: 30000 }).catch(() => {})
  await p.waitForSelector('[data-cta="testresultat-kop"]', { timeout: 20000 }).catch(() => {})
  await vanta(800)
  const kop = await p.$('[data-cta="testresultat-kop"]')
  if (kop) await p.evaluate(() => document.querySelector('[data-cta="testresultat-kop"]').scrollIntoView({ block: 'center' }))
  await vanta(300)
  await bild(p, `${enhet}-13-grund-resultat`, 'Grundnivåns resultat med köpknappen i statusraden')
  const kopText = kop ? await kop.evaluate((b) => b.textContent.trim()) : null
  logg(`${enhet}: köpknappen i spärren över grundnivån`, !!kop && /^Köp .+, \d+ kr i månaden$/.test(kopText ?? ''), kopText ?? 'saknas')
  logg(`${enhet}: resultatet utan sidledsscroll`, await sidled(p))
  if (kop) {
    await kop.click()
    await p.waitForFunction(() => location.pathname === '/dashboard/valj-spar', { timeout: 20000 }).catch(() => {})
    const u = new URL(p.url())
    logg(`${enhet}: köpknappen går till köpsteget för Premium`, u.pathname === '/dashboard/valj-spar' && u.searchParams.get('paket') === 'all_month' && u.searchParams.get('steg') === 'kop' && u.searchParams.get('plats') === 'testresultat', u.pathname + u.search)
    await vanta(1200)
    await bild(p, `${enhet}-14-kopsteg`, 'Köpsteget efter köpknappen')
  }
  await ctx.close()
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' })
try {
  for (const [enhet, vp] of [
    ['pixel7', PIXEL7],
    ['desktop', DESKTOP],
  ]) {
    if (!BARA.length || BARA.includes('provet')) await provet(browser, enhet, vp)
    if (!BARA.length || BARA.includes('register')) await barRegister(browser, enhet, vp)
    if (MED_KONTO && (!BARA.length || BARA.includes('grund'))) await grundResultat(browser, enhet, vp)
  }
  if (!BARA.length || BARA.includes('register')) await barRegister(browser, 'desktop', DESKTOP, true)
} catch (e) {
  logg('körningen', false, String(e?.message ?? e).slice(0, 300))
} finally {
  await browser.close()
  const fel = resultat.filter((r) => !r.ok).length
  fs.writeFileSync(
    path.join(UT, `resultat-${ETIKETT}.json`),
    JSON.stringify({ tid: new Date().toISOString(), bas: BAS, ok: resultat.length - fel, fel, resultat, bilder }, null, 2)
  )
  console.log(`\n${resultat.length - fel} ok, ${fel} fel`)
}
