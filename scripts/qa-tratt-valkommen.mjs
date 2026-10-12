// scripts/qa-tratt-valkommen.mjs
// Klicktest i riktig Chrome av rättelserna efter undersökningen 2026-10-12:
// smakprovet utan regel före svar, registrering med e-post och valet tester,
// välkomststeget, planen, Nivåkollen, resultatet och I morgon-kortet.
// 360 och 1280, ljust. Ett vanligt gratiskonto per vy, skapat i formuläret.
//
//   node scripts/qa-tratt-valkommen.mjs --port 3127
//
// Konton och smakprovstoken skrivs till scripts/.qa-tratt-konton.json med id
// och token; städningen sker per id och token (feedback_testdata_stadning).

import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((r) => r.includes('=') && !r.trim().startsWith('#'))
    .map((r) => {
      const i = r.indexOf('=')
      return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    })
)
const arg = (n, f) => {
  const i = process.argv.indexOf('--' + n)
  return i >= 0 ? process.argv[i + 1] : f
}
const BAS = `http://localhost:${arg('port', '3127')}`
const UT = path.resolve('docs/qa/tratt-valkommen')
const KONTOFIL = path.resolve('scripts/.qa-tratt-konton.json')
fs.mkdirSync(UT, { recursive: true })
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const BRUS = [/googletagmanager/i, /posthog/i, /favicon/i, /net::ERR_ABORTED/i, /Failed to load resource/i, /turnstile/i]

const lasFil = () => (fs.existsSync(KONTOFIL) ? JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) : { konton: [], tokens: [] })
const sparaFil = (k) => fs.writeFileSync(KONTOFIL, JSON.stringify(k, null, 2))

const resultat = []
const logg = (vy, namn, ok, not = '') => {
  resultat.push({ vy, namn, ok: !!ok, not })
  console.log(`${ok ? 'OK ' : 'FEL'} [${vy}] ${namn}${not ? '  ' + not : ''}`)
}

const VYER = {
  m360: { width: 360, height: 740, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  d1280: { width: 1280, height: 800, deviceScaleFactor: 1 },
}
const MOBIL_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36'

async function nySida(browser, vyNamn) {
  const ctx = await browser.createBrowserContext()
  const p = await ctx.newPage()
  p.setDefaultNavigationTimeout(90000)
  await p.setViewport(VYER[vyNamn])
  if (VYER[vyNamn].isMobile) await p.setUserAgent(MOBIL_UA)
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }])
  await p.setCookie({ name: 'cvBrevCookieConsent', value: 'false', url: BAS, path: '/' })
  const fel = []
  p.on('pageerror', (e) => fel.push('pageerror: ' + String(e.message).slice(0, 200)))
  p.on('console', (m) => {
    if (m.type() === 'error' && !BRUS.some((r) => r.test(m.text()))) fel.push(m.text().slice(0, 200))
  })
  return { p, ctx, fel }
}

let nr = 0
async function bild(p, vy, namn) {
  nr += 1
  await p.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})
  await p.screenshot({ path: path.join(UT, `${vy}-${String(nr).padStart(2, '0')}-${namn}.png`) })
}
const text = (p) => p.evaluate(() => document.body.innerText)
const klickaText = (p, sel, borjar) =>
  p.evaluate(
    (s, t) => {
      const el = [...document.querySelectorAll(s)].find((e) => (e.innerText || '').trim().startsWith(t) && !e.disabled)
      if (!el) return false
      el.scrollIntoView({ block: 'center' })
      el.click()
      return true
    },
    sel,
    borjar
  )

/* ------------------------------------------------------------ smakprovet */

async function smakprov(browser, vy) {
  const { p, ctx, fel } = await nySida(browser, vy)
  const svar = []
  p.on('response', async (r) => {
    if (r.url().includes('/api/public/test-session') && r.request().method() === 'POST') {
      try {
        svar.push(await r.text())
      } catch {}
    }
  })
  await p.goto(BAS + '/verktyg/rekryteringstester/prova', { waitUntil: 'networkidle2' })
  await vanta(600)
  await klickaText(p, 'button', 'Starta provet')
  await p.waitForSelector('button[aria-label^="Svarsalternativ"]', { timeout: 30000 })
  await vanta(500)
  await bild(p, vy, 'smakprov-fraga1')
  const start = JSON.parse(svar[0] ?? '{}')
  const k = lasFil()
  if (start.token) {
    k.tokens.push(start.token)
    sparaFil(k)
  }
  const fragor = start.questions ?? []
  const nycklar = [...new Set(fragor.flatMap((q) => Object.keys(q)))].sort()
  logg(vy, 'startsvaret har fem frågor', fragor.length === 5, `${fragor.length}`)
  logg(vy, 'startsvaret saknar rule, title, correctAnswer, facit', !/"(rule|title|correctAnswer|correct|facit|explanation|misstag)"/.test(svar[0] ?? ''), nycklar.join(','))
  // Regeltexten finns i banken på servern: jämför mot den.
  const sidtext = await text(p)
  logg(vy, 'ingen regel eller titel ovanför frågan', !/Läs rutorna|Varje rad och varje kolumn|grader (med|mot)urs/.test(sidtext))
  for (let i = 0; i < 5; i++) {
    await p.waitForSelector('button[aria-label^="Svarsalternativ"]:not([disabled])', { timeout: 20000 }).catch(() => {})
    await p.click('button[aria-label^="Svarsalternativ"]')
    await vanta(400)
  }
  await p.waitForFunction(() => document.body.innerText.includes('rätt'), { timeout: 30000 })
  await vanta(600)
  await bild(p, vy, 'smakprov-resultat')
  const ratt = svar[1] ?? ''
  logg(vy, 'rättningssvaret saknar per-fråga-facit', !/"(rule|title|correctAnswer|facit|misstag)"/.test(ratt), ratt.slice(0, 80))
  logg(vy, 'smakprovet utan sidfel', fel.length === 0, fel.join(' | '))
  await ctx.close()
}

/* ------------------------------------------------------------ registrering till I morgon */

async function registrering(browser, vy) {
  const { p, ctx, fel } = await nySida(browser, vy)
  const ts = Date.now()
  const email = `qa-g-${ts}@jobbcoach-qa.test`
  await p.goto(BAS + '/register?borja=tester', { waitUntil: 'networkidle2' })
  await vanta(800)
  // Steg 1 kan vara förvalt; annars välj tester och fortsätt.
  if ((await text(p)).includes('Vad vill du börja med?')) {
    await klickaText(p, 'button, [role="radio"]', 'Klara rekryteringstesterna')
    await vanta(300)
    await klickaText(p, 'footer button', 'Fortsätt')
    await vanta(800)
  }
  await p.waitForSelector('input[autocomplete="name"]', { timeout: 30000 })
  await bild(p, vy, 'registrering-konto')
  await p.type('input[autocomplete="name"]', 'Greta Gratis')
  await p.type('input[type="email"]', email)
  await p.type('input[type="password"]', `QaTratt!${ts}`)
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}), p.click('footer button[type="submit"]')])
  for (let i = 0; i < 30 && !p.url().includes('/dashboard/valkommen'); i++) await vanta(500)
  await vanta(1500)
  const { data: prof } = await sb.from('profiles').select('id, email, subscription_tier, premium_until').eq('email', email).maybeSingle()
  if (prof?.id) {
    const k = lasFil()
    k.konton.push({ id: prof.id, email })
    sparaFil(k)
  }
  logg(vy, 'kontot skapat, vanligt gratiskonto', prof?.id && prof.subscription_tier === 'free' && !prof.premium_until, `${email} ${prof?.id ?? 'saknas'} ${p.url().replace(BAS, '')}`)

  // Välkomststeget.
  await p.waitForFunction(() => document.body.innerText.includes('Steg 3 av 3'), { timeout: 30000 }).catch(() => {})
  await vanta(800)
  await bild(p, vy, 'valkommen')
  const v = await p.evaluate(() => {
    const knappar = [...document.querySelectorAll('button.knapp-primar, a.knapp-primar')].filter((b) => b.getBoundingClientRect().width > 0)
    const k = knappar[0]
    const r = k?.getBoundingClientRect()
    const t = document.body.innerText
    return {
      primara: knappar.map((b) => b.innerText.trim()),
      synlig: r ? r.top >= 0 && r.bottom <= innerHeight : false,
      kopLank: [...document.querySelectorAll('button')].some((b) => b.innerText.trim().startsWith('Köp Premium') && !b.className.includes('knapp-primar')),
      premiumForeGratis: t.indexOf('149 kr') >= 0 && t.indexOf('149 kr') < t.indexOf('Gratis, utan kort'),
      borjaGratis: t.includes('Börja gratis'),
      mittpunkt: /·/.test(t),
      talstreck: /—/.test(t),
    }
  })
  logg(vy, 'välkomst: en kopparknapp "Kolla min nivå, 8 min"', v.primara.length === 1 && v.primara[0] === 'Kolla min nivå, 8 min', v.primara.join(' | '))
  logg(vy, 'välkomst: kopparknappen synlig utan scroll', v.synlig)
  logg(vy, 'välkomst: Premium under gratis, köpet som textlänk', !v.premiumForeGratis && v.kopLank && !v.borjaGratis)
  logg(vy, 'välkomst: inga mittpunkter eller talstreck', !v.mittpunkt && !v.talstreck)
  if (vy === 'm360') {
    await p.setViewport({ ...VYER.m360, height: 600 })
    await vanta(500)
    const syns600 = await p.evaluate(() => {
      const b = document.querySelector('button.knapp-primar')
      const r = b?.getBoundingClientRect()
      return r ? r.top >= 0 && r.bottom <= innerHeight : false
    })
    await bild(p, vy, 'valkommen-360x600')
    logg(vy, 'välkomst 360x600: kopparknappen synlig utan scroll', syns600)
    await p.setViewport(VYER.m360)
    await vanta(300)
  }

  // In i planen.
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}), klickaText(p, 'button.knapp-primar', 'Kolla min nivå')])
  for (let i = 0; i < 20 && !p.url().includes('/installningar'); i++) await vanta(500)
  await vanta(1000)
  logg(vy, 'knappen leder in i planen', p.url().includes('/dashboard/tester/installningar'), p.url().replace(BAS, ''))
  await bild(p, vy, 'plan-steg1')
  // Steg 1: första testtypen. Steg 2: första leverantören. Steg 3: första datumet.
  for (let steg = 1; steg <= 3; steg++) {
    await p.evaluate((s) => {
      const vis = (e) => e.getBoundingClientRect().width > 0
      const sel = s === 1 ? '[data-steg] [role="checkbox"]' : s === 2 ? '[data-steg] [role="radio"]' : '[data-steg] button[aria-pressed]'
      const el = [...document.querySelectorAll(sel)].find(vis)
      if (el && el.getAttribute('aria-checked') !== 'true') el.click()
    }, steg)
    await vanta(400)
    if (steg === 3) await bild(p, vy, 'plan-steg3')
    await p.evaluate(() => document.querySelector('footer button.knapp-primar')?.click())
    await vanta(1500)
  }
  for (let i = 0; i < 20 && p.url().includes('/installningar'); i++) await vanta(500)
  await vanta(1500)
  await bild(p, vy, 'hem-efter-plan')
  // Nivåkollen från det lyfta kortet.
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}), klickaText(p, 'a, button', 'Kolla min nivå')])
  await p.waitForSelector('button[role="radio"][aria-label]', { timeout: 30000 }).catch(() => {})
  await vanta(800)
  await bild(p, vy, 'nivakollen-fraga1')
  let fragor = 0
  for (let i = 0; i < 40; i++) {
    const t = await text(p)
    if (/I morgon/i.test(t)) break
    const gjort = await p.evaluate(() => {
      const r = [...document.querySelectorAll('button[role="radio"]')].find((b) => !b.disabled && b.getBoundingClientRect().width > 0)
      if (r) {
        r.click()
        return 'svar'
      }
      const n = [...document.querySelectorAll('button.knapp-primar')].find((b) => !b.disabled && /Nästa|Visa resultatet|Fortsätt/.test(b.innerText))
      if (n) {
        n.click()
        return 'nasta'
      }
      return null
    })
    if (gjort === 'svar') fragor += 1
    await vanta(gjort ? 900 : 1500)
  }
  await p.waitForFunction(() => /I morgon/i.test(document.body.innerText), { timeout: 30000 }).catch(() => {})
  await vanta(1500)
  const r = await p.evaluate(() => {
    const s = document.querySelector('[data-imorgon]')
    s?.scrollIntoView({ block: 'center' })
    const t = document.body.innerText
    return {
      imorgon: s ? s.innerText : '',
      t,
    }
  })
  await vanta(500)
  await bild(p, vy, 'nivakollen-resultat-imorgon')
  await p.evaluate(() => {
    const m = document.querySelector('main') || document.scrollingElement
    m.scrollTo?.(0, 0)
  })
  logg(vy, 'Nivåkollen genomförd', r.t.includes('I morgon') || r.imorgon.length > 0, `${fragor} svar`)
  const eyebrow = r.imorgon.split('\n')[0] ?? ''
  logg(vy, 'I morgon-kortet säger inte "första passet"', !/första passet/i.test(r.imorgon) && /passet på din nivå/i.test(eyebrow), eyebrow)
  logg(vy, 'I morgon-kortet: låst i Premium och dagens grundpass gratis', r.imorgon.includes('Ingår i Premium') && r.imorgon.includes('Gör dagens grundpass gratis'))
  logg(vy, 'resultatet: inga mittpunkter eller talstreck i I morgon-kortet', !/[·—]/.test(r.imorgon))
  // Hemvyn efter Nivåkollen: inga löften om "första passet" som krockar med låset.
  await p.goto(BAS + '/dashboard/tester', { waitUntil: 'networkidle2' })
  await vanta(1200)
  await bild(p, vy, 'hem-efter-nivakollen')
  const hem = await text(p)
  logg(vy, 'hemvyn efter Nivåkollen: inget "första passet", inga mittpunkter i texten', !/första passet/i.test(hem) && !/ · /.test(hem))
  logg(vy, 'registreringsflödet utan sidfel', fel.length === 0, fel.join(' | '))
  await ctx.close()
}

async function main() {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
  try {
    for (const vy of (arg('vy', 'm360,d1280')).split(',')) {
      // Smakprovet har tre sessioner per IP och dygn: --utan-smakprov hoppar över det.
      if (!process.argv.includes('--utan-smakprov')) await smakprov(browser, vy)
      await registrering(browser, vy)
    }
  } finally {
    await browser.close()
    fs.writeFileSync(path.join(UT, 'resultat.json'), JSON.stringify(resultat, null, 2))
  }
  const fel = resultat.filter((r) => !r.ok)
  console.log(`\n${resultat.length - fel.length} av ${resultat.length} OK`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
