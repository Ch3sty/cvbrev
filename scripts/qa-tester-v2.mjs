// scripts/qa-tester-v2.mjs
// Klicktest i riktig Chrome av Testerna v2, omgång 1 (2026-10-11):
//   Premium: planen och Nivåkollen, "I morgon"-kortet med tidpunkt, Alla
//   tester med de enhetliga korten, övningsprovet i verbalt (startark,
//   klocka, resultat och genomgång), dagens pass med regelpanelen och
//   logikens övningsprov som klockan inte hinner (obesvarade räknas).
//   Gratis: låst provrad med formatet, betalväggen och startarket låst.
//   Stickprov i mörkt läge på 360.
//
//   node scripts/qa-tester-v2.mjs --port 5461 [--former m360,desktop] [--stickprov-morkt]
//   node scripts/qa-tester-v2.mjs --radera
//
// Kontroller per vy: ingen horisontell scroll, kopparknappen synlig utan
// scroll och med nederkanten under 620 px på 360, konsolfel och 4xx/5xx.
// Sparandet av tidpunkten (POST /api/traning/pass-tid) besvaras av testet
// självt tills migreringen 20261012090000_test_planer_pass_tid.sql är körd:
// kolumnen finns inte i databasen än. Kontona qa-v2-<ts>@jobbcoach-qa.test
// raderas med id; varje tabell med user_id räknas före delete.

import fs from 'node:fs'
import os from 'node:os'
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
const PORT = arg('port', '5461')
const BAS = `http://localhost:${PORT}`
const UT = path.resolve('docs/qa/tester-v2')
const KONTOFIL = path.join(process.env.QA_SCRATCH ?? os.tmpdir(), 'qa-tester-v2-konton.json')
fs.mkdirSync(UT, { recursive: true })

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))
const MOBIL_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'
const FORMER = {
  m360: { viewport: { width: 360, height: 740 - 56, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, userAgent: MOBIL_UA },
  desktop: { viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } },
}
const FORM_LISTA = arg('former', 'm360,desktop').split(',')
const BRUS = [/googletagmanager/i, /posthog/i, /GTM\]/, /favicon/i, /net::ERR_ABORTED/i, /Failed to load resource.*(gtm|posthog|google)/i, /Download the React DevTools/i, /\[Fast Refresh\]/i, /\[HMR\]/i, /Invalid source map/i]
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const ADRESS = /^qa-v2-\d+@jobbcoach-qa\.test$/

const lasKonton = () => (fs.existsSync(KONTOFIL) ? JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) : {})
const sparaKonton = (k) => fs.writeFileSync(KONTOFIL, JSON.stringify(k, null, 2))
const dagSthlm = (forskjut = 0) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date(Date.now() + forskjut * 86400000))

async function skapaKonto(nyckel, { premium = false } = {}) {
  const alla = lasKonton()
  const ts = Date.now()
  const email = `qa-v2-${ts}@jobbcoach-qa.test`
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: `QaV2!${ts}`,
    email_confirm: true,
    user_metadata: { full_name: 'Sara Lind', password_set: true },
  })
  if (error) throw new Error(error.message)
  const k = { email, userId: data.user.id }
  alla[`${nyckel}-${ts}`] = k
  sparaKonton(alla)
  await vanta(600)
  const { error: pErr } = await sb
    .from('profiles')
    .upsert({ id: k.userId, email, full_name: 'Sara Lind', email_verified_at: new Date().toISOString(), onboarding_track: 'tester', onboarding_intent: 'tester' })
  if (pErr) throw new Error('profil: ' + pErr.message)
  if (premium) {
    const om7 = new Date(Date.now() + 7 * 86400000).toISOString()
    const { error: gErr } = await sb.from('premium_grants').insert({ user_id: k.userId, days: 7, source: 'qa-tester-v2', scope: 'allt', premium_until_after: om7 })
    if (gErr) throw new Error('grant: ' + gErr.message)
  }
  console.log('skapade', nyckel, email, k.userId, premium ? 'premium' : 'gratis')
  return k
}

async function tabellerMedUserId() {
  const r = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
    headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, Accept: 'application/openapi+json' },
  })
  const spec = await r.json()
  return Object.entries(spec.definitions ?? {})
    .filter(([, d]) => d.properties && 'user_id' in d.properties)
    .map(([n]) => n)
}

async function radera() {
  const alla = lasKonton()
  for (let sida = 1; sida < 50; sida++) {
    const { data, error } = await sb.auth.admin.listUsers({ page: sida, perPage: 1000 })
    if (error || !data.users.length) break
    for (const u of data.users) {
      if (ADRESS.test(u.email ?? '') && !Object.values(alla).some((k) => k.userId === u.id)) alla[`hittad-${u.id}`] = { email: u.email, userId: u.id }
    }
  }
  const tabeller = await tabellerMedUserId()
  const rapport = { tid: new Date().toISOString(), konton: [] }
  for (const [nyckel, k] of Object.entries(alla)) {
    if (!ADRESS.test(k.email)) throw new Error('inte ett eget QA-konto: ' + k.email)
    const rader = {}
    for (const t of tabeller) {
      const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true }).eq('user_id', k.userId)
      if (error || !count) continue
      const { error: dErr } = await sb.from(t).delete().eq('user_id', k.userId)
      rader[t] = dErr ? (/view/i.test(dErr.message) ? `vy, ${count} rader via sina tabeller` : `FEL ${dErr.message} (${count})`) : count
    }
    const { count: pc } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('id', k.userId)
    if (pc) await sb.from('profiles').delete().eq('id', k.userId)
    const { error } = await sb.auth.admin.deleteUser(k.userId)
    rapport.konton.push({ nyckel, email: k.email, id: k.userId, rader, profiler: pc ?? 0, auth: error ? error.message : 'raderad' })
    console.log('raderade', nyckel, JSON.stringify(rader), 'profiles', pc ?? 0, error ? error.message : 'ok')
  }
  fs.writeFileSync(path.join(UT, 'radering.json'), JSON.stringify(rapport, null, 2))
  if (fs.existsSync(KONTOFIL)) fs.unlinkSync(KONTOFIL)
}

const projektRef = env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]
const COOKIE = `sb-${projektRef}-auth-token`
async function payloadFor(email) {
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email })
  const { data: s, error } = await createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  }).auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token })
  if (error || !s?.session) throw new Error('session: ' + error?.message)
  return (
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
  )
}

const mockade = []
async function nySida(browser, { form, system, email }) {
  const page = await browser.newPage()
  const f = FORMER[form]
  if (f.userAgent) await page.setUserAgent(f.userAgent)
  await page.setViewport(f.viewport)
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: system }])
  const p = await payloadFor(email)
  const CHUNK = 3200
  if (p.length <= CHUNK) await page.setCookie({ name: COOKIE, value: p, url: BAS, path: '/' })
  else for (let i = 0, n = 0; i < p.length; i += CHUNK, n++) await page.setCookie({ name: `${COOKIE}.${n}`, value: p.slice(i, i + CHUNK), url: BAS, path: '/' })
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'false', url: BAS, path: '/' })
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('password_prompt_dismissed', 'true')
      localStorage.setItem('jc_email_banner_dismissed_at', String(Date.now()))
      localStorage.removeItem('tema')
    } catch {}
  })
  // Tidpunkten sparas i test_planer.pass_tid, som kommer med migreringen.
  await page.setRequestInterception(true)
  page.on('request', (req) => {
    if (req.url().includes('/api/traning/pass-tid') && req.method() === 'POST') {
      mockade.push(req.postData())
      return req.respond({ status: 200, contentType: 'application/json', body: req.postData() ?? '{}' })
    }
    req.continue()
  })
  const logg = { konsol: [], http: [] }
  page.on('console', async (m) => {
    if (m.type() === 'error') {
      let t = m.text()
      // Felobjekt skrivs som JSHandle: läs ut meddelandet och var sidan stod.
      if (/JSHandle/.test(t)) {
        const delar = await Promise.all(m.args().map((a) => a.evaluate((v) => (v instanceof Error ? v.message : typeof v === 'object' ? JSON.stringify(v) : String(v))).catch(() => '?')))
        t = `${delar.join(' ')} (${page.url().replace(BAS, '')})`
      }
      if (!BRUS.some((r) => r.test(t))) logg.konsol.push(t.slice(0, 300))
    }
  })
  page.on('pageerror', (e) => logg.konsol.push('pageerror: ' + String(e.message).slice(0, 300)))
  page.on('response', (r) => {
    const u = r.url()
    if (r.status() >= 400 && u.startsWith(BAS) && !BRUS.some((x) => x.test(u))) logg.http.push(`${r.status()} ${r.request().method()} ${u.replace(BAS, '').slice(0, 160)}`)
  })
  return { page, logg }
}

const resultat = { datum: new Date().toISOString(), bas: BAS, vyer: [], fel: [], noter: [] }

async function vy(page, namn, { kopparKravs = true } = {}) {
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})
  await vanta(450)
  const fil = path.join(UT, `${namn}.png`)
  await page.screenshot({ path: fil, fullPage: false })
  const k = await page.evaluate(() => {
    const text = document.body.innerText
    const koppar = [...document.querySelectorAll('a, button')].filter((e) => {
      const r = e.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && /\bknapp-primar\b/.test(e.className) && getComputedStyle(e).visibility !== 'hidden'
    })
    const forsta = koppar[0]
    let kopparSynlig = null
    let kopparBotten = null
    if (forsta) {
      const r = forsta.getBoundingClientRect()
      const mitt = document.elementFromPoint(r.left + r.width / 2, Math.min(r.bottom - 4, innerHeight - 1))
      kopparSynlig = r.top >= 0 && r.bottom <= innerHeight && (mitt === forsta || forsta.contains(mitt))
      kopparBotten = Math.round(r.bottom)
      var iFlodesfot = !!forsta.closest('footer') && document.documentElement.hasAttribute('data-flow-active')
    }
    return {
      url: location.pathname + location.search,
      horisontell: document.documentElement.scrollWidth > innerWidth + 1,
      kopparKnapp: forsta ? forsta.textContent.trim().slice(0, 60) : null,
      kopparSynlig,
      kopparBotten,
      iFlodesfot: typeof iFlodesfot === 'boolean' ? iFlodesfot : false,
      fonsterHojd: innerHeight,
      gamlaOrd: (text.match(/generalrepetition|provläge|nivåmätning|ommätning|mät igen/gi) ?? []).slice(0, 5),
      talstreck: text.includes('—'),
      latt: /\blätt(a)?\b/i.test(text),
      // Aldrig percentil på övningsprovet (granskningen 6.6); nivåtestens hjälp får nämna den.
      percentil: !!document.querySelector('[data-ovningsprov-rubrik]') && /percentil/i.test(text),
    }
  })
  const rad = { namn, fil: path.relative(process.cwd(), fil).split(path.sep).join('/'), ...k }
  resultat.vyer.push(rad)
  const fel = []
  if (k.horisontell) fel.push('horisontell scroll')
  // 620-regeln gäller sidor med dörrraden (den börjar på 628 px). I flöden är
  // dörrraden dold och knappen står i en fast fot som alltid syns.
  if (kopparKravs && k.kopparKnapp && k.fonsterHojd < 800 && !k.iFlodesfot && k.kopparBotten > 620) fel.push(`kopparknappen "${k.kopparKnapp}" nederkant ${k.kopparBotten} px, kravet är under 620`)
  else if (kopparKravs && k.kopparKnapp && !k.kopparSynlig) fel.push(`kopparknappen "${k.kopparKnapp}" kräver scroll (nederkant ${k.kopparBotten} px, fönstret ${k.fonsterHojd} px)`)
  if (k.gamlaOrd.length) fel.push(`gamla ord: ${k.gamlaOrd.join(', ')}`)
  if (k.talstreck) fel.push('talstreck i vyn')
  if (k.latt) fel.push('ordet lätt i vyn')
  if (k.percentil) fel.push('percentil i vyn')
  for (const f of fel) resultat.fel.push(`${namn}: ${f}`)
  console.log(namn, k.url, fel.length ? 'FEL: ' + fel.join('; ') : 'ok')
  return rad
}

async function element(page, text) {
  const h = await page.evaluateHandle(
    (t) => [...document.querySelectorAll('button, a')].find((b) => b.textContent.trim().startsWith(t) && b.getBoundingClientRect().width > 0) ?? null,
    text
  )
  const el = h.asElement()
  if (!el) throw new Error(`hittade inte "${text}"`)
  return el
}

async function valjare(page, sel, ms = 15000) {
  const slut = Date.now() + ms
  for (;;) {
    const h = await page.evaluateHandle(
      (s) => [...document.querySelectorAll(s)].find((a) => {
        const r = a.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && getComputedStyle(a).visibility !== 'hidden'
      }) ?? null,
      sel
    )
    const el = h.asElement()
    if (el) return el
    if (Date.now() > slut) throw new Error(`hittade inte ${sel}`)
    await vanta(250)
  }
}

async function tryck(page, el, form) {
  if (typeof el === 'string') {
    const text = el
    for (let i = 0; i < 20; i++) {
      el = await element(page, text).catch(() => null)
      if (el && (await el.boundingBox())) break
      await vanta(250)
    }
    if (!el) throw new Error(`hittade inte "${text}"`)
  }
  await el.evaluate((e) => e.scrollIntoView({ block: 'center' }))
  await vanta(150)
  const box = await el.boundingBox()
  if (!box) throw new Error('ingen ruta att trycka på')
  if (form === 'desktop') await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  else await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
}

async function tillAdress(page, test, ms = 45000) {
  await page.waitForFunction(
    (t) => (t.startsWith('^') ? new RegExp(t).test(location.pathname) : location.pathname === t) && !document.querySelector('[aria-busy="true"]'),
    { timeout: ms, polling: 100 },
    test
  )
  await vanta(800)
}

async function gorNivakollen(page, form) {
  const lank = await page.$('main a[href*="typ=matning"]')
  if (lank) await tryck(page, lank, form)
  else await page.goto(`${BAS}/dashboard/tester/pass?typ=matning`, { waitUntil: 'networkidle2' })
  await page.waitForSelector('[data-pass-shell]', { timeout: 45000 })
  for (let i = 0; i < 40; i++) {
    if (await page.$('[data-resultat]')) break
    const knappar = await page.$$('[role=radiogroup] button[role=radio]:not([disabled])')
    if (!knappar.length) {
      await vanta(300)
      continue
    }
    await tryck(page, knappar[i % 3], form)
    await vanta(500)
  }
  await page.waitForSelector('[data-resultat]', { timeout: 45000 })
  await vanta(1800)
}

async function scrollaTill(page, sel) {
  const el = await valjare(page, sel)
  await el.evaluate((e) => e.scrollIntoView({ block: 'start' }))
  await vanta(400)
  return el
}

async function premium(browser, form) {
  const pre = `${form}-ljust`
  const k = await skapaKonto(`${pre}-premium`, { premium: true })
  const { page, logg } = await nySida(browser, { form, system: 'light', email: k.email })
  try {
    // 1. Planen: figurer och text, SHL Verify, om två veckor.
    await page.goto(`${BAS}/dashboard/tester`, { waitUntil: 'networkidle2', timeout: 120000 })
    await page.waitForSelector('[data-steg="1"]', { timeout: 45000 })
    const boxar = await page.$$('button[role=checkbox]')
    await tryck(page, boxar[0], form)
    const ord = await page.evaluateHandle(() => [...document.querySelectorAll('button[role=checkbox]')].find((b) => /Ord och text/.test(b.textContent)) ?? null)
    if (ord.asElement()) await tryck(page, ord.asElement(), form)
    await tryck(page, 'Fortsätt', form)
    await page.waitForSelector('[data-steg="2"]', { timeout: 15000 })
    const shl = await page.evaluateHandle(() => [...document.querySelectorAll('button[role=radio]')].find((b) => b.textContent.trim() === 'SHL Verify') ?? null)
    await tryck(page, shl.asElement(), form)
    await tryck(page, 'Fortsätt', form)
    await page.waitForSelector('[data-steg="3"]', { timeout: 15000 })
    await tryck(page, 'Om två veckor', form)
    await page.waitForSelector('[data-plantext]', { timeout: 15000 })
    await tryck(page, 'Visa min plan', form)
    await tillAdress(page, '/dashboard/tester')

    // 2. Nivåkollen och dag 1-slutet.
    await gorNivakollen(page, form)
    await vy(page, `${pre}-01-nivakollen-klar`, { kopparKravs: false })
    const rubrik = await page.evaluate(() => document.querySelector('[data-resultat] main')?.textContent ?? '')
    if (!/Nivåkollen klar/.test(rubrik)) resultat.fel.push(`${pre}: resultatets topprad saknar "Nivåkollen klar"`)
    await scrollaTill(page, '[data-imorgon]')
    await vy(page, `${pre}-02-imorgon-kortet`, { kopparKravs: false })
    await tryck(page, await valjare(page, '[data-imorgon] [data-pass-tid="kvall"]'), form)
    await vanta(800)
    const imorgon = await page.$eval('[data-imorgon]', (e) => e.textContent)
    if (!/klockan 18/.test(imorgon)) resultat.fel.push(`${pre}: I morgon-kortet säger inte klockan 18 efter valet`)
    await vy(page, `${pre}-03-imorgon-kvall-vald`, { kopparKravs: false })

    // 3. Alla tester, de enhetliga korten.
    await page.goto(`${BAS}/dashboard/tester/alla`, { waitUntil: 'networkidle2', timeout: 120000 })
    await page.waitForSelector('[data-testkort="logik"]', { timeout: 45000 })
    await vy(page, `${pre}-04-alla-tester`)
    const kort = await page.evaluate(() =>
      ['logik', 'verbal', 'numerisk'].map((k) => {
        const el = document.querySelector(`[data-testkort="${k}"]`)
        return { k, segment: el?.querySelectorAll('[data-niva]').length ?? 0, provrad: el?.querySelector('[data-provrad]')?.textContent ?? null }
      })
    )
    for (const x of kort) {
      if (x.segment !== 3) resultat.fel.push(`${pre}: ${x.k}-kortet har ${x.segment} segment`)
      if (!x.provrad || !/Övningsprov mot klockan/.test(x.provrad)) resultat.fel.push(`${pre}: ${x.k}-kortet saknar provraden`)
    }
    resultat.noter.push({ pre, kort })
    await scrollaTill(page, '[data-testkort="verbal"]')
    await vy(page, `${pre}-05-alla-tester-verbalt`, { kopparKravs: false })
    await scrollaTill(page, '[data-testkort="personlighet"]')
    await vy(page, `${pre}-06-alla-tester-personlighet`, { kopparKravs: false })

    // 4. Övningsprovet i verbalt: startarket, klockan, resultatet.
    await tryck(page, await valjare(page, '[data-testkort="verbal"] [data-provrad]'), form)
    await tillAdress(page, '/dashboard/tester/ovningsprov/verbal')
    await vy(page, `${pre}-07-startark-verbalt`)
    await tryck(page, await valjare(page, '[data-starta-ovningsprov]'), form)
    await tillAdress(page, '^/dashboard/tester/ovningsprov/verbal/[0-9a-f-]{36}$')
    await page.waitForSelector('[data-ovningsprov="verbal"] [data-pastaende]', { timeout: 30000 })
    await vy(page, `${pre}-08-ovningsprov-verbalt`)
    const svar = ['true', 'false', 'cannot_say']
    for (let i = 0; i < 6; i++) {
      await tryck(page, await valjare(page, `[data-svar="${svar[i % 3]}"]`), form)
      await vanta(350)
      if (i === 3) {
        // Hoppa över en: stapeln visar den i ljus koppar.
        await tryck(page, await valjare(page, '[data-nasta]'), form)
        await vanta(300)
      }
      await tryck(page, await valjare(page, '[data-nasta]'), form)
      await vanta(350)
    }
    await vy(page, `${pre}-09-ovningsprov-verbalt-stapeln`)
    const klocka = await page.$eval('[role=timer]', (e) => e.getAttribute('aria-label'))
    if (!/minuter kvar/.test(klocka ?? '')) resultat.fel.push(`${pre}: klockan säger ${klocka}`)
    // Till sista påståendet via stapeln och lämna in.
    const seg = await page.$$('[data-segmentstapel] button')
    await tryck(page, seg[seg.length - 1], form)
    await vanta(400)
    await tryck(page, await valjare(page, '[data-lamna-in]'), form)
    await page.waitForSelector('[data-resultat] [data-ovningsprov-rubrik]', { timeout: 45000 })
    await vanta(1800)
    await vy(page, `${pre}-10-resultat-verbalt`, { kopparKravs: false })
    const r = await page.evaluate(() => ({
      rubrik: document.querySelector('[data-ovningsprov-rubrik]')?.textContent ?? '',
      obesvarade: document.querySelector('[data-obesvarade]')?.getAttribute('data-obesvarade') ?? null,
    }))
    resultat.noter.push({ pre, verbalt: r })
    if (!/av 32 rätt/.test(r.rubrik)) resultat.fel.push(`${pre}: resultatets rubrik ${r.rubrik}`)
    if (!r.obesvarade || Number(r.obesvarade) < 20) resultat.fel.push(`${pre}: obesvarade ${r.obesvarade}`)
    await page.evaluate(() => document.querySelector('[data-resultat] main')?.scrollBy(0, 640))
    await vanta(500)
    await vy(page, `${pre}-11-resultat-verbalt-golv`, { kopparKravs: false })
    await tryck(page, await element(page, 'Gå igenom'), form)
    await vanta(800)
    await vy(page, `${pre}-12-genomgang-verbalt`, { kopparKravs: false })

    // 5. Dagens pass med regelpanelen.
    await page.goto(`${BAS}/dashboard/tester/pass?typ=pass`, { waitUntil: 'networkidle2', timeout: 120000 })
    await page.waitForSelector('[data-pass-shell] [role=radiogroup] button[role=radio]:not([disabled])', { timeout: 45000 })
    await vy(page, `${pre}-13-pass-fore-svar`, { kopparKravs: false })
    const vetInte = await element(page, 'Vet inte, visa regeln').catch(() => null)
    if (!vetInte) resultat.fel.push(`${pre}: passet saknar "Vet inte, visa regeln"`)
    const alt = await page.$$('[data-pass-shell] [role=radiogroup] button[role=radio]')
    await tryck(page, alt[4], form)
    await page.waitForSelector('[data-regelpanel]', { timeout: 20000 })
    await vanta(700)
    await vy(page, `${pre}-14-pass-regelpanel`)
    const panel = await page.$eval('[data-regelpanel]', (e) => e.textContent)
    if (!/Regeln/.test(panel)) resultat.fel.push(`${pre}: regelpanelen saknar rubriken Regeln`)

    // 6. Logikens övningsprov: startarket, klockan, inlämnat med obesvarade.
    await page.goto(`${BAS}/dashboard/tester/ovningsprov/logik`, { waitUntil: 'networkidle2', timeout: 120000 })
    await page.waitForSelector('[data-startark="logik"]', { timeout: 30000 })
    await vy(page, `${pre}-15-startark-logik`)
    await tryck(page, await valjare(page, '[data-starta-ovningsprov]'), form)
    await page.waitForSelector('[data-pass-shell] [role=timer]', { timeout: 45000 })
    await vanta(800)
    await tryck(page, (await page.$$('[data-pass-shell] [role=radiogroup] button[role=radio]'))[1], form)
    await vanta(500)
    await vy(page, `${pre}-16-ovningsprov-logik`)
    const lseg = await page.$$('[data-segmentstapel] button')
    await tryck(page, lseg[lseg.length - 1], form)
    await vanta(400)
    await tryck(page, await valjare(page, '[data-lamna-in]'), form)
    await page.waitForSelector('[data-resultat] [data-ovningsprov-rubrik]', { timeout: 60000 })
    await vanta(1800)
    await vy(page, `${pre}-17-resultat-logik`, { kopparKravs: false })
  } catch (e) {
    resultat.fel.push(`${pre}: avbrott ${String(e?.message ?? e)}`)
    await page.screenshot({ path: path.join(UT, `${pre}-avbrott.png`) }).catch(() => {})
  }
  if (logg.konsol.length) resultat.fel.push(`${pre} premium: konsolfel ${JSON.stringify(logg.konsol)}`)
  if (logg.http.length) resultat.fel.push(`${pre} premium: http ${JSON.stringify(logg.http)}`)
  await page.close()
}

async function gratis(browser, form) {
  const pre = `${form}-ljust`
  const k = await skapaKonto(`${pre}-gratis`)
  const { error } = await sb
    .from('test_planer')
    .upsert({ user_id: k.userId, testtyper: ['matris', 'verbal'], leverantor: 'matrigma', variant: 'klassisk', provdatum: dagSthlm(9) })
  if (error) throw new Error('plan: ' + error.message)
  const { page, logg } = await nySida(browser, { form, system: 'light', email: k.email })
  try {
    await page.goto(`${BAS}/dashboard/tester/alla`, { waitUntil: 'networkidle2', timeout: 120000 })
    await page.waitForSelector('[data-testkort="logik"]', { timeout: 45000 })
    await vy(page, `${pre}-20-gratis-alla-tester`, { kopparKravs: false })
    const rad = await scrollaTill(page, '[data-testkort="logik"] [data-provrad="last"]')
    await page.evaluate(() => window.scrollBy(0, -200))
    await vanta(300)
    await vy(page, `${pre}-21-gratis-provrad-last`, { kopparKravs: false })
    const text = await rad.evaluate((e) => e.textContent)
    if (!/Samma format som Matrigma: cirka 35 uppgifter på 40 minuter/.test(text)) resultat.fel.push(`${pre}: låst provrad saknar formatet: ${text}`)
    if (!/Ingår i Premium/.test(text)) resultat.fel.push(`${pre}: låst provrad saknar "Ingår i Premium"`)
    // Den låsta raden öppnar startarket, vars betalvägg säger formatet och datumet.
    await tryck(page, rad, form)
    await tillAdress(page, '/dashboard/tester/ovningsprov/logik')
    await page.waitForSelector('[data-startark="logik"]', { timeout: 30000 })
    await vy(page, `${pre}-22-gratis-betalvagg-fran-provraden`)
    const vagg = await page.evaluate(() => document.querySelector('[data-startark]')?.textContent ?? '')
    if (!/samma format som Matrigma, cirka 35 uppgifter på 40 minuter/.test(vagg)) resultat.fel.push(`${pre}: betalväggen saknar formatet`)
    if (!/dagar till provet/.test(vagg)) resultat.fel.push(`${pre}: betalväggen saknar datumet`)
    await page.goto(`${BAS}/dashboard/tester/ovningsprov/verbal`, { waitUntil: 'networkidle2', timeout: 120000 })
    await page.waitForSelector('[data-startark="verbal"]', { timeout: 30000 })
    await vy(page, `${pre}-23-gratis-startark-last`)
  } catch (e) {
    resultat.fel.push(`${pre} gratis: avbrott ${String(e?.message ?? e)}`)
    await page.screenshot({ path: path.join(UT, `${pre}-gratis-avbrott.png`) }).catch(() => {})
  }
  if (logg.konsol.length) resultat.fel.push(`${pre} gratis: konsolfel ${JSON.stringify(logg.konsol)}`)
  if (logg.http.length) resultat.fel.push(`${pre} gratis: http ${JSON.stringify(logg.http)}`)
  await page.close()
}

async function morkt(browser) {
  const pre = 'm360-morkt'
  const k = await skapaKonto(`${pre}-premium`, { premium: true })
  const { page, logg } = await nySida(browser, { form: 'm360', system: 'dark', email: k.email })
  try {
    await page.goto(`${BAS}/dashboard/tester/alla`, { waitUntil: 'networkidle2', timeout: 120000 })
    await page.waitForSelector('[data-testkort="logik"]', { timeout: 45000 })
    await vy(page, `${pre}-30-alla-tester`, { kopparKravs: false })
    await scrollaTill(page, '[data-testkort="numerisk"]')
    await vy(page, `${pre}-31-alla-tester-numeriskt`, { kopparKravs: false })
    await page.goto(`${BAS}/dashboard/tester/ovningsprov/numerisk`, { waitUntil: 'networkidle2', timeout: 120000 })
    await page.waitForSelector('[data-startark="numerisk"]', { timeout: 30000 })
    await vy(page, `${pre}-32-startark-numeriskt`)
    await tryck(page, await valjare(page, '[data-starta-ovningsprov]'), 'm360')
    await page.waitForSelector('[data-ovningsprov="numerisk"] [data-fragetext]', { timeout: 45000 })
    await tryck(page, await valjare(page, '[data-alternativ]'), 'm360')
    await vanta(500)
    await vy(page, `${pre}-33-ovningsprov-numeriskt`)
  } catch (e) {
    resultat.fel.push(`${pre}: avbrott ${String(e?.message ?? e)}`)
    await page.screenshot({ path: path.join(UT, `${pre}-avbrott.png`) }).catch(() => {})
  }
  if (logg.konsol.length) resultat.fel.push(`${pre}: konsolfel ${JSON.stringify(logg.konsol)}`)
  if (logg.http.length) resultat.fel.push(`${pre}: http ${JSON.stringify(logg.http)}`)
  await page.close()
}

async function main() {
  if (process.argv.includes('--radera')) return radera()
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  try {
    for (const form of FORM_LISTA) {
      await premium(browser, form)
      await gratis(browser, form)
    }
    if (process.argv.includes('--stickprov-morkt')) await morkt(browser)
  } catch (e) {
    resultat.fel.push('avbrott: ' + String(e?.message ?? e))
  } finally {
    await browser.close()
  }
  resultat.mockadeTidpunkter = mockade
  fs.writeFileSync(path.join(UT, 'resultat.json'), JSON.stringify(resultat, null, 2))
  console.log(resultat.fel.length ? 'FEL:\n' + resultat.fel.join('\n') : 'inga fel')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
