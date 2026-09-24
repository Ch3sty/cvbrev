// scripts/qa-registrering.mjs
// Klicktest i riktig Chrome av registreringstratten och profilen
// (docs/design/profil-registrering-spec-2026-09-24.md), våg för våg.
//
//   node scripts/qa-registrering.mjs 1     # våg 1: skalet, lägena, lösenordsvägen
//   node scripts/qa-registrering.mjs 2     # våg 2: tratten, steg 3, Kom igång, hemskärmen
//   node scripts/qa-registrering.mjs 3     # våg 3: menyn och prenumerationen
//   node scripts/qa-registrering.mjs 4     # våg 4: profilsidan
//
// Kräver ett produktionsbygge på QA_BAS (standard http://localhost:3119).
// Varje genomgång är en ny inkognitokontext. Skärmdumpar till
// docs/qa/registrering/, resultat i docs/qa/registrering/resultat-vag-N.json.
//
// STÄDREGEL: varje konto och token som skapas skrivs direkt till
// QA_KONTON_FIL (scratchpad/qa-konton.json) med id. Städningen sker per id
// med scripts/qa-registrering-stada.mjs, aldrig per mönster eller tid.

import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'
import { createClient } from '@supabase/supabase-js'

const VAG = Number(process.argv[2] || '1')
const BAS = process.env.QA_BAS || 'http://localhost:3119'
const UT = 'docs/qa/registrering'
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const KONTON_FIL = process.env.QA_KONTON_FIL
if (!KONTON_FIL) throw new Error('QA_KONTON_FIL saknas')
const LOSEN = 'QaRegistrering!2026'
const DATUM = '20260924'

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

fs.mkdirSync(UT, { recursive: true })

export const PIXEL7 = {
  width: 412,
  height: 915,
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
}
export const DESKTOP = { width: 1280, height: 800, deviceScaleFactor: 1 }
const MOBIL_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36'

const resultat = []
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))

function logg(namn, ok, not = '') {
  resultat.push({ namn, ok: !!ok, not })
  console.log(`${ok ? 'OK ' : 'FEL'}  ${namn}${not ? '  ' + not : ''}`)
}

/* ------------------------------------------------------------ konton, per id */

function lasKonton() {
  try {
    return JSON.parse(fs.readFileSync(KONTON_FIL, 'utf8'))
  } catch {
    return { konton: [], anonTest: [], anonIntervju: [] }
  }
}
function sparaKonton(k) {
  fs.writeFileSync(KONTON_FIL, JSON.stringify(k, null, 2))
}
let loptal = lasKonton().konton.length
export function nyEpost(tagg) {
  loptal += 1
  return `qa-reg-${DATUM}-${loptal}-${tagg}@jobbcoach.ai`
}
/** Slår upp id för en adress som just registrerats i webbläsaren och skriver det till filen. */
async function registreraId(email, tagg) {
  for (let i = 0; i < 10; i++) {
    const { data } = await admin.from('profiles').select('id').eq('email', email).maybeSingle()
    if (data?.id) {
      const k = lasKonton()
      if (!k.konton.find((x) => x.id === data.id)) k.konton.push({ id: data.id, email, tagg, skapad: new Date().toISOString() })
      sparaKonton(k)
      return data.id
    }
    await vanta(800)
  }
  return null
}
function sparaToken(typ, token) {
  const k = lasKonton()
  k[typ] = k[typ] ?? []
  if (!k[typ].includes(token)) k[typ].push(token)
  sparaKonton(k)
}

/* ------------------------------------------------------------ webbläsaren */

let bildNr = 0
async function skott(page, namn, fullPage = false) {
  bildNr += 1
  const fil = path.join(UT, `v${VAG}-${String(bildNr).padStart(2, '0')}-${namn}.png`)
  await page.screenshot({ path: fil, fullPage })
  return fil
}
const text = (p) => p.evaluate(() => document.body.innerText)

async function nySida(browser, vy) {
  const ctx = await browser.createBrowserContext()
  const p = await ctx.newPage()
  p.setDefaultNavigationTimeout(90000)
  await p.setViewport(vy)
  if (vy.isMobile) await p.setUserAgent(MOBIL_UA)
  const fel = []
  p.on('pageerror', (e) => fel.push(String(e.message).slice(0, 200)))
  return { p, ctx, fel }
}

async function ga(p, url) {
  await p.goto(BAS + url, { waitUntil: 'networkidle2' })
  await vanta(800)
  // Cookie-samtycket i en ny session.
  await p.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((e) => /^(Acceptera|Godkänn)/.test(e.innerText.trim()))
    b?.click()
  })
  await vanta(300)
}

async function klickaText(p, sel, borjar) {
  return p.evaluate(
    (s, t) => {
      const el = [...document.querySelectorAll(s)].find((e) => (e.innerText || '').trim().startsWith(t))
      if (!el) return false
      el.scrollIntoView({ block: 'center' })
      el.click()
      return true
    },
    sel,
    borjar
  )
}

async function fyllKonto(p, { namn, email }) {
  await p.waitForSelector('input[autocomplete="name"]')
  await p.type('input[autocomplete="name"]', namn)
  await p.type('input[type="email"]', email)
  await p.type('input[type="password"]', LOSEN)
}

async function skapaKonto(p, { namn, email }) {
  await fyllKonto(p, { namn, email })
  await Promise.all([
    p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
    p.click('footer button[type="submit"]'),
  ])
  // Valkommen-sidan kör kedjan och skickar vidare.
  for (let i = 0; i < 20 && p.url().includes('/register'); i++) await vanta(500)
  for (let i = 0; i < 20 && p.url().includes('/dashboard/valkommen'); i++) await vanta(500)
  await vanta(1500)
}

async function loggaIn(p, email) {
  await ga(p, '/login')
  await p.type('input[type="email"]', email)
  await p.type('input[type="password"]', LOSEN)
  await Promise.all([
    p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
    p.click('footer button[type="submit"]'),
  ])
  await vanta(2000)
}

/** Nästa CLS-mätning: summan av layout-shift utan input, sedan sidladdning. */
async function cls(p) {
  return p.evaluate(
    () =>
      new Promise((resolve) => {
        let s = 0
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) if (!e.hadRecentInput) s += e.value
        }).observe({ type: 'layout-shift', buffered: true })
        setTimeout(() => resolve(Math.round(s * 1000) / 1000), 600)
      })
  )
}

/* ============================================================ våg 1 */

async function vag1(browser) {
  for (const [vyNamn, vy] of [
    ['pixel7', PIXEL7],
    ['desktop', DESKTOP],
  ]) {
    // 1. Bar /register.
    {
      const { p, ctx, fel } = await nySida(browser, vy)
      await ga(p, '/register')
      const t = await text(p)
      logg(`${vyNamn} bar: rubrik Skapa ditt konto`, t.includes('Skapa ditt konto'))
      logg(`${vyNamn} bar: inga osanna påståenden`, !/Fem dagar|12 487|94 ?%|AI-verktyg|CV:n skapade/.test(t))
      logg(`${vyNamn} bar: Google först`, t.indexOf('Fortsätt med Google') < t.indexOf('eller med e-post'))
      logg(`${vyNamn} bar: ingen footer`, !(await p.$('footer.site-footer')) && !/Om oss\s+Kontakt/.test(t))
      logg(`${vyNamn} bar: CLS 0`, (await cls(p)) === 0)
      await skott(p, `${vyNamn}-register-bar`)
      logg(`${vyNamn} bar: inga sidfel`, fel.length === 0, fel.join(' | '))
      await ctx.close()
    }
    // 2. ?borja=tester.
    {
      const { p, ctx } = await nySida(browser, vy)
      await ga(p, '/register?borja=tester')
      const t = await text(p)
      logg(`${vyNamn} borja: valraden`, t.includes('Du börjar med rekryteringstesterna'))
      await skott(p, `${vyNamn}-register-borja-tester`)
      await ctx.close()
    }
    // 3. Smakprovet, intervju.
    {
      const { p, ctx } = await nySida(browser, vy)
      await ga(p, '/register?intervju=0b4f7a53-8b8e-4a44-9d2d-2f1f7b3c1e11')
      const t = await text(p)
      logg(`${vyNamn} smakprov: rubrik`, t.includes('Skapa konto och läs hela återkopplingen'))
      logg(`${vyNamn} smakprov: knapp`, t.includes('Skapa konto och läs återkopplingen'))
      logg(`${vyNamn} smakprov: statusrad`, t.includes('Ditt svar är sparat i sju dagar'))
      await skott(p, `${vyNamn}-register-smakprov-intervju`)
      await ctx.close()
    }
    // 4. /login.
    {
      const { p, ctx, fel } = await nySida(browser, vy)
      await ga(p, '/login')
      const t = await text(p)
      logg(`${vyNamn} login: nya skalet`, t.includes('Logga in') && t.includes('Har du inget konto?'))
      logg(`${vyNamn} login: inga osanna påståenden`, !/12 487|94 ?%|AI-verktyg/.test(t))
      await skott(p, `${vyNamn}-login`)
      logg(`${vyNamn} login: inga sidfel`, fel.length === 0, fel.join(' | '))
      await ctx.close()
    }
  }

  // 5. Lösenord från ?paket=all_month (Pixel 7): landar på spårvalet med paketet.
  const epostPaket = nyEpost('paket')
  {
    const { p, ctx } = await nySida(browser, PIXEL7)
    await ga(p, '/register?paket=all_month')
    await skott(p, 'pixel7-register-paket')
    await skapaKonto(p, { namn: 'Anna Paket', email: epostPaket })
    const id = await registreraId(epostPaket, 'paket')
    logg('paket: kontot skapat', Boolean(id), id ?? '')
    logg('paket: landar på valj-spar med paketet', p.url().includes('/dashboard/valj-spar?paket=all_month'), p.url().replace(BAS, ''))
    await skott(p, 'pixel7-paket-landning')
    await ctx.close()
  }

  // 6. Adressen finns redan: felraden med Logga in (desktop).
  {
    const { p, ctx } = await nySida(browser, DESKTOP)
    await ga(p, '/register?borja=cv')
    await fyllKonto(p, { namn: 'Anna Paket', email: epostPaket })
    await p.click('footer button[type="submit"]')
    await vanta(3000)
    const t = await text(p)
    logg('finns: felraden', t.includes('Det finns redan ett konto med den adressen'))
    const href = await p.evaluate(() => [...document.querySelectorAll('[role="alert"] a')].map((a) => a.getAttribute('href'))[0])
    logg('finns: Logga in bär valet', href === '/login?borja=cv', href ?? '')
    await skott(p, 'desktop-register-finns-redan')
    await ctx.close()
  }

  // 7. Testprovet utan konto, sedan lösenord: hämtkedjan på valkommen.
  {
    const res = await fetch(BAS + '/api/public/test-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    const j = await res.json().catch(() => ({}))
    if (j?.token) {
      sparaToken('anonTest', j.token)
      const epost = nyEpost('testprov')
      const { p, ctx } = await nySida(browser, PIXEL7)
      await ga(p, `/register?test=${encodeURIComponent(j.token)}`)
      const t = await text(p)
      logg('testprov: rubrik', t.includes('Skapa konto och se alla svar med förklaring'))
      await skott(p, 'pixel7-register-smakprov-test')
      await skapaKonto(p, { namn: 'Anna Testprov', email: epost })
      const id = await registreraId(epost, 'testprov')
      logg('testprov: kontot skapat', Boolean(id), id ?? '')
      logg('testprov: landar på testerna via hämtkedjan', p.url().includes('/dashboard/tester'), p.url().replace(BAS, ''))
      await skott(p, 'pixel7-testprov-landning')
      await ctx.close()
    } else {
      logg('testprov: kunde inte skapa token', false, JSON.stringify(j).slice(0, 200))
    }
  }

  // 8. Bar /register med lösenord (desktop): landar via valkommen.
  {
    const epost = nyEpost('bar')
    const { p, ctx } = await nySida(browser, DESKTOP)
    await ga(p, '/register')
    await skapaKonto(p, { namn: 'Anna Bar', email: epost })
    const id = await registreraId(epost, 'bar')
    logg('bar: kontot skapat', Boolean(id), id ?? '')
    logg('bar: landar på spårvalet', p.url().includes('/dashboard/valj-spar'), p.url().replace(BAS, ''))
    await skott(p, 'desktop-bar-landning')
    await ctx.close()
  }
}

/* ============================================================ kör */

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--lang=sv-SE'],
})
try {
  if (VAG === 1) await vag1(browser)
  else {
    const mod = await import(`./qa-registrering-vag${VAG}.mjs`)
    await mod.kor({ browser, ga, nySida, skott, text, logg, klickaText, fyllKonto, skapaKonto, loggaIn, registreraId, nyEpost, sparaToken, cls, vanta, admin, BAS, PIXEL7, DESKTOP, LOSEN })
  }
} catch (e) {
  logg('oväntat fel', false, String(e?.stack ?? e).slice(0, 400))
} finally {
  await browser.close()
  fs.writeFileSync(path.join(UT, `resultat-vag-${VAG}.json`), JSON.stringify(resultat, null, 2))
  const fel = resultat.filter((r) => !r.ok)
  console.log(`\n${resultat.length - fel.length} av ${resultat.length} OK`)
}
