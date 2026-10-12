// scripts/qa-grafik-v3.mjs
// Klicktest i riktig Chrome av grafik v3 (docs/design/tester-v2-2026-10-11/
// grafik-v3-spec.md): Nivåkollen, dagens pass med regelpanelen, logikens
// klassiska test och genomgången, på 360 (Pixel 7) och 1280, ljust och mörkt.
//
//   node scripts/qa-grafik-v3.mjs --port 5462 [--former m360,desktop] [--teman light,dark]
//   node scripts/qa-grafik-v3.mjs --radera
//
// Per vy: skärmdump i docs/qa/grafik-v3/, och mätning i sidan av matrisen och
// alternativen: rutans och figurens storlek (figuren ska vara 80 procent av
// rutan, samma i matris och alternativ), att luckan saknar <text> och koppar,
// tre alternativ i bredd, bokstaven kvar, ingen horisontell scroll, konsolfel
// och 4xx/5xx. Kontona qa-grafik-<ts>@jobbcoach-qa.test raderas med id; varje
// tabell med user_id räknas före delete.

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
const PORT = arg('port', '5462')
const BAS = `http://localhost:${PORT}`
const UT = path.resolve('docs/qa/grafik-v3')
const KONTOFIL = path.join(process.env.QA_SCRATCH ?? os.tmpdir(), 'qa-grafik-v3-konton.json')
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
const TEMAN = arg('teman', 'light,dark').split(',')
const BRUS = [/googletagmanager/i, /posthog/i, /GTM\]/, /favicon/i, /net::ERR_ABORTED/i, /Failed to load resource.*(gtm|posthog|google)/i, /Download the React DevTools/i, /\[Fast Refresh\]/i, /\[HMR\]/i, /Invalid source map/i]
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))
const ADRESS = /^qa-grafik-\d+@jobbcoach-qa\.test$/

const lasKonton = () => (fs.existsSync(KONTOFIL) ? JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) : {})
const sparaKonton = (k) => fs.writeFileSync(KONTOFIL, JSON.stringify(k, null, 2))
const dagSthlm = (forskjut = 0) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date(Date.now() + forskjut * 86400000))

async function skapaKonto(nyckel) {
  const alla = lasKonton()
  const ts = Date.now()
  const email = `qa-grafik-${ts}@jobbcoach-qa.test`
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: `QaGrafik!${ts}`,
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
  const om7 = new Date(Date.now() + 7 * 86400000).toISOString()
  const { error: gErr } = await sb.from('premium_grants').insert({ user_id: k.userId, days: 7, source: 'qa-grafik-v3', scope: 'allt', premium_until_after: om7 })
  if (gErr) throw new Error('grant: ' + gErr.message)
  const { error: tErr } = await sb
    .from('test_planer')
    .upsert({ user_id: k.userId, testtyper: ['matris'], leverantor: 'matrigma', variant: 'klassisk', provdatum: dagSthlm(14) })
  if (tErr) throw new Error('plan: ' + tErr.message)
  console.log('skapade', nyckel, email, k.userId)
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

/** Raderar bara egna konton (adressmönstret), rad för rad via id, räknar före delete. */
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
  // Tidpunkten sparas i test_planer.pass_tid, som kanske inte är migrerad.
  await page.setRequestInterception(true)
  page.on('request', (req) => {
    if (req.url().includes('/api/traning/pass-tid') && req.method() === 'POST') {
      return req.respond({ status: 200, contentType: 'application/json', body: req.postData() ?? '{}' })
    }
    req.continue()
  })
  const logg = { konsol: [], http: [] }
  page.on('console', (m) => {
    if (m.type() === 'error') {
      const t = m.text()
      if (!BRUS.some((r) => r.test(t))) logg.konsol.push(`${t.slice(0, 300)} (${page.url().replace(BAS, '')})`)
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

/** Mäter matrisen och alternativen i sidan (grafik v3 avsnitt 1, 5 och 6). */
async function matGrafik(page) {
  return page.evaluate(() => {
    const synlig = (e) => {
      const r = e.getBoundingClientRect()
      return r.width > 0 && r.height > 0
    }
    const matris = [...document.querySelectorAll('.matrisyta [role=img], [data-matris] [role=img]')].find(synlig)
    const ut = { horisontell: document.documentElement.scrollWidth > innerWidth + 1, talstreck: document.body.innerText.includes('—') }
    if (matris) {
      const rutor = [...matris.children]
      const ruta = rutor[0].getBoundingClientRect()
      const svg = rutor[0].querySelector('svg')
      const cs = getComputedStyle(svg)
      const inre = svg.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      const lucka = rutor[rutor.length - 1]
      ut.matris = {
        bredd: Math.round(matris.getBoundingClientRect().width),
        ruta: Math.round(ruta.width * 10) / 10,
        figur: Math.round(inre * 10) / 10,
        andel: Math.round((inre / ruta.width) * 1000) / 10,
        luckaText: lucka.querySelectorAll('text').length,
        luckaKoppar: /koppar|E07A2F/i.test(lucka.innerHTML) && !lucka.querySelector('.ratt-fylld'),
        luckaFylld: !!lucka.querySelector('.ratt-fylld'),
        luckaBakgrund: getComputedStyle(lucka).backgroundColor,
      }
    }
    const grupp = [...document.querySelectorAll('[role=radiogroup]')].find((g) => synlig(g) && g.querySelectorAll("button[role=radio] svg").length === 6)
    if (grupp) {
      const knappar = [...grupp.querySelectorAll('button[role=radio]')]
      const k0 = knappar[0].getBoundingClientRect()
      const svg = knappar[0].querySelector('svg')
      const cs = getComputedStyle(svg)
      const inre = svg.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      const iForstaRaden = knappar.filter((b) => Math.abs(b.getBoundingClientRect().top - k0.top) < 2).length
      ut.alternativ = {
        antal: knappar.length,
        iBredd: iForstaRaden,
        kort: Math.round(k0.width * 10) / 10,
        figur: Math.round(inre * 10) / 10,
        andel: Math.round((inre / k0.width) * 1000) / 10,
        bokstaver: knappar.map((b) => b.querySelector('span')?.textContent?.trim() ?? '').join(''),
        bock: knappar.some((b) => b.querySelector('path[d^="M5 12.5"]')),
        aria: knappar.map((b) => b.getAttribute('aria-label')).slice(0, 2),
      }
    }
    return ut
  })
}

async function vy(page, namn, { fullPage = false } = {}) {
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})
  await vanta(450)
  const fil = path.join(UT, `${namn}.png`)
  await page.screenshot({ path: fil, fullPage })
  const m = await matGrafik(page)
  const rad = { namn, url: page.url().replace(BAS, ''), fil: path.relative(process.cwd(), fil).split(path.sep).join('/'), ...m }
  resultat.vyer.push(rad)
  const fel = []
  if (m.horisontell) fel.push('horisontell scroll')
  if (m.talstreck) fel.push('talstreck i vyn')
  if (m.matris) {
    if (Math.abs(m.matris.andel - 80) > 1.5) fel.push(`figuren är ${m.matris.andel} % av rutan i matrisen`)
    if (m.matris.luckaText) fel.push('luckan har <text>')
    if (m.matris.luckaKoppar) fel.push('luckan har koppar före svaret')
  }
  if (m.alternativ) {
    if (m.alternativ.iBredd !== 3) fel.push(`${m.alternativ.iBredd} alternativ i bredd`)
    if (Math.abs(m.alternativ.andel - 80) > 2) fel.push(`figuren är ${m.alternativ.andel} % av alternativet`)
    if (m.alternativ.bokstaver !== 'ABCDEF') fel.push(`bokstäverna ${m.alternativ.bokstaver}`)
    if (m.alternativ.bock) fel.push('bock i alternativet')
    if (m.matris && Math.abs(m.matris.figur - m.alternativ.figur) > 2) fel.push(`figuren ${m.matris.figur} px i matrisen mot ${m.alternativ.figur} px i alternativet`)
  }
  for (const f of fel) resultat.fel.push(`${namn}: ${f}`)
  console.log(namn, rad.url, JSON.stringify({ matris: m.matris && { ruta: m.matris.ruta, figur: m.matris.figur, andel: m.matris.andel }, alt: m.alternativ && { kort: m.alternativ.kort, figur: m.alternativ.figur, iBredd: m.alternativ.iBredd } }), fel.length ? 'FEL: ' + fel.join('; ') : 'ok')
  return rad
}

async function element(page, text) {
  // RegExp går inte över gränsen till sidan; skicka källan och flaggorna.
  const t = text instanceof RegExp ? { re: text.source, f: text.flags } : { s: text }
  const h = await page.evaluateHandle(
    (t) => {
      const passar = (x) => (t.re ? new RegExp(t.re, t.f).test(x) : x.startsWith(t.s))
      return [...document.querySelectorAll('button, a')].find((b) => passar(b.textContent.trim()) && b.getBoundingClientRect().width > 0) ?? null
    },
    t
  )
  return h.asElement()
}

async function tryck(page, el, form) {
  await el.evaluate((e) => e.scrollIntoView({ block: 'center' }))
  await vanta(150)
  const box = await el.boundingBox()
  if (!box) throw new Error('ingen ruta att trycka på')
  if (form === 'desktop') await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  else await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
}

async function trycktext(page, text, form, ms = 20000) {
  const slut = Date.now() + ms
  for (;;) {
    const el = await element(page, text)
    if (el) return tryck(page, el, form)
    if (Date.now() > slut) throw new Error(`hittade inte "${text}"`)
    await vanta(250)
  }
}

const synligaAlternativ = (page) =>
  page.$$eval('[role=radiogroup] button[role=radio]', (b) => b.filter((e) => e.getBoundingClientRect().width > 0 && !e.disabled).length)

async function korning(browser, form, system) {
  const pre = `${form}-${system === 'dark' ? 'morkt' : 'ljust'}`
  const k = await skapaKonto(pre)
  const { page, logg } = await nySida(browser, { form, system, email: k.email })
  try {
    // 1. Nivåkollen: första frågan, ett val, och resten till resultatet.
    await page.goto(`${BAS}/dashboard/tester/pass?typ=matning`, { waitUntil: 'networkidle2', timeout: 120000 })
    await page.waitForSelector('[data-pass-shell] [role=radiogroup] button[role=radio]:not([disabled])', { timeout: 60000 })
    await vy(page, `${pre}-01-nivakollen-fraga`)
    for (let i = 0; i < 40; i++) {
      if (await page.$('[data-resultat]')) break
      const knappar = await page.$$('[data-pass-shell] [role=radiogroup] button[role=radio]:not([disabled])')
      if (!knappar.length) {
        await vanta(300)
        continue
      }
      await tryck(page, knappar[i % 3], form)
      if (i === 0) {
        await vanta(250)
        await vy(page, `${pre}-02-nivakollen-efter-val`)
      }
      await vanta(500)
    }
    await page.waitForSelector('[data-resultat]', { timeout: 60000 })
    await vanta(1500)
    // Nivåkollen har ingen genomgång; passets genomgång ritas av samma PassFraga som 05.
    await vy(page, `${pre}-03-nivakollen-resultat`)

    // 2. Dagens pass med regelpanelen (rätt svar i luckan i koppar-bläck).
    await page.goto(`${BAS}/dashboard/tester/pass?typ=pass`, { waitUntil: 'networkidle2', timeout: 120000 })
    await page.waitForSelector('[data-pass-shell] [role=radiogroup] button[role=radio]:not([disabled])', { timeout: 60000 })
    await vy(page, `${pre}-04-pass-fore-svar`)
    const alt = await page.$$('[data-pass-shell] [role=radiogroup] button[role=radio]')
    await tryck(page, alt[4], form)
    await page.waitForSelector('[data-regelpanel]', { timeout: 20000 }).catch(() => resultat.fel.push(`${pre}: ingen regelpanel efter svaret`))
    await vanta(700)
    await page.evaluate(() => document.querySelector('[data-matris]')?.scrollIntoView({ block: 'start' }))
    await vanta(300)
    await vy(page, `${pre}-05-pass-regelpanel`)
    const lucka = await page.evaluate(() => {
      const l = document.querySelector('[data-lucka="fylld"] .ratt-fylld svg *[stroke], [data-lucka="fylld"] .ratt-fylld svg *[fill]')
      return l ? getComputedStyle(l).stroke + ' ' + getComputedStyle(l).fill : null
    })
    resultat.vyer.push({ namn: `${pre}-05-luckans-farg`, lucka })
    if (!lucka) resultat.fel.push(`${pre}: rätt figur i luckan saknas efter svaret`)
    await page.screenshot({ path: path.join(UT, `${pre}-06-pass-regelpanel-hel.png`), fullPage: true })

    // 3. Logikens klassiska test: fråga, val, alla svar, resultat och genomgång.
    await page.goto(`${BAS}/dashboard/tester/matrislogik-grund`, { waitUntil: 'networkidle2', timeout: 120000 })
    await trycktext(page, /^(Starta testet|Gör om testet)$/, form, 45000)
    await page.waitForFunction(() => /\/test\/[0-9a-f-]{36}$/.test(location.pathname), { timeout: 120000 })
    await page.waitForSelector('button[aria-label^="Svarsalternativ"]:not([disabled])', { timeout: 60000 })
    await vanta(800)
    await vy(page, `${pre}-07-klassiskt-fraga`)
    for (let i = 0; i < 30; i++) {
      const n = await synligaAlternativ(page)
      if (!n) break
      const fore = await page.evaluate(() => (document.body.innerText.match(/Fråga (\d+)/) || [])[1])
      const svar = page.waitForResponse((r) => /\/answer$/.test(new URL(r.url()).pathname) && r.request().method() === 'POST', { timeout: 30000 }).catch(() => null)
      const knappar = await page.$$('[role=radiogroup] button[role=radio]:not([disabled])')
      await tryck(page, knappar[(i * 2) % 6], form)
      await svar
      if (i === 0) {
        await vanta(150)
        await vy(page, `${pre}-08-klassiskt-valt`)
      }
      await vanta(800)
      const efter = await page.evaluate(() => (document.body.innerText.match(/Fråga (\d+)/) || [])[1])
      if (fore === efter) break
    }
    await trycktext(page, /^Lämna in$/, form)
    await vanta(600)
    await trycktext(page, /Avsluta och se resultat/, form)
    await page.waitForFunction(() => location.pathname.endsWith('/results'), { timeout: 120000 })
    await page.waitForFunction(() => /genomgång/i.test(document.body.innerText), { timeout: 120000 })
    await vanta(1200)
    await vy(page, `${pre}-09-klassiskt-resultat`)
    // Genomgångens kort med MatrisMiniatyr, sedan den första frågan i genomgången.
    const kort = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find((b) => /^Fråga [0-9]+/.test(b.textContent.trim()) && b.querySelector('svg')) ?? null)
    if (kort.asElement()) {
      await kort.asElement().evaluate((e) => e.scrollIntoView({ block: 'center' }))
      await vanta(400)
      await vy(page, `${pre}-10-klassiskt-genomgang-kort`)
      await tryck(page, kort.asElement(), form)
      await vanta(1500)
      await vy(page, `${pre}-11-klassiskt-genomgang-fraga`)
    } else resultat.fel.push(`${pre}: genomgångens kort saknas`)
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
    for (const form of FORM_LISTA) for (const system of TEMAN) await korning(browser, form, system)
  } catch (e) {
    resultat.fel.push('avbrott: ' + String(e?.message ?? e))
  } finally {
    await browser.close()
  }
  fs.writeFileSync(path.join(UT, 'resultat.json'), JSON.stringify(resultat, null, 2))
  console.log(resultat.fel.length ? 'FEL:\n' + resultat.fel.join('\n') : 'inga fel')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
