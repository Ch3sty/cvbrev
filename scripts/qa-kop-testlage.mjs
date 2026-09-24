// scripts/qa-kop-testlage.mjs
//
// Köptest av de sex paketen i Stripes TESTLÄGE mot ett lokalt
// produktionsbygge (docs/qa/qa-kop-testlage-2026-09-24.md).
//
// Förutsättningar:
//   1. npx tsx scripts/stripe-testlage-setup.ts      (produkter, priser, .env.test.local)
//   2. bygget startat med .env.test.local i processen på BAS (standard :3461)
//   3. node scripts/stripe-testlage-webhook.mjs       (postar testlägets event signerade till rutten)
//
// Lägen:
//   node scripts/qa-kop-testlage.mjs kop <paket> <pixel7|desktop>
//        prissidan utloggad, registrering, spårval, köpsteg, Stripe Checkout,
//        webhookens avtryck på profilen, hemskärmen, sidomenyn och paketets ytor
//   node scripts/qa-kop-testlage.mjs efter <paket> <pixel7|desktop>
//        bara ytorna efter köpet, för den andra vyn
//   node scripts/qa-kop-testlage.mjs kortfel <pixel7|desktop>
//        4000 0000 0000 0002 på ett nytt konto: felet i kassan, inget paket
//   node scripts/qa-kop-testlage.mjs byte <pixel7|desktop>
//        Träningspaketet till Hela paketet från betalväggen, ingen dubbel prenumeration
//   node scripts/qa-kop-testlage.mjs uppsagning <paket> <pixel7|desktop>
//        vår uppsägning (cancel_intents) och kundportalen
//   node scripts/qa-kop-testlage.mjs dagspass-yta <pixel7|desktop>
//        hemskärm och meny efter att Dagspasset gått ut
//
// <paket> är cv, traning, dagspass, hela-vecka, hela-manad, hela-kvartal.
// Kontona heter qa-kop-<paket>-2026-09-24@jobbcoach.ai. Id:n sparas i
// $SCRATCH/qa-kop-konton.json, resultaten i $SCRATCH/qa-kop-resultat.jsonl.
// Städningen görs separat, per id. Nycklar skrivs aldrig ut.

import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const BAS = process.env.BAS || 'http://localhost:3461'
const UT = 'docs/qa/kop-testlage'
const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
const KONTON_FIL = `${SCRATCH}/qa-kop-konton.json`
const RESULTAT_FIL = `${SCRATCH}/qa-kop-resultat.jsonl`
const LOSEN = 'QaKop!2026-09-24x'
// Omkörningar: PREFIX sätts före skärmdumparnas namn (fix- efter rättelserna),
// TAGG skiljer kontonas adresser från en tidigare körning.
const PREFIX = process.env.PREFIX || ''
const TAGG = process.env.TAGG || '2026-09-24'
fs.mkdirSync(UT, { recursive: true })

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
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))

export const PAKET = {
  cv: { plan: 'cv_week', kort: 'cv', langd: null, namn: 'CV-paketet', belopp: 79 },
  traning: { plan: 'test_week', kort: 'test', langd: null, namn: 'Träningspaketet', belopp: 79 },
  dagspass: { plan: 'all_day', kort: 'allt', langd: 49, namn: 'Dagspasset', belopp: 49 },
  'hela-vecka': { plan: 'all_week', kort: 'allt', langd: 99, namn: 'Hela paketet', belopp: 99 },
  'hela-manad': { plan: 'all_month', kort: 'allt', langd: 149, namn: 'Hela paketet', belopp: 149 },
  'hela-kvartal': { plan: 'all_quarter', kort: 'allt', langd: 299, namn: 'Hela paketet', belopp: 299 },
}

const UA_MOBIL =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'
const UA_DESKTOP =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'
const VY = {
  pixel7: { viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, ua: UA_MOBIL },
  desktop: { viewport: { width: 1280, height: 800, deviceScaleFactor: 1 }, ua: UA_DESKTOP },
}

/* ------------------------------------------------------------ hjälpare */

function lasKonton() {
  return fs.existsSync(KONTON_FIL) ? JSON.parse(fs.readFileSync(KONTON_FIL, 'utf8')) : {}
}
function sparaKonto(nyckel, data) {
  const k = lasKonton()
  k[nyckel] = { ...(k[nyckel] ?? {}), ...data }
  fs.writeFileSync(KONTON_FIL, JSON.stringify(k, null, 2))
}
function logg(paket, steg, data) {
  const rad = { tid: new Date().toISOString(), paket, steg, ...data }
  fs.appendFileSync(RESULTAT_FIL, JSON.stringify(rad) + '\n')
  console.log(paket, steg, JSON.stringify(data).slice(0, 600))
}

async function nySida(browser, vy) {
  const ctx = await browser.createBrowserContext()
  const p = await ctx.newPage()
  await p.setViewport(VY[vy].viewport)
  await p.setUserAgent(VY[vy].ua)
  const fel = []
  p.on('console', (m) => {
    if (m.type() === 'error' && !/posthog|gtm|googletag|ERR_BLOCKED|stripe\.com|Failed to load resource/i.test(m.text()))
      fel.push(m.text().slice(0, 200))
  })
  p.on('pageerror', (e) => fel.push('pageerror: ' + String(e?.message ?? e).slice(0, 200)))
  await p.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS })
  if (process.env.DEBUG) {
    p.on('response', (r) => {
      if (/auth\/v1|\/api\/auth/.test(r.url())) console.log('DEBUG', r.status(), r.url().split('?')[0].slice(-60))
    })
  }
  return { p, ctx, fel }
}

async function dump(p, namn, fullPage = true) {
  const fil = `${UT}/${PREFIX}${namn}.png`
  await p.screenshot({ path: fil, fullPage }).catch(async () => p.screenshot({ path: fil }))
  return fil
}

const text = (p, sel = 'main') =>
  p.evaluate((s) => (document.querySelector(s) ?? document.body).innerText, sel)

async function klickaText(p, re, sel = 'a, button, [role="radio"]') {
  const ok = await p.evaluate(
    (src, s) => {
      const r = new RegExp(src)
      const el = [...document.querySelectorAll(s)].find(
        (e) => r.test((e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim()) && e.offsetParent !== null
      )
      if (!el) return false
      el.scrollIntoView({ block: 'center' })
      el.click()
      return true
    },
    re.source,
    sel
  )
  if (!ok) throw new Error('hittade inte ' + re)
}

async function vantaPa(p, fn, arg, timeout = 30000) {
  return p.waitForFunction(fn, { timeout, polling: 250 }, arg)
}

async function loggaIn(p, email) {
  await p.goto(BAS + '/login', { waitUntil: 'networkidle2' })
  await p.waitForSelector('input[type="email"]')
  await p.type('input[type="email"]', email)
  await p.type('input[type="password"]', LOSEN)
  await Promise.all([
    p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
    p.click('button[type="submit"]'),
  ])
  await vantaPa(p, () => location.pathname.startsWith('/dashboard')).catch(() => {})
  await vanta(1200)
}

async function profil(id) {
  const { data } = await admin
    .from('profiles')
    .select(
      'id, email, premium_scope, premium_until, premium_source, subscription_tier, subscription_status, subscription_id, price_id, current_period_end, cancel_at_period_end, stripe_customer_id, angerratt_samtycke_at, paket_started_at, onboarding_track'
    )
    .eq('id', id)
    .maybeSingle()
  return data
}

async function vantaPaProfil(id, villkor, timeout = 90000) {
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

async function fyllKort(p, kort) {
  // Stripes hostade kassa. Kortfälten ligger direkt i sidan (inte i iframe)
  // på checkout.stripe.com. Finns ett dragspel med betalsätt öppnas kortet.
  await p.waitForSelector('#cardNumber, [data-testid="card-accordion-item-button"], #payment-method-accordion-item-title-card', {
    timeout: 45000,
  })
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
    if (!v) await p.type('#billingName', 'QA Köptest')
  }
  if (await p.$('#billingCountry')) {
    await p.select('#billingCountry', 'SE').catch(() => {})
  }
  if (await p.$('#billingPostalCode')) {
    const synlig = await p.$eval('#billingPostalCode', (e) => e.offsetParent !== null)
    if (synlig) await p.type('#billingPostalCode', '11122')
  }
  // Link-rutan "spara mina uppgifter" lämnas orörd.
}

async function betala(p) {
  const knapp = await p.$('[data-testid="hosted-payment-submit-button"], button.SubmitButton, button[type="submit"]')
  if (!knapp) throw new Error('hittade inte betalknappen')
  await knapp.click()
}

/* ------------------------------------------------------ ytor efter köp */

const YTOR = [
  { nyckel: 'mallar', url: '/dashboard/cv-mallar' },
  { nyckel: 'analys', url: '/dashboard/cv-analys' },
  { nyckel: 'intervju', url: '/dashboard/intervju' },
  { nyckel: 'tester', url: '/dashboard/tester' },
  { nyckel: 'personlighet', url: '/dashboard/tester/personlighet-avancerad' },
  { nyckel: 'coach', url: '/dashboard/jobbcoachen' },
  { nyckel: 'matchning', url: '/dashboard/jobbmatchning' },
]

/** Sammanfattar en sidas text till de rader som säger något om paketet. */
function paketRader(t) {
  return t
    .split('\n')
    .map((r) => r.trim())
    .filter(Boolean)
    .filter((r) =>
      /paket|Dagspass|Ingår|ingår|Skaffa|Byt till|kr i veckan|kr till|Lås|låst|kvar idag|per dygn|gratis|Gratis|obegräns|utan tak|Förnyas|Gäller till|Uppgradera|nivå/i.test(r)
    )
    .slice(0, 25)
}

async function menyText(p, vy) {
  if (vy === 'pixel7') {
    const knapp = await p.$('button[aria-label="Öppna meny"]')
    if (knapp) {
      await knapp.click()
      await vanta(900)
    }
  }
  const t = await p.evaluate(() => {
    const navs = [...document.querySelectorAll('nav[aria-label="Sidomeny"]')].filter((n) => n.offsetParent !== null)
    return (navs[0] ?? navs[0])?.innerText ?? ''
  })
  return t
}

async function stangMeny(p) {
  const s = await p.$('button[aria-label="Stäng meny"]')
  if (s) {
    await s.click().catch(() => {})
    await vanta(400)
  }
}

async function efterKop(browser, nyckel, vy, { full = true, redanInloggad = null } = {}) {
  const k = lasKonton()[nyckel]
  const prefix = `${nyckel}-${vy}`
  const { p, ctx, fel } = redanInloggad ?? (await nySida(browser, vy))
  if (!redanInloggad) await loggaIn(p, k.email)

  // (e) hemskärmen
  await p.goto(BAS + '/dashboard', { waitUntil: 'networkidle2' })
  await vanta(2500)
  await dump(p, `${prefix}-e-hem`)
  const hem = await text(p)
  logg(nyckel, `e-hem-${vy}`, {
    kvitto: hem.split('\n').filter((r) => /kvitto|Tack|betal|Du har|Gäller|Förnyas|aktiv/i.test(r)).slice(0, 8),
    intervjuprovBricka: /Intervjuprovet/.test(hem),
    komIgang: /Kom igång/i.test(hem),
    rader: hem.split('\n').map((r) => r.trim()).filter(Boolean).slice(0, 60),
  })

  // Kom igång-hjälpredan: brickorna
  try {
    await klickaText(p, /^Kom igång/, 'a, button')
    await vanta(1500)
    await dump(p, `${prefix}-e2-komigang`, false)
    const kg = await p.evaluate(() => (document.querySelector('[role="dialog"]') ?? document.querySelector('main') ?? document.body).innerText)
    logg(nyckel, `e2-komigang-${vy}`, {
      url: p.url().replace(BAS, ''),
      intervjuprovBricka: /Intervjuprovet/.test(kg),
      rader: kg.split('\n').map((r) => r.trim()).filter(Boolean).slice(0, 40),
    })
    await p.keyboard.press('Escape')
    await p.goto(BAS + '/dashboard', { waitUntil: 'networkidle2' })
    await vanta(1500)
  } catch (e) {
    logg(nyckel, `e2-komigang-${vy}`, { fel: String(e?.message ?? e).slice(0, 200) })
  }

  // (f) sidomenyn
  const meny = await menyText(p, vy)
  await dump(p, `${prefix}-f-meny`, false)
  await stangMeny(p)
  logg(nyckel, `f-meny-${vy}`, { rader: meny.split('\n').map((r) => r.trim()).filter(Boolean).slice(0, 40) })

  if (full) {
    // (g) och (h): paketets ytor och betalväggarna
    for (const y of YTOR) {
      try {
        await p.goto(BAS + y.url, { waitUntil: 'networkidle2', timeout: 45000 })
        await vanta(2000)
        await dump(p, `${prefix}-g-${y.nyckel}`)
        const t = await text(p)
        logg(nyckel, `g-${y.nyckel}-${vy}`, { url: p.url().replace(BAS, "").slice(0, 80), rader: paketRader(t), fel: fel.splice(0) })
      } catch (e) {
        logg(nyckel, `g-${y.nyckel}-${vy}`, { fel: String(e?.message ?? e).slice(0, 200) })
      }
    }
  }
  if (fel.length) logg(nyckel, `konsolfel-${vy}`, { fel: [...new Set(fel)].slice(0, 10) })
  if (!redanInloggad) await ctx.close()
}

/* ------------------------------------------------------------ köpet */

async function kop(browser, nyckel, vy) {
  const pk = PAKET[nyckel]
  const email = `qa-kop-${nyckel}-${TAGG}@jobbcoach.ai`
  const prefix = `${nyckel}-${vy}`
  const { p, ctx, fel } = await nySida(browser, vy)

  // (a) prissidan utloggad
  await p.goto(BAS + '/priser', { waitUntil: 'networkidle2' })
  await vanta(1500)
  if (pk.langd) {
    // Längden väljs i Hela paketets kort (radio med beloppet).
    await p.evaluate((belopp) => {
      const kort = document.querySelector('#paket-allt')
      const r = [...(kort ?? document).querySelectorAll('[role="radio"]')].find((e) =>
        (e.innerText || '').trim().startsWith(String(belopp))
      )
      r?.scrollIntoView({ block: 'center' })
      r?.click()
    }, pk.langd)
    await vanta(500)
  }
  const knappText = await p.evaluate((kortId) => {
    const kort = document.querySelector(`#paket-${kortId}`)
    const b = [...(kort ?? document).querySelectorAll('button')].filter((e) => /Börja med/.test(e.innerText))
    return b.map((e) => e.innerText.replace(/\s+/g, ' ').trim())
  }, pk.kort)
  await p.evaluate((kortId) => document.querySelector(`#paket-${kortId}`)?.scrollIntoView({ block: 'start' }), pk.kort)
  await vanta(400)
  await dump(p, `${prefix}-a-priser`, false)
  logg(nyckel, `a-priser-${vy}`, { knapp: knappText })

  // (b) registrering. Finns kontot redan (omkörning efter ett avbrott)
  // loggar vi in och går till spårvalet med samma ?paket som registreringen ger.
  let regUrl = 'omkörning, inloggad'
  const finns = lasKonton()[nyckel]?.id
  if (finns) {
    await loggaIn(p, email)
    await p.goto(`${BAS}/dashboard/valj-spar?paket=${pk.plan}`, { waitUntil: 'networkidle2' })
  } else {
  await p.evaluate((kortId) => {
    const kort = document.querySelector(`#paket-${kortId}`)
    const b = [...(kort ?? document).querySelectorAll('button')].find((e) => /Börja med/.test(e.innerText))
    b?.click()
  }, pk.kort)
  await vantaPa(p, () => location.pathname === '/register')
  await p.waitForSelector('#email')
  regUrl = p.url().replace(BAS, '')
  await p.type('#fullName', `QA Köp ${pk.namn}`)
  await p.type('#email', email)
  await p.type('#password', LOSEN)
  await dump(p, `${prefix}-b1-registrering`, false)
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), p.click('button[type="submit"]')])
  }
  await vantaPa(p, () => location.pathname === '/dashboard/valj-spar', null, 45000)
  await vanta(1500)
  const { data: rad } = await admin.from('profiles').select('id').eq('email', email).maybeSingle()
  sparaKonto(nyckel, { email, id: rad?.id ?? null, vy })
  await dump(p, `${prefix}-b2-sparval`)
  const sparval = await text(p)
  const valtKort = await p.evaluate(
    () => [...document.querySelectorAll('[role="radio"][aria-checked="true"]')].map((e) => e.innerText.split('\n').slice(0, 3).join(' | '))
  )
  logg(nyckel, `b-registrering-${vy}`, { regUrl, id: rad?.id, sparvalUrl: p.url().replace(BAS, ''), valtKort })

  // Primärknappen "Fortsätt med ..."
  const primar = await p.evaluate(() =>
    [...document.querySelectorAll('button')].map((b) => b.innerText.trim()).find((t) => /^Fortsätt med/.test(t))
  )
  await klickaText(p, /^Fortsätt med/, 'button')
  await vantaPa(p, () => /Steg 2 av 2/i.test(document.body.innerText))
  await vanta(800)
  const kopsteg = await text(p)
  const betalKnappFore = await p.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((e) => /^Till betalning/.test(e.innerText.trim()))
    return b ? { text: b.innerText.trim(), disabled: b.disabled || b.getAttribute('aria-disabled') === 'true' } : null
  })
  await dump(p, `${prefix}-b3-kopsteg`)
  const samtycke = await p.evaluate(() => document.querySelector('label input[type="checkbox"]')?.closest('label')?.innerText ?? null)
  await p.click('label input[type="checkbox"]')
  await vanta(300)
  const betalKnappEfter = await p.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((e) => /^Till betalning/.test(e.innerText.trim()))
    return b ? { text: b.innerText.trim(), disabled: b.disabled || b.getAttribute('aria-disabled') === 'true' } : null
  })
  logg(nyckel, `b-kopsteg-${vy}`, {
    primarSparval: primar,
    kvitto: kopsteg.split('\n').map((r) => r.trim()).filter(Boolean).slice(0, 30),
    samtycke,
    betalKnappFore,
    betalKnappEfter,
  })

  // (c) betalningen i Stripes kassa
  await Promise.all([
    p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
    klickaText(p, /^Till betalning/, 'button'),
  ])
  await vantaPa(p, () => location.hostname.includes('stripe.com'), null, 60000)
  await fyllKort(p, '4242424242424242')
  const kassaText = await p.evaluate(() => document.body.innerText)
  await dump(p, `${prefix}-c1-stripe-kassa`)
  logg(nyckel, `c-kassa-${vy}`, {
    url: p.url().split('#')[0].slice(0, 60),
    rader: kassaText.split('\n').map((r) => r.trim()).filter((r) => /kr|SEK|paket|Dagspass|vecka|månad|kvartal|TEST|Testläge|Prenumerera|Betala/i.test(r)).slice(0, 15),
  })
  await betala(p)
  await vantaPa(p, (bas) => location.href.startsWith(bas), BAS, 90000)
  await vanta(3000)
  const retur = p.url().replace(BAS, '')
  await dump(p, `${prefix}-c2-retur`)
  logg(nyckel, `c-retur-${vy}`, { url: retur, rader: (await text(p)).split('\n').map((r) => r.trim()).filter(Boolean).slice(0, 25) })

  // (d) webhooken: profilen
  const id = lasKonton()[nyckel].id
  const dagspass = pk.plan === 'all_day'
  const vantat = await vantaPaProfil(id, (pr) =>
    dagspass
      ? pr.subscription_tier === 'premium' && pr.premium_until && new Date(pr.premium_until) > new Date()
      : pr.subscription_status === 'active' && pr.premium_scope
  )
  const { data: grants } = await admin.from('premium_grants').select('id, days, scope, source, premium_until_after').eq('user_id', id)
  logg(nyckel, 'd-webhook', { ok: vantat.ok, profil: vantat.profil, grants })

  // Kvittot (bugg 4) och paket_started_at (bugg 1): raden receipt_<event.id>
  // i email_schedule, med ämnet i last_error när Resend-nyckeln är ogiltig.
  let kvitto = []
  for (let i = 0; i < 20 && kvitto.length === 0; i++) {
    const { data } = await admin
      .from('email_schedule')
      .select('id, email_type, attempts, last_error, sent_at, metadata')
      .eq('user_id', id)
      .like('email_type', 'receipt_%')
    kvitto = data ?? []
    if (!kvitto.length) await vanta(2000)
  }
  const efter = await profil(id)
  logg(nyckel, 'd2-kvitto-och-start', { paket_started_at: efter?.paket_started_at ?? null, kvitto })
  sparaKonto(nyckel, { emailScheduleIds: kvitto.map((k) => k.id) })
  sparaKonto(nyckel, {
    customer: vantat.profil?.stripe_customer_id ?? null,
    subscription: vantat.profil?.subscription_id ?? null,
    grantIds: (grants ?? []).map((g) => g.id),
  })

  // (e) till (h) i samma session
  await efterKop(browser, nyckel, vy, { full: true, redanInloggad: { p, ctx, fel } })
  if (fel.length) logg(nyckel, `konsolfel-kop-${vy}`, { fel: [...new Set(fel)].slice(0, 10) })
  await ctx.close()
}

/* --------------------------------------------------------- kortfel */

async function kortfel(browser, vy) {
  const nyckel = 'kortfel'
  const email = `qa-kop-${nyckel}-${TAGG}@jobbcoach.ai`
  const prefix = `${nyckel}-${vy}`
  const { p, ctx } = await nySida(browser, vy)
  await p.goto(BAS + '/register?paket=cv_week', { waitUntil: 'networkidle2' })
  await p.waitForSelector('#email')
  await p.type('#fullName', 'QA Köp Kortfel')
  await p.type('#email', email)
  await p.type('#password', LOSEN)
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}), p.click('button[type="submit"]')])
  await vantaPa(p, () => location.pathname === '/dashboard/valj-spar', null, 45000)
  const { data: rad } = await admin.from('profiles').select('id').eq('email', email).maybeSingle()
  sparaKonto(nyckel, { email, id: rad?.id ?? null, vy })
  await vanta(1200)
  await klickaText(p, /^Fortsätt med/, 'button')
  await vantaPa(p, () => /Steg 2 av 2/i.test(document.body.innerText))
  await p.click('label input[type="checkbox"]')
  await Promise.all([
    p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
    klickaText(p, /^Till betalning/, 'button'),
  ])
  await vantaPa(p, () => location.hostname.includes('stripe.com'), null, 60000)
  await fyllKort(p, '4000000000000002')
  await betala(p)
  await vanta(9000)
  const felText = await p.evaluate(() => document.body.innerText)
  await dump(p, `${prefix}-kassa-nekat`)
  const kvarPaStripe = p.url().includes('stripe.com')
  const rader = felText.split('\n').map((r) => r.trim()).filter((r) => /nek|declin|kort|card/i.test(r)).slice(0, 8)
  await vanta(8000)
  const pr = await profil(rad?.id)
  logg(nyckel, `kortfel-${vy}`, { kvarPaStripe, rader, profil: pr })
  const { data: kortfelMejl } = await admin
    .from('email_schedule')
    .select('id, email_type, last_error')
    .eq('user_id', rad?.id)
  logg(nyckel, `kortfel-mejl-${vy}`, { rader: kortfelMejl })
  sparaKonto(nyckel, { customer: pr?.stripe_customer_id ?? null })
  // Tillbaka till appen: inget paket
  await p.goto(BAS + '/dashboard', { waitUntil: 'networkidle2' })
  await vanta(2000)
  await dump(p, `${prefix}-hem-efter`)
  const meny = await menyText(p, vy)
  logg(nyckel, `kortfel-meny-${vy}`, { rader: meny.split('\n').map((r) => r.trim()).filter(Boolean).slice(0, 6) })
  await ctx.close()
}

/* ------------------------------------------------------------ byte */

async function byte(browser, vy) {
  const nyckel = 'traning'
  const k = lasKonton()[nyckel]
  const prefix = `byte-${vy}`
  const { p, ctx, fel } = await nySida(browser, vy)
  await loggaIn(p, k.email)
  await p.goto(BAS + '/dashboard/cv-mallar', { waitUntil: 'networkidle2' })
  await vanta(2000)
  await dump(p, `${prefix}-1-cv-mallar-betalvagg`)
  const t = await text(p)
  logg('byte', `1-mallar-${vy}`, { rader: paketRader(t) })
  const fore = await profil(k.id)

  const svar = []
  p.on('response', async (r) => {
    if (r.url().includes('/api/stripe/create-upgrade-session')) {
      svar.push({ status: r.status(), body: (await r.text().catch(() => '')).slice(0, 300) })
    }
  })
  // "Byt till CV-paketet, 79 kr i veckan": sidledes byte, vad händer?
  try {
    await klickaText(p, /^Byt till CV-paketet/, 'button')
    await vanta(5000)
    await dump(p, `${prefix}-1b-byt-till-cv`)
    const besked = (await text(p)).split('\n').map((r) => r.trim()).filter((r) => /redan ett paket|Till prenumerationen/.test(r))
    logg('byte', `1b-byt-till-cv-${vy}`, { url: p.url().replace(BAS, ''), svar: [...svar], besked })
  } catch (e) {
    logg('byte', `1b-byt-till-cv-${vy}`, { fel: String(e?.message ?? e).slice(0, 200) })
  }
  svar.length = 0

  // "Eller Hela paketet för 20 kr till i veckan"
  await klickaText(p, /Hela paketet för \d+ kr till i veckan/, 'button, a')
  await vanta(6000)
  await dump(p, `${prefix}-2-efter-klick`)
  const efterKlick = await text(p)
  logg('byte', `2-klick-${vy}`, {
    url: p.url().replace(BAS, ''),
    svar,
    bekraftelse: efterKlick.split('\n').map((r) => r.trim()).filter((r) => /Du har nu/.test(r)),
    rader: paketRader(efterKlick),
  })

  const vantat = await vantaPaProfil(k.id, (pr) => pr.premium_scope === 'allt', 90000)
  logg('byte', '3-profil', { fore: { scope: fore?.premium_scope, price: fore?.price_id, sub: fore?.subscription_id }, efter: vantat.profil, ok: vantat.ok })

  // Ett andra köp av Hela paketet via kassan ska stoppas (guard).
  const dubbel = await p.evaluate(async () => {
    const r = await fetch('/api/stripe/create-plan-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'all_month', source: 'qa', consent: true }),
    })
    return { status: r.status, body: await r.text() }
  })
  logg('byte', '4-dubbelkop', dubbel)

  await p.goto(BAS + '/dashboard', { waitUntil: 'networkidle2' })
  await vanta(2500)
  await dump(p, `${prefix}-5-hem`)
  const meny = await menyText(p, vy)
  await dump(p, `${prefix}-6-meny`, false)
  logg('byte', `5-meny-${vy}`, { rader: meny.split('\n').map((r) => r.trim()).filter(Boolean).slice(0, 8) })
  if (fel.length) logg('byte', `konsolfel-${vy}`, { fel: [...new Set(fel)].slice(0, 10) })
  await ctx.close()
}

/* ------------------------------------------------------- uppsägning */

async function uppsagning(browser, nyckel, vy) {
  const k = lasKonton()[nyckel]
  const prefix = `uppsagning-${nyckel}-${vy}`
  const { p, ctx, fel } = await nySida(browser, vy)
  await loggaIn(p, k.email)
  await p.goto(BAS + '/dashboard/profil/prenumeration', { waitUntil: 'networkidle2' })
  await vanta(2500)
  await dump(p, `${prefix}-1-prenumeration`)
  logg(nyckel, `u1-prenumeration-${vy}`, { rader: (await text(p)).split('\n').map((r) => r.trim()).filter(Boolean).slice(0, 40) })

  await klickaText(p, /Säg upp|Avsluta prenumeration|Avsluta/, 'button, a')
  await vanta(1200)
  await dump(p, `${prefix}-2-enkat`, false)
  await klickaText(p, /Jag använder det inte/, '[role="radio"], button')
  await vanta(300)
  await vantaPa(p, () => [...document.querySelectorAll('[role="dialog"] button')].some((b) => b.innerText.trim() === 'Fortsätt' && !b.disabled))
  await klickaText(p, /^Fortsätt$/, '[role="dialog"] button')
  await vantaPa(p, () => !/Vad fick dig att vilja avsluta/.test(document.querySelector('[role="dialog"]')?.innerText ?? ''), null, 15000).catch(() => {})
  await vanta(1000)
  await dump(p, `${prefix}-3-erbjudande`, false)
  const erbj = await p.evaluate(() => document.querySelector('[role="dialog"]')?.innerText ?? '')
  logg(nyckel, `u2-erbjudande-${vy}`, { rader: erbj.split('\n').map((r) => r.trim()).filter(Boolean).slice(0, 20) })
  await Promise.all([
    p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
    klickaText(p, /^Avsluta ändå$/, 'button'),
  ])
  await vantaPa(p, () => location.hostname.includes('stripe.com'), null, 60000).catch(() => {})
  await vanta(2500)
  await dump(p, `${prefix}-4-portal`)
  logg(nyckel, `u3-portal-${vy}`, { url: p.url().split('?')[0].slice(0, 60) })

  // Kundportalen: Avbryt prenumerationen, bekräfta, välj orsak.
  try {
    await klickaText(p, /Säg upp abonnemang|Avbryt prenumeration|Cancel subscription/i, 'a, button')
    await vanta(2500)
    await dump(p, `${prefix}-5-portal-bekrafta`)
    await klickaText(p, /^(Säg upp abonnemang|Säg upp|Avbryt prenumeration|Cancel subscription)$/i, 'button')
    await vanta(3000)
    await dump(p, `${prefix}-6-portal-orsak`)
    // Orsaksfrågan i portalen, om den visas.
    await klickaText(p, /använder det inte|Används inte|I don.t use|Oanvänd/i, 'label, button, [role="radio"]').catch(() => {})
    await klickaText(p, /^(Skicka|Skicka in|Submit|Hoppa över|Skip)$/i, 'button').catch(() => {})
    await vanta(2500)
    await dump(p, `${prefix}-7-portal-klar`)
    // Erbjuder portalen att ångra? Då räcker länken dit från prenumerationssidan.
    const portalText = await p.evaluate(() => document.body.innerText)
    logg(nyckel, `u4b-portal-angra-${vy}`, {
      rader: portalText.split('\n').map((r) => r.trim()).filter((r) => /Förnya|Renew|avbryts|upphör|Avslutas|cancel/i.test(r)).slice(0, 8),
    })
  } catch (e) {
    logg(nyckel, `u4-portal-fel-${vy}`, { fel: String(e?.message ?? e).slice(0, 200) })
  }

  const { data: intents } = await admin.from('cancel_intents').select('id, reason, completed_cancel, offer_shown, created_at').eq('user_id', k.id)
  sparaKonto(nyckel, { cancelIntentIds: (intents ?? []).map((i) => i.id) })
  const vantat = await vantaPaProfil(k.id, () => true, 1000)
  logg(nyckel, 'u5-cancel-intents', { intents, profil: vantat.profil })

  // Tillbaka: prenumerationssidan och menyn efter uppsägningen
  await p.goto(BAS + '/dashboard/profil/prenumeration', { waitUntil: 'networkidle2' })
  await vanta(2500)
  await dump(p, `${prefix}-8-prenumeration-efter`)
  logg(nyckel, `u6-prenumeration-efter-${vy}`, { rader: (await text(p)).split('\n').map((r) => r.trim()).filter(Boolean).slice(0, 30) })
  const vantatUppsagd = await vantaPaProfil(k.id, (pr) => pr.cancel_at_period_end === true, 60000)
  if (vantatUppsagd.ok) {
    await p.reload({ waitUntil: 'networkidle2' })
    await vanta(2000)
    await dump(p, `${prefix}-8b-prenumeration-uppsagd`)
    logg(nyckel, `u6b-prenumeration-uppsagd-${vy}`, { rader: (await text(p)).split('\n').map((r) => r.trim()).filter(Boolean).slice(0, 30) })
  }
  const meny = await menyText(p, vy)
  await dump(p, `${prefix}-9-meny`, false)
  logg(nyckel, `u7-meny-${vy}`, { uppsagdIProfil: vantatUppsagd.ok, rader: meny.split('\n').map((r) => r.trim()).filter(Boolean).slice(0, 6) })
  if (fel.length) logg(nyckel, `konsolfel-uppsagning-${vy}`, { fel: [...new Set(fel)].slice(0, 10) })
  await ctx.close()
}

/* --------------------------------------------- ångra uppsägningen */

// Prenumerationssidans "Ångra uppsägningen" öppnar kundportalen, som har
// "Säg inte upp abonnemang". Webhooken ska då nolla cancel_at_period_end.
async function angra(browser, nyckel, vy) {
  const k = lasKonton()[nyckel]
  const prefix = `angra-${nyckel}-${vy}`
  const { p, ctx } = await nySida(browser, vy)
  await loggaIn(p, k.email)
  await p.goto(BAS + '/dashboard/profil/prenumeration', { waitUntil: 'networkidle2' })
  await vanta(2000)
  await Promise.all([
    p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {}),
    klickaText(p, /^Ångra uppsägningen$/, 'a, button'),
  ])
  await vantaPa(p, () => location.hostname.includes('stripe.com'), null, 60000).catch(() => {})
  await vanta(2500)
  await dump(p, `${prefix}-1-portal`, false)
  await klickaText(p, /Säg inte upp abonnemang|Förnya|Renew/i, 'a, button')
  await vanta(2500)
  await dump(p, `${prefix}-2-portal-bekrafta`, false)
  await klickaText(p, /^(Säg inte upp abonnemang|Förnya abonnemang|Förnya|Renew subscription|Renew)$/i, 'button').catch(() => {})
  await vanta(3000)
  await dump(p, `${prefix}-3-portal-klar`, false)
  const vantat = await vantaPaProfil(k.id, (pr) => pr.cancel_at_period_end === false, 60000)
  await p.goto(BAS + '/dashboard/profil/prenumeration', { waitUntil: 'networkidle2' })
  await vanta(2000)
  await dump(p, `${prefix}-4-prenumeration`, false)
  const meny = await menyText(p, vy)
  logg(nyckel, `angra-${vy}`, {
    ok: vantat.ok,
    cancel_at_period_end: vantat.profil?.cancel_at_period_end,
    status: (await text(p)).split('\n').map((r) => r.trim()).filter((r) => /förnyas|uppsagt/i.test(r)).slice(0, 3),
    meny: meny.split('\n').map((r) => r.trim()).filter(Boolean).slice(0, 2),
  })
  await ctx.close()
}

/* ------------------------------------------------------------ körning */

const [lage, a1, a2] = process.argv.slice(2)
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--lang=sv-SE', '--disable-blink-features=AutomationControlled'],
  defaultViewport: null,
})
try {
  if (lage === 'kop') await kop(browser, a1, a2 || 'pixel7')
  else if (lage === 'efter') await efterKop(browser, a1, a2 || 'desktop', { full: process.env.FULL === '1' })
  else if (lage === 'kortfel') await kortfel(browser, a1 || 'pixel7')
  else if (lage === 'byte') await byte(browser, a1 || 'desktop')
  else if (lage === 'uppsagning') await uppsagning(browser, a1, a2 || 'desktop')
  else if (lage === 'angra') await angra(browser, a1, a2 || 'desktop')
  else if (lage === 'dagspass-yta') await efterKop(browser, 'dagspass', a1 || 'pixel7', { full: false })
  else throw new Error('okänt läge ' + lage)
} catch (e) {
  console.error('FEL', e?.message ?? e)
  const sidor = await browser.pages()
  for (const s of sidor) await s.screenshot({ path: `${SCRATCH}/fel-${Date.now()}.png` }).catch(() => {})
  process.exitCode = 1
} finally {
  await browser.close()
}
