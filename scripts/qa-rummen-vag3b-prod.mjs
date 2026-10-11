// scripts/qa-rummen-vag3b-prod.mjs
// E2E för våg 3b mot riktig data: nivåmätningen, ett pass och ommätningen
// genom /api/traning, i riktig Chrome på Pixel 7 med tumtryck. Körs EFTER att
// ägaren kört testmotorns migreringar i prod (våg 3a); före dem svarar
// /api/traning med 500 och skriptet stannar vid första steget.
//
//   node scripts/qa-rummen-vag3b-prod.mjs --bas https://jobbcoach.ai
//   node scripts/qa-rummen-vag3b-prod.mjs --bas http://localhost:5372   # next start mot prod-databasen
//   node scripts/qa-rummen-vag3b-prod.mjs --behall                     # behåll kontot efteråt
//   node scripts/qa-rummen-vag3b-prod.mjs --radera                     # radera ett behållet konto
//
// Stegen, en skärmdump per steg i docs/qa/rummen/vag-3b/prod/:
//   1. Konto qa-rummen-3b-prod-*@jobbcoach-qa.test med Hela paketet via
//      premium_grants (ommätningen kräver paketet) och en plan: Matrigma,
//      provdatum om 18 dagar (PUT /api/traning/plan, som ingången).
//   2. Nivåmätningen: /dashboard/tester/pass?typ=matning. Adressen byts till
//      /dashboard/tester/pass/<id> utan omladdning. Ingen regel under tiden.
//      Ett svar spärras i nätet (POST pass/svar avbryts): bannern syns, ingen
//      återkoppling, "Försök igen" sparar. Omladdning mitt i: mätningen
//      fortsätter där den stod. M1 med nivån, planen, ingen betalvägg.
//   3. Dagens pass: /dashboard/tester/pass?typ=pass. Fel svar ger regeln,
//      "Vet inte, visa regeln" räknas som fel, sista frågan ger "Visa
//      resultatet", P4 eller S1, genomgången. Inga omladdningar mellan
//      frågorna.
//   4. Ommätningen: /dashboard/tester/pass?typ=matning igen (en andra mätning
//      är en ommätning). O1 med före och efter och kurvan.
//   5. Kontroll i databasen: tre nivåpunkter (matning, pass, ommatning), tre
//      avslutade sessioner, milstolpen Första mätningen, inga svar utan
//      originalindex.
//   6. Städning: bara kontots rader, med user_id, räknat före delete
//      (feedback_testdata_stadning). --behall hoppar över den.
//
// Resultat: docs/qa/rummen/vag-3b/prod/resultat.json.

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer-core'

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
const flagga = (n) => process.argv.includes('--' + n)

const BAS = arg('bas', 'http://localhost:5372').replace(/\/$/, '')
const UT = path.resolve(arg('ut', 'docs/qa/rummen/vag-3b/prod'))
const KONTOFIL = path.resolve('scripts/.qa-rummen-3b-prod-konton.json')
fs.mkdirSync(UT, { recursive: true })

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) =>
  fs.existsSync(p)
)
if (!CHROME) throw new Error('Hittade ingen Chrome')

const PIXEL = {
  viewport: { width: 412, height: 915 - 56, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
}
const BRUS = [/googletagmanager/i, /posthog/i, /GTM\]/, /favicon/i, /net::ERR_ABORTED/i, /Failed to load resource.*(gtm|posthog|google)/i, /ERR_FAILED/i]
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const resultat = { datum: new Date().toISOString(), bas: BAS, steg: [], fel: [], db: {} }
const fel = (t) => {
  resultat.fel.push(t)
  console.log('  FEL', t)
}

/* ------------------------------------------------------------------ konto */

const TABELLER = ['test_nivapunkter', 'test_milstolpar', 'test_planer', 'logic_test_v4_sessions', 'premium_grants', 'user_activities', 'onboarding_progress', 'scheduled_emails', 'email_schedule', 'email_log', 'notifications']

async function skapaKonto() {
  const ts = Date.now()
  const email = `qa-rummen-3b-prod-${ts}@jobbcoach-qa.test`
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: `QaRummen3bProd!${ts}`,
    email_confirm: true,
    user_metadata: { full_name: 'Anna Andersson', password_set: true },
  })
  if (error) throw new Error(error.message)
  const id = data.user.id
  fs.writeFileSync(KONTOFIL, JSON.stringify({ email, id }, null, 2))
  await vanta(600)
  const om30 = new Date(Date.now() + 30 * 86400000).toISOString()
  const { error: pErr } = await sb.from('profiles').upsert({
    id,
    email,
    full_name: 'Anna Andersson',
    email_verified_at: new Date().toISOString(),
    onboarding_intent: 'tester',
  })
  if (pErr) throw new Error('profil: ' + pErr.message)
  const { error: gErr } = await sb.from('premium_grants').insert({
    user_id: id,
    stripe_event_id: `qa_rummen_3b_prod_${ts}`,
    days: 30,
    source: 'qa-rummen-3b-prod',
    scope: 'allt',
    premium_until_after: om30,
  })
  if (gErr) throw new Error('grant: ' + gErr.message)
  console.log('skapade', email, id)
  return { email, id }
}

async function radera() {
  if (!fs.existsSync(KONTOFIL)) return console.log('inget konto att radera')
  const k = JSON.parse(fs.readFileSync(KONTOFIL, 'utf8'))
  for (const t of TABELLER) {
    const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true }).eq('user_id', k.id)
    if (error) continue
    if (count) {
      const { error: dErr } = await sb.from(t).delete().eq('user_id', k.id)
      console.log(`  ${t}: ${count} rader ${dErr ? 'FEL ' + dErr.message : 'raderade'}`)
    }
  }
  const { count: pc } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('id', k.id)
  await sb.from('profiles').delete().eq('id', k.id)
  const { error } = await sb.auth.admin.deleteUser(k.id)
  console.log(`raderade ${k.email} (profiles: ${pc ?? 0}) ${error ? error.message : 'ok'}`)
  fs.unlinkSync(KONTOFIL)
}

/* ----------------------------------------------------------------- sidan */

const COOKIE = `sb-${env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`
async function loggaIn(page, email) {
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email })
  const { data: s, error } = await sb.auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token })
  if (error || !s?.session) throw new Error('session: ' + error?.message)
  const p =
    'base64-' +
    Buffer.from(
      JSON.stringify({
        access_token: s.session.access_token,
        refresh_token: s.session.refresh_token,
        expires_at: s.session.expires_at,
        expires_in: s.session.expires_in,
        token_type: 'bearer',
        user: s.session.user,
      })
    ).toString('base64')
  const CHUNK = 3200
  if (p.length <= CHUNK) await page.setCookie({ name: COOKIE, value: p, url: BAS, path: '/' })
  else for (let i = 0, n = 0; i < p.length; i += CHUNK, n++) await page.setCookie({ name: `${COOKIE}.${n}`, value: p.slice(i, i + CHUNK), url: BAS, path: '/' })
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'false', url: BAS, path: '/' })
}

async function skarmdump(page, namn, extra = {}) {
  const fil = path.join(UT, `${String(resultat.steg.length + 1).padStart(2, '0')}-${namn}.png`)
  await page.screenshot({ path: fil })
  resultat.steg.push({ namn, fil: path.relative(process.cwd(), fil).split(path.sep).join('/'), url: page.url().replace(BAS, ''), ...extra })
  console.log(' ', namn)
}

async function tryck(page, el) {
  const b = await el.boundingBox()
  await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2)
}

async function tryckText(page, text) {
  const h = await page.evaluateHandle((t) => [...document.querySelectorAll('button, a')].find((b) => b.textContent.trim().startsWith(t)) ?? null, text)
  const el = h.asElement()
  if (!el) throw new Error(`hittade inte "${text}"`)
  await tryck(page, el)
}

const harResultat = (page) => page.evaluate(() => !!document.querySelector('[data-resultat]'))
const harRegel = (page) => page.evaluate(() => !!document.querySelector('.regelpanel'))

/** Svarar på frågorna tills resultatet visas. valj(i) ger alternativets index. */
async function svaraTillResultat(page, { valj, vetInteVid = -1, maxFragor = 30, onFraga } = {}) {
  let n = 0
  let regelUnderTiden = 0
  while (n < maxFragor) {
    if (await harResultat(page)) return { n, regelUnderTiden }
    if (await harRegel(page)) {
      const visa = await page.evaluate(() => [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Visa resultatet'))
      await tryckText(page, visa ? 'Visa resultatet' : 'Nästa fråga')
      await vanta(500)
      continue
    }
    const knappar = await page.$$('[role=radiogroup] button[role=radio]:not([disabled])')
    if (!knappar.length) {
      await vanta(300)
      continue
    }
    if (onFraga) await onFraga(n)
    if (n === vetInteVid) await tryckText(page, 'Vet inte, visa regeln')
    else await tryck(page, knappar[valj(n) % knappar.length])
    n++
    await page.waitForFunction(
      () => !!document.querySelector('.regelpanel, [data-resultat], [role=alert]') || document.querySelectorAll('[role=radiogroup] button:not([disabled])').length > 0,
      { timeout: 20000 }
    )
    await vanta(400)
  }
  throw new Error('resultatet kom aldrig')
}

/* ------------------------------------------------------------------- kör */

if (flagga('radera')) {
  await radera()
  process.exit(0)
}

const k = await skapaKonto()
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.emulate(PIXEL)
const logg = { konsol: [], http: [], navigeringar: 0 }
page.on('console', (m) => m.type() === 'error' && !BRUS.some((r) => r.test(m.text())) && logg.konsol.push(m.text().slice(0, 300)))
page.on('pageerror', (e) => logg.konsol.push('pageerror: ' + String(e.message).slice(0, 300)))
page.on('response', (r) => r.status() >= 400 && r.url().startsWith(BAS) && !BRUS.some((x) => x.test(r.url())) && logg.http.push(`${r.status()} ${r.request().method()} ${r.url().replace(BAS, '')}`))
page.on('framenavigated', (f) => f === page.mainFrame() && logg.navigeringar++)

try {
  await loggaIn(page, k.email)

  // 1. Planen, som ingången sparar den.
  await page.goto(`${BAS}/dashboard/tester`, { waitUntil: 'networkidle0', timeout: 90000 })
  const prov = new Date(Date.now() + 18 * 86400000).toISOString().slice(0, 10)
  const plan = await page.evaluate(async (prov) => {
    const r = await fetch('/api/traning/plan', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testtyper: ['matris'], leverantor: 'matrigma', variant: 'klassisk', provdatum: prov }),
    })
    return { status: r.status, kropp: await r.text() }
  }, prov)
  if (plan.status !== 200) throw new Error(`PUT /api/traning/plan svarade ${plan.status}: ${plan.kropp.slice(0, 200)} (migreringarna körda?)`)

  // 2. Nivåmätningen, med ett svar som spärras i nätet och en omladdning mitt i.
  await page.goto(`${BAS}/dashboard/tester/pass?typ=matning`, { waitUntil: 'networkidle0', timeout: 90000 })
  await page.waitForSelector('[role=radiogroup] button[role=radio]', { timeout: 30000 })
  const navStart = logg.navigeringar
  await skarmdump(page, 'matning-fraga-1')
  if (!/\/dashboard\/tester\/pass\/[0-9a-f-]{36}$/.test(page.url())) fel(`adressen byttes inte till sessionen: ${page.url()}`)
  const sessionsUrl = page.url()

  // Nätverksfel på första svaret: banner, ingen återkoppling, inget "sparat".
  await page.setRequestInterception(true)
  let spärra = true
  const spärr = (req) => {
    if (spärra && req.method() === 'POST' && req.url().includes('/api/traning/pass/svar')) {
      spärra = false
      req.abort('failed')
    } else req.continue()
  }
  page.on('request', spärr)
  await tryck(page, (await page.$$('[role=radiogroup] button[role=radio]'))[1])
  await page.waitForSelector('[role=alert]', { timeout: 15000 })
  const natfel = await page.evaluate(() => ({ alert: document.querySelector('[role=alert]')?.textContent ?? '', sparat: /sparat/i.test(document.body.textContent ?? '') }))
  await skarmdump(page, 'matning-natfel', natfel)
  if (natfel.sparat) fel('UI:t säger "sparat" vid nätverksfel')
  page.off('request', spärr)
  await page.setRequestInterception(false)
  await tryckText(page, 'Försök igen')
  await page.waitForFunction(() => !document.querySelector('[role=alert]'), { timeout: 15000 })
  await vanta(500)

  // Omladdning mitt i mätningen: fortsätter där den stod.
  const foreOmladdning = await page.evaluate(() => document.querySelector('[data-pass-shell] header')?.textContent ?? '')
  await page.reload({ waitUntil: 'networkidle0' })
  await page.waitForSelector('[role=radiogroup] button[role=radio]', { timeout: 30000 })
  const efterOmladdning = await page.evaluate(() => document.querySelector('[data-pass-shell] header')?.textContent ?? '')
  await skarmdump(page, 'matning-efter-omladdning', { foreOmladdning, efterOmladdning, url: page.url() })
  if (page.url() !== sessionsUrl) fel('omladdningen startade en ny mätning')
  const navEfterOmladdning = logg.navigeringar

  const m = await svaraTillResultat(page, { valj: (i) => (i * 2 + 1) % 6 })
  if (m.regelUnderTiden) fel('mätningen visade regeln under tiden')
  await vanta(1600)
  await skarmdump(page, 'm1')
  const m1 = await page.evaluate(() => ({
    niva: document.querySelector('.text-tal-stor')?.textContent ?? '',
    betalvagg: !!document.querySelector('section[aria-label] .text-koppar-ink'),
    primar: [...document.querySelectorAll('.knapp-primar')].map((b) => b.textContent.trim()),
  }))
  resultat.steg.at(-1).m1 = m1
  if (logg.navigeringar - navEfterOmladdning > 0) fel(`sidan laddades om mellan mätningens frågor (${logg.navigeringar - navEfterOmladdning})`)
  void navStart

  // 3. Dagens pass.
  await page.goto(`${BAS}/dashboard/tester/pass?typ=pass`, { waitUntil: 'networkidle0', timeout: 90000 })
  await page.waitForSelector('[role=radiogroup] button[role=radio]', { timeout: 30000 })
  const navPass = logg.navigeringar
  await skarmdump(page, 'pass-fraga-1')
  let regelDump = false
  const p = await svaraTillResultat(page, {
    valj: (i) => (i * 5 + 2) % 6,
    vetInteVid: 2,
    onFraga: async () => {
      if (!regelDump && (await harRegel(page))) regelDump = true
    },
  })
  await vanta(1600)
  await skarmdump(page, 'p4', { fragor: p.n })
  if (logg.navigeringar - navPass > 0) fel(`sidan laddades om mellan passets frågor (${logg.navigeringar - navPass})`)
  await page.evaluate(() => {
    const m = document.querySelector('[data-resultat] main')
    if (m) m.scrollTop = m.scrollHeight
  })
  await vanta(400)
  await skarmdump(page, 'p4-botten')
  await tryck(page, await page.$('.knapp-primar'))
  await vanta(800)
  await skarmdump(page, 'genomgangen')

  // 4. Ommätningen.
  await page.goto(`${BAS}/dashboard/tester/pass?typ=matning`, { waitUntil: 'networkidle0', timeout: 90000 })
  await page.waitForSelector('[role=radiogroup] button[role=radio]', { timeout: 30000 })
  await skarmdump(page, 'ommatning-fraga-1')
  await svaraTillResultat(page, { valj: (i) => (i * 3) % 6 })
  await vanta(1600)
  await skarmdump(page, 'o1')

  // 5. Databasen.
  const [punkter, sessioner, mil] = await Promise.all([
    sb.from('test_nivapunkter').select('dag, typ, niva').eq('user_id', k.id).order('skapad_at'),
    sb.from('logic_test_v4_sessions').select('id, test_type, completed_at, answers, meta').eq('user_id', k.id),
    sb.from('test_milstolpar').select('nyckel, visad_at').eq('user_id', k.id),
  ])
  resultat.db = {
    punkter: punkter.data,
    sessioner: (sessioner.data ?? []).map((s) => ({ test_type: s.test_type, avslutad: !!s.completed_at, svar: (s.answers ?? []).length, typ: s.meta?.typ })),
    milstolpar: mil.data,
  }
  const typer = (punkter.data ?? []).map((x) => x.typ)
  for (const t of ['matning', 'pass', 'ommatning']) if (!typer.includes(t)) fel(`ingen nivåpunkt av typen ${t}`)
  if ((sessioner.data ?? []).filter((s) => s.completed_at).length < 3) fel('färre än tre avslutade sessioner')
  if ((sessioner.data ?? []).some((s) => (s.answers ?? []).some((a) => typeof a.selected !== 'number'))) fel('svar utan originalindex')
  if (!(mil.data ?? []).some((x) => x.nyckel === 'forsta_matningen')) fel('milstolpen Första mätningen saknas')
} catch (e) {
  fel(`avbröts: ${e.message}`)
  await skarmdump(page, 'avbrott').catch(() => {})
} finally {
  resultat.konsol = logg.konsol
  resultat.http = logg.http
  for (const t of logg.konsol) fel(`konsolfel: ${t}`)
  for (const t of logg.http) if (!/\/api\/traning\/pass\/svar/.test(t)) fel(`http: ${t}`)
  await browser.close()
  fs.writeFileSync(path.join(UT, 'resultat.json'), JSON.stringify(resultat, null, 2))
  console.log(`\n${resultat.fel.length} problem. Resultat i ${path.relative(process.cwd(), path.join(UT, 'resultat.json'))}`)
  if (!flagga('behall')) await radera()
}
