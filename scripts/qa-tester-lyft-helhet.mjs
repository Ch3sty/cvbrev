// scripts/qa-tester-lyft-helhet.mjs
// Klicktest av hela tester-lyftet i riktig Chrome mot ett produktionsbygge:
// Alla tester, fliken Din utveckling, en testsida, ett logiktest gjort klart,
// resultatsidan, Se genomgången och tillbaka till Alla tester, där resultatet
// ska synas i nivåsegmentet och i Din utveckling.
//
//   node scripts/qa-tester-lyft-helhet.mjs --port 5262
//   node scripts/qa-tester-lyft-helhet.mjs --knappar --port 5262  # knappkontrollen på 360 med kontona
//   node scripts/qa-tester-lyft-helhet.mjs --meny --port 5262     # kontomenyn och notiserna överst
//   node scripts/qa-tester-lyft-helhet.mjs --radera
//
// Tre roller (feedback_riktig_webblasartest): ny (inget gjort), nagra (några
// gjorda test på gratisnivån) och premium (Hela paketet via premium_grants).
// Ett eget konto per roll och form (360, 412, 1280), eftersom flödet gör ett
// test och kontot då inte längre är nytt. Varje steg fotograferas i ljust och
// mörkt. På datorn prövas "Dölj hjälpen": valet ska stå kvar efter en
// omladdning med tömd localStorage, alltså läsas ur profiles.hjalp_dold.
//
// Testansvarigs klickflöden (beslut 2026-10-11): statusraden efter testet
// läses av, gratiskontot öppnar testsidan igen samma dag (betalväggen ska stå
// före klicket), och premiumkontot på datorn får en session med 14 av 15
// insatt med id för att läsa statusraden "Nästa nivå väntar i Alla tester".
//
// Kontona qa-lyft-helhet-<roll>-<form>-<tid>@jobbcoach-qa.test raderas med
// id (feedback_testdata_stadning): varje tabell med user_id räknas före
// delete, rapporten skrivs till docs/qa/tester-lyft/helhet/radering.json.

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
const PORT = arg('port', '5262')
const BAS = `http://localhost:${PORT}`
const UT = path.resolve('docs/qa/tester-lyft/helhet')
const SCRATCH = process.env.QA_SCRATCH ?? os.tmpdir()
const KONTOFIL = path.join(SCRATCH, 'qa-lyft-helhet-konton.json')
fs.mkdirSync(UT, { recursive: true })

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))
const MOBIL_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36'
const FORMER = {
  m360: { viewport: { width: 360, height: 740 - 56, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, userAgent: MOBIL_UA },
  pixel7: { viewport: { width: 412, height: 915 - 56, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, userAgent: MOBIL_UA },
  desktop: { viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } },
}
const ROLLER = (arg('roller', 'ny,nagra,premium')).split(',')
const FORM_LISTA = (arg('former', 'm360,pixel7,desktop')).split(',')
const BRUS = [/googletagmanager/i, /posthog/i, /GTM\]/, /favicon/i, /net::ERR_ABORTED/i, /Failed to load resource.*(gtm|posthog|google)/i, /Download the React DevTools/i]
const vanta = (ms) => new Promise((r) => setTimeout(r, ms))

const lasKonton = () => (fs.existsSync(KONTOFIL) ? JSON.parse(fs.readFileSync(KONTOFIL, 'utf8')) : {})
const sparaKonton = (k) => fs.writeFileSync(KONTOFIL, JSON.stringify(k, null, 2))

async function session(userId, testType, score, dagarSedan) {
  const t = new Date(Date.now() - dagarSedan * 86400000)
  const { error } = await sb.from('logic_test_v4_sessions').insert({
    user_id: userId,
    test_type: testType,
    answers: [],
    score,
    time_spent: 600,
    started_at: new Date(t.getTime() - 600000).toISOString(),
    created_at: new Date(t.getTime() - 600000).toISOString(),
    completed_at: t.toISOString(),
  })
  if (error) throw new Error(`session ${testType}: ${error.message}`)
}

async function skapa(roll, form) {
  const alla = lasKonton()
  const nyckel = `${roll}-${form}`
  if (alla[nyckel]) return alla[nyckel]
  const ts = Date.now()
  const email = `qa-lyft-helhet-${roll}-${form}-${ts}@jobbcoach-qa.test`
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: `QaLyftHelhet!${ts}`,
    email_confirm: true,
    user_metadata: { full_name: 'Anna Andersson', password_set: true },
  })
  if (error) throw new Error(error.message)
  const k = { email, userId: data.user.id }
  alla[nyckel] = k
  sparaKonton(alla)
  await vanta(600)
  const profil = { id: k.userId, email, full_name: 'Anna Andersson', email_verified_at: new Date().toISOString(), onboarding_track: 'tester' }
  if (roll !== 'ny') profil.traning_sedd_at = new Date(Date.now() - 3 * 86400000).toISOString()
  const { error: pErr } = await sb.from('profiles').upsert(profil)
  if (pErr) throw new Error('profil: ' + pErr.message)
  if (roll === 'nagra') {
    await session(k.userId, 'matrislogik', 11, 3)
    await session(k.userId, 'verbal-resonemang', 30, 1)
  }
  if (roll === 'premium') {
    const om7 = new Date(Date.now() + 7 * 86400000).toISOString()
    const { data: grant, error: gErr } = await sb
      .from('premium_grants')
      .insert({ user_id: k.userId, days: 7, source: 'qa-lyft-helhet', scope: 'allt', premium_until_after: om7 })
      .select('id')
      .single()
    if (gErr) throw new Error('grant: ' + gErr.message)
    k.grantId = grant.id
    await session(k.userId, 'matrislogik', 12, 5)
    await session(k.userId, 'matrislogik-avancerad', 12, 3)
    await session(k.userId, 'numerical-reasoning', 20, 1)
  }
  sparaKonton(alla)
  console.log('skapade', nyckel, email, k.userId)
  return k
}

/** Alla tabeller med kolumnen user_id, ur PostgREST:s beskrivning. */
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
  const tabeller = await tabellerMedUserId()
  const rapport = { tid: new Date().toISOString(), konton: [] }
  for (const [nyckel, k] of Object.entries(alla)) {
    if (!/^qa-lyft-helhet-.*@jobbcoach-qa\.test$/.test(k.email)) throw new Error('inte ett eget QA-konto: ' + k.email)
    const rader = {}
    for (const t of tabeller) {
      const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true }).eq('user_id', k.userId)
      if (error || !count) continue
      const { error: dErr } = await sb.from(t).delete().eq('user_id', k.userId)
      // Vyer (user_dashboard_rewards) räknas men raderas genom sina tabeller.
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
  const { data: s, error } = await createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } }).auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token })
  if (error || !s?.session) throw new Error('session: ' + error?.message)
  return 'base64-' + Buffer.from(JSON.stringify({ access_token: s.session.access_token, refresh_token: s.session.refresh_token, expires_at: s.session.expires_at, expires_in: s.session.expires_in, token_type: 'bearer', user: s.session.user })).toString('base64')
}

async function nySida(browser, form, email) {
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  if (FORMER[form].userAgent) await page.emulate(FORMER[form])
  else await page.setViewport(FORMER[form].viewport)
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }])
  const p = await payloadFor(email)
  const CHUNK = 3200
  if (p.length <= CHUNK) await page.setCookie({ name: COOKIE, value: p, url: BAS, path: '/' })
  else for (let i = 0, n = 0; i < p.length; i += CHUNK, n++) await page.setCookie({ name: `${COOKIE}.${n}`, value: p.slice(i, i + CHUNK), url: BAS, path: '/' })
  await page.setCookie({ name: 'cvBrevCookieConsent', value: 'false', url: BAS, path: '/' })
  // hjalp_dold töms vid varje laddning: valet måste komma ur profilen.
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('password_prompt_dismissed', 'true')
      localStorage.setItem('jc_email_banner_dismissed_at', String(Date.now()))
      localStorage.setItem('pwa_install_dismissed_at', String(Date.now()))
      localStorage.removeItem('tema')
      localStorage.removeItem('hjalp_dold')
    } catch {}
  })
  const logg = { konsol: [], http: [] }
  page.on('console', (m) => {
    if (m.type() === 'error' && !BRUS.some((r) => r.test(m.text()))) logg.konsol.push(`${new URL(page.url()).pathname}: ${m.text().slice(0, 300)}`)
  })
  page.on('pageerror', (e) => logg.konsol.push('pageerror: ' + String(e.message).slice(0, 300)))
  page.on('response', (r) => {
    const u = r.url()
    if (r.status() >= 400 && u.startsWith(BAS) && !BRUS.some((x) => x.test(u))) logg.http.push(`${r.status()} ${r.request().method()} ${u.replace(BAS, '')}`)
  })
  return { page, ctx, logg }
}

async function ga(page, url, vantaPa) {
  await page.goto(BAS + url, { waitUntil: 'networkidle0', timeout: 120000 })
  if (vantaPa) await page.waitForSelector(vantaPa, { timeout: 60000 })
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})
  await vanta(1200)
}

/** Mått som gäller varje steg. */
async function matt(page) {
  return page.evaluate(() => {
    const main = document.querySelector('main') ?? document.body
    const text = main.innerText
    const bnav = [...document.querySelectorAll('nav')].find((n) => getComputedStyle(n).position === 'fixed' && n.getBoundingClientRect().bottom >= innerHeight - 2 && n.getBoundingClientRect().top > innerHeight / 2)
    const golv = bnav ? bnav.getBoundingClientRect().top : innerHeight
    const knappar = [...document.querySelectorAll('a.knapp-primar, button.knapp-primar')].filter((b) => b.offsetParent && b.getBoundingClientRect().width > 0)
    const k = knappar[0]
    const kr = k?.getBoundingClientRect()
    const mitt = text.split('\n').filter((r) => /\d[^\n]*·[^\n]*\d/.test(r))
    return {
      horisontellScroll: document.documentElement.scrollWidth > innerWidth + 1,
      koppar: k ? k.innerText.trim().slice(0, 40) : null,
      kopparIBild: kr ? kr.top >= 0 && kr.bottom <= golv : null,
      mittpunktsrader: mitt.slice(0, 3),
    }
  })
}

/** Helsidesbild i ljust och mörkt. */
async function bild(page, namn) {
  const vp = page.viewport()
  for (const tema of ['light', 'dark']) {
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: tema }])
    await vanta(350)
    const hojd = await page.evaluate(() => {
      const m = document.querySelector('.dashboard-main-content')
      return m ? m.scrollHeight + (innerHeight - m.clientHeight) : document.documentElement.scrollHeight
    })
    await page.setViewport({ ...vp, height: Math.min(Math.max(hojd, vp.height), 7000) })
    await vanta(300)
    await page.screenshot({ path: path.join(UT, `${namn}-${tema === 'light' ? 'ljust' : 'morkt'}.png`) })
    await page.setViewport(vp)
  }
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }])
  await vanta(200)
}

async function klickaText(page, sel, re) {
  return page.evaluate(
    (sel, src) => {
      const r = new RegExp(src)
      const el = [...document.querySelectorAll(sel)].find((e) => e.offsetParent && r.test(e.innerText.trim()))
      if (!el) return false
      el.scrollIntoView({ block: 'center' })
      el.click()
      return true
    },
    sel,
    re.source
  )
}

async function segmentLogik(page) {
  return page.evaluate(() => {
    const kort = document.querySelector('[data-testkort="logik"]')
    const seg = kort ? [...kort.querySelectorAll('[data-niva]')] : []
    return seg.map((s) => s.dataset.niva).join(',')
  })
}

async function flode(browser, roll, form) {
  const k = await skapa(roll, form)
  const { page, ctx, logg } = await nySida(browser, form, k.email)
  const pre = `${roll}-${form}`
  const steg = []
  const notera = async (namn, extra = {}) => {
    const m = await matt(page)
    await bild(page, `${pre}-${namn}`)
    const rad = { steg: namn, ...m, ...extra }
    steg.push(rad)
    console.log(pre, JSON.stringify(rad))
  }
  try {
    // 1 Alla tester
    await ga(page, '/dashboard/tester/alla', '[data-testkort="logik"]')
    await notera('01-alla-tester', { segmentFore: await segmentLogik(page) })

    // 2 Din utveckling, fliken
    await klickaText(page, 'button, [role="tab"], [role="radio"]', /^Din utveckling/)
    await page.waitForSelector('[data-utv-lage]', { timeout: 60000 })
    await vanta(800)
    await notera('02-din-utveckling', { utvLage: await page.$eval('[data-utv-lage]', (e) => e.dataset.utvLage) })

    // 2b ?flik=utveckling öppnar fliken direkt
    await ga(page, '/dashboard/tester/alla?flik=utveckling', '[data-utv-lage]')
    steg.push({ steg: '02b-flik-direkt', ok: true })

    // 3 Testsidan via logikkortet
    await ga(page, '/dashboard/tester/alla', '[data-testkort="logik"]')
    const lank = await page.evaluate(() => {
      const a = document.querySelector('[data-testkort="logik"] a[href="/dashboard/tester/matrislogik-grund"]') ?? document.querySelector('a[href="/dashboard/tester/matrislogik-grund"]')
      if (!a) return null
      a.scrollIntoView({ block: 'center' })
      a.click()
      return a.getAttribute('href')
    })
    if (lank) await page.waitForFunction(() => location.pathname === '/dashboard/tester/matrislogik-grund', { timeout: 60000 })
    else await ga(page, '/dashboard/tester/matrislogik-grund')
    await page.waitForSelector('button.knapp-primar', { timeout: 60000 })
    await vanta(1200)
    await notera('03-testsida', { viaLank: !!lank })

    // 4 Starta testet
    await klickaText(page, 'button.knapp-primar', /Starta testet|Gör om testet|Starta/)
    await page.waitForFunction(() => /\/test\/[0-9a-f-]{36}$/.test(location.pathname), { timeout: 120000 })
    await page.waitForSelector('button[aria-label^="Svarsalternativ"]', { timeout: 60000 })
    await vanta(800)
    await notera('04-testet')
    for (let i = 0; i < 15; i++) {
      const svar = page
        .waitForResponse((r) => /\/answer$/.test(new URL(r.url()).pathname) && r.request().method() === 'POST', { timeout: 30000 })
        .then((r) => r.status())
        .catch(() => 'timeout')
      const bokstav = 'ABCDEF'[Math.floor(Math.random() * 6)]
      await page.evaluate((l) => {
        const kn = [...document.querySelectorAll('button[aria-label^="Svarsalternativ"]')].filter((e) => e.offsetParent !== null)
        const b = kn.find((e) => e.getAttribute('aria-label') === `Svarsalternativ ${l}`) ?? kn[0]
        b.scrollIntoView({ block: 'center' })
        b.click()
      }, bokstav)
      const st = await svar
      if (st !== 200) console.log(pre, 'svar', i + 1, st)
      await vanta(700 + Math.floor(Math.random() * 900))
    }
    await klickaText(page, 'button', /^Lämna in$/)
    await vanta(800)
    await klickaText(page, 'button', /Avsluta och se resultat/)
    await page.waitForFunction(() => location.pathname.endsWith('/results'), { timeout: 120000 })
    await page.waitForSelector('[data-resultat]', { timeout: 60000 })
    await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})
    await vanta(1500)

    // 5 Resultatsidan
    const statusrad = await page.evaluate(() => {
      const s = [...document.querySelectorAll('[data-resultat] .steg.s4')].find((e) => /^Resultatet syns/.test(e.innerText.trim()))
      return s ? s.innerText.replace(/\s+/g, ' ').trim() : null
    })
    const ring = await page.evaluate(() => {
      const c = document.querySelector('.dagsring .fyll')
      return c ? { aria: c.closest('svg')?.getAttribute('aria-label'), offset: getComputedStyle(c).strokeDashoffset } : null
    })
    await notera('05-resultat', { statusrad, ring })

    // 6 Se genomgången
    const gen = await page.evaluate(() => {
      const b = document.querySelector('[data-resultat] section[aria-label="Genomgång"] button.knapp-primar, [data-resultat] section[aria-label="Genomgång"] a.knapp-primar')
      if (!b) return null
      b.click()
      return b.innerText.trim()
    })
    if (gen) {
      await page.waitForSelector('#genomgang', { timeout: 30000 })
      await vanta(1200)
      await page.evaluate(() => document.querySelector('#genomgang')?.scrollIntoView({ block: 'start' }))
    }
    await notera('06-genomgang', { genomgangKnapp: gen, genomgangRader: await page.evaluate(() => document.querySelectorAll('#genomgang li').length) })

    // 7 Tillbaka till Alla tester: logikens segment ska vara gjort
    await ga(page, '/dashboard/tester/alla', '[data-testkort="logik"]')
    const segmentEfter = await segmentLogik(page)
    await notera('07-alla-efter', { segmentEfter, logikGjord: segmentEfter.split(',')[0] === 'gjord' })

    // 8 Din utveckling efter testet
    await klickaText(page, 'button, [role="tab"], [role="radio"]', /^Din utveckling/)
    await page.waitForSelector('[data-utv-lage]', { timeout: 60000 })
    await vanta(800)
    const utv = await page.evaluate(() => ({
      lage: document.querySelector('[data-utv-lage]')?.dataset.utvLage,
      text: (document.querySelector('main')?.innerText ?? '').slice(0, 4000),
    }))
    await notera('08-utveckling-efter', { utvLage: utv.lage, logikSyns: /Logik|Matris/i.test(utv.text) })

    // 8b Gratiskontot: samma test igen samma dag ger betalväggen före klicket
    if (roll !== 'premium') {
      await ga(page, '/dashboard/tester/matrislogik-grund', 'main')
      await vanta(800)
      const kvot = await page.evaluate(() => ({
        startknapp: [...document.querySelectorAll('button.knapp-primar')].some((b) => /Gör om testet|Starta testet/.test(b.innerText)),
        betalvagg: /i morgon|Premium|ingår/i.test(document.querySelector('main')?.innerText ?? ''),
      }))
      await notera('08b-testsida-kvot-anvand', { kvot })
    }

    // 9 Dölj hjälpen (bara på datorn): sparas och överlever omladdning
    if (form === 'desktop') {
      await ga(page, '/dashboard/tester/alla', '[data-testkort="logik"]')
      await page.evaluate(() => document.querySelectorAll('aside details').forEach((d) => (d.open = true)))
      await vanta(300)
      const spar = page
        .waitForResponse((r) => r.url().includes('/api/profile/hjalp'), { timeout: 15000 })
        .then((r) => r.status())
        .catch(() => 'inget anrop')
      const klickad = await klickaText(page, 'button, a', /^Dölj hjälpen$/)
      const status = klickad ? await spar : 'ingen knapp'
      await vanta(800)
      const { data: prof } = await sb.from('profiles').select('hjalp_dold').eq('id', k.userId).maybeSingle()
      await ga(page, '/dashboard/tester/alla', '[data-testkort="logik"]')
      const kvar = await page.evaluate(() => ({
        panel: !!document.querySelector('aside[aria-label="Hjälp"]'),
        doljKnapp: [...document.querySelectorAll('button, a')].some((b) => b.offsetParent && /^Dölj hjälpen$/.test(b.innerText.trim())),
        ls: localStorage.getItem('hjalp_dold'),
      }))
      await notera('09-hjalpen-dold-efter-omladdning', { doljKlickad: klickad, sparStatus: status, dbHjalpDold: prof?.hjalp_dold ?? null, efterOmladdning: kvar })
    }
    // 10 Premium på datorn: 14 av 15 på grund ger "Nästa nivå väntar i Alla tester"
    if (roll === 'premium' && form === 'desktop') {
      const nu = new Date()
      const { data: rad, error } = await sb
        .from('logic_test_v4_sessions')
        .insert({
          user_id: k.userId,
          test_type: 'matrislogik',
          answers: [],
          score: 14,
          time_spent: 700,
          started_at: new Date(nu.getTime() - 700000).toISOString(),
          created_at: new Date(nu.getTime() - 700000).toISOString(),
          completed_at: nu.toISOString(),
        })
        .select('id')
        .single()
      if (error) throw new Error('14 av 15: ' + error.message)
      await ga(page, `/dashboard/tester/matrislogik-grund/test/${rad.id}/results`, '[data-resultat]')
      const statusrad = await page.evaluate(() => {
        const s = [...document.querySelectorAll('[data-resultat] .steg.s4')].find((e) => /^Resultatet syns/.test(e.innerText.trim()))
        return s ? s.innerText.replace(/\s+/g, ' ').trim() : null
      })
      await notera('10-premium-14-av-15', { statusrad })
    }
  } catch (e) {
    steg.push({ steg: 'FEL', fel: String(e).slice(0, 400), url: page.url() })
    console.log(pre, 'FEL', String(e))
    await page.screenshot({ path: path.join(UT, `${pre}-FEL.png`) }).catch(() => {})
  }
  await ctx.close()
  return { konto: pre, steg, konsol: logg.konsol, http: logg.http }
}

/** Knappkontrollen på 360 px (qa-rummen-knappar-360) på lyftets sidor, med kontona från körningen. */
async function knappar() {
  const { kontrolleraKnappar } = await import('./qa-rummen-knappar-360.mjs')
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
  const ut = []
  try {
    for (const [nyckel, k] of Object.entries(lasKonton())) {
      const { page, ctx } = await nySida(browser, 'm360', k.email)
      const { data: sess } = await sb
        .from('logic_test_v4_sessions')
        .select('id')
        .eq('user_id', k.userId)
        .eq('test_type', 'matrislogik')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(1)
      const rutter = ['/dashboard/tester/alla', '/dashboard/tester/alla?flik=utveckling', '/dashboard/tester/matrislogik-grund', '/dashboard/tester/verbal-resonemang']
      if (sess?.[0]) rutter.push(`/dashboard/tester/matrislogik-grund/test/${sess[0].id}/results`)
      for (const r of rutter) {
        await ga(page, r, 'main')
        const res = await kontrolleraKnappar(page)
        ut.push({ konto: nyckel, rutt: r, ...res })
        console.log(nyckel, r, JSON.stringify(res).slice(0, 300))
      }
      await ctx.close()
    }
  } finally {
    await browser.close()
    fs.writeFileSync(path.join(UT, 'knappar-360.json'), JSON.stringify(ut, null, 2))
  }
}

/**
 * Kontomenyn och notismenyn ska ligga överst, ovanför väggens lyfta kort
 * (ägarens grind 2026-10-11). Ett konto med ett gjort test och en oläst
 * notis; menyn öppnas på varje sida och elementFromPoint över hela menyns
 * yta ska träffa menyn själv.
 */
async function meny() {
  const k = await skapa('meny', 'alla')
  const { data: sess } = await sb
    .from('logic_test_v4_sessions')
    .insert({ user_id: k.userId, test_type: 'matrislogik', answers: [], score: 9, time_spent: 600, completed_at: new Date().toISOString() })
    .select('id')
    .single()
  const { error: nErr } = await sb
    .from('notifications')
    .insert({ user_id: k.userId, type: 'qa', title: 'QA-notis', message: 'Kontroll av menyns stapling.', read: false })
  if (nErr) console.log('notis ej skapad:', nErr.message)
  const sidor = [
    ['alla', '/dashboard/tester/alla'],
    ['utveckling', '/dashboard/tester/alla?flik=utveckling'],
    ['testsida', '/dashboard/tester/matrislogik-grund'],
    ['resultat', `/dashboard/tester/matrislogik-grund/test/${sess.id}/results`],
    ['hemvy', '/dashboard/tester'],
    ['brev', '/dashboard/mina-brev'],
    ['cv', '/dashboard/profil/cv'],
  ]
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
  const ut = []
  try {
    for (const form of ['m360', 'desktop']) {
      const { page, ctx, logg } = await nySida(browser, form, k.email)
      for (const [namn, url] of sidor) {
        await ga(page, url, '[data-topprad]')
        for (const [vad, knapp, panel] of [
          ['konto', '[data-topprad] button[aria-haspopup="menu"]', '[data-topprad] [role="menu"]'],
          ['notiser', '[data-topprad] button[aria-label^="Notiser"]', '[data-topprad] button[aria-label^="Notiser"] + div'],
        ]) {
          const finns = await page.$(knapp)
          if (!finns) {
            ut.push({ form, sida: namn, meny: vad, saknas: true })
            continue
          }
          await page.evaluate((s) => document.querySelector(s).click(), knapp)
          await vanta(500)
          const r = await page.evaluate((s) => {
            const m = document.querySelector(s)
            if (!m) return { oppen: false }
            const b = m.getBoundingClientRect()
            let traff = 0
            let totalt = 0
            const missar = []
            for (let fx = 0.1; fx < 1; fx += 0.2) {
              for (let fy = 0.1; fy < 1; fy += 0.2) {
                const x = b.left + b.width * fx
                const y = b.top + b.height * fy
                if (y > innerHeight || x > innerWidth) continue
                totalt++
                const el = document.elementFromPoint(x, y)
                if (el && m.contains(el)) traff++
                else if (el) missar.push((el.closest('section,[data-lyft],[data-testkort]')?.getAttribute('aria-label') ?? el.tagName).slice(0, 40))
              }
            }
            return { oppen: true, traff, totalt, missar: [...new Set(missar)] }
          }, panel)
          const rad = { form, sida: namn, meny: vad, ...r, overst: r.oppen && r.traff === r.totalt }
          ut.push(rad)
          console.log(JSON.stringify(rad))
          await page.screenshot({ path: path.join(UT, `meny-${form}-${namn}-${vad}.png`) })
          await page.keyboard.press('Escape')
          await page.evaluate((s) => {
            const m = document.querySelector(s)
            if (m) document.querySelector('main')?.click()
          }, panel)
          await vanta(300)
        }
      }
      ut.push({ form, konsol: logg.konsol, http: logg.http })
      await ctx.close()
    }
  } finally {
    await browser.close()
    fs.writeFileSync(path.join(UT, 'meny.json'), JSON.stringify(ut, null, 2))
  }
}

async function main() {
  if (process.argv.includes('--radera')) return radera()
  if (process.argv.includes('--meny')) return meny()
  if (process.argv.includes('--knappar')) return knappar()
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
  const ut = []
  try {
    for (const roll of ROLLER) for (const form of FORM_LISTA) ut.push(await flode(browser, roll, form))
  } finally {
    await browser.close()
    fs.writeFileSync(path.join(UT, 'resultat.json'), JSON.stringify(ut, null, 2))
  }
  for (const r of ut) console.log(r.konto, 'konsol', r.konsol.length, 'http', r.http.join(' | ') || 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
