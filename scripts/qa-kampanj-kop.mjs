// scripts/qa-kampanj-kop.mjs
//
// Testköp av Premium under Black Week och Cyber Monday i Stripes TESTLÄGE
// (fix/kampanj-qa, 2026-11-17). Kassan är facit.
//
// Förutsättningar (docs/qa/qa-kop-testlage-2026-09-24.md):
//   1. bygget startat med .env.test.local i processen och KAMPANJ_NU satt
//      till en tid i kampanjen som ska köpas (BAS, standard :3471)
//   2. WEBHOOK_URL=$BAS/api/stripe/webhooks node scripts/stripe-testlage-webhook.mjs
//   3. kontona ur SCRATCH=<tmp> KOP=1 node scripts/qa-kampanj-konton.mjs skapa
//
//   SCRATCH=<tmp> node scripts/qa-kampanj-kop.mjs <konto> <pixel7|desktop> <vantat>
//     konto   kop-bw | kop-cm | kop-ford (före detta kund, betalar inte)
//     vantat  beloppet kassan ska visa: 99, 49 eller 149
//
// Köpet: köpsteget, kryssrutan, Stripes kassa (beloppet och kupongen),
// testkortet 4242 4242 4242 4242, returen. Sedan profilen efter webhooken
// (prenumerationen, premium_scope, paket_started_at), Stripe test (första
// fakturan, kupongen, nästa faktura) och byggaren: premiummallen och Word
// utan betalvägg och Jobbcoachens förslag efter gratiskvoten. Resultatet i
// $SCRATCH/qa-kampanj-kop.jsonl, skärmdumpar i $SCRATCH/qa-kampanj-kop/.
// Nycklar skrivs aldrig ut. Inga live-nycklar används.

import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const lasEnv = (fil) =>
  Object.fromEntries(
    fs
      .readFileSync(fil, 'utf8')
      .split(/\r?\n/)
      .filter((r) => r.includes('=') && !r.trim().startsWith('#'))
      .map((r) => {
        const i = r.indexOf('=')
        return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
      })
  )
const env = lasEnv('.env.local')
const envTest = lasEnv('.env.test.local')
if (!envTest.STRIPE_SECRET_KEY?.startsWith('sk_test_')) throw new Error('.env.test.local saknar en testnyckel')
const stripe = new Stripe(envTest.STRIPE_SECRET_KEY)
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const BAS = process.env.BAS || 'http://localhost:3471'
const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
const UT = path.join(SCRATCH, 'qa-kampanj-kop')
const NED = path.join(UT, 'nedladdningar')
// Tom mapp per körning: Chrome skriver över en fil med samma namn.
fs.rmSync(NED, { recursive: true, force: true })
fs.mkdirSync(NED, { recursive: true })
const KONTON = JSON.parse(fs.readFileSync(path.join(SCRATCH, 'qa-kampanj-konton.json'), 'utf8'))
const [kontoNamn, vy = 'pixel7', vantatStr] = process.argv.slice(2)
const vantat = Number(vantatStr)
const konto = KONTON[kontoNamn]
if (!konto) throw new Error(`konto ${kontoNamn} saknas`)
if (![99, 49, 149].includes(vantat)) throw new Error('vantat: 99, 49 eller 149')
const kupong = { 99: 'black-week-2026', 49: 'cyber-monday-2026', 149: null }[vantat]

const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const fel = []
let nr = 0
function logg(steg, ok, data = {}) {
  fs.appendFileSync(path.join(SCRATCH, 'qa-kampanj-kop.jsonl'), JSON.stringify({ tid: new Date().toISOString(), konto: kontoNamn, vy, steg, ok, ...data }) + '\n')
  console.log(`${ok === null ? 'INFO' : ok ? 'OK  ' : 'FEL '} ${steg} ${JSON.stringify(data).slice(0, 500)}`)
  if (ok === false) fel.push(steg)
}
async function bild(p, namn) {
  nr += 1
  await p.screenshot({ path: path.join(UT, `${kontoNamn}-${vy}-${String(nr).padStart(2, '0')}-${namn}.png`) }).catch(() => {})
}
const VY = {
  pixel7: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { width: 1280, height: 860, deviceScaleFactor: 1 },
}

async function klickaRe(p, src, sel = 'button') {
  return p.evaluate(
    (src, sel) => {
      const r = new RegExp(src, 'i')
      const el = [...document.querySelectorAll(sel)].find(
        (e) => e.getClientRects().length > 0 && !e.disabled && r.test((e.innerText || '').replace(/\s+/g, ' ').trim())
      )
      if (!el) return null
      el.scrollIntoView({ block: 'center' })
      el.click()
      return el.innerText.replace(/\s+/g, ' ').trim()
    },
    src,
    sel
  )
}
const dialogText = (p) =>
  p.evaluate(() => {
    const d = [...document.querySelectorAll('[role="dialog"], [role="alertdialog"], dialog[open]')].filter((e) => e.getClientRects().length > 0)
    return d.length ? d.map((e) => e.innerText.replace(/\s+/g, ' ').trim()).join(' | ') : null
  })

async function profil() {
  const { data } = await admin
    .from('profiles')
    .select('subscription_tier, subscription_status, subscription_id, premium_scope, premium_until, premium_source, price_id, paket_started_at, stripe_customer_id, current_period_end')
    .eq('id', konto.userId)
    .maybeSingle()
  return data
}

/**
 * Stripes kassa (hösten 2026): betalsätten Kort och Klarna som radioknappar i
 * en Stripe-ram (elements-inner), kortfälten och betalknappen i samma ram.
 * Returnerar ramen så att betalningen kan tryckas där.
 */
async function fyllKort(p) {
  let ram = null
  for (let forsok = 0; forsok < 20 && !ram; forsok++) {
    for (const f of p.frames()) {
      const kort = await f.$('::-p-text(Kort)').catch(() => null)
      if (kort && /elements-inner/.test(f.url())) {
        await kort.click().catch(() => {})
        ram = f
        break
      }
    }
    if (!ram) await vanta(1000)
  }
  if (!ram) throw new Error('hittade inte betalsättet Kort i kassan')
  await ram.waitForSelector('#payment-numberInput', { visible: true, timeout: 20000 })
  await ram.type('#payment-numberInput', '4242424242424242', { delay: 25 })
  await ram.type('#payment-expiryInput', '12 / 34', { delay: 25 })
  await ram.type('#payment-cvcInput', '123', { delay: 25 })
  const namn = await ram.$('#payment-nameInput')
  if (namn && !(await namn.evaluate((e) => e.value))) await ram.type('#payment-nameInput', 'QA Kampanj')
  const land = await ram.$('select[name="country"]')
  if (land) await land.select('SE').catch(() => {})
  const post = await ram.$('#payment-postalCodeInput')
  if (post && (await post.evaluate((e) => e.offsetParent !== null))) await ram.type('#payment-postalCodeInput', '11122')
  // "Spara min information" (Link) lämnas av.
  const link = await ram.$('#payment-linkOptInInput')
  if (link && (await link.evaluate((e) => e.checked))) await link.click().catch(() => {})
  return ram
}

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
try {
  const p = await browser.newPage()
  await p.setViewport(VY[vy])
  p.on('pageerror', (e) => logg('sidfel', false, { fel: String(e).slice(0, 300) }))
  await p.setRequestInterception(true)
  p.on('request', (r) => (/posthog\.com|\/ingest\//.test(r.url()) ? r.abort() : r.continue()))
  await p.setCookie({ name: 'cvBrevCookieConsent', value: 'true', url: BAS })

  // Inloggning
  await p.goto(BAS + '/login', { waitUntil: 'networkidle2', timeout: 120000 })
  await p.type('input[type="email"]', konto.email)
  await p.type('input[type="password"]', konto.password)
  await Promise.all([p.waitForNavigation({ waitUntil: 'networkidle2', timeout: 120000 }).catch(() => {}), p.click('button[type="submit"]')])
  await p.waitForFunction(() => !location.pathname.startsWith('/login'), { timeout: 90000 })

  // Köpsteget
  await p.goto(BAS + '/dashboard/valj-spar?paket=all_month&steg=kop&plats=kampanjrad', { waitUntil: 'networkidle2', timeout: 120000 })
  await vanta(800)
  const kopText = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))
  const knapp = (kopText.match(/Till betalning, [^.]{0,40}/) ?? [''])[0]
  logg('köpsteget visar beloppet', knapp.includes(`${vantat} kr`), { knapp })
  await bild(p, 'kopsteg')
  await p.click('input[type="checkbox"]')
  await vanta(300)
  await Promise.all([
    p.waitForFunction(() => location.host.includes('stripe.com'), { timeout: 60000 }).catch(() => {}),
    klickaRe(p, '^Till betalning'),
  ])
  await vanta(4000)

  // Kassan, facit
  const kassa = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))
  const belopp = (kassa.match(/Abonnera på [^]{0,90}/) ?? [''])[0]
  const kassaOk =
    vantat === 149
      ? /149,00 kr/.test(belopp) && !/Därefter/.test(belopp)
      : new RegExp(`${vantat},00 kr`).test(belopp) && /Därefter 149,00 kr/.test(belopp)
  logg(`kassan visar ${vantat} kr`, kassaOk, { belopp })
  const sessionId = (p.url().match(/cs_test_[A-Za-z0-9]+/) ?? [null])[0]
  if (sessionId) {
    const s = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['total_details.breakdown'] })
    const rabatter = (s.total_details?.breakdown?.discounts ?? []).map((d) => d.discount?.coupon?.id ?? d.discount?.source?.coupon)
    logg('kassasessionen i Stripe test', s.amount_total === vantat * 100 && (kupong ? rabatter.includes(kupong) : rabatter.length === 0), {
      amount_total: s.amount_total,
      rabatter,
      livemode: s.livemode,
      expires_at: new Date(s.expires_at * 1000).toISOString(),
    })
  } else logg('kassasessionens id', false, { url: p.url().slice(0, 80) })
  await bild(p, 'kassa')

  if (vantat !== 149) {
    // Betalningen
    const ram = await fyllKort(p)
    await bild(p, 'kassa-ifylld')
    await ram.click('[data-testid="payment-form-submit-button"]')
    await p.waitForFunction((bas) => location.href.startsWith(bas), { timeout: 120000, polling: 500 }, BAS)
    await vanta(3000)
    logg('returen från kassan', p.url().includes('premium_activated=true'), { url: p.url().replace(BAS, '') })
    await bild(p, 'retur')

    // Webhooken: profilen
    let pr = null
    for (let i = 0; i < 60; i++) {
      pr = await profil()
      if (pr?.subscription_status === 'active' && pr?.premium_scope && pr?.paket_started_at) break
      await vanta(2000)
    }
    logg('profilen är Premium efter webhooken', pr?.subscription_status === 'active' && pr?.premium_scope === 'allt' && !!pr?.paket_started_at && pr?.price_id === envTest.NEXT_PUBLIC_STRIPE_PRICE_ID, {
      subscription_tier: pr?.subscription_tier,
      subscription_status: pr?.subscription_status,
      premium_scope: pr?.premium_scope,
      premium_source: pr?.premium_source,
      price_id_ar_manad: pr?.price_id === envTest.NEXT_PUBLIC_STRIPE_PRICE_ID,
      paket_started_at: pr?.paket_started_at,
      current_period_end: pr?.current_period_end,
    })
    const fil = path.join(SCRATCH, 'qa-kampanj-konton.json')
    const k = JSON.parse(fs.readFileSync(fil, 'utf8'))
    k[kontoNamn] = { ...k[kontoNamn], customer: pr?.stripe_customer_id, subscription: pr?.subscription_id }
    fs.writeFileSync(fil, JSON.stringify(k, null, 2))

    // Stripe test: första fakturan, kupongen och nästa faktura
    if (pr?.stripe_customer_id && pr?.subscription_id) {
      const fakturor = await stripe.invoices.list({ customer: pr.stripe_customer_id, limit: 5 })
      const forsta = fakturor.data[fakturor.data.length - 1]
      const kuponger = (forsta?.discounts ?? []).length
        ? await Promise.all(forsta.discounts.map(async (d) => (typeof d === 'string' ? (await stripe.invoices.retrieve(forsta.id, { expand: ['discounts'] })).discounts.map((x) => x.coupon?.id ?? x.source?.coupon) : [d.coupon?.id ?? d.source?.coupon])))
        : []
      const kupId = [...new Set(kuponger.flat())]
      logg(`första fakturan är ${vantat} kr med kupongen`, forsta?.amount_paid === vantat * 100 && forsta?.status === 'paid' && kupId.includes(kupong), {
        faktura: forsta?.id,
        amount_paid: forsta?.amount_paid,
        subtotal: forsta?.subtotal,
        status: forsta?.status,
        kupong: kupId,
        billing_reason: forsta?.billing_reason,
      })
      const nasta = await stripe.invoices.createPreview({ customer: pr.stripe_customer_id, subscription: pr.subscription_id })
      logg('nästa faktura är 149 kr utan kupong', nasta.amount_due === 14900 && (nasta.discounts ?? []).length === 0, {
        amount_due: nasta.amount_due,
        period: new Date(nasta.period_end * 1000).toISOString().slice(0, 10),
        discounts: nasta.discounts,
      })
      const sub = await stripe.subscriptions.retrieve(pr.subscription_id)
      logg('prenumerationen i Stripe test', sub.status === 'active' && sub.items.data[0]?.price?.unit_amount === 14900 && sub.metadata?.kampanj === kupong, {
        status: sub.status,
        pris: sub.items.data[0]?.price?.unit_amount,
        kampanj: sub.metadata?.kampanj,
        livemode: sub.livemode,
      })
    } else logg('kund och prenumeration i profilen', false, {})

    // Byggaren efter köpet: premiummallen, Word och Jobbcoachen.
    const cdp = await p.createCDPSession()
    await cdp.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: NED })
    const fore = new Set(fs.readdirSync(NED))
    await p.goto(`${BAS}/dashboard/skapa-cv?cv=${konto.cvId}&mall=koppar`, { waitUntil: 'load', timeout: 120000 })
    await vanta(3000)
    const knappar = await p.evaluate(() =>
      [...document.querySelectorAll('button')].filter((e) => e.getClientRects().length > 0 && /ladda ner/i.test(e.innerText)).map((e) => e.innerText.replace(/\s+/g, ' ').trim())
    )
    logg('byggaren: premiummallen utan pris på knappen', knappar.length > 0 && knappar.every((t) => !/\bkr\b/.test(t)), { knappar })
    await bild(p, 'byggaren-premium')
    // Word i premiummallen
    await klickaRe(p, 'Word$', '[role="radio"]')
    await vanta(1500)
    const vagg = await dialogText(p)
    const klick = await klickaRe(p, '^(Spara och )?ladda ner Word')
    let docx = null
    for (let i = 0; i < 120 && !docx; i++) {
      docx = fs.readdirSync(NED).find((f) => f.endsWith('.docx') && !fore.has(f)) ?? null
      if (!docx) await vanta(500)
    }
    const arWord = docx ? fs.readFileSync(path.join(NED, docx)).subarray(0, 2).toString() === 'PK' : false
    logg('byggaren: Word i premiummallen laddas ner utan betalvägg', !vagg && arWord, { vagg, klick, fil: docx })
    await bild(p, 'byggaren-word')

    // Jobbcoachen: tre förslag i dag redan, ett till ska gå (Premium 30 per dygn).
    const rader = Array.from({ length: 3 }, () => ({ user_id: konto.userId, feature_name: 'cv_bygg_punkter', endpoint: '/api/cv/bygg/forslag', ai_model: 'qa', prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, cost_usd: 0, cost_sek: 0, metadata: { qa: true } }))
    await admin.from('ai_usage_costs').insert(rader)
    const svar = await p.evaluate(async () => {
      const r = await fetch('/api/cv/bygg/forslag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typ: 'punkter', namn: 'Erik Lindberg', titel: 'Projektledare', arbetsgivare: 'Klarna', yrke: 'Projektledare' }),
      })
      const j = await r.json().catch(() => ({}))
      return { status: r.status, punkter: Array.isArray(j.punkter) ? j.punkter.length : null, kvar: j.kvar ?? null, fel: j.error ?? null }
    })
    logg('Jobbcoachen: fjärde förslaget går (Premium, 30 per dygn)', svar.status === 200 && svar.punkter > 0 && svar.kvar === null, svar)
  }
  await p.close()
} finally {
  await browser.close()
}
console.log(fel.length ? `\n${fel.length} FEL: ${fel.join(', ')}` : '\nAllt OK')
process.exit(fel.length ? 1 : 0)
