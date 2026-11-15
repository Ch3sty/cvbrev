// scripts/qa-saljytor.mjs
// Klicktest av säljytorna (beslut 2026-11-15, docs/design/saljytor-2026-11-15)
// i riktig Chrome, Pixel 7 och 1280 x 800. Skärmdumpar och resultat i
// QA_UT (utanför git, feedback_arbetskopior_och_qa_bilder).
//
//   node scripts/qa-saljytor.mjs konton            skapar gratis, forre, prov
//   QA_UT=<dir> node scripts/qa-saljytor.mjs kor <lage> --port 3481
//     lage  bw | cm | ingen   (servern startad med KAMPANJ_NU för bw och cm)
//   node scripts/qa-saljytor.mjs radera            raderar bara de egna kontona med id
//
// Konton: qa-saljytor-<ts>-<namn>@jobbcoach-qa.test. forre har
// subscription_status 'canceled' (före detta kund, ska aldrig se
// kampanjpriset). prov finns bara för att IP-adresserna i provkörningarna
// ska ha ett prov hämtat till ett testkonto, så att spara_prov_utfall
// undantar dem. Provens token sparas och raderas per token; IP-gränsen per
// exakt ip_hash. Ingen radering efter tidsfönster.

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer-core'

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((r) => r.includes('=') && !r.trim().startsWith('#'))
    .map((r) => { const i = r.indexOf('='); return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')] })
)
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i >= 0 ? process.argv[i + 1] : f }
const UT = process.env.QA_UT ?? path.resolve('qa-saljytor-ut')
fs.mkdirSync(UT, { recursive: true })
const KONTOFIL = path.join(UT, 'konton.json')
const RESULTAT = path.join(UT, 'resultat.jsonl')
const BAS = `http://localhost:${arg('port', '3481')}`
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const lasK = () => (fs.existsSync(KONTOFIL) ? JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) : {})
const sparaK = (k) => fs.writeFileSync(KONTOFIL, JSON.stringify(k, null, 2))
const ADRESS = /^qa-saljytor-\d+-(gratis|forre|prov)@jobbcoach-qa\.test$/
const dagSthlm = (d = 0) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date(Date.now() + d * 86400000))

/* ------------------------------------------------------------ konton */

async function konton() {
  const k = lasK()
  k.ts ??= Date.now()
  for (const namn of ['gratis', 'forre', 'prov']) {
    if (k[namn]) continue
    const email = `qa-saljytor-${k.ts}-${namn}@jobbcoach-qa.test`
    const { data, error } = await sb.auth.admin.createUser({ email, password: `QaSalj!${k.ts}`, email_confirm: true, user_metadata: { full_name: 'Anna Andersson', password_set: true } })
    if (error) throw new Error(error.message)
    k[namn] = { email, userId: data.user.id }
    sparaK(k)
    await vanta(700)
    const { error: pErr } = await sb.from('profiles').upsert({
      id: data.user.id, email, full_name: 'Anna Andersson', email_verified_at: new Date().toISOString(),
      onboarding_track: 'tester', onboarding_intent: 'tester', onboarding_track_asked_at: new Date().toISOString(),
      ...(namn === 'forre' ? { subscription_status: 'canceled' } : {}),
    })
    if (pErr) throw new Error('profil: ' + pErr.message)
    if (namn !== 'prov') {
      const { error: tErr } = await sb.from('test_planer').upsert({ user_id: data.user.id, testtyper: ['matris'], leverantor: 'alva', provdatum: dagSthlm(14), sikte: 5 })
      if (tErr) throw new Error('plan: ' + tErr.message)
    }
    console.log('skapad', namn, email, data.user.id)
  }
}

async function tabellerMedUserId() {
  const r = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, { headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, Accept: 'application/openapi+json' } })
  const spec = await r.json()
  return Object.entries(spec.definitions ?? {}).filter(([, d]) => d.properties && 'user_id' in d.properties).map(([n]) => n)
}

async function radera() {
  const k = lasK()
  const rapport = { tid: new Date().toISOString(), prov: [], konton: [] }
  // Proven: per token, IP-gränsen per exakt ip_hash.
  const hashar = new Set()
  for (const token of k.tokens ?? []) {
    const { data } = await sb.from('anon_test_sessions').select('ip_hash').eq('token', token).maybeSingle()
    if (data?.ip_hash) hashar.add(data.ip_hash)
    const { count } = await sb.from('anon_test_sessions').select('*', { count: 'exact', head: true }).eq('token', token)
    if (count) await sb.from('anon_test_sessions').delete().eq('token', token)
    rapport.prov.push({ token, rader: count ?? 0 })
  }
  for (const h of [...hashar, ...(k.ipHashar ?? [])]) {
    const { count } = await sb.from('public_rate_limits').select('*', { count: 'exact', head: true }).eq('ip_hash', h).eq('scope', 'anon_test')
    if (count) await sb.from('public_rate_limits').delete().eq('ip_hash', h).eq('scope', 'anon_test')
    rapport.prov.push({ ip_hash: h.slice(0, 10), public_rate_limits: count ?? 0 })
  }
  const tabeller = await tabellerMedUserId()
  for (const namn of ['gratis', 'forre', 'prov']) {
    const a = k[namn]
    if (!a) continue
    if (!ADRESS.test(a.email)) throw new Error('inte ett eget QA-konto: ' + a.email)
    const rader = {}
    for (const t of tabeller) {
      const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true }).eq('user_id', a.userId)
      if (error || !count) continue
      const { error: dErr } = await sb.from(t).delete().eq('user_id', a.userId)
      rader[t] = dErr ? (/view/i.test(dErr.message) ? `vy (${count})` : `FEL ${dErr.message} (${count})`) : count
    }
    // Prov hämtade till kontot står kvar med claimed_by; radera per konto-id.
    const { count: ac } = await sb.from('anon_test_sessions').select('*', { count: 'exact', head: true }).eq('claimed_by', a.userId)
    if (ac) { await sb.from('anon_test_sessions').delete().eq('claimed_by', a.userId); rader.anon_test_sessions_claimed = ac }
    const { count: pc } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('id', a.userId)
    if (pc) await sb.from('profiles').delete().eq('id', a.userId)
    const { error } = await sb.auth.admin.deleteUser(a.userId)
    rapport.konton.push({ namn, id: a.userId, rader, profiles: pc ?? 0, auth: error ? error.message : 'raderad' })
    console.log('raderade', namn, a.userId, JSON.stringify(rader), error ? error.message : 'ok')
  }
  fs.writeFileSync(path.join(UT, 'radering.json'), JSON.stringify(rapport, null, 2))
  fs.renameSync(KONTOFIL, KONTOFIL + '.raderad')
}

/* ------------------------------------------------------------ webbläsaren */

const projektRef = env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]
const COOKIE = `sb-${projektRef}-auth-token`
async function payloadFor(email) {
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email })
  const { data: s, error } = await createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
    .auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token })
  if (error || !s?.session) throw new Error('session: ' + error?.message)
  return 'base64-' + Buffer.from(JSON.stringify({ access_token: s.session.access_token, refresh_token: s.session.refresh_token, expires_at: s.session.expires_at, expires_in: s.session.expires_in, token_type: 'bearer', user: s.session.user })).toString('base64')
}

const MOBIL_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36'
const FORMER = {
  pixel7: { viewport: { width: 412, height: 915, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true }, ua: MOBIL_UA },
  desktop: { viewport: { width: 1280, height: 800, deviceScaleFactor: 1 } },
}
const BRUS = [/googletagmanager/i, /posthog/i, /\/ingest\//, /favicon/i, /ERR_ABORTED/i, /Download the React DevTools/i, /Invalid source map/i, /ERR_BLOCKED_BY_CLIENT/i]

const fel = []
function logg(lage, form, steg, ok, data = {}) {
  fs.appendFileSync(RESULTAT, JSON.stringify({ tid: new Date().toISOString(), lage, form, steg, ok, ...data }) + '\n')
  console.log(`${ok === null ? 'INFO' : ok ? 'OK  ' : 'FEL '} [${lage}/${form}] ${steg} ${JSON.stringify(data).slice(0, 400)}`)
  if (ok === false) fel.push(`${lage}/${form}: ${steg}`)
}

async function nySida(browser, form, { konto, kampanjNu, morkt, ip } = {}) {
  const ctx = await browser.createBrowserContext()
  const p = await ctx.newPage()
  p.setDefaultNavigationTimeout(180000)
  const f = FORMER[form]
  if (f.ua) await p.setUserAgent(f.ua)
  await p.setViewport(f.viewport)
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: morkt ? 'dark' : 'light' }])
  if (ip) await p.setExtraHTTPHeaders({ 'x-forwarded-for': ip })
  await p.setCookie({ name: 'cvBrevCookieConsent', value: 'false', url: BAS, path: '/' })
  if (konto) {
    const pl = await payloadFor(konto.email)
    const CH = 3200
    if (pl.length <= CH) await p.setCookie({ name: COOKIE, value: pl, url: BAS, path: '/' })
    else for (let i = 0, n = 0; i < pl.length; i += CH, n++) await p.setCookie({ name: `${COOKIE}.${n}`, value: pl.slice(i, i + CH), url: BAS, path: '/' })
  }
  await p.evaluateOnNewDocument((nu, morkt) => {
    try {
      if (nu) localStorage.setItem('kampanj_nu', nu); else localStorage.removeItem('kampanj_nu')
      localStorage.setItem('password_prompt_dismissed', 'true')
      localStorage.setItem('jc_email_banner_dismissed_at', String(Date.now()))
      if (morkt) localStorage.removeItem('tema')
    } catch {}
    window.__cls = 0
    try {
      new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value })).observe({ type: 'layout-shift', buffered: true })
    } catch {}
  }, kampanjNu ?? null, !!morkt)
  const logg = { konsol: [], http: [] }
  p.on('console', (m) => { if (m.type() === 'error' && !BRUS.some((r) => r.test(m.text()))) logg.konsol.push(m.text().slice(0, 300)) })
  p.on('pageerror', (e) => logg.konsol.push('pageerror: ' + String(e.message).slice(0, 300)))
  p.on('response', (r) => { const u = r.url(); if (r.status() >= 400 && u.startsWith(BAS) && !BRUS.some((x) => x.test(u))) logg.http.push(`${r.status()} ${r.request().method()} ${u.replace(BAS, '').slice(0, 140)}`) })
  await p.setRequestInterception(true)
  p.on('request', (r) => (/posthog\.com|\/ingest\/|googletagmanager/.test(r.url()) ? r.respond({ status: 204, body: '' }) : r.continue()))
  // ERR_ABORTED är avbrutna förhämtningar vid navigering, inget fel.
  p.on('requestfailed', (r) => { if (!BRUS.some((x) => x.test(r.url())) && !/ERR_ABORTED/.test(r.failure()?.errorText ?? '')) logg.konsol.push(`requestfailed ${r.url().replace(BAS, '').slice(0, 120)} ${r.failure()?.errorText}`) })
  return { p, ctx, logg }
}

async function ga(p, u, waitUntil = 'networkidle2') {
  await p.goto(BAS + u, { waitUntil, timeout: 180000 }).catch(async (e) => { if (!/timeout/i.test(e.message)) throw e })
  await p.addStyleTag({ content: 'nextjs-portal{display:none!important} html,body{scroll-behavior:auto!important}' }).catch(() => {})
  await vanta(900)
}

/**
 * Kontrollerna per steg: skärmdump, primär handling i viewporten, konsolfel,
 * 4xx/5xx, CLS och horisontell scroll. `primar` är en selektor; elementet
 * måste ligga helt inom fönstret (efter `scrollTill`, om satt).
 */
let nr = 0
async function steg(sida, lage, form, namn, { primar = null, scrollTill = null, hel = false, forvantadeHttp = [] } = {}) {
  const { p, logg: l } = sida
  if (scrollTill) {
    await p.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: 'center' }), scrollTill)
    await vanta(500)
  }
  nr += 1
  const fil = path.join(UT, `${lage}-${form}-${String(nr).padStart(3, '0')}-${namn}.png`)
  await p.screenshot({ path: fil, fullPage: hel }).catch(() => {})
  const k = await p.evaluate((primar) => {
    const ut = { horisontell: document.documentElement.scrollWidth > innerWidth + 1, scrollWidth: document.documentElement.scrollWidth, cls: Math.round((window.__cls ?? 0) * 10000) / 10000 }
    if (primar) {
      const el = [...document.querySelectorAll(primar)].find((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' })
      if (!el) ut.primar = 'saknas'
      else {
        const r = el.getBoundingClientRect()
        const mitt = document.elementFromPoint(r.left + r.width / 2, Math.min(r.top + r.height / 2, innerHeight - 1))
        ut.primar = { text: el.innerText.trim().replace(/\s+/g, ' ').slice(0, 60), inom: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, overst: !!mitt && (mitt === el || el.contains(mitt)), botten: Math.round(r.bottom) }
      }
    }
    return ut
  }, primar)
  const http = l.http.filter((h) => !forvantadeHttp.some((re) => re.test(h)))
  const problem = []
  if (k.horisontell) problem.push(`horisontell scroll (${k.scrollWidth})`)
  if (k.cls > 0) problem.push(`CLS ${k.cls}`)
  if (primar && (k.primar === 'saknas' || !k.primar.inom || !k.primar.overst)) problem.push(`primär handling ej synlig: ${JSON.stringify(k.primar)}`)
  if (l.konsol.length) problem.push(`konsolfel: ${l.konsol.join(' | ')}`)
  if (http.length) problem.push(`http: ${http.join(' | ')}`)
  logg(lage, form, `steg ${namn}`, problem.length === 0, { fil: path.basename(fil), primar: k.primar?.text ?? k.primar, problem })
  l.konsol.length = 0
  l.http.length = 0
  return k
}

/** Pris enligt läget. */
const PRIS = {
  bw: (t) => /99 kr första månaden/.test(t) && !/49 kr första månaden/.test(t),
  cm: (t) => /49 kr första månaden/.test(t) && !/99 kr första månaden/.test(t),
  ingen: (t) => /149 kr/.test(t) && !/första månaden/.test(t),
  ordinarie: (t) => /149 kr/.test(t) && !/första månaden/.test(t),
}
const NU = { bw: '2026-11-23T10:00:00+01:00', cm: '2026-11-30T10:00:00+01:00', ingen: null }

/** Nio-raden: nio glyfer, alla inom sin cell och sin behållare, ingen klippt. */
async function nioRaden(p, behallare) {
  return p.evaluate((sel) => {
    const omr = sel ? document.querySelector(sel) : document
    const lista = [...(omr?.querySelectorAll('.tb-glyfer') ?? [])].find((e) => e.getBoundingClientRect().width > 0)
    if (!lista) return { finns: false }
    const lr = lista.getBoundingClientRect()
    const box = (sel && omr.getBoundingClientRect()) || null
    const li = [...lista.children]
    const svg = li.map((x) => x.querySelector('svg')?.getBoundingClientRect())
    const klippt = svg.filter((r, i) => !r || r.width < 8 || r.height < 8 || r.left < lr.left - 0.5 || r.right > lr.right + 0.5 || (box && (r.left < box.left - 0.5 || r.right > box.right + 0.5)) || r.right > innerWidth)
    // Förfäder med overflow hidden som klipper glyferna.
    let klipp = null
    for (let e = lista.parentElement; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e)
      if (/hidden|clip/.test(cs.overflowX)) {
        const er = e.getBoundingClientRect()
        if (svg.some((r) => r && (r.left < er.left - 0.5 || r.right > er.right + 0.5))) { klipp = e.className.slice(0, 60); break }
      }
    }
    return {
      finns: true,
      antal: li.length,
      markerade: li.filter((x) => x.hasAttribute('data-markerad')).length,
      klippta: klippt.length,
      klipp,
      utanfor: box ? Math.round(lr.right - box.right) : null,
      bredd: Math.round(lr.width),
      glyf: svg[0] ? Math.round(svg[0].width) : null,
    }
  }, behallare)
}

async function textI(p, sel) {
  return p.evaluate((s) => [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.innerText.replace(/[ \t]+/g, ' ').trim()).join('\n---\n'), sel)
}

/* ------------------------------------------------------------ provet */

let ipNr = 0
async function nyIp(k) {
  // Ny dokumentationsadress (TEST-NET-3), seedad med ett prov hämtat till
  // kontot prov så att spara_prov_utfall undantar IP:n.
  ipNr += 1
  // Aldrig samma IP två gånger (IP-gränsen är tre prov per fönster).
  const anvanda = new Set(lasK().ipAnvanda ?? [])
  let ip
  do ip = `198.51.100.${Math.floor(Math.random() * 250) + 2}`
  while (anvanda.has(ip))
  { const kk = lasK(); kk.ipAnvanda = [...anvanda, ip]; sparaK(kk) }
  const browser = globalThis.__browser
  const s = await nySida(browser, 'desktop', { konto: k.prov, ip })
  await ga(s.p, '/dashboard')
  const r = await s.p.evaluate(async (ip) => {
    const a = await fetch('/api/public/test-session', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip }, body: JSON.stringify({ typ: 'talserie' }) })
    const j = await a.json()
    return { status: a.status, token: j.token ?? null }
  }, ip)
  if (r.token) {
    sparaToken(r.token)
    await sb.from('anon_test_sessions').update({ answers: [] }).eq('token', r.token)
    const c = await s.p.evaluate(async (token) => (await fetch('/api/public/test-session/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })).status, r.token)
    const { data } = await sb.from('anon_test_sessions').select('claimed_by, ip_hash').eq('token', r.token).maybeSingle()
    const kk = lasK(); kk.ipHashar = [...new Set([...(kk.ipHashar ?? []), data?.ip_hash].filter(Boolean))]; sparaK(kk)
    console.log('IP seedad', ip, 'claim', c, 'claimed_by prov', data?.claimed_by === k.prov.userId)
    if (data?.claimed_by !== k.prov.userId) throw new Error('IP:n blev inte undantagen, avbryter före provet')
  } else throw new Error('kunde inte seeda IP ' + JSON.stringify(r))
  await s.ctx.close()
  return { ip, kvar: 2 }
}
function sparaToken(t) { const k = lasK(); k.tokens = [...new Set([...(k.tokens ?? []), t])]; sparaK(k) }

let ipNu = null
async function ipForProv(k) {
  if (!ipNu || ipNu.kvar <= 0) ipNu = await nyIp(k)
  ipNu.kvar -= 1
  return ipNu.ip
}

/** Provet på /verktyg/rekryteringstester/prova, panelen och /register?prova=. */
async function provet(browser, lage, form, k, { forre = false } = {}) {
  const ip = await ipForProv(k)
  const s = await nySida(browser, form, { kampanjNu: NU[lage], ip })
  if (forre) await s.p.setCookie({ name: 'jc_kampanj_ej', value: '1', url: BAS, path: '/' })
  const pre = forre ? 'forre-' : ''
  await ga(s.p, '/verktyg/rekryteringstester/prova')
  await steg(s, lage, form, `${pre}prova-start`, { primar: '[data-cta="prova-start"]' })
  await s.p.evaluate(() => document.querySelector('[data-cta="prova-start"]')?.click())
  await vanta(2500)
  for (let i = 0; i < 40; i++) {
    if (await s.p.$('a[data-cta="prova-gate"]')) break
    await s.p.evaluate((i) => { const b = [...document.querySelectorAll('button[aria-label^="Svarsalternativ"]')].filter((e) => !e.disabled); if (b.length) b[i % b.length].click() }, i)
    await vanta(1400)
  }
  await s.p.waitForSelector('a[data-cta="prova-gate"]', { timeout: 30000 }).catch(() => {})
  await vanta(1200)
  const href = await s.p.evaluate(() => document.querySelector('a[data-cta="prova-gate"]')?.getAttribute('href') ?? null)
  const token = href ? decodeURIComponent(href.split('=').pop()) : null
  if (token) sparaToken(token)
  // Svarssteget räknas som input; CLS nollställs inför panelen.
  await s.p.evaluate(() => { window.__cls = 0 })
  await steg(s, lage, form, `${pre}prova-panel`, { primar: 'a[data-cta="prova-gate"]', scrollTill: 'a[data-cta="prova-gate"]' })
  const panel = await s.p.evaluate(() => document.body.innerText)
  const prisrad = (panel.match(/Jobbcoach Premium[^\n]*|Premium,[^\n]*/g) ?? []).join(' | ')
  logg(lage, form, `${pre}kontopanelen efter provet: premiumraden`, forre ? PRIS.ordinarie(prisrad) : PRIS[lage](prisrad), { prisrad: prisrad.slice(0, 300) })
  const nio = await nioRaden(s.p, null)
  logg(lage, form, `${pre}kontopanelen efter provet: nio-raden`, nio.finns ? nio.antal === 9 && nio.klippta === 0 && !nio.klipp : null, nio)
  if (!href) { await s.ctx.close(); return }
  await ga(s.p, href)
  await vanta(800)
  await registerKontroll(s, lage, form, `${pre}register-efter-prov`, forre)
  await s.ctx.close()
}

async function registerKontroll(s, lage, form, namn, forre) {
  await steg(s, lage, form, namn, { primar: 'button[type="submit"].pub-knapp, .pub-konto-knapp' })
  // Premiumraden står bara från 900 px (.pub-konto-dator); på mobil finns den inte.
  const premium = await textI(s.p, '.pub-konto-premium')
  logg(lage, form, `${namn}: premiumraden`, form === 'pixel7' && !premium ? null : forre ? PRIS.ordinarie(premium) : PRIS[lage](premium), { premium: premium.slice(0, 300) })
  const nio = await nioRaden(s.p, '.pub-konto-panel')
  logg(lage, form, `${namn}: glyfraden inom panelen`, nio.finns && nio.antal === 9 && nio.klippta === 0 && !nio.klipp && (nio.utanfor ?? 0) <= 0, nio)
  const centrerad = await s.p.evaluate(() => {
    const pnl = [...document.querySelectorAll('.pub-konto-panel')].find((e) => e.getBoundingClientRect().width > 0)
    if (!pnl) return null
    const r = pnl.getBoundingClientRect()
    // Panelen och formuläret som grupp, mot fönstret utan rullningslist.
    const delar = [pnl, document.querySelector('.pub-konto-form')].filter(Boolean).map((e) => e.getBoundingClientRect()).filter((x) => x.width > 0)
    const l = Math.min(...delar.map((x) => x.left)), h = Math.max(...delar.map((x) => x.right))
    // Sidans bredd utan rullningslistens fåra (scrollbar-gutter), som headern.
    const cw = document.querySelector('header')?.getBoundingClientRect().width || document.documentElement.clientWidth
    return { vanster: Math.round(l), hoger: Math.round(cw - h), panelV: Math.round(r.left), panelH: Math.round(cw - r.right), bredd: Math.round(r.width) }
  })
  const ok = centrerad && Math.abs(centrerad.vanster - centrerad.hoger) <= 2
  logg(lage, form, `${namn}: panelen centrerad`, centrerad ? ok : null, centrerad ?? {})
  await s.p.evaluate(() => document.querySelector('.pub-konto-panel')?.scrollIntoView({ block: 'center' }))
  await vanta(300)
  nr += 1
  await s.p.screenshot({ path: path.join(UT, `${lage}-${form}-${String(nr).padStart(3, '0')}-${namn}-panel.png`) })
}

/* ------------------------------------------------------------ inloggat */

async function vaggKontroll(s, lage, form, namn, forre) {
  const vagg = await s.p.evaluate(() => {
    const ul = [...document.querySelectorAll('.tb-glyfer')].find((e) => e.getBoundingClientRect().width > 0)
    let sek = ul
    while (sek && !(sek.tagName === 'SECTION' || sek.getAttribute?.('role') === 'dialog')) sek = sek.parentElement
    sek?.setAttribute('data-qa-vagg', '1')
    return sek ? sek.innerText.replace(/[ \t]+/g, ' ') : null
  })
  if (!vagg) { logg(lage, form, `${namn}: väggen hittades`, false); return }
  await s.p.evaluate(() => document.querySelector('[data-qa-vagg]')?.scrollIntoView({ block: 'center' }))
  await vanta(400)
  await steg(s, lage, form, namn, { primar: '[data-qa-vagg] .knapp-primar' })
  logg(lage, form, `${namn}: priset`, forre ? PRIS.ordinarie(vagg) : PRIS[lage](vagg), { utdrag: vagg.slice(Math.max(0, vagg.search(/\d+ kr/) - 40), vagg.search(/\d+ kr/) + 140) })
  const tvaRader = /kr[^\n]*\.\s*\n+\s*Säg upp när du vill\./.test(vagg)
  const rader = await s.p.evaluate(() => {
    const p = [...document.querySelectorAll('[data-qa-vagg] p')].find((e) => /Säg upp när du vill/.test(e.innerText))
    if (!p) return null
    const lh = parseFloat(getComputedStyle(p).lineHeight) || 20
    return { rader: Math.round(p.getBoundingClientRect().height / lh), text: p.innerText }
  })
  // Två rader i texten (brytning före "Säg upp"); kampanjmeningen får brytas av bredden.
  logg(lage, form, `${namn}: prisraden på två rader`, tvaRader && rader?.text.split('\n').length === 2, { rader })
  const nio = await nioRaden(s.p, '[data-qa-vagg]')
  logg(lage, form, `${namn}: nio-raden, låst typ markerad, ingen klippt`, nio.finns && nio.antal === 9 && nio.markerade >= 1 && nio.klippta === 0 && !nio.klipp, nio)
}

async function inloggat(browser, lage, form, k, namn, { morkt = false, forsta = false } = {}) {
  const forre = namn === 'forre'
  const s = await nySida(browser, form, { konto: k[namn], morkt })
  const pre = `${namn}${morkt ? '-morkt' : ''}`
  if (morkt) {
    await ga(s.p, '/dashboard/tester/matrislogik-avancerad')
    await vaggKontroll(s, lage, form, `${pre}-testniva`, forre)
    await s.ctx.close()
    return
  }
  // Hemvyn med F18-raden körs i kor() med kontot utan plan.
  if (false) {
    await ga(s.p, '/dashboard/tester')
    const hem = await s.p.evaluate(() => document.querySelector('main')?.innerText ?? '')
    await steg(s, lage, form, `${pre}-hemvy`, { primar: 'main .knapp-primar' })
    logg(lage, form, `${pre}: hemvyn med F18-raden`, /Börja med Nivåkollen, åtta minuter som visar var du står/.test(hem), { utdrag: (hem.match(/Börja med Nivåkollen[^\n]*/) ?? [''])[0] })
  }
  // Raden i TesterHub (Alla tester).
  await ga(s.p, '/dashboard/tester/alla')
  const hub = await s.p.evaluate(() => (document.querySelector('main')?.innerText ?? '').split('\n').filter((r) => /^Gratis: grundnivån/.test(r.trim())).join(' '))
  const hubRad = await s.p.evaluate(() => { const e = [...document.querySelectorAll('main p, main span')].find((x) => /^Gratis: grundnivån/.test(x.innerText.trim())); e?.scrollIntoView({ block: 'center' }); return !!e })
  await vanta(300)
  await steg(s, lage, form, `${pre}-testerhub`)
  logg(lage, form, `${pre}: raden i TesterHub`, hubRad ? (forre ? PRIS.ordinarie(hub) : PRIS[lage](hub)) : false, { rad: hub.slice(0, 260) })
  // Testnivåväggen.
  await ga(s.p, '/dashboard/tester/matrislogik-avancerad')
  await vaggKontroll(s, lage, form, `${pre}-testniva`, forre)
  // Testtaket: dagens grundsession gjord (seedad rad, raderas med kontot).
  if (!k[namn].taket) {
    const nu = new Date().toISOString()
    const { error } = await sb.from('logic_test_v4_sessions').insert({ user_id: k[namn].userId, test_type: 'matrislogik', started_at: nu, completed_at: nu, score: 5, time_spent: 300, answers: [], meta: {} })
    if (error) logg(lage, form, `${pre}: seed av grundsessionen`, false, { fel: error.message })
    const kk = lasK(); kk[namn].taket = true; sparaK(kk); k[namn].taket = true
  }
  await ga(s.p, '/dashboard/tester/matrislogik-grund')
  await s.p.waitForSelector('.tb-glyfer', { timeout: 15000 }).catch(() => {})
  await vaggKontroll(s, lage, form, `${pre}-test-tak`, forre)
  // ImorgonKort: riktig Nivåkoll första gången (gratis, Pixel 7), sedan förhandsvisningen M1.
  if (forsta && namn === 'gratis' && form === 'pixel7') {
    await ga(s.p, '/dashboard/tester/pass?typ=matning')
    await s.p.waitForSelector('[data-pass-shell]', { timeout: 30000 }).catch(() => {})
    for (let i = 0; i < 40; i++) {
      if (await s.p.$('[data-resultat]')) break
      const b = await s.p.$$('[role=radiogroup] button[role=radio]:not([disabled])')
      if (!b.length) { await vanta(300); continue }
      await b[i % b.length].evaluate((e) => e.click())
      await vanta(600)
    }
    await s.p.waitForSelector('[data-imorgon]', { timeout: 30000 }).catch(() => {})
    await vanta(1500)
    await s.p.evaluate(() => { window.__cls = 0 })
    await imorgon(s, lage, form, `${pre}-imorgon-riktig`, forre)
  }
  await ga(s.p, '/dashboard/tester/forhandsvisning-pass?ram=M1')
  await s.p.waitForSelector('[data-imorgon]', { timeout: 30000 }).catch(() => {})
  await vanta(1200)
  await imorgon(s, lage, form, `${pre}-imorgon-M1`, forre)
  // Kampanjcookien för publika sidor: före detta kund ska ha jc_kampanj_ej.
  if (forre && lage !== 'ingen') {
    await ga(s.p, '/dashboard')
    const kakor = await s.p.cookies(BAS)
    logg(lage, form, 'forre: cookien jc_kampanj_ej satt', kakor.some((c) => c.name === 'jc_kampanj_ej' && c.value === '1'), {})
  }
  await s.ctx.close()
}

async function imorgon(s, lage, form, namn, forre) {
  const t = await textI(s.p, '[data-imorgon]')
  if (!t) { logg(lage, form, `${namn}: ImorgonKort finns`, false); return }
  await steg(s, lage, form, namn, { primar: '[data-imorgon] .knapp-primar', scrollTill: '[data-imorgon] .knapp-primar' })
  logg(lage, form, `${namn}: priset`, forre ? PRIS.ordinarie(t) : PRIS[lage](t), { utdrag: t.slice(0, 400) })
  logg(lage, form, `${namn}: Premium täcker`, !/Månaden täcker/.test(t), {})
}

/* ------------------------------------------------------------ publikt */

async function publikt(browser, lage, form) {
  const s = await nySida(browser, form, { kampanjNu: NU[lage] })
  await ga(s.p, '/register')
  await registerKontroll(s, lage, form, 'register-bar', false)
  if (lage !== 'ingen') { await s.ctx.close(); return }

  // 5. /priser, startsidan, /verktyg/rekryteringstester
  await ga(s.p, '/priser')
  await steg(s, lage, form, 'priser-topp', { primar: '[data-primar], .pub-knapp' })
  const pr = await nioRaden(s.p, null)
  logg(lage, form, '/priser: rutnätsplattan med nio', pr.finns && pr.antal === 9 && pr.klippta === 0, pr)
  await s.p.evaluate(() => document.querySelector('.tb-rutnat')?.scrollIntoView({ block: 'center' }))
  await vanta(400)
  await steg(s, lage, form, 'priser-rutnat')
  await s.p.evaluate(() => [...document.querySelectorAll('h2, h3, p')].find((e) => /^Tester$/.test(e.innerText.trim()))?.scrollIntoView({ block: 'start' }))
  await vanta(400)
  await steg(s, lage, form, 'priser-tester-stationen')
  await s.p.evaluate(() => document.querySelector('table')?.scrollIntoView({ block: 'start' }))
  await vanta(400)
  await steg(s, lage, form, 'priser-tabellen')
  const tab = await s.p.evaluate(() => { const t = document.querySelector('table'); if (!t) return null; const r = t.getBoundingClientRect(); let e = t.parentElement; return { bredd: Math.round(r.width), text: [...t.querySelectorAll('tr')].find((x) => /Grundnivån/.test(x.innerText))?.innerText.replace(/\s+/g, ' ').slice(0, 200) } })
  logg(lage, form, '/priser: tabellens rad 1', tab ? /Grundnivån/.test(tab.text) : false, tab ?? {})

  await ga(s.p, '/')
  await steg(s, lage, form, 'start-topp', { primar: '.pub-knapp' })
  for (const [rubrik, namn] of [[/^Rekryteringstester$/, 'start-station-tester'], [/^Och resten av jobbsöket/, 'start-station-brev']]) {
    const fanns = await s.p.evaluate((src) => { const re = new RegExp(src); const e = [...document.querySelectorAll('.pub-station h2, .pub-station h3, h2, h3')].find((x) => re.test(x.innerText.trim())); e?.scrollIntoView({ block: 'start' }); return e?.innerText.trim() ?? null }, rubrik.source)
    await vanta(400)
    await steg(s, lage, form, namn)
    logg(lage, form, `${namn}: rubriken hittad`, fanns ? true : null, { rubrik: fanns })
  }
  const brevRad = await s.p.evaluate(() => /Första personliga brevet gratis, sedan ett var sjunde dag/.test(document.body.innerText))
  logg(lage, form, 'startsidan: stationen Brev säger var sjunde dag', brevRad)
  const faq = await s.p.evaluate(() => { const d = [...document.querySelectorAll('details')].find((x) => /Gratisnivån kräver/.test(x.textContent ?? '')); if (!d) return null; d.open = true; d.scrollIntoView({ block: 'start' }); return d.innerText.replace(/\s+/g, ' ') })
  await vanta(400)
  await steg(s, lage, form, 'start-faq')
  logg(lage, form, 'startsidan: FAQ om gratisnivån ur gratis-copy', faq ? /grundnivån i alla åtta testtyperna/.test(faq) && /tre|3 matchade jobb/.test(faq) : false, { faq: faq?.slice(0, 300) })

  await ga(s.p, '/verktyg/rekryteringstester')
  await steg(s, lage, form, 'rekryteringstester-hjalte', { primar: '.pub-hjalte .pub-knapp, .pub-knapp' })
  const hj = await s.p.evaluate(() => {
    const k = [...document.querySelectorAll('.pub-knapp')].find((e) => e.getBoundingClientRect().width > 0)
    if (!k) return null
    const r = k.getBoundingClientRect()
    // Närmaste synliga element under knappen inom hjälten.
    const under = [...document.querySelectorAll('main *')].map((e) => e.getBoundingClientRect()).filter((x) => x.top > r.bottom + 1 && x.height > 4 && x.width > 40).sort((a, b) => a.top - b.top)[0]
    const tal = [...document.querySelectorAll('main')].map((m) => m.innerText.split('\n').slice(0, 30).join(' | '))[0]
    return { knapp: k.innerText.trim(), luftUnder: under ? Math.round(under.top - r.bottom) : null, tal: tal.slice(0, 400) }
  })
  logg(lage, form, '/verktyg/rekryteringstester: luft under hjälteknappen', hj ? (hj.luftUnder ?? 99) >= 12 : false, hj ?? {})
  const gratisKort = await s.p.evaluate(() => /Med kontot gör du grundnivån i alla åtta testtyperna gratis/.test(document.body.innerText))
  logg(lage, form, '/verktyg/rekryteringstester: "Gratis att prova" ur gratis-copy (1a)', gratisKort)

  // 4. Artiklarna
  const artiklar = [
    ['matrigma-test', 'provkort'],
    ['i-prov', 'typprovkort'],
    ['deduktivt-induktivt-test', 'typprovkort'],
    ['talserier', 'typprovkort'],
    ['klassiska-intervjufragor-lista', 'intervju'],
    ['styrkor-svagheter-intervju', 'intervju'],
    ['ai-jobbmatchning', 'gratiskort'],
  ]
  for (const [slug, typ] of artiklar) {
    await ga(s.p, `/artiklar/${slug}`, 'load')
    await vanta(1500)
    await steg(s, lage, form, `artikel-${slug}-topp`)
    const kort = typ === 'gratiskort' ? '.ib-gratis-bred' : 'aside.ib-prova, .ib-prova'
    const info = await s.p.evaluate((sel) => {
      const e = [...document.querySelectorAll(sel)].find((x) => x.getBoundingClientRect().width > 0 && !x.closest('.art-sido, aside[class*="sido"]'))
      if (!e) return null
      e.setAttribute('data-qa-kort', '1')
      e.scrollIntoView({ block: 'center' })
      return { text: e.innerText.replace(/\s+/g, ' ').slice(0, 300), hojd: Math.round(e.getBoundingClientRect().height) }
    }, kort)
    await vanta(500)
    await steg(s, lage, form, `artikel-${slug}-${typ}`, { primar: '[data-qa-kort] .pub-knapp', scrollTill: '[data-qa-kort] .pub-knapp' })
    logg(lage, form, `artikel ${slug}: ${typ} finns`, !!info, info ?? {})
    if (info) {
      const nio = await nioRaden(s.p, '[data-qa-kort]')
      logg(lage, form, `artikel ${slug}: nio-raden i kortet`, nio.finns ? nio.klippta === 0 && !nio.klipp && (nio.utanfor ?? 0) <= 0 : null, nio)
    }
    if (typ === 'gratiskort' && info) {
      const ordning = await s.p.evaluate(() => {
        const e = document.querySelector('[data-qa-kort]')
        const top = (sel) => { const x = e.querySelector(sel); return x ? Math.round(x.getBoundingClientRect().top) : null }
        return { rubrik: top('.ib-rub'), bild: top('.tb-glyfer'), lista: top('.pub-bock'), knapp: top('.pub-knapp') }
      })
      const ok = ordning.rubrik < ordning.bild && ordning.bild < ordning.lista && ordning.lista < ordning.knapp
      logg(lage, form, `artikel ${slug}: GratisKort inline ordning rubrik, bild, lista, knapp`, form === 'pixel7' ? ok : null, ordning)
      if (form === 'desktop') {
        const sido = await s.p.evaluate(() => { const e = [...document.querySelectorAll('.ib-gratis')].find((x) => x.getBoundingClientRect().width > 0 && x.getAttribute('data-qa-kort') !== '1'); if (!e) return null; e.setAttribute('data-qa-sido', '1'); e.scrollIntoView({ block: 'center' }); return e.innerText.replace(/\s+/g, ' ').slice(0, 200) })
        await vanta(500)
        await steg(s, lage, form, `artikel-${slug}-gratiskort-sido`)
        logg(lage, form, `artikel ${slug}: GratisKort i sidokolumnen`, !!sido, { sido })
        if (sido) {
          const nio = await nioRaden(s.p, '[data-qa-sido]')
          logg(lage, form, `artikel ${slug}: sidokortets nio-rad`, nio.finns ? nio.klippta === 0 && !nio.klipp && (nio.utanfor ?? 0) <= 0 : null, nio)
        }
      }
      const tre = await s.p.evaluate(() => /tio matchade jobb/.test(document.body.innerText))
      logg(lage, form, `artikel ${slug}: inget "tio matchade jobb" kvar`, !tre)
    }
    if (typ === 'intervju' && form === 'pixel7') {
      await s.p.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45))
      await vanta(1200)
      const sticky = await s.p.evaluate(() => { const e = [...document.querySelectorAll('.fixed.bottom-0')].find((x) => x.getBoundingClientRect().height > 0); return e ? { text: e.innerText.replace(/\s+/g, ' ').slice(0, 120), href: e.querySelector('a')?.getAttribute('href') } : null })
      await steg(s, lage, form, `artikel-${slug}-sticky`)
      logg(lage, form, `artikel ${slug}: sticky på mobil`, !!sticky, sticky ?? {})
    }
    // 6. Solfjädern i SlutKortet.
    const sol = await s.p.evaluate(() => {
      const f = [...document.querySelectorAll('.pub-solfjader')].find((x) => x.getBoundingClientRect().height > 0)
      if (!f) return null
      f.scrollIntoView({ block: 'end' })
      const tel = [...f.querySelectorAll('.pub-telefon')].filter((x) => getComputedStyle(x).display !== 'none').map((x) => x.getBoundingClientRect())
      const sek = f.closest('section') ?? f.parentElement
      const text = [...sek.querySelectorAll('p, h2, h3, a.pub-knapp, .pub-knapp')].filter((x) => !f.contains(x)).map((x) => x.getBoundingClientRect()).filter((r) => r.height > 0)
      const textBotten = Math.max(...text.map((r) => r.bottom))
      const telTopp = Math.min(...tel.map((r) => r.top))
      const krock = text.filter((t) => tel.some((r) => t.left < r.right && t.right > r.left && t.top < r.bottom && t.bottom > r.top)).length
      return { textBotten: Math.round(textBotten), telTopp: Math.round(telTopp), overlapp: krock ? Math.round(textBotten - telTopp) : 0, krock }
    })
    if (sol) {
      await vanta(500)
      await steg(s, lage, form, `artikel-${slug}-solfjader`)
      logg(lage, form, `artikel ${slug}: solfjädern går inte upp i texten`, sol.overlapp <= 0, sol)
    }
  }
  await s.ctx.close()

  // 8. Mörkt läge: /register på 412.
  if (form === 'pixel7') {
    const m = await nySida(browser, form, { kampanjNu: NU[lage], morkt: true })
    await ga(m.p, '/register')
    await registerKontroll(m, lage, form, 'register-morkt', false)
    await m.ctx.close()
  }
}

/** Före detta kund på de publika sidorna: cookien från inloggat, sedan utloggad. */
async function forrePublikt(browser, lage, form) {
  const s = await nySida(browser, form, { kampanjNu: NU[lage] })
  await s.p.setCookie({ name: 'jc_kampanj_ej', value: '1', url: BAS, path: '/' })
  await ga(s.p, '/register')
  await registerKontroll(s, lage, form, 'forre-register', true)
  await ga(s.p, '/priser')
  const t = await s.p.evaluate(() => document.querySelector('main')?.innerText ?? '')
  logg(lage, form, 'forre: /priser utan kampanjpris', !/första månaden/.test(t), {})
  await s.ctx.close()
}

async function kor(lage) {
  const k = lasK()
  if (!k.gratis) throw new Error('kör konton först')
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] })
  globalThis.__browser = browser
  const forsta = lage === 'bw' && !k.forstaGjord
  try {
    for (const form of ['pixel7', 'desktop']) {
      try { await publikt(browser, lage, form) } catch (e) { logg(lage, form, 'publikt avbröts', false, { fel: String(e.message).slice(0, 300) }) }
      try { await provet(browser, lage, form, k) } catch (e) { logg(lage, form, 'provet avbröts', false, { fel: String(e.message).slice(0, 300) }) }
    }
    // Hemvyn före Nivåkollen för båda formerna, sedan resten.
    if (lage === 'bw') {
      // Planen utan datum: hemvyns tomma läge, där F18-raden står.
      await sb.from('test_planer').upsert({ user_id: k.prov.userId, testtyper: ['matris'], leverantor: null, provdatum: null })
      for (const form of ['pixel7', 'desktop']) {
        // Kontot utan plan: F18-raden står i det tomma läget (hem-copy tomt.rad).
        const s = await nySida(browser, form, { konto: k.prov })
        await ga(s.p, '/dashboard/tester')
        const hem = await s.p.evaluate(() => document.querySelector('main')?.innerText ?? '')
        await steg(s, lage, form, 'gratis-hemvy-F18', { primar: 'main .knapp-primar' })
        logg(lage, form, 'gratis: hemvyn med F18-raden', /Börja med Nivåkollen, åtta minuter som visar var du står/.test(hem), { utdrag: (hem.match(/Börja med Nivåkollen[^\n]*/) ?? [hem.slice(0, 200)])[0] })
        await s.ctx.close()
      }
    }
    for (const form of ['pixel7', 'desktop']) {
      for (const namn of ['gratis', 'forre']) {
        try { await inloggat(browser, lage, form, k, namn, { forsta: forsta && form === 'pixel7' && namn === 'gratis' ? true : false }) } catch (e) { logg(lage, form, `${namn} avbröts`, false, { fel: String(e.message).slice(0, 300) }) }
      }
      if (lage !== 'ingen') {
        try { await forrePublikt(browser, lage, form) } catch (e) { logg(lage, form, 'forre publikt avbröts', false, { fel: String(e.message).slice(0, 300) }) }
      }
    }
    if (lage === 'bw') { try { await provet(browser, lage, 'pixel7', k, { forre: true }) } catch (e) { logg(lage, 'pixel7', 'forre-provet avbröts', false, { fel: String(e.message).slice(0, 300) }) } }
    if (lage === 'ingen') {
      try { await inloggat(browser, lage, 'pixel7', k, 'gratis', { morkt: true }) } catch (e) { logg(lage, 'pixel7', 'mörkt avbröts', false, { fel: String(e.message).slice(0, 300) }) }
    }
    if (forsta) { const kk = lasK(); kk.forstaGjord = true; sparaK(kk) }
  } finally {
    await browser.close()
  }
  console.log(fel.length ? `\n${fel.length} FEL:\n${fel.join('\n')}` : '\nAllt OK')
}

const kommando = process.argv[2]
if (kommando === 'konton') await konton()
else if (kommando === 'radera') await radera()
else if (kommando === 'kor') await kor(process.argv[3])
else throw new Error('konton | kor <bw|cm|ingen> | radera')
