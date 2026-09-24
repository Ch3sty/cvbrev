// scripts/qa-slutflode.mjs
//
// Slutligt flödestest 2026-09-24 (docs/qa/qa-slutflode-2026-09-24.md):
// registreringstratten, Kom igång per val, menyn, profilsidan och
// paketköpen, mot ett lokalt produktionsbygge i Stripes TESTLÄGE.
//
//   SCRATCH=<tmp> BAS=http://localhost:3471 node scripts/qa-slutflode-kor.mjs <väg> [vy]
//
// Den här filen är hjälparna; vägarna ligger i qa-slutflode-vagar.mjs, körningen i qa-slutflode-kor.mjs.
//
// Vägarna 1 till 10 enligt uppdraget, se funktionerna nedan. Varje konto
// heter qa-slut-<väg>-2026-09-24@jobbcoach.ai och skrivs med id till
// $SCRATCH/qa-slut-konton.json direkt när det skapats, liksom Stripe-kunder,
// tokens och sökvägar i lagringen. Städningen görs per id med
// scripts/qa-slutflode-stada.mjs. Nycklar skrivs aldrig ut.
//
// Förutsättningar: bygget startat med .env.test.local i processen, och
// scripts/stripe-testlage-webhook.mjs med WEBHOOK_URL mot samma port.

import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

export const BAS = process.env.BAS || 'http://localhost:3471'
const UT = 'docs/qa/slutflode'
export const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
const KONTON_FIL = `${SCRATCH}/qa-slut-konton.json`
const RESULTAT_FIL = `${UT}/resultat.jsonl`
export const LOSEN = 'QaSlut!2026-09-24x'
const DATUM = '2026-09-24'
fs.mkdirSync(UT, { recursive: true })

function lasEnv(fil) {
  return Object.fromEntries(
    fs
      .readFileSync(fil, 'utf8')
      .split(/\r?\n/)
      .filter((r) => r.includes('=') && !r.trim().startsWith('#'))
      .map((r) => {
        const i = r.indexOf('=')
        return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
      })
  )
}
export const env = lasEnv('.env.local')
export const envTest = lasEnv('.env.test.local')
if (!envTest.STRIPE_SECRET_KEY?.startsWith('sk_test_')) throw new Error('.env.test.local saknar testnyckel')
export const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
export const vanta = (ms) => new Promise((r) => setTimeout(r, ms))

const UA_MOBIL =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'
const UA_DESKTOP =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
export const VY = {
  pixel7: { viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, ua: UA_MOBIL },
  desktop: { viewport: { width: 1280, height: 800, deviceScaleFactor: 1 }, ua: UA_DESKTOP },
}

/* ------------------------------------------------------------ id-filen */

export function lasKonton() {
  return fs.existsSync(KONTON_FIL) ? JSON.parse(fs.readFileSync(KONTON_FIL, 'utf8')) : { konton: {}, tokens: {}, lagring: [] }
}
export function sparaKonto(nyckel, data) {
  const k = lasKonton()
  k.konton[nyckel] = { ...(k.konton[nyckel] ?? {}), ...data }
  fs.writeFileSync(KONTON_FIL, JSON.stringify(k, null, 2))
}
export function sparaToken(typ, token) {
  const k = lasKonton()
  k.tokens[typ] = [...new Set([...(k.tokens[typ] ?? []), token])]
  fs.writeFileSync(KONTON_FIL, JSON.stringify(k, null, 2))
}
export function sparaLagring(sokvag) {
  const k = lasKonton()
  k.lagring = [...new Set([...(k.lagring ?? []), sokvag])]
  fs.writeFileSync(KONTON_FIL, JSON.stringify(k, null, 2))
}
export const epost = (vag) => `qa-slut-${vag}-${DATUM}@jobbcoach.ai`

/** Slår upp id för en adress som just registrerats och skriver det till filen. */
export async function registreraId(nyckel, email) {
  for (let i = 0; i < 20; i++) {
    const { data } = await admin.from('profiles').select('id').eq('email', email).maybeSingle()
    if (data?.id) {
      sparaKonto(nyckel, { id: data.id, email, skapad: new Date().toISOString() })
      return data.id
    }
    await vanta(700)
  }
  return null
}

/* ------------------------------------------------------------ logg */

export function logg(vag, steg, ok, data = {}) {
  const rad = { tid: new Date().toISOString(), vag, steg, ok: ok === null ? null : !!ok, ...data }
  fs.appendFileSync(RESULTAT_FIL, JSON.stringify(rad) + '\n')
  console.log(`${ok === null ? 'INFO' : ok ? 'OK  ' : 'FEL '} [${vag}] ${steg}  ${JSON.stringify(data).slice(0, 700)}`)
}

/* ------------------------------------------------------------ webbläsaren */

export async function nySida(browser, vy) {
  const ctx = await browser.createBrowserContext()
  const p = await ctx.newPage()
  p.setDefaultNavigationTimeout(90000)
  await p.setViewport(VY[vy].viewport)
  await p.setUserAgent(VY[vy].ua)
  const fel = []
  p.on('console', (m) => {
    if (m.type() === 'error' && !/posthog|gtm|googletag|ERR_BLOCKED|stripe\.com|Failed to load resource|confirmation email/i.test(m.text()))
      fel.push(m.text().slice(0, 200))
  })
  p.on('pageerror', (e) => fel.push('pageerror: ' + String(e?.message ?? e).slice(0, 200)))
  await p.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS })
  return { p, ctx, fel, vy }
}

let bildNr = 0
export async function dump(p, vag, namn, fullPage = false) {
  bildNr += 1
  const fil = path.join(UT, `v${vag}-${namn}.png`)
  await p.screenshot({ path: fil, fullPage }).catch(async () => p.screenshot({ path: fil }).catch(() => {}))
  return fil
}

export const text = (p, sel = 'body') => p.evaluate((s) => (document.querySelector(s) ?? document.body).innerText, sel)
export const rader = (t, re) => t.split('\n').map((r) => r.trim()).filter((r) => r && (!re || re.test(r)))
export const url = (p) => p.url().replace(BAS, '')

export async function ga(p, u) {
  await p.goto(u.startsWith('http') ? u : BAS + u, { waitUntil: 'networkidle2' })
  await vanta(900)
}

/** Klickar första synliga element vars text matchar. */
export async function klicka(p, re, sel = 'a, button, [role="radio"], [role="menuitem"]') {
  const ok = await p.evaluate(
    (src, flaggor, s) => {
      const r = new RegExp(src, flaggor)
      const el = [...document.querySelectorAll(s)].find(
        (e) => r.test((e.innerText || e.textContent || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim()) && e.getClientRects().length > 0
      )
      if (!el) return false
      el.scrollIntoView({ block: 'center' })
      el.click()
      return true
    },
    re.source,
    re.flags,
    sel
  )
  if (!ok) throw new Error('hittade inte ' + re)
}

export async function vantaPa(p, fn, arg, timeout = 30000) {
  return p.waitForFunction(fn, { timeout, polling: 250 }, arg)
}
export async function vantaText(p, re, timeout = 30000) {
  return p
    .waitForFunction((src, fl) => new RegExp(src, fl).test(document.body.innerText), { timeout, polling: 300 }, re.source, re.flags)
    .then(() => true)
    .catch(() => false)
}

export async function fyllKonto(p, { namn, email, losen = LOSEN }) {
  await p.waitForSelector('input[autocomplete="name"]', { timeout: 20000 })
  if (namn) await p.type('input[autocomplete="name"]', namn)
  await p.type('input[type="email"]', email)
  await p.type('input[type="password"]', losen)
}

/** Skickar kontosteget och väntar ut valkommen-sidans hämtkedja. */
export async function skickaKonto(p) {
  await Promise.all([
    p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
    p.click('footer button[type="submit"]'),
  ])
  for (let i = 0; i < 40 && p.url().includes('/register'); i++) await vanta(500)
  for (let i = 0; i < 40 && p.url().includes('/dashboard/valkommen') && !/steg 3 av 3/i.test(await text(p).catch(() => '')); i++)
    await vanta(500)
  await vanta(1500)
}

export async function loggaIn(p, email) {
  await ga(p, '/login')
  await p.waitForSelector('input[type="email"]')
  await p.type('input[type="email"]', email)
  await p.type('input[type="password"]', LOSEN)
  await Promise.all([
    p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
    p.click('footer button[type="submit"], button[type="submit"]'),
  ])
  await vantaPa(p, () => location.pathname.startsWith('/dashboard'), null, 30000).catch(() => {})
  await vanta(1500)
}

/** Headerns Skapa konto från startsidan (ingången header). */
export async function headerSkapaKonto(p) {
  await ga(p, '/')
  await p.evaluate(() => document.querySelector('a[data-cta="navbar-signup"]')?.click())
  await vantaPa(p, () => location.pathname === '/register', null, 30000)
  await vanta(1200)
}

export async function menyText(p, vy) {
  if (vy === 'pixel7') {
    const knapp = await p.$('button[aria-label="Öppna meny"]')
    if (knapp) {
      await knapp.click()
      await vanta(900)
    }
  }
  return p.evaluate(() => {
    const navs = [...document.querySelectorAll('nav[aria-label="Sidomeny"]')].filter((n) => n.offsetParent !== null)
    return navs[0]?.innerText ?? ''
  })
}
export async function stangMeny(p) {
  const s = await p.$('button[aria-label="Stäng meny"]')
  if (s) {
    await s.click().catch(() => {})
    await vanta(400)
  }
}

/** Kom igång-arket från hemskärmens rad (eller profilmenyn). */
export async function komIgangArk(p) {
  // html bär också data-komigang-rad, därför body-prefixet.
  const rad = await p.$('body [data-komigang-rad]')
  if (rad) {
    await p.evaluate(() => {
      const r = document.querySelector('body [data-komigang-rad]')
      const inre = r?.matches('button, a') ? r : r?.querySelector('button, a')
      ;(inre ?? r)?.click()
    })
  } else {
    await p.evaluate(() => document.querySelector('button[aria-label="Konto och inställningar"], button[aria-label="Konto"]')?.click())
    await vanta(500)
    await klicka(p, /^Kom igång/)
  }
  await vanta(1200)
  return p.evaluate(() => (document.querySelector('[role="dialog"]') ?? document.body).innerText)
}

/* ------------------------------------------------------------ databasen */

export async function profil(id) {
  const { data } = await admin
    .from('profiles')
    .select(
      'id, email, location, profile_photo_url, preferred_tonality, premium_scope, premium_until, premium_source, subscription_tier, subscription_status, subscription_id, price_id, current_period_end, cancel_at_period_end, stripe_customer_id, paket_started_at, onboarding_track, onboarding_intent'
    )
    .eq('id', id)
    .maybeSingle()
  return data
}
export async function vantaPaProfil(id, villkor, timeout = 90000) {
  const slut = Date.now() + timeout
  let senast = null
  while (Date.now() < slut) {
    senast = await profil(id)
    if (senast && villkor(senast)) return { ok: true, profil: senast }
    await vanta(2000)
  }
  return { ok: false, profil: senast }
}

/* ---------------------------------------------------- Stripe Checkout */

export async function fyllKort(p, kort) {
  await p.waitForSelector('#cardNumber, [data-testid="card-accordion-item-button"], #payment-method-accordion-item-title-card', { timeout: 45000 })
  const dragspel = await p.$('[data-testid="card-accordion-item-button"], #payment-method-accordion-item-title-card')
  if (dragspel && !(await p.$('#cardNumber'))) {
    await dragspel.click()
    await p.waitForSelector('#cardNumber', { visible: true, timeout: 15000 })
  }
  await vanta(600)
  await p.click('#cardNumber')
  await p.type('#cardNumber', kort, { delay: 25 })
  await p.type('#cardExpiry', '12 / 34', { delay: 25 })
  await p.type('#cardCvc', '123', { delay: 25 })
  if (await p.$('#billingName')) {
    const v = await p.$eval('#billingName', (e) => e.value)
    if (!v) await p.type('#billingName', 'QA Slutflöde')
  }
  if (await p.$('#billingCountry')) await p.select('#billingCountry', 'SE').catch(() => {})
  if (await p.$('#billingPostalCode')) {
    const synlig = await p.$eval('#billingPostalCode', (e) => e.offsetParent !== null)
    if (synlig) await p.type('#billingPostalCode', '11122')
  }
}
export async function betala(p) {
  const knapp = await p.$('[data-testid="hosted-payment-submit-button"], button.SubmitButton, button[type="submit"]')
  if (!knapp) throw new Error('hittade inte betalknappen')
  await knapp.click()
}

/**
 * Köpsteget (Steg 2 av 2 på spårvalet) till betald kassa. Returnerar
 * köpstegets rader. Förutsätter att sidan står på köpsteget.
 */
export async function kopstegTillBetalt(p, vag, prefix, kort = '4242424242424242') {
  await vantaText(p, /Steg 2 av 2/i, 30000)
  await vanta(800)
  const kopsteg = await text(p)
  await dump(p, vag, `${prefix}-kopsteg`, true)
  const samtycke = await p.evaluate(() => document.querySelector('label input[type="checkbox"]')?.closest('label')?.innerText ?? null)
  await p.click('label input[type="checkbox"]')
  await vanta(300)
  await Promise.all([
    p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
    klicka(p, /^Till betalning/, 'button'),
  ])
  await vantaPa(p, () => location.hostname.includes('stripe.com'), null, 60000)
  await fyllKort(p, kort)
  const kassa = await text(p)
  await dump(p, vag, `${prefix}-stripe-kassa`)
  await betala(p)
  return { kopsteg: rader(kopsteg).slice(0, 30), samtycke, kassa: rader(kassa, /kr|SEK|paket|Dagspass|vecka|månad|Prenumerera|Abonnera|Betala/i).slice(0, 10) }
}

export async function vantaRetur(p) {
  await vantaPa(p, (bas) => location.href.startsWith(bas), BAS, 90000)
  await vanta(3000)
}

/** Kvittot: raden receipt_<event> i email_schedule, ämnet i last_error (ogiltig Resend-nyckel). */
export async function kvitto(id) {
  let k = []
  for (let i = 0; i < 25 && k.length === 0; i++) {
    const { data } = await admin
      .from('email_schedule')
      .select('id, email_type, attempts, last_error, sent_at, metadata')
      .eq('user_id', id)
      .like('email_type', 'receipt_%')
    k = data ?? []
    if (!k.length) await vanta(2000)
  }
  return k
}

/* ------------------------------------------------------------ körning */

export async function starta() {
  return puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--lang=sv-SE', '--disable-blink-features=AutomationControlled'],
    defaultViewport: null,
  })
}
