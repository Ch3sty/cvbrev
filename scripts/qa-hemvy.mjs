// scripts/qa-hemvy.mjs
// Klicktest i riktig Chrome av hemvyn efter beslut-hemvy och copy-plan
// (2026-10-11): ny användare gör planen (steg 1 till 3) och mätningen,
// hemvyn, Lägesraden till Alla tester och tillbaka, Träna fritt-länken, ett
// konto med tre mätpunkter (kurvan och formmarkören) och ett konto utan plan
// (ingången och dess länk till Alla tester).
//
//   node scripts/qa-hemvy.mjs --port 5392 [--former m360,desktop] [--system light,dark] [--stickprov-morkt]
//   node scripts/qa-hemvy.mjs --port 5392 --forhand        # förhandsvisningens ramar, utan flöde
//   node scripts/qa-hemvy.mjs --radera
//
// Kontroller per vy: ingen horisontell scroll, kopparknappen inom första
// skärmen, inget "generalrepetition", inga tal med mittpunkt, inget "N,0",
// konsolfel och 4xx/5xx. Kontona qa-hemvy-<ts>@jobbcoach-qa.test raderas med
// id; varje tabell med user_id räknas före delete (feedback_testdata_stadning).

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
const PORT = arg('port', '5392')
const BAS = `http://localhost:${PORT}`
const UT = process.env.QA_UT ?? path.resolve('docs/qa/efter-lyftet/hemvy')
const KONTOFIL = path.join(process.env.QA_SCRATCH ?? os.tmpdir(), 'qa-hemvy-konton.json')
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
const SYSTEM_LISTA = arg('system', 'light').split(',')
const BRUS = [/googletagmanager/i, /posthog/i, /GTM\]/, /favicon/i, /net::ERR_ABORTED/i, /Failed to load resource.*(gtm|posthog|google)/i, /Download the React DevTools/i, /\[Fast Refresh\]/i, /\[HMR\]/i, /Invalid source map/i]
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const ADRESS = /^qa-hemvy-\d+@jobbcoach-qa\.test$/

const lasKonton = () => (fs.existsSync(KONTOFIL) ? JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) : {})
const sparaKonton = (k) => fs.writeFileSync(KONTOFIL, JSON.stringify(k, null, 2))

const dagSthlm = (forskjut = 0) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date(Date.now() + forskjut * 86400000))

async function skapaKonto(nyckel) {
  const alla = lasKonton()
  const ts = Date.now()
  const email = `qa-hemvy-${ts}@jobbcoach-qa.test`
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: `QaHemvy!${ts}`,
    email_confirm: true,
    user_metadata: { full_name: 'Anna Andersson', password_set: true },
  })
  if (error) throw new Error(error.message)
  const k = { email, userId: data.user.id }
  alla[`${nyckel}-${ts}`] = k
  sparaKonton(alla)
  await vanta(600)
  const { error: pErr } = await sb
    .from('profiles')
    .upsert({ id: k.userId, email, full_name: 'Anna Andersson', email_verified_at: new Date().toISOString(), onboarding_track: 'tester' })
  if (pErr) throw new Error('profil: ' + pErr.message)
  console.log('skapade', nyckel, email, k.userId)
  return k
}

/** Tre mätpunkter: mätning i förrgår, pass i går och i dag, plan med Alva och datum om 14 dagar. */
async function sattTrePunkter(k) {
  const { error: pErr } = await sb.from('test_planer').upsert({ user_id: k.userId, testtyper: ['matris'], leverantor: 'alva', provdatum: dagSthlm(14), sikte: 5 })
  if (pErr) throw new Error('plan: ' + pErr.message)
  const punkter = [
    { dag: dagSthlm(-2), typ: 'matning', niva: 3 },
    { dag: dagSthlm(-1), typ: 'pass', niva: 3.4 },
    { dag: dagSthlm(0), typ: 'pass', niva: 3.6 },
  ].map((p) => ({ ...p, user_id: k.userId, test_kind: 'matris' }))
  const { error } = await sb.from('test_nivapunkter').insert(punkter)
  if (error) throw new Error('punkter: ' + error.message)
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
  const logg = { konsol: [], http: [] }
  page.on('console', (m) => {
    if (m.type() === 'error') {
      const t = m.text()
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

const resultat = { datum: new Date().toISOString(), bas: BAS, vyer: [], fel: [] }

/** Skärmdump och kontrollerna för en vy. */
async function vy(page, namn, { kopparKravs = true } = {}) {
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})
  await vanta(400)
  const fil = path.join(UT, `${namn}.png`)
  await page.screenshot({ path: fil, fullPage: false })
  const k = await page.evaluate(() => {
    const text = document.body.innerText
    const koppar = [...document.querySelectorAll('a, button')].filter((e) => {
      const r = e.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && /\bbg-koppar\b/.test(e.className) && getComputedStyle(e).visibility !== 'hidden'
    })
    const forsta = koppar[0]
    let kopparSynlig = null
    if (forsta) {
      const r = forsta.getBoundingClientRect()
      const mitt = document.elementFromPoint(r.left + r.width / 2, Math.min(r.bottom - 4, innerHeight - 1))
      kopparSynlig = r.top >= 0 && r.bottom <= innerHeight && (mitt === forsta || forsta.contains(mitt))
    }
    return {
      url: location.pathname + location.search,
      horisontell: document.documentElement.scrollWidth > innerWidth + 1,
      kopparKnapp: forsta ? forsta.textContent.trim().slice(0, 60) : null,
      kopparSynlig,
      general: /generalrepetition/i.test(text),
      mittpunktTal: (text.match(/\d\s*·|·\s*\d/g) ?? []).slice(0, 5),
      kommaNoll: (text.match(/(^|[^\d,])\d+,0(?![\d])/gm) ?? []).slice(0, 5),
      lagesrad: document.querySelector('[data-lagesrad]')?.getAttribute('data-lagesrad') ?? null,
    }
  })
  const rad = { namn, fil: path.relative(process.cwd(), fil).split(path.sep).join('/'), ...k }
  resultat.vyer.push(rad)
  const fel = []
  if (k.horisontell) fel.push('horisontell scroll')
  if (kopparKravs && k.kopparKnapp && !k.kopparSynlig) fel.push(`kopparknappen "${k.kopparKnapp}" kräver scroll`)
  if (k.general) fel.push('"generalrepetition" i vyn')
  if (k.mittpunktTal.length) fel.push(`tal med mittpunkt: ${k.mittpunktTal.join(' | ')}`)
  if (k.kommaNoll.length) fel.push(`"N,0": ${k.kommaNoll.join(' | ')}`)
  for (const f of fel) resultat.fel.push(`${namn}: ${f}`)
  console.log(namn, k.url, fel.length ? 'FEL: ' + fel.join('; ') : 'ok')
  return rad
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
  await el.evaluate((e) => e.scrollIntoView({ block: 'nearest' }))
  await vanta(150)
  const box = await el.boundingBox()
  if (!box) throw new Error('ingen ruta att trycka på')
  if (form === 'desktop') await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  else await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
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

async function valjare(page, sel) {
  const h = await page.evaluateHandle(
    (s) => [...document.querySelectorAll(s)].find((a) => {
      const r = a.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && getComputedStyle(a).visibility !== 'hidden'
    }) ?? null,
    sel
  )
  const el = h.asElement()
  if (!el) throw new Error(`hittade inte ${sel}`)
  return el
}

async function tillAdress(page, url, ms = 30000) {
  await page.waitForFunction((u) => location.pathname === u && !document.querySelector('[aria-busy="true"]'), { timeout: ms, polling: 50 }, url)
  await vanta(700)
}

async function gorMatningen(page, form) {
  const lank = await page.$('main a[href*="typ=matning"]')
  if (lank) await tryck(page, lank, form)
  else await page.goto(`${BAS}/dashboard/tester/pass?typ=matning`, { waitUntil: 'networkidle2' })
  await page.waitForSelector('[data-pass-shell]', { timeout: 30000 })
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
  await page.waitForSelector('[data-resultat]', { timeout: 30000 })
  await vanta(1600)
}

async function kor(browser, form, system) {
  const tema = system === 'dark' ? 'morkt' : 'ljust'
  const pre = `${form}-${tema}`
  const konsol = []
  const http = []

  // A: ny användare, planen steg 1 till 3, mätningen, hemvyn, lägesraden, Träna fritt.
  const a = await skapaKonto(`${pre}-ny`)
  {
    const { page, logg } = await nySida(browser, { form, system, email: a.email })
    await page.goto(`${BAS}/dashboard/tester`, { waitUntil: 'networkidle2', timeout: 90000 })
    await page.waitForSelector('[data-steg="1"]', { timeout: 30000 })
    await vy(page, `${pre}-01-plan-steg1`)
    await tryck(page, await valjare(page, 'button[role=checkbox]'), form)
    await tryck(page, 'Fortsätt', form)
    await page.waitForSelector('[data-steg="2"]', { timeout: 10000 })
    await tryck(page, await (async () => {
      const h = await page.evaluateHandle(() => [...document.querySelectorAll('button[role=radio]')].find((b) => b.textContent.trim() === 'Alva Logic') ?? null)
      return h.asElement()
    })(), form)
    await vy(page, `${pre}-02-plan-steg2`)
    await tryck(page, 'Fortsätt', form)
    await page.waitForSelector('[data-steg="3"]', { timeout: 10000 })
    await tryck(page, 'Om två veckor', form)
    await page.waitForSelector('[data-plantext]', { timeout: 10000 })
    const plantext = await page.$eval('[data-plantext]', (e) => e.textContent.trim())
    await vy(page, `${pre}-03-plan-steg3`)
    if (!/övningsprov/.test(plantext)) resultat.fel.push(`${pre}: planrutan saknar övningsprov: ${plantext}`)
    await tryck(page, 'Visa min plan', form)
    await tillAdress(page, '/dashboard/tester')
    await vy(page, `${pre}-04-hemvy-fore-matningen`)
    await gorMatningen(page, form)
    await vy(page, `${pre}-05-matningens-resultat`)
    await tryck(page, 'Tillbaka till Rekryteringstester', form)
    await tillAdress(page, '/dashboard/tester')
    const hem = await vy(page, `${pre}-06-hemvyn-efter-matningen`)
    if (hem.lagesrad !== 'plan') resultat.fel.push(`${pre}: lägesraden på hemvyn är ${hem.lagesrad}`)
    // Lägesraden till Alla tester och tillbaka.
    await tryck(page, await valjare(page, '[data-lagesrad] a[href="/dashboard/tester/alla"]'), form)
    await tillAdress(page, '/dashboard/tester/alla')
    const alla = await vy(page, `${pre}-07-alla-tester-via-lagesraden`)
    if (alla.lagesrad !== 'alla') resultat.fel.push(`${pre}: lägesraden på Alla tester är ${alla.lagesrad}`)
    await tryck(page, await valjare(page, '[data-lagesrad] a[href="/dashboard/tester"]'), form)
    await tillAdress(page, '/dashboard/tester')
    await vy(page, `${pre}-08-hemvyn-via-lagesraden`)
    // Träna fritt: sektionslänken Alla tester på golvet.
    const sekt = await page.evaluateHandle(() =>
      [...document.querySelectorAll('main a[href="/dashboard/tester/alla"]')].find((a) => !a.closest('[data-lagesrad]') && a.getBoundingClientRect().width > 0) ?? null
    )
    if (!sekt.asElement()) resultat.fel.push(`${pre}: Träna fritt saknar länken Alla tester`)
    else {
      await sekt.asElement().evaluate((e) => e.scrollIntoView({ block: 'center' }))
      await vanta(300)
      await vy(page, `${pre}-09-trana-fritt`, { kopparKravs: false })
      await tryck(page, sekt.asElement(), form)
      await tillAdress(page, '/dashboard/tester/alla')
      await vy(page, `${pre}-10-alla-tester-via-trana-fritt`)
    }
    // Din utveckling bär samma lägesrad.
    await page.goto(`${BAS}/dashboard/tester/alla?flik=utveckling`, { waitUntil: 'networkidle2', timeout: 90000 })
    await page.waitForSelector('[data-utv-lage]', { timeout: 30000 })
    const utv = await vy(page, `${pre}-11-din-utveckling`)
    if (utv.lagesrad !== 'alla') resultat.fel.push(`${pre}: lägesraden på Din utveckling är ${utv.lagesrad}`)
    konsol.push(...logg.konsol)
    http.push(...logg.http)
    await page.close()
  }

  // B: tre mätpunkter, kurvan och formmarkören.
  const b = await skapaKonto(`${pre}-tre`)
  await sattTrePunkter(b)
  {
    const { page, logg } = await nySida(browser, { form, system, email: b.email })
    await page.goto(`${BAS}/dashboard/tester`, { waitUntil: 'networkidle2', timeout: 90000 })
    await page.waitForSelector('[data-tillstand]', { timeout: 30000 })
    const r = await vy(page, `${pre}-12-hemvy-tre-matpunkter`)
    const k = await page.evaluate(() => ({
      kurva: !!document.querySelector('main svg.kurva[aria-label^="Nivå per dag"]'),
      form: document.querySelector('[data-form]')?.textContent.trim() ?? null,
      dagsrad: document.querySelector('main dl dd')?.textContent.trim() ?? null,
    }))
    r.tre = k
    if (!k.kurva) resultat.fel.push(`${pre}: tre punkter men ingen kurva`)
    if (!k.form) resultat.fel.push(`${pre}: tre punkter men ingen formmarkör`)
    const kurvan = await page.$('[data-form]')
    if (kurvan) {
      await kurvan.evaluate((e) => e.scrollIntoView({ block: 'center' }))
      await vanta(300)
      await vy(page, `${pre}-13-kurvan-och-formen`, { kopparKravs: false })
    }
    konsol.push(...logg.konsol)
    http.push(...logg.http)
    await page.close()
  }

  // C: konto utan plan, ingången och dess länk till Alla tester.
  const c = await skapaKonto(`${pre}-utan-plan`)
  {
    const { page, logg } = await nySida(browser, { form, system, email: c.email })
    await page.goto(`${BAS}/dashboard/tester`, { waitUntil: 'networkidle2', timeout: 90000 })
    await page.waitForSelector('[data-ingang-alla]', { timeout: 30000 })
    await vy(page, `${pre}-14-ingangen-utan-plan`)
    await tryck(page, await valjare(page, '[data-ingang-alla]'), form)
    await tillAdress(page, '/dashboard/tester/alla')
    await vy(page, `${pre}-15-alla-tester-fran-ingangen`)
    // Planläget för den utan plan är ingången.
    await tryck(page, await valjare(page, '[data-lagesrad] a[href="/dashboard/tester"]'), form)
    await page.waitForSelector('[data-ingang-alla]', { timeout: 30000 })
    await vy(page, `${pre}-16-min-plan-utan-plan`)
    konsol.push(...logg.konsol)
    http.push(...logg.http)
    await page.close()
  }
  if (konsol.length) resultat.fel.push(`${pre}: konsolfel ${JSON.stringify(konsol)}`)
  if (http.length) resultat.fel.push(`${pre}: http ${JSON.stringify(http)}`)
}

/** Stickprov i mörkt läge: hemvyn med tre punkter på 360. */
async function morkt(browser) {
  const k = await skapaKonto('m360-morkt-tre')
  await sattTrePunkter(k)
  const { page, logg } = await nySida(browser, { form: 'm360', system: 'dark', email: k.email })
  await page.goto(`${BAS}/dashboard/tester`, { waitUntil: 'networkidle2', timeout: 90000 })
  await page.waitForSelector('[data-tillstand]', { timeout: 30000 })
  await vy(page, 'm360-morkt-12-hemvy-tre-matpunkter')
  await tryck(page, await valjare(page, '[data-lagesrad] a[href="/dashboard/tester/alla"]'), 'm360')
  await tillAdress(page, '/dashboard/tester/alla')
  await vy(page, 'm360-morkt-07-alla-tester-via-lagesraden')
  if (logg.konsol.length) resultat.fel.push(`m360-morkt: konsolfel ${JSON.stringify(logg.konsol)}`)
  if (logg.http.length) resultat.fel.push(`m360-morkt: http ${JSON.stringify(logg.http)}`)
  await page.close()
}

/** Förhandsvisningens ramar (bara i utveckling): snabb bild av det ändrade. */
async function forhand(browser) {
  const k = await skapaKonto('forhand')
  for (const form of FORM_LISTA) {
    const { page } = await nySida(browser, { form, system: 'light', email: k.email })
    for (const t of ['1b', '1f', '1c', 'T1', 'W3']) {
      await page.goto(`${BAS}/dashboard/tester/forhandsvisning?tillstand=${t}`, { waitUntil: 'networkidle2', timeout: 90000 })
      await vy(page, `forhand-${form}-${t}`, { kopparKravs: false })
      if (form === 'm360') {
        await page.evaluate(() => window.scrollTo(0, 700))
        await vanta(300)
        await page.screenshot({ path: path.join(UT, `forhand-${form}-${t}-golv.png`) })
      } else {
        await page.screenshot({ path: path.join(UT, `forhand-${form}-${t}-hel.png`), fullPage: true })
      }
    }
    await page.close()
  }
}

async function main() {
  if (process.argv.includes('--radera')) return radera()
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  try {
    if (process.argv.includes('--forhand')) await forhand(browser)
    else {
      for (const form of FORM_LISTA) for (const system of SYSTEM_LISTA) await kor(browser, form, system)
      if (process.argv.includes('--stickprov-morkt')) await morkt(browser)
    }
  } catch (e) {
    resultat.fel.push('avbrott: ' + String(e?.message ?? e))
  } finally {
    await browser.close()
  }
  fs.writeFileSync(path.join(UT, process.argv.includes('--forhand') ? 'forhand.json' : 'resultat.json'), JSON.stringify(resultat, null, 2))
  console.log(resultat.fel.length ? 'FEL:\n' + resultat.fel.join('\n') : 'inga fel')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
