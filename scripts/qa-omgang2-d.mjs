// scripts/qa-omgang2-d.mjs
// Klicktest i riktig Chrome av beställning omgång 2, Opus D (2026-10-12):
//   Premium med figurer, text och siffror i planen: Nivåkollen, textpasset
//   och sifferpasset dag 1 och dag 2 (dagsringen och dagarna i rad),
//   riktat textpass på kvantor, matrisnivån oförändrad, provet med
//   underlagsversion 3 och en gammal session utan underlagsversion.
//   Gratis: raden låst och 403 med betalväggen. Stickprov i mörkt läge.
//
//   node scripts/qa-omgang2-d.mjs --port 5214 [--former m360,desktop] [--stickprov-morkt]
//   node scripts/qa-omgang2-d.mjs --radera
//
// Kontona qa-d-<ts>@jobbcoach-qa.test raderas med id; varje tabell med
// user_id räknas före delete. Dag 2 simuleras genom att flytta tidsstämplarna
// på kontots egna passrader ett dygn bakåt (bara rader med id ur testet).
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
const UT = path.resolve('docs/qa/omgang2/klicktest')
const KONTOFIL = path.join(process.env.QA_SCRATCH ?? os.tmpdir(), 'qa-omgang2-d-konton.json')
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
const ADRESS = /^qa-d-\d+@jobbcoach-qa\.test$/

const lasKonton = () => (fs.existsSync(KONTOFIL) ? JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) : {})
const sparaKonton = (k) => fs.writeFileSync(KONTOFIL, JSON.stringify(k, null, 2))
const dagSthlm = (forskjut = 0) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date(Date.now() + forskjut * 86400000))

async function skapaKonto(nyckel, { premium = false } = {}) {
  const alla = lasKonton()
  const ts = Date.now()
  const email = `qa-d-${ts}@jobbcoach-qa.test`
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: `QaD!${ts}`,
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
    const { error: gErr } = await sb.from('premium_grants').insert({ user_id: k.userId, days: 7, source: 'qa-omgang2-d', scope: 'allt', premium_until_after: om7 })
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

/* ------------------------------ Omgång 2, D ------------------------------ */

async function plan(userId, testtyper) {
  const { error } = await sb.from('test_planer').upsert({ user_id: userId, testtyper })
  if (error) throw new Error('plan: ' + error.message)
}

/** Ett klassiskt grundresultat (38 av 40, i går) så att textpasset står på avancerad. */
async function klassisktResultat(userId) {
  const igar = new Date(Date.now() - 86400000).toISOString()
  const { data, error } = await sb
    .from('logic_test_v4_sessions')
    .insert({ user_id: userId, test_type: 'verbal-resonemang', answers: [], meta: { antal: 40, underlag_version: 3 }, score: 38, time_spent: 900, created_at: igar, started_at: igar, completed_at: igar })
    .select('id')
    .single()
  if (error) throw new Error('klassiskt: ' + error.message)
  return data.id
}

async function nivapunkter(userId) {
  const { data } = await sb.from('test_nivapunkter').select('dag, typ, niva').eq('user_id', userId).eq('test_kind', 'matris').order('dag')
  return data ?? []
}

async function vnRader(userId) {
  const { data } = await sb
    .from('logic_test_v4_sessions')
    .select('id, test_type, meta, created_at, completed_at, score')
    .eq('user_id', userId)
    .in('test_type', ['verbal-pass', 'verbal-riktat', 'numerisk-pass', 'numerisk-riktat'])
    .order('created_at')
  return data ?? []
}

/** Dag 2: kontots egna passrader och Nivåkollen (med id) flyttas ett dygn bakåt. */
async function flyttaEttDygn(userId) {
  const { data } = await sb
    .from('logic_test_v4_sessions')
    .select('id, created_at, started_at, completed_at, meta, test_type')
    .eq('user_id', userId)
    .in('test_type', ['verbal-pass', 'numerisk-pass', 'matrislogik-matning'])
  const bak = (t) => (t ? new Date(new Date(t).getTime() - 86400000).toISOString() : t)
  const dag = (t) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date(t))
  for (const r of data ?? []) {
    const meta = r.meta && typeof r.meta === 'object' && r.meta.dag ? { ...r.meta, dag: dag(bak(r.created_at)) } : r.meta
    const { error } = await sb.from('logic_test_v4_sessions').update({ created_at: bak(r.created_at), started_at: bak(r.started_at), completed_at: bak(r.completed_at), meta }).eq('id', r.id).eq('user_id', userId)
    if (error) throw new Error('flytta: ' + error.message)
  }
  const { data: pk } = await sb.from('test_nivapunkter').select('dag, typ').eq('user_id', userId)
  for (const p of pk ?? []) {
    const ny = new Date(new Date(`${p.dag}T12:00:00Z`).getTime() - 86400000).toISOString().slice(0, 10)
    const { error } = await sb.from('test_nivapunkter').update({ dag: ny }).eq('user_id', userId).eq('dag', p.dag).eq('typ', p.typ)
    if (error) resultat.noter.push('nivåpunkten gick inte att flytta: ' + error.message)
  }
}

const rubrikNu = (page) => page.evaluate(() => document.querySelector('[data-pass-shell] header p span')?.textContent ?? '')

/** Ett pass genom: fyra svar, skärmdump på fråga 1, efter första svaret och på resultatet. */
async function gorPass(page, form, pre, namn, { felPa = [] } = {}) {
  await page.waitForSelector('[data-vn-uppgift]', { timeout: 45000 })
  await vanta(600)
  const titlar = [await rubrikNu(page)]
  await vy(page, `${pre}-${namn}-fraga-1`, { kopparKravs: false })
  for (let i = 0; i < 4; i++) {
    await page.waitForSelector('[data-vn-uppgift] button[role=radio]:not([disabled])', { timeout: 30000 })
    const knappar = await page.$$('[data-vn-uppgift] button[role=radio]:not([disabled])')
    await tryck(page, knappar[felPa.includes(i) ? knappar.length - 1 : 0], form)
    await page.waitForSelector('[data-vn-forklaring]', { timeout: 30000 })
    titlar.push(await rubrikNu(page))
    if (i === 0) await vy(page, `${pre}-${namn}-forklaring`, { kopparKravs: false })
    await tryck(page, i === 3 ? 'Visa resultatet' : 'Nästa', form)
  }
  await page.waitForSelector('[data-vn-resultat]', { timeout: 45000 })
  await vanta(800)
  await vy(page, `${pre}-${namn}-resultat`, { kopparKravs: false })
  const h1 = await page.evaluate(() => document.querySelector('[data-vn-resultat] h1')?.textContent ?? '')
  if (!/^\d av 4 rätt\.$/.test(h1)) resultat.fel.push(`${pre} ${namn}: resultatets rubrik "${h1}"`)
  if (new Set(titlar).size !== 1) resultat.fel.push(`${pre} ${namn}: rubriken byttes under passet ${JSON.stringify(titlar)}`)
  if (!(await page.$('[data-vn-tempo] [role=img]'))) resultat.fel.push(`${pre} ${namn}: tempot mot budgetlinjen saknas`)
  return { titel: titlar[0], h1 }
}

async function premiumD(browser, form) {
  const pre = `${form}-ljust`
  const k = await skapaKonto(`${pre}-premium`, { premium: true })
  await plan(k.userId, ['matris', 'verbal', 'numerisk'])
  await klassisktResultat(k.userId)
  const { page, logg } = await nySida(browser, { form, system: 'light', email: k.email })
  try {
    await page.goto(`${BAS}/dashboard/tester`, { waitUntil: 'networkidle2', timeout: 120000 })
    await vy(page, `${pre}-01-hem-fore`, { kopparKravs: false })
    // Nivåkollen ger matrisnivån som passen inte får röra.
    await gorNivakollen(page, form)
    const niva1 = await nivapunkter(k.userId)

    // Dag 1: textpasset från hemvyns rad, sedan sifferpasset.
    await page.goto(`${BAS}/dashboard/tester`, { waitUntil: 'networkidle2', timeout: 120000 })
    await scrollaTill(page, 'a[href*="typ=textpass"]')
    await vy(page, `${pre}-02-hem-raderna`, { kopparKravs: false })
    await tryck(page, await valjare(page, 'a[href*="typ=textpass"]'), form)
    const t1 = await gorPass(page, form, pre, '03-textpass-dag1', { felPa: [3] })
    if (t1.titel !== 'Textpass') resultat.fel.push(`${pre}: textpassets rubrik "${t1.titel}"`)
    const expert = await page.evaluate(() => document.body.innerText.includes('Expertnivån: gör nivåtestet.'))
    if (!expert) resultat.fel.push(`${pre}: raden om expertnivån saknas (passet borde stå på avancerad)`)
    await tryck(page, 'Gå igenom passet', form)
    await page.waitForSelector('[data-vn-uppgift]', { timeout: 15000 })
    await vy(page, `${pre}-04-textpass-genomgang`, { kopparKravs: false })

    await page.goto(`${BAS}/dashboard/tester/pass?typ=sifferpass`, { waitUntil: 'networkidle2', timeout: 120000 })
    await page.waitForSelector('[data-vn-uppgift]', { timeout: 45000 })
    const tabell = await page.evaluate(() => {
      const t = document.querySelector('[data-vn-underlag] table')
      const ruta = t?.parentElement
      return t ? { finns: true, egenRam: !!ruta && getComputedStyle(ruta).overflowX === 'auto', sidled: document.documentElement.scrollWidth > innerWidth + 1 } : { finns: false }
    })
    resultat.noter.push(`${pre} sifferpass dag 1: ${JSON.stringify(tabell)}`)
    if (tabell.finns && !tabell.egenRam) resultat.fel.push(`${pre}: tabellen rullar inte i egen ram`)
    await gorPass(page, form, pre, '05-sifferpass-dag1', { felPa: [1] })

    await page.goto(`${BAS}/dashboard/tester`, { waitUntil: 'networkidle2', timeout: 120000 })
    await vy(page, `${pre}-06-hem-dag1-klart`, { kopparKravs: false })

    // Dag 2.
    await flyttaEttDygn(k.userId)
    await page.goto(`${BAS}/dashboard/tester/pass?typ=textpass`, { waitUntil: 'networkidle2', timeout: 120000 })
    await gorPass(page, form, pre, '07-textpass-dag2')
    await page.goto(`${BAS}/dashboard/tester/pass?typ=sifferpass`, { waitUntil: 'networkidle2', timeout: 120000 })
    await gorPass(page, form, pre, '08-sifferpass-dag2')
    await page.goto(`${BAS}/dashboard/tester`, { waitUntil: 'networkidle2', timeout: 120000 })
    await vy(page, `${pre}-09-hem-dag2`, { kopparKravs: false })
    const text = await page.evaluate(() => document.body.innerText)
    if (!/Två dagar i rad/i.test(text)) resultat.fel.push(`${pre}: "Två dagar i rad" saknas på hemvyn dag 2`)
    const ring = await page.evaluate(() => [...document.querySelectorAll('svg.dagsring')].map((s) => s.getAttribute('aria-label')))
    resultat.noter.push(`${pre} dagsringen dag 2: ${JSON.stringify(ring)}`)
    const pass = await vnRader(k.userId)
    const underlag = pass.map((r) => r.meta?.underlag_id)
    if (new Set(underlag).size !== underlag.length) resultat.fel.push(`${pre}: samma underlag två gånger ${JSON.stringify(underlag)}`)
    resultat.noter.push(`${pre} passen: ${JSON.stringify(pass.map((r) => [r.test_type, r.meta?.niva, r.meta?.underlag_id, r.score]))}`)

    // Riktat textpass på kvantor.
    await page.goto(`${BAS}/dashboard/tester/pass?typ=textpass&family=kvantor`, { waitUntil: 'networkidle2', timeout: 120000 })
    const r = await gorPass(page, form, pre, '10-riktat-kvantor')
    if (r.titel !== 'Alla, inga och ibland') resultat.fel.push(`${pre}: riktade passets rubrik "${r.titel}"`)

    const niva2 = await nivapunkter(k.userId)
    resultat.noter.push(`${pre} matrisnivån före ${JSON.stringify(niva1)} efter (flyttad ett dygn) ${JSON.stringify(niva2)}`)
    if (niva1.map((p) => p.niva).join() !== niva2.map((p) => p.niva).join()) resultat.fel.push(`${pre}: matrisnivån ändrades av passen`)

    // Provet med underlagsversion 3.
    const prov = await page.evaluate(async () => {
      const res = await fetch('/api/verbalTestProv/session', { method: 'POST' })
      return res.ok ? (await res.json()).session?.id ?? null : `fel ${res.status}`
    })
    const { data: provRad } = await sb.from('logic_test_v4_sessions').select('meta').eq('id', prov).maybeSingle()
    if (provRad?.meta?.underlag_version !== 3) resultat.fel.push(`${pre}: provet fick inte underlagsversion 3 (${JSON.stringify(provRad?.meta)})`)
    await page.goto(`${BAS}/dashboard/tester/verbal-resonemang-prov/test/${prov}`, { waitUntil: 'networkidle2', timeout: 120000 })
    await vanta(2500)
    await vy(page, `${pre}-11-provet-version-3`, { kopparKravs: false })

    // En gammal session utan underlagsversion: de frysta texterna, utan tankstreck i titeln.
    const { data: gammal } = await sb.from('logic_test_v4_sessions').insert({ user_id: k.userId, test_type: 'verbal-resonemang', answers: [] }).select('id').single()
    await page.goto(`${BAS}/dashboard/tester/verbal-resonemang/test/${gammal.id}`, { waitUntil: 'networkidle2', timeout: 120000 })
    await vanta(2500)
    await vy(page, `${pre}-12-gammal-session`, { kopparKravs: false })
    const rubrikGammal = await page.evaluate(() => document.querySelector('main h2')?.textContent ?? '')
    resultat.noter.push(`${pre} gammal session, första titeln: ${rubrikGammal}`)
  } catch (e) {
    resultat.fel.push(`${pre}: avbrott ${String(e?.message ?? e)}`)
    await page.screenshot({ path: path.join(UT, `${pre}-avbrott.png`) }).catch(() => {})
  }
  if (logg.konsol.length) resultat.fel.push(`${pre}: konsolfel ${JSON.stringify(logg.konsol)}`)
  if (logg.http.length) resultat.fel.push(`${pre}: http ${JSON.stringify(logg.http)}`)
  await page.close()
}

async function gratisD(browser, form) {
  const pre = `${form}-ljust`
  const k = await skapaKonto(`${pre}-gratis`)
  await plan(k.userId, ['verbal', 'numerisk'])
  const { page, logg } = await nySida(browser, { form, system: 'light', email: k.email })
  try {
    await page.goto(`${BAS}/dashboard/tester`, { waitUntil: 'networkidle2', timeout: 120000 })
    await vanta(800)
    await vy(page, `${pre}-20-gratis-hem`, { kopparKravs: false })
    const last = await page.evaluate(() => document.body.innerText.includes('Ingår i Premium'))
    if (!last) resultat.fel.push(`${pre}: gratisraden är inte låst`)
    const status = await page.evaluate(async () => (await fetch('/api/traning/vnpass/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'verbal' }) })).status)
    if (status !== 403) resultat.fel.push(`${pre}: gratis fick ${status}, väntat 403`)
    await page.goto(`${BAS}/dashboard/tester/pass?typ=textpass`, { waitUntil: 'networkidle2', timeout: 120000 })
    await vanta(1500)
    await vy(page, `${pre}-21-gratis-betalvagg`, { kopparKravs: false })
    logg.http = logg.http.filter((h) => !/403 POST \/api\/traning\/vnpass\/session/.test(h))
    logg.konsol = logg.konsol.filter((x) => !/403/.test(x))
  } catch (e) {
    resultat.fel.push(`${pre}: avbrott ${String(e?.message ?? e)}`)
  }
  if (logg.konsol.length) resultat.fel.push(`${pre}: konsolfel ${JSON.stringify(logg.konsol)}`)
  if (logg.http.length) resultat.fel.push(`${pre}: http ${JSON.stringify(logg.http)}`)
  await page.close()
}

async function morktD(browser) {
  const pre = 'm360-morkt'
  const k = await skapaKonto(`${pre}-premium`, { premium: true })
  await plan(k.userId, ['verbal', 'numerisk'])
  const { page, logg } = await nySida(browser, { form: 'm360', system: 'dark', email: k.email })
  try {
    await page.goto(`${BAS}/dashboard/tester/pass?typ=sifferpass`, { waitUntil: 'networkidle2', timeout: 120000 })
    await gorPass(page, 'm360', pre, '30-sifferpass')
    await page.goto(`${BAS}/dashboard/tester`, { waitUntil: 'networkidle2', timeout: 120000 })
    await scrollaTill(page, 'a[href*="typ=textpass"]')
    await vy(page, `${pre}-31-hem`, { kopparKravs: false })
  } catch (e) {
    resultat.fel.push(`${pre}: avbrott ${String(e?.message ?? e)}`)
  }
  if (logg.konsol.length) resultat.fel.push(`${pre}: konsolfel ${JSON.stringify(logg.konsol)}`)
  if (logg.http.length) resultat.fel.push(`${pre}: http ${JSON.stringify(logg.http)}`)
  await page.close()
}

async function main() {
  if (process.argv.includes('--radera')) return radera()
  fs.mkdirSync(UT, { recursive: true })
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  try {
    for (const form of FORM_LISTA) {
      await premiumD(browser, form)
      await gratisD(browser, form)
    }
    if (process.argv.includes('--stickprov-morkt')) await morktD(browser)
  } catch (e) {
    resultat.fel.push('avbrott: ' + String(e?.message ?? e))
  } finally {
    await browser.close()
  }
  fs.writeFileSync(path.join(UT, 'resultat.json'), JSON.stringify(resultat, null, 2))
  console.log(resultat.fel.length ? 'FEL:\n' + resultat.fel.join('\n') : 'inga fel')
  console.log('NOTER:\n' + resultat.noter.join('\n'))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

async function scrollaTill(page, sel) {
  const el = await valjare(page, sel)
  await el.evaluate((e) => e.scrollIntoView({ block: 'start' }))
  await vanta(400)
  return el
}
