// scripts/qa-efter-lyftet.mjs
// Klicktest i riktig Chrome av ägarens fel efter tester-lyftet (2026-10-11):
// en ny användare gör nivåmätningen, resultatvyn, "Starta dagens pass" ska
// starta passet, "Tillbaka till Rekryteringstester" mäts från klick till
// färdig vy, Tester-dörren från CV, Alla tester och hemvyn fram och tillbaka,
// och när gratiskvoten är använd ska betalväggens knapp synas utan scroll.
//
//   node scripts/qa-efter-lyftet.mjs --port 5371 [--former m360,desktop] [--system light,dark]
//   node scripts/qa-efter-lyftet.mjs --radera
//
// Två konton per form och tema: ett trycker "Starta dagens pass", det andra
// "Tillbaka till Rekryteringstester" (mätningen görs bara en gång per konto).
// Kontona qa-efter-lyftet-<ts>@jobbcoach-qa.test raderas med id, varje tabell
// med user_id räknas före delete (feedback_testdata_stadning).

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
const PORT = arg('port', '5371')
const BAS = arg('bas', `http://localhost:${PORT}`)
const UT = process.env.QA_UT ?? path.resolve('docs/qa/efter-lyftet')
const SCRATCH = process.env.QA_SCRATCH ?? os.tmpdir()
const KONTOFIL = path.join(SCRATCH, 'qa-efter-lyftet-konton.json')
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

const lasKonton = () => (fs.existsSync(KONTOFIL) ? JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) : {})
const sparaKonton = (k) => fs.writeFileSync(KONTOFIL, JSON.stringify(k, null, 2))

async function skapaKonto(nyckel, { premium = false } = {}) {
  const alla = lasKonton()
  const ts = Date.now()
  const email = `qa-efter-lyftet-${ts}@jobbcoach-qa.test`
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: `QaEfterLyftet!${ts}`,
    email_confirm: true,
    user_metadata: { full_name: 'Anna Andersson', password_set: true },
  })
  if (error) throw new Error(error.message)
  const k = { email, userId: data.user.id }
  nyckel = `${nyckel}-${ts}`
  alla[nyckel] = k
  sparaKonton(alla)
  await vanta(600)
  const { error: pErr } = await sb
    .from('profiles')
    .upsert({ id: k.userId, email, full_name: 'Anna Andersson', email_verified_at: new Date().toISOString(), onboarding_track: 'tester' })
  if (pErr) throw new Error('profil: ' + pErr.message)
  if (premium) {
    // Ägarens läge: Hela paketet, "Starta dagens pass" i resultatets fot.
    const om7 = new Date(Date.now() + 7 * 86400000).toISOString()
    const { data: g, error: gErr } = await sb
      .from('premium_grants')
      .insert({ user_id: k.userId, days: 7, source: 'qa-efter-lyftet', scope: 'allt', premium_until_after: om7 })
      .select('id')
      .single()
    if (gErr) throw new Error('grant: ' + gErr.message)
    k.grantId = g.id
    alla[nyckel] = k
    sparaKonton(alla)
  }
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

async function radera() {
  // Konton som skapats men saknas i filen (avbruten körning) hittas på adressen.
  const alla = lasKonton()
  for (let sida = 1; sida < 50; sida++) {
    const { data, error } = await sb.auth.admin.listUsers({ page: sida, perPage: 1000 })
    if (error || !data.users.length) break
    for (const u of data.users) {
      if (/^qa-efter-lyftet-\d+@jobbcoach-qa\.test$/.test(u.email ?? '') && !Object.values(alla).some((k) => k.userId === u.id)) alla[`hittad-${u.id}`] = { email: u.email, userId: u.id }
    }
  }
  const tabeller = await tabellerMedUserId()
  const rapport = { tid: new Date().toISOString(), konton: [] }
  for (const [nyckel, k] of Object.entries(alla)) {
    if (!/^qa-efter-lyftet-\d+@jobbcoach-qa\.test$/.test(k.email)) throw new Error('inte ett eget QA-konto: ' + k.email)
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
  // Mobilen: 4x CPU-strypning, som en mellanklassmobil.
  if (form !== 'desktop') {
    await page.emulateCPUThrottling(4)
    // Och ett mobilnät (samma som perf-navigering-tester.ts).
    const cdp = await page.createCDPSession()
    await cdp.send('Network.enable')
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 70, downloadThroughput: (12 * 1024 * 1024) / 8, uploadThroughput: (3 * 1024 * 1024) / 8 })
  }
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
  const logg = { konsol: [], http: [], dokument: 0 }
  page.on('console', (m) => {
    if (m.type() === 'error') {
      const t = m.text()
      if (!BRUS.some((r) => r.test(t))) logg.konsol.push(t.slice(0, 300))
    }
  })
  page.on('pageerror', (e) => logg.konsol.push('pageerror: ' + String(e.message).slice(0, 300)))
  page.on('response', (r) => {
    const u = r.url()
    if (r.request().resourceType() === 'document' && u.startsWith(BAS)) logg.dokument++
    if (r.status() >= 400 && u.startsWith(BAS) && !BRUS.some((x) => x.test(u))) logg.http.push(`${r.status()} ${r.request().method()} ${u.replace(BAS, '').slice(0, 160)}`)
  })
  return { page, logg }
}

async function dump(page, namn) {
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})
  const fil = path.join(UT, `${namn}.png`)
  await page.screenshot({ path: fil, fullPage: false })
  return path.relative(process.cwd(), fil).split(path.sep).join('/')
}

async function tryck(page, el, form) {
  // En text slås upp på nytt före trycket: resultatvyn ritar om sig medan den tonar in.
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

/** Första synliga länken till adressen. */
async function synligLank(page, href) {
  const h = await page.evaluateHandle(
    (u) => [...document.querySelectorAll(`a[href="${u}"]`)].find((a) => {
      const r = a.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && getComputedStyle(a).visibility !== 'hidden'
    }) ?? null,
    href
  )
  return h.asElement()
}

/** Klick till färdig vy: adressen matchar och väljaren syns. */
async function matNavigering(page, form, klickEl, { url, valjare }) {
  // RSC-anropen under navigeringen: hur länge servern tog.
  const starter = new Map()
  const rsc = []
  const paborjad = (r) => {
    if (r.headers()['rsc'] === '1') starter.set(r, Date.now())
  }
  const klar = (r) => {
    if (starter.has(r)) rsc.push({ url: r.url().replace(BAS, '').split('?')[0], ms: Date.now() - starter.get(r), prefetch: r.headers()['next-router-prefetch'] === '1' })
  }
  page.on('request', paborjad)
  page.on('requestfinished', klar)
  // Första synliga svaret på klicket: ny adress eller ett laddskelett.
  await page.evaluate(() => {
    const start = location.pathname + location.search
    const t0 = performance.now()
    window.__svar = null
    const koll = () => {
      if (location.pathname + location.search !== start || document.querySelector('main [aria-busy="true"]')) {
        window.__svar = performance.now() - t0
        return
      }
      if (performance.now() - t0 < 30000) requestAnimationFrame(koll)
    }
    requestAnimationFrame(koll)
  })
  const t0 = Date.now()
  await tryck(page, klickEl, form)
  await page.waitForFunction(
    (u, v) => (u.includes('?') ? location.pathname + location.search : location.pathname) === u && !!document.querySelector(v) && !document.querySelector('[aria-busy="true"]'),
    { timeout: 30000, polling: 30 },
    url,
    valjare
  )
  const ms = Date.now() - t0
  await vanta(300)
  page.off('request', paborjad)
  page.off('requestfinished', klar)
  const svar = await page.evaluate(() => (window.__svar == null ? null : Math.round(window.__svar)))
  navLogg.push({ till: url, ms, forstaSvar: svar, rsc })
  return ms
}
const navLogg = []

/** Gör nivåmätningen: från hemvyn via mätningslänken (klientnavigering). */
async function gorMatningen(page, form, { direkt = false } = {}) {
  // direkt: mätningen öppnas med en hård laddning, så att hemvyn inte ligger
  // förhämtad i routerns cache (som när mätningen tagit mer än fem minuter).
  if (direkt) await page.goto(`${BAS}/dashboard/tester/pass?typ=matning`, { waitUntil: 'networkidle2', timeout: 90000 })
  else await page.goto(`${BAS}/dashboard/tester`, { waitUntil: 'networkidle2', timeout: 90000 })
  const lank = direkt ? null : await page.$('a[href*="typ=matning"]')
  if (lank) await tryck(page, lank, form)
  else if (!direkt) await page.goto(`${BAS}/dashboard/tester/pass?typ=matning`, { waitUntil: 'networkidle2' })
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

/** Siktesetiketten och markören får inte överlappa. */
async function siktesKoll(page) {
  return page.evaluate(() => {
    const etikett = document.querySelector('[data-sikte-etikett]')
    const markor = document.querySelector('[data-sikte-markor]')
    if (!etikett || !markor) return { finns: false }
    const a = etikett.getBoundingClientRect()
    const b = markor.getBoundingClientRect()
    const overlapp = !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top)
    return { finns: true, overlapp, etikett: [Math.round(a.left), Math.round(a.top), Math.round(a.right), Math.round(a.bottom)], markor: [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)] }
  })
}

const resultat = { datum: new Date().toISOString(), bas: BAS, korningar: [], navigeringar: navLogg, fel: [] }

async function kor(browser, form, system) {
  const tema = system === 'dark' ? 'morkt' : 'ljust'
  const pre = `${form}-${tema}`
  const rad = { form, system, steg: {}, tider: {} }

  // Konto A: Starta dagens pass.
  const a = await skapaKonto(`${pre}-start`, { premium: true })
  {
    const { page, logg } = await nySida(browser, { form, system, email: a.email })
    await gorMatningen(page, form)
    rad.steg.resultat = await dump(page, `${pre}-01-matningens-resultat`)
    rad.sikte = await siktesKoll(page)
    if (rad.sikte.finns && rad.sikte.overlapp) resultat.fel.push(`${pre}: siktesetiketten överlappar markören ${JSON.stringify(rad.sikte)}`)
    const knapp = await element(page, 'Starta dagens pass')
    rad.traffYta = await knapp.evaluate((k) => {
      const r = k.getBoundingClientRect()
      const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return e === k || k.contains(e) ? 'knappen' : (e?.outerHTML ?? 'inget').slice(0, 200)
    })
    const rsc = []
    page.on('request', (r) => {
      if (r.url().startsWith(BAS) && (r.url().includes('_rsc=') || r.url().includes('/api/'))) rsc.push(r.method() + ' ' + r.url().replace(BAS, '').slice(0, 120))
    })
    rad.anrop = rsc
    const t0 = Date.now()
    await tryck(page, knapp, form)
    try {
      await page.waitForFunction(() => !document.querySelector('[data-resultat]') && !!document.querySelector('[data-pass-shell] [role=radiogroup], [data-pass-shell] section'), {
        timeout: 20000,
        polling: 50,
      })
      rad.tider.startaDagensPass = Date.now() - t0
      await vanta(800)
      rad.steg.passet = await dump(page, `${pre}-02-dagens-pass-startat`)
      rad.startUrl = await page.evaluate(() => location.pathname + location.search)
    } catch {
      rad.steg.passet = await dump(page, `${pre}-02-dagens-pass-INTE-startat`)
      resultat.fel.push(`${pre}: Starta dagens pass startade inget pass (${await page.evaluate(() => location.href)})`)
    }
    rad.konsolA = [...logg.konsol]
    rad.httpA = [...logg.http]
    await page.close()
  }

  // Konto B: Tillbaka till Rekryteringstester, sedan rummens dörrar och kvoten.
  const b = await skapaKonto(`${pre}-tillbaka`, { premium: true })
  {
    const { page, logg } = await nySida(browser, { form, system, email: b.email })
    await gorMatningen(page, form, { direkt: !process.argv.includes('--via-hem') })
    const dok0 = logg.dokument
    rad.tider.tillbakaFranResultat = await matNavigering(page, form, 'Tillbaka till Rekryteringstester', {
      url: '/dashboard/tester',
      valjare: 'main',
    })
    rad.tillbakaHardNavigering = logg.dokument > dok0
    // Hemvyn ska visa läget efter mätningen, inte en förhämtad bild från före.
    rad.hemvynInaktuell = await page.evaluate(() => !!document.querySelector('main a[href*="typ=matning"]'))
    if (rad.hemvynInaktuell) resultat.fel.push(`${pre}: hemvyn efter Tillbaka visar fortfarande mätningen som nästa steg`)
    await vanta(800)
    rad.steg.hemvyn = await dump(page, `${pre}-03-hemvyn-efter-tillbaka`)

    // Alla tester och tillbaka (två varv, andra varvet med förhämtat).
    for (const varv of [1, 2]) {
      const alla = await synligLank(page, '/dashboard/tester/alla')
      if (alla) {
        rad.tider[`hemTillAlla${varv}`] = await matNavigering(page, form, alla, { url: '/dashboard/tester/alla', valjare: 'main' })
        await vanta(500)
        const hem = await synligLank(page, '/dashboard/tester')
        if (hem) rad.tider[`allaTillHem${varv}`] = await matNavigering(page, form, hem, { url: '/dashboard/tester', valjare: 'main' })
        await vanta(500)
      }
    }
    // Tester-dörren från CV-rummet.
    const cv = await synligLank(page, '/dashboard/profil/cv')
    if (cv) {
      await tryck(page, cv, form)
      await page.waitForFunction(() => location.pathname === '/dashboard/profil/cv', { timeout: 30000 })
      await vanta(1200)
      const dorr = await synligLank(page, '/dashboard/tester')
      if (dorr) rad.tider.cvTillTester = await matNavigering(page, form, dorr, { url: '/dashboard/tester', valjare: 'main' })
      // Dörrens förhämtning är från före mätningen; skalet hämtar om efter ett testflöde.
      await vanta(2500)
      rad.hemvynInaktuellViaDorr = await page.evaluate(() => !!document.querySelector('main a[href*="typ=matning"]'))
      if (rad.hemvynInaktuellViaDorr) resultat.fel.push(`${pre}: hemvyn via Tester-dörren visar fortfarande mätningen som nästa steg`)
      rad.steg.hemvynViaDorr = await dump(page, `${pre}-06-hemvyn-via-dorren`)
    }
    rad.dokumentladdningar = logg.dokument - dok0
    rad.konsolB = [...logg.konsol]
    rad.httpB = [...logg.http]
    await page.close()
  }

  // Konto C, gratis: gratiskvoten använd (ett logiktest i dag), testsidan igen.
  const c = await skapaKonto(`${pre}-kvot`)
  {
    const { page, logg } = await nySida(browser, { form, system, email: c.email })
    // Ett riktigt logiktest på grundnivån: dagens gratisomgång, och resultatsidan med statusraden.
    await page.goto(`${BAS}/dashboard/tester/matrislogik-grund`, { waitUntil: 'networkidle2', timeout: 90000 })
    await tryck(page, await element(page, 'Starta'), form)
    await page.waitForFunction(() => /\/test\/[0-9a-f-]{36}$/.test(location.pathname), { timeout: 120000 })
    await page.waitForSelector('button[aria-label^="Svarsalternativ"]', { timeout: 60000 })
    await vanta(800)
    for (let i = 0; i < 15; i++) {
      const svar = page
        .waitForResponse((r) => /\/answer$/.test(new URL(r.url()).pathname) && r.request().method() === 'POST', { timeout: 30000 })
        .catch(() => null)
      await page.evaluate((l) => {
        const kn = [...document.querySelectorAll('button[aria-label^="Svarsalternativ"]')].filter((e) => e.offsetParent !== null)
        const b = kn.find((e) => e.getAttribute('aria-label') === `Svarsalternativ ${l}`) ?? kn[0]
        b.scrollIntoView({ block: 'center' })
        b.click()
      }, 'ABCDEF'[i % 6])
      await svar
      await vanta(500)
    }
    await tryck(page, await element(page, 'Lämna in'), form)
    await vanta(800)
    await tryck(page, await element(page, 'Avsluta och se resultat'), form)
    await page.waitForFunction(() => location.pathname.endsWith('/results'), { timeout: 120000 })
    await page.waitForSelector('[data-resultat]', { timeout: 60000 })
    await vanta(2000)
    rad.statusrad = await page.evaluate(() => {
      const prick = document.querySelector('[data-resultat] .bg-koppar.rounded-full')
      const r = prick?.closest('div')?.getBoundingClientRect()
      const text = prick?.nextElementSibling
      const rader = text ? Math.round(text.getBoundingClientRect().height / parseFloat(getComputedStyle(text).lineHeight)) : null
      return r ? { bredd: Math.round(r.width), rader } : null
    })
    await page.evaluate(() => document.querySelector('[data-resultat] .bg-koppar.rounded-full')?.scrollIntoView({ block: 'center' }))
    await vanta(400)
    rad.steg.resultatsidan = await dump(page, `${pre}-05-testresultat-statusrad`)
    if (form === 'desktop' && rad.statusrad && rad.statusrad.rader > 2) resultat.fel.push(`${pre}: statusraden bryts på ${rad.statusrad.rader} rader`)

    // Kvoten är nu använd: testsidan igen.
    await page.goto(`${BAS}/dashboard/tester/matrislogik-grund`, { waitUntil: 'networkidle2', timeout: 90000 })
    await vanta(1200)
    rad.betalvagg = await page.evaluate(() => {
      const k = [...document.querySelectorAll('a, button')].find((e) => /^Köp Premium/.test(e.textContent.trim()) && e.getBoundingClientRect().width > 0)
      if (!k) return { finns: false }
      const r = k.getBoundingClientRect()
      // Synlig utan scroll: inom fönstret och inte under dörrarnas fasta rad.
      const mitt = document.elementFromPoint(r.left + r.width / 2, r.bottom - 4)
      const tackt = !(mitt === k || k.contains(mitt))
      return { finns: true, iBild: r.top >= 0 && r.bottom <= innerHeight && !tackt, bottom: Math.round(r.bottom), hojd: innerHeight }
    })
    rad.steg.betalvagg = await dump(page, `${pre}-04-testsida-kvot-anvand`)
    if (!rad.betalvagg.finns || !rad.betalvagg.iBild) resultat.fel.push(`${pre}: betalväggens knapp ${JSON.stringify(rad.betalvagg)}`)
    rad.konsolC = [...logg.konsol]
    rad.httpC = [...logg.http]
    await page.close()
  }
  resultat.korningar.push(rad)
  console.log(pre, JSON.stringify({ tider: rad.tider, sikte: rad.sikte, betalvagg: rad.betalvagg, hard: rad.tillbakaHardNavigering, startUrl: rad.startUrl }))
}

async function main() {
  if (process.argv.includes('--radera')) return radera()
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  try {
    for (const form of FORM_LISTA) for (const system of SYSTEM_LISTA) await kor(browser, form, system)
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
